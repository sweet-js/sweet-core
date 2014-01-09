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
            var sm_startLineNumber$2173 = typeof to$2171.token.sm_startLineNumber !== 'undefined' ? to$2171.token.sm_startLineNumber : to$2171.token.startLineNumber;
            var sm_endLineNumber$2174 = typeof to$2171.token.sm_endLineNumber !== 'undefined' ? to$2171.token.sm_endLineNumber : to$2171.token.endLineNumber;
            var sm_startLineStart$2175 = typeof to$2171.token.sm_startLineStart !== 'undefined' ? to$2171.token.sm_startLineStart : to$2171.token.startLineStart;
            var sm_endLineStart$2176 = typeof to$2171.token.sm_endLineStart !== 'undefined' ? to$2171.token.sm_endLineStart : to$2171.token.endLineStart;
            var sm_startRange$2177 = typeof to$2171.token.sm_startRange !== 'undefined' ? to$2171.token.sm_startRange : to$2171.token.startRange;
            var sm_endRange$2178 = typeof to$2171.token.sm_endRange !== 'undefined' ? to$2171.token.sm_endRange : to$2171.token.endRange;
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
                    sm_startLineNumber: sm_startLineNumber$2173,
                    sm_endLineNumber: sm_endLineNumber$2174,
                    sm_startLineStart: sm_startLineStart$2175,
                    sm_endLineStart: sm_endLineStart$2176,
                    sm_startRange: sm_startRange$2177,
                    sm_endRange: sm_endRange$2178
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
                    sm_startLineNumber: sm_startLineNumber$2173,
                    sm_endLineNumber: sm_endLineNumber$2174,
                    sm_startLineStart: sm_startLineStart$2175,
                    sm_endLineStart: sm_endLineStart$2176,
                    sm_startRange: sm_startRange$2177,
                    sm_endRange: sm_endRange$2178
                }, to$2171);
            }
        } else {
            var sm_lineNumber$2179 = typeof to$2171.token.sm_lineNumber !== 'undefined' ? to$2171.token.sm_lineNumber : to$2171.token.lineNumber;
            var sm_lineStart$2180 = typeof to$2171.token.sm_lineStart !== 'undefined' ? to$2171.token.sm_lineStart : to$2171.token.lineStart;
            var sm_range$2181 = typeof to$2171.token.sm_range !== 'undefined' ? to$2171.token.sm_range : to$2171.token.range;
            if (from$2170.token.type === parser$2126.Token.Delimiter) {
                next$2172 = syntaxFromToken$2130({
                    value: to$2171.token.value,
                    type: to$2171.token.type,
                    lineNumber: from$2170.token.startLineNumber,
                    lineStart: from$2170.token.startLineStart,
                    range: from$2170.token.startRange,
                    sm_lineNumber: sm_lineNumber$2179,
                    sm_lineStart: sm_lineStart$2180,
                    sm_range: sm_range$2181
                }, to$2171);
            } else {
                next$2172 = syntaxFromToken$2130({
                    value: to$2171.token.value,
                    type: to$2171.token.type,
                    lineNumber: from$2170.token.lineNumber,
                    lineStart: from$2170.token.lineStart,
                    range: from$2170.token.range,
                    sm_lineNumber: sm_lineNumber$2179,
                    sm_lineStart: sm_lineStart$2180,
                    sm_range: sm_range$2181
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
    function reversePattern$2145(patterns$2182) {
        var len$2183 = patterns$2182.length;
        var pat$2184;
        return _$2124.reduceRight(patterns$2182, function (acc$2185, pat$2184) {
            if (pat$2184.class === 'pattern_group') {
                pat$2184.token.inner = reversePattern$2145(pat$2184.token.inner);
            }
            if (pat$2184.repeat) {
                pat$2184.leading = !pat$2184.leading;
            }
            acc$2185.push(pat$2184);
            return acc$2185;
        }, []);
    }
    function loadLiteralGroup$2146(patterns$2187) {
        _$2124.forEach(patterns$2187, function (patStx$2188) {
            if (patStx$2188.token.type === parser$2126.Token.Delimiter) {
                patStx$2188.token.inner = loadLiteralGroup$2146(patStx$2188.token.inner);
            } else {
                patStx$2188.class = 'pattern_literal';
            }
        });
        return patterns$2187;
    }
    function loadPattern$2147(patterns$2189, reverse$2190) {
        var patts$2191 = _$2124.chain(patterns$2189).reduce(function (acc$2192, patStx$2193, idx$2194) {
                var last$2195 = patterns$2189[idx$2194 - 1];
                var lastLast$2196 = patterns$2189[idx$2194 - 2];
                var next$2197 = patterns$2189[idx$2194 + 1];
                var nextNext$2198 = patterns$2189[idx$2194 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2193.token.value === ':') {
                    if (last$2195 && isPatternVar$2141(last$2195) && !isPatternVar$2141(next$2197)) {
                        return acc$2192;
                    }
                }
                if (last$2195 && last$2195.token.value === ':') {
                    if (lastLast$2196 && isPatternVar$2141(lastLast$2196) && !isPatternVar$2141(patStx$2193)) {
                        return acc$2192;
                    }
                }
                // skip over $
                if (patStx$2193.token.value === '$' && next$2197 && next$2197.token.type === parser$2126.Token.Delimiter) {
                    return acc$2192;
                }
                if (isPatternVar$2141(patStx$2193)) {
                    if (next$2197 && next$2197.token.value === ':' && !isPatternVar$2141(nextNext$2198)) {
                        if (typeof nextNext$2198 === 'undefined') {
                            throwSyntaxError$2135('patterns', 'expecting a pattern class following a `:`', next$2197);
                        }
                        patStx$2193.class = nextNext$2198.token.value;
                    } else {
                        patStx$2193.class = 'token';
                    }
                } else if (patStx$2193.token.type === parser$2126.Token.Delimiter) {
                    if (last$2195 && last$2195.token.value === '$') {
                        patStx$2193.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2193.class === 'pattern_group' && patStx$2193.token.value === '[]') {
                        patStx$2193.token.inner = loadLiteralGroup$2146(patStx$2193.token.inner);
                    } else {
                        patStx$2193.token.inner = loadPattern$2147(patStx$2193.token.inner);
                    }
                } else {
                    patStx$2193.class = 'pattern_literal';
                }
                acc$2192.push(patStx$2193);
                return acc$2192;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2199, patStx$2200, idx$2201, patterns$2202) {
                var separator$2203 = patStx$2200.separator || ' ';
                var repeat$2204 = patStx$2200.repeat || false;
                var next$2205 = patterns$2202[idx$2201 + 1];
                var nextNext$2206 = patterns$2202[idx$2201 + 2];
                if (next$2205 && next$2205.token.value === '...') {
                    repeat$2204 = true;
                    separator$2203 = ' ';
                } else if (delimIsSeparator$2140(next$2205) && nextNext$2206 && nextNext$2206.token.value === '...') {
                    repeat$2204 = true;
                    assert$2134(next$2205.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2203 = next$2205.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2200.token.value === '...' || delimIsSeparator$2140(patStx$2200) && next$2205 && next$2205.token.value === '...') {
                    return acc$2199;
                }
                patStx$2200.repeat = repeat$2204;
                patStx$2200.separator = separator$2203;
                acc$2199.push(patStx$2200);
                return acc$2199;
            }, []).value();
        return reverse$2190 ? reversePattern$2145(patts$2191) : patts$2191;
    }
    function cachedTermMatch$2148(stx$2207, term$2208) {
        var res$2209 = [];
        var i$2210 = 0;
        while (stx$2207[i$2210] && stx$2207[i$2210].term === term$2208) {
            res$2209.unshift(stx$2207[i$2210]);
            i$2210++;
        }
        return {
            result: term$2208,
            destructed: res$2209,
            rest: stx$2207.slice(res$2209.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2149(patternClass$2211, stx$2212, env$2213) {
        var result$2214, rest$2215, match$2216;
        // pattern has no parse class
        if (patternClass$2211 === 'token' && stx$2212[0] && stx$2212[0].token.type !== parser$2126.Token.EOF) {
            result$2214 = [stx$2212[0]];
            rest$2215 = stx$2212.slice(1);
        } else if (patternClass$2211 === 'lit' && stx$2212[0] && typeIsLiteral$2138(stx$2212[0].token.type)) {
            result$2214 = [stx$2212[0]];
            rest$2215 = stx$2212.slice(1);
        } else if (patternClass$2211 === 'ident' && stx$2212[0] && stx$2212[0].token.type === parser$2126.Token.Identifier) {
            result$2214 = [stx$2212[0]];
            rest$2215 = stx$2212.slice(1);
        } else if (stx$2212.length > 0 && patternClass$2211 === 'VariableStatement') {
            match$2216 = stx$2212[0].term ? cachedTermMatch$2148(stx$2212, stx$2212[0].term) : expander$2127.enforest(stx$2212, expander$2127.makeExpanderContext({ env: env$2213 }));
            if (match$2216.result && match$2216.result.hasPrototype(expander$2127.VariableStatement)) {
                result$2214 = match$2216.destructed || match$2216.result.destruct(false);
                rest$2215 = match$2216.rest;
            } else {
                result$2214 = null;
                rest$2215 = stx$2212;
            }
        } else if (stx$2212.length > 0 && patternClass$2211 === 'expr') {
            match$2216 = stx$2212[0].term ? cachedTermMatch$2148(stx$2212, stx$2212[0].term) : expander$2127.get_expression(stx$2212, expander$2127.makeExpanderContext({ env: env$2213 }));
            if (match$2216.result === null || !match$2216.result.hasPrototype(expander$2127.Expr)) {
                result$2214 = null;
                rest$2215 = stx$2212;
            } else {
                result$2214 = match$2216.destructed || match$2216.result.destruct(false);
                rest$2215 = match$2216.rest;
            }
        } else {
            result$2214 = null;
            rest$2215 = stx$2212;
        }
        return {
            result: result$2214,
            rest: rest$2215
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2150(patterns$2217, stx$2218, env$2219, topLevel$2220) {
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
        topLevel$2220 = topLevel$2220 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2221 = [];
        var patternEnv$2222 = {};
        var match$2223;
        var pattern$2224;
        var rest$2225 = stx$2218;
        var success$2226 = true;
        var inLeading$2227;
        patternLoop:
            for (var i$2228 = 0; i$2228 < patterns$2217.length; i$2228++) {
                if (success$2226 === false) {
                    break;
                }
                pattern$2224 = patterns$2217[i$2228];
                inLeading$2227 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2224.repeat && i$2228 + 1 < patterns$2217.length) {
                        var restMatch$2229 = matchPatterns$2150(patterns$2217.slice(i$2228 + 1), rest$2225, env$2219, topLevel$2220);
                        if (restMatch$2229.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2223 = matchPattern$2151(pattern$2224, [], env$2219, patternEnv$2222);
                            patternEnv$2222 = _$2124.extend(restMatch$2229.patternEnv, match$2223.patternEnv);
                            rest$2225 = restMatch$2229.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2224.repeat && pattern$2224.leading && pattern$2224.separator !== ' ') {
                        if (rest$2225[0].token.value === pattern$2224.separator) {
                            if (!inLeading$2227) {
                                inLeading$2227 = true;
                            }
                            rest$2225 = rest$2225.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2227) {
                                success$2226 = false;
                                break;
                            }
                        }
                    }
                    match$2223 = matchPattern$2151(pattern$2224, rest$2225, env$2219, patternEnv$2222);
                    if (!match$2223.success && pattern$2224.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2223.success) {
                        success$2226 = false;
                        break;
                    }
                    rest$2225 = match$2223.rest;
                    patternEnv$2222 = match$2223.patternEnv;
                    if (success$2226 && !(topLevel$2220 || pattern$2224.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2228 == patterns$2217.length - 1 && rest$2225.length !== 0) {
                            success$2226 = false;
                            break;
                        }
                    }
                    if (pattern$2224.repeat && !pattern$2224.leading && success$2226) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2224.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2225[0] && rest$2225[0].token.value === pattern$2224.separator) {
                            // more tokens and the next token matches the separator
                            rest$2225 = rest$2225.slice(1);
                        } else if (pattern$2224.separator !== ' ' && rest$2225.length > 0 && i$2228 === patterns$2217.length - 1 && topLevel$2220 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2226 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2224.repeat && success$2226 && rest$2225.length > 0);
            }
        var result$2221;
        if (success$2226) {
            result$2221 = rest$2225.length ? stx$2218.slice(0, -rest$2225.length) : stx$2218;
        } else {
            result$2221 = [];
        }
        return {
            success: success$2226,
            result: result$2221,
            rest: rest$2225,
            patternEnv: patternEnv$2222
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
    function matchPattern$2151(pattern$2230, stx$2231, env$2232, patternEnv$2233) {
        var subMatch$2234;
        var match$2235, matchEnv$2236;
        var rest$2237;
        var success$2238;
        if (typeof pattern$2230.inner !== 'undefined') {
            if (pattern$2230.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2234 = matchPatterns$2150(pattern$2230.inner, stx$2231, env$2232, true);
                rest$2237 = subMatch$2234.rest;
            } else if (stx$2231[0] && stx$2231[0].token.type === parser$2126.Token.Delimiter && stx$2231[0].token.value === pattern$2230.value) {
                stx$2231[0].expose();
                if (pattern$2230.inner.length === 0 && stx$2231[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2231,
                        patternEnv: patternEnv$2233
                    };
                }
                subMatch$2234 = matchPatterns$2150(pattern$2230.inner, stx$2231[0].token.inner, env$2232, false);
                rest$2237 = stx$2231.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2231,
                    patternEnv: patternEnv$2233
                };
            }
            success$2238 = subMatch$2234.success;
            // merge the subpattern matches with the current pattern environment
            _$2124.keys(subMatch$2234.patternEnv).forEach(function (patternKey$2239) {
                if (pattern$2230.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2240 = subMatch$2234.patternEnv[patternKey$2239].level + 1;
                    if (patternEnv$2233[patternKey$2239]) {
                        patternEnv$2233[patternKey$2239].level = nextLevel$2240;
                        patternEnv$2233[patternKey$2239].match.push(subMatch$2234.patternEnv[patternKey$2239]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2233[patternKey$2239] = {
                            level: nextLevel$2240,
                            match: [subMatch$2234.patternEnv[patternKey$2239]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2233[patternKey$2239] = subMatch$2234.patternEnv[patternKey$2239];
                }
            });
        } else {
            if (pattern$2230.class === 'pattern_literal') {
                // wildcard
                if (stx$2231[0] && pattern$2230.value === '_') {
                    success$2238 = true;
                    rest$2237 = stx$2231.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2231[0] && pattern$2230.value === stx$2231[0].token.value) {
                    success$2238 = true;
                    rest$2237 = stx$2231.slice(1);
                } else {
                    success$2238 = false;
                    rest$2237 = stx$2231;
                }
            } else {
                match$2235 = matchPatternClass$2149(pattern$2230.class, stx$2231, env$2232);
                success$2238 = match$2235.result !== null;
                rest$2237 = match$2235.rest;
                matchEnv$2236 = {
                    level: 0,
                    match: match$2235.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2230.repeat) {
                    if (patternEnv$2233[pattern$2230.value] && success$2238) {
                        patternEnv$2233[pattern$2230.value].match.push(matchEnv$2236);
                    } else if (patternEnv$2233[pattern$2230.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2233[pattern$2230.value] = {
                            level: 1,
                            match: [matchEnv$2236]
                        };
                    }
                } else {
                    patternEnv$2233[pattern$2230.value] = matchEnv$2236;
                }
            }
        }
        return {
            success: success$2238,
            rest: rest$2237,
            patternEnv: patternEnv$2233
        };
    }
    function matchLookbehind$2152(patterns$2241, stx$2242, terms$2243, env$2244) {
        var success$2245, patternEnv$2246, prevStx$2247, prevTerms$2248;
        // No lookbehind, noop.
        if (!patterns$2241.length) {
            success$2245 = true;
            patternEnv$2246 = {};
            prevStx$2247 = stx$2242;
            prevTerms$2248 = terms$2243;
        } else {
            var match$2249 = matchPatterns$2150(patterns$2241, stx$2242, env$2244, true);
            var last$2250 = match$2249.result[match$2249.result.length - 1];
            success$2245 = match$2249.success;
            patternEnv$2246 = match$2249.patternEnv;
            if (success$2245) {
                if (match$2249.rest.length) {
                    if (last$2250 && last$2250.term === match$2249.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2245 = false;
                    } else {
                        prevStx$2247 = match$2249.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2251 = 0, len$2252 = terms$2243.length; i$2251 < len$2252; i$2251++) {
                            if (terms$2243[i$2251] === prevStx$2247[0].term) {
                                prevTerms$2248 = terms$2243.slice(i$2251);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2248 = [];
                    prevStx$2247 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2124.forEach(patternEnv$2246, function (val$2253, key$2254) {
            if (val$2253.level && val$2253.match) {
                val$2253.match.reverse();
            }
        });
        return {
            success: success$2245,
            patternEnv: patternEnv$2246,
            prevStx: prevStx$2247,
            prevTerms: prevTerms$2248
        };
    }
    function hasMatch$2153(m$2255) {
        if (m$2255.level === 0) {
            return m$2255.match.length > 0;
        }
        return m$2255.match.every(function (m$2256) {
            return hasMatch$2153(m$2256);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2154(macroBody$2257, macroNameStx$2258, env$2259) {
        return _$2124.chain(macroBody$2257).reduce(function (acc$2260, bodyStx$2261, idx$2262, original$2263) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2264 = original$2263[idx$2262 - 1];
            var next$2265 = original$2263[idx$2262 + 1];
            var nextNext$2266 = original$2263[idx$2262 + 2];
            // drop `...`
            if (bodyStx$2261.token.value === '...') {
                return acc$2260;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2140(bodyStx$2261) && next$2265 && next$2265.token.value === '...') {
                return acc$2260;
            }
            // skip the $ in $(...)
            if (bodyStx$2261.token.value === '$' && next$2265 && next$2265.token.type === parser$2126.Token.Delimiter && next$2265.token.value === '()') {
                return acc$2260;
            }
            // mark $[...] as a literal
            if (bodyStx$2261.token.value === '$' && next$2265 && next$2265.token.type === parser$2126.Token.Delimiter && next$2265.token.value === '[]') {
                next$2265.literal = true;
                return acc$2260;
            }
            if (bodyStx$2261.token.type === parser$2126.Token.Delimiter && bodyStx$2261.token.value === '()' && last$2264 && last$2264.token.value === '$') {
                bodyStx$2261.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2261.literal === true) {
                assert$2134(bodyStx$2261.token.type === parser$2126.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2260.concat(bodyStx$2261.token.inner);
            }
            if (next$2265 && next$2265.token.value === '...') {
                bodyStx$2261.repeat = true;
                bodyStx$2261.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2140(next$2265) && nextNext$2266 && nextNext$2266.token.value === '...') {
                bodyStx$2261.repeat = true;
                bodyStx$2261.separator = next$2265.token.inner[0].token.value;
            }
            acc$2260.push(bodyStx$2261);
            return acc$2260;
        }, []).reduce(function (acc$2267, bodyStx$2268, idx$2269) {
            // then do the actual transcription
            if (bodyStx$2268.repeat) {
                if (bodyStx$2268.token.type === parser$2126.Token.Delimiter) {
                    bodyStx$2268.expose();
                    var fv$2270 = _$2124.filter(freeVarsInPattern$2137(bodyStx$2268.token.inner), function (pat$2277) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2259.hasOwnProperty(pat$2277);
                        });
                    var restrictedEnv$2271 = [];
                    var nonScalar$2272 = _$2124.find(fv$2270, function (pat$2278) {
                            return env$2259[pat$2278].level > 0;
                        });
                    assert$2134(typeof nonScalar$2272 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2273 = env$2259[nonScalar$2272].match.length;
                    var sameLength$2274 = _$2124.all(fv$2270, function (pat$2279) {
                            return env$2259[pat$2279].level === 0 || env$2259[pat$2279].match.length === repeatLength$2273;
                        });
                    assert$2134(sameLength$2274, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2124.each(_$2124.range(repeatLength$2273), function (idx$2280) {
                        var renv$2281 = {};
                        _$2124.each(fv$2270, function (pat$2283) {
                            if (env$2259[pat$2283].level === 0) {
                                // copy scalars over
                                renv$2281[pat$2283] = env$2259[pat$2283];
                            } else {
                                // grab the match at this index 
                                renv$2281[pat$2283] = env$2259[pat$2283].match[idx$2280];
                            }
                        });
                        var allHaveMatch$2282 = Object.keys(renv$2281).every(function (pat$2284) {
                                return hasMatch$2153(renv$2281[pat$2284]);
                            });
                        if (allHaveMatch$2282) {
                            restrictedEnv$2271.push(renv$2281);
                        }
                    });
                    var transcribed$2275 = _$2124.map(restrictedEnv$2271, function (renv$2285) {
                            if (bodyStx$2268.group) {
                                return transcribe$2154(bodyStx$2268.token.inner, macroNameStx$2258, renv$2285);
                            } else {
                                var newBody$2286 = syntaxFromToken$2130(_$2124.clone(bodyStx$2268.token), bodyStx$2268);
                                newBody$2286.token.inner = transcribe$2154(bodyStx$2268.token.inner, macroNameStx$2258, renv$2285);
                                return newBody$2286;
                            }
                        });
                    var joined$2276;
                    if (bodyStx$2268.group) {
                        joined$2276 = joinSyntaxArr$2133(transcribed$2275, bodyStx$2268.separator);
                    } else {
                        joined$2276 = joinSyntax$2132(transcribed$2275, bodyStx$2268.separator);
                    }
                    push$2136.apply(acc$2267, joined$2276);
                    return acc$2267;
                }
                if (!env$2259[bodyStx$2268.token.value]) {
                    throwSyntaxError$2135('patterns', 'The pattern variable is not bound for the template', bodyStx$2268);
                } else if (env$2259[bodyStx$2268.token.value].level !== 1) {
                    throwSyntaxError$2135('patterns', 'Ellipses level does not match in the template', bodyStx$2268);
                }
                push$2136.apply(acc$2267, joinRepeatedMatch$2142(env$2259[bodyStx$2268.token.value].match, bodyStx$2268.separator));
                return acc$2267;
            } else {
                if (bodyStx$2268.token.type === parser$2126.Token.Delimiter) {
                    bodyStx$2268.expose();
                    var newBody$2287 = syntaxFromToken$2130(_$2124.clone(bodyStx$2268.token), macroBody$2257);
                    newBody$2287.token.inner = transcribe$2154(bodyStx$2268.token.inner, macroNameStx$2258, env$2259);
                    acc$2267.push(newBody$2287);
                    return acc$2267;
                }
                if (isPatternVar$2141(bodyStx$2268) && Object.prototype.hasOwnProperty.bind(env$2259)(bodyStx$2268.token.value)) {
                    if (!env$2259[bodyStx$2268.token.value]) {
                        throwSyntaxError$2135('patterns', 'The pattern variable is not bound for the template', bodyStx$2268);
                    } else if (env$2259[bodyStx$2268.token.value].level !== 0) {
                        throwSyntaxError$2135('patterns', 'Ellipses level does not match in the template', bodyStx$2268);
                    }
                    push$2136.apply(acc$2267, takeLineContext$2143(bodyStx$2268, env$2259[bodyStx$2268.token.value].match));
                    return acc$2267;
                }
                acc$2267.push(bodyStx$2268);
                return acc$2267;
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