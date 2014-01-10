(function (root$1903, factory$1904) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1904(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1904);
    }
}(this, function (exports$1905, _$1906, parser$1907, expander$1908) {
    function assert$1909(condition$1931, message$1932) {
        if (!condition$1931) {
            throw new Error('ASSERT: ' + message$1932);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1910(id$1933, name$1934, ctx$1935, defctx$1936) {
        defctx$1936 = defctx$1936 || null;
        this.id = id$1933;
        this.name = name$1934;
        this.context = ctx$1935;
        this.def = defctx$1936;
    }
    // (Num) -> CContext
    function Mark$1911(mark$1937, ctx$1938) {
        this.mark = mark$1937;
        this.context = ctx$1938;
    }
    function Def$1912(defctx$1939, ctx$1940) {
        this.defctx = defctx$1939;
        this.context = ctx$1940;
    }
    function Syntax$1913(token$1941, oldstx$1942) {
        this.token = token$1941;
        this.context = oldstx$1942 && oldstx$1942.context ? oldstx$1942.context : null;
        this.deferredContext = oldstx$1942 && oldstx$1942.deferredContext ? oldstx$1942.deferredContext : null;
    }
    Syntax$1913.prototype = {
        mark: function (newMark$1943) {
            if (this.token.inner) {
                var next$1944 = syntaxFromToken$1914(this.token, this);
                next$1944.deferredContext = new Mark$1911(newMark$1943, this.deferredContext);
                return next$1944;
            }
            return syntaxFromToken$1914(this.token, { context: new Mark$1911(newMark$1943, this.context) });
        },
        rename: function (id$1945, name$1946, defctx$1947) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1948 = syntaxFromToken$1914(this.token, this);
                next$1948.deferredContext = new Rename$1910(id$1945, name$1946, this.deferredContext, defctx$1947);
                return next$1948;
            }
            if (this.token.type === parser$1907.Token.Identifier || this.token.type === parser$1907.Token.Keyword || this.token.type === parser$1907.Token.Punctuator) {
                return syntaxFromToken$1914(this.token, { context: new Rename$1910(id$1945, name$1946, this.context, defctx$1947) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1949) {
            if (this.token.inner) {
                var next$1950 = syntaxFromToken$1914(this.token, this);
                next$1950.deferredContext = new Def$1912(defctx$1949, this.deferredContext);
                return next$1950;
            }
            return syntaxFromToken$1914(this.token, { context: new Def$1912(defctx$1949, this.context) });
        },
        getDefCtx: function () {
            var ctx$1951 = this.context;
            while (ctx$1951 !== null) {
                if (ctx$1951 instanceof Def$1912) {
                    return ctx$1951.defctx;
                }
                ctx$1951 = ctx$1951.context;
            }
            return null;
        },
        expose: function () {
            assert$1909(this.token.type === parser$1907.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1952(stxCtx$1953, ctx$1954) {
                if (ctx$1954 == null) {
                    return stxCtx$1953;
                } else if (ctx$1954 instanceof Rename$1910) {
                    return new Rename$1910(ctx$1954.id, ctx$1954.name, applyContext$1952(stxCtx$1953, ctx$1954.context), ctx$1954.def);
                } else if (ctx$1954 instanceof Mark$1911) {
                    return new Mark$1911(ctx$1954.mark, applyContext$1952(stxCtx$1953, ctx$1954.context));
                } else if (ctx$1954 instanceof Def$1912) {
                    return new Def$1912(ctx$1954.defctx, applyContext$1952(stxCtx$1953, ctx$1954.context));
                } else {
                    assert$1909(false, 'unknown context type');
                }
            }
            this.token.inner = _$1906.map(this.token.inner, _$1906.bind(function (stx$1955) {
                if (stx$1955.token.inner) {
                    var next$1956 = syntaxFromToken$1914(stx$1955.token, stx$1955);
                    next$1956.deferredContext = applyContext$1952(stx$1955.deferredContext, this.deferredContext);
                    return next$1956;
                } else {
                    return syntaxFromToken$1914(stx$1955.token, { context: applyContext$1952(stx$1955.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1957 = this.token.type === parser$1907.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1957 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1914(token$1958, oldstx$1959) {
        return new Syntax$1913(token$1958, oldstx$1959);
    }
    function mkSyntax$1915(stx$1960, value$1961, type$1962, inner$1963) {
        if (stx$1960 && Array.isArray(stx$1960) && stx$1960.length === 1) {
            stx$1960 = stx$1960[0];
        } else if (stx$1960 && Array.isArray(stx$1960)) {
            throwSyntaxError$1928('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1960 === undefined) {
            throwSyntaxError$1928('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1962 === parser$1907.Token.Delimiter) {
            var startLineNumber$1964, startLineStart$1965, endLineNumber$1966, endLineStart$1967, startRange$1968, endRange$1969;
            if (!Array.isArray(inner$1963)) {
                throwSyntaxError$1928('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1960 && stx$1960.token.type === parser$1907.Token.Delimiter) {
                startLineNumber$1964 = stx$1960.token.startLineNumber;
                startLineStart$1965 = stx$1960.token.startLineStart;
                endLineNumber$1966 = stx$1960.token.endLineNumber;
                endLineStart$1967 = stx$1960.token.endLineStart;
                startRange$1968 = stx$1960.token.startRange;
                endRange$1969 = stx$1960.token.endRange;
            } else if (stx$1960 && stx$1960.token) {
                startLineNumber$1964 = stx$1960.token.lineNumber;
                startLineStart$1965 = stx$1960.token.lineStart;
                endLineNumber$1966 = stx$1960.token.lineNumber;
                endLineStart$1967 = stx$1960.token.lineStart;
                startRange$1968 = stx$1960.token.range;
                endRange$1969 = stx$1960.token.range;
            }
            return syntaxFromToken$1914({
                type: parser$1907.Token.Delimiter,
                value: value$1961,
                inner: inner$1963,
                startLineStart: startLineStart$1965,
                startLineNumber: startLineNumber$1964,
                endLineStart: endLineStart$1967,
                endLineNumber: endLineNumber$1966,
                startRange: startRange$1968,
                endRange: endRange$1969
            }, stx$1960);
        } else {
            var lineStart$1970, lineNumber$1971, range$1972;
            if (stx$1960 && stx$1960.token.type === parser$1907.Token.Delimiter) {
                lineStart$1970 = stx$1960.token.startLineStart;
                lineNumber$1971 = stx$1960.token.startLineNumber;
                range$1972 = stx$1960.token.startRange;
            } else if (stx$1960 && stx$1960.token) {
                lineStart$1970 = stx$1960.token.lineStart;
                lineNumber$1971 = stx$1960.token.lineNumber;
                range$1972 = stx$1960.token.range;
            }
            return syntaxFromToken$1914({
                type: type$1962,
                value: value$1961,
                lineStart: lineStart$1970,
                lineNumber: lineNumber$1971,
                range: range$1972
            }, stx$1960);
        }
    }
    function makeValue$1916(val$1973, stx$1974) {
        if (typeof val$1973 === 'boolean') {
            return mkSyntax$1915(stx$1974, val$1973 ? 'true' : 'false', parser$1907.Token.BooleanLiteral);
        } else if (typeof val$1973 === 'number') {
            if (val$1973 !== val$1973) {
                return makeDelim$1921('()', [
                    makeValue$1916(0, stx$1974),
                    makePunc$1920('/', stx$1974),
                    makeValue$1916(0, stx$1974)
                ], stx$1974);
            }
            if (val$1973 < 0) {
                return makeDelim$1921('()', [
                    makePunc$1920('-', stx$1974),
                    makeValue$1916(Math.abs(val$1973), stx$1974)
                ], stx$1974);
            } else {
                return mkSyntax$1915(stx$1974, val$1973, parser$1907.Token.NumericLiteral);
            }
        } else if (typeof val$1973 === 'string') {
            return mkSyntax$1915(stx$1974, val$1973, parser$1907.Token.StringLiteral);
        } else if (val$1973 === null) {
            return mkSyntax$1915(stx$1974, 'null', parser$1907.Token.NullLiteral);
        } else {
            throwSyntaxError$1928('makeValue', 'Cannot make value syntax object from: ' + val$1973);
        }
    }
    function makeRegex$1917(val$1975, flags$1976, stx$1977) {
        var newstx$1978 = mkSyntax$1915(stx$1977, new RegExp(val$1975, flags$1976), parser$1907.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1978.token.literal = val$1975;
        return newstx$1978;
    }
    function makeIdent$1918(val$1979, stx$1980) {
        return mkSyntax$1915(stx$1980, val$1979, parser$1907.Token.Identifier);
    }
    function makeKeyword$1919(val$1981, stx$1982) {
        return mkSyntax$1915(stx$1982, val$1981, parser$1907.Token.Keyword);
    }
    function makePunc$1920(val$1983, stx$1984) {
        return mkSyntax$1915(stx$1984, val$1983, parser$1907.Token.Punctuator);
    }
    function makeDelim$1921(val$1985, inner$1986, stx$1987) {
        return mkSyntax$1915(stx$1987, val$1985, parser$1907.Token.Delimiter, inner$1986);
    }
    function unwrapSyntax$1922(stx$1988) {
        if (Array.isArray(stx$1988) && stx$1988.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1988 = stx$1988[0];
        }
        if (stx$1988.token) {
            if (stx$1988.token.type === parser$1907.Token.Delimiter) {
                return stx$1988.token;
            } else {
                return stx$1988.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1988);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1923(stx$1989) {
        return _$1906.map(stx$1989, function (stx$1990) {
            if (stx$1990.token.inner) {
                stx$1990.token.inner = syntaxToTokens$1923(stx$1990.token.inner);
            }
            return stx$1990.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1924(tokens$1991) {
        if (!_$1906.isArray(tokens$1991)) {
            tokens$1991 = [tokens$1991];
        }
        return _$1906.map(tokens$1991, function (token$1992) {
            if (token$1992.inner) {
                token$1992.inner = tokensToSyntax$1924(token$1992.inner);
            }
            return syntaxFromToken$1914(token$1992);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1925(tojoin$1993, punc$1994) {
        if (tojoin$1993.length === 0) {
            return [];
        }
        if (punc$1994 === ' ') {
            return tojoin$1993;
        }
        return _$1906.reduce(_$1906.rest(tojoin$1993, 1), function (acc$1995, join$1996) {
            acc$1995.push(makePunc$1920(punc$1994, join$1996), join$1996);
            return acc$1995;
        }, [_$1906.first(tojoin$1993)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1926(tojoin$1997, punc$1998) {
        if (tojoin$1997.length === 0) {
            return [];
        }
        if (punc$1998 === ' ') {
            return _$1906.flatten(tojoin$1997, true);
        }
        return _$1906.reduce(_$1906.rest(tojoin$1997, 1), function (acc$1999, join$2000) {
            acc$1999.push(makePunc$1920(punc$1998, _$1906.first(join$2000)));
            Array.prototype.push.apply(acc$1999, join$2000);
            return acc$1999;
        }, _$1906.first(tojoin$1997));
    }
    function MacroSyntaxError$1927(name$2001, message$2002, stx$2003) {
        this.name = name$2001;
        this.message = message$2002;
        this.stx = stx$2003;
    }
    function throwSyntaxError$1928(name$2004, message$2005, stx$2006) {
        if (stx$2006 && Array.isArray(stx$2006)) {
            stx$2006 = stx$2006[0];
        }
        throw new MacroSyntaxError$1927(name$2004, message$2005, stx$2006);
    }
    function printSyntaxError$1929(code$2007, err$2008) {
        if (!err$2008.stx) {
            return '[' + err$2008.name + '] ' + err$2008.message;
        }
        var token$2009 = err$2008.stx.token;
        var lineNumber$2010 = token$2009.sm_startLineNumber || token$2009.sm_lineNumber || token$2009.startLineNumber || token$2009.lineNumber;
        var lineStart$2011 = token$2009.sm_startLineStart || token$2009.sm_lineStart || token$2009.startLineStart || token$2009.lineStart;
        var start$2012 = (token$2009.sm_startRange || token$2009.sm_range || token$2009.startRange || token$2009.range)[0];
        var offset$2013 = start$2012 - lineStart$2011;
        var line$2014 = '';
        var pre$2015 = lineNumber$2010 + ': ';
        var ch$2016;
        while (ch$2016 = code$2007.charAt(lineStart$2011++)) {
            if (ch$2016 == '\r' || ch$2016 == '\n') {
                break;
            }
            line$2014 += ch$2016;
        }
        return '[' + err$2008.name + '] ' + err$2008.message + '\n' + pre$2015 + line$2014 + '\n' + Array(offset$2013 + pre$2015.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1930(stxarr$2017, shouldResolve$2018) {
        var indent$2019 = 0;
        var unparsedLines$2020 = stxarr$2017.reduce(function (acc$2021, stx$2022) {
                var s$2023 = shouldResolve$2018 ? expander$1908.resolve(stx$2022) : stx$2022.token.value;
                // skip the end of file token
                if (stx$2022.token.type === parser$1907.Token.EOF) {
                    return acc$2021;
                }
                if (stx$2022.token.type === parser$1907.Token.StringLiteral) {
                    s$2023 = '"' + s$2023 + '"';
                }
                if (s$2023 == '{') {
                    acc$2021[0].str += ' ' + s$2023;
                    indent$2019++;
                    acc$2021.unshift({
                        indent: indent$2019,
                        str: ''
                    });
                } else if (s$2023 == '}') {
                    indent$2019--;
                    acc$2021.unshift({
                        indent: indent$2019,
                        str: s$2023
                    });
                    acc$2021.unshift({
                        indent: indent$2019,
                        str: ''
                    });
                } else if (s$2023 == ';') {
                    acc$2021[0].str += s$2023;
                    acc$2021.unshift({
                        indent: indent$2019,
                        str: ''
                    });
                } else {
                    acc$2021[0].str += (acc$2021[0].str ? ' ' : '') + s$2023;
                }
                return acc$2021;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2020.reduce(function (acc$2024, line$2025) {
            var ind$2026 = '';
            while (ind$2026.length < line$2025.indent * 2) {
                ind$2026 += ' ';
            }
            return ind$2026 + line$2025.str + '\n' + acc$2024;
        }, '');
    }
    exports$1905.assert = assert$1909;
    exports$1905.unwrapSyntax = unwrapSyntax$1922;
    exports$1905.makeDelim = makeDelim$1921;
    exports$1905.makePunc = makePunc$1920;
    exports$1905.makeKeyword = makeKeyword$1919;
    exports$1905.makeIdent = makeIdent$1918;
    exports$1905.makeRegex = makeRegex$1917;
    exports$1905.makeValue = makeValue$1916;
    exports$1905.Rename = Rename$1910;
    exports$1905.Mark = Mark$1911;
    exports$1905.Def = Def$1912;
    exports$1905.syntaxFromToken = syntaxFromToken$1914;
    exports$1905.tokensToSyntax = tokensToSyntax$1924;
    exports$1905.syntaxToTokens = syntaxToTokens$1923;
    exports$1905.joinSyntax = joinSyntax$1925;
    exports$1905.joinSyntaxArr = joinSyntaxArr$1926;
    exports$1905.prettyPrint = prettyPrint$1930;
    exports$1905.MacroSyntaxError = MacroSyntaxError$1927;
    exports$1905.throwSyntaxError = throwSyntaxError$1928;
    exports$1905.printSyntaxError = printSyntaxError$1929;
}));
//# sourceMappingURL=syntax.js.map