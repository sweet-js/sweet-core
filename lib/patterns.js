(function (root$1777, factory$1778) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1778(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1778);
    }
}(this, function (exports$1779, _$1780, es6$1781, parser$1782, expander$1783, syntax$1784) {
    var get_expression$1785 = expander$1783.get_expression;
    var syntaxFromToken$1786 = syntax$1784.syntaxFromToken;
    var makePunc$1787 = syntax$1784.makePunc;
    var joinSyntax$1788 = syntax$1784.joinSyntax;
    var joinSyntaxArr$1789 = syntax$1784.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1790(pattern$1804) {
        var fv$1805 = [];
        _$1780.each(pattern$1804, function (pat$1806) {
            if (isPatternVar$1794(pat$1806)) {
                fv$1805.push(pat$1806.token.value);
            } else if (pat$1806.token.type === parser$1782.Token.Delimiter) {
                fv$1805 = fv$1805.concat(freeVarsInPattern$1790(pat$1806.token.inner));
            }
        });
        return fv$1805;
    }
    function typeIsLiteral$1791(type$1807) {
        return type$1807 === parser$1782.Token.NullLiteral || type$1807 === parser$1782.Token.NumericLiteral || type$1807 === parser$1782.Token.StringLiteral || type$1807 === parser$1782.Token.RegexLiteral || type$1807 === parser$1782.Token.BooleanLiteral;
    }
    function containsPatternVar$1792(patterns$1808) {
        return _$1780.any(patterns$1808, function (pat$1809) {
            if (pat$1809.token.type === parser$1782.Token.Delimiter) {
                return containsPatternVar$1792(pat$1809.token.inner);
            }
            return isPatternVar$1794(pat$1809);
        });
    }
    function delimIsSeparator$1793(delim$1810) {
        return delim$1810 && delim$1810.token && delim$1810.token.type === parser$1782.Token.Delimiter && delim$1810.token.value === '()' && delim$1810.token.inner.length === 1 && delim$1810.token.inner[0].token.type !== parser$1782.Token.Delimiter && !containsPatternVar$1792(delim$1810.token.inner);
    }
    function isPatternVar$1794(stx$1811) {
        return stx$1811.token.value[0] === '$' && stx$1811.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1795(tojoin$1812, punc$1813) {
        return _$1780.reduce(_$1780.rest(tojoin$1812, 1), function (acc$1814, join$1815) {
            if (punc$1813 === ' ') {
                return acc$1814.concat(join$1815.match);
            }
            return acc$1814.concat(makePunc$1787(punc$1813, _$1780.first(join$1815.match)), join$1815.match);
        }, _$1780.first(tojoin$1812).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1796(from$1816, to$1817) {
        return _$1780.map(to$1817, function (stx$1818) {
            return takeLine$1797(from$1816, stx$1818);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1797(from$1819, to$1820) {
        if (to$1820.token.type === parser$1782.Token.Delimiter) {
            var next$1821;
            if (from$1819.token.type === parser$1782.Token.Delimiter) {
                next$1821 = syntaxFromToken$1786({
                    type: parser$1782.Token.Delimiter,
                    value: to$1820.token.value,
                    inner: takeLineContext$1796(from$1819, to$1820.token.inner),
                    startRange: from$1819.token.startRange,
                    endRange: from$1819.token.endRange,
                    startLineNumber: from$1819.token.startLineNumber,
                    startLineStart: from$1819.token.startLineStart,
                    endLineNumber: from$1819.token.endLineNumber,
                    endLineStart: from$1819.token.endLineStart,
                    sm_startLineNumber: to$1820.token.startLineNumber,
                    sm_endLineNumber: to$1820.token.endLineNumber,
                    sm_startLineStart: to$1820.token.startLineStart,
                    sm_endLineStart: to$1820.token.endLineStart,
                    sm_startRange: to$1820.token.startRange,
                    sm_endRange: to$1820.token.endRange
                }, to$1820);
            } else {
                next$1821 = syntaxFromToken$1786({
                    type: parser$1782.Token.Delimiter,
                    value: to$1820.token.value,
                    inner: takeLineContext$1796(from$1819, to$1820.token.inner),
                    startRange: from$1819.token.range,
                    endRange: from$1819.token.range,
                    startLineNumber: from$1819.token.lineNumber,
                    startLineStart: from$1819.token.lineStart,
                    endLineNumber: from$1819.token.lineNumber,
                    endLineStart: from$1819.token.lineStart,
                    sm_startLineNumber: to$1820.token.startLineNumber,
                    sm_endLineNumber: to$1820.token.endLineNumber,
                    sm_startLineStart: to$1820.token.startLineStart,
                    sm_endLineStart: to$1820.token.endLineStart,
                    sm_startRange: to$1820.token.startRange,
                    sm_endRange: to$1820.token.endRange
                }, to$1820);
            }
        } else {
            if (from$1819.token.type === parser$1782.Token.Delimiter) {
                next$1821 = syntaxFromToken$1786({
                    value: to$1820.token.value,
                    type: to$1820.token.type,
                    lineNumber: from$1819.token.startLineNumber,
                    lineStart: from$1819.token.startLineStart,
                    range: from$1819.token.startRange,
                    sm_lineNumber: to$1820.token.lineNumber,
                    sm_lineStart: to$1820.token.lineStart,
                    sm_range: to$1820.token.range
                }, to$1820);
            } else {
                next$1821 = syntaxFromToken$1786({
                    value: to$1820.token.value,
                    type: to$1820.token.type,
                    lineNumber: from$1819.token.lineNumber,
                    lineStart: from$1819.token.lineStart,
                    range: from$1819.token.range,
                    sm_lineNumber: to$1820.token.lineNumber,
                    sm_lineStart: to$1820.token.lineStart,
                    sm_range: to$1820.token.range
                }, to$1820);
            }
        }
        if (to$1820.token.leadingComments) {
            next$1821.token.leadingComments = to$1820.token.leadingComments;
        }
        if (to$1820.token.trailingComments) {
            next$1821.token.trailingComments = to$1820.token.trailingComments;
        }
        return next$1821;
    }
    function loadLiteralGroup$1798(patterns$1822) {
        _$1780.forEach(patterns$1822, function (patStx$1823) {
            if (patStx$1823.token.type === parser$1782.Token.Delimiter) {
                patStx$1823.token.inner = loadLiteralGroup$1798(patStx$1823.token.inner);
            } else {
                patStx$1823.class = 'pattern_literal';
            }
        });
        return patterns$1822;
    }
    function loadPattern$1799(patterns$1824) {
        return _$1780.chain(patterns$1824).reduce(function (acc$1825, patStx$1826, idx$1827) {
            var last$1828 = patterns$1824[idx$1827 - 1];
            var lastLast$1829 = patterns$1824[idx$1827 - 2];
            var next$1830 = patterns$1824[idx$1827 + 1];
            var nextNext$1831 = patterns$1824[idx$1827 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1826.token.value === ':') {
                if (last$1828 && isPatternVar$1794(last$1828) && !isPatternVar$1794(next$1830)) {
                    return acc$1825;
                }
            }
            if (last$1828 && last$1828.token.value === ':') {
                if (lastLast$1829 && isPatternVar$1794(lastLast$1829) && !isPatternVar$1794(patStx$1826)) {
                    return acc$1825;
                }
            }
            // skip over $
            if (patStx$1826.token.value === '$' && next$1830 && next$1830.token.type === parser$1782.Token.Delimiter) {
                return acc$1825;
            }
            if (isPatternVar$1794(patStx$1826)) {
                if (next$1830 && next$1830.token.value === ':' && !isPatternVar$1794(nextNext$1831)) {
                    if (typeof nextNext$1831 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1826.class = nextNext$1831.token.value;
                } else {
                    patStx$1826.class = 'token';
                }
            } else if (patStx$1826.token.type === parser$1782.Token.Delimiter) {
                if (last$1828 && last$1828.token.value === '$') {
                    patStx$1826.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1826.class === 'pattern_group' && patStx$1826.token.value === '[]') {
                    patStx$1826.token.inner = loadLiteralGroup$1798(patStx$1826.token.inner);
                } else {
                    patStx$1826.token.inner = loadPattern$1799(patStx$1826.token.inner);
                }
            } else {
                patStx$1826.class = 'pattern_literal';
            }
            return acc$1825.concat(patStx$1826);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1832, patStx$1833, idx$1834, patterns$1835) {
            var separator$1836 = patStx$1833.separator || ' ';
            var repeat$1837 = patStx$1833.repeat || false;
            var next$1838 = patterns$1835[idx$1834 + 1];
            var nextNext$1839 = patterns$1835[idx$1834 + 2];
            if (next$1838 && next$1838.token.value === '...') {
                repeat$1837 = true;
                separator$1836 = ' ';
            } else if (delimIsSeparator$1793(next$1838) && nextNext$1839 && nextNext$1839.token.value === '...') {
                repeat$1837 = true;
                parser$1782.assert(next$1838.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1836 = next$1838.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1833.token.value === '...' || delimIsSeparator$1793(patStx$1833) && next$1838 && next$1838.token.value === '...') {
                return acc$1832;
            }
            patStx$1833.repeat = repeat$1837;
            patStx$1833.separator = separator$1836;
            return acc$1832.concat(patStx$1833);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1800(patternClass$1840, stx$1841, env$1842) {
        var result$1843, rest$1844;
        // pattern has no parse class
        if (patternClass$1840 === 'token' && stx$1841[0] && stx$1841[0].token.type !== parser$1782.Token.EOF) {
            result$1843 = [stx$1841[0]];
            rest$1844 = stx$1841.slice(1);
        } else if (patternClass$1840 === 'lit' && stx$1841[0] && typeIsLiteral$1791(stx$1841[0].token.type)) {
            result$1843 = [stx$1841[0]];
            rest$1844 = stx$1841.slice(1);
        } else if (patternClass$1840 === 'ident' && stx$1841[0] && stx$1841[0].token.type === parser$1782.Token.Identifier) {
            result$1843 = [stx$1841[0]];
            rest$1844 = stx$1841.slice(1);
        } else if (stx$1841.length > 0 && patternClass$1840 === 'VariableStatement') {
            var match$1845 = expander$1783.enforest(stx$1841, expander$1783.makeExpanderContext({ env: env$1842 }));
            if (match$1845.result && match$1845.result.hasPrototype(expander$1783.VariableStatement)) {
                result$1843 = match$1845.result.destruct(false);
                rest$1844 = match$1845.rest;
            } else {
                result$1843 = null;
                rest$1844 = stx$1841;
            }
        } else if (stx$1841.length > 0 && patternClass$1840 === 'expr') {
            var match$1845 = expander$1783.get_expression(stx$1841, expander$1783.makeExpanderContext({ env: env$1842 }));
            if (match$1845.result === null || !match$1845.result.hasPrototype(expander$1783.Expr)) {
                result$1843 = null;
                rest$1844 = stx$1841;
            } else {
                result$1843 = match$1845.result.destruct(false);
                rest$1844 = match$1845.rest;
            }
        } else {
            result$1843 = null;
            rest$1844 = stx$1841;
        }
        return {
            result: result$1843,
            rest: rest$1844
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1801(patterns$1846, stx$1847, env$1848, topLevel$1849) {
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
        topLevel$1849 = topLevel$1849 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1850 = [];
        var patternEnv$1851 = {};
        var match$1852;
        var pattern$1853;
        var rest$1854 = stx$1847;
        var success$1855 = true;
        patternLoop:
            for (var i$1856 = 0; i$1856 < patterns$1846.length; i$1856++) {
                if (success$1855 === false) {
                    break;
                }
                pattern$1853 = patterns$1846[i$1856];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1853.repeat && i$1856 + 1 < patterns$1846.length) {
                        var restMatch$1857 = matchPatterns$1801(patterns$1846.slice(i$1856 + 1), rest$1854, env$1848, topLevel$1849);
                        if (restMatch$1857.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1852 = matchPattern$1802(pattern$1853, [], env$1848, patternEnv$1851);
                            patternEnv$1851 = _$1780.extend(restMatch$1857.patternEnv, match$1852.patternEnv);
                            rest$1854 = restMatch$1857.rest;
                            break patternLoop;
                        }
                    }
                    match$1852 = matchPattern$1802(pattern$1853, rest$1854, env$1848, patternEnv$1851);
                    if (!match$1852.success && pattern$1853.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1852.success) {
                        success$1855 = false;
                        break;
                    }
                    rest$1854 = match$1852.rest;
                    patternEnv$1851 = match$1852.patternEnv;
                    if (success$1855 && !(topLevel$1849 || pattern$1853.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1856 == patterns$1846.length - 1 && rest$1854.length !== 0) {
                            success$1855 = false;
                            break;
                        }
                    }
                    if (pattern$1853.repeat && success$1855) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1853.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1854[0] && rest$1854[0].token.value === pattern$1853.separator) {
                            // more tokens and the next token matches the separator
                            rest$1854 = rest$1854.slice(1);
                        } else if (pattern$1853.separator !== ' ' && rest$1854.length > 0 && i$1856 === patterns$1846.length - 1 && topLevel$1849 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1855 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1853.repeat && success$1855 && rest$1854.length > 0);
            }
        return {
            success: success$1855,
            rest: rest$1854,
            patternEnv: patternEnv$1851
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
    function matchPattern$1802(pattern$1858, stx$1859, env$1860, patternEnv$1861) {
        var subMatch$1862;
        var match$1863, matchEnv$1864;
        var rest$1865;
        var success$1866;
        if (typeof pattern$1858.inner !== 'undefined') {
            if (pattern$1858.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1862 = matchPatterns$1801(pattern$1858.inner, stx$1859, env$1860, true);
                rest$1865 = subMatch$1862.rest;
            } else if (stx$1859[0] && stx$1859[0].token.type === parser$1782.Token.Delimiter && stx$1859[0].token.value === pattern$1858.value) {
                stx$1859[0].expose();
                if (pattern$1858.inner.length === 0 && stx$1859[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1859,
                        patternEnv: patternEnv$1861
                    };
                }
                subMatch$1862 = matchPatterns$1801(pattern$1858.inner, stx$1859[0].token.inner, env$1860, false);
                rest$1865 = stx$1859.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1859,
                    patternEnv: patternEnv$1861
                };
            }
            success$1866 = subMatch$1862.success;
            // merge the subpattern matches with the current pattern environment
            _$1780.keys(subMatch$1862.patternEnv).forEach(function (patternKey$1867) {
                if (pattern$1858.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1868 = subMatch$1862.patternEnv[patternKey$1867].level + 1;
                    if (patternEnv$1861[patternKey$1867]) {
                        patternEnv$1861[patternKey$1867].level = nextLevel$1868;
                        patternEnv$1861[patternKey$1867].match.push(subMatch$1862.patternEnv[patternKey$1867]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1861[patternKey$1867] = {
                            level: nextLevel$1868,
                            match: [subMatch$1862.patternEnv[patternKey$1867]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1861[patternKey$1867] = subMatch$1862.patternEnv[patternKey$1867];
                }
            });
        } else {
            if (pattern$1858.class === 'pattern_literal') {
                // wildcard
                if (stx$1859[0] && pattern$1858.value === '_') {
                    success$1866 = true;
                    rest$1865 = stx$1859.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1859[0] && pattern$1858.value === stx$1859[0].token.value) {
                    success$1866 = true;
                    rest$1865 = stx$1859.slice(1);
                } else {
                    success$1866 = false;
                    rest$1865 = stx$1859;
                }
            } else {
                match$1863 = matchPatternClass$1800(pattern$1858.class, stx$1859, env$1860);
                success$1866 = match$1863.result !== null;
                rest$1865 = match$1863.rest;
                matchEnv$1864 = {
                    level: 0,
                    match: match$1863.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1858.repeat) {
                    if (patternEnv$1861[pattern$1858.value]) {
                        patternEnv$1861[pattern$1858.value].match.push(matchEnv$1864);
                    } else {
                        // initialize if necessary
                        patternEnv$1861[pattern$1858.value] = {
                            level: 1,
                            match: [matchEnv$1864]
                        };
                    }
                } else {
                    patternEnv$1861[pattern$1858.value] = matchEnv$1864;
                }
            }
        }
        return {
            success: success$1866,
            rest: rest$1865,
            patternEnv: patternEnv$1861
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1803(macroBody$1869, macroNameStx$1870, env$1871) {
        return _$1780.chain(macroBody$1869).reduce(function (acc$1872, bodyStx$1873, idx$1874, original$1875) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1876 = original$1875[idx$1874 - 1];
            var next$1877 = original$1875[idx$1874 + 1];
            var nextNext$1878 = original$1875[idx$1874 + 2];
            // drop `...`
            if (bodyStx$1873.token.value === '...') {
                return acc$1872;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1793(bodyStx$1873) && next$1877 && next$1877.token.value === '...') {
                return acc$1872;
            }
            // skip the $ in $(...)
            if (bodyStx$1873.token.value === '$' && next$1877 && next$1877.token.type === parser$1782.Token.Delimiter && next$1877.token.value === '()') {
                return acc$1872;
            }
            // mark $[...] as a literal
            if (bodyStx$1873.token.value === '$' && next$1877 && next$1877.token.type === parser$1782.Token.Delimiter && next$1877.token.value === '[]') {
                next$1877.literal = true;
                return acc$1872;
            }
            if (bodyStx$1873.token.type === parser$1782.Token.Delimiter && bodyStx$1873.token.value === '()' && last$1876 && last$1876.token.value === '$') {
                bodyStx$1873.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1873.literal === true) {
                parser$1782.assert(bodyStx$1873.token.type === parser$1782.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1872.concat(bodyStx$1873.token.inner);
            }
            if (next$1877 && next$1877.token.value === '...') {
                bodyStx$1873.repeat = true;
                bodyStx$1873.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1793(next$1877) && nextNext$1878 && nextNext$1878.token.value === '...') {
                bodyStx$1873.repeat = true;
                bodyStx$1873.separator = next$1877.token.inner[0].token.value;
            }
            return acc$1872.concat(bodyStx$1873);
        }, []).reduce(function (acc$1879, bodyStx$1880, idx$1881) {
            // then do the actual transcription
            if (bodyStx$1880.repeat) {
                if (bodyStx$1880.token.type === parser$1782.Token.Delimiter) {
                    bodyStx$1880.expose();
                    var fv$1882 = _$1780.filter(freeVarsInPattern$1790(bodyStx$1880.token.inner), function (pat$1889) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1871.hasOwnProperty(pat$1889);
                        });
                    var restrictedEnv$1883 = [];
                    var nonScalar$1884 = _$1780.find(fv$1882, function (pat$1890) {
                            return env$1871[pat$1890].level > 0;
                        });
                    parser$1782.assert(typeof nonScalar$1884 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1885 = env$1871[nonScalar$1884].match.length;
                    var sameLength$1886 = _$1780.all(fv$1882, function (pat$1891) {
                            return env$1871[pat$1891].level === 0 || env$1871[pat$1891].match.length === repeatLength$1885;
                        });
                    parser$1782.assert(sameLength$1886, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1883 = _$1780.map(_$1780.range(repeatLength$1885), function (idx$1892) {
                        var renv$1893 = {};
                        _$1780.each(fv$1882, function (pat$1894) {
                            if (env$1871[pat$1894].level === 0) {
                                // copy scalars over
                                renv$1893[pat$1894] = env$1871[pat$1894];
                            } else {
                                // grab the match at this index
                                renv$1893[pat$1894] = env$1871[pat$1894].match[idx$1892];
                            }
                        });
                        return renv$1893;
                    });
                    var transcribed$1887 = _$1780.map(restrictedEnv$1883, function (renv$1895) {
                            if (bodyStx$1880.group) {
                                return transcribe$1803(bodyStx$1880.token.inner, macroNameStx$1870, renv$1895);
                            } else {
                                var newBody$1896 = syntaxFromToken$1786(_$1780.clone(bodyStx$1880.token), bodyStx$1880);
                                newBody$1896.token.inner = transcribe$1803(bodyStx$1880.token.inner, macroNameStx$1870, renv$1895);
                                return newBody$1896;
                            }
                        });
                    var joined$1888;
                    if (bodyStx$1880.group) {
                        joined$1888 = joinSyntaxArr$1789(transcribed$1887, bodyStx$1880.separator);
                    } else {
                        joined$1888 = joinSyntax$1788(transcribed$1887, bodyStx$1880.separator);
                    }
                    return acc$1879.concat(joined$1888);
                }
                if (!env$1871[bodyStx$1880.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1880.token.value + ' is not bound for the template');
                } else if (env$1871[bodyStx$1880.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1880.token.value + ' does not match in the template');
                }
                return acc$1879.concat(joinRepeatedMatch$1795(env$1871[bodyStx$1880.token.value].match, bodyStx$1880.separator));
            } else {
                if (bodyStx$1880.token.type === parser$1782.Token.Delimiter) {
                    bodyStx$1880.expose();
                    var newBody$1897 = syntaxFromToken$1786(_$1780.clone(bodyStx$1880.token), macroBody$1869);
                    newBody$1897.token.inner = transcribe$1803(bodyStx$1880.token.inner, macroNameStx$1870, env$1871);
                    return acc$1879.concat([newBody$1897]);
                }
                if (isPatternVar$1794(bodyStx$1880) && Object.prototype.hasOwnProperty.bind(env$1871)(bodyStx$1880.token.value)) {
                    if (!env$1871[bodyStx$1880.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1880.token.value + ' is not bound for the template');
                    } else if (env$1871[bodyStx$1880.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1880.token.value + ' does not match in the template');
                    }
                    return acc$1879.concat(takeLineContext$1796(bodyStx$1880, env$1871[bodyStx$1880.token.value].match));
                }
                return acc$1879.concat([bodyStx$1880]);
            }
        }, []).value();
    }
    exports$1779.loadPattern = loadPattern$1799;
    exports$1779.matchPatterns = matchPatterns$1801;
    exports$1779.transcribe = transcribe$1803;
    exports$1779.matchPatternClass = matchPatternClass$1800;
    exports$1779.takeLineContext = takeLineContext$1796;
    exports$1779.takeLine = takeLine$1797;
}));
//# sourceMappingURL=patterns.js.map