var expect = require("expect.js");

describe("unary custom operators", function() {
	it("should match for the primitive operator form", function() {
		unaryop (neg) 0 {
			macro {
				rule { $op:expr } => { - $op }
			}
		}
		expect(neg 100).to.be(-100);
		expect(neg 100 + 100).to.be(-200);
	});

	it("should match with sugar form", function() {
		operator neg 0 {$op} => #{ -$op }

		expect(neg 100).to.be(-100);
		expect(neg 100 + 100).to.be(-200);
	});

	it("should handle custom precedence correctly", function() {
		operator minus 14 {$op} => #{-$op}

		expect(minus 1 - 10).to.be(-11);
	})

	it("should handle multi token unary operators", function() {
		operator (<!>)  14 {$op} => #{!$op}
		expect(<!>true).to.be(false);
	})

  it("should coexist with infix macros", function() {
      macro m {
          rule infix { $l | } => { 5 }
      }
      operator o 0 {$o} => #{ $o - 2 }
      expect(o 3 m).to.be(3);
  })
});

describe("binary custom operators", function() {
	it("should match for the primitive operator form", function() {
		binaryop (plus) 12 left {
			macro {
				rule { ($left:expr) ($right:expr) } => {
					$left + $right
				}
			}
		}
		expect(100 plus 100).to.be(200);
	});

	it("should match with the sugar form", function() {
		operator plus 12 left { $lhs, $rhs } => #{ $lhs + $rhs }
		expect(100 plus 100).to.be(200);
	});

	it("should handle associativity", function() {
		function sub(x, y) { return x - y; }
		operator minusl 12 left { $lhs, $rhs } => #{ sub($lhs, $rhs) }
		operator minusr 12 right { $lhs, $rhs } => #{ sub($lhs, $rhs) }

		expect(10 minusl 5 minusl 3).to.be(2);
		expect(10 minusr 5 minusr 3).to.be(8);
	});

	it("should coexist with infix macros", function() {
		function a(l, r) { return 42; }
		operator answer 12 right { $lhs, $rhs } => #{ a($lhs, $rhs) }
		macro m {
			rule infix { $l answer | $r } => { 100 }
		}
		expect(10 answer 10).to.be(42);
		expect(10 answer m 10).to.be(100);
		expect(10 answer 10 answer m 10).to.be(42);
	});

	it("should work with multi token names", function() {
		operator (instance?) 12 left { $lhs, $rhs } => #{ $lhs instanceof $rhs }
		expect({} instance? Object).to.be(true);
	});

	it("should handle basic multi token punctuator operators", function() {
		function bar(x) { return x + 1; }
		function baz(x) { return x + 1; }
		operator (|>) 0 left { $left, $right } => #{ $right($left) }
		var foo = 1 |> bar |> baz;
		expect(foo).to.be(3);
	});

	it("should handle assoc for multi token operators", function() {
		function minus(x, y) { return x - y; }

		operator (<->) 0 left { $lhs, $rhs } => #{ minus($lhs, $rhs) }
		operator (<-->) 0 right { $lhs, $rhs } => #{ minus($lhs, $rhs) }

		expect(10 <-> 5 <-> 3).to.be(2);
		expect(10 <-> (5 <-> 3)).to.be(8);

		expect(10 <--> 5 <--> 3).to.be(8);
		expect(10 <--> (5 <--> 3)).to.be(8);
		expect((10 <--> 5) <--> 3).to.be(2);
	});

	it("should work with both unary and binary in the same expression", function() {
		operator - 12 left { $l, $r } => #{ $l + $r }
		operator - 12 { $o } => #{ +$o }
		expect(10 - -10).to.be(20);
	});

	it("should work with return statements and line numbers", function() {
		function id(x) { return x; }
		operator (|>)  1 left  { $l, $r } => #{ $r($l) }
		function doIt(data) {
			return data
					|> id
		}
		expect(doIt(100)).to.be(100)
	});

    it("should handle mixing unary and binary operators", function() {
        // testing a regression that was causing expressions with
        // custom operators separated by ; to break
        function foo() {
            operator ! 14 { $op } => #{ not($op) }
            operator + 12 left { $left, $right } => #{ add($left, $right) }
            function add() {}
            function not() {}

            2 + 2;
            !2;
            return true;
        }
        expect(foo()).to.be(true);
    });

    it("should mix well with the ternary operator", function() {
        operator + 12 left { $l, $r } => #{ plus($l, $r) }
        function plus(l, r) { return l - r; }

        expect(2 + 2 ? true : false).to.be(false);
    })
});

describe("builtin operators", function() {
	it("should work with mixing unary and binary operators", function() {
		var i = 100;
		expect(--i >= 0).to.be(true);
	})
})
