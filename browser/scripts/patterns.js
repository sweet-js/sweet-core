(function (root$1943, factory$1944) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1944(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1944);
    }
}(this, function (exports$1945, _$1946, es6$1947, parser$1948, expander$1949, syntax$1950) {
    var get_expression$1951 = expander$1949.get_expression;
    var syntaxFromToken$1952 = syntax$1950.syntaxFromToken;
    var makePunc$1953 = syntax$1950.makePunc;
    var joinSyntax$1954 = syntax$1950.joinSyntax;
    var joinSyntaxArr$1955 = syntax$1950.joinSyntaxArr;
    var assert$1956 = syntax$1950.assert;
    var throwSyntaxError$1957 = syntax$1950.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1958(pattern$1973) {
        var fv$1974 = [];
        _$1946.each(pattern$1973, function (pat$1975) {
            if (isPatternVar$1962(pat$1975)) {
                fv$1974.push(pat$1975.token.value);
            } else if (pat$1975.token.type === parser$1948.Token.Delimiter) {
                fv$1974 = fv$1974.concat(freeVarsInPattern$1958(pat$1975.token.inner));
            }
        });
        return fv$1974;
    }
    function typeIsLiteral$1959(type$1976) {
        return type$1976 === parser$1948.Token.NullLiteral || type$1976 === parser$1948.Token.NumericLiteral || type$1976 === parser$1948.Token.StringLiteral || type$1976 === parser$1948.Token.RegexLiteral || type$1976 === parser$1948.Token.BooleanLiteral;
    }
    function containsPatternVar$1960(patterns$1977) {
        return _$1946.any(patterns$1977, function (pat$1978) {
            if (pat$1978.token.type === parser$1948.Token.Delimiter) {
                return containsPatternVar$1960(pat$1978.token.inner);
            }
            return isPatternVar$1962(pat$1978);
        });
    }
    function delimIsSeparator$1961(delim$1979) {
        return delim$1979 && delim$1979.token && delim$1979.token.type === parser$1948.Token.Delimiter && delim$1979.token.value === '()' && delim$1979.token.inner.length === 1 && delim$1979.token.inner[0].token.type !== parser$1948.Token.Delimiter && !containsPatternVar$1960(delim$1979.token.inner);
    }
    function isPatternVar$1962(stx$1980) {
        return stx$1980.token.value[0] === '$' && stx$1980.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1963(tojoin$1981, punc$1982) {
        return _$1946.reduce(_$1946.rest(tojoin$1981, 1), function (acc$1983, join$1984) {
            if (punc$1982 === ' ') {
                return acc$1983.concat(join$1984.match);
            }
            return acc$1983.concat(makePunc$1953(punc$1982, _$1946.first(join$1984.match)), join$1984.match);
        }, _$1946.first(tojoin$1981).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1964(from$1985, to$1986) {
        return _$1946.map(to$1986, function (stx$1987) {
            return takeLine$1965(from$1985, stx$1987);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1965(from$1988, to$1989) {
        if (to$1989.token.type === parser$1948.Token.Delimiter) {
            var next$1990;
            if (from$1988.token.type === parser$1948.Token.Delimiter) {
                next$1990 = syntaxFromToken$1952({
                    type: parser$1948.Token.Delimiter,
                    value: to$1989.token.value,
                    inner: takeLineContext$1964(from$1988, to$1989.token.inner),
                    startRange: from$1988.token.startRange,
                    endRange: from$1988.token.endRange,
                    startLineNumber: from$1988.token.startLineNumber,
                    startLineStart: from$1988.token.startLineStart,
                    endLineNumber: from$1988.token.endLineNumber,
                    endLineStart: from$1988.token.endLineStart,
                    sm_startLineNumber: to$1989.token.startLineNumber,
                    sm_endLineNumber: to$1989.token.endLineNumber,
                    sm_startLineStart: to$1989.token.startLineStart,
                    sm_endLineStart: to$1989.token.endLineStart,
                    sm_startRange: to$1989.token.startRange,
                    sm_endRange: to$1989.token.endRange
                }, to$1989);
            } else {
                next$1990 = syntaxFromToken$1952({
                    type: parser$1948.Token.Delimiter,
                    value: to$1989.token.value,
                    inner: takeLineContext$1964(from$1988, to$1989.token.inner),
                    startRange: from$1988.token.range,
                    endRange: from$1988.token.range,
                    startLineNumber: from$1988.token.lineNumber,
                    startLineStart: from$1988.token.lineStart,
                    endLineNumber: from$1988.token.lineNumber,
                    endLineStart: from$1988.token.lineStart,
                    sm_startLineNumber: to$1989.token.startLineNumber,
                    sm_endLineNumber: to$1989.token.endLineNumber,
                    sm_startLineStart: to$1989.token.startLineStart,
                    sm_endLineStart: to$1989.token.endLineStart,
                    sm_startRange: to$1989.token.startRange,
                    sm_endRange: to$1989.token.endRange
                }, to$1989);
            }
        } else {
            if (from$1988.token.type === parser$1948.Token.Delimiter) {
                next$1990 = syntaxFromToken$1952({
                    value: to$1989.token.value,
                    type: to$1989.token.type,
                    lineNumber: from$1988.token.startLineNumber,
                    lineStart: from$1988.token.startLineStart,
                    range: from$1988.token.startRange,
                    sm_lineNumber: to$1989.token.lineNumber,
                    sm_lineStart: to$1989.token.lineStart,
                    sm_range: to$1989.token.range
                }, to$1989);
            } else {
                next$1990 = syntaxFromToken$1952({
                    value: to$1989.token.value,
                    type: to$1989.token.type,
                    lineNumber: from$1988.token.lineNumber,
                    lineStart: from$1988.token.lineStart,
                    range: from$1988.token.range,
                    sm_lineNumber: to$1989.token.lineNumber,
                    sm_lineStart: to$1989.token.lineStart,
                    sm_range: to$1989.token.range
                }, to$1989);
            }
        }
        if (to$1989.token.leadingComments) {
            next$1990.token.leadingComments = to$1989.token.leadingComments;
        }
        if (to$1989.token.trailingComments) {
            next$1990.token.trailingComments = to$1989.token.trailingComments;
        }
        return next$1990;
    }
    function loadLiteralGroup$1966(patterns$1991) {
        _$1946.forEach(patterns$1991, function (patStx$1992) {
            if (patStx$1992.token.type === parser$1948.Token.Delimiter) {
                patStx$1992.token.inner = loadLiteralGroup$1966(patStx$1992.token.inner);
            } else {
                patStx$1992.class = 'pattern_literal';
            }
        });
        return patterns$1991;
    }
    function loadPattern$1967(patterns$1993) {
        return _$1946.chain(patterns$1993).reduce(function (acc$1994, patStx$1995, idx$1996) {
            var last$1997 = patterns$1993[idx$1996 - 1];
            var lastLast$1998 = patterns$1993[idx$1996 - 2];
            var next$1999 = patterns$1993[idx$1996 + 1];
            var nextNext$2000 = patterns$1993[idx$1996 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1995.token.value === ':') {
                if (last$1997 && isPatternVar$1962(last$1997) && !isPatternVar$1962(next$1999)) {
                    return acc$1994;
                }
            }
            if (last$1997 && last$1997.token.value === ':') {
                if (lastLast$1998 && isPatternVar$1962(lastLast$1998) && !isPatternVar$1962(patStx$1995)) {
                    return acc$1994;
                }
            }
            // skip over $
            if (patStx$1995.token.value === '$' && next$1999 && next$1999.token.type === parser$1948.Token.Delimiter) {
                return acc$1994;
            }
            if (isPatternVar$1962(patStx$1995)) {
                if (next$1999 && next$1999.token.value === ':' && !isPatternVar$1962(nextNext$2000)) {
                    if (typeof nextNext$2000 === 'undefined') {
                        throwSyntaxError$1957('patterns', 'expecting a pattern class following a `:`', next$1999);
                    }
                    patStx$1995.class = nextNext$2000.token.value;
                } else {
                    patStx$1995.class = 'token';
                }
            } else if (patStx$1995.token.type === parser$1948.Token.Delimiter) {
                if (last$1997 && last$1997.token.value === '$') {
                    patStx$1995.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1995.class === 'pattern_group' && patStx$1995.token.value === '[]') {
                    patStx$1995.token.inner = loadLiteralGroup$1966(patStx$1995.token.inner);
                } else {
                    patStx$1995.token.inner = loadPattern$1967(patStx$1995.token.inner);
                }
            } else {
                patStx$1995.class = 'pattern_literal';
            }
            return acc$1994.concat(patStx$1995);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$2001, patStx$2002, idx$2003, patterns$2004) {
            var separator$2005 = patStx$2002.separator || ' ';
            var repeat$2006 = patStx$2002.repeat || false;
            var next$2007 = patterns$2004[idx$2003 + 1];
            var nextNext$2008 = patterns$2004[idx$2003 + 2];
            if (next$2007 && next$2007.token.value === '...') {
                repeat$2006 = true;
                separator$2005 = ' ';
            } else if (delimIsSeparator$1961(next$2007) && nextNext$2008 && nextNext$2008.token.value === '...') {
                repeat$2006 = true;
                assert$1956(next$2007.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$2005 = next$2007.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$2002.token.value === '...' || delimIsSeparator$1961(patStx$2002) && next$2007 && next$2007.token.value === '...') {
                return acc$2001;
            }
            patStx$2002.repeat = repeat$2006;
            patStx$2002.separator = separator$2005;
            return acc$2001.concat(patStx$2002);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1968(patternClass$2009, stx$2010, env$2011) {
        var result$2012, rest$2013;
        // pattern has no parse class
        if (patternClass$2009 === 'token' && stx$2010[0] && stx$2010[0].token.type !== parser$1948.Token.EOF) {
            result$2012 = [stx$2010[0]];
            rest$2013 = stx$2010.slice(1);
        } else if (patternClass$2009 === 'lit' && stx$2010[0] && typeIsLiteral$1959(stx$2010[0].token.type)) {
            result$2012 = [stx$2010[0]];
            rest$2013 = stx$2010.slice(1);
        } else if (patternClass$2009 === 'ident' && stx$2010[0] && stx$2010[0].token.type === parser$1948.Token.Identifier) {
            result$2012 = [stx$2010[0]];
            rest$2013 = stx$2010.slice(1);
        } else if (stx$2010.length > 0 && patternClass$2009 === 'VariableStatement') {
            var match$2014 = expander$1949.enforest(stx$2010, expander$1949.makeExpanderContext({ env: env$2011 }));
            if (match$2014.result && match$2014.result.hasPrototype(expander$1949.VariableStatement)) {
                result$2012 = match$2014.result.destruct(false);
                rest$2013 = match$2014.rest;
            } else {
                result$2012 = null;
                rest$2013 = stx$2010;
            }
        } else if (stx$2010.length > 0 && patternClass$2009 === 'expr') {
            var match$2014 = expander$1949.get_expression(stx$2010, expander$1949.makeExpanderContext({ env: env$2011 }));
            if (match$2014.result === null || !match$2014.result.hasPrototype(expander$1949.Expr)) {
                result$2012 = null;
                rest$2013 = stx$2010;
            } else {
                result$2012 = match$2014.result.destruct(false);
                rest$2013 = match$2014.rest;
            }
        } else {
            result$2012 = null;
            rest$2013 = stx$2010;
        }
        return {
            result: result$2012,
            rest: rest$2013
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1969(patterns$2015, stx$2016, env$2017, topLevel$2018) {
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
        topLevel$2018 = topLevel$2018 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$2019 = [];
        var patternEnv$2020 = {};
        var match$2021;
        var pattern$2022;
        var rest$2023 = stx$2016;
        var success$2024 = true;
        patternLoop:
            for (var i$2025 = 0; i$2025 < patterns$2015.length; i$2025++) {
                if (success$2024 === false) {
                    break;
                }
                pattern$2022 = patterns$2015[i$2025];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$2022.repeat && i$2025 + 1 < patterns$2015.length) {
                        var restMatch$2026 = matchPatterns$1969(patterns$2015.slice(i$2025 + 1), rest$2023, env$2017, topLevel$2018);
                        if (restMatch$2026.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$2021 = matchPattern$1970(pattern$2022, [], env$2017, patternEnv$2020);
                            patternEnv$2020 = _$1946.extend(restMatch$2026.patternEnv, match$2021.patternEnv);
                            rest$2023 = restMatch$2026.rest;
                            break patternLoop;
                        }
                    }
                    match$2021 = matchPattern$1970(pattern$2022, rest$2023, env$2017, patternEnv$2020);
                    if (!match$2021.success && pattern$2022.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$2021.success) {
                        success$2024 = false;
                        break;
                    }
                    rest$2023 = match$2021.rest;
                    patternEnv$2020 = match$2021.patternEnv;
                    if (success$2024 && !(topLevel$2018 || pattern$2022.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$2025 == patterns$2015.length - 1 && rest$2023.length !== 0) {
                            success$2024 = false;
                            break;
                        }
                    }
                    if (pattern$2022.repeat && success$2024) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$2022.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$2023[0] && rest$2023[0].token.value === pattern$2022.separator) {
                            // more tokens and the next token matches the separator
                            rest$2023 = rest$2023.slice(1);
                        } else if (pattern$2022.separator !== ' ' && rest$2023.length > 0 && i$2025 === patterns$2015.length - 1 && topLevel$2018 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$2024 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$2022.repeat && success$2024 && rest$2023.length > 0);
            }
        return {
            success: success$2024,
            rest: rest$2023,
            patternEnv: patternEnv$2020
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
    function matchPattern$1970(pattern$2027, stx$2028, env$2029, patternEnv$2030) {
        var subMatch$2031;
        var match$2032, matchEnv$2033;
        var rest$2034;
        var success$2035;
        if (typeof pattern$2027.inner !== 'undefined') {
            if (pattern$2027.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$2031 = matchPatterns$1969(pattern$2027.inner, stx$2028, env$2029, true);
                rest$2034 = subMatch$2031.rest;
            } else if (stx$2028[0] && stx$2028[0].token.type === parser$1948.Token.Delimiter && stx$2028[0].token.value === pattern$2027.value) {
                stx$2028[0].expose();
                if (pattern$2027.inner.length === 0 && stx$2028[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$2028,
                        patternEnv: patternEnv$2030
                    };
                }
                subMatch$2031 = matchPatterns$1969(pattern$2027.inner, stx$2028[0].token.inner, env$2029, false);
                rest$2034 = stx$2028.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$2028,
                    patternEnv: patternEnv$2030
                };
            }
            success$2035 = subMatch$2031.success;
            // merge the subpattern matches with the current pattern environment
            _$1946.keys(subMatch$2031.patternEnv).forEach(function (patternKey$2036) {
                if (pattern$2027.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$2037 = subMatch$2031.patternEnv[patternKey$2036].level + 1;
                    if (patternEnv$2030[patternKey$2036]) {
                        patternEnv$2030[patternKey$2036].level = nextLevel$2037;
                        patternEnv$2030[patternKey$2036].match.push(subMatch$2031.patternEnv[patternKey$2036]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$2030[patternKey$2036] = {
                            level: nextLevel$2037,
                            match: [subMatch$2031.patternEnv[patternKey$2036]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$2030[patternKey$2036] = subMatch$2031.patternEnv[patternKey$2036];
                }
            });
        } else {
            if (pattern$2027.class === 'pattern_literal') {
                // wildcard
                if (stx$2028[0] && pattern$2027.value === '_') {
                    success$2035 = true;
                    rest$2034 = stx$2028.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$2028[0] && pattern$2027.value === stx$2028[0].token.value) {
                    success$2035 = true;
                    rest$2034 = stx$2028.slice(1);
                } else {
                    success$2035 = false;
                    rest$2034 = stx$2028;
                }
            } else {
                match$2032 = matchPatternClass$1968(pattern$2027.class, stx$2028, env$2029);
                success$2035 = match$2032.result !== null;
                rest$2034 = match$2032.rest;
                matchEnv$2033 = {
                    level: 0,
                    match: match$2032.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$2027.repeat) {
                    if (patternEnv$2030[pattern$2027.value] && success$2035) {
                        patternEnv$2030[pattern$2027.value].match.push(matchEnv$2033);
                    } else if (patternEnv$2030[pattern$2027.value] == undefined) {
                        // initialize if necessary
                        patternEnv$2030[pattern$2027.value] = {
                            level: 1,
                            match: [matchEnv$2033]
                        };
                    }
                } else {
                    patternEnv$2030[pattern$2027.value] = matchEnv$2033;
                }
            }
        }
        return {
            success: success$2035,
            rest: rest$2034,
            patternEnv: patternEnv$2030
        };
    }
    function hasMatch$1971(m$2038) {
        if (m$2038.level === 0) {
            return m$2038.match.length > 0;
        }
        return m$2038.match.every(function (m$2039) {
            return hasMatch$1971(m$2039);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1972(macroBody$2040, macroNameStx$2041, env$2042) {
        return _$1946.chain(macroBody$2040).reduce(function (acc$2043, bodyStx$2044, idx$2045, original$2046) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$2047 = original$2046[idx$2045 - 1];
            var next$2048 = original$2046[idx$2045 + 1];
            var nextNext$2049 = original$2046[idx$2045 + 2];
            // drop `...`
            if (bodyStx$2044.token.value === '...') {
                return acc$2043;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1961(bodyStx$2044) && next$2048 && next$2048.token.value === '...') {
                return acc$2043;
            }
            // skip the $ in $(...)
            if (bodyStx$2044.token.value === '$' && next$2048 && next$2048.token.type === parser$1948.Token.Delimiter && next$2048.token.value === '()') {
                return acc$2043;
            }
            // mark $[...] as a literal
            if (bodyStx$2044.token.value === '$' && next$2048 && next$2048.token.type === parser$1948.Token.Delimiter && next$2048.token.value === '[]') {
                next$2048.literal = true;
                return acc$2043;
            }
            if (bodyStx$2044.token.type === parser$1948.Token.Delimiter && bodyStx$2044.token.value === '()' && last$2047 && last$2047.token.value === '$') {
                bodyStx$2044.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$2044.literal === true) {
                assert$1956(bodyStx$2044.token.type === parser$1948.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$2043.concat(bodyStx$2044.token.inner);
            }
            if (next$2048 && next$2048.token.value === '...') {
                bodyStx$2044.repeat = true;
                bodyStx$2044.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1961(next$2048) && nextNext$2049 && nextNext$2049.token.value === '...') {
                bodyStx$2044.repeat = true;
                bodyStx$2044.separator = next$2048.token.inner[0].token.value;
            }
            return acc$2043.concat(bodyStx$2044);
        }, []).reduce(function (acc$2050, bodyStx$2051, idx$2052) {
            // then do the actual transcription
            if (bodyStx$2051.repeat) {
                if (bodyStx$2051.token.type === parser$1948.Token.Delimiter) {
                    bodyStx$2051.expose();
                    var fv$2053 = _$1946.filter(freeVarsInPattern$1958(bodyStx$2051.token.inner), function (pat$2060) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$2042.hasOwnProperty(pat$2060);
                        });
                    var restrictedEnv$2054 = [];
                    var nonScalar$2055 = _$1946.find(fv$2053, function (pat$2061) {
                            return env$2042[pat$2061].level > 0;
                        });
                    assert$1956(typeof nonScalar$2055 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$2056 = env$2042[nonScalar$2055].match.length;
                    var sameLength$2057 = _$1946.all(fv$2053, function (pat$2062) {
                            return env$2042[pat$2062].level === 0 || env$2042[pat$2062].match.length === repeatLength$2056;
                        });
                    assert$1956(sameLength$2057, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1946.each(_$1946.range(repeatLength$2056), function (idx$2063) {
                        var renv$2064 = {};
                        _$1946.each(fv$2053, function (pat$2066) {
                            if (env$2042[pat$2066].level === 0) {
                                // copy scalars over
                                renv$2064[pat$2066] = env$2042[pat$2066];
                            } else {
                                // grab the match at this index 
                                renv$2064[pat$2066] = env$2042[pat$2066].match[idx$2063];
                            }
                        });
                        var allHaveMatch$2065 = Object.keys(renv$2064).every(function (pat$2067) {
                                return hasMatch$1971(renv$2064[pat$2067]);
                            });
                        if (allHaveMatch$2065) {
                            restrictedEnv$2054.push(renv$2064);
                        }
                    });
                    var transcribed$2058 = _$1946.map(restrictedEnv$2054, function (renv$2068) {
                            if (bodyStx$2051.group) {
                                return transcribe$1972(bodyStx$2051.token.inner, macroNameStx$2041, renv$2068);
                            } else {
                                var newBody$2069 = syntaxFromToken$1952(_$1946.clone(bodyStx$2051.token), bodyStx$2051);
                                newBody$2069.token.inner = transcribe$1972(bodyStx$2051.token.inner, macroNameStx$2041, renv$2068);
                                return newBody$2069;
                            }
                        });
                    var joined$2059;
                    if (bodyStx$2051.group) {
                        joined$2059 = joinSyntaxArr$1955(transcribed$2058, bodyStx$2051.separator);
                    } else {
                        joined$2059 = joinSyntax$1954(transcribed$2058, bodyStx$2051.separator);
                    }
                    return acc$2050.concat(joined$2059);
                }
                if (!env$2042[bodyStx$2051.token.value]) {
                    throwSyntaxError$1957('patterns', 'The pattern variable is not bound for the template', bodyStx$2051);
                } else if (env$2042[bodyStx$2051.token.value].level !== 1) {
                    throwSyntaxError$1957('patterns', 'Ellipses level does not match in the template', bodyStx$2051);
                }
                return acc$2050.concat(joinRepeatedMatch$1963(env$2042[bodyStx$2051.token.value].match, bodyStx$2051.separator));
            } else {
                if (bodyStx$2051.token.type === parser$1948.Token.Delimiter) {
                    bodyStx$2051.expose();
                    var newBody$2070 = syntaxFromToken$1952(_$1946.clone(bodyStx$2051.token), macroBody$2040);
                    newBody$2070.token.inner = transcribe$1972(bodyStx$2051.token.inner, macroNameStx$2041, env$2042);
                    return acc$2050.concat([newBody$2070]);
                }
                if (isPatternVar$1962(bodyStx$2051) && Object.prototype.hasOwnProperty.bind(env$2042)(bodyStx$2051.token.value)) {
                    if (!env$2042[bodyStx$2051.token.value]) {
                        throwSyntaxError$1957('patterns', 'The pattern variable is not bound for the template', bodyStx$2051);
                    } else if (env$2042[bodyStx$2051.token.value].level !== 0) {
                        throwSyntaxError$1957('patterns', 'Ellipses level does not match in the template', bodyStx$2051);
                    }
                    return acc$2050.concat(takeLineContext$1964(bodyStx$2051, env$2042[bodyStx$2051.token.value].match));
                }
                return acc$2050.concat([bodyStx$2051]);
            }
        }, []).value();
    }
    exports$1945.loadPattern = loadPattern$1967;
    exports$1945.matchPatterns = matchPatterns$1969;
    exports$1945.transcribe = transcribe$1972;
    exports$1945.matchPatternClass = matchPatternClass$1968;
    exports$1945.takeLineContext = takeLineContext$1964;
    exports$1945.takeLine = takeLine$1965;
}));
//# sourceMappingURL=patterns.js.map