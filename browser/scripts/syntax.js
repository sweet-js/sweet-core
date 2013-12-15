(function (root$2960, factory$2961) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2961(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$2961);
    }
}(this, function (exports$2962, _$2963, es6$2964, parser$2965, expander$2966) {
    function assert$2967(condition$2993, message$2994) {
        if (!condition$2993) {
            throw new Error('ASSERT: ' + message$2994);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$2968(id$2995, name$2996, ctx$2997, defctx$2998) {
        defctx$2998 = defctx$2998 || null;
        return {
            id: id$2995,
            name: name$2996,
            context: ctx$2997,
            def: defctx$2998
        };
    }
    // (Num) -> CContext
    function Mark$2969(mark$2999, ctx$3000) {
        return {
            mark: mark$2999,
            context: ctx$3000
        };
    }
    function Def$2970(defctx$3001, ctx$3002) {
        return {
            defctx: defctx$3001,
            context: ctx$3002
        };
    }
    function Var$2971(id$3003) {
        return { id: id$3003 };
    }
    function isRename$2972(r$3004) {
        return r$3004 && typeof r$3004.id !== 'undefined' && typeof r$3004.name !== 'undefined';
    }
    ;
    function isMark$2973(m$3005) {
        return m$3005 && typeof m$3005.mark !== 'undefined';
    }
    ;
    function isDef$2974(ctx$3006) {
        return ctx$3006 && typeof ctx$3006.defctx !== 'undefined';
    }
    function Syntax$2975(token$3007, oldstx$3008) {
        this.token = token$3007;
        this.context = oldstx$3008 && oldstx$3008.context ? oldstx$3008.context : null;
        this.deferredContext = oldstx$3008 && oldstx$3008.deferredContext ? oldstx$3008.deferredContext : null;
    }
    Syntax$2975.prototype = {
        mark: function (newMark$3009) {
            if (this.token.inner) {
                var next$3010 = syntaxFromToken$2976(this.token, this);
                next$3010.deferredContext = Mark$2969(newMark$3009, this.deferredContext);
                return next$3010;
            }
            return syntaxFromToken$2976(this.token, { context: Mark$2969(newMark$3009, this.context) });
        },
        rename: function (id$3011, name$3012, defctx$3013) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3014 = syntaxFromToken$2976(this.token, this);
                next$3014.deferredContext = Rename$2968(id$3011, name$3012, this.deferredContext, defctx$3013);
                return next$3014;
            }
            if (this.token.type === parser$2965.Token.Identifier || this.token.type === parser$2965.Token.Keyword || this.token.type === parser$2965.Token.Punctuator) {
                return syntaxFromToken$2976(this.token, { context: Rename$2968(id$3011, name$3012, this.context, defctx$3013) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3015) {
            if (this.token.inner) {
                var next$3016 = syntaxFromToken$2976(this.token, this);
                next$3016.deferredContext = Def$2970(defctx$3015, this.deferredContext);
                return next$3016;
            }
            return syntaxFromToken$2976(this.token, { context: Def$2970(defctx$3015, this.context) });
        },
        getDefCtx: function () {
            var ctx$3017 = this.context;
            while (ctx$3017 !== null) {
                if (isDef$2974(ctx$3017)) {
                    return ctx$3017.defctx;
                }
                ctx$3017 = ctx$3017.context;
            }
            return null;
        },
        expose: function () {
            assert$2967(this.token.type === parser$2965.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3018(stxCtx$3019, ctx$3020) {
                if (ctx$3020 == null) {
                    return stxCtx$3019;
                } else if (isRename$2972(ctx$3020)) {
                    return Rename$2968(ctx$3020.id, ctx$3020.name, applyContext$3018(stxCtx$3019, ctx$3020.context), ctx$3020.def);
                } else if (isMark$2973(ctx$3020)) {
                    return Mark$2969(ctx$3020.mark, applyContext$3018(stxCtx$3019, ctx$3020.context));
                } else if (isDef$2974(ctx$3020)) {
                    return Def$2970(ctx$3020.defctx, applyContext$3018(stxCtx$3019, ctx$3020.context));
                } else {
                    assert$2967(false, 'unknown context type');
                }
            }
            this.token.inner = _$2963.map(this.token.inner, _$2963.bind(function (stx$3021) {
                if (stx$3021.token.inner) {
                    var next$3022 = syntaxFromToken$2976(stx$3021.token, stx$3021);
                    next$3022.deferredContext = applyContext$3018(stx$3021.deferredContext, this.deferredContext);
                    return next$3022;
                } else {
                    return syntaxFromToken$2976(stx$3021.token, { context: applyContext$3018(stx$3021.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3023 = this.token.type === parser$2965.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3023 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2976(token$3024, oldstx$3025) {
        return new Syntax$2975(token$3024, oldstx$3025);
    }
    function mkSyntax$2977(stx$3026, value$3027, type$3028, inner$3029) {
        if (stx$3026 && Array.isArray(stx$3026) && stx$3026.length === 1) {
            stx$3026 = stx$3026[0];
        } else if (stx$3026 && Array.isArray(stx$3026)) {
            throw new Error();
            throwSyntaxError$2990('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$3028 === parser$2965.Token.Delimiter) {
            var startLineNumber$3030, startLineStart$3031, endLineNumber$3032, endLineStart$3033, startRange$3034, endRange$3035;
            if (!Array.isArray(inner$3029)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
                throwSyntaxError$2990('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3026 && stx$3026.token.type === parser$2965.Token.Delimiter) {
                startLineNumber$3030 = stx$3026.token.startLineNumber;
                startLineStart$3031 = stx$3026.token.startLineStart;
                endLineNumber$3032 = stx$3026.token.endLineNumber;
                endLineStart$3033 = stx$3026.token.endLineStart;
                startRange$3034 = stx$3026.token.startRange;
                endRange$3035 = stx$3026.token.endRange;
            } else if (stx$3026 && stx$3026.token) {
                startLineNumber$3030 = stx$3026.token.lineNumber;
                startLineStart$3031 = stx$3026.token.lineStart;
                endLineNumber$3032 = stx$3026.token.lineNumber;
                endLineStart$3033 = stx$3026.token.lineStart;
                startRange$3034 = stx$3026.token.range;
                endRange$3035 = stx$3026.token.range;
            }
            return syntaxFromToken$2976({
                type: parser$2965.Token.Delimiter,
                value: value$3027,
                inner: inner$3029,
                startLineStart: startLineStart$3031,
                startLineNumber: startLineNumber$3030,
                endLineStart: endLineStart$3033,
                endLineNumber: endLineNumber$3032,
                startRange: startRange$3034,
                endRange: endRange$3035
            }, stx$3026);
        } else {
            var lineStart$3036, lineNumber$3037, range$3038;
            if (stx$3026 && stx$3026.token.type === parser$2965.Token.Delimiter) {
                lineStart$3036 = stx$3026.token.startLineStart;
                lineNumber$3037 = stx$3026.token.startLineNumber;
                range$3038 = stx$3026.token.startRange;
            } else if (stx$3026 && stx$3026.token) {
                lineStart$3036 = stx$3026.token.lineStart;
                lineNumber$3037 = stx$3026.token.lineNumber;
                range$3038 = stx$3026.token.range;
            }
            return syntaxFromToken$2976({
                type: type$3028,
                value: value$3027,
                lineStart: lineStart$3036,
                lineNumber: lineNumber$3037,
                range: range$3038
            }, stx$3026);
        }
    }
    function makeValue$2978(val$3039, stx$3040) {
        if (typeof val$3039 === 'boolean') {
            return mkSyntax$2977(stx$3040, val$3039 ? 'true' : 'false', parser$2965.Token.BooleanLiteral);
        } else if (typeof val$3039 === 'number') {
            if (val$3039 !== val$3039) {
                return makeDelim$2983('()', [
                    makeValue$2978(0, stx$3040),
                    makePunc$2982('/', stx$3040),
                    makeValue$2978(0, stx$3040)
                ], stx$3040);
            }
            if (val$3039 < 0) {
                return makeDelim$2983('()', [
                    makePunc$2982('-', stx$3040),
                    makeValue$2978(Math.abs(val$3039), stx$3040)
                ], stx$3040);
            } else {
                return mkSyntax$2977(stx$3040, val$3039, parser$2965.Token.NumericLiteral);
            }
        } else if (typeof val$3039 === 'string') {
            return mkSyntax$2977(stx$3040, val$3039, parser$2965.Token.StringLiteral);
        } else if (val$3039 === null) {
            return mkSyntax$2977(stx$3040, 'null', parser$2965.Token.NullLiteral);
        } else {
            throwSyntaxError$2990('makeValue', 'Cannot make value syntax object from: ' + val$3039);
        }
    }
    function makeRegex$2979(val$3041, flags$3042, stx$3043) {
        var newstx$3044 = mkSyntax$2977(stx$3043, new RegExp(val$3041, flags$3042), parser$2965.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3044.token.literal = val$3041;
        return newstx$3044;
    }
    function makeIdent$2980(val$3045, stx$3046) {
        return mkSyntax$2977(stx$3046, val$3045, parser$2965.Token.Identifier);
    }
    function makeKeyword$2981(val$3047, stx$3048) {
        return mkSyntax$2977(stx$3048, val$3047, parser$2965.Token.Keyword);
    }
    function makePunc$2982(val$3049, stx$3050) {
        return mkSyntax$2977(stx$3050, val$3049, parser$2965.Token.Punctuator);
    }
    function makeDelim$2983(val$3051, inner$3052, stx$3053) {
        return mkSyntax$2977(stx$3053, val$3051, parser$2965.Token.Delimiter, inner$3052);
    }
    function unwrapSyntax$2984(stx$3054) {
        if (Array.isArray(stx$3054) && stx$3054.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3054 = stx$3054[0];
        }
        if (stx$3054.token) {
            if (stx$3054.token.type === parser$2965.Token.Delimiter) {
                return stx$3054.token;
            } else {
                return stx$3054.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3054);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2985(stx$3055) {
        return _$2963.map(stx$3055, function (stx$3056) {
            if (stx$3056.token.inner) {
                stx$3056.token.inner = syntaxToTokens$2985(stx$3056.token.inner);
            }
            return stx$3056.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2986(tokens$3057) {
        if (!_$2963.isArray(tokens$3057)) {
            tokens$3057 = [tokens$3057];
        }
        return _$2963.map(tokens$3057, function (token$3058) {
            if (token$3058.inner) {
                token$3058.inner = tokensToSyntax$2986(token$3058.inner);
            }
            return syntaxFromToken$2976(token$3058);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2987(tojoin$3059, punc$3060) {
        if (tojoin$3059.length === 0) {
            return [];
        }
        if (punc$3060 === ' ') {
            return tojoin$3059;
        }
        return _$2963.reduce(_$2963.rest(tojoin$3059, 1), function (acc$3061, join$3062) {
            return acc$3061.concat(makePunc$2982(punc$3060, join$3062), join$3062);
        }, [_$2963.first(tojoin$3059)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2988(tojoin$3063, punc$3064) {
        if (tojoin$3063.length === 0) {
            return [];
        }
        if (punc$3064 === ' ') {
            return _$2963.flatten(tojoin$3063, true);
        }
        return _$2963.reduce(_$2963.rest(tojoin$3063, 1), function (acc$3065, join$3066) {
            return acc$3065.concat(makePunc$2982(punc$3064, _$2963.first(join$3066)), join$3066);
        }, _$2963.first(tojoin$3063));
    }
    function MacroSyntaxError$2989(name$3067, message$3068, stx$3069) {
        this.name = name$3067;
        this.message = message$3068;
        this.stx = stx$3069;
    }
    function throwSyntaxError$2990(name$3070, message$3071, stx$3072) {
        if (stx$3072 && Array.isArray(stx$3072)) {
            stx$3072 = stx$3072[0];
        }
        throw new MacroSyntaxError$2989(name$3070, message$3071, stx$3072);
    }
    function printSyntaxError$2991(code$3073, err$3074) {
        if (!err$3074.stx) {
            return '[' + err$3074.name + '] ' + err$3074.message;
        }
        var token$3075 = err$3074.stx.token;
        var lineNumber$3076 = token$3075.sm_startLineNumber || token$3075.sm_lineNumber || token$3075.startLineNumber || token$3075.lineNumber;
        var lineStart$3077 = token$3075.sm_startLineStart || token$3075.sm_lineStart || token$3075.startLineStart || token$3075.lineStart;
        var start$3078 = (token$3075.sm_startRange || token$3075.sm_range || token$3075.startRange || token$3075.range)[0];
        var offset$3079 = start$3078 - lineStart$3077;
        var line$3080 = '';
        var pre$3081 = lineNumber$3076 + ': ';
        var ch$3082;
        while (ch$3082 = code$3073.charAt(lineStart$3077++)) {
            if (ch$3082 == '\r' || ch$3082 == '\n') {
                break;
            }
            line$3080 += ch$3082;
        }
        return '[' + err$3074.name + '] ' + err$3074.message + '\n' + pre$3081 + line$3080 + '\n' + Array(offset$3079 + pre$3081.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$2992(stxarr$3083, shouldResolve$3084) {
        var indent$3085 = 0;
        var unparsedLines$3086 = stxarr$3083.reduce(function (acc$3087, stx$3088) {
                var s$3089 = shouldResolve$3084 ? expander$2966.resolve(stx$3088) : stx$3088.token.value;
                // skip the end of file token
                if (stx$3088.token.type === parser$2965.Token.EOF) {
                    return acc$3087;
                }
                if (stx$3088.token.type === parser$2965.Token.StringLiteral) {
                    s$3089 = '"' + s$3089 + '"';
                }
                if (s$3089 == '{') {
                    acc$3087[0].str += ' ' + s$3089;
                    indent$3085++;
                    acc$3087.unshift({
                        indent: indent$3085,
                        str: ''
                    });
                } else if (s$3089 == '}') {
                    indent$3085--;
                    acc$3087.unshift({
                        indent: indent$3085,
                        str: s$3089
                    });
                    acc$3087.unshift({
                        indent: indent$3085,
                        str: ''
                    });
                } else if (s$3089 == ';') {
                    acc$3087[0].str += s$3089;
                    acc$3087.unshift({
                        indent: indent$3085,
                        str: ''
                    });
                } else {
                    acc$3087[0].str += (acc$3087[0].str ? ' ' : '') + s$3089;
                }
                return acc$3087;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3086.reduce(function (acc$3090, line$3091) {
            var ind$3092 = '';
            while (ind$3092.length < line$3091.indent * 2) {
                ind$3092 += ' ';
            }
            return ind$3092 + line$3091.str + '\n' + acc$3090;
        }, '');
    }
    exports$2962.assert = assert$2967;
    exports$2962.unwrapSyntax = unwrapSyntax$2984;
    exports$2962.makeDelim = makeDelim$2983;
    exports$2962.makePunc = makePunc$2982;
    exports$2962.makeKeyword = makeKeyword$2981;
    exports$2962.makeIdent = makeIdent$2980;
    exports$2962.makeRegex = makeRegex$2979;
    exports$2962.makeValue = makeValue$2978;
    exports$2962.Rename = Rename$2968;
    exports$2962.Mark = Mark$2969;
    exports$2962.Var = Var$2971;
    exports$2962.Def = Def$2970;
    exports$2962.isDef = isDef$2974;
    exports$2962.isMark = isMark$2973;
    exports$2962.isRename = isRename$2972;
    exports$2962.syntaxFromToken = syntaxFromToken$2976;
    exports$2962.tokensToSyntax = tokensToSyntax$2986;
    exports$2962.syntaxToTokens = syntaxToTokens$2985;
    exports$2962.joinSyntax = joinSyntax$2987;
    exports$2962.joinSyntaxArr = joinSyntaxArr$2988;
    exports$2962.prettyPrint = prettyPrint$2992;
    exports$2962.MacroSyntaxError = MacroSyntaxError$2989;
    exports$2962.throwSyntaxError = throwSyntaxError$2990;
    exports$2962.printSyntaxError = printSyntaxError$2991;
}));
//# sourceMappingURL=syntax.js.map