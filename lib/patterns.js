(function (root$2138, factory$2139) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2139(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$2139);
    }
}(this, function (exports$2140, _$2141, parser$2142, expander$2143, syntax$2144) {
    var get_expression$2145 = expander$2143.get_expression;
    var syntaxFromToken$2146 = syntax$2144.syntaxFromToken;
    var makePunc$2147 = syntax$2144.makePunc;
    var joinSyntax$2148 = syntax$2144.joinSyntax;
    var joinSyntaxArr$2149 = syntax$2144.joinSyntaxArr;
    var assert$2150 = syntax$2144.assert;
    var throwSyntaxError$2151 = syntax$2144.throwSyntaxError;
    var push$2152 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2153(pattern$2171) {
        var fv$2172 = [];
        _$2141.each(pattern$2171, function (pat$2173) {
            if (isPatternVar$2157(pat$2173)) {
                fv$2172.push(pat$2173.token.value);
            } else if (pat$2173.token.type === parser$2142.Token.Delimiter) {
                push$2152.apply(fv$2172, freeVarsInPattern$2153(pat$2173.token.inner));
            }
        });
        return fv$2172;
    }
    function typeIsLiteral$2154(type$2174) {
        return type$2174 === parser$2142.Token.NullLiteral || type$2174 === parser$2142.Token.NumericLiteral || type$2174 === parser$2142.Token.StringLiteral || type$2174 === parser$2142.Token.RegexLiteral || type$2174 === parser$2142.Token.BooleanLiteral;
    }
    function containsPatternVar$2155(patterns$2175) {
        return _$2141.any(patterns$2175, function (pat$2176) {
            if (pat$2176.token.type === parser$2142.Token.Delimiter) {
                return containsPatternVar$2155(pat$2176.token.inner);
            }
            return isPatternVar$2157(pat$2176);
        });
    }
    function delimIsSeparator$2156(delim$2177) {
        return delim$2177 && delim$2177.token && delim$2177.token.type === parser$2142.Token.Delimiter && delim$2177.token.value === '()' && delim$2177.token.inner.length === 1 && delim$2177.token.inner[0].token.type !== parser$2142.Token.Delimiter && !containsPatternVar$2155(delim$2177.token.inner);
    }
    function isPatternVar$2157(stx$2178) {
        return stx$2178.token.value[0] === '$' && stx$2178.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2158(tojoin$2179, punc$2180) {
        return _$2141.reduce(_$2141.rest(tojoin$2179, 1), function (acc$2181, join$2182) {
            if (punc$2180 === ' ') {
                return acc$2181.concat(join$2182.match);
            }
            return acc$2181.concat(makePunc$2147(punc$2180, _$2141.first(join$2182.match)), join$2182.match);
        }, _$2141.first(tojoin$2179).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2159(from$2183, to$2184) {
        return _$2141.map(to$2184, function (stx$2185) {
            return takeLine$2160(from$2183, stx$2185);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2160(from$2186, to$2187) {
        var next$2188;
        if (to$2187.token.type === parser$2142.Token.Delimiter) {
            var sm_startLineNumber$2189 = typeof to$2187.token.sm_startLineNumber !== 'undefined' ? to$2187.token.sm_startLineNumber : to$2187.token.startLineNumber;
            var sm_endLineNumber$2190 = typeof to$2187.token.sm_endLineNumber !== 'undefined' ? to$2187.token.sm_endLineNumber : to$2187.token.endLineNumber;
            var sm_startLineStart$2191 = typeof to$2187.token.sm_startLineStart !== 'undefined' ? to$2187.token.sm_startLineStart : to$2187.token.startLineStart;
            var sm_endLineStart$2192 = typeof to$2187.token.sm_endLineStart !== 'undefined' ? to$2187.token.sm_endLineStart : to$2187.token.endLineStart;
            var sm_startRange$2193 = typeof to$2187.token.sm_startRange !== 'undefined' ? to$2187.token.sm_startRange : to$2187.token.startRange;
            var sm_endRange$2194 = typeof to$2187.token.sm_endRange !== 'undefined' ? to$2187.token.sm_endRange : to$2187.token.endRange;
            if (from$2186.token.type === parser$2142.Token.Delimiter) {
                next$2188 = syntaxFromToken$2146({
                    type: parser$2142.Token.Delimiter,
                    value: to$2187.token.value,
                    inner: takeLineContext$2159(from$2186, to$2187.token.inner),
                    startRange: from$2186.token.startRange,
                    endRange: from$2186.token.endRange,
                    startLineNumber: from$2186.token.startLineNumber,
                    startLineStart: from$2186.token.startLineStart,
                    endLineNumber: from$2186.token.endLineNumber,
                    endLineStart: from$2186.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$2189,
                    sm_endLineNumber: sm_endLineNumber$2190,
                    sm_startLineStart: sm_startLineStart$2191,
                    sm_endLineStart: sm_endLineStart$2192,
                    sm_startRange: sm_startRange$2193,
                    sm_endRange: sm_endRange$2194
                }, to$2187);
            } else {
                next$2188 = syntaxFromToken$2146({
                    type: parser$2142.Token.Delimiter,
                    value: to$2187.token.value,
                    inner: takeLineContext$2159(from$2186, to$2187.token.inner),
                    startRange: from$2186.token.range,
                    endRange: from$2186.token.range,
                    startLineNumber: from$2186.token.lineNumber,
                    startLineStart: from$2186.token.lineStart,
                    endLineNumber: from$2186.token.lineNumber,
                    endLineStart: from$2186.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$2189,
                    sm_endLineNumber: sm_endLineNumber$2190,
                    sm_startLineStart: sm_startLineStart$2191,
                    sm_endLineStart: sm_endLineStart$2192,
                    sm_startRange: sm_startRange$2193,
                    sm_endRange: sm_endRange$2194
                }, to$2187);
            }
        } else {
            var sm_lineNumber$2195 = typeof to$2187.token.sm_lineNumber !== 'undefined' ? to$2187.token.sm_lineNumber : to$2187.token.lineNumber;
            var sm_lineStart$2196 = typeof to$2187.token.sm_lineStart !== 'undefined' ? to$2187.token.sm_lineStart : to$2187.token.lineStart;
            var sm_range$2197 = typeof to$2187.token.sm_range !== 'undefined' ? to$2187.token.sm_range : to$2187.token.range;
            if (from$2186.token.type === parser$2142.Token.Delimiter) {
                next$2188 = syntaxFromToken$2146({
                    value: to$2187.token.value,
                    type: to$2187.token.type,
                    lineNumber: from$2186.token.startLineNumber,
                    lineStart: from$2186.token.startLineStart,
                    range: from$2186.token.startRange,
                    sm_lineNumber: sm_lineNumber$2195,
                    sm_lineStart: sm_lineStart$2196,
                    sm_range: sm_range$2197
                }, to$2187);
            } else {
                next$2188 = syntaxFromToken$2146({
                    value: to$2187.token.value,
                    type: to$2187.token.type,
                    lineNumber: from$2186.token.lineNumber,
                    lineStart: from$2186.token.lineStart,
                    range: from$2186.token.range,
                    sm_lineNumber: sm_lineNumber$2195,
                    sm_lineStart: sm_lineStart$2196,
                    sm_range: sm_range$2197
                }, to$2187);
            }
        }
        if (to$2187.token.leadingComments) {
            next$2188.token.leadingComments = to$2187.token.leadingComments;
        }
        if (to$2187.token.trailingComments) {
            next$2188.token.trailingComments = to$2187.token.trailingComments;
        }
        return next$2188;
    }
    function reversePattern$2161(patterns$2198) {
        var len$2199 = patterns$2198.length;
        var pat$2200;
        return _$2141.reduceRight(patterns$2198, function (acc$2201, pat$2200) {
            if (pat$2200.class === 'pattern_group') {
                pat$2200.token.inner = reversePattern$2161(pat$2200.token.inner);
            }
            if (pat$2200.repeat) {
                pat$2200.leading = !pat$2200.leading;
            }
            acc$2201.push(pat$2200);
            return acc$2201;
        }, []);
    }
    function loadLiteralGroup$2162(patterns$2203) {
        _$2141.forEach(patterns$2203, function (patStx$2204) {
            if (patStx$2204.token.type === parser$2142.Token.Delimiter) {
                patStx$2204.token.inner = loadLiteralGroup$2162(patStx$2204.token.inner);
            } else {
                patStx$2204.class = 'pattern_literal';
            }
        });
        return patterns$2203;
    }
    function loadPattern$2163(patterns$2205, reverse$2206) {
        var patts$2207 = _$2141.chain(patterns$2205).reduce(function (acc$2208, patStx$2209, idx$2210) {
                var last$2211 = patterns$2205[idx$2210 - 1];
                var lastLast$2212 = patterns$2205[idx$2210 - 2];
                var next$2213 = patterns$2205[idx$2210 + 1];
                var nextNext$2214 = patterns$2205[idx$2210 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2209.token.value === ':') {
                    if (last$2211 && isPatternVar$2157(last$2211) && !isPatternVar$2157(next$2213)) {
                        return acc$2208;
                    }
                }
                if (last$2211 && last$2211.token.value === ':') {
                    if (lastLast$2212 && isPatternVar$2157(lastLast$2212) && !isPatternVar$2157(patStx$2209)) {
                        return acc$2208;
                    }
                }
                // skip over $
                if (patStx$2209.token.value === '$' && next$2213 && next$2213.token.type === parser$2142.Token.Delimiter) {
                    return acc$2208;
                }
                if (isPatternVar$2157(patStx$2209)) {
                    if (next$2213 && next$2213.token.value === ':' && !isPatternVar$2157(nextNext$2214)) {
                        if (typeof nextNext$2214 === 'undefined') {
                            throwSyntaxError$2151('patterns', 'expecting a pattern class following a `:`', next$2213);
                        }
                        patStx$2209.class = nextNext$2214.token.value;
                    } else {
                        patStx$2209.class = 'token';
                    }
                } else if (patStx$2209.token.type === parser$2142.Token.Delimiter) {
                    if (last$2211 && last$2211.token.value === '$') {
                        patStx$2209.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2209.class === 'pattern_group' && patStx$2209.token.value === '[]') {
                        patStx$2209.token.inner = loadLiteralGroup$2162(patStx$2209.token.inner);
                    } else {
                        patStx$2209.token.inner = loadPattern$2163(patStx$2209.token.inner);
                    }
                } else {
                    patStx$2209.class = 'pattern_literal';
                }
                acc$2208.push(patStx$2209);
                return acc$2208;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2215, patStx$2216, idx$2217, patterns$2218) {
                var separator$2219 = patStx$2216.separator || ' ';
                var repeat$2220 = patStx$2216.repeat || false;
                var next$2221 = patterns$2218[idx$2217 + 1];
                var nextNext$2222 = patterns$2218[idx$2217 + 2];
                if (next$2221 && next$2221.token.value === '...') {
                    repeat$2220 = true;
                    separator$2219 = ' ';
                } else if (delimIsSeparator$2156(next$2221) && nextNext$2222 && nextNext$2222.token.value === '...') {
                    repeat$2220 = true;
                    assert$2150(next$2221.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2219 = next$2221.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2216.token.value === '...' || delimIsSeparator$2156(patStx$2216) && next$2221 && next$2221.token.value === '...') {
                    return acc$2215;
                }
                patStx$2216.repeat = repeat$2220;
                patStx$2216.separator = separator$2219;
                acc$2215.push(patStx$2216);
                return acc$2215;
            }, []).value();
        return reverse$2206 ? reversePattern$2161(patts$2207) : patts$2207;
    }
    function cachedTermMatch$2164(stx$2223, term$2224) {
        var res$2225 = [];
        var i$2226 = 0;
        while (stx$2223[i$2226] && stx$2223[i$2226].term === term$2224) {
            res$2225.unshift(stx$2223[i$2226]);
            i$2226++;
        }
        return {
            result: term$2224,
            destructed: res$2225,
            rest: stx$2223.slice(res$2225.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2165(patternClass$2227, stx$2228, env$2229) {
        var result$2230, rest$2231, match$2232;
        // pattern has no parse class
        if (patternClass$2227 === 'token' && stx$2228[0] && stx$2228[0].token.type !== parser$2142.Token.EOF) {
            result$2230 = [stx$2228[0]];
            rest$2231 = stx$2228.slice(1);
        } else if (patternClass$2227 === 'lit' && stx$2228[0] && typeIsLiteral$2154(stx$2228[0].token.type)) {
            result$2230 = [stx$2228[0]];
            rest$2231 = stx$2228.slice(1);
        } else if (patternClass$2227 === 'ident' && stx$2228[0] && stx$2228[0].token.type === parser$2142.Token.Identifier) {
            result$2230 = [stx$2228[0]];
            rest$2231 = stx$2228.slice(1);
        } else if (stx$2228.length > 0 && patternClass$2227 === 'VariableStatement') {
            match$2232 = stx$2228[0].term ? cachedTermMatch$2164(stx$2228, stx$2228[0].term) : expander$2143.enforest(stx$2228, expander$2143.makeExpanderContext({ env: env$2229 }));
            if (match$2232.result && match$2232.result.hasPrototype(expander$2143.VariableStatement)) {
                result$2230 = match$2232.destructed || match$2232.result.destruct(false);
                rest$2231 = match$2232.rest;
            } else {
                result$2230 = null;
                rest$2231 = stx$2228;
            }
        } else if (stx$2228.length > 0 && patternClass$2227 === 'expr') {
            match$2232 = stx$2228[0].term ? cachedTermMatch$2164(stx$2228, stx$2228[0].term) : expander$2143.get_expression(stx$2228, expander$2143.makeExpanderContext({ env: env$2229 }));
            if (match$2232.result === null || !match$2232.result.hasPrototype(expander$2143.Expr)) {
                result$2230 = null;
                rest$2231 = stx$2228;
            } else {
                result$2230 = match$2232.destructed || match$2232.result.destruct(false);
                rest$2231 = match$2232.rest;
            }
        } else {
            result$2230 = null;
            rest$2231 = stx$2228;
        }
        return {
            result: result$2230,
            rest: rest$2231
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2166(patterns$2233, stx$2234, env$2235, topLevel$2236) {
        // topLevel lets us know if the patterns are on the top level or nested inside
        // a delimiter:
        //     case $topLevel (,) ... => { }
        //     case ($nested (,) ...) => { }
        // This matters for how we deal with trailing unmatched syntax when the pattern
        // has an ellipses:
        //     m 1,2,3 foo
        // should match 1,2,3 and leave foo alone but:
        //     m (1,2,3 foo)
        // should fail to match entirely.
        topLevel$2236 = topLevel$2236 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2237 = [];
        var patternEnv$2238 = {};
        var match$2239;
        var pattern$2240;
        var rest$2241 = stx$2234;
        var success$2242 = true;
        var inLeading$2243;
        patternLoop:
            for (var i$2244 = 0; i$2244 < patterns$2233.length; i$2244++) {
                if (success$2242 === false) {
                    break;
                }
                pattern$2240 = patterns$2233[i$2244];
                inLeading$2243 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2240.repeat && i$2244 + 1 < patterns$2233.length) {
                        var restMatch$2245 = matchPatterns$2166(patterns$2233.slice(i$2244 + 1), rest$2241, env$2235, topLevel$2236);
                        if (restMatch$2245.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2239 = matchPattern$2167(pattern$2240, [], env$2235, patternEnv$2238);
                            patternEnv$2238 = _$2141.extend(restMatch$2245.patternEnv, match$2239.patternEnv);
                            rest$2241 = restMatch$2245.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2240.repeat && pattern$2240.leading && pattern$2240.separator !== ' ') {
                        if (rest$2241[0].token.value === pattern$2240.separator) {
                            if (!inLeading$2243) {
                                inLeading$2243 = true;
                            }
                            rest$2241 = rest$2241.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2243) {
                                success$2242 = false;
                                break;
                            }
                        }
                    }
                    match$2239 = matchPattern$2167(pattern$2240, rest$2241, env$2235, patternEnv$2238);
                    if (!match$2239.success && pattern$2240.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2239.success) {
                        success$2242 = false;
                        break;
                    }
                    rest$2241 = match$2239.rest;
                    patternEnv$2238 = match$2239.patternEnv;
                    if (success$2242 && !(topLevel$2236 || pattern$2240.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2244 == patterns$2233.length - 1 && rest$2241.length !== 0) {
                            success$2242 = false;
                            break;
                        }
                    }
                    if (pattern$2240.repeat && !pattern$2240.leading && success$2242) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2240.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2241[0] && rest$2241[0].token.value === pattern$2240.separator) {
                            // more tokens and the next token matches the separator
                            rest$2241 = rest$2241.slice(1);
                        } else if (pattern$2240.separator !== ' ' && rest$2241.length > 0 && i$2244 === patterns$2233.length - 1 && topLevel$2236 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2242 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2240.repeat && success$2242 && rest$2241.length > 0);
            }
        var result$2237;
        if (success$2242) {
            result$2237 = rest$2241.length ? stx$2234.slice(0, -rest$2241.length) : stx$2234;
        } else {
            result$2237 = [];
        }
        return {
            success: success$2242,
            result: result$2237,
            rest: rest$2241,
            patternEnv: patternEnv$2238
        };
    }
    /* the pattern environment will look something like:
    {
        "$x": {
            level: 2,
            match: [{
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }, {
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }, {
                level: 1,
                match: [{
                    level: 0,
                    match: [tok1, tok2, ...]
                }]
            }]
        },
        "$y" : ...
    }
    */
    function matchPattern$2167(pattern$2246, stx$2247, env$2248, patternEnv$2249) {
        var subMatch$2250;
        var match$2251, matchEnv$2252;
        var rest$2253;
        var success$2254;
        if (typeof pattern$2246.inner !== 'undefined') {
            if (pattern$2246.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2250 = matchPatterns$2166(pattern$2246.inner, stx$2247, env$2248, true);
                rest$2253 = subMatch$2250.rest;
            } else if (stx$2247[0] && stx$2247[0].token.type === parser$2142.Token.Delimiter && stx$2247[0].token.value === pattern$2246.value) {
                stx$2247[0].expose();
                if (pattern$2246.inner.length === 0 && stx$2247[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2247,
                        patternEnv: patternEnv$2249
                    };
                }
                subMatch$2250 = matchPatterns$2166(pattern$2246.inner, stx$2247[0].token.inner, env$2248, false);
                rest$2253 = stx$2247.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2247,
                    patternEnv: patternEnv$2249
                };
            }
            success$2254 = subMatch$2250.success;
            // merge the subpattern matches with the current pattern environment
            _$2141.keys(subMatch$2250.patternEnv).forEach(function (patternKey$2255) {
                if (pattern$2246.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2256 = subMatch$2250.patternEnv[patternKey$2255].level + 1;
                    if (patternEnv$2249[patternKey$2255]) {
                        patternEnv$2249[patternKey$2255].level = nextLevel$2256;
                        patternEnv$2249[patternKey$2255].match.push(subMatch$2250.patternEnv[patternKey$2255]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2249[patternKey$2255] = {
                            level: nextLevel$2256,
                            match: [subMatch$2250.patternEnv[patternKey$2255]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2249[patternKey$2255] = subMatch$2250.patternEnv[patternKey$2255];
                }
            });
        } else {
            if (pattern$2246.class === 'pattern_literal') {
                // wildcard
                if (stx$2247[0] && pattern$2246.value === '_') {
                    success$2254 = true;
                    rest$2253 = stx$2247.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2247[0] && pattern$2246.value === stx$2247[0].token.value) {
                    success$2254 = true;
                    rest$2253 = stx$2247.slice(1);
                } else {
                    success$2254 = false;
                    rest$2253 = stx$2247;
                }
            } else {
                match$2251 = matchPatternClass$2165(pattern$2246.class, stx$2247, env$2248);
                success$2254 = match$2251.result !== null;
                rest$2253 = match$2251.rest;
                matchEnv$2252 = {
                    level: 0,
                    match: match$2251.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2246.repeat) {
                    if (patternEnv$2249[pattern$2246.value] && success$2254) {
                        patternEnv$2249[pattern$2246.value].match.push(matchEnv$2252);
                    } else if (patternEnv$2249[pattern$2246.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2249[pattern$2246.value] = {
                            level: 1,
                            match: [matchEnv$2252]
                        };
                    }
                } else {
                    patternEnv$2249[pattern$2246.value] = matchEnv$2252;
                }
            }
        }
        return {
            success: success$2254,
            rest: rest$2253,
            patternEnv: patternEnv$2249
        };
    }
    function matchLookbehind$2168(patterns$2257, stx$2258, terms$2259, env$2260) {
        var success$2261, patternEnv$2262, prevStx$2263, prevTerms$2264;
        // No lookbehind, noop.
        if (!patterns$2257.length) {
            success$2261 = true;
            patternEnv$2262 = {};
            prevStx$2263 = stx$2258;
            prevTerms$2264 = terms$2259;
        } else {
            var match$2265 = matchPatterns$2166(patterns$2257, stx$2258, env$2260, true);
            var last$2266 = match$2265.result[match$2265.result.length - 1];
            success$2261 = match$2265.success;
            patternEnv$2262 = match$2265.patternEnv;
            if (success$2261) {
                if (match$2265.rest.length) {
                    if (last$2266 && last$2266.term === match$2265.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2261 = false;
                    } else {
                        prevStx$2263 = match$2265.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2267 = 0, len$2268 = terms$2259.length; i$2267 < len$2268; i$2267++) {
                            if (terms$2259[i$2267] === prevStx$2263[0].term) {
                                prevTerms$2264 = terms$2259.slice(i$2267);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2264 = [];
                    prevStx$2263 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2141.forEach(patternEnv$2262, function (val$2269, key$2270) {
            if (val$2269.level && val$2269.match) {
                val$2269.match.reverse();
            }
        });
        return {
            success: success$2261,
            patternEnv: patternEnv$2262,
            prevStx: prevStx$2263,
            prevTerms: prevTerms$2264
        };
    }
    function hasMatch$2169(m$2271) {
        if (m$2271.level === 0) {
            return m$2271.match.length > 0;
        }
        return m$2271.match.every(function (m$2272) {
            return hasMatch$2169(m$2272);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2170(macroBody$2273, macroNameStx$2274, env$2275) {
        return _$2141.chain(macroBody$2273).reduce(function (acc$2276, bodyStx$2277, idx$2278, original$2279) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2280 = original$2279[idx$2278 - 1];
            var next$2281 = original$2279[idx$2278 + 1];
            var nextNext$2282 = original$2279[idx$2278 + 2];
            // drop `...`
            if (bodyStx$2277.token.value === '...') {
                return acc$2276;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2156(bodyStx$2277) && next$2281 && next$2281.token.value === '...') {
                return acc$2276;
            }
            // skip the $ in $(...)
            if (bodyStx$2277.token.value === '$' && next$2281 && next$2281.token.type === parser$2142.Token.Delimiter && next$2281.token.value === '()') {
                return acc$2276;
            }
            // mark $[...] as a literal
            if (bodyStx$2277.token.value === '$' && next$2281 && next$2281.token.type === parser$2142.Token.Delimiter && next$2281.token.value === '[]') {
                next$2281.literal = true;
                return acc$2276;
            }
            if (bodyStx$2277.token.type === parser$2142.Token.Delimiter && bodyStx$2277.token.value === '()' && last$2280 && last$2280.token.value === '$') {
                bodyStx$2277.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2277.literal === true) {
                assert$2150(bodyStx$2277.token.type === parser$2142.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2276.concat(bodyStx$2277.token.inner);
            }
            if (next$2281 && next$2281.token.value === '...') {
                bodyStx$2277.repeat = true;
                bodyStx$2277.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2156(next$2281) && nextNext$2282 && nextNext$2282.token.value === '...') {
                bodyStx$2277.repeat = true;
                bodyStx$2277.separator = next$2281.token.inner[0].token.value;
            }
            acc$2276.push(bodyStx$2277);
            return acc$2276;
        }, []).reduce(function (acc$2283, bodyStx$2284, idx$2285) {
            // then do the actual transcription
            if (bodyStx$2284.repeat) {
                if (bodyStx$2284.token.type === parser$2142.Token.Delimiter) {
                    bodyStx$2284.expose();
                    var fv$2286 = _$2141.filter(freeVarsInPattern$2153(bodyStx$2284.token.inner), function (pat$2293) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2275.hasOwnProperty(pat$2293);
                        });
                    var restrictedEnv$2287 = [];
                    var nonScalar$2288 = _$2141.find(fv$2286, function (pat$2294) {
                            return env$2275[pat$2294].level > 0;
                        });
                    assert$2150(typeof nonScalar$2288 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2289 = env$2275[nonScalar$2288].match.length;
                    var sameLength$2290 = _$2141.all(fv$2286, function (pat$2295) {
                            return env$2275[pat$2295].level === 0 || env$2275[pat$2295].match.length === repeatLength$2289;
                        });
                    assert$2150(sameLength$2290, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2141.each(_$2141.range(repeatLength$2289), function (idx$2296) {
                        var renv$2297 = {};
                        _$2141.each(fv$2286, function (pat$2299) {
                            if (env$2275[pat$2299].level === 0) {
                                // copy scalars over
                                renv$2297[pat$2299] = env$2275[pat$2299];
                            } else {
                                // grab the match at this index 
                                renv$2297[pat$2299] = env$2275[pat$2299].match[idx$2296];
                            }
                        });
                        var allHaveMatch$2298 = Object.keys(renv$2297).every(function (pat$2300) {
                                return hasMatch$2169(renv$2297[pat$2300]);
                            });
                        if (allHaveMatch$2298) {
                            restrictedEnv$2287.push(renv$2297);
                        }
                    });
                    var transcribed$2291 = _$2141.map(restrictedEnv$2287, function (renv$2301) {
                            if (bodyStx$2284.group) {
                                return transcribe$2170(bodyStx$2284.token.inner, macroNameStx$2274, renv$2301);
                            } else {
                                var newBody$2302 = syntaxFromToken$2146(_$2141.clone(bodyStx$2284.token), bodyStx$2284);
                                newBody$2302.token.inner = transcribe$2170(bodyStx$2284.token.inner, macroNameStx$2274, renv$2301);
                                return newBody$2302;
                            }
                        });
                    var joined$2292;
                    if (bodyStx$2284.group) {
                        joined$2292 = joinSyntaxArr$2149(transcribed$2291, bodyStx$2284.separator);
                    } else {
                        joined$2292 = joinSyntax$2148(transcribed$2291, bodyStx$2284.separator);
                    }
                    push$2152.apply(acc$2283, joined$2292);
                    return acc$2283;
                }
                if (!env$2275[bodyStx$2284.token.value]) {
                    throwSyntaxError$2151('patterns', 'The pattern variable is not bound for the template', bodyStx$2284);
                } else if (env$2275[bodyStx$2284.token.value].level !== 1) {
                    throwSyntaxError$2151('patterns', 'Ellipses level does not match in the template', bodyStx$2284);
                }
                push$2152.apply(acc$2283, joinRepeatedMatch$2158(env$2275[bodyStx$2284.token.value].match, bodyStx$2284.separator));
                return acc$2283;
            } else {
                if (bodyStx$2284.token.type === parser$2142.Token.Delimiter) {
                    bodyStx$2284.expose();
                    var newBody$2303 = syntaxFromToken$2146(_$2141.clone(bodyStx$2284.token), macroBody$2273);
                    newBody$2303.token.inner = transcribe$2170(bodyStx$2284.token.inner, macroNameStx$2274, env$2275);
                    acc$2283.push(newBody$2303);
                    return acc$2283;
                }
                if (isPatternVar$2157(bodyStx$2284) && Object.prototype.hasOwnProperty.bind(env$2275)(bodyStx$2284.token.value)) {
                    if (!env$2275[bodyStx$2284.token.value]) {
                        throwSyntaxError$2151('patterns', 'The pattern variable is not bound for the template', bodyStx$2284);
                    } else if (env$2275[bodyStx$2284.token.value].level !== 0) {
                        throwSyntaxError$2151('patterns', 'Ellipses level does not match in the template', bodyStx$2284);
                    }
                    push$2152.apply(acc$2283, takeLineContext$2159(bodyStx$2284, env$2275[bodyStx$2284.token.value].match));
                    return acc$2283;
                }
                acc$2283.push(bodyStx$2284);
                return acc$2283;
            }
        }, []).value();
    }
    exports$2140.loadPattern = loadPattern$2163;
    exports$2140.matchPatterns = matchPatterns$2166;
    exports$2140.matchLookbehind = matchLookbehind$2168;
    exports$2140.transcribe = transcribe$2170;
    exports$2140.matchPatternClass = matchPatternClass$2165;
    exports$2140.takeLineContext = takeLineContext$2159;
    exports$2140.takeLine = takeLine$2160;
    exports$2140.typeIsLiteral = typeIsLiteral$2154;
}));
//# sourceMappingURL=patterns.js.map