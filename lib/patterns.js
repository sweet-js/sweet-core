(function (root$1668, factory$1669) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1669(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1669);
    }
}(this, function (exports$1670, _$1671, parser$1672, expander$1673, syntax$1674) {
    var get_expression$1675 = expander$1673.get_expression;
    var syntaxFromToken$1676 = syntax$1674.syntaxFromToken;
    var makePunc$1677 = syntax$1674.makePunc;
    var joinSyntax$1678 = syntax$1674.joinSyntax;
    var joinSyntaxArr$1679 = syntax$1674.joinSyntaxArr;
    var assert$1680 = syntax$1674.assert;
    var throwSyntaxError$1681 = syntax$1674.throwSyntaxError;
    var push$1682 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1683(pattern$1701) {
        var fv$1702 = [];
        _$1671.each(pattern$1701, function (pat$1703) {
            if (isPatternVar$1687(pat$1703)) {
                fv$1702.push(pat$1703.token.value);
            } else if (pat$1703.token.type === parser$1672.Token.Delimiter) {
                push$1682.apply(fv$1702, freeVarsInPattern$1683(pat$1703.token.inner));
            }
        });
        return fv$1702;
    }
    function typeIsLiteral$1684(type$1704) {
        return type$1704 === parser$1672.Token.NullLiteral || type$1704 === parser$1672.Token.NumericLiteral || type$1704 === parser$1672.Token.StringLiteral || type$1704 === parser$1672.Token.RegexLiteral || type$1704 === parser$1672.Token.BooleanLiteral;
    }
    function containsPatternVar$1685(patterns$1705) {
        return _$1671.any(patterns$1705, function (pat$1706) {
            if (pat$1706.token.type === parser$1672.Token.Delimiter) {
                return containsPatternVar$1685(pat$1706.token.inner);
            }
            return isPatternVar$1687(pat$1706);
        });
    }
    function delimIsSeparator$1686(delim$1707) {
        return delim$1707 && delim$1707.token && delim$1707.token.type === parser$1672.Token.Delimiter && delim$1707.token.value === '()' && delim$1707.token.inner.length === 1 && delim$1707.token.inner[0].token.type !== parser$1672.Token.Delimiter && !containsPatternVar$1685(delim$1707.token.inner);
    }
    function isPatternVar$1687(stx$1708) {
        return stx$1708.token.value[0] === '$' && stx$1708.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1688(tojoin$1709, punc$1710) {
        return _$1671.reduce(_$1671.rest(tojoin$1709, 1), function (acc$1711, join$1712) {
            if (punc$1710 === ' ') {
                return acc$1711.concat(join$1712.match);
            }
            return acc$1711.concat(makePunc$1677(punc$1710, _$1671.first(join$1712.match)), join$1712.match);
        }, _$1671.first(tojoin$1709).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1689(from$1713, to$1714) {
        return _$1671.map(to$1714, function (stx$1715) {
            return takeLine$1690(from$1713, stx$1715);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1690(from$1716, to$1717) {
        var next$1718;
        if (to$1717.token.type === parser$1672.Token.Delimiter) {
            var sm_startLineNumber$1719 = typeof to$1717.token.sm_startLineNumber !== 'undefined' ? to$1717.token.sm_startLineNumber : to$1717.token.startLineNumber;
            var sm_endLineNumber$1720 = typeof to$1717.token.sm_endLineNumber !== 'undefined' ? to$1717.token.sm_endLineNumber : to$1717.token.endLineNumber;
            var sm_startLineStart$1721 = typeof to$1717.token.sm_startLineStart !== 'undefined' ? to$1717.token.sm_startLineStart : to$1717.token.startLineStart;
            var sm_endLineStart$1722 = typeof to$1717.token.sm_endLineStart !== 'undefined' ? to$1717.token.sm_endLineStart : to$1717.token.endLineStart;
            var sm_startRange$1723 = typeof to$1717.token.sm_startRange !== 'undefined' ? to$1717.token.sm_startRange : to$1717.token.startRange;
            var sm_endRange$1724 = typeof to$1717.token.sm_endRange !== 'undefined' ? to$1717.token.sm_endRange : to$1717.token.endRange;
            if (from$1716.token.type === parser$1672.Token.Delimiter) {
                next$1718 = syntaxFromToken$1676({
                    type: parser$1672.Token.Delimiter,
                    value: to$1717.token.value,
                    inner: takeLineContext$1689(from$1716, to$1717.token.inner),
                    startRange: from$1716.token.startRange,
                    endRange: from$1716.token.endRange,
                    startLineNumber: from$1716.token.startLineNumber,
                    startLineStart: from$1716.token.startLineStart,
                    endLineNumber: from$1716.token.endLineNumber,
                    endLineStart: from$1716.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1719,
                    sm_endLineNumber: sm_endLineNumber$1720,
                    sm_startLineStart: sm_startLineStart$1721,
                    sm_endLineStart: sm_endLineStart$1722,
                    sm_startRange: sm_startRange$1723,
                    sm_endRange: sm_endRange$1724
                }, to$1717);
            } else {
                next$1718 = syntaxFromToken$1676({
                    type: parser$1672.Token.Delimiter,
                    value: to$1717.token.value,
                    inner: takeLineContext$1689(from$1716, to$1717.token.inner),
                    startRange: from$1716.token.range,
                    endRange: from$1716.token.range,
                    startLineNumber: from$1716.token.lineNumber,
                    startLineStart: from$1716.token.lineStart,
                    endLineNumber: from$1716.token.lineNumber,
                    endLineStart: from$1716.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1719,
                    sm_endLineNumber: sm_endLineNumber$1720,
                    sm_startLineStart: sm_startLineStart$1721,
                    sm_endLineStart: sm_endLineStart$1722,
                    sm_startRange: sm_startRange$1723,
                    sm_endRange: sm_endRange$1724
                }, to$1717);
            }
        } else {
            var sm_lineNumber$1725 = typeof to$1717.token.sm_lineNumber !== 'undefined' ? to$1717.token.sm_lineNumber : to$1717.token.lineNumber;
            var sm_lineStart$1726 = typeof to$1717.token.sm_lineStart !== 'undefined' ? to$1717.token.sm_lineStart : to$1717.token.lineStart;
            var sm_range$1727 = typeof to$1717.token.sm_range !== 'undefined' ? to$1717.token.sm_range : to$1717.token.range;
            if (from$1716.token.type === parser$1672.Token.Delimiter) {
                next$1718 = syntaxFromToken$1676({
                    value: to$1717.token.value,
                    type: to$1717.token.type,
                    lineNumber: from$1716.token.startLineNumber,
                    lineStart: from$1716.token.startLineStart,
                    range: from$1716.token.startRange,
                    sm_lineNumber: sm_lineNumber$1725,
                    sm_lineStart: sm_lineStart$1726,
                    sm_range: sm_range$1727
                }, to$1717);
            } else {
                next$1718 = syntaxFromToken$1676({
                    value: to$1717.token.value,
                    type: to$1717.token.type,
                    lineNumber: from$1716.token.lineNumber,
                    lineStart: from$1716.token.lineStart,
                    range: from$1716.token.range,
                    sm_lineNumber: sm_lineNumber$1725,
                    sm_lineStart: sm_lineStart$1726,
                    sm_range: sm_range$1727
                }, to$1717);
            }
        }
        if (to$1717.token.leadingComments) {
            next$1718.token.leadingComments = to$1717.token.leadingComments;
        }
        if (to$1717.token.trailingComments) {
            next$1718.token.trailingComments = to$1717.token.trailingComments;
        }
        return next$1718;
    }
    function reversePattern$1691(patterns$1728) {
        var len$1729 = patterns$1728.length;
        var pat$1730;
        return _$1671.reduceRight(patterns$1728, function (acc$1731, pat$1730) {
            if (pat$1730.class === 'pattern_group') {
                pat$1730.token.inner = reversePattern$1691(pat$1730.token.inner);
            }
            if (pat$1730.repeat) {
                pat$1730.leading = !pat$1730.leading;
            }
            acc$1731.push(pat$1730);
            return acc$1731;
        }, []);
    }
    function loadLiteralGroup$1692(patterns$1733) {
        _$1671.forEach(patterns$1733, function (patStx$1734) {
            if (patStx$1734.token.type === parser$1672.Token.Delimiter) {
                patStx$1734.token.inner = loadLiteralGroup$1692(patStx$1734.token.inner);
            } else {
                patStx$1734.class = 'pattern_literal';
            }
        });
        return patterns$1733;
    }
    function loadPattern$1693(patterns$1735, reverse$1736) {
        var patts$1737 = _$1671.chain(patterns$1735).reduce(function (acc$1738, patStx$1739, idx$1740) {
                var last$1741 = patterns$1735[idx$1740 - 1];
                var lastLast$1742 = patterns$1735[idx$1740 - 2];
                var next$1743 = patterns$1735[idx$1740 + 1];
                var nextNext$1744 = patterns$1735[idx$1740 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1739.token.value === ':') {
                    if (last$1741 && isPatternVar$1687(last$1741) && !isPatternVar$1687(next$1743)) {
                        return acc$1738;
                    }
                }
                if (last$1741 && last$1741.token.value === ':') {
                    if (lastLast$1742 && isPatternVar$1687(lastLast$1742) && !isPatternVar$1687(patStx$1739)) {
                        return acc$1738;
                    }
                }
                // skip over $
                if (patStx$1739.token.value === '$' && next$1743 && next$1743.token.type === parser$1672.Token.Delimiter) {
                    return acc$1738;
                }
                if (isPatternVar$1687(patStx$1739)) {
                    if (next$1743 && next$1743.token.value === ':' && !isPatternVar$1687(nextNext$1744)) {
                        if (typeof nextNext$1744 === 'undefined') {
                            throwSyntaxError$1681('patterns', 'expecting a pattern class following a `:`', next$1743);
                        }
                        patStx$1739.class = nextNext$1744.token.value;
                    } else {
                        patStx$1739.class = 'token';
                    }
                } else if (patStx$1739.token.type === parser$1672.Token.Delimiter) {
                    if (last$1741 && last$1741.token.value === '$') {
                        patStx$1739.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1739.class === 'pattern_group' && patStx$1739.token.value === '[]') {
                        patStx$1739.token.inner = loadLiteralGroup$1692(patStx$1739.token.inner);
                    } else {
                        patStx$1739.token.inner = loadPattern$1693(patStx$1739.token.inner);
                    }
                } else {
                    patStx$1739.class = 'pattern_literal';
                }
                acc$1738.push(patStx$1739);
                return acc$1738;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1745, patStx$1746, idx$1747, patterns$1748) {
                var separator$1749 = patStx$1746.separator || ' ';
                var repeat$1750 = patStx$1746.repeat || false;
                var next$1751 = patterns$1748[idx$1747 + 1];
                var nextNext$1752 = patterns$1748[idx$1747 + 2];
                if (next$1751 && next$1751.token.value === '...') {
                    repeat$1750 = true;
                    separator$1749 = ' ';
                } else if (delimIsSeparator$1686(next$1751) && nextNext$1752 && nextNext$1752.token.value === '...') {
                    repeat$1750 = true;
                    assert$1680(next$1751.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1749 = next$1751.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1746.token.value === '...' || delimIsSeparator$1686(patStx$1746) && next$1751 && next$1751.token.value === '...') {
                    return acc$1745;
                }
                patStx$1746.repeat = repeat$1750;
                patStx$1746.separator = separator$1749;
                acc$1745.push(patStx$1746);
                return acc$1745;
            }, []).value();
        return reverse$1736 ? reversePattern$1691(patts$1737) : patts$1737;
    }
    function cachedTermMatch$1694(stx$1753, term$1754) {
        var res$1755 = [];
        var i$1756 = 0;
        while (stx$1753[i$1756] && stx$1753[i$1756].term === term$1754) {
            res$1755.unshift(stx$1753[i$1756]);
            i$1756++;
        }
        return {
            result: term$1754,
            destructed: res$1755,
            rest: stx$1753.slice(res$1755.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1695(patternClass$1757, stx$1758, env$1759) {
        var result$1760, rest$1761, match$1762;
        // pattern has no parse class
        if (patternClass$1757 === 'token' && stx$1758[0] && stx$1758[0].token.type !== parser$1672.Token.EOF) {
            result$1760 = [stx$1758[0]];
            rest$1761 = stx$1758.slice(1);
        } else if (patternClass$1757 === 'lit' && stx$1758[0] && typeIsLiteral$1684(stx$1758[0].token.type)) {
            result$1760 = [stx$1758[0]];
            rest$1761 = stx$1758.slice(1);
        } else if (patternClass$1757 === 'ident' && stx$1758[0] && stx$1758[0].token.type === parser$1672.Token.Identifier) {
            result$1760 = [stx$1758[0]];
            rest$1761 = stx$1758.slice(1);
        } else if (stx$1758.length > 0 && patternClass$1757 === 'VariableStatement') {
            match$1762 = stx$1758[0].term ? cachedTermMatch$1694(stx$1758, stx$1758[0].term) : expander$1673.enforest(stx$1758, expander$1673.makeExpanderContext({ env: env$1759 }));
            if (match$1762.result && match$1762.result.hasPrototype(expander$1673.VariableStatement)) {
                result$1760 = match$1762.destructed || match$1762.result.destruct(false);
                rest$1761 = match$1762.rest;
            } else {
                result$1760 = null;
                rest$1761 = stx$1758;
            }
        } else if (stx$1758.length > 0 && patternClass$1757 === 'expr') {
            match$1762 = stx$1758[0].term ? cachedTermMatch$1694(stx$1758, stx$1758[0].term) : expander$1673.get_expression(stx$1758, expander$1673.makeExpanderContext({ env: env$1759 }));
            if (match$1762.result === null || !match$1762.result.hasPrototype(expander$1673.Expr)) {
                result$1760 = null;
                rest$1761 = stx$1758;
            } else {
                result$1760 = match$1762.destructed || match$1762.result.destruct(false);
                rest$1761 = match$1762.rest;
            }
        } else {
            result$1760 = null;
            rest$1761 = stx$1758;
        }
        return {
            result: result$1760,
            rest: rest$1761
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1696(patterns$1763, stx$1764, env$1765, topLevel$1766) {
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
        topLevel$1766 = topLevel$1766 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1767 = [];
        var patternEnv$1768 = {};
        var match$1769;
        var pattern$1770;
        var rest$1771 = stx$1764;
        var success$1772 = true;
        var inLeading$1773;
        patternLoop:
            for (var i$1774 = 0; i$1774 < patterns$1763.length; i$1774++) {
                if (success$1772 === false) {
                    break;
                }
                pattern$1770 = patterns$1763[i$1774];
                inLeading$1773 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1770.repeat && i$1774 + 1 < patterns$1763.length) {
                        var restMatch$1775 = matchPatterns$1696(patterns$1763.slice(i$1774 + 1), rest$1771, env$1765, topLevel$1766);
                        if (restMatch$1775.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1769 = matchPattern$1697(pattern$1770, [], env$1765, patternEnv$1768, topLevel$1766);
                            patternEnv$1768 = _$1671.extend(restMatch$1775.patternEnv, match$1769.patternEnv);
                            rest$1771 = restMatch$1775.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1770.repeat && pattern$1770.leading && pattern$1770.separator !== ' ') {
                        if (rest$1771[0].token.value === pattern$1770.separator) {
                            if (!inLeading$1773) {
                                inLeading$1773 = true;
                            }
                            rest$1771 = rest$1771.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1773) {
                                success$1772 = false;
                                break;
                            }
                        }
                    }
                    match$1769 = matchPattern$1697(pattern$1770, rest$1771, env$1765, patternEnv$1768, topLevel$1766);
                    if (!match$1769.success && pattern$1770.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1769.success) {
                        success$1772 = false;
                        break;
                    }
                    rest$1771 = match$1769.rest;
                    patternEnv$1768 = match$1769.patternEnv;
                    if (success$1772 && !(topLevel$1766 || pattern$1770.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1774 == patterns$1763.length - 1 && rest$1771.length !== 0) {
                            success$1772 = false;
                            break;
                        }
                    }
                    if (pattern$1770.repeat && !pattern$1770.leading && success$1772) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1770.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1771[0] && rest$1771[0].token.value === pattern$1770.separator) {
                            // more tokens and the next token matches the separator
                            rest$1771 = rest$1771.slice(1);
                        } else if (pattern$1770.separator !== ' ' && rest$1771.length > 0 && i$1774 === patterns$1763.length - 1 && topLevel$1766 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1772 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1770.repeat && success$1772 && rest$1771.length > 0);
            }
        var result$1767;
        if (success$1772) {
            result$1767 = rest$1771.length ? stx$1764.slice(0, -rest$1771.length) : stx$1764;
        } else {
            result$1767 = [];
        }
        return {
            success: success$1772,
            result: result$1767,
            rest: rest$1771,
            patternEnv: patternEnv$1768
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
    function matchPattern$1697(pattern$1776, stx$1777, env$1778, patternEnv$1779, topLevel$1780) {
        var subMatch$1781;
        var match$1782, matchEnv$1783;
        var rest$1784;
        var success$1785;
        if (typeof pattern$1776.inner !== 'undefined') {
            if (pattern$1776.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1781 = matchPatterns$1696(pattern$1776.inner, stx$1777, env$1778, true);
                rest$1784 = subMatch$1781.rest;
            } else if (stx$1777[0] && stx$1777[0].token.type === parser$1672.Token.Delimiter && stx$1777[0].token.value === pattern$1776.value) {
                stx$1777[0].expose();
                if (pattern$1776.inner.length === 0 && stx$1777[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1777,
                        patternEnv: patternEnv$1779
                    };
                }
                subMatch$1781 = matchPatterns$1696(pattern$1776.inner, stx$1777[0].token.inner, env$1778, false);
                rest$1784 = stx$1777.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1777,
                    patternEnv: patternEnv$1779
                };
            }
            success$1785 = subMatch$1781.success;
            // merge the subpattern matches with the current pattern environment
            _$1671.keys(subMatch$1781.patternEnv).forEach(function (patternKey$1786) {
                if (pattern$1776.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1787 = subMatch$1781.patternEnv[patternKey$1786].level + 1;
                    if (patternEnv$1779[patternKey$1786]) {
                        patternEnv$1779[patternKey$1786].level = nextLevel$1787;
                        patternEnv$1779[patternKey$1786].match.push(subMatch$1781.patternEnv[patternKey$1786]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1779[patternKey$1786] = {
                            level: nextLevel$1787,
                            match: [subMatch$1781.patternEnv[patternKey$1786]],
                            topLevel: topLevel$1780
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1779[patternKey$1786] = subMatch$1781.patternEnv[patternKey$1786];
                }
            });
        } else {
            if (pattern$1776.class === 'pattern_literal') {
                // wildcard
                if (stx$1777[0] && pattern$1776.value === '_') {
                    success$1785 = true;
                    rest$1784 = stx$1777.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1777[0] && pattern$1776.value === stx$1777[0].token.value) {
                    success$1785 = true;
                    rest$1784 = stx$1777.slice(1);
                } else {
                    success$1785 = false;
                    rest$1784 = stx$1777;
                }
            } else {
                match$1782 = matchPatternClass$1695(pattern$1776.class, stx$1777, env$1778);
                success$1785 = match$1782.result !== null;
                rest$1784 = match$1782.rest;
                matchEnv$1783 = {
                    level: 0,
                    match: match$1782.result,
                    topLevel: topLevel$1780
                };
                // push the match onto this value's slot in the environment
                if (pattern$1776.repeat) {
                    if (patternEnv$1779[pattern$1776.value] && success$1785) {
                        patternEnv$1779[pattern$1776.value].match.push(matchEnv$1783);
                    } else if (patternEnv$1779[pattern$1776.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1779[pattern$1776.value] = {
                            level: 1,
                            match: [matchEnv$1783],
                            topLevel: topLevel$1780
                        };
                    }
                } else {
                    patternEnv$1779[pattern$1776.value] = matchEnv$1783;
                }
            }
        }
        return {
            success: success$1785,
            rest: rest$1784,
            patternEnv: patternEnv$1779
        };
    }
    function matchLookbehind$1698(patterns$1788, stx$1789, terms$1790, env$1791) {
        var success$1792, patternEnv$1793, prevStx$1794, prevTerms$1795;
        // No lookbehind, noop.
        if (!patterns$1788.length) {
            success$1792 = true;
            patternEnv$1793 = {};
            prevStx$1794 = stx$1789;
            prevTerms$1795 = terms$1790;
        } else {
            var match$1796 = matchPatterns$1696(patterns$1788, stx$1789, env$1791, true);
            var last$1797 = match$1796.result[match$1796.result.length - 1];
            success$1792 = match$1796.success;
            patternEnv$1793 = match$1796.patternEnv;
            if (success$1792) {
                if (match$1796.rest.length) {
                    if (last$1797 && last$1797.term === match$1796.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1792 = false;
                    } else {
                        prevStx$1794 = match$1796.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1798 = 0, len$1799 = terms$1790.length; i$1798 < len$1799; i$1798++) {
                            if (terms$1790[i$1798] === prevStx$1794[0].term) {
                                prevTerms$1795 = terms$1790.slice(i$1798);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1795 = [];
                    prevStx$1794 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1671.forEach(patternEnv$1793, function (val$1800, key$1801) {
            if (val$1800.level && val$1800.match && val$1800.topLevel) {
                val$1800.match.reverse();
            }
        });
        return {
            success: success$1792,
            patternEnv: patternEnv$1793,
            prevStx: prevStx$1794,
            prevTerms: prevTerms$1795
        };
    }
    function hasMatch$1699(m$1802) {
        if (m$1802.level === 0) {
            return m$1802.match.length > 0;
        }
        return m$1802.match.every(function (m$1803) {
            return hasMatch$1699(m$1803);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1700(macroBody$1804, macroNameStx$1805, env$1806) {
        return _$1671.chain(macroBody$1804).reduce(function (acc$1807, bodyStx$1808, idx$1809, original$1810) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1811 = original$1810[idx$1809 - 1];
            var next$1812 = original$1810[idx$1809 + 1];
            var nextNext$1813 = original$1810[idx$1809 + 2];
            // drop `...`
            if (bodyStx$1808.token.value === '...') {
                return acc$1807;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1686(bodyStx$1808) && next$1812 && next$1812.token.value === '...') {
                return acc$1807;
            }
            // skip the $ in $(...)
            if (bodyStx$1808.token.value === '$' && next$1812 && next$1812.token.type === parser$1672.Token.Delimiter && next$1812.token.value === '()') {
                return acc$1807;
            }
            // mark $[...] as a literal
            if (bodyStx$1808.token.value === '$' && next$1812 && next$1812.token.type === parser$1672.Token.Delimiter && next$1812.token.value === '[]') {
                next$1812.literal = true;
                return acc$1807;
            }
            if (bodyStx$1808.token.type === parser$1672.Token.Delimiter && bodyStx$1808.token.value === '()' && last$1811 && last$1811.token.value === '$') {
                bodyStx$1808.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1808.literal === true) {
                assert$1680(bodyStx$1808.token.type === parser$1672.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1807.concat(bodyStx$1808.token.inner);
            }
            if (next$1812 && next$1812.token.value === '...') {
                bodyStx$1808.repeat = true;
                bodyStx$1808.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1686(next$1812) && nextNext$1813 && nextNext$1813.token.value === '...') {
                bodyStx$1808.repeat = true;
                bodyStx$1808.separator = next$1812.token.inner[0].token.value;
            }
            acc$1807.push(bodyStx$1808);
            return acc$1807;
        }, []).reduce(function (acc$1814, bodyStx$1815, idx$1816) {
            // then do the actual transcription
            if (bodyStx$1815.repeat) {
                if (bodyStx$1815.token.type === parser$1672.Token.Delimiter) {
                    bodyStx$1815.expose();
                    var fv$1817 = _$1671.filter(freeVarsInPattern$1683(bodyStx$1815.token.inner), function (pat$1824) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1806.hasOwnProperty(pat$1824);
                        });
                    var restrictedEnv$1818 = [];
                    var nonScalar$1819 = _$1671.find(fv$1817, function (pat$1825) {
                            return env$1806[pat$1825].level > 0;
                        });
                    assert$1680(typeof nonScalar$1819 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1820 = env$1806[nonScalar$1819].match.length;
                    var sameLength$1821 = _$1671.all(fv$1817, function (pat$1826) {
                            return env$1806[pat$1826].level === 0 || env$1806[pat$1826].match.length === repeatLength$1820;
                        });
                    assert$1680(sameLength$1821, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1671.each(_$1671.range(repeatLength$1820), function (idx$1827) {
                        var renv$1828 = {};
                        _$1671.each(fv$1817, function (pat$1830) {
                            if (env$1806[pat$1830].level === 0) {
                                // copy scalars over
                                renv$1828[pat$1830] = env$1806[pat$1830];
                            } else {
                                // grab the match at this index 
                                renv$1828[pat$1830] = env$1806[pat$1830].match[idx$1827];
                            }
                        });
                        var allHaveMatch$1829 = Object.keys(renv$1828).every(function (pat$1831) {
                                return hasMatch$1699(renv$1828[pat$1831]);
                            });
                        if (allHaveMatch$1829) {
                            restrictedEnv$1818.push(renv$1828);
                        }
                    });
                    var transcribed$1822 = _$1671.map(restrictedEnv$1818, function (renv$1832) {
                            if (bodyStx$1815.group) {
                                return transcribe$1700(bodyStx$1815.token.inner, macroNameStx$1805, renv$1832);
                            } else {
                                var newBody$1833 = syntaxFromToken$1676(_$1671.clone(bodyStx$1815.token), bodyStx$1815);
                                newBody$1833.token.inner = transcribe$1700(bodyStx$1815.token.inner, macroNameStx$1805, renv$1832);
                                return newBody$1833;
                            }
                        });
                    var joined$1823;
                    if (bodyStx$1815.group) {
                        joined$1823 = joinSyntaxArr$1679(transcribed$1822, bodyStx$1815.separator);
                    } else {
                        joined$1823 = joinSyntax$1678(transcribed$1822, bodyStx$1815.separator);
                    }
                    push$1682.apply(acc$1814, joined$1823);
                    return acc$1814;
                }
                if (!env$1806[bodyStx$1815.token.value]) {
                    throwSyntaxError$1681('patterns', 'The pattern variable is not bound for the template', bodyStx$1815);
                } else if (env$1806[bodyStx$1815.token.value].level !== 1) {
                    throwSyntaxError$1681('patterns', 'Ellipses level does not match in the template', bodyStx$1815);
                }
                push$1682.apply(acc$1814, joinRepeatedMatch$1688(env$1806[bodyStx$1815.token.value].match, bodyStx$1815.separator));
                return acc$1814;
            } else {
                if (bodyStx$1815.token.type === parser$1672.Token.Delimiter) {
                    bodyStx$1815.expose();
                    var newBody$1834 = syntaxFromToken$1676(_$1671.clone(bodyStx$1815.token), macroBody$1804);
                    newBody$1834.token.inner = transcribe$1700(bodyStx$1815.token.inner, macroNameStx$1805, env$1806);
                    acc$1814.push(newBody$1834);
                    return acc$1814;
                }
                if (isPatternVar$1687(bodyStx$1815) && Object.prototype.hasOwnProperty.bind(env$1806)(bodyStx$1815.token.value)) {
                    if (!env$1806[bodyStx$1815.token.value]) {
                        throwSyntaxError$1681('patterns', 'The pattern variable is not bound for the template', bodyStx$1815);
                    } else if (env$1806[bodyStx$1815.token.value].level !== 0) {
                        throwSyntaxError$1681('patterns', 'Ellipses level does not match in the template', bodyStx$1815);
                    }
                    push$1682.apply(acc$1814, takeLineContext$1689(bodyStx$1815, env$1806[bodyStx$1815.token.value].match));
                    return acc$1814;
                }
                acc$1814.push(syntaxFromToken$1676(_$1671.clone(bodyStx$1815.token), bodyStx$1815));
                return acc$1814;
            }
        }, []).value();
    }
    exports$1670.loadPattern = loadPattern$1693;
    exports$1670.matchPatterns = matchPatterns$1696;
    exports$1670.matchLookbehind = matchLookbehind$1698;
    exports$1670.transcribe = transcribe$1700;
    exports$1670.matchPatternClass = matchPatternClass$1695;
    exports$1670.takeLineContext = takeLineContext$1689;
    exports$1670.takeLine = takeLine$1690;
    exports$1670.typeIsLiteral = typeIsLiteral$1684;
}));
//# sourceMappingURL=patterns.js.map