import read from '../../src/reader/token-reader';
import test from 'ava';
import * as T from '../../src/tokens';

/* eslint-disable no-unused-vars */

test('should read a numeric', t => {
  let [r] = read('42');
  t.true(T.isNumeric(r, 42));
});

test('should read an identifier', t => {
  let [r] = read('foo');
  t.true(T.isIdentifier(r, 'foo'));
});

test('should read a true keyword', t => {
  let [r] = read('true');

  t.true(T.isKeyword(r, 'true'));
});

test('should read a null keyword', t => {
  let [r] = read('null');

  t.true(T.isKeyword(r, 'null'));
});

test('should read a string literal', t => {
  let [r] = read('"foo"');

  t.true(T.isString(r, 'foo'));
});

test('should read a punctuator', t => {
  let [r] = read('+');

  t.true(T.isPunctuator(r, '+'));
});

test('should read an empty delimiter', t => {
  let [r] = read('()');

  t.true(T.isParens(r));
});

test('should read a () delimiter with one element', t => {
  let [r] = read('(42)');
  t.true(T.isParens(r));
  let [open, inner, close] = r;
  t.true(T.isNumeric(inner, 42));
});

test('should read a [] delimiter with one element', t => {
  let [r] = read('[42]');
  t.true(T.isBrackets(r));
  let [open, inner, close] = r;
  t.true(T.isNumeric(inner, 42));
});

test('should read a {} delimiter with one element', t => {
  let [r] = read('{42}');
  t.true(T.isBraces(r));
  let [open, inner, close] = r;
  t.true(T.isNumeric(inner, 42));
});

test('should read a `x` as a simple template', t => {
  let [r] = read('`x`');
  t.true(T.isTemplate(r));
  let [el] = r.items;
  t.true(T.isTemplateElement(el, 'x'));
});

test('should read a `x${1}` as a template', t => {
  let [r] = read('`x${1}`');

  t.true(T.isTemplate(r));

  let [first, middle, end] = r.items;
  t.true(T.isTemplateElement(first, 'x'));
  t.true(T.isBraces(middle));
  t.true(T.isTemplateElement(end, ''));

  let [open, num, close] = middle;
  t.true(T.isNumeric(num, 1));
});

test('should read a `x${1}y` as a template', t => {
  let [r] = read('`x${1}y`');

  t.true(T.isTemplate(r));
  let [first, middle, end] = r.items;
  t.true(T.isTemplateElement(first, 'x'));
  t.true(T.isBraces(middle));
  t.true(T.isTemplateElement(end, 'y'));
  let [open, inner, close] = middle;
  t.true(T.isNumeric(inner, 1));
});

test('should handle syntax templates', t => {
  let [r] = read('#`foo`');
  t.true(T.isSyntaxTemplate(r));

  let [open, inner, close] = r;
  t.true(T.isIdentifier(inner, 'foo'));
});

test('should handle nested syntax templates', t => {
  let [r] = read('#`#`bar``');
  t.true(T.isSyntaxTemplate(r));
  let [open, inner, close] = r;
  t.true(T.isSyntaxTemplate(inner));
  let [iopen, iinner, iclose] = inner;
  t.true(T.isIdentifier(iinner, 'bar'));
});

test.skip(
  'should handle escaped string templates literals inside a syntax literal',
  t => {
    let [r] = read('#`x = \\`foo\\``');
    t.true(T.isSyntaxTemplate(r));
    let [open, x, eq, str, close] = r;
    t.true(T.isIdentifier(x, 'x'));
    t.true(T.isPunctuator(eq, '='));
    t.true(T.isTemplate(str, 'foo'));
  },
);

test('should read a regex when it begins the source', t => {
  let [r] = read('/42/i');

  t.true(T.isRegExp(r, '/42/i'));
});

