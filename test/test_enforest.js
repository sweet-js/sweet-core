import { Enforester } from "../src/enforester";
import { List } from "immutable";
import { readAsTerms as read } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";

function mkEnf(code) {
    let stxl = read(code);
    stxl = stxl.pop() // drop EOF
    return new Enforester(stxl, List(), {});
}

describe("enforester", function() {
    it("should handle zero formal parameters", function() {
        let enf = mkEnf("");
        let p = enf.enforestFormalParameters();
        expect(p.items.size).to.be(0);
    });

    it("should handle a single formal parameter", function() {
        let enf = mkEnf("a");
        let p = enf.enforestFormalParameters();
        expect(p.items.size).to.be(1);
    });

    it("should handle two formal parameters", function() {
        let enf = mkEnf("a, b");
        let p = enf.enforestFormalParameters();
        expect(p.items.size).to.be(2);
    });

    // technically wrong but I'm hopful
    it("should handle a trailing comma formal parameters", function() {
        let enf = mkEnf("a, b,");
        let p = enf.enforestFormalParameters();
        expect(p.items.size).to.be(2);
    });
});
