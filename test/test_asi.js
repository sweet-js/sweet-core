import { testEval } from './assertions';
import test from 'ava';

test('should handle interpoations for normal tokens', t => {
  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m 1;
   }()`, 1);

  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m 'a';
   }()`, 'a');

  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m false;
   }()`, false);
});

test('should handle interpoations for delimiter tokens', t => {
  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m (1);
   }()`, 1);

  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m [
       1
     ];
   }()`, [1]);

  testEval(`syntax m = ctx => #\`return \${ctx.next().value}\`;
   output = function f() {
     m {
       a: 1
     };
   }()`, {a: 1});
});

// test('should handle interpoations for terms', t => {
//   testEval(`syntax m = ctx => #\`return \${ctx.next('expr').value}\`;
//    output = function f() {
//      m 1
//    }()`, 1);
// });
