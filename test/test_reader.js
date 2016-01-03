import read, { Token } from "../src/reader";
import expect from "expect.js";
import Reader from "../src/shift-reader";
import { TokenType } from "shift-parser/dist/tokenizer";

describe("shift reader basics", function () {

  it("should read a numeric", function () {
    let reader = new Reader("42");
    let r = reader.read();
    expect(r.get(0).val()).to.be(42);
    expect(r.get(0).isNumericLiteral()).to.be(true);
  });

  it("should read an identifier", function () {
    let reader = new Reader('foo');
    let r = reader.read();

    expect(r.get(0).val()).to.be('foo');
    expect(r.get(0).isIdentifier()).to.be(true);
  });

  it("should read a true keyword", function () {
    let reader = new Reader('true');
    let r = reader.read();

    expect(r.get(0).val()).to.be('true');
    expect(r.get(0).isKeyword()).to.be(true);
    expect(r.get(0).isBooleanLiteral()).to.be(true);
  });

  it("should read a null keyword", function () {
    let reader = new Reader('null');
    let r = reader.read();

    expect(r.get(0).val()).to.be('null');
    expect(r.get(0).isKeyword()).to.be(true);
    expect(r.get(0).isNullLiteral()).to.be(true);
  });

  it("should read a string literal", function () {
    let reader = new Reader('"foo"');
    let r = reader.read();

    expect(r.get(0).token.str).to.be('foo');
    expect(r.get(0).isStringLiteral()).to.be(true);
  });

  it("should read a punctuator", function () {
    let reader = new Reader('+');
    let r = reader.read();

    expect(r.get(0).val()).to.be('+');
    expect(r.get(0).isPunctuator()).to.be(true);
  });

  it("should read an empty delimiter", function () {
    let reader = new Reader('()');
    let r = reader.read();

    expect(r.get(0).isDelimiter()).to.be(true);
  });

  it("should read a () delimiter with one element", function () {
    let reader = new Reader('(42)');
    let r = reader.read();

    expect(r.get(0).isDelimiter()).to.be(true);
    expect(r.get(0).inner().get(0).val()).to.be(42);
  });

  it("should read a [] delimiter with one element", function () {
    let reader = new Reader('[42]');
    let r = reader.read();

    expect(r.get(0).isDelimiter()).to.be(true);
    expect(r.get(0).inner().get(0).val()).to.be(42);
  });

  it("should read a {} delimiter with one element", function () {
    let reader = new Reader('{42}');
    let r = reader.read();

    expect(r.get(0).isDelimiter()).to.be(true);
    expect(r.get(0).inner().get(0).val()).to.be(42);
  });
});

