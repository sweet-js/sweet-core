(function (root$1801, factory$1802) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1802(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1802);
    }
}(this, function (exports$1803, _$1804, es6$1805, parser$1806, expander$1807, syntax$1808) {
    var get_expression$1809 = expander$1807.get_expression;
    var syntaxFromToken$1810 = syntax$1808.syntaxFromToken;
    var makePunc$1811 = syntax$1808.makePunc;
    var joinSyntax$1812 = syntax$1808.joinSyntax;
    var joinSyntaxArr$1813 = syntax$1808.joinSyntaxArr;
    var assert$1814 = syntax$1808.assert;
    var throwSyntaxError$1815 = syntax$1808.throwSyntaxError;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1816(pattern$1831) {
        var fv$1832 = [];
        _$1804.each(pattern$1831, function (pat$1833) {
            if (isPatternVar$1820(pat$1833)) {
                fv$1832.push(pat$1833.token.value);
            } else if (pat$1833.token.type === parser$1806.Token.Delimiter) {
                fv$1832 = fv$1832.concat(freeVarsInPattern$1816(pat$1833.token.inner));
            }
        });
        return fv$1832;
    }
    function typeIsLiteral$1817(type$1834) {
        return type$1834 === parser$1806.Token.NullLiteral || type$1834 === parser$1806.Token.NumericLiteral || type$1834 === parser$1806.Token.StringLiteral || type$1834 === parser$1806.Token.RegexLiteral || type$1834 === parser$1806.Token.BooleanLiteral;
    }
    function containsPatternVar$1818(patterns$1835) {
        return _$1804.any(patterns$1835, function (pat$1836) {
            if (pat$1836.token.type === parser$1806.Token.Delimiter) {
                return containsPatternVar$1818(pat$1836.token.inner);
            }
            return isPatternVar$1820(pat$1836);
        });
    }
    function delimIsSeparator$1819(delim$1837) {
        return delim$1837 && delim$1837.token && delim$1837.token.type === parser$1806.Token.Delimiter && delim$1837.token.value === '()' && delim$1837.token.inner.length === 1 && delim$1837.token.inner[0].token.type !== parser$1806.Token.Delimiter && !containsPatternVar$1818(delim$1837.token.inner);
    }
    function isPatternVar$1820(stx$1838) {
        return stx$1838.token.value[0] === '$' && stx$1838.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1821(tojoin$1839, punc$1840) {
        return _$1804.reduce(_$1804.rest(tojoin$1839, 1), function (acc$1841, join$1842) {
            if (punc$1840 === ' ') {
                return acc$1841.concat(join$1842.match);
            }
            return acc$1841.concat(makePunc$1811(punc$1840, _$1804.first(join$1842.match)), join$1842.match);
        }, _$1804.first(tojoin$1839).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1822(from$1843, to$1844) {
        return _$1804.map(to$1844, function (stx$1845) {
            return takeLine$1823(from$1843, stx$1845);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1823(from$1846, to$1847) {
        if (to$1847.token.type === parser$1806.Token.Delimiter) {
            var next$1848;
            if (from$1846.token.type === parser$1806.Token.Delimiter) {
                next$1848 = syntaxFromToken$1810({
                    type: parser$1806.Token.Delimiter,
                    value: to$1847.token.value,
                    inner: takeLineContext$1822(from$1846, to$1847.token.inner),
                    startRange: from$1846.token.startRange,
                    endRange: from$1846.token.endRange,
                    startLineNumber: from$1846.token.startLineNumber,
                    startLineStart: from$1846.token.startLineStart,
                    endLineNumber: from$1846.token.endLineNumber,
                    endLineStart: from$1846.token.endLineStart,
                    sm_startLineNumber: to$1847.token.startLineNumber,
                    sm_endLineNumber: to$1847.token.endLineNumber,
                    sm_startLineStart: to$1847.token.startLineStart,
                    sm_endLineStart: to$1847.token.endLineStart,
                    sm_startRange: to$1847.token.startRange,
                    sm_endRange: to$1847.token.endRange
                }, to$1847);
            } else {
                next$1848 = syntaxFromToken$1810({
                    type: parser$1806.Token.Delimiter,
                    value: to$1847.token.value,
                    inner: takeLineContext$1822(from$1846, to$1847.token.inner),
                    startRange: from$1846.token.range,
                    endRange: from$1846.token.range,
                    startLineNumber: from$1846.token.lineNumber,
                    startLineStart: from$1846.token.lineStart,
                    endLineNumber: from$1846.token.lineNumber,
                    endLineStart: from$1846.token.lineStart,
                    sm_startLineNumber: to$1847.token.startLineNumber,
                    sm_endLineNumber: to$1847.token.endLineNumber,
                    sm_startLineStart: to$1847.token.startLineStart,
                    sm_endLineStart: to$1847.token.endLineStart,
                    sm_startRange: to$1847.token.startRange,
                    sm_endRange: to$1847.token.endRange
                }, to$1847);
            }
        } else {
            if (from$1846.token.type === parser$1806.Token.Delimiter) {
                next$1848 = syntaxFromToken$1810({
                    value: to$1847.token.value,
                    type: to$1847.token.type,
                    lineNumber: from$1846.token.startLineNumber,
                    lineStart: from$1846.token.startLineStart,
                    range: from$1846.token.startRange,
                    sm_lineNumber: to$1847.token.lineNumber,
                    sm_lineStart: to$1847.token.lineStart,
                    sm_range: to$1847.token.range
                }, to$1847);
            } else {
                next$1848 = syntaxFromToken$1810({
                    value: to$1847.token.value,
                    type: to$1847.token.type,
                    lineNumber: from$1846.token.lineNumber,
                    lineStart: from$1846.token.lineStart,
                    range: from$1846.token.range,
                    sm_lineNumber: to$1847.token.lineNumber,
                    sm_lineStart: to$1847.token.lineStart,
                    sm_range: to$1847.token.range
                }, to$1847);
            }
        }
        if (to$1847.token.leadingComments) {
            next$1848.token.leadingComments = to$1847.token.leadingComments;
        }
        if (to$1847.token.trailingComments) {
            next$1848.token.trailingComments = to$1847.token.trailingComments;
        }
        return next$1848;
    }
    function loadLiteralGroup$1824(patterns$1849) {
        _$1804.forEach(patterns$1849, function (patStx$1850) {
            if (patStx$1850.token.type === parser$1806.Token.Delimiter) {
                patStx$1850.token.inner = loadLiteralGroup$1824(patStx$1850.token.inner);
            } else {
                patStx$1850.class = 'pattern_literal';
            }
        });
        return patterns$1849;
    }
    function loadPattern$1825(patterns$1851) {
        return _$1804.chain(patterns$1851).reduce(function (acc$1852, patStx$1853, idx$1854) {
            var last$1855 = patterns$1851[idx$1854 - 1];
            var lastLast$1856 = patterns$1851[idx$1854 - 2];
            var next$1857 = patterns$1851[idx$1854 + 1];
            var nextNext$1858 = patterns$1851[idx$1854 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1853.token.value === ':') {
                if (last$1855 && isPatternVar$1820(last$1855) && !isPatternVar$1820(next$1857)) {
                    return acc$1852;
                }
            }
            if (last$1855 && last$1855.token.value === ':') {
                if (lastLast$1856 && isPatternVar$1820(lastLast$1856) && !isPatternVar$1820(patStx$1853)) {
                    return acc$1852;
                }
            }
            // skip over $
            if (patStx$1853.token.value === '$' && next$1857 && next$1857.token.type === parser$1806.Token.Delimiter) {
                return acc$1852;
            }
            if (isPatternVar$1820(patStx$1853)) {
                if (next$1857 && next$1857.token.value === ':' && !isPatternVar$1820(nextNext$1858)) {
                    if (typeof nextNext$1858 === 'undefined') {
                        throwSyntaxError$1815('patterns', 'expecting a pattern class following a `:`', next$1857);
                    }
                    patStx$1853.class = nextNext$1858.token.value;
                } else {
                    patStx$1853.class = 'token';
                }
            } else if (patStx$1853.token.type === parser$1806.Token.Delimiter) {
                if (last$1855 && last$1855.token.value === '$') {
                    patStx$1853.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1853.class === 'pattern_group' && patStx$1853.token.value === '[]') {
                    patStx$1853.token.inner = loadLiteralGroup$1824(patStx$1853.token.inner);
                } else {
                    patStx$1853.token.inner = loadPattern$1825(patStx$1853.token.inner);
                }
            } else {
                patStx$1853.class = 'pattern_literal';
            }
            return acc$1852.concat(patStx$1853);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1859, patStx$1860, idx$1861, patterns$1862) {
            var separator$1863 = patStx$1860.separator || ' ';
            var repeat$1864 = patStx$1860.repeat || false;
            var next$1865 = patterns$1862[idx$1861 + 1];
            var nextNext$1866 = patterns$1862[idx$1861 + 2];
            if (next$1865 && next$1865.token.value === '...') {
                repeat$1864 = true;
                separator$1863 = ' ';
            } else if (delimIsSeparator$1819(next$1865) && nextNext$1866 && nextNext$1866.token.value === '...') {
                repeat$1864 = true;
                assert$1814(next$1865.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1863 = next$1865.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1860.token.value === '...' || delimIsSeparator$1819(patStx$1860) && next$1865 && next$1865.token.value === '...') {
                return acc$1859;
            }
            patStx$1860.repeat = repeat$1864;
            patStx$1860.separator = separator$1863;
            return acc$1859.concat(patStx$1860);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1826(patternClass$1867, stx$1868, env$1869) {
        var result$1870, rest$1871;
        // pattern has no parse class
        if (patternClass$1867 === 'token' && stx$1868[0] && stx$1868[0].token.type !== parser$1806.Token.EOF) {
            result$1870 = [stx$1868[0]];
            rest$1871 = stx$1868.slice(1);
        } else if (patternClass$1867 === 'lit' && stx$1868[0] && typeIsLiteral$1817(stx$1868[0].token.type)) {
            result$1870 = [stx$1868[0]];
            rest$1871 = stx$1868.slice(1);
        } else if (patternClass$1867 === 'ident' && stx$1868[0] && stx$1868[0].token.type === parser$1806.Token.Identifier) {
            result$1870 = [stx$1868[0]];
            rest$1871 = stx$1868.slice(1);
        } else if (stx$1868.length > 0 && patternClass$1867 === 'VariableStatement') {
            var match$1872 = expander$1807.enforest(stx$1868, expander$1807.makeExpanderContext({ env: env$1869 }));
            if (match$1872.result && match$1872.result.hasPrototype(expander$1807.VariableStatement)) {
                result$1870 = match$1872.result.destruct(false);
                rest$1871 = match$1872.rest;
            } else {
                result$1870 = null;
                rest$1871 = stx$1868;
            }
        } else if (stx$1868.length > 0 && patternClass$1867 === 'expr') {
            var match$1872 = expander$1807.get_expression(stx$1868, expander$1807.makeExpanderContext({ env: env$1869 }));
            if (match$1872.result === null || !match$1872.result.hasPrototype(expander$1807.Expr)) {
                result$1870 = null;
                rest$1871 = stx$1868;
            } else {
                result$1870 = match$1872.result.destruct(false);
                rest$1871 = match$1872.rest;
            }
        } else {
            result$1870 = null;
            rest$1871 = stx$1868;
        }
        return {
            result: result$1870,
            rest: rest$1871
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1827(patterns$1873, stx$1874, env$1875, topLevel$1876) {
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
        topLevel$1876 = topLevel$1876 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1877 = [];
        var patternEnv$1878 = {};
        var match$1879;
        var pattern$1880;
        var rest$1881 = stx$1874;
        var success$1882 = true;
        patternLoop:
            for (var i$1883 = 0; i$1883 < patterns$1873.length; i$1883++) {
                if (success$1882 === false) {
                    break;
                }
                pattern$1880 = patterns$1873[i$1883];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1880.repeat && i$1883 + 1 < patterns$1873.length) {
                        var restMatch$1884 = matchPatterns$1827(patterns$1873.slice(i$1883 + 1), rest$1881, env$1875, topLevel$1876);
                        if (restMatch$1884.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1879 = matchPattern$1828(pattern$1880, [], env$1875, patternEnv$1878);
                            patternEnv$1878 = _$1804.extend(restMatch$1884.patternEnv, match$1879.patternEnv);
                            rest$1881 = restMatch$1884.rest;
                            break patternLoop;
                        }
                    }
                    match$1879 = matchPattern$1828(pattern$1880, rest$1881, env$1875, patternEnv$1878);
                    if (!match$1879.success && pattern$1880.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1879.success) {
                        success$1882 = false;
                        break;
                    }
                    rest$1881 = match$1879.rest;
                    patternEnv$1878 = match$1879.patternEnv;
                    if (success$1882 && !(topLevel$1876 || pattern$1880.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1883 == patterns$1873.length - 1 && rest$1881.length !== 0) {
                            success$1882 = false;
                            break;
                        }
                    }
                    if (pattern$1880.repeat && success$1882) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1880.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1881[0] && rest$1881[0].token.value === pattern$1880.separator) {
                            // more tokens and the next token matches the separator
                            rest$1881 = rest$1881.slice(1);
                        } else if (pattern$1880.separator !== ' ' && rest$1881.length > 0 && i$1883 === patterns$1873.length - 1 && topLevel$1876 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1882 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1880.repeat && success$1882 && rest$1881.length > 0);
            }
        return {
            success: success$1882,
            rest: rest$1881,
            patternEnv: patternEnv$1878
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
    function matchPattern$1828(pattern$1885, stx$1886, env$1887, patternEnv$1888) {
        var subMatch$1889;
        var match$1890, matchEnv$1891;
        var rest$1892;
        var success$1893;
        if (typeof pattern$1885.inner !== 'undefined') {
            if (pattern$1885.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1889 = matchPatterns$1827(pattern$1885.inner, stx$1886, env$1887, true);
                rest$1892 = subMatch$1889.rest;
            } else if (stx$1886[0] && stx$1886[0].token.type === parser$1806.Token.Delimiter && stx$1886[0].token.value === pattern$1885.value) {
                stx$1886[0].expose();
                if (pattern$1885.inner.length === 0 && stx$1886[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1886,
                        patternEnv: patternEnv$1888
                    };
                }
                subMatch$1889 = matchPatterns$1827(pattern$1885.inner, stx$1886[0].token.inner, env$1887, false);
                rest$1892 = stx$1886.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1886,
                    patternEnv: patternEnv$1888
                };
            }
            success$1893 = subMatch$1889.success;
            // merge the subpattern matches with the current pattern environment
            _$1804.keys(subMatch$1889.patternEnv).forEach(function (patternKey$1894) {
                if (pattern$1885.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1895 = subMatch$1889.patternEnv[patternKey$1894].level + 1;
                    if (patternEnv$1888[patternKey$1894]) {
                        patternEnv$1888[patternKey$1894].level = nextLevel$1895;
                        patternEnv$1888[patternKey$1894].match.push(subMatch$1889.patternEnv[patternKey$1894]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1888[patternKey$1894] = {
                            level: nextLevel$1895,
                            match: [subMatch$1889.patternEnv[patternKey$1894]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1888[patternKey$1894] = subMatch$1889.patternEnv[patternKey$1894];
                }
            });
        } else {
            if (pattern$1885.class === 'pattern_literal') {
                // wildcard
                if (stx$1886[0] && pattern$1885.value === '_') {
                    success$1893 = true;
                    rest$1892 = stx$1886.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1886[0] && pattern$1885.value === stx$1886[0].token.value) {
                    success$1893 = true;
                    rest$1892 = stx$1886.slice(1);
                } else {
                    success$1893 = false;
                    rest$1892 = stx$1886;
                }
            } else {
                match$1890 = matchPatternClass$1826(pattern$1885.class, stx$1886, env$1887);
                success$1893 = match$1890.result !== null;
                rest$1892 = match$1890.rest;
                matchEnv$1891 = {
                    level: 0,
                    match: match$1890.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1885.repeat) {
                    if (patternEnv$1888[pattern$1885.value] && success$1893) {
                        patternEnv$1888[pattern$1885.value].match.push(matchEnv$1891);
                    } else if (patternEnv$1888[pattern$1885.value] == undefined) {
                        // initialize if necessary
                        patternEnv$1888[pattern$1885.value] = {
                            level: 1,
                            match: [matchEnv$1891]
                        };
                    }
                } else {
                    patternEnv$1888[pattern$1885.value] = matchEnv$1891;
                }
            }
        }
        return {
            success: success$1893,
            rest: rest$1892,
            patternEnv: patternEnv$1888
        };
    }
    function hasMatch$1829(m$1896) {
        if (m$1896.level === 0) {
            return m$1896.match.length > 0;
        }
        return m$1896.match.every(function (m$1897) {
            return hasMatch$1829(m$1897);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1830(macroBody$1898, macroNameStx$1899, env$1900) {
        return _$1804.chain(macroBody$1898).reduce(function (acc$1901, bodyStx$1902, idx$1903, original$1904) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1905 = original$1904[idx$1903 - 1];
            var next$1906 = original$1904[idx$1903 + 1];
            var nextNext$1907 = original$1904[idx$1903 + 2];
            // drop `...`
            if (bodyStx$1902.token.value === '...') {
                return acc$1901;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1819(bodyStx$1902) && next$1906 && next$1906.token.value === '...') {
                return acc$1901;
            }
            // skip the $ in $(...)
            if (bodyStx$1902.token.value === '$' && next$1906 && next$1906.token.type === parser$1806.Token.Delimiter && next$1906.token.value === '()') {
                return acc$1901;
            }
            // mark $[...] as a literal
            if (bodyStx$1902.token.value === '$' && next$1906 && next$1906.token.type === parser$1806.Token.Delimiter && next$1906.token.value === '[]') {
                next$1906.literal = true;
                return acc$1901;
            }
            if (bodyStx$1902.token.type === parser$1806.Token.Delimiter && bodyStx$1902.token.value === '()' && last$1905 && last$1905.token.value === '$') {
                bodyStx$1902.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1902.literal === true) {
                assert$1814(bodyStx$1902.token.type === parser$1806.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1901.concat(bodyStx$1902.token.inner);
            }
            if (next$1906 && next$1906.token.value === '...') {
                bodyStx$1902.repeat = true;
                bodyStx$1902.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1819(next$1906) && nextNext$1907 && nextNext$1907.token.value === '...') {
                bodyStx$1902.repeat = true;
                bodyStx$1902.separator = next$1906.token.inner[0].token.value;
            }
            return acc$1901.concat(bodyStx$1902);
        }, []).reduce(function (acc$1908, bodyStx$1909, idx$1910) {
            // then do the actual transcription
            if (bodyStx$1909.repeat) {
                if (bodyStx$1909.token.type === parser$1806.Token.Delimiter) {
                    bodyStx$1909.expose();
                    var fv$1911 = _$1804.filter(freeVarsInPattern$1816(bodyStx$1909.token.inner), function (pat$1918) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1900.hasOwnProperty(pat$1918);
                        });
                    var restrictedEnv$1912 = [];
                    var nonScalar$1913 = _$1804.find(fv$1911, function (pat$1919) {
                            return env$1900[pat$1919].level > 0;
                        });
                    assert$1814(typeof nonScalar$1913 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1914 = env$1900[nonScalar$1913].match.length;
                    var sameLength$1915 = _$1804.all(fv$1911, function (pat$1920) {
                            return env$1900[pat$1920].level === 0 || env$1900[pat$1920].match.length === repeatLength$1914;
                        });
                    assert$1814(sameLength$1915, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1804.each(_$1804.range(repeatLength$1914), function (idx$1921) {
                        var renv$1922 = {};
                        _$1804.each(fv$1911, function (pat$1924) {
                            if (env$1900[pat$1924].level === 0) {
                                // copy scalars over
                                renv$1922[pat$1924] = env$1900[pat$1924];
                            } else {
                                // grab the match at this index 
                                renv$1922[pat$1924] = env$1900[pat$1924].match[idx$1921];
                            }
                        });
                        var allHaveMatch$1923 = Object.keys(renv$1922).every(function (pat$1925) {
                                return hasMatch$1829(renv$1922[pat$1925]);
                            });
                        if (allHaveMatch$1923) {
                            restrictedEnv$1912.push(renv$1922);
                        }
                    });
                    var transcribed$1916 = _$1804.map(restrictedEnv$1912, function (renv$1926) {
                            if (bodyStx$1909.group) {
                                return transcribe$1830(bodyStx$1909.token.inner, macroNameStx$1899, renv$1926);
                            } else {
                                var newBody$1927 = syntaxFromToken$1810(_$1804.clone(bodyStx$1909.token), bodyStx$1909);
                                newBody$1927.token.inner = transcribe$1830(bodyStx$1909.token.inner, macroNameStx$1899, renv$1926);
                                return newBody$1927;
                            }
                        });
                    var joined$1917;
                    if (bodyStx$1909.group) {
                        joined$1917 = joinSyntaxArr$1813(transcribed$1916, bodyStx$1909.separator);
                    } else {
                        joined$1917 = joinSyntax$1812(transcribed$1916, bodyStx$1909.separator);
                    }
                    return acc$1908.concat(joined$1917);
                }
                if (!env$1900[bodyStx$1909.token.value]) {
                    throwSyntaxError$1815('patterns', 'The pattern variable is not bound for the template', bodyStx$1909);
                } else if (env$1900[bodyStx$1909.token.value].level !== 1) {
                    throwSyntaxError$1815('patterns', 'Ellipses level does not match in the template', bodyStx$1909);
                }
                return acc$1908.concat(joinRepeatedMatch$1821(env$1900[bodyStx$1909.token.value].match, bodyStx$1909.separator));
            } else {
                if (bodyStx$1909.token.type === parser$1806.Token.Delimiter) {
                    bodyStx$1909.expose();
                    var newBody$1928 = syntaxFromToken$1810(_$1804.clone(bodyStx$1909.token), macroBody$1898);
                    newBody$1928.token.inner = transcribe$1830(bodyStx$1909.token.inner, macroNameStx$1899, env$1900);
                    return acc$1908.concat([newBody$1928]);
                }
                if (isPatternVar$1820(bodyStx$1909) && Object.prototype.hasOwnProperty.bind(env$1900)(bodyStx$1909.token.value)) {
                    if (!env$1900[bodyStx$1909.token.value]) {
                        throwSyntaxError$1815('patterns', 'The pattern variable is not bound for the template', bodyStx$1909);
                    } else if (env$1900[bodyStx$1909.token.value].level !== 0) {
                        throwSyntaxError$1815('patterns', 'Ellipses level does not match in the template', bodyStx$1909);
                    }
                    return acc$1908.concat(takeLineContext$1822(bodyStx$1909, env$1900[bodyStx$1909.token.value].match));
                }
                return acc$1908.concat([bodyStx$1909]);
            }
        }, []).value();
    }
    exports$1803.loadPattern = loadPattern$1825;
    exports$1803.matchPatterns = matchPatterns$1827;
    exports$1803.transcribe = transcribe$1830;
    exports$1803.matchPatternClass = matchPatternClass$1826;
    exports$1803.takeLineContext = takeLineContext$1822;
    exports$1803.takeLine = takeLine$1823;
}));
//# sourceMappingURL=patterns.js.map