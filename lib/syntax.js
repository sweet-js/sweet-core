(function (root$2147, factory$2148) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2148(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2148);
    }
}(this, function (exports$2149, _$2150, es6$2151, parser$2152) {
    // (CSyntax, Str) -> CContext
    function Rename$2153(id$2177, name$2178, ctx$2179, defctx$2180) {
        defctx$2180 = defctx$2180 || null;
        return {
            id: id$2177,
            name: name$2178,
            context: ctx$2179,
            def: defctx$2180
        };
    }
    // (Num) -> CContext
    function Mark$2154(mark$2181, ctx$2182) {
        return {
            mark: mark$2181,
            context: ctx$2182
        };
    }
    function Def$2155(defctx$2183, ctx$2184) {
        return {
            defctx: defctx$2183,
            context: ctx$2184
        };
    }
    function Var$2156(id$2185) {
        return { id: id$2185 };
    }
    function isRename$2157(r$2186) {
        return r$2186 && typeof r$2186.id !== 'undefined' && typeof r$2186.name !== 'undefined';
    }
    ;
    function isMark$2158(m$2187) {
        return m$2187 && typeof m$2187.mark !== 'undefined';
    }
    ;
    function isDef$2159(ctx$2188) {
        return ctx$2188 && typeof ctx$2188.defctx !== 'undefined';
    }
    function Syntax$2160(token$2189, oldstx$2190) {
        this.token = token$2189;
        this.context = oldstx$2190 && oldstx$2190.context ? oldstx$2190.context : null;
        this.deferredContext = oldstx$2190 && oldstx$2190.deferredContext ? oldstx$2190.deferredContext : null;
    }
    Syntax$2160.prototype = {
        mark: function (newMark$2191) {
            if (this.token.inner) {
                var next$2192 = syntaxFromToken$2161(this.token, this);
                next$2192.deferredContext = Mark$2154(newMark$2191, this.deferredContext);
                return next$2192;
            }
            return syntaxFromToken$2161(this.token, { context: Mark$2154(newMark$2191, this.context) });
        },
        rename: function (id$2193, name$2194, defctx$2195) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2196 = syntaxFromToken$2161(this.token, this);
                next$2196.deferredContext = Rename$2153(id$2193, name$2194, this.deferredContext, defctx$2195);
                return next$2196;
            }
            if (this.token.type === parser$2152.Token.Identifier || this.token.type === parser$2152.Token.Keyword || this.token.type === parser$2152.Token.Punctuator) {
                return syntaxFromToken$2161(this.token, { context: Rename$2153(id$2193, name$2194, this.context, defctx$2195) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2197) {
            if (this.token.inner) {
                var next$2198 = syntaxFromToken$2161(this.token, this);
                next$2198.deferredContext = Def$2155(defctx$2197, this.deferredContext);
                return next$2198;
            }
            return syntaxFromToken$2161(this.token, { context: Def$2155(defctx$2197, this.context) });
        },
        getDefCtx: function () {
            var ctx$2199 = this.context;
            while (ctx$2199 !== null) {
                if (isDef$2159(ctx$2199)) {
                    return ctx$2199.defctx;
                }
                ctx$2199 = ctx$2199.context;
            }
            return null;
        },
        expose: function () {
            parser$2152.assert(this.token.type === parser$2152.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2200(stxCtx$2201, ctx$2202) {
                if (ctx$2202 == null) {
                    return stxCtx$2201;
                } else if (isRename$2157(ctx$2202)) {
                    return Rename$2153(ctx$2202.id, ctx$2202.name, applyContext$2200(stxCtx$2201, ctx$2202.context), ctx$2202.def);
                } else if (isMark$2158(ctx$2202)) {
                    return Mark$2154(ctx$2202.mark, applyContext$2200(stxCtx$2201, ctx$2202.context));
                } else if (isDef$2159(ctx$2202)) {
                    return Def$2155(ctx$2202.defctx, applyContext$2200(stxCtx$2201, ctx$2202.context));
                } else {
                    parser$2152.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2150.map(this.token.inner, _$2150.bind(function (stx$2203) {
                if (stx$2203.token.inner) {
                    var next$2204 = syntaxFromToken$2161(stx$2203.token, stx$2203);
                    next$2204.deferredContext = applyContext$2200(stx$2203.deferredContext, this.deferredContext);
                    return next$2204;
                } else {
                    return syntaxFromToken$2161(stx$2203.token, { context: applyContext$2200(stx$2203.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2205 = this.token.type === parser$2152.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2205 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2161(token$2206, oldstx$2207) {
        return new Syntax$2160(token$2206, oldstx$2207);
    }
    function mkSyntax$2162(stx$2208, value$2209, type$2210, inner$2211) {
        if (stx$2208 && Array.isArray(stx$2208) && stx$2208.length === 1) {
            stx$2208 = stx$2208[0];
        } else if (stx$2208 && Array.isArray(stx$2208)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2208);
        }
        if (type$2210 === parser$2152.Token.Delimiter) {
            var startLineNumber$2212, startLineStart$2213, endLineNumber$2214, endLineStart$2215, startRange$2216, endRange$2217;
            if (!Array.isArray(inner$2211)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2208 && stx$2208.token.type === parser$2152.Token.Delimiter) {
                startLineNumber$2212 = stx$2208.token.startLineNumber;
                startLineStart$2213 = stx$2208.token.startLineStart;
                endLineNumber$2214 = stx$2208.token.endLineNumber;
                endLineStart$2215 = stx$2208.token.endLineStart;
                startRange$2216 = stx$2208.token.startRange;
                endRange$2217 = stx$2208.token.endRange;
            } else if (stx$2208 && stx$2208.token) {
                startLineNumber$2212 = stx$2208.token.lineNumber;
                startLineStart$2213 = stx$2208.token.lineStart;
                endLineNumber$2214 = stx$2208.token.lineNumber;
                endLineStart$2215 = stx$2208.token.lineStart;
                startRange$2216 = stx$2208.token.range;
                endRange$2217 = stx$2208.token.range;
            }
            return syntaxFromToken$2161({
                type: parser$2152.Token.Delimiter,
                value: value$2209,
                inner: inner$2211,
                startLineStart: startLineStart$2213,
                startLineNumber: startLineNumber$2212,
                endLineStart: endLineStart$2215,
                endLineNumber: endLineNumber$2214,
                startRange: startRange$2216,
                endRange: endRange$2217
            }, stx$2208);
        } else {
            var lineStart$2218, lineNumber$2219, range$2220;
            if (stx$2208 && stx$2208.token.type === parser$2152.Token.Delimiter) {
                lineStart$2218 = stx$2208.token.startLineStart;
                lineNumber$2219 = stx$2208.token.startLineNumber;
                range$2220 = stx$2208.token.startRange;
            } else if (stx$2208 && stx$2208.token) {
                lineStart$2218 = stx$2208.token.lineStart;
                lineNumber$2219 = stx$2208.token.lineNumber;
                range$2220 = stx$2208.token.range;
            }
            return syntaxFromToken$2161({
                type: type$2210,
                value: value$2209,
                lineStart: lineStart$2218,
                lineNumber: lineNumber$2219,
                range: range$2220
            }, stx$2208);
        }
    }
    function makeValue$2163(val$2221, stx$2222) {
        if (typeof val$2221 === 'boolean') {
            return mkSyntax$2162(stx$2222, val$2221 ? 'true' : 'false', parser$2152.Token.BooleanLiteral);
        } else if (typeof val$2221 === 'number') {
            if (val$2221 !== val$2221) {
                return makeDelim$2168('()', [
                    makeValue$2163(0, stx$2222),
                    makePunc$2167('/', stx$2222),
                    makeValue$2163(0, stx$2222)
                ], stx$2222);
            }
            if (val$2221 < 0) {
                return makeDelim$2168('()', [
                    makePunc$2167('-', stx$2222),
                    makeValue$2163(Math.abs(val$2221), stx$2222)
                ], stx$2222);
            } else {
                return mkSyntax$2162(stx$2222, val$2221, parser$2152.Token.NumericLiteral);
            }
        } else if (typeof val$2221 === 'string') {
            return mkSyntax$2162(stx$2222, val$2221, parser$2152.Token.StringLiteral);
        } else if (val$2221 === null) {
            return mkSyntax$2162(stx$2222, 'null', parser$2152.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2221);
        }
    }
    function makeRegex$2164(val$2223, flags$2224, stx$2225) {
        var newstx$2226 = mkSyntax$2162(stx$2225, new RegExp(val$2223, flags$2224), parser$2152.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2226.token.literal = val$2223;
        return newstx$2226;
    }
    function makeIdent$2165(val$2227, stx$2228) {
        return mkSyntax$2162(stx$2228, val$2227, parser$2152.Token.Identifier);
    }
    function makeKeyword$2166(val$2229, stx$2230) {
        return mkSyntax$2162(stx$2230, val$2229, parser$2152.Token.Keyword);
    }
    function makePunc$2167(val$2231, stx$2232) {
        return mkSyntax$2162(stx$2232, val$2231, parser$2152.Token.Punctuator);
    }
    function makeDelim$2168(val$2233, inner$2234, stx$2235) {
        return mkSyntax$2162(stx$2235, val$2233, parser$2152.Token.Delimiter, inner$2234);
    }
    function unwrapSyntax$2169(stx$2236) {
        if (Array.isArray(stx$2236) && stx$2236.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2236 = stx$2236[0];
        }
        if (stx$2236.token) {
            if (stx$2236.token.type === parser$2152.Token.Delimiter) {
                return stx$2236.token;
            } else {
                return stx$2236.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2236);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2170(stx$2237) {
        return _$2150.map(stx$2237, function (stx$2238) {
            if (stx$2238.token.inner) {
                stx$2238.token.inner = syntaxToTokens$2170(stx$2238.token.inner);
            }
            return stx$2238.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2171(tokens$2239) {
        if (!_$2150.isArray(tokens$2239)) {
            tokens$2239 = [tokens$2239];
        }
        return _$2150.map(tokens$2239, function (token$2240) {
            if (token$2240.inner) {
                token$2240.inner = tokensToSyntax$2171(token$2240.inner);
            }
            return syntaxFromToken$2161(token$2240);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2172(tojoin$2241, punc$2242) {
        if (tojoin$2241.length === 0) {
            return [];
        }
        if (punc$2242 === ' ') {
            return tojoin$2241;
        }
        return _$2150.reduce(_$2150.rest(tojoin$2241, 1), function (acc$2243, join$2244) {
            return acc$2243.concat(makePunc$2167(punc$2242, join$2244), join$2244);
        }, [_$2150.first(tojoin$2241)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2173(tojoin$2245, punc$2246) {
        if (tojoin$2245.length === 0) {
            return [];
        }
        if (punc$2246 === ' ') {
            return _$2150.flatten(tojoin$2245, true);
        }
        return _$2150.reduce(_$2150.rest(tojoin$2245, 1), function (acc$2247, join$2248) {
            return acc$2247.concat(makePunc$2167(punc$2246, _$2150.first(join$2248)), join$2248);
        }, _$2150.first(tojoin$2245));
    }
    function MacroSyntaxError$2174(name$2249, message$2250, stx$2251) {
        this.name = name$2249;
        this.message = message$2250;
        this.stx = stx$2251;
    }
    function throwSyntaxError$2175(name$2252, message$2253, stx$2254) {
        if (stx$2254 && Array.isArray(stx$2254)) {
            stx$2254 = stx$2254[0];
        }
        throw new MacroSyntaxError$2174(name$2252, message$2253, stx$2254);
    }
    function printSyntaxError$2176(code$2255, err$2256) {
        if (!err$2256.stx) {
            return '[' + err$2256.name + '] ' + err$2256.message;
        }
        var token$2257 = err$2256.stx.token;
        var lineNumber$2258 = token$2257.sm_startLineNumber || token$2257.sm_lineNumber || token$2257.startLineNumber || token$2257.lineNumber;
        var lineStart$2259 = token$2257.sm_startLineStart || token$2257.sm_lineStart || token$2257.startLineStart || token$2257.lineStart;
        var start$2260 = (token$2257.sm_startRange || token$2257.sm_range || token$2257.startRange || token$2257.range)[0];
        var offset$2261 = start$2260 - lineStart$2259;
        var line$2262 = '';
        var pre$2263 = lineNumber$2258 + ': ';
        var ch$2264;
        while (ch$2264 = code$2255.charAt(lineStart$2259++)) {
            if (ch$2264 == '\r' || ch$2264 == '\n') {
                break;
            }
            line$2262 += ch$2264;
        }
        return '[' + err$2256.name + '] ' + err$2256.message + '\n' + pre$2263 + line$2262 + '\n' + Array(offset$2261 + pre$2263.length).join(' ') + ' ^';
    }
    exports$2149.unwrapSyntax = unwrapSyntax$2169;
    exports$2149.makeDelim = makeDelim$2168;
    exports$2149.makePunc = makePunc$2167;
    exports$2149.makeKeyword = makeKeyword$2166;
    exports$2149.makeIdent = makeIdent$2165;
    exports$2149.makeRegex = makeRegex$2164;
    exports$2149.makeValue = makeValue$2163;
    exports$2149.Rename = Rename$2153;
    exports$2149.Mark = Mark$2154;
    exports$2149.Var = Var$2156;
    exports$2149.Def = Def$2155;
    exports$2149.isDef = isDef$2159;
    exports$2149.isMark = isMark$2158;
    exports$2149.isRename = isRename$2157;
    exports$2149.syntaxFromToken = syntaxFromToken$2161;
    exports$2149.tokensToSyntax = tokensToSyntax$2171;
    exports$2149.syntaxToTokens = syntaxToTokens$2170;
    exports$2149.joinSyntax = joinSyntax$2172;
    exports$2149.joinSyntaxArr = joinSyntaxArr$2173;
    exports$2149.MacroSyntaxError = MacroSyntaxError$2174;
    exports$2149.throwSyntaxError = throwSyntaxError$2175;
    exports$2149.printSyntaxError = printSyntaxError$2176;
}));