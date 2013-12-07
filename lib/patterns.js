(function (root$1599, factory$1600) {
    if (typeof exports === 'object') {
        factory$1600(exports, require('underscore'), require('es6-collections'), require('./parser'), require('./expander'), require('./syntax'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser',
            'expander',
            'syntax'
        ], factory$1600);
    }
}(this, function (exports$1601, _$1602, es6$1603, parser$1604, expander$1605, syntax$1606) {
    var get_expression$1607 = expander$1605.get_expression;
    var syntaxFromToken$1608 = syntax$1606.syntaxFromToken;
    var makePunc$1609 = syntax$1606.makePunc;
    var joinSyntax$1610 = syntax$1606.joinSyntax;
    var joinSyntaxArr$1611 = syntax$1606.joinSyntaxArr;
    function freeVarsInPattern$1612(pattern$1625) {
        var fv$1626 = [];
        _$1602.each(pattern$1625, function (pat$1627) {
            if (isPatternVar$1616(pat$1627)) {
                fv$1626.push(pat$1627.token.value);
            } else if (pat$1627.token.type === parser$1604.Token.Delimiter) {
                fv$1626 = fv$1626.concat(freeVarsInPattern$1612(pat$1627.token.inner));
            }
        });
        return fv$1626;
    }
    function typeIsLiteral$1613(type$1628) {
        return type$1628 === parser$1604.Token.NullLiteral || type$1628 === parser$1604.Token.NumericLiteral || type$1628 === parser$1604.Token.StringLiteral || type$1628 === parser$1604.Token.RegexLiteral || type$1628 === parser$1604.Token.BooleanLiteral;
    }
    function containsPatternVar$1614(patterns$1629) {
        return _$1602.any(patterns$1629, function (pat$1630) {
            if (pat$1630.token.type === parser$1604.Token.Delimiter) {
                return containsPatternVar$1614(pat$1630.token.inner);
            }
            return isPatternVar$1616(pat$1630);
        });
    }
    function delimIsSeparator$1615(delim$1631) {
        return delim$1631 && delim$1631.token && delim$1631.token.type === parser$1604.Token.Delimiter && delim$1631.token.value === '()' && delim$1631.token.inner.length === 1 && delim$1631.token.inner[0].token.type !== parser$1604.Token.Delimiter && !containsPatternVar$1614(delim$1631.token.inner);
    }
    function isPatternVar$1616(stx$1632) {
        return stx$1632.token.value[0] === '$' && stx$1632.token.value !== '$';
    }
    function joinRepeatedMatch$1617(tojoin$1633, punc$1634) {
        return _$1602.reduce(_$1602.rest(tojoin$1633, 1), function (acc$1635, join$1636) {
            if (punc$1634 === ' ') {
                return acc$1635.concat(join$1636.match);
            }
            return acc$1635.concat(makePunc$1609(punc$1634, _$1602.first(join$1636.match)), join$1636.match);
        }, _$1602.first(tojoin$1633).match);
    }
    function takeLineContext$1618(from$1637, to$1638) {
        return _$1602.map(to$1638, function (stx$1639) {
            return takeLine$1619(from$1637, stx$1639);
        });
    }
    function takeLine$1619(from$1640, to$1641) {
        if (to$1641.token.type === parser$1604.Token.Delimiter) {
            var next$1642;
            if (from$1640.token.type === parser$1604.Token.Delimiter) {
                next$1642 = syntaxFromToken$1608({
                    type: parser$1604.Token.Delimiter,
                    value: to$1641.token.value,
                    inner: takeLineContext$1618(from$1640, to$1641.token.inner),
                    startRange: from$1640.token.startRange,
                    endRange: from$1640.token.endRange,
                    startLineNumber: from$1640.token.startLineNumber,
                    startLineStart: from$1640.token.startLineStart,
                    endLineNumber: from$1640.token.endLineNumber,
                    endLineStart: from$1640.token.endLineStart
                }, to$1641);
            } else {
                next$1642 = syntaxFromToken$1608({
                    type: parser$1604.Token.Delimiter,
                    value: to$1641.token.value,
                    inner: takeLineContext$1618(from$1640, to$1641.token.inner),
                    startRange: from$1640.token.range,
                    endRange: from$1640.token.range,
                    startLineNumber: from$1640.token.lineNumber,
                    startLineStart: from$1640.token.lineStart,
                    endLineNumber: from$1640.token.lineNumber,
                    endLineStart: from$1640.token.lineStart
                }, to$1641);
            }
        } else {
            if (from$1640.token.type === parser$1604.Token.Delimiter) {
                next$1642 = syntaxFromToken$1608({
                    value: to$1641.token.value,
                    type: to$1641.token.type,
                    lineNumber: from$1640.token.startLineNumber,
                    lineStart: from$1640.token.startLineStart,
                    range: from$1640.token.startRange
                }, to$1641);
            } else {
                next$1642 = syntaxFromToken$1608({
                    value: to$1641.token.value,
                    type: to$1641.token.type,
                    lineNumber: from$1640.token.lineNumber,
                    lineStart: from$1640.token.lineStart,
                    range: from$1640.token.range
                }, to$1641);
            }
        }
        if (to$1641.token.leadingComments) {
            next$1642.token.leadingComments = to$1641.token.leadingComments;
        }
        if (to$1641.token.trailingComments) {
            next$1642.token.trailingComments = to$1641.token.trailingComments;
        }
        return next$1642;
    }
    function loadPattern$1620(patterns$1643) {
        return _$1602.chain(patterns$1643).reduce(function (acc$1644, patStx$1645, idx$1646) {
            var last$1647 = patterns$1643[idx$1646 - 1];
            var lastLast$1648 = patterns$1643[idx$1646 - 2];
            var next$1649 = patterns$1643[idx$1646 + 1];
            var nextNext$1650 = patterns$1643[idx$1646 + 2];
            if (patStx$1645.token.value === ':') {
                if (last$1647 && isPatternVar$1616(last$1647) && !isPatternVar$1616(next$1649)) {
                    return acc$1644;
                }
            }
            if (last$1647 && last$1647.token.value === ':') {
                if (lastLast$1648 && isPatternVar$1616(lastLast$1648) && !isPatternVar$1616(patStx$1645)) {
                    return acc$1644;
                }
            }
            if (patStx$1645.token.value === '$' && next$1649 && next$1649.token.type === parser$1604.Token.Delimiter) {
                return acc$1644;
            }
            if (isPatternVar$1616(patStx$1645)) {
                if (next$1649 && next$1649.token.value === ':' && !isPatternVar$1616(nextNext$1650)) {
                    if (typeof nextNext$1650 === 'undefined') {
                        throw new Error('expecting a pattern class following a `:`');
                    }
                    patStx$1645.class = nextNext$1650.token.value;
                } else {
                    patStx$1645.class = 'token';
                }
            } else if (patStx$1645.token.type === parser$1604.Token.Delimiter) {
                if (last$1647 && last$1647.token.value === '$') {
                    patStx$1645.class = 'pattern_group';
                }
                patStx$1645.token.inner = loadPattern$1620(patStx$1645.token.inner);
            } else {
                patStx$1645.class = 'pattern_literal';
            }
            return acc$1644.concat(patStx$1645);
        }, []).reduce(function (acc$1651, patStx$1652, idx$1653, patterns$1654) {
            var separator$1655 = ' ';
            var repeat$1656 = false;
            var next$1657 = patterns$1654[idx$1653 + 1];
            var nextNext$1658 = patterns$1654[idx$1653 + 2];
            if (next$1657 && next$1657.token.value === '...') {
                repeat$1656 = true;
                separator$1655 = ' ';
            } else if (delimIsSeparator$1615(next$1657) && nextNext$1658 && nextNext$1658.token.value === '...') {
                repeat$1656 = true;
                parser$1604.assert(next$1657.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$1655 = next$1657.token.inner[0].token.value;
            }
            if (patStx$1652.token.value === '...' || delimIsSeparator$1615(patStx$1652) && next$1657 && next$1657.token.value === '...') {
                return acc$1651;
            }
            patStx$1652.repeat = repeat$1656;
            patStx$1652.separator = separator$1655;
            return acc$1651.concat(patStx$1652);
        }, []).value();
    }
    function matchPatternClass$1621(patternClass$1659, stx$1660, env$1661) {
        var result$1662, rest$1663;
        if (patternClass$1659 === 'token' && stx$1660[0] && stx$1660[0].token.type !== parser$1604.Token.EOF) {
            result$1662 = [stx$1660[0]];
            rest$1663 = stx$1660.slice(1);
        } else if (patternClass$1659 === 'lit' && stx$1660[0] && typeIsLiteral$1613(stx$1660[0].token.type)) {
            result$1662 = [stx$1660[0]];
            rest$1663 = stx$1660.slice(1);
        } else if (patternClass$1659 === 'ident' && stx$1660[0] && stx$1660[0].token.type === parser$1604.Token.Identifier) {
            result$1662 = [stx$1660[0]];
            rest$1663 = stx$1660.slice(1);
        } else if (stx$1660.length > 0 && patternClass$1659 === 'VariableStatement') {
            var match$1664 = expander$1605.enforest(stx$1660, expander$1605.makeExpanderContext({ env: env$1661 }));
            if (match$1664.result && match$1664.result.hasPrototype(expander$1605.VariableStatement)) {
                result$1662 = match$1664.result.destruct(false);
                rest$1663 = match$1664.rest;
            } else {
                result$1662 = null;
                rest$1663 = stx$1660;
            }
        } else if (stx$1660.length > 0 && patternClass$1659 === 'expr') {
            var match$1664 = expander$1605.get_expression(stx$1660, expander$1605.makeExpanderContext({ env: env$1661 }));
            if (match$1664.result === null || !match$1664.result.hasPrototype(expander$1605.Expr)) {
                result$1662 = null;
                rest$1663 = stx$1660;
            } else {
                result$1662 = match$1664.result.destruct(false);
                rest$1663 = match$1664.rest;
            }
        } else {
            result$1662 = null;
            rest$1663 = stx$1660;
        }
        return {
            result: result$1662,
            rest: rest$1663
        };
    }
    function matchPatterns$1622(patterns$1665, stx$1666, env$1667, topLevel$1668) {
        topLevel$1668 = topLevel$1668 || false;
        var result$1669 = [];
        var patternEnv$1670 = {};
        var match$1671;
        var pattern$1672;
        var rest$1673 = stx$1666;
        var success$1674 = true;
        patternLoop:
            for (var i$1675 = 0; i$1675 < patterns$1665.length; i$1675++) {
                if (success$1674 === false) {
                    break;
                }
                pattern$1672 = patterns$1665[i$1675];
                do {
                    if (pattern$1672.repeat && i$1675 + 1 < patterns$1665.length) {
                        var restMatch$1676 = matchPatterns$1622(patterns$1665.slice(i$1675 + 1), rest$1673, env$1667, topLevel$1668);
                        if (restMatch$1676.success) {
                            match$1671 = matchPattern$1623(pattern$1672, [], env$1667, patternEnv$1670);
                            patternEnv$1670 = _$1602.extend(restMatch$1676.patternEnv, match$1671.patternEnv);
                            rest$1673 = restMatch$1676.rest;
                            break patternLoop;
                        }
                    }
                    match$1671 = matchPattern$1623(pattern$1672, rest$1673, env$1667, patternEnv$1670);
                    if (!match$1671.success && pattern$1672.repeat) {
                        break;
                    }
                    if (!match$1671.success) {
                        success$1674 = false;
                        break;
                    }
                    rest$1673 = match$1671.rest;
                    patternEnv$1670 = match$1671.patternEnv;
                    if (success$1674 && !(topLevel$1668 || pattern$1672.repeat)) {
                        if (i$1675 == patterns$1665.length - 1 && rest$1673.length !== 0) {
                            success$1674 = false;
                            break;
                        }
                    }
                    if (pattern$1672.repeat && success$1674) {
                        if (rest$1673[0] && rest$1673[0].token.value === pattern$1672.separator) {
                            rest$1673 = rest$1673.slice(1);
                        } else if (pattern$1672.separator === ' ') {
                            continue;
                        } else if (pattern$1672.separator !== ' ' && rest$1673.length > 0 && i$1675 === patterns$1665.length - 1 && topLevel$1668 === false) {
                            success$1674 = false;
                            break;
                        } else {
                            break;
                        }
                    }
                } while (pattern$1672.repeat && success$1674 && rest$1673.length > 0);
            }
        return {
            success: success$1674,
            rest: rest$1673,
            patternEnv: patternEnv$1670
        };
    }
    function matchPattern$1623(pattern$1677, stx$1678, env$1679, patternEnv$1680) {
        var subMatch$1681;
        var match$1682, matchEnv$1683;
        var rest$1684;
        var success$1685;
        if (typeof pattern$1677.inner !== 'undefined') {
            if (pattern$1677.class === 'pattern_group') {
                subMatch$1681 = matchPatterns$1622(pattern$1677.inner, stx$1678, env$1679, true);
                rest$1684 = subMatch$1681.rest;
            } else if (stx$1678[0] && stx$1678[0].token.type === parser$1604.Token.Delimiter && stx$1678[0].token.value === pattern$1677.value) {
                stx$1678[0].expose();
                if (pattern$1677.inner.length === 0 && stx$1678[0].token.inner.length !== 0) {
                    return {
                        success: false,
                        rest: stx$1678,
                        patternEnv: patternEnv$1680
                    };
                }
                subMatch$1681 = matchPatterns$1622(pattern$1677.inner, stx$1678[0].token.inner, env$1679, false);
                rest$1684 = stx$1678.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$1678,
                    patternEnv: patternEnv$1680
                };
            }
            success$1685 = subMatch$1681.success;
            _$1602.keys(subMatch$1681.patternEnv).forEach(function (patternKey$1686) {
                if (pattern$1677.repeat) {
                    var nextLevel$1687 = subMatch$1681.patternEnv[patternKey$1686].level + 1;
                    if (patternEnv$1680[patternKey$1686]) {
                        patternEnv$1680[patternKey$1686].level = nextLevel$1687;
                        patternEnv$1680[patternKey$1686].match.push(subMatch$1681.patternEnv[patternKey$1686]);
                    } else {
                        patternEnv$1680[patternKey$1686] = {
                            level: nextLevel$1687,
                            match: [subMatch$1681.patternEnv[patternKey$1686]]
                        };
                    }
                } else {
                    patternEnv$1680[patternKey$1686] = subMatch$1681.patternEnv[patternKey$1686];
                }
            });
        } else {
            if (pattern$1677.class === 'pattern_literal') {
                if (stx$1678[0] && pattern$1677.value === '_') {
                    success$1685 = true;
                    rest$1684 = stx$1678.slice(1);
                } else if (stx$1678[0] && pattern$1677.value === stx$1678[0].token.value) {
                    success$1685 = true;
                    rest$1684 = stx$1678.slice(1);
                } else {
                    success$1685 = false;
                    rest$1684 = stx$1678;
                }
            } else {
                match$1682 = matchPatternClass$1621(pattern$1677.class, stx$1678, env$1679);
                success$1685 = match$1682.result !== null;
                rest$1684 = match$1682.rest;
                matchEnv$1683 = {
                    level: 0,
                    match: match$1682.result
                };
                if (pattern$1677.repeat) {
                    if (patternEnv$1680[pattern$1677.value]) {
                        patternEnv$1680[pattern$1677.value].match.push(matchEnv$1683);
                    } else {
                        patternEnv$1680[pattern$1677.value] = {
                            level: 1,
                            match: [matchEnv$1683]
                        };
                    }
                } else {
                    patternEnv$1680[pattern$1677.value] = matchEnv$1683;
                }
            }
        }
        return {
            success: success$1685,
            rest: rest$1684,
            patternEnv: patternEnv$1680
        };
    }
    function transcribe$1624(macroBody$1688, macroNameStx$1689, env$1690) {
        return _$1602.chain(macroBody$1688).reduce(function (acc$1691, bodyStx$1692, idx$1693, original$1694) {
            var last$1695 = original$1694[idx$1693 - 1];
            var next$1696 = original$1694[idx$1693 + 1];
            var nextNext$1697 = original$1694[idx$1693 + 2];
            if (bodyStx$1692.token.value === '...') {
                return acc$1691;
            }
            if (delimIsSeparator$1615(bodyStx$1692) && next$1696 && next$1696.token.value === '...') {
                return acc$1691;
            }
            if (bodyStx$1692.token.value === '$' && next$1696 && next$1696.token.type === parser$1604.Token.Delimiter && next$1696.token.value === '()') {
                return acc$1691;
            }
            if (bodyStx$1692.token.value === '$' && next$1696 && next$1696.token.type === parser$1604.Token.Delimiter && next$1696.token.value === '[]') {
                next$1696.literal = true;
                return acc$1691;
            }
            if (bodyStx$1692.token.type === parser$1604.Token.Delimiter && bodyStx$1692.token.value === '()' && last$1695 && last$1695.token.value === '$') {
                bodyStx$1692.group = true;
            }
            if (bodyStx$1692.literal === true) {
                parser$1604.assert(bodyStx$1692.token.type === parser$1604.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$1691.concat(bodyStx$1692.token.inner);
            }
            if (next$1696 && next$1696.token.value === '...') {
                bodyStx$1692.repeat = true;
                bodyStx$1692.separator = ' ';
            } else if (delimIsSeparator$1615(next$1696) && nextNext$1697 && nextNext$1697.token.value === '...') {
                bodyStx$1692.repeat = true;
                bodyStx$1692.separator = next$1696.token.inner[0].token.value;
            }
            return acc$1691.concat(bodyStx$1692);
        }, []).reduce(function (acc$1698, bodyStx$1699, idx$1700) {
            if (bodyStx$1699.repeat) {
                if (bodyStx$1699.token.type === parser$1604.Token.Delimiter) {
                    bodyStx$1699.expose();
                    var fv$1701 = _$1602.filter(freeVarsInPattern$1612(bodyStx$1699.token.inner), function (pat$1708) {
                            return env$1690.hasOwnProperty(pat$1708);
                        });
                    var restrictedEnv$1702 = [];
                    var nonScalar$1703 = _$1602.find(fv$1701, function (pat$1709) {
                            return env$1690[pat$1709].level > 0;
                        });
                    parser$1604.assert(typeof nonScalar$1703 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$1704 = env$1690[nonScalar$1703].match.length;
                    var sameLength$1705 = _$1602.all(fv$1701, function (pat$1710) {
                            return env$1690[pat$1710].level === 0 || env$1690[pat$1710].match.length === repeatLength$1704;
                        });
                    parser$1604.assert(sameLength$1705, 'all non-scalars must have the same length');
                    restrictedEnv$1702 = _$1602.map(_$1602.range(repeatLength$1704), function (idx$1711) {
                        var renv$1712 = {};
                        _$1602.each(fv$1701, function (pat$1713) {
                            if (env$1690[pat$1713].level === 0) {
                                renv$1712[pat$1713] = env$1690[pat$1713];
                            } else {
                                renv$1712[pat$1713] = env$1690[pat$1713].match[idx$1711];
                            }
                        });
                        return renv$1712;
                    });
                    var transcribed$1706 = _$1602.map(restrictedEnv$1702, function (renv$1714) {
                            if (bodyStx$1699.group) {
                                return transcribe$1624(bodyStx$1699.token.inner, macroNameStx$1689, renv$1714);
                            } else {
                                var newBody$1715 = syntaxFromToken$1608(_$1602.clone(bodyStx$1699.token), bodyStx$1699);
                                newBody$1715.token.inner = transcribe$1624(bodyStx$1699.token.inner, macroNameStx$1689, renv$1714);
                                return newBody$1715;
                            }
                        });
                    var joined$1707;
                    if (bodyStx$1699.group) {
                        joined$1707 = joinSyntaxArr$1611(transcribed$1706, bodyStx$1699.separator);
                    } else {
                        joined$1707 = joinSyntax$1610(transcribed$1706, bodyStx$1699.separator);
                    }
                    return acc$1698.concat(joined$1707);
                }
                if (!env$1690[bodyStx$1699.token.value]) {
                    throw new Error('The pattern variable ' + bodyStx$1699.token.value + ' is not bound for the template');
                } else if (env$1690[bodyStx$1699.token.value].level !== 1) {
                    throw new Error('Ellipses level for ' + bodyStx$1699.token.value + ' does not match in the template');
                }
                return acc$1698.concat(joinRepeatedMatch$1617(env$1690[bodyStx$1699.token.value].match, bodyStx$1699.separator));
            } else {
                if (bodyStx$1699.token.type === parser$1604.Token.Delimiter) {
                    bodyStx$1699.expose();
                    var newBody$1716 = syntaxFromToken$1608(_$1602.clone(bodyStx$1699.token), macroBody$1688);
                    newBody$1716.token.inner = transcribe$1624(bodyStx$1699.token.inner, macroNameStx$1689, env$1690);
                    return acc$1698.concat([newBody$1716]);
                }
                if (isPatternVar$1616(bodyStx$1699) && Object.prototype.hasOwnProperty.bind(env$1690)(bodyStx$1699.token.value)) {
                    if (!env$1690[bodyStx$1699.token.value]) {
                        throw new Error('The pattern variable ' + bodyStx$1699.token.value + ' is not bound for the template');
                    } else if (env$1690[bodyStx$1699.token.value].level !== 0) {
                        throw new Error('Ellipses level for ' + bodyStx$1699.token.value + ' does not match in the template');
                    }
                    return acc$1698.concat(env$1690[bodyStx$1699.token.value].match);
                }
                return acc$1698.concat([bodyStx$1699]);
            }
        }, []).value();
    }
    exports$1601.loadPattern = loadPattern$1620;
    exports$1601.matchPatterns = matchPatterns$1622;
    exports$1601.transcribe = transcribe$1624;
    exports$1601.matchPatternClass = matchPatternClass$1621;
    exports$1601.takeLineContext = takeLineContext$1618;
    exports$1601.takeLine = takeLine$1619;
}));