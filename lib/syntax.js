(function (root$2160, factory$2161) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2161(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2161);
    }
}(this, function (exports$2162, _$2163, es6$2164, parser$2165) {
    // (CSyntax, Str) -> CContext
    function Rename$2166(id$2190, name$2191, ctx$2192, defctx$2193) {
        defctx$2193 = defctx$2193 || null;
        return {
            id: id$2190,
            name: name$2191,
            context: ctx$2192,
            def: defctx$2193
        };
    }
    // (Num) -> CContext
    function Mark$2167(mark$2194, ctx$2195) {
        return {
            mark: mark$2194,
            context: ctx$2195
        };
    }
    function Def$2168(defctx$2196, ctx$2197) {
        return {
            defctx: defctx$2196,
            context: ctx$2197
        };
    }
    function Var$2169(id$2198) {
        return { id: id$2198 };
    }
    function isRename$2170(r$2199) {
        return r$2199 && typeof r$2199.id !== 'undefined' && typeof r$2199.name !== 'undefined';
    }
    ;
    function isMark$2171(m$2200) {
        return m$2200 && typeof m$2200.mark !== 'undefined';
    }
    ;
    function isDef$2172(ctx$2201) {
        return ctx$2201 && typeof ctx$2201.defctx !== 'undefined';
    }
    function Syntax$2173(token$2202, oldstx$2203) {
        this.token = token$2202;
        this.context = oldstx$2203 && oldstx$2203.context ? oldstx$2203.context : null;
        this.deferredContext = oldstx$2203 && oldstx$2203.deferredContext ? oldstx$2203.deferredContext : null;
    }
    Syntax$2173.prototype = {
        mark: function (newMark$2204) {
            if (this.token.inner) {
                var next$2205 = syntaxFromToken$2174(this.token, this);
                next$2205.deferredContext = Mark$2167(newMark$2204, this.deferredContext);
                return next$2205;
            }
            return syntaxFromToken$2174(this.token, { context: Mark$2167(newMark$2204, this.context) });
        },
        rename: function (id$2206, name$2207, defctx$2208) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2209 = syntaxFromToken$2174(this.token, this);
                next$2209.deferredContext = Rename$2166(id$2206, name$2207, this.deferredContext, defctx$2208);
                return next$2209;
            }
            if (this.token.type === parser$2165.Token.Identifier || this.token.type === parser$2165.Token.Keyword || this.token.type === parser$2165.Token.Punctuator) {
                return syntaxFromToken$2174(this.token, { context: Rename$2166(id$2206, name$2207, this.context, defctx$2208) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2210) {
            if (this.token.inner) {
                var next$2211 = syntaxFromToken$2174(this.token, this);
                next$2211.deferredContext = Def$2168(defctx$2210, this.deferredContext);
                return next$2211;
            }
            return syntaxFromToken$2174(this.token, { context: Def$2168(defctx$2210, this.context) });
        },
        getDefCtx: function () {
            var ctx$2212 = this.context;
            while (ctx$2212 !== null) {
                if (isDef$2172(ctx$2212)) {
                    return ctx$2212.defctx;
                }
                ctx$2212 = ctx$2212.context;
            }
            return null;
        },
        expose: function () {
            parser$2165.assert(this.token.type === parser$2165.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2213(stxCtx$2214, ctx$2215) {
                if (ctx$2215 == null) {
                    return stxCtx$2214;
                } else if (isRename$2170(ctx$2215)) {
                    return Rename$2166(ctx$2215.id, ctx$2215.name, applyContext$2213(stxCtx$2214, ctx$2215.context), ctx$2215.def);
                } else if (isMark$2171(ctx$2215)) {
                    return Mark$2167(ctx$2215.mark, applyContext$2213(stxCtx$2214, ctx$2215.context));
                } else if (isDef$2172(ctx$2215)) {
                    return Def$2168(ctx$2215.defctx, applyContext$2213(stxCtx$2214, ctx$2215.context));
                } else {
                    parser$2165.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2163.map(this.token.inner, _$2163.bind(function (stx$2216) {
                if (stx$2216.token.inner) {
                    var next$2217 = syntaxFromToken$2174(stx$2216.token, stx$2216);
                    next$2217.deferredContext = applyContext$2213(stx$2216.deferredContext, this.deferredContext);
                    return next$2217;
                } else {
                    return syntaxFromToken$2174(stx$2216.token, { context: applyContext$2213(stx$2216.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2218 = this.token.type === parser$2165.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2218 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2174(token$2219, oldstx$2220) {
        return new Syntax$2173(token$2219, oldstx$2220);
    }
    function mkSyntax$2175(stx$2221, value$2222, type$2223, inner$2224) {
        if (stx$2221 && Array.isArray(stx$2221) && stx$2221.length === 1) {
            stx$2221 = stx$2221[0];
        } else if (stx$2221 && Array.isArray(stx$2221)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2221);
        }
        if (type$2223 === parser$2165.Token.Delimiter) {
            var startLineNumber$2225, startLineStart$2226, endLineNumber$2227, endLineStart$2228, startRange$2229, endRange$2230;
            if (!Array.isArray(inner$2224)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2221 && stx$2221.token.type === parser$2165.Token.Delimiter) {
                startLineNumber$2225 = stx$2221.token.startLineNumber;
                startLineStart$2226 = stx$2221.token.startLineStart;
                endLineNumber$2227 = stx$2221.token.endLineNumber;
                endLineStart$2228 = stx$2221.token.endLineStart;
                startRange$2229 = stx$2221.token.startRange;
                endRange$2230 = stx$2221.token.endRange;
            } else if (stx$2221 && stx$2221.token) {
                startLineNumber$2225 = stx$2221.token.lineNumber;
                startLineStart$2226 = stx$2221.token.lineStart;
                endLineNumber$2227 = stx$2221.token.lineNumber;
                endLineStart$2228 = stx$2221.token.lineStart;
                startRange$2229 = stx$2221.token.range;
                endRange$2230 = stx$2221.token.range;
            }
            return syntaxFromToken$2174({
                type: parser$2165.Token.Delimiter,
                value: value$2222,
                inner: inner$2224,
                startLineStart: startLineStart$2226,
                startLineNumber: startLineNumber$2225,
                endLineStart: endLineStart$2228,
                endLineNumber: endLineNumber$2227,
                startRange: startRange$2229,
                endRange: endRange$2230
            }, stx$2221);
        } else {
            var lineStart$2231, lineNumber$2232, range$2233;
            if (stx$2221 && stx$2221.token.type === parser$2165.Token.Delimiter) {
                lineStart$2231 = stx$2221.token.startLineStart;
                lineNumber$2232 = stx$2221.token.startLineNumber;
                range$2233 = stx$2221.token.startRange;
            } else if (stx$2221 && stx$2221.token) {
                lineStart$2231 = stx$2221.token.lineStart;
                lineNumber$2232 = stx$2221.token.lineNumber;
                range$2233 = stx$2221.token.range;
            }
            return syntaxFromToken$2174({
                type: type$2223,
                value: value$2222,
                lineStart: lineStart$2231,
                lineNumber: lineNumber$2232,
                range: range$2233
            }, stx$2221);
        }
    }
    function makeValue$2176(val$2234, stx$2235) {
        if (typeof val$2234 === 'boolean') {
            return mkSyntax$2175(stx$2235, val$2234 ? 'true' : 'false', parser$2165.Token.BooleanLiteral);
        } else if (typeof val$2234 === 'number') {
            if (val$2234 !== val$2234) {
                return makeDelim$2181('()', [
                    makeValue$2176(0, stx$2235),
                    makePunc$2180('/', stx$2235),
                    makeValue$2176(0, stx$2235)
                ], stx$2235);
            }
            if (val$2234 < 0) {
                return makeDelim$2181('()', [
                    makePunc$2180('-', stx$2235),
                    makeValue$2176(Math.abs(val$2234), stx$2235)
                ], stx$2235);
            } else {
                return mkSyntax$2175(stx$2235, val$2234, parser$2165.Token.NumericLiteral);
            }
        } else if (typeof val$2234 === 'string') {
            return mkSyntax$2175(stx$2235, val$2234, parser$2165.Token.StringLiteral);
        } else if (val$2234 === null) {
            return mkSyntax$2175(stx$2235, 'null', parser$2165.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2234);
        }
    }
    function makeRegex$2177(val$2236, flags$2237, stx$2238) {
        var newstx$2239 = mkSyntax$2175(stx$2238, new RegExp(val$2236, flags$2237), parser$2165.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2239.token.literal = val$2236;
        return newstx$2239;
    }
    function makeIdent$2178(val$2240, stx$2241) {
        return mkSyntax$2175(stx$2241, val$2240, parser$2165.Token.Identifier);
    }
    function makeKeyword$2179(val$2242, stx$2243) {
        return mkSyntax$2175(stx$2243, val$2242, parser$2165.Token.Keyword);
    }
    function makePunc$2180(val$2244, stx$2245) {
        return mkSyntax$2175(stx$2245, val$2244, parser$2165.Token.Punctuator);
    }
    function makeDelim$2181(val$2246, inner$2247, stx$2248) {
        return mkSyntax$2175(stx$2248, val$2246, parser$2165.Token.Delimiter, inner$2247);
    }
    function unwrapSyntax$2182(stx$2249) {
        if (Array.isArray(stx$2249) && stx$2249.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2249 = stx$2249[0];
        }
        if (stx$2249.token) {
            if (stx$2249.token.type === parser$2165.Token.Delimiter) {
                return stx$2249.token;
            } else {
                return stx$2249.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2249);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2183(stx$2250) {
        return _$2163.map(stx$2250, function (stx$2251) {
            if (stx$2251.token.inner) {
                stx$2251.token.inner = syntaxToTokens$2183(stx$2251.token.inner);
            }
            return stx$2251.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2184(tokens$2252) {
        if (!_$2163.isArray(tokens$2252)) {
            tokens$2252 = [tokens$2252];
        }
        return _$2163.map(tokens$2252, function (token$2253) {
            if (token$2253.inner) {
                token$2253.inner = tokensToSyntax$2184(token$2253.inner);
            }
            return syntaxFromToken$2174(token$2253);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2185(tojoin$2254, punc$2255) {
        if (tojoin$2254.length === 0) {
            return [];
        }
        if (punc$2255 === ' ') {
            return tojoin$2254;
        }
        return _$2163.reduce(_$2163.rest(tojoin$2254, 1), function (acc$2256, join$2257) {
            return acc$2256.concat(makePunc$2180(punc$2255, join$2257), join$2257);
        }, [_$2163.first(tojoin$2254)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2186(tojoin$2258, punc$2259) {
        if (tojoin$2258.length === 0) {
            return [];
        }
        if (punc$2259 === ' ') {
            return _$2163.flatten(tojoin$2258, true);
        }
        return _$2163.reduce(_$2163.rest(tojoin$2258, 1), function (acc$2260, join$2261) {
            return acc$2260.concat(makePunc$2180(punc$2259, _$2163.first(join$2261)), join$2261);
        }, _$2163.first(tojoin$2258));
    }
    function MacroSyntaxError$2187(name$2262, message$2263, stx$2264) {
        this.name = name$2262;
        this.message = message$2263;
        this.stx = stx$2264;
    }
    function throwSyntaxError$2188(name$2265, message$2266, stx$2267) {
        if (stx$2267 && Array.isArray(stx$2267)) {
            stx$2267 = stx$2267[0];
        }
        throw new MacroSyntaxError$2187(name$2265, message$2266, stx$2267);
    }
    function printSyntaxError$2189(code$2268, err$2269) {
        if (!err$2269.stx) {
            return '[' + err$2269.name + '] ' + err$2269.message;
        }
        var token$2270 = err$2269.stx.token;
        var lineNumber$2271 = token$2270.startLineNumber || token$2270.lineNumber;
        var lineStart$2272 = token$2270.startLineStart || token$2270.lineStart;
        var start$2273 = token$2270.range[0];
        var offset$2274 = start$2273 - lineStart$2272;
        var line$2275 = '';
        var pre$2276 = lineNumber$2271 + ': ';
        var ch$2277;
        while (ch$2277 = code$2268.charAt(lineStart$2272++)) {
            if (ch$2277 == '\r' || ch$2277 == '\n') {
                break;
            }
            line$2275 += ch$2277;
        }
        return '[' + err$2269.name + '] ' + err$2269.message + '\n' + pre$2276 + line$2275 + '\n' + Array(offset$2274 + pre$2276.length).join(' ') + ' ^';
    }
    exports$2162.unwrapSyntax = unwrapSyntax$2182;
    exports$2162.makeDelim = makeDelim$2181;
    exports$2162.makePunc = makePunc$2180;
    exports$2162.makeKeyword = makeKeyword$2179;
    exports$2162.makeIdent = makeIdent$2178;
    exports$2162.makeRegex = makeRegex$2177;
    exports$2162.makeValue = makeValue$2176;
    exports$2162.Rename = Rename$2166;
    exports$2162.Mark = Mark$2167;
    exports$2162.Var = Var$2169;
    exports$2162.Def = Def$2168;
    exports$2162.isDef = isDef$2172;
    exports$2162.isMark = isMark$2171;
    exports$2162.isRename = isRename$2170;
    exports$2162.syntaxFromToken = syntaxFromToken$2174;
    exports$2162.tokensToSyntax = tokensToSyntax$2184;
    exports$2162.syntaxToTokens = syntaxToTokens$2183;
    exports$2162.joinSyntax = joinSyntax$2185;
    exports$2162.joinSyntaxArr = joinSyntaxArr$2186;
    exports$2162.MacroSyntaxError = MacroSyntaxError$2187;
    exports$2162.throwSyntaxError = throwSyntaxError$2188;
    exports$2162.printSyntaxError = printSyntaxError$2189;
}));