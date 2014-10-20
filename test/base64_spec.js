var WebpBase64 = require("../lib/WebpBase64"),
    base64stub = require("./fixtures/base64")
    should = require("should");

describe("base64", function(){
  var base64 = new WebpBase64();
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
    base64.extract("data:_image/png;base64,iVBORw").should.be.instanceof(Array).and.have.lengthOf(0);
    base64.extract("data_:image/png;base64,iVBORw").should.be.instanceof(Array).and.have.lengthOf(0);
    base64.extract("data:image/pngbase64,iVBORw").should.be.instanceof(Array).and.have.lengthOf(0);
    base64.extract("data:image/png;base64iVBORw").should.be.instanceof(Array).and.have.lengthOf(0);
  });

  xit("extract webp data", function(finish){
    var png = "data:image/png;base64,iVBORw";
    base64.extract(png, false, function(err, data){
      (true).should.be.ok;
      console.log(err);
      console.log("data");
      console.log(data);
      finish();
    });
    (true).should.be.ok;
  });
});
