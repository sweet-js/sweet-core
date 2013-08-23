var expect = require("expect.js")

describe("syntaxCase", function() {
    it("return its argument", function() {
        syntaxCase m {
            case { _ $x ... } => {
                return #{ [$x (,) ...] }
            }
        }
        expect(m 42 24).to.eql([42, 24])
    });
});
