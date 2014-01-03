(function (root$3101, factory$3102) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3102(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$3102);
    }
}(this, function (exports$3103, _$3104, es6$3105, parser$3106, expander$3107) {
    function assert$3108(condition$3130, message$3131) {
        if (!condition$3130) {
            throw new Error('ASSERT: ' + message$3131);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3109(id$3132, name$3133, ctx$3134, defctx$3135) {
        defctx$3135 = defctx$3135 || null;
        this.id = id$3132;
        this.name = name$3133;
        this.context = ctx$3134;
        this.def = defctx$3135;
    }
    // (Num) -> CContext
    function Mark$3110(mark$3136, ctx$3137) {
        this.mark = mark$3136;
        this.context = ctx$3137;
    }
    function Def$3111(defctx$3138, ctx$3139) {
        this.defctx = defctx$3138;
        this.context = ctx$3139;
    }
    function Syntax$3112(token$3140, oldstx$3141) {
        this.token = token$3140;
        this.context = oldstx$3141 && oldstx$3141.context ? oldstx$3141.context : null;
        this.deferredContext = oldstx$3141 && oldstx$3141.deferredContext ? oldstx$3141.deferredContext : null;
    }
    Syntax$3112.prototype = {
        mark: function (newMark$3142) {
            if (this.token.inner) {
                var next$3143 = syntaxFromToken$3113(this.token, this);
                next$3143.deferredContext = new Mark$3110(newMark$3142, this.deferredContext);
                return next$3143;
            }
            return syntaxFromToken$3113(this.token, { context: new Mark$3110(newMark$3142, this.context) });
        },
        rename: function (id$3144, name$3145, defctx$3146) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3147 = syntaxFromToken$3113(this.token, this);
                next$3147.deferredContext = new Rename$3109(id$3144, name$3145, this.deferredContext, defctx$3146);
                return next$3147;
            }
            if (this.token.type === parser$3106.Token.Identifier || this.token.type === parser$3106.Token.Keyword || this.token.type === parser$3106.Token.Punctuator) {
                return syntaxFromToken$3113(this.token, { context: new Rename$3109(id$3144, name$3145, this.context, defctx$3146) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3148) {
            if (this.token.inner) {
                var next$3149 = syntaxFromToken$3113(this.token, this);
                next$3149.deferredContext = new Def$3111(defctx$3148, this.deferredContext);
                return next$3149;
            }
            return syntaxFromToken$3113(this.token, { context: new Def$3111(defctx$3148, this.context) });
        },
        getDefCtx: function () {
            var ctx$3150 = this.context;
            while (ctx$3150 !== null) {
                if (ctx$3150 instanceof Def$3111) {
                    return ctx$3150.defctx;
                }
                ctx$3150 = ctx$3150.context;
            }
            return null;
        },
        expose: function () {
            assert$3108(this.token.type === parser$3106.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3151(stxCtx$3152, ctx$3153) {
                if (ctx$3153 == null) {
                    return stxCtx$3152;
                } else if (ctx$3153 instanceof Rename$3109) {
                    return new Rename$3109(ctx$3153.id, ctx$3153.name, applyContext$3151(stxCtx$3152, ctx$3153.context), ctx$3153.def);
                } else if (ctx$3153 instanceof Mark$3110) {
                    return new Mark$3110(ctx$3153.mark, applyContext$3151(stxCtx$3152, ctx$3153.context));
                } else if (ctx$3153 instanceof Def$3111) {
                    return new Def$3111(ctx$3153.defctx, applyContext$3151(stxCtx$3152, ctx$3153.context));
                } else {
                    assert$3108(false, 'unknown context type');
                }
            }
            this.token.inner = _$3104.map(this.token.inner, _$3104.bind(function (stx$3154) {
                if (stx$3154.token.inner) {
                    var next$3155 = syntaxFromToken$3113(stx$3154.token, stx$3154);
                    next$3155.deferredContext = applyContext$3151(stx$3154.deferredContext, this.deferredContext);
                    return next$3155;
                } else {
                    return syntaxFromToken$3113(stx$3154.token, { context: applyContext$3151(stx$3154.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3156 = this.token.type === parser$3106.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3156 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3113(token$3157, oldstx$3158) {
        return new Syntax$3112(token$3157, oldstx$3158);
    }
    function mkSyntax$3114(stx$3159, value$3160, type$3161, inner$3162) {
        if (stx$3159 && Array.isArray(stx$3159) && stx$3159.length === 1) {
            stx$3159 = stx$3159[0];
        } else if (stx$3159 && Array.isArray(stx$3159)) {
            throwSyntaxError$3127('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3159 === undefined) {
            throwSyntaxError$3127('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3161 === parser$3106.Token.Delimiter) {
            var startLineNumber$3163, startLineStart$3164, endLineNumber$3165, endLineStart$3166, startRange$3167, endRange$3168;
            if (!Array.isArray(inner$3162)) {
                throwSyntaxError$3127('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3159 && stx$3159.token.type === parser$3106.Token.Delimiter) {
                startLineNumber$3163 = stx$3159.token.startLineNumber;
                startLineStart$3164 = stx$3159.token.startLineStart;
                endLineNumber$3165 = stx$3159.token.endLineNumber;
                endLineStart$3166 = stx$3159.token.endLineStart;
                startRange$3167 = stx$3159.token.startRange;
                endRange$3168 = stx$3159.token.endRange;
            } else if (stx$3159 && stx$3159.token) {
                startLineNumber$3163 = stx$3159.token.lineNumber;
                startLineStart$3164 = stx$3159.token.lineStart;
                endLineNumber$3165 = stx$3159.token.lineNumber;
                endLineStart$3166 = stx$3159.token.lineStart;
                startRange$3167 = stx$3159.token.range;
                endRange$3168 = stx$3159.token.range;
            }
            return syntaxFromToken$3113({
                type: parser$3106.Token.Delimiter,
                value: value$3160,
                inner: inner$3162,
                startLineStart: startLineStart$3164,
                startLineNumber: startLineNumber$3163,
                endLineStart: endLineStart$3166,
                endLineNumber: endLineNumber$3165,
                startRange: startRange$3167,
                endRange: endRange$3168
            }, stx$3159);
        } else {
            var lineStart$3169, lineNumber$3170, range$3171;
            if (stx$3159 && stx$3159.token.type === parser$3106.Token.Delimiter) {
                lineStart$3169 = stx$3159.token.startLineStart;
                lineNumber$3170 = stx$3159.token.startLineNumber;
                range$3171 = stx$3159.token.startRange;
            } else if (stx$3159 && stx$3159.token) {
                lineStart$3169 = stx$3159.token.lineStart;
                lineNumber$3170 = stx$3159.token.lineNumber;
                range$3171 = stx$3159.token.range;
            }
            return syntaxFromToken$3113({
                type: type$3161,
                value: value$3160,
                lineStart: lineStart$3169,
                lineNumber: lineNumber$3170,
                range: range$3171
            }, stx$3159);
        }
    }
    function makeValue$3115(val$3172, stx$3173) {
        if (typeof val$3172 === 'boolean') {
            return mkSyntax$3114(stx$3173, val$3172 ? 'true' : 'false', parser$3106.Token.BooleanLiteral);
        } else if (typeof val$3172 === 'number') {
            if (val$3172 !== val$3172) {
                return makeDelim$3120('()', [
                    makeValue$3115(0, stx$3173),
                    makePunc$3119('/', stx$3173),
                    makeValue$3115(0, stx$3173)
                ], stx$3173);
            }
            if (val$3172 < 0) {
                return makeDelim$3120('()', [
                    makePunc$3119('-', stx$3173),
                    makeValue$3115(Math.abs(val$3172), stx$3173)
                ], stx$3173);
            } else {
                return mkSyntax$3114(stx$3173, val$3172, parser$3106.Token.NumericLiteral);
            }
        } else if (typeof val$3172 === 'string') {
            return mkSyntax$3114(stx$3173, val$3172, parser$3106.Token.StringLiteral);
        } else if (val$3172 === null) {
            return mkSyntax$3114(stx$3173, 'null', parser$3106.Token.NullLiteral);
        } else {
            throwSyntaxError$3127('makeValue', 'Cannot make value syntax object from: ' + val$3172);
        }
    }
    function makeRegex$3116(val$3174, flags$3175, stx$3176) {
        var newstx$3177 = mkSyntax$3114(stx$3176, new RegExp(val$3174, flags$3175), parser$3106.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3177.token.literal = val$3174;
        return newstx$3177;
    }
    function makeIdent$3117(val$3178, stx$3179) {
        return mkSyntax$3114(stx$3179, val$3178, parser$3106.Token.Identifier);
    }
    function makeKeyword$3118(val$3180, stx$3181) {
        return mkSyntax$3114(stx$3181, val$3180, parser$3106.Token.Keyword);
    }
    function makePunc$3119(val$3182, stx$3183) {
        return mkSyntax$3114(stx$3183, val$3182, parser$3106.Token.Punctuator);
    }
    function makeDelim$3120(val$3184, inner$3185, stx$3186) {
        return mkSyntax$3114(stx$3186, val$3184, parser$3106.Token.Delimiter, inner$3185);
    }
    function unwrapSyntax$3121(stx$3187) {
        if (Array.isArray(stx$3187) && stx$3187.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3187 = stx$3187[0];
        }
        if (stx$3187.token) {
            if (stx$3187.token.type === parser$3106.Token.Delimiter) {
                return stx$3187.token;
            } else {
                return stx$3187.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3187);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3122(stx$3188) {
        return _$3104.map(stx$3188, function (stx$3189) {
            if (stx$3189.token.inner) {
                stx$3189.token.inner = syntaxToTokens$3122(stx$3189.token.inner);
            }
            return stx$3189.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3123(tokens$3190) {
        if (!_$3104.isArray(tokens$3190)) {
            tokens$3190 = [tokens$3190];
        }
        return _$3104.map(tokens$3190, function (token$3191) {
            if (token$3191.inner) {
                token$3191.inner = tokensToSyntax$3123(token$3191.inner);
            }
            return syntaxFromToken$3113(token$3191);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3124(tojoin$3192, punc$3193) {
        if (tojoin$3192.length === 0) {
            return [];
        }
        if (punc$3193 === ' ') {
            return tojoin$3192;
        }
        return _$3104.reduce(_$3104.rest(tojoin$3192, 1), function (acc$3194, join$3195) {
            acc$3194.push(makePunc$3119(punc$3193, join$3195), join$3195);
            return acc$3194;
        }, [_$3104.first(tojoin$3192)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3125(tojoin$3196, punc$3197) {
        if (tojoin$3196.length === 0) {
            return [];
        }
        if (punc$3197 === ' ') {
            return _$3104.flatten(tojoin$3196, true);
        }
        return _$3104.reduce(_$3104.rest(tojoin$3196, 1), function (acc$3198, join$3199) {
            acc$3198.push(makePunc$3119(punc$3197, _$3104.first(join$3199)));
            Array.prototype.push.apply(acc$3198, join$3199);
            return acc$3198;
        }, _$3104.first(tojoin$3196));
    }
    function MacroSyntaxError$3126(name$3200, message$3201, stx$3202) {
        this.name = name$3200;
        this.message = message$3201;
        this.stx = stx$3202;
    }
    function throwSyntaxError$3127(name$3203, message$3204, stx$3205) {
        if (stx$3205 && Array.isArray(stx$3205)) {
            stx$3205 = stx$3205[0];
        }
        throw new MacroSyntaxError$3126(name$3203, message$3204, stx$3205);
    }
    function printSyntaxError$3128(code$3206, err$3207) {
        if (!err$3207.stx) {
            return '[' + err$3207.name + '] ' + err$3207.message;
        }
        var token$3208 = err$3207.stx.token;
        var lineNumber$3209 = token$3208.sm_startLineNumber || token$3208.sm_lineNumber || token$3208.startLineNumber || token$3208.lineNumber;
        var lineStart$3210 = token$3208.sm_startLineStart || token$3208.sm_lineStart || token$3208.startLineStart || token$3208.lineStart;
        var start$3211 = (token$3208.sm_startRange || token$3208.sm_range || token$3208.startRange || token$3208.range)[0];
        var offset$3212 = start$3211 - lineStart$3210;
        var line$3213 = '';
        var pre$3214 = lineNumber$3209 + ': ';
        var ch$3215;
        while (ch$3215 = code$3206.charAt(lineStart$3210++)) {
            if (ch$3215 == '\r' || ch$3215 == '\n') {
                break;
            }
            line$3213 += ch$3215;
        }
        return '[' + err$3207.name + '] ' + err$3207.message + '\n' + pre$3214 + line$3213 + '\n' + Array(offset$3212 + pre$3214.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3129(stxarr$3216, shouldResolve$3217) {
        var indent$3218 = 0;
        var unparsedLines$3219 = stxarr$3216.reduce(function (acc$3220, stx$3221) {
                var s$3222 = shouldResolve$3217 ? expander$3107.resolve(stx$3221) : stx$3221.token.value;
                // skip the end of file token
                if (stx$3221.token.type === parser$3106.Token.EOF) {
                    return acc$3220;
                }
                if (stx$3221.token.type === parser$3106.Token.StringLiteral) {
                    s$3222 = '"' + s$3222 + '"';
                }
                if (s$3222 == '{') {
                    acc$3220[0].str += ' ' + s$3222;
                    indent$3218++;
                    acc$3220.unshift({
                        indent: indent$3218,
                        str: ''
                    });
                } else if (s$3222 == '}') {
                    indent$3218--;
                    acc$3220.unshift({
                        indent: indent$3218,
                        str: s$3222
                    });
                    acc$3220.unshift({
                        indent: indent$3218,
                        str: ''
                    });
                } else if (s$3222 == ';') {
                    acc$3220[0].str += s$3222;
                    acc$3220.unshift({
                        indent: indent$3218,
                        str: ''
                    });
                } else {
                    acc$3220[0].str += (acc$3220[0].str ? ' ' : '') + s$3222;
                }
                return acc$3220;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3219.reduce(function (acc$3223, line$3224) {
            var ind$3225 = '';
            while (ind$3225.length < line$3224.indent * 2) {
                ind$3225 += ' ';
            }
            return ind$3225 + line$3224.str + '\n' + acc$3223;
        }, '');
    }
    exports$3103.assert = assert$3108;
    exports$3103.unwrapSyntax = unwrapSyntax$3121;
    exports$3103.makeDelim = makeDelim$3120;
    exports$3103.makePunc = makePunc$3119;
    exports$3103.makeKeyword = makeKeyword$3118;
    exports$3103.makeIdent = makeIdent$3117;
    exports$3103.makeRegex = makeRegex$3116;
    exports$3103.makeValue = makeValue$3115;
    exports$3103.Rename = Rename$3109;
    exports$3103.Mark = Mark$3110;
    exports$3103.Def = Def$3111;
    exports$3103.syntaxFromToken = syntaxFromToken$3113;
    exports$3103.tokensToSyntax = tokensToSyntax$3123;
    exports$3103.syntaxToTokens = syntaxToTokens$3122;
    exports$3103.joinSyntax = joinSyntax$3124;
    exports$3103.joinSyntaxArr = joinSyntaxArr$3125;
    exports$3103.prettyPrint = prettyPrint$3129;
    exports$3103.MacroSyntaxError = MacroSyntaxError$3126;
    exports$3103.throwSyntaxError = throwSyntaxError$3127;
    exports$3103.printSyntaxError = printSyntaxError$3128;
}));
//# sourceMappingURL=syntax.js.map