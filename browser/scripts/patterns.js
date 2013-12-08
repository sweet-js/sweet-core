(function (root$1774, factory$1775) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1775(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1775);
    }
}(this, function (exports$1776, _$1777, es6$1778, parser$1779, expander$1780, syntax$1781) {
    var get_expression$1782 = expander$1780.get_expression;
    var syntaxFromToken$1783 = syntax$1781.syntaxFromToken;
    var makePunc$1784 = syntax$1781.makePunc;
    var joinSyntax$1785 = syntax$1781.joinSyntax;
    var joinSyntaxArr$1786 = syntax$1781.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1787(pattern$1801) {
        var fv$1802 = [];
        _$1777.each(pattern$1801, function (pat$1803) {
            if (isPatternVar$1791(pat$1803)) {
                fv$1802.push(pat$1803.token.value);
            } else if (pat$1803.token.type === parser$1779.Token.Delimiter) {
                fv$1802 = fv$1802.concat(freeVarsInPattern$1787(pat$1803.token.inner));
            }
        });
        return fv$1802;
    }
    function typeIsLiteral$1788(type$1804) {
        return type$1804 === parser$1779.Token.NullLiteral || type$1804 === parser$1779.Token.NumericLiteral || type$1804 === parser$1779.Token.StringLiteral || type$1804 === parser$1779.Token.RegexLiteral || type$1804 === parser$1779.Token.BooleanLiteral;
    }
    function containsPatternVar$1789(patterns$1805) {
        return _$1777.any(patterns$1805, function (pat$1806) {
            if (pat$1806.token.type === parser$1779.Token.Delimiter) {
                return containsPatternVar$1789(pat$1806.token.inner);
            }
            return isPatternVar$1791(pat$1806);
        });
    }
    function delimIsSeparator$1790(delim$1807) {
        return delim$1807 && delim$1807.token && delim$1807.token.type === parser$1779.Token.Delimiter && delim$1807.token.value === '()' && delim$1807.token.inner.length === 1 && delim$1807.token.inner[0].token.type !== parser$1779.Token.Delimiter && !containsPatternVar$1789(delim$1807.token.inner);
    }
    function isPatternVar$1791(stx$1808) {
        return stx$1808.token.value[0] === '$' && stx$1808.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1792(tojoin$1809, punc$1810) {
        return _$1777.reduce(_$1777.rest(tojoin$1809, 1), function (acc$1811, join$1812) {
            if (punc$1810 === ' ') {
                return acc$1811.concat(join$1812.match);
            }
            return acc$1811.concat(makePunc$1784(punc$1810, _$1777.first(join$1812.match)), join$1812.match);
        }, _$1777.first(tojoin$1809).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1793(from$1813, to$1814) {
        return _$1777.map(to$1814, function (stx$1815) {
            return takeLine$1794(from$1813, stx$1815);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1794(from$1816, to$1817) {
        if (to$1817.token.type === parser$1779.Token.Delimiter) {
            var next$1818;
            if (from$1816.token.type === parser$1779.Token.Delimiter) {
                next$1818 = syntaxFromToken$1783({
                    type: parser$1779.Token.Delimiter,
                    value: to$1817.token.value,
                    inner: takeLineContext$1793(from$1816, to$1817.token.inner),
                    startRange: from$1816.token.startRange,
                    endRange: from$1816.token.endRange,
                    startLineNumber: from$1816.token.startLineNumber,
                    startLineStart: from$1816.token.startLineStart,
                    endLineNumber: from$1816.token.endLineNumber,
                    endLineStart: from$1816.token.endLineStart,
                    sm_startLineNumber: to$1817.token.startLineNumber,
                    sm_endLineNumber: to$1817.token.endLineNumber,
                    sm_startLineStart: to$1817.token.startLineStart,
                    sm_endLineStart: to$1817.token.endLineStart,
                    sm_startRange: to$1817.token.startRange,
                    sm_endRange: to$1817.token.endRange
                }, to$1817);
            } else {
                next$1818 = syntaxFromToken$1783({
                    type: parser$1779.Token.Delimiter,
                    value: to$1817.token.value,
                    inner: takeLineContext$1793(from$1816, to$1817.token.inner),
                    startRange: from$1816.token.range,
                    endRange: from$1816.token.range,
                    startLineNumber: from$1816.token.lineNumber,
                    startLineStart: from$1816.token.lineStart,
                    endLineNumber: from$1816.token.lineNumber,
                    endLineStart: from$1816.token.lineStart,
                    sm_startLineNumber: to$1817.token.startLineNumber,
                    sm_endLineNumber: to$1817.token.endLineNumber,
                    sm_startLineStart: to$1817.token.startLineStart,
                    sm_endLineStart: to$1817.token.endLineStart,
                    sm_startRange: to$1817.token.startRange,
                    sm_endRange: to$1817.token.endRange
                }, to$1817);
            }
        } else {
            if (from$1816.token.type === parser$1779.Token.Delimiter) {
                next$1818 = syntaxFromToken$1783({
                    value: to$1817.token.value,
                    type: to$1817.token.type,
                    lineNumber: from$1816.token.startLineNumber,
                    lineStart: from$1816.token.startLineStart,
                    range: from$1816.token.startRange,
                    sm_lineNumber: to$1817.token.lineNumber,
                    sm_lineStart: to$1817.token.lineStart,
                    sm_range: to$1817.token.range
                }, to$1817);
            } else {
                next$1818 = syntaxFromToken$1783({
                    value: to$1817.token.value,
                    type: to$1817.token.type,
                    lineNumber: from$1816.token.lineNumber,
                    lineStart: from$1816.token.lineStart,
                    range: from$1816.token.range,
                    sm_lineNumber: to$1817.token.lineNumber,
                    sm_lineStart: to$1817.token.lineStart,
                    sm_range: to$1817.token.range
                }, to$1817);
            }
        }
        if (to$1817.token.leadingComments) {
            next$1818.token.leadingComments = to$1817.token.leadingComments;
        }
        if (to$1817.token.trailingComments) {
            next$1818.token.trailingComments = to$1817.token.trailingComments;
        }
        return next$1818;
    }
    function loadLiteralGroup$1795(patterns$1819) {
        _$1777.forEach(patterns$1819, function (patStx$1820) {
            if (patStx$1820.token.type === parser$1779.Token.Delimiter) {
                patStx$1820.token.inner = loadLiteralGroup$1795(patStx$1820.token.inner);
            } else {
                patStx$1820.class = 'pattern_literal';
            }
        });
        return patterns$1819;
    }
    function loadPattern$1796(patterns$1821) {
        return _$1777.chain(patterns$1821).reduce(function (acc$1822, patStx$1823, idx$1824) {
            var last$1825 = patterns$1821[idx$1824 - 1];
            var lastLast$1826 = patterns$1821[idx$1824 - 2];
            var next$1827 = patterns$1821[idx$1824 + 1];
            var nextNext$1828 = patterns$1821[idx$1824 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1823.token.value === ':') {
                if (last$1825 && isPatternVar$1791(last$1825) && !isPatternVar$1791(next$1827)) {
                    return acc$1822;
                }
            }
            if (last$1825 && last$1825.token.value === ':') {
                if (lastLast$1826 && isPatternVar$1791(lastLast$1826) && !isPatternVar$1791(patStx$1823)) {
                    return acc$1822;
                }
            }
            // skip over $
            if (patStx$1823.token.value === '$' && next$1827 && next$1827.token.type === parser$1779.Token.Delimiter) {
                return acc$1822;
            }
            if (isPatternVar$1791(patStx$1823)) {
                if (next$1827 && next$1827.token.value === ':' && !isPatternVar$1791(nextNext$1828)) {
                    if (typeof nextNext$1828 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1823.class = nextNext$1828.token.value;
                } else {
                    patStx$1823.class = 'token';
                }
            } else if (patStx$1823.token.type === parser$1779.Token.Delimiter) {
                if (last$1825 && last$1825.token.value === '$') {
                    patStx$1823.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1823.class === 'pattern_group' && patStx$1823.token.value === '[]') {
                    patStx$1823.token.inner = loadLiteralGroup$1795(patStx$1823.token.inner);
                } else {
                    patStx$1823.token.inner = loadPattern$1796(patStx$1823.token.inner);
                }
            } else {
                patStx$1823.class = 'pattern_literal';
            }
            return acc$1822.concat(patStx$1823);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1829, patStx$1830, idx$1831, patterns$1832) {
            var separator$1833 = patStx$1830.separator || ' ';
            var repeat$1834 = patStx$1830.repeat || false;
            var next$1835 = patterns$1832[idx$1831 + 1];
            var nextNext$1836 = patterns$1832[idx$1831 + 2];
            if (next$1835 && next$1835.token.value === '...') {
                repeat$1834 = true;
                separator$1833 = ' ';
            } else if (delimIsSeparator$1790(next$1835) && nextNext$1836 && nextNext$1836.token.value === '...') {
                repeat$1834 = true;
                parser$1779.assert(next$1835.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1833 = next$1835.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1830.token.value === '...' || delimIsSeparator$1790(patStx$1830) && next$1835 && next$1835.token.value === '...') {
                return acc$1829;
            }
            patStx$1830.repeat = repeat$1834;
            patStx$1830.separator = separator$1833;
            return acc$1829.concat(patStx$1830);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1797(patternClass$1837, stx$1838, env$1839) {
        var result$1840, rest$1841;
        // pattern has no parse class
        if (patternClass$1837 === 'token' && stx$1838[0] && stx$1838[0].token.type !== parser$1779.Token.EOF) {
            result$1840 = [stx$1838[0]];
            rest$1841 = stx$1838.slice(1);
        } else if (patternClass$1837 === 'lit' && stx$1838[0] && typeIsLiteral$1788(stx$1838[0].token.type)) {
            result$1840 = [stx$1838[0]];
            rest$1841 = stx$1838.slice(1);
        } else if (patternClass$1837 === 'ident' && stx$1838[0] && stx$1838[0].token.type === parser$1779.Token.Identifier) {
            result$1840 = [stx$1838[0]];
            rest$1841 = stx$1838.slice(1);
        } else if (stx$1838.length > 0 && patternClass$1837 === 'VariableStatement') {
            var match$1842 = expander$1780.enforest(stx$1838, expander$1780.makeExpanderContext({ env: env$1839 }));
            if (match$1842.result && match$1842.result.hasPrototype(expander$1780.VariableStatement)) {
                result$1840 = match$1842.result.destruct(false);
                rest$1841 = match$1842.rest;
            } else {
                result$1840 = null;
                rest$1841 = stx$1838;
            }
        } else if (stx$1838.length > 0 && patternClass$1837 === 'expr') {
            var match$1842 = expander$1780.get_expression(stx$1838, expander$1780.makeExpanderContext({ env: env$1839 }));
            if (match$1842.result === null || !match$1842.result.hasPrototype(expander$1780.Expr)) {
                result$1840 = null;
                rest$1841 = stx$1838;
            } else {
                result$1840 = match$1842.result.destruct(false);
                rest$1841 = match$1842.rest;
            }
        } else {
            result$1840 = null;
            rest$1841 = stx$1838;
        }
        return {
            result: result$1840,
            rest: rest$1841
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1798(patterns$1843, stx$1844, env$1845, topLevel$1846) {
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
        topLevel$1846 = topLevel$1846 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1847 = [];
        var patternEnv$1848 = {};
        var match$1849;
        var pattern$1850;
        var rest$1851 = stx$1844;
        var success$1852 = true;
        patternLoop:
            for (var i$1853 = 0; i$1853 < patterns$1843.length; i$1853++) {
                if (success$1852 === false) {
                    break;
                }
                pattern$1850 = patterns$1843[i$1853];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1850.repeat && i$1853 + 1 < patterns$1843.length) {
                        var restMatch$1854 = matchPatterns$1798(patterns$1843.slice(i$1853 + 1), rest$1851, env$1845, topLevel$1846);
                        if (restMatch$1854.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1849 = matchPattern$1799(pattern$1850, [], env$1845, patternEnv$1848);
                            patternEnv$1848 = _$1777.extend(restMatch$1854.patternEnv, match$1849.patternEnv);
                            rest$1851 = restMatch$1854.rest;
                            break patternLoop;
                        }
                    }
                    match$1849 = matchPattern$1799(pattern$1850, rest$1851, env$1845, patternEnv$1848);
                    if (!match$1849.success && pattern$1850.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1849.success) {
                        success$1852 = false;
                        break;
                    }
                    rest$1851 = match$1849.rest;
                    patternEnv$1848 = match$1849.patternEnv;
                    if (success$1852 && !(topLevel$1846 || pattern$1850.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1853 == patterns$1843.length - 1 && rest$1851.length !== 0) {
                            success$1852 = false;
                            break;
                        }
                    }
                    if (pattern$1850.repeat && success$1852) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1850.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1851[0] && rest$1851[0].token.value === pattern$1850.separator) {
                            // more tokens and the next token matches the separator
                            rest$1851 = rest$1851.slice(1);
                        } else if (pattern$1850.separator !== ' ' && rest$1851.length > 0 && i$1853 === patterns$1843.length - 1 && topLevel$1846 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1852 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1850.repeat && success$1852 && rest$1851.length > 0);
            }
        return {
            success: success$1852,
            rest: rest$1851,
            patternEnv: patternEnv$1848
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
    function matchPattern$1799(pattern$1855, stx$1856, env$1857, patternEnv$1858) {
        var subMatch$1859;
        var match$1860, matchEnv$1861;
        var rest$1862;
        var success$1863;
        if (typeof pattern$1855.inner !== 'undefined') {
            if (pattern$1855.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1859 = matchPatterns$1798(pattern$1855.inner, stx$1856, env$1857, true);
                rest$1862 = subMatch$1859.rest;
            } else if (stx$1856[0] && stx$1856[0].token.type === parser$1779.Token.Delimiter && stx$1856[0].token.value === pattern$1855.value) {
                stx$1856[0].expose();
                if (pattern$1855.inner.length === 0 && stx$1856[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1856,
                        patternEnv: patternEnv$1858
                    };
                }
                subMatch$1859 = matchPatterns$1798(pattern$1855.inner, stx$1856[0].token.inner, env$1857, false);
                rest$1862 = stx$1856.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1856,
                    patternEnv: patternEnv$1858
                };
            }
            success$1863 = subMatch$1859.success;
            // merge the subpattern matches with the current pattern environment
            _$1777.keys(subMatch$1859.patternEnv).forEach(function (patternKey$1864) {
                if (pattern$1855.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1865 = subMatch$1859.patternEnv[patternKey$1864].level + 1;
                    if (patternEnv$1858[patternKey$1864]) {
                        patternEnv$1858[patternKey$1864].level = nextLevel$1865;
                        patternEnv$1858[patternKey$1864].match.push(subMatch$1859.patternEnv[patternKey$1864]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1858[patternKey$1864] = {
                            level: nextLevel$1865,
                            match: [subMatch$1859.patternEnv[patternKey$1864]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1858[patternKey$1864] = subMatch$1859.patternEnv[patternKey$1864];
                }
            });
        } else {
            if (pattern$1855.class === 'pattern_literal') {
                // wildcard
                if (stx$1856[0] && pattern$1855.value === '_') {
                    success$1863 = true;
                    rest$1862 = stx$1856.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1856[0] && pattern$1855.value === stx$1856[0].token.value) {
                    success$1863 = true;
                    rest$1862 = stx$1856.slice(1);
                } else {
                    success$1863 = false;
                    rest$1862 = stx$1856;
                }
            } else {
                match$1860 = matchPatternClass$1797(pattern$1855.class, stx$1856, env$1857);
                success$1863 = match$1860.result !== null;
                rest$1862 = match$1860.rest;
                matchEnv$1861 = {
                    level: 0,
                    match: match$1860.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1855.repeat) {
                    if (patternEnv$1858[pattern$1855.value]) {
                        patternEnv$1858[pattern$1855.value].match.push(matchEnv$1861);
                    } else {
                        // initialize if necessary
                        patternEnv$1858[pattern$1855.value] = {
                            level: 1,
                            match: [matchEnv$1861]
                        };
                    }
                } else {
                    patternEnv$1858[pattern$1855.value] = matchEnv$1861;
                }
            }
        }
        return {
            success: success$1863,
            rest: rest$1862,
            patternEnv: patternEnv$1858
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1800(macroBody$1866, macroNameStx$1867, env$1868) {
        return _$1777.chain(macroBody$1866).reduce(function (acc$1869, bodyStx$1870, idx$1871, original$1872) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1873 = original$1872[idx$1871 - 1];
            var next$1874 = original$1872[idx$1871 + 1];
            var nextNext$1875 = original$1872[idx$1871 + 2];
            // drop `...`
            if (bodyStx$1870.token.value === '...') {
                return acc$1869;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1790(bodyStx$1870) && next$1874 && next$1874.token.value === '...') {
                return acc$1869;
            }
            // skip the $ in $(...)
            if (bodyStx$1870.token.value === '$' && next$1874 && next$1874.token.type === parser$1779.Token.Delimiter && next$1874.token.value === '()') {
                return acc$1869;
            }
            // mark $[...] as a literal
            if (bodyStx$1870.token.value === '$' && next$1874 && next$1874.token.type === parser$1779.Token.Delimiter && next$1874.token.value === '[]') {
                next$1874.literal = true;
                return acc$1869;
            }
            if (bodyStx$1870.token.type === parser$1779.Token.Delimiter && bodyStx$1870.token.value === '()' && last$1873 && last$1873.token.value === '$') {
                bodyStx$1870.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1870.literal === true) {
                parser$1779.assert(bodyStx$1870.token.type === parser$1779.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1869.concat(bodyStx$1870.token.inner);
            }
            if (next$1874 && next$1874.token.value === '...') {
                bodyStx$1870.repeat = true;
                bodyStx$1870.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1790(next$1874) && nextNext$1875 && nextNext$1875.token.value === '...') {
                bodyStx$1870.repeat = true;
                bodyStx$1870.separator = next$1874.token.inner[0].token.value;
            }
            return acc$1869.concat(bodyStx$1870);
        }, []).reduce(function (acc$1876, bodyStx$1877, idx$1878) {
            // then do the actual transcription
            if (bodyStx$1877.repeat) {
                if (bodyStx$1877.token.type === parser$1779.Token.Delimiter) {
                    bodyStx$1877.expose();
                    var fv$1879 = _$1777.filter(freeVarsInPattern$1787(bodyStx$1877.token.inner), function (pat$1886) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1868.hasOwnProperty(pat$1886);
                        });
                    var restrictedEnv$1880 = [];
                    var nonScalar$1881 = _$1777.find(fv$1879, function (pat$1887) {
                            return env$1868[pat$1887].level > 0;
                        });
                    parser$1779.assert(typeof nonScalar$1881 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1882 = env$1868[nonScalar$1881].match.length;
                    var sameLength$1883 = _$1777.all(fv$1879, function (pat$1888) {
                            return env$1868[pat$1888].level === 0 || env$1868[pat$1888].match.length === repeatLength$1882;
                        });
                    parser$1779.assert(sameLength$1883, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1880 = _$1777.map(_$1777.range(repeatLength$1882), function (idx$1889) {
                        var renv$1890 = {};
                        _$1777.each(fv$1879, function (pat$1891) {
                            if (env$1868[pat$1891].level === 0) {
                                // copy scalars over
                                renv$1890[pat$1891] = env$1868[pat$1891];
                            } else {
                                // grab the match at this index
                                renv$1890[pat$1891] = env$1868[pat$1891].match[idx$1889];
                            }
                        });
                        return renv$1890;
                    });
                    var transcribed$1884 = _$1777.map(restrictedEnv$1880, function (renv$1892) {
                            if (bodyStx$1877.group) {
                                return transcribe$1800(bodyStx$1877.token.inner, macroNameStx$1867, renv$1892);
                            } else {
                                var newBody$1893 = syntaxFromToken$1783(_$1777.clone(bodyStx$1877.token), bodyStx$1877);
                                newBody$1893.token.inner = transcribe$1800(bodyStx$1877.token.inner, macroNameStx$1867, renv$1892);
                                return newBody$1893;
                            }
                        });
                    var joined$1885;
                    if (bodyStx$1877.group) {
                        joined$1885 = joinSyntaxArr$1786(transcribed$1884, bodyStx$1877.separator);
                    } else {
                        joined$1885 = joinSyntax$1785(transcribed$1884, bodyStx$1877.separator);
                    }
                    return acc$1876.concat(joined$1885);
                }
                if (!env$1868[bodyStx$1877.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1877.token.value + ' is not bound for the template');
                } else if (env$1868[bodyStx$1877.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1877.token.value + ' does not match in the template');
                }
                return acc$1876.concat(joinRepeatedMatch$1792(env$1868[bodyStx$1877.token.value].match, bodyStx$1877.separator));
            } else {
                if (bodyStx$1877.token.type === parser$1779.Token.Delimiter) {
                    bodyStx$1877.expose();
                    var newBody$1894 = syntaxFromToken$1783(_$1777.clone(bodyStx$1877.token), macroBody$1866);
                    newBody$1894.token.inner = transcribe$1800(bodyStx$1877.token.inner, macroNameStx$1867, env$1868);
                    return acc$1876.concat([newBody$1894]);
                }
                if (isPatternVar$1791(bodyStx$1877) && Object.prototype.hasOwnProperty.bind(env$1868)(bodyStx$1877.token.value)) {
                    if (!env$1868[bodyStx$1877.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1877.token.value + ' is not bound for the template');
                    } else if (env$1868[bodyStx$1877.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1877.token.value + ' does not match in the template');
                    }
                    return acc$1876.concat(takeLineContext$1793(bodyStx$1877, env$1868[bodyStx$1877.token.value].match));
                }
                return acc$1876.concat([bodyStx$1877]);
            }
        }, []).value();
    }
    exports$1776.loadPattern = loadPattern$1796;
    exports$1776.matchPatterns = matchPatterns$1798;
    exports$1776.transcribe = transcribe$1800;
    exports$1776.matchPatternClass = matchPatternClass$1797;
    exports$1776.takeLineContext = takeLineContext$1793;
    exports$1776.takeLine = takeLine$1794;
}));
//# sourceMappingURL=patterns.js.map