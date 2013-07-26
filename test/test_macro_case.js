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
                return [makeSyntax (42, null)];
			}
		}
		expect(m()).to.be(42);
	}

	$it "should make a array syntax object" {
		macro m {
			case { () } => {
                return [makeSyntax ([42, 24], null)];
			}
		}
		expect(m()).to.eql([42, 24]);
	}
}
