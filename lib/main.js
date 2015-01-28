var defaultWebpcss = null;

export default (options, data)=> {
  var pt = !options ? (
    defaultWebpcss || (defaultWebpcss = new Webpcss())
  ) : new Webpcss(options);
  return data ? pt : pt.transform(data);
};

export var Webpcss = require("./Webpcss");
export var WebpBase64 = require("./WebpBase64");

export var postcss = (css)=> {
  return (defaultWebpcss || (defaultWebpcss = new Webpcss())).postcss(css);
};

export var transform = (data, options)=> {
  if(!options){
    return (defaultWebpcss || (defaultWebpcss = new Webpcss())).transform(data);
  } else {
    return (new Webpcss(options)).transform(data);
  }
};
