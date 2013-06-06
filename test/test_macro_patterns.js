var expect = require("expect.js");

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

    it("should match primary expressions", function() {
        macro expr {
            case ($x:expr) => { $x }
        }
        expect(expr(this)).to.be(this);

        var foo = 42;
        expect(expr(foo)).to.be(42);

        expect(expr(42)).to.be(42);

        expect(expr([1,2,3])).to.eql([1,2,3]);
    });

    it("should match simple ternary expression", function() {
        macro m {
            case ($x:expr) => {$x}
        }

        var x = m (true ? 42 : "foo") 
        expect(x).to.be(42);
    }); 

    it("should match a complex ternary expression", function() {
        macro m {
            case ($x:expr) => {$x}
        }

        var x = m (2+4 > 0 ? 20 + 22 : "foo" + "bar") 
        expect(x).to.be(42);
        
    });

    it("should match binary expressions", function() {
        macro expr {
            case ($x:expr) => {
                $x
            }
        }
        var z1 = expr(2 + 2);
        var z2 = expr(2 * 2);
        var z3 = expr(2 + 2 * 2);
        expect(z1).to.be(4);
        expect(z2).to.be(4);
        expect(z3).to.be(6);
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
            case ($x:ident) {$y:expr} => {
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


    it("should distinguish between commas and no commas in a repeat", function() {
        macro m {
            case ($p ...) => {
                "no commas"
            }
            case ($p (,) ...) => {
                "comma"
            }
        }
        expect(m (a b)).to.be("no commas");
    });

    it("should match as much of the pattern as possible if not in a delimiter even when more syntax follows", function() {
        macro m {
            case $p (,) ... => {
                [$p (,) ...];
            }
        }
        var res = m 1, 2, 3 "trailing";
        expect(res).to.eql([1,2,3]);
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
        macro let {
            case ($x:ident = $v:expr) {$y:expr} => {
                (function($x) { return $y; })($v);
            }
        }

        var foo = let (z = 1) {z+2}

        expect(foo).to.be(3)
    });


    it("should expand a complex let macro", function() {
        macro let {
            case ( $($x:ident = $v:expr) (,) ...) {$y:expr} => {
                (function($x (,) ...) { return $y; })($v (,) ...);
            }
        }

        var foo = let (z = 1, t = 5 + 2) {z+t}

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

    it("should work", function() {
        macro m {
            case { $($a $b) ... } => {
                [$([$a, $b]) (,) ...];
            }
        }

        var x = m { 1 2 3 4 }

        expect(x).to.eql([[1, 2], [3, 4]])
    });

    it("should expand simple nested ellipses", function() {
        macro nest {
            case ( ($x:lit (,) ...) (,) ... ) => {
                [ [$x (,) ...] (,) ...]
            }
        }
        var x = nest ( (1, 2, 3), (4, 5, 6) );
    });

    it("should expand a nested ellipses macro", function() {
        macro nest {
            case ( ($x:lit ; $y:lit (,) ...) (,) ...) => {
                [ [$x (,) ...], [$y (,) ...] (,) ... ]
            }
        }

        var foo = nest ( (1; 2,3,4,5), (10; 11, 12, 13, 14, 15) );

        expect(foo[0]).to.eql([1,10]);
        expect(foo[1]).to.eql([2,3,4,5]);
        expect(foo[2]).to.eql([11, 12, 13, 14, 15]);
    });

    it("should expand an ellipsis with a ; delimiter", function() {
        macro semi {
            case ( $x:lit (;) ...) => {
                [$x (,) ...]
            }
        }
        var a = semi(1;2;3;4);
        expect(a.length).to.be(4);
        expect(a[1]).to.be(2);
    });


    it("should expand an ellipsis with no separator", function() {
        macro semi {
            case ($x:ident ...) => {
                var $($x = 2) (,) ...
            }
        }
        semi(w x y z);
        expect(w).to.be(2);
        expect(x).to.be(2);
        expect(y).to.be(2);
        expect(z).to.be(2);
    });

    it("should handle def macro", function() {
        macro def {
            case $name:ident ($params:ident (,) ...) $body => {
                function $name ($params (,) ...) {
                    $body
                }
            }
        }
        def add (a, b) {
            return a + b;
        }

        expect(add(2,2)).to.be(4);
    });


    it("should handle multiple cases", function() {
        macro m {
            case four => {
                4
            }
            case two => {
                2
            }
        }
        var n = m four;
        expect(n).to.be(4)
        var n = m two;
        expect(n).to.be(2)
    });

    it("should handle multiple cases when matching different length patterns", function() {
        macro arrid {
            case [$x:lit] => {
                [$x]
            }
            case [$x:lit, $y:lit] => {
                [$x, $y]
            }
        }

        var l = arrid [1]
        expect(l).to.eql([1])

        var ll = arrid [1,2]
        expect(ll).to.eql([1, 2])
    });

    it("should handle more multiple cases", function() {
        macro m {
            case $n:ident => {42}
            case $n:ident < $m:ident {} => {42}
        }
        var z = m foo;
        var zz = m foo < foo {};
        expect(z).to.be(42);
        expect(zz).to.be(42);
    });

    it("should handle recursive macros", function() {
        macro rot {
            case [$x:lit] => {
                    [$x]
            }
            case [$x:lit, $y:lit] => {
                [rot [$y], $x]
            }
        }

        var l = rot [1]
        expect(l).to.eql([1])

        var ll = rot [1,2]
        expect(ll).to.eql([[2], 1])
    });

    it("should handle mutually recursive macros", function() {
        macro a {
            case [$x:lit] => {
                b ($x)
            }
        }
        macro b {
            case ($x:lit) => {
                [$x]
            }
            case ($x:lit, $y:lit) => {
                a [$x]
            }
        }
        var z = b (1, 2);
        expect(z).to.eql([1])
    });

    it("should allow macro defining macros", function() {
        macro mm {
            case ($x:lit) => {
                macro m {
                    case ($y:lit) => {
                        [$x, $y]
                    }
                }
            }
        }

        mm (42)
        var z = m (24);
        expect(z).to.eql([42,24])
    });

    it("should allow matching of unparsed tokens", function() {
        macro m {
            case ($x) => {
                $x
            }
        }
        var z = m ([1,2,3]);
        expect(z).to.eql([1,2,3])
    });

    it("should allow literal syntax", function() {
        macro m {
            case $x => {
                macro $x {
                    case ($y $[...]) => {
                        [$y (,) $[...]];
                    }
                }
            }
        }

        m n;
        var x = n (42 24);
        expect(x[0]).to.be(42);
        expect(x[1]).to.be(24);
    });

    it("should allow literal syntax with pattern var literals", function() {
        macro $test {
            case ($op (|) ...) => {
                macro rel {
                    case $x => { $x }
                    $(case ($x $op $y) => { 1 }) ...
                }
            }
        }

        $test (<|>)
        rel(1 < 2 < 3)
    });

    it("should allow a case to fail while not purtubing the remaining cases", function() {
        macro m {
            case { $y:expr DONTMATCH } => {
                $y
            }
            case { $y:expr } => {
                $y
            }
        }

        function c() {
            return 42;
        }

        var myobj = { baz: function(param) { return param; }};
        var x = m { myobj.baz(c()) }
        expect(x).to.be(42);
    });

    it("should not fail with tokens that are on an object's prototype chain", function() {
        // (had been using an object naively as a dictionary so make sure we don't regress)
        macro m {
            case () => {
                this.constructor
            }
        }

        m ();
    });

    it("should allow fn calls as an :expr", function() {
        macro m {
            case ($x:expr) => {$x}
        }
        function id (x) { return x; }
        var x = m( id(4) );
    });

});
