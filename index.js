/*
 * grunt-webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2014 Efremov Alexey
 * Licensed under the MIT license.
 */
'use strict';

var Webpcss = require("./lib/Webpcss");

var defaultWebpcss = null;

module.exports = function(options, data){
  var pt = !options ? (
    defaultWebpcss || (defaultWebpcss = new Webpcss())
  ) : new Webpcss(options);
  return data ? pt : pt.transform(data);
};

module.exports.Webpcss = Webpcss;

module.exports.postcss = function(css){
  return (defaultWebpcss || (defaultWebpcss = new Webpcss())).postcss(css);
};

module.exports.transform = function(data, options){
  if(!options){
    return (defaultWebpcss || (defaultWebpcss = new Webpcss())).transform(data);
  } else {
    return (new Webpcss(options)).transform(data);
  }
};
