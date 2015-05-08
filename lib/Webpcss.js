"use strict";
var WebpBase64  = require("./WebpBase64");
var fs = require("fs");
var libpath = require("path");
var rxHtml = /^html[_\.#\[]{1}/;
var DEFAULTS = {
  baseClass: ".webp",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  inline: false, /* root path to folder */
  image_root: "",
  css_root: "",
  cwebp_configurator: null,
  process_selector: function(selector, baseClass) {
    return rxHtml.test(selector) ? (
      selector.replace("html", "html" + baseClass)
    ) : baseClass + " " + selector;
  }
};

function Job(cb, _counter) {
  if (!(this instanceof Job)) {
    return new Job(cb, _counter);
  }
  var counter = _counter || 0;
  this.exec = function() {
    if (counter === 0) {
      cb();
    } else {
      counter--;
    }
  };
  this.next = function() {
    counter++;
    return this.finish;
  };
}

function cleanNode(node) {
  node.each(function(decl, i) {
    node.remove(i);
  });
  return node;
}

function Webpcss(opts) {
  if (!opts) {
    this.options = DEFAULTS;
  } else {
    this.options = {};
    for (var key in DEFAULTS) {
      this.options[key] = opts[key] || DEFAULTS[key];
    }
  }
  this.base64 = new WebpBase64();
}

Webpcss.prototype.postcss = function(css, cb) {
  var nodes = [];
  var options = this.options;
  var base64 = this.base64;
  var job = Job(function() {
    nodes.forEach(function(decl) { css.append(decl); });
    cb();
  });
  css.eachDecl(function(decl) {
    if ((decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0) &&
      decl.value.indexOf("url") >= 0) {
      var prop = decl.prop.indexOf("background") === 0 ? "background-image" : decl.prop;
      var selector = "";
      decl.parent.selectors.forEach(function(sel) {
        if (!!selector) { selector += ", "; }
        selector += options.process_selector(sel, options.baseClass);
      });

      var urls = base64.extract(decl.value, true);
      if (!urls.length) { return; }

      var rx = options.replace_from instanceof RegExp ? options.replace_from : new RegExp(rx, "g");

      var value = [];
      var breaks = 0;
      job.next();

      var jobExec = Job(function() {
        if (breaks !== urls.length) {
          var strvalue = value.join(",");

          var root = decl.parent;
          var dupRule = cleanNode(root.clone({selector: selector}));
          dupRule.append({prop: prop, value: strvalue, semicolon: true});

          root = root.parent;
          while (root.type !== "root") {
            var dupRoot = cleanNode(root.clone());
            dupRoot.append(dupRule);
            dupRule = dupRoot;
            root = root.parent;
          }
          nodes.push(dupRule);
        }
        job.exec("jobExec");
      }, urls.length);

      urls.forEach(function(item) {
        var url = item.data;
        if (item.mimetype === "url" && !options.inline) {
          var src = url.replace(rx, options.replace_to);
          breaks += +(src === url);
          value.push("url(" + src + ")");
          jobExec.exec("url-local");
        } else if (item.mimetype === "url" && options.inline) {
          var urlPath = (url[0] === "/") ?
            /* url(/image.png) abs path */
            libpath.resolve(libpath.join(options.image_root, url)) :
            /* url(../images.png) or url(image.png) - relative css path */
            libpath.resolve(libpath.join(options.css_root, url));
          fs.readFile(urlPath, function(err, data) {
            if (err) {
              breaks++;
              value.push("url(" + item.data + ")");
              jobExec.exec("inline-error");
            } else {
              base64.convert(data, options.cwebp_configurator)
                .catch(function() {
                  breaks++;
                  value.push("url(" + item.data + ")");
                })
                .then(function(buffer) {
                  var str = "url(data:image/webp;base64," + buffer.toString("base64") + ")";
                  value.push(str);
                })
                .finally(function() { jobExec.exec("done-local"); });
            }
          });
        } else {
          base64.convert(url)
            .catch(function() {
              breaks++;
              value.push("url(" + item.data + ")");
            })
            .then(function(buffer) {
              var str = "url(data:image/webp;base64," + buffer.toString("base64") + ")";
              value.push(str);
            })
            .finally(function() { jobExec.exec("done-local"); });
        }
      });
      jobExec.exec("finish-local");
    }
  });
  job.exec("finish");
};

module.exports = Webpcss;
