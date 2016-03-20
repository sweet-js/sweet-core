"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

var scopeIndex_433 = 0;function freshScope() {
  var name_434 = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];
  scopeIndex_433++;return (0, _symbol.Symbol)(name_434 + "_" + scopeIndex_433);
};function Scope(name_435) {
  return (0, _symbol.Symbol)(name_435);
}
//# sourceMappingURL=scope.js.map
