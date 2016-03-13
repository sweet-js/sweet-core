import expect from "expect.js";
import Reader from "../src/shift-reader";
import { TokenType } from "shift-parser/dist/tokenizer";
import test from 'ava';

test("should read a numeric", function () {
  let reader = new Reader("42");
  let r = reader.read();
  expect(r.get(0).val()).to.be(42);
  expect(r.get(0).isNumericLiteral()).to.be(true);
});

test("should read an identifier", function () {
  let reader = new Reader('foo');
  let r = reader.read();

  expect(r.get(0).val()).to.be('foo');
  expect(r.get(0).isIdentifier()).to.be(true);
});

test("should read a true keyword", function () {
  let reader = new Reader('true');
  let r = reader.read();

  expect(r.get(0).val()).to.be('true');
  expect(r.get(0).isKeyword()).to.be(true);
  expect(r.get(0).isBooleanLiteral()).to.be(true);
});

test("should read a null keyword", function () {
  let reader = new Reader('null');
  let r = reader.read();

  expect(r.get(0).val()).to.be('null');
  expect(r.get(0).isKeyword()).to.be(true);
  expect(r.get(0).isNullLiteral()).to.be(true);
});

test("should read a string literal", function () {
  let reader = new Reader('"foo"');
  let r = reader.read();

  expect(r.get(0).token.str).to.be('foo');
  expect(r.get(0).isStringLiteral()).to.be(true);
});

test("should read a punctuator", function () {
  let reader = new Reader('+');
  let r = reader.read();

  expect(r.get(0).val()).to.be('+');
  expect(r.get(0).isPunctuator()).to.be(true);
});

test("should read an empty delimiter", function () {
  let reader = new Reader('()');
  let r = reader.read();

  expect(r.get(0).isDelimiter()).to.be(true);
});

test("should read a () delimiter with one element", function () {
  let reader = new Reader('(42)');
  let r = reader.read();

  expect(r.get(0).isDelimiter()).to.be(true);
  expect(r.get(0).inner().get(0).val()).to.be(42);
});

test("should read a [] delimiter with one element", function () {
  let reader = new Reader('[42]');
  let r = reader.read();

  expect(r.get(0).isDelimiter()).to.be(true);
  expect(r.get(0).inner().get(0).val()).to.be(42);
});

test("should read a {} delimiter with one element", function () {
  let reader = new Reader('{42}');
  let r = reader.read();

  expect(r.get(0).isDelimiter()).to.be(true);
  expect(r.get(0).inner().get(0).val()).to.be(42);
});

test("should read a `x` as a simple template", function () {
  let reader = new Reader('`x`');
  let r = reader.read();

  expect(r.get(0).isTemplate()).to.be(true);
  expect(r.get(0).val()).to.be("x");
});

test("should read a `x${1}` as a template", function () {
  let reader = new Reader('`x${1}`');
  let r = reader.read();

  expect(r.get(0).token.items.size).to.be(3);
  expect(r.get(0).isTemplate()).to.be(true);
  expect(r.get(0).val()).to.be("x${...}");
  expect(r.get(0).token.items.get(1).inner().get(0).isNumericLiteral()).to.be(true);
});

test("should read a `x${1}y` as a template", function () {
  let reader = new Reader('`x${1}y`');
  let r = reader.read();

  expect(r.get(0).token.items.size).to.be(3);
  expect(r.get(0).isTemplate()).to.be(true);
  expect(r.get(0).val()).to.be("x${...}y");
  expect(r.get(0).token.items.get(1).inner().get(0).isNumericLiteral()).to.be(true);
});

test('should handle syntax templates', () => {
  let reader = new Reader('#`foo`');
  let r = reader.read();

  expect(r.size).to.be(1);
  expect(r.get(0).inner().size).to.be(1);
  expect(r.get(0).inner().get(0).val()).to.be('foo');
});

test('should handle nested syntax templates', () => {
  let reader = new Reader('#`#`bar``');
  let r = reader.read();

  expect(r.size).to.be(1);
  expect(r.get(0).inner().size).to.be(1);
  expect(r.get(0).inner().get(0).inner().get(0).val()).to.be('bar');
});

