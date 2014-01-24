(function (root$1949, factory$1950) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1950(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1950);
    }
}(this, function (exports$1951, _$1952, parser$1953, expander$1954) {
    function assert$1955(condition$1977, message$1978) {
        if (!condition$1977) {
            throw new Error('ASSERT: ' + message$1978);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1956(id$1979, name$1980, ctx$1981, defctx$1982) {
        defctx$1982 = defctx$1982 || null;
        this.id = id$1979;
        this.name = name$1980;
        this.context = ctx$1981;
        this.def = defctx$1982;
    }
    // (Num) -> CContext
    function Mark$1957(mark$1983, ctx$1984) {
        this.mark = mark$1983;
        this.context = ctx$1984;
    }
    function Def$1958(defctx$1985, ctx$1986) {
        this.defctx = defctx$1985;
        this.context = ctx$1986;
    }
    function Syntax$1959(token$1987, oldstx$1988) {
        this.token = token$1987;
        this.context = oldstx$1988 && oldstx$1988.context ? oldstx$1988.context : null;
        this.deferredContext = oldstx$1988 && oldstx$1988.deferredContext ? oldstx$1988.deferredContext : null;
    }
    Syntax$1959.prototype = {
        mark: function (newMark$1989) {
            if (this.token.inner) {
                var next$1990 = syntaxFromToken$1960(this.token, this);
                next$1990.deferredContext = new Mark$1957(newMark$1989, this.deferredContext);
                return next$1990;
            }
            return syntaxFromToken$1960(this.token, { context: new Mark$1957(newMark$1989, this.context) });
        },
        rename: function (id$1991, name$1992, defctx$1993) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1994 = syntaxFromToken$1960(this.token, this);
                next$1994.deferredContext = new Rename$1956(id$1991, name$1992, this.deferredContext, defctx$1993);
                return next$1994;
            }
            if (this.token.type === parser$1953.Token.Identifier || this.token.type === parser$1953.Token.Keyword || this.token.type === parser$1953.Token.Punctuator) {
                return syntaxFromToken$1960(this.token, { context: new Rename$1956(id$1991, name$1992, this.context, defctx$1993) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1995) {
            if (this.token.inner) {
                var next$1996 = syntaxFromToken$1960(this.token, this);
                next$1996.deferredContext = new Def$1958(defctx$1995, this.deferredContext);
                return next$1996;
            }
            return syntaxFromToken$1960(this.token, { context: new Def$1958(defctx$1995, this.context) });
        },
        getDefCtx: function () {
            var ctx$1997 = this.context;
            while (ctx$1997 !== null) {
                if (ctx$1997 instanceof Def$1958) {
                    return ctx$1997.defctx;
                }
                ctx$1997 = ctx$1997.context;
            }
            return null;
        },
        expose: function () {
            assert$1955(this.token.type === parser$1953.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1998(stxCtx$1999, ctx$2000) {
                if (ctx$2000 == null) {
                    return stxCtx$1999;
                } else if (ctx$2000 instanceof Rename$1956) {
                    return new Rename$1956(ctx$2000.id, ctx$2000.name, applyContext$1998(stxCtx$1999, ctx$2000.context), ctx$2000.def);
                } else if (ctx$2000 instanceof Mark$1957) {
                    return new Mark$1957(ctx$2000.mark, applyContext$1998(stxCtx$1999, ctx$2000.context));
                } else if (ctx$2000 instanceof Def$1958) {
                    return new Def$1958(ctx$2000.defctx, applyContext$1998(stxCtx$1999, ctx$2000.context));
                } else {
                    assert$1955(false, 'unknown context type');
                }
            }
            this.token.inner = _$1952.map(this.token.inner, _$1952.bind(function (stx$2001) {
                if (stx$2001.token.inner) {
                    var next$2002 = syntaxFromToken$1960(stx$2001.token, stx$2001);
                    next$2002.deferredContext = applyContext$1998(stx$2001.deferredContext, this.deferredContext);
                    return next$2002;
                } else {
                    return syntaxFromToken$1960(stx$2001.token, { context: applyContext$1998(stx$2001.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$2003 = this.token.type === parser$1953.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$2003 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1960(token$2004, oldstx$2005) {
        return new Syntax$1959(token$2004, oldstx$2005);
    }
    function mkSyntax$1961(stx$2006, value$2007, type$2008, inner$2009) {
        if (stx$2006 && Array.isArray(stx$2006) && stx$2006.length === 1) {
            stx$2006 = stx$2006[0];
        } else if (stx$2006 && Array.isArray(stx$2006)) {
            throwSyntaxError$1974('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$2006 === undefined) {
            throwSyntaxError$1974('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$2008 === parser$1953.Token.Delimiter) {
            var startLineNumber$2010, startLineStart$2011, endLineNumber$2012, endLineStart$2013, startRange$2014, endRange$2015;
            if (!Array.isArray(inner$2009)) {
                throwSyntaxError$1974('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2006 && stx$2006.token.type === parser$1953.Token.Delimiter) {
                startLineNumber$2010 = stx$2006.token.startLineNumber;
                startLineStart$2011 = stx$2006.token.startLineStart;
                endLineNumber$2012 = stx$2006.token.endLineNumber;
                endLineStart$2013 = stx$2006.token.endLineStart;
                startRange$2014 = stx$2006.token.startRange;
                endRange$2015 = stx$2006.token.endRange;
            } else if (stx$2006 && stx$2006.token) {
                startLineNumber$2010 = stx$2006.token.lineNumber;
                startLineStart$2011 = stx$2006.token.lineStart;
                endLineNumber$2012 = stx$2006.token.lineNumber;
                endLineStart$2013 = stx$2006.token.lineStart;
                startRange$2014 = stx$2006.token.range;
                endRange$2015 = stx$2006.token.range;
            }
            return syntaxFromToken$1960({
                type: parser$1953.Token.Delimiter,
                value: value$2007,
                inner: inner$2009,
                startLineStart: startLineStart$2011,
                startLineNumber: startLineNumber$2010,
                endLineStart: endLineStart$2013,
                endLineNumber: endLineNumber$2012,
                startRange: startRange$2014,
                endRange: endRange$2015
            }, stx$2006);
        } else {
            var lineStart$2016, lineNumber$2017, range$2018;
            if (stx$2006 && stx$2006.token.type === parser$1953.Token.Delimiter) {
                lineStart$2016 = stx$2006.token.startLineStart;
                lineNumber$2017 = stx$2006.token.startLineNumber;
                range$2018 = stx$2006.token.startRange;
            } else if (stx$2006 && stx$2006.token) {
                lineStart$2016 = stx$2006.token.lineStart;
                lineNumber$2017 = stx$2006.token.lineNumber;
                range$2018 = stx$2006.token.range;
            }
            return syntaxFromToken$1960({
                type: type$2008,
                value: value$2007,
                lineStart: lineStart$2016,
                lineNumber: lineNumber$2017,
                range: range$2018
            }, stx$2006);
        }
    }
    function makeValue$1962(val$2019, stx$2020) {
        if (typeof val$2019 === 'boolean') {
            return mkSyntax$1961(stx$2020, val$2019 ? 'true' : 'false', parser$1953.Token.BooleanLiteral);
        } else if (typeof val$2019 === 'number') {
            if (val$2019 !== val$2019) {
                return makeDelim$1967('()', [
                    makeValue$1962(0, stx$2020),
                    makePunc$1966('/', stx$2020),
                    makeValue$1962(0, stx$2020)
                ], stx$2020);
            }
            if (val$2019 < 0) {
                return makeDelim$1967('()', [
                    makePunc$1966('-', stx$2020),
                    makeValue$1962(Math.abs(val$2019), stx$2020)
                ], stx$2020);
            } else {
                return mkSyntax$1961(stx$2020, val$2019, parser$1953.Token.NumericLiteral);
            }
        } else if (typeof val$2019 === 'string') {
            return mkSyntax$1961(stx$2020, val$2019, parser$1953.Token.StringLiteral);
        } else if (val$2019 === null) {
            return mkSyntax$1961(stx$2020, 'null', parser$1953.Token.NullLiteral);
        } else {
            throwSyntaxError$1974('makeValue', 'Cannot make value syntax object from: ' + val$2019);
        }
    }
    function makeRegex$1963(val$2021, flags$2022, stx$2023) {
        var newstx$2024 = mkSyntax$1961(stx$2023, new RegExp(val$2021, flags$2022), parser$1953.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2024.token.literal = val$2021;
        return newstx$2024;
    }
    function makeIdent$1964(val$2025, stx$2026) {
        return mkSyntax$1961(stx$2026, val$2025, parser$1953.Token.Identifier);
    }
    function makeKeyword$1965(val$2027, stx$2028) {
        return mkSyntax$1961(stx$2028, val$2027, parser$1953.Token.Keyword);
    }
    function makePunc$1966(val$2029, stx$2030) {
        return mkSyntax$1961(stx$2030, val$2029, parser$1953.Token.Punctuator);
    }
    function makeDelim$1967(val$2031, inner$2032, stx$2033) {
        return mkSyntax$1961(stx$2033, val$2031, parser$1953.Token.Delimiter, inner$2032);
    }
    function unwrapSyntax$1968(stx$2034) {
        if (Array.isArray(stx$2034) && stx$2034.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2034 = stx$2034[0];
        }
        if (stx$2034.token) {
            if (stx$2034.token.type === parser$1953.Token.Delimiter) {
                return stx$2034.token;
            } else {
                return stx$2034.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2034);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1969(stx$2035) {
        return _$1952.map(stx$2035, function (stx$2036) {
            if (stx$2036.token.inner) {
                stx$2036.token.inner = syntaxToTokens$1969(stx$2036.token.inner);
            }
            return stx$2036.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1970(tokens$2037) {
        if (!_$1952.isArray(tokens$2037)) {
            tokens$2037 = [tokens$2037];
        }
        return _$1952.map(tokens$2037, function (token$2038) {
            if (token$2038.inner) {
                token$2038.inner = tokensToSyntax$1970(token$2038.inner);
            }
            return syntaxFromToken$1960(token$2038);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1971(tojoin$2039, punc$2040) {
        if (tojoin$2039.length === 0) {
            return [];
        }
        if (punc$2040 === ' ') {
            return tojoin$2039;
        }
        return _$1952.reduce(_$1952.rest(tojoin$2039, 1), function (acc$2041, join$2042) {
            acc$2041.push(makePunc$1966(punc$2040, join$2042), join$2042);
            return acc$2041;
        }, [_$1952.first(tojoin$2039)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1972(tojoin$2043, punc$2044) {
        if (tojoin$2043.length === 0) {
            return [];
        }
        if (punc$2044 === ' ') {
            return _$1952.flatten(tojoin$2043, true);
        }
        return _$1952.reduce(_$1952.rest(tojoin$2043, 1), function (acc$2045, join$2046) {
            acc$2045.push(makePunc$1966(punc$2044, _$1952.first(join$2046)));
            Array.prototype.push.apply(acc$2045, join$2046);
            return acc$2045;
        }, _$1952.first(tojoin$2043));
    }
    function MacroSyntaxError$1973(name$2047, message$2048, stx$2049) {
        this.name = name$2047;
        this.message = message$2048;
        this.stx = stx$2049;
    }
    function throwSyntaxError$1974(name$2050, message$2051, stx$2052) {
        if (stx$2052 && Array.isArray(stx$2052)) {
            stx$2052 = stx$2052[0];
        }
        throw new MacroSyntaxError$1973(name$2050, message$2051, stx$2052);
    }
    function printSyntaxError$1975(code$2053, err$2054) {
        if (!err$2054.stx) {
            return '[' + err$2054.name + '] ' + err$2054.message;
        }
        var token$2055 = err$2054.stx.token;
        var lineNumber$2056 = token$2055.sm_startLineNumber || token$2055.sm_lineNumber || token$2055.startLineNumber || token$2055.lineNumber;
        var lineStart$2057 = token$2055.sm_startLineStart || token$2055.sm_lineStart || token$2055.startLineStart || token$2055.lineStart;
        var start$2058 = (token$2055.sm_startRange || token$2055.sm_range || token$2055.startRange || token$2055.range)[0];
        var offset$2059 = start$2058 - lineStart$2057;
        var line$2060 = '';
        var pre$2061 = lineNumber$2056 + ': ';
        var ch$2062;
        while (ch$2062 = code$2053.charAt(lineStart$2057++)) {
            if (ch$2062 == '\r' || ch$2062 == '\n') {
                break;
            }
            line$2060 += ch$2062;
        }
        return '[' + err$2054.name + '] ' + err$2054.message + '\n' + pre$2061 + line$2060 + '\n' + Array(offset$2059 + pre$2061.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1976(stxarr$2063, shouldResolve$2064) {
        var indent$2065 = 0;
        var unparsedLines$2066 = stxarr$2063.reduce(function (acc$2067, stx$2068) {
                var s$2069 = shouldResolve$2064 ? expander$1954.resolve(stx$2068) : stx$2068.token.value;
                // skip the end of file token
                if (stx$2068.token.type === parser$1953.Token.EOF) {
                    return acc$2067;
                }
                if (stx$2068.token.type === parser$1953.Token.StringLiteral) {
                    s$2069 = '"' + s$2069 + '"';
                }
                if (s$2069 == '{') {
                    acc$2067[0].str += ' ' + s$2069;
                    indent$2065++;
                    acc$2067.unshift({
                        indent: indent$2065,
                        str: ''
                    });
                } else if (s$2069 == '}') {
                    indent$2065--;
                    acc$2067.unshift({
                        indent: indent$2065,
                        str: s$2069
                    });
                    acc$2067.unshift({
                        indent: indent$2065,
                        str: ''
                    });
                } else if (s$2069 == ';') {
                    acc$2067[0].str += s$2069;
                    acc$2067.unshift({
                        indent: indent$2065,
                        str: ''
                    });
                } else {
                    acc$2067[0].str += (acc$2067[0].str ? ' ' : '') + s$2069;
                }
                return acc$2067;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2066.reduce(function (acc$2070, line$2071) {
            var ind$2072 = '';
            while (ind$2072.length < line$2071.indent * 2) {
                ind$2072 += ' ';
            }
            return ind$2072 + line$2071.str + '\n' + acc$2070;
        }, '');
    }
    exports$1951.assert = assert$1955;
    exports$1951.unwrapSyntax = unwrapSyntax$1968;
    exports$1951.makeDelim = makeDelim$1967;
    exports$1951.makePunc = makePunc$1966;
    exports$1951.makeKeyword = makeKeyword$1965;
    exports$1951.makeIdent = makeIdent$1964;
    exports$1951.makeRegex = makeRegex$1963;
    exports$1951.makeValue = makeValue$1962;
    exports$1951.Rename = Rename$1956;
    exports$1951.Mark = Mark$1957;
    exports$1951.Def = Def$1958;
    exports$1951.syntaxFromToken = syntaxFromToken$1960;
    exports$1951.tokensToSyntax = tokensToSyntax$1970;
    exports$1951.syntaxToTokens = syntaxToTokens$1969;
    exports$1951.joinSyntax = joinSyntax$1971;
    exports$1951.joinSyntaxArr = joinSyntaxArr$1972;
    exports$1951.prettyPrint = prettyPrint$1976;
    exports$1951.MacroSyntaxError = MacroSyntaxError$1973;
    exports$1951.throwSyntaxError = throwSyntaxError$1974;
    exports$1951.printSyntaxError = printSyntaxError$1975;
}));
//# sourceMappingURL=syntax.js.map