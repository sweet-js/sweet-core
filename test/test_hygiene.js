import expect from "expect.js";

import { testThrow, expr, stmt, testParse, testEval } from "./assertions";

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
  var x = 100;
  m;
  return x;
}()`, 100);
  });

  it('should allow duplicate var declarations', () => {
    testEval(`
      var x = 100;
      var x = 200;
      output = x;
    `, 200);
  });

  it('should throw exception for duplicate let declarations', () => {
    testThrow(`
      let x = 100;
      let x = 200`);
  });
});
