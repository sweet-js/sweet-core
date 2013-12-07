(function (root$2165, factory$2166) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2166(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2166);
    }
}(this, function (exports$2167, _$2168, es6$2169, parser$2170) {
    // (CSyntax, Str) -> CContext
    function Rename$2171(id$2195, name$2196, ctx$2197, defctx$2198) {
        defctx$2198 = defctx$2198 || null;
        return {
            id: id$2195,
            name: name$2196,
            context: ctx$2197,
            def: defctx$2198
        };
    }
    // (Num) -> CContext
    function Mark$2172(mark$2199, ctx$2200) {
        return {
            mark: mark$2199,
            context: ctx$2200
        };
    }
    function Def$2173(defctx$2201, ctx$2202) {
        return {
            defctx: defctx$2201,
            context: ctx$2202
        };
    }
    function Var$2174(id$2203) {
        return { id: id$2203 };
    }
    function isRename$2175(r$2204) {
        return r$2204 && typeof r$2204.id !== 'undefined' && typeof r$2204.name !== 'undefined';
    }
    ;
    function isMark$2176(m$2205) {
        return m$2205 && typeof m$2205.mark !== 'undefined';
    }
    ;
    function isDef$2177(ctx$2206) {
        return ctx$2206 && typeof ctx$2206.defctx !== 'undefined';
    }
    function Syntax$2178(token$2207, oldstx$2208) {
        this.token = token$2207;
        this.context = oldstx$2208 && oldstx$2208.context ? oldstx$2208.context : null;
        this.deferredContext = oldstx$2208 && oldstx$2208.deferredContext ? oldstx$2208.deferredContext : null;
    }
    Syntax$2178.prototype = {
        mark: function (newMark$2209) {
            if (this.token.inner) {
                var next$2210 = syntaxFromToken$2179(this.token, this);
                next$2210.deferredContext = Mark$2172(newMark$2209, this.deferredContext);
                return next$2210;
            }
            return syntaxFromToken$2179(this.token, { context: Mark$2172(newMark$2209, this.context) });
        },
        rename: function (id$2211, name$2212, defctx$2213) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2214 = syntaxFromToken$2179(this.token, this);
                next$2214.deferredContext = Rename$2171(id$2211, name$2212, this.deferredContext, defctx$2213);
                return next$2214;
            }
            if (this.token.type === parser$2170.Token.Identifier || this.token.type === parser$2170.Token.Keyword || this.token.type === parser$2170.Token.Punctuator) {
                return syntaxFromToken$2179(this.token, { context: Rename$2171(id$2211, name$2212, this.context, defctx$2213) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2215) {
            if (this.token.inner) {
                var next$2216 = syntaxFromToken$2179(this.token, this);
                next$2216.deferredContext = Def$2173(defctx$2215, this.deferredContext);
                return next$2216;
            }
            return syntaxFromToken$2179(this.token, { context: Def$2173(defctx$2215, this.context) });
        },
        getDefCtx: function () {
            var ctx$2217 = this.context;
            while (ctx$2217 !== null) {
                if (isDef$2177(ctx$2217)) {
                    return ctx$2217.defctx;
                }
                ctx$2217 = ctx$2217.context;
            }
            return null;
        },
        expose: function () {
            parser$2170.assert(this.token.type === parser$2170.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2218(stxCtx$2219, ctx$2220) {
                if (ctx$2220 == null) {
                    return stxCtx$2219;
                } else if (isRename$2175(ctx$2220)) {
                    return Rename$2171(ctx$2220.id, ctx$2220.name, applyContext$2218(stxCtx$2219, ctx$2220.context), ctx$2220.def);
                } else if (isMark$2176(ctx$2220)) {
                    return Mark$2172(ctx$2220.mark, applyContext$2218(stxCtx$2219, ctx$2220.context));
                } else if (isDef$2177(ctx$2220)) {
                    return Def$2173(ctx$2220.defctx, applyContext$2218(stxCtx$2219, ctx$2220.context));
                } else {
                    parser$2170.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2168.map(this.token.inner, _$2168.bind(function (stx$2221) {
                if (stx$2221.token.inner) {
                    var next$2222 = syntaxFromToken$2179(stx$2221.token, stx$2221);
                    next$2222.deferredContext = applyContext$2218(stx$2221.deferredContext, this.deferredContext);
                    return next$2222;
                } else {
                    return syntaxFromToken$2179(stx$2221.token, { context: applyContext$2218(stx$2221.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2223 = this.token.type === parser$2170.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2223 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2179(token$2224, oldstx$2225) {
        return new Syntax$2178(token$2224, oldstx$2225);
    }
    function mkSyntax$2180(stx$2226, value$2227, type$2228, inner$2229) {
        if (stx$2226 && Array.isArray(stx$2226) && stx$2226.length === 1) {
            stx$2226 = stx$2226[0];
        } else if (stx$2226 && Array.isArray(stx$2226)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2226);
        }
        if (type$2228 === parser$2170.Token.Delimiter) {
            var startLineNumber$2230, startLineStart$2231, endLineNumber$2232, endLineStart$2233, startRange$2234, endRange$2235;
            if (!Array.isArray(inner$2229)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2226 && stx$2226.token.type === parser$2170.Token.Delimiter) {
                startLineNumber$2230 = stx$2226.token.startLineNumber;
                startLineStart$2231 = stx$2226.token.startLineStart;
                endLineNumber$2232 = stx$2226.token.endLineNumber;
                endLineStart$2233 = stx$2226.token.endLineStart;
                startRange$2234 = stx$2226.token.startRange;
                endRange$2235 = stx$2226.token.endRange;
            } else if (stx$2226 && stx$2226.token) {
                startLineNumber$2230 = stx$2226.token.lineNumber;
                startLineStart$2231 = stx$2226.token.lineStart;
                endLineNumber$2232 = stx$2226.token.lineNumber;
                endLineStart$2233 = stx$2226.token.lineStart;
                startRange$2234 = stx$2226.token.range;
                endRange$2235 = stx$2226.token.range;
            }
            return syntaxFromToken$2179({
                type: parser$2170.Token.Delimiter,
                value: value$2227,
                inner: inner$2229,
                startLineStart: startLineStart$2231,
                startLineNumber: startLineNumber$2230,
                endLineStart: endLineStart$2233,
                endLineNumber: endLineNumber$2232,
                startRange: startRange$2234,
                endRange: endRange$2235
            }, stx$2226);
        } else {
            var lineStart$2236, lineNumber$2237, range$2238;
            if (stx$2226 && stx$2226.token.type === parser$2170.Token.Delimiter) {
                lineStart$2236 = stx$2226.token.startLineStart;
                lineNumber$2237 = stx$2226.token.startLineNumber;
                range$2238 = stx$2226.token.startRange;
            } else if (stx$2226 && stx$2226.token) {
                lineStart$2236 = stx$2226.token.lineStart;
                lineNumber$2237 = stx$2226.token.lineNumber;
                range$2238 = stx$2226.token.range;
            }
            return syntaxFromToken$2179({
                type: type$2228,
                value: value$2227,
                lineStart: lineStart$2236,
                lineNumber: lineNumber$2237,
                range: range$2238
            }, stx$2226);
        }
    }
    function makeValue$2181(val$2239, stx$2240) {
        if (typeof val$2239 === 'boolean') {
            return mkSyntax$2180(stx$2240, val$2239 ? 'true' : 'false', parser$2170.Token.BooleanLiteral);
        } else if (typeof val$2239 === 'number') {
            if (val$2239 !== val$2239) {
                return makeDelim$2186('()', [
                    makeValue$2181(0, stx$2240),
                    makePunc$2185('/', stx$2240),
                    makeValue$2181(0, stx$2240)
                ], stx$2240);
            }
            if (val$2239 < 0) {
                return makeDelim$2186('()', [
                    makePunc$2185('-', stx$2240),
                    makeValue$2181(Math.abs(val$2239), stx$2240)
                ], stx$2240);
            } else {
                return mkSyntax$2180(stx$2240, val$2239, parser$2170.Token.NumericLiteral);
            }
        } else if (typeof val$2239 === 'string') {
            return mkSyntax$2180(stx$2240, val$2239, parser$2170.Token.StringLiteral);
        } else if (val$2239 === null) {
            return mkSyntax$2180(stx$2240, 'null', parser$2170.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2239);
        }
    }
    function makeRegex$2182(val$2241, flags$2242, stx$2243) {
        var newstx$2244 = mkSyntax$2180(stx$2243, new RegExp(val$2241, flags$2242), parser$2170.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2244.token.literal = val$2241;
        return newstx$2244;
    }
    function makeIdent$2183(val$2245, stx$2246) {
        return mkSyntax$2180(stx$2246, val$2245, parser$2170.Token.Identifier);
    }
    function makeKeyword$2184(val$2247, stx$2248) {
        return mkSyntax$2180(stx$2248, val$2247, parser$2170.Token.Keyword);
    }
    function makePunc$2185(val$2249, stx$2250) {
        return mkSyntax$2180(stx$2250, val$2249, parser$2170.Token.Punctuator);
    }
    function makeDelim$2186(val$2251, inner$2252, stx$2253) {
        return mkSyntax$2180(stx$2253, val$2251, parser$2170.Token.Delimiter, inner$2252);
    }
    function unwrapSyntax$2187(stx$2254) {
        if (Array.isArray(stx$2254) && stx$2254.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2254 = stx$2254[0];
        }
        if (stx$2254.token) {
            if (stx$2254.token.type === parser$2170.Token.Delimiter) {
                return stx$2254.token;
            } else {
                return stx$2254.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2254);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2188(stx$2255) {
        return _$2168.map(stx$2255, function (stx$2256) {
            if (stx$2256.token.inner) {
                stx$2256.token.inner = syntaxToTokens$2188(stx$2256.token.inner);
            }
            return stx$2256.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2189(tokens$2257) {
        if (!_$2168.isArray(tokens$2257)) {
            tokens$2257 = [tokens$2257];
        }
        return _$2168.map(tokens$2257, function (token$2258) {
            if (token$2258.inner) {
                token$2258.inner = tokensToSyntax$2189(token$2258.inner);
            }
            return syntaxFromToken$2179(token$2258);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2190(tojoin$2259, punc$2260) {
        if (tojoin$2259.length === 0) {
            return [];
        }
        if (punc$2260 === ' ') {
            return tojoin$2259;
        }
        return _$2168.reduce(_$2168.rest(tojoin$2259, 1), function (acc$2261, join$2262) {
            return acc$2261.concat(makePunc$2185(punc$2260, join$2262), join$2262);
        }, [_$2168.first(tojoin$2259)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2191(tojoin$2263, punc$2264) {
        if (tojoin$2263.length === 0) {
            return [];
        }
        if (punc$2264 === ' ') {
            return _$2168.flatten(tojoin$2263, true);
        }
        return _$2168.reduce(_$2168.rest(tojoin$2263, 1), function (acc$2265, join$2266) {
            return acc$2265.concat(makePunc$2185(punc$2264, _$2168.first(join$2266)), join$2266);
        }, _$2168.first(tojoin$2263));
    }
    function MacroSyntaxError$2192(name$2267, message$2268, stx$2269) {
        this.name = name$2267;
        this.message = message$2268;
        this.stx = stx$2269;
    }
    function throwSyntaxError$2193(name$2270, message$2271, stx$2272) {
        if (stx$2272 && Array.isArray(stx$2272)) {
            stx$2272 = stx$2272[0];
        }
        throw new MacroSyntaxError$2192(name$2270, message$2271, stx$2272);
    }
    function printSyntaxError$2194(code$2273, err$2274) {
        if (!err$2274.stx) {
            return '[' + err$2274.name + '] ' + err$2274.message;
        }
        var token$2275 = err$2274.stx.token;
        var lineNumber$2276 = token$2275.sm_startLineNumber || token$2275.sm_lineNumber || token$2275.startLineNumber || token$2275.lineNumber;
        var lineStart$2277 = token$2275.sm_startLineStart || token$2275.sm_lineStart || token$2275.startLineStart || token$2275.lineStart;
        var start$2278 = (token$2275.sm_startRange || token$2275.sm_range || token$2275.startRange || token$2275.range)[0];
        var offset$2279 = start$2278 - lineStart$2277;
        var line$2280 = '';
        var pre$2281 = lineNumber$2276 + ': ';
        var ch$2282;
        while (ch$2282 = code$2273.charAt(lineStart$2277++)) {
            if (ch$2282 == '\r' || ch$2282 == '\n') {
                break;
            }
            line$2280 += ch$2282;
        }
        return '[' + err$2274.name + '] ' + err$2274.message + '\n' + pre$2281 + line$2280 + '\n' + Array(offset$2279 + pre$2281.length).join(' ') + ' ^';
    }
    exports$2167.unwrapSyntax = unwrapSyntax$2187;
    exports$2167.makeDelim = makeDelim$2186;
    exports$2167.makePunc = makePunc$2185;
    exports$2167.makeKeyword = makeKeyword$2184;
    exports$2167.makeIdent = makeIdent$2183;
    exports$2167.makeRegex = makeRegex$2182;
    exports$2167.makeValue = makeValue$2181;
    exports$2167.Rename = Rename$2171;
    exports$2167.Mark = Mark$2172;
    exports$2167.Var = Var$2174;
    exports$2167.Def = Def$2173;
    exports$2167.isDef = isDef$2177;
    exports$2167.isMark = isMark$2176;
    exports$2167.isRename = isRename$2175;
    exports$2167.syntaxFromToken = syntaxFromToken$2179;
    exports$2167.tokensToSyntax = tokensToSyntax$2189;
    exports$2167.syntaxToTokens = syntaxToTokens$2188;
    exports$2167.joinSyntax = joinSyntax$2190;
    exports$2167.joinSyntaxArr = joinSyntaxArr$2191;
    exports$2167.MacroSyntaxError = MacroSyntaxError$2192;
    exports$2167.throwSyntaxError = throwSyntaxError$2193;
    exports$2167.printSyntaxError = printSyntaxError$2194;
}));
//# sourceMappingURL=syntax.js.map