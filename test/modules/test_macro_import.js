#lang "../../macros/stxcase.js";

import { id, di } from "./id.js";
import { map } from "./map.js" for macros;
import { (**) } from "./operators.js";
import { (number?), (string?) } from "./multi-tok.js";

var expect = require("expect.js");


describe("importing modules", function() {

    it("should import two macros from another module", function() {
        expect(id(42)).to.be(42);
        expect(di(42)).to.be(42);
    });

    it("should import a runtime value from another module for macros", function() {
        macro m {
            case {_ } => {
                var nums = map([1, 2, 3], function(n) {
                    return makeValue(n, #{here});
                })
                letstx $nums ... = nums;
                return #{[$nums (,) ...]}
            }
        }
        expect(m).to.eql([1, 2, 3]);
    });

    it("should import a multi-token operator from another module", function() {
        function ident(x) { return x; }
        expect(2 ** 10).to.be(Math.pow(2, 10));
    });

    it("should import multi-token macros from another module", function() {
        expect(number?(100)).to.be(true);
        expect(string?(100)).to.be(false);
    })
});
