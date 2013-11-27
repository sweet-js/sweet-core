(function (root$1760, factory$1761) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1761(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1761);
    }
}(this, function (exports$1762, _$1763, es6$1764, parser$1765) {
    // (CSyntax, Str) -> CContext
    function Rename$1766(id$1790, name$1791, ctx$1792, defctx$1793) {
        defctx$1793 = defctx$1793 || null;
        return {
            id: id$1790,
            name: name$1791,
            context: ctx$1792,
            def: defctx$1793
        };
    }
    // (Num) -> CContext
    function Mark$1767(mark$1794, ctx$1795) {
        return {
            mark: mark$1794,
            context: ctx$1795
        };
    }
    function Def$1768(defctx$1796, ctx$1797) {
        return {
            defctx: defctx$1796,
            context: ctx$1797
        };
    }
    function Var$1769(id$1798) {
        return { id: id$1798 };
    }
    function isRename$1770(r$1799) {
        return r$1799 && typeof r$1799.id !== 'undefined' && typeof r$1799.name !== 'undefined';
    }
    ;
    function isMark$1771(m$1800) {
        return m$1800 && typeof m$1800.mark !== 'undefined';
    }
    ;
    function isDef$1772(ctx$1801) {
        return ctx$1801 && typeof ctx$1801.defctx !== 'undefined';
    }
    function Syntax$1773(token$1802, oldstx$1803) {
        this.token = token$1802;
        this.context = oldstx$1803 && oldstx$1803.context ? oldstx$1803.context : null;
        this.deferredContext = oldstx$1803 && oldstx$1803.deferredContext ? oldstx$1803.deferredContext : null;
    }
    Syntax$1773.prototype = {
        mark: function (newMark$1804) {
            if (this.token.inner) {
                var next$1805 = syntaxFromToken$1774(this.token, this);
                next$1805.deferredContext = Mark$1767(newMark$1804, this.deferredContext);
                return next$1805;
            }
            return syntaxFromToken$1774(this.token, { context: Mark$1767(newMark$1804, this.context) });
        },
        rename: function (id$1806, name$1807, defctx$1808) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1809 = syntaxFromToken$1774(this.token, this);
                next$1809.deferredContext = Rename$1766(id$1806, name$1807, this.deferredContext, defctx$1808);
                return next$1809;
            }
            if (this.token.type === parser$1765.Token.Identifier || this.token.type === parser$1765.Token.Keyword) {
                return syntaxFromToken$1774(this.token, { context: Rename$1766(id$1806, name$1807, this.context, defctx$1808) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1810) {
            if (this.token.inner) {
                var next$1811 = syntaxFromToken$1774(this.token, this);
                next$1811.deferredContext = Def$1768(defctx$1810, this.deferredContext);
                return next$1811;
            }
            return syntaxFromToken$1774(this.token, { context: Def$1768(defctx$1810, this.context) });
        },
        getDefCtx: function () {
            var ctx$1812 = this.context;
            while (ctx$1812 !== null) {
                if (isDef$1772(ctx$1812)) {
                    return ctx$1812.defctx;
                }
                ctx$1812 = ctx$1812.context;
            }
            return null;
        },
        expose: function () {
            parser$1765.assert(this.token.type === parser$1765.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1813(stxCtx$1814, ctx$1815) {
                if (ctx$1815 == null) {
                    return stxCtx$1814;
                } else if (isRename$1770(ctx$1815)) {
                    return Rename$1766(ctx$1815.id, ctx$1815.name, applyContext$1813(stxCtx$1814, ctx$1815.context), ctx$1815.def);
                } else if (isMark$1771(ctx$1815)) {
                    return Mark$1767(ctx$1815.mark, applyContext$1813(stxCtx$1814, ctx$1815.context));
                } else if (isDef$1772(ctx$1815)) {
                    return Def$1768(ctx$1815.defctx, applyContext$1813(stxCtx$1814, ctx$1815.context));
                } else {
                    parser$1765.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1763.map(this.token.inner, _$1763.bind(function (stx$1816) {
                if (stx$1816.token.inner) {
                    var next$1817 = syntaxFromToken$1774(stx$1816.token, stx$1816);
                    next$1817.deferredContext = applyContext$1813(stx$1816.deferredContext, this.deferredContext);
                    return next$1817;
                } else {
                    return syntaxFromToken$1774(stx$1816.token, { context: applyContext$1813(stx$1816.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1818 = this.token.type === parser$1765.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1818 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1774(token$1819, oldstx$1820) {
        return new Syntax$1773(token$1819, oldstx$1820);
    }
    function mkSyntax$1775(stx$1821, value$1822, type$1823, inner$1824) {
        if (stx$1821 && Array.isArray(stx$1821) && stx$1821.length === 1) {
            stx$1821 = stx$1821[0];
        } else if (stx$1821 && Array.isArray(stx$1821)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1821);
        }
        if (type$1823 === parser$1765.Token.Delimiter) {
            var startLineNumber$1825, startLineStart$1826, endLineNumber$1827, endLineStart$1828, startRange$1829, endRange$1830;
            if (!Array.isArray(inner$1824)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1821 && stx$1821.token.type === parser$1765.Token.Delimiter) {
                startLineNumber$1825 = stx$1821.token.startLineNumber;
                startLineStart$1826 = stx$1821.token.startLineStart;
                endLineNumber$1827 = stx$1821.token.endLineNumber;
                endLineStart$1828 = stx$1821.token.endLineStart;
                startRange$1829 = stx$1821.token.startRange;
                endRange$1830 = stx$1821.token.endRange;
            } else if (stx$1821 && stx$1821.token) {
                startLineNumber$1825 = stx$1821.token.lineNumber;
                startLineStart$1826 = stx$1821.token.lineStart;
                endLineNumber$1827 = stx$1821.token.lineNumber;
                endLineStart$1828 = stx$1821.token.lineStart;
                startRange$1829 = stx$1821.token.range;
                endRange$1830 = stx$1821.token.range;
            }
            return syntaxFromToken$1774({
                type: parser$1765.Token.Delimiter,
                value: value$1822,
                inner: inner$1824,
                startLineStart: startLineStart$1826,
                startLineNumber: startLineNumber$1825,
                endLineStart: endLineStart$1828,
                endLineNumber: endLineNumber$1827,
                startRange: startRange$1829,
                endRange: endRange$1830
            }, stx$1821);
        } else {
            var lineStart$1831, lineNumber$1832, range$1833;
            if (stx$1821 && stx$1821.token.type === parser$1765.Token.Delimiter) {
                lineStart$1831 = stx$1821.token.startLineStart;
                lineNumber$1832 = stx$1821.token.startLineNumber;
                range$1833 = stx$1821.token.startRange;
            } else if (stx$1821 && stx$1821.token) {
                lineStart$1831 = stx$1821.token.lineStart;
                lineNumber$1832 = stx$1821.token.lineNumber;
                range$1833 = stx$1821.token.range;
            }
            return syntaxFromToken$1774({
                type: type$1823,
                value: value$1822,
                lineStart: lineStart$1831,
                lineNumber: lineNumber$1832,
                range: range$1833
            }, stx$1821);
        }
    }
    function makeValue$1776(val$1834, stx$1835) {
        if (typeof val$1834 === 'boolean') {
            return mkSyntax$1775(stx$1835, val$1834 ? 'true' : 'false', parser$1765.Token.BooleanLiteral);
        } else if (typeof val$1834 === 'number') {
            if (val$1834 !== val$1834) {
                return makeDelim$1781('()', [
                    makeValue$1776(0, stx$1835),
                    makePunc$1780('/', stx$1835),
                    makeValue$1776(0, stx$1835)
                ], stx$1835);
            }
            if (val$1834 < 0) {
                return makeDelim$1781('()', [
                    makePunc$1780('-', stx$1835),
                    makeValue$1776(Math.abs(val$1834), stx$1835)
                ], stx$1835);
            } else {
                return mkSyntax$1775(stx$1835, val$1834, parser$1765.Token.NumericLiteral);
            }
        } else if (typeof val$1834 === 'string') {
            return mkSyntax$1775(stx$1835, val$1834, parser$1765.Token.StringLiteral);
        } else if (val$1834 === null) {
            return mkSyntax$1775(stx$1835, 'null', parser$1765.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1834);
        }
    }
    function makeRegex$1777(val$1836, flags$1837, stx$1838) {
        var newstx$1839 = mkSyntax$1775(stx$1838, new RegExp(val$1836, flags$1837), parser$1765.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1839.token.literal = val$1836;
        return newstx$1839;
    }
    function makeIdent$1778(val$1840, stx$1841) {
        return mkSyntax$1775(stx$1841, val$1840, parser$1765.Token.Identifier);
    }
    function makeKeyword$1779(val$1842, stx$1843) {
        return mkSyntax$1775(stx$1843, val$1842, parser$1765.Token.Keyword);
    }
    function makePunc$1780(val$1844, stx$1845) {
        return mkSyntax$1775(stx$1845, val$1844, parser$1765.Token.Punctuator);
    }
    function makeDelim$1781(val$1846, inner$1847, stx$1848) {
        return mkSyntax$1775(stx$1848, val$1846, parser$1765.Token.Delimiter, inner$1847);
    }
    function unwrapSyntax$1782(stx$1849) {
        if (Array.isArray(stx$1849) && stx$1849.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1849 = stx$1849[0];
        }
        if (stx$1849.token) {
            if (stx$1849.token.type === parser$1765.Token.Delimiter) {
                return stx$1849.token;
            } else {
                return stx$1849.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1849);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1783(stx$1850) {
        return _$1763.map(stx$1850, function (stx$1851) {
            if (stx$1851.token.inner) {
                stx$1851.token.inner = syntaxToTokens$1783(stx$1851.token.inner);
            }
            return stx$1851.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1784(tokens$1852) {
        if (!_$1763.isArray(tokens$1852)) {
            tokens$1852 = [tokens$1852];
        }
        return _$1763.map(tokens$1852, function (token$1853) {
            if (token$1853.inner) {
                token$1853.inner = tokensToSyntax$1784(token$1853.inner);
            }
            return syntaxFromToken$1774(token$1853);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1785(tojoin$1854, punc$1855) {
        if (tojoin$1854.length === 0) {
            return [];
        }
        if (punc$1855 === ' ') {
            return tojoin$1854;
        }
        return _$1763.reduce(_$1763.rest(tojoin$1854, 1), function (acc$1856, join$1857) {
            return acc$1856.concat(makePunc$1780(punc$1855, join$1857), join$1857);
        }, [_$1763.first(tojoin$1854)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1786(tojoin$1858, punc$1859) {
        if (tojoin$1858.length === 0) {
            return [];
        }
        if (punc$1859 === ' ') {
            return _$1763.flatten(tojoin$1858, true);
        }
        return _$1763.reduce(_$1763.rest(tojoin$1858, 1), function (acc$1860, join$1861) {
            return acc$1860.concat(makePunc$1780(punc$1859, _$1763.first(join$1861)), join$1861);
        }, _$1763.first(tojoin$1858));
    }
    function MacroSyntaxError$1787(name$1862, message$1863, stx$1864) {
        this.name = name$1862;
        this.message = message$1863;
        this.stx = stx$1864;
    }
    function throwSyntaxError$1788(name$1865, message$1866, stx$1867) {
        if (stx$1867 && Array.isArray(stx$1867)) {
            stx$1867 = stx$1867[0];
        }
        throw new MacroSyntaxError$1787(name$1865, message$1866, stx$1867);
    }
    function printSyntaxError$1789(code$1868, err$1869) {
        if (!err$1869.stx) {
            return '[' + err$1869.name + '] ' + err$1869.message;
        }
        var token$1870 = err$1869.stx.token;
        var lineNumber$1871 = token$1870.startLineNumber || token$1870.lineNumber;
        var lineStart$1872 = token$1870.startLineStart || token$1870.lineStart;
        var start$1873 = token$1870.range[0];
        var offset$1874 = start$1873 - lineStart$1872;
        var line$1875 = '';
        var pre$1876 = lineNumber$1871 + ': ';
        var ch$1877;
        while (ch$1877 = code$1868.charAt(lineStart$1872++)) {
            if (ch$1877 == '\r' || ch$1877 == '\n') {
                break;
            }
            line$1875 += ch$1877;
        }
        return '[' + err$1869.name + '] ' + err$1869.message + '\n' + pre$1876 + line$1875 + '\n' + Array(offset$1874 + pre$1876.length).join(' ') + ' ^';
    }
    exports$1762.unwrapSyntax = unwrapSyntax$1782;
    exports$1762.makeDelim = makeDelim$1781;
    exports$1762.makePunc = makePunc$1780;
    exports$1762.makeKeyword = makeKeyword$1779;
    exports$1762.makeIdent = makeIdent$1778;
    exports$1762.makeRegex = makeRegex$1777;
    exports$1762.makeValue = makeValue$1776;
    exports$1762.Rename = Rename$1766;
    exports$1762.Mark = Mark$1767;
    exports$1762.Var = Var$1769;
    exports$1762.Def = Def$1768;
    exports$1762.isDef = isDef$1772;
    exports$1762.isMark = isMark$1771;
    exports$1762.isRename = isRename$1770;
    exports$1762.syntaxFromToken = syntaxFromToken$1774;
    exports$1762.tokensToSyntax = tokensToSyntax$1784;
    exports$1762.syntaxToTokens = syntaxToTokens$1783;
    exports$1762.joinSyntax = joinSyntax$1785;
    exports$1762.joinSyntaxArr = joinSyntaxArr$1786;
    exports$1762.MacroSyntaxError = MacroSyntaxError$1787;
    exports$1762.throwSyntaxError = throwSyntaxError$1788;
    exports$1762.printSyntaxError = printSyntaxError$1789;
}));