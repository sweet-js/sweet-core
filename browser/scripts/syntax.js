(function (root$2150, factory$2151) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2151(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2151);
    }
}(this, function (exports$2152, _$2153, es6$2154, parser$2155) {
    // (CSyntax, Str) -> CContext
    function Rename$2156(id$2180, name$2181, ctx$2182, defctx$2183) {
        defctx$2183 = defctx$2183 || null;
        return {
            id: id$2180,
            name: name$2181,
            context: ctx$2182,
            def: defctx$2183
        };
    }
    // (Num) -> CContext
    function Mark$2157(mark$2184, ctx$2185) {
        return {
            mark: mark$2184,
            context: ctx$2185
        };
    }
    function Def$2158(defctx$2186, ctx$2187) {
        return {
            defctx: defctx$2186,
            context: ctx$2187
        };
    }
    function Var$2159(id$2188) {
        return { id: id$2188 };
    }
    function isRename$2160(r$2189) {
        return r$2189 && typeof r$2189.id !== 'undefined' && typeof r$2189.name !== 'undefined';
    }
    ;
    function isMark$2161(m$2190) {
        return m$2190 && typeof m$2190.mark !== 'undefined';
    }
    ;
    function isDef$2162(ctx$2191) {
        return ctx$2191 && typeof ctx$2191.defctx !== 'undefined';
    }
    function Syntax$2163(token$2192, oldstx$2193) {
        this.token = token$2192;
        this.context = oldstx$2193 && oldstx$2193.context ? oldstx$2193.context : null;
        this.deferredContext = oldstx$2193 && oldstx$2193.deferredContext ? oldstx$2193.deferredContext : null;
    }
    Syntax$2163.prototype = {
        mark: function (newMark$2194) {
            if (this.token.inner) {
                var next$2195 = syntaxFromToken$2164(this.token, this);
                next$2195.deferredContext = Mark$2157(newMark$2194, this.deferredContext);
                return next$2195;
            }
            return syntaxFromToken$2164(this.token, { context: Mark$2157(newMark$2194, this.context) });
        },
        rename: function (id$2196, name$2197, defctx$2198) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2199 = syntaxFromToken$2164(this.token, this);
                next$2199.deferredContext = Rename$2156(id$2196, name$2197, this.deferredContext, defctx$2198);
                return next$2199;
            }
            if (this.token.type === parser$2155.Token.Identifier || this.token.type === parser$2155.Token.Keyword || this.token.type === parser$2155.Token.Punctuator) {
                return syntaxFromToken$2164(this.token, { context: Rename$2156(id$2196, name$2197, this.context, defctx$2198) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2200) {
            if (this.token.inner) {
                var next$2201 = syntaxFromToken$2164(this.token, this);
                next$2201.deferredContext = Def$2158(defctx$2200, this.deferredContext);
                return next$2201;
            }
            return syntaxFromToken$2164(this.token, { context: Def$2158(defctx$2200, this.context) });
        },
        getDefCtx: function () {
            var ctx$2202 = this.context;
            while (ctx$2202 !== null) {
                if (isDef$2162(ctx$2202)) {
                    return ctx$2202.defctx;
                }
                ctx$2202 = ctx$2202.context;
            }
            return null;
        },
        expose: function () {
            parser$2155.assert(this.token.type === parser$2155.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2203(stxCtx$2204, ctx$2205) {
                if (ctx$2205 == null) {
                    return stxCtx$2204;
                } else if (isRename$2160(ctx$2205)) {
                    return Rename$2156(ctx$2205.id, ctx$2205.name, applyContext$2203(stxCtx$2204, ctx$2205.context), ctx$2205.def);
                } else if (isMark$2161(ctx$2205)) {
                    return Mark$2157(ctx$2205.mark, applyContext$2203(stxCtx$2204, ctx$2205.context));
                } else if (isDef$2162(ctx$2205)) {
                    return Def$2158(ctx$2205.defctx, applyContext$2203(stxCtx$2204, ctx$2205.context));
                } else {
                    parser$2155.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2153.map(this.token.inner, _$2153.bind(function (stx$2206) {
                if (stx$2206.token.inner) {
                    var next$2207 = syntaxFromToken$2164(stx$2206.token, stx$2206);
                    next$2207.deferredContext = applyContext$2203(stx$2206.deferredContext, this.deferredContext);
                    return next$2207;
                } else {
                    return syntaxFromToken$2164(stx$2206.token, { context: applyContext$2203(stx$2206.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2208 = this.token.type === parser$2155.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2208 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2164(token$2209, oldstx$2210) {
        return new Syntax$2163(token$2209, oldstx$2210);
    }
    function mkSyntax$2165(stx$2211, value$2212, type$2213, inner$2214) {
        if (stx$2211 && Array.isArray(stx$2211) && stx$2211.length === 1) {
            stx$2211 = stx$2211[0];
        } else if (stx$2211 && Array.isArray(stx$2211)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2211);
        }
        if (type$2213 === parser$2155.Token.Delimiter) {
            var startLineNumber$2215, startLineStart$2216, endLineNumber$2217, endLineStart$2218, startRange$2219, endRange$2220;
            if (!Array.isArray(inner$2214)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2211 && stx$2211.token.type === parser$2155.Token.Delimiter) {
                startLineNumber$2215 = stx$2211.token.startLineNumber;
                startLineStart$2216 = stx$2211.token.startLineStart;
                endLineNumber$2217 = stx$2211.token.endLineNumber;
                endLineStart$2218 = stx$2211.token.endLineStart;
                startRange$2219 = stx$2211.token.startRange;
                endRange$2220 = stx$2211.token.endRange;
            } else if (stx$2211 && stx$2211.token) {
                startLineNumber$2215 = stx$2211.token.lineNumber;
                startLineStart$2216 = stx$2211.token.lineStart;
                endLineNumber$2217 = stx$2211.token.lineNumber;
                endLineStart$2218 = stx$2211.token.lineStart;
                startRange$2219 = stx$2211.token.range;
                endRange$2220 = stx$2211.token.range;
            }
            return syntaxFromToken$2164({
                type: parser$2155.Token.Delimiter,
                value: value$2212,
                inner: inner$2214,
                startLineStart: startLineStart$2216,
                startLineNumber: startLineNumber$2215,
                endLineStart: endLineStart$2218,
                endLineNumber: endLineNumber$2217,
                startRange: startRange$2219,
                endRange: endRange$2220
            }, stx$2211);
        } else {
            var lineStart$2221, lineNumber$2222, range$2223;
            if (stx$2211 && stx$2211.token.type === parser$2155.Token.Delimiter) {
                lineStart$2221 = stx$2211.token.startLineStart;
                lineNumber$2222 = stx$2211.token.startLineNumber;
                range$2223 = stx$2211.token.startRange;
            } else if (stx$2211 && stx$2211.token) {
                lineStart$2221 = stx$2211.token.lineStart;
                lineNumber$2222 = stx$2211.token.lineNumber;
                range$2223 = stx$2211.token.range;
            }
            return syntaxFromToken$2164({
                type: type$2213,
                value: value$2212,
                lineStart: lineStart$2221,
                lineNumber: lineNumber$2222,
                range: range$2223
            }, stx$2211);
        }
    }
    function makeValue$2166(val$2224, stx$2225) {
        if (typeof val$2224 === 'boolean') {
            return mkSyntax$2165(stx$2225, val$2224 ? 'true' : 'false', parser$2155.Token.BooleanLiteral);
        } else if (typeof val$2224 === 'number') {
            if (val$2224 !== val$2224) {
                return makeDelim$2171('()', [
                    makeValue$2166(0, stx$2225),
                    makePunc$2170('/', stx$2225),
                    makeValue$2166(0, stx$2225)
                ], stx$2225);
            }
            if (val$2224 < 0) {
                return makeDelim$2171('()', [
                    makePunc$2170('-', stx$2225),
                    makeValue$2166(Math.abs(val$2224), stx$2225)
                ], stx$2225);
            } else {
                return mkSyntax$2165(stx$2225, val$2224, parser$2155.Token.NumericLiteral);
            }
        } else if (typeof val$2224 === 'string') {
            return mkSyntax$2165(stx$2225, val$2224, parser$2155.Token.StringLiteral);
        } else if (val$2224 === null) {
            return mkSyntax$2165(stx$2225, 'null', parser$2155.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2224);
        }
    }
    function makeRegex$2167(val$2226, flags$2227, stx$2228) {
        var newstx$2229 = mkSyntax$2165(stx$2228, new RegExp(val$2226, flags$2227), parser$2155.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2229.token.literal = val$2226;
        return newstx$2229;
    }
    function makeIdent$2168(val$2230, stx$2231) {
        return mkSyntax$2165(stx$2231, val$2230, parser$2155.Token.Identifier);
    }
    function makeKeyword$2169(val$2232, stx$2233) {
        return mkSyntax$2165(stx$2233, val$2232, parser$2155.Token.Keyword);
    }
    function makePunc$2170(val$2234, stx$2235) {
        return mkSyntax$2165(stx$2235, val$2234, parser$2155.Token.Punctuator);
    }
    function makeDelim$2171(val$2236, inner$2237, stx$2238) {
        return mkSyntax$2165(stx$2238, val$2236, parser$2155.Token.Delimiter, inner$2237);
    }
    function unwrapSyntax$2172(stx$2239) {
        if (Array.isArray(stx$2239) && stx$2239.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2239 = stx$2239[0];
        }
        if (stx$2239.token) {
            if (stx$2239.token.type === parser$2155.Token.Delimiter) {
                return stx$2239.token;
            } else {
                return stx$2239.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2239);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2173(stx$2240) {
        return _$2153.map(stx$2240, function (stx$2241) {
            if (stx$2241.token.inner) {
                stx$2241.token.inner = syntaxToTokens$2173(stx$2241.token.inner);
            }
            return stx$2241.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2174(tokens$2242) {
        if (!_$2153.isArray(tokens$2242)) {
            tokens$2242 = [tokens$2242];
        }
        return _$2153.map(tokens$2242, function (token$2243) {
            if (token$2243.inner) {
                token$2243.inner = tokensToSyntax$2174(token$2243.inner);
            }
            return syntaxFromToken$2164(token$2243);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2175(tojoin$2244, punc$2245) {
        if (tojoin$2244.length === 0) {
            return [];
        }
        if (punc$2245 === ' ') {
            return tojoin$2244;
        }
        return _$2153.reduce(_$2153.rest(tojoin$2244, 1), function (acc$2246, join$2247) {
            return acc$2246.concat(makePunc$2170(punc$2245, join$2247), join$2247);
        }, [_$2153.first(tojoin$2244)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2176(tojoin$2248, punc$2249) {
        if (tojoin$2248.length === 0) {
            return [];
        }
        if (punc$2249 === ' ') {
            return _$2153.flatten(tojoin$2248, true);
        }
        return _$2153.reduce(_$2153.rest(tojoin$2248, 1), function (acc$2250, join$2251) {
            return acc$2250.concat(makePunc$2170(punc$2249, _$2153.first(join$2251)), join$2251);
        }, _$2153.first(tojoin$2248));
    }
    function MacroSyntaxError$2177(name$2252, message$2253, stx$2254) {
        this.name = name$2252;
        this.message = message$2253;
        this.stx = stx$2254;
    }
    function throwSyntaxError$2178(name$2255, message$2256, stx$2257) {
        if (stx$2257 && Array.isArray(stx$2257)) {
            stx$2257 = stx$2257[0];
        }
        throw new MacroSyntaxError$2177(name$2255, message$2256, stx$2257);
    }
    function printSyntaxError$2179(code$2258, err$2259) {
        if (!err$2259.stx) {
            return '[' + err$2259.name + '] ' + err$2259.message;
        }
        var token$2260 = err$2259.stx.token;
        var lineNumber$2261 = token$2260.sm_startLineNumber || token$2260.sm_lineNumber || token$2260.startLineNumber || token$2260.lineNumber;
        var lineStart$2262 = token$2260.sm_startLineStart || token$2260.sm_lineStart || token$2260.startLineStart || token$2260.lineStart;
        var start$2263 = (token$2260.sm_startRange || token$2260.sm_range || token$2260.startRange || token$2260.range)[0];
        var offset$2264 = start$2263 - lineStart$2262;
        var line$2265 = '';
        var pre$2266 = lineNumber$2261 + ': ';
        var ch$2267;
        while (ch$2267 = code$2258.charAt(lineStart$2262++)) {
            if (ch$2267 == '\r' || ch$2267 == '\n') {
                break;
            }
            line$2265 += ch$2267;
        }
        return '[' + err$2259.name + '] ' + err$2259.message + '\n' + pre$2266 + line$2265 + '\n' + Array(offset$2264 + pre$2266.length).join(' ') + ' ^';
    }
    exports$2152.unwrapSyntax = unwrapSyntax$2172;
    exports$2152.makeDelim = makeDelim$2171;
    exports$2152.makePunc = makePunc$2170;
    exports$2152.makeKeyword = makeKeyword$2169;
    exports$2152.makeIdent = makeIdent$2168;
    exports$2152.makeRegex = makeRegex$2167;
    exports$2152.makeValue = makeValue$2166;
    exports$2152.Rename = Rename$2156;
    exports$2152.Mark = Mark$2157;
    exports$2152.Var = Var$2159;
    exports$2152.Def = Def$2158;
    exports$2152.isDef = isDef$2162;
    exports$2152.isMark = isMark$2161;
    exports$2152.isRename = isRename$2160;
    exports$2152.syntaxFromToken = syntaxFromToken$2164;
    exports$2152.tokensToSyntax = tokensToSyntax$2174;
    exports$2152.syntaxToTokens = syntaxToTokens$2173;
    exports$2152.joinSyntax = joinSyntax$2175;
    exports$2152.joinSyntaxArr = joinSyntaxArr$2176;
    exports$2152.MacroSyntaxError = MacroSyntaxError$2177;
    exports$2152.throwSyntaxError = throwSyntaxError$2178;
    exports$2152.printSyntaxError = printSyntaxError$2179;
}));
//# sourceMappingURL=syntax.js.map