(function (root$1918, factory$1919) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1919(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1919);
    }
}(this, function (exports$1920, _$1921, parser$1922, expander$1923) {
    function assert$1924(condition$1946, message$1947) {
        if (!condition$1946) {
            throw new Error('ASSERT: ' + message$1947);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1925(id$1948, name$1949, ctx$1950, defctx$1951) {
        defctx$1951 = defctx$1951 || null;
        this.id = id$1948;
        this.name = name$1949;
        this.context = ctx$1950;
        this.def = defctx$1951;
    }
    // (Num) -> CContext
    function Mark$1926(mark$1952, ctx$1953) {
        this.mark = mark$1952;
        this.context = ctx$1953;
    }
    function Def$1927(defctx$1954, ctx$1955) {
        this.defctx = defctx$1954;
        this.context = ctx$1955;
    }
    function Syntax$1928(token$1956, oldstx$1957) {
        this.token = token$1956;
        this.context = oldstx$1957 && oldstx$1957.context ? oldstx$1957.context : null;
        this.deferredContext = oldstx$1957 && oldstx$1957.deferredContext ? oldstx$1957.deferredContext : null;
    }
    Syntax$1928.prototype = {
        mark: function (newMark$1958) {
            if (this.token.inner) {
                var next$1959 = syntaxFromToken$1929(this.token, this);
                next$1959.deferredContext = new Mark$1926(newMark$1958, this.deferredContext);
                return next$1959;
            }
            return syntaxFromToken$1929(this.token, { context: new Mark$1926(newMark$1958, this.context) });
        },
        rename: function (id$1960, name$1961, defctx$1962) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1963 = syntaxFromToken$1929(this.token, this);
                next$1963.deferredContext = new Rename$1925(id$1960, name$1961, this.deferredContext, defctx$1962);
                return next$1963;
            }
            if (this.token.type === parser$1922.Token.Identifier || this.token.type === parser$1922.Token.Keyword || this.token.type === parser$1922.Token.Punctuator) {
                return syntaxFromToken$1929(this.token, { context: new Rename$1925(id$1960, name$1961, this.context, defctx$1962) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1964) {
            if (this.token.inner) {
                var next$1965 = syntaxFromToken$1929(this.token, this);
                next$1965.deferredContext = new Def$1927(defctx$1964, this.deferredContext);
                return next$1965;
            }
            return syntaxFromToken$1929(this.token, { context: new Def$1927(defctx$1964, this.context) });
        },
        getDefCtx: function () {
            var ctx$1966 = this.context;
            while (ctx$1966 !== null) {
                if (ctx$1966 instanceof Def$1927) {
                    return ctx$1966.defctx;
                }
                ctx$1966 = ctx$1966.context;
            }
            return null;
        },
        expose: function () {
            assert$1924(this.token.type === parser$1922.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1967(stxCtx$1968, ctx$1969) {
                if (ctx$1969 == null) {
                    return stxCtx$1968;
                } else if (ctx$1969 instanceof Rename$1925) {
                    return new Rename$1925(ctx$1969.id, ctx$1969.name, applyContext$1967(stxCtx$1968, ctx$1969.context), ctx$1969.def);
                } else if (ctx$1969 instanceof Mark$1926) {
                    return new Mark$1926(ctx$1969.mark, applyContext$1967(stxCtx$1968, ctx$1969.context));
                } else if (ctx$1969 instanceof Def$1927) {
                    return new Def$1927(ctx$1969.defctx, applyContext$1967(stxCtx$1968, ctx$1969.context));
                } else {
                    assert$1924(false, 'unknown context type');
                }
            }
            this.token.inner = _$1921.map(this.token.inner, _$1921.bind(function (stx$1970) {
                if (stx$1970.token.inner) {
                    var next$1971 = syntaxFromToken$1929(stx$1970.token, stx$1970);
                    next$1971.deferredContext = applyContext$1967(stx$1970.deferredContext, this.deferredContext);
                    return next$1971;
                } else {
                    return syntaxFromToken$1929(stx$1970.token, { context: applyContext$1967(stx$1970.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1972 = this.token.type === parser$1922.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1972 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1929(token$1973, oldstx$1974) {
        return new Syntax$1928(token$1973, oldstx$1974);
    }
    function mkSyntax$1930(stx$1975, value$1976, type$1977, inner$1978) {
        if (stx$1975 && Array.isArray(stx$1975) && stx$1975.length === 1) {
            stx$1975 = stx$1975[0];
        } else if (stx$1975 && Array.isArray(stx$1975)) {
            throwSyntaxError$1943('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1975 === undefined) {
            throwSyntaxError$1943('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1977 === parser$1922.Token.Delimiter) {
            var startLineNumber$1979, startLineStart$1980, endLineNumber$1981, endLineStart$1982, startRange$1983, endRange$1984;
            if (!Array.isArray(inner$1978)) {
                throwSyntaxError$1943('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1975 && stx$1975.token.type === parser$1922.Token.Delimiter) {
                startLineNumber$1979 = stx$1975.token.startLineNumber;
                startLineStart$1980 = stx$1975.token.startLineStart;
                endLineNumber$1981 = stx$1975.token.endLineNumber;
                endLineStart$1982 = stx$1975.token.endLineStart;
                startRange$1983 = stx$1975.token.startRange;
                endRange$1984 = stx$1975.token.endRange;
            } else if (stx$1975 && stx$1975.token) {
                startLineNumber$1979 = stx$1975.token.lineNumber;
                startLineStart$1980 = stx$1975.token.lineStart;
                endLineNumber$1981 = stx$1975.token.lineNumber;
                endLineStart$1982 = stx$1975.token.lineStart;
                startRange$1983 = stx$1975.token.range;
                endRange$1984 = stx$1975.token.range;
            }
            return syntaxFromToken$1929({
                type: parser$1922.Token.Delimiter,
                value: value$1976,
                inner: inner$1978,
                startLineStart: startLineStart$1980,
                startLineNumber: startLineNumber$1979,
                endLineStart: endLineStart$1982,
                endLineNumber: endLineNumber$1981,
                startRange: startRange$1983,
                endRange: endRange$1984
            }, stx$1975);
        } else {
            var lineStart$1985, lineNumber$1986, range$1987;
            if (stx$1975 && stx$1975.token.type === parser$1922.Token.Delimiter) {
                lineStart$1985 = stx$1975.token.startLineStart;
                lineNumber$1986 = stx$1975.token.startLineNumber;
                range$1987 = stx$1975.token.startRange;
            } else if (stx$1975 && stx$1975.token) {
                lineStart$1985 = stx$1975.token.lineStart;
                lineNumber$1986 = stx$1975.token.lineNumber;
                range$1987 = stx$1975.token.range;
            }
            return syntaxFromToken$1929({
                type: type$1977,
                value: value$1976,
                lineStart: lineStart$1985,
                lineNumber: lineNumber$1986,
                range: range$1987
            }, stx$1975);
        }
    }
    function makeValue$1931(val$1988, stx$1989) {
        if (typeof val$1988 === 'boolean') {
            return mkSyntax$1930(stx$1989, val$1988 ? 'true' : 'false', parser$1922.Token.BooleanLiteral);
        } else if (typeof val$1988 === 'number') {
            if (val$1988 !== val$1988) {
                return makeDelim$1936('()', [
                    makeValue$1931(0, stx$1989),
                    makePunc$1935('/', stx$1989),
                    makeValue$1931(0, stx$1989)
                ], stx$1989);
            }
            if (val$1988 < 0) {
                return makeDelim$1936('()', [
                    makePunc$1935('-', stx$1989),
                    makeValue$1931(Math.abs(val$1988), stx$1989)
                ], stx$1989);
            } else {
                return mkSyntax$1930(stx$1989, val$1988, parser$1922.Token.NumericLiteral);
            }
        } else if (typeof val$1988 === 'string') {
            return mkSyntax$1930(stx$1989, val$1988, parser$1922.Token.StringLiteral);
        } else if (val$1988 === null) {
            return mkSyntax$1930(stx$1989, 'null', parser$1922.Token.NullLiteral);
        } else {
            throwSyntaxError$1943('makeValue', 'Cannot make value syntax object from: ' + val$1988);
        }
    }
    function makeRegex$1932(val$1990, flags$1991, stx$1992) {
        var newstx$1993 = mkSyntax$1930(stx$1992, new RegExp(val$1990, flags$1991), parser$1922.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1993.token.literal = val$1990;
        return newstx$1993;
    }
    function makeIdent$1933(val$1994, stx$1995) {
        return mkSyntax$1930(stx$1995, val$1994, parser$1922.Token.Identifier);
    }
    function makeKeyword$1934(val$1996, stx$1997) {
        return mkSyntax$1930(stx$1997, val$1996, parser$1922.Token.Keyword);
    }
    function makePunc$1935(val$1998, stx$1999) {
        return mkSyntax$1930(stx$1999, val$1998, parser$1922.Token.Punctuator);
    }
    function makeDelim$1936(val$2000, inner$2001, stx$2002) {
        return mkSyntax$1930(stx$2002, val$2000, parser$1922.Token.Delimiter, inner$2001);
    }
    function unwrapSyntax$1937(stx$2003) {
        if (Array.isArray(stx$2003) && stx$2003.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2003 = stx$2003[0];
        }
        if (stx$2003.token) {
            if (stx$2003.token.type === parser$1922.Token.Delimiter) {
                return stx$2003.token;
            } else {
                return stx$2003.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2003);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1938(stx$2004) {
        return _$1921.map(stx$2004, function (stx$2005) {
            if (stx$2005.token.inner) {
                stx$2005.token.inner = syntaxToTokens$1938(stx$2005.token.inner);
            }
            return stx$2005.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1939(tokens$2006) {
        if (!_$1921.isArray(tokens$2006)) {
            tokens$2006 = [tokens$2006];
        }
        return _$1921.map(tokens$2006, function (token$2007) {
            if (token$2007.inner) {
                token$2007.inner = tokensToSyntax$1939(token$2007.inner);
            }
            return syntaxFromToken$1929(token$2007);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1940(tojoin$2008, punc$2009) {
        if (tojoin$2008.length === 0) {
            return [];
        }
        if (punc$2009 === ' ') {
            return tojoin$2008;
        }
        return _$1921.reduce(_$1921.rest(tojoin$2008, 1), function (acc$2010, join$2011) {
            acc$2010.push(makePunc$1935(punc$2009, join$2011), join$2011);
            return acc$2010;
        }, [_$1921.first(tojoin$2008)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1941(tojoin$2012, punc$2013) {
        if (tojoin$2012.length === 0) {
            return [];
        }
        if (punc$2013 === ' ') {
            return _$1921.flatten(tojoin$2012, true);
        }
        return _$1921.reduce(_$1921.rest(tojoin$2012, 1), function (acc$2014, join$2015) {
            acc$2014.push(makePunc$1935(punc$2013, _$1921.first(join$2015)));
            Array.prototype.push.apply(acc$2014, join$2015);
            return acc$2014;
        }, _$1921.first(tojoin$2012));
    }
    function MacroSyntaxError$1942(name$2016, message$2017, stx$2018) {
        this.name = name$2016;
        this.message = message$2017;
        this.stx = stx$2018;
    }
    function throwSyntaxError$1943(name$2019, message$2020, stx$2021) {
        if (stx$2021 && Array.isArray(stx$2021)) {
            stx$2021 = stx$2021[0];
        }
        throw new MacroSyntaxError$1942(name$2019, message$2020, stx$2021);
    }
    function printSyntaxError$1944(code$2022, err$2023) {
        if (!err$2023.stx) {
            return '[' + err$2023.name + '] ' + err$2023.message;
        }
        var token$2024 = err$2023.stx.token;
        var lineNumber$2025 = token$2024.sm_startLineNumber || token$2024.sm_lineNumber || token$2024.startLineNumber || token$2024.lineNumber;
        var lineStart$2026 = token$2024.sm_startLineStart || token$2024.sm_lineStart || token$2024.startLineStart || token$2024.lineStart;
        var start$2027 = (token$2024.sm_startRange || token$2024.sm_range || token$2024.startRange || token$2024.range)[0];
        var offset$2028 = start$2027 - lineStart$2026;
        var line$2029 = '';
        var pre$2030 = lineNumber$2025 + ': ';
        var ch$2031;
        while (ch$2031 = code$2022.charAt(lineStart$2026++)) {
            if (ch$2031 == '\r' || ch$2031 == '\n') {
                break;
            }
            line$2029 += ch$2031;
        }
        return '[' + err$2023.name + '] ' + err$2023.message + '\n' + pre$2030 + line$2029 + '\n' + Array(offset$2028 + pre$2030.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1945(stxarr$2032, shouldResolve$2033) {
        var indent$2034 = 0;
        var unparsedLines$2035 = stxarr$2032.reduce(function (acc$2036, stx$2037) {
                var s$2038 = shouldResolve$2033 ? expander$1923.resolve(stx$2037) : stx$2037.token.value;
                // skip the end of file token
                if (stx$2037.token.type === parser$1922.Token.EOF) {
                    return acc$2036;
                }
                if (stx$2037.token.type === parser$1922.Token.StringLiteral) {
                    s$2038 = '"' + s$2038 + '"';
                }
                if (s$2038 == '{') {
                    acc$2036[0].str += ' ' + s$2038;
                    indent$2034++;
                    acc$2036.unshift({
                        indent: indent$2034,
                        str: ''
                    });
                } else if (s$2038 == '}') {
                    indent$2034--;
                    acc$2036.unshift({
                        indent: indent$2034,
                        str: s$2038
                    });
                    acc$2036.unshift({
                        indent: indent$2034,
                        str: ''
                    });
                } else if (s$2038 == ';') {
                    acc$2036[0].str += s$2038;
                    acc$2036.unshift({
                        indent: indent$2034,
                        str: ''
                    });
                } else {
                    acc$2036[0].str += (acc$2036[0].str ? ' ' : '') + s$2038;
                }
                return acc$2036;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2035.reduce(function (acc$2039, line$2040) {
            var ind$2041 = '';
            while (ind$2041.length < line$2040.indent * 2) {
                ind$2041 += ' ';
            }
            return ind$2041 + line$2040.str + '\n' + acc$2039;
        }, '');
    }
    exports$1920.assert = assert$1924;
    exports$1920.unwrapSyntax = unwrapSyntax$1937;
    exports$1920.makeDelim = makeDelim$1936;
    exports$1920.makePunc = makePunc$1935;
    exports$1920.makeKeyword = makeKeyword$1934;
    exports$1920.makeIdent = makeIdent$1933;
    exports$1920.makeRegex = makeRegex$1932;
    exports$1920.makeValue = makeValue$1931;
    exports$1920.Rename = Rename$1925;
    exports$1920.Mark = Mark$1926;
    exports$1920.Def = Def$1927;
    exports$1920.syntaxFromToken = syntaxFromToken$1929;
    exports$1920.tokensToSyntax = tokensToSyntax$1939;
    exports$1920.syntaxToTokens = syntaxToTokens$1938;
    exports$1920.joinSyntax = joinSyntax$1940;
    exports$1920.joinSyntaxArr = joinSyntaxArr$1941;
    exports$1920.prettyPrint = prettyPrint$1945;
    exports$1920.MacroSyntaxError = MacroSyntaxError$1942;
    exports$1920.throwSyntaxError = throwSyntaxError$1943;
    exports$1920.printSyntaxError = printSyntaxError$1944;
}));
//# sourceMappingURL=syntax.js.map