var parser = require("../build/lib/parser");
var expander = require("../build/lib/expander");
var expect = require("expect.js");

var read = parser.read;
var expand = expander.expand;
var flatten = expander.flatten;
var expand = expander.expand;

var makeExpanderContext = expander.makeExpanderContext;

describe("expand", function() {
    it("should expand a var inside a block with no semicolon", function() {
        var res = expand(read("{var x = 42}"));
        expect(res.length).to.be(7);
    });
});

