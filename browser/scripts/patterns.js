(function (root$1649, factory$1650) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1650(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1650);
    }
}(this, function (exports$1651, _$1652, parser$1653, expander$1654, syntax$1655) {
    var get_expression$1656 = expander$1654.get_expression;
    var syntaxFromToken$1657 = syntax$1655.syntaxFromToken;
    var makePunc$1658 = syntax$1655.makePunc;
    var joinSyntax$1659 = syntax$1655.joinSyntax;
    var joinSyntaxArr$1660 = syntax$1655.joinSyntaxArr;
    var assert$1661 = syntax$1655.assert;
    var throwSyntaxError$1662 = syntax$1655.throwSyntaxError;
    var push$1663 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1664(pattern$1682) {
        var fv$1683 = [];
        _$1652.each(pattern$1682, function (pat$1684) {
            if (isPatternVar$1668(pat$1684)) {
                fv$1683.push(pat$1684.token.value);
            } else if (pat$1684.token.type === parser$1653.Token.Delimiter) {
                push$1663.apply(fv$1683, freeVarsInPattern$1664(pat$1684.token.inner));
            }
        });
        return fv$1683;
    }
    function typeIsLiteral$1665(type$1685) {
        return type$1685 === parser$1653.Token.NullLiteral || type$1685 === parser$1653.Token.NumericLiteral || type$1685 === parser$1653.Token.StringLiteral || type$1685 === parser$1653.Token.RegexLiteral || type$1685 === parser$1653.Token.BooleanLiteral;
    }
    function containsPatternVar$1666(patterns$1686) {
        return _$1652.any(patterns$1686, function (pat$1687) {
            if (pat$1687.token.type === parser$1653.Token.Delimiter) {
                return containsPatternVar$1666(pat$1687.token.inner);
            }
            return isPatternVar$1668(pat$1687);
        });
    }
    function delimIsSeparator$1667(delim$1688) {
        return delim$1688 && delim$1688.token && delim$1688.token.type === parser$1653.Token.Delimiter && delim$1688.token.value === '()' && delim$1688.token.inner.length === 1 && delim$1688.token.inner[0].token.type !== parser$1653.Token.Delimiter && !containsPatternVar$1666(delim$1688.token.inner);
    }
    function isPatternVar$1668(stx$1689) {
        return stx$1689.token.value[0] === '$' && stx$1689.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1669(tojoin$1690, punc$1691) {
        return _$1652.reduce(_$1652.rest(tojoin$1690, 1), function (acc$1692, join$1693) {
            if (punc$1691 === ' ') {
                return acc$1692.concat(join$1693.match);
            }
            return acc$1692.concat(makePunc$1658(punc$1691, _$1652.first(join$1693.match)), join$1693.match);
        }, _$1652.first(tojoin$1690).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1670(from$1694, to$1695) {
        return _$1652.map(to$1695, function (stx$1696) {
            return takeLine$1671(from$1694, stx$1696);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1671(from$1697, to$1698) {
        var next$1699;
        if (to$1698.token.type === parser$1653.Token.Delimiter) {
            var sm_startLineNumber$1700 = typeof to$1698.token.sm_startLineNumber !== 'undefined' ? to$1698.token.sm_startLineNumber : to$1698.token.startLineNumber;
            var sm_endLineNumber$1701 = typeof to$1698.token.sm_endLineNumber !== 'undefined' ? to$1698.token.sm_endLineNumber : to$1698.token.endLineNumber;
            var sm_startLineStart$1702 = typeof to$1698.token.sm_startLineStart !== 'undefined' ? to$1698.token.sm_startLineStart : to$1698.token.startLineStart;
            var sm_endLineStart$1703 = typeof to$1698.token.sm_endLineStart !== 'undefined' ? to$1698.token.sm_endLineStart : to$1698.token.endLineStart;
            var sm_startRange$1704 = typeof to$1698.token.sm_startRange !== 'undefined' ? to$1698.token.sm_startRange : to$1698.token.startRange;
            var sm_endRange$1705 = typeof to$1698.token.sm_endRange !== 'undefined' ? to$1698.token.sm_endRange : to$1698.token.endRange;
            if (from$1697.token.type === parser$1653.Token.Delimiter) {
                next$1699 = syntaxFromToken$1657({
                    type: parser$1653.Token.Delimiter,
                    value: to$1698.token.value,
                    inner: takeLineContext$1670(from$1697, to$1698.token.inner),
                    startRange: from$1697.token.startRange,
                    endRange: from$1697.token.endRange,
                    startLineNumber: from$1697.token.startLineNumber,
                    startLineStart: from$1697.token.startLineStart,
                    endLineNumber: from$1697.token.endLineNumber,
                    endLineStart: from$1697.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1700,
                    sm_endLineNumber: sm_endLineNumber$1701,
                    sm_startLineStart: sm_startLineStart$1702,
                    sm_endLineStart: sm_endLineStart$1703,
                    sm_startRange: sm_startRange$1704,
                    sm_endRange: sm_endRange$1705
                }, to$1698);
            } else {
                next$1699 = syntaxFromToken$1657({
                    type: parser$1653.Token.Delimiter,
                    value: to$1698.token.value,
                    inner: takeLineContext$1670(from$1697, to$1698.token.inner),
                    startRange: from$1697.token.range,
                    endRange: from$1697.token.range,
                    startLineNumber: from$1697.token.lineNumber,
                    startLineStart: from$1697.token.lineStart,
                    endLineNumber: from$1697.token.lineNumber,
                    endLineStart: from$1697.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1700,
                    sm_endLineNumber: sm_endLineNumber$1701,
                    sm_startLineStart: sm_startLineStart$1702,
                    sm_endLineStart: sm_endLineStart$1703,
                    sm_startRange: sm_startRange$1704,
                    sm_endRange: sm_endRange$1705
                }, to$1698);
            }
        } else {
            var sm_lineNumber$1706 = typeof to$1698.token.sm_lineNumber !== 'undefined' ? to$1698.token.sm_lineNumber : to$1698.token.lineNumber;
            var sm_lineStart$1707 = typeof to$1698.token.sm_lineStart !== 'undefined' ? to$1698.token.sm_lineStart : to$1698.token.lineStart;
            var sm_range$1708 = typeof to$1698.token.sm_range !== 'undefined' ? to$1698.token.sm_range : to$1698.token.range;
            if (from$1697.token.type === parser$1653.Token.Delimiter) {
                next$1699 = syntaxFromToken$1657({
                    value: to$1698.token.value,
                    type: to$1698.token.type,
                    lineNumber: from$1697.token.startLineNumber,
                    lineStart: from$1697.token.startLineStart,
                    range: from$1697.token.startRange,
                    sm_lineNumber: sm_lineNumber$1706,
                    sm_lineStart: sm_lineStart$1707,
                    sm_range: sm_range$1708
                }, to$1698);
            } else {
                next$1699 = syntaxFromToken$1657({
                    value: to$1698.token.value,
                    type: to$1698.token.type,
                    lineNumber: from$1697.token.lineNumber,
                    lineStart: from$1697.token.lineStart,
                    range: from$1697.token.range,
                    sm_lineNumber: sm_lineNumber$1706,
                    sm_lineStart: sm_lineStart$1707,
                    sm_range: sm_range$1708
                }, to$1698);
            }
        }
        if (to$1698.token.leadingComments) {
            next$1699.token.leadingComments = to$1698.token.leadingComments;
        }
        if (to$1698.token.trailingComments) {
            next$1699.token.trailingComments = to$1698.token.trailingComments;
        }
        return next$1699;
    }
    function reversePattern$1672(patterns$1709) {
        var len$1710 = patterns$1709.length;
        var pat$1711;
        return _$1652.reduceRight(patterns$1709, function (acc$1712, pat$1711) {
            if (pat$1711.class === 'pattern_group') {
                pat$1711.token.inner = reversePattern$1672(pat$1711.token.inner);
            }
            if (pat$1711.repeat) {
                pat$1711.leading = !pat$1711.leading;
            }
            acc$1712.push(pat$1711);
            return acc$1712;
        }, []);
    }
    function loadLiteralGroup$1673(patterns$1714) {
        _$1652.forEach(patterns$1714, function (patStx$1715) {
            if (patStx$1715.token.type === parser$1653.Token.Delimiter) {
                patStx$1715.token.inner = loadLiteralGroup$1673(patStx$1715.token.inner);
            } else {
                patStx$1715.class = 'pattern_literal';
            }
        });
        return patterns$1714;
    }
    function loadPattern$1674(patterns$1716, reverse$1717) {
        var patts$1718 = _$1652.chain(patterns$1716).reduce(function (acc$1719, patStx$1720, idx$1721) {
                var last$1722 = patterns$1716[idx$1721 - 1];
                var lastLast$1723 = patterns$1716[idx$1721 - 2];
                var next$1724 = patterns$1716[idx$1721 + 1];
                var nextNext$1725 = patterns$1716[idx$1721 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1720.token.value === ':') {
                    if (last$1722 && isPatternVar$1668(last$1722) && !isPatternVar$1668(next$1724)) {
                        return acc$1719;
                    }
                }
                if (last$1722 && last$1722.token.value === ':') {
                    if (lastLast$1723 && isPatternVar$1668(lastLast$1723) && !isPatternVar$1668(patStx$1720)) {
                        return acc$1719;
                    }
                }
                // skip over $
                if (patStx$1720.token.value === '$' && next$1724 && next$1724.token.type === parser$1653.Token.Delimiter) {
                    return acc$1719;
                }
                if (isPatternVar$1668(patStx$1720)) {
                    if (next$1724 && next$1724.token.value === ':' && !isPatternVar$1668(nextNext$1725)) {
                        if (typeof nextNext$1725 === 'undefined') {
                            throwSyntaxError$1662('patterns', 'expecting a pattern class following a `:`', next$1724);
                        }
                        patStx$1720.class = nextNext$1725.token.value;
                    } else {
                        patStx$1720.class = 'token';
                    }
                } else if (patStx$1720.token.type === parser$1653.Token.Delimiter) {
                    if (last$1722 && last$1722.token.value === '$') {
                        patStx$1720.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1720.class === 'pattern_group' && patStx$1720.token.value === '[]') {
                        patStx$1720.token.inner = loadLiteralGroup$1673(patStx$1720.token.inner);
                    } else {
                        patStx$1720.token.inner = loadPattern$1674(patStx$1720.token.inner);
                    }
                } else {
                    patStx$1720.class = 'pattern_literal';
                }
                acc$1719.push(patStx$1720);
                return acc$1719;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1726, patStx$1727, idx$1728, patterns$1729) {
                var separator$1730 = patStx$1727.separator || ' ';
                var repeat$1731 = patStx$1727.repeat || false;
                var next$1732 = patterns$1729[idx$1728 + 1];
                var nextNext$1733 = patterns$1729[idx$1728 + 2];
                if (next$1732 && next$1732.token.value === '...') {
                    repeat$1731 = true;
                    separator$1730 = ' ';
                } else if (delimIsSeparator$1667(next$1732) && nextNext$1733 && nextNext$1733.token.value === '...') {
                    repeat$1731 = true;
                    assert$1661(next$1732.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1730 = next$1732.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1727.token.value === '...' || delimIsSeparator$1667(patStx$1727) && next$1732 && next$1732.token.value === '...') {
                    return acc$1726;
                }
                patStx$1727.repeat = repeat$1731;
                patStx$1727.separator = separator$1730;
                acc$1726.push(patStx$1727);
                return acc$1726;
            }, []).value();
        return reverse$1717 ? reversePattern$1672(patts$1718) : patts$1718;
    }
    function cachedTermMatch$1675(stx$1734, term$1735) {
        var res$1736 = [];
        var i$1737 = 0;
        while (stx$1734[i$1737] && stx$1734[i$1737].term === term$1735) {
            res$1736.unshift(stx$1734[i$1737]);
            i$1737++;
        }
        return {
            result: term$1735,
            destructed: res$1736,
            rest: stx$1734.slice(res$1736.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1676(patternClass$1738, stx$1739, env$1740) {
        var result$1741, rest$1742, match$1743;
        // pattern has no parse class
        if (patternClass$1738 === 'token' && stx$1739[0] && stx$1739[0].token.type !== parser$1653.Token.EOF) {
            result$1741 = [stx$1739[0]];
            rest$1742 = stx$1739.slice(1);
        } else if (patternClass$1738 === 'lit' && stx$1739[0] && typeIsLiteral$1665(stx$1739[0].token.type)) {
            result$1741 = [stx$1739[0]];
            rest$1742 = stx$1739.slice(1);
        } else if (patternClass$1738 === 'ident' && stx$1739[0] && stx$1739[0].token.type === parser$1653.Token.Identifier) {
            result$1741 = [stx$1739[0]];
            rest$1742 = stx$1739.slice(1);
        } else if (stx$1739.length > 0 && patternClass$1738 === 'VariableStatement') {
            match$1743 = stx$1739[0].term ? cachedTermMatch$1675(stx$1739, stx$1739[0].term) : expander$1654.enforest(stx$1739, expander$1654.makeExpanderContext({ env: env$1740 }));
            if (match$1743.result && match$1743.result.hasPrototype(expander$1654.VariableStatement)) {
                result$1741 = match$1743.destructed || match$1743.result.destruct(false);
                rest$1742 = match$1743.rest;
            } else {
                result$1741 = null;
                rest$1742 = stx$1739;
            }
        } else if (stx$1739.length > 0 && patternClass$1738 === 'expr') {
            match$1743 = stx$1739[0].term ? cachedTermMatch$1675(stx$1739, stx$1739[0].term) : expander$1654.get_expression(stx$1739, expander$1654.makeExpanderContext({ env: env$1740 }));
            if (match$1743.result === null || !match$1743.result.hasPrototype(expander$1654.Expr)) {
                result$1741 = null;
                rest$1742 = stx$1739;
            } else {
                result$1741 = match$1743.destructed || match$1743.result.destruct(false);
                rest$1742 = match$1743.rest;
            }
        } else {
            result$1741 = null;
            rest$1742 = stx$1739;
        }
        return {
            result: result$1741,
            rest: rest$1742
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1677(patterns$1744, stx$1745, env$1746, topLevel$1747) {
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
        topLevel$1747 = topLevel$1747 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1748 = [];
        var patternEnv$1749 = {};
        var match$1750;
        var pattern$1751;
        var rest$1752 = stx$1745;
        var success$1753 = true;
        var inLeading$1754;
        patternLoop:
            for (var i$1755 = 0; i$1755 < patterns$1744.length; i$1755++) {
                if (success$1753 === false) {
                    break;
                }
                pattern$1751 = patterns$1744[i$1755];
                inLeading$1754 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1751.repeat && i$1755 + 1 < patterns$1744.length) {
                        var restMatch$1756 = matchPatterns$1677(patterns$1744.slice(i$1755 + 1), rest$1752, env$1746, topLevel$1747);
                        if (restMatch$1756.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1750 = matchPattern$1678(pattern$1751, [], env$1746, patternEnv$1749);
                            patternEnv$1749 = _$1652.extend(restMatch$1756.patternEnv, match$1750.patternEnv);
                            rest$1752 = restMatch$1756.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1751.repeat && pattern$1751.leading && pattern$1751.separator !== ' ') {
                        if (rest$1752[0].token.value === pattern$1751.separator) {
                            if (!inLeading$1754) {
                                inLeading$1754 = true;
                            }
                            rest$1752 = rest$1752.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1754) {
                                success$1753 = false;
                                break;
                            }
                        }
                    }
                    match$1750 = matchPattern$1678(pattern$1751, rest$1752, env$1746, patternEnv$1749);
                    if (!match$1750.success && pattern$1751.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1750.success) {
                        success$1753 = false;
                        break;
                    }
                    rest$1752 = match$1750.rest;
                    patternEnv$1749 = match$1750.patternEnv;
                    if (success$1753 && !(topLevel$1747 || pattern$1751.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1755 == patterns$1744.length - 1 && rest$1752.length !== 0) {
                            success$1753 = false;
                            break;
                        }
                    }
                    if (pattern$1751.repeat && !pattern$1751.leading && success$1753) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1751.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1752[0] && rest$1752[0].token.value === pattern$1751.separator) {
                            // more tokens and the next token matches the separator
                            rest$1752 = rest$1752.slice(1);
                        } else if (pattern$1751.separator !== ' ' && rest$1752.length > 0 && i$1755 === patterns$1744.length - 1 && topLevel$1747 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1753 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1751.repeat && success$1753 && rest$1752.length > 0);
            }
        var result$1748;
        if (success$1753) {
            result$1748 = rest$1752.length ? stx$1745.slice(0, -rest$1752.length) : stx$1745;
        } else {
            result$1748 = [];
        }
        return {
            success: success$1753,
            result: result$1748,
            rest: rest$1752,
            patternEnv: patternEnv$1749
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
    function matchPattern$1678(pattern$1757, stx$1758, env$1759, patternEnv$1760) {
        var subMatch$1761;
        var match$1762, matchEnv$1763;
        var rest$1764;
        var success$1765;
        if (typeof pattern$1757.inner !== 'undefined') {
            if (pattern$1757.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1761 = matchPatterns$1677(pattern$1757.inner, stx$1758, env$1759, true);
                rest$1764 = subMatch$1761.rest;
            } else if (stx$1758[0] && stx$1758[0].token.type === parser$1653.Token.Delimiter && stx$1758[0].token.value === pattern$1757.value) {
                stx$1758[0].expose();
                if (pattern$1757.inner.length === 0 && stx$1758[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1758,
                        patternEnv: patternEnv$1760
                    };
                }
                subMatch$1761 = matchPatterns$1677(pattern$1757.inner, stx$1758[0].token.inner, env$1759, false);
                rest$1764 = stx$1758.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1758,
                    patternEnv: patternEnv$1760
                };
            }
            success$1765 = subMatch$1761.success;
            // merge the subpattern matches with the current pattern environment
            _$1652.keys(subMatch$1761.patternEnv).forEach(function (patternKey$1766) {
                if (pattern$1757.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1767 = subMatch$1761.patternEnv[patternKey$1766].level + 1;
                    if (patternEnv$1760[patternKey$1766]) {
                        patternEnv$1760[patternKey$1766].level = nextLevel$1767;
                        patternEnv$1760[patternKey$1766].match.push(subMatch$1761.patternEnv[patternKey$1766]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1760[patternKey$1766] = {
                            level: nextLevel$1767,
                            match: [subMatch$1761.patternEnv[patternKey$1766]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1760[patternKey$1766] = subMatch$1761.patternEnv[patternKey$1766];
                }
            });
        } else {
            if (pattern$1757.class === 'pattern_literal') {
                // wildcard
                if (stx$1758[0] && pattern$1757.value === '_') {
                    success$1765 = true;
                    rest$1764 = stx$1758.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1758[0] && pattern$1757.value === stx$1758[0].token.value) {
                    success$1765 = true;
                    rest$1764 = stx$1758.slice(1);
                } else {
                    success$1765 = false;
                    rest$1764 = stx$1758;
                }
            } else {
                match$1762 = matchPatternClass$1676(pattern$1757.class, stx$1758, env$1759);
                success$1765 = match$1762.result !== null;
                rest$1764 = match$1762.rest;
                matchEnv$1763 = {
                    level: 0,
                    match: match$1762.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1757.repeat) {
                    if (patternEnv$1760[pattern$1757.value] && success$1765) {
                        patternEnv$1760[pattern$1757.value].match.push(matchEnv$1763);
                    } else if (patternEnv$1760[pattern$1757.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1760[pattern$1757.value] = {
                            level: 1,
                            match: [matchEnv$1763]
                        };
                    }
                } else {
                    patternEnv$1760[pattern$1757.value] = matchEnv$1763;
                }
            }
        }
        return {
            success: success$1765,
            rest: rest$1764,
            patternEnv: patternEnv$1760
        };
    }
    function matchLookbehind$1679(patterns$1768, stx$1769, terms$1770, env$1771) {
        var success$1772, patternEnv$1773, prevStx$1774, prevTerms$1775;
        // No lookbehind, noop.
        if (!patterns$1768.length) {
            success$1772 = true;
            patternEnv$1773 = {};
            prevStx$1774 = stx$1769;
            prevTerms$1775 = terms$1770;
        } else {
            var match$1776 = matchPatterns$1677(patterns$1768, stx$1769, env$1771, true);
            var last$1777 = match$1776.result[match$1776.result.length - 1];
            success$1772 = match$1776.success;
            patternEnv$1773 = match$1776.patternEnv;
            if (success$1772) {
                if (match$1776.rest.length) {
                    if (last$1777 && last$1777.term === match$1776.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1772 = false;
                    } else {
                        prevStx$1774 = match$1776.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1778 = 0, len$1779 = terms$1770.length; i$1778 < len$1779; i$1778++) {
                            if (terms$1770[i$1778] === prevStx$1774[0].term) {
                                prevTerms$1775 = terms$1770.slice(i$1778);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1775 = [];
                    prevStx$1774 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1652.forEach(patternEnv$1773, function (val$1780, key$1781) {
            if (val$1780.level && val$1780.match) {
                val$1780.match.reverse();
            }
        });
        return {
            success: success$1772,
            patternEnv: patternEnv$1773,
            prevStx: prevStx$1774,
            prevTerms: prevTerms$1775
        };
    }
    function hasMatch$1680(m$1782) {
        if (m$1782.level === 0) {
            return m$1782.match.length > 0;
        }
        return m$1782.match.every(function (m$1783) {
            return hasMatch$1680(m$1783);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1681(macroBody$1784, macroNameStx$1785, env$1786) {
        return _$1652.chain(macroBody$1784).reduce(function (acc$1787, bodyStx$1788, idx$1789, original$1790) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1791 = original$1790[idx$1789 - 1];
            var next$1792 = original$1790[idx$1789 + 1];
            var nextNext$1793 = original$1790[idx$1789 + 2];
            // drop `...`
            if (bodyStx$1788.token.value === '...') {
                return acc$1787;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1667(bodyStx$1788) && next$1792 && next$1792.token.value === '...') {
                return acc$1787;
            }
            // skip the $ in $(...)
            if (bodyStx$1788.token.value === '$' && next$1792 && next$1792.token.type === parser$1653.Token.Delimiter && next$1792.token.value === '()') {
                return acc$1787;
            }
            // mark $[...] as a literal
            if (bodyStx$1788.token.value === '$' && next$1792 && next$1792.token.type === parser$1653.Token.Delimiter && next$1792.token.value === '[]') {
                next$1792.literal = true;
                return acc$1787;
            }
            if (bodyStx$1788.token.type === parser$1653.Token.Delimiter && bodyStx$1788.token.value === '()' && last$1791 && last$1791.token.value === '$') {
                bodyStx$1788.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1788.literal === true) {
                assert$1661(bodyStx$1788.token.type === parser$1653.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1787.concat(bodyStx$1788.token.inner);
            }
            if (next$1792 && next$1792.token.value === '...') {
                bodyStx$1788.repeat = true;
                bodyStx$1788.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1667(next$1792) && nextNext$1793 && nextNext$1793.token.value === '...') {
                bodyStx$1788.repeat = true;
                bodyStx$1788.separator = next$1792.token.inner[0].token.value;
            }
            acc$1787.push(bodyStx$1788);
            return acc$1787;
        }, []).reduce(function (acc$1794, bodyStx$1795, idx$1796) {
            // then do the actual transcription
            if (bodyStx$1795.repeat) {
                if (bodyStx$1795.token.type === parser$1653.Token.Delimiter) {
                    bodyStx$1795.expose();
                    var fv$1797 = _$1652.filter(freeVarsInPattern$1664(bodyStx$1795.token.inner), function (pat$1804) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1786.hasOwnProperty(pat$1804);
                        });
                    var restrictedEnv$1798 = [];
                    var nonScalar$1799 = _$1652.find(fv$1797, function (pat$1805) {
                            return env$1786[pat$1805].level > 0;
                        });
                    assert$1661(typeof nonScalar$1799 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1800 = env$1786[nonScalar$1799].match.length;
                    var sameLength$1801 = _$1652.all(fv$1797, function (pat$1806) {
                            return env$1786[pat$1806].level === 0 || env$1786[pat$1806].match.length === repeatLength$1800;
                        });
                    assert$1661(sameLength$1801, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1652.each(_$1652.range(repeatLength$1800), function (idx$1807) {
                        var renv$1808 = {};
                        _$1652.each(fv$1797, function (pat$1810) {
                            if (env$1786[pat$1810].level === 0) {
                                // copy scalars over
                                renv$1808[pat$1810] = env$1786[pat$1810];
                            } else {
                                // grab the match at this index 
                                renv$1808[pat$1810] = env$1786[pat$1810].match[idx$1807];
                            }
                        });
                        var allHaveMatch$1809 = Object.keys(renv$1808).every(function (pat$1811) {
                                return hasMatch$1680(renv$1808[pat$1811]);
                            });
                        if (allHaveMatch$1809) {
                            restrictedEnv$1798.push(renv$1808);
                        }
                    });
                    var transcribed$1802 = _$1652.map(restrictedEnv$1798, function (renv$1812) {
                            if (bodyStx$1795.group) {
                                return transcribe$1681(bodyStx$1795.token.inner, macroNameStx$1785, renv$1812);
                            } else {
                                var newBody$1813 = syntaxFromToken$1657(_$1652.clone(bodyStx$1795.token), bodyStx$1795);
                                newBody$1813.token.inner = transcribe$1681(bodyStx$1795.token.inner, macroNameStx$1785, renv$1812);
                                return newBody$1813;
                            }
                        });
                    var joined$1803;
                    if (bodyStx$1795.group) {
                        joined$1803 = joinSyntaxArr$1660(transcribed$1802, bodyStx$1795.separator);
                    } else {
                        joined$1803 = joinSyntax$1659(transcribed$1802, bodyStx$1795.separator);
                    }
                    push$1663.apply(acc$1794, joined$1803);
                    return acc$1794;
                }
                if (!env$1786[bodyStx$1795.token.value]) {
                    throwSyntaxError$1662('patterns', 'The pattern variable is not bound for the template', bodyStx$1795);
                } else if (env$1786[bodyStx$1795.token.value].level !== 1) {
                    throwSyntaxError$1662('patterns', 'Ellipses level does not match in the template', bodyStx$1795);
                }
                push$1663.apply(acc$1794, joinRepeatedMatch$1669(env$1786[bodyStx$1795.token.value].match, bodyStx$1795.separator));
                return acc$1794;
            } else {
                if (bodyStx$1795.token.type === parser$1653.Token.Delimiter) {
                    bodyStx$1795.expose();
                    var newBody$1814 = syntaxFromToken$1657(_$1652.clone(bodyStx$1795.token), macroBody$1784);
                    newBody$1814.token.inner = transcribe$1681(bodyStx$1795.token.inner, macroNameStx$1785, env$1786);
                    acc$1794.push(newBody$1814);
                    return acc$1794;
                }
                if (isPatternVar$1668(bodyStx$1795) && Object.prototype.hasOwnProperty.bind(env$1786)(bodyStx$1795.token.value)) {
                    if (!env$1786[bodyStx$1795.token.value]) {
                        throwSyntaxError$1662('patterns', 'The pattern variable is not bound for the template', bodyStx$1795);
                    } else if (env$1786[bodyStx$1795.token.value].level !== 0) {
                        throwSyntaxError$1662('patterns', 'Ellipses level does not match in the template', bodyStx$1795);
                    }
                    push$1663.apply(acc$1794, takeLineContext$1670(bodyStx$1795, env$1786[bodyStx$1795.token.value].match));
                    return acc$1794;
                }
                acc$1794.push(bodyStx$1795);
                return acc$1794;
            }
        }, []).value();
    }
    exports$1651.loadPattern = loadPattern$1674;
    exports$1651.matchPatterns = matchPatterns$1677;
    exports$1651.matchLookbehind = matchLookbehind$1679;
    exports$1651.transcribe = transcribe$1681;
    exports$1651.matchPatternClass = matchPatternClass$1676;
    exports$1651.takeLineContext = takeLineContext$1670;
    exports$1651.takeLine = takeLine$1671;
    exports$1651.typeIsLiteral = typeIsLiteral$1665;
}));
//# sourceMappingURL=patterns.js.map