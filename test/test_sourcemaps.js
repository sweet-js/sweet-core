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
    var res = sweet.compileWithSourcemap(code, "test.js");
    var smc = new sm.SourceMapConsumer(res.sourceMap);

    return smc.originalPositionFor(originalLoc);
}

describe "source mapping" {
    it "should work for a single line" {
        var pos =  run("var x;", {
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
            // var x;
            // var y;
            //     ^
            line: 2,
            column: 4
        });

        expect(pos.line).to.be(2);
        expect(pos.column).to.be(4);
    }

    it "should work with a simple macro" {
        var pos = run("macro id { rule { $x } => { $x }}\nid 42;", {
            // 42;
            // ^
            line: 1,
            column:0
        });

        expect(pos.line).to.be(2);
        expect(pos.column).to.be(0);
    }
}