describe('shift reader for regex', () => {
  it("should read a regex when it begins the source", function () {
    let reader = new Reader('/42/i');
    let r = reader.read();

    expect(r.get(0).isRegularExpression()).to.be(true);
    expect(r.get(0).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a addition", function () {
    let reader = new Reader('4 + /42/i');
    let r = reader.read();

    expect(r.get(2).isRegularExpression()).to.be(true);
    expect(r.get(2).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a keyword", function () {
    let reader = new Reader('return /42/i');
    let r = reader.read();

    expect(r.get(1).isRegularExpression()).to.be(true);
    expect(r.get(1).val()).to.be('/42/i');
  });

  it("should read a regex when it follows an assign", function () {
    let reader = new Reader('x = /42/i');
    let r = reader.read();

    expect(r.get(2).isRegularExpression()).to.be(true);
    expect(r.get(2).val()).to.be('/42/i');
  });

  it("should read a regex when it follows an if statement", function () {
    let reader = new Reader('if () /42/i');
    let r = reader.read();

    expect(r.get(2).isRegularExpression()).to.be(true);
    expect(r.get(2).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a while statement", function () {
    let reader = new Reader('while () /42/i');
    let r = reader.read();

    expect(r.get(2).isRegularExpression()).to.be(true);
    expect(r.get(2).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a for statement", function () {
    let reader = new Reader('for () /42/i');
    let r = reader.read();

    expect(r.get(2).isRegularExpression()).to.be(true);
    expect(r.get(2).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a function declaration", function () {
    let reader = new Reader('function foo () {} /42/i');
    let r = reader.read();

    expect(r.get(4).isRegularExpression()).to.be(true);
    expect(r.get(4).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a return keyword", function () {
    let reader = new Reader('return /42/i');
    let r = reader.read();

    expect(r.get(1).isRegularExpression()).to.be(true);
    expect(r.get(1).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a block statement", function () {
    let reader = new Reader('{x: 42} /42/i');
    let r = reader.read();

    expect(r.get(1).isRegularExpression()).to.be(true);
    expect(r.get(1).val()).to.be('/42/i');
  });

  it("should read a regex when it follows a function declaration following a return", function () {
    let reader = new Reader('return\nfunction foo() {} /42/i');
    let r = reader.read();

    expect(r.get(5).isRegularExpression()).to.be(true);
    expect(r.get(5).val()).to.be('/42/i');
  });
});

describe('shift reader for div', () => {

  it("should read a div when it follows a numeric literal", function () {
    let reader = new Reader('2 / 2');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows an identifier", function () {
    let reader = new Reader('foo / 2');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows a call", function () {
    let reader = new Reader('foo () / 2');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

  it("should read a div when it follows a keyword with a dot in front of it", function () {
    let reader = new Reader('o.return /42/i');
    let r = reader.read();

    expect(r.get(3).isPunctuator()).to.be(true);
    expect(r.get(3).val()).to.be('/');
  });


  it("should read a div when it follows an if+parens with a dot in front of it", function () {
    let reader = new Reader('o.if () /42/i');
    let r = reader.read();

    expect(r.get(4).isPunctuator()).to.be(true);
    expect(r.get(4).val()).to.be('/');
  });

  it("should read a div when it follows a this keyword", function () {
    let reader = new Reader('this /42/i');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows a null keyword", function () {
    let reader = new Reader('null /42/i');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows a true keyword", function () {
    let reader = new Reader('true /42/i');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows a false keyword", function () {
    let reader = new Reader('false /42/i');
    let r = reader.read();

    expect(r.get(1).isPunctuator()).to.be(true);
    expect(r.get(1).val()).to.be('/');
  });

  it("should read a div when it follows a false keyword and parens", function () {
    let reader = new Reader('false() /42/i');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

  it("should read a div when it follows a true keyword and parens", function () {
    let reader = new Reader('true() /42/i');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

  it("should read a div when it follows a null keyword and parens", function () {
    let reader = new Reader('null() /42/i');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

  it("should read a div when it follows a this keyword and parens", function () {
    let reader = new Reader('this() /42/i');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

  it("should read a div when it follows a function expression", function () {
    let reader = new Reader('f = function foo () {} /42/i');
    let r = reader.read();

    expect(r.get(6).isPunctuator()).to.be(true);
    expect(r.get(6).val()).to.be('/');
  });

  it("should read a div when it follows an anonymous function expression", function () {
    let reader = new Reader('f = function () {} /42/i');
    let r = reader.read();

    expect(r.get(5).isPunctuator()).to.be(true);
    expect(r.get(5).val()).to.be('/');
  });

  it("should read a div when it follows a function expression", function () {
    let reader = new Reader('f / function foo () {} /42/i');
    let r = reader.read();

    expect(r.get(6).isPunctuator()).to.be(true);
    expect(r.get(6).val()).to.be('/');
  });

  it("should read a div when it follows a function expression following a return", function () {
    let reader = new Reader('return function foo () {} /42/i');
    let r = reader.read();

    expect(r.get(5).isPunctuator()).to.be(true);
    expect(r.get(5).val()).to.be('/');
  });

  it("should read a div when it follows a object literal following a return", function () {
    let reader = new Reader('return {} /42/i');
    let r = reader.read();

    expect(r.get(2).isPunctuator()).to.be(true);
    expect(r.get(2).val()).to.be('/');
  });

});

describe('shift reader with bad syntax', () => {

  it('should fail with mismatched closing delimiters', () => {
    let reader = new Reader('42 }');
    expect(() => {
      reader.read();
    }).to.throwError();
  });

  it('should fail with mismatched opening delimiters', () => {
    let reader = new Reader('{ 42 ');
    expect(() => {
      reader.read();
    }).to.throwError();
  });

  it('should fail with mismatched nested closing delimiters', () => {
    let reader = new Reader('{ 42 } }');
    expect(() => {
      reader.read();
    }).to.throwError();
  });

  it('should fail with mismatched nested opening delimiters', () => {
    let reader = new Reader('{ { 42  }');
    expect(() => {
      reader.read();
    }).to.throwError();
  });
});

//it('should read / following {x=4}/b/i; as a regex', function() {
//  expect(read("{x=4}/b/i;")[1].type) .to.be(Token.RegularExpression);
//});
//it('should read / following {x:4}/b/i; as a regex', function() {
//  expect(read("{x:4}/b/i;")[1].type) .to.be(Token.RegularExpression);
//});
//it('should read / following {y:5}{x:4}/b/i; as a regex', function() {
//  expect(read("{y:5}{x:4}/b/i;")[2].type) .to.be(Token.RegularExpression);
//});
//it('should read / following {y:{x:4}/b/i}; as a regex', function() {
//  expect(read("{y:{x:4}/b/i};")[0].inner[3].type) .to.be(Token.RegularExpression);
//});
//it('should read / following return\n{x:4}/b/i; as a regex', function() {
//  expect(read("return\n{x:4}/b/i;")[2].type) .to.be(Token.RegularExpression);
//});
//it('should read / following a foo\n{} /b/i as a regex', function() {
//  expect(read("foo\n{} /b/i")[2].type) .to.be(Token.RegularExpression);
//});
//it('should read / following a foo = 2\n{} /b/i as a regex', function() {
//  expect(read("foo = 2\n{} /b/i")[4].type) .to.be(Token.RegularExpression);
//});
//it('should read / following a {a:function foo() {}/b/i} as a regex', function() {
//  expect(read("{a:function foo() {}/b/i}")[0].inner[6].type) .to.be(Token.RegularExpression);
//});
//it('should read / following a a={x:4}/b/i; as a divide', function() {
//  expect(read("a={x:4}/b/i;")[3].type) .to.be(Token.Punctuator);
//});
//it('should read / following a foo({x:4}/b/i); as a divide', function() {
//  expect(read("foo({x:4}/b/i);")[1].inner[1].type) .to.be(Token.Punctuator);
//});
//it('should read / following a a={y:{x:4}/b/i}; as a divide', function() {
//  expect(read("a={y:{x:4}/b/i};")[2].inner[3].type) .to.be(Token.Punctuator);
//});
//it('should read / following a return{x:4}/b/i; as a divide', function() {
//  expect(read("return{x:4}/b/i;")[2].type) .to.be(Token.Punctuator);
//});
//it('should read / following a throw{x:4}/b/i; as a divide', function() {
//  expect(read("throw{x:4}/b/i;")[2].type) .to.be(Token.Punctuator);
//});
//it('should read / following a for( ; {a:2}/a/g ; ){} as a divide', function() {
//  expect(read("for( ; {a:2}/a/g ; ){}")[1].inner[2].type) .to.be(Token.Punctuator);
//});
//it('should read / following a for( ; {a:/a/g} ; ){} as a regex', function() {
//  expect(read("for( ; {a:/a/g} ; ){}")[1].inner[1].inner[2].type) .to.be(Token.RegularExpression);
//});
//it('should read / following a for( ; function(){ /a/g; } /a/g; ){} as a divide', function() {
//  expect(read("for( ; function(){ /a/g; } /a/g; ){}")[1].inner[4].type) .to.be(Token.Punctuator);
//});
//it('should read / following a o.if() / 42 as divide', function() {
//  expect(read("o.if() / 42 /i")[4].type) .to.be(Token.Punctuator);
//});

//     it("should read / in a return statement correctly", function() {
//       expect(read("function foo() { return /42/; }")[3].inner[1].literal)
//             .to.equal("/42/");
//     });
//
//     it("should read a / after {} in a function declaration as regex", function() {
//         expect(read("function foo() {} /asdf/")[4].literal)
//             .to.equal("/asdf/");
//
//         expect(read("{false} function foo() {} /42/i")[5].literal)
//             .to.equal("/42/i");
//
//         expect(read("if (false) false\nfunction foo() {} /42/i")[7].literal)
//             .to.equal("/42/i");
//
//         expect(read("i = 0;function foo() {} /42/i")[8].literal)
//             .to.equal("/42/i");
//
//         expect(read("if (false) {} function foo() {} /42/i")[7].literal)
//             .to.equal("/42/i");
//
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
//expect(read("for (;;) {\nbreak\nfunction foo() {}/42/i\n}")[2].inner[5].literal) .to.equal("/42/i");
//expect(read("debugger\nfunctionfoo() {} /42/i")[5].literal).to.equal("/42/i");
//expect(read("if(false)\nfalse\nelse\nfunction foo() {} /42/i")[8].literal).to.equal("/42/i");
//expect(read("[42][0]\nfunction foo() {} /42/i")[6].literal).to.equal("/42/i");
//expect(read("{function foo() {} /42/i}")[0].inner[4].type).to.be(Token.RegularExpression);

//it("should read a / after {} in a function expression as divide", function() {
//  expect(read("x = function foo() {} /asdf/")[6].value).to.equal("/");
//  expect(read("a = function () {}\n/4/\n7")[5].value) .to.equal("/");
//  expect(read("x = 42 / function foo() {} /42/i")[8].value) .to.equal("/");
//  expect(read("42 >> function foo() {} /42/i")[8].value) .to.equal("/");
//  expect(read("i = 0;+function foo() {} /42/i")[9].value) .to.equal("/");
//  expect(read("(function foo() {} /42/i)")[0].inner[4].value) .to.equal("/");
//  expect(read("foo /\nfunction foo() {} /42/i")[6].value) .to.equal("/");
//  expect(read("new function foo() {} /42/i")[5].value) .to.equal("/");
//  expect(read("typeof function foo() {} /42/i")[5].value) .to.equal("/");
//  expect(read("2 in function foo() {} /42/i")[6].value) .to.equal("/");
//  expect(read("(function foo() {return function foo() {} /42/i})()")[0].inner[3].inner[5].value) .to.equal("/");
//  expect(read("void function foo() {} /42/i")[5].value) .to.equal("/");
//  expect(read("[function foo() {} /42/i]")[0].inner[4].value) .to.equal("/");
//  expect(read("4,\nfunction foo() {} /42/i")[6].value) .to.equal("/");
//  expect(read("++function foo() {} /42/i")[5].value) .to.equal("/");
//  expect(read("x /= function foo() {} /42/i")[6].value) .to.equal("/");
//  expect(read("switch (\"foo\") {case \"foo\": {true;}\ncase function foo() {} /42/i: {true;}}")[2] .inner[9].value) .to.equal("/");
//});


// describe("reader", function() {
//     it("should throw an error for an unmatched elimiter", function() {
//         function baddelim() {
//             read("{");
//         }
//         expect(baddelim).to.throwError();
//     });

