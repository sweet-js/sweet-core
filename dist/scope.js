"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

let scopeIndex_561 = 0;
function freshScope() {
  let name_562 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex_561++;
  return (0, _symbol.Symbol)(name_562 + "_" + scopeIndex_561);
}
;
function Scope(name_563) {
  return (0, _symbol.Symbol)(name_563);
}