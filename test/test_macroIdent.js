#lang "../macros/stxcase.js";
var expect = require("expect.js");

describe("macroIdent", function() {
    it("works when 'macro' is rebound", function() {
        stxrec id {
            case { _ $x } => {
                return #{ $x }
            }
        }
        expect((function(stxrec) { return id stxrec })(42)).to.eql(42)
    });
});
