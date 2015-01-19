var expect = require("expect.js");
var parser = require("../build/lib/parser");
var reverse = require("../build/lib/reverse");
var syn = require("../build/lib/syntax");
var gen = require("escodegen");
var _ = require("underscore");

var Token = parser.Token;

function findMacros(src) {
    var stx = parser.read(src);
    return reverse.findMacroRules(stx);
}

var idMacro  = "macro id  { rule { ( $x ) } => { $x } }";
var letMacro = "macro let { rule { $($id = $val) (,) ... } =>" +
               "          { $(var $id = $val;) ... } }";

describe("findMacroRules", function() {
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
});

function findReverseMatches(src) {
    var stx = parser.read(src);
    return reverse.findReverseMatches(stx);
}

describe("findReverseMatches", function() {
    it("should return possible reverse match for id macro", function() {
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
});

