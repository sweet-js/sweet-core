(function (root$3105, factory$3106) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3106(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$3106);
    }
}(this, function (exports$3107, _$3108, es6$3109, parser$3110, expander$3111) {
    function assert$3112(condition$3134, message$3135) {
        if (!condition$3134) {
            throw new Error('ASSERT: ' + message$3135);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3113(id$3136, name$3137, ctx$3138, defctx$3139) {
        defctx$3139 = defctx$3139 || null;
        this.id = id$3136;
        this.name = name$3137;
        this.context = ctx$3138;
        this.def = defctx$3139;
    }
    // (Num) -> CContext
    function Mark$3114(mark$3140, ctx$3141) {
        this.mark = mark$3140;
        this.context = ctx$3141;
    }
    function Def$3115(defctx$3142, ctx$3143) {
        this.defctx = defctx$3142;
        this.context = ctx$3143;
    }
    function Syntax$3116(token$3144, oldstx$3145) {
        this.token = token$3144;
        this.context = oldstx$3145 && oldstx$3145.context ? oldstx$3145.context : null;
        this.deferredContext = oldstx$3145 && oldstx$3145.deferredContext ? oldstx$3145.deferredContext : null;
    }
    Syntax$3116.prototype = {
        mark: function (newMark$3146) {
            if (this.token.inner) {
                var next$3147 = syntaxFromToken$3117(this.token, this);
                next$3147.deferredContext = new Mark$3114(newMark$3146, this.deferredContext);
                return next$3147;
            }
            return syntaxFromToken$3117(this.token, { context: new Mark$3114(newMark$3146, this.context) });
        },
        rename: function (id$3148, name$3149, defctx$3150) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3151 = syntaxFromToken$3117(this.token, this);
                next$3151.deferredContext = new Rename$3113(id$3148, name$3149, this.deferredContext, defctx$3150);
                return next$3151;
            }
            if (this.token.type === parser$3110.Token.Identifier || this.token.type === parser$3110.Token.Keyword || this.token.type === parser$3110.Token.Punctuator) {
                return syntaxFromToken$3117(this.token, { context: new Rename$3113(id$3148, name$3149, this.context, defctx$3150) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3152) {
            if (this.token.inner) {
                var next$3153 = syntaxFromToken$3117(this.token, this);
                next$3153.deferredContext = new Def$3115(defctx$3152, this.deferredContext);
                return next$3153;
            }
            return syntaxFromToken$3117(this.token, { context: new Def$3115(defctx$3152, this.context) });
        },
        getDefCtx: function () {
            var ctx$3154 = this.context;
            while (ctx$3154 !== null) {
                if (ctx$3154 instanceof Def$3115) {
                    return ctx$3154.defctx;
                }
                ctx$3154 = ctx$3154.context;
            }
            return null;
        },
        expose: function () {
            assert$3112(this.token.type === parser$3110.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3155(stxCtx$3156, ctx$3157) {
                if (ctx$3157 == null) {
                    return stxCtx$3156;
                } else if (ctx$3157 instanceof Rename$3113) {
                    return new Rename$3113(ctx$3157.id, ctx$3157.name, applyContext$3155(stxCtx$3156, ctx$3157.context), ctx$3157.def);
                } else if (ctx$3157 instanceof Mark$3114) {
                    return new Mark$3114(ctx$3157.mark, applyContext$3155(stxCtx$3156, ctx$3157.context));
                } else if (ctx$3157 instanceof Def$3115) {
                    return new Def$3115(ctx$3157.defctx, applyContext$3155(stxCtx$3156, ctx$3157.context));
                } else {
                    assert$3112(false, 'unknown context type');
                }
            }
            this.token.inner = _$3108.map(this.token.inner, _$3108.bind(function (stx$3158) {
                if (stx$3158.token.inner) {
                    var next$3159 = syntaxFromToken$3117(stx$3158.token, stx$3158);
                    next$3159.deferredContext = applyContext$3155(stx$3158.deferredContext, this.deferredContext);
                    return next$3159;
                } else {
                    return syntaxFromToken$3117(stx$3158.token, { context: applyContext$3155(stx$3158.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3160 = this.token.type === parser$3110.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3160 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3117(token$3161, oldstx$3162) {
        return new Syntax$3116(token$3161, oldstx$3162);
    }
    function mkSyntax$3118(stx$3163, value$3164, type$3165, inner$3166) {
        if (stx$3163 && Array.isArray(stx$3163) && stx$3163.length === 1) {
            stx$3163 = stx$3163[0];
        } else if (stx$3163 && Array.isArray(stx$3163)) {
            throwSyntaxError$3131('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3163 === undefined) {
            throwSyntaxError$3131('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3165 === parser$3110.Token.Delimiter) {
            var startLineNumber$3167, startLineStart$3168, endLineNumber$3169, endLineStart$3170, startRange$3171, endRange$3172;
            if (!Array.isArray(inner$3166)) {
                throwSyntaxError$3131('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3163 && stx$3163.token.type === parser$3110.Token.Delimiter) {
                startLineNumber$3167 = stx$3163.token.startLineNumber;
                startLineStart$3168 = stx$3163.token.startLineStart;
                endLineNumber$3169 = stx$3163.token.endLineNumber;
                endLineStart$3170 = stx$3163.token.endLineStart;
                startRange$3171 = stx$3163.token.startRange;
                endRange$3172 = stx$3163.token.endRange;
            } else if (stx$3163 && stx$3163.token) {
                startLineNumber$3167 = stx$3163.token.lineNumber;
                startLineStart$3168 = stx$3163.token.lineStart;
                endLineNumber$3169 = stx$3163.token.lineNumber;
                endLineStart$3170 = stx$3163.token.lineStart;
                startRange$3171 = stx$3163.token.range;
                endRange$3172 = stx$3163.token.range;
            }
            return syntaxFromToken$3117({
                type: parser$3110.Token.Delimiter,
                value: value$3164,
                inner: inner$3166,
                startLineStart: startLineStart$3168,
                startLineNumber: startLineNumber$3167,
                endLineStart: endLineStart$3170,
                endLineNumber: endLineNumber$3169,
                startRange: startRange$3171,
                endRange: endRange$3172
            }, stx$3163);
        } else {
            var lineStart$3173, lineNumber$3174, range$3175;
            if (stx$3163 && stx$3163.token.type === parser$3110.Token.Delimiter) {
                lineStart$3173 = stx$3163.token.startLineStart;
                lineNumber$3174 = stx$3163.token.startLineNumber;
                range$3175 = stx$3163.token.startRange;
            } else if (stx$3163 && stx$3163.token) {
                lineStart$3173 = stx$3163.token.lineStart;
                lineNumber$3174 = stx$3163.token.lineNumber;
                range$3175 = stx$3163.token.range;
            }
            return syntaxFromToken$3117({
                type: type$3165,
                value: value$3164,
                lineStart: lineStart$3173,
                lineNumber: lineNumber$3174,
                range: range$3175
            }, stx$3163);
        }
    }
    function makeValue$3119(val$3176, stx$3177) {
        if (typeof val$3176 === 'boolean') {
            return mkSyntax$3118(stx$3177, val$3176 ? 'true' : 'false', parser$3110.Token.BooleanLiteral);
        } else if (typeof val$3176 === 'number') {
            if (val$3176 !== val$3176) {
                return makeDelim$3124('()', [
                    makeValue$3119(0, stx$3177),
                    makePunc$3123('/', stx$3177),
                    makeValue$3119(0, stx$3177)
                ], stx$3177);
            }
            if (val$3176 < 0) {
                return makeDelim$3124('()', [
                    makePunc$3123('-', stx$3177),
                    makeValue$3119(Math.abs(val$3176), stx$3177)
                ], stx$3177);
            } else {
                return mkSyntax$3118(stx$3177, val$3176, parser$3110.Token.NumericLiteral);
            }
        } else if (typeof val$3176 === 'string') {
            return mkSyntax$3118(stx$3177, val$3176, parser$3110.Token.StringLiteral);
        } else if (val$3176 === null) {
            return mkSyntax$3118(stx$3177, 'null', parser$3110.Token.NullLiteral);
        } else {
            throwSyntaxError$3131('makeValue', 'Cannot make value syntax object from: ' + val$3176);
        }
    }
    function makeRegex$3120(val$3178, flags$3179, stx$3180) {
        var newstx$3181 = mkSyntax$3118(stx$3180, new RegExp(val$3178, flags$3179), parser$3110.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3181.token.literal = val$3178;
        return newstx$3181;
    }
    function makeIdent$3121(val$3182, stx$3183) {
        return mkSyntax$3118(stx$3183, val$3182, parser$3110.Token.Identifier);
    }
    function makeKeyword$3122(val$3184, stx$3185) {
        return mkSyntax$3118(stx$3185, val$3184, parser$3110.Token.Keyword);
    }
    function makePunc$3123(val$3186, stx$3187) {
        return mkSyntax$3118(stx$3187, val$3186, parser$3110.Token.Punctuator);
    }
    function makeDelim$3124(val$3188, inner$3189, stx$3190) {
        return mkSyntax$3118(stx$3190, val$3188, parser$3110.Token.Delimiter, inner$3189);
    }
    function unwrapSyntax$3125(stx$3191) {
        if (Array.isArray(stx$3191) && stx$3191.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3191 = stx$3191[0];
        }
        if (stx$3191.token) {
            if (stx$3191.token.type === parser$3110.Token.Delimiter) {
                return stx$3191.token;
            } else {
                return stx$3191.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3191);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3126(stx$3192) {
        return _$3108.map(stx$3192, function (stx$3193) {
            if (stx$3193.token.inner) {
                stx$3193.token.inner = syntaxToTokens$3126(stx$3193.token.inner);
            }
            return stx$3193.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3127(tokens$3194) {
        if (!_$3108.isArray(tokens$3194)) {
            tokens$3194 = [tokens$3194];
        }
        return _$3108.map(tokens$3194, function (token$3195) {
            if (token$3195.inner) {
                token$3195.inner = tokensToSyntax$3127(token$3195.inner);
            }
            return syntaxFromToken$3117(token$3195);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3128(tojoin$3196, punc$3197) {
        if (tojoin$3196.length === 0) {
            return [];
        }
        if (punc$3197 === ' ') {
            return tojoin$3196;
        }
        return _$3108.reduce(_$3108.rest(tojoin$3196, 1), function (acc$3198, join$3199) {
            acc$3198.push(makePunc$3123(punc$3197, join$3199), join$3199);
            return acc$3198;
        }, [_$3108.first(tojoin$3196)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3129(tojoin$3200, punc$3201) {
        if (tojoin$3200.length === 0) {
            return [];
        }
        if (punc$3201 === ' ') {
            return _$3108.flatten(tojoin$3200, true);
        }
        return _$3108.reduce(_$3108.rest(tojoin$3200, 1), function (acc$3202, join$3203) {
            acc$3202.push(makePunc$3123(punc$3201, _$3108.first(join$3203)));
            Array.prototype.push.apply(acc$3202, join$3203);
            return acc$3202;
        }, _$3108.first(tojoin$3200));
    }
    function MacroSyntaxError$3130(name$3204, message$3205, stx$3206) {
        this.name = name$3204;
        this.message = message$3205;
        this.stx = stx$3206;
    }
    function throwSyntaxError$3131(name$3207, message$3208, stx$3209) {
        if (stx$3209 && Array.isArray(stx$3209)) {
            stx$3209 = stx$3209[0];
        }
        throw new MacroSyntaxError$3130(name$3207, message$3208, stx$3209);
    }
    function printSyntaxError$3132(code$3210, err$3211) {
        if (!err$3211.stx) {
            return '[' + err$3211.name + '] ' + err$3211.message;
        }
        var token$3212 = err$3211.stx.token;
        var lineNumber$3213 = token$3212.sm_startLineNumber || token$3212.sm_lineNumber || token$3212.startLineNumber || token$3212.lineNumber;
        var lineStart$3214 = token$3212.sm_startLineStart || token$3212.sm_lineStart || token$3212.startLineStart || token$3212.lineStart;
        var start$3215 = (token$3212.sm_startRange || token$3212.sm_range || token$3212.startRange || token$3212.range)[0];
        var offset$3216 = start$3215 - lineStart$3214;
        var line$3217 = '';
        var pre$3218 = lineNumber$3213 + ': ';
        var ch$3219;
        while (ch$3219 = code$3210.charAt(lineStart$3214++)) {
            if (ch$3219 == '\r' || ch$3219 == '\n') {
                break;
            }
            line$3217 += ch$3219;
        }
        return '[' + err$3211.name + '] ' + err$3211.message + '\n' + pre$3218 + line$3217 + '\n' + Array(offset$3216 + pre$3218.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3133(stxarr$3220, shouldResolve$3221) {
        var indent$3222 = 0;
        var unparsedLines$3223 = stxarr$3220.reduce(function (acc$3224, stx$3225) {
                var s$3226 = shouldResolve$3221 ? expander$3111.resolve(stx$3225) : stx$3225.token.value;
                // skip the end of file token
                if (stx$3225.token.type === parser$3110.Token.EOF) {
                    return acc$3224;
                }
                if (stx$3225.token.type === parser$3110.Token.StringLiteral) {
                    s$3226 = '"' + s$3226 + '"';
                }
                if (s$3226 == '{') {
                    acc$3224[0].str += ' ' + s$3226;
                    indent$3222++;
                    acc$3224.unshift({
                        indent: indent$3222,
                        str: ''
                    });
                } else if (s$3226 == '}') {
                    indent$3222--;
                    acc$3224.unshift({
                        indent: indent$3222,
                        str: s$3226
                    });
                    acc$3224.unshift({
                        indent: indent$3222,
                        str: ''
                    });
                } else if (s$3226 == ';') {
                    acc$3224[0].str += s$3226;
                    acc$3224.unshift({
                        indent: indent$3222,
                        str: ''
                    });
                } else {
                    acc$3224[0].str += (acc$3224[0].str ? ' ' : '') + s$3226;
                }
                return acc$3224;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3223.reduce(function (acc$3227, line$3228) {
            var ind$3229 = '';
            while (ind$3229.length < line$3228.indent * 2) {
                ind$3229 += ' ';
            }
            return ind$3229 + line$3228.str + '\n' + acc$3227;
        }, '');
    }
    exports$3107.assert = assert$3112;
    exports$3107.unwrapSyntax = unwrapSyntax$3125;
    exports$3107.makeDelim = makeDelim$3124;
    exports$3107.makePunc = makePunc$3123;
    exports$3107.makeKeyword = makeKeyword$3122;
    exports$3107.makeIdent = makeIdent$3121;
    exports$3107.makeRegex = makeRegex$3120;
    exports$3107.makeValue = makeValue$3119;
    exports$3107.Rename = Rename$3113;
    exports$3107.Mark = Mark$3114;
    exports$3107.Def = Def$3115;
    exports$3107.syntaxFromToken = syntaxFromToken$3117;
    exports$3107.tokensToSyntax = tokensToSyntax$3127;
    exports$3107.syntaxToTokens = syntaxToTokens$3126;
    exports$3107.joinSyntax = joinSyntax$3128;
    exports$3107.joinSyntaxArr = joinSyntaxArr$3129;
    exports$3107.prettyPrint = prettyPrint$3133;
    exports$3107.MacroSyntaxError = MacroSyntaxError$3130;
    exports$3107.throwSyntaxError = throwSyntaxError$3131;
    exports$3107.printSyntaxError = printSyntaxError$3132;
}));
//# sourceMappingURL=syntax.js.map