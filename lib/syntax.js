(function (root$2766, factory$2767) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2767(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$2767);
    }
}(this, function (exports$2768, _$2769, es6$2770, parser$2771, expander$2772) {
    function assert$2773(condition$2799, message$2800) {
        if (!condition$2799) {
            throw new Error('ASSERT: ' + message$2800);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2774(id$2801, name$2802, ctx$2803, defctx$2804) {
        defctx$2804 = defctx$2804 || null;
        return {
            id: id$2801,
            name: name$2802,
            context: ctx$2803,
            def: defctx$2804
        };
    }
    // (Num) -> CContext
    function Mark$2775(mark$2805, ctx$2806) {
        return {
            mark: mark$2805,
            context: ctx$2806
        };
    }
    function Def$2776(defctx$2807, ctx$2808) {
        return {
            defctx: defctx$2807,
            context: ctx$2808
        };
    }
    function Var$2777(id$2809) {
        return { id: id$2809 };
    }
    function isRename$2778(r$2810) {
        return r$2810 && typeof r$2810.id !== 'undefined' && typeof r$2810.name !== 'undefined';
    }
    ;
    function isMark$2779(m$2811) {
        return m$2811 && typeof m$2811.mark !== 'undefined';
    }
    ;
    function isDef$2780(ctx$2812) {
        return ctx$2812 && typeof ctx$2812.defctx !== 'undefined';
    }
    function Syntax$2781(token$2813, oldstx$2814) {
        this.token = token$2813;
        this.context = oldstx$2814 && oldstx$2814.context ? oldstx$2814.context : null;
        this.deferredContext = oldstx$2814 && oldstx$2814.deferredContext ? oldstx$2814.deferredContext : null;
    }
    Syntax$2781.prototype = {
        mark: function (newMark$2815) {
            if (this.token.inner) {
                var next$2816 = syntaxFromToken$2782(this.token, this);
                next$2816.deferredContext = Mark$2775(newMark$2815, this.deferredContext);
                return next$2816;
            }
            return syntaxFromToken$2782(this.token, { context: Mark$2775(newMark$2815, this.context) });
        },
        rename: function (id$2817, name$2818, defctx$2819) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2820 = syntaxFromToken$2782(this.token, this);
                next$2820.deferredContext = Rename$2774(id$2817, name$2818, this.deferredContext, defctx$2819);
                return next$2820;
            }
            if (this.token.type === parser$2771.Token.Identifier || this.token.type === parser$2771.Token.Keyword || this.token.type === parser$2771.Token.Punctuator) {
                return syntaxFromToken$2782(this.token, { context: Rename$2774(id$2817, name$2818, this.context, defctx$2819) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2821) {
            if (this.token.inner) {
                var next$2822 = syntaxFromToken$2782(this.token, this);
                next$2822.deferredContext = Def$2776(defctx$2821, this.deferredContext);
                return next$2822;
            }
            return syntaxFromToken$2782(this.token, { context: Def$2776(defctx$2821, this.context) });
        },
        getDefCtx: function () {
            var ctx$2823 = this.context;
            while (ctx$2823 !== null) {
                if (isDef$2780(ctx$2823)) {
                    return ctx$2823.defctx;
                }
                ctx$2823 = ctx$2823.context;
            }
            return null;
        },
        expose: function () {
            assert$2773(this.token.type === parser$2771.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2824(stxCtx$2825, ctx$2826) {
                if (ctx$2826 == null) {
                    return stxCtx$2825;
                } else if (isRename$2778(ctx$2826)) {
                    return Rename$2774(ctx$2826.id, ctx$2826.name, applyContext$2824(stxCtx$2825, ctx$2826.context), ctx$2826.def);
                } else if (isMark$2779(ctx$2826)) {
                    return Mark$2775(ctx$2826.mark, applyContext$2824(stxCtx$2825, ctx$2826.context));
                } else if (isDef$2780(ctx$2826)) {
                    return Def$2776(ctx$2826.defctx, applyContext$2824(stxCtx$2825, ctx$2826.context));
                } else {
                    assert$2773(false, 'unknown context type');
                }
            }
            this.token.inner = _$2769.map(this.token.inner, _$2769.bind(function (stx$2827) {
                if (stx$2827.token.inner) {
                    var next$2828 = syntaxFromToken$2782(stx$2827.token, stx$2827);
                    next$2828.deferredContext = applyContext$2824(stx$2827.deferredContext, this.deferredContext);
                    return next$2828;
                } else {
                    return syntaxFromToken$2782(stx$2827.token, { context: applyContext$2824(stx$2827.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2829 = this.token.type === parser$2771.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2829 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2782(token$2830, oldstx$2831) {
        return new Syntax$2781(token$2830, oldstx$2831);
    }
    function mkSyntax$2783(stx$2832, value$2833, type$2834, inner$2835) {
        if (stx$2832 && Array.isArray(stx$2832) && stx$2832.length === 1) {
            stx$2832 = stx$2832[0];
        } else if (stx$2832 && Array.isArray(stx$2832)) {
            throw new Error();
            throwSyntaxError$2796('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2834 === parser$2771.Token.Delimiter) {
            var startLineNumber$2836, startLineStart$2837, endLineNumber$2838, endLineStart$2839, startRange$2840, endRange$2841;
            if (!Array.isArray(inner$2835)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2796('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2832 && stx$2832.token.type === parser$2771.Token.Delimiter) {
                startLineNumber$2836 = stx$2832.token.startLineNumber;
                startLineStart$2837 = stx$2832.token.startLineStart;
                endLineNumber$2838 = stx$2832.token.endLineNumber;
                endLineStart$2839 = stx$2832.token.endLineStart;
                startRange$2840 = stx$2832.token.startRange;
                endRange$2841 = stx$2832.token.endRange;
            } else if (stx$2832 && stx$2832.token) {
                startLineNumber$2836 = stx$2832.token.lineNumber;
                startLineStart$2837 = stx$2832.token.lineStart;
                endLineNumber$2838 = stx$2832.token.lineNumber;
                endLineStart$2839 = stx$2832.token.lineStart;
                startRange$2840 = stx$2832.token.range;
                endRange$2841 = stx$2832.token.range;
            }
            return syntaxFromToken$2782({
                type: parser$2771.Token.Delimiter,
                value: value$2833,
                inner: inner$2835,
                startLineStart: startLineStart$2837,
                startLineNumber: startLineNumber$2836,
                endLineStart: endLineStart$2839,
                endLineNumber: endLineNumber$2838,
                startRange: startRange$2840,
                endRange: endRange$2841
            }, stx$2832);
        } else {
            var lineStart$2842, lineNumber$2843, range$2844;
            if (stx$2832 && stx$2832.token.type === parser$2771.Token.Delimiter) {
                lineStart$2842 = stx$2832.token.startLineStart;
                lineNumber$2843 = stx$2832.token.startLineNumber;
                range$2844 = stx$2832.token.startRange;
            } else if (stx$2832 && stx$2832.token) {
                lineStart$2842 = stx$2832.token.lineStart;
                lineNumber$2843 = stx$2832.token.lineNumber;
                range$2844 = stx$2832.token.range;
            }
            return syntaxFromToken$2782({
                type: type$2834,
                value: value$2833,
                lineStart: lineStart$2842,
                lineNumber: lineNumber$2843,
                range: range$2844
            }, stx$2832);
        }
    }
    function makeValue$2784(val$2845, stx$2846) {
        if (typeof val$2845 === 'boolean') {
            return mkSyntax$2783(stx$2846, val$2845 ? 'true' : 'false', parser$2771.Token.BooleanLiteral);
        } else if (typeof val$2845 === 'number') {
            if (val$2845 !== val$2845) {
                return makeDelim$2789('()', [
                    makeValue$2784(0, stx$2846),
                    makePunc$2788('/', stx$2846),
                    makeValue$2784(0, stx$2846)
                ], stx$2846);
            }
            if (val$2845 < 0) {
                return makeDelim$2789('()', [
                    makePunc$2788('-', stx$2846),
                    makeValue$2784(Math.abs(val$2845), stx$2846)
                ], stx$2846);
            } else {
                return mkSyntax$2783(stx$2846, val$2845, parser$2771.Token.NumericLiteral);
            }
        } else if (typeof val$2845 === 'string') {
            return mkSyntax$2783(stx$2846, val$2845, parser$2771.Token.StringLiteral);
        } else if (val$2845 === null) {
            return mkSyntax$2783(stx$2846, 'null', parser$2771.Token.NullLiteral);
        } else {
            throwSyntaxError$2796('makeValue', 'Cannot make value syntax object from: ' + val$2845);
        }
    }
    function makeRegex$2785(val$2847, flags$2848, stx$2849) {
        var newstx$2850 = mkSyntax$2783(stx$2849, new RegExp(val$2847, flags$2848), parser$2771.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2850.token.literal = val$2847;
        return newstx$2850;
    }
    function makeIdent$2786(val$2851, stx$2852) {
        return mkSyntax$2783(stx$2852, val$2851, parser$2771.Token.Identifier);
    }
    function makeKeyword$2787(val$2853, stx$2854) {
        return mkSyntax$2783(stx$2854, val$2853, parser$2771.Token.Keyword);
    }
    function makePunc$2788(val$2855, stx$2856) {
        return mkSyntax$2783(stx$2856, val$2855, parser$2771.Token.Punctuator);
    }
    function makeDelim$2789(val$2857, inner$2858, stx$2859) {
        return mkSyntax$2783(stx$2859, val$2857, parser$2771.Token.Delimiter, inner$2858);
    }
    function unwrapSyntax$2790(stx$2860) {
        if (Array.isArray(stx$2860) && stx$2860.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2860 = stx$2860[0];
        }
        if (stx$2860.token) {
            if (stx$2860.token.type === parser$2771.Token.Delimiter) {
                return stx$2860.token;
            } else {
                return stx$2860.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2860);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2791(stx$2861) {
        return _$2769.map(stx$2861, function (stx$2862) {
            if (stx$2862.token.inner) {
                stx$2862.token.inner = syntaxToTokens$2791(stx$2862.token.inner);
            }
            return stx$2862.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2792(tokens$2863) {
        if (!_$2769.isArray(tokens$2863)) {
            tokens$2863 = [tokens$2863];
        }
        return _$2769.map(tokens$2863, function (token$2864) {
            if (token$2864.inner) {
                token$2864.inner = tokensToSyntax$2792(token$2864.inner);
            }
            return syntaxFromToken$2782(token$2864);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2793(tojoin$2865, punc$2866) {
        if (tojoin$2865.length === 0) {
            return [];
        }
        if (punc$2866 === ' ') {
            return tojoin$2865;
        }
        return _$2769.reduce(_$2769.rest(tojoin$2865, 1), function (acc$2867, join$2868) {
            return acc$2867.concat(makePunc$2788(punc$2866, join$2868), join$2868);
        }, [_$2769.first(tojoin$2865)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2794(tojoin$2869, punc$2870) {
        if (tojoin$2869.length === 0) {
            return [];
        }
        if (punc$2870 === ' ') {
            return _$2769.flatten(tojoin$2869, true);
        }
        return _$2769.reduce(_$2769.rest(tojoin$2869, 1), function (acc$2871, join$2872) {
            return acc$2871.concat(makePunc$2788(punc$2870, _$2769.first(join$2872)), join$2872);
        }, _$2769.first(tojoin$2869));
    }
    function MacroSyntaxError$2795(name$2873, message$2874, stx$2875) {
        this.name = name$2873;
        this.message = message$2874;
        this.stx = stx$2875;
    }
    function throwSyntaxError$2796(name$2876, message$2877, stx$2878) {
        if (stx$2878 && Array.isArray(stx$2878)) {
            stx$2878 = stx$2878[0];
        }
        throw new MacroSyntaxError$2795(name$2876, message$2877, stx$2878);
    }
    function printSyntaxError$2797(code$2879, err$2880) {
        if (!err$2880.stx) {
            return '[' + err$2880.name + '] ' + err$2880.message;
        }
        var token$2881 = err$2880.stx.token;
        var lineNumber$2882 = token$2881.sm_startLineNumber || token$2881.sm_lineNumber || token$2881.startLineNumber || token$2881.lineNumber;
        var lineStart$2883 = token$2881.sm_startLineStart || token$2881.sm_lineStart || token$2881.startLineStart || token$2881.lineStart;
        var start$2884 = (token$2881.sm_startRange || token$2881.sm_range || token$2881.startRange || token$2881.range)[0];
        var offset$2885 = start$2884 - lineStart$2883;
        var line$2886 = '';
        var pre$2887 = lineNumber$2882 + ': ';
        var ch$2888;
        while (ch$2888 = code$2879.charAt(lineStart$2883++)) {
            if (ch$2888 == '\r' || ch$2888 == '\n') {
                break;
            }
            line$2886 += ch$2888;
        }
        return '[' + err$2880.name + '] ' + err$2880.message + '\n' + pre$2887 + line$2886 + '\n' + Array(offset$2885 + pre$2887.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$2798(stxarr$2889, shouldResolve$2890) {
        var indent$2891 = 0;
        var unparsedLines$2892 = stxarr$2889.reduce(function (acc$2893, stx$2894) {
                var s$2895 = shouldResolve$2890 ? expander$2772.resolve(stx$2894) : stx$2894.token.value;
                // skip the end of file token
                if (stx$2894.token.type === parser$2771.Token.EOF) {
                    return acc$2893;
                }
                if (stx$2894.token.type === parser$2771.Token.StringLiteral) {
                    s$2895 = '"' + s$2895 + '"';
                }
                if (s$2895 == '{') {
                    acc$2893[0].str += ' ' + s$2895;
                    indent$2891++;
                    acc$2893.unshift({
                        indent: indent$2891,
                        str: ''
                    });
                } else if (s$2895 == '}') {
                    indent$2891--;
                    acc$2893.unshift({
                        indent: indent$2891,
                        str: s$2895
                    });
                    acc$2893.unshift({
                        indent: indent$2891,
                        str: ''
                    });
                } else if (s$2895 == ';') {
                    acc$2893[0].str += s$2895;
                    acc$2893.unshift({
                        indent: indent$2891,
                        str: ''
                    });
                } else {
                    acc$2893[0].str += (acc$2893[0].str ? ' ' : '') + s$2895;
                }
                return acc$2893;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2892.reduce(function (acc$2896, line$2897) {
            var ind$2898 = '';
            while (ind$2898.length < line$2897.indent * 2) {
                ind$2898 += ' ';
            }
            return ind$2898 + line$2897.str + '\n' + acc$2896;
        }, '');
    }
    exports$2768.assert = assert$2773;
    exports$2768.unwrapSyntax = unwrapSyntax$2790;
    exports$2768.makeDelim = makeDelim$2789;
    exports$2768.makePunc = makePunc$2788;
    exports$2768.makeKeyword = makeKeyword$2787;
    exports$2768.makeIdent = makeIdent$2786;
    exports$2768.makeRegex = makeRegex$2785;
    exports$2768.makeValue = makeValue$2784;
    exports$2768.Rename = Rename$2774;
    exports$2768.Mark = Mark$2775;
    exports$2768.Var = Var$2777;
    exports$2768.Def = Def$2776;
    exports$2768.isDef = isDef$2780;
    exports$2768.isMark = isMark$2779;
    exports$2768.isRename = isRename$2778;
    exports$2768.syntaxFromToken = syntaxFromToken$2782;
    exports$2768.tokensToSyntax = tokensToSyntax$2792;
    exports$2768.syntaxToTokens = syntaxToTokens$2791;
    exports$2768.joinSyntax = joinSyntax$2793;
    exports$2768.joinSyntaxArr = joinSyntaxArr$2794;
    exports$2768.prettyPrint = prettyPrint$2798;
    exports$2768.MacroSyntaxError = MacroSyntaxError$2795;
    exports$2768.throwSyntaxError = throwSyntaxError$2796;
    exports$2768.printSyntaxError = printSyntaxError$2797;
}));
//# sourceMappingURL=syntax.js.map