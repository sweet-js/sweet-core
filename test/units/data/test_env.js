var parser = require("../../lib/parser");
var Env = require("../../lib/data/env.js");

var expect = require("expect.js");

describe("an env", function() {
    it("set a single identifier value", function() {
        var e = new Env();
        var stx = parser.read("x")[0];
        e.set(stx, 0, 42);
        expect(e.get(stx, 0)).to.be(42);
    });
});
