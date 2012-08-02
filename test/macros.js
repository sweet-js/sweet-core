var should = require("should");
var parser = require("../sweet");

describe("reader", function() {
    
    it("should match up a single delimiter", function() {
        parser.read("(a)")[0].value
            .should.equal("()");
        
        parser.read("(a)")[0].inner.join("")
            .should.equal("a");
    });
    
    it("should match up a single delimiter with multiple inner fields", function() {
        parser.read("(a, b)")[0].value
            .should.equal("()");
        
        parser.read("(a, b)")[0].inner.join("")
            .should.equal("a, b");
    });
    
    it("should match up identifier and a paren delimiter", function() {
        parser.read("foo (a, b)")[0].should.equal("f");
        
        parser.read("foo (a, b)")[4].value
            .should.equal("()");
        
        parser.read("foo (a, b)")[4].inner.join("")
            .should.equal("a, b");
    });
    
    it("should match up identifier and a curly delimiter", function() {
        parser.read("foo {a, b}")[0].should.equal("f");
        
        parser.read("foo {a, b}")[4].value
            .should.equal("{}");
        
        parser.read("foo {a, b}")[4].inner.join("")
            .should.equal("a, b");
        
    });
    
    it("should match up identifier and a squar delimiter", function() {
        parser.read("foo [a, b]")[0].should.equal("f");
        
        parser.read("foo [a, b]")[4].value
            .should.equal("[]");
        
        parser.read("foo [a, b]")[4].inner.join("")
            .should.equal("a, b");
        
    });
    
    it("should match up a sub delimiter in the first position", function() {
        parser.read("((a) b)")[0].value
            .should.equal("()");
        
        parser.read("((a) b)")[0].inner[0].value
            .should.equal("()");
        
        parser.read("((a) b)")[0].inner[0].inner.join("")
            .should.equal("a");
    });
    
    it("should match up a sub delimiter in the last position", function() {
        parser.read("(a (b))")[0].value
            .should.equal("()");
        
        parser.read("(a (b))")[0].inner[2].value
            .should.equal("()");
        
        parser.read("(a (b))")[0].inner[2].inner.join("")
            .should.equal("b");
    });
    
    
    it("should read strings as a single lexeme", function() {
        parser.read("'foo'")[0]
            .should.equal("'foo'");
    });
    
    it("should read strings with double quotes", function() {
        parser.read("\"foo\"")[0]
            .should.equal("\"foo\"");
    });
    
    it("should read strings inside a delimiter", function() {
        parser.read("foo ('bar')")[4].inner[0]
            .should.equal("'bar'");
    });
    
    it("should read delimiter in assign regex", function() {
        parser.read("{x = /a}b/}")[0].inner.join("")
            .should.equal("x = /a}b/");
    });
    
    it("should not read delimiter inside a regex", function() {
        parser.read("x = /{a}b/")[4]
            .should.equal("/{a}b/");
    });
    
    // it("should read delim in regex on right side of divide", function() {
    //     parser.read("(2 / /a)b/)")[0].inner.join("")
    //         .should.equal("2 / /a)b/");
    // });
});
