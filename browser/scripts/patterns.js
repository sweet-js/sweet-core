(function (root$1936, factory$1937) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1937(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1937);
    }
}(this, function (exports$1938, _$1939, es6$1940, parser$1941, expander$1942, syntax$1943) {
    var get_expression$1944 = expander$1942.get_expression;
    var syntaxFromToken$1945 = syntax$1943.syntaxFromToken;
    var makePunc$1946 = syntax$1943.makePunc;
    var joinSyntax$1947 = syntax$1943.joinSyntax;
    var joinSyntaxArr$1948 = syntax$1943.joinSyntaxArr;
    var assert$1949 = syntax$1943.assert;
    var throwSyntaxError$1950 = syntax$1943.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1951(pattern$1966) {
        var fv$1967 = [];
        _$1939.each(pattern$1966, function (pat$1968) {
            if (isPatternVar$1955(pat$1968)) {
                fv$1967.push(pat$1968.token.value);
            } else if (pat$1968.token.type === parser$1941.Token.Delimiter) {
                fv$1967 = fv$1967.concat(freeVarsInPattern$1951(pat$1968.token.inner));
            }
        });
        return fv$1967;
    }
    function typeIsLiteral$1952(type$1969) {
        return type$1969 === parser$1941.Token.NullLiteral || type$1969 === parser$1941.Token.NumericLiteral || type$1969 === parser$1941.Token.StringLiteral || type$1969 === parser$1941.Token.RegexLiteral || type$1969 === parser$1941.Token.BooleanLiteral;
    }
    function containsPatternVar$1953(patterns$1970) {
        return _$1939.any(patterns$1970, function (pat$1971) {
            if (pat$1971.token.type === parser$1941.Token.Delimiter) {
                return containsPatternVar$1953(pat$1971.token.inner);
            }
            return isPatternVar$1955(pat$1971);
        });
    }
    function delimIsSeparator$1954(delim$1972) {
        return delim$1972 && delim$1972.token && delim$1972.token.type === parser$1941.Token.Delimiter && delim$1972.token.value === '()' && delim$1972.token.inner.length === 1 && delim$1972.token.inner[0].token.type !== parser$1941.Token.Delimiter && !containsPatternVar$1953(delim$1972.token.inner);
    }
    function isPatternVar$1955(stx$1973) {
        return stx$1973.token.value[0] === '$' && stx$1973.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1956(tojoin$1974, punc$1975) {
        return _$1939.reduce(_$1939.rest(tojoin$1974, 1), function (acc$1976, join$1977) {
            if (punc$1975 === ' ') {
                return acc$1976.concat(join$1977.match);
            }
            return acc$1976.concat(makePunc$1946(punc$1975, _$1939.first(join$1977.match)), join$1977.match);
        }, _$1939.first(tojoin$1974).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1957(from$1978, to$1979) {
        return _$1939.map(to$1979, function (stx$1980) {
            return takeLine$1958(from$1978, stx$1980);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1958(from$1981, to$1982) {
        if (to$1982.token.type === parser$1941.Token.Delimiter) {
            var next$1983;
            if (from$1981.token.type === parser$1941.Token.Delimiter) {
                next$1983 = syntaxFromToken$1945({
                    type: parser$1941.Token.Delimiter,
                    value: to$1982.token.value,
                    inner: takeLineContext$1957(from$1981, to$1982.token.inner),
                    startRange: from$1981.token.startRange,
                    endRange: from$1981.token.endRange,
                    startLineNumber: from$1981.token.startLineNumber,
                    startLineStart: from$1981.token.startLineStart,
                    endLineNumber: from$1981.token.endLineNumber,
                    endLineStart: from$1981.token.endLineStart,
                    sm_startLineNumber: to$1982.token.startLineNumber,
                    sm_endLineNumber: to$1982.token.endLineNumber,
                    sm_startLineStart: to$1982.token.startLineStart,
                    sm_endLineStart: to$1982.token.endLineStart,
                    sm_startRange: to$1982.token.startRange,
                    sm_endRange: to$1982.token.endRange
                }, to$1982);
            } else {
                next$1983 = syntaxFromToken$1945({
                    type: parser$1941.Token.Delimiter,
                    value: to$1982.token.value,
                    inner: takeLineContext$1957(from$1981, to$1982.token.inner),
                    startRange: from$1981.token.range,
                    endRange: from$1981.token.range,
                    startLineNumber: from$1981.token.lineNumber,
                    startLineStart: from$1981.token.lineStart,
                    endLineNumber: from$1981.token.lineNumber,
                    endLineStart: from$1981.token.lineStart,
                    sm_startLineNumber: to$1982.token.startLineNumber,
                    sm_endLineNumber: to$1982.token.endLineNumber,
                    sm_startLineStart: to$1982.token.startLineStart,
                    sm_endLineStart: to$1982.token.endLineStart,
                    sm_startRange: to$1982.token.startRange,
                    sm_endRange: to$1982.token.endRange
                }, to$1982);
            }
        } else {
            if (from$1981.token.type === parser$1941.Token.Delimiter) {
                next$1983 = syntaxFromToken$1945({
                    value: to$1982.token.value,
                    type: to$1982.token.type,
                    lineNumber: from$1981.token.startLineNumber,
                    lineStart: from$1981.token.startLineStart,
                    range: from$1981.token.startRange,
                    sm_lineNumber: to$1982.token.lineNumber,
                    sm_lineStart: to$1982.token.lineStart,
                    sm_range: to$1982.token.range
                }, to$1982);
            } else {
                next$1983 = syntaxFromToken$1945({
                    value: to$1982.token.value,
                    type: to$1982.token.type,
                    lineNumber: from$1981.token.lineNumber,
                    lineStart: from$1981.token.lineStart,
                    range: from$1981.token.range,
                    sm_lineNumber: to$1982.token.lineNumber,
                    sm_lineStart: to$1982.token.lineStart,
                    sm_range: to$1982.token.range
                }, to$1982);
            }
        }
        if (to$1982.token.leadingComments) {
            next$1983.token.leadingComments = to$1982.token.leadingComments;
        }
        if (to$1982.token.trailingComments) {
            next$1983.token.trailingComments = to$1982.token.trailingComments;
        }
        return next$1983;
    }
    function loadLiteralGroup$1959(patterns$1984) {
        _$1939.forEach(patterns$1984, function (patStx$1985) {
            if (patStx$1985.token.type === parser$1941.Token.Delimiter) {
                patStx$1985.token.inner = loadLiteralGroup$1959(patStx$1985.token.inner);
            } else {
                patStx$1985.class = 'pattern_literal';
            }
        });
        return patterns$1984;
    }
    function loadPattern$1960(patterns$1986) {
        return _$1939.chain(patterns$1986).reduce(function (acc$1987, patStx$1988, idx$1989) {
            var last$1990 = patterns$1986[idx$1989 - 1];
            var lastLast$1991 = patterns$1986[idx$1989 - 2];
            var next$1992 = patterns$1986[idx$1989 + 1];
            var nextNext$1993 = patterns$1986[idx$1989 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1988.token.value === ':') {
                if (last$1990 && isPatternVar$1955(last$1990) && !isPatternVar$1955(next$1992)) {
                    return acc$1987;
                }
            }
            if (last$1990 && last$1990.token.value === ':') {
                if (lastLast$1991 && isPatternVar$1955(lastLast$1991) && !isPatternVar$1955(patStx$1988)) {
                    return acc$1987;
                }
            }
            // skip over $
            if (patStx$1988.token.value === '$' && next$1992 && next$1992.token.type === parser$1941.Token.Delimiter) {
                return acc$1987;
            }
            if (isPatternVar$1955(patStx$1988)) {
                if (next$1992 && next$1992.token.value === ':' && !isPatternVar$1955(nextNext$1993)) {
                    if (typeof nextNext$1993 === 'undefined') {
                        throwSyntaxError$1950('patterns', 'expecting a pattern class following a `:`', next$1992);
                    }
                    patStx$1988.class = nextNext$1993.token.value;
                } else {
                    patStx$1988.class = 'token';
                }
            } else if (patStx$1988.token.type === parser$1941.Token.Delimiter) {
                if (last$1990 && last$1990.token.value === '$') {
                    patStx$1988.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1988.class === 'pattern_group' && patStx$1988.token.value === '[]') {
                    patStx$1988.token.inner = loadLiteralGroup$1959(patStx$1988.token.inner);
                } else {
                    patStx$1988.token.inner = loadPattern$1960(patStx$1988.token.inner);
                }
            } else {
                patStx$1988.class = 'pattern_literal';
            }
            return acc$1987.concat(patStx$1988);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1994, patStx$1995, idx$1996, patterns$1997) {
            var separator$1998 = patStx$1995.separator || ' ';
            var repeat$1999 = patStx$1995.repeat || false;
            var next$2000 = patterns$1997[idx$1996 + 1];
            var nextNext$2001 = patterns$1997[idx$1996 + 2];
            if (next$2000 && next$2000.token.value === '...') {
                repeat$1999 = true;
                separator$1998 = ' ';
            } else if (delimIsSeparator$1954(next$2000) && nextNext$2001 && nextNext$2001.token.value === '...') {
                repeat$1999 = true;
                assert$1949(next$2000.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1998 = next$2000.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1995.token.value === '...' || delimIsSeparator$1954(patStx$1995) && next$2000 && next$2000.token.value === '...') {
                return acc$1994;
            }
            patStx$1995.repeat = repeat$1999;
            patStx$1995.separator = separator$1998;
            return acc$1994.concat(patStx$1995);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1961(patternClass$2002, stx$2003, env$2004) {
        var result$2005, rest$2006;
        // pattern has no parse class
        if (patternClass$2002 === 'token' && stx$2003[0] && stx$2003[0].token.type !== parser$1941.Token.EOF) {
            result$2005 = [stx$2003[0]];
            rest$2006 = stx$2003.slice(1);
        } else if (patternClass$2002 === 'lit' && stx$2003[0] && typeIsLiteral$1952(stx$2003[0].token.type)) {
            result$2005 = [stx$2003[0]];
            rest$2006 = stx$2003.slice(1);
        } else if (patternClass$2002 === 'ident' && stx$2003[0] && stx$2003[0].token.type === parser$1941.Token.Identifier) {
            result$2005 = [stx$2003[0]];
            rest$2006 = stx$2003.slice(1);
        } else if (stx$2003.length > 0 && patternClass$2002 === 'VariableStatement') {
            var match$2007 = expander$1942.enforest(stx$2003, expander$1942.makeExpanderContext({ env: env$2004 }));
            if (match$2007.result && match$2007.result.hasPrototype(expander$1942.VariableStatement)) {
                result$2005 = match$2007.result.destruct(false);
                rest$2006 = match$2007.rest;
            } else {
                result$2005 = null;
                rest$2006 = stx$2003;
            }
        } else if (stx$2003.length > 0 && patternClass$2002 === 'expr') {
            var match$2007 = expander$1942.get_expression(stx$2003, expander$1942.makeExpanderContext({ env: env$2004 }));
            if (match$2007.result === null || !match$2007.result.hasPrototype(expander$1942.Expr)) {
                result$2005 = null;
                rest$2006 = stx$2003;
            } else {
                result$2005 = match$2007.result.destruct(false);
                rest$2006 = match$2007.rest;
            }
        } else {
            result$2005 = null;
            rest$2006 = stx$2003;
        }
        return {
            result: result$2005,
            rest: rest$2006
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1962(patterns$2008, stx$2009, env$2010, topLevel$2011) {
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
        topLevel$2011 = topLevel$2011 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2012 = [];
        var patternEnv$2013 = {};
        var match$2014;
        var pattern$2015;
        var rest$2016 = stx$2009;
        var success$2017 = true;
        patternLoop:
            for (var i$2018 = 0; i$2018 < patterns$2008.length; i$2018++) {
                if (success$2017 === false) {
                    break;
                }
                pattern$2015 = patterns$2008[i$2018];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2015.repeat && i$2018 + 1 < patterns$2008.length) {
                        var restMatch$2019 = matchPatterns$1962(patterns$2008.slice(i$2018 + 1), rest$2016, env$2010, topLevel$2011);
                        if (restMatch$2019.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2014 = matchPattern$1963(pattern$2015, [], env$2010, patternEnv$2013);
                            patternEnv$2013 = _$1939.extend(restMatch$2019.patternEnv, match$2014.patternEnv);
                            rest$2016 = restMatch$2019.rest;
                            break patternLoop;
                        }
                    }
                    match$2014 = matchPattern$1963(pattern$2015, rest$2016, env$2010, patternEnv$2013);
                    if (!match$2014.success && pattern$2015.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2014.success) {
                        success$2017 = false;
                        break;
                    }
                    rest$2016 = match$2014.rest;
                    patternEnv$2013 = match$2014.patternEnv;
                    if (success$2017 && !(topLevel$2011 || pattern$2015.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2018 == patterns$2008.length - 1 && rest$2016.length !== 0) {
                            success$2017 = false;
                            break;
                        }
                    }
                    if (pattern$2015.repeat && success$2017) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2015.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2016[0] && rest$2016[0].token.value === pattern$2015.separator) {
                            // more tokens and the next token matches the separator
                            rest$2016 = rest$2016.slice(1);
                        } else if (pattern$2015.separator !== ' ' && rest$2016.length > 0 && i$2018 === patterns$2008.length - 1 && topLevel$2011 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2017 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2015.repeat && success$2017 && rest$2016.length > 0);
            }
        return {
            success: success$2017,
            rest: rest$2016,
            patternEnv: patternEnv$2013
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
    function matchPattern$1963(pattern$2020, stx$2021, env$2022, patternEnv$2023) {
        var subMatch$2024;
        var match$2025, matchEnv$2026;
        var rest$2027;
        var success$2028;
        if (typeof pattern$2020.inner !== 'undefined') {
            if (pattern$2020.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2024 = matchPatterns$1962(pattern$2020.inner, stx$2021, env$2022, true);
                rest$2027 = subMatch$2024.rest;
            } else if (stx$2021[0] && stx$2021[0].token.type === parser$1941.Token.Delimiter && stx$2021[0].token.value === pattern$2020.value) {
                stx$2021[0].expose();
                if (pattern$2020.inner.length === 0 && stx$2021[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2021,
                        patternEnv: patternEnv$2023
                    };
                }
                subMatch$2024 = matchPatterns$1962(pattern$2020.inner, stx$2021[0].token.inner, env$2022, false);
                rest$2027 = stx$2021.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2021,
                    patternEnv: patternEnv$2023
                };
            }
            success$2028 = subMatch$2024.success;
            // merge the subpattern matches with the current pattern environment
            _$1939.keys(subMatch$2024.patternEnv).forEach(function (patternKey$2029) {
                if (pattern$2020.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2030 = subMatch$2024.patternEnv[patternKey$2029].level + 1;
                    if (patternEnv$2023[patternKey$2029]) {
                        patternEnv$2023[patternKey$2029].level = nextLevel$2030;
                        patternEnv$2023[patternKey$2029].match.push(subMatch$2024.patternEnv[patternKey$2029]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2023[patternKey$2029] = {
                            level: nextLevel$2030,
                            match: [subMatch$2024.patternEnv[patternKey$2029]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2023[patternKey$2029] = subMatch$2024.patternEnv[patternKey$2029];
                }
            });
        } else {
            if (pattern$2020.class === 'pattern_literal') {
                // wildcard
                if (stx$2021[0] && pattern$2020.value === '_') {
                    success$2028 = true;
                    rest$2027 = stx$2021.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2021[0] && pattern$2020.value === stx$2021[0].token.value) {
                    success$2028 = true;
                    rest$2027 = stx$2021.slice(1);
                } else {
                    success$2028 = false;
                    rest$2027 = stx$2021;
                }
            } else {
                match$2025 = matchPatternClass$1961(pattern$2020.class, stx$2021, env$2022);
                success$2028 = match$2025.result !== null;
                rest$2027 = match$2025.rest;
                matchEnv$2026 = {
                    level: 0,
                    match: match$2025.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2020.repeat) {
                    if (patternEnv$2023[pattern$2020.value] && success$2028) {
                        patternEnv$2023[pattern$2020.value].match.push(matchEnv$2026);
                    } else if (patternEnv$2023[pattern$2020.value] == undefined) {
                        // initialize if necessary
                        patternEnv$2023[pattern$2020.value] = {
                            level: 1,
                            match: [matchEnv$2026]
                        };
                    }
                } else {
                    patternEnv$2023[pattern$2020.value] = matchEnv$2026;
                }
            }
        }
        return {
            success: success$2028,
            rest: rest$2027,
            patternEnv: patternEnv$2023
        };
    }
    function hasMatch$1964(m$2031) {
        if (m$2031.level === 0) {
            return m$2031.match.length > 0;
        }
        return m$2031.match.every(function (m$2032) {
            return hasMatch$1964(m$2032);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1965(macroBody$2033, macroNameStx$2034, env$2035) {
        return _$1939.chain(macroBody$2033).reduce(function (acc$2036, bodyStx$2037, idx$2038, original$2039) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2040 = original$2039[idx$2038 - 1];
            var next$2041 = original$2039[idx$2038 + 1];
            var nextNext$2042 = original$2039[idx$2038 + 2];
            // drop `...`
            if (bodyStx$2037.token.value === '...') {
                return acc$2036;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1954(bodyStx$2037) && next$2041 && next$2041.token.value === '...') {
                return acc$2036;
            }
            // skip the $ in $(...)
            if (bodyStx$2037.token.value === '$' && next$2041 && next$2041.token.type === parser$1941.Token.Delimiter && next$2041.token.value === '()') {
                return acc$2036;
            }
            // mark $[...] as a literal
            if (bodyStx$2037.token.value === '$' && next$2041 && next$2041.token.type === parser$1941.Token.Delimiter && next$2041.token.value === '[]') {
                next$2041.literal = true;
                return acc$2036;
            }
            if (bodyStx$2037.token.type === parser$1941.Token.Delimiter && bodyStx$2037.token.value === '()' && last$2040 && last$2040.token.value === '$') {
                bodyStx$2037.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2037.literal === true) {
                assert$1949(bodyStx$2037.token.type === parser$1941.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2036.concat(bodyStx$2037.token.inner);
            }
            if (next$2041 && next$2041.token.value === '...') {
                bodyStx$2037.repeat = true;
                bodyStx$2037.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1954(next$2041) && nextNext$2042 && nextNext$2042.token.value === '...') {
                bodyStx$2037.repeat = true;
                bodyStx$2037.separator = next$2041.token.inner[0].token.value;
            }
            return acc$2036.concat(bodyStx$2037);
        }, []).reduce(function (acc$2043, bodyStx$2044, idx$2045) {
            // then do the actual transcription
            if (bodyStx$2044.repeat) {
                if (bodyStx$2044.token.type === parser$1941.Token.Delimiter) {
                    bodyStx$2044.expose();
                    var fv$2046 = _$1939.filter(freeVarsInPattern$1951(bodyStx$2044.token.inner), function (pat$2053) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2035.hasOwnProperty(pat$2053);
                        });
                    var restrictedEnv$2047 = [];
                    var nonScalar$2048 = _$1939.find(fv$2046, function (pat$2054) {
                            return env$2035[pat$2054].level > 0;
                        });
                    assert$1949(typeof nonScalar$2048 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2049 = env$2035[nonScalar$2048].match.length;
                    var sameLength$2050 = _$1939.all(fv$2046, function (pat$2055) {
                            return env$2035[pat$2055].level === 0 || env$2035[pat$2055].match.length === repeatLength$2049;
                        });
                    assert$1949(sameLength$2050, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1939.each(_$1939.range(repeatLength$2049), function (idx$2056) {
                        var renv$2057 = {};
                        _$1939.each(fv$2046, function (pat$2059) {
                            if (env$2035[pat$2059].level === 0) {
                                // copy scalars over
                                renv$2057[pat$2059] = env$2035[pat$2059];
                            } else {
                                // grab the match at this index 
                                renv$2057[pat$2059] = env$2035[pat$2059].match[idx$2056];
                            }
                        });
                        var allHaveMatch$2058 = Object.keys(renv$2057).every(function (pat$2060) {
                                return hasMatch$1964(renv$2057[pat$2060]);
                            });
                        if (allHaveMatch$2058) {
                            restrictedEnv$2047.push(renv$2057);
                        }
                    });
                    var transcribed$2051 = _$1939.map(restrictedEnv$2047, function (renv$2061) {
                            if (bodyStx$2044.group) {
                                return transcribe$1965(bodyStx$2044.token.inner, macroNameStx$2034, renv$2061);
                            } else {
                                var newBody$2062 = syntaxFromToken$1945(_$1939.clone(bodyStx$2044.token), bodyStx$2044);
                                newBody$2062.token.inner = transcribe$1965(bodyStx$2044.token.inner, macroNameStx$2034, renv$2061);
                                return newBody$2062;
                            }
                        });
                    var joined$2052;
                    if (bodyStx$2044.group) {
                        joined$2052 = joinSyntaxArr$1948(transcribed$2051, bodyStx$2044.separator);
                    } else {
                        joined$2052 = joinSyntax$1947(transcribed$2051, bodyStx$2044.separator);
                    }
                    return acc$2043.concat(joined$2052);
                }
                if (!env$2035[bodyStx$2044.token.value]) {
                    throwSyntaxError$1950('patterns', 'The pattern variable is not bound for the template', bodyStx$2044);
                } else if (env$2035[bodyStx$2044.token.value].level !== 1) {
                    throwSyntaxError$1950('patterns', 'Ellipses level does not match in the template', bodyStx$2044);
                }
                return acc$2043.concat(joinRepeatedMatch$1956(env$2035[bodyStx$2044.token.value].match, bodyStx$2044.separator));
            } else {
                if (bodyStx$2044.token.type === parser$1941.Token.Delimiter) {
                    bodyStx$2044.expose();
                    var newBody$2063 = syntaxFromToken$1945(_$1939.clone(bodyStx$2044.token), macroBody$2033);
                    newBody$2063.token.inner = transcribe$1965(bodyStx$2044.token.inner, macroNameStx$2034, env$2035);
                    return acc$2043.concat([newBody$2063]);
                }
                if (isPatternVar$1955(bodyStx$2044) && Object.prototype.hasOwnProperty.bind(env$2035)(bodyStx$2044.token.value)) {
                    if (!env$2035[bodyStx$2044.token.value]) {
                        throwSyntaxError$1950('patterns', 'The pattern variable is not bound for the template', bodyStx$2044);
                    } else if (env$2035[bodyStx$2044.token.value].level !== 0) {
                        throwSyntaxError$1950('patterns', 'Ellipses level does not match in the template', bodyStx$2044);
                    }
                    return acc$2043.concat(takeLineContext$1957(bodyStx$2044, env$2035[bodyStx$2044.token.value].match));
                }
                return acc$2043.concat([bodyStx$2044]);
            }
        }, []).value();
    }
    exports$1938.loadPattern = loadPattern$1960;
    exports$1938.matchPatterns = matchPatterns$1962;
    exports$1938.transcribe = transcribe$1965;
    exports$1938.matchPatternClass = matchPatternClass$1961;
    exports$1938.takeLineContext = takeLineContext$1957;
    exports$1938.takeLine = takeLine$1958;
}));
//# sourceMappingURL=patterns.js.map