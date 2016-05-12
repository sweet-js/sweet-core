import { Enforester } from "../src/enforester";
import { List } from "immutable";
import { readAsTerms as read } from "../src/sweet";
import { expr, stmt, testParse } from "./assertions";
import Reader from "../src/shift-reader";
import expect from "expect.js";
import test from 'ava';

function mkEnf(code) {
  let reader = new Reader(code);
  let stxl = reader.read();
  return new Enforester(stxl, List(), {});
}


test("should handle zero formal parameters", t => {
  let enf = mkEnf("");
  let p = enf.enforestFormalParameters();
  t.is(p.items.size, 0);
});

test("should handle a single formal parameter", function () {
  let enf = mkEnf("a");
  let p = enf.enforestFormalParameters();
  expect(p.items.size).to.be(1);
});

test("should handle two formal parameters", function () {
  let enf = mkEnf("a, b");
  let p = enf.enforestFormalParameters();
  expect(p.items.size).to.be(2);
});

// technically wrong but I'm hopful
test("should handle a trailing comma formal parameters", function () {
  let enf = mkEnf("a, b,");
  let p = enf.enforestFormalParameters();
  expect(p.items.size).to.be(2);
});
