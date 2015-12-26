import expect from "expect.js";

import { expr, stmt, testParse, testEval } from "./assertions";

describe("hygiene", function () {
     it("should work with references to function expression parameters", function () {
         testEval(`
 output = function foo(x) {
     syntax m = function (ctx) {
         return syntaxQuote { x }
     }
     return function (x) {
         return m;
     }(2);
 }(1);`, 1);
     });

});
