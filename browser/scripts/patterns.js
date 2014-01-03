(function (root$2116, factory$2117) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2117(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2117);
    }
}(this, function (exports$2118, _$2119, es6$2120, parser$2121, expander$2122, syntax$2123) {
    var get_expression$2124 = expander$2122.get_expression;
    var syntaxFromToken$2125 = syntax$2123.syntaxFromToken;
    var makePunc$2126 = syntax$2123.makePunc;
    var joinSyntax$2127 = syntax$2123.joinSyntax;
    var joinSyntaxArr$2128 = syntax$2123.joinSyntaxArr;
    var assert$2129 = syntax$2123.assert;
    var throwSyntaxError$2130 = syntax$2123.throwSyntaxError;
    var push$2131 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2132(pattern$2150) {
        var fv$2151 = [];
        _$2119.each(pattern$2150, function (pat$2152) {
            if (isPatternVar$2136(pat$2152)) {
                fv$2151.push(pat$2152.token.value);
            } else if (pat$2152.token.type === parser$2121.Token.Delimiter) {
                push$2131.apply(fv$2151, freeVarsInPattern$2132(pat$2152.token.inner));
            }
        });
        return fv$2151;
    }
    function typeIsLiteral$2133(type$2153) {
        return type$2153 === parser$2121.Token.NullLiteral || type$2153 === parser$2121.Token.NumericLiteral || type$2153 === parser$2121.Token.StringLiteral || type$2153 === parser$2121.Token.RegexLiteral || type$2153 === parser$2121.Token.BooleanLiteral;
    }
    function containsPatternVar$2134(patterns$2154) {
        return _$2119.any(patterns$2154, function (pat$2155) {
            if (pat$2155.token.type === parser$2121.Token.Delimiter) {
                return containsPatternVar$2134(pat$2155.token.inner);
            }
            return isPatternVar$2136(pat$2155);
        });
    }
    function delimIsSeparator$2135(delim$2156) {
        return delim$2156 && delim$2156.token && delim$2156.token.type === parser$2121.Token.Delimiter && delim$2156.token.value === '()' && delim$2156.token.inner.length === 1 && delim$2156.token.inner[0].token.type !== parser$2121.Token.Delimiter && !containsPatternVar$2134(delim$2156.token.inner);
    }
    function isPatternVar$2136(stx$2157) {
        return stx$2157.token.value[0] === '$' && stx$2157.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2137(tojoin$2158, punc$2159) {
        return _$2119.reduce(_$2119.rest(tojoin$2158, 1), function (acc$2160, join$2161) {
            if (punc$2159 === ' ') {
                return acc$2160.concat(join$2161.match);
            }
            return acc$2160.concat(makePunc$2126(punc$2159, _$2119.first(join$2161.match)), join$2161.match);
        }, _$2119.first(tojoin$2158).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2138(from$2162, to$2163) {
        return _$2119.map(to$2163, function (stx$2164) {
            return takeLine$2139(from$2162, stx$2164);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2139(from$2165, to$2166) {
        var next$2167;
        if (to$2166.token.type === parser$2121.Token.Delimiter) {
            if (from$2165.token.type === parser$2121.Token.Delimiter) {
                next$2167 = syntaxFromToken$2125({
                    type: parser$2121.Token.Delimiter,
                    value: to$2166.token.value,
                    inner: takeLineContext$2138(from$2165, to$2166.token.inner),
                    startRange: from$2165.token.startRange,
                    endRange: from$2165.token.endRange,
                    startLineNumber: from$2165.token.startLineNumber,
                    startLineStart: from$2165.token.startLineStart,
                    endLineNumber: from$2165.token.endLineNumber,
                    endLineStart: from$2165.token.endLineStart,
                    sm_startLineNumber: to$2166.token.startLineNumber,
                    sm_endLineNumber: to$2166.token.endLineNumber,
                    sm_startLineStart: to$2166.token.startLineStart,
                    sm_endLineStart: to$2166.token.endLineStart,
                    sm_startRange: to$2166.token.startRange,
                    sm_endRange: to$2166.token.endRange
                }, to$2166);
            } else {
                next$2167 = syntaxFromToken$2125({
                    type: parser$2121.Token.Delimiter,
                    value: to$2166.token.value,
                    inner: takeLineContext$2138(from$2165, to$2166.token.inner),
                    startRange: from$2165.token.range,
                    endRange: from$2165.token.range,
                    startLineNumber: from$2165.token.lineNumber,
                    startLineStart: from$2165.token.lineStart,
                    endLineNumber: from$2165.token.lineNumber,
                    endLineStart: from$2165.token.lineStart,
                    sm_startLineNumber: to$2166.token.startLineNumber,
                    sm_endLineNumber: to$2166.token.endLineNumber,
                    sm_startLineStart: to$2166.token.startLineStart,
                    sm_endLineStart: to$2166.token.endLineStart,
                    sm_startRange: to$2166.token.startRange,
                    sm_endRange: to$2166.token.endRange
                }, to$2166);
            }
        } else {
            if (from$2165.token.type === parser$2121.Token.Delimiter) {
                next$2167 = syntaxFromToken$2125({
                    value: to$2166.token.value,
                    type: to$2166.token.type,
                    lineNumber: from$2165.token.startLineNumber,
                    lineStart: from$2165.token.startLineStart,
                    range: from$2165.token.startRange,
                    sm_lineNumber: to$2166.token.lineNumber,
                    sm_lineStart: to$2166.token.lineStart,
                    sm_range: to$2166.token.range
                }, to$2166);
            } else {
                next$2167 = syntaxFromToken$2125({
                    value: to$2166.token.value,
                    type: to$2166.token.type,
                    lineNumber: from$2165.token.lineNumber,
                    lineStart: from$2165.token.lineStart,
                    range: from$2165.token.range,
                    sm_lineNumber: to$2166.token.lineNumber,
                    sm_lineStart: to$2166.token.lineStart,
                    sm_range: to$2166.token.range
                }, to$2166);
            }
        }
        if (to$2166.token.leadingComments) {
            next$2167.token.leadingComments = to$2166.token.leadingComments;
        }
        if (to$2166.token.trailingComments) {
            next$2167.token.trailingComments = to$2166.token.trailingComments;
        }
        return next$2167;
    }
    function reversePattern$2140(patterns$2168) {
        var len$2169 = patterns$2168.length;
        var pat$2170;
        return _$2119.reduceRight(patterns$2168, function (acc$2171, pat$2170) {
            if (pat$2170.class === 'pattern_group') {
                pat$2170.token.inner = reversePattern$2140(pat$2170.token.inner);
            }
            if (pat$2170.repeat) {
                pat$2170.leading = !pat$2170.leading;
            }
            acc$2171.push(pat$2170);
            return acc$2171;
        }, []);
    }
    function loadLiteralGroup$2141(patterns$2173) {
        _$2119.forEach(patterns$2173, function (patStx$2174) {
            if (patStx$2174.token.type === parser$2121.Token.Delimiter) {
                patStx$2174.token.inner = loadLiteralGroup$2141(patStx$2174.token.inner);
            } else {
                patStx$2174.class = 'pattern_literal';
            }
        });
        return patterns$2173;
    }
    function loadPattern$2142(patterns$2175, reverse$2176) {
        var patts$2177 = _$2119.chain(patterns$2175).reduce(function (acc$2178, patStx$2179, idx$2180) {
                var last$2181 = patterns$2175[idx$2180 - 1];
                var lastLast$2182 = patterns$2175[idx$2180 - 2];
                var next$2183 = patterns$2175[idx$2180 + 1];
                var nextNext$2184 = patterns$2175[idx$2180 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2179.token.value === ':') {
                    if (last$2181 && isPatternVar$2136(last$2181) && !isPatternVar$2136(next$2183)) {
                        return acc$2178;
                    }
                }
                if (last$2181 && last$2181.token.value === ':') {
                    if (lastLast$2182 && isPatternVar$2136(lastLast$2182) && !isPatternVar$2136(patStx$2179)) {
                        return acc$2178;
                    }
                }
                // skip over $
                if (patStx$2179.token.value === '$' && next$2183 && next$2183.token.type === parser$2121.Token.Delimiter) {
                    return acc$2178;
                }
                if (isPatternVar$2136(patStx$2179)) {
                    if (next$2183 && next$2183.token.value === ':' && !isPatternVar$2136(nextNext$2184)) {
                        if (typeof nextNext$2184 === 'undefined') {
                            throwSyntaxError$2130('patterns', 'expecting a pattern class following a `:`', next$2183);
                        }
                        patStx$2179.class = nextNext$2184.token.value;
                    } else {
                        patStx$2179.class = 'token';
                    }
                } else if (patStx$2179.token.type === parser$2121.Token.Delimiter) {
                    if (last$2181 && last$2181.token.value === '$') {
                        patStx$2179.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2179.class === 'pattern_group' && patStx$2179.token.value === '[]') {
                        patStx$2179.token.inner = loadLiteralGroup$2141(patStx$2179.token.inner);
                    } else {
                        patStx$2179.token.inner = loadPattern$2142(patStx$2179.token.inner);
                    }
                } else {
                    patStx$2179.class = 'pattern_literal';
                }
                acc$2178.push(patStx$2179);
                return acc$2178;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2185, patStx$2186, idx$2187, patterns$2188) {
                var separator$2189 = patStx$2186.separator || ' ';
                var repeat$2190 = patStx$2186.repeat || false;
                var next$2191 = patterns$2188[idx$2187 + 1];
                var nextNext$2192 = patterns$2188[idx$2187 + 2];
                if (next$2191 && next$2191.token.value === '...') {
                    repeat$2190 = true;
                    separator$2189 = ' ';
                } else if (delimIsSeparator$2135(next$2191) && nextNext$2192 && nextNext$2192.token.value === '...') {
                    repeat$2190 = true;
                    assert$2129(next$2191.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2189 = next$2191.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2186.token.value === '...' || delimIsSeparator$2135(patStx$2186) && next$2191 && next$2191.token.value === '...') {
                    return acc$2185;
                }
                patStx$2186.repeat = repeat$2190;
                patStx$2186.separator = separator$2189;
                acc$2185.push(patStx$2186);
                return acc$2185;
            }, []).value();
        return reverse$2176 ? reversePattern$2140(patts$2177) : patts$2177;
    }
    function cachedTermMatch$2143(stx$2193, term$2194) {
        var res$2195 = [];
        var i$2196 = 0;
        while (stx$2193[i$2196] && stx$2193[i$2196].term === term$2194) {
            res$2195.unshift(stx$2193[i$2196]);
            i$2196++;
        }
        return {
            result: term$2194,
            destructed: res$2195,
            rest: stx$2193.slice(res$2195.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2144(patternClass$2197, stx$2198, env$2199) {
        var result$2200, rest$2201, match$2202;
        // pattern has no parse class
        if (patternClass$2197 === 'token' && stx$2198[0] && stx$2198[0].token.type !== parser$2121.Token.EOF) {
            result$2200 = [stx$2198[0]];
            rest$2201 = stx$2198.slice(1);
        } else if (patternClass$2197 === 'lit' && stx$2198[0] && typeIsLiteral$2133(stx$2198[0].token.type)) {
            result$2200 = [stx$2198[0]];
            rest$2201 = stx$2198.slice(1);
        } else if (patternClass$2197 === 'ident' && stx$2198[0] && stx$2198[0].token.type === parser$2121.Token.Identifier) {
            result$2200 = [stx$2198[0]];
            rest$2201 = stx$2198.slice(1);
        } else if (stx$2198.length > 0 && patternClass$2197 === 'VariableStatement') {
            match$2202 = stx$2198[0].term ? cachedTermMatch$2143(stx$2198, stx$2198[0].term) : expander$2122.enforest(stx$2198, expander$2122.makeExpanderContext({ env: env$2199 }));
            if (match$2202.result && match$2202.result.hasPrototype(expander$2122.VariableStatement)) {
                result$2200 = match$2202.destructed || match$2202.result.destruct(false);
                rest$2201 = match$2202.rest;
            } else {
                result$2200 = null;
                rest$2201 = stx$2198;
            }
        } else if (stx$2198.length > 0 && patternClass$2197 === 'expr') {
            match$2202 = stx$2198[0].term ? cachedTermMatch$2143(stx$2198, stx$2198[0].term) : expander$2122.get_expression(stx$2198, expander$2122.makeExpanderContext({ env: env$2199 }));
            if (match$2202.result === null || !match$2202.result.hasPrototype(expander$2122.Expr)) {
                result$2200 = null;
                rest$2201 = stx$2198;
            } else {
                result$2200 = match$2202.destructed || match$2202.result.destruct(false);
                rest$2201 = match$2202.rest;
            }
        } else {
            result$2200 = null;
            rest$2201 = stx$2198;
        }
        return {
            result: result$2200,
            rest: rest$2201
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2145(patterns$2203, stx$2204, env$2205, topLevel$2206) {
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
        topLevel$2206 = topLevel$2206 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2207 = [];
        var patternEnv$2208 = {};
        var match$2209;
        var pattern$2210;
        var rest$2211 = stx$2204;
        var success$2212 = true;
        var inLeading$2213;
        patternLoop:
            for (var i$2214 = 0; i$2214 < patterns$2203.length; i$2214++) {
                if (success$2212 === false) {
                    break;
                }
                pattern$2210 = patterns$2203[i$2214];
                inLeading$2213 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2210.repeat && i$2214 + 1 < patterns$2203.length) {
                        var restMatch$2215 = matchPatterns$2145(patterns$2203.slice(i$2214 + 1), rest$2211, env$2205, topLevel$2206);
                        if (restMatch$2215.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2209 = matchPattern$2146(pattern$2210, [], env$2205, patternEnv$2208);
                            patternEnv$2208 = _$2119.extend(restMatch$2215.patternEnv, match$2209.patternEnv);
                            rest$2211 = restMatch$2215.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2210.repeat && pattern$2210.leading && pattern$2210.separator !== ' ') {
                        if (rest$2211[0].token.value === pattern$2210.separator) {
                            if (!inLeading$2213) {
                                inLeading$2213 = true;
                            }
                            rest$2211 = rest$2211.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2213) {
                                success$2212 = false;
                                break;
                            }
                        }
                    }
                    match$2209 = matchPattern$2146(pattern$2210, rest$2211, env$2205, patternEnv$2208);
                    if (!match$2209.success && pattern$2210.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2209.success) {
                        success$2212 = false;
                        break;
                    }
                    rest$2211 = match$2209.rest;
                    patternEnv$2208 = match$2209.patternEnv;
                    if (success$2212 && !(topLevel$2206 || pattern$2210.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2214 == patterns$2203.length - 1 && rest$2211.length !== 0) {
                            success$2212 = false;
                            break;
                        }
                    }
                    if (pattern$2210.repeat && !pattern$2210.leading && success$2212) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2210.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2211[0] && rest$2211[0].token.value === pattern$2210.separator) {
                            // more tokens and the next token matches the separator
                            rest$2211 = rest$2211.slice(1);
                        } else if (pattern$2210.separator !== ' ' && rest$2211.length > 0 && i$2214 === patterns$2203.length - 1 && topLevel$2206 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2212 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2210.repeat && success$2212 && rest$2211.length > 0);
            }
        var result$2207;
        if (success$2212) {
            result$2207 = rest$2211.length ? stx$2204.slice(0, -rest$2211.length) : stx$2204;
        } else {
            result$2207 = [];
        }
        return {
            success: success$2212,
            result: result$2207,
            rest: rest$2211,
            patternEnv: patternEnv$2208
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
    function matchPattern$2146(pattern$2216, stx$2217, env$2218, patternEnv$2219) {
        var subMatch$2220;
        var match$2221, matchEnv$2222;
        var rest$2223;
        var success$2224;
        if (typeof pattern$2216.inner !== 'undefined') {
            if (pattern$2216.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2220 = matchPatterns$2145(pattern$2216.inner, stx$2217, env$2218, true);
                rest$2223 = subMatch$2220.rest;
            } else if (stx$2217[0] && stx$2217[0].token.type === parser$2121.Token.Delimiter && stx$2217[0].token.value === pattern$2216.value) {
                stx$2217[0].expose();
                if (pattern$2216.inner.length === 0 && stx$2217[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2217,
                        patternEnv: patternEnv$2219
                    };
                }
                subMatch$2220 = matchPatterns$2145(pattern$2216.inner, stx$2217[0].token.inner, env$2218, false);
                rest$2223 = stx$2217.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2217,
                    patternEnv: patternEnv$2219
                };
            }
            success$2224 = subMatch$2220.success;
            // merge the subpattern matches with the current pattern environment
            _$2119.keys(subMatch$2220.patternEnv).forEach(function (patternKey$2225) {
                if (pattern$2216.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2226 = subMatch$2220.patternEnv[patternKey$2225].level + 1;
                    if (patternEnv$2219[patternKey$2225]) {
                        patternEnv$2219[patternKey$2225].level = nextLevel$2226;
                        patternEnv$2219[patternKey$2225].match.push(subMatch$2220.patternEnv[patternKey$2225]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2219[patternKey$2225] = {
                            level: nextLevel$2226,
                            match: [subMatch$2220.patternEnv[patternKey$2225]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2219[patternKey$2225] = subMatch$2220.patternEnv[patternKey$2225];
                }
            });
        } else {
            if (pattern$2216.class === 'pattern_literal') {
                // wildcard
                if (stx$2217[0] && pattern$2216.value === '_') {
                    success$2224 = true;
                    rest$2223 = stx$2217.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2217[0] && pattern$2216.value === stx$2217[0].token.value) {
                    success$2224 = true;
                    rest$2223 = stx$2217.slice(1);
                } else {
                    success$2224 = false;
                    rest$2223 = stx$2217;
                }
            } else {
                match$2221 = matchPatternClass$2144(pattern$2216.class, stx$2217, env$2218);
                success$2224 = match$2221.result !== null;
                rest$2223 = match$2221.rest;
                matchEnv$2222 = {
                    level: 0,
                    match: match$2221.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2216.repeat) {
                    if (patternEnv$2219[pattern$2216.value] && success$2224) {
                        patternEnv$2219[pattern$2216.value].match.push(matchEnv$2222);
                    } else if (patternEnv$2219[pattern$2216.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2219[pattern$2216.value] = {
                            level: 1,
                            match: [matchEnv$2222]
                        };
                    }
                } else {
                    patternEnv$2219[pattern$2216.value] = matchEnv$2222;
                }
            }
        }
        return {
            success: success$2224,
            rest: rest$2223,
            patternEnv: patternEnv$2219
        };
    }
    function matchLookbehind$2147(patterns$2227, stx$2228, terms$2229, env$2230) {
        var success$2231, patternEnv$2232, prevStx$2233, prevTerms$2234;
        // No lookbehind, noop.
        if (!patterns$2227.length) {
            success$2231 = true;
            patternEnv$2232 = {};
            prevStx$2233 = stx$2228;
            prevTerms$2234 = terms$2229;
        } else {
            var match$2235 = matchPatterns$2145(patterns$2227, stx$2228, env$2230, true);
            var last$2236 = match$2235.result[match$2235.result.length - 1];
            success$2231 = match$2235.success;
            patternEnv$2232 = match$2235.patternEnv;
            if (success$2231) {
                if (match$2235.rest.length) {
                    if (last$2236 && last$2236.term === match$2235.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2231 = false;
                    } else {
                        prevStx$2233 = match$2235.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2237 = 0, len$2238 = terms$2229.length; i$2237 < len$2238; i$2237++) {
                            if (terms$2229[i$2237] === prevStx$2233[0].term) {
                                prevTerms$2234 = terms$2229.slice(i$2237);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2234 = [];
                    prevStx$2233 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2119.forEach(patternEnv$2232, function (val$2239, key$2240) {
            if (val$2239.level && val$2239.match) {
                val$2239.match.reverse();
            }
        });
        return {
            success: success$2231,
            patternEnv: patternEnv$2232,
            prevStx: prevStx$2233,
            prevTerms: prevTerms$2234
        };
    }
    function hasMatch$2148(m$2241) {
        if (m$2241.level === 0) {
            return m$2241.match.length > 0;
        }
        return m$2241.match.every(function (m$2242) {
            return hasMatch$2148(m$2242);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2149(macroBody$2243, macroNameStx$2244, env$2245) {
        return _$2119.chain(macroBody$2243).reduce(function (acc$2246, bodyStx$2247, idx$2248, original$2249) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2250 = original$2249[idx$2248 - 1];
            var next$2251 = original$2249[idx$2248 + 1];
            var nextNext$2252 = original$2249[idx$2248 + 2];
            // drop `...`
            if (bodyStx$2247.token.value === '...') {
                return acc$2246;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2135(bodyStx$2247) && next$2251 && next$2251.token.value === '...') {
                return acc$2246;
            }
            // skip the $ in $(...)
            if (bodyStx$2247.token.value === '$' && next$2251 && next$2251.token.type === parser$2121.Token.Delimiter && next$2251.token.value === '()') {
                return acc$2246;
            }
            // mark $[...] as a literal
            if (bodyStx$2247.token.value === '$' && next$2251 && next$2251.token.type === parser$2121.Token.Delimiter && next$2251.token.value === '[]') {
                next$2251.literal = true;
                return acc$2246;
            }
            if (bodyStx$2247.token.type === parser$2121.Token.Delimiter && bodyStx$2247.token.value === '()' && last$2250 && last$2250.token.value === '$') {
                bodyStx$2247.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2247.literal === true) {
                assert$2129(bodyStx$2247.token.type === parser$2121.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2246.concat(bodyStx$2247.token.inner);
            }
            if (next$2251 && next$2251.token.value === '...') {
                bodyStx$2247.repeat = true;
                bodyStx$2247.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2135(next$2251) && nextNext$2252 && nextNext$2252.token.value === '...') {
                bodyStx$2247.repeat = true;
                bodyStx$2247.separator = next$2251.token.inner[0].token.value;
            }
            acc$2246.push(bodyStx$2247);
            return acc$2246;
        }, []).reduce(function (acc$2253, bodyStx$2254, idx$2255) {
            // then do the actual transcription
            if (bodyStx$2254.repeat) {
                if (bodyStx$2254.token.type === parser$2121.Token.Delimiter) {
                    bodyStx$2254.expose();
                    var fv$2256 = _$2119.filter(freeVarsInPattern$2132(bodyStx$2254.token.inner), function (pat$2263) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2245.hasOwnProperty(pat$2263);
                        });
                    var restrictedEnv$2257 = [];
                    var nonScalar$2258 = _$2119.find(fv$2256, function (pat$2264) {
                            return env$2245[pat$2264].level > 0;
                        });
                    assert$2129(typeof nonScalar$2258 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2259 = env$2245[nonScalar$2258].match.length;
                    var sameLength$2260 = _$2119.all(fv$2256, function (pat$2265) {
                            return env$2245[pat$2265].level === 0 || env$2245[pat$2265].match.length === repeatLength$2259;
                        });
                    assert$2129(sameLength$2260, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2119.each(_$2119.range(repeatLength$2259), function (idx$2266) {
                        var renv$2267 = {};
                        _$2119.each(fv$2256, function (pat$2269) {
                            if (env$2245[pat$2269].level === 0) {
                                // copy scalars over
                                renv$2267[pat$2269] = env$2245[pat$2269];
                            } else {
                                // grab the match at this index 
                                renv$2267[pat$2269] = env$2245[pat$2269].match[idx$2266];
                            }
                        });
                        var allHaveMatch$2268 = Object.keys(renv$2267).every(function (pat$2270) {
                                return hasMatch$2148(renv$2267[pat$2270]);
                            });
                        if (allHaveMatch$2268) {
                            restrictedEnv$2257.push(renv$2267);
                        }
                    });
                    var transcribed$2261 = _$2119.map(restrictedEnv$2257, function (renv$2271) {
                            if (bodyStx$2254.group) {
                                return transcribe$2149(bodyStx$2254.token.inner, macroNameStx$2244, renv$2271);
                            } else {
                                var newBody$2272 = syntaxFromToken$2125(_$2119.clone(bodyStx$2254.token), bodyStx$2254);
                                newBody$2272.token.inner = transcribe$2149(bodyStx$2254.token.inner, macroNameStx$2244, renv$2271);
                                return newBody$2272;
                            }
                        });
                    var joined$2262;
                    if (bodyStx$2254.group) {
                        joined$2262 = joinSyntaxArr$2128(transcribed$2261, bodyStx$2254.separator);
                    } else {
                        joined$2262 = joinSyntax$2127(transcribed$2261, bodyStx$2254.separator);
                    }
                    push$2131.apply(acc$2253, joined$2262);
                    return acc$2253;
                }
                if (!env$2245[bodyStx$2254.token.value]) {
                    throwSyntaxError$2130('patterns', 'The pattern variable is not bound for the template', bodyStx$2254);
                } else if (env$2245[bodyStx$2254.token.value].level !== 1) {
                    throwSyntaxError$2130('patterns', 'Ellipses level does not match in the template', bodyStx$2254);
                }
                push$2131.apply(acc$2253, joinRepeatedMatch$2137(env$2245[bodyStx$2254.token.value].match, bodyStx$2254.separator));
                return acc$2253;
            } else {
                if (bodyStx$2254.token.type === parser$2121.Token.Delimiter) {
                    bodyStx$2254.expose();
                    var newBody$2273 = syntaxFromToken$2125(_$2119.clone(bodyStx$2254.token), macroBody$2243);
                    newBody$2273.token.inner = transcribe$2149(bodyStx$2254.token.inner, macroNameStx$2244, env$2245);
                    acc$2253.push(newBody$2273);
                    return acc$2253;
                }
                if (isPatternVar$2136(bodyStx$2254) && Object.prototype.hasOwnProperty.bind(env$2245)(bodyStx$2254.token.value)) {
                    if (!env$2245[bodyStx$2254.token.value]) {
                        throwSyntaxError$2130('patterns', 'The pattern variable is not bound for the template', bodyStx$2254);
                    } else if (env$2245[bodyStx$2254.token.value].level !== 0) {
                        throwSyntaxError$2130('patterns', 'Ellipses level does not match in the template', bodyStx$2254);
                    }
                    push$2131.apply(acc$2253, takeLineContext$2138(bodyStx$2254, env$2245[bodyStx$2254.token.value].match));
                    return acc$2253;
                }
                acc$2253.push(bodyStx$2254);
                return acc$2253;
            }
        }, []).value();
    }
    exports$2118.loadPattern = loadPattern$2142;
    exports$2118.matchPatterns = matchPatterns$2145;
    exports$2118.matchLookbehind = matchLookbehind$2147;
    exports$2118.transcribe = transcribe$2149;
    exports$2118.matchPatternClass = matchPatternClass$2144;
    exports$2118.takeLineContext = takeLineContext$2138;
    exports$2118.takeLine = takeLine$2139;
}));
//# sourceMappingURL=patterns.js.map