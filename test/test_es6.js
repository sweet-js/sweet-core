"use strict";
var expect = require("expect.js");

describe("es6 support", function() {
    it("basic let should work", function() {
    	let x = 1;
    	expect(x).to.be(1);
    });
});