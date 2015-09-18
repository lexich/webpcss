/* global describe, it*/
"use strict";

var webpcss = require("../lib"),
  base64stub = require("./fixtures/base64"),
  libpath = require("path"),
  expect = require("chai").expect,
  Promise = require("es6-promise");

Promise.polyfill();

describe("webpcss", function() {
  it("not modify sample", function() {
    var input = ".test { backround: red; }";
    return webpcss.transform(input).then(function(res) {
      expect(input).to.be.eql(res.css);
    });
  });

  it("html tag", function() {
    var input = "html.test { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\nhtml.webp.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("border-radius css property", function() {
    var input = ".test { border-image: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test { border-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it(".html classname", function() {
    var input = ".html.test { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .html.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("multiple selectors", function() {
    var input = ".test1, .test2 { background: url('test.png'); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test1, .webp .test2 { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background-image with url", function() {
    var input = ".test { background-image: url(test.jpg); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url", function() {
    var input = ".test { background: url(test.jpeg); }";
    webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url and params", function() {
    var input = ".test { background: transparent url(test.png) no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test { background: transparent url(test.webp) no-repeat; }").to.be.eql(res.css);
    });
  });

  it("default options background multiple urls", function() {
    var input = ".img_play_photo_multiple { background: url(number.png) 600px 10px no-repeat,\nurl(\"thingy.png\") 10px 10px no-repeat,\nurl('Paper-4.png');\n}";
    var output = input + "\n.webp .img_play_photo_multiple { background: url(number.webp) 600px 10px no-repeat,\nurl(thingy.webp) 10px 10px no-repeat,\nurl(Paper-4.webp); }";
    return webpcss.transform(input).then(function(res) {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options multiple mixed clasess", function() {
    var input = ".test1 { background: url(\"test1.jpeg\"); }" +
        ".test2 { background-image: url(\'test2.png\'); }";
    var output = ".test1 { background: url(\"test1.jpeg\"); }" +
      ".test2 { background-image: url('test2.png'); }" + ".webp .test1 { background: url(test1.webp); }" + ".webp .test2 { background-image: url(test2.webp); }";

    return webpcss.transform(input).then(function(res) {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options background with gif", function() {
    var input = ".test { background: url(test.gif); }";

    return webpcss.transform(input).then(function(res) {
      expect(input).to.be.eql(res.css);
    });
  });

  it("default options background with gif and jpg", function() {
    var input = ".test { background: url(test.gif), url(\"test1.jpg\"); }";
    return webpcss.transform(input).then(function(res) {
      expect(input + "\n.webp .test { background: url(test.gif), url(test1.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background data uri", function() {
    var input = ".test { background: url(" + base64stub.png + ") no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options webpClass", function() {
    var input = ".test { background-image: url(test.png); }";
    return webpcss.transform(input, {webpClass: ".webp1"}).then(function(res) {
      expect(input + "\n.webp1 .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass with example background-image", function() {
    var input = ".test { background-image: url(test.png); }";
    return webpcss.transform(input, {noWebpClass: ".no-webp"}).then(function(res) {
      expect(".no-webp .test { background-image: url(test.png); }" + "\n.webp .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background", function() {
    var input = ".test { background: transparent url(test.png); }";
    return webpcss.transform(input, {noWebpClass: ".no-webp"}).then(function(res) {
      expect(".no-webp .test { background: transparent url(test.png); }" + "\n.webp .test { background: transparent url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl", function() {
    var input = ".test { background: transparent url(test.png); color: red; }";
    return webpcss.transform(input, {noWebpClass: ".no-webp"}).then(function(res) {
      expect(".no-webp .test { background: transparent url(test.png); }" + "\n.test { color: red; }" + "\n.webp .test { background: transparent url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl with @media query", function() {
    var input = "@media screen and (min-width: 500px) { .test { background: transparent url(test.png); color: red; } }";
    return webpcss.transform(input, {noWebpClass: ".no-webp"}).then(function(res) {
      expect("@media screen and (min-width: 500px) { .no-webp .test { background: transparent url(test.png); } .test { color: red; } } " + "@media screen and (min-width: 500px) { .webp .test { background: transparent url(test.webp); } }").to.be.eql(res.css);
    });
  });

  it("custom options replace_from background with gif", function() {
    var input = ".test { background: url(test.gif); }";
    return webpcss.transform(input, {replace_from: /\.gif/g}).then(function(res) {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replace_to background-image with url", function() {
    var input = ".test { background-image: url(test.jpg); }";
    return webpcss.transform(input, {replace_to: ".other"}).then(function(res) {
      expect(input + "\n.webp .test { background-image: url(test.other); }").to.be.eql(res.css);
    });
  });

  it("check with @media-query", function() {
    var input = "@media all and (min-width:100px){ .test { background-image: url(test.jpg); } }";
    var output = input + " @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } }";
    return webpcss.transform(input).then(function(res) {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check with multiple @media-query", function() {
    var input = "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }";
    var output = "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }" + " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } } }";
    webpcss.transform(input).then(function(res) {
      expect(output).to.be.eql(res.css);
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
      expect(output).to.be.eql(res.css);
    });
  });

  it("check convert base64 png webp options background data uri", function() {
    var input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      var css = res.css;
      expect(css).to.match(/data:image\/png;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/png;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert base64 jpg webp options background data uri", function() {
    var input = ".test { background: " + base64stub.jpg_css + " no-repeat; }";
    return webpcss.transform(input).then(function(res) {
      var css = res.css;
      expect(css).to.match(/data:image\/jpg;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/jpg;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for png source", function() {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: true, css_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.contain(".test { background: url(avatar.png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for jpg source", function() {
    var input = ".test { background: url(kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: true, css_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.contain(".test { background: url(kitten.jpg); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for invalid path source", function() {
    var input = ".test { background: url(kitten1.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: true, css_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.eql(input);
    });
  });

  it("check inline property for jpg source with relative path", function() {
    var input = ".test { background: url(kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: true, css_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", function() {
    var input = ".test { background: url(../fixtures/kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "css");
    return webpcss.transform(input, {inline: true, css_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", function() {
    var input = ".test { background: url(/kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return webpcss.transform(input, {inline: true, image_root: fixturesPath}).then(function(res) {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });
});

