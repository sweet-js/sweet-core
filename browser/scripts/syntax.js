(function (root$3106, factory$3107) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3107(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$3107);
    }
}(this, function (exports$3108, _$3109, es6$3110, parser$3111, expander$3112) {
    function assert$3113(condition$3135, message$3136) {
        if (!condition$3135) {
            throw new Error('ASSERT: ' + message$3136);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3114(id$3137, name$3138, ctx$3139, defctx$3140) {
        defctx$3140 = defctx$3140 || null;
        this.id = id$3137;
        this.name = name$3138;
        this.context = ctx$3139;
        this.def = defctx$3140;
    }
    // (Num) -> CContext
    function Mark$3115(mark$3141, ctx$3142) {
        this.mark = mark$3141;
        this.context = ctx$3142;
    }
    function Def$3116(defctx$3143, ctx$3144) {
        this.defctx = defctx$3143;
        this.context = ctx$3144;
    }
    function Syntax$3117(token$3145, oldstx$3146) {
        this.token = token$3145;
        this.context = oldstx$3146 && oldstx$3146.context ? oldstx$3146.context : null;
        this.deferredContext = oldstx$3146 && oldstx$3146.deferredContext ? oldstx$3146.deferredContext : null;
    }
    Syntax$3117.prototype = {
        mark: function (newMark$3147) {
            if (this.token.inner) {
                var next$3148 = syntaxFromToken$3118(this.token, this);
                next$3148.deferredContext = new Mark$3115(newMark$3147, this.deferredContext);
                return next$3148;
            }
            return syntaxFromToken$3118(this.token, { context: new Mark$3115(newMark$3147, this.context) });
        },
        rename: function (id$3149, name$3150, defctx$3151) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3152 = syntaxFromToken$3118(this.token, this);
                next$3152.deferredContext = new Rename$3114(id$3149, name$3150, this.deferredContext, defctx$3151);
                return next$3152;
            }
            if (this.token.type === parser$3111.Token.Identifier || this.token.type === parser$3111.Token.Keyword || this.token.type === parser$3111.Token.Punctuator) {
                return syntaxFromToken$3118(this.token, { context: new Rename$3114(id$3149, name$3150, this.context, defctx$3151) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3153) {
            if (this.token.inner) {
                var next$3154 = syntaxFromToken$3118(this.token, this);
                next$3154.deferredContext = new Def$3116(defctx$3153, this.deferredContext);
                return next$3154;
            }
            return syntaxFromToken$3118(this.token, { context: new Def$3116(defctx$3153, this.context) });
        },
        getDefCtx: function () {
            var ctx$3155 = this.context;
            while (ctx$3155 !== null) {
                if (ctx$3155 instanceof Def$3116) {
                    return ctx$3155.defctx;
                }
                ctx$3155 = ctx$3155.context;
            }
            return null;
        },
        expose: function () {
            assert$3113(this.token.type === parser$3111.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3156(stxCtx$3157, ctx$3158) {
                if (ctx$3158 == null) {
                    return stxCtx$3157;
                } else if (ctx$3158 instanceof Rename$3114) {
                    return new Rename$3114(ctx$3158.id, ctx$3158.name, applyContext$3156(stxCtx$3157, ctx$3158.context), ctx$3158.def);
                } else if (ctx$3158 instanceof Mark$3115) {
                    return new Mark$3115(ctx$3158.mark, applyContext$3156(stxCtx$3157, ctx$3158.context));
                } else if (ctx$3158 instanceof Def$3116) {
                    return new Def$3116(ctx$3158.defctx, applyContext$3156(stxCtx$3157, ctx$3158.context));
                } else {
                    assert$3113(false, 'unknown context type');
                }
            }
            this.token.inner = _$3109.map(this.token.inner, _$3109.bind(function (stx$3159) {
                if (stx$3159.token.inner) {
                    var next$3160 = syntaxFromToken$3118(stx$3159.token, stx$3159);
                    next$3160.deferredContext = applyContext$3156(stx$3159.deferredContext, this.deferredContext);
                    return next$3160;
                } else {
                    return syntaxFromToken$3118(stx$3159.token, { context: applyContext$3156(stx$3159.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3161 = this.token.type === parser$3111.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3161 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3118(token$3162, oldstx$3163) {
        return new Syntax$3117(token$3162, oldstx$3163);
    }
    function mkSyntax$3119(stx$3164, value$3165, type$3166, inner$3167) {
        if (stx$3164 && Array.isArray(stx$3164) && stx$3164.length === 1) {
            stx$3164 = stx$3164[0];
        } else if (stx$3164 && Array.isArray(stx$3164)) {
            throwSyntaxError$3132('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3164 === undefined) {
            throwSyntaxError$3132('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3166 === parser$3111.Token.Delimiter) {
            var startLineNumber$3168, startLineStart$3169, endLineNumber$3170, endLineStart$3171, startRange$3172, endRange$3173;
            if (!Array.isArray(inner$3167)) {
                throwSyntaxError$3132('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3164 && stx$3164.token.type === parser$3111.Token.Delimiter) {
                startLineNumber$3168 = stx$3164.token.startLineNumber;
                startLineStart$3169 = stx$3164.token.startLineStart;
                endLineNumber$3170 = stx$3164.token.endLineNumber;
                endLineStart$3171 = stx$3164.token.endLineStart;
                startRange$3172 = stx$3164.token.startRange;
                endRange$3173 = stx$3164.token.endRange;
            } else if (stx$3164 && stx$3164.token) {
                startLineNumber$3168 = stx$3164.token.lineNumber;
                startLineStart$3169 = stx$3164.token.lineStart;
                endLineNumber$3170 = stx$3164.token.lineNumber;
                endLineStart$3171 = stx$3164.token.lineStart;
                startRange$3172 = stx$3164.token.range;
                endRange$3173 = stx$3164.token.range;
            }
            return syntaxFromToken$3118({
                type: parser$3111.Token.Delimiter,
                value: value$3165,
                inner: inner$3167,
                startLineStart: startLineStart$3169,
                startLineNumber: startLineNumber$3168,
                endLineStart: endLineStart$3171,
                endLineNumber: endLineNumber$3170,
                startRange: startRange$3172,
                endRange: endRange$3173
            }, stx$3164);
        } else {
            var lineStart$3174, lineNumber$3175, range$3176;
            if (stx$3164 && stx$3164.token.type === parser$3111.Token.Delimiter) {
                lineStart$3174 = stx$3164.token.startLineStart;
                lineNumber$3175 = stx$3164.token.startLineNumber;
                range$3176 = stx$3164.token.startRange;
            } else if (stx$3164 && stx$3164.token) {
                lineStart$3174 = stx$3164.token.lineStart;
                lineNumber$3175 = stx$3164.token.lineNumber;
                range$3176 = stx$3164.token.range;
            }
            return syntaxFromToken$3118({
                type: type$3166,
                value: value$3165,
                lineStart: lineStart$3174,
                lineNumber: lineNumber$3175,
                range: range$3176
            }, stx$3164);
        }
    }
    function makeValue$3120(val$3177, stx$3178) {
        if (typeof val$3177 === 'boolean') {
            return mkSyntax$3119(stx$3178, val$3177 ? 'true' : 'false', parser$3111.Token.BooleanLiteral);
        } else if (typeof val$3177 === 'number') {
            if (val$3177 !== val$3177) {
                return makeDelim$3125('()', [
                    makeValue$3120(0, stx$3178),
                    makePunc$3124('/', stx$3178),
                    makeValue$3120(0, stx$3178)
                ], stx$3178);
            }
            if (val$3177 < 0) {
                return makeDelim$3125('()', [
                    makePunc$3124('-', stx$3178),
                    makeValue$3120(Math.abs(val$3177), stx$3178)
                ], stx$3178);
            } else {
                return mkSyntax$3119(stx$3178, val$3177, parser$3111.Token.NumericLiteral);
            }
        } else if (typeof val$3177 === 'string') {
            return mkSyntax$3119(stx$3178, val$3177, parser$3111.Token.StringLiteral);
        } else if (val$3177 === null) {
            return mkSyntax$3119(stx$3178, 'null', parser$3111.Token.NullLiteral);
        } else {
            throwSyntaxError$3132('makeValue', 'Cannot make value syntax object from: ' + val$3177);
        }
    }
    function makeRegex$3121(val$3179, flags$3180, stx$3181) {
        var newstx$3182 = mkSyntax$3119(stx$3181, new RegExp(val$3179, flags$3180), parser$3111.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3182.token.literal = val$3179;
        return newstx$3182;
    }
    function makeIdent$3122(val$3183, stx$3184) {
        return mkSyntax$3119(stx$3184, val$3183, parser$3111.Token.Identifier);
    }
    function makeKeyword$3123(val$3185, stx$3186) {
        return mkSyntax$3119(stx$3186, val$3185, parser$3111.Token.Keyword);
    }
    function makePunc$3124(val$3187, stx$3188) {
        return mkSyntax$3119(stx$3188, val$3187, parser$3111.Token.Punctuator);
    }
    function makeDelim$3125(val$3189, inner$3190, stx$3191) {
        return mkSyntax$3119(stx$3191, val$3189, parser$3111.Token.Delimiter, inner$3190);
    }
    function unwrapSyntax$3126(stx$3192) {
        if (Array.isArray(stx$3192) && stx$3192.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3192 = stx$3192[0];
        }
        if (stx$3192.token) {
            if (stx$3192.token.type === parser$3111.Token.Delimiter) {
                return stx$3192.token;
            } else {
                return stx$3192.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3192);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3127(stx$3193) {
        return _$3109.map(stx$3193, function (stx$3194) {
            if (stx$3194.token.inner) {
                stx$3194.token.inner = syntaxToTokens$3127(stx$3194.token.inner);
            }
            return stx$3194.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3128(tokens$3195) {
        if (!_$3109.isArray(tokens$3195)) {
            tokens$3195 = [tokens$3195];
        }
        return _$3109.map(tokens$3195, function (token$3196) {
            if (token$3196.inner) {
                token$3196.inner = tokensToSyntax$3128(token$3196.inner);
            }
            return syntaxFromToken$3118(token$3196);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3129(tojoin$3197, punc$3198) {
        if (tojoin$3197.length === 0) {
            return [];
        }
        if (punc$3198 === ' ') {
            return tojoin$3197;
        }
        return _$3109.reduce(_$3109.rest(tojoin$3197, 1), function (acc$3199, join$3200) {
            acc$3199.push(makePunc$3124(punc$3198, join$3200), join$3200);
            return acc$3199;
        }, [_$3109.first(tojoin$3197)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3130(tojoin$3201, punc$3202) {
        if (tojoin$3201.length === 0) {
            return [];
        }
        if (punc$3202 === ' ') {
            return _$3109.flatten(tojoin$3201, true);
        }
        return _$3109.reduce(_$3109.rest(tojoin$3201, 1), function (acc$3203, join$3204) {
            acc$3203.push(makePunc$3124(punc$3202, _$3109.first(join$3204)));
            Array.prototype.push.apply(acc$3203, join$3204);
            return acc$3203;
        }, _$3109.first(tojoin$3201));
    }
    function MacroSyntaxError$3131(name$3205, message$3206, stx$3207) {
        this.name = name$3205;
        this.message = message$3206;
        this.stx = stx$3207;
    }
    function throwSyntaxError$3132(name$3208, message$3209, stx$3210) {
        if (stx$3210 && Array.isArray(stx$3210)) {
            stx$3210 = stx$3210[0];
        }
        throw new MacroSyntaxError$3131(name$3208, message$3209, stx$3210);
    }
    function printSyntaxError$3133(code$3211, err$3212) {
        if (!err$3212.stx) {
            return '[' + err$3212.name + '] ' + err$3212.message;
        }
        var token$3213 = err$3212.stx.token;
        var lineNumber$3214 = token$3213.sm_startLineNumber || token$3213.sm_lineNumber || token$3213.startLineNumber || token$3213.lineNumber;
        var lineStart$3215 = token$3213.sm_startLineStart || token$3213.sm_lineStart || token$3213.startLineStart || token$3213.lineStart;
        var start$3216 = (token$3213.sm_startRange || token$3213.sm_range || token$3213.startRange || token$3213.range)[0];
        var offset$3217 = start$3216 - lineStart$3215;
        var line$3218 = '';
        var pre$3219 = lineNumber$3214 + ': ';
        var ch$3220;
        while (ch$3220 = code$3211.charAt(lineStart$3215++)) {
            if (ch$3220 == '\r' || ch$3220 == '\n') {
                break;
            }
            line$3218 += ch$3220;
        }
        return '[' + err$3212.name + '] ' + err$3212.message + '\n' + pre$3219 + line$3218 + '\n' + Array(offset$3217 + pre$3219.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3134(stxarr$3221, shouldResolve$3222) {
        var indent$3223 = 0;
        var unparsedLines$3224 = stxarr$3221.reduce(function (acc$3225, stx$3226) {
                var s$3227 = shouldResolve$3222 ? expander$3112.resolve(stx$3226) : stx$3226.token.value;
                // skip the end of file token
                if (stx$3226.token.type === parser$3111.Token.EOF) {
                    return acc$3225;
                }
                if (stx$3226.token.type === parser$3111.Token.StringLiteral) {
                    s$3227 = '"' + s$3227 + '"';
                }
                if (s$3227 == '{') {
                    acc$3225[0].str += ' ' + s$3227;
                    indent$3223++;
                    acc$3225.unshift({
                        indent: indent$3223,
                        str: ''
                    });
                } else if (s$3227 == '}') {
                    indent$3223--;
                    acc$3225.unshift({
                        indent: indent$3223,
                        str: s$3227
                    });
                    acc$3225.unshift({
                        indent: indent$3223,
                        str: ''
                    });
                } else if (s$3227 == ';') {
                    acc$3225[0].str += s$3227;
                    acc$3225.unshift({
                        indent: indent$3223,
                        str: ''
                    });
                } else {
                    acc$3225[0].str += (acc$3225[0].str ? ' ' : '') + s$3227;
                }
                return acc$3225;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3224.reduce(function (acc$3228, line$3229) {
            var ind$3230 = '';
            while (ind$3230.length < line$3229.indent * 2) {
                ind$3230 += ' ';
            }
            return ind$3230 + line$3229.str + '\n' + acc$3228;
        }, '');
    }
    exports$3108.assert = assert$3113;
    exports$3108.unwrapSyntax = unwrapSyntax$3126;
    exports$3108.makeDelim = makeDelim$3125;
    exports$3108.makePunc = makePunc$3124;
    exports$3108.makeKeyword = makeKeyword$3123;
    exports$3108.makeIdent = makeIdent$3122;
    exports$3108.makeRegex = makeRegex$3121;
    exports$3108.makeValue = makeValue$3120;
    exports$3108.Rename = Rename$3114;
    exports$3108.Mark = Mark$3115;
    exports$3108.Def = Def$3116;
    exports$3108.syntaxFromToken = syntaxFromToken$3118;
    exports$3108.tokensToSyntax = tokensToSyntax$3128;
    exports$3108.syntaxToTokens = syntaxToTokens$3127;
    exports$3108.joinSyntax = joinSyntax$3129;
    exports$3108.joinSyntaxArr = joinSyntaxArr$3130;
    exports$3108.prettyPrint = prettyPrint$3134;
    exports$3108.MacroSyntaxError = MacroSyntaxError$3131;
    exports$3108.throwSyntaxError = throwSyntaxError$3132;
    exports$3108.printSyntaxError = printSyntaxError$3133;
}));
//# sourceMappingURL=syntax.js.map