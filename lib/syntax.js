"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11351 = require("underscore"),
    parser11352 = require("./parser"),
    expander11353 = require("./expander"),
    Immutable11354 = require("immutable"),
    StringMap11355 = require("./data/stringMap"),
    assert11356 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11357 = 1;
var nextFresh11358 = 0;
function fresh11359() {
    return nextFresh11358++;
}
function freshScope11360(bindings11390) {
    return new Scope(bindings11390);
}
function Rename11361(id11391, name11392, ctx11393, defctx11394, phase11395) {
    defctx11394 = defctx11394 || null;
    this.id = id11391;
    this.name = name11392;
    this.context = ctx11393;
    this.def = defctx11394;
    this.instNum = globalContextInstanceNumber11357++;
    this.phase = phase11395;
}
function Mark11362(mark11396, ctx11397) {
    this.mark = mark11396;
    this.context = ctx11397;
    this.instNum = globalContextInstanceNumber11357++;
}
function Def11363(defctx11398, ctx11399) {
    this.defctx = defctx11398;
    this.context = ctx11399;
    this.instNum = globalContextInstanceNumber11357++;
}
function Imported11364(localName11400, exportName11401, phase11402, mod11403, ctx11404) {
    this.localName = localName11400;
    this.exportName = exportName11401;
    this.phase = phase11402;
    this.mod = mod11403;
    this.context = ctx11404;
    this.instNum = globalContextInstanceNumber11357++;
}
var scopeIndex11365 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11356(bindings, "must pass in the bindings");
        this.name = scopeIndex11365++;
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

