(function (root$1780, factory$1781) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1781(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1781);
    }
}(this, function (exports$1782, _$1783, es6$1784, parser$1785, expander$1786, syntax$1787) {
    var get_expression$1788 = expander$1786.get_expression;
    var syntaxFromToken$1789 = syntax$1787.syntaxFromToken;
    var makePunc$1790 = syntax$1787.makePunc;
    var joinSyntax$1791 = syntax$1787.joinSyntax;
    var joinSyntaxArr$1792 = syntax$1787.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1793(pattern$1808) {
        var fv$1809 = [];
        _$1783.each(pattern$1808, function (pat$1810) {
            if (isPatternVar$1797(pat$1810)) {
                fv$1809.push(pat$1810.token.value);
            } else if (pat$1810.token.type === parser$1785.Token.Delimiter) {
                fv$1809 = fv$1809.concat(freeVarsInPattern$1793(pat$1810.token.inner));
            }
        });
        return fv$1809;
    }
    function typeIsLiteral$1794(type$1811) {
        return type$1811 === parser$1785.Token.NullLiteral || type$1811 === parser$1785.Token.NumericLiteral || type$1811 === parser$1785.Token.StringLiteral || type$1811 === parser$1785.Token.RegexLiteral || type$1811 === parser$1785.Token.BooleanLiteral;
    }
    function containsPatternVar$1795(patterns$1812) {
        return _$1783.any(patterns$1812, function (pat$1813) {
            if (pat$1813.token.type === parser$1785.Token.Delimiter) {
                return containsPatternVar$1795(pat$1813.token.inner);
            }
            return isPatternVar$1797(pat$1813);
        });
    }
    function delimIsSeparator$1796(delim$1814) {
        return delim$1814 && delim$1814.token && delim$1814.token.type === parser$1785.Token.Delimiter && delim$1814.token.value === '()' && delim$1814.token.inner.length === 1 && delim$1814.token.inner[0].token.type !== parser$1785.Token.Delimiter && !containsPatternVar$1795(delim$1814.token.inner);
    }
    function isPatternVar$1797(stx$1815) {
        return stx$1815.token.value[0] === '$' && stx$1815.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1798(tojoin$1816, punc$1817) {
        return _$1783.reduce(_$1783.rest(tojoin$1816, 1), function (acc$1818, join$1819) {
            if (punc$1817 === ' ') {
                return acc$1818.concat(join$1819.match);
            }
            return acc$1818.concat(makePunc$1790(punc$1817, _$1783.first(join$1819.match)), join$1819.match);
        }, _$1783.first(tojoin$1816).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1799(from$1820, to$1821) {
        return _$1783.map(to$1821, function (stx$1822) {
            return takeLine$1800(from$1820, stx$1822);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1800(from$1823, to$1824) {
        if (to$1824.token.type === parser$1785.Token.Delimiter) {
            var next$1825;
            if (from$1823.token.type === parser$1785.Token.Delimiter) {
                next$1825 = syntaxFromToken$1789({
                    type: parser$1785.Token.Delimiter,
                    value: to$1824.token.value,
                    inner: takeLineContext$1799(from$1823, to$1824.token.inner),
                    startRange: from$1823.token.startRange,
                    endRange: from$1823.token.endRange,
                    startLineNumber: from$1823.token.startLineNumber,
                    startLineStart: from$1823.token.startLineStart,
                    endLineNumber: from$1823.token.endLineNumber,
                    endLineStart: from$1823.token.endLineStart,
                    sm_startLineNumber: to$1824.token.startLineNumber,
                    sm_endLineNumber: to$1824.token.endLineNumber,
                    sm_startLineStart: to$1824.token.startLineStart,
                    sm_endLineStart: to$1824.token.endLineStart,
                    sm_startRange: to$1824.token.startRange,
                    sm_endRange: to$1824.token.endRange
                }, to$1824);
            } else {
                next$1825 = syntaxFromToken$1789({
                    type: parser$1785.Token.Delimiter,
                    value: to$1824.token.value,
                    inner: takeLineContext$1799(from$1823, to$1824.token.inner),
                    startRange: from$1823.token.range,
                    endRange: from$1823.token.range,
                    startLineNumber: from$1823.token.lineNumber,
                    startLineStart: from$1823.token.lineStart,
                    endLineNumber: from$1823.token.lineNumber,
                    endLineStart: from$1823.token.lineStart,
                    sm_startLineNumber: to$1824.token.startLineNumber,
                    sm_endLineNumber: to$1824.token.endLineNumber,
                    sm_startLineStart: to$1824.token.startLineStart,
                    sm_endLineStart: to$1824.token.endLineStart,
                    sm_startRange: to$1824.token.startRange,
                    sm_endRange: to$1824.token.endRange
                }, to$1824);
            }
        } else {
            if (from$1823.token.type === parser$1785.Token.Delimiter) {
                next$1825 = syntaxFromToken$1789({
                    value: to$1824.token.value,
                    type: to$1824.token.type,
                    lineNumber: from$1823.token.startLineNumber,
                    lineStart: from$1823.token.startLineStart,
                    range: from$1823.token.startRange,
                    sm_lineNumber: to$1824.token.lineNumber,
                    sm_lineStart: to$1824.token.lineStart,
                    sm_range: to$1824.token.range
                }, to$1824);
            } else {
                next$1825 = syntaxFromToken$1789({
                    value: to$1824.token.value,
                    type: to$1824.token.type,
                    lineNumber: from$1823.token.lineNumber,
                    lineStart: from$1823.token.lineStart,
                    range: from$1823.token.range,
                    sm_lineNumber: to$1824.token.lineNumber,
                    sm_lineStart: to$1824.token.lineStart,
                    sm_range: to$1824.token.range
                }, to$1824);
            }
        }
        if (to$1824.token.leadingComments) {
            next$1825.token.leadingComments = to$1824.token.leadingComments;
        }
        if (to$1824.token.trailingComments) {
            next$1825.token.trailingComments = to$1824.token.trailingComments;
        }
        return next$1825;
    }
    function loadLiteralGroup$1801(patterns$1826) {
        _$1783.forEach(patterns$1826, function (patStx$1827) {
            if (patStx$1827.token.type === parser$1785.Token.Delimiter) {
                patStx$1827.token.inner = loadLiteralGroup$1801(patStx$1827.token.inner);
            } else {
                patStx$1827.class = 'pattern_literal';
            }
        });
        return patterns$1826;
    }
    function loadPattern$1802(patterns$1828) {
        return _$1783.chain(patterns$1828).reduce(function (acc$1829, patStx$1830, idx$1831) {
            var last$1832 = patterns$1828[idx$1831 - 1];
            var lastLast$1833 = patterns$1828[idx$1831 - 2];
            var next$1834 = patterns$1828[idx$1831 + 1];
            var nextNext$1835 = patterns$1828[idx$1831 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1830.token.value === ':') {
                if (last$1832 && isPatternVar$1797(last$1832) && !isPatternVar$1797(next$1834)) {
                    return acc$1829;
                }
            }
            if (last$1832 && last$1832.token.value === ':') {
                if (lastLast$1833 && isPatternVar$1797(lastLast$1833) && !isPatternVar$1797(patStx$1830)) {
                    return acc$1829;
                }
            }
            // skip over $
            if (patStx$1830.token.value === '$' && next$1834 && next$1834.token.type === parser$1785.Token.Delimiter) {
                return acc$1829;
            }
            if (isPatternVar$1797(patStx$1830)) {
                if (next$1834 && next$1834.token.value === ':' && !isPatternVar$1797(nextNext$1835)) {
                    if (typeof nextNext$1835 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1830.class = nextNext$1835.token.value;
                } else {
                    patStx$1830.class = 'token';
                }
            } else if (patStx$1830.token.type === parser$1785.Token.Delimiter) {
                if (last$1832 && last$1832.token.value === '$') {
                    patStx$1830.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1830.class === 'pattern_group' && patStx$1830.token.value === '[]') {
                    patStx$1830.token.inner = loadLiteralGroup$1801(patStx$1830.token.inner);
                } else {
                    patStx$1830.token.inner = loadPattern$1802(patStx$1830.token.inner);
                }
            } else {
                patStx$1830.class = 'pattern_literal';
            }
            return acc$1829.concat(patStx$1830);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1836, patStx$1837, idx$1838, patterns$1839) {
            var separator$1840 = patStx$1837.separator || ' ';
            var repeat$1841 = patStx$1837.repeat || false;
            var next$1842 = patterns$1839[idx$1838 + 1];
            var nextNext$1843 = patterns$1839[idx$1838 + 2];
            if (next$1842 && next$1842.token.value === '...') {
                repeat$1841 = true;
                separator$1840 = ' ';
            } else if (delimIsSeparator$1796(next$1842) && nextNext$1843 && nextNext$1843.token.value === '...') {
                repeat$1841 = true;
                parser$1785.assert(next$1842.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1840 = next$1842.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1837.token.value === '...' || delimIsSeparator$1796(patStx$1837) && next$1842 && next$1842.token.value === '...') {
                return acc$1836;
            }
            patStx$1837.repeat = repeat$1841;
            patStx$1837.separator = separator$1840;
            return acc$1836.concat(patStx$1837);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1803(patternClass$1844, stx$1845, env$1846) {
        var result$1847, rest$1848;
        // pattern has no parse class
        if (patternClass$1844 === 'token' && stx$1845[0] && stx$1845[0].token.type !== parser$1785.Token.EOF) {
            result$1847 = [stx$1845[0]];
            rest$1848 = stx$1845.slice(1);
        } else if (patternClass$1844 === 'lit' && stx$1845[0] && typeIsLiteral$1794(stx$1845[0].token.type)) {
            result$1847 = [stx$1845[0]];
            rest$1848 = stx$1845.slice(1);
        } else if (patternClass$1844 === 'ident' && stx$1845[0] && stx$1845[0].token.type === parser$1785.Token.Identifier) {
            result$1847 = [stx$1845[0]];
            rest$1848 = stx$1845.slice(1);
        } else if (stx$1845.length > 0 && patternClass$1844 === 'VariableStatement') {
            var match$1849 = expander$1786.enforest(stx$1845, expander$1786.makeExpanderContext({ env: env$1846 }));
            if (match$1849.result && match$1849.result.hasPrototype(expander$1786.VariableStatement)) {
                result$1847 = match$1849.result.destruct(false);
                rest$1848 = match$1849.rest;
            } else {
                result$1847 = null;
                rest$1848 = stx$1845;
            }
        } else if (stx$1845.length > 0 && patternClass$1844 === 'expr') {
            var match$1849 = expander$1786.get_expression(stx$1845, expander$1786.makeExpanderContext({ env: env$1846 }));
            if (match$1849.result === null || !match$1849.result.hasPrototype(expander$1786.Expr)) {
                result$1847 = null;
                rest$1848 = stx$1845;
            } else {
                result$1847 = match$1849.result.destruct(false);
                rest$1848 = match$1849.rest;
            }
        } else {
            result$1847 = null;
            rest$1848 = stx$1845;
        }
        return {
            result: result$1847,
            rest: rest$1848
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1804(patterns$1850, stx$1851, env$1852, topLevel$1853) {
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
        topLevel$1853 = topLevel$1853 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1854 = [];
        var patternEnv$1855 = {};
        var match$1856;
        var pattern$1857;
        var rest$1858 = stx$1851;
        var success$1859 = true;
        patternLoop:
            for (var i$1860 = 0; i$1860 < patterns$1850.length; i$1860++) {
                if (success$1859 === false) {
                    break;
                }
                pattern$1857 = patterns$1850[i$1860];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1857.repeat && i$1860 + 1 < patterns$1850.length) {
                        var restMatch$1861 = matchPatterns$1804(patterns$1850.slice(i$1860 + 1), rest$1858, env$1852, topLevel$1853);
                        if (restMatch$1861.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1856 = matchPattern$1805(pattern$1857, [], env$1852, patternEnv$1855);
                            patternEnv$1855 = _$1783.extend(restMatch$1861.patternEnv, match$1856.patternEnv);
                            rest$1858 = restMatch$1861.rest;
                            break patternLoop;
                        }
                    }
                    match$1856 = matchPattern$1805(pattern$1857, rest$1858, env$1852, patternEnv$1855);
                    if (!match$1856.success && pattern$1857.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1856.success) {
                        success$1859 = false;
                        break;
                    }
                    rest$1858 = match$1856.rest;
                    patternEnv$1855 = match$1856.patternEnv;
                    if (success$1859 && !(topLevel$1853 || pattern$1857.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1860 == patterns$1850.length - 1 && rest$1858.length !== 0) {
                            success$1859 = false;
                            break;
                        }
                    }
                    if (pattern$1857.repeat && success$1859) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1857.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1858[0] && rest$1858[0].token.value === pattern$1857.separator) {
                            // more tokens and the next token matches the separator
                            rest$1858 = rest$1858.slice(1);
                        } else if (pattern$1857.separator !== ' ' && rest$1858.length > 0 && i$1860 === patterns$1850.length - 1 && topLevel$1853 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1859 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1857.repeat && success$1859 && rest$1858.length > 0);
            }
        return {
            success: success$1859,
            rest: rest$1858,
            patternEnv: patternEnv$1855
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
    function matchPattern$1805(pattern$1862, stx$1863, env$1864, patternEnv$1865) {
        var subMatch$1866;
        var match$1867, matchEnv$1868;
        var rest$1869;
        var success$1870;
        if (typeof pattern$1862.inner !== 'undefined') {
            if (pattern$1862.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1866 = matchPatterns$1804(pattern$1862.inner, stx$1863, env$1864, true);
                rest$1869 = subMatch$1866.rest;
            } else if (stx$1863[0] && stx$1863[0].token.type === parser$1785.Token.Delimiter && stx$1863[0].token.value === pattern$1862.value) {
                stx$1863[0].expose();
                if (pattern$1862.inner.length === 0 && stx$1863[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1863,
                        patternEnv: patternEnv$1865
                    };
                }
                subMatch$1866 = matchPatterns$1804(pattern$1862.inner, stx$1863[0].token.inner, env$1864, false);
                rest$1869 = stx$1863.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1863,
                    patternEnv: patternEnv$1865
                };
            }
            success$1870 = subMatch$1866.success;
            // merge the subpattern matches with the current pattern environment
            _$1783.keys(subMatch$1866.patternEnv).forEach(function (patternKey$1871) {
                if (pattern$1862.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1872 = subMatch$1866.patternEnv[patternKey$1871].level + 1;
                    if (patternEnv$1865[patternKey$1871]) {
                        patternEnv$1865[patternKey$1871].level = nextLevel$1872;
                        patternEnv$1865[patternKey$1871].match.push(subMatch$1866.patternEnv[patternKey$1871]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1865[patternKey$1871] = {
                            level: nextLevel$1872,
                            match: [subMatch$1866.patternEnv[patternKey$1871]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1865[patternKey$1871] = subMatch$1866.patternEnv[patternKey$1871];
                }
            });
        } else {
            if (pattern$1862.class === 'pattern_literal') {
                // wildcard
                if (stx$1863[0] && pattern$1862.value === '_') {
                    success$1870 = true;
                    rest$1869 = stx$1863.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1863[0] && pattern$1862.value === stx$1863[0].token.value) {
                    success$1870 = true;
                    rest$1869 = stx$1863.slice(1);
                } else {
                    success$1870 = false;
                    rest$1869 = stx$1863;
                }
            } else {
                match$1867 = matchPatternClass$1803(pattern$1862.class, stx$1863, env$1864);
                success$1870 = match$1867.result !== null;
                rest$1869 = match$1867.rest;
                matchEnv$1868 = {
                    level: 0,
                    match: match$1867.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1862.repeat) {
                    if (patternEnv$1865[pattern$1862.value] && success$1870) {
                        patternEnv$1865[pattern$1862.value].match.push(matchEnv$1868);
                    } else if (patternEnv$1865[pattern$1862.value] == undefined) {
                        // initialize if necessary
                        patternEnv$1865[pattern$1862.value] = {
                            level: 1,
                            match: [matchEnv$1868]
                        };
                    }
                } else {
                    patternEnv$1865[pattern$1862.value] = matchEnv$1868;
                }
            }
        }
        return {
            success: success$1870,
            rest: rest$1869,
            patternEnv: patternEnv$1865
        };
    }
    function hasMatch$1806(m$1873) {
        if (m$1873.level === 0) {
            return m$1873.match.length > 0;
        }
        return m$1873.match.every(function (m$1874) {
            return hasMatch$1806(m$1874);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1807(macroBody$1875, macroNameStx$1876, env$1877) {
        return _$1783.chain(macroBody$1875).reduce(function (acc$1878, bodyStx$1879, idx$1880, original$1881) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1882 = original$1881[idx$1880 - 1];
            var next$1883 = original$1881[idx$1880 + 1];
            var nextNext$1884 = original$1881[idx$1880 + 2];
            // drop `...`
            if (bodyStx$1879.token.value === '...') {
                return acc$1878;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1796(bodyStx$1879) && next$1883 && next$1883.token.value === '...') {
                return acc$1878;
            }
            // skip the $ in $(...)
            if (bodyStx$1879.token.value === '$' && next$1883 && next$1883.token.type === parser$1785.Token.Delimiter && next$1883.token.value === '()') {
                return acc$1878;
            }
            // mark $[...] as a literal
            if (bodyStx$1879.token.value === '$' && next$1883 && next$1883.token.type === parser$1785.Token.Delimiter && next$1883.token.value === '[]') {
                next$1883.literal = true;
                return acc$1878;
            }
            if (bodyStx$1879.token.type === parser$1785.Token.Delimiter && bodyStx$1879.token.value === '()' && last$1882 && last$1882.token.value === '$') {
                bodyStx$1879.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1879.literal === true) {
                parser$1785.assert(bodyStx$1879.token.type === parser$1785.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1878.concat(bodyStx$1879.token.inner);
            }
            if (next$1883 && next$1883.token.value === '...') {
                bodyStx$1879.repeat = true;
                bodyStx$1879.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1796(next$1883) && nextNext$1884 && nextNext$1884.token.value === '...') {
                bodyStx$1879.repeat = true;
                bodyStx$1879.separator = next$1883.token.inner[0].token.value;
            }
            return acc$1878.concat(bodyStx$1879);
        }, []).reduce(function (acc$1885, bodyStx$1886, idx$1887) {
            // then do the actual transcription
            if (bodyStx$1886.repeat) {
                if (bodyStx$1886.token.type === parser$1785.Token.Delimiter) {
                    bodyStx$1886.expose();
                    var fv$1888 = _$1783.filter(freeVarsInPattern$1793(bodyStx$1886.token.inner), function (pat$1895) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1877.hasOwnProperty(pat$1895);
                        });
                    var restrictedEnv$1889 = [];
                    var nonScalar$1890 = _$1783.find(fv$1888, function (pat$1896) {
                            return env$1877[pat$1896].level > 0;
                        });
                    parser$1785.assert(typeof nonScalar$1890 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1891 = env$1877[nonScalar$1890].match.length;
                    var sameLength$1892 = _$1783.all(fv$1888, function (pat$1897) {
                            return env$1877[pat$1897].level === 0 || env$1877[pat$1897].match.length === repeatLength$1891;
                        });
                    parser$1785.assert(sameLength$1892, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1783.each(_$1783.range(repeatLength$1891), function (idx$1898) {
                        var renv$1899 = {};
                        _$1783.each(fv$1888, function (pat$1901) {
                            if (env$1877[pat$1901].level === 0) {
                                // copy scalars over
                                renv$1899[pat$1901] = env$1877[pat$1901];
                            } else {
                                // grab the match at this index 
                                renv$1899[pat$1901] = env$1877[pat$1901].match[idx$1898];
                            }
                        });
                        var allHaveMatch$1900 = Object.keys(renv$1899).every(function (pat$1902) {
                                return hasMatch$1806(renv$1899[pat$1902]);
                            });
                        if (allHaveMatch$1900) {
                            restrictedEnv$1889.push(renv$1899);
                        }
                    });
                    var transcribed$1893 = _$1783.map(restrictedEnv$1889, function (renv$1903) {
                            if (bodyStx$1886.group) {
                                return transcribe$1807(bodyStx$1886.token.inner, macroNameStx$1876, renv$1903);
                            } else {
                                var newBody$1904 = syntaxFromToken$1789(_$1783.clone(bodyStx$1886.token), bodyStx$1886);
                                newBody$1904.token.inner = transcribe$1807(bodyStx$1886.token.inner, macroNameStx$1876, renv$1903);
                                return newBody$1904;
                            }
                        });
                    var joined$1894;
                    if (bodyStx$1886.group) {
                        joined$1894 = joinSyntaxArr$1792(transcribed$1893, bodyStx$1886.separator);
                    } else {
                        joined$1894 = joinSyntax$1791(transcribed$1893, bodyStx$1886.separator);
                    }
                    return acc$1885.concat(joined$1894);
                }
                if (!env$1877[bodyStx$1886.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1886.token.value + ' is not bound for the template');
                } else if (env$1877[bodyStx$1886.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1886.token.value + ' does not match in the template');
                }
                return acc$1885.concat(joinRepeatedMatch$1798(env$1877[bodyStx$1886.token.value].match, bodyStx$1886.separator));
            } else {
                if (bodyStx$1886.token.type === parser$1785.Token.Delimiter) {
                    bodyStx$1886.expose();
                    var newBody$1905 = syntaxFromToken$1789(_$1783.clone(bodyStx$1886.token), macroBody$1875);
                    newBody$1905.token.inner = transcribe$1807(bodyStx$1886.token.inner, macroNameStx$1876, env$1877);
                    return acc$1885.concat([newBody$1905]);
                }
                if (isPatternVar$1797(bodyStx$1886) && Object.prototype.hasOwnProperty.bind(env$1877)(bodyStx$1886.token.value)) {
                    if (!env$1877[bodyStx$1886.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1886.token.value + ' is not bound for the template');
                    } else if (env$1877[bodyStx$1886.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1886.token.value + ' does not match in the template');
                    }
                    return acc$1885.concat(takeLineContext$1799(bodyStx$1886, env$1877[bodyStx$1886.token.value].match));
                }
                return acc$1885.concat([bodyStx$1886]);
            }
        }, []).value();
    }
    exports$1782.loadPattern = loadPattern$1802;
    exports$1782.matchPatterns = matchPatterns$1804;
    exports$1782.transcribe = transcribe$1807;
    exports$1782.matchPatternClass = matchPatternClass$1803;
    exports$1782.takeLineContext = takeLineContext$1799;
    exports$1782.takeLine = takeLine$1800;
}));
//# sourceMappingURL=patterns.js.map