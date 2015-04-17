"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _11060 = require("underscore"),
    parser11061 = require("./parser"),
    expander11062 = require("./expander"),
    Immutable11063 = require("immutable"),
    StringMap11064 = require("./data/stringMap"),
    assert11065 = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber11066 = 1;
var nextFresh11067 = 0;
function fresh11068() {
    return nextFresh11067++;
}
function freshScope11069(bindings11095) {
    return new Scope(bindings11095);
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
var scopeIndex11070 = 0;

var Scope = (function () {
    function Scope(bindings) {
        _classCallCheck(this, Scope);

        assert11065(bindings, "must pass in the bindings");
        // name is just for debugging, comparison of scopes is by object identity
        this.name = scopeIndex11070++;
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

function Syntax11071(token11096, oldstx11097) {
    this.token = token11096;
    this.context = oldstx11097 && oldstx11097.context ? oldstx11097.context : Immutable11063.List();
    this.props = oldstx11097 && oldstx11097.props ? oldstx11097.props : {};
}
Syntax11071.prototype = {
    mark: function mark(newMark11098) {
        var next11099 = this.clone();
        if (next11099.token.inner) {
            next11099.token.inner = next11099.token.inner.map(function (stx11101) {
                return stx11101.mark(newMark11098);
            });
        }
        var newCtx11100 = undefined;
        if (next11099.context.first() === newMark11098) {
            // double scopes cancel
            newCtx11100 = next11099.context.rest();
        } else {
            newCtx11100 = next11099.context.unshift(newMark11098);
        }
        return syntaxFromToken11072(next11099.token, {
            context: newCtx11100,
            props: this.props
        });
    },
    delScope: function delScope(scope11102) {
        var next11103 = this.clone();
        if (next11103.token.inner) {
            next11103.token.inner = next11103.token.inner.map(function (stx11104) {
                return stx11104.delScope(scope11102);
            });
        }
        return syntaxFromToken11072(next11103.token, {
            context: next11103.context.filter(function (s11105) {
                return s11105 !== scope11102;
            }),
            props: next11103.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function rename(id11106, name11107, defctx11108, phase11109) {
        console.log("rename is deprecated no longer needed");
        return this;
    },
    addDefCtx: function addDefCtx(defctx11110) {
        console.log("addDefCtx is deprecated no longer needed");
        return this;
    },
    getDefCtx: function getDefCtx() {
        console.log("getDefCtx is deprecated no longer needed");
        return null;
    },
    toString: function toString() {
        var val11111 = this.token.type === parser11061.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val11111 + "]";
    },
    clone: function clone() {
        var newTok11112 = {};
        var keys11113 = Object.keys(this.token);
        for (var i11114 = 0, len11115 = keys11113.length, key11116; i11114 < len11115; i11114++) {
            key11116 = keys11113[i11114];
            if (Array.isArray(this.token[key11116])) {
                if (key11116 === "inner") {
                    // need to clone the children of a delimiter
                    newTok11112[key11116] = this.token[key11116].reduce(function (acc11117, stx11118) {
                        acc11117.push(stx11118.clone());
                        return acc11117;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok11112[key11116] = this.token[key11116].reduce(function (acc11119, el11120) {
                        acc11119.push(el11120);
                        return acc11119;
                    }, []);
                }
            } else {
                newTok11112[key11116] = this.token[key11116];
            }
        }
        return syntaxFromToken11072(newTok11112, this);
    },
    expose: function expose() {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function isIdentifier() {
        return this.token && this.token.type === parser11061.Token.Identifier;
    },
    isStringLiteral: function isStringLiteral() {
        return this.token && this.token.type === parser11061.Token.StringLiteral;
    },
    isNumericLiteral: function isNumericLiteral() {
        return this.token && this.token.type === parser11061.Token.NumericLiteral;
    },
    isBooleanLiteral: function isBooleanLiteral() {
        return this.token && this.token.type === parser11061.Token.BooleanLiteral;
    },
    isNullLiteral: function isNullLiteral() {
        return this.token && this.token.type === parser11061.Token.NullLiteral;
    },
    isKeyword: function isKeyword() {
        return this.token && this.token.type === parser11061.Token.Keyword;
    },
    isPunctuator: function isPunctuator() {
        return this.token && this.token.type === parser11061.Token.Punctuator;
    },
    isRegularExpression: function isRegularExpression() {
        return this.token && this.token.type === parser11061.Token.RegularExpression;
    },
    isTemplate: function isTemplate() {
        return this.token && this.token.type === parser11061.Token.Template;
    },
    isDelimiter: function isDelimiter() {
        return this.token && this.token.type === parser11061.Token.Delimiter;
    },
    isEOF: function isEOF() {
        return this.token && this.token.type === parser11061.Token.EOF;
    }
};
function syntaxFromToken11072(token11121, oldstx11122) {
    return new Syntax11071(token11121, oldstx11122);
}
function mkSyntax11073(stx11123, value11124, type11125, inner11126) {
    if (stx11123 && Array.isArray(stx11123) && stx11123.length === 1) {
        stx11123 = stx11123[0];
    } else if (stx11123 && Array.isArray(stx11123)) {
        throwSyntaxError11088("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx11123 === undefined) {
        throwSyntaxError11088("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type11125 === parser11061.Token.Delimiter) {
        var startLineNumber11127, startLineStart11128, endLineNumber11129, endLineStart11130, startRange11131, endRange11132;
        if (!Array.isArray(inner11126)) {
            throwSyntaxError11088("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx11123 && stx11123.token.type === parser11061.Token.Delimiter) {
            startLineNumber11127 = stx11123.token.startLineNumber;
            startLineStart11128 = stx11123.token.startLineStart;
            endLineNumber11129 = stx11123.token.endLineNumber;
            endLineStart11130 = stx11123.token.endLineStart;
            startRange11131 = stx11123.token.startRange;
            endRange11132 = stx11123.token.endRange;
        } else if (stx11123 && stx11123.token) {
            startLineNumber11127 = stx11123.token.lineNumber;
            startLineStart11128 = stx11123.token.lineStart;
            endLineNumber11129 = stx11123.token.lineNumber;
            endLineStart11130 = stx11123.token.lineStart;
            startRange11131 = stx11123.token.range;
            endRange11132 = stx11123.token.range;
        }
        return syntaxFromToken11072({
            type: parser11061.Token.Delimiter,
            value: value11124,
            inner: inner11126,
            startLineStart: startLineStart11128,
            startLineNumber: startLineNumber11127,
            endLineStart: endLineStart11130,
            endLineNumber: endLineNumber11129,
            startRange: startRange11131,
            endRange: endRange11132
        }, stx11123);
    } else {
        var lineStart11133, lineNumber11134, range11135;
        if (stx11123 && stx11123.token.type === parser11061.Token.Delimiter) {
            lineStart11133 = stx11123.token.startLineStart;
            lineNumber11134 = stx11123.token.startLineNumber;
            range11135 = stx11123.token.startRange;
        } else if (stx11123 && stx11123.token) {
            lineStart11133 = stx11123.token.lineStart;
            lineNumber11134 = stx11123.token.lineNumber;
            range11135 = stx11123.token.range;
        }
        return syntaxFromToken11072({
            type: type11125,
            value: value11124,
            lineStart: lineStart11133,
            lineNumber: lineNumber11134,
            range: range11135
        }, stx11123);
    }
}
function makeValue11074(val11136, stx11137) {
    if (typeof val11136 === "boolean") {
        return mkSyntax11073(stx11137, val11136 ? "true" : "false", parser11061.Token.BooleanLiteral);
    } else if (typeof val11136 === "number") {
        if (val11136 !== val11136) {
            return makeDelim11079("()", [makeValue11074(0, stx11137), makePunc11078("/", stx11137), makeValue11074(0, stx11137)], stx11137);
        }
        if (val11136 < 0) {
            return makeDelim11079("()", [makePunc11078("-", stx11137), makeValue11074(Math.abs(val11136), stx11137)], stx11137);
        } else {
            return mkSyntax11073(stx11137, val11136, parser11061.Token.NumericLiteral);
        }
    } else if (typeof val11136 === "string") {
        return mkSyntax11073(stx11137, val11136, parser11061.Token.StringLiteral);
    } else if (val11136 === null) {
        return mkSyntax11073(stx11137, "null", parser11061.Token.NullLiteral);
    } else {
        throwSyntaxError11088("makeValue", "Cannot make value syntax object from: " + val11136);
    }
}
function makeRegex11075(val11138, flags11139, stx11140) {
    var newstx11141 = mkSyntax11073(stx11140, new RegExp(val11138, flags11139), parser11061.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx11141.token.literal = val11138;
    return newstx11141;
}
function makeIdent11076(val11142, stx11143) {
    return mkSyntax11073(stx11143, val11142, parser11061.Token.Identifier);
}
function makeKeyword11077(val11144, stx11145) {
    return mkSyntax11073(stx11145, val11144, parser11061.Token.Keyword);
}
function makePunc11078(val11146, stx11147) {
    return mkSyntax11073(stx11147, val11146, parser11061.Token.Punctuator);
}
function makeDelim11079(val11148, inner11149, stx11150) {
    return mkSyntax11073(stx11150, val11148, parser11061.Token.Delimiter, inner11149);
}
function unwrapSyntax11080(stx11151) {
    if (Array.isArray(stx11151) && stx11151.length === 1) {
        // pull stx out of single element arrays for convenience
        stx11151 = stx11151[0];
    }
    if (stx11151.token) {
        if (stx11151.token.type === parser11061.Token.Delimiter) {
            return stx11151.token;
        } else {
            return stx11151.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx11151);
    }
}
function syntaxToTokens11081(stx11152) {
    return _11060.map(stx11152, function (stx11153) {
        if (stx11153.token.inner) {
            stx11153.token.inner = syntaxToTokens11081(stx11153.token.inner);
        }
        return stx11153.token;
    });
}
function tokensToSyntax11082(tokens11154) {
    if (!_11060.isArray(tokens11154)) {
        tokens11154 = [tokens11154];
    }
    return _11060.map(tokens11154, function (token11155) {
        if (token11155.inner) {
            token11155.inner = tokensToSyntax11082(token11155.inner);
        }
        return syntaxFromToken11072(token11155);
    });
}
function joinSyntax11083(tojoin11156, punc11157) {
    if (tojoin11156.length === 0) {
        return [];
    }
    if (punc11157 === " ") {
        return tojoin11156;
    }
    return _11060.reduce(_11060.rest(tojoin11156, 1), function (acc11158, join11159) {
        acc11158.push(cloneSyntax11085(punc11157), join11159);
        return acc11158;
    }, [_11060.first(tojoin11156)]);
}
function joinSyntaxArray11084(tojoin11160, punc11161) {
    if (tojoin11160.length === 0) {
        return [];
    }
    if (punc11161 === " ") {
        return _11060.flatten(tojoin11160, true);
    }
    return _11060.reduce(_11060.rest(tojoin11160, 1), function (acc11162, join11163) {
        acc11162.push(cloneSyntax11085(punc11161));
        Array.prototype.push.apply(acc11162, join11163);
        return acc11162;
    }, _11060.first(tojoin11160));
}
function cloneSyntax11085(stx11164) {
    return syntaxFromToken11072(_11060.clone(stx11164.token), stx11164);
}
function cloneSyntaxArray11086(arr11165) {
    return arr11165.map(function (stx11166) {
        var o11167 = cloneSyntax11085(stx11166);
        if (o11167.token.type === parser11061.Token.Delimiter) {
            o11167.token.inner = cloneSyntaxArray11086(o11167.token.inner);
        }
        return o11167;
    });
}
function MacroSyntaxError11087(name11168, message11169, stx11170) {
    this.name = name11168;
    this.message = message11169;
    this.stx = stx11170;
}
function throwSyntaxError11088(name11171, message11172, stx11173) {
    if (stx11173 && Array.isArray(stx11173)) {
        stx11173 = stx11173[0];
    }
    throw new MacroSyntaxError11087(name11171, message11172, stx11173);
}
function SyntaxCaseError11089(message11174) {
    this.message = message11174;
}
function throwSyntaxCaseError11090(message11175) {
    throw new SyntaxCaseError11089(message11175);
}
function printSyntaxError11091(code11176, err11177) {
    if (!err11177.stx) {
        return "[" + err11177.name + "] " + err11177.message;
    }
    var token11178 = err11177.stx.token;
    var lineNumber11179 = _11060.find([token11178.sm_startLineNumber, token11178.sm_lineNumber, token11178.startLineNumber, token11178.lineNumber], _11060.isNumber);
    var lineStart11180 = _11060.find([token11178.sm_startLineStart, token11178.sm_lineStart, token11178.startLineStart, token11178.lineStart], _11060.isNumber);
    var start11181 = (token11178.sm_startRange || token11178.sm_range || token11178.startRange || token11178.range)[0];
    var offset11182 = start11181 - lineStart11180;
    var line11183 = "";
    var pre11184 = lineNumber11179 + ": ";
    var ch11185;
    while (ch11185 = code11176.charAt(lineStart11180++)) {
        if (ch11185 == "\r" || ch11185 == "\n") {
            break;
        }
        line11183 += ch11185;
    }
    return "[" + err11177.name + "] " + err11177.message + "\n" + pre11184 + line11183 + "\n" + Array(offset11182 + pre11184.length).join(" ") + " ^";
}
function prettyPrint11092(stxarr11186, shouldResolve11187) {
    var indent11188 = 0;
    var unparsedLines11189 = stxarr11186.reduce(function (acc11190, stx11191) {
        var s11192 = shouldResolve11187 ? expander11062.resolve(stx11191) : stx11191.token.value;
        if ( // skip the end of file token
        stx11191.token.type === parser11061.Token.EOF) {
            return acc11190;
        }
        if (stx11191.token.type === parser11061.Token.StringLiteral) {
            s11192 = "\"" + s11192 + "\"";
        }
        if (s11192 == "{") {
            acc11190[0].str += " " + s11192;
            indent11188++;
            acc11190.unshift({
                indent: indent11188,
                str: ""
            });
        } else if (s11192 == "}") {
            indent11188--;
            acc11190.unshift({
                indent: indent11188,
                str: s11192
            });
            acc11190.unshift({
                indent: indent11188,
                str: ""
            });
        } else if (s11192 == ";") {
            acc11190[0].str += s11192;
            acc11190.unshift({
                indent: indent11188,
                str: ""
            });
        } else {
            acc11190[0].str += (acc11190[0].str ? " " : "") + s11192;
        }
        return acc11190;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines11189.reduce(function (acc11193, line11194) {
        var ind11195 = "";
        while (ind11195.length < line11194.indent * 2) {
            ind11195 += " ";
        }
        return ind11195 + line11194.str + "\n" + acc11193;
    }, "");
}
function adjustLineContext11093(stx11196, original11197, current11198) {
    if ( // short circuit when the array is empty;
    stx11196.length === 0) {
        return stx11196;
    }
    current11198 = current11198 || {
        lastLineNumber: stx11196[0].token.lineNumber || stx11196[0].token.startLineNumber,
        lineNumber: original11197.token.lineNumber
    };
    return _11060.map(stx11196, function (stx11199) {
        if (stx11199.isDelimiter()) {
            // handle tokens with missing line info
            stx11199.token.startLineNumber = typeof stx11199.token.startLineNumber == "undefined" ? original11197.token.lineNumber : stx11199.token.startLineNumber;
            stx11199.token.endLineNumber = typeof stx11199.token.endLineNumber == "undefined" ? original11197.token.lineNumber : stx11199.token.endLineNumber;
            stx11199.token.startLineStart = typeof stx11199.token.startLineStart == "undefined" ? original11197.token.lineStart : stx11199.token.startLineStart;
            stx11199.token.endLineStart = typeof stx11199.token.endLineStart == "undefined" ? original11197.token.lineStart : stx11199.token.endLineStart;
            stx11199.token.startRange = typeof stx11199.token.startRange == "undefined" ? original11197.token.range : stx11199.token.startRange;
            stx11199.token.endRange = typeof stx11199.token.endRange == "undefined" ? original11197.token.range : stx11199.token.endRange;
            stx11199.token.sm_startLineNumber = typeof stx11199.token.sm_startLineNumber == "undefined" ? stx11199.token.startLineNumber : stx11199.token.sm_startLineNumber;
            stx11199.token.sm_endLineNumber = typeof stx11199.token.sm_endLineNumber == "undefined" ? stx11199.token.endLineNumber : stx11199.token.sm_endLineNumber;
            stx11199.token.sm_startLineStart = typeof stx11199.token.sm_startLineStart == "undefined" ? stx11199.token.startLineStart : stx11199.token.sm_startLineStart;
            stx11199.token.sm_endLineStart = typeof stx11199.token.sm_endLineStart == "undefined" ? stx11199.token.endLineStart : stx11199.token.sm_endLineStart;
            stx11199.token.sm_startRange = typeof stx11199.token.sm_startRange == "undefined" ? stx11199.token.startRange : stx11199.token.sm_startRange;
            stx11199.token.sm_endRange = typeof stx11199.token.sm_endRange == "undefined" ? stx11199.token.endRange : stx11199.token.sm_endRange;
            if (stx11199.token.startLineNumber !== current11198.lineNumber) {
                if (stx11199.token.startLineNumber !== current11198.lastLineNumber) {
                    current11198.lineNumber++;
                    current11198.lastLineNumber = stx11199.token.startLineNumber;
                    stx11199.token.startLineNumber = current11198.lineNumber;
                } else {
                    current11198.lastLineNumber = stx11199.token.startLineNumber;
                    stx11199.token.startLineNumber = current11198.lineNumber;
                }
            }
            return stx11199;
        }
        // handle tokens with missing line info
        stx11199.token.lineNumber = typeof stx11199.token.lineNumber == "undefined" ? original11197.token.lineNumber : stx11199.token.lineNumber;
        stx11199.token.lineStart = typeof stx11199.token.lineStart == "undefined" ? original11197.token.lineStart : stx11199.token.lineStart;
        stx11199.token.range = typeof stx11199.token.range == "undefined" ? original11197.token.range : stx11199.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx11199.token.sm_lineNumber = typeof stx11199.token.sm_lineNumber == "undefined" ? stx11199.token.lineNumber : stx11199.token.sm_lineNumber;
        stx11199.token.sm_lineStart = typeof stx11199.token.sm_lineStart == "undefined" ? stx11199.token.lineStart : stx11199.token.sm_lineStart;
        stx11199.token.sm_range = typeof stx11199.token.sm_range == "undefined" ? stx11199.token.range.slice() : stx11199.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx11199.token.lineNumber !== current11198.lineNumber) {
            if (stx11199.token.lineNumber !== current11198.lastLineNumber) {
                current11198.lineNumber++;
                current11198.lastLineNumber = stx11199.token.lineNumber;
                stx11199.token.lineNumber = current11198.lineNumber;
            } else {
                current11198.lastLineNumber = stx11199.token.lineNumber;
                stx11199.token.lineNumber = current11198.lineNumber;
            }
        }
        return stx11199;
    });
}
function makeMultiToken11094(stxl11200) {
    if (stxl11200 instanceof Syntax11071 && stxl11200.isDelimiter()) {
        return makeIdent11076(stxl11200.token.inner.map(unwrapSyntax11080).join(""), stxl11200.token.inner[0]);
    } else if (stxl11200 instanceof Syntax11071) {
        return stxl11200;
    } else {
        assert11065(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken11094;
exports.unwrapSyntax = unwrapSyntax11080;
exports.makeDelim = makeDelim11079;
exports.makePunc = makePunc11078;
exports.makeKeyword = makeKeyword11077;
exports.makeIdent = makeIdent11076;
exports.makeRegex = makeRegex11075;
exports.makeValue = makeValue11074;
exports.Scope = Scope;
exports.syntaxFromToken = syntaxFromToken11072;
exports.tokensToSyntax = tokensToSyntax11082;
exports.syntaxToTokens = syntaxToTokens11081;
exports.isSyntax = function (obj11201) {
    obj11201 = Array.isArray(obj11201) ? obj11201[0] : obj11201;
    return obj11201 instanceof Syntax11071;
};
exports.joinSyntax = joinSyntax11083;
exports.joinSyntaxArray = joinSyntaxArray11084;
exports.cloneSyntax = cloneSyntax11085;
exports.cloneSyntaxArray = cloneSyntaxArray11086;
exports.prettyPrint = prettyPrint11092;
exports.MacroSyntaxError = MacroSyntaxError11087;
exports.throwSyntaxError = throwSyntaxError11088;
exports.SyntaxCaseError = SyntaxCaseError11089;
exports.throwSyntaxCaseError = throwSyntaxCaseError11090;
exports.printSyntaxError = printSyntaxError11091;
exports.adjustLineContext = adjustLineContext11093;
exports.fresh = fresh11068;
exports.freshScope = freshScope11069;
/*global require: true, exports:true
*/
//# sourceMappingURL=syntax.js.map