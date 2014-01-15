(function (root$1941, factory$1942) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1942(exports, require('underscore'), require('./parser'), require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'expander'
        ], factory$1942);
    }
}(this, function (exports$1943, _$1944, parser$1945, expander$1946) {
    function assert$1947(condition$1969, message$1970) {
        if (!condition$1969) {
            throw new Error('ASSERT: ' + message$1970);
        }
    }
    // (CSyntax, Str) -> CContext
    function Rename$1948(id$1971, name$1972, ctx$1973, defctx$1974) {
        defctx$1974 = defctx$1974 || null;
        this.id = id$1971;
        this.name = name$1972;
        this.context = ctx$1973;
        this.def = defctx$1974;
    }
    // (Num) -> CContext
    function Mark$1949(mark$1975, ctx$1976) {
        this.mark = mark$1975;
        this.context = ctx$1976;
    }
    function Def$1950(defctx$1977, ctx$1978) {
        this.defctx = defctx$1977;
        this.context = ctx$1978;
    }
    function Syntax$1951(token$1979, oldstx$1980) {
        this.token = token$1979;
        this.context = oldstx$1980 && oldstx$1980.context ? oldstx$1980.context : null;
        this.deferredContext = oldstx$1980 && oldstx$1980.deferredContext ? oldstx$1980.deferredContext : null;
    }
    Syntax$1951.prototype = {
        mark: function (newMark$1981) {
            if (this.token.inner) {
                var next$1982 = syntaxFromToken$1952(this.token, this);
                next$1982.deferredContext = new Mark$1949(newMark$1981, this.deferredContext);
                return next$1982;
            }
            return syntaxFromToken$1952(this.token, { context: new Mark$1949(newMark$1981, this.context) });
        },
        rename: function (id$1983, name$1984, defctx$1985) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next$1986 = syntaxFromToken$1952(this.token, this);
                next$1986.deferredContext = new Rename$1948(id$1983, name$1984, this.deferredContext, defctx$1985);
                return next$1986;
            }
            if (this.token.type === parser$1945.Token.Identifier || this.token.type === parser$1945.Token.Keyword || this.token.type === parser$1945.Token.Punctuator) {
                return syntaxFromToken$1952(this.token, { context: new Rename$1948(id$1983, name$1984, this.context, defctx$1985) });
            } else {
                return this;
            }
        },
        addDefCtx: function (defctx$1987) {
            if (this.token.inner) {
                var next$1988 = syntaxFromToken$1952(this.token, this);
                next$1988.deferredContext = new Def$1950(defctx$1987, this.deferredContext);
                return next$1988;
            }
            return syntaxFromToken$1952(this.token, { context: new Def$1950(defctx$1987, this.context) });
        },
        getDefCtx: function () {
            var ctx$1989 = this.context;
            while (ctx$1989 !== null) {
                if (ctx$1989 instanceof Def$1950) {
                    return ctx$1989.defctx;
                }
                ctx$1989 = ctx$1989.context;
            }
            return null;
        },
        expose: function () {
            assert$1947(this.token.type === parser$1945.Token.Delimiter, 'Only delimiters can be exposed');
            function applyContext$1990(stxCtx$1991, ctx$1992) {
                if (ctx$1992 == null) {
                    return stxCtx$1991;
                } else if (ctx$1992 instanceof Rename$1948) {
                    return new Rename$1948(ctx$1992.id, ctx$1992.name, applyContext$1990(stxCtx$1991, ctx$1992.context), ctx$1992.def);
                } else if (ctx$1992 instanceof Mark$1949) {
                    return new Mark$1949(ctx$1992.mark, applyContext$1990(stxCtx$1991, ctx$1992.context));
                } else if (ctx$1992 instanceof Def$1950) {
                    return new Def$1950(ctx$1992.defctx, applyContext$1990(stxCtx$1991, ctx$1992.context));
                } else {
                    assert$1947(false, 'unknown context type');
                }
            }
            this.token.inner = _$1944.map(this.token.inner, _$1944.bind(function (stx$1993) {
                if (stx$1993.token.inner) {
                    var next$1994 = syntaxFromToken$1952(stx$1993.token, stx$1993);
                    next$1994.deferredContext = applyContext$1990(stx$1993.deferredContext, this.deferredContext);
                    return next$1994;
                } else {
                    return syntaxFromToken$1952(stx$1993.token, { context: applyContext$1990(stx$1993.context, this.deferredContext) });
                }
            }, this));
            this.deferredContext = null;
            return this;
        },
        toString: function () {
            var val$1995 = this.token.type === parser$1945.Token.EOF ? 'EOF' : this.token.value;
            return '[Syntax: ' + val$1995 + ']';
        }
    };
    // (CToken, CSyntax?) -> CSyntax
    function syntaxFromToken$1952(token$1996, oldstx$1997) {
        return new Syntax$1951(token$1996, oldstx$1997);
    }
    function mkSyntax$1953(stx$1998, value$1999, type$2000, inner$2001) {
        if (stx$1998 && Array.isArray(stx$1998) && stx$1998.length === 1) {
            stx$1998 = stx$1998[0];
        } else if (stx$1998 && Array.isArray(stx$1998)) {
            throwSyntaxError$1966('mkSyntax', 'Expecting a syntax object or an array with a single syntax object');
        } else if (stx$1998 === undefined) {
            throwSyntaxError$1966('mkSyntax', 'You must provide an old syntax object context (or null) when creating a new syntax object.');
        }
        if (type$2000 === parser$1945.Token.Delimiter) {
            var startLineNumber$2002, startLineStart$2003, endLineNumber$2004, endLineStart$2005, startRange$2006, endRange$2007;
            if (!Array.isArray(inner$2001)) {
                throwSyntaxError$1966('mkSyntax', 'Must provide inner array of syntax objects when creating a delimiter');
            }
            if (stx$1998 && stx$1998.token.type === parser$1945.Token.Delimiter) {
                startLineNumber$2002 = stx$1998.token.startLineNumber;
                startLineStart$2003 = stx$1998.token.startLineStart;
                endLineNumber$2004 = stx$1998.token.endLineNumber;
                endLineStart$2005 = stx$1998.token.endLineStart;
                startRange$2006 = stx$1998.token.startRange;
                endRange$2007 = stx$1998.token.endRange;
            } else if (stx$1998 && stx$1998.token) {
                startLineNumber$2002 = stx$1998.token.lineNumber;
                startLineStart$2003 = stx$1998.token.lineStart;
                endLineNumber$2004 = stx$1998.token.lineNumber;
                endLineStart$2005 = stx$1998.token.lineStart;
                startRange$2006 = stx$1998.token.range;
                endRange$2007 = stx$1998.token.range;
            }
            return syntaxFromToken$1952({
                type: parser$1945.Token.Delimiter,
                value: value$1999,
                inner: inner$2001,
                startLineStart: startLineStart$2003,
                startLineNumber: startLineNumber$2002,
                endLineStart: endLineStart$2005,
                endLineNumber: endLineNumber$2004,
                startRange: startRange$2006,
                endRange: endRange$2007
            }, stx$1998);
        } else {
            var lineStart$2008, lineNumber$2009, range$2010;
            if (stx$1998 && stx$1998.token.type === parser$1945.Token.Delimiter) {
                lineStart$2008 = stx$1998.token.startLineStart;
                lineNumber$2009 = stx$1998.token.startLineNumber;
                range$2010 = stx$1998.token.startRange;
            } else if (stx$1998 && stx$1998.token) {
                lineStart$2008 = stx$1998.token.lineStart;
                lineNumber$2009 = stx$1998.token.lineNumber;
                range$2010 = stx$1998.token.range;
            }
            return syntaxFromToken$1952({
                type: type$2000,
                value: value$1999,
                lineStart: lineStart$2008,
                lineNumber: lineNumber$2009,
                range: range$2010
            }, stx$1998);
        }
    }
    function makeValue$1954(val$2011, stx$2012) {
        if (typeof val$2011 === 'boolean') {
            return mkSyntax$1953(stx$2012, val$2011 ? 'true' : 'false', parser$1945.Token.BooleanLiteral);
        } else if (typeof val$2011 === 'number') {
            if (val$2011 !== val$2011) {
                return makeDelim$1959('()', [
                    makeValue$1954(0, stx$2012),
                    makePunc$1958('/', stx$2012),
                    makeValue$1954(0, stx$2012)
                ], stx$2012);
            }
            if (val$2011 < 0) {
                return makeDelim$1959('()', [
                    makePunc$1958('-', stx$2012),
                    makeValue$1954(Math.abs(val$2011), stx$2012)
                ], stx$2012);
            } else {
                return mkSyntax$1953(stx$2012, val$2011, parser$1945.Token.NumericLiteral);
            }
        } else if (typeof val$2011 === 'string') {
            return mkSyntax$1953(stx$2012, val$2011, parser$1945.Token.StringLiteral);
        } else if (val$2011 === null) {
            return mkSyntax$1953(stx$2012, 'null', parser$1945.Token.NullLiteral);
        } else {
            throwSyntaxError$1966('makeValue', 'Cannot make value syntax object from: ' + val$2011);
        }
    }
    function makeRegex$1955(val$2013, flags$2014, stx$2015) {
        var newstx$2016 = mkSyntax$1953(stx$2015, new RegExp(val$2013, flags$2014), parser$1945.Token.RegexLiteral);
        // regex tokens need the extra field literal on token
        newstx$2016.token.literal = val$2013;
        return newstx$2016;
    }
    function makeIdent$1956(val$2017, stx$2018) {
        return mkSyntax$1953(stx$2018, val$2017, parser$1945.Token.Identifier);
    }
    function makeKeyword$1957(val$2019, stx$2020) {
        return mkSyntax$1953(stx$2020, val$2019, parser$1945.Token.Keyword);
    }
    function makePunc$1958(val$2021, stx$2022) {
        return mkSyntax$1953(stx$2022, val$2021, parser$1945.Token.Punctuator);
    }
    function makeDelim$1959(val$2023, inner$2024, stx$2025) {
        return mkSyntax$1953(stx$2025, val$2023, parser$1945.Token.Delimiter, inner$2024);
    }
    function unwrapSyntax$1960(stx$2026) {
        if (Array.isArray(stx$2026) && stx$2026.length === 1) {
            // pull stx out of single element arrays for convenience 
            stx$2026 = stx$2026[0];
        }
        if (stx$2026.token) {
            if (stx$2026.token.type === parser$1945.Token.Delimiter) {
                return stx$2026.token;
            } else {
                return stx$2026.token.value;
            }
        } else {
            throw new Error('Not a syntax object: ' + stx$2026);
        }
    }
    // ([...CSyntax]) -> [...CToken]
    function syntaxToTokens$1961(stx$2027) {
        return _$1944.map(stx$2027, function (stx$2028) {
            if (stx$2028.token.inner) {
                stx$2028.token.inner = syntaxToTokens$1961(stx$2028.token.inner);
            }
            return stx$2028.token;
        });
    }
    // (CToken or [...CToken]) -> [...CSyntax]
    function tokensToSyntax$1962(tokens$2029) {
        if (!_$1944.isArray(tokens$2029)) {
            tokens$2029 = [tokens$2029];
        }
        return _$1944.map(tokens$2029, function (token$2030) {
            if (token$2030.inner) {
                token$2030.inner = tokensToSyntax$1962(token$2030.inner);
            }
            return syntaxFromToken$1952(token$2030);
        });
    }
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$1963(tojoin$2031, punc$2032) {
        if (tojoin$2031.length === 0) {
            return [];
        }
        if (punc$2032 === ' ') {
            return tojoin$2031;
        }
        return _$1944.reduce(_$1944.rest(tojoin$2031, 1), function (acc$2033, join$2034) {
            acc$2033.push(makePunc$1958(punc$2032, join$2034), join$2034);
            return acc$2033;
        }, [_$1944.first(tojoin$2031)]);
    }
    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr$1964(tojoin$2035, punc$2036) {
        if (tojoin$2035.length === 0) {
            return [];
        }
        if (punc$2036 === ' ') {
            return _$1944.flatten(tojoin$2035, true);
        }
        return _$1944.reduce(_$1944.rest(tojoin$2035, 1), function (acc$2037, join$2038) {
            acc$2037.push(makePunc$1958(punc$2036, _$1944.first(join$2038)));
            Array.prototype.push.apply(acc$2037, join$2038);
            return acc$2037;
        }, _$1944.first(tojoin$2035));
    }
    function MacroSyntaxError$1965(name$2039, message$2040, stx$2041) {
        this.name = name$2039;
        this.message = message$2040;
        this.stx = stx$2041;
    }
    function throwSyntaxError$1966(name$2042, message$2043, stx$2044) {
        if (stx$2044 && Array.isArray(stx$2044)) {
            stx$2044 = stx$2044[0];
        }
        throw new MacroSyntaxError$1965(name$2042, message$2043, stx$2044);
    }
    function printSyntaxError$1967(code$2045, err$2046) {
        if (!err$2046.stx) {
            return '[' + err$2046.name + '] ' + err$2046.message;
        }
        var token$2047 = err$2046.stx.token;
        var lineNumber$2048 = token$2047.sm_startLineNumber || token$2047.sm_lineNumber || token$2047.startLineNumber || token$2047.lineNumber;
        var lineStart$2049 = token$2047.sm_startLineStart || token$2047.sm_lineStart || token$2047.startLineStart || token$2047.lineStart;
        var start$2050 = (token$2047.sm_startRange || token$2047.sm_range || token$2047.startRange || token$2047.range)[0];
        var offset$2051 = start$2050 - lineStart$2049;
        var line$2052 = '';
        var pre$2053 = lineNumber$2048 + ': ';
        var ch$2054;
        while (ch$2054 = code$2045.charAt(lineStart$2049++)) {
            if (ch$2054 == '\r' || ch$2054 == '\n') {
                break;
            }
            line$2052 += ch$2054;
        }
        return '[' + err$2046.name + '] ' + err$2046.message + '\n' + pre$2053 + line$2052 + '\n' + Array(offset$2051 + pre$2053.length).join(' ') + ' ^';
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$1968(stxarr$2055, shouldResolve$2056) {
        var indent$2057 = 0;
        var unparsedLines$2058 = stxarr$2055.reduce(function (acc$2059, stx$2060) {
                var s$2061 = shouldResolve$2056 ? expander$1946.resolve(stx$2060) : stx$2060.token.value;
                // skip the end of file token
                if (stx$2060.token.type === parser$1945.Token.EOF) {
                    return acc$2059;
                }
                if (stx$2060.token.type === parser$1945.Token.StringLiteral) {
                    s$2061 = '"' + s$2061 + '"';
                }
                if (s$2061 == '{') {
                    acc$2059[0].str += ' ' + s$2061;
                    indent$2057++;
                    acc$2059.unshift({
                        indent: indent$2057,
                        str: ''
                    });
                } else if (s$2061 == '}') {
                    indent$2057--;
                    acc$2059.unshift({
                        indent: indent$2057,
                        str: s$2061
                    });
                    acc$2059.unshift({
                        indent: indent$2057,
                        str: ''
                    });
                } else if (s$2061 == ';') {
                    acc$2059[0].str += s$2061;
                    acc$2059.unshift({
                        indent: indent$2057,
                        str: ''
                    });
                } else {
                    acc$2059[0].str += (acc$2059[0].str ? ' ' : '') + s$2061;
                }
                return acc$2059;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2058.reduce(function (acc$2062, line$2063) {
            var ind$2064 = '';
            while (ind$2064.length < line$2063.indent * 2) {
                ind$2064 += ' ';
            }
            return ind$2064 + line$2063.str + '\n' + acc$2062;
        }, '');
    }
    exports$1943.assert = assert$1947;
    exports$1943.unwrapSyntax = unwrapSyntax$1960;
    exports$1943.makeDelim = makeDelim$1959;
    exports$1943.makePunc = makePunc$1958;
    exports$1943.makeKeyword = makeKeyword$1957;
    exports$1943.makeIdent = makeIdent$1956;
    exports$1943.makeRegex = makeRegex$1955;
    exports$1943.makeValue = makeValue$1954;
    exports$1943.Rename = Rename$1948;
    exports$1943.Mark = Mark$1949;
    exports$1943.Def = Def$1950;
    exports$1943.syntaxFromToken = syntaxFromToken$1952;
    exports$1943.tokensToSyntax = tokensToSyntax$1962;
    exports$1943.syntaxToTokens = syntaxToTokens$1961;
    exports$1943.joinSyntax = joinSyntax$1963;
    exports$1943.joinSyntaxArr = joinSyntaxArr$1964;
    exports$1943.prettyPrint = prettyPrint$1968;
    exports$1943.MacroSyntaxError = MacroSyntaxError$1965;
    exports$1943.throwSyntaxError = throwSyntaxError$1966;
    exports$1943.printSyntaxError = printSyntaxError$1967;
}));
//# sourceMappingURL=syntax.js.map