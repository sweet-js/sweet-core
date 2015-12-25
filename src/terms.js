import { List } from "immutable";
import { assert, expect } from "./errors";
import { mixin } from "./utils";
import Syntax from "./syntax";

export default class {
    constructor(type, fields) {
        this.type = type;
        this.loc = null;
        for (let field of Object.keys(fields)) {
            this[field] = fields[field];
        }
    }
}

