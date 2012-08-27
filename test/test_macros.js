var expect = require("expect.js")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  it("should expand a macro with pattern `$x:lit`", function() {
    macro id "()" {
      case ($x:lit) => {
        $x
      }
    }
    var z = id(4);
    expect(z).to.equal(4);
  });

  it("should expand a macro with pattern `=> $x:lit`", function() {
    macro litid "()" {
      case (=> $x:lit) => {
        $x
      }
    }    
    var z = litid(=> 42);
    expect(z).to.equal(42);
  });

  it("should expand a macro with a pattern `$x:lit <+> $y:lit`", function() {
    macro oddadd "()" {
      case ($x:lit <+> $y:lit) => {
        $x + $y
      }
    }
    var z = oddadd(2 <+> 4);
    expect(z).to.be(6);

  });

  it("should expand a macro with a pattern `($x:lit) <+> $y:lit`", function() {
    macro oddadd "()" {
      case (($x:lit) <+> $y:lit) => {
        $x + $y
      }
    }
    var z = oddadd((2) <+> 4);
    expect(z).to.be(6);

  });

  it("should expand a macro with a pattern `$x:expr`", function() {
    macro expr "()" {
      case ($x:expr) => {
        $x
      }
    }
    var z = expr(2 + 2);
    expect(z).to.be(4);

  });

  it("should expand a macro with a pattern `$x:expr plus! $y:expr`", function() {
    macro expr "()" {
      case ($x:expr plus! $y:expr) => {
        $x + $y
      }
    }
    var z = expr(2 * 4 plus! 2 * 2);
    expect(z).to.be(12);

  });

  it("should expand a thunk macro", function() {
    macro thunk "()" {
      case ($x:expr) => {
        function() { return $x; }
      }
    }
    var z = thunk(2 * 4);
    expect(z()).to.be(8);
  });

  // it("should expand a comma separated list of literals", function() {
  //   macro call "()" {
  //     case ($x:lit ___) => {
  //       $x ___
  //     }
  //   }
  //   var z = call(1,2,3)
  //   expect(z).to.be(1)
  // });

});
