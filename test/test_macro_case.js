var expect = require("expect.js")

macro $describe {
    rule {$description:lit { $body ... }} => {
        describe($description, function() {
            $body ...
        });
    }
}

macro $it {
    rule {$description:lit { $body ... }} => {
        it($description, function() {
            $body ...
        });
    }
}

$describe "procedural (syntax-case) macros" {
	$it "should make a literal syntax object" {
		macro m {
			case { () } => {
                return [makeValue (42, null)];
			}
		}
		expect(m()).to.be(42);
	}

    $it "should work with syntax" {
        macro m {
            case { () } => {
                return syntax { 42 }
            }
        }
        expect(m()).to.be(42);
    }

    $it "should work with #" {
        macro m {
            case { () } => {
                return #{ 42 }
            }
        }
        expect(m()).to.be(42);
    }


    $it "should handle returning a single pattern variable" {
        macro m {
            case { ($x:expr) } => {
                return #{ $x }
            }
        }
        expect(m(42)).to.be(42);
        expect(m(42 + 24)).to.be(42 + 24);
    }

    $it "should handle a repeated pattern in the template" {
        macro m {
            case { ($x ...) } => {
                return #{ [$x (,) ...] }
            }
        }
        expect(m(1 2 3)).to.eql([1,2,3]);
    }
}
