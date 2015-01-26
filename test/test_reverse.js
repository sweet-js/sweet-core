var expect = require("expect.js");
var parser = require("../build/lib/parser");
var reverse = require("../build/lib/reverse");
var syn = require("../build/lib/syntax");
var gen = require("escodegen");
var _ = require("underscore");

var Token = parser.Token;

function findMacros(src) {
    var stx = parser.read(src);
    return reverse.findMacros(stx);
}

var idMacro  = "macro id {\n  rule {\n    ( $x )\n  }\n  => {\n    $x\n  }\n  \n}\n";
var letMacro = "macro let {    rule { $($id:ident = $val:expr) (,) ... } =>" +
               "                    { $(var $id = $val;) ... } }";

var swapMacro = "macro swap {  rule { $x:ident, $y:ident } =>" +
                "                   { var tmp = $x; $x = $y; $y = tmp; }}"

describe("findMacros", function() {
    it("should return pattern and expansion for id macro", function() {
        var macros = findMacros(idMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
    it("should return pattern and expansion for let macro", function() {
        var macros = findMacros(letMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
    it("should return pattern and expansion for swap macro", function() {
        var macros = findMacros(swapMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
});

function findReverseMatches(src) {
    var stx = parser.read(src);
    return reverse.findReverseMatches(stx);
}

describe("findReverseMatches", function() {
    it("should return possible reverse match for id macro", function() {
        var matches = findReverseMatches(idMacro + "\n23");
        expect(matches).to.have.length(1);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0].matchedTokens).to.have.length(1);
        expect(matches[0].matchedTokens[0].token.value).to.be(23);
        expect(matches[0].replacement).to.be("id ( 23 )\n");
        expect(matches[0].replacedSrc).to.be(idMacro + "id ( 23 )\n");
    });

    it("should return possible reverse match for let macro", function() {
        var matches = findReverseMatches(letMacro + "\nvar a = 1; var b = 2;");
        expect(matches).to.have.length(2);
        expect(matches[0].matchedTokens).to.have.length(8);
        expect(matches[0].replacement).to.be("let a = 1, b = 2");
        expect(matches[1].matchedTokens).to.have.length(4);
        expect(matches[1].replacement).to.be("let b = 2");
    });

    it("should return possible reverse match for swap macro", function() {
        var matches = findReverseMatches(swapMacro + "\nvar a,b; var tmp = a; a = b; b = tmp;");
        expect(matches).to.have.length(1);
        expect(matches[0].matchedTokens).to.have.length(10);
        expect(matches[0].replacement).to.be("swap ( a , b )");
    });

    it("should respect pattern classes for swap macro", function() {
        var matches = findReverseMatches(swapMacro + "\nvar a,b; var tmp = (a[0]); (a[0]) = b; b = tmp;");
        expect(matches).to.have.length(0);
    });

    it("macro", function() {
        findReverseMatches("macro tom { rule { $x:token } => { ( $x ) } }");
    });
});

