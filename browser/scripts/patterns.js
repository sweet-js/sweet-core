(function (root$2121, factory$2122) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2122(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2122);
    }
}(this, function (exports$2123, _$2124, es6$2125, parser$2126, expander$2127, syntax$2128) {
    var get_expression$2129 = expander$2127.get_expression;
    var syntaxFromToken$2130 = syntax$2128.syntaxFromToken;
    var makePunc$2131 = syntax$2128.makePunc;
    var joinSyntax$2132 = syntax$2128.joinSyntax;
    var joinSyntaxArr$2133 = syntax$2128.joinSyntaxArr;
    var assert$2134 = syntax$2128.assert;
    var throwSyntaxError$2135 = syntax$2128.throwSyntaxError;
    var push$2136 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2137(pattern$2155) {
        var fv$2156 = [];
        _$2124.each(pattern$2155, function (pat$2157) {
            if (isPatternVar$2141(pat$2157)) {
                fv$2156.push(pat$2157.token.value);
            } else if (pat$2157.token.type === parser$2126.Token.Delimiter) {
                push$2136.apply(fv$2156, freeVarsInPattern$2137(pat$2157.token.inner));
            }
        });
        return fv$2156;
    }
    function typeIsLiteral$2138(type$2158) {
        return type$2158 === parser$2126.Token.NullLiteral || type$2158 === parser$2126.Token.NumericLiteral || type$2158 === parser$2126.Token.StringLiteral || type$2158 === parser$2126.Token.RegexLiteral || type$2158 === parser$2126.Token.BooleanLiteral;
    }
    function containsPatternVar$2139(patterns$2159) {
        return _$2124.any(patterns$2159, function (pat$2160) {
            if (pat$2160.token.type === parser$2126.Token.Delimiter) {
                return containsPatternVar$2139(pat$2160.token.inner);
            }
            return isPatternVar$2141(pat$2160);
        });
    }
    function delimIsSeparator$2140(delim$2161) {
        return delim$2161 && delim$2161.token && delim$2161.token.type === parser$2126.Token.Delimiter && delim$2161.token.value === '()' && delim$2161.token.inner.length === 1 && delim$2161.token.inner[0].token.type !== parser$2126.Token.Delimiter && !containsPatternVar$2139(delim$2161.token.inner);
    }
    function isPatternVar$2141(stx$2162) {
        return stx$2162.token.value[0] === '$' && stx$2162.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2142(tojoin$2163, punc$2164) {
        return _$2124.reduce(_$2124.rest(tojoin$2163, 1), function (acc$2165, join$2166) {
            if (punc$2164 === ' ') {
                return acc$2165.concat(join$2166.match);
            }
            return acc$2165.concat(makePunc$2131(punc$2164, _$2124.first(join$2166.match)), join$2166.match);
        }, _$2124.first(tojoin$2163).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2143(from$2167, to$2168) {
        return _$2124.map(to$2168, function (stx$2169) {
            return takeLine$2144(from$2167, stx$2169);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2144(from$2170, to$2171) {
        var next$2172;
        if (to$2171.token.type === parser$2126.Token.Delimiter) {
            if (from$2170.token.type === parser$2126.Token.Delimiter) {
                next$2172 = syntaxFromToken$2130({
                    type: parser$2126.Token.Delimiter,
                    value: to$2171.token.value,
                    inner: takeLineContext$2143(from$2170, to$2171.token.inner),
                    startRange: from$2170.token.startRange,
                    endRange: from$2170.token.endRange,
                    startLineNumber: from$2170.token.startLineNumber,
                    startLineStart: from$2170.token.startLineStart,
                    endLineNumber: from$2170.token.endLineNumber,
                    endLineStart: from$2170.token.endLineStart,
                    sm_startLineNumber: to$2171.token.startLineNumber,
                    sm_endLineNumber: to$2171.token.endLineNumber,
                    sm_startLineStart: to$2171.token.startLineStart,
                    sm_endLineStart: to$2171.token.endLineStart,
                    sm_startRange: to$2171.token.startRange,
                    sm_endRange: to$2171.token.endRange
                }, to$2171);
            } else {
                next$2172 = syntaxFromToken$2130({
                    type: parser$2126.Token.Delimiter,
                    value: to$2171.token.value,
                    inner: takeLineContext$2143(from$2170, to$2171.token.inner),
                    startRange: from$2170.token.range,
                    endRange: from$2170.token.range,
                    startLineNumber: from$2170.token.lineNumber,
                    startLineStart: from$2170.token.lineStart,
                    endLineNumber: from$2170.token.lineNumber,
                    endLineStart: from$2170.token.lineStart,
                    sm_startLineNumber: to$2171.token.startLineNumber,
                    sm_endLineNumber: to$2171.token.endLineNumber,
                    sm_startLineStart: to$2171.token.startLineStart,
                    sm_endLineStart: to$2171.token.endLineStart,
                    sm_startRange: to$2171.token.startRange,
                    sm_endRange: to$2171.token.endRange
                }, to$2171);
            }
        } else {
            if (from$2170.token.type === parser$2126.Token.Delimiter) {
                next$2172 = syntaxFromToken$2130({
                    value: to$2171.token.value,
                    type: to$2171.token.type,
                    lineNumber: from$2170.token.startLineNumber,
                    lineStart: from$2170.token.startLineStart,
                    range: from$2170.token.startRange,
                    sm_lineNumber: to$2171.token.lineNumber,
                    sm_lineStart: to$2171.token.lineStart,
                    sm_range: to$2171.token.range
                }, to$2171);
            } else {
                next$2172 = syntaxFromToken$2130({
                    value: to$2171.token.value,
                    type: to$2171.token.type,
                    lineNumber: from$2170.token.lineNumber,
                    lineStart: from$2170.token.lineStart,
                    range: from$2170.token.range,
                    sm_lineNumber: to$2171.token.lineNumber,
                    sm_lineStart: to$2171.token.lineStart,
                    sm_range: to$2171.token.range
                }, to$2171);
            }
        }
        if (to$2171.token.leadingComments) {
            next$2172.token.leadingComments = to$2171.token.leadingComments;
        }
        if (to$2171.token.trailingComments) {
            next$2172.token.trailingComments = to$2171.token.trailingComments;
        }
        return next$2172;
    }
    function reversePattern$2145(patterns$2173) {
        var len$2174 = patterns$2173.length;
        var pat$2175;
        return _$2124.reduceRight(patterns$2173, function (acc$2176, pat$2175) {
            if (pat$2175.class === 'pattern_group') {
                pat$2175.token.inner = reversePattern$2145(pat$2175.token.inner);
            }
            if (pat$2175.repeat) {
                pat$2175.leading = !pat$2175.leading;
            }
            acc$2176.push(pat$2175);
            return acc$2176;
        }, []);
    }
    function loadLiteralGroup$2146(patterns$2178) {
        _$2124.forEach(patterns$2178, function (patStx$2179) {
            if (patStx$2179.token.type === parser$2126.Token.Delimiter) {
                patStx$2179.token.inner = loadLiteralGroup$2146(patStx$2179.token.inner);
            } else {
                patStx$2179.class = 'pattern_literal';
            }
        });
        return patterns$2178;
    }
    function loadPattern$2147(patterns$2180, reverse$2181) {
        var patts$2182 = _$2124.chain(patterns$2180).reduce(function (acc$2183, patStx$2184, idx$2185) {
                var last$2186 = patterns$2180[idx$2185 - 1];
                var lastLast$2187 = patterns$2180[idx$2185 - 2];
                var next$2188 = patterns$2180[idx$2185 + 1];
                var nextNext$2189 = patterns$2180[idx$2185 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2184.token.value === ':') {
                    if (last$2186 && isPatternVar$2141(last$2186) && !isPatternVar$2141(next$2188)) {
                        return acc$2183;
                    }
                }
                if (last$2186 && last$2186.token.value === ':') {
                    if (lastLast$2187 && isPatternVar$2141(lastLast$2187) && !isPatternVar$2141(patStx$2184)) {
                        return acc$2183;
                    }
                }
                // skip over $
                if (patStx$2184.token.value === '$' && next$2188 && next$2188.token.type === parser$2126.Token.Delimiter) {
                    return acc$2183;
                }
                if (isPatternVar$2141(patStx$2184)) {
                    if (next$2188 && next$2188.token.value === ':' && !isPatternVar$2141(nextNext$2189)) {
                        if (typeof nextNext$2189 === 'undefined') {
                            throwSyntaxError$2135('patterns', 'expecting a pattern class following a `:`', next$2188);
                        }
                        patStx$2184.class = nextNext$2189.token.value;
                    } else {
                        patStx$2184.class = 'token';
                    }
                } else if (patStx$2184.token.type === parser$2126.Token.Delimiter) {
                    if (last$2186 && last$2186.token.value === '$') {
                        patStx$2184.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2184.class === 'pattern_group' && patStx$2184.token.value === '[]') {
                        patStx$2184.token.inner = loadLiteralGroup$2146(patStx$2184.token.inner);
                    } else {
                        patStx$2184.token.inner = loadPattern$2147(patStx$2184.token.inner);
                    }
                } else {
                    patStx$2184.class = 'pattern_literal';
                }
                acc$2183.push(patStx$2184);
                return acc$2183;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2190, patStx$2191, idx$2192, patterns$2193) {
                var separator$2194 = patStx$2191.separator || ' ';
                var repeat$2195 = patStx$2191.repeat || false;
                var next$2196 = patterns$2193[idx$2192 + 1];
                var nextNext$2197 = patterns$2193[idx$2192 + 2];
                if (next$2196 && next$2196.token.value === '...') {
                    repeat$2195 = true;
                    separator$2194 = ' ';
                } else if (delimIsSeparator$2140(next$2196) && nextNext$2197 && nextNext$2197.token.value === '...') {
                    repeat$2195 = true;
                    assert$2134(next$2196.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2194 = next$2196.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2191.token.value === '...' || delimIsSeparator$2140(patStx$2191) && next$2196 && next$2196.token.value === '...') {
                    return acc$2190;
                }
                patStx$2191.repeat = repeat$2195;
                patStx$2191.separator = separator$2194;
                acc$2190.push(patStx$2191);
                return acc$2190;
            }, []).value();
        return reverse$2181 ? reversePattern$2145(patts$2182) : patts$2182;
    }
    function cachedTermMatch$2148(stx$2198, term$2199) {
        var res$2200 = [];
        var i$2201 = 0;
        while (stx$2198[i$2201] && stx$2198[i$2201].term === term$2199) {
            res$2200.unshift(stx$2198[i$2201]);
            i$2201++;
        }
        return {
            result: term$2199,
            destructed: res$2200,
            rest: stx$2198.slice(res$2200.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2149(patternClass$2202, stx$2203, env$2204) {
        var result$2205, rest$2206, match$2207;
        // pattern has no parse class
        if (patternClass$2202 === 'token' && stx$2203[0] && stx$2203[0].token.type !== parser$2126.Token.EOF) {
            result$2205 = [stx$2203[0]];
            rest$2206 = stx$2203.slice(1);
        } else if (patternClass$2202 === 'lit' && stx$2203[0] && typeIsLiteral$2138(stx$2203[0].token.type)) {
            result$2205 = [stx$2203[0]];
            rest$2206 = stx$2203.slice(1);
        } else if (patternClass$2202 === 'ident' && stx$2203[0] && stx$2203[0].token.type === parser$2126.Token.Identifier) {
            result$2205 = [stx$2203[0]];
            rest$2206 = stx$2203.slice(1);
        } else if (stx$2203.length > 0 && patternClass$2202 === 'VariableStatement') {
            match$2207 = stx$2203[0].term ? cachedTermMatch$2148(stx$2203, stx$2203[0].term) : expander$2127.enforest(stx$2203, expander$2127.makeExpanderContext({ env: env$2204 }));
            if (match$2207.result && match$2207.result.hasPrototype(expander$2127.VariableStatement)) {
                result$2205 = match$2207.destructed || match$2207.result.destruct(false);
                rest$2206 = match$2207.rest;
            } else {
                result$2205 = null;
                rest$2206 = stx$2203;
            }
        } else if (stx$2203.length > 0 && patternClass$2202 === 'expr') {
            match$2207 = stx$2203[0].term ? cachedTermMatch$2148(stx$2203, stx$2203[0].term) : expander$2127.get_expression(stx$2203, expander$2127.makeExpanderContext({ env: env$2204 }));
            if (match$2207.result === null || !match$2207.result.hasPrototype(expander$2127.Expr)) {
                result$2205 = null;
                rest$2206 = stx$2203;
            } else {
                result$2205 = match$2207.destructed || match$2207.result.destruct(false);
                rest$2206 = match$2207.rest;
            }
        } else {
            result$2205 = null;
            rest$2206 = stx$2203;
        }
        return {
            result: result$2205,
            rest: rest$2206
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2150(patterns$2208, stx$2209, env$2210, topLevel$2211) {
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
        topLevel$2211 = topLevel$2211 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2212 = [];
        var patternEnv$2213 = {};
        var match$2214;
        var pattern$2215;
        var rest$2216 = stx$2209;
        var success$2217 = true;
        var inLeading$2218;
        patternLoop:
            for (var i$2219 = 0; i$2219 < patterns$2208.length; i$2219++) {
                if (success$2217 === false) {
                    break;
                }
                pattern$2215 = patterns$2208[i$2219];
                inLeading$2218 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2215.repeat && i$2219 + 1 < patterns$2208.length) {
                        var restMatch$2220 = matchPatterns$2150(patterns$2208.slice(i$2219 + 1), rest$2216, env$2210, topLevel$2211);
                        if (restMatch$2220.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2214 = matchPattern$2151(pattern$2215, [], env$2210, patternEnv$2213);
                            patternEnv$2213 = _$2124.extend(restMatch$2220.patternEnv, match$2214.patternEnv);
                            rest$2216 = restMatch$2220.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2215.repeat && pattern$2215.leading && pattern$2215.separator !== ' ') {
                        if (rest$2216[0].token.value === pattern$2215.separator) {
                            if (!inLeading$2218) {
                                inLeading$2218 = true;
                            }
                            rest$2216 = rest$2216.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2218) {
                                success$2217 = false;
                                break;
                            }
                        }
                    }
                    match$2214 = matchPattern$2151(pattern$2215, rest$2216, env$2210, patternEnv$2213);
                    if (!match$2214.success && pattern$2215.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2214.success) {
                        success$2217 = false;
                        break;
                    }
                    rest$2216 = match$2214.rest;
                    patternEnv$2213 = match$2214.patternEnv;
                    if (success$2217 && !(topLevel$2211 || pattern$2215.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2219 == patterns$2208.length - 1 && rest$2216.length !== 0) {
                            success$2217 = false;
                            break;
                        }
                    }
                    if (pattern$2215.repeat && !pattern$2215.leading && success$2217) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2215.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2216[0] && rest$2216[0].token.value === pattern$2215.separator) {
                            // more tokens and the next token matches the separator
                            rest$2216 = rest$2216.slice(1);
                        } else if (pattern$2215.separator !== ' ' && rest$2216.length > 0 && i$2219 === patterns$2208.length - 1 && topLevel$2211 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2217 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2215.repeat && success$2217 && rest$2216.length > 0);
            }
        var result$2212;
        if (success$2217) {
            result$2212 = rest$2216.length ? stx$2209.slice(0, -rest$2216.length) : stx$2209;
        } else {
            result$2212 = [];
        }
        return {
            success: success$2217,
            result: result$2212,
            rest: rest$2216,
            patternEnv: patternEnv$2213
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
    function matchPattern$2151(pattern$2221, stx$2222, env$2223, patternEnv$2224) {
        var subMatch$2225;
        var match$2226, matchEnv$2227;
        var rest$2228;
        var success$2229;
        if (typeof pattern$2221.inner !== 'undefined') {
            if (pattern$2221.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2225 = matchPatterns$2150(pattern$2221.inner, stx$2222, env$2223, true);
                rest$2228 = subMatch$2225.rest;
            } else if (stx$2222[0] && stx$2222[0].token.type === parser$2126.Token.Delimiter && stx$2222[0].token.value === pattern$2221.value) {
                stx$2222[0].expose();
                if (pattern$2221.inner.length === 0 && stx$2222[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2222,
                        patternEnv: patternEnv$2224
                    };
                }
                subMatch$2225 = matchPatterns$2150(pattern$2221.inner, stx$2222[0].token.inner, env$2223, false);
                rest$2228 = stx$2222.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2222,
                    patternEnv: patternEnv$2224
                };
            }
            success$2229 = subMatch$2225.success;
            // merge the subpattern matches with the current pattern environment
            _$2124.keys(subMatch$2225.patternEnv).forEach(function (patternKey$2230) {
                if (pattern$2221.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2231 = subMatch$2225.patternEnv[patternKey$2230].level + 1;
                    if (patternEnv$2224[patternKey$2230]) {
                        patternEnv$2224[patternKey$2230].level = nextLevel$2231;
                        patternEnv$2224[patternKey$2230].match.push(subMatch$2225.patternEnv[patternKey$2230]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2224[patternKey$2230] = {
                            level: nextLevel$2231,
                            match: [subMatch$2225.patternEnv[patternKey$2230]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2224[patternKey$2230] = subMatch$2225.patternEnv[patternKey$2230];
                }
            });
        } else {
            if (pattern$2221.class === 'pattern_literal') {
                // wildcard
                if (stx$2222[0] && pattern$2221.value === '_') {
                    success$2229 = true;
                    rest$2228 = stx$2222.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2222[0] && pattern$2221.value === stx$2222[0].token.value) {
                    success$2229 = true;
                    rest$2228 = stx$2222.slice(1);
                } else {
                    success$2229 = false;
                    rest$2228 = stx$2222;
                }
            } else {
                match$2226 = matchPatternClass$2149(pattern$2221.class, stx$2222, env$2223);
                success$2229 = match$2226.result !== null;
                rest$2228 = match$2226.rest;
                matchEnv$2227 = {
                    level: 0,
                    match: match$2226.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2221.repeat) {
                    if (patternEnv$2224[pattern$2221.value] && success$2229) {
                        patternEnv$2224[pattern$2221.value].match.push(matchEnv$2227);
                    } else if (patternEnv$2224[pattern$2221.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2224[pattern$2221.value] = {
                            level: 1,
                            match: [matchEnv$2227]
                        };
                    }
                } else {
                    patternEnv$2224[pattern$2221.value] = matchEnv$2227;
                }
            }
        }
        return {
            success: success$2229,
            rest: rest$2228,
            patternEnv: patternEnv$2224
        };
    }
    function matchLookbehind$2152(patterns$2232, stx$2233, terms$2234, env$2235) {
        var success$2236, patternEnv$2237, prevStx$2238, prevTerms$2239;
        // No lookbehind, noop.
        if (!patterns$2232.length) {
            success$2236 = true;
            patternEnv$2237 = {};
            prevStx$2238 = stx$2233;
            prevTerms$2239 = terms$2234;
        } else {
            var match$2240 = matchPatterns$2150(patterns$2232, stx$2233, env$2235, true);
            var last$2241 = match$2240.result[match$2240.result.length - 1];
            success$2236 = match$2240.success;
            patternEnv$2237 = match$2240.patternEnv;
            if (success$2236) {
                if (match$2240.rest.length) {
                    if (last$2241 && last$2241.term === match$2240.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2236 = false;
                    } else {
                        prevStx$2238 = match$2240.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2242 = 0, len$2243 = terms$2234.length; i$2242 < len$2243; i$2242++) {
                            if (terms$2234[i$2242] === prevStx$2238[0].term) {
                                prevTerms$2239 = terms$2234.slice(i$2242);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2239 = [];
                    prevStx$2238 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2124.forEach(patternEnv$2237, function (val$2244, key$2245) {
            if (val$2244.level && val$2244.match) {
                val$2244.match.reverse();
            }
        });
        return {
            success: success$2236,
            patternEnv: patternEnv$2237,
            prevStx: prevStx$2238,
            prevTerms: prevTerms$2239
        };
    }
    function hasMatch$2153(m$2246) {
        if (m$2246.level === 0) {
            return m$2246.match.length > 0;
        }
        return m$2246.match.every(function (m$2247) {
            return hasMatch$2153(m$2247);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2154(macroBody$2248, macroNameStx$2249, env$2250) {
        return _$2124.chain(macroBody$2248).reduce(function (acc$2251, bodyStx$2252, idx$2253, original$2254) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2255 = original$2254[idx$2253 - 1];
            var next$2256 = original$2254[idx$2253 + 1];
            var nextNext$2257 = original$2254[idx$2253 + 2];
            // drop `...`
            if (bodyStx$2252.token.value === '...') {
                return acc$2251;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2140(bodyStx$2252) && next$2256 && next$2256.token.value === '...') {
                return acc$2251;
            }
            // skip the $ in $(...)
            if (bodyStx$2252.token.value === '$' && next$2256 && next$2256.token.type === parser$2126.Token.Delimiter && next$2256.token.value === '()') {
                return acc$2251;
            }
            // mark $[...] as a literal
            if (bodyStx$2252.token.value === '$' && next$2256 && next$2256.token.type === parser$2126.Token.Delimiter && next$2256.token.value === '[]') {
                next$2256.literal = true;
                return acc$2251;
            }
            if (bodyStx$2252.token.type === parser$2126.Token.Delimiter && bodyStx$2252.token.value === '()' && last$2255 && last$2255.token.value === '$') {
                bodyStx$2252.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2252.literal === true) {
                assert$2134(bodyStx$2252.token.type === parser$2126.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2251.concat(bodyStx$2252.token.inner);
            }
            if (next$2256 && next$2256.token.value === '...') {
                bodyStx$2252.repeat = true;
                bodyStx$2252.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2140(next$2256) && nextNext$2257 && nextNext$2257.token.value === '...') {
                bodyStx$2252.repeat = true;
                bodyStx$2252.separator = next$2256.token.inner[0].token.value;
            }
            acc$2251.push(bodyStx$2252);
            return acc$2251;
        }, []).reduce(function (acc$2258, bodyStx$2259, idx$2260) {
            // then do the actual transcription
            if (bodyStx$2259.repeat) {
                if (bodyStx$2259.token.type === parser$2126.Token.Delimiter) {
                    bodyStx$2259.expose();
                    var fv$2261 = _$2124.filter(freeVarsInPattern$2137(bodyStx$2259.token.inner), function (pat$2268) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2250.hasOwnProperty(pat$2268);
                        });
                    var restrictedEnv$2262 = [];
                    var nonScalar$2263 = _$2124.find(fv$2261, function (pat$2269) {
                            return env$2250[pat$2269].level > 0;
                        });
                    assert$2134(typeof nonScalar$2263 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2264 = env$2250[nonScalar$2263].match.length;
                    var sameLength$2265 = _$2124.all(fv$2261, function (pat$2270) {
                            return env$2250[pat$2270].level === 0 || env$2250[pat$2270].match.length === repeatLength$2264;
                        });
                    assert$2134(sameLength$2265, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2124.each(_$2124.range(repeatLength$2264), function (idx$2271) {
                        var renv$2272 = {};
                        _$2124.each(fv$2261, function (pat$2274) {
                            if (env$2250[pat$2274].level === 0) {
                                // copy scalars over
                                renv$2272[pat$2274] = env$2250[pat$2274];
                            } else {
                                // grab the match at this index 
                                renv$2272[pat$2274] = env$2250[pat$2274].match[idx$2271];
                            }
                        });
                        var allHaveMatch$2273 = Object.keys(renv$2272).every(function (pat$2275) {
                                return hasMatch$2153(renv$2272[pat$2275]);
                            });
                        if (allHaveMatch$2273) {
                            restrictedEnv$2262.push(renv$2272);
                        }
                    });
                    var transcribed$2266 = _$2124.map(restrictedEnv$2262, function (renv$2276) {
                            if (bodyStx$2259.group) {
                                return transcribe$2154(bodyStx$2259.token.inner, macroNameStx$2249, renv$2276);
                            } else {
                                var newBody$2277 = syntaxFromToken$2130(_$2124.clone(bodyStx$2259.token), bodyStx$2259);
                                newBody$2277.token.inner = transcribe$2154(bodyStx$2259.token.inner, macroNameStx$2249, renv$2276);
                                return newBody$2277;
                            }
                        });
                    var joined$2267;
                    if (bodyStx$2259.group) {
                        joined$2267 = joinSyntaxArr$2133(transcribed$2266, bodyStx$2259.separator);
                    } else {
                        joined$2267 = joinSyntax$2132(transcribed$2266, bodyStx$2259.separator);
                    }
                    push$2136.apply(acc$2258, joined$2267);
                    return acc$2258;
                }
                if (!env$2250[bodyStx$2259.token.value]) {
                    throwSyntaxError$2135('patterns', 'The pattern variable is not bound for the template', bodyStx$2259);
                } else if (env$2250[bodyStx$2259.token.value].level !== 1) {
                    throwSyntaxError$2135('patterns', 'Ellipses level does not match in the template', bodyStx$2259);
                }
                push$2136.apply(acc$2258, joinRepeatedMatch$2142(env$2250[bodyStx$2259.token.value].match, bodyStx$2259.separator));
                return acc$2258;
            } else {
                if (bodyStx$2259.token.type === parser$2126.Token.Delimiter) {
                    bodyStx$2259.expose();
                    var newBody$2278 = syntaxFromToken$2130(_$2124.clone(bodyStx$2259.token), macroBody$2248);
                    newBody$2278.token.inner = transcribe$2154(bodyStx$2259.token.inner, macroNameStx$2249, env$2250);
                    acc$2258.push(newBody$2278);
                    return acc$2258;
                }
                if (isPatternVar$2141(bodyStx$2259) && Object.prototype.hasOwnProperty.bind(env$2250)(bodyStx$2259.token.value)) {
                    if (!env$2250[bodyStx$2259.token.value]) {
                        throwSyntaxError$2135('patterns', 'The pattern variable is not bound for the template', bodyStx$2259);
                    } else if (env$2250[bodyStx$2259.token.value].level !== 0) {
                        throwSyntaxError$2135('patterns', 'Ellipses level does not match in the template', bodyStx$2259);
                    }
                    push$2136.apply(acc$2258, takeLineContext$2143(bodyStx$2259, env$2250[bodyStx$2259.token.value].match));
                    return acc$2258;
                }
                acc$2258.push(bodyStx$2259);
                return acc$2258;
            }
        }, []).value();
    }
    exports$2123.loadPattern = loadPattern$2147;
    exports$2123.matchPatterns = matchPatterns$2150;
    exports$2123.matchLookbehind = matchLookbehind$2152;
    exports$2123.transcribe = transcribe$2154;
    exports$2123.matchPatternClass = matchPatternClass$2149;
    exports$2123.takeLineContext = takeLineContext$2143;
    exports$2123.takeLine = takeLine$2144;
    exports$2123.typeIsLiteral = typeIsLiteral$2138;
}));
//# sourceMappingURL=patterns.js.map