/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */
"use strict";

var Webpcss = require("./Webpcss"),
    postcss = require("postcss");

var Promise = global.Promise || require("es6-promise").Promise;
var defaultWebpcss = null;

export var Webpcss = require("./Webpcss");

var plugin = postcss.plugin("webpcss", function(options) {
  var pt = options ? new Webpcss(options) : (
    defaultWebpcss || (defaultWebpcss = new Webpcss()));
  return (css)=> new Promise(
    (resolve, reject)=> pt.postcss(css,
      (err, data)=> err ? reject(err, data) : resolve(data))
    );
});

export default plugin;

export function transform(data, options) {
  return postcss([plugin(options)]).process(data);
}

