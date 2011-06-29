(function() {
  var app_id = "{{url}}";
  var app_name = "{{app_name}}";
  var message = "{{message}}"; 
  var install_message = "{{install_message}}"; 
  var install_image = "{{install_image}}";
  var cancel_message = "{{cancel_message}}";
  var cancel_image = "{{cancel_image}}";
  var css_url = "{{css_url}}";
  var cookie_name = "_webstore__rTyf";
  var isInstalled = !!(window.chrome && window.chrome.app && window.chrome.app.isInstalled && !(window.location.host == "badgemator.appspot.com"));
  var isCancelled = !!(document.cookie.indexOf(cookie_name + "=true") >= 0);
  
  if(window.navigator.userAgent.indexOf("Chrome/") >= 0 && (!isInstalled && !isCancelled)) {
    var onloaded = function() {
      var container = document.createElement("span");
      container.className = "_webstore_badge";
      
      document.styleSheets[0].addRule("._webstore_badge", "opacity:0", 0);
      
      if(message) {
        var message_element = document.createElement("span");
        message_element.className = "_webstore_message";
        message_element.innerText = message;
        container.appendChild(message_element);
      }
      
      var link = document.createElement("a");
      link.href = app_id;
      link.target = "_blank";
      link.className = "_webstore_install";
      container.appendChild(link);
       
      if(install_message) {
        link.innerText = install_message;
        link.alt = "Installs " + app_name; 
      }
      else if(install_image) {
        var img = new Image();
        img.src = install_image;
        link.appendChild(img);
        link.alt = "Installs " + app_name; 
      }
      
      var close = document.createElement("a");
      close.className = "_webstore_cancel";
      close.href = "#";
      
      close.addEventListener("click", function(e) {
        // Set a cookie, that we will respect if the user cancels.
        container.style.display = "none";
        document.cookie = cookie_name + "=true";
        e.preventDefault();
        return false;
      });

      if(cancel_message) {
        close.innerText = cancel_message;
      }
      else if(cancel_image) {
        var img = new Image();
        img.src = cancel_image;
        
        img.alt = "Cancel Prompt"; 
        close.appendChild(img);
      }

      container.appendChild(close);
      
      if(css_url) {
        var css_link = document.createElement("link");
        css_link.rel = "stylesheet";
        css_link.title = "webstore_badge";
        css_link.href = css_url;
        document.head.appendChild(css_link);
      }

      document.body.appendChild(container);
    };
    
    if(document.readyState == "complete") {
      onloaded();
    }
    else {
      document.addEventListener("DOMContentLoaded", onloaded);
    }
  }
})();
