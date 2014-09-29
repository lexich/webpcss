/*
 * grunt-webpcss
 * https://github.com/lexich/webpcss-transform
 *
 * Copyright (c) 2014 Efremov Alexey
 * Licensed under the MIT license.
 */
'use strict';

var postcss = require("postcss");
var _ = require("lodash");

function Webpcss(opts){
  this.options = _.defaults(opts || {}, {
    baseClass: ".webp",
    replace_from: /\.(png|jpg|jpeg)/g,
    replace_to: ".webp"
  });
  this.postcss = Webpcss.prototype.postcss.bind(this);
}

Webpcss.prototype.postcss = function (css){
  var nodes = [];
  var options = this.options;
  css.eachDecl(function(decl, data) {
    if(decl.prop.indexOf("background") === 0 && decl.value.indexOf("url") >= 0 ){
      var selector = _.map(decl.parent.selectors, function(sel, i){
        return options.baseClass + " " + sel;
      }).join(", ");
      var rx = _.isRegExp(options.replace_from) ? options.replace_from : new RegExp(rx, "g");
      var value = decl.value.replace(rx, options.replace_to);
      if(value === decl.value){ return; }
      var prop = decl.prop;
      if( value.indexOf(",") === -1 && /url[ ]*\((.+)\)/g.exec(value) ){
        value = "url(" + RegExp.$1 + ")";
        prop = "background-image";
      }
      var new_decl = decl.parent.clone({selector: selector});
      new_decl.each(function (decl, i) { new_decl.remove(i); });
      new_decl.append({prop: prop, value: value, semicolon: true});
      nodes.push(new_decl);
    }
  });
  nodes.forEach(function(decl){ css.append(decl); });
};

function transform (data, options){
  var webpcss = new Webpcss(options);
  return postcss(webpcss.postcss).process(data).css;
}

module.exports.Webpcss = Webpcss;
module.exports.transform = transform;
module.exports.webpcss = new Webpcss();
