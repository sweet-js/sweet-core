"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _10854 = require("underscore"),
    parser10855 = require("./parser"),
    expander10856 = require("./expander"),
    Immutable10857 = require("immutable"),
    StringMap10858 = require("./data/stringMap"),
    assert10859 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber10860 = 1;
var nextFresh10861 = 0;
function fresh10862() {
    return nextFresh10861++;
}
function freshScope10863(bindings10893) {
    return new Scope(bindings10893);
}
function Rename10864(id10894, name10895, ctx10896, defctx10897, phase10898) {
    defctx10897 = defctx10897 || null;
    this.id = id10894;
    this.name = name10895;
    this.context = ctx10896;
    this.def = defctx10897;
    this.instNum = globalContextInstanceNumber10860++;
    this.phase = phase10898;
}
function Mark10865(mark10899, ctx10900) {
    this.mark = mark10899;
    this.context = ctx10900;
    this.instNum = globalContextInstanceNumber10860++;
}
function Def10866(defctx10901, ctx10902) {
    this.defctx = defctx10901;
    this.context = ctx10902;
    this.instNum = globalContextInstanceNumber10860++;
}
function Imported10867(localName10903, exportName10904, phase10905, mod10906, ctx10907) {
    this.localName = localName10903;
    this.exportName = exportName10904;
    this.phase = phase10905;
    this.mod = mod10906;
    this.context = ctx10907;
    this.instNum = globalContextInstanceNumber10860++;
}
var scopeIndex10868 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert10859(bindings, "must pass in the bindings");
        this.name = scopeIndex10868++;
        this.bindings = bindings;
    }

    _prototypeProperties(Scope, null, {
        toString: {
            value: function toString() {
                return this.name;
            },
            writable: true,
            configurable: true
        }
    });

    return Scope;
})();

