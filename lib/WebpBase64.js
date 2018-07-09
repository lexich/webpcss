"use strict";

/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2015 Efremov Alexey
 * Licensed under the MIT license.
 */

/* eslint class-methods-use-this: 0 */

import urldata from "urldata";
import { CWebp } from "cwebp";

const webpBinPath = require("webp-converter/cwebp")();

const base64pattern = "data:";
const base64patternEnd = ";base64,";

class WebpBase64 {
  extract(value, isUrl) {
    const result = [];
    if (!!isUrl) {
      const data = urldata(value);
      for (let i = 0; i < data.length; i+=1) {
        /* eslint no-continue: 0 */
        if (!data[i]) { continue; }
        result[result.length] = WebpBase64.extractor(data[i], isUrl);
      }
    } else {
      const res = WebpBase64.extractor(value, isUrl);
      if (res) {
        result[result.length] = res;
      }
    }
    return result;
  }

  convert(data, fConfig) {
    const buffer = (data instanceof Buffer) ? data : Buffer.from(data, "base64");
    const encoderBase = new CWebp(buffer, webpBinPath);
    const encoder = fConfig ? fConfig(encoderBase) : encoderBase;
    return encoder.toBuffer();
  }

  static extractor(value) {
    if (!value) { return; }
    const base64pos = value.indexOf(base64pattern);
    if (base64pos >= 0) {
      const base64posEnd = value.indexOf(base64patternEnd);
      if (base64posEnd < 0) { return { mimetype: "url", data: value }; }
      const mimetype = value.slice(base64pos + base64pattern.length, base64posEnd);
      const data = value.slice(base64posEnd + base64patternEnd.length);
      return { mimetype, data };
    } else {
      return { mimetype: "url", data: value };
    }
  }
}

export default WebpBase64;