// test('should handle escaped string templates literals inside a syntax literal', () => {
//   let reader = new Reader('#`x = \`foo\``');
//   let r = reader.read();

//   expect(r.size).to.be(1);
//   expect(r.get(0).inner().size).to.be(3);
//   expect(r.get(0).inner().get(0).inner().get(0).val()).to.be('x');
//   expect(r.get(0).inner().get(0).inner().get(1).val()).to.be('=');
// });

test("should read a regex when it begins the source", function () {
  let reader = new Reader('/42/i');
  let r = reader.read();

  expect(r.get(0).isRegularExpression()).to.be(true);
  expect(r.get(0).val()).to.be('/42/i');
});

test("should read a regex when it follows a addition", function () {
  let reader = new Reader('4 + /42/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/42/i');
});

test("should read a regex when it follows a keyword", function () {
  let reader = new Reader('return /42/i');
  let r = reader.read();

  expect(r.get(1).isRegularExpression()).to.be(true);
  expect(r.get(1).val()).to.be('/42/i');
});

test("should read a regex when it follows an assign", function () {
  let reader = new Reader('x = /42/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/42/i');
});

test("should read a regex when it follows an if statement", function () {
  let reader = new Reader('if () /42/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/42/i');
});

test("should read a regex when it follows a while statement", function () {
  let reader = new Reader('while () /42/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/42/i');
});

test("should read a regex when it follows a for statement", function () {
  let reader = new Reader('for () /42/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/42/i');
});

test("should read a regex when it follows a function declaration", function () {
  let reader = new Reader('function foo () { } /42/i');
  let r = reader.read();

  expect(r.get(4).isRegularExpression()).to.be(true);
  expect(r.get(4).val()).to.be('/42/i');
});

test("should read a regex when it follows a return keyword", function () {
  let reader = new Reader('return /42/i');
  let r = reader.read();

  expect(r.get(1).isRegularExpression()).to.be(true);
  expect(r.get(1).val()).to.be('/42/i');
});

test("should read a regex when it follows a block statement", function () {
  let reader = new Reader('{x: 42} /42/i');
  let r = reader.read();

  expect(r.get(1).isRegularExpression()).to.be(true);
  expect(r.get(1).val()).to.be('/42/i');
});

test("should read a regex when it follows a function declaration following a return", function () {
  let reader = new Reader('return\nfunction foo() {} /42/i');
  let r = reader.read();

  expect(r.get(5).isRegularExpression()).to.be(true);
  expect(r.get(5).val()).to.be('/42/i');
});

test("should read a regex when it follows a labeled statement inside a labeled statement", function () {
  let reader = new Reader('{x: {x: 42}/42/i}');
  let r = reader.read();

  expect(r.get(0).inner().get(3).isRegularExpression()).to.be(true);
  expect(r.get(0).inner().get(3).val()).to.be('/42/i');
});

test("should read as regex {x=4}/42/i", function () {
  let reader = new Reader('{x=4}/42/i');
  let r = reader.read();

  expect(r.get(1).isRegularExpression()).to.be(true);
  expect(r.get(1).val()).to.be('/42/i');
});

