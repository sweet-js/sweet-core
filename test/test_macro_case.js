#lang "../macros/stxcase.js";
var expect = require("expect.js");

stxnonrec describe {
    case {_ $description:lit { $body ... } } => {
        return syntax {
            describe($description, function() {
                $body ...
            });
        }
    }
}

stxnonrec it {
    case {_ $description:lit { $body ... }} => {
        return syntax {
            it($description, function() {
                $body ...
            });
        }
    }
}

describe "procedural (syntax-case) macros" {
    it "should make a literal syntax object" {
        stxrec m {
            case { _ () } => {
                return [makeValue (42, #{here})];
            }
        }
        expect(m()).to.be(42);
    }

    it "should work with syntax" {
        stxrec m {
            case { _ () } => {
                return syntax { 42 }
            }
        }
        expect(m()).to.be(42);
    }

    it "should work with #" {
        stxrec m {
            case { _ () } => {
                return #{ 42 }
            }
        }
        expect(m()).to.be(42);
    }


    it "should handle returning a single pattern variable" {
        stxrec m {
            case { _ ($x:expr) } => {
                return #{ $x }
            }
        }
        expect(m(42)).to.be(42);
        expect(m(42 + 24)).to.be(42 + 24);
    }

    it "should handle a repeated pattern in the template" {
        stxrec m {
            case { _ ($x ...) } => {
                return #{ [$x (,) ...] }
            }
        }
        expect(m(1 2 3)).to.eql([1,2,3]);
    }

    it "should support withSyntax" {
        stxrec m {
            case {_ $x } => {
                return withSyntax($y = [makeValue(42, #{here})]) {
                    return #{
                        $x + $y
                    }
                }
            }
        }
        expect(m 100).to.be(142);
    }

    it "withSyntax should only modify its own scope" {
        stxrec test {
            case { _ $x } => {
                function foo() {
                    return #{ $x };
                }
                var x = #{ 12 };
                return withSyntax($x = x) {
                    return foo();
                }
            }
        }
        expect(test 42).to.be(42)
    }

    it "should support withSyntax with multiple patterns" {
        stxrec m {
            case {_ $x } => {
                return withSyntax($y = [makeValue(10, #{here})],
                                  $z = [makeValue(20, #{here})]) {
                    return #{$x + $y + $z}
                }
            }
        }
        expect(m 5).to.be(35);
    }

    it "should support withSyntax with repeaters" {
        stxrec m {
            case {_ $x } => {
                return withSyntax($y ... = [makeValue(10, #{here}),
                                            makePunc('+', #{here}),
                                            makeValue(20, #{here})],
                                  $z = [makeValue(30, #{here})]) {
                    return #{$x + $y ... + $z}
                }
            }
        }
        expect(m 5).to.be(65);
    }

    it "should support shorthand withSyntax form" {
        stxrec m {
            case {_ $x } => {
                return withSyntax($y = [makeValue(42, #{here})]) #{
                    $x + $y
                }
            }
        }
        expect(m 100).to.be(142);
    }

    it "should support let bound macros" {
        stxnonrec m {
            case {_ $x} => {
                return #{$x}
            }
        }

        expect(m 42).to.be(42);
    }

    it "should support let bound macros" {
        stxnonrec function {
            case {_ $x} => {
                return #{function foo() { return $x; } }
            }
        }

        expect((function 42)()).to.be(42);
    }

    it "should unwrap the context syntax array for makeDelim" {
        stxrec $delim {
            case { $$mac $val } => {
                var d = makeDelim('[]', #{$val}, #{$$mac});
                return [d];
            }
        }

        expect($delim 42).to.eql([42]);
    }

    it "should unwrap single element arrays in unwrapSyntax" {
        stxrec m {
            case {_ () } => {
                var num = unwrapSyntax(#{42})
                return [makeValue(num, #{here})];
            }
        }
        expect(m()).to.be(42);
    }

    it "should handle negative numbers in makeValue" {
        stxrec m {
            case {_ () } => {
                return [makeValue(-42, #{here})];
            }
        }
        expect(m()).to.be(-42);
    }

    it "should handle NaN in makeValue" {
        stxrec m {
            case {_ () } => {
                return [makeValue(0/0, #{here})];
            }
        }
        var n = m();
        expect(n).to.be.a('number');
        expect(n).not.to.equal(n);
    }

    // it "should handle letstx" {
    //     stxnonrec l {
    //         case {_ $x } => {
    //             letstx $y = [makeValue(42, #{here})];
    //             return #{ $x + $y }
    //         }
    //     }
    //     expect(l 100).to.be(142);
    // }

    // it "should handle letstx with multiple patterns" {
    //     stxnonrec l {
    //         case {_ $x } => {
    //             letstx $y = [makeValue(42, #{here})], $z = [makeValue(100, #{here})];
    //             return #{ $x + $y + $z}
    //         }
    //     }
    //     expect(l 100).to.be(242);
    // }

    // it "should handle letstx with repeaters" {
    //     stxnonrec l {
    //         case {_ $x } => {
    //             letstx $y ... = [makeValue(10, #{here}),
    //                                         makePunc('+', #{here}),
    //                                         makeValue(20, #{here})],
    //                    $z = [makeValue(30, #{here})];
    //             return #{$x + $y ... + $z}
    //         }
    //     }
    //     expect(l 5).to.be(65);
    // }

    // it "should handle syntax quotes on the rhs of letstx" {
    //     stxnonrec l {
    //         case {_ $x } => {
    //             letstx $y = #{ $x + 1 };
    //             return #{ $y };
    //         }
    //     }
    //     expect(l 1).to.be(2);
    // }

    it "should handle getExpr" {
        stxnonrec m {
            case {_ ($e ...) } => {
                var e = getExpr(#{$e ...});
                if (e.success && unwrapSyntax(e.result[0]) === 2) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m (2 + 2)).to.be(true);
        expect(m (5 + 2)).to.be(false);
        expect(m ()).to.be(false);
        expect(m (function ())).to.be(false);

        (function() {
            // make sure the locally scoped macro `id` expands in the getExpr
            stxnonrec id { rule { $x } => { $x } }
            expect(m (id 2 + 2)).to.be(true);
        })();
    }

    it "should handle getId/getLit" {
        stxnonrec m {
            case {_ ($id ...) ($lit ...) } => {
                var i = getIdent(#{$id ...});
                var l = getLit(#{$lit ...});
                if (i.success && l.success) {
                    return #{"idlit"}
                } else if (i.success && !l.success) {
                    return #{"id"}
                } else if (l.success) {
                    return #{"lit"}
                } else {
                    return #{"other"}
                }
            }
        }
        expect (m (id foo) (100 200)).to.be("idlit")
        expect (m (id foo) (id 200)).to.be("id")
        expect (m (100 foo) (100 200)).to.be("lit")
        expect (m (100 foo) (id 200)).to.be("other")
    }

    // it "should handle taking the lexical context from a delimiter" {
    //     stxnonrec m {
    //         case {_ $tok } => {
    //             letstx $foo = [makeIdent("foo", #{$tok})];
    //             return #{$foo}
    //         }
    //     }
    //
    //     var foo = 100;
    //     expect(m ()).to.be(100);
    // }

    it "should handle localExpand" {
        stxnonrec m {
            case {_ ($e ...) } => {
                var e = localExpand(#{$e ...});
                if (unwrapSyntax(e[0]) === 42) {
                    return #{true}
                }
                return #{false}
            }
        }
        stxnonrec id { rule { $x } => { $x } }
        expect(m (id 42)).to.be(true);
    }

    it "should handle localExpand with macros inside functions" {
        stxrec ex {
            case {_ { $body ... } } => {
                return localExpand(#{$body ...});
            }
        }

        var f = ex {
            function foo(x) {
                stxrec arg {
                    rule {} => { x }
                }
                return {
                    normal_x: x,
                    macro_x: arg
                };
            }
        }
        expect(f(42).normal_x).to.be(42);
        expect(f(42).macro_x).to.be(42);
    }

}

describe "syntax objects" {
    it "should have identifier testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeIdent("foo", null);
                if (s.isIdentifier()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have number testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeValue(42, null);
                if (s.isNumericLiteral()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have string testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeValue("foo", null);
                if (s.isStringLiteral()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have boolean testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeValue(true, null);
                if (s.isBooleanLiteral()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have null testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeValue(null, null);
                if (s.isNullLiteral()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have keyword testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeKeyword("for", null);
                if (s.isKeyword()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have regexp testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeRegex("abc", "i", null);
                if (s.isRegularExpression()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have punctuator testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makePunc(";", null);
                if (s.isPunctuator()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have punctuator testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makePunc(";", null);
                if (s.isPunctuator()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

    it "should have delimiter testing functions" {
        stxnonrec m {
            case {_} => {
                var s = makeDelim("()", [], null);
                if (s.isDelimiter()) {
                    return #{true}
                }
                return #{false}
            }
        }
        expect(m).to.be(true);
    }

}
