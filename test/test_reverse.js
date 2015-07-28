var expect = require("expect.js");
var parser = require("../build/lib/parser");
var reverse = require("../build/lib/reverse");
var syn = require("../build/lib/syntax");
var gen = require("escodegen");
var _ = require("underscore");

var Token = parser.Token;

var idMacro  = "macro id {\n  rule { ( $x ) } => { $x }\n}";
var letMacro = "macro let {    rule { $($id:ident = $val) (,) ... } =>" +
               "                    { $(var $id = $val;) ... } }";

var swapMacro = "macro swap {  rule { $x:ident, $y:ident } =>" +
                "                   { var tmp = $x; $x = $y; $y = tmp; }}";

var inc3Macro = "macro inc { rule { 1 } => { 3 } " +
                "            rule { $x } => { $x + 1 } }"

var incMacro = "macro inc { rule { $x } => { $x + 1 } }"

var decPrintMacro = "macro decprint {" +
                    "  rule { $x }" +
                    "    => { var a = $x - 1; print(a); } }"

describe("reverse.findMacros", function() {
    it("should return pattern and expansion for id macro", function() {
        var macros = reverse.findMacros(idMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
    it("should return pattern and expansion for let macro", function() {
        var macros = reverse.findMacros(letMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
    it("should return pattern and expansion for swap macro", function() {
        var macros = reverse.findMacros(swapMacro);
        expect(macros).to.have.length(1);
        expect(macros[0]).to.have.property("pattern");
        expect(macros[0]).to.have.property("expansion");
    });
});

describe("reverse.findReverseMatches", function() {
    it("should return possible reverse match for id macro", function() {
        var matches = reverse.findReverseMatches(idMacro + "\n23");
        expect(matches).to.have.length(1);
        expect(matches[0]).to.have.property("matchedTokens");
        expect(matches[0].matchedTokens).to.have.length(1);
        expect(matches[0].matchedTokens[0].token.value).to.be(23);
        expect(matches[0].replacement).to.be("id ( 23 )\n");
        expect(matches[0].replacedSrc).to.be(idMacro + "\nid ( 23 )\n");
    });

    it("should return possible reverse match for let macro", function() {
        var matches = reverse.findReverseMatches(letMacro + "\nvar a = 1; var b = 2;");
        expect(matches).to.have.length(2);
        expect(matches[0].matchedTokens).to.have.length(10);
        expect(matches[0].replacement).to.be("let a = 1 , b = 2\n");
        expect(matches[1].matchedTokens).to.have.length(5);
        expect(matches[1].replacement).to.be("let b = 2\n");
    });

    it("should return possible reverse match for swap macro", function() {
        var matches = reverse.findReverseMatches(swapMacro + "\nvar a,b; var tmp = a; a = b; b = tmp;");
        expect(matches).to.have.length(1);
        expect(matches[0].matchedTokens).to.have.length(13);
        expect(matches[0].replacement).to.be("swap a , b\n");
    });

    it("should respect pattern classes for swap macro", function() {
        var matches = reverse.findReverseMatches(swapMacro + "\nvar a,b; var tmp = (a[0]); (a[0]) = b; b = tmp;");
        expect(matches).to.have.length(0);
    });

    it("should adjust levels in the environment", function() {
        var s = "macro m { rule { $x $y ... } => { $( $x $y ) ... } }\n";
        s += "+ 1 + 2";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(2);
        expect(matches[0].replacement).to.be("m + 1 2\n");
        expect(matches[1].replacement).to.be("m + 2\n");
    });

    var classMacro = "macro class { rule { $typename {" +
        "constructor $cparams $cbody $($mname $mparams $mbody) ..." +
        "} } => { function $typename $cparams $cbody " +
        "$($typename.prototype.$mname = function $mname $mparams $mbody;) ...}}";

    it("reverse match class macro", function() {
        var s = classMacro + "function Node(a) { this.a = 23; }";
        s += "Node.prototype.toString = ";
        s += "function toString() { return this.a; };";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(1);
    });

    it("should work for the inc3 macro ", function() {
        var s = inc3Macro + "\n3";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(1);
    });

    it("should preserve expansion order for multiple rules", function() {
        var s = inc3Macro + "\n1 + 1";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(0);
    });

    it("should catch errorneous refactorings", function() {
        var s = incMacro + "\n2 + 1 + 1";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(2);
        var s2 = matches[0].replacedSrc;
        var matches2 = reverse.findReverseMatches(s2);
        expect(matches2).to.have.length(0);
    });

    it("should work for the decprint macro", function() {
        var s = decPrintMacro + "\n";
        s += "var a = 23\n";
        s += "var b = b - 1\n";
        s += "print(b);\n";
        s += "print(a);\n";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(0);
    });

    it("should respect hygiene", function() {
        var s = decPrintMacro + "\n";
        s += "var a = 23\n";
        s += "var a = a - 1\n";
        s += "print(a);\n";
        s += "print(a);\n";
        var matches = reverse.findReverseMatches(s);
        expect(matches).to.have.length(0);
    });
});

