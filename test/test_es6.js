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

    it("should expand macros in a let statement", function() {
        macro m {
            rule { } => { 42 }
        }
        let f = function() { return m; }
        expect(f()).to.be(42);
    });

    it("should expand macros in a const statement", function() {
        macro m {
            rule { } => { 42 }
        }
        const f = function() { return m; }
        expect(f()).to.be(42);
    });

    it("should support generators", function() {
        function* first() {
            yield 1;
        }
        function* id() {
            while(true) {
                yield* first();
            }
        }
        var gen = id();
        expect(gen.next().value).to.be(1);
        expect(gen.next().value).to.be(1);
    });

});
