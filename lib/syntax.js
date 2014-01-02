(function (root$3099, factory$3100) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$3100(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander'
        ], factory$3100);
    }
}(this, function (exports$3101, _$3102, es6$3103, parser$3104, expander$3105) {
    function assert$3106(condition$3128, message$3129) {
        if (!condition$3128) {
            throw new Error('ASSERT: ' + message$3129);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$3107(id$3130, name$3131, ctx$3132, defctx$3133) {
        defctx$3133 = defctx$3133 || null;
        this.id = id$3130;
        this.name = name$3131;
        this.context = ctx$3132;
        this.def = defctx$3133;
    }
    // (Num) -> CContext
    function Mark$3108(mark$3134, ctx$3135) {
        this.mark = mark$3134;
        this.context = ctx$3135;
    }
    function Def$3109(defctx$3136, ctx$3137) {
        this.defctx = defctx$3136;
        this.context = ctx$3137;
    }
    function Syntax$3110(token$3138, oldstx$3139) {
        this.token = token$3138;
        this.context = oldstx$3139 && oldstx$3139.context ? oldstx$3139.context : null;
        this.deferredContext = oldstx$3139 && oldstx$3139.deferredContext ? oldstx$3139.deferredContext : null;
    }
    Syntax$3110.prototype = {
        mark: function (newMark$3140) {
            if (this.token.inner) {
                var next$3141 = syntaxFromToken$3111(this.token, this);
                next$3141.deferredContext = new Mark$3108(newMark$3140, this.deferredContext);
                return next$3141;
            }
            return syntaxFromToken$3111(this.token, { context: new Mark$3108(newMark$3140, this.context) });
        },
        rename: function (id$3142, name$3143, defctx$3144) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$3145 = syntaxFromToken$3111(this.token, this);
                next$3145.deferredContext = new Rename$3107(id$3142, name$3143, this.deferredContext, defctx$3144);
                return next$3145;
            }
            if (this.token.type === parser$3104.Token.Identifier || this.token.type === parser$3104.Token.Keyword || this.token.type === parser$3104.Token.Punctuator) {
                return syntaxFromToken$3111(this.token, { context: new Rename$3107(id$3142, name$3143, this.context, defctx$3144) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$3146) {
            if (this.token.inner) {
                var next$3147 = syntaxFromToken$3111(this.token, this);
                next$3147.deferredContext = new Def$3109(defctx$3146, this.deferredContext);
                return next$3147;
            }
            return syntaxFromToken$3111(this.token, { context: new Def$3109(defctx$3146, this.context) });
        },
        getDefCtx: function () {
            var ctx$3148 = this.context;
            while (ctx$3148 !== null) {
                if (ctx$3148 instanceof Def$3109) {
                    return ctx$3148.defctx;
                }
                ctx$3148 = ctx$3148.context;
            }
            return null;
        },
        expose: function () {
            assert$3106(this.token.type === parser$3104.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$3149(stxCtx$3150, ctx$3151) {
                if (ctx$3151 == null) {
                    return stxCtx$3150;
                } else if (ctx$3151 instanceof Rename$3107) {
                    return new Rename$3107(ctx$3151.id, ctx$3151.name, applyContext$3149(stxCtx$3150, ctx$3151.context), ctx$3151.def);
                } else if (ctx$3151 instanceof Mark$3108) {
                    return new Mark$3108(ctx$3151.mark, applyContext$3149(stxCtx$3150, ctx$3151.context));
                } else if (ctx$3151 instanceof Def$3109) {
                    return new Def$3109(ctx$3151.defctx, applyContext$3149(stxCtx$3150, ctx$3151.context));
                } else {
                    assert$3106(false, 'unknown context type');
                }
            }
            this.token.inner = _$3102.map(this.token.inner, _$3102.bind(function (stx$3152) {
                if (stx$3152.token.inner) {
                    var next$3153 = syntaxFromToken$3111(stx$3152.token, stx$3152);
                    next$3153.deferredContext = applyContext$3149(stx$3152.deferredContext, this.deferredContext);
                    return next$3153;
                } else {
                    return syntaxFromToken$3111(stx$3152.token, { context: applyContext$3149(stx$3152.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$3154 = this.token.type === parser$3104.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$3154 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$3111(token$3155, oldstx$3156) {
        return new Syntax$3110(token$3155, oldstx$3156);
    }
    function mkSyntax$3112(stx$3157, value$3158, type$3159, inner$3160) {
        if (stx$3157 && Array.isArray(stx$3157) && stx$3157.length === 1) {
            stx$3157 = stx$3157[0];
        } else if (stx$3157 && Array.isArray(stx$3157)) {
            throwSyntaxError$3125('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        }
        if (type$3159 === parser$3104.Token.Delimiter) {
            var startLineNumber$3161, startLineStart$3162, endLineNumber$3163, endLineStart$3164, startRange$3165, endRange$3166;
            if (!Array.isArray(inner$3160)) {
                throwSyntaxError$3125('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$3157 && stx$3157.token.type === parser$3104.Token.Delimiter) {
                startLineNumber$3161 = stx$3157.token.startLineNumber;
                startLineStart$3162 = stx$3157.token.startLineStart;
                endLineNumber$3163 = stx$3157.token.endLineNumber;
                endLineStart$3164 = stx$3157.token.endLineStart;
                startRange$3165 = stx$3157.token.startRange;
                endRange$3166 = stx$3157.token.endRange;
            } else if (stx$3157 && stx$3157.token) {
                startLineNumber$3161 = stx$3157.token.lineNumber;
                startLineStart$3162 = stx$3157.token.lineStart;
                endLineNumber$3163 = stx$3157.token.lineNumber;
                endLineStart$3164 = stx$3157.token.lineStart;
                startRange$3165 = stx$3157.token.range;
                endRange$3166 = stx$3157.token.range;
            }
            return syntaxFromToken$3111({
                type: parser$3104.Token.Delimiter,
                value: value$3158,
                inner: inner$3160,
                startLineStart: startLineStart$3162,
                startLineNumber: startLineNumber$3161,
                endLineStart: endLineStart$3164,
                endLineNumber: endLineNumber$3163,
                startRange: startRange$3165,
                endRange: endRange$3166
            }, stx$3157);
        } else {
            var lineStart$3167, lineNumber$3168, range$3169;
            if (stx$3157 && stx$3157.token.type === parser$3104.Token.Delimiter) {
                lineStart$3167 = stx$3157.token.startLineStart;
                lineNumber$3168 = stx$3157.token.startLineNumber;
                range$3169 = stx$3157.token.startRange;
            } else if (stx$3157 && stx$3157.token) {
                lineStart$3167 = stx$3157.token.lineStart;
                lineNumber$3168 = stx$3157.token.lineNumber;
                range$3169 = stx$3157.token.range;
            }
            return syntaxFromToken$3111({
                type: type$3159,
                value: value$3158,
                lineStart: lineStart$3167,
                lineNumber: lineNumber$3168,
                range: range$3169
            }, stx$3157);
        }
    }
    function makeValue$3113(val$3170, stx$3171) {
        if (typeof val$3170 === 'boolean') {
            return mkSyntax$3112(stx$3171, val$3170 ? 'true' : 'false', parser$3104.Token.BooleanLiteral);
        } else if (typeof val$3170 === 'number') {
            if (val$3170 !== val$3170) {
                return makeDelim$3118('()', [
                    makeValue$3113(0, stx$3171),
                    makePunc$3117('/', stx$3171),
                    makeValue$3113(0, stx$3171)
                ], stx$3171);
            }
            if (val$3170 < 0) {
                return makeDelim$3118('()', [
                    makePunc$3117('-', stx$3171),
                    makeValue$3113(Math.abs(val$3170), stx$3171)
                ], stx$3171);
            } else {
                return mkSyntax$3112(stx$3171, val$3170, parser$3104.Token.NumericLiteral);
            }
        } else if (typeof val$3170 === 'string') {
            return mkSyntax$3112(stx$3171, val$3170, parser$3104.Token.StringLiteral);
        } else if (val$3170 === null) {
            return mkSyntax$3112(stx$3171, 'null', parser$3104.Token.NullLiteral);
        } else {
            throwSyntaxError$3125('makeValue', 'Cannot make value syntax object from: ' + val$3170);
        }
    }
    function makeRegex$3114(val$3172, flags$3173, stx$3174) {
        var newstx$3175 = mkSyntax$3112(stx$3174, new RegExp(val$3172, flags$3173), parser$3104.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$3175.token.literal = val$3172;
        return newstx$3175;
    }
    function makeIdent$3115(val$3176, stx$3177) {
        return mkSyntax$3112(stx$3177, val$3176, parser$3104.Token.Identifier);
    }
    function makeKeyword$3116(val$3178, stx$3179) {
        return mkSyntax$3112(stx$3179, val$3178, parser$3104.Token.Keyword);
    }
    function makePunc$3117(val$3180, stx$3181) {
        return mkSyntax$3112(stx$3181, val$3180, parser$3104.Token.Punctuator);
    }
    function makeDelim$3118(val$3182, inner$3183, stx$3184) {
        return mkSyntax$3112(stx$3184, val$3182, parser$3104.Token.Delimiter, inner$3183);
    }
    function unwrapSyntax$3119(stx$3185) {
        if (Array.isArray(stx$3185) && stx$3185.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$3185 = stx$3185[0];
        }
        if (stx$3185.token) {
            if (stx$3185.token.type === parser$3104.Token.Delimiter) {
                return stx$3185.token;
            } else {
                return stx$3185.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$3185);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$3120(stx$3186) {
        return _$3102.map(stx$3186, function (stx$3187) {
            if (stx$3187.token.inner) {
                stx$3187.token.inner = syntaxToTokens$3120(stx$3187.token.inner);
            }
            return stx$3187.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$3121(tokens$3188) {
        if (!_$3102.isArray(tokens$3188)) {
            tokens$3188 = [tokens$3188];
        }
        return _$3102.map(tokens$3188, function (token$3189) {
            if (token$3189.inner) {
                token$3189.inner = tokensToSyntax$3121(token$3189.inner);
            }
            return syntaxFromToken$3111(token$3189);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$3122(tojoin$3190, punc$3191) {
        if (tojoin$3190.length === 0) {
            return [];
        }
        if (punc$3191 === ' ') {
            return tojoin$3190;
        }
        return _$3102.reduce(_$3102.rest(tojoin$3190, 1), function (acc$3192, join$3193) {
            return acc$3192.concat(makePunc$3117(punc$3191, join$3193), join$3193);
        }, [_$3102.first(tojoin$3190)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$3123(tojoin$3194, punc$3195) {
        if (tojoin$3194.length === 0) {
            return [];
        }
        if (punc$3195 === ' ') {
            return _$3102.flatten(tojoin$3194, true);
        }
        return _$3102.reduce(_$3102.rest(tojoin$3194, 1), function (acc$3196, join$3197) {
            return acc$3196.concat(makePunc$3117(punc$3195, _$3102.first(join$3197)), join$3197);
        }, _$3102.first(tojoin$3194));
    }
    function MacroSyntaxError$3124(name$3198, message$3199, stx$3200) {
        this.name = name$3198;
        this.message = message$3199;
        this.stx = stx$3200;
    }
    function throwSyntaxError$3125(name$3201, message$3202, stx$3203) {
        if (stx$3203 && Array.isArray(stx$3203)) {
            stx$3203 = stx$3203[0];
        }
        throw new MacroSyntaxError$3124(name$3201, message$3202, stx$3203);
    }
    function printSyntaxError$3126(code$3204, err$3205) {
        if (!err$3205.stx) {
            return '[' + err$3205.name + '] ' + err$3205.message;
        }
        var token$3206 = err$3205.stx.token;
        var lineNumber$3207 = token$3206.sm_startLineNumber || token$3206.sm_lineNumber || token$3206.startLineNumber || token$3206.lineNumber;
        var lineStart$3208 = token$3206.sm_startLineStart || token$3206.sm_lineStart || token$3206.startLineStart || token$3206.lineStart;
        var start$3209 = (token$3206.sm_startRange || token$3206.sm_range || token$3206.startRange || token$3206.range)[0];
        var offset$3210 = start$3209 - lineStart$3208;
        var line$3211 = '';
        var pre$3212 = lineNumber$3207 + ': ';
        var ch$3213;
        while (ch$3213 = code$3204.charAt(lineStart$3208++)) {
            if (ch$3213 == '\r' || ch$3213 == '\n') {
                break;
            }
            line$3211 += ch$3213;
        }
        return '[' + err$3205.name + '] ' + err$3205.message + '\n' + pre$3212 + line$3211 + '\n' + Array(offset$3210 + pre$3212.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$3127(stxarr$3214, shouldResolve$3215) {
        var indent$3216 = 0;
        var unparsedLines$3217 = stxarr$3214.reduce(function (acc$3218, stx$3219) {
                var s$3220 = shouldResolve$3215 ? expander$3105.resolve(stx$3219) : stx$3219.token.value;
                // skip the end of file token
                if (stx$3219.token.type === parser$3104.Token.EOF) {
                    return acc$3218;
                }
                if (stx$3219.token.type === parser$3104.Token.StringLiteral) {
                    s$3220 = '"' + s$3220 + '"';
                }
                if (s$3220 == '{') {
                    acc$3218[0].str += ' ' + s$3220;
                    indent$3216++;
                    acc$3218.unshift({
                        indent: indent$3216,
                        str: ''
                    });
                } else if (s$3220 == '}') {
                    indent$3216--;
                    acc$3218.unshift({
                        indent: indent$3216,
                        str: s$3220
                    });
                    acc$3218.unshift({
                        indent: indent$3216,
                        str: ''
                    });
                } else if (s$3220 == ';') {
                    acc$3218[0].str += s$3220;
                    acc$3218.unshift({
                        indent: indent$3216,
                        str: ''
                    });
                } else {
                    acc$3218[0].str += (acc$3218[0].str ? ' ' : '') + s$3220;
                }
                return acc$3218;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$3217.reduce(function (acc$3221, line$3222) {
            var ind$3223 = '';
            while (ind$3223.length < line$3222.indent * 2) {
                ind$3223 += ' ';
            }
            return ind$3223 + line$3222.str + '\n' + acc$3221;
        }, '');
    }
    exports$3101.assert = assert$3106;
    exports$3101.unwrapSyntax = unwrapSyntax$3119;
    exports$3101.makeDelim = makeDelim$3118;
    exports$3101.makePunc = makePunc$3117;
    exports$3101.makeKeyword = makeKeyword$3116;
    exports$3101.makeIdent = makeIdent$3115;
    exports$3101.makeRegex = makeRegex$3114;
    exports$3101.makeValue = makeValue$3113;
    exports$3101.Rename = Rename$3107;
    exports$3101.Mark = Mark$3108;
    exports$3101.Def = Def$3109;
    exports$3101.syntaxFromToken = syntaxFromToken$3111;
    exports$3101.tokensToSyntax = tokensToSyntax$3121;
    exports$3101.syntaxToTokens = syntaxToTokens$3120;
    exports$3101.joinSyntax = joinSyntax$3122;
    exports$3101.joinSyntaxArr = joinSyntaxArr$3123;
    exports$3101.prettyPrint = prettyPrint$3127;
    exports$3101.MacroSyntaxError = MacroSyntaxError$3124;
    exports$3101.throwSyntaxError = throwSyntaxError$3125;
    exports$3101.printSyntaxError = printSyntaxError$3126;
}));
//# sourceMappingURL=syntax.js.map