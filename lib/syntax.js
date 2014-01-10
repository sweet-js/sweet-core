(function (root$1908, factory$1909) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1909(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1909);
    }
}(this, function (exports$1910, _$1911, parser$1912, expander$1913) {
    function assert$1914(condition$1936, message$1937) {
        if (!condition$1936) {
            throw new Error('ASSERT: ' + message$1937);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1915(id$1938, name$1939, ctx$1940, defctx$1941) {
        defctx$1941 = defctx$1941 || null;
        this.id = id$1938;
        this.name = name$1939;
        this.context = ctx$1940;
        this.def = defctx$1941;
    }
    // (Num) -> CContext
    function Mark$1916(mark$1942, ctx$1943) {
        this.mark = mark$1942;
        this.context = ctx$1943;
    }
    function Def$1917(defctx$1944, ctx$1945) {
        this.defctx = defctx$1944;
        this.context = ctx$1945;
    }
    function Syntax$1918(token$1946, oldstx$1947) {
        this.token = token$1946;
        this.context = oldstx$1947 && oldstx$1947.context ? oldstx$1947.context : null;
        this.deferredContext = oldstx$1947 && oldstx$1947.deferredContext ? oldstx$1947.deferredContext : null;
    }
    Syntax$1918.prototype = {
        mark: function (newMark$1948) {
            if (this.token.inner) {
                var next$1949 = syntaxFromToken$1919(this.token, this);
                next$1949.deferredContext = new Mark$1916(newMark$1948, this.deferredContext);
                return next$1949;
            }
            return syntaxFromToken$1919(this.token, { context: new Mark$1916(newMark$1948, this.context) });
        },
        rename: function (id$1950, name$1951, defctx$1952) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1953 = syntaxFromToken$1919(this.token, this);
                next$1953.deferredContext = new Rename$1915(id$1950, name$1951, this.deferredContext, defctx$1952);
                return next$1953;
            }
            if (this.token.type === parser$1912.Token.Identifier || this.token.type === parser$1912.Token.Keyword || this.token.type === parser$1912.Token.Punctuator) {
                return syntaxFromToken$1919(this.token, { context: new Rename$1915(id$1950, name$1951, this.context, defctx$1952) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1954) {
            if (this.token.inner) {
                var next$1955 = syntaxFromToken$1919(this.token, this);
                next$1955.deferredContext = new Def$1917(defctx$1954, this.deferredContext);
                return next$1955;
            }
            return syntaxFromToken$1919(this.token, { context: new Def$1917(defctx$1954, this.context) });
        },
        getDefCtx: function () {
            var ctx$1956 = this.context;
            while (ctx$1956 !== null) {
                if (ctx$1956 instanceof Def$1917) {
                    return ctx$1956.defctx;
                }
                ctx$1956 = ctx$1956.context;
            }
            return null;
        },
        expose: function () {
            assert$1914(this.token.type === parser$1912.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1957(stxCtx$1958, ctx$1959) {
                if (ctx$1959 == null) {
                    return stxCtx$1958;
                } else if (ctx$1959 instanceof Rename$1915) {
                    return new Rename$1915(ctx$1959.id, ctx$1959.name, applyContext$1957(stxCtx$1958, ctx$1959.context), ctx$1959.def);
                } else if (ctx$1959 instanceof Mark$1916) {
                    return new Mark$1916(ctx$1959.mark, applyContext$1957(stxCtx$1958, ctx$1959.context));
                } else if (ctx$1959 instanceof Def$1917) {
                    return new Def$1917(ctx$1959.defctx, applyContext$1957(stxCtx$1958, ctx$1959.context));
                } else {
                    assert$1914(false, 'unknown context type');
                }
            }
            this.token.inner = _$1911.map(this.token.inner, _$1911.bind(function (stx$1960) {
                if (stx$1960.token.inner) {
                    var next$1961 = syntaxFromToken$1919(stx$1960.token, stx$1960);
                    next$1961.deferredContext = applyContext$1957(stx$1960.deferredContext, this.deferredContext);
                    return next$1961;
                } else {
                    return syntaxFromToken$1919(stx$1960.token, { context: applyContext$1957(stx$1960.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1962 = this.token.type === parser$1912.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1962 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1919(token$1963, oldstx$1964) {
        return new Syntax$1918(token$1963, oldstx$1964);
    }
    function mkSyntax$1920(stx$1965, value$1966, type$1967, inner$1968) {
        if (stx$1965 && Array.isArray(stx$1965) && stx$1965.length === 1) {
            stx$1965 = stx$1965[0];
        } else if (stx$1965 && Array.isArray(stx$1965)) {
            throwSyntaxError$1933('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1965 === undefined) {
            throwSyntaxError$1933('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1967 === parser$1912.Token.Delimiter) {
            var startLineNumber$1969, startLineStart$1970, endLineNumber$1971, endLineStart$1972, startRange$1973, endRange$1974;
            if (!Array.isArray(inner$1968)) {
                throwSyntaxError$1933('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1965 && stx$1965.token.type === parser$1912.Token.Delimiter) {
                startLineNumber$1969 = stx$1965.token.startLineNumber;
                startLineStart$1970 = stx$1965.token.startLineStart;
                endLineNumber$1971 = stx$1965.token.endLineNumber;
                endLineStart$1972 = stx$1965.token.endLineStart;
                startRange$1973 = stx$1965.token.startRange;
                endRange$1974 = stx$1965.token.endRange;
            } else if (stx$1965 && stx$1965.token) {
                startLineNumber$1969 = stx$1965.token.lineNumber;
                startLineStart$1970 = stx$1965.token.lineStart;
                endLineNumber$1971 = stx$1965.token.lineNumber;
                endLineStart$1972 = stx$1965.token.lineStart;
                startRange$1973 = stx$1965.token.range;
                endRange$1974 = stx$1965.token.range;
            }
            return syntaxFromToken$1919({
                type: parser$1912.Token.Delimiter,
                value: value$1966,
                inner: inner$1968,
                startLineStart: startLineStart$1970,
                startLineNumber: startLineNumber$1969,
                endLineStart: endLineStart$1972,
                endLineNumber: endLineNumber$1971,
                startRange: startRange$1973,
                endRange: endRange$1974
            }, stx$1965);
        } else {
            var lineStart$1975, lineNumber$1976, range$1977;
            if (stx$1965 && stx$1965.token.type === parser$1912.Token.Delimiter) {
                lineStart$1975 = stx$1965.token.startLineStart;
                lineNumber$1976 = stx$1965.token.startLineNumber;
                range$1977 = stx$1965.token.startRange;
            } else if (stx$1965 && stx$1965.token) {
                lineStart$1975 = stx$1965.token.lineStart;
                lineNumber$1976 = stx$1965.token.lineNumber;
                range$1977 = stx$1965.token.range;
            }
            return syntaxFromToken$1919({
                type: type$1967,
                value: value$1966,
                lineStart: lineStart$1975,
                lineNumber: lineNumber$1976,
                range: range$1977
            }, stx$1965);
        }
    }
    function makeValue$1921(val$1978, stx$1979) {
        if (typeof val$1978 === 'boolean') {
            return mkSyntax$1920(stx$1979, val$1978 ? 'true' : 'false', parser$1912.Token.BooleanLiteral);
        } else if (typeof val$1978 === 'number') {
            if (val$1978 !== val$1978) {
                return makeDelim$1926('()', [
                    makeValue$1921(0, stx$1979),
                    makePunc$1925('/', stx$1979),
                    makeValue$1921(0, stx$1979)
                ], stx$1979);
            }
            if (val$1978 < 0) {
                return makeDelim$1926('()', [
                    makePunc$1925('-', stx$1979),
                    makeValue$1921(Math.abs(val$1978), stx$1979)
                ], stx$1979);
            } else {
                return mkSyntax$1920(stx$1979, val$1978, parser$1912.Token.NumericLiteral);
            }
        } else if (typeof val$1978 === 'string') {
            return mkSyntax$1920(stx$1979, val$1978, parser$1912.Token.StringLiteral);
        } else if (val$1978 === null) {
            return mkSyntax$1920(stx$1979, 'null', parser$1912.Token.NullLiteral);
        } else {
            throwSyntaxError$1933('makeValue', 'Cannot make value syntax object from: ' + val$1978);
        }
    }
    function makeRegex$1922(val$1980, flags$1981, stx$1982) {
        var newstx$1983 = mkSyntax$1920(stx$1982, new RegExp(val$1980, flags$1981), parser$1912.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1983.token.literal = val$1980;
        return newstx$1983;
    }
    function makeIdent$1923(val$1984, stx$1985) {
        return mkSyntax$1920(stx$1985, val$1984, parser$1912.Token.Identifier);
    }
    function makeKeyword$1924(val$1986, stx$1987) {
        return mkSyntax$1920(stx$1987, val$1986, parser$1912.Token.Keyword);
    }
    function makePunc$1925(val$1988, stx$1989) {
        return mkSyntax$1920(stx$1989, val$1988, parser$1912.Token.Punctuator);
    }
    function makeDelim$1926(val$1990, inner$1991, stx$1992) {
        return mkSyntax$1920(stx$1992, val$1990, parser$1912.Token.Delimiter, inner$1991);
    }
    function unwrapSyntax$1927(stx$1993) {
        if (Array.isArray(stx$1993) && stx$1993.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1993 = stx$1993[0];
        }
        if (stx$1993.token) {
            if (stx$1993.token.type === parser$1912.Token.Delimiter) {
                return stx$1993.token;
            } else {
                return stx$1993.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1993);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1928(stx$1994) {
        return _$1911.map(stx$1994, function (stx$1995) {
            if (stx$1995.token.inner) {
                stx$1995.token.inner = syntaxToTokens$1928(stx$1995.token.inner);
            }
            return stx$1995.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1929(tokens$1996) {
        if (!_$1911.isArray(tokens$1996)) {
            tokens$1996 = [tokens$1996];
        }
        return _$1911.map(tokens$1996, function (token$1997) {
            if (token$1997.inner) {
                token$1997.inner = tokensToSyntax$1929(token$1997.inner);
            }
            return syntaxFromToken$1919(token$1997);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1930(tojoin$1998, punc$1999) {
        if (tojoin$1998.length === 0) {
            return [];
        }
        if (punc$1999 === ' ') {
            return tojoin$1998;
        }
        return _$1911.reduce(_$1911.rest(tojoin$1998, 1), function (acc$2000, join$2001) {
            acc$2000.push(makePunc$1925(punc$1999, join$2001), join$2001);
            return acc$2000;
        }, [_$1911.first(tojoin$1998)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1931(tojoin$2002, punc$2003) {
        if (tojoin$2002.length === 0) {
            return [];
        }
        if (punc$2003 === ' ') {
            return _$1911.flatten(tojoin$2002, true);
        }
        return _$1911.reduce(_$1911.rest(tojoin$2002, 1), function (acc$2004, join$2005) {
            acc$2004.push(makePunc$1925(punc$2003, _$1911.first(join$2005)));
            Array.prototype.push.apply(acc$2004, join$2005);
            return acc$2004;
        }, _$1911.first(tojoin$2002));
    }
    function MacroSyntaxError$1932(name$2006, message$2007, stx$2008) {
        this.name = name$2006;
        this.message = message$2007;
        this.stx = stx$2008;
    }
    function throwSyntaxError$1933(name$2009, message$2010, stx$2011) {
        if (stx$2011 && Array.isArray(stx$2011)) {
            stx$2011 = stx$2011[0];
        }
        throw new MacroSyntaxError$1932(name$2009, message$2010, stx$2011);
    }
    function printSyntaxError$1934(code$2012, err$2013) {
        if (!err$2013.stx) {
            return '[' + err$2013.name + '] ' + err$2013.message;
        }
        var token$2014 = err$2013.stx.token;
        var lineNumber$2015 = token$2014.sm_startLineNumber || token$2014.sm_lineNumber || token$2014.startLineNumber || token$2014.lineNumber;
        var lineStart$2016 = token$2014.sm_startLineStart || token$2014.sm_lineStart || token$2014.startLineStart || token$2014.lineStart;
        var start$2017 = (token$2014.sm_startRange || token$2014.sm_range || token$2014.startRange || token$2014.range)[0];
        var offset$2018 = start$2017 - lineStart$2016;
        var line$2019 = '';
        var pre$2020 = lineNumber$2015 + ': ';
        var ch$2021;
        while (ch$2021 = code$2012.charAt(lineStart$2016++)) {
            if (ch$2021 == '\r' || ch$2021 == '\n') {
                break;
            }
            line$2019 += ch$2021;
        }
        return '[' + err$2013.name + '] ' + err$2013.message + '\n' + pre$2020 + line$2019 + '\n' + Array(offset$2018 + pre$2020.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1935(stxarr$2022, shouldResolve$2023) {
        var indent$2024 = 0;
        var unparsedLines$2025 = stxarr$2022.reduce(function (acc$2026, stx$2027) {
                var s$2028 = shouldResolve$2023 ? expander$1913.resolve(stx$2027) : stx$2027.token.value;
                // skip the end of file token
                if (stx$2027.token.type === parser$1912.Token.EOF) {
                    return acc$2026;
                }
                if (stx$2027.token.type === parser$1912.Token.StringLiteral) {
                    s$2028 = '"' + s$2028 + '"';
                }
                if (s$2028 == '{') {
                    acc$2026[0].str += ' ' + s$2028;
                    indent$2024++;
                    acc$2026.unshift({
                        indent: indent$2024,
                        str: ''
                    });
                } else if (s$2028 == '}') {
                    indent$2024--;
                    acc$2026.unshift({
                        indent: indent$2024,
                        str: s$2028
                    });
                    acc$2026.unshift({
                        indent: indent$2024,
                        str: ''
                    });
                } else if (s$2028 == ';') {
                    acc$2026[0].str += s$2028;
                    acc$2026.unshift({
                        indent: indent$2024,
                        str: ''
                    });
                } else {
                    acc$2026[0].str += (acc$2026[0].str ? ' ' : '') + s$2028;
                }
                return acc$2026;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2025.reduce(function (acc$2029, line$2030) {
            var ind$2031 = '';
            while (ind$2031.length < line$2030.indent * 2) {
                ind$2031 += ' ';
            }
            return ind$2031 + line$2030.str + '\n' + acc$2029;
        }, '');
    }
    exports$1910.assert = assert$1914;
    exports$1910.unwrapSyntax = unwrapSyntax$1927;
    exports$1910.makeDelim = makeDelim$1926;
    exports$1910.makePunc = makePunc$1925;
    exports$1910.makeKeyword = makeKeyword$1924;
    exports$1910.makeIdent = makeIdent$1923;
    exports$1910.makeRegex = makeRegex$1922;
    exports$1910.makeValue = makeValue$1921;
    exports$1910.Rename = Rename$1915;
    exports$1910.Mark = Mark$1916;
    exports$1910.Def = Def$1917;
    exports$1910.syntaxFromToken = syntaxFromToken$1919;
    exports$1910.tokensToSyntax = tokensToSyntax$1929;
    exports$1910.syntaxToTokens = syntaxToTokens$1928;
    exports$1910.joinSyntax = joinSyntax$1930;
    exports$1910.joinSyntaxArr = joinSyntaxArr$1931;
    exports$1910.prettyPrint = prettyPrint$1935;
    exports$1910.MacroSyntaxError = MacroSyntaxError$1932;
    exports$1910.throwSyntaxError = throwSyntaxError$1933;
    exports$1910.printSyntaxError = printSyntaxError$1934;
}));
//# sourceMappingURL=syntax.js.map