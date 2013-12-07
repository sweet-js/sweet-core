(function (root$1608, factory$1609) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1609(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1609);
    }
}(this, function (exports$1610, _$1611, es6$1612, parser$1613, expander$1614, syntax$1615) {
    var get_expression$1616 = expander$1614.get_expression;
    var syntaxFromToken$1617 = syntax$1615.syntaxFromToken;
    var makePunc$1618 = syntax$1615.makePunc;
    var joinSyntax$1619 = syntax$1615.joinSyntax;
    var joinSyntaxArr$1620 = syntax$1615.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1621(pattern$1634) {
        var fv$1635 = [];
        _$1611.each(pattern$1634, function (pat$1636) {
            if (isPatternVar$1625(pat$1636)) {
                fv$1635.push(pat$1636.token.value);
            } else if (pat$1636.token.type === parser$1613.Token.Delimiter) {
                fv$1635 = fv$1635.concat(freeVarsInPattern$1621(pat$1636.token.inner));
            }
        });
        return fv$1635;
    }
    function typeIsLiteral$1622(type$1637) {
        return type$1637 === parser$1613.Token.NullLiteral || type$1637 === parser$1613.Token.NumericLiteral || type$1637 === parser$1613.Token.StringLiteral || type$1637 === parser$1613.Token.RegexLiteral || type$1637 === parser$1613.Token.BooleanLiteral;
    }
    function containsPatternVar$1623(patterns$1638) {
        return _$1611.any(patterns$1638, function (pat$1639) {
            if (pat$1639.token.type === parser$1613.Token.Delimiter) {
                return containsPatternVar$1623(pat$1639.token.inner);
            }
            return isPatternVar$1625(pat$1639);
        });
    }
    function delimIsSeparator$1624(delim$1640) {
        return delim$1640 && delim$1640.token && delim$1640.token.type === parser$1613.Token.Delimiter && delim$1640.token.value === '()' && delim$1640.token.inner.length === 1 && delim$1640.token.inner[0].token.type !== parser$1613.Token.Delimiter && !containsPatternVar$1623(delim$1640.token.inner);
    }
    function isPatternVar$1625(stx$1641) {
        return stx$1641.token.value[0] === '$' && stx$1641.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1626(tojoin$1642, punc$1643) {
        return _$1611.reduce(_$1611.rest(tojoin$1642, 1), function (acc$1644, join$1645) {
            if (punc$1643 === ' ') {
                return acc$1644.concat(join$1645.match);
            }
            return acc$1644.concat(makePunc$1618(punc$1643, _$1611.first(join$1645.match)), join$1645.match);
        }, _$1611.first(tojoin$1642).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1627(from$1646, to$1647) {
        return _$1611.map(to$1647, function (stx$1648) {
            return takeLine$1628(from$1646, stx$1648);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1628(from$1649, to$1650) {
        if (to$1650.token.type === parser$1613.Token.Delimiter) {
            var next$1651;
            if (from$1649.token.type === parser$1613.Token.Delimiter) {
                next$1651 = syntaxFromToken$1617({
                    type: parser$1613.Token.Delimiter,
                    value: to$1650.token.value,
                    inner: takeLineContext$1627(from$1649, to$1650.token.inner),
                    startRange: from$1649.token.startRange,
                    endRange: from$1649.token.endRange,
                    startLineNumber: from$1649.token.startLineNumber,
                    startLineStart: from$1649.token.startLineStart,
                    endLineNumber: from$1649.token.endLineNumber,
                    endLineStart: from$1649.token.endLineStart
                }, to$1650);
            } else {
                next$1651 = syntaxFromToken$1617({
                    type: parser$1613.Token.Delimiter,
                    value: to$1650.token.value,
                    inner: takeLineContext$1627(from$1649, to$1650.token.inner),
                    startRange: from$1649.token.range,
                    endRange: from$1649.token.range,
                    startLineNumber: from$1649.token.lineNumber,
                    startLineStart: from$1649.token.lineStart,
                    endLineNumber: from$1649.token.lineNumber,
                    endLineStart: from$1649.token.lineStart
                }, to$1650);
            }
        } else {
            if (from$1649.token.type === parser$1613.Token.Delimiter) {
                next$1651 = syntaxFromToken$1617({
                    value: to$1650.token.value,
                    type: to$1650.token.type,
                    lineNumber: from$1649.token.startLineNumber,
                    lineStart: from$1649.token.startLineStart,
                    range: from$1649.token.startRange
                }, to$1650);
            } else {
                next$1651 = syntaxFromToken$1617({
                    value: to$1650.token.value,
                    type: to$1650.token.type,
                    lineNumber: from$1649.token.lineNumber,
                    lineStart: from$1649.token.lineStart,
                    range: from$1649.token.range
                }, to$1650);
            }
        }
        if (to$1650.token.leadingComments) {
            next$1651.token.leadingComments = to$1650.token.leadingComments;
        }
        if (to$1650.token.trailingComments) {
            next$1651.token.trailingComments = to$1650.token.trailingComments;
        }
        return next$1651;
    }
    function loadPattern$1629(patterns$1652) {
        return _$1611.chain(patterns$1652).reduce(function (acc$1653, patStx$1654, idx$1655) {
            var last$1656 = patterns$1652[idx$1655 - 1];
            var lastLast$1657 = patterns$1652[idx$1655 - 2];
            var next$1658 = patterns$1652[idx$1655 + 1];
            var nextNext$1659 = patterns$1652[idx$1655 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1654.token.value === ':') {
                if (last$1656 && isPatternVar$1625(last$1656) && !isPatternVar$1625(next$1658)) {
                    return acc$1653;
                }
            }
            if (last$1656 && last$1656.token.value === ':') {
                if (lastLast$1657 && isPatternVar$1625(lastLast$1657) && !isPatternVar$1625(patStx$1654)) {
                    return acc$1653;
                }
            }
            // skip over $
            if (patStx$1654.token.value === '$' && next$1658 && next$1658.token.type === parser$1613.Token.Delimiter) {
                return acc$1653;
            }
            if (isPatternVar$1625(patStx$1654)) {
                if (next$1658 && next$1658.token.value === ':' && !isPatternVar$1625(nextNext$1659)) {
                    if (typeof nextNext$1659 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1654.class = nextNext$1659.token.value;
                } else {
                    patStx$1654.class = 'token';
                }
            } else if (patStx$1654.token.type === parser$1613.Token.Delimiter) {
                if (last$1656 && last$1656.token.value === '$') {
                    patStx$1654.class = 'pattern_group';
                }
                patStx$1654.token.inner = loadPattern$1629(patStx$1654.token.inner);
            } else {
                patStx$1654.class = 'pattern_literal';
            }
            return acc$1653.concat(patStx$1654);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1660, patStx$1661, idx$1662, patterns$1663) {
            var separator$1664 = ' ';
            var repeat$1665 = false;
            var next$1666 = patterns$1663[idx$1662 + 1];
            var nextNext$1667 = patterns$1663[idx$1662 + 2];
            if (next$1666 && next$1666.token.value === '...') {
                repeat$1665 = true;
                separator$1664 = ' ';
            } else if (delimIsSeparator$1624(next$1666) && nextNext$1667 && nextNext$1667.token.value === '...') {
                repeat$1665 = true;
                parser$1613.assert(next$1666.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1664 = next$1666.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1661.token.value === '...' || delimIsSeparator$1624(patStx$1661) && next$1666 && next$1666.token.value === '...') {
                return acc$1660;
            }
            patStx$1661.repeat = repeat$1665;
            patStx$1661.separator = separator$1664;
            return acc$1660.concat(patStx$1661);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1630(patternClass$1668, stx$1669, env$1670) {
        var result$1671, rest$1672;
        // pattern has no parse class
        if (patternClass$1668 === 'token' && stx$1669[0] && stx$1669[0].token.type !== parser$1613.Token.EOF) {
            result$1671 = [stx$1669[0]];
            rest$1672 = stx$1669.slice(1);
        } else if (patternClass$1668 === 'lit' && stx$1669[0] && typeIsLiteral$1622(stx$1669[0].token.type)) {
            result$1671 = [stx$1669[0]];
            rest$1672 = stx$1669.slice(1);
        } else if (patternClass$1668 === 'ident' && stx$1669[0] && stx$1669[0].token.type === parser$1613.Token.Identifier) {
            result$1671 = [stx$1669[0]];
            rest$1672 = stx$1669.slice(1);
        } else if (stx$1669.length > 0 && patternClass$1668 === 'VariableStatement') {
            var match$1673 = expander$1614.enforest(stx$1669, expander$1614.makeExpanderContext({ env: env$1670 }));
            if (match$1673.result && match$1673.result.hasPrototype(expander$1614.VariableStatement)) {
                result$1671 = match$1673.result.destruct(false);
                rest$1672 = match$1673.rest;
            } else {
                result$1671 = null;
                rest$1672 = stx$1669;
            }
        } else if (stx$1669.length > 0 && patternClass$1668 === 'expr') {
            var match$1673 = expander$1614.get_expression(stx$1669, expander$1614.makeExpanderContext({ env: env$1670 }));
            if (match$1673.result === null || !match$1673.result.hasPrototype(expander$1614.Expr)) {
                result$1671 = null;
                rest$1672 = stx$1669;
            } else {
                result$1671 = match$1673.result.destruct(false);
                rest$1672 = match$1673.rest;
            }
        } else {
            result$1671 = null;
            rest$1672 = stx$1669;
        }
        return {
            result: result$1671,
            rest: rest$1672
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1631(patterns$1674, stx$1675, env$1676, topLevel$1677) {
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
        topLevel$1677 = topLevel$1677 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1678 = [];
        var patternEnv$1679 = {};
        var match$1680;
        var pattern$1681;
        var rest$1682 = stx$1675;
        var success$1683 = true;
        patternLoop:
            for (var i$1684 = 0; i$1684 < patterns$1674.length; i$1684++) {
                if (success$1683 === false) {
                    break;
                }
                pattern$1681 = patterns$1674[i$1684];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1681.repeat && i$1684 + 1 < patterns$1674.length) {
                        var restMatch$1685 = matchPatterns$1631(patterns$1674.slice(i$1684 + 1), rest$1682, env$1676, topLevel$1677);
                        if (restMatch$1685.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1680 = matchPattern$1632(pattern$1681, [], env$1676, patternEnv$1679);
                            patternEnv$1679 = _$1611.extend(restMatch$1685.patternEnv, match$1680.patternEnv);
                            rest$1682 = restMatch$1685.rest;
                            break patternLoop;
                        }
                    }
                    match$1680 = matchPattern$1632(pattern$1681, rest$1682, env$1676, patternEnv$1679);
                    if (!match$1680.success && pattern$1681.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1680.success) {
                        success$1683 = false;
                        break;
                    }
                    rest$1682 = match$1680.rest;
                    patternEnv$1679 = match$1680.patternEnv;
                    if (success$1683 && !(topLevel$1677 || pattern$1681.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1684 == patterns$1674.length - 1 && rest$1682.length !== 0) {
                            success$1683 = false;
                            break;
                        }
                    }
                    if (pattern$1681.repeat && success$1683) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1682[0] && rest$1682[0].token.value === pattern$1681.separator) {
                            // more tokens and the next token matches the separator
                            rest$1682 = rest$1682.slice(1);
                        } else if (pattern$1681.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1681.separator !== ' ' && rest$1682.length > 0 && i$1684 === patterns$1674.length - 1 && topLevel$1677 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1683 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1681.repeat && success$1683 && rest$1682.length > 0);
            }
        return {
            success: success$1683,
            rest: rest$1682,
            patternEnv: patternEnv$1679
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
    function matchPattern$1632(pattern$1686, stx$1687, env$1688, patternEnv$1689) {
        var subMatch$1690;
        var match$1691, matchEnv$1692;
        var rest$1693;
        var success$1694;
        if (typeof pattern$1686.inner !== 'undefined') {
            if (pattern$1686.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1690 = matchPatterns$1631(pattern$1686.inner, stx$1687, env$1688, true);
                rest$1693 = subMatch$1690.rest;
            } else if (stx$1687[0] && stx$1687[0].token.type === parser$1613.Token.Delimiter && stx$1687[0].token.value === pattern$1686.value) {
                stx$1687[0].expose();
                if (pattern$1686.inner.length === 0 && stx$1687[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1687,
                        patternEnv: patternEnv$1689
                    };
                }
                subMatch$1690 = matchPatterns$1631(pattern$1686.inner, stx$1687[0].token.inner, env$1688, false);
                rest$1693 = stx$1687.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1687,
                    patternEnv: patternEnv$1689
                };
            }
            success$1694 = subMatch$1690.success;
            // merge the subpattern matches with the current pattern environment
            _$1611.keys(subMatch$1690.patternEnv).forEach(function (patternKey$1695) {
                if (pattern$1686.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1696 = subMatch$1690.patternEnv[patternKey$1695].level + 1;
                    if (patternEnv$1689[patternKey$1695]) {
                        patternEnv$1689[patternKey$1695].level = nextLevel$1696;
                        patternEnv$1689[patternKey$1695].match.push(subMatch$1690.patternEnv[patternKey$1695]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1689[patternKey$1695] = {
                            level: nextLevel$1696,
                            match: [subMatch$1690.patternEnv[patternKey$1695]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1689[patternKey$1695] = subMatch$1690.patternEnv[patternKey$1695];
                }
            });
        } else {
            if (pattern$1686.class === 'pattern_literal') {
                // wildcard
                if (stx$1687[0] && pattern$1686.value === '_') {
                    success$1694 = true;
                    rest$1693 = stx$1687.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1687[0] && pattern$1686.value === stx$1687[0].token.value) {
                    success$1694 = true;
                    rest$1693 = stx$1687.slice(1);
                } else {
                    success$1694 = false;
                    rest$1693 = stx$1687;
                }
            } else {
                match$1691 = matchPatternClass$1630(pattern$1686.class, stx$1687, env$1688);
                success$1694 = match$1691.result !== null;
                rest$1693 = match$1691.rest;
                matchEnv$1692 = {
                    level: 0,
                    match: match$1691.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1686.repeat) {
                    if (patternEnv$1689[pattern$1686.value]) {
                        patternEnv$1689[pattern$1686.value].match.push(matchEnv$1692);
                    } else {
                        // initialize if necessary
                        patternEnv$1689[pattern$1686.value] = {
                            level: 1,
                            match: [matchEnv$1692]
                        };
                    }
                } else {
                    patternEnv$1689[pattern$1686.value] = matchEnv$1692;
                }
            }
        }
        return {
            success: success$1694,
            rest: rest$1693,
            patternEnv: patternEnv$1689
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1633(macroBody$1697, macroNameStx$1698, env$1699) {
        return _$1611.chain(macroBody$1697).reduce(function (acc$1700, bodyStx$1701, idx$1702, original$1703) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1704 = original$1703[idx$1702 - 1];
            var next$1705 = original$1703[idx$1702 + 1];
            var nextNext$1706 = original$1703[idx$1702 + 2];
            // drop `...`
            if (bodyStx$1701.token.value === '...') {
                return acc$1700;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1624(bodyStx$1701) && next$1705 && next$1705.token.value === '...') {
                return acc$1700;
            }
            // skip the $ in $(...)
            if (bodyStx$1701.token.value === '$' && next$1705 && next$1705.token.type === parser$1613.Token.Delimiter && next$1705.token.value === '()') {
                return acc$1700;
            }
            // mark $[...] as a literal
            if (bodyStx$1701.token.value === '$' && next$1705 && next$1705.token.type === parser$1613.Token.Delimiter && next$1705.token.value === '[]') {
                next$1705.literal = true;
                return acc$1700;
            }
            if (bodyStx$1701.token.type === parser$1613.Token.Delimiter && bodyStx$1701.token.value === '()' && last$1704 && last$1704.token.value === '$') {
                bodyStx$1701.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1701.literal === true) {
                parser$1613.assert(bodyStx$1701.token.type === parser$1613.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1700.concat(bodyStx$1701.token.inner);
            }
            if (next$1705 && next$1705.token.value === '...') {
                bodyStx$1701.repeat = true;
                bodyStx$1701.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1624(next$1705) && nextNext$1706 && nextNext$1706.token.value === '...') {
                bodyStx$1701.repeat = true;
                bodyStx$1701.separator = next$1705.token.inner[0].token.value;
            }
            return acc$1700.concat(bodyStx$1701);
        }, []).reduce(function (acc$1707, bodyStx$1708, idx$1709) {
            // then do the actual transcription
            if (bodyStx$1708.repeat) {
                if (bodyStx$1708.token.type === parser$1613.Token.Delimiter) {
                    bodyStx$1708.expose();
                    var fv$1710 = _$1611.filter(freeVarsInPattern$1621(bodyStx$1708.token.inner), function (pat$1717) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1699.hasOwnProperty(pat$1717);
                        });
                    var restrictedEnv$1711 = [];
                    var nonScalar$1712 = _$1611.find(fv$1710, function (pat$1718) {
                            return env$1699[pat$1718].level > 0;
                        });
                    parser$1613.assert(typeof nonScalar$1712 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1713 = env$1699[nonScalar$1712].match.length;
                    var sameLength$1714 = _$1611.all(fv$1710, function (pat$1719) {
                            return env$1699[pat$1719].level === 0 || env$1699[pat$1719].match.length === repeatLength$1713;
                        });
                    parser$1613.assert(sameLength$1714, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1711 = _$1611.map(_$1611.range(repeatLength$1713), function (idx$1720) {
                        var renv$1721 = {};
                        _$1611.each(fv$1710, function (pat$1722) {
                            if (env$1699[pat$1722].level === 0) {
                                // copy scalars over
                                renv$1721[pat$1722] = env$1699[pat$1722];
                            } else {
                                // grab the match at this index
                                renv$1721[pat$1722] = env$1699[pat$1722].match[idx$1720];
                            }
                        });
                        return renv$1721;
                    });
                    var transcribed$1715 = _$1611.map(restrictedEnv$1711, function (renv$1723) {
                            if (bodyStx$1708.group) {
                                return transcribe$1633(bodyStx$1708.token.inner, macroNameStx$1698, renv$1723);
                            } else {
                                var newBody$1724 = syntaxFromToken$1617(_$1611.clone(bodyStx$1708.token), bodyStx$1708);
                                newBody$1724.token.inner = transcribe$1633(bodyStx$1708.token.inner, macroNameStx$1698, renv$1723);
                                return newBody$1724;
                            }
                        });
                    var joined$1716;
                    if (bodyStx$1708.group) {
                        joined$1716 = joinSyntaxArr$1620(transcribed$1715, bodyStx$1708.separator);
                    } else {
                        joined$1716 = joinSyntax$1619(transcribed$1715, bodyStx$1708.separator);
                    }
                    return acc$1707.concat(joined$1716);
                }
                if (!env$1699[bodyStx$1708.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1708.token.value + ' is not bound for the template');
                } else if (env$1699[bodyStx$1708.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1708.token.value + ' does not match in the template');
                }
                return acc$1707.concat(joinRepeatedMatch$1626(env$1699[bodyStx$1708.token.value].match, bodyStx$1708.separator));
            } else {
                if (bodyStx$1708.token.type === parser$1613.Token.Delimiter) {
                    bodyStx$1708.expose();
                    var newBody$1725 = syntaxFromToken$1617(_$1611.clone(bodyStx$1708.token), macroBody$1697);
                    newBody$1725.token.inner = transcribe$1633(bodyStx$1708.token.inner, macroNameStx$1698, env$1699);
                    return acc$1707.concat([newBody$1725]);
                }
                if (isPatternVar$1625(bodyStx$1708) && Object.prototype.hasOwnProperty.bind(env$1699)(bodyStx$1708.token.value)) {
                    if (!env$1699[bodyStx$1708.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1708.token.value + ' is not bound for the template');
                    } else if (env$1699[bodyStx$1708.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1708.token.value + ' does not match in the template');
                    }
                    return acc$1707.concat(env$1699[bodyStx$1708.token.value].match);
                }
                return acc$1707.concat([bodyStx$1708]);
            }
        }, []).value();
    }
    exports$1610.loadPattern = loadPattern$1629;
    exports$1610.matchPatterns = matchPatterns$1631;
    exports$1610.transcribe = transcribe$1633;
    exports$1610.matchPatternClass = matchPatternClass$1630;
    exports$1610.takeLineContext = takeLineContext$1627;
    exports$1610.takeLine = takeLine$1628;
}));