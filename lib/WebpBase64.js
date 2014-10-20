var CWebp = require("cwebp").CWebp,
    urldata = require("./urldata"),
    fs = require("fs");

var base64pattern = "data:image/";
var base64patternEnd = ";base64,";

function extract(value) {
  if(!value){ return; }
  var base64pos = value.indexOf(base64pattern);
  if( base64pos >= 0 ){
    var base64posEnd = value.indexOf(base64patternEnd);
    if(base64posEnd < 0){ return {format: "url", data: value}; }
    var format = value.slice(base64pos+base64pattern.length, base64posEnd);
    var data = value.slice(base64posEnd + base64patternEnd.length);
    return {format: format, data: data};
  } else {
    return {format: "url", data: value};
  }
}

function WebpBase64(tmpname){
  this.tmpname = tmpname || ".tmp.webp";
}

WebpBase64.prototype.extract = function(value, isUrl){
  var result = [];
  if(!!isUrl){
    var data = urldata(value);
    for(var i = 0; i < data.length; i++){
      if(!data[i]){ continue; }
      result[result.length] = extract(data[i], isUrl);
    }
  } else {
    var res = extract(value, isUrl);
    if(res){ result[result.length] = res; }
  }
  return result;
};

WebpBase64.prototype.webp = function(value, isUrl, callback){
  if(!callback){ return; }
  var base64 = extract(value, isUrl);
  var buffer = new Buffer(base64, "base64");
  var tmpname = this.tmpname;
  fs.writeFile(tmpname, buffer, function(err, data){
    return callback(err);
    (new CWebp(tmpname)).verbose().toBuffer(callback);
  });
};

WebpBase64.prototype.clean = function(callback){
  if(!callback){ return; }
  var tmpname = this.tmpname;
  fs.exists(tmpname, function(exists){
    if(!exists){
      return callback(null, false);
    } else {
      fs.unlink(tmpname, callback);
    }
  });
};

module.exports = WebpBase64;
