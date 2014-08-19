var expect = require("expect.js");

describe("macro expander", function() {
    it("should expand a macro with an empty body", function() {
        macro m {
            case { _ () } => {
                return #{}
            }
        }

        m()
    })


    it("should expand a macro with pattern `$x:lit`", function() {
        macro id {
            case { _ ($x:lit) }  => {
                return #{ $x }
            }
        }
        var z = id(4);
        expect(z).to.equal(4);
    });

    it("should expand a macro with pattern `=> $x:lit`", function() {
        macro litid {
            case {_ (=> $x:lit)}  => {
                return #{$x}
            }
        }
        var z = litid(=> 42);
        expect(z).to.equal(42);
    });

    it("should expand a macro with a pattern `$x:lit <+> $y:lit`", function() {
        macro oddadd {
            case {_ ($x:lit <+> $y:lit)} => {
                return #{$x + $y}
            }
        }
        var z = oddadd(2 <+> 4);
        expect(z).to.be(6);
    });

    it("should expand a macro with a pattern `($x:lit) <+> $y:lit`", function() {
        macro oddadd {
            case {_ (($x:lit) <+> $y:lit)} => {
                return #{$x + $y}
            }
        }
        var z = oddadd((2) <+> 4);
        expect(z).to.be(6);

    });

    it("should match primary expressions", function() {
        macro expr {
            case {_ ($x:expr)} => { return #{$x} }
        }
        expect(expr(this)).to.be(this);

        var foo = 42;
        expect(expr(foo)).to.be(42);

        expect(expr(42)).to.be(42);

        expect(expr([1,2,3])).to.eql([1,2,3]);
    });

    it("should match simple ternary expression", function() {
        macro m {
            case {_ ($x:expr)} => {return #{$x}}
        }

        var x = m (true ? 42 : "foo")
        expect(x).to.be(42);
    });

    it("should match a complex ternary expression", function() {
        macro m {
            case {_ ($x:expr)} => { return #{$x}}
        }

        var x = m (2+4 > 0 ? 20 + 22 : "foo" + "bar")
        expect(x).to.be(42);

    });

    it("should match binary expressions", function() {
        macro expr {
            case {_ ($x:expr)} => {
                return #{$x}
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
            case {_ ($x:expr plus! $y:expr)} => {
                return #{
                 $x + $y
                }
            }
        }
        var z = expr(2 * 4 plus! 2 * 2);
        expect(z).to.be(12);

    });


    it("should expand a thunk macro", function() {
        macro thunk {
            case {_ ($x:expr)} => {
                return #{function() { return $x; }}
            }
        }
        var z = thunk(2 * 4);
        expect(z()).to.be(8);
    });


    it("should expand multiple macro body types", function() {
        macro assign {
            case {_ ($x:ident) {$y:expr}} => {
                return #{var $x = $y; }
            }
        }

        assign (z) {2+2}

        expect(z).to.be(4);
    });


    it("should expand literal braces", function() {
        macro paren {
            case {_ ({$x:lit})} => {
                return #{[$x]}
            }
        }
        var z = paren ({4});

        expect(z[0]).to.be(4);
    });

    it("should expand literal parens", function() {
        macro paren {
            case {_ (($x:lit))} => {
                return #{[$x]}
            }
        }
        var z = paren ((4));

        expect(z[0]).to.be(4);
    });


    it("should allow ... to match zero or more tokens", function() {
        macro m {
            case {_ ($x ...)} => {
                return #{
                    [$x (,) ...]
                }
            }
        }
        expect(m(1 2)).to.eql([1,2]);
        expect(m(1)).to.eql([1]);
        expect(m()).to.eql([]);
    });

    it("should allow an empty ... to recursively call a macro", function() {
        macro m {
            case {_ ()} => { return #{} }

            case { _ ($head $rest ...)} => {
                return #{
                    [$head m($rest ...)]
                }
            }
        }
        expect(m (1)).to.eql([1])

    });



    it("should distinguish between commas and no commas in a repeat", function() {
        macro m {
            case {_ ($p ...)} => {
                return #{ "no commas" }
            }
            case {_ ($p (,) ...)} => {
                return #{"comma"}
            }
        }
        expect(m (a b)).to.be("no commas");
    });

    it("should match as much of the pattern as possible if not in a delimiter even when more syntax follows", function() {
        macro m {
            case {_ $p (,) ...} => {
                return #{[$p (,) ...]; }
            }
        }
        var res = m 1, 2, 3 "trailing";
        expect(res).to.eql([1,2,3]);
    });

    it("should expand with ellipses", function() {
        macro paren {
            case {_ ( $x:lit (,) ...)} => {
                return #{
                    [$x (,) ...]
                }
            }
        }
        var z = paren (4, 3);

        expect(z[0]).to.be(4);
        expect(z[1]).to.be(3);
    });

    it("should expand literal parens with ellipses", function() {
        macro paren {
            case {_ ( ($x:lit) (,) ...)} => {
                return #{
                    [$x (,) ...]
                }
            }
        }
        var z = paren ((4), (3));

        expect(z[0]).to.be(4);
        expect(z[1]).to.be(3);
    });

    it("should not match ... too greedily", function() {
        macro m {
            rule { $x ... ; } => {
                [$x (,) ...]
            }
        }
        var res1 = m 1 2 3 ;
        var res2 = m ;
        expect(res1).to.eql([1,2,3]);
        expect(res2).to.eql([]);
    });


    it("should expand a simple let macro", function() {
        macro let {
            case {_ ($x:ident = $v:expr) {$y:expr}} => {
                return #{
                    (function($x) { return $y; })($v);
                }
            }
        }

        var foo = let (z = 1) {z+2}

        expect(foo).to.be(3)
    });


    it("should expand a complex let macro", function() {
        macro let {
            case {_ ( $($x:ident = $v:expr) (,) ...) {$y:expr} } => {
                return #{
                    (function($x (,) ...) { return $y; })($v (,) ...);
                }
            }
        }

        var foo = let (z = 1, t = 5 + 2) {z+t}

        expect(foo).to.be(8)
    });

    it("should handle ellipses in output delimiters", function() {
        macro m {
            case {_ ( $x:lit (,) ...)} => {
                return #{
                    [[$x] (,) ...]
                }
            }
        }
        var x = m ( 1, 2, 3 );
        expect(x).to.eql([[1],[2],[3]]);
    });

    it("should work", function() {
        macro m {
            case {_ { $($a $b) ... }} => {
                return #{
                    [$([$a, $b]) (,) ...];
                }
            }
        }

        var x = m { 1 2 3 4 }

        expect(x).to.eql([[1, 2], [3, 4]])
    });

    it("should expand simple nested ellipses", function() {
        macro nest {
            case {_ ( ($x:lit (,) ...) (,) ... )} => {
                return #{
                    [ [$x (,) ...] (,) ...]
                }
            }
        }
        var x = nest ( (1, 2, 3), (4, 5, 6) );
    });

    it("should expand a nested ellipses macro", function() {
        macro nest {
            case {_ ( ($x:lit ; $y:lit (,) ...) (,) ...)} => {
                return #{
                    [ [$x (,) ...], [$y (,) ...] (,) ... ]
                }
            }
        }

        var foo = nest ( (1; 2,3,4,5), (10; 11, 12, 13, 14, 15) );

        expect(foo[0]).to.eql([1,10]);
        expect(foo[1]).to.eql([2,3,4,5]);
        expect(foo[2]).to.eql([11, 12, 13, 14, 15]);
    });

    it("should expand an ellipsis with a ; delimiter", function() {
        macro semi {
            case {_ ( $x:lit (;) ...)} => {
                return #{
                    [$x (,) ...]
                }

            }
        }
        var a = semi(1;2;3;4);
        expect(a.length).to.be(4);
        expect(a[1]).to.be(2);
    });

    it("should expand correctly with a keyword delimiter", function() {
        macro toif {
            rule { $(($cond) { $body ...}) ... } => {
                $(if($cond) {
                    $body ...
                }) (else) ...
            }
        }

        var outer;
        toif (false) { outer = false; } (true) { outer = true; }
        expect(outer).to.be(true);
    });


    it("should expand an ellipsis with no separator", function() {
        macro semi {
            case {_ ($x:ident ...)} => {
                return #{
                    var $($x = 2) (,) ...
                }
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
            case {_ $name:ident ($params:ident (,) ...) $body} => {
                return #{
                    function $name ($params (,) ...) $body
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
            case {_ four }=> {
                return #{4}
            }
            case {_ two} => {
                return #{2}
            }
        }
        var n = m four;
        expect(n).to.be(4)
        var n = m two;
        expect(n).to.be(2)
    });

    it("should handle more multiple cases", function() {
        macro m {
            case {_ $n:ident < $m:ident {}} => { return #{42}}
            case {_ $n:ident} => { return #{42}}
        }
        var z = m foo;
        var zz = m foo < foo {};
        expect(z).to.be(42);
        expect(zz).to.be(42);
    });

    it("should handle recursive macros", function() {
        macro rot {
            case {_ [$x:lit, $y:lit]} => {
                return #{
                    [rot [$y], $x]
                }
            }
            case {_ [$x:lit]} => {
                   return #{
                     [$x]
                   }
            }
        }

        var l = rot [1]
        expect(l).to.eql([1])

        var ll = rot [1,2]
        expect(ll).to.eql([[2], 1])
    });

    it("should handle mutually recursive macros", function() {
        macro a {
            case {_ [$x:lit]} => {
                return #{
                    b ($x)
                }
            }
        }
        macro b {
            case {_ ($x:lit)} => {
                return #{
                    [$x]
                }
            }
            case {_ ($x:lit, $y:lit)} => {
                return #{
                    a [$x]
                }
            }
        }
        var z = b (1, 2);
        expect(z).to.eql([1])
    });

    it("should allow macro defining macros", function() {
        macro mm {
            case {_ ($x:lit) }=> {
                return #{
                    macro m {
                        case {_ ($y:lit)} => {
                            return #{[$x, $y]}
                        }
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
            case {_ ($x)} => {
                return #{
                    $x
                }
            }
        }
        var z = m ([1,2,3]);
        expect(z).to.eql([1,2,3])
    });

    it("should allow literal syntax", function() {
        macro m {
            case {_ $x} => {
                return #{
                    macro $x {
                        case {_ ($y $[...]) }=> {
                            return #{
                                [$y (,) $[...]];
                            }
                        }
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
            case {_ ($op (|) ...) }=> {
                return #{
                    macro rel {
                        case {_ $x} => {return #{$x} }
                        $(case {_ ($x $op $y)} => { return #{1} }) ...
                    }
                }
            }
        }

        $test (<|>)
        rel(1 < 2 < 3)
    });

    it("should allow a rule to fail while not purtubing the remaining cases", function() {
        macro m {
            case {_ { $y:expr DONTMATCH }} => {
                return #{$y}
            }
            case {_ { $y:expr }} => {
                return #{$y}
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
            case {_ ()} => {
                return #{this.constructor}
            }
        }

        m ();
    });

    it("should allow fn calls as an :expr", function() {
        macro m {
            case {_ ($x:expr)} => {return #{$x}}
        }
        function id (x) { return x; }
        var x = m( id(4) );
    });

    it("should match nested obj macros", function() {
        macro m {
            case {_ $o:expr} => {
                return #{$o}
            }
        }
        macro n {
            case {_ $o:expr} => {
                return #{m $o}
            }
        }
        var z = n {zed: 4};

        expect(z).to.eql({zed:4});
    });

    it('should expand macros inside computted gets', function() {
        macro m {
            case {_ $x } => {
                return #{$x}
            }
        }

        var foo = ["bar"];
        expect(foo[m 0]).to.be("bar")
    });

    it('should allow assign operations in computed gets', function() {
        var foo = ["bar"];
        var x;

        expect(foo[x = 0]).to.be("bar");
    });

    it('should fail to match with trailing stx in a delimiter', function() {
        macro m {
            rule { ($x) } => {
                42
            }
            rule { ($x $y) } => {
                "success"
            }
        }
        expect(m (100 200)).to.be("success");
    });

    it('should not match too much', function() {
        macro m {
            rule { $(foo $bar) ...} => {
                [$bar (,) ...];
            }
        }
        // testing for regression bug, had been matching the `3`
        var res = m foo 1 foo 2 3;
        expect(res).to.eql([1,2]);
    });

    it('should keep the pattern var on the same line as return', function() {
        macro m {
            rule { $x } => {
                (function () { return $x; });
            }
        }
        var res1 = m 100;
        var res2 = m 200;
        expect(res1()).to.be(100);
        expect(res2()).to.be(200);
    });

    it('should bind let macros inside delimiters', function() {
        let ^ = macro { rule { $x } => { $x } }

        var res = (^ 1);
        expect(res).to.be(1);
    });

    it("should work with ASI", function() {
        let m  = macro {
            rule {{ $body ...}} => {
                $body ...
            }
        }

        var x = m {
            42
            24
        }
        expect(x).to.be(42);
    });

    it("should match tokens as is in literal groups", function() {
        let m = macro {
            rule { $a $[...] $b } => {
                $a + $b
            }
            rule { $[$a:expr] } => {
                "class"
            }
            rule { $[$[]] } => {
                "literal group"
            }
        }
        expect(m 42 ... 12).to.be(54);
        expect(m $a:expr).to.be("class");
        expect(m $[]).to.be("literal group");
    });

    it("shoud work nicely with ASI", function() {
        macro fun {
            rule { $body:expr } => {
                $body
            }
        }

        function foo() {
            var a = fun 12
            var b = fun 42
            return a;
        }
        expect(foo()).to.be(12);
    });

    it("should deal with var groupings", function() {
        macro foo {
            rule { ($x ...) } => {
                $(var $x = 100;) ...
            }
        }
        foo ();
        foo (x);
        expect(x).to.be(100);
    });

    it("should handle groupings when some patterns are matched and some are not", function() {
        macro m {
            rule { $x ($y ...) } => {
                $($x + $y) ...
            }
        }
        expect(m 1 (2)).to.be(3);
        expect(m 1 ()).to.be(undefined);
    });

    it("should work with multi punctuator macro names", function() {
        macro (->) {
            rule { $x } => { $x }
        }

        expect(-> 100).to.be(100);

        macro (function?) {
            rule { ($x ...) } => {
                typeof $x ... === "function"
            }
        }
        expect(function? (100)).to.be(false);
    });

    it("should work with multi punctuator macro names and let macros", function() {
        let (->) = macro {
            rule { $x } => { $x }
        }
        expect(-> 100).to.be(100);
    });

    it("should work with multi punctuator infix macros", function() {
        let (->) = macro {
            rule infix { $arg:ident | $body:expr } => {
                function($arg) { return $body }
            }
        }

        var a = x -> x - 1;
        expect(a(10)).to.be(9);
        var b = x -> x + 2;
        expect(b(10)).to.be(12);
        var c = x -> x - 3;
        expect(c(10)).to.be(7);
    });

    it("should work with multi punctuator macro names with `=` in them", function() {
        let (:=) = macro {
            rule { $x } => { $x }
        }

        expect(:= 100).to.be(100);
    });

    it("should work with nested multi token macro names", function() {
        let (->) = macro {
            rule infix { $arg:ident | $body:expr } => {
                function($arg) { return $body }
            }
        }

        var fn = x -> [y -> x + y];
        expect(fn(1)[0](3)).to.be(4);
    });

    it("should allow macros to override binary operators", function() {
        macro + {
            rule infix { $lhs:expr | $rhs:expr } => {
                $lhs - $rhs
            }
        }
        expect(3 + 2 + 1).to.be(2)
    });

    it("should allow macros to override postfix operators", function() {
        macro ++ {
            rule infix { $lhs:ident | } => {
                $lhs--
            }
        }
        var a = 1;
        a++;
        expect(a).to.be(0)
    });

    it("should allow infix matching of object dot", function() {
        macro m {
            rule infix { $lhs:ident . | } => {
                $lhs
            }
        }

        macro m2 {
            rule { $tok } => {
                $tok
            }
        }

        var a = 42;
        expect(a.m).to.be(42);

        var b = { foo: 42 };
        expect(b.m2 foo).to.be(42);
    })

    it("should allow a dot as a macro after an expression", function() {
        let . = macro {
            rule infix { foo | } => {
                42
            }
            rule {} => { . }
        }

        var a = { foo: 12 };
        expect(a.foo).to.be(12);
        expect(foo.).to.be(42);
    })

    it("should only reverse top-level repeater patterns", function() {
        macro m {
            rule infix { ($num ...) | } => {
                $num (-) ...
            }
        }

        expect((3 2 1) m).to.be(0);
    });

    it("should not flip boolean literals", function() {
        let setToTrue = macro {
            rule { $name ... } => {
                $($name: true) (,)...
            }
        }

        // esprima uses mutation when parsing object properties
        // and we had been reusing the `true` token from the macro
        // template instead creating a fresh copy so the `true` was being
        // flipped to false. This test just test for that regression.
        var x = {
            setToTrue x y z
        }
        expect(x.x).to.be(true);
        expect(x.y).to.be(true);
        expect(x.z).to.be(true);
    });

    it("should not drop tokens when overriding bin/post operators as prefix macros", function(){
        let + = macro {
            rule { $rest ... } => {
              + $rest ...
            }
        }
        let ++ = macro {
            rule { $rest ... } => {
              ++ $rest ...
            }
        }

        expect(1 + 2 + 3 + 4).to.be(10);

        var a = 1;
        var b = a++;
        expect(a).to.be(2);
        expect(b).to.be(1);
    });

    it("should allow multi token macros to share the same root token", function() {
        macro (@foo) {
            rule {} => { 12 }
        }

        macro (@bar) {
            rule {} => { 42 }
        }

        expect(@foo).to.be(12);
        expect(@bar).to.be(42);
    });

    it("should expand the call in a `new` constructor", function() {
        macro m {
          rule {} => { 42 }
        }
        function Ctr(fn) {
            this.foo = fn();
        }
        var ctr = new Ctr(function() { return m });
        expect(ctr.foo).to.be(42);
    });

    it("should eagerly expand using invoke", function() {
        macro a {
            rule { $num } => {
                $num + 42
            }
        }
        macro b {
            rule { $num:invoke(a) } => {
                $num
            }
        }

        expect(b 100).to.be(142);
    });

    it("should eagerly expand once using invoke", function() {
        macro a {
            rule { $num } => {
                3
            }
        }
        macro b {
            rule { $num } => {
                a 2
            }
        }
        macro c {
            case { _ $num:invoke(b) } => {
                return [makeValue(#{ $num }.length === 2, #{ here })];
            }
        }
        expect(c 1).to.be(true);
    });

    it("should eagerly expand recursively using invokeRec", function() {
        macro a {
            rule { $num } => {
                3
            }
        }
        macro b {
            rule { $num } => {
                a 2
            }
        }
        macro c {
            case { _ $num:invokeRec(b) } => {
                return [makeValue(#{ $num }.length === 1, #{ here })];
            }
        }
        expect(c 1).to.be(true);
    });

    it("should eagerly expand using invoke in a repeater", function() {
        macro a {
            rule { $num } => {
                $num - 1
            }
        }
        macro b {
            rule { $num:invoke(a) ... } => {
                $num (+) ...
            }
        }
        expect(b 1 2 3).to.be(3);
    });

    it("should fall through to the next rule when invoke fails", function() {
        macro a {
            rule { $num:lit } => {
                $num
            }
        }
        macro b {
            rule { $num:invoke(a) } => {
                false
            }
            rule { $num } => {
                true
            }
        }
        expect(b foo).to.be(true);
    });

    it("should support invoke inside delimiters", function() {
        macro a {
            rule { $num:lit } => {
                $num + 42
            }
        }
        macro b {
            rule { ($num:invoke(a)) } => {
               $num
            }
        }
        expect(b(100)).to.be(142);
    });

    it("should implicitly call invoke with custom pattern classes", function() {
        macro a {
            rule { $num } => {
                $num + 42
            }
        }
        macro b {
            rule { $num:a } => {
                $num
            }
        }

        expect(b 100).to.be(142);
    })

    it("should support identity rules", function() {
        macro m {
          rule { 42 }
        }

        expect(m 42).to.be(42);
    });

    it("should support complex identity rules", function() {
        macro m {
          rule { (1 + $a:lit) + 3 + $rest (+) ... }
        }

        expect(m (1 + 2) + 3 + 4 + 5).to.be(15);
    });

    it("should support wildcards in identity rules", function() {
      macro m {
        rule { _ + _ + _ }
      }
      expect(m 1 + 2 + 3).to.be(6);
    });

    it("should match literal underscores in literal groups", function() {
        macro m {
            rule { $[_] } => { 42 }
            rule { $tok } => { 12 }
        }
        expect(m foo).to.be(12);
        expect(m _).to.be(42);
    });

    it("should allow transcription of delims in repeaters more than once", function() {
        macro m {
          rule { ($foo ...) } => {
            $foo ... .concat($foo ...)
          }
        }
        expect(m([1, 2, 3])).to.eql([1, 2, 3, 1, 2, 3]);
    });

    it("should allow repeated pattern groups to match zero or more", function() {
        macro m {
            rule { $($val) ... } => {
                42 $val ...
            }
        }
        expect(m).to.be(42);
    })

    it("should allow repeated delimiters to match zero or more", function() {
        macro m {
            rule { [$val] ... } => {
                42 $val ...
            }
        }
        expect(m).to.be(42);
    });

    it("should allow repeated parens to match zero or more", function() {
        macro m {
            rule { ($val) ... } => {
                42 $val ...
            }
        }
        expect(m).to.be(42);
    });

    it("should allow repeated delimiters match at least one", function() {
        macro m {
            rule { [$faz] ... }  => {
                [$faz (,) ...]   
            }
        }

        expect(m [1]).to.eql([1]);
    })

    it("should allow named pattern groups", function() {
        macro m {
            rule { $x:(1 + 2) } => { $x - 3 }
        }
        expect(m 1 + 2).to.be(0);
    });

    it("should allow named pattern groups with sub-bindings", function() {
        macro m {
            rule { $x:(1 + $y) } => { $x$y - 3 }
        }
        expect(m 1 + 2).to.be(-1);
    });

    it("should allow nested named pattern groups", function() {
        macro m {
            rule { $x:($y:($z) ...) } => { $x$y$z (-) ... }
        }
        expect(m 3 2 1).to.be(0);
    });

    it("should allow named escape groups", function() {
        var $ = [42];
        macro m {
            rule { $x:[$[0]] } => { $x }
        }
        expect(m $[0]).to.be(42);
    });

    it("should allow expansion on the left side of an object get", function () {
        macro m { rule { $x } => { $x } }
        expect((m [100])[0]).to.be(100);
    });

    it("should allow expansion in a ternary expression", function () {
        macro m { rule { $x } => { $x } }
        var x = 42;
        var y = 10;
        expect(true ? (m x) : (m y)).to.be(x);
        expect(false ? (m x) : (m y)).to.be(y);
        expect((m (1==1)) ? (m x) : (m y)).to.be(x);
        expect((m (1!=1)) ? (m x) : (m y)).to.be(y);
    });

    it("should allow transcription of empty higher-level repeaters", function() {
        function a(){ return 1; }
        function b(){ return 2; }
        macro m {
            rule { ($($name ($args (,) ...)) (,) ...) } => {
                [$($name($args (,) ...)) (,) ...];
            }
        }
        var res = m(a(1, 2), b());
        expect(res[0]).to.be(1);
        expect(res[1]).to.be(2);
    });

    it("should follow return ASI", function() {
        function foo() {
            return
            42;
        }
        expect(foo()).to.be(undefined);
    })
});
