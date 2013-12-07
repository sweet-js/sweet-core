(function (root$1607, factory$1608) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1608(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1608);
    }
}(this, function (exports$1609, _$1610, es6$1611, parser$1612, expander$1613, syntax$1614) {
    var get_expression$1615 = expander$1613.get_expression;
    var syntaxFromToken$1616 = syntax$1614.syntaxFromToken;
    var makePunc$1617 = syntax$1614.makePunc;
    var joinSyntax$1618 = syntax$1614.joinSyntax;
    var joinSyntaxArr$1619 = syntax$1614.joinSyntaxArr;
    // ([...CSyntax]) -> [...Str]
    function freeVarsInPattern$1620(pattern$1633) {
        var fv$1634 = [];
        _$1610.each(pattern$1633, function (pat$1635) {
            if (isPatternVar$1624(pat$1635)) {
                fv$1634.push(pat$1635.token.value);
            } else if (pat$1635.token.type === parser$1612.Token.Delimiter) {
                fv$1634 = fv$1634.concat(freeVarsInPattern$1620(pat$1635.token.inner));
            }
        });
        return fv$1634;
    }
    function typeIsLiteral$1621(type$1636) {
        return type$1636 === parser$1612.Token.NullLiteral || type$1636 === parser$1612.Token.NumericLiteral || type$1636 === parser$1612.Token.StringLiteral || type$1636 === parser$1612.Token.RegexLiteral || type$1636 === parser$1612.Token.BooleanLiteral;
    }
    function containsPatternVar$1622(patterns$1637) {
        return _$1610.any(patterns$1637, function (pat$1638) {
            if (pat$1638.token.type === parser$1612.Token.Delimiter) {
                return containsPatternVar$1622(pat$1638.token.inner);
            }
            return isPatternVar$1624(pat$1638);
        });
    }
    function delimIsSeparator$1623(delim$1639) {
        return delim$1639 && delim$1639.token && delim$1639.token.type === parser$1612.Token.Delimiter && delim$1639.token.value === '()' && delim$1639.token.inner.length === 1 && delim$1639.token.inner[0].token.type !== parser$1612.Token.Delimiter && !containsPatternVar$1622(delim$1639.token.inner);
    }
    function isPatternVar$1624(stx$1640) {
        return stx$1640.token.value[0] === '$' && stx$1640.token.value !== '$';
    }
    // ([...{level: Num, match: [...CSyntax]}], Str) -> [...CSyntax]
    function joinRepeatedMatch$1625(tojoin$1641, punc$1642) {
        return _$1610.reduce(_$1610.rest(tojoin$1641, 1), function (acc$1643, join$1644) {
            if (punc$1642 === ' ') {
                return acc$1643.concat(join$1644.match);
            }
            return acc$1643.concat(makePunc$1617(punc$1642, _$1610.first(join$1644.match)), join$1644.match);
        }, _$1610.first(tojoin$1641).match);
    }
    // take the line context (range, lineNumber)
    // (CSyntax, [...CSyntax]) -> [...CSyntax]
    function takeLineContext$1626(from$1645, to$1646) {
        return _$1610.map(to$1646, function (stx$1647) {
            return takeLine$1627(from$1645, stx$1647);
        });
    }
    // (CSyntax, CSyntax) -> CSyntax
    function takeLine$1627(from$1648, to$1649) {
        if (to$1649.token.type === parser$1612.Token.Delimiter) {
            var next$1650;
            if (from$1648.token.type === parser$1612.Token.Delimiter) {
                next$1650 = syntaxFromToken$1616({
                    type: parser$1612.Token.Delimiter,
                    value: to$1649.token.value,
                    inner: takeLineContext$1626(from$1648, to$1649.token.inner),
                    startRange: from$1648.token.startRange,
                    endRange: from$1648.token.endRange,
                    startLineNumber: from$1648.token.startLineNumber,
                    startLineStart: from$1648.token.startLineStart,
                    endLineNumber: from$1648.token.endLineNumber,
                    endLineStart: from$1648.token.endLineStart
                }, to$1649);
            } else {
                next$1650 = syntaxFromToken$1616({
                    type: parser$1612.Token.Delimiter,
                    value: to$1649.token.value,
                    inner: takeLineContext$1626(from$1648, to$1649.token.inner),
                    startRange: from$1648.token.range,
                    endRange: from$1648.token.range,
                    startLineNumber: from$1648.token.lineNumber,
                    startLineStart: from$1648.token.lineStart,
                    endLineNumber: from$1648.token.lineNumber,
                    endLineStart: from$1648.token.lineStart
                }, to$1649);
            }
        } else {
            if (from$1648.token.type === parser$1612.Token.Delimiter) {
                next$1650 = syntaxFromToken$1616({
                    value: to$1649.token.value,
                    type: to$1649.token.type,
                    lineNumber: from$1648.token.startLineNumber,
                    lineStart: from$1648.token.startLineStart,
                    range: from$1648.token.startRange
                }, to$1649);
            } else {
                next$1650 = syntaxFromToken$1616({
                    value: to$1649.token.value,
                    type: to$1649.token.type,
                    lineNumber: from$1648.token.lineNumber,
                    lineStart: from$1648.token.lineStart,
                    range: from$1648.token.range
                }, to$1649);
            }
        }
        if (to$1649.token.leadingComments) {
            next$1650.token.leadingComments = to$1649.token.leadingComments;
        }
        if (to$1649.token.trailingComments) {
            next$1650.token.trailingComments = to$1649.token.trailingComments;
        }
        return next$1650;
    }
    function loadPattern$1628(patterns$1651) {
        return _$1610.chain(patterns$1651).reduce(function (acc$1652, patStx$1653, idx$1654) {
            var last$1655 = patterns$1651[idx$1654 - 1];
            var lastLast$1656 = patterns$1651[idx$1654 - 2];
            var next$1657 = patterns$1651[idx$1654 + 1];
            var nextNext$1658 = patterns$1651[idx$1654 + 2];
            // skip over the `:lit` part of `$x:lit`
            if (patStx$1653.token.value === ':') {
                if (last$1655 && isPatternVar$1624(last$1655) && !isPatternVar$1624(next$1657)) {
                    return acc$1652;
                }
            }
            if (last$1655 && last$1655.token.value === ':') {
                if (lastLast$1656 && isPatternVar$1624(lastLast$1656) && !isPatternVar$1624(patStx$1653)) {
                    return acc$1652;
                }
            }
            // skip over $
            if (patStx$1653.token.value === '$' && next$1657 && next$1657.token.type === parser$1612.Token.Delimiter) {
                return acc$1652;
            }
            if (isPatternVar$1624(patStx$1653)) {
                if (next$1657 && next$1657.token.value === ':' && !isPatternVar$1624(nextNext$1658)) {
                    if (typeof nextNext$1658 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1653.class = nextNext$1658.token.value;
                } else {
                    patStx$1653.class = 'token';
                }
            } else if (patStx$1653.token.type === parser$1612.Token.Delimiter) {
                if (last$1655 && last$1655.token.value === '$') {
                    patStx$1653.class = 'pattern_group';
                }
                patStx$1653.token.inner = loadPattern$1628(patStx$1653.token.inner);
            } else {
                patStx$1653.class = 'pattern_literal';
            }
            return acc$1652.concat(patStx$1653);
        }    // then second pass to mark repeat and separator
, []).reduce(function (acc$1659, patStx$1660, idx$1661, patterns$1662) {
            var separator$1663 = ' ';
            var repeat$1664 = false;
            var next$1665 = patterns$1662[idx$1661 + 1];
            var nextNext$1666 = patterns$1662[idx$1661 + 2];
            if (next$1665 && next$1665.token.value === '...') {
                repeat$1664 = true;
                separator$1663 = ' ';
            } else if (delimIsSeparator$1623(next$1665) && nextNext$1666 && nextNext$1666.token.value === '...') {
                repeat$1664 = true;
                parser$1612.assert(next$1665.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1663 = next$1665.token.inner[0].token.value;
            }
            // skip over ... and (,)
            if (patStx$1660.token.value === '...' || delimIsSeparator$1623(patStx$1660) && next$1665 && next$1665.token.value === '...') {
                return acc$1659;
            }
            patStx$1660.repeat = repeat$1664;
            patStx$1660.separator = separator$1663;
            return acc$1659.concat(patStx$1660);
        }, []).value();
    }
    // (Str, [...CSyntax], MacroEnv) -> {result: null or [...CSyntax], rest: [...CSyntax]}
    function matchPatternClass$1629(patternClass$1667, stx$1668, env$1669) {
        var result$1670, rest$1671;
        // pattern has no parse class
        if (patternClass$1667 === 'token' && stx$1668[0] && stx$1668[0].token.type !== parser$1612.Token.EOF) {
            result$1670 = [stx$1668[0]];
            rest$1671 = stx$1668.slice(1);
        } else if (patternClass$1667 === 'lit' && stx$1668[0] && typeIsLiteral$1621(stx$1668[0].token.type)) {
            result$1670 = [stx$1668[0]];
            rest$1671 = stx$1668.slice(1);
        } else if (patternClass$1667 === 'ident' && stx$1668[0] && stx$1668[0].token.type === parser$1612.Token.Identifier) {
            result$1670 = [stx$1668[0]];
            rest$1671 = stx$1668.slice(1);
        } else if (stx$1668.length > 0 && patternClass$1667 === 'VariableStatement') {
            var match$1672 = expander$1613.enforest(stx$1668, expander$1613.makeExpanderContext({ env: env$1669 }));
            if (match$1672.result && match$1672.result.hasPrototype(expander$1613.VariableStatement)) {
                result$1670 = match$1672.result.destruct(false);
                rest$1671 = match$1672.rest;
            } else {
                result$1670 = null;
                rest$1671 = stx$1668;
            }
        } else if (stx$1668.length > 0 && patternClass$1667 === 'expr') {
            var match$1672 = expander$1613.get_expression(stx$1668, expander$1613.makeExpanderContext({ env: env$1669 }));
            if (match$1672.result === null || !match$1672.result.hasPrototype(expander$1613.Expr)) {
                result$1670 = null;
                rest$1671 = stx$1668;
            } else {
                result$1670 = match$1672.result.destruct(false);
                rest$1671 = match$1672.rest;
            }
        } else {
            result$1670 = null;
            rest$1671 = stx$1668;
        }
        return {
            result: result$1670,
            rest: rest$1671
        };
    }
    // attempt to match patterns against stx
    // ([...Pattern], [...Syntax], Env) -> { result: [...Syntax], rest: [...Syntax], patternEnv: PatternEnv }
    function matchPatterns$1630(patterns$1673, stx$1674, env$1675, topLevel$1676) {
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
        topLevel$1676 = topLevel$1676 || false;
        // note that there are two environments floating around,
        // one is the mapping of identifiers to macro definitions (env)
        // and the other is the pattern environment (patternEnv) that maps
        // patterns in a macro case to syntax.
        var result$1677 = [];
        var patternEnv$1678 = {};
        var match$1679;
        var pattern$1680;
        var rest$1681 = stx$1674;
        var success$1682 = true;
        patternLoop:
            for (var i$1683 = 0; i$1683 < patterns$1673.length; i$1683++) {
                if (success$1682 === false) {
                    break;
                }
                pattern$1680 = patterns$1673[i$1683];
                do {
                    // handles cases where patterns trail a repeated pattern like `$x ... ;`
                    if (pattern$1680.repeat && i$1683 + 1 < patterns$1673.length) {
                        var restMatch$1684 = matchPatterns$1630(patterns$1673.slice(i$1683 + 1), rest$1681, env$1675, topLevel$1676);
                        if (restMatch$1684.success) {
                            // match the repeat pattern on the empty array to fill in its
                            // pattern variable in the environment 
                            match$1679 = matchPattern$1631(pattern$1680, [], env$1675, patternEnv$1678);
                            patternEnv$1678 = _$1610.extend(restMatch$1684.patternEnv, match$1679.patternEnv);
                            rest$1681 = restMatch$1684.rest;
                            break patternLoop;
                        }
                    }
                    match$1679 = matchPattern$1631(pattern$1680, rest$1681, env$1675, patternEnv$1678);
                    if (!match$1679.success && pattern$1680.repeat) {
                        // a repeat can match zero tokens and still be a
                        // "success" so break out of the inner loop and
                        // try the next pattern
                        break;
                    }
                    if (!match$1679.success) {
                        success$1682 = false;
                        break;
                    }
                    rest$1681 = match$1679.rest;
                    patternEnv$1678 = match$1679.patternEnv;
                    if (success$1682 && !(topLevel$1676 || pattern$1680.repeat)) {
                        // the very last pattern matched, inside a
                        // delimiter, not a repeat, *and* there are more
                        // unmatched bits of syntax
                        if (i$1683 == patterns$1673.length - 1 && rest$1681.length !== 0) {
                            success$1682 = false;
                            break;
                        }
                    }
                    if (pattern$1680.repeat && success$1682) {
                        // if (i < patterns.length - 1 && rest.length > 0) {
                        //     var restMatch = matchPatterns(patterns.slice(i+1), rest, env, topLevel);
                        //     if (restMatch.success) {
                        //         patternEnv = _.extend(patternEnv, restMatch.patternEnv);
                        //         rest = restMatch.rest;
                        //         break patternLoop;
                        //     }
                        // }
                        if (rest$1681[0] && rest$1681[0].token.value === pattern$1680.separator) {
                            // more tokens and the next token matches the separator
                            rest$1681 = rest$1681.slice(1);
                        } else if (pattern$1680.separator === ' ') {
                            // no separator specified (using the empty string for this)
                            // so keep going
                            continue;
                        } else if (pattern$1680.separator !== ' ' && rest$1681.length > 0 && i$1683 === patterns$1673.length - 1 && topLevel$1676 === false) {
                            // separator is specified, there is a next token, the
                            // next token doesn't match the separator, there are
                            // no more patterns, and this is a top level pattern
                            // so the match has failed
                            success$1682 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1680.repeat && success$1682 && rest$1681.length > 0);
            }
        return {
            success: success$1682,
            rest: rest$1681,
            patternEnv: patternEnv$1678
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
    function matchPattern$1631(pattern$1685, stx$1686, env$1687, patternEnv$1688) {
        var subMatch$1689;
        var match$1690, matchEnv$1691;
        var rest$1692;
        var success$1693;
        if (typeof pattern$1685.inner !== 'undefined') {
            if (pattern$1685.class === 'pattern_group') {
                // pattern groups don't match the delimiters
                subMatch$1689 = matchPatterns$1630(pattern$1685.inner, stx$1686, env$1687, true);
                rest$1692 = subMatch$1689.rest;
            } else if (stx$1686[0] && stx$1686[0].token.type === parser$1612.Token.Delimiter && stx$1686[0].token.value === pattern$1685.value) {
                stx$1686[0].expose();
                if (pattern$1685.inner.length === 0 && stx$1686[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1686,
                        patternEnv: patternEnv$1688
                    };
                }
                subMatch$1689 = matchPatterns$1630(pattern$1685.inner, stx$1686[0].token.inner, env$1687, false);
                rest$1692 = stx$1686.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1686,
                    patternEnv: patternEnv$1688
                };
            }
            success$1693 = subMatch$1689.success;
            // merge the subpattern matches with the current pattern environment
            _$1610.keys(subMatch$1689.patternEnv).forEach(function (patternKey$1694) {
                if (pattern$1685.repeat) {
                    // if this is a repeat pattern we need to bump the level
                    var nextLevel$1695 = subMatch$1689.patternEnv[patternKey$1694].level + 1;
                    if (patternEnv$1688[patternKey$1694]) {
                        patternEnv$1688[patternKey$1694].level = nextLevel$1695;
                        patternEnv$1688[patternKey$1694].match.push(subMatch$1689.patternEnv[patternKey$1694]);
                    } else {
                        // initialize if we haven't done so already
                        patternEnv$1688[patternKey$1694] = {
                            level: nextLevel$1695,
                            match: [subMatch$1689.patternEnv[patternKey$1694]]
                        };
                    }
                } else {
                    // otherwise accept the environment as-is
                    patternEnv$1688[patternKey$1694] = subMatch$1689.patternEnv[patternKey$1694];
                }
            });
        } else {
            if (pattern$1685.class === 'pattern_literal') {
                // wildcard
                if (stx$1686[0] && pattern$1685.value === '_') {
                    success$1693 = true;
                    rest$1692 = stx$1686.slice(1);
                }    // match the literal but don't update the pattern environment
                else if (stx$1686[0] && pattern$1685.value === stx$1686[0].token.value) {
                    success$1693 = true;
                    rest$1692 = stx$1686.slice(1);
                } else {
                    success$1693 = false;
                    rest$1692 = stx$1686;
                }
            } else {
                match$1690 = matchPatternClass$1629(pattern$1685.class, stx$1686, env$1687);
                success$1693 = match$1690.result !== null;
                rest$1692 = match$1690.rest;
                matchEnv$1691 = {
                    level: 0,
                    match: match$1690.result
                };
                // push the match onto this value's slot in the environment
                if (pattern$1685.repeat) {
                    if (patternEnv$1688[pattern$1685.value]) {
                        patternEnv$1688[pattern$1685.value].match.push(matchEnv$1691);
                    } else {
                        // initialize if necessary
                        patternEnv$1688[pattern$1685.value] = {
                            level: 1,
                            match: [matchEnv$1691]
                        };
                    }
                } else {
                    patternEnv$1688[pattern$1685.value] = matchEnv$1691;
                }
            }
        }
        return {
            success: success$1693,
            rest: rest$1692,
            patternEnv: patternEnv$1688
        };
    }
    // given the given the macroBody (list of Pattern syntax objects) and the
    // environment (a mapping of patterns to syntax) return the body with the
    // appropriate patterns replaces with their value in the environment
    function transcribe$1632(macroBody$1696, macroNameStx$1697, env$1698) {
        return _$1610.chain(macroBody$1696).reduce(function (acc$1699, bodyStx$1700, idx$1701, original$1702) {
            // first find the ellipses and mark the syntax objects
            // (note that this step does not eagerly go into delimiter bodies)
            var last$1703 = original$1702[idx$1701 - 1];
            var next$1704 = original$1702[idx$1701 + 1];
            var nextNext$1705 = original$1702[idx$1701 + 2];
            // drop `...`
            if (bodyStx$1700.token.value === '...') {
                return acc$1699;
            }
            // drop `(<separator)` when followed by an ellipse
            if (delimIsSeparator$1623(bodyStx$1700) && next$1704 && next$1704.token.value === '...') {
                return acc$1699;
            }
            // skip the $ in $(...)
            if (bodyStx$1700.token.value === '$' && next$1704 && next$1704.token.type === parser$1612.Token.Delimiter && next$1704.token.value === '()') {
                return acc$1699;
            }
            // mark $[...] as a literal
            if (bodyStx$1700.token.value === '$' && next$1704 && next$1704.token.type === parser$1612.Token.Delimiter && next$1704.token.value === '[]') {
                next$1704.literal = true;
                return acc$1699;
            }
            if (bodyStx$1700.token.type === parser$1612.Token.Delimiter && bodyStx$1700.token.value === '()' && last$1703 && last$1703.token.value === '$') {
                bodyStx$1700.group = true;
            }
            // literal [] delimiters have their bodies just
            // directly passed along
            if (bodyStx$1700.literal === true) {
                parser$1612.assert(bodyStx$1700.token.type === parser$1612.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1699.concat(bodyStx$1700.token.inner);
            }
            if (next$1704 && next$1704.token.value === '...') {
                bodyStx$1700.repeat = true;
                bodyStx$1700.separator = ' ';
            }    // default to space separated
            else if (delimIsSeparator$1623(next$1704) && nextNext$1705 && nextNext$1705.token.value === '...') {
                bodyStx$1700.repeat = true;
                bodyStx$1700.separator = next$1704.token.inner[0].token.value;
            }
            return acc$1699.concat(bodyStx$1700);
        }, []).reduce(function (acc$1706, bodyStx$1707, idx$1708) {
            // then do the actual transcription
            if (bodyStx$1707.repeat) {
                if (bodyStx$1707.token.type === parser$1612.Token.Delimiter) {
                    bodyStx$1707.expose();
                    var fv$1709 = _$1610.filter(freeVarsInPattern$1620(bodyStx$1707.token.inner), function (pat$1716) {
                            // ignore "patterns"
                            // that aren't in the
                            // environment (treat
                            // them like literals)
                            return env$1698.hasOwnProperty(pat$1716);
                        });
                    var restrictedEnv$1710 = [];
                    var nonScalar$1711 = _$1610.find(fv$1709, function (pat$1717) {
                            return env$1698[pat$1717].level > 0;
                        });
                    parser$1612.assert(typeof nonScalar$1711 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1712 = env$1698[nonScalar$1711].match.length;
                    var sameLength$1713 = _$1610.all(fv$1709, function (pat$1718) {
                            return env$1698[pat$1718].level === 0 || env$1698[pat$1718].match.length === repeatLength$1712;
                        });
                    parser$1612.assert(sameLength$1713, 'all non-scalars must have the same length');
                    // create a list of envs restricted to the free vars
                    restrictedEnv$1710 = _$1610.map(_$1610.range(repeatLength$1712), function (idx$1719) {
                        var renv$1720 = {};
                        _$1610.each(fv$1709, function (pat$1721) {
                            if (env$1698[pat$1721].level === 0) {
                                // copy scalars over
                                renv$1720[pat$1721] = env$1698[pat$1721];
                            } else {
                                // grab the match at this index
                                renv$1720[pat$1721] = env$1698[pat$1721].match[idx$1719];
                            }
                        });
                        return renv$1720;
                    });
                    var transcribed$1714 = _$1610.map(restrictedEnv$1710, function (renv$1722) {
                            if (bodyStx$1707.group) {
                                return transcribe$1632(bodyStx$1707.token.inner, macroNameStx$1697, renv$1722);
                            } else {
                                var newBody$1723 = syntaxFromToken$1616(_$1610.clone(bodyStx$1707.token), bodyStx$1707);
                                newBody$1723.token.inner = transcribe$1632(bodyStx$1707.token.inner, macroNameStx$1697, renv$1722);
                                return newBody$1723;
                            }
                        });
                    var joined$1715;
                    if (bodyStx$1707.group) {
                        joined$1715 = joinSyntaxArr$1619(transcribed$1714, bodyStx$1707.separator);
                    } else {
                        joined$1715 = joinSyntax$1618(transcribed$1714, bodyStx$1707.separator);
                    }
                    return acc$1706.concat(joined$1715);
                }
                if (!env$1698[bodyStx$1707.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1707.token.value + ' is not bound for the template');
                } else if (env$1698[bodyStx$1707.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1707.token.value + ' does not match in the template');
                }
                return acc$1706.concat(joinRepeatedMatch$1625(env$1698[bodyStx$1707.token.value].match, bodyStx$1707.separator));
            } else {
                if (bodyStx$1707.token.type === parser$1612.Token.Delimiter) {
                    bodyStx$1707.expose();
                    var newBody$1724 = syntaxFromToken$1616(_$1610.clone(bodyStx$1707.token), macroBody$1696);
                    newBody$1724.token.inner = transcribe$1632(bodyStx$1707.token.inner, macroNameStx$1697, env$1698);
                    return acc$1706.concat([newBody$1724]);
                }
                if (isPatternVar$1624(bodyStx$1707) && Object.prototype.hasOwnProperty.bind(env$1698)(bodyStx$1707.token.value)) {
                    if (!env$1698[bodyStx$1707.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1707.token.value + ' is not bound for the template');
                    } else if (env$1698[bodyStx$1707.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1707.token.value + ' does not match in the template');
                    }
                    return acc$1706.concat(env$1698[bodyStx$1707.token.value].match);
                }
                return acc$1706.concat([bodyStx$1707]);
            }
        }, []).value();
    }
    exports$1609.loadPattern = loadPattern$1628;
    exports$1609.matchPatterns = matchPatterns$1630;
    exports$1609.transcribe = transcribe$1632;
    exports$1609.matchPatternClass = matchPatternClass$1629;
    exports$1609.takeLineContext = takeLineContext$1626;
    exports$1609.takeLine = takeLine$1627;
}));
//# sourceMappingURL=patterns.js.map