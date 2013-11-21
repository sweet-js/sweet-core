(function (root$1780, factory$1781) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1781(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1781);
    }
}(this, function (exports$1782, _$1783, es6$1784, parser$1785) {
    // (CSyntax, Str) -> CContext
    function Rename$1786(id$1810, name$1811, ctx$1812, defctx$1813) {
        defctx$1813 = defctx$1813 || null;
        return {
            id: id$1810,
            name: name$1811,
            context: ctx$1812,
            def: defctx$1813
        };
    }
    // (Num) -> CContext
    function Mark$1787(mark$1814, ctx$1815) {
        return {
            mark: mark$1814,
            context: ctx$1815
        };
    }
    function Def$1788(defctx$1816, ctx$1817) {
        return {
            defctx: defctx$1816,
            context: ctx$1817
        };
    }
    function Var$1789(id$1818) {
        return { id: id$1818 };
    }
    function isRename$1790(r$1819) {
        return r$1819 && typeof r$1819.id !== 'undefined' && typeof r$1819.name !== 'undefined';
    }
    ;
    function isMark$1791(m$1820) {
        return m$1820 && typeof m$1820.mark !== 'undefined';
    }
    ;
    function isDef$1792(ctx$1821) {
        return ctx$1821 && typeof ctx$1821.defctx !== 'undefined';
    }
    function Syntax$1793(token$1822, oldstx$1823) {
        this.token = token$1822;
        this.context = oldstx$1823 && oldstx$1823.context ? oldstx$1823.context : null;
        this.deferredContext = oldstx$1823 && oldstx$1823.deferredContext ? oldstx$1823.deferredContext : null;
    }
    Syntax$1793.prototype = {
        mark: function (newMark$1824) {
            if (this.token.inner) {
                var next$1825 = syntaxFromToken$1794(this.token, this);
                next$1825.deferredContext = Mark$1787(newMark$1824, this.deferredContext);
                return next$1825;
            }
            return syntaxFromToken$1794(this.token, { context: Mark$1787(newMark$1824, this.context) });
        },
        rename: function (id$1826, name$1827, defctx$1828) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1829 = syntaxFromToken$1794(this.token, this);
                next$1829.deferredContext = Rename$1786(id$1826, name$1827, this.deferredContext, defctx$1828);
                return next$1829;
            }
            if (this.token.type === parser$1785.Token.Identifier || this.token.type === parser$1785.Token.Keyword) {
                return syntaxFromToken$1794(this.token, { context: Rename$1786(id$1826, name$1827, this.context, defctx$1828) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1830) {
            if (this.token.inner) {
                var next$1831 = syntaxFromToken$1794(this.token, this);
                next$1831.deferredContext = Def$1788(defctx$1830, this.deferredContext);
                return next$1831;
            }
            return syntaxFromToken$1794(this.token, { context: Def$1788(defctx$1830, this.context) });
        },
        getDefCtx: function () {
            var ctx$1832 = this.context;
            while (ctx$1832 !== null) {
                if (isDef$1792(ctx$1832)) {
                    return ctx$1832.defctx;
                }
                ctx$1832 = ctx$1832.context;
            }
            return null;
        },
        expose: function () {
            parser$1785.assert(this.token.type === parser$1785.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1833(stxCtx$1834, ctx$1835) {
                if (ctx$1835 == null) {
                    return stxCtx$1834;
                } else if (isRename$1790(ctx$1835)) {
                    return Rename$1786(ctx$1835.id, ctx$1835.name, applyContext$1833(stxCtx$1834, ctx$1835.context), ctx$1835.def);
                } else if (isMark$1791(ctx$1835)) {
                    return Mark$1787(ctx$1835.mark, applyContext$1833(stxCtx$1834, ctx$1835.context));
                } else if (isDef$1792(ctx$1835)) {
                    return Def$1788(ctx$1835.defctx, applyContext$1833(stxCtx$1834, ctx$1835.context));
                } else {
                    parser$1785.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1783.map(this.token.inner, _$1783.bind(function (stx$1836) {
                if (stx$1836.token.inner) {
                    var next$1837 = syntaxFromToken$1794(stx$1836.token, stx$1836);
                    next$1837.deferredContext = applyContext$1833(stx$1836.deferredContext, this.deferredContext);
                    return next$1837;
                } else {
                    return syntaxFromToken$1794(stx$1836.token, { context: applyContext$1833(stx$1836.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1838 = this.token.type === parser$1785.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1838 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1794(token$1839, oldstx$1840) {
        return new Syntax$1793(token$1839, oldstx$1840);
    }
    function mkSyntax$1795(stx$1841, value$1842, type$1843, inner$1844) {
        if (stx$1841 && Array.isArray(stx$1841) && stx$1841.length === 1) {
            stx$1841 = stx$1841[0];
        } else if (stx$1841 && Array.isArray(stx$1841)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1841);
        }
        if (type$1843 === parser$1785.Token.Delimiter) {
            var startLineNumber$1845, startLineStart$1846, endLineNumber$1847, endLineStart$1848, startRange$1849, endRange$1850;
            if (!Array.isArray(inner$1844)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1841 && stx$1841.token.type === parser$1785.Token.Delimiter) {
                startLineNumber$1845 = stx$1841.token.startLineNumber;
                startLineStart$1846 = stx$1841.token.startLineStart;
                endLineNumber$1847 = stx$1841.token.endLineNumber;
                endLineStart$1848 = stx$1841.token.endLineStart;
                startRange$1849 = stx$1841.token.startRange;
                endRange$1850 = stx$1841.token.endRange;
            } else if (stx$1841 && stx$1841.token) {
                startLineNumber$1845 = stx$1841.token.lineNumber;
                startLineStart$1846 = stx$1841.token.lineStart;
                endLineNumber$1847 = stx$1841.token.lineNumber;
                endLineStart$1848 = stx$1841.token.lineStart;
                startRange$1849 = stx$1841.token.range;
                endRange$1850 = stx$1841.token.range;
            }
            return syntaxFromToken$1794({
                type: parser$1785.Token.Delimiter,
                value: value$1842,
                inner: inner$1844,
                startLineStart: startLineStart$1846,
                startLineNumber: startLineNumber$1845,
                endLineStart: endLineStart$1848,
                endLineNumber: endLineNumber$1847,
                startRange: startRange$1849,
                endRange: endRange$1850
            }, stx$1841);
        } else {
            var lineStart$1851, lineNumber$1852, range$1853;
            if (stx$1841 && stx$1841.token.type === parser$1785.Token.Delimiter) {
                lineStart$1851 = stx$1841.token.startLineStart;
                lineNumber$1852 = stx$1841.token.startLineNumber;
                range$1853 = stx$1841.token.startRange;
            } else if (stx$1841 && stx$1841.token) {
                lineStart$1851 = stx$1841.token.lineStart;
                lineNumber$1852 = stx$1841.token.lineNumber;
                range$1853 = stx$1841.token.range;
            }
            return syntaxFromToken$1794({
                type: type$1843,
                value: value$1842,
                lineStart: lineStart$1851,
                lineNumber: lineNumber$1852,
                range: range$1853
            }, stx$1841);
        }
    }
    function makeValue$1796(val$1854, stx$1855) {
        if (typeof val$1854 === 'boolean') {
            return mkSyntax$1795(stx$1855, val$1854 ? 'true' : 'false', parser$1785.Token.BooleanLiteral);
        } else if (typeof val$1854 === 'number') {
            if (val$1854 !== val$1854) {
                return makeDelim$1801('()', [
                    makeValue$1796(0, stx$1855),
                    makePunc$1800('/', stx$1855),
                    makeValue$1796(0, stx$1855)
                ], stx$1855);
            }
            if (val$1854 < 0) {
                return makeDelim$1801('()', [
                    makePunc$1800('-', stx$1855),
                    makeValue$1796(Math.abs(val$1854), stx$1855)
                ], stx$1855);
            } else {
                return mkSyntax$1795(stx$1855, val$1854, parser$1785.Token.NumericLiteral);
            }
        } else if (typeof val$1854 === 'string') {
            return mkSyntax$1795(stx$1855, val$1854, parser$1785.Token.StringLiteral);
        } else if (val$1854 === null) {
            return mkSyntax$1795(stx$1855, 'null', parser$1785.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1854);
        }
    }
    function makeRegex$1797(val$1856, flags$1857, stx$1858) {
        var newstx$1859 = mkSyntax$1795(stx$1858, new RegExp(val$1856, flags$1857), parser$1785.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1859.token.literal = val$1856;
        return newstx$1859;
    }
    function makeIdent$1798(val$1860, stx$1861) {
        return mkSyntax$1795(stx$1861, val$1860, parser$1785.Token.Identifier);
    }
    function makeKeyword$1799(val$1862, stx$1863) {
        return mkSyntax$1795(stx$1863, val$1862, parser$1785.Token.Keyword);
    }
    function makePunc$1800(val$1864, stx$1865) {
        return mkSyntax$1795(stx$1865, val$1864, parser$1785.Token.Punctuator);
    }
    function makeDelim$1801(val$1866, inner$1867, stx$1868) {
        return mkSyntax$1795(stx$1868, val$1866, parser$1785.Token.Delimiter, inner$1867);
    }
    function unwrapSyntax$1802(stx$1869) {
        if (Array.isArray(stx$1869) && stx$1869.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1869 = stx$1869[0];
        }
        if (stx$1869.token) {
            if (stx$1869.token.type === parser$1785.Token.Delimiter) {
                return stx$1869.token;
            } else {
                return stx$1869.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1869);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1803(stx$1870) {
        return _$1783.map(stx$1870, function (stx$1871) {
            if (stx$1871.token.inner) {
                stx$1871.token.inner = syntaxToTokens$1803(stx$1871.token.inner);
            }
            return stx$1871.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1804(tokens$1872) {
        if (!_$1783.isArray(tokens$1872)) {
            tokens$1872 = [tokens$1872];
        }
        return _$1783.map(tokens$1872, function (token$1873) {
            if (token$1873.inner) {
                token$1873.inner = tokensToSyntax$1804(token$1873.inner);
            }
            return syntaxFromToken$1794(token$1873);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1805(tojoin$1874, punc$1875) {
        if (tojoin$1874.length === 0) {
            return [];
        }
        if (punc$1875 === ' ') {
            return tojoin$1874;
        }
        return _$1783.reduce(_$1783.rest(tojoin$1874, 1), function (acc$1876, join$1877) {
            return acc$1876.concat(makePunc$1800(punc$1875, join$1877), join$1877);
        }, [_$1783.first(tojoin$1874)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1806(tojoin$1878, punc$1879) {
        if (tojoin$1878.length === 0) {
            return [];
        }
        if (punc$1879 === ' ') {
            return _$1783.flatten(tojoin$1878, true);
        }
        return _$1783.reduce(_$1783.rest(tojoin$1878, 1), function (acc$1880, join$1881) {
            return acc$1880.concat(makePunc$1800(punc$1879, _$1783.first(join$1881)), join$1881);
        }, _$1783.first(tojoin$1878));
    }
    function MacroSyntaxError$1807(name$1882, message$1883, stx$1884) {
        this.name = name$1882;
        this.message = message$1883;
        this.stx = stx$1884;
    }
    function throwSyntaxError$1808(name$1885, message$1886, stx$1887) {
        if (stx$1887 && Array.isArray(stx$1887)) {
            stx$1887 = stx$1887[0];
        }
        throw new MacroSyntaxError$1807(name$1885, message$1886, stx$1887);
    }
    function printSyntaxError$1809(code$1888, err$1889) {
        if (!err$1889.stx) {
            return '[' + err$1889.name + '] ' + err$1889.message;
        }
        var token$1890 = err$1889.stx.token;
        var lineNumber$1891 = token$1890.startLineNumber || token$1890.lineNumber;
        var lineStart$1892 = token$1890.startLineStart || token$1890.lineStart;
        var start$1893 = token$1890.range[0];
        var offset$1894 = start$1893 - lineStart$1892;
        var line$1895 = '';
        var pre$1896 = lineNumber$1891 + ': ';
        var ch$1897;
        while (ch$1897 = code$1888.charAt(lineStart$1892++)) {
            if (ch$1897 == '\r' || ch$1897 == '\n') {
                break;
            }
            line$1895 += ch$1897;
        }
        return '[' + err$1889.name + '] ' + err$1889.message + '\n' + pre$1896 + line$1895 + '\n' + Array(offset$1894 + pre$1896.length).join(' ') + ' ^';
    }
    exports$1782.unwrapSyntax = unwrapSyntax$1802;
    exports$1782.makeDelim = makeDelim$1801;
    exports$1782.makePunc = makePunc$1800;
    exports$1782.makeKeyword = makeKeyword$1799;
    exports$1782.makeIdent = makeIdent$1798;
    exports$1782.makeRegex = makeRegex$1797;
    exports$1782.makeValue = makeValue$1796;
    exports$1782.Rename = Rename$1786;
    exports$1782.Mark = Mark$1787;
    exports$1782.Var = Var$1789;
    exports$1782.Def = Def$1788;
    exports$1782.isDef = isDef$1792;
    exports$1782.isMark = isMark$1791;
    exports$1782.isRename = isRename$1790;
    exports$1782.syntaxFromToken = syntaxFromToken$1794;
    exports$1782.tokensToSyntax = tokensToSyntax$1804;
    exports$1782.syntaxToTokens = syntaxToTokens$1803;
    exports$1782.joinSyntax = joinSyntax$1805;
    exports$1782.joinSyntaxArr = joinSyntaxArr$1806;
    exports$1782.MacroSyntaxError = MacroSyntaxError$1807;
    exports$1782.throwSyntaxError = throwSyntaxError$1808;
    exports$1782.printSyntaxError = printSyntaxError$1809;
}));