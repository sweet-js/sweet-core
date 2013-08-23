var expect = require("expect.js")

describe("syntaxCase", function() {
    it("return its argument", function() {
        syntaxCase m {
            case { _ $x } => {
                return #{ 42 }
            }
        }
        expect(m 42).to.be(42)
    });
});
