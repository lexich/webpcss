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
import {readFile} from "fs";

function readFileAsync(path) {
  return new Promise((resolve, reject)=> {
    readFile(path, (err, data)=> err ? reject(err) : resolve(data));
  });
}

const rxHtml = /^html[_\.#\[]{1}/;
const DEFAULTS = {
  webpClass: ".webp",
  noWebpClass: "",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  inline: false, /* root path to folder */
  image_root: "",
  css_root: "",
  cwebp_configurator: null,
  process_selector(selector, baseClass) {
    if (baseClass) {
      return rxHtml.test(selector) ? (
        selector.replace("html", "html" + baseClass)
      ) : baseClass + " " + selector;
    }
    return selector;
  }
};

function deprecate(msg) {
  /* eslint no-console: 0*/
  typeof console !== "undefined" && console.warn && console.warn(msg);
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
      if (opts.baseClass) {
        this.options.webpClass = opts.baseClass;
        delete opts.baseClass;
        deprecate("Option `baseClass` is deprecated. Use webpClass instead.");
      }
    }
    this.base64 = new WebpBase64();
  }
  postcss(css, cb) {
    const asyncNodes = [];
    css.walkDecls((decl)=> {
      if ((decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0) &&
        decl.value.indexOf("url") >= 0) {
        asyncNodes[asyncNodes.length] = this.asyncProcessNode(decl);
      }
    });
    return Promise.all(asyncNodes)
      .then((nodes)=> {
        nodes
          .filter((decl)=> decl)
          .forEach((decl)=> css.append(decl));
        cb();
      })
      .catch(()=> cb());
  }
  asyncProcessNode(decl) {
    const {options, base64} = this;
    let breaks = 0;
    const selector = decl.parent.selectors.map(
      (sel)=> options.process_selector(sel, options.webpClass)
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
        return readFileAsync(urlPath)
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
    return Promise.all(asyncUrls).then((urls)=> {
      if (breaks !== urls.length) {
        const originalRule = decl.parent;

        if (options.noWebpClass) {
          // add .no-webp
          const selectorNoWebP = originalRule.selectors.map(
            (sel)=> options.process_selector(sel, options.noWebpClass)
          ).join(", ");

          const noWebpRule = Webpcss.formatRule(
            originalRule.cloneBefore({ selector: selectorNoWebP }));

          decl.raws.before = " ";
          decl.moveTo(noWebpRule);
        }

        // add .webp
        const value = decl.value.split(" ").map(
          (val)=> val.indexOf("url") >= 0 ?
            val.replace(/(url)\(.*\)/, urls.shift()) :
            val
        ).join(" ");

        const webpRule = Webpcss.formatRule(
          originalRule.clone({ selector }));

        const webpDecl = decl.clone({prop: decl.prop, value });
        webpDecl.raws.semicolon = true;
        webpDecl.raws.before = " ";

        webpRule.append(webpDecl);
        const webpTreeRule = Webpcss.appendToCopyTree(originalRule.parent, webpRule);

        // clean if original rule is empty
        !originalRule.nodes.length && originalRule.remove();
        return webpTreeRule;
      }
    });
  }
  static appendToCopyTree(aRoot, aRule) {
    let root = aRoot;
    let rule = aRule;
    while (root.type !== "root") {
      rule = root.clone().removeAll().append(rule);
      root = root.parent;
    }
    return rule;
  }
  static formatRule(rule, isRemove=true) {
    rule.raws.semicolon = true;
    rule.raws.after = " ";
    return isRemove ? rule.removeAll() : rule;
  }
}

export default Webpcss;
