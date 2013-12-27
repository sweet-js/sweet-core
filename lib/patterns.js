(function (root$1945, factory$1946) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1946(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1946);
    }
}(this, function (exports$1947, _$1948, es6$1949, parser$1950, expander$1951, syntax$1952) {
    var get_expression$1953 = expander$1951.get_expression;
    var syntaxFromToken$1954 = syntax$1952.syntaxFromToken;
    var makePunc$1955 = syntax$1952.makePunc;
    var joinSyntax$1956 = syntax$1952.joinSyntax;
    var joinSyntaxArr$1957 = syntax$1952.joinSyntaxArr;
    var assert$1958 = syntax$1952.assert;
    var throwSyntaxError$1959 = syntax$1952.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1960(pattern$1975) {
        var fv$1976 = [];
        _$1948.each(pattern$1975, function (pat$1977) {
            if (isPatternVar$1964(pat$1977)) {
                fv$1976.push(pat$1977.token.value);
            } else if (pat$1977.token.type === parser$1950.Token.Delimiter) {
                fv$1976 = fv$1976.concat(freeVarsInPattern$1960(pat$1977.token.inner));
            }
        });
        return fv$1976;
    }
    function typeIsLiteral$1961(type$1978) {
        return type$1978 === parser$1950.Token.NullLiteral || type$1978 === parser$1950.Token.NumericLiteral || type$1978 === parser$1950.Token.StringLiteral || type$1978 === parser$1950.Token.RegexLiteral || type$1978 === parser$1950.Token.BooleanLiteral;
    }
    function containsPatternVar$1962(patterns$1979) {
        return _$1948.any(patterns$1979, function (pat$1980) {
            if (pat$1980.token.type === parser$1950.Token.Delimiter) {
                return containsPatternVar$1962(pat$1980.token.inner);
            }
            return isPatternVar$1964(pat$1980);
        });
    }
    function delimIsSeparator$1963(delim$1981) {
        return delim$1981 && delim$1981.token && delim$1981.token.type === parser$1950.Token.Delimiter && delim$1981.token.value === '()' && delim$1981.token.inner.length === 1 && delim$1981.token.inner[0].token.type !== parser$1950.Token.Delimiter && !containsPatternVar$1962(delim$1981.token.inner);
    }
    function isPatternVar$1964(stx$1982) {
        return stx$1982.token.value[0] === '$' && stx$1982.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1965(tojoin$1983, punc$1984) {
        return _$1948.reduce(_$1948.rest(tojoin$1983, 1), function (acc$1985, join$1986) {
            if (punc$1984 === ' ') {
                return acc$1985.concat(join$1986.match);
            }
            return acc$1985.concat(makePunc$1955(punc$1984, _$1948.first(join$1986.match)), join$1986.match);
        }, _$1948.first(tojoin$1983).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1966(from$1987, to$1988) {
        return _$1948.map(to$1988, function (stx$1989) {
            return takeLine$1967(from$1987, stx$1989);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1967(from$1990, to$1991) {
        var next$1992;
        if (to$1991.token.type === parser$1950.Token.Delimiter) {
            if (from$1990.token.type === parser$1950.Token.Delimiter) {
                next$1992 = syntaxFromToken$1954({
                    type: parser$1950.Token.Delimiter,
                    value: to$1991.token.value,
                    inner: takeLineContext$1966(from$1990, to$1991.token.inner),
                    startRange: from$1990.token.startRange,
                    endRange: from$1990.token.endRange,
                    startLineNumber: from$1990.token.startLineNumber,
                    startLineStart: from$1990.token.startLineStart,
                    endLineNumber: from$1990.token.endLineNumber,
                    endLineStart: from$1990.token.endLineStart,
                    sm_startLineNumber: to$1991.token.startLineNumber,
                    sm_endLineNumber: to$1991.token.endLineNumber,
                    sm_startLineStart: to$1991.token.startLineStart,
                    sm_endLineStart: to$1991.token.endLineStart,
                    sm_startRange: to$1991.token.startRange,
                    sm_endRange: to$1991.token.endRange
                }, to$1991);
            } else {
                next$1992 = syntaxFromToken$1954({
                    type: parser$1950.Token.Delimiter,
                    value: to$1991.token.value,
                    inner: takeLineContext$1966(from$1990, to$1991.token.inner),
                    startRange: from$1990.token.range,
                    endRange: from$1990.token.range,
                    startLineNumber: from$1990.token.lineNumber,
                    startLineStart: from$1990.token.lineStart,
                    endLineNumber: from$1990.token.lineNumber,
                    endLineStart: from$1990.token.lineStart,
                    sm_startLineNumber: to$1991.token.startLineNumber,
                    sm_endLineNumber: to$1991.token.endLineNumber,
                    sm_startLineStart: to$1991.token.startLineStart,
                    sm_endLineStart: to$1991.token.endLineStart,
                    sm_startRange: to$1991.token.startRange,
                    sm_endRange: to$1991.token.endRange
                }, to$1991);
            }
        } else {
            if (from$1990.token.type === parser$1950.Token.Delimiter) {
                next$1992 = syntaxFromToken$1954({
                    value: to$1991.token.value,
                    type: to$1991.token.type,
                    lineNumber: from$1990.token.startLineNumber,
                    lineStart: from$1990.token.startLineStart,
                    range: from$1990.token.startRange,
                    sm_lineNumber: to$1991.token.lineNumber,
                    sm_lineStart: to$1991.token.lineStart,
                    sm_range: to$1991.token.range
                }, to$1991);
            } else {
                next$1992 = syntaxFromToken$1954({
                    value: to$1991.token.value,
                    type: to$1991.token.type,
                    lineNumber: from$1990.token.lineNumber,
                    lineStart: from$1990.token.lineStart,
                    range: from$1990.token.range,
                    sm_lineNumber: to$1991.token.lineNumber,
                    sm_lineStart: to$1991.token.lineStart,
                    sm_range: to$1991.token.range
                }, to$1991);
            }
        }
        if (to$1991.token.leadingComments) {
            next$1992.token.leadingComments = to$1991.token.leadingComments;
        }
        if (to$1991.token.trailingComments) {
            next$1992.token.trailingComments = to$1991.token.trailingComments;
        }
        return next$1992;
    }
    function loadLiteralGroup$1968(patterns$1993) {
        _$1948.forEach(patterns$1993, function (patStx$1994) {
            if (patStx$1994.token.type === parser$1950.Token.Delimiter) {
                patStx$1994.token.inner = loadLiteralGroup$1968(patStx$1994.token.inner);
            } else {
                patStx$1994.class = 'pattern_literal';
            }
        });
        return patterns$1993;
    }
    function loadPattern$1969(patterns$1995) {
        return _$1948.chain(patterns$1995).reduce(function (acc$1996, patStx$1997, idx$1998) {
            var last$1999 = patterns$1995[idx$1998 - 1];
            var lastLast$2000 = patterns$1995[idx$1998 - 2];
            var next$2001 = patterns$1995[idx$1998 + 1];
            var nextNext$2002 = patterns$1995[idx$1998 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1997.token.value === ':') {
                if (last$1999 && isPatternVar$1964(last$1999) && !isPatternVar$1964(next$2001)) {
                    return acc$1996;
                }
            }
            if (last$1999 && last$1999.token.value === ':') {
                if (lastLast$2000 && isPatternVar$1964(lastLast$2000) && !isPatternVar$1964(patStx$1997)) {
                    return acc$1996;
                }
            }
            // skip over $
            if (patStx$1997.token.value === '$' && next$2001 && next$2001.token.type === parser$1950.Token.Delimiter) {
                return acc$1996;
            }
            if (isPatternVar$1964(patStx$1997)) {
                if (next$2001 && next$2001.token.value === ':' && !isPatternVar$1964(nextNext$2002)) {
                    if (typeof nextNext$2002 === 'undefined') {
                        throwSyntaxError$1959('patterns', 'expecting a pattern class following a `:`', next$2001);
                    }
                    patStx$1997.class = nextNext$2002.token.value;
                } else {
                    patStx$1997.class = 'token';
                }
            } else if (patStx$1997.token.type === parser$1950.Token.Delimiter) {
                if (last$1999 && last$1999.token.value === '$') {
                    patStx$1997.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1997.class === 'pattern_group' && patStx$1997.token.value === '[]') {
                    patStx$1997.token.inner = loadLiteralGroup$1968(patStx$1997.token.inner);
                } else {
                    patStx$1997.token.inner = loadPattern$1969(patStx$1997.token.inner);
                }
            } else {
                patStx$1997.class = 'pattern_literal';
            }
            return acc$1996.concat(patStx$1997);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2003, patStx$2004, idx$2005, patterns$2006) {
            var separator$2007 = patStx$2004.separator || ' ';
            var repeat$2008 = patStx$2004.repeat || false;
            var next$2009 = patterns$2006[idx$2005 + 1];
            var nextNext$2010 = patterns$2006[idx$2005 + 2];
            if (next$2009 && next$2009.token.value === '...') {
                repeat$2008 = true;
                separator$2007 = ' ';
            } else if (delimIsSeparator$1963(next$2009) && nextNext$2010 && nextNext$2010.token.value === '...') {
                repeat$2008 = true;
                assert$1958(next$2009.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2007 = next$2009.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$2004.token.value === '...' || delimIsSeparator$1963(patStx$2004) && next$2009 && next$2009.token.value === '...') {
                return acc$2003;
            }
            patStx$2004.repeat = repeat$2008;
            patStx$2004.separator = separator$2007;
            return acc$2003.concat(patStx$2004);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1970(patternClass$2011, stx$2012, env$2013) {
        var result$2014, rest$2015, match$2016;
        // pattern has no parse class
        if (patternClass$2011 === 'token' && stx$2012[0] && stx$2012[0].token.type !== parser$1950.Token.EOF) {
            result$2014 = [stx$2012[0]];
            rest$2015 = stx$2012.slice(1);
        } else if (patternClass$2011 === 'lit' && stx$2012[0] && typeIsLiteral$1961(stx$2012[0].token.type)) {
            result$2014 = [stx$2012[0]];
            rest$2015 = stx$2012.slice(1);
        } else if (patternClass$2011 === 'ident' && stx$2012[0] && stx$2012[0].token.type === parser$1950.Token.Identifier) {
            result$2014 = [stx$2012[0]];
            rest$2015 = stx$2012.slice(1);
        } else if (stx$2012.length > 0 && patternClass$2011 === 'VariableStatement') {
            match$2016 = expander$1951.enforest(stx$2012, expander$1951.makeExpanderContext({ env: env$2013 }));
            if (match$2016.result && match$2016.result.hasPrototype(expander$1951.VariableStatement)) {
                result$2014 = match$2016.result.destruct(false);
                rest$2015 = match$2016.rest;
            } else {
                result$2014 = null;
                rest$2015 = stx$2012;
            }
        } else if (stx$2012.length > 0 && patternClass$2011 === 'expr') {
            match$2016 = expander$1951.get_expression(stx$2012, expander$1951.makeExpanderContext({ env: env$2013 }));
            if (match$2016.result === null || !match$2016.result.hasPrototype(expander$1951.Expr)) {
                result$2014 = null;
                rest$2015 = stx$2012;
            } else {
                result$2014 = match$2016.result.destruct(false);
                rest$2015 = match$2016.rest;
            }
        } else {
            result$2014 = null;
            rest$2015 = stx$2012;
        }
        return {
            result: result$2014,
            rest: rest$2015
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1971(patterns$2017, stx$2018, env$2019, topLevel$2020) {
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
        topLevel$2020 = topLevel$2020 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2021 = [];
        var patternEnv$2022 = {};
        var match$2023;
        var pattern$2024;
        var rest$2025 = stx$2018;
        var success$2026 = true;
        patternLoop:
            for (var i$2027 = 0; i$2027 < patterns$2017.length; i$2027++) {
                if (success$2026 === false) {
                    break;
                }
                pattern$2024 = patterns$2017[i$2027];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2024.repeat && i$2027 + 1 < patterns$2017.length) {
                        var restMatch$2028 = matchPatterns$1971(patterns$2017.slice(i$2027 + 1), rest$2025, env$2019, topLevel$2020);
                        if (restMatch$2028.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2023 = matchPattern$1972(pattern$2024, [], env$2019, patternEnv$2022);
                            patternEnv$2022 = _$1948.extend(restMatch$2028.patternEnv, match$2023.patternEnv);
                            rest$2025 = restMatch$2028.rest;
                            break patternLoop;
                        }
                    }
                    match$2023 = matchPattern$1972(pattern$2024, rest$2025, env$2019, patternEnv$2022);
                    if (!match$2023.success && pattern$2024.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2023.success) {
                        success$2026 = false;
                        break;
                    }
                    rest$2025 = match$2023.rest;
                    patternEnv$2022 = match$2023.patternEnv;
                    if (success$2026 && !(topLevel$2020 || pattern$2024.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2027 == patterns$2017.length - 1 && rest$2025.length !== 0) {
                            success$2026 = false;
                            break;
                        }
                    }
                    if (pattern$2024.repeat && success$2026) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2024.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2025[0] && rest$2025[0].token.value === pattern$2024.separator) {
                            // more tokens and the next token matches the separator
                            rest$2025 = rest$2025.slice(1);
                        } else if (pattern$2024.separator !== ' ' && rest$2025.length > 0 && i$2027 === patterns$2017.length - 1 && topLevel$2020 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2026 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2024.repeat && success$2026 && rest$2025.length > 0);
            }
        return {
            success: success$2026,
            rest: rest$2025,
            patternEnv: patternEnv$2022
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
    function matchPattern$1972(pattern$2029, stx$2030, env$2031, patternEnv$2032) {
        var subMatch$2033;
        var match$2034, matchEnv$2035;
        var rest$2036;
        var success$2037;
        if (typeof pattern$2029.inner !== 'undefined') {
            if (pattern$2029.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2033 = matchPatterns$1971(pattern$2029.inner, stx$2030, env$2031, true);
                rest$2036 = subMatch$2033.rest;
            } else if (stx$2030[0] && stx$2030[0].token.type === parser$1950.Token.Delimiter && stx$2030[0].token.value === pattern$2029.value) {
                stx$2030[0].expose();
                if (pattern$2029.inner.length === 0 && stx$2030[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2030,
                        patternEnv: patternEnv$2032
                    };
                }
                subMatch$2033 = matchPatterns$1971(pattern$2029.inner, stx$2030[0].token.inner, env$2031, false);
                rest$2036 = stx$2030.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2030,
                    patternEnv: patternEnv$2032
                };
            }
            success$2037 = subMatch$2033.success;
            // merge the subpattern matches with the current pattern environment
            _$1948.keys(subMatch$2033.patternEnv).forEach(function (patternKey$2038) {
                if (pattern$2029.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2039 = subMatch$2033.patternEnv[patternKey$2038].level + 1;
                    if (patternEnv$2032[patternKey$2038]) {
                        patternEnv$2032[patternKey$2038].level = nextLevel$2039;
                        patternEnv$2032[patternKey$2038].match.push(subMatch$2033.patternEnv[patternKey$2038]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2032[patternKey$2038] = {
                            level: nextLevel$2039,
                            match: [subMatch$2033.patternEnv[patternKey$2038]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2032[patternKey$2038] = subMatch$2033.patternEnv[patternKey$2038];
                }
            });
        } else {
            if (pattern$2029.class === 'pattern_literal') {
                // wildcard
                if (stx$2030[0] && pattern$2029.value === '_') {
                    success$2037 = true;
                    rest$2036 = stx$2030.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2030[0] && pattern$2029.value === stx$2030[0].token.value) {
                    success$2037 = true;
                    rest$2036 = stx$2030.slice(1);
                } else {
                    success$2037 = false;
                    rest$2036 = stx$2030;
                }
            } else {
                match$2034 = matchPatternClass$1970(pattern$2029.class, stx$2030, env$2031);
                success$2037 = match$2034.result !== null;
                rest$2036 = match$2034.rest;
                matchEnv$2035 = {
                    level: 0,
                    match: match$2034.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2029.repeat) {
                    if (patternEnv$2032[pattern$2029.value] && success$2037) {
                        patternEnv$2032[pattern$2029.value].match.push(matchEnv$2035);
                    } else if (patternEnv$2032[pattern$2029.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2032[pattern$2029.value] = {
                            level: 1,
                            match: [matchEnv$2035]
                        };
                    }
                } else {
                    patternEnv$2032[pattern$2029.value] = matchEnv$2035;
                }
            }
        }
        return {
            success: success$2037,
            rest: rest$2036,
            patternEnv: patternEnv$2032
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
    function hasMatch$1973(m$2040) {
        if (m$2040.level === 0) {
            return m$2040.match.length > 0;
        }
        return m$2040.match.every(function (m$2041) {
            return hasMatch$1973(m$2041);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1974(macroBody$2042, macroNameStx$2043, env$2044) {
        return _$1948.chain(macroBody$2042).reduce(function (acc$2045, bodyStx$2046, idx$2047, original$2048) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2049 = original$2048[idx$2047 - 1];
            var next$2050 = original$2048[idx$2047 + 1];
            var nextNext$2051 = original$2048[idx$2047 + 2];
            // drop `...`
            if (bodyStx$2046.token.value === '...') {
                return acc$2045;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1963(bodyStx$2046) && next$2050 && next$2050.token.value === '...') {
                return acc$2045;
            }
            // skip the $ in $(...)
            if (bodyStx$2046.token.value === '$' && next$2050 && next$2050.token.type === parser$1950.Token.Delimiter && next$2050.token.value === '()') {
                return acc$2045;
            }
            // mark $[...] as a literal
            if (bodyStx$2046.token.value === '$' && next$2050 && next$2050.token.type === parser$1950.Token.Delimiter && next$2050.token.value === '[]') {
                next$2050.literal = true;
                return acc$2045;
            }
            if (bodyStx$2046.token.type === parser$1950.Token.Delimiter && bodyStx$2046.token.value === '()' && last$2049 && last$2049.token.value === '$') {
                bodyStx$2046.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2046.literal === true) {
                assert$1958(bodyStx$2046.token.type === parser$1950.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2045.concat(bodyStx$2046.token.inner);
            }
            if (next$2050 && next$2050.token.value === '...') {
                bodyStx$2046.repeat = true;
                bodyStx$2046.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1963(next$2050) && nextNext$2051 && nextNext$2051.token.value === '...') {
                bodyStx$2046.repeat = true;
                bodyStx$2046.separator = next$2050.token.inner[0].token.value;
            }
            return acc$2045.concat(bodyStx$2046);
        }, []).reduce(function (acc$2052, bodyStx$2053, idx$2054) {
            // then do the actual transcription
            if (bodyStx$2053.repeat) {
                if (bodyStx$2053.token.type === parser$1950.Token.Delimiter) {
                    bodyStx$2053.expose();
                    var fv$2055 = _$1948.filter(freeVarsInPattern$1960(bodyStx$2053.token.inner), function (pat$2062) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2044.hasOwnProperty(pat$2062);
                        });
                    var restrictedEnv$2056 = [];
                    var nonScalar$2057 = _$1948.find(fv$2055, function (pat$2063) {
                            return env$2044[pat$2063].level > 0;
                        });
                    assert$1958(typeof nonScalar$2057 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2058 = env$2044[nonScalar$2057].match.length;
                    var sameLength$2059 = _$1948.all(fv$2055, function (pat$2064) {
                            return env$2044[pat$2064].level === 0 || env$2044[pat$2064].match.length === repeatLength$2058;
                        });
                    assert$1958(sameLength$2059, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1948.each(_$1948.range(repeatLength$2058), function (idx$2065) {
                        var renv$2066 = {};
                        _$1948.each(fv$2055, function (pat$2068) {
                            if (env$2044[pat$2068].level === 0) {
                                // copy scalars over
                                renv$2066[pat$2068] = env$2044[pat$2068];
                            } else {
                                // grab the match at this index 
                                renv$2066[pat$2068] = env$2044[pat$2068].match[idx$2065];
                            }
                        });
                        var allHaveMatch$2067 = Object.keys(renv$2066).every(function (pat$2069) {
                                return hasMatch$1973(renv$2066[pat$2069]);
                            });
                        if (allHaveMatch$2067) {
                            restrictedEnv$2056.push(renv$2066);
                        }
                    });
                    var transcribed$2060 = _$1948.map(restrictedEnv$2056, function (renv$2070) {
                            if (bodyStx$2053.group) {
                                return transcribe$1974(bodyStx$2053.token.inner, macroNameStx$2043, renv$2070);
                            } else {
                                var newBody$2071 = syntaxFromToken$1954(_$1948.clone(bodyStx$2053.token), bodyStx$2053);
                                newBody$2071.token.inner = transcribe$1974(bodyStx$2053.token.inner, macroNameStx$2043, renv$2070);
                                return newBody$2071;
                            }
                        });
                    var joined$2061;
                    if (bodyStx$2053.group) {
                        joined$2061 = joinSyntaxArr$1957(transcribed$2060, bodyStx$2053.separator);
                    } else {
                        joined$2061 = joinSyntax$1956(transcribed$2060, bodyStx$2053.separator);
                    }
                    return acc$2052.concat(joined$2061);
                }
                if (!env$2044[bodyStx$2053.token.value]) {
                    throwSyntaxError$1959('patterns', 'The pattern variable is not bound for the template', bodyStx$2053);
                } else if (env$2044[bodyStx$2053.token.value].level !== 1) {
                    throwSyntaxError$1959('patterns', 'Ellipses level does not match in the template', bodyStx$2053);
                }
                return acc$2052.concat(joinRepeatedMatch$1965(env$2044[bodyStx$2053.token.value].match, bodyStx$2053.separator));
            } else {
                if (bodyStx$2053.token.type === parser$1950.Token.Delimiter) {
                    bodyStx$2053.expose();
                    var newBody$2072 = syntaxFromToken$1954(_$1948.clone(bodyStx$2053.token), macroBody$2042);
                    newBody$2072.token.inner = transcribe$1974(bodyStx$2053.token.inner, macroNameStx$2043, env$2044);
                    return acc$2052.concat([newBody$2072]);
                }
                if (isPatternVar$1964(bodyStx$2053) && Object.prototype.hasOwnProperty.bind(env$2044)(bodyStx$2053.token.value)) {
                    if (!env$2044[bodyStx$2053.token.value]) {
                        throwSyntaxError$1959('patterns', 'The pattern variable is not bound for the template', bodyStx$2053);
                    } else if (env$2044[bodyStx$2053.token.value].level !== 0) {
                        throwSyntaxError$1959('patterns', 'Ellipses level does not match in the template', bodyStx$2053);
                    }
                    return acc$2052.concat(takeLineContext$1966(bodyStx$2053, env$2044[bodyStx$2053.token.value].match));
                }
                return acc$2052.concat([bodyStx$2053]);
            }
        }, []).value();
    }
    exports$1947.loadPattern = loadPattern$1969;
    exports$1947.matchPatterns = matchPatterns$1971;
    exports$1947.matchLookbehind = matchLookbehind$2070;
    exports$1947.transcribe = transcribe$1974;
    exports$1947.matchPatternClass = matchPatternClass$1970;
    exports$1947.takeLineContext = takeLineContext$1966;
    exports$1947.takeLine = takeLine$1967;
}));
//# sourceMappingURL=patterns.js.map
