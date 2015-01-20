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

var idMacro  = "macro id  { rule { ( $x ) } => { $x } }";
var letMacro = "macro let { rule { $($id:ident = $val:expr) (,) ... } =>" +
               "                 { $(var $id = $val;) ... } }";

var swapMacro = "macro swap { rule { $x:ident, $y:ident } =>" +
                "                  { var tmp = $x; $x = $y; $y = tmp; }}"

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
        debugger;
        var matches = findReverseMatches(idMacro + "\n23");
        expect(matches).to.have.length(11);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0]).to.have.property("replacement");
    });

    it("should return possible reverse match for let macro", function() {
        var matches = findReverseMatches(letMacro + "\nvar a = 1; var b = 2;");
        expect(matches).to.have.length(3);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0]).to.have.property("replacement");
    });

    it("should return possible reverse match for swap macro", function() {
        var matches = findReverseMatches(swapMacro + "\nvar a,b; var tmp = a; a = b; b = tmp;");
        expect(matches).to.have.length(2);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0]).to.have.property("replacement");
    });

    it("should respect pattern classes for swap macro", function() {
        var matches = findReverseMatches(swapMacro + "\nvar a,b; var tmp = (a[0]); (a[0]) = b; b = tmp;");
        expect(matches).to.have.length(1);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0]).to.have.property("replacement");
    });

    it("macro", function() {
        findReverseMatches("macro tom { rule { $x:token } => { ( $x ) } }");
    });
});

