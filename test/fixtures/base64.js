var fs = require("fs"),
    libpath = require("path");

var pngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.png" ));
var pngbase64 = pngbinary.toString("base64");
var webp_pngbinary = fs.readFileSync(libpath.join(__dirname, "avatar.webp"));
var webp_pngbase64 = webp_pngbinary.toString("base64");
module.exports = {
  png_bin: pngbinary,
  png_base64: pngbase64,
  png_uri: "data:image/png;base64," + pngbase64,
	webp: webp_pngbinary,
  webp_base64: webp_pngbase64,
  webp_uri: "data:image/webp;base64," + webp_pngbase64
};
