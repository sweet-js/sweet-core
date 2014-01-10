(function (root$3138, factory$3139) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3139(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$3139);
    }
}(this, function (exports$3140, _$3141, parser$3142, expander$3143) {
    function assert$3144(condition$3166, message$3167) {
        if (!condition$3166) {
            throw new Error('ASSERT: ' + message$3167);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3145(id$3168, name$3169, ctx$3170, defctx$3171) {
        defctx$3171 = defctx$3171 || null;
        this.id = id$3168;
        this.name = name$3169;
        this.context = ctx$3170;
        this.def = defctx$3171;
    }
    // (Num) -> CContext
    function Mark$3146(mark$3172, ctx$3173) {
        this.mark = mark$3172;
        this.context = ctx$3173;
    }
    function Def$3147(defctx$3174, ctx$3175) {
        this.defctx = defctx$3174;
        this.context = ctx$3175;
    }
    function Syntax$3148(token$3176, oldstx$3177) {
        this.token = token$3176;
        this.context = oldstx$3177 && oldstx$3177.context ? oldstx$3177.context : null;
        this.deferredContext = oldstx$3177 && oldstx$3177.deferredContext ? oldstx$3177.deferredContext : null;
    }
    Syntax$3148.prototype = {
        mark: function (newMark$3178) {
            if (this.token.inner) {
                var next$3179 = syntaxFromToken$3149(this.token, this);
                next$3179.deferredContext = new Mark$3146(newMark$3178, this.deferredContext);
                return next$3179;
            }
            return syntaxFromToken$3149(this.token, { context: new Mark$3146(newMark$3178, this.context) });
        },
        rename: function (id$3180, name$3181, defctx$3182) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3183 = syntaxFromToken$3149(this.token, this);
                next$3183.deferredContext = new Rename$3145(id$3180, name$3181, this.deferredContext, defctx$3182);
                return next$3183;
            }
            if (this.token.type === parser$3142.Token.Identifier || this.token.type === parser$3142.Token.Keyword || this.token.type === parser$3142.Token.Punctuator) {
                return syntaxFromToken$3149(this.token, { context: new Rename$3145(id$3180, name$3181, this.context, defctx$3182) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3184) {
            if (this.token.inner) {
                var next$3185 = syntaxFromToken$3149(this.token, this);
                next$3185.deferredContext = new Def$3147(defctx$3184, this.deferredContext);
                return next$3185;
            }
            return syntaxFromToken$3149(this.token, { context: new Def$3147(defctx$3184, this.context) });
        },
        getDefCtx: function () {
            var ctx$3186 = this.context;
            while (ctx$3186 !== null) {
                if (ctx$3186 instanceof Def$3147) {
                    return ctx$3186.defctx;
                }
                ctx$3186 = ctx$3186.context;
            }
            return null;
        },
        expose: function () {
            assert$3144(this.token.type === parser$3142.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3187(stxCtx$3188, ctx$3189) {
                if (ctx$3189 == null) {
                    return stxCtx$3188;
                } else if (ctx$3189 instanceof Rename$3145) {
                    return new Rename$3145(ctx$3189.id, ctx$3189.name, applyContext$3187(stxCtx$3188, ctx$3189.context), ctx$3189.def);
                } else if (ctx$3189 instanceof Mark$3146) {
                    return new Mark$3146(ctx$3189.mark, applyContext$3187(stxCtx$3188, ctx$3189.context));
                } else if (ctx$3189 instanceof Def$3147) {
                    return new Def$3147(ctx$3189.defctx, applyContext$3187(stxCtx$3188, ctx$3189.context));
                } else {
                    assert$3144(false, 'unknown context type');
                }
            }
            this.token.inner = _$3141.map(this.token.inner, _$3141.bind(function (stx$3190) {
                if (stx$3190.token.inner) {
                    var next$3191 = syntaxFromToken$3149(stx$3190.token, stx$3190);
                    next$3191.deferredContext = applyContext$3187(stx$3190.deferredContext, this.deferredContext);
                    return next$3191;
                } else {
                    return syntaxFromToken$3149(stx$3190.token, { context: applyContext$3187(stx$3190.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3192 = this.token.type === parser$3142.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3192 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3149(token$3193, oldstx$3194) {
        return new Syntax$3148(token$3193, oldstx$3194);
    }
    function mkSyntax$3150(stx$3195, value$3196, type$3197, inner$3198) {
        if (stx$3195 && Array.isArray(stx$3195) && stx$3195.length === 1) {
            stx$3195 = stx$3195[0];
        } else if (stx$3195 && Array.isArray(stx$3195)) {
            throwSyntaxError$3163('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$3195 === undefined) {
            throwSyntaxError$3163('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$3197 === parser$3142.Token.Delimiter) {
            var startLineNumber$3199, startLineStart$3200, endLineNumber$3201, endLineStart$3202, startRange$3203, endRange$3204;
            if (!Array.isArray(inner$3198)) {
                throwSyntaxError$3163('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3195 && stx$3195.token.type === parser$3142.Token.Delimiter) {
                startLineNumber$3199 = stx$3195.token.startLineNumber;
                startLineStart$3200 = stx$3195.token.startLineStart;
                endLineNumber$3201 = stx$3195.token.endLineNumber;
                endLineStart$3202 = stx$3195.token.endLineStart;
                startRange$3203 = stx$3195.token.startRange;
                endRange$3204 = stx$3195.token.endRange;
            } else if (stx$3195 && stx$3195.token) {
                startLineNumber$3199 = stx$3195.token.lineNumber;
                startLineStart$3200 = stx$3195.token.lineStart;
                endLineNumber$3201 = stx$3195.token.lineNumber;
                endLineStart$3202 = stx$3195.token.lineStart;
                startRange$3203 = stx$3195.token.range;
                endRange$3204 = stx$3195.token.range;
            }
            return syntaxFromToken$3149({
                type: parser$3142.Token.Delimiter,
                value: value$3196,
                inner: inner$3198,
                startLineStart: startLineStart$3200,
                startLineNumber: startLineNumber$3199,
                endLineStart: endLineStart$3202,
                endLineNumber: endLineNumber$3201,
                startRange: startRange$3203,
                endRange: endRange$3204
            }, stx$3195);
        } else {
            var lineStart$3205, lineNumber$3206, range$3207;
            if (stx$3195 && stx$3195.token.type === parser$3142.Token.Delimiter) {
                lineStart$3205 = stx$3195.token.startLineStart;
                lineNumber$3206 = stx$3195.token.startLineNumber;
                range$3207 = stx$3195.token.startRange;
            } else if (stx$3195 && stx$3195.token) {
                lineStart$3205 = stx$3195.token.lineStart;
                lineNumber$3206 = stx$3195.token.lineNumber;
                range$3207 = stx$3195.token.range;
            }
            return syntaxFromToken$3149({
                type: type$3197,
                value: value$3196,
                lineStart: lineStart$3205,
                lineNumber: lineNumber$3206,
                range: range$3207
            }, stx$3195);
        }
    }
    function makeValue$3151(val$3208, stx$3209) {
        if (typeof val$3208 === 'boolean') {
            return mkSyntax$3150(stx$3209, val$3208 ? 'true' : 'false', parser$3142.Token.BooleanLiteral);
        } else if (typeof val$3208 === 'number') {
            if (val$3208 !== val$3208) {
                return makeDelim$3156('()', [
                    makeValue$3151(0, stx$3209),
                    makePunc$3155('/', stx$3209),
                    makeValue$3151(0, stx$3209)
                ], stx$3209);
            }
            if (val$3208 < 0) {
                return makeDelim$3156('()', [
                    makePunc$3155('-', stx$3209),
                    makeValue$3151(Math.abs(val$3208), stx$3209)
                ], stx$3209);
            } else {
                return mkSyntax$3150(stx$3209, val$3208, parser$3142.Token.NumericLiteral);
            }
        } else if (typeof val$3208 === 'string') {
            return mkSyntax$3150(stx$3209, val$3208, parser$3142.Token.StringLiteral);
        } else if (val$3208 === null) {
            return mkSyntax$3150(stx$3209, 'null', parser$3142.Token.NullLiteral);
        } else {
            throwSyntaxError$3163('makeValue', 'Cannot make value syntax object from: ' + val$3208);
        }
    }
    function makeRegex$3152(val$3210, flags$3211, stx$3212) {
        var newstx$3213 = mkSyntax$3150(stx$3212, new RegExp(val$3210, flags$3211), parser$3142.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3213.token.literal = val$3210;
        return newstx$3213;
    }
    function makeIdent$3153(val$3214, stx$3215) {
        return mkSyntax$3150(stx$3215, val$3214, parser$3142.Token.Identifier);
    }
    function makeKeyword$3154(val$3216, stx$3217) {
        return mkSyntax$3150(stx$3217, val$3216, parser$3142.Token.Keyword);
    }
    function makePunc$3155(val$3218, stx$3219) {
        return mkSyntax$3150(stx$3219, val$3218, parser$3142.Token.Punctuator);
    }
    function makeDelim$3156(val$3220, inner$3221, stx$3222) {
        return mkSyntax$3150(stx$3222, val$3220, parser$3142.Token.Delimiter, inner$3221);
    }
    function unwrapSyntax$3157(stx$3223) {
        if (Array.isArray(stx$3223) && stx$3223.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3223 = stx$3223[0];
        }
        if (stx$3223.token) {
            if (stx$3223.token.type === parser$3142.Token.Delimiter) {
                return stx$3223.token;
            } else {
                return stx$3223.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3223);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3158(stx$3224) {
        return _$3141.map(stx$3224, function (stx$3225) {
            if (stx$3225.token.inner) {
                stx$3225.token.inner = syntaxToTokens$3158(stx$3225.token.inner);
            }
            return stx$3225.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3159(tokens$3226) {
        if (!_$3141.isArray(tokens$3226)) {
            tokens$3226 = [tokens$3226];
        }
        return _$3141.map(tokens$3226, function (token$3227) {
            if (token$3227.inner) {
                token$3227.inner = tokensToSyntax$3159(token$3227.inner);
            }
            return syntaxFromToken$3149(token$3227);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3160(tojoin$3228, punc$3229) {
        if (tojoin$3228.length === 0) {
            return [];
        }
        if (punc$3229 === ' ') {
            return tojoin$3228;
        }
        return _$3141.reduce(_$3141.rest(tojoin$3228, 1), function (acc$3230, join$3231) {
            acc$3230.push(makePunc$3155(punc$3229, join$3231), join$3231);
            return acc$3230;
        }, [_$3141.first(tojoin$3228)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3161(tojoin$3232, punc$3233) {
        if (tojoin$3232.length === 0) {
            return [];
        }
        if (punc$3233 === ' ') {
            return _$3141.flatten(tojoin$3232, true);
        }
        return _$3141.reduce(_$3141.rest(tojoin$3232, 1), function (acc$3234, join$3235) {
            acc$3234.push(makePunc$3155(punc$3233, _$3141.first(join$3235)));
            Array.prototype.push.apply(acc$3234, join$3235);
            return acc$3234;
        }, _$3141.first(tojoin$3232));
    }
    function MacroSyntaxError$3162(name$3236, message$3237, stx$3238) {
        this.name = name$3236;
        this.message = message$3237;
        this.stx = stx$3238;
    }
    function throwSyntaxError$3163(name$3239, message$3240, stx$3241) {
        if (stx$3241 && Array.isArray(stx$3241)) {
            stx$3241 = stx$3241[0];
        }
        throw new MacroSyntaxError$3162(name$3239, message$3240, stx$3241);
    }
    function printSyntaxError$3164(code$3242, err$3243) {
        if (!err$3243.stx) {
            return '[' + err$3243.name + '] ' + err$3243.message;
        }
        var token$3244 = err$3243.stx.token;
        var lineNumber$3245 = token$3244.sm_startLineNumber || token$3244.sm_lineNumber || token$3244.startLineNumber || token$3244.lineNumber;
        var lineStart$3246 = token$3244.sm_startLineStart || token$3244.sm_lineStart || token$3244.startLineStart || token$3244.lineStart;
        var start$3247 = (token$3244.sm_startRange || token$3244.sm_range || token$3244.startRange || token$3244.range)[0];
        var offset$3248 = start$3247 - lineStart$3246;
        var line$3249 = '';
        var pre$3250 = lineNumber$3245 + ': ';
        var ch$3251;
        while (ch$3251 = code$3242.charAt(lineStart$3246++)) {
            if (ch$3251 == '\r' || ch$3251 == '\n') {
                break;
            }
            line$3249 += ch$3251;
        }
        return '[' + err$3243.name + '] ' + err$3243.message + '\n' + pre$3250 + line$3249 + '\n' + Array(offset$3248 + pre$3250.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3165(stxarr$3252, shouldResolve$3253) {
        var indent$3254 = 0;
        var unparsedLines$3255 = stxarr$3252.reduce(function (acc$3256, stx$3257) {
                var s$3258 = shouldResolve$3253 ? expander$3143.resolve(stx$3257) : stx$3257.token.value;
                // skip the end of file token
                if (stx$3257.token.type === parser$3142.Token.EOF) {
                    return acc$3256;
                }
                if (stx$3257.token.type === parser$3142.Token.StringLiteral) {
                    s$3258 = '"' + s$3258 + '"';
                }
                if (s$3258 == '{') {
                    acc$3256[0].str += ' ' + s$3258;
                    indent$3254++;
                    acc$3256.unshift({
                        indent: indent$3254,
                        str: ''
                    });
                } else if (s$3258 == '}') {
                    indent$3254--;
                    acc$3256.unshift({
                        indent: indent$3254,
                        str: s$3258
                    });
                    acc$3256.unshift({
                        indent: indent$3254,
                        str: ''
                    });
                } else if (s$3258 == ';') {
                    acc$3256[0].str += s$3258;
                    acc$3256.unshift({
                        indent: indent$3254,
                        str: ''
                    });
                } else {
                    acc$3256[0].str += (acc$3256[0].str ? ' ' : '') + s$3258;
                }
                return acc$3256;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3255.reduce(function (acc$3259, line$3260) {
            var ind$3261 = '';
            while (ind$3261.length < line$3260.indent * 2) {
                ind$3261 += ' ';
            }
            return ind$3261 + line$3260.str + '\n' + acc$3259;
        }, '');
    }
    exports$3140.assert = assert$3144;
    exports$3140.unwrapSyntax = unwrapSyntax$3157;
    exports$3140.makeDelim = makeDelim$3156;
    exports$3140.makePunc = makePunc$3155;
    exports$3140.makeKeyword = makeKeyword$3154;
    exports$3140.makeIdent = makeIdent$3153;
    exports$3140.makeRegex = makeRegex$3152;
    exports$3140.makeValue = makeValue$3151;
    exports$3140.Rename = Rename$3145;
    exports$3140.Mark = Mark$3146;
    exports$3140.Def = Def$3147;
    exports$3140.syntaxFromToken = syntaxFromToken$3149;
    exports$3140.tokensToSyntax = tokensToSyntax$3159;
    exports$3140.syntaxToTokens = syntaxToTokens$3158;
    exports$3140.joinSyntax = joinSyntax$3160;
    exports$3140.joinSyntaxArr = joinSyntaxArr$3161;
    exports$3140.prettyPrint = prettyPrint$3165;
    exports$3140.MacroSyntaxError = MacroSyntaxError$3162;
    exports$3140.throwSyntaxError = throwSyntaxError$3163;
    exports$3140.printSyntaxError = printSyntaxError$3164;
}));
//# sourceMappingURL=syntax.js.map