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

describe "source mapping" {
    it "should hook up correctly" {
        var res = sweet.compileWithSourcemap("var x;", "test.js");
        var smc = new sm.SourceMapConsumer(res.sourceMap);
        var pos = smc.originalPositionFor({
            // var x;
            //     ^
            line: 1,
            column: 4
        });

        expect(pos.line).to.be(1);
        expect(pos.column).to.be(4);
    }
}
