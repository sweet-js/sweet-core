var expect = require("expect.js");
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
    });
}



var emptyMacroMap = new Map();

describe("matchPatternClass", function() {
    it("should give null when pattern doesn't match", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("ident", stx, emptyMacroMap).result;

        expect(res).to.be(null);
    });

    it("should match a single token", function() {
        var stx = parser.read("foo bar");
        var res = matchPatternClass("token", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["foo"]);
    });

    it("should match a single delimited token", function() {
        var stx = parser.read("(foo) bar");
        var res = matchPatternClass("token", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["()"]);
        expect(tokValues(res[0].token.inner)).to.eql(["foo"]);
    });

    it("should match a lit", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("lit", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql([42]);
    });

    it("should match an ident", function() {
        var stx = parser.read("foo");
        var res = matchPatternClass("ident", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["foo"]);
    });

    it("should match a binary expression", function() {
        var stx = parser.read("2+2");
        var res = matchPatternClass("expr", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql([2, "+", 2]);
    });

    it("should match a complex binary expression", function() {
        var stx = parser.read("2+2*10/32");
        var res = matchPatternClass("expr", stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql([2, "+", 2, "*", 10, "/", 32]);
    });


    it("should match a this expression", function() {
        var stx = parser.read("this.foo");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql(["this"]);
    });

    it("should match a literal expression", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql([42]);
    });

    it("should match a parenthesized expression", function() {
        var stx = parser.read("(42)");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql(["(", 42, ")"]);
    });

    it("should match an array literal", function() {
        var stx = parser.read("[1,2,3]");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql(["[", 1, ",", 2, ",", 3, "]"]);
    });

    it("should match a simple object literal", function() {
        var stx = parser.read("{a: 42}");
        var res = matchPatternClass("expr", stx, {}).result;

        expect(tokValues(res)).to.eql(["{", "a", ":", 42, "}"]);
    });

    // it("should handle a binop and array", function() {
    //     var stx = parser.read("42 == test[0]");
    //     var res = matchPatternClass("expr", stx, emptyMacroMap).result;

    //     expect(tokValues(res)).to.be(["42", "==", "test", "[", 0, "]"]);
    // });

});

describe("expand", function() {
    it("handle a simple binary expression", function() {
        var stx = parser.read("42 + 24");
        var res = expander.flatten(expander.expand(stx));
        expect(tokValues(res)).to.eql([42, "+", 24, '']);
    });

    it("should expand a complex binary expression", function() {
        var stx = parser.read("1 + 2 * 3");
        var res = expander.flatten(expander.expand(stx));
        expect(tokValues(res)).to.eql([1, "+", 2, "*", 3, '']);
    });

    it("should handle a simple object bracket get", function() {
        var stx = parser.read("test[0]");
        var res = expander.flatten(expander.expand(stx));

        expect(tokValues(res)).to.eql(["test", "[", 0, "]", ""]);
    });

    it("should handle a object bracket get", function() {
        var stx = parser.read("test[2+3]");
        var res = expander.flatten(expander.expand(stx));

        expect(tokValues(res)).to.eql(["test", "[", 2, "+", 3, "]", ""]);
    });
});


// describe("enforestPropertyAssignments", function() {
//     it("should return null for tokens that don't match a prop assign", function() {
//         var stx = parser.read("foo");
//         var res = enforestPropertyAssignments(stx);

//         expect(res).to.be(null);
//     });

//     it("should return an empty array when given no tokens", function() {
//         var stx = []; //parser.read("{a: 42}");
//         var res = enforestPropertyAssignments(stx);

//         expect(res).to.eql([]);
//     });

//     it("should enforest a single simple prop assign", function() {
//         var stx = parser.read("a: 42");
//         var res = enforestPropertyAssignments(stx);

//         expect(res[0].hasPrototype(PropertyAssignment)).to.be(true);
//     });
// });