"use strict";
/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */
import WebpBase64 from "./WebpBase64";
import libpath from "path";
import PromiseA from "bluebird";
const fs = PromiseA.promisifyAll(require("fs"));

const rxHtml = /^html[_\.#\[]{1}/;
const DEFAULTS = {
  baseClass: ".webp",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  inline: false, /* root path to folder */
  image_root: "",
  css_root: "",
  cwebp_configurator: null,
  process_selector(selector, baseClass) {
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
  this.exec = ()=> (counter === 0) ? cb() : counter--;
  this.next = ()=> {
    counter++;
    return this.finish;
  };
}

function cleanNode(node) {
  node.each((decl, i)=> node.removeChild(i));
  return node;
}

class Webpcss {
  constructor(opts) {
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
    var job = Job(()=> {
      nodes.forEach((decl)=> css.append(decl));
      cb();
    });
  postcss(css) {
    const nodes = [];
    const asyncPromises = [];
    const {options, base64} = this;
    css.walkDecls((decl)=> {
      if ((decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0) &&
        decl.value.indexOf("url") >= 0) {
        var prop = decl.prop.indexOf("background") === 0 ? "background-image" : decl.prop;
        var selector = "";
        decl.parent.selectors.forEach((sel)=> {
          if (!!selector) { selector += ", "; }
          selector += options.process_selector(sel, options.baseClass);
        });

        var urls = base64.extract(decl.value, true);
        if (!urls.length) { return; }

        var rx = options.replace_from instanceof RegExp ? options.replace_from : new RegExp(rx, "g");

        var value = [];
        var breaks = 0;
        job.next();

        var jobExec = Job(()=> {
          if (breaks !== urls.length) {
            var strvalue = value.join(",");

            var root = decl.parent;
            var dupRule = cleanNode(root.clone({selector: selector}));
            dupRule.append({prop, value: strvalue, semicolon: true});

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

        urls.forEach((item)=> {
          var url = item.data;
          if (item.mimetype === "url" && !options.inline) {
            var src = url.replace(rx, options.replace_to);
            breaks += +(src === url);
            value.push(`url(${src})`);
            jobExec.exec("url-local");
          } else if (item.mimetype === "url" && options.inline) {
            var urlPath = (url[0] === "/") ?
              /* url(/image.png) abs path */
              libpath.resolve(libpath.join(options.image_root, url)) :
              /* url(../images.png) or url(image.png) - relative css path */
              libpath.resolve(libpath.join(options.css_root, url));
            fs.readFile(urlPath, (err, data)=> {
              if (err) {
                breaks++;
                value.push(`url(${item.data})`);
                jobExec.exec("inline-error");
              } else {
                base64.convert(data, options.cwebp_configurator)
                  .catch(()=> {
                    breaks++;
                    value.push("url(" + item.data + ")");
                  })
                  .then((buffer)=> {
                    if (buffer) {
                      var str = `url(data:image/webp;base64,${buffer.toString("base64")})`;
                      value.push(str);
                    }
                  })
                  .finally(()=> jobExec.exec("done-local"));
              }
            });
          } else {
            base64.convert(url)
              .catch(()=> {
                breaks++;
                value.push(`url(${item.data})`);
              })
              .then((buffer)=> {
                if (buffer) {
                  var str = `url(data:image/webp;base64,${buffer.toString("base64")})`;
                  value.push(str);
                }
              })
              .finally(()=> jobExec.exec("done-local"));
          }
        });
        jobExec.exec("finish-local");
      }
    });
    job.exec("finish");
  }
}

export default Webpcss;
