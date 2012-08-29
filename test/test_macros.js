var expect = require("expect.js")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  it("should expand a macro with pattern `$x:lit`", function() {
    macro id {
      case ($x:lit) => {
        $x
      }
    }
    var z = id(4);
    expect(z).to.equal(4);
  });

  it("should expand a macro with pattern `=> $x:lit`", function() {
    macro litid {
      case (=> $x:lit) => {
        $x
      }
    }    
    var z = litid(=> 42);
    expect(z).to.equal(42);
  });

  it("should expand a macro with a pattern `$x:lit <+> $y:lit`", function() {
    macro oddadd {
      case ($x:lit <+> $y:lit) => {
        $x + $y
      }
    }
    var z = oddadd(2 <+> 4);
    expect(z).to.be(6);
  });

  // it("should expand a macro with a pattern `($x:lit) <+> $y:lit`", function() {
  //   macro oddadd {
  //     case (($x:lit) <+> $y:lit) => {
  //       $x + $y
  //     }
  //   }
  //   var z = oddadd((2) <+> 4);
  //   expect(z).to.be(6);

  // });

  it("should expand a macro with a pattern `$x:expr`", function() {
    macro expr {
      case ($x:expr) => {
        $x
      }
    }
    var z = expr(2 + 2);
    expect(z).to.be(4);

  });

  it("should expand a macro with a pattern `$x:expr plus! $y:expr`", function() {
    macro expr {
      case ($x:expr plus! $y:expr) => {
        $x + $y
      }
    }
    var z = expr(2 * 4 plus! 2 * 2);
    expect(z).to.be(12);

  });

  it("should expand a thunk macro", function() {
    macro thunk {
      case ($x:expr) => {
        function() { return $x; }
      }
    }
    var z = thunk(2 * 4);
    expect(z()).to.be(8);
  });


  it("should expand multiple macro body types", function() {
    macro assign {
      case ($x) {$y:expr} => {
        var $x = $y;
      }
    }

    assign (z) {2+2}

    expect(z).to.be(4);
  });


  it("should expand literal braces", function() {
    macro paren {
      case ({$x:lit}) => {
        [$x]
      }
    }
    var z = paren ({4});

    expect(z[0]).to.be(4);
  });

  it("should expand literal parens", function() {
    macro paren {
      case (($x:lit)) => {
        [$x]
      }
    }
    var z = paren ((4));

    expect(z[0]).to.be(4);
  });

  it("should expand a simple let macro", function() {
    macro lett {
      case ($x = $v:expr) {$y:expr} => {
        (function($x) { return $y; })($v);
      }
    }

    var foo = lett (z = 1) {z+2}

    expect(foo).to.be(3)
  });


  it("should expand a complex let macro", function() {
    macro lett {
      case ( ($x = $v:expr) ___ ) {$y:expr} => {
        (function($x ___) { return $y; })($v ___);
      }
    }

    var foo = lett (z = 1, t = 5 + 2) {z+t}

    expect(foo).to.be(8)
  });

  // it("should expand a nested ellipses macro", function() {
  //   macro nest {
  //     case ( (($x:lit ; $y:lit ___)) ___ ) => {
  //       [ [$x ___], [$y ___] ___]
  //     }
  //   }

  //   var foo = nest ( (1; 2,3,4,5), (10; 11, 12, 13, 14, 15) )

  //   expect(foo).to.be(8)
  // });
 


});
