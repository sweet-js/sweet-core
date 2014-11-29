var read = require("../../lib/parser").read;
var Env = require("../../lib/data/env.js");

var expect = require("expect.js");

describe("an env", function() {

    it("set a single identifier value", function() {
        var e = new Env();
        var stx = read("x")[0];
        e.set(stx, 0, 42);
        expect(e.get(stx, 0)).to.be(42);
    });

    it("getting a value not in the map returns null", function() {
        var e = new Env();
        var stx = read("x")[0];
        expect(e.get(stx, 0)).to.be(null);
    });

    it("set and get a multi token name", function() {
        var e = new Env();
        var stx = read("x?y");
        e.set(stx, 0, 42);
        expect(e.get(read("x?y"), 0)).to.be(42);
        expect(e.get(read("x?y and other tokens"), 0)).to.be(42);
        expect(e.get(read("x?y?and other tokens"), 0)).to.be(42);
    });

});
