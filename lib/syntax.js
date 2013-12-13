(function (root$2753, factory$2754) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2754(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2754);
    }
}(this, function (exports$2755, _$2756, es6$2757, parser$2758) {
    function assert$2759(condition$2784, message$2785) {
        if (!condition$2784) {
            throw new Error('ASSERT: ' + message$2785);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2760(id$2786, name$2787, ctx$2788, defctx$2789) {
        defctx$2789 = defctx$2789 || null;
        return {
            id: id$2786,
            name: name$2787,
            context: ctx$2788,
            def: defctx$2789
        };
    }
    // (Num) -> CContext
    function Mark$2761(mark$2790, ctx$2791) {
        return {
            mark: mark$2790,
            context: ctx$2791
        };
    }
    function Def$2762(defctx$2792, ctx$2793) {
        return {
            defctx: defctx$2792,
            context: ctx$2793
        };
    }
    function Var$2763(id$2794) {
        return { id: id$2794 };
    }
    function isRename$2764(r$2795) {
        return r$2795 && typeof r$2795.id !== 'undefined' && typeof r$2795.name !== 'undefined';
    }
    ;
    function isMark$2765(m$2796) {
        return m$2796 && typeof m$2796.mark !== 'undefined';
    }
    ;
    function isDef$2766(ctx$2797) {
        return ctx$2797 && typeof ctx$2797.defctx !== 'undefined';
    }
    function Syntax$2767(token$2798, oldstx$2799) {
        this.token = token$2798;
        this.context = oldstx$2799 && oldstx$2799.context ? oldstx$2799.context : null;
        this.deferredContext = oldstx$2799 && oldstx$2799.deferredContext ? oldstx$2799.deferredContext : null;
    }
    Syntax$2767.prototype = {
        mark: function (newMark$2800) {
            if (this.token.inner) {
                var next$2801 = syntaxFromToken$2768(this.token, this);
                next$2801.deferredContext = Mark$2761(newMark$2800, this.deferredContext);
                return next$2801;
            }
            return syntaxFromToken$2768(this.token, { context: Mark$2761(newMark$2800, this.context) });
        },
        rename: function (id$2802, name$2803, defctx$2804) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2805 = syntaxFromToken$2768(this.token, this);
                next$2805.deferredContext = Rename$2760(id$2802, name$2803, this.deferredContext, defctx$2804);
                return next$2805;
            }
            if (this.token.type === parser$2758.Token.Identifier || this.token.type === parser$2758.Token.Keyword || this.token.type === parser$2758.Token.Punctuator) {
                return syntaxFromToken$2768(this.token, { context: Rename$2760(id$2802, name$2803, this.context, defctx$2804) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2806) {
            if (this.token.inner) {
                var next$2807 = syntaxFromToken$2768(this.token, this);
                next$2807.deferredContext = Def$2762(defctx$2806, this.deferredContext);
                return next$2807;
            }
            return syntaxFromToken$2768(this.token, { context: Def$2762(defctx$2806, this.context) });
        },
        getDefCtx: function () {
            var ctx$2808 = this.context;
            while (ctx$2808 !== null) {
                if (isDef$2766(ctx$2808)) {
                    return ctx$2808.defctx;
                }
                ctx$2808 = ctx$2808.context;
            }
            return null;
        },
        expose: function () {
            assert$2759(this.token.type === parser$2758.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2809(stxCtx$2810, ctx$2811) {
                if (ctx$2811 == null) {
                    return stxCtx$2810;
                } else if (isRename$2764(ctx$2811)) {
                    return Rename$2760(ctx$2811.id, ctx$2811.name, applyContext$2809(stxCtx$2810, ctx$2811.context), ctx$2811.def);
                } else if (isMark$2765(ctx$2811)) {
                    return Mark$2761(ctx$2811.mark, applyContext$2809(stxCtx$2810, ctx$2811.context));
                } else if (isDef$2766(ctx$2811)) {
                    return Def$2762(ctx$2811.defctx, applyContext$2809(stxCtx$2810, ctx$2811.context));
                } else {
                    assert$2759(false, 'unknown context type');
                }
            }
            this.token.inner = _$2756.map(this.token.inner, _$2756.bind(function (stx$2812) {
                if (stx$2812.token.inner) {
                    var next$2813 = syntaxFromToken$2768(stx$2812.token, stx$2812);
                    next$2813.deferredContext = applyContext$2809(stx$2812.deferredContext, this.deferredContext);
                    return next$2813;
                } else {
                    return syntaxFromToken$2768(stx$2812.token, { context: applyContext$2809(stx$2812.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2814 = this.token.type === parser$2758.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2814 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2768(token$2815, oldstx$2816) {
        return new Syntax$2767(token$2815, oldstx$2816);
    }
    function mkSyntax$2769(stx$2817, value$2818, type$2819, inner$2820) {
        if (stx$2817 && Array.isArray(stx$2817) && stx$2817.length === 1) {
            stx$2817 = stx$2817[0];
        } else if (stx$2817 && Array.isArray(stx$2817)) {
            throw new Error();
            throwSyntaxError$2782('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2819 === parser$2758.Token.Delimiter) {
            var startLineNumber$2821, startLineStart$2822, endLineNumber$2823, endLineStart$2824, startRange$2825, endRange$2826;
            if (!Array.isArray(inner$2820)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2782('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2817 && stx$2817.token.type === parser$2758.Token.Delimiter) {
                startLineNumber$2821 = stx$2817.token.startLineNumber;
                startLineStart$2822 = stx$2817.token.startLineStart;
                endLineNumber$2823 = stx$2817.token.endLineNumber;
                endLineStart$2824 = stx$2817.token.endLineStart;
                startRange$2825 = stx$2817.token.startRange;
                endRange$2826 = stx$2817.token.endRange;
            } else if (stx$2817 && stx$2817.token) {
                startLineNumber$2821 = stx$2817.token.lineNumber;
                startLineStart$2822 = stx$2817.token.lineStart;
                endLineNumber$2823 = stx$2817.token.lineNumber;
                endLineStart$2824 = stx$2817.token.lineStart;
                startRange$2825 = stx$2817.token.range;
                endRange$2826 = stx$2817.token.range;
            }
            return syntaxFromToken$2768({
                type: parser$2758.Token.Delimiter,
                value: value$2818,
                inner: inner$2820,
                startLineStart: startLineStart$2822,
                startLineNumber: startLineNumber$2821,
                endLineStart: endLineStart$2824,
                endLineNumber: endLineNumber$2823,
                startRange: startRange$2825,
                endRange: endRange$2826
            }, stx$2817);
        } else {
            var lineStart$2827, lineNumber$2828, range$2829;
            if (stx$2817 && stx$2817.token.type === parser$2758.Token.Delimiter) {
                lineStart$2827 = stx$2817.token.startLineStart;
                lineNumber$2828 = stx$2817.token.startLineNumber;
                range$2829 = stx$2817.token.startRange;
            } else if (stx$2817 && stx$2817.token) {
                lineStart$2827 = stx$2817.token.lineStart;
                lineNumber$2828 = stx$2817.token.lineNumber;
                range$2829 = stx$2817.token.range;
            }
            return syntaxFromToken$2768({
                type: type$2819,
                value: value$2818,
                lineStart: lineStart$2827,
                lineNumber: lineNumber$2828,
                range: range$2829
            }, stx$2817);
        }
    }
    function makeValue$2770(val$2830, stx$2831) {
        if (typeof val$2830 === 'boolean') {
            return mkSyntax$2769(stx$2831, val$2830 ? 'true' : 'false', parser$2758.Token.BooleanLiteral);
        } else if (typeof val$2830 === 'number') {
            if (val$2830 !== val$2830) {
                return makeDelim$2775('()', [
                    makeValue$2770(0, stx$2831),
                    makePunc$2774('/', stx$2831),
                    makeValue$2770(0, stx$2831)
                ], stx$2831);
            }
            if (val$2830 < 0) {
                return makeDelim$2775('()', [
                    makePunc$2774('-', stx$2831),
                    makeValue$2770(Math.abs(val$2830), stx$2831)
                ], stx$2831);
            } else {
                return mkSyntax$2769(stx$2831, val$2830, parser$2758.Token.NumericLiteral);
            }
        } else if (typeof val$2830 === 'string') {
            return mkSyntax$2769(stx$2831, val$2830, parser$2758.Token.StringLiteral);
        } else if (val$2830 === null) {
            return mkSyntax$2769(stx$2831, 'null', parser$2758.Token.NullLiteral);
        } else {
            throwSyntaxError$2782('makeValue', 'Cannot make value syntax object from: ' + val$2830);
        }
    }
    function makeRegex$2771(val$2832, flags$2833, stx$2834) {
        var newstx$2835 = mkSyntax$2769(stx$2834, new RegExp(val$2832, flags$2833), parser$2758.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2835.token.literal = val$2832;
        return newstx$2835;
    }
    function makeIdent$2772(val$2836, stx$2837) {
        return mkSyntax$2769(stx$2837, val$2836, parser$2758.Token.Identifier);
    }
    function makeKeyword$2773(val$2838, stx$2839) {
        return mkSyntax$2769(stx$2839, val$2838, parser$2758.Token.Keyword);
    }
    function makePunc$2774(val$2840, stx$2841) {
        return mkSyntax$2769(stx$2841, val$2840, parser$2758.Token.Punctuator);
    }
    function makeDelim$2775(val$2842, inner$2843, stx$2844) {
        return mkSyntax$2769(stx$2844, val$2842, parser$2758.Token.Delimiter, inner$2843);
    }
    function unwrapSyntax$2776(stx$2845) {
        if (Array.isArray(stx$2845) && stx$2845.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2845 = stx$2845[0];
        }
        if (stx$2845.token) {
            if (stx$2845.token.type === parser$2758.Token.Delimiter) {
                return stx$2845.token;
            } else {
                return stx$2845.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2845);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2777(stx$2846) {
        return _$2756.map(stx$2846, function (stx$2847) {
            if (stx$2847.token.inner) {
                stx$2847.token.inner = syntaxToTokens$2777(stx$2847.token.inner);
            }
            return stx$2847.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2778(tokens$2848) {
        if (!_$2756.isArray(tokens$2848)) {
            tokens$2848 = [tokens$2848];
        }
        return _$2756.map(tokens$2848, function (token$2849) {
            if (token$2849.inner) {
                token$2849.inner = tokensToSyntax$2778(token$2849.inner);
            }
            return syntaxFromToken$2768(token$2849);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2779(tojoin$2850, punc$2851) {
        if (tojoin$2850.length === 0) {
            return [];
        }
        if (punc$2851 === ' ') {
            return tojoin$2850;
        }
        return _$2756.reduce(_$2756.rest(tojoin$2850, 1), function (acc$2852, join$2853) {
            return acc$2852.concat(makePunc$2774(punc$2851, join$2853), join$2853);
        }, [_$2756.first(tojoin$2850)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2780(tojoin$2854, punc$2855) {
        if (tojoin$2854.length === 0) {
            return [];
        }
        if (punc$2855 === ' ') {
            return _$2756.flatten(tojoin$2854, true);
        }
        return _$2756.reduce(_$2756.rest(tojoin$2854, 1), function (acc$2856, join$2857) {
            return acc$2856.concat(makePunc$2774(punc$2855, _$2756.first(join$2857)), join$2857);
        }, _$2756.first(tojoin$2854));
    }
    function MacroSyntaxError$2781(name$2858, message$2859, stx$2860) {
        this.name = name$2858;
        this.message = message$2859;
        this.stx = stx$2860;
    }
    function throwSyntaxError$2782(name$2861, message$2862, stx$2863) {
        if (stx$2863 && Array.isArray(stx$2863)) {
            stx$2863 = stx$2863[0];
        }
        throw new MacroSyntaxError$2781(name$2861, message$2862, stx$2863);
    }
    function printSyntaxError$2783(code$2864, err$2865) {
        if (!err$2865.stx) {
            return '[' + err$2865.name + '] ' + err$2865.message;
        }
        var token$2866 = err$2865.stx.token;
        var lineNumber$2867 = token$2866.sm_startLineNumber || token$2866.sm_lineNumber || token$2866.startLineNumber || token$2866.lineNumber;
        var lineStart$2868 = token$2866.sm_startLineStart || token$2866.sm_lineStart || token$2866.startLineStart || token$2866.lineStart;
        var start$2869 = (token$2866.sm_startRange || token$2866.sm_range || token$2866.startRange || token$2866.range)[0];
        var offset$2870 = start$2869 - lineStart$2868;
        var line$2871 = '';
        var pre$2872 = lineNumber$2867 + ': ';
        var ch$2873;
        while (ch$2873 = code$2864.charAt(lineStart$2868++)) {
            if (ch$2873 == '\r' || ch$2873 == '\n') {
                break;
            }
            line$2871 += ch$2873;
        }
        return '[' + err$2865.name + '] ' + err$2865.message + '\n' + pre$2872 + line$2871 + '\n' + Array(offset$2870 + pre$2872.length).join(' ') + ' ^';
    }
    exports$2755.assert = assert$2759;
    exports$2755.unwrapSyntax = unwrapSyntax$2776;
    exports$2755.makeDelim = makeDelim$2775;
    exports$2755.makePunc = makePunc$2774;
    exports$2755.makeKeyword = makeKeyword$2773;
    exports$2755.makeIdent = makeIdent$2772;
    exports$2755.makeRegex = makeRegex$2771;
    exports$2755.makeValue = makeValue$2770;
    exports$2755.Rename = Rename$2760;
    exports$2755.Mark = Mark$2761;
    exports$2755.Var = Var$2763;
    exports$2755.Def = Def$2762;
    exports$2755.isDef = isDef$2766;
    exports$2755.isMark = isMark$2765;
    exports$2755.isRename = isRename$2764;
    exports$2755.syntaxFromToken = syntaxFromToken$2768;
    exports$2755.tokensToSyntax = tokensToSyntax$2778;
    exports$2755.syntaxToTokens = syntaxToTokens$2777;
    exports$2755.joinSyntax = joinSyntax$2779;
    exports$2755.joinSyntaxArr = joinSyntaxArr$2780;
    exports$2755.MacroSyntaxError = MacroSyntaxError$2781;
    exports$2755.throwSyntaxError = throwSyntaxError$2782;
    exports$2755.printSyntaxError = printSyntaxError$2783;
}));
//# sourceMappingURL=syntax.js.map