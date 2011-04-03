/*
* Copyright 2010 Paul Kinlan.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.

*/

function EventProxy(method, context) {
  return function(e) { method.call(context, e) };
}

var Builder = new (function () {
  
  // The manifest that we are building.
  var manifest = {};
  // A collection of langauges and local information.
  var locales = {};
  
  this.start = function(fn) {
    var callback = fn || function() {};
    
    var url = document.getElementById("url");
    
    // Fetch Site information
    fetch(url.value, function(data) {
      if(data) {
       loadImage("128", data.image, function(data_uri) {
         data.image_uri = data_uri;
         callback(data);
       });
      }
      
    });
  };
  
  // Converts the locale to string.  Could be a seperate local object but no need for now.
  var localeToText = function(locale) {
    return JSON.stringify(locales[locale]);
  }
  
  var imageToBase64 = function(canvas) {
    var data = canvas.toDataURL();
    return data.replace("data:image/png;base64,","");
  };
  
  // Loads an image into the canvas
  var loadImage = function(icon,  url, callback) {
    var canvas = document.getElementById("c" + icon);
    var context = canvas.getContext("2d");
    var image = new Image();
    image.src = "/api/image?url=" + url; // Use the proxy so not tainted.
        
    image.addEventListener("load", function() {
      context.drawImage(image, 0, 0, icon, icon); // rescale the image
      callback(canvas.toDataURL());
    });
  };
  
  // Reads an image from the file system
  this.readImage = function(e) {
    var id = "c16";
    var size = 16;
    if(e.target.id == "file128") {
      id = "c128";
      size = 128;
    }
    
    var canvas = document.getElementById(id);
    var context = canvas.getContext("2d");
    
    for(var i = 0, file; file=e.target.files[i]; i++) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        var img = new Image();
        
        img.addEventListener("load", function() {
          context.drawImage(img, 0, 0, size, size); // rescale the image
        });
        
        img.src = evt.target.result;
        
      };
      reader.readAsDataURL(file)
    }
  };
  
  var fetch = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/fetch?url=" + url, true);
    request.onreadystatechange = function (e) {
      if(request.status == 200 && request.readyState == 4) {
        var object = JSON.parse(request.responseText);
        callback(object);
      }
      else if(request.status != 200) {
        callback(null);
      }
    };
    request.send();
  };
})();