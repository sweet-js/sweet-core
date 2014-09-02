import { * } from "../../macros/stxcase.js";
import { id } from "./id.js";
import { map } from "./map.js" for macros;
var expect = require("expect.js");


describe("importing the basics", function() {
    it("should work for rule macros", function() {
        macro id {
            rule { $x } => { $x }
        }
        expect(id 42).to.be(42);
    });

    it("should work for case macros", function() {
        macro m {
            case { _ $x } => {
                return #{ $x }
            }
        }
        expect((function(macro) { return m macro })(42)).to.eql(42)
    })

    it("should import a macro from another module", function() {
        expect(id 42).to.be(42);
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
    })
});
