(function (root$1756, factory$1757) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1757(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1757);
    }
}(this, function (exports$1758, _$1759, es6$1760, parser$1761) {
    // (CSyntax, Str) -> CContext
    function Rename$1762(id$1786, name$1787, ctx$1788, defctx$1789) {
        defctx$1789 = defctx$1789 || null;
        return {
            id: id$1786,
            name: name$1787,
            context: ctx$1788,
            def: defctx$1789
        };
    }
    // (Num) -> CContext
    function Mark$1763(mark$1790, ctx$1791) {
        return {
            mark: mark$1790,
            context: ctx$1791
        };
    }
    function Def$1764(defctx$1792, ctx$1793) {
        return {
            defctx: defctx$1792,
            context: ctx$1793
        };
    }
    function Var$1765(id$1794) {
        return { id: id$1794 };
    }
    function isRename$1766(r$1795) {
        return r$1795 && typeof r$1795.id !== 'undefined' && typeof r$1795.name !== 'undefined';
    }
    ;
    function isMark$1767(m$1796) {
        return m$1796 && typeof m$1796.mark !== 'undefined';
    }
    ;
    function isDef$1768(ctx$1797) {
        return ctx$1797 && typeof ctx$1797.defctx !== 'undefined';
    }
    function Syntax$1769(token$1798, oldstx$1799) {
        this.token = token$1798;
        this.context = oldstx$1799 && oldstx$1799.context ? oldstx$1799.context : null;
        this.deferredContext = oldstx$1799 && oldstx$1799.deferredContext ? oldstx$1799.deferredContext : null;
    }
    Syntax$1769.prototype = {
        mark: function (newMark$1800) {
            if (this.token.inner) {
                var next$1801 = syntaxFromToken$1770(this.token, this);
                next$1801.deferredContext = Mark$1763(newMark$1800, this.deferredContext);
                return next$1801;
            }
            return syntaxFromToken$1770(this.token, { context: Mark$1763(newMark$1800, this.context) });
        },
        rename: function (id$1802, name$1803, defctx$1804) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1805 = syntaxFromToken$1770(this.token, this);
                next$1805.deferredContext = Rename$1762(id$1802, name$1803, this.deferredContext, defctx$1804);
                return next$1805;
            }
            if (this.token.type === parser$1761.Token.Identifier || this.token.type === parser$1761.Token.Keyword) {
                return syntaxFromToken$1770(this.token, { context: Rename$1762(id$1802, name$1803, this.context, defctx$1804) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1806) {
            if (this.token.inner) {
                var next$1807 = syntaxFromToken$1770(this.token, this);
                next$1807.deferredContext = Def$1764(defctx$1806, this.deferredContext);
                return next$1807;
            }
            return syntaxFromToken$1770(this.token, { context: Def$1764(defctx$1806, this.context) });
        },
        getDefCtx: function () {
            var ctx$1808 = this.context;
            while (ctx$1808 !== null) {
                if (isDef$1768(ctx$1808)) {
                    return ctx$1808.defctx;
                }
                ctx$1808 = ctx$1808.context;
            }
            return null;
        },
        expose: function () {
            parser$1761.assert(this.token.type === parser$1761.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1809(stxCtx$1810, ctx$1811) {
                if (ctx$1811 == null) {
                    return stxCtx$1810;
                } else if (isRename$1766(ctx$1811)) {
                    return Rename$1762(ctx$1811.id, ctx$1811.name, applyContext$1809(stxCtx$1810, ctx$1811.context), ctx$1811.def);
                } else if (isMark$1767(ctx$1811)) {
                    return Mark$1763(ctx$1811.mark, applyContext$1809(stxCtx$1810, ctx$1811.context));
                } else if (isDef$1768(ctx$1811)) {
                    return Def$1764(ctx$1811.defctx, applyContext$1809(stxCtx$1810, ctx$1811.context));
                } else {
                    parser$1761.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1759.map(this.token.inner, _$1759.bind(function (stx$1812) {
                if (stx$1812.token.inner) {
                    var next$1813 = syntaxFromToken$1770(stx$1812.token, stx$1812);
                    next$1813.deferredContext = applyContext$1809(stx$1812.deferredContext, this.deferredContext);
                    return next$1813;
                } else {
                    return syntaxFromToken$1770(stx$1812.token, { context: applyContext$1809(stx$1812.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1814 = this.token.type === parser$1761.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1814 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1770(token$1815, oldstx$1816) {
        return new Syntax$1769(token$1815, oldstx$1816);
    }
    function mkSyntax$1771(stx$1817, value$1818, type$1819, inner$1820) {
        if (stx$1817 && Array.isArray(stx$1817) && stx$1817.length === 1) {
            stx$1817 = stx$1817[0];
        } else if (stx$1817 && Array.isArray(stx$1817)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1817);
        }
        if (type$1819 === parser$1761.Token.Delimiter) {
            var startLineNumber$1821, startLineStart$1822, endLineNumber$1823, endLineStart$1824, startRange$1825, endRange$1826;
            if (!Array.isArray(inner$1820)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1817 && stx$1817.token.type === parser$1761.Token.Delimiter) {
                startLineNumber$1821 = stx$1817.token.startLineNumber;
                startLineStart$1822 = stx$1817.token.startLineStart;
                endLineNumber$1823 = stx$1817.token.endLineNumber;
                endLineStart$1824 = stx$1817.token.endLineStart;
                startRange$1825 = stx$1817.token.startRange;
                endRange$1826 = stx$1817.token.endRange;
            } else if (stx$1817 && stx$1817.token) {
                startLineNumber$1821 = stx$1817.token.lineNumber;
                startLineStart$1822 = stx$1817.token.lineStart;
                endLineNumber$1823 = stx$1817.token.lineNumber;
                endLineStart$1824 = stx$1817.token.lineStart;
                startRange$1825 = stx$1817.token.range;
                endRange$1826 = stx$1817.token.range;
            }
            return syntaxFromToken$1770({
                type: parser$1761.Token.Delimiter,
                value: value$1818,
                inner: inner$1820,
                startLineStart: startLineStart$1822,
                startLineNumber: startLineNumber$1821,
                endLineStart: endLineStart$1824,
                endLineNumber: endLineNumber$1823,
                startRange: startRange$1825,
                endRange: endRange$1826
            }, stx$1817);
        } else {
            var lineStart$1827, lineNumber$1828, range$1829;
            if (stx$1817 && stx$1817.token.type === parser$1761.Token.Delimiter) {
                lineStart$1827 = stx$1817.token.startLineStart;
                lineNumber$1828 = stx$1817.token.startLineNumber;
                range$1829 = stx$1817.token.startRange;
            } else if (stx$1817 && stx$1817.token) {
                lineStart$1827 = stx$1817.token.lineStart;
                lineNumber$1828 = stx$1817.token.lineNumber;
                range$1829 = stx$1817.token.range;
            }
            return syntaxFromToken$1770({
                type: type$1819,
                value: value$1818,
                lineStart: lineStart$1827,
                lineNumber: lineNumber$1828,
                range: range$1829
            }, stx$1817);
        }
    }
    function makeValue$1772(val$1830, stx$1831) {
        if (typeof val$1830 === 'boolean') {
            return mkSyntax$1771(stx$1831, val$1830 ? 'true' : 'false', parser$1761.Token.BooleanLiteral);
        } else if (typeof val$1830 === 'number') {
            if (val$1830 !== val$1830) {
                return makeDelim$1777('()', [
                    makeValue$1772(0, stx$1831),
                    makePunc$1776('/', stx$1831),
                    makeValue$1772(0, stx$1831)
                ], stx$1831);
            }
            if (val$1830 < 0) {
                return makeDelim$1777('()', [
                    makePunc$1776('-', stx$1831),
                    makeValue$1772(Math.abs(val$1830), stx$1831)
                ], stx$1831);
            } else {
                return mkSyntax$1771(stx$1831, val$1830, parser$1761.Token.NumericLiteral);
            }
        } else if (typeof val$1830 === 'string') {
            return mkSyntax$1771(stx$1831, val$1830, parser$1761.Token.StringLiteral);
        } else if (val$1830 === null) {
            return mkSyntax$1771(stx$1831, 'null', parser$1761.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1830);
        }
    }
    function makeRegex$1773(val$1832, flags$1833, stx$1834) {
        var newstx$1835 = mkSyntax$1771(stx$1834, new RegExp(val$1832, flags$1833), parser$1761.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1835.token.literal = val$1832;
        return newstx$1835;
    }
    function makeIdent$1774(val$1836, stx$1837) {
        return mkSyntax$1771(stx$1837, val$1836, parser$1761.Token.Identifier);
    }
    function makeKeyword$1775(val$1838, stx$1839) {
        return mkSyntax$1771(stx$1839, val$1838, parser$1761.Token.Keyword);
    }
    function makePunc$1776(val$1840, stx$1841) {
        return mkSyntax$1771(stx$1841, val$1840, parser$1761.Token.Punctuator);
    }
    function makeDelim$1777(val$1842, inner$1843, stx$1844) {
        return mkSyntax$1771(stx$1844, val$1842, parser$1761.Token.Delimiter, inner$1843);
    }
    function unwrapSyntax$1778(stx$1845) {
        if (Array.isArray(stx$1845) && stx$1845.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1845 = stx$1845[0];
        }
        if (stx$1845.token) {
            if (stx$1845.token.type === parser$1761.Token.Delimiter) {
                return stx$1845.token;
            } else {
                return stx$1845.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1845);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1779(stx$1846) {
        return _$1759.map(stx$1846, function (stx$1847) {
            if (stx$1847.token.inner) {
                stx$1847.token.inner = syntaxToTokens$1779(stx$1847.token.inner);
            }
            return stx$1847.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1780(tokens$1848) {
        if (!_$1759.isArray(tokens$1848)) {
            tokens$1848 = [tokens$1848];
        }
        return _$1759.map(tokens$1848, function (token$1849) {
            if (token$1849.inner) {
                token$1849.inner = tokensToSyntax$1780(token$1849.inner);
            }
            return syntaxFromToken$1770(token$1849);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1781(tojoin$1850, punc$1851) {
        if (tojoin$1850.length === 0) {
            return [];
        }
        if (punc$1851 === ' ') {
            return tojoin$1850;
        }
        return _$1759.reduce(_$1759.rest(tojoin$1850, 1), function (acc$1852, join$1853) {
            return acc$1852.concat(makePunc$1776(punc$1851, join$1853), join$1853);
        }, [_$1759.first(tojoin$1850)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1782(tojoin$1854, punc$1855) {
        if (tojoin$1854.length === 0) {
            return [];
        }
        if (punc$1855 === ' ') {
            return _$1759.flatten(tojoin$1854, true);
        }
        return _$1759.reduce(_$1759.rest(tojoin$1854, 1), function (acc$1856, join$1857) {
            return acc$1856.concat(makePunc$1776(punc$1855, _$1759.first(join$1857)), join$1857);
        }, _$1759.first(tojoin$1854));
    }
    function MacroSyntaxError$1783(name$1858, message$1859, stx$1860) {
        this.name = name$1858;
        this.message = message$1859;
        this.stx = stx$1860;
    }
    function throwSyntaxError$1784(name$1861, message$1862, stx$1863) {
        if (stx$1863 && Array.isArray(stx$1863)) {
            stx$1863 = stx$1863[0];
        }
        throw new MacroSyntaxError$1783(name$1861, message$1862, stx$1863);
    }
    function printSyntaxError$1785(code$1864, err$1865) {
        if (!err$1865.stx) {
            return '[' + err$1865.name + '] ' + err$1865.message;
        }
        var token$1866 = err$1865.stx.token;
        var lineNumber$1867 = token$1866.startLineNumber || token$1866.lineNumber;
        var lineStart$1868 = token$1866.startLineStart || token$1866.lineStart;
        var start$1869 = token$1866.range[0];
        var offset$1870 = start$1869 - lineStart$1868;
        var line$1871 = '';
        var pre$1872 = lineNumber$1867 + ': ';
        var ch$1873;
        while (ch$1873 = code$1864.charAt(lineStart$1868++)) {
            if (ch$1873 == '\r' || ch$1873 == '\n') {
                break;
            }
            line$1871 += ch$1873;
        }
        return '[' + err$1865.name + '] ' + err$1865.message + '\n' + pre$1872 + line$1871 + '\n' + Array(offset$1870 + pre$1872.length).join(' ') + ' ^';
    }
    exports$1758.unwrapSyntax = unwrapSyntax$1778;
    exports$1758.makeDelim = makeDelim$1777;
    exports$1758.makePunc = makePunc$1776;
    exports$1758.makeKeyword = makeKeyword$1775;
    exports$1758.makeIdent = makeIdent$1774;
    exports$1758.makeRegex = makeRegex$1773;
    exports$1758.makeValue = makeValue$1772;
    exports$1758.Rename = Rename$1762;
    exports$1758.Mark = Mark$1763;
    exports$1758.Var = Var$1765;
    exports$1758.Def = Def$1764;
    exports$1758.isDef = isDef$1768;
    exports$1758.isMark = isMark$1767;
    exports$1758.isRename = isRename$1766;
    exports$1758.syntaxFromToken = syntaxFromToken$1770;
    exports$1758.tokensToSyntax = tokensToSyntax$1780;
    exports$1758.syntaxToTokens = syntaxToTokens$1779;
    exports$1758.joinSyntax = joinSyntax$1781;
    exports$1758.joinSyntaxArr = joinSyntaxArr$1782;
    exports$1758.MacroSyntaxError = MacroSyntaxError$1783;
    exports$1758.throwSyntaxError = throwSyntaxError$1784;
    exports$1758.printSyntaxError = printSyntaxError$1785;
}));
//# sourceMappingURL=syntax.js.map