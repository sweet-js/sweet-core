// import @ from "contracts.js"
/*global require: true, exports:true
*/
"use strict";
var _ = require("underscore"),
    parser = require("./parser"),
    expander = require("./expander"),
    assert = require("assert");
// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber = 1;
var nextFresh = 0;
function fresh() {
    return nextFresh++;
}
function Rename(id, name, ctx, defctx, phase) {
    defctx = defctx || null;
    this.id = id;
    this.name = name;
    this.context = ctx;
    this.def = defctx;
    this.instNum = globalContextInstanceNumber++;
    this.phase = phase;
}
function Mark(mark, ctx) {
    this.mark = mark;
    this.context = ctx;
    this.instNum = globalContextInstanceNumber++;
}
function Def(defctx, ctx) {
    this.defctx = defctx;
    this.context = ctx;
    this.instNum = globalContextInstanceNumber++;
}
function Imported(localName, exportName, phase, mod, ctx) {
    this.localName = localName;
    this.exportName = exportName;
    this.phase = phase;
    this.mod = mod;
    this.context = ctx;
    this.instNum = globalContextInstanceNumber++;
}
function Syntax(token, oldstx) {
    this.token = token;
    this.context = oldstx && oldstx.context ? oldstx.context : null;
    this.deferredContext = oldstx && oldstx.deferredContext ? oldstx.deferredContext : null;
    this.props = oldstx && oldstx.props ? oldstx.props : {};
}
Syntax.prototype = {
    // (Int) -> CSyntax
    // non mutating
    mark: function (newMark) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx) {
                return stx.mark(newMark);
            });
            return syntaxFromToken(this.token, {
                context: new Mark(newMark, this.context),
                props: this.props
            });
        }
        return syntaxFromToken(this.token, {
            context: new Mark(newMark, this.context),
            props: this.props
        });
    },
    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function (id, name, defctx, phase) {
        if ( // defer renaming of delimiters
        this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx) {
                return stx.rename(id, name, defctx, phase);
            });
            return syntaxFromToken(this.token, {
                context: new Rename(id, name, this.context, defctx, phase),
                props: this.props
            });
        }
        return syntaxFromToken(this.token, {
            context: new Rename(id, name, this.context, defctx, phase),
            props: this.props
        });
    },
    imported: function (localName, exportName, phase, mod) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx) {
                return stx.imported(localName, exportName, phase, mod);
            });
            return syntaxFromToken(this.token, {
                context: new Imported(localName, exportName, phase, mod, this.context),
                props: this.props
            });
        }
        return syntaxFromToken(this.token, {
            context: new Imported(localName, exportName, phase, mod, this.context),
            props: this.props
        });
    },
    addDefCtx: function (defctx) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function (stx) {
                return stx.addDefCtx(defctx);
            });
            return syntaxFromToken(this.token, {
                context: new Def(defctx, this.context),
                props: this.props
            });
        }
        return syntaxFromToken(this.token, {
            context: new Def(defctx, this.context),
            props: this.props
        });
    },
    getDefCtx: function () {
        var ctx = this.context;
        while (ctx !== null) {
            if (ctx instanceof Def) {
                return ctx.defctx;
            }
            ctx = ctx.context;
        }
        return null;
    },
    toString: function () {
        var val = this.token.type === parser.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val + "]";
    },
    clone: function () {
        var newTok = {};
        var keys = Object.keys(this.token);
        for (var i = 0, len = keys.length, key; i < len; i++) {
            key = keys[i];
            if (Array.isArray(this.token[key])) {
                if (key === "inner") {
                    // need to clone the children of a delimiter
                    newTok[key] = this.token[key].reduce(function (acc, stx) {
                        acc.push(stx.clone());
                        return acc;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok[key] = this.token[key].reduce(function (acc, el) {
                        acc.push(el);
                        return acc;
                    }, []);
                }
            } else {
                newTok[key] = this.token[key];
            }
        }
        return syntaxFromToken(newTok, this);
    },
    expose: function () {
        console.log("expose is deprecated no longer needed");
        return this;
    },
    isIdentifier: function () {
        return this.token && this.token.type === parser.Token.Identifier;
    },
    isStringLiteral: function () {
        return this.token && this.token.type === parser.Token.StringLiteral;
    },
    isNumericLiteral: function () {
        return this.token && this.token.type === parser.Token.NumericLiteral;
    },
    isBooleanLiteral: function () {
        return this.token && this.token.type === parser.Token.BooleanLiteral;
    },
    isNullLiteral: function () {
        return this.token && this.token.type === parser.Token.NullLiteral;
    },
    isKeyword: function () {
        return this.token && this.token.type === parser.Token.Keyword;
    },
    isPunctuator: function () {
        return this.token && this.token.type === parser.Token.Punctuator;
    },
    isRegularExpression: function () {
        return this.token && this.token.type === parser.Token.RegularExpression;
    },
    isTemplate: function () {
        return this.token && this.token.type === parser.Token.Template;
    },
    isDelimiter: function () {
        return this.token && this.token.type === parser.Token.Delimiter;
    },
    isEOF: function () {
        return this.token && this.token.type === parser.Token.EOF;
    }
};
function syntaxFromToken(token, oldstx) {
    return new Syntax(token, oldstx);
}
function mkSyntax(stx, value, type, inner) {
    if (stx && Array.isArray(stx) && stx.length === 1) {
        stx = stx[0];
    } else if (stx && Array.isArray(stx)) {
        throwSyntaxError("mkSyntax", "Expecting a syntax object or an array with a single syntax object");
    } else if (stx === undefined) {
        throwSyntaxError("mkSyntax", "You must provide an old syntax object context (or null) when creating a new syntax object.");
    }
    if (type === parser.Token.Delimiter) {
        var startLineNumber, startLineStart, endLineNumber, endLineStart, startRange, endRange;
        if (!Array.isArray(inner)) {
            throwSyntaxError("mkSyntax", "Must provide inner array of syntax objects when creating a delimiter");
        }
        if (stx && stx.token.type === parser.Token.Delimiter) {
            startLineNumber = stx.token.startLineNumber;
            startLineStart = stx.token.startLineStart;
            endLineNumber = stx.token.endLineNumber;
            endLineStart = stx.token.endLineStart;
            startRange = stx.token.startRange;
            endRange = stx.token.endRange;
        } else if (stx && stx.token) {
            startLineNumber = stx.token.lineNumber;
            startLineStart = stx.token.lineStart;
            endLineNumber = stx.token.lineNumber;
            endLineStart = stx.token.lineStart;
            startRange = stx.token.range;
            endRange = stx.token.range;
        }
        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: value,
            inner: inner,
            startLineStart: startLineStart,
            startLineNumber: startLineNumber,
            endLineStart: endLineStart,
            endLineNumber: endLineNumber,
            startRange: startRange,
            endRange: endRange
        }, stx);
    } else {
        var lineStart, lineNumber, range;
        if (stx && stx.token.type === parser.Token.Delimiter) {
            lineStart = stx.token.startLineStart;
            lineNumber = stx.token.startLineNumber;
            range = stx.token.startRange;
        } else if (stx && stx.token) {
            lineStart = stx.token.lineStart;
            lineNumber = stx.token.lineNumber;
            range = stx.token.range;
        }
        return syntaxFromToken({
            type: type,
            value: value,
            lineStart: lineStart,
            lineNumber: lineNumber,
            range: range
        }, stx);
    }
}
function makeValue(val, stx) {
    if (typeof val === "boolean") {
        return mkSyntax(stx, val ? "true" : "false", parser.Token.BooleanLiteral);
    } else if (typeof val === "number") {
        if (val !== val) {
            return makeDelim("()", [makeValue(0, stx), makePunc("/", stx), makeValue(0, stx)], stx);
        }
        if (val < 0) {
            return makeDelim("()", [makePunc("-", stx), makeValue(Math.abs(val), stx)], stx);
        } else {
            return mkSyntax(stx, val, parser.Token.NumericLiteral);
        }
    } else if (typeof val === "string") {
        return mkSyntax(stx, val, parser.Token.StringLiteral);
    } else if (val === null) {
        return mkSyntax(stx, "null", parser.Token.NullLiteral);
    } else {
        throwSyntaxError("makeValue", "Cannot make value syntax object from: " + val);
    }
}
function makeRegex(val, flags, stx) {
    var newstx = mkSyntax(stx, new RegExp(val, flags), parser.Token.RegularExpression);
    // regex tokens need the extra field literal on token
    newstx.token.literal = val;
    return newstx;
}
function makeIdent(val, stx) {
    return mkSyntax(stx, val, parser.Token.Identifier);
}
function makeKeyword(val, stx) {
    return mkSyntax(stx, val, parser.Token.Keyword);
}
function makePunc(val, stx) {
    return mkSyntax(stx, val, parser.Token.Punctuator);
}
function makeDelim(val, inner, stx) {
    return mkSyntax(stx, val, parser.Token.Delimiter, inner);
}
function unwrapSyntax(stx) {
    if (Array.isArray(stx) && stx.length === 1) {
        // pull stx out of single element arrays for convenience
        stx = stx[0];
    }
    if (stx.token) {
        if (stx.token.type === parser.Token.Delimiter) {
            return stx.token;
        } else {
            return stx.token.value;
        }
    } else {
        throw new Error("Not a syntax object: " + stx);
    }
}
function syntaxToTokens(stx) {
    return _.map(stx, function (stx$2) {
        if (stx$2.token.inner) {
            stx$2.token.inner = syntaxToTokens(stx$2.token.inner);
        }
        return stx$2.token;
    });
}
function tokensToSyntax(tokens) {
    if (!_.isArray(tokens)) {
        tokens = [tokens];
    }
    return _.map(tokens, function (token) {
        if (token.inner) {
            token.inner = tokensToSyntax(token.inner);
        }
        return syntaxFromToken(token);
    });
}
function joinSyntax(tojoin, punc) {
    if (tojoin.length === 0) {
        return [];
    }
    if (punc === " ") {
        return tojoin;
    }
    return _.reduce(_.rest(tojoin, 1), function (acc, join) {
        acc.push(cloneSyntax(punc), join);
        return acc;
    }, [_.first(tojoin)]);
}
function joinSyntaxArray(tojoin, punc) {
    if (tojoin.length === 0) {
        return [];
    }
    if (punc === " ") {
        return _.flatten(tojoin, true);
    }
    return _.reduce(_.rest(tojoin, 1), function (acc, join) {
        acc.push(cloneSyntax(punc));
        Array.prototype.push.apply(acc, join);
        return acc;
    }, _.first(tojoin));
}
function cloneSyntax(stx) {
    return syntaxFromToken(_.clone(stx.token), stx);
}
function cloneSyntaxArray(arr) {
    return arr.map(function (stx) {
        var o = cloneSyntax(stx);
        if (o.token.type === parser.Token.Delimiter) {
            o.token.inner = cloneSyntaxArray(o.token.inner);
        }
        return o;
    });
}
function MacroSyntaxError(name, message, stx) {
    this.name = name;
    this.message = message;
    this.stx = stx;
}
function throwSyntaxError(name, message, stx) {
    if (stx && Array.isArray(stx)) {
        stx = stx[0];
    }
    throw new MacroSyntaxError(name, message, stx);
}
function SyntaxCaseError(message) {
    this.message = message;
}
function throwSyntaxCaseError(message) {
    throw new SyntaxCaseError(message);
}
function printSyntaxError(code, err) {
    if (!err.stx) {
        return "[" + err.name + "] " + err.message;
    }
    var token = err.stx.token;
    var lineNumber = _.find([token.sm_startLineNumber, token.sm_lineNumber, token.startLineNumber, token.lineNumber], _.isNumber);
    var lineStart = _.find([token.sm_startLineStart, token.sm_lineStart, token.startLineStart, token.lineStart], _.isNumber);
    var start = (token.sm_startRange || token.sm_range || token.startRange || token.range)[0];
    var offset = start - lineStart;
    var line = "";
    var pre = lineNumber + ": ";
    var ch;
    while (ch = code.charAt(lineStart++)) {
        if (ch == "\r" || ch == "\n") {
            break;
        }
        line += ch;
    }
    return "[" + err.name + "] " + err.message + "\n" + pre + line + "\n" + Array(offset + pre.length).join(" ") + " ^";
}
function prettyPrint(stxarr, shouldResolve) {
    var indent = 0;
    var unparsedLines = stxarr.reduce(function (acc, stx) {
        var s = shouldResolve ? expander.resolve(stx) : stx.token.value;
        if ( // skip the end of file token
        stx.token.type === parser.Token.EOF) {
            return acc;
        }
        if (stx.token.type === parser.Token.StringLiteral) {
            s = "\"" + s + "\"";
        }
        if (s == "{") {
            acc[0].str += " " + s;
            indent++;
            acc.unshift({
                indent: indent,
                str: ""
            });
        } else if (s == "}") {
            indent--;
            acc.unshift({
                indent: indent,
                str: s
            });
            acc.unshift({
                indent: indent,
                str: ""
            });
        } else if (s == ";") {
            acc[0].str += s;
            acc.unshift({
                indent: indent,
                str: ""
            });
        } else {
            acc[0].str += (acc[0].str ? " " : "") + s;
        }
        return acc;
    }, [{
        indent: 0,
        str: ""
    }]);
    return unparsedLines.reduce(function (acc, line) {
        var ind = "";
        while (ind.length < line.indent * 2) {
            ind += " ";
        }
        return ind + line.str + "\n" + acc;
    }, "");
}
function adjustLineContext(stx, original, current) {
    if ( // short circuit when the array is empty;
    stx.length === 0) {
        return stx;
    }
    current = current || {
        lastLineNumber: stx[0].token.lineNumber || stx[0].token.startLineNumber,
        lineNumber: original.token.lineNumber
    };
    return _.map(stx, function (stx$2) {
        if (stx$2.isDelimiter()) {
            // handle tokens with missing line info
            stx$2.token.startLineNumber = typeof stx$2.token.startLineNumber == "undefined" ? original.token.lineNumber : stx$2.token.startLineNumber;
            stx$2.token.endLineNumber = typeof stx$2.token.endLineNumber == "undefined" ? original.token.lineNumber : stx$2.token.endLineNumber;
            stx$2.token.startLineStart = typeof stx$2.token.startLineStart == "undefined" ? original.token.lineStart : stx$2.token.startLineStart;
            stx$2.token.endLineStart = typeof stx$2.token.endLineStart == "undefined" ? original.token.lineStart : stx$2.token.endLineStart;
            stx$2.token.startRange = typeof stx$2.token.startRange == "undefined" ? original.token.range : stx$2.token.startRange;
            stx$2.token.endRange = typeof stx$2.token.endRange == "undefined" ? original.token.range : stx$2.token.endRange;
            stx$2.token.sm_startLineNumber = typeof stx$2.token.sm_startLineNumber == "undefined" ? stx$2.token.startLineNumber : stx$2.token.sm_startLineNumber;
            stx$2.token.sm_endLineNumber = typeof stx$2.token.sm_endLineNumber == "undefined" ? stx$2.token.endLineNumber : stx$2.token.sm_endLineNumber;
            stx$2.token.sm_startLineStart = typeof stx$2.token.sm_startLineStart == "undefined" ? stx$2.token.startLineStart : stx$2.token.sm_startLineStart;
            stx$2.token.sm_endLineStart = typeof stx$2.token.sm_endLineStart == "undefined" ? stx$2.token.endLineStart : stx$2.token.sm_endLineStart;
            stx$2.token.sm_startRange = typeof stx$2.token.sm_startRange == "undefined" ? stx$2.token.startRange : stx$2.token.sm_startRange;
            stx$2.token.sm_endRange = typeof stx$2.token.sm_endRange == "undefined" ? stx$2.token.endRange : stx$2.token.sm_endRange;
            if (stx$2.token.startLineNumber !== current.lineNumber) {
                if (stx$2.token.startLineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx$2.token.startLineNumber;
                    stx$2.token.startLineNumber = current.lineNumber;
                } else {
                    current.lastLineNumber = stx$2.token.startLineNumber;
                    stx$2.token.startLineNumber = current.lineNumber;
                }
            }
            return stx$2;
        }
        // handle tokens with missing line info
        stx$2.token.lineNumber = typeof stx$2.token.lineNumber == "undefined" ? original.token.lineNumber : stx$2.token.lineNumber;
        stx$2.token.lineStart = typeof stx$2.token.lineStart == "undefined" ? original.token.lineStart : stx$2.token.lineStart;
        stx$2.token.range = typeof stx$2.token.range == "undefined" ? original.token.range : stx$2.token.range;
        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx$2.token.sm_lineNumber = typeof stx$2.token.sm_lineNumber == "undefined" ? stx$2.token.lineNumber : stx$2.token.sm_lineNumber;
        stx$2.token.sm_lineStart = typeof stx$2.token.sm_lineStart == "undefined" ? stx$2.token.lineStart : stx$2.token.sm_lineStart;
        stx$2.token.sm_range = typeof stx$2.token.sm_range == "undefined" ? stx$2.token.range.slice() : stx$2.token.sm_range;
        if ( // move the line info to line up with the macro name
        // (line info starting from the macro name)
        stx$2.token.lineNumber !== current.lineNumber) {
            if (stx$2.token.lineNumber !== current.lastLineNumber) {
                current.lineNumber++;
                current.lastLineNumber = stx$2.token.lineNumber;
                stx$2.token.lineNumber = current.lineNumber;
            } else {
                current.lastLineNumber = stx$2.token.lineNumber;
                stx$2.token.lineNumber = current.lineNumber;
            }
        }
        return stx$2;
    });
}
function makeMultiToken(stxl) {
    if (stxl instanceof Syntax && stxl.isDelimiter()) {
        return makeIdent(stxl.token.inner.map(unwrapSyntax).join(""), stxl.token.inner[0]);
    } else if (stxl instanceof Syntax) {
        return stxl;
    } else {
        assert(false, "argument must be a syntax object");
    }
}
exports.makeMultiToken = makeMultiToken;
exports.unwrapSyntax = unwrapSyntax;
exports.makeDelim = makeDelim;
exports.makePunc = makePunc;
exports.makeKeyword = makeKeyword;
exports.makeIdent = makeIdent;
exports.makeRegex = makeRegex;
exports.makeValue = makeValue;
exports.Rename = Rename;
exports.Mark = Mark;
exports.Def = Def;
exports.Imported = Imported;
exports.syntaxFromToken = syntaxFromToken;
exports.tokensToSyntax = tokensToSyntax;
exports.syntaxToTokens = syntaxToTokens;
exports.isSyntax = function (obj) {
    obj = Array.isArray(obj) ? obj[0] : obj;
    return obj instanceof Syntax;
};
exports.joinSyntax = joinSyntax;
exports.joinSyntaxArray = joinSyntaxArray;
exports.cloneSyntax = cloneSyntax;
exports.cloneSyntaxArray = cloneSyntaxArray;
exports.prettyPrint = prettyPrint;
exports.MacroSyntaxError = MacroSyntaxError;
exports.throwSyntaxError = throwSyntaxError;
exports.SyntaxCaseError = SyntaxCaseError;
exports.throwSyntaxCaseError = throwSyntaxCaseError;
exports.printSyntaxError = printSyntaxError;
exports.adjustLineContext = adjustLineContext;
exports.fresh = fresh;
//# sourceMappingURL=syntax.js.map