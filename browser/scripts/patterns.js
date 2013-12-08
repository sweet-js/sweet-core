(function (root$1763, factory$1764) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1764(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1764);
    }
}(this, function (exports$1765, _$1766, es6$1767, parser$1768, expander$1769, syntax$1770) {
    var get_expression$1771 = expander$1769.get_expression;
    var syntaxFromToken$1772 = syntax$1770.syntaxFromToken;
    var makePunc$1773 = syntax$1770.makePunc;
    var joinSyntax$1774 = syntax$1770.joinSyntax;
    var joinSyntaxArr$1775 = syntax$1770.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1776(pattern$1789) {
        var fv$1790 = [];
        _$1766.each(pattern$1789, function (pat$1791) {
            if (isPatternVar$1780(pat$1791)) {
                fv$1790.push(pat$1791.token.value);
            } else if (pat$1791.token.type === parser$1768.Token.Delimiter) {
                fv$1790 = fv$1790.concat(freeVarsInPattern$1776(pat$1791.token.inner));
            }
        });
        return fv$1790;
    }
    function typeIsLiteral$1777(type$1792) {
        return type$1792 === parser$1768.Token.NullLiteral || type$1792 === parser$1768.Token.NumericLiteral || type$1792 === parser$1768.Token.StringLiteral || type$1792 === parser$1768.Token.RegexLiteral || type$1792 === parser$1768.Token.BooleanLiteral;
    }
    function containsPatternVar$1778(patterns$1793) {
        return _$1766.any(patterns$1793, function (pat$1794) {
            if (pat$1794.token.type === parser$1768.Token.Delimiter) {
                return containsPatternVar$1778(pat$1794.token.inner);
            }
            return isPatternVar$1780(pat$1794);
        });
    }
    function delimIsSeparator$1779(delim$1795) {
        return delim$1795 && delim$1795.token && delim$1795.token.type === parser$1768.Token.Delimiter && delim$1795.token.value === '()' && delim$1795.token.inner.length === 1 && delim$1795.token.inner[0].token.type !== parser$1768.Token.Delimiter && !containsPatternVar$1778(delim$1795.token.inner);
    }
    function isPatternVar$1780(stx$1796) {
        return stx$1796.token.value[0] === '$' && stx$1796.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1781(tojoin$1797, punc$1798) {
        return _$1766.reduce(_$1766.rest(tojoin$1797, 1), function (acc$1799, join$1800) {
            if (punc$1798 === ' ') {
                return acc$1799.concat(join$1800.match);
            }
            return acc$1799.concat(makePunc$1773(punc$1798, _$1766.first(join$1800.match)), join$1800.match);
        }, _$1766.first(tojoin$1797).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1782(from$1801, to$1802) {
        return _$1766.map(to$1802, function (stx$1803) {
            return takeLine$1783(from$1801, stx$1803);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1783(from$1804, to$1805) {
        if (to$1805.token.type === parser$1768.Token.Delimiter) {
            var next$1806;
            if (from$1804.token.type === parser$1768.Token.Delimiter) {
                next$1806 = syntaxFromToken$1772({
                    type: parser$1768.Token.Delimiter,
                    value: to$1805.token.value,
                    inner: takeLineContext$1782(from$1804, to$1805.token.inner),
                    startRange: from$1804.token.startRange,
                    endRange: from$1804.token.endRange,
                    startLineNumber: from$1804.token.startLineNumber,
                    startLineStart: from$1804.token.startLineStart,
                    endLineNumber: from$1804.token.endLineNumber,
                    endLineStart: from$1804.token.endLineStart
                }, to$1805);
            } else {
                next$1806 = syntaxFromToken$1772({
                    type: parser$1768.Token.Delimiter,
                    value: to$1805.token.value,
                    inner: takeLineContext$1782(from$1804, to$1805.token.inner),
                    startRange: from$1804.token.range,
                    endRange: from$1804.token.range,
                    startLineNumber: from$1804.token.lineNumber,
                    startLineStart: from$1804.token.lineStart,
                    endLineNumber: from$1804.token.lineNumber,
                    endLineStart: from$1804.token.lineStart
                }, to$1805);
            }
        } else {
            if (from$1804.token.type === parser$1768.Token.Delimiter) {
                next$1806 = syntaxFromToken$1772({
                    value: to$1805.token.value,
                    type: to$1805.token.type,
                    lineNumber: from$1804.token.startLineNumber,
                    lineStart: from$1804.token.startLineStart,
                    range: from$1804.token.startRange
                }, to$1805);
            } else {
                next$1806 = syntaxFromToken$1772({
                    value: to$1805.token.value,
                    type: to$1805.token.type,
                    lineNumber: from$1804.token.lineNumber,
                    lineStart: from$1804.token.lineStart,
                    range: from$1804.token.range
                }, to$1805);
            }
        }
        if (to$1805.token.leadingComments) {
            next$1806.token.leadingComments = to$1805.token.leadingComments;
        }
        if (to$1805.token.trailingComments) {
            next$1806.token.trailingComments = to$1805.token.trailingComments;
        }
        return next$1806;
    }
    function loadPattern$1784(patterns$1807) {
        return _$1766.chain(patterns$1807).reduce(function (acc$1808, patStx$1809, idx$1810) {
            var last$1811 = patterns$1807[idx$1810 - 1];
            var lastLast$1812 = patterns$1807[idx$1810 - 2];
            var next$1813 = patterns$1807[idx$1810 + 1];
            var nextNext$1814 = patterns$1807[idx$1810 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1809.token.value === ':') {
                if (last$1811 && isPatternVar$1780(last$1811) && !isPatternVar$1780(next$1813)) {
                    return acc$1808;
                }
            }
            if (last$1811 && last$1811.token.value === ':') {
                if (lastLast$1812 && isPatternVar$1780(lastLast$1812) && !isPatternVar$1780(patStx$1809)) {
                    return acc$1808;
                }
            }
            // skip over $
            if (patStx$1809.token.value === '$' && next$1813 && next$1813.token.type === parser$1768.Token.Delimiter) {
                return acc$1808;
            }
            if (isPatternVar$1780(patStx$1809)) {
                if (next$1813 && next$1813.token.value === ':' && !isPatternVar$1780(nextNext$1814)) {
                    if (typeof nextNext$1814 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1809.class = nextNext$1814.token.value;
                } else {
                    patStx$1809.class = 'token';
                }
            } else if (patStx$1809.token.type === parser$1768.Token.Delimiter) {
                if (last$1811 && last$1811.token.value === '$') {
                    patStx$1809.class = 'pattern_group';
                }
                patStx$1809.token.inner = loadPattern$1784(patStx$1809.token.inner);
            } else {
                patStx$1809.class = 'pattern_literal';
            }
            return acc$1808.concat(patStx$1809);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1815, patStx$1816, idx$1817, patterns$1818) {
            var separator$1819 = patStx$1816.separator || ' ';
            var repeat$1820 = patStx$1816.repeat || false;
            var next$1821 = patterns$1818[idx$1817 + 1];
            var nextNext$1822 = patterns$1818[idx$1817 + 2];
            if (next$1821 && next$1821.token.value === '...') {
                repeat$1820 = true;
                separator$1819 = ' ';
            } else if (delimIsSeparator$1779(next$1821) && nextNext$1822 && nextNext$1822.token.value === '...') {
                repeat$1820 = true;
                parser$1768.assert(next$1821.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1819 = next$1821.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1816.token.value === '...' || delimIsSeparator$1779(patStx$1816) && next$1821 && next$1821.token.value === '...') {
                return acc$1815;
            }
            patStx$1816.repeat = repeat$1820;
            patStx$1816.separator = separator$1819;
            return acc$1815.concat(patStx$1816);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1785(patternClass$1823, stx$1824, env$1825) {
        var result$1826, rest$1827;
        // pattern has no parse class
        if (patternClass$1823 === 'token' && stx$1824[0] && stx$1824[0].token.type !== parser$1768.Token.EOF) {
            result$1826 = [stx$1824[0]];
            rest$1827 = stx$1824.slice(1);
        } else if (patternClass$1823 === 'lit' && stx$1824[0] && typeIsLiteral$1777(stx$1824[0].token.type)) {
            result$1826 = [stx$1824[0]];
            rest$1827 = stx$1824.slice(1);
        } else if (patternClass$1823 === 'ident' && stx$1824[0] && stx$1824[0].token.type === parser$1768.Token.Identifier) {
            result$1826 = [stx$1824[0]];
            rest$1827 = stx$1824.slice(1);
        } else if (stx$1824.length > 0 && patternClass$1823 === 'VariableStatement') {
            var match$1828 = expander$1769.enforest(stx$1824, expander$1769.makeExpanderContext({ env: env$1825 }));
            if (match$1828.result && match$1828.result.hasPrototype(expander$1769.VariableStatement)) {
                result$1826 = match$1828.result.destruct(false);
                rest$1827 = match$1828.rest;
            } else {
                result$1826 = null;
                rest$1827 = stx$1824;
            }
        } else if (stx$1824.length > 0 && patternClass$1823 === 'expr') {
            var match$1828 = expander$1769.get_expression(stx$1824, expander$1769.makeExpanderContext({ env: env$1825 }));
            if (match$1828.result === null || !match$1828.result.hasPrototype(expander$1769.Expr)) {
                result$1826 = null;
                rest$1827 = stx$1824;
            } else {
                result$1826 = match$1828.result.destruct(false);
                rest$1827 = match$1828.rest;
            }
        } else {
            result$1826 = null;
            rest$1827 = stx$1824;
        }
        return {
            result: result$1826,
            rest: rest$1827
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1786(patterns$1829, stx$1830, env$1831, topLevel$1832) {
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
        topLevel$1832 = topLevel$1832 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1833 = [];
        var patternEnv$1834 = {};
        var match$1835;
        var pattern$1836;
        var rest$1837 = stx$1830;
        var success$1838 = true;
        patternLoop:
            for (var i$1839 = 0; i$1839 < patterns$1829.length; i$1839++) {
                if (success$1838 === false) {
                    break;
                }
                pattern$1836 = patterns$1829[i$1839];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1836.repeat && i$1839 + 1 < patterns$1829.length) {
                        var restMatch$1840 = matchPatterns$1786(patterns$1829.slice(i$1839 + 1), rest$1837, env$1831, topLevel$1832);
                        if (restMatch$1840.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1835 = matchPattern$1787(pattern$1836, [], env$1831, patternEnv$1834);
                            patternEnv$1834 = _$1766.extend(restMatch$1840.patternEnv, match$1835.patternEnv);
                            rest$1837 = restMatch$1840.rest;
                            break patternLoop;
                        }
                    }
                    match$1835 = matchPattern$1787(pattern$1836, rest$1837, env$1831, patternEnv$1834);
                    if (!match$1835.success && pattern$1836.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1835.success) {
                        success$1838 = false;
                        break;
                    }
                    rest$1837 = match$1835.rest;
                    patternEnv$1834 = match$1835.patternEnv;
                    if (success$1838 && !(topLevel$1832 || pattern$1836.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1839 == patterns$1829.length - 1 && rest$1837.length !== 0) {
                            success$1838 = false;
                            break;
                        }
                    }
                    if (pattern$1836.repeat && success$1838) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1836.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1837[0] && rest$1837[0].token.value === pattern$1836.separator) {
                            // more tokens and the next token matches the separator
                            rest$1837 = rest$1837.slice(1);
                        } else if (pattern$1836.separator !== ' ' && rest$1837.length > 0 && i$1839 === patterns$1829.length - 1 && topLevel$1832 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1838 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1836.repeat && success$1838 && rest$1837.length > 0);
            }
        return {
            success: success$1838,
            rest: rest$1837,
            patternEnv: patternEnv$1834
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
    function matchPattern$1787(pattern$1841, stx$1842, env$1843, patternEnv$1844) {
        var subMatch$1845;
        var match$1846, matchEnv$1847;
        var rest$1848;
        var success$1849;
        if (typeof pattern$1841.inner !== 'undefined') {
            if (pattern$1841.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1845 = matchPatterns$1786(pattern$1841.inner, stx$1842, env$1843, true);
                rest$1848 = subMatch$1845.rest;
            } else if (stx$1842[0] && stx$1842[0].token.type === parser$1768.Token.Delimiter && stx$1842[0].token.value === pattern$1841.value) {
                stx$1842[0].expose();
                if (pattern$1841.inner.length === 0 && stx$1842[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1842,
                        patternEnv: patternEnv$1844
                    };
                }
                subMatch$1845 = matchPatterns$1786(pattern$1841.inner, stx$1842[0].token.inner, env$1843, false);
                rest$1848 = stx$1842.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1842,
                    patternEnv: patternEnv$1844
                };
            }
            success$1849 = subMatch$1845.success;
            // merge the subpattern matches with the current pattern environment
            _$1766.keys(subMatch$1845.patternEnv).forEach(function (patternKey$1850) {
                if (pattern$1841.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1851 = subMatch$1845.patternEnv[patternKey$1850].level + 1;
                    if (patternEnv$1844[patternKey$1850]) {
                        patternEnv$1844[patternKey$1850].level = nextLevel$1851;
                        patternEnv$1844[patternKey$1850].match.push(subMatch$1845.patternEnv[patternKey$1850]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1844[patternKey$1850] = {
                            level: nextLevel$1851,
                            match: [subMatch$1845.patternEnv[patternKey$1850]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1844[patternKey$1850] = subMatch$1845.patternEnv[patternKey$1850];
                }
            });
        } else {
            if (pattern$1841.class === 'pattern_literal') {
                // wildcard
                if (stx$1842[0] && pattern$1841.value === '_') {
                    success$1849 = true;
                    rest$1848 = stx$1842.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1842[0] && pattern$1841.value === stx$1842[0].token.value) {
                    success$1849 = true;
                    rest$1848 = stx$1842.slice(1);
                } else {
                    success$1849 = false;
                    rest$1848 = stx$1842;
                }
            } else {
                match$1846 = matchPatternClass$1785(pattern$1841.class, stx$1842, env$1843);
                success$1849 = match$1846.result !== null;
                rest$1848 = match$1846.rest;
                matchEnv$1847 = {
                    level: 0,
                    match: match$1846.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1841.repeat) {
                    if (patternEnv$1844[pattern$1841.value]) {
                        patternEnv$1844[pattern$1841.value].match.push(matchEnv$1847);
                    } else {
                        // initialize if necessary
                        patternEnv$1844[pattern$1841.value] = {
                            level: 1,
                            match: [matchEnv$1847]
                        };
                    }
                } else {
                    patternEnv$1844[pattern$1841.value] = matchEnv$1847;
                }
            }
        }
        return {
            success: success$1849,
            rest: rest$1848,
            patternEnv: patternEnv$1844
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1788(macroBody$1852, macroNameStx$1853, env$1854) {
        return _$1766.chain(macroBody$1852).reduce(function (acc$1855, bodyStx$1856, idx$1857, original$1858) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1859 = original$1858[idx$1857 - 1];
            var next$1860 = original$1858[idx$1857 + 1];
            var nextNext$1861 = original$1858[idx$1857 + 2];
            // drop `...`
            if (bodyStx$1856.token.value === '...') {
                return acc$1855;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1779(bodyStx$1856) && next$1860 && next$1860.token.value === '...') {
                return acc$1855;
            }
            // skip the $ in $(...)
            if (bodyStx$1856.token.value === '$' && next$1860 && next$1860.token.type === parser$1768.Token.Delimiter && next$1860.token.value === '()') {
                return acc$1855;
            }
            // mark $[...] as a literal
            if (bodyStx$1856.token.value === '$' && next$1860 && next$1860.token.type === parser$1768.Token.Delimiter && next$1860.token.value === '[]') {
                next$1860.literal = true;
                return acc$1855;
            }
            if (bodyStx$1856.token.type === parser$1768.Token.Delimiter && bodyStx$1856.token.value === '()' && last$1859 && last$1859.token.value === '$') {
                bodyStx$1856.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1856.literal === true) {
                parser$1768.assert(bodyStx$1856.token.type === parser$1768.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1855.concat(bodyStx$1856.token.inner);
            }
            if (next$1860 && next$1860.token.value === '...') {
                bodyStx$1856.repeat = true;
                bodyStx$1856.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1779(next$1860) && nextNext$1861 && nextNext$1861.token.value === '...') {
                bodyStx$1856.repeat = true;
                bodyStx$1856.separator = next$1860.token.inner[0].token.value;
            }
            return acc$1855.concat(bodyStx$1856);
        }, []).reduce(function (acc$1862, bodyStx$1863, idx$1864) {
            // then do the actual transcription
            if (bodyStx$1863.repeat) {
                if (bodyStx$1863.token.type === parser$1768.Token.Delimiter) {
                    bodyStx$1863.expose();
                    var fv$1865 = _$1766.filter(freeVarsInPattern$1776(bodyStx$1863.token.inner), function (pat$1872) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1854.hasOwnProperty(pat$1872);
                        });
                    var restrictedEnv$1866 = [];
                    var nonScalar$1867 = _$1766.find(fv$1865, function (pat$1873) {
                            return env$1854[pat$1873].level > 0;
                        });
                    parser$1768.assert(typeof nonScalar$1867 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1868 = env$1854[nonScalar$1867].match.length;
                    var sameLength$1869 = _$1766.all(fv$1865, function (pat$1874) {
                            return env$1854[pat$1874].level === 0 || env$1854[pat$1874].match.length === repeatLength$1868;
                        });
                    parser$1768.assert(sameLength$1869, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1866 = _$1766.map(_$1766.range(repeatLength$1868), function (idx$1875) {
                        var renv$1876 = {};
                        _$1766.each(fv$1865, function (pat$1877) {
                            if (env$1854[pat$1877].level === 0) {
                                // copy scalars over
                                renv$1876[pat$1877] = env$1854[pat$1877];
                            } else {
                                // grab the match at this index
                                renv$1876[pat$1877] = env$1854[pat$1877].match[idx$1875];
                            }
                        });
                        return renv$1876;
                    });
                    var transcribed$1870 = _$1766.map(restrictedEnv$1866, function (renv$1878) {
                            if (bodyStx$1863.group) {
                                return transcribe$1788(bodyStx$1863.token.inner, macroNameStx$1853, renv$1878);
                            } else {
                                var newBody$1879 = syntaxFromToken$1772(_$1766.clone(bodyStx$1863.token), bodyStx$1863);
                                newBody$1879.token.inner = transcribe$1788(bodyStx$1863.token.inner, macroNameStx$1853, renv$1878);
                                return newBody$1879;
                            }
                        });
                    var joined$1871;
                    if (bodyStx$1863.group) {
                        joined$1871 = joinSyntaxArr$1775(transcribed$1870, bodyStx$1863.separator);
                    } else {
                        joined$1871 = joinSyntax$1774(transcribed$1870, bodyStx$1863.separator);
                    }
                    return acc$1862.concat(joined$1871);
                }
                if (!env$1854[bodyStx$1863.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1863.token.value + ' is not bound for the template');
                } else if (env$1854[bodyStx$1863.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1863.token.value + ' does not match in the template');
                }
                return acc$1862.concat(joinRepeatedMatch$1781(env$1854[bodyStx$1863.token.value].match, bodyStx$1863.separator));
            } else {
                if (bodyStx$1863.token.type === parser$1768.Token.Delimiter) {
                    bodyStx$1863.expose();
                    var newBody$1880 = syntaxFromToken$1772(_$1766.clone(bodyStx$1863.token), macroBody$1852);
                    newBody$1880.token.inner = transcribe$1788(bodyStx$1863.token.inner, macroNameStx$1853, env$1854);
                    return acc$1862.concat([newBody$1880]);
                }
                if (isPatternVar$1780(bodyStx$1863) && Object.prototype.hasOwnProperty.bind(env$1854)(bodyStx$1863.token.value)) {
                    if (!env$1854[bodyStx$1863.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1863.token.value + ' is not bound for the template');
                    } else if (env$1854[bodyStx$1863.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1863.token.value + ' does not match in the template');
                    }
                    return acc$1862.concat(env$1854[bodyStx$1863.token.value].match);
                }
                return acc$1862.concat([bodyStx$1863]);
            }
        }, []).value();
    }
    exports$1765.loadPattern = loadPattern$1784;
    exports$1765.matchPatterns = matchPatterns$1786;
    exports$1765.transcribe = transcribe$1788;
    exports$1765.matchPatternClass = matchPatternClass$1785;
    exports$1765.takeLineContext = takeLineContext$1782;
    exports$1765.takeLine = takeLine$1783;
}));
//# sourceMappingURL=patterns.js.map