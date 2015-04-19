#lang "../../macros/stxcase.js";
import { eql } from "expect.js" for macros;

var expect = require("expect.js");

describe("importing from npm", function() {
    it("should import a runtime value for a macro", function() {
        stxrec m {
            case {_} => {
                var test = eql(10, 100);
                letstx $test = [makeValue(test, #{here})];
                return #{$test}
            }
        }
        expect(m).to.be(false);
    });
});
