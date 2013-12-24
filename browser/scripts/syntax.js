(function (root$2768, factory$2769) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2769(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$2769);
    }
}(this, function (exports$2770, _$2771, es6$2772, parser$2773, expander$2774) {
    function assert$2775(condition$2797, message$2798) {
        if (!condition$2797) {
            throw new Error('ASSERT: ' + message$2798);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2776(id$2799, name$2800, ctx$2801, defctx$2802) {
        defctx$2802 = defctx$2802 || null;
        this.id = id$2799;
        this.name = name$2800;
        this.context = ctx$2801;
        this.def = defctx$2802;
    }
    // (Num) -> CContext
    function Mark$2777(mark$2803, ctx$2804) {
        this.mark = mark$2803;
        this.context = ctx$2804;
    }
    function Def$2778(defctx$2805, ctx$2806) {
        this.defctx = defctx$2805;
        this.context = ctx$2806;
    }
    function Syntax$2779(token$2807, oldstx$2808) {
        this.token = token$2807;
        this.context = oldstx$2808 && oldstx$2808.context ? oldstx$2808.context : null;
        this.deferredContext = oldstx$2808 && oldstx$2808.deferredContext ? oldstx$2808.deferredContext : null;
    }
    Syntax$2779.prototype = {
        mark: function (newMark$2809) {
            if (this.token.inner) {
                var next$2810 = syntaxFromToken$2780(this.token, this);
                next$2810.deferredContext = new Mark$2777(newMark$2809, this.deferredContext);
                return next$2810;
            }
            return syntaxFromToken$2780(this.token, { context: new Mark$2777(newMark$2809, this.context) });
        },
        rename: function (id$2811, name$2812, defctx$2813) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2814 = syntaxFromToken$2780(this.token, this);
                next$2814.deferredContext = new Rename$2776(id$2811, name$2812, this.deferredContext, defctx$2813);
                return next$2814;
            }
            if (this.token.type === parser$2773.Token.Identifier || this.token.type === parser$2773.Token.Keyword || this.token.type === parser$2773.Token.Punctuator) {
                return syntaxFromToken$2780(this.token, { context: new Rename$2776(id$2811, name$2812, this.context, defctx$2813) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2815) {
            if (this.token.inner) {
                var next$2816 = syntaxFromToken$2780(this.token, this);
                next$2816.deferredContext = new Def$2778(defctx$2815, this.deferredContext);
                return next$2816;
            }
            return syntaxFromToken$2780(this.token, { context: new Def$2778(defctx$2815, this.context) });
        },
        getDefCtx: function () {
            var ctx$2817 = this.context;
            while (ctx$2817 !== null) {
                if (ctx$2817 instanceof Def$2778) {
                    return ctx$2817.defctx;
                }
                ctx$2817 = ctx$2817.context;
            }
            return null;
        },
        expose: function () {
            assert$2775(this.token.type === parser$2773.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2818(stxCtx$2819, ctx$2820) {
                if (ctx$2820 == null) {
                    return stxCtx$2819;
                } else if (ctx$2820 instanceof Rename$2776) {
                    return new Rename$2776(ctx$2820.id, ctx$2820.name, applyContext$2818(stxCtx$2819, ctx$2820.context), ctx$2820.def);
                } else if (ctx$2820 instanceof Mark$2777) {
                    return new Mark$2777(ctx$2820.mark, applyContext$2818(stxCtx$2819, ctx$2820.context));
                } else if (ctx$2820 instanceof Def$2778) {
                    return new Def$2778(ctx$2820.defctx, applyContext$2818(stxCtx$2819, ctx$2820.context));
                } else {
                    assert$2775(false, 'unknown context type');
                }
            }
            this.token.inner = _$2771.map(this.token.inner, _$2771.bind(function (stx$2821) {
                if (stx$2821.token.inner) {
                    var next$2822 = syntaxFromToken$2780(stx$2821.token, stx$2821);
                    next$2822.deferredContext = applyContext$2818(stx$2821.deferredContext, this.deferredContext);
                    return next$2822;
                } else {
                    return syntaxFromToken$2780(stx$2821.token, { context: applyContext$2818(stx$2821.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2823 = this.token.type === parser$2773.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2823 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2780(token$2824, oldstx$2825) {
        return new Syntax$2779(token$2824, oldstx$2825);
    }
    function mkSyntax$2781(stx$2826, value$2827, type$2828, inner$2829) {
        if (stx$2826 && Array.isArray(stx$2826) && stx$2826.length === 1) {
            stx$2826 = stx$2826[0];
        } else if (stx$2826 && Array.isArray(stx$2826)) {
            throwSyntaxError$2794('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2828 === parser$2773.Token.Delimiter) {
            var startLineNumber$2830, startLineStart$2831, endLineNumber$2832, endLineStart$2833, startRange$2834, endRange$2835;
            if (!Array.isArray(inner$2829)) {
                throwSyntaxError$2794('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2826 && stx$2826.token.type === parser$2773.Token.Delimiter) {
                startLineNumber$2830 = stx$2826.token.startLineNumber;
                startLineStart$2831 = stx$2826.token.startLineStart;
                endLineNumber$2832 = stx$2826.token.endLineNumber;
                endLineStart$2833 = stx$2826.token.endLineStart;
                startRange$2834 = stx$2826.token.startRange;
                endRange$2835 = stx$2826.token.endRange;
            } else if (stx$2826 && stx$2826.token) {
                startLineNumber$2830 = stx$2826.token.lineNumber;
                startLineStart$2831 = stx$2826.token.lineStart;
                endLineNumber$2832 = stx$2826.token.lineNumber;
                endLineStart$2833 = stx$2826.token.lineStart;
                startRange$2834 = stx$2826.token.range;
                endRange$2835 = stx$2826.token.range;
            }
            return syntaxFromToken$2780({
                type: parser$2773.Token.Delimiter,
                value: value$2827,
                inner: inner$2829,
                startLineStart: startLineStart$2831,
                startLineNumber: startLineNumber$2830,
                endLineStart: endLineStart$2833,
                endLineNumber: endLineNumber$2832,
                startRange: startRange$2834,
                endRange: endRange$2835
            }, stx$2826);
        } else {
            var lineStart$2836, lineNumber$2837, range$2838;
            if (stx$2826 && stx$2826.token.type === parser$2773.Token.Delimiter) {
                lineStart$2836 = stx$2826.token.startLineStart;
                lineNumber$2837 = stx$2826.token.startLineNumber;
                range$2838 = stx$2826.token.startRange;
            } else if (stx$2826 && stx$2826.token) {
                lineStart$2836 = stx$2826.token.lineStart;
                lineNumber$2837 = stx$2826.token.lineNumber;
                range$2838 = stx$2826.token.range;
            }
            return syntaxFromToken$2780({
                type: type$2828,
                value: value$2827,
                lineStart: lineStart$2836,
                lineNumber: lineNumber$2837,
                range: range$2838
            }, stx$2826);
        }
    }
    function makeValue$2782(val$2839, stx$2840) {
        if (typeof val$2839 === 'boolean') {
            return mkSyntax$2781(stx$2840, val$2839 ? 'true' : 'false', parser$2773.Token.BooleanLiteral);
        } else if (typeof val$2839 === 'number') {
            if (val$2839 !== val$2839) {
                return makeDelim$2787('()', [
                    makeValue$2782(0, stx$2840),
                    makePunc$2786('/', stx$2840),
                    makeValue$2782(0, stx$2840)
                ], stx$2840);
            }
            if (val$2839 < 0) {
                return makeDelim$2787('()', [
                    makePunc$2786('-', stx$2840),
                    makeValue$2782(Math.abs(val$2839), stx$2840)
                ], stx$2840);
            } else {
                return mkSyntax$2781(stx$2840, val$2839, parser$2773.Token.NumericLiteral);
            }
        } else if (typeof val$2839 === 'string') {
            return mkSyntax$2781(stx$2840, val$2839, parser$2773.Token.StringLiteral);
        } else if (val$2839 === null) {
            return mkSyntax$2781(stx$2840, 'null', parser$2773.Token.NullLiteral);
        } else {
            throwSyntaxError$2794('makeValue', 'Cannot make value syntax object from: ' + val$2839);
        }
    }
    function makeRegex$2783(val$2841, flags$2842, stx$2843) {
        var newstx$2844 = mkSyntax$2781(stx$2843, new RegExp(val$2841, flags$2842), parser$2773.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2844.token.literal = val$2841;
        return newstx$2844;
    }
    function makeIdent$2784(val$2845, stx$2846) {
        return mkSyntax$2781(stx$2846, val$2845, parser$2773.Token.Identifier);
    }
    function makeKeyword$2785(val$2847, stx$2848) {
        return mkSyntax$2781(stx$2848, val$2847, parser$2773.Token.Keyword);
    }
    function makePunc$2786(val$2849, stx$2850) {
        return mkSyntax$2781(stx$2850, val$2849, parser$2773.Token.Punctuator);
    }
    function makeDelim$2787(val$2851, inner$2852, stx$2853) {
        return mkSyntax$2781(stx$2853, val$2851, parser$2773.Token.Delimiter, inner$2852);
    }
    function unwrapSyntax$2788(stx$2854) {
        if (Array.isArray(stx$2854) && stx$2854.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2854 = stx$2854[0];
        }
        if (stx$2854.token) {
            if (stx$2854.token.type === parser$2773.Token.Delimiter) {
                return stx$2854.token;
            } else {
                return stx$2854.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2854);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2789(stx$2855) {
        return _$2771.map(stx$2855, function (stx$2856) {
            if (stx$2856.token.inner) {
                stx$2856.token.inner = syntaxToTokens$2789(stx$2856.token.inner);
            }
            return stx$2856.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2790(tokens$2857) {
        if (!_$2771.isArray(tokens$2857)) {
            tokens$2857 = [tokens$2857];
        }
        return _$2771.map(tokens$2857, function (token$2858) {
            if (token$2858.inner) {
                token$2858.inner = tokensToSyntax$2790(token$2858.inner);
            }
            return syntaxFromToken$2780(token$2858);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2791(tojoin$2859, punc$2860) {
        if (tojoin$2859.length === 0) {
            return [];
        }
        if (punc$2860 === ' ') {
            return tojoin$2859;
        }
        return _$2771.reduce(_$2771.rest(tojoin$2859, 1), function (acc$2861, join$2862) {
            return acc$2861.concat(makePunc$2786(punc$2860, join$2862), join$2862);
        }, [_$2771.first(tojoin$2859)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2792(tojoin$2863, punc$2864) {
        if (tojoin$2863.length === 0) {
            return [];
        }
        if (punc$2864 === ' ') {
            return _$2771.flatten(tojoin$2863, true);
        }
        return _$2771.reduce(_$2771.rest(tojoin$2863, 1), function (acc$2865, join$2866) {
            return acc$2865.concat(makePunc$2786(punc$2864, _$2771.first(join$2866)), join$2866);
        }, _$2771.first(tojoin$2863));
    }
    function MacroSyntaxError$2793(name$2867, message$2868, stx$2869) {
        this.name = name$2867;
        this.message = message$2868;
        this.stx = stx$2869;
    }
    function throwSyntaxError$2794(name$2870, message$2871, stx$2872) {
        if (stx$2872 && Array.isArray(stx$2872)) {
            stx$2872 = stx$2872[0];
        }
        throw new MacroSyntaxError$2793(name$2870, message$2871, stx$2872);
    }
    function printSyntaxError$2795(code$2873, err$2874) {
        if (!err$2874.stx) {
            return '[' + err$2874.name + '] ' + err$2874.message;
        }
        var token$2875 = err$2874.stx.token;
        var lineNumber$2876 = token$2875.sm_startLineNumber || token$2875.sm_lineNumber || token$2875.startLineNumber || token$2875.lineNumber;
        var lineStart$2877 = token$2875.sm_startLineStart || token$2875.sm_lineStart || token$2875.startLineStart || token$2875.lineStart;
        var start$2878 = (token$2875.sm_startRange || token$2875.sm_range || token$2875.startRange || token$2875.range)[0];
        var offset$2879 = start$2878 - lineStart$2877;
        var line$2880 = '';
        var pre$2881 = lineNumber$2876 + ': ';
        var ch$2882;
        while (ch$2882 = code$2873.charAt(lineStart$2877++)) {
            if (ch$2882 == '\r' || ch$2882 == '\n') {
                break;
            }
            line$2880 += ch$2882;
        }
        return '[' + err$2874.name + '] ' + err$2874.message + '\n' + pre$2881 + line$2880 + '\n' + Array(offset$2879 + pre$2881.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$2796(stxarr$2883, shouldResolve$2884) {
        var indent$2885 = 0;
        var unparsedLines$2886 = stxarr$2883.reduce(function (acc$2887, stx$2888) {
                var s$2889 = shouldResolve$2884 ? expander$2774.resolve(stx$2888) : stx$2888.token.value;
                // skip the end of file token
                if (stx$2888.token.type === parser$2773.Token.EOF) {
                    return acc$2887;
                }
                if (stx$2888.token.type === parser$2773.Token.StringLiteral) {
                    s$2889 = '"' + s$2889 + '"';
                }
                if (s$2889 == '{') {
                    acc$2887[0].str += ' ' + s$2889;
                    indent$2885++;
                    acc$2887.unshift({
                        indent: indent$2885,
                        str: ''
                    });
                } else if (s$2889 == '}') {
                    indent$2885--;
                    acc$2887.unshift({
                        indent: indent$2885,
                        str: s$2889
                    });
                    acc$2887.unshift({
                        indent: indent$2885,
                        str: ''
                    });
                } else if (s$2889 == ';') {
                    acc$2887[0].str += s$2889;
                    acc$2887.unshift({
                        indent: indent$2885,
                        str: ''
                    });
                } else {
                    acc$2887[0].str += (acc$2887[0].str ? ' ' : '') + s$2889;
                }
                return acc$2887;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2886.reduce(function (acc$2890, line$2891) {
            var ind$2892 = '';
            while (ind$2892.length < line$2891.indent * 2) {
                ind$2892 += ' ';
            }
            return ind$2892 + line$2891.str + '\n' + acc$2890;
        }, '');
    }
    exports$2770.assert = assert$2775;
    exports$2770.unwrapSyntax = unwrapSyntax$2788;
    exports$2770.makeDelim = makeDelim$2787;
    exports$2770.makePunc = makePunc$2786;
    exports$2770.makeKeyword = makeKeyword$2785;
    exports$2770.makeIdent = makeIdent$2784;
    exports$2770.makeRegex = makeRegex$2783;
    exports$2770.makeValue = makeValue$2782;
    exports$2770.Rename = Rename$2776;
    exports$2770.Mark = Mark$2777;
    exports$2770.Def = Def$2778;
    exports$2770.syntaxFromToken = syntaxFromToken$2780;
    exports$2770.tokensToSyntax = tokensToSyntax$2790;
    exports$2770.syntaxToTokens = syntaxToTokens$2789;
    exports$2770.joinSyntax = joinSyntax$2791;
    exports$2770.joinSyntaxArr = joinSyntaxArr$2792;
    exports$2770.prettyPrint = prettyPrint$2796;
    exports$2770.MacroSyntaxError = MacroSyntaxError$2793;
    exports$2770.throwSyntaxError = throwSyntaxError$2794;
    exports$2770.printSyntaxError = printSyntaxError$2795;
}));
//# sourceMappingURL=syntax.js.map