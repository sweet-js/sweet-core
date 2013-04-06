var parser = require("../lib/parser");
var expander = require("../lib/expander");
var expect = require("expect.js");

var enforest = expander.enforest;
var read = parser.read;
var expand = expander.expand;
var flatten = expander.flatten;

// this test script is used when we don't want to run
// all the tests again. Useful when trying to use
// logging to debug.

function tokValues (stxArray) {
    return stxArray.map(function(el) {
        return el.token.value;
    });
}

// NOT RUN THROUGH THE COMPILER!

describe("single test", function() {
  it("should pass", function() {
        var stx = parser.read("macro m {case () => { var x = 5; } }\nvar z = (function(x) {m(); var y = x; return y; })('foo')");
        var res = expander.flatten(expander.expand(stx));

        // expect(tokValues(res)).to.eql(["foo", "(", 24, ")", ""]);


  });
})
