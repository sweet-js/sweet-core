var expect = require("expect.js");
var parser = require("../build/lib/parser");
var expander = require("../build/lib/expander");
var syn = require("../build/lib/syntax");
var gen = require("escodegen");
var _ = require("underscore");

var Token = parser.Token;

var read = _.wrap(parser.read, function(read_func, read_arg) {
    return syn.syntaxToTokens(read_func(read_arg));
});

describe("reader", function() {
    it("should tokenize an identifier", function() {
        expect(read("foo")[0].value)
            .to.equal("foo");
    });

    it("should accept a #", function() {
        expect(read("#")[0].value)
            .to.equal("#") 
    });

    it("should throw an error for an unmatched elimiter", function() {
        function baddelim() {
            read("{");
        }
        expect(baddelim).to.throwError();
    });
    
    it("should tokenize a string", function() {
        expect(read("'foo'")[0].value)
            .to.equal("foo");
    });
    
    it("should read strings with double quotes", function() {
        expect(read("\"foo\"")[0].value)
            .to.equal("foo");
    });
    
    it("should tokenize a number", function() {
        expect(read("42")[0].value)
            .to.equal(42);
    });
    
    it("should tokenize a regex", function() {
        expect(read("/42/i")[0].literal)
            .to.equal("/42/i");
    });
    
    it("should tokenize two strings", function() {
        expect(read("'foo' 'bar'")[0].value)
            .to.equal("foo");
        
        expect(read("'foo' 'bar'")[1].value)
            .to.equal("bar");
    });
    
    it("should match up a single delimiter", function() {
        expect(read("(a)")[0].value)
            .to.equal("()");
        
        expect(read("(a)")[0].inner[0].value)
            .to.equal("a");
        
        expect(read("(a)")[0].inner.length)
            .to.equal(1);
    });
    
    it("should match up a single delimiter with multiple inner fields", function() {
        expect(read("(a, b)")[0].value)
            .to.equal("()");
        
        expect(read("(a, b)")[0].inner[0].value)
            .to.equal("a");
        
        expect(read("(a, b)")[0].inner[1].value)
            .to.equal(",");
        
        expect(read("(a, b)")[0].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up identifier and a paren delimiter", function() {
        expect(read("foo (a, b)")[0].value)
            .to.equal("foo");
        
        expect(read("foo (a, b)")[1].value)
            .to.equal("()");
        
        expect(read("foo (a, b)")[1].inner[0].value)
            .to.equal("a");
        
        expect(read("foo (a, b)")[1].inner[1].value)
            .to.equal(",");
        
        expect(read("foo (a, b)")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up identifier and a curly delimiter", function() {
        expect(read("foo {a, b}")[0].value)
            .to.equal("foo");
        
        expect(read("foo {a, b}")[1].value)
            .to.equal("{}");
        
        expect(read("foo {a, b}")[1].inner[0].value)
            .to.equal("a");
        
        expect(read("foo {a, b}")[1].inner[1].value)
            .to.equal(",");
        
        expect(read("foo {a, b}")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("to match up identifier and a square delimiter", function() {
        expect(read("foo [a, b]")[0].value)
            .to.equal("foo");
        
        expect(read("foo [a, b]")[1].value)
            .to.equal("[]");
        
        expect(read("foo [a, b]")[1].inner[0].value)
            .to.equal("a");
        
        expect(read("foo [a, b]")[1].inner[1].value)
            .to.equal(",");
        
        expect(read("foo [a, b]")[1].inner[2].value)
            .to.equal("b");
    });
    
    it("should match up a sub delimiter in the first position", function() {
        expect(read("((a) b)")[0].value)
            .to.equal("()");
        
        expect(read("((a) b)")[0].inner[0].value)
            .to.equal("()");
        
        expect(read("((a) b)")[0].inner[0].inner[0].value)
            .to.equal("a");
    });
    
    it("should match up a sub delimiter in the last position", function() {
        expect(read("(a (b))")[0].value)
            .to.equal("()");
        
        expect(read("(a (b))")[0].inner[1].value)
            .to.equal("()");
        
        expect(read("(a (b))")[0].inner[1].inner[0].value)
            .to.equal("b");
    });
    
    it("should read strings inside a delimiter", function() {
        expect(read("foo ('bar')")[1].inner[0].value)
            .to.equal("bar");
    });


    it("should read delimiter in assign regex", function() {
        expect(read("{x = /a}b/}")[0].inner[2].literal)
            .to.equal("/a}b/");
    });
    
    it("should not read delimiter inside a regex", function() {
        expect(read("x = /{a}b/")[2].literal)
            .to.equal("/{a}b/");
    });
    
    it("should see divide as divide", function() {
        expect(read("2 / 2")[0].value)
            .to.equal(2);
        
        expect(read("2 / 2")[1].value)
            .to.equal("/");
        
        expect(read("2 / 2")[2].value)
            .to.equal(2);
        
        expect(read("{2 / 2}")[0].inner[1].value)
            .to.equal("/");
    });
    
    it("should read a / with a keyword before it as regex", function() {
        expect(read("return /asdf/")[1].literal)
            .to.equal("/asdf/");
        
        expect(read("{return /asdf/}")[0].inner[1].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / with an identifier before it as divide", function() {
        expect(read("foo /asdf/")[1].value)
            .to.equal("/");

        expect(read("this /asdf/")[1].value)
            .to.equal("/");
        
        expect(read("{foo /asdf/}")[0].inner[1].value)
            .to.equal("/");
    });
    
    it("should read a / in the then arm of an if as regex", function() {
        expect(read("if() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an while as regex", function() {
        expect(read("while() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an for as regex", function() {
        expect(read("for() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an with as regex", function() {
        expect(read("with() /asdf/")[2].literal)
            .to.equal("/asdf/");
    });
    
    it("should read a / after a fn call as divide", function() {
        expect(read("foo() /asdf/")[2].value)
            .to.equal("/");
    });

    it("should read / in a return statement correctly", function() {
      expect(read("function foo() { return /42/; }")[3].inner[1].literal)
            .to.equal("/42/");
    });

    it("should read a / after {} in a function declaration as regex", function() {
        expect(read("function foo() {} /asdf/")[4].literal)
            .to.equal("/asdf/");

        expect(read("{false} function foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("if (false) false\nfunction foo() {} /42/i")[7].literal)
            .to.equal("/42/i");
        
        expect(read("i = 0;function foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(read("if (false) {} function foo() {} /42/i")[7].literal)
            .to.equal("/42/i");
        
        expect(read("function foo() {} function foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(read("if (false) function foo() {} /42/i")[6].literal)
            .to.equal("/42/i");
        
        expect(read("{function foo() {} /42/i}")[0].inner[4].literal)
            .to.equal("/42/i");
        
        expect(read("foo\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("42\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("[2,3]\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("{a: 2}\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("\"foo\"\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("/42/i\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("for (;;) {\nbreak\nfunction foo() {} /42/i\n}")[2].inner[5].literal)
            .to.equal("/42/i");
        
        expect(read("debugger\nfunction foo() {} /42/i")[5].literal)
            .to.equal("/42/i");
        
        expect(read("if(false)\nfalse\nelse\nfunction foo() {} /42/i")[8].literal)
            .to.equal("/42/i");
        
        expect(read("[42][0]\nfunction foo() {} /42/i")[6].literal)
            .to.equal("/42/i");

        expect(read("{function foo() {} /42/i}")[0].inner[4].type)
            .to.be(Token.RegularExpression);
    });
    
    
    it("should read a / after {} in a function expression as divide", function() {
        expect(read("x = function foo() {} /asdf/")[6].value)
            .to.equal("/");

        expect(read("a = function () {}\n/4/\n7")[5].value)
            .to.equal("/");

        expect(read("x = 42 / function foo() {} /42/i")[8].value)
            .to.equal("/");
        
        expect(read("42 >> function foo() {} /42/i")[8].value)
            .to.equal("/");
        
        expect(read("i = 0;+function foo() {} /42/i")[9].value)
            .to.equal("/");
        
        expect(read("(function foo() {} /42/i)")[0].inner[4].value)
            .to.equal("/");
        
        expect(read("foo /\nfunction foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(read("new function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(read("typeof function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(read("2 in function foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(read("(function foo() {return function foo() {} /42/i})()")[0].inner[3].inner[5].value)
            .to.equal("/");
        
        expect(read("void function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(read("[function foo() {} /42/i]")[0].inner[4].value)
            .to.equal("/");
        
        expect(read("4,\nfunction foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(read("++function foo() {} /42/i")[5].value)
            .to.equal("/");
        
        expect(read("x /= function foo() {} /42/i")[6].value)
            .to.equal("/");
        
        expect(read("switch (\"foo\") {case \"foo\": {true;}\ncase function foo() {} /42/i: {true;}}")[2]
            .inner[9].value)
            .to.equal("/");
    });

    it('should read / following {x=4}/b/i; as a regex', function() {
        expect(read("{x=4}/b/i;")[1].type)
            .to.be(Token.RegularExpression);
    });

    it('should read / following {x:4}/b/i; as a regex', function() {
        expect(read("{x:4}/b/i;")[1].type)
            .to.be(Token.RegularExpression);
    });
      
    it('should read / following {y:5}{x:4}/b/i; as a regex', function() {
        expect(read("{y:5}{x:4}/b/i;")[2].type)
            .to.be(Token.RegularExpression);
    });

    it('should read / following {y:{x:4}/b/i}; as a regex', function() {
        expect(read("{y:{x:4}/b/i};")[0].inner[3].type)
            .to.be(Token.RegularExpression);
    });

    it('should read / following return\n{x:4}/b/i; as a regex', function() {
        expect(read("return\n{x:4}/b/i;")[2].type)
            .to.be(Token.RegularExpression);
    });

    
    it('should read / following a foo\n{} /b/i as a regex', function() {
        expect(read("foo\n{} /b/i")[2].type)
            .to.be(Token.RegularExpression);
        
    });

    it('should read / following a foo = 2\n{} /b/i as a regex', function() {
        expect(read("foo = 2\n{} /b/i")[4].type)
            .to.be(Token.RegularExpression);
        
    });

    it('should read / following a {a:function foo() {}/b/i} as a regex', function() {
        expect(read("{a:function foo() {}/b/i}")[0].inner[6].type)
            .to.be(Token.RegularExpression);
        
    });

    it('should read / following a a={x:4}/b/i; as a divide', function() {
        expect(read("a={x:4}/b/i;")[3].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a foo({x:4}/b/i); as a divide', function() {
        expect(read("foo({x:4}/b/i);")[1].inner[1].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a a={y:{x:4}/b/i}; as a divide', function() {
        expect(read("a={y:{x:4}/b/i};")[2].inner[3].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a return{x:4}/b/i; as a divide', function() {
        expect(read("return{x:4}/b/i;")[2].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a throw{x:4}/b/i; as a divide', function() {
        expect(read("throw{x:4}/b/i;")[2].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a for( ; {a:2}/a/g ; ){} as a divide', function() {
        expect(read("for( ; {a:2}/a/g ; ){}")[1].inner[2].type)
            .to.be(Token.Punctuator);
    });

    it('should read / following a for( ; {a:/a/g} ; ){} as a regex', function() {
        expect(read("for( ; {a:/a/g} ; ){}")[1].inner[1].inner[2].type)
            .to.be(Token.RegularExpression);
    });

    it('should read / following a for( ; function(){ /a/g; } /a/g; ){} as a divide', function() {
        expect(read("for( ; function(){ /a/g; } /a/g; ){}")[1].inner[4].type)
            .to.be(Token.Punctuator);
    });

    it('should read line comments', function() {
        var stx = read("//foo\nbar;");
        expect(stx[0].leadingComments[0].type).to.be("Line");
        expect(stx[0].leadingComments[0].value).to.be("foo");
    });

    it('should read block comments', function() {
        var stx = read("/*foo*/\nbar;");
        expect(stx[0].leadingComments[0].type).to.be("Block");
        expect(stx[0].leadingComments[0].value).to.be("foo");
    });

});
