(function (root$1769, factory$1770) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1770(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1770);
    }
}(this, function (exports$1771, _$1772, es6$1773, parser$1774, expander$1775, syntax$1776) {
    var get_expression$1777 = expander$1775.get_expression;
    var syntaxFromToken$1778 = syntax$1776.syntaxFromToken;
    var makePunc$1779 = syntax$1776.makePunc;
    var joinSyntax$1780 = syntax$1776.joinSyntax;
    var joinSyntaxArr$1781 = syntax$1776.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1782(pattern$1795) {
        var fv$1796 = [];
        _$1772.each(pattern$1795, function (pat$1797) {
            if (isPatternVar$1786(pat$1797)) {
                fv$1796.push(pat$1797.token.value);
            } else if (pat$1797.token.type === parser$1774.Token.Delimiter) {
                fv$1796 = fv$1796.concat(freeVarsInPattern$1782(pat$1797.token.inner));
            }
        });
        return fv$1796;
    }
    function typeIsLiteral$1783(type$1798) {
        return type$1798 === parser$1774.Token.NullLiteral || type$1798 === parser$1774.Token.NumericLiteral || type$1798 === parser$1774.Token.StringLiteral || type$1798 === parser$1774.Token.RegexLiteral || type$1798 === parser$1774.Token.BooleanLiteral;
    }
    function containsPatternVar$1784(patterns$1799) {
        return _$1772.any(patterns$1799, function (pat$1800) {
            if (pat$1800.token.type === parser$1774.Token.Delimiter) {
                return containsPatternVar$1784(pat$1800.token.inner);
            }
            return isPatternVar$1786(pat$1800);
        });
    }
    function delimIsSeparator$1785(delim$1801) {
        return delim$1801 && delim$1801.token && delim$1801.token.type === parser$1774.Token.Delimiter && delim$1801.token.value === '()' && delim$1801.token.inner.length === 1 && delim$1801.token.inner[0].token.type !== parser$1774.Token.Delimiter && !containsPatternVar$1784(delim$1801.token.inner);
    }
    function isPatternVar$1786(stx$1802) {
        return stx$1802.token.value[0] === '$' && stx$1802.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1787(tojoin$1803, punc$1804) {
        return _$1772.reduce(_$1772.rest(tojoin$1803, 1), function (acc$1805, join$1806) {
            if (punc$1804 === ' ') {
                return acc$1805.concat(join$1806.match);
            }
            return acc$1805.concat(makePunc$1779(punc$1804, _$1772.first(join$1806.match)), join$1806.match);
        }, _$1772.first(tojoin$1803).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1788(from$1807, to$1808) {
        return _$1772.map(to$1808, function (stx$1809) {
            return takeLine$1789(from$1807, stx$1809);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1789(from$1810, to$1811) {
        if (to$1811.token.type === parser$1774.Token.Delimiter) {
            var next$1812;
            if (from$1810.token.type === parser$1774.Token.Delimiter) {
                next$1812 = syntaxFromToken$1778({
                    type: parser$1774.Token.Delimiter,
                    value: to$1811.token.value,
                    inner: takeLineContext$1788(from$1810, to$1811.token.inner),
                    startRange: from$1810.token.startRange,
                    endRange: from$1810.token.endRange,
                    startLineNumber: from$1810.token.startLineNumber,
                    startLineStart: from$1810.token.startLineStart,
                    endLineNumber: from$1810.token.endLineNumber,
                    endLineStart: from$1810.token.endLineStart,
                    sm_startLineNumber: to$1811.token.startLineNumber,
                    sm_endLineNumber: to$1811.token.endLineNumber,
                    sm_startLineStart: to$1811.token.startLineStart,
                    sm_endLineStart: to$1811.token.endLineStart,
                    sm_startRange: to$1811.token.startRange,
                    sm_endRange: to$1811.token.endRange
                }, to$1811);
            } else {
                next$1812 = syntaxFromToken$1778({
                    type: parser$1774.Token.Delimiter,
                    value: to$1811.token.value,
                    inner: takeLineContext$1788(from$1810, to$1811.token.inner),
                    startRange: from$1810.token.range,
                    endRange: from$1810.token.range,
                    startLineNumber: from$1810.token.lineNumber,
                    startLineStart: from$1810.token.lineStart,
                    endLineNumber: from$1810.token.lineNumber,
                    endLineStart: from$1810.token.lineStart,
                    sm_startLineNumber: to$1811.token.startLineNumber,
                    sm_endLineNumber: to$1811.token.endLineNumber,
                    sm_startLineStart: to$1811.token.startLineStart,
                    sm_endLineStart: to$1811.token.endLineStart,
                    sm_startRange: to$1811.token.startRange,
                    sm_endRange: to$1811.token.endRange
                }, to$1811);
            }
        } else {
            if (from$1810.token.type === parser$1774.Token.Delimiter) {
                next$1812 = syntaxFromToken$1778({
                    value: to$1811.token.value,
                    type: to$1811.token.type,
                    lineNumber: from$1810.token.startLineNumber,
                    lineStart: from$1810.token.startLineStart,
                    range: from$1810.token.startRange,
                    sm_lineNumber: to$1811.token.lineNumber,
                    sm_lineStart: to$1811.token.lineStart,
                    sm_range: to$1811.token.range
                }, to$1811);
            } else {
                next$1812 = syntaxFromToken$1778({
                    value: to$1811.token.value,
                    type: to$1811.token.type,
                    lineNumber: from$1810.token.lineNumber,
                    lineStart: from$1810.token.lineStart,
                    range: from$1810.token.range,
                    sm_lineNumber: to$1811.token.lineNumber,
                    sm_lineStart: to$1811.token.lineStart,
                    sm_range: to$1811.token.range
                }, to$1811);
            }
        }
        if (to$1811.token.leadingComments) {
            next$1812.token.leadingComments = to$1811.token.leadingComments;
        }
        if (to$1811.token.trailingComments) {
            next$1812.token.trailingComments = to$1811.token.trailingComments;
        }
        return next$1812;
    }
    function loadPattern$1790(patterns$1813) {
        return _$1772.chain(patterns$1813).reduce(function (acc$1814, patStx$1815, idx$1816) {
            var last$1817 = patterns$1813[idx$1816 - 1];
            var lastLast$1818 = patterns$1813[idx$1816 - 2];
            var next$1819 = patterns$1813[idx$1816 + 1];
            var nextNext$1820 = patterns$1813[idx$1816 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1815.token.value === ':') {
                if (last$1817 && isPatternVar$1786(last$1817) && !isPatternVar$1786(next$1819)) {
                    return acc$1814;
                }
            }
            if (last$1817 && last$1817.token.value === ':') {
                if (lastLast$1818 && isPatternVar$1786(lastLast$1818) && !isPatternVar$1786(patStx$1815)) {
                    return acc$1814;
                }
            }
            // skip over $
            if (patStx$1815.token.value === '$' && next$1819 && next$1819.token.type === parser$1774.Token.Delimiter) {
                return acc$1814;
            }
            if (isPatternVar$1786(patStx$1815)) {
                if (next$1819 && next$1819.token.value === ':' && !isPatternVar$1786(nextNext$1820)) {
                    if (typeof nextNext$1820 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1815.class = nextNext$1820.token.value;
                } else {
                    patStx$1815.class = 'token';
                }
            } else if (patStx$1815.token.type === parser$1774.Token.Delimiter) {
                if (last$1817 && last$1817.token.value === '$') {
                    patStx$1815.class = 'pattern_group';
                }
                patStx$1815.token.inner = loadPattern$1790(patStx$1815.token.inner);
            } else {
                patStx$1815.class = 'pattern_literal';
            }
            return acc$1814.concat(patStx$1815);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1821, patStx$1822, idx$1823, patterns$1824) {
            var separator$1825 = patStx$1822.separator || ' ';
            var repeat$1826 = patStx$1822.repeat || false;
            var next$1827 = patterns$1824[idx$1823 + 1];
            var nextNext$1828 = patterns$1824[idx$1823 + 2];
            if (next$1827 && next$1827.token.value === '...') {
                repeat$1826 = true;
                separator$1825 = ' ';
            } else if (delimIsSeparator$1785(next$1827) && nextNext$1828 && nextNext$1828.token.value === '...') {
                repeat$1826 = true;
                parser$1774.assert(next$1827.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1825 = next$1827.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1822.token.value === '...' || delimIsSeparator$1785(patStx$1822) && next$1827 && next$1827.token.value === '...') {
                return acc$1821;
            }
            patStx$1822.repeat = repeat$1826;
            patStx$1822.separator = separator$1825;
            return acc$1821.concat(patStx$1822);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1791(patternClass$1829, stx$1830, env$1831) {
        var result$1832, rest$1833;
        // pattern has no parse class
        if (patternClass$1829 === 'token' && stx$1830[0] && stx$1830[0].token.type !== parser$1774.Token.EOF) {
            result$1832 = [stx$1830[0]];
            rest$1833 = stx$1830.slice(1);
        } else if (patternClass$1829 === 'lit' && stx$1830[0] && typeIsLiteral$1783(stx$1830[0].token.type)) {
            result$1832 = [stx$1830[0]];
            rest$1833 = stx$1830.slice(1);
        } else if (patternClass$1829 === 'ident' && stx$1830[0] && stx$1830[0].token.type === parser$1774.Token.Identifier) {
            result$1832 = [stx$1830[0]];
            rest$1833 = stx$1830.slice(1);
        } else if (stx$1830.length > 0 && patternClass$1829 === 'VariableStatement') {
            var match$1834 = expander$1775.enforest(stx$1830, expander$1775.makeExpanderContext({ env: env$1831 }));
            if (match$1834.result && match$1834.result.hasPrototype(expander$1775.VariableStatement)) {
                result$1832 = match$1834.result.destruct(false);
                rest$1833 = match$1834.rest;
            } else {
                result$1832 = null;
                rest$1833 = stx$1830;
            }
        } else if (stx$1830.length > 0 && patternClass$1829 === 'expr') {
            var match$1834 = expander$1775.get_expression(stx$1830, expander$1775.makeExpanderContext({ env: env$1831 }));
            if (match$1834.result === null || !match$1834.result.hasPrototype(expander$1775.Expr)) {
                result$1832 = null;
                rest$1833 = stx$1830;
            } else {
                result$1832 = match$1834.result.destruct(false);
                rest$1833 = match$1834.rest;
            }
        } else {
            result$1832 = null;
            rest$1833 = stx$1830;
        }
        return {
            result: result$1832,
            rest: rest$1833
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1792(patterns$1835, stx$1836, env$1837, topLevel$1838) {
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
        topLevel$1838 = topLevel$1838 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1839 = [];
        var patternEnv$1840 = {};
        var match$1841;
        var pattern$1842;
        var rest$1843 = stx$1836;
        var success$1844 = true;
        patternLoop:
            for (var i$1845 = 0; i$1845 < patterns$1835.length; i$1845++) {
                if (success$1844 === false) {
                    break;
                }
                pattern$1842 = patterns$1835[i$1845];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1842.repeat && i$1845 + 1 < patterns$1835.length) {
                        var restMatch$1846 = matchPatterns$1792(patterns$1835.slice(i$1845 + 1), rest$1843, env$1837, topLevel$1838);
                        if (restMatch$1846.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1841 = matchPattern$1793(pattern$1842, [], env$1837, patternEnv$1840);
                            patternEnv$1840 = _$1772.extend(restMatch$1846.patternEnv, match$1841.patternEnv);
                            rest$1843 = restMatch$1846.rest;
                            break patternLoop;
                        }
                    }
                    match$1841 = matchPattern$1793(pattern$1842, rest$1843, env$1837, patternEnv$1840);
                    if (!match$1841.success && pattern$1842.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1841.success) {
                        success$1844 = false;
                        break;
                    }
                    rest$1843 = match$1841.rest;
                    patternEnv$1840 = match$1841.patternEnv;
                    if (success$1844 && !(topLevel$1838 || pattern$1842.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1845 == patterns$1835.length - 1 && rest$1843.length !== 0) {
                            success$1844 = false;
                            break;
                        }
                    }
                    if (pattern$1842.repeat && success$1844) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1842.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1843[0] && rest$1843[0].token.value === pattern$1842.separator) {
                            // more tokens and the next token matches the separator
                            rest$1843 = rest$1843.slice(1);
                        } else if (pattern$1842.separator !== ' ' && rest$1843.length > 0 && i$1845 === patterns$1835.length - 1 && topLevel$1838 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1844 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1842.repeat && success$1844 && rest$1843.length > 0);
            }
        return {
            success: success$1844,
            rest: rest$1843,
            patternEnv: patternEnv$1840
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
    function matchPattern$1793(pattern$1847, stx$1848, env$1849, patternEnv$1850) {
        var subMatch$1851;
        var match$1852, matchEnv$1853;
        var rest$1854;
        var success$1855;
        if (typeof pattern$1847.inner !== 'undefined') {
            if (pattern$1847.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1851 = matchPatterns$1792(pattern$1847.inner, stx$1848, env$1849, true);
                rest$1854 = subMatch$1851.rest;
            } else if (stx$1848[0] && stx$1848[0].token.type === parser$1774.Token.Delimiter && stx$1848[0].token.value === pattern$1847.value) {
                stx$1848[0].expose();
                if (pattern$1847.inner.length === 0 && stx$1848[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1848,
                        patternEnv: patternEnv$1850
                    };
                }
                subMatch$1851 = matchPatterns$1792(pattern$1847.inner, stx$1848[0].token.inner, env$1849, false);
                rest$1854 = stx$1848.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1848,
                    patternEnv: patternEnv$1850
                };
            }
            success$1855 = subMatch$1851.success;
            // merge the subpattern matches with the current pattern environment
            _$1772.keys(subMatch$1851.patternEnv).forEach(function (patternKey$1856) {
                if (pattern$1847.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1857 = subMatch$1851.patternEnv[patternKey$1856].level + 1;
                    if (patternEnv$1850[patternKey$1856]) {
                        patternEnv$1850[patternKey$1856].level = nextLevel$1857;
                        patternEnv$1850[patternKey$1856].match.push(subMatch$1851.patternEnv[patternKey$1856]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1850[patternKey$1856] = {
                            level: nextLevel$1857,
                            match: [subMatch$1851.patternEnv[patternKey$1856]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1850[patternKey$1856] = subMatch$1851.patternEnv[patternKey$1856];
                }
            });
        } else {
            if (pattern$1847.class === 'pattern_literal') {
                // wildcard
                if (stx$1848[0] && pattern$1847.value === '_') {
                    success$1855 = true;
                    rest$1854 = stx$1848.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1848[0] && pattern$1847.value === stx$1848[0].token.value) {
                    success$1855 = true;
                    rest$1854 = stx$1848.slice(1);
                } else {
                    success$1855 = false;
                    rest$1854 = stx$1848;
                }
            } else {
                match$1852 = matchPatternClass$1791(pattern$1847.class, stx$1848, env$1849);
                success$1855 = match$1852.result !== null;
                rest$1854 = match$1852.rest;
                matchEnv$1853 = {
                    level: 0,
                    match: match$1852.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1847.repeat) {
                    if (patternEnv$1850[pattern$1847.value]) {
                        patternEnv$1850[pattern$1847.value].match.push(matchEnv$1853);
                    } else {
                        // initialize if necessary
                        patternEnv$1850[pattern$1847.value] = {
                            level: 1,
                            match: [matchEnv$1853]
                        };
                    }
                } else {
                    patternEnv$1850[pattern$1847.value] = matchEnv$1853;
                }
            }
        }
        return {
            success: success$1855,
            rest: rest$1854,
            patternEnv: patternEnv$1850
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1794(macroBody$1858, macroNameStx$1859, env$1860) {
        return _$1772.chain(macroBody$1858).reduce(function (acc$1861, bodyStx$1862, idx$1863, original$1864) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1865 = original$1864[idx$1863 - 1];
            var next$1866 = original$1864[idx$1863 + 1];
            var nextNext$1867 = original$1864[idx$1863 + 2];
            // drop `...`
            if (bodyStx$1862.token.value === '...') {
                return acc$1861;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1785(bodyStx$1862) && next$1866 && next$1866.token.value === '...') {
                return acc$1861;
            }
            // skip the $ in $(...)
            if (bodyStx$1862.token.value === '$' && next$1866 && next$1866.token.type === parser$1774.Token.Delimiter && next$1866.token.value === '()') {
                return acc$1861;
            }
            // mark $[...] as a literal
            if (bodyStx$1862.token.value === '$' && next$1866 && next$1866.token.type === parser$1774.Token.Delimiter && next$1866.token.value === '[]') {
                next$1866.literal = true;
                return acc$1861;
            }
            if (bodyStx$1862.token.type === parser$1774.Token.Delimiter && bodyStx$1862.token.value === '()' && last$1865 && last$1865.token.value === '$') {
                bodyStx$1862.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1862.literal === true) {
                parser$1774.assert(bodyStx$1862.token.type === parser$1774.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1861.concat(bodyStx$1862.token.inner);
            }
            if (next$1866 && next$1866.token.value === '...') {
                bodyStx$1862.repeat = true;
                bodyStx$1862.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1785(next$1866) && nextNext$1867 && nextNext$1867.token.value === '...') {
                bodyStx$1862.repeat = true;
                bodyStx$1862.separator = next$1866.token.inner[0].token.value;
            }
            return acc$1861.concat(bodyStx$1862);
        }, []).reduce(function (acc$1868, bodyStx$1869, idx$1870) {
            // then do the actual transcription
            if (bodyStx$1869.repeat) {
                if (bodyStx$1869.token.type === parser$1774.Token.Delimiter) {
                    bodyStx$1869.expose();
                    var fv$1871 = _$1772.filter(freeVarsInPattern$1782(bodyStx$1869.token.inner), function (pat$1878) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1860.hasOwnProperty(pat$1878);
                        });
                    var restrictedEnv$1872 = [];
                    var nonScalar$1873 = _$1772.find(fv$1871, function (pat$1879) {
                            return env$1860[pat$1879].level > 0;
                        });
                    parser$1774.assert(typeof nonScalar$1873 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1874 = env$1860[nonScalar$1873].match.length;
                    var sameLength$1875 = _$1772.all(fv$1871, function (pat$1880) {
                            return env$1860[pat$1880].level === 0 || env$1860[pat$1880].match.length === repeatLength$1874;
                        });
                    parser$1774.assert(sameLength$1875, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1872 = _$1772.map(_$1772.range(repeatLength$1874), function (idx$1881) {
                        var renv$1882 = {};
                        _$1772.each(fv$1871, function (pat$1883) {
                            if (env$1860[pat$1883].level === 0) {
                                // copy scalars over
                                renv$1882[pat$1883] = env$1860[pat$1883];
                            } else {
                                // grab the match at this index
                                renv$1882[pat$1883] = env$1860[pat$1883].match[idx$1881];
                            }
                        });
                        return renv$1882;
                    });
                    var transcribed$1876 = _$1772.map(restrictedEnv$1872, function (renv$1884) {
                            if (bodyStx$1869.group) {
                                return transcribe$1794(bodyStx$1869.token.inner, macroNameStx$1859, renv$1884);
                            } else {
                                var newBody$1885 = syntaxFromToken$1778(_$1772.clone(bodyStx$1869.token), bodyStx$1869);
                                newBody$1885.token.inner = transcribe$1794(bodyStx$1869.token.inner, macroNameStx$1859, renv$1884);
                                return newBody$1885;
                            }
                        });
                    var joined$1877;
                    if (bodyStx$1869.group) {
                        joined$1877 = joinSyntaxArr$1781(transcribed$1876, bodyStx$1869.separator);
                    } else {
                        joined$1877 = joinSyntax$1780(transcribed$1876, bodyStx$1869.separator);
                    }
                    return acc$1868.concat(joined$1877);
                }
                if (!env$1860[bodyStx$1869.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1869.token.value + ' is not bound for the template');
                } else if (env$1860[bodyStx$1869.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1869.token.value + ' does not match in the template');
                }
                return acc$1868.concat(joinRepeatedMatch$1787(env$1860[bodyStx$1869.token.value].match, bodyStx$1869.separator));
            } else {
                if (bodyStx$1869.token.type === parser$1774.Token.Delimiter) {
                    bodyStx$1869.expose();
                    var newBody$1886 = syntaxFromToken$1778(_$1772.clone(bodyStx$1869.token), macroBody$1858);
                    newBody$1886.token.inner = transcribe$1794(bodyStx$1869.token.inner, macroNameStx$1859, env$1860);
                    return acc$1868.concat([newBody$1886]);
                }
                if (isPatternVar$1786(bodyStx$1869) && Object.prototype.hasOwnProperty.bind(env$1860)(bodyStx$1869.token.value)) {
                    if (!env$1860[bodyStx$1869.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1869.token.value + ' is not bound for the template');
                    } else if (env$1860[bodyStx$1869.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1869.token.value + ' does not match in the template');
                    }
                    return acc$1868.concat(takeLineContext$1788(bodyStx$1869, env$1860[bodyStx$1869.token.value].match));
                }
                return acc$1868.concat([bodyStx$1869]);
            }
        }, []).value();
    }
    exports$1771.loadPattern = loadPattern$1790;
    exports$1771.matchPatterns = matchPatterns$1792;
    exports$1771.transcribe = transcribe$1794;
    exports$1771.matchPatternClass = matchPatternClass$1791;
    exports$1771.takeLineContext = takeLineContext$1788;
    exports$1771.takeLine = takeLine$1789;
}));
//# sourceMappingURL=patterns.js.map