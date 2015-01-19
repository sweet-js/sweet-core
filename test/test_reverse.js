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

describe("findMacroRules", function() {
    it("should return all macros", function() {
        debugger;
        var src = "macro id { rule { ( $x ) } => { $x } }";
        var macros = findMacros(src);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });

});
