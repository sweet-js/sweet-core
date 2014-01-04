(function (root$2120, factory$2121) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2121(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2121);
    }
}(this, function (exports$2122, _$2123, es6$2124, parser$2125, expander$2126, syntax$2127) {
    var get_expression$2128 = expander$2126.get_expression;
    var syntaxFromToken$2129 = syntax$2127.syntaxFromToken;
    var makePunc$2130 = syntax$2127.makePunc;
    var joinSyntax$2131 = syntax$2127.joinSyntax;
    var joinSyntaxArr$2132 = syntax$2127.joinSyntaxArr;
    var assert$2133 = syntax$2127.assert;
    var throwSyntaxError$2134 = syntax$2127.throwSyntaxError;
    var push$2135 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2136(pattern$2154) {
        var fv$2155 = [];
        _$2123.each(pattern$2154, function (pat$2156) {
            if (isPatternVar$2140(pat$2156)) {
                fv$2155.push(pat$2156.token.value);
            } else if (pat$2156.token.type === parser$2125.Token.Delimiter) {
                push$2135.apply(fv$2155, freeVarsInPattern$2136(pat$2156.token.inner));
            }
        });
        return fv$2155;
    }
    function typeIsLiteral$2137(type$2157) {
        return type$2157 === parser$2125.Token.NullLiteral || type$2157 === parser$2125.Token.NumericLiteral || type$2157 === parser$2125.Token.StringLiteral || type$2157 === parser$2125.Token.RegexLiteral || type$2157 === parser$2125.Token.BooleanLiteral;
    }
    function containsPatternVar$2138(patterns$2158) {
        return _$2123.any(patterns$2158, function (pat$2159) {
            if (pat$2159.token.type === parser$2125.Token.Delimiter) {
                return containsPatternVar$2138(pat$2159.token.inner);
            }
            return isPatternVar$2140(pat$2159);
        });
    }
    function delimIsSeparator$2139(delim$2160) {
        return delim$2160 && delim$2160.token && delim$2160.token.type === parser$2125.Token.Delimiter && delim$2160.token.value === '()' && delim$2160.token.inner.length === 1 && delim$2160.token.inner[0].token.type !== parser$2125.Token.Delimiter && !containsPatternVar$2138(delim$2160.token.inner);
    }
    function isPatternVar$2140(stx$2161) {
        return stx$2161.token.value[0] === '$' && stx$2161.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2141(tojoin$2162, punc$2163) {
        return _$2123.reduce(_$2123.rest(tojoin$2162, 1), function (acc$2164, join$2165) {
            if (punc$2163 === ' ') {
                return acc$2164.concat(join$2165.match);
            }
            return acc$2164.concat(makePunc$2130(punc$2163, _$2123.first(join$2165.match)), join$2165.match);
        }, _$2123.first(tojoin$2162).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2142(from$2166, to$2167) {
        return _$2123.map(to$2167, function (stx$2168) {
            return takeLine$2143(from$2166, stx$2168);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2143(from$2169, to$2170) {
        var next$2171;
        if (to$2170.token.type === parser$2125.Token.Delimiter) {
            if (from$2169.token.type === parser$2125.Token.Delimiter) {
                next$2171 = syntaxFromToken$2129({
                    type: parser$2125.Token.Delimiter,
                    value: to$2170.token.value,
                    inner: takeLineContext$2142(from$2169, to$2170.token.inner),
                    startRange: from$2169.token.startRange,
                    endRange: from$2169.token.endRange,
                    startLineNumber: from$2169.token.startLineNumber,
                    startLineStart: from$2169.token.startLineStart,
                    endLineNumber: from$2169.token.endLineNumber,
                    endLineStart: from$2169.token.endLineStart,
                    sm_startLineNumber: to$2170.token.startLineNumber,
                    sm_endLineNumber: to$2170.token.endLineNumber,
                    sm_startLineStart: to$2170.token.startLineStart,
                    sm_endLineStart: to$2170.token.endLineStart,
                    sm_startRange: to$2170.token.startRange,
                    sm_endRange: to$2170.token.endRange
                }, to$2170);
            } else {
                next$2171 = syntaxFromToken$2129({
                    type: parser$2125.Token.Delimiter,
                    value: to$2170.token.value,
                    inner: takeLineContext$2142(from$2169, to$2170.token.inner),
                    startRange: from$2169.token.range,
                    endRange: from$2169.token.range,
                    startLineNumber: from$2169.token.lineNumber,
                    startLineStart: from$2169.token.lineStart,
                    endLineNumber: from$2169.token.lineNumber,
                    endLineStart: from$2169.token.lineStart,
                    sm_startLineNumber: to$2170.token.startLineNumber,
                    sm_endLineNumber: to$2170.token.endLineNumber,
                    sm_startLineStart: to$2170.token.startLineStart,
                    sm_endLineStart: to$2170.token.endLineStart,
                    sm_startRange: to$2170.token.startRange,
                    sm_endRange: to$2170.token.endRange
                }, to$2170);
            }
        } else {
            if (from$2169.token.type === parser$2125.Token.Delimiter) {
                next$2171 = syntaxFromToken$2129({
                    value: to$2170.token.value,
                    type: to$2170.token.type,
                    lineNumber: from$2169.token.startLineNumber,
                    lineStart: from$2169.token.startLineStart,
                    range: from$2169.token.startRange,
                    sm_lineNumber: to$2170.token.lineNumber,
                    sm_lineStart: to$2170.token.lineStart,
                    sm_range: to$2170.token.range
                }, to$2170);
            } else {
                next$2171 = syntaxFromToken$2129({
                    value: to$2170.token.value,
                    type: to$2170.token.type,
                    lineNumber: from$2169.token.lineNumber,
                    lineStart: from$2169.token.lineStart,
                    range: from$2169.token.range,
                    sm_lineNumber: to$2170.token.lineNumber,
                    sm_lineStart: to$2170.token.lineStart,
                    sm_range: to$2170.token.range
                }, to$2170);
            }
        }
        if (to$2170.token.leadingComments) {
            next$2171.token.leadingComments = to$2170.token.leadingComments;
        }
        if (to$2170.token.trailingComments) {
            next$2171.token.trailingComments = to$2170.token.trailingComments;
        }
        return next$2171;
    }
    function reversePattern$2144(patterns$2172) {
        var len$2173 = patterns$2172.length;
        var pat$2174;
        return _$2123.reduceRight(patterns$2172, function (acc$2175, pat$2174) {
            if (pat$2174.class === 'pattern_group') {
                pat$2174.token.inner = reversePattern$2144(pat$2174.token.inner);
            }
            if (pat$2174.repeat) {
                pat$2174.leading = !pat$2174.leading;
            }
            acc$2175.push(pat$2174);
            return acc$2175;
        }, []);
    }
    function loadLiteralGroup$2145(patterns$2177) {
        _$2123.forEach(patterns$2177, function (patStx$2178) {
            if (patStx$2178.token.type === parser$2125.Token.Delimiter) {
                patStx$2178.token.inner = loadLiteralGroup$2145(patStx$2178.token.inner);
            } else {
                patStx$2178.class = 'pattern_literal';
            }
        });
        return patterns$2177;
    }
    function loadPattern$2146(patterns$2179, reverse$2180) {
        var patts$2181 = _$2123.chain(patterns$2179).reduce(function (acc$2182, patStx$2183, idx$2184) {
                var last$2185 = patterns$2179[idx$2184 - 1];
                var lastLast$2186 = patterns$2179[idx$2184 - 2];
                var next$2187 = patterns$2179[idx$2184 + 1];
                var nextNext$2188 = patterns$2179[idx$2184 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$2183.token.value === ':') {
                    if (last$2185 && isPatternVar$2140(last$2185) && !isPatternVar$2140(next$2187)) {
                        return acc$2182;
                    }
                }
                if (last$2185 && last$2185.token.value === ':') {
                    if (lastLast$2186 && isPatternVar$2140(lastLast$2186) && !isPatternVar$2140(patStx$2183)) {
                        return acc$2182;
                    }
                }
                // skip over $
                if (patStx$2183.token.value === '$' && next$2187 && next$2187.token.type === parser$2125.Token.Delimiter) {
                    return acc$2182;
                }
                if (isPatternVar$2140(patStx$2183)) {
                    if (next$2187 && next$2187.token.value === ':' && !isPatternVar$2140(nextNext$2188)) {
                        if (typeof nextNext$2188 === 'undefined') {
                            throwSyntaxError$2134('patterns', 'expecting a pattern class following a `:`', next$2187);
                        }
                        patStx$2183.class = nextNext$2188.token.value;
                    } else {
                        patStx$2183.class = 'token';
                    }
                } else if (patStx$2183.token.type === parser$2125.Token.Delimiter) {
                    if (last$2185 && last$2185.token.value === '$') {
                        patStx$2183.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$2183.class === 'pattern_group' && patStx$2183.token.value === '[]') {
                        patStx$2183.token.inner = loadLiteralGroup$2145(patStx$2183.token.inner);
                    } else {
                        patStx$2183.token.inner = loadPattern$2146(patStx$2183.token.inner);
                    }
                } else {
                    patStx$2183.class = 'pattern_literal';
                }
                acc$2182.push(patStx$2183);
                return acc$2182;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2189, patStx$2190, idx$2191, patterns$2192) {
                var separator$2193 = patStx$2190.separator || ' ';
                var repeat$2194 = patStx$2190.repeat || false;
                var next$2195 = patterns$2192[idx$2191 + 1];
                var nextNext$2196 = patterns$2192[idx$2191 + 2];
                if (next$2195 && next$2195.token.value === '...') {
                    repeat$2194 = true;
                    separator$2193 = ' ';
                } else if (delimIsSeparator$2139(next$2195) && nextNext$2196 && nextNext$2196.token.value === '...') {
                    repeat$2194 = true;
                    assert$2133(next$2195.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$2193 = next$2195.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$2190.token.value === '...' || delimIsSeparator$2139(patStx$2190) && next$2195 && next$2195.token.value === '...') {
                    return acc$2189;
                }
                patStx$2190.repeat = repeat$2194;
                patStx$2190.separator = separator$2193;
                acc$2189.push(patStx$2190);
                return acc$2189;
            }, []).value();
        return reverse$2180 ? reversePattern$2144(patts$2181) : patts$2181;
    }
    function cachedTermMatch$2147(stx$2197, term$2198) {
        var res$2199 = [];
        var i$2200 = 0;
        while (stx$2197[i$2200] && stx$2197[i$2200].term === term$2198) {
            res$2199.unshift(stx$2197[i$2200]);
            i$2200++;
        }
        return {
            result: term$2198,
            destructed: res$2199,
            rest: stx$2197.slice(res$2199.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2148(patternClass$2201, stx$2202, env$2203) {
        var result$2204, rest$2205, match$2206;
        // pattern has no parse class
        if (patternClass$2201 === 'token' && stx$2202[0] && stx$2202[0].token.type !== parser$2125.Token.EOF) {
            result$2204 = [stx$2202[0]];
            rest$2205 = stx$2202.slice(1);
        } else if (patternClass$2201 === 'lit' && stx$2202[0] && typeIsLiteral$2137(stx$2202[0].token.type)) {
            result$2204 = [stx$2202[0]];
            rest$2205 = stx$2202.slice(1);
        } else if (patternClass$2201 === 'ident' && stx$2202[0] && stx$2202[0].token.type === parser$2125.Token.Identifier) {
            result$2204 = [stx$2202[0]];
            rest$2205 = stx$2202.slice(1);
        } else if (stx$2202.length > 0 && patternClass$2201 === 'VariableStatement') {
            match$2206 = stx$2202[0].term ? cachedTermMatch$2147(stx$2202, stx$2202[0].term) : expander$2126.enforest(stx$2202, expander$2126.makeExpanderContext({ env: env$2203 }));
            if (match$2206.result && match$2206.result.hasPrototype(expander$2126.VariableStatement)) {
                result$2204 = match$2206.destructed || match$2206.result.destruct(false);
                rest$2205 = match$2206.rest;
            } else {
                result$2204 = null;
                rest$2205 = stx$2202;
            }
        } else if (stx$2202.length > 0 && patternClass$2201 === 'expr') {
            match$2206 = stx$2202[0].term ? cachedTermMatch$2147(stx$2202, stx$2202[0].term) : expander$2126.get_expression(stx$2202, expander$2126.makeExpanderContext({ env: env$2203 }));
            if (match$2206.result === null || !match$2206.result.hasPrototype(expander$2126.Expr)) {
                result$2204 = null;
                rest$2205 = stx$2202;
            } else {
                result$2204 = match$2206.destructed || match$2206.result.destruct(false);
                rest$2205 = match$2206.rest;
            }
        } else {
            result$2204 = null;
            rest$2205 = stx$2202;
        }
        return {
            result: result$2204,
            rest: rest$2205
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2149(patterns$2207, stx$2208, env$2209, topLevel$2210) {
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
        topLevel$2210 = topLevel$2210 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2211 = [];
        var patternEnv$2212 = {};
        var match$2213;
        var pattern$2214;
        var rest$2215 = stx$2208;
        var success$2216 = true;
        var inLeading$2217;
        patternLoop:
            for (var i$2218 = 0; i$2218 < patterns$2207.length; i$2218++) {
                if (success$2216 === false) {
                    break;
                }
                pattern$2214 = patterns$2207[i$2218];
                inLeading$2217 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2214.repeat && i$2218 + 1 < patterns$2207.length) {
                        var restMatch$2219 = matchPatterns$2149(patterns$2207.slice(i$2218 + 1), rest$2215, env$2209, topLevel$2210);
                        if (restMatch$2219.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2213 = matchPattern$2150(pattern$2214, [], env$2209, patternEnv$2212);
                            patternEnv$2212 = _$2123.extend(restMatch$2219.patternEnv, match$2213.patternEnv);
                            rest$2215 = restMatch$2219.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$2214.repeat && pattern$2214.leading && pattern$2214.separator !== ' ') {
                        if (rest$2215[0].token.value === pattern$2214.separator) {
                            if (!inLeading$2217) {
                                inLeading$2217 = true;
                            }
                            rest$2215 = rest$2215.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$2217) {
                                success$2216 = false;
                                break;
                            }
                        }
                    }
                    match$2213 = matchPattern$2150(pattern$2214, rest$2215, env$2209, patternEnv$2212);
                    if (!match$2213.success && pattern$2214.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2213.success) {
                        success$2216 = false;
                        break;
                    }
                    rest$2215 = match$2213.rest;
                    patternEnv$2212 = match$2213.patternEnv;
                    if (success$2216 && !(topLevel$2210 || pattern$2214.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2218 == patterns$2207.length - 1 && rest$2215.length !== 0) {
                            success$2216 = false;
                            break;
                        }
                    }
                    if (pattern$2214.repeat && !pattern$2214.leading && success$2216) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2214.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2215[0] && rest$2215[0].token.value === pattern$2214.separator) {
                            // more tokens and the next token matches the separator
                            rest$2215 = rest$2215.slice(1);
                        } else if (pattern$2214.separator !== ' ' && rest$2215.length > 0 && i$2218 === patterns$2207.length - 1 && topLevel$2210 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2216 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2214.repeat && success$2216 && rest$2215.length > 0);
            }
        var result$2211;
        if (success$2216) {
            result$2211 = rest$2215.length ? stx$2208.slice(0, -rest$2215.length) : stx$2208;
        } else {
            result$2211 = [];
        }
        return {
            success: success$2216,
            result: result$2211,
            rest: rest$2215,
            patternEnv: patternEnv$2212
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
    function matchPattern$2150(pattern$2220, stx$2221, env$2222, patternEnv$2223) {
        var subMatch$2224;
        var match$2225, matchEnv$2226;
        var rest$2227;
        var success$2228;
        if (typeof pattern$2220.inner !== 'undefined') {
            if (pattern$2220.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2224 = matchPatterns$2149(pattern$2220.inner, stx$2221, env$2222, true);
                rest$2227 = subMatch$2224.rest;
            } else if (stx$2221[0] && stx$2221[0].token.type === parser$2125.Token.Delimiter && stx$2221[0].token.value === pattern$2220.value) {
                stx$2221[0].expose();
                if (pattern$2220.inner.length === 0 && stx$2221[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2221,
                        patternEnv: patternEnv$2223
                    };
                }
                subMatch$2224 = matchPatterns$2149(pattern$2220.inner, stx$2221[0].token.inner, env$2222, false);
                rest$2227 = stx$2221.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2221,
                    patternEnv: patternEnv$2223
                };
            }
            success$2228 = subMatch$2224.success;
            // merge the subpattern matches with the current pattern environment
            _$2123.keys(subMatch$2224.patternEnv).forEach(function (patternKey$2229) {
                if (pattern$2220.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2230 = subMatch$2224.patternEnv[patternKey$2229].level + 1;
                    if (patternEnv$2223[patternKey$2229]) {
                        patternEnv$2223[patternKey$2229].level = nextLevel$2230;
                        patternEnv$2223[patternKey$2229].match.push(subMatch$2224.patternEnv[patternKey$2229]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2223[patternKey$2229] = {
                            level: nextLevel$2230,
                            match: [subMatch$2224.patternEnv[patternKey$2229]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2223[patternKey$2229] = subMatch$2224.patternEnv[patternKey$2229];
                }
            });
        } else {
            if (pattern$2220.class === 'pattern_literal') {
                // wildcard
                if (stx$2221[0] && pattern$2220.value === '_') {
                    success$2228 = true;
                    rest$2227 = stx$2221.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2221[0] && pattern$2220.value === stx$2221[0].token.value) {
                    success$2228 = true;
                    rest$2227 = stx$2221.slice(1);
                } else {
                    success$2228 = false;
                    rest$2227 = stx$2221;
                }
            } else {
                match$2225 = matchPatternClass$2148(pattern$2220.class, stx$2221, env$2222);
                success$2228 = match$2225.result !== null;
                rest$2227 = match$2225.rest;
                matchEnv$2226 = {
                    level: 0,
                    match: match$2225.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2220.repeat) {
                    if (patternEnv$2223[pattern$2220.value] && success$2228) {
                        patternEnv$2223[pattern$2220.value].match.push(matchEnv$2226);
                    } else if (patternEnv$2223[pattern$2220.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2223[pattern$2220.value] = {
                            level: 1,
                            match: [matchEnv$2226]
                        };
                    }
                } else {
                    patternEnv$2223[pattern$2220.value] = matchEnv$2226;
                }
            }
        }
        return {
            success: success$2228,
            rest: rest$2227,
            patternEnv: patternEnv$2223
        };
    }
    function matchLookbehind$2151(patterns$2231, stx$2232, terms$2233, env$2234) {
        var success$2235, patternEnv$2236, prevStx$2237, prevTerms$2238;
        // No lookbehind, noop.
        if (!patterns$2231.length) {
            success$2235 = true;
            patternEnv$2236 = {};
            prevStx$2237 = stx$2232;
            prevTerms$2238 = terms$2233;
        } else {
            var match$2239 = matchPatterns$2149(patterns$2231, stx$2232, env$2234, true);
            var last$2240 = match$2239.result[match$2239.result.length - 1];
            success$2235 = match$2239.success;
            patternEnv$2236 = match$2239.patternEnv;
            if (success$2235) {
                if (match$2239.rest.length) {
                    if (last$2240 && last$2240.term === match$2239.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$2235 = false;
                    } else {
                        prevStx$2237 = match$2239.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$2241 = 0, len$2242 = terms$2233.length; i$2241 < len$2242; i$2241++) {
                            if (terms$2233[i$2241] === prevStx$2237[0].term) {
                                prevTerms$2238 = terms$2233.slice(i$2241);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$2238 = [];
                    prevStx$2237 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$2123.forEach(patternEnv$2236, function (val$2243, key$2244) {
            if (val$2243.level && val$2243.match) {
                val$2243.match.reverse();
            }
        });
        return {
            success: success$2235,
            patternEnv: patternEnv$2236,
            prevStx: prevStx$2237,
            prevTerms: prevTerms$2238
        };
    }
    function hasMatch$2152(m$2245) {
        if (m$2245.level === 0) {
            return m$2245.match.length > 0;
        }
        return m$2245.match.every(function (m$2246) {
            return hasMatch$2152(m$2246);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2153(macroBody$2247, macroNameStx$2248, env$2249) {
        return _$2123.chain(macroBody$2247).reduce(function (acc$2250, bodyStx$2251, idx$2252, original$2253) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2254 = original$2253[idx$2252 - 1];
            var next$2255 = original$2253[idx$2252 + 1];
            var nextNext$2256 = original$2253[idx$2252 + 2];
            // drop `...`
            if (bodyStx$2251.token.value === '...') {
                return acc$2250;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2139(bodyStx$2251) && next$2255 && next$2255.token.value === '...') {
                return acc$2250;
            }
            // skip the $ in $(...)
            if (bodyStx$2251.token.value === '$' && next$2255 && next$2255.token.type === parser$2125.Token.Delimiter && next$2255.token.value === '()') {
                return acc$2250;
            }
            // mark $[...] as a literal
            if (bodyStx$2251.token.value === '$' && next$2255 && next$2255.token.type === parser$2125.Token.Delimiter && next$2255.token.value === '[]') {
                next$2255.literal = true;
                return acc$2250;
            }
            if (bodyStx$2251.token.type === parser$2125.Token.Delimiter && bodyStx$2251.token.value === '()' && last$2254 && last$2254.token.value === '$') {
                bodyStx$2251.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2251.literal === true) {
                assert$2133(bodyStx$2251.token.type === parser$2125.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2250.concat(bodyStx$2251.token.inner);
            }
            if (next$2255 && next$2255.token.value === '...') {
                bodyStx$2251.repeat = true;
                bodyStx$2251.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2139(next$2255) && nextNext$2256 && nextNext$2256.token.value === '...') {
                bodyStx$2251.repeat = true;
                bodyStx$2251.separator = next$2255.token.inner[0].token.value;
            }
            acc$2250.push(bodyStx$2251);
            return acc$2250;
        }, []).reduce(function (acc$2257, bodyStx$2258, idx$2259) {
            // then do the actual transcription
            if (bodyStx$2258.repeat) {
                if (bodyStx$2258.token.type === parser$2125.Token.Delimiter) {
                    bodyStx$2258.expose();
                    var fv$2260 = _$2123.filter(freeVarsInPattern$2136(bodyStx$2258.token.inner), function (pat$2267) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2249.hasOwnProperty(pat$2267);
                        });
                    var restrictedEnv$2261 = [];
                    var nonScalar$2262 = _$2123.find(fv$2260, function (pat$2268) {
                            return env$2249[pat$2268].level > 0;
                        });
                    assert$2133(typeof nonScalar$2262 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2263 = env$2249[nonScalar$2262].match.length;
                    var sameLength$2264 = _$2123.all(fv$2260, function (pat$2269) {
                            return env$2249[pat$2269].level === 0 || env$2249[pat$2269].match.length === repeatLength$2263;
                        });
                    assert$2133(sameLength$2264, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2123.each(_$2123.range(repeatLength$2263), function (idx$2270) {
                        var renv$2271 = {};
                        _$2123.each(fv$2260, function (pat$2273) {
                            if (env$2249[pat$2273].level === 0) {
                                // copy scalars over
                                renv$2271[pat$2273] = env$2249[pat$2273];
                            } else {
                                // grab the match at this index 
                                renv$2271[pat$2273] = env$2249[pat$2273].match[idx$2270];
                            }
                        });
                        var allHaveMatch$2272 = Object.keys(renv$2271).every(function (pat$2274) {
                                return hasMatch$2152(renv$2271[pat$2274]);
                            });
                        if (allHaveMatch$2272) {
                            restrictedEnv$2261.push(renv$2271);
                        }
                    });
                    var transcribed$2265 = _$2123.map(restrictedEnv$2261, function (renv$2275) {
                            if (bodyStx$2258.group) {
                                return transcribe$2153(bodyStx$2258.token.inner, macroNameStx$2248, renv$2275);
                            } else {
                                var newBody$2276 = syntaxFromToken$2129(_$2123.clone(bodyStx$2258.token), bodyStx$2258);
                                newBody$2276.token.inner = transcribe$2153(bodyStx$2258.token.inner, macroNameStx$2248, renv$2275);
                                return newBody$2276;
                            }
                        });
                    var joined$2266;
                    if (bodyStx$2258.group) {
                        joined$2266 = joinSyntaxArr$2132(transcribed$2265, bodyStx$2258.separator);
                    } else {
                        joined$2266 = joinSyntax$2131(transcribed$2265, bodyStx$2258.separator);
                    }
                    push$2135.apply(acc$2257, joined$2266);
                    return acc$2257;
                }
                if (!env$2249[bodyStx$2258.token.value]) {
                    throwSyntaxError$2134('patterns', 'The pattern variable is not bound for the template', bodyStx$2258);
                } else if (env$2249[bodyStx$2258.token.value].level !== 1) {
                    throwSyntaxError$2134('patterns', 'Ellipses level does not match in the template', bodyStx$2258);
                }
                push$2135.apply(acc$2257, joinRepeatedMatch$2141(env$2249[bodyStx$2258.token.value].match, bodyStx$2258.separator));
                return acc$2257;
            } else {
                if (bodyStx$2258.token.type === parser$2125.Token.Delimiter) {
                    bodyStx$2258.expose();
                    var newBody$2277 = syntaxFromToken$2129(_$2123.clone(bodyStx$2258.token), macroBody$2247);
                    newBody$2277.token.inner = transcribe$2153(bodyStx$2258.token.inner, macroNameStx$2248, env$2249);
                    acc$2257.push(newBody$2277);
                    return acc$2257;
                }
                if (isPatternVar$2140(bodyStx$2258) && Object.prototype.hasOwnProperty.bind(env$2249)(bodyStx$2258.token.value)) {
                    if (!env$2249[bodyStx$2258.token.value]) {
                        throwSyntaxError$2134('patterns', 'The pattern variable is not bound for the template', bodyStx$2258);
                    } else if (env$2249[bodyStx$2258.token.value].level !== 0) {
                        throwSyntaxError$2134('patterns', 'Ellipses level does not match in the template', bodyStx$2258);
                    }
                    push$2135.apply(acc$2257, takeLineContext$2142(bodyStx$2258, env$2249[bodyStx$2258.token.value].match));
                    return acc$2257;
                }
                acc$2257.push(bodyStx$2258);
                return acc$2257;
            }
        }, []).value();
    }
    exports$2122.loadPattern = loadPattern$2146;
    exports$2122.matchPatterns = matchPatterns$2149;
    exports$2122.matchLookbehind = matchLookbehind$2151;
    exports$2122.transcribe = transcribe$2153;
    exports$2122.matchPatternClass = matchPatternClass$2148;
    exports$2122.takeLineContext = takeLineContext$2142;
    exports$2122.takeLine = takeLine$2143;
    exports$2122.typeIsLiteral = typeIsLiteral$2137;
}));
//# sourceMappingURL=patterns.js.map