#lang "../../macros/stxcase.js";

import { id as identity } from "./id.js";

var expect = require("expect.js");


describe("renaming import", function() {

    it("rename a single import", function() {
        expect(identity(42)).to.be(42);
    });

});
