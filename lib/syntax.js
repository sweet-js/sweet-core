(function (root$1916, factory$1917) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1917(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1917);
    }
}(this, function (exports$1918, _$1919, parser$1920, expander$1921) {
    function assert$1922(condition$1944, message$1945) {
        if (!condition$1944) {
            throw new Error('ASSERT: ' + message$1945);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1923(id$1946, name$1947, ctx$1948, defctx$1949) {
        defctx$1949 = defctx$1949 || null;
        this.id = id$1946;
        this.name = name$1947;
        this.context = ctx$1948;
        this.def = defctx$1949;
    }
    // (Num) -> CContext
    function Mark$1924(mark$1950, ctx$1951) {
        this.mark = mark$1950;
        this.context = ctx$1951;
    }
    function Def$1925(defctx$1952, ctx$1953) {
        this.defctx = defctx$1952;
        this.context = ctx$1953;
    }
    function Syntax$1926(token$1954, oldstx$1955) {
        this.token = token$1954;
        this.context = oldstx$1955 && oldstx$1955.context ? oldstx$1955.context : null;
        this.deferredContext = oldstx$1955 && oldstx$1955.deferredContext ? oldstx$1955.deferredContext : null;
    }
    Syntax$1926.prototype = {
        mark: function (newMark$1956) {
            if (this.token.inner) {
                var next$1957 = syntaxFromToken$1927(this.token, this);
                next$1957.deferredContext = new Mark$1924(newMark$1956, this.deferredContext);
                return next$1957;
            }
            return syntaxFromToken$1927(this.token, { context: new Mark$1924(newMark$1956, this.context) });
        },
        rename: function (id$1958, name$1959, defctx$1960) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1961 = syntaxFromToken$1927(this.token, this);
                next$1961.deferredContext = new Rename$1923(id$1958, name$1959, this.deferredContext, defctx$1960);
                return next$1961;
            }
            if (this.token.type === parser$1920.Token.Identifier || this.token.type === parser$1920.Token.Keyword || this.token.type === parser$1920.Token.Punctuator) {
                return syntaxFromToken$1927(this.token, { context: new Rename$1923(id$1958, name$1959, this.context, defctx$1960) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1962) {
            if (this.token.inner) {
                var next$1963 = syntaxFromToken$1927(this.token, this);
                next$1963.deferredContext = new Def$1925(defctx$1962, this.deferredContext);
                return next$1963;
            }
            return syntaxFromToken$1927(this.token, { context: new Def$1925(defctx$1962, this.context) });
        },
        getDefCtx: function () {
            var ctx$1964 = this.context;
            while (ctx$1964 !== null) {
                if (ctx$1964 instanceof Def$1925) {
                    return ctx$1964.defctx;
                }
                ctx$1964 = ctx$1964.context;
            }
            return null;
        },
        expose: function () {
            assert$1922(this.token.type === parser$1920.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1965(stxCtx$1966, ctx$1967) {
                if (ctx$1967 == null) {
                    return stxCtx$1966;
                } else if (ctx$1967 instanceof Rename$1923) {
                    return new Rename$1923(ctx$1967.id, ctx$1967.name, applyContext$1965(stxCtx$1966, ctx$1967.context), ctx$1967.def);
                } else if (ctx$1967 instanceof Mark$1924) {
                    return new Mark$1924(ctx$1967.mark, applyContext$1965(stxCtx$1966, ctx$1967.context));
                } else if (ctx$1967 instanceof Def$1925) {
                    return new Def$1925(ctx$1967.defctx, applyContext$1965(stxCtx$1966, ctx$1967.context));
                } else {
                    assert$1922(false, 'unknown context type');
                }
            }
            this.token.inner = _$1919.map(this.token.inner, _$1919.bind(function (stx$1968) {
                if (stx$1968.token.inner) {
                    var next$1969 = syntaxFromToken$1927(stx$1968.token, stx$1968);
                    next$1969.deferredContext = applyContext$1965(stx$1968.deferredContext, this.deferredContext);
                    return next$1969;
                } else {
                    return syntaxFromToken$1927(stx$1968.token, { context: applyContext$1965(stx$1968.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1970 = this.token.type === parser$1920.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1970 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1927(token$1971, oldstx$1972) {
        return new Syntax$1926(token$1971, oldstx$1972);
    }
    function mkSyntax$1928(stx$1973, value$1974, type$1975, inner$1976) {
        if (stx$1973 && Array.isArray(stx$1973) && stx$1973.length === 1) {
            stx$1973 = stx$1973[0];
        } else if (stx$1973 && Array.isArray(stx$1973)) {
            throwSyntaxError$1941('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1973 === undefined) {
            throwSyntaxError$1941('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1975 === parser$1920.Token.Delimiter) {
            var startLineNumber$1977, startLineStart$1978, endLineNumber$1979, endLineStart$1980, startRange$1981, endRange$1982;
            if (!Array.isArray(inner$1976)) {
                throwSyntaxError$1941('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1973 && stx$1973.token.type === parser$1920.Token.Delimiter) {
                startLineNumber$1977 = stx$1973.token.startLineNumber;
                startLineStart$1978 = stx$1973.token.startLineStart;
                endLineNumber$1979 = stx$1973.token.endLineNumber;
                endLineStart$1980 = stx$1973.token.endLineStart;
                startRange$1981 = stx$1973.token.startRange;
                endRange$1982 = stx$1973.token.endRange;
            } else if (stx$1973 && stx$1973.token) {
                startLineNumber$1977 = stx$1973.token.lineNumber;
                startLineStart$1978 = stx$1973.token.lineStart;
                endLineNumber$1979 = stx$1973.token.lineNumber;
                endLineStart$1980 = stx$1973.token.lineStart;
                startRange$1981 = stx$1973.token.range;
                endRange$1982 = stx$1973.token.range;
            }
            return syntaxFromToken$1927({
                type: parser$1920.Token.Delimiter,
                value: value$1974,
                inner: inner$1976,
                startLineStart: startLineStart$1978,
                startLineNumber: startLineNumber$1977,
                endLineStart: endLineStart$1980,
                endLineNumber: endLineNumber$1979,
                startRange: startRange$1981,
                endRange: endRange$1982
            }, stx$1973);
        } else {
            var lineStart$1983, lineNumber$1984, range$1985;
            if (stx$1973 && stx$1973.token.type === parser$1920.Token.Delimiter) {
                lineStart$1983 = stx$1973.token.startLineStart;
                lineNumber$1984 = stx$1973.token.startLineNumber;
                range$1985 = stx$1973.token.startRange;
            } else if (stx$1973 && stx$1973.token) {
                lineStart$1983 = stx$1973.token.lineStart;
                lineNumber$1984 = stx$1973.token.lineNumber;
                range$1985 = stx$1973.token.range;
            }
            return syntaxFromToken$1927({
                type: type$1975,
                value: value$1974,
                lineStart: lineStart$1983,
                lineNumber: lineNumber$1984,
                range: range$1985
            }, stx$1973);
        }
    }
    function makeValue$1929(val$1986, stx$1987) {
        if (typeof val$1986 === 'boolean') {
            return mkSyntax$1928(stx$1987, val$1986 ? 'true' : 'false', parser$1920.Token.BooleanLiteral);
        } else if (typeof val$1986 === 'number') {
            if (val$1986 !== val$1986) {
                return makeDelim$1934('()', [
                    makeValue$1929(0, stx$1987),
                    makePunc$1933('/', stx$1987),
                    makeValue$1929(0, stx$1987)
                ], stx$1987);
            }
            if (val$1986 < 0) {
                return makeDelim$1934('()', [
                    makePunc$1933('-', stx$1987),
                    makeValue$1929(Math.abs(val$1986), stx$1987)
                ], stx$1987);
            } else {
                return mkSyntax$1928(stx$1987, val$1986, parser$1920.Token.NumericLiteral);
            }
        } else if (typeof val$1986 === 'string') {
            return mkSyntax$1928(stx$1987, val$1986, parser$1920.Token.StringLiteral);
        } else if (val$1986 === null) {
            return mkSyntax$1928(stx$1987, 'null', parser$1920.Token.NullLiteral);
        } else {
            throwSyntaxError$1941('makeValue', 'Cannot make value syntax object from: ' + val$1986);
        }
    }
    function makeRegex$1930(val$1988, flags$1989, stx$1990) {
        var newstx$1991 = mkSyntax$1928(stx$1990, new RegExp(val$1988, flags$1989), parser$1920.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1991.token.literal = val$1988;
        return newstx$1991;
    }
    function makeIdent$1931(val$1992, stx$1993) {
        return mkSyntax$1928(stx$1993, val$1992, parser$1920.Token.Identifier);
    }
    function makeKeyword$1932(val$1994, stx$1995) {
        return mkSyntax$1928(stx$1995, val$1994, parser$1920.Token.Keyword);
    }
    function makePunc$1933(val$1996, stx$1997) {
        return mkSyntax$1928(stx$1997, val$1996, parser$1920.Token.Punctuator);
    }
    function makeDelim$1934(val$1998, inner$1999, stx$2000) {
        return mkSyntax$1928(stx$2000, val$1998, parser$1920.Token.Delimiter, inner$1999);
    }
    function unwrapSyntax$1935(stx$2001) {
        if (Array.isArray(stx$2001) && stx$2001.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2001 = stx$2001[0];
        }
        if (stx$2001.token) {
            if (stx$2001.token.type === parser$1920.Token.Delimiter) {
                return stx$2001.token;
            } else {
                return stx$2001.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2001);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1936(stx$2002) {
        return _$1919.map(stx$2002, function (stx$2003) {
            if (stx$2003.token.inner) {
                stx$2003.token.inner = syntaxToTokens$1936(stx$2003.token.inner);
            }
            return stx$2003.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1937(tokens$2004) {
        if (!_$1919.isArray(tokens$2004)) {
            tokens$2004 = [tokens$2004];
        }
        return _$1919.map(tokens$2004, function (token$2005) {
            if (token$2005.inner) {
                token$2005.inner = tokensToSyntax$1937(token$2005.inner);
            }
            return syntaxFromToken$1927(token$2005);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1938(tojoin$2006, punc$2007) {
        if (tojoin$2006.length === 0) {
            return [];
        }
        if (punc$2007 === ' ') {
            return tojoin$2006;
        }
        return _$1919.reduce(_$1919.rest(tojoin$2006, 1), function (acc$2008, join$2009) {
            acc$2008.push(makePunc$1933(punc$2007, join$2009), join$2009);
            return acc$2008;
        }, [_$1919.first(tojoin$2006)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1939(tojoin$2010, punc$2011) {
        if (tojoin$2010.length === 0) {
            return [];
        }
        if (punc$2011 === ' ') {
            return _$1919.flatten(tojoin$2010, true);
        }
        return _$1919.reduce(_$1919.rest(tojoin$2010, 1), function (acc$2012, join$2013) {
            acc$2012.push(makePunc$1933(punc$2011, _$1919.first(join$2013)));
            Array.prototype.push.apply(acc$2012, join$2013);
            return acc$2012;
        }, _$1919.first(tojoin$2010));
    }
    function MacroSyntaxError$1940(name$2014, message$2015, stx$2016) {
        this.name = name$2014;
        this.message = message$2015;
        this.stx = stx$2016;
    }
    function throwSyntaxError$1941(name$2017, message$2018, stx$2019) {
        if (stx$2019 && Array.isArray(stx$2019)) {
            stx$2019 = stx$2019[0];
        }
        throw new MacroSyntaxError$1940(name$2017, message$2018, stx$2019);
    }
    function printSyntaxError$1942(code$2020, err$2021) {
        if (!err$2021.stx) {
            return '[' + err$2021.name + '] ' + err$2021.message;
        }
        var token$2022 = err$2021.stx.token;
        var lineNumber$2023 = token$2022.sm_startLineNumber || token$2022.sm_lineNumber || token$2022.startLineNumber || token$2022.lineNumber;
        var lineStart$2024 = token$2022.sm_startLineStart || token$2022.sm_lineStart || token$2022.startLineStart || token$2022.lineStart;
        var start$2025 = (token$2022.sm_startRange || token$2022.sm_range || token$2022.startRange || token$2022.range)[0];
        var offset$2026 = start$2025 - lineStart$2024;
        var line$2027 = '';
        var pre$2028 = lineNumber$2023 + ': ';
        var ch$2029;
        while (ch$2029 = code$2020.charAt(lineStart$2024++)) {
            if (ch$2029 == '\r' || ch$2029 == '\n') {
                break;
            }
            line$2027 += ch$2029;
        }
        return '[' + err$2021.name + '] ' + err$2021.message + '\n' + pre$2028 + line$2027 + '\n' + Array(offset$2026 + pre$2028.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1943(stxarr$2030, shouldResolve$2031) {
        var indent$2032 = 0;
        var unparsedLines$2033 = stxarr$2030.reduce(function (acc$2034, stx$2035) {
                var s$2036 = shouldResolve$2031 ? expander$1921.resolve(stx$2035) : stx$2035.token.value;
                // skip the end of file token
                if (stx$2035.token.type === parser$1920.Token.EOF) {
                    return acc$2034;
                }
                if (stx$2035.token.type === parser$1920.Token.StringLiteral) {
                    s$2036 = '"' + s$2036 + '"';
                }
                if (s$2036 == '{') {
                    acc$2034[0].str += ' ' + s$2036;
                    indent$2032++;
                    acc$2034.unshift({
                        indent: indent$2032,
                        str: ''
                    });
                } else if (s$2036 == '}') {
                    indent$2032--;
                    acc$2034.unshift({
                        indent: indent$2032,
                        str: s$2036
                    });
                    acc$2034.unshift({
                        indent: indent$2032,
                        str: ''
                    });
                } else if (s$2036 == ';') {
                    acc$2034[0].str += s$2036;
                    acc$2034.unshift({
                        indent: indent$2032,
                        str: ''
                    });
                } else {
                    acc$2034[0].str += (acc$2034[0].str ? ' ' : '') + s$2036;
                }
                return acc$2034;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2033.reduce(function (acc$2037, line$2038) {
            var ind$2039 = '';
            while (ind$2039.length < line$2038.indent * 2) {
                ind$2039 += ' ';
            }
            return ind$2039 + line$2038.str + '\n' + acc$2037;
        }, '');
    }
    exports$1918.assert = assert$1922;
    exports$1918.unwrapSyntax = unwrapSyntax$1935;
    exports$1918.makeDelim = makeDelim$1934;
    exports$1918.makePunc = makePunc$1933;
    exports$1918.makeKeyword = makeKeyword$1932;
    exports$1918.makeIdent = makeIdent$1931;
    exports$1918.makeRegex = makeRegex$1930;
    exports$1918.makeValue = makeValue$1929;
    exports$1918.Rename = Rename$1923;
    exports$1918.Mark = Mark$1924;
    exports$1918.Def = Def$1925;
    exports$1918.syntaxFromToken = syntaxFromToken$1927;
    exports$1918.tokensToSyntax = tokensToSyntax$1937;
    exports$1918.syntaxToTokens = syntaxToTokens$1936;
    exports$1918.joinSyntax = joinSyntax$1938;
    exports$1918.joinSyntaxArr = joinSyntaxArr$1939;
    exports$1918.prettyPrint = prettyPrint$1943;
    exports$1918.MacroSyntaxError = MacroSyntaxError$1940;
    exports$1918.throwSyntaxError = throwSyntaxError$1941;
    exports$1918.printSyntaxError = printSyntaxError$1942;
}));
//# sourceMappingURL=syntax.js.map