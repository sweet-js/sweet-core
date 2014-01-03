(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require("es6-collections"),  require("./parser"), require("./expander"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'es6-collections', 'parser', 'expander'], factory);
    }
}(this, function(exports, _, es6, parser, expander) {

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    // (CSyntax, Str) -> CContext
    function Rename(id, name, ctx, defctx) {
        defctx = defctx || null;

        this.id = id;
        this.name = name;
        this.context = ctx;
        this.def = defctx;
    }
    
    // (Num) -> CContext
    function Mark(mark, ctx) {
        this.mark = mark;
        this.context = ctx;
    }

    function Def(defctx, ctx) {
        this.defctx = defctx;
        this.context = ctx;
    }
    
    function Syntax(token, oldstx) {
        this.token = token;
        this.context = (oldstx && oldstx.context) ? oldstx.context : null;
        this.deferredContext = (oldstx && oldstx.deferredContext) ? oldstx.deferredContext : null;
    }

    Syntax.prototype = {
        // (Int) -> CSyntax
        // non mutating
        mark: function(newMark) {
            if (this.token.inner) {
                var next = syntaxFromToken(this.token, this);
                next.deferredContext = new Mark(newMark, this.deferredContext);
                return next;
            }
            return syntaxFromToken(this.token, {context: new Mark(newMark, this.context)});
        },

        // (CSyntax or [...CSyntax], Str) -> CSyntax
        // non mutating
        rename: function(id, name, defctx) {
            // deferr renaming of delimiters
            if (this.token.inner) {
                var next = syntaxFromToken(this.token, this);
                next.deferredContext = new Rename(id, name, this.deferredContext, defctx);
                return next;
            }

            if (this.token.type === parser.Token.Identifier ||
                this.token.type === parser.Token.Keyword ||
                this.token.type === parser.Token.Punctuator) {
                return syntaxFromToken(this.token, {context: new Rename(id, name, this.context, defctx)});
            } else {
                return this;
            }
        },

        addDefCtx: function(defctx) {
            if (this.token.inner) {
                var next = syntaxFromToken(this.token, this);
                next.deferredContext = new Def(defctx, this.deferredContext);
                return next;
            }
            return syntaxFromToken(this.token, {context: new Def(defctx, this.context)});
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

        expose: function() {
            assert(this.token.type === parser.Token.Delimiter,
                          "Only delimiters can be exposed");

            function applyContext(stxCtx, ctx) {
                if (ctx == null) {
                    return stxCtx;
                } else if (ctx instanceof Rename) {
                    return new Rename(ctx.id,
                                  ctx.name,
                                  applyContext(stxCtx, ctx.context),
                                  ctx.def);
                } else if (ctx instanceof Mark) {
                    return new Mark(ctx.mark, applyContext(stxCtx, ctx.context));
                } else if (ctx instanceof Def) {
                    return new Def(ctx.defctx, applyContext(stxCtx, ctx.context));
                } else {
                    assert(false, "unknown context type");
                }
            }

            this.token.inner = _.map(this.token.inner, _.bind(function(stx) {
                if (stx.token.inner) {
                    var next = syntaxFromToken(stx.token, stx);
                    next.deferredContext = applyContext(stx.deferredContext, this.deferredContext);
                    return next;
                } else {
                    return syntaxFromToken(stx.token,
                                           {context: applyContext(stx.context, this.deferredContext)});
                }
            }, this));
            this.deferredContext = null;
            return this;
        },

        toString: function() {
            var val = this.token.type === parser.Token.EOF ? "EOF" : this.token.value;
            return "[Syntax: " + val + "]";
        }
    };

    // (CToken, CSyntax?) -> CSyntax
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
        var newstx = mkSyntax(stx, new RegExp(val, flags), parser.Token.RegexLiteral);
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


    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if (tojoin.length === 0) { return []; }
        if (punc === " ") { return tojoin; }

        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            acc.push(makePunc(punc, join), join);
            return acc;
        }, [_.first(tojoin)]);
    }


    // ([...[...CSyntax]], Str) -> [...CSyntax]
    function joinSyntaxArr(tojoin, punc) {
        if (tojoin.length === 0) { return []; }
        if (punc === " ") {
            return _.flatten(tojoin, true);
        }

        return _.reduce(_.rest(tojoin, 1), function (acc, join){
            acc.push(makePunc(punc, _.first(join)));
            Array.prototype.push.apply(acc, join);
            return acc;
        }, _.first(tojoin));
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

    function printSyntaxError(code, err) {
        if (!err.stx) {
            return '[' + err.name + '] ' + err.message;
        }

        var token = err.stx.token;
        var lineNumber = token.sm_startLineNumber || token.sm_lineNumber || token.startLineNumber || token.lineNumber;
        var lineStart = token.sm_startLineStart || token.sm_lineStart || token.startLineStart || token.lineStart;
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

    exports.assert = assert;

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

    exports.syntaxFromToken = syntaxFromToken;
    exports.tokensToSyntax = tokensToSyntax;
    exports.syntaxToTokens = syntaxToTokens;

    exports.joinSyntax = joinSyntax;
    exports.joinSyntaxArr = joinSyntaxArr;

    exports.prettyPrint = prettyPrint;

    exports.MacroSyntaxError = MacroSyntaxError;
    exports.throwSyntaxError = throwSyntaxError;
    exports.printSyntaxError = printSyntaxError;
}));
