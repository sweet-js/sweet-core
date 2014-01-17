(function (root$1945, factory$1946) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1946(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1946);
    }
}(this, function (exports$1947, _$1948, parser$1949, expander$1950) {
    function assert$1951(condition$1973, message$1974) {
        if (!condition$1973) {
            throw new Error('ASSERT: ' + message$1974);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1952(id$1975, name$1976, ctx$1977, defctx$1978) {
        defctx$1978 = defctx$1978 || null;
        this.id = id$1975;
        this.name = name$1976;
        this.context = ctx$1977;
        this.def = defctx$1978;
    }
    // (Num) -> CContext
    function Mark$1953(mark$1979, ctx$1980) {
        this.mark = mark$1979;
        this.context = ctx$1980;
    }
    function Def$1954(defctx$1981, ctx$1982) {
        this.defctx = defctx$1981;
        this.context = ctx$1982;
    }
    function Syntax$1955(token$1983, oldstx$1984) {
        this.token = token$1983;
        this.context = oldstx$1984 && oldstx$1984.context ? oldstx$1984.context : null;
        this.deferredContext = oldstx$1984 && oldstx$1984.deferredContext ? oldstx$1984.deferredContext : null;
    }
    Syntax$1955.prototype = {
        mark: function (newMark$1985) {
            if (this.token.inner) {
                var next$1986 = syntaxFromToken$1956(this.token, this);
                next$1986.deferredContext = new Mark$1953(newMark$1985, this.deferredContext);
                return next$1986;
            }
            return syntaxFromToken$1956(this.token, { context: new Mark$1953(newMark$1985, this.context) });
        },
        rename: function (id$1987, name$1988, defctx$1989) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1990 = syntaxFromToken$1956(this.token, this);
                next$1990.deferredContext = new Rename$1952(id$1987, name$1988, this.deferredContext, defctx$1989);
                return next$1990;
            }
            if (this.token.type === parser$1949.Token.Identifier || this.token.type === parser$1949.Token.Keyword || this.token.type === parser$1949.Token.Punctuator) {
                return syntaxFromToken$1956(this.token, { context: new Rename$1952(id$1987, name$1988, this.context, defctx$1989) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1991) {
            if (this.token.inner) {
                var next$1992 = syntaxFromToken$1956(this.token, this);
                next$1992.deferredContext = new Def$1954(defctx$1991, this.deferredContext);
                return next$1992;
            }
            return syntaxFromToken$1956(this.token, { context: new Def$1954(defctx$1991, this.context) });
        },
        getDefCtx: function () {
            var ctx$1993 = this.context;
            while (ctx$1993 !== null) {
                if (ctx$1993 instanceof Def$1954) {
                    return ctx$1993.defctx;
                }
                ctx$1993 = ctx$1993.context;
            }
            return null;
        },
        expose: function () {
            assert$1951(this.token.type === parser$1949.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1994(stxCtx$1995, ctx$1996) {
                if (ctx$1996 == null) {
                    return stxCtx$1995;
                } else if (ctx$1996 instanceof Rename$1952) {
                    return new Rename$1952(ctx$1996.id, ctx$1996.name, applyContext$1994(stxCtx$1995, ctx$1996.context), ctx$1996.def);
                } else if (ctx$1996 instanceof Mark$1953) {
                    return new Mark$1953(ctx$1996.mark, applyContext$1994(stxCtx$1995, ctx$1996.context));
                } else if (ctx$1996 instanceof Def$1954) {
                    return new Def$1954(ctx$1996.defctx, applyContext$1994(stxCtx$1995, ctx$1996.context));
                } else {
                    assert$1951(false, 'unknown context type');
                }
            }
            this.token.inner = _$1948.map(this.token.inner, _$1948.bind(function (stx$1997) {
                if (stx$1997.token.inner) {
                    var next$1998 = syntaxFromToken$1956(stx$1997.token, stx$1997);
                    next$1998.deferredContext = applyContext$1994(stx$1997.deferredContext, this.deferredContext);
                    return next$1998;
                } else {
                    return syntaxFromToken$1956(stx$1997.token, { context: applyContext$1994(stx$1997.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1999 = this.token.type === parser$1949.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1999 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1956(token$2000, oldstx$2001) {
        return new Syntax$1955(token$2000, oldstx$2001);
    }
    function mkSyntax$1957(stx$2002, value$2003, type$2004, inner$2005) {
        if (stx$2002 && Array.isArray(stx$2002) && stx$2002.length === 1) {
            stx$2002 = stx$2002[0];
        } else if (stx$2002 && Array.isArray(stx$2002)) {
            throwSyntaxError$1970('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$2002 === undefined) {
            throwSyntaxError$1970('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$2004 === parser$1949.Token.Delimiter) {
            var startLineNumber$2006, startLineStart$2007, endLineNumber$2008, endLineStart$2009, startRange$2010, endRange$2011;
            if (!Array.isArray(inner$2005)) {
                throwSyntaxError$1970('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$2002 && stx$2002.token.type === parser$1949.Token.Delimiter) {
                startLineNumber$2006 = stx$2002.token.startLineNumber;
                startLineStart$2007 = stx$2002.token.startLineStart;
                endLineNumber$2008 = stx$2002.token.endLineNumber;
                endLineStart$2009 = stx$2002.token.endLineStart;
                startRange$2010 = stx$2002.token.startRange;
                endRange$2011 = stx$2002.token.endRange;
            } else if (stx$2002 && stx$2002.token) {
                startLineNumber$2006 = stx$2002.token.lineNumber;
                startLineStart$2007 = stx$2002.token.lineStart;
                endLineNumber$2008 = stx$2002.token.lineNumber;
                endLineStart$2009 = stx$2002.token.lineStart;
                startRange$2010 = stx$2002.token.range;
                endRange$2011 = stx$2002.token.range;
            }
            return syntaxFromToken$1956({
                type: parser$1949.Token.Delimiter,
                value: value$2003,
                inner: inner$2005,
                startLineStart: startLineStart$2007,
                startLineNumber: startLineNumber$2006,
                endLineStart: endLineStart$2009,
                endLineNumber: endLineNumber$2008,
                startRange: startRange$2010,
                endRange: endRange$2011
            }, stx$2002);
        } else {
            var lineStart$2012, lineNumber$2013, range$2014;
            if (stx$2002 && stx$2002.token.type === parser$1949.Token.Delimiter) {
                lineStart$2012 = stx$2002.token.startLineStart;
                lineNumber$2013 = stx$2002.token.startLineNumber;
                range$2014 = stx$2002.token.startRange;
            } else if (stx$2002 && stx$2002.token) {
                lineStart$2012 = stx$2002.token.lineStart;
                lineNumber$2013 = stx$2002.token.lineNumber;
                range$2014 = stx$2002.token.range;
            }
            return syntaxFromToken$1956({
                type: type$2004,
                value: value$2003,
                lineStart: lineStart$2012,
                lineNumber: lineNumber$2013,
                range: range$2014
            }, stx$2002);
        }
    }
    function makeValue$1958(val$2015, stx$2016) {
        if (typeof val$2015 === 'boolean') {
            return mkSyntax$1957(stx$2016, val$2015 ? 'true' : 'false', parser$1949.Token.BooleanLiteral);
        } else if (typeof val$2015 === 'number') {
            if (val$2015 !== val$2015) {
                return makeDelim$1963('()', [
                    makeValue$1958(0, stx$2016),
                    makePunc$1962('/', stx$2016),
                    makeValue$1958(0, stx$2016)
                ], stx$2016);
            }
            if (val$2015 < 0) {
                return makeDelim$1963('()', [
                    makePunc$1962('-', stx$2016),
                    makeValue$1958(Math.abs(val$2015), stx$2016)
                ], stx$2016);
            } else {
                return mkSyntax$1957(stx$2016, val$2015, parser$1949.Token.NumericLiteral);
            }
        } else if (typeof val$2015 === 'string') {
            return mkSyntax$1957(stx$2016, val$2015, parser$1949.Token.StringLiteral);
        } else if (val$2015 === null) {
            return mkSyntax$1957(stx$2016, 'null', parser$1949.Token.NullLiteral);
        } else {
            throwSyntaxError$1970('makeValue', 'Cannot make value syntax object from: ' + val$2015);
        }
    }
    function makeRegex$1959(val$2017, flags$2018, stx$2019) {
        var newstx$2020 = mkSyntax$1957(stx$2019, new RegExp(val$2017, flags$2018), parser$1949.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2020.token.literal = val$2017;
        return newstx$2020;
    }
    function makeIdent$1960(val$2021, stx$2022) {
        return mkSyntax$1957(stx$2022, val$2021, parser$1949.Token.Identifier);
    }
    function makeKeyword$1961(val$2023, stx$2024) {
        return mkSyntax$1957(stx$2024, val$2023, parser$1949.Token.Keyword);
    }
    function makePunc$1962(val$2025, stx$2026) {
        return mkSyntax$1957(stx$2026, val$2025, parser$1949.Token.Punctuator);
    }
    function makeDelim$1963(val$2027, inner$2028, stx$2029) {
        return mkSyntax$1957(stx$2029, val$2027, parser$1949.Token.Delimiter, inner$2028);
    }
    function unwrapSyntax$1964(stx$2030) {
        if (Array.isArray(stx$2030) && stx$2030.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2030 = stx$2030[0];
        }
        if (stx$2030.token) {
            if (stx$2030.token.type === parser$1949.Token.Delimiter) {
                return stx$2030.token;
            } else {
                return stx$2030.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2030);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1965(stx$2031) {
        return _$1948.map(stx$2031, function (stx$2032) {
            if (stx$2032.token.inner) {
                stx$2032.token.inner = syntaxToTokens$1965(stx$2032.token.inner);
            }
            return stx$2032.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1966(tokens$2033) {
        if (!_$1948.isArray(tokens$2033)) {
            tokens$2033 = [tokens$2033];
        }
        return _$1948.map(tokens$2033, function (token$2034) {
            if (token$2034.inner) {
                token$2034.inner = tokensToSyntax$1966(token$2034.inner);
            }
            return syntaxFromToken$1956(token$2034);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1967(tojoin$2035, punc$2036) {
        if (tojoin$2035.length === 0) {
            return [];
        }
        if (punc$2036 === ' ') {
            return tojoin$2035;
        }
        return _$1948.reduce(_$1948.rest(tojoin$2035, 1), function (acc$2037, join$2038) {
            acc$2037.push(makePunc$1962(punc$2036, join$2038), join$2038);
            return acc$2037;
        }, [_$1948.first(tojoin$2035)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1968(tojoin$2039, punc$2040) {
        if (tojoin$2039.length === 0) {
            return [];
        }
        if (punc$2040 === ' ') {
            return _$1948.flatten(tojoin$2039, true);
        }
        return _$1948.reduce(_$1948.rest(tojoin$2039, 1), function (acc$2041, join$2042) {
            acc$2041.push(makePunc$1962(punc$2040, _$1948.first(join$2042)));
            Array.prototype.push.apply(acc$2041, join$2042);
            return acc$2041;
        }, _$1948.first(tojoin$2039));
    }
    function MacroSyntaxError$1969(name$2043, message$2044, stx$2045) {
        this.name = name$2043;
        this.message = message$2044;
        this.stx = stx$2045;
    }
    function throwSyntaxError$1970(name$2046, message$2047, stx$2048) {
        if (stx$2048 && Array.isArray(stx$2048)) {
            stx$2048 = stx$2048[0];
        }
        throw new MacroSyntaxError$1969(name$2046, message$2047, stx$2048);
    }
    function printSyntaxError$1971(code$2049, err$2050) {
        if (!err$2050.stx) {
            return '[' + err$2050.name + '] ' + err$2050.message;
        }
        var token$2051 = err$2050.stx.token;
        var lineNumber$2052 = token$2051.sm_startLineNumber || token$2051.sm_lineNumber || token$2051.startLineNumber || token$2051.lineNumber;
        var lineStart$2053 = token$2051.sm_startLineStart || token$2051.sm_lineStart || token$2051.startLineStart || token$2051.lineStart;
        var start$2054 = (token$2051.sm_startRange || token$2051.sm_range || token$2051.startRange || token$2051.range)[0];
        var offset$2055 = start$2054 - lineStart$2053;
        var line$2056 = '';
        var pre$2057 = lineNumber$2052 + ': ';
        var ch$2058;
        while (ch$2058 = code$2049.charAt(lineStart$2053++)) {
            if (ch$2058 == '\r' || ch$2058 == '\n') {
                break;
            }
            line$2056 += ch$2058;
        }
        return '[' + err$2050.name + '] ' + err$2050.message + '\n' + pre$2057 + line$2056 + '\n' + Array(offset$2055 + pre$2057.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1972(stxarr$2059, shouldResolve$2060) {
        var indent$2061 = 0;
        var unparsedLines$2062 = stxarr$2059.reduce(function (acc$2063, stx$2064) {
                var s$2065 = shouldResolve$2060 ? expander$1950.resolve(stx$2064) : stx$2064.token.value;
                // skip the end of file token
                if (stx$2064.token.type === parser$1949.Token.EOF) {
                    return acc$2063;
                }
                if (stx$2064.token.type === parser$1949.Token.StringLiteral) {
                    s$2065 = '"' + s$2065 + '"';
                }
                if (s$2065 == '{') {
                    acc$2063[0].str += ' ' + s$2065;
                    indent$2061++;
                    acc$2063.unshift({
                        indent: indent$2061,
                        str: ''
                    });
                } else if (s$2065 == '}') {
                    indent$2061--;
                    acc$2063.unshift({
                        indent: indent$2061,
                        str: s$2065
                    });
                    acc$2063.unshift({
                        indent: indent$2061,
                        str: ''
                    });
                } else if (s$2065 == ';') {
                    acc$2063[0].str += s$2065;
                    acc$2063.unshift({
                        indent: indent$2061,
                        str: ''
                    });
                } else {
                    acc$2063[0].str += (acc$2063[0].str ? ' ' : '') + s$2065;
                }
                return acc$2063;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2062.reduce(function (acc$2066, line$2067) {
            var ind$2068 = '';
            while (ind$2068.length < line$2067.indent * 2) {
                ind$2068 += ' ';
            }
            return ind$2068 + line$2067.str + '\n' + acc$2066;
        }, '');
    }
    exports$1947.assert = assert$1951;
    exports$1947.unwrapSyntax = unwrapSyntax$1964;
    exports$1947.makeDelim = makeDelim$1963;
    exports$1947.makePunc = makePunc$1962;
    exports$1947.makeKeyword = makeKeyword$1961;
    exports$1947.makeIdent = makeIdent$1960;
    exports$1947.makeRegex = makeRegex$1959;
    exports$1947.makeValue = makeValue$1958;
    exports$1947.Rename = Rename$1952;
    exports$1947.Mark = Mark$1953;
    exports$1947.Def = Def$1954;
    exports$1947.syntaxFromToken = syntaxFromToken$1956;
    exports$1947.tokensToSyntax = tokensToSyntax$1966;
    exports$1947.syntaxToTokens = syntaxToTokens$1965;
    exports$1947.joinSyntax = joinSyntax$1967;
    exports$1947.joinSyntaxArr = joinSyntaxArr$1968;
    exports$1947.prettyPrint = prettyPrint$1972;
    exports$1947.MacroSyntaxError = MacroSyntaxError$1969;
    exports$1947.throwSyntaxError = throwSyntaxError$1970;
    exports$1947.printSyntaxError = printSyntaxError$1971;
}));
//# sourceMappingURL=syntax.js.map