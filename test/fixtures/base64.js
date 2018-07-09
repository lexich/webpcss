"use strict";

/* eslint no-var: 0 */

var fs = require("fs"),
  libpath = require("path");

var pngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.png"));
var jpgbinary = fs.readFileSync(libpath.join(__dirname, "kitten.jpg"));

var pngbase64 = pngbinary.toString("base64");
var jpgbase64 = jpgbinary.toString("base64");

var pngUri = "data:image/png;base64," + pngbase64;
var jpgUri = "data:image/jpg;base64," + jpgbase64;

var webpPngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.webp"));
var webpJpgbinary = fs.readFileSync(libpath.join(__dirname, "kitten.webp"));
var webpPngbase64 = webpPngbinary.toString("base64");

module.exports = {
  png_bin: pngbinary,
  png_base64: pngbase64,
  png_uri: pngUri,
  png_css: "url(" + pngUri + ")",
  webp: webpPngbinary,
  webp_base64: webpPngbase64,
  webp_uri: "data:image/webp;base64," + webpPngbase64,
  jpg_bin: jpgbinary,
  jpg_uri: jpgUri,
  jpg_css: "url(" + jpgUri + ")",
  webp_jpg_bin: webpJpgbinary,
};
