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
    css.eachDecl(function(rule, data) {
    if(rule.prop.indexOf("background") === 0 && rule._value.indexOf("url") >= 0 ){
      var selector = "";
      var selectors = rule.parent.selector.split(',');
      for(var index in selectors){
        if(!!selector){ selector += ", "; }
        selector += options.baseClass + " " + selectors[index].trim();
      }
      var rx = options.replace_from;
      if(!_.isRegExp(options.replace_from)){ rx = new RegExp(rx); }
      var value = rule._value.replace(rx,options.replace_to);
      var prop = rule.prop;
      if( value.indexOf(",") === -1 && /url[ ]*\((.+)\)/g.exec(value) ){
        value = "url(" + RegExp.$1 + ");";
        prop = "background-image";
      }
      var new_rule = postcss.rule({selector:selector});
      new_rule.append({
        prop:prop,
        value: value
      });
      nodes.push(new_rule);
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
