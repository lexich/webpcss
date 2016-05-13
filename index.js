"use strict";

/* eslint no-var: 0, import/export: 0, prefer-arrow-callback: 0 */
var path = require("path");

var escape = function (str) {
  return str.replace(/[\[\]\/{}()*+?.\\^$|-]/g, "\\$&");
};

var regexp = ["lib", "test"].map(function (i) {
  return "^" + escape(path.join(__dirname, i) + path.sep);
}).join("|");

require("babel-core/register")({
  only: new RegExp("(" + regexp + ")"),
  ignore: false,
  loose: "all"
});
module.exports = require("./lib");
