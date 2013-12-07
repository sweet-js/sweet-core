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
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$357, name$358, params$359, body$360) {
                this.keyword = keyword$357;
                this.name = name$358;
                this.params = params$359;
                this.body = body$360;
            }
        });
    var AnonFun$257 = Expr$240.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$361, params$362, body$363) {
                this.keyword = keyword$361;
                this.params = params$362;
                this.body = body$363;
            }
        });
    var LetMacro$258 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$364, body$365) {
                this.name = name$364;
                this.body = body$365;
            }
        });
    var Macro$259 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$366, body$367) {
                this.name = name$366;
                this.body = body$367;
            }
        });
    var AnonMacro$260 = TermTree$237.extend({
            properties: ['body'],
            construct: function (body$368) {
                this.body = body$368;
            }
        });
    var Const$261 = Expr$240.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$369, call$370) {
                this.newterm = newterm$369;
                this.call = call$370;
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
                var that$371 = this;
                this.delim = syntaxFromToken$224(_$124.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$124.reduce(this.args, function (acc$372, term$373) {
                    parser$125.assert(term$373 && term$373.hasPrototype(TermTree$237), 'expecting term trees in destruct of Call');
                    var dst$374 = acc$372.concat(term$373.destruct());
                    // add all commas except for the last one
                    if (that$371.commas.length > 0) {
                        dst$374 = dst$374.concat(that$371.commas.shift());
                    }
                    return dst$374;
                }, []);
                return this.fun.destruct().concat(Delimiter$254.create(this.delim).destruct());
            },
            construct: function (funn$375, args$376, delim$377, commas$378) {
                parser$125.assert(Array.isArray(args$376), 'requires an array of arguments terms');
                this.fun = funn$375;
                this.args = args$376;
                this.delim = delim$377;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$378;
            }
        });
    var ObjDotGet$263 = Expr$240.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$379, dot$380, right$381) {
                this.left = left$379;
                this.dot = dot$380;
                this.right = right$381;
            }
        });
    var ObjGet$264 = Expr$240.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$382, right$383) {
                this.left = left$382;
                this.right = right$383;
            }
        });
    var VariableDeclaration$265 = TermTree$237.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$384, eqstx$385, init$386, comma$387) {
                this.ident = ident$384;
                this.eqstx = eqstx$385;
                this.init = init$386;
                this.comma = comma$387;
            }
        });
    var VariableStatement$266 = Statement$239.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$124.reduce(this.decls, function (acc$388, decl$389) {
                    return acc$388.concat(decl$389.destruct());
                }, []));
            },
            construct: function (varkw$390, decls$391) {
                parser$125.assert(Array.isArray(decls$391), 'decls must be an array');
                this.varkw = varkw$390;
                this.decls = decls$391;
            }
        });
    var CatchClause$267 = TermTree$237.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$392, params$393, body$394) {
                this.catchkw = catchkw$392;
                this.params = params$393;
                this.body = body$394;
            }
        });
    var Module$268 = TermTree$237.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$395) {
                this.body = body$395;
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
            construct: function (name$396) {
                this.name = name$396;
            }
        });
    function stxIsUnaryOp$271(stx$397) {
        var staticOperators$398 = [
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
        return _$124.contains(staticOperators$398, stx$397.token.value);
    }
    function stxIsBinOp$272(stx$399) {
        var staticOperators$400 = [
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
        return _$124.contains(staticOperators$400, stx$399.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$273(stx$401, context$402) {
        var decls$403 = [];
        var res$404 = enforest$275(stx$401, context$402);
        var result$405 = res$404.result;
        var rest$406 = res$404.rest;
        if (rest$406[0]) {
            var nextRes$407 = enforest$275(rest$406, context$402);
            // x = ...
            if (nextRes$407.result.hasPrototype(Punc$253) && nextRes$407.result.punc.token.value === '=') {
                var initializerRes$408 = enforest$275(nextRes$407.rest, context$402);
                if (initializerRes$408.rest[0]) {
                    var restRes$409 = enforest$275(initializerRes$408.rest, context$402);
                    // x = y + z, ...
                    if (restRes$409.result.hasPrototype(Punc$253) && restRes$409.result.punc.token.value === ',') {
                        decls$403.push(VariableDeclaration$265.create(result$405.id, nextRes$407.result.punc, initializerRes$408.result, restRes$409.result.punc));
                        var subRes$410 = enforestVarStatement$273(restRes$409.rest, context$402);
                        decls$403 = decls$403.concat(subRes$410.result);
                        rest$406 = subRes$410.rest;
                    }    // x = y ...
                    else {
                        decls$403.push(VariableDeclaration$265.create(result$405.id, nextRes$407.result.punc, initializerRes$408.result));
                        rest$406 = initializerRes$408.rest;
                    }
                }    // x = y EOF
                else {
                    decls$403.push(VariableDeclaration$265.create(result$405.id, nextRes$407.result.punc, initializerRes$408.result));
                }
            }    // x ,...;
            else if (nextRes$407.result.hasPrototype(Punc$253) && nextRes$407.result.punc.token.value === ',') {
                decls$403.push(VariableDeclaration$265.create(result$405.id, null, null, nextRes$407.result.punc));
                var subRes$410 = enforestVarStatement$273(nextRes$407.rest, context$402);
                decls$403 = decls$403.concat(subRes$410.result);
                rest$406 = subRes$410.rest;
            } else {
                if (result$405.hasPrototype(Id$255)) {
                    decls$403.push(VariableDeclaration$265.create(result$405.id));
                } else {
                    throwError$215('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$405.hasPrototype(Id$255)) {
                decls$403.push(VariableDeclaration$265.create(result$405.id));
            } else if (result$405.hasPrototype(BinOp$250) && result$405.op.token.value === 'in') {
                decls$403.push(VariableDeclaration$265.create(result$405.left.id, result$405.op, result$405.right));
            } else {
                throwError$215('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$403,
            rest: rest$406
        };
    }
    function adjustLineContext$274(stx$411, original$412, current$413) {
        current$413 = current$413 || {
            lastLineNumber: original$412.token.lineNumber,
            lineNumber: original$412.token.lineNumber - 1
        };
        return _$124.map(stx$411, function (stx$414) {
            if (stx$414.token.type === parser$125.Token.Delimiter) {
                // handle tokens with missing line info
                stx$414.token.startLineNumber = typeof stx$414.token.startLineNumber == 'undefined' ? original$412.token.lineNumber : stx$414.token.startLineNumber;
                stx$414.token.endLineNumber = typeof stx$414.token.endLineNumber == 'undefined' ? original$412.token.lineNumber : stx$414.token.endLineNumber;
                stx$414.token.startLineStart = typeof stx$414.token.startLineStart == 'undefined' ? original$412.token.lineStart : stx$414.token.startLineStart;
                stx$414.token.endLineStart = typeof stx$414.token.endLineStart == 'undefined' ? original$412.token.lineStart : stx$414.token.endLineStart;
                stx$414.token.startRange = typeof stx$414.token.startRange == 'undefined' ? original$412.token.range : stx$414.token.startRange;
                stx$414.token.endRange = typeof stx$414.token.endRange == 'undefined' ? original$412.token.range : stx$414.token.endRange;
                stx$414.token.sm_startLineNumber = typeof stx$414.token.sm_startLineNumber == 'undefined' ? stx$414.token.startLineNumber : stx$414.token.sm_startLineNumber;
                stx$414.token.sm_endLineNumber = typeof stx$414.token.sm_endLineNumber == 'undefined' ? stx$414.token.endLineNumber : stx$414.token.sm_endLineNumber;
                stx$414.token.sm_startLineStart = typeof stx$414.token.sm_startLineStart == 'undefined' ? stx$414.token.startLineStart : stx$414.token.sm_startLineStart;
                stx$414.token.sm_endLineStart = typeof stx$414.token.sm_endLineStart == 'undefined' ? stx$414.token.endLineStart : stx$414.token.sm_endLineStart;
                stx$414.token.sm_startRange = typeof stx$414.token.sm_startRange == 'undefined' ? stx$414.token.startRange : stx$414.token.sm_startRange;
                stx$414.token.sm_endRange = typeof stx$414.token.sm_endRange == 'undefined' ? stx$414.token.endRange : stx$414.token.sm_endRange;
                stx$414.token.startLineNumber = original$412.token.lineNumber;
                if (stx$414.token.inner.length > 0) {
                    stx$414.token.inner = adjustLineContext$274(stx$414.token.inner, original$412, current$413);
                }
                return stx$414;
            }
            // handle tokens with missing line info
            stx$414.token.lineNumber = typeof stx$414.token.lineNumber == 'undefined' ? original$412.token.lineNumber : stx$414.token.lineNumber;
            stx$414.token.lineStart = typeof stx$414.token.lineStart == 'undefined' ? original$412.token.lineStart : stx$414.token.lineStart;
            stx$414.token.range = typeof stx$414.token.range == 'undefined' ? original$412.token.range : stx$414.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$414.token.sm_lineNumber = typeof stx$414.token.sm_lineNumber == 'undefined' ? stx$414.token.lineNumber : stx$414.token.sm_lineNumber;
            stx$414.token.sm_lineStart = typeof stx$414.token.sm_lineStart == 'undefined' ? stx$414.token.lineStart : stx$414.token.sm_lineStart;
            stx$414.token.sm_range = typeof stx$414.token.sm_range == 'undefined' ? _$124.clone(stx$414.token.range) : stx$414.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$414.token.lineNumber = original$412.token.lineNumber;
            return stx$414;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$275(toks$415, context$416) {
        parser$125.assert(toks$415.length > 0, 'enforest assumes there are tokens to work with');
        function step$417(head$418, rest$419) {
            var innerTokens$420;
            parser$125.assert(Array.isArray(rest$419), 'result must at least be an empty array');
            if (head$418.hasPrototype(TermTree$237)) {
                // function call
                var emp$423 = head$418.emp;
                var emp$423 = head$418.emp;
                var keyword$426 = head$418.keyword;
                var delim$428 = head$418.delim;
                var emp$423 = head$418.emp;
                var punc$431 = head$418.punc;
                var keyword$426 = head$418.keyword;
                var emp$423 = head$418.emp;
                var emp$423 = head$418.emp;
                var emp$423 = head$418.emp;
                var delim$428 = head$418.delim;
                var delim$428 = head$418.delim;
                var keyword$426 = head$418.keyword;
                var keyword$426 = head$418.keyword;
                if (head$418.hasPrototype(Expr$240) && (rest$419[0] && rest$419[0].token.type === parser$125.Token.Delimiter && rest$419[0].token.value === '()')) {
                    var argRes$456, enforestedArgs$457 = [], commas$458 = [];
                    rest$419[0].expose();
                    innerTokens$420 = rest$419[0].token.inner;
                    while (innerTokens$420.length > 0) {
                        argRes$456 = enforest$275(innerTokens$420, context$416);
                        enforestedArgs$457.push(argRes$456.result);
                        innerTokens$420 = argRes$456.rest;
                        if (innerTokens$420[0] && innerTokens$420[0].token.value === ',') {
                            // record the comma for later
                            commas$458.push(innerTokens$420[0]);
                            // but dump it for the next loop turn
                            innerTokens$420 = innerTokens$420.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$459 = _$124.all(enforestedArgs$457, function (argTerm$460) {
                            return argTerm$460.hasPrototype(Expr$240);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$420.length === 0 && argsAreExprs$459) {
                        return step$417(Call$262.create(head$418, enforestedArgs$457, rest$419[0], commas$458), rest$419.slice(1));
                    }
                } else if (head$418.hasPrototype(Expr$240) && (rest$419[0] && rest$419[0].token.value === '?')) {
                    var question$461 = rest$419[0];
                    var condRes$462 = enforest$275(rest$419.slice(1), context$416);
                    var truExpr$463 = condRes$462.result;
                    var right$464 = condRes$462.rest;
                    if (truExpr$463.hasPrototype(Expr$240) && right$464[0] && right$464[0].token.value === ':') {
                        var colon$465 = right$464[0];
                        var flsRes$466 = enforest$275(right$464.slice(1), context$416);
                        var flsExpr$467 = flsRes$466.result;
                        if (flsExpr$467.hasPrototype(Expr$240)) {
                            return step$417(ConditionalExpression$251.create(head$418, question$461, truExpr$463, colon$465, flsExpr$467), flsRes$466.rest);
                        }
                    }
                } else if (head$418.hasPrototype(Keyword$252) && (keyword$426.token.value === 'new' && rest$419[0])) {
                    var newCallRes$468 = enforest$275(rest$419, context$416);
                    if (newCallRes$468.result.hasPrototype(Call$262)) {
                        return step$417(Const$261.create(head$418, newCallRes$468.result), newCallRes$468.rest);
                    }
                } else if (head$418.hasPrototype(Delimiter$254) && delim$428.token.value === '()') {
                    innerTokens$420 = delim$428.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$420.length === 0) {
                        return step$417(ParenExpression$247.create(head$418), rest$419);
                    } else {
                        var innerTerm$469 = get_expression$276(innerTokens$420, context$416);
                        if (innerTerm$469.result && innerTerm$469.result.hasPrototype(Expr$240)) {
                            return step$417(ParenExpression$247.create(head$418), rest$419);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$418.hasPrototype(Expr$240) && (rest$419[0] && rest$419[1] && stxIsBinOp$272(rest$419[0]))) {
                    var op$470 = rest$419[0];
                    var left$471 = head$418;
                    var bopRes$472 = enforest$275(rest$419.slice(1), context$416);
                    var right$464 = bopRes$472.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$464.hasPrototype(Expr$240)) {
                        return step$417(BinOp$250.create(op$470, left$471, right$464), bopRes$472.rest);
                    }
                } else if (head$418.hasPrototype(Punc$253) && stxIsUnaryOp$271(punc$431)) {
                    var unopRes$473 = enforest$275(rest$419, context$416);
                    if (unopRes$473.result.hasPrototype(Expr$240)) {
                        return step$417(UnaryOp$248.create(punc$431, unopRes$473.result), unopRes$473.rest);
                    }
                } else if (head$418.hasPrototype(Keyword$252) && stxIsUnaryOp$271(keyword$426)) {
                    var unopRes$473 = enforest$275(rest$419, context$416);
                    if (unopRes$473.result.hasPrototype(Expr$240)) {
                        return step$417(UnaryOp$248.create(keyword$426, unopRes$473.result), unopRes$473.rest);
                    }
                } else if (head$418.hasPrototype(Expr$240) && (rest$419[0] && (rest$419[0].token.value === '++' || rest$419[0].token.value === '--'))) {
                    return step$417(PostfixOp$249.create(head$418, rest$419[0]), rest$419.slice(1));
                } else if (head$418.hasPrototype(Expr$240) && (rest$419[0] && rest$419[0].token.value === '[]')) {
                    return step$417(ObjGet$264.create(head$418, Delimiter$254.create(rest$419[0].expose())), rest$419.slice(1));
                } else if (head$418.hasPrototype(Expr$240) && (rest$419[0] && rest$419[0].token.value === '.' && rest$419[1] && rest$419[1].token.type === parser$125.Token.Identifier)) {
                    return step$417(ObjDotGet$263.create(head$418, rest$419[0], rest$419[1]), rest$419.slice(2));
                } else if (head$418.hasPrototype(Delimiter$254) && delim$428.token.value === '[]') {
                    return step$417(ArrayLiteral$246.create(head$418), rest$419);
                } else if (head$418.hasPrototype(Delimiter$254) && head$418.delim.token.value === '{}') {
                    return step$417(Block$245.create(head$418), rest$419);
                } else if (head$418.hasPrototype(Keyword$252) && (keyword$426.token.value === 'let' && (rest$419[0] && rest$419[0].token.type === parser$125.Token.Identifier || rest$419[0] && rest$419[0].token.type === parser$125.Token.Keyword || rest$419[0] && rest$419[0].token.type === parser$125.Token.Punctuator) && rest$419[1] && rest$419[1].token.value === '=' && rest$419[2] && rest$419[2].token.value === 'macro')) {
                    var mac$474 = enforest$275(rest$419.slice(2), context$416);
                    if (!mac$474.result.hasPrototype(AnonMacro$260)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$474.result);
                    }
                    return step$417(LetMacro$258.create(rest$419[0], mac$474.result.body), mac$474.rest);
                } else if (head$418.hasPrototype(Keyword$252) && (keyword$426.token.value === 'var' && rest$419[0])) {
                    var vsRes$475 = enforestVarStatement$273(rest$419, context$416);
                    if (vsRes$475) {
                        return step$417(VariableStatement$266.create(head$418, vsRes$475.result), vsRes$475.rest);
                    }
                }
            } else {
                parser$125.assert(head$418 && head$418.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$418.token.type === parser$125.Token.Identifier || head$418.token.type === parser$125.Token.Keyword || head$418.token.type === parser$125.Token.Punctuator) && context$416.env.has(resolve$228(head$418))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$476 = fresh$234();
                    var transformerContext$477 = makeExpanderContext$284(_$124.defaults({ mark: newMark$476 }, context$416));
                    // pull the macro transformer out the environment
                    var transformer$478 = context$416.env.get(resolve$228(head$418)).fn;
                    // apply the transformer
                    var rt$479 = transformer$478([head$418].concat(rest$419), transformerContext$477);
                    if (!Array.isArray(rt$479.result)) {
                        throwError$215('Macro transformer must return a result array, not: ' + rt$479.result);
                    }
                    if (rt$479.result.length > 0) {
                        var adjustedResult$480 = adjustLineContext$274(rt$479.result, head$418);
                        adjustedResult$480[0].token.leadingComments = head$418.token.leadingComments;
                        return step$417(adjustedResult$480[0], adjustedResult$480.slice(1).concat(rt$479.rest));
                    } else {
                        return step$417(Empty$269.create(), rt$479.rest);
                    }
                }    // anon macro definition
                else if (head$418.token.type === parser$125.Token.Identifier && head$418.token.value === 'macro' && rest$419[0] && rest$419[0].token.value === '{}') {
                    return step$417(AnonMacro$260.create(rest$419[0].expose().token.inner), rest$419.slice(1));
                }    // macro definition
                else if (head$418.token.type === parser$125.Token.Identifier && head$418.token.value === 'macro' && rest$419[0] && (rest$419[0].token.type === parser$125.Token.Identifier || rest$419[0].token.type === parser$125.Token.Keyword || rest$419[0].token.type === parser$125.Token.Punctuator) && rest$419[1] && rest$419[1].token.type === parser$125.Token.Delimiter && rest$419[1].token.value === '{}') {
                    return step$417(Macro$259.create(rest$419[0], rest$419[1].expose().token.inner), rest$419.slice(2));
                }    // module definition
                else if (head$418.token.value === 'module' && rest$419[0] && rest$419[0].token.value === '{}') {
                    return step$417(Module$268.create(rest$419[0]), rest$419.slice(1));
                }    // function definition
                else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'function' && rest$419[0] && rest$419[0].token.type === parser$125.Token.Identifier && rest$419[1] && rest$419[1].token.type === parser$125.Token.Delimiter && rest$419[1].token.value === '()' && rest$419[2] && rest$419[2].token.type === parser$125.Token.Delimiter && rest$419[2].token.value === '{}') {
                    rest$419[1].token.inner = rest$419[1].expose().token.inner;
                    rest$419[2].token.inner = rest$419[2].expose().token.inner;
                    return step$417(NamedFun$256.create(head$418, rest$419[0], rest$419[1], rest$419[2]), rest$419.slice(3));
                }    // anonymous function definition
                else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'function' && rest$419[0] && rest$419[0].token.type === parser$125.Token.Delimiter && rest$419[0].token.value === '()' && rest$419[1] && rest$419[1].token.type === parser$125.Token.Delimiter && rest$419[1].token.value === '{}') {
                    rest$419[0].token.inner = rest$419[0].expose().token.inner;
                    rest$419[1].token.inner = rest$419[1].expose().token.inner;
                    return step$417(AnonFun$257.create(head$418, rest$419[0], rest$419[1]), rest$419.slice(2));
                }    // catch statement
                else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'catch' && rest$419[0] && rest$419[0].token.type === parser$125.Token.Delimiter && rest$419[0].token.value === '()' && rest$419[1] && rest$419[1].token.type === parser$125.Token.Delimiter && rest$419[1].token.value === '{}') {
                    rest$419[0].token.inner = rest$419[0].expose().token.inner;
                    rest$419[1].token.inner = rest$419[1].expose().token.inner;
                    return step$417(CatchClause$267.create(head$418, rest$419[0], rest$419[1]), rest$419.slice(2));
                }    // this expression
                else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'this') {
                    return step$417(ThisExpression$242.create(head$418), rest$419);
                }    // literal
                else if (head$418.token.type === parser$125.Token.NumericLiteral || head$418.token.type === parser$125.Token.StringLiteral || head$418.token.type === parser$125.Token.BooleanLiteral || head$418.token.type === parser$125.Token.RegularExpression || head$418.token.type === parser$125.Token.NullLiteral) {
                    return step$417(Lit$243.create(head$418), rest$419);
                }    // export
                else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'export' && rest$419[0] && (rest$419[0].token.type === parser$125.Token.Identifier || rest$419[0].token.type === parser$125.Token.Keyword || rest$419[0].token.type === parser$125.Token.Punctuator)) {
                    return step$417(Export$270.create(rest$419[0]), rest$419.slice(1));
                }    // identifier
                else if (head$418.token.type === parser$125.Token.Identifier) {
                    return step$417(Id$255.create(head$418), rest$419);
                }    // punctuator
                else if (head$418.token.type === parser$125.Token.Punctuator) {
                    return step$417(Punc$253.create(head$418), rest$419);
                } else if (head$418.token.type === parser$125.Token.Keyword && head$418.token.value === 'with') {
                    throwError$215('with is not supported in sweet.js');
                }    // keyword
                else if (head$418.token.type === parser$125.Token.Keyword) {
                    return step$417(Keyword$252.create(head$418), rest$419);
                }    // Delimiter
                else if (head$418.token.type === parser$125.Token.Delimiter) {
                    return step$417(Delimiter$254.create(head$418.expose()), rest$419);
                }    // end of file
                else if (head$418.token.type === parser$125.Token.EOF) {
                    parser$125.assert(rest$419.length === 0, 'nothing should be after an EOF');
                    return step$417(EOF$238.create(head$418), []);
                } else {
                    // todo: are we missing cases?
                    parser$125.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$418,
                rest: rest$419
            };
        }
        return step$417(toks$415[0], toks$415.slice(1));
    }
    function get_expression$276(stx$481, context$482) {
        var res$483 = enforest$275(stx$481, context$482);
        if (!res$483.result.hasPrototype(Expr$240)) {
            return {
                result: null,
                rest: stx$481
            };
        }
        return res$483;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$277(newMark$484, env$485) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$486(match$487) {
            if (match$487.level === 0) {
                // replace the match property with the marked syntax
                match$487.match = _$124.map(match$487.match, function (stx$488) {
                    return stx$488.mark(newMark$484);
                });
            } else {
                _$124.each(match$487.match, function (match$489) {
                    dfs$486(match$489);
                });
            }
        }
        _$124.keys(env$485).forEach(function (key$490) {
            dfs$486(env$485[key$490]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$278(mac$491, context$492) {
        var body$493 = mac$491.body;
        // raw function primitive form
        if (!(body$493[0] && body$493[0].token.type === parser$125.Token.Keyword && body$493[0].token.value === 'function')) {
            throwError$215('Primitive macro form must contain a function for the macro body');
        }
        var stub$494 = parser$125.read('()');
        stub$494[0].token.inner = body$493;
        var expanded$495 = expand$283(stub$494, context$492);
        expanded$495 = expanded$495[0].destruct().concat(expanded$495[1].eof);
        var flattend$496 = flatten$286(expanded$495);
        var bodyCode$497 = codegen$131.generate(parser$125.parse(flattend$496));
        var macroFn$498 = scopedEval$216(bodyCode$497, {
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
                getTemplate: function (id$499) {
                    return cloneSyntaxArray$279(context$492.templateMap.get(id$499));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$277,
                mergeMatches: function (newMatch$500, oldMatch$501) {
                    newMatch$500.patternEnv = _$124.extend({}, oldMatch$501.patternEnv, newMatch$500.patternEnv);
                    return newMatch$500;
                }
            });
        return macroFn$498;
    }
    function cloneSyntaxArray$279(arr$502) {
        return arr$502.map(function (stx$503) {
            var o$504 = syntaxFromToken$224(_$124.clone(stx$503.token), stx$503);
            if (o$504.token.type === parser$125.Token.Delimiter) {
                o$504.token.inner = cloneSyntaxArray$279(o$504.token.inner);
            }
            return o$504;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$280(stx$505, context$506) {
        parser$125.assert(context$506, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$505.length === 0) {
            return {
                terms: [],
                context: context$506
            };
        }
        parser$125.assert(stx$505[0].token, 'expecting a syntax object');
        var f$507 = enforest$275(stx$505, context$506);
        // head :: TermTree
        var head$508 = f$507.result;
        // rest :: [Syntax]
        var rest$509 = f$507.rest;
        if (head$508.hasPrototype(Macro$259)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$511 = loadMacroDef$278(head$508, context$506);
            addToDefinitionCtx$281([head$508.name], context$506.defscope, false);
            context$506.env.set(resolve$228(head$508.name), { fn: macroDefinition$511 });
            return expandToTermTree$280(rest$509, context$506);
        }
        if (head$508.hasPrototype(LetMacro$258)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$511 = loadMacroDef$278(head$508, context$506);
            var freshName$512 = fresh$234();
            var renamedName$513 = head$508.name.rename(head$508.name, freshName$512);
            rest$509 = _$124.map(rest$509, function (stx$514) {
                return stx$514.rename(head$508.name, freshName$512);
            });
            head$508.name = renamedName$513;
            context$506.env.set(resolve$228(head$508.name), { fn: macroDefinition$511 });
            return expandToTermTree$280(rest$509, context$506);
        }
        if (head$508.hasPrototype(NamedFun$256)) {
            addToDefinitionCtx$281([head$508.name], context$506.defscope, true);
        }
        if (head$508.hasPrototype(Id$255) && head$508.id.token.value === '#quoteSyntax' && rest$509[0] && rest$509[0].token.value === '{}') {
            var tempId$515 = fresh$234();
            context$506.templateMap.set(tempId$515, rest$509[0].token.inner);
            return expandToTermTree$280([
                syn$126.makeIdent('getTemplate', head$508.id),
                syn$126.makeDelim('()', [syn$126.makeValue(tempId$515, head$508.id)], head$508.id)
            ].concat(rest$509.slice(1)), context$506);
        }
        if (head$508.hasPrototype(VariableStatement$266)) {
            addToDefinitionCtx$281(_$124.map(head$508.decls, function (decl$516) {
                return decl$516.ident;
            }), context$506.defscope, true);
        }
        if (head$508.hasPrototype(Block$245) && head$508.body.hasPrototype(Delimiter$254)) {
            head$508.body.delim.token.inner.forEach(function (term$517) {
                if (term$517.hasPrototype(VariableStatement$266)) {
                    addToDefinitionCtx$281(_$124.map(term$517.decls, function (decl$518) {
                        return decl$518.ident;
                    }), context$506.defscope, true);
                }
            });
        }
        if (head$508.hasPrototype(Delimiter$254)) {
            head$508.delim.token.inner.forEach(function (term$519) {
                if (term$519.hasPrototype(VariableStatement$266)) {
                    addToDefinitionCtx$281(_$124.map(term$519.decls, function (decl$520) {
                        return decl$520.ident;
                    }), context$506.defscope, true);
                }
            });
        }
        var trees$510 = expandToTermTree$280(rest$509, context$506);
        return {
            terms: [head$508].concat(trees$510.terms),
            context: trees$510.context
        };
    }
    function addToDefinitionCtx$281(idents$521, defscope$522, skipRep$523) {
        parser$125.assert(idents$521 && idents$521.length > 0, 'expecting some variable identifiers');
        skipRep$523 = skipRep$523 || false;
        _$124.each(idents$521, function (id$524) {
            var skip$525 = false;
            if (skipRep$523) {
                var declRepeat$526 = _$124.find(defscope$522, function (def$527) {
                        return def$527.id.token.value === id$524.token.value && arraysEqual$229(marksof$227(def$527.id.context), marksof$227(id$524.context));
                    });
                skip$525 = typeof declRepeat$526 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$525) {
                var name$528 = fresh$234();
                defscope$522.push({
                    id: id$524,
                    name: name$528
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$282(term$529, context$530) {
        parser$125.assert(context$530 && context$530.env, 'environment map is required');
        if (term$529.hasPrototype(ArrayLiteral$246)) {
            term$529.array.delim.token.inner = expand$283(term$529.array.delim.expose().token.inner, context$530);
            return term$529;
        } else if (term$529.hasPrototype(Block$245)) {
            term$529.body.delim.token.inner = expand$283(term$529.body.delim.expose().token.inner, context$530);
            return term$529;
        } else if (term$529.hasPrototype(ParenExpression$247)) {
            term$529.expr.delim.token.inner = expand$283(term$529.expr.delim.expose().token.inner, context$530);
            return term$529;
        } else if (term$529.hasPrototype(Call$262)) {
            term$529.fun = expandTermTreeToFinal$282(term$529.fun, context$530);
            term$529.args = _$124.map(term$529.args, function (arg$531) {
                return expandTermTreeToFinal$282(arg$531, context$530);
            });
            return term$529;
        } else if (term$529.hasPrototype(UnaryOp$248)) {
            term$529.expr = expandTermTreeToFinal$282(term$529.expr, context$530);
            return term$529;
        } else if (term$529.hasPrototype(BinOp$250)) {
            term$529.left = expandTermTreeToFinal$282(term$529.left, context$530);
            term$529.right = expandTermTreeToFinal$282(term$529.right, context$530);
            return term$529;
        } else if (term$529.hasPrototype(ObjGet$264)) {
            term$529.right.delim.token.inner = expand$283(term$529.right.delim.expose().token.inner, context$530);
            return term$529;
        } else if (term$529.hasPrototype(ObjDotGet$263)) {
            term$529.left = expandTermTreeToFinal$282(term$529.left, context$530);
            term$529.right = expandTermTreeToFinal$282(term$529.right, context$530);
            return term$529;
        } else if (term$529.hasPrototype(VariableDeclaration$265)) {
            if (term$529.init) {
                term$529.init = expandTermTreeToFinal$282(term$529.init, context$530);
            }
            return term$529;
        } else if (term$529.hasPrototype(VariableStatement$266)) {
            term$529.decls = _$124.map(term$529.decls, function (decl$532) {
                return expandTermTreeToFinal$282(decl$532, context$530);
            });
            return term$529;
        } else if (term$529.hasPrototype(Delimiter$254)) {
            // expand inside the delimiter and then continue on
            term$529.delim.token.inner = expand$283(term$529.delim.expose().token.inner, context$530);
            return term$529;
        } else if (term$529.hasPrototype(NamedFun$256) || term$529.hasPrototype(AnonFun$257) || term$529.hasPrototype(CatchClause$267) || term$529.hasPrototype(Module$268)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$533 = [];
            var bodyContext$534 = makeExpanderContext$284(_$124.defaults({ defscope: newDef$533 }, context$530));
            if (term$529.params) {
                var params$543 = term$529.params.expose();
            } else {
                var params$543 = syn$126.makeDelim('()', [], null);
            }
            var bodies$535 = term$529.body.addDefCtx(newDef$533);
            var paramNames$536 = _$124.map(getParamIdentifiers$236(params$543), function (param$544) {
                    var freshName$545 = fresh$234();
                    return {
                        freshName: freshName$545,
                        originalParam: param$544,
                        renamedParam: param$544.rename(param$544, freshName$545)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$537 = _$124.reduce(paramNames$536, function (accBody$546, p$547) {
                    return accBody$546.rename(p$547.originalParam, p$547.freshName);
                }, bodies$535);
            renamedBody$537 = renamedBody$537.expose();
            var expandedResult$538 = expandToTermTree$280(renamedBody$537.token.inner, bodyContext$534);
            var bodyTerms$539 = expandedResult$538.terms;
            var renamedParams$540 = _$124.map(paramNames$536, function (p$548) {
                    return p$548.renamedParam;
                });
            var flatArgs$541 = syn$126.makeDelim('()', joinSyntax$225(renamedParams$540, ','), term$529.params);
            var expandedArgs$542 = expand$283([flatArgs$541], bodyContext$534);
            parser$125.assert(expandedArgs$542.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$529.params) {
                term$529.params = expandedArgs$542[0];
            }
            bodyTerms$539 = _$124.map(bodyTerms$539, function (bodyTerm$549) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$550 = bodyTerm$549.addDefCtx(newDef$533);
                // finish expansion
                return expandTermTreeToFinal$282(termWithCtx$550, expandedResult$538.context);
            });
            if (term$529.hasPrototype(Module$268)) {
                bodyTerms$539 = _$124.filter(bodyTerms$539, function (bodyTerm$551) {
                    if (bodyTerm$551.hasPrototype(Export$270)) {
                        term$529.exports.push(bodyTerm$551);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$537.token.inner = bodyTerms$539;
            term$529.body = renamedBody$537;
            // and continue expand the rest
            return term$529;
        }
        // the term is fine as is
        return term$529;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$283(stx$552, context$553) {
        parser$125.assert(context$553, 'must provide an expander context');
        var trees$554 = expandToTermTree$280(stx$552, context$553);
        return _$124.map(trees$554.terms, function (term$555) {
            return expandTermTreeToFinal$282(term$555, trees$554.context);
        });
    }
    function makeExpanderContext$284(o$556) {
        o$556 = o$556 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$556.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$556.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$556.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$556.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$285(stx$557, builtinSource$558) {
        var env$559 = new Map();
        var params$560 = [];
        var context$561, builtInContext$562 = makeExpanderContext$284({ env: env$559 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$558) {
            var builtinRead$565 = parser$125.read(builtinSource$558);
            builtinRead$565 = [
                syn$126.makeIdent('module', null),
                syn$126.makeDelim('{}', builtinRead$565, null)
            ];
            var builtinRes$566 = expand$283(builtinRead$565, builtInContext$562);
            params$560 = _$124.map(builtinRes$566[0].exports, function (term$567) {
                return {
                    oldExport: term$567.name,
                    newParam: syn$126.makeIdent(term$567.name.token.value, null)
                };
            });
        }
        var modBody$563 = syn$126.makeDelim('{}', stx$557, null);
        modBody$563 = _$124.reduce(params$560, function (acc$568, param$569) {
            var newName$570 = fresh$234();
            env$559.set(resolve$228(param$569.newParam.rename(param$569.newParam, newName$570)), env$559.get(resolve$228(param$569.oldExport)));
            return acc$568.rename(param$569.newParam, newName$570);
        }, modBody$563);
        context$561 = makeExpanderContext$284({ env: env$559 });
        var res$564 = expand$283([
                syn$126.makeIdent('module', null),
                modBody$563
            ], context$561);
        res$564 = res$564[0].destruct();
        return flatten$286(res$564[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$286(stx$571) {
        return _$124.reduce(stx$571, function (acc$572, stx$573) {
            if (stx$573.token.type === parser$125.Token.Delimiter) {
                var exposed$574 = stx$573.expose();
                var openParen$575 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$573.token.value[0],
                        range: stx$573.token.startRange,
                        sm_range: typeof stx$573.token.sm_startRange == 'undefined' ? stx$573.token.startRange : stx$573.token.sm_startRange,
                        lineNumber: stx$573.token.startLineNumber,
                        sm_lineNumber: typeof stx$573.token.sm_startLineNumber == 'undefined' ? stx$573.token.startLineNumber : stx$573.token.sm_startLineNumber,
                        lineStart: stx$573.token.startLineStart,
                        sm_lineStart: typeof stx$573.token.sm_startLineStart == 'undefined' ? stx$573.token.startLineStart : stx$573.token.sm_startLineStart
                    }, exposed$574);
                var closeParen$576 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$573.token.value[1],
                        range: stx$573.token.endRange,
                        sm_range: typeof stx$573.token.sm_endRange == 'undefined' ? stx$573.token.endRange : stx$573.token.sm_endRange,
                        lineNumber: stx$573.token.endLineNumber,
                        sm_lineNumber: typeof stx$573.token.sm_endLineNumber == 'undefined' ? stx$573.token.endLineNumber : stx$573.token.sm_endLineNumber,
                        lineStart: stx$573.token.endLineStart,
                        sm_lineStart: typeof stx$573.token.sm_endLineStart == 'undefined' ? stx$573.token.endLineStart : stx$573.token.sm_endLineStart
                    }, exposed$574);
                if (stx$573.token.leadingComments) {
                    openParen$575.token.leadingComments = stx$573.token.leadingComments;
                }
                if (stx$573.token.trailingComments) {
                    openParen$575.token.trailingComments = stx$573.token.trailingComments;
                }
                return acc$572.concat(openParen$575).concat(flatten$286(exposed$574.token.inner)).concat(closeParen$576);
            }
            stx$573.token.sm_lineNumber = stx$573.token.sm_lineNumber ? stx$573.token.sm_lineNumber : stx$573.token.lineNumber;
            stx$573.token.sm_lineStart = stx$573.token.sm_lineStart ? stx$573.token.sm_lineStart : stx$573.token.lineStart;
            stx$573.token.sm_range = stx$573.token.sm_range ? stx$573.token.sm_range : stx$573.token.range;
            return acc$572.concat(stx$573);
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