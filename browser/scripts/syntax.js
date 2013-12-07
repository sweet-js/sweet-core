(function (root$2183, factory$2184) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2184(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2184);
    }
}(this, function (exports$2185, _$2186, es6$2187, parser$2188) {
    // (CSyntax, Str) -> CContext
    function Rename$2189(id$2213, name$2214, ctx$2215, defctx$2216) {
        defctx$2216 = defctx$2216 || null;
        return {
            id: id$2213,
            name: name$2214,
            context: ctx$2215,
            def: defctx$2216
        };
    }
    // (Num) -> CContext
    function Mark$2190(mark$2217, ctx$2218) {
        return {
            mark: mark$2217,
            context: ctx$2218
        };
    }
    function Def$2191(defctx$2219, ctx$2220) {
        return {
            defctx: defctx$2219,
            context: ctx$2220
        };
    }
    function Var$2192(id$2221) {
        return { id: id$2221 };
    }
    function isRename$2193(r$2222) {
        return r$2222 && typeof r$2222.id !== 'undefined' && typeof r$2222.name !== 'undefined';
    }
    ;
    function isMark$2194(m$2223) {
        return m$2223 && typeof m$2223.mark !== 'undefined';
    }
    ;
    function isDef$2195(ctx$2224) {
        return ctx$2224 && typeof ctx$2224.defctx !== 'undefined';
    }
    function Syntax$2196(token$2225, oldstx$2226) {
        this.token = token$2225;
        this.context = oldstx$2226 && oldstx$2226.context ? oldstx$2226.context : null;
        this.deferredContext = oldstx$2226 && oldstx$2226.deferredContext ? oldstx$2226.deferredContext : null;
    }
    Syntax$2196.prototype = {
        mark: function (newMark$2227) {
            if (this.token.inner) {
                var next$2228 = syntaxFromToken$2197(this.token, this);
                next$2228.deferredContext = Mark$2190(newMark$2227, this.deferredContext);
                return next$2228;
            }
            return syntaxFromToken$2197(this.token, { context: Mark$2190(newMark$2227, this.context) });
        },
        rename: function (id$2229, name$2230, defctx$2231) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2232 = syntaxFromToken$2197(this.token, this);
                next$2232.deferredContext = Rename$2189(id$2229, name$2230, this.deferredContext, defctx$2231);
                return next$2232;
            }
            if (this.token.type === parser$2188.Token.Identifier || this.token.type === parser$2188.Token.Keyword || this.token.type === parser$2188.Token.Punctuator) {
                return syntaxFromToken$2197(this.token, { context: Rename$2189(id$2229, name$2230, this.context, defctx$2231) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2233) {
            if (this.token.inner) {
                var next$2234 = syntaxFromToken$2197(this.token, this);
                next$2234.deferredContext = Def$2191(defctx$2233, this.deferredContext);
                return next$2234;
            }
            return syntaxFromToken$2197(this.token, { context: Def$2191(defctx$2233, this.context) });
        },
        getDefCtx: function () {
            var ctx$2235 = this.context;
            while (ctx$2235 !== null) {
                if (isDef$2195(ctx$2235)) {
                    return ctx$2235.defctx;
                }
                ctx$2235 = ctx$2235.context;
            }
            return null;
        },
        expose: function () {
            parser$2188.assert(this.token.type === parser$2188.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2236(stxCtx$2237, ctx$2238) {
                if (ctx$2238 == null) {
                    return stxCtx$2237;
                } else if (isRename$2193(ctx$2238)) {
                    return Rename$2189(ctx$2238.id, ctx$2238.name, applyContext$2236(stxCtx$2237, ctx$2238.context), ctx$2238.def);
                } else if (isMark$2194(ctx$2238)) {
                    return Mark$2190(ctx$2238.mark, applyContext$2236(stxCtx$2237, ctx$2238.context));
                } else if (isDef$2195(ctx$2238)) {
                    return Def$2191(ctx$2238.defctx, applyContext$2236(stxCtx$2237, ctx$2238.context));
                } else {
                    parser$2188.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2186.map(this.token.inner, _$2186.bind(function (stx$2239) {
                if (stx$2239.token.inner) {
                    var next$2240 = syntaxFromToken$2197(stx$2239.token, stx$2239);
                    next$2240.deferredContext = applyContext$2236(stx$2239.deferredContext, this.deferredContext);
                    return next$2240;
                } else {
                    return syntaxFromToken$2197(stx$2239.token, { context: applyContext$2236(stx$2239.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2241 = this.token.type === parser$2188.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2241 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2197(token$2242, oldstx$2243) {
        return new Syntax$2196(token$2242, oldstx$2243);
    }
    function mkSyntax$2198(stx$2244, value$2245, type$2246, inner$2247) {
        if (stx$2244 && Array.isArray(stx$2244) && stx$2244.length === 1) {
            stx$2244 = stx$2244[0];
        } else if (stx$2244 && Array.isArray(stx$2244)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2244);
        }
        if (type$2246 === parser$2188.Token.Delimiter) {
            var startLineNumber$2248, startLineStart$2249, endLineNumber$2250, endLineStart$2251, startRange$2252, endRange$2253;
            if (!Array.isArray(inner$2247)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2244 && stx$2244.token.type === parser$2188.Token.Delimiter) {
                startLineNumber$2248 = stx$2244.token.startLineNumber;
                startLineStart$2249 = stx$2244.token.startLineStart;
                endLineNumber$2250 = stx$2244.token.endLineNumber;
                endLineStart$2251 = stx$2244.token.endLineStart;
                startRange$2252 = stx$2244.token.startRange;
                endRange$2253 = stx$2244.token.endRange;
            } else if (stx$2244 && stx$2244.token) {
                startLineNumber$2248 = stx$2244.token.lineNumber;
                startLineStart$2249 = stx$2244.token.lineStart;
                endLineNumber$2250 = stx$2244.token.lineNumber;
                endLineStart$2251 = stx$2244.token.lineStart;
                startRange$2252 = stx$2244.token.range;
                endRange$2253 = stx$2244.token.range;
            }
            return syntaxFromToken$2197({
                type: parser$2188.Token.Delimiter,
                value: value$2245,
                inner: inner$2247,
                startLineStart: startLineStart$2249,
                startLineNumber: startLineNumber$2248,
                endLineStart: endLineStart$2251,
                endLineNumber: endLineNumber$2250,
                startRange: startRange$2252,
                endRange: endRange$2253
            }, stx$2244);
        } else {
            var lineStart$2254, lineNumber$2255, range$2256;
            if (stx$2244 && stx$2244.token.type === parser$2188.Token.Delimiter) {
                lineStart$2254 = stx$2244.token.startLineStart;
                lineNumber$2255 = stx$2244.token.startLineNumber;
                range$2256 = stx$2244.token.startRange;
            } else if (stx$2244 && stx$2244.token) {
                lineStart$2254 = stx$2244.token.lineStart;
                lineNumber$2255 = stx$2244.token.lineNumber;
                range$2256 = stx$2244.token.range;
            }
            return syntaxFromToken$2197({
                type: type$2246,
                value: value$2245,
                lineStart: lineStart$2254,
                lineNumber: lineNumber$2255,
                range: range$2256
            }, stx$2244);
        }
    }
    function makeValue$2199(val$2257, stx$2258) {
        if (typeof val$2257 === 'boolean') {
            return mkSyntax$2198(stx$2258, val$2257 ? 'true' : 'false', parser$2188.Token.BooleanLiteral);
        } else if (typeof val$2257 === 'number') {
            if (val$2257 !== val$2257) {
                return makeDelim$2204('()', [
                    makeValue$2199(0, stx$2258),
                    makePunc$2203('/', stx$2258),
                    makeValue$2199(0, stx$2258)
                ], stx$2258);
            }
            if (val$2257 < 0) {
                return makeDelim$2204('()', [
                    makePunc$2203('-', stx$2258),
                    makeValue$2199(Math.abs(val$2257), stx$2258)
                ], stx$2258);
            } else {
                return mkSyntax$2198(stx$2258, val$2257, parser$2188.Token.NumericLiteral);
            }
        } else if (typeof val$2257 === 'string') {
            return mkSyntax$2198(stx$2258, val$2257, parser$2188.Token.StringLiteral);
        } else if (val$2257 === null) {
            return mkSyntax$2198(stx$2258, 'null', parser$2188.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2257);
        }
    }
    function makeRegex$2200(val$2259, flags$2260, stx$2261) {
        var newstx$2262 = mkSyntax$2198(stx$2261, new RegExp(val$2259, flags$2260), parser$2188.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2262.token.literal = val$2259;
        return newstx$2262;
    }
    function makeIdent$2201(val$2263, stx$2264) {
        return mkSyntax$2198(stx$2264, val$2263, parser$2188.Token.Identifier);
    }
    function makeKeyword$2202(val$2265, stx$2266) {
        return mkSyntax$2198(stx$2266, val$2265, parser$2188.Token.Keyword);
    }
    function makePunc$2203(val$2267, stx$2268) {
        return mkSyntax$2198(stx$2268, val$2267, parser$2188.Token.Punctuator);
    }
    function makeDelim$2204(val$2269, inner$2270, stx$2271) {
        return mkSyntax$2198(stx$2271, val$2269, parser$2188.Token.Delimiter, inner$2270);
    }
    function unwrapSyntax$2205(stx$2272) {
        if (Array.isArray(stx$2272) && stx$2272.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2272 = stx$2272[0];
        }
        if (stx$2272.token) {
            if (stx$2272.token.type === parser$2188.Token.Delimiter) {
                return stx$2272.token;
            } else {
                return stx$2272.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2272);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2206(stx$2273) {
        return _$2186.map(stx$2273, function (stx$2274) {
            if (stx$2274.token.inner) {
                stx$2274.token.inner = syntaxToTokens$2206(stx$2274.token.inner);
            }
            return stx$2274.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2207(tokens$2275) {
        if (!_$2186.isArray(tokens$2275)) {
            tokens$2275 = [tokens$2275];
        }
        return _$2186.map(tokens$2275, function (token$2276) {
            if (token$2276.inner) {
                token$2276.inner = tokensToSyntax$2207(token$2276.inner);
            }
            return syntaxFromToken$2197(token$2276);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2208(tojoin$2277, punc$2278) {
        if (tojoin$2277.length === 0) {
            return [];
        }
        if (punc$2278 === ' ') {
            return tojoin$2277;
        }
        return _$2186.reduce(_$2186.rest(tojoin$2277, 1), function (acc$2279, join$2280) {
            return acc$2279.concat(makePunc$2203(punc$2278, join$2280), join$2280);
        }, [_$2186.first(tojoin$2277)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2209(tojoin$2281, punc$2282) {
        if (tojoin$2281.length === 0) {
            return [];
        }
        if (punc$2282 === ' ') {
            return _$2186.flatten(tojoin$2281, true);
        }
        return _$2186.reduce(_$2186.rest(tojoin$2281, 1), function (acc$2283, join$2284) {
            return acc$2283.concat(makePunc$2203(punc$2282, _$2186.first(join$2284)), join$2284);
        }, _$2186.first(tojoin$2281));
    }
    function MacroSyntaxError$2210(name$2285, message$2286, stx$2287) {
        this.name = name$2285;
        this.message = message$2286;
        this.stx = stx$2287;
    }
    function throwSyntaxError$2211(name$2288, message$2289, stx$2290) {
        if (stx$2290 && Array.isArray(stx$2290)) {
            stx$2290 = stx$2290[0];
        }
        throw new MacroSyntaxError$2210(name$2288, message$2289, stx$2290);
    }
    function printSyntaxError$2212(code$2291, err$2292) {
        if (!err$2292.stx) {
            return '[' + err$2292.name + '] ' + err$2292.message;
        }
        var token$2293 = err$2292.stx.token;
        var lineNumber$2294 = token$2293.sm_startLineNumber || token$2293.sm_lineNumber || token$2293.startLineNumber || token$2293.lineNumber;
        var lineStart$2295 = token$2293.sm_startLineStart || token$2293.sm_lineStart || token$2293.startLineStart || token$2293.lineStart;
        var start$2296 = (token$2293.sm_startRange || token$2293.sm_range || token$2293.startRange || token$2293.range)[0];
        var offset$2297 = start$2296 - lineStart$2295;
        var line$2298 = '';
        var pre$2299 = lineNumber$2294 + ': ';
        var ch$2300;
        while (ch$2300 = code$2291.charAt(lineStart$2295++)) {
            if (ch$2300 == '\r' || ch$2300 == '\n') {
                break;
            }
            line$2298 += ch$2300;
        }
        return '[' + err$2292.name + '] ' + err$2292.message + '\n' + pre$2299 + line$2298 + '\n' + Array(offset$2297 + pre$2299.length).join(' ') + ' ^';
    }
    exports$2185.unwrapSyntax = unwrapSyntax$2205;
    exports$2185.makeDelim = makeDelim$2204;
    exports$2185.makePunc = makePunc$2203;
    exports$2185.makeKeyword = makeKeyword$2202;
    exports$2185.makeIdent = makeIdent$2201;
    exports$2185.makeRegex = makeRegex$2200;
    exports$2185.makeValue = makeValue$2199;
    exports$2185.Rename = Rename$2189;
    exports$2185.Mark = Mark$2190;
    exports$2185.Var = Var$2192;
    exports$2185.Def = Def$2191;
    exports$2185.isDef = isDef$2195;
    exports$2185.isMark = isMark$2194;
    exports$2185.isRename = isRename$2193;
    exports$2185.syntaxFromToken = syntaxFromToken$2197;
    exports$2185.tokensToSyntax = tokensToSyntax$2207;
    exports$2185.syntaxToTokens = syntaxToTokens$2206;
    exports$2185.joinSyntax = joinSyntax$2208;
    exports$2185.joinSyntaxArr = joinSyntaxArr$2209;
    exports$2185.MacroSyntaxError = MacroSyntaxError$2210;
    exports$2185.throwSyntaxError = throwSyntaxError$2211;
    exports$2185.printSyntaxError = printSyntaxError$2212;
}));
//# sourceMappingURL=syntax.js.map