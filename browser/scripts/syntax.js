(function (root$1911, factory$1912) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1912(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1912);
    }
}(this, function (exports$1913, _$1914, parser$1915, expander$1916) {
    function assert$1917(condition$1939, message$1940) {
        if (!condition$1939) {
            throw new Error('ASSERT: ' + message$1940);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1918(id$1941, name$1942, ctx$1943, defctx$1944) {
        defctx$1944 = defctx$1944 || null;
        this.id = id$1941;
        this.name = name$1942;
        this.context = ctx$1943;
        this.def = defctx$1944;
    }
    // (Num) -> CContext
    function Mark$1919(mark$1945, ctx$1946) {
        this.mark = mark$1945;
        this.context = ctx$1946;
    }
    function Def$1920(defctx$1947, ctx$1948) {
        this.defctx = defctx$1947;
        this.context = ctx$1948;
    }
    function Syntax$1921(token$1949, oldstx$1950) {
        this.token = token$1949;
        this.context = oldstx$1950 && oldstx$1950.context ? oldstx$1950.context : null;
        this.deferredContext = oldstx$1950 && oldstx$1950.deferredContext ? oldstx$1950.deferredContext : null;
    }
    Syntax$1921.prototype = {
        mark: function (newMark$1951) {
            if (this.token.inner) {
                var next$1952 = syntaxFromToken$1922(this.token, this);
                next$1952.deferredContext = new Mark$1919(newMark$1951, this.deferredContext);
                return next$1952;
            }
            return syntaxFromToken$1922(this.token, { context: new Mark$1919(newMark$1951, this.context) });
        },
        rename: function (id$1953, name$1954, defctx$1955) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1956 = syntaxFromToken$1922(this.token, this);
                next$1956.deferredContext = new Rename$1918(id$1953, name$1954, this.deferredContext, defctx$1955);
                return next$1956;
            }
            if (this.token.type === parser$1915.Token.Identifier || this.token.type === parser$1915.Token.Keyword || this.token.type === parser$1915.Token.Punctuator) {
                return syntaxFromToken$1922(this.token, { context: new Rename$1918(id$1953, name$1954, this.context, defctx$1955) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1957) {
            if (this.token.inner) {
                var next$1958 = syntaxFromToken$1922(this.token, this);
                next$1958.deferredContext = new Def$1920(defctx$1957, this.deferredContext);
                return next$1958;
            }
            return syntaxFromToken$1922(this.token, { context: new Def$1920(defctx$1957, this.context) });
        },
        getDefCtx: function () {
            var ctx$1959 = this.context;
            while (ctx$1959 !== null) {
                if (ctx$1959 instanceof Def$1920) {
                    return ctx$1959.defctx;
                }
                ctx$1959 = ctx$1959.context;
            }
            return null;
        },
        expose: function () {
            assert$1917(this.token.type === parser$1915.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1960(stxCtx$1961, ctx$1962) {
                if (ctx$1962 == null) {
                    return stxCtx$1961;
                } else if (ctx$1962 instanceof Rename$1918) {
                    return new Rename$1918(ctx$1962.id, ctx$1962.name, applyContext$1960(stxCtx$1961, ctx$1962.context), ctx$1962.def);
                } else if (ctx$1962 instanceof Mark$1919) {
                    return new Mark$1919(ctx$1962.mark, applyContext$1960(stxCtx$1961, ctx$1962.context));
                } else if (ctx$1962 instanceof Def$1920) {
                    return new Def$1920(ctx$1962.defctx, applyContext$1960(stxCtx$1961, ctx$1962.context));
                } else {
                    assert$1917(false, 'unknown context type');
                }
            }
            this.token.inner = _$1914.map(this.token.inner, _$1914.bind(function (stx$1963) {
                if (stx$1963.token.inner) {
                    var next$1964 = syntaxFromToken$1922(stx$1963.token, stx$1963);
                    next$1964.deferredContext = applyContext$1960(stx$1963.deferredContext, this.deferredContext);
                    return next$1964;
                } else {
                    return syntaxFromToken$1922(stx$1963.token, { context: applyContext$1960(stx$1963.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1965 = this.token.type === parser$1915.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1965 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1922(token$1966, oldstx$1967) {
        return new Syntax$1921(token$1966, oldstx$1967);
    }
    function mkSyntax$1923(stx$1968, value$1969, type$1970, inner$1971) {
        if (stx$1968 && Array.isArray(stx$1968) && stx$1968.length === 1) {
            stx$1968 = stx$1968[0];
        } else if (stx$1968 && Array.isArray(stx$1968)) {
            throwSyntaxError$1936('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1968 === undefined) {
            throwSyntaxError$1936('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$1970 === parser$1915.Token.Delimiter) {
            var startLineNumber$1972, startLineStart$1973, endLineNumber$1974, endLineStart$1975, startRange$1976, endRange$1977;
            if (!Array.isArray(inner$1971)) {
                throwSyntaxError$1936('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1968 && stx$1968.token.type === parser$1915.Token.Delimiter) {
                startLineNumber$1972 = stx$1968.token.startLineNumber;
                startLineStart$1973 = stx$1968.token.startLineStart;
                endLineNumber$1974 = stx$1968.token.endLineNumber;
                endLineStart$1975 = stx$1968.token.endLineStart;
                startRange$1976 = stx$1968.token.startRange;
                endRange$1977 = stx$1968.token.endRange;
            } else if (stx$1968 && stx$1968.token) {
                startLineNumber$1972 = stx$1968.token.lineNumber;
                startLineStart$1973 = stx$1968.token.lineStart;
                endLineNumber$1974 = stx$1968.token.lineNumber;
                endLineStart$1975 = stx$1968.token.lineStart;
                startRange$1976 = stx$1968.token.range;
                endRange$1977 = stx$1968.token.range;
            }
            return syntaxFromToken$1922({
                type: parser$1915.Token.Delimiter,
                value: value$1969,
                inner: inner$1971,
                startLineStart: startLineStart$1973,
                startLineNumber: startLineNumber$1972,
                endLineStart: endLineStart$1975,
                endLineNumber: endLineNumber$1974,
                startRange: startRange$1976,
                endRange: endRange$1977
            }, stx$1968);
        } else {
            var lineStart$1978, lineNumber$1979, range$1980;
            if (stx$1968 && stx$1968.token.type === parser$1915.Token.Delimiter) {
                lineStart$1978 = stx$1968.token.startLineStart;
                lineNumber$1979 = stx$1968.token.startLineNumber;
                range$1980 = stx$1968.token.startRange;
            } else if (stx$1968 && stx$1968.token) {
                lineStart$1978 = stx$1968.token.lineStart;
                lineNumber$1979 = stx$1968.token.lineNumber;
                range$1980 = stx$1968.token.range;
            }
            return syntaxFromToken$1922({
                type: type$1970,
                value: value$1969,
                lineStart: lineStart$1978,
                lineNumber: lineNumber$1979,
                range: range$1980
            }, stx$1968);
        }
    }
    function makeValue$1924(val$1981, stx$1982) {
        if (typeof val$1981 === 'boolean') {
            return mkSyntax$1923(stx$1982, val$1981 ? 'true' : 'false', parser$1915.Token.BooleanLiteral);
        } else if (typeof val$1981 === 'number') {
            if (val$1981 !== val$1981) {
                return makeDelim$1929('()', [
                    makeValue$1924(0, stx$1982),
                    makePunc$1928('/', stx$1982),
                    makeValue$1924(0, stx$1982)
                ], stx$1982);
            }
            if (val$1981 < 0) {
                return makeDelim$1929('()', [
                    makePunc$1928('-', stx$1982),
                    makeValue$1924(Math.abs(val$1981), stx$1982)
                ], stx$1982);
            } else {
                return mkSyntax$1923(stx$1982, val$1981, parser$1915.Token.NumericLiteral);
            }
        } else if (typeof val$1981 === 'string') {
            return mkSyntax$1923(stx$1982, val$1981, parser$1915.Token.StringLiteral);
        } else if (val$1981 === null) {
            return mkSyntax$1923(stx$1982, 'null', parser$1915.Token.NullLiteral);
        } else {
            throwSyntaxError$1936('makeValue', 'Cannot make value syntax object from: ' + val$1981);
        }
    }
    function makeRegex$1925(val$1983, flags$1984, stx$1985) {
        var newstx$1986 = mkSyntax$1923(stx$1985, new RegExp(val$1983, flags$1984), parser$1915.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$1986.token.literal = val$1983;
        return newstx$1986;
    }
    function makeIdent$1926(val$1987, stx$1988) {
        return mkSyntax$1923(stx$1988, val$1987, parser$1915.Token.Identifier);
    }
    function makeKeyword$1927(val$1989, stx$1990) {
        return mkSyntax$1923(stx$1990, val$1989, parser$1915.Token.Keyword);
    }
    function makePunc$1928(val$1991, stx$1992) {
        return mkSyntax$1923(stx$1992, val$1991, parser$1915.Token.Punctuator);
    }
    function makeDelim$1929(val$1993, inner$1994, stx$1995) {
        return mkSyntax$1923(stx$1995, val$1993, parser$1915.Token.Delimiter, inner$1994);
    }
    function unwrapSyntax$1930(stx$1996) {
        if (Array.isArray(stx$1996) && stx$1996.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$1996 = stx$1996[0];
        }
        if (stx$1996.token) {
            if (stx$1996.token.type === parser$1915.Token.Delimiter) {
                return stx$1996.token;
            } else {
                return stx$1996.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$1996);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1931(stx$1997) {
        return _$1914.map(stx$1997, function (stx$1998) {
            if (stx$1998.token.inner) {
                stx$1998.token.inner = syntaxToTokens$1931(stx$1998.token.inner);
            }
            return stx$1998.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1932(tokens$1999) {
        if (!_$1914.isArray(tokens$1999)) {
            tokens$1999 = [tokens$1999];
        }
        return _$1914.map(tokens$1999, function (token$2000) {
            if (token$2000.inner) {
                token$2000.inner = tokensToSyntax$1932(token$2000.inner);
            }
            return syntaxFromToken$1922(token$2000);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1933(tojoin$2001, punc$2002) {
        if (tojoin$2001.length === 0) {
            return [];
        }
        if (punc$2002 === ' ') {
            return tojoin$2001;
        }
        return _$1914.reduce(_$1914.rest(tojoin$2001, 1), function (acc$2003, join$2004) {
            acc$2003.push(makePunc$1928(punc$2002, join$2004), join$2004);
            return acc$2003;
        }, [_$1914.first(tojoin$2001)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1934(tojoin$2005, punc$2006) {
        if (tojoin$2005.length === 0) {
            return [];
        }
        if (punc$2006 === ' ') {
            return _$1914.flatten(tojoin$2005, true);
        }
        return _$1914.reduce(_$1914.rest(tojoin$2005, 1), function (acc$2007, join$2008) {
            acc$2007.push(makePunc$1928(punc$2006, _$1914.first(join$2008)));
            Array.prototype.push.apply(acc$2007, join$2008);
            return acc$2007;
        }, _$1914.first(tojoin$2005));
    }
    function MacroSyntaxError$1935(name$2009, message$2010, stx$2011) {
        this.name = name$2009;
        this.message = message$2010;
        this.stx = stx$2011;
    }
    function throwSyntaxError$1936(name$2012, message$2013, stx$2014) {
        if (stx$2014 && Array.isArray(stx$2014)) {
            stx$2014 = stx$2014[0];
        }
        throw new MacroSyntaxError$1935(name$2012, message$2013, stx$2014);
    }
    function printSyntaxError$1937(code$2015, err$2016) {
        if (!err$2016.stx) {
            return '[' + err$2016.name + '] ' + err$2016.message;
        }
        var token$2017 = err$2016.stx.token;
        var lineNumber$2018 = token$2017.sm_startLineNumber || token$2017.sm_lineNumber || token$2017.startLineNumber || token$2017.lineNumber;
        var lineStart$2019 = token$2017.sm_startLineStart || token$2017.sm_lineStart || token$2017.startLineStart || token$2017.lineStart;
        var start$2020 = (token$2017.sm_startRange || token$2017.sm_range || token$2017.startRange || token$2017.range)[0];
        var offset$2021 = start$2020 - lineStart$2019;
        var line$2022 = '';
        var pre$2023 = lineNumber$2018 + ': ';
        var ch$2024;
        while (ch$2024 = code$2015.charAt(lineStart$2019++)) {
            if (ch$2024 == '\r' || ch$2024 == '\n') {
                break;
            }
            line$2022 += ch$2024;
        }
        return '[' + err$2016.name + '] ' + err$2016.message + '\n' + pre$2023 + line$2022 + '\n' + Array(offset$2021 + pre$2023.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1938(stxarr$2025, shouldResolve$2026) {
        var indent$2027 = 0;
        var unparsedLines$2028 = stxarr$2025.reduce(function (acc$2029, stx$2030) {
                var s$2031 = shouldResolve$2026 ? expander$1916.resolve(stx$2030) : stx$2030.token.value;
                // skip the end of file token
                if (stx$2030.token.type === parser$1915.Token.EOF) {
                    return acc$2029;
                }
                if (stx$2030.token.type === parser$1915.Token.StringLiteral) {
                    s$2031 = '"' + s$2031 + '"';
                }
                if (s$2031 == '{') {
                    acc$2029[0].str += ' ' + s$2031;
                    indent$2027++;
                    acc$2029.unshift({
                        indent: indent$2027,
                        str: ''
                    });
                } else if (s$2031 == '}') {
                    indent$2027--;
                    acc$2029.unshift({
                        indent: indent$2027,
                        str: s$2031
                    });
                    acc$2029.unshift({
                        indent: indent$2027,
                        str: ''
                    });
                } else if (s$2031 == ';') {
                    acc$2029[0].str += s$2031;
                    acc$2029.unshift({
                        indent: indent$2027,
                        str: ''
                    });
                } else {
                    acc$2029[0].str += (acc$2029[0].str ? ' ' : '') + s$2031;
                }
                return acc$2029;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2028.reduce(function (acc$2032, line$2033) {
            var ind$2034 = '';
            while (ind$2034.length < line$2033.indent * 2) {
                ind$2034 += ' ';
            }
            return ind$2034 + line$2033.str + '\n' + acc$2032;
        }, '');
    }
    exports$1913.assert = assert$1917;
    exports$1913.unwrapSyntax = unwrapSyntax$1930;
    exports$1913.makeDelim = makeDelim$1929;
    exports$1913.makePunc = makePunc$1928;
    exports$1913.makeKeyword = makeKeyword$1927;
    exports$1913.makeIdent = makeIdent$1926;
    exports$1913.makeRegex = makeRegex$1925;
    exports$1913.makeValue = makeValue$1924;
    exports$1913.Rename = Rename$1918;
    exports$1913.Mark = Mark$1919;
    exports$1913.Def = Def$1920;
    exports$1913.syntaxFromToken = syntaxFromToken$1922;
    exports$1913.tokensToSyntax = tokensToSyntax$1932;
    exports$1913.syntaxToTokens = syntaxToTokens$1931;
    exports$1913.joinSyntax = joinSyntax$1933;
    exports$1913.joinSyntaxArr = joinSyntaxArr$1934;
    exports$1913.prettyPrint = prettyPrint$1938;
    exports$1913.MacroSyntaxError = MacroSyntaxError$1935;
    exports$1913.throwSyntaxError = throwSyntaxError$1936;
    exports$1913.printSyntaxError = printSyntaxError$1937;
}));
//# sourceMappingURL=syntax.js.map