var WebpBase64 = require("../lib/WebpBase64"),
    base64stub = require("./fixtures/base64"),
    fs = require("fs"),
    libpath = require("path"),
    should = require("should");

describe("base64", function(){
  var base64 = new WebpBase64();
  var pngbinary = fs.readFileSync(libpath.join(__dirname, "fixtures", "avatar.png" ));
  var webp_pngbinary = fs.readFileSync(libpath.join(__dirname, "fixtures", "avatar.webp"));

  it("extract png", function(){
    var png = "data:image/png;base64,iVBORw";
    var url_png = "url(" + png + ")";
    var res = base64.extract(png);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{format: "png",data: "iVBORw"}].should.eql(res)

    res = base64.extract(url_png, true);
    res.should.be.instanceof(Array).and.have.lengthOf(1);
    [{format: "png",data: "iVBORw"}].should.eql(res)
  });

  it("extract multiple png", function(){
    var png = "data:image/png;base64,iVBORw";
    var url_png2 = "url(" + png + "), url(" + png + ")";
    res = base64.extract(url_png2, true);
    res.should.be.ok;
  });

  it("extract breaking data", function(){
    [{format: "url", data:"data:_image/png;base64,iVBORw"}].should.eql(
      base64.extract("data:_image/png;base64,iVBORw")
    );

    [{format: "url", data:"data_:image/png;base64,iVBORw"}].should.eql(
      base64.extract("data_:image/png;base64,iVBORw")
    );

    [{format: "url", data:"data:image/pngbase64,iVBORw"}].should.eql(
      base64.extract("data:image/pngbase64,iVBORw")
    );

    [{format: "url", data:"data:image/png;base64iVBORw"}].should.eql(
      base64.extract("data:image/png;base64iVBORw")
    );
  });

  it("test convert data", function(next){
    base64.convert({format: "png",data: pngbinary}, function(err, data){
      (err === null).should.be.ok;
      data.should.instanceof(Buffer);
      next();
    });
    (true).should.be.ok;
  });
});
