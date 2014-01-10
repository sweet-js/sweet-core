(function (root$1644, factory$1645) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1645(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander',
            'syntax'
        ], factory$1645);
    }
}(this, function (exports$1646, _$1647, parser$1648, expander$1649, syntax$1650) {
    var get_expression$1651 = expander$1649.get_expression;
    var syntaxFromToken$1652 = syntax$1650.syntaxFromToken;
    var makePunc$1653 = syntax$1650.makePunc;
    var joinSyntax$1654 = syntax$1650.joinSyntax;
    var joinSyntaxArr$1655 = syntax$1650.joinSyntaxArr;
    var assert$1656 = syntax$1650.assert;
    var throwSyntaxError$1657 = syntax$1650.throwSyntaxError;
    var push$1658 = Array.prototype.push;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1659(pattern$1677) {
        var fv$1678 = [];
        _$1647.each(pattern$1677, function (pat$1679) {
            if (isPatternVar$1663(pat$1679)) {
                fv$1678.push(pat$1679.token.value);
            } else if (pat$1679.token.type === parser$1648.Token.Delimiter) {
                push$1658.apply(fv$1678, freeVarsInPattern$1659(pat$1679.token.inner));
            }
        });
        return fv$1678;
    }
    function typeIsLiteral$1660(type$1680) {
        return type$1680 === parser$1648.Token.NullLiteral || type$1680 === parser$1648.Token.NumericLiteral || type$1680 === parser$1648.Token.StringLiteral || type$1680 === parser$1648.Token.RegexLiteral || type$1680 === parser$1648.Token.BooleanLiteral;
    }
    function containsPatternVar$1661(patterns$1681) {
        return _$1647.any(patterns$1681, function (pat$1682) {
            if (pat$1682.token.type === parser$1648.Token.Delimiter) {
                return containsPatternVar$1661(pat$1682.token.inner);
            }
            return isPatternVar$1663(pat$1682);
        });
    }
    function delimIsSeparator$1662(delim$1683) {
        return delim$1683 && delim$1683.token && delim$1683.token.type === parser$1648.Token.Delimiter && delim$1683.token.value === '()' && delim$1683.token.inner.length === 1 && delim$1683.token.inner[0].token.type !== parser$1648.Token.Delimiter && !containsPatternVar$1661(delim$1683.token.inner);
    }
    function isPatternVar$1663(stx$1684) {
        return stx$1684.token.value[0] === '$' && stx$1684.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1664(tojoin$1685, punc$1686) {
        return _$1647.reduce(_$1647.rest(tojoin$1685, 1), function (acc$1687, join$1688) {
            if (punc$1686 === ' ') {
                return acc$1687.concat(join$1688.match);
            }
            return acc$1687.concat(makePunc$1653(punc$1686, _$1647.first(join$1688.match)), join$1688.match);
        }, _$1647.first(tojoin$1685).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1665(from$1689, to$1690) {
        return _$1647.map(to$1690, function (stx$1691) {
            return takeLine$1666(from$1689, stx$1691);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1666(from$1692, to$1693) {
        var next$1694;
        if (to$1693.token.type === parser$1648.Token.Delimiter) {
            var sm_startLineNumber$1695 = typeof to$1693.token.sm_startLineNumber !== 'undefined' ? to$1693.token.sm_startLineNumber : to$1693.token.startLineNumber;
            var sm_endLineNumber$1696 = typeof to$1693.token.sm_endLineNumber !== 'undefined' ? to$1693.token.sm_endLineNumber : to$1693.token.endLineNumber;
            var sm_startLineStart$1697 = typeof to$1693.token.sm_startLineStart !== 'undefined' ? to$1693.token.sm_startLineStart : to$1693.token.startLineStart;
            var sm_endLineStart$1698 = typeof to$1693.token.sm_endLineStart !== 'undefined' ? to$1693.token.sm_endLineStart : to$1693.token.endLineStart;
            var sm_startRange$1699 = typeof to$1693.token.sm_startRange !== 'undefined' ? to$1693.token.sm_startRange : to$1693.token.startRange;
            var sm_endRange$1700 = typeof to$1693.token.sm_endRange !== 'undefined' ? to$1693.token.sm_endRange : to$1693.token.endRange;
            if (from$1692.token.type === parser$1648.Token.Delimiter) {
                next$1694 = syntaxFromToken$1652({
                    type: parser$1648.Token.Delimiter,
                    value: to$1693.token.value,
                    inner: takeLineContext$1665(from$1692, to$1693.token.inner),
                    startRange: from$1692.token.startRange,
                    endRange: from$1692.token.endRange,
                    startLineNumber: from$1692.token.startLineNumber,
                    startLineStart: from$1692.token.startLineStart,
                    endLineNumber: from$1692.token.endLineNumber,
                    endLineStart: from$1692.token.endLineStart,
                    sm_startLineNumber: sm_startLineNumber$1695,
                    sm_endLineNumber: sm_endLineNumber$1696,
                    sm_startLineStart: sm_startLineStart$1697,
                    sm_endLineStart: sm_endLineStart$1698,
                    sm_startRange: sm_startRange$1699,
                    sm_endRange: sm_endRange$1700
                }, to$1693);
            } else {
                next$1694 = syntaxFromToken$1652({
                    type: parser$1648.Token.Delimiter,
                    value: to$1693.token.value,
                    inner: takeLineContext$1665(from$1692, to$1693.token.inner),
                    startRange: from$1692.token.range,
                    endRange: from$1692.token.range,
                    startLineNumber: from$1692.token.lineNumber,
                    startLineStart: from$1692.token.lineStart,
                    endLineNumber: from$1692.token.lineNumber,
                    endLineStart: from$1692.token.lineStart,
                    sm_startLineNumber: sm_startLineNumber$1695,
                    sm_endLineNumber: sm_endLineNumber$1696,
                    sm_startLineStart: sm_startLineStart$1697,
                    sm_endLineStart: sm_endLineStart$1698,
                    sm_startRange: sm_startRange$1699,
                    sm_endRange: sm_endRange$1700
                }, to$1693);
            }
        } else {
            var sm_lineNumber$1701 = typeof to$1693.token.sm_lineNumber !== 'undefined' ? to$1693.token.sm_lineNumber : to$1693.token.lineNumber;
            var sm_lineStart$1702 = typeof to$1693.token.sm_lineStart !== 'undefined' ? to$1693.token.sm_lineStart : to$1693.token.lineStart;
            var sm_range$1703 = typeof to$1693.token.sm_range !== 'undefined' ? to$1693.token.sm_range : to$1693.token.range;
            if (from$1692.token.type === parser$1648.Token.Delimiter) {
                next$1694 = syntaxFromToken$1652({
                    value: to$1693.token.value,
                    type: to$1693.token.type,
                    lineNumber: from$1692.token.startLineNumber,
                    lineStart: from$1692.token.startLineStart,
                    range: from$1692.token.startRange,
                    sm_lineNumber: sm_lineNumber$1701,
                    sm_lineStart: sm_lineStart$1702,
                    sm_range: sm_range$1703
                }, to$1693);
            } else {
                next$1694 = syntaxFromToken$1652({
                    value: to$1693.token.value,
                    type: to$1693.token.type,
                    lineNumber: from$1692.token.lineNumber,
                    lineStart: from$1692.token.lineStart,
                    range: from$1692.token.range,
                    sm_lineNumber: sm_lineNumber$1701,
                    sm_lineStart: sm_lineStart$1702,
                    sm_range: sm_range$1703
                }, to$1693);
            }
        }
        if (to$1693.token.leadingComments) {
            next$1694.token.leadingComments = to$1693.token.leadingComments;
        }
        if (to$1693.token.trailingComments) {
            next$1694.token.trailingComments = to$1693.token.trailingComments;
        }
        return next$1694;
    }
    function reversePattern$1667(patterns$1704) {
        var len$1705 = patterns$1704.length;
        var pat$1706;
        return _$1647.reduceRight(patterns$1704, function (acc$1707, pat$1706) {
            if (pat$1706.class === 'pattern_group') {
                pat$1706.token.inner = reversePattern$1667(pat$1706.token.inner);
            }
            if (pat$1706.repeat) {
                pat$1706.leading = !pat$1706.leading;
            }
            acc$1707.push(pat$1706);
            return acc$1707;
        }, []);
    }
    function loadLiteralGroup$1668(patterns$1709) {
        _$1647.forEach(patterns$1709, function (patStx$1710) {
            if (patStx$1710.token.type === parser$1648.Token.Delimiter) {
                patStx$1710.token.inner = loadLiteralGroup$1668(patStx$1710.token.inner);
            } else {
                patStx$1710.class = 'pattern_literal';
            }
        });
        return patterns$1709;
    }
    function loadPattern$1669(patterns$1711, reverse$1712) {
        var patts$1713 = _$1647.chain(patterns$1711).reduce(function (acc$1714, patStx$1715, idx$1716) {
                var last$1717 = patterns$1711[idx$1716 - 1];
                var lastLast$1718 = patterns$1711[idx$1716 - 2];
                var next$1719 = patterns$1711[idx$1716 + 1];
                var nextNext$1720 = patterns$1711[idx$1716 + 2];
                // skip over the `:lit` part of `$x:lit`
                if (patStx$1715.token.value === ':') {
                    if (last$1717 && isPatternVar$1663(last$1717) && !isPatternVar$1663(next$1719)) {
                        return acc$1714;
                    }
                }
                if (last$1717 && last$1717.token.value === ':') {
                    if (lastLast$1718 && isPatternVar$1663(lastLast$1718) && !isPatternVar$1663(patStx$1715)) {
                        return acc$1714;
                    }
                }
                // skip over $
                if (patStx$1715.token.value === '$' && next$1719 && next$1719.token.type === parser$1648.Token.Delimiter) {
                    return acc$1714;
                }
                if (isPatternVar$1663(patStx$1715)) {
                    if (next$1719 && next$1719.token.value === ':' && !isPatternVar$1663(nextNext$1720)) {
                        if (typeof nextNext$1720 === 'undefined') {
                            throwSyntaxError$1657('patterns', 'expecting a pattern class following a `:`', next$1719);
                        }
                        patStx$1715.class = nextNext$1720.token.value;
                    } else {
                        patStx$1715.class = 'token';
                    }
                } else if (patStx$1715.token.type === parser$1648.Token.Delimiter) {
                    if (last$1717 && last$1717.token.value === '$') {
                        patStx$1715.class = 'pattern_group';
                    }
                    // Leave literal groups as is
                    if (patStx$1715.class === 'pattern_group' && patStx$1715.token.value === '[]') {
                        patStx$1715.token.inner = loadLiteralGroup$1668(patStx$1715.token.inner);
                    } else {
                        patStx$1715.token.inner = loadPattern$1669(patStx$1715.token.inner);
                    }
                } else {
                    patStx$1715.class = 'pattern_literal';
                }
                acc$1714.push(patStx$1715);
                return acc$1714;
            }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1721, patStx$1722, idx$1723, patterns$1724) {
                var separator$1725 = patStx$1722.separator || ' ';
                var repeat$1726 = patStx$1722.repeat || false;
                var next$1727 = patterns$1724[idx$1723 + 1];
                var nextNext$1728 = patterns$1724[idx$1723 + 2];
                if (next$1727 && next$1727.token.value === '...') {
                    repeat$1726 = true;
                    separator$1725 = ' ';
                } else if (delimIsSeparator$1662(next$1727) && nextNext$1728 && nextNext$1728.token.value === '...') {
                    repeat$1726 = true;
                    assert$1656(next$1727.token.inner.length === 1, 'currently assuming all separators are a single token');
                    separator$1725 = next$1727.token.inner[0].token.value;
                }
                // skip over ... and (,)
                if (patStx$1722.token.value === '...' || delimIsSeparator$1662(patStx$1722) && next$1727 && next$1727.token.value === '...') {
                    return acc$1721;
                }
                patStx$1722.repeat = repeat$1726;
                patStx$1722.separator = separator$1725;
                acc$1721.push(patStx$1722);
                return acc$1721;
            }, []).value();
        return reverse$1712 ? reversePattern$1667(patts$1713) : patts$1713;
    }
    function cachedTermMatch$1670(stx$1729, term$1730) {
        var res$1731 = [];
        var i$1732 = 0;
        while (stx$1729[i$1732] && stx$1729[i$1732].term === term$1730) {
            res$1731.unshift(stx$1729[i$1732]);
            i$1732++;
        }
        return {
            result: term$1730,
            destructed: res$1731,
            rest: stx$1729.slice(res$1731.length)
        };
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1671(patternClass$1733, stx$1734, env$1735) {
        var result$1736, rest$1737, match$1738;
        // pattern has no parse class
        if (patternClass$1733 === 'token' && stx$1734[0] && stx$1734[0].token.type !== parser$1648.Token.EOF) {
            result$1736 = [stx$1734[0]];
            rest$1737 = stx$1734.slice(1);
        } else if (patternClass$1733 === 'lit' && stx$1734[0] && typeIsLiteral$1660(stx$1734[0].token.type)) {
            result$1736 = [stx$1734[0]];
            rest$1737 = stx$1734.slice(1);
        } else if (patternClass$1733 === 'ident' && stx$1734[0] && stx$1734[0].token.type === parser$1648.Token.Identifier) {
            result$1736 = [stx$1734[0]];
            rest$1737 = stx$1734.slice(1);
        } else if (stx$1734.length > 0 && patternClass$1733 === 'VariableStatement') {
            match$1738 = stx$1734[0].term ? cachedTermMatch$1670(stx$1734, stx$1734[0].term) : expander$1649.enforest(stx$1734, expander$1649.makeExpanderContext({ env: env$1735 }));
            if (match$1738.result && match$1738.result.hasPrototype(expander$1649.VariableStatement)) {
                result$1736 = match$1738.destructed || match$1738.result.destruct(false);
                rest$1737 = match$1738.rest;
            } else {
                result$1736 = null;
                rest$1737 = stx$1734;
            }
        } else if (stx$1734.length > 0 && patternClass$1733 === 'expr') {
            match$1738 = stx$1734[0].term ? cachedTermMatch$1670(stx$1734, stx$1734[0].term) : expander$1649.get_expression(stx$1734, expander$1649.makeExpanderContext({ env: env$1735 }));
            if (match$1738.result === null || !match$1738.result.hasPrototype(expander$1649.Expr)) {
                result$1736 = null;
                rest$1737 = stx$1734;
            } else {
                result$1736 = match$1738.destructed || match$1738.result.destruct(false);
                rest$1737 = match$1738.rest;
            }
        } else {
            result$1736 = null;
            rest$1737 = stx$1734;
        }
        return {
            result: result$1736,
            rest: rest$1737
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1672(patterns$1739, stx$1740, env$1741, topLevel$1742) {
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
        topLevel$1742 = topLevel$1742 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1743 = [];
        var patternEnv$1744 = {};
        var match$1745;
        var pattern$1746;
        var rest$1747 = stx$1740;
        var success$1748 = true;
        var inLeading$1749;
        patternLoop:
            for (var i$1750 = 0; i$1750 < patterns$1739.length; i$1750++) {
                if (success$1748 === false) {
                    break;
                }
                pattern$1746 = patterns$1739[i$1750];
                inLeading$1749 = false;
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1746.repeat && i$1750 + 1 < patterns$1739.length) {
                        var restMatch$1751 = matchPatterns$1672(patterns$1739.slice(i$1750 + 1), rest$1747, env$1741, topLevel$1742);
                        if (restMatch$1751.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1745 = matchPattern$1673(pattern$1746, [], env$1741, patternEnv$1744);
                            patternEnv$1744 = _$1647.extend(restMatch$1751.patternEnv, match$1745.patternEnv);
                            rest$1747 = restMatch$1751.rest;
                            break patternLoop;
                        }
                    }
                    if (pattern$1746.repeat && pattern$1746.leading && pattern$1746.separator !== ' ') {
                        if (rest$1747[0].token.value === pattern$1746.separator) {
                            if (!inLeading$1749) {
                                inLeading$1749 = true;
                            }
                            rest$1747 = rest$1747.slice(1);
                        } else {
                            // If we are in a leading repeat, the separator is required.
                            if (inLeading$1749) {
                                success$1748 = false;
                                break;
                            }
                        }
                    }
                    match$1745 = matchPattern$1673(pattern$1746, rest$1747, env$1741, patternEnv$1744);
                    if (!match$1745.success && pattern$1746.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1745.success) {
                        success$1748 = false;
                        break;
                    }
                    rest$1747 = match$1745.rest;
                    patternEnv$1744 = match$1745.patternEnv;
                    if (success$1748 && !(topLevel$1742 || pattern$1746.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1750 == patterns$1739.length - 1 && rest$1747.length !== 0) {
                            success$1748 = false;
                            break;
                        }
                    }
                    if (pattern$1746.repeat && !pattern$1746.leading && success$1748) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (pattern$1746.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (rest$1747[0] && rest$1747[0].token.value === pattern$1746.separator) {
                            // more tokens and the next token matches the separator
                            rest$1747 = rest$1747.slice(1);
                        } else if (pattern$1746.separator !== ' ' && rest$1747.length > 0 && i$1750 === patterns$1739.length - 1 && topLevel$1742 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1748 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1746.repeat && success$1748 && rest$1747.length > 0);
            }
        var result$1743;
        if (success$1748) {
            result$1743 = rest$1747.length ? stx$1740.slice(0, -rest$1747.length) : stx$1740;
        } else {
            result$1743 = [];
        }
        return {
            success: success$1748,
            result: result$1743,
            rest: rest$1747,
            patternEnv: patternEnv$1744
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
    function matchPattern$1673(pattern$1752, stx$1753, env$1754, patternEnv$1755) {
        var subMatch$1756;
        var match$1757, matchEnv$1758;
        var rest$1759;
        var success$1760;
        if (typeof pattern$1752.inner !== 'undefined') {
            if (pattern$1752.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1756 = matchPatterns$1672(pattern$1752.inner, stx$1753, env$1754, true);
                rest$1759 = subMatch$1756.rest;
            } else if (stx$1753[0] && stx$1753[0].token.type === parser$1648.Token.Delimiter && stx$1753[0].token.value === pattern$1752.value) {
                stx$1753[0].expose();
                if (pattern$1752.inner.length === 0 && stx$1753[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1753,
                        patternEnv: patternEnv$1755
                    };
                }
                subMatch$1756 = matchPatterns$1672(pattern$1752.inner, stx$1753[0].token.inner, env$1754, false);
                rest$1759 = stx$1753.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1753,
                    patternEnv: patternEnv$1755
                };
            }
            success$1760 = subMatch$1756.success;
            // merge the subpattern matches with the current pattern environment
            _$1647.keys(subMatch$1756.patternEnv).forEach(function (patternKey$1761) {
                if (pattern$1752.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1762 = subMatch$1756.patternEnv[patternKey$1761].level + 1;
                    if (patternEnv$1755[patternKey$1761]) {
                        patternEnv$1755[patternKey$1761].level = nextLevel$1762;
                        patternEnv$1755[patternKey$1761].match.push(subMatch$1756.patternEnv[patternKey$1761]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1755[patternKey$1761] = {
                            level: nextLevel$1762,
                            match: [subMatch$1756.patternEnv[patternKey$1761]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1755[patternKey$1761] = subMatch$1756.patternEnv[patternKey$1761];
                }
            });
        } else {
            if (pattern$1752.class === 'pattern_literal') {
                // wildcard
                if (stx$1753[0] && pattern$1752.value === '_') {
                    success$1760 = true;
                    rest$1759 = stx$1753.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1753[0] && pattern$1752.value === stx$1753[0].token.value) {
                    success$1760 = true;
                    rest$1759 = stx$1753.slice(1);
                } else {
                    success$1760 = false;
                    rest$1759 = stx$1753;
                }
            } else {
                match$1757 = matchPatternClass$1671(pattern$1752.class, stx$1753, env$1754);
                success$1760 = match$1757.result !== null;
                rest$1759 = match$1757.rest;
                matchEnv$1758 = {
                    level: 0,
                    match: match$1757.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1752.repeat) {
                    if (patternEnv$1755[pattern$1752.value] && success$1760) {
                        patternEnv$1755[pattern$1752.value].match.push(matchEnv$1758);
                    } else if (patternEnv$1755[pattern$1752.value] === undefined) {
                        // initialize if necessary
                        patternEnv$1755[pattern$1752.value] = {
                            level: 1,
                            match: [matchEnv$1758]
                        };
                    }
                } else {
                    patternEnv$1755[pattern$1752.value] = matchEnv$1758;
                }
            }
        }
        return {
            success: success$1760,
            rest: rest$1759,
            patternEnv: patternEnv$1755
        };
    }
    function matchLookbehind$1674(patterns$1763, stx$1764, terms$1765, env$1766) {
        var success$1767, patternEnv$1768, prevStx$1769, prevTerms$1770;
        // No lookbehind, noop.
        if (!patterns$1763.length) {
            success$1767 = true;
            patternEnv$1768 = {};
            prevStx$1769 = stx$1764;
            prevTerms$1770 = terms$1765;
        } else {
            var match$1771 = matchPatterns$1672(patterns$1763, stx$1764, env$1766, true);
            var last$1772 = match$1771.result[match$1771.result.length - 1];
            success$1767 = match$1771.success;
            patternEnv$1768 = match$1771.patternEnv;
            if (success$1767) {
                if (match$1771.rest.length) {
                    if (last$1772 && last$1772.term === match$1771.rest[0].term) {
                        // The term tree was split, so its a failed match;
                        success$1767 = false;
                    } else {
                        prevStx$1769 = match$1771.rest;
                        // Find where to slice the prevTerms to match up with
                        // the state of prevStx.
                        for (var i$1773 = 0, len$1774 = terms$1765.length; i$1773 < len$1774; i$1773++) {
                            if (terms$1765[i$1773] === prevStx$1769[0].term) {
                                prevTerms$1770 = terms$1765.slice(i$1773);
                                break;
                            }
                        }
                    }
                } else {
                    prevTerms$1770 = [];
                    prevStx$1769 = [];
                }
            }
        }
        // We need to reverse the matches for any top level repeaters because
        // they match in reverse, and thus put their results in backwards.
        _$1647.forEach(patternEnv$1768, function (val$1775, key$1776) {
            if (val$1775.level && val$1775.match) {
                val$1775.match.reverse();
            }
        });
        return {
            success: success$1767,
            patternEnv: patternEnv$1768,
            prevStx: prevStx$1769,
            prevTerms: prevTerms$1770
        };
    }
    function hasMatch$1675(m$1777) {
        if (m$1777.level === 0) {
            return m$1777.match.length > 0;
        }
        return m$1777.match.every(function (m$1778) {
            return hasMatch$1675(m$1778);
        });
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1676(macroBody$1779, macroNameStx$1780, env$1781) {
        return _$1647.chain(macroBody$1779).reduce(function (acc$1782, bodyStx$1783, idx$1784, original$1785) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1786 = original$1785[idx$1784 - 1];
            var next$1787 = original$1785[idx$1784 + 1];
            var nextNext$1788 = original$1785[idx$1784 + 2];
            // drop `...`
            if (bodyStx$1783.token.value === '...') {
                return acc$1782;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1662(bodyStx$1783) && next$1787 && next$1787.token.value === '...') {
                return acc$1782;
            }
            // skip the $ in $(...)
            if (bodyStx$1783.token.value === '$' && next$1787 && next$1787.token.type === parser$1648.Token.Delimiter && next$1787.token.value === '()') {
                return acc$1782;
            }
            // mark $[...] as a literal
            if (bodyStx$1783.token.value === '$' && next$1787 && next$1787.token.type === parser$1648.Token.Delimiter && next$1787.token.value === '[]') {
                next$1787.literal = true;
                return acc$1782;
            }
            if (bodyStx$1783.token.type === parser$1648.Token.Delimiter && bodyStx$1783.token.value === '()' && last$1786 && last$1786.token.value === '$') {
                bodyStx$1783.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1783.literal === true) {
                assert$1656(bodyStx$1783.token.type === parser$1648.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1782.concat(bodyStx$1783.token.inner);
            }
            if (next$1787 && next$1787.token.value === '...') {
                bodyStx$1783.repeat = true;
                bodyStx$1783.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1662(next$1787) && nextNext$1788 && nextNext$1788.token.value === '...') {
                bodyStx$1783.repeat = true;
                bodyStx$1783.separator = next$1787.token.inner[0].token.value;
            }
            acc$1782.push(bodyStx$1783);
            return acc$1782;
        }, []).reduce(function (acc$1789, bodyStx$1790, idx$1791) {
            // then do the actual transcription
            if (bodyStx$1790.repeat) {
                if (bodyStx$1790.token.type === parser$1648.Token.Delimiter) {
                    bodyStx$1790.expose();
                    var fv$1792 = _$1647.filter(freeVarsInPattern$1659(bodyStx$1790.token.inner), function (pat$1799) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1781.hasOwnProperty(pat$1799);
                        });
                    var restrictedEnv$1793 = [];
                    var nonScalar$1794 = _$1647.find(fv$1792, function (pat$1800) {
                            return env$1781[pat$1800].level > 0;
                        });
                    assert$1656(typeof nonScalar$1794 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1795 = env$1781[nonScalar$1794].match.length;
                    var sameLength$1796 = _$1647.all(fv$1792, function (pat$1801) {
                            return env$1781[pat$1801].level === 0 || env$1781[pat$1801].match.length === repeatLength$1795;
                        });
                    assert$1656(sameLength$1796, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    _$1647.each(_$1647.range(repeatLength$1795), function (idx$1802) {
                        var renv$1803 = {};
                        _$1647.each(fv$1792, function (pat$1805) {
                            if (env$1781[pat$1805].level === 0) {
                                // copy scalars over
                                renv$1803[pat$1805] = env$1781[pat$1805];
                            } else {
                                // grab the match at this index 
                                renv$1803[pat$1805] = env$1781[pat$1805].match[idx$1802];
                            }
                        });
                        var allHaveMatch$1804 = Object.keys(renv$1803).every(function (pat$1806) {
                                return hasMatch$1675(renv$1803[pat$1806]);
                            });
                        if (allHaveMatch$1804) {
                            restrictedEnv$1793.push(renv$1803);
                        }
                    });
                    var transcribed$1797 = _$1647.map(restrictedEnv$1793, function (renv$1807) {
                            if (bodyStx$1790.group) {
                                return transcribe$1676(bodyStx$1790.token.inner, macroNameStx$1780, renv$1807);
                            } else {
                                var newBody$1808 = syntaxFromToken$1652(_$1647.clone(bodyStx$1790.token), bodyStx$1790);
                                newBody$1808.token.inner = transcribe$1676(bodyStx$1790.token.inner, macroNameStx$1780, renv$1807);
                                return newBody$1808;
                            }
                        });
                    var joined$1798;
                    if (bodyStx$1790.group) {
                        joined$1798 = joinSyntaxArr$1655(transcribed$1797, bodyStx$1790.separator);
                    } else {
                        joined$1798 = joinSyntax$1654(transcribed$1797, bodyStx$1790.separator);
                    }
                    push$1658.apply(acc$1789, joined$1798);
                    return acc$1789;
                }
                if (!env$1781[bodyStx$1790.token.value]) {
                    throwSyntaxError$1657('patterns', 'The pattern variable is not bound for the template', bodyStx$1790);
                } else if (env$1781[bodyStx$1790.token.value].level !== 1) {
                    throwSyntaxError$1657('patterns', 'Ellipses level does not match in the template', bodyStx$1790);
                }
                push$1658.apply(acc$1789, joinRepeatedMatch$1664(env$1781[bodyStx$1790.token.value].match, bodyStx$1790.separator));
                return acc$1789;
            } else {
                if (bodyStx$1790.token.type === parser$1648.Token.Delimiter) {
                    bodyStx$1790.expose();
                    var newBody$1809 = syntaxFromToken$1652(_$1647.clone(bodyStx$1790.token), macroBody$1779);
                    newBody$1809.token.inner = transcribe$1676(bodyStx$1790.token.inner, macroNameStx$1780, env$1781);
                    acc$1789.push(newBody$1809);
                    return acc$1789;
                }
                if (isPatternVar$1663(bodyStx$1790) && Object.prototype.hasOwnProperty.bind(env$1781)(bodyStx$1790.token.value)) {
                    if (!env$1781[bodyStx$1790.token.value]) {
                        throwSyntaxError$1657('patterns', 'The pattern variable is not bound for the template', bodyStx$1790);
                    } else if (env$1781[bodyStx$1790.token.value].level !== 0) {
                        throwSyntaxError$1657('patterns', 'Ellipses level does not match in the template', bodyStx$1790);
                    }
                    push$1658.apply(acc$1789, takeLineContext$1665(bodyStx$1790, env$1781[bodyStx$1790.token.value].match));
                    return acc$1789;
                }
                acc$1789.push(bodyStx$1790);
                return acc$1789;
            }
        }, []).value();
    }
    exports$1646.loadPattern = loadPattern$1669;
    exports$1646.matchPatterns = matchPatterns$1672;
    exports$1646.matchLookbehind = matchLookbehind$1674;
    exports$1646.transcribe = transcribe$1676;
    exports$1646.matchPatternClass = matchPatternClass$1671;
    exports$1646.takeLineContext = takeLineContext$1665;
    exports$1646.takeLine = takeLine$1666;
    exports$1646.typeIsLiteral = typeIsLiteral$1660;
}));
//# sourceMappingURL=patterns.js.map