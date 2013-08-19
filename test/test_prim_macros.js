var expect = require("expect.js")

describe("a primitive macro", function() {
    it("should expand the id macro", function() {
        macro m {
            function(stx) {
                var name = stx[0];
                var arg = stx[1];
                return {
                    result: [arg],
                    rest: stx.slice(2)
                }
            }
        }
        expect(m 42).to.be(42);
    });

    it('should have access to the primitive functions', function() {
        macro m {
            function(stx) {
                var name = stx[0];
                var arg = stx[1];
                return {
                    result: [makeValue(24, name)],
                    rest: stx.slice(2)
                }
            }
        }
        expect(m 42).to.be(24);
    });

});
