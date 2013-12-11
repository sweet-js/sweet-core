(function (root$1819, factory$1820) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1820(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1820);
    }
}(this, function (exports$1821, _$1822, es6$1823, parser$1824, expander$1825, syntax$1826) {
    var get_expression$1827 = expander$1825.get_expression;
    var syntaxFromToken$1828 = syntax$1826.syntaxFromToken;
    var makePunc$1829 = syntax$1826.makePunc;
    var joinSyntax$1830 = syntax$1826.joinSyntax;
    var joinSyntaxArr$1831 = syntax$1826.joinSyntaxArr;
    var assert$1832 = syntax$1826.assert;
    var throwSyntaxError$1833 = syntax$1826.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1834(pattern$1849) {
        var fv$1850 = [];
        _$1822.each(pattern$1849, function (pat$1851) {
            if (isPatternVar$1838(pat$1851)) {
                fv$1850.push(pat$1851.token.value);
            } else if (pat$1851.token.type === parser$1824.Token.Delimiter) {
                fv$1850 = fv$1850.concat(freeVarsInPattern$1834(pat$1851.token.inner));
            }
        });
        return fv$1850;
    }
    function typeIsLiteral$1835(type$1852) {
        return type$1852 === parser$1824.Token.NullLiteral || type$1852 === parser$1824.Token.NumericLiteral || type$1852 === parser$1824.Token.StringLiteral || type$1852 === parser$1824.Token.RegexLiteral || type$1852 === parser$1824.Token.BooleanLiteral;
    }
    function containsPatternVar$1836(patterns$1853) {
        return _$1822.any(patterns$1853, function (pat$1854) {
            if (pat$1854.token.type === parser$1824.Token.Delimiter) {
                return containsPatternVar$1836(pat$1854.token.inner);
            }
            return isPatternVar$1838(pat$1854);
        });
    }
    function delimIsSeparator$1837(delim$1855) {
        return delim$1855 && delim$1855.token && delim$1855.token.type === parser$1824.Token.Delimiter && delim$1855.token.value === '()' && delim$1855.token.inner.length === 1 && delim$1855.token.inner[0].token.type !== parser$1824.Token.Delimiter && !containsPatternVar$1836(delim$1855.token.inner);
    }
    function isPatternVar$1838(stx$1856) {
        return stx$1856.token.value[0] === '$' && stx$1856.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1839(tojoin$1857, punc$1858) {
        return _$1822.reduce(_$1822.rest(tojoin$1857, 1), function (acc$1859, join$1860) {
            if (punc$1858 === ' ') {
                return acc$1859.concat(join$1860.match);
            }
            return acc$1859.concat(makePunc$1829(punc$1858, _$1822.first(join$1860.match)), join$1860.match);
        }, _$1822.first(tojoin$1857).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1840(from$1861, to$1862) {
        return _$1822.map(to$1862, function (stx$1863) {
            return takeLine$1841(from$1861, stx$1863);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1841(from$1864, to$1865) {
        if (to$1865.token.type === parser$1824.Token.Delimiter) {
            var next$1866;
            if (from$1864.token.type === parser$1824.Token.Delimiter) {
                next$1866 = syntaxFromToken$1828({
                    type: parser$1824.Token.Delimiter,
                    value: to$1865.token.value,
                    inner: takeLineContext$1840(from$1864, to$1865.token.inner),
                    startRange: from$1864.token.startRange,
                    endRange: from$1864.token.endRange,
                    startLineNumber: from$1864.token.startLineNumber,
                    startLineStart: from$1864.token.startLineStart,
                    endLineNumber: from$1864.token.endLineNumber,
                    endLineStart: from$1864.token.endLineStart,
                    sm_startLineNumber: to$1865.token.startLineNumber,
                    sm_endLineNumber: to$1865.token.endLineNumber,
                    sm_startLineStart: to$1865.token.startLineStart,
                    sm_endLineStart: to$1865.token.endLineStart,
                    sm_startRange: to$1865.token.startRange,
                    sm_endRange: to$1865.token.endRange
                }, to$1865);
            } else {
                next$1866 = syntaxFromToken$1828({
                    type: parser$1824.Token.Delimiter,
                    value: to$1865.token.value,
                    inner: takeLineContext$1840(from$1864, to$1865.token.inner),
                    startRange: from$1864.token.range,
                    endRange: from$1864.token.range,
                    startLineNumber: from$1864.token.lineNumber,
                    startLineStart: from$1864.token.lineStart,
                    endLineNumber: from$1864.token.lineNumber,
                    endLineStart: from$1864.token.lineStart,
                    sm_startLineNumber: to$1865.token.startLineNumber,
                    sm_endLineNumber: to$1865.token.endLineNumber,
                    sm_startLineStart: to$1865.token.startLineStart,
                    sm_endLineStart: to$1865.token.endLineStart,
                    sm_startRange: to$1865.token.startRange,
                    sm_endRange: to$1865.token.endRange
                }, to$1865);
            }
        } else {
            if (from$1864.token.type === parser$1824.Token.Delimiter) {
                next$1866 = syntaxFromToken$1828({
                    value: to$1865.token.value,
                    type: to$1865.token.type,
                    lineNumber: from$1864.token.startLineNumber,
                    lineStart: from$1864.token.startLineStart,
                    range: from$1864.token.startRange,
                    sm_lineNumber: to$1865.token.lineNumber,
                    sm_lineStart: to$1865.token.lineStart,
                    sm_range: to$1865.token.range
                }, to$1865);
            } else {
                next$1866 = syntaxFromToken$1828({
                    value: to$1865.token.value,
                    type: to$1865.token.type,
                    lineNumber: from$1864.token.lineNumber,
                    lineStart: from$1864.token.lineStart,
                    range: from$1864.token.range,
                    sm_lineNumber: to$1865.token.lineNumber,
                    sm_lineStart: to$1865.token.lineStart,
                    sm_range: to$1865.token.range
                }, to$1865);
            }
        }
        if (to$1865.token.leadingComments) {
            next$1866.token.leadingComments = to$1865.token.leadingComments;
        }
        if (to$1865.token.trailingComments) {
            next$1866.token.trailingComments = to$1865.token.trailingComments;
        }
        return next$1866;
    }
    function loadLiteralGroup$1842(patterns$1867) {
        _$1822.forEach(patterns$1867, function (patStx$1868) {
            if (patStx$1868.token.type === parser$1824.Token.Delimiter) {
                patStx$1868.token.inner = loadLiteralGroup$1842(patStx$1868.token.inner);
            } else {
                patStx$1868.class = 'pattern_literal';
            }
        });
        return patterns$1867;
    }
    function loadPattern$1843(patterns$1869) {
        return _$1822.chain(patterns$1869).reduce(function (acc$1870, patStx$1871, idx$1872) {
            var last$1873 = patterns$1869[idx$1872 - 1];
            var lastLast$1874 = patterns$1869[idx$1872 - 2];
            var next$1875 = patterns$1869[idx$1872 + 1];
            var nextNext$1876 = patterns$1869[idx$1872 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1871.token.value === ':') {
                if (last$1873 && isPatternVar$1838(last$1873) && !isPatternVar$1838(next$1875)) {
                    return acc$1870;
                }
            }
            if (last$1873 && last$1873.token.value === ':') {
                if (lastLast$1874 && isPatternVar$1838(lastLast$1874) && !isPatternVar$1838(patStx$1871)) {
                    return acc$1870;
                }
            }
            // skip over $
            if (patStx$1871.token.value === '$' && next$1875 && next$1875.token.type === parser$1824.Token.Delimiter) {
                return acc$1870;
            }
            if (isPatternVar$1838(patStx$1871)) {
                if (next$1875 && next$1875.token.value === ':' && !isPatternVar$1838(nextNext$1876)) {
                    if (typeof nextNext$1876 === 'undefined') {
                        throwSyntaxError$1833('patterns', 'expecting a pattern class following a `:`', next$1875);
                    }
                    patStx$1871.class = nextNext$1876.token.value;
                } else {
                    patStx$1871.class = 'token';
                }
            } else if (patStx$1871.token.type === parser$1824.Token.Delimiter) {
                if (last$1873 && last$1873.token.value === '$') {
                    patStx$1871.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1871.class === 'pattern_group' && patStx$1871.token.value === '[]') {
                    patStx$1871.token.inner = loadLiteralGroup$1842(patStx$1871.token.inner);
                } else {
                    patStx$1871.token.inner = loadPattern$1843(patStx$1871.token.inner);
                }
            } else {
                patStx$1871.class = 'pattern_literal';
            }
            return acc$1870.concat(patStx$1871);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1877, patStx$1878, idx$1879, patterns$1880) {
            var separator$1881 = patStx$1878.separator || ' ';
            var repeat$1882 = patStx$1878.repeat || false;
            var next$1883 = patterns$1880[idx$1879 + 1];
            var nextNext$1884 = patterns$1880[idx$1879 + 2];
            if (next$1883 && next$1883.token.value === '...') {
                repeat$1882 = true;
                separator$1881 = ' ';
            } else if (delimIsSeparator$1837(next$1883) && nextNext$1884 && nextNext$1884.token.value === '...') {
                repeat$1882 = true;
                assert$1832(next$1883.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1881 = next$1883.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1878.token.value === '...' || delimIsSeparator$1837(patStx$1878) && next$1883 && next$1883.token.value === '...') {
                return acc$1877;
            }
            patStx$1878.repeat = repeat$1882;
            patStx$1878.separator = separator$1881;
            return acc$1877.concat(patStx$1878);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1844(patternClass$1885, stx$1886, env$1887) {
        var result$1888, rest$1889;
        // pattern has no parse class
        if (patternClass$1885 === 'token' && stx$1886[0] && stx$1886[0].token.type !== parser$1824.Token.EOF) {
            result$1888 = [stx$1886[0]];
            rest$1889 = stx$1886.slice(1);
        } else if (patternClass$1885 === 'lit' && stx$1886[0] && typeIsLiteral$1835(stx$1886[0].token.type)) {
            result$1888 = [stx$1886[0]];
            rest$1889 = stx$1886.slice(1);
        } else if (patternClass$1885 === 'ident' && stx$1886[0] && stx$1886[0].token.type === parser$1824.Token.Identifier) {
            result$1888 = [stx$1886[0]];
            rest$1889 = stx$1886.slice(1);
        } else if (stx$1886.length > 0 && patternClass$1885 === 'VariableStatement') {
            var match$1890 = expander$1825.enforest(stx$1886, expander$1825.makeExpanderContext({ env: env$1887 }));
            if (match$1890.result && match$1890.result.hasPrototype(expander$1825.VariableStatement)) {
                result$1888 = match$1890.result.destruct(false);
                rest$1889 = match$1890.rest;
            } else {
                result$1888 = null;
                rest$1889 = stx$1886;
            }
        } else if (stx$1886.length > 0 && patternClass$1885 === 'expr') {
            var match$1890 = expander$1825.get_expression(stx$1886, expander$1825.makeExpanderContext({ env: env$1887 }));
            if (match$1890.result === null || !match$1890.result.hasPrototype(expander$1825.Expr)) {
                result$1888 = null;
                rest$1889 = stx$1886;
            } else {
                result$1888 = match$1890.result.destruct(false);
                rest$1889 = match$1890.rest;
            }
        } else {
            result$1888 = null;
            rest$1889 = stx$1886;
        }
        return {
            result: result$1888,
            rest: rest$1889
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1845(patterns$1891, stx$1892, env$1893, topLevel$1894) {
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
        topLevel$1894 = topLevel$1894 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1895 = [];
        var patternEnv$1896 = {};
        var match$1897;
        var pattern$1898;
        var rest$1899 = stx$1892;
        var success$1900 = true;
        patternLoop:
            for (var i$1901 = 0; i$1901 < patterns$1891.length; i$1901++) {
                if (success$1900 === false) {
                    break;
                }
                pattern$1898 = patterns$1891[i$1901];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1898.repeat && i$1901 + 1 < patterns$1891.length) {
                        var restMatch$1902 = matchPatterns$1845(patterns$1891.slice(i$1901 + 1), rest$1899, env$1893, topLevel$1894);
                        if (restMatch$1902.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1897 = matchPattern$1846(pattern$1898, [], env$1893, patternEnv$1896);
                            patternEnv$1896 = _$1822.extend(restMatch$1902.patternEnv, match$1897.patternEnv);
                            rest$1899 = restMatch$1902.rest;
                            break patternLoop;
                        }
                    }
                    match$1897 = matchPattern$1846(pattern$1898, rest$1899, env$1893, patternEnv$1896);
                    if (!match$1897.success && pattern$1898.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1897.success) {
                        success$1900 = false;
                        break;
                    }
                    rest$1899 = match$1897.rest;
                    patternEnv$1896 = match$1897.patternEnv;
                    if (success$1900 && !(topLevel$1894 || pattern$1898.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1901 == patterns$1891.length - 1 && rest$1899.length !== 0) {
                            success$1900 = false;
                            break;
                        }
                    }
                    if (pattern$1898.repeat && success$1900) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1898.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1899[0] && rest$1899[0].token.value === pattern$1898.separator) {
                            // more tokens and the next token matches the separator
                            rest$1899 = rest$1899.slice(1);
                        } else if (pattern$1898.separator !== ' ' && rest$1899.length > 0 && i$1901 === patterns$1891.length - 1 && topLevel$1894 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1900 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1898.repeat && success$1900 && rest$1899.length > 0);
            }
        return {
            success: success$1900,
            rest: rest$1899,
            patternEnv: patternEnv$1896
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
    function matchPattern$1846(pattern$1903, stx$1904, env$1905, patternEnv$1906) {
        var subMatch$1907;
        var match$1908, matchEnv$1909;
        var rest$1910;
        var success$1911;
        if (typeof pattern$1903.inner !== 'undefined') {
            if (pattern$1903.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1907 = matchPatterns$1845(pattern$1903.inner, stx$1904, env$1905, true);
                rest$1910 = subMatch$1907.rest;
            } else if (stx$1904[0] && stx$1904[0].token.type === parser$1824.Token.Delimiter && stx$1904[0].token.value === pattern$1903.value) {
                stx$1904[0].expose();
                if (pattern$1903.inner.length === 0 && stx$1904[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1904,
                        patternEnv: patternEnv$1906
                    };
                }
                subMatch$1907 = matchPatterns$1845(pattern$1903.inner, stx$1904[0].token.inner, env$1905, false);
                rest$1910 = stx$1904.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1904,
                    patternEnv: patternEnv$1906
                };
            }
            success$1911 = subMatch$1907.success;
            // merge the subpattern matches with the current pattern environment
            _$1822.keys(subMatch$1907.patternEnv).forEach(function (patternKey$1912) {
                if (pattern$1903.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1913 = subMatch$1907.patternEnv[patternKey$1912].level + 1;
                    if (patternEnv$1906[patternKey$1912]) {
                        patternEnv$1906[patternKey$1912].level = nextLevel$1913;
                        patternEnv$1906[patternKey$1912].match.push(subMatch$1907.patternEnv[patternKey$1912]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1906[patternKey$1912] = {
                            level: nextLevel$1913,
                            match: [subMatch$1907.patternEnv[patternKey$1912]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1906[patternKey$1912] = subMatch$1907.patternEnv[patternKey$1912];
                }
            });
        } else {
            if (pattern$1903.class === 'pattern_literal') {
                // wildcard
                if (stx$1904[0] && pattern$1903.value === '_') {
                    success$1911 = true;
                    rest$1910 = stx$1904.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1904[0] && pattern$1903.value === stx$1904[0].token.value) {
                    success$1911 = true;
                    rest$1910 = stx$1904.slice(1);
                } else {
                    success$1911 = false;
                    rest$1910 = stx$1904;
                }
            } else {
                match$1908 = matchPatternClass$1844(pattern$1903.class, stx$1904, env$1905);
                success$1911 = match$1908.result !== null;
                rest$1910 = match$1908.rest;
                matchEnv$1909 = {
                    level: 0,
                    match: match$1908.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1903.repeat) {
                    if (patternEnv$1906[pattern$1903.value] && success$1911) {
                        patternEnv$1906[pattern$1903.value].match.push(matchEnv$1909);
                    } else if (patternEnv$1906[pattern$1903.value] == undefined) {
                        // initialize if necessary
                        patternEnv$1906[pattern$1903.value] = {
                            level: 1,
                            match: [matchEnv$1909]
                        };
                    }
                } else {
                    patternEnv$1906[pattern$1903.value] = matchEnv$1909;
                }
            }
        }
        return {
            success: success$1911,
            rest: rest$1910,
            patternEnv: patternEnv$1906
        };
    }
    function hasMatch$1847(m$1914) {
        if (m$1914.level === 0) {
            return m$1914.match.length > 0;
        }
        return m$1914.match.every(function (m$1915) {
            return hasMatch$1847(m$1915);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1848(macroBody$1916, macroNameStx$1917, env$1918) {
        return _$1822.chain(macroBody$1916).reduce(function (acc$1919, bodyStx$1920, idx$1921, original$1922) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1923 = original$1922[idx$1921 - 1];
            var next$1924 = original$1922[idx$1921 + 1];
            var nextNext$1925 = original$1922[idx$1921 + 2];
            // drop `...`
            if (bodyStx$1920.token.value === '...') {
                return acc$1919;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1837(bodyStx$1920) && next$1924 && next$1924.token.value === '...') {
                return acc$1919;
            }
            // skip the $ in $(...)
            if (bodyStx$1920.token.value === '$' && next$1924 && next$1924.token.type === parser$1824.Token.Delimiter && next$1924.token.value === '()') {
                return acc$1919;
            }
            // mark $[...] as a literal
            if (bodyStx$1920.token.value === '$' && next$1924 && next$1924.token.type === parser$1824.Token.Delimiter && next$1924.token.value === '[]') {
                next$1924.literal = true;
                return acc$1919;
            }
            if (bodyStx$1920.token.type === parser$1824.Token.Delimiter && bodyStx$1920.token.value === '()' && last$1923 && last$1923.token.value === '$') {
                bodyStx$1920.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1920.literal === true) {
                assert$1832(bodyStx$1920.token.type === parser$1824.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1919.concat(bodyStx$1920.token.inner);
            }
            if (next$1924 && next$1924.token.value === '...') {
                bodyStx$1920.repeat = true;
                bodyStx$1920.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1837(next$1924) && nextNext$1925 && nextNext$1925.token.value === '...') {
                bodyStx$1920.repeat = true;
                bodyStx$1920.separator = next$1924.token.inner[0].token.value;
            }
            return acc$1919.concat(bodyStx$1920);
        }, []).reduce(function (acc$1926, bodyStx$1927, idx$1928) {
            // then do the actual transcription
            if (bodyStx$1927.repeat) {
                if (bodyStx$1927.token.type === parser$1824.Token.Delimiter) {
                    bodyStx$1927.expose();
                    var fv$1929 = _$1822.filter(freeVarsInPattern$1834(bodyStx$1927.token.inner), function (pat$1936) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1918.hasOwnProperty(pat$1936);
                        });
                    var restrictedEnv$1930 = [];
                    var nonScalar$1931 = _$1822.find(fv$1929, function (pat$1937) {
                            return env$1918[pat$1937].level > 0;
                        });
                    assert$1832(typeof nonScalar$1931 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1932 = env$1918[nonScalar$1931].match.length;
                    var sameLength$1933 = _$1822.all(fv$1929, function (pat$1938) {
                            return env$1918[pat$1938].level === 0 || env$1918[pat$1938].match.length === repeatLength$1932;
                        });
                    assert$1832(sameLength$1933, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1822.each(_$1822.range(repeatLength$1932), function (idx$1939) {
                        var renv$1940 = {};
                        _$1822.each(fv$1929, function (pat$1942) {
                            if (env$1918[pat$1942].level === 0) {
                                // copy scalars over
                                renv$1940[pat$1942] = env$1918[pat$1942];
                            } else {
                                // grab the match at this index 
                                renv$1940[pat$1942] = env$1918[pat$1942].match[idx$1939];
                            }
                        });
                        var allHaveMatch$1941 = Object.keys(renv$1940).every(function (pat$1943) {
                                return hasMatch$1847(renv$1940[pat$1943]);
                            });
                        if (allHaveMatch$1941) {
                            restrictedEnv$1930.push(renv$1940);
                        }
                    });
                    var transcribed$1934 = _$1822.map(restrictedEnv$1930, function (renv$1944) {
                            if (bodyStx$1927.group) {
                                return transcribe$1848(bodyStx$1927.token.inner, macroNameStx$1917, renv$1944);
                            } else {
                                var newBody$1945 = syntaxFromToken$1828(_$1822.clone(bodyStx$1927.token), bodyStx$1927);
                                newBody$1945.token.inner = transcribe$1848(bodyStx$1927.token.inner, macroNameStx$1917, renv$1944);
                                return newBody$1945;
                            }
                        });
                    var joined$1935;
                    if (bodyStx$1927.group) {
                        joined$1935 = joinSyntaxArr$1831(transcribed$1934, bodyStx$1927.separator);
                    } else {
                        joined$1935 = joinSyntax$1830(transcribed$1934, bodyStx$1927.separator);
                    }
                    return acc$1926.concat(joined$1935);
                }
                if (!env$1918[bodyStx$1927.token.value]) {
                    throwSyntaxError$1833('patterns', 'The pattern variable is not bound for the template', bodyStx$1927);
                } else if (env$1918[bodyStx$1927.token.value].level !== 1) {
                    throwSyntaxError$1833('patterns', 'Ellipses level does not match in the template', bodyStx$1927);
                }
                return acc$1926.concat(joinRepeatedMatch$1839(env$1918[bodyStx$1927.token.value].match, bodyStx$1927.separator));
            } else {
                if (bodyStx$1927.token.type === parser$1824.Token.Delimiter) {
                    bodyStx$1927.expose();
                    var newBody$1946 = syntaxFromToken$1828(_$1822.clone(bodyStx$1927.token), macroBody$1916);
                    newBody$1946.token.inner = transcribe$1848(bodyStx$1927.token.inner, macroNameStx$1917, env$1918);
                    return acc$1926.concat([newBody$1946]);
                }
                if (isPatternVar$1838(bodyStx$1927) && Object.prototype.hasOwnProperty.bind(env$1918)(bodyStx$1927.token.value)) {
                    if (!env$1918[bodyStx$1927.token.value]) {
                        throwSyntaxError$1833('patterns', 'The pattern variable is not bound for the template', bodyStx$1927);
                    } else if (env$1918[bodyStx$1927.token.value].level !== 0) {
                        throwSyntaxError$1833('patterns', 'Ellipses level does not match in the template', bodyStx$1927);
                    }
                    return acc$1926.concat(takeLineContext$1840(bodyStx$1927, env$1918[bodyStx$1927.token.value].match));
                }
                return acc$1926.concat([bodyStx$1927]);
            }
        }, []).value();
    }
    exports$1821.loadPattern = loadPattern$1843;
    exports$1821.matchPatterns = matchPatterns$1845;
    exports$1821.transcribe = transcribe$1848;
    exports$1821.matchPatternClass = matchPatternClass$1844;
    exports$1821.takeLineContext = takeLineContext$1840;
    exports$1821.takeLine = takeLine$1841;
}));
//# sourceMappingURL=patterns.js.map