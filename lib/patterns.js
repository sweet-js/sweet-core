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
    function freeVarsInPattern$1793(pattern$1807) {
        var fv$1808 = [];
        _$1783.each(pattern$1807, function (pat$1809) {
            if (isPatternVar$1797(pat$1809)) {
                fv$1808.push(pat$1809.token.value);
            } else if (pat$1809.token.type === parser$1785.Token.Delimiter) {
                fv$1808 = fv$1808.concat(freeVarsInPattern$1793(pat$1809.token.inner));
            }
        });
        return fv$1808;
    }
    function typeIsLiteral$1794(type$1810) {
        return type$1810 === parser$1785.Token.NullLiteral || type$1810 === parser$1785.Token.NumericLiteral || type$1810 === parser$1785.Token.StringLiteral || type$1810 === parser$1785.Token.RegexLiteral || type$1810 === parser$1785.Token.BooleanLiteral;
    }
    function containsPatternVar$1795(patterns$1811) {
        return _$1783.any(patterns$1811, function (pat$1812) {
            if (pat$1812.token.type === parser$1785.Token.Delimiter) {
                return containsPatternVar$1795(pat$1812.token.inner);
            }
            return isPatternVar$1797(pat$1812);
        });
    }
    function delimIsSeparator$1796(delim$1813) {
        return delim$1813 && delim$1813.token && delim$1813.token.type === parser$1785.Token.Delimiter && delim$1813.token.value === '()' && delim$1813.token.inner.length === 1 && delim$1813.token.inner[0].token.type !== parser$1785.Token.Delimiter && !containsPatternVar$1795(delim$1813.token.inner);
    }
    function isPatternVar$1797(stx$1814) {
        return stx$1814.token.value[0] === '$' && stx$1814.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1798(tojoin$1815, punc$1816) {
        return _$1783.reduce(_$1783.rest(tojoin$1815, 1), function (acc$1817, join$1818) {
            if (punc$1816 === ' ') {
                return acc$1817.concat(join$1818.match);
            }
            return acc$1817.concat(makePunc$1790(punc$1816, _$1783.first(join$1818.match)), join$1818.match);
        }, _$1783.first(tojoin$1815).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1799(from$1819, to$1820) {
        return _$1783.map(to$1820, function (stx$1821) {
            return takeLine$1800(from$1819, stx$1821);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1800(from$1822, to$1823) {
        if (to$1823.token.type === parser$1785.Token.Delimiter) {
            var next$1824;
            if (from$1822.token.type === parser$1785.Token.Delimiter) {
                next$1824 = syntaxFromToken$1789({
                    type: parser$1785.Token.Delimiter,
                    value: to$1823.token.value,
                    inner: takeLineContext$1799(from$1822, to$1823.token.inner),
                    startRange: from$1822.token.startRange,
                    endRange: from$1822.token.endRange,
                    startLineNumber: from$1822.token.startLineNumber,
                    startLineStart: from$1822.token.startLineStart,
                    endLineNumber: from$1822.token.endLineNumber,
                    endLineStart: from$1822.token.endLineStart,
                    sm_startLineNumber: to$1823.token.startLineNumber,
                    sm_endLineNumber: to$1823.token.endLineNumber,
                    sm_startLineStart: to$1823.token.startLineStart,
                    sm_endLineStart: to$1823.token.endLineStart,
                    sm_startRange: to$1823.token.startRange,
                    sm_endRange: to$1823.token.endRange
                }, to$1823);
            } else {
                next$1824 = syntaxFromToken$1789({
                    type: parser$1785.Token.Delimiter,
                    value: to$1823.token.value,
                    inner: takeLineContext$1799(from$1822, to$1823.token.inner),
                    startRange: from$1822.token.range,
                    endRange: from$1822.token.range,
                    startLineNumber: from$1822.token.lineNumber,
                    startLineStart: from$1822.token.lineStart,
                    endLineNumber: from$1822.token.lineNumber,
                    endLineStart: from$1822.token.lineStart,
                    sm_startLineNumber: to$1823.token.startLineNumber,
                    sm_endLineNumber: to$1823.token.endLineNumber,
                    sm_startLineStart: to$1823.token.startLineStart,
                    sm_endLineStart: to$1823.token.endLineStart,
                    sm_startRange: to$1823.token.startRange,
                    sm_endRange: to$1823.token.endRange
                }, to$1823);
            }
        } else {
            if (from$1822.token.type === parser$1785.Token.Delimiter) {
                next$1824 = syntaxFromToken$1789({
                    value: to$1823.token.value,
                    type: to$1823.token.type,
                    lineNumber: from$1822.token.startLineNumber,
                    lineStart: from$1822.token.startLineStart,
                    range: from$1822.token.startRange,
                    sm_lineNumber: to$1823.token.lineNumber,
                    sm_lineStart: to$1823.token.lineStart,
                    sm_range: to$1823.token.range
                }, to$1823);
            } else {
                next$1824 = syntaxFromToken$1789({
                    value: to$1823.token.value,
                    type: to$1823.token.type,
                    lineNumber: from$1822.token.lineNumber,
                    lineStart: from$1822.token.lineStart,
                    range: from$1822.token.range,
                    sm_lineNumber: to$1823.token.lineNumber,
                    sm_lineStart: to$1823.token.lineStart,
                    sm_range: to$1823.token.range
                }, to$1823);
            }
        }
        if (to$1823.token.leadingComments) {
            next$1824.token.leadingComments = to$1823.token.leadingComments;
        }
        if (to$1823.token.trailingComments) {
            next$1824.token.trailingComments = to$1823.token.trailingComments;
        }
        return next$1824;
    }
    function loadLiteralGroup$1801(patterns$1825) {
        _$1783.forEach(patterns$1825, function (patStx$1826) {
            if (patStx$1826.token.type === parser$1785.Token.Delimiter) {
                patStx$1826.token.inner = loadLiteralGroup$1801(patStx$1826.token.inner);
            } else {
                patStx$1826.class = 'pattern_literal';
            }
        });
        return patterns$1825;
    }
    function loadPattern$1802(patterns$1827) {
        return _$1783.chain(patterns$1827).reduce(function (acc$1828, patStx$1829, idx$1830) {
            var last$1831 = patterns$1827[idx$1830 - 1];
            var lastLast$1832 = patterns$1827[idx$1830 - 2];
            var next$1833 = patterns$1827[idx$1830 + 1];
            var nextNext$1834 = patterns$1827[idx$1830 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1829.token.value === ':') {
                if (last$1831 && isPatternVar$1797(last$1831) && !isPatternVar$1797(next$1833)) {
                    return acc$1828;
                }
            }
            if (last$1831 && last$1831.token.value === ':') {
                if (lastLast$1832 && isPatternVar$1797(lastLast$1832) && !isPatternVar$1797(patStx$1829)) {
                    return acc$1828;
                }
            }
            // skip over $
            if (patStx$1829.token.value === '$' && next$1833 && next$1833.token.type === parser$1785.Token.Delimiter) {
                return acc$1828;
            }
            if (isPatternVar$1797(patStx$1829)) {
                if (next$1833 && next$1833.token.value === ':' && !isPatternVar$1797(nextNext$1834)) {
                    if (typeof nextNext$1834 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1829.class = nextNext$1834.token.value;
                } else {
                    patStx$1829.class = 'token';
                }
            } else if (patStx$1829.token.type === parser$1785.Token.Delimiter) {
                if (last$1831 && last$1831.token.value === '$') {
                    patStx$1829.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1829.class === 'pattern_group' && patStx$1829.token.value === '[]') {
                    patStx$1829.token.inner = loadLiteralGroup$1801(patStx$1829.token.inner);
                } else {
                    patStx$1829.token.inner = loadPattern$1802(patStx$1829.token.inner);
                }
            } else {
                patStx$1829.class = 'pattern_literal';
            }
            return acc$1828.concat(patStx$1829);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1835, patStx$1836, idx$1837, patterns$1838) {
            var separator$1839 = patStx$1836.separator || ' ';
            var repeat$1840 = patStx$1836.repeat || false;
            var next$1841 = patterns$1838[idx$1837 + 1];
            var nextNext$1842 = patterns$1838[idx$1837 + 2];
            if (next$1841 && next$1841.token.value === '...') {
                repeat$1840 = true;
                separator$1839 = ' ';
            } else if (delimIsSeparator$1796(next$1841) && nextNext$1842 && nextNext$1842.token.value === '...') {
                repeat$1840 = true;
                parser$1785.assert(next$1841.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1839 = next$1841.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1836.token.value === '...' || delimIsSeparator$1796(patStx$1836) && next$1841 && next$1841.token.value === '...') {
                return acc$1835;
            }
            patStx$1836.repeat = repeat$1840;
            patStx$1836.separator = separator$1839;
            return acc$1835.concat(patStx$1836);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1803(patternClass$1843, stx$1844, env$1845) {
        var result$1846, rest$1847;
        // pattern has no parse class
        if (patternClass$1843 === 'token' && stx$1844[0] && stx$1844[0].token.type !== parser$1785.Token.EOF) {
            result$1846 = [stx$1844[0]];
            rest$1847 = stx$1844.slice(1);
        } else if (patternClass$1843 === 'lit' && stx$1844[0] && typeIsLiteral$1794(stx$1844[0].token.type)) {
            result$1846 = [stx$1844[0]];
            rest$1847 = stx$1844.slice(1);
        } else if (patternClass$1843 === 'ident' && stx$1844[0] && stx$1844[0].token.type === parser$1785.Token.Identifier) {
            result$1846 = [stx$1844[0]];
            rest$1847 = stx$1844.slice(1);
        } else if (stx$1844.length > 0 && patternClass$1843 === 'VariableStatement') {
            var match$1848 = expander$1786.enforest(stx$1844, expander$1786.makeExpanderContext({ env: env$1845 }));
            if (match$1848.result && match$1848.result.hasPrototype(expander$1786.VariableStatement)) {
                result$1846 = match$1848.result.destruct(false);
                rest$1847 = match$1848.rest;
            } else {
                result$1846 = null;
                rest$1847 = stx$1844;
            }
        } else if (stx$1844.length > 0 && patternClass$1843 === 'expr') {
            var match$1848 = expander$1786.get_expression(stx$1844, expander$1786.makeExpanderContext({ env: env$1845 }));
            if (match$1848.result === null || !match$1848.result.hasPrototype(expander$1786.Expr)) {
                result$1846 = null;
                rest$1847 = stx$1844;
            } else {
                result$1846 = match$1848.result.destruct(false);
                rest$1847 = match$1848.rest;
            }
        } else {
            result$1846 = null;
            rest$1847 = stx$1844;
        }
        return {
            result: result$1846,
            rest: rest$1847
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1804(patterns$1849, stx$1850, env$1851, topLevel$1852) {
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
        topLevel$1852 = topLevel$1852 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1853 = [];
        var patternEnv$1854 = {};
        var match$1855;
        var pattern$1856;
        var rest$1857 = stx$1850;
        var success$1858 = true;
        patternLoop:
            for (var i$1859 = 0; i$1859 < patterns$1849.length; i$1859++) {
                if (success$1858 === false) {
                    break;
                }
                pattern$1856 = patterns$1849[i$1859];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1856.repeat && i$1859 + 1 < patterns$1849.length) {
                        var restMatch$1860 = matchPatterns$1804(patterns$1849.slice(i$1859 + 1), rest$1857, env$1851, topLevel$1852);
                        if (restMatch$1860.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1855 = matchPattern$1805(pattern$1856, [], env$1851, patternEnv$1854);
                            patternEnv$1854 = _$1783.extend(restMatch$1860.patternEnv, match$1855.patternEnv);
                            rest$1857 = restMatch$1860.rest;
                            break patternLoop;
                        }
                    }
                    match$1855 = matchPattern$1805(pattern$1856, rest$1857, env$1851, patternEnv$1854);
                    if (!match$1855.success && pattern$1856.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1855.success) {
                        success$1858 = false;
                        break;
                    }
                    rest$1857 = match$1855.rest;
                    patternEnv$1854 = match$1855.patternEnv;
                    if (success$1858 && !(topLevel$1852 || pattern$1856.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1859 == patterns$1849.length - 1 && rest$1857.length !== 0) {
                            success$1858 = false;
                            break;
                        }
                    }
                    if (pattern$1856.repeat && success$1858) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1856.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1857[0] && rest$1857[0].token.value === pattern$1856.separator) {
                            // more tokens and the next token matches the separator
                            rest$1857 = rest$1857.slice(1);
                        } else if (pattern$1856.separator !== ' ' && rest$1857.length > 0 && i$1859 === patterns$1849.length - 1 && topLevel$1852 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1858 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1856.repeat && success$1858 && rest$1857.length > 0);
            }
        return {
            success: success$1858,
            rest: rest$1857,
            patternEnv: patternEnv$1854
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
    function matchPattern$1805(pattern$1861, stx$1862, env$1863, patternEnv$1864) {
        var subMatch$1865;
        var match$1866, matchEnv$1867;
        var rest$1868;
        var success$1869;
        if (typeof pattern$1861.inner !== 'undefined') {
            if (pattern$1861.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1865 = matchPatterns$1804(pattern$1861.inner, stx$1862, env$1863, true);
                rest$1868 = subMatch$1865.rest;
            } else if (stx$1862[0] && stx$1862[0].token.type === parser$1785.Token.Delimiter && stx$1862[0].token.value === pattern$1861.value) {
                stx$1862[0].expose();
                if (pattern$1861.inner.length === 0 && stx$1862[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1862,
                        patternEnv: patternEnv$1864
                    };
                }
                subMatch$1865 = matchPatterns$1804(pattern$1861.inner, stx$1862[0].token.inner, env$1863, false);
                rest$1868 = stx$1862.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1862,
                    patternEnv: patternEnv$1864
                };
            }
            success$1869 = subMatch$1865.success;
            // merge the subpattern matches with the current pattern environment
            _$1783.keys(subMatch$1865.patternEnv).forEach(function (patternKey$1870) {
                if (pattern$1861.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1871 = subMatch$1865.patternEnv[patternKey$1870].level + 1;
                    if (patternEnv$1864[patternKey$1870]) {
                        patternEnv$1864[patternKey$1870].level = nextLevel$1871;
                        patternEnv$1864[patternKey$1870].match.push(subMatch$1865.patternEnv[patternKey$1870]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1864[patternKey$1870] = {
                            level: nextLevel$1871,
                            match: [subMatch$1865.patternEnv[patternKey$1870]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1864[patternKey$1870] = subMatch$1865.patternEnv[patternKey$1870];
                }
            });
        } else {
            if (pattern$1861.class === 'pattern_literal') {
                // wildcard
                if (stx$1862[0] && pattern$1861.value === '_') {
                    success$1869 = true;
                    rest$1868 = stx$1862.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1862[0] && pattern$1861.value === stx$1862[0].token.value) {
                    success$1869 = true;
                    rest$1868 = stx$1862.slice(1);
                } else {
                    success$1869 = false;
                    rest$1868 = stx$1862;
                }
            } else {
                match$1866 = matchPatternClass$1803(pattern$1861.class, stx$1862, env$1863);
                success$1869 = match$1866.result !== null;
                rest$1868 = match$1866.rest;
                matchEnv$1867 = {
                    level: 0,
                    match: match$1866.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1861.repeat) {
                    if (patternEnv$1864[pattern$1861.value] && success$1869) {
                        patternEnv$1864[pattern$1861.value].match.push(matchEnv$1867);
                    } else if (patternEnv$1864[pattern$1861.value] == undefined) {
                        // initialize if necessary
                        patternEnv$1864[pattern$1861.value] = {
                            level: 1,
                            match: [matchEnv$1867]
                        };
                    }
                } else {
                    patternEnv$1864[pattern$1861.value] = matchEnv$1867;
                }
            }
        }
        return {
            success: success$1869,
            rest: rest$1868,
            patternEnv: patternEnv$1864
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1806(macroBody$1872, macroNameStx$1873, env$1874) {
        return _$1783.chain(macroBody$1872).reduce(function (acc$1875, bodyStx$1876, idx$1877, original$1878) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1879 = original$1878[idx$1877 - 1];
            var next$1880 = original$1878[idx$1877 + 1];
            var nextNext$1881 = original$1878[idx$1877 + 2];
            // drop `...`
            if (bodyStx$1876.token.value === '...') {
                return acc$1875;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1796(bodyStx$1876) && next$1880 && next$1880.token.value === '...') {
                return acc$1875;
            }
            // skip the $ in $(...)
            if (bodyStx$1876.token.value === '$' && next$1880 && next$1880.token.type === parser$1785.Token.Delimiter && next$1880.token.value === '()') {
                return acc$1875;
            }
            // mark $[...] as a literal
            if (bodyStx$1876.token.value === '$' && next$1880 && next$1880.token.type === parser$1785.Token.Delimiter && next$1880.token.value === '[]') {
                next$1880.literal = true;
                return acc$1875;
            }
            if (bodyStx$1876.token.type === parser$1785.Token.Delimiter && bodyStx$1876.token.value === '()' && last$1879 && last$1879.token.value === '$') {
                bodyStx$1876.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1876.literal === true) {
                parser$1785.assert(bodyStx$1876.token.type === parser$1785.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1875.concat(bodyStx$1876.token.inner);
            }
            if (next$1880 && next$1880.token.value === '...') {
                bodyStx$1876.repeat = true;
                bodyStx$1876.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1796(next$1880) && nextNext$1881 && nextNext$1881.token.value === '...') {
                bodyStx$1876.repeat = true;
                bodyStx$1876.separator = next$1880.token.inner[0].token.value;
            }
            return acc$1875.concat(bodyStx$1876);
        }, []).reduce(function (acc$1882, bodyStx$1883, idx$1884) {
            // then do the actual transcription
            if (bodyStx$1883.repeat) {
                if (bodyStx$1883.token.type === parser$1785.Token.Delimiter) {
                    bodyStx$1883.expose();
                    var fv$1885 = _$1783.filter(freeVarsInPattern$1793(bodyStx$1883.token.inner), function (pat$1892) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1874.hasOwnProperty(pat$1892);
                        });
                    var restrictedEnv$1886 = [];
                    var nonScalar$1887 = _$1783.find(fv$1885, function (pat$1893) {
                            return env$1874[pat$1893].level > 0;
                        });
                    parser$1785.assert(typeof nonScalar$1887 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1888 = env$1874[nonScalar$1887].match.length;
                    var sameLength$1889 = _$1783.all(fv$1885, function (pat$1894) {
                            return env$1874[pat$1894].level === 0 || env$1874[pat$1894].match.length === repeatLength$1888;
                        });
                    parser$1785.assert(sameLength$1889, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1886 = _$1783.map(_$1783.range(repeatLength$1888), function (idx$1895) {
                        var renv$1896 = {};
                        _$1783.each(fv$1885, function (pat$1897) {
                            if (env$1874[pat$1897].level === 0) {
                                // copy scalars over
                                renv$1896[pat$1897] = env$1874[pat$1897];
                            } else if (env$1874[pat$1897].match[idx$1895].match.length > 0) {
                                // grab the match at this index (so long as there
                                // are syntax objects in the match)
                                renv$1896[pat$1897] = env$1874[pat$1897].match[idx$1895];
                            }
                        });
                        return renv$1896;
                    });
                    var transcribed$1890 = _$1783.map(restrictedEnv$1886, function (renv$1898) {
                            if (bodyStx$1883.group) {
                                return transcribe$1806(bodyStx$1883.token.inner, macroNameStx$1873, renv$1898);
                            } else {
                                var newBody$1899 = syntaxFromToken$1789(_$1783.clone(bodyStx$1883.token), bodyStx$1883);
                                newBody$1899.token.inner = transcribe$1806(bodyStx$1883.token.inner, macroNameStx$1873, renv$1898);
                                return newBody$1899;
                            }
                        });
                    var joined$1891;
                    if (bodyStx$1883.group) {
                        joined$1891 = joinSyntaxArr$1792(transcribed$1890, bodyStx$1883.separator);
                    } else {
                        joined$1891 = joinSyntax$1791(transcribed$1890, bodyStx$1883.separator);
                    }
                    return acc$1882.concat(joined$1891);
                }
                if (!env$1874[bodyStx$1883.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1883.token.value + ' is not bound for the template');
                } else if (env$1874[bodyStx$1883.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1883.token.value + ' does not match in the template');
                }
                return acc$1882.concat(joinRepeatedMatch$1798(env$1874[bodyStx$1883.token.value].match, bodyStx$1883.separator));
            } else {
                if (bodyStx$1883.token.type === parser$1785.Token.Delimiter) {
                    bodyStx$1883.expose();
                    var newBody$1900 = syntaxFromToken$1789(_$1783.clone(bodyStx$1883.token), macroBody$1872);
                    newBody$1900.token.inner = transcribe$1806(bodyStx$1883.token.inner, macroNameStx$1873, env$1874);
                    return acc$1882.concat([newBody$1900]);
                }
                if (isPatternVar$1797(bodyStx$1883) && Object.prototype.hasOwnProperty.bind(env$1874)(bodyStx$1883.token.value)) {
                    if (!env$1874[bodyStx$1883.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1883.token.value + ' is not bound for the template');
                    } else if (env$1874[bodyStx$1883.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1883.token.value + ' does not match in the template');
                    }
                    return acc$1882.concat(takeLineContext$1799(bodyStx$1883, env$1874[bodyStx$1883.token.value].match));
                }
                return acc$1882.concat([bodyStx$1883]);
            }
        }, []).value();
    }
    exports$1782.loadPattern = loadPattern$1802;
    exports$1782.matchPatterns = matchPatterns$1804;
    exports$1782.transcribe = transcribe$1806;
    exports$1782.matchPatternClass = matchPatternClass$1803;
    exports$1782.takeLineContext = takeLineContext$1799;
    exports$1782.takeLine = takeLine$1800;
}));
//# sourceMappingURL=patterns.js.map