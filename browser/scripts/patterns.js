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
    function freeVarsInPattern$1785(pattern$1799) {
        var fv$1800 = [];
        _$1775.each(pattern$1799, function (pat$1801) {
            if (isPatternVar$1789(pat$1801)) {
                fv$1800.push(pat$1801.token.value);
            } else if (pat$1801.token.type === parser$1777.Token.Delimiter) {
                fv$1800 = fv$1800.concat(freeVarsInPattern$1785(pat$1801.token.inner));
            }
        });
        return fv$1800;
    }
    function typeIsLiteral$1786(type$1802) {
        return type$1802 === parser$1777.Token.NullLiteral || type$1802 === parser$1777.Token.NumericLiteral || type$1802 === parser$1777.Token.StringLiteral || type$1802 === parser$1777.Token.RegexLiteral || type$1802 === parser$1777.Token.BooleanLiteral;
    }
    function containsPatternVar$1787(patterns$1803) {
        return _$1775.any(patterns$1803, function (pat$1804) {
            if (pat$1804.token.type === parser$1777.Token.Delimiter) {
                return containsPatternVar$1787(pat$1804.token.inner);
            }
            return isPatternVar$1789(pat$1804);
        });
    }
    function delimIsSeparator$1788(delim$1805) {
        return delim$1805 && delim$1805.token && delim$1805.token.type === parser$1777.Token.Delimiter && delim$1805.token.value === '()' && delim$1805.token.inner.length === 1 && delim$1805.token.inner[0].token.type !== parser$1777.Token.Delimiter && !containsPatternVar$1787(delim$1805.token.inner);
    }
    function isPatternVar$1789(stx$1806) {
        return stx$1806.token.value[0] === '$' && stx$1806.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1790(tojoin$1807, punc$1808) {
        return _$1775.reduce(_$1775.rest(tojoin$1807, 1), function (acc$1809, join$1810) {
            if (punc$1808 === ' ') {
                return acc$1809.concat(join$1810.match);
            }
            return acc$1809.concat(makePunc$1782(punc$1808, _$1775.first(join$1810.match)), join$1810.match);
        }, _$1775.first(tojoin$1807).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1791(from$1811, to$1812) {
        return _$1775.map(to$1812, function (stx$1813) {
            return takeLine$1792(from$1811, stx$1813);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1792(from$1814, to$1815) {
        if (to$1815.token.type === parser$1777.Token.Delimiter) {
            var next$1816;
            if (from$1814.token.type === parser$1777.Token.Delimiter) {
                next$1816 = syntaxFromToken$1781({
                    type: parser$1777.Token.Delimiter,
                    value: to$1815.token.value,
                    inner: takeLineContext$1791(from$1814, to$1815.token.inner),
                    startRange: from$1814.token.startRange,
                    endRange: from$1814.token.endRange,
                    startLineNumber: from$1814.token.startLineNumber,
                    startLineStart: from$1814.token.startLineStart,
                    endLineNumber: from$1814.token.endLineNumber,
                    endLineStart: from$1814.token.endLineStart,
                    sm_startLineNumber: to$1815.token.startLineNumber,
                    sm_endLineNumber: to$1815.token.endLineNumber,
                    sm_startLineStart: to$1815.token.startLineStart,
                    sm_endLineStart: to$1815.token.endLineStart,
                    sm_startRange: to$1815.token.startRange,
                    sm_endRange: to$1815.token.endRange
                }, to$1815);
            } else {
                next$1816 = syntaxFromToken$1781({
                    type: parser$1777.Token.Delimiter,
                    value: to$1815.token.value,
                    inner: takeLineContext$1791(from$1814, to$1815.token.inner),
                    startRange: from$1814.token.range,
                    endRange: from$1814.token.range,
                    startLineNumber: from$1814.token.lineNumber,
                    startLineStart: from$1814.token.lineStart,
                    endLineNumber: from$1814.token.lineNumber,
                    endLineStart: from$1814.token.lineStart,
                    sm_startLineNumber: to$1815.token.startLineNumber,
                    sm_endLineNumber: to$1815.token.endLineNumber,
                    sm_startLineStart: to$1815.token.startLineStart,
                    sm_endLineStart: to$1815.token.endLineStart,
                    sm_startRange: to$1815.token.startRange,
                    sm_endRange: to$1815.token.endRange
                }, to$1815);
            }
        } else {
            if (from$1814.token.type === parser$1777.Token.Delimiter) {
                next$1816 = syntaxFromToken$1781({
                    value: to$1815.token.value,
                    type: to$1815.token.type,
                    lineNumber: from$1814.token.startLineNumber,
                    lineStart: from$1814.token.startLineStart,
                    range: from$1814.token.startRange,
                    sm_lineNumber: to$1815.token.lineNumber,
                    sm_lineStart: to$1815.token.lineStart,
                    sm_range: to$1815.token.range
                }, to$1815);
            } else {
                next$1816 = syntaxFromToken$1781({
                    value: to$1815.token.value,
                    type: to$1815.token.type,
                    lineNumber: from$1814.token.lineNumber,
                    lineStart: from$1814.token.lineStart,
                    range: from$1814.token.range,
                    sm_lineNumber: to$1815.token.lineNumber,
                    sm_lineStart: to$1815.token.lineStart,
                    sm_range: to$1815.token.range
                }, to$1815);
            }
        }
        if (to$1815.token.leadingComments) {
            next$1816.token.leadingComments = to$1815.token.leadingComments;
        }
        if (to$1815.token.trailingComments) {
            next$1816.token.trailingComments = to$1815.token.trailingComments;
        }
        return next$1816;
    }
    function loadLiteralGroup$1793(patterns$1817) {
        _$1775.forEach(patterns$1817, function (patStx$1818) {
            if (patStx$1818.token.type === parser$1777.Token.Delimiter) {
                patStx$1818.token.inner = loadLiteralGroup$1793(patStx$1818.token.inner);
            } else {
                patStx$1818.class = 'pattern_literal';
            }
        });
        return patterns$1817;
    }
    function loadPattern$1794(patterns$1819) {
        return _$1775.chain(patterns$1819).reduce(function (acc$1820, patStx$1821, idx$1822) {
            var last$1823 = patterns$1819[idx$1822 - 1];
            var lastLast$1824 = patterns$1819[idx$1822 - 2];
            var next$1825 = patterns$1819[idx$1822 + 1];
            var nextNext$1826 = patterns$1819[idx$1822 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1821.token.value === ':') {
                if (last$1823 && isPatternVar$1789(last$1823) && !isPatternVar$1789(next$1825)) {
                    return acc$1820;
                }
            }
            if (last$1823 && last$1823.token.value === ':') {
                if (lastLast$1824 && isPatternVar$1789(lastLast$1824) && !isPatternVar$1789(patStx$1821)) {
                    return acc$1820;
                }
            }
            // skip over $
            if (patStx$1821.token.value === '$' && next$1825 && next$1825.token.type === parser$1777.Token.Delimiter) {
                return acc$1820;
            }
            if (isPatternVar$1789(patStx$1821)) {
                if (next$1825 && next$1825.token.value === ':' && !isPatternVar$1789(nextNext$1826)) {
                    if (typeof nextNext$1826 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1821.class = nextNext$1826.token.value;
                } else {
                    patStx$1821.class = 'token';
                }
            } else if (patStx$1821.token.type === parser$1777.Token.Delimiter) {
                if (last$1823 && last$1823.token.value === '$') {
                    patStx$1821.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1821.class === 'pattern_group' && patStx$1821.token.value === '[]') {
                    patStx$1821.token.inner = loadLiteralGroup$1793(patStx$1821.token.inner);
                } else {
                    patStx$1821.token.inner = loadPattern$1794(patStx$1821.token.inner);
                }
            } else {
                patStx$1821.class = 'pattern_literal';
            }
            return acc$1820.concat(patStx$1821);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1827, patStx$1828, idx$1829, patterns$1830) {
            var separator$1831 = patStx$1828.separator || ' ';
            var repeat$1832 = patStx$1828.repeat || false;
            var next$1833 = patterns$1830[idx$1829 + 1];
            var nextNext$1834 = patterns$1830[idx$1829 + 2];
            if (next$1833 && next$1833.token.value === '...') {
                repeat$1832 = true;
                separator$1831 = ' ';
            } else if (delimIsSeparator$1788(next$1833) && nextNext$1834 && nextNext$1834.token.value === '...') {
                repeat$1832 = true;
                parser$1777.assert(next$1833.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1831 = next$1833.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1828.token.value === '...' || delimIsSeparator$1788(patStx$1828) && next$1833 && next$1833.token.value === '...') {
                return acc$1827;
            }
            patStx$1828.repeat = repeat$1832;
            patStx$1828.separator = separator$1831;
            return acc$1827.concat(patStx$1828);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1795(patternClass$1835, stx$1836, env$1837) {
        var result$1838, rest$1839;
        // pattern has no parse class
        if (patternClass$1835 === 'token' && stx$1836[0] && stx$1836[0].token.type !== parser$1777.Token.EOF) {
            result$1838 = [stx$1836[0]];
            rest$1839 = stx$1836.slice(1);
        } else if (patternClass$1835 === 'lit' && stx$1836[0] && typeIsLiteral$1786(stx$1836[0].token.type)) {
            result$1838 = [stx$1836[0]];
            rest$1839 = stx$1836.slice(1);
        } else if (patternClass$1835 === 'ident' && stx$1836[0] && stx$1836[0].token.type === parser$1777.Token.Identifier) {
            result$1838 = [stx$1836[0]];
            rest$1839 = stx$1836.slice(1);
        } else if (stx$1836.length > 0 && patternClass$1835 === 'VariableStatement') {
            var match$1840 = expander$1778.enforest(stx$1836, expander$1778.makeExpanderContext({ env: env$1837 }));
            if (match$1840.result && match$1840.result.hasPrototype(expander$1778.VariableStatement)) {
                result$1838 = match$1840.result.destruct(false);
                rest$1839 = match$1840.rest;
            } else {
                result$1838 = null;
                rest$1839 = stx$1836;
            }
        } else if (stx$1836.length > 0 && patternClass$1835 === 'expr') {
            var match$1840 = expander$1778.get_expression(stx$1836, expander$1778.makeExpanderContext({ env: env$1837 }));
            if (match$1840.result === null || !match$1840.result.hasPrototype(expander$1778.Expr)) {
                result$1838 = null;
                rest$1839 = stx$1836;
            } else {
                result$1838 = match$1840.result.destruct(false);
                rest$1839 = match$1840.rest;
            }
        } else {
            result$1838 = null;
            rest$1839 = stx$1836;
        }
        return {
            result: result$1838,
            rest: rest$1839
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1796(patterns$1841, stx$1842, env$1843, topLevel$1844) {
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
        topLevel$1844 = topLevel$1844 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1845 = [];
        var patternEnv$1846 = {};
        var match$1847;
        var pattern$1848;
        var rest$1849 = stx$1842;
        var success$1850 = true;
        patternLoop:
            for (var i$1851 = 0; i$1851 < patterns$1841.length; i$1851++) {
                if (success$1850 === false) {
                    break;
                }
                pattern$1848 = patterns$1841[i$1851];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1848.repeat && i$1851 + 1 < patterns$1841.length) {
                        var restMatch$1852 = matchPatterns$1796(patterns$1841.slice(i$1851 + 1), rest$1849, env$1843, topLevel$1844);
                        if (restMatch$1852.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1847 = matchPattern$1797(pattern$1848, [], env$1843, patternEnv$1846);
                            patternEnv$1846 = _$1775.extend(restMatch$1852.patternEnv, match$1847.patternEnv);
                            rest$1849 = restMatch$1852.rest;
                            break patternLoop;
                        }
                    }
                    match$1847 = matchPattern$1797(pattern$1848, rest$1849, env$1843, patternEnv$1846);
                    if (!match$1847.success && pattern$1848.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1847.success) {
                        success$1850 = false;
                        break;
                    }
                    rest$1849 = match$1847.rest;
                    patternEnv$1846 = match$1847.patternEnv;
                    if (success$1850 && !(topLevel$1844 || pattern$1848.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1851 == patterns$1841.length - 1 && rest$1849.length !== 0) {
                            success$1850 = false;
                            break;
                        }
                    }
                    if (pattern$1848.repeat && success$1850) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1848.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1849[0] && rest$1849[0].token.value === pattern$1848.separator) {
                            // more tokens and the next token matches the separator
                            rest$1849 = rest$1849.slice(1);
                        } else if (pattern$1848.separator !== ' ' && rest$1849.length > 0 && i$1851 === patterns$1841.length - 1 && topLevel$1844 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1850 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1848.repeat && success$1850 && rest$1849.length > 0);
            }
        return {
            success: success$1850,
            rest: rest$1849,
            patternEnv: patternEnv$1846
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
    function matchPattern$1797(pattern$1853, stx$1854, env$1855, patternEnv$1856) {
        var subMatch$1857;
        var match$1858, matchEnv$1859;
        var rest$1860;
        var success$1861;
        if (typeof pattern$1853.inner !== 'undefined') {
            if (pattern$1853.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1857 = matchPatterns$1796(pattern$1853.inner, stx$1854, env$1855, true);
                rest$1860 = subMatch$1857.rest;
            } else if (stx$1854[0] && stx$1854[0].token.type === parser$1777.Token.Delimiter && stx$1854[0].token.value === pattern$1853.value) {
                stx$1854[0].expose();
                if (pattern$1853.inner.length === 0 && stx$1854[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1854,
                        patternEnv: patternEnv$1856
                    };
                }
                subMatch$1857 = matchPatterns$1796(pattern$1853.inner, stx$1854[0].token.inner, env$1855, false);
                rest$1860 = stx$1854.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1854,
                    patternEnv: patternEnv$1856
                };
            }
            success$1861 = subMatch$1857.success;
            // merge the subpattern matches with the current pattern environment
            _$1775.keys(subMatch$1857.patternEnv).forEach(function (patternKey$1862) {
                if (pattern$1853.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1863 = subMatch$1857.patternEnv[patternKey$1862].level + 1;
                    if (patternEnv$1856[patternKey$1862]) {
                        patternEnv$1856[patternKey$1862].level = nextLevel$1863;
                        patternEnv$1856[patternKey$1862].match.push(subMatch$1857.patternEnv[patternKey$1862]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1856[patternKey$1862] = {
                            level: nextLevel$1863,
                            match: [subMatch$1857.patternEnv[patternKey$1862]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1856[patternKey$1862] = subMatch$1857.patternEnv[patternKey$1862];
                }
            });
        } else {
            if (pattern$1853.class === 'pattern_literal') {
                // wildcard
                if (stx$1854[0] && pattern$1853.value === '_') {
                    success$1861 = true;
                    rest$1860 = stx$1854.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1854[0] && pattern$1853.value === stx$1854[0].token.value) {
                    success$1861 = true;
                    rest$1860 = stx$1854.slice(1);
                } else {
                    success$1861 = false;
                    rest$1860 = stx$1854;
                }
            } else {
                match$1858 = matchPatternClass$1795(pattern$1853.class, stx$1854, env$1855);
                success$1861 = match$1858.result !== null;
                rest$1860 = match$1858.rest;
                matchEnv$1859 = {
                    level: 0,
                    match: match$1858.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1853.repeat) {
                    if (patternEnv$1856[pattern$1853.value]) {
                        patternEnv$1856[pattern$1853.value].match.push(matchEnv$1859);
                    } else {
                        // initialize if necessary
                        patternEnv$1856[pattern$1853.value] = {
                            level: 1,
                            match: [matchEnv$1859]
                        };
                    }
                } else {
                    patternEnv$1856[pattern$1853.value] = matchEnv$1859;
                }
            }
        }
        return {
            success: success$1861,
            rest: rest$1860,
            patternEnv: patternEnv$1856
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1798(macroBody$1864, macroNameStx$1865, env$1866) {
        return _$1775.chain(macroBody$1864).reduce(function (acc$1867, bodyStx$1868, idx$1869, original$1870) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1871 = original$1870[idx$1869 - 1];
            var next$1872 = original$1870[idx$1869 + 1];
            var nextNext$1873 = original$1870[idx$1869 + 2];
            // drop `...`
            if (bodyStx$1868.token.value === '...') {
                return acc$1867;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1788(bodyStx$1868) && next$1872 && next$1872.token.value === '...') {
                return acc$1867;
            }
            // skip the $ in $(...)
            if (bodyStx$1868.token.value === '$' && next$1872 && next$1872.token.type === parser$1777.Token.Delimiter && next$1872.token.value === '()') {
                return acc$1867;
            }
            // mark $[...] as a literal
            if (bodyStx$1868.token.value === '$' && next$1872 && next$1872.token.type === parser$1777.Token.Delimiter && next$1872.token.value === '[]') {
                next$1872.literal = true;
                return acc$1867;
            }
            if (bodyStx$1868.token.type === parser$1777.Token.Delimiter && bodyStx$1868.token.value === '()' && last$1871 && last$1871.token.value === '$') {
                bodyStx$1868.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1868.literal === true) {
                parser$1777.assert(bodyStx$1868.token.type === parser$1777.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1867.concat(bodyStx$1868.token.inner);
            }
            if (next$1872 && next$1872.token.value === '...') {
                bodyStx$1868.repeat = true;
                bodyStx$1868.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1788(next$1872) && nextNext$1873 && nextNext$1873.token.value === '...') {
                bodyStx$1868.repeat = true;
                bodyStx$1868.separator = next$1872.token.inner[0].token.value;
            }
            return acc$1867.concat(bodyStx$1868);
        }, []).reduce(function (acc$1874, bodyStx$1875, idx$1876) {
            // then do the actual transcription
            if (bodyStx$1875.repeat) {
                if (bodyStx$1875.token.type === parser$1777.Token.Delimiter) {
                    bodyStx$1875.expose();
                    var fv$1877 = _$1775.filter(freeVarsInPattern$1785(bodyStx$1875.token.inner), function (pat$1884) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1866.hasOwnProperty(pat$1884);
                        });
                    var restrictedEnv$1878 = [];
                    var nonScalar$1879 = _$1775.find(fv$1877, function (pat$1885) {
                            return env$1866[pat$1885].level > 0;
                        });
                    parser$1777.assert(typeof nonScalar$1879 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1880 = env$1866[nonScalar$1879].match.length;
                    var sameLength$1881 = _$1775.all(fv$1877, function (pat$1886) {
                            return env$1866[pat$1886].level === 0 || env$1866[pat$1886].match.length === repeatLength$1880;
                        });
                    parser$1777.assert(sameLength$1881, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1878 = _$1775.map(_$1775.range(repeatLength$1880), function (idx$1887) {
                        var renv$1888 = {};
                        _$1775.each(fv$1877, function (pat$1889) {
                            if (env$1866[pat$1889].level === 0) {
                                // copy scalars over
                                renv$1888[pat$1889] = env$1866[pat$1889];
                            } else {
                                // grab the match at this index
                                renv$1888[pat$1889] = env$1866[pat$1889].match[idx$1887];
                            }
                        });
                        return renv$1888;
                    });
                    var transcribed$1882 = _$1775.map(restrictedEnv$1878, function (renv$1890) {
                            if (bodyStx$1875.group) {
                                return transcribe$1798(bodyStx$1875.token.inner, macroNameStx$1865, renv$1890);
                            } else {
                                var newBody$1891 = syntaxFromToken$1781(_$1775.clone(bodyStx$1875.token), bodyStx$1875);
                                newBody$1891.token.inner = transcribe$1798(bodyStx$1875.token.inner, macroNameStx$1865, renv$1890);
                                return newBody$1891;
                            }
                        });
                    var joined$1883;
                    if (bodyStx$1875.group) {
                        joined$1883 = joinSyntaxArr$1784(transcribed$1882, bodyStx$1875.separator);
                    } else {
                        joined$1883 = joinSyntax$1783(transcribed$1882, bodyStx$1875.separator);
                    }
                    return acc$1874.concat(joined$1883);
                }
                if (!env$1866[bodyStx$1875.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1875.token.value + ' is not bound for the template');
                } else if (env$1866[bodyStx$1875.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1875.token.value + ' does not match in the template');
                }
                return acc$1874.concat(joinRepeatedMatch$1790(env$1866[bodyStx$1875.token.value].match, bodyStx$1875.separator));
            } else {
                if (bodyStx$1875.token.type === parser$1777.Token.Delimiter) {
                    bodyStx$1875.expose();
                    var newBody$1892 = syntaxFromToken$1781(_$1775.clone(bodyStx$1875.token), macroBody$1864);
                    newBody$1892.token.inner = transcribe$1798(bodyStx$1875.token.inner, macroNameStx$1865, env$1866);
                    return acc$1874.concat([newBody$1892]);
                }
                if (isPatternVar$1789(bodyStx$1875) && Object.prototype.hasOwnProperty.bind(env$1866)(bodyStx$1875.token.value)) {
                    if (!env$1866[bodyStx$1875.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1875.token.value + ' is not bound for the template');
                    } else if (env$1866[bodyStx$1875.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1875.token.value + ' does not match in the template');
                    }
                    return acc$1874.concat(takeLineContext$1791(bodyStx$1875, env$1866[bodyStx$1875.token.value].match));
                }
                return acc$1874.concat([bodyStx$1875]);
            }
        }, []).value();
    }
    exports$1774.loadPattern = loadPattern$1794;
    exports$1774.matchPatterns = matchPatterns$1796;
    exports$1774.transcribe = transcribe$1798;
    exports$1774.matchPatternClass = matchPatternClass$1795;
    exports$1774.takeLineContext = takeLineContext$1791;
    exports$1774.takeLine = takeLine$1792;
}));
//# sourceMappingURL=patterns.js.map