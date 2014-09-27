/*global describe, it*/
"use strict";

var fs = require("fs"),
    should = require("should"),
    webpcss = require("../");

describe("webpcss", function(){
  it("not modify sample", function(){
    var input = ".test { backround: red; }";
    webpcss.transform(input).should.be.equal(input);
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
});

