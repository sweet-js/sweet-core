#lang "../../macros/stxcase.js";

import id from "./export_default_id";

var expect = require("expect.js");


describe("default import", function() {

    it("should import the identity", function() {
        expect(id(42)).to.be(42);
    });

});
