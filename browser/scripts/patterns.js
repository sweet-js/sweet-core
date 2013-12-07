(function (root$1600, factory$1601) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1601(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1601);
    }
}(this, function (exports$1602, _$1603, es6$1604, parser$1605, expander$1606, syntax$1607) {
    var get_expression$1608 = expander$1606.get_expression;
    var syntaxFromToken$1609 = syntax$1607.syntaxFromToken;
    var makePunc$1610 = syntax$1607.makePunc;
    var joinSyntax$1611 = syntax$1607.joinSyntax;
    var joinSyntaxArr$1612 = syntax$1607.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1613(pattern$1626) {
        var fv$1627 = [];
        _$1603.each(pattern$1626, function (pat$1628) {
            if (isPatternVar$1617(pat$1628)) {
                fv$1627.push(pat$1628.token.value);
            } else if (pat$1628.token.type === parser$1605.Token.Delimiter) {
                fv$1627 = fv$1627.concat(freeVarsInPattern$1613(pat$1628.token.inner));
            }
        });
        return fv$1627;
    }
    function typeIsLiteral$1614(type$1629) {
        return type$1629 === parser$1605.Token.NullLiteral || type$1629 === parser$1605.Token.NumericLiteral || type$1629 === parser$1605.Token.StringLiteral || type$1629 === parser$1605.Token.RegexLiteral || type$1629 === parser$1605.Token.BooleanLiteral;
    }
    function containsPatternVar$1615(patterns$1630) {
        return _$1603.any(patterns$1630, function (pat$1631) {
            if (pat$1631.token.type === parser$1605.Token.Delimiter) {
                return containsPatternVar$1615(pat$1631.token.inner);
            }
            return isPatternVar$1617(pat$1631);
        });
    }
    function delimIsSeparator$1616(delim$1632) {
        return delim$1632 && delim$1632.token && delim$1632.token.type === parser$1605.Token.Delimiter && delim$1632.token.value === '()' && delim$1632.token.inner.length === 1 && delim$1632.token.inner[0].token.type !== parser$1605.Token.Delimiter && !containsPatternVar$1615(delim$1632.token.inner);
    }
    function isPatternVar$1617(stx$1633) {
        return stx$1633.token.value[0] === '$' && stx$1633.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1618(tojoin$1634, punc$1635) {
        return _$1603.reduce(_$1603.rest(tojoin$1634, 1), function (acc$1636, join$1637) {
            if (punc$1635 === ' ') {
                return acc$1636.concat(join$1637.match);
            }
            return acc$1636.concat(makePunc$1610(punc$1635, _$1603.first(join$1637.match)), join$1637.match);
        }, _$1603.first(tojoin$1634).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1619(from$1638, to$1639) {
        return _$1603.map(to$1639, function (stx$1640) {
            return takeLine$1620(from$1638, stx$1640);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1620(from$1641, to$1642) {
        if (to$1642.token.type === parser$1605.Token.Delimiter) {
            var next$1643;
            if (from$1641.token.type === parser$1605.Token.Delimiter) {
                next$1643 = syntaxFromToken$1609({
                    type: parser$1605.Token.Delimiter,
                    value: to$1642.token.value,
                    inner: takeLineContext$1619(from$1641, to$1642.token.inner),
                    startRange: from$1641.token.startRange,
                    endRange: from$1641.token.endRange,
                    startLineNumber: from$1641.token.startLineNumber,
                    startLineStart: from$1641.token.startLineStart,
                    endLineNumber: from$1641.token.endLineNumber,
                    endLineStart: from$1641.token.endLineStart
                }, to$1642);
            } else {
                next$1643 = syntaxFromToken$1609({
                    type: parser$1605.Token.Delimiter,
                    value: to$1642.token.value,
                    inner: takeLineContext$1619(from$1641, to$1642.token.inner),
                    startRange: from$1641.token.range,
                    endRange: from$1641.token.range,
                    startLineNumber: from$1641.token.lineNumber,
                    startLineStart: from$1641.token.lineStart,
                    endLineNumber: from$1641.token.lineNumber,
                    endLineStart: from$1641.token.lineStart
                }, to$1642);
            }
        } else {
            if (from$1641.token.type === parser$1605.Token.Delimiter) {
                next$1643 = syntaxFromToken$1609({
                    value: to$1642.token.value,
                    type: to$1642.token.type,
                    lineNumber: from$1641.token.startLineNumber,
                    lineStart: from$1641.token.startLineStart,
                    range: from$1641.token.startRange
                }, to$1642);
            } else {
                next$1643 = syntaxFromToken$1609({
                    value: to$1642.token.value,
                    type: to$1642.token.type,
                    lineNumber: from$1641.token.lineNumber,
                    lineStart: from$1641.token.lineStart,
                    range: from$1641.token.range
                }, to$1642);
            }
        }
        if (to$1642.token.leadingComments) {
            next$1643.token.leadingComments = to$1642.token.leadingComments;
        }
        if (to$1642.token.trailingComments) {
            next$1643.token.trailingComments = to$1642.token.trailingComments;
        }
        return next$1643;
    }
    function loadPattern$1621(patterns$1644) {
        return _$1603.chain(patterns$1644).reduce(function (acc$1645, patStx$1646, idx$1647) {
            var last$1648 = patterns$1644[idx$1647 - 1];
            var lastLast$1649 = patterns$1644[idx$1647 - 2];
            var next$1650 = patterns$1644[idx$1647 + 1];
            var nextNext$1651 = patterns$1644[idx$1647 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1646.token.value === ':') {
                if (last$1648 && isPatternVar$1617(last$1648) && !isPatternVar$1617(next$1650)) {
                    return acc$1645;
                }
            }
            if (last$1648 && last$1648.token.value === ':') {
                if (lastLast$1649 && isPatternVar$1617(lastLast$1649) && !isPatternVar$1617(patStx$1646)) {
                    return acc$1645;
                }
            }
            // skip over $
            if (patStx$1646.token.value === '$' && next$1650 && next$1650.token.type === parser$1605.Token.Delimiter) {
                return acc$1645;
            }
            if (isPatternVar$1617(patStx$1646)) {
                if (next$1650 && next$1650.token.value === ':' && !isPatternVar$1617(nextNext$1651)) {
                    if (typeof nextNext$1651 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1646.class = nextNext$1651.token.value;
                } else {
                    patStx$1646.class = 'token';
                }
            } else if (patStx$1646.token.type === parser$1605.Token.Delimiter) {
                if (last$1648 && last$1648.token.value === '$') {
                    patStx$1646.class = 'pattern_group';
                }
                patStx$1646.token.inner = loadPattern$1621(patStx$1646.token.inner);
            } else {
                patStx$1646.class = 'pattern_literal';
            }
            return acc$1645.concat(patStx$1646);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1652, patStx$1653, idx$1654, patterns$1655) {
            var separator$1656 = ' ';
            var repeat$1657 = false;
            var next$1658 = patterns$1655[idx$1654 + 1];
            var nextNext$1659 = patterns$1655[idx$1654 + 2];
            if (next$1658 && next$1658.token.value === '...') {
                repeat$1657 = true;
                separator$1656 = ' ';
            } else if (delimIsSeparator$1616(next$1658) && nextNext$1659 && nextNext$1659.token.value === '...') {
                repeat$1657 = true;
                parser$1605.assert(next$1658.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1656 = next$1658.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1653.token.value === '...' || delimIsSeparator$1616(patStx$1653) && next$1658 && next$1658.token.value === '...') {
                return acc$1652;
            }
            patStx$1653.repeat = repeat$1657;
            patStx$1653.separator = separator$1656;
            return acc$1652.concat(patStx$1653);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1622(patternClass$1660, stx$1661, env$1662) {
        var result$1663, rest$1664;
        // pattern has no parse class
        if (patternClass$1660 === 'token' && stx$1661[0] && stx$1661[0].token.type !== parser$1605.Token.EOF) {
            result$1663 = [stx$1661[0]];
            rest$1664 = stx$1661.slice(1);
        } else if (patternClass$1660 === 'lit' && stx$1661[0] && typeIsLiteral$1614(stx$1661[0].token.type)) {
            result$1663 = [stx$1661[0]];
            rest$1664 = stx$1661.slice(1);
        } else if (patternClass$1660 === 'ident' && stx$1661[0] && stx$1661[0].token.type === parser$1605.Token.Identifier) {
            result$1663 = [stx$1661[0]];
            rest$1664 = stx$1661.slice(1);
        } else if (stx$1661.length > 0 && patternClass$1660 === 'VariableStatement') {
            var match$1665 = expander$1606.enforest(stx$1661, expander$1606.makeExpanderContext({ env: env$1662 }));
            if (match$1665.result && match$1665.result.hasPrototype(expander$1606.VariableStatement)) {
                result$1663 = match$1665.result.destruct(false);
                rest$1664 = match$1665.rest;
            } else {
                result$1663 = null;
                rest$1664 = stx$1661;
            }
        } else if (stx$1661.length > 0 && patternClass$1660 === 'expr') {
            var match$1665 = expander$1606.get_expression(stx$1661, expander$1606.makeExpanderContext({ env: env$1662 }));
            if (match$1665.result === null || !match$1665.result.hasPrototype(expander$1606.Expr)) {
                result$1663 = null;
                rest$1664 = stx$1661;
            } else {
                result$1663 = match$1665.result.destruct(false);
                rest$1664 = match$1665.rest;
            }
        } else {
            result$1663 = null;
            rest$1664 = stx$1661;
        }
        return {
            result: result$1663,
            rest: rest$1664
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1623(patterns$1666, stx$1667, env$1668, topLevel$1669) {
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
        topLevel$1669 = topLevel$1669 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1670 = [];
        var patternEnv$1671 = {};
        var match$1672;
        var pattern$1673;
        var rest$1674 = stx$1667;
        var success$1675 = true;
        patternLoop:
            for (var i$1676 = 0; i$1676 < patterns$1666.length; i$1676++) {
                if (success$1675 === false) {
                    break;
                }
                pattern$1673 = patterns$1666[i$1676];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1673.repeat && i$1676 + 1 < patterns$1666.length) {
                        var restMatch$1677 = matchPatterns$1623(patterns$1666.slice(i$1676 + 1), rest$1674, env$1668, topLevel$1669);
                        if (restMatch$1677.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1672 = matchPattern$1624(pattern$1673, [], env$1668, patternEnv$1671);
                            patternEnv$1671 = _$1603.extend(restMatch$1677.patternEnv, match$1672.patternEnv);
                            rest$1674 = restMatch$1677.rest;
                            break patternLoop;
                        }
                    }
                    match$1672 = matchPattern$1624(pattern$1673, rest$1674, env$1668, patternEnv$1671);
                    if (!match$1672.success && pattern$1673.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1672.success) {
                        success$1675 = false;
                        break;
                    }
                    rest$1674 = match$1672.rest;
                    patternEnv$1671 = match$1672.patternEnv;
                    if (success$1675 && !(topLevel$1669 || pattern$1673.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1676 == patterns$1666.length - 1 && rest$1674.length !== 0) {
                            success$1675 = false;
                            break;
                        }
                    }
                    if (pattern$1673.repeat && success$1675) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1674[0] && rest$1674[0].token.value === pattern$1673.separator) {
                            // more tokens and the next token matches the separator
                            rest$1674 = rest$1674.slice(1);
                        } else if (pattern$1673.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1673.separator !== ' ' && rest$1674.length > 0 && i$1676 === patterns$1666.length - 1 && topLevel$1669 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1675 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1673.repeat && success$1675 && rest$1674.length > 0);
            }
        return {
            success: success$1675,
            rest: rest$1674,
            patternEnv: patternEnv$1671
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
    function matchPattern$1624(pattern$1678, stx$1679, env$1680, patternEnv$1681) {
        var subMatch$1682;
        var match$1683, matchEnv$1684;
        var rest$1685;
        var success$1686;
        if (typeof pattern$1678.inner !== 'undefined') {
            if (pattern$1678.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1682 = matchPatterns$1623(pattern$1678.inner, stx$1679, env$1680, true);
                rest$1685 = subMatch$1682.rest;
            } else if (stx$1679[0] && stx$1679[0].token.type === parser$1605.Token.Delimiter && stx$1679[0].token.value === pattern$1678.value) {
                stx$1679[0].expose();
                if (pattern$1678.inner.length === 0 && stx$1679[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1679,
                        patternEnv: patternEnv$1681
                    };
                }
                subMatch$1682 = matchPatterns$1623(pattern$1678.inner, stx$1679[0].token.inner, env$1680, false);
                rest$1685 = stx$1679.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1679,
                    patternEnv: patternEnv$1681
                };
            }
            success$1686 = subMatch$1682.success;
            // merge the subpattern matches with the current pattern environment
            _$1603.keys(subMatch$1682.patternEnv).forEach(function (patternKey$1687) {
                if (pattern$1678.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1688 = subMatch$1682.patternEnv[patternKey$1687].level + 1;
                    if (patternEnv$1681[patternKey$1687]) {
                        patternEnv$1681[patternKey$1687].level = nextLevel$1688;
                        patternEnv$1681[patternKey$1687].match.push(subMatch$1682.patternEnv[patternKey$1687]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1681[patternKey$1687] = {
                            level: nextLevel$1688,
                            match: [subMatch$1682.patternEnv[patternKey$1687]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1681[patternKey$1687] = subMatch$1682.patternEnv[patternKey$1687];
                }
            });
        } else {
            if (pattern$1678.class === 'pattern_literal') {
                // wildcard
                if (stx$1679[0] && pattern$1678.value === '_') {
                    success$1686 = true;
                    rest$1685 = stx$1679.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1679[0] && pattern$1678.value === stx$1679[0].token.value) {
                    success$1686 = true;
                    rest$1685 = stx$1679.slice(1);
                } else {
                    success$1686 = false;
                    rest$1685 = stx$1679;
                }
            } else {
                match$1683 = matchPatternClass$1622(pattern$1678.class, stx$1679, env$1680);
                success$1686 = match$1683.result !== null;
                rest$1685 = match$1683.rest;
                matchEnv$1684 = {
                    level: 0,
                    match: match$1683.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1678.repeat) {
                    if (patternEnv$1681[pattern$1678.value]) {
                        patternEnv$1681[pattern$1678.value].match.push(matchEnv$1684);
                    } else {
                        // initialize if necessary
                        patternEnv$1681[pattern$1678.value] = {
                            level: 1,
                            match: [matchEnv$1684]
                        };
                    }
                } else {
                    patternEnv$1681[pattern$1678.value] = matchEnv$1684;
                }
            }
        }
        return {
            success: success$1686,
            rest: rest$1685,
            patternEnv: patternEnv$1681
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1625(macroBody$1689, macroNameStx$1690, env$1691) {
        return _$1603.chain(macroBody$1689).reduce(function (acc$1692, bodyStx$1693, idx$1694, original$1695) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1696 = original$1695[idx$1694 - 1];
            var next$1697 = original$1695[idx$1694 + 1];
            var nextNext$1698 = original$1695[idx$1694 + 2];
            // drop `...`
            if (bodyStx$1693.token.value === '...') {
                return acc$1692;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1616(bodyStx$1693) && next$1697 && next$1697.token.value === '...') {
                return acc$1692;
            }
            // skip the $ in $(...)
            if (bodyStx$1693.token.value === '$' && next$1697 && next$1697.token.type === parser$1605.Token.Delimiter && next$1697.token.value === '()') {
                return acc$1692;
            }
            // mark $[...] as a literal
            if (bodyStx$1693.token.value === '$' && next$1697 && next$1697.token.type === parser$1605.Token.Delimiter && next$1697.token.value === '[]') {
                next$1697.literal = true;
                return acc$1692;
            }
            if (bodyStx$1693.token.type === parser$1605.Token.Delimiter && bodyStx$1693.token.value === '()' && last$1696 && last$1696.token.value === '$') {
                bodyStx$1693.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1693.literal === true) {
                parser$1605.assert(bodyStx$1693.token.type === parser$1605.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1692.concat(bodyStx$1693.token.inner);
            }
            if (next$1697 && next$1697.token.value === '...') {
                bodyStx$1693.repeat = true;
                bodyStx$1693.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1616(next$1697) && nextNext$1698 && nextNext$1698.token.value === '...') {
                bodyStx$1693.repeat = true;
                bodyStx$1693.separator = next$1697.token.inner[0].token.value;
            }
            return acc$1692.concat(bodyStx$1693);
        }, []).reduce(function (acc$1699, bodyStx$1700, idx$1701) {
            // then do the actual transcription
            if (bodyStx$1700.repeat) {
                if (bodyStx$1700.token.type === parser$1605.Token.Delimiter) {
                    bodyStx$1700.expose();
                    var fv$1702 = _$1603.filter(freeVarsInPattern$1613(bodyStx$1700.token.inner), function (pat$1709) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1691.hasOwnProperty(pat$1709);
                        });
                    var restrictedEnv$1703 = [];
                    var nonScalar$1704 = _$1603.find(fv$1702, function (pat$1710) {
                            return env$1691[pat$1710].level > 0;
                        });
                    parser$1605.assert(typeof nonScalar$1704 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1705 = env$1691[nonScalar$1704].match.length;
                    var sameLength$1706 = _$1603.all(fv$1702, function (pat$1711) {
                            return env$1691[pat$1711].level === 0 || env$1691[pat$1711].match.length === repeatLength$1705;
                        });
                    parser$1605.assert(sameLength$1706, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1703 = _$1603.map(_$1603.range(repeatLength$1705), function (idx$1712) {
                        var renv$1713 = {};
                        _$1603.each(fv$1702, function (pat$1714) {
                            if (env$1691[pat$1714].level === 0) {
                                // copy scalars over
                                renv$1713[pat$1714] = env$1691[pat$1714];
                            } else {
                                // grab the match at this index
                                renv$1713[pat$1714] = env$1691[pat$1714].match[idx$1712];
                            }
                        });
                        return renv$1713;
                    });
                    var transcribed$1707 = _$1603.map(restrictedEnv$1703, function (renv$1715) {
                            if (bodyStx$1700.group) {
                                return transcribe$1625(bodyStx$1700.token.inner, macroNameStx$1690, renv$1715);
                            } else {
                                var newBody$1716 = syntaxFromToken$1609(_$1603.clone(bodyStx$1700.token), bodyStx$1700);
                                newBody$1716.token.inner = transcribe$1625(bodyStx$1700.token.inner, macroNameStx$1690, renv$1715);
                                return newBody$1716;
                            }
                        });
                    var joined$1708;
                    if (bodyStx$1700.group) {
                        joined$1708 = joinSyntaxArr$1612(transcribed$1707, bodyStx$1700.separator);
                    } else {
                        joined$1708 = joinSyntax$1611(transcribed$1707, bodyStx$1700.separator);
                    }
                    return acc$1699.concat(joined$1708);
                }
                if (!env$1691[bodyStx$1700.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1700.token.value + ' is not bound for the template');
                } else if (env$1691[bodyStx$1700.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1700.token.value + ' does not match in the template');
                }
                return acc$1699.concat(joinRepeatedMatch$1618(env$1691[bodyStx$1700.token.value].match, bodyStx$1700.separator));
            } else {
                if (bodyStx$1700.token.type === parser$1605.Token.Delimiter) {
                    bodyStx$1700.expose();
                    var newBody$1717 = syntaxFromToken$1609(_$1603.clone(bodyStx$1700.token), macroBody$1689);
                    newBody$1717.token.inner = transcribe$1625(bodyStx$1700.token.inner, macroNameStx$1690, env$1691);
                    return acc$1699.concat([newBody$1717]);
                }
                if (isPatternVar$1617(bodyStx$1700) && Object.prototype.hasOwnProperty.bind(env$1691)(bodyStx$1700.token.value)) {
                    if (!env$1691[bodyStx$1700.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1700.token.value + ' is not bound for the template');
                    } else if (env$1691[bodyStx$1700.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1700.token.value + ' does not match in the template');
                    }
                    return acc$1699.concat(env$1691[bodyStx$1700.token.value].match);
                }
                return acc$1699.concat([bodyStx$1700]);
            }
        }, []).value();
    }
    exports$1602.loadPattern = loadPattern$1621;
    exports$1602.matchPatterns = matchPatterns$1623;
    exports$1602.transcribe = transcribe$1625;
    exports$1602.matchPatternClass = matchPatternClass$1622;
    exports$1602.takeLineContext = takeLineContext$1619;
    exports$1602.takeLine = takeLine$1620;
}));