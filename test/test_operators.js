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
});

describe("binary custom operators", function() {
	if("should match for the primitive operator form", function() {
		binaryop (plus) 0 left {
			macro {
				rule { ($left:expr) ($right:expr) } => {
					$left + $right
				}
			}
		}
		expect(100 plus 100).to.be(200);
	});
	
	if("should match with the sugar form", function() {
		binaryop plus 0 left { $lhs, $rhs } => #{ $lhs + $rhs }
		expect(100 plus 100).to.be(200);
	});
});
