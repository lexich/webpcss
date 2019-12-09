"use strict";

/* global describe, it */
/* eslint no-var: 0, import/no-extraneous-dependencies: 0 */

import { expect } from "chai";
import Promise from "es6-promise";

import WebpBase64 from "../lib/WebpBase64";
import base64stub from "./fixtures/base64";

Promise.polyfill();
describe("base64", () => {
  var base64 = new WebpBase64();

  it("test base64 data", () => {
    expect(Buffer.from(base64stub.png_base64, "base64").toString()).to.eql(base64stub.png_bin.toString());
  });

  it("extract png", () => {
    var png = "data:image/png;base64,iVBORw";
    var urlPng = "url(" + png + ")";
    var res = base64.extract(png);
    expect(res)
      .to.be.instanceof(Array)
      .and.have.lengthOf(1);
    expect([{ mimetype: "image/png", data: "iVBORw" }]).to.eql(res);

    res = base64.extract(urlPng, true);
    expect(res)
      .to.be.instanceof(Array)
      .and.have.lengthOf(1);
    expect([{ mimetype: "image/png", data: "iVBORw" }]).to.eql(res);

    res = base64.extract(base64stub.png_uri);
    expect(res)
      .to.be.instanceof(Array)
      .and.have.lengthOf(1);
    expect([{ mimetype: "image/png", data: base64stub.png_base64 }]).to.eql(res);

    res = base64.extract(base64stub.png_css, true);
    expect(res)
      .to.be.instanceof(Array)
      .and.have.lengthOf(1);
    expect([{ mimetype: "image/png", data: base64stub.png_base64 }]).to.eql(res);
  });

  it("extract svg", () => {
    var res = WebpBase64.extractor(base64stub.svg_content_uri);
    expect(res.mimetype).to.be.eql("image/svg+xml");
    expect(decodeURIComponent(res.data)).to.be.eql(base64stub.svg_content);

    res = WebpBase64.extractor(base64stub.svg_base64_uri);
    expect(res.mimetype).to.be.eql("image/svg+xml");
    expect(res.data.toString("base64")).to.be.eql(base64stub.svg_base64);
  });

  it("extract multiple png", () => {
    var png = "data:image/png;base64,iVBORw";
    var urlPng2 = "url(" + png + "), url(" + png + ")";
    var res = base64.extract(urlPng2, true);
    expect(res).to.be.ok;
  });

  it("extract breaking data", () => {
    expect([{ mimetype: "_image/png", data: "iVBORw" }]).to.eql(base64.extract("data:_image/png;base64,iVBORw"));

    expect([{ mimetype: "url", data: "data_:image/png;base64,iVBORw" }]).to.eql(
      base64.extract("data_:image/png;base64,iVBORw")
    );

    expect([{ mimetype: "url", data: "data:image/png;base64iVBORw" }]).to.throw;
  });

  it("test convert data with node-webp png", () =>
    base64
      .convert(base64stub.png_bin)
      .catch(err => expect(err).to.not.exist)
      .done(buffer => {
        expect(buffer).to.be.instanceof(Buffer);
        expect(buffer).to.be.eql(base64stub.webp);
      }));

  it("test convert data with node-webp jpg", () =>
    base64
      .convert(base64stub.jpg_bin)
      .catch(err => expect(err).to.not.exist)
      .done(buffer => {
        expect(buffer).to.be.instanceof(Buffer);
        expect(buffer).to.be.eql(base64stub.webp_jpg_bin);
      }));
});
