(function (root$1652, factory$1653) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1653(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1653);
    }
}(this, function (exports$1654, _$1655, parser$1656, expander$1657, syntax$1658) {
    var get_expression$1659 = expander$1657.get_expression;
    var syntaxFromToken$1660 = syntax$1658.syntaxFromToken;
    var makePunc$1661 = syntax$1658.makePunc;
    var joinSyntax$1662 = syntax$1658.joinSyntax;
    var joinSyntaxArr$1663 = syntax$1658.joinSyntaxArr;
    var assert$1664 = syntax$1658.assert;
    var throwSyntaxError$1665 = syntax$1658.throwSyntaxError;
    var push$1666 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1667(pattern$1685) {
        var fv$1686 = [];
        _$1655.each(pattern$1685, function (pat$1687) {
            if (isPatternVar$1671(pat$1687)) {
                fv$1686.push(pat$1687.token.value);
            } else if (pat$1687.token.type === parser$1656.Token.Delimiter) {
                push$1666.apply(fv$1686, freeVarsInPattern$1667(pat$1687.token.inner));
            }
        });
        return fv$1686;
    }
    function typeIsLiteral$1668(type$1688) {
        return type$1688 === parser$1656.Token.NullLiteral || type$1688 === parser$1656.Token.NumericLiteral || type$1688 === parser$1656.Token.StringLiteral || type$1688 === parser$1656.Token.RegexLiteral || type$1688 === parser$1656.Token.BooleanLiteral;
    }
    function containsPatternVar$1669(patterns$1689) {
        return _$1655.any(patterns$1689, function (pat$1690) {
            if (pat$1690.token.type === parser$1656.Token.Delimiter) {
                return containsPatternVar$1669(pat$1690.token.inner);
            }
            return isPatternVar$1671(pat$1690);
        });
    }
    function delimIsSeparator$1670(delim$1691) {
        return delim$1691 && delim$1691.token && delim$1691.token.type === parser$1656.Token.Delimiter && delim$1691.token.value === '()' && delim$1691.token.inner.length === 1 && delim$1691.token.inner[0].token.type !== parser$1656.Token.Delimiter && !containsPatternVar$1669(delim$1691.token.inner);
    }
    function isPatternVar$1671(stx$1692) {
        return stx$1692.token.value[0] === '$' && stx$1692.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1672(tojoin$1693, punc$1694) {
        return _$1655.reduce(_$1655.rest(tojoin$1693, 1), function (acc$1695, join$1696) {
            if (punc$1694 === ' ') {
                return acc$1695.concat(join$1696.match);
            }
            return acc$1695.concat(makePunc$1661(punc$1694, _$1655.first(join$1696.match)), join$1696.match);
        }, _$1655.first(tojoin$1693).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1673(from$1697, to$1698) {
        return _$1655.map(to$1698, function (stx$1699) {
            return takeLine$1674(from$1697, stx$1699);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1674(from$1700, to$1701) {
        var next$1702;
        if (to$1701.token.type === parser$1656.Token.Delimiter) {
            var sm_startLineNumber$1703 = typeof to$1701.token.sm_startLineNumber !== 'undefined' ? to$1701.token.sm_startLineNumber : to$1701.token.startLineNumber;
            var sm_endLineNumber$1704 = typeof to$1701.token.sm_endLineNumber !== 'undefined' ? to$1701.token.sm_endLineNumber : to$1701.token.endLineNumber;
            var sm_startLineStart$1705 = typeof to$1701.token.sm_startLineStart !== 'undefined' ? to$1701.token.sm_startLineStart : to$1701.token.startLineStart;
            var sm_endLineStart$1706 = typeof to$1701.token.sm_endLineStart !== 'undefined' ? to$1701.token.sm_endLineStart : to$1701.token.endLineStart;
            var sm_startRange$1707 = typeof to$1701.token.sm_startRange !== 'undefined' ? to$1701.token.sm_startRange : to$1701.token.startRange;
            var sm_endRange$1708 = typeof to$1701.token.sm_endRange !== 'undefined' ? to$1701.token.sm_endRange : to$1701.token.endRange;
            if (from$1700.token.type === parser$1656.Token.Delimiter) {
                next$1702 = syntaxFromToken$1660({
                    type: parser$1656.Token.Delimiter,
                    value: to$1701.token.value,
                    inner: takeLineContext$1673(from$1700, to$1701.token.inner),
                    startRange: from$1700.token.startRange,
                    endRange: from$1700.token.endRange,
                    startLineNumber: from$1700.token.startLineNumber,
                    startLineStart: from$1700.token.startLineStart,
                    endLineNumber: from$1700.token.endLineNumber,
                    endLineStart: from$1700.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1703,
                    sm_endLineNumber: sm_endLineNumber$1704,
                    sm_startLineStart: sm_startLineStart$1705,
                    sm_endLineStart: sm_endLineStart$1706,
                    sm_startRange: sm_startRange$1707,
                    sm_endRange: sm_endRange$1708
                }, to$1701);
            } else {
                next$1702 = syntaxFromToken$1660({
                    type: parser$1656.Token.Delimiter,
                    value: to$1701.token.value,
                    inner: takeLineContext$1673(from$1700, to$1701.token.inner),
                    startRange: from$1700.token.range,
                    endRange: from$1700.token.range,
                    startLineNumber: from$1700.token.lineNumber,
                    startLineStart: from$1700.token.lineStart,
                    endLineNumber: from$1700.token.lineNumber,
                    endLineStart: from$1700.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1703,
                    sm_endLineNumber: sm_endLineNumber$1704,
                    sm_startLineStart: sm_startLineStart$1705,
                    sm_endLineStart: sm_endLineStart$1706,
                    sm_startRange: sm_startRange$1707,
                    sm_endRange: sm_endRange$1708
                }, to$1701);
            }
        } else {
            var sm_lineNumber$1709 = typeof to$1701.token.sm_lineNumber !== 'undefined' ? to$1701.token.sm_lineNumber : to$1701.token.lineNumber;
            var sm_lineStart$1710 = typeof to$1701.token.sm_lineStart !== 'undefined' ? to$1701.token.sm_lineStart : to$1701.token.lineStart;
            var sm_range$1711 = typeof to$1701.token.sm_range !== 'undefined' ? to$1701.token.sm_range : to$1701.token.range;
            if (from$1700.token.type === parser$1656.Token.Delimiter) {
                next$1702 = syntaxFromToken$1660({
                    value: to$1701.token.value,
                    type: to$1701.token.type,
                    lineNumber: from$1700.token.startLineNumber,
                    lineStart: from$1700.token.startLineStart,
                    range: from$1700.token.startRange,
                    sm_lineNumber: sm_lineNumber$1709,
                    sm_lineStart: sm_lineStart$1710,
                    sm_range: sm_range$1711
                }, to$1701);
            } else {
                next$1702 = syntaxFromToken$1660({
                    value: to$1701.token.value,
                    type: to$1701.token.type,
                    lineNumber: from$1700.token.lineNumber,
                    lineStart: from$1700.token.lineStart,
                    range: from$1700.token.range,
                    sm_lineNumber: sm_lineNumber$1709,
                    sm_lineStart: sm_lineStart$1710,
                    sm_range: sm_range$1711
                }, to$1701);
            }
        }
        if (to$1701.token.leadingComments) {
            next$1702.token.leadingComments = to$1701.token.leadingComments;
        }
        if (to$1701.token.trailingComments) {
            next$1702.token.trailingComments = to$1701.token.trailingComments;
        }
        return next$1702;
    }
    function reversePattern$1675(patterns$1712) {
        var len$1713 = patterns$1712.length;
        var pat$1714;
        return _$1655.reduceRight(patterns$1712, function (acc$1715, pat$1714) {
            if (pat$1714.class === 'pattern_group') {
                pat$1714.token.inner = reversePattern$1675(pat$1714.token.inner);
            }
            if (pat$1714.repeat) {
                pat$1714.leading = !pat$1714.leading;
            }
            acc$1715.push(pat$1714);
            return acc$1715;
        }, []);
    }
    function loadLiteralGroup$1676(patterns$1717) {
        _$1655.forEach(patterns$1717, function (patStx$1718) {
            if (patStx$1718.token.type === parser$1656.Token.Delimiter) {
                patStx$1718.token.inner = loadLiteralGroup$1676(patStx$1718.token.inner);
            } else {
                patStx$1718.class = 'pattern_literal';
            }
        });
        return patterns$1717;
    }
    function loadPattern$1677(patterns$1719, reverse$1720) {
        var patts$1721 = _$1655.chain(patterns$1719).reduce(function (acc$1722, patStx$1723, idx$1724) {
                var last$1725 = patterns$1719[idx$1724 - 1];
                var lastLast$1726 = patterns$1719[idx$1724 - 2];
                var next$1727 = patterns$1719[idx$1724 + 1];
                var nextNext$1728 = patterns$1719[idx$1724 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1723.token.value === ':') {
                    if (last$1725 && isPatternVar$1671(last$1725) && !isPatternVar$1671(next$1727)) {
                        return acc$1722;
                    }
                }
                if (last$1725 && last$1725.token.value === ':') {
                    if (lastLast$1726 && isPatternVar$1671(lastLast$1726) && !isPatternVar$1671(patStx$1723)) {
                        return acc$1722;
                    }
                }
                // skip over $
                if (patStx$1723.token.value === '$' && next$1727 && next$1727.token.type === parser$1656.Token.Delimiter) {
                    return acc$1722;
                }
                if (isPatternVar$1671(patStx$1723)) {
                    if (next$1727 && next$1727.token.value === ':' && !isPatternVar$1671(nextNext$1728)) {
                        if (typeof nextNext$1728 === 'undefined') {
                            throwSyntaxError$1665('patterns', 'expecting a pattern class following a `:`', next$1727);
                        }
                        patStx$1723.class = nextNext$1728.token.value;
                    } else {
                        patStx$1723.class = 'token';
                    }
                } else if (patStx$1723.token.type === parser$1656.Token.Delimiter) {
                    if (last$1725 && last$1725.token.value === '$') {
                        patStx$1723.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1723.class === 'pattern_group' && patStx$1723.token.value === '[]') {
                        patStx$1723.token.inner = loadLiteralGroup$1676(patStx$1723.token.inner);
                    } else {
                        patStx$1723.token.inner = loadPattern$1677(patStx$1723.token.inner);
                    }
                } else {
                    patStx$1723.class = 'pattern_literal';
                }
                acc$1722.push(patStx$1723);
                return acc$1722;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1729, patStx$1730, idx$1731, patterns$1732) {
                var separator$1733 = patStx$1730.separator || ' ';
                var repeat$1734 = patStx$1730.repeat || false;
                var next$1735 = patterns$1732[idx$1731 + 1];
                var nextNext$1736 = patterns$1732[idx$1731 + 2];
                if (next$1735 && next$1735.token.value === '...') {
                    repeat$1734 = true;
                    separator$1733 = ' ';
                } else if (delimIsSeparator$1670(next$1735) && nextNext$1736 && nextNext$1736.token.value === '...') {
                    repeat$1734 = true;
                    assert$1664(next$1735.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1733 = next$1735.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1730.token.value === '...' || delimIsSeparator$1670(patStx$1730) && next$1735 && next$1735.token.value === '...') {
                    return acc$1729;
                }
                patStx$1730.repeat = repeat$1734;
                patStx$1730.separator = separator$1733;
                acc$1729.push(patStx$1730);
                return acc$1729;
            }, []).value();
        return reverse$1720 ? reversePattern$1675(patts$1721) : patts$1721;
    }
    function cachedTermMatch$1678(stx$1737, term$1738) {
        var res$1739 = [];
        var i$1740 = 0;
        while (stx$1737[i$1740] && stx$1737[i$1740].term === term$1738) {
            res$1739.unshift(stx$1737[i$1740]);
            i$1740++;
        }
        return {
            result: term$1738,
            destructed: res$1739,
            rest: stx$1737.slice(res$1739.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1679(patternClass$1741, stx$1742, env$1743) {
        var result$1744, rest$1745, match$1746;
        // pattern has no parse class
        if (patternClass$1741 === 'token' && stx$1742[0] && stx$1742[0].token.type !== parser$1656.Token.EOF) {
            result$1744 = [stx$1742[0]];
            rest$1745 = stx$1742.slice(1);
        } else if (patternClass$1741 === 'lit' && stx$1742[0] && typeIsLiteral$1668(stx$1742[0].token.type)) {
            result$1744 = [stx$1742[0]];
            rest$1745 = stx$1742.slice(1);
        } else if (patternClass$1741 === 'ident' && stx$1742[0] && stx$1742[0].token.type === parser$1656.Token.Identifier) {
            result$1744 = [stx$1742[0]];
            rest$1745 = stx$1742.slice(1);
        } else if (stx$1742.length > 0 && patternClass$1741 === 'VariableStatement') {
            match$1746 = stx$1742[0].term ? cachedTermMatch$1678(stx$1742, stx$1742[0].term) : expander$1657.enforest(stx$1742, expander$1657.makeExpanderContext({ env: env$1743 }));
            if (match$1746.result && match$1746.result.hasPrototype(expander$1657.VariableStatement)) {
                result$1744 = match$1746.destructed || match$1746.result.destruct(false);
                rest$1745 = match$1746.rest;
            } else {
                result$1744 = null;
                rest$1745 = stx$1742;
            }
        } else if (stx$1742.length > 0 && patternClass$1741 === 'expr') {
            match$1746 = stx$1742[0].term ? cachedTermMatch$1678(stx$1742, stx$1742[0].term) : expander$1657.get_expression(stx$1742, expander$1657.makeExpanderContext({ env: env$1743 }));
            if (match$1746.result === null || !match$1746.result.hasPrototype(expander$1657.Expr)) {
                result$1744 = null;
                rest$1745 = stx$1742;
            } else {
                result$1744 = match$1746.destructed || match$1746.result.destruct(false);
                rest$1745 = match$1746.rest;
            }
        } else {
            result$1744 = null;
            rest$1745 = stx$1742;
        }
        return {
            result: result$1744,
            rest: rest$1745
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1680(patterns$1747, stx$1748, env$1749, topLevel$1750) {
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
        topLevel$1750 = topLevel$1750 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1751 = [];
        var patternEnv$1752 = {};
        var match$1753;
        var pattern$1754;
        var rest$1755 = stx$1748;
        var success$1756 = true;
        var inLeading$1757;
        patternLoop:
            for (var i$1758 = 0; i$1758 < patterns$1747.length; i$1758++) {
                if (success$1756 === false) {
                    break;
                }
                pattern$1754 = patterns$1747[i$1758];
                inLeading$1757 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1754.repeat && i$1758 + 1 < patterns$1747.length) {
                        var restMatch$1759 = matchPatterns$1680(patterns$1747.slice(i$1758 + 1), rest$1755, env$1749, topLevel$1750);
                        if (restMatch$1759.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1753 = matchPattern$1681(pattern$1754, [], env$1749, patternEnv$1752, topLevel$1750);
                            patternEnv$1752 = _$1655.extend(restMatch$1759.patternEnv, match$1753.patternEnv);
                            rest$1755 = restMatch$1759.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1754.repeat && pattern$1754.leading && pattern$1754.separator !== ' ') {
                        if (rest$1755[0].token.value === pattern$1754.separator) {
                            if (!inLeading$1757) {
                                inLeading$1757 = true;
                            }
                            rest$1755 = rest$1755.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1757) {
                                success$1756 = false;
                                break;
                            }
                        }
                    }
                    match$1753 = matchPattern$1681(pattern$1754, rest$1755, env$1749, patternEnv$1752, topLevel$1750);
                    if (!match$1753.success && pattern$1754.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1753.success) {
                        success$1756 = false;
                        break;
                    }
                    rest$1755 = match$1753.rest;
                    patternEnv$1752 = match$1753.patternEnv;
                    if (success$1756 && !(topLevel$1750 || pattern$1754.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1758 == patterns$1747.length - 1 && rest$1755.length !== 0) {
                            success$1756 = false;
                            break;
                        }
                    }
                    if (pattern$1754.repeat && !pattern$1754.leading && success$1756) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1754.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1755[0] && rest$1755[0].token.value === pattern$1754.separator) {
                            // more tokens and the next token matches the separator
                            rest$1755 = rest$1755.slice(1);
                        } else if (pattern$1754.separator !== ' ' && rest$1755.length > 0 && i$1758 === patterns$1747.length - 1 && topLevel$1750 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1756 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1754.repeat && success$1756 && rest$1755.length > 0);
            }
        var result$1751;
        if (success$1756) {
            result$1751 = rest$1755.length ? stx$1748.slice(0, -rest$1755.length) : stx$1748;
        } else {
            result$1751 = [];
        }
        return {
            success: success$1756,
            result: result$1751,
            rest: rest$1755,
            patternEnv: patternEnv$1752
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
    function matchPattern$1681(pattern$1760, stx$1761, env$1762, patternEnv$1763, topLevel$1764) {
        var subMatch$1765;
        var match$1766, matchEnv$1767;
        var rest$1768;
        var success$1769;
        if (typeof pattern$1760.inner !== 'undefined') {
            if (pattern$1760.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1765 = matchPatterns$1680(pattern$1760.inner, stx$1761, env$1762, true);
                rest$1768 = subMatch$1765.rest;
            } else if (stx$1761[0] && stx$1761[0].token.type === parser$1656.Token.Delimiter && stx$1761[0].token.value === pattern$1760.value) {
                stx$1761[0].expose();
                if (pattern$1760.inner.length === 0 && stx$1761[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1761,
                        patternEnv: patternEnv$1763
                    };
                }
                subMatch$1765 = matchPatterns$1680(pattern$1760.inner, stx$1761[0].token.inner, env$1762, false);
                rest$1768 = stx$1761.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1761,
                    patternEnv: patternEnv$1763
                };
            }
            success$1769 = subMatch$1765.success;
            // merge the subpattern matches with the current pattern environment
            _$1655.keys(subMatch$1765.patternEnv).forEach(function (patternKey$1770) {
                if (pattern$1760.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1771 = subMatch$1765.patternEnv[patternKey$1770].level + 1;
                    if (patternEnv$1763[patternKey$1770]) {
                        patternEnv$1763[patternKey$1770].level = nextLevel$1771;
                        patternEnv$1763[patternKey$1770].match.push(subMatch$1765.patternEnv[patternKey$1770]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1763[patternKey$1770] = {
                            level: nextLevel$1771,
                            match: [subMatch$1765.patternEnv[patternKey$1770]],
                            topLevel: topLevel$1764
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1763[patternKey$1770] = subMatch$1765.patternEnv[patternKey$1770];
                }
            });
        } else {
            if (pattern$1760.class === 'pattern_literal') {
                // wildcard
                if (stx$1761[0] && pattern$1760.value === '_') {
                    success$1769 = true;
                    rest$1768 = stx$1761.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1761[0] && pattern$1760.value === stx$1761[0].token.value) {
                    success$1769 = true;
                    rest$1768 = stx$1761.slice(1);
                } else {
                    success$1769 = false;
                    rest$1768 = stx$1761;
                }
            } else {
                match$1766 = matchPatternClass$1679(pattern$1760.class, stx$1761, env$1762);
                success$1769 = match$1766.result !== null;
                rest$1768 = match$1766.rest;
                matchEnv$1767 = {
                    level: 0,
                    match: match$1766.result,
                    topLevel: topLevel$1764
                };
                // push the match onto this value's slot in the environment
                if (pattern$1760.repeat) {
                    if (patternEnv$1763[pattern$1760.value] && success$1769) {
                        patternEnv$1763[pattern$1760.value].match.push(matchEnv$1767);
                    } else if (patternEnv$1763[pattern$1760.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1763[pattern$1760.value] = {
                            level: 1,
                            match: [matchEnv$1767],
                            topLevel: topLevel$1764
                        };
                    }
                } else {
                    patternEnv$1763[pattern$1760.value] = matchEnv$1767;
                }
            }
        }
        return {
            success: success$1769,
            rest: rest$1768,
            patternEnv: patternEnv$1763
        };
    }
    function matchLookbehind$1682(patterns$1772, stx$1773, terms$1774, env$1775) {
        var success$1776, patternEnv$1777, prevStx$1778, prevTerms$1779;
        // No lookbehind, noop.
        if (!patterns$1772.length) {
            success$1776 = true;
            patternEnv$1777 = {};
            prevStx$1778 = stx$1773;
            prevTerms$1779 = terms$1774;
        } else {
            var match$1780 = matchPatterns$1680(patterns$1772, stx$1773, env$1775, true);
            var last$1781 = match$1780.result[match$1780.result.length - 1];
            success$1776 = match$1780.success;
            patternEnv$1777 = match$1780.patternEnv;
            if (success$1776) {
                if (match$1780.rest.length) {
                    if (last$1781 && last$1781.term === match$1780.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1776 = false;
                    } else {
                        prevStx$1778 = match$1780.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1782 = 0, len$1783 = terms$1774.length; i$1782 < len$1783; i$1782++) {
                            if (terms$1774[i$1782] === prevStx$1778[0].term) {
                                prevTerms$1779 = terms$1774.slice(i$1782);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1779 = [];
                    prevStx$1778 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1655.forEach(patternEnv$1777, function (val$1784, key$1785) {
            if (val$1784.level && val$1784.match && val$1784.topLevel) {
                val$1784.match.reverse();
            }
        });
        return {
            success: success$1776,
            patternEnv: patternEnv$1777,
            prevStx: prevStx$1778,
            prevTerms: prevTerms$1779
        };
    }
    function hasMatch$1683(m$1786) {
        if (m$1786.level === 0) {
            return m$1786.match.length > 0;
        }
        return m$1786.match.every(function (m$1787) {
            return hasMatch$1683(m$1787);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1684(macroBody$1788, macroNameStx$1789, env$1790) {
        return _$1655.chain(macroBody$1788).reduce(function (acc$1791, bodyStx$1792, idx$1793, original$1794) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1795 = original$1794[idx$1793 - 1];
            var next$1796 = original$1794[idx$1793 + 1];
            var nextNext$1797 = original$1794[idx$1793 + 2];
            // drop `...`
            if (bodyStx$1792.token.value === '...') {
                return acc$1791;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1670(bodyStx$1792) && next$1796 && next$1796.token.value === '...') {
                return acc$1791;
            }
            // skip the $ in $(...)
            if (bodyStx$1792.token.value === '$' && next$1796 && next$1796.token.type === parser$1656.Token.Delimiter && next$1796.token.value === '()') {
                return acc$1791;
            }
            // mark $[...] as a literal
            if (bodyStx$1792.token.value === '$' && next$1796 && next$1796.token.type === parser$1656.Token.Delimiter && next$1796.token.value === '[]') {
                next$1796.literal = true;
                return acc$1791;
            }
            if (bodyStx$1792.token.type === parser$1656.Token.Delimiter && bodyStx$1792.token.value === '()' && last$1795 && last$1795.token.value === '$') {
                bodyStx$1792.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1792.literal === true) {
                assert$1664(bodyStx$1792.token.type === parser$1656.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1791.concat(bodyStx$1792.token.inner);
            }
            if (next$1796 && next$1796.token.value === '...') {
                bodyStx$1792.repeat = true;
                bodyStx$1792.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1670(next$1796) && nextNext$1797 && nextNext$1797.token.value === '...') {
                bodyStx$1792.repeat = true;
                bodyStx$1792.separator = next$1796.token.inner[0].token.value;
            }
            acc$1791.push(bodyStx$1792);
            return acc$1791;
        }, []).reduce(function (acc$1798, bodyStx$1799, idx$1800) {
            // then do the actual transcription
            if (bodyStx$1799.repeat) {
                if (bodyStx$1799.token.type === parser$1656.Token.Delimiter) {
                    bodyStx$1799.expose();
                    var fv$1801 = _$1655.filter(freeVarsInPattern$1667(bodyStx$1799.token.inner), function (pat$1808) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1790.hasOwnProperty(pat$1808);
                        });
                    var restrictedEnv$1802 = [];
                    var nonScalar$1803 = _$1655.find(fv$1801, function (pat$1809) {
                            return env$1790[pat$1809].level > 0;
                        });
                    assert$1664(typeof nonScalar$1803 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1804 = env$1790[nonScalar$1803].match.length;
                    var sameLength$1805 = _$1655.all(fv$1801, function (pat$1810) {
                            return env$1790[pat$1810].level === 0 || env$1790[pat$1810].match.length === repeatLength$1804;
                        });
                    assert$1664(sameLength$1805, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1655.each(_$1655.range(repeatLength$1804), function (idx$1811) {
                        var renv$1812 = {};
                        _$1655.each(fv$1801, function (pat$1814) {
                            if (env$1790[pat$1814].level === 0) {
                                // copy scalars over
                                renv$1812[pat$1814] = env$1790[pat$1814];
                            } else {
                                // grab the match at this index 
                                renv$1812[pat$1814] = env$1790[pat$1814].match[idx$1811];
                            }
                        });
                        var allHaveMatch$1813 = Object.keys(renv$1812).every(function (pat$1815) {
                                return hasMatch$1683(renv$1812[pat$1815]);
                            });
                        if (allHaveMatch$1813) {
                            restrictedEnv$1802.push(renv$1812);
                        }
                    });
                    var transcribed$1806 = _$1655.map(restrictedEnv$1802, function (renv$1816) {
                            if (bodyStx$1799.group) {
                                return transcribe$1684(bodyStx$1799.token.inner, macroNameStx$1789, renv$1816);
                            } else {
                                var newBody$1817 = syntaxFromToken$1660(_$1655.clone(bodyStx$1799.token), bodyStx$1799);
                                newBody$1817.token.inner = transcribe$1684(bodyStx$1799.token.inner, macroNameStx$1789, renv$1816);
                                return newBody$1817;
                            }
                        });
                    var joined$1807;
                    if (bodyStx$1799.group) {
                        joined$1807 = joinSyntaxArr$1663(transcribed$1806, bodyStx$1799.separator);
                    } else {
                        joined$1807 = joinSyntax$1662(transcribed$1806, bodyStx$1799.separator);
                    }
                    push$1666.apply(acc$1798, joined$1807);
                    return acc$1798;
                }
                if (!env$1790[bodyStx$1799.token.value]) {
                    throwSyntaxError$1665('patterns', 'The pattern variable is not bound for the template', bodyStx$1799);
                } else if (env$1790[bodyStx$1799.token.value].level !== 1) {
                    throwSyntaxError$1665('patterns', 'Ellipses level does not match in the template', bodyStx$1799);
                }
                push$1666.apply(acc$1798, joinRepeatedMatch$1672(env$1790[bodyStx$1799.token.value].match, bodyStx$1799.separator));
                return acc$1798;
            } else {
                if (bodyStx$1799.token.type === parser$1656.Token.Delimiter) {
                    bodyStx$1799.expose();
                    var newBody$1818 = syntaxFromToken$1660(_$1655.clone(bodyStx$1799.token), macroBody$1788);
                    newBody$1818.token.inner = transcribe$1684(bodyStx$1799.token.inner, macroNameStx$1789, env$1790);
                    acc$1798.push(newBody$1818);
                    return acc$1798;
                }
                if (isPatternVar$1671(bodyStx$1799) && Object.prototype.hasOwnProperty.bind(env$1790)(bodyStx$1799.token.value)) {
                    if (!env$1790[bodyStx$1799.token.value]) {
                        throwSyntaxError$1665('patterns', 'The pattern variable is not bound for the template', bodyStx$1799);
                    } else if (env$1790[bodyStx$1799.token.value].level !== 0) {
                        throwSyntaxError$1665('patterns', 'Ellipses level does not match in the template', bodyStx$1799);
                    }
                    push$1666.apply(acc$1798, takeLineContext$1673(bodyStx$1799, env$1790[bodyStx$1799.token.value].match));
                    return acc$1798;
                }
                acc$1798.push(bodyStx$1799);
                return acc$1798;
            }
        }, []).value();
    }
    exports$1654.loadPattern = loadPattern$1677;
    exports$1654.matchPatterns = matchPatterns$1680;
    exports$1654.matchLookbehind = matchLookbehind$1682;
    exports$1654.transcribe = transcribe$1684;
    exports$1654.matchPatternClass = matchPatternClass$1679;
    exports$1654.takeLineContext = takeLineContext$1673;
    exports$1654.takeLine = takeLine$1674;
    exports$1654.typeIsLiteral = typeIsLiteral$1668;
}));
//# sourceMappingURL=patterns.js.map