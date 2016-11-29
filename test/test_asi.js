import { testEval } from './assertions';
import test from 'ava';

test('should handle interpolations for normal tokens', t => {
  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
     m 1;
    }()`, 1);

  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
      m 'a';
    }()`, 'a');

  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
      m false;
    }()`, false);
});

test('should handle interpolations for delimiter tokens', t => {
  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
      m (1);
    }()`, 1);

  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
      m [
        1
      ];
   }()`, [1]);

  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value}\`;
    output = function f() {
      m {
        a: 1
      };
    }()`, {a: 1});

  testEval(`
    syntax m = ctx => #\`return \${ctx.next().value.inner()}\`;
    output = function f () {
      m { 1 }
    }()`, 1);

});

test('should handle return and template literals', t => {
  testEval(`
    function f() {
      return \`foo\`
    }
    output = f();
  `, 'foo');
});

// test('should handle interpolations for terms', t => {
//   testEval(`syntax m = ctx => #\`return \${ctx.next('expr').value}\`;
//    output = function f() {
//      m 1
//    }()`, 1);
// });