test("should read as regex {x:4}/b/i", function () {
  let reader = new Reader('{x:4}/b/i');
  let r = reader.read();

  expect(r.get(1).isRegularExpression()).to.be(true);
  expect(r.get(1).val()).to.be('/b/i');
});
test("should read as regex {y:5}{x:4}/b/i", function () {
  let reader = new Reader('{y:5}{x:4}/b/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/b/i');
});
test("should read as regex {y:{x:4}/b/i}", function () {
  let reader = new Reader('{y:{x:4}/b/i}');
  let r = reader.read();

  expect(r.get(0).inner().get(3).isRegularExpression()).to.be(true);
  expect(r.get(0).inner().get(3).val()).to.be('/b/i');
});
test("should read as regex foo\n{} /b/i", function () {
  let reader = new Reader('foo\n{} /b/i');
  let r = reader.read();

  expect(r.get(2).isRegularExpression()).to.be(true);
  expect(r.get(2).val()).to.be('/b/i');
});
test("should read as regex foo = 2\n{} /b/i", function () {
  let reader = new Reader('foo = 2\n{} /b/i');
  let r = reader.read();

  expect(r.get(4).isRegularExpression()).to.be(true);
  expect(r.get(4).val()).to.be('/b/i');
});
test("should read as regex {a:function foo() {}/b/i}", function () {
  let reader = new Reader('{a:function foo() {}/b/i}');
  let r = reader.read();

  expect(r.get(0).inner().get(6).isRegularExpression()).to.be(true);
  expect(r.get(0).inner().get(6).val()).to.be('/b/i');
});
test("should read as regex for( ; {a:/b/i} ; ){}", function () {
  let reader = new Reader('for( ; {a:/b/i} ; ){}');
  let r = reader.read();

  expect(r.get(1).inner().get(1).inner().get(2).isRegularExpression()).to.be(true);
  expect(r.get(1).inner().get(1).inner().get(2).val()).to.be('/b/i');
});

test("should read as regex function foo() {} /asdf/", function () {
  let reader = new Reader('function foo() {} /asdf/');
  let r = reader.read();

  expect(r.get(4).isRegularExpression()).to.be(true);
  expect(r.get(4).val()).to.be('/asdf/');
});

