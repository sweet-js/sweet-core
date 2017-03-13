import test from 'ava';
import { evalWithOutput } from '../assertions';

test(
  'should handle interpolations for normal tokens',
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
 m 1;
}()`,
  1,
);

test(
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
  m 'a';
}()`,
  'a',
);

test(
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
  m false;
}()`,
  false,
);

test(
  'should handle interpolations for delimiter tokens',
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
  m (1);
}()`,
  1,
);

test(
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
  m [
    1
  ];
}()[0]`,
  1,
);

test(
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.next().value}\`;
output = function f() {
  m {
    a: 1
  };
}().a`,
  1,
);

test(
  evalWithOutput,
  `
syntax m = ctx => #\`return \${ctx.contextify(ctx.next().value)}\`;
output = function f () {
  m { 1 }
}()`,
  1,
);

test(
  'should handle return and template literals',
  evalWithOutput,
  `
function f() {
  return \`foo\`
}
output = f();
`,
  'foo',
);

// // test('should handle interpolations for terms', t => {
// //   return testEval(`syntax m = ctx => #\`return \${ctx.next('expr').value}\`;
// //    output = function f() {
// //      m 1
// //    }()`, output => t.is(output, 1));
// // });
