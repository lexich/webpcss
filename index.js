/*
 * grunt-webpcss
 * https://github.com/lexich/webpcss-transform
 *
 * Copyright (c) 2014 Efremov Alexey
 * Licensed under the MIT license.
 */
'use strict';

var postcss = require('postcss');
var _ = require('lodash');

function processor (_options){
  var options = _.defaults(_options || {},{
    baseClass: ".webp",
    replace_from: /\.(png|jpg|jpeg)/,
    replace_to: ".webp"
  });
  return function (css){
    var nodes = [];
    css.eachDecl(function(decl, data) {
      if(decl.prop.indexOf("background") === 0 && decl.value.indexOf("url") >= 0 ){
        var selector = "";
        for(var index in decl.parent.selectors){
          if(!!selector){ selector += ", "; }
          selector += options.baseClass + " " + decl.parent.selectors[index].trim();
        }
        var rx = options.replace_from;
        if(!_.isRegExp(options.replace_from)){ rx = new RegExp(rx); }
        var value = decl.value.replace(rx,options.replace_to);
        if(value === decl.value){ return; }
        var prop = decl.prop;
        if( value.indexOf(",") === -1 && /url[ ]*\((.+)\)/g.exec(value) ){
          value = "url(" + RegExp.$1 + ")";
          prop = "background-image";
        }
        var new_decl = decl.parent.clone({selector: selector});
        new_decl.each(function (decl, i) {
            new_decl.remove(i);
        });
        new_decl.append({
          prop:prop,
          value: value,
          semicolon: true
        });
        nodes.push(new_decl);
      }
    });
    for(var n=0; n < nodes.length; n++){
      css.append(nodes[n]);
    }
  };
}

function transform (data, options){
  return postcss(processor(options)).process(data).css;
}

module.exports.processor = processor;
module.exports.transform = transform;
