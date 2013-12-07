(function (root$1622, factory$1623) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1623(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1623);
    }
}(this, function (exports$1624, _$1625, es6$1626, parser$1627, expander$1628, syntax$1629) {
    var get_expression$1630 = expander$1628.get_expression;
    var syntaxFromToken$1631 = syntax$1629.syntaxFromToken;
    var makePunc$1632 = syntax$1629.makePunc;
    var joinSyntax$1633 = syntax$1629.joinSyntax;
    var joinSyntaxArr$1634 = syntax$1629.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1635(pattern$1648) {
        var fv$1649 = [];
        _$1625.each(pattern$1648, function (pat$1650) {
            if (isPatternVar$1639(pat$1650)) {
                fv$1649.push(pat$1650.token.value);
            } else if (pat$1650.token.type === parser$1627.Token.Delimiter) {
                fv$1649 = fv$1649.concat(freeVarsInPattern$1635(pat$1650.token.inner));
            }
        });
        return fv$1649;
    }
    function typeIsLiteral$1636(type$1651) {
        return type$1651 === parser$1627.Token.NullLiteral || type$1651 === parser$1627.Token.NumericLiteral || type$1651 === parser$1627.Token.StringLiteral || type$1651 === parser$1627.Token.RegexLiteral || type$1651 === parser$1627.Token.BooleanLiteral;
    }
    function containsPatternVar$1637(patterns$1652) {
        return _$1625.any(patterns$1652, function (pat$1653) {
            if (pat$1653.token.type === parser$1627.Token.Delimiter) {
                return containsPatternVar$1637(pat$1653.token.inner);
            }
            return isPatternVar$1639(pat$1653);
        });
    }
    function delimIsSeparator$1638(delim$1654) {
        return delim$1654 && delim$1654.token && delim$1654.token.type === parser$1627.Token.Delimiter && delim$1654.token.value === '()' && delim$1654.token.inner.length === 1 && delim$1654.token.inner[0].token.type !== parser$1627.Token.Delimiter && !containsPatternVar$1637(delim$1654.token.inner);
    }
    function isPatternVar$1639(stx$1655) {
        return stx$1655.token.value[0] === '$' && stx$1655.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1640(tojoin$1656, punc$1657) {
        return _$1625.reduce(_$1625.rest(tojoin$1656, 1), function (acc$1658, join$1659) {
            if (punc$1657 === ' ') {
                return acc$1658.concat(join$1659.match);
            }
            return acc$1658.concat(makePunc$1632(punc$1657, _$1625.first(join$1659.match)), join$1659.match);
        }, _$1625.first(tojoin$1656).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1641(from$1660, to$1661) {
        return _$1625.map(to$1661, function (stx$1662) {
            return takeLine$1642(from$1660, stx$1662);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1642(from$1663, to$1664) {
        if (to$1664.token.type === parser$1627.Token.Delimiter) {
            var next$1665;
            if (from$1663.token.type === parser$1627.Token.Delimiter) {
                next$1665 = syntaxFromToken$1631({
                    type: parser$1627.Token.Delimiter,
                    value: to$1664.token.value,
                    inner: takeLineContext$1641(from$1663, to$1664.token.inner),
                    startRange: from$1663.token.startRange,
                    endRange: from$1663.token.endRange,
                    startLineNumber: from$1663.token.startLineNumber,
                    startLineStart: from$1663.token.startLineStart,
                    endLineNumber: from$1663.token.endLineNumber,
                    endLineStart: from$1663.token.endLineStart
                }, to$1664);
            } else {
                next$1665 = syntaxFromToken$1631({
                    type: parser$1627.Token.Delimiter,
                    value: to$1664.token.value,
                    inner: takeLineContext$1641(from$1663, to$1664.token.inner),
                    startRange: from$1663.token.range,
                    endRange: from$1663.token.range,
                    startLineNumber: from$1663.token.lineNumber,
                    startLineStart: from$1663.token.lineStart,
                    endLineNumber: from$1663.token.lineNumber,
                    endLineStart: from$1663.token.lineStart
                }, to$1664);
            }
        } else {
            if (from$1663.token.type === parser$1627.Token.Delimiter) {
                next$1665 = syntaxFromToken$1631({
                    value: to$1664.token.value,
                    type: to$1664.token.type,
                    lineNumber: from$1663.token.startLineNumber,
                    lineStart: from$1663.token.startLineStart,
                    range: from$1663.token.startRange
                }, to$1664);
            } else {
                next$1665 = syntaxFromToken$1631({
                    value: to$1664.token.value,
                    type: to$1664.token.type,
                    lineNumber: from$1663.token.lineNumber,
                    lineStart: from$1663.token.lineStart,
                    range: from$1663.token.range
                }, to$1664);
            }
        }
        if (to$1664.token.leadingComments) {
            next$1665.token.leadingComments = to$1664.token.leadingComments;
        }
        if (to$1664.token.trailingComments) {
            next$1665.token.trailingComments = to$1664.token.trailingComments;
        }
        return next$1665;
    }
    function loadPattern$1643(patterns$1666) {
        return _$1625.chain(patterns$1666).reduce(function (acc$1667, patStx$1668, idx$1669) {
            var last$1670 = patterns$1666[idx$1669 - 1];
            var lastLast$1671 = patterns$1666[idx$1669 - 2];
            var next$1672 = patterns$1666[idx$1669 + 1];
            var nextNext$1673 = patterns$1666[idx$1669 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1668.token.value === ':') {
                if (last$1670 && isPatternVar$1639(last$1670) && !isPatternVar$1639(next$1672)) {
                    return acc$1667;
                }
            }
            if (last$1670 && last$1670.token.value === ':') {
                if (lastLast$1671 && isPatternVar$1639(lastLast$1671) && !isPatternVar$1639(patStx$1668)) {
                    return acc$1667;
                }
            }
            // skip over $
            if (patStx$1668.token.value === '$' && next$1672 && next$1672.token.type === parser$1627.Token.Delimiter) {
                return acc$1667;
            }
            if (isPatternVar$1639(patStx$1668)) {
                if (next$1672 && next$1672.token.value === ':' && !isPatternVar$1639(nextNext$1673)) {
                    if (typeof nextNext$1673 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1668.class = nextNext$1673.token.value;
                } else {
                    patStx$1668.class = 'token';
                }
            } else if (patStx$1668.token.type === parser$1627.Token.Delimiter) {
                if (last$1670 && last$1670.token.value === '$') {
                    patStx$1668.class = 'pattern_group';
                }
                patStx$1668.token.inner = loadPattern$1643(patStx$1668.token.inner);
            } else {
                patStx$1668.class = 'pattern_literal';
            }
            return acc$1667.concat(patStx$1668);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1674, patStx$1675, idx$1676, patterns$1677) {
            var separator$1678 = ' ';
            var repeat$1679 = false;
            var next$1680 = patterns$1677[idx$1676 + 1];
            var nextNext$1681 = patterns$1677[idx$1676 + 2];
            if (next$1680 && next$1680.token.value === '...') {
                repeat$1679 = true;
                separator$1678 = ' ';
            } else if (delimIsSeparator$1638(next$1680) && nextNext$1681 && nextNext$1681.token.value === '...') {
                repeat$1679 = true;
                parser$1627.assert(next$1680.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1678 = next$1680.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1675.token.value === '...' || delimIsSeparator$1638(patStx$1675) && next$1680 && next$1680.token.value === '...') {
                return acc$1674;
            }
            patStx$1675.repeat = repeat$1679;
            patStx$1675.separator = separator$1678;
            return acc$1674.concat(patStx$1675);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1644(patternClass$1682, stx$1683, env$1684) {
        var result$1685, rest$1686;
        // pattern has no parse class
        if (patternClass$1682 === 'token' && stx$1683[0] && stx$1683[0].token.type !== parser$1627.Token.EOF) {
            result$1685 = [stx$1683[0]];
            rest$1686 = stx$1683.slice(1);
        } else if (patternClass$1682 === 'lit' && stx$1683[0] && typeIsLiteral$1636(stx$1683[0].token.type)) {
            result$1685 = [stx$1683[0]];
            rest$1686 = stx$1683.slice(1);
        } else if (patternClass$1682 === 'ident' && stx$1683[0] && stx$1683[0].token.type === parser$1627.Token.Identifier) {
            result$1685 = [stx$1683[0]];
            rest$1686 = stx$1683.slice(1);
        } else if (stx$1683.length > 0 && patternClass$1682 === 'VariableStatement') {
            var match$1687 = expander$1628.enforest(stx$1683, expander$1628.makeExpanderContext({ env: env$1684 }));
            if (match$1687.result && match$1687.result.hasPrototype(expander$1628.VariableStatement)) {
                result$1685 = match$1687.result.destruct(false);
                rest$1686 = match$1687.rest;
            } else {
                result$1685 = null;
                rest$1686 = stx$1683;
            }
        } else if (stx$1683.length > 0 && patternClass$1682 === 'expr') {
            var match$1687 = expander$1628.get_expression(stx$1683, expander$1628.makeExpanderContext({ env: env$1684 }));
            if (match$1687.result === null || !match$1687.result.hasPrototype(expander$1628.Expr)) {
                result$1685 = null;
                rest$1686 = stx$1683;
            } else {
                result$1685 = match$1687.result.destruct(false);
                rest$1686 = match$1687.rest;
            }
        } else {
            result$1685 = null;
            rest$1686 = stx$1683;
        }
        return {
            result: result$1685,
            rest: rest$1686
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1645(patterns$1688, stx$1689, env$1690, topLevel$1691) {
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
        topLevel$1691 = topLevel$1691 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1692 = [];
        var patternEnv$1693 = {};
        var match$1694;
        var pattern$1695;
        var rest$1696 = stx$1689;
        var success$1697 = true;
        patternLoop:
            for (var i$1698 = 0; i$1698 < patterns$1688.length; i$1698++) {
                if (success$1697 === false) {
                    break;
                }
                pattern$1695 = patterns$1688[i$1698];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1695.repeat && i$1698 + 1 < patterns$1688.length) {
                        var restMatch$1699 = matchPatterns$1645(patterns$1688.slice(i$1698 + 1), rest$1696, env$1690, topLevel$1691);
                        if (restMatch$1699.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1694 = matchPattern$1646(pattern$1695, [], env$1690, patternEnv$1693);
                            patternEnv$1693 = _$1625.extend(restMatch$1699.patternEnv, match$1694.patternEnv);
                            rest$1696 = restMatch$1699.rest;
                            break patternLoop;
                        }
                    }
                    match$1694 = matchPattern$1646(pattern$1695, rest$1696, env$1690, patternEnv$1693);
                    if (!match$1694.success && pattern$1695.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1694.success) {
                        success$1697 = false;
                        break;
                    }
                    rest$1696 = match$1694.rest;
                    patternEnv$1693 = match$1694.patternEnv;
                    if (success$1697 && !(topLevel$1691 || pattern$1695.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1698 == patterns$1688.length - 1 && rest$1696.length !== 0) {
                            success$1697 = false;
                            break;
                        }
                    }
                    if (pattern$1695.repeat && success$1697) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1696[0] && rest$1696[0].token.value === pattern$1695.separator) {
                            // more tokens and the next token matches the separator
                            rest$1696 = rest$1696.slice(1);
                        } else if (pattern$1695.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1695.separator !== ' ' && rest$1696.length > 0 && i$1698 === patterns$1688.length - 1 && topLevel$1691 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1697 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1695.repeat && success$1697 && rest$1696.length > 0);
            }
        return {
            success: success$1697,
            rest: rest$1696,
            patternEnv: patternEnv$1693
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
    function matchPattern$1646(pattern$1700, stx$1701, env$1702, patternEnv$1703) {
        var subMatch$1704;
        var match$1705, matchEnv$1706;
        var rest$1707;
        var success$1708;
        if (typeof pattern$1700.inner !== 'undefined') {
            if (pattern$1700.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1704 = matchPatterns$1645(pattern$1700.inner, stx$1701, env$1702, true);
                rest$1707 = subMatch$1704.rest;
            } else if (stx$1701[0] && stx$1701[0].token.type === parser$1627.Token.Delimiter && stx$1701[0].token.value === pattern$1700.value) {
                stx$1701[0].expose();
                if (pattern$1700.inner.length === 0 && stx$1701[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1701,
                        patternEnv: patternEnv$1703
                    };
                }
                subMatch$1704 = matchPatterns$1645(pattern$1700.inner, stx$1701[0].token.inner, env$1702, false);
                rest$1707 = stx$1701.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1701,
                    patternEnv: patternEnv$1703
                };
            }
            success$1708 = subMatch$1704.success;
            // merge the subpattern matches with the current pattern environment
            _$1625.keys(subMatch$1704.patternEnv).forEach(function (patternKey$1709) {
                if (pattern$1700.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1710 = subMatch$1704.patternEnv[patternKey$1709].level + 1;
                    if (patternEnv$1703[patternKey$1709]) {
                        patternEnv$1703[patternKey$1709].level = nextLevel$1710;
                        patternEnv$1703[patternKey$1709].match.push(subMatch$1704.patternEnv[patternKey$1709]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1703[patternKey$1709] = {
                            level: nextLevel$1710,
                            match: [subMatch$1704.patternEnv[patternKey$1709]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1703[patternKey$1709] = subMatch$1704.patternEnv[patternKey$1709];
                }
            });
        } else {
            if (pattern$1700.class === 'pattern_literal') {
                // wildcard
                if (stx$1701[0] && pattern$1700.value === '_') {
                    success$1708 = true;
                    rest$1707 = stx$1701.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1701[0] && pattern$1700.value === stx$1701[0].token.value) {
                    success$1708 = true;
                    rest$1707 = stx$1701.slice(1);
                } else {
                    success$1708 = false;
                    rest$1707 = stx$1701;
                }
            } else {
                match$1705 = matchPatternClass$1644(pattern$1700.class, stx$1701, env$1702);
                success$1708 = match$1705.result !== null;
                rest$1707 = match$1705.rest;
                matchEnv$1706 = {
                    level: 0,
                    match: match$1705.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1700.repeat) {
                    if (patternEnv$1703[pattern$1700.value]) {
                        patternEnv$1703[pattern$1700.value].match.push(matchEnv$1706);
                    } else {
                        // initialize if necessary
                        patternEnv$1703[pattern$1700.value] = {
                            level: 1,
                            match: [matchEnv$1706]
                        };
                    }
                } else {
                    patternEnv$1703[pattern$1700.value] = matchEnv$1706;
                }
            }
        }
        return {
            success: success$1708,
            rest: rest$1707,
            patternEnv: patternEnv$1703
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1647(macroBody$1711, macroNameStx$1712, env$1713) {
        return _$1625.chain(macroBody$1711).reduce(function (acc$1714, bodyStx$1715, idx$1716, original$1717) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1718 = original$1717[idx$1716 - 1];
            var next$1719 = original$1717[idx$1716 + 1];
            var nextNext$1720 = original$1717[idx$1716 + 2];
            // drop `...`
            if (bodyStx$1715.token.value === '...') {
                return acc$1714;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1638(bodyStx$1715) && next$1719 && next$1719.token.value === '...') {
                return acc$1714;
            }
            // skip the $ in $(...)
            if (bodyStx$1715.token.value === '$' && next$1719 && next$1719.token.type === parser$1627.Token.Delimiter && next$1719.token.value === '()') {
                return acc$1714;
            }
            // mark $[...] as a literal
            if (bodyStx$1715.token.value === '$' && next$1719 && next$1719.token.type === parser$1627.Token.Delimiter && next$1719.token.value === '[]') {
                next$1719.literal = true;
                return acc$1714;
            }
            if (bodyStx$1715.token.type === parser$1627.Token.Delimiter && bodyStx$1715.token.value === '()' && last$1718 && last$1718.token.value === '$') {
                bodyStx$1715.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1715.literal === true) {
                parser$1627.assert(bodyStx$1715.token.type === parser$1627.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1714.concat(bodyStx$1715.token.inner);
            }
            if (next$1719 && next$1719.token.value === '...') {
                bodyStx$1715.repeat = true;
                bodyStx$1715.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1638(next$1719) && nextNext$1720 && nextNext$1720.token.value === '...') {
                bodyStx$1715.repeat = true;
                bodyStx$1715.separator = next$1719.token.inner[0].token.value;
            }
            return acc$1714.concat(bodyStx$1715);
        }, []).reduce(function (acc$1721, bodyStx$1722, idx$1723) {
            // then do the actual transcription
            if (bodyStx$1722.repeat) {
                if (bodyStx$1722.token.type === parser$1627.Token.Delimiter) {
                    bodyStx$1722.expose();
                    var fv$1724 = _$1625.filter(freeVarsInPattern$1635(bodyStx$1722.token.inner), function (pat$1731) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1713.hasOwnProperty(pat$1731);
                        });
                    var restrictedEnv$1725 = [];
                    var nonScalar$1726 = _$1625.find(fv$1724, function (pat$1732) {
                            return env$1713[pat$1732].level > 0;
                        });
                    parser$1627.assert(typeof nonScalar$1726 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1727 = env$1713[nonScalar$1726].match.length;
                    var sameLength$1728 = _$1625.all(fv$1724, function (pat$1733) {
                            return env$1713[pat$1733].level === 0 || env$1713[pat$1733].match.length === repeatLength$1727;
                        });
                    parser$1627.assert(sameLength$1728, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1725 = _$1625.map(_$1625.range(repeatLength$1727), function (idx$1734) {
                        var renv$1735 = {};
                        _$1625.each(fv$1724, function (pat$1736) {
                            if (env$1713[pat$1736].level === 0) {
                                // copy scalars over
                                renv$1735[pat$1736] = env$1713[pat$1736];
                            } else {
                                // grab the match at this index
                                renv$1735[pat$1736] = env$1713[pat$1736].match[idx$1734];
                            }
                        });
                        return renv$1735;
                    });
                    var transcribed$1729 = _$1625.map(restrictedEnv$1725, function (renv$1737) {
                            if (bodyStx$1722.group) {
                                return transcribe$1647(bodyStx$1722.token.inner, macroNameStx$1712, renv$1737);
                            } else {
                                var newBody$1738 = syntaxFromToken$1631(_$1625.clone(bodyStx$1722.token), bodyStx$1722);
                                newBody$1738.token.inner = transcribe$1647(bodyStx$1722.token.inner, macroNameStx$1712, renv$1737);
                                return newBody$1738;
                            }
                        });
                    var joined$1730;
                    if (bodyStx$1722.group) {
                        joined$1730 = joinSyntaxArr$1634(transcribed$1729, bodyStx$1722.separator);
                    } else {
                        joined$1730 = joinSyntax$1633(transcribed$1729, bodyStx$1722.separator);
                    }
                    return acc$1721.concat(joined$1730);
                }
                if (!env$1713[bodyStx$1722.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1722.token.value + ' is not bound for the template');
                } else if (env$1713[bodyStx$1722.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1722.token.value + ' does not match in the template');
                }
                return acc$1721.concat(joinRepeatedMatch$1640(env$1713[bodyStx$1722.token.value].match, bodyStx$1722.separator));
            } else {
                if (bodyStx$1722.token.type === parser$1627.Token.Delimiter) {
                    bodyStx$1722.expose();
                    var newBody$1739 = syntaxFromToken$1631(_$1625.clone(bodyStx$1722.token), macroBody$1711);
                    newBody$1739.token.inner = transcribe$1647(bodyStx$1722.token.inner, macroNameStx$1712, env$1713);
                    return acc$1721.concat([newBody$1739]);
                }
                if (isPatternVar$1639(bodyStx$1722) && Object.prototype.hasOwnProperty.bind(env$1713)(bodyStx$1722.token.value)) {
                    if (!env$1713[bodyStx$1722.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1722.token.value + ' is not bound for the template');
                    } else if (env$1713[bodyStx$1722.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1722.token.value + ' does not match in the template');
                    }
                    return acc$1721.concat(env$1713[bodyStx$1722.token.value].match);
                }
                return acc$1721.concat([bodyStx$1722]);
            }
        }, []).value();
    }
    exports$1624.loadPattern = loadPattern$1643;
    exports$1624.matchPatterns = matchPatterns$1645;
    exports$1624.transcribe = transcribe$1647;
    exports$1624.matchPatternClass = matchPatternClass$1644;
    exports$1624.takeLineContext = takeLineContext$1641;
    exports$1624.takeLine = takeLine$1642;
}));
//# sourceMappingURL=patterns.js.map