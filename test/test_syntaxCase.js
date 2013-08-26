var expect = require("expect.js")

describe("syntaxCase", function() {
    it("return its argument", function() {
        macro m {
            case { _ $x ... } => {
                return #{ [$x (,) ...] }
            }
        }
        expect(m 42 24).to.eql([42, 24])
    });
});
