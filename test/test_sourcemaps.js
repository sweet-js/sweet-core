var expect = require("expect.js");
var sm = require("source-map");
var sweet = require("../build/lib/sweet");

let describe = macro {
    case {_ $description:lit { $body ... } } => {
        return syntax {
            describe($description, function() {
                $body ...
            });
        }
    }
}

let it = macro {
    case {_ $description:lit { $body ... }} => {
        return syntax {
            it($description, function() {
                $body ...
            });
        }
    }
}

function run(code, originalLoc) {
    var res = sweet.compile(code, {sourceMap: true, filename: "test.js"});
    var smc = new sm.SourceMapConsumer(res.sourceMap);

    return smc.originalPositionFor(originalLoc);
}

describe "source mapping" {
    it "should work for a single line" {
        var pos =  run("var x;", {
            //              ^
            // var x;
            //     ^
            line: 1,
            column: 4
        });

        expect(pos.line).to.be(1);
        expect(pos.column).to.be(4);
    }

    it "should work for multiple lines" {
        var pos = run("var x;\nvar y;", {
            //                     ^
            // var x;
            // var y;
            //     ^
            line: 2,
            column: 4
        });

        expect(pos.line).to.be(2);
        expect(pos.column).to.be(4);
    }

    it "should work with comments" {
        var pos = run("// this is a comment\nvar x;\nvar y;", {
            //                                           ^
            // // this is a comment
            // var x;
            // var y;
            //     ^
            line: 3,
            column: 4
        });

        expect(pos.line).to.be(3);
        expect(pos.column).to.be(4)
    }

    it "should work with parens (escodegen strips unnecessary parens)" {
        var pos = run("(2)\n", {
            //          ^
            // 2
            // ^
            line: 1,
            column: 0
        });

        expect(pos.line).to.be(1);
        expect(pos.column).to.be(1)
    }

    it "should work with a simple rule macro" {
        var pos = run("macro id { rule { $x } => { $x }}\nid 42;", {
            //                                               ^
            // 42;
            // ^
            line: 1,
            column:0
        });

        expect(pos.line).to.be(2);
        expect(pos.column).to.be(3);
    }

    // it "should work with a case macro" {
    //     var pos = run("macro m {case {_ } => {return withSyntax($y = [makeValue(42, #{here})]) { return #{$y}}}}\nm;", {
    //         //                                                                            ^
    //         // 42
    //         // ^
    //         line: 1,
    //         column: 0
    //     });

    //     expect(pos.line).to.be(1);
    //     expect(pos.column).to.be(63);
    // }

    it "should work with nested delimiters in a macro expansion" {
        var pos = run("macro m {case{_} => {return #{[[42]]}}}\nm", {
            //                                        ^
            // [[42]]
            //  ^
            line: 1,
            column: 2
        }); 

        expect(pos.line).to.be(1);
        expect(pos.column).to.be(32);
    }

    
}
