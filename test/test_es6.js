"use strict";
var expect = require("expect.js");

describe("es6 support", function() {
    it("basic let should work", function() {
    	let x = 1;
    	expect(x).to.be(1);
    });

    it("should support let's temporal dead-zone", function() {
        function foo() {
            return a;
        }
        function bar() {
            b;
            let b = 12;
        }
        let a = 42;
        expect(foo()).to.be(42);
        expect(bar).to.throwException(function(e) {
            expect(e).to.be.a(ReferenceError);
        });
    });
});