test("should read as regex {false}function foo() {} /42/", function () {
  let reader = new Reader('{false} function foo() {} /42/i');
  let r = reader.read();

  expect(r.get(5).isRegularExpression()).to.be(true);
  expect(r.get(5).val()).to.be('/42/i');
});
test("should read as regex if (false) false\nfunction foo() {} /42/i", function () {
  let reader = new Reader('if (false) false\nfunction foo() {} /42/i');
  let r = reader.read();

  expect(r.get(7).isRegularExpression()).to.be(true);
  expect(r.get(7).val()).to.be('/42/i');
});
test("should read as regex i = 0;function foo() {} /42/i", function () {
  let reader = new Reader('i = 0;function foo() {} /42/i');
  let r = reader.read();

  expect(r.get(8).isRegularExpression()).to.be(true);
  expect(r.get(8).val()).to.be('/42/i');
});
test("should read as regex if (false) {} function foo() {} /42/i", function () {
  let reader = new Reader('if (false) {} function foo() {} /42/i');
  let r = reader.read();

  expect(r.get(7).isRegularExpression()).to.be(true);
  expect(r.get(7).val()).to.be('/42/i');
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

test("should read a div when it follows a numeric literal", function () {
  let reader = new Reader('2 / 2');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows an identifier", function () {
  let reader = new Reader('foo / 2');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows a call", function () {
  let reader = new Reader('foo () / 2');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a keyword with a dot in front of it", function () {
  let reader = new Reader('o.return /42/i');
  let r = reader.read();

  expect(r.get(3).isPunctuator()).to.be(true);
  expect(r.get(3).val()).to.be('/');
});


test("should read a div when it follows an if+parens with a dot in front of it", function () {
  let reader = new Reader('o.if () /42/i');
  let r = reader.read();

  expect(r.get(4).isPunctuator()).to.be(true);
  expect(r.get(4).val()).to.be('/');
});

test("should read a div when it follows a this keyword", function () {
  let reader = new Reader('this /42/i');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows a null keyword", function () {
  let reader = new Reader('null /42/i');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows a true keyword", function () {
  let reader = new Reader('true /42/i');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows a false keyword", function () {
  let reader = new Reader('false /42/i');
  let r = reader.read();

  expect(r.get(1).isPunctuator()).to.be(true);
  expect(r.get(1).val()).to.be('/');
});

test("should read a div when it follows a false keyword and parens", function () {
  let reader = new Reader('false() /42/i');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a true keyword and parens", function () {
  let reader = new Reader('true() /42/i');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a null keyword and parens", function () {
  let reader = new Reader('null() /42/i');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a this keyword and parens", function () {
  let reader = new Reader('this() /42/i');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a function expression", function () {
  let reader = new Reader('f = function foo () {} /42/i');
  let r = reader.read();

  expect(r.get(6).isPunctuator()).to.be(true);
  expect(r.get(6).val()).to.be('/');
});

test("should read a div when it follows an anonymous function expression", function () {
  let reader = new Reader('f = function () {} /42/i');
  let r = reader.read();

  expect(r.get(5).isPunctuator()).to.be(true);
  expect(r.get(5).val()).to.be('/');
});

test("should read a div when it follows a function expression", function () {
  let reader = new Reader('f / function foo () {} /42/i');
  let r = reader.read();

  expect(r.get(6).isPunctuator()).to.be(true);
  expect(r.get(6).val()).to.be('/');
});

test("should read a div when it follows a function expression following a return", function () {
  let reader = new Reader('return function foo () {} /42/i');
  let r = reader.read();

  expect(r.get(5).isPunctuator()).to.be(true);
  expect(r.get(5).val()).to.be('/');
});

test("should read a div when it follows a object literal following a return", function () {
  let reader = new Reader('return {x: 42} /42/i');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});

test("should read a div when it follows a object literal inside an object literal", function () {
  let reader = new Reader('o = {x: {x: 42}/42/i}');
  let r = reader.read();

  expect(r.get(2).inner().get(3).isPunctuator()).to.be(true);
  expect(r.get(2).inner().get(3).val()).to.be('/');
});

test("should read as div a={x:4}/b/i", function () {
  let reader = new Reader('a={x:4}/b/i');
  let r = reader.read();

  expect(r.get(3).isPunctuator()).to.be(true);
  expect(r.get(3).val()).to.be('/');
});
test("should read as div foo({x:4}/b/i);", function () {
  let reader = new Reader('foo({x:4}/b/i);');
  let r = reader.read();

  expect(r.get(1).inner().get(1).isPunctuator()).to.be(true);
  expect(r.get(1).inner().get(1).val()).to.be('/');
});
test("should read as div a={y:{x:4}/b/i};", function () {
  let reader = new Reader('a={y:{x:4}/b/i};');
  let r = reader.read();

  expect(r.get(2).inner().get(3).isPunctuator()).to.be(true);
  expect(r.get(2).inner().get(3).val()).to.be('/');
});
test("should read as div return{x:4}/b/i;", function () {
  let reader = new Reader('return{x:4}/b/i;');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});
test("should read as div throw{x:4}/b/i;", function () {
  let reader = new Reader('throw{x:4}/b/i;');
  let r = reader.read();

  expect(r.get(2).isPunctuator()).to.be(true);
  expect(r.get(2).val()).to.be('/');
});
test("should read as div for( ; {a:2}/a/g ; ){}", function () {
  let reader = new Reader('for( ; {a:2}/a/g ; ){}');
  let r = reader.read();

  expect(r.get(1).inner().get(2).isPunctuator()).to.be(true);
  expect(r.get(1).inner().get(2).val()).to.be('/');
});
test("should read as div for( ; function(){ /a/g; } /a/g; ){}", function () {
  let reader = new Reader('for( ; function(){ /a/g; } /a/g; ){}');
  let r = reader.read();

  expect(r.get(1).inner().get(4).isPunctuator()).to.be(true);
  expect(r.get(1).inner().get(4).val()).to.be('/');
});
test("should read as div o.if() / 42 /i", function () {
  let reader = new Reader('o.if() / 42 /i');
  let r = reader.read();

  expect(r.get(4).isPunctuator()).to.be(true);
  expect(r.get(4).val()).to.be('/');
});



test('should fail with mismatched closing delimiters', () => {
  let reader = new Reader('42 }');
  expect(() => {
    reader.read();
  }).to.throwError();
});

test('should fail with mismatched opening delimiters', () => {
  let reader = new Reader('{ 42 ');
  expect(() => {
    reader.read();
  }).to.throwError();
});

test('should fail with mismatched nested closing delimiters', () => {
  let reader = new Reader('{ 42 } }');
  expect(() => {
    reader.read();
  }).to.throwError();
});

test('should fail with mismatched nested opening delimiters', () => {
  let reader = new Reader('{ { 42  }');
  expect(() => {
    reader.read();
  }).to.throwError();
});
