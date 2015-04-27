"use strict";
/*global describe, it */
var WebpBase64 = require("../lib/WebpBase64"),
    base64stub = require("./fixtures/base64"),
    should = require("should");

describe("base64", function() {
  var base64 = new WebpBase64();
  should;
  it("test base64 data", function() {
    new Buffer(base64stub.png_base64, "base64").toString().should.eql(
      base64stub.png_bin.toString()
    );
  });

  it("extract png", function() {
    var png = "data:image/png;base64,iVBORw";
    var url_png = "url(" + png + ")";
    var res = base64.extract(png);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png", data: "iVBORw"}].should.eql(res);

    res = base64.extract(url_png, true);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png", data: "iVBORw"}].should.eql(res);

    res = base64.extract(base64stub.png_uri);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png", data: base64stub.png_base64}].should.eql(res);

    res = base64.extract(base64stub.png_css, true);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{mimetype: "image/png", data: base64stub.png_base64}].should.eql(res);
  });

  it("extract multiple png", function() {
    var png = "data:image/png;base64,iVBORw";
    var url_png2 = "url(" + png + "), url(" + png + ")";
    var res = base64.extract(url_png2, true);
    res.should.be.ok;
  });

  it("extract breaking data", function() {
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

  it("test convert data with node-webp png", function() {
    return base64.convert(base64stub.png_bin)
      .catch(function(err) {
        console.log(err);
        false.should.be.ok;
      })
      .done(function(buffer) {
        buffer.should.be.instanceof(Buffer);
        buffer.should.be.eql(base64stub.webp);
      });
  });

  it("test convert data with node-webp jpg", function() {
    return base64.convert(base64stub.jpg_bin)
      .catch(function(err) {
        console.log(err);
        false.should.be.ok;
      })
      .done(function(buffer) {
        buffer.should.be.instanceof(Buffer);
        buffer.should.be.eql(base64stub.webp_jpg_bin);
      });
  });
});
