/* global describe, it */
/* eslint no-var: 0, max-len: 0 */
/* eslint import/no-extraneous-dependencies: 0 */

"use strict";

import libpath from "path";
import { expect } from "chai";
import Promise from "es6-promise";
import { transform } from "../lib";
import base64stub from "./fixtures/base64";

Promise.polyfill();

describe("webpcss", () => {
  it("not modify sample", () => {
    var input = ".test { backround: red; }";
    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("html tag", () => {
    var input = "html.test { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\nhtml.webp.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("border-radius css property", () => {
    var input = ".test { border-image: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { border-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it(".html classname", () => {
    var input = ".html.test { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .html.test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("multiple selectors", () => {
    var input = ".test1, .test2 { background: url('test.png'); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test1, .webp .test2 { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background-image with url", () => {
    var input = ".test { background-image: url(test.jpg); }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url", () => {
    var input = ".test { background: url(test.jpeg); }";
    transform(input).then(res => {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background with url and params", () => {
    var input = ".test { background: transparent url(test.png) no-repeat; }";
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background: transparent url(test.webp) no-repeat; }").to.be.eql(res.css);
    });
  });

  it("default options background multiple urls", () => {
    var input =
      ".img_play_photo_multiple { background: url(number.png) 600px 10px no-repeat,\nurl(\"thingy.png\") 10px 10px no-repeat,\nurl('Paper-4.png');\n}";
    var output =
      input +
      "\n.webp .img_play_photo_multiple { background: url(number.webp) 600px 10px no-repeat,\nurl(thingy.webp) 10px 10px no-repeat,\nurl(Paper-4.webp); }";
    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options multiple mixed clasess", () => {
    var input = '.test1 { background: url("test1.jpeg"); }' + ".test2 { background-image: url('test2.png'); }";
    var output =
      '.test1 { background: url("test1.jpeg"); }' +
      ".test2 { background-image: url('test2.png'); }" +
      ".webp .test1 { background: url(test1.webp); }" +
      ".webp .test2 { background-image: url(test2.webp); }";

    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("default options background with gif", () => {
    var input = ".test { background: url(test.gif); }";

    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("default options background with gif and jpg", () => {
    var input = '.test { background: url(test.gif), url("test1.jpg"); }';
    return transform(input).then(res => {
      expect(input + "\n.webp .test { background: url(test.gif), url(test1.webp); }").to.be.eql(res.css);
    });
  });

  it("default options background data uri", () => {
    var input = ".test { background: url(" + base64stub.png + ") no-repeat; }";
    return transform(input).then(res => {
      expect(input).to.be.eql(res.css);
    });
  });

  it("custom options webpClass", () => {
    var input = ".test { background-image: url(test.png); }";
    return transform(input, { webpClass: ".webp1" }).then(res => {
      expect(input + "\n.webp1 .test { background-image: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass with example background-image", () => {
    var input = ".test { background-image: url(test.png); }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background-image: url(test.png); }" + "\n.webp .test { background-image: url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background", () => {
    var input = ".test { background: transparent url(test.png); }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background: transparent url(test.png); }" +
          "\n.webp .test { background: transparent url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl", () => {
    var input = ".test { background: transparent url(test.png); color: red; }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        ".no-webp .test { background: transparent url(test.png); }" +
          "\n.test { color: red; }" +
          "\n.webp .test { background: transparent url(test.webp); }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options noWebpClass example background with other decl with @media query", () => {
    var input = "@media screen and (min-width: 500px) { .test { background: transparent url(test.png); color: red; } }";
    return transform(input, { noWebpClass: ".no-webp" }).then(res => {
      expect(
        "@media screen and (min-width: 500px) { .no-webp .test { background: transparent url(test.png); } .test { color: red; } } " +
          "@media screen and (min-width: 500px) { .webp .test { background: transparent url(test.webp); } }"
      ).to.be.eql(res.css);
    });
  });

  it("custom options replace_from background with gif", () => {
    var input = ".test { background: url(test.gif); }";
    return transform(input, { replace_from: /\.gif/g }).then(res => {
      expect(input + "\n.webp .test { background: url(test.webp); }").to.be.eql(res.css);
    });
  });

  it("custom options replace_to background-image with url", () => {
    var input = ".test { background-image: url(test.jpg); }";
    return transform(input, { replace_to: ".other" }).then(res => {
      expect(input + "\n.webp .test { background-image: url(test.other); }").to.be.eql(res.css);
    });
  });

  it("custom options replace_to function background-image with url", () => {
    var input = ".test { background-image: url(test.jpg); }";
    return transform(input, {
      replace_to(data) {
        expect(data.url).to.be.eql("test.jpg");
        return "hello.world?text=test";
      },
    }).then(res => {
      expect(input + "\n.webp .test { background-image: url(hello.world?text=test); }").to.be.eql(res.css);
    });
  });

  it("replace_to && replace_from", () => {
    var input = ".icon { color: #222; background-image: url('../images/icon.png'); }";
    return transform(input, { replace_to: ".$1.webp" }).then(res => {
      expect(input + "\n.webp .icon { background-image: url(../images/icon.png.webp); }").to.be.eql(res.css);
    });
  });

  it("check with @media-query", () => {
    var input = "@media all and (min-width:100px){ .test { background-image: url(test.jpg); } }";
    var output = input + " @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } }";
    return transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check with multiple @media-query", () => {
    var input =
      "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }";
    var output =
      "@media all and (max-width:200px){ @media all and (min-width:100px){ .test { background-image: url(test.jpg); } } }" +
      " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } } }";
    transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check with multiple @media-query with other rule and decls", () => {
    var input =
      "@media all and (max-width:200px){" +
      " .garbage{ color: blue; } " +
      "@media all and (min-width:100px){" +
      " .test { " +
      "background-image: url(test.jpg); color: red; " +
      "} } }";
    var output =
      input +
      " @media all and (max-width:200px){ @media all and (min-width:100px){ .webp .test{ background-image: url(test.webp); } } }";
    transform(input).then(res => {
      expect(output).to.be.eql(res.css);
    });
  });

  it("check convert base64 png webp options background data uri", () => {
    var input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/png;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/png;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert base64 jpg webp options background data uri", () => {
    var input = ".test { background: " + base64stub.jpg_css + " no-repeat; }";
    return transform(input).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/jpg;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/jpg;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check convert base64 webp options background data uri and should do nothing", () => {
    var input = ".test { background: " + base64stub.webp_base64 + " no-repeat; }";
    return transform(input).then(res => {
      var css = res.css;
      expect(css).to.be.eql(input);
    });
  });

  it("check resolveUrlRelativeToFile and file size above minAddClassFileSize", () => {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      var css = res.css;
      expect(input + "\n.webp .test { background: url(avatar.webp); }").to.be.eql(css);
    });
  });

  it("check resolveUrlRelativeToFile and file size below minAddClassFileSize", () => {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1024 * 1024 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      var css = res.css;
      expect(input).to.be.eql(css);
    });
  });

  it("check resolveUrlRelativeToFile and file size above minAddClassFileSize with inline", () => {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { inline: true, resolveUrlRelativeToFile: true, minAddClassFileSize: 1 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      var css = res.css;
      expect(css).to.contain(".test { background: url(avatar.png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check resolveUrlRelativeToFile and file size below minAddClassFileSize with inline", () => {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(
      input,
      { resolveUrlRelativeToFile: true, minAddClassFileSize: 1024 * 1024 },
      {
        from: libpath.join(fixturesPath, "test.css"),
      }
    ).then(res => {
      var css = res.css;
      expect(input).to.be.eql(css);
    });
  });

  it("check file size below minAddClassFileSize with base64 encoded content", () => {
    var input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input, { minAddClassFileSize: 1 }).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/png;base64,/);
      expect(css).to.match(/\.test { background: url\(data:image\/png;base64,/);

      expect(css).to.not.match(/\.test { }/);

      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check file size above minAddClassFileSize with base64 encoded content", () => {
    var input = ".test { background: " + base64stub.png_css + " no-repeat; }";
    return transform(input, { minAddClassFileSize: 1024 * 1024 }).then(res => {
      var css = res.css;
      expect(input).to.be.eql(css);
    });
  });

  it("check inline property for png source", () => {
    var input = ".test { background: url(avatar.png); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.contain(".test { background: url(avatar.png); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for jpg source", () => {
    var input = ".test { background: url(kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.contain(".test { background: url(kitten.jpg); }");
      expect(css).to.contain(".webp .test { background: url(data:image/webp;base64,");
    });
  });

  it("check inline property for invalid path source", () => {
    var input = ".test { background: url(kitten1.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.eql(input);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    var input = ".test { background: url(kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    var input = ".test { background: url(../fixtures/kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "css");
    return transform(input, { inline: true, css_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });

  it("check inline property for jpg source with relative path", () => {
    var input = ".test { background: url(/kitten.jpg); }";
    var fixturesPath = libpath.join(__dirname, "fixtures");
    return transform(input, { inline: true, image_root: fixturesPath }).then(res => {
      var css = res.css;
      expect(css).to.match(/data:image\/webp;base64,/);
      expect(css).to.match(/\.webp \.test { background: url\(data:image\/webp;base64,/);
    });
  });
});
