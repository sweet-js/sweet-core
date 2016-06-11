"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gensym = gensym;
let internedMap_746 = new Map();
let counter_747 = 0;
function gensym(name_750) {
  let prefix_751 = name_750 == null ? "s_" : name_750 + "_";
  let sym_752 = new Symbol_748(prefix_751 + counter_747);
  counter_747++;
  return sym_752;
}
function Symbol_748(name_753) {
  this.name = name_753;
}
Symbol_748.prototype.toString = function () {
  return this.name;
};
function makeSymbol_749(name_754) {
  if (internedMap_746.has(name_754)) {
    return internedMap_746.get(name_754);
  } else {
    let sym = new Symbol_748(name_754);
    internedMap_746.set(name_754, sym);
    return sym;
  }
}
exports.Symbol = makeSymbol_749;
exports.SymbolClass = Symbol_748;