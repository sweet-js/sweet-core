(function (root$1664, factory$1665) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1665(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1665);
    }
}(this, function (exports$1666, _$1667, parser$1668, expander$1669, syntax$1670) {
    var get_expression$1671 = expander$1669.get_expression;
    var syntaxFromToken$1672 = syntax$1670.syntaxFromToken;
    var makePunc$1673 = syntax$1670.makePunc;
    var joinSyntax$1674 = syntax$1670.joinSyntax;
    var joinSyntaxArr$1675 = syntax$1670.joinSyntaxArr;
    var assert$1676 = syntax$1670.assert;
    var throwSyntaxError$1677 = syntax$1670.throwSyntaxError;
    var push$1678 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1679(pattern$1697) {
        var fv$1698 = [];
        _$1667.each(pattern$1697, function (pat$1699) {
            if (isPatternVar$1683(pat$1699)) {
                fv$1698.push(pat$1699.token.value);
            } else if (pat$1699.token.type === parser$1668.Token.Delimiter) {
                push$1678.apply(fv$1698, freeVarsInPattern$1679(pat$1699.token.inner));
            }
        });
        return fv$1698;
    }
    function typeIsLiteral$1680(type$1700) {
        return type$1700 === parser$1668.Token.NullLiteral || type$1700 === parser$1668.Token.NumericLiteral || type$1700 === parser$1668.Token.StringLiteral || type$1700 === parser$1668.Token.RegexLiteral || type$1700 === parser$1668.Token.BooleanLiteral;
    }
    function containsPatternVar$1681(patterns$1701) {
        return _$1667.any(patterns$1701, function (pat$1702) {
            if (pat$1702.token.type === parser$1668.Token.Delimiter) {
                return containsPatternVar$1681(pat$1702.token.inner);
            }
            return isPatternVar$1683(pat$1702);
        });
    }
    function delimIsSeparator$1682(delim$1703) {
        return delim$1703 && delim$1703.token && delim$1703.token.type === parser$1668.Token.Delimiter && delim$1703.token.value === '()' && delim$1703.token.inner.length === 1 && delim$1703.token.inner[0].token.type !== parser$1668.Token.Delimiter && !containsPatternVar$1681(delim$1703.token.inner);
    }
    function isPatternVar$1683(stx$1704) {
        return stx$1704.token.value[0] === '$' && stx$1704.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1684(tojoin$1705, punc$1706) {
        return _$1667.reduce(_$1667.rest(tojoin$1705, 1), function (acc$1707, join$1708) {
            if (punc$1706 === ' ') {
                return acc$1707.concat(join$1708.match);
            }
            return acc$1707.concat(makePunc$1673(punc$1706, _$1667.first(join$1708.match)), join$1708.match);
        }, _$1667.first(tojoin$1705).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1685(from$1709, to$1710) {
        return _$1667.map(to$1710, function (stx$1711) {
            return takeLine$1686(from$1709, stx$1711);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1686(from$1712, to$1713) {
        var next$1714;
        if (to$1713.token.type === parser$1668.Token.Delimiter) {
            var sm_startLineNumber$1715 = typeof to$1713.token.sm_startLineNumber !== 'undefined' ? to$1713.token.sm_startLineNumber : to$1713.token.startLineNumber;
            var sm_endLineNumber$1716 = typeof to$1713.token.sm_endLineNumber !== 'undefined' ? to$1713.token.sm_endLineNumber : to$1713.token.endLineNumber;
            var sm_startLineStart$1717 = typeof to$1713.token.sm_startLineStart !== 'undefined' ? to$1713.token.sm_startLineStart : to$1713.token.startLineStart;
            var sm_endLineStart$1718 = typeof to$1713.token.sm_endLineStart !== 'undefined' ? to$1713.token.sm_endLineStart : to$1713.token.endLineStart;
            var sm_startRange$1719 = typeof to$1713.token.sm_startRange !== 'undefined' ? to$1713.token.sm_startRange : to$1713.token.startRange;
            var sm_endRange$1720 = typeof to$1713.token.sm_endRange !== 'undefined' ? to$1713.token.sm_endRange : to$1713.token.endRange;
            if (from$1712.token.type === parser$1668.Token.Delimiter) {
                next$1714 = syntaxFromToken$1672({
                    type: parser$1668.Token.Delimiter,
                    value: to$1713.token.value,
                    inner: takeLineContext$1685(from$1712, to$1713.token.inner),
                    startRange: from$1712.token.startRange,
                    endRange: from$1712.token.endRange,
                    startLineNumber: from$1712.token.startLineNumber,
                    startLineStart: from$1712.token.startLineStart,
                    endLineNumber: from$1712.token.endLineNumber,
                    endLineStart: from$1712.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1715,
                    sm_endLineNumber: sm_endLineNumber$1716,
                    sm_startLineStart: sm_startLineStart$1717,
                    sm_endLineStart: sm_endLineStart$1718,
                    sm_startRange: sm_startRange$1719,
                    sm_endRange: sm_endRange$1720
                }, to$1713);
            } else {
                next$1714 = syntaxFromToken$1672({
                    type: parser$1668.Token.Delimiter,
                    value: to$1713.token.value,
                    inner: takeLineContext$1685(from$1712, to$1713.token.inner),
                    startRange: from$1712.token.range,
                    endRange: from$1712.token.range,
                    startLineNumber: from$1712.token.lineNumber,
                    startLineStart: from$1712.token.lineStart,
                    endLineNumber: from$1712.token.lineNumber,
                    endLineStart: from$1712.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1715,
                    sm_endLineNumber: sm_endLineNumber$1716,
                    sm_startLineStart: sm_startLineStart$1717,
                    sm_endLineStart: sm_endLineStart$1718,
                    sm_startRange: sm_startRange$1719,
                    sm_endRange: sm_endRange$1720
                }, to$1713);
            }
        } else {
            var sm_lineNumber$1721 = typeof to$1713.token.sm_lineNumber !== 'undefined' ? to$1713.token.sm_lineNumber : to$1713.token.lineNumber;
            var sm_lineStart$1722 = typeof to$1713.token.sm_lineStart !== 'undefined' ? to$1713.token.sm_lineStart : to$1713.token.lineStart;
            var sm_range$1723 = typeof to$1713.token.sm_range !== 'undefined' ? to$1713.token.sm_range : to$1713.token.range;
            if (from$1712.token.type === parser$1668.Token.Delimiter) {
                next$1714 = syntaxFromToken$1672({
                    value: to$1713.token.value,
                    type: to$1713.token.type,
                    lineNumber: from$1712.token.startLineNumber,
                    lineStart: from$1712.token.startLineStart,
                    range: from$1712.token.startRange,
                    sm_lineNumber: sm_lineNumber$1721,
                    sm_lineStart: sm_lineStart$1722,
                    sm_range: sm_range$1723
                }, to$1713);
            } else {
                next$1714 = syntaxFromToken$1672({
                    value: to$1713.token.value,
                    type: to$1713.token.type,
                    lineNumber: from$1712.token.lineNumber,
                    lineStart: from$1712.token.lineStart,
                    range: from$1712.token.range,
                    sm_lineNumber: sm_lineNumber$1721,
                    sm_lineStart: sm_lineStart$1722,
                    sm_range: sm_range$1723
                }, to$1713);
            }
        }
        if (to$1713.token.leadingComments) {
            next$1714.token.leadingComments = to$1713.token.leadingComments;
        }
        if (to$1713.token.trailingComments) {
            next$1714.token.trailingComments = to$1713.token.trailingComments;
        }
        return next$1714;
    }
    function reversePattern$1687(patterns$1724) {
        var len$1725 = patterns$1724.length;
        var pat$1726;
        return _$1667.reduceRight(patterns$1724, function (acc$1727, pat$1726) {
            if (pat$1726.class === 'pattern_group') {
                pat$1726.token.inner = reversePattern$1687(pat$1726.token.inner);
            }
            if (pat$1726.repeat) {
                pat$1726.leading = !pat$1726.leading;
            }
            acc$1727.push(pat$1726);
            return acc$1727;
        }, []);
    }
    function loadLiteralGroup$1688(patterns$1729) {
        _$1667.forEach(patterns$1729, function (patStx$1730) {
            if (patStx$1730.token.type === parser$1668.Token.Delimiter) {
                patStx$1730.token.inner = loadLiteralGroup$1688(patStx$1730.token.inner);
            } else {
                patStx$1730.class = 'pattern_literal';
            }
        });
        return patterns$1729;
    }
    function loadPattern$1689(patterns$1731, reverse$1732) {
        var patts$1733 = _$1667.chain(patterns$1731).reduce(function (acc$1734, patStx$1735, idx$1736) {
                var last$1737 = patterns$1731[idx$1736 - 1];
                var lastLast$1738 = patterns$1731[idx$1736 - 2];
                var next$1739 = patterns$1731[idx$1736 + 1];
                var nextNext$1740 = patterns$1731[idx$1736 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1735.token.value === ':') {
                    if (last$1737 && isPatternVar$1683(last$1737) && !isPatternVar$1683(next$1739)) {
                        return acc$1734;
                    }
                }
                if (last$1737 && last$1737.token.value === ':') {
                    if (lastLast$1738 && isPatternVar$1683(lastLast$1738) && !isPatternVar$1683(patStx$1735)) {
                        return acc$1734;
                    }
                }
                // skip over $
                if (patStx$1735.token.value === '$' && next$1739 && next$1739.token.type === parser$1668.Token.Delimiter) {
                    return acc$1734;
                }
                if (isPatternVar$1683(patStx$1735)) {
                    if (next$1739 && next$1739.token.value === ':' && !isPatternVar$1683(nextNext$1740)) {
                        if (typeof nextNext$1740 === 'undefined') {
                            throwSyntaxError$1677('patterns', 'expecting a pattern class following a `:`', next$1739);
                        }
                        patStx$1735.class = nextNext$1740.token.value;
                    } else {
                        patStx$1735.class = 'token';
                    }
                } else if (patStx$1735.token.type === parser$1668.Token.Delimiter) {
                    if (last$1737 && last$1737.token.value === '$') {
                        patStx$1735.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1735.class === 'pattern_group' && patStx$1735.token.value === '[]') {
                        patStx$1735.token.inner = loadLiteralGroup$1688(patStx$1735.token.inner);
                    } else {
                        patStx$1735.token.inner = loadPattern$1689(patStx$1735.token.inner);
                    }
                } else {
                    patStx$1735.class = 'pattern_literal';
                }
                acc$1734.push(patStx$1735);
                return acc$1734;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1741, patStx$1742, idx$1743, patterns$1744) {
                var separator$1745 = patStx$1742.separator || ' ';
                var repeat$1746 = patStx$1742.repeat || false;
                var next$1747 = patterns$1744[idx$1743 + 1];
                var nextNext$1748 = patterns$1744[idx$1743 + 2];
                if (next$1747 && next$1747.token.value === '...') {
                    repeat$1746 = true;
                    separator$1745 = ' ';
                } else if (delimIsSeparator$1682(next$1747) && nextNext$1748 && nextNext$1748.token.value === '...') {
                    repeat$1746 = true;
                    assert$1676(next$1747.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1745 = next$1747.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1742.token.value === '...' || delimIsSeparator$1682(patStx$1742) && next$1747 && next$1747.token.value === '...') {
                    return acc$1741;
                }
                patStx$1742.repeat = repeat$1746;
                patStx$1742.separator = separator$1745;
                acc$1741.push(patStx$1742);
                return acc$1741;
            }, []).value();
        return reverse$1732 ? reversePattern$1687(patts$1733) : patts$1733;
    }
    function cachedTermMatch$1690(stx$1749, term$1750) {
        var res$1751 = [];
        var i$1752 = 0;
        while (stx$1749[i$1752] && stx$1749[i$1752].term === term$1750) {
            res$1751.unshift(stx$1749[i$1752]);
            i$1752++;
        }
        return {
            result: term$1750,
            destructed: res$1751,
            rest: stx$1749.slice(res$1751.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1691(patternClass$1753, stx$1754, env$1755) {
        var result$1756, rest$1757, match$1758;
        // pattern has no parse class
        if (patternClass$1753 === 'token' && stx$1754[0] && stx$1754[0].token.type !== parser$1668.Token.EOF) {
            result$1756 = [stx$1754[0]];
            rest$1757 = stx$1754.slice(1);
        } else if (patternClass$1753 === 'lit' && stx$1754[0] && typeIsLiteral$1680(stx$1754[0].token.type)) {
            result$1756 = [stx$1754[0]];
            rest$1757 = stx$1754.slice(1);
        } else if (patternClass$1753 === 'ident' && stx$1754[0] && stx$1754[0].token.type === parser$1668.Token.Identifier) {
            result$1756 = [stx$1754[0]];
            rest$1757 = stx$1754.slice(1);
        } else if (stx$1754.length > 0 && patternClass$1753 === 'VariableStatement') {
            match$1758 = stx$1754[0].term ? cachedTermMatch$1690(stx$1754, stx$1754[0].term) : expander$1669.enforest(stx$1754, expander$1669.makeExpanderContext({ env: env$1755 }));
            if (match$1758.result && match$1758.result.hasPrototype(expander$1669.VariableStatement)) {
                result$1756 = match$1758.destructed || match$1758.result.destruct(false);
                rest$1757 = match$1758.rest;
            } else {
                result$1756 = null;
                rest$1757 = stx$1754;
            }
        } else if (stx$1754.length > 0 && patternClass$1753 === 'expr') {
            match$1758 = stx$1754[0].term ? cachedTermMatch$1690(stx$1754, stx$1754[0].term) : expander$1669.get_expression(stx$1754, expander$1669.makeExpanderContext({ env: env$1755 }));
            if (match$1758.result === null || !match$1758.result.hasPrototype(expander$1669.Expr)) {
                result$1756 = null;
                rest$1757 = stx$1754;
            } else {
                result$1756 = match$1758.destructed || match$1758.result.destruct(false);
                rest$1757 = match$1758.rest;
            }
        } else {
            result$1756 = null;
            rest$1757 = stx$1754;
        }
        return {
            result: result$1756,
            rest: rest$1757
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1692(patterns$1759, stx$1760, env$1761, topLevel$1762) {
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
        topLevel$1762 = topLevel$1762 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1763 = [];
        var patternEnv$1764 = {};
        var match$1765;
        var pattern$1766;
        var rest$1767 = stx$1760;
        var success$1768 = true;
        var inLeading$1769;
        patternLoop:
            for (var i$1770 = 0; i$1770 < patterns$1759.length; i$1770++) {
                if (success$1768 === false) {
                    break;
                }
                pattern$1766 = patterns$1759[i$1770];
                inLeading$1769 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1766.repeat && i$1770 + 1 < patterns$1759.length) {
                        var restMatch$1771 = matchPatterns$1692(patterns$1759.slice(i$1770 + 1), rest$1767, env$1761, topLevel$1762);
                        if (restMatch$1771.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1765 = matchPattern$1693(pattern$1766, [], env$1761, patternEnv$1764, topLevel$1762);
                            patternEnv$1764 = _$1667.extend(restMatch$1771.patternEnv, match$1765.patternEnv);
                            rest$1767 = restMatch$1771.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1766.repeat && pattern$1766.leading && pattern$1766.separator !== ' ') {
                        if (rest$1767[0].token.value === pattern$1766.separator) {
                            if (!inLeading$1769) {
                                inLeading$1769 = true;
                            }
                            rest$1767 = rest$1767.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1769) {
                                success$1768 = false;
                                break;
                            }
                        }
                    }
                    match$1765 = matchPattern$1693(pattern$1766, rest$1767, env$1761, patternEnv$1764, topLevel$1762);
                    if (!match$1765.success && pattern$1766.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1765.success) {
                        success$1768 = false;
                        break;
                    }
                    rest$1767 = match$1765.rest;
                    patternEnv$1764 = match$1765.patternEnv;
                    if (success$1768 && !(topLevel$1762 || pattern$1766.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1770 == patterns$1759.length - 1 && rest$1767.length !== 0) {
                            success$1768 = false;
                            break;
                        }
                    }
                    if (pattern$1766.repeat && !pattern$1766.leading && success$1768) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1766.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1767[0] && rest$1767[0].token.value === pattern$1766.separator) {
                            // more tokens and the next token matches the separator
                            rest$1767 = rest$1767.slice(1);
                        } else if (pattern$1766.separator !== ' ' && rest$1767.length > 0 && i$1770 === patterns$1759.length - 1 && topLevel$1762 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1768 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1766.repeat && success$1768 && rest$1767.length > 0);
            }
        var result$1763;
        if (success$1768) {
            result$1763 = rest$1767.length ? stx$1760.slice(0, -rest$1767.length) : stx$1760;
        } else {
            result$1763 = [];
        }
        return {
            success: success$1768,
            result: result$1763,
            rest: rest$1767,
            patternEnv: patternEnv$1764
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
    function matchPattern$1693(pattern$1772, stx$1773, env$1774, patternEnv$1775, topLevel$1776) {
        var subMatch$1777;
        var match$1778, matchEnv$1779;
        var rest$1780;
        var success$1781;
        if (typeof pattern$1772.inner !== 'undefined') {
            if (pattern$1772.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1777 = matchPatterns$1692(pattern$1772.inner, stx$1773, env$1774, true);
                rest$1780 = subMatch$1777.rest;
            } else if (stx$1773[0] && stx$1773[0].token.type === parser$1668.Token.Delimiter && stx$1773[0].token.value === pattern$1772.value) {
                stx$1773[0].expose();
                if (pattern$1772.inner.length === 0 && stx$1773[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1773,
                        patternEnv: patternEnv$1775
                    };
                }
                subMatch$1777 = matchPatterns$1692(pattern$1772.inner, stx$1773[0].token.inner, env$1774, false);
                rest$1780 = stx$1773.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1773,
                    patternEnv: patternEnv$1775
                };
            }
            success$1781 = subMatch$1777.success;
            // merge the subpattern matches with the current pattern environment
            _$1667.keys(subMatch$1777.patternEnv).forEach(function (patternKey$1782) {
                if (pattern$1772.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1783 = subMatch$1777.patternEnv[patternKey$1782].level + 1;
                    if (patternEnv$1775[patternKey$1782]) {
                        patternEnv$1775[patternKey$1782].level = nextLevel$1783;
                        patternEnv$1775[patternKey$1782].match.push(subMatch$1777.patternEnv[patternKey$1782]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1775[patternKey$1782] = {
                            level: nextLevel$1783,
                            match: [subMatch$1777.patternEnv[patternKey$1782]],
                            topLevel: topLevel$1776
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1775[patternKey$1782] = subMatch$1777.patternEnv[patternKey$1782];
                }
            });
        } else {
            if (pattern$1772.class === 'pattern_literal') {
                // wildcard
                if (stx$1773[0] && pattern$1772.value === '_') {
                    success$1781 = true;
                    rest$1780 = stx$1773.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1773[0] && pattern$1772.value === stx$1773[0].token.value) {
                    success$1781 = true;
                    rest$1780 = stx$1773.slice(1);
                } else {
                    success$1781 = false;
                    rest$1780 = stx$1773;
                }
            } else {
                match$1778 = matchPatternClass$1691(pattern$1772.class, stx$1773, env$1774);
                success$1781 = match$1778.result !== null;
                rest$1780 = match$1778.rest;
                matchEnv$1779 = {
                    level: 0,
                    match: match$1778.result,
                    topLevel: topLevel$1776
                };
                // push the match onto this value's slot in the environment
                if (pattern$1772.repeat) {
                    if (patternEnv$1775[pattern$1772.value] && success$1781) {
                        patternEnv$1775[pattern$1772.value].match.push(matchEnv$1779);
                    } else if (patternEnv$1775[pattern$1772.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1775[pattern$1772.value] = {
                            level: 1,
                            match: [matchEnv$1779],
                            topLevel: topLevel$1776
                        };
                    }
                } else {
                    patternEnv$1775[pattern$1772.value] = matchEnv$1779;
                }
            }
        }
        return {
            success: success$1781,
            rest: rest$1780,
            patternEnv: patternEnv$1775
        };
    }
    function matchLookbehind$1694(patterns$1784, stx$1785, terms$1786, env$1787) {
        var success$1788, patternEnv$1789, prevStx$1790, prevTerms$1791;
        // No lookbehind, noop.
        if (!patterns$1784.length) {
            success$1788 = true;
            patternEnv$1789 = {};
            prevStx$1790 = stx$1785;
            prevTerms$1791 = terms$1786;
        } else {
            var match$1792 = matchPatterns$1692(patterns$1784, stx$1785, env$1787, true);
            var last$1793 = match$1792.result[match$1792.result.length - 1];
            success$1788 = match$1792.success;
            patternEnv$1789 = match$1792.patternEnv;
            if (success$1788) {
                if (match$1792.rest.length) {
                    if (last$1793 && last$1793.term === match$1792.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1788 = false;
                    } else {
                        prevStx$1790 = match$1792.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1794 = 0, len$1795 = terms$1786.length; i$1794 < len$1795; i$1794++) {
                            if (terms$1786[i$1794] === prevStx$1790[0].term) {
                                prevTerms$1791 = terms$1786.slice(i$1794);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1791 = [];
                    prevStx$1790 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1667.forEach(patternEnv$1789, function (val$1796, key$1797) {
            if (val$1796.level && val$1796.match && val$1796.topLevel) {
                val$1796.match.reverse();
            }
        });
        return {
            success: success$1788,
            patternEnv: patternEnv$1789,
            prevStx: prevStx$1790,
            prevTerms: prevTerms$1791
        };
    }
    function hasMatch$1695(m$1798) {
        if (m$1798.level === 0) {
            return m$1798.match.length > 0;
        }
        return m$1798.match.every(function (m$1799) {
            return hasMatch$1695(m$1799);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1696(macroBody$1800, macroNameStx$1801, env$1802) {
        return _$1667.chain(macroBody$1800).reduce(function (acc$1803, bodyStx$1804, idx$1805, original$1806) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1807 = original$1806[idx$1805 - 1];
            var next$1808 = original$1806[idx$1805 + 1];
            var nextNext$1809 = original$1806[idx$1805 + 2];
            // drop `...`
            if (bodyStx$1804.token.value === '...') {
                return acc$1803;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1682(bodyStx$1804) && next$1808 && next$1808.token.value === '...') {
                return acc$1803;
            }
            // skip the $ in $(...)
            if (bodyStx$1804.token.value === '$' && next$1808 && next$1808.token.type === parser$1668.Token.Delimiter && next$1808.token.value === '()') {
                return acc$1803;
            }
            // mark $[...] as a literal
            if (bodyStx$1804.token.value === '$' && next$1808 && next$1808.token.type === parser$1668.Token.Delimiter && next$1808.token.value === '[]') {
                next$1808.literal = true;
                return acc$1803;
            }
            if (bodyStx$1804.token.type === parser$1668.Token.Delimiter && bodyStx$1804.token.value === '()' && last$1807 && last$1807.token.value === '$') {
                bodyStx$1804.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1804.literal === true) {
                assert$1676(bodyStx$1804.token.type === parser$1668.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1803.concat(bodyStx$1804.token.inner);
            }
            if (next$1808 && next$1808.token.value === '...') {
                bodyStx$1804.repeat = true;
                bodyStx$1804.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1682(next$1808) && nextNext$1809 && nextNext$1809.token.value === '...') {
                bodyStx$1804.repeat = true;
                bodyStx$1804.separator = next$1808.token.inner[0].token.value;
            }
            acc$1803.push(bodyStx$1804);
            return acc$1803;
        }, []).reduce(function (acc$1810, bodyStx$1811, idx$1812) {
            // then do the actual transcription
            if (bodyStx$1811.repeat) {
                if (bodyStx$1811.token.type === parser$1668.Token.Delimiter) {
                    bodyStx$1811.expose();
                    var fv$1813 = _$1667.filter(freeVarsInPattern$1679(bodyStx$1811.token.inner), function (pat$1820) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1802.hasOwnProperty(pat$1820);
                        });
                    var restrictedEnv$1814 = [];
                    var nonScalar$1815 = _$1667.find(fv$1813, function (pat$1821) {
                            return env$1802[pat$1821].level > 0;
                        });
                    assert$1676(typeof nonScalar$1815 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1816 = env$1802[nonScalar$1815].match.length;
                    var sameLength$1817 = _$1667.all(fv$1813, function (pat$1822) {
                            return env$1802[pat$1822].level === 0 || env$1802[pat$1822].match.length === repeatLength$1816;
                        });
                    assert$1676(sameLength$1817, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1667.each(_$1667.range(repeatLength$1816), function (idx$1823) {
                        var renv$1824 = {};
                        _$1667.each(fv$1813, function (pat$1826) {
                            if (env$1802[pat$1826].level === 0) {
                                // copy scalars over
                                renv$1824[pat$1826] = env$1802[pat$1826];
                            } else {
                                // grab the match at this index 
                                renv$1824[pat$1826] = env$1802[pat$1826].match[idx$1823];
                            }
                        });
                        var allHaveMatch$1825 = Object.keys(renv$1824).every(function (pat$1827) {
                                return hasMatch$1695(renv$1824[pat$1827]);
                            });
                        if (allHaveMatch$1825) {
                            restrictedEnv$1814.push(renv$1824);
                        }
                    });
                    var transcribed$1818 = _$1667.map(restrictedEnv$1814, function (renv$1828) {
                            if (bodyStx$1811.group) {
                                return transcribe$1696(bodyStx$1811.token.inner, macroNameStx$1801, renv$1828);
                            } else {
                                var newBody$1829 = syntaxFromToken$1672(_$1667.clone(bodyStx$1811.token), bodyStx$1811);
                                newBody$1829.token.inner = transcribe$1696(bodyStx$1811.token.inner, macroNameStx$1801, renv$1828);
                                return newBody$1829;
                            }
                        });
                    var joined$1819;
                    if (bodyStx$1811.group) {
                        joined$1819 = joinSyntaxArr$1675(transcribed$1818, bodyStx$1811.separator);
                    } else {
                        joined$1819 = joinSyntax$1674(transcribed$1818, bodyStx$1811.separator);
                    }
                    push$1678.apply(acc$1810, joined$1819);
                    return acc$1810;
                }
                if (!env$1802[bodyStx$1811.token.value]) {
                    throwSyntaxError$1677('patterns', 'The pattern variable is not bound for the template', bodyStx$1811);
                } else if (env$1802[bodyStx$1811.token.value].level !== 1) {
                    throwSyntaxError$1677('patterns', 'Ellipses level does not match in the template', bodyStx$1811);
                }
                push$1678.apply(acc$1810, joinRepeatedMatch$1684(env$1802[bodyStx$1811.token.value].match, bodyStx$1811.separator));
                return acc$1810;
            } else {
                if (bodyStx$1811.token.type === parser$1668.Token.Delimiter) {
                    bodyStx$1811.expose();
                    var newBody$1830 = syntaxFromToken$1672(_$1667.clone(bodyStx$1811.token), macroBody$1800);
                    newBody$1830.token.inner = transcribe$1696(bodyStx$1811.token.inner, macroNameStx$1801, env$1802);
                    acc$1810.push(newBody$1830);
                    return acc$1810;
                }
                if (isPatternVar$1683(bodyStx$1811) && Object.prototype.hasOwnProperty.bind(env$1802)(bodyStx$1811.token.value)) {
                    if (!env$1802[bodyStx$1811.token.value]) {
                        throwSyntaxError$1677('patterns', 'The pattern variable is not bound for the template', bodyStx$1811);
                    } else if (env$1802[bodyStx$1811.token.value].level !== 0) {
                        throwSyntaxError$1677('patterns', 'Ellipses level does not match in the template', bodyStx$1811);
                    }
                    push$1678.apply(acc$1810, takeLineContext$1685(bodyStx$1811, env$1802[bodyStx$1811.token.value].match));
                    return acc$1810;
                }
                acc$1810.push(syntaxFromToken$1672(_$1667.clone(bodyStx$1811.token), bodyStx$1811));
                return acc$1810;
            }
        }, []).value();
    }
    exports$1666.loadPattern = loadPattern$1689;
    exports$1666.matchPatterns = matchPatterns$1692;
    exports$1666.matchLookbehind = matchLookbehind$1694;
    exports$1666.transcribe = transcribe$1696;
    exports$1666.matchPatternClass = matchPatternClass$1691;
    exports$1666.takeLineContext = takeLineContext$1685;
    exports$1666.takeLine = takeLine$1686;
    exports$1666.typeIsLiteral = typeIsLiteral$1680;
}));
//# sourceMappingURL=patterns.js.map