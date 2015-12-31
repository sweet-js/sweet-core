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

  it("should work with references to function declaration parameters", function () {
    testEval(`
 function foo(x) {
     syntax m = function (ctx) {
         return syntaxQuote { x }
     }
     function bar(x) {
         return m;
     }
     return bar(2);
 };
 output = foo(1)`, 1);
  });

  it("should work with introduced var declarations", function () {
    testEval(`
syntax m = function (ctx) {
  return syntaxQuote { var x = 42; }
}
output = function foo() {
  m;
  return x
}()`, undefined);
  });
});
