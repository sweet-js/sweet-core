(function (root$3115, factory$3116) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3116(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$3116);
    }
}(this, function (exports$3117, _$3118, es6$3119, parser$3120, expander$3121) {
    function assert$3122(condition$3144, message$3145) {
        if (!condition$3144) {
            throw new Error('ASSERT: ' + message$3145);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3123(id$3146, name$3147, ctx$3148, defctx$3149) {
        defctx$3149 = defctx$3149 || null;
        this.id = id$3146;
        this.name = name$3147;
        this.context = ctx$3148;
        this.def = defctx$3149;
    }
    // (Num) -> CContext
    function Mark$3124(mark$3150, ctx$3151) {
        this.mark = mark$3150;
        this.context = ctx$3151;
    }
    function Def$3125(defctx$3152, ctx$3153) {
        this.defctx = defctx$3152;
        this.context = ctx$3153;
    }
    function Syntax$3126(token$3154, oldstx$3155) {
        this.token = token$3154;
        this.context = oldstx$3155 && oldstx$3155.context ? oldstx$3155.context : null;
        this.deferredContext = oldstx$3155 && oldstx$3155.deferredContext ? oldstx$3155.deferredContext : null;
    }
    Syntax$3126.prototype = {
        mark: function (newMark$3156) {
            if (this.token.inner) {
                var next$3157 = syntaxFromToken$3127(this.token, this);
                next$3157.deferredContext = new Mark$3124(newMark$3156, this.deferredContext);
                return next$3157;
            }
            return syntaxFromToken$3127(this.token, { context: new Mark$3124(newMark$3156, this.context) });
        },
        rename: function (id$3158, name$3159, defctx$3160) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3161 = syntaxFromToken$3127(this.token, this);
                next$3161.deferredContext = new Rename$3123(id$3158, name$3159, this.deferredContext, defctx$3160);
                return next$3161;
            }
            if (this.token.type === parser$3120.Token.Identifier || this.token.type === parser$3120.Token.Keyword || this.token.type === parser$3120.Token.Punctuator) {
                return syntaxFromToken$3127(this.token, { context: new Rename$3123(id$3158, name$3159, this.context, defctx$3160) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3162) {
            if (this.token.inner) {
                var next$3163 = syntaxFromToken$3127(this.token, this);
                next$3163.deferredContext = new Def$3125(defctx$3162, this.deferredContext);
                return next$3163;
            }
            return syntaxFromToken$3127(this.token, { context: new Def$3125(defctx$3162, this.context) });
        },
        getDefCtx: function () {
            var ctx$3164 = this.context;
            while (ctx$3164 !== null) {
                if (ctx$3164 instanceof Def$3125) {
                    return ctx$3164.defctx;
                }
                ctx$3164 = ctx$3164.context;
            }
            return null;
        },
        expose: function () {
            assert$3122(this.token.type === parser$3120.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3165(stxCtx$3166, ctx$3167) {
                if (ctx$3167 == null) {
                    return stxCtx$3166;
                } else if (ctx$3167 instanceof Rename$3123) {
                    return new Rename$3123(ctx$3167.id, ctx$3167.name, applyContext$3165(stxCtx$3166, ctx$3167.context), ctx$3167.def);
                } else if (ctx$3167 instanceof Mark$3124) {
                    return new Mark$3124(ctx$3167.mark, applyContext$3165(stxCtx$3166, ctx$3167.context));
                } else if (ctx$3167 instanceof Def$3125) {
                    return new Def$3125(ctx$3167.defctx, applyContext$3165(stxCtx$3166, ctx$3167.context));
                } else {
                    assert$3122(false, 'unknown context type');
                }
            }
            this.token.inner = _$3118.map(this.token.inner, _$3118.bind(function (stx$3168) {
                if (stx$3168.token.inner) {
                    var next$3169 = syntaxFromToken$3127(stx$3168.token, stx$3168);
                    next$3169.deferredContext = applyContext$3165(stx$3168.deferredContext, this.deferredContext);
                    return next$3169;
                } else {
                    return syntaxFromToken$3127(stx$3168.token, { context: applyContext$3165(stx$3168.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3170 = this.token.type === parser$3120.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3170 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3127(token$3171, oldstx$3172) {
        return new Syntax$3126(token$3171, oldstx$3172);
    }
    function mkSyntax$3128(stx$3173, value$3174, type$3175, inner$3176) {
        if (stx$3173 && Array.isArray(stx$3173) && stx$3173.length === 1) {
            stx$3173 = stx$3173[0];
        } else if (stx$3173 && Array.isArray(stx$3173)) {
            throwSyntaxError$3141('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3173 === undefined) {
            throwSyntaxError$3141('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3175 === parser$3120.Token.Delimiter) {
            var startLineNumber$3177, startLineStart$3178, endLineNumber$3179, endLineStart$3180, startRange$3181, endRange$3182;
            if (!Array.isArray(inner$3176)) {
                throwSyntaxError$3141('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3173 && stx$3173.token.type === parser$3120.Token.Delimiter) {
                startLineNumber$3177 = stx$3173.token.startLineNumber;
                startLineStart$3178 = stx$3173.token.startLineStart;
                endLineNumber$3179 = stx$3173.token.endLineNumber;
                endLineStart$3180 = stx$3173.token.endLineStart;
                startRange$3181 = stx$3173.token.startRange;
                endRange$3182 = stx$3173.token.endRange;
            } else if (stx$3173 && stx$3173.token) {
                startLineNumber$3177 = stx$3173.token.lineNumber;
                startLineStart$3178 = stx$3173.token.lineStart;
                endLineNumber$3179 = stx$3173.token.lineNumber;
                endLineStart$3180 = stx$3173.token.lineStart;
                startRange$3181 = stx$3173.token.range;
                endRange$3182 = stx$3173.token.range;
            }
            return syntaxFromToken$3127({
                type: parser$3120.Token.Delimiter,
                value: value$3174,
                inner: inner$3176,
                startLineStart: startLineStart$3178,
                startLineNumber: startLineNumber$3177,
                endLineStart: endLineStart$3180,
                endLineNumber: endLineNumber$3179,
                startRange: startRange$3181,
                endRange: endRange$3182
            }, stx$3173);
        } else {
            var lineStart$3183, lineNumber$3184, range$3185;
            if (stx$3173 && stx$3173.token.type === parser$3120.Token.Delimiter) {
                lineStart$3183 = stx$3173.token.startLineStart;
                lineNumber$3184 = stx$3173.token.startLineNumber;
                range$3185 = stx$3173.token.startRange;
            } else if (stx$3173 && stx$3173.token) {
                lineStart$3183 = stx$3173.token.lineStart;
                lineNumber$3184 = stx$3173.token.lineNumber;
                range$3185 = stx$3173.token.range;
            }
            return syntaxFromToken$3127({
                type: type$3175,
                value: value$3174,
                lineStart: lineStart$3183,
                lineNumber: lineNumber$3184,
                range: range$3185
            }, stx$3173);
        }
    }
    function makeValue$3129(val$3186, stx$3187) {
        if (typeof val$3186 === 'boolean') {
            return mkSyntax$3128(stx$3187, val$3186 ? 'true' : 'false', parser$3120.Token.BooleanLiteral);
        } else if (typeof val$3186 === 'number') {
            if (val$3186 !== val$3186) {
                return makeDelim$3134('()', [
                    makeValue$3129(0, stx$3187),
                    makePunc$3133('/', stx$3187),
                    makeValue$3129(0, stx$3187)
                ], stx$3187);
            }
            if (val$3186 < 0) {
                return makeDelim$3134('()', [
                    makePunc$3133('-', stx$3187),
                    makeValue$3129(Math.abs(val$3186), stx$3187)
                ], stx$3187);
            } else {
                return mkSyntax$3128(stx$3187, val$3186, parser$3120.Token.NumericLiteral);
            }
        } else if (typeof val$3186 === 'string') {
            return mkSyntax$3128(stx$3187, val$3186, parser$3120.Token.StringLiteral);
        } else if (val$3186 === null) {
            return mkSyntax$3128(stx$3187, 'null', parser$3120.Token.NullLiteral);
        } else {
            throwSyntaxError$3141('makeValue', 'Cannot make value syntax object from: ' + val$3186);
        }
    }
    function makeRegex$3130(val$3188, flags$3189, stx$3190) {
        var newstx$3191 = mkSyntax$3128(stx$3190, new RegExp(val$3188, flags$3189), parser$3120.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3191.token.literal = val$3188;
        return newstx$3191;
    }
    function makeIdent$3131(val$3192, stx$3193) {
        return mkSyntax$3128(stx$3193, val$3192, parser$3120.Token.Identifier);
    }
    function makeKeyword$3132(val$3194, stx$3195) {
        return mkSyntax$3128(stx$3195, val$3194, parser$3120.Token.Keyword);
    }
    function makePunc$3133(val$3196, stx$3197) {
        return mkSyntax$3128(stx$3197, val$3196, parser$3120.Token.Punctuator);
    }
    function makeDelim$3134(val$3198, inner$3199, stx$3200) {
        return mkSyntax$3128(stx$3200, val$3198, parser$3120.Token.Delimiter, inner$3199);
    }
    function unwrapSyntax$3135(stx$3201) {
        if (Array.isArray(stx$3201) && stx$3201.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3201 = stx$3201[0];
        }
        if (stx$3201.token) {
            if (stx$3201.token.type === parser$3120.Token.Delimiter) {
                return stx$3201.token;
            } else {
                return stx$3201.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3201);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3136(stx$3202) {
        return _$3118.map(stx$3202, function (stx$3203) {
            if (stx$3203.token.inner) {
                stx$3203.token.inner = syntaxToTokens$3136(stx$3203.token.inner);
            }
            return stx$3203.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3137(tokens$3204) {
        if (!_$3118.isArray(tokens$3204)) {
            tokens$3204 = [tokens$3204];
        }
        return _$3118.map(tokens$3204, function (token$3205) {
            if (token$3205.inner) {
                token$3205.inner = tokensToSyntax$3137(token$3205.inner);
            }
            return syntaxFromToken$3127(token$3205);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3138(tojoin$3206, punc$3207) {
        if (tojoin$3206.length === 0) {
            return [];
        }
        if (punc$3207 === ' ') {
            return tojoin$3206;
        }
        return _$3118.reduce(_$3118.rest(tojoin$3206, 1), function (acc$3208, join$3209) {
            acc$3208.push(makePunc$3133(punc$3207, join$3209), join$3209);
            return acc$3208;
        }, [_$3118.first(tojoin$3206)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3139(tojoin$3210, punc$3211) {
        if (tojoin$3210.length === 0) {
            return [];
        }
        if (punc$3211 === ' ') {
            return _$3118.flatten(tojoin$3210, true);
        }
        return _$3118.reduce(_$3118.rest(tojoin$3210, 1), function (acc$3212, join$3213) {
            acc$3212.push(makePunc$3133(punc$3211, _$3118.first(join$3213)));
            Array.prototype.push.apply(acc$3212, join$3213);
            return acc$3212;
        }, _$3118.first(tojoin$3210));
    }
    function MacroSyntaxError$3140(name$3214, message$3215, stx$3216) {
        this.name = name$3214;
        this.message = message$3215;
        this.stx = stx$3216;
    }
    function throwSyntaxError$3141(name$3217, message$3218, stx$3219) {
        if (stx$3219 && Array.isArray(stx$3219)) {
            stx$3219 = stx$3219[0];
        }
        throw new MacroSyntaxError$3140(name$3217, message$3218, stx$3219);
    }
    function printSyntaxError$3142(code$3220, err$3221) {
        if (!err$3221.stx) {
            return '[' + err$3221.name + '] ' + err$3221.message;
        }
        var token$3222 = err$3221.stx.token;
        var lineNumber$3223 = token$3222.sm_startLineNumber || token$3222.sm_lineNumber || token$3222.startLineNumber || token$3222.lineNumber;
        var lineStart$3224 = token$3222.sm_startLineStart || token$3222.sm_lineStart || token$3222.startLineStart || token$3222.lineStart;
        var start$3225 = (token$3222.sm_startRange || token$3222.sm_range || token$3222.startRange || token$3222.range)[0];
        var offset$3226 = start$3225 - lineStart$3224;
        var line$3227 = '';
        var pre$3228 = lineNumber$3223 + ': ';
        var ch$3229;
        while (ch$3229 = code$3220.charAt(lineStart$3224++)) {
            if (ch$3229 == '\r' || ch$3229 == '\n') {
                break;
            }
            line$3227 += ch$3229;
        }
        return '[' + err$3221.name + '] ' + err$3221.message + '\n' + pre$3228 + line$3227 + '\n' + Array(offset$3226 + pre$3228.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3143(stxarr$3230, shouldResolve$3231) {
        var indent$3232 = 0;
        var unparsedLines$3233 = stxarr$3230.reduce(function (acc$3234, stx$3235) {
                var s$3236 = shouldResolve$3231 ? expander$3121.resolve(stx$3235) : stx$3235.token.value;
                // skip the end of file token
                if (stx$3235.token.type === parser$3120.Token.EOF) {
                    return acc$3234;
                }
                if (stx$3235.token.type === parser$3120.Token.StringLiteral) {
                    s$3236 = '"' + s$3236 + '"';
                }
                if (s$3236 == '{') {
                    acc$3234[0].str += ' ' + s$3236;
                    indent$3232++;
                    acc$3234.unshift({
                        indent: indent$3232,
                        str: ''
                    });
                } else if (s$3236 == '}') {
                    indent$3232--;
                    acc$3234.unshift({
                        indent: indent$3232,
                        str: s$3236
                    });
                    acc$3234.unshift({
                        indent: indent$3232,
                        str: ''
                    });
                } else if (s$3236 == ';') {
                    acc$3234[0].str += s$3236;
                    acc$3234.unshift({
                        indent: indent$3232,
                        str: ''
                    });
                } else {
                    acc$3234[0].str += (acc$3234[0].str ? ' ' : '') + s$3236;
                }
                return acc$3234;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3233.reduce(function (acc$3237, line$3238) {
            var ind$3239 = '';
            while (ind$3239.length < line$3238.indent * 2) {
                ind$3239 += ' ';
            }
            return ind$3239 + line$3238.str + '\n' + acc$3237;
        }, '');
    }
    exports$3117.assert = assert$3122;
    exports$3117.unwrapSyntax = unwrapSyntax$3135;
    exports$3117.makeDelim = makeDelim$3134;
    exports$3117.makePunc = makePunc$3133;
    exports$3117.makeKeyword = makeKeyword$3132;
    exports$3117.makeIdent = makeIdent$3131;
    exports$3117.makeRegex = makeRegex$3130;
    exports$3117.makeValue = makeValue$3129;
    exports$3117.Rename = Rename$3123;
    exports$3117.Mark = Mark$3124;
    exports$3117.Def = Def$3125;
    exports$3117.syntaxFromToken = syntaxFromToken$3127;
    exports$3117.tokensToSyntax = tokensToSyntax$3137;
    exports$3117.syntaxToTokens = syntaxToTokens$3136;
    exports$3117.joinSyntax = joinSyntax$3138;
    exports$3117.joinSyntaxArr = joinSyntaxArr$3139;
    exports$3117.prettyPrint = prettyPrint$3143;
    exports$3117.MacroSyntaxError = MacroSyntaxError$3140;
    exports$3117.throwSyntaxError = throwSyntaxError$3141;
    exports$3117.printSyntaxError = printSyntaxError$3142;
}));
//# sourceMappingURL=syntax.js.map