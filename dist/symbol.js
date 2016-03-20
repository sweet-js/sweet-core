"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gensym = gensym;
var internedMap_536 = new Map();var counter_537 = 0;function gensym(name_540) {
  var prefix_541 = name_540 == null ? "s_" : name_540 + "_";var sym_542 = new Symbol_538(prefix_541 + counter_537);counter_537++;return sym_542;
}function Symbol_538(name_543) {
  this.name = name_543;
}Symbol_538.prototype.toString = function () {
  return this.name;
};function makeSymbol_539(name_544) {
  if (internedMap_536.has(name_544)) {
    return internedMap_536.get(name_544);
  } else {
    var sym = new Symbol_538(name_544);internedMap_536.set(name_544, sym);return sym;
  }
}exports.Symbol = makeSymbol_539;
exports.SymbolClass = Symbol_538;
//# sourceMappingURL=symbol.js.map
