let internedMap = new Map();

let counter = 0;

export function gensym(name) {
  let prefix = name == null ? "s_" : name + "_";
  let sym = new Symbol(prefix + counter);
  counter++;
  return sym;
}

function Symbol(name) {
  this.name = name;
}
Symbol.prototype.toString = function () {
  return this.name;
};

function makeSymbol(name) {
  if (internedMap.has(name)) {
    return internedMap.get(name);
  } else {
    let sym = new Symbol(name);
    internedMap.set(name, sym);
    return sym;
  }
}

export {
  makeSymbol as Symbol,
  Symbol as SymbolClass
};
