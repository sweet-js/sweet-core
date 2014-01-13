(function (root$1912, factory$1913) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1913(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1913);
    }
}(this, function (exports$1914, _$1915, parser$1916, expander$1917) {
    function assert$1918(condition$1940, message$1941) {
        if (!condition$1940) {
            throw new Error('ASSERT: ' + message$1941);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1919(id$1942, name$1943, ctx$1944, defctx$1945) {
        defctx$1945 = defctx$1945 || null;
        this.id = id$1942;
        this.name = name$1943;
        this.context = ctx$1944;
        this.def = defctx$1945;
    }
    // (Num) -> CContext
    function Mark$1920(mark$1946, ctx$1947) {
        this.mark = mark$1946;
        this.context = ctx$1947;
    }
    function Def$1921(defctx$1948, ctx$1949) {
        this.defctx = defctx$1948;
        this.context = ctx$1949;
    }
    function Syntax$1922(token$1950, oldstx$1951) {
        this.token = token$1950;
        this.context = oldstx$1951 && oldstx$1951.context ? oldstx$1951.context : null;
        this.deferredContext = oldstx$1951 && oldstx$1951.deferredContext ? oldstx$1951.deferredContext : null;
    }
    Syntax$1922.prototype = {
        mark: function (newMark$1952) {
            if (this.token.inner) {
                var next$1953 = syntaxFromToken$1923(this.token, this);
                next$1953.deferredContext = new Mark$1920(newMark$1952, this.deferredContext);
                return next$1953;
            }
            return syntaxFromToken$1923(this.token, { context: new Mark$1920(newMark$1952, this.context) });
        },
        rename: function (id$1954, name$1955, defctx$1956) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1957 = syntaxFromToken$1923(this.token, this);
                next$1957.deferredContext = new Rename$1919(id$1954, name$1955, this.deferredContext, defctx$1956);
                return next$1957;
            }
            if (this.token.type === parser$1916.Token.Identifier || this.token.type === parser$1916.Token.Keyword || this.token.type === parser$1916.Token.Punctuator) {
                return syntaxFromToken$1923(this.token, { context: new Rename$1919(id$1954, name$1955, this.context, defctx$1956) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1958) {
            if (this.token.inner) {
                var next$1959 = syntaxFromToken$1923(this.token, this);
                next$1959.deferredContext = new Def$1921(defctx$1958, this.deferredContext);
                return next$1959;
            }
            return syntaxFromToken$1923(this.token, { context: new Def$1921(defctx$1958, this.context) });
        },
        getDefCtx: function () {
            var ctx$1960 = this.context;
            while (ctx$1960 !== null) {
                if (ctx$1960 instanceof Def$1921) {
                    return ctx$1960.defctx;
                }
                ctx$1960 = ctx$1960.context;
            }
            return null;
        },
        expose: function () {
            assert$1918(this.token.type === parser$1916.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1961(stxCtx$1962, ctx$1963) {
                if (ctx$1963 == null) {
                    return stxCtx$1962;
                } else if (ctx$1963 instanceof Rename$1919) {
                    return new Rename$1919(ctx$1963.id, ctx$1963.name, applyContext$1961(stxCtx$1962, ctx$1963.context), ctx$1963.def);
                } else if (ctx$1963 instanceof Mark$1920) {
                    return new Mark$1920(ctx$1963.mark, applyContext$1961(stxCtx$1962, ctx$1963.context));
                } else if (ctx$1963 instanceof Def$1921) {
                    return new Def$1921(ctx$1963.defctx, applyContext$1961(stxCtx$1962, ctx$1963.context));
                } else {
                    assert$1918(false, 'unknown context type');
                }
            }
            this.token.inner = _$1915.map(this.token.inner, _$1915.bind(function (stx$1964) {
                if (stx$1964.token.inner) {
                    var next$1965 = syntaxFromToken$1923(stx$1964.token, stx$1964);
                    next$1965.deferredContext = applyContext$1961(stx$1964.deferredContext, this.deferredContext);
                    return next$1965;
                } else {
                    return syntaxFromToken$1923(stx$1964.token, { context: applyContext$1961(stx$1964.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1966 = this.token.type === parser$1916.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1966 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1923(token$1967, oldstx$1968) {
        return new Syntax$1922(token$1967, oldstx$1968);
    }
    function mkSyntax$1924(stx$1969, value$1970, type$1971, inner$1972) {
        if (stx$1969 && Array.isArray(stx$1969) && stx$1969.length === 1) {
            stx$1969 = stx$1969[0];
        } else if (stx$1969 && Array.isArray(stx$1969)) {
            throwSyntaxError$1937('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1969 === undefined) {
            throwSyntaxError$1937('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1971 === parser$1916.Token.Delimiter) {
            var startLineNumber$1973, startLineStart$1974, endLineNumber$1975, endLineStart$1976, startRange$1977, endRange$1978;
            if (!Array.isArray(inner$1972)) {
                throwSyntaxError$1937('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1969 && stx$1969.token.type === parser$1916.Token.Delimiter) {
                startLineNumber$1973 = stx$1969.token.startLineNumber;
                startLineStart$1974 = stx$1969.token.startLineStart;
                endLineNumber$1975 = stx$1969.token.endLineNumber;
                endLineStart$1976 = stx$1969.token.endLineStart;
                startRange$1977 = stx$1969.token.startRange;
                endRange$1978 = stx$1969.token.endRange;
            } else if (stx$1969 && stx$1969.token) {
                startLineNumber$1973 = stx$1969.token.lineNumber;
                startLineStart$1974 = stx$1969.token.lineStart;
                endLineNumber$1975 = stx$1969.token.lineNumber;
                endLineStart$1976 = stx$1969.token.lineStart;
                startRange$1977 = stx$1969.token.range;
                endRange$1978 = stx$1969.token.range;
            }
            return syntaxFromToken$1923({
                type: parser$1916.Token.Delimiter,
                value: value$1970,
                inner: inner$1972,
                startLineStart: startLineStart$1974,
                startLineNumber: startLineNumber$1973,
                endLineStart: endLineStart$1976,
                endLineNumber: endLineNumber$1975,
                startRange: startRange$1977,
                endRange: endRange$1978
            }, stx$1969);
        } else {
            var lineStart$1979, lineNumber$1980, range$1981;
            if (stx$1969 && stx$1969.token.type === parser$1916.Token.Delimiter) {
                lineStart$1979 = stx$1969.token.startLineStart;
                lineNumber$1980 = stx$1969.token.startLineNumber;
                range$1981 = stx$1969.token.startRange;
            } else if (stx$1969 && stx$1969.token) {
                lineStart$1979 = stx$1969.token.lineStart;
                lineNumber$1980 = stx$1969.token.lineNumber;
                range$1981 = stx$1969.token.range;
            }
            return syntaxFromToken$1923({
                type: type$1971,
                value: value$1970,
                lineStart: lineStart$1979,
                lineNumber: lineNumber$1980,
                range: range$1981
            }, stx$1969);
        }
    }
    function makeValue$1925(val$1982, stx$1983) {
        if (typeof val$1982 === 'boolean') {
            return mkSyntax$1924(stx$1983, val$1982 ? 'true' : 'false', parser$1916.Token.BooleanLiteral);
        } else if (typeof val$1982 === 'number') {
            if (val$1982 !== val$1982) {
                return makeDelim$1930('()', [
                    makeValue$1925(0, stx$1983),
                    makePunc$1929('/', stx$1983),
                    makeValue$1925(0, stx$1983)
                ], stx$1983);
            }
            if (val$1982 < 0) {
                return makeDelim$1930('()', [
                    makePunc$1929('-', stx$1983),
                    makeValue$1925(Math.abs(val$1982), stx$1983)
                ], stx$1983);
            } else {
                return mkSyntax$1924(stx$1983, val$1982, parser$1916.Token.NumericLiteral);
            }
        } else if (typeof val$1982 === 'string') {
            return mkSyntax$1924(stx$1983, val$1982, parser$1916.Token.StringLiteral);
        } else if (val$1982 === null) {
            return mkSyntax$1924(stx$1983, 'null', parser$1916.Token.NullLiteral);
        } else {
            throwSyntaxError$1937('makeValue', 'Cannot make value syntax object from: ' + val$1982);
        }
    }
    function makeRegex$1926(val$1984, flags$1985, stx$1986) {
        var newstx$1987 = mkSyntax$1924(stx$1986, new RegExp(val$1984, flags$1985), parser$1916.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1987.token.literal = val$1984;
        return newstx$1987;
    }
    function makeIdent$1927(val$1988, stx$1989) {
        return mkSyntax$1924(stx$1989, val$1988, parser$1916.Token.Identifier);
    }
    function makeKeyword$1928(val$1990, stx$1991) {
        return mkSyntax$1924(stx$1991, val$1990, parser$1916.Token.Keyword);
    }
    function makePunc$1929(val$1992, stx$1993) {
        return mkSyntax$1924(stx$1993, val$1992, parser$1916.Token.Punctuator);
    }
    function makeDelim$1930(val$1994, inner$1995, stx$1996) {
        return mkSyntax$1924(stx$1996, val$1994, parser$1916.Token.Delimiter, inner$1995);
    }
    function unwrapSyntax$1931(stx$1997) {
        if (Array.isArray(stx$1997) && stx$1997.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1997 = stx$1997[0];
        }
        if (stx$1997.token) {
            if (stx$1997.token.type === parser$1916.Token.Delimiter) {
                return stx$1997.token;
            } else {
                return stx$1997.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1997);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1932(stx$1998) {
        return _$1915.map(stx$1998, function (stx$1999) {
            if (stx$1999.token.inner) {
                stx$1999.token.inner = syntaxToTokens$1932(stx$1999.token.inner);
            }
            return stx$1999.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1933(tokens$2000) {
        if (!_$1915.isArray(tokens$2000)) {
            tokens$2000 = [tokens$2000];
        }
        return _$1915.map(tokens$2000, function (token$2001) {
            if (token$2001.inner) {
                token$2001.inner = tokensToSyntax$1933(token$2001.inner);
            }
            return syntaxFromToken$1923(token$2001);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1934(tojoin$2002, punc$2003) {
        if (tojoin$2002.length === 0) {
            return [];
        }
        if (punc$2003 === ' ') {
            return tojoin$2002;
        }
        return _$1915.reduce(_$1915.rest(tojoin$2002, 1), function (acc$2004, join$2005) {
            acc$2004.push(makePunc$1929(punc$2003, join$2005), join$2005);
            return acc$2004;
        }, [_$1915.first(tojoin$2002)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1935(tojoin$2006, punc$2007) {
        if (tojoin$2006.length === 0) {
            return [];
        }
        if (punc$2007 === ' ') {
            return _$1915.flatten(tojoin$2006, true);
        }
        return _$1915.reduce(_$1915.rest(tojoin$2006, 1), function (acc$2008, join$2009) {
            acc$2008.push(makePunc$1929(punc$2007, _$1915.first(join$2009)));
            Array.prototype.push.apply(acc$2008, join$2009);
            return acc$2008;
        }, _$1915.first(tojoin$2006));
    }
    function MacroSyntaxError$1936(name$2010, message$2011, stx$2012) {
        this.name = name$2010;
        this.message = message$2011;
        this.stx = stx$2012;
    }
    function throwSyntaxError$1937(name$2013, message$2014, stx$2015) {
        if (stx$2015 && Array.isArray(stx$2015)) {
            stx$2015 = stx$2015[0];
        }
        throw new MacroSyntaxError$1936(name$2013, message$2014, stx$2015);
    }
    function printSyntaxError$1938(code$2016, err$2017) {
        if (!err$2017.stx) {
            return '[' + err$2017.name + '] ' + err$2017.message;
        }
        var token$2018 = err$2017.stx.token;
        var lineNumber$2019 = token$2018.sm_startLineNumber || token$2018.sm_lineNumber || token$2018.startLineNumber || token$2018.lineNumber;
        var lineStart$2020 = token$2018.sm_startLineStart || token$2018.sm_lineStart || token$2018.startLineStart || token$2018.lineStart;
        var start$2021 = (token$2018.sm_startRange || token$2018.sm_range || token$2018.startRange || token$2018.range)[0];
        var offset$2022 = start$2021 - lineStart$2020;
        var line$2023 = '';
        var pre$2024 = lineNumber$2019 + ': ';
        var ch$2025;
        while (ch$2025 = code$2016.charAt(lineStart$2020++)) {
            if (ch$2025 == '\r' || ch$2025 == '\n') {
                break;
            }
            line$2023 += ch$2025;
        }
        return '[' + err$2017.name + '] ' + err$2017.message + '\n' + pre$2024 + line$2023 + '\n' + Array(offset$2022 + pre$2024.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1939(stxarr$2026, shouldResolve$2027) {
        var indent$2028 = 0;
        var unparsedLines$2029 = stxarr$2026.reduce(function (acc$2030, stx$2031) {
                var s$2032 = shouldResolve$2027 ? expander$1917.resolve(stx$2031) : stx$2031.token.value;
                // skip the end of file token
                if (stx$2031.token.type === parser$1916.Token.EOF) {
                    return acc$2030;
                }
                if (stx$2031.token.type === parser$1916.Token.StringLiteral) {
                    s$2032 = '"' + s$2032 + '"';
                }
                if (s$2032 == '{') {
                    acc$2030[0].str += ' ' + s$2032;
                    indent$2028++;
                    acc$2030.unshift({
                        indent: indent$2028,
                        str: ''
                    });
                } else if (s$2032 == '}') {
                    indent$2028--;
                    acc$2030.unshift({
                        indent: indent$2028,
                        str: s$2032
                    });
                    acc$2030.unshift({
                        indent: indent$2028,
                        str: ''
                    });
                } else if (s$2032 == ';') {
                    acc$2030[0].str += s$2032;
                    acc$2030.unshift({
                        indent: indent$2028,
                        str: ''
                    });
                } else {
                    acc$2030[0].str += (acc$2030[0].str ? ' ' : '') + s$2032;
                }
                return acc$2030;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2029.reduce(function (acc$2033, line$2034) {
            var ind$2035 = '';
            while (ind$2035.length < line$2034.indent * 2) {
                ind$2035 += ' ';
            }
            return ind$2035 + line$2034.str + '\n' + acc$2033;
        }, '');
    }
    exports$1914.assert = assert$1918;
    exports$1914.unwrapSyntax = unwrapSyntax$1931;
    exports$1914.makeDelim = makeDelim$1930;
    exports$1914.makePunc = makePunc$1929;
    exports$1914.makeKeyword = makeKeyword$1928;
    exports$1914.makeIdent = makeIdent$1927;
    exports$1914.makeRegex = makeRegex$1926;
    exports$1914.makeValue = makeValue$1925;
    exports$1914.Rename = Rename$1919;
    exports$1914.Mark = Mark$1920;
    exports$1914.Def = Def$1921;
    exports$1914.syntaxFromToken = syntaxFromToken$1923;
    exports$1914.tokensToSyntax = tokensToSyntax$1933;
    exports$1914.syntaxToTokens = syntaxToTokens$1932;
    exports$1914.joinSyntax = joinSyntax$1934;
    exports$1914.joinSyntaxArr = joinSyntaxArr$1935;
    exports$1914.prettyPrint = prettyPrint$1939;
    exports$1914.MacroSyntaxError = MacroSyntaxError$1936;
    exports$1914.throwSyntaxError = throwSyntaxError$1937;
    exports$1914.printSyntaxError = printSyntaxError$1938;
}));
//# sourceMappingURL=syntax.js.map