#lang "js";
// import @ from "contracts.js"

/*global require: true, exports:true
*/

"use strict";
var _ = require("underscore"),
    parser = require("./parser"),
    expander = require("./expander"),
    Immutable = require("immutable"),
    assert = require("assert");


// Keep an incrementing global counter so that a particular
// each new context object is assigned a unique "instance number"
// that it can be identified by. This helps with the memoization
// of the recursive resolveCtx implementation in expander.js.
// The memoization addresses issue #232.
var globalContextInstanceNumber = 1;


var nextFresh = 0;

// @ () -> Num
function fresh() { return nextFresh++; }

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


// (CSyntax, Str) -> CContext
function Rename(id, name, ctx, defctx, phase) {
    defctx = defctx || null;

    this.id = id;
    this.name = name;
    this.context = ctx;
    this.def = defctx;
    this.instNum = globalContextInstanceNumber++;
    this.phase = phase;
}

// (Num) -> CContext
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

class Scope {
    constructor(oldScope) {
        this.bindings = oldScope ? oldScope.bindings : Immutable.Map();
    }

    addBinding(stx, name) {
        let oldBinding = this.bindings.get(stx.token.value);
        oldBinding = oldBinding ? oldBinding : Immutable.List();

        this.bindings = this.bindings.set(stx.token.value,  oldBinding.unshift({
            scopeSet: stx.context,
            binding: name
        }));
    }
}

function Syntax(token, oldstx) {
    this.token = token;
    this.context = (oldstx && oldstx.context) ? oldstx.context : Immutable.List();
    this.props = (oldstx && oldstx.props) ? oldstx.props : {};
}

