"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11280 = require("underscore"),
    parser11281 = require("./parser"),
    expander11282 = require("./expander"),
    Immutable11283 = require("immutable"),
    StringMap11284 = require("./data/stringMap"),
    assert11285 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11286 = 1;
var nextFresh11287 = 0;
function fresh11288() {
    return nextFresh11287++;
}
function freshScope11289(bindings11315) {
    return new Scope(bindings11315);
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
var scopeIndex11290 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11285(bindings, "must pass in the bindings");
        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex11290++;
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

function Syntax11291(token11316, oldstx11317) {
    this.token = token11316;
    this.context = oldstx11317 && oldstx11317.context ? oldstx11317.context : Immutable11283.List();
    this.props = oldstx11317 && oldstx11317.props ? oldstx11317.props : {};
}
Syntax11291.prototype = {
    mark: function mark(newMark11318) {
        var next11319 = this.clone();
        if (next11319.token.inner) {
            next11319.token.inner = next11319.token.inner.map(function (stx11321) {
                return stx11321.mark(newMark11318);
            });
        }
        var newCtx11320 = undefined;
        if (next11319.context.first() === newMark11318) {
            // double scopes cancel
            newCtx11320 = next11319.context.rest();
        } else {
            newCtx11320 = next11319.context.unshift(newMark11318);
        }
        return syntaxFromToken11292(next11319.token, {
            context: newCtx11320,
            props: this.props
        });
    },
    delScope: function delScope(scope11322) {
        var next11323 = this.clone();
        if (next11323.token.inner) {
            next11323.token.inner = next11323.token.inner.map(function (stx11324) {
                return stx11324.delScope(scope11322);
            });
        }
        return syntaxFromToken11292(next11323.token, {
            context: next11323.context.filter(function (s11325) {
                return s11325 !== scope11322;
            }),
            props: next11323.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11326, name11327, defctx11328, phase11329) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11330) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11331 = this.token.type === parser11281.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11331 + "]";
    },
    clone: function clone() {
        var newTok11332 = {};
        var keys11333 = Object.keys(this.token);
        for (var i11334 = 0, len11335 = keys11333.length, key11336; i11334 < len11335; i11334++) {
            key11336 = keys11333[i11334];
            if (Array.isArray(this.token[key11336])) {
                if (key11336 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11332[key11336] = this.token[key11336].reduce(function (acc11337, stx11338) {
                        acc11337.push(stx11338.clone());
                        return acc11337;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11332[key11336] = this.token[key11336].reduce(function (acc11339, el11340) {
                        acc11339.push(el11340);
                        return acc11339;
                    }, []);
                }
            } else {
                newTok11332[key11336] = this.token[key11336];
            }
        }
        return syntaxFromToken11292(newTok11332, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11281.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11281.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11281.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11281.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11281.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11281.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11281.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11281.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11281.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11281.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11281.Token.EOF;
    }
};
function syntaxFromToken11292(token11341, oldstx11342) {
    return new Syntax11291(token11341, oldstx11342);
}
function mkSyntax11293(stx11343, value11344, type11345, inner11346) {
    if (stx11343 && Array.isArray(stx11343) && stx11343.length === 1) {
        stx11343 = stx11343[0];
    } else if (stx11343 && Array.isArray(stx11343)) {
        throwSyntaxError11308("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11343 === undefined) {
        throwSyntaxError11308("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11345 === parser11281.Token.Delimiter) {
        var startLineNumber11347, startLineStart11348, endLineNumber11349, endLineStart11350, startRange11351, endRange11352;
        if (!Array.isArray(inner11346)) {
            throwSyntaxError11308("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11343 && stx11343.token.type === parser11281.Token.Delimiter) {
            startLineNumber11347 = stx11343.token.startLineNumber;
            startLineStart11348 = stx11343.token.startLineStart;
            endLineNumber11349 = stx11343.token.endLineNumber;
            endLineStart11350 = stx11343.token.endLineStart;
            startRange11351 = stx11343.token.startRange;
            endRange11352 = stx11343.token.endRange;
        } else if (stx11343 && stx11343.token) {
            startLineNumber11347 = stx11343.token.lineNumber;
            startLineStart11348 = stx11343.token.lineStart;
            endLineNumber11349 = stx11343.token.lineNumber;
            endLineStart11350 = stx11343.token.lineStart;
            startRange11351 = stx11343.token.range;
            endRange11352 = stx11343.token.range;
        }
        return syntaxFromToken11292({
            type: parser11281.Token.Delimiter,
            value: value11344,
            inner: inner11346,
            startLineStart: startLineStart11348,
            startLineNumber: startLineNumber11347,
            endLineStart: endLineStart11350,
            endLineNumber: endLineNumber11349,
            startRange: startRange11351,
            endRange: endRange11352
        }, stx11343);
    } else {
        var lineStart11353, lineNumber11354, range11355;
        if (stx11343 && stx11343.token.type === parser11281.Token.Delimiter) {
            lineStart11353 = stx11343.token.startLineStart;
            lineNumber11354 = stx11343.token.startLineNumber;
            range11355 = stx11343.token.startRange;
        } else if (stx11343 && stx11343.token) {
            lineStart11353 = stx11343.token.lineStart;
            lineNumber11354 = stx11343.token.lineNumber;
            range11355 = stx11343.token.range;
        }
        return syntaxFromToken11292({
            type: type11345,
            value: value11344,
            lineStart: lineStart11353,
            lineNumber: lineNumber11354,
            range: range11355
        }, stx11343);
    }
}
function makeValue11294(val11356, stx11357) {
    if (typeof val11356 === "boolean") {
        return mkSyntax11293(stx11357, val11356 ? "true" : "false", parser11281.Token.BooleanLiteral);
    } else if (typeof val11356 === "number") {
        if (val11356 !== val11356) {
            return makeDelim11299("()", [makeValue11294(0, stx11357), makePunc11298("/", stx11357), makeValue11294(0, stx11357)], stx11357);
        }
        if (val11356 < 0) {
            return makeDelim11299("()", [makePunc11298("-", stx11357), makeValue11294(Math.abs(val11356), stx11357)], stx11357);
        } else {
            return mkSyntax11293(stx11357, val11356, parser11281.Token.NumericLiteral);
        }
    } else if (typeof val11356 === "string") {
        return mkSyntax11293(stx11357, val11356, parser11281.Token.StringLiteral);
    } else if (val11356 === null) {
        return mkSyntax11293(stx11357, "null", parser11281.Token.NullLiteral);
    } else {
        throwSyntaxError11308("makeValue", "Cannot make value syntax object from: " + val11356);
    }
}
function makeRegex11295(val11358, flags11359, stx11360) {
    var newstx11361 = mkSyntax11293(stx11360, new RegExp(val11358, flags11359), parser11281.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11361.token.literal = val11358;
    return newstx11361;
}
function makeIdent11296(val11362, stx11363) {
    return mkSyntax11293(stx11363, val11362, parser11281.Token.Identifier);
}
function makeKeyword11297(val11364, stx11365) {
    return mkSyntax11293(stx11365, val11364, parser11281.Token.Keyword);
}
function makePunc11298(val11366, stx11367) {
    return mkSyntax11293(stx11367, val11366, parser11281.Token.Punctuator);
}
function makeDelim11299(val11368, inner11369, stx11370) {
    return mkSyntax11293(stx11370, val11368, parser11281.Token.Delimiter, inner11369);
}
function unwrapSyntax11300(stx11371) {
    if (Array.isArray(stx11371) && stx11371.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11371 = stx11371[0];
    }
    if (stx11371.token) {
        if (stx11371.token.type === parser11281.Token.Delimiter) {
            return stx11371.token;
        } else {
            return stx11371.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11371);
    }
}
function syntaxToTokens11301(stx11372) {
    return _11280.map(stx11372, function (stx11373) {
        if (stx11373.token.inner) {
            stx11373.token.inner = syntaxToTokens11301(stx11373.token.inner);
        }
        return stx11373.token;
    });
}
function tokensToSyntax11302(tokens11374) {
    if (!_11280.isArray(tokens11374)) {
        tokens11374 = [tokens11374];
    }
    return _11280.map(tokens11374, function (token11375) {
        if (token11375.inner) {
            token11375.inner = tokensToSyntax11302(token11375.inner);
        }
        return syntaxFromToken11292(token11375);
    });
}
function joinSyntax11303(tojoin11376, punc11377) {
    if (tojoin11376.length === 0) {
        return [];
    }
    if (punc11377 === " ") {
        return tojoin11376;
    }
    return _11280.reduce(_11280.rest(tojoin11376, 1), function (acc11378, join11379) {
        acc11378.push(cloneSyntax11305(punc11377), join11379);
        return acc11378;
    }, [_11280.first(tojoin11376)]);
}
function joinSyntaxArray11304(tojoin11380, punc11381) {
    if (tojoin11380.length === 0) {
        return [];
    }
    if (punc11381 === " ") {
        return _11280.flatten(tojoin11380, true);
    }
    return _11280.reduce(_11280.rest(tojoin11380, 1), function (acc11382, join11383) {
        acc11382.push(cloneSyntax11305(punc11381));
        Array.prototype.push.apply(acc11382, join11383);
        return acc11382;
    }, _11280.first(tojoin11380));
}
function cloneSyntax11305(stx11384) {
    return syntaxFromToken11292(_11280.clone(stx11384.token), stx11384);
}
function cloneSyntaxArray11306(arr11385) {
    return arr11385.map(function (stx11386) {
        var o11387 = cloneSyntax11305(stx11386);
        if (o11387.token.type === parser11281.Token.Delimiter) {
            o11387.token.inner = cloneSyntaxArray11306(o11387.token.inner);
        }
        return o11387;
    });
}
function MacroSyntaxError11307(name11388, message11389, stx11390) {
    this.name = name11388;
    this.message = message11389;
    this.stx = stx11390;
}
function throwSyntaxError11308(name11391, message11392, stx11393) {
    if (stx11393 && Array.isArray(stx11393)) {
        stx11393 = stx11393[0];
    }
    throw new MacroSyntaxError11307(name11391, message11392, stx11393);
}
function SyntaxCaseError11309(message11394) {
    this.message = message11394;
}
function throwSyntaxCaseError11310(message11395) {
    throw new SyntaxCaseError11309(message11395);
}
function printSyntaxError11311(code11396, err11397) {
    if (!err11397.stx) {
        return "[" + err11397.name + "] " + err11397.message;
    }
    var token11398 = err11397.stx.token;
    var lineNumber11399 = _11280.find([token11398.sm_startLineNumber, token11398.sm_lineNumber, token11398.startLineNumber, token11398.lineNumber], _11280.isNumber);
    var lineStart11400 = _11280.find([token11398.sm_startLineStart, token11398.sm_lineStart, token11398.startLineStart, token11398.lineStart], _11280.isNumber);
    var start11401 = (token11398.sm_startRange || token11398.sm_range || token11398.startRange || token11398.range)[0];
    var offset11402 = start11401 - lineStart11400;
    var line11403 = "";
    var pre11404 = lineNumber11399 + ": ";
    var ch11405;
    while (ch11405 = code11396.charAt(lineStart11400++)) {
        if (ch11405 == "\r" || ch11405 == "\n") {
            break;
        }
        line11403 += ch11405;
    }
    return "[" + err11397.name + "] " + err11397.message + "\n" + pre11404 + line11403 + "\n" + Array(offset11402 + pre11404.length).join(" ") + " ^";
}
function prettyPrint11312(stxarr11406, shouldResolve11407) {
    var indent11408 = 0;
    var unparsedLines11409 = stxarr11406.reduce(function (acc11410, stx11411) {
        var s11412 = shouldResolve11407 ? expander11282.resolve(stx11411) : stx11411.token.value;
        if ( // skip the end of file token
        stx11411.token.type === parser11281.Token.EOF) {
            return acc11410;
        }
        if (stx11411.token.type === parser11281.Token.StringLiteral) {
            s11412 = "\"" + s11412 + "\"";
        }
        if (s11412 == "{") {
            acc11410[0].str += " " + s11412;
            indent11408++;
            acc11410.unshift({
                indent: indent11408,
                str: ""
            });
        } else if (s11412 == "}") {
            indent11408--;
            acc11410.unshift({
                indent: indent11408,
                str: s11412
            });
            acc11410.unshift({
                indent: indent11408,
                str: ""
            });
        } else if (s11412 == ";") {
            acc11410[0].str += s11412;
            acc11410.unshift({
                indent: indent11408,
                str: ""
            });
        } else {
            acc11410[0].str += (acc11410[0].str ? " " : "") + s11412;
        }
        return acc11410;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11409.reduce(function (acc11413, line11414) {
        var ind11415 = "";
        while (ind11415.length < line11414.indent * 2) {
            ind11415 += " ";
        }
        return ind11415 + line11414.str + "\n" + acc11413;
    }, "");
}
function adjustLineContext11313(stx11416, original11417, current11418) {
    if ( // short circuit when the array is empty;
    stx11416.length === 0) {
        return stx11416;
    }
    current11418 = current11418 || {
        lastLineNumber: stx11416[0].token.lineNumber || stx11416[0].token.startLineNumber,
        lineNumber: original11417.token.lineNumber
    };
    return _11280.map(stx11416, function (stx11419) {
        if (stx11419.isDelimiter()) {
            // handle tokens with missing line info
            stx11419.token.startLineNumber = typeof stx11419.token.startLineNumber == "undefined" ? original11417.token.lineNumber : stx11419.token.startLineNumber;
            stx11419.token.endLineNumber = typeof stx11419.token.endLineNumber == "undefined" ? original11417.token.lineNumber : stx11419.token.endLineNumber;
            stx11419.token.startLineStart = typeof stx11419.token.startLineStart == "undefined" ? original11417.token.lineStart : stx11419.token.startLineStart;
            stx11419.token.endLineStart = typeof stx11419.token.endLineStart == "undefined" ? original11417.token.lineStart : stx11419.token.endLineStart;
            stx11419.token.startRange = typeof stx11419.token.startRange == "undefined" ? original11417.token.range : stx11419.token.startRange;
            stx11419.token.endRange = typeof stx11419.token.endRange == "undefined" ? original11417.token.range : stx11419.token.endRange;
            stx11419.token.sm_startLineNumber = typeof stx11419.token.sm_startLineNumber == "undefined" ? stx11419.token.startLineNumber : stx11419.token.sm_startLineNumber;
            stx11419.token.sm_endLineNumber = typeof stx11419.token.sm_endLineNumber == "undefined" ? stx11419.token.endLineNumber : stx11419.token.sm_endLineNumber;
            stx11419.token.sm_startLineStart = typeof stx11419.token.sm_startLineStart == "undefined" ? stx11419.token.startLineStart : stx11419.token.sm_startLineStart;
            stx11419.token.sm_endLineStart = typeof stx11419.token.sm_endLineStart == "undefined" ? stx11419.token.endLineStart : stx11419.token.sm_endLineStart;
            stx11419.token.sm_startRange = typeof stx11419.token.sm_startRange == "undefined" ? stx11419.token.startRange : stx11419.token.sm_startRange;
            stx11419.token.sm_endRange = typeof stx11419.token.sm_endRange == "undefined" ? stx11419.token.endRange : stx11419.token.sm_endRange;
            if (stx11419.token.startLineNumber !== current11418.lineNumber) {
                if (stx11419.token.startLineNumber !== current11418.lastLineNumber) {
                    current11418.lineNumber++;
                    current11418.lastLineNumber = stx11419.token.startLineNumber;
                    stx11419.token.startLineNumber = current11418.lineNumber;
                } else {
                    current11418.lastLineNumber = stx11419.token.startLineNumber;
                    stx11419.token.startLineNumber = current11418.lineNumber;
                }
            }
            return stx11419;
        }
        // handle tokens with missing line info
        stx11419.token.lineNumber = typeof stx11419.token.lineNumber == "undefined" ? original11417.token.lineNumber : stx11419.token.lineNumber;
        stx11419.token.lineStart = typeof stx11419.token.lineStart == "undefined" ? original11417.token.lineStart : stx11419.token.lineStart;
        stx11419.token.range = typeof stx11419.token.range == "undefined" ? original11417.token.range : stx11419.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11419.token.sm_lineNumber = typeof stx11419.token.sm_lineNumber == "undefined" ? stx11419.token.lineNumber : stx11419.token.sm_lineNumber;
        stx11419.token.sm_lineStart = typeof stx11419.token.sm_lineStart == "undefined" ? stx11419.token.lineStart : stx11419.token.sm_lineStart;
        stx11419.token.sm_range = typeof stx11419.token.sm_range == "undefined" ? stx11419.token.range.slice() : stx11419.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11419.token.lineNumber !== current11418.lineNumber) {
            if (stx11419.token.lineNumber !== current11418.lastLineNumber) {
                current11418.lineNumber++;
                current11418.lastLineNumber = stx11419.token.lineNumber;
                stx11419.token.lineNumber = current11418.lineNumber;
            } else {
                current11418.lastLineNumber = stx11419.token.lineNumber;
                stx11419.token.lineNumber = current11418.lineNumber;
            }
        }
        return stx11419;
    });
}
function makeMultiToken11314(stxl11420) {
    if (stxl11420 instanceof Syntax11291 && stxl11420.isDelimiter()) {
        return makeIdent11296(stxl11420.token.inner.map(unwrapSyntax11300).join(""), stxl11420.token.inner[0]);
    } else if (stxl11420 instanceof Syntax11291) {
        return stxl11420;
    } else {
        assert11285(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11314;
exports.unwrapSyntax = unwrapSyntax11300;
exports.makeDelim = makeDelim11299;
exports.makePunc = makePunc11298;
exports.makeKeyword = makeKeyword11297;
exports.makeIdent = makeIdent11296;
exports.makeRegex = makeRegex11295;
exports.makeValue = makeValue11294;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11292;
exports.tokensToSyntax = tokensToSyntax11302;
exports.syntaxToTokens = syntaxToTokens11301;
exports.isSyntax = function (obj11421) {
    obj11421 = Array.isArray(obj11421) ? obj11421[0] : obj11421;
    return obj11421 instanceof Syntax11291;
};
exports.joinSyntax = joinSyntax11303;
exports.joinSyntaxArray = joinSyntaxArray11304;
exports.cloneSyntax = cloneSyntax11305;
exports.cloneSyntaxArray = cloneSyntaxArray11306;
exports.prettyPrint = prettyPrint11312;
exports.MacroSyntaxError = MacroSyntaxError11307;
exports.throwSyntaxError = throwSyntaxError11308;
exports.SyntaxCaseError = SyntaxCaseError11309;
exports.throwSyntaxCaseError = throwSyntaxCaseError11310;
exports.printSyntaxError = printSyntaxError11311;
exports.adjustLineContext = adjustLineContext11313;
exports.fresh = fresh11288;
exports.freshScope = freshScope11289;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map