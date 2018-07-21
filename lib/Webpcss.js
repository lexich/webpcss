"use strict";

/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */

/* eslint no-useless-escape: 0 */

import fileType from "file-type";
import libpath from "path";
import fs, { readFile } from "fs";
import { isFunction } from "lodash";
import WebpBase64 from "./WebpBase64";

function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

const rxHtml = /^html[_\.#\[]{1}/;
const DEFAULTS = {
  webpClass: ".webp",
  noWebpClass: "",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  inline: false /* root path to folder */,
  image_root: "",
  css_root: "",
  minAddClassFileSize: 0,
  resolveUrlRelativeToFile: false,
  copyBackgroundSize: false,
  replaceRemoteImage: true,
  cwebp_configurator: null,
  process_selector(selector, baseClass) {
    if (baseClass) {
      return rxHtml.test(selector) ? selector.replace("html", "html" + baseClass) : baseClass + " " + selector;
    }
    return selector;
  },
};

function deprecate(msg) {
  /* eslint no-console: 0 */
  typeof console !== "undefined" && console.warn && console.warn(msg);
}

function canURLLocalResolve(url) {
  /* url(//foo.com/image.png) or url(http://foo.com/image.png) or url(https://foo.com/image.png) abs path with host */
  return !/^(https?:)?\/\//i.test(url);
}

class Webpcss {
  constructor(opts) {
    if (!opts) {
      this.options = DEFAULTS;
    } else {
      this.options = Object.assign({}, DEFAULTS, opts);
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
    css.walkDecls(decl => {
      if (
        (decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0) &&
        decl.value.indexOf("url") >= 0
      ) {
        asyncNodes[asyncNodes.length] = this.asyncProcessNode(decl);
      }
    });
    return Promise.all(asyncNodes)
      .then(nodes => {
        nodes.filter(decl => decl).forEach(decl => css.append(decl));
        cb();
      })
      .catch(() => cb());
  }

  asyncProcessNode(decl) {
    const { options, base64 } = this;

    function resolveUrlPath(url) {
      let urlPath = url;
      const canLocalResolve = canURLLocalResolve(url);

      if (canLocalResolve) {
        if (url[0] === "/") {
          /* url(/image.png) abs path */
          urlPath = libpath.resolve(libpath.join(options.image_root, url));
        } else {
          /* url(../images.png) or url(image.png) - relative css path */
          const { resolveUrlRelativeToFile } = options;
          if (options.css_root || !resolveUrlRelativeToFile) {
            urlPath = libpath.resolve(libpath.join(options.css_root, url));
          } else if (resolveUrlRelativeToFile) {
            // resolve relative path automatically
            const input = decl.source.input;
            if (input && input.file) {
              const file = input.file;
              urlPath = libpath.resolve(libpath.join(libpath.dirname(file), url));
            } else {
              console.warn(`Source input not found: ${url}`);
            }
          }
        }
      }
      return {
        urlPath,
        canLocalResolve,
      };
    }

    let breaks = 0;
    const selector = decl.parent.selectors.map(sel => options.process_selector(sel, options.webpClass)).join(", ");
    const urls = base64.extract(decl.value, true);
    if (!urls.length) {
      return;
    }
    const rx = options.replace_from instanceof RegExp ? options.replace_from : new RegExp(options.replace_from, "g");
    const asyncUrls = urls.map(item => {
      const url = item.data;
      const { minAddClassFileSize } = options;
      if (item.mimetype === "url") {
        let shouldAddClass = true;

        if (minAddClassFileSize > 0) {
          const { urlPath, canLocalResolve } = resolveUrlPath(url);

          if (canLocalResolve) {
            try {
              const fileSize = fs.statSync(urlPath).size;
              if (fileSize < minAddClassFileSize) {
                shouldAddClass = false;
              }
            } catch (e) {
              console.warn(`Analyze file ${urlPath} size failed`, e);
            }
          }
        }

        if (!options.inline) {
          const { replace_to: replaceTo } = options;
          let src = url;

          if (shouldAddClass) {
            const { replaceRemoteImage } = options;
            if (replaceRemoteImage || canURLLocalResolve(url)) {
              src = isFunction(replaceTo)
                ? replaceTo({
                    url,
                  })
                : url.replace(rx, replaceTo);
            }
          }
          breaks += +(src === url);
          return `url(${src})`;
        } else {
          // eslint-disable-next-line no-lonely-if
          if (shouldAddClass) {
            const { urlPath, canLocalResolve } = resolveUrlPath(url);

            if (canLocalResolve) {
              return readFileAsync(urlPath)
                .then(data =>
                  base64
                    .convert(data, options.cwebp_configurator)
                    .then(buffer => buffer && `url(data:image/webp;base64,${buffer.toString("base64")})`)
                    .catch(() => `url(${item.data})`)
                )
                .catch(() => {
                  breaks += 1;
                  return `url(${item.data})`;
                });
            } else {
              breaks += 1;
              return `url(${item.data})`;
            }
          } else {
            breaks += 1;
            return `url(${item.data})`;
          }
        }
      } else {
        const buffer = url instanceof Buffer ? url : new Buffer(url, "base64");

        let shouldAddClass = true;
        const { ext } = fileType(buffer);
        // Unsupported types guarding
        if (!/png|jpg|jpeg|gif/i.test(ext)) {
          shouldAddClass = false;
        } else if (minAddClassFileSize > 0) {
          if (Buffer.byteLength(buffer) < minAddClassFileSize) {
            shouldAddClass = false;
          }
        }

        if (shouldAddClass) {
          return base64
            .convert(url)
            .then(buffer => {
              if (buffer) {
                return `url(data:image/webp;base64,${buffer.toString("base64")})`;
              }
            })
            .catch(() => {
              breaks += 1;
              return `url(${item.data})`;
            });
        } else {
          breaks += 1;
          return `url(${item.data})`;
        }
      }
    });
    return Promise.all(asyncUrls).then(urls => {
      if (breaks !== urls.length) {
        const originalRule = decl.parent;
        const { copyBackgroundSize } = options;

        if (options.noWebpClass) {
          // add .no-webp
          const selectorNoWebP = originalRule.selectors
            .map(sel => options.process_selector(sel, options.noWebpClass))
            .join(", ");

          const noWebpRule = Webpcss.formatRule(originalRule.cloneBefore({ selector: selectorNoWebP }));

          decl.raws.before = " ";
          decl.moveTo(noWebpRule);
        }

        // add .webp
        const value = decl.value
          .split(" ")
          .map(val => (val.indexOf("url") >= 0 ? val.replace(/(url)\(.*\)/, urls.shift()) : val))
          .join(" ");

        const webpRule = Webpcss.formatRule(originalRule.clone({ selector }));

        const webpDecl = decl.clone({ prop: decl.prop, value });
        webpDecl.raws.semicolon = true;
        webpDecl.raws.before = " ";

        webpRule.append(webpDecl);
        const webpTreeRule = Webpcss.appendToCopyTree(originalRule.parent, webpRule);

        originalRule.walkDecls(decl => {
          if (copyBackgroundSize) {
            if (decl.prop === "background-size") {
              webpRule.append(decl.clone());
            }
          }
        });

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
      rule = root
        .clone()
        .removeAll()
        .append(rule);
      root = root.parent;
    }
    return rule;
  }

  static formatRule(rule, isRemove = true) {
    rule.raws.semicolon = true;
    rule.raws.after = " ";
    return isRemove ? rule.removeAll() : rule;
  }
}

export default Webpcss;
