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


// NOT RUN THROUGH THE COMPILER!

describe("single test", function() {
  it("should pass", function() {
    var res = expand(read("function foo(a, b) { return a; }"));
    // console.log(flatten(res))
  });
})
