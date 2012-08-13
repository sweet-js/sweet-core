var should = require("should");
var parser = require("../sweet");
var gen = require("escodegen");

describe("reader", function() {
    it("should tokenize an identifier", function() {
        parser.read("foo")[0].value
            .should.equal("foo");
    });
    
    it("should tokenize a string", function() {
        parser.read("'foo'")[0].value
            .should.equal("foo");
    });
    
    it("should read strings with double quotes", function() {
        parser.read("\"foo\"")[0].value
            .should.equal("foo");
    });
    
    it("should tokenize a number", function() {
        parser.read("42")[0].value
            .should.equal(42);
    });
    
    it("should tokenize a regex", function() {
        parser.read("/42/i")[0].literal
            .should.equal("/42/i");
    });
    
    it("should tokenize two strings", function() {
        parser.read("'foo' 'bar'")[0].value
            .should.equal("foo");
        
        parser.read("'foo' 'bar'")[1].value
            .should.equal("bar");
    });
    
    it("should match up a single delimiter", function() {
        parser.read("(a)")[0].value
            .should.equal("()");
        
        parser.read("(a)")[0].inner[0].value
            .should.equal("a");
        
        parser.read("(a)")[0].inner.length
            .should.equal(1);
    });
    
    it("should match up a single delimiter with multiple inner fields", function() {
        parser.read("(a, b)")[0].value
            .should.equal("()");
        
        parser.read("(a, b)")[0].inner[0].value
            .should.equal("a");
        
        parser.read("(a, b)")[0].inner[1].value
            .should.equal(",");
        
        parser.read("(a, b)")[0].inner[2].value
            .should.equal("b");
    });
    
    it("should match up identifier and a paren delimiter", function() {
        parser.read("foo (a, b)")[0].value
            .should.equal("foo");
        
        parser.read("foo (a, b)")[1].value
            .should.equal("()");
        
        parser.read("foo (a, b)")[1].inner[0].value
            .should.equal("a");
        
        parser.read("foo (a, b)")[1].inner[1].value
            .should.equal(",");
        
        parser.read("foo (a, b)")[1].inner[2].value
            .should.equal("b");
    });
    
    it("should match up identifier and a curly delimiter", function() {
        parser.read("foo {a, b}")[0].value
            .should.equal("foo");
        
        parser.read("foo {a, b}")[1].value
            .should.equal("{}");
        
        parser.read("foo {a, b}")[1].inner[0].value
            .should.equal("a");
        
        parser.read("foo {a, b}")[1].inner[1].value
            .should.equal(",");
        
        parser.read("foo {a, b}")[1].inner[2].value
            .should.equal("b");
    });
    
    it("should match up identifier and a squar delimiter", function() {
        parser.read("foo [a, b]")[0].value
            .should.equal("foo");
        
        parser.read("foo [a, b]")[1].value
            .should.equal("[]");
        
        parser.read("foo [a, b]")[1].inner[0].value
            .should.equal("a");
        
        parser.read("foo [a, b]")[1].inner[1].value
            .should.equal(",");
        
        parser.read("foo [a, b]")[1].inner[2].value
            .should.equal("b");
    });
    
    it("should match up a sub delimiter in the first position", function() {
        parser.read("((a) b)")[0].value
            .should.equal("()");
        
        parser.read("((a) b)")[0].inner[0].value
            .should.equal("()");
        
        parser.read("((a) b)")[0].inner[0].inner[0].value
            .should.equal("a");
    });
    
    it("should match up a sub delimiter in the last position", function() {
        parser.read("(a (b))")[0].value
            .should.equal("()");
        
        parser.read("(a (b))")[0].inner[1].value
            .should.equal("()");
        
        parser.read("(a (b))")[0].inner[1].inner[0].value
            .should.equal("b");
    });
    
    it("should read strings inside a delimiter", function() {
        parser.read("foo ('bar')")[1].inner[0].value
            .should.equal("bar");
    });
    
    it("should read delimiter in assign regex", function() {
        parser.read("{x = /a}b/}")[0].inner[2].literal
            .should.equal("/a}b/");
    });
    
    it("should not read delimiter inside a regex", function() {
        parser.read("x = /{a}b/")[2].literal
            .should.equal("/{a}b/");
    });
    
    it("should see divide as divide", function() {
        parser.read("2 / 2")[0].value
            .should.equal(2);
        
        parser.read("2 / 2")[1].value
            .should.equal("/");
        
        parser.read("2 / 2")[2].value
            .should.equal(2);
        
        parser.read("{2 / 2}")[0].inner[1].value
            .should.equal("/");
    });
    
    it("should read a / with a keyword before it as regex", function() {
        parser.read("return /asdf/")[1].literal
            .should.equal("/asdf/");
        
        parser.read("{return /asdf/}")[0].inner[1].literal
            .should.equal("/asdf/");
    });
    
    it("should read a / with an identifier before it as divide", function() {
        parser.read("foo /asdf/")[1].value
            .should.equal("/");
        
        parser.read("{foo /asdf/}")[0].inner[1].value
            .should.equal("/");
    });
    
    it("should read a / in the then arm of an if as regex", function() {
        parser.read("if() /asdf/")[2].literal
            .should.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an while as regex", function() {
        parser.read("while() /asdf/")[2].literal
            .should.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an for as regex", function() {
        parser.read("for() /asdf/")[2].literal
            .should.equal("/asdf/");
    });
    
    it("should read a / in the then arm of an with as regex", function() {
        parser.read("with() /asdf/")[2].literal
            .should.equal("/asdf/");
    });
    
    it("should read a / after a fn call as divide", function() {
        parser.read("foo() /asdf/")[2].value
            .should.equal("/");
    });
    
    it("should read a / after {} in a function declaration as regex", function() {
        parser.read("function foo() {} /asdf/")[4].literal
            .should.equal("/asdf/");
        
        parser.read("{false} function foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("if (false) false\nfunction foo() {} /42/i")[7].literal
            .should.equal("/42/i");
        
        parser.read("i = 0;function foo() {} /42/i")[8].literal
            .should.equal("/42/i");
        
        parser.read("if (false) {} function foo() {} /42/i")[7].literal
            .should.equal("/42/i");
        
        parser.read("function foo() {} function foo() {} /42/i")[8].literal
            .should.equal("/42/i");
        
        parser.read("if (false) function foo() {} /42/i")[6].literal
            .should.equal("/42/i");
        
        parser.read("{function foo() {} /42/i}")[0].inner[4].literal
            .should.equal("/42/i");
        
        parser.read("foo\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("42\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("[2,3]\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("{a: 2}\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("\"foo\"\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("/42/i\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("for (;;) {\nbreak\nfunction foo() {} /42/i\n}")[2].inner[5].literal
            .should.equal("/42/i");
        
        parser.read("debugger\nfunction foo() {} /42/i")[5].literal
            .should.equal("/42/i");
        
        parser.read("if(false)\nfalse\nelse\nfunction foo() {} /42/i")[8].literal
            .should.equal("/42/i");
        
        parser.read("[42][0]\nfunction foo() {} /42/i")[6].literal
            .should.equal("/42/i");
        
    });
    
    
    it("should read a / after {} in a function expression as divide", function() {
        parser.read("x = function foo() {} /asdf/")[6].value
            .should.equal("/");
        
        parser.read("x = 42 / function foo() {} /42/i")[8].value
            .should.equal("/");
        
        parser.read("42 >> function foo() {} /42/i")[8].value
            .should.equal("/");
        
        parser.read("i = 0;+function foo() {} /42/i")[9].value
            .should.equal("/");
        
        parser.read("(function foo() {} /42/i)")[0].inner[4].value
            .should.equal("/");
        
        parser.read("foo /\nfunction foo() {} /42/i")[6].value
            .should.equal("/");
        
        parser.read("new function foo() {} /42/i")[5].value
            .should.equal("/");
        
        parser.read("typeof function foo() {} /42/i")[5].value
            .should.equal("/");
        
        parser.read("2 in function foo() {} /42/i")[6].value
            .should.equal("/");
        
        parser.read("(function foo() {return function foo() {} /42/i})()")[0].inner[3].inner[5].value
            .should.equal("/");
        
        parser.read("void function foo() {} /42/i")[5].value
            .should.equal("/");
        
        parser.read("[function foo() {} /42/i]")[0].inner[4].value
            .should.equal("/");
        
        parser.read("4,\nfunction foo() {} /42/i")[6].value
            .should.equal("/");
        
        parser.read("++function foo() {} /42/i")[5].value
            .should.equal("/");
        
        parser.read("x /= function foo() {} /42/i")[6].value
            .should.equal("/");
        
        parser.read("switch (\"foo\") {case \"foo\": {true;}\ncase function foo() {} /42/i: {true;}}")[2]
            .inner[9].value
            .should.equal("/");
    });
});

describe("parser", function() {
    it("should work", function() {
        var ast = parser.parse("{42}");
        
        gen.generate(ast).should.equal("{\n    42;\n}");
    });

    // it("should still parse a for loop", function() {
    //     var ast = parser.parse("for(;;){ continue; }");
    //     gen.generate(ast).should.equal("");
    // });

    it("should work for a prefix", function() {
        var ast = parser.expand(parser.read("{ x\n++y; }"));
        // ast.should.equal("");
        // console.log(typeof ast[3].value);
        // ast[3].should.equal("")
        // gen.generate(ast).should.equal("");
        parser.parse("{ x\n++y; }").should.equal("")
    })
});

// describe("expander", function() {
//     var macnum = "macro PI { case PI => {3.14} }";
//     var macadd = "macro add { case add (a, b) => {a + b} }";
    
//     it("should expand a macro definition", function() {
//         parser.expand(macnum + "\n" + "PI")[0]
//             .should.equal(3.14);
//     });
    
//     it("should expand a macro function", function() {
//         parser.expand(macadd + "\n" + "add(2,2)")[0].join("")
//             .should.equal("2+2");
//     });
// });
