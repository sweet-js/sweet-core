var expect = require("expect.js");
var parser = require("../build/lib/parser");
var expander = require("../build/lib/expander");
var patterns = require("../build/lib/patterns");

var matchPatternClass = patterns.matchPatternClass;

// extract the token values from a token array
function tokValues (stxArray) {
    if(!Array.isArray(stxArray)) {
        return [];
    }
    return stxArray.reduce(function(acc, el) {
        if(el.token.inner) {
            return acc.concat(el.token.value[0])
                .concat(tokValues(el.token.inner))
                .concat(el.token.value[1]);
        } else {
            return acc.concat(el.token.value);
        }
    }, []);
}



var emptyMacroMap = new expander.StringMap();

describe("matchPatternClass", function() {
    it("should give null when pattern doesn't match", function() {
        var stx = parser.read("42");
        var res = matchPatternClass({class: "ident"}, stx, emptyMacroMap).result;

        expect(res).to.be(null);
    });

    it("should match a single token", function() {
        var stx = parser.read("foo bar");
        var res = matchPatternClass({class: "token"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["foo"]);
    });

    it("should match a single delimited token", function() {
        var stx = parser.read("(foo) bar");
        var res = matchPatternClass({class: "token"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", ")"]);
        expect(tokValues(res[0].token.inner)).to.eql(["foo"]);
    });

    it("should match a lit", function() {
        var stx = parser.read("42");
        var res = matchPatternClass({class: "lit"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql([42]);
    });

    it("should match an ident", function() {
        var stx = parser.read("foo");
        var res = matchPatternClass({class: "ident"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["foo"]);
    });

    it("should match a unary expression", function() {
        var stx = parser.read("+2");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "+", 2, ")"]);
    });

    it("should match a complex unary expression", function() {
        var stx = parser.read("++2 + 42");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "++", 2, "+", 42, ")"]);
    });

    it("should match a postfix unary expression", function() {
        var stx = parser.read("x++");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "x", "++", ")"]);
    });

    it("should match a binary expression", function() {
        var stx = parser.read("2+2");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", 2, "+", 2, ")"]);
    });

    it("should match a complex binary expression", function() {
        var stx = parser.read("2+2*10/32");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", 2, "+", 2, "*", 10, "/", 32, ")"]);
    });

    it("should handle a broken binary expression", function() {
        var stx = parser.read("2+2 + +");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", 2, "+", 2, ")"]);
    });

    it("should handle a binary and unary expression", function() {
        var stx = parser.read("2 + 2 - ++x");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", 2, "+", 2, "-", "++", "x", ")"]);
    });

    it("should match a this expression", function() {
        var stx = parser.read("this.foo");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "this", ".", "foo", ")"]);
    });

    it("should match a literal expression", function() {
        var stx = parser.read("42");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", 42, ")"]);
    });

    it("should match a parenthesized expression", function() {
        var stx = parser.read("(42)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "(", 42, ")", ")"]);
    });

    it("should match an array literal", function() {
        var stx = parser.read("[1,2,3]");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "[", 1, ",", 2, ",", 3, "]", ")"]);
    });

    it("should match a simple object literal", function() {
        var stx = parser.read("{a: 42}");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "{", "a", ":", 42, "}", ")"]);
    });

    it("should match an empty function call", function() {
        var stx = parser.read("foo()");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", "(", ")", ")"]);
    });

    it("should match a simple function call", function() {
        var stx = parser.read("foo(24)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", "(", 24, ")", ")"]);
    });

    it("should match a function call with two simple arguments", function() {
        var stx = parser.read("foo(24, 42)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", "(", 24, ",", 42, ")", ")"]);
    });

    it("should match a function call with two complex arguments", function() {
        var stx = parser.read("foo(24 + 24, 42)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", "(", 24, "+", 24, ",", 42, ")", ")"]);
    });

    it("should not match a function call with a non-expression as one of the args", function() {
        var stx = parser.read("foo(24 + 24 +, 42)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", ")"]);
    });

    it("should not match a function call with a non-expression punctuator", function() {
        var stx = parser.read("foo(24 + 24, ,)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", ")"]);
    });

    it("should match a simple dotted get", function() {
        var stx = parser.read("foo.bar");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", ".", "bar", ")"]);
    });

    it("should match a dotted get method call", function() {
        var stx = parser.read("foo.bar(f())");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "foo", ".", "bar", "(", "f", "(", ")", ")", ")"]);
    });

    it("should match a new expression", function() {
        var stx = parser.read("new Foo(42)");
        var res = matchPatternClass({class: "expr"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["(", "new", "Foo", "(", 42, ")", ")"]);
    });

    it("should match a simple var declaration statement", function() {
        var stx = parser.read("var x");
        var res = matchPatternClass({class: "VariableStatement"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["var", "x"]);
    });

    it("should match a var declaration statement with multiple decls", function() {
        var stx = parser.read("var x, y, z");
        var res = matchPatternClass({class: "VariableStatement"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["var", "x", ",", "y", ",", "z"]);
    });

    it("should match a var decl with simple init expr", function() {
        var stx = parser.read("var x = 42");
        var res = matchPatternClass({class: "VariableStatement"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["var", "x", "=", 42]);
    });

    it("should match a var statement with multiple simple decls", function() {
        var stx = parser.read("var x = 42, y = 24");
        var res = matchPatternClass({class: "VariableStatement"}, stx, emptyMacroMap).result;

        expect(tokValues(res)).to.eql(["var", "x", "=", 42, ",", "y", "=", 24]);
    });

});

describe("expand", function() {
    it("handle a simple binary expression", function() {
        var stx = parser.read("42 + 24");
        var res = (expander.expand(stx));
        expect(tokValues(res)).to.eql([42, "+", 24, '']);
    });

    it("should expand a complex binary expression", function() {
        var stx = parser.read("1 + 2 * 3");
        var res = (expander.expand(stx));
        expect(tokValues(res)).to.eql([1, "+", 2, "*", 3, '']);
    });

    it("should handle a simple object bracket get", function() {
        var stx = parser.read("test[0]");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["test", "[", 0, "]", ""]);
    });

    it("should handle a object bracket get", function() {
        var stx = parser.read("test[2+3-1]");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["test", "[", 2, "+", 3, "-", 1, "]", ""]);
    });


    it("should handle a binop and an object bracket get", function() {
        var stx = parser.read("42 == test[0]");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql([42, "==", "test", "[", 0, "]", ""]);
    });

    it("should handle function calls", function() {
        var stx = parser.read("foo(24, 42)");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["foo", "(", "24", ",", "42", ")", ""]);
    });

    it("should handle get/call/binop/parens", function() {
        var stx = parser.read("(x.foo(0) >= 42) || (x === 42)");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["(", "x", ".", "foo", "(", 0, ")", 
                                        ">=", 42, ")", "||", "(", "x", "===", 42, ")", ""]);
    });

    it("should handle complex left side function calls", function() {
        var stx = parser.read("(function(x) { return x; })(24)");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["(", "function", "(", "x", ")", "{", 
                                        "return", "x", ";", "}", ")", "(", 24, ")", ""]);
            
    });    

    it("should match a var statement with multiple complex decls", function() {
        var stx = parser.read("var x = (function(x) { return x; })(24), y = 2 + 4");
        var res = (expander.expand(stx));

        expect(tokValues(res)).to.eql(["var", "x", "=", "(", "function", "(", "x", ")",
            "{", "return", "x", ";", "}", ")", "(", 24, ")",
            ",", "y", "=", 2, "+", 4, ""]);
    });


    it("should throw an error for with statements", function() {
        var stx = parser.read("with ({}) {}");

        expect(function() { expander.expand(stx);}).to.throwError();
    });

});
