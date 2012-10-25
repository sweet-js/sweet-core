var parser = require("../lib/parser");
var expander = require("../lib/expander");
var expect = require("expect.js");

var enforest = expander.enforest;
var read = parser.read;
var expand = expander.expandf;

describe("enforest", function() {
  it("should enforest a single ident", function() {
    var res = enforest(read("x"));

    expect(res[0].id.token.value).to.be("x");
  });

  it("should enforest a single ident with remainder", function() {
    var res = enforest(read("x + 2"));

    expect(res[0].id.token.value).to.be("x");
    expect(res[1].length).to.be(3);
  });

  it("should enforest a literal", function() {
    var res = enforest(read("2 + 2"));
    expect(res[0].lit.token.value).to.be(2);

    res = enforest(read("'2' + '2'"));
    expect(res[0].lit.token.value).to.be('2');
  });

  it("should enforest a fcn call", function() {
    var res = enforest(read("foo(1, 2);"));

    expect(res[0].fun.id.token.value).to.be("foo");
    expect(res[0].args[0].lit.token.value).to.be(1);
  });

  it("should enforest a macro definition", function() {
    var res = enforest(read("macro id { case $x => { $x } } fun"));
    expect(res[0].name.token.value).to.be("id");
    expect(res[0].body.length).to.be(5);
    expect(res[1][0].token.value).to.be("fun")
  });

  it("should enforest a function declaration", function() {
    var res = enforest(read("function id (x) { return x; }"));

    expect(res[0].name.token.value).to.be("id");
    expect(res[0].params[0].token.value).to.be("x");

  });
});

describe("expand", function() {
    it("should load a simple id macro", function() {
        var res = expand(read("macro id { case $x => { $x } }"));
    });
})
