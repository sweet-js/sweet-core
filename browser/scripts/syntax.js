(function (root$2142, factory$2143) {
    if (typeof exports === 'object') {
        factory$2143(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$2143);
    }
}(this, function (exports$2144, _$2145, es6$2146, parser$2147) {
    function Rename$2148(id$2172, name$2173, ctx$2174, defctx$2175) {
        defctx$2175 = defctx$2175 || null;
        return {
            id: id$2172,
            name: name$2173,
            context: ctx$2174,
            def: defctx$2175
        };
    }
    function Mark$2149(mark$2176, ctx$2177) {
        return {
            mark: mark$2176,
            context: ctx$2177
        };
    }
    function Def$2150(defctx$2178, ctx$2179) {
        return {
            defctx: defctx$2178,
            context: ctx$2179
        };
    }
    function Var$2151(id$2180) {
        return { id: id$2180 };
    }
    function isRename$2152(r$2181) {
        return r$2181 && typeof r$2181.id !== 'undefined' && typeof r$2181.name !== 'undefined';
    }
    ;
    function isMark$2153(m$2182) {
        return m$2182 && typeof m$2182.mark !== 'undefined';
    }
    ;
    function isDef$2154(ctx$2183) {
        return ctx$2183 && typeof ctx$2183.defctx !== 'undefined';
    }
    function Syntax$2155(token$2184, oldstx$2185) {
        this.token = token$2184;
        this.context = oldstx$2185 && oldstx$2185.context ? oldstx$2185.context : null;
        this.deferredContext = oldstx$2185 && oldstx$2185.deferredContext ? oldstx$2185.deferredContext : null;
    }
    Syntax$2155.prototype = {
        mark: function (newMark$2186) {
            if (this.token.inner) {
                var next$2187 = syntaxFromToken$2156(this.token, this);
                next$2187.deferredContext = Mark$2149(newMark$2186, this.deferredContext);
                return next$2187;
            }
            return syntaxFromToken$2156(this.token, { context: Mark$2149(newMark$2186, this.context) });
        },
        rename: function (id$2188, name$2189, defctx$2190) {
            if (this.token.inner) {
                var next$2191 = syntaxFromToken$2156(this.token, this);
                next$2191.deferredContext = Rename$2148(id$2188, name$2189, this.deferredContext, defctx$2190);
                return next$2191;
            }
            if (this.token.type === parser$2147.Token.Identifier || this.token.type === parser$2147.Token.Keyword || this.token.type === parser$2147.Token.Punctuator) {
                return syntaxFromToken$2156(this.token, { context: Rename$2148(id$2188, name$2189, this.context, defctx$2190) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$2192) {
            if (this.token.inner) {
                var next$2193 = syntaxFromToken$2156(this.token, this);
                next$2193.deferredContext = Def$2150(defctx$2192, this.deferredContext);
                return next$2193;
            }
            return syntaxFromToken$2156(this.token, { context: Def$2150(defctx$2192, this.context) });
        },
        getDefCtx: function () {
            var ctx$2194 = this.context;
            while (ctx$2194 !== null) {
                if (isDef$2154(ctx$2194)) {
                    return ctx$2194.defctx;
                }
                ctx$2194 = ctx$2194.context;
            }
            return null;
        },
        expose: function () {
            parser$2147.assert(this.token.type === parser$2147.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$2195(stxCtx$2196, ctx$2197) {
                if (ctx$2197 == null) {
                    return stxCtx$2196;
                } else if (isRename$2152(ctx$2197)) {
                    return Rename$2148(ctx$2197.id, ctx$2197.name, applyContext$2195(stxCtx$2196, ctx$2197.context), ctx$2197.def);
                } else if (isMark$2153(ctx$2197)) {
                    return Mark$2149(ctx$2197.mark, applyContext$2195(stxCtx$2196, ctx$2197.context));
                } else if (isDef$2154(ctx$2197)) {
                    return Def$2150(ctx$2197.defctx, applyContext$2195(stxCtx$2196, ctx$2197.context));
                } else {
                    parser$2147.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$2145.map(this.token.inner, _$2145.bind(function (stx$2198) {
                if (stx$2198.token.inner) {
                    var next$2199 = syntaxFromToken$2156(stx$2198.token, stx$2198);
                    next$2199.deferredContext = applyContext$2195(stx$2198.deferredContext, this.deferredContext);
                    return next$2199;
                } else {
                    return syntaxFromToken$2156(stx$2198.token, { context: applyContext$2195(stx$2198.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2200 = this.token.type === parser$2147.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2200 + ']';
        }
    };
    function syntaxFromToken$2156(token$2201, oldstx$2202) {
        return new Syntax$2155(token$2201, oldstx$2202);
    }
    function mkSyntax$2157(stx$2203, value$2204, type$2205, inner$2206) {
        if (stx$2203 && Array.isArray(stx$2203) && stx$2203.length === 1) {
            stx$2203 = stx$2203[0];
        } else if (stx$2203 && Array.isArray(stx$2203)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$2203);
        }
        if (type$2205 === parser$2147.Token.Delimiter) {
            var startLineNumber$2207, startLineStart$2208, endLineNumber$2209, endLineStart$2210, startRange$2211, endRange$2212;
            if (!Array.isArray(inner$2206)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2203 && stx$2203.token.type === parser$2147.Token.Delimiter) {
                startLineNumber$2207 = stx$2203.token.startLineNumber;
                startLineStart$2208 = stx$2203.token.startLineStart;
                endLineNumber$2209 = stx$2203.token.endLineNumber;
                endLineStart$2210 = stx$2203.token.endLineStart;
                startRange$2211 = stx$2203.token.startRange;
                endRange$2212 = stx$2203.token.endRange;
            } else if (stx$2203 && stx$2203.token) {
                startLineNumber$2207 = stx$2203.token.lineNumber;
                startLineStart$2208 = stx$2203.token.lineStart;
                endLineNumber$2209 = stx$2203.token.lineNumber;
                endLineStart$2210 = stx$2203.token.lineStart;
                startRange$2211 = stx$2203.token.range;
                endRange$2212 = stx$2203.token.range;
            }
            return syntaxFromToken$2156({
                type: parser$2147.Token.Delimiter,
                value: value$2204,
                inner: inner$2206,
                startLineStart: startLineStart$2208,
                startLineNumber: startLineNumber$2207,
                endLineStart: endLineStart$2210,
                endLineNumber: endLineNumber$2209,
                startRange: startRange$2211,
                endRange: endRange$2212
            }, stx$2203);
        } else {
            var lineStart$2213, lineNumber$2214, range$2215;
            if (stx$2203 && stx$2203.token.type === parser$2147.Token.Delimiter) {
                lineStart$2213 = stx$2203.token.startLineStart;
                lineNumber$2214 = stx$2203.token.startLineNumber;
                range$2215 = stx$2203.token.startRange;
            } else if (stx$2203 && stx$2203.token) {
                lineStart$2213 = stx$2203.token.lineStart;
                lineNumber$2214 = stx$2203.token.lineNumber;
                range$2215 = stx$2203.token.range;
            }
            return syntaxFromToken$2156({
                type: type$2205,
                value: value$2204,
                lineStart: lineStart$2213,
                lineNumber: lineNumber$2214,
                range: range$2215
            }, stx$2203);
        }
    }
    function makeValue$2158(val$2216, stx$2217) {
        if (typeof val$2216 === 'boolean') {
            return mkSyntax$2157(stx$2217, val$2216 ? 'true' : 'false', parser$2147.Token.BooleanLiteral);
        } else if (typeof val$2216 === 'number') {
            if (val$2216 !== val$2216) {
                return makeDelim$2163('()', [
                    makeValue$2158(0, stx$2217),
                    makePunc$2162('/', stx$2217),
                    makeValue$2158(0, stx$2217)
                ], stx$2217);
            }
            if (val$2216 < 0) {
                return makeDelim$2163('()', [
                    makePunc$2162('-', stx$2217),
                    makeValue$2158(Math.abs(val$2216), stx$2217)
                ], stx$2217);
            } else {
                return mkSyntax$2157(stx$2217, val$2216, parser$2147.Token.NumericLiteral);
            }
        } else if (typeof val$2216 === 'string') {
            return mkSyntax$2157(stx$2217, val$2216, parser$2147.Token.StringLiteral);
        } else if (val$2216 === null) {
            return mkSyntax$2157(stx$2217, 'null', parser$2147.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$2216);
        }
    }
    function makeRegex$2159(val$2218, flags$2219, stx$2220) {
        var newstx$2221 = mkSyntax$2157(stx$2220, new RegExp(val$2218, flags$2219), parser$2147.Token.RegexLiteral);
        newstx$2221.token.literal = val$2218;
        return newstx$2221;
    }
    function makeIdent$2160(val$2222, stx$2223) {
        return mkSyntax$2157(stx$2223, val$2222, parser$2147.Token.Identifier);
    }
    function makeKeyword$2161(val$2224, stx$2225) {
        return mkSyntax$2157(stx$2225, val$2224, parser$2147.Token.Keyword);
    }
    function makePunc$2162(val$2226, stx$2227) {
        return mkSyntax$2157(stx$2227, val$2226, parser$2147.Token.Punctuator);
    }
    function makeDelim$2163(val$2228, inner$2229, stx$2230) {
        return mkSyntax$2157(stx$2230, val$2228, parser$2147.Token.Delimiter, inner$2229);
    }
    function unwrapSyntax$2164(stx$2231) {
        if (Array.isArray(stx$2231) && stx$2231.length === 1) {
            stx$2231 = stx$2231[0];
        }
        if (stx$2231.token) {
            if (stx$2231.token.type === parser$2147.Token.Delimiter) {
                return stx$2231.token;
            } else {
                return stx$2231.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2231);
        }
    }
    function syntaxToTokens$2165(stx$2232) {
        return _$2145.map(stx$2232, function (stx$2233) {
            if (stx$2233.token.inner) {
                stx$2233.token.inner = syntaxToTokens$2165(stx$2233.token.inner);
            }
            return stx$2233.token;
        });
    }
    function tokensToSyntax$2166(tokens$2234) {
        if (!_$2145.isArray(tokens$2234)) {
            tokens$2234 = [tokens$2234];
        }
        return _$2145.map(tokens$2234, function (token$2235) {
            if (token$2235.inner) {
                token$2235.inner = tokensToSyntax$2166(token$2235.inner);
            }
            return syntaxFromToken$2156(token$2235);
        });
    }
    function joinSyntax$2167(tojoin$2236, punc$2237) {
        if (tojoin$2236.length === 0) {
            return [];
        }
        if (punc$2237 === ' ') {
            return tojoin$2236;
        }
        return _$2145.reduce(_$2145.rest(tojoin$2236, 1), function (acc$2238, join$2239) {
            return acc$2238.concat(makePunc$2162(punc$2237, join$2239), join$2239);
        }, [_$2145.first(tojoin$2236)]);
    }
    function joinSyntaxArr$2168(tojoin$2240, punc$2241) {
        if (tojoin$2240.length === 0) {
            return [];
        }
        if (punc$2241 === ' ') {
            return _$2145.flatten(tojoin$2240, true);
        }
        return _$2145.reduce(_$2145.rest(tojoin$2240, 1), function (acc$2242, join$2243) {
            return acc$2242.concat(makePunc$2162(punc$2241, _$2145.first(join$2243)), join$2243);
        }, _$2145.first(tojoin$2240));
    }
    function MacroSyntaxError$2169(name$2244, message$2245, stx$2246) {
        this.name = name$2244;
        this.message = message$2245;
        this.stx = stx$2246;
    }
    function throwSyntaxError$2170(name$2247, message$2248, stx$2249) {
        if (stx$2249 && Array.isArray(stx$2249)) {
            stx$2249 = stx$2249[0];
        }
        throw new MacroSyntaxError$2169(name$2247, message$2248, stx$2249);
    }
    function printSyntaxError$2171(code$2250, err$2251) {
        if (!err$2251.stx) {
            return '[' + err$2251.name + '] ' + err$2251.message;
        }
        var token$2252 = err$2251.stx.token;
        var lineNumber$2253 = token$2252.sm_startLineNumber || token$2252.sm_lineNumber || token$2252.startLineNumber || token$2252.lineNumber;
        var lineStart$2254 = token$2252.sm_startLineStart || token$2252.sm_lineStart || token$2252.startLineStart || token$2252.lineStart;
        var start$2255 = (token$2252.sm_startRange || token$2252.sm_range || token$2252.startRange || token$2252.range)[0];
        var offset$2256 = start$2255 - lineStart$2254;
        var line$2257 = '';
        var pre$2258 = lineNumber$2253 + ': ';
        var ch$2259;
        while (ch$2259 = code$2250.charAt(lineStart$2254++)) {
            if (ch$2259 == '\r' || ch$2259 == '\n') {
                break;
            }
            line$2257 += ch$2259;
        }
        return '[' + err$2251.name + '] ' + err$2251.message + '\n' + pre$2258 + line$2257 + '\n' + Array(offset$2256 + pre$2258.length).join(' ') + ' ^';
    }
    exports$2144.unwrapSyntax = unwrapSyntax$2164;
    exports$2144.makeDelim = makeDelim$2163;
    exports$2144.makePunc = makePunc$2162;
    exports$2144.makeKeyword = makeKeyword$2161;
    exports$2144.makeIdent = makeIdent$2160;
    exports$2144.makeRegex = makeRegex$2159;
    exports$2144.makeValue = makeValue$2158;
    exports$2144.Rename = Rename$2148;
    exports$2144.Mark = Mark$2149;
    exports$2144.Var = Var$2151;
    exports$2144.Def = Def$2150;
    exports$2144.isDef = isDef$2154;
    exports$2144.isMark = isMark$2153;
    exports$2144.isRename = isRename$2152;
    exports$2144.syntaxFromToken = syntaxFromToken$2156;
    exports$2144.tokensToSyntax = tokensToSyntax$2166;
    exports$2144.syntaxToTokens = syntaxToTokens$2165;
    exports$2144.joinSyntax = joinSyntax$2167;
    exports$2144.joinSyntaxArr = joinSyntaxArr$2168;
    exports$2144.MacroSyntaxError = MacroSyntaxError$2169;
    exports$2144.throwSyntaxError = throwSyntaxError$2170;
    exports$2144.printSyntaxError = printSyntaxError$2171;
}));