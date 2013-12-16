(function (root$2772, factory$2773) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2773(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$2773);
    }
}(this, function (exports$2774, _$2775, es6$2776, parser$2777, expander$2778) {
    function assert$2779(condition$2805, message$2806) {
        if (!condition$2805) {
            throw new Error('ASSERT: ' + message$2806);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2780(id$2807, name$2808, ctx$2809, defctx$2810) {
        defctx$2810 = defctx$2810 || null;
        return {
            id: id$2807,
            name: name$2808,
            context: ctx$2809,
            def: defctx$2810
        };
    }
    // (Num) -> CContext
    function Mark$2781(mark$2811, ctx$2812) {
        return {
            mark: mark$2811,
            context: ctx$2812
        };
    }
    function Def$2782(defctx$2813, ctx$2814) {
        return {
            defctx: defctx$2813,
            context: ctx$2814
        };
    }
    function Var$2783(id$2815) {
        return { id: id$2815 };
    }
    function isRename$2784(r$2816) {
        return r$2816 && typeof r$2816.id !== 'undefined' && typeof r$2816.name !== 'undefined';
    }
    function isMark$2785(m$2817) {
        return m$2817 && typeof m$2817.mark !== 'undefined';
    }
    function isDef$2786(ctx$2818) {
        return ctx$2818 && typeof ctx$2818.defctx !== 'undefined';
    }
    function Syntax$2787(token$2819, oldstx$2820) {
        this.token = token$2819;
        this.context = oldstx$2820 && oldstx$2820.context ? oldstx$2820.context : null;
        this.deferredContext = oldstx$2820 && oldstx$2820.deferredContext ? oldstx$2820.deferredContext : null;
    }
    Syntax$2787.prototype = {
        mark: function (newMark$2821) {
            if (this.token.inner) {
                var next$2822 = syntaxFromToken$2788(this.token, this);
                next$2822.deferredContext = Mark$2781(newMark$2821, this.deferredContext);
                return next$2822;
            }
            return syntaxFromToken$2788(this.token, { context: Mark$2781(newMark$2821, this.context) });
        },
        rename: function (id$2823, name$2824, defctx$2825) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2826 = syntaxFromToken$2788(this.token, this);
                next$2826.deferredContext = Rename$2780(id$2823, name$2824, this.deferredContext, defctx$2825);
                return next$2826;
            }
            if (this.token.type === parser$2777.Token.Identifier || this.token.type === parser$2777.Token.Keyword || this.token.type === parser$2777.Token.Punctuator) {
                return syntaxFromToken$2788(this.token, { context: Rename$2780(id$2823, name$2824, this.context, defctx$2825) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2827) {
            if (this.token.inner) {
                var next$2828 = syntaxFromToken$2788(this.token, this);
                next$2828.deferredContext = Def$2782(defctx$2827, this.deferredContext);
                return next$2828;
            }
            return syntaxFromToken$2788(this.token, { context: Def$2782(defctx$2827, this.context) });
        },
        getDefCtx: function () {
            var ctx$2829 = this.context;
            while (ctx$2829 !== null) {
                if (isDef$2786(ctx$2829)) {
                    return ctx$2829.defctx;
                }
                ctx$2829 = ctx$2829.context;
            }
            return null;
        },
        expose: function () {
            assert$2779(this.token.type === parser$2777.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2830(stxCtx$2831, ctx$2832) {
                if (ctx$2832 == null) {
                    return stxCtx$2831;
                } else if (isRename$2784(ctx$2832)) {
                    return Rename$2780(ctx$2832.id, ctx$2832.name, applyContext$2830(stxCtx$2831, ctx$2832.context), ctx$2832.def);
                } else if (isMark$2785(ctx$2832)) {
                    return Mark$2781(ctx$2832.mark, applyContext$2830(stxCtx$2831, ctx$2832.context));
                } else if (isDef$2786(ctx$2832)) {
                    return Def$2782(ctx$2832.defctx, applyContext$2830(stxCtx$2831, ctx$2832.context));
                } else {
                    assert$2779(false, 'unknown context type');
                }
            }
            this.token.inner = _$2775.map(this.token.inner, _$2775.bind(function (stx$2833) {
                if (stx$2833.token.inner) {
                    var next$2834 = syntaxFromToken$2788(stx$2833.token, stx$2833);
                    next$2834.deferredContext = applyContext$2830(stx$2833.deferredContext, this.deferredContext);
                    return next$2834;
                } else {
                    return syntaxFromToken$2788(stx$2833.token, { context: applyContext$2830(stx$2833.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2835 = this.token.type === parser$2777.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2835 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2788(token$2836, oldstx$2837) {
        return new Syntax$2787(token$2836, oldstx$2837);
    }
    function mkSyntax$2789(stx$2838, value$2839, type$2840, inner$2841) {
        if (stx$2838 && Array.isArray(stx$2838) && stx$2838.length === 1) {
            stx$2838 = stx$2838[0];
        } else if (stx$2838 && Array.isArray(stx$2838)) {
            throwSyntaxError$2802('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$2840 === parser$2777.Token.Delimiter) {
            var startLineNumber$2842, startLineStart$2843, endLineNumber$2844, endLineStart$2845, startRange$2846, endRange$2847;
            if (!Array.isArray(inner$2841)) {
                throwSyntaxError$2802('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2838 && stx$2838.token.type === parser$2777.Token.Delimiter) {
                startLineNumber$2842 = stx$2838.token.startLineNumber;
                startLineStart$2843 = stx$2838.token.startLineStart;
                endLineNumber$2844 = stx$2838.token.endLineNumber;
                endLineStart$2845 = stx$2838.token.endLineStart;
                startRange$2846 = stx$2838.token.startRange;
                endRange$2847 = stx$2838.token.endRange;
            } else if (stx$2838 && stx$2838.token) {
                startLineNumber$2842 = stx$2838.token.lineNumber;
                startLineStart$2843 = stx$2838.token.lineStart;
                endLineNumber$2844 = stx$2838.token.lineNumber;
                endLineStart$2845 = stx$2838.token.lineStart;
                startRange$2846 = stx$2838.token.range;
                endRange$2847 = stx$2838.token.range;
            }
            return syntaxFromToken$2788({
                type: parser$2777.Token.Delimiter,
                value: value$2839,
                inner: inner$2841,
                startLineStart: startLineStart$2843,
                startLineNumber: startLineNumber$2842,
                endLineStart: endLineStart$2845,
                endLineNumber: endLineNumber$2844,
                startRange: startRange$2846,
                endRange: endRange$2847
            }, stx$2838);
        } else {
            var lineStart$2848, lineNumber$2849, range$2850;
            if (stx$2838 && stx$2838.token.type === parser$2777.Token.Delimiter) {
                lineStart$2848 = stx$2838.token.startLineStart;
                lineNumber$2849 = stx$2838.token.startLineNumber;
                range$2850 = stx$2838.token.startRange;
            } else if (stx$2838 && stx$2838.token) {
                lineStart$2848 = stx$2838.token.lineStart;
                lineNumber$2849 = stx$2838.token.lineNumber;
                range$2850 = stx$2838.token.range;
            }
            return syntaxFromToken$2788({
                type: type$2840,
                value: value$2839,
                lineStart: lineStart$2848,
                lineNumber: lineNumber$2849,
                range: range$2850
            }, stx$2838);
        }
    }
    function makeValue$2790(val$2851, stx$2852) {
        if (typeof val$2851 === 'boolean') {
            return mkSyntax$2789(stx$2852, val$2851 ? 'true' : 'false', parser$2777.Token.BooleanLiteral);
        } else if (typeof val$2851 === 'number') {
            if (val$2851 !== val$2851) {
                return makeDelim$2795('()', [
                    makeValue$2790(0, stx$2852),
                    makePunc$2794('/', stx$2852),
                    makeValue$2790(0, stx$2852)
                ], stx$2852);
            }
            if (val$2851 < 0) {
                return makeDelim$2795('()', [
                    makePunc$2794('-', stx$2852),
                    makeValue$2790(Math.abs(val$2851), stx$2852)
                ], stx$2852);
            } else {
                return mkSyntax$2789(stx$2852, val$2851, parser$2777.Token.NumericLiteral);
            }
        } else if (typeof val$2851 === 'string') {
            return mkSyntax$2789(stx$2852, val$2851, parser$2777.Token.StringLiteral);
        } else if (val$2851 === null) {
            return mkSyntax$2789(stx$2852, 'null', parser$2777.Token.NullLiteral);
        } else {
            throwSyntaxError$2802('makeValue', 'Cannot make value syntax object from: ' + val$2851);
        }
    }
    function makeRegex$2791(val$2853, flags$2854, stx$2855) {
        var newstx$2856 = mkSyntax$2789(stx$2855, new RegExp(val$2853, flags$2854), parser$2777.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2856.token.literal = val$2853;
        return newstx$2856;
    }
    function makeIdent$2792(val$2857, stx$2858) {
        return mkSyntax$2789(stx$2858, val$2857, parser$2777.Token.Identifier);
    }
    function makeKeyword$2793(val$2859, stx$2860) {
        return mkSyntax$2789(stx$2860, val$2859, parser$2777.Token.Keyword);
    }
    function makePunc$2794(val$2861, stx$2862) {
        return mkSyntax$2789(stx$2862, val$2861, parser$2777.Token.Punctuator);
    }
    function makeDelim$2795(val$2863, inner$2864, stx$2865) {
        return mkSyntax$2789(stx$2865, val$2863, parser$2777.Token.Delimiter, inner$2864);
    }
    function unwrapSyntax$2796(stx$2866) {
        if (Array.isArray(stx$2866) && stx$2866.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2866 = stx$2866[0];
        }
        if (stx$2866.token) {
            if (stx$2866.token.type === parser$2777.Token.Delimiter) {
                return stx$2866.token;
            } else {
                return stx$2866.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2866);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2797(stx$2867) {
        return _$2775.map(stx$2867, function (stx$2868) {
            if (stx$2868.token.inner) {
                stx$2868.token.inner = syntaxToTokens$2797(stx$2868.token.inner);
            }
            return stx$2868.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2798(tokens$2869) {
        if (!_$2775.isArray(tokens$2869)) {
            tokens$2869 = [tokens$2869];
        }
        return _$2775.map(tokens$2869, function (token$2870) {
            if (token$2870.inner) {
                token$2870.inner = tokensToSyntax$2798(token$2870.inner);
            }
            return syntaxFromToken$2788(token$2870);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2799(tojoin$2871, punc$2872) {
        if (tojoin$2871.length === 0) {
            return [];
        }
        if (punc$2872 === ' ') {
            return tojoin$2871;
        }
        return _$2775.reduce(_$2775.rest(tojoin$2871, 1), function (acc$2873, join$2874) {
            return acc$2873.concat(makePunc$2794(punc$2872, join$2874), join$2874);
        }, [_$2775.first(tojoin$2871)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2800(tojoin$2875, punc$2876) {
        if (tojoin$2875.length === 0) {
            return [];
        }
        if (punc$2876 === ' ') {
            return _$2775.flatten(tojoin$2875, true);
        }
        return _$2775.reduce(_$2775.rest(tojoin$2875, 1), function (acc$2877, join$2878) {
            return acc$2877.concat(makePunc$2794(punc$2876, _$2775.first(join$2878)), join$2878);
        }, _$2775.first(tojoin$2875));
    }
    function MacroSyntaxError$2801(name$2879, message$2880, stx$2881) {
        this.name = name$2879;
        this.message = message$2880;
        this.stx = stx$2881;
    }
    function throwSyntaxError$2802(name$2882, message$2883, stx$2884) {
        if (stx$2884 && Array.isArray(stx$2884)) {
            stx$2884 = stx$2884[0];
        }
        throw new MacroSyntaxError$2801(name$2882, message$2883, stx$2884);
    }
    function printSyntaxError$2803(code$2885, err$2886) {
        if (!err$2886.stx) {
            return '[' + err$2886.name + '] ' + err$2886.message;
        }
        var token$2887 = err$2886.stx.token;
        var lineNumber$2888 = token$2887.sm_startLineNumber || token$2887.sm_lineNumber || token$2887.startLineNumber || token$2887.lineNumber;
        var lineStart$2889 = token$2887.sm_startLineStart || token$2887.sm_lineStart || token$2887.startLineStart || token$2887.lineStart;
        var start$2890 = (token$2887.sm_startRange || token$2887.sm_range || token$2887.startRange || token$2887.range)[0];
        var offset$2891 = start$2890 - lineStart$2889;
        var line$2892 = '';
        var pre$2893 = lineNumber$2888 + ': ';
        var ch$2894;
        while (ch$2894 = code$2885.charAt(lineStart$2889++)) {
            if (ch$2894 == '\r' || ch$2894 == '\n') {
                break;
            }
            line$2892 += ch$2894;
        }
        return '[' + err$2886.name + '] ' + err$2886.message + '\n' + pre$2893 + line$2892 + '\n' + Array(offset$2891 + pre$2893.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$2804(stxarr$2895, shouldResolve$2896) {
        var indent$2897 = 0;
        var unparsedLines$2898 = stxarr$2895.reduce(function (acc$2899, stx$2900) {
                var s$2901 = shouldResolve$2896 ? expander$2778.resolve(stx$2900) : stx$2900.token.value;
                // skip the end of file token
                if (stx$2900.token.type === parser$2777.Token.EOF) {
                    return acc$2899;
                }
                if (stx$2900.token.type === parser$2777.Token.StringLiteral) {
                    s$2901 = '"' + s$2901 + '"';
                }
                if (s$2901 == '{') {
                    acc$2899[0].str += ' ' + s$2901;
                    indent$2897++;
                    acc$2899.unshift({
                        indent: indent$2897,
                        str: ''
                    });
                } else if (s$2901 == '}') {
                    indent$2897--;
                    acc$2899.unshift({
                        indent: indent$2897,
                        str: s$2901
                    });
                    acc$2899.unshift({
                        indent: indent$2897,
                        str: ''
                    });
                } else if (s$2901 == ';') {
                    acc$2899[0].str += s$2901;
                    acc$2899.unshift({
                        indent: indent$2897,
                        str: ''
                    });
                } else {
                    acc$2899[0].str += (acc$2899[0].str ? ' ' : '') + s$2901;
                }
                return acc$2899;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2898.reduce(function (acc$2902, line$2903) {
            var ind$2904 = '';
            while (ind$2904.length < line$2903.indent * 2) {
                ind$2904 += ' ';
            }
            return ind$2904 + line$2903.str + '\n' + acc$2902;
        }, '');
    }
    exports$2774.assert = assert$2779;
    exports$2774.unwrapSyntax = unwrapSyntax$2796;
    exports$2774.makeDelim = makeDelim$2795;
    exports$2774.makePunc = makePunc$2794;
    exports$2774.makeKeyword = makeKeyword$2793;
    exports$2774.makeIdent = makeIdent$2792;
    exports$2774.makeRegex = makeRegex$2791;
    exports$2774.makeValue = makeValue$2790;
    exports$2774.Rename = Rename$2780;
    exports$2774.Mark = Mark$2781;
    exports$2774.Var = Var$2783;
    exports$2774.Def = Def$2782;
    exports$2774.isDef = isDef$2786;
    exports$2774.isMark = isMark$2785;
    exports$2774.isRename = isRename$2784;
    exports$2774.syntaxFromToken = syntaxFromToken$2788;
    exports$2774.tokensToSyntax = tokensToSyntax$2798;
    exports$2774.syntaxToTokens = syntaxToTokens$2797;
    exports$2774.joinSyntax = joinSyntax$2799;
    exports$2774.joinSyntaxArr = joinSyntaxArr$2800;
    exports$2774.prettyPrint = prettyPrint$2804;
    exports$2774.MacroSyntaxError = MacroSyntaxError$2801;
    exports$2774.throwSyntaxError = throwSyntaxError$2802;
    exports$2774.printSyntaxError = printSyntaxError$2803;
}));
//# sourceMappingURL=syntax.js.map