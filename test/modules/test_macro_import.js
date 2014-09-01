import { * } from "../../macros/stxcase.js";
var expect = require("expect.js");


describe("importing the basics", function() {
    it("should work for rule macros", function() {
        macro id {
            rule { $x } => { $x }
        }
        expect(id 42).to.be(42);
    });
});
