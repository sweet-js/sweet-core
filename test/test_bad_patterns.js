var sweet = require("./lib/sweet");
var expect = require("expect.js");

describe("compile", function() {
    it("should fail to match inside a delimiter when not all subpatterns match", function() {
        expect(function() {
            sweet.compile("macro m { case ($p (,) ...) => { 'wrong' } }\n m (1,2 'bad')");
        }).to.throwError();
    });
});
