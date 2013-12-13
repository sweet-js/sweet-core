(function (root$2769, factory$2770) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2770(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2770);
    }
}(this, function (exports$2771, _$2772, es6$2773, parser$2774) {
    function assert$2775(condition$2800, message$2801) {
        if (!condition$2800) {
            throw new Error('ASSERT: ' + message$2801);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2776(id$2802, name$2803, ctx$2804, defctx$2805) {
        defctx$2805 = defctx$2805 || null;
        return {
            id: id$2802,
            name: name$2803,
            context: ctx$2804,
            def: defctx$2805
        };
    }
    // (Num) -> CContext
    function Mark$2777(mark$2806, ctx$2807) {
        return {
            mark: mark$2806,
            context: ctx$2807
        };
    }
    function Def$2778(defctx$2808, ctx$2809) {
        return {
            defctx: defctx$2808,
            context: ctx$2809
        };
    }
    function Var$2779(id$2810) {
        return { id: id$2810 };
    }
    function isRename$2780(r$2811) {
        return r$2811 && typeof r$2811.id !== 'undefined' && typeof r$2811.name !== 'undefined';
    }
    ;
    function isMark$2781(m$2812) {
        return m$2812 && typeof m$2812.mark !== 'undefined';
    }
    ;
    function isDef$2782(ctx$2813) {
        return ctx$2813 && typeof ctx$2813.defctx !== 'undefined';
    }
    function Syntax$2783(token$2814, oldstx$2815) {
        this.token = token$2814;
        this.context = oldstx$2815 && oldstx$2815.context ? oldstx$2815.context : null;
        this.deferredContext = oldstx$2815 && oldstx$2815.deferredContext ? oldstx$2815.deferredContext : null;
    }
    Syntax$2783.prototype = {
        mark: function (newMark$2816) {
            if (this.token.inner) {
                var next$2817 = syntaxFromToken$2784(this.token, this);
                next$2817.deferredContext = Mark$2777(newMark$2816, this.deferredContext);
                return next$2817;
            }
            return syntaxFromToken$2784(this.token, { context: Mark$2777(newMark$2816, this.context) });
        },
        rename: function (id$2818, name$2819, defctx$2820) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2821 = syntaxFromToken$2784(this.token, this);
                next$2821.deferredContext = Rename$2776(id$2818, name$2819, this.deferredContext, defctx$2820);
                return next$2821;
            }
            if (this.token.type === parser$2774.Token.Identifier || this.token.type === parser$2774.Token.Keyword || this.token.type === parser$2774.Token.Punctuator) {
                return syntaxFromToken$2784(this.token, { context: Rename$2776(id$2818, name$2819, this.context, defctx$2820) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2822) {
            if (this.token.inner) {
                var next$2823 = syntaxFromToken$2784(this.token, this);
                next$2823.deferredContext = Def$2778(defctx$2822, this.deferredContext);
                return next$2823;
            }
            return syntaxFromToken$2784(this.token, { context: Def$2778(defctx$2822, this.context) });
        },
        getDefCtx: function () {
            var ctx$2824 = this.context;
            while (ctx$2824 !== null) {
                if (isDef$2782(ctx$2824)) {
                    return ctx$2824.defctx;
                }
                ctx$2824 = ctx$2824.context;
            }
            return null;
        },
        expose: function () {
            assert$2775(this.token.type === parser$2774.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2825(stxCtx$2826, ctx$2827) {
                if (ctx$2827 == null) {
                    return stxCtx$2826;
                } else if (isRename$2780(ctx$2827)) {
                    return Rename$2776(ctx$2827.id, ctx$2827.name, applyContext$2825(stxCtx$2826, ctx$2827.context), ctx$2827.def);
                } else if (isMark$2781(ctx$2827)) {
                    return Mark$2777(ctx$2827.mark, applyContext$2825(stxCtx$2826, ctx$2827.context));
                } else if (isDef$2782(ctx$2827)) {
                    return Def$2778(ctx$2827.defctx, applyContext$2825(stxCtx$2826, ctx$2827.context));
                } else {
                    assert$2775(false, 'unknown context type');
                }
            }
            this.token.inner = _$2772.map(this.token.inner, _$2772.bind(function (stx$2828) {
                if (stx$2828.token.inner) {
                    var next$2829 = syntaxFromToken$2784(stx$2828.token, stx$2828);
                    next$2829.deferredContext = applyContext$2825(stx$2828.deferredContext, this.deferredContext);
                    return next$2829;
                } else {
                    return syntaxFromToken$2784(stx$2828.token, { context: applyContext$2825(stx$2828.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2830 = this.token.type === parser$2774.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2830 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2784(token$2831, oldstx$2832) {
        return new Syntax$2783(token$2831, oldstx$2832);
    }
    function mkSyntax$2785(stx$2833, value$2834, type$2835, inner$2836) {
        if (stx$2833 && Array.isArray(stx$2833) && stx$2833.length === 1) {
            stx$2833 = stx$2833[0];
        } else if (stx$2833 && Array.isArray(stx$2833)) {
            throw new Error();
            throwSyntaxError$2798('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2835 === parser$2774.Token.Delimiter) {
            var startLineNumber$2837, startLineStart$2838, endLineNumber$2839, endLineStart$2840, startRange$2841, endRange$2842;
            if (!Array.isArray(inner$2836)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2798('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2833 && stx$2833.token.type === parser$2774.Token.Delimiter) {
                startLineNumber$2837 = stx$2833.token.startLineNumber;
                startLineStart$2838 = stx$2833.token.startLineStart;
                endLineNumber$2839 = stx$2833.token.endLineNumber;
                endLineStart$2840 = stx$2833.token.endLineStart;
                startRange$2841 = stx$2833.token.startRange;
                endRange$2842 = stx$2833.token.endRange;
            } else if (stx$2833 && stx$2833.token) {
                startLineNumber$2837 = stx$2833.token.lineNumber;
                startLineStart$2838 = stx$2833.token.lineStart;
                endLineNumber$2839 = stx$2833.token.lineNumber;
                endLineStart$2840 = stx$2833.token.lineStart;
                startRange$2841 = stx$2833.token.range;
                endRange$2842 = stx$2833.token.range;
            }
            return syntaxFromToken$2784({
                type: parser$2774.Token.Delimiter,
                value: value$2834,
                inner: inner$2836,
                startLineStart: startLineStart$2838,
                startLineNumber: startLineNumber$2837,
                endLineStart: endLineStart$2840,
                endLineNumber: endLineNumber$2839,
                startRange: startRange$2841,
                endRange: endRange$2842
            }, stx$2833);
        } else {
            var lineStart$2843, lineNumber$2844, range$2845;
            if (stx$2833 && stx$2833.token.type === parser$2774.Token.Delimiter) {
                lineStart$2843 = stx$2833.token.startLineStart;
                lineNumber$2844 = stx$2833.token.startLineNumber;
                range$2845 = stx$2833.token.startRange;
            } else if (stx$2833 && stx$2833.token) {
                lineStart$2843 = stx$2833.token.lineStart;
                lineNumber$2844 = stx$2833.token.lineNumber;
                range$2845 = stx$2833.token.range;
            }
            return syntaxFromToken$2784({
                type: type$2835,
                value: value$2834,
                lineStart: lineStart$2843,
                lineNumber: lineNumber$2844,
                range: range$2845
            }, stx$2833);
        }
    }
    function makeValue$2786(val$2846, stx$2847) {
        if (typeof val$2846 === 'boolean') {
            return mkSyntax$2785(stx$2847, val$2846 ? 'true' : 'false', parser$2774.Token.BooleanLiteral);
        } else if (typeof val$2846 === 'number') {
            if (val$2846 !== val$2846) {
                return makeDelim$2791('()', [
                    makeValue$2786(0, stx$2847),
                    makePunc$2790('/', stx$2847),
                    makeValue$2786(0, stx$2847)
                ], stx$2847);
            }
            if (val$2846 < 0) {
                return makeDelim$2791('()', [
                    makePunc$2790('-', stx$2847),
                    makeValue$2786(Math.abs(val$2846), stx$2847)
                ], stx$2847);
            } else {
                return mkSyntax$2785(stx$2847, val$2846, parser$2774.Token.NumericLiteral);
            }
        } else if (typeof val$2846 === 'string') {
            return mkSyntax$2785(stx$2847, val$2846, parser$2774.Token.StringLiteral);
        } else if (val$2846 === null) {
            return mkSyntax$2785(stx$2847, 'null', parser$2774.Token.NullLiteral);
        } else {
            throwSyntaxError$2798('makeValue', 'Cannot make value syntax object from: ' + val$2846);
        }
    }
    function makeRegex$2787(val$2848, flags$2849, stx$2850) {
        var newstx$2851 = mkSyntax$2785(stx$2850, new RegExp(val$2848, flags$2849), parser$2774.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2851.token.literal = val$2848;
        return newstx$2851;
    }
    function makeIdent$2788(val$2852, stx$2853) {
        return mkSyntax$2785(stx$2853, val$2852, parser$2774.Token.Identifier);
    }
    function makeKeyword$2789(val$2854, stx$2855) {
        return mkSyntax$2785(stx$2855, val$2854, parser$2774.Token.Keyword);
    }
    function makePunc$2790(val$2856, stx$2857) {
        return mkSyntax$2785(stx$2857, val$2856, parser$2774.Token.Punctuator);
    }
    function makeDelim$2791(val$2858, inner$2859, stx$2860) {
        return mkSyntax$2785(stx$2860, val$2858, parser$2774.Token.Delimiter, inner$2859);
    }
    function unwrapSyntax$2792(stx$2861) {
        if (Array.isArray(stx$2861) && stx$2861.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2861 = stx$2861[0];
        }
        if (stx$2861.token) {
            if (stx$2861.token.type === parser$2774.Token.Delimiter) {
                return stx$2861.token;
            } else {
                return stx$2861.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2861);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2793(stx$2862) {
        return _$2772.map(stx$2862, function (stx$2863) {
            if (stx$2863.token.inner) {
                stx$2863.token.inner = syntaxToTokens$2793(stx$2863.token.inner);
            }
            return stx$2863.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2794(tokens$2864) {
        if (!_$2772.isArray(tokens$2864)) {
            tokens$2864 = [tokens$2864];
        }
        return _$2772.map(tokens$2864, function (token$2865) {
            if (token$2865.inner) {
                token$2865.inner = tokensToSyntax$2794(token$2865.inner);
            }
            return syntaxFromToken$2784(token$2865);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2795(tojoin$2866, punc$2867) {
        if (tojoin$2866.length === 0) {
            return [];
        }
        if (punc$2867 === ' ') {
            return tojoin$2866;
        }
        return _$2772.reduce(_$2772.rest(tojoin$2866, 1), function (acc$2868, join$2869) {
            return acc$2868.concat(makePunc$2790(punc$2867, join$2869), join$2869);
        }, [_$2772.first(tojoin$2866)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2796(tojoin$2870, punc$2871) {
        if (tojoin$2870.length === 0) {
            return [];
        }
        if (punc$2871 === ' ') {
            return _$2772.flatten(tojoin$2870, true);
        }
        return _$2772.reduce(_$2772.rest(tojoin$2870, 1), function (acc$2872, join$2873) {
            return acc$2872.concat(makePunc$2790(punc$2871, _$2772.first(join$2873)), join$2873);
        }, _$2772.first(tojoin$2870));
    }
    function MacroSyntaxError$2797(name$2874, message$2875, stx$2876) {
        this.name = name$2874;
        this.message = message$2875;
        this.stx = stx$2876;
    }
    function throwSyntaxError$2798(name$2877, message$2878, stx$2879) {
        if (stx$2879 && Array.isArray(stx$2879)) {
            stx$2879 = stx$2879[0];
        }
        throw new MacroSyntaxError$2797(name$2877, message$2878, stx$2879);
    }
    function printSyntaxError$2799(code$2880, err$2881) {
        if (!err$2881.stx) {
            return '[' + err$2881.name + '] ' + err$2881.message;
        }
        var token$2882 = err$2881.stx.token;
        var lineNumber$2883 = token$2882.sm_startLineNumber || token$2882.sm_lineNumber || token$2882.startLineNumber || token$2882.lineNumber;
        var lineStart$2884 = token$2882.sm_startLineStart || token$2882.sm_lineStart || token$2882.startLineStart || token$2882.lineStart;
        var start$2885 = (token$2882.sm_startRange || token$2882.sm_range || token$2882.startRange || token$2882.range)[0];
        var offset$2886 = start$2885 - lineStart$2884;
        var line$2887 = '';
        var pre$2888 = lineNumber$2883 + ': ';
        var ch$2889;
        while (ch$2889 = code$2880.charAt(lineStart$2884++)) {
            if (ch$2889 == '\r' || ch$2889 == '\n') {
                break;
            }
            line$2887 += ch$2889;
        }
        return '[' + err$2881.name + '] ' + err$2881.message + '\n' + pre$2888 + line$2887 + '\n' + Array(offset$2886 + pre$2888.length).join(' ') + ' ^';
    }
    exports$2771.assert = assert$2775;
    exports$2771.unwrapSyntax = unwrapSyntax$2792;
    exports$2771.makeDelim = makeDelim$2791;
    exports$2771.makePunc = makePunc$2790;
    exports$2771.makeKeyword = makeKeyword$2789;
    exports$2771.makeIdent = makeIdent$2788;
    exports$2771.makeRegex = makeRegex$2787;
    exports$2771.makeValue = makeValue$2786;
    exports$2771.Rename = Rename$2776;
    exports$2771.Mark = Mark$2777;
    exports$2771.Var = Var$2779;
    exports$2771.Def = Def$2778;
    exports$2771.isDef = isDef$2782;
    exports$2771.isMark = isMark$2781;
    exports$2771.isRename = isRename$2780;
    exports$2771.syntaxFromToken = syntaxFromToken$2784;
    exports$2771.tokensToSyntax = tokensToSyntax$2794;
    exports$2771.syntaxToTokens = syntaxToTokens$2793;
    exports$2771.joinSyntax = joinSyntax$2795;
    exports$2771.joinSyntaxArr = joinSyntaxArr$2796;
    exports$2771.MacroSyntaxError = MacroSyntaxError$2797;
    exports$2771.throwSyntaxError = throwSyntaxError$2798;
    exports$2771.printSyntaxError = printSyntaxError$2799;
}));
//# sourceMappingURL=syntax.js.map