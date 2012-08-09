should = require("should")
parser = require("../sweet")

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

  # it "should do what I want", ->
  #   mac = """(function(x) {
  #       macro m {
  #         function(stx) {
  #           return \#{x};
  #         }
  #       }
  #       m(2)
  #     })(1)"""

  #   parser.expand(mac).should.equal ""