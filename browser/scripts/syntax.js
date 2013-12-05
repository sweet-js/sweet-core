(function (root$1832, factory$1833) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1833(exports, require('underscore'), require('es6-collections'), require('./parser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'es6-collections',
            'parser'
        ], factory$1833);
    }
}(this, function (exports$1834, _$1835, es6$1836, parser$1837) {
    // (CSyntax, Str) -> CContext
    function Rename$1838(id$1862, name$1863, ctx$1864, defctx$1865) {
        defctx$1865 = defctx$1865 || null;
        return {
            id: id$1862,
            name: name$1863,
            context: ctx$1864,
            def: defctx$1865
        };
    }
    // (Num) -> CContext
    function Mark$1839(mark$1866, ctx$1867) {
        return {
            mark: mark$1866,
            context: ctx$1867
        };
    }
    function Def$1840(defctx$1868, ctx$1869) {
        return {
            defctx: defctx$1868,
            context: ctx$1869
        };
    }
    function Var$1841(id$1870) {
        return { id: id$1870 };
    }
    function isRename$1842(r$1871) {
        return r$1871 && typeof r$1871.id !== 'undefined' && typeof r$1871.name !== 'undefined';
    }
    ;
    function isMark$1843(m$1872) {
        return m$1872 && typeof m$1872.mark !== 'undefined';
    }
    ;
    function isDef$1844(ctx$1873) {
        return ctx$1873 && typeof ctx$1873.defctx !== 'undefined';
    }
    function Syntax$1845(token$1874, oldstx$1875) {
        this.token = token$1874;
        this.context = oldstx$1875 && oldstx$1875.context ? oldstx$1875.context : null;
        this.deferredContext = oldstx$1875 && oldstx$1875.deferredContext ? oldstx$1875.deferredContext : null;
    }
    Syntax$1845.prototype = {
        mark: function (newMark$1876) {
            if (this.token.inner) {
                var next$1877 = syntaxFromToken$1846(this.token, this);
                next$1877.deferredContext = Mark$1839(newMark$1876, this.deferredContext);
                return next$1877;
            }
            return syntaxFromToken$1846(this.token, { context: Mark$1839(newMark$1876, this.context) });
        },
        rename: function (id$1878, name$1879, defctx$1880) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1881 = syntaxFromToken$1846(this.token, this);
                next$1881.deferredContext = Rename$1838(id$1878, name$1879, this.deferredContext, defctx$1880);
                return next$1881;
            }
            if (this.token.type === parser$1837.Token.Identifier || this.token.type === parser$1837.Token.Keyword || this.token.type === parser$1837.Token.Punctuator) {
                return syntaxFromToken$1846(this.token, { context: Rename$1838(id$1878, name$1879, this.context, defctx$1880) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1882) {
            if (this.token.inner) {
                var next$1883 = syntaxFromToken$1846(this.token, this);
                next$1883.deferredContext = Def$1840(defctx$1882, this.deferredContext);
                return next$1883;
            }
            return syntaxFromToken$1846(this.token, { context: Def$1840(defctx$1882, this.context) });
        },
        getDefCtx: function () {
            var ctx$1884 = this.context;
            while (ctx$1884 !== null) {
                if (isDef$1844(ctx$1884)) {
                    return ctx$1884.defctx;
                }
                ctx$1884 = ctx$1884.context;
            }
            return null;
        },
        expose: function () {
            parser$1837.assert(this.token.type === parser$1837.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1885(stxCtx$1886, ctx$1887) {
                if (ctx$1887 == null) {
                    return stxCtx$1886;
                } else if (isRename$1842(ctx$1887)) {
                    return Rename$1838(ctx$1887.id, ctx$1887.name, applyContext$1885(stxCtx$1886, ctx$1887.context), ctx$1887.def);
                } else if (isMark$1843(ctx$1887)) {
                    return Mark$1839(ctx$1887.mark, applyContext$1885(stxCtx$1886, ctx$1887.context));
                } else if (isDef$1844(ctx$1887)) {
                    return Def$1840(ctx$1887.defctx, applyContext$1885(stxCtx$1886, ctx$1887.context));
                } else {
                    parser$1837.assert(false, 'unknown context type');
                }
            }
            this.token.inner = _$1835.map(this.token.inner, _$1835.bind(function (stx$1888) {
                if (stx$1888.token.inner) {
                    var next$1889 = syntaxFromToken$1846(stx$1888.token, stx$1888);
                    next$1889.deferredContext = applyContext$1885(stx$1888.deferredContext, this.deferredContext);
                    return next$1889;
                } else {
                    return syntaxFromToken$1846(stx$1888.token, { context: applyContext$1885(stx$1888.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1890 = this.token.type === parser$1837.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1890 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1846(token$1891, oldstx$1892) {
        return new Syntax$1845(token$1891, oldstx$1892);
    }
    function mkSyntax$1847(stx$1893, value$1894, type$1895, inner$1896) {
        if (stx$1893 && Array.isArray(stx$1893) && stx$1893.length === 1) {
            stx$1893 = stx$1893[0];
        } else if (stx$1893 && Array.isArray(stx$1893)) {
            throw new Error('Expecting a syntax object or an array with a single syntax object, not: ' + stx$1893);
        }
        if (type$1895 === parser$1837.Token.Delimiter) {
            var startLineNumber$1897, startLineStart$1898, endLineNumber$1899, endLineStart$1900, startRange$1901, endRange$1902;
            if (!Array.isArray(inner$1896)) {
                throw new Error('Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1893 && stx$1893.token.type === parser$1837.Token.Delimiter) {
                startLineNumber$1897 = stx$1893.token.startLineNumber;
                startLineStart$1898 = stx$1893.token.startLineStart;
                endLineNumber$1899 = stx$1893.token.endLineNumber;
                endLineStart$1900 = stx$1893.token.endLineStart;
                startRange$1901 = stx$1893.token.startRange;
                endRange$1902 = stx$1893.token.endRange;
            } else if (stx$1893 && stx$1893.token) {
                startLineNumber$1897 = stx$1893.token.lineNumber;
                startLineStart$1898 = stx$1893.token.lineStart;
                endLineNumber$1899 = stx$1893.token.lineNumber;
                endLineStart$1900 = stx$1893.token.lineStart;
                startRange$1901 = stx$1893.token.range;
                endRange$1902 = stx$1893.token.range;
            }
            return syntaxFromToken$1846({
                type: parser$1837.Token.Delimiter,
                value: value$1894,
                inner: inner$1896,
                startLineStart: startLineStart$1898,
                startLineNumber: startLineNumber$1897,
                endLineStart: endLineStart$1900,
                endLineNumber: endLineNumber$1899,
                startRange: startRange$1901,
                endRange: endRange$1902
            }, stx$1893);
        } else {
            var lineStart$1903, lineNumber$1904, range$1905;
            if (stx$1893 && stx$1893.token.type === parser$1837.Token.Delimiter) {
                lineStart$1903 = stx$1893.token.startLineStart;
                lineNumber$1904 = stx$1893.token.startLineNumber;
                range$1905 = stx$1893.token.startRange;
            } else if (stx$1893 && stx$1893.token) {
                lineStart$1903 = stx$1893.token.lineStart;
                lineNumber$1904 = stx$1893.token.lineNumber;
                range$1905 = stx$1893.token.range;
            }
            return syntaxFromToken$1846({
                type: type$1895,
                value: value$1894,
                lineStart: lineStart$1903,
                lineNumber: lineNumber$1904,
                range: range$1905
            }, stx$1893);
        }
    }
    function makeValue$1848(val$1906, stx$1907) {
        if (typeof val$1906 === 'boolean') {
            return mkSyntax$1847(stx$1907, val$1906 ? 'true' : 'false', parser$1837.Token.BooleanLiteral);
        } else if (typeof val$1906 === 'number') {
            if (val$1906 !== val$1906) {
                return makeDelim$1853('()', [
                    makeValue$1848(0, stx$1907),
                    makePunc$1852('/', stx$1907),
                    makeValue$1848(0, stx$1907)
                ], stx$1907);
            }
            if (val$1906 < 0) {
                return makeDelim$1853('()', [
                    makePunc$1852('-', stx$1907),
                    makeValue$1848(Math.abs(val$1906), stx$1907)
                ], stx$1907);
            } else {
                return mkSyntax$1847(stx$1907, val$1906, parser$1837.Token.NumericLiteral);
            }
        } else if (typeof val$1906 === 'string') {
            return mkSyntax$1847(stx$1907, val$1906, parser$1837.Token.StringLiteral);
        } else if (val$1906 === null) {
            return mkSyntax$1847(stx$1907, 'null', parser$1837.Token.NullLiteral);
        } else {
            throw new Error('Cannot make value syntax object from: ' + val$1906);
        }
    }
    function makeRegex$1849(val$1908, flags$1909, stx$1910) {
        var newstx$1911 = mkSyntax$1847(stx$1910, new RegExp(val$1908, flags$1909), parser$1837.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1911.token.literal = val$1908;
        return newstx$1911;
    }
    function makeIdent$1850(val$1912, stx$1913) {
        return mkSyntax$1847(stx$1913, val$1912, parser$1837.Token.Identifier);
    }
    function makeKeyword$1851(val$1914, stx$1915) {
        return mkSyntax$1847(stx$1915, val$1914, parser$1837.Token.Keyword);
    }
    function makePunc$1852(val$1916, stx$1917) {
        return mkSyntax$1847(stx$1917, val$1916, parser$1837.Token.Punctuator);
    }
    function makeDelim$1853(val$1918, inner$1919, stx$1920) {
        return mkSyntax$1847(stx$1920, val$1918, parser$1837.Token.Delimiter, inner$1919);
    }
    function unwrapSyntax$1854(stx$1921) {
        if (Array.isArray(stx$1921) && stx$1921.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1921 = stx$1921[0];
        }
        if (stx$1921.token) {
            if (stx$1921.token.type === parser$1837.Token.Delimiter) {
                return stx$1921.token;
            } else {
                return stx$1921.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1921);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1855(stx$1922) {
        return _$1835.map(stx$1922, function (stx$1923) {
            if (stx$1923.token.inner) {
                stx$1923.token.inner = syntaxToTokens$1855(stx$1923.token.inner);
            }
            return stx$1923.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1856(tokens$1924) {
        if (!_$1835.isArray(tokens$1924)) {
            tokens$1924 = [tokens$1924];
        }
        return _$1835.map(tokens$1924, function (token$1925) {
            if (token$1925.inner) {
                token$1925.inner = tokensToSyntax$1856(token$1925.inner);
            }
            return syntaxFromToken$1846(token$1925);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1857(tojoin$1926, punc$1927) {
        if (tojoin$1926.length === 0) {
            return [];
        }
        if (punc$1927 === ' ') {
            return tojoin$1926;
        }
        return _$1835.reduce(_$1835.rest(tojoin$1926, 1), function (acc$1928, join$1929) {
            return acc$1928.concat(makePunc$1852(punc$1927, join$1929), join$1929);
        }, [_$1835.first(tojoin$1926)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1858(tojoin$1930, punc$1931) {
        if (tojoin$1930.length === 0) {
            return [];
        }
        if (punc$1931 === ' ') {
            return _$1835.flatten(tojoin$1930, true);
        }
        return _$1835.reduce(_$1835.rest(tojoin$1930, 1), function (acc$1932, join$1933) {
            return acc$1932.concat(makePunc$1852(punc$1931, _$1835.first(join$1933)), join$1933);
        }, _$1835.first(tojoin$1930));
    }
    function MacroSyntaxError$1859(name$1934, message$1935, stx$1936) {
        this.name = name$1934;
        this.message = message$1935;
        this.stx = stx$1936;
    }
    function throwSyntaxError$1860(name$1937, message$1938, stx$1939) {
        if (stx$1939 && Array.isArray(stx$1939)) {
            stx$1939 = stx$1939[0];
        }
        throw new MacroSyntaxError$1859(name$1937, message$1938, stx$1939);
    }
    function printSyntaxError$1861(code$1940, err$1941) {
        if (!err$1941.stx) {
            return '[' + err$1941.name + '] ' + err$1941.message;
        }
        var token$1942 = err$1941.stx.token;
        var lineNumber$1943 = token$1942.startLineNumber || token$1942.lineNumber;
        var lineStart$1944 = token$1942.startLineStart || token$1942.lineStart;
        var start$1945 = token$1942.range[0];
        var offset$1946 = start$1945 - lineStart$1944;
        var line$1947 = '';
        var pre$1948 = lineNumber$1943 + ': ';
        var ch$1949;
        while (ch$1949 = code$1940.charAt(lineStart$1944++)) {
            if (ch$1949 == '\r' || ch$1949 == '\n') {
                break;
            }
            line$1947 += ch$1949;
        }
        return '[' + err$1941.name + '] ' + err$1941.message + '\n' + pre$1948 + line$1947 + '\n' + Array(offset$1946 + pre$1948.length).join(' ') + ' ^';
    }
    exports$1834.unwrapSyntax = unwrapSyntax$1854;
    exports$1834.makeDelim = makeDelim$1853;
    exports$1834.makePunc = makePunc$1852;
    exports$1834.makeKeyword = makeKeyword$1851;
    exports$1834.makeIdent = makeIdent$1850;
    exports$1834.makeRegex = makeRegex$1849;
    exports$1834.makeValue = makeValue$1848;
    exports$1834.Rename = Rename$1838;
    exports$1834.Mark = Mark$1839;
    exports$1834.Var = Var$1841;
    exports$1834.Def = Def$1840;
    exports$1834.isDef = isDef$1844;
    exports$1834.isMark = isMark$1843;
    exports$1834.isRename = isRename$1842;
    exports$1834.syntaxFromToken = syntaxFromToken$1846;
    exports$1834.tokensToSyntax = tokensToSyntax$1856;
    exports$1834.syntaxToTokens = syntaxToTokens$1855;
    exports$1834.joinSyntax = joinSyntax$1857;
    exports$1834.joinSyntaxArr = joinSyntaxArr$1858;
    exports$1834.MacroSyntaxError = MacroSyntaxError$1859;
    exports$1834.throwSyntaxError = throwSyntaxError$1860;
    exports$1834.printSyntaxError = printSyntaxError$1861;
}));