Syntax.prototype = {
    addScope: function(scope) {
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(stx => stx.addScope(scope));
        }
        return syntaxFromToken(this.token, {context: this.context.unshift(scope),
                                            props: this.props});
    },
    // (Int) -> CSyntax
    // non mutating
    mark: function(newMark) {
        return this;
        // if (this.token.inner) {
        //     this.token.inner = this.token.inner.map(function(stx) {
        //         return stx.mark(newMark);
        //     });
        //     return syntaxFromToken(this.token, {context: new Mark(newMark, this.context),
        //                                         props: this.props});
        // }
        // return syntaxFromToken(this.token, {context: new Mark(newMark, this.context),
        //                                     props: this.props});
    },

    scope: function(newMark) {
        return this;
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function(stx) {
                return stx.mark(newMark);
            });
            return syntaxFromToken(this.token, {context: new Mark(newMark, this.context),
                                                props: this.props});
        }
        return syntaxFromToken(this.token, {context: new Mark(newMark, this.context),
                                            props: this.props});
    },

    // (CSyntax or [...CSyntax], Str) -> CSyntax
    // non mutating
    rename: function(id, name, defctx, phase) {
        // defer renaming of delimiters
        var newctx = this.context == null ? [name] : this.context.concat(name);
        if (this.token.inner) {
            this.token.inner = this.token.inner.map(function(stx) {
                return stx.rename(id, name, defctx, phase);
            });
            return syntaxFromToken(this.token,
                                   {context: newctx,
                                    props: this.props});
        }

        return syntaxFromToken(this.token,
                               {context: newctx,
                                props: this.props});
    },

    imported: function(localName, exportName, phase, mod) {
        return this;
        // if (this.token.inner) {
        //     this.token.inner = this.token.inner.map(function(stx) {
        //         return stx.imported(localName, exportName, phase, mod);
        //     });
        //     return syntaxFromToken(this.token,
        //                            {context: new Imported(localName,
        //                                                   exportName,
        //                                                   phase,
        //                                                   mod,
        //                                                   this.context),
        //                             props: this.props});
        //
        // }
        // return syntaxFromToken(this.token, {context: new Imported(localName,
        //                                                           exportName,
        //                                                           phase,
        //                                                           mod,
        //                                                           this.context),
        //                                     props: this.props});
    },

    addDefCtx: function(defctx) {
        return this;
        // if (this.token.inner) {
        //     this.token.inner = this.token.inner.map(function(stx) {
        //         return stx.addDefCtx(defctx);
        //     });
        //     return syntaxFromToken(this.token,
        //                            {context: new Def(defctx, this.context),
        //                             props: this.props});
        // }
        // return syntaxFromToken(this.token, {context: new Def(defctx, this.context),
        //                                     props: this.props});
    },

    getDefCtx: function() {
        var ctx = this.context;
        while(ctx !== null) {
            if (ctx instanceof Def) {
                return ctx.defctx;
            }
            ctx = ctx.context;
        }
        return null;
    },

    toString: function() {
        var val = this.token.type === parser.Token.EOF ? "EOF" : this.token.value;
        return "[Syntax: " + val + "]";
    },

    clone: function() {
        var newTok = {};
        var keys = Object.keys(this.token);

        for(var i = 0, len = keys.length, key; i < len; i++) {
            key = keys[i];
            if (Array.isArray(this.token[key])) {
                if (key === "inner") {
                    // need to clone the children of a delimiter
                    newTok[key] = this.token[key].reduce(function(acc, stx) {
                        acc.push(stx.clone());
                        return acc;
                    }, []);
                } else {
                    // don't need to deep copy normal arrays
                    newTok[key] = this.token[key].reduce(function(acc, el) {
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

    expose: function() {
        console.log("expose is deprecated no longer needed");
        return this;
    },

    isIdentifier: function() {
        return this.token && this.token.type === parser.Token.Identifier;
    },
    isStringLiteral: function() {
        return this.token && this.token.type === parser.Token.StringLiteral;
    },
    isNumericLiteral: function() {
        return this.token && this.token.type === parser.Token.NumericLiteral;
    },
    isBooleanLiteral: function() {
        return this.token && this.token.type === parser.Token.BooleanLiteral;
    },
    isNullLiteral: function() {
        return this.token && this.token.type === parser.Token.NullLiteral;
    },
    isKeyword: function() {
        return this.token && this.token.type === parser.Token.Keyword;
    },
    isPunctuator: function() {
        return this.token && this.token.type === parser.Token.Punctuator;
    },
    isRegularExpression: function() {
        return this.token && this.token.type === parser.Token.RegularExpression;
    },
    isTemplate: function() {
        return this.token && this.token.type === parser.Token.Template;
    },
    isDelimiter: function() {
        return this.token && this.token.type === parser.Token.Delimiter;
    },
    isEOF: function() {
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

        if(stx && stx.token.type === parser.Token.Delimiter) {
            startLineNumber = stx.token.startLineNumber;
            startLineStart = stx.token.startLineStart
            endLineNumber = stx.token.endLineNumber;
            endLineStart = stx.token.endLineStart;
            startRange = stx.token.startRange;
            endRange = stx.token.endRange;
        } else if (stx && stx.token){
            startLineNumber = stx.token.lineNumber;
            startLineStart = stx.token.lineStart;
            endLineNumber = stx.token.lineNumber;
            endLineStart = stx.token.lineStart;
            startRange = stx.token.range;
            endRange = stx.token.range
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
        } else if(stx && stx.token) {
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
    if(typeof val === 'boolean') {
        return mkSyntax(stx, val ? "true" : "false", parser.Token.BooleanLiteral);
    } else if (typeof val === 'number') {
        if (val !== val) {
            return makeDelim('()', [makeValue(0, stx), makePunc('/', stx), makeValue(0, stx)], stx);
        } if (val < 0) {
            return makeDelim('()', [makePunc('-', stx), makeValue(Math.abs(val), stx)], stx);
        } else {
            return mkSyntax(stx, val, parser.Token.NumericLiteral);
        }
    } else if (typeof val === 'string') {
        return mkSyntax(stx, val, parser.Token.StringLiteral);
    } else if (val === null) {
        return mkSyntax(stx, 'null', parser.Token.NullLiteral);
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
        if(stx.token.type === parser.Token.Delimiter) {
            return stx.token;
        } else {
            return stx.token.value;
        }
    } else {
        throw new Error ("Not a syntax object: " + stx);
    }
}


// ([...CSyntax]) -> [...CToken]
function syntaxToTokens(stx) {
    return _.map(stx, function(stx) {
        if (stx.token.inner) {
            stx.token.inner = syntaxToTokens(stx.token.inner);
        }
        return stx.token;
    });
}

// (CToken or [...CToken]) -> [...CSyntax]
function tokensToSyntax(tokens) {
    if (!_.isArray(tokens)) {
        tokens = [tokens];
    }
    return _.map(tokens, function(token) {
        if (token.inner) {
            token.inner = tokensToSyntax(token.inner);
        }
        return syntaxFromToken(token);
    });
}


// ([...CSyntax], Syntax) -> [...CSyntax])
function joinSyntax(tojoin, punc) {
    if (tojoin.length === 0) { return []; }
    if (punc === " ") { return tojoin; }

    return _.reduce(_.rest(tojoin, 1), function (acc, join) {
        acc.push(cloneSyntax(punc), join);
        return acc;
    }, [_.first(tojoin)]);
}


// ([...[...CSyntax]], Syntax) -> [...CSyntax]
function joinSyntaxArray(tojoin, punc) {
    if (tojoin.length === 0) { return []; }
    if (punc === " ") {
        return _.flatten(tojoin, true);
    }

    return _.reduce(_.rest(tojoin, 1), function (acc, join){
        acc.push(cloneSyntax(punc));
        Array.prototype.push.apply(acc, join);
        return acc;
    }, _.first(tojoin));
}

function cloneSyntax(stx) {
    return syntaxFromToken(_.clone(stx.token), stx);
}

function cloneSyntaxArray(arr) {
    return arr.map(function(stx) {
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
        return '[' + err.name + '] ' + err.message;
    }

    var token = err.stx.token;
    var lineNumber = _.find([token.sm_startLineNumber, token.sm_lineNumber, token.startLineNumber, token.lineNumber], _.isNumber);
    var lineStart = _.find([token.sm_startLineStart, token.sm_lineStart, token.startLineStart, token.lineStart], _.isNumber);
    var start = (token.sm_startRange || token.sm_range || token.startRange || token.range)[0];
    var offset = start - lineStart;
    var line = '';
    var pre = lineNumber + ': ';
    var ch;

    while ((ch = code.charAt(lineStart++))) {
        if (ch == '\r' || ch == '\n') {
            break;
        }
        line += ch;
    }

    return '[' + err.name + '] ' + err.message + '\n' +
           pre + line + '\n' +
           (Array(offset + pre.length).join(' ')) + ' ^';
}

// fun ([...CSyntax]) -> String
function prettyPrint(stxarr, shouldResolve) {
    var indent = 0;
    var unparsedLines = stxarr.reduce(function(acc, stx) {
        var s = shouldResolve ? expander.resolve(stx) : stx.token.value;
        // skip the end of file token
        if (stx.token.type === parser.Token.EOF) { return acc; }

        if(stx.token.type === parser.Token.StringLiteral) {
            s = '"' + s + '"';
        }

        if(s == '{') {
            acc[0].str += ' ' + s;
            indent++;
            acc.unshift({ indent: indent, str: '' });
        }
        else if(s == '}') {
            indent--;
            acc.unshift({ indent: indent, str: s });
            acc.unshift({ indent: indent, str: '' });
        }
        else if(s == ';') {
            acc[0].str += s;
            acc.unshift({ indent: indent, str: '' });
        }
        else {
            acc[0].str += (acc[0].str ? ' ' : '') + s;
        }

        return acc;
    }, [{ indent: 0, str: '' }]);

    return unparsedLines.reduce(function(acc, line) {
        var ind = '';
        while(ind.length < line.indent * 2) {
            ind += ' ';
        }
        return ind + line.str + '\n' + acc;
    }, '');
}

function adjustLineContext(stx, original, current) {
    // short circuit when the array is empty;
    if (stx.length === 0) {
        return stx;
    }

    current = current || {
        lastLineNumber: stx[0].token.lineNumber || stx[0].token.startLineNumber,
        lineNumber: original.token.lineNumber
    };

    return _.map(stx, function(stx) {
        if (stx.isDelimiter()) {
            // handle tokens with missing line info
            stx.token.startLineNumber = typeof stx.token.startLineNumber == 'undefined'
                                            ? original.token.lineNumber
                                            : stx.token.startLineNumber
            stx.token.endLineNumber = typeof stx.token.endLineNumber == 'undefined'
                                            ? original.token.lineNumber
                                            : stx.token.endLineNumber
            stx.token.startLineStart = typeof stx.token.startLineStart == 'undefined'
                                            ? original.token.lineStart
                                            : stx.token.startLineStart
            stx.token.endLineStart = typeof stx.token.endLineStart == 'undefined'
                                            ? original.token.lineStart
                                            : stx.token.endLineStart
            stx.token.startRange = typeof stx.token.startRange == 'undefined'
                                            ? original.token.range
                                            : stx.token.startRange
            stx.token.endRange = typeof stx.token.endRange == 'undefined'
                                            ? original.token.range
                                            : stx.token.endRange

            stx.token.sm_startLineNumber = typeof stx.token.sm_startLineNumber == 'undefined'
                                            ? stx.token.startLineNumber
                                            : stx.token.sm_startLineNumber;
            stx.token.sm_endLineNumber = typeof stx.token.sm_endLineNumber == 'undefined'
                                            ? stx.token.endLineNumber
                                            : stx.token.sm_endLineNumber;
            stx.token.sm_startLineStart = typeof stx.token.sm_startLineStart == 'undefined'
                                            ?  stx.token.startLineStart
                                            : stx.token.sm_startLineStart;
            stx.token.sm_endLineStart = typeof stx.token.sm_endLineStart == 'undefined'
                                            ? stx.token.endLineStart
                                            : stx.token.sm_endLineStart;
            stx.token.sm_startRange = typeof stx.token.sm_startRange == 'undefined'
                                            ? stx.token.startRange
                                            : stx.token.sm_startRange;
            stx.token.sm_endRange = typeof stx.token.sm_endRange == 'undefined'
                                            ? stx.token.endRange
                                            : stx.token.sm_endRange;

            if (stx.token.startLineNumber !== current.lineNumber) {
                if (stx.token.startLineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx.token.startLineNumber;
                    stx.token.startLineNumber = current.lineNumber;
                } else {
                    current.lastLineNumber = stx.token.startLineNumber;
                    stx.token.startLineNumber = current.lineNumber;
                }

            }

            return stx;
        }
        // handle tokens with missing line info
        stx.token.lineNumber = typeof stx.token.lineNumber == 'undefined'
                                ? original.token.lineNumber
                                : stx.token.lineNumber;
        stx.token.lineStart = typeof stx.token.lineStart == 'undefined'
                                ? original.token.lineStart
                                : stx.token.lineStart;
        stx.token.range = typeof stx.token.range == 'undefined'
                                ? original.token.range
                                : stx.token.range;

        // Only set the sourcemap line info once. Necessary because a single
        // syntax object can go through expansion multiple times. If at some point
        // we want to write an expansion stepper this might be a good place to store
        // intermediate expansion line info (ie push to a stack instead of
        // just write once).
        stx.token.sm_lineNumber = typeof stx.token.sm_lineNumber == 'undefined'
                                    ? stx.token.lineNumber
                                    : stx.token.sm_lineNumber;
        stx.token.sm_lineStart = typeof stx.token.sm_lineStart == 'undefined'
                                    ? stx.token.lineStart
                                    : stx.token.sm_lineStart;
        stx.token.sm_range = typeof stx.token.sm_range == 'undefined'
                                ? stx.token.range.slice()
                                : stx.token.sm_range;

        // move the line info to line up with the macro name
        // (line info starting from the macro name)
        if (stx.token.lineNumber !== current.lineNumber) {
            if (stx.token.lineNumber !== current.lastLineNumber) {
                current.lineNumber++;
                current.lastLineNumber = stx.token.lineNumber;
                stx.token.lineNumber = current.lineNumber;
            } else {
                current.lastLineNumber = stx.token.lineNumber;
                stx.token.lineNumber = current.lineNumber;
            }
        }

        return stx;
    });
}

function makeMultiToken(stxl) {
    if (stxl instanceof Syntax && stxl.isDelimiter()) {
        return makeIdent(stxl.token.inner.map(unwrapSyntax).join(""),
                         stxl.token.inner[0]);
    } else if (stxl instanceof Syntax){
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
exports.Scope = Scope;

exports.syntaxFromToken = syntaxFromToken;
exports.tokensToSyntax = tokensToSyntax;
exports.syntaxToTokens = syntaxToTokens;
exports.isSyntax = function(obj) {
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
