var expect = require("expect.js")
var parser = require("../lib/parser");
var expander = require("../lib/expander");

// load all the "private" expander names (stored in _test)
// into the global scope for cleaner testing
Object.keys(expander._test).forEach(function(val) {
    global[val] = expander._test[val];
});

describe("expander", function() {
    it("should match an lit", function() {
        var stx = parser.read("42");
        var res = matchPatternClass("lit", stx, {}).result;

        expect(res.length).to.be(1)
        expect(res[0].token.value).to.be(42)
    });

});