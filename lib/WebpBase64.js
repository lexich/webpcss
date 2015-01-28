var urldata = require("urldata"),
    fs = require("fs"),
    os = require("os"),
    libpath =  require("path"),
    child = require("child_process");

let base64pattern = "data:";
let base64patternEnd = ";base64,";

export default class WebpBase64 {
  constructor(bin="convert"){
    this.bin = bin;
  }
  extract (value, isUrl){
    var result = [];
    if(!!isUrl){
      var data = urldata(value);
      for(var i = 0; i < data.length; i++){
        if(!data[i]){ continue; }
        result[result.length] = WebpBase64.toExtract(data[i], isUrl);
      }
    } else {
      var res = WebpBase64.toExtract(value, isUrl);
      if(res){ result[result.length] = res; }
    }
    return result;
  }
  static toExtract(value) {
    if(!value){ return; }
    var base64pos = value.indexOf(base64pattern);
    if( base64pos >= 0 ){
      var base64posEnd = value.indexOf(base64patternEnd);
      if(base64posEnd < 0){ return {mimetype: "url", data: value}; }
      var mimetype = value.slice(base64pos + base64pattern.length, base64posEnd);
      var data = value.slice(base64posEnd + base64patternEnd.length);
      return {mimetype, data};
    } else {
      return {mimetype: "url", data: value};
    }
  }
}
