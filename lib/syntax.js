(function (root$1755, factory$1756) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1756(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1756);
    }
}(this, function (exports$1757, _$1758, es6$1759, parser$1760) {
    // (CSyntax, Str) -> CContext
    function Rename$1761(id$1785, name$1786, ctx$1787, defctx$1788) {
        defctx$1788 = defctx$1788 || null;
        return {
            id: id$1785,
            name: name$1786,
            context: ctx$1787,
            def: defctx$1788
        };
    }
    // (Num) -> CContext
    function Mark$1762(mark$1789, ctx$1790) {
        return {
            mark: mark$1789,
            context: ctx$1790
        };
    }
    function Def$1763(defctx$1791, ctx$1792) {
        return {
            defctx: defctx$1791,
            context: ctx$1792
        };
    }
    function Var$1764(id$1793) {
        return { id: id$1793 };
    }
    function isRename$1765(r$1794) {
        return r$1794 && typeof r$1794.id !== 'undefined' && typeof r$1794.name !== 'undefined';
    }
    ;
    function isMark$1766(m$1795) {
        return m$1795 && typeof m$1795.mark !== 'undefined';
    }
    ;
    function isDef$1767(ctx$1796) {
        return ctx$1796 && typeof ctx$1796.defctx !== 'undefined';
    }
    function Syntax$1768(token$1797, oldstx$1798) {
        this.token = token$1797;
        this.context = oldstx$1798 && oldstx$1798.context ? oldstx$1798.context : null;
        this.deferredContext = oldstx$1798 && oldstx$1798.deferredContext ? oldstx$1798.deferredContext : null;
    }
    Syntax$1768.prototype = {
        mark: function (newMark$1799) {
            if (this.token.inner) {
                var next$1800 = syntaxFromToken$1769(this.token, this);
                next$1800.deferredContext = Mark$1762(newMark$1799, this.deferredContext);
                return next$1800;
            }
            return syntaxFromToken$1769(this.token, { context: Mark$1762(newMark$1799, this.context) });
        },
        rename: function (id$1801, name$1802, defctx$1803) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1804 = syntaxFromToken$1769(this.token, this);
                next$1804.deferredContext = Rename$1761(id$1801, name$1802, this.deferredContext, defctx$1803);
                return next$1804;
            }
            if (this.token.type === parser$1760.Token.Identifier || this.token.type === parser$1760.Token.Keyword) {
                return syntaxFromToken$1769(this.token, { context: Rename$1761(id$1801, name$1802, this.context, defctx$1803) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1805) {
            if (this.token.inner) {
                var next$1806 = syntaxFromToken$1769(this.token, this);
                next$1806.deferredContext = Def$1763(defctx$1805, this.deferredContext);
                return next$1806;
            }
            return syntaxFromToken$1769(this.token, { context: Def$1763(defctx$1805, this.context) });
        },
        getDefCtx: function () {
            var ctx$1807 = this.context;
            while (ctx$1807 !== null) {
                if (isDef$1767(ctx$1807)) {
                    return ctx$1807.defctx;
                }
                ctx$1807 = ctx$1807.context;
            }
            return null;
        },
        expose: function () {
            parser$1760.assert(this.token.type === parser$1760.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1808(stxCtx$1809, ctx$1810) {
                if (ctx$1810 == null) {
                    return stxCtx$1809;
                } else if (isRename$1765(ctx$1810)) {
                    return Rename$1761(ctx$1810.id, ctx$1810.name, applyContext$1808(stxCtx$1809, ctx$1810.context), ctx$1810.def);
                } else if (isMark$1766(ctx$1810)) {
                    return Mark$1762(ctx$1810.mark, applyContext$1808(stxCtx$1809, ctx$1810.context));
                } else if (isDef$1767(ctx$1810)) {
                    return Def$1763(ctx$1810.defctx, applyContext$1808(stxCtx$1809, ctx$1810.context));
                } else {
                    parser$1760.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1758.map(this.token.inner, _$1758.bind(function (stx$1811) {
                if (stx$1811.token.inner) {
                    var next$1812 = syntaxFromToken$1769(stx$1811.token, stx$1811);
                    next$1812.deferredContext = applyContext$1808(stx$1811.deferredContext, this.deferredContext);
                    return next$1812;
                } else {
                    return syntaxFromToken$1769(stx$1811.token, { context: applyContext$1808(stx$1811.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1813 = this.token.type === parser$1760.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1813 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1769(token$1814, oldstx$1815) {
        return new Syntax$1768(token$1814, oldstx$1815);
    }
    function mkSyntax$1770(stx$1816, value$1817, type$1818, inner$1819) {
        if (stx$1816 && Array.isArray(stx$1816) && stx$1816.length === 1) {
            stx$1816 = stx$1816[0];
        } else if (stx$1816 && Array.isArray(stx$1816)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1816);
        }
        if (type$1818 === parser$1760.Token.Delimiter) {
            var startLineNumber$1820, startLineStart$1821, endLineNumber$1822, endLineStart$1823, startRange$1824, endRange$1825;
            if (!Array.isArray(inner$1819)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1816 && stx$1816.token.type === parser$1760.Token.Delimiter) {
                startLineNumber$1820 = stx$1816.token.startLineNumber;
                startLineStart$1821 = stx$1816.token.startLineStart;
                endLineNumber$1822 = stx$1816.token.endLineNumber;
                endLineStart$1823 = stx$1816.token.endLineStart;
                startRange$1824 = stx$1816.token.startRange;
                endRange$1825 = stx$1816.token.endRange;
            } else if (stx$1816 && stx$1816.token) {
                startLineNumber$1820 = stx$1816.token.lineNumber;
                startLineStart$1821 = stx$1816.token.lineStart;
                endLineNumber$1822 = stx$1816.token.lineNumber;
                endLineStart$1823 = stx$1816.token.lineStart;
                startRange$1824 = stx$1816.token.range;
                endRange$1825 = stx$1816.token.range;
            }
            return syntaxFromToken$1769({
                type: parser$1760.Token.Delimiter,
                value: value$1817,
                inner: inner$1819,
                startLineStart: startLineStart$1821,
                startLineNumber: startLineNumber$1820,
                endLineStart: endLineStart$1823,
                endLineNumber: endLineNumber$1822,
                startRange: startRange$1824,
                endRange: endRange$1825
            }, stx$1816);
        } else {
            var lineStart$1826, lineNumber$1827, range$1828;
            if (stx$1816 && stx$1816.token.type === parser$1760.Token.Delimiter) {
                lineStart$1826 = stx$1816.token.startLineStart;
                lineNumber$1827 = stx$1816.token.startLineNumber;
                range$1828 = stx$1816.token.startRange;
            } else if (stx$1816 && stx$1816.token) {
                lineStart$1826 = stx$1816.token.lineStart;
                lineNumber$1827 = stx$1816.token.lineNumber;
                range$1828 = stx$1816.token.range;
            }
            return syntaxFromToken$1769({
                type: type$1818,
                value: value$1817,
                lineStart: lineStart$1826,
                lineNumber: lineNumber$1827,
                range: range$1828
            }, stx$1816);
        }
    }
    function makeValue$1771(val$1829, stx$1830) {
        if (typeof val$1829 === 'boolean') {
            return mkSyntax$1770(stx$1830, val$1829 ? 'true' : 'false', parser$1760.Token.BooleanLiteral);
        } else if (typeof val$1829 === 'number') {
            if (val$1829 !== val$1829) {
                return makeDelim$1776('()', [
                    makeValue$1771(0, stx$1830),
                    makePunc$1775('/', stx$1830),
                    makeValue$1771(0, stx$1830)
                ], stx$1830);
            }
            if (val$1829 < 0) {
                return makeDelim$1776('()', [
                    makePunc$1775('-', stx$1830),
                    makeValue$1771(Math.abs(val$1829), stx$1830)
                ], stx$1830);
            } else {
                return mkSyntax$1770(stx$1830, val$1829, parser$1760.Token.NumericLiteral);
            }
        } else if (typeof val$1829 === 'string') {
            return mkSyntax$1770(stx$1830, val$1829, parser$1760.Token.StringLiteral);
        } else if (val$1829 === null) {
            return mkSyntax$1770(stx$1830, 'null', parser$1760.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1829);
        }
    }
    function makeRegex$1772(val$1831, flags$1832, stx$1833) {
        var newstx$1834 = mkSyntax$1770(stx$1833, new RegExp(val$1831, flags$1832), parser$1760.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1834.token.literal = val$1831;
        return newstx$1834;
    }
    function makeIdent$1773(val$1835, stx$1836) {
        return mkSyntax$1770(stx$1836, val$1835, parser$1760.Token.Identifier);
    }
    function makeKeyword$1774(val$1837, stx$1838) {
        return mkSyntax$1770(stx$1838, val$1837, parser$1760.Token.Keyword);
    }
    function makePunc$1775(val$1839, stx$1840) {
        return mkSyntax$1770(stx$1840, val$1839, parser$1760.Token.Punctuator);
    }
    function makeDelim$1776(val$1841, inner$1842, stx$1843) {
        return mkSyntax$1770(stx$1843, val$1841, parser$1760.Token.Delimiter, inner$1842);
    }
    function unwrapSyntax$1777(stx$1844) {
        if (Array.isArray(stx$1844) && stx$1844.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1844 = stx$1844[0];
        }
        if (stx$1844.token) {
            if (stx$1844.token.type === parser$1760.Token.Delimiter) {
                return stx$1844.token;
            } else {
                return stx$1844.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1844);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1778(stx$1845) {
        return _$1758.map(stx$1845, function (stx$1846) {
            if (stx$1846.token.inner) {
                stx$1846.token.inner = syntaxToTokens$1778(stx$1846.token.inner);
            }
            return stx$1846.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1779(tokens$1847) {
        if (!_$1758.isArray(tokens$1847)) {
            tokens$1847 = [tokens$1847];
        }
        return _$1758.map(tokens$1847, function (token$1848) {
            if (token$1848.inner) {
                token$1848.inner = tokensToSyntax$1779(token$1848.inner);
            }
            return syntaxFromToken$1769(token$1848);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1780(tojoin$1849, punc$1850) {
        if (tojoin$1849.length === 0) {
            return [];
        }
        if (punc$1850 === ' ') {
            return tojoin$1849;
        }
        return _$1758.reduce(_$1758.rest(tojoin$1849, 1), function (acc$1851, join$1852) {
            return acc$1851.concat(makePunc$1775(punc$1850, join$1852), join$1852);
        }, [_$1758.first(tojoin$1849)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1781(tojoin$1853, punc$1854) {
        if (tojoin$1853.length === 0) {
            return [];
        }
        if (punc$1854 === ' ') {
            return _$1758.flatten(tojoin$1853, true);
        }
        return _$1758.reduce(_$1758.rest(tojoin$1853, 1), function (acc$1855, join$1856) {
            return acc$1855.concat(makePunc$1775(punc$1854, _$1758.first(join$1856)), join$1856);
        }, _$1758.first(tojoin$1853));
    }
    function MacroSyntaxError$1782(name$1857, message$1858, stx$1859) {
        this.name = name$1857;
        this.message = message$1858;
        this.stx = stx$1859;
    }
    function throwSyntaxError$1783(name$1860, message$1861, stx$1862) {
        if (stx$1862 && Array.isArray(stx$1862)) {
            stx$1862 = stx$1862[0];
        }
        throw new MacroSyntaxError$1782(name$1860, message$1861, stx$1862);
    }
    function printSyntaxError$1784(code$1863, err$1864) {
        if (!err$1864.stx) {
            return '[' + err$1864.name + '] ' + err$1864.message;
        }
        var token$1865 = err$1864.stx.token;
        var lineNumber$1866 = token$1865.startLineNumber || token$1865.lineNumber;
        var lineStart$1867 = token$1865.startLineStart || token$1865.lineStart;
        var start$1868 = token$1865.range[0];
        var offset$1869 = start$1868 - lineStart$1867;
        var line$1870 = '';
        var pre$1871 = lineNumber$1866 + ': ';
        var ch$1872;
        while (ch$1872 = code$1863.charAt(lineStart$1867++)) {
            if (ch$1872 == '\r' || ch$1872 == '\n') {
                break;
            }
            line$1870 += ch$1872;
        }
        return '[' + err$1864.name + '] ' + err$1864.message + '\n' + pre$1871 + line$1870 + '\n' + Array(offset$1869 + pre$1871.length).join(' ') + ' ^';
    }
    exports$1757.unwrapSyntax = unwrapSyntax$1777;
    exports$1757.makeDelim = makeDelim$1776;
    exports$1757.makePunc = makePunc$1775;
    exports$1757.makeKeyword = makeKeyword$1774;
    exports$1757.makeIdent = makeIdent$1773;
    exports$1757.makeRegex = makeRegex$1772;
    exports$1757.makeValue = makeValue$1771;
    exports$1757.Rename = Rename$1761;
    exports$1757.Mark = Mark$1762;
    exports$1757.Var = Var$1764;
    exports$1757.Def = Def$1763;
    exports$1757.isDef = isDef$1767;
    exports$1757.isMark = isMark$1766;
    exports$1757.isRename = isRename$1765;
    exports$1757.syntaxFromToken = syntaxFromToken$1769;
    exports$1757.tokensToSyntax = tokensToSyntax$1779;
    exports$1757.syntaxToTokens = syntaxToTokens$1778;
    exports$1757.joinSyntax = joinSyntax$1780;
    exports$1757.joinSyntaxArr = joinSyntaxArr$1781;
    exports$1757.MacroSyntaxError = MacroSyntaxError$1782;
    exports$1757.throwSyntaxError = throwSyntaxError$1783;
    exports$1757.printSyntaxError = printSyntaxError$1784;
}));
//# sourceMappingURL=syntax.js.map