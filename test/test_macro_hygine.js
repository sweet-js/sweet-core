var expect = require("expect.js")

describe("macro hygine", function() {

  it("should work for or macro", function() {

    macro or {
      case ($x:expr, $y:expr) => {
        (function($tmp) {
          return $tmp ? $tmp : $y;
        })($x);
      }
    }

    (function($tmp) {
      var z = or(false, $tmp)
      expect(z).to.be("ok");
    })("ok");

  });

  it("should work for a binding outside of the macro def", function() {

    var z = (function(x) {

      macro m {
        case ($ignore:ident) => {
          x
        }
      }

      return (function (x) {
        return m(_) + x;
      })(22)

    })(1);
    expect(z).to.be(23)
  });


  it("should not rename object idents if they are the same as vars", function() {
    var o = (function (x) {
      return {
        x: x
      }
    })(42)

    expect(o.x).to.be(42);
  });

  it("should not rename object dot accesses", function() {
    var n = (function (o, x) {
      return o.x;
    })({x: 42})
    
    expect(n).to.be(42)
  });


  // todo this test needs a better api (syntax-case?)

  // it("should work for another variant of hygine", function() {
  //   (function(x) {

  //     macro n {
  //       case ($stx:lit) => {
  //         function(x) {
  //           // want a way to distinguish between the two versions of x
  //           return x + x
  //         }
  //       }
  //     }

  //   })(42);
  // });

  // it("should work for the or macro with var", function() {
  //   macro or {
  //     case ($x:expr, $y:expr) => {
  //       (function() {
  //         var $tmp = $x;
  //         return $tmp ? $tmp : $y;
  //       })();
  //     }
  //   }

  //   var $tmp = "ok"
  //   var z = or(false, $tmp);
  //   expect(z).to.be("ok");
  // });

});
