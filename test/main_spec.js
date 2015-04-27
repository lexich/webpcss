/*global describe, it*/
"use strict";

var webpcss = require("../"),
    base64stub = require("./fixtures/base64"),
    libpath = require("path"),
    should = require("should");

describe("webpcss", function() {
  should;

  it("not modify sample", function() {
    var input = ".test { backround: red; }";
    return webpcss.transform(input).then(function(res) {
      input.should.be.equal(res.css);
    });
  });

  it("html tag", function() {
    var input = "html.test { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\nhtml.webp.test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("border-radius css property", function() {
    var input = ".test { border-image: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test { border-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it(".html classname", function() {
    var input = ".html.test { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .html.test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("multiple selectors", function() {
    var input = ".test1, .test2 { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test1, .webp .test2 { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("default options background-image with url", function() {
    var input = ".test { background-image: url(test.jpg); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("default options background with url", function() {
    var input = ".test { background: url(test.jpeg); }";
    webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("default options background with url and params", function() {
    var input = ".test { background: transparent url(test.png) no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("default options background multiple urls", function() {
    var input = ".img_play_photo_multiple{ background: url(number.png) 600px 10px no-repeat,\nurl(\"thingy.png\") 10px 10px no-repeat,\nurl('Paper-4.png');\n}";
    var output = input + "\n.webp .img_play_photo_multiple{ background-image: url(number.webp),url(thingy.webp),url(Paper-4.webp);\n}";
    return webpcss.transform(input).then(function(res) {
      output.should.be.eql(res.css);
    });
  });

  it("default options multiple mixed clasess", function() {
    var input = ".test1{ background: url(\"test1.jpeg\");}" +
        ".test2{ background-image: url(\'test2.png\');}";
    var output = input + ".webp .test1{ background-image: url(test1.webp);}" +
      ".webp .test2{ background-image: url(test2.webp);}";

    return webpcss.transform(input).then(function(res) {
      output.should.be.eql(res.css);
    });
  });

  it("default options background with gif", function() {
    var input = ".test { background: url(test.gif); }";

    return webpcss.transform(input).then(function(res) {
      input.should.be.eql(res.css);
    });
  });

  it("default options background with gif and jpg", function() {
    var input = ".test { background: url(test.gif), url(\"test1.jpg\"); }";
    return webpcss.transform(input).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.gif),url(test1.webp); }").should.be.eql(res.css);
    });
  });

  it("default options background data uri", function() {
    var input = ".test { background: url(" + base64stub.png + ") no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      input.should.be.eql(res.css);
    });
  });

  it("custom options baseClass", function() {
    var input = ".test { background-image: url(test.png); }";
    return webpcss.transform(input, {baseClass: ".webp1"}).then(function(res) {
      (input + "\n.webp1 .test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("custom options replace_from background with gif", function() {
    var input = ".test { background: url(test.gif); }";
    return webpcss.transform(input, {replace_from: /\.gif/g}).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.webp); }").should.be.eql(res.css);
    });
  });

  it("custom options replace_to background-image with url", function() {
    var input = ".test { background-image: url(test.jpg); }";
    return webpcss.transform(input, {replace_to: ".other"}).then(function(res) {
      (input + "\n.webp .test { background-image: url(test.other); }").should.be.eql(res.css);
    });
  });

  it("check with @media-query", function() {
    var input = "@media all and (min-width:100px){ .test { background-image: url(test.jpg); } }";
    var output = input + " @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } }";
    return webpcss.transform(input).then(function(res) {
      output.should.be.eql(res.css);
    });
  });

  it("check with multiple @media-query", function() {
    var input = "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }";
    var output = input + " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } } }";
    webpcss.transform(input).then(function(res) {
      output.should.be.eql(res.css);
    });
  });

  it("check with multiple @media-query with other rule and decls", function() {
    var input = "@media all and (max-width:200px){" +
                " .garbage{ color: blue; } " +
                "@media all and (min-width:100px){" +
                " .test { " +
                "background-image: url(test.jpg); color: red; " +
                "} } }";
    var output = input + " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } } }";
    webpcss.transform(input).then(function(res) {
      output.should.be.eql(res.css);
    });
  });

  it("check convert base64 png webp options background data uri", function() {
    var input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      var css = res.css;
      css.should.match(/data:image\/png;base64,/);
      css.should.match(/\.test { background: url\(data:image\/png;base64,/);

      css.should.match(/data:image\/webp;base64,/);
      css.should.match(/\.webp \.test { background-image: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert base64 jpg webp options background data uri", function() {
    var input = ".test { background: " + base64stub.jpg_css + " no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      var css = res.css;
      css.should.match(/data:image\/jpg;base64,/);
      css.should.match(/\.test { background: url\(data:image\/jpg;base64,/);

      css.should.match(/data:image\/webp;base64,/);
      css.should.match(/\.webp \.test { background-image: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for png source", function() {
    var input = ".test { background: url(avatar.png); }";
    var fixtures_path = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: fixtures_path}).then(function(res) {
      var css = res.css;
      css.should.match(/data:image\/webp;base64,/);
      css.should.match(/\.webp \.test { background-image: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source", function() {
    var input = ".test { background: url(kitten.jpg); }";
    var fixtures_path = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: fixtures_path}).then(function(res) {
      var css = res.css;
      css.should.match(/data:image\/webp;base64,/);
      css.should.match(/\.webp \.test { background-image: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for invalid path source", function() {
    var input = ".test { background: url(kitten1.jpg); }";
    var fixtures_path = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: fixtures_path}).then(function(res) {
      var css = res.css;
      css.should.eql(input);
    });
  });
});

