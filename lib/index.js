/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */

"use strict";

import postcss from "postcss";
import Webpcss from "./Webpcss";

let defaultWebpcss = null;

const plugin = postcss.plugin("webpcss", options => {
  const pt = options ? new Webpcss(options) : defaultWebpcss || (defaultWebpcss = new Webpcss());
  return css =>
    new Promise((resolve, reject) => pt.postcss(css, (err, data) => (err ? reject(err, data) : resolve(data))));
});

export default plugin;

export function transform(data, options, processOptions) {
  return postcss([plugin(options)]).process(data, processOptions);
}
