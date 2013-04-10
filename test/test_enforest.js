var parser = require("../lib/parser");
var expander = require("../lib/expander");
var expect = require("expect.js");

var enforest = expander.enforest;
var read = parser.read;
var expand = expander.expand;
var flatten = expander.flatten;

describe("enforest", function() {
  it("should enforest a single ident", function() {
    var res = enforest(read("x"));

    expect(res.result.id.token.value).to.be("x");
  });

  // it("should enforest an expression", function() {
  //   var res = enforest(read("x + 2"));

  //   expect(res.result.left.id.token.value).to.be("x");
  //   expect(res.result.right.lit.token.value).to.be(2);
  // });

  // it("should enforest a fcn call", function() {
  //   var res = enforest(read("foo(1, 2);"));

  //   expect(res.result.fun.id.token.value).to.be("foo");
  //   expect(res.result.args[0].lit.token.value).to.be(1);
  // });

  it("should enforest a macro definition", function() {
    var res = enforest(read("macro id { case $x => { $x } } fun"));
    expect(res.result.name.token.value).to.be("id");
    expect(res.result.body.length).to.be(5);
    expect(res.rest[0].token.value).to.be("fun")
  });

  it("should enforest a function declaration", function() {
    var res = enforest(read("function id (x) { return x; }"));
    expect(res.result.name.token.value).to.be("id");
    expect(res.result.params.token.inner[0].token.value).to.be("x");

  });
});

