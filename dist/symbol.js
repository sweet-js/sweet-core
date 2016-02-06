"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gensym = gensym;
var internedMap = new Map();

var counter = 0;

function gensym(name) {
  var prefix = name == null ? "s_" : name + "_";
  var sym = new _Symbol(prefix + counter);
  counter++;
  return sym;
}

function _Symbol(name) {
  this.name = name;
}
_Symbol.prototype.toString = function () {
  return this.name;
};

function makeSymbol(name) {
  if (internedMap.has(name)) {
    return internedMap.get(name);
  } else {
    var sym = new _Symbol(name);
    internedMap.set(name, sym);
    return sym;
  }
}

exports.Symbol = makeSymbol;
exports.SymbolClass = _Symbol;
//# sourceMappingURL=symbol.js.map
