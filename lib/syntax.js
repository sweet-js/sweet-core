"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11315 = require("underscore"),
    parser11316 = require("./parser"),
    expander11317 = require("./expander"),
    Immutable11318 = require("immutable"),
    StringMap11319 = require("./data/stringMap"),
    assert11320 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11321 = 1;
var nextFresh11322 = 0;
function fresh11323() {
    return nextFresh11322++;
}
function freshScope11324(bindings11350) {
    return new Scope(bindings11350);
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
var scopeIndex11325 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11320(bindings, "must pass in the bindings");
        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex11325++;
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

function Syntax11326(token11351, oldstx11352) {
    this.token = token11351;
    this.context = oldstx11352 && oldstx11352.context ? oldstx11352.context : Immutable11318.List();
    this.props = oldstx11352 && oldstx11352.props ? oldstx11352.props : {};
}
Syntax11326.prototype = {
    mark: function mark(newMark11353) {
        var next11354 = this.clone();
        if (next11354.token.inner) {
            next11354.token.inner = next11354.token.inner.map(function (stx11356) {
                return stx11356.mark(newMark11353);
            });
        }
        var newCtx11355 = undefined;
        if (next11354.context.first() === newMark11353) {
            // double scopes cancel
            newCtx11355 = next11354.context.rest();
        } else {
            newCtx11355 = next11354.context.unshift(newMark11353);
        }
        return syntaxFromToken11327(next11354.token, {
            context: newCtx11355,
            props: this.props
        });
    },
    delScope: function delScope(scope11357) {
        var next11358 = this.clone();
        if (next11358.token.inner) {
            next11358.token.inner = next11358.token.inner.map(function (stx11359) {
                return stx11359.delScope(scope11357);
            });
        }
        return syntaxFromToken11327(next11358.token, {
            context: next11358.context.filter(function (s11360) {
                return s11360 !== scope11357;
            }),
            props: next11358.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11361, name11362, defctx11363, phase11364) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11365) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11366 = this.token.type === parser11316.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11366 + "]";
    },
    clone: function clone() {
        var newTok11367 = {};
        var keys11368 = Object.keys(this.token);
        for (var i11369 = 0, len11370 = keys11368.length, key11371; i11369 < len11370; i11369++) {
            key11371 = keys11368[i11369];
            if (Array.isArray(this.token[key11371])) {
                if (key11371 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11367[key11371] = this.token[key11371].reduce(function (acc11372, stx11373) {
                        acc11372.push(stx11373.clone());
                        return acc11372;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11367[key11371] = this.token[key11371].reduce(function (acc11374, el11375) {
                        acc11374.push(el11375);
                        return acc11374;
                    }, []);
                }
            } else {
                newTok11367[key11371] = this.token[key11371];
            }
        }
        return syntaxFromToken11327(newTok11367, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11316.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11316.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11316.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11316.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11316.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11316.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11316.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11316.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11316.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11316.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11316.Token.EOF;
    }
};
function syntaxFromToken11327(token11376, oldstx11377) {
    return new Syntax11326(token11376, oldstx11377);
}
function mkSyntax11328(stx11378, value11379, type11380, inner11381) {
    if (stx11378 && Array.isArray(stx11378) && stx11378.length === 1) {
        stx11378 = stx11378[0];
    } else if (stx11378 && Array.isArray(stx11378)) {
        throwSyntaxError11343("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11378 === undefined) {
        throwSyntaxError11343("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11380 === parser11316.Token.Delimiter) {
        var startLineNumber11382, startLineStart11383, endLineNumber11384, endLineStart11385, startRange11386, endRange11387;
        if (!Array.isArray(inner11381)) {
            throwSyntaxError11343("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11378 && stx11378.token.type === parser11316.Token.Delimiter) {
            startLineNumber11382 = stx11378.token.startLineNumber;
            startLineStart11383 = stx11378.token.startLineStart;
            endLineNumber11384 = stx11378.token.endLineNumber;
            endLineStart11385 = stx11378.token.endLineStart;
            startRange11386 = stx11378.token.startRange;
            endRange11387 = stx11378.token.endRange;
        } else if (stx11378 && stx11378.token) {
            startLineNumber11382 = stx11378.token.lineNumber;
            startLineStart11383 = stx11378.token.lineStart;
            endLineNumber11384 = stx11378.token.lineNumber;
            endLineStart11385 = stx11378.token.lineStart;
            startRange11386 = stx11378.token.range;
            endRange11387 = stx11378.token.range;
        }
        return syntaxFromToken11327({
            type: parser11316.Token.Delimiter,
            value: value11379,
            inner: inner11381,
            startLineStart: startLineStart11383,
            startLineNumber: startLineNumber11382,
            endLineStart: endLineStart11385,
            endLineNumber: endLineNumber11384,
            startRange: startRange11386,
            endRange: endRange11387
        }, stx11378);
    } else {
        var lineStart11388, lineNumber11389, range11390;
        if (stx11378 && stx11378.token.type === parser11316.Token.Delimiter) {
            lineStart11388 = stx11378.token.startLineStart;
            lineNumber11389 = stx11378.token.startLineNumber;
            range11390 = stx11378.token.startRange;
        } else if (stx11378 && stx11378.token) {
            lineStart11388 = stx11378.token.lineStart;
            lineNumber11389 = stx11378.token.lineNumber;
            range11390 = stx11378.token.range;
        }
        return syntaxFromToken11327({
            type: type11380,
            value: value11379,
            lineStart: lineStart11388,
            lineNumber: lineNumber11389,
            range: range11390
        }, stx11378);
    }
}
function makeValue11329(val11391, stx11392) {
    if (typeof val11391 === "boolean") {
        return mkSyntax11328(stx11392, val11391 ? "true" : "false", parser11316.Token.BooleanLiteral);
    } else if (typeof val11391 === "number") {
        if (val11391 !== val11391) {
            return makeDelim11334("()", [makeValue11329(0, stx11392), makePunc11333("/", stx11392), makeValue11329(0, stx11392)], stx11392);
        }
        if (val11391 < 0) {
            return makeDelim11334("()", [makePunc11333("-", stx11392), makeValue11329(Math.abs(val11391), stx11392)], stx11392);
        } else {
            return mkSyntax11328(stx11392, val11391, parser11316.Token.NumericLiteral);
        }
    } else if (typeof val11391 === "string") {
        return mkSyntax11328(stx11392, val11391, parser11316.Token.StringLiteral);
    } else if (val11391 === null) {
        return mkSyntax11328(stx11392, "null", parser11316.Token.NullLiteral);
    } else {
        throwSyntaxError11343("makeValue", "Cannot make value syntax object from: " + val11391);
    }
}
function makeRegex11330(val11393, flags11394, stx11395) {
    var newstx11396 = mkSyntax11328(stx11395, new RegExp(val11393, flags11394), parser11316.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11396.token.literal = val11393;
    return newstx11396;
}
function makeIdent11331(val11397, stx11398) {
    return mkSyntax11328(stx11398, val11397, parser11316.Token.Identifier);
}
function makeKeyword11332(val11399, stx11400) {
    return mkSyntax11328(stx11400, val11399, parser11316.Token.Keyword);
}
function makePunc11333(val11401, stx11402) {
    return mkSyntax11328(stx11402, val11401, parser11316.Token.Punctuator);
}
function makeDelim11334(val11403, inner11404, stx11405) {
    return mkSyntax11328(stx11405, val11403, parser11316.Token.Delimiter, inner11404);
}
function unwrapSyntax11335(stx11406) {
    if (Array.isArray(stx11406) && stx11406.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11406 = stx11406[0];
    }
    if (stx11406.token) {
        if (stx11406.token.type === parser11316.Token.Delimiter) {
            return stx11406.token;
        } else {
            return stx11406.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11406);
    }
}
function syntaxToTokens11336(stx11407) {
    return _11315.map(stx11407, function (stx11408) {
        if (stx11408.token.inner) {
            stx11408.token.inner = syntaxToTokens11336(stx11408.token.inner);
        }
        return stx11408.token;
    });
}
function tokensToSyntax11337(tokens11409) {
    if (!_11315.isArray(tokens11409)) {
        tokens11409 = [tokens11409];
    }
    return _11315.map(tokens11409, function (token11410) {
        if (token11410.inner) {
            token11410.inner = tokensToSyntax11337(token11410.inner);
        }
        return syntaxFromToken11327(token11410);
    });
}
function joinSyntax11338(tojoin11411, punc11412) {
    if (tojoin11411.length === 0) {
        return [];
    }
    if (punc11412 === " ") {
        return tojoin11411;
    }
    return _11315.reduce(_11315.rest(tojoin11411, 1), function (acc11413, join11414) {
        acc11413.push(cloneSyntax11340(punc11412), join11414);
        return acc11413;
    }, [_11315.first(tojoin11411)]);
}
function joinSyntaxArray11339(tojoin11415, punc11416) {
    if (tojoin11415.length === 0) {
        return [];
    }
    if (punc11416 === " ") {
        return _11315.flatten(tojoin11415, true);
    }
    return _11315.reduce(_11315.rest(tojoin11415, 1), function (acc11417, join11418) {
        acc11417.push(cloneSyntax11340(punc11416));
        Array.prototype.push.apply(acc11417, join11418);
        return acc11417;
    }, _11315.first(tojoin11415));
}
function cloneSyntax11340(stx11419) {
    return syntaxFromToken11327(_11315.clone(stx11419.token), stx11419);
}
function cloneSyntaxArray11341(arr11420) {
    return arr11420.map(function (stx11421) {
        var o11422 = cloneSyntax11340(stx11421);
        if (o11422.token.type === parser11316.Token.Delimiter) {
            o11422.token.inner = cloneSyntaxArray11341(o11422.token.inner);
        }
        return o11422;
    });
}
function MacroSyntaxError11342(name11423, message11424, stx11425) {
    this.name = name11423;
    this.message = message11424;
    this.stx = stx11425;
}
function throwSyntaxError11343(name11426, message11427, stx11428) {
    if (stx11428 && Array.isArray(stx11428)) {
        stx11428 = stx11428[0];
    }
    throw new MacroSyntaxError11342(name11426, message11427, stx11428);
}
function SyntaxCaseError11344(message11429) {
    this.message = message11429;
}
function throwSyntaxCaseError11345(message11430) {
    throw new SyntaxCaseError11344(message11430);
}
function printSyntaxError11346(code11431, err11432) {
    if (!err11432.stx) {
        return "[" + err11432.name + "] " + err11432.message;
    }
    var token11433 = err11432.stx.token;
    var lineNumber11434 = _11315.find([token11433.sm_startLineNumber, token11433.sm_lineNumber, token11433.startLineNumber, token11433.lineNumber], _11315.isNumber);
    var lineStart11435 = _11315.find([token11433.sm_startLineStart, token11433.sm_lineStart, token11433.startLineStart, token11433.lineStart], _11315.isNumber);
    var start11436 = (token11433.sm_startRange || token11433.sm_range || token11433.startRange || token11433.range)[0];
    var offset11437 = start11436 - lineStart11435;
    var line11438 = "";
    var pre11439 = lineNumber11434 + ": ";
    var ch11440;
    while (ch11440 = code11431.charAt(lineStart11435++)) {
        if (ch11440 == "\r" || ch11440 == "\n") {
            break;
        }
        line11438 += ch11440;
    }
    return "[" + err11432.name + "] " + err11432.message + "\n" + pre11439 + line11438 + "\n" + Array(offset11437 + pre11439.length).join(" ") + " ^";
}
function prettyPrint11347(stxarr11441, shouldResolve11442) {
    var indent11443 = 0;
    var unparsedLines11444 = stxarr11441.reduce(function (acc11445, stx11446) {
        var s11447 = shouldResolve11442 ? expander11317.resolve(stx11446) : stx11446.token.value;
        if ( // skip the end of file token
        stx11446.token.type === parser11316.Token.EOF) {
            return acc11445;
        }
        if (stx11446.token.type === parser11316.Token.StringLiteral) {
            s11447 = "\"" + s11447 + "\"";
        }
        if (s11447 == "{") {
            acc11445[0].str += " " + s11447;
            indent11443++;
            acc11445.unshift({
                indent: indent11443,
                str: ""
            });
        } else if (s11447 == "}") {
            indent11443--;
            acc11445.unshift({
                indent: indent11443,
                str: s11447
            });
            acc11445.unshift({
                indent: indent11443,
                str: ""
            });
        } else if (s11447 == ";") {
            acc11445[0].str += s11447;
            acc11445.unshift({
                indent: indent11443,
                str: ""
            });
        } else {
            acc11445[0].str += (acc11445[0].str ? " " : "") + s11447;
        }
        return acc11445;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11444.reduce(function (acc11448, line11449) {
        var ind11450 = "";
        while (ind11450.length < line11449.indent * 2) {
            ind11450 += " ";
        }
        return ind11450 + line11449.str + "\n" + acc11448;
    }, "");
}
function adjustLineContext11348(stx11451, original11452, current11453) {
    if ( // short circuit when the array is empty;
    stx11451.length === 0) {
        return stx11451;
    }
    current11453 = current11453 || {
        lastLineNumber: stx11451[0].token.lineNumber || stx11451[0].token.startLineNumber,
        lineNumber: original11452.token.lineNumber
    };
    return _11315.map(stx11451, function (stx11454) {
        if (stx11454.isDelimiter()) {
            // handle tokens with missing line info
            stx11454.token.startLineNumber = typeof stx11454.token.startLineNumber == "undefined" ? original11452.token.lineNumber : stx11454.token.startLineNumber;
            stx11454.token.endLineNumber = typeof stx11454.token.endLineNumber == "undefined" ? original11452.token.lineNumber : stx11454.token.endLineNumber;
            stx11454.token.startLineStart = typeof stx11454.token.startLineStart == "undefined" ? original11452.token.lineStart : stx11454.token.startLineStart;
            stx11454.token.endLineStart = typeof stx11454.token.endLineStart == "undefined" ? original11452.token.lineStart : stx11454.token.endLineStart;
            stx11454.token.startRange = typeof stx11454.token.startRange == "undefined" ? original11452.token.range : stx11454.token.startRange;
            stx11454.token.endRange = typeof stx11454.token.endRange == "undefined" ? original11452.token.range : stx11454.token.endRange;
            stx11454.token.sm_startLineNumber = typeof stx11454.token.sm_startLineNumber == "undefined" ? stx11454.token.startLineNumber : stx11454.token.sm_startLineNumber;
            stx11454.token.sm_endLineNumber = typeof stx11454.token.sm_endLineNumber == "undefined" ? stx11454.token.endLineNumber : stx11454.token.sm_endLineNumber;
            stx11454.token.sm_startLineStart = typeof stx11454.token.sm_startLineStart == "undefined" ? stx11454.token.startLineStart : stx11454.token.sm_startLineStart;
            stx11454.token.sm_endLineStart = typeof stx11454.token.sm_endLineStart == "undefined" ? stx11454.token.endLineStart : stx11454.token.sm_endLineStart;
            stx11454.token.sm_startRange = typeof stx11454.token.sm_startRange == "undefined" ? stx11454.token.startRange : stx11454.token.sm_startRange;
            stx11454.token.sm_endRange = typeof stx11454.token.sm_endRange == "undefined" ? stx11454.token.endRange : stx11454.token.sm_endRange;
            if (stx11454.token.startLineNumber !== current11453.lineNumber) {
                if (stx11454.token.startLineNumber !== current11453.lastLineNumber) {
                    current11453.lineNumber++;
                    current11453.lastLineNumber = stx11454.token.startLineNumber;
                    stx11454.token.startLineNumber = current11453.lineNumber;
                } else {
                    current11453.lastLineNumber = stx11454.token.startLineNumber;
                    stx11454.token.startLineNumber = current11453.lineNumber;
                }
            }
            return stx11454;
        }
        // handle tokens with missing line info
        stx11454.token.lineNumber = typeof stx11454.token.lineNumber == "undefined" ? original11452.token.lineNumber : stx11454.token.lineNumber;
        stx11454.token.lineStart = typeof stx11454.token.lineStart == "undefined" ? original11452.token.lineStart : stx11454.token.lineStart;
        stx11454.token.range = typeof stx11454.token.range == "undefined" ? original11452.token.range : stx11454.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11454.token.sm_lineNumber = typeof stx11454.token.sm_lineNumber == "undefined" ? stx11454.token.lineNumber : stx11454.token.sm_lineNumber;
        stx11454.token.sm_lineStart = typeof stx11454.token.sm_lineStart == "undefined" ? stx11454.token.lineStart : stx11454.token.sm_lineStart;
        stx11454.token.sm_range = typeof stx11454.token.sm_range == "undefined" ? stx11454.token.range.slice() : stx11454.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11454.token.lineNumber !== current11453.lineNumber) {
            if (stx11454.token.lineNumber !== current11453.lastLineNumber) {
                current11453.lineNumber++;
                current11453.lastLineNumber = stx11454.token.lineNumber;
                stx11454.token.lineNumber = current11453.lineNumber;
            } else {
                current11453.lastLineNumber = stx11454.token.lineNumber;
                stx11454.token.lineNumber = current11453.lineNumber;
            }
        }
        return stx11454;
    });
}
function makeMultiToken11349(stxl11455) {
    if (stxl11455 instanceof Syntax11326 && stxl11455.isDelimiter()) {
        return makeIdent11331(stxl11455.token.inner.map(unwrapSyntax11335).join(""), stxl11455.token.inner[0]);
    } else if (stxl11455 instanceof Syntax11326) {
        return stxl11455;
    } else {
        assert11320(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11349;
exports.unwrapSyntax = unwrapSyntax11335;
exports.makeDelim = makeDelim11334;
exports.makePunc = makePunc11333;
exports.makeKeyword = makeKeyword11332;
exports.makeIdent = makeIdent11331;
exports.makeRegex = makeRegex11330;
exports.makeValue = makeValue11329;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11327;
exports.tokensToSyntax = tokensToSyntax11337;
exports.syntaxToTokens = syntaxToTokens11336;
exports.isSyntax = function (obj11456) {
    obj11456 = Array.isArray(obj11456) ? obj11456[0] : obj11456;
    return obj11456 instanceof Syntax11326;
};
exports.joinSyntax = joinSyntax11338;
exports.joinSyntaxArray = joinSyntaxArray11339;
exports.cloneSyntax = cloneSyntax11340;
exports.cloneSyntaxArray = cloneSyntaxArray11341;
exports.prettyPrint = prettyPrint11347;
exports.MacroSyntaxError = MacroSyntaxError11342;
exports.throwSyntaxError = throwSyntaxError11343;
exports.SyntaxCaseError = SyntaxCaseError11344;
exports.throwSyntaxCaseError = throwSyntaxCaseError11345;
exports.printSyntaxError = printSyntaxError11346;
exports.adjustLineContext = adjustLineContext11348;
exports.fresh = fresh11323;
exports.freshScope = freshScope11324;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map