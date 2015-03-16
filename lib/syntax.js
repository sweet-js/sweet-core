"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11329 = require("underscore"),
    parser11330 = require("./parser"),
    expander11331 = require("./expander"),
    Immutable11332 = require("immutable"),
    StringMap11333 = require("./data/stringMap"),
    assert11334 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11335 = 1;
var nextFresh11336 = 0;
function fresh11337() {
    return nextFresh11336++;
}
function freshScope11338(bindings11364) {
    return new Scope(bindings11364);
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
var scopeIndex11339 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11334(bindings, "must pass in the bindings");
        this.name = scopeIndex11339++;
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

function Syntax11340(token11365, oldstx11366) {
    this.token = token11365;
    this.context = oldstx11366 && oldstx11366.context ? oldstx11366.context : Immutable11332.List();
    this.props = oldstx11366 && oldstx11366.props ? oldstx11366.props : {};
}
Syntax11340.prototype = {
    mark: function mark(newMark11367) {
        var next11368 = this.clone();
        if (next11368.token.inner) {
            next11368.token.inner = next11368.token.inner.map(function (stx11370) {
                return stx11370.mark(newMark11367);
            });
        }
        var newCtx11369 = undefined;
        if (next11368.context.first() === newMark11367) {
            // double scopes cancel
            newCtx11369 = next11368.context.rest();
        } else {
            newCtx11369 = next11368.context.unshift(newMark11367);
        }
        return syntaxFromToken11341(next11368.token, {
            context: newCtx11369,
            props: this.props
        });
    },
    delScope: function delScope(scope11371) {
        var next11372 = this.clone();
        if (next11372.token.inner) {
            next11372.token.inner = next11372.token.inner.map(function (stx11373) {
                return stx11373.delScope(scope11371);
            });
        }
        return syntaxFromToken11341(next11372.token, {
            context: next11372.context.filter(function (s11374) {
                return s11374 !== scope11371;
            }),
            props: next11372.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11375, name11376, defctx11377, phase11378) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11379) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11380 = this.token.type === parser11330.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11380 + "]";
    },
    clone: function clone() {
        var newTok11381 = {};
        var keys11382 = Object.keys(this.token);
        for (var i11383 = 0, len11384 = keys11382.length, key11385; i11383 < len11384; i11383++) {
            key11385 = keys11382[i11383];
            if (Array.isArray(this.token[key11385])) {
                if (key11385 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11381[key11385] = this.token[key11385].reduce(function (acc11386, stx11387) {
                        acc11386.push(stx11387.clone());
                        return acc11386;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11381[key11385] = this.token[key11385].reduce(function (acc11388, el11389) {
                        acc11388.push(el11389);
                        return acc11388;
                    }, []);
                }
            } else {
                newTok11381[key11385] = this.token[key11385];
            }
        }
        return syntaxFromToken11341(newTok11381, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11330.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11330.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11330.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11330.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11330.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11330.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11330.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11330.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11330.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11330.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11330.Token.EOF;
    }
};
function syntaxFromToken11341(token11390, oldstx11391) {
    return new Syntax11340(token11390, oldstx11391);
}
function mkSyntax11342(stx11392, value11393, type11394, inner11395) {
    if (stx11392 && Array.isArray(stx11392) && stx11392.length === 1) {
        stx11392 = stx11392[0];
    } else if (stx11392 && Array.isArray(stx11392)) {
        throwSyntaxError11357("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11392 === undefined) {
        throwSyntaxError11357("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11394 === parser11330.Token.Delimiter) {
        var startLineNumber11396, startLineStart11397, endLineNumber11398, endLineStart11399, startRange11400, endRange11401;
        if (!Array.isArray(inner11395)) {
            throwSyntaxError11357("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11392 && stx11392.token.type === parser11330.Token.Delimiter) {
            startLineNumber11396 = stx11392.token.startLineNumber;
            startLineStart11397 = stx11392.token.startLineStart;
            endLineNumber11398 = stx11392.token.endLineNumber;
            endLineStart11399 = stx11392.token.endLineStart;
            startRange11400 = stx11392.token.startRange;
            endRange11401 = stx11392.token.endRange;
        } else if (stx11392 && stx11392.token) {
            startLineNumber11396 = stx11392.token.lineNumber;
            startLineStart11397 = stx11392.token.lineStart;
            endLineNumber11398 = stx11392.token.lineNumber;
            endLineStart11399 = stx11392.token.lineStart;
            startRange11400 = stx11392.token.range;
            endRange11401 = stx11392.token.range;
        }
        return syntaxFromToken11341({
            type: parser11330.Token.Delimiter,
            value: value11393,
            inner: inner11395,
            startLineStart: startLineStart11397,
            startLineNumber: startLineNumber11396,
            endLineStart: endLineStart11399,
            endLineNumber: endLineNumber11398,
            startRange: startRange11400,
            endRange: endRange11401
        }, stx11392);
    } else {
        var lineStart11402, lineNumber11403, range11404;
        if (stx11392 && stx11392.token.type === parser11330.Token.Delimiter) {
            lineStart11402 = stx11392.token.startLineStart;
            lineNumber11403 = stx11392.token.startLineNumber;
            range11404 = stx11392.token.startRange;
        } else if (stx11392 && stx11392.token) {
            lineStart11402 = stx11392.token.lineStart;
            lineNumber11403 = stx11392.token.lineNumber;
            range11404 = stx11392.token.range;
        }
        return syntaxFromToken11341({
            type: type11394,
            value: value11393,
            lineStart: lineStart11402,
            lineNumber: lineNumber11403,
            range: range11404
        }, stx11392);
    }
}
function makeValue11343(val11405, stx11406) {
    if (typeof val11405 === "boolean") {
        return mkSyntax11342(stx11406, val11405 ? "true" : "false", parser11330.Token.BooleanLiteral);
    } else if (typeof val11405 === "number") {
        if (val11405 !== val11405) {
            return makeDelim11348("()", [makeValue11343(0, stx11406), makePunc11347("/", stx11406), makeValue11343(0, stx11406)], stx11406);
        }
        if (val11405 < 0) {
            return makeDelim11348("()", [makePunc11347("-", stx11406), makeValue11343(Math.abs(val11405), stx11406)], stx11406);
        } else {
            return mkSyntax11342(stx11406, val11405, parser11330.Token.NumericLiteral);
        }
    } else if (typeof val11405 === "string") {
        return mkSyntax11342(stx11406, val11405, parser11330.Token.StringLiteral);
    } else if (val11405 === null) {
        return mkSyntax11342(stx11406, "null", parser11330.Token.NullLiteral);
    } else {
        throwSyntaxError11357("makeValue", "Cannot make value syntax object from: " + val11405);
    }
}
function makeRegex11344(val11407, flags11408, stx11409) {
    var newstx11410 = mkSyntax11342(stx11409, new RegExp(val11407, flags11408), parser11330.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11410.token.literal = val11407;
    return newstx11410;
}
function makeIdent11345(val11411, stx11412) {
    return mkSyntax11342(stx11412, val11411, parser11330.Token.Identifier);
}
function makeKeyword11346(val11413, stx11414) {
    return mkSyntax11342(stx11414, val11413, parser11330.Token.Keyword);
}
function makePunc11347(val11415, stx11416) {
    return mkSyntax11342(stx11416, val11415, parser11330.Token.Punctuator);
}
function makeDelim11348(val11417, inner11418, stx11419) {
    return mkSyntax11342(stx11419, val11417, parser11330.Token.Delimiter, inner11418);
}
function unwrapSyntax11349(stx11420) {
    if (Array.isArray(stx11420) && stx11420.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11420 = stx11420[0];
    }
    if (stx11420.token) {
        if (stx11420.token.type === parser11330.Token.Delimiter) {
            return stx11420.token;
        } else {
            return stx11420.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11420);
    }
}
function syntaxToTokens11350(stx11421) {
    return _11329.map(stx11421, function (stx11422) {
        if (stx11422.token.inner) {
            stx11422.token.inner = syntaxToTokens11350(stx11422.token.inner);
        }
        return stx11422.token;
    });
}
function tokensToSyntax11351(tokens11423) {
    if (!_11329.isArray(tokens11423)) {
        tokens11423 = [tokens11423];
    }
    return _11329.map(tokens11423, function (token11424) {
        if (token11424.inner) {
            token11424.inner = tokensToSyntax11351(token11424.inner);
        }
        return syntaxFromToken11341(token11424);
    });
}
function joinSyntax11352(tojoin11425, punc11426) {
    if (tojoin11425.length === 0) {
        return [];
    }
    if (punc11426 === " ") {
        return tojoin11425;
    }
    return _11329.reduce(_11329.rest(tojoin11425, 1), function (acc11427, join11428) {
        acc11427.push(cloneSyntax11354(punc11426), join11428);
        return acc11427;
    }, [_11329.first(tojoin11425)]);
}
function joinSyntaxArray11353(tojoin11429, punc11430) {
    if (tojoin11429.length === 0) {
        return [];
    }
    if (punc11430 === " ") {
        return _11329.flatten(tojoin11429, true);
    }
    return _11329.reduce(_11329.rest(tojoin11429, 1), function (acc11431, join11432) {
        acc11431.push(cloneSyntax11354(punc11430));
        Array.prototype.push.apply(acc11431, join11432);
        return acc11431;
    }, _11329.first(tojoin11429));
}
function cloneSyntax11354(stx11433) {
    return syntaxFromToken11341(_11329.clone(stx11433.token), stx11433);
}
function cloneSyntaxArray11355(arr11434) {
    return arr11434.map(function (stx11435) {
        var o11436 = cloneSyntax11354(stx11435);
        if (o11436.token.type === parser11330.Token.Delimiter) {
            o11436.token.inner = cloneSyntaxArray11355(o11436.token.inner);
        }
        return o11436;
    });
}
function MacroSyntaxError11356(name11437, message11438, stx11439) {
    this.name = name11437;
    this.message = message11438;
    this.stx = stx11439;
}
function throwSyntaxError11357(name11440, message11441, stx11442) {
    if (stx11442 && Array.isArray(stx11442)) {
        stx11442 = stx11442[0];
    }
    throw new MacroSyntaxError11356(name11440, message11441, stx11442);
}
function SyntaxCaseError11358(message11443) {
    this.message = message11443;
}
function throwSyntaxCaseError11359(message11444) {
    throw new SyntaxCaseError11358(message11444);
}
function printSyntaxError11360(code11445, err11446) {
    if (!err11446.stx) {
        return "[" + err11446.name + "] " + err11446.message;
    }
    var token11447 = err11446.stx.token;
    var lineNumber11448 = _11329.find([token11447.sm_startLineNumber, token11447.sm_lineNumber, token11447.startLineNumber, token11447.lineNumber], _11329.isNumber);
    var lineStart11449 = _11329.find([token11447.sm_startLineStart, token11447.sm_lineStart, token11447.startLineStart, token11447.lineStart], _11329.isNumber);
    var start11450 = (token11447.sm_startRange || token11447.sm_range || token11447.startRange || token11447.range)[0];
    var offset11451 = start11450 - lineStart11449;
    var line11452 = "";
    var pre11453 = lineNumber11448 + ": ";
    var ch11454;
    while (ch11454 = code11445.charAt(lineStart11449++)) {
        if (ch11454 == "\r" || ch11454 == "\n") {
            break;
        }
        line11452 += ch11454;
    }
    return "[" + err11446.name + "] " + err11446.message + "\n" + pre11453 + line11452 + "\n" + Array(offset11451 + pre11453.length).join(" ") + " ^";
}
function prettyPrint11361(stxarr11455, shouldResolve11456) {
    var indent11457 = 0;
    var unparsedLines11458 = stxarr11455.reduce(function (acc11459, stx11460) {
        var s11461 = shouldResolve11456 ? expander11331.resolve(stx11460) : stx11460.token.value;
        if ( // skip the end of file token
        stx11460.token.type === parser11330.Token.EOF) {
            return acc11459;
        }
        if (stx11460.token.type === parser11330.Token.StringLiteral) {
            s11461 = "\"" + s11461 + "\"";
        }
        if (s11461 == "{") {
            acc11459[0].str += " " + s11461;
            indent11457++;
            acc11459.unshift({
                indent: indent11457,
                str: ""
            });
        } else if (s11461 == "}") {
            indent11457--;
            acc11459.unshift({
                indent: indent11457,
                str: s11461
            });
            acc11459.unshift({
                indent: indent11457,
                str: ""
            });
        } else if (s11461 == ";") {
            acc11459[0].str += s11461;
            acc11459.unshift({
                indent: indent11457,
                str: ""
            });
        } else {
            acc11459[0].str += (acc11459[0].str ? " " : "") + s11461;
        }
        return acc11459;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11458.reduce(function (acc11462, line11463) {
        var ind11464 = "";
        while (ind11464.length < line11463.indent * 2) {
            ind11464 += " ";
        }
        return ind11464 + line11463.str + "\n" + acc11462;
    }, "");
}
function adjustLineContext11362(stx11465, original11466, current11467) {
    if ( // short circuit when the array is empty;
    stx11465.length === 0) {
        return stx11465;
    }
    current11467 = current11467 || {
        lastLineNumber: stx11465[0].token.lineNumber || stx11465[0].token.startLineNumber,
        lineNumber: original11466.token.lineNumber
    };
    return _11329.map(stx11465, function (stx11468) {
        if (stx11468.isDelimiter()) {
            // handle tokens with missing line info
            stx11468.token.startLineNumber = typeof stx11468.token.startLineNumber == "undefined" ? original11466.token.lineNumber : stx11468.token.startLineNumber;
            stx11468.token.endLineNumber = typeof stx11468.token.endLineNumber == "undefined" ? original11466.token.lineNumber : stx11468.token.endLineNumber;
            stx11468.token.startLineStart = typeof stx11468.token.startLineStart == "undefined" ? original11466.token.lineStart : stx11468.token.startLineStart;
            stx11468.token.endLineStart = typeof stx11468.token.endLineStart == "undefined" ? original11466.token.lineStart : stx11468.token.endLineStart;
            stx11468.token.startRange = typeof stx11468.token.startRange == "undefined" ? original11466.token.range : stx11468.token.startRange;
            stx11468.token.endRange = typeof stx11468.token.endRange == "undefined" ? original11466.token.range : stx11468.token.endRange;
            stx11468.token.sm_startLineNumber = typeof stx11468.token.sm_startLineNumber == "undefined" ? stx11468.token.startLineNumber : stx11468.token.sm_startLineNumber;
            stx11468.token.sm_endLineNumber = typeof stx11468.token.sm_endLineNumber == "undefined" ? stx11468.token.endLineNumber : stx11468.token.sm_endLineNumber;
            stx11468.token.sm_startLineStart = typeof stx11468.token.sm_startLineStart == "undefined" ? stx11468.token.startLineStart : stx11468.token.sm_startLineStart;
            stx11468.token.sm_endLineStart = typeof stx11468.token.sm_endLineStart == "undefined" ? stx11468.token.endLineStart : stx11468.token.sm_endLineStart;
            stx11468.token.sm_startRange = typeof stx11468.token.sm_startRange == "undefined" ? stx11468.token.startRange : stx11468.token.sm_startRange;
            stx11468.token.sm_endRange = typeof stx11468.token.sm_endRange == "undefined" ? stx11468.token.endRange : stx11468.token.sm_endRange;
            if (stx11468.token.startLineNumber !== current11467.lineNumber) {
                if (stx11468.token.startLineNumber !== current11467.lastLineNumber) {
                    current11467.lineNumber++;
                    current11467.lastLineNumber = stx11468.token.startLineNumber;
                    stx11468.token.startLineNumber = current11467.lineNumber;
                } else {
                    current11467.lastLineNumber = stx11468.token.startLineNumber;
                    stx11468.token.startLineNumber = current11467.lineNumber;
                }
            }
            return stx11468;
        }
        // handle tokens with missing line info
        stx11468.token.lineNumber = typeof stx11468.token.lineNumber == "undefined" ? original11466.token.lineNumber : stx11468.token.lineNumber;
        stx11468.token.lineStart = typeof stx11468.token.lineStart == "undefined" ? original11466.token.lineStart : stx11468.token.lineStart;
        stx11468.token.range = typeof stx11468.token.range == "undefined" ? original11466.token.range : stx11468.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11468.token.sm_lineNumber = typeof stx11468.token.sm_lineNumber == "undefined" ? stx11468.token.lineNumber : stx11468.token.sm_lineNumber;
        stx11468.token.sm_lineStart = typeof stx11468.token.sm_lineStart == "undefined" ? stx11468.token.lineStart : stx11468.token.sm_lineStart;
        stx11468.token.sm_range = typeof stx11468.token.sm_range == "undefined" ? stx11468.token.range.slice() : stx11468.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11468.token.lineNumber !== current11467.lineNumber) {
            if (stx11468.token.lineNumber !== current11467.lastLineNumber) {
                current11467.lineNumber++;
                current11467.lastLineNumber = stx11468.token.lineNumber;
                stx11468.token.lineNumber = current11467.lineNumber;
            } else {
                current11467.lastLineNumber = stx11468.token.lineNumber;
                stx11468.token.lineNumber = current11467.lineNumber;
            }
        }
        return stx11468;
    });
}
function makeMultiToken11363(stxl11469) {
    if (stxl11469 instanceof Syntax11340 && stxl11469.isDelimiter()) {
        return makeIdent11345(stxl11469.token.inner.map(unwrapSyntax11349).join(""), stxl11469.token.inner[0]);
    } else if (stxl11469 instanceof Syntax11340) {
        return stxl11469;
    } else {
        assert11334(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11363;
exports.unwrapSyntax = unwrapSyntax11349;
exports.makeDelim = makeDelim11348;
exports.makePunc = makePunc11347;
exports.makeKeyword = makeKeyword11346;
exports.makeIdent = makeIdent11345;
exports.makeRegex = makeRegex11344;
exports.makeValue = makeValue11343;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11341;
exports.tokensToSyntax = tokensToSyntax11351;
exports.syntaxToTokens = syntaxToTokens11350;
exports.isSyntax = function (obj11470) {
    obj11470 = Array.isArray(obj11470) ? obj11470[0] : obj11470;
    return obj11470 instanceof Syntax11340;
};
exports.joinSyntax = joinSyntax11352;
exports.joinSyntaxArray = joinSyntaxArray11353;
exports.cloneSyntax = cloneSyntax11354;
exports.cloneSyntaxArray = cloneSyntaxArray11355;
exports.prettyPrint = prettyPrint11361;
exports.MacroSyntaxError = MacroSyntaxError11356;
exports.throwSyntaxError = throwSyntaxError11357;
exports.SyntaxCaseError = SyntaxCaseError11358;
exports.throwSyntaxCaseError = throwSyntaxCaseError11359;
exports.printSyntaxError = printSyntaxError11360;
exports.adjustLineContext = adjustLineContext11362;
exports.fresh = fresh11337;
exports.freshScope = freshScope11338;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map