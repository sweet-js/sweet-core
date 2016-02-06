"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.freshScope = freshScope;
exports.Scope = Scope;

var _errors = require("./errors");

var _symbol = require("./symbol");

var scopeIndex = 0;

function freshScope() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? "scope" : arguments[0];

  scopeIndex++;
  return (0, _symbol.Symbol)(name + "_" + scopeIndex);
};

function Scope(name) {
  return (0, _symbol.Symbol)(name);
}
//# sourceMappingURL=scope.js.map
