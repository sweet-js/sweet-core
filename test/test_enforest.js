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

  it("should enforest a single ident with remainder", function() {
    var res = enforest(read("x + 2"));

    expect(res.result.id.token.value).to.be("x");
    expect(res.rest.length).to.be(3);
  });

  it("should enforest a literal", function() {
    var res = enforest(read("2 + 2"));
    expect(res.result.lit.token.value).to.be(2);

    res = enforest(read("'2' + '2'"));
    expect(res.result.lit.token.value).to.be('2');
  });

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
    expect(res.result.params.delim.token.inner[0].token.value).to.be("x");

  });
});

describe("expand", function() {
    it("should load a simple id macro", function() {
        var res = expand(read("macro m { case $x => { $x } }\nm 42"));
        expect(res[0].lit.token.value).to.be(42);
    });

    it("should enforest/flatten a delimiter", function() {
      var res = flatten(expand(read("(2+2)")));

      expect(res.length).to.be(6);
      expect(res[0].token.value).to.be("(");
      expect(res[1].token.value).to.be(2);
    });

    // it("should enforest/flatten a call with an anonymous fun", function() {
    //   var res = flatten(expand(read("foo('bar', function(a) { return 2; })")));
    //   console.log(res)
    // });
})
