(function (root$3136, factory$3137) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3137(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$3137);
    }
}(this, function (exports$3138, _$3139, es6$3140, parser$3141) {
    // (CSyntax, Str) -> CContext
    function Rename$3142(id$3166, name$3167, ctx$3168, defctx$3169) {
        defctx$3169 = defctx$3169 || null;
        return {
            id: id$3166,
            name: name$3167,
            context: ctx$3168,
            def: defctx$3169
        };
    }
    // (Num) -> CContext
    function Mark$3143(mark$3170, ctx$3171) {
        return {
            mark: mark$3170,
            context: ctx$3171
        };
    }
    function Def$3144(defctx$3172, ctx$3173) {
        return {
            defctx: defctx$3172,
            context: ctx$3173
        };
    }
    function Var$3145(id$3174) {
        return { id: id$3174 };
    }
    function isRename$3146(r$3175) {
        return r$3175 && typeof r$3175.id !== 'undefined' && typeof r$3175.name !== 'undefined';
    }
    ;
    function isMark$3147(m$3176) {
        return m$3176 && typeof m$3176.mark !== 'undefined';
    }
    ;
    function isDef$3148(ctx$3177) {
        return ctx$3177 && typeof ctx$3177.defctx !== 'undefined';
    }
    function Syntax$3149(token$3178, oldstx$3179) {
        this.token = token$3178;
        this.context = oldstx$3179 && oldstx$3179.context ? oldstx$3179.context : null;
        this.deferredContext = oldstx$3179 && oldstx$3179.deferredContext ? oldstx$3179.deferredContext : null;
    }
    Syntax$3149.prototype = {
        mark: function (newMark$3180) {
            if (this.token.inner) {
                var next$3181 = syntaxFromToken$3150(this.token, this);
                next$3181.deferredContext = Mark$3143(newMark$3180, this.deferredContext);
                return next$3181;
            }
            return syntaxFromToken$3150(this.token, { context: Mark$3143(newMark$3180, this.context) });
        },
        rename: function (id$3182, name$3183, defctx$3184) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3185 = syntaxFromToken$3150(this.token, this);
                next$3185.deferredContext = Rename$3142(id$3182, name$3183, this.deferredContext, defctx$3184);
                return next$3185;
            }
            if (this.token.type === parser$3141.Token.Identifier || this.token.type === parser$3141.Token.Keyword || this.token.type === parser$3141.Token.Punctuator) {
                return syntaxFromToken$3150(this.token, { context: Rename$3142(id$3182, name$3183, this.context, defctx$3184) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3186) {
            if (this.token.inner) {
                var next$3187 = syntaxFromToken$3150(this.token, this);
                next$3187.deferredContext = Def$3144(defctx$3186, this.deferredContext);
                return next$3187;
            }
            return syntaxFromToken$3150(this.token, { context: Def$3144(defctx$3186, this.context) });
        },
        getDefCtx: function () {
            var ctx$3188 = this.context;
            while (ctx$3188 !== null) {
                if (isDef$3148(ctx$3188)) {
                    return ctx$3188.defctx;
                }
                ctx$3188 = ctx$3188.context;
            }
            return null;
        },
        expose: function () {
            parser$3141.assert(this.token.type === parser$3141.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3189(stxCtx$3190, ctx$3191) {
                if (ctx$3191 == null) {
                    return stxCtx$3190;
                } else if (isRename$3146(ctx$3191)) {
                    return Rename$3142(ctx$3191.id, ctx$3191.name, applyContext$3189(stxCtx$3190, ctx$3191.context), ctx$3191.def);
                } else if (isMark$3147(ctx$3191)) {
                    return Mark$3143(ctx$3191.mark, applyContext$3189(stxCtx$3190, ctx$3191.context));
                } else if (isDef$3148(ctx$3191)) {
                    return Def$3144(ctx$3191.defctx, applyContext$3189(stxCtx$3190, ctx$3191.context));
                } else {
                    parser$3141.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$3139.map(this.token.inner, _$3139.bind(function (stx$3192) {
                if (stx$3192.token.inner) {
                    var next$3193 = syntaxFromToken$3150(stx$3192.token, stx$3192);
                    next$3193.deferredContext = applyContext$3189(stx$3192.deferredContext, this.deferredContext);
                    return next$3193;
                } else {
                    return syntaxFromToken$3150(stx$3192.token, { context: applyContext$3189(stx$3192.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3194 = this.token.type === parser$3141.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3194 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3150(token$3195, oldstx$3196) {
        return new Syntax$3149(token$3195, oldstx$3196);
    }
    function mkSyntax$3151(stx$3197, value$3198, type$3199, inner$3200) {
        if (stx$3197 && Array.isArray(stx$3197) && stx$3197.length === 1) {
            stx$3197 = stx$3197[0];
        } else if (stx$3197 && Array.isArray(stx$3197)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$3197);
        }
        if (type$3199 === parser$3141.Token.Delimiter) {
            var startLineNumber$3201, startLineStart$3202, endLineNumber$3203, endLineStart$3204, startRange$3205, endRange$3206;
            if (!Array.isArray(inner$3200)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3197 && stx$3197.token.type === parser$3141.Token.Delimiter) {
                startLineNumber$3201 = stx$3197.token.startLineNumber;
                startLineStart$3202 = stx$3197.token.startLineStart;
                endLineNumber$3203 = stx$3197.token.endLineNumber;
                endLineStart$3204 = stx$3197.token.endLineStart;
                startRange$3205 = stx$3197.token.startRange;
                endRange$3206 = stx$3197.token.endRange;
            } else if (stx$3197 && stx$3197.token) {
                startLineNumber$3201 = stx$3197.token.lineNumber;
                startLineStart$3202 = stx$3197.token.lineStart;
                endLineNumber$3203 = stx$3197.token.lineNumber;
                endLineStart$3204 = stx$3197.token.lineStart;
                startRange$3205 = stx$3197.token.range;
                endRange$3206 = stx$3197.token.range;
            }
            return syntaxFromToken$3150({
                type: parser$3141.Token.Delimiter,
                value: value$3198,
                inner: inner$3200,
                startLineStart: startLineStart$3202,
                startLineNumber: startLineNumber$3201,
                endLineStart: endLineStart$3204,
                endLineNumber: endLineNumber$3203,
                startRange: startRange$3205,
                endRange: endRange$3206
            }, stx$3197);
        } else {
            var lineStart$3207, lineNumber$3208, range$3209;
            if (stx$3197 && stx$3197.token.type === parser$3141.Token.Delimiter) {
                lineStart$3207 = stx$3197.token.startLineStart;
                lineNumber$3208 = stx$3197.token.startLineNumber;
                range$3209 = stx$3197.token.startRange;
            } else if (stx$3197 && stx$3197.token) {
                lineStart$3207 = stx$3197.token.lineStart;
                lineNumber$3208 = stx$3197.token.lineNumber;
                range$3209 = stx$3197.token.range;
            }
            return syntaxFromToken$3150({
                type: type$3199,
                value: value$3198,
                lineStart: lineStart$3207,
                lineNumber: lineNumber$3208,
                range: range$3209
            }, stx$3197);
        }
    }
    function makeValue$3152(val$3210, stx$3211) {
        if (typeof val$3210 === 'boolean') {
            return mkSyntax$3151(stx$3211, val$3210 ? 'true' : 'false', parser$3141.Token.BooleanLiteral);
        } else if (typeof val$3210 === 'number') {
            if (val$3210 !== val$3210) {
                return makeDelim$3157('()', [
                    makeValue$3152(0, stx$3211),
                    makePunc$3156('/', stx$3211),
                    makeValue$3152(0, stx$3211)
                ], stx$3211);
            }
            if (val$3210 < 0) {
                return makeDelim$3157('()', [
                    makePunc$3156('-', stx$3211),
                    makeValue$3152(Math.abs(val$3210), stx$3211)
                ], stx$3211);
            } else {
                return mkSyntax$3151(stx$3211, val$3210, parser$3141.Token.NumericLiteral);
            }
        } else if (typeof val$3210 === 'string') {
            return mkSyntax$3151(stx$3211, val$3210, parser$3141.Token.StringLiteral);
        } else if (val$3210 === null) {
            return mkSyntax$3151(stx$3211, 'null', parser$3141.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$3210);
        }
    }
    function makeRegex$3153(val$3212, flags$3213, stx$3214) {
        var newstx$3215 = mkSyntax$3151(stx$3214, new RegExp(val$3212, flags$3213), parser$3141.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3215.token.literal = val$3212;
        return newstx$3215;
    }
    function makeIdent$3154(val$3216, stx$3217) {
        return mkSyntax$3151(stx$3217, val$3216, parser$3141.Token.Identifier);
    }
    function makeKeyword$3155(val$3218, stx$3219) {
        return mkSyntax$3151(stx$3219, val$3218, parser$3141.Token.Keyword);
    }
    function makePunc$3156(val$3220, stx$3221) {
        return mkSyntax$3151(stx$3221, val$3220, parser$3141.Token.Punctuator);
    }
    function makeDelim$3157(val$3222, inner$3223, stx$3224) {
        return mkSyntax$3151(stx$3224, val$3222, parser$3141.Token.Delimiter, inner$3223);
    }
    function unwrapSyntax$3158(stx$3225) {
        if (Array.isArray(stx$3225) && stx$3225.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3225 = stx$3225[0];
        }
        if (stx$3225.token) {
            if (stx$3225.token.type === parser$3141.Token.Delimiter) {
                return stx$3225.token;
            } else {
                return stx$3225.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3225);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3159(stx$3226) {
        return _$3139.map(stx$3226, function (stx$3227) {
            if (stx$3227.token.inner) {
                stx$3227.token.inner = syntaxToTokens$3159(stx$3227.token.inner);
            }
            return stx$3227.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3160(tokens$3228) {
        if (!_$3139.isArray(tokens$3228)) {
            tokens$3228 = [tokens$3228];
        }
        return _$3139.map(tokens$3228, function (token$3229) {
            if (token$3229.inner) {
                token$3229.inner = tokensToSyntax$3160(token$3229.inner);
            }
            return syntaxFromToken$3150(token$3229);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3161(tojoin$3230, punc$3231) {
        if (tojoin$3230.length === 0) {
            return [];
        }
        if (punc$3231 === ' ') {
            return tojoin$3230;
        }
        return _$3139.reduce(_$3139.rest(tojoin$3230, 1), function (acc$3232, join$3233) {
            return acc$3232.concat(makePunc$3156(punc$3231, join$3233), join$3233);
        }, [_$3139.first(tojoin$3230)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3162(tojoin$3234, punc$3235) {
        if (tojoin$3234.length === 0) {
            return [];
        }
        if (punc$3235 === ' ') {
            return _$3139.flatten(tojoin$3234, true);
        }
        return _$3139.reduce(_$3139.rest(tojoin$3234, 1), function (acc$3236, join$3237) {
            return acc$3236.concat(makePunc$3156(punc$3235, _$3139.first(join$3237)), join$3237);
        }, _$3139.first(tojoin$3234));
    }
    function MacroSyntaxError$3163(name$3238, message$3239, stx$3240) {
        this.name = name$3238;
        this.message = message$3239;
        this.stx = stx$3240;
    }
    function throwSyntaxError$3164(name$3241, message$3242, stx$3243) {
        if (stx$3243 && Array.isArray(stx$3243)) {
            stx$3243 = stx$3243[0];
        }
        throw new MacroSyntaxError$3163(name$3241, message$3242, stx$3243);
    }
    function printSyntaxError$3165(code$3244, err$3245) {
        if (!err$3245.stx) {
            return '[' + err$3245.name + '] ' + err$3245.message;
        }
        var token$3246 = err$3245.stx.token;
        var lineNumber$3247 = token$3246.startLineNumber || token$3246.lineNumber;
        var lineStart$3248 = token$3246.startLineStart || token$3246.lineStart;
        var start$3249 = token$3246.range[0];
        var offset$3250 = start$3249 - lineStart$3248;
        var line$3251 = '';
        var pre$3252 = lineNumber$3247 + ': ';
        var ch$3253;
        while (ch$3253 = code$3244.charAt(lineStart$3248++)) {
            if (ch$3253 == '\r' || ch$3253 == '\n') {
                break;
            }
            line$3251 += ch$3253;
        }
        return '[' + err$3245.name + '] ' + err$3245.message + '\n' + pre$3252 + line$3251 + '\n' + Array(offset$3250 + pre$3252.length).join(' ') + ' ^';
    }
    exports$3138.unwrapSyntax = unwrapSyntax$3158;
    exports$3138.makeDelim = makeDelim$3157;
    exports$3138.makePunc = makePunc$3156;
    exports$3138.makeKeyword = makeKeyword$3155;
    exports$3138.makeIdent = makeIdent$3154;
    exports$3138.makeRegex = makeRegex$3153;
    exports$3138.makeValue = makeValue$3152;
    exports$3138.Rename = Rename$3142;
    exports$3138.Mark = Mark$3143;
    exports$3138.Var = Var$3145;
    exports$3138.Def = Def$3144;
    exports$3138.isDef = isDef$3148;
    exports$3138.isMark = isMark$3147;
    exports$3138.isRename = isRename$3146;
    exports$3138.syntaxFromToken = syntaxFromToken$3150;
    exports$3138.tokensToSyntax = tokensToSyntax$3160;
    exports$3138.syntaxToTokens = syntaxToTokens$3159;
    exports$3138.joinSyntax = joinSyntax$3161;
    exports$3138.joinSyntaxArr = joinSyntaxArr$3162;
    exports$3138.MacroSyntaxError = MacroSyntaxError$3163;
    exports$3138.throwSyntaxError = throwSyntaxError$3164;
    exports$3138.printSyntaxError = printSyntaxError$3165;
}));