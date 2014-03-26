var expect = require("expect.js")

describe("macroIdent", function() {
    it("works when 'macro' is rebound", function() {
        macro id {
            case { _ $x } => {
                return #{ $x }
            }
        }
        expect((function(macro) { return id macro })(42)).to.eql(42)
    });
});
