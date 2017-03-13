// @flow
let internedMap: Map<string, Symbol> = new Map();

let counter = 0;

export function gensym(name: string) {
  let prefix = name == null ? 's_' : name + '_';
  let sym = new Symbol(prefix + counter);
  counter++;
  return sym;
}

class Symbol {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
  toString() {
    return this.name;
  }
}

function makeSymbol(name: string): Symbol {
  let s = internedMap.get(name);
  if (s) {
    return s;
  } else {
    let sym = new Symbol(name);
    internedMap.set(name, sym);
    return sym;
  }
}

export { makeSymbol as Symbol, Symbol as SymbolClass };
