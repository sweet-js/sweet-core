(function (root$2143, factory$2144) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2144(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2144);
    }
}(this, function (exports$2145, _$2146, es6$2147, parser$2148) {
    // (CSyntax, Str) -> CContext
    function Rename$2149(id$2173, name$2174, ctx$2175, defctx$2176) {
        defctx$2176 = defctx$2176 || null;
        return {
            id: id$2173,
            name: name$2174,
            context: ctx$2175,
            def: defctx$2176
        };
    }
    // (Num) -> CContext
    function Mark$2150(mark$2177, ctx$2178) {
        return {
            mark: mark$2177,
            context: ctx$2178
        };
    }
    function Def$2151(defctx$2179, ctx$2180) {
        return {
            defctx: defctx$2179,
            context: ctx$2180
        };
    }
    function Var$2152(id$2181) {
        return { id: id$2181 };
    }
    function isRename$2153(r$2182) {
        return r$2182 && typeof r$2182.id !== 'undefined' && typeof r$2182.name !== 'undefined';
    }
    ;
    function isMark$2154(m$2183) {
        return m$2183 && typeof m$2183.mark !== 'undefined';
    }
    ;
    function isDef$2155(ctx$2184) {
        return ctx$2184 && typeof ctx$2184.defctx !== 'undefined';
    }
    function Syntax$2156(token$2185, oldstx$2186) {
        this.token = token$2185;
        this.context = oldstx$2186 && oldstx$2186.context ? oldstx$2186.context : null;
        this.deferredContext = oldstx$2186 && oldstx$2186.deferredContext ? oldstx$2186.deferredContext : null;
    }
    Syntax$2156.prototype = {
        mark: function (newMark$2187) {
            if (this.token.inner) {
                var next$2188 = syntaxFromToken$2157(this.token, this);
                next$2188.deferredContext = Mark$2150(newMark$2187, this.deferredContext);
                return next$2188;
            }
            return syntaxFromToken$2157(this.token, { context: Mark$2150(newMark$2187, this.context) });
        },
        rename: function (id$2189, name$2190, defctx$2191) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$2192 = syntaxFromToken$2157(this.token, this);
                next$2192.deferredContext = Rename$2149(id$2189, name$2190, this.deferredContext, defctx$2191);
                return next$2192;
            }
            if (this.token.type === parser$2148.Token.Identifier || this.token.type === parser$2148.Token.Keyword || this.token.type === parser$2148.Token.Punctuator) {
                return syntaxFromToken$2157(this.token, { context: Rename$2149(id$2189, name$2190, this.context, defctx$2191) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2193) {
            if (this.token.inner) {
                var next$2194 = syntaxFromToken$2157(this.token, this);
                next$2194.deferredContext = Def$2151(defctx$2193, this.deferredContext);
                return next$2194;
            }
            return syntaxFromToken$2157(this.token, { context: Def$2151(defctx$2193, this.context) });
        },
        getDefCtx: function () {
            var ctx$2195 = this.context;
            while (ctx$2195 !== null) {
                if (isDef$2155(ctx$2195)) {
                    return ctx$2195.defctx;
                }
                ctx$2195 = ctx$2195.context;
            }
            return null;
        },
        expose: function () {
            parser$2148.assert(this.token.type === parser$2148.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2196(stxCtx$2197, ctx$2198) {
                if (ctx$2198 == null) {
                    return stxCtx$2197;
                } else if (isRename$2153(ctx$2198)) {
                    return Rename$2149(ctx$2198.id, ctx$2198.name, applyContext$2196(stxCtx$2197, ctx$2198.context), ctx$2198.def);
                } else if (isMark$2154(ctx$2198)) {
                    return Mark$2150(ctx$2198.mark, applyContext$2196(stxCtx$2197, ctx$2198.context));
                } else if (isDef$2155(ctx$2198)) {
                    return Def$2151(ctx$2198.defctx, applyContext$2196(stxCtx$2197, ctx$2198.context));
                } else {
                    parser$2148.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2146.map(this.token.inner, _$2146.bind(function (stx$2199) {
                if (stx$2199.token.inner) {
                    var next$2200 = syntaxFromToken$2157(stx$2199.token, stx$2199);
                    next$2200.deferredContext = applyContext$2196(stx$2199.deferredContext, this.deferredContext);
                    return next$2200;
                } else {
                    return syntaxFromToken$2157(stx$2199.token, { context: applyContext$2196(stx$2199.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2201 = this.token.type === parser$2148.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2201 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$2157(token$2202, oldstx$2203) {
        return new Syntax$2156(token$2202, oldstx$2203);
    }
    function mkSyntax$2158(stx$2204, value$2205, type$2206, inner$2207) {
        if (stx$2204 && Array.isArray(stx$2204) && stx$2204.length === 1) {
            stx$2204 = stx$2204[0];
        } else if (stx$2204 && Array.isArray(stx$2204)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2204);
        }
        if (type$2206 === parser$2148.Token.Delimiter) {
            var startLineNumber$2208, startLineStart$2209, endLineNumber$2210, endLineStart$2211, startRange$2212, endRange$2213;
            if (!Array.isArray(inner$2207)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2204 && stx$2204.token.type === parser$2148.Token.Delimiter) {
                startLineNumber$2208 = stx$2204.token.startLineNumber;
                startLineStart$2209 = stx$2204.token.startLineStart;
                endLineNumber$2210 = stx$2204.token.endLineNumber;
                endLineStart$2211 = stx$2204.token.endLineStart;
                startRange$2212 = stx$2204.token.startRange;
                endRange$2213 = stx$2204.token.endRange;
            } else if (stx$2204 && stx$2204.token) {
                startLineNumber$2208 = stx$2204.token.lineNumber;
                startLineStart$2209 = stx$2204.token.lineStart;
                endLineNumber$2210 = stx$2204.token.lineNumber;
                endLineStart$2211 = stx$2204.token.lineStart;
                startRange$2212 = stx$2204.token.range;
                endRange$2213 = stx$2204.token.range;
            }
            return syntaxFromToken$2157({
                type: parser$2148.Token.Delimiter,
                value: value$2205,
                inner: inner$2207,
                startLineStart: startLineStart$2209,
                startLineNumber: startLineNumber$2208,
                endLineStart: endLineStart$2211,
                endLineNumber: endLineNumber$2210,
                startRange: startRange$2212,
                endRange: endRange$2213
            }, stx$2204);
        } else {
            var lineStart$2214, lineNumber$2215, range$2216;
            if (stx$2204 && stx$2204.token.type === parser$2148.Token.Delimiter) {
                lineStart$2214 = stx$2204.token.startLineStart;
                lineNumber$2215 = stx$2204.token.startLineNumber;
                range$2216 = stx$2204.token.startRange;
            } else if (stx$2204 && stx$2204.token) {
                lineStart$2214 = stx$2204.token.lineStart;
                lineNumber$2215 = stx$2204.token.lineNumber;
                range$2216 = stx$2204.token.range;
            }
            return syntaxFromToken$2157({
                type: type$2206,
                value: value$2205,
                lineStart: lineStart$2214,
                lineNumber: lineNumber$2215,
                range: range$2216
            }, stx$2204);
        }
    }
    function makeValue$2159(val$2217, stx$2218) {
        if (typeof val$2217 === 'boolean') {
            return mkSyntax$2158(stx$2218, val$2217 ? 'true' : 'false', parser$2148.Token.BooleanLiteral);
        } else if (typeof val$2217 === 'number') {
            if (val$2217 !== val$2217) {
                return makeDelim$2164('()', [
                    makeValue$2159(0, stx$2218),
                    makePunc$2163('/', stx$2218),
                    makeValue$2159(0, stx$2218)
                ], stx$2218);
            }
            if (val$2217 < 0) {
                return makeDelim$2164('()', [
                    makePunc$2163('-', stx$2218),
                    makeValue$2159(Math.abs(val$2217), stx$2218)
                ], stx$2218);
            } else {
                return mkSyntax$2158(stx$2218, val$2217, parser$2148.Token.NumericLiteral);
            }
        } else if (typeof val$2217 === 'string') {
            return mkSyntax$2158(stx$2218, val$2217, parser$2148.Token.StringLiteral);
        } else if (val$2217 === null) {
            return mkSyntax$2158(stx$2218, 'null', parser$2148.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2217);
        }
    }
    function makeRegex$2160(val$2219, flags$2220, stx$2221) {
        var newstx$2222 = mkSyntax$2158(stx$2221, new RegExp(val$2219, flags$2220), parser$2148.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2222.token.literal = val$2219;
        return newstx$2222;
    }
    function makeIdent$2161(val$2223, stx$2224) {
        return mkSyntax$2158(stx$2224, val$2223, parser$2148.Token.Identifier);
    }
    function makeKeyword$2162(val$2225, stx$2226) {
        return mkSyntax$2158(stx$2226, val$2225, parser$2148.Token.Keyword);
    }
    function makePunc$2163(val$2227, stx$2228) {
        return mkSyntax$2158(stx$2228, val$2227, parser$2148.Token.Punctuator);
    }
    function makeDelim$2164(val$2229, inner$2230, stx$2231) {
        return mkSyntax$2158(stx$2231, val$2229, parser$2148.Token.Delimiter, inner$2230);
    }
    function unwrapSyntax$2165(stx$2232) {
        if (Array.isArray(stx$2232) && stx$2232.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2232 = stx$2232[0];
        }
        if (stx$2232.token) {
            if (stx$2232.token.type === parser$2148.Token.Delimiter) {
                return stx$2232.token;
            } else {
                return stx$2232.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2232);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$2166(stx$2233) {
        return _$2146.map(stx$2233, function (stx$2234) {
            if (stx$2234.token.inner) {
                stx$2234.token.inner = syntaxToTokens$2166(stx$2234.token.inner);
            }
            return stx$2234.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$2167(tokens$2235) {
        if (!_$2146.isArray(tokens$2235)) {
            tokens$2235 = [tokens$2235];
        }
        return _$2146.map(tokens$2235, function (token$2236) {
            if (token$2236.inner) {
                token$2236.inner = tokensToSyntax$2167(token$2236.inner);
            }
            return syntaxFromToken$2157(token$2236);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$2168(tojoin$2237, punc$2238) {
        if (tojoin$2237.length === 0) {
            return [];
        }
        if (punc$2238 === ' ') {
            return tojoin$2237;
        }
        return _$2146.reduce(_$2146.rest(tojoin$2237, 1), function (acc$2239, join$2240) {
            return acc$2239.concat(makePunc$2163(punc$2238, join$2240), join$2240);
        }, [_$2146.first(tojoin$2237)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$2169(tojoin$2241, punc$2242) {
        if (tojoin$2241.length === 0) {
            return [];
        }
        if (punc$2242 === ' ') {
            return _$2146.flatten(tojoin$2241, true);
        }
        return _$2146.reduce(_$2146.rest(tojoin$2241, 1), function (acc$2243, join$2244) {
            return acc$2243.concat(makePunc$2163(punc$2242, _$2146.first(join$2244)), join$2244);
        }, _$2146.first(tojoin$2241));
    }
    function MacroSyntaxError$2170(name$2245, message$2246, stx$2247) {
        this.name = name$2245;
        this.message = message$2246;
        this.stx = stx$2247;
    }
    function throwSyntaxError$2171(name$2248, message$2249, stx$2250) {
        if (stx$2250 && Array.isArray(stx$2250)) {
            stx$2250 = stx$2250[0];
        }
        throw new MacroSyntaxError$2170(name$2248, message$2249, stx$2250);
    }
    function printSyntaxError$2172(code$2251, err$2252) {
        if (!err$2252.stx) {
            return '[' + err$2252.name + '] ' + err$2252.message;
        }
        var token$2253 = err$2252.stx.token;
        var lineNumber$2254 = token$2253.sm_startLineNumber || token$2253.sm_lineNumber || token$2253.startLineNumber || token$2253.lineNumber;
        var lineStart$2255 = token$2253.sm_startLineStart || token$2253.sm_lineStart || token$2253.startLineStart || token$2253.lineStart;
        var start$2256 = (token$2253.sm_startRange || token$2253.sm_range || token$2253.startRange || token$2253.range)[0];
        var offset$2257 = start$2256 - lineStart$2255;
        var line$2258 = '';
        var pre$2259 = lineNumber$2254 + ': ';
        var ch$2260;
        while (ch$2260 = code$2251.charAt(lineStart$2255++)) {
            if (ch$2260 == '\r' || ch$2260 == '\n') {
                break;
            }
            line$2258 += ch$2260;
        }
        return '[' + err$2252.name + '] ' + err$2252.message + '\n' + pre$2259 + line$2258 + '\n' + Array(offset$2257 + pre$2259.length).join(' ') + ' ^';
    }
    exports$2145.unwrapSyntax = unwrapSyntax$2165;
    exports$2145.makeDelim = makeDelim$2164;
    exports$2145.makePunc = makePunc$2163;
    exports$2145.makeKeyword = makeKeyword$2162;
    exports$2145.makeIdent = makeIdent$2161;
    exports$2145.makeRegex = makeRegex$2160;
    exports$2145.makeValue = makeValue$2159;
    exports$2145.Rename = Rename$2149;
    exports$2145.Mark = Mark$2150;
    exports$2145.Var = Var$2152;
    exports$2145.Def = Def$2151;
    exports$2145.isDef = isDef$2155;
    exports$2145.isMark = isMark$2154;
    exports$2145.isRename = isRename$2153;
    exports$2145.syntaxFromToken = syntaxFromToken$2157;
    exports$2145.tokensToSyntax = tokensToSyntax$2167;
    exports$2145.syntaxToTokens = syntaxToTokens$2166;
    exports$2145.joinSyntax = joinSyntax$2168;
    exports$2145.joinSyntaxArr = joinSyntaxArr$2169;
    exports$2145.MacroSyntaxError = MacroSyntaxError$2170;
    exports$2145.throwSyntaxError = throwSyntaxError$2171;
    exports$2145.printSyntaxError = printSyntaxError$2172;
}));