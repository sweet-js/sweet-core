should = require("should")
parser = require("../sweet")
gen = require "escodegen"

describe "expander", ->
  mac1 = """
  var z = (function (x) {

    macro m {
      function(stx) {
        return #'x
      }
    }

    return function (x) {
      return m() + x;
    };

  })(1);

  z(42);
  """
  mac2 = """
  function (x) {
    macro n {
      function(stx) {
        return #'function()
      }
    }
  }
  """

  it "should do what I want", ->
    mac = """(function(x) {
        macro add {
          function add(stx) {
            var res = [stx[0]];
            res.push({
              type: 7,
              value: "+",
            });
            res.push(stx[1]);
            return res;
          }
        }
        add(2 2);
      })(1)"""

    # parser.read("2+2").should.equal "";
    gen.generate(parser.parse(mac)).should.equal ""