(function (root$1940, factory$1941) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1941(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1941);
    }
}(this, function (exports$1942, _$1943, es6$1944, parser$1945, expander$1946, syntax$1947) {
    var get_expression$1948 = expander$1946.get_expression;
    var syntaxFromToken$1949 = syntax$1947.syntaxFromToken;
    var makePunc$1950 = syntax$1947.makePunc;
    var joinSyntax$1951 = syntax$1947.joinSyntax;
    var joinSyntaxArr$1952 = syntax$1947.joinSyntaxArr;
    var assert$1953 = syntax$1947.assert;
    var throwSyntaxError$1954 = syntax$1947.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1955(pattern$1970) {
        var fv$1971 = [];
        _$1943.each(pattern$1970, function (pat$1972) {
            if (isPatternVar$1959(pat$1972)) {
                fv$1971.push(pat$1972.token.value);
            } else if (pat$1972.token.type === parser$1945.Token.Delimiter) {
                fv$1971 = fv$1971.concat(freeVarsInPattern$1955(pat$1972.token.inner));
            }
        });
        return fv$1971;
    }
    function typeIsLiteral$1956(type$1973) {
        return type$1973 === parser$1945.Token.NullLiteral || type$1973 === parser$1945.Token.NumericLiteral || type$1973 === parser$1945.Token.StringLiteral || type$1973 === parser$1945.Token.RegexLiteral || type$1973 === parser$1945.Token.BooleanLiteral;
    }
    function containsPatternVar$1957(patterns$1974) {
        return _$1943.any(patterns$1974, function (pat$1975) {
            if (pat$1975.token.type === parser$1945.Token.Delimiter) {
                return containsPatternVar$1957(pat$1975.token.inner);
            }
            return isPatternVar$1959(pat$1975);
        });
    }
    function delimIsSeparator$1958(delim$1976) {
        return delim$1976 && delim$1976.token && delim$1976.token.type === parser$1945.Token.Delimiter && delim$1976.token.value === '()' && delim$1976.token.inner.length === 1 && delim$1976.token.inner[0].token.type !== parser$1945.Token.Delimiter && !containsPatternVar$1957(delim$1976.token.inner);
    }
    function isPatternVar$1959(stx$1977) {
        return stx$1977.token.value[0] === '$' && stx$1977.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1960(tojoin$1978, punc$1979) {
        return _$1943.reduce(_$1943.rest(tojoin$1978, 1), function (acc$1980, join$1981) {
            if (punc$1979 === ' ') {
                return acc$1980.concat(join$1981.match);
            }
            return acc$1980.concat(makePunc$1950(punc$1979, _$1943.first(join$1981.match)), join$1981.match);
        }, _$1943.first(tojoin$1978).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1961(from$1982, to$1983) {
        return _$1943.map(to$1983, function (stx$1984) {
            return takeLine$1962(from$1982, stx$1984);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1962(from$1985, to$1986) {
        if (to$1986.token.type === parser$1945.Token.Delimiter) {
            var next$1987;
            if (from$1985.token.type === parser$1945.Token.Delimiter) {
                next$1987 = syntaxFromToken$1949({
                    type: parser$1945.Token.Delimiter,
                    value: to$1986.token.value,
                    inner: takeLineContext$1961(from$1985, to$1986.token.inner),
                    startRange: from$1985.token.startRange,
                    endRange: from$1985.token.endRange,
                    startLineNumber: from$1985.token.startLineNumber,
                    startLineStart: from$1985.token.startLineStart,
                    endLineNumber: from$1985.token.endLineNumber,
                    endLineStart: from$1985.token.endLineStart,
                    sm_startLineNumber: to$1986.token.startLineNumber,
                    sm_endLineNumber: to$1986.token.endLineNumber,
                    sm_startLineStart: to$1986.token.startLineStart,
                    sm_endLineStart: to$1986.token.endLineStart,
                    sm_startRange: to$1986.token.startRange,
                    sm_endRange: to$1986.token.endRange
                }, to$1986);
            } else {
                next$1987 = syntaxFromToken$1949({
                    type: parser$1945.Token.Delimiter,
                    value: to$1986.token.value,
                    inner: takeLineContext$1961(from$1985, to$1986.token.inner),
                    startRange: from$1985.token.range,
                    endRange: from$1985.token.range,
                    startLineNumber: from$1985.token.lineNumber,
                    startLineStart: from$1985.token.lineStart,
                    endLineNumber: from$1985.token.lineNumber,
                    endLineStart: from$1985.token.lineStart,
                    sm_startLineNumber: to$1986.token.startLineNumber,
                    sm_endLineNumber: to$1986.token.endLineNumber,
                    sm_startLineStart: to$1986.token.startLineStart,
                    sm_endLineStart: to$1986.token.endLineStart,
                    sm_startRange: to$1986.token.startRange,
                    sm_endRange: to$1986.token.endRange
                }, to$1986);
            }
        } else {
            if (from$1985.token.type === parser$1945.Token.Delimiter) {
                next$1987 = syntaxFromToken$1949({
                    value: to$1986.token.value,
                    type: to$1986.token.type,
                    lineNumber: from$1985.token.startLineNumber,
                    lineStart: from$1985.token.startLineStart,
                    range: from$1985.token.startRange,
                    sm_lineNumber: to$1986.token.lineNumber,
                    sm_lineStart: to$1986.token.lineStart,
                    sm_range: to$1986.token.range
                }, to$1986);
            } else {
                next$1987 = syntaxFromToken$1949({
                    value: to$1986.token.value,
                    type: to$1986.token.type,
                    lineNumber: from$1985.token.lineNumber,
                    lineStart: from$1985.token.lineStart,
                    range: from$1985.token.range,
                    sm_lineNumber: to$1986.token.lineNumber,
                    sm_lineStart: to$1986.token.lineStart,
                    sm_range: to$1986.token.range
                }, to$1986);
            }
        }
        if (to$1986.token.leadingComments) {
            next$1987.token.leadingComments = to$1986.token.leadingComments;
        }
        if (to$1986.token.trailingComments) {
            next$1987.token.trailingComments = to$1986.token.trailingComments;
        }
        return next$1987;
    }
    function loadLiteralGroup$1963(patterns$1988) {
        _$1943.forEach(patterns$1988, function (patStx$1989) {
            if (patStx$1989.token.type === parser$1945.Token.Delimiter) {
                patStx$1989.token.inner = loadLiteralGroup$1963(patStx$1989.token.inner);
            } else {
                patStx$1989.class = 'pattern_literal';
            }
        });
        return patterns$1988;
    }
    function loadPattern$1964(patterns$1990) {
        return _$1943.chain(patterns$1990).reduce(function (acc$1991, patStx$1992, idx$1993) {
            var last$1994 = patterns$1990[idx$1993 - 1];
            var lastLast$1995 = patterns$1990[idx$1993 - 2];
            var next$1996 = patterns$1990[idx$1993 + 1];
            var nextNext$1997 = patterns$1990[idx$1993 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1992.token.value === ':') {
                if (last$1994 && isPatternVar$1959(last$1994) && !isPatternVar$1959(next$1996)) {
                    return acc$1991;
                }
            }
            if (last$1994 && last$1994.token.value === ':') {
                if (lastLast$1995 && isPatternVar$1959(lastLast$1995) && !isPatternVar$1959(patStx$1992)) {
                    return acc$1991;
                }
            }
            // skip over $
            if (patStx$1992.token.value === '$' && next$1996 && next$1996.token.type === parser$1945.Token.Delimiter) {
                return acc$1991;
            }
            if (isPatternVar$1959(patStx$1992)) {
                if (next$1996 && next$1996.token.value === ':' && !isPatternVar$1959(nextNext$1997)) {
                    if (typeof nextNext$1997 === 'undefined') {
                        throwSyntaxError$1954('patterns', 'expecting a pattern class following a `:`', next$1996);
                    }
                    patStx$1992.class = nextNext$1997.token.value;
                } else {
                    patStx$1992.class = 'token';
                }
            } else if (patStx$1992.token.type === parser$1945.Token.Delimiter) {
                if (last$1994 && last$1994.token.value === '$') {
                    patStx$1992.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1992.class === 'pattern_group' && patStx$1992.token.value === '[]') {
                    patStx$1992.token.inner = loadLiteralGroup$1963(patStx$1992.token.inner);
                } else {
                    patStx$1992.token.inner = loadPattern$1964(patStx$1992.token.inner);
                }
            } else {
                patStx$1992.class = 'pattern_literal';
            }
            return acc$1991.concat(patStx$1992);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1998, patStx$1999, idx$2000, patterns$2001) {
            var separator$2002 = patStx$1999.separator || ' ';
            var repeat$2003 = patStx$1999.repeat || false;
            var next$2004 = patterns$2001[idx$2000 + 1];
            var nextNext$2005 = patterns$2001[idx$2000 + 2];
            if (next$2004 && next$2004.token.value === '...') {
                repeat$2003 = true;
                separator$2002 = ' ';
            } else if (delimIsSeparator$1958(next$2004) && nextNext$2005 && nextNext$2005.token.value === '...') {
                repeat$2003 = true;
                assert$1953(next$2004.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2002 = next$2004.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1999.token.value === '...' || delimIsSeparator$1958(patStx$1999) && next$2004 && next$2004.token.value === '...') {
                return acc$1998;
            }
            patStx$1999.repeat = repeat$2003;
            patStx$1999.separator = separator$2002;
            return acc$1998.concat(patStx$1999);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1965(patternClass$2006, stx$2007, env$2008) {
        var result$2009, rest$2010;
        // pattern has no parse class
        if (patternClass$2006 === 'token' && stx$2007[0] && stx$2007[0].token.type !== parser$1945.Token.EOF) {
            result$2009 = [stx$2007[0]];
            rest$2010 = stx$2007.slice(1);
        } else if (patternClass$2006 === 'lit' && stx$2007[0] && typeIsLiteral$1956(stx$2007[0].token.type)) {
            result$2009 = [stx$2007[0]];
            rest$2010 = stx$2007.slice(1);
        } else if (patternClass$2006 === 'ident' && stx$2007[0] && stx$2007[0].token.type === parser$1945.Token.Identifier) {
            result$2009 = [stx$2007[0]];
            rest$2010 = stx$2007.slice(1);
        } else if (stx$2007.length > 0 && patternClass$2006 === 'VariableStatement') {
            var match$2011 = expander$1946.enforest(stx$2007, expander$1946.makeExpanderContext({ env: env$2008 }));
            if (match$2011.result && match$2011.result.hasPrototype(expander$1946.VariableStatement)) {
                result$2009 = match$2011.result.destruct(false);
                rest$2010 = match$2011.rest;
            } else {
                result$2009 = null;
                rest$2010 = stx$2007;
            }
        } else if (stx$2007.length > 0 && patternClass$2006 === 'expr') {
            var match$2011 = expander$1946.get_expression(stx$2007, expander$1946.makeExpanderContext({ env: env$2008 }));
            if (match$2011.result === null || !match$2011.result.hasPrototype(expander$1946.Expr)) {
                result$2009 = null;
                rest$2010 = stx$2007;
            } else {
                result$2009 = match$2011.result.destruct(false);
                rest$2010 = match$2011.rest;
            }
        } else {
            result$2009 = null;
            rest$2010 = stx$2007;
        }
        return {
            result: result$2009,
            rest: rest$2010
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1966(patterns$2012, stx$2013, env$2014, topLevel$2015) {
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
        topLevel$2015 = topLevel$2015 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2016 = [];
        var patternEnv$2017 = {};
        var match$2018;
        var pattern$2019;
        var rest$2020 = stx$2013;
        var success$2021 = true;
        patternLoop:
            for (var i$2022 = 0; i$2022 < patterns$2012.length; i$2022++) {
                if (success$2021 === false) {
                    break;
                }
                pattern$2019 = patterns$2012[i$2022];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2019.repeat && i$2022 + 1 < patterns$2012.length) {
                        var restMatch$2023 = matchPatterns$1966(patterns$2012.slice(i$2022 + 1), rest$2020, env$2014, topLevel$2015);
                        if (restMatch$2023.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2018 = matchPattern$1967(pattern$2019, [], env$2014, patternEnv$2017);
                            patternEnv$2017 = _$1943.extend(restMatch$2023.patternEnv, match$2018.patternEnv);
                            rest$2020 = restMatch$2023.rest;
                            break patternLoop;
                        }
                    }
                    match$2018 = matchPattern$1967(pattern$2019, rest$2020, env$2014, patternEnv$2017);
                    if (!match$2018.success && pattern$2019.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2018.success) {
                        success$2021 = false;
                        break;
                    }
                    rest$2020 = match$2018.rest;
                    patternEnv$2017 = match$2018.patternEnv;
                    if (success$2021 && !(topLevel$2015 || pattern$2019.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2022 == patterns$2012.length - 1 && rest$2020.length !== 0) {
                            success$2021 = false;
                            break;
                        }
                    }
                    if (pattern$2019.repeat && success$2021) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2019.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2020[0] && rest$2020[0].token.value === pattern$2019.separator) {
                            // more tokens and the next token matches the separator
                            rest$2020 = rest$2020.slice(1);
                        } else if (pattern$2019.separator !== ' ' && rest$2020.length > 0 && i$2022 === patterns$2012.length - 1 && topLevel$2015 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2021 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2019.repeat && success$2021 && rest$2020.length > 0);
            }
        return {
            success: success$2021,
            rest: rest$2020,
            patternEnv: patternEnv$2017
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
    function matchPattern$1967(pattern$2024, stx$2025, env$2026, patternEnv$2027) {
        var subMatch$2028;
        var match$2029, matchEnv$2030;
        var rest$2031;
        var success$2032;
        if (typeof pattern$2024.inner !== 'undefined') {
            if (pattern$2024.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2028 = matchPatterns$1966(pattern$2024.inner, stx$2025, env$2026, true);
                rest$2031 = subMatch$2028.rest;
            } else if (stx$2025[0] && stx$2025[0].token.type === parser$1945.Token.Delimiter && stx$2025[0].token.value === pattern$2024.value) {
                stx$2025[0].expose();
                if (pattern$2024.inner.length === 0 && stx$2025[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2025,
                        patternEnv: patternEnv$2027
                    };
                }
                subMatch$2028 = matchPatterns$1966(pattern$2024.inner, stx$2025[0].token.inner, env$2026, false);
                rest$2031 = stx$2025.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2025,
                    patternEnv: patternEnv$2027
                };
            }
            success$2032 = subMatch$2028.success;
            // merge the subpattern matches with the current pattern environment
            _$1943.keys(subMatch$2028.patternEnv).forEach(function (patternKey$2033) {
                if (pattern$2024.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2034 = subMatch$2028.patternEnv[patternKey$2033].level + 1;
                    if (patternEnv$2027[patternKey$2033]) {
                        patternEnv$2027[patternKey$2033].level = nextLevel$2034;
                        patternEnv$2027[patternKey$2033].match.push(subMatch$2028.patternEnv[patternKey$2033]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2027[patternKey$2033] = {
                            level: nextLevel$2034,
                            match: [subMatch$2028.patternEnv[patternKey$2033]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2027[patternKey$2033] = subMatch$2028.patternEnv[patternKey$2033];
                }
            });
        } else {
            if (pattern$2024.class === 'pattern_literal') {
                // wildcard
                if (stx$2025[0] && pattern$2024.value === '_') {
                    success$2032 = true;
                    rest$2031 = stx$2025.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2025[0] && pattern$2024.value === stx$2025[0].token.value) {
                    success$2032 = true;
                    rest$2031 = stx$2025.slice(1);
                } else {
                    success$2032 = false;
                    rest$2031 = stx$2025;
                }
            } else {
                match$2029 = matchPatternClass$1965(pattern$2024.class, stx$2025, env$2026);
                success$2032 = match$2029.result !== null;
                rest$2031 = match$2029.rest;
                matchEnv$2030 = {
                    level: 0,
                    match: match$2029.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2024.repeat) {
                    if (patternEnv$2027[pattern$2024.value] && success$2032) {
                        patternEnv$2027[pattern$2024.value].match.push(matchEnv$2030);
                    } else if (patternEnv$2027[pattern$2024.value] == undefined) {
                        // initialize if necessary
                        patternEnv$2027[pattern$2024.value] = {
                            level: 1,
                            match: [matchEnv$2030]
                        };
                    }
                } else {
                    patternEnv$2027[pattern$2024.value] = matchEnv$2030;
                }
            }
        }
        return {
            success: success$2032,
            rest: rest$2031,
            patternEnv: patternEnv$2027
        };
    }
    function hasMatch$1968(m$2035) {
        if (m$2035.level === 0) {
            return m$2035.match.length > 0;
        }
        return m$2035.match.every(function (m$2036) {
            return hasMatch$1968(m$2036);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1969(macroBody$2037, macroNameStx$2038, env$2039) {
        return _$1943.chain(macroBody$2037).reduce(function (acc$2040, bodyStx$2041, idx$2042, original$2043) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2044 = original$2043[idx$2042 - 1];
            var next$2045 = original$2043[idx$2042 + 1];
            var nextNext$2046 = original$2043[idx$2042 + 2];
            // drop `...`
            if (bodyStx$2041.token.value === '...') {
                return acc$2040;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1958(bodyStx$2041) && next$2045 && next$2045.token.value === '...') {
                return acc$2040;
            }
            // skip the $ in $(...)
            if (bodyStx$2041.token.value === '$' && next$2045 && next$2045.token.type === parser$1945.Token.Delimiter && next$2045.token.value === '()') {
                return acc$2040;
            }
            // mark $[...] as a literal
            if (bodyStx$2041.token.value === '$' && next$2045 && next$2045.token.type === parser$1945.Token.Delimiter && next$2045.token.value === '[]') {
                next$2045.literal = true;
                return acc$2040;
            }
            if (bodyStx$2041.token.type === parser$1945.Token.Delimiter && bodyStx$2041.token.value === '()' && last$2044 && last$2044.token.value === '$') {
                bodyStx$2041.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2041.literal === true) {
                assert$1953(bodyStx$2041.token.type === parser$1945.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2040.concat(bodyStx$2041.token.inner);
            }
            if (next$2045 && next$2045.token.value === '...') {
                bodyStx$2041.repeat = true;
                bodyStx$2041.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1958(next$2045) && nextNext$2046 && nextNext$2046.token.value === '...') {
                bodyStx$2041.repeat = true;
                bodyStx$2041.separator = next$2045.token.inner[0].token.value;
            }
            return acc$2040.concat(bodyStx$2041);
        }, []).reduce(function (acc$2047, bodyStx$2048, idx$2049) {
            // then do the actual transcription
            if (bodyStx$2048.repeat) {
                if (bodyStx$2048.token.type === parser$1945.Token.Delimiter) {
                    bodyStx$2048.expose();
                    var fv$2050 = _$1943.filter(freeVarsInPattern$1955(bodyStx$2048.token.inner), function (pat$2057) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2039.hasOwnProperty(pat$2057);
                        });
                    var restrictedEnv$2051 = [];
                    var nonScalar$2052 = _$1943.find(fv$2050, function (pat$2058) {
                            return env$2039[pat$2058].level > 0;
                        });
                    assert$1953(typeof nonScalar$2052 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2053 = env$2039[nonScalar$2052].match.length;
                    var sameLength$2054 = _$1943.all(fv$2050, function (pat$2059) {
                            return env$2039[pat$2059].level === 0 || env$2039[pat$2059].match.length === repeatLength$2053;
                        });
                    assert$1953(sameLength$2054, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1943.each(_$1943.range(repeatLength$2053), function (idx$2060) {
                        var renv$2061 = {};
                        _$1943.each(fv$2050, function (pat$2063) {
                            if (env$2039[pat$2063].level === 0) {
                                // copy scalars over
                                renv$2061[pat$2063] = env$2039[pat$2063];
                            } else {
                                // grab the match at this index 
                                renv$2061[pat$2063] = env$2039[pat$2063].match[idx$2060];
                            }
                        });
                        var allHaveMatch$2062 = Object.keys(renv$2061).every(function (pat$2064) {
                                return hasMatch$1968(renv$2061[pat$2064]);
                            });
                        if (allHaveMatch$2062) {
                            restrictedEnv$2051.push(renv$2061);
                        }
                    });
                    var transcribed$2055 = _$1943.map(restrictedEnv$2051, function (renv$2065) {
                            if (bodyStx$2048.group) {
                                return transcribe$1969(bodyStx$2048.token.inner, macroNameStx$2038, renv$2065);
                            } else {
                                var newBody$2066 = syntaxFromToken$1949(_$1943.clone(bodyStx$2048.token), bodyStx$2048);
                                newBody$2066.token.inner = transcribe$1969(bodyStx$2048.token.inner, macroNameStx$2038, renv$2065);
                                return newBody$2066;
                            }
                        });
                    var joined$2056;
                    if (bodyStx$2048.group) {
                        joined$2056 = joinSyntaxArr$1952(transcribed$2055, bodyStx$2048.separator);
                    } else {
                        joined$2056 = joinSyntax$1951(transcribed$2055, bodyStx$2048.separator);
                    }
                    return acc$2047.concat(joined$2056);
                }
                if (!env$2039[bodyStx$2048.token.value]) {
                    throwSyntaxError$1954('patterns', 'The pattern variable is not bound for the template', bodyStx$2048);
                } else if (env$2039[bodyStx$2048.token.value].level !== 1) {
                    throwSyntaxError$1954('patterns', 'Ellipses level does not match in the template', bodyStx$2048);
                }
                return acc$2047.concat(joinRepeatedMatch$1960(env$2039[bodyStx$2048.token.value].match, bodyStx$2048.separator));
            } else {
                if (bodyStx$2048.token.type === parser$1945.Token.Delimiter) {
                    bodyStx$2048.expose();
                    var newBody$2067 = syntaxFromToken$1949(_$1943.clone(bodyStx$2048.token), macroBody$2037);
                    newBody$2067.token.inner = transcribe$1969(bodyStx$2048.token.inner, macroNameStx$2038, env$2039);
                    return acc$2047.concat([newBody$2067]);
                }
                if (isPatternVar$1959(bodyStx$2048) && Object.prototype.hasOwnProperty.bind(env$2039)(bodyStx$2048.token.value)) {
                    if (!env$2039[bodyStx$2048.token.value]) {
                        throwSyntaxError$1954('patterns', 'The pattern variable is not bound for the template', bodyStx$2048);
                    } else if (env$2039[bodyStx$2048.token.value].level !== 0) {
                        throwSyntaxError$1954('patterns', 'Ellipses level does not match in the template', bodyStx$2048);
                    }
                    return acc$2047.concat(takeLineContext$1961(bodyStx$2048, env$2039[bodyStx$2048.token.value].match));
                }
                return acc$2047.concat([bodyStx$2048]);
            }
        }, []).value();
    }
    exports$1942.loadPattern = loadPattern$1964;
    exports$1942.matchPatterns = matchPatterns$1966;
    exports$1942.transcribe = transcribe$1969;
    exports$1942.matchPatternClass = matchPatternClass$1965;
    exports$1942.takeLineContext = takeLineContext$1961;
    exports$1942.takeLine = takeLine$1962;
}));
//# sourceMappingURL=patterns.js.map