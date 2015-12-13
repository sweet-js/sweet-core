/* @flow */

let internedMap = new Map();

let counter = 0;

type SymbolObject = {
    name: string
};

export function gensym(name: ?string): SymbolObject {
    let prefix = name == null ? "s" : name;
    let sym = new Symbol(prefix + counter);
    counter++;
    return sym;
}

function Symbol(name: string) {
    this.name = name;
}
Symbol.prototype.toString = function() {
    return "@" + this.name;
};


function mkSymbol(name: string): SymbolObject {
    if (internedMap.has(name)) {
        return internedMap.get(name);
    } else {
        let sym = new Symbol(name);
        internedMap.set(name, sym);
        return sym;
    }
}

export {
    mkSymbol as Symbol
};
