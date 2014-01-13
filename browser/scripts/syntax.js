(function (root$1924, factory$1925) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1925(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1925);
    }
}(this, function (exports$1926, _$1927, parser$1928, expander$1929) {
    function assert$1930(condition$1952, message$1953) {
        if (!condition$1952) {
            throw new Error('ASSERT: ' + message$1953);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1931(id$1954, name$1955, ctx$1956, defctx$1957) {
        defctx$1957 = defctx$1957 || null;
        this.id = id$1954;
        this.name = name$1955;
        this.context = ctx$1956;
        this.def = defctx$1957;
    }
    // (Num) -> CContext
    function Mark$1932(mark$1958, ctx$1959) {
        this.mark = mark$1958;
        this.context = ctx$1959;
    }
    function Def$1933(defctx$1960, ctx$1961) {
        this.defctx = defctx$1960;
        this.context = ctx$1961;
    }
    function Syntax$1934(token$1962, oldstx$1963) {
        this.token = token$1962;
        this.context = oldstx$1963 && oldstx$1963.context ? oldstx$1963.context : null;
        this.deferredContext = oldstx$1963 && oldstx$1963.deferredContext ? oldstx$1963.deferredContext : null;
    }
    Syntax$1934.prototype = {
        mark: function (newMark$1964) {
            if (this.token.inner) {
                var next$1965 = syntaxFromToken$1935(this.token, this);
                next$1965.deferredContext = new Mark$1932(newMark$1964, this.deferredContext);
                return next$1965;
            }
            return syntaxFromToken$1935(this.token, { context: new Mark$1932(newMark$1964, this.context) });
        },
        rename: function (id$1966, name$1967, defctx$1968) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1969 = syntaxFromToken$1935(this.token, this);
                next$1969.deferredContext = new Rename$1931(id$1966, name$1967, this.deferredContext, defctx$1968);
                return next$1969;
            }
            if (this.token.type === parser$1928.Token.Identifier || this.token.type === parser$1928.Token.Keyword || this.token.type === parser$1928.Token.Punctuator) {
                return syntaxFromToken$1935(this.token, { context: new Rename$1931(id$1966, name$1967, this.context, defctx$1968) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1970) {
            if (this.token.inner) {
                var next$1971 = syntaxFromToken$1935(this.token, this);
                next$1971.deferredContext = new Def$1933(defctx$1970, this.deferredContext);
                return next$1971;
            }
            return syntaxFromToken$1935(this.token, { context: new Def$1933(defctx$1970, this.context) });
        },
        getDefCtx: function () {
            var ctx$1972 = this.context;
            while (ctx$1972 !== null) {
                if (ctx$1972 instanceof Def$1933) {
                    return ctx$1972.defctx;
                }
                ctx$1972 = ctx$1972.context;
            }
            return null;
        },
        expose: function () {
            assert$1930(this.token.type === parser$1928.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1973(stxCtx$1974, ctx$1975) {
                if (ctx$1975 == null) {
                    return stxCtx$1974;
                } else if (ctx$1975 instanceof Rename$1931) {
                    return new Rename$1931(ctx$1975.id, ctx$1975.name, applyContext$1973(stxCtx$1974, ctx$1975.context), ctx$1975.def);
                } else if (ctx$1975 instanceof Mark$1932) {
                    return new Mark$1932(ctx$1975.mark, applyContext$1973(stxCtx$1974, ctx$1975.context));
                } else if (ctx$1975 instanceof Def$1933) {
                    return new Def$1933(ctx$1975.defctx, applyContext$1973(stxCtx$1974, ctx$1975.context));
                } else {
                    assert$1930(false, 'unknown context type');
                }
            }
            this.token.inner = _$1927.map(this.token.inner, _$1927.bind(function (stx$1976) {
                if (stx$1976.token.inner) {
                    var next$1977 = syntaxFromToken$1935(stx$1976.token, stx$1976);
                    next$1977.deferredContext = applyContext$1973(stx$1976.deferredContext, this.deferredContext);
                    return next$1977;
                } else {
                    return syntaxFromToken$1935(stx$1976.token, { context: applyContext$1973(stx$1976.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1978 = this.token.type === parser$1928.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1978 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1935(token$1979, oldstx$1980) {
        return new Syntax$1934(token$1979, oldstx$1980);
    }
    function mkSyntax$1936(stx$1981, value$1982, type$1983, inner$1984) {
        if (stx$1981 && Array.isArray(stx$1981) && stx$1981.length === 1) {
            stx$1981 = stx$1981[0];
        } else if (stx$1981 && Array.isArray(stx$1981)) {
            throwSyntaxError$1949('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1981 === undefined) {
            throwSyntaxError$1949('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1983 === parser$1928.Token.Delimiter) {
            var startLineNumber$1985, startLineStart$1986, endLineNumber$1987, endLineStart$1988, startRange$1989, endRange$1990;
            if (!Array.isArray(inner$1984)) {
                throwSyntaxError$1949('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1981 && stx$1981.token.type === parser$1928.Token.Delimiter) {
                startLineNumber$1985 = stx$1981.token.startLineNumber;
                startLineStart$1986 = stx$1981.token.startLineStart;
                endLineNumber$1987 = stx$1981.token.endLineNumber;
                endLineStart$1988 = stx$1981.token.endLineStart;
                startRange$1989 = stx$1981.token.startRange;
                endRange$1990 = stx$1981.token.endRange;
            } else if (stx$1981 && stx$1981.token) {
                startLineNumber$1985 = stx$1981.token.lineNumber;
                startLineStart$1986 = stx$1981.token.lineStart;
                endLineNumber$1987 = stx$1981.token.lineNumber;
                endLineStart$1988 = stx$1981.token.lineStart;
                startRange$1989 = stx$1981.token.range;
                endRange$1990 = stx$1981.token.range;
            }
            return syntaxFromToken$1935({
                type: parser$1928.Token.Delimiter,
                value: value$1982,
                inner: inner$1984,
                startLineStart: startLineStart$1986,
                startLineNumber: startLineNumber$1985,
                endLineStart: endLineStart$1988,
                endLineNumber: endLineNumber$1987,
                startRange: startRange$1989,
                endRange: endRange$1990
            }, stx$1981);
        } else {
            var lineStart$1991, lineNumber$1992, range$1993;
            if (stx$1981 && stx$1981.token.type === parser$1928.Token.Delimiter) {
                lineStart$1991 = stx$1981.token.startLineStart;
                lineNumber$1992 = stx$1981.token.startLineNumber;
                range$1993 = stx$1981.token.startRange;
            } else if (stx$1981 && stx$1981.token) {
                lineStart$1991 = stx$1981.token.lineStart;
                lineNumber$1992 = stx$1981.token.lineNumber;
                range$1993 = stx$1981.token.range;
            }
            return syntaxFromToken$1935({
                type: type$1983,
                value: value$1982,
                lineStart: lineStart$1991,
                lineNumber: lineNumber$1992,
                range: range$1993
            }, stx$1981);
        }
    }
    function makeValue$1937(val$1994, stx$1995) {
        if (typeof val$1994 === 'boolean') {
            return mkSyntax$1936(stx$1995, val$1994 ? 'true' : 'false', parser$1928.Token.BooleanLiteral);
        } else if (typeof val$1994 === 'number') {
            if (val$1994 !== val$1994) {
                return makeDelim$1942('()', [
                    makeValue$1937(0, stx$1995),
                    makePunc$1941('/', stx$1995),
                    makeValue$1937(0, stx$1995)
                ], stx$1995);
            }
            if (val$1994 < 0) {
                return makeDelim$1942('()', [
                    makePunc$1941('-', stx$1995),
                    makeValue$1937(Math.abs(val$1994), stx$1995)
                ], stx$1995);
            } else {
                return mkSyntax$1936(stx$1995, val$1994, parser$1928.Token.NumericLiteral);
            }
        } else if (typeof val$1994 === 'string') {
            return mkSyntax$1936(stx$1995, val$1994, parser$1928.Token.StringLiteral);
        } else if (val$1994 === null) {
            return mkSyntax$1936(stx$1995, 'null', parser$1928.Token.NullLiteral);
        } else {
            throwSyntaxError$1949('makeValue', 'Cannot make value syntax object from: ' + val$1994);
        }
    }
    function makeRegex$1938(val$1996, flags$1997, stx$1998) {
        var newstx$1999 = mkSyntax$1936(stx$1998, new RegExp(val$1996, flags$1997), parser$1928.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1999.token.literal = val$1996;
        return newstx$1999;
    }
    function makeIdent$1939(val$2000, stx$2001) {
        return mkSyntax$1936(stx$2001, val$2000, parser$1928.Token.Identifier);
    }
    function makeKeyword$1940(val$2002, stx$2003) {
        return mkSyntax$1936(stx$2003, val$2002, parser$1928.Token.Keyword);
    }
    function makePunc$1941(val$2004, stx$2005) {
        return mkSyntax$1936(stx$2005, val$2004, parser$1928.Token.Punctuator);
    }
    function makeDelim$1942(val$2006, inner$2007, stx$2008) {
        return mkSyntax$1936(stx$2008, val$2006, parser$1928.Token.Delimiter, inner$2007);
    }
    function unwrapSyntax$1943(stx$2009) {
        if (Array.isArray(stx$2009) && stx$2009.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2009 = stx$2009[0];
        }
        if (stx$2009.token) {
            if (stx$2009.token.type === parser$1928.Token.Delimiter) {
                return stx$2009.token;
            } else {
                return stx$2009.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2009);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1944(stx$2010) {
        return _$1927.map(stx$2010, function (stx$2011) {
            if (stx$2011.token.inner) {
                stx$2011.token.inner = syntaxToTokens$1944(stx$2011.token.inner);
            }
            return stx$2011.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1945(tokens$2012) {
        if (!_$1927.isArray(tokens$2012)) {
            tokens$2012 = [tokens$2012];
        }
        return _$1927.map(tokens$2012, function (token$2013) {
            if (token$2013.inner) {
                token$2013.inner = tokensToSyntax$1945(token$2013.inner);
            }
            return syntaxFromToken$1935(token$2013);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1946(tojoin$2014, punc$2015) {
        if (tojoin$2014.length === 0) {
            return [];
        }
        if (punc$2015 === ' ') {
            return tojoin$2014;
        }
        return _$1927.reduce(_$1927.rest(tojoin$2014, 1), function (acc$2016, join$2017) {
            acc$2016.push(makePunc$1941(punc$2015, join$2017), join$2017);
            return acc$2016;
        }, [_$1927.first(tojoin$2014)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1947(tojoin$2018, punc$2019) {
        if (tojoin$2018.length === 0) {
            return [];
        }
        if (punc$2019 === ' ') {
            return _$1927.flatten(tojoin$2018, true);
        }
        return _$1927.reduce(_$1927.rest(tojoin$2018, 1), function (acc$2020, join$2021) {
            acc$2020.push(makePunc$1941(punc$2019, _$1927.first(join$2021)));
            Array.prototype.push.apply(acc$2020, join$2021);
            return acc$2020;
        }, _$1927.first(tojoin$2018));
    }
    function MacroSyntaxError$1948(name$2022, message$2023, stx$2024) {
        this.name = name$2022;
        this.message = message$2023;
        this.stx = stx$2024;
    }
    function throwSyntaxError$1949(name$2025, message$2026, stx$2027) {
        if (stx$2027 && Array.isArray(stx$2027)) {
            stx$2027 = stx$2027[0];
        }
        throw new MacroSyntaxError$1948(name$2025, message$2026, stx$2027);
    }
    function printSyntaxError$1950(code$2028, err$2029) {
        if (!err$2029.stx) {
            return '[' + err$2029.name + '] ' + err$2029.message;
        }
        var token$2030 = err$2029.stx.token;
        var lineNumber$2031 = token$2030.sm_startLineNumber || token$2030.sm_lineNumber || token$2030.startLineNumber || token$2030.lineNumber;
        var lineStart$2032 = token$2030.sm_startLineStart || token$2030.sm_lineStart || token$2030.startLineStart || token$2030.lineStart;
        var start$2033 = (token$2030.sm_startRange || token$2030.sm_range || token$2030.startRange || token$2030.range)[0];
        var offset$2034 = start$2033 - lineStart$2032;
        var line$2035 = '';
        var pre$2036 = lineNumber$2031 + ': ';
        var ch$2037;
        while (ch$2037 = code$2028.charAt(lineStart$2032++)) {
            if (ch$2037 == '\r' || ch$2037 == '\n') {
                break;
            }
            line$2035 += ch$2037;
        }
        return '[' + err$2029.name + '] ' + err$2029.message + '\n' + pre$2036 + line$2035 + '\n' + Array(offset$2034 + pre$2036.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1951(stxarr$2038, shouldResolve$2039) {
        var indent$2040 = 0;
        var unparsedLines$2041 = stxarr$2038.reduce(function (acc$2042, stx$2043) {
                var s$2044 = shouldResolve$2039 ? expander$1929.resolve(stx$2043) : stx$2043.token.value;
                // skip the end of file token
                if (stx$2043.token.type === parser$1928.Token.EOF) {
                    return acc$2042;
                }
                if (stx$2043.token.type === parser$1928.Token.StringLiteral) {
                    s$2044 = '"' + s$2044 + '"';
                }
                if (s$2044 == '{') {
                    acc$2042[0].str += ' ' + s$2044;
                    indent$2040++;
                    acc$2042.unshift({
                        indent: indent$2040,
                        str: ''
                    });
                } else if (s$2044 == '}') {
                    indent$2040--;
                    acc$2042.unshift({
                        indent: indent$2040,
                        str: s$2044
                    });
                    acc$2042.unshift({
                        indent: indent$2040,
                        str: ''
                    });
                } else if (s$2044 == ';') {
                    acc$2042[0].str += s$2044;
                    acc$2042.unshift({
                        indent: indent$2040,
                        str: ''
                    });
                } else {
                    acc$2042[0].str += (acc$2042[0].str ? ' ' : '') + s$2044;
                }
                return acc$2042;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2041.reduce(function (acc$2045, line$2046) {
            var ind$2047 = '';
            while (ind$2047.length < line$2046.indent * 2) {
                ind$2047 += ' ';
            }
            return ind$2047 + line$2046.str + '\n' + acc$2045;
        }, '');
    }
    exports$1926.assert = assert$1930;
    exports$1926.unwrapSyntax = unwrapSyntax$1943;
    exports$1926.makeDelim = makeDelim$1942;
    exports$1926.makePunc = makePunc$1941;
    exports$1926.makeKeyword = makeKeyword$1940;
    exports$1926.makeIdent = makeIdent$1939;
    exports$1926.makeRegex = makeRegex$1938;
    exports$1926.makeValue = makeValue$1937;
    exports$1926.Rename = Rename$1931;
    exports$1926.Mark = Mark$1932;
    exports$1926.Def = Def$1933;
    exports$1926.syntaxFromToken = syntaxFromToken$1935;
    exports$1926.tokensToSyntax = tokensToSyntax$1945;
    exports$1926.syntaxToTokens = syntaxToTokens$1944;
    exports$1926.joinSyntax = joinSyntax$1946;
    exports$1926.joinSyntaxArr = joinSyntaxArr$1947;
    exports$1926.prettyPrint = prettyPrint$1951;
    exports$1926.MacroSyntaxError = MacroSyntaxError$1948;
    exports$1926.throwSyntaxError = throwSyntaxError$1949;
    exports$1926.printSyntaxError = printSyntaxError$1950;
}));
//# sourceMappingURL=syntax.js.map