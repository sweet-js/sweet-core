var expect = require("expect.js");

macro $describe {
    case {_ $description:lit { $body ... } } => {
        return syntax {
            describe($description, function() {
                $body ...
            });
        }
    }
}

macro $it {
    case {_ $description:lit { $body ... }} => {
        return syntax {
            it($description, function() {
                $body ...
            });
        }
    }
}

$describe "procedural (syntax-case) macros" {
	$it "should make a literal syntax object" {
		macro m {
			case { _ () } => {
                return [makeValue (42, null)];
			}
		}
		expect(m()).to.be(42);
	}

    $it "should work with syntax" {
        macro m {
            case { _ () } => {
                return syntax { 42 }
            }
        }
        expect(m()).to.be(42);
    }

    $it "should work with #" {
        macro m {
            case { _ () } => {
                return #{ 42 }
            }
        }
        expect(m()).to.be(42);
    }


    $it "should handle returning a single pattern variable" {
        macro m {
            case { _ ($x:expr) } => {
                return #{ $x }
            }
        }
        expect(m(42)).to.be(42);
        expect(m(42 + 24)).to.be(42 + 24);
    }

    $it "should handle a repeated pattern in the template" {
        macro m {
            case { _ ($x ...) } => {
                return #{ [$x (,) ...] }
            }
        }
        expect(m(1 2 3)).to.eql([1,2,3]);
    }

    // $it "should support with-syntax" {
    //     macro withSyntax {
    //         case { ($p = $e:expr) { $body ... } } => {
    //             return #{
    //                 macro _with {
    //                     case { ($p) } => {
    //                         return syntax { $body ... }
    //                     }
    //                 }
    //                 var x = $e;
    //                 _with(x)
    //             }
    //         }
    //     }
    //     macro m {
    //         case { () } => {
    //             var foo = makeValue("foo", null);

    //             withSyntax($x = makeValue(42, null)) {
    //                 return #{
    //                     $x
    //                 }
    //             }
    //         }
    //     }
    //     expect(m()).to.be("42");
    // }
}
