(function (root$1949, factory$1950) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1950(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1950);
    }
}(this, function (exports$1951, _$1952, es6$1953, parser$1954, expander$1955, syntax$1956) {
    var get_expression$1957 = expander$1955.get_expression;
    var syntaxFromToken$1958 = syntax$1956.syntaxFromToken;
    var makePunc$1959 = syntax$1956.makePunc;
    var joinSyntax$1960 = syntax$1956.joinSyntax;
    var joinSyntaxArr$1961 = syntax$1956.joinSyntaxArr;
    var assert$1962 = syntax$1956.assert;
    var throwSyntaxError$1963 = syntax$1956.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1964(pattern$1979) {
        var fv$1980 = [];
        _$1952.each(pattern$1979, function (pat$1981) {
            if (isPatternVar$1968(pat$1981)) {
                fv$1980.push(pat$1981.token.value);
            } else if (pat$1981.token.type === parser$1954.Token.Delimiter) {
                fv$1980 = fv$1980.concat(freeVarsInPattern$1964(pat$1981.token.inner));
            }
        });
        return fv$1980;
    }
    function typeIsLiteral$1965(type$1982) {
        return type$1982 === parser$1954.Token.NullLiteral || type$1982 === parser$1954.Token.NumericLiteral || type$1982 === parser$1954.Token.StringLiteral || type$1982 === parser$1954.Token.RegexLiteral || type$1982 === parser$1954.Token.BooleanLiteral;
    }
    function containsPatternVar$1966(patterns$1983) {
        return _$1952.any(patterns$1983, function (pat$1984) {
            if (pat$1984.token.type === parser$1954.Token.Delimiter) {
                return containsPatternVar$1966(pat$1984.token.inner);
            }
            return isPatternVar$1968(pat$1984);
        });
    }
    function delimIsSeparator$1967(delim$1985) {
        return delim$1985 && delim$1985.token && delim$1985.token.type === parser$1954.Token.Delimiter && delim$1985.token.value === '()' && delim$1985.token.inner.length === 1 && delim$1985.token.inner[0].token.type !== parser$1954.Token.Delimiter && !containsPatternVar$1966(delim$1985.token.inner);
    }
    function isPatternVar$1968(stx$1986) {
        return stx$1986.token.value[0] === '$' && stx$1986.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1969(tojoin$1987, punc$1988) {
        return _$1952.reduce(_$1952.rest(tojoin$1987, 1), function (acc$1989, join$1990) {
            if (punc$1988 === ' ') {
                return acc$1989.concat(join$1990.match);
            }
            return acc$1989.concat(makePunc$1959(punc$1988, _$1952.first(join$1990.match)), join$1990.match);
        }, _$1952.first(tojoin$1987).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1970(from$1991, to$1992) {
        return _$1952.map(to$1992, function (stx$1993) {
            return takeLine$1971(from$1991, stx$1993);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1971(from$1994, to$1995) {
        var next$1996;
        if (to$1995.token.type === parser$1954.Token.Delimiter) {
            if (from$1994.token.type === parser$1954.Token.Delimiter) {
                next$1996 = syntaxFromToken$1958({
                    type: parser$1954.Token.Delimiter,
                    value: to$1995.token.value,
                    inner: takeLineContext$1970(from$1994, to$1995.token.inner),
                    startRange: from$1994.token.startRange,
                    endRange: from$1994.token.endRange,
                    startLineNumber: from$1994.token.startLineNumber,
                    startLineStart: from$1994.token.startLineStart,
                    endLineNumber: from$1994.token.endLineNumber,
                    endLineStart: from$1994.token.endLineStart,
                    sm_startLineNumber: to$1995.token.startLineNumber,
                    sm_endLineNumber: to$1995.token.endLineNumber,
                    sm_startLineStart: to$1995.token.startLineStart,
                    sm_endLineStart: to$1995.token.endLineStart,
                    sm_startRange: to$1995.token.startRange,
                    sm_endRange: to$1995.token.endRange
                }, to$1995);
            } else {
                next$1996 = syntaxFromToken$1958({
                    type: parser$1954.Token.Delimiter,
                    value: to$1995.token.value,
                    inner: takeLineContext$1970(from$1994, to$1995.token.inner),
                    startRange: from$1994.token.range,
                    endRange: from$1994.token.range,
                    startLineNumber: from$1994.token.lineNumber,
                    startLineStart: from$1994.token.lineStart,
                    endLineNumber: from$1994.token.lineNumber,
                    endLineStart: from$1994.token.lineStart,
                    sm_startLineNumber: to$1995.token.startLineNumber,
                    sm_endLineNumber: to$1995.token.endLineNumber,
                    sm_startLineStart: to$1995.token.startLineStart,
                    sm_endLineStart: to$1995.token.endLineStart,
                    sm_startRange: to$1995.token.startRange,
                    sm_endRange: to$1995.token.endRange
                }, to$1995);
            }
        } else {
            if (from$1994.token.type === parser$1954.Token.Delimiter) {
                next$1996 = syntaxFromToken$1958({
                    value: to$1995.token.value,
                    type: to$1995.token.type,
                    lineNumber: from$1994.token.startLineNumber,
                    lineStart: from$1994.token.startLineStart,
                    range: from$1994.token.startRange,
                    sm_lineNumber: to$1995.token.lineNumber,
                    sm_lineStart: to$1995.token.lineStart,
                    sm_range: to$1995.token.range
                }, to$1995);
            } else {
                next$1996 = syntaxFromToken$1958({
                    value: to$1995.token.value,
                    type: to$1995.token.type,
                    lineNumber: from$1994.token.lineNumber,
                    lineStart: from$1994.token.lineStart,
                    range: from$1994.token.range,
                    sm_lineNumber: to$1995.token.lineNumber,
                    sm_lineStart: to$1995.token.lineStart,
                    sm_range: to$1995.token.range
                }, to$1995);
            }
        }
        if (to$1995.token.leadingComments) {
            next$1996.token.leadingComments = to$1995.token.leadingComments;
        }
        if (to$1995.token.trailingComments) {
            next$1996.token.trailingComments = to$1995.token.trailingComments;
        }
        return next$1996;
    }
    function loadLiteralGroup$1972(patterns$1997) {
        _$1952.forEach(patterns$1997, function (patStx$1998) {
            if (patStx$1998.token.type === parser$1954.Token.Delimiter) {
                patStx$1998.token.inner = loadLiteralGroup$1972(patStx$1998.token.inner);
            } else {
                patStx$1998.class = 'pattern_literal';
            }
        });
        return patterns$1997;
    }
    function loadPattern$1973(patterns$1999) {
        return _$1952.chain(patterns$1999).reduce(function (acc$2000, patStx$2001, idx$2002) {
            var last$2003 = patterns$1999[idx$2002 - 1];
            var lastLast$2004 = patterns$1999[idx$2002 - 2];
            var next$2005 = patterns$1999[idx$2002 + 1];
            var nextNext$2006 = patterns$1999[idx$2002 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$2001.token.value === ':') {
                if (last$2003 && isPatternVar$1968(last$2003) && !isPatternVar$1968(next$2005)) {
                    return acc$2000;
                }
            }
            if (last$2003 && last$2003.token.value === ':') {
                if (lastLast$2004 && isPatternVar$1968(lastLast$2004) && !isPatternVar$1968(patStx$2001)) {
                    return acc$2000;
                }
            }
            // skip over $
            if (patStx$2001.token.value === '$' && next$2005 && next$2005.token.type === parser$1954.Token.Delimiter) {
                return acc$2000;
            }
            if (isPatternVar$1968(patStx$2001)) {
                if (next$2005 && next$2005.token.value === ':' && !isPatternVar$1968(nextNext$2006)) {
                    if (typeof nextNext$2006 === 'undefined') {
                        throwSyntaxError$1963('patterns', 'expecting a pattern class following a `:`', next$2005);
                    }
                    patStx$2001.class = nextNext$2006.token.value;
                } else {
                    patStx$2001.class = 'token';
                }
            } else if (patStx$2001.token.type === parser$1954.Token.Delimiter) {
                if (last$2003 && last$2003.token.value === '$') {
                    patStx$2001.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$2001.class === 'pattern_group' && patStx$2001.token.value === '[]') {
                    patStx$2001.token.inner = loadLiteralGroup$1972(patStx$2001.token.inner);
                } else {
                    patStx$2001.token.inner = loadPattern$1973(patStx$2001.token.inner);
                }
            } else {
                patStx$2001.class = 'pattern_literal';
            }
            return acc$2000.concat(patStx$2001);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2007, patStx$2008, idx$2009, patterns$2010) {
            var separator$2011 = patStx$2008.separator || ' ';
            var repeat$2012 = patStx$2008.repeat || false;
            var next$2013 = patterns$2010[idx$2009 + 1];
            var nextNext$2014 = patterns$2010[idx$2009 + 2];
            if (next$2013 && next$2013.token.value === '...') {
                repeat$2012 = true;
                separator$2011 = ' ';
            } else if (delimIsSeparator$1967(next$2013) && nextNext$2014 && nextNext$2014.token.value === '...') {
                repeat$2012 = true;
                assert$1962(next$2013.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2011 = next$2013.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$2008.token.value === '...' || delimIsSeparator$1967(patStx$2008) && next$2013 && next$2013.token.value === '...') {
                return acc$2007;
            }
            patStx$2008.repeat = repeat$2012;
            patStx$2008.separator = separator$2011;
            return acc$2007.concat(patStx$2008);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1974(patternClass$2015, stx$2016, env$2017) {
        var result$2018, rest$2019, match$2020;
        // pattern has no parse class
        if (patternClass$2015 === 'token' && stx$2016[0] && stx$2016[0].token.type !== parser$1954.Token.EOF) {
            result$2018 = [stx$2016[0]];
            rest$2019 = stx$2016.slice(1);
        } else if (patternClass$2015 === 'lit' && stx$2016[0] && typeIsLiteral$1965(stx$2016[0].token.type)) {
            result$2018 = [stx$2016[0]];
            rest$2019 = stx$2016.slice(1);
        } else if (patternClass$2015 === 'ident' && stx$2016[0] && stx$2016[0].token.type === parser$1954.Token.Identifier) {
            result$2018 = [stx$2016[0]];
            rest$2019 = stx$2016.slice(1);
        } else if (stx$2016.length > 0 && patternClass$2015 === 'VariableStatement') {
            match$2020 = expander$1955.enforest(stx$2016, expander$1955.makeExpanderContext({ env: env$2017 }));
            if (match$2020.result && match$2020.result.hasPrototype(expander$1955.VariableStatement)) {
                result$2018 = match$2020.result.destruct(false);
                rest$2019 = match$2020.rest;
            } else {
                result$2018 = null;
                rest$2019 = stx$2016;
            }
        } else if (stx$2016.length > 0 && patternClass$2015 === 'expr') {
            match$2020 = expander$1955.get_expression(stx$2016, expander$1955.makeExpanderContext({ env: env$2017 }));
            if (match$2020.result === null || !match$2020.result.hasPrototype(expander$1955.Expr)) {
                result$2018 = null;
                rest$2019 = stx$2016;
            } else {
                result$2018 = match$2020.result.destruct(false);
                rest$2019 = match$2020.rest;
            }
        } else {
            result$2018 = null;
            rest$2019 = stx$2016;
        }
        return {
            result: result$2018,
            rest: rest$2019
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1975(patterns$2021, stx$2022, env$2023, topLevel$2024) {
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
        topLevel$2024 = topLevel$2024 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2025 = [];
        var patternEnv$2026 = {};
        var match$2027;
        var pattern$2028;
        var rest$2029 = stx$2022;
        var success$2030 = true;
        patternLoop:
            for (var i$2031 = 0; i$2031 < patterns$2021.length; i$2031++) {
                if (success$2030 === false) {
                    break;
                }
                pattern$2028 = patterns$2021[i$2031];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2028.repeat && i$2031 + 1 < patterns$2021.length) {
                        var restMatch$2032 = matchPatterns$1975(patterns$2021.slice(i$2031 + 1), rest$2029, env$2023, topLevel$2024);
                        if (restMatch$2032.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2027 = matchPattern$1976(pattern$2028, [], env$2023, patternEnv$2026);
                            patternEnv$2026 = _$1952.extend(restMatch$2032.patternEnv, match$2027.patternEnv);
                            rest$2029 = restMatch$2032.rest;
                            break patternLoop;
                        }
                    }
                    match$2027 = matchPattern$1976(pattern$2028, rest$2029, env$2023, patternEnv$2026);
                    if (!match$2027.success && pattern$2028.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2027.success) {
                        success$2030 = false;
                        break;
                    }
                    rest$2029 = match$2027.rest;
                    patternEnv$2026 = match$2027.patternEnv;
                    if (success$2030 && !(topLevel$2024 || pattern$2028.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2031 == patterns$2021.length - 1 && rest$2029.length !== 0) {
                            success$2030 = false;
                            break;
                        }
                    }
                    if (pattern$2028.repeat && success$2030) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2028.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2029[0] && rest$2029[0].token.value === pattern$2028.separator) {
                            // more tokens and the next token matches the separator
                            rest$2029 = rest$2029.slice(1);
                        } else if (pattern$2028.separator !== ' ' && rest$2029.length > 0 && i$2031 === patterns$2021.length - 1 && topLevel$2024 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2030 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2028.repeat && success$2030 && rest$2029.length > 0);
            }
        return {
            success: success$2030,
            rest: rest$2029,
            patternEnv: patternEnv$2026
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
    function matchPattern$1976(pattern$2033, stx$2034, env$2035, patternEnv$2036) {
        var subMatch$2037;
        var match$2038, matchEnv$2039;
        var rest$2040;
        var success$2041;
        if (typeof pattern$2033.inner !== 'undefined') {
            if (pattern$2033.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2037 = matchPatterns$1975(pattern$2033.inner, stx$2034, env$2035, true);
                rest$2040 = subMatch$2037.rest;
            } else if (stx$2034[0] && stx$2034[0].token.type === parser$1954.Token.Delimiter && stx$2034[0].token.value === pattern$2033.value) {
                stx$2034[0].expose();
                if (pattern$2033.inner.length === 0 && stx$2034[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2034,
                        patternEnv: patternEnv$2036
                    };
                }
                subMatch$2037 = matchPatterns$1975(pattern$2033.inner, stx$2034[0].token.inner, env$2035, false);
                rest$2040 = stx$2034.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2034,
                    patternEnv: patternEnv$2036
                };
            }
            success$2041 = subMatch$2037.success;
            // merge the subpattern matches with the current pattern environment
            _$1952.keys(subMatch$2037.patternEnv).forEach(function (patternKey$2042) {
                if (pattern$2033.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2043 = subMatch$2037.patternEnv[patternKey$2042].level + 1;
                    if (patternEnv$2036[patternKey$2042]) {
                        patternEnv$2036[patternKey$2042].level = nextLevel$2043;
                        patternEnv$2036[patternKey$2042].match.push(subMatch$2037.patternEnv[patternKey$2042]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2036[patternKey$2042] = {
                            level: nextLevel$2043,
                            match: [subMatch$2037.patternEnv[patternKey$2042]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2036[patternKey$2042] = subMatch$2037.patternEnv[patternKey$2042];
                }
            });
        } else {
            if (pattern$2033.class === 'pattern_literal') {
                // wildcard
                if (stx$2034[0] && pattern$2033.value === '_') {
                    success$2041 = true;
                    rest$2040 = stx$2034.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2034[0] && pattern$2033.value === stx$2034[0].token.value) {
                    success$2041 = true;
                    rest$2040 = stx$2034.slice(1);
                } else {
                    success$2041 = false;
                    rest$2040 = stx$2034;
                }
            } else {
                match$2038 = matchPatternClass$1974(pattern$2033.class, stx$2034, env$2035);
                success$2041 = match$2038.result !== null;
                rest$2040 = match$2038.rest;
                matchEnv$2039 = {
                    level: 0,
                    match: match$2038.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2033.repeat) {
                    if (patternEnv$2036[pattern$2033.value] && success$2041) {
                        patternEnv$2036[pattern$2033.value].match.push(matchEnv$2039);
                    } else if (patternEnv$2036[pattern$2033.value] === undefined) {
                        // initialize if necessary
                        patternEnv$2036[pattern$2033.value] = {
                            level: 1,
                            match: [matchEnv$2039]
                        };
                    }
                } else {
                    patternEnv$2036[pattern$2033.value] = matchEnv$2039;
                }
            }
        }
        return {
            success: success$2041,
            rest: rest$2040,
            patternEnv: patternEnv$2036
        };
    }
    function hasMatch$1977(m$2044) {
        if (m$2044.level === 0) {
            return m$2044.match.length > 0;
        }
        return m$2044.match.every(function (m$2045) {
            return hasMatch$1977(m$2045);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1978(macroBody$2046, macroNameStx$2047, env$2048) {
        return _$1952.chain(macroBody$2046).reduce(function (acc$2049, bodyStx$2050, idx$2051, original$2052) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2053 = original$2052[idx$2051 - 1];
            var next$2054 = original$2052[idx$2051 + 1];
            var nextNext$2055 = original$2052[idx$2051 + 2];
            // drop `...`
            if (bodyStx$2050.token.value === '...') {
                return acc$2049;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1967(bodyStx$2050) && next$2054 && next$2054.token.value === '...') {
                return acc$2049;
            }
            // skip the $ in $(...)
            if (bodyStx$2050.token.value === '$' && next$2054 && next$2054.token.type === parser$1954.Token.Delimiter && next$2054.token.value === '()') {
                return acc$2049;
            }
            // mark $[...] as a literal
            if (bodyStx$2050.token.value === '$' && next$2054 && next$2054.token.type === parser$1954.Token.Delimiter && next$2054.token.value === '[]') {
                next$2054.literal = true;
                return acc$2049;
            }
            if (bodyStx$2050.token.type === parser$1954.Token.Delimiter && bodyStx$2050.token.value === '()' && last$2053 && last$2053.token.value === '$') {
                bodyStx$2050.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2050.literal === true) {
                assert$1962(bodyStx$2050.token.type === parser$1954.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2049.concat(bodyStx$2050.token.inner);
            }
            if (next$2054 && next$2054.token.value === '...') {
                bodyStx$2050.repeat = true;
                bodyStx$2050.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1967(next$2054) && nextNext$2055 && nextNext$2055.token.value === '...') {
                bodyStx$2050.repeat = true;
                bodyStx$2050.separator = next$2054.token.inner[0].token.value;
            }
            return acc$2049.concat(bodyStx$2050);
        }, []).reduce(function (acc$2056, bodyStx$2057, idx$2058) {
            // then do the actual transcription
            if (bodyStx$2057.repeat) {
                if (bodyStx$2057.token.type === parser$1954.Token.Delimiter) {
                    bodyStx$2057.expose();
                    var fv$2059 = _$1952.filter(freeVarsInPattern$1964(bodyStx$2057.token.inner), function (pat$2066) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2048.hasOwnProperty(pat$2066);
                        });
                    var restrictedEnv$2060 = [];
                    var nonScalar$2061 = _$1952.find(fv$2059, function (pat$2067) {
                            return env$2048[pat$2067].level > 0;
                        });
                    assert$1962(typeof nonScalar$2061 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2062 = env$2048[nonScalar$2061].match.length;
                    var sameLength$2063 = _$1952.all(fv$2059, function (pat$2068) {
                            return env$2048[pat$2068].level === 0 || env$2048[pat$2068].match.length === repeatLength$2062;
                        });
                    assert$1962(sameLength$2063, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1952.each(_$1952.range(repeatLength$2062), function (idx$2069) {
                        var renv$2070 = {};
                        _$1952.each(fv$2059, function (pat$2072) {
                            if (env$2048[pat$2072].level === 0) {
                                // copy scalars over
                                renv$2070[pat$2072] = env$2048[pat$2072];
                            } else {
                                // grab the match at this index 
                                renv$2070[pat$2072] = env$2048[pat$2072].match[idx$2069];
                            }
                        });
                        var allHaveMatch$2071 = Object.keys(renv$2070).every(function (pat$2073) {
                                return hasMatch$1977(renv$2070[pat$2073]);
                            });
                        if (allHaveMatch$2071) {
                            restrictedEnv$2060.push(renv$2070);
                        }
                    });
                    var transcribed$2064 = _$1952.map(restrictedEnv$2060, function (renv$2074) {
                            if (bodyStx$2057.group) {
                                return transcribe$1978(bodyStx$2057.token.inner, macroNameStx$2047, renv$2074);
                            } else {
                                var newBody$2075 = syntaxFromToken$1958(_$1952.clone(bodyStx$2057.token), bodyStx$2057);
                                newBody$2075.token.inner = transcribe$1978(bodyStx$2057.token.inner, macroNameStx$2047, renv$2074);
                                return newBody$2075;
                            }
                        });
                    var joined$2065;
                    if (bodyStx$2057.group) {
                        joined$2065 = joinSyntaxArr$1961(transcribed$2064, bodyStx$2057.separator);
                    } else {
                        joined$2065 = joinSyntax$1960(transcribed$2064, bodyStx$2057.separator);
                    }
                    return acc$2056.concat(joined$2065);
                }
                if (!env$2048[bodyStx$2057.token.value]) {
                    throwSyntaxError$1963('patterns', 'The pattern variable is not bound for the template', bodyStx$2057);
                } else if (env$2048[bodyStx$2057.token.value].level !== 1) {
                    throwSyntaxError$1963('patterns', 'Ellipses level does not match in the template', bodyStx$2057);
                }
                return acc$2056.concat(joinRepeatedMatch$1969(env$2048[bodyStx$2057.token.value].match, bodyStx$2057.separator));
            } else {
                if (bodyStx$2057.token.type === parser$1954.Token.Delimiter) {
                    bodyStx$2057.expose();
                    var newBody$2076 = syntaxFromToken$1958(_$1952.clone(bodyStx$2057.token), macroBody$2046);
                    newBody$2076.token.inner = transcribe$1978(bodyStx$2057.token.inner, macroNameStx$2047, env$2048);
                    return acc$2056.concat([newBody$2076]);
                }
                if (isPatternVar$1968(bodyStx$2057) && Object.prototype.hasOwnProperty.bind(env$2048)(bodyStx$2057.token.value)) {
                    if (!env$2048[bodyStx$2057.token.value]) {
                        throwSyntaxError$1963('patterns', 'The pattern variable is not bound for the template', bodyStx$2057);
                    } else if (env$2048[bodyStx$2057.token.value].level !== 0) {
                        throwSyntaxError$1963('patterns', 'Ellipses level does not match in the template', bodyStx$2057);
                    }
                    return acc$2056.concat(takeLineContext$1970(bodyStx$2057, env$2048[bodyStx$2057.token.value].match));
                }
                return acc$2056.concat([bodyStx$2057]);
            }
        }, []).value();
    }
    exports$1951.loadPattern = loadPattern$1973;
    exports$1951.matchPatterns = matchPatterns$1975;
    exports$1951.transcribe = transcribe$1978;
    exports$1951.matchPatternClass = matchPatternClass$1974;
    exports$1951.takeLineContext = takeLineContext$1970;
    exports$1951.takeLine = takeLine$1971;
}));
//# sourceMappingURL=patterns.js.map