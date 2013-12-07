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
(function (root$124, factory$125) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$125(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$125);
    }
}(this, function (exports$126, _$127, parser$128, syn$129, es6$130, se$131, patternModule$132, gen$133) {
    'use strict';
    var codegen$134 = gen$133 || escodegen;
    // used to export "private" methods for unit testing
    exports$126._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$290 = Object.create(this);
                if (typeof o$290.construct === 'function') {
                    o$290.construct.apply(o$290, arguments);
                }
                return o$290;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$291) {
                var result$292 = Object.create(this);
                for (var prop$293 in properties$291) {
                    if (properties$291.hasOwnProperty(prop$293)) {
                        result$292[prop$293] = properties$291[prop$293];
                    }
                }
                return result$292;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$294) {
                function F$295() {
                }
                F$295.prototype = proto$294;
                return this instanceof F$295;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$218(msg$296) {
        throw new Error(msg$296);
    }
    var scopedEval$219 = se$131.scopedEval;
    var Rename$220 = syn$129.Rename;
    var Mark$221 = syn$129.Mark;
    var Var$222 = syn$129.Var;
    var Def$223 = syn$129.Def;
    var isDef$224 = syn$129.isDef;
    var isMark$225 = syn$129.isMark;
    var isRename$226 = syn$129.isRename;
    var syntaxFromToken$227 = syn$129.syntaxFromToken;
    var joinSyntax$228 = syn$129.joinSyntax;
    function remdup$229(mark$297, mlist$298) {
        if (mark$297 === _$127.first(mlist$298)) {
            return _$127.rest(mlist$298, 1);
        }
        return [mark$297].concat(mlist$298);
    }
    // (CSyntax) -> [...Num]
    function marksof$230(ctx$299, stopName$300, originalName$301) {
        var mark$302, submarks$303;
        if (isMark$225(ctx$299)) {
            mark$302 = ctx$299.mark;
            submarks$303 = marksof$230(ctx$299.context, stopName$300, originalName$301);
            return remdup$229(mark$302, submarks$303);
        }
        if (isDef$224(ctx$299)) {
            return marksof$230(ctx$299.context, stopName$300, originalName$301);
        }
        if (isRename$226(ctx$299)) {
            if (stopName$300 === originalName$301 + '$' + ctx$299.name) {
                return [];
            }
            return marksof$230(ctx$299.context, stopName$300, originalName$301);
        }
        return [];
    }
    function resolve$231(stx$304) {
        return resolveCtx$235(stx$304.token.value, stx$304.context, [], []);
    }
    function arraysEqual$232(a$305, b$306) {
        if (a$305.length !== b$306.length) {
            return false;
        }
        for (var i$307 = 0; i$307 < a$305.length; i$307++) {
            if (a$305[i$307] !== b$306[i$307]) {
                return false;
            }
        }
        return true;
    }
    function renames$233(defctx$308, oldctx$309, originalName$310) {
        var acc$311 = oldctx$309;
        for (var i$312 = 0; i$312 < defctx$308.length; i$312++) {
            if (defctx$308[i$312].id.token.value === originalName$310) {
                acc$311 = Rename$220(defctx$308[i$312].id, defctx$308[i$312].name, acc$311, defctx$308);
            }
        }
        return acc$311;
    }
    function unionEl$234(arr$313, el$314) {
        if (arr$313.indexOf(el$314) === -1) {
            var res$315 = arr$313.slice(0);
            res$315.push(el$314);
            return res$315;
        }
        return arr$313;
    }
    // (Syntax) -> String
    function resolveCtx$235(originalName$316, ctx$317, stop_spine$318, stop_branch$319) {
        if (isMark$225(ctx$317)) {
            return resolveCtx$235(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
        }
        if (isDef$224(ctx$317)) {
            if (stop_spine$318.indexOf(ctx$317.defctx) !== -1) {
                return resolveCtx$235(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
            } else {
                return resolveCtx$235(originalName$316, renames$233(ctx$317.defctx, ctx$317.context, originalName$316), stop_spine$318, unionEl$234(stop_branch$319, ctx$317.defctx));
            }
        }
        if (isRename$226(ctx$317)) {
            if (originalName$316 === ctx$317.id.token.value) {
                var idName$320 = resolveCtx$235(ctx$317.id.token.value, ctx$317.id.context, stop_branch$319, stop_branch$319);
                var subName$321 = resolveCtx$235(originalName$316, ctx$317.context, unionEl$234(stop_spine$318, ctx$317.def), stop_branch$319);
                if (idName$320 === subName$321) {
                    var idMarks$322 = marksof$230(ctx$317.id.context, originalName$316 + '$' + ctx$317.name, originalName$316);
                    var subMarks$323 = marksof$230(ctx$317.context, originalName$316 + '$' + ctx$317.name, originalName$316);
                    if (arraysEqual$232(idMarks$322, subMarks$323)) {
                        return originalName$316 + '$' + ctx$317.name;
                    }
                }
            }
            return resolveCtx$235(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
        }
        return originalName$316;
    }
    var nextFresh$236 = 0;
    // fun () -> Num
    function fresh$237() {
        return nextFresh$236++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$238(towrap$324, delimSyntax$325) {
        parser$128.assert(delimSyntax$325.token.type === parser$128.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$227({
            type: parser$128.Token.Delimiter,
            value: delimSyntax$325.token.value,
            inner: towrap$324,
            range: delimSyntax$325.token.range,
            startLineNumber: delimSyntax$325.token.startLineNumber,
            lineStart: delimSyntax$325.token.lineStart
        }, delimSyntax$325);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$239(argSyntax$326) {
        parser$128.assert(argSyntax$326.token.type === parser$128.Token.Delimiter, 'expecting delimiter for function params');
        return _$127.filter(argSyntax$326.token.inner, function (stx$327) {
            return stx$327.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$240 = {
            destruct: function () {
                return _$127.reduce(this.properties, _$127.bind(function (acc$328, prop$329) {
                    if (this[prop$329] && this[prop$329].hasPrototype(TermTree$240)) {
                        return acc$328.concat(this[prop$329].destruct());
                    } else if (this[prop$329] && this[prop$329].token && this[prop$329].token.inner) {
                        this[prop$329].token.inner = _$127.reduce(this[prop$329].token.inner, function (acc$330, t$331) {
                            if (t$331.hasPrototype(TermTree$240)) {
                                return acc$330.concat(t$331.destruct());
                            }
                            return acc$330.concat(t$331);
                        }, []);
                        return acc$328.concat(this[prop$329]);
                    } else if (this[prop$329]) {
                        return acc$328.concat(this[prop$329]);
                    } else {
                        return acc$328;
                    }
                }, this), []);
            },
            addDefCtx: function (def$332) {
                for (var i$333 = 0; i$333 < this.properties.length; i$333++) {
                    var prop$334 = this.properties[i$333];
                    if (Array.isArray(this[prop$334])) {
                        this[prop$334] = _$127.map(this[prop$334], function (item$335) {
                            return item$335.addDefCtx(def$332);
                        });
                    } else if (this[prop$334]) {
                        this[prop$334] = this[prop$334].addDefCtx(def$332);
                    }
                }
                return this;
            }
        };
    var EOF$241 = TermTree$240.extend({
            properties: ['eof'],
            construct: function (e$336) {
                this.eof = e$336;
            }
        });
    var Statement$242 = TermTree$240.extend({
            construct: function () {
            }
        });
    var Expr$243 = TermTree$240.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$244 = Expr$243.extend({
            construct: function () {
            }
        });
    var ThisExpression$245 = PrimaryExpression$244.extend({
            properties: ['this'],
            construct: function (that$337) {
                this.this = that$337;
            }
        });
    var Lit$246 = PrimaryExpression$244.extend({
            properties: ['lit'],
            construct: function (l$338) {
                this.lit = l$338;
            }
        });
    exports$126._test.PropertyAssignment = PropertyAssignment$247;
    var PropertyAssignment$247 = TermTree$240.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$339, assignment$340) {
                this.propName = propName$339;
                this.assignment = assignment$340;
            }
        });
    var Block$248 = PrimaryExpression$244.extend({
            properties: ['body'],
            construct: function (body$341) {
                this.body = body$341;
            }
        });
    var ArrayLiteral$249 = PrimaryExpression$244.extend({
            properties: ['array'],
            construct: function (ar$342) {
                this.array = ar$342;
            }
        });
    var ParenExpression$250 = PrimaryExpression$244.extend({
            properties: ['expr'],
            construct: function (expr$343) {
                this.expr = expr$343;
            }
        });
    var UnaryOp$251 = Expr$243.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$344, expr$345) {
                this.op = op$344;
                this.expr = expr$345;
            }
        });
    var PostfixOp$252 = Expr$243.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$346, op$347) {
                this.expr = expr$346;
                this.op = op$347;
            }
        });
    var BinOp$253 = Expr$243.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$348, left$349, right$350) {
                this.op = op$348;
                this.left = left$349;
                this.right = right$350;
            }
        });
    var ConditionalExpression$254 = Expr$243.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$351, question$352, tru$353, colon$354, fls$355) {
                this.cond = cond$351;
                this.question = question$352;
                this.tru = tru$353;
                this.colon = colon$354;
                this.fls = fls$355;
            }
        });
    var Keyword$255 = TermTree$240.extend({
            properties: ['keyword'],
            construct: function (k$356) {
                this.keyword = k$356;
            }
        });
    var Punc$256 = TermTree$240.extend({
            properties: ['punc'],
            construct: function (p$357) {
                this.punc = p$357;
            }
        });
    var Delimiter$257 = TermTree$240.extend({
            properties: ['delim'],
            construct: function (d$358) {
                this.delim = d$358;
            }
        });
    var Id$258 = PrimaryExpression$244.extend({
            properties: ['id'],
            construct: function (id$359) {
                this.id = id$359;
            }
        });
    var NamedFun$259 = Expr$243.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$360, name$361, params$362, body$363) {
                this.keyword = keyword$360;
                this.name = name$361;
                this.params = params$362;
                this.body = body$363;
            }
        });
    var AnonFun$260 = Expr$243.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$364, params$365, body$366) {
                this.keyword = keyword$364;
                this.params = params$365;
                this.body = body$366;
            }
        });
    var LetMacro$261 = TermTree$240.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$367, body$368) {
                this.name = name$367;
                this.body = body$368;
            }
        });
    var Macro$262 = TermTree$240.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$369, body$370) {
                this.name = name$369;
                this.body = body$370;
            }
        });
    var AnonMacro$263 = TermTree$240.extend({
            properties: ['body'],
            construct: function (body$371) {
                this.body = body$371;
            }
        });
    var Const$264 = Expr$243.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$372, call$373) {
                this.newterm = newterm$372;
                this.call = call$373;
            }
        });
    var Call$265 = Expr$243.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$128.assert(this.fun.hasPrototype(TermTree$240), 'expecting a term tree in destruct of call');
                var that$374 = this;
                this.delim = syntaxFromToken$227(_$127.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$127.reduce(this.args, function (acc$375, term$376) {
                    parser$128.assert(term$376 && term$376.hasPrototype(TermTree$240), 'expecting term trees in destruct of Call');
                    var dst$377 = acc$375.concat(term$376.destruct());
                    // add all commas except for the last one
                    if (that$374.commas.length > 0) {
                        dst$377 = dst$377.concat(that$374.commas.shift());
                    }
                    return dst$377;
                }, []);
                return this.fun.destruct().concat(Delimiter$257.create(this.delim).destruct());
            },
            construct: function (funn$378, args$379, delim$380, commas$381) {
                parser$128.assert(Array.isArray(args$379), 'requires an array of arguments terms');
                this.fun = funn$378;
                this.args = args$379;
                this.delim = delim$380;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$381;
            }
        });
    var ObjDotGet$266 = Expr$243.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$382, dot$383, right$384) {
                this.left = left$382;
                this.dot = dot$383;
                this.right = right$384;
            }
        });
    var ObjGet$267 = Expr$243.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$385, right$386) {
                this.left = left$385;
                this.right = right$386;
            }
        });
    var VariableDeclaration$268 = TermTree$240.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$387, eqstx$388, init$389, comma$390) {
                this.ident = ident$387;
                this.eqstx = eqstx$388;
                this.init = init$389;
                this.comma = comma$390;
            }
        });
    var VariableStatement$269 = Statement$242.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$127.reduce(this.decls, function (acc$391, decl$392) {
                    return acc$391.concat(decl$392.destruct());
                }, []));
            },
            construct: function (varkw$393, decls$394) {
                parser$128.assert(Array.isArray(decls$394), 'decls must be an array');
                this.varkw = varkw$393;
                this.decls = decls$394;
            }
        });
    var CatchClause$270 = TermTree$240.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$395, params$396, body$397) {
                this.catchkw = catchkw$395;
                this.params = params$396;
                this.body = body$397;
            }
        });
    var Module$271 = TermTree$240.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$398) {
                this.body = body$398;
                this.exports = [];
            }
        });
    var Empty$272 = TermTree$240.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$273 = TermTree$240.extend({
            properties: ['name'],
            construct: function (name$399) {
                this.name = name$399;
            }
        });
    function stxIsUnaryOp$274(stx$400) {
        var staticOperators$401 = [
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
        return _$127.contains(staticOperators$401, stx$400.token.value);
    }
    function stxIsBinOp$275(stx$402) {
        var staticOperators$403 = [
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
        return _$127.contains(staticOperators$403, stx$402.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$276(stx$404, context$405) {
        var decls$406 = [];
        var res$407 = enforest$278(stx$404, context$405);
        var result$408 = res$407.result;
        var rest$409 = res$407.rest;
        if (rest$409[0]) {
            var nextRes$410 = enforest$278(rest$409, context$405);
            // x = ...
            if (nextRes$410.result.hasPrototype(Punc$256) && nextRes$410.result.punc.token.value === '=') {
                var initializerRes$411 = enforest$278(nextRes$410.rest, context$405);
                if (initializerRes$411.rest[0]) {
                    var restRes$412 = enforest$278(initializerRes$411.rest, context$405);
                    // x = y + z, ...
                    if (restRes$412.result.hasPrototype(Punc$256) && restRes$412.result.punc.token.value === ',') {
                        decls$406.push(VariableDeclaration$268.create(result$408.id, nextRes$410.result.punc, initializerRes$411.result, restRes$412.result.punc));
                        var subRes$413 = enforestVarStatement$276(restRes$412.rest, context$405);
                        decls$406 = decls$406.concat(subRes$413.result);
                        rest$409 = subRes$413.rest;
                    }    // x = y ...
                    else {
                        decls$406.push(VariableDeclaration$268.create(result$408.id, nextRes$410.result.punc, initializerRes$411.result));
                        rest$409 = initializerRes$411.rest;
                    }
                }    // x = y EOF
                else {
                    decls$406.push(VariableDeclaration$268.create(result$408.id, nextRes$410.result.punc, initializerRes$411.result));
                }
            }    // x ,...;
            else if (nextRes$410.result.hasPrototype(Punc$256) && nextRes$410.result.punc.token.value === ',') {
                decls$406.push(VariableDeclaration$268.create(result$408.id, null, null, nextRes$410.result.punc));
                var subRes$413 = enforestVarStatement$276(nextRes$410.rest, context$405);
                decls$406 = decls$406.concat(subRes$413.result);
                rest$409 = subRes$413.rest;
            } else {
                if (result$408.hasPrototype(Id$258)) {
                    decls$406.push(VariableDeclaration$268.create(result$408.id));
                } else {
                    throwError$218('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$408.hasPrototype(Id$258)) {
                decls$406.push(VariableDeclaration$268.create(result$408.id));
            } else if (result$408.hasPrototype(BinOp$253) && result$408.op.token.value === 'in') {
                decls$406.push(VariableDeclaration$268.create(result$408.left.id, result$408.op, result$408.right));
            } else {
                throwError$218('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$406,
            rest: rest$409
        };
    }
    function adjustLineContext$277(stx$414, original$415, current$416) {
        current$416 = current$416 || {
            lastLineNumber: original$415.token.lineNumber,
            lineNumber: original$415.token.lineNumber - 1
        };
        return _$127.map(stx$414, function (stx$417) {
            if (stx$417.token.type === parser$128.Token.Delimiter) {
                // handle tokens with missing line info
                stx$417.token.startLineNumber = typeof stx$417.token.startLineNumber == 'undefined' ? original$415.token.lineNumber : stx$417.token.startLineNumber;
                stx$417.token.endLineNumber = typeof stx$417.token.endLineNumber == 'undefined' ? original$415.token.lineNumber : stx$417.token.endLineNumber;
                stx$417.token.startLineStart = typeof stx$417.token.startLineStart == 'undefined' ? original$415.token.lineStart : stx$417.token.startLineStart;
                stx$417.token.endLineStart = typeof stx$417.token.endLineStart == 'undefined' ? original$415.token.lineStart : stx$417.token.endLineStart;
                stx$417.token.startRange = typeof stx$417.token.startRange == 'undefined' ? original$415.token.range : stx$417.token.startRange;
                stx$417.token.endRange = typeof stx$417.token.endRange == 'undefined' ? original$415.token.range : stx$417.token.endRange;
                stx$417.token.sm_startLineNumber = typeof stx$417.token.sm_startLineNumber == 'undefined' ? stx$417.token.startLineNumber : stx$417.token.sm_startLineNumber;
                stx$417.token.sm_endLineNumber = typeof stx$417.token.sm_endLineNumber == 'undefined' ? stx$417.token.endLineNumber : stx$417.token.sm_endLineNumber;
                stx$417.token.sm_startLineStart = typeof stx$417.token.sm_startLineStart == 'undefined' ? stx$417.token.startLineStart : stx$417.token.sm_startLineStart;
                stx$417.token.sm_endLineStart = typeof stx$417.token.sm_endLineStart == 'undefined' ? stx$417.token.endLineStart : stx$417.token.sm_endLineStart;
                stx$417.token.sm_startRange = typeof stx$417.token.sm_startRange == 'undefined' ? stx$417.token.startRange : stx$417.token.sm_startRange;
                stx$417.token.sm_endRange = typeof stx$417.token.sm_endRange == 'undefined' ? stx$417.token.endRange : stx$417.token.sm_endRange;
                stx$417.token.startLineNumber = original$415.token.lineNumber;
                if (stx$417.token.inner.length > 0) {
                    stx$417.token.inner = adjustLineContext$277(stx$417.token.inner, original$415, current$416);
                }
                return stx$417;
            }
            // handle tokens with missing line info
            stx$417.token.lineNumber = typeof stx$417.token.lineNumber == 'undefined' ? original$415.token.lineNumber : stx$417.token.lineNumber;
            stx$417.token.lineStart = typeof stx$417.token.lineStart == 'undefined' ? original$415.token.lineStart : stx$417.token.lineStart;
            stx$417.token.range = typeof stx$417.token.range == 'undefined' ? original$415.token.range : stx$417.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$417.token.sm_lineNumber = typeof stx$417.token.sm_lineNumber == 'undefined' ? stx$417.token.lineNumber : stx$417.token.sm_lineNumber;
            stx$417.token.sm_lineStart = typeof stx$417.token.sm_lineStart == 'undefined' ? stx$417.token.lineStart : stx$417.token.sm_lineStart;
            stx$417.token.sm_range = typeof stx$417.token.sm_range == 'undefined' ? _$127.clone(stx$417.token.range) : stx$417.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$417.token.lineNumber = original$415.token.lineNumber;
            return stx$417;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$278(toks$418, context$419) {
        parser$128.assert(toks$418.length > 0, 'enforest assumes there are tokens to work with');
        function step$420(head$421, rest$422) {
            var innerTokens$423;
            parser$128.assert(Array.isArray(rest$422), 'result must at least be an empty array');
            if (head$421.hasPrototype(TermTree$240)) {
                // function call
                var emp$426 = head$421.emp;
                var emp$426 = head$421.emp;
                var keyword$429 = head$421.keyword;
                var delim$431 = head$421.delim;
                var emp$426 = head$421.emp;
                var punc$434 = head$421.punc;
                var keyword$429 = head$421.keyword;
                var emp$426 = head$421.emp;
                var emp$426 = head$421.emp;
                var emp$426 = head$421.emp;
                var delim$431 = head$421.delim;
                var delim$431 = head$421.delim;
                var keyword$429 = head$421.keyword;
                var keyword$429 = head$421.keyword;
                if (head$421.hasPrototype(Expr$243) && (rest$422[0] && rest$422[0].token.type === parser$128.Token.Delimiter && rest$422[0].token.value === '()')) {
                    var argRes$459, enforestedArgs$460 = [], commas$461 = [];
                    rest$422[0].expose();
                    innerTokens$423 = rest$422[0].token.inner;
                    while (innerTokens$423.length > 0) {
                        argRes$459 = enforest$278(innerTokens$423, context$419);
                        enforestedArgs$460.push(argRes$459.result);
                        innerTokens$423 = argRes$459.rest;
                        if (innerTokens$423[0] && innerTokens$423[0].token.value === ',') {
                            // record the comma for later
                            commas$461.push(innerTokens$423[0]);
                            // but dump it for the next loop turn
                            innerTokens$423 = innerTokens$423.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$462 = _$127.all(enforestedArgs$460, function (argTerm$463) {
                            return argTerm$463.hasPrototype(Expr$243);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$423.length === 0 && argsAreExprs$462) {
                        return step$420(Call$265.create(head$421, enforestedArgs$460, rest$422[0], commas$461), rest$422.slice(1));
                    }
                } else if (head$421.hasPrototype(Expr$243) && (rest$422[0] && rest$422[0].token.value === '?')) {
                    var question$464 = rest$422[0];
                    var condRes$465 = enforest$278(rest$422.slice(1), context$419);
                    var truExpr$466 = condRes$465.result;
                    var right$467 = condRes$465.rest;
                    if (truExpr$466.hasPrototype(Expr$243) && right$467[0] && right$467[0].token.value === ':') {
                        var colon$468 = right$467[0];
                        var flsRes$469 = enforest$278(right$467.slice(1), context$419);
                        var flsExpr$470 = flsRes$469.result;
                        if (flsExpr$470.hasPrototype(Expr$243)) {
                            return step$420(ConditionalExpression$254.create(head$421, question$464, truExpr$466, colon$468, flsExpr$470), flsRes$469.rest);
                        }
                    }
                } else if (head$421.hasPrototype(Keyword$255) && (keyword$429.token.value === 'new' && rest$422[0])) {
                    var newCallRes$471 = enforest$278(rest$422, context$419);
                    if (newCallRes$471.result.hasPrototype(Call$265)) {
                        return step$420(Const$264.create(head$421, newCallRes$471.result), newCallRes$471.rest);
                    }
                } else if (head$421.hasPrototype(Delimiter$257) && delim$431.token.value === '()') {
                    innerTokens$423 = delim$431.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$423.length === 0) {
                        return step$420(ParenExpression$250.create(head$421), rest$422);
                    } else {
                        var innerTerm$472 = get_expression$279(innerTokens$423, context$419);
                        if (innerTerm$472.result && innerTerm$472.result.hasPrototype(Expr$243)) {
                            return step$420(ParenExpression$250.create(head$421), rest$422);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$421.hasPrototype(Expr$243) && (rest$422[0] && rest$422[1] && stxIsBinOp$275(rest$422[0]))) {
                    var op$473 = rest$422[0];
                    var left$474 = head$421;
                    var bopRes$475 = enforest$278(rest$422.slice(1), context$419);
                    var right$467 = bopRes$475.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$467.hasPrototype(Expr$243)) {
                        return step$420(BinOp$253.create(op$473, left$474, right$467), bopRes$475.rest);
                    }
                } else if (head$421.hasPrototype(Punc$256) && stxIsUnaryOp$274(punc$434)) {
                    var unopRes$476 = enforest$278(rest$422, context$419);
                    if (unopRes$476.result.hasPrototype(Expr$243)) {
                        return step$420(UnaryOp$251.create(punc$434, unopRes$476.result), unopRes$476.rest);
                    }
                } else if (head$421.hasPrototype(Keyword$255) && stxIsUnaryOp$274(keyword$429)) {
                    var unopRes$476 = enforest$278(rest$422, context$419);
                    if (unopRes$476.result.hasPrototype(Expr$243)) {
                        return step$420(UnaryOp$251.create(keyword$429, unopRes$476.result), unopRes$476.rest);
                    }
                } else if (head$421.hasPrototype(Expr$243) && (rest$422[0] && (rest$422[0].token.value === '++' || rest$422[0].token.value === '--'))) {
                    return step$420(PostfixOp$252.create(head$421, rest$422[0]), rest$422.slice(1));
                } else if (head$421.hasPrototype(Expr$243) && (rest$422[0] && rest$422[0].token.value === '[]')) {
                    return step$420(ObjGet$267.create(head$421, Delimiter$257.create(rest$422[0].expose())), rest$422.slice(1));
                } else if (head$421.hasPrototype(Expr$243) && (rest$422[0] && rest$422[0].token.value === '.' && rest$422[1] && rest$422[1].token.type === parser$128.Token.Identifier)) {
                    return step$420(ObjDotGet$266.create(head$421, rest$422[0], rest$422[1]), rest$422.slice(2));
                } else if (head$421.hasPrototype(Delimiter$257) && delim$431.token.value === '[]') {
                    return step$420(ArrayLiteral$249.create(head$421), rest$422);
                } else if (head$421.hasPrototype(Delimiter$257) && head$421.delim.token.value === '{}') {
                    return step$420(Block$248.create(head$421), rest$422);
                } else if (head$421.hasPrototype(Keyword$255) && (keyword$429.token.value === 'let' && (rest$422[0] && rest$422[0].token.type === parser$128.Token.Identifier || rest$422[0] && rest$422[0].token.type === parser$128.Token.Keyword || rest$422[0] && rest$422[0].token.type === parser$128.Token.Punctuator) && rest$422[1] && rest$422[1].token.value === '=' && rest$422[2] && rest$422[2].token.value === 'macro')) {
                    var mac$477 = enforest$278(rest$422.slice(2), context$419);
                    if (!mac$477.result.hasPrototype(AnonMacro$263)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$477.result);
                    }
                    return step$420(LetMacro$261.create(rest$422[0], mac$477.result.body), mac$477.rest);
                } else if (head$421.hasPrototype(Keyword$255) && (keyword$429.token.value === 'var' && rest$422[0])) {
                    var vsRes$478 = enforestVarStatement$276(rest$422, context$419);
                    if (vsRes$478) {
                        return step$420(VariableStatement$269.create(head$421, vsRes$478.result), vsRes$478.rest);
                    }
                }
            } else {
                parser$128.assert(head$421 && head$421.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$421.token.type === parser$128.Token.Identifier || head$421.token.type === parser$128.Token.Keyword || head$421.token.type === parser$128.Token.Punctuator) && context$419.env.has(resolve$231(head$421))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$479 = fresh$237();
                    var transformerContext$480 = makeExpanderContext$287(_$127.defaults({ mark: newMark$479 }, context$419));
                    // pull the macro transformer out the environment
                    var transformer$481 = context$419.env.get(resolve$231(head$421)).fn;
                    // apply the transformer
                    var rt$482 = transformer$481([head$421].concat(rest$422), transformerContext$480);
                    if (!Array.isArray(rt$482.result)) {
                        throwError$218('Macro transformer must return a result array, not: ' + rt$482.result);
                    }
                    if (rt$482.result.length > 0) {
                        var adjustedResult$483 = adjustLineContext$277(rt$482.result, head$421);
                        adjustedResult$483[0].token.leadingComments = head$421.token.leadingComments;
                        return step$420(adjustedResult$483[0], adjustedResult$483.slice(1).concat(rt$482.rest));
                    } else {
                        return step$420(Empty$272.create(), rt$482.rest);
                    }
                }    // anon macro definition
                else if (head$421.token.type === parser$128.Token.Identifier && head$421.token.value === 'macro' && rest$422[0] && rest$422[0].token.value === '{}') {
                    return step$420(AnonMacro$263.create(rest$422[0].expose().token.inner), rest$422.slice(1));
                }    // macro definition
                else if (head$421.token.type === parser$128.Token.Identifier && head$421.token.value === 'macro' && rest$422[0] && (rest$422[0].token.type === parser$128.Token.Identifier || rest$422[0].token.type === parser$128.Token.Keyword || rest$422[0].token.type === parser$128.Token.Punctuator) && rest$422[1] && rest$422[1].token.type === parser$128.Token.Delimiter && rest$422[1].token.value === '{}') {
                    return step$420(Macro$262.create(rest$422[0], rest$422[1].expose().token.inner), rest$422.slice(2));
                }    // module definition
                else if (head$421.token.value === 'module' && rest$422[0] && rest$422[0].token.value === '{}') {
                    return step$420(Module$271.create(rest$422[0]), rest$422.slice(1));
                }    // function definition
                else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'function' && rest$422[0] && rest$422[0].token.type === parser$128.Token.Identifier && rest$422[1] && rest$422[1].token.type === parser$128.Token.Delimiter && rest$422[1].token.value === '()' && rest$422[2] && rest$422[2].token.type === parser$128.Token.Delimiter && rest$422[2].token.value === '{}') {
                    rest$422[1].token.inner = rest$422[1].expose().token.inner;
                    rest$422[2].token.inner = rest$422[2].expose().token.inner;
                    return step$420(NamedFun$259.create(head$421, rest$422[0], rest$422[1], rest$422[2]), rest$422.slice(3));
                }    // anonymous function definition
                else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'function' && rest$422[0] && rest$422[0].token.type === parser$128.Token.Delimiter && rest$422[0].token.value === '()' && rest$422[1] && rest$422[1].token.type === parser$128.Token.Delimiter && rest$422[1].token.value === '{}') {
                    rest$422[0].token.inner = rest$422[0].expose().token.inner;
                    rest$422[1].token.inner = rest$422[1].expose().token.inner;
                    return step$420(AnonFun$260.create(head$421, rest$422[0], rest$422[1]), rest$422.slice(2));
                }    // catch statement
                else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'catch' && rest$422[0] && rest$422[0].token.type === parser$128.Token.Delimiter && rest$422[0].token.value === '()' && rest$422[1] && rest$422[1].token.type === parser$128.Token.Delimiter && rest$422[1].token.value === '{}') {
                    rest$422[0].token.inner = rest$422[0].expose().token.inner;
                    rest$422[1].token.inner = rest$422[1].expose().token.inner;
                    return step$420(CatchClause$270.create(head$421, rest$422[0], rest$422[1]), rest$422.slice(2));
                }    // this expression
                else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'this') {
                    return step$420(ThisExpression$245.create(head$421), rest$422);
                }    // literal
                else if (head$421.token.type === parser$128.Token.NumericLiteral || head$421.token.type === parser$128.Token.StringLiteral || head$421.token.type === parser$128.Token.BooleanLiteral || head$421.token.type === parser$128.Token.RegularExpression || head$421.token.type === parser$128.Token.NullLiteral) {
                    return step$420(Lit$246.create(head$421), rest$422);
                }    // export
                else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'export' && rest$422[0] && (rest$422[0].token.type === parser$128.Token.Identifier || rest$422[0].token.type === parser$128.Token.Keyword || rest$422[0].token.type === parser$128.Token.Punctuator)) {
                    return step$420(Export$273.create(rest$422[0]), rest$422.slice(1));
                }    // identifier
                else if (head$421.token.type === parser$128.Token.Identifier) {
                    return step$420(Id$258.create(head$421), rest$422);
                }    // punctuator
                else if (head$421.token.type === parser$128.Token.Punctuator) {
                    return step$420(Punc$256.create(head$421), rest$422);
                } else if (head$421.token.type === parser$128.Token.Keyword && head$421.token.value === 'with') {
                    throwError$218('with is not supported in sweet.js');
                }    // keyword
                else if (head$421.token.type === parser$128.Token.Keyword) {
                    return step$420(Keyword$255.create(head$421), rest$422);
                }    // Delimiter
                else if (head$421.token.type === parser$128.Token.Delimiter) {
                    return step$420(Delimiter$257.create(head$421.expose()), rest$422);
                }    // end of file
                else if (head$421.token.type === parser$128.Token.EOF) {
                    parser$128.assert(rest$422.length === 0, 'nothing should be after an EOF');
                    return step$420(EOF$241.create(head$421), []);
                } else {
                    // todo: are we missing cases?
                    parser$128.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$421,
                rest: rest$422
            };
        }
        return step$420(toks$418[0], toks$418.slice(1));
    }
    function get_expression$279(stx$484, context$485) {
        var res$486 = enforest$278(stx$484, context$485);
        if (!res$486.result.hasPrototype(Expr$243)) {
            return {
                result: null,
                rest: stx$484
            };
        }
        return res$486;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$280(newMark$487, env$488) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$489(match$490) {
            if (match$490.level === 0) {
                // replace the match property with the marked syntax
                match$490.match = _$127.map(match$490.match, function (stx$491) {
                    return stx$491.mark(newMark$487);
                });
            } else {
                _$127.each(match$490.match, function (match$492) {
                    dfs$489(match$492);
                });
            }
        }
        _$127.keys(env$488).forEach(function (key$493) {
            dfs$489(env$488[key$493]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$281(mac$494, context$495) {
        var body$496 = mac$494.body;
        // raw function primitive form
        if (!(body$496[0] && body$496[0].token.type === parser$128.Token.Keyword && body$496[0].token.value === 'function')) {
            throwError$218('Primitive macro form must contain a function for the macro body');
        }
        var stub$497 = parser$128.read('()');
        stub$497[0].token.inner = body$496;
        var expanded$498 = expand$286(stub$497, context$495);
        expanded$498 = expanded$498[0].destruct().concat(expanded$498[1].eof);
        var flattend$499 = flatten$289(expanded$498);
        var bodyCode$500 = codegen$134.generate(parser$128.parse(flattend$499));
        var macroFn$501 = scopedEval$219(bodyCode$500, {
                makeValue: syn$129.makeValue,
                makeRegex: syn$129.makeRegex,
                makeIdent: syn$129.makeIdent,
                makeKeyword: syn$129.makeKeyword,
                makePunc: syn$129.makePunc,
                makeDelim: syn$129.makeDelim,
                unwrapSyntax: syn$129.unwrapSyntax,
                throwSyntaxError: syn$129.throwSyntaxError,
                parser: parser$128,
                _: _$127,
                patternModule: patternModule$132,
                getTemplate: function (id$502) {
                    return cloneSyntaxArray$282(context$495.templateMap.get(id$502));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$280,
                mergeMatches: function (newMatch$503, oldMatch$504) {
                    newMatch$503.patternEnv = _$127.extend({}, oldMatch$504.patternEnv, newMatch$503.patternEnv);
                    return newMatch$503;
                }
            });
        return macroFn$501;
    }
    function cloneSyntaxArray$282(arr$505) {
        return arr$505.map(function (stx$506) {
            var o$507 = syntaxFromToken$227(_$127.clone(stx$506.token), stx$506);
            if (o$507.token.type === parser$128.Token.Delimiter) {
                o$507.token.inner = cloneSyntaxArray$282(o$507.token.inner);
            }
            return o$507;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$283(stx$508, context$509) {
        parser$128.assert(context$509, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$508.length === 0) {
            return {
                terms: [],
                context: context$509
            };
        }
        parser$128.assert(stx$508[0].token, 'expecting a syntax object');
        var f$510 = enforest$278(stx$508, context$509);
        // head :: TermTree
        var head$511 = f$510.result;
        // rest :: [Syntax]
        var rest$512 = f$510.rest;
        if (head$511.hasPrototype(Macro$262)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$514 = loadMacroDef$281(head$511, context$509);
            addToDefinitionCtx$284([head$511.name], context$509.defscope, false);
            context$509.env.set(resolve$231(head$511.name), { fn: macroDefinition$514 });
            return expandToTermTree$283(rest$512, context$509);
        }
        if (head$511.hasPrototype(LetMacro$261)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$514 = loadMacroDef$281(head$511, context$509);
            var freshName$515 = fresh$237();
            var renamedName$516 = head$511.name.rename(head$511.name, freshName$515);
            rest$512 = _$127.map(rest$512, function (stx$517) {
                return stx$517.rename(head$511.name, freshName$515);
            });
            head$511.name = renamedName$516;
            context$509.env.set(resolve$231(head$511.name), { fn: macroDefinition$514 });
            return expandToTermTree$283(rest$512, context$509);
        }
        if (head$511.hasPrototype(NamedFun$259)) {
            addToDefinitionCtx$284([head$511.name], context$509.defscope, true);
        }
        if (head$511.hasPrototype(Id$258) && head$511.id.token.value === '#quoteSyntax' && rest$512[0] && rest$512[0].token.value === '{}') {
            var tempId$518 = fresh$237();
            context$509.templateMap.set(tempId$518, rest$512[0].token.inner);
            return expandToTermTree$283([
                syn$129.makeIdent('getTemplate', head$511.id),
                syn$129.makeDelim('()', [syn$129.makeValue(tempId$518, head$511.id)], head$511.id)
            ].concat(rest$512.slice(1)), context$509);
        }
        if (head$511.hasPrototype(VariableStatement$269)) {
            addToDefinitionCtx$284(_$127.map(head$511.decls, function (decl$519) {
                return decl$519.ident;
            }), context$509.defscope, true);
        }
        if (head$511.hasPrototype(Block$248) && head$511.body.hasPrototype(Delimiter$257)) {
            head$511.body.delim.token.inner.forEach(function (term$520) {
                if (term$520.hasPrototype(VariableStatement$269)) {
                    addToDefinitionCtx$284(_$127.map(term$520.decls, function (decl$521) {
                        return decl$521.ident;
                    }), context$509.defscope, true);
                }
            });
        }
        if (head$511.hasPrototype(Delimiter$257)) {
            head$511.delim.token.inner.forEach(function (term$522) {
                if (term$522.hasPrototype(VariableStatement$269)) {
                    addToDefinitionCtx$284(_$127.map(term$522.decls, function (decl$523) {
                        return decl$523.ident;
                    }), context$509.defscope, true);
                }
            });
        }
        var trees$513 = expandToTermTree$283(rest$512, context$509);
        return {
            terms: [head$511].concat(trees$513.terms),
            context: trees$513.context
        };
    }
    function addToDefinitionCtx$284(idents$524, defscope$525, skipRep$526) {
        parser$128.assert(idents$524 && idents$524.length > 0, 'expecting some variable identifiers');
        skipRep$526 = skipRep$526 || false;
        _$127.each(idents$524, function (id$527) {
            var skip$528 = false;
            if (skipRep$526) {
                var declRepeat$529 = _$127.find(defscope$525, function (def$530) {
                        return def$530.id.token.value === id$527.token.value && arraysEqual$232(marksof$230(def$530.id.context), marksof$230(id$527.context));
                    });
                skip$528 = typeof declRepeat$529 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$528) {
                var name$531 = fresh$237();
                defscope$525.push({
                    id: id$527,
                    name: name$531
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$285(term$532, context$533) {
        parser$128.assert(context$533 && context$533.env, 'environment map is required');
        if (term$532.hasPrototype(ArrayLiteral$249)) {
            term$532.array.delim.token.inner = expand$286(term$532.array.delim.expose().token.inner, context$533);
            return term$532;
        } else if (term$532.hasPrototype(Block$248)) {
            term$532.body.delim.token.inner = expand$286(term$532.body.delim.expose().token.inner, context$533);
            return term$532;
        } else if (term$532.hasPrototype(ParenExpression$250)) {
            term$532.expr.delim.token.inner = expand$286(term$532.expr.delim.expose().token.inner, context$533);
            return term$532;
        } else if (term$532.hasPrototype(Call$265)) {
            term$532.fun = expandTermTreeToFinal$285(term$532.fun, context$533);
            term$532.args = _$127.map(term$532.args, function (arg$534) {
                return expandTermTreeToFinal$285(arg$534, context$533);
            });
            return term$532;
        } else if (term$532.hasPrototype(UnaryOp$251)) {
            term$532.expr = expandTermTreeToFinal$285(term$532.expr, context$533);
            return term$532;
        } else if (term$532.hasPrototype(BinOp$253)) {
            term$532.left = expandTermTreeToFinal$285(term$532.left, context$533);
            term$532.right = expandTermTreeToFinal$285(term$532.right, context$533);
            return term$532;
        } else if (term$532.hasPrototype(ObjGet$267)) {
            term$532.right.delim.token.inner = expand$286(term$532.right.delim.expose().token.inner, context$533);
            return term$532;
        } else if (term$532.hasPrototype(ObjDotGet$266)) {
            term$532.left = expandTermTreeToFinal$285(term$532.left, context$533);
            term$532.right = expandTermTreeToFinal$285(term$532.right, context$533);
            return term$532;
        } else if (term$532.hasPrototype(VariableDeclaration$268)) {
            if (term$532.init) {
                term$532.init = expandTermTreeToFinal$285(term$532.init, context$533);
            }
            return term$532;
        } else if (term$532.hasPrototype(VariableStatement$269)) {
            term$532.decls = _$127.map(term$532.decls, function (decl$535) {
                return expandTermTreeToFinal$285(decl$535, context$533);
            });
            return term$532;
        } else if (term$532.hasPrototype(Delimiter$257)) {
            // expand inside the delimiter and then continue on
            term$532.delim.token.inner = expand$286(term$532.delim.expose().token.inner, context$533);
            return term$532;
        } else if (term$532.hasPrototype(NamedFun$259) || term$532.hasPrototype(AnonFun$260) || term$532.hasPrototype(CatchClause$270) || term$532.hasPrototype(Module$271)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$536 = [];
            var bodyContext$537 = makeExpanderContext$287(_$127.defaults({ defscope: newDef$536 }, context$533));
            if (term$532.params) {
                var params$546 = term$532.params.expose();
            } else {
                var params$546 = syn$129.makeDelim('()', [], null);
            }
            var bodies$538 = term$532.body.addDefCtx(newDef$536);
            var paramNames$539 = _$127.map(getParamIdentifiers$239(params$546), function (param$547) {
                    var freshName$548 = fresh$237();
                    return {
                        freshName: freshName$548,
                        originalParam: param$547,
                        renamedParam: param$547.rename(param$547, freshName$548)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$540 = _$127.reduce(paramNames$539, function (accBody$549, p$550) {
                    return accBody$549.rename(p$550.originalParam, p$550.freshName);
                }, bodies$538);
            renamedBody$540 = renamedBody$540.expose();
            var expandedResult$541 = expandToTermTree$283(renamedBody$540.token.inner, bodyContext$537);
            var bodyTerms$542 = expandedResult$541.terms;
            var renamedParams$543 = _$127.map(paramNames$539, function (p$551) {
                    return p$551.renamedParam;
                });
            var flatArgs$544 = syn$129.makeDelim('()', joinSyntax$228(renamedParams$543, ','), term$532.params);
            var expandedArgs$545 = expand$286([flatArgs$544], bodyContext$537);
            parser$128.assert(expandedArgs$545.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$532.params) {
                term$532.params = expandedArgs$545[0];
            }
            bodyTerms$542 = _$127.map(bodyTerms$542, function (bodyTerm$552) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$553 = bodyTerm$552.addDefCtx(newDef$536);
                // finish expansion
                return expandTermTreeToFinal$285(termWithCtx$553, expandedResult$541.context);
            });
            if (term$532.hasPrototype(Module$271)) {
                bodyTerms$542 = _$127.filter(bodyTerms$542, function (bodyTerm$554) {
                    if (bodyTerm$554.hasPrototype(Export$273)) {
                        term$532.exports.push(bodyTerm$554);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$540.token.inner = bodyTerms$542;
            term$532.body = renamedBody$540;
            // and continue expand the rest
            return term$532;
        }
        // the term is fine as is
        return term$532;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$286(stx$555, context$556) {
        parser$128.assert(context$556, 'must provide an expander context');
        var trees$557 = expandToTermTree$283(stx$555, context$556);
        return _$127.map(trees$557.terms, function (term$558) {
            return expandTermTreeToFinal$285(term$558, trees$557.context);
        });
    }
    function makeExpanderContext$287(o$559) {
        o$559 = o$559 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$559.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$559.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$559.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$559.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$288(stx$560, builtinSource$561) {
        var env$562 = new Map();
        var params$563 = [];
        var context$564, builtInContext$565 = makeExpanderContext$287({ env: env$562 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$561) {
            var builtinRead$568 = parser$128.read(builtinSource$561);
            builtinRead$568 = [
                syn$129.makeIdent('module', null),
                syn$129.makeDelim('{}', builtinRead$568, null)
            ];
            var builtinRes$569 = expand$286(builtinRead$568, builtInContext$565);
            params$563 = _$127.map(builtinRes$569[0].exports, function (term$570) {
                return {
                    oldExport: term$570.name,
                    newParam: syn$129.makeIdent(term$570.name.token.value, null)
                };
            });
        }
        var modBody$566 = syn$129.makeDelim('{}', stx$560, null);
        modBody$566 = _$127.reduce(params$563, function (acc$571, param$572) {
            var newName$573 = fresh$237();
            env$562.set(resolve$231(param$572.newParam.rename(param$572.newParam, newName$573)), env$562.get(resolve$231(param$572.oldExport)));
            return acc$571.rename(param$572.newParam, newName$573);
        }, modBody$566);
        context$564 = makeExpanderContext$287({ env: env$562 });
        var res$567 = expand$286([
                syn$129.makeIdent('module', null),
                modBody$566
            ], context$564);
        res$567 = res$567[0].destruct();
        return flatten$289(res$567[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$289(stx$574) {
        return _$127.reduce(stx$574, function (acc$575, stx$576) {
            if (stx$576.token.type === parser$128.Token.Delimiter) {
                var exposed$577 = stx$576.expose();
                var openParen$578 = syntaxFromToken$227({
                        type: parser$128.Token.Punctuator,
                        value: stx$576.token.value[0],
                        range: stx$576.token.startRange,
                        sm_range: typeof stx$576.token.sm_startRange == 'undefined' ? stx$576.token.startRange : stx$576.token.sm_startRange,
                        lineNumber: stx$576.token.startLineNumber,
                        sm_lineNumber: typeof stx$576.token.sm_startLineNumber == 'undefined' ? stx$576.token.startLineNumber : stx$576.token.sm_startLineNumber,
                        lineStart: stx$576.token.startLineStart,
                        sm_lineStart: typeof stx$576.token.sm_startLineStart == 'undefined' ? stx$576.token.startLineStart : stx$576.token.sm_startLineStart
                    }, exposed$577);
                var closeParen$579 = syntaxFromToken$227({
                        type: parser$128.Token.Punctuator,
                        value: stx$576.token.value[1],
                        range: stx$576.token.endRange,
                        sm_range: typeof stx$576.token.sm_endRange == 'undefined' ? stx$576.token.endRange : stx$576.token.sm_endRange,
                        lineNumber: stx$576.token.endLineNumber,
                        sm_lineNumber: typeof stx$576.token.sm_endLineNumber == 'undefined' ? stx$576.token.endLineNumber : stx$576.token.sm_endLineNumber,
                        lineStart: stx$576.token.endLineStart,
                        sm_lineStart: typeof stx$576.token.sm_endLineStart == 'undefined' ? stx$576.token.endLineStart : stx$576.token.sm_endLineStart
                    }, exposed$577);
                if (stx$576.token.leadingComments) {
                    openParen$578.token.leadingComments = stx$576.token.leadingComments;
                }
                if (stx$576.token.trailingComments) {
                    openParen$578.token.trailingComments = stx$576.token.trailingComments;
                }
                return acc$575.concat(openParen$578).concat(flatten$289(exposed$577.token.inner)).concat(closeParen$579);
            }
            stx$576.token.sm_lineNumber = stx$576.token.sm_lineNumber ? stx$576.token.sm_lineNumber : stx$576.token.lineNumber;
            stx$576.token.sm_lineStart = stx$576.token.sm_lineStart ? stx$576.token.sm_lineStart : stx$576.token.lineStart;
            stx$576.token.sm_range = stx$576.token.sm_range ? stx$576.token.sm_range : stx$576.token.range;
            return acc$575.concat(stx$576);
        }, []);
    }
    exports$126.enforest = enforest$278;
    exports$126.expand = expandTopLevel$288;
    exports$126.resolve = resolve$231;
    exports$126.get_expression = get_expression$279;
    exports$126.makeExpanderContext = makeExpanderContext$287;
    exports$126.Expr = Expr$243;
    exports$126.VariableStatement = VariableStatement$269;
    exports$126.tokensToSyntax = syn$129.tokensToSyntax;
    exports$126.syntaxToTokens = syn$129.syntaxToTokens;
}));