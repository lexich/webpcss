var urldata = require("./urldata"),
    fs = require("fs"),
    child = require("child_process");

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

function WebpBase64(tmppath, bin){
  this.tmppath = tmppath || "tmp.webp.png";
  this.bin = bin || "convert";
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

WebpBase64.prototype.convert = function(item, callback){
  if(!item || !item.format || !item.data){ return callback("not valid data"); }
  var buffer = new Buffer(0)
  var error = "";
  //convert - -quality 50  -define webp:lossless=true -
  var proc =  child.spawn(this.bin,[
    "-", "-quality", "50", "-define", "webp:lossless=true", "-"
  ]);
  proc.stdin.write(item.data);
  proc.stdin.end();
  proc.stdout.on("data", function(data){
    buffer = Buffer.concat([buffer, data]);
  });
  proc.stderr.on("data", function(data){
    error += data;
  })
  proc.on("close", function(code){
    if(!!callback){
      callback(!error ? null : error, buffer);
    }
  });
  return proc;
}

WebpBase64.prototype.webp = function(value, isUrl, _callback){
  if(!_callback){ return; }
  var extractdata = this.extract(value, isUrl);
  var ready = extractdata.length;
  var buffer = [];
  var errors = [];
  var callback = function(err, data, i){
    ready--;
    if(!!err){ errors[i] = err; }
    if(!!data){ buffer[i] = data; }
    if(ready === 0){
      var err = !errors.length ? null : errors.join("\n");
      if(!!_callback){ _callback(err, buffer); }
    }
  }
  var _wrap = function(i){
    return function(err, data){
      callback(err, data, i);
    };
  };
  for(var i = 0; i<extractdata.length; i++){
    var item = extractdata[i];
    if(item.format !== "url"){
      this.convert(item, _wrap(i));
    } else {
      callback(null, item.data, i);
    }
  }
};

module.exports = WebpBase64;
