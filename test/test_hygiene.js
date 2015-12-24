import expect from "expect.js";

import { expr, stmt, testParse, testEval } from "./assertions";

describe("hygiene", function () {
    it("should work", function () {
        testEval(`
output = function foo(x) {
    return x;
}(42);`, 42);
    });

});
