import stampit from "stampit";
import { expect, assert } from "./errors";

let scopeIndex = 0;

export default class Scope {
    constructor(bindings) {
        assert(bindings, "must pass in the bindings object");

        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex++;
        // each scope has a reference to the global binding map
        // (for efficiency we might to just store the relevant bindings)
        this.bindings = bindings;
    }
    toString() {
        return this.name;
    }
}
