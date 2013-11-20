(function (root$1750, factory$1751) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1751(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1751);
    }
}(this, function (exports$1752, _$1753, es6$1754, parser$1755) {
    // (CSyntax, Str) -> CContext
    function Rename$1756(id$1780, name$1781, ctx$1782, defctx$1783) {
        defctx$1783 = defctx$1783 || null;
        return {
            id: id$1780,
            name: name$1781,
            context: ctx$1782,
            def: defctx$1783
        };
    }
    // (Num) -> CContext
    function Mark$1757(mark$1784, ctx$1785) {
        return {
            mark: mark$1784,
            context: ctx$1785
        };
    }
    function Def$1758(defctx$1786, ctx$1787) {
        return {
            defctx: defctx$1786,
            context: ctx$1787
        };
    }
    function Var$1759(id$1788) {
        return { id: id$1788 };
    }
    function isRename$1760(r$1789) {
        return r$1789 && typeof r$1789.id !== 'undefined' && typeof r$1789.name !== 'undefined';
    }
    ;
    function isMark$1761(m$1790) {
        return m$1790 && typeof m$1790.mark !== 'undefined';
    }
    ;
    function isDef$1762(ctx$1791) {
        return ctx$1791 && typeof ctx$1791.defctx !== 'undefined';
    }
    function Syntax$1763(token$1792, oldstx$1793) {
        this.token = token$1792;
        this.context = oldstx$1793 && oldstx$1793.context ? oldstx$1793.context : null;
        this.deferredContext = oldstx$1793 && oldstx$1793.deferredContext ? oldstx$1793.deferredContext : null;
    }
    Syntax$1763.prototype = {
        mark: function (newMark$1794) {
            if (this.token.inner) {
                var next$1795 = syntaxFromToken$1764(this.token, this);
                next$1795.deferredContext = Mark$1757(newMark$1794, this.deferredContext);
                return next$1795;
            }
            return syntaxFromToken$1764(this.token, { context: Mark$1757(newMark$1794, this.context) });
        },
        rename: function (id$1796, name$1797, defctx$1798) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1799 = syntaxFromToken$1764(this.token, this);
                next$1799.deferredContext = Rename$1756(id$1796, name$1797, this.deferredContext, defctx$1798);
                return next$1799;
            }
            if (this.token.type === parser$1755.Token.Identifier || this.token.type === parser$1755.Token.Keyword) {
                return syntaxFromToken$1764(this.token, { context: Rename$1756(id$1796, name$1797, this.context, defctx$1798) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1800) {
            if (this.token.inner) {
                var next$1801 = syntaxFromToken$1764(this.token, this);
                next$1801.deferredContext = Def$1758(defctx$1800, this.deferredContext);
                return next$1801;
            }
            return syntaxFromToken$1764(this.token, { context: Def$1758(defctx$1800, this.context) });
        },
        getDefCtx: function () {
            var ctx$1802 = this.context;
            while (ctx$1802 !== null) {
                if (isDef$1762(ctx$1802)) {
                    return ctx$1802.defctx;
                }
                ctx$1802 = ctx$1802.context;
            }
            return null;
        },
        expose: function () {
            parser$1755.assert(this.token.type === parser$1755.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1803(stxCtx$1804, ctx$1805) {
                if (ctx$1805 == null) {
                    return stxCtx$1804;
                } else if (isRename$1760(ctx$1805)) {
                    return Rename$1756(ctx$1805.id, ctx$1805.name, applyContext$1803(stxCtx$1804, ctx$1805.context), ctx$1805.def);
                } else if (isMark$1761(ctx$1805)) {
                    return Mark$1757(ctx$1805.mark, applyContext$1803(stxCtx$1804, ctx$1805.context));
                } else if (isDef$1762(ctx$1805)) {
                    return Def$1758(ctx$1805.defctx, applyContext$1803(stxCtx$1804, ctx$1805.context));
                } else {
                    parser$1755.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1753.map(this.token.inner, _$1753.bind(function (stx$1806) {
                if (stx$1806.token.inner) {
                    var next$1807 = syntaxFromToken$1764(stx$1806.token, stx$1806);
                    next$1807.deferredContext = applyContext$1803(stx$1806.deferredContext, this.deferredContext);
                    return next$1807;
                } else {
                    return syntaxFromToken$1764(stx$1806.token, { context: applyContext$1803(stx$1806.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1808 = this.token.type === parser$1755.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1808 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1764(token$1809, oldstx$1810) {
        return new Syntax$1763(token$1809, oldstx$1810);
    }
    function mkSyntax$1765(stx$1811, value$1812, type$1813, inner$1814) {
        if (stx$1811 && Array.isArray(stx$1811) && stx$1811.length === 1) {
            stx$1811 = stx$1811[0];
        } else if (stx$1811 && Array.isArray(stx$1811)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1811);
        }
        if (type$1813 === parser$1755.Token.Delimiter) {
            var startLineNumber$1815, startLineStart$1816, endLineNumber$1817, endLineStart$1818, startRange$1819, endRange$1820;
            if (!Array.isArray(inner$1814)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1811 && stx$1811.token.type === parser$1755.Token.Delimiter) {
                startLineNumber$1815 = stx$1811.token.startLineNumber;
                startLineStart$1816 = stx$1811.token.startLineStart;
                endLineNumber$1817 = stx$1811.token.endLineNumber;
                endLineStart$1818 = stx$1811.token.endLineStart;
                startRange$1819 = stx$1811.token.startRange;
                endRange$1820 = stx$1811.token.endRange;
            } else if (stx$1811 && stx$1811.token) {
                startLineNumber$1815 = stx$1811.token.lineNumber;
                startLineStart$1816 = stx$1811.token.lineStart;
                endLineNumber$1817 = stx$1811.token.lineNumber;
                endLineStart$1818 = stx$1811.token.lineStart;
                startRange$1819 = stx$1811.token.range;
                endRange$1820 = stx$1811.token.range;
            }
            return syntaxFromToken$1764({
                type: parser$1755.Token.Delimiter,
                value: value$1812,
                inner: inner$1814,
                startLineStart: startLineStart$1816,
                startLineNumber: startLineNumber$1815,
                endLineStart: endLineStart$1818,
                endLineNumber: endLineNumber$1817,
                startRange: startRange$1819,
                endRange: endRange$1820
            }, stx$1811);
        } else {
            var lineStart$1821, lineNumber$1822, range$1823;
            if (stx$1811 && stx$1811.token.type === parser$1755.Token.Delimiter) {
                lineStart$1821 = stx$1811.token.startLineStart;
                lineNumber$1822 = stx$1811.token.startLineNumber;
                range$1823 = stx$1811.token.startRange;
            } else if (stx$1811 && stx$1811.token) {
                lineStart$1821 = stx$1811.token.lineStart;
                lineNumber$1822 = stx$1811.token.lineNumber;
                range$1823 = stx$1811.token.range;
            }
            return syntaxFromToken$1764({
                type: type$1813,
                value: value$1812,
                lineStart: lineStart$1821,
                lineNumber: lineNumber$1822,
                range: range$1823
            }, stx$1811);
        }
    }
    function makeValue$1766(val$1824, stx$1825) {
        if (typeof val$1824 === 'boolean') {
            return mkSyntax$1765(stx$1825, val$1824 ? 'true' : 'false', parser$1755.Token.BooleanLiteral);
        } else if (typeof val$1824 === 'number') {
            if (val$1824 !== val$1824) {
                return makeDelim$1771('()', [
                    makeValue$1766(0, stx$1825),
                    makePunc$1770('/', stx$1825),
                    makeValue$1766(0, stx$1825)
                ], stx$1825);
            }
            if (val$1824 < 0) {
                return makeDelim$1771('()', [
                    makePunc$1770('-', stx$1825),
                    makeValue$1766(Math.abs(val$1824), stx$1825)
                ], stx$1825);
            } else {
                return mkSyntax$1765(stx$1825, val$1824, parser$1755.Token.NumericLiteral);
            }
        } else if (typeof val$1824 === 'string') {
            return mkSyntax$1765(stx$1825, val$1824, parser$1755.Token.StringLiteral);
        } else if (val$1824 === null) {
            return mkSyntax$1765(stx$1825, 'null', parser$1755.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1824);
        }
    }
    function makeRegex$1767(val$1826, flags$1827, stx$1828) {
        var newstx$1829 = mkSyntax$1765(stx$1828, new RegExp(val$1826, flags$1827), parser$1755.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1829.token.literal = val$1826;
        return newstx$1829;
    }
    function makeIdent$1768(val$1830, stx$1831) {
        return mkSyntax$1765(stx$1831, val$1830, parser$1755.Token.Identifier);
    }
    function makeKeyword$1769(val$1832, stx$1833) {
        return mkSyntax$1765(stx$1833, val$1832, parser$1755.Token.Keyword);
    }
    function makePunc$1770(val$1834, stx$1835) {
        return mkSyntax$1765(stx$1835, val$1834, parser$1755.Token.Punctuator);
    }
    function makeDelim$1771(val$1836, inner$1837, stx$1838) {
        return mkSyntax$1765(stx$1838, val$1836, parser$1755.Token.Delimiter, inner$1837);
    }
    function unwrapSyntax$1772(stx$1839) {
        if (Array.isArray(stx$1839) && stx$1839.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1839 = stx$1839[0];
        }
        if (stx$1839.token) {
            if (stx$1839.token.type === parser$1755.Token.Delimiter) {
                return stx$1839.token;
            } else {
                return stx$1839.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1839);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1773(stx$1840) {
        return _$1753.map(stx$1840, function (stx$1841) {
            if (stx$1841.token.inner) {
                stx$1841.token.inner = syntaxToTokens$1773(stx$1841.token.inner);
            }
            return stx$1841.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1774(tokens$1842) {
        if (!_$1753.isArray(tokens$1842)) {
            tokens$1842 = [tokens$1842];
        }
        return _$1753.map(tokens$1842, function (token$1843) {
            if (token$1843.inner) {
                token$1843.inner = tokensToSyntax$1774(token$1843.inner);
            }
            return syntaxFromToken$1764(token$1843);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1775(tojoin$1844, punc$1845) {
        if (tojoin$1844.length === 0) {
            return [];
        }
        if (punc$1845 === ' ') {
            return tojoin$1844;
        }
        return _$1753.reduce(_$1753.rest(tojoin$1844, 1), function (acc$1846, join$1847) {
            return acc$1846.concat(makePunc$1770(punc$1845, join$1847), join$1847);
        }, [_$1753.first(tojoin$1844)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1776(tojoin$1848, punc$1849) {
        if (tojoin$1848.length === 0) {
            return [];
        }
        if (punc$1849 === ' ') {
            return _$1753.flatten(tojoin$1848, true);
        }
        return _$1753.reduce(_$1753.rest(tojoin$1848, 1), function (acc$1850, join$1851) {
            return acc$1850.concat(makePunc$1770(punc$1849, _$1753.first(join$1851)), join$1851);
        }, _$1753.first(tojoin$1848));
    }
    function MacroSyntaxError$1777(name$1852, message$1853, stx$1854) {
        this.name = name$1852;
        this.message = message$1853;
        this.stx = stx$1854;
    }
    function throwSyntaxError$1778(name$1855, message$1856, stx$1857) {
        if (stx$1857 && Array.isArray(stx$1857)) {
            stx$1857 = stx$1857[0];
        }
        throw new MacroSyntaxError$1777(name$1855, message$1856, stx$1857);
    }
    function printSyntaxError$1779(code$1858, err$1859) {
        if (!err$1859.stx) {
            return '[' + err$1859.name + '] ' + err$1859.message;
        }
        var token$1860 = err$1859.stx.token;
        var lineNumber$1861 = token$1860.startLineNumber || token$1860.lineNumber;
        var lineStart$1862 = token$1860.startLineStart || token$1860.lineStart;
        var start$1863 = token$1860.range[0];
        var offset$1864 = start$1863 - lineStart$1862;
        var line$1865 = '';
        var pre$1866 = lineNumber$1861 + ': ';
        var ch$1867;
        while (ch$1867 = code$1858.charAt(lineStart$1862++)) {
            if (ch$1867 == '\r' || ch$1867 == '\n') {
                break;
            }
            line$1865 += ch$1867;
        }
        return '[' + err$1859.name + '] ' + err$1859.message + '\n' + pre$1866 + line$1865 + '\n' + Array(offset$1864 + pre$1866.length).join(' ') + ' ^';
    }
    exports$1752.unwrapSyntax = unwrapSyntax$1772;
    exports$1752.makeDelim = makeDelim$1771;
    exports$1752.makePunc = makePunc$1770;
    exports$1752.makeKeyword = makeKeyword$1769;
    exports$1752.makeIdent = makeIdent$1768;
    exports$1752.makeRegex = makeRegex$1767;
    exports$1752.makeValue = makeValue$1766;
    exports$1752.Rename = Rename$1756;
    exports$1752.Mark = Mark$1757;
    exports$1752.Var = Var$1759;
    exports$1752.Def = Def$1758;
    exports$1752.isDef = isDef$1762;
    exports$1752.isMark = isMark$1761;
    exports$1752.isRename = isRename$1760;
    exports$1752.syntaxFromToken = syntaxFromToken$1764;
    exports$1752.tokensToSyntax = tokensToSyntax$1774;
    exports$1752.syntaxToTokens = syntaxToTokens$1773;
    exports$1752.joinSyntax = joinSyntax$1775;
    exports$1752.joinSyntaxArr = joinSyntaxArr$1776;
    exports$1752.MacroSyntaxError = MacroSyntaxError$1777;
    exports$1752.throwSyntaxError = throwSyntaxError$1778;
    exports$1752.printSyntaxError = printSyntaxError$1779;
}));