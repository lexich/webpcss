/*global describe, it, xit*/
/* jshint expr: true */
var WebpBase64 = require("../lib/WebpBase64"),
    base64stub = require("./fixtures/base64"),
    fs = require("fs"),
    should = require("should");

describe("base64", function(){
  var base64 = new WebpBase64();

  it("test base64 data", function(){
    new Buffer(base64stub.png_base64, "base64").toString().should.eql(
      base64stub.png_bin.toString()
    );
  });

  it("extract png", function(){
    var png = "data:image/png;base64,iVBORw";
    var url_png = "url(" + png + ")";
    var res = base64.extract(png);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png",data: "iVBORw"}].should.eql(res);

    res = base64.extract(url_png, true);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png",data: "iVBORw"}].should.eql(res);

    res = base64.extract(base64stub.png_uri);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png",data: base64stub.png_base64}].should.eql(res);

    res = base64.extract(base64stub.png_css, true);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png",data: base64stub.png_base64}].should.eql(res);
  });

  it("extract multiple png", function(){
    var png = "data:image/png;base64,iVBORw";
    var url_png2 = "url(" + png + "), url(" + png + ")";
    var res = base64.extract(url_png2, true);
    res.should.be.ok;
  });

  it("extract breaking data", function(){
    [{mimetype: "_image/png", data:"iVBORw"}].should.eql(
      base64.extract("data:_image/png;base64,iVBORw")
    );

    [{mimetype: "url", data:"data_:image/png;base64,iVBORw"}].should.eql(
      base64.extract("data_:image/png;base64,iVBORw")
    );

    [{mimetype: "url", data:"data:image/pngbase64,iVBORw"}].should.eql(
      base64.extract("data:image/pngbase64,iVBORw")
    );

    [{mimetype: "url", data:"data:image/png;base64iVBORw"}].should.eql(
      base64.extract("data:image/png;base64iVBORw")
    );
  });

  //xit("test convert data with imagemagic", function(){
  //  var file = base64.convert({mimetype: "png", data: base64stub.png_bin});
  //  if(file===null){ (false).should.be.ok; }
  //  file.code.should.eql(0);
  //  file.stderr.should.eql("");
  //  (file.stdout.length > 0).should.be.ok;
  //});
  ////problem with cwebp
  //xit("test convert data with cwebp", function(){
  //  var file = base64.convert({mimetype: "png", data: base64stub.png_bin}, {bin: "cwebp"});
  //  if(file===null){ (false).should.be.ok; }
  //  file.code.should.eql(0);
  //  file.stderr.should.eql("");
  //  (file.stdout.length > 0).should.be.ok;
  //});
});
