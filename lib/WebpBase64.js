var urldata = require("./urldata"),
    fs = require("fs"),
    os = require("os"),
    libpath =  require("path"),
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

function WebpBase64(bin){
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

WebpBase64.prototype.convert = function(item, bin){
  if(!item || !item.format || !item.data){
    return {
      code:1,
      stdout: new Buffer(0),
      stderr: "Illegal params"
    };
  }
  if(!bin){ bin = this.bin; }
  var stdout = new Buffer(0);
  var stdin = libpath.normalize(
    libpath.join(os.tmpdir(), "zstdin_" + process.pid + ".png")
  );
  var stdout = libpath.normalize(
    libpath.join(os.tmpdir(), "zstdout_" + process.pid + ".webp")
  );
  var stderr = libpath.normalize(
    libpath.join(os.tmpdir(), "zstderr_" + process.pid)
  );
  var finished = libpath.normalize(libpath.join(os.tmpdir(), "zfinish_" + process.pid));

  //write data to stdin file
  var data = (item.data instanceof Buffer) ? item.data : new Buffer(item.data, "base64");
  fs.writeFileSync(stdin, data);

  //clean finished and stderr files if it's exists
  if(fs.existsSync(finished)){
    try{ fs.unlinkSync(finished); } catch(ex){}
  }
  if(fs.existsSync(stderr)){
    try{ fs.unlinkSync(stderr); } catch(ex){}
  }
  var cmd;
  var cmd_finished = " && echo 1 > " + finished;
  if(bin.indexOf("convert")>= 0){
    //convert - -quality 50  -define webp:lossless=true -
    cmd = bin + " " + stdin + " -quality 50  -define webp:lossless=true - >" + stdout + " 2>" + stderr + cmd_finished;
  } else if (bin.indexOf("cwebp") >= 0){
    //cwebp [options] -q quality input.png -o output.webp
    cmd = bin + " -q 50 " + stdin + " -o " + stdout + " 2> " + stderr + cmd_finished;
  } else {
    return {
      code:1,
      stdout: new Buffer(0),
      stderr: "Illegal bin: " + bin
    };
  }
  child.exec(cmd);

  while(!fs.existsSync(finished)){
    /*active waiting*/
  }

  try{ fs.unlinkSync(finished); } catch(ex){}
  try{ fs.unlinkSync(stdin); } catch(ex){}
  var stdout_buffer, stderr_buffer;
  try{
    stdout_buffer = fs.readFileSync(stdout);
    fs.unlinkSync(stdout);
  } catch(ex){
    stdout_buffer = stdout_buffer || new Buffer(0);
  }
  try{
    stderr_buffer = fs.readFileSync(stderr).toString();
    fs.unlinkSync(stderr)
  } catch(ex){
    stderr_buffer = stderr_buffer || "";
  }
  return {
    code:0,
    stdout: stdout_buffer,
    stderr: stderr_buffer
  };
};

module.exports = WebpBase64;
