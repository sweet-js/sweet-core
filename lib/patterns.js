(function (root$1656, factory$1657) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1657(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1657);
    }
}(this, function (exports$1658, _$1659, parser$1660, expander$1661, syntax$1662) {
    var get_expression$1663 = expander$1661.get_expression;
    var syntaxFromToken$1664 = syntax$1662.syntaxFromToken;
    var makePunc$1665 = syntax$1662.makePunc;
    var joinSyntax$1666 = syntax$1662.joinSyntax;
    var joinSyntaxArr$1667 = syntax$1662.joinSyntaxArr;
    var assert$1668 = syntax$1662.assert;
    var throwSyntaxError$1669 = syntax$1662.throwSyntaxError;
    var push$1670 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1671(pattern$1689) {
        var fv$1690 = [];
        _$1659.each(pattern$1689, function (pat$1691) {
            if (isPatternVar$1675(pat$1691)) {
                fv$1690.push(pat$1691.token.value);
            } else if (pat$1691.token.type === parser$1660.Token.Delimiter) {
                push$1670.apply(fv$1690, freeVarsInPattern$1671(pat$1691.token.inner));
            }
        });
        return fv$1690;
    }
    function typeIsLiteral$1672(type$1692) {
        return type$1692 === parser$1660.Token.NullLiteral || type$1692 === parser$1660.Token.NumericLiteral || type$1692 === parser$1660.Token.StringLiteral || type$1692 === parser$1660.Token.RegexLiteral || type$1692 === parser$1660.Token.BooleanLiteral;
    }
    function containsPatternVar$1673(patterns$1693) {
        return _$1659.any(patterns$1693, function (pat$1694) {
            if (pat$1694.token.type === parser$1660.Token.Delimiter) {
                return containsPatternVar$1673(pat$1694.token.inner);
            }
            return isPatternVar$1675(pat$1694);
        });
    }
    function delimIsSeparator$1674(delim$1695) {
        return delim$1695 && delim$1695.token && delim$1695.token.type === parser$1660.Token.Delimiter && delim$1695.token.value === '()' && delim$1695.token.inner.length === 1 && delim$1695.token.inner[0].token.type !== parser$1660.Token.Delimiter && !containsPatternVar$1673(delim$1695.token.inner);
    }
    function isPatternVar$1675(stx$1696) {
        return stx$1696.token.value[0] === '$' && stx$1696.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1676(tojoin$1697, punc$1698) {
        return _$1659.reduce(_$1659.rest(tojoin$1697, 1), function (acc$1699, join$1700) {
            if (punc$1698 === ' ') {
                return acc$1699.concat(join$1700.match);
            }
            return acc$1699.concat(makePunc$1665(punc$1698, _$1659.first(join$1700.match)), join$1700.match);
        }, _$1659.first(tojoin$1697).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1677(from$1701, to$1702) {
        return _$1659.map(to$1702, function (stx$1703) {
            return takeLine$1678(from$1701, stx$1703);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1678(from$1704, to$1705) {
        var next$1706;
        if (to$1705.token.type === parser$1660.Token.Delimiter) {
            var sm_startLineNumber$1707 = typeof to$1705.token.sm_startLineNumber !== 'undefined' ? to$1705.token.sm_startLineNumber : to$1705.token.startLineNumber;
            var sm_endLineNumber$1708 = typeof to$1705.token.sm_endLineNumber !== 'undefined' ? to$1705.token.sm_endLineNumber : to$1705.token.endLineNumber;
            var sm_startLineStart$1709 = typeof to$1705.token.sm_startLineStart !== 'undefined' ? to$1705.token.sm_startLineStart : to$1705.token.startLineStart;
            var sm_endLineStart$1710 = typeof to$1705.token.sm_endLineStart !== 'undefined' ? to$1705.token.sm_endLineStart : to$1705.token.endLineStart;
            var sm_startRange$1711 = typeof to$1705.token.sm_startRange !== 'undefined' ? to$1705.token.sm_startRange : to$1705.token.startRange;
            var sm_endRange$1712 = typeof to$1705.token.sm_endRange !== 'undefined' ? to$1705.token.sm_endRange : to$1705.token.endRange;
            if (from$1704.token.type === parser$1660.Token.Delimiter) {
                next$1706 = syntaxFromToken$1664({
                    type: parser$1660.Token.Delimiter,
                    value: to$1705.token.value,
                    inner: takeLineContext$1677(from$1704, to$1705.token.inner),
                    startRange: from$1704.token.startRange,
                    endRange: from$1704.token.endRange,
                    startLineNumber: from$1704.token.startLineNumber,
                    startLineStart: from$1704.token.startLineStart,
                    endLineNumber: from$1704.token.endLineNumber,
                    endLineStart: from$1704.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1707,
                    sm_endLineNumber: sm_endLineNumber$1708,
                    sm_startLineStart: sm_startLineStart$1709,
                    sm_endLineStart: sm_endLineStart$1710,
                    sm_startRange: sm_startRange$1711,
                    sm_endRange: sm_endRange$1712
                }, to$1705);
            } else {
                next$1706 = syntaxFromToken$1664({
                    type: parser$1660.Token.Delimiter,
                    value: to$1705.token.value,
                    inner: takeLineContext$1677(from$1704, to$1705.token.inner),
                    startRange: from$1704.token.range,
                    endRange: from$1704.token.range,
                    startLineNumber: from$1704.token.lineNumber,
                    startLineStart: from$1704.token.lineStart,
                    endLineNumber: from$1704.token.lineNumber,
                    endLineStart: from$1704.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1707,
                    sm_endLineNumber: sm_endLineNumber$1708,
                    sm_startLineStart: sm_startLineStart$1709,
                    sm_endLineStart: sm_endLineStart$1710,
                    sm_startRange: sm_startRange$1711,
                    sm_endRange: sm_endRange$1712
                }, to$1705);
            }
        } else {
            var sm_lineNumber$1713 = typeof to$1705.token.sm_lineNumber !== 'undefined' ? to$1705.token.sm_lineNumber : to$1705.token.lineNumber;
            var sm_lineStart$1714 = typeof to$1705.token.sm_lineStart !== 'undefined' ? to$1705.token.sm_lineStart : to$1705.token.lineStart;
            var sm_range$1715 = typeof to$1705.token.sm_range !== 'undefined' ? to$1705.token.sm_range : to$1705.token.range;
            if (from$1704.token.type === parser$1660.Token.Delimiter) {
                next$1706 = syntaxFromToken$1664({
                    value: to$1705.token.value,
                    type: to$1705.token.type,
                    lineNumber: from$1704.token.startLineNumber,
                    lineStart: from$1704.token.startLineStart,
                    range: from$1704.token.startRange,
                    sm_lineNumber: sm_lineNumber$1713,
                    sm_lineStart: sm_lineStart$1714,
                    sm_range: sm_range$1715
                }, to$1705);
            } else {
                next$1706 = syntaxFromToken$1664({
                    value: to$1705.token.value,
                    type: to$1705.token.type,
                    lineNumber: from$1704.token.lineNumber,
                    lineStart: from$1704.token.lineStart,
                    range: from$1704.token.range,
                    sm_lineNumber: sm_lineNumber$1713,
                    sm_lineStart: sm_lineStart$1714,
                    sm_range: sm_range$1715
                }, to$1705);
            }
        }
        if (to$1705.token.leadingComments) {
            next$1706.token.leadingComments = to$1705.token.leadingComments;
        }
        if (to$1705.token.trailingComments) {
            next$1706.token.trailingComments = to$1705.token.trailingComments;
        }
        return next$1706;
    }
    function reversePattern$1679(patterns$1716) {
        var len$1717 = patterns$1716.length;
        var pat$1718;
        return _$1659.reduceRight(patterns$1716, function (acc$1719, pat$1718) {
            if (pat$1718.class === 'pattern_group') {
                pat$1718.token.inner = reversePattern$1679(pat$1718.token.inner);
            }
            if (pat$1718.repeat) {
                pat$1718.leading = !pat$1718.leading;
            }
            acc$1719.push(pat$1718);
            return acc$1719;
        }, []);
    }
    function loadLiteralGroup$1680(patterns$1721) {
        _$1659.forEach(patterns$1721, function (patStx$1722) {
            if (patStx$1722.token.type === parser$1660.Token.Delimiter) {
                patStx$1722.token.inner = loadLiteralGroup$1680(patStx$1722.token.inner);
            } else {
                patStx$1722.class = 'pattern_literal';
            }
        });
        return patterns$1721;
    }
    function loadPattern$1681(patterns$1723, reverse$1724) {
        var patts$1725 = _$1659.chain(patterns$1723).reduce(function (acc$1726, patStx$1727, idx$1728) {
                var last$1729 = patterns$1723[idx$1728 - 1];
                var lastLast$1730 = patterns$1723[idx$1728 - 2];
                var next$1731 = patterns$1723[idx$1728 + 1];
                var nextNext$1732 = patterns$1723[idx$1728 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1727.token.value === ':') {
                    if (last$1729 && isPatternVar$1675(last$1729) && !isPatternVar$1675(next$1731)) {
                        return acc$1726;
                    }
                }
                if (last$1729 && last$1729.token.value === ':') {
                    if (lastLast$1730 && isPatternVar$1675(lastLast$1730) && !isPatternVar$1675(patStx$1727)) {
                        return acc$1726;
                    }
                }
                // skip over $
                if (patStx$1727.token.value === '$' && next$1731 && next$1731.token.type === parser$1660.Token.Delimiter) {
                    return acc$1726;
                }
                if (isPatternVar$1675(patStx$1727)) {
                    if (next$1731 && next$1731.token.value === ':' && !isPatternVar$1675(nextNext$1732)) {
                        if (typeof nextNext$1732 === 'undefined') {
                            throwSyntaxError$1669('patterns', 'expecting a pattern class following a `:`', next$1731);
                        }
                        patStx$1727.class = nextNext$1732.token.value;
                    } else {
                        patStx$1727.class = 'token';
                    }
                } else if (patStx$1727.token.type === parser$1660.Token.Delimiter) {
                    if (last$1729 && last$1729.token.value === '$') {
                        patStx$1727.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1727.class === 'pattern_group' && patStx$1727.token.value === '[]') {
                        patStx$1727.token.inner = loadLiteralGroup$1680(patStx$1727.token.inner);
                    } else {
                        patStx$1727.token.inner = loadPattern$1681(patStx$1727.token.inner);
                    }
                } else {
                    patStx$1727.class = 'pattern_literal';
                }
                acc$1726.push(patStx$1727);
                return acc$1726;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1733, patStx$1734, idx$1735, patterns$1736) {
                var separator$1737 = patStx$1734.separator || ' ';
                var repeat$1738 = patStx$1734.repeat || false;
                var next$1739 = patterns$1736[idx$1735 + 1];
                var nextNext$1740 = patterns$1736[idx$1735 + 2];
                if (next$1739 && next$1739.token.value === '...') {
                    repeat$1738 = true;
                    separator$1737 = ' ';
                } else if (delimIsSeparator$1674(next$1739) && nextNext$1740 && nextNext$1740.token.value === '...') {
                    repeat$1738 = true;
                    assert$1668(next$1739.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1737 = next$1739.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1734.token.value === '...' || delimIsSeparator$1674(patStx$1734) && next$1739 && next$1739.token.value === '...') {
                    return acc$1733;
                }
                patStx$1734.repeat = repeat$1738;
                patStx$1734.separator = separator$1737;
                acc$1733.push(patStx$1734);
                return acc$1733;
            }, []).value();
        return reverse$1724 ? reversePattern$1679(patts$1725) : patts$1725;
    }
    function cachedTermMatch$1682(stx$1741, term$1742) {
        var res$1743 = [];
        var i$1744 = 0;
        while (stx$1741[i$1744] && stx$1741[i$1744].term === term$1742) {
            res$1743.unshift(stx$1741[i$1744]);
            i$1744++;
        }
        return {
            result: term$1742,
            destructed: res$1743,
            rest: stx$1741.slice(res$1743.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1683(patternClass$1745, stx$1746, env$1747) {
        var result$1748, rest$1749, match$1750;
        // pattern has no parse class
        if (patternClass$1745 === 'token' && stx$1746[0] && stx$1746[0].token.type !== parser$1660.Token.EOF) {
            result$1748 = [stx$1746[0]];
            rest$1749 = stx$1746.slice(1);
        } else if (patternClass$1745 === 'lit' && stx$1746[0] && typeIsLiteral$1672(stx$1746[0].token.type)) {
            result$1748 = [stx$1746[0]];
            rest$1749 = stx$1746.slice(1);
        } else if (patternClass$1745 === 'ident' && stx$1746[0] && stx$1746[0].token.type === parser$1660.Token.Identifier) {
            result$1748 = [stx$1746[0]];
            rest$1749 = stx$1746.slice(1);
        } else if (stx$1746.length > 0 && patternClass$1745 === 'VariableStatement') {
            match$1750 = stx$1746[0].term ? cachedTermMatch$1682(stx$1746, stx$1746[0].term) : expander$1661.enforest(stx$1746, expander$1661.makeExpanderContext({ env: env$1747 }));
            if (match$1750.result && match$1750.result.hasPrototype(expander$1661.VariableStatement)) {
                result$1748 = match$1750.destructed || match$1750.result.destruct(false);
                rest$1749 = match$1750.rest;
            } else {
                result$1748 = null;
                rest$1749 = stx$1746;
            }
        } else if (stx$1746.length > 0 && patternClass$1745 === 'expr') {
            match$1750 = stx$1746[0].term ? cachedTermMatch$1682(stx$1746, stx$1746[0].term) : expander$1661.get_expression(stx$1746, expander$1661.makeExpanderContext({ env: env$1747 }));
            if (match$1750.result === null || !match$1750.result.hasPrototype(expander$1661.Expr)) {
                result$1748 = null;
                rest$1749 = stx$1746;
            } else {
                result$1748 = match$1750.destructed || match$1750.result.destruct(false);
                rest$1749 = match$1750.rest;
            }
        } else {
            result$1748 = null;
            rest$1749 = stx$1746;
        }
        return {
            result: result$1748,
            rest: rest$1749
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1684(patterns$1751, stx$1752, env$1753, topLevel$1754) {
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
        topLevel$1754 = topLevel$1754 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1755 = [];
        var patternEnv$1756 = {};
        var match$1757;
        var pattern$1758;
        var rest$1759 = stx$1752;
        var success$1760 = true;
        var inLeading$1761;
        patternLoop:
            for (var i$1762 = 0; i$1762 < patterns$1751.length; i$1762++) {
                if (success$1760 === false) {
                    break;
                }
                pattern$1758 = patterns$1751[i$1762];
                inLeading$1761 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1758.repeat && i$1762 + 1 < patterns$1751.length) {
                        var restMatch$1763 = matchPatterns$1684(patterns$1751.slice(i$1762 + 1), rest$1759, env$1753, topLevel$1754);
                        if (restMatch$1763.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1757 = matchPattern$1685(pattern$1758, [], env$1753, patternEnv$1756, topLevel$1754);
                            patternEnv$1756 = _$1659.extend(restMatch$1763.patternEnv, match$1757.patternEnv);
                            rest$1759 = restMatch$1763.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1758.repeat && pattern$1758.leading && pattern$1758.separator !== ' ') {
                        if (rest$1759[0].token.value === pattern$1758.separator) {
                            if (!inLeading$1761) {
                                inLeading$1761 = true;
                            }
                            rest$1759 = rest$1759.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1761) {
                                success$1760 = false;
                                break;
                            }
                        }
                    }
                    match$1757 = matchPattern$1685(pattern$1758, rest$1759, env$1753, patternEnv$1756, topLevel$1754);
                    if (!match$1757.success && pattern$1758.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1757.success) {
                        success$1760 = false;
                        break;
                    }
                    rest$1759 = match$1757.rest;
                    patternEnv$1756 = match$1757.patternEnv;
                    if (success$1760 && !(topLevel$1754 || pattern$1758.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1762 == patterns$1751.length - 1 && rest$1759.length !== 0) {
                            success$1760 = false;
                            break;
                        }
                    }
                    if (pattern$1758.repeat && !pattern$1758.leading && success$1760) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1758.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1759[0] && rest$1759[0].token.value === pattern$1758.separator) {
                            // more tokens and the next token matches the separator
                            rest$1759 = rest$1759.slice(1);
                        } else if (pattern$1758.separator !== ' ' && rest$1759.length > 0 && i$1762 === patterns$1751.length - 1 && topLevel$1754 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1760 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1758.repeat && success$1760 && rest$1759.length > 0);
            }
        var result$1755;
        if (success$1760) {
            result$1755 = rest$1759.length ? stx$1752.slice(0, -rest$1759.length) : stx$1752;
        } else {
            result$1755 = [];
        }
        return {
            success: success$1760,
            result: result$1755,
            rest: rest$1759,
            patternEnv: patternEnv$1756
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
    function matchPattern$1685(pattern$1764, stx$1765, env$1766, patternEnv$1767, topLevel$1768) {
        var subMatch$1769;
        var match$1770, matchEnv$1771;
        var rest$1772;
        var success$1773;
        if (typeof pattern$1764.inner !== 'undefined') {
            if (pattern$1764.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1769 = matchPatterns$1684(pattern$1764.inner, stx$1765, env$1766, true);
                rest$1772 = subMatch$1769.rest;
            } else if (stx$1765[0] && stx$1765[0].token.type === parser$1660.Token.Delimiter && stx$1765[0].token.value === pattern$1764.value) {
                stx$1765[0].expose();
                if (pattern$1764.inner.length === 0 && stx$1765[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1765,
                        patternEnv: patternEnv$1767
                    };
                }
                subMatch$1769 = matchPatterns$1684(pattern$1764.inner, stx$1765[0].token.inner, env$1766, false);
                rest$1772 = stx$1765.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1765,
                    patternEnv: patternEnv$1767
                };
            }
            success$1773 = subMatch$1769.success;
            // merge the subpattern matches with the current pattern environment
            _$1659.keys(subMatch$1769.patternEnv).forEach(function (patternKey$1774) {
                if (pattern$1764.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1775 = subMatch$1769.patternEnv[patternKey$1774].level + 1;
                    if (patternEnv$1767[patternKey$1774]) {
                        patternEnv$1767[patternKey$1774].level = nextLevel$1775;
                        patternEnv$1767[patternKey$1774].match.push(subMatch$1769.patternEnv[patternKey$1774]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1767[patternKey$1774] = {
                            level: nextLevel$1775,
                            match: [subMatch$1769.patternEnv[patternKey$1774]],
                            topLevel: topLevel$1768
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1767[patternKey$1774] = subMatch$1769.patternEnv[patternKey$1774];
                }
            });
        } else {
            if (pattern$1764.class === 'pattern_literal') {
                // wildcard
                if (stx$1765[0] && pattern$1764.value === '_') {
                    success$1773 = true;
                    rest$1772 = stx$1765.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1765[0] && pattern$1764.value === stx$1765[0].token.value) {
                    success$1773 = true;
                    rest$1772 = stx$1765.slice(1);
                } else {
                    success$1773 = false;
                    rest$1772 = stx$1765;
                }
            } else {
                match$1770 = matchPatternClass$1683(pattern$1764.class, stx$1765, env$1766);
                success$1773 = match$1770.result !== null;
                rest$1772 = match$1770.rest;
                matchEnv$1771 = {
                    level: 0,
                    match: match$1770.result,
                    topLevel: topLevel$1768
                };
                // push the match onto this value's slot in the environment
                if (pattern$1764.repeat) {
                    if (patternEnv$1767[pattern$1764.value] && success$1773) {
                        patternEnv$1767[pattern$1764.value].match.push(matchEnv$1771);
                    } else if (patternEnv$1767[pattern$1764.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1767[pattern$1764.value] = {
                            level: 1,
                            match: [matchEnv$1771],
                            topLevel: topLevel$1768
                        };
                    }
                } else {
                    patternEnv$1767[pattern$1764.value] = matchEnv$1771;
                }
            }
        }
        return {
            success: success$1773,
            rest: rest$1772,
            patternEnv: patternEnv$1767
        };
    }
    function matchLookbehind$1686(patterns$1776, stx$1777, terms$1778, env$1779) {
        var success$1780, patternEnv$1781, prevStx$1782, prevTerms$1783;
        // No lookbehind, noop.
        if (!patterns$1776.length) {
            success$1780 = true;
            patternEnv$1781 = {};
            prevStx$1782 = stx$1777;
            prevTerms$1783 = terms$1778;
        } else {
            var match$1784 = matchPatterns$1684(patterns$1776, stx$1777, env$1779, true);
            var last$1785 = match$1784.result[match$1784.result.length - 1];
            success$1780 = match$1784.success;
            patternEnv$1781 = match$1784.patternEnv;
            if (success$1780) {
                if (match$1784.rest.length) {
                    if (last$1785 && last$1785.term === match$1784.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1780 = false;
                    } else {
                        prevStx$1782 = match$1784.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1786 = 0, len$1787 = terms$1778.length; i$1786 < len$1787; i$1786++) {
                            if (terms$1778[i$1786] === prevStx$1782[0].term) {
                                prevTerms$1783 = terms$1778.slice(i$1786);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1783 = [];
                    prevStx$1782 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1659.forEach(patternEnv$1781, function (val$1788, key$1789) {
            if (val$1788.level && val$1788.match && val$1788.topLevel) {
                val$1788.match.reverse();
            }
        });
        return {
            success: success$1780,
            patternEnv: patternEnv$1781,
            prevStx: prevStx$1782,
            prevTerms: prevTerms$1783
        };
    }
    function hasMatch$1687(m$1790) {
        if (m$1790.level === 0) {
            return m$1790.match.length > 0;
        }
        return m$1790.match.every(function (m$1791) {
            return hasMatch$1687(m$1791);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1688(macroBody$1792, macroNameStx$1793, env$1794) {
        return _$1659.chain(macroBody$1792).reduce(function (acc$1795, bodyStx$1796, idx$1797, original$1798) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1799 = original$1798[idx$1797 - 1];
            var next$1800 = original$1798[idx$1797 + 1];
            var nextNext$1801 = original$1798[idx$1797 + 2];
            // drop `...`
            if (bodyStx$1796.token.value === '...') {
                return acc$1795;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1674(bodyStx$1796) && next$1800 && next$1800.token.value === '...') {
                return acc$1795;
            }
            // skip the $ in $(...)
            if (bodyStx$1796.token.value === '$' && next$1800 && next$1800.token.type === parser$1660.Token.Delimiter && next$1800.token.value === '()') {
                return acc$1795;
            }
            // mark $[...] as a literal
            if (bodyStx$1796.token.value === '$' && next$1800 && next$1800.token.type === parser$1660.Token.Delimiter && next$1800.token.value === '[]') {
                next$1800.literal = true;
                return acc$1795;
            }
            if (bodyStx$1796.token.type === parser$1660.Token.Delimiter && bodyStx$1796.token.value === '()' && last$1799 && last$1799.token.value === '$') {
                bodyStx$1796.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1796.literal === true) {
                assert$1668(bodyStx$1796.token.type === parser$1660.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1795.concat(bodyStx$1796.token.inner);
            }
            if (next$1800 && next$1800.token.value === '...') {
                bodyStx$1796.repeat = true;
                bodyStx$1796.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1674(next$1800) && nextNext$1801 && nextNext$1801.token.value === '...') {
                bodyStx$1796.repeat = true;
                bodyStx$1796.separator = next$1800.token.inner[0].token.value;
            }
            acc$1795.push(bodyStx$1796);
            return acc$1795;
        }, []).reduce(function (acc$1802, bodyStx$1803, idx$1804) {
            // then do the actual transcription
            if (bodyStx$1803.repeat) {
                if (bodyStx$1803.token.type === parser$1660.Token.Delimiter) {
                    bodyStx$1803.expose();
                    var fv$1805 = _$1659.filter(freeVarsInPattern$1671(bodyStx$1803.token.inner), function (pat$1812) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1794.hasOwnProperty(pat$1812);
                        });
                    var restrictedEnv$1806 = [];
                    var nonScalar$1807 = _$1659.find(fv$1805, function (pat$1813) {
                            return env$1794[pat$1813].level > 0;
                        });
                    assert$1668(typeof nonScalar$1807 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1808 = env$1794[nonScalar$1807].match.length;
                    var sameLength$1809 = _$1659.all(fv$1805, function (pat$1814) {
                            return env$1794[pat$1814].level === 0 || env$1794[pat$1814].match.length === repeatLength$1808;
                        });
                    assert$1668(sameLength$1809, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1659.each(_$1659.range(repeatLength$1808), function (idx$1815) {
                        var renv$1816 = {};
                        _$1659.each(fv$1805, function (pat$1818) {
                            if (env$1794[pat$1818].level === 0) {
                                // copy scalars over
                                renv$1816[pat$1818] = env$1794[pat$1818];
                            } else {
                                // grab the match at this index 
                                renv$1816[pat$1818] = env$1794[pat$1818].match[idx$1815];
                            }
                        });
                        var allHaveMatch$1817 = Object.keys(renv$1816).every(function (pat$1819) {
                                return hasMatch$1687(renv$1816[pat$1819]);
                            });
                        if (allHaveMatch$1817) {
                            restrictedEnv$1806.push(renv$1816);
                        }
                    });
                    var transcribed$1810 = _$1659.map(restrictedEnv$1806, function (renv$1820) {
                            if (bodyStx$1803.group) {
                                return transcribe$1688(bodyStx$1803.token.inner, macroNameStx$1793, renv$1820);
                            } else {
                                var newBody$1821 = syntaxFromToken$1664(_$1659.clone(bodyStx$1803.token), bodyStx$1803);
                                newBody$1821.token.inner = transcribe$1688(bodyStx$1803.token.inner, macroNameStx$1793, renv$1820);
                                return newBody$1821;
                            }
                        });
                    var joined$1811;
                    if (bodyStx$1803.group) {
                        joined$1811 = joinSyntaxArr$1667(transcribed$1810, bodyStx$1803.separator);
                    } else {
                        joined$1811 = joinSyntax$1666(transcribed$1810, bodyStx$1803.separator);
                    }
                    push$1670.apply(acc$1802, joined$1811);
                    return acc$1802;
                }
                if (!env$1794[bodyStx$1803.token.value]) {
                    throwSyntaxError$1669('patterns', 'The pattern variable is not bound for the template', bodyStx$1803);
                } else if (env$1794[bodyStx$1803.token.value].level !== 1) {
                    throwSyntaxError$1669('patterns', 'Ellipses level does not match in the template', bodyStx$1803);
                }
                push$1670.apply(acc$1802, joinRepeatedMatch$1676(env$1794[bodyStx$1803.token.value].match, bodyStx$1803.separator));
                return acc$1802;
            } else {
                if (bodyStx$1803.token.type === parser$1660.Token.Delimiter) {
                    bodyStx$1803.expose();
                    var newBody$1822 = syntaxFromToken$1664(_$1659.clone(bodyStx$1803.token), macroBody$1792);
                    newBody$1822.token.inner = transcribe$1688(bodyStx$1803.token.inner, macroNameStx$1793, env$1794);
                    acc$1802.push(newBody$1822);
                    return acc$1802;
                }
                if (isPatternVar$1675(bodyStx$1803) && Object.prototype.hasOwnProperty.bind(env$1794)(bodyStx$1803.token.value)) {
                    if (!env$1794[bodyStx$1803.token.value]) {
                        throwSyntaxError$1669('patterns', 'The pattern variable is not bound for the template', bodyStx$1803);
                    } else if (env$1794[bodyStx$1803.token.value].level !== 0) {
                        throwSyntaxError$1669('patterns', 'Ellipses level does not match in the template', bodyStx$1803);
                    }
                    push$1670.apply(acc$1802, takeLineContext$1677(bodyStx$1803, env$1794[bodyStx$1803.token.value].match));
                    return acc$1802;
                }
                acc$1802.push(bodyStx$1803);
                return acc$1802;
            }
        }, []).value();
    }
    exports$1658.loadPattern = loadPattern$1681;
    exports$1658.matchPatterns = matchPatterns$1684;
    exports$1658.matchLookbehind = matchLookbehind$1686;
    exports$1658.transcribe = transcribe$1688;
    exports$1658.matchPatternClass = matchPatternClass$1683;
    exports$1658.takeLineContext = takeLineContext$1677;
    exports$1658.takeLine = takeLine$1678;
    exports$1658.typeIsLiteral = typeIsLiteral$1672;
}));
//# sourceMappingURL=patterns.js.map