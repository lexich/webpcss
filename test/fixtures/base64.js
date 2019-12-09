"use strict";

/* eslint no-var: 0 */

var fs = require("fs");
var libpath = require("path");

var pngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.png"));
var jpgbinary = fs.readFileSync(libpath.join(__dirname, "kitten.jpg"));
var svgContent = fs.readFileSync(libpath.join(__dirname, "circle.svg"), {
  encoding: "utf-8",
});
var svgbinary = Buffer.from(svgContent);

var pngbase64 = pngbinary.toString("base64");
var jpgbase64 = jpgbinary.toString("base64");
var svgbase64 = svgbinary.toString("base64");

var pngUri = "data:image/png;base64," + pngbase64;
var jpgUri = "data:image/jpg;base64," + jpgbase64;
var svgContentUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);
var svgBase64Uri = "data:image/svg+xml;base64," + svgbase64;

var webpPngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.webp"));
var webpJpgbinary = fs.readFileSync(libpath.join(__dirname, "kitten.webp"));
var webpPngbase64 = webpPngbinary.toString("base64");

module.exports = {
  png_bin: pngbinary,
  png_base64: pngbase64,
  png_uri: pngUri,
  png_css: "url(" + pngUri + ")",
  webp: webpPngbinary,
  webp_jpg_bin: webpJpgbinary,
  webp_base64: webpPngbase64,
  webp_uri: "data:image/webp;base64," + webpPngbase64,
  jpg_bin: jpgbinary,
  jpg_uri: jpgUri,
  jpg_css: "url(" + jpgUri + ")",
  svg_content: svgContent,
  svg_base64: svgbase64,
  svg_content_uri: svgContentUri,
  svg_base64_uri: svgBase64Uri,
};
