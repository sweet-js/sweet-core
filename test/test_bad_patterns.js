var sweet = require("./lib/sweet");
var expect = require("expect.js");

describe("compile", function() {
    it("should fail to match inside a delimiter when not all subpatterns match", function() {
        expect(function() {
            sweet.compile("macro m { case ($p (,) ...) => { 'wrong' } }\n m (1,2 'bad')");
        }).to.throwError();
    });

    var repMacro = "macro m { rule { ( $a , $a ) } => { alert() } }\n";

    it("should fail if repeated variables do not match", function() {
        expect(function() {
            sweet.compile(repMacro + "m ( 1 , 2 )");
        }).to.throwError();
        expect(function() {
            sweet.compile(repMacro + "m ( (23 + 42) , (42 + 23) )");
        }).to.throwError();
    });

    var repMacro2 = "macro m {" +
          "rule { ( $a:( ( $b 12 ) ) , $a:( ( 23 $c ) ) ) } =>" +
               "{ $a$b + $a$c } }";

    it("should fail if named bindings of repeated variables do not match", function() {
        expect(function() {
            sweet.compile(repMacro2 + "m ( (23 13) , (23 13) )");
        }).to.throwError();
        expect(function() {
            sweet.compile(repMacro2 + "m ( (24 12) , (24 12) )");
        }).to.throwError();
    });
});
