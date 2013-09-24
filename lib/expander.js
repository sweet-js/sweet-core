// export syntax
// export macro;
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
(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$187(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'scopedEval',
            'patterns'
        ], factory$187);
    }
}(this, function (exports$188, _$189, parser$190, syn$191, es6$192, se$193, patternModule$194, gen$195) {
    'use strict';
    var codegen$196 = gen$195 || escodegen;
    // used to export "private" methods for unit testing
    exports$188._test = {};
    // some convenience monkey patching
    Object.prototype.create = function () {
        var o$326 = Object.create(this);
        if (typeof o$326.construct === 'function') {
            o$326.construct.apply(o$326, arguments);
        }
        return o$326;
    };
    Object.prototype.extend = function (properties$327) {
        var result$328 = Object.create(this);
        for (var prop$329 in properties$327) {
            if (properties$327.hasOwnProperty(prop$329)) {
                result$328[prop$329] = properties$327[prop$329];
            }
        }
        return result$328;
    };
    Object.prototype.hasPrototype = function (proto$330) {
        function F$331() {
        }
        F$331.prototype = proto$330;
        return this instanceof F$331;
    };
    // todo: add more message information
    function throwError$255(msg$332) {
        throw new Error(msg$332);
    }
    var scopedEval$256 = se$193.scopedEval;
    var Rename$257 = syn$191.Rename;
    var Mark$258 = syn$191.Mark;
    var Var$259 = syn$191.Var;
    var Def$260 = syn$191.Def;
    var isDef$261 = syn$191.isDef;
    var isMark$262 = syn$191.isMark;
    var isRename$263 = syn$191.isRename;
    var syntaxFromToken$264 = syn$191.syntaxFromToken;
    var mkSyntax$265 = syn$191.mkSyntax;
    function remdup$266(mark$333, mlist$334) {
        if (mark$333 === _$189.first(mlist$334)) {
            return _$189.rest(mlist$334, 1);
        }
        return [mark$333].concat(mlist$334);
    }
    // (CSyntax) -> [...Num]
    function marksof$267(ctx$335, stopName$336, originalName$337) {
        var mark$338, submarks$339;
        if (isMark$262(ctx$335)) {
            mark$338 = ctx$335.mark;
            submarks$339 = marksof$267(ctx$335.context, stopName$336, originalName$337);
            return remdup$266(mark$338, submarks$339);
        }
        if (isDef$261(ctx$335)) {
            return marksof$267(ctx$335.context, stopName$336, originalName$337);
        }
        if (isRename$263(ctx$335)) {
            if (stopName$336 === originalName$337 + '$' + ctx$335.name) {
                return [];
            }
            return marksof$267(ctx$335.context, stopName$336, originalName$337);
        }
        return [];
    }
    function resolve$268(stx$340) {
        return resolveCtx$272(stx$340.token.value, stx$340.context, [], []);
    }
    function arraysEqual$269(a$341, b$342) {
        if (a$341.length !== b$342.length) {
            return false;
        }
        for (var i$343 = 0; i$343 < a$341.length; i$343++) {
            if (a$341[i$343] !== b$342[i$343]) {
                return false;
            }
        }
        return true;
    }
    function renames$270(defctx$344, oldctx$345, originalName$346) {
        var acc$347 = oldctx$345;
        for (var i$348 = 0; i$348 < defctx$344.length; i$348++) {
            if (defctx$344[i$348].id.token.value === originalName$346) {
                acc$347 = Rename$257(defctx$344[i$348].id, defctx$344[i$348].name, acc$347, defctx$344);
            }
        }
        return acc$347;
    }
    function unionEl$271(arr$349, el$350) {
        if (arr$349.indexOf(el$350) === -1) {
            var res$351 = arr$349.slice(0);
            res$351.push(el$350);
            return res$351;
        }
        return arr$349;
    }
    // (Syntax) -> String
    function resolveCtx$272(originalName$352, ctx$353, stop_spine$354, stop_branch$355) {
        if (isMark$262(ctx$353)) {
            return resolveCtx$272(originalName$352, ctx$353.context, stop_spine$354, stop_branch$355);
        }
        if (isDef$261(ctx$353)) {
            if (stop_spine$354.indexOf(ctx$353.defctx) !== -1) {
                return resolveCtx$272(originalName$352, ctx$353.context, stop_spine$354, stop_branch$355);
            } else {
                return resolveCtx$272(originalName$352, renames$270(ctx$353.defctx, ctx$353.context, originalName$352), stop_spine$354, unionEl$271(stop_branch$355, ctx$353.defctx));
            }
        }
        if (isRename$263(ctx$353)) {
            if (originalName$352 === ctx$353.id.token.value) {
                var idName$356 = resolveCtx$272(ctx$353.id.token.value, ctx$353.id.context, stop_branch$355, stop_branch$355);
                var subName$357 = resolveCtx$272(originalName$352, ctx$353.context, unionEl$271(stop_spine$354, ctx$353.def), stop_branch$355);
                if (idName$356 === subName$357) {
                    var idMarks$358 = marksof$267(ctx$353.id.context, originalName$352 + '$' + ctx$353.name, originalName$352);
                    var subMarks$359 = marksof$267(ctx$353.context, originalName$352 + '$' + ctx$353.name, originalName$352);
                    if (arraysEqual$269(idMarks$358, subMarks$359)) {
                        return originalName$352 + '$' + ctx$353.name;
                    }
                }
            }
            return resolveCtx$272(originalName$352, ctx$353.context, unionEl$271(stop_spine$354, ctx$353.def), stop_branch$355);
        }
        return originalName$352;
    }
    var nextFresh$273 = 0;
    // fun () -> Num
    function fresh$274() {
        return nextFresh$273++;
    }
    ;
    // ([...CSyntax], Str) -> [...CSyntax])
    function joinSyntax$275(tojoin$360, punc$361) {
        if (tojoin$360.length === 0) {
            return [];
        }
        if (punc$361 === ' ') {
            return tojoin$360;
        }
        return _$189.reduce(_$189.rest(tojoin$360, 1), function (acc$362, join$363) {
            return acc$362.concat(mkSyntax$265(punc$361, parser$190.Token.Punctuator, join$363), join$363);
        }, [_$189.first(tojoin$360)]);
    }
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$276(towrap$364, delimSyntax$365) {
        parser$190.assert(delimSyntax$365.token.type === parser$190.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$264({
            type: parser$190.Token.Delimiter,
            value: delimSyntax$365.token.value,
            inner: towrap$364,
            range: delimSyntax$365.token.range,
            startLineNumber: delimSyntax$365.token.startLineNumber,
            lineStart: delimSyntax$365.token.lineStart
        }, delimSyntax$365.context);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$277(argSyntax$366) {
        parser$190.assert(argSyntax$366.token.type === parser$190.Token.Delimiter, 'expecting delimiter for function params');
        return _$189.filter(argSyntax$366.token.inner, function (stx$367) {
            return stx$367.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$278 = {
            destruct: function () {
                return _$189.reduce(this.properties, _$189.bind(function (acc$368, prop$369) {
                    if (this[prop$369] && this[prop$369].hasPrototype(TermTree$278)) {
                        return acc$368.concat(this[prop$369].destruct());
                    } else if (this[prop$369] && this[prop$369].token && this[prop$369].token.inner) {
                        this[prop$369].token.inner = _$189.reduce(this[prop$369].token.inner, function (acc$370, t$371) {
                            if (t$371.hasPrototype(TermTree$278)) {
                                return acc$370.concat(t$371.destruct());
                            }
                            return acc$370.concat(t$371);
                        }, []);
                        return acc$368.concat(this[prop$369]);
                    } else if (this[prop$369]) {
                        return acc$368.concat(this[prop$369]);
                    } else {
                        return acc$368;
                    }
                }, this), []);
            }
        };
    var EOF$279 = TermTree$278.extend({
            properties: ['eof'],
            construct: function (e$372) {
                this.eof = e$372;
            }
        });
    var Statement$280 = TermTree$278.extend({
            construct: function () {
            }
        });
    var Expr$281 = TermTree$278.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$282 = Expr$281.extend({
            construct: function () {
            }
        });
    var ThisExpression$283 = PrimaryExpression$282.extend({
            properties: ['this'],
            construct: function (that$373) {
                this.this = that$373;
            }
        });
    var Lit$284 = PrimaryExpression$282.extend({
            properties: ['lit'],
            construct: function (l$374) {
                this.lit = l$374;
            }
        });
    exports$188._test.PropertyAssignment = PropertyAssignment$285;
    var PropertyAssignment$285 = TermTree$278.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$375, assignment$376) {
                this.propName = propName$375;
                this.assignment = assignment$376;
            }
        });
    var Block$286 = PrimaryExpression$282.extend({
            properties: ['body'],
            construct: function (body$377) {
                this.body = body$377;
            }
        });
    var ArrayLiteral$287 = PrimaryExpression$282.extend({
            properties: ['array'],
            construct: function (ar$378) {
                this.array = ar$378;
            }
        });
    var ParenExpression$288 = PrimaryExpression$282.extend({
            properties: ['expr'],
            construct: function (expr$379) {
                this.expr = expr$379;
            }
        });
    var UnaryOp$289 = Expr$281.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$380, expr$381) {
                this.op = op$380;
                this.expr = expr$381;
            }
        });
    var PostfixOp$290 = Expr$281.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$382, op$383) {
                this.expr = expr$382;
                this.op = op$383;
            }
        });
    var BinOp$291 = Expr$281.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$384, left$385, right$386) {
                this.op = op$384;
                this.left = left$385;
                this.right = right$386;
            }
        });
    var ConditionalExpression$292 = Expr$281.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$387, question$388, tru$389, colon$390, fls$391) {
                this.cond = cond$387;
                this.question = question$388;
                this.tru = tru$389;
                this.colon = colon$390;
                this.fls = fls$391;
            }
        });
    var Keyword$293 = TermTree$278.extend({
            properties: ['keyword'],
            construct: function (k$392) {
                this.keyword = k$392;
            }
        });
    var Punc$294 = TermTree$278.extend({
            properties: ['punc'],
            construct: function (p$393) {
                this.punc = p$393;
            }
        });
    var Delimiter$295 = TermTree$278.extend({
            properties: ['delim'],
            construct: function (d$394) {
                this.delim = d$394;
            }
        });
    var Id$296 = PrimaryExpression$282.extend({
            properties: ['id'],
            construct: function (id$395) {
                this.id = id$395;
            }
        });
    var NamedFun$297 = Expr$281.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$396, name$397, params$398, body$399) {
                this.keyword = keyword$396;
                this.name = name$397;
                this.params = params$398;
                this.body = body$399;
            }
        });
    var AnonFun$298 = Expr$281.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$400, params$401, body$402) {
                this.keyword = keyword$400;
                this.params = params$401;
                this.body = body$402;
            }
        });
    var LetMacro$299 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$403, body$404) {
                this.name = name$403;
                this.body = body$404;
            }
        });
    var Macro$300 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$405, body$406) {
                this.name = name$405;
                this.body = body$406;
            }
        });
    var AnonMacro$301 = TermTree$278.extend({
            properties: ['body'],
            construct: function (body$407) {
                this.body = body$407;
            }
        });
    var Const$302 = Expr$281.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$408, call$409) {
                this.newterm = newterm$408;
                this.call = call$409;
            }
        });
    var Call$303 = Expr$281.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$190.assert(this.fun.hasPrototype(TermTree$278), 'expecting a term tree in destruct of call');
                var that$410 = this;
                this.delim = syntaxFromToken$264(_$189.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$189.reduce(this.args, function (acc$411, term$412) {
                    parser$190.assert(term$412 && term$412.hasPrototype(TermTree$278), 'expecting term trees in destruct of Call');
                    var dst$413 = acc$411.concat(term$412.destruct());
                    // add all commas except for the last one
                    if (that$410.commas.length > 0) {
                        dst$413 = dst$413.concat(that$410.commas.shift());
                    }
                    return dst$413;
                }, []);
                return this.fun.destruct().concat(Delimiter$295.create(this.delim).destruct());
            },
            construct: function (funn$414, args$415, delim$416, commas$417) {
                parser$190.assert(Array.isArray(args$415), 'requires an array of arguments terms');
                this.fun = funn$414;
                this.args = args$415;
                this.delim = delim$416;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$417;
            }
        });
    var ObjDotGet$304 = Expr$281.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$418, dot$419, right$420) {
                this.left = left$418;
                this.dot = dot$419;
                this.right = right$420;
            }
        });
    var ObjGet$305 = Expr$281.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$421, right$422) {
                this.left = left$421;
                this.right = right$422;
            }
        });
    var VariableDeclaration$306 = TermTree$278.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$423, eqstx$424, init$425, comma$426) {
                this.ident = ident$423;
                this.eqstx = eqstx$424;
                this.init = init$425;
                this.comma = comma$426;
            }
        });
    var VariableStatement$307 = Statement$280.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$189.reduce(this.decls, function (acc$427, decl$428) {
                    return acc$427.concat(decl$428.destruct());
                }, []));
            },
            construct: function (varkw$429, decls$430) {
                parser$190.assert(Array.isArray(decls$430), 'decls must be an array');
                this.varkw = varkw$429;
                this.decls = decls$430;
            }
        });
    var CatchClause$308 = TermTree$278.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$431, params$432, body$433) {
                this.catchkw = catchkw$431;
                this.params = params$432;
                this.body = body$433;
            }
        });
    var Module$309 = TermTree$278.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$434) {
                this.body = body$434;
                this.exports = [];
            }
        });
    var Empty$310 = TermTree$278.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$311 = TermTree$278.extend({
            properties: ['name'],
            construct: function (name$435) {
                this.name = name$435;
            }
        });
    function stxIsUnaryOp$312(stx$436) {
        var staticOperators$437 = [
                '+',
                '-',
                '~',
                '!',
                'delete',
                'void',
                'typeof',
                '++',
                '--'
            ];
        return _$189.contains(staticOperators$437, stx$436.token.value);
    }
    function stxIsBinOp$313(stx$438) {
        var staticOperators$439 = [
                '+',
                '-',
                '*',
                '/',
                '%',
                '||',
                '&&',
                '|',
                '&',
                '^',
                '==',
                '!=',
                '===',
                '!==',
                '<',
                '>',
                '<=',
                '>=',
                'in',
                'instanceof',
                '<<',
                '>>',
                '>>>'
            ];
        return _$189.contains(staticOperators$439, stx$438.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$314(stx$440, env$441) {
        var decls$442 = [];
        var res$443 = enforest$316(stx$440, env$441);
        var result$444 = res$443.result;
        var rest$445 = res$443.rest;
        if (rest$445[0]) {
            var nextRes$446 = enforest$316(rest$445, env$441);
            // x = ...
            if (nextRes$446.result.hasPrototype(Punc$294) && nextRes$446.result.punc.token.value === '=') {
                var initializerRes$447 = enforest$316(nextRes$446.rest, env$441);
                if (initializerRes$447.rest[0]) {
                    var restRes$448 = enforest$316(initializerRes$447.rest, env$441);
                    // x = y + z, ...
                    if (restRes$448.result.hasPrototype(Punc$294) && restRes$448.result.punc.token.value === ',') {
                        decls$442.push(VariableDeclaration$306.create(result$444.id, nextRes$446.result.punc, initializerRes$447.result, restRes$448.result.punc));
                        var subRes$449 = enforestVarStatement$314(restRes$448.rest, env$441);
                        decls$442 = decls$442.concat(subRes$449.result);
                        rest$445 = subRes$449.rest;
                    } else {
                        decls$442.push(VariableDeclaration$306.create(result$444.id, nextRes$446.result.punc, initializerRes$447.result));
                        rest$445 = initializerRes$447.rest;    // x = y EOF
                    }
                } else {
                    decls$442.push(VariableDeclaration$306.create(result$444.id, nextRes$446.result.punc, initializerRes$447.result));    // x ,...;
                }
            } else if (nextRes$446.result.hasPrototype(Punc$294) && nextRes$446.result.punc.token.value === ',') {
                decls$442.push(VariableDeclaration$306.create(result$444.id, null, null, nextRes$446.result.punc));
                var subRes$449 = enforestVarStatement$314(nextRes$446.rest, env$441);
                decls$442 = decls$442.concat(subRes$449.result);
                rest$445 = subRes$449.rest;
            } else {
                if (result$444.hasPrototype(Id$296)) {
                    decls$442.push(VariableDeclaration$306.create(result$444.id));
                } else {
                    throwError$255('Expecting an identifier in variable declaration');
                }    // x EOF
            }
        } else {
            if (result$444.hasPrototype(Id$296)) {
                decls$442.push(VariableDeclaration$306.create(result$444.id));
            } else if (result$444.hasPrototype(BinOp$291) && result$444.op.token.value === 'in') {
                decls$442.push(VariableDeclaration$306.create(result$444.left.id, result$444.op, result$444.right));
            } else {
                throwError$255('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$442,
            rest: rest$445
        };
    }
    function adjustLineContext$315(stx$450, original$451) {
        var last$452 = stx$450[0] && typeof stx$450[0].token.range == 'undefined' ? original$451 : stx$450[0];
        return _$189.map(stx$450, function (stx$453) {
            if (typeof stx$453.token.range == 'undefined') {
                stx$453.token.range = last$452.token.range;
            }
            if (stx$453.token.type === parser$190.Token.Delimiter) {
                stx$453.token.sm_startLineNumber = original$451.token.lineNumber;
                stx$453.token.sm_endLineNumber = original$451.token.lineNumber;
                stx$453.token.sm_startLineStart = original$451.token.lineStart;
                stx$453.token.sm_endLineStart = original$451.token.lineStart;
                if (stx$453.token.inner.length > 0) {
                    stx$453.token.inner = adjustLineContext$315(stx$453.token.inner, original$451);
                }
                last$452 = stx$453;
                return stx$453;
            }
            stx$453.token.sm_lineNumber = original$451.token.lineNumber;
            stx$453.token.sm_lineStart = original$451.token.lineStart;
            last$452 = stx$453;
            return stx$453;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$316(toks$454, env$455) {
        env$455 = env$455 || new Map();
        parser$190.assert(toks$454.length > 0, 'enforest assumes there are tokens to work with');
        function step$456(head$457, rest$458) {
            var innerTokens$459;
            parser$190.assert(Array.isArray(rest$458), 'result must at least be an empty array');
            if (head$457.hasPrototype(TermTree$278)) {
                // function call
                var emp$462 = head$457.emp;
                var emp$462 = head$457.emp;
                var keyword$465 = head$457.keyword;
                var delim$467 = head$457.delim;
                var emp$462 = head$457.emp;
                var punc$470 = head$457.punc;
                var keyword$465 = head$457.keyword;
                var emp$462 = head$457.emp;
                var emp$462 = head$457.emp;
                var emp$462 = head$457.emp;
                var delim$467 = head$457.delim;
                var delim$467 = head$457.delim;
                var keyword$465 = head$457.keyword;
                var keyword$465 = head$457.keyword;
                if (head$457.hasPrototype(Expr$281) && (rest$458[0] && rest$458[0].token.type === parser$190.Token.Delimiter && rest$458[0].token.value === '()')) {
                    var argRes$495, enforestedArgs$496 = [], commas$497 = [];
                    rest$458[0].expose();
                    innerTokens$459 = rest$458[0].token.inner;
                    while (innerTokens$459.length > 0) {
                        argRes$495 = enforest$316(innerTokens$459, env$455);
                        enforestedArgs$496.push(argRes$495.result);
                        innerTokens$459 = argRes$495.rest;
                        if (innerTokens$459[0] && innerTokens$459[0].token.value === ',') {
                            commas$497.push(innerTokens$459[0]);
                            innerTokens$459 = innerTokens$459.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$498 = _$189.all(enforestedArgs$496, function (argTerm$499) {
                            return argTerm$499.hasPrototype(Expr$281);
                        });
                    if (innerTokens$459.length === 0 && argsAreExprs$498) {
                        return step$456(Call$303.create(head$457, enforestedArgs$496, rest$458[0], commas$497), rest$458.slice(1));
                    }
                } else if (head$457.hasPrototype(Expr$281) && (rest$458[0] && rest$458[0].token.value === '?')) {
                    var question$500 = rest$458[0];
                    var condRes$501 = enforest$316(rest$458.slice(1), env$455);
                    var truExpr$502 = condRes$501.result;
                    var right$503 = condRes$501.rest;
                    if (truExpr$502.hasPrototype(Expr$281) && right$503[0] && right$503[0].token.value === ':') {
                        var colon$504 = right$503[0];
                        var flsRes$505 = enforest$316(right$503.slice(1), env$455);
                        var flsExpr$506 = flsRes$505.result;
                        if (flsExpr$506.hasPrototype(Expr$281)) {
                            return step$456(ConditionalExpression$292.create(head$457, question$500, truExpr$502, colon$504, flsExpr$506), flsRes$505.rest);
                        }
                    }
                } else if (head$457.hasPrototype(Keyword$293) && (keyword$465.token.value === 'new' && rest$458[0])) {
                    var newCallRes$507 = enforest$316(rest$458, env$455);
                    if (newCallRes$507.result.hasPrototype(Call$303)) {
                        return step$456(Const$302.create(head$457, newCallRes$507.result), newCallRes$507.rest);
                    }
                } else if (head$457.hasPrototype(Delimiter$295) && delim$467.token.value === '()') {
                    innerTokens$459 = delim$467.token.inner;
                    if (innerTokens$459.length === 0) {
                        return step$456(ParenExpression$288.create(head$457), rest$458);
                    } else {
                        var innerTerm$508 = get_expression$317(innerTokens$459, env$455);
                        if (innerTerm$508.result && innerTerm$508.result.hasPrototype(Expr$281)) {
                            return step$456(ParenExpression$288.create(head$457), rest$458);
                        }
                    }
                } else if (head$457.hasPrototype(TermTree$278) && (rest$458[0] && rest$458[1] && stxIsBinOp$313(rest$458[0]))) {
                    var op$509 = rest$458[0];
                    var left$510 = head$457;
                    var bopRes$511 = enforest$316(rest$458.slice(1), env$455);
                    var right$503 = bopRes$511.result;
                    if (right$503.hasPrototype(Expr$281)) {
                        return step$456(BinOp$291.create(op$509, left$510, right$503), bopRes$511.rest);
                    }
                } else if (head$457.hasPrototype(Punc$294) && stxIsUnaryOp$312(punc$470)) {
                    var unopRes$512 = enforest$316(rest$458, env$455);
                    if (unopRes$512.result.hasPrototype(Expr$281)) {
                        return step$456(UnaryOp$289.create(punc$470, unopRes$512.result), unopRes$512.rest);
                    }
                } else if (head$457.hasPrototype(Keyword$293) && stxIsUnaryOp$312(keyword$465)) {
                    var unopRes$512 = enforest$316(rest$458, env$455);
                    if (unopRes$512.result.hasPrototype(Expr$281)) {
                        return step$456(UnaryOp$289.create(keyword$465, unopRes$512.result), unopRes$512.rest);
                    }
                } else if (head$457.hasPrototype(Expr$281) && (rest$458[0] && (rest$458[0].token.value === '++' || rest$458[0].token.value === '--'))) {
                    // Call
                    // record the comma for later
                    // but dump it for the next loop turn
                    // either there are no more tokens or
                    // they aren't a comma, either way we
                    // are done with the loop
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    // Conditional ( x ? true : false)
                    // Constructor
                    // ParenExpr
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    // if the tokens inside the paren aren't an expression
                    // we just leave it as a delimiter
                    // BinOp
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    // UnaryOp (via punctuation)
                    // UnaryOp (via keyword)
                    // Postfix
                    return step$456(PostfixOp$290.create(head$457, rest$458[0]), rest$458.slice(1));
                } else if (head$457.hasPrototype(Expr$281) && (rest$458[0] && rest$458[0].token.value === '[]')) {
                    return step$456(ObjGet$305.create(head$457, Delimiter$295.create(rest$458[0].expose())), rest$458.slice(1));
                } else if (head$457.hasPrototype(Expr$281) && (rest$458[0] && rest$458[0].token.value === '.' && rest$458[1] && rest$458[1].token.type === parser$190.Token.Identifier)) {
                    return step$456(ObjDotGet$304.create(head$457, rest$458[0], rest$458[1]), rest$458.slice(2));
                } else if (head$457.hasPrototype(Delimiter$295) && delim$467.token.value === '[]') {
                    // ArrayLiteral
                    return step$456(ArrayLiteral$287.create(head$457), rest$458);
                } else if (head$457.hasPrototype(Delimiter$295) && head$457.delim.token.value === '{}') {
                    // Block
                    return step$456(Block$286.create(head$457), rest$458);
                } else if (head$457.hasPrototype(Keyword$293) && (keyword$465.token.value === 'let' && (rest$458[0] && rest$458[0].token.type === parser$190.Token.Identifier || rest$458[0] && rest$458[0].token.type === parser$190.Token.Keyword) && rest$458[1] && rest$458[1].token.value === '=' && rest$458[2] && rest$458[2].token.value === 'macro')) {
                    var mac$513 = enforest$316(rest$458.slice(2), env$455);
                    if (!mac$513.result.hasPrototype(AnonMacro$301)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$513.result);
                    }
                    return step$456(LetMacro$299.create(rest$458[0], mac$513.result.body), mac$513.rest);
                } else if (head$457.hasPrototype(Keyword$293) && (keyword$465.token.value === 'var' && rest$458[0])) {
                    var vsRes$514 = enforestVarStatement$314(rest$458, env$455);
                    if (vsRes$514) {
                        return step$456(VariableStatement$307.create(head$457, vsRes$514.result), vsRes$514.rest);
                    }
                }
            } else {
                parser$190.assert(head$457 && head$457.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$457.token.type === parser$190.Token.Identifier || head$457.token.type === parser$190.Token.Keyword || head$457.token.type === parser$190.Token.Punctuator) && env$455.has(resolve$268(head$457))) {
                    // pull the macro transformer out the environment
                    var transformer$515 = env$455.get(resolve$268(head$457)).fn;
                    // apply the transformer
                    var rt$516 = transformer$515([head$457].concat(rest$458), env$455);
                    if (!Array.isArray(rt$516.result)) {
                        throwError$255('Macro transformer must return a result array, not: ' + rt$516.result);
                    }
                    if (rt$516.result.length > 0) {
                        var adjustedResult$517 = adjustLineContext$315(rt$516.result, head$457);
                        return step$456(adjustedResult$517[0], adjustedResult$517.slice(1).concat(rt$516.rest));
                    } else {
                        return step$456(Empty$310.create(), rt$516.rest);    // anon macro definition
                    }
                } else if (head$457.token.type === parser$190.Token.Identifier && head$457.token.value === 'macro' && rest$458[0] && rest$458[0].token.value === '{}') {
                    return step$456(AnonMacro$301.create(rest$458[0].expose().token.inner), rest$458.slice(1));
                } else if (head$457.token.type === parser$190.Token.Identifier && head$457.token.value === 'macro' && rest$458[0] && (rest$458[0].token.type === parser$190.Token.Identifier || rest$458[0].token.type === parser$190.Token.Keyword || rest$458[0].token.type === parser$190.Token.Punctuator) && rest$458[1] && rest$458[1].token.type === parser$190.Token.Delimiter && rest$458[1].token.value === '{}') {
                    return step$456(Macro$300.create(rest$458[0], rest$458[1].expose().token.inner), rest$458.slice(2));
                } else if (head$457.token.value === 'module' && rest$458[0] && rest$458[0].token.value === '{}') {
                    return step$456(Module$309.create(rest$458[0]), rest$458.slice(1));
                } else if (head$457.token.type === parser$190.Token.Keyword && head$457.token.value === 'function' && rest$458[0] && rest$458[0].token.type === parser$190.Token.Identifier && rest$458[1] && rest$458[1].token.type === parser$190.Token.Delimiter && rest$458[1].token.value === '()' && rest$458[2] && rest$458[2].token.type === parser$190.Token.Delimiter && rest$458[2].token.value === '{}') {
                    rest$458[1].token.inner = rest$458[1].expose().token.inner;
                    rest$458[2].token.inner = rest$458[2].expose().token.inner;
                    return step$456(NamedFun$297.create(head$457, rest$458[0], rest$458[1], rest$458[2]), rest$458.slice(3));
                } else if (head$457.token.type === parser$190.Token.Keyword && head$457.token.value === 'function' && rest$458[0] && rest$458[0].token.type === parser$190.Token.Delimiter && rest$458[0].token.value === '()' && rest$458[1] && rest$458[1].token.type === parser$190.Token.Delimiter && rest$458[1].token.value === '{}') {
                    rest$458[0].token.inner = rest$458[0].expose().token.inner;
                    rest$458[1].token.inner = rest$458[1].expose().token.inner;
                    return step$456(AnonFun$298.create(head$457, rest$458[0], rest$458[1]), rest$458.slice(2));
                } else if (head$457.token.type === parser$190.Token.Keyword && head$457.token.value === 'catch' && rest$458[0] && rest$458[0].token.type === parser$190.Token.Delimiter && rest$458[0].token.value === '()' && rest$458[1] && rest$458[1].token.type === parser$190.Token.Delimiter && rest$458[1].token.value === '{}') {
                    rest$458[0].token.inner = rest$458[0].expose().token.inner;
                    rest$458[1].token.inner = rest$458[1].expose().token.inner;
                    return step$456(CatchClause$308.create(head$457, rest$458[0], rest$458[1]), rest$458.slice(2));
                } else if (head$457.token.type === parser$190.Token.Keyword && head$457.token.value === 'this') {
                    return step$456(ThisExpression$283.create(head$457), rest$458);
                } else if (head$457.token.type === parser$190.Token.NumericLiteral || head$457.token.type === parser$190.Token.StringLiteral || head$457.token.type === parser$190.Token.BooleanLiteral || head$457.token.type === parser$190.Token.RegexLiteral || head$457.token.type === parser$190.Token.NullLiteral) {
                    return step$456(Lit$284.create(head$457), rest$458);
                } else if (head$457.token.type === parser$190.Token.Identifier && head$457.token.value === 'export' && rest$458[0] && (rest$458[0].token.type === parser$190.Token.Identifier || rest$458[0].token.type === parser$190.Token.Keyword || rest$458[0].token.type === parser$190.Token.Punctuator)) {
                    return step$456(Export$311.create(rest$458[0]), rest$458.slice(1));
                } else if (head$457.token.type === parser$190.Token.Identifier) {
                    return step$456(Id$296.create(head$457), rest$458);
                } else if (head$457.token.type === parser$190.Token.Punctuator) {
                    return step$456(Punc$294.create(head$457), rest$458);
                } else if (head$457.token.type === parser$190.Token.Keyword && head$457.token.value === 'with') {
                    throwError$255('with is not supported in sweet.js');
                } else if (head$457.token.type === parser$190.Token.Keyword) {
                    return step$456(Keyword$293.create(head$457), rest$458);
                } else if (head$457.token.type === parser$190.Token.Delimiter) {
                    return step$456(Delimiter$295.create(head$457.expose()), rest$458);
                } else if (head$457.token.type === parser$190.Token.EOF) {
                    parser$190.assert(rest$458.length === 0, 'nothing should be after an EOF');
                    return step$456(EOF$279.create(head$457), []);
                } else {
                    // todo: are we missing cases?
                    parser$190.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$457,
                rest: rest$458
            };
        }
        return step$456(toks$454[0], toks$454.slice(1));
    }
    function get_expression$317(stx$518, env$519) {
        var res$520 = enforest$316(stx$518, env$519);
        if (!res$520.result.hasPrototype(Expr$281)) {
            return {
                result: null,
                rest: stx$518
            };
        }
        return res$520;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$318(newMark$521, env$522) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$523(match$524) {
            if (match$524.level === 0) {
                // replace the match property with the marked syntax
                match$524.match = _$189.map(match$524.match, function (stx$525) {
                    return stx$525.mark(newMark$521);
                });
            } else {
                _$189.each(match$524.match, function (match$526) {
                    dfs$523(match$526);
                });
            }
        }
        _$189.keys(env$522).forEach(function (key$527) {
            dfs$523(env$522[key$527]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$319(mac$528, env$529, defscope$530, templateMap$531) {
        var body$532 = mac$528.body;
        // raw function primitive form
        if (!(body$532[0] && body$532[0].token.type === parser$190.Token.Keyword && body$532[0].token.value === 'function')) {
            throwError$255('Primitive macro form must contain a function for the macro body');
        }
        var stub$533 = parser$190.read('()')[0];
        stub$533[0].token.inner = body$532;
        var expanded$534 = expand$323(stub$533, env$529, defscope$530, templateMap$531);
        expanded$534 = expanded$534[0].destruct().concat(expanded$534[1].eof);
        var flattend$535 = flatten$325(expanded$534);
        var bodyCode$536 = codegen$196.generate(parser$190.parse(flattend$535));
        var macroFn$537 = scopedEval$256(bodyCode$536, {
                makeValue: syn$191.makeValue,
                makeRegex: syn$191.makeRegex,
                makeIdent: syn$191.makeIdent,
                makeKeyword: syn$191.makeKeyword,
                makePunc: syn$191.makePunc,
                makeDelim: syn$191.makeDelim,
                unwrapSyntax: syn$191.unwrapSyntax,
                fresh: fresh$274,
                _: _$189,
                parser: parser$190,
                patternModule: patternModule$194,
                getTemplate: function (id$538) {
                    return templateMap$531.get(id$538);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$318,
                mergeMatches: function (newMatch$539, oldMatch$540) {
                    newMatch$539.patternEnv = _$189.extend({}, oldMatch$540.patternEnv, newMatch$539.patternEnv);
                    return newMatch$539;
                }
            });
        return macroFn$537;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$320(stx$541, env$542, defscope$543, templateMap$544) {
        parser$190.assert(env$542, 'environment map is required');
        // short circuit when syntax array is empty
        if (stx$541.length === 0) {
            return {
                terms: [],
                env: env$542
            };
        }
        parser$190.assert(stx$541[0].token, 'expecting a syntax object');
        var f$545 = enforest$316(stx$541, env$542);
        // head :: TermTree
        var head$546 = f$545.result;
        // rest :: [Syntax]
        var rest$547 = f$545.rest;
        if (head$546.hasPrototype(Macro$300)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$549 = loadMacroDef$319(head$546, env$542, defscope$543, templateMap$544);
            addToDefinitionCtx$321([head$546.name], defscope$543, false);
            env$542.set(resolve$268(head$546.name), { fn: macroDefinition$549 });
            return expandToTermTree$320(rest$547, env$542, defscope$543, templateMap$544);
        }
        if (head$546.hasPrototype(LetMacro$299)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$549 = loadMacroDef$319(head$546, env$542, defscope$543, templateMap$544);
            var freshName$550 = fresh$274();
            var renamedName$551 = head$546.name.rename(head$546.name, freshName$550);
            rest$547 = _$189.map(rest$547, function (stx$552) {
                return stx$552.rename(head$546.name, freshName$550);
            });
            head$546.name = renamedName$551;
            env$542.set(resolve$268(head$546.name), { fn: macroDefinition$549 });
            return expandToTermTree$320(rest$547, env$542, defscope$543, templateMap$544);
        }
        if (head$546.hasPrototype(NamedFun$297)) {
            addToDefinitionCtx$321([head$546.name], defscope$543, true);
        }
        if (head$546.hasPrototype(Id$296) && head$546.id.token.value === '#quoteSyntax' && rest$547[0] && rest$547[0].token.value === '{}') {
            var tempId$553 = fresh$274();
            templateMap$544.set(tempId$553, rest$547[0].token.inner);
            return expandToTermTree$320([
                syn$191.makeIdent('getTemplate', head$546.id),
                syn$191.makeDelim('()', [syn$191.makeValue(tempId$553, head$546.id)], head$546.id)
            ].concat(rest$547.slice(1)), env$542, defscope$543, templateMap$544);
        }
        if (head$546.hasPrototype(VariableStatement$307)) {
            addToDefinitionCtx$321(_$189.map(head$546.decls, function (decl$554) {
                return decl$554.ident;
            }), defscope$543, true);
        }
        if (head$546.hasPrototype(Block$286) && head$546.body.hasPrototype(Delimiter$295)) {
            head$546.body.delim.token.inner.forEach(function (term$555) {
                if (term$555.hasPrototype(VariableStatement$307)) {
                    addToDefinitionCtx$321(_$189.map(term$555.decls, function (decl$556) {
                        return decl$556.ident;
                    }), defscope$543, true);
                }
            });
        }
        if (head$546.hasPrototype(Delimiter$295)) {
            head$546.delim.token.inner.forEach(function (term$557) {
                if (term$557.hasPrototype(VariableStatement$307)) {
                    addToDefinitionCtx$321(_$189.map(term$557.decls, function (decl$558) {
                        return decl$558.ident;
                    }), defscope$543, true);
                }
            });
        }
        var trees$548 = expandToTermTree$320(rest$547, env$542, defscope$543, templateMap$544);
        return {
            terms: [head$546].concat(trees$548.terms),
            env: trees$548.env
        };
    }
    function addToDefinitionCtx$321(idents$559, defscope$560, skipRep$561) {
        parser$190.assert(idents$559 && idents$559.length > 0, 'expecting some variable identifiers');
        skipRep$561 = skipRep$561 || false;
        _$189.each(idents$559, function (id$562) {
            var skip$563 = false;
            if (skipRep$561) {
                var declRepeat$564 = _$189.find(defscope$560, function (def$565) {
                        return def$565.id.token.value === id$562.token.value && arraysEqual$269(marksof$267(def$565.id.context), marksof$267(id$562.context));
                    });
                skip$563 = typeof declRepeat$564 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$563) {
                var name$566 = fresh$274();
                defscope$560.push({
                    id: id$562,
                    name: name$566
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$322(term$567, env$568, defscope$569, templateMap$570) {
        parser$190.assert(env$568, 'environment map is required');
        if (term$567.hasPrototype(ArrayLiteral$287)) {
            term$567.array.delim.token.inner = expand$323(term$567.array.delim.token.inner, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(Block$286)) {
            term$567.body.delim.token.inner = expand$323(term$567.body.delim.token.inner, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(ParenExpression$288)) {
            term$567.expr.delim.token.inner = expand$323(term$567.expr.delim.token.inner, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(Call$303)) {
            term$567.fun = expandTermTreeToFinal$322(term$567.fun, env$568, defscope$569, templateMap$570);
            term$567.args = _$189.map(term$567.args, function (arg$571) {
                return expandTermTreeToFinal$322(arg$571, env$568, defscope$569, templateMap$570);
            });
            return term$567;
        } else if (term$567.hasPrototype(UnaryOp$289)) {
            term$567.expr = expandTermTreeToFinal$322(term$567.expr, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(BinOp$291)) {
            term$567.left = expandTermTreeToFinal$322(term$567.left, env$568, defscope$569, templateMap$570);
            term$567.right = expandTermTreeToFinal$322(term$567.right, env$568, defscope$569);
            return term$567;
        } else if (term$567.hasPrototype(ObjGet$305)) {
            term$567.right.delim.token.inner = expand$323(term$567.right.delim.token.inner, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(ObjDotGet$304)) {
            term$567.left = expandTermTreeToFinal$322(term$567.left, env$568, defscope$569, templateMap$570);
            term$567.right = expandTermTreeToFinal$322(term$567.right, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(VariableDeclaration$306)) {
            if (term$567.init) {
                term$567.init = expandTermTreeToFinal$322(term$567.init, env$568, defscope$569, templateMap$570);
            }
            return term$567;
        } else if (term$567.hasPrototype(VariableStatement$307)) {
            term$567.decls = _$189.map(term$567.decls, function (decl$572) {
                return expandTermTreeToFinal$322(decl$572, env$568, defscope$569, templateMap$570);
            });
            return term$567;
        } else if (term$567.hasPrototype(Delimiter$295)) {
            // expand inside the delimiter and then continue on
            term$567.delim.token.inner = expand$323(term$567.delim.token.inner, env$568, defscope$569, templateMap$570);
            return term$567;
        } else if (term$567.hasPrototype(NamedFun$297) || term$567.hasPrototype(AnonFun$298) || term$567.hasPrototype(CatchClause$308) || term$567.hasPrototype(Module$309)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$573 = [];
            if (term$567.params) {
                var params$582 = term$567.params.addDefCtx(newDef$573);
            } else {
                var params$582 = syn$191.makeDelim('()', [], null);
            }
            var bodies$574 = term$567.body.addDefCtx(newDef$573);
            var paramNames$575 = _$189.map(getParamIdentifiers$277(params$582), function (param$583) {
                    var freshName$584 = fresh$274();
                    return {
                        freshName: freshName$584,
                        originalParam: param$583,
                        renamedParam: param$583.rename(param$583, freshName$584)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$576 = _$189.reduce(paramNames$575, function (accBody$585, p$586) {
                    return accBody$585.rename(p$586.originalParam, p$586.freshName);
                }, bodies$574);
            renamedBody$576 = renamedBody$576.expose();
            var bodyTerms$577 = expand$323([renamedBody$576], env$568, newDef$573, templateMap$570);
            parser$190.assert(bodyTerms$577.length === 1 && bodyTerms$577[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$578 = _$189.map(paramNames$575, function (p$587) {
                    return p$587.renamedParam;
                });
            var flatArgs$579 = syn$191.makeDelim('()', joinSyntax$275(renamedParams$578, ','), term$567.params);
            var expandedArgs$580 = expand$323([flatArgs$579], env$568, newDef$573, templateMap$570);
            parser$190.assert(expandedArgs$580.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            term$567.params = expandedArgs$580[0];
            if (term$567.hasPrototype(Module$309)) {
                bodyTerms$577[0].body.delim.token.inner = _$189.filter(bodyTerms$577[0].body.delim.token.inner, function (innerTerm$588) {
                    if (innerTerm$588.hasPrototype(Export$311)) {
                        term$567.exports.push(innerTerm$588);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            var flattenedBody$581 = bodyTerms$577[0].destruct();
            flattenedBody$581 = _$189.reduce(newDef$573, function (acc$589, def$590) {
                return acc$589.rename(def$590.id, def$590.name);
            }, flattenedBody$581[0]);
            term$567.body = flattenedBody$581;
            // and continue expand the rest
            return term$567;
        }
        // the term is fine as is
        return term$567;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$323(stx$591, env$592, defscope$593, templateMap$594) {
        env$592 = env$592 || new Map();
        templateMap$594 = templateMap$594 || new Map();
        var trees$595 = expandToTermTree$320(stx$591, env$592, defscope$593, templateMap$594);
        return _$189.map(trees$595.terms, function (term$596) {
            return expandTermTreeToFinal$322(term$596, trees$595.env, defscope$593, templateMap$594);
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$324(stx$597, builtinSource$598) {
        var buildinEnv$599 = new Map();
        var env$600 = new Map();
        var params$601 = [];
        if (builtinSource$598) {
            var builtinRead$604 = parser$190.read(builtinSource$598)[0];
            builtinRead$604 = [
                syn$191.makeIdent('module', null),
                syn$191.makeDelim('{}', builtinRead$604, null)
            ];
            var builtinRes$605 = expand$323(builtinRead$604, buildinEnv$599);
            params$601 = _$189.map(builtinRes$605[0].exports, function (term$606) {
                return {
                    oldExport: term$606.name,
                    newParam: syn$191.makeIdent(term$606.name.token.value, null)
                };
            });
        }
        var modBody$602 = syn$191.makeDelim('{}', stx$597, null);
        modBody$602 = _$189.reduce(params$601, function (acc$607, param$608) {
            var newName$609 = fresh$274();
            env$600.set(resolve$268(param$608.newParam.rename(param$608.newParam, newName$609)), buildinEnv$599.get(resolve$268(param$608.oldExport)));
            return acc$607.rename(param$608.newParam, newName$609);
        }, modBody$602);
        var res$603 = expand$323([
                syn$191.makeIdent('module', null),
                modBody$602
            ], env$600);
        return flatten$325(res$603[0].body.token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$325(stx$610) {
        return _$189.reduce(stx$610, function (acc$611, stx$612) {
            if (stx$612.token.type === parser$190.Token.Delimiter) {
                var exposed$613 = stx$612.expose();
                var openParen$614 = syntaxFromToken$264({
                        type: parser$190.Token.Punctuator,
                        value: stx$612.token.value[0],
                        range: stx$612.token.startRange,
                        lineNumber: stx$612.token.startLineNumber,
                        sm_lineNumber: stx$612.token.sm_startLineNumber ? stx$612.token.sm_startLineNumber : stx$612.token.startLineNumber,
                        lineStart: stx$612.token.startLineStart,
                        sm_lineStart: stx$612.token.sm_startLineStart ? stx$612.token.sm_startLineStart : stx$612.token.startLineStart
                    }, exposed$613.context);
                var closeParen$615 = syntaxFromToken$264({
                        type: parser$190.Token.Punctuator,
                        value: stx$612.token.value[1],
                        range: stx$612.token.endRange,
                        lineNumber: stx$612.token.endLineNumber,
                        sm_lineNumber: stx$612.token.sm_endLineNumber ? stx$612.token.sm_endLineNumber : stx$612.token.endLineNumber,
                        lineStart: stx$612.token.endLineStart,
                        sm_lineStart: stx$612.token.sm_endLineStart ? stx$612.token.sm_endLineStart : stx$612.token.endLineStart
                    }, exposed$613.context);
                return acc$611.concat(openParen$614).concat(flatten$325(exposed$613.token.inner)).concat(closeParen$615);
            }
            stx$612.token.sm_lineNumber = stx$612.token.sm_lineNumber ? stx$612.token.sm_lineNumber : stx$612.token.lineNumber;
            stx$612.token.sm_lineStart = stx$612.token.sm_lineStart ? stx$612.token.sm_lineStart : stx$612.token.lineStart;
            return acc$611.concat(stx$612);
        }, []);
    }
    exports$188.enforest = enforest$316;
    exports$188.expand = expandTopLevel$324;
    exports$188.resolve = resolve$268;
    exports$188.get_expression = get_expression$317;
    exports$188.Expr = Expr$281;
    exports$188.VariableStatement = VariableStatement$307;
    exports$188.tokensToSyntax = syn$191.tokensToSyntax;
    exports$188.syntaxToTokens = syn$191.syntaxToTokens;
}));