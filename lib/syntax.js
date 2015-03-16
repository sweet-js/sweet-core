"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11317 = require("underscore"),
    parser11318 = require("./parser"),
    expander11319 = require("./expander"),
    Immutable11320 = require("immutable"),
    StringMap11321 = require("./data/stringMap"),
    assert11322 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11323 = 1;
var nextFresh11324 = 0;
function fresh11325() {
    return nextFresh11324++;
}
function freshScope11326(bindings11352) {
    return new Scope(bindings11352);
}
// @ let Token = {
//     type: ?Num,
//     value: ?Any,
//     range: ?[Num, Num]
// }
// @ let Context = Null or {
//     context: Context
// }
// @ let SyntaxObject = {
//     token: Token,
//     context: Context
// }
var scopeIndex11327 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11322(bindings, "must pass in the bindings");
        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex11327++;
        // each scope has a reference to the global binding map
        // (for efficiency might be able to just store the relevant bindings)
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

function Syntax11328(token11353, oldstx11354) {
    this.token = token11353;
    this.context = oldstx11354 && oldstx11354.context ? oldstx11354.context : Immutable11320.List();
    this.props = oldstx11354 && oldstx11354.props ? oldstx11354.props : {};
}
Syntax11328.prototype = {
    mark: function mark(newMark11355) {
        var next11356 = this.clone();
        if (next11356.token.inner) {
            next11356.token.inner = next11356.token.inner.map(function (stx11358) {
                return stx11358.mark(newMark11355);
            });
        }
        var newCtx11357 = undefined;
        if (next11356.context.first() === newMark11355) {
            // double scopes cancel
            newCtx11357 = next11356.context.rest();
        } else {
            newCtx11357 = next11356.context.unshift(newMark11355);
        }
        return syntaxFromToken11329(next11356.token, {
            context: newCtx11357,
            props: this.props
        });
    },
    delScope: function delScope(scope11359) {
        var next11360 = this.clone();
        if (next11360.token.inner) {
            next11360.token.inner = next11360.token.inner.map(function (stx11361) {
                return stx11361.delScope(scope11359);
            });
        }
        return syntaxFromToken11329(next11360.token, {
            context: next11360.context.filter(function (s11362) {
                return s11362 !== scope11359;
            }),
            props: next11360.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11363, name11364, defctx11365, phase11366) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11367) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11368 = this.token.type === parser11318.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11368 + "]";
    },
    clone: function clone() {
        var newTok11369 = {};
        var keys11370 = Object.keys(this.token);
        for (var i11371 = 0, len11372 = keys11370.length, key11373; i11371 < len11372; i11371++) {
            key11373 = keys11370[i11371];
            if (Array.isArray(this.token[key11373])) {
                if (key11373 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11369[key11373] = this.token[key11373].reduce(function (acc11374, stx11375) {
                        acc11374.push(stx11375.clone());
                        return acc11374;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11369[key11373] = this.token[key11373].reduce(function (acc11376, el11377) {
                        acc11376.push(el11377);
                        return acc11376;
                    }, []);
                }
            } else {
                newTok11369[key11373] = this.token[key11373];
            }
        }
        return syntaxFromToken11329(newTok11369, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11318.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11318.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11318.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11318.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11318.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11318.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11318.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11318.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11318.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11318.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11318.Token.EOF;
    }
};
function syntaxFromToken11329(token11378, oldstx11379) {
    return new Syntax11328(token11378, oldstx11379);
}
function mkSyntax11330(stx11380, value11381, type11382, inner11383) {
    if (stx11380 && Array.isArray(stx11380) && stx11380.length === 1) {
        stx11380 = stx11380[0];
    } else if (stx11380 && Array.isArray(stx11380)) {
        throwSyntaxError11345("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11380 === undefined) {
        throwSyntaxError11345("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11382 === parser11318.Token.Delimiter) {
        var startLineNumber11384, startLineStart11385, endLineNumber11386, endLineStart11387, startRange11388, endRange11389;
        if (!Array.isArray(inner11383)) {
            throwSyntaxError11345("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11380 && stx11380.token.type === parser11318.Token.Delimiter) {
            startLineNumber11384 = stx11380.token.startLineNumber;
            startLineStart11385 = stx11380.token.startLineStart;
            endLineNumber11386 = stx11380.token.endLineNumber;
            endLineStart11387 = stx11380.token.endLineStart;
            startRange11388 = stx11380.token.startRange;
            endRange11389 = stx11380.token.endRange;
        } else if (stx11380 && stx11380.token) {
            startLineNumber11384 = stx11380.token.lineNumber;
            startLineStart11385 = stx11380.token.lineStart;
            endLineNumber11386 = stx11380.token.lineNumber;
            endLineStart11387 = stx11380.token.lineStart;
            startRange11388 = stx11380.token.range;
            endRange11389 = stx11380.token.range;
        }
        return syntaxFromToken11329({
            type: parser11318.Token.Delimiter,
            value: value11381,
            inner: inner11383,
            startLineStart: startLineStart11385,
            startLineNumber: startLineNumber11384,
            endLineStart: endLineStart11387,
            endLineNumber: endLineNumber11386,
            startRange: startRange11388,
            endRange: endRange11389
        }, stx11380);
    } else {
        var lineStart11390, lineNumber11391, range11392;
        if (stx11380 && stx11380.token.type === parser11318.Token.Delimiter) {
            lineStart11390 = stx11380.token.startLineStart;
            lineNumber11391 = stx11380.token.startLineNumber;
            range11392 = stx11380.token.startRange;
        } else if (stx11380 && stx11380.token) {
            lineStart11390 = stx11380.token.lineStart;
            lineNumber11391 = stx11380.token.lineNumber;
            range11392 = stx11380.token.range;
        }
        return syntaxFromToken11329({
            type: type11382,
            value: value11381,
            lineStart: lineStart11390,
            lineNumber: lineNumber11391,
            range: range11392
        }, stx11380);
    }
}
function makeValue11331(val11393, stx11394) {
    if (typeof val11393 === "boolean") {
        return mkSyntax11330(stx11394, val11393 ? "true" : "false", parser11318.Token.BooleanLiteral);
    } else if (typeof val11393 === "number") {
        if (val11393 !== val11393) {
            return makeDelim11336("()", [makeValue11331(0, stx11394), makePunc11335("/", stx11394), makeValue11331(0, stx11394)], stx11394);
        }
        if (val11393 < 0) {
            return makeDelim11336("()", [makePunc11335("-", stx11394), makeValue11331(Math.abs(val11393), stx11394)], stx11394);
        } else {
            return mkSyntax11330(stx11394, val11393, parser11318.Token.NumericLiteral);
        }
    } else if (typeof val11393 === "string") {
        return mkSyntax11330(stx11394, val11393, parser11318.Token.StringLiteral);
    } else if (val11393 === null) {
        return mkSyntax11330(stx11394, "null", parser11318.Token.NullLiteral);
    } else {
        throwSyntaxError11345("makeValue", "Cannot make value syntax object from: " + val11393);
    }
}
function makeRegex11332(val11395, flags11396, stx11397) {
    var newstx11398 = mkSyntax11330(stx11397, new RegExp(val11395, flags11396), parser11318.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11398.token.literal = val11395;
    return newstx11398;
}
function makeIdent11333(val11399, stx11400) {
    return mkSyntax11330(stx11400, val11399, parser11318.Token.Identifier);
}
function makeKeyword11334(val11401, stx11402) {
    return mkSyntax11330(stx11402, val11401, parser11318.Token.Keyword);
}
function makePunc11335(val11403, stx11404) {
    return mkSyntax11330(stx11404, val11403, parser11318.Token.Punctuator);
}
function makeDelim11336(val11405, inner11406, stx11407) {
    return mkSyntax11330(stx11407, val11405, parser11318.Token.Delimiter, inner11406);
}
function unwrapSyntax11337(stx11408) {
    if (Array.isArray(stx11408) && stx11408.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11408 = stx11408[0];
    }
    if (stx11408.token) {
        if (stx11408.token.type === parser11318.Token.Delimiter) {
            return stx11408.token;
        } else {
            return stx11408.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11408);
    }
}
function syntaxToTokens11338(stx11409) {
    return _11317.map(stx11409, function (stx11410) {
        if (stx11410.token.inner) {
            stx11410.token.inner = syntaxToTokens11338(stx11410.token.inner);
        }
        return stx11410.token;
    });
}
function tokensToSyntax11339(tokens11411) {
    if (!_11317.isArray(tokens11411)) {
        tokens11411 = [tokens11411];
    }
    return _11317.map(tokens11411, function (token11412) {
        if (token11412.inner) {
            token11412.inner = tokensToSyntax11339(token11412.inner);
        }
        return syntaxFromToken11329(token11412);
    });
}
function joinSyntax11340(tojoin11413, punc11414) {
    if (tojoin11413.length === 0) {
        return [];
    }
    if (punc11414 === " ") {
        return tojoin11413;
    }
    return _11317.reduce(_11317.rest(tojoin11413, 1), function (acc11415, join11416) {
        acc11415.push(cloneSyntax11342(punc11414), join11416);
        return acc11415;
    }, [_11317.first(tojoin11413)]);
}
function joinSyntaxArray11341(tojoin11417, punc11418) {
    if (tojoin11417.length === 0) {
        return [];
    }
    if (punc11418 === " ") {
        return _11317.flatten(tojoin11417, true);
    }
    return _11317.reduce(_11317.rest(tojoin11417, 1), function (acc11419, join11420) {
        acc11419.push(cloneSyntax11342(punc11418));
        Array.prototype.push.apply(acc11419, join11420);
        return acc11419;
    }, _11317.first(tojoin11417));
}
function cloneSyntax11342(stx11421) {
    return syntaxFromToken11329(_11317.clone(stx11421.token), stx11421);
}
function cloneSyntaxArray11343(arr11422) {
    return arr11422.map(function (stx11423) {
        var o11424 = cloneSyntax11342(stx11423);
        if (o11424.token.type === parser11318.Token.Delimiter) {
            o11424.token.inner = cloneSyntaxArray11343(o11424.token.inner);
        }
        return o11424;
    });
}
function MacroSyntaxError11344(name11425, message11426, stx11427) {
    this.name = name11425;
    this.message = message11426;
    this.stx = stx11427;
}
function throwSyntaxError11345(name11428, message11429, stx11430) {
    if (stx11430 && Array.isArray(stx11430)) {
        stx11430 = stx11430[0];
    }
    throw new MacroSyntaxError11344(name11428, message11429, stx11430);
}
function SyntaxCaseError11346(message11431) {
    this.message = message11431;
}
function throwSyntaxCaseError11347(message11432) {
    throw new SyntaxCaseError11346(message11432);
}
function printSyntaxError11348(code11433, err11434) {
    if (!err11434.stx) {
        return "[" + err11434.name + "] " + err11434.message;
    }
    var token11435 = err11434.stx.token;
    var lineNumber11436 = _11317.find([token11435.sm_startLineNumber, token11435.sm_lineNumber, token11435.startLineNumber, token11435.lineNumber], _11317.isNumber);
    var lineStart11437 = _11317.find([token11435.sm_startLineStart, token11435.sm_lineStart, token11435.startLineStart, token11435.lineStart], _11317.isNumber);
    var start11438 = (token11435.sm_startRange || token11435.sm_range || token11435.startRange || token11435.range)[0];
    var offset11439 = start11438 - lineStart11437;
    var line11440 = "";
    var pre11441 = lineNumber11436 + ": ";
    var ch11442;
    while (ch11442 = code11433.charAt(lineStart11437++)) {
        if (ch11442 == "\r" || ch11442 == "\n") {
            break;
        }
        line11440 += ch11442;
    }
    return "[" + err11434.name + "] " + err11434.message + "\n" + pre11441 + line11440 + "\n" + Array(offset11439 + pre11441.length).join(" ") + " ^";
}
function prettyPrint11349(stxarr11443, shouldResolve11444) {
    var indent11445 = 0;
    var unparsedLines11446 = stxarr11443.reduce(function (acc11447, stx11448) {
        var s11449 = shouldResolve11444 ? expander11319.resolve(stx11448) : stx11448.token.value;
        if ( // skip the end of file token
        stx11448.token.type === parser11318.Token.EOF) {
            return acc11447;
        }
        if (stx11448.token.type === parser11318.Token.StringLiteral) {
            s11449 = "\"" + s11449 + "\"";
        }
        if (s11449 == "{") {
            acc11447[0].str += " " + s11449;
            indent11445++;
            acc11447.unshift({
                indent: indent11445,
                str: ""
            });
        } else if (s11449 == "}") {
            indent11445--;
            acc11447.unshift({
                indent: indent11445,
                str: s11449
            });
            acc11447.unshift({
                indent: indent11445,
                str: ""
            });
        } else if (s11449 == ";") {
            acc11447[0].str += s11449;
            acc11447.unshift({
                indent: indent11445,
                str: ""
            });
        } else {
            acc11447[0].str += (acc11447[0].str ? " " : "") + s11449;
        }
        return acc11447;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11446.reduce(function (acc11450, line11451) {
        var ind11452 = "";
        while (ind11452.length < line11451.indent * 2) {
            ind11452 += " ";
        }
        return ind11452 + line11451.str + "\n" + acc11450;
    }, "");
}
function adjustLineContext11350(stx11453, original11454, current11455) {
    if ( // short circuit when the array is empty;
    stx11453.length === 0) {
        return stx11453;
    }
    current11455 = current11455 || {
        lastLineNumber: stx11453[0].token.lineNumber || stx11453[0].token.startLineNumber,
        lineNumber: original11454.token.lineNumber
    };
    return _11317.map(stx11453, function (stx11456) {
        if (stx11456.isDelimiter()) {
            // handle tokens with missing line info
            stx11456.token.startLineNumber = typeof stx11456.token.startLineNumber == "undefined" ? original11454.token.lineNumber : stx11456.token.startLineNumber;
            stx11456.token.endLineNumber = typeof stx11456.token.endLineNumber == "undefined" ? original11454.token.lineNumber : stx11456.token.endLineNumber;
            stx11456.token.startLineStart = typeof stx11456.token.startLineStart == "undefined" ? original11454.token.lineStart : stx11456.token.startLineStart;
            stx11456.token.endLineStart = typeof stx11456.token.endLineStart == "undefined" ? original11454.token.lineStart : stx11456.token.endLineStart;
            stx11456.token.startRange = typeof stx11456.token.startRange == "undefined" ? original11454.token.range : stx11456.token.startRange;
            stx11456.token.endRange = typeof stx11456.token.endRange == "undefined" ? original11454.token.range : stx11456.token.endRange;
            stx11456.token.sm_startLineNumber = typeof stx11456.token.sm_startLineNumber == "undefined" ? stx11456.token.startLineNumber : stx11456.token.sm_startLineNumber;
            stx11456.token.sm_endLineNumber = typeof stx11456.token.sm_endLineNumber == "undefined" ? stx11456.token.endLineNumber : stx11456.token.sm_endLineNumber;
            stx11456.token.sm_startLineStart = typeof stx11456.token.sm_startLineStart == "undefined" ? stx11456.token.startLineStart : stx11456.token.sm_startLineStart;
            stx11456.token.sm_endLineStart = typeof stx11456.token.sm_endLineStart == "undefined" ? stx11456.token.endLineStart : stx11456.token.sm_endLineStart;
            stx11456.token.sm_startRange = typeof stx11456.token.sm_startRange == "undefined" ? stx11456.token.startRange : stx11456.token.sm_startRange;
            stx11456.token.sm_endRange = typeof stx11456.token.sm_endRange == "undefined" ? stx11456.token.endRange : stx11456.token.sm_endRange;
            if (stx11456.token.startLineNumber !== current11455.lineNumber) {
                if (stx11456.token.startLineNumber !== current11455.lastLineNumber) {
                    current11455.lineNumber++;
                    current11455.lastLineNumber = stx11456.token.startLineNumber;
                    stx11456.token.startLineNumber = current11455.lineNumber;
                } else {
                    current11455.lastLineNumber = stx11456.token.startLineNumber;
                    stx11456.token.startLineNumber = current11455.lineNumber;
                }
            }
            return stx11456;
        }
        // handle tokens with missing line info
        stx11456.token.lineNumber = typeof stx11456.token.lineNumber == "undefined" ? original11454.token.lineNumber : stx11456.token.lineNumber;
        stx11456.token.lineStart = typeof stx11456.token.lineStart == "undefined" ? original11454.token.lineStart : stx11456.token.lineStart;
        stx11456.token.range = typeof stx11456.token.range == "undefined" ? original11454.token.range : stx11456.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11456.token.sm_lineNumber = typeof stx11456.token.sm_lineNumber == "undefined" ? stx11456.token.lineNumber : stx11456.token.sm_lineNumber;
        stx11456.token.sm_lineStart = typeof stx11456.token.sm_lineStart == "undefined" ? stx11456.token.lineStart : stx11456.token.sm_lineStart;
        stx11456.token.sm_range = typeof stx11456.token.sm_range == "undefined" ? stx11456.token.range.slice() : stx11456.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11456.token.lineNumber !== current11455.lineNumber) {
            if (stx11456.token.lineNumber !== current11455.lastLineNumber) {
                current11455.lineNumber++;
                current11455.lastLineNumber = stx11456.token.lineNumber;
                stx11456.token.lineNumber = current11455.lineNumber;
            } else {
                current11455.lastLineNumber = stx11456.token.lineNumber;
                stx11456.token.lineNumber = current11455.lineNumber;
            }
        }
        return stx11456;
    });
}
function makeMultiToken11351(stxl11457) {
    if (stxl11457 instanceof Syntax11328 && stxl11457.isDelimiter()) {
        return makeIdent11333(stxl11457.token.inner.map(unwrapSyntax11337).join(""), stxl11457.token.inner[0]);
    } else if (stxl11457 instanceof Syntax11328) {
        return stxl11457;
    } else {
        assert11322(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11351;
exports.unwrapSyntax = unwrapSyntax11337;
exports.makeDelim = makeDelim11336;
exports.makePunc = makePunc11335;
exports.makeKeyword = makeKeyword11334;
exports.makeIdent = makeIdent11333;
exports.makeRegex = makeRegex11332;
exports.makeValue = makeValue11331;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11329;
exports.tokensToSyntax = tokensToSyntax11339;
exports.syntaxToTokens = syntaxToTokens11338;
exports.isSyntax = function (obj11458) {
    obj11458 = Array.isArray(obj11458) ? obj11458[0] : obj11458;
    return obj11458 instanceof Syntax11328;
};
exports.joinSyntax = joinSyntax11340;
exports.joinSyntaxArray = joinSyntaxArray11341;
exports.cloneSyntax = cloneSyntax11342;
exports.cloneSyntaxArray = cloneSyntaxArray11343;
exports.prettyPrint = prettyPrint11349;
exports.MacroSyntaxError = MacroSyntaxError11344;
exports.throwSyntaxError = throwSyntaxError11345;
exports.SyntaxCaseError = SyntaxCaseError11346;
exports.throwSyntaxCaseError = throwSyntaxCaseError11347;
exports.printSyntaxError = printSyntaxError11348;
exports.adjustLineContext = adjustLineContext11350;
exports.fresh = fresh11325;
exports.freshScope = freshScope11326;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map