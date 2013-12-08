(function (root$1772, factory$1773) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1773(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1773);
    }
}(this, function (exports$1774, _$1775, es6$1776, parser$1777, expander$1778, syntax$1779) {
    var get_expression$1780 = expander$1778.get_expression;
    var syntaxFromToken$1781 = syntax$1779.syntaxFromToken;
    var makePunc$1782 = syntax$1779.makePunc;
    var joinSyntax$1783 = syntax$1779.joinSyntax;
    var joinSyntaxArr$1784 = syntax$1779.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1785(pattern$1798) {
        var fv$1799 = [];
        _$1775.each(pattern$1798, function (pat$1800) {
            if (isPatternVar$1789(pat$1800)) {
                fv$1799.push(pat$1800.token.value);
            } else if (pat$1800.token.type === parser$1777.Token.Delimiter) {
                fv$1799 = fv$1799.concat(freeVarsInPattern$1785(pat$1800.token.inner));
            }
        });
        return fv$1799;
    }
    function typeIsLiteral$1786(type$1801) {
        return type$1801 === parser$1777.Token.NullLiteral || type$1801 === parser$1777.Token.NumericLiteral || type$1801 === parser$1777.Token.StringLiteral || type$1801 === parser$1777.Token.RegexLiteral || type$1801 === parser$1777.Token.BooleanLiteral;
    }
    function containsPatternVar$1787(patterns$1802) {
        return _$1775.any(patterns$1802, function (pat$1803) {
            if (pat$1803.token.type === parser$1777.Token.Delimiter) {
                return containsPatternVar$1787(pat$1803.token.inner);
            }
            return isPatternVar$1789(pat$1803);
        });
    }
    function delimIsSeparator$1788(delim$1804) {
        return delim$1804 && delim$1804.token && delim$1804.token.type === parser$1777.Token.Delimiter && delim$1804.token.value === '()' && delim$1804.token.inner.length === 1 && delim$1804.token.inner[0].token.type !== parser$1777.Token.Delimiter && !containsPatternVar$1787(delim$1804.token.inner);
    }
    function isPatternVar$1789(stx$1805) {
        return stx$1805.token.value[0] === '$' && stx$1805.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1790(tojoin$1806, punc$1807) {
        return _$1775.reduce(_$1775.rest(tojoin$1806, 1), function (acc$1808, join$1809) {
            if (punc$1807 === ' ') {
                return acc$1808.concat(join$1809.match);
            }
            return acc$1808.concat(makePunc$1782(punc$1807, _$1775.first(join$1809.match)), join$1809.match);
        }, _$1775.first(tojoin$1806).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1791(from$1810, to$1811) {
        return _$1775.map(to$1811, function (stx$1812) {
            return takeLine$1792(from$1810, stx$1812);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1792(from$1813, to$1814) {
        if (to$1814.token.type === parser$1777.Token.Delimiter) {
            var next$1815;
            if (from$1813.token.type === parser$1777.Token.Delimiter) {
                next$1815 = syntaxFromToken$1781({
                    type: parser$1777.Token.Delimiter,
                    value: to$1814.token.value,
                    inner: takeLineContext$1791(from$1813, to$1814.token.inner),
                    startRange: from$1813.token.startRange,
                    endRange: from$1813.token.endRange,
                    startLineNumber: from$1813.token.startLineNumber,
                    startLineStart: from$1813.token.startLineStart,
                    endLineNumber: from$1813.token.endLineNumber,
                    endLineStart: from$1813.token.endLineStart,
                    sm_startLineNumber: to$1814.token.startLineNumber,
                    sm_endLineNumber: to$1814.token.endLineNumber,
                    sm_startLineStart: to$1814.token.startLineStart,
                    sm_endLineStart: to$1814.token.endLineStart,
                    sm_startRange: to$1814.token.startRange,
                    sm_endRange: to$1814.token.endRange
                }, to$1814);
            } else {
                next$1815 = syntaxFromToken$1781({
                    type: parser$1777.Token.Delimiter,
                    value: to$1814.token.value,
                    inner: takeLineContext$1791(from$1813, to$1814.token.inner),
                    startRange: from$1813.token.range,
                    endRange: from$1813.token.range,
                    startLineNumber: from$1813.token.lineNumber,
                    startLineStart: from$1813.token.lineStart,
                    endLineNumber: from$1813.token.lineNumber,
                    endLineStart: from$1813.token.lineStart,
                    sm_startLineNumber: to$1814.token.startLineNumber,
                    sm_endLineNumber: to$1814.token.endLineNumber,
                    sm_startLineStart: to$1814.token.startLineStart,
                    sm_endLineStart: to$1814.token.endLineStart,
                    sm_startRange: to$1814.token.startRange,
                    sm_endRange: to$1814.token.endRange
                }, to$1814);
            }
        } else {
            if (from$1813.token.type === parser$1777.Token.Delimiter) {
                next$1815 = syntaxFromToken$1781({
                    value: to$1814.token.value,
                    type: to$1814.token.type,
                    lineNumber: from$1813.token.startLineNumber,
                    lineStart: from$1813.token.startLineStart,
                    range: from$1813.token.startRange,
                    sm_lineNumber: to$1814.token.lineNumber,
                    sm_lineStart: to$1814.token.lineStart,
                    sm_range: to$1814.token.range
                }, to$1814);
            } else {
                next$1815 = syntaxFromToken$1781({
                    value: to$1814.token.value,
                    type: to$1814.token.type,
                    lineNumber: from$1813.token.lineNumber,
                    lineStart: from$1813.token.lineStart,
                    range: from$1813.token.range,
                    sm_lineNumber: to$1814.token.lineNumber,
                    sm_lineStart: to$1814.token.lineStart,
                    sm_range: to$1814.token.range
                }, to$1814);
            }
        }
        if (to$1814.token.leadingComments) {
            next$1815.token.leadingComments = to$1814.token.leadingComments;
        }
        if (to$1814.token.trailingComments) {
            next$1815.token.trailingComments = to$1814.token.trailingComments;
        }
        return next$1815;
    }
    function loadPattern$1793(patterns$1816) {
        return _$1775.chain(patterns$1816).reduce(function (acc$1817, patStx$1818, idx$1819) {
            var last$1820 = patterns$1816[idx$1819 - 1];
            var lastLast$1821 = patterns$1816[idx$1819 - 2];
            var next$1822 = patterns$1816[idx$1819 + 1];
            var nextNext$1823 = patterns$1816[idx$1819 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1818.token.value === ':') {
                if (last$1820 && isPatternVar$1789(last$1820) && !isPatternVar$1789(next$1822)) {
                    return acc$1817;
                }
            }
            if (last$1820 && last$1820.token.value === ':') {
                if (lastLast$1821 && isPatternVar$1789(lastLast$1821) && !isPatternVar$1789(patStx$1818)) {
                    return acc$1817;
                }
            }
            // skip over $
            if (patStx$1818.token.value === '$' && next$1822 && next$1822.token.type === parser$1777.Token.Delimiter) {
                return acc$1817;
            }
            if (isPatternVar$1789(patStx$1818)) {
                if (next$1822 && next$1822.token.value === ':' && !isPatternVar$1789(nextNext$1823)) {
                    if (typeof nextNext$1823 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1818.class = nextNext$1823.token.value;
                } else {
                    patStx$1818.class = 'token';
                }
            } else if (patStx$1818.token.type === parser$1777.Token.Delimiter) {
                if (last$1820 && last$1820.token.value === '$') {
                    patStx$1818.class = 'pattern_group';
                }
                patStx$1818.token.inner = loadPattern$1793(patStx$1818.token.inner);
            } else {
                patStx$1818.class = 'pattern_literal';
            }
            return acc$1817.concat(patStx$1818);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1824, patStx$1825, idx$1826, patterns$1827) {
            var separator$1828 = patStx$1825.separator || ' ';
            var repeat$1829 = patStx$1825.repeat || false;
            var next$1830 = patterns$1827[idx$1826 + 1];
            var nextNext$1831 = patterns$1827[idx$1826 + 2];
            if (next$1830 && next$1830.token.value === '...') {
                repeat$1829 = true;
                separator$1828 = ' ';
            } else if (delimIsSeparator$1788(next$1830) && nextNext$1831 && nextNext$1831.token.value === '...') {
                repeat$1829 = true;
                parser$1777.assert(next$1830.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1828 = next$1830.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1825.token.value === '...' || delimIsSeparator$1788(patStx$1825) && next$1830 && next$1830.token.value === '...') {
                return acc$1824;
            }
            patStx$1825.repeat = repeat$1829;
            patStx$1825.separator = separator$1828;
            return acc$1824.concat(patStx$1825);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1794(patternClass$1832, stx$1833, env$1834) {
        var result$1835, rest$1836;
        // pattern has no parse class
        if (patternClass$1832 === 'token' && stx$1833[0] && stx$1833[0].token.type !== parser$1777.Token.EOF) {
            result$1835 = [stx$1833[0]];
            rest$1836 = stx$1833.slice(1);
        } else if (patternClass$1832 === 'lit' && stx$1833[0] && typeIsLiteral$1786(stx$1833[0].token.type)) {
            result$1835 = [stx$1833[0]];
            rest$1836 = stx$1833.slice(1);
        } else if (patternClass$1832 === 'ident' && stx$1833[0] && stx$1833[0].token.type === parser$1777.Token.Identifier) {
            result$1835 = [stx$1833[0]];
            rest$1836 = stx$1833.slice(1);
        } else if (stx$1833.length > 0 && patternClass$1832 === 'VariableStatement') {
            var match$1837 = expander$1778.enforest(stx$1833, expander$1778.makeExpanderContext({ env: env$1834 }));
            if (match$1837.result && match$1837.result.hasPrototype(expander$1778.VariableStatement)) {
                result$1835 = match$1837.result.destruct(false);
                rest$1836 = match$1837.rest;
            } else {
                result$1835 = null;
                rest$1836 = stx$1833;
            }
        } else if (stx$1833.length > 0 && patternClass$1832 === 'expr') {
            var match$1837 = expander$1778.get_expression(stx$1833, expander$1778.makeExpanderContext({ env: env$1834 }));
            if (match$1837.result === null || !match$1837.result.hasPrototype(expander$1778.Expr)) {
                result$1835 = null;
                rest$1836 = stx$1833;
            } else {
                result$1835 = match$1837.result.destruct(false);
                rest$1836 = match$1837.rest;
            }
        } else {
            result$1835 = null;
            rest$1836 = stx$1833;
        }
        return {
            result: result$1835,
            rest: rest$1836
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1795(patterns$1838, stx$1839, env$1840, topLevel$1841) {
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
        topLevel$1841 = topLevel$1841 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1842 = [];
        var patternEnv$1843 = {};
        var match$1844;
        var pattern$1845;
        var rest$1846 = stx$1839;
        var success$1847 = true;
        patternLoop:
            for (var i$1848 = 0; i$1848 < patterns$1838.length; i$1848++) {
                if (success$1847 === false) {
                    break;
                }
                pattern$1845 = patterns$1838[i$1848];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1845.repeat && i$1848 + 1 < patterns$1838.length) {
                        var restMatch$1849 = matchPatterns$1795(patterns$1838.slice(i$1848 + 1), rest$1846, env$1840, topLevel$1841);
                        if (restMatch$1849.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1844 = matchPattern$1796(pattern$1845, [], env$1840, patternEnv$1843);
                            patternEnv$1843 = _$1775.extend(restMatch$1849.patternEnv, match$1844.patternEnv);
                            rest$1846 = restMatch$1849.rest;
                            break patternLoop;
                        }
                    }
                    match$1844 = matchPattern$1796(pattern$1845, rest$1846, env$1840, patternEnv$1843);
                    if (!match$1844.success && pattern$1845.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1844.success) {
                        success$1847 = false;
                        break;
                    }
                    rest$1846 = match$1844.rest;
                    patternEnv$1843 = match$1844.patternEnv;
                    if (success$1847 && !(topLevel$1841 || pattern$1845.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1848 == patterns$1838.length - 1 && rest$1846.length !== 0) {
                            success$1847 = false;
                            break;
                        }
                    }
                    if (pattern$1845.repeat && success$1847) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1845.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1846[0] && rest$1846[0].token.value === pattern$1845.separator) {
                            // more tokens and the next token matches the separator
                            rest$1846 = rest$1846.slice(1);
                        } else if (pattern$1845.separator !== ' ' && rest$1846.length > 0 && i$1848 === patterns$1838.length - 1 && topLevel$1841 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1847 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1845.repeat && success$1847 && rest$1846.length > 0);
            }
        return {
            success: success$1847,
            rest: rest$1846,
            patternEnv: patternEnv$1843
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
    function matchPattern$1796(pattern$1850, stx$1851, env$1852, patternEnv$1853) {
        var subMatch$1854;
        var match$1855, matchEnv$1856;
        var rest$1857;
        var success$1858;
        if (typeof pattern$1850.inner !== 'undefined') {
            if (pattern$1850.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1854 = matchPatterns$1795(pattern$1850.inner, stx$1851, env$1852, true);
                rest$1857 = subMatch$1854.rest;
            } else if (stx$1851[0] && stx$1851[0].token.type === parser$1777.Token.Delimiter && stx$1851[0].token.value === pattern$1850.value) {
                stx$1851[0].expose();
                if (pattern$1850.inner.length === 0 && stx$1851[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1851,
                        patternEnv: patternEnv$1853
                    };
                }
                subMatch$1854 = matchPatterns$1795(pattern$1850.inner, stx$1851[0].token.inner, env$1852, false);
                rest$1857 = stx$1851.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1851,
                    patternEnv: patternEnv$1853
                };
            }
            success$1858 = subMatch$1854.success;
            // merge the subpattern matches with the current pattern environment
            _$1775.keys(subMatch$1854.patternEnv).forEach(function (patternKey$1859) {
                if (pattern$1850.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1860 = subMatch$1854.patternEnv[patternKey$1859].level + 1;
                    if (patternEnv$1853[patternKey$1859]) {
                        patternEnv$1853[patternKey$1859].level = nextLevel$1860;
                        patternEnv$1853[patternKey$1859].match.push(subMatch$1854.patternEnv[patternKey$1859]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1853[patternKey$1859] = {
                            level: nextLevel$1860,
                            match: [subMatch$1854.patternEnv[patternKey$1859]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1853[patternKey$1859] = subMatch$1854.patternEnv[patternKey$1859];
                }
            });
        } else {
            if (pattern$1850.class === 'pattern_literal') {
                // wildcard
                if (stx$1851[0] && pattern$1850.value === '_') {
                    success$1858 = true;
                    rest$1857 = stx$1851.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1851[0] && pattern$1850.value === stx$1851[0].token.value) {
                    success$1858 = true;
                    rest$1857 = stx$1851.slice(1);
                } else {
                    success$1858 = false;
                    rest$1857 = stx$1851;
                }
            } else {
                match$1855 = matchPatternClass$1794(pattern$1850.class, stx$1851, env$1852);
                success$1858 = match$1855.result !== null;
                rest$1857 = match$1855.rest;
                matchEnv$1856 = {
                    level: 0,
                    match: match$1855.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1850.repeat) {
                    if (patternEnv$1853[pattern$1850.value]) {
                        patternEnv$1853[pattern$1850.value].match.push(matchEnv$1856);
                    } else {
                        // initialize if necessary
                        patternEnv$1853[pattern$1850.value] = {
                            level: 1,
                            match: [matchEnv$1856]
                        };
                    }
                } else {
                    patternEnv$1853[pattern$1850.value] = matchEnv$1856;
                }
            }
        }
        return {
            success: success$1858,
            rest: rest$1857,
            patternEnv: patternEnv$1853
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1797(macroBody$1861, macroNameStx$1862, env$1863) {
        return _$1775.chain(macroBody$1861).reduce(function (acc$1864, bodyStx$1865, idx$1866, original$1867) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1868 = original$1867[idx$1866 - 1];
            var next$1869 = original$1867[idx$1866 + 1];
            var nextNext$1870 = original$1867[idx$1866 + 2];
            // drop `...`
            if (bodyStx$1865.token.value === '...') {
                return acc$1864;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1788(bodyStx$1865) && next$1869 && next$1869.token.value === '...') {
                return acc$1864;
            }
            // skip the $ in $(...)
            if (bodyStx$1865.token.value === '$' && next$1869 && next$1869.token.type === parser$1777.Token.Delimiter && next$1869.token.value === '()') {
                return acc$1864;
            }
            // mark $[...] as a literal
            if (bodyStx$1865.token.value === '$' && next$1869 && next$1869.token.type === parser$1777.Token.Delimiter && next$1869.token.value === '[]') {
                next$1869.literal = true;
                return acc$1864;
            }
            if (bodyStx$1865.token.type === parser$1777.Token.Delimiter && bodyStx$1865.token.value === '()' && last$1868 && last$1868.token.value === '$') {
                bodyStx$1865.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1865.literal === true) {
                parser$1777.assert(bodyStx$1865.token.type === parser$1777.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1864.concat(bodyStx$1865.token.inner);
            }
            if (next$1869 && next$1869.token.value === '...') {
                bodyStx$1865.repeat = true;
                bodyStx$1865.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1788(next$1869) && nextNext$1870 && nextNext$1870.token.value === '...') {
                bodyStx$1865.repeat = true;
                bodyStx$1865.separator = next$1869.token.inner[0].token.value;
            }
            return acc$1864.concat(bodyStx$1865);
        }, []).reduce(function (acc$1871, bodyStx$1872, idx$1873) {
            // then do the actual transcription
            if (bodyStx$1872.repeat) {
                if (bodyStx$1872.token.type === parser$1777.Token.Delimiter) {
                    bodyStx$1872.expose();
                    var fv$1874 = _$1775.filter(freeVarsInPattern$1785(bodyStx$1872.token.inner), function (pat$1881) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1863.hasOwnProperty(pat$1881);
                        });
                    var restrictedEnv$1875 = [];
                    var nonScalar$1876 = _$1775.find(fv$1874, function (pat$1882) {
                            return env$1863[pat$1882].level > 0;
                        });
                    parser$1777.assert(typeof nonScalar$1876 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1877 = env$1863[nonScalar$1876].match.length;
                    var sameLength$1878 = _$1775.all(fv$1874, function (pat$1883) {
                            return env$1863[pat$1883].level === 0 || env$1863[pat$1883].match.length === repeatLength$1877;
                        });
                    parser$1777.assert(sameLength$1878, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1875 = _$1775.map(_$1775.range(repeatLength$1877), function (idx$1884) {
                        var renv$1885 = {};
                        _$1775.each(fv$1874, function (pat$1886) {
                            if (env$1863[pat$1886].level === 0) {
                                // copy scalars over
                                renv$1885[pat$1886] = env$1863[pat$1886];
                            } else {
                                // grab the match at this index
                                renv$1885[pat$1886] = env$1863[pat$1886].match[idx$1884];
                            }
                        });
                        return renv$1885;
                    });
                    var transcribed$1879 = _$1775.map(restrictedEnv$1875, function (renv$1887) {
                            if (bodyStx$1872.group) {
                                return transcribe$1797(bodyStx$1872.token.inner, macroNameStx$1862, renv$1887);
                            } else {
                                var newBody$1888 = syntaxFromToken$1781(_$1775.clone(bodyStx$1872.token), bodyStx$1872);
                                newBody$1888.token.inner = transcribe$1797(bodyStx$1872.token.inner, macroNameStx$1862, renv$1887);
                                return newBody$1888;
                            }
                        });
                    var joined$1880;
                    if (bodyStx$1872.group) {
                        joined$1880 = joinSyntaxArr$1784(transcribed$1879, bodyStx$1872.separator);
                    } else {
                        joined$1880 = joinSyntax$1783(transcribed$1879, bodyStx$1872.separator);
                    }
                    return acc$1871.concat(joined$1880);
                }
                if (!env$1863[bodyStx$1872.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1872.token.value + ' is not bound for the template');
                } else if (env$1863[bodyStx$1872.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1872.token.value + ' does not match in the template');
                }
                return acc$1871.concat(joinRepeatedMatch$1790(env$1863[bodyStx$1872.token.value].match, bodyStx$1872.separator));
            } else {
                if (bodyStx$1872.token.type === parser$1777.Token.Delimiter) {
                    bodyStx$1872.expose();
                    var newBody$1889 = syntaxFromToken$1781(_$1775.clone(bodyStx$1872.token), macroBody$1861);
                    newBody$1889.token.inner = transcribe$1797(bodyStx$1872.token.inner, macroNameStx$1862, env$1863);
                    return acc$1871.concat([newBody$1889]);
                }
                if (isPatternVar$1789(bodyStx$1872) && Object.prototype.hasOwnProperty.bind(env$1863)(bodyStx$1872.token.value)) {
                    if (!env$1863[bodyStx$1872.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1872.token.value + ' is not bound for the template');
                    } else if (env$1863[bodyStx$1872.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1872.token.value + ' does not match in the template');
                    }
                    return acc$1871.concat(takeLineContext$1791(bodyStx$1872, env$1863[bodyStx$1872.token.value].match));
                }
                return acc$1871.concat([bodyStx$1872]);
            }
        }, []).value();
    }
    exports$1774.loadPattern = loadPattern$1793;
    exports$1774.matchPatterns = matchPatterns$1795;
    exports$1774.transcribe = transcribe$1797;
    exports$1774.matchPatternClass = matchPatternClass$1794;
    exports$1774.takeLineContext = takeLineContext$1791;
    exports$1774.takeLine = takeLine$1792;
}));
//# sourceMappingURL=patterns.js.map