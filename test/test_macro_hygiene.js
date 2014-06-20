var expect = require("expect.js");
var sweet = require("../build/lib/sweet.js");

let describe = macro {
    case {_ $description:lit { $body ... }} => {
        return #{
            describe($description, function() {
                $body ...
            });
        }
    }
}

let it = macro {
    case {_ $description:lit { $body ... }} => {
        return #{
            it($description, function() {
                $body ...
            });
        }
    }
}

describe "macro hygiene" {

    it "should work for or macro" {
        macro or {
            case {_ ($x , $y)} => {
                return #{
                    (function($tmp) {
                        return $tmp ? $tmp : $y;
                    })($x);
                }
            }
        }

        (function($tmp) {
            var z = or(false, $tmp);
            expect(z).to.be("ok");
        })("ok");

    }
    


    it "should work for a binding outside of the macro def" {

        var z = (function(x) {

            macro m {
                case {_ ($ignore:ident)} => {
                    return #{x}
                }
            }

            return (function (x) {
                return m(_) + x;
            })(22)

        })(1);
        expect(z).to.be(23)
    }


    it "should not rename object idents if they are the same as vars" {
        var o = (function (x) {
            return {
                x: x
            }
        })(42);

        expect(o.x).to.be(42);
    }

    it "should not rename object dot accesses" {
        var n = (function (o, x) {
            return o.x;
        })({x: 42});

        expect(n).to.be(42)
    }

    it "should do the correct renaming without macros for vars" {
        var z = (function() {
            var x = 42;
            return (function() {
                var y = x;
                var x = "foo";
                return y
            })();
        })();
        expect(z).to.be(undefined)
    }

    it "should do the correct renaming without macros for vars and params" {
        var z = (function() {
            return (function(x) {
                var x = "foo";
                var y = x;
                return y
            })(42);
        })();
        expect(z).to.be("foo")
    }

    it "should not rename a var redeclaration of a param" {
        function foo(x) {
            var x;
            return x;
        }
        expect(foo("param")).to.be("param");
    }

    it "should do the correct renaming with macros for vars" {
        macro m {
            case {_ ()} => { return #{var x = 5;}  }
        }
        var z = (function(x) {
            m();
            var y = x;
            return y;
        })("foo");
        expect(z).to.be("foo")
    }

    it "should work with vars and catch statements" {
        var r;
        var e = 'not error';

        try {
            a();
        } catch(e) {
            sub();
        }

        macro sub {
            case {_ ()} => {
                return #{
                    r = e
                }
            }
        };

        expect(r === e).to.be(true);
    }

    it "should work with a nested macro" {
        macro main {
            case {_ ($a)} => {
                return #{
                    (function(foo) {
                        var bar = 1 + foo;
                        return sub($a);
                    })(2);
                }
            }
        }
        var foo = 100;
        var bar = 200;
        macro sub {
            case {_ ($a)} => {
                return #{
                    foo + bar + $a
                }
            }
        }

        var z = main(3);

        expect(z).to.be(303);
    }

    it "should work with multiple declarations" {
        var a = 10;
        var b = 20;
        macro main {
            case {_ ()} => {
                return #{
                    (function() {
                        var a = 100, b = 200;
                        return sub();
                    })();
                }
            }
        }
        macro sub {
            case {_ ()} => {
                return #{
                    a + b
                }
            }
        }

        var z = main();

        expect(z).to.be(30);
    }

    it "var declarations in nested blocks should be distinct" {
        var foo = 100;
        macro sub {
            case {_ ()} => { return #{foo }}
        }
        function bar() {
            if(false) {
                var foo = 10;
            }
            return sub();
        }

        expect(bar()).to.be(100);
    }

    it "should work for vars with hoisting" {
        macro m {
            case {_ $x:lit} => {
                return #{
                    var tmp = $x;
                }
            }
        }

        var tmp = "outer";
        m "inner";
        expect(tmp).to.be("outer");

    }

    it "should work for vars with hoisting and params" {
        function f(tmp) {
            macro m {
                case {_ $x:lit} => {
                    return #{
                        var tmp = $x;
                    }
                }
            }

            var tmp = "outer";
            m "inner";
            expect(tmp).to.be("outer");
        }

        f("call")

    }

    it "should work for var with nested function" {
        macro m {
            case {_ $x:lit} => {
                return #{
                    var tmp = $x;
                }
            }
        }
        function f() {
            var tmp = "outer";
            m "inner";
            expect(tmp).to.be("outer");
        }
        f();
    }

    // it "should handle vars decls introduced by a macro expansion where macro definition is in the same scope level" {
    //     var res = "default";
    //     var x = undefined;
    //     macro m {
    //         case {_ ()} => {
    //             return #{
    //                 var x;
    //                 x = "set";
    //                 res = x;
    //             }
    //         }
    //     }
    //     m()
    //     expect(res).to.be("set");
    //     expect(x).to.be(undefined);
    // }

    it "should handle vars decls introduced by a macro expansion where macro definition is NOT in the same scope level" {
        macro m {
            case {_ ($res)} => {
                return #{
                    var x;
                    x = "set";
                    $res = x;
                }
            }
        }

        (function() {
            var res = "default";
            var x = undefined;
            m(res);
            expect(res).to.be("set");
            expect(x).to.be(undefined);
        })();
    }

    it "should handle var decls passed to a macro expansion" {
        var res = "default";
        var x = undefined;
        macro m {
            case {_ { $body ... }} => {
                return #{
                    $body ...
                }
            }
        }
        m {
            var x;
            x = "set";
            res = x;
        };
        expect(res).to.be("set");
        expect(x).to.be("set");
    }

    it "should work for the or macro with var" {
      macro or {
        case {_ ($x:expr, $y:expr)} => {
            return #{
                (function() {
                    var $tmp = $x;
                    return $tmp ? $tmp : $y;
                })();
            }
        }
      }

      var $tmp = "ok";
      var z = or(false, $tmp);
      expect(z).to.be("ok");
    }

    it "keeps vars introduced by a macro distinct" {
        macro m {
            case {_ ()} => {
                return #{var x = 42;}
            }
        }
        var x = 24;
        m ()
        expect(x).to.be(24);
    }

    it "keeps vars introduced by letstx distinct" {
        macro m {
            case {_ $x $v} => {
                letstx $unused = [makeValue(0, null)];
                return #{var x = $v; $x = x;}
            }
        } 
        var foo, bar;
        m foo 100
        m bar 200
        expect(foo).to.be(100);
        expect(bar).to.be(200);
    }

    it "should rename uniquely by scope when using readableNames" {
        var before = [
            'var i = 1;',
            'function foo() {',
            '    var i = 2;',
            '    function foo() {',
            '        var i = 3;',
            '    }',
            '}',
            'function bar() {',
            '    var i = 2;',
            '}'
        ].join('\n');

        var after = [
            'var i = 1;',
            'function foo() {',
            '    var i$2 = 2;',
            '    function foo$2() {',
            '        var i$3 = 3;',
            '    }',
            '}',
            'function bar() {',
            '    var i$2 = 2;',
            '}'
        ].join('\n');

        var compiled = sweet.compile(before, {
            readableNames: true
        }).code;

        expect(compiled).to.be(after);
    }

    it "should account for global leaks when using readableNames" {
        var before = [
            'macro clobber {',
            '    case { _ $tok } => {',
            '        var tok = #{ $tok };',
            '        tok[0].context = null;',
            '        return tok;',
            '    }',
            '}',
            'var i = 1;',
            'function foo() {',
            '    var i = 2;',
            '    var j = clobber i;',
            '}'
        ].join('\n');

        var after = [
            'var i$2 = 1;',
            'function foo() {',
            '    var i$3 = 2;',
            '    var j = i;',
            '}'
        ].join('\n');

        var compiled = sweet.compile(before, {
            readableNames: true
        }).code;

        expect(compiled).to.be(after);
    }

    it "should handle vars expanded inside of blocks" {
        macro inner {
            rule { } => { var x = "inner"; }
        }
        var x = "outer";
        { inner }
        expect(x).to.be("outer");
        if (true) { inner }
        expect(x).to.be("outer");
    }
}
