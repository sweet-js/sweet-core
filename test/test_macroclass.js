var expect = require("expect.js");

describe("macroclass", function() {
    it("should support the macroclass macro", function() {
        macroclass cls {
            pattern {
                rule { $foo }
            }
        }
        macro m {
            rule { $x:cls } => { $x$foo }
        }
        expect(m 42).to.be(42);
    });

    it("should support multiple patterns", function() {
        macroclass cls {
            pattern {
                rule { $foo:ident }
            }
            pattern {
                rule { $foo:lit }
            }
        }
        macro m {
            rule { $x:cls $y:cls } => { $x$foo + $y$foo }
        }
        expect(m 42 10).to.be(52);
        expect(m 42 'foo').to.be('42foo');
    });

    it("should support shorthand patterns with just a rule declaration", function() {
        macroclass cls {
            rule { $foo:ident }
            rule { $foo:lit }
        }
        macro m {
            rule { $x:cls $y:cls } => { $x$foo + $y$foo }
        }
        expect(m 42 10).to.be(52);
        expect(m 42 'foo').to.be('42foo');
    });

    it("should support with bindings in a pattern declaration", function() {
        macroclass cls {
            pattern {
                rule { $foo:lit $bar:lit }
            }
            pattern {
                rule { $foo:lit }
                with $bar = #{ 10 };
            }
        }
        macro m {
            rule { $x:cls } => { $x$foo + $x$bar }
        }
        expect(m 42 5).to.be(47);
        expect(m 42).to.be(52);
    });

    it("should support multiple with bindings in a pattern declaration", function() {
        macroclass cls {
            pattern {
                rule { _ }
                with $foo = #{ 3 },
                     $bar = #{ 2 };
                with $baz = #{ 1 }
            }
        }
        macro m {
            rule { $x:cls } => { $x$foo - $x$bar - $x$baz }
        }
        expect(m 1).to.be(0);
      });

    it("should support binding references in with declarations", function() {
        macroclass cls {
            pattern {
                rule { $foo }
                with $bar = #{ $foo + 10 };
                with $baz = #{ $bar + 20 };
            }
        }
        macro m {
            rule { $x:cls } => { $x$baz }
        }
        expect(m 42).to.be(72);
    });

    it("should support syntax constructors in with declarations", function() {
        macroclass cls {
            pattern {
                rule { $foo:ident }
                with $bar = [makeIdent('bar', #{ $foo })];
            }
        }
        macro m {
            rule { $x:cls } => { $x$bar = 42 }
        }
        var res = function() {
            var bar = 12;
            m asdf;
            return bar;
        }();
        expect(res).to.be(42);
    });

    it("should support expressions in with bindings", function() {
        macroclass cls {
            pattern {
                rule { $foo }
                with $bar = [makeValue(12, #{ here })].concat(#{ + $foo });
            }
        }
        macro m {
            rule { $x:cls } => { $x$bar }
        }
        expect(m 30).to.be(42);
    });

    it("should support macroclass invocations within other macroclasses", function() {
        macroclass cls_a {
            rule { $foo:lit }
        }
        macroclass cls_b {
            rule { $bar:cls_a }
        }
        macro m {
            rule { $x:cls_b } => { $x$bar$foo }
        }
        expect(m 42).to.be(42);
    });
});
