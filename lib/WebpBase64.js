"use strict";
var urldata = require("urldata");
var CWebp = require("cwebp").CWebp;

var base64pattern = "data:";
var base64patternEnd = ";base64,";

function extract(value) {
  if (!value) { return; }
  var base64pos = value.indexOf(base64pattern);
  if (base64pos >= 0) {
    var base64posEnd = value.indexOf(base64patternEnd);
    if (base64posEnd < 0) { return {mimetype: "url", data: value}; }
    var mimetype = value.slice(base64pos + base64pattern.length, base64posEnd);
    var data = value.slice(base64posEnd + base64patternEnd.length);
    return {mimetype: mimetype, data: data};
  } else {
    return {mimetype: "url", data: value};
  }
}

function WebpBase64() {
}

WebpBase64.prototype.extract = function(value, isUrl) {
  var result = [];
  if (!!isUrl) {
    var data = urldata(value);
    for (var i = 0; i < data.length; i++) {
      if (!data[i]) { continue; }
      result[result.length] = extract(data[i], isUrl);
    }
  } else {
    var res = extract(value, isUrl);
    if (res) { result[result.length] = res; }
  }
  return result;
};

WebpBase64.prototype.convert = function(data, fConfig) {
  var buffer = (data instanceof Buffer) ? data : new Buffer(data, "base64");
  var encoder = new CWebp(buffer);
  encoder = fConfig ? fConfig(encoder) : encoder;
  return encoder.toBuffer();
};

module.exports = WebpBase64;