test('should read a regex when it follows a addition', t => {
  let [num, plus, re] = read('4 + /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a keyword', t => {
  let [ret, re] = read('return /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows an assign', t => {
  let [id, eq, re] = read('x = /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows an if statement', t => {
  let [iff, paren, re] = read('if () /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a while statement', t => {
  let [wh, paren, re] = read('while () /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a for statement', t => {
  let [forr, paren, re] = read('for () /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a function declaration', t => {
  let [fn, fnname, paren, curly, re] = read('function foo () { } /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a block statement', t => {
  let [block, re] = read('{x: 42} /42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a function declaration following a return', t => {
  let [ret, fn, fnname, paren, curly, re] = read(
    'return\nfunction foo() {} /42/i',
  );
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read a regex when it follows a labeled statement inside a labeled statement', t => {
  let [[open, lab, colon, block, re]] = read('{x: {x: 42}/42/i}');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read as regex {x=4}/42/i', t => {
  let [block, re] = read('{x=4}/42/i');
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read as regex {x:4}/b/i', t => {
  let [block, re] = read('{x:4}/b/i');
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex {y:5}{x:4}/b/i', t => {
  let [block, block2, re] = read('{y:5}{x:4}/b/i');
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex {y:{x:4}/b/i}', t => {
  let [[open, lab, colon, block, re]] = read('{y:{x:4}/b/i}');
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex foo\n{} /b/i', t => {
  let [id, curly, re] = read('foo\n{} /b/i');
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex foo = 2\n{} /b/i', t => {
  let [id, eq, num, curly, re] = read('foo = 2\n{} /b/i');
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex {a:function foo() {}/b/i}', t => {
  let [[open, lab, colon, fn, fnname, paren, curly, re]] = read(
    '{a:function foo() {}/b/i}',
  );
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex for( ; {a:/b/i} ; ){}', t => {
  let [forkw, [open, semi, [op, lab, colon, re]]] = read(
    'for( ; {a:/b/i} ; ){}',
  );
  t.true(T.isRegExp(re, '/b/i'));
});

test('should read as regex function foo() {} /asdf/', t => {
  let [fn, fnname, parens, curly, re] = read('function foo() {} /asdf/');
  t.true(T.isRegExp(re, '/asdf/'));
});

test('should read as regex {false}function foo() {} /42/', t => {
  let [curly, fn, fnname, parens, curly2, re] = read(
    '{false} function foo() {} /42/i',
  );
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read as regex if (false) false\nfunction foo() {} /42/i', t => {
  let [ifkw, parens, fls, fn, fnname, parens2, curly, re] = read(
    'if (false) false\nfunction foo() {} /42/i',
  );
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read as regex i = 0;function foo() {} /42/i', t => {
  let [id, eq, num, semi, fn, fnname, parens, curly, re] = read(
    'i = 0;function foo() {} /42/i',
  );
  t.true(T.isRegExp(re, '/42/i'));
});

test('should read as regex if (false) {} function foo() {} /42/i', t => {
  let [ifkw, cond, body, fn, fnname, parens, curly, re] = read(
    'if (false) {} function foo() {} /42/i',
  );
  t.true(T.isRegExp(re, '/42/i'));
});

//         expect(read("function foo() {} function foo() {} /42/i")[8].literal)
//             .to.equal("/42/i");
//
//         expect(read("if (false) function foo() {} /42/i")[6].literal)
//             .to.equal("/42/i");
//
//         expect(read("{function foo() {} /42/i}")[0].inner[4].literal)
//             .to.equal("/42/i");
//
//         expect(read("foo\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("42\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("[2,3]\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("{a: 2}\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("\"foo\"\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("/42/i\nfunction foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//
test('should read a div when it follows a numeric literal', t => {
  let [n1, div, n2] = read('2 / 2');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows an identifier', t => {
  let [a, div, b] = read('foo / 2');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a call', t => {
  let [id, paren, div, num] = read('foo () / 2');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a keyword with a dot in front of it', t => {
  let [obj, dot, ret, div] = read('o.return /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows an if+parens with a dot in front of it', t => {
  let [obj, dot, ifkw, parens, div] = read('o.if () /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a this keyword', t => {
  let [thiskw, div] = read('this /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a null keyword', t => {
  let [a, div] = read('null /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a true keyword', t => {
  let [a, div] = read('true /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a false keyword', t => {
  let [a, div] = read('false /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a false keyword and parens', t => {
  let [a, b, div] = read('false() /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a true keyword and parens', t => {
  let [a, b, div] = read('true() /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a null keyword and parens', t => {
  let [a, b, div] = read('null() /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a this keyword and parens', t => {
  let [a, b, div] = read('this() /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a function expression', t => {
  let [id, eq, fn, fnname, paren, curly, div] = read(
    'f = function foo () {} /42/i',
  );
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows an anonymous function expression', t => {
  let [id, eq, fn, paren, curly, div] = read('f = function () {} /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a function expression', t => {
  let [id, div1, fn, fnname, paren, curly, div2] = read(
    'f / function foo () {} /42/i',
  );
  t.true(T.isPunctuator(div1, '/'));
  t.true(T.isPunctuator(div2, '/'));
});

test('should read a div when it follows a function expression following a return', t => {
  let [ret, fn, fnname, paren, curly, div] = read(
    'return function foo () {} /42/i',
  );
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a object literal following a return', t => {
  let [ret, curly, div] = read('return {x: 42} /42/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read a div when it follows a object literal inside an object literal', t => {
  let [id, eq, [open, lab, colon, curly, div]] = read('o = {x: {x: 42}/42/i}');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div a={x:4}/b/i', t => {
  let [id, eq, curly, div] = read('a={x:4}/b/i');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div foo({x:4}/b/i);', t => {
  let [id, [open, curly, div]] = read('foo({x:4}/b/i);');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div a={y:{x:4}/b/i};', t => {
  let [id, eq, [open, lab, colon, curly, div]] = read('a={y:{x:4}/b/i};');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div return{x:4}/b/i;', t => {
  let [ret, curly, div] = read('return{x:4}/b/i;');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div throw{x:4}/b/i;', t => {
  let [kw, curly, div] = read('throw{x:4}/b/i;');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div for( ; {a:2}/a/g ; ){}', t => {
  let [kw, [open, semi, curly, div]] = read('for( ; {a:2}/a/g ; ){}');
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div for( ; function(){ /a/g; } /a/g; ){}', t => {
  let [kw, [open, semi, fn, paren, curly, div]] = read(
    'for( ; function(){ /a/g; } /a/g; ){}',
  );
  t.true(T.isPunctuator(div, '/'));
});

test('should read as div o.if() / 42 /i', t => {
  let [obj, dot, id, paren, div] = read('o.if() / 42 /i');
  t.true(T.isPunctuator(div, '/'));
});

test('should fail with mismatched closing delimiters', t => {
  t.throws(_ => read('42 }'));
});

test.skip('should fail with mismatched opening delimiters', t => {
  t.throws(_ => read('{ 42 '));
});

test('should fail with mismatched nested closing delimiters', t => {
  t.throws(_ => read('{ 42 } }'));
});

test.skip('should fail with mismatched nested opening delimiters', t => {
  t.throws(_ => read('{ { 42 }'));
});