function Syntax11366(token11405, oldstx11406) {
    this.token = token11405;
    this.context = oldstx11406 && oldstx11406.context ? oldstx11406.context : Immutable11354.List();
    this.props = oldstx11406 && oldstx11406.props ? oldstx11406.props : {};
}
Syntax11366.prototype = {
    mark: function mark(newMark11407) {
        var next11408 = this.clone();
        if (next11408.token.inner) {
            next11408.token.inner = next11408.token.inner.map(function (stx11410) {
                return stx11410.mark(newMark11407);
            });
        }
        var newCtx11409 = undefined;
        if (next11408.context.first() === newMark11407) {
            // double scopes cancel
            newCtx11409 = next11408.context.rest();
        } else {
            newCtx11409 = next11408.context.unshift(newMark11407);
        }
        return syntaxFromToken11367(next11408.token, {
            context: newCtx11409,
            props: this.props
        });
    },
    delScope: function delScope(scope11411) {
        var next11412 = this.clone();
        if (next11412.token.inner) {
            next11412.token.inner = next11412.token.inner.map(function (stx11413) {
                return stx11413.delScope(scope11411);
            });
        }
        return syntaxFromToken11367(next11412.token, {
            context: next11412.context.filter(function (s11414) {
                return s11414 !== scope11411;
            }),
            props: next11412.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11415, name11416, defctx11417, phase11418) {
        return this;
    },
    imported: function imported(localName11419, exportName11420, phase11421, mod11422) {
        return this;
    },
    addDefCtx: function addDefCtx(defctx11423) {
        return this;
    },
    getDefCtx: function getDefCtx() {
        return null;
    },
    toString: function toString() {
        var val11424 = this.token.type === parser11352.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11424 + "]";
    },
    clone: function clone() {
        var newTok11425 = {};
        var keys11426 = Object.keys(this.token);
        for (var i11427 = 0, len11428 = keys11426.length, key11429; i11427 < len11428; i11427++) {
            key11429 = keys11426[i11427];
            if (Array.isArray(this.token[key11429])) {
                if (key11429 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11425[key11429] = this.token[key11429].reduce(function (acc11430, stx11431) {
                        acc11430.push(stx11431.clone());
                        return acc11430;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11425[key11429] = this.token[key11429].reduce(function (acc11432, el11433) {
                        acc11432.push(el11433);
                        return acc11432;
                    }, []);
                }
            } else {
                newTok11425[key11429] = this.token[key11429];
            }
        }
        return syntaxFromToken11367(newTok11425, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11352.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11352.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11352.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11352.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11352.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11352.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11352.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11352.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11352.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11352.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11352.Token.EOF;
    }
};
function syntaxFromToken11367(token11434, oldstx11435) {
    return new Syntax11366(token11434, oldstx11435);
}
function mkSyntax11368(stx11436, value11437, type11438, inner11439) {
    if (stx11436 && Array.isArray(stx11436) && stx11436.length === 1) {
        stx11436 = stx11436[0];
    } else if (stx11436 && Array.isArray(stx11436)) {
        throwSyntaxError11383("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11436 === undefined) {
        throwSyntaxError11383("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11438 === parser11352.Token.Delimiter) {
        var startLineNumber11440, startLineStart11441, endLineNumber11442, endLineStart11443, startRange11444, endRange11445;
        if (!Array.isArray(inner11439)) {
            throwSyntaxError11383("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11436 && stx11436.token.type === parser11352.Token.Delimiter) {
            startLineNumber11440 = stx11436.token.startLineNumber;
            startLineStart11441 = stx11436.token.startLineStart;
            endLineNumber11442 = stx11436.token.endLineNumber;
            endLineStart11443 = stx11436.token.endLineStart;
            startRange11444 = stx11436.token.startRange;
            endRange11445 = stx11436.token.endRange;
        } else if (stx11436 && stx11436.token) {
            startLineNumber11440 = stx11436.token.lineNumber;
            startLineStart11441 = stx11436.token.lineStart;
            endLineNumber11442 = stx11436.token.lineNumber;
            endLineStart11443 = stx11436.token.lineStart;
            startRange11444 = stx11436.token.range;
            endRange11445 = stx11436.token.range;
        }
        return syntaxFromToken11367({
            type: parser11352.Token.Delimiter,
            value: value11437,
            inner: inner11439,
            startLineStart: startLineStart11441,
            startLineNumber: startLineNumber11440,
            endLineStart: endLineStart11443,
            endLineNumber: endLineNumber11442,
            startRange: startRange11444,
            endRange: endRange11445
        }, stx11436);
    } else {
        var lineStart11446, lineNumber11447, range11448;
        if (stx11436 && stx11436.token.type === parser11352.Token.Delimiter) {
            lineStart11446 = stx11436.token.startLineStart;
            lineNumber11447 = stx11436.token.startLineNumber;
            range11448 = stx11436.token.startRange;
        } else if (stx11436 && stx11436.token) {
            lineStart11446 = stx11436.token.lineStart;
            lineNumber11447 = stx11436.token.lineNumber;
            range11448 = stx11436.token.range;
        }
        return syntaxFromToken11367({
            type: type11438,
            value: value11437,
            lineStart: lineStart11446,
            lineNumber: lineNumber11447,
            range: range11448
        }, stx11436);
    }
}
function makeValue11369(val11449, stx11450) {
    if (typeof val11449 === "boolean") {
        return mkSyntax11368(stx11450, val11449 ? "true" : "false", parser11352.Token.BooleanLiteral);
    } else if (typeof val11449 === "number") {
        if (val11449 !== val11449) {
            return makeDelim11374("()", [makeValue11369(0, stx11450), makePunc11373("/", stx11450), makeValue11369(0, stx11450)], stx11450);
        }
        if (val11449 < 0) {
            return makeDelim11374("()", [makePunc11373("-", stx11450), makeValue11369(Math.abs(val11449), stx11450)], stx11450);
        } else {
            return mkSyntax11368(stx11450, val11449, parser11352.Token.NumericLiteral);
        }
    } else if (typeof val11449 === "string") {
        return mkSyntax11368(stx11450, val11449, parser11352.Token.StringLiteral);
    } else if (val11449 === null) {
        return mkSyntax11368(stx11450, "null", parser11352.Token.NullLiteral);
    } else {
        throwSyntaxError11383("makeValue", "Cannot make value syntax object from: " + val11449);
    }
}
function makeRegex11370(val11451, flags11452, stx11453) {
    var newstx11454 = mkSyntax11368(stx11453, new RegExp(val11451, flags11452), parser11352.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11454.token.literal = val11451;
    return newstx11454;
}
function makeIdent11371(val11455, stx11456) {
    return mkSyntax11368(stx11456, val11455, parser11352.Token.Identifier);
}
function makeKeyword11372(val11457, stx11458) {
    return mkSyntax11368(stx11458, val11457, parser11352.Token.Keyword);
}
function makePunc11373(val11459, stx11460) {
    return mkSyntax11368(stx11460, val11459, parser11352.Token.Punctuator);
}
function makeDelim11374(val11461, inner11462, stx11463) {
    return mkSyntax11368(stx11463, val11461, parser11352.Token.Delimiter, inner11462);
}
function unwrapSyntax11375(stx11464) {
    if (Array.isArray(stx11464) && stx11464.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11464 = stx11464[0];
    }
    if (stx11464.token) {
        if (stx11464.token.type === parser11352.Token.Delimiter) {
            return stx11464.token;
        } else {
            return stx11464.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11464);
    }
}
function syntaxToTokens11376(stx11465) {
    return _11351.map(stx11465, function (stx11466) {
        if (stx11466.token.inner) {
            stx11466.token.inner = syntaxToTokens11376(stx11466.token.inner);
        }
        return stx11466.token;
    });
}
function tokensToSyntax11377(tokens11467) {
    if (!_11351.isArray(tokens11467)) {
        tokens11467 = [tokens11467];
    }
    return _11351.map(tokens11467, function (token11468) {
        if (token11468.inner) {
            token11468.inner = tokensToSyntax11377(token11468.inner);
        }
        return syntaxFromToken11367(token11468);
    });
}
function joinSyntax11378(tojoin11469, punc11470) {
    if (tojoin11469.length === 0) {
        return [];
    }
    if (punc11470 === " ") {
        return tojoin11469;
    }
    return _11351.reduce(_11351.rest(tojoin11469, 1), function (acc11471, join11472) {
        acc11471.push(cloneSyntax11380(punc11470), join11472);
        return acc11471;
    }, [_11351.first(tojoin11469)]);
}
function joinSyntaxArray11379(tojoin11473, punc11474) {
    if (tojoin11473.length === 0) {
        return [];
    }
    if (punc11474 === " ") {
        return _11351.flatten(tojoin11473, true);
    }
    return _11351.reduce(_11351.rest(tojoin11473, 1), function (acc11475, join11476) {
        acc11475.push(cloneSyntax11380(punc11474));
        Array.prototype.push.apply(acc11475, join11476);
        return acc11475;
    }, _11351.first(tojoin11473));
}
function cloneSyntax11380(stx11477) {
    return syntaxFromToken11367(_11351.clone(stx11477.token), stx11477);
}
function cloneSyntaxArray11381(arr11478) {
    return arr11478.map(function (stx11479) {
        var o11480 = cloneSyntax11380(stx11479);
        if (o11480.token.type === parser11352.Token.Delimiter) {
            o11480.token.inner = cloneSyntaxArray11381(o11480.token.inner);
        }
        return o11480;
    });
}
function MacroSyntaxError11382(name11481, message11482, stx11483) {
    this.name = name11481;
    this.message = message11482;
    this.stx = stx11483;
}
function throwSyntaxError11383(name11484, message11485, stx11486) {
    if (stx11486 && Array.isArray(stx11486)) {
        stx11486 = stx11486[0];
    }
    throw new MacroSyntaxError11382(name11484, message11485, stx11486);
}
function SyntaxCaseError11384(message11487) {
    this.message = message11487;
}
function throwSyntaxCaseError11385(message11488) {
    throw new SyntaxCaseError11384(message11488);
}
function printSyntaxError11386(code11489, err11490) {
    if (!err11490.stx) {
        return "[" + err11490.name + "] " + err11490.message;
    }
    var token11491 = err11490.stx.token;
    var lineNumber11492 = _11351.find([token11491.sm_startLineNumber, token11491.sm_lineNumber, token11491.startLineNumber, token11491.lineNumber], _11351.isNumber);
    var lineStart11493 = _11351.find([token11491.sm_startLineStart, token11491.sm_lineStart, token11491.startLineStart, token11491.lineStart], _11351.isNumber);
    var start11494 = (token11491.sm_startRange || token11491.sm_range || token11491.startRange || token11491.range)[0];
    var offset11495 = start11494 - lineStart11493;
    var line11496 = "";
    var pre11497 = lineNumber11492 + ": ";
    var ch11498;
    while (ch11498 = code11489.charAt(lineStart11493++)) {
        if (ch11498 == "\r" || ch11498 == "\n") {
            break;
        }
        line11496 += ch11498;
    }
    return "[" + err11490.name + "] " + err11490.message + "\n" + pre11497 + line11496 + "\n" + Array(offset11495 + pre11497.length).join(" ") + " ^";
}
function prettyPrint11387(stxarr11499, shouldResolve11500) {
    var indent11501 = 0;
    var unparsedLines11502 = stxarr11499.reduce(function (acc11503, stx11504) {
        var s11505 = shouldResolve11500 ? expander11353.resolve(stx11504) : stx11504.token.value;
        if ( // skip the end of file token
        stx11504.token.type === parser11352.Token.EOF) {
            return acc11503;
        }
        if (stx11504.token.type === parser11352.Token.StringLiteral) {
            s11505 = "\"" + s11505 + "\"";
        }
        if (s11505 == "{") {
            acc11503[0].str += " " + s11505;
            indent11501++;
            acc11503.unshift({
                indent: indent11501,
                str: ""
            });
        } else if (s11505 == "}") {
            indent11501--;
            acc11503.unshift({
                indent: indent11501,
                str: s11505
            });
            acc11503.unshift({
                indent: indent11501,
                str: ""
            });
        } else if (s11505 == ";") {
            acc11503[0].str += s11505;
            acc11503.unshift({
                indent: indent11501,
                str: ""
            });
        } else {
            acc11503[0].str += (acc11503[0].str ? " " : "") + s11505;
        }
        return acc11503;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11502.reduce(function (acc11506, line11507) {
        var ind11508 = "";
        while (ind11508.length < line11507.indent * 2) {
            ind11508 += " ";
        }
        return ind11508 + line11507.str + "\n" + acc11506;
    }, "");
}
function adjustLineContext11388(stx11509, original11510, current11511) {
    if ( // short circuit when the array is empty;
    stx11509.length === 0) {
        return stx11509;
    }
    current11511 = current11511 || {
        lastLineNumber: stx11509[0].token.lineNumber || stx11509[0].token.startLineNumber,
        lineNumber: original11510.token.lineNumber
    };
    return _11351.map(stx11509, function (stx11512) {
        if (stx11512.isDelimiter()) {
            // handle tokens with missing line info
            stx11512.token.startLineNumber = typeof stx11512.token.startLineNumber == "undefined" ? original11510.token.lineNumber : stx11512.token.startLineNumber;
            stx11512.token.endLineNumber = typeof stx11512.token.endLineNumber == "undefined" ? original11510.token.lineNumber : stx11512.token.endLineNumber;
            stx11512.token.startLineStart = typeof stx11512.token.startLineStart == "undefined" ? original11510.token.lineStart : stx11512.token.startLineStart;
            stx11512.token.endLineStart = typeof stx11512.token.endLineStart == "undefined" ? original11510.token.lineStart : stx11512.token.endLineStart;
            stx11512.token.startRange = typeof stx11512.token.startRange == "undefined" ? original11510.token.range : stx11512.token.startRange;
            stx11512.token.endRange = typeof stx11512.token.endRange == "undefined" ? original11510.token.range : stx11512.token.endRange;
            stx11512.token.sm_startLineNumber = typeof stx11512.token.sm_startLineNumber == "undefined" ? stx11512.token.startLineNumber : stx11512.token.sm_startLineNumber;
            stx11512.token.sm_endLineNumber = typeof stx11512.token.sm_endLineNumber == "undefined" ? stx11512.token.endLineNumber : stx11512.token.sm_endLineNumber;
            stx11512.token.sm_startLineStart = typeof stx11512.token.sm_startLineStart == "undefined" ? stx11512.token.startLineStart : stx11512.token.sm_startLineStart;
            stx11512.token.sm_endLineStart = typeof stx11512.token.sm_endLineStart == "undefined" ? stx11512.token.endLineStart : stx11512.token.sm_endLineStart;
            stx11512.token.sm_startRange = typeof stx11512.token.sm_startRange == "undefined" ? stx11512.token.startRange : stx11512.token.sm_startRange;
            stx11512.token.sm_endRange = typeof stx11512.token.sm_endRange == "undefined" ? stx11512.token.endRange : stx11512.token.sm_endRange;
            if (stx11512.token.startLineNumber !== current11511.lineNumber) {
                if (stx11512.token.startLineNumber !== current11511.lastLineNumber) {
                    current11511.lineNumber++;
                    current11511.lastLineNumber = stx11512.token.startLineNumber;
                    stx11512.token.startLineNumber = current11511.lineNumber;
                } else {
                    current11511.lastLineNumber = stx11512.token.startLineNumber;
                    stx11512.token.startLineNumber = current11511.lineNumber;
                }
            }
            return stx11512;
        }
        // handle tokens with missing line info
        stx11512.token.lineNumber = typeof stx11512.token.lineNumber == "undefined" ? original11510.token.lineNumber : stx11512.token.lineNumber;
        stx11512.token.lineStart = typeof stx11512.token.lineStart == "undefined" ? original11510.token.lineStart : stx11512.token.lineStart;
        stx11512.token.range = typeof stx11512.token.range == "undefined" ? original11510.token.range : stx11512.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11512.token.sm_lineNumber = typeof stx11512.token.sm_lineNumber == "undefined" ? stx11512.token.lineNumber : stx11512.token.sm_lineNumber;
        stx11512.token.sm_lineStart = typeof stx11512.token.sm_lineStart == "undefined" ? stx11512.token.lineStart : stx11512.token.sm_lineStart;
        stx11512.token.sm_range = typeof stx11512.token.sm_range == "undefined" ? stx11512.token.range.slice() : stx11512.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11512.token.lineNumber !== current11511.lineNumber) {
            if (stx11512.token.lineNumber !== current11511.lastLineNumber) {
                current11511.lineNumber++;
                current11511.lastLineNumber = stx11512.token.lineNumber;
                stx11512.token.lineNumber = current11511.lineNumber;
            } else {
                current11511.lastLineNumber = stx11512.token.lineNumber;
                stx11512.token.lineNumber = current11511.lineNumber;
            }
        }
        return stx11512;
    });
}
function makeMultiToken11389(stxl11513) {
    if (stxl11513 instanceof Syntax11366 && stxl11513.isDelimiter()) {
        return makeIdent11371(stxl11513.token.inner.map(unwrapSyntax11375).join(""), stxl11513.token.inner[0]);
    } else if (stxl11513 instanceof Syntax11366) {
        return stxl11513;
    } else {
        assert11356(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11389;
exports.unwrapSyntax = unwrapSyntax11375;
exports.makeDelim = makeDelim11374;
exports.makePunc = makePunc11373;
exports.makeKeyword = makeKeyword11372;
exports.makeIdent = makeIdent11371;
exports.makeRegex = makeRegex11370;
exports.makeValue = makeValue11369;
exports.Rename = Rename11361;
exports.Mark = Mark11362;
exports.Def = Def11363;
exports.Imported = Imported11364;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11367;
exports.tokensToSyntax = tokensToSyntax11377;
exports.syntaxToTokens = syntaxToTokens11376;
exports.isSyntax = function (obj11514) {
    obj11514 = Array.isArray(obj11514) ? obj11514[0] : obj11514;
    return obj11514 instanceof Syntax11366;
};
exports.joinSyntax = joinSyntax11378;
exports.joinSyntaxArray = joinSyntaxArray11379;
exports.cloneSyntax = cloneSyntax11380;
exports.cloneSyntaxArray = cloneSyntaxArray11381;
exports.prettyPrint = prettyPrint11387;
exports.MacroSyntaxError = MacroSyntaxError11382;
exports.throwSyntaxError = throwSyntaxError11383;
exports.SyntaxCaseError = SyntaxCaseError11384;
exports.throwSyntaxCaseError = throwSyntaxCaseError11385;
exports.printSyntaxError = printSyntaxError11386;
exports.adjustLineContext = adjustLineContext11388;
exports.fresh = fresh11359;
exports.freshScope = freshScope11360;
// import @ from "contracts.js"
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map