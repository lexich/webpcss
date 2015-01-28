var postcss = require("postcss"),
    WebpBase64 = require("./WebpBase64");

let rxHtml = /^html[_\.#\[]{1}/;
let DEFAULTS = {
  baseClass: ".webp",
  replace_from: /\.(png|jpg|jpeg)/g,
  replace_to: ".webp",
  bin: "convert",
  process_selector: (selector, baseClass)=> {
    return rxHtml.test(selector) ? (
      selector.replace("html", `html${baseClass}`)
    ) : baseClass + " " + selector;
  }
};

export default class Webpcss {
  constructor(opts){
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
  postcss(css){
    var nodes = [];
    var {options, base64} = this;
    css.eachDecl((decl, data)=>{
      if((decl.prop.indexOf("background") === 0 || decl.prop.indexOf("border-image") === 0 )
        && decl.value.indexOf("url") >= 0 )
      {

        var prop = decl.prop.indexOf("background") === 0 ? "background-image" : decl.prop;
        var selector = "";
        decl.parent.selectors.forEach((sel)=>{
          if(!!selector){ selector += ", "; }
          selector += options.process_selector(sel, options.baseClass);
        });

        var urls = base64.extract(decl.value, true);
        if(!urls.length){ return; }

        var rx = options.replace_from instanceof RegExp ? options.replace_from : new RegExp(rx, "g");

        var value = [];
        var breaks = 0;

        urls.forEach((item)=>{
          var url = item.data;
          if(item.mimetype === "url"){
            var src = url.replace(rx, options.replace_to);
            breaks += +(src === url);
            value.push(`url(${src})`);
          } else {
            /* mute convert base64 to webp/base64 */
            //var file = base64.convert(item);
            //if(!file.stderr){
            //  value.push(
            //    "url(data:image/webp;base64," + file.stdout.toString("base64") + ")"
            //  );
            //} else {
              breaks++;
              value.push(`url(${item.data})`);
            //}
          }
        });
        if(breaks === urls.length){ return; }
        value = value.join(",");

        var root = decl.parent;
        var dupRule = Webpcss.cleanNode(root.clone({selector: selector}));
        dupRule.append({prop: prop, value: value, semicolon: true});

        root = root.parent;
        while(root.type !== "root") {
          var dupRoot = Webpcss.cleanNode(root.clone());
          dupRoot.append(dupRule);
          dupRule = dupRoot;
          root = root.parent;
        }
        nodes.push(dupRule);
      }
    });
    nodes.forEach( (decl)=> css.append(decl) );
  }
  transform(data){
    return postcss(this.postcss).process(data).css;
  }
  static cleanNode (node) {
    node.each((decl, i)=> node.remove(i));
    return node;
  }
}
