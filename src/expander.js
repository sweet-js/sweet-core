/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>

  
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'),
                require('./syntax'), require("es6-collections"),
                require('escodegen'), 
                require('./es6-module-loader'), require('./scopedEval'),
                require("./patterns"));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'parser', 'syntax',
                'es6-collections', 'escodegen', 
                'es6-module-loader', 'scopedEval', 'patterns'], factory);
    }
}(this, function(exports, _, parser, syn, es6, codegen, modules, se, patternModule) {
    'use strict';

    macro _get_vars {
	    case {_ $val { } } => { return #{} }
	    case {
            _
		    $val {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        $(var $field = $val.$field;) ...
		            _get_vars $val { $rest ... }
            }
	    }
	    case {
            _
		    $val {
			    $proto($field (,) ...) | $guard:expr => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        $(var $field = $val.$field;) ...
		            _get_vars $val { $rest ... }
            }
	    }
    }

    macro _case {
	    case {_ $val else {} } => { return #{} }
	    
	    case {
            _
		    $val else {
			default => { $body ... }
		    }
	    } => {
            return #{
		        else {
			        $body ...
		        }
            }
	    }
	    
	    case {
            _
		    $val else {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        else if($val.hasPrototype($proto)) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val else {
			    $proto($field (,) ...) | $guard:expr => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        else if($val.hasPrototype($proto) && $guard) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        if ($val.hasPrototype($proto)) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field ...) | $guard:expr => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        if($val.hasPrototype($proto) && $guard) {
			        $body ...
		        }
		        _case $val else { $rest ... }
            }
	    }
    }

    macro case {
	    case {
            _
		    $val {
			    $proto($field (,) ...) => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        _get_vars $val { $proto($field ...) => { $body ... } $rest ... }
		        _case $val { $proto($field (,) ...) => { $body ... } $rest ... }
            }
	    }
	    
	    case {
            _
		    $val {
			    $proto($field (,) ...) | $guard:expr => { $body ... }
			    $rest ...
		    }
	    } => {
            return #{
		        _get_vars $val { $proto($field ...) | $guard => { $body ... } $rest ... }
		        _case $val { $proto($field (,) ...) | $guard => { $body ... } $rest ... }
            }
	    }
    }

    
    // used to export "private" methods for unit testing
    exports._test = {};

    // some convenience monkey patching
    Object.prototype.create = function() {
        var o = Object.create(this);
        if (typeof o.construct === "function") {
            o.construct.apply(o, arguments);
        }
        return o;
    };

    Object.prototype.extend = function(properties) {
        var result = Object.create(this);
        for (var prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                result[prop] = properties[prop];
            }
        }
        return result;
    };

    Object.prototype.hasPrototype = function(proto) {
        function F() {}
        F.prototype = proto;
        return this instanceof F;
    };

    // todo: add more message information
    function throwError(msg) {
        throw new Error(msg);
    }

    var Loader = modules.Loader;
    var Module = modules.Module;

    var scopedEval = se.scopedEval;

    var Rename = syn.Rename;
    var Mark = syn.Mark;
    var Var = syn.Var;
    var Def = syn.Def;
    var isDef = syn.isDef;
    var isMark = syn.isMark;
    var isRename = syn.isRename;

    var syntaxFromToken = syn.syntaxFromToken;
    var mkSyntax = syn.mkSyntax;


    function remdup(mark, mlist) {
        if (mark === _.first(mlist)) {
            return _.rest(mlist, 1);
        }
        return [mark].concat(mlist);
    }

    // (CSyntax) -> [...Num]
    function marksof(ctx, stopName, originalName) {
        var mark, submarks;

        if (isMark(ctx)) {
            mark = ctx.mark;
            submarks = marksof(ctx.context, stopName, originalName);
            return remdup(mark, submarks);
        }
        if(isDef(ctx)) {
            return marksof(ctx.context, stopName, originalName);
        }
        if (isRename(ctx)) {
            if(stopName === originalName + "$" + ctx.name) {
                return [];
            }
            return marksof(ctx.context, stopName, originalName);
        }
        return [];
    }

    function resolve(stx) {
        return resolveCtx(stx.token.value, stx.context, [], []);
    }


    function arraysEqual(a, b) {
        if(a.length !== b.length) {
            return false;
        }
        for(var i = 0; i < a.length; i++) {
            if(a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    function renames(defctx, oldctx, originalName) {
        var acc = oldctx;
        defctx.forEach(function(def) {
            if(def.id.token.value === originalName) {
                acc = Rename(def.id, def.name, acc, defctx);
            }
        });
        return acc;
    }

    // (Syntax) -> String
    function resolveCtx(originalName, ctx, stop_spine, stop_branch) {
        if (isMark(ctx)) {
            return resolveCtx(originalName, ctx.context, stop_spine, stop_branch);
        }
        if (isDef(ctx)) {
            if (_.contains(stop_spine, ctx.defctx)) {
                return resolveCtx(originalName, ctx.context, stop_spine, stop_branch);   
            } else {
                return resolveCtx(originalName, 
                    renames(ctx.defctx, ctx.context, originalName), 
                    stop_spine,
                    _.union(stop_branch, [ctx.defctx]));
            }
        }
        if (isRename(ctx)) {
            var idName = resolveCtx(ctx.id.token.value, 
                ctx.id.context, 
                stop_branch,
                stop_branch);
            var subName = resolveCtx(originalName, 
                ctx.context,
                _.union(stop_spine,[ctx.def]),
                stop_branch);

            if(idName === subName) {
                var idMarks = marksof(ctx.id.context,
                                      originalName + "$" + ctx.name,
                                      originalName);
                var subMarks = marksof(ctx.context,
                                       originalName + "$" + ctx.name,
                                       originalName);
                if(arraysEqual(idMarks, subMarks)) {
                    return originalName + "$" + ctx.name;
                }
            }
            return resolveCtx(originalName,
                              ctx.context,
                              _.union(stop_spine,[ctx.def]),
                              stop_branch);
        }
        return originalName;
    }

    var nextFresh = 0;

    // fun () -> Num
    function fresh() { return nextFresh++; };



    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax(tojoin, punc) {
        if (tojoin.length === 0) { return []; }
        if (punc === " ") { return tojoin; }

        return _.reduce(_.rest(tojoin, 1), function (acc, join) {
            return acc.concat(mkSyntax(punc, parser.Token.Punctuator, join), join);
        }, [_.first(tojoin)]);
    }



    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim(towrap, delimSyntax) {
        parser.assert(delimSyntax.token.type === parser.Token.Delimiter,
                      "expecting a delimiter token");

        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax.context);
    }

    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers(argSyntax) {
        parser.assert(argSyntax.token.type === parser.Token.Delimiter,
            "expecting delimiter for function params");
        return _.filter(argSyntax.token.inner, function(stx) {
            return stx.token.value !== ",";
        });
    }



    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree = {

        // Go back to the flat syntax representation. Uses the ordered list
        // of properties that each subclass sets to determine the order that multiple
        // children are destructed.
        // The breakDelim param is used to determine if we just want to
        // unwrap to the ReadTree level or actually flatten the
        // delimiters too.
        // (Bool?) -> [...Syntax]
        destruct: function(breakDelim) {
            return _.reduce(this.properties, _.bind(function(acc, prop) {
                if (this[prop] && this[prop].hasPrototype(TermTree)) {
                    return acc.concat(this[prop].destruct(breakDelim));
                } else if (this[prop]) {
                    return acc.concat(this[prop]);
                } else {
                    return acc;
                }
            }, this), []);
        }
    };

    var EOF = TermTree.extend({
        properties: ["eof"],

        construct: function(e) { this.eof = e; }
    });


    var Statement = TermTree.extend({ construct: function() {} });

    var Expr = TermTree.extend({ construct: function() {} });
    var PrimaryExpression = Expr.extend({ construct: function() {} });

    var ThisExpression = PrimaryExpression.extend({
        properties: ["this"],

        construct: function(that) { this.this = that; }
    });

    var Lit = PrimaryExpression.extend({
        properties: ["lit"],

        construct: function(l) { this.lit = l; }
    });

    exports._test.PropertyAssignment = PropertyAssignment;
    var PropertyAssignment = TermTree.extend({
        properties: ["propName", "assignment"],

        construct: function(propName, assignment) {
            this.propName = propName;
            this.assignment = assignment;
        }
    });

    var Block = PrimaryExpression.extend({
        properties: ["body"],
        construct: function(body) { this.body = body; }
    });

    var ArrayLiteral = PrimaryExpression.extend({
        properties: ["array"],

        construct: function(ar) { this.array = ar; }
    });

    var ParenExpression = PrimaryExpression.extend({
        properties: ["expr"],
        construct: function(expr) { this.expr = expr; }
    });

    var UnaryOp = Expr.extend({
        properties: ["op", "expr"],

        construct: function(op, expr) {
            this.op = op;
            this.expr = expr;
        }
    });

    var PostfixOp = Expr.extend({
        properties: ["expr", "op"],

        construct: function(expr, op) {
            this.expr = expr;
            this.op = op;
        }
    });

    var BinOp = Expr.extend({
        properties: ["left", "op", "right"],

        construct: function(op, left, right) {
            this.op = op;
            this.left = left;
            this.right = right;
        }
    });

    var ConditionalExpression = Expr.extend({
        properties: ["cond", "question", "tru", "colon", "fls"],
        construct: function(cond, question, tru, colon, fls) {
            this.cond = cond;
            this.question = question;
            this.tru = tru;
            this.colon = colon;
            this.fls = fls;
        }
    });


    var Keyword = TermTree.extend({
        properties: ["keyword"],

        construct: function(k) { this.keyword = k; }
    });

    var Punc = TermTree.extend({
        properties: ["punc"],

        construct: function(p) { this.punc = p; }
    });

    var Delimiter = TermTree.extend({
        properties: ["delim"],

        // do a special kind of destruct that creates
        // the individual begin and end delimiters
        destruct: function(breakDelim) {
            parser.assert(this.delim, "expecting delim to be defined");

            var innerStx = _.reduce(this.delim.token.inner, function(acc, term) {
                if (term.hasPrototype(TermTree)){
                    return acc.concat(term.destruct(breakDelim));
                } else {
                    return acc.concat(term);
                }
            }, []);

            if(breakDelim) {
                var openParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: this.delim.token.value[0],
                    range: this.delim.token.startRange,
                    lineNumber: this.delim.token.startLineNumber,
                    lineStart: this.delim.token.startLineStart
                });
                var closeParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: this.delim.token.value[1],
                    range: this.delim.token.endRange,
                    lineNumber: this.delim.token.endLineNumber,
                    lineStart: this.delim.token.endLineStart
                });

                return [openParen]
                    .concat(innerStx)
                    .concat(closeParen);
            } else {
                return this.delim;
            }
        },

        construct: function(d) { this.delim = d; }
    });

    var Id = PrimaryExpression.extend({
        properties: ["id"],

        construct: function(id) { this.id = id; }
    });

    var NamedFun = Expr.extend({
        properties: ["keyword", "name", "params", "body"],

        construct: function(keyword, name, params, body) {
            this.keyword = keyword;
            this.name = name;
            this.params = params;
            this.body = body;
        }
    });

    var AnonFun = Expr.extend({
        properties: ["keyword", "params", "body"],

        construct: function(keyword, params, body) {
            this.keyword = keyword;
            this.params = params;
            this.body = body;
        }
    });

    var LetMacro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    })

    var Macro = TermTree.extend({
        properties: ["name", "body"],

        construct: function(name, body) {
            this.name = name;
            this.body = body;
        }
    });

    var Const = Expr.extend({
        properties: ["newterm", "call"],
        construct: function(newterm, call){
            this.newterm = newterm;
            this.call = call;
        }
    });

    var Call = Expr.extend({
        properties: ["fun", "args", "delim", "commas"],

        destruct: function(breakDelim) {
            parser.assert(this.fun.hasPrototype(TermTree),
                "expecting a term tree in destruct of call");
            var that = this;
            this.delim = syntaxFromToken(_.clone(this.delim.token), this.delim.context);
            this.delim.token.inner = _.reduce(this.args, function(acc, term) {
                parser.assert(term && term.hasPrototype(TermTree),
                              "expecting term trees in destruct of Call");
                var dst = acc.concat(term.destruct(breakDelim));
                // add all commas except for the last one
                if (that.commas.length > 0) {
                    dst = dst.concat(that.commas.shift());
                }
                return dst;
            }, []);

            return this.fun.destruct(breakDelim).concat(Delimiter
                                                        .create(this.delim)
                                                        .destruct(breakDelim));
        },

        construct: function(funn, args, delim, commas) {
            parser.assert(Array.isArray(args), "requires an array of arguments terms");
            this.fun = funn;
            this.args = args;
            this.delim = delim;
            // an ugly little hack to keep the same syntax objects
            // (with associated line numbers etc.) for all the commas
            // separating the arguments
            this.commas = commas;
        }
    });


    var ObjDotGet = Expr.extend({
        properties: ["left", "dot", "right"],

        construct: function (left, dot, right) {
            this.left = left;
            this.dot = dot;
            this.right = right;
        }
    });

    var ObjGet = Expr.extend({
        properties: ["left", "right"],

        construct: function(left, right) {
            this.left = left;
            this.right = right;
        }
    });

    var VariableDeclaration = TermTree.extend({
        properties: ["ident", "eqstx", "init", "comma"],

        construct: function(ident, eqstx, init, comma) {
            this.ident = ident;
            this.eqstx = eqstx;
            this.init = init;
            this.comma = comma;
        }
    });

    var VariableStatement = Statement.extend({
        properties: ["varkw", "decls"],

        destruct: function(breakDelim) {
            return this.varkw
                .destruct(breakDelim)
                .concat(_.reduce(this.decls, function(acc, decl) {
                    return acc.concat(decl.destruct(breakDelim));
                }, []));
        },

        construct: function(varkw, decls) {
            parser.assert(Array.isArray(decls), "decls must be an array");
            this.varkw = varkw;
            this.decls = decls;
        }
    });

    var CatchClause = TermTree.extend({
        properties: ["catchkw", "params", "body"],

        construct: function(catchkw, params, body) {
            this.catchkw = catchkw;
            this.params = params;
            this.body = body;
        }
    });

    var Empty = TermTree.extend({
        properties: [],
        construct: function() {}
    });

    function stxIsUnaryOp (stx) {
        var staticOperators = ["+", "-", "~", "!",
                                "delete", "void", "typeof",
                                "++", "--"];
        return _.contains(staticOperators, stx.token.value);
    }

    function stxIsBinOp (stx) {
        var staticOperators = ["+", "-", "*", "/", "%", "||", "&&", "|", "&", "^",
                                "==", "!=", "===", "!==", 
                                "<", ">", "<=", ">=", "in", "instanceof",
                                "<<", ">>", ">>>"];
        return _.contains(staticOperators, stx.token.value);
    }

    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement (stx, env) {
        var decls = [];

        var res = enforest(stx, env);
        var result = res.result;
        var rest = res.rest;

        if (rest[0]) {
            var nextRes = enforest(rest, env);

            // x = ...
            if (nextRes.result.hasPrototype(Punc) && nextRes.result.punc.token.value === "=") {
                var initializerRes = enforest(nextRes.rest, env);

                if (initializerRes.rest[0]) {
                    var restRes = enforest(initializerRes.rest, env);

                    // x = y + z, ...
                    if (restRes.result.hasPrototype(Punc) &&
                        restRes.result.punc.token.value === ",") {

                        decls.push(VariableDeclaration.create(result.id,
                                                              nextRes.result.punc,
                                                              initializerRes.result,
                                                              restRes.result.punc));
                        var subRes = enforestVarStatement(restRes.rest, env);
                        decls = decls.concat(subRes.result);
                        rest = subRes.rest;
                    // x = y ...
                    } else {
                        decls.push(VariableDeclaration.create(result.id,
                                                              nextRes.result.punc,
                                                              initializerRes.result));
                        rest = initializerRes.rest;
                    }
                // x = y EOF
                } else {
                    decls.push(VariableDeclaration.create(result.id,
                                                          nextRes.result.punc,
                                                          initializerRes.result));
                }
            // x ,...;
            } else if (nextRes.result.hasPrototype(Punc) && nextRes.result.punc.token.value === ",") {
                decls.push(VariableDeclaration.create(result.id, null, null, nextRes.result.punc));
                var subRes = enforestVarStatement(nextRes.rest, env);
                decls = decls.concat(subRes.result);
                rest = subRes.rest;
            } else {
                if (result.hasPrototype(Id)) {
                    decls.push(VariableDeclaration.create(result.id));
                } else {
                    throwError("Expecting an identifier in variable declaration");
                }
            }
        // x EOF
        } else {
            if (result.hasPrototype(Id)) {
                decls.push(VariableDeclaration.create(result.id));
            } else if (result.hasPrototype(BinOp) && result.op.token.value === "in") {
                decls.push(VariableDeclaration.create(result.left.id,
                                                      result.op,
                                                      result.right));
            } else {
                throwError("Expecting an identifier in variable declaration");
            }
        }
        
        return {
            result: decls,
            rest: rest
        };
    }

    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest(toks, env) {
        env = env || new Map();

        parser.assert(toks.length > 0, "enforest assumes there are tokens to work with");

        function step(head, rest) {
            var innerTokens;
            parser.assert(Array.isArray(rest), "result must at least be an empty array");
            if (head.hasPrototype(TermTree)) {

                // function call
                case head {

                    // Call
                    Expr(emp) | (rest[0] && 
                                 rest[0].token.type === parser.Token.Delimiter &&
                                 rest[0].token.value === "()") => {
                        var argRes, enforestedArgs = [], commas = [];

                        innerTokens = rest[0].token.inner;
                        while (innerTokens.length > 0) {
                            argRes = enforest(innerTokens, env);
                            enforestedArgs.push(argRes.result);
                            innerTokens = argRes.rest;
                            if (innerTokens[0] && innerTokens[0].token.value === ",") {
                                // record the comma for later
                                commas.push(innerTokens[0]);
                                // but dump it for the next loop turn
                                innerTokens = innerTokens.slice(1);
                            } else {
                                // either there are no more tokens or
                                // they aren't a comma, either way we
                                // are done with the loop
                                break;
                            }
                        }
                        var argsAreExprs = _.all(enforestedArgs, function(argTerm) {
                            return argTerm.hasPrototype(Expr)
                        });

                        // only a call if we can completely enforest each argument and
                        // each argument is an expression
                        if (innerTokens.length === 0 && argsAreExprs) {
                            return step(Call.create(head,
                                                    enforestedArgs,
                                                    rest[0],
                                                    commas),
                                        rest.slice(1));
                        }
                    }

                    // Conditional ( x ? true : false)
                    Expr(emp) | (rest[0] && rest[0].token.value === "?") => {
                        var question = rest[0];
                        var condRes = enforest(rest.slice(1), env);
                        var truExpr = condRes.result;
                        var right = condRes.rest;
                        if(truExpr.hasPrototype(Expr) &&
                           right[0] && right[0].token.value === ":") {
                            var colon = right[0];
                            var flsRes = enforest(right.slice(1), env);
                            var flsExpr = flsRes.result;
                            if(flsExpr.hasPrototype(Expr)) {
                                return step(ConditionalExpression.create(head,
                                                                         question,
                                                                         truExpr,
                                                                         colon,
                                                                         flsExpr),
                                            flsRes.rest);
                            }
                        }
                    }

                    // Constructor
                    Keyword(keyword) | (keyword.token.value === "new" && rest[0]) => {
                        var newCallRes = enforest(rest, env);
                        if(newCallRes.result.hasPrototype(Call)) {
                            return step(Const.create(head, newCallRes.result),
                                        newCallRes.rest);
                        }
                    }

                    // ParenExpr
                    Delimiter(delim) | delim.token.value === "()" => {
                        innerTokens = delim.token.inner;
                        // empty parens are acceptable but enforest
                        // doesn't accept empty arrays so short
                        // circuit here
                        if (innerTokens.length === 0) {
                            return step(ParenExpression.create(head), rest);
                        } else {
                            var innerTerm = get_expression(innerTokens, env);
                            if (innerTerm.result &&
                                innerTerm.result.hasPrototype(Expr)) {
                                return step(ParenExpression.create(head), rest);
                            }
                            // if the tokens inside the paren aren't an expression
                            // we just leave it as a delimiter
                        }
                    }

                    // BinOp
                    TermTree(emp) | (rest[0] && rest[1] && stxIsBinOp(rest[0])) => {
                        var op = rest[0];
                        var left = head;
                        var bopRes = enforest(rest.slice(1), env);
                        var right = bopRes.result;
                        // only a binop if the right is a real expression
                        // so 2+2++ will only match 2+2
                        if (right.hasPrototype(Expr)) {
                            return step(BinOp.create(op, left, right), bopRes.rest);
                        }
                    }

                    // UnaryOp (via punctuation)
                    Punc(punc) | stxIsUnaryOp(punc) => {
                        var unopRes = enforest(rest, env);
                        if (unopRes.result.hasPrototype(Expr)) {
                            return step(UnaryOp.create(punc, unopRes.result),
                                        unopRes.rest);
                        }
                    }

                    // UnaryOp (via keyword)
                    Keyword(keyword) | stxIsUnaryOp(keyword) => {
                        var unopRes = enforest(rest, env);
                        if (unopRes.result.hasPrototype(Expr)) {
                            return step(UnaryOp.create(keyword, unopRes.result),
                                        unopRes.rest);
                        }
                    }

                    // Postfix
                    Expr(emp) | (rest[0] && (rest[0].token.value === "++" || 
                                            rest[0].token.value === "--")) => {
                        return step(PostfixOp.create(head, rest[0]), rest.slice(1));
                    }

                    // ObjectGet (computed)
                    Expr(emp) | (rest[0] && rest[0].token.value === "[]") => {
                        var getRes = enforest(rest[0].token.inner, env);
                        var resStx = mkSyntax("[]", parser.Token.Delimiter, rest[0]);
                        resStx.token.inner = [getRes.result];
                        return step(ObjGet.create(head, Delimiter.create(resStx)),
                                    rest.slice(1));
                    }

                    // ObjectGet
                    Expr(emp) | (rest[0] && rest[0].token.value === "." &&
                                 rest[1] &&
                                 rest[1].token.type === parser.Token.Identifier) => {
                        return step(ObjDotGet.create(head, rest[0], rest[1]),
                                    rest.slice(2));
                    }

                    // ArrayLiteral
                    Delimiter(delim) | delim.token.value === "[]" => {
                        return step(ArrayLiteral.create(head), rest);
                    }

                    // Block
                    Delimiter(delim) | head.delim.token.value === "{}" => {
                        return step(Block.create(head), rest);
                    }

                    // VariableStatement
                    Keyword(keyword) | (keyword.token.value === "var" && rest[0]) => {
                        var vsRes = enforestVarStatement(rest, env);
                        if (vsRes) {
                            return step(VariableStatement.create(head, vsRes.result),
                                        vsRes.rest);
                        }
                    }
                }
            } else {
                parser.assert(head && head.token, "assuming head is a syntax object");

                // macro invocation
                if ((head.token.type === parser.Token.Identifier ||
                     head.token.type === parser.Token.Keyword ||
                     head.token.type === parser.Token.Punctuator) &&
                    env.has(resolve(head))) {

                    // pull the macro transformer out the environment
                    var transformer = env.get(resolve(head));
                    // apply the transformer
                    var rt = transformer([head].concat(rest), env);
                    if(!Array.isArray(rt.result)) {
                        throwError("Macro transformer must return a result array, not: "
                                   + rt.result);
                    }
                    if(rt.result.length > 0) {
                        return step(rt.result[0], rt.result.slice(1).concat(rt.rest));
                    } else {
                        return step(Empty.create(), rt.rest);
                    } 
                // let macro
                } else if(head.token.value === "let" && rest[0] && rest[0].token.type === parser.Token.Identifier &&
                         rest[1] && rest[1].token.value === "=" &&
                         rest[2] && rest[2].token.value === "macro" &&
                         rest[3] && rest[3].token.value === "{}") {
                    return step(LetMacro.create(rest[0], rest[3].token.inner), rest.slice(4));
                // macro definition
                } else if (head.token.type === parser.Token.Identifier &&
                           head.token.value === "macro" && rest[0] &&
                           (rest[0].token.type === parser.Token.Identifier ||
                            rest[0].token.type === parser.Token.Keyword ||
                            rest[0].token.type === parser.Token.Punctuator) &&
                           rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                           rest[1].token.value === "{}") {

                    return step(Macro.create(rest[0], rest[1].token.inner),
                                rest.slice(2));
                // function definition
                } else if (head.token.type === parser.Token.Keyword &&
                    head.token.value === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Identifier &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "()" &&
                    rest[2] && rest[2].token.type === parser.Token.Delimiter &&
                    rest[2].token.value === "{}") {

                    return step(NamedFun.create(head, rest[0],
                                                rest[1],
                                                rest[2]),
                                rest.slice(3));
                // anonymous function definition
                } else if(head.token.type === parser.Token.Keyword &&
                    head.token.value === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                    rest[0].token.value === "()" &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "{}") {

                    return step(AnonFun.create(head,
                                                rest[0],
                                                rest[1]),
                                rest.slice(2));
                // catch statement
                } else if (head.token.type === parser.Token.Keyword &&
                           head.token.value === "catch" &&
                           rest[0] && rest[0].token.type === parser.Token.Delimiter &&
                           rest[0].token.value === "()" &&
                           rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                           rest[1].token.value === "{}") {
                    return step(CatchClause.create(head, rest[0], rest[1]),
                               rest.slice(2));
                // this expression
                } else if (head.token.type === parser.Token.Keyword &&
                    head.token.value === "this") {

                    return step(ThisExpression.create(head), rest);
                // literal
                } else if (head.token.type === parser.Token.NumericLiteral ||
                    head.token.type === parser.Token.StringLiteral ||
                    head.token.type === parser.Token.BooleanLiteral ||
                    head.token.type === parser.Token.RegexLiteral ||
                    head.token.type === parser.Token.NullLiteral) {

                    return step(Lit.create(head), rest);
                // identifier
                } else if (head.token.type === parser.Token.Identifier) {
                    return step(Id.create(head), rest);
                // punctuator
                } else if (head.token.type === parser.Token.Punctuator) {
                    return step(Punc.create(head), rest);
                } else if (head.token.type === parser.Token.Keyword &&
                            head.token.value === "with") {
                    throwError("with is not supported in sweet.js");
                // keyword
                } else if (head.token.type === parser.Token.Keyword) {
                    return step(Keyword.create(head), rest);
                // Delimiter
                } else if (head.token.type === parser.Token.Delimiter) {
                    return step(Delimiter.create(head), rest);
                // end of file
                } else if (head.token.type === parser.Token.EOF) {
                    parser.assert(rest.length === 0, "nothing should be after an EOF");
                    return step(EOF.create(head), []);
                } else {
                    // todo: are we missing cases?
                    parser.assert(false, "not implemented");
                }

            }

            // we're done stepping
            return {
                result: head,
                rest: rest
            };

        }

        return step(toks[0], toks.slice(1));
    }

    function get_expression(stx, env) {
        var res = enforest(stx, env);
        if (!res.result.hasPrototype(Expr)) {
            return {
                result: null,
                rest: stx
            };
        }
        return res;
    }


    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv (newMark, env) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs(match) {
            if (match.level === 0) {
                // replace the match property with the marked syntax
                match.match = _.map(match.match, function(stx) {
                    return stx.mark(newMark);
                });
            } else {
                _.each(match.match, function(match) {
                    dfs(match);
                });
            }
        }
        _.keys(env).forEach(function(key) {
            dfs(env[key]);
        });
    }


    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef(mac, env, defscope, templateMap) {
        var body = mac.body;

        // raw function primitive form
        if(!(body[0] && body[0].token.type === parser.Token.Keyword &&
             body[0].token.value === "function")) {
            throwError("Primitive macro form must contain a function for the macro body");
        }

        var stub = parser.read("()");
        stub[0].token.inner = body;
        var expanded = flatten(expand(stub, env, defscope, templateMap));
        var bodyCode = codegen.generate(parser.parse(expanded));

        var macroFn = scopedEval(bodyCode, {
            makeValue: syn.makeValue,
            makeRegex: syn.makeRegex,
            makeIdent: syn.makeIdent,
            makeKeyword: syn.makeKeyword,
            makePunc: syn.makePunc,
            makeDelim: syn.makeDelim,
            unwrapSyntax: syn.unwrapSyntax,
            fresh: fresh,
            _: _,
            parser: parser,
            patternModule: patternModule,
            getTemplate: function(id) {return templateMap.get(id);},
            applyMarkToPatternEnv: applyMarkToPatternEnv
        }); 

        return macroFn;
    }

    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree (stx, env, defscope, templateMap) {
        parser.assert(env, "environment map is required");

        // short circuit when syntax array is empty
        if (stx.length === 0) {
            return {
                terms: [],
                env: env
            };
        }

        parser.assert(stx[0].token, "expecting a syntax object");

        var f = enforest(stx, env);
        // head :: TermTree
        var head = f.result;
        // rest :: [Syntax]
        var rest = f.rest;

        if (head.hasPrototype(Macro)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition = loadMacroDef(head, env, defscope, templateMap);

            addToDefinitionCtx([head.name], defscope, false);
            env.set(resolve(head.name), macroDefinition);

            return expandToTermTree(rest, env, defscope, templateMap);
        }

        if (head.hasPrototype(LetMacro)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition = loadMacroDef(head, env, defscope, templateMap);

            addToDefinitionCtx([head.name], defscope, false);
            env.set(resolve(head.name), macroDefinition);

            return expandToTermTree(rest, env, defscope, templateMap);
        }

        if(head.hasPrototype(Id) && head.id.token.value === "#quoteSyntax" &&
           rest[0] && rest[0].token.value === "{}") {
            var tempId = fresh();
            templateMap.set(tempId, rest[0].token.inner);
            return expandToTermTree([syn.makeIdent("getTemplate", head.id),
                                     syn.makeDelim("()", [syn.makeValue(tempId, head.id)])].concat(rest.slice(1)),
                                    env, defscope, templateMap);
        }

        if (head.hasPrototype(VariableStatement)) {
            addToDefinitionCtx(_.map(head.decls, function(decl) { return decl.ident; }),
                               defscope,
                               true)
        }

        if(head.hasPrototype(Block) && head.body.hasPrototype(Delimiter)) {
            head.body.delim.token.inner.forEach(function(term) {
                if (term.hasPrototype(VariableStatement)) {
                    addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                       defscope,
                                       true);
                }
            });

        } 

        if(head.hasPrototype(Delimiter)) {
            head.delim.token.inner.forEach(function(term) {
                if (term.hasPrototype(VariableStatement)) {
                    addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                       defscope,
                                       true);
                                      
                }
            });
        }

        var trees = expandToTermTree(rest, env, defscope, templateMap);
        return {
            terms: [head].concat(trees.terms),
            env: trees.env
        };
    }

    function addToDefinitionCtx(idents, defscope, skipRep) {
        parser.assert(idents && idents.length > 0, "expecting some variable identifiers");
        skipRep = skipRep || false;
        _.each(idents, function(id) {
            var skip = false;
            if (skipRep) {
                var declRepeat = _.find(defscope, function(def) {
                    return def.id.token.value === id.token.value &&
                        arraysEqual(marksof(def.id.context), marksof(id.context));
                });
                skip = typeof declRepeat !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip) {
                var name = fresh();
                defscope.push({
                    id: id,
                    name: name
                });
                
            }
        });
    }


    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal (term, env, defscope, templateMap) {
        parser.assert(env, "environment map is required");


        if (term.hasPrototype(ArrayLiteral)) {
            term.array.delim.token.inner = expand(term.array.delim.token.inner,
                                                  env,
                                                  defscope,
                                                  templateMap);
            return term;
        } else if (term.hasPrototype(Block)) {
            term.body.delim.token.inner = expand(term.body.delim.token.inner,
                                                 env,
                                                 defscope,
                                                 templateMap);
            return term;
        } else if (term.hasPrototype(ParenExpression)) {
            term.expr.delim.token.inner = expand(term.expr.delim.token.inner,
                                                 env,
                                                 defscope,
                                                 templateMap);
            return term;
        } else if (term.hasPrototype(Call)) {
            term.fun = expandTermTreeToFinal(term.fun,
                                             env,
                                             defscope,
                                             templateMap);
            term.args = _.map(term.args, function(arg) {
                return expandTermTreeToFinal(arg, env, defscope, templateMap);
            });
            return term;
        } else if (term.hasPrototype(UnaryOp)) {
            term.expr = expandTermTreeToFinal(term.expr, env, defscope, templateMap);
            return term;
        } else if (term.hasPrototype(BinOp)) {
            term.left = expandTermTreeToFinal(term.left, env, defscope, templateMap);
            term.right = expandTermTreeToFinal(term.right, env, defscope);
            return term;
        } else if (term.hasPrototype(ObjDotGet)) {
            term.left = expandTermTreeToFinal(term.left, env, defscope, templateMap);
            term.right = expandTermTreeToFinal(term.right, env, defscope, templateMap);
            return term;
        } else if (term.hasPrototype(VariableDeclaration)) {
            if (term.init) {
                term.init = expandTermTreeToFinal(term.init, env, defscope, templateMap);
            }
            return term;
        } else if (term.hasPrototype(VariableStatement)) {
            term.decls = _.map(term.decls, function(decl) {
                return expandTermTreeToFinal(decl, env, defscope, templateMap);
            });
            return term;
        } else if (term.hasPrototype(Delimiter)) {
            // expand inside the delimiter and then continue on
            term.delim.token.inner = expand(term.delim.token.inner, env,defscope, templateMap);
            return term;
        } else if (term.hasPrototype(NamedFun) ||
                   term.hasPrototype(AnonFun) ||
                   term.hasPrototype(CatchClause)) {
            // function definitions need a bunch of hygiene logic
            if (term.hasPrototype(NamedFun)) {
                addToDefinitionCtx([term.name], defscope, false);
            }
            // push down a fresh definition context
            var newDef = [];

            var params = term.params.addDefCtx(newDef);
            var bodies = term.body.addDefCtx(newDef);

            var paramNames = _.map(getParamIdentifiers(params), function(param) {
                var freshName = fresh();
                return {
                    freshName: freshName,
                    originalParam: param,
                    renamedParam: param.rename(param, freshName)
                };
            });


            var stxBody = bodies;

            // rename the function body for each of the parameters
            var renamedBody = _.reduce(paramNames, function (accBody, p) {
                return accBody.rename(p.originalParam, p.freshName)
            }, stxBody);

            var bodyTerms = expand([renamedBody], env, newDef, templateMap);
            parser.assert(bodyTerms.length === 1 && bodyTerms[0].body,
                            "expecting a block in the bodyTerms");

            var flattenedBody = flatten(bodyTerms);

            var renamedParams = _.map(paramNames, function(p) { return p.renamedParam; });
            var flatArgs = wrapDelim(joinSyntax(renamedParams, ","), term.params);
            var expandedArgs = expand([flatArgs], env, newDef, templateMap);
            parser.assert(expandedArgs.length === 1, "should only get back one result");
            // stitch up the function with all the renamings
            term.params = expandedArgs[0];

            term.body = _.map(flattenedBody, function(stx) { 
                return _.reduce(newDef, function(acc, def) {
                    return acc.rename(def.id, def.name);
                }, stx)
            });

            // and continue expand the rest
            return term;
        }
        // the term is fine as is
        return term;
    }

    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand(stx, env, defscope, templateMap) {
        env = env || new Map();
        templateMap = templateMap || new Map();

        var trees = expandToTermTree(stx, env, defscope, templateMap);
        return _.map(trees.terms, function(term) {
            return expandTermTreeToFinal(term, trees.env, defscope, templateMap);
        })
    }

    // a hack to make the top level hygiene work out
    function expandTopLevel (stx) {
        var funn = syntaxFromToken({
            value: "function",
            type: parser.Token.Keyword
        });
        var params = syntaxFromToken({
            value: "()",
            type: parser.Token.Delimiter,
            inner: []
        });
        var body = syntaxFromToken({
            value:  "{}",
            type: parser.Token.Delimiter,
            inner: stx
        });

        var res = expand([funn, params, body]);
        // drop the { and }
        return _.map(res[0].body.slice(1, res[0].body.length - 1), function(stx) {
            return stx;
        });
    }

    // take our semi-structured TermTree and flatten it back to just
    // syntax objects to be used by the esprima parser. eventually this will
    // be replaced with a method of moving directly from a TermTree to an AST but
    // until then we'll just defer to esprima.
    function flatten(terms) {
        return _.reduce(terms, function(acc, term) {
            return acc.concat(term.destruct(true));
        }, []);
    }

    exports.enforest = enforest;
    exports.expand = expandTopLevel;

    exports.resolve = resolve;

    exports.flatten = flatten;

    exports.get_expression = get_expression;

    exports.Expr = Expr;
    exports.VariableStatement = VariableStatement;

    exports.tokensToSyntax = syn.tokensToSyntax;
}));