function Syntax10869(token10908, oldstx10909) {
    this.token = token10908;
    this.context = oldstx10909 && oldstx10909.context ? oldstx10909.context : Immutable10857.List();
    this.props = oldstx10909 && oldstx10909.props ? oldstx10909.props : {};
}
Syntax10869.prototype = {
    // addScope: function(scope) {
    //     if (this.token.inner) {
    //         this.token.inner = this.token.inner.map(stx => stx.addScope(scope));
    //     }
    //     // double scopes cancel out just like marks did
    //     // let idx = this.context.indexOf(scope);
    //     // let newCtx = this.context;
    //     // if (idx != null) {
    //     //     newCtx = this.context.delete(idx);
    //     // } else {
    //     // }
    //     let newCtx = this.context.unshift(scope);
    //     return syntaxFromToken(this.token, {context: newCtx,
    //                                         props: this.props});
    // },
    // delScope: function(scope) {
    //     if (this.token.inner) {
    //         this.token.inner = this.token.inner.map(stx => stx.addScope(scope));
    //     }
    //     let idx = this.context.indexOf(scope);
    //     let newCtx = this.context;
    //     if (idx != null) {
    //         newCtx = this.context.delete(idx);
    //     }
    //     return syntaxFromToken(this.token, {context: newCtx,
    //                                         props: this.props});
    // },
    // debugScope: function() {
    //     return '{' + this.context.map(s => s.name).join(',') + '}';
    // },
    // (Int) -> CSyntax
    // non mutating
    mark: function mark(newMark10910) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx10912) {
                return stx10912.mark(newMark10910);
            });
        }
        var newCtx10911 = undefined;
        if (this.context.first() === newMark10910) {
            // double scopes cancel
            newCtx10911 = this.context.rest();
        } else {
            newCtx10911 = this.context.unshift(newMark10910);
        }
        return syntaxFromToken10870(this.token, {
            context: newCtx10911,
            props: this.props
        });
    },
    delScope: function delScope(scope10913) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx10914) {
                return stx10914.delScope(scope10913);
            });
        }
        return syntaxFromToken10870(this.token, {
            context: this.context.filter(function (s10915) {
                return s10915 !== scope10913;
            }),
            props: this.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id10916, name10917, defctx10918, phase10919) {
        var // defer renaming of delimiters
        newctx10920 = this.context == null ? [name10917] : this.context.concat(name10917);
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx10921) {
                return stx10921.rename(id10916, name10917, defctx10918, phase10919);
            });
            return syntaxFromToken10870(this.token, {
                context: newctx10920,
                props: this.props
            });
        }
        return syntaxFromToken10870(this.token, {
            context: newctx10920,
            props: this.props
        });
    },
    imported: function imported(localName10922, exportName10923, phase10924, mod10925) {
        return this;
    },
    addDefCtx: function addDefCtx(defctx10926) {
        return this;
    },
    getDefCtx: function getDefCtx() {
        var ctx10927 = this.context;
        while (ctx10927 !== null) {
            if (ctx10927 instanceof Def10866) {
                return ctx10927.defctx;
            }
            ctx10927 = ctx10927.context;
        }
        return null;
    },
    toString: function toString() {
        var val10928 = this.token.type === parser10855.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val10928 + "]";
    },
    clone: function clone() {
        var newTok10929 = {};
        var keys10930 = Object.keys(this.token);
        for (var i10931 = 0, len10932 = keys10930.length, key10933; i10931 < len10932; i10931++) {
            key10933 = keys10930[i10931];
            if (Array.isArray(this.token[key10933])) {
                if (key10933 === "inner") {
                    // need to clone the children of a delimiter
                    newTok10929[key10933] = this.token[key10933].reduce(function (acc10934, stx10935) {
                        acc10934.push(stx10935.clone());
                        return acc10934;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok10929[key10933] = this.token[key10933].reduce(function (acc10936, el10937) {
                        acc10936.push(el10937);
                        return acc10936;
                    }, []);
                }
            } else {
                newTok10929[key10933] = this.token[key10933];
            }
        }
        return syntaxFromToken10870(newTok10929, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser10855.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser10855.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser10855.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser10855.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser10855.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser10855.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser10855.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser10855.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser10855.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser10855.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser10855.Token.EOF;
    }
};
function syntaxFromToken10870(token10938, oldstx10939) {
    return new Syntax10869(token10938, oldstx10939);
}
function mkSyntax10871(stx10940, value10941, type10942, inner10943) {
    if (stx10940 && Array.isArray(stx10940) && stx10940.length === 1) {
        stx10940 = stx10940[0];
    } else if (stx10940 && Array.isArray(stx10940)) {
        throwSyntaxError10886("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx10940 === undefined) {
        throwSyntaxError10886("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type10942 === parser10855.Token.Delimiter) {
        var startLineNumber10944, startLineStart10945, endLineNumber10946, endLineStart10947, startRange10948, endRange10949;
        if (!Array.isArray(inner10943)) {
            throwSyntaxError10886("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx10940 && stx10940.token.type === parser10855.Token.Delimiter) {
            startLineNumber10944 = stx10940.token.startLineNumber;
            startLineStart10945 = stx10940.token.startLineStart;
            endLineNumber10946 = stx10940.token.endLineNumber;
            endLineStart10947 = stx10940.token.endLineStart;
            startRange10948 = stx10940.token.startRange;
            endRange10949 = stx10940.token.endRange;
        } else if (stx10940 && stx10940.token) {
            startLineNumber10944 = stx10940.token.lineNumber;
            startLineStart10945 = stx10940.token.lineStart;
            endLineNumber10946 = stx10940.token.lineNumber;
            endLineStart10947 = stx10940.token.lineStart;
            startRange10948 = stx10940.token.range;
            endRange10949 = stx10940.token.range;
        }
        return syntaxFromToken10870({
            type: parser10855.Token.Delimiter,
            value: value10941,
            inner: inner10943,
            startLineStart: startLineStart10945,
            startLineNumber: startLineNumber10944,
            endLineStart: endLineStart10947,
            endLineNumber: endLineNumber10946,
            startRange: startRange10948,
            endRange: endRange10949
        }, stx10940);
    } else {
        var lineStart10950, lineNumber10951, range10952;
        if (stx10940 && stx10940.token.type === parser10855.Token.Delimiter) {
            lineStart10950 = stx10940.token.startLineStart;
            lineNumber10951 = stx10940.token.startLineNumber;
            range10952 = stx10940.token.startRange;
        } else if (stx10940 && stx10940.token) {
            lineStart10950 = stx10940.token.lineStart;
            lineNumber10951 = stx10940.token.lineNumber;
            range10952 = stx10940.token.range;
        }
        return syntaxFromToken10870({
            type: type10942,
            value: value10941,
            lineStart: lineStart10950,
            lineNumber: lineNumber10951,
            range: range10952
        }, stx10940);
    }
}
function makeValue10872(val10953, stx10954) {
    if (typeof val10953 === "boolean") {
        return mkSyntax10871(stx10954, val10953 ? "true" : "false", parser10855.Token.BooleanLiteral);
    } else if (typeof val10953 === "number") {
        if (val10953 !== val10953) {
            return makeDelim10877("()", [makeValue10872(0, stx10954), makePunc10876("/", stx10954), makeValue10872(0, stx10954)], stx10954);
        }
        if (val10953 < 0) {
            return makeDelim10877("()", [makePunc10876("-", stx10954), makeValue10872(Math.abs(val10953), stx10954)], stx10954);
        } else {
            return mkSyntax10871(stx10954, val10953, parser10855.Token.NumericLiteral);
        }
    } else if (typeof val10953 === "string") {
        return mkSyntax10871(stx10954, val10953, parser10855.Token.StringLiteral);
    } else if (val10953 === null) {
        return mkSyntax10871(stx10954, "null", parser10855.Token.NullLiteral);
    } else {
        throwSyntaxError10886("makeValue", "Cannot make value syntax object from: " + val10953);
    }
}
function makeRegex10873(val10955, flags10956, stx10957) {
    var newstx10958 = mkSyntax10871(stx10957, new RegExp(val10955, flags10956), parser10855.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx10958.token.literal = val10955;
    return newstx10958;
}
function makeIdent10874(val10959, stx10960) {
    return mkSyntax10871(stx10960, val10959, parser10855.Token.Identifier);
}
function makeKeyword10875(val10961, stx10962) {
    return mkSyntax10871(stx10962, val10961, parser10855.Token.Keyword);
}
function makePunc10876(val10963, stx10964) {
    return mkSyntax10871(stx10964, val10963, parser10855.Token.Punctuator);
}
function makeDelim10877(val10965, inner10966, stx10967) {
    return mkSyntax10871(stx10967, val10965, parser10855.Token.Delimiter, inner10966);
}
function unwrapSyntax10878(stx10968) {
    if (Array.isArray(stx10968) && stx10968.length === 1) {
        // pull stx out of single element arrays for convenience
        stx10968 = stx10968[0];
    }
    if (stx10968.token) {
        if (stx10968.token.type === parser10855.Token.Delimiter) {
            return stx10968.token;
        } else {
            return stx10968.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx10968);
    }
}
function syntaxToTokens10879(stx10969) {
    return _10854.map(stx10969, function (stx10970) {
        if (stx10970.token.inner) {
            stx10970.token.inner = syntaxToTokens10879(stx10970.token.inner);
        }
        return stx10970.token;
    });
}
function tokensToSyntax10880(tokens10971) {
    if (!_10854.isArray(tokens10971)) {
        tokens10971 = [tokens10971];
    }
    return _10854.map(tokens10971, function (token10972) {
        if (token10972.inner) {
            token10972.inner = tokensToSyntax10880(token10972.inner);
        }
        return syntaxFromToken10870(token10972);
    });
}
function joinSyntax10881(tojoin10973, punc10974) {
    if (tojoin10973.length === 0) {
        return [];
    }
    if (punc10974 === " ") {
        return tojoin10973;
    }
    return _10854.reduce(_10854.rest(tojoin10973, 1), function (acc10975, join10976) {
        acc10975.push(cloneSyntax10883(punc10974), join10976);
        return acc10975;
    }, [_10854.first(tojoin10973)]);
}
function joinSyntaxArray10882(tojoin10977, punc10978) {
    if (tojoin10977.length === 0) {
        return [];
    }
    if (punc10978 === " ") {
        return _10854.flatten(tojoin10977, true);
    }
    return _10854.reduce(_10854.rest(tojoin10977, 1), function (acc10979, join10980) {
        acc10979.push(cloneSyntax10883(punc10978));
        Array.prototype.push.apply(acc10979, join10980);
        return acc10979;
    }, _10854.first(tojoin10977));
}
function cloneSyntax10883(stx10981) {
    return syntaxFromToken10870(_10854.clone(stx10981.token), stx10981);
}
function cloneSyntaxArray10884(arr10982) {
    return arr10982.map(function (stx10983) {
        var o10984 = cloneSyntax10883(stx10983);
        if (o10984.token.type === parser10855.Token.Delimiter) {
            o10984.token.inner = cloneSyntaxArray10884(o10984.token.inner);
        }
        return o10984;
    });
}
function MacroSyntaxError10885(name10985, message10986, stx10987) {
    this.name = name10985;
    this.message = message10986;
    this.stx = stx10987;
}
function throwSyntaxError10886(name10988, message10989, stx10990) {
    if (stx10990 && Array.isArray(stx10990)) {
        stx10990 = stx10990[0];
    }
    throw new MacroSyntaxError10885(name10988, message10989, stx10990);
}
function SyntaxCaseError10887(message10991) {
    this.message = message10991;
}
function throwSyntaxCaseError10888(message10992) {
    throw new SyntaxCaseError10887(message10992);
}
function printSyntaxError10889(code10993, err10994) {
    if (!err10994.stx) {
        return "[" + err10994.name + "] " + err10994.message;
    }
    var token10995 = err10994.stx.token;
    var lineNumber10996 = _10854.find([token10995.sm_startLineNumber, token10995.sm_lineNumber, token10995.startLineNumber, token10995.lineNumber], _10854.isNumber);
    var lineStart10997 = _10854.find([token10995.sm_startLineStart, token10995.sm_lineStart, token10995.startLineStart, token10995.lineStart], _10854.isNumber);
    var start10998 = (token10995.sm_startRange || token10995.sm_range || token10995.startRange || token10995.range)[0];
    var offset10999 = start10998 - lineStart10997;
    var line11000 = "";
    var pre11001 = lineNumber10996 + ": ";
    var ch11002;
    while (ch11002 = code10993.charAt(lineStart10997++)) {
        if (ch11002 == "\r" || ch11002 == "\n") {
            break;
        }
        line11000 += ch11002;
    }
    return "[" + err10994.name + "] " + err10994.message + "\n" + pre11001 + line11000 + "\n" + Array(offset10999 + pre11001.length).join(" ") + " ^";
}
function prettyPrint10890(stxarr11003, shouldResolve11004) {
    var indent11005 = 0;
    var unparsedLines11006 = stxarr11003.reduce(function (acc11007, stx11008) {
        var s11009 = shouldResolve11004 ? expander10856.resolve(stx11008) : stx11008.token.value;
        if ( // skip the end of file token
        stx11008.token.type === parser10855.Token.EOF) {
            return acc11007;
        }
        if (stx11008.token.type === parser10855.Token.StringLiteral) {
            s11009 = "\"" + s11009 + "\"";
        }
        if (s11009 == "{") {
            acc11007[0].str += " " + s11009;
            indent11005++;
            acc11007.unshift({
                indent: indent11005,
                str: ""
            });
        } else if (s11009 == "}") {
            indent11005--;
            acc11007.unshift({
                indent: indent11005,
                str: s11009
            });
            acc11007.unshift({
                indent: indent11005,
                str: ""
            });
        } else if (s11009 == ";") {
            acc11007[0].str += s11009;
            acc11007.unshift({
                indent: indent11005,
                str: ""
            });
        } else {
            acc11007[0].str += (acc11007[0].str ? " " : "") + s11009;
        }
        return acc11007;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11006.reduce(function (acc11010, line11011) {
        var ind11012 = "";
        while (ind11012.length < line11011.indent * 2) {
            ind11012 += " ";
        }
        return ind11012 + line11011.str + "\n" + acc11010;
    }, "");
}
function adjustLineContext10891(stx11013, original11014, current11015) {
    if ( // short circuit when the array is empty;
    stx11013.length === 0) {
        return stx11013;
    }
    current11015 = current11015 || {
        lastLineNumber: stx11013[0].token.lineNumber || stx11013[0].token.startLineNumber,
        lineNumber: original11014.token.lineNumber
    };
    return _10854.map(stx11013, function (stx11016) {
        if (stx11016.isDelimiter()) {
            // handle tokens with missing line info
            stx11016.token.startLineNumber = typeof stx11016.token.startLineNumber == "undefined" ? original11014.token.lineNumber : stx11016.token.startLineNumber;
            stx11016.token.endLineNumber = typeof stx11016.token.endLineNumber == "undefined" ? original11014.token.lineNumber : stx11016.token.endLineNumber;
            stx11016.token.startLineStart = typeof stx11016.token.startLineStart == "undefined" ? original11014.token.lineStart : stx11016.token.startLineStart;
            stx11016.token.endLineStart = typeof stx11016.token.endLineStart == "undefined" ? original11014.token.lineStart : stx11016.token.endLineStart;
            stx11016.token.startRange = typeof stx11016.token.startRange == "undefined" ? original11014.token.range : stx11016.token.startRange;
            stx11016.token.endRange = typeof stx11016.token.endRange == "undefined" ? original11014.token.range : stx11016.token.endRange;
            stx11016.token.sm_startLineNumber = typeof stx11016.token.sm_startLineNumber == "undefined" ? stx11016.token.startLineNumber : stx11016.token.sm_startLineNumber;
            stx11016.token.sm_endLineNumber = typeof stx11016.token.sm_endLineNumber == "undefined" ? stx11016.token.endLineNumber : stx11016.token.sm_endLineNumber;
            stx11016.token.sm_startLineStart = typeof stx11016.token.sm_startLineStart == "undefined" ? stx11016.token.startLineStart : stx11016.token.sm_startLineStart;
            stx11016.token.sm_endLineStart = typeof stx11016.token.sm_endLineStart == "undefined" ? stx11016.token.endLineStart : stx11016.token.sm_endLineStart;
            stx11016.token.sm_startRange = typeof stx11016.token.sm_startRange == "undefined" ? stx11016.token.startRange : stx11016.token.sm_startRange;
            stx11016.token.sm_endRange = typeof stx11016.token.sm_endRange == "undefined" ? stx11016.token.endRange : stx11016.token.sm_endRange;
            if (stx11016.token.startLineNumber !== current11015.lineNumber) {
                if (stx11016.token.startLineNumber !== current11015.lastLineNumber) {
                    current11015.lineNumber++;
                    current11015.lastLineNumber = stx11016.token.startLineNumber;
                    stx11016.token.startLineNumber = current11015.lineNumber;
                } else {
                    current11015.lastLineNumber = stx11016.token.startLineNumber;
                    stx11016.token.startLineNumber = current11015.lineNumber;
                }
            }
            return stx11016;
        }
        // handle tokens with missing line info
        stx11016.token.lineNumber = typeof stx11016.token.lineNumber == "undefined" ? original11014.token.lineNumber : stx11016.token.lineNumber;
        stx11016.token.lineStart = typeof stx11016.token.lineStart == "undefined" ? original11014.token.lineStart : stx11016.token.lineStart;
        stx11016.token.range = typeof stx11016.token.range == "undefined" ? original11014.token.range : stx11016.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11016.token.sm_lineNumber = typeof stx11016.token.sm_lineNumber == "undefined" ? stx11016.token.lineNumber : stx11016.token.sm_lineNumber;
        stx11016.token.sm_lineStart = typeof stx11016.token.sm_lineStart == "undefined" ? stx11016.token.lineStart : stx11016.token.sm_lineStart;
        stx11016.token.sm_range = typeof stx11016.token.sm_range == "undefined" ? stx11016.token.range.slice() : stx11016.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11016.token.lineNumber !== current11015.lineNumber) {
            if (stx11016.token.lineNumber !== current11015.lastLineNumber) {
                current11015.lineNumber++;
                current11015.lastLineNumber = stx11016.token.lineNumber;
                stx11016.token.lineNumber = current11015.lineNumber;
            } else {
                current11015.lastLineNumber = stx11016.token.lineNumber;
                stx11016.token.lineNumber = current11015.lineNumber;
            }
        }
        return stx11016;
    });
}
function makeMultiToken10892(stxl11017) {
    if (stxl11017 instanceof Syntax10869 && stxl11017.isDelimiter()) {
        return makeIdent10874(stxl11017.token.inner.map(unwrapSyntax10878).join(""), stxl11017.token.inner[0]);
    } else if (stxl11017 instanceof Syntax10869) {
        return stxl11017;
    } else {
        assert10859(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken10892;
exports.unwrapSyntax = unwrapSyntax10878;
exports.makeDelim = makeDelim10877;
exports.makePunc = makePunc10876;
exports.makeKeyword = makeKeyword10875;
exports.makeIdent = makeIdent10874;
exports.makeRegex = makeRegex10873;
exports.makeValue = makeValue10872;
exports.Rename = Rename10864;
exports.Mark = Mark10865;
exports.Def = Def10866;
exports.Imported = Imported10867;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken10870;
exports.tokensToSyntax = tokensToSyntax10880;
exports.syntaxToTokens = syntaxToTokens10879;
exports.isSyntax = function (obj11018) {
    obj11018 = Array.isArray(obj11018) ? obj11018[0] : obj11018;
    return obj11018 instanceof Syntax10869;
};
exports.joinSyntax = joinSyntax10881;
exports.joinSyntaxArray = joinSyntaxArray10882;
exports.cloneSyntax = cloneSyntax10883;
exports.cloneSyntaxArray = cloneSyntaxArray10884;
exports.prettyPrint = prettyPrint10890;
exports.MacroSyntaxError = MacroSyntaxError10885;
exports.throwSyntaxError = throwSyntaxError10886;
exports.SyntaxCaseError = SyntaxCaseError10887;
exports.throwSyntaxCaseError = throwSyntaxCaseError10888;
exports.printSyntaxError = printSyntaxError10889;
exports.adjustLineContext = adjustLineContext10891;
exports.fresh = fresh10862;
exports.freshScope = freshScope10863;
// import @ from "contracts.js"
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map