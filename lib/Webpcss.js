var postcss = require("postcss"),
    WebpBase64 = require("./WebpBase64");

var rxHtml = /^html[_\.#\[]{1}/;
var DEFAULTS = {
  baseClass: ".webp",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  bin: "convert",
  process_selector: function(selector, baseClass){
    return rxHtml.test(selector) ? (
      selector.replace("html", "html" + baseClass)
    ) : baseClass + " " + selector;
  }
};

function Webpcss(opts){
  if(!opts){
    this.options = DEFAULTS;
  } else {
    this.options = {};
    for(var key in DEFAULTS){
      this.options[key] = opts[key] || DEFAULTS[key];
    }
  }
  this.postcss = Webpcss.prototype.postcss.bind(this);
  this.base64 = new WebpBase64(this.options.bin);
}

Webpcss.prototype.postcss = function (css){
  var nodes = [];
  var options = this.options;
  var base64 = this.base64;
  css.eachDecl(function(decl, data) {
    if(decl.prop.indexOf("background") === 0 && decl.value.indexOf("url") >= 0 ){
      var selector = "";
      decl.parent.selectors.forEach(function(sel){
        if(!!selector){ selector += ", "; }
        selector += options.process_selector(sel, options.baseClass);
      });

      var urls = base64.extract(decl.value, true);
      if(!urls.length){ return; }

      var rx = options.replace_from instanceof RegExp ? options.replace_from : new RegExp(rx, "g");
      var prop = "background-image";

      var value = [];
      var breaks = 0;

      urls.forEach(function(item){
        var url = item.data;
        if(item.mimetype === "url"){
          var src = url.replace(rx, options.replace_to);
          breaks += +(src === url);
          value.push("url(" + src + ")");
        } else {
          /* mute convert base64 to webp/base64 */
          //var file = base64.convert(item);
          //if(!file.stderr){
          //  value.push(
          //    "url(data:image/webp;base64," + file.stdout.toString("base64") + ")"
          //  );
          //} else {
            breaks++;
            value.push("url(" + item.data + ")");
          //}
        }
      });
      if(breaks === urls.length){ return; }
      value = value.join(",");

      var new_decl = decl.parent.clone({selector: selector});
      new_decl.each(function (decl, i) { new_decl.remove(i); });
      new_decl.append({prop: prop, value: value, semicolon: true});
      nodes.push(new_decl);
    }
  });
  nodes.forEach(function(decl){ css.append(decl); });
};

Webpcss.prototype.transform =  function(data){
  return postcss(this.postcss).process(data).css;
};

module.exports = Webpcss;
