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

$describe "macro hygiene" {

    $it "should work for or macro" {
        macro or {
            rule {($x , $y)} => {
                (function($tmp) {
                    return $tmp ? $tmp : $y;
                })($x);
            }
        }

        (function($tmp) {
            var z = or(false, $tmp)
            expect(z).to.be("ok");
        })("ok");

    }
    


    $it "should work for a binding outside of the macro def" {

        var z = (function(x) {

            macro m {
                rule {($ignore:ident)} => {
                    x
                }
            }

            return (function (x) {
                return m(_) + x;
            })(22)

        })(1);
        expect(z).to.be(23)
    }


    $it "should not rename object idents if they are the same as vars" {
        var o = (function (x) {
            return {
                x: x
            }
        })(42)

        expect(o.x).to.be(42);
    }

    $it "should not rename object dot accesses" {
        var n = (function (o, x) {
            return o.x;
        })({x: 42})

        expect(n).to.be(42)
    }

    $it "should do the correct renaming without macros for vars" {
        var z = (function() {
            var x = 42;
            return (function() {
                var y = x;
                var x = "foo"
                return y
            })();
        })();
        expect(z).to.be(undefined)
    }

    $it "should do the correct renaming without macros for vars and params" {
        var z = (function() {
            return (function(x) {
                var x = "foo"
                var y = x;
                return y
            })(42);
        })();
        expect(z).to.be("foo")
    }

    $it "should do the correct renaming with macros for vars" {
        macro m {
            rule {()} => { var x = 5; }
        }
        var z = (function(x) {
            m();
            var y = x;
            return y;
        })("foo")
        expect(z).to.be("foo")
    }

    $it "should work with vars and catch statements" {
        var r;
        var e = 'not error';

        try {
            a();
        } catch(e) {
            sub();
        }

        macro sub {
            rule {()} => {
                r = e
            }
        }

        expect(r === e).to.be(true);
    }

    $it "should work with a nested macro" {
        macro main {
            rule {($a)} => {
                (function(foo) {
                    var bar = 1 + foo;
                    return sub($a);
                })(2);
            }
        }
        var foo = 100;
        var bar = 200;
        macro sub {
            rule {($a)} => {
                foo + bar + $a
            }
        }

        var z = main(3);

        expect(z).to.be(303);
    }

    $it "should work with multiple declarations" {
        var a = 10;
        var b = 20;
        macro main {
            rule {()} => {
                (function() {
                    var a = 100, b = 200;
                    return sub();
                })();
            }
        }
        macro sub {
            rule {()} => {
                a + b
            }
        }

        var z = main();

        expect(z).to.be(30);
    }

    $it "var declarations in nested blocks should be distinct" {
        var foo = 100;
        macro sub {
            rule {()} => { foo }
        }
        function bar() {
            if(false) {
                var foo = 10;
            }
            return sub();
        }

        expect(bar()).to.be(100);
    }

    $it "should work for vars with hoisting" {
      macro m {
        rule {$x:lit} => {
          var tmp = $x;
        }
      }

      var tmp = "outer"
      m "inner"
      expect(tmp).to.be("outer");

    }

    $it "should work for vars with hoisting and params" {
      function f(tmp) {
        macro m {
          rule {$x:lit} => {
            var tmp = $x;
          }
        }

        var tmp = "outer"
        m "inner"
        expect(tmp).to.be("outer");
      }

      f("call")

    }

    $it "should work for var with nested function" {
      macro m {
        rule {$x:lit} => {
          var tmp = $x;
        }
      }
      function f() {
        var tmp = "outer"
        m "inner"
        expect(tmp).to.be("outer");
      }
      f();
    }

    $it "should handle vars decls introduced by a macro expansion where macro definition is in the same scope level" {
        var res = "default";
        var x = undefined;
        macro m {
            rule {()} => {
                var x;
                x = "set";
                res = x;
            }
        }
        m()
        expect(res).to.be("set");
        expect(x).to.be(undefined);
    }

    $it "should handle vars decls introduced by a macro expansion where macro definition is NOT in the same scope level" {
        macro m {
            rule {($res)} => {
                var x;
                x = "set";
                $res = x;
            }
        }

        (function() {
            var res = "default";
            var x = undefined;
            m(res)
            expect(res).to.be("set");
            expect(x).to.be(undefined);
        })();
    }

    $it "should handle var decls passed to a macro expansion" {
        var res = "default";
        var x = undefined;
        macro m {
            rule {{ $body ... }} => {
                $body ...
            }
        }
        m {
            var x;
            x = "set";
            res = x;
        }
        expect(res).to.be("set");
        expect(x).to.be("set");
    }

    $it "should work for the or macro with var" {
      macro or {
        rule {($x:expr, $y:expr)} => {
          (function() {
            var $tmp = $x;
            return $tmp ? $tmp : $y;
          })();
        }
      }

      var $tmp = "ok"
      var z = or(false, $tmp);
      expect(z).to.be("ok");
    }
}
