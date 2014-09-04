#lang "js";
import { * } from "../../macros/stxcase.js";
import { id } from "./id.js";   // module also exports `di`

var expect = require("expect.js");

describe("importing modules", function() {

    it("should not make exports that were not imported available", function() {
        expect(id(42)).to.be(42);
        expect(function() {
            return di(42);
        }).to.throwError();
    });
});
