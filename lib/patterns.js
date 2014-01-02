(function (root$2114, factory$2115) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2115(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2115);
    }
}(this, function (exports$2116, _$2117, es6$2118, parser$2119, expander$2120, syntax$2121) {
    var get_expression$2122 = expander$2120.get_expression;
    var syntaxFromToken$2123 = syntax$2121.syntaxFromToken;
    var makePunc$2124 = syntax$2121.makePunc;
    var joinSyntax$2125 = syntax$2121.joinSyntax;
    var joinSyntaxArr$2126 = syntax$2121.joinSyntaxArr;
    var assert$2127 = syntax$2121.assert;
    var throwSyntaxError$2128 = syntax$2121.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2129(pattern$2147) {
        var fv$2148 = [];
        _$2117.each(pattern$2147, function (pat$2149) {
            if (isPatternVar$2133(pat$2149)) {
                fv$2148.push(pat$2149.token.value);
            } else if (pat$2149.token.type === parser$2119.Token.Delimiter) {
                fv$2148 = fv$2148.concat(freeVarsInPattern$2129(pat$2149.token.inner));
            }
        });
        return fv$2148;
    }
    function typeIsLiteral$2130(type$2150) {
        return type$2150 === parser$2119.Token.NullLiteral || type$2150 === parser$2119.Token.NumericLiteral || type$2150 === parser$2119.Token.StringLiteral || type$2150 === parser$2119.Token.RegexLiteral || type$2150 === parser$2119.Token.BooleanLiteral;
    }
    function containsPatternVar$2131(patterns$2151) {
        return _$2117.any(patterns$2151, function (pat$2152) {
            if (pat$2152.token.type === parser$2119.Token.Delimiter) {
                return containsPatternVar$2131(pat$2152.token.inner);
            }
            return isPatternVar$2133(pat$2152);
        });
    }
    function delimIsSeparator$2132(delim$2153) {
        return delim$2153 && delim$2153.token && delim$2153.token.type === parser$2119.Token.Delimiter && delim$2153.token.value === '()' && delim$2153.token.inner.length === 1 && delim$2153.token.inner[0].token.type !== parser$2119.Token.Delimiter && !containsPatternVar$2131(delim$2153.token.inner);
    }
    function isPatternVar$2133(stx$2154) {
        return stx$2154.token.value[0] === '$' && stx$2154.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2134(tojoin$2155, punc$2156) {
        return _$2117.reduce(_$2117.rest(tojoin$2155, 1), function (acc$2157, join$2158) {
            if (punc$2156 === ' ') {
                return acc$2157.concat(join$2158.match);
            }
            return acc$2157.concat(makePunc$2124(punc$2156, _$2117.first(join$2158.match)), join$2158.match);
        }, _$2117.first(tojoin$2155).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2135(from$2159, to$2160) {
        return _$2117.map(to$2160, function (stx$2161) {
            return takeLine$2136(from$2159, stx$2161);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2136(from$2162, to$2163) {
        var next$2164;
        if (to$2163.token.type === parser$2119.Token.Delimiter) {
            if (from$2162.token.type === parser$2119.Token.Delimiter) {
                next$2164 = syntaxFromToken$2123({
                    type: parser$2119.Token.Delimiter,
                    value: to$2163.token.value,
                    inner: takeLineContext$2135(from$2162, to$2163.token.inner),
                    startRange: from$2162.token.startRange,
                    endRange: from$2162.token.endRange,
                    startLineNumber: from$2162.token.startLineNumber,
                    startLineStart: from$2162.token.startLineStart,
                    endLineNumber: from$2162.token.endLineNumber,
                    endLineStart: from$2162.token.endLineStart,
                    sm_startLineNumber: to$2163.token.startLineNumber,
                    sm_endLineNumber: to$2163.token.endLineNumber,
                    sm_startLineStart: to$2163.token.startLineStart,
                    sm_endLineStart: to$2163.token.endLineStart,
                    sm_startRange: to$2163.token.startRange,
                    sm_endRange: to$2163.token.endRange
                }, to$2163);
            } else {
                next$2164 = syntaxFromToken$2123({
                    type: parser$2119.Token.Delimiter,
                    value: to$2163.token.value,
                    inner: takeLineContext$2135(from$2162, to$2163.token.inner),
                    startRange: from$2162.token.range,
                    endRange: from$2162.token.range,
                    startLineNumber: from$2162.token.lineNumber,
                    startLineStart: from$2162.token.lineStart,
                    endLineNumber: from$2162.token.lineNumber,
                    endLineStart: from$2162.token.lineStart,
                    sm_startLineNumber: to$2163.token.startLineNumber,
                    sm_endLineNumber: to$2163.token.endLineNumber,
                    sm_startLineStart: to$2163.token.startLineStart,
                    sm_endLineStart: to$2163.token.endLineStart,
                    sm_startRange: to$2163.token.startRange,
                    sm_endRange: to$2163.token.endRange
                }, to$2163);
            }
        } else {
            if (from$2162.token.type === parser$2119.Token.Delimiter) {
                next$2164 = syntaxFromToken$2123({
                    value: to$2163.token.value,
                    type: to$2163.token.type,
                    lineNumber: from$2162.token.startLineNumber,
                    lineStart: from$2162.token.startLineStart,
                    range: from$2162.token.startRange,
                    sm_lineNumber: to$2163.token.lineNumber,
                    sm_lineStart: to$2163.token.lineStart,
                    sm_range: to$2163.token.range
                }, to$2163);
            } else {
                next$2164 = syntaxFromToken$2123({
                    value: to$2163.token.value,
                    type: to$2163.token.type,
                    lineNumber: from$2162.token.lineNumber,
                    lineStart: from$2162.token.lineStart,
                    range: from$2162.token.range,
                    sm_lineNumber: to$2163.token.lineNumber,
                    sm_lineStart: to$2163.token.lineStart,
                    sm_range: to$2163.token.range
                }, to$2163);
            }
        }
        if (to$2163.token.leadingComments) {
            next$2164.token.leadingComments = to$2163.token.leadingComments;
        }
        if (to$2163.token.trailingComments) {
            next$2164.token.trailingComments = to$2163.token.trailingComments;
        }
        return next$2164;
    }
    function reversePattern$2137(patterns$2165) {
        var len$2166 = patterns$2165.length;
        var res$2167 = [];
        var pat$2168;
        return _$2117.reduceRight(patterns$2165, function (acc$2169, pat$2168) {
            if (pat$2168.class === 'pattern_group') {
                pat$2168.token.inner = reversePattern$2137(pat$2168.token.inner);
            }
            if (pat$2168.repeat) {
                pat$2168.leading = !pat$2168.leading;
            }
            acc$2169.push(pat$2168);
            return acc$2169;
        }, []);
    }
    function loadLiteralGroup$2138(patterns$2171) {
        _$2117.forEach(patterns$2171, function (patStx$2172) {
            if (patStx$2172.token.type === parser$2119.Token.Delimiter) {
                patStx$2172.token.inner = loadLiteralGroup$2138(patStx$2172.token.inner);
            } else {
                patStx$2172.class = 'pattern_literal';
            }
        });
        return patterns$2171;
    }
    function loadPattern$2139(patterns$2173, reverse$2174) {
        var patts$2175 = _$2117.chain(patterns$2173).reduce(function (acc$2176, patStx$2177, idx$2178) {
                var last$2179 = patterns$2173[idx$2178 - 1];
                var lastLast$2180 = patterns$2173[idx$2178 - 2];
                var next$2181 = patterns$2173[idx$2178 + 1];
                var nextNext$2182 = patterns$2173[idx$2178 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2177.token.value === ':') {
                    if (last$2179 && isPatternVar$2133(last$2179) && !isPatternVar$2133(next$2181)) {
                        return acc$2176;
                    }
                }
                if (last$2179 && last$2179.token.value === ':') {
                    if (lastLast$2180 && isPatternVar$2133(lastLast$2180) && !isPatternVar$2133(patStx$2177)) {
                        return acc$2176;
                    }
                }
                // skip over $
                if (patStx$2177.token.value === '$' && next$2181 && next$2181.token.type === parser$2119.Token.Delimiter) {
                    return acc$2176;
                }
                if (isPatternVar$2133(patStx$2177)) {
                    if (next$2181 && next$2181.token.value === ':' && !isPatternVar$2133(nextNext$2182)) {
                        if (typeof nextNext$2182 === 'undefined') {
                            throwSyntaxError$2128('patterns', 'expecting a pattern class following a `:`', next$2181);
                        }
                        patStx$2177.class = nextNext$2182.token.value;
                    } else {
                        patStx$2177.class = 'token';
                    }
                } else if (patStx$2177.token.type === parser$2119.Token.Delimiter) {
                    if (last$2179 && last$2179.token.value === '$') {
                        patStx$2177.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2177.class === 'pattern_group' && patStx$2177.token.value === '[]') {
                        patStx$2177.token.inner = loadLiteralGroup$2138(patStx$2177.token.inner);
                    } else {
                        patStx$2177.token.inner = loadPattern$2139(patStx$2177.token.inner);
                    }
                } else {
                    patStx$2177.class = 'pattern_literal';
                }
                return acc$2176.concat(patStx$2177);
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2183, patStx$2184, idx$2185, patterns$2186) {
                var separator$2187 = patStx$2184.separator || ' ';
                var repeat$2188 = patStx$2184.repeat || false;
                var next$2189 = patterns$2186[idx$2185 + 1];
                var nextNext$2190 = patterns$2186[idx$2185 + 2];
                if (next$2189 && next$2189.token.value === '...') {
                    repeat$2188 = true;
                    separator$2187 = ' ';
                } else if (delimIsSeparator$2132(next$2189) && nextNext$2190 && nextNext$2190.token.value === '...') {
                    repeat$2188 = true;
                    assert$2127(next$2189.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2187 = next$2189.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2184.token.value === '...' || delimIsSeparator$2132(patStx$2184) && next$2189 && next$2189.token.value === '...') {
                    return acc$2183;
                }
                patStx$2184.repeat = repeat$2188;
                patStx$2184.separator = separator$2187;
                return acc$2183.concat(patStx$2184);
            }, []).value();
        return reverse$2174 ? reversePattern$2137(patts$2175) : patts$2175;
    }
    function cachedTermMatch$2140(stx$2191, term$2192) {
        var res$2193 = [];
        var i$2194 = 0;
        while (stx$2191[i$2194] && stx$2191[i$2194].term === term$2192) {
            res$2193.unshift(stx$2191[i$2194]);
            i$2194++;
        }
        return {
            result: term$2192,
            destructed: res$2193,
            rest: stx$2191.slice(res$2193.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2141(patternClass$2195, stx$2196, env$2197) {
        var result$2198, rest$2199, match$2200;
        // pattern has no parse class
        if (patternClass$2195 === 'token' && stx$2196[0] && stx$2196[0].token.type !== parser$2119.Token.EOF) {
            result$2198 = [stx$2196[0]];
            rest$2199 = stx$2196.slice(1);
        } else if (patternClass$2195 === 'lit' && stx$2196[0] && typeIsLiteral$2130(stx$2196[0].token.type)) {
            result$2198 = [stx$2196[0]];
            rest$2199 = stx$2196.slice(1);
        } else if (patternClass$2195 === 'ident' && stx$2196[0] && stx$2196[0].token.type === parser$2119.Token.Identifier) {
            result$2198 = [stx$2196[0]];
            rest$2199 = stx$2196.slice(1);
        } else if (stx$2196.length > 0 && patternClass$2195 === 'VariableStatement') {
            match$2200 = stx$2196[0].term ? cachedTermMatch$2140(stx$2196, stx$2196[0].term) : expander$2120.enforest(stx$2196, expander$2120.makeExpanderContext({ env: env$2197 }));
            if (match$2200.result && match$2200.result.hasPrototype(expander$2120.VariableStatement)) {
                result$2198 = match$2200.destructed || match$2200.result.destruct(false);
                rest$2199 = match$2200.rest;
            } else {
                result$2198 = null;
                rest$2199 = stx$2196;
            }
        } else if (stx$2196.length > 0 && patternClass$2195 === 'expr') {
            match$2200 = stx$2196[0].term ? cachedTermMatch$2140(stx$2196, stx$2196[0].term) : expander$2120.get_expression(stx$2196, expander$2120.makeExpanderContext({ env: env$2197 }));
            if (match$2200.result === null || !match$2200.result.hasPrototype(expander$2120.Expr)) {
                result$2198 = null;
                rest$2199 = stx$2196;
            } else {
                result$2198 = match$2200.destructed || match$2200.result.destruct(false);
                rest$2199 = match$2200.rest;
            }
        } else {
            result$2198 = null;
            rest$2199 = stx$2196;
        }
        return {
            result: result$2198,
            rest: rest$2199
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2142(patterns$2201, stx$2202, env$2203, topLevel$2204) {
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
        topLevel$2204 = topLevel$2204 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2205 = [];
        var patternEnv$2206 = {};
        var match$2207;
        var pattern$2208;
        var rest$2209 = stx$2202;
        var success$2210 = true;
        var inLeading$2211;
        patternLoop:
            for (var i$2212 = 0; i$2212 < patterns$2201.length; i$2212++) {
                if (success$2210 === false) {
                    break;
                }
                pattern$2208 = patterns$2201[i$2212];
                inLeading$2211 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2208.repeat && i$2212 + 1 < patterns$2201.length) {
                        var restMatch$2213 = matchPatterns$2142(patterns$2201.slice(i$2212 + 1), rest$2209, env$2203, topLevel$2204);
                        if (restMatch$2213.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2207 = matchPattern$2143(pattern$2208, [], env$2203, patternEnv$2206);
                            patternEnv$2206 = _$2117.extend(restMatch$2213.patternEnv, match$2207.patternEnv);
                            rest$2209 = restMatch$2213.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2208.repeat && pattern$2208.leading && pattern$2208.separator !== ' ') {
                        if (rest$2209[0].token.value === pattern$2208.separator) {
                            if (!inLeading$2211) {
                                inLeading$2211 = true;
                            }
                            rest$2209 = rest$2209.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2211) {
                                success$2210 = false;
                                break;
                            }
                        }
                    }
                    match$2207 = matchPattern$2143(pattern$2208, rest$2209, env$2203, patternEnv$2206);
                    if (!match$2207.success && pattern$2208.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2207.success) {
                        success$2210 = false;
                        break;
                    }
                    rest$2209 = match$2207.rest;
                    patternEnv$2206 = match$2207.patternEnv;
                    if (success$2210 && !(topLevel$2204 || pattern$2208.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2212 == patterns$2201.length - 1 && rest$2209.length !== 0) {
                            success$2210 = false;
                            break;
                        }
                    }
                    if (pattern$2208.repeat && !pattern$2208.leading && success$2210) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2208.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2209[0] && rest$2209[0].token.value === pattern$2208.separator) {
                            // more tokens and the next token matches the separator
                            rest$2209 = rest$2209.slice(1);
                        } else if (pattern$2208.separator !== ' ' && rest$2209.length > 0 && i$2212 === patterns$2201.length - 1 && topLevel$2204 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2210 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2208.repeat && success$2210 && rest$2209.length > 0);
            }
        var result$2205;
        if (success$2210) {
            result$2205 = rest$2209.length ? stx$2202.slice(0, -rest$2209.length) : stx$2202;
        } else {
            result$2205 = [];
        }
        return {
            success: success$2210,
            result: result$2205,
            rest: rest$2209,
            patternEnv: patternEnv$2206
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
    function matchPattern$2143(pattern$2214, stx$2215, env$2216, patternEnv$2217) {
        var subMatch$2218;
        var match$2219, matchEnv$2220;
        var rest$2221;
        var success$2222;
        if (typeof pattern$2214.inner !== 'undefined') {
            if (pattern$2214.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2218 = matchPatterns$2142(pattern$2214.inner, stx$2215, env$2216, true);
                rest$2221 = subMatch$2218.rest;
            } else if (stx$2215[0] && stx$2215[0].token.type === parser$2119.Token.Delimiter && stx$2215[0].token.value === pattern$2214.value) {
                stx$2215[0].expose();
                if (pattern$2214.inner.length === 0 && stx$2215[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2215,
                        patternEnv: patternEnv$2217
                    };
                }
                subMatch$2218 = matchPatterns$2142(pattern$2214.inner, stx$2215[0].token.inner, env$2216, false);
                rest$2221 = stx$2215.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2215,
                    patternEnv: patternEnv$2217
                };
            }
            success$2222 = subMatch$2218.success;
            // merge the subpattern matches with the current pattern environment
            _$2117.keys(subMatch$2218.patternEnv).forEach(function (patternKey$2223) {
                if (pattern$2214.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2224 = subMatch$2218.patternEnv[patternKey$2223].level + 1;
                    if (patternEnv$2217[patternKey$2223]) {
                        patternEnv$2217[patternKey$2223].level = nextLevel$2224;
                        patternEnv$2217[patternKey$2223].match.push(subMatch$2218.patternEnv[patternKey$2223]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2217[patternKey$2223] = {
                            level: nextLevel$2224,
                            match: [subMatch$2218.patternEnv[patternKey$2223]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2217[patternKey$2223] = subMatch$2218.patternEnv[patternKey$2223];
                }
            });
        } else {
            if (pattern$2214.class === 'pattern_literal') {
                // wildcard
                if (stx$2215[0] && pattern$2214.value === '_') {
                    success$2222 = true;
                    rest$2221 = stx$2215.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2215[0] && pattern$2214.value === stx$2215[0].token.value) {
                    success$2222 = true;
                    rest$2221 = stx$2215.slice(1);
                } else {
                    success$2222 = false;
                    rest$2221 = stx$2215;
                }
            } else {
                match$2219 = matchPatternClass$2141(pattern$2214.class, stx$2215, env$2216);
                success$2222 = match$2219.result !== null;
                rest$2221 = match$2219.rest;
                matchEnv$2220 = {
                    level: 0,
                    match: match$2219.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2214.repeat) {
                    if (patternEnv$2217[pattern$2214.value] && success$2222) {
                        patternEnv$2217[pattern$2214.value].match.push(matchEnv$2220);
                    } else if (patternEnv$2217[pattern$2214.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2217[pattern$2214.value] = {
                            level: 1,
                            match: [matchEnv$2220]
                        };
                    }
                } else {
                    patternEnv$2217[pattern$2214.value] = matchEnv$2220;
                }
            }
        }
        return {
            success: success$2222,
            rest: rest$2221,
            patternEnv: patternEnv$2217
        };
    }
    function matchLookbehind$2144(patterns$2225, stx$2226, terms$2227, env$2228) {
        var success$2229, patternEnv$2230, prevStx$2231, prevTerms$2232;
        // No lookbehind, noop.
        if (!patterns$2225.length) {
            success$2229 = true;
            patternEnv$2230 = {};
            prevStx$2231 = stx$2226;
            prevTerms$2232 = terms$2227;
        } else {
            var match$2233 = matchPatterns$2142(patterns$2225, stx$2226, env$2228, true);
            var last$2234 = match$2233.result[match$2233.result.length - 1];
            success$2229 = match$2233.success;
            patternEnv$2230 = match$2233.patternEnv;
            if (success$2229) {
                if (match$2233.rest.length) {
                    if (last$2234 && last$2234.term === match$2233.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2229 = false;
                    } else {
                        prevStx$2231 = match$2233.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2235 = 0, len$2236 = terms$2227.length; i$2235 < len$2236; i$2235++) {
                            if (terms$2227[i$2235] === prevStx$2231[0].term) {
                                prevTerms$2232 = terms$2227.slice(i$2235);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2232 = [];
                    prevStx$2231 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2117.forEach(patternEnv$2230, function (val$2237, key$2238) {
            if (val$2237.level && val$2237.match) {
                val$2237.match.reverse();
            }
        });
        return {
            success: success$2229,
            patternEnv: patternEnv$2230,
            prevStx: prevStx$2231,
            prevTerms: prevTerms$2232
        };
    }
    function hasMatch$2145(m$2239) {
        if (m$2239.level === 0) {
            return m$2239.match.length > 0;
        }
        return m$2239.match.every(function (m$2240) {
            return hasMatch$2145(m$2240);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2146(macroBody$2241, macroNameStx$2242, env$2243) {
        return _$2117.chain(macroBody$2241).reduce(function (acc$2244, bodyStx$2245, idx$2246, original$2247) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2248 = original$2247[idx$2246 - 1];
            var next$2249 = original$2247[idx$2246 + 1];
            var nextNext$2250 = original$2247[idx$2246 + 2];
            // drop `...`
            if (bodyStx$2245.token.value === '...') {
                return acc$2244;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2132(bodyStx$2245) && next$2249 && next$2249.token.value === '...') {
                return acc$2244;
            }
            // skip the $ in $(...)
            if (bodyStx$2245.token.value === '$' && next$2249 && next$2249.token.type === parser$2119.Token.Delimiter && next$2249.token.value === '()') {
                return acc$2244;
            }
            // mark $[...] as a literal
            if (bodyStx$2245.token.value === '$' && next$2249 && next$2249.token.type === parser$2119.Token.Delimiter && next$2249.token.value === '[]') {
                next$2249.literal = true;
                return acc$2244;
            }
            if (bodyStx$2245.token.type === parser$2119.Token.Delimiter && bodyStx$2245.token.value === '()' && last$2248 && last$2248.token.value === '$') {
                bodyStx$2245.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2245.literal === true) {
                assert$2127(bodyStx$2245.token.type === parser$2119.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2244.concat(bodyStx$2245.token.inner);
            }
            if (next$2249 && next$2249.token.value === '...') {
                bodyStx$2245.repeat = true;
                bodyStx$2245.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2132(next$2249) && nextNext$2250 && nextNext$2250.token.value === '...') {
                bodyStx$2245.repeat = true;
                bodyStx$2245.separator = next$2249.token.inner[0].token.value;
            }
            return acc$2244.concat(bodyStx$2245);
        }, []).reduce(function (acc$2251, bodyStx$2252, idx$2253) {
            // then do the actual transcription
            if (bodyStx$2252.repeat) {
                if (bodyStx$2252.token.type === parser$2119.Token.Delimiter) {
                    bodyStx$2252.expose();
                    var fv$2254 = _$2117.filter(freeVarsInPattern$2129(bodyStx$2252.token.inner), function (pat$2261) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2243.hasOwnProperty(pat$2261);
                        });
                    var restrictedEnv$2255 = [];
                    var nonScalar$2256 = _$2117.find(fv$2254, function (pat$2262) {
                            return env$2243[pat$2262].level > 0;
                        });
                    assert$2127(typeof nonScalar$2256 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2257 = env$2243[nonScalar$2256].match.length;
                    var sameLength$2258 = _$2117.all(fv$2254, function (pat$2263) {
                            return env$2243[pat$2263].level === 0 || env$2243[pat$2263].match.length === repeatLength$2257;
                        });
                    assert$2127(sameLength$2258, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2117.each(_$2117.range(repeatLength$2257), function (idx$2264) {
                        var renv$2265 = {};
                        _$2117.each(fv$2254, function (pat$2267) {
                            if (env$2243[pat$2267].level === 0) {
                                // copy scalars over
                                renv$2265[pat$2267] = env$2243[pat$2267];
                            } else {
                                // grab the match at this index 
                                renv$2265[pat$2267] = env$2243[pat$2267].match[idx$2264];
                            }
                        });
                        var allHaveMatch$2266 = Object.keys(renv$2265).every(function (pat$2268) {
                                return hasMatch$2145(renv$2265[pat$2268]);
                            });
                        if (allHaveMatch$2266) {
                            restrictedEnv$2255.push(renv$2265);
                        }
                    });
                    var transcribed$2259 = _$2117.map(restrictedEnv$2255, function (renv$2269) {
                            if (bodyStx$2252.group) {
                                return transcribe$2146(bodyStx$2252.token.inner, macroNameStx$2242, renv$2269);
                            } else {
                                var newBody$2270 = syntaxFromToken$2123(_$2117.clone(bodyStx$2252.token), bodyStx$2252);
                                newBody$2270.token.inner = transcribe$2146(bodyStx$2252.token.inner, macroNameStx$2242, renv$2269);
                                return newBody$2270;
                            }
                        });
                    var joined$2260;
                    if (bodyStx$2252.group) {
                        joined$2260 = joinSyntaxArr$2126(transcribed$2259, bodyStx$2252.separator);
                    } else {
                        joined$2260 = joinSyntax$2125(transcribed$2259, bodyStx$2252.separator);
                    }
                    return acc$2251.concat(joined$2260);
                }
                if (!env$2243[bodyStx$2252.token.value]) {
                    throwSyntaxError$2128('patterns', 'The pattern variable is not bound for the template', bodyStx$2252);
                } else if (env$2243[bodyStx$2252.token.value].level !== 1) {
                    throwSyntaxError$2128('patterns', 'Ellipses level does not match in the template', bodyStx$2252);
                }
                return acc$2251.concat(joinRepeatedMatch$2134(env$2243[bodyStx$2252.token.value].match, bodyStx$2252.separator));
            } else {
                if (bodyStx$2252.token.type === parser$2119.Token.Delimiter) {
                    bodyStx$2252.expose();
                    var newBody$2271 = syntaxFromToken$2123(_$2117.clone(bodyStx$2252.token), macroBody$2241);
                    newBody$2271.token.inner = transcribe$2146(bodyStx$2252.token.inner, macroNameStx$2242, env$2243);
                    return acc$2251.concat([newBody$2271]);
                }
                if (isPatternVar$2133(bodyStx$2252) && Object.prototype.hasOwnProperty.bind(env$2243)(bodyStx$2252.token.value)) {
                    if (!env$2243[bodyStx$2252.token.value]) {
                        throwSyntaxError$2128('patterns', 'The pattern variable is not bound for the template', bodyStx$2252);
                    } else if (env$2243[bodyStx$2252.token.value].level !== 0) {
                        throwSyntaxError$2128('patterns', 'Ellipses level does not match in the template', bodyStx$2252);
                    }
                    return acc$2251.concat(takeLineContext$2135(bodyStx$2252, env$2243[bodyStx$2252.token.value].match));
                }
                return acc$2251.concat([bodyStx$2252]);
            }
        }, []).value();
    }
    exports$2116.loadPattern = loadPattern$2139;
    exports$2116.matchPatterns = matchPatterns$2142;
    exports$2116.matchLookbehind = matchLookbehind$2144;
    exports$2116.transcribe = transcribe$2146;
    exports$2116.matchPatternClass = matchPatternClass$2141;
    exports$2116.takeLineContext = takeLineContext$2135;
    exports$2116.takeLine = takeLine$2136;
}));
//# sourceMappingURL=patterns.js.map