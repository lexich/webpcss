/*global describe, it*/
"use strict";

var fs = require("fs"),
    should = require("should"),
    postcss = require("postcss"),
    webpcss = require("../"),
    base64stub = require("./fixtures/base64");

describe("webpcss", function(){


  it("not modify sample", function(){
    var input = ".test { backround: red; }";
    webpcss.transform(input).should.be.equal(input);
  });

  it("html tag", function(){
    var input = "html.test { background: url('test.png'); }";
    var output = input + "html.webp.test { background-image: url('test.webp'); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it(".html classname", function(){
    var input = ".html.test { background: url('test.png'); }";
    var output = input + ".webp .html.test { background-image: url('test.webp'); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it("multiple selectors", function(){
    var input = ".test1, .test2 { background: url('test.png'); }";
    var output = input + ".webp .test1, .webp .test2 { background-image: url('test.webp'); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options background-image with url", function(){
    var input = ".test { background-image: url(test.jpg); }";
    var output = input + ".webp .test { background-image: url(test.webp); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options background with url", function(){
    var input = ".test { background: url(test.jpeg); }";
    var output = input + ".webp .test { background-image: url(test.webp); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options background with url and params", function(){
    var input = ".test { background: transparent url(test.png) no-repeat; }";
    var output = input + ".webp .test { background-image: url(test.webp); }";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options background multiple urls", function(){
    var input = ".img_play_photo_multiple{ background: url(number.png) 600px 10px no-repeat,\nurl(\"thingy.png\") 10px 10px no-repeat,\nurl('Paper-4.png');\n}";
    var output = input + ".webp .img_play_photo_multiple{ background: url(number.webp) 600px 10px no-repeat,\nurl(\"thingy.webp\") 10px 10px no-repeat,\nurl('Paper-4.webp');\n}";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options multiple mixed clasess", function(){
    var input = ".test1{ background: url(\"test1.jpeg\");}" +
        ".test2{ background-image: url(\'test2.png\');}";
    var output = input + ".webp .test1{ background-image: url(\"test1.webp\");}" +
      ".webp .test2{ background-image: url(\'test2.webp\');}";
    webpcss.transform(input).should.be.equal(output);
  });
  it("default options background with gif", function(){
    var input = ".test { background: url(test.gif); }";
    webpcss.transform(input).should.be.equal(input);
  });
  it("default options background data uri", function(){
    var input = ".test { background: url(" + base64stub.png + ") no-repeat; }";
    webpcss.transform(input).should.be.equal(input);
  });
  it("custom options baseClass", function(){
    var input = ".test { background-image: url(test.png); }";
    var output = input + ".webp1 .test { background-image: url(test.webp); }";
    webpcss.transform(input, {baseClass: ".webp1"}).should.be.equal(output);
  });
  it("custom options replace_from background with gif", function(){
    var input = ".test { background: url(test.gif); }";
    var output = input + ".webp .test { background-image: url(test.webp); }";
    webpcss.transform(input, {replace_from: /\.gif/g}).should.be.equal(output);
  });
  it("custom options replace_to background-image with url", function(){
    var input = ".test { background-image: url(test.jpg); }";
    var output = input + ".webp .test { background-image: url(test.other); }";
    webpcss.transform(input, {replace_to: ".other"}).should.be.equal(output);
  });
  it("check postcss processor api", function(){
    var input = ".test { background-image: url(test.jpg); }";
    var output = input + ".webp .test { background-image: url(test.webp); }";
    postcss(webpcss.postcss).process(input).css.should.be.equal(output);
  });
});

