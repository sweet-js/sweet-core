var expect = require("expect.js")
var parser = require("../lib/parser");
var expander = require("../lib/expander");

// load all the "private" expander names (stored in _test)
// into the global scope for cleaner testing
Object.keys(expander._test).forEach(function(val) {
    global[val] = expander._test[val];
});

// extract the token values from a token array
function tokValues (stxArray) {
    return stxArray.map(function(el) {
        return el.token.value;
    })
}

describe("matchPatternClass", function() {
    it("should give null when pattern doesn't match", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("ident", stx, {}).result;

        expect(res).to.be(null);
    });

    it("should match a single token", function() {
        var stx = parser.read("foo bar");
        var res = matchPatternClass("token", stx, {}).result;

        expect(tokValues(res)).to.eql(["foo"]);
    });

    it("should match a single delimited token", function() {
        var stx = parser.read("(foo) bar");
        var res = matchPatternClass("token", stx, {}).result;

        expect(tokValues(res)).to.eql(["()"]);
        expect(tokValues(res[0].token.inner)).to.eql(["foo"]);
    });

    it("should match a lit", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("lit", stx, {}).result;

        expect(tokValues(res)).to.eql([42]);
    });

    it("should match an ident", function() {
        var stx = parser.read("foo");
        var res = matchPatternClass("ident", stx, {}).result;

        expect(tokValues(res)).ot.eql(["foo"]);
    });

    it("should match a binary expression", function() {
        var stx = parser.read("2+2");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql([2, "+", 2]);
    });

    it("should match a complex binary expression", function() {
        var stx = parser.read("2+2*10/32");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql([2, "+", 2, "*", 10, "/", 32]);
    });
});