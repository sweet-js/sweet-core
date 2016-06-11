"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

let EMPTY_332;
class ListCollector {
  constructor(x_333) {
    this.value = x_333;
  }
  static empty() {
    return EMPTY_332;
  }
  concat(a_334) {
    return new ListCollector(this.value.concat(a_334.value));
  }
  extract() {
    return this.value;
  }
}
exports.default = ListCollector;
EMPTY_332 = new ListCollector((0, _immutable.List)());