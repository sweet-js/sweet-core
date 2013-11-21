(function (root$1757, factory$1758) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1758(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1758);
    }
}(this, function (exports$1759, _$1760, es6$1761, parser$1762) {
    // (CSyntax, Str) -> CContext
    function Rename$1763(id$1787, name$1788, ctx$1789, defctx$1790) {
        defctx$1790 = defctx$1790 || null;
        return {
            id: id$1787,
            name: name$1788,
            context: ctx$1789,
            def: defctx$1790
        };
    }
    // (Num) -> CContext
    function Mark$1764(mark$1791, ctx$1792) {
        return {
            mark: mark$1791,
            context: ctx$1792
        };
    }
    function Def$1765(defctx$1793, ctx$1794) {
        return {
            defctx: defctx$1793,
            context: ctx$1794
        };
    }
    function Var$1766(id$1795) {
        return { id: id$1795 };
    }
    function isRename$1767(r$1796) {
        return r$1796 && typeof r$1796.id !== 'undefined' && typeof r$1796.name !== 'undefined';
    }
    ;
    function isMark$1768(m$1797) {
        return m$1797 && typeof m$1797.mark !== 'undefined';
    }
    ;
    function isDef$1769(ctx$1798) {
        return ctx$1798 && typeof ctx$1798.defctx !== 'undefined';
    }
    function Syntax$1770(token$1799, oldstx$1800) {
        this.token = token$1799;
        this.context = oldstx$1800 && oldstx$1800.context ? oldstx$1800.context : null;
        this.deferredContext = oldstx$1800 && oldstx$1800.deferredContext ? oldstx$1800.deferredContext : null;
    }
    Syntax$1770.prototype = {
        mark: function (newMark$1801) {
            if (this.token.inner) {
                var next$1802 = syntaxFromToken$1771(this.token, this);
                next$1802.deferredContext = Mark$1764(newMark$1801, this.deferredContext);
                return next$1802;
            }
            return syntaxFromToken$1771(this.token, { context: Mark$1764(newMark$1801, this.context) });
        },
        rename: function (id$1803, name$1804, defctx$1805) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1806 = syntaxFromToken$1771(this.token, this);
                next$1806.deferredContext = Rename$1763(id$1803, name$1804, this.deferredContext, defctx$1805);
                return next$1806;
            }
            if (this.token.type === parser$1762.Token.Identifier || this.token.type === parser$1762.Token.Keyword) {
                return syntaxFromToken$1771(this.token, { context: Rename$1763(id$1803, name$1804, this.context, defctx$1805) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1807) {
            if (this.token.inner) {
                var next$1808 = syntaxFromToken$1771(this.token, this);
                next$1808.deferredContext = Def$1765(defctx$1807, this.deferredContext);
                return next$1808;
            }
            return syntaxFromToken$1771(this.token, { context: Def$1765(defctx$1807, this.context) });
        },
        getDefCtx: function () {
            var ctx$1809 = this.context;
            while (ctx$1809 !== null) {
                if (isDef$1769(ctx$1809)) {
                    return ctx$1809.defctx;
                }
                ctx$1809 = ctx$1809.context;
            }
            return null;
        },
        expose: function () {
            parser$1762.assert(this.token.type === parser$1762.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1810(stxCtx$1811, ctx$1812) {
                if (ctx$1812 == null) {
                    return stxCtx$1811;
                } else if (isRename$1767(ctx$1812)) {
                    return Rename$1763(ctx$1812.id, ctx$1812.name, applyContext$1810(stxCtx$1811, ctx$1812.context), ctx$1812.def);
                } else if (isMark$1768(ctx$1812)) {
                    return Mark$1764(ctx$1812.mark, applyContext$1810(stxCtx$1811, ctx$1812.context));
                } else if (isDef$1769(ctx$1812)) {
                    return Def$1765(ctx$1812.defctx, applyContext$1810(stxCtx$1811, ctx$1812.context));
                } else {
                    parser$1762.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1760.map(this.token.inner, _$1760.bind(function (stx$1813) {
                if (stx$1813.token.inner) {
                    var next$1814 = syntaxFromToken$1771(stx$1813.token, stx$1813);
                    next$1814.deferredContext = applyContext$1810(stx$1813.deferredContext, this.deferredContext);
                    return next$1814;
                } else {
                    return syntaxFromToken$1771(stx$1813.token, { context: applyContext$1810(stx$1813.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1815 = this.token.type === parser$1762.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1815 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1771(token$1816, oldstx$1817) {
        return new Syntax$1770(token$1816, oldstx$1817);
    }
    function mkSyntax$1772(stx$1818, value$1819, type$1820, inner$1821) {
        if (stx$1818 && Array.isArray(stx$1818) && stx$1818.length === 1) {
            stx$1818 = stx$1818[0];
        } else if (stx$1818 && Array.isArray(stx$1818)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1818);
        }
        if (type$1820 === parser$1762.Token.Delimiter) {
            var startLineNumber$1822, startLineStart$1823, endLineNumber$1824, endLineStart$1825, startRange$1826, endRange$1827;
            if (!Array.isArray(inner$1821)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1818 && stx$1818.token.type === parser$1762.Token.Delimiter) {
                startLineNumber$1822 = stx$1818.token.startLineNumber;
                startLineStart$1823 = stx$1818.token.startLineStart;
                endLineNumber$1824 = stx$1818.token.endLineNumber;
                endLineStart$1825 = stx$1818.token.endLineStart;
                startRange$1826 = stx$1818.token.startRange;
                endRange$1827 = stx$1818.token.endRange;
            } else if (stx$1818 && stx$1818.token) {
                startLineNumber$1822 = stx$1818.token.lineNumber;
                startLineStart$1823 = stx$1818.token.lineStart;
                endLineNumber$1824 = stx$1818.token.lineNumber;
                endLineStart$1825 = stx$1818.token.lineStart;
                startRange$1826 = stx$1818.token.range;
                endRange$1827 = stx$1818.token.range;
            }
            return syntaxFromToken$1771({
                type: parser$1762.Token.Delimiter,
                value: value$1819,
                inner: inner$1821,
                startLineStart: startLineStart$1823,
                startLineNumber: startLineNumber$1822,
                endLineStart: endLineStart$1825,
                endLineNumber: endLineNumber$1824,
                startRange: startRange$1826,
                endRange: endRange$1827
            }, stx$1818);
        } else {
            var lineStart$1828, lineNumber$1829, range$1830;
            if (stx$1818 && stx$1818.token.type === parser$1762.Token.Delimiter) {
                lineStart$1828 = stx$1818.token.startLineStart;
                lineNumber$1829 = stx$1818.token.startLineNumber;
                range$1830 = stx$1818.token.startRange;
            } else if (stx$1818 && stx$1818.token) {
                lineStart$1828 = stx$1818.token.lineStart;
                lineNumber$1829 = stx$1818.token.lineNumber;
                range$1830 = stx$1818.token.range;
            }
            return syntaxFromToken$1771({
                type: type$1820,
                value: value$1819,
                lineStart: lineStart$1828,
                lineNumber: lineNumber$1829,
                range: range$1830
            }, stx$1818);
        }
    }
    function makeValue$1773(val$1831, stx$1832) {
        if (typeof val$1831 === 'boolean') {
            return mkSyntax$1772(stx$1832, val$1831 ? 'true' : 'false', parser$1762.Token.BooleanLiteral);
        } else if (typeof val$1831 === 'number') {
            if (val$1831 !== val$1831) {
                return makeDelim$1778('()', [
                    makeValue$1773(0, stx$1832),
                    makePunc$1777('/', stx$1832),
                    makeValue$1773(0, stx$1832)
                ], stx$1832);
            }
            if (val$1831 < 0) {
                return makeDelim$1778('()', [
                    makePunc$1777('-', stx$1832),
                    makeValue$1773(Math.abs(val$1831), stx$1832)
                ], stx$1832);
            } else {
                return mkSyntax$1772(stx$1832, val$1831, parser$1762.Token.NumericLiteral);
            }
        } else if (typeof val$1831 === 'string') {
            return mkSyntax$1772(stx$1832, val$1831, parser$1762.Token.StringLiteral);
        } else if (val$1831 === null) {
            return mkSyntax$1772(stx$1832, 'null', parser$1762.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1831);
        }
    }
    function makeRegex$1774(val$1833, flags$1834, stx$1835) {
        var newstx$1836 = mkSyntax$1772(stx$1835, new RegExp(val$1833, flags$1834), parser$1762.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1836.token.literal = val$1833;
        return newstx$1836;
    }
    function makeIdent$1775(val$1837, stx$1838) {
        return mkSyntax$1772(stx$1838, val$1837, parser$1762.Token.Identifier);
    }
    function makeKeyword$1776(val$1839, stx$1840) {
        return mkSyntax$1772(stx$1840, val$1839, parser$1762.Token.Keyword);
    }
    function makePunc$1777(val$1841, stx$1842) {
        return mkSyntax$1772(stx$1842, val$1841, parser$1762.Token.Punctuator);
    }
    function makeDelim$1778(val$1843, inner$1844, stx$1845) {
        return mkSyntax$1772(stx$1845, val$1843, parser$1762.Token.Delimiter, inner$1844);
    }
    function unwrapSyntax$1779(stx$1846) {
        if (Array.isArray(stx$1846) && stx$1846.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1846 = stx$1846[0];
        }
        if (stx$1846.token) {
            if (stx$1846.token.type === parser$1762.Token.Delimiter) {
                return stx$1846.token;
            } else {
                return stx$1846.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1846);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1780(stx$1847) {
        return _$1760.map(stx$1847, function (stx$1848) {
            if (stx$1848.token.inner) {
                stx$1848.token.inner = syntaxToTokens$1780(stx$1848.token.inner);
            }
            return stx$1848.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1781(tokens$1849) {
        if (!_$1760.isArray(tokens$1849)) {
            tokens$1849 = [tokens$1849];
        }
        return _$1760.map(tokens$1849, function (token$1850) {
            if (token$1850.inner) {
                token$1850.inner = tokensToSyntax$1781(token$1850.inner);
            }
            return syntaxFromToken$1771(token$1850);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1782(tojoin$1851, punc$1852) {
        if (tojoin$1851.length === 0) {
            return [];
        }
        if (punc$1852 === ' ') {
            return tojoin$1851;
        }
        return _$1760.reduce(_$1760.rest(tojoin$1851, 1), function (acc$1853, join$1854) {
            return acc$1853.concat(makePunc$1777(punc$1852, join$1854), join$1854);
        }, [_$1760.first(tojoin$1851)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1783(tojoin$1855, punc$1856) {
        if (tojoin$1855.length === 0) {
            return [];
        }
        if (punc$1856 === ' ') {
            return _$1760.flatten(tojoin$1855, true);
        }
        return _$1760.reduce(_$1760.rest(tojoin$1855, 1), function (acc$1857, join$1858) {
            return acc$1857.concat(makePunc$1777(punc$1856, _$1760.first(join$1858)), join$1858);
        }, _$1760.first(tojoin$1855));
    }
    function MacroSyntaxError$1784(name$1859, message$1860, stx$1861) {
        this.name = name$1859;
        this.message = message$1860;
        this.stx = stx$1861;
    }
    function throwSyntaxError$1785(name$1862, message$1863, stx$1864) {
        if (stx$1864 && Array.isArray(stx$1864)) {
            stx$1864 = stx$1864[0];
        }
        throw new MacroSyntaxError$1784(name$1862, message$1863, stx$1864);
    }
    function printSyntaxError$1786(code$1865, err$1866) {
        if (!err$1866.stx) {
            return '[' + err$1866.name + '] ' + err$1866.message;
        }
        var token$1867 = err$1866.stx.token;
        var lineNumber$1868 = token$1867.startLineNumber || token$1867.lineNumber;
        var lineStart$1869 = token$1867.startLineStart || token$1867.lineStart;
        var start$1870 = token$1867.range[0];
        var offset$1871 = start$1870 - lineStart$1869;
        var line$1872 = '';
        var pre$1873 = lineNumber$1868 + ': ';
        var ch$1874;
        while (ch$1874 = code$1865.charAt(lineStart$1869++)) {
            if (ch$1874 == '\r' || ch$1874 == '\n') {
                break;
            }
            line$1872 += ch$1874;
        }
        return '[' + err$1866.name + '] ' + err$1866.message + '\n' + pre$1873 + line$1872 + '\n' + Array(offset$1871 + pre$1873.length).join(' ') + ' ^';
    }
    exports$1759.unwrapSyntax = unwrapSyntax$1779;
    exports$1759.makeDelim = makeDelim$1778;
    exports$1759.makePunc = makePunc$1777;
    exports$1759.makeKeyword = makeKeyword$1776;
    exports$1759.makeIdent = makeIdent$1775;
    exports$1759.makeRegex = makeRegex$1774;
    exports$1759.makeValue = makeValue$1773;
    exports$1759.Rename = Rename$1763;
    exports$1759.Mark = Mark$1764;
    exports$1759.Var = Var$1766;
    exports$1759.Def = Def$1765;
    exports$1759.isDef = isDef$1769;
    exports$1759.isMark = isMark$1768;
    exports$1759.isRename = isRename$1767;
    exports$1759.syntaxFromToken = syntaxFromToken$1771;
    exports$1759.tokensToSyntax = tokensToSyntax$1781;
    exports$1759.syntaxToTokens = syntaxToTokens$1780;
    exports$1759.joinSyntax = joinSyntax$1782;
    exports$1759.joinSyntaxArr = joinSyntaxArr$1783;
    exports$1759.MacroSyntaxError = MacroSyntaxError$1784;
    exports$1759.throwSyntaxError = throwSyntaxError$1785;
    exports$1759.printSyntaxError = printSyntaxError$1786;
}));