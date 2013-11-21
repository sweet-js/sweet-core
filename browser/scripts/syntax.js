(function (root$1753, factory$1754) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1754(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1754);
    }
}(this, function (exports$1755, _$1756, es6$1757, parser$1758) {
    // (CSyntax, Str) -> CContext
    function Rename$1759(id$1783, name$1784, ctx$1785, defctx$1786) {
        defctx$1786 = defctx$1786 || null;
        return {
            id: id$1783,
            name: name$1784,
            context: ctx$1785,
            def: defctx$1786
        };
    }
    // (Num) -> CContext
    function Mark$1760(mark$1787, ctx$1788) {
        return {
            mark: mark$1787,
            context: ctx$1788
        };
    }
    function Def$1761(defctx$1789, ctx$1790) {
        return {
            defctx: defctx$1789,
            context: ctx$1790
        };
    }
    function Var$1762(id$1791) {
        return { id: id$1791 };
    }
    function isRename$1763(r$1792) {
        return r$1792 && typeof r$1792.id !== 'undefined' && typeof r$1792.name !== 'undefined';
    }
    ;
    function isMark$1764(m$1793) {
        return m$1793 && typeof m$1793.mark !== 'undefined';
    }
    ;
    function isDef$1765(ctx$1794) {
        return ctx$1794 && typeof ctx$1794.defctx !== 'undefined';
    }
    function Syntax$1766(token$1795, oldstx$1796) {
        this.token = token$1795;
        this.context = oldstx$1796 && oldstx$1796.context ? oldstx$1796.context : null;
        this.deferredContext = oldstx$1796 && oldstx$1796.deferredContext ? oldstx$1796.deferredContext : null;
    }
    Syntax$1766.prototype = {
        mark: function (newMark$1797) {
            if (this.token.inner) {
                var next$1798 = syntaxFromToken$1767(this.token, this);
                next$1798.deferredContext = Mark$1760(newMark$1797, this.deferredContext);
                return next$1798;
            }
            return syntaxFromToken$1767(this.token, { context: Mark$1760(newMark$1797, this.context) });
        },
        rename: function (id$1799, name$1800, defctx$1801) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1802 = syntaxFromToken$1767(this.token, this);
                next$1802.deferredContext = Rename$1759(id$1799, name$1800, this.deferredContext, defctx$1801);
                return next$1802;
            }
            if (this.token.type === parser$1758.Token.Identifier || this.token.type === parser$1758.Token.Keyword) {
                return syntaxFromToken$1767(this.token, { context: Rename$1759(id$1799, name$1800, this.context, defctx$1801) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1803) {
            if (this.token.inner) {
                var next$1804 = syntaxFromToken$1767(this.token, this);
                next$1804.deferredContext = Def$1761(defctx$1803, this.deferredContext);
                return next$1804;
            }
            return syntaxFromToken$1767(this.token, { context: Def$1761(defctx$1803, this.context) });
        },
        getDefCtx: function () {
            var ctx$1805 = this.context;
            while (ctx$1805 !== null) {
                if (isDef$1765(ctx$1805)) {
                    return ctx$1805.defctx;
                }
                ctx$1805 = ctx$1805.context;
            }
            return null;
        },
        expose: function () {
            parser$1758.assert(this.token.type === parser$1758.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1806(stxCtx$1807, ctx$1808) {
                if (ctx$1808 == null) {
                    return stxCtx$1807;
                } else if (isRename$1763(ctx$1808)) {
                    return Rename$1759(ctx$1808.id, ctx$1808.name, applyContext$1806(stxCtx$1807, ctx$1808.context), ctx$1808.def);
                } else if (isMark$1764(ctx$1808)) {
                    return Mark$1760(ctx$1808.mark, applyContext$1806(stxCtx$1807, ctx$1808.context));
                } else if (isDef$1765(ctx$1808)) {
                    return Def$1761(ctx$1808.defctx, applyContext$1806(stxCtx$1807, ctx$1808.context));
                } else {
                    parser$1758.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1756.map(this.token.inner, _$1756.bind(function (stx$1809) {
                if (stx$1809.token.inner) {
                    var next$1810 = syntaxFromToken$1767(stx$1809.token, stx$1809);
                    next$1810.deferredContext = applyContext$1806(stx$1809.deferredContext, this.deferredContext);
                    return next$1810;
                } else {
                    return syntaxFromToken$1767(stx$1809.token, { context: applyContext$1806(stx$1809.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1811 = this.token.type === parser$1758.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1811 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1767(token$1812, oldstx$1813) {
        return new Syntax$1766(token$1812, oldstx$1813);
    }
    function mkSyntax$1768(stx$1814, value$1815, type$1816, inner$1817) {
        if (stx$1814 && Array.isArray(stx$1814) && stx$1814.length === 1) {
            stx$1814 = stx$1814[0];
        } else if (stx$1814 && Array.isArray(stx$1814)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1814);
        }
        if (type$1816 === parser$1758.Token.Delimiter) {
            var startLineNumber$1818, startLineStart$1819, endLineNumber$1820, endLineStart$1821, startRange$1822, endRange$1823;
            if (!Array.isArray(inner$1817)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1814 && stx$1814.token.type === parser$1758.Token.Delimiter) {
                startLineNumber$1818 = stx$1814.token.startLineNumber;
                startLineStart$1819 = stx$1814.token.startLineStart;
                endLineNumber$1820 = stx$1814.token.endLineNumber;
                endLineStart$1821 = stx$1814.token.endLineStart;
                startRange$1822 = stx$1814.token.startRange;
                endRange$1823 = stx$1814.token.endRange;
            } else if (stx$1814 && stx$1814.token) {
                startLineNumber$1818 = stx$1814.token.lineNumber;
                startLineStart$1819 = stx$1814.token.lineStart;
                endLineNumber$1820 = stx$1814.token.lineNumber;
                endLineStart$1821 = stx$1814.token.lineStart;
                startRange$1822 = stx$1814.token.range;
                endRange$1823 = stx$1814.token.range;
            }
            return syntaxFromToken$1767({
                type: parser$1758.Token.Delimiter,
                value: value$1815,
                inner: inner$1817,
                startLineStart: startLineStart$1819,
                startLineNumber: startLineNumber$1818,
                endLineStart: endLineStart$1821,
                endLineNumber: endLineNumber$1820,
                startRange: startRange$1822,
                endRange: endRange$1823
            }, stx$1814);
        } else {
            var lineStart$1824, lineNumber$1825, range$1826;
            if (stx$1814 && stx$1814.token.type === parser$1758.Token.Delimiter) {
                lineStart$1824 = stx$1814.token.startLineStart;
                lineNumber$1825 = stx$1814.token.startLineNumber;
                range$1826 = stx$1814.token.startRange;
            } else if (stx$1814 && stx$1814.token) {
                lineStart$1824 = stx$1814.token.lineStart;
                lineNumber$1825 = stx$1814.token.lineNumber;
                range$1826 = stx$1814.token.range;
            }
            return syntaxFromToken$1767({
                type: type$1816,
                value: value$1815,
                lineStart: lineStart$1824,
                lineNumber: lineNumber$1825,
                range: range$1826
            }, stx$1814);
        }
    }
    function makeValue$1769(val$1827, stx$1828) {
        if (typeof val$1827 === 'boolean') {
            return mkSyntax$1768(stx$1828, val$1827 ? 'true' : 'false', parser$1758.Token.BooleanLiteral);
        } else if (typeof val$1827 === 'number') {
            if (val$1827 !== val$1827) {
                return makeDelim$1774('()', [
                    makeValue$1769(0, stx$1828),
                    makePunc$1773('/', stx$1828),
                    makeValue$1769(0, stx$1828)
                ], stx$1828);
            }
            if (val$1827 < 0) {
                return makeDelim$1774('()', [
                    makePunc$1773('-', stx$1828),
                    makeValue$1769(Math.abs(val$1827), stx$1828)
                ], stx$1828);
            } else {
                return mkSyntax$1768(stx$1828, val$1827, parser$1758.Token.NumericLiteral);
            }
        } else if (typeof val$1827 === 'string') {
            return mkSyntax$1768(stx$1828, val$1827, parser$1758.Token.StringLiteral);
        } else if (val$1827 === null) {
            return mkSyntax$1768(stx$1828, 'null', parser$1758.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1827);
        }
    }
    function makeRegex$1770(val$1829, flags$1830, stx$1831) {
        var newstx$1832 = mkSyntax$1768(stx$1831, new RegExp(val$1829, flags$1830), parser$1758.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1832.token.literal = val$1829;
        return newstx$1832;
    }
    function makeIdent$1771(val$1833, stx$1834) {
        return mkSyntax$1768(stx$1834, val$1833, parser$1758.Token.Identifier);
    }
    function makeKeyword$1772(val$1835, stx$1836) {
        return mkSyntax$1768(stx$1836, val$1835, parser$1758.Token.Keyword);
    }
    function makePunc$1773(val$1837, stx$1838) {
        return mkSyntax$1768(stx$1838, val$1837, parser$1758.Token.Punctuator);
    }
    function makeDelim$1774(val$1839, inner$1840, stx$1841) {
        return mkSyntax$1768(stx$1841, val$1839, parser$1758.Token.Delimiter, inner$1840);
    }
    function unwrapSyntax$1775(stx$1842) {
        if (Array.isArray(stx$1842) && stx$1842.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1842 = stx$1842[0];
        }
        if (stx$1842.token) {
            if (stx$1842.token.type === parser$1758.Token.Delimiter) {
                return stx$1842.token;
            } else {
                return stx$1842.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1842);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1776(stx$1843) {
        return _$1756.map(stx$1843, function (stx$1844) {
            if (stx$1844.token.inner) {
                stx$1844.token.inner = syntaxToTokens$1776(stx$1844.token.inner);
            }
            return stx$1844.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1777(tokens$1845) {
        if (!_$1756.isArray(tokens$1845)) {
            tokens$1845 = [tokens$1845];
        }
        return _$1756.map(tokens$1845, function (token$1846) {
            if (token$1846.inner) {
                token$1846.inner = tokensToSyntax$1777(token$1846.inner);
            }
            return syntaxFromToken$1767(token$1846);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1778(tojoin$1847, punc$1848) {
        if (tojoin$1847.length === 0) {
            return [];
        }
        if (punc$1848 === ' ') {
            return tojoin$1847;
        }
        return _$1756.reduce(_$1756.rest(tojoin$1847, 1), function (acc$1849, join$1850) {
            return acc$1849.concat(makePunc$1773(punc$1848, join$1850), join$1850);
        }, [_$1756.first(tojoin$1847)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1779(tojoin$1851, punc$1852) {
        if (tojoin$1851.length === 0) {
            return [];
        }
        if (punc$1852 === ' ') {
            return _$1756.flatten(tojoin$1851, true);
        }
        return _$1756.reduce(_$1756.rest(tojoin$1851, 1), function (acc$1853, join$1854) {
            return acc$1853.concat(makePunc$1773(punc$1852, _$1756.first(join$1854)), join$1854);
        }, _$1756.first(tojoin$1851));
    }
    function MacroSyntaxError$1780(name$1855, message$1856, stx$1857) {
        this.name = name$1855;
        this.message = message$1856;
        this.stx = stx$1857;
    }
    function throwSyntaxError$1781(name$1858, message$1859, stx$1860) {
        if (stx$1860 && Array.isArray(stx$1860)) {
            stx$1860 = stx$1860[0];
        }
        throw new MacroSyntaxError$1780(name$1858, message$1859, stx$1860);
    }
    function printSyntaxError$1782(code$1861, err$1862) {
        if (!err$1862.stx) {
            return '[' + err$1862.name + '] ' + err$1862.message;
        }
        var token$1863 = err$1862.stx.token;
        var lineNumber$1864 = token$1863.startLineNumber || token$1863.lineNumber;
        var lineStart$1865 = token$1863.startLineStart || token$1863.lineStart;
        var start$1866 = token$1863.range[0];
        var offset$1867 = start$1866 - lineStart$1865;
        var line$1868 = '';
        var pre$1869 = lineNumber$1864 + ': ';
        var ch$1870;
        while (ch$1870 = code$1861.charAt(lineStart$1865++)) {
            if (ch$1870 == '\r' || ch$1870 == '\n') {
                break;
            }
            line$1868 += ch$1870;
        }
        return '[' + err$1862.name + '] ' + err$1862.message + '\n' + pre$1869 + line$1868 + '\n' + Array(offset$1867 + pre$1869.length).join(' ') + ' ^';
    }
    exports$1755.unwrapSyntax = unwrapSyntax$1775;
    exports$1755.makeDelim = makeDelim$1774;
    exports$1755.makePunc = makePunc$1773;
    exports$1755.makeKeyword = makeKeyword$1772;
    exports$1755.makeIdent = makeIdent$1771;
    exports$1755.makeRegex = makeRegex$1770;
    exports$1755.makeValue = makeValue$1769;
    exports$1755.Rename = Rename$1759;
    exports$1755.Mark = Mark$1760;
    exports$1755.Var = Var$1762;
    exports$1755.Def = Def$1761;
    exports$1755.isDef = isDef$1765;
    exports$1755.isMark = isMark$1764;
    exports$1755.isRename = isRename$1763;
    exports$1755.syntaxFromToken = syntaxFromToken$1767;
    exports$1755.tokensToSyntax = tokensToSyntax$1777;
    exports$1755.syntaxToTokens = syntaxToTokens$1776;
    exports$1755.joinSyntax = joinSyntax$1778;
    exports$1755.joinSyntaxArr = joinSyntaxArr$1779;
    exports$1755.MacroSyntaxError = MacroSyntaxError$1780;
    exports$1755.throwSyntaxError = throwSyntaxError$1781;
    exports$1755.printSyntaxError = printSyntaxError$1782;
}));