var parser = require("../build/lib/parser");
var expander = require("../build/lib/expander");
var expect = require("expect.js");

var enforest = expander.enforest;
var read = parser.read;
var expand = expander.expand;
var flatten = expander.flatten;

var makeExpanderContext = expander.makeExpanderContext;

describe("enforest", function() {
    it("should enforest a single ident", function() {
        var res = enforest(read("x"), makeExpanderContext());
        expect(res.result.id.token.value).to.be("x");
    });

    it("should enforest a macro definition", function() {
        var res = enforest(read("macro id { case $x => { $x } } fun"), makeExpanderContext());
        expect(res.result.name[0].token.value).to.be("id");
        expect(res.result.body.length).to.be(4);
        expect(res.rest[0].token.value).to.be("fun")
    });

    it("should enforest a function declaration", function() {
        var res = enforest(read("function id (x) { return x; }"), makeExpanderContext());
        expect(res.result.name.token.value).to.be("id");
        expect(res.result.params.token.inner[0].token.value).to.be("x");
    });

    it("should enforest a VarStatement", function() {
        var res = enforest(read("var x, y"), makeExpanderContext());
        expect(res.result.decls.length).to.be(2);
    });

    // Currently disabled because it requires --harmony mode
    // it("should maintain let hygiene when enforesting an expression with ASI", function() {
    //     'use strict';
    //     let a = 1 // No semicolons
    //     let b = 2 
    //     function test() {
    //         // If the bug is present, this is a ReferenceError
    //         return b;
    //     }
    //     expect(test()).to.be(2);
    // });
});

