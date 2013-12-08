(function (root$1786, factory$1787) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1787(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1787);
    }
}(this, function (exports$1788, _$1789, es6$1790, parser$1791, expander$1792, syntax$1793) {
    var get_expression$1794 = expander$1792.get_expression;
    var syntaxFromToken$1795 = syntax$1793.syntaxFromToken;
    var makePunc$1796 = syntax$1793.makePunc;
    var joinSyntax$1797 = syntax$1793.joinSyntax;
    var joinSyntaxArr$1798 = syntax$1793.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1799(pattern$1813) {
        var fv$1814 = [];
        _$1789.each(pattern$1813, function (pat$1815) {
            if (isPatternVar$1803(pat$1815)) {
                fv$1814.push(pat$1815.token.value);
            } else if (pat$1815.token.type === parser$1791.Token.Delimiter) {
                fv$1814 = fv$1814.concat(freeVarsInPattern$1799(pat$1815.token.inner));
            }
        });
        return fv$1814;
    }
    function typeIsLiteral$1800(type$1816) {
        return type$1816 === parser$1791.Token.NullLiteral || type$1816 === parser$1791.Token.NumericLiteral || type$1816 === parser$1791.Token.StringLiteral || type$1816 === parser$1791.Token.RegexLiteral || type$1816 === parser$1791.Token.BooleanLiteral;
    }
    function containsPatternVar$1801(patterns$1817) {
        return _$1789.any(patterns$1817, function (pat$1818) {
            if (pat$1818.token.type === parser$1791.Token.Delimiter) {
                return containsPatternVar$1801(pat$1818.token.inner);
            }
            return isPatternVar$1803(pat$1818);
        });
    }
    function delimIsSeparator$1802(delim$1819) {
        return delim$1819 && delim$1819.token && delim$1819.token.type === parser$1791.Token.Delimiter && delim$1819.token.value === '()' && delim$1819.token.inner.length === 1 && delim$1819.token.inner[0].token.type !== parser$1791.Token.Delimiter && !containsPatternVar$1801(delim$1819.token.inner);
    }
    function isPatternVar$1803(stx$1820) {
        return stx$1820.token.value[0] === '$' && stx$1820.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1804(tojoin$1821, punc$1822) {
        return _$1789.reduce(_$1789.rest(tojoin$1821, 1), function (acc$1823, join$1824) {
            if (punc$1822 === ' ') {
                return acc$1823.concat(join$1824.match);
            }
            return acc$1823.concat(makePunc$1796(punc$1822, _$1789.first(join$1824.match)), join$1824.match);
        }, _$1789.first(tojoin$1821).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1805(from$1825, to$1826) {
        return _$1789.map(to$1826, function (stx$1827) {
            return takeLine$1806(from$1825, stx$1827);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1806(from$1828, to$1829) {
        if (to$1829.token.type === parser$1791.Token.Delimiter) {
            var next$1830;
            if (from$1828.token.type === parser$1791.Token.Delimiter) {
                next$1830 = syntaxFromToken$1795({
                    type: parser$1791.Token.Delimiter,
                    value: to$1829.token.value,
                    inner: takeLineContext$1805(from$1828, to$1829.token.inner),
                    startRange: from$1828.token.startRange,
                    endRange: from$1828.token.endRange,
                    startLineNumber: from$1828.token.startLineNumber,
                    startLineStart: from$1828.token.startLineStart,
                    endLineNumber: from$1828.token.endLineNumber,
                    endLineStart: from$1828.token.endLineStart,
                    sm_startLineNumber: to$1829.token.startLineNumber,
                    sm_endLineNumber: to$1829.token.endLineNumber,
                    sm_startLineStart: to$1829.token.startLineStart,
                    sm_endLineStart: to$1829.token.endLineStart,
                    sm_startRange: to$1829.token.startRange,
                    sm_endRange: to$1829.token.endRange
                }, to$1829);
            } else {
                next$1830 = syntaxFromToken$1795({
                    type: parser$1791.Token.Delimiter,
                    value: to$1829.token.value,
                    inner: takeLineContext$1805(from$1828, to$1829.token.inner),
                    startRange: from$1828.token.range,
                    endRange: from$1828.token.range,
                    startLineNumber: from$1828.token.lineNumber,
                    startLineStart: from$1828.token.lineStart,
                    endLineNumber: from$1828.token.lineNumber,
                    endLineStart: from$1828.token.lineStart,
                    sm_startLineNumber: to$1829.token.startLineNumber,
                    sm_endLineNumber: to$1829.token.endLineNumber,
                    sm_startLineStart: to$1829.token.startLineStart,
                    sm_endLineStart: to$1829.token.endLineStart,
                    sm_startRange: to$1829.token.startRange,
                    sm_endRange: to$1829.token.endRange
                }, to$1829);
            }
        } else {
            if (from$1828.token.type === parser$1791.Token.Delimiter) {
                next$1830 = syntaxFromToken$1795({
                    value: to$1829.token.value,
                    type: to$1829.token.type,
                    lineNumber: from$1828.token.startLineNumber,
                    lineStart: from$1828.token.startLineStart,
                    range: from$1828.token.startRange,
                    sm_lineNumber: to$1829.token.lineNumber,
                    sm_lineStart: to$1829.token.lineStart,
                    sm_range: to$1829.token.range
                }, to$1829);
            } else {
                next$1830 = syntaxFromToken$1795({
                    value: to$1829.token.value,
                    type: to$1829.token.type,
                    lineNumber: from$1828.token.lineNumber,
                    lineStart: from$1828.token.lineStart,
                    range: from$1828.token.range,
                    sm_lineNumber: to$1829.token.lineNumber,
                    sm_lineStart: to$1829.token.lineStart,
                    sm_range: to$1829.token.range
                }, to$1829);
            }
        }
        if (to$1829.token.leadingComments) {
            next$1830.token.leadingComments = to$1829.token.leadingComments;
        }
        if (to$1829.token.trailingComments) {
            next$1830.token.trailingComments = to$1829.token.trailingComments;
        }
        return next$1830;
    }
    function loadLiteralGroup$1807(patterns$1831) {
        _$1789.forEach(patterns$1831, function (patStx$1832) {
            if (patStx$1832.token.type === parser$1791.Token.Delimiter) {
                patStx$1832.token.inner = loadLiteralGroup$1807(patStx$1832.token.inner);
            } else {
                patStx$1832.class = 'pattern_literal';
            }
        });
        return patterns$1831;
    }
    function loadPattern$1808(patterns$1833) {
        return _$1789.chain(patterns$1833).reduce(function (acc$1834, patStx$1835, idx$1836) {
            var last$1837 = patterns$1833[idx$1836 - 1];
            var lastLast$1838 = patterns$1833[idx$1836 - 2];
            var next$1839 = patterns$1833[idx$1836 + 1];
            var nextNext$1840 = patterns$1833[idx$1836 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1835.token.value === ':') {
                if (last$1837 && isPatternVar$1803(last$1837) && !isPatternVar$1803(next$1839)) {
                    return acc$1834;
                }
            }
            if (last$1837 && last$1837.token.value === ':') {
                if (lastLast$1838 && isPatternVar$1803(lastLast$1838) && !isPatternVar$1803(patStx$1835)) {
                    return acc$1834;
                }
            }
            // skip over $
            if (patStx$1835.token.value === '$' && next$1839 && next$1839.token.type === parser$1791.Token.Delimiter) {
                return acc$1834;
            }
            if (isPatternVar$1803(patStx$1835)) {
                if (next$1839 && next$1839.token.value === ':' && !isPatternVar$1803(nextNext$1840)) {
                    if (typeof nextNext$1840 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1835.class = nextNext$1840.token.value;
                } else {
                    patStx$1835.class = 'token';
                }
            } else if (patStx$1835.token.type === parser$1791.Token.Delimiter) {
                if (last$1837 && last$1837.token.value === '$') {
                    patStx$1835.class = 'pattern_group';
                }
                // Leave literal groups as is
                if (patStx$1835.class === 'pattern_group' && patStx$1835.token.value === '[]') {
                    patStx$1835.token.inner = loadLiteralGroup$1807(patStx$1835.token.inner);
                } else {
                    patStx$1835.token.inner = loadPattern$1808(patStx$1835.token.inner);
                }
            } else {
                patStx$1835.class = 'pattern_literal';
            }
            return acc$1834.concat(patStx$1835);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1841, patStx$1842, idx$1843, patterns$1844) {
            var separator$1845 = patStx$1842.separator || ' ';
            var repeat$1846 = patStx$1842.repeat || false;
            var next$1847 = patterns$1844[idx$1843 + 1];
            var nextNext$1848 = patterns$1844[idx$1843 + 2];
            if (next$1847 && next$1847.token.value === '...') {
                repeat$1846 = true;
                separator$1845 = ' ';
            } else if (delimIsSeparator$1802(next$1847) && nextNext$1848 && nextNext$1848.token.value === '...') {
                repeat$1846 = true;
                parser$1791.assert(next$1847.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1845 = next$1847.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1842.token.value === '...' || delimIsSeparator$1802(patStx$1842) && next$1847 && next$1847.token.value === '...') {
                return acc$1841;
            }
            patStx$1842.repeat = repeat$1846;
            patStx$1842.separator = separator$1845;
            return acc$1841.concat(patStx$1842);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1809(patternClass$1849, stx$1850, env$1851) {
        var result$1852, rest$1853;
        // pattern has no parse class
        if (patternClass$1849 === 'token' && stx$1850[0] && stx$1850[0].token.type !== parser$1791.Token.EOF) {
            result$1852 = [stx$1850[0]];
            rest$1853 = stx$1850.slice(1);
        } else if (patternClass$1849 === 'lit' && stx$1850[0] && typeIsLiteral$1800(stx$1850[0].token.type)) {
            result$1852 = [stx$1850[0]];
            rest$1853 = stx$1850.slice(1);
        } else if (patternClass$1849 === 'ident' && stx$1850[0] && stx$1850[0].token.type === parser$1791.Token.Identifier) {
            result$1852 = [stx$1850[0]];
            rest$1853 = stx$1850.slice(1);
        } else if (stx$1850.length > 0 && patternClass$1849 === 'VariableStatement') {
            var match$1854 = expander$1792.enforest(stx$1850, expander$1792.makeExpanderContext({ env: env$1851 }));
            if (match$1854.result && match$1854.result.hasPrototype(expander$1792.VariableStatement)) {
                result$1852 = match$1854.result.destruct(false);
                rest$1853 = match$1854.rest;
            } else {
                result$1852 = null;
                rest$1853 = stx$1850;
            }
        } else if (stx$1850.length > 0 && patternClass$1849 === 'expr') {
            var match$1854 = expander$1792.get_expression(stx$1850, expander$1792.makeExpanderContext({ env: env$1851 }));
            if (match$1854.result === null || !match$1854.result.hasPrototype(expander$1792.Expr)) {
                result$1852 = null;
                rest$1853 = stx$1850;
            } else {
                result$1852 = match$1854.result.destruct(false);
                rest$1853 = match$1854.rest;
            }
        } else {
            result$1852 = null;
            rest$1853 = stx$1850;
        }
        return {
            result: result$1852,
            rest: rest$1853
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1810(patterns$1855, stx$1856, env$1857, topLevel$1858) {
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
        topLevel$1858 = topLevel$1858 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1859 = [];
        var patternEnv$1860 = {};
        var match$1861;
        var pattern$1862;
        var rest$1863 = stx$1856;
        var success$1864 = true;
        patternLoop:
            for (var i$1865 = 0; i$1865 < patterns$1855.length; i$1865++) {
                if (success$1864 === false) {
                    break;
                }
                pattern$1862 = patterns$1855[i$1865];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1862.repeat && i$1865 + 1 < patterns$1855.length) {
                        var restMatch$1866 = matchPatterns$1810(patterns$1855.slice(i$1865 + 1), rest$1863, env$1857, topLevel$1858);
                        if (restMatch$1866.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1861 = matchPattern$1811(pattern$1862, [], env$1857, patternEnv$1860);
                            patternEnv$1860 = _$1789.extend(restMatch$1866.patternEnv, match$1861.patternEnv);
                            rest$1863 = restMatch$1866.rest;
                            break patternLoop;
                        }
                    }
                    match$1861 = matchPattern$1811(pattern$1862, rest$1863, env$1857, patternEnv$1860);
                    if (!match$1861.success && pattern$1862.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1861.success) {
                        success$1864 = false;
                        break;
                    }
                    rest$1863 = match$1861.rest;
                    patternEnv$1860 = match$1861.patternEnv;
                    if (success$1864 && !(topLevel$1858 || pattern$1862.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1865 == patterns$1855.length - 1 && rest$1863.length !== 0) {
                            success$1864 = false;
                            break;
                        }
                    }
                    if (pattern$1862.repeat && success$1864) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1862.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1863[0] && rest$1863[0].token.value === pattern$1862.separator) {
                            // more tokens and the next token matches the separator
                            rest$1863 = rest$1863.slice(1);
                        } else if (pattern$1862.separator !== ' ' && rest$1863.length > 0 && i$1865 === patterns$1855.length - 1 && topLevel$1858 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1864 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1862.repeat && success$1864 && rest$1863.length > 0);
            }
        return {
            success: success$1864,
            rest: rest$1863,
            patternEnv: patternEnv$1860
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
    function matchPattern$1811(pattern$1867, stx$1868, env$1869, patternEnv$1870) {
        var subMatch$1871;
        var match$1872, matchEnv$1873;
        var rest$1874;
        var success$1875;
        if (typeof pattern$1867.inner !== 'undefined') {
            if (pattern$1867.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1871 = matchPatterns$1810(pattern$1867.inner, stx$1868, env$1869, true);
                rest$1874 = subMatch$1871.rest;
            } else if (stx$1868[0] && stx$1868[0].token.type === parser$1791.Token.Delimiter && stx$1868[0].token.value === pattern$1867.value) {
                stx$1868[0].expose();
                if (pattern$1867.inner.length === 0 && stx$1868[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1868,
                        patternEnv: patternEnv$1870
                    };
                }
                subMatch$1871 = matchPatterns$1810(pattern$1867.inner, stx$1868[0].token.inner, env$1869, false);
                rest$1874 = stx$1868.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1868,
                    patternEnv: patternEnv$1870
                };
            }
            success$1875 = subMatch$1871.success;
            // merge the subpattern matches with the current pattern environment
            _$1789.keys(subMatch$1871.patternEnv).forEach(function (patternKey$1876) {
                if (pattern$1867.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1877 = subMatch$1871.patternEnv[patternKey$1876].level + 1;
                    if (patternEnv$1870[patternKey$1876]) {
                        patternEnv$1870[patternKey$1876].level = nextLevel$1877;
                        patternEnv$1870[patternKey$1876].match.push(subMatch$1871.patternEnv[patternKey$1876]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1870[patternKey$1876] = {
                            level: nextLevel$1877,
                            match: [subMatch$1871.patternEnv[patternKey$1876]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1870[patternKey$1876] = subMatch$1871.patternEnv[patternKey$1876];
                }
            });
        } else {
            if (pattern$1867.class === 'pattern_literal') {
                // wildcard
                if (stx$1868[0] && pattern$1867.value === '_') {
                    success$1875 = true;
                    rest$1874 = stx$1868.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1868[0] && pattern$1867.value === stx$1868[0].token.value) {
                    success$1875 = true;
                    rest$1874 = stx$1868.slice(1);
                } else {
                    success$1875 = false;
                    rest$1874 = stx$1868;
                }
            } else {
                match$1872 = matchPatternClass$1809(pattern$1867.class, stx$1868, env$1869);
                success$1875 = match$1872.result !== null;
                rest$1874 = match$1872.rest;
                matchEnv$1873 = {
                    level: 0,
                    match: match$1872.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1867.repeat) {
                    if (patternEnv$1870[pattern$1867.value]) {
                        patternEnv$1870[pattern$1867.value].match.push(matchEnv$1873);
                    } else {
                        // initialize if necessary
                        patternEnv$1870[pattern$1867.value] = {
                            level: 1,
                            match: [matchEnv$1873]
                        };
                    }
                } else {
                    patternEnv$1870[pattern$1867.value] = matchEnv$1873;
                }
            }
        }
        return {
            success: success$1875,
            rest: rest$1874,
            patternEnv: patternEnv$1870
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1812(macroBody$1878, macroNameStx$1879, env$1880) {
        return _$1789.chain(macroBody$1878).reduce(function (acc$1881, bodyStx$1882, idx$1883, original$1884) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1885 = original$1884[idx$1883 - 1];
            var next$1886 = original$1884[idx$1883 + 1];
            var nextNext$1887 = original$1884[idx$1883 + 2];
            // drop `...`
            if (bodyStx$1882.token.value === '...') {
                return acc$1881;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1802(bodyStx$1882) && next$1886 && next$1886.token.value === '...') {
                return acc$1881;
            }
            // skip the $ in $(...)
            if (bodyStx$1882.token.value === '$' && next$1886 && next$1886.token.type === parser$1791.Token.Delimiter && next$1886.token.value === '()') {
                return acc$1881;
            }
            // mark $[...] as a literal
            if (bodyStx$1882.token.value === '$' && next$1886 && next$1886.token.type === parser$1791.Token.Delimiter && next$1886.token.value === '[]') {
                next$1886.literal = true;
                return acc$1881;
            }
            if (bodyStx$1882.token.type === parser$1791.Token.Delimiter && bodyStx$1882.token.value === '()' && last$1885 && last$1885.token.value === '$') {
                bodyStx$1882.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1882.literal === true) {
                parser$1791.assert(bodyStx$1882.token.type === parser$1791.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1881.concat(bodyStx$1882.token.inner);
            }
            if (next$1886 && next$1886.token.value === '...') {
                bodyStx$1882.repeat = true;
                bodyStx$1882.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1802(next$1886) && nextNext$1887 && nextNext$1887.token.value === '...') {
                bodyStx$1882.repeat = true;
                bodyStx$1882.separator = next$1886.token.inner[0].token.value;
            }
            return acc$1881.concat(bodyStx$1882);
        }, []).reduce(function (acc$1888, bodyStx$1889, idx$1890) {
            // then do the actual transcription
            if (bodyStx$1889.repeat) {
                if (bodyStx$1889.token.type === parser$1791.Token.Delimiter) {
                    bodyStx$1889.expose();
                    var fv$1891 = _$1789.filter(freeVarsInPattern$1799(bodyStx$1889.token.inner), function (pat$1898) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1880.hasOwnProperty(pat$1898);
                        });
                    var restrictedEnv$1892 = [];
                    var nonScalar$1893 = _$1789.find(fv$1891, function (pat$1899) {
                            return env$1880[pat$1899].level > 0;
                        });
                    parser$1791.assert(typeof nonScalar$1893 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1894 = env$1880[nonScalar$1893].match.length;
                    var sameLength$1895 = _$1789.all(fv$1891, function (pat$1900) {
                            return env$1880[pat$1900].level === 0 || env$1880[pat$1900].match.length === repeatLength$1894;
                        });
                    parser$1791.assert(sameLength$1895, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1892 = _$1789.map(_$1789.range(repeatLength$1894), function (idx$1901) {
                        var renv$1902 = {};
                        _$1789.each(fv$1891, function (pat$1903) {
                            if (env$1880[pat$1903].level === 0) {
                                // copy scalars over
                                renv$1902[pat$1903] = env$1880[pat$1903];
                            } else {
                                // grab the match at this index
                                renv$1902[pat$1903] = env$1880[pat$1903].match[idx$1901];
                            }
                        });
                        return renv$1902;
                    });
                    var transcribed$1896 = _$1789.map(restrictedEnv$1892, function (renv$1904) {
                            if (bodyStx$1889.group) {
                                return transcribe$1812(bodyStx$1889.token.inner, macroNameStx$1879, renv$1904);
                            } else {
                                var newBody$1905 = syntaxFromToken$1795(_$1789.clone(bodyStx$1889.token), bodyStx$1889);
                                newBody$1905.token.inner = transcribe$1812(bodyStx$1889.token.inner, macroNameStx$1879, renv$1904);
                                return newBody$1905;
                            }
                        });
                    var joined$1897;
                    if (bodyStx$1889.group) {
                        joined$1897 = joinSyntaxArr$1798(transcribed$1896, bodyStx$1889.separator);
                    } else {
                        joined$1897 = joinSyntax$1797(transcribed$1896, bodyStx$1889.separator);
                    }
                    return acc$1888.concat(joined$1897);
                }
                if (!env$1880[bodyStx$1889.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1889.token.value + ' is not bound for the template');
                } else if (env$1880[bodyStx$1889.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1889.token.value + ' does not match in the template');
                }
                return acc$1888.concat(joinRepeatedMatch$1804(env$1880[bodyStx$1889.token.value].match, bodyStx$1889.separator));
            } else {
                if (bodyStx$1889.token.type === parser$1791.Token.Delimiter) {
                    bodyStx$1889.expose();
                    var newBody$1906 = syntaxFromToken$1795(_$1789.clone(bodyStx$1889.token), macroBody$1878);
                    newBody$1906.token.inner = transcribe$1812(bodyStx$1889.token.inner, macroNameStx$1879, env$1880);
                    return acc$1888.concat([newBody$1906]);
                }
                if (isPatternVar$1803(bodyStx$1889) && Object.prototype.hasOwnProperty.bind(env$1880)(bodyStx$1889.token.value)) {
                    if (!env$1880[bodyStx$1889.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1889.token.value + ' is not bound for the template');
                    } else if (env$1880[bodyStx$1889.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1889.token.value + ' does not match in the template');
                    }
                    return acc$1888.concat(takeLineContext$1805(bodyStx$1889, env$1880[bodyStx$1889.token.value].match));
                }
                return acc$1888.concat([bodyStx$1889]);
            }
        }, []).value();
    }
    exports$1788.loadPattern = loadPattern$1808;
    exports$1788.matchPatterns = matchPatterns$1810;
    exports$1788.transcribe = transcribe$1812;
    exports$1788.matchPatternClass = matchPatternClass$1809;
    exports$1788.takeLineContext = takeLineContext$1805;
    exports$1788.takeLine = takeLine$1806;
}));
//# sourceMappingURL=patterns.js.map