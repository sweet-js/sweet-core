(function (root$2042, factory$2043) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2043(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$2043);
    }
}(this, function (exports$2044, _$2045, es6$2046, parser$2047, expander$2048, syntax$2049) {
    var get_expression$2050 = expander$2048.get_expression;
    var syntaxFromToken$2051 = syntax$2049.syntaxFromToken;
    var makePunc$2052 = syntax$2049.makePunc;
    var joinSyntax$2053 = syntax$2049.joinSyntax;
    var joinSyntaxArr$2054 = syntax$2049.joinSyntaxArr;
    var assert$2055 = syntax$2049.assert;
    var throwSyntaxError$2056 = syntax$2049.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$2057(pattern$2073) {
        var fv$2074 = [];
        _$2045.each(pattern$2073, function (pat$2075) {
            if (isPatternVar$2061(pat$2075)) {
                fv$2074.push(pat$2075.token.value);
            } else if (pat$2075.token.type === parser$2047.Token.Delimiter) {
                fv$2074 = fv$2074.concat(freeVarsInPattern$2057(pat$2075.token.inner));
            }
        });
        return fv$2074;
    }
    function typeIsLiteral$2058(type$2076) {
        return type$2076 === parser$2047.Token.NullLiteral || type$2076 === parser$2047.Token.NumericLiteral || type$2076 === parser$2047.Token.StringLiteral || type$2076 === parser$2047.Token.RegexLiteral || type$2076 === parser$2047.Token.BooleanLiteral;
    }
    function containsPatternVar$2059(patterns$2077) {
        return _$2045.any(patterns$2077, function (pat$2078) {
            if (pat$2078.token.type === parser$2047.Token.Delimiter) {
                return containsPatternVar$2059(pat$2078.token.inner);
            }
            return isPatternVar$2061(pat$2078);
        });
    }
    function delimIsSeparator$2060(delim$2079) {
        return delim$2079 && delim$2079.token && delim$2079.token.type === parser$2047.Token.Delimiter && delim$2079.token.value === '()' && delim$2079.token.inner.length === 1 && delim$2079.token.inner[0].token.type !== parser$2047.Token.Delimiter && !containsPatternVar$2059(delim$2079.token.inner);
    }
    function isPatternVar$2061(stx$2080) {
        return stx$2080.token.value[0] === '$' && stx$2080.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$2062(tojoin$2081, punc$2082) {
        return _$2045.reduce(_$2045.rest(tojoin$2081, 1), function (acc$2083, join$2084) {
            if (punc$2082 === ' ') {
                return acc$2083.concat(join$2084.match);
            }
            return acc$2083.concat(makePunc$2052(punc$2082, _$2045.first(join$2084.match)), join$2084.match);
        }, _$2045.first(tojoin$2081).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$2063(from$2085, to$2086) {
        return _$2045.map(to$2086, function (stx$2087) {
            return takeLine$2064(from$2085, stx$2087);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$2064(from$2088, to$2089) {
        if (to$2089.token.type === parser$2047.Token.Delimiter) {
            var next$2090;
            if (from$2088.token.type === parser$2047.Token.Delimiter) {
                next$2090 = syntaxFromToken$2051({
                    type: parser$2047.Token.Delimiter,
                    value: to$2089.token.value,
                    inner: takeLineContext$2063(from$2088, to$2089.token.inner),
                    startRange: from$2088.token.startRange,
                    endRange: from$2088.token.endRange,
                    startLineNumber: from$2088.token.startLineNumber,
                    startLineStart: from$2088.token.startLineStart,
                    endLineNumber: from$2088.token.endLineNumber,
                    endLineStart: from$2088.token.endLineStart,
                    sm_startLineNumber: to$2089.token.startLineNumber,
                    sm_endLineNumber: to$2089.token.endLineNumber,
                    sm_startLineStart: to$2089.token.startLineStart,
                    sm_endLineStart: to$2089.token.endLineStart,
                    sm_startRange: to$2089.token.startRange,
                    sm_endRange: to$2089.token.endRange
                }, to$2089);
            } else {
                next$2090 = syntaxFromToken$2051({
                    type: parser$2047.Token.Delimiter,
                    value: to$2089.token.value,
                    inner: takeLineContext$2063(from$2088, to$2089.token.inner),
                    startRange: from$2088.token.range,
                    endRange: from$2088.token.range,
                    startLineNumber: from$2088.token.lineNumber,
                    startLineStart: from$2088.token.lineStart,
                    endLineNumber: from$2088.token.lineNumber,
                    endLineStart: from$2088.token.lineStart,
                    sm_startLineNumber: to$2089.token.startLineNumber,
                    sm_endLineNumber: to$2089.token.endLineNumber,
                    sm_startLineStart: to$2089.token.startLineStart,
                    sm_endLineStart: to$2089.token.endLineStart,
                    sm_startRange: to$2089.token.startRange,
                    sm_endRange: to$2089.token.endRange
                }, to$2089);
            }
        } else {
            if (from$2088.token.type === parser$2047.Token.Delimiter) {
                next$2090 = syntaxFromToken$2051({
                    value: to$2089.token.value,
                    type: to$2089.token.type,
                    lineNumber: from$2088.token.startLineNumber,
                    lineStart: from$2088.token.startLineStart,
                    range: from$2088.token.startRange,
                    sm_lineNumber: to$2089.token.lineNumber,
                    sm_lineStart: to$2089.token.lineStart,
                    sm_range: to$2089.token.range
                }, to$2089);
            } else {
                next$2090 = syntaxFromToken$2051({
                    value: to$2089.token.value,
                    type: to$2089.token.type,
                    lineNumber: from$2088.token.lineNumber,
                    lineStart: from$2088.token.lineStart,
                    range: from$2088.token.range,
                    sm_lineNumber: to$2089.token.lineNumber,
                    sm_lineStart: to$2089.token.lineStart,
                    sm_range: to$2089.token.range
                }, to$2089);
            }
        }
        if (to$2089.token.leadingComments) {
            next$2090.token.leadingComments = to$2089.token.leadingComments;
        }
        if (to$2089.token.trailingComments) {
            next$2090.token.trailingComments = to$2089.token.trailingComments;
        }
        return next$2090;
    }
    function loadLiteralGroup$2065(patterns$2091) {
        _$2045.forEach(patterns$2091, function (patStx$2092) {
            if (patStx$2092.token.type === parser$2047.Token.Delimiter) {
                patStx$2092.token.inner = loadLiteralGroup$2065(patStx$2092.token.inner);
            } else {
                patStx$2092.class = 'pattern_literal';
            }
        });
        return patterns$2091;
    }
    function loadPattern$2066(patterns$2093) {
        return _$2045.chain(patterns$2093).reduce(function (acc$2094, patStx$2095, idx$2096) {
            var last$2097 = patterns$2093[idx$2096 - 1];
            var lastLast$2098 = patterns$2093[idx$2096 - 2];
            var next$2099 = patterns$2093[idx$2096 + 1];
            var nextNext$2100 = patterns$2093[idx$2096 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$2095.token.value === ':') {
                if (last$2097 && isPatternVar$2061(last$2097) && !isPatternVar$2061(next$2099)) {
                    return acc$2094;
                }
            }
            if (last$2097 && last$2097.token.value === ':') {
                if (lastLast$2098 && isPatternVar$2061(lastLast$2098) && !isPatternVar$2061(patStx$2095)) {
                    return acc$2094;
                }
            }
            // skip over $
            if (patStx$2095.token.value === '$' && next$2099 && next$2099.token.type === parser$2047.Token.Delimiter) {
                return acc$2094;
            }
            if (isPatternVar$2061(patStx$2095)) {
                if (next$2099 && next$2099.token.value === ':' && !isPatternVar$2061(nextNext$2100)) {
                    if (typeof nextNext$2100 === 'undefined') {
                        throwSyntaxError$2056('patterns', 'expecting a pattern class following a `:`', next$2099);
                    }
                    patStx$2095.class = nextNext$2100.token.value;
                } else {
                    patStx$2095.class = 'token';
                }
            } else if (patStx$2095.token.type === parser$2047.Token.Delimiter) {
                if (last$2097 && last$2097.token.value === '$') {
                    patStx$2095.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$2095.class === 'pattern_group' && patStx$2095.token.value === '[]') {
                    patStx$2095.token.inner = loadLiteralGroup$2065(patStx$2095.token.inner);
                } else {
                    patStx$2095.token.inner = loadPattern$2066(patStx$2095.token.inner);
                }
            } else {
                patStx$2095.class = 'pattern_literal';
            }
            return acc$2094.concat(patStx$2095);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2101, patStx$2102, idx$2103, patterns$2104) {
            var separator$2105 = patStx$2102.separator || ' ';
            var repeat$2106 = patStx$2102.repeat || false;
            var next$2107 = patterns$2104[idx$2103 + 1];
            var nextNext$2108 = patterns$2104[idx$2103 + 2];
            if (next$2107 && next$2107.token.value === '...') {
                repeat$2106 = true;
                separator$2105 = ' ';
            } else if (delimIsSeparator$2060(next$2107) && nextNext$2108 && nextNext$2108.token.value === '...') {
                repeat$2106 = true;
                assert$2055(next$2107.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2105 = next$2107.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$2102.token.value === '...' || delimIsSeparator$2060(patStx$2102) && next$2107 && next$2107.token.value === '...') {
                return acc$2101;
            }
            patStx$2102.repeat = repeat$2106;
            patStx$2102.separator = separator$2105;
            return acc$2101.concat(patStx$2102);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$2067(patternClass$2109, stx$2110, env$2111) {
        var result$2112, rest$2113;
        // pattern has no parse class
        if (patternClass$2109 === 'token' && stx$2110[0] && stx$2110[0].token.type !== parser$2047.Token.EOF) {
            result$2112 = [stx$2110[0]];
            rest$2113 = stx$2110.slice(1);
        } else if (patternClass$2109 === 'lit' && stx$2110[0] && typeIsLiteral$2058(stx$2110[0].token.type)) {
            result$2112 = [stx$2110[0]];
            rest$2113 = stx$2110.slice(1);
        } else if (patternClass$2109 === 'ident' && stx$2110[0] && stx$2110[0].token.type === parser$2047.Token.Identifier) {
            result$2112 = [stx$2110[0]];
            rest$2113 = stx$2110.slice(1);
        } else if (stx$2110.length > 0 && patternClass$2109 === 'VariableStatement') {
            var match$2114 = expander$2048.enforest(stx$2110, expander$2048.makeExpanderContext({ env: env$2111 }));
            if (match$2114.result && match$2114.result.hasPrototype(expander$2048.VariableStatement)) {
                result$2112 = match$2114.result.destruct(false);
                rest$2113 = match$2114.rest;
            } else {
                result$2112 = null;
                rest$2113 = stx$2110;
            }
        } else if (stx$2110.length > 0 && patternClass$2109 === 'expr') {
            var match$2114 = expander$2048.get_expression(stx$2110, expander$2048.makeExpanderContext({ env: env$2111 }));
            if (match$2114.result === null || !match$2114.result.hasPrototype(expander$2048.Expr)) {
                result$2112 = null;
                rest$2113 = stx$2110;
            } else {
                result$2112 = match$2114.result.destruct(false);
                rest$2113 = match$2114.rest;
            }
        } else {
            result$2112 = null;
            rest$2113 = stx$2110;
        }
        return {
            result: result$2112,
            rest: rest$2113
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$2068(patterns$2115, stx$2116, env$2117, topLevel$2118) {
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
        topLevel$2118 = topLevel$2118 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2119 = [];
        var patternEnv$2120 = {};
        var match$2121;
        var pattern$2122;
        var rest$2123 = stx$2116;
        var success$2124 = true;
        patternLoop:
            for (var i$2125 = 0; i$2125 < patterns$2115.length; i$2125++) {
                if (success$2124 === false) {
                    break;
                }
                pattern$2122 = patterns$2115[i$2125];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2122.repeat && i$2125 + 1 < patterns$2115.length) {
                        var restMatch$2126 = matchPatterns$2068(patterns$2115.slice(i$2125 + 1), rest$2123, env$2117, topLevel$2118);
                        if (restMatch$2126.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2121 = matchPattern$2069(pattern$2122, [], env$2117, patternEnv$2120);
                            patternEnv$2120 = _$2045.extend(restMatch$2126.patternEnv, match$2121.patternEnv);
                            rest$2123 = restMatch$2126.rest;
                            break patternLoop;
                        }
                    }
                    match$2121 = matchPattern$2069(pattern$2122, rest$2123, env$2117, patternEnv$2120);
                    if (!match$2121.success && pattern$2122.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2121.success) {
                        success$2124 = false;
                        break;
                    }
                    rest$2123 = match$2121.rest;
                    patternEnv$2120 = match$2121.patternEnv;
                    if (success$2124 && !(topLevel$2118 || pattern$2122.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2125 == patterns$2115.length - 1 && rest$2123.length !== 0) {
                            success$2124 = false;
                            break;
                        }
                    }
                    if (pattern$2122.repeat && success$2124) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2122.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2123[0] && rest$2123[0].token.value === pattern$2122.separator) {
                            // more tokens and the next token matches the separator
                            rest$2123 = rest$2123.slice(1);
                        } else if (pattern$2122.separator !== ' ' && rest$2123.length > 0 && i$2125 === patterns$2115.length - 1 && topLevel$2118 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2124 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2122.repeat && success$2124 && rest$2123.length > 0);
            }
        return {
            success: success$2124,
            rest: rest$2123,
            patternEnv: patternEnv$2120
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
    function matchPattern$2069(pattern$2127, stx$2128, env$2129, patternEnv$2130) {
        var subMatch$2131;
        var match$2132, matchEnv$2133;
        var rest$2134;
        var success$2135;
        if (typeof pattern$2127.inner !== 'undefined') {
            if (pattern$2127.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2131 = matchPatterns$2068(pattern$2127.inner, stx$2128, env$2129, true);
                rest$2134 = subMatch$2131.rest;
            } else if (stx$2128[0] && stx$2128[0].token.type === parser$2047.Token.Delimiter && stx$2128[0].token.value === pattern$2127.value) {
                stx$2128[0].expose();
                if (pattern$2127.inner.length === 0 && stx$2128[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2128,
                        patternEnv: patternEnv$2130
                    };
                }
                subMatch$2131 = matchPatterns$2068(pattern$2127.inner, stx$2128[0].token.inner, env$2129, false);
                rest$2134 = stx$2128.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2128,
                    patternEnv: patternEnv$2130
                };
            }
            success$2135 = subMatch$2131.success;
            // merge the subpattern matches with the current pattern environment
            _$2045.keys(subMatch$2131.patternEnv).forEach(function (patternKey$2136) {
                if (pattern$2127.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2137 = subMatch$2131.patternEnv[patternKey$2136].level + 1;
                    if (patternEnv$2130[patternKey$2136]) {
                        patternEnv$2130[patternKey$2136].level = nextLevel$2137;
                        patternEnv$2130[patternKey$2136].match.push(subMatch$2131.patternEnv[patternKey$2136]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2130[patternKey$2136] = {
                            level: nextLevel$2137,
                            match: [subMatch$2131.patternEnv[patternKey$2136]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2130[patternKey$2136] = subMatch$2131.patternEnv[patternKey$2136];
                }
            });
        } else {
            if (pattern$2127.class === 'pattern_literal') {
                // wildcard
                if (stx$2128[0] && pattern$2127.value === '_') {
                    success$2135 = true;
                    rest$2134 = stx$2128.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2128[0] && pattern$2127.value === stx$2128[0].token.value) {
                    success$2135 = true;
                    rest$2134 = stx$2128.slice(1);
                } else {
                    success$2135 = false;
                    rest$2134 = stx$2128;
                }
            } else {
                match$2132 = matchPatternClass$2067(pattern$2127.class, stx$2128, env$2129);
                success$2135 = match$2132.result !== null;
                rest$2134 = match$2132.rest;
                matchEnv$2133 = {
                    level: 0,
                    match: match$2132.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2127.repeat) {
                    if (patternEnv$2130[pattern$2127.value] && success$2135) {
                        patternEnv$2130[pattern$2127.value].match.push(matchEnv$2133);
                    } else if (patternEnv$2130[pattern$2127.value] == undefined) {
                        // initialize if necessary
                        patternEnv$2130[pattern$2127.value] = {
                            level: 1,
                            match: [matchEnv$2133]
                        };
                    }
                } else {
                    patternEnv$2130[pattern$2127.value] = matchEnv$2133;
                }
            }
        }
        return {
            success: success$2135,
            rest: rest$2134,
            patternEnv: patternEnv$2130
        };
    }
    function matchLookbehind$2070(patterns$2138, stx$2139, terms$2140, env$2141) {
        return {
            success: true,
            patternEnv: {},
            prevStx: null,
            prevTerms: null
        };
    }
    function hasMatch$2071(m$2142) {
        if (m$2142.level === 0) {
            return m$2142.match.length > 0;
        }
        return m$2142.match.every(function (m$2143) {
            return hasMatch$2071(m$2143);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$2072(macroBody$2144, macroNameStx$2145, env$2146) {
        return _$2045.chain(macroBody$2144).reduce(function (acc$2147, bodyStx$2148, idx$2149, original$2150) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2151 = original$2150[idx$2149 - 1];
            var next$2152 = original$2150[idx$2149 + 1];
            var nextNext$2153 = original$2150[idx$2149 + 2];
            // drop `...`
            if (bodyStx$2148.token.value === '...') {
                return acc$2147;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$2060(bodyStx$2148) && next$2152 && next$2152.token.value === '...') {
                return acc$2147;
            }
            // skip the $ in $(...)
            if (bodyStx$2148.token.value === '$' && next$2152 && next$2152.token.type === parser$2047.Token.Delimiter && next$2152.token.value === '()') {
                return acc$2147;
            }
            // mark $[...] as a literal
            if (bodyStx$2148.token.value === '$' && next$2152 && next$2152.token.type === parser$2047.Token.Delimiter && next$2152.token.value === '[]') {
                next$2152.literal = true;
                return acc$2147;
            }
            if (bodyStx$2148.token.type === parser$2047.Token.Delimiter && bodyStx$2148.token.value === '()' && last$2151 && last$2151.token.value === '$') {
                bodyStx$2148.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2148.literal === true) {
                assert$2055(bodyStx$2148.token.type === parser$2047.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2147.concat(bodyStx$2148.token.inner);
            }
            if (next$2152 && next$2152.token.value === '...') {
                bodyStx$2148.repeat = true;
                bodyStx$2148.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$2060(next$2152) && nextNext$2153 && nextNext$2153.token.value === '...') {
                bodyStx$2148.repeat = true;
                bodyStx$2148.separator = next$2152.token.inner[0].token.value;
            }
            return acc$2147.concat(bodyStx$2148);
        }, []).reduce(function (acc$2154, bodyStx$2155, idx$2156) {
            // then do the actual transcription
            if (bodyStx$2155.repeat) {
                if (bodyStx$2155.token.type === parser$2047.Token.Delimiter) {
                    bodyStx$2155.expose();
                    var fv$2157 = _$2045.filter(freeVarsInPattern$2057(bodyStx$2155.token.inner), function (pat$2164) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2146.hasOwnProperty(pat$2164);
                        });
                    var restrictedEnv$2158 = [];
                    var nonScalar$2159 = _$2045.find(fv$2157, function (pat$2165) {
                            return env$2146[pat$2165].level > 0;
                        });
                    assert$2055(typeof nonScalar$2159 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2160 = env$2146[nonScalar$2159].match.length;
                    var sameLength$2161 = _$2045.all(fv$2157, function (pat$2166) {
                            return env$2146[pat$2166].level === 0 || env$2146[pat$2166].match.length === repeatLength$2160;
                        });
                    assert$2055(sameLength$2161, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$2045.each(_$2045.range(repeatLength$2160), function (idx$2167) {
                        var renv$2168 = {};
                        _$2045.each(fv$2157, function (pat$2170) {
                            if (env$2146[pat$2170].level === 0) {
                                // copy scalars over
                                renv$2168[pat$2170] = env$2146[pat$2170];
                            } else {
                                // grab the match at this index 
                                renv$2168[pat$2170] = env$2146[pat$2170].match[idx$2167];
                            }
                        });
                        var allHaveMatch$2169 = Object.keys(renv$2168).every(function (pat$2171) {
                                return hasMatch$2071(renv$2168[pat$2171]);
                            });
                        if (allHaveMatch$2169) {
                            restrictedEnv$2158.push(renv$2168);
                        }
                    });
                    var transcribed$2162 = _$2045.map(restrictedEnv$2158, function (renv$2172) {
                            if (bodyStx$2155.group) {
                                return transcribe$2072(bodyStx$2155.token.inner, macroNameStx$2145, renv$2172);
                            } else {
                                var newBody$2173 = syntaxFromToken$2051(_$2045.clone(bodyStx$2155.token), bodyStx$2155);
                                newBody$2173.token.inner = transcribe$2072(bodyStx$2155.token.inner, macroNameStx$2145, renv$2172);
                                return newBody$2173;
                            }
                        });
                    var joined$2163;
                    if (bodyStx$2155.group) {
                        joined$2163 = joinSyntaxArr$2054(transcribed$2162, bodyStx$2155.separator);
                    } else {
                        joined$2163 = joinSyntax$2053(transcribed$2162, bodyStx$2155.separator);
                    }
                    return acc$2154.concat(joined$2163);
                }
                if (!env$2146[bodyStx$2155.token.value]) {
                    throwSyntaxError$2056('patterns', 'The pattern variable is not bound for the template', bodyStx$2155);
                } else if (env$2146[bodyStx$2155.token.value].level !== 1) {
                    throwSyntaxError$2056('patterns', 'Ellipses level does not match in the template', bodyStx$2155);
                }
                return acc$2154.concat(joinRepeatedMatch$2062(env$2146[bodyStx$2155.token.value].match, bodyStx$2155.separator));
            } else {
                if (bodyStx$2155.token.type === parser$2047.Token.Delimiter) {
                    bodyStx$2155.expose();
                    var newBody$2174 = syntaxFromToken$2051(_$2045.clone(bodyStx$2155.token), macroBody$2144);
                    newBody$2174.token.inner = transcribe$2072(bodyStx$2155.token.inner, macroNameStx$2145, env$2146);
                    return acc$2154.concat([newBody$2174]);
                }
                if (isPatternVar$2061(bodyStx$2155) && Object.prototype.hasOwnProperty.bind(env$2146)(bodyStx$2155.token.value)) {
                    if (!env$2146[bodyStx$2155.token.value]) {
                        throwSyntaxError$2056('patterns', 'The pattern variable is not bound for the template', bodyStx$2155);
                    } else if (env$2146[bodyStx$2155.token.value].level !== 0) {
                        throwSyntaxError$2056('patterns', 'Ellipses level does not match in the template', bodyStx$2155);
                    }
                    return acc$2154.concat(takeLineContext$2063(bodyStx$2155, env$2146[bodyStx$2155.token.value].match));
                }
                return acc$2154.concat([bodyStx$2155]);
            }
        }, []).value();
    }
    exports$2044.loadPattern = loadPattern$2066;
    exports$2044.matchPatterns = matchPatterns$2068;
    exports$2044.matchLookbehind = matchLookbehind$2070;
    exports$2044.transcribe = transcribe$2072;
    exports$2044.matchPatternClass = matchPatternClass$2067;
    exports$2044.takeLineContext = takeLineContext$2063;
    exports$2044.takeLine = takeLine$2064;
}));
//# sourceMappingURL=patterns.js.map