var expect = require("expect.js")

describe("macro expander", function() {
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

  it("should expand a macro with a pattern `($x:lit) <+> $y:lit`", function() {
    macro oddadd {
      case (($x:lit) <+> $y:lit) => {
        $x + $y
      }
    }
    var z = oddadd((2) <+> 4);
    expect(z).to.be(6);

  });

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

  it("should expand with ellipses", function() {
    macro paren {
      case ( $x:lit (,) ...) => {
        [$x (,) ...]
      }
    }
    var z = paren (4, 3);

    expect(z[0]).to.be(4);
    expect(z[1]).to.be(3);
  });

  it("should expand literal parens with ellipses", function() {
    macro paren {
      case ( ($x:lit) (,) ...) => {
        [$x (,) ...]
      }
    }
    var z = paren ((4), (3));

    expect(z[0]).to.be(4);
    expect(z[1]).to.be(3);
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
      case ( $($x = $v:expr) (,) ...) {$y:expr} => {
        (function($x (,) ...) { return $y; })($v (,) ...);
      }
    }

    var foo = lett (z = 1, t = 5 + 2) {z+t}

    expect(foo).to.be(8)
  });

  it("should handle ellipses in output delimiters", function() {
    macro m {
      case ( $x:lit (,) ...) => {
        [[$x] (,) ...]
      }
    }
    var x = m ( 1, 2, 3 );
    expect(x).to.eql([[1],[2],[3]]);
  });

  it("should expand simple nested ellipses", function() {
    macro nest {
      case ( ($x:lit (,) ...) (,) ... ) => {
        [ [$x (,) ...] (,) ...]
      }
    }
    var x = nest ( (1, 2, 3), (4, 5, 6) );
  });

  // it("should expand a nested ellipses macro", function() {
  //   macro nest {
  //     case ( ($x:lit ; $y:lit (,) ...) (,) ...) => {
  //       [ [$x (,) ...], [$y (,) ...] ... ]
  //     }
  //   }

  //   var foo = nest ( (1; 2,3,4,5), (10; 11, 12, 13, 14, 15) );

  //   expect(foo[0]).to.eql([1,10]);
  //   expect(foo[1]).to.eql([2,3,4,5, 11, 12, 13, 14, 15]);
  // });

  // it("should expand an ellipses with a ; delimiter", function() {
  //   macro semi {
  //     case ( $x:lit (;) ...) => {
  //       [$x (,) ...]
  //     }
  //   }
  //   var a = semi(1;2;3;4);
  //   expect(a.length).to.be(4);
  //   expect(a[1]).to.be(2);
  // });


  // it("should expand a repeated delimiter in the macro body", function() {
  //   macro delim {
  //     case ($x:lit ...) => {
  //       var x = ($x) (,) ...
  //     }
  //   }
  //   delim (1 2 3)
  // });

  // it("should expand an ellipsese no separator", function() {
  
  //     case ($x:ident ...) => {
  //       var $($x = 2) (,) ...
  //     }
  //   }
  //   semi(w x y z)
  //   expect(w).to.be(2);
  //   expect(x).to.be(2);
  //   expect(y).to.be(2);
  //   expect(z).to.be(2);
  // });

});
