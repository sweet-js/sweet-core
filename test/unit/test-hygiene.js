import test from 'ava';

import { evalWithOutput, evalThrows } from '../assertions';

test(
  'should work with references to function expression parameters',
  evalWithOutput,
  `
output = function foo(x) {
   syntaxrec m = function (ctx) {
       return #\`x\`
   }
   return function (x) {
       return m;
   }(2);
}(1);`,
  1,
);

test(
  'should work with references to function declaration parameters',
  evalWithOutput,
  `
function foo(x) {
   syntaxrec m = function (ctx) {
       return #\`x\`
   }
   function bar(x) {
       return m;
   }
   return bar(2);
};
output = foo(1)`,
  1,
);

test(
  'should work with introduced var declarations',
  evalWithOutput,
  `
syntaxrec m = function (ctx) {
  return #\`var x = 42;\`
}
output = function foo() {
  var x = 100;
  m;
  return x;
}()`,
  100,
);

test(
  'should allow duplicate var declarations',
  evalWithOutput,
  `
var x = 100;
var x = 200;
output = x;`,
  200,
);

test(
  'should throw exception for duplicate let declarations',
  evalThrows,
  `
let x = 100;
let x = 200`,
);

test(
  'should handle shorthand destructuring correctly',
  evalWithOutput,
  `
  var { x } = { x: 1 };
  output = x;
  `,
  1,
);

test(
  'should handle shorthand destructuring with default values correctly',
  evalWithOutput,
  `
  var { x = 1 } = { };
  output = x;
  `,
  1,
);
