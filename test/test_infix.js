var expect = require("expect.js");

describe("infix macros", function() {
    it("should allow infix matching", function() {
        macro swapm {
            rule infix { $lhs:expr | $rhs:expr } => {
                $rhs - $lhs
            }
        }
        expect(1 swapm 2).to.be(1);
        expect(1 swapm 2 swapm 3 swapm 4).to.be(-2);
    });

    it("should allow infix matching using a case pattern", function() {
        macro swapm {
            case infix { $lhs:expr | _ $rhs:expr } => {
                return #{ $rhs - $lhs }
            }
        }
        expect(1 swapm 2).to.be(1);
        expect(1 swapm 2 swapm 3 swapm 4).to.be(-2);
    });

    it("should allow infix matching in a var statement", function() {
        macro swapm {
            rule infix { $lhs:expr | $rhs:expr } => {
                $rhs - $lhs
            }
        }
        var foo = 1 swapm 2 swapm 3 swapm 4;
        expect(foo).to.be(-2);
    });

    it("should allow mixing of infix and prefix patterns", function() {
        macro m {
            rule infix { $lhs:expr | $rhs:expr } => {
                $lhs + $rhs
            }
            rule { $rhs:expr } => {
                ($rhs).toString()
            }
        }
        expect(1 m 2).to.be(3);
        expect(m 42).to.be("42");
    });

    it("should allow infix matching on the rhs of a binop", function() {
        macro m {
            rule infix { $lhs:expr - | $rhs:expr } => {
                $lhs + $rhs
            }
        }
        expect(1 - m 2).to.be(3);
    });

    it("should allow infix matching on the rhs of a unary op", function() {
        macro m {
            rule infix { - | $rhs:expr } => {
                $rhs + $rhs
            }
        }
        expect(- m 2).to.be(4);
    });

    it("should allow infix matching on the rhs of a keyword unary op", function() {
        macro m {
            rule infix { delete | $rhs:expr } => {
                $rhs + $rhs
            }
        }
        expect(delete m 2).to.be(4);
    });

    it("should not raise an assertion when the rhs has a pattern class and the syntax is an op", function() {
        macro m {
            rule infix { $lhs:expr | $rhs:expr } => {
                $lhs + $rhs
            }
            rule infix { $lhs | $rhs } => {
                $lhs $rhs
            }
        }
        expect(1 m 2).to.be(3);
        expect(typeof m 2).to.be('number');
    });

    it("should allow infix matching of repeaters", function() {
        macro m {
            rule infix { $num ... | } => {
                $num (-) ...
            }
        }
        expect(3 2 1 m).to.be(0)
    });

    it("should allow infix matching of repeaters with separators", function() {
        macro m {
            rule infix { $num (+) ... | } => {
                $num (-) ...
            }
        }
        expect(3 + 2 + 1 m).to.be(0)
    });

    it("should allow infix matching of complex operator expressions", function() {
        macro m {
            rule infix { $lhs:expr + | $rhs:expr } => {
                $rhs - $lhs
            }
        }
        expect(4 * (2 + 1) - 3 + m 5).to.be(-4)
    });

    it("should allow infix matching within assignment expressions", function() {
        macro m {
            rule infix { $lhs:expr | } => {
                2 * $lhs
            }
        }
        var a;
        a = 42 + 1 m;
        expect(a).to.be(86);
    });

    it("should allow infix matching past expressions", function() {
        var a;
        macro end {
            rule infix { start $e:expr (;) ... | } => {
                a = $e (-) ...
            }
        }
        start
          1 + 2;
          3 * 4;
        end;
        expect(a).to.be(-9);
    });

    it("should allow infix matching on a return statement", function() {
        macro m {
            rule infix { return $value:expr | } => {
                return 42
            }
        }
        function f() {
            return 12 m;
        }
        expect(f()).to.be(42);
    });

    it("should allow infix matching on 1 non-expr term in expression position", function() {
        macro m {
            rule infix { for | $x } => {
                $x
            }
        }
        var a = for m 42;
        expect(a).to.be(42);
    });

});
