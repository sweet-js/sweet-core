var expect = require("expect.js");
var sm = require("source-map");
var sweet = require("../build/lib/sweet");

function compileWithMacro(code) {
    code = "macro id { rule { ( $x ) } => { $x } }\n" + code;
    var compiled = sweet.compile(code, {log: []});
    return compiled.log;
}

describe("highlights", function() {
    it("should record macro definitions", function() {
        var log = compileWithMacro("var x;");
        expect(log).to.have.length(1);
        expect(log[0].name.value).to.be("id");
        expect(log[0].name.lineNumber).to.be(1);
        expect(log[0].name.lineStart).to.be(0);
        expect(log[0].name.range).to.eql([6,8]);
        expect(log[0].matchedTokens).to.be.empty();
    });
    it("should record matched tokens", function() {
        var log = compileWithMacro("var x = id ( 23 );");
        expect(log[0].matchedTokens).to.have.length(2);
        var id = log[0].matchedTokens[0];
        expect(id.value).to.be("id");
        expect(id.lineNumber).to.be(2);
        expect(id.lineStart).to.be(39);
        expect(id.range).to.eql([47,49]);
        var paren = log[0].matchedTokens[1];
        expect(paren.startLineNumber).to.be(2);
        expect(paren.startLineStart).to.be(39);
        expect(paren.startRange).to.eql([50,51]);
        expect(paren.endLineNumber).to.be(2);
        expect(paren.endLineStart).to.be(39);
        expect(paren.endRange).to.eql([55,56]);
    });
});
