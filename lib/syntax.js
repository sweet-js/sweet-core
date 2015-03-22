"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11284 = require("underscore"),
    parser11285 = require("./parser"),
    expander11286 = require("./expander"),
    Immutable11287 = require("immutable"),
    StringMap11288 = require("./data/stringMap"),
    assert11289 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11290 = 1;
var nextFresh11291 = 0;
function fresh11292() {
    return nextFresh11291++;
}
function freshScope11293(bindings11319) {
    return new Scope(bindings11319);
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
var scopeIndex11294 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11289(bindings, "must pass in the bindings");
        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex11294++;
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

function Syntax11295(token11320, oldstx11321) {
    this.token = token11320;
    this.context = oldstx11321 && oldstx11321.context ? oldstx11321.context : Immutable11287.List();
    this.props = oldstx11321 && oldstx11321.props ? oldstx11321.props : {};
}
Syntax11295.prototype = {
    mark: function mark(newMark11322) {
        var next11323 = this.clone();
        if (next11323.token.inner) {
            next11323.token.inner = next11323.token.inner.map(function (stx11325) {
                return stx11325.mark(newMark11322);
            });
        }
        var newCtx11324 = undefined;
        if (next11323.context.first() === newMark11322) {
            // double scopes cancel
            newCtx11324 = next11323.context.rest();
        } else {
            newCtx11324 = next11323.context.unshift(newMark11322);
        }
        return syntaxFromToken11296(next11323.token, {
            context: newCtx11324,
            props: this.props
        });
    },
    delScope: function delScope(scope11326) {
        var next11327 = this.clone();
        if (next11327.token.inner) {
            next11327.token.inner = next11327.token.inner.map(function (stx11328) {
                return stx11328.delScope(scope11326);
            });
        }
        return syntaxFromToken11296(next11327.token, {
            context: next11327.context.filter(function (s11329) {
                return s11329 !== scope11326;
            }),
            props: next11327.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11330, name11331, defctx11332, phase11333) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11334) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11335 = this.token.type === parser11285.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11335 + "]";
    },
    clone: function clone() {
        var newTok11336 = {};
        var keys11337 = Object.keys(this.token);
        for (var i11338 = 0, len11339 = keys11337.length, key11340; i11338 < len11339; i11338++) {
            key11340 = keys11337[i11338];
            if (Array.isArray(this.token[key11340])) {
                if (key11340 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11336[key11340] = this.token[key11340].reduce(function (acc11341, stx11342) {
                        acc11341.push(stx11342.clone());
                        return acc11341;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11336[key11340] = this.token[key11340].reduce(function (acc11343, el11344) {
                        acc11343.push(el11344);
                        return acc11343;
                    }, []);
                }
            } else {
                newTok11336[key11340] = this.token[key11340];
            }
        }
        return syntaxFromToken11296(newTok11336, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11285.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11285.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11285.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11285.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11285.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11285.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11285.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11285.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11285.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11285.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11285.Token.EOF;
    }
};
function syntaxFromToken11296(token11345, oldstx11346) {
    return new Syntax11295(token11345, oldstx11346);
}
function mkSyntax11297(stx11347, value11348, type11349, inner11350) {
    if (stx11347 && Array.isArray(stx11347) && stx11347.length === 1) {
        stx11347 = stx11347[0];
    } else if (stx11347 && Array.isArray(stx11347)) {
        throwSyntaxError11312("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11347 === undefined) {
        throwSyntaxError11312("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11349 === parser11285.Token.Delimiter) {
        var startLineNumber11351, startLineStart11352, endLineNumber11353, endLineStart11354, startRange11355, endRange11356;
        if (!Array.isArray(inner11350)) {
            throwSyntaxError11312("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11347 && stx11347.token.type === parser11285.Token.Delimiter) {
            startLineNumber11351 = stx11347.token.startLineNumber;
            startLineStart11352 = stx11347.token.startLineStart;
            endLineNumber11353 = stx11347.token.endLineNumber;
            endLineStart11354 = stx11347.token.endLineStart;
            startRange11355 = stx11347.token.startRange;
            endRange11356 = stx11347.token.endRange;
        } else if (stx11347 && stx11347.token) {
            startLineNumber11351 = stx11347.token.lineNumber;
            startLineStart11352 = stx11347.token.lineStart;
            endLineNumber11353 = stx11347.token.lineNumber;
            endLineStart11354 = stx11347.token.lineStart;
            startRange11355 = stx11347.token.range;
            endRange11356 = stx11347.token.range;
        }
        return syntaxFromToken11296({
            type: parser11285.Token.Delimiter,
            value: value11348,
            inner: inner11350,
            startLineStart: startLineStart11352,
            startLineNumber: startLineNumber11351,
            endLineStart: endLineStart11354,
            endLineNumber: endLineNumber11353,
            startRange: startRange11355,
            endRange: endRange11356
        }, stx11347);
    } else {
        var lineStart11357, lineNumber11358, range11359;
        if (stx11347 && stx11347.token.type === parser11285.Token.Delimiter) {
            lineStart11357 = stx11347.token.startLineStart;
            lineNumber11358 = stx11347.token.startLineNumber;
            range11359 = stx11347.token.startRange;
        } else if (stx11347 && stx11347.token) {
            lineStart11357 = stx11347.token.lineStart;
            lineNumber11358 = stx11347.token.lineNumber;
            range11359 = stx11347.token.range;
        }
        return syntaxFromToken11296({
            type: type11349,
            value: value11348,
            lineStart: lineStart11357,
            lineNumber: lineNumber11358,
            range: range11359
        }, stx11347);
    }
}
function makeValue11298(val11360, stx11361) {
    if (typeof val11360 === "boolean") {
        return mkSyntax11297(stx11361, val11360 ? "true" : "false", parser11285.Token.BooleanLiteral);
    } else if (typeof val11360 === "number") {
        if (val11360 !== val11360) {
            return makeDelim11303("()", [makeValue11298(0, stx11361), makePunc11302("/", stx11361), makeValue11298(0, stx11361)], stx11361);
        }
        if (val11360 < 0) {
            return makeDelim11303("()", [makePunc11302("-", stx11361), makeValue11298(Math.abs(val11360), stx11361)], stx11361);
        } else {
            return mkSyntax11297(stx11361, val11360, parser11285.Token.NumericLiteral);
        }
    } else if (typeof val11360 === "string") {
        return mkSyntax11297(stx11361, val11360, parser11285.Token.StringLiteral);
    } else if (val11360 === null) {
        return mkSyntax11297(stx11361, "null", parser11285.Token.NullLiteral);
    } else {
        throwSyntaxError11312("makeValue", "Cannot make value syntax object from: " + val11360);
    }
}
function makeRegex11299(val11362, flags11363, stx11364) {
    var newstx11365 = mkSyntax11297(stx11364, new RegExp(val11362, flags11363), parser11285.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11365.token.literal = val11362;
    return newstx11365;
}
function makeIdent11300(val11366, stx11367) {
    return mkSyntax11297(stx11367, val11366, parser11285.Token.Identifier);
}
function makeKeyword11301(val11368, stx11369) {
    return mkSyntax11297(stx11369, val11368, parser11285.Token.Keyword);
}
function makePunc11302(val11370, stx11371) {
    return mkSyntax11297(stx11371, val11370, parser11285.Token.Punctuator);
}
function makeDelim11303(val11372, inner11373, stx11374) {
    return mkSyntax11297(stx11374, val11372, parser11285.Token.Delimiter, inner11373);
}
function unwrapSyntax11304(stx11375) {
    if (Array.isArray(stx11375) && stx11375.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11375 = stx11375[0];
    }
    if (stx11375.token) {
        if (stx11375.token.type === parser11285.Token.Delimiter) {
            return stx11375.token;
        } else {
            return stx11375.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11375);
    }
}
function syntaxToTokens11305(stx11376) {
    return _11284.map(stx11376, function (stx11377) {
        if (stx11377.token.inner) {
            stx11377.token.inner = syntaxToTokens11305(stx11377.token.inner);
        }
        return stx11377.token;
    });
}
function tokensToSyntax11306(tokens11378) {
    if (!_11284.isArray(tokens11378)) {
        tokens11378 = [tokens11378];
    }
    return _11284.map(tokens11378, function (token11379) {
        if (token11379.inner) {
            token11379.inner = tokensToSyntax11306(token11379.inner);
        }
        return syntaxFromToken11296(token11379);
    });
}
function joinSyntax11307(tojoin11380, punc11381) {
    if (tojoin11380.length === 0) {
        return [];
    }
    if (punc11381 === " ") {
        return tojoin11380;
    }
    return _11284.reduce(_11284.rest(tojoin11380, 1), function (acc11382, join11383) {
        acc11382.push(cloneSyntax11309(punc11381), join11383);
        return acc11382;
    }, [_11284.first(tojoin11380)]);
}
function joinSyntaxArray11308(tojoin11384, punc11385) {
    if (tojoin11384.length === 0) {
        return [];
    }
    if (punc11385 === " ") {
        return _11284.flatten(tojoin11384, true);
    }
    return _11284.reduce(_11284.rest(tojoin11384, 1), function (acc11386, join11387) {
        acc11386.push(cloneSyntax11309(punc11385));
        Array.prototype.push.apply(acc11386, join11387);
        return acc11386;
    }, _11284.first(tojoin11384));
}
function cloneSyntax11309(stx11388) {
    return syntaxFromToken11296(_11284.clone(stx11388.token), stx11388);
}
function cloneSyntaxArray11310(arr11389) {
    return arr11389.map(function (stx11390) {
        var o11391 = cloneSyntax11309(stx11390);
        if (o11391.token.type === parser11285.Token.Delimiter) {
            o11391.token.inner = cloneSyntaxArray11310(o11391.token.inner);
        }
        return o11391;
    });
}
function MacroSyntaxError11311(name11392, message11393, stx11394) {
    this.name = name11392;
    this.message = message11393;
    this.stx = stx11394;
}
function throwSyntaxError11312(name11395, message11396, stx11397) {
    if (stx11397 && Array.isArray(stx11397)) {
        stx11397 = stx11397[0];
    }
    throw new MacroSyntaxError11311(name11395, message11396, stx11397);
}
function SyntaxCaseError11313(message11398) {
    this.message = message11398;
}
function throwSyntaxCaseError11314(message11399) {
    throw new SyntaxCaseError11313(message11399);
}
function printSyntaxError11315(code11400, err11401) {
    if (!err11401.stx) {
        return "[" + err11401.name + "] " + err11401.message;
    }
    var token11402 = err11401.stx.token;
    var lineNumber11403 = _11284.find([token11402.sm_startLineNumber, token11402.sm_lineNumber, token11402.startLineNumber, token11402.lineNumber], _11284.isNumber);
    var lineStart11404 = _11284.find([token11402.sm_startLineStart, token11402.sm_lineStart, token11402.startLineStart, token11402.lineStart], _11284.isNumber);
    var start11405 = (token11402.sm_startRange || token11402.sm_range || token11402.startRange || token11402.range)[0];
    var offset11406 = start11405 - lineStart11404;
    var line11407 = "";
    var pre11408 = lineNumber11403 + ": ";
    var ch11409;
    while (ch11409 = code11400.charAt(lineStart11404++)) {
        if (ch11409 == "\r" || ch11409 == "\n") {
            break;
        }
        line11407 += ch11409;
    }
    return "[" + err11401.name + "] " + err11401.message + "\n" + pre11408 + line11407 + "\n" + Array(offset11406 + pre11408.length).join(" ") + " ^";
}
function prettyPrint11316(stxarr11410, shouldResolve11411) {
    var indent11412 = 0;
    var unparsedLines11413 = stxarr11410.reduce(function (acc11414, stx11415) {
        var s11416 = shouldResolve11411 ? expander11286.resolve(stx11415) : stx11415.token.value;
        if ( // skip the end of file token
        stx11415.token.type === parser11285.Token.EOF) {
            return acc11414;
        }
        if (stx11415.token.type === parser11285.Token.StringLiteral) {
            s11416 = "\"" + s11416 + "\"";
        }
        if (s11416 == "{") {
            acc11414[0].str += " " + s11416;
            indent11412++;
            acc11414.unshift({
                indent: indent11412,
                str: ""
            });
        } else if (s11416 == "}") {
            indent11412--;
            acc11414.unshift({
                indent: indent11412,
                str: s11416
            });
            acc11414.unshift({
                indent: indent11412,
                str: ""
            });
        } else if (s11416 == ";") {
            acc11414[0].str += s11416;
            acc11414.unshift({
                indent: indent11412,
                str: ""
            });
        } else {
            acc11414[0].str += (acc11414[0].str ? " " : "") + s11416;
        }
        return acc11414;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11413.reduce(function (acc11417, line11418) {
        var ind11419 = "";
        while (ind11419.length < line11418.indent * 2) {
            ind11419 += " ";
        }
        return ind11419 + line11418.str + "\n" + acc11417;
    }, "");
}
function adjustLineContext11317(stx11420, original11421, current11422) {
    if ( // short circuit when the array is empty;
    stx11420.length === 0) {
        return stx11420;
    }
    current11422 = current11422 || {
        lastLineNumber: stx11420[0].token.lineNumber || stx11420[0].token.startLineNumber,
        lineNumber: original11421.token.lineNumber
    };
    return _11284.map(stx11420, function (stx11423) {
        if (stx11423.isDelimiter()) {
            // handle tokens with missing line info
            stx11423.token.startLineNumber = typeof stx11423.token.startLineNumber == "undefined" ? original11421.token.lineNumber : stx11423.token.startLineNumber;
            stx11423.token.endLineNumber = typeof stx11423.token.endLineNumber == "undefined" ? original11421.token.lineNumber : stx11423.token.endLineNumber;
            stx11423.token.startLineStart = typeof stx11423.token.startLineStart == "undefined" ? original11421.token.lineStart : stx11423.token.startLineStart;
            stx11423.token.endLineStart = typeof stx11423.token.endLineStart == "undefined" ? original11421.token.lineStart : stx11423.token.endLineStart;
            stx11423.token.startRange = typeof stx11423.token.startRange == "undefined" ? original11421.token.range : stx11423.token.startRange;
            stx11423.token.endRange = typeof stx11423.token.endRange == "undefined" ? original11421.token.range : stx11423.token.endRange;
            stx11423.token.sm_startLineNumber = typeof stx11423.token.sm_startLineNumber == "undefined" ? stx11423.token.startLineNumber : stx11423.token.sm_startLineNumber;
            stx11423.token.sm_endLineNumber = typeof stx11423.token.sm_endLineNumber == "undefined" ? stx11423.token.endLineNumber : stx11423.token.sm_endLineNumber;
            stx11423.token.sm_startLineStart = typeof stx11423.token.sm_startLineStart == "undefined" ? stx11423.token.startLineStart : stx11423.token.sm_startLineStart;
            stx11423.token.sm_endLineStart = typeof stx11423.token.sm_endLineStart == "undefined" ? stx11423.token.endLineStart : stx11423.token.sm_endLineStart;
            stx11423.token.sm_startRange = typeof stx11423.token.sm_startRange == "undefined" ? stx11423.token.startRange : stx11423.token.sm_startRange;
            stx11423.token.sm_endRange = typeof stx11423.token.sm_endRange == "undefined" ? stx11423.token.endRange : stx11423.token.sm_endRange;
            if (stx11423.token.startLineNumber !== current11422.lineNumber) {
                if (stx11423.token.startLineNumber !== current11422.lastLineNumber) {
                    current11422.lineNumber++;
                    current11422.lastLineNumber = stx11423.token.startLineNumber;
                    stx11423.token.startLineNumber = current11422.lineNumber;
                } else {
                    current11422.lastLineNumber = stx11423.token.startLineNumber;
                    stx11423.token.startLineNumber = current11422.lineNumber;
                }
            }
            return stx11423;
        }
        // handle tokens with missing line info
        stx11423.token.lineNumber = typeof stx11423.token.lineNumber == "undefined" ? original11421.token.lineNumber : stx11423.token.lineNumber;
        stx11423.token.lineStart = typeof stx11423.token.lineStart == "undefined" ? original11421.token.lineStart : stx11423.token.lineStart;
        stx11423.token.range = typeof stx11423.token.range == "undefined" ? original11421.token.range : stx11423.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11423.token.sm_lineNumber = typeof stx11423.token.sm_lineNumber == "undefined" ? stx11423.token.lineNumber : stx11423.token.sm_lineNumber;
        stx11423.token.sm_lineStart = typeof stx11423.token.sm_lineStart == "undefined" ? stx11423.token.lineStart : stx11423.token.sm_lineStart;
        stx11423.token.sm_range = typeof stx11423.token.sm_range == "undefined" ? stx11423.token.range.slice() : stx11423.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11423.token.lineNumber !== current11422.lineNumber) {
            if (stx11423.token.lineNumber !== current11422.lastLineNumber) {
                current11422.lineNumber++;
                current11422.lastLineNumber = stx11423.token.lineNumber;
                stx11423.token.lineNumber = current11422.lineNumber;
            } else {
                current11422.lastLineNumber = stx11423.token.lineNumber;
                stx11423.token.lineNumber = current11422.lineNumber;
            }
        }
        return stx11423;
    });
}
function makeMultiToken11318(stxl11424) {
    if (stxl11424 instanceof Syntax11295 && stxl11424.isDelimiter()) {
        return makeIdent11300(stxl11424.token.inner.map(unwrapSyntax11304).join(""), stxl11424.token.inner[0]);
    } else if (stxl11424 instanceof Syntax11295) {
        return stxl11424;
    } else {
        assert11289(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11318;
exports.unwrapSyntax = unwrapSyntax11304;
exports.makeDelim = makeDelim11303;
exports.makePunc = makePunc11302;
exports.makeKeyword = makeKeyword11301;
exports.makeIdent = makeIdent11300;
exports.makeRegex = makeRegex11299;
exports.makeValue = makeValue11298;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11296;
exports.tokensToSyntax = tokensToSyntax11306;
exports.syntaxToTokens = syntaxToTokens11305;
exports.isSyntax = function (obj11425) {
    obj11425 = Array.isArray(obj11425) ? obj11425[0] : obj11425;
    return obj11425 instanceof Syntax11295;
};
exports.joinSyntax = joinSyntax11307;
exports.joinSyntaxArray = joinSyntaxArray11308;
exports.cloneSyntax = cloneSyntax11309;
exports.cloneSyntaxArray = cloneSyntaxArray11310;
exports.prettyPrint = prettyPrint11316;
exports.MacroSyntaxError = MacroSyntaxError11311;
exports.throwSyntaxError = throwSyntaxError11312;
exports.SyntaxCaseError = SyntaxCaseError11313;
exports.throwSyntaxCaseError = throwSyntaxCaseError11314;
exports.printSyntaxError = printSyntaxError11315;
exports.adjustLineContext = adjustLineContext11317;
exports.fresh = fresh11292;
exports.freshScope = freshScope11293;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map