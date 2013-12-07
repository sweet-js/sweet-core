(function (root$2152, factory$2153) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2153(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2153);
    }
}(this, function (exports$2154, _$2155, es6$2156, parser$2157) {
    // (CSyntax, Str) -> CContext
    function Rename$2158(id$2182, name$2183, ctx$2184, defctx$2185) {
        defctx$2185 = defctx$2185 || null;
        return {
            id: id$2182,
            name: name$2183,
            context: ctx$2184,
            def: defctx$2185
        };
    }
    // (Num) -> CContext
    function Mark$2159(mark$2186, ctx$2187) {
        return {
            mark: mark$2186,
            context: ctx$2187
        };
    }
    function Def$2160(defctx$2188, ctx$2189) {
        return {
            defctx: defctx$2188,
            context: ctx$2189
        };
    }
    function Var$2161(id$2190) {
        return { id: id$2190 };
    }
    function isRename$2162(r$2191) {
        return r$2191 && typeof r$2191.id !== 'undefined' && typeof r$2191.name !== 'undefined';
    }
    ;
    function isMark$2163(m$2192) {
        return m$2192 && typeof m$2192.mark !== 'undefined';
    }
    ;
    function isDef$2164(ctx$2193) {
        return ctx$2193 && typeof ctx$2193.defctx !== 'undefined';
    }
    function Syntax$2165(token$2194, oldstx$2195) {
        this.token = token$2194;
        this.context = oldstx$2195 && oldstx$2195.context ? oldstx$2195.context : null;
        this.deferredContext = oldstx$2195 && oldstx$2195.deferredContext ? oldstx$2195.deferredContext : null;
    }
    Syntax$2165.prototype = {
        mark: function (newMark$2196) {
            if (this.token.inner) {
                var next$2197 = syntaxFromToken$2166(this.token, this);
                next$2197.deferredContext = Mark$2159(newMark$2196, this.deferredContext);
                return next$2197;
            }
            return syntaxFromToken$2166(this.token, { context: Mark$2159(newMark$2196, this.context) });
        },
        rename: function (id$2198, name$2199, defctx$2200) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2201 = syntaxFromToken$2166(this.token, this);
                next$2201.deferredContext = Rename$2158(id$2198, name$2199, this.deferredContext, defctx$2200);
                return next$2201;
            }
            if (this.token.type === parser$2157.Token.Identifier || this.token.type === parser$2157.Token.Keyword || this.token.type === parser$2157.Token.Punctuator) {
                return syntaxFromToken$2166(this.token, { context: Rename$2158(id$2198, name$2199, this.context, defctx$2200) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2202) {
            if (this.token.inner) {
                var next$2203 = syntaxFromToken$2166(this.token, this);
                next$2203.deferredContext = Def$2160(defctx$2202, this.deferredContext);
                return next$2203;
            }
            return syntaxFromToken$2166(this.token, { context: Def$2160(defctx$2202, this.context) });
        },
        getDefCtx: function () {
            var ctx$2204 = this.context;
            while (ctx$2204 !== null) {
                if (isDef$2164(ctx$2204)) {
                    return ctx$2204.defctx;
                }
                ctx$2204 = ctx$2204.context;
            }
            return null;
        },
        expose: function () {
            parser$2157.assert(this.token.type === parser$2157.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2205(stxCtx$2206, ctx$2207) {
                if (ctx$2207 == null) {
                    return stxCtx$2206;
                } else if (isRename$2162(ctx$2207)) {
                    return Rename$2158(ctx$2207.id, ctx$2207.name, applyContext$2205(stxCtx$2206, ctx$2207.context), ctx$2207.def);
                } else if (isMark$2163(ctx$2207)) {
                    return Mark$2159(ctx$2207.mark, applyContext$2205(stxCtx$2206, ctx$2207.context));
                } else if (isDef$2164(ctx$2207)) {
                    return Def$2160(ctx$2207.defctx, applyContext$2205(stxCtx$2206, ctx$2207.context));
                } else {
                    parser$2157.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2155.map(this.token.inner, _$2155.bind(function (stx$2208) {
                if (stx$2208.token.inner) {
                    var next$2209 = syntaxFromToken$2166(stx$2208.token, stx$2208);
                    next$2209.deferredContext = applyContext$2205(stx$2208.deferredContext, this.deferredContext);
                    return next$2209;
                } else {
                    return syntaxFromToken$2166(stx$2208.token, { context: applyContext$2205(stx$2208.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2210 = this.token.type === parser$2157.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2210 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2166(token$2211, oldstx$2212) {
        return new Syntax$2165(token$2211, oldstx$2212);
    }
    function mkSyntax$2167(stx$2213, value$2214, type$2215, inner$2216) {
        if (stx$2213 && Array.isArray(stx$2213) && stx$2213.length === 1) {
            stx$2213 = stx$2213[0];
        } else if (stx$2213 && Array.isArray(stx$2213)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2213);
        }
        if (type$2215 === parser$2157.Token.Delimiter) {
            var startLineNumber$2217, startLineStart$2218, endLineNumber$2219, endLineStart$2220, startRange$2221, endRange$2222;
            if (!Array.isArray(inner$2216)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2213 && stx$2213.token.type === parser$2157.Token.Delimiter) {
                startLineNumber$2217 = stx$2213.token.startLineNumber;
                startLineStart$2218 = stx$2213.token.startLineStart;
                endLineNumber$2219 = stx$2213.token.endLineNumber;
                endLineStart$2220 = stx$2213.token.endLineStart;
                startRange$2221 = stx$2213.token.startRange;
                endRange$2222 = stx$2213.token.endRange;
            } else if (stx$2213 && stx$2213.token) {
                startLineNumber$2217 = stx$2213.token.lineNumber;
                startLineStart$2218 = stx$2213.token.lineStart;
                endLineNumber$2219 = stx$2213.token.lineNumber;
                endLineStart$2220 = stx$2213.token.lineStart;
                startRange$2221 = stx$2213.token.range;
                endRange$2222 = stx$2213.token.range;
            }
            return syntaxFromToken$2166({
                type: parser$2157.Token.Delimiter,
                value: value$2214,
                inner: inner$2216,
                startLineStart: startLineStart$2218,
                startLineNumber: startLineNumber$2217,
                endLineStart: endLineStart$2220,
                endLineNumber: endLineNumber$2219,
                startRange: startRange$2221,
                endRange: endRange$2222
            }, stx$2213);
        } else {
            var lineStart$2223, lineNumber$2224, range$2225;
            if (stx$2213 && stx$2213.token.type === parser$2157.Token.Delimiter) {
                lineStart$2223 = stx$2213.token.startLineStart;
                lineNumber$2224 = stx$2213.token.startLineNumber;
                range$2225 = stx$2213.token.startRange;
            } else if (stx$2213 && stx$2213.token) {
                lineStart$2223 = stx$2213.token.lineStart;
                lineNumber$2224 = stx$2213.token.lineNumber;
                range$2225 = stx$2213.token.range;
            }
            return syntaxFromToken$2166({
                type: type$2215,
                value: value$2214,
                lineStart: lineStart$2223,
                lineNumber: lineNumber$2224,
                range: range$2225
            }, stx$2213);
        }
    }
    function makeValue$2168(val$2226, stx$2227) {
        if (typeof val$2226 === 'boolean') {
            return mkSyntax$2167(stx$2227, val$2226 ? 'true' : 'false', parser$2157.Token.BooleanLiteral);
        } else if (typeof val$2226 === 'number') {
            if (val$2226 !== val$2226) {
                return makeDelim$2173('()', [
                    makeValue$2168(0, stx$2227),
                    makePunc$2172('/', stx$2227),
                    makeValue$2168(0, stx$2227)
                ], stx$2227);
            }
            if (val$2226 < 0) {
                return makeDelim$2173('()', [
                    makePunc$2172('-', stx$2227),
                    makeValue$2168(Math.abs(val$2226), stx$2227)
                ], stx$2227);
            } else {
                return mkSyntax$2167(stx$2227, val$2226, parser$2157.Token.NumericLiteral);
            }
        } else if (typeof val$2226 === 'string') {
            return mkSyntax$2167(stx$2227, val$2226, parser$2157.Token.StringLiteral);
        } else if (val$2226 === null) {
            return mkSyntax$2167(stx$2227, 'null', parser$2157.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2226);
        }
    }
    function makeRegex$2169(val$2228, flags$2229, stx$2230) {
        var newstx$2231 = mkSyntax$2167(stx$2230, new RegExp(val$2228, flags$2229), parser$2157.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2231.token.literal = val$2228;
        return newstx$2231;
    }
    function makeIdent$2170(val$2232, stx$2233) {
        return mkSyntax$2167(stx$2233, val$2232, parser$2157.Token.Identifier);
    }
    function makeKeyword$2171(val$2234, stx$2235) {
        return mkSyntax$2167(stx$2235, val$2234, parser$2157.Token.Keyword);
    }
    function makePunc$2172(val$2236, stx$2237) {
        return mkSyntax$2167(stx$2237, val$2236, parser$2157.Token.Punctuator);
    }
    function makeDelim$2173(val$2238, inner$2239, stx$2240) {
        return mkSyntax$2167(stx$2240, val$2238, parser$2157.Token.Delimiter, inner$2239);
    }
    function unwrapSyntax$2174(stx$2241) {
        if (Array.isArray(stx$2241) && stx$2241.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2241 = stx$2241[0];
        }
        if (stx$2241.token) {
            if (stx$2241.token.type === parser$2157.Token.Delimiter) {
                return stx$2241.token;
            } else {
                return stx$2241.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2241);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2175(stx$2242) {
        return _$2155.map(stx$2242, function (stx$2243) {
            if (stx$2243.token.inner) {
                stx$2243.token.inner = syntaxToTokens$2175(stx$2243.token.inner);
            }
            return stx$2243.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2176(tokens$2244) {
        if (!_$2155.isArray(tokens$2244)) {
            tokens$2244 = [tokens$2244];
        }
        return _$2155.map(tokens$2244, function (token$2245) {
            if (token$2245.inner) {
                token$2245.inner = tokensToSyntax$2176(token$2245.inner);
            }
            return syntaxFromToken$2166(token$2245);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2177(tojoin$2246, punc$2247) {
        if (tojoin$2246.length === 0) {
            return [];
        }
        if (punc$2247 === ' ') {
            return tojoin$2246;
        }
        return _$2155.reduce(_$2155.rest(tojoin$2246, 1), function (acc$2248, join$2249) {
            return acc$2248.concat(makePunc$2172(punc$2247, join$2249), join$2249);
        }, [_$2155.first(tojoin$2246)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2178(tojoin$2250, punc$2251) {
        if (tojoin$2250.length === 0) {
            return [];
        }
        if (punc$2251 === ' ') {
            return _$2155.flatten(tojoin$2250, true);
        }
        return _$2155.reduce(_$2155.rest(tojoin$2250, 1), function (acc$2252, join$2253) {
            return acc$2252.concat(makePunc$2172(punc$2251, _$2155.first(join$2253)), join$2253);
        }, _$2155.first(tojoin$2250));
    }
    function MacroSyntaxError$2179(name$2254, message$2255, stx$2256) {
        this.name = name$2254;
        this.message = message$2255;
        this.stx = stx$2256;
    }
    function throwSyntaxError$2180(name$2257, message$2258, stx$2259) {
        if (stx$2259 && Array.isArray(stx$2259)) {
            stx$2259 = stx$2259[0];
        }
        throw new MacroSyntaxError$2179(name$2257, message$2258, stx$2259);
    }
    function printSyntaxError$2181(code$2260, err$2261) {
        if (!err$2261.stx) {
            return '[' + err$2261.name + '] ' + err$2261.message;
        }
        var token$2262 = err$2261.stx.token;
        var lineNumber$2263 = token$2262.sm_startLineNumber || token$2262.sm_lineNumber || token$2262.startLineNumber || token$2262.lineNumber;
        var lineStart$2264 = token$2262.sm_startLineStart || token$2262.sm_lineStart || token$2262.startLineStart || token$2262.lineStart;
        var start$2265 = (token$2262.sm_startRange || token$2262.sm_range || token$2262.startRange || token$2262.range)[0];
        var offset$2266 = start$2265 - lineStart$2264;
        var line$2267 = '';
        var pre$2268 = lineNumber$2263 + ': ';
        var ch$2269;
        while (ch$2269 = code$2260.charAt(lineStart$2264++)) {
            if (ch$2269 == '\r' || ch$2269 == '\n') {
                break;
            }
            line$2267 += ch$2269;
        }
        return '[' + err$2261.name + '] ' + err$2261.message + '\n' + pre$2268 + line$2267 + '\n' + Array(offset$2266 + pre$2268.length).join(' ') + ' ^';
    }
    exports$2154.unwrapSyntax = unwrapSyntax$2174;
    exports$2154.makeDelim = makeDelim$2173;
    exports$2154.makePunc = makePunc$2172;
    exports$2154.makeKeyword = makeKeyword$2171;
    exports$2154.makeIdent = makeIdent$2170;
    exports$2154.makeRegex = makeRegex$2169;
    exports$2154.makeValue = makeValue$2168;
    exports$2154.Rename = Rename$2158;
    exports$2154.Mark = Mark$2159;
    exports$2154.Var = Var$2161;
    exports$2154.Def = Def$2160;
    exports$2154.isDef = isDef$2164;
    exports$2154.isMark = isMark$2163;
    exports$2154.isRename = isRename$2162;
    exports$2154.syntaxFromToken = syntaxFromToken$2166;
    exports$2154.tokensToSyntax = tokensToSyntax$2176;
    exports$2154.syntaxToTokens = syntaxToTokens$2175;
    exports$2154.joinSyntax = joinSyntax$2177;
    exports$2154.joinSyntaxArr = joinSyntaxArr$2178;
    exports$2154.MacroSyntaxError = MacroSyntaxError$2179;
    exports$2154.throwSyntaxError = throwSyntaxError$2180;
    exports$2154.printSyntaxError = printSyntaxError$2181;
}));
//# sourceMappingURL=syntax.js.map