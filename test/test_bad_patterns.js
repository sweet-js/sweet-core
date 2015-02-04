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


    it("should fail if repeated variable in group does not match", function() {
        expect(function() {
            var m = "macro m { rule { $( $a ) $a } => { true } }\n";
            sweet.compile(m + "m a b");
        }).to.throwError();
        expect(function() {
            var m = "macro m { rule { $a $( $a ) } => { true } }\n";
            sweet.compile(m + "m a b");
        }).to.throwError();
    });


    it("should fail if repeated variable in delim does not match", function() {
        expect(function() {
            var m = "macro m { rule { [ $a ] $a } => { true } }\n";
            sweet.compile(m + "m [ a ] b");
        }).to.throwError();
        expect(function() {
            var m = "macro m { rule { $a [ $a ] } => { true } }\n";
            sweet.compile(m + "m a [ b ]");
        }).to.throwError();
    });

    var repMacro5 = "macro m { rule { $a $a ... } => { true } }\n";
    var repMacro6 = "macro m { rule { $a $( ( $a $m ) ) ... } => { true }}\n";

    it("should fail if repeated variable levels do not match", function() {
        expect(function() {
            sweet.compile(repMacro3 + "m a a a b");
        }).to.throwError();
        expect(function() {
            sweet.compile(repMacro4 + "m a (a 1) (b 1)");
        }).to.throwError();
    });

    it("should fail if repeated variables with ellipses do not match", function() {
        var m = "macro m { rule { $a [$a $m] ... } => { true } }\n";
        expect(function() {
            sweet.compile(m + "m a [b 1]");
        }).to.throwError();
        expect(function() {
            sweet.compile(m + "m a [a 1] [b 2]");
        }).to.throwError();
    });

    it("should fail if repeated variables with two ellipses and seperator do not match", function() {

        var m = "macro m { rule { [$a $m] ... & [$a $n] ... } => { true } } => { true } }\n";
        expect(function() {
            sweet.compile(m + "m [a 1] & [b 2]");
        }).to.throwError();
        expect(function() {
            sweet.compile(m + "m [a 1] [b 2] & [a 3] [c 4]");
        }).to.throwError();
    });

    it("should fail if repeated variables with two ellipses without seperator do not match", function() {

        var m = "macro m { rule { [$a $m] ... [$a $n] ... } => { true } } => { true } }\n";
        expect(function() {
            sweet.compile(m + "m [a 1] [b 2]");
        }).to.throwError();
        expect(function() {
            sweet.compile(m + "m [a 1] [a 1] [a 1]");
        }).to.throwError();
        expect(function() {
            sweet.compile(m + "m [a 1] [b 2] [a 3] [c 4]");
        }).to.throwError();
    });

});
