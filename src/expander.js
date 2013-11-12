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
        factory(exports,
                require('underscore'),
                require('./parser'),
                require('./syntax'),
                require("es6-collections"),
                require('./scopedEval'),
                require("./patterns"),
                require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports',
                'underscore',
                'parser',
                'syntax',
                'es6-collections', 
                'scopedEval',
                'patterns'], factory);
    }
}(this, function(exports, _, parser, syn, es6, se, patternModule, gen) {
    'use strict';
    var codegen = gen || escodegen;

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
    Object.defineProperties(Object.prototype, {
        "create": {
            value: function() {
                var o = Object.create(this);
                if (typeof o.construct === "function") {
                    o.construct.apply(o, arguments);
                }
                return o;
            },
            enumerable: false,
            writable: true
        },
        "extend": {
            value: function(properties) {
                var result = Object.create(this);
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        result[prop] = properties[prop];
                    }
                }
                return result;
            },
            enumerable: false,
            writable: true
        },
        "hasPrototype": {
            value: function(proto) {
                function F() {}
                F.prototype = proto;
                return this instanceof F;
            },
            enumerable: false,
            writable: true
        }
    });

    // todo: add more message information
    function throwError(msg) {
        throw new Error(msg);
    }

    var scopedEval = se.scopedEval;

    var Rename = syn.Rename;
    var Mark = syn.Mark;
    var Var = syn.Var;
    var Def = syn.Def;
    var isDef = syn.isDef;
    var isMark = syn.isMark;
    var isRename = syn.isRename;

    var syntaxFromToken = syn.syntaxFromToken;
    var joinSyntax = syn.joinSyntax;


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
        for (var i = 0; i < defctx.length; i++) {
            if (defctx[i].id.token.value === originalName) {
                acc = Rename(defctx[i].id, defctx[i].name, acc, defctx);
            }
        }
        return acc;
    }

    function unionEl(arr, el) {
        if (arr.indexOf(el) === -1) {
            var res = arr.slice(0);
            res.push(el);
            return res;
        }
        return arr;
    }

    // (Syntax) -> String
    function resolveCtx(originalName, ctx, stop_spine, stop_branch) {
        if (isMark(ctx)) {
            return resolveCtx(originalName, ctx.context, stop_spine, stop_branch);
        }
        if (isDef(ctx)) {
            if (stop_spine.indexOf(ctx.defctx) !== -1) {
                return resolveCtx(originalName, ctx.context, stop_spine, stop_branch);   
            } else {
                return resolveCtx(originalName,
                                  renames(ctx.defctx, ctx.context, originalName),
                                  stop_spine,
                                  unionEl(stop_branch, ctx.defctx));
            }
        }
        if (isRename(ctx)) {
            if (originalName === ctx.id.token.value) {
                var idName = resolveCtx(ctx.id.token.value, 
                                        ctx.id.context, 
                                        stop_branch,
                                        stop_branch);
                var subName = resolveCtx(originalName,
                                         ctx.context,
                                         unionEl(stop_spine, ctx.def),
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
            }
            return resolveCtx(originalName,
                              ctx.context,
                              unionEl(stop_spine, ctx.def),
                              stop_branch);
        }
        return originalName;
    }

    var nextFresh = 0;

    // fun () -> Num
    function fresh() { return nextFresh++; };




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
        }, delimSyntax);
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

        // Go back to the syntax object representation. Uses the
        // ordered list of properties that each subclass sets to
        // determine the order in which multiple children are
        // destructed.
        // () -> [...Syntax]
        destruct: function() {
            return _.reduce(this.properties, _.bind(function(acc, prop) {
                if (this[prop] && this[prop].hasPrototype(TermTree)) {
                    return acc.concat(this[prop].destruct());
                } else if (this[prop] && this[prop].token && this[prop].token.inner) {
                    this[prop].token.inner = _.reduce(this[prop].token.inner, function(acc, t) {
                        if (t.hasPrototype(TermTree)) {
                            return acc.concat(t.destruct());
                        }
                        return acc.concat(t);
                    }, []);
                    return acc.concat(this[prop]);
                } else if(this[prop]) {
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

    var AnonMacro = TermTree.extend({
        properties: ["body"],

        construct: function(body) {
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

        destruct: function() {
            parser.assert(this.fun.hasPrototype(TermTree),
                "expecting a term tree in destruct of call");
            var that = this;
            this.delim = syntaxFromToken(_.clone(this.delim.token), this.delim);
            this.delim.token.inner = _.reduce(this.args, function(acc, term) {
                parser.assert(term && term.hasPrototype(TermTree),
                              "expecting term trees in destruct of Call");
                var dst = acc.concat(term.destruct());
                // add all commas except for the last one
                if (that.commas.length > 0) {
                    dst = dst.concat(that.commas.shift());
                }
                return dst;
            }, []);

            return this.fun.destruct().concat(Delimiter
                                              .create(this.delim)
                                              .destruct());
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

        destruct: function() {
            return this.varkw
                .destruct()
                .concat(_.reduce(this.decls, function(acc, decl) {
                    return acc.concat(decl.destruct());
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

    var Module = TermTree.extend({
        properties: ["body", "exports"],

        construct: function(body) {
            this.body = body;
            this.exports = [];
        }
    });

    var Empty = TermTree.extend({
        properties: [],
        construct: function() {}
    });

    var Export = TermTree.extend({
        properties: ["name"],
        construct: function(name) {
            this.name = name;
        }
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
    function enforestVarStatement (stx, context) {
        var decls = [];

        var res = enforest(stx, context);
        var result = res.result;
        var rest = res.rest;

        if (rest[0]) {
            var nextRes = enforest(rest, context);

            // x = ...
            if (nextRes.result.hasPrototype(Punc) && nextRes.result.punc.token.value === "=") {
                var initializerRes = enforest(nextRes.rest, context);

                if (initializerRes.rest[0]) {
                    var restRes = enforest(initializerRes.rest, context);

                    // x = y + z, ...
                    if (restRes.result.hasPrototype(Punc) &&
                        restRes.result.punc.token.value === ",") {

                        decls.push(VariableDeclaration.create(result.id,
                                                              nextRes.result.punc,
                                                              initializerRes.result,
                                                              restRes.result.punc));
                        var subRes = enforestVarStatement(restRes.rest, context);
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
                var subRes = enforestVarStatement(nextRes.rest, context);
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

    function adjustLineContext (stx, original) {
        var last = stx[0] && typeof stx[0].token.range == "undefined" ? original : stx[0];
        return _.map(stx, function(stx) {
            if (typeof stx.token.range == "undefined") {
                stx.token.range = last.token.range
            }
            if (stx.token.type === parser.Token.Delimiter) {
                stx.token.sm_startLineNumber = original.token.lineNumber;
                stx.token.sm_endLineNumber = original.token.lineNumber;
                stx.token.sm_startLineStart = original.token.lineStart;
                stx.token.sm_endLineStart = original.token.lineStart;
                if (stx.token.inner.length > 0) {
                    stx.token.inner = adjustLineContext(stx.token.inner, original);
                }
                last = stx;
                return stx;
            }
            stx.token.sm_lineNumber = original.token.lineNumber;
            stx.token.sm_lineStart = original.token.lineStart;
            last = stx;
            return stx;
        });
    }

    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest(toks, context) {
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
                        rest[0].expose();
                        innerTokens = rest[0].token.inner;
                        while (innerTokens.length > 0) {
                            argRes = enforest(innerTokens, context);
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
                        var condRes = enforest(rest.slice(1), context);
                        var truExpr = condRes.result;
                        var right = condRes.rest;
                        if(truExpr.hasPrototype(Expr) &&
                           right[0] && right[0].token.value === ":") {
                            var colon = right[0];
                            var flsRes = enforest(right.slice(1), context);
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
                        var newCallRes = enforest(rest, context);
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
                            var innerTerm = get_expression(innerTokens, context);
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
                        var bopRes = enforest(rest.slice(1), context);
                        var right = bopRes.result;
                        // only a binop if the right is a real expression
                        // so 2+2++ will only match 2+2
                        if (right.hasPrototype(Expr)) {
                            return step(BinOp.create(op, left, right), bopRes.rest);
                        }
                    }

                    // UnaryOp (via punctuation)
                    Punc(punc) | stxIsUnaryOp(punc) => {
                        var unopRes = enforest(rest, context);
                        if (unopRes.result.hasPrototype(Expr)) {
                            return step(UnaryOp.create(punc, unopRes.result),
                                        unopRes.rest);
                        }
                    }

                    // UnaryOp (via keyword)
                    Keyword(keyword) | stxIsUnaryOp(keyword) => {
                        var unopRes = enforest(rest, context);
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
                        return step(ObjGet.create(head, Delimiter.create(rest[0].expose())),
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
                    
                    Keyword(keyword) | (keyword.token.value === "let" && 
                                        (rest[0] && rest[0].token.type === parser.Token.Identifier || 
                                         rest[0] && rest[0].token.type === parser.Token.Keyword) &&
                                        rest[1] && rest[1].token.value === "=" &&
                                        rest[2] && rest[2].token.value === "macro") => {
                        var mac = enforest(rest.slice(2), context);
                        if (!mac.result.hasPrototype(AnonMacro)) {
                            throw new Error("expecting an anonymous macro definition in syntax let binding, not: " + mac.result);
                        }
                        return step(LetMacro.create(rest[0], mac.result.body), mac.rest);
                                  
                    }

                    // VariableStatement
                    Keyword(keyword) | (keyword.token.value === "var" && rest[0]) => {
                        var vsRes = enforestVarStatement(rest, context);
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
                    context.env.has(resolve(head))) {

                    // pull the macro transformer out the environment
                    var transformer = context.env.get(resolve(head)).fn;
                    // apply the transformer
                    var rt = transformer([head].concat(rest), context.env);
                    if(!Array.isArray(rt.result)) {
                        throwError("Macro transformer must return a result array, not: "
                                   + rt.result);
                    }
                    if(rt.result.length > 0) {
                        var adjustedResult = adjustLineContext(rt.result, head);
                        adjustedResult[0].token.leadingComments = head.token.leadingComments;
                        return step(adjustedResult[0], adjustedResult.slice(1).concat(rt.rest));
                    } else {
                        return step(Empty.create(), rt.rest);
                    } 
                // anon macro definition
                } else if (head.token.type === parser.Token.Identifier &&
                           head.token.value === "macro" && 
                           rest[0] && rest[0].token.value === "{}") {

                    return step(AnonMacro.create(rest[0].expose().token.inner), 
                                rest.slice(1));
                // macro definition
                } else if (head.token.type === parser.Token.Identifier &&
                           head.token.value === "macro" && rest[0] &&
                           (rest[0].token.type === parser.Token.Identifier ||
                            rest[0].token.type === parser.Token.Keyword ||
                            rest[0].token.type === parser.Token.Punctuator) &&
                           rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                           rest[1].token.value === "{}") {

                    return step(Macro.create(rest[0], rest[1].expose().token.inner),
                                rest.slice(2));
                // module definition
                } else if (head.token.value === "module" && 
                            rest[0] && rest[0].token.value === "{}") {
                    return step(Module.create(rest[0]), rest.slice(1));
                // function definition
                } else if (head.token.type === parser.Token.Keyword &&
                    head.token.value === "function" &&
                    rest[0] && rest[0].token.type === parser.Token.Identifier &&
                    rest[1] && rest[1].token.type === parser.Token.Delimiter &&
                    rest[1].token.value === "()" &&
                    rest[2] && rest[2].token.type === parser.Token.Delimiter &&
                    rest[2].token.value === "{}") {

                    rest[1].token.inner = rest[1].expose().token.inner;
                    rest[2].token.inner = rest[2].expose().token.inner;
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

                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
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
                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
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
                // export
                } else if (head.token.type === parser.Token.Identifier && 
                            head.token.value === "export" && 
                            rest[0] && (rest[0].token.type === parser.Token.Identifier ||
                                        rest[0].token.type === parser.Token.Keyword ||
                                        rest[0].token.type === parser.Token.Punctuator)) {
                    return step(Export.create(rest[0]), rest.slice(1));
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
                    return step(Delimiter.create(head.expose()), rest);
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

    function get_expression(stx, context) {
        var res = enforest(stx, context);
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
    function loadMacroDef(mac, context) {
        var body = mac.body;

        // raw function primitive form
        if(!(body[0] && body[0].token.type === parser.Token.Keyword &&
             body[0].token.value === "function")) {
            throwError("Primitive macro form must contain a function for the macro body");
        }

        var stub = parser.read("()");
        stub[0].token.inner = body;
        var expanded = expand(stub, context);
        expanded = expanded[0].destruct().concat(expanded[1].eof);
        var flattend = flatten(expanded);
        var bodyCode = codegen.generate(parser.parse(flattend));

        var macroFn = scopedEval(bodyCode, {
            makeValue: syn.makeValue,
            makeRegex: syn.makeRegex,
            makeIdent: syn.makeIdent,
            makeKeyword: syn.makeKeyword,
            makePunc: syn.makePunc,
            makeDelim: syn.makeDelim,
            unwrapSyntax: syn.unwrapSyntax,
            throwSyntaxError: syn.throwSyntaxError,
            fresh: fresh,
            _: _,
            parser: parser,
            patternModule: patternModule,
            getTemplate: function(id) {return context.templateMap.get(id);},
            applyMarkToPatternEnv: applyMarkToPatternEnv,
            mergeMatches: function(newMatch, oldMatch) {
                newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
                return newMatch;
            }
        }); 

        return macroFn;
    }

    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree (stx, context) {
        parser.assert(context, "expander context is required");

        // short circuit when syntax array is empty
        if (stx.length === 0) {
            return {
                terms: [],
                context: context
            };
        }

        parser.assert(stx[0].token, "expecting a syntax object");

        var f = enforest(stx, context);
        // head :: TermTree
        var head = f.result;
        // rest :: [Syntax]
        var rest = f.rest;

        if (head.hasPrototype(Macro)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition = loadMacroDef(head, context);

            addToDefinitionCtx([head.name], context.defscope, false);
            context.env.set(resolve(head.name), {
                fn: macroDefinition
            });

            return expandToTermTree(rest, context);
        }

        if (head.hasPrototype(LetMacro)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition = loadMacroDef(head, context);
            var freshName = fresh();
            var renamedName = head.name.rename(head.name, freshName);
            rest = _.map(rest, function(stx) {
                return stx.rename(head.name, freshName);
            });
            head.name = renamedName;

            context.env.set(resolve(head.name), {
                fn: macroDefinition
            });

            return expandToTermTree(rest, context);
        }

        if (head.hasPrototype(NamedFun)) {
            addToDefinitionCtx([head.name], context.defscope, true);
        }

        if(head.hasPrototype(Id) && head.id.token.value === "#quoteSyntax" &&
           rest[0] && rest[0].token.value === "{}") {
            var tempId = fresh();
            context.templateMap.set(tempId, rest[0].token.inner);
            return expandToTermTree([syn.makeIdent("getTemplate", head.id),
                                     syn.makeDelim("()", [syn.makeValue(tempId, head.id)], head.id)].concat(rest.slice(1)),
                                    context);
        }

        if (head.hasPrototype(VariableStatement)) {
            addToDefinitionCtx(_.map(head.decls, function(decl) { return decl.ident; }),
                               context.defscope,
                               true)
        }

        if(head.hasPrototype(Block) && head.body.hasPrototype(Delimiter)) {
            head.body.delim.token.inner.forEach(function(term) {
                if (term.hasPrototype(VariableStatement)) {
                    addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                       context.defscope,
                                       true);
                }
            });

        } 

        if(head.hasPrototype(Delimiter)) {
            head.delim.token.inner.forEach(function(term) {
                if (term.hasPrototype(VariableStatement)) {
                    addToDefinitionCtx(_.map(term.decls, function(decl) { return decl.ident; }),
                                       context.defscope,
                                       true);
                                      
                }
            });
        }

        var trees = expandToTermTree(rest, context);
        return {
            terms: [head].concat(trees.terms),
            context: trees.context
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
    function expandTermTreeToFinal (term, context) {
        parser.assert(context && context.env, "environment map is required");


        if (term.hasPrototype(ArrayLiteral)) {
            term.array.delim.token.inner = expand(term.array.delim.token.inner, context);
            return term;
        } else if (term.hasPrototype(Block)) {
            term.body.delim.token.inner = expand(term.body.delim.token.inner, context);
            return term;
        } else if (term.hasPrototype(ParenExpression)) {
            term.expr.delim.token.inner = expand(term.expr.delim.token.inner, context);
            return term;
        } else if (term.hasPrototype(Call)) {
            term.fun = expandTermTreeToFinal(term.fun, context);
            term.args = _.map(term.args, function(arg) {
                return expandTermTreeToFinal(arg, context);
            });
            return term;
        } else if (term.hasPrototype(UnaryOp)) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.hasPrototype(BinOp)) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.hasPrototype(ObjGet)) {
            term.right.delim.token.inner = expand(term.right.delim.token.inner, context);
            return term;
        } else if (term.hasPrototype(ObjDotGet)) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.hasPrototype(VariableDeclaration)) {
            if (term.init) {
                term.init = expandTermTreeToFinal(term.init, context);
            }
            return term;
        } else if (term.hasPrototype(VariableStatement)) {
            term.decls = _.map(term.decls, function(decl) {
                return expandTermTreeToFinal(decl, context);
            });
            return term;
        } else if (term.hasPrototype(Delimiter)) {
            // expand inside the delimiter and then continue on
            term.delim.token.inner = expand(term.delim.token.inner, context);
            return term;
        } else if (term.hasPrototype(NamedFun) ||
                   term.hasPrototype(AnonFun) ||
                   term.hasPrototype(CatchClause) ||
                   term.hasPrototype(Module)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef = [];
            var bodyContext = makeExpanderContext({
                env: context.env,
                defscope: newDef,
                templateMap: context.templateMap
            });

            if (term.params) {
                var params = term.params.addDefCtx(newDef);
            } else {
                var params = syn.makeDelim("()", [], null);
            }

            var bodies = term.body.addDefCtx(newDef);

            var paramNames = _.map(getParamIdentifiers(params), function(param) {
                var freshName = fresh();
                return {
                    freshName: freshName,
                    originalParam: param,
                    renamedParam: param.rename(param, freshName)
                };
            });


            // rename the function body for each of the parameters
            var renamedBody = _.reduce(paramNames, function (accBody, p) {
                return accBody.rename(p.originalParam, p.freshName)
            }, bodies);
            renamedBody = renamedBody.expose();

            var bodyTerms = expand([renamedBody], bodyContext);
            parser.assert(bodyTerms.length === 1 && bodyTerms[0].body,
                            "expecting a block in the bodyTerms");


            var renamedParams = _.map(paramNames, function(p) { return p.renamedParam; });
            var flatArgs = syn.makeDelim("()", joinSyntax(renamedParams, ","), term.params);

            var expandedArgs = expand([flatArgs], bodyContext);
            parser.assert(expandedArgs.length === 1, "should only get back one result");
            // stitch up the function with all the renamings
            if (term.params) {
                term.params = expandedArgs[0];
            }

            if (term.hasPrototype(Module)) {
                bodyTerms[0].body.delim.token.inner = _.filter(bodyTerms[0].body.delim.token.inner, function(innerTerm) {
                    if (innerTerm.hasPrototype(Export)) {
                        term.exports.push(innerTerm);
                        return false;
                    } else {
                        return true;
                    }
                });
            }

            var flattenedBody = bodyTerms[0].destruct();
            flattenedBody = _.reduce(newDef, function(acc, def) {
                return acc.rename(def.id, def.name);
            }, flattenedBody[0]);
            term.body = flattenedBody;

            // and continue expand the rest
            return term;
        }
        // the term is fine as is
        return term;
    }

    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand(stx, context) {
        parser.assert(context, "must provide an expander context");
        
        var trees = expandToTermTree(stx, context);
        return _.map(trees.terms, function(term) {
            return expandTermTreeToFinal(term, trees.context);
        })
    }

    function makeExpanderContext(o) {
        o = o || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {value: o.env || new Map(),
                  writable: false, enumerable: true, configurable: false},
            defscope: {value: o.defscope,
                       writable: false, enumerable: true, configurable: false},
            templateMap: {value: o.templateMap || new Map(),
                          writable: false, enumerable: true, configurable: false}
        });
    }

    // a hack to make the top level hygiene work out
    function expandTopLevel (stx, builtinSource) {
        var builtInEnv = new Map();
        var env = new Map();
        var params = [];
        var context, builtInContext = makeExpanderContext({env: builtInEnv});
        if (builtinSource) {
            var builtinRead = parser.read(builtinSource);

            builtinRead = [syn.makeIdent("module", null),
                            syn.makeDelim("{}", builtinRead, null)];

            var builtinRes = expand(builtinRead, builtInContext);
            params = _.map(builtinRes[0].exports, function(term) {
                return {
                    oldExport: term.name,
                    newParam: syn.makeIdent(term.name.token.value, null)
                }
            });
        }
        var modBody = syn.makeDelim("{}", stx, null);
        modBody = _.reduce(params, function(acc, param) {
            var newName = fresh();
            env.set(resolve(param.newParam.rename(param.newParam, newName)), 
                    builtInEnv.get(resolve(param.oldExport)));
            return acc.rename(param.newParam, newName);
        }, modBody);
        context = makeExpanderContext({env: env});

        var res = expand([syn.makeIdent("module", null), modBody], context);
        return flatten(res[0].body.expose().token.inner);
    }

    // break delimiter tree structure down to flat array of syntax objects
    function flatten(stx) {
        return _.reduce(stx, function(acc, stx) {
            if (stx.token.type === parser.Token.Delimiter) {
                var exposed = stx.expose();
                var openParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[0],
                    range: stx.token.startRange,
                    lineNumber: stx.token.startLineNumber,
                    sm_lineNumber: (stx.token.sm_startLineNumber 
                                    ? stx.token.sm_startLineNumber
                                    : stx.token.startLineNumber),
                    lineStart: stx.token.startLineStart,
                    sm_lineStart: (stx.token.sm_startLineStart 
                                   ? stx.token.sm_startLineStart
                                   : stx.token.startLineStart)
                }, exposed);
                var closeParen = syntaxFromToken({
                    type: parser.Token.Punctuator,
                    value: stx.token.value[1],
                    range: stx.token.endRange,
                    lineNumber: stx.token.endLineNumber,
                    sm_lineNumber: (stx.token.sm_endLineNumber
                                    ? stx.token.sm_endLineNumber
                                    : stx.token.endLineNumber),
                    lineStart: stx.token.endLineStart,
                    sm_lineStart: (stx.token.sm_endLineStart
                                    ? stx.token.sm_endLineStart
                                    : stx.token.endLineStart)
                }, exposed);
                if (stx.token.leadingComments) {
                    openParen.token.leadingComments = stx.token.leadingComments;
                }
                if (stx.token.trailingComments) {
                    openParen.token.trailingComments = stx.token.trailingComments;
                }
                return acc
                    .concat(openParen)
                    .concat(flatten(exposed.token.inner))
                    .concat(closeParen);
            }
            stx.token.sm_lineNumber = stx.token.sm_lineNumber 
                                    ? stx.token.sm_lineNumber 
                                    : stx.token.lineNumber;
            stx.token.sm_lineStart = stx.token.sm_lineStart 
                                    ? stx.token.sm_lineStart 
                                    : stx.token.lineStart;
            return acc.concat(stx);
        }, []);
    }

    exports.enforest = enforest;
    exports.expand = expandTopLevel;

    exports.resolve = resolve;
    exports.get_expression = get_expression;

    exports.makeExpanderContext = makeExpanderContext;

    exports.Expr = Expr;
    exports.VariableStatement = VariableStatement;

    exports.tokensToSyntax = syn.tokensToSyntax;
    exports.syntaxToTokens = syn.syntaxToTokens;
}));
