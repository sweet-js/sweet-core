(function (root$1658, factory$1659) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1659(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1659);
    }
}(this, function (exports$1660, _$1661, parser$1662, expander$1663, syntax$1664) {
    var get_expression$1665 = expander$1663.get_expression;
    var syntaxFromToken$1666 = syntax$1664.syntaxFromToken;
    var makePunc$1667 = syntax$1664.makePunc;
    var joinSyntax$1668 = syntax$1664.joinSyntax;
    var joinSyntaxArr$1669 = syntax$1664.joinSyntaxArr;
    var assert$1670 = syntax$1664.assert;
    var throwSyntaxError$1671 = syntax$1664.throwSyntaxError;
    var push$1672 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1673(pattern$1691) {
        var fv$1692 = [];
        _$1661.each(pattern$1691, function (pat$1693) {
            if (isPatternVar$1677(pat$1693)) {
                fv$1692.push(pat$1693.token.value);
            } else if (pat$1693.token.type === parser$1662.Token.Delimiter) {
                push$1672.apply(fv$1692, freeVarsInPattern$1673(pat$1693.token.inner));
            }
        });
        return fv$1692;
    }
    function typeIsLiteral$1674(type$1694) {
        return type$1694 === parser$1662.Token.NullLiteral || type$1694 === parser$1662.Token.NumericLiteral || type$1694 === parser$1662.Token.StringLiteral || type$1694 === parser$1662.Token.RegexLiteral || type$1694 === parser$1662.Token.BooleanLiteral;
    }
    function containsPatternVar$1675(patterns$1695) {
        return _$1661.any(patterns$1695, function (pat$1696) {
            if (pat$1696.token.type === parser$1662.Token.Delimiter) {
                return containsPatternVar$1675(pat$1696.token.inner);
            }
            return isPatternVar$1677(pat$1696);
        });
    }
    function delimIsSeparator$1676(delim$1697) {
        return delim$1697 && delim$1697.token && delim$1697.token.type === parser$1662.Token.Delimiter && delim$1697.token.value === '()' && delim$1697.token.inner.length === 1 && delim$1697.token.inner[0].token.type !== parser$1662.Token.Delimiter && !containsPatternVar$1675(delim$1697.token.inner);
    }
    function isPatternVar$1677(stx$1698) {
        return stx$1698.token.value[0] === '$' && stx$1698.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1678(tojoin$1699, punc$1700) {
        return _$1661.reduce(_$1661.rest(tojoin$1699, 1), function (acc$1701, join$1702) {
            if (punc$1700 === ' ') {
                return acc$1701.concat(join$1702.match);
            }
            return acc$1701.concat(makePunc$1667(punc$1700, _$1661.first(join$1702.match)), join$1702.match);
        }, _$1661.first(tojoin$1699).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1679(from$1703, to$1704) {
        return _$1661.map(to$1704, function (stx$1705) {
            return takeLine$1680(from$1703, stx$1705);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1680(from$1706, to$1707) {
        var next$1708;
        if (to$1707.token.type === parser$1662.Token.Delimiter) {
            var sm_startLineNumber$1709 = typeof to$1707.token.sm_startLineNumber !== 'undefined' ? to$1707.token.sm_startLineNumber : to$1707.token.startLineNumber;
            var sm_endLineNumber$1710 = typeof to$1707.token.sm_endLineNumber !== 'undefined' ? to$1707.token.sm_endLineNumber : to$1707.token.endLineNumber;
            var sm_startLineStart$1711 = typeof to$1707.token.sm_startLineStart !== 'undefined' ? to$1707.token.sm_startLineStart : to$1707.token.startLineStart;
            var sm_endLineStart$1712 = typeof to$1707.token.sm_endLineStart !== 'undefined' ? to$1707.token.sm_endLineStart : to$1707.token.endLineStart;
            var sm_startRange$1713 = typeof to$1707.token.sm_startRange !== 'undefined' ? to$1707.token.sm_startRange : to$1707.token.startRange;
            var sm_endRange$1714 = typeof to$1707.token.sm_endRange !== 'undefined' ? to$1707.token.sm_endRange : to$1707.token.endRange;
            if (from$1706.token.type === parser$1662.Token.Delimiter) {
                next$1708 = syntaxFromToken$1666({
                    type: parser$1662.Token.Delimiter,
                    value: to$1707.token.value,
                    inner: takeLineContext$1679(from$1706, to$1707.token.inner),
                    startRange: from$1706.token.startRange,
                    endRange: from$1706.token.endRange,
                    startLineNumber: from$1706.token.startLineNumber,
                    startLineStart: from$1706.token.startLineStart,
                    endLineNumber: from$1706.token.endLineNumber,
                    endLineStart: from$1706.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1709,
                    sm_endLineNumber: sm_endLineNumber$1710,
                    sm_startLineStart: sm_startLineStart$1711,
                    sm_endLineStart: sm_endLineStart$1712,
                    sm_startRange: sm_startRange$1713,
                    sm_endRange: sm_endRange$1714
                }, to$1707);
            } else {
                next$1708 = syntaxFromToken$1666({
                    type: parser$1662.Token.Delimiter,
                    value: to$1707.token.value,
                    inner: takeLineContext$1679(from$1706, to$1707.token.inner),
                    startRange: from$1706.token.range,
                    endRange: from$1706.token.range,
                    startLineNumber: from$1706.token.lineNumber,
                    startLineStart: from$1706.token.lineStart,
                    endLineNumber: from$1706.token.lineNumber,
                    endLineStart: from$1706.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1709,
                    sm_endLineNumber: sm_endLineNumber$1710,
                    sm_startLineStart: sm_startLineStart$1711,
                    sm_endLineStart: sm_endLineStart$1712,
                    sm_startRange: sm_startRange$1713,
                    sm_endRange: sm_endRange$1714
                }, to$1707);
            }
        } else {
            var sm_lineNumber$1715 = typeof to$1707.token.sm_lineNumber !== 'undefined' ? to$1707.token.sm_lineNumber : to$1707.token.lineNumber;
            var sm_lineStart$1716 = typeof to$1707.token.sm_lineStart !== 'undefined' ? to$1707.token.sm_lineStart : to$1707.token.lineStart;
            var sm_range$1717 = typeof to$1707.token.sm_range !== 'undefined' ? to$1707.token.sm_range : to$1707.token.range;
            if (from$1706.token.type === parser$1662.Token.Delimiter) {
                next$1708 = syntaxFromToken$1666({
                    value: to$1707.token.value,
                    type: to$1707.token.type,
                    lineNumber: from$1706.token.startLineNumber,
                    lineStart: from$1706.token.startLineStart,
                    range: from$1706.token.startRange,
                    sm_lineNumber: sm_lineNumber$1715,
                    sm_lineStart: sm_lineStart$1716,
                    sm_range: sm_range$1717
                }, to$1707);
            } else {
                next$1708 = syntaxFromToken$1666({
                    value: to$1707.token.value,
                    type: to$1707.token.type,
                    lineNumber: from$1706.token.lineNumber,
                    lineStart: from$1706.token.lineStart,
                    range: from$1706.token.range,
                    sm_lineNumber: sm_lineNumber$1715,
                    sm_lineStart: sm_lineStart$1716,
                    sm_range: sm_range$1717
                }, to$1707);
            }
        }
        if (to$1707.token.leadingComments) {
            next$1708.token.leadingComments = to$1707.token.leadingComments;
        }
        if (to$1707.token.trailingComments) {
            next$1708.token.trailingComments = to$1707.token.trailingComments;
        }
        return next$1708;
    }
    function reversePattern$1681(patterns$1718) {
        var len$1719 = patterns$1718.length;
        var pat$1720;
        return _$1661.reduceRight(patterns$1718, function (acc$1721, pat$1720) {
            if (pat$1720.class === 'pattern_group') {
                pat$1720.token.inner = reversePattern$1681(pat$1720.token.inner);
            }
            if (pat$1720.repeat) {
                pat$1720.leading = !pat$1720.leading;
            }
            acc$1721.push(pat$1720);
            return acc$1721;
        }, []);
    }
    function loadLiteralGroup$1682(patterns$1723) {
        _$1661.forEach(patterns$1723, function (patStx$1724) {
            if (patStx$1724.token.type === parser$1662.Token.Delimiter) {
                patStx$1724.token.inner = loadLiteralGroup$1682(patStx$1724.token.inner);
            } else {
                patStx$1724.class = 'pattern_literal';
            }
        });
        return patterns$1723;
    }
    function loadPattern$1683(patterns$1725, reverse$1726) {
        var patts$1727 = _$1661.chain(patterns$1725).reduce(function (acc$1728, patStx$1729, idx$1730) {
                var last$1731 = patterns$1725[idx$1730 - 1];
                var lastLast$1732 = patterns$1725[idx$1730 - 2];
                var next$1733 = patterns$1725[idx$1730 + 1];
                var nextNext$1734 = patterns$1725[idx$1730 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1729.token.value === ':') {
                    if (last$1731 && isPatternVar$1677(last$1731) && !isPatternVar$1677(next$1733)) {
                        return acc$1728;
                    }
                }
                if (last$1731 && last$1731.token.value === ':') {
                    if (lastLast$1732 && isPatternVar$1677(lastLast$1732) && !isPatternVar$1677(patStx$1729)) {
                        return acc$1728;
                    }
                }
                // skip over $
                if (patStx$1729.token.value === '$' && next$1733 && next$1733.token.type === parser$1662.Token.Delimiter) {
                    return acc$1728;
                }
                if (isPatternVar$1677(patStx$1729)) {
                    if (next$1733 && next$1733.token.value === ':' && !isPatternVar$1677(nextNext$1734)) {
                        if (typeof nextNext$1734 === 'undefined') {
                            throwSyntaxError$1671('patterns', 'expecting a pattern class following a `:`', next$1733);
                        }
                        patStx$1729.class = nextNext$1734.token.value;
                    } else {
                        patStx$1729.class = 'token';
                    }
                } else if (patStx$1729.token.type === parser$1662.Token.Delimiter) {
                    if (last$1731 && last$1731.token.value === '$') {
                        patStx$1729.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1729.class === 'pattern_group' && patStx$1729.token.value === '[]') {
                        patStx$1729.token.inner = loadLiteralGroup$1682(patStx$1729.token.inner);
                    } else {
                        patStx$1729.token.inner = loadPattern$1683(patStx$1729.token.inner);
                    }
                } else {
                    patStx$1729.class = 'pattern_literal';
                }
                acc$1728.push(patStx$1729);
                return acc$1728;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1735, patStx$1736, idx$1737, patterns$1738) {
                var separator$1739 = patStx$1736.separator || ' ';
                var repeat$1740 = patStx$1736.repeat || false;
                var next$1741 = patterns$1738[idx$1737 + 1];
                var nextNext$1742 = patterns$1738[idx$1737 + 2];
                if (next$1741 && next$1741.token.value === '...') {
                    repeat$1740 = true;
                    separator$1739 = ' ';
                } else if (delimIsSeparator$1676(next$1741) && nextNext$1742 && nextNext$1742.token.value === '...') {
                    repeat$1740 = true;
                    assert$1670(next$1741.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1739 = next$1741.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1736.token.value === '...' || delimIsSeparator$1676(patStx$1736) && next$1741 && next$1741.token.value === '...') {
                    return acc$1735;
                }
                patStx$1736.repeat = repeat$1740;
                patStx$1736.separator = separator$1739;
                acc$1735.push(patStx$1736);
                return acc$1735;
            }, []).value();
        return reverse$1726 ? reversePattern$1681(patts$1727) : patts$1727;
    }
    function cachedTermMatch$1684(stx$1743, term$1744) {
        var res$1745 = [];
        var i$1746 = 0;
        while (stx$1743[i$1746] && stx$1743[i$1746].term === term$1744) {
            res$1745.unshift(stx$1743[i$1746]);
            i$1746++;
        }
        return {
            result: term$1744,
            destructed: res$1745,
            rest: stx$1743.slice(res$1745.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1685(patternClass$1747, stx$1748, env$1749) {
        var result$1750, rest$1751, match$1752;
        // pattern has no parse class
        if (patternClass$1747 === 'token' && stx$1748[0] && stx$1748[0].token.type !== parser$1662.Token.EOF) {
            result$1750 = [stx$1748[0]];
            rest$1751 = stx$1748.slice(1);
        } else if (patternClass$1747 === 'lit' && stx$1748[0] && typeIsLiteral$1674(stx$1748[0].token.type)) {
            result$1750 = [stx$1748[0]];
            rest$1751 = stx$1748.slice(1);
        } else if (patternClass$1747 === 'ident' && stx$1748[0] && stx$1748[0].token.type === parser$1662.Token.Identifier) {
            result$1750 = [stx$1748[0]];
            rest$1751 = stx$1748.slice(1);
        } else if (stx$1748.length > 0 && patternClass$1747 === 'VariableStatement') {
            match$1752 = stx$1748[0].term ? cachedTermMatch$1684(stx$1748, stx$1748[0].term) : expander$1663.enforest(stx$1748, expander$1663.makeExpanderContext({ env: env$1749 }));
            if (match$1752.result && match$1752.result.hasPrototype(expander$1663.VariableStatement)) {
                result$1750 = match$1752.destructed || match$1752.result.destruct(false);
                rest$1751 = match$1752.rest;
            } else {
                result$1750 = null;
                rest$1751 = stx$1748;
            }
        } else if (stx$1748.length > 0 && patternClass$1747 === 'expr') {
            match$1752 = stx$1748[0].term ? cachedTermMatch$1684(stx$1748, stx$1748[0].term) : expander$1663.get_expression(stx$1748, expander$1663.makeExpanderContext({ env: env$1749 }));
            if (match$1752.result === null || !match$1752.result.hasPrototype(expander$1663.Expr)) {
                result$1750 = null;
                rest$1751 = stx$1748;
            } else {
                result$1750 = match$1752.destructed || match$1752.result.destruct(false);
                rest$1751 = match$1752.rest;
            }
        } else {
            result$1750 = null;
            rest$1751 = stx$1748;
        }
        return {
            result: result$1750,
            rest: rest$1751
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1686(patterns$1753, stx$1754, env$1755, topLevel$1756) {
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
        topLevel$1756 = topLevel$1756 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1757 = [];
        var patternEnv$1758 = {};
        var match$1759;
        var pattern$1760;
        var rest$1761 = stx$1754;
        var success$1762 = true;
        var inLeading$1763;
        patternLoop:
            for (var i$1764 = 0; i$1764 < patterns$1753.length; i$1764++) {
                if (success$1762 === false) {
                    break;
                }
                pattern$1760 = patterns$1753[i$1764];
                inLeading$1763 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1760.repeat && i$1764 + 1 < patterns$1753.length) {
                        var restMatch$1765 = matchPatterns$1686(patterns$1753.slice(i$1764 + 1), rest$1761, env$1755, topLevel$1756);
                        if (restMatch$1765.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1759 = matchPattern$1687(pattern$1760, [], env$1755, patternEnv$1758, topLevel$1756);
                            patternEnv$1758 = _$1661.extend(restMatch$1765.patternEnv, match$1759.patternEnv);
                            rest$1761 = restMatch$1765.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1760.repeat && pattern$1760.leading && pattern$1760.separator !== ' ') {
                        if (rest$1761[0].token.value === pattern$1760.separator) {
                            if (!inLeading$1763) {
                                inLeading$1763 = true;
                            }
                            rest$1761 = rest$1761.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1763) {
                                success$1762 = false;
                                break;
                            }
                        }
                    }
                    match$1759 = matchPattern$1687(pattern$1760, rest$1761, env$1755, patternEnv$1758, topLevel$1756);
                    if (!match$1759.success && pattern$1760.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1759.success) {
                        success$1762 = false;
                        break;
                    }
                    rest$1761 = match$1759.rest;
                    patternEnv$1758 = match$1759.patternEnv;
                    if (success$1762 && !(topLevel$1756 || pattern$1760.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1764 == patterns$1753.length - 1 && rest$1761.length !== 0) {
                            success$1762 = false;
                            break;
                        }
                    }
                    if (pattern$1760.repeat && !pattern$1760.leading && success$1762) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1760.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1761[0] && rest$1761[0].token.value === pattern$1760.separator) {
                            // more tokens and the next token matches the separator
                            rest$1761 = rest$1761.slice(1);
                        } else if (pattern$1760.separator !== ' ' && rest$1761.length > 0 && i$1764 === patterns$1753.length - 1 && topLevel$1756 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1762 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1760.repeat && success$1762 && rest$1761.length > 0);
            }
        var result$1757;
        if (success$1762) {
            result$1757 = rest$1761.length ? stx$1754.slice(0, -rest$1761.length) : stx$1754;
        } else {
            result$1757 = [];
        }
        return {
            success: success$1762,
            result: result$1757,
            rest: rest$1761,
            patternEnv: patternEnv$1758
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
    function matchPattern$1687(pattern$1766, stx$1767, env$1768, patternEnv$1769, topLevel$1770) {
        var subMatch$1771;
        var match$1772, matchEnv$1773;
        var rest$1774;
        var success$1775;
        if (typeof pattern$1766.inner !== 'undefined') {
            if (pattern$1766.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1771 = matchPatterns$1686(pattern$1766.inner, stx$1767, env$1768, true);
                rest$1774 = subMatch$1771.rest;
            } else if (stx$1767[0] && stx$1767[0].token.type === parser$1662.Token.Delimiter && stx$1767[0].token.value === pattern$1766.value) {
                stx$1767[0].expose();
                if (pattern$1766.inner.length === 0 && stx$1767[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1767,
                        patternEnv: patternEnv$1769
                    };
                }
                subMatch$1771 = matchPatterns$1686(pattern$1766.inner, stx$1767[0].token.inner, env$1768, false);
                rest$1774 = stx$1767.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1767,
                    patternEnv: patternEnv$1769
                };
            }
            success$1775 = subMatch$1771.success;
            // merge the subpattern matches with the current pattern environment
            _$1661.keys(subMatch$1771.patternEnv).forEach(function (patternKey$1776) {
                if (pattern$1766.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1777 = subMatch$1771.patternEnv[patternKey$1776].level + 1;
                    if (patternEnv$1769[patternKey$1776]) {
                        patternEnv$1769[patternKey$1776].level = nextLevel$1777;
                        patternEnv$1769[patternKey$1776].match.push(subMatch$1771.patternEnv[patternKey$1776]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1769[patternKey$1776] = {
                            level: nextLevel$1777,
                            match: [subMatch$1771.patternEnv[patternKey$1776]],
                            topLevel: topLevel$1770
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1769[patternKey$1776] = subMatch$1771.patternEnv[patternKey$1776];
                }
            });
        } else {
            if (pattern$1766.class === 'pattern_literal') {
                // wildcard
                if (stx$1767[0] && pattern$1766.value === '_') {
                    success$1775 = true;
                    rest$1774 = stx$1767.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1767[0] && pattern$1766.value === stx$1767[0].token.value) {
                    success$1775 = true;
                    rest$1774 = stx$1767.slice(1);
                } else {
                    success$1775 = false;
                    rest$1774 = stx$1767;
                }
            } else {
                match$1772 = matchPatternClass$1685(pattern$1766.class, stx$1767, env$1768);
                success$1775 = match$1772.result !== null;
                rest$1774 = match$1772.rest;
                matchEnv$1773 = {
                    level: 0,
                    match: match$1772.result,
                    topLevel: topLevel$1770
                };
                // push the match onto this value's slot in the environment
                if (pattern$1766.repeat) {
                    if (patternEnv$1769[pattern$1766.value] && success$1775) {
                        patternEnv$1769[pattern$1766.value].match.push(matchEnv$1773);
                    } else if (patternEnv$1769[pattern$1766.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1769[pattern$1766.value] = {
                            level: 1,
                            match: [matchEnv$1773],
                            topLevel: topLevel$1770
                        };
                    }
                } else {
                    patternEnv$1769[pattern$1766.value] = matchEnv$1773;
                }
            }
        }
        return {
            success: success$1775,
            rest: rest$1774,
            patternEnv: patternEnv$1769
        };
    }
    function matchLookbehind$1688(patterns$1778, stx$1779, terms$1780, env$1781) {
        var success$1782, patternEnv$1783, prevStx$1784, prevTerms$1785;
        // No lookbehind, noop.
        if (!patterns$1778.length) {
            success$1782 = true;
            patternEnv$1783 = {};
            prevStx$1784 = stx$1779;
            prevTerms$1785 = terms$1780;
        } else {
            var match$1786 = matchPatterns$1686(patterns$1778, stx$1779, env$1781, true);
            var last$1787 = match$1786.result[match$1786.result.length - 1];
            success$1782 = match$1786.success;
            patternEnv$1783 = match$1786.patternEnv;
            if (success$1782) {
                if (match$1786.rest.length) {
                    if (last$1787 && last$1787.term === match$1786.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1782 = false;
                    } else {
                        prevStx$1784 = match$1786.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1788 = 0, len$1789 = terms$1780.length; i$1788 < len$1789; i$1788++) {
                            if (terms$1780[i$1788] === prevStx$1784[0].term) {
                                prevTerms$1785 = terms$1780.slice(i$1788);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1785 = [];
                    prevStx$1784 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1661.forEach(patternEnv$1783, function (val$1790, key$1791) {
            if (val$1790.level && val$1790.match && val$1790.topLevel) {
                val$1790.match.reverse();
            }
        });
        return {
            success: success$1782,
            patternEnv: patternEnv$1783,
            prevStx: prevStx$1784,
            prevTerms: prevTerms$1785
        };
    }
    function hasMatch$1689(m$1792) {
        if (m$1792.level === 0) {
            return m$1792.match.length > 0;
        }
        return m$1792.match.every(function (m$1793) {
            return hasMatch$1689(m$1793);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1690(macroBody$1794, macroNameStx$1795, env$1796) {
        return _$1661.chain(macroBody$1794).reduce(function (acc$1797, bodyStx$1798, idx$1799, original$1800) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1801 = original$1800[idx$1799 - 1];
            var next$1802 = original$1800[idx$1799 + 1];
            var nextNext$1803 = original$1800[idx$1799 + 2];
            // drop `...`
            if (bodyStx$1798.token.value === '...') {
                return acc$1797;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1676(bodyStx$1798) && next$1802 && next$1802.token.value === '...') {
                return acc$1797;
            }
            // skip the $ in $(...)
            if (bodyStx$1798.token.value === '$' && next$1802 && next$1802.token.type === parser$1662.Token.Delimiter && next$1802.token.value === '()') {
                return acc$1797;
            }
            // mark $[...] as a literal
            if (bodyStx$1798.token.value === '$' && next$1802 && next$1802.token.type === parser$1662.Token.Delimiter && next$1802.token.value === '[]') {
                next$1802.literal = true;
                return acc$1797;
            }
            if (bodyStx$1798.token.type === parser$1662.Token.Delimiter && bodyStx$1798.token.value === '()' && last$1801 && last$1801.token.value === '$') {
                bodyStx$1798.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1798.literal === true) {
                assert$1670(bodyStx$1798.token.type === parser$1662.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1797.concat(bodyStx$1798.token.inner);
            }
            if (next$1802 && next$1802.token.value === '...') {
                bodyStx$1798.repeat = true;
                bodyStx$1798.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1676(next$1802) && nextNext$1803 && nextNext$1803.token.value === '...') {
                bodyStx$1798.repeat = true;
                bodyStx$1798.separator = next$1802.token.inner[0].token.value;
            }
            acc$1797.push(bodyStx$1798);
            return acc$1797;
        }, []).reduce(function (acc$1804, bodyStx$1805, idx$1806) {
            // then do the actual transcription
            if (bodyStx$1805.repeat) {
                if (bodyStx$1805.token.type === parser$1662.Token.Delimiter) {
                    bodyStx$1805.expose();
                    var fv$1807 = _$1661.filter(freeVarsInPattern$1673(bodyStx$1805.token.inner), function (pat$1814) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1796.hasOwnProperty(pat$1814);
                        });
                    var restrictedEnv$1808 = [];
                    var nonScalar$1809 = _$1661.find(fv$1807, function (pat$1815) {
                            return env$1796[pat$1815].level > 0;
                        });
                    assert$1670(typeof nonScalar$1809 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1810 = env$1796[nonScalar$1809].match.length;
                    var sameLength$1811 = _$1661.all(fv$1807, function (pat$1816) {
                            return env$1796[pat$1816].level === 0 || env$1796[pat$1816].match.length === repeatLength$1810;
                        });
                    assert$1670(sameLength$1811, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1661.each(_$1661.range(repeatLength$1810), function (idx$1817) {
                        var renv$1818 = {};
                        _$1661.each(fv$1807, function (pat$1820) {
                            if (env$1796[pat$1820].level === 0) {
                                // copy scalars over
                                renv$1818[pat$1820] = env$1796[pat$1820];
                            } else {
                                // grab the match at this index 
                                renv$1818[pat$1820] = env$1796[pat$1820].match[idx$1817];
                            }
                        });
                        var allHaveMatch$1819 = Object.keys(renv$1818).every(function (pat$1821) {
                                return hasMatch$1689(renv$1818[pat$1821]);
                            });
                        if (allHaveMatch$1819) {
                            restrictedEnv$1808.push(renv$1818);
                        }
                    });
                    var transcribed$1812 = _$1661.map(restrictedEnv$1808, function (renv$1822) {
                            if (bodyStx$1805.group) {
                                return transcribe$1690(bodyStx$1805.token.inner, macroNameStx$1795, renv$1822);
                            } else {
                                var newBody$1823 = syntaxFromToken$1666(_$1661.clone(bodyStx$1805.token), bodyStx$1805);
                                newBody$1823.token.inner = transcribe$1690(bodyStx$1805.token.inner, macroNameStx$1795, renv$1822);
                                return newBody$1823;
                            }
                        });
                    var joined$1813;
                    if (bodyStx$1805.group) {
                        joined$1813 = joinSyntaxArr$1669(transcribed$1812, bodyStx$1805.separator);
                    } else {
                        joined$1813 = joinSyntax$1668(transcribed$1812, bodyStx$1805.separator);
                    }
                    push$1672.apply(acc$1804, joined$1813);
                    return acc$1804;
                }
                if (!env$1796[bodyStx$1805.token.value]) {
                    throwSyntaxError$1671('patterns', 'The pattern variable is not bound for the template', bodyStx$1805);
                } else if (env$1796[bodyStx$1805.token.value].level !== 1) {
                    throwSyntaxError$1671('patterns', 'Ellipses level does not match in the template', bodyStx$1805);
                }
                push$1672.apply(acc$1804, joinRepeatedMatch$1678(env$1796[bodyStx$1805.token.value].match, bodyStx$1805.separator));
                return acc$1804;
            } else {
                if (bodyStx$1805.token.type === parser$1662.Token.Delimiter) {
                    bodyStx$1805.expose();
                    var newBody$1824 = syntaxFromToken$1666(_$1661.clone(bodyStx$1805.token), macroBody$1794);
                    newBody$1824.token.inner = transcribe$1690(bodyStx$1805.token.inner, macroNameStx$1795, env$1796);
                    acc$1804.push(newBody$1824);
                    return acc$1804;
                }
                if (isPatternVar$1677(bodyStx$1805) && Object.prototype.hasOwnProperty.bind(env$1796)(bodyStx$1805.token.value)) {
                    if (!env$1796[bodyStx$1805.token.value]) {
                        throwSyntaxError$1671('patterns', 'The pattern variable is not bound for the template', bodyStx$1805);
                    } else if (env$1796[bodyStx$1805.token.value].level !== 0) {
                        throwSyntaxError$1671('patterns', 'Ellipses level does not match in the template', bodyStx$1805);
                    }
                    push$1672.apply(acc$1804, takeLineContext$1679(bodyStx$1805, env$1796[bodyStx$1805.token.value].match));
                    return acc$1804;
                }
                acc$1804.push(bodyStx$1805);
                return acc$1804;
            }
        }, []).value();
    }
    exports$1660.loadPattern = loadPattern$1683;
    exports$1660.matchPatterns = matchPatterns$1686;
    exports$1660.matchLookbehind = matchLookbehind$1688;
    exports$1660.transcribe = transcribe$1690;
    exports$1660.matchPatternClass = matchPatternClass$1685;
    exports$1660.takeLineContext = takeLineContext$1679;
    exports$1660.takeLine = takeLine$1680;
    exports$1660.typeIsLiteral = typeIsLiteral$1674;
}));
//# sourceMappingURL=patterns.js.map