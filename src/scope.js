import stampit from "stampit";
import { expect, assert } from "./errors";

let scopeIndex = 0;

export default class Scope {
    constructor(bindings, name) {
        assert(bindings, "must pass in the bindings object");
        let prefix = name == null ? "s" : name;

        // name is just for debugging, comparison of scopes is by object identity
        this.name = prefix + scopeIndex++;
        // each scope has a reference to the global binding map
        // (for efficiency we might to just store the relevant bindings)
        this.bindings = bindings;
    }
    toString() {
        return this.name;
    }
}
