/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */
"use strict";

var Webpcss = require("./lib/Webpcss"),
    postcss = require("postcss");

var Promise = global.Promise || require("es6-promise").Promise;
var defaultWebpcss = null;

var plugin = postcss.plugin("webpcss", function(options) {
  var pt = options ? new Webpcss(options) : (
    defaultWebpcss || (defaultWebpcss = new Webpcss()));
  return function(css) {
    return new Promise(function(resolve, reject) {
      pt.postcss(css, function(err, data) {
        return err ? reject(err, data) : resolve(data);
      });
    });
  };
});

module.exports = plugin;
module.exports.Webpcss = Webpcss;

module.exports.transform = function(data, options) {
  return postcss([plugin(options)]).process(data);
};
