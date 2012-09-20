var expect = require("expect.js")

describe("macro hygiene", function() {

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

  it("should do the correct renaming without macros for vars", function() {
    var z = (function() {
      var x = 42;
      return (function() {
        var y = x;
        var x = "foo"
        return y
      })();
    })();
    expect(z).to.be(undefined)
  });

  it("should do the correct renaming without macros for vars and params", function() {
    var z = (function() {
      return (function(x) {
        var y = x;
        var x = "foo"
        return y
      })(42);
    })();
    expect(z).to.be(42)
  });

  it("should do the correct renaming with macros for vars", function() {
    macro m {
      case () => { var x = 5; }
    }
    var z = (function(x) {
      var y = x;
      m();
      return y;
    })("foo")
    expect(z).to.be("foo")
  });

  it("should work for vars with hoisting", function() {
    macro m {
      case $x:lit => {
        var tmp = $x;
      }
    }

    var tmp = "outer"
    m "inner"
    expect(tmp).to.be("outer");

  });

  it("should work for vars with hoisting and params", function() {
    function f(tmp) {
      macro m {
        case $x:lit => {
          var tmp = $x;
        }
      }

      var tmp = "outer"
      m "inner"
      expect(tmp).to.be("outer");
    }

    f("call")

  });

  it("should work for var with nested function", function() {
    macro m {
      case $x:lit => {
        var tmp = $x;
      }
    }
    function f() {
      var tmp = "outer"
      m "inner"
      expect(tmp).to.be("outer");
    }
    f();
  });


  // todo this test needs a better api (syntax-case?)

  // it("should work for another variant of hygiene", function() {
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
