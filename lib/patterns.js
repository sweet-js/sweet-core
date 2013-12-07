(function (root$1640, factory$1641) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1641(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1641);
    }
}(this, function (exports$1642, _$1643, es6$1644, parser$1645, expander$1646, syntax$1647) {
    var get_expression$1648 = expander$1646.get_expression;
    var syntaxFromToken$1649 = syntax$1647.syntaxFromToken;
    var makePunc$1650 = syntax$1647.makePunc;
    var joinSyntax$1651 = syntax$1647.joinSyntax;
    var joinSyntaxArr$1652 = syntax$1647.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1653(pattern$1666) {
        var fv$1667 = [];
        _$1643.each(pattern$1666, function (pat$1668) {
            if (isPatternVar$1657(pat$1668)) {
                fv$1667.push(pat$1668.token.value);
            } else if (pat$1668.token.type === parser$1645.Token.Delimiter) {
                fv$1667 = fv$1667.concat(freeVarsInPattern$1653(pat$1668.token.inner));
            }
        });
        return fv$1667;
    }
    function typeIsLiteral$1654(type$1669) {
        return type$1669 === parser$1645.Token.NullLiteral || type$1669 === parser$1645.Token.NumericLiteral || type$1669 === parser$1645.Token.StringLiteral || type$1669 === parser$1645.Token.RegexLiteral || type$1669 === parser$1645.Token.BooleanLiteral;
    }
    function containsPatternVar$1655(patterns$1670) {
        return _$1643.any(patterns$1670, function (pat$1671) {
            if (pat$1671.token.type === parser$1645.Token.Delimiter) {
                return containsPatternVar$1655(pat$1671.token.inner);
            }
            return isPatternVar$1657(pat$1671);
        });
    }
    function delimIsSeparator$1656(delim$1672) {
        return delim$1672 && delim$1672.token && delim$1672.token.type === parser$1645.Token.Delimiter && delim$1672.token.value === '()' && delim$1672.token.inner.length === 1 && delim$1672.token.inner[0].token.type !== parser$1645.Token.Delimiter && !containsPatternVar$1655(delim$1672.token.inner);
    }
    function isPatternVar$1657(stx$1673) {
        return stx$1673.token.value[0] === '$' && stx$1673.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1658(tojoin$1674, punc$1675) {
        return _$1643.reduce(_$1643.rest(tojoin$1674, 1), function (acc$1676, join$1677) {
            if (punc$1675 === ' ') {
                return acc$1676.concat(join$1677.match);
            }
            return acc$1676.concat(makePunc$1650(punc$1675, _$1643.first(join$1677.match)), join$1677.match);
        }, _$1643.first(tojoin$1674).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1659(from$1678, to$1679) {
        return _$1643.map(to$1679, function (stx$1680) {
            return takeLine$1660(from$1678, stx$1680);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1660(from$1681, to$1682) {
        if (to$1682.token.type === parser$1645.Token.Delimiter) {
            var next$1683;
            if (from$1681.token.type === parser$1645.Token.Delimiter) {
                next$1683 = syntaxFromToken$1649({
                    type: parser$1645.Token.Delimiter,
                    value: to$1682.token.value,
                    inner: takeLineContext$1659(from$1681, to$1682.token.inner),
                    startRange: from$1681.token.startRange,
                    endRange: from$1681.token.endRange,
                    startLineNumber: from$1681.token.startLineNumber,
                    startLineStart: from$1681.token.startLineStart,
                    endLineNumber: from$1681.token.endLineNumber,
                    endLineStart: from$1681.token.endLineStart
                }, to$1682);
            } else {
                next$1683 = syntaxFromToken$1649({
                    type: parser$1645.Token.Delimiter,
                    value: to$1682.token.value,
                    inner: takeLineContext$1659(from$1681, to$1682.token.inner),
                    startRange: from$1681.token.range,
                    endRange: from$1681.token.range,
                    startLineNumber: from$1681.token.lineNumber,
                    startLineStart: from$1681.token.lineStart,
                    endLineNumber: from$1681.token.lineNumber,
                    endLineStart: from$1681.token.lineStart
                }, to$1682);
            }
        } else {
            if (from$1681.token.type === parser$1645.Token.Delimiter) {
                next$1683 = syntaxFromToken$1649({
                    value: to$1682.token.value,
                    type: to$1682.token.type,
                    lineNumber: from$1681.token.startLineNumber,
                    lineStart: from$1681.token.startLineStart,
                    range: from$1681.token.startRange
                }, to$1682);
            } else {
                next$1683 = syntaxFromToken$1649({
                    value: to$1682.token.value,
                    type: to$1682.token.type,
                    lineNumber: from$1681.token.lineNumber,
                    lineStart: from$1681.token.lineStart,
                    range: from$1681.token.range
                }, to$1682);
            }
        }
        if (to$1682.token.leadingComments) {
            next$1683.token.leadingComments = to$1682.token.leadingComments;
        }
        if (to$1682.token.trailingComments) {
            next$1683.token.trailingComments = to$1682.token.trailingComments;
        }
        return next$1683;
    }
    function loadPattern$1661(patterns$1684) {
        return _$1643.chain(patterns$1684).reduce(function (acc$1685, patStx$1686, idx$1687) {
            var last$1688 = patterns$1684[idx$1687 - 1];
            var lastLast$1689 = patterns$1684[idx$1687 - 2];
            var next$1690 = patterns$1684[idx$1687 + 1];
            var nextNext$1691 = patterns$1684[idx$1687 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1686.token.value === ':') {
                if (last$1688 && isPatternVar$1657(last$1688) && !isPatternVar$1657(next$1690)) {
                    return acc$1685;
                }
            }
            if (last$1688 && last$1688.token.value === ':') {
                if (lastLast$1689 && isPatternVar$1657(lastLast$1689) && !isPatternVar$1657(patStx$1686)) {
                    return acc$1685;
                }
            }
            // skip over $
            if (patStx$1686.token.value === '$' && next$1690 && next$1690.token.type === parser$1645.Token.Delimiter) {
                return acc$1685;
            }
            if (isPatternVar$1657(patStx$1686)) {
                if (next$1690 && next$1690.token.value === ':' && !isPatternVar$1657(nextNext$1691)) {
                    if (typeof nextNext$1691 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1686.class = nextNext$1691.token.value;
                } else {
                    patStx$1686.class = 'token';
                }
            } else if (patStx$1686.token.type === parser$1645.Token.Delimiter) {
                if (last$1688 && last$1688.token.value === '$') {
                    patStx$1686.class = 'pattern_group';
                }
                patStx$1686.token.inner = loadPattern$1661(patStx$1686.token.inner);
            } else {
                patStx$1686.class = 'pattern_literal';
            }
            return acc$1685.concat(patStx$1686);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1692, patStx$1693, idx$1694, patterns$1695) {
            var separator$1696 = ' ';
            var repeat$1697 = false;
            var next$1698 = patterns$1695[idx$1694 + 1];
            var nextNext$1699 = patterns$1695[idx$1694 + 2];
            if (next$1698 && next$1698.token.value === '...') {
                repeat$1697 = true;
                separator$1696 = ' ';
            } else if (delimIsSeparator$1656(next$1698) && nextNext$1699 && nextNext$1699.token.value === '...') {
                repeat$1697 = true;
                parser$1645.assert(next$1698.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1696 = next$1698.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1693.token.value === '...' || delimIsSeparator$1656(patStx$1693) && next$1698 && next$1698.token.value === '...') {
                return acc$1692;
            }
            patStx$1693.repeat = repeat$1697;
            patStx$1693.separator = separator$1696;
            return acc$1692.concat(patStx$1693);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1662(patternClass$1700, stx$1701, env$1702) {
        var result$1703, rest$1704;
        // pattern has no parse class
        if (patternClass$1700 === 'token' && stx$1701[0] && stx$1701[0].token.type !== parser$1645.Token.EOF) {
            result$1703 = [stx$1701[0]];
            rest$1704 = stx$1701.slice(1);
        } else if (patternClass$1700 === 'lit' && stx$1701[0] && typeIsLiteral$1654(stx$1701[0].token.type)) {
            result$1703 = [stx$1701[0]];
            rest$1704 = stx$1701.slice(1);
        } else if (patternClass$1700 === 'ident' && stx$1701[0] && stx$1701[0].token.type === parser$1645.Token.Identifier) {
            result$1703 = [stx$1701[0]];
            rest$1704 = stx$1701.slice(1);
        } else if (stx$1701.length > 0 && patternClass$1700 === 'VariableStatement') {
            var match$1705 = expander$1646.enforest(stx$1701, expander$1646.makeExpanderContext({ env: env$1702 }));
            if (match$1705.result && match$1705.result.hasPrototype(expander$1646.VariableStatement)) {
                result$1703 = match$1705.result.destruct(false);
                rest$1704 = match$1705.rest;
            } else {
                result$1703 = null;
                rest$1704 = stx$1701;
            }
        } else if (stx$1701.length > 0 && patternClass$1700 === 'expr') {
            var match$1705 = expander$1646.get_expression(stx$1701, expander$1646.makeExpanderContext({ env: env$1702 }));
            if (match$1705.result === null || !match$1705.result.hasPrototype(expander$1646.Expr)) {
                result$1703 = null;
                rest$1704 = stx$1701;
            } else {
                result$1703 = match$1705.result.destruct(false);
                rest$1704 = match$1705.rest;
            }
        } else {
            result$1703 = null;
            rest$1704 = stx$1701;
        }
        return {
            result: result$1703,
            rest: rest$1704
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1663(patterns$1706, stx$1707, env$1708, topLevel$1709) {
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
        topLevel$1709 = topLevel$1709 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1710 = [];
        var patternEnv$1711 = {};
        var match$1712;
        var pattern$1713;
        var rest$1714 = stx$1707;
        var success$1715 = true;
        patternLoop:
            for (var i$1716 = 0; i$1716 < patterns$1706.length; i$1716++) {
                if (success$1715 === false) {
                    break;
                }
                pattern$1713 = patterns$1706[i$1716];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1713.repeat && i$1716 + 1 < patterns$1706.length) {
                        var restMatch$1717 = matchPatterns$1663(patterns$1706.slice(i$1716 + 1), rest$1714, env$1708, topLevel$1709);
                        if (restMatch$1717.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1712 = matchPattern$1664(pattern$1713, [], env$1708, patternEnv$1711);
                            patternEnv$1711 = _$1643.extend(restMatch$1717.patternEnv, match$1712.patternEnv);
                            rest$1714 = restMatch$1717.rest;
                            break patternLoop;
                        }
                    }
                    match$1712 = matchPattern$1664(pattern$1713, rest$1714, env$1708, patternEnv$1711);
                    if (!match$1712.success && pattern$1713.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1712.success) {
                        success$1715 = false;
                        break;
                    }
                    rest$1714 = match$1712.rest;
                    patternEnv$1711 = match$1712.patternEnv;
                    if (success$1715 && !(topLevel$1709 || pattern$1713.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1716 == patterns$1706.length - 1 && rest$1714.length !== 0) {
                            success$1715 = false;
                            break;
                        }
                    }
                    if (pattern$1713.repeat && success$1715) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1714[0] && rest$1714[0].token.value === pattern$1713.separator) {
                            // more tokens and the next token matches the separator
                            rest$1714 = rest$1714.slice(1);
                        } else if (pattern$1713.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1713.separator !== ' ' && rest$1714.length > 0 && i$1716 === patterns$1706.length - 1 && topLevel$1709 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1715 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1713.repeat && success$1715 && rest$1714.length > 0);
            }
        return {
            success: success$1715,
            rest: rest$1714,
            patternEnv: patternEnv$1711
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
    function matchPattern$1664(pattern$1718, stx$1719, env$1720, patternEnv$1721) {
        var subMatch$1722;
        var match$1723, matchEnv$1724;
        var rest$1725;
        var success$1726;
        if (typeof pattern$1718.inner !== 'undefined') {
            if (pattern$1718.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1722 = matchPatterns$1663(pattern$1718.inner, stx$1719, env$1720, true);
                rest$1725 = subMatch$1722.rest;
            } else if (stx$1719[0] && stx$1719[0].token.type === parser$1645.Token.Delimiter && stx$1719[0].token.value === pattern$1718.value) {
                stx$1719[0].expose();
                if (pattern$1718.inner.length === 0 && stx$1719[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1719,
                        patternEnv: patternEnv$1721
                    };
                }
                subMatch$1722 = matchPatterns$1663(pattern$1718.inner, stx$1719[0].token.inner, env$1720, false);
                rest$1725 = stx$1719.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1719,
                    patternEnv: patternEnv$1721
                };
            }
            success$1726 = subMatch$1722.success;
            // merge the subpattern matches with the current pattern environment
            _$1643.keys(subMatch$1722.patternEnv).forEach(function (patternKey$1727) {
                if (pattern$1718.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1728 = subMatch$1722.patternEnv[patternKey$1727].level + 1;
                    if (patternEnv$1721[patternKey$1727]) {
                        patternEnv$1721[patternKey$1727].level = nextLevel$1728;
                        patternEnv$1721[patternKey$1727].match.push(subMatch$1722.patternEnv[patternKey$1727]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1721[patternKey$1727] = {
                            level: nextLevel$1728,
                            match: [subMatch$1722.patternEnv[patternKey$1727]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1721[patternKey$1727] = subMatch$1722.patternEnv[patternKey$1727];
                }
            });
        } else {
            if (pattern$1718.class === 'pattern_literal') {
                // wildcard
                if (stx$1719[0] && pattern$1718.value === '_') {
                    success$1726 = true;
                    rest$1725 = stx$1719.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1719[0] && pattern$1718.value === stx$1719[0].token.value) {
                    success$1726 = true;
                    rest$1725 = stx$1719.slice(1);
                } else {
                    success$1726 = false;
                    rest$1725 = stx$1719;
                }
            } else {
                match$1723 = matchPatternClass$1662(pattern$1718.class, stx$1719, env$1720);
                success$1726 = match$1723.result !== null;
                rest$1725 = match$1723.rest;
                matchEnv$1724 = {
                    level: 0,
                    match: match$1723.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1718.repeat) {
                    if (patternEnv$1721[pattern$1718.value]) {
                        patternEnv$1721[pattern$1718.value].match.push(matchEnv$1724);
                    } else {
                        // initialize if necessary
                        patternEnv$1721[pattern$1718.value] = {
                            level: 1,
                            match: [matchEnv$1724]
                        };
                    }
                } else {
                    patternEnv$1721[pattern$1718.value] = matchEnv$1724;
                }
            }
        }
        return {
            success: success$1726,
            rest: rest$1725,
            patternEnv: patternEnv$1721
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1665(macroBody$1729, macroNameStx$1730, env$1731) {
        return _$1643.chain(macroBody$1729).reduce(function (acc$1732, bodyStx$1733, idx$1734, original$1735) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1736 = original$1735[idx$1734 - 1];
            var next$1737 = original$1735[idx$1734 + 1];
            var nextNext$1738 = original$1735[idx$1734 + 2];
            // drop `...`
            if (bodyStx$1733.token.value === '...') {
                return acc$1732;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1656(bodyStx$1733) && next$1737 && next$1737.token.value === '...') {
                return acc$1732;
            }
            // skip the $ in $(...)
            if (bodyStx$1733.token.value === '$' && next$1737 && next$1737.token.type === parser$1645.Token.Delimiter && next$1737.token.value === '()') {
                return acc$1732;
            }
            // mark $[...] as a literal
            if (bodyStx$1733.token.value === '$' && next$1737 && next$1737.token.type === parser$1645.Token.Delimiter && next$1737.token.value === '[]') {
                next$1737.literal = true;
                return acc$1732;
            }
            if (bodyStx$1733.token.type === parser$1645.Token.Delimiter && bodyStx$1733.token.value === '()' && last$1736 && last$1736.token.value === '$') {
                bodyStx$1733.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1733.literal === true) {
                parser$1645.assert(bodyStx$1733.token.type === parser$1645.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1732.concat(bodyStx$1733.token.inner);
            }
            if (next$1737 && next$1737.token.value === '...') {
                bodyStx$1733.repeat = true;
                bodyStx$1733.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1656(next$1737) && nextNext$1738 && nextNext$1738.token.value === '...') {
                bodyStx$1733.repeat = true;
                bodyStx$1733.separator = next$1737.token.inner[0].token.value;
            }
            return acc$1732.concat(bodyStx$1733);
        }, []).reduce(function (acc$1739, bodyStx$1740, idx$1741) {
            // then do the actual transcription
            if (bodyStx$1740.repeat) {
                if (bodyStx$1740.token.type === parser$1645.Token.Delimiter) {
                    bodyStx$1740.expose();
                    var fv$1742 = _$1643.filter(freeVarsInPattern$1653(bodyStx$1740.token.inner), function (pat$1749) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1731.hasOwnProperty(pat$1749);
                        });
                    var restrictedEnv$1743 = [];
                    var nonScalar$1744 = _$1643.find(fv$1742, function (pat$1750) {
                            return env$1731[pat$1750].level > 0;
                        });
                    parser$1645.assert(typeof nonScalar$1744 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1745 = env$1731[nonScalar$1744].match.length;
                    var sameLength$1746 = _$1643.all(fv$1742, function (pat$1751) {
                            return env$1731[pat$1751].level === 0 || env$1731[pat$1751].match.length === repeatLength$1745;
                        });
                    parser$1645.assert(sameLength$1746, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1743 = _$1643.map(_$1643.range(repeatLength$1745), function (idx$1752) {
                        var renv$1753 = {};
                        _$1643.each(fv$1742, function (pat$1754) {
                            if (env$1731[pat$1754].level === 0) {
                                // copy scalars over
                                renv$1753[pat$1754] = env$1731[pat$1754];
                            } else {
                                // grab the match at this index
                                renv$1753[pat$1754] = env$1731[pat$1754].match[idx$1752];
                            }
                        });
                        return renv$1753;
                    });
                    var transcribed$1747 = _$1643.map(restrictedEnv$1743, function (renv$1755) {
                            if (bodyStx$1740.group) {
                                return transcribe$1665(bodyStx$1740.token.inner, macroNameStx$1730, renv$1755);
                            } else {
                                var newBody$1756 = syntaxFromToken$1649(_$1643.clone(bodyStx$1740.token), bodyStx$1740);
                                newBody$1756.token.inner = transcribe$1665(bodyStx$1740.token.inner, macroNameStx$1730, renv$1755);
                                return newBody$1756;
                            }
                        });
                    var joined$1748;
                    if (bodyStx$1740.group) {
                        joined$1748 = joinSyntaxArr$1652(transcribed$1747, bodyStx$1740.separator);
                    } else {
                        joined$1748 = joinSyntax$1651(transcribed$1747, bodyStx$1740.separator);
                    }
                    return acc$1739.concat(joined$1748);
                }
                if (!env$1731[bodyStx$1740.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1740.token.value + ' is not bound for the template');
                } else if (env$1731[bodyStx$1740.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1740.token.value + ' does not match in the template');
                }
                return acc$1739.concat(joinRepeatedMatch$1658(env$1731[bodyStx$1740.token.value].match, bodyStx$1740.separator));
            } else {
                if (bodyStx$1740.token.type === parser$1645.Token.Delimiter) {
                    bodyStx$1740.expose();
                    var newBody$1757 = syntaxFromToken$1649(_$1643.clone(bodyStx$1740.token), macroBody$1729);
                    newBody$1757.token.inner = transcribe$1665(bodyStx$1740.token.inner, macroNameStx$1730, env$1731);
                    return acc$1739.concat([newBody$1757]);
                }
                if (isPatternVar$1657(bodyStx$1740) && Object.prototype.hasOwnProperty.bind(env$1731)(bodyStx$1740.token.value)) {
                    if (!env$1731[bodyStx$1740.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1740.token.value + ' is not bound for the template');
                    } else if (env$1731[bodyStx$1740.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1740.token.value + ' does not match in the template');
                    }
                    return acc$1739.concat(env$1731[bodyStx$1740.token.value].match);
                }
                return acc$1739.concat([bodyStx$1740]);
            }
        }, []).value();
    }
    exports$1642.loadPattern = loadPattern$1661;
    exports$1642.matchPatterns = matchPatterns$1663;
    exports$1642.transcribe = transcribe$1665;
    exports$1642.matchPatternClass = matchPatternClass$1662;
    exports$1642.takeLineContext = takeLineContext$1659;
    exports$1642.takeLine = takeLine$1660;
}));
//# sourceMappingURL=patterns.js.map