(function (root$1609, factory$1610) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1610(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1610);
    }
}(this, function (exports$1611, _$1612, es6$1613, parser$1614, expander$1615, syntax$1616) {
    var get_expression$1617 = expander$1615.get_expression;
    var syntaxFromToken$1618 = syntax$1616.syntaxFromToken;
    var makePunc$1619 = syntax$1616.makePunc;
    var joinSyntax$1620 = syntax$1616.joinSyntax;
    var joinSyntaxArr$1621 = syntax$1616.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1622(pattern$1635) {
        var fv$1636 = [];
        _$1612.each(pattern$1635, function (pat$1637) {
            if (isPatternVar$1626(pat$1637)) {
                fv$1636.push(pat$1637.token.value);
            } else if (pat$1637.token.type === parser$1614.Token.Delimiter) {
                fv$1636 = fv$1636.concat(freeVarsInPattern$1622(pat$1637.token.inner));
            }
        });
        return fv$1636;
    }
    function typeIsLiteral$1623(type$1638) {
        return type$1638 === parser$1614.Token.NullLiteral || type$1638 === parser$1614.Token.NumericLiteral || type$1638 === parser$1614.Token.StringLiteral || type$1638 === parser$1614.Token.RegexLiteral || type$1638 === parser$1614.Token.BooleanLiteral;
    }
    function containsPatternVar$1624(patterns$1639) {
        return _$1612.any(patterns$1639, function (pat$1640) {
            if (pat$1640.token.type === parser$1614.Token.Delimiter) {
                return containsPatternVar$1624(pat$1640.token.inner);
            }
            return isPatternVar$1626(pat$1640);
        });
    }
    function delimIsSeparator$1625(delim$1641) {
        return delim$1641 && delim$1641.token && delim$1641.token.type === parser$1614.Token.Delimiter && delim$1641.token.value === '()' && delim$1641.token.inner.length === 1 && delim$1641.token.inner[0].token.type !== parser$1614.Token.Delimiter && !containsPatternVar$1624(delim$1641.token.inner);
    }
    function isPatternVar$1626(stx$1642) {
        return stx$1642.token.value[0] === '$' && stx$1642.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1627(tojoin$1643, punc$1644) {
        return _$1612.reduce(_$1612.rest(tojoin$1643, 1), function (acc$1645, join$1646) {
            if (punc$1644 === ' ') {
                return acc$1645.concat(join$1646.match);
            }
            return acc$1645.concat(makePunc$1619(punc$1644, _$1612.first(join$1646.match)), join$1646.match);
        }, _$1612.first(tojoin$1643).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1628(from$1647, to$1648) {
        return _$1612.map(to$1648, function (stx$1649) {
            return takeLine$1629(from$1647, stx$1649);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1629(from$1650, to$1651) {
        if (to$1651.token.type === parser$1614.Token.Delimiter) {
            var next$1652;
            if (from$1650.token.type === parser$1614.Token.Delimiter) {
                next$1652 = syntaxFromToken$1618({
                    type: parser$1614.Token.Delimiter,
                    value: to$1651.token.value,
                    inner: takeLineContext$1628(from$1650, to$1651.token.inner),
                    startRange: from$1650.token.startRange,
                    endRange: from$1650.token.endRange,
                    startLineNumber: from$1650.token.startLineNumber,
                    startLineStart: from$1650.token.startLineStart,
                    endLineNumber: from$1650.token.endLineNumber,
                    endLineStart: from$1650.token.endLineStart
                }, to$1651);
            } else {
                next$1652 = syntaxFromToken$1618({
                    type: parser$1614.Token.Delimiter,
                    value: to$1651.token.value,
                    inner: takeLineContext$1628(from$1650, to$1651.token.inner),
                    startRange: from$1650.token.range,
                    endRange: from$1650.token.range,
                    startLineNumber: from$1650.token.lineNumber,
                    startLineStart: from$1650.token.lineStart,
                    endLineNumber: from$1650.token.lineNumber,
                    endLineStart: from$1650.token.lineStart
                }, to$1651);
            }
        } else {
            if (from$1650.token.type === parser$1614.Token.Delimiter) {
                next$1652 = syntaxFromToken$1618({
                    value: to$1651.token.value,
                    type: to$1651.token.type,
                    lineNumber: from$1650.token.startLineNumber,
                    lineStart: from$1650.token.startLineStart,
                    range: from$1650.token.startRange
                }, to$1651);
            } else {
                next$1652 = syntaxFromToken$1618({
                    value: to$1651.token.value,
                    type: to$1651.token.type,
                    lineNumber: from$1650.token.lineNumber,
                    lineStart: from$1650.token.lineStart,
                    range: from$1650.token.range
                }, to$1651);
            }
        }
        if (to$1651.token.leadingComments) {
            next$1652.token.leadingComments = to$1651.token.leadingComments;
        }
        if (to$1651.token.trailingComments) {
            next$1652.token.trailingComments = to$1651.token.trailingComments;
        }
        return next$1652;
    }
    function loadPattern$1630(patterns$1653) {
        return _$1612.chain(patterns$1653).reduce(function (acc$1654, patStx$1655, idx$1656) {
            var last$1657 = patterns$1653[idx$1656 - 1];
            var lastLast$1658 = patterns$1653[idx$1656 - 2];
            var next$1659 = patterns$1653[idx$1656 + 1];
            var nextNext$1660 = patterns$1653[idx$1656 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1655.token.value === ':') {
                if (last$1657 && isPatternVar$1626(last$1657) && !isPatternVar$1626(next$1659)) {
                    return acc$1654;
                }
            }
            if (last$1657 && last$1657.token.value === ':') {
                if (lastLast$1658 && isPatternVar$1626(lastLast$1658) && !isPatternVar$1626(patStx$1655)) {
                    return acc$1654;
                }
            }
            // skip over $
            if (patStx$1655.token.value === '$' && next$1659 && next$1659.token.type === parser$1614.Token.Delimiter) {
                return acc$1654;
            }
            if (isPatternVar$1626(patStx$1655)) {
                if (next$1659 && next$1659.token.value === ':' && !isPatternVar$1626(nextNext$1660)) {
                    if (typeof nextNext$1660 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1655.class = nextNext$1660.token.value;
                } else {
                    patStx$1655.class = 'token';
                }
            } else if (patStx$1655.token.type === parser$1614.Token.Delimiter) {
                if (last$1657 && last$1657.token.value === '$') {
                    patStx$1655.class = 'pattern_group';
                }
                patStx$1655.token.inner = loadPattern$1630(patStx$1655.token.inner);
            } else {
                patStx$1655.class = 'pattern_literal';
            }
            return acc$1654.concat(patStx$1655);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1661, patStx$1662, idx$1663, patterns$1664) {
            var separator$1665 = ' ';
            var repeat$1666 = false;
            var next$1667 = patterns$1664[idx$1663 + 1];
            var nextNext$1668 = patterns$1664[idx$1663 + 2];
            if (next$1667 && next$1667.token.value === '...') {
                repeat$1666 = true;
                separator$1665 = ' ';
            } else if (delimIsSeparator$1625(next$1667) && nextNext$1668 && nextNext$1668.token.value === '...') {
                repeat$1666 = true;
                parser$1614.assert(next$1667.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1665 = next$1667.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1662.token.value === '...' || delimIsSeparator$1625(patStx$1662) && next$1667 && next$1667.token.value === '...') {
                return acc$1661;
            }
            patStx$1662.repeat = repeat$1666;
            patStx$1662.separator = separator$1665;
            return acc$1661.concat(patStx$1662);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1631(patternClass$1669, stx$1670, env$1671) {
        var result$1672, rest$1673;
        // pattern has no parse class
        if (patternClass$1669 === 'token' && stx$1670[0] && stx$1670[0].token.type !== parser$1614.Token.EOF) {
            result$1672 = [stx$1670[0]];
            rest$1673 = stx$1670.slice(1);
        } else if (patternClass$1669 === 'lit' && stx$1670[0] && typeIsLiteral$1623(stx$1670[0].token.type)) {
            result$1672 = [stx$1670[0]];
            rest$1673 = stx$1670.slice(1);
        } else if (patternClass$1669 === 'ident' && stx$1670[0] && stx$1670[0].token.type === parser$1614.Token.Identifier) {
            result$1672 = [stx$1670[0]];
            rest$1673 = stx$1670.slice(1);
        } else if (stx$1670.length > 0 && patternClass$1669 === 'VariableStatement') {
            var match$1674 = expander$1615.enforest(stx$1670, expander$1615.makeExpanderContext({ env: env$1671 }));
            if (match$1674.result && match$1674.result.hasPrototype(expander$1615.VariableStatement)) {
                result$1672 = match$1674.result.destruct(false);
                rest$1673 = match$1674.rest;
            } else {
                result$1672 = null;
                rest$1673 = stx$1670;
            }
        } else if (stx$1670.length > 0 && patternClass$1669 === 'expr') {
            var match$1674 = expander$1615.get_expression(stx$1670, expander$1615.makeExpanderContext({ env: env$1671 }));
            if (match$1674.result === null || !match$1674.result.hasPrototype(expander$1615.Expr)) {
                result$1672 = null;
                rest$1673 = stx$1670;
            } else {
                result$1672 = match$1674.result.destruct(false);
                rest$1673 = match$1674.rest;
            }
        } else {
            result$1672 = null;
            rest$1673 = stx$1670;
        }
        return {
            result: result$1672,
            rest: rest$1673
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1632(patterns$1675, stx$1676, env$1677, topLevel$1678) {
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
        topLevel$1678 = topLevel$1678 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1679 = [];
        var patternEnv$1680 = {};
        var match$1681;
        var pattern$1682;
        var rest$1683 = stx$1676;
        var success$1684 = true;
        patternLoop:
            for (var i$1685 = 0; i$1685 < patterns$1675.length; i$1685++) {
                if (success$1684 === false) {
                    break;
                }
                pattern$1682 = patterns$1675[i$1685];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1682.repeat && i$1685 + 1 < patterns$1675.length) {
                        var restMatch$1686 = matchPatterns$1632(patterns$1675.slice(i$1685 + 1), rest$1683, env$1677, topLevel$1678);
                        if (restMatch$1686.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1681 = matchPattern$1633(pattern$1682, [], env$1677, patternEnv$1680);
                            patternEnv$1680 = _$1612.extend(restMatch$1686.patternEnv, match$1681.patternEnv);
                            rest$1683 = restMatch$1686.rest;
                            break patternLoop;
                        }
                    }
                    match$1681 = matchPattern$1633(pattern$1682, rest$1683, env$1677, patternEnv$1680);
                    if (!match$1681.success && pattern$1682.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1681.success) {
                        success$1684 = false;
                        break;
                    }
                    rest$1683 = match$1681.rest;
                    patternEnv$1680 = match$1681.patternEnv;
                    if (success$1684 && !(topLevel$1678 || pattern$1682.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1685 == patterns$1675.length - 1 && rest$1683.length !== 0) {
                            success$1684 = false;
                            break;
                        }
                    }
                    if (pattern$1682.repeat && success$1684) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1683[0] && rest$1683[0].token.value === pattern$1682.separator) {
                            // more tokens and the next token matches the separator
                            rest$1683 = rest$1683.slice(1);
                        } else if (pattern$1682.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1682.separator !== ' ' && rest$1683.length > 0 && i$1685 === patterns$1675.length - 1 && topLevel$1678 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1684 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1682.repeat && success$1684 && rest$1683.length > 0);
            }
        return {
            success: success$1684,
            rest: rest$1683,
            patternEnv: patternEnv$1680
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
    function matchPattern$1633(pattern$1687, stx$1688, env$1689, patternEnv$1690) {
        var subMatch$1691;
        var match$1692, matchEnv$1693;
        var rest$1694;
        var success$1695;
        if (typeof pattern$1687.inner !== 'undefined') {
            if (pattern$1687.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1691 = matchPatterns$1632(pattern$1687.inner, stx$1688, env$1689, true);
                rest$1694 = subMatch$1691.rest;
            } else if (stx$1688[0] && stx$1688[0].token.type === parser$1614.Token.Delimiter && stx$1688[0].token.value === pattern$1687.value) {
                stx$1688[0].expose();
                if (pattern$1687.inner.length === 0 && stx$1688[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1688,
                        patternEnv: patternEnv$1690
                    };
                }
                subMatch$1691 = matchPatterns$1632(pattern$1687.inner, stx$1688[0].token.inner, env$1689, false);
                rest$1694 = stx$1688.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1688,
                    patternEnv: patternEnv$1690
                };
            }
            success$1695 = subMatch$1691.success;
            // merge the subpattern matches with the current pattern environment
            _$1612.keys(subMatch$1691.patternEnv).forEach(function (patternKey$1696) {
                if (pattern$1687.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1697 = subMatch$1691.patternEnv[patternKey$1696].level + 1;
                    if (patternEnv$1690[patternKey$1696]) {
                        patternEnv$1690[patternKey$1696].level = nextLevel$1697;
                        patternEnv$1690[patternKey$1696].match.push(subMatch$1691.patternEnv[patternKey$1696]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1690[patternKey$1696] = {
                            level: nextLevel$1697,
                            match: [subMatch$1691.patternEnv[patternKey$1696]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1690[patternKey$1696] = subMatch$1691.patternEnv[patternKey$1696];
                }
            });
        } else {
            if (pattern$1687.class === 'pattern_literal') {
                // wildcard
                if (stx$1688[0] && pattern$1687.value === '_') {
                    success$1695 = true;
                    rest$1694 = stx$1688.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1688[0] && pattern$1687.value === stx$1688[0].token.value) {
                    success$1695 = true;
                    rest$1694 = stx$1688.slice(1);
                } else {
                    success$1695 = false;
                    rest$1694 = stx$1688;
                }
            } else {
                match$1692 = matchPatternClass$1631(pattern$1687.class, stx$1688, env$1689);
                success$1695 = match$1692.result !== null;
                rest$1694 = match$1692.rest;
                matchEnv$1693 = {
                    level: 0,
                    match: match$1692.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1687.repeat) {
                    if (patternEnv$1690[pattern$1687.value]) {
                        patternEnv$1690[pattern$1687.value].match.push(matchEnv$1693);
                    } else {
                        // initialize if necessary
                        patternEnv$1690[pattern$1687.value] = {
                            level: 1,
                            match: [matchEnv$1693]
                        };
                    }
                } else {
                    patternEnv$1690[pattern$1687.value] = matchEnv$1693;
                }
            }
        }
        return {
            success: success$1695,
            rest: rest$1694,
            patternEnv: patternEnv$1690
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1634(macroBody$1698, macroNameStx$1699, env$1700) {
        return _$1612.chain(macroBody$1698).reduce(function (acc$1701, bodyStx$1702, idx$1703, original$1704) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1705 = original$1704[idx$1703 - 1];
            var next$1706 = original$1704[idx$1703 + 1];
            var nextNext$1707 = original$1704[idx$1703 + 2];
            // drop `...`
            if (bodyStx$1702.token.value === '...') {
                return acc$1701;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1625(bodyStx$1702) && next$1706 && next$1706.token.value === '...') {
                return acc$1701;
            }
            // skip the $ in $(...)
            if (bodyStx$1702.token.value === '$' && next$1706 && next$1706.token.type === parser$1614.Token.Delimiter && next$1706.token.value === '()') {
                return acc$1701;
            }
            // mark $[...] as a literal
            if (bodyStx$1702.token.value === '$' && next$1706 && next$1706.token.type === parser$1614.Token.Delimiter && next$1706.token.value === '[]') {
                next$1706.literal = true;
                return acc$1701;
            }
            if (bodyStx$1702.token.type === parser$1614.Token.Delimiter && bodyStx$1702.token.value === '()' && last$1705 && last$1705.token.value === '$') {
                bodyStx$1702.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1702.literal === true) {
                parser$1614.assert(bodyStx$1702.token.type === parser$1614.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1701.concat(bodyStx$1702.token.inner);
            }
            if (next$1706 && next$1706.token.value === '...') {
                bodyStx$1702.repeat = true;
                bodyStx$1702.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1625(next$1706) && nextNext$1707 && nextNext$1707.token.value === '...') {
                bodyStx$1702.repeat = true;
                bodyStx$1702.separator = next$1706.token.inner[0].token.value;
            }
            return acc$1701.concat(bodyStx$1702);
        }, []).reduce(function (acc$1708, bodyStx$1709, idx$1710) {
            // then do the actual transcription
            if (bodyStx$1709.repeat) {
                if (bodyStx$1709.token.type === parser$1614.Token.Delimiter) {
                    bodyStx$1709.expose();
                    var fv$1711 = _$1612.filter(freeVarsInPattern$1622(bodyStx$1709.token.inner), function (pat$1718) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1700.hasOwnProperty(pat$1718);
                        });
                    var restrictedEnv$1712 = [];
                    var nonScalar$1713 = _$1612.find(fv$1711, function (pat$1719) {
                            return env$1700[pat$1719].level > 0;
                        });
                    parser$1614.assert(typeof nonScalar$1713 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1714 = env$1700[nonScalar$1713].match.length;
                    var sameLength$1715 = _$1612.all(fv$1711, function (pat$1720) {
                            return env$1700[pat$1720].level === 0 || env$1700[pat$1720].match.length === repeatLength$1714;
                        });
                    parser$1614.assert(sameLength$1715, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1712 = _$1612.map(_$1612.range(repeatLength$1714), function (idx$1721) {
                        var renv$1722 = {};
                        _$1612.each(fv$1711, function (pat$1723) {
                            if (env$1700[pat$1723].level === 0) {
                                // copy scalars over
                                renv$1722[pat$1723] = env$1700[pat$1723];
                            } else {
                                // grab the match at this index
                                renv$1722[pat$1723] = env$1700[pat$1723].match[idx$1721];
                            }
                        });
                        return renv$1722;
                    });
                    var transcribed$1716 = _$1612.map(restrictedEnv$1712, function (renv$1724) {
                            if (bodyStx$1709.group) {
                                return transcribe$1634(bodyStx$1709.token.inner, macroNameStx$1699, renv$1724);
                            } else {
                                var newBody$1725 = syntaxFromToken$1618(_$1612.clone(bodyStx$1709.token), bodyStx$1709);
                                newBody$1725.token.inner = transcribe$1634(bodyStx$1709.token.inner, macroNameStx$1699, renv$1724);
                                return newBody$1725;
                            }
                        });
                    var joined$1717;
                    if (bodyStx$1709.group) {
                        joined$1717 = joinSyntaxArr$1621(transcribed$1716, bodyStx$1709.separator);
                    } else {
                        joined$1717 = joinSyntax$1620(transcribed$1716, bodyStx$1709.separator);
                    }
                    return acc$1708.concat(joined$1717);
                }
                if (!env$1700[bodyStx$1709.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1709.token.value + ' is not bound for the template');
                } else if (env$1700[bodyStx$1709.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1709.token.value + ' does not match in the template');
                }
                return acc$1708.concat(joinRepeatedMatch$1627(env$1700[bodyStx$1709.token.value].match, bodyStx$1709.separator));
            } else {
                if (bodyStx$1709.token.type === parser$1614.Token.Delimiter) {
                    bodyStx$1709.expose();
                    var newBody$1726 = syntaxFromToken$1618(_$1612.clone(bodyStx$1709.token), macroBody$1698);
                    newBody$1726.token.inner = transcribe$1634(bodyStx$1709.token.inner, macroNameStx$1699, env$1700);
                    return acc$1708.concat([newBody$1726]);
                }
                if (isPatternVar$1626(bodyStx$1709) && Object.prototype.hasOwnProperty.bind(env$1700)(bodyStx$1709.token.value)) {
                    if (!env$1700[bodyStx$1709.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1709.token.value + ' is not bound for the template');
                    } else if (env$1700[bodyStx$1709.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1709.token.value + ' does not match in the template');
                    }
                    return acc$1708.concat(env$1700[bodyStx$1709.token.value].match);
                }
                return acc$1708.concat([bodyStx$1709]);
            }
        }, []).value();
    }
    exports$1611.loadPattern = loadPattern$1630;
    exports$1611.matchPatterns = matchPatterns$1632;
    exports$1611.transcribe = transcribe$1634;
    exports$1611.matchPatternClass = matchPatternClass$1631;
    exports$1611.takeLineContext = takeLineContext$1628;
    exports$1611.takeLine = takeLine$1629;
}));
//# sourceMappingURL=patterns.js.map