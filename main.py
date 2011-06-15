#!/usr/bin/env python
#
# Copyright 2010 Paul Kinlan.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext.webapp import template


import os
import re
import logging
from urlparse import urlparse
import simplejson2


title = "<title>(.+)</title>"
image = "<img class=\"detail-logo-128\" src=\"([^\"]+)\" alt=\"Logo\">"

class FetchInformationHandler(webapp.RequestHandler):
  def get(self):
    url = self.request.get("url")
    meta = {}
    
    fetcheddata = urlfetch.fetch(url, deadline = 10)
    
    if fetcheddata.status_code == 200:
      # parse the data to get the basic information out.
      html = fetcheddata.content
      
      # get the data
      titleMatch = re.search(title, html, flags=re.IGNORECASE)
      if titleMatch:
        meta["name"] = titleMatch.group(1) # only consider the first title
      # get the data
      imageMatch = re.search(image, html, flags=re.IGNORECASE)
      if imageMatch:
        meta["image"] = "http:" + imageMatch.group(1)
      
    else:
      self.response.status_code = fetcheddata.status_code

    self.response.headers['Content-Type'] = "application/json"
    self.response.out.write(simplejson2.dumps(meta, ensure_ascii=False))

class FetchImageHandler(webapp.RequestHandler):
  def get(self):
    url = self.request.get("url")

    fetcheddata = urlfetch.fetch(url, deadline = 10)

    self.response.status_code = fetcheddata.status_code
    self.response.headers['Content-Type'] = fetcheddata.headers['Content-Type']
    self.response.out.write(fetcheddata.content)

def quoteNotUndefined(val):
  if val != "undefined":
    return '"%s"' % val
  return val

class RenderScriptHandler(webapp.RequestHandler):
  def get(self):
    css_url = self.request.get("css_url", default_value  = "undefined")
    app_id = self.request.get("app_id", default_value = "undefined")
    app_name = self.request.get("app_name", default_value = "undefined")
    message = self.request.get("message", default_value = "undefined")
    install_message = self.request.get("install_message", default_value = "undefined")
    cancel_message = self.request.get("cancel_message", default_value = "undefined")
    
    template_url = os.path.join("badge.js")
    template_output = template.render(template_url, 
    { 
      "css_url" : quoteNotUndefined(css_url),
      "app_id" : quoteNotUndefined(app_id),
      "app_name" : quoteNotUndefined(app_name),
      "message" : quoteNotUndefined(message),
      "install_message" : quoteNotUndefined(install_message),
      "cancel_message" : quoteNotUndefined(cancel_message)
    })

    self.response.out.write(template_output)

def main():
  application = webapp.WSGIApplication([
    ('/badge.js', RenderScriptHandler),
    ('/api/fetch', FetchInformationHandler),
    ('/api/image', FetchImageHandler)
  ], debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()

