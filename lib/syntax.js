(function (root$2760, factory$2761) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2761(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$2761);
    }
}(this, function (exports$2762, _$2763, es6$2764, parser$2765, expander$2766) {
    function assert$2767(condition$2793, message$2794) {
        if (!condition$2793) {
            throw new Error('ASSERT: ' + message$2794);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2768(id$2795, name$2796, ctx$2797, defctx$2798) {
        defctx$2798 = defctx$2798 || null;
        return {
            id: id$2795,
            name: name$2796,
            context: ctx$2797,
            def: defctx$2798
        };
    }
    // (Num) -> CContext
    function Mark$2769(mark$2799, ctx$2800) {
        return {
            mark: mark$2799,
            context: ctx$2800
        };
    }
    function Def$2770(defctx$2801, ctx$2802) {
        return {
            defctx: defctx$2801,
            context: ctx$2802
        };
    }
    function Var$2771(id$2803) {
        return { id: id$2803 };
    }
    function isRename$2772(r$2804) {
        return r$2804 && typeof r$2804.id !== 'undefined' && typeof r$2804.name !== 'undefined';
    }
    ;
    function isMark$2773(m$2805) {
        return m$2805 && typeof m$2805.mark !== 'undefined';
    }
    ;
    function isDef$2774(ctx$2806) {
        return ctx$2806 && typeof ctx$2806.defctx !== 'undefined';
    }
    function Syntax$2775(token$2807, oldstx$2808) {
        this.token = token$2807;
        this.context = oldstx$2808 && oldstx$2808.context ? oldstx$2808.context : null;
        this.deferredContext = oldstx$2808 && oldstx$2808.deferredContext ? oldstx$2808.deferredContext : null;
    }
    Syntax$2775.prototype = {
        mark: function (newMark$2809) {
            if (this.token.inner) {
                var next$2810 = syntaxFromToken$2776(this.token, this);
                next$2810.deferredContext = Mark$2769(newMark$2809, this.deferredContext);
                return next$2810;
            }
            return syntaxFromToken$2776(this.token, { context: Mark$2769(newMark$2809, this.context) });
        },
        rename: function (id$2811, name$2812, defctx$2813) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2814 = syntaxFromToken$2776(this.token, this);
                next$2814.deferredContext = Rename$2768(id$2811, name$2812, this.deferredContext, defctx$2813);
                return next$2814;
            }
            if (this.token.type === parser$2765.Token.Identifier || this.token.type === parser$2765.Token.Keyword || this.token.type === parser$2765.Token.Punctuator) {
                return syntaxFromToken$2776(this.token, { context: Rename$2768(id$2811, name$2812, this.context, defctx$2813) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2815) {
            if (this.token.inner) {
                var next$2816 = syntaxFromToken$2776(this.token, this);
                next$2816.deferredContext = Def$2770(defctx$2815, this.deferredContext);
                return next$2816;
            }
            return syntaxFromToken$2776(this.token, { context: Def$2770(defctx$2815, this.context) });
        },
        getDefCtx: function () {
            var ctx$2817 = this.context;
            while (ctx$2817 !== null) {
                if (isDef$2774(ctx$2817)) {
                    return ctx$2817.defctx;
                }
                ctx$2817 = ctx$2817.context;
            }
            return null;
        },
        expose: function () {
            assert$2767(this.token.type === parser$2765.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2818(stxCtx$2819, ctx$2820) {
                if (ctx$2820 == null) {
                    return stxCtx$2819;
                } else if (isRename$2772(ctx$2820)) {
                    return Rename$2768(ctx$2820.id, ctx$2820.name, applyContext$2818(stxCtx$2819, ctx$2820.context), ctx$2820.def);
                } else if (isMark$2773(ctx$2820)) {
                    return Mark$2769(ctx$2820.mark, applyContext$2818(stxCtx$2819, ctx$2820.context));
                } else if (isDef$2774(ctx$2820)) {
                    return Def$2770(ctx$2820.defctx, applyContext$2818(stxCtx$2819, ctx$2820.context));
                } else {
                    assert$2767(false, 'unknown context type');
                }
            }
            this.token.inner = _$2763.map(this.token.inner, _$2763.bind(function (stx$2821) {
                if (stx$2821.token.inner) {
                    var next$2822 = syntaxFromToken$2776(stx$2821.token, stx$2821);
                    next$2822.deferredContext = applyContext$2818(stx$2821.deferredContext, this.deferredContext);
                    return next$2822;
                } else {
                    return syntaxFromToken$2776(stx$2821.token, { context: applyContext$2818(stx$2821.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2823 = this.token.type === parser$2765.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2823 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2776(token$2824, oldstx$2825) {
        return new Syntax$2775(token$2824, oldstx$2825);
    }
    function mkSyntax$2777(stx$2826, value$2827, type$2828, inner$2829) {
        if (stx$2826 && Array.isArray(stx$2826) && stx$2826.length === 1) {
            stx$2826 = stx$2826[0];
        } else if (stx$2826 && Array.isArray(stx$2826)) {
            throw new Error();
            throwSyntaxError$2790('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2828 === parser$2765.Token.Delimiter) {
            var startLineNumber$2830, startLineStart$2831, endLineNumber$2832, endLineStart$2833, startRange$2834, endRange$2835;
            if (!Array.isArray(inner$2829)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2790('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2826 && stx$2826.token.type === parser$2765.Token.Delimiter) {
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
            return syntaxFromToken$2776({
                type: parser$2765.Token.Delimiter,
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
            if (stx$2826 && stx$2826.token.type === parser$2765.Token.Delimiter) {
                lineStart$2836 = stx$2826.token.startLineStart;
                lineNumber$2837 = stx$2826.token.startLineNumber;
                range$2838 = stx$2826.token.startRange;
            } else if (stx$2826 && stx$2826.token) {
                lineStart$2836 = stx$2826.token.lineStart;
                lineNumber$2837 = stx$2826.token.lineNumber;
                range$2838 = stx$2826.token.range;
            }
            return syntaxFromToken$2776({
                type: type$2828,
                value: value$2827,
                lineStart: lineStart$2836,
                lineNumber: lineNumber$2837,
                range: range$2838
            }, stx$2826);
        }
    }
    function makeValue$2778(val$2839, stx$2840) {
        if (typeof val$2839 === 'boolean') {
            return mkSyntax$2777(stx$2840, val$2839 ? 'true' : 'false', parser$2765.Token.BooleanLiteral);
        } else if (typeof val$2839 === 'number') {
            if (val$2839 !== val$2839) {
                return makeDelim$2783('()', [
                    makeValue$2778(0, stx$2840),
                    makePunc$2782('/', stx$2840),
                    makeValue$2778(0, stx$2840)
                ], stx$2840);
            }
            if (val$2839 < 0) {
                return makeDelim$2783('()', [
                    makePunc$2782('-', stx$2840),
                    makeValue$2778(Math.abs(val$2839), stx$2840)
                ], stx$2840);
            } else {
                return mkSyntax$2777(stx$2840, val$2839, parser$2765.Token.NumericLiteral);
            }
        } else if (typeof val$2839 === 'string') {
            return mkSyntax$2777(stx$2840, val$2839, parser$2765.Token.StringLiteral);
        } else if (val$2839 === null) {
            return mkSyntax$2777(stx$2840, 'null', parser$2765.Token.NullLiteral);
        } else {
            throwSyntaxError$2790('makeValue', 'Cannot make value syntax object from: ' + val$2839);
        }
    }
    function makeRegex$2779(val$2841, flags$2842, stx$2843) {
        var newstx$2844 = mkSyntax$2777(stx$2843, new RegExp(val$2841, flags$2842), parser$2765.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2844.token.literal = val$2841;
        return newstx$2844;
    }
    function makeIdent$2780(val$2845, stx$2846) {
        return mkSyntax$2777(stx$2846, val$2845, parser$2765.Token.Identifier);
    }
    function makeKeyword$2781(val$2847, stx$2848) {
        return mkSyntax$2777(stx$2848, val$2847, parser$2765.Token.Keyword);
    }
    function makePunc$2782(val$2849, stx$2850) {
        return mkSyntax$2777(stx$2850, val$2849, parser$2765.Token.Punctuator);
    }
    function makeDelim$2783(val$2851, inner$2852, stx$2853) {
        return mkSyntax$2777(stx$2853, val$2851, parser$2765.Token.Delimiter, inner$2852);
    }
    function unwrapSyntax$2784(stx$2854) {
        if (Array.isArray(stx$2854) && stx$2854.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2854 = stx$2854[0];
        }
        if (stx$2854.token) {
            if (stx$2854.token.type === parser$2765.Token.Delimiter) {
                return stx$2854.token;
            } else {
                return stx$2854.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2854);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2785(stx$2855) {
        return _$2763.map(stx$2855, function (stx$2856) {
            if (stx$2856.token.inner) {
                stx$2856.token.inner = syntaxToTokens$2785(stx$2856.token.inner);
            }
            return stx$2856.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2786(tokens$2857) {
        if (!_$2763.isArray(tokens$2857)) {
            tokens$2857 = [tokens$2857];
        }
        return _$2763.map(tokens$2857, function (token$2858) {
            if (token$2858.inner) {
                token$2858.inner = tokensToSyntax$2786(token$2858.inner);
            }
            return syntaxFromToken$2776(token$2858);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2787(tojoin$2859, punc$2860) {
        if (tojoin$2859.length === 0) {
            return [];
        }
        if (punc$2860 === ' ') {
            return tojoin$2859;
        }
        return _$2763.reduce(_$2763.rest(tojoin$2859, 1), function (acc$2861, join$2862) {
            return acc$2861.concat(makePunc$2782(punc$2860, join$2862), join$2862);
        }, [_$2763.first(tojoin$2859)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2788(tojoin$2863, punc$2864) {
        if (tojoin$2863.length === 0) {
            return [];
        }
        if (punc$2864 === ' ') {
            return _$2763.flatten(tojoin$2863, true);
        }
        return _$2763.reduce(_$2763.rest(tojoin$2863, 1), function (acc$2865, join$2866) {
            return acc$2865.concat(makePunc$2782(punc$2864, _$2763.first(join$2866)), join$2866);
        }, _$2763.first(tojoin$2863));
    }
    function MacroSyntaxError$2789(name$2867, message$2868, stx$2869) {
        this.name = name$2867;
        this.message = message$2868;
        this.stx = stx$2869;
    }
    function throwSyntaxError$2790(name$2870, message$2871, stx$2872) {
        if (stx$2872 && Array.isArray(stx$2872)) {
            stx$2872 = stx$2872[0];
        }
        throw new MacroSyntaxError$2789(name$2870, message$2871, stx$2872);
    }
    function printSyntaxError$2791(code$2873, err$2874) {
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
    function prettyPrint$2792(stxarr$2883, shouldResolve$2884) {
        var indent$2885 = 0;
        var unparsedLines$2886 = stxarr$2883.reduce(function (acc$2887, stx$2888) {
                var s$2889 = shouldResolve$2884 ? expander$2766.resolve(stx$2888) : stx$2888.token.value;
                // skip the end of file token
                if (stx$2888.token.type === parser$2765.Token.EOF) {
                    return acc$2887;
                }
                if (stx$2888.token.type === parser$2765.Token.StringLiteral) {
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
    exports$2762.assert = assert$2767;
    exports$2762.unwrapSyntax = unwrapSyntax$2784;
    exports$2762.makeDelim = makeDelim$2783;
    exports$2762.makePunc = makePunc$2782;
    exports$2762.makeKeyword = makeKeyword$2781;
    exports$2762.makeIdent = makeIdent$2780;
    exports$2762.makeRegex = makeRegex$2779;
    exports$2762.makeValue = makeValue$2778;
    exports$2762.Rename = Rename$2768;
    exports$2762.Mark = Mark$2769;
    exports$2762.Var = Var$2771;
    exports$2762.Def = Def$2770;
    exports$2762.isDef = isDef$2774;
    exports$2762.isMark = isMark$2773;
    exports$2762.isRename = isRename$2772;
    exports$2762.syntaxFromToken = syntaxFromToken$2776;
    exports$2762.tokensToSyntax = tokensToSyntax$2786;
    exports$2762.syntaxToTokens = syntaxToTokens$2785;
    exports$2762.joinSyntax = joinSyntax$2787;
    exports$2762.joinSyntaxArr = joinSyntaxArr$2788;
    exports$2762.prettyPrint = prettyPrint$2792;
    exports$2762.MacroSyntaxError = MacroSyntaxError$2789;
    exports$2762.throwSyntaxError = throwSyntaxError$2790;
    exports$2762.printSyntaxError = printSyntaxError$2791;
}));
//# sourceMappingURL=syntax.js.map