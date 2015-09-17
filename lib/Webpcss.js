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
      for (const key in DEFAULTS) {
        this.options[key] = opts[key] || DEFAULTS[key];
      }
    }
    this.base64 = new WebpBase64();
  }
  postcss(css, cb) {
    const {options, base64} = this;
    const decls = [];
    css.walkDecls((decl)=> {
      if ((decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0) &&
        decl.value.indexOf("url") >= 0) {
        decls.push(decl);
      }
    });

    const asyncNodes = decls.map((decl)=> {
      let breaks = 0;
      const prop = decl.prop.indexOf("background") === 0 ? "background-image" : decl.prop;
      const selector = decl.parent.selectors.map(
        (sel)=> options.process_selector(sel, options.baseClass)
      ).join(", ");
      const urls = base64.extract(decl.value, true);
      if (!urls.length) { return; }
      const rx = options.replace_from instanceof RegExp ?
                  options.replace_from :
                  new RegExp(rx, "g");
      const asyncUrls = urls.map((item)=> {
        const url = item.data;
        if (item.mimetype === "url" && !options.inline) {
          const src = url.replace(rx, options.replace_to);
          breaks += +(src === url);
          return `url(${src})`;
        } else if (item.mimetype === "url" && options.inline) {
          const urlPath = (url[0] === "/") ?
            /* url(/image.png) abs path */
            libpath.resolve(libpath.join(options.image_root, url)) :
            /* url(../images.png) or url(image.png) - relative css path */
            libpath.resolve(libpath.join(options.css_root, url));
          return fs.readFileAsync(urlPath)
            .then((data)=> {
              return base64.convert(data, options.cwebp_configurator)
                .then((buffer)=> {
                  return buffer && `url(data:image/webp;base64,${buffer.toString("base64")})`;
                })
                .catch(()=> `url(${item.data})`);
            })
            .catch(()=> {
              breaks++;
              return `url(${item.data})`;
            });
        } else {
          return base64.convert(url)
            .then((buffer)=> {
              if (buffer) {
                return `url(data:image/webp;base64,${buffer.toString("base64")})`;
              }
            })
            .catch(()=> {
              breaks++;
              return `url(${item.data})`;
            });
        }
      });
      return PromiseA.all(asyncUrls).then((urls)=> {
        if (breaks !== urls.length) {
          const strvalue = urls.filter((url)=> url).join(",");
          let root = decl.parent;
          let dupRule = cleanNode(root.clone({selector: selector}));
          dupRule.append({prop, value: strvalue, semicolon: true});
          root = root.parent;
          while (root.type !== "root") {
            const dupRoot = cleanNode(root.clone());
            dupRoot.append(dupRule);
            dupRule = dupRoot;
            root = root.parent;
          }
          return dupRule;
        }
      });
    });

    return PromiseA.all(asyncNodes)
      .then((nodes)=> {
        nodes
          .filter((decl)=> decl)
          .forEach((decl)=> css.append(decl));
      })
      .finally(()=> cb());
  }
}

export default Webpcss;
