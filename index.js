/*
 * grunt-webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2014 Efremov Alexey
 * Licensed under the MIT license.
 */
"use strict";

var Webpcss = require("./lib/Webpcss"),
    postcss = require("postcss");

var defaultWebpcss = null;

module.exports = postcss.plugin("webpcss", function(options) {
  var pt = options ? new Webpcss(options) : (
    defaultWebpcss || (defaultWebpcss = new Webpcss()));
  return function(css) {
    return pt.postcss(css);
  };
});

module.exports.Webpcss = Webpcss;

module.exports.transform = function(data, options) {
  if (!options) {
    return (defaultWebpcss || (defaultWebpcss = new Webpcss())).transform(data);
  } else {
    return (new Webpcss(options)).transform(data);
  }
};
