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
(function (root$121, factory$122) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$122(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$122);
    }
}(this, function (exports$123, _$124, parser$125, syn$126, es6$127, se$128, patternModule$129, gen$130) {
    'use strict';
    var codegen$131 = gen$130 || escodegen;
    // used to export "private" methods for unit testing
    exports$123._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$287 = Object.create(this);
                if (typeof o$287.construct === 'function') {
                    o$287.construct.apply(o$287, arguments);
                }
                return o$287;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$288) {
                var result$289 = Object.create(this);
                for (var prop$290 in properties$288) {
                    if (properties$288.hasOwnProperty(prop$290)) {
                        result$289[prop$290] = properties$288[prop$290];
                    }
                }
                return result$289;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$291) {
                function F$292() {
                }
                F$292.prototype = proto$291;
                return this instanceof F$292;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$215(msg$293) {
        throw new Error(msg$293);
    }
    var scopedEval$216 = se$128.scopedEval;
    var Rename$217 = syn$126.Rename;
    var Mark$218 = syn$126.Mark;
    var Var$219 = syn$126.Var;
    var Def$220 = syn$126.Def;
    var isDef$221 = syn$126.isDef;
    var isMark$222 = syn$126.isMark;
    var isRename$223 = syn$126.isRename;
    var syntaxFromToken$224 = syn$126.syntaxFromToken;
    var joinSyntax$225 = syn$126.joinSyntax;
    function remdup$226(mark$294, mlist$295) {
        if (mark$294 === _$124.first(mlist$295)) {
            return _$124.rest(mlist$295, 1);
        }
        return [mark$294].concat(mlist$295);
    }
    // (CSyntax) -> [...Num]
    function marksof$227(ctx$296, stopName$297, originalName$298) {
        var mark$299, submarks$300;
        if (isMark$222(ctx$296)) {
            mark$299 = ctx$296.mark;
            submarks$300 = marksof$227(ctx$296.context, stopName$297, originalName$298);
            return remdup$226(mark$299, submarks$300);
        }
        if (isDef$221(ctx$296)) {
            return marksof$227(ctx$296.context, stopName$297, originalName$298);
        }
        if (isRename$223(ctx$296)) {
            if (stopName$297 === originalName$298 + '$' + ctx$296.name) {
                return [];
            }
            return marksof$227(ctx$296.context, stopName$297, originalName$298);
        }
        return [];
    }
    function resolve$228(stx$301) {
        return resolveCtx$232(stx$301.token.value, stx$301.context, [], []);
    }
    function arraysEqual$229(a$302, b$303) {
        if (a$302.length !== b$303.length) {
            return false;
        }
        for (var i$304 = 0; i$304 < a$302.length; i$304++) {
            if (a$302[i$304] !== b$303[i$304]) {
                return false;
            }
        }
        return true;
    }
    function renames$230(defctx$305, oldctx$306, originalName$307) {
        var acc$308 = oldctx$306;
        for (var i$309 = 0; i$309 < defctx$305.length; i$309++) {
            if (defctx$305[i$309].id.token.value === originalName$307) {
                acc$308 = Rename$217(defctx$305[i$309].id, defctx$305[i$309].name, acc$308, defctx$305);
            }
        }
        return acc$308;
    }
    function unionEl$231(arr$310, el$311) {
        if (arr$310.indexOf(el$311) === -1) {
            var res$312 = arr$310.slice(0);
            res$312.push(el$311);
            return res$312;
        }
        return arr$310;
    }
    // (Syntax) -> String
    function resolveCtx$232(originalName$313, ctx$314, stop_spine$315, stop_branch$316) {
        if (isMark$222(ctx$314)) {
            return resolveCtx$232(originalName$313, ctx$314.context, stop_spine$315, stop_branch$316);
        }
        if (isDef$221(ctx$314)) {
            if (stop_spine$315.indexOf(ctx$314.defctx) !== -1) {
                return resolveCtx$232(originalName$313, ctx$314.context, stop_spine$315, stop_branch$316);
            } else {
                return resolveCtx$232(originalName$313, renames$230(ctx$314.defctx, ctx$314.context, originalName$313), stop_spine$315, unionEl$231(stop_branch$316, ctx$314.defctx));
            }
        }
        if (isRename$223(ctx$314)) {
            if (originalName$313 === ctx$314.id.token.value) {
                var idName$317 = resolveCtx$232(ctx$314.id.token.value, ctx$314.id.context, stop_branch$316, stop_branch$316);
                var subName$318 = resolveCtx$232(originalName$313, ctx$314.context, unionEl$231(stop_spine$315, ctx$314.def), stop_branch$316);
                if (idName$317 === subName$318) {
                    var idMarks$319 = marksof$227(ctx$314.id.context, originalName$313 + '$' + ctx$314.name, originalName$313);
                    var subMarks$320 = marksof$227(ctx$314.context, originalName$313 + '$' + ctx$314.name, originalName$313);
                    if (arraysEqual$229(idMarks$319, subMarks$320)) {
                        return originalName$313 + '$' + ctx$314.name;
                    }
                }
            }
            return resolveCtx$232(originalName$313, ctx$314.context, stop_spine$315, stop_branch$316);
        }
        return originalName$313;
    }
    var nextFresh$233 = 0;
    // fun () -> Num
    function fresh$234() {
        return nextFresh$233++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$235(towrap$321, delimSyntax$322) {
        parser$125.assert(delimSyntax$322.token.type === parser$125.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$224({
            type: parser$125.Token.Delimiter,
            value: delimSyntax$322.token.value,
            inner: towrap$321,
            range: delimSyntax$322.token.range,
            startLineNumber: delimSyntax$322.token.startLineNumber,
            lineStart: delimSyntax$322.token.lineStart
        }, delimSyntax$322);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$236(argSyntax$323) {
        parser$125.assert(argSyntax$323.token.type === parser$125.Token.Delimiter, 'expecting delimiter for function params');
        return _$124.filter(argSyntax$323.token.inner, function (stx$324) {
            return stx$324.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$237 = {
            destruct: function () {
                return _$124.reduce(this.properties, _$124.bind(function (acc$325, prop$326) {
                    if (this[prop$326] && this[prop$326].hasPrototype(TermTree$237)) {
                        return acc$325.concat(this[prop$326].destruct());
                    } else if (this[prop$326] && this[prop$326].token && this[prop$326].token.inner) {
                        this[prop$326].token.inner = _$124.reduce(this[prop$326].token.inner, function (acc$327, t$328) {
                            if (t$328.hasPrototype(TermTree$237)) {
                                return acc$327.concat(t$328.destruct());
                            }
                            return acc$327.concat(t$328);
                        }, []);
                        return acc$325.concat(this[prop$326]);
                    } else if (this[prop$326]) {
                        return acc$325.concat(this[prop$326]);
                    } else {
                        return acc$325;
                    }
                }, this), []);
            },
            addDefCtx: function (def$329) {
                for (var i$330 = 0; i$330 < this.properties.length; i$330++) {
                    var prop$331 = this.properties[i$330];
                    if (Array.isArray(this[prop$331])) {
                        this[prop$331] = _$124.map(this[prop$331], function (item$332) {
                            return item$332.addDefCtx(def$329);
                        });
                    } else if (this[prop$331]) {
                        this[prop$331] = this[prop$331].addDefCtx(def$329);
                    }
                }
                return this;
            }
        };
    var EOF$238 = TermTree$237.extend({
            properties: ['eof'],
            construct: function (e$333) {
                this.eof = e$333;
            }
        });
    var Statement$239 = TermTree$237.extend({
            construct: function () {
            }
        });
    var Expr$240 = TermTree$237.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$241 = Expr$240.extend({
            construct: function () {
            }
        });
    var ThisExpression$242 = PrimaryExpression$241.extend({
            properties: ['this'],
            construct: function (that$334) {
                this.this = that$334;
            }
        });
    var Lit$243 = PrimaryExpression$241.extend({
            properties: ['lit'],
            construct: function (l$335) {
                this.lit = l$335;
            }
        });
    exports$123._test.PropertyAssignment = PropertyAssignment$244;
    var PropertyAssignment$244 = TermTree$237.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$336, assignment$337) {
                this.propName = propName$336;
                this.assignment = assignment$337;
            }
        });
    var Block$245 = PrimaryExpression$241.extend({
            properties: ['body'],
            construct: function (body$338) {
                this.body = body$338;
            }
        });
    var ArrayLiteral$246 = PrimaryExpression$241.extend({
            properties: ['array'],
            construct: function (ar$339) {
                this.array = ar$339;
            }
        });
    var ParenExpression$247 = PrimaryExpression$241.extend({
            properties: ['expr'],
            construct: function (expr$340) {
                this.expr = expr$340;
            }
        });
    var UnaryOp$248 = Expr$240.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$341, expr$342) {
                this.op = op$341;
                this.expr = expr$342;
            }
        });
    var PostfixOp$249 = Expr$240.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$343, op$344) {
                this.expr = expr$343;
                this.op = op$344;
            }
        });
    var BinOp$250 = Expr$240.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$345, left$346, right$347) {
                this.op = op$345;
                this.left = left$346;
                this.right = right$347;
            }
        });
    var ConditionalExpression$251 = Expr$240.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$348, question$349, tru$350, colon$351, fls$352) {
                this.cond = cond$348;
                this.question = question$349;
                this.tru = tru$350;
                this.colon = colon$351;
                this.fls = fls$352;
            }
        });
    var Keyword$252 = TermTree$237.extend({
            properties: ['keyword'],
            construct: function (k$353) {
                this.keyword = k$353;
            }
        });
    var Punc$253 = TermTree$237.extend({
            properties: ['punc'],
            construct: function (p$354) {
                this.punc = p$354;
            }
        });
    var Delimiter$254 = TermTree$237.extend({
            properties: ['delim'],
            construct: function (d$355) {
                this.delim = d$355;
            }
        });
    var Id$255 = PrimaryExpression$241.extend({
            properties: ['id'],
            construct: function (id$356) {
                this.id = id$356;
            }
        });
    var NamedFun$256 = Expr$240.extend({
            properties: [
                'keyword',
                '*',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$357, star$358, name$359, params$360, body$361) {
                this.keyword = keyword$357;
                this.star = star$358;
                this.name = name$359;
                this.params = params$360;
                this.body = body$361;
            }
        });
    var AnonFun$257 = Expr$240.extend({
            properties: [
                'keyword',
                'start',
                'params',
                'body'
            ],
            construct: function (keyword$362, star$363, params$364, body$365) {
                this.keyword = keyword$362;
                this.star = star$363;
                this.params = params$364;
                this.body = body$365;
            }
        });
    var LetMacro$258 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$366, body$367) {
                this.name = name$366;
                this.body = body$367;
            }
        });
    var Macro$259 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$368, body$369) {
                this.name = name$368;
                this.body = body$369;
            }
        });
    var AnonMacro$260 = TermTree$237.extend({
            properties: ['body'],
            construct: function (body$370) {
                this.body = body$370;
            }
        });
    var Const$261 = Expr$240.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$371, call$372) {
                this.newterm = newterm$371;
                this.call = call$372;
            }
        });
    var Call$262 = Expr$240.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$125.assert(this.fun.hasPrototype(TermTree$237), 'expecting a term tree in destruct of call');
                var that$373 = this;
                this.delim = syntaxFromToken$224(_$124.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$124.reduce(this.args, function (acc$374, term$375) {
                    parser$125.assert(term$375 && term$375.hasPrototype(TermTree$237), 'expecting term trees in destruct of Call');
                    var dst$376 = acc$374.concat(term$375.destruct());
                    // add all commas except for the last one
                    if (that$373.commas.length > 0) {
                        dst$376 = dst$376.concat(that$373.commas.shift());
                    }
                    return dst$376;
                }, []);
                return this.fun.destruct().concat(Delimiter$254.create(this.delim).destruct());
            },
            construct: function (funn$377, args$378, delim$379, commas$380) {
                parser$125.assert(Array.isArray(args$378), 'requires an array of arguments terms');
                this.fun = funn$377;
                this.args = args$378;
                this.delim = delim$379;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$380;
            }
        });
    var ObjDotGet$263 = Expr$240.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$381, dot$382, right$383) {
                this.left = left$381;
                this.dot = dot$382;
                this.right = right$383;
            }
        });
    var ObjGet$264 = Expr$240.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$384, right$385) {
                this.left = left$384;
                this.right = right$385;
            }
        });
    var VariableDeclaration$265 = TermTree$237.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$386, eqstx$387, init$388, comma$389) {
                this.ident = ident$386;
                this.eqstx = eqstx$387;
                this.init = init$388;
                this.comma = comma$389;
            }
        });
    var VariableStatement$266 = Statement$239.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$124.reduce(this.decls, function (acc$390, decl$391) {
                    return acc$390.concat(decl$391.destruct());
                }, []));
            },
            construct: function (varkw$392, decls$393) {
                parser$125.assert(Array.isArray(decls$393), 'decls must be an array');
                this.varkw = varkw$392;
                this.decls = decls$393;
            }
        });
    var CatchClause$267 = TermTree$237.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$394, params$395, body$396) {
                this.catchkw = catchkw$394;
                this.params = params$395;
                this.body = body$396;
            }
        });
    var Module$268 = TermTree$237.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$397) {
                this.body = body$397;
                this.exports = [];
            }
        });
    var Empty$269 = TermTree$237.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$270 = TermTree$237.extend({
            properties: ['name'],
            construct: function (name$398) {
                this.name = name$398;
            }
        });
    function stxIsUnaryOp$271(stx$399) {
        var staticOperators$400 = [
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
        return _$124.contains(staticOperators$400, stx$399.token.value);
    }
    function stxIsBinOp$272(stx$401) {
        var staticOperators$402 = [
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
        return _$124.contains(staticOperators$402, stx$401.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$273(stx$403, context$404) {
        var decls$405 = [];
        var res$406 = enforest$275(stx$403, context$404);
        var result$407 = res$406.result;
        var rest$408 = res$406.rest;
        if (rest$408[0]) {
            var nextRes$409 = enforest$275(rest$408, context$404);
            // x = ...
            if (nextRes$409.result.hasPrototype(Punc$253) && nextRes$409.result.punc.token.value === '=') {
                var initializerRes$410 = enforest$275(nextRes$409.rest, context$404);
                if (initializerRes$410.rest[0]) {
                    var restRes$411 = enforest$275(initializerRes$410.rest, context$404);
                    // x = y + z, ...
                    if (restRes$411.result.hasPrototype(Punc$253) && restRes$411.result.punc.token.value === ',') {
                        decls$405.push(VariableDeclaration$265.create(result$407.id, nextRes$409.result.punc, initializerRes$410.result, restRes$411.result.punc));
                        var subRes$412 = enforestVarStatement$273(restRes$411.rest, context$404);
                        decls$405 = decls$405.concat(subRes$412.result);
                        rest$408 = subRes$412.rest;
                    }    // x = y ...
                    else {
                        decls$405.push(VariableDeclaration$265.create(result$407.id, nextRes$409.result.punc, initializerRes$410.result));
                        rest$408 = initializerRes$410.rest;
                    }
                }    // x = y EOF
                else {
                    decls$405.push(VariableDeclaration$265.create(result$407.id, nextRes$409.result.punc, initializerRes$410.result));
                }
            }    // x ,...;
            else if (nextRes$409.result.hasPrototype(Punc$253) && nextRes$409.result.punc.token.value === ',') {
                decls$405.push(VariableDeclaration$265.create(result$407.id, null, null, nextRes$409.result.punc));
                var subRes$412 = enforestVarStatement$273(nextRes$409.rest, context$404);
                decls$405 = decls$405.concat(subRes$412.result);
                rest$408 = subRes$412.rest;
            } else {
                if (result$407.hasPrototype(Id$255)) {
                    decls$405.push(VariableDeclaration$265.create(result$407.id));
                } else {
                    throwError$215('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$407.hasPrototype(Id$255)) {
                decls$405.push(VariableDeclaration$265.create(result$407.id));
            } else if (result$407.hasPrototype(BinOp$250) && result$407.op.token.value === 'in') {
                decls$405.push(VariableDeclaration$265.create(result$407.left.id, result$407.op, result$407.right));
            } else {
                throwError$215('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$405,
            rest: rest$408
        };
    }
    function adjustLineContext$274(stx$413, original$414, current$415) {
        current$415 = current$415 || {
            lastLineNumber: original$414.token.lineNumber,
            lineNumber: original$414.token.lineNumber - 1
        };
        return _$124.map(stx$413, function (stx$416) {
            if (stx$416.token.type === parser$125.Token.Delimiter) {
                // handle tokens with missing line info
                stx$416.token.startLineNumber = typeof stx$416.token.startLineNumber == 'undefined' ? original$414.token.lineNumber : stx$416.token.startLineNumber;
                stx$416.token.endLineNumber = typeof stx$416.token.endLineNumber == 'undefined' ? original$414.token.lineNumber : stx$416.token.endLineNumber;
                stx$416.token.startLineStart = typeof stx$416.token.startLineStart == 'undefined' ? original$414.token.lineStart : stx$416.token.startLineStart;
                stx$416.token.endLineStart = typeof stx$416.token.endLineStart == 'undefined' ? original$414.token.lineStart : stx$416.token.endLineStart;
                stx$416.token.startRange = typeof stx$416.token.startRange == 'undefined' ? original$414.token.range : stx$416.token.startRange;
                stx$416.token.endRange = typeof stx$416.token.endRange == 'undefined' ? original$414.token.range : stx$416.token.endRange;
                stx$416.token.sm_startLineNumber = typeof stx$416.token.sm_startLineNumber == 'undefined' ? stx$416.token.startLineNumber : stx$416.token.sm_startLineNumber;
                stx$416.token.sm_endLineNumber = typeof stx$416.token.sm_endLineNumber == 'undefined' ? stx$416.token.endLineNumber : stx$416.token.sm_endLineNumber;
                stx$416.token.sm_startLineStart = typeof stx$416.token.sm_startLineStart == 'undefined' ? stx$416.token.startLineStart : stx$416.token.sm_startLineStart;
                stx$416.token.sm_endLineStart = typeof stx$416.token.sm_endLineStart == 'undefined' ? stx$416.token.endLineStart : stx$416.token.sm_endLineStart;
                stx$416.token.sm_startRange = typeof stx$416.token.sm_startRange == 'undefined' ? stx$416.token.startRange : stx$416.token.sm_startRange;
                stx$416.token.sm_endRange = typeof stx$416.token.sm_endRange == 'undefined' ? stx$416.token.endRange : stx$416.token.sm_endRange;
                stx$416.token.startLineNumber = original$414.token.lineNumber;
                if (stx$416.token.inner.length > 0) {
                    stx$416.token.inner = adjustLineContext$274(stx$416.token.inner, original$414, current$415);
                }
                return stx$416;
            }
            // handle tokens with missing line info
            stx$416.token.lineNumber = typeof stx$416.token.lineNumber == 'undefined' ? original$414.token.lineNumber : stx$416.token.lineNumber;
            stx$416.token.lineStart = typeof stx$416.token.lineStart == 'undefined' ? original$414.token.lineStart : stx$416.token.lineStart;
            stx$416.token.range = typeof stx$416.token.range == 'undefined' ? original$414.token.range : stx$416.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$416.token.sm_lineNumber = typeof stx$416.token.sm_lineNumber == 'undefined' ? stx$416.token.lineNumber : stx$416.token.sm_lineNumber;
            stx$416.token.sm_lineStart = typeof stx$416.token.sm_lineStart == 'undefined' ? stx$416.token.lineStart : stx$416.token.sm_lineStart;
            stx$416.token.sm_range = typeof stx$416.token.sm_range == 'undefined' ? _$124.clone(stx$416.token.range) : stx$416.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$416.token.lineNumber = original$414.token.lineNumber;
            return stx$416;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$275(toks$417, context$418) {
        parser$125.assert(toks$417.length > 0, 'enforest assumes there are tokens to work with');
        function step$419(head$420, rest$421) {
            var innerTokens$422;
            parser$125.assert(Array.isArray(rest$421), 'result must at least be an empty array');
            if (head$420.hasPrototype(TermTree$237)) {
                // function call
                var emp$425 = head$420.emp;
                var emp$425 = head$420.emp;
                var keyword$428 = head$420.keyword;
                var delim$430 = head$420.delim;
                var emp$425 = head$420.emp;
                var punc$433 = head$420.punc;
                var keyword$428 = head$420.keyword;
                var emp$425 = head$420.emp;
                var emp$425 = head$420.emp;
                var emp$425 = head$420.emp;
                var delim$430 = head$420.delim;
                var delim$430 = head$420.delim;
                var keyword$428 = head$420.keyword;
                var keyword$428 = head$420.keyword;
                if (head$420.hasPrototype(Expr$240) && (rest$421[0] && rest$421[0].token.type === parser$125.Token.Delimiter && rest$421[0].token.value === '()')) {
                    var argRes$458, enforestedArgs$459 = [], commas$460 = [];
                    rest$421[0].expose();
                    innerTokens$422 = rest$421[0].token.inner;
                    while (innerTokens$422.length > 0) {
                        argRes$458 = enforest$275(innerTokens$422, context$418);
                        enforestedArgs$459.push(argRes$458.result);
                        innerTokens$422 = argRes$458.rest;
                        if (innerTokens$422[0] && innerTokens$422[0].token.value === ',') {
                            // record the comma for later
                            commas$460.push(innerTokens$422[0]);
                            // but dump it for the next loop turn
                            innerTokens$422 = innerTokens$422.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$461 = _$124.all(enforestedArgs$459, function (argTerm$462) {
                            return argTerm$462.hasPrototype(Expr$240);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$422.length === 0 && argsAreExprs$461) {
                        return step$419(Call$262.create(head$420, enforestedArgs$459, rest$421[0], commas$460), rest$421.slice(1));
                    }
                } else if (head$420.hasPrototype(Expr$240) && (rest$421[0] && rest$421[0].token.value === '?')) {
                    var question$463 = rest$421[0];
                    var condRes$464 = enforest$275(rest$421.slice(1), context$418);
                    var truExpr$465 = condRes$464.result;
                    var right$466 = condRes$464.rest;
                    if (truExpr$465.hasPrototype(Expr$240) && right$466[0] && right$466[0].token.value === ':') {
                        var colon$467 = right$466[0];
                        var flsRes$468 = enforest$275(right$466.slice(1), context$418);
                        var flsExpr$469 = flsRes$468.result;
                        if (flsExpr$469.hasPrototype(Expr$240)) {
                            return step$419(ConditionalExpression$251.create(head$420, question$463, truExpr$465, colon$467, flsExpr$469), flsRes$468.rest);
                        }
                    }
                } else if (head$420.hasPrototype(Keyword$252) && (keyword$428.token.value === 'new' && rest$421[0])) {
                    var newCallRes$470 = enforest$275(rest$421, context$418);
                    if (newCallRes$470.result.hasPrototype(Call$262)) {
                        return step$419(Const$261.create(head$420, newCallRes$470.result), newCallRes$470.rest);
                    }
                } else if (head$420.hasPrototype(Delimiter$254) && delim$430.token.value === '()') {
                    innerTokens$422 = delim$430.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$422.length === 0) {
                        return step$419(ParenExpression$247.create(head$420), rest$421);
                    } else {
                        var innerTerm$471 = get_expression$276(innerTokens$422, context$418);
                        if (innerTerm$471.result && innerTerm$471.result.hasPrototype(Expr$240)) {
                            return step$419(ParenExpression$247.create(head$420), rest$421);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$420.hasPrototype(Expr$240) && (rest$421[0] && rest$421[1] && stxIsBinOp$272(rest$421[0]))) {
                    var op$472 = rest$421[0];
                    var left$473 = head$420;
                    var bopRes$474 = enforest$275(rest$421.slice(1), context$418);
                    var right$466 = bopRes$474.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$466.hasPrototype(Expr$240)) {
                        return step$419(BinOp$250.create(op$472, left$473, right$466), bopRes$474.rest);
                    }
                } else if (head$420.hasPrototype(Punc$253) && stxIsUnaryOp$271(punc$433)) {
                    var unopRes$475 = enforest$275(rest$421, context$418);
                    if (unopRes$475.result.hasPrototype(Expr$240)) {
                        return step$419(UnaryOp$248.create(punc$433, unopRes$475.result), unopRes$475.rest);
                    }
                } else if (head$420.hasPrototype(Keyword$252) && stxIsUnaryOp$271(keyword$428)) {
                    var unopRes$475 = enforest$275(rest$421, context$418);
                    if (unopRes$475.result.hasPrototype(Expr$240)) {
                        return step$419(UnaryOp$248.create(keyword$428, unopRes$475.result), unopRes$475.rest);
                    }
                } else if (head$420.hasPrototype(Expr$240) && (rest$421[0] && (rest$421[0].token.value === '++' || rest$421[0].token.value === '--'))) {
                    return step$419(PostfixOp$249.create(head$420, rest$421[0]), rest$421.slice(1));
                } else if (head$420.hasPrototype(Expr$240) && (rest$421[0] && rest$421[0].token.value === '[]')) {
                    return step$419(ObjGet$264.create(head$420, Delimiter$254.create(rest$421[0].expose())), rest$421.slice(1));
                } else if (head$420.hasPrototype(Expr$240) && (rest$421[0] && rest$421[0].token.value === '.' && rest$421[1] && rest$421[1].token.type === parser$125.Token.Identifier)) {
                    return step$419(ObjDotGet$263.create(head$420, rest$421[0], rest$421[1]), rest$421.slice(2));
                } else if (head$420.hasPrototype(Delimiter$254) && delim$430.token.value === '[]') {
                    return step$419(ArrayLiteral$246.create(head$420), rest$421);
                } else if (head$420.hasPrototype(Delimiter$254) && head$420.delim.token.value === '{}') {
                    return step$419(Block$245.create(head$420), rest$421);
                } else if (head$420.hasPrototype(Keyword$252) && (keyword$428.token.value === 'let' && (rest$421[0] && rest$421[0].token.type === parser$125.Token.Identifier || rest$421[0] && rest$421[0].token.type === parser$125.Token.Keyword || rest$421[0] && rest$421[0].token.type === parser$125.Token.Punctuator) && rest$421[1] && rest$421[1].token.value === '=' && rest$421[2] && rest$421[2].token.value === 'macro')) {
                    var mac$476 = enforest$275(rest$421.slice(2), context$418);
                    if (!mac$476.result.hasPrototype(AnonMacro$260)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$476.result);
                    }
                    return step$419(LetMacro$258.create(rest$421[0], mac$476.result.body), mac$476.rest);
                } else if (head$420.hasPrototype(Keyword$252) && (keyword$428.token.value === 'var' && rest$421[0])) {
                    var vsRes$477 = enforestVarStatement$273(rest$421, context$418);
                    if (vsRes$477) {
                        return step$419(VariableStatement$266.create(head$420, vsRes$477.result), vsRes$477.rest);
                    }
                }
            } else {
                parser$125.assert(head$420 && head$420.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$420.token.type === parser$125.Token.Identifier || head$420.token.type === parser$125.Token.Keyword || head$420.token.type === parser$125.Token.Punctuator) && context$418.env.has(resolve$228(head$420))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$478 = fresh$234();
                    var transformerContext$479 = makeExpanderContext$284(_$124.defaults({ mark: newMark$478 }, context$418));
                    // pull the macro transformer out the environment
                    var transformer$480 = context$418.env.get(resolve$228(head$420)).fn;
                    // apply the transformer
                    var rt$481 = transformer$480([head$420].concat(rest$421), transformerContext$479);
                    if (!Array.isArray(rt$481.result)) {
                        throwError$215('Macro transformer must return a result array, not: ' + rt$481.result);
                    }
                    if (rt$481.result.length > 0) {
                        var adjustedResult$482 = adjustLineContext$274(rt$481.result, head$420);
                        adjustedResult$482[0].token.leadingComments = head$420.token.leadingComments;
                        return step$419(adjustedResult$482[0], adjustedResult$482.slice(1).concat(rt$481.rest));
                    } else {
                        return step$419(Empty$269.create(), rt$481.rest);
                    }
                }    // anon macro definition
                else if (head$420.token.type === parser$125.Token.Identifier && head$420.token.value === 'macro' && rest$421[0] && rest$421[0].token.value === '{}') {
                    return step$419(AnonMacro$260.create(rest$421[0].expose().token.inner), rest$421.slice(1));
                }    // macro definition
                else if (head$420.token.type === parser$125.Token.Identifier && head$420.token.value === 'macro' && rest$421[0] && (rest$421[0].token.type === parser$125.Token.Identifier || rest$421[0].token.type === parser$125.Token.Keyword || rest$421[0].token.type === parser$125.Token.Punctuator) && rest$421[1] && rest$421[1].token.type === parser$125.Token.Delimiter && rest$421[1].token.value === '{}') {
                    return step$419(Macro$259.create(rest$421[0], rest$421[1].expose().token.inner), rest$421.slice(2));
                }    // module definition
                else if (head$420.token.value === 'module' && rest$421[0] && rest$421[0].token.value === '{}') {
                    return step$419(Module$268.create(rest$421[0]), rest$421.slice(1));
                }    // function definition
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'function' && rest$421[0] && rest$421[0].token.type === parser$125.Token.Identifier && rest$421[1] && rest$421[1].token.type === parser$125.Token.Delimiter && rest$421[1].token.value === '()' && rest$421[2] && rest$421[2].token.type === parser$125.Token.Delimiter && rest$421[2].token.value === '{}') {
                    rest$421[1].token.inner = rest$421[1].expose().token.inner;
                    rest$421[2].token.inner = rest$421[2].expose().token.inner;
                    return step$419(NamedFun$256.create(head$420, null, rest$421[0], rest$421[1], rest$421[2]), rest$421.slice(3));
                }    // generator function definition
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'function' && rest$421[0] && rest$421[0].token.type === parser$125.Token.Punctuator && rest$421[0].token.value === '*' && rest$421[1] && rest$421[1].token.type === parser$125.Token.Identifier && rest$421[2] && rest$421[2].token.type === parser$125.Token.Delimiter && rest$421[2].token.value === '()' && rest$421[3] && rest$421[3].token.type === parser$125.Token.Delimiter && rest$421[3].token.value === '{}') {
                    rest$421[2].token.inner = rest$421[2].expose().token.inner;
                    rest$421[3].token.inner = rest$421[3].expose().token.inner;
                    return step$419(NamedFun$256.create(head$420, rest$421[0], rest$421[1], rest$421[2], rest$421[3]), rest$421.slice(4));
                }    // anonymous function definition
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'function' && rest$421[0] && rest$421[0].token.type === parser$125.Token.Delimiter && rest$421[0].token.value === '()' && rest$421[1] && rest$421[1].token.type === parser$125.Token.Delimiter && rest$421[1].token.value === '{}') {
                    rest$421[0].token.inner = rest$421[0].expose().token.inner;
                    rest$421[1].token.inner = rest$421[1].expose().token.inner;
                    return step$419(AnonFun$257.create(head$420, null, rest$421[0], rest$421[1]), rest$421.slice(2));
                }    // anonymous generator function definition
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'function' && rest$421[0] && rest$421[0].token.type === parser$125.Token.Punctuator && rest$421[0].token.value === '*' && rest$421[1] && rest$421[1].token.type === parser$125.Token.Delimiter && rest$421[1].token.value === '()' && rest$421[2] && rest$421[2].token.type === parser$125.Token.Delimiter && rest$421[2].token.value === '{}') {
                    rest$421[1].token.inner = rest$421[1].expose().token.inner;
                    rest$421[2].token.inner = rest$421[2].expose().token.inner;
                    return step$419(AnonFun$257.create(head$420, rest$421[0], rest$421[1], rest$421[2]), rest$421.slice(3));
                }    // catch statement
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'catch' && rest$421[0] && rest$421[0].token.type === parser$125.Token.Delimiter && rest$421[0].token.value === '()' && rest$421[1] && rest$421[1].token.type === parser$125.Token.Delimiter && rest$421[1].token.value === '{}') {
                    rest$421[0].token.inner = rest$421[0].expose().token.inner;
                    rest$421[1].token.inner = rest$421[1].expose().token.inner;
                    return step$419(CatchClause$267.create(head$420, rest$421[0], rest$421[1]), rest$421.slice(2));
                }    // this expression
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'this') {
                    return step$419(ThisExpression$242.create(head$420), rest$421);
                }    // literal
                else if (head$420.token.type === parser$125.Token.NumericLiteral || head$420.token.type === parser$125.Token.StringLiteral || head$420.token.type === parser$125.Token.BooleanLiteral || head$420.token.type === parser$125.Token.RegularExpression || head$420.token.type === parser$125.Token.NullLiteral) {
                    return step$419(Lit$243.create(head$420), rest$421);
                }    // export
                else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'export' && rest$421[0] && (rest$421[0].token.type === parser$125.Token.Identifier || rest$421[0].token.type === parser$125.Token.Keyword || rest$421[0].token.type === parser$125.Token.Punctuator)) {
                    return step$419(Export$270.create(rest$421[0]), rest$421.slice(1));
                }    // identifier
                else if (head$420.token.type === parser$125.Token.Identifier) {
                    return step$419(Id$255.create(head$420), rest$421);
                }    // punctuator
                else if (head$420.token.type === parser$125.Token.Punctuator) {
                    return step$419(Punc$253.create(head$420), rest$421);
                } else if (head$420.token.type === parser$125.Token.Keyword && head$420.token.value === 'with') {
                    throwError$215('with is not supported in sweet.js');
                }    // keyword
                else if (head$420.token.type === parser$125.Token.Keyword) {
                    return step$419(Keyword$252.create(head$420), rest$421);
                }    // Delimiter
                else if (head$420.token.type === parser$125.Token.Delimiter) {
                    return step$419(Delimiter$254.create(head$420.expose()), rest$421);
                }    // end of file
                else if (head$420.token.type === parser$125.Token.EOF) {
                    parser$125.assert(rest$421.length === 0, 'nothing should be after an EOF');
                    return step$419(EOF$238.create(head$420), []);
                } else {
                    // todo: are we missing cases?
                    parser$125.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$420,
                rest: rest$421
            };
        }
        return step$419(toks$417[0], toks$417.slice(1));
    }
    function get_expression$276(stx$483, context$484) {
        var res$485 = enforest$275(stx$483, context$484);
        if (!res$485.result.hasPrototype(Expr$240)) {
            return {
                result: null,
                rest: stx$483
            };
        }
        return res$485;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$277(newMark$486, env$487) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$488(match$489) {
            if (match$489.level === 0) {
                // replace the match property with the marked syntax
                match$489.match = _$124.map(match$489.match, function (stx$490) {
                    return stx$490.mark(newMark$486);
                });
            } else {
                _$124.each(match$489.match, function (match$491) {
                    dfs$488(match$491);
                });
            }
        }
        _$124.keys(env$487).forEach(function (key$492) {
            dfs$488(env$487[key$492]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$278(mac$493, context$494) {
        var body$495 = mac$493.body;
        // raw function primitive form
        if (!(body$495[0] && body$495[0].token.type === parser$125.Token.Keyword && body$495[0].token.value === 'function')) {
            throwError$215('Primitive macro form must contain a function for the macro body');
        }
        var stub$496 = parser$125.read('()');
        stub$496[0].token.inner = body$495;
        var expanded$497 = expand$283(stub$496, context$494);
        expanded$497 = expanded$497[0].destruct().concat(expanded$497[1].eof);
        var flattend$498 = flatten$286(expanded$497);
        var bodyCode$499 = codegen$131.generate(parser$125.parse(flattend$498));
        var macroFn$500 = scopedEval$216(bodyCode$499, {
                makeValue: syn$126.makeValue,
                makeRegex: syn$126.makeRegex,
                makeIdent: syn$126.makeIdent,
                makeKeyword: syn$126.makeKeyword,
                makePunc: syn$126.makePunc,
                makeDelim: syn$126.makeDelim,
                unwrapSyntax: syn$126.unwrapSyntax,
                throwSyntaxError: syn$126.throwSyntaxError,
                parser: parser$125,
                _: _$124,
                patternModule: patternModule$129,
                getTemplate: function (id$501) {
                    return cloneSyntaxArray$279(context$494.templateMap.get(id$501));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$277,
                mergeMatches: function (newMatch$502, oldMatch$503) {
                    newMatch$502.patternEnv = _$124.extend({}, oldMatch$503.patternEnv, newMatch$502.patternEnv);
                    return newMatch$502;
                }
            });
        return macroFn$500;
    }
    function cloneSyntaxArray$279(arr$504) {
        return arr$504.map(function (stx$505) {
            var o$506 = syntaxFromToken$224(_$124.clone(stx$505.token), stx$505);
            if (o$506.token.type === parser$125.Token.Delimiter) {
                o$506.token.inner = cloneSyntaxArray$279(o$506.token.inner);
            }
            return o$506;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$280(stx$507, context$508) {
        parser$125.assert(context$508, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$507.length === 0) {
            return {
                terms: [],
                context: context$508
            };
        }
        parser$125.assert(stx$507[0].token, 'expecting a syntax object');
        var f$509 = enforest$275(stx$507, context$508);
        // head :: TermTree
        var head$510 = f$509.result;
        // rest :: [Syntax]
        var rest$511 = f$509.rest;
        if (head$510.hasPrototype(Macro$259)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$513 = loadMacroDef$278(head$510, context$508);
            addToDefinitionCtx$281([head$510.name], context$508.defscope, false);
            context$508.env.set(resolve$228(head$510.name), { fn: macroDefinition$513 });
            return expandToTermTree$280(rest$511, context$508);
        }
        if (head$510.hasPrototype(LetMacro$258)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$513 = loadMacroDef$278(head$510, context$508);
            var freshName$514 = fresh$234();
            var renamedName$515 = head$510.name.rename(head$510.name, freshName$514);
            rest$511 = _$124.map(rest$511, function (stx$516) {
                return stx$516.rename(head$510.name, freshName$514);
            });
            head$510.name = renamedName$515;
            context$508.env.set(resolve$228(head$510.name), { fn: macroDefinition$513 });
            return expandToTermTree$280(rest$511, context$508);
        }
        if (head$510.hasPrototype(NamedFun$256)) {
            addToDefinitionCtx$281([head$510.name], context$508.defscope, true);
        }
        if (head$510.hasPrototype(Id$255) && head$510.id.token.value === '#quoteSyntax' && rest$511[0] && rest$511[0].token.value === '{}') {
            var tempId$517 = fresh$234();
            context$508.templateMap.set(tempId$517, rest$511[0].token.inner);
            return expandToTermTree$280([
                syn$126.makeIdent('getTemplate', head$510.id),
                syn$126.makeDelim('()', [syn$126.makeValue(tempId$517, head$510.id)], head$510.id)
            ].concat(rest$511.slice(1)), context$508);
        }
        if (head$510.hasPrototype(VariableStatement$266)) {
            addToDefinitionCtx$281(_$124.map(head$510.decls, function (decl$518) {
                return decl$518.ident;
            }), context$508.defscope, true);
        }
        if (head$510.hasPrototype(Block$245) && head$510.body.hasPrototype(Delimiter$254)) {
            head$510.body.delim.token.inner.forEach(function (term$519) {
                if (term$519.hasPrototype(VariableStatement$266)) {
                    addToDefinitionCtx$281(_$124.map(term$519.decls, function (decl$520) {
                        return decl$520.ident;
                    }), context$508.defscope, true);
                }
            });
        }
        if (head$510.hasPrototype(Delimiter$254)) {
            head$510.delim.token.inner.forEach(function (term$521) {
                if (term$521.hasPrototype(VariableStatement$266)) {
                    addToDefinitionCtx$281(_$124.map(term$521.decls, function (decl$522) {
                        return decl$522.ident;
                    }), context$508.defscope, true);
                }
            });
        }
        var trees$512 = expandToTermTree$280(rest$511, context$508);
        return {
            terms: [head$510].concat(trees$512.terms),
            context: trees$512.context
        };
    }
    function addToDefinitionCtx$281(idents$523, defscope$524, skipRep$525) {
        parser$125.assert(idents$523 && idents$523.length > 0, 'expecting some variable identifiers');
        skipRep$525 = skipRep$525 || false;
        _$124.each(idents$523, function (id$526) {
            var skip$527 = false;
            if (skipRep$525) {
                var declRepeat$528 = _$124.find(defscope$524, function (def$529) {
                        return def$529.id.token.value === id$526.token.value && arraysEqual$229(marksof$227(def$529.id.context), marksof$227(id$526.context));
                    });
                skip$527 = typeof declRepeat$528 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$527) {
                var name$530 = fresh$234();
                defscope$524.push({
                    id: id$526,
                    name: name$530
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$282(term$531, context$532) {
        parser$125.assert(context$532 && context$532.env, 'environment map is required');
        if (term$531.hasPrototype(ArrayLiteral$246)) {
            term$531.array.delim.token.inner = expand$283(term$531.array.delim.expose().token.inner, context$532);
            return term$531;
        } else if (term$531.hasPrototype(Block$245)) {
            term$531.body.delim.token.inner = expand$283(term$531.body.delim.expose().token.inner, context$532);
            return term$531;
        } else if (term$531.hasPrototype(ParenExpression$247)) {
            term$531.expr.delim.token.inner = expand$283(term$531.expr.delim.expose().token.inner, context$532);
            return term$531;
        } else if (term$531.hasPrototype(Call$262)) {
            term$531.fun = expandTermTreeToFinal$282(term$531.fun, context$532);
            term$531.args = _$124.map(term$531.args, function (arg$533) {
                return expandTermTreeToFinal$282(arg$533, context$532);
            });
            return term$531;
        } else if (term$531.hasPrototype(UnaryOp$248)) {
            term$531.expr = expandTermTreeToFinal$282(term$531.expr, context$532);
            return term$531;
        } else if (term$531.hasPrototype(BinOp$250)) {
            term$531.left = expandTermTreeToFinal$282(term$531.left, context$532);
            term$531.right = expandTermTreeToFinal$282(term$531.right, context$532);
            return term$531;
        } else if (term$531.hasPrototype(ObjGet$264)) {
            term$531.right.delim.token.inner = expand$283(term$531.right.delim.expose().token.inner, context$532);
            return term$531;
        } else if (term$531.hasPrototype(ObjDotGet$263)) {
            term$531.left = expandTermTreeToFinal$282(term$531.left, context$532);
            term$531.right = expandTermTreeToFinal$282(term$531.right, context$532);
            return term$531;
        } else if (term$531.hasPrototype(VariableDeclaration$265)) {
            if (term$531.init) {
                term$531.init = expandTermTreeToFinal$282(term$531.init, context$532);
            }
            return term$531;
        } else if (term$531.hasPrototype(VariableStatement$266)) {
            term$531.decls = _$124.map(term$531.decls, function (decl$534) {
                return expandTermTreeToFinal$282(decl$534, context$532);
            });
            return term$531;
        } else if (term$531.hasPrototype(Delimiter$254)) {
            // expand inside the delimiter and then continue on
            term$531.delim.token.inner = expand$283(term$531.delim.expose().token.inner, context$532);
            return term$531;
        } else if (term$531.hasPrototype(NamedFun$256) || term$531.hasPrototype(AnonFun$257) || term$531.hasPrototype(CatchClause$267) || term$531.hasPrototype(Module$268)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$535 = [];
            var bodyContext$536 = makeExpanderContext$284(_$124.defaults({ defscope: newDef$535 }, context$532));
            if (term$531.params) {
                var params$545 = term$531.params.expose();
            } else {
                var params$545 = syn$126.makeDelim('()', [], null);
            }
            var bodies$537 = term$531.body.addDefCtx(newDef$535);
            var paramNames$538 = _$124.map(getParamIdentifiers$236(params$545), function (param$546) {
                    var freshName$547 = fresh$234();
                    return {
                        freshName: freshName$547,
                        originalParam: param$546,
                        renamedParam: param$546.rename(param$546, freshName$547)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$539 = _$124.reduce(paramNames$538, function (accBody$548, p$549) {
                    return accBody$548.rename(p$549.originalParam, p$549.freshName);
                }, bodies$537);
            renamedBody$539 = renamedBody$539.expose();
            var expandedResult$540 = expandToTermTree$280(renamedBody$539.token.inner, bodyContext$536);
            var bodyTerms$541 = expandedResult$540.terms;
            var renamedParams$542 = _$124.map(paramNames$538, function (p$550) {
                    return p$550.renamedParam;
                });
            var flatArgs$543 = syn$126.makeDelim('()', joinSyntax$225(renamedParams$542, ','), term$531.params);
            var expandedArgs$544 = expand$283([flatArgs$543], bodyContext$536);
            parser$125.assert(expandedArgs$544.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$531.params) {
                term$531.params = expandedArgs$544[0];
            }
            bodyTerms$541 = _$124.map(bodyTerms$541, function (bodyTerm$551) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$552 = bodyTerm$551.addDefCtx(newDef$535);
                // finish expansion
                return expandTermTreeToFinal$282(termWithCtx$552, expandedResult$540.context);
            });
            if (term$531.hasPrototype(Module$268)) {
                bodyTerms$541 = _$124.filter(bodyTerms$541, function (bodyTerm$553) {
                    if (bodyTerm$553.hasPrototype(Export$270)) {
                        term$531.exports.push(bodyTerm$553);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$539.token.inner = bodyTerms$541;
            term$531.body = renamedBody$539;
            // and continue expand the rest
            return term$531;
        }
        // the term is fine as is
        return term$531;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$283(stx$554, context$555) {
        parser$125.assert(context$555, 'must provide an expander context');
        var trees$556 = expandToTermTree$280(stx$554, context$555);
        return _$124.map(trees$556.terms, function (term$557) {
            return expandTermTreeToFinal$282(term$557, trees$556.context);
        });
    }
    function makeExpanderContext$284(o$558) {
        o$558 = o$558 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$558.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$558.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$558.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$558.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$285(stx$559, builtinSource$560) {
        var env$561 = new Map();
        var params$562 = [];
        var context$563, builtInContext$564 = makeExpanderContext$284({ env: env$561 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$560) {
            var builtinRead$567 = parser$125.read(builtinSource$560);
            builtinRead$567 = [
                syn$126.makeIdent('module', null),
                syn$126.makeDelim('{}', builtinRead$567, null)
            ];
            var builtinRes$568 = expand$283(builtinRead$567, builtInContext$564);
            params$562 = _$124.map(builtinRes$568[0].exports, function (term$569) {
                return {
                    oldExport: term$569.name,
                    newParam: syn$126.makeIdent(term$569.name.token.value, null)
                };
            });
        }
        var modBody$565 = syn$126.makeDelim('{}', stx$559, null);
        modBody$565 = _$124.reduce(params$562, function (acc$570, param$571) {
            var newName$572 = fresh$234();
            env$561.set(resolve$228(param$571.newParam.rename(param$571.newParam, newName$572)), env$561.get(resolve$228(param$571.oldExport)));
            return acc$570.rename(param$571.newParam, newName$572);
        }, modBody$565);
        context$563 = makeExpanderContext$284({ env: env$561 });
        var res$566 = expand$283([
                syn$126.makeIdent('module', null),
                modBody$565
            ], context$563);
        res$566 = res$566[0].destruct();
        return flatten$286(res$566[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$286(stx$573) {
        return _$124.reduce(stx$573, function (acc$574, stx$575) {
            if (stx$575.token.type === parser$125.Token.Delimiter) {
                var exposed$576 = stx$575.expose();
                var openParen$577 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$575.token.value[0],
                        range: stx$575.token.startRange,
                        sm_range: typeof stx$575.token.sm_startRange == 'undefined' ? stx$575.token.startRange : stx$575.token.sm_startRange,
                        lineNumber: stx$575.token.startLineNumber,
                        sm_lineNumber: typeof stx$575.token.sm_startLineNumber == 'undefined' ? stx$575.token.startLineNumber : stx$575.token.sm_startLineNumber,
                        lineStart: stx$575.token.startLineStart,
                        sm_lineStart: typeof stx$575.token.sm_startLineStart == 'undefined' ? stx$575.token.startLineStart : stx$575.token.sm_startLineStart
                    }, exposed$576);
                var closeParen$578 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$575.token.value[1],
                        range: stx$575.token.endRange,
                        sm_range: typeof stx$575.token.sm_endRange == 'undefined' ? stx$575.token.endRange : stx$575.token.sm_endRange,
                        lineNumber: stx$575.token.endLineNumber,
                        sm_lineNumber: typeof stx$575.token.sm_endLineNumber == 'undefined' ? stx$575.token.endLineNumber : stx$575.token.sm_endLineNumber,
                        lineStart: stx$575.token.endLineStart,
                        sm_lineStart: typeof stx$575.token.sm_endLineStart == 'undefined' ? stx$575.token.endLineStart : stx$575.token.sm_endLineStart
                    }, exposed$576);
                if (stx$575.token.leadingComments) {
                    openParen$577.token.leadingComments = stx$575.token.leadingComments;
                }
                if (stx$575.token.trailingComments) {
                    openParen$577.token.trailingComments = stx$575.token.trailingComments;
                }
                return acc$574.concat(openParen$577).concat(flatten$286(exposed$576.token.inner)).concat(closeParen$578);
            }
            stx$575.token.sm_lineNumber = stx$575.token.sm_lineNumber ? stx$575.token.sm_lineNumber : stx$575.token.lineNumber;
            stx$575.token.sm_lineStart = stx$575.token.sm_lineStart ? stx$575.token.sm_lineStart : stx$575.token.lineStart;
            stx$575.token.sm_range = stx$575.token.sm_range ? stx$575.token.sm_range : stx$575.token.range;
            return acc$574.concat(stx$575);
        }, []);
    }
    exports$123.enforest = enforest$275;
    exports$123.expand = expandTopLevel$285;
    exports$123.resolve = resolve$228;
    exports$123.get_expression = get_expression$276;
    exports$123.makeExpanderContext = makeExpanderContext$284;
    exports$123.Expr = Expr$240;
    exports$123.VariableStatement = VariableStatement$266;
    exports$123.tokensToSyntax = syn$126.tokensToSyntax;
    exports$123.syntaxToTokens = syn$126.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map