(function (root$1604, factory$1605) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1605(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1605);
    }
}(this, function (exports$1606, _$1607, es6$1608, parser$1609, expander$1610, syntax$1611) {
    var get_expression$1612 = expander$1610.get_expression;
    var syntaxFromToken$1613 = syntax$1611.syntaxFromToken;
    var makePunc$1614 = syntax$1611.makePunc;
    var joinSyntax$1615 = syntax$1611.joinSyntax;
    var joinSyntaxArr$1616 = syntax$1611.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1617(pattern$1630) {
        var fv$1631 = [];
        _$1607.each(pattern$1630, function (pat$1632) {
            if (isPatternVar$1621(pat$1632)) {
                fv$1631.push(pat$1632.token.value);
            } else if (pat$1632.token.type === parser$1609.Token.Delimiter) {
                fv$1631 = fv$1631.concat(freeVarsInPattern$1617(pat$1632.token.inner));
            }
        });
        return fv$1631;
    }
    function typeIsLiteral$1618(type$1633) {
        return type$1633 === parser$1609.Token.NullLiteral || type$1633 === parser$1609.Token.NumericLiteral || type$1633 === parser$1609.Token.StringLiteral || type$1633 === parser$1609.Token.RegexLiteral || type$1633 === parser$1609.Token.BooleanLiteral;
    }
    function containsPatternVar$1619(patterns$1634) {
        return _$1607.any(patterns$1634, function (pat$1635) {
            if (pat$1635.token.type === parser$1609.Token.Delimiter) {
                return containsPatternVar$1619(pat$1635.token.inner);
            }
            return isPatternVar$1621(pat$1635);
        });
    }
    function delimIsSeparator$1620(delim$1636) {
        return delim$1636 && delim$1636.token && delim$1636.token.type === parser$1609.Token.Delimiter && delim$1636.token.value === '()' && delim$1636.token.inner.length === 1 && delim$1636.token.inner[0].token.type !== parser$1609.Token.Delimiter && !containsPatternVar$1619(delim$1636.token.inner);
    }
    function isPatternVar$1621(stx$1637) {
        return stx$1637.token.value[0] === '$' && stx$1637.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1622(tojoin$1638, punc$1639) {
        return _$1607.reduce(_$1607.rest(tojoin$1638, 1), function (acc$1640, join$1641) {
            if (punc$1639 === ' ') {
                return acc$1640.concat(join$1641.match);
            }
            return acc$1640.concat(makePunc$1614(punc$1639, _$1607.first(join$1641.match)), join$1641.match);
        }, _$1607.first(tojoin$1638).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1623(from$1642, to$1643) {
        return _$1607.map(to$1643, function (stx$1644) {
            return takeLine$1624(from$1642, stx$1644);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1624(from$1645, to$1646) {
        if (to$1646.token.type === parser$1609.Token.Delimiter) {
            var next$1647;
            if (from$1645.token.type === parser$1609.Token.Delimiter) {
                next$1647 = syntaxFromToken$1613({
                    type: parser$1609.Token.Delimiter,
                    value: to$1646.token.value,
                    inner: takeLineContext$1623(from$1645, to$1646.token.inner),
                    startRange: from$1645.token.startRange,
                    endRange: from$1645.token.endRange,
                    startLineNumber: from$1645.token.startLineNumber,
                    startLineStart: from$1645.token.startLineStart,
                    endLineNumber: from$1645.token.endLineNumber,
                    endLineStart: from$1645.token.endLineStart
                }, to$1646);
            } else {
                next$1647 = syntaxFromToken$1613({
                    type: parser$1609.Token.Delimiter,
                    value: to$1646.token.value,
                    inner: takeLineContext$1623(from$1645, to$1646.token.inner),
                    startRange: from$1645.token.range,
                    endRange: from$1645.token.range,
                    startLineNumber: from$1645.token.lineNumber,
                    startLineStart: from$1645.token.lineStart,
                    endLineNumber: from$1645.token.lineNumber,
                    endLineStart: from$1645.token.lineStart
                }, to$1646);
            }
        } else {
            if (from$1645.token.type === parser$1609.Token.Delimiter) {
                next$1647 = syntaxFromToken$1613({
                    value: to$1646.token.value,
                    type: to$1646.token.type,
                    lineNumber: from$1645.token.startLineNumber,
                    lineStart: from$1645.token.startLineStart,
                    range: from$1645.token.startRange
                }, to$1646);
            } else {
                next$1647 = syntaxFromToken$1613({
                    value: to$1646.token.value,
                    type: to$1646.token.type,
                    lineNumber: from$1645.token.lineNumber,
                    lineStart: from$1645.token.lineStart,
                    range: from$1645.token.range
                }, to$1646);
            }
        }
        if (to$1646.token.leadingComments) {
            next$1647.token.leadingComments = to$1646.token.leadingComments;
        }
        if (to$1646.token.trailingComments) {
            next$1647.token.trailingComments = to$1646.token.trailingComments;
        }
        return next$1647;
    }
    function loadPattern$1625(patterns$1648) {
        return _$1607.chain(patterns$1648).reduce(function (acc$1649, patStx$1650, idx$1651) {
            var last$1652 = patterns$1648[idx$1651 - 1];
            var lastLast$1653 = patterns$1648[idx$1651 - 2];
            var next$1654 = patterns$1648[idx$1651 + 1];
            var nextNext$1655 = patterns$1648[idx$1651 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1650.token.value === ':') {
                if (last$1652 && isPatternVar$1621(last$1652) && !isPatternVar$1621(next$1654)) {
                    return acc$1649;
                }
            }
            if (last$1652 && last$1652.token.value === ':') {
                if (lastLast$1653 && isPatternVar$1621(lastLast$1653) && !isPatternVar$1621(patStx$1650)) {
                    return acc$1649;
                }
            }
            // skip over $
            if (patStx$1650.token.value === '$' && next$1654 && next$1654.token.type === parser$1609.Token.Delimiter) {
                return acc$1649;
            }
            if (isPatternVar$1621(patStx$1650)) {
                if (next$1654 && next$1654.token.value === ':' && !isPatternVar$1621(nextNext$1655)) {
                    if (typeof nextNext$1655 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1650.class = nextNext$1655.token.value;
                } else {
                    patStx$1650.class = 'token';
                }
            } else if (patStx$1650.token.type === parser$1609.Token.Delimiter) {
                if (last$1652 && last$1652.token.value === '$') {
                    patStx$1650.class = 'pattern_group';
                }
                patStx$1650.token.inner = loadPattern$1625(patStx$1650.token.inner);
            } else {
                patStx$1650.class = 'pattern_literal';
            }
            return acc$1649.concat(patStx$1650);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1656, patStx$1657, idx$1658, patterns$1659) {
            var separator$1660 = ' ';
            var repeat$1661 = false;
            var next$1662 = patterns$1659[idx$1658 + 1];
            var nextNext$1663 = patterns$1659[idx$1658 + 2];
            if (next$1662 && next$1662.token.value === '...') {
                repeat$1661 = true;
                separator$1660 = ' ';
            } else if (delimIsSeparator$1620(next$1662) && nextNext$1663 && nextNext$1663.token.value === '...') {
                repeat$1661 = true;
                parser$1609.assert(next$1662.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1660 = next$1662.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1657.token.value === '...' || delimIsSeparator$1620(patStx$1657) && next$1662 && next$1662.token.value === '...') {
                return acc$1656;
            }
            patStx$1657.repeat = repeat$1661;
            patStx$1657.separator = separator$1660;
            return acc$1656.concat(patStx$1657);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1626(patternClass$1664, stx$1665, env$1666) {
        var result$1667, rest$1668;
        // pattern has no parse class
        if (patternClass$1664 === 'token' && stx$1665[0] && stx$1665[0].token.type !== parser$1609.Token.EOF) {
            result$1667 = [stx$1665[0]];
            rest$1668 = stx$1665.slice(1);
        } else if (patternClass$1664 === 'lit' && stx$1665[0] && typeIsLiteral$1618(stx$1665[0].token.type)) {
            result$1667 = [stx$1665[0]];
            rest$1668 = stx$1665.slice(1);
        } else if (patternClass$1664 === 'ident' && stx$1665[0] && stx$1665[0].token.type === parser$1609.Token.Identifier) {
            result$1667 = [stx$1665[0]];
            rest$1668 = stx$1665.slice(1);
        } else if (stx$1665.length > 0 && patternClass$1664 === 'VariableStatement') {
            var match$1669 = expander$1610.enforest(stx$1665, expander$1610.makeExpanderContext({ env: env$1666 }));
            if (match$1669.result && match$1669.result.hasPrototype(expander$1610.VariableStatement)) {
                result$1667 = match$1669.result.destruct(false);
                rest$1668 = match$1669.rest;
            } else {
                result$1667 = null;
                rest$1668 = stx$1665;
            }
        } else if (stx$1665.length > 0 && patternClass$1664 === 'expr') {
            var match$1669 = expander$1610.get_expression(stx$1665, expander$1610.makeExpanderContext({ env: env$1666 }));
            if (match$1669.result === null || !match$1669.result.hasPrototype(expander$1610.Expr)) {
                result$1667 = null;
                rest$1668 = stx$1665;
            } else {
                result$1667 = match$1669.result.destruct(false);
                rest$1668 = match$1669.rest;
            }
        } else {
            result$1667 = null;
            rest$1668 = stx$1665;
        }
        return {
            result: result$1667,
            rest: rest$1668
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1627(patterns$1670, stx$1671, env$1672, topLevel$1673) {
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
        topLevel$1673 = topLevel$1673 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1674 = [];
        var patternEnv$1675 = {};
        var match$1676;
        var pattern$1677;
        var rest$1678 = stx$1671;
        var success$1679 = true;
        patternLoop:
            for (var i$1680 = 0; i$1680 < patterns$1670.length; i$1680++) {
                if (success$1679 === false) {
                    break;
                }
                pattern$1677 = patterns$1670[i$1680];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1677.repeat && i$1680 + 1 < patterns$1670.length) {
                        var restMatch$1681 = matchPatterns$1627(patterns$1670.slice(i$1680 + 1), rest$1678, env$1672, topLevel$1673);
                        if (restMatch$1681.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1676 = matchPattern$1628(pattern$1677, [], env$1672, patternEnv$1675);
                            patternEnv$1675 = _$1607.extend(restMatch$1681.patternEnv, match$1676.patternEnv);
                            rest$1678 = restMatch$1681.rest;
                            break patternLoop;
                        }
                    }
                    match$1676 = matchPattern$1628(pattern$1677, rest$1678, env$1672, patternEnv$1675);
                    if (!match$1676.success && pattern$1677.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1676.success) {
                        success$1679 = false;
                        break;
                    }
                    rest$1678 = match$1676.rest;
                    patternEnv$1675 = match$1676.patternEnv;
                    if (success$1679 && !(topLevel$1673 || pattern$1677.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1680 == patterns$1670.length - 1 && rest$1678.length !== 0) {
                            success$1679 = false;
                            break;
                        }
                    }
                    if (pattern$1677.repeat && success$1679) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1678[0] && rest$1678[0].token.value === pattern$1677.separator) {
                            // more tokens and the next token matches the separator
                            rest$1678 = rest$1678.slice(1);
                        } else if (pattern$1677.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1677.separator !== ' ' && rest$1678.length > 0 && i$1680 === patterns$1670.length - 1 && topLevel$1673 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1679 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1677.repeat && success$1679 && rest$1678.length > 0);
            }
        return {
            success: success$1679,
            rest: rest$1678,
            patternEnv: patternEnv$1675
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
    function matchPattern$1628(pattern$1682, stx$1683, env$1684, patternEnv$1685) {
        var subMatch$1686;
        var match$1687, matchEnv$1688;
        var rest$1689;
        var success$1690;
        if (typeof pattern$1682.inner !== 'undefined') {
            if (pattern$1682.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1686 = matchPatterns$1627(pattern$1682.inner, stx$1683, env$1684, true);
                rest$1689 = subMatch$1686.rest;
            } else if (stx$1683[0] && stx$1683[0].token.type === parser$1609.Token.Delimiter && stx$1683[0].token.value === pattern$1682.value) {
                stx$1683[0].expose();
                if (pattern$1682.inner.length === 0 && stx$1683[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1683,
                        patternEnv: patternEnv$1685
                    };
                }
                subMatch$1686 = matchPatterns$1627(pattern$1682.inner, stx$1683[0].token.inner, env$1684, false);
                rest$1689 = stx$1683.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1683,
                    patternEnv: patternEnv$1685
                };
            }
            success$1690 = subMatch$1686.success;
            // merge the subpattern matches with the current pattern environment
            _$1607.keys(subMatch$1686.patternEnv).forEach(function (patternKey$1691) {
                if (pattern$1682.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1692 = subMatch$1686.patternEnv[patternKey$1691].level + 1;
                    if (patternEnv$1685[patternKey$1691]) {
                        patternEnv$1685[patternKey$1691].level = nextLevel$1692;
                        patternEnv$1685[patternKey$1691].match.push(subMatch$1686.patternEnv[patternKey$1691]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1685[patternKey$1691] = {
                            level: nextLevel$1692,
                            match: [subMatch$1686.patternEnv[patternKey$1691]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1685[patternKey$1691] = subMatch$1686.patternEnv[patternKey$1691];
                }
            });
        } else {
            if (pattern$1682.class === 'pattern_literal') {
                // wildcard
                if (stx$1683[0] && pattern$1682.value === '_') {
                    success$1690 = true;
                    rest$1689 = stx$1683.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1683[0] && pattern$1682.value === stx$1683[0].token.value) {
                    success$1690 = true;
                    rest$1689 = stx$1683.slice(1);
                } else {
                    success$1690 = false;
                    rest$1689 = stx$1683;
                }
            } else {
                match$1687 = matchPatternClass$1626(pattern$1682.class, stx$1683, env$1684);
                success$1690 = match$1687.result !== null;
                rest$1689 = match$1687.rest;
                matchEnv$1688 = {
                    level: 0,
                    match: match$1687.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1682.repeat) {
                    if (patternEnv$1685[pattern$1682.value]) {
                        patternEnv$1685[pattern$1682.value].match.push(matchEnv$1688);
                    } else {
                        // initialize if necessary
                        patternEnv$1685[pattern$1682.value] = {
                            level: 1,
                            match: [matchEnv$1688]
                        };
                    }
                } else {
                    patternEnv$1685[pattern$1682.value] = matchEnv$1688;
                }
            }
        }
        return {
            success: success$1690,
            rest: rest$1689,
            patternEnv: patternEnv$1685
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1629(macroBody$1693, macroNameStx$1694, env$1695) {
        return _$1607.chain(macroBody$1693).reduce(function (acc$1696, bodyStx$1697, idx$1698, original$1699) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1700 = original$1699[idx$1698 - 1];
            var next$1701 = original$1699[idx$1698 + 1];
            var nextNext$1702 = original$1699[idx$1698 + 2];
            // drop `...`
            if (bodyStx$1697.token.value === '...') {
                return acc$1696;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1620(bodyStx$1697) && next$1701 && next$1701.token.value === '...') {
                return acc$1696;
            }
            // skip the $ in $(...)
            if (bodyStx$1697.token.value === '$' && next$1701 && next$1701.token.type === parser$1609.Token.Delimiter && next$1701.token.value === '()') {
                return acc$1696;
            }
            // mark $[...] as a literal
            if (bodyStx$1697.token.value === '$' && next$1701 && next$1701.token.type === parser$1609.Token.Delimiter && next$1701.token.value === '[]') {
                next$1701.literal = true;
                return acc$1696;
            }
            if (bodyStx$1697.token.type === parser$1609.Token.Delimiter && bodyStx$1697.token.value === '()' && last$1700 && last$1700.token.value === '$') {
                bodyStx$1697.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1697.literal === true) {
                parser$1609.assert(bodyStx$1697.token.type === parser$1609.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1696.concat(bodyStx$1697.token.inner);
            }
            if (next$1701 && next$1701.token.value === '...') {
                bodyStx$1697.repeat = true;
                bodyStx$1697.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1620(next$1701) && nextNext$1702 && nextNext$1702.token.value === '...') {
                bodyStx$1697.repeat = true;
                bodyStx$1697.separator = next$1701.token.inner[0].token.value;
            }
            return acc$1696.concat(bodyStx$1697);
        }, []).reduce(function (acc$1703, bodyStx$1704, idx$1705) {
            // then do the actual transcription
            if (bodyStx$1704.repeat) {
                if (bodyStx$1704.token.type === parser$1609.Token.Delimiter) {
                    bodyStx$1704.expose();
                    var fv$1706 = _$1607.filter(freeVarsInPattern$1617(bodyStx$1704.token.inner), function (pat$1713) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1695.hasOwnProperty(pat$1713);
                        });
                    var restrictedEnv$1707 = [];
                    var nonScalar$1708 = _$1607.find(fv$1706, function (pat$1714) {
                            return env$1695[pat$1714].level > 0;
                        });
                    parser$1609.assert(typeof nonScalar$1708 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1709 = env$1695[nonScalar$1708].match.length;
                    var sameLength$1710 = _$1607.all(fv$1706, function (pat$1715) {
                            return env$1695[pat$1715].level === 0 || env$1695[pat$1715].match.length === repeatLength$1709;
                        });
                    parser$1609.assert(sameLength$1710, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1707 = _$1607.map(_$1607.range(repeatLength$1709), function (idx$1716) {
                        var renv$1717 = {};
                        _$1607.each(fv$1706, function (pat$1718) {
                            if (env$1695[pat$1718].level === 0) {
                                // copy scalars over
                                renv$1717[pat$1718] = env$1695[pat$1718];
                            } else {
                                // grab the match at this index
                                renv$1717[pat$1718] = env$1695[pat$1718].match[idx$1716];
                            }
                        });
                        return renv$1717;
                    });
                    var transcribed$1711 = _$1607.map(restrictedEnv$1707, function (renv$1719) {
                            if (bodyStx$1704.group) {
                                return transcribe$1629(bodyStx$1704.token.inner, macroNameStx$1694, renv$1719);
                            } else {
                                var newBody$1720 = syntaxFromToken$1613(_$1607.clone(bodyStx$1704.token), bodyStx$1704);
                                newBody$1720.token.inner = transcribe$1629(bodyStx$1704.token.inner, macroNameStx$1694, renv$1719);
                                return newBody$1720;
                            }
                        });
                    var joined$1712;
                    if (bodyStx$1704.group) {
                        joined$1712 = joinSyntaxArr$1616(transcribed$1711, bodyStx$1704.separator);
                    } else {
                        joined$1712 = joinSyntax$1615(transcribed$1711, bodyStx$1704.separator);
                    }
                    return acc$1703.concat(joined$1712);
                }
                if (!env$1695[bodyStx$1704.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1704.token.value + ' is not bound for the template');
                } else if (env$1695[bodyStx$1704.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1704.token.value + ' does not match in the template');
                }
                return acc$1703.concat(joinRepeatedMatch$1622(env$1695[bodyStx$1704.token.value].match, bodyStx$1704.separator));
            } else {
                if (bodyStx$1704.token.type === parser$1609.Token.Delimiter) {
                    bodyStx$1704.expose();
                    var newBody$1721 = syntaxFromToken$1613(_$1607.clone(bodyStx$1704.token), macroBody$1693);
                    newBody$1721.token.inner = transcribe$1629(bodyStx$1704.token.inner, macroNameStx$1694, env$1695);
                    return acc$1703.concat([newBody$1721]);
                }
                if (isPatternVar$1621(bodyStx$1704) && Object.prototype.hasOwnProperty.bind(env$1695)(bodyStx$1704.token.value)) {
                    if (!env$1695[bodyStx$1704.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1704.token.value + ' is not bound for the template');
                    } else if (env$1695[bodyStx$1704.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1704.token.value + ' does not match in the template');
                    }
                    return acc$1703.concat(env$1695[bodyStx$1704.token.value].match);
                }
                return acc$1703.concat([bodyStx$1704]);
            }
        }, []).value();
    }
    exports$1606.loadPattern = loadPattern$1625;
    exports$1606.matchPatterns = matchPatterns$1627;
    exports$1606.transcribe = transcribe$1629;
    exports$1606.matchPatternClass = matchPatternClass$1626;
    exports$1606.takeLineContext = takeLineContext$1623;
    exports$1606.takeLine = takeLine$1624;
}));