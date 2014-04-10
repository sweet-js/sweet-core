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
		unaryop neg 0 {$op} => #{ -$op }

		expect(neg 100).to.be(-100);
		expect(neg 100 + 100).to.be(-200);
	});

	it("should handle custom precedence correctly", function() {
		unaryop minus 14 {$op} => #{-$op}

		expect(minus 1 - 10).to.be(-11);
	})

	it("should handle multi token unary operators", function() {
		unaryop (<!>)  14 {$op} => #{!$op}
		expect(<!>true).to.be(false);
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
		binaryop plus 12 left { $lhs, $rhs } => #{ $lhs + $rhs }
		expect(100 plus 100).to.be(200);
	});

	it("should handle associativity", function() {
		function sub(x, y) { return x - y; }
		binaryop minusl 12 left { $lhs, $rhs } => #{ sub($lhs, $rhs) }
		binaryop minusr 12 right { $lhs, $rhs } => #{ sub($lhs, $rhs) }

		expect(10 minusl 5 minusl 3).to.be(2);
		expect(10 minusr 5 minusr 3).to.be(8);
	});

	it("should coexist with infix macros", function() {
		function a(l, r) { return 42; }
		binaryop answer 12 right { $lhs, $rhs } => #{ a($lhs, $rhs) }
		macro m {
			rule infix { $l answer | $r } => { 100 }
		}
		expect(10 answer 10).to.be(42);
		expect(10 answer m 10).to.be(100);
		expect(10 answer 10 answer m 10).to.be(42);
	});

	it("should work with multi token names", function() {
		binaryop (instance?) 12 left { $lhs, $rhs } => #{ $lhs instanceof $rhs }
		expect({} instance? Object).to.be(true);
	});

	it("should handle basic multi token punctuator operators", function() {
		function bar(x) { return x + 1; }
		function baz(x) { return x + 1; }
		binaryop (|>) 0 left { $left, $right } => #{ $right($left) }
		var foo = 1 |> bar |> baz;	
		expect(foo).to.be(3);
	});

	it("should handle assoc for multi token operators", function() {
		function minus(x, y) { return x - y; }

		binaryop (<->) 0 left { $lhs, $rhs } => #{ minus($lhs, $rhs) }
		binaryop (<-->) 0 right { $lhs, $rhs } => #{ minus($lhs, $rhs) }

		expect(10 <-> 5 <-> 3).to.be(2);
		expect(10 <-> (5 <-> 3)).to.be(8);

		expect(10 <--> 5 <--> 3).to.be(8);
		expect(10 <--> (5 <--> 3)).to.be(8);
		expect((10 <--> 5) <--> 3).to.be(2);
	});


});
