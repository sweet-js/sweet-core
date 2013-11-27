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
(function (root$110, factory$111) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$111(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$111);
    }
}(this, function (exports$112, _$113, parser$114, syn$115, es6$116, se$117, patternModule$118, gen$119) {
    'use strict';
    var codegen$120 = gen$119 || escodegen;
    // used to export "private" methods for unit testing
    exports$112._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$276 = Object.create(this);
                if (typeof o$276.construct === 'function') {
                    o$276.construct.apply(o$276, arguments);
                }
                return o$276;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$277) {
                var result$278 = Object.create(this);
                for (var prop$279 in properties$277) {
                    if (properties$277.hasOwnProperty(prop$279)) {
                        result$278[prop$279] = properties$277[prop$279];
                    }
                }
                return result$278;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$280) {
                function F$281() {
                }
                F$281.prototype = proto$280;
                return this instanceof F$281;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$204(msg$282) {
        throw new Error(msg$282);
    }
    var scopedEval$205 = se$117.scopedEval;
    var Rename$206 = syn$115.Rename;
    var Mark$207 = syn$115.Mark;
    var Var$208 = syn$115.Var;
    var Def$209 = syn$115.Def;
    var isDef$210 = syn$115.isDef;
    var isMark$211 = syn$115.isMark;
    var isRename$212 = syn$115.isRename;
    var syntaxFromToken$213 = syn$115.syntaxFromToken;
    var joinSyntax$214 = syn$115.joinSyntax;
    function remdup$215(mark$283, mlist$284) {
        if (mark$283 === _$113.first(mlist$284)) {
            return _$113.rest(mlist$284, 1);
        }
        return [mark$283].concat(mlist$284);
    }
    // (CSyntax) -> [...Num]
    function marksof$216(ctx$285, stopName$286, originalName$287) {
        var mark$288, submarks$289;
        if (isMark$211(ctx$285)) {
            mark$288 = ctx$285.mark;
            submarks$289 = marksof$216(ctx$285.context, stopName$286, originalName$287);
            return remdup$215(mark$288, submarks$289);
        }
        if (isDef$210(ctx$285)) {
            return marksof$216(ctx$285.context, stopName$286, originalName$287);
        }
        if (isRename$212(ctx$285)) {
            if (stopName$286 === originalName$287 + '$' + ctx$285.name) {
                return [];
            }
            return marksof$216(ctx$285.context, stopName$286, originalName$287);
        }
        return [];
    }
    function resolve$217(stx$290) {
        return resolveCtx$221(stx$290.token.value, stx$290.context, [], []);
    }
    function arraysEqual$218(a$291, b$292) {
        if (a$291.length !== b$292.length) {
            return false;
        }
        for (var i$293 = 0; i$293 < a$291.length; i$293++) {
            if (a$291[i$293] !== b$292[i$293]) {
                return false;
            }
        }
        return true;
    }
    function renames$219(defctx$294, oldctx$295, originalName$296) {
        var acc$297 = oldctx$295;
        for (var i$298 = 0; i$298 < defctx$294.length; i$298++) {
            if (defctx$294[i$298].id.token.value === originalName$296) {
                acc$297 = Rename$206(defctx$294[i$298].id, defctx$294[i$298].name, acc$297, defctx$294);
            }
        }
        return acc$297;
    }
    function unionEl$220(arr$299, el$300) {
        if (arr$299.indexOf(el$300) === -1) {
            var res$301 = arr$299.slice(0);
            res$301.push(el$300);
            return res$301;
        }
        return arr$299;
    }
    // (Syntax) -> String
    function resolveCtx$221(originalName$302, ctx$303, stop_spine$304, stop_branch$305) {
        if (isMark$211(ctx$303)) {
            return resolveCtx$221(originalName$302, ctx$303.context, stop_spine$304, stop_branch$305);
        }
        if (isDef$210(ctx$303)) {
            if (stop_spine$304.indexOf(ctx$303.defctx) !== -1) {
                return resolveCtx$221(originalName$302, ctx$303.context, stop_spine$304, stop_branch$305);
            } else {
                return resolveCtx$221(originalName$302, renames$219(ctx$303.defctx, ctx$303.context, originalName$302), stop_spine$304, unionEl$220(stop_branch$305, ctx$303.defctx));
            }
        }
        if (isRename$212(ctx$303)) {
            if (originalName$302 === ctx$303.id.token.value) {
                var idName$306 = resolveCtx$221(ctx$303.id.token.value, ctx$303.id.context, stop_branch$305, stop_branch$305);
                var subName$307 = resolveCtx$221(originalName$302, ctx$303.context, unionEl$220(stop_spine$304, ctx$303.def), stop_branch$305);
                if (idName$306 === subName$307) {
                    var idMarks$308 = marksof$216(ctx$303.id.context, originalName$302 + '$' + ctx$303.name, originalName$302);
                    var subMarks$309 = marksof$216(ctx$303.context, originalName$302 + '$' + ctx$303.name, originalName$302);
                    if (arraysEqual$218(idMarks$308, subMarks$309)) {
                        return originalName$302 + '$' + ctx$303.name;
                    }
                }
            }
            return resolveCtx$221(originalName$302, ctx$303.context, stop_spine$304, stop_branch$305);
        }
        return originalName$302;
    }
    var nextFresh$222 = 0;
    // fun () -> Num
    function fresh$223() {
        return nextFresh$222++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$224(towrap$310, delimSyntax$311) {
        parser$114.assert(delimSyntax$311.token.type === parser$114.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$213({
            type: parser$114.Token.Delimiter,
            value: delimSyntax$311.token.value,
            inner: towrap$310,
            range: delimSyntax$311.token.range,
            startLineNumber: delimSyntax$311.token.startLineNumber,
            lineStart: delimSyntax$311.token.lineStart
        }, delimSyntax$311);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$225(argSyntax$312) {
        parser$114.assert(argSyntax$312.token.type === parser$114.Token.Delimiter, 'expecting delimiter for function params');
        return _$113.filter(argSyntax$312.token.inner, function (stx$313) {
            return stx$313.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$226 = {
            destruct: function () {
                return _$113.reduce(this.properties, _$113.bind(function (acc$314, prop$315) {
                    if (this[prop$315] && this[prop$315].hasPrototype(TermTree$226)) {
                        return acc$314.concat(this[prop$315].destruct());
                    } else if (this[prop$315] && this[prop$315].token && this[prop$315].token.inner) {
                        this[prop$315].token.inner = _$113.reduce(this[prop$315].token.inner, function (acc$316, t$317) {
                            if (t$317.hasPrototype(TermTree$226)) {
                                return acc$316.concat(t$317.destruct());
                            }
                            return acc$316.concat(t$317);
                        }, []);
                        return acc$314.concat(this[prop$315]);
                    } else if (this[prop$315]) {
                        return acc$314.concat(this[prop$315]);
                    } else {
                        return acc$314;
                    }
                }, this), []);
            },
            addDefCtx: function (def$318) {
                for (var i$319 = 0; i$319 < this.properties.length; i$319++) {
                    var prop$320 = this.properties[i$319];
                    if (Array.isArray(this[prop$320])) {
                        this[prop$320] = _$113.map(this[prop$320], function (item$321) {
                            return item$321.addDefCtx(def$318);
                        });
                    } else if (this[prop$320]) {
                        this[prop$320] = this[prop$320].addDefCtx(def$318);
                    }
                }
                return this;
            }
        };
    var EOF$227 = TermTree$226.extend({
            properties: ['eof'],
            construct: function (e$322) {
                this.eof = e$322;
            }
        });
    var Statement$228 = TermTree$226.extend({
            construct: function () {
            }
        });
    var Expr$229 = TermTree$226.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$230 = Expr$229.extend({
            construct: function () {
            }
        });
    var ThisExpression$231 = PrimaryExpression$230.extend({
            properties: ['this'],
            construct: function (that$323) {
                this.this = that$323;
            }
        });
    var Lit$232 = PrimaryExpression$230.extend({
            properties: ['lit'],
            construct: function (l$324) {
                this.lit = l$324;
            }
        });
    exports$112._test.PropertyAssignment = PropertyAssignment$233;
    var PropertyAssignment$233 = TermTree$226.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$325, assignment$326) {
                this.propName = propName$325;
                this.assignment = assignment$326;
            }
        });
    var Block$234 = PrimaryExpression$230.extend({
            properties: ['body'],
            construct: function (body$327) {
                this.body = body$327;
            }
        });
    var ArrayLiteral$235 = PrimaryExpression$230.extend({
            properties: ['array'],
            construct: function (ar$328) {
                this.array = ar$328;
            }
        });
    var ParenExpression$236 = PrimaryExpression$230.extend({
            properties: ['expr'],
            construct: function (expr$329) {
                this.expr = expr$329;
            }
        });
    var UnaryOp$237 = Expr$229.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$330, expr$331) {
                this.op = op$330;
                this.expr = expr$331;
            }
        });
    var PostfixOp$238 = Expr$229.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$332, op$333) {
                this.expr = expr$332;
                this.op = op$333;
            }
        });
    var BinOp$239 = Expr$229.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$334, left$335, right$336) {
                this.op = op$334;
                this.left = left$335;
                this.right = right$336;
            }
        });
    var ConditionalExpression$240 = Expr$229.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$337, question$338, tru$339, colon$340, fls$341) {
                this.cond = cond$337;
                this.question = question$338;
                this.tru = tru$339;
                this.colon = colon$340;
                this.fls = fls$341;
            }
        });
    var Keyword$241 = TermTree$226.extend({
            properties: ['keyword'],
            construct: function (k$342) {
                this.keyword = k$342;
            }
        });
    var Punc$242 = TermTree$226.extend({
            properties: ['punc'],
            construct: function (p$343) {
                this.punc = p$343;
            }
        });
    var Delimiter$243 = TermTree$226.extend({
            properties: ['delim'],
            construct: function (d$344) {
                this.delim = d$344;
            }
        });
    var Id$244 = PrimaryExpression$230.extend({
            properties: ['id'],
            construct: function (id$345) {
                this.id = id$345;
            }
        });
    var NamedFun$245 = Expr$229.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$346, name$347, params$348, body$349) {
                this.keyword = keyword$346;
                this.name = name$347;
                this.params = params$348;
                this.body = body$349;
            }
        });
    var AnonFun$246 = Expr$229.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$350, params$351, body$352) {
                this.keyword = keyword$350;
                this.params = params$351;
                this.body = body$352;
            }
        });
    var LetMacro$247 = TermTree$226.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$353, body$354) {
                this.name = name$353;
                this.body = body$354;
            }
        });
    var Macro$248 = TermTree$226.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$355, body$356) {
                this.name = name$355;
                this.body = body$356;
            }
        });
    var AnonMacro$249 = TermTree$226.extend({
            properties: ['body'],
            construct: function (body$357) {
                this.body = body$357;
            }
        });
    var Const$250 = Expr$229.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$358, call$359) {
                this.newterm = newterm$358;
                this.call = call$359;
            }
        });
    var Call$251 = Expr$229.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$114.assert(this.fun.hasPrototype(TermTree$226), 'expecting a term tree in destruct of call');
                var that$360 = this;
                this.delim = syntaxFromToken$213(_$113.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$113.reduce(this.args, function (acc$361, term$362) {
                    parser$114.assert(term$362 && term$362.hasPrototype(TermTree$226), 'expecting term trees in destruct of Call');
                    var dst$363 = acc$361.concat(term$362.destruct());
                    // add all commas except for the last one
                    if (that$360.commas.length > 0) {
                        dst$363 = dst$363.concat(that$360.commas.shift());
                    }
                    return dst$363;
                }, []);
                return this.fun.destruct().concat(Delimiter$243.create(this.delim).destruct());
            },
            construct: function (funn$364, args$365, delim$366, commas$367) {
                parser$114.assert(Array.isArray(args$365), 'requires an array of arguments terms');
                this.fun = funn$364;
                this.args = args$365;
                this.delim = delim$366;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$367;
            }
        });
    var ObjDotGet$252 = Expr$229.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$368, dot$369, right$370) {
                this.left = left$368;
                this.dot = dot$369;
                this.right = right$370;
            }
        });
    var ObjGet$253 = Expr$229.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$371, right$372) {
                this.left = left$371;
                this.right = right$372;
            }
        });
    var VariableDeclaration$254 = TermTree$226.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$373, eqstx$374, init$375, comma$376) {
                this.ident = ident$373;
                this.eqstx = eqstx$374;
                this.init = init$375;
                this.comma = comma$376;
            }
        });
    var VariableStatement$255 = Statement$228.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$113.reduce(this.decls, function (acc$377, decl$378) {
                    return acc$377.concat(decl$378.destruct());
                }, []));
            },
            construct: function (varkw$379, decls$380) {
                parser$114.assert(Array.isArray(decls$380), 'decls must be an array');
                this.varkw = varkw$379;
                this.decls = decls$380;
            }
        });
    var CatchClause$256 = TermTree$226.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$381, params$382, body$383) {
                this.catchkw = catchkw$381;
                this.params = params$382;
                this.body = body$383;
            }
        });
    var Module$257 = TermTree$226.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$384) {
                this.body = body$384;
                this.exports = [];
            }
        });
    var Empty$258 = TermTree$226.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$259 = TermTree$226.extend({
            properties: ['name'],
            construct: function (name$385) {
                this.name = name$385;
            }
        });
    function stxIsUnaryOp$260(stx$386) {
        var staticOperators$387 = [
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
        return _$113.contains(staticOperators$387, stx$386.token.value);
    }
    function stxIsBinOp$261(stx$388) {
        var staticOperators$389 = [
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
        return _$113.contains(staticOperators$389, stx$388.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$262(stx$390, context$391) {
        var decls$392 = [];
        var res$393 = enforest$264(stx$390, context$391);
        var result$394 = res$393.result;
        var rest$395 = res$393.rest;
        if (rest$395[0]) {
            var nextRes$396 = enforest$264(rest$395, context$391);
            // x = ...
            if (nextRes$396.result.hasPrototype(Punc$242) && nextRes$396.result.punc.token.value === '=') {
                var initializerRes$397 = enforest$264(nextRes$396.rest, context$391);
                if (initializerRes$397.rest[0]) {
                    var restRes$398 = enforest$264(initializerRes$397.rest, context$391);
                    // x = y + z, ...
                    if (restRes$398.result.hasPrototype(Punc$242) && restRes$398.result.punc.token.value === ',') {
                        decls$392.push(VariableDeclaration$254.create(result$394.id, nextRes$396.result.punc, initializerRes$397.result, restRes$398.result.punc));
                        var subRes$399 = enforestVarStatement$262(restRes$398.rest, context$391);
                        decls$392 = decls$392.concat(subRes$399.result);
                        rest$395 = subRes$399.rest;
                    }    // x = y ...
                    else {
                        decls$392.push(VariableDeclaration$254.create(result$394.id, nextRes$396.result.punc, initializerRes$397.result));
                        rest$395 = initializerRes$397.rest;
                    }
                }    // x = y EOF
                else {
                    decls$392.push(VariableDeclaration$254.create(result$394.id, nextRes$396.result.punc, initializerRes$397.result));
                }
            }    // x ,...;
            else if (nextRes$396.result.hasPrototype(Punc$242) && nextRes$396.result.punc.token.value === ',') {
                decls$392.push(VariableDeclaration$254.create(result$394.id, null, null, nextRes$396.result.punc));
                var subRes$399 = enforestVarStatement$262(nextRes$396.rest, context$391);
                decls$392 = decls$392.concat(subRes$399.result);
                rest$395 = subRes$399.rest;
            } else {
                if (result$394.hasPrototype(Id$244)) {
                    decls$392.push(VariableDeclaration$254.create(result$394.id));
                } else {
                    throwError$204('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$394.hasPrototype(Id$244)) {
                decls$392.push(VariableDeclaration$254.create(result$394.id));
            } else if (result$394.hasPrototype(BinOp$239) && result$394.op.token.value === 'in') {
                decls$392.push(VariableDeclaration$254.create(result$394.left.id, result$394.op, result$394.right));
            } else {
                throwError$204('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$392,
            rest: rest$395
        };
    }
    function adjustLineContext$263(stx$400, original$401, current$402) {
        current$402 = current$402 || {
            lastLineNumber: original$401.token.lineNumber,
            lineNumber: original$401.token.lineNumber - 1
        };
        return _$113.map(stx$400, function (stx$403) {
            if (stx$403.token.type === parser$114.Token.Delimiter) {
                // handle tokens with missing line info
                stx$403.token.startLineNumber = typeof stx$403.token.startLineNumber == 'undefined' ? original$401.token.lineNumber : stx$403.token.startLineNumber;
                stx$403.token.endLineNumber = typeof stx$403.token.endLineNumber == 'undefined' ? original$401.token.lineNumber : stx$403.token.endLineNumber;
                stx$403.token.startLineStart = typeof stx$403.token.startLineStart == 'undefined' ? original$401.token.lineStart : stx$403.token.startLineStart;
                stx$403.token.endLineStart = typeof stx$403.token.endLineStart == 'undefined' ? original$401.token.lineStart : stx$403.token.endLineStart;
                stx$403.token.startRange = typeof stx$403.token.startRange == 'undefined' ? original$401.token.range : stx$403.token.startRange;
                stx$403.token.endRange = typeof stx$403.token.endRange == 'undefined' ? original$401.token.range : stx$403.token.endRange;
                stx$403.token.sm_startLineNumber = typeof stx$403.token.sm_startLineNumber == 'undefined' ? stx$403.token.startLineNumber : stx$403.token.sm_startLineNumber;
                stx$403.token.sm_endLineNumber = typeof stx$403.token.sm_endLineNumber == 'undefined' ? stx$403.token.endLineNumber : stx$403.token.sm_endLineNumber;
                stx$403.token.sm_startLineStart = typeof stx$403.token.sm_startLineStart == 'undefined' ? stx$403.token.startLineStart : stx$403.token.sm_startLineStart;
                stx$403.token.sm_endLineStart = typeof stx$403.token.sm_endLineStart == 'undefined' ? stx$403.token.endLineStart : stx$403.token.sm_endLineStart;
                stx$403.token.sm_startRange = typeof stx$403.token.sm_startRange == 'undefined' ? stx$403.token.startRange : stx$403.token.sm_startRange;
                stx$403.token.sm_endRange = typeof stx$403.token.sm_endRange == 'undefined' ? stx$403.token.endRange : stx$403.token.sm_endRange;
                stx$403.token.startLineNumber = original$401.token.lineNumber;
                if (stx$403.token.inner.length > 0) {
                    stx$403.token.inner = adjustLineContext$263(stx$403.token.inner, original$401, current$402);
                }
                return stx$403;
            }
            // handle tokens with missing line info
            stx$403.token.lineNumber = typeof stx$403.token.lineNumber == 'undefined' ? original$401.token.lineNumber : stx$403.token.lineNumber;
            stx$403.token.lineStart = typeof stx$403.token.lineStart == 'undefined' ? original$401.token.lineStart : stx$403.token.lineStart;
            stx$403.token.range = typeof stx$403.token.range == 'undefined' ? original$401.token.range : stx$403.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$403.token.sm_lineNumber = typeof stx$403.token.sm_lineNumber == 'undefined' ? stx$403.token.lineNumber : stx$403.token.sm_lineNumber;
            stx$403.token.sm_lineStart = typeof stx$403.token.sm_lineStart == 'undefined' ? stx$403.token.lineStart : stx$403.token.sm_lineStart;
            stx$403.token.sm_range = typeof stx$403.token.sm_range == 'undefined' ? _$113.clone(stx$403.token.range) : stx$403.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$403.token.lineNumber = original$401.token.lineNumber;
            return stx$403;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$264(toks$404, context$405) {
        parser$114.assert(toks$404.length > 0, 'enforest assumes there are tokens to work with');
        function step$406(head$407, rest$408) {
            var innerTokens$409;
            parser$114.assert(Array.isArray(rest$408), 'result must at least be an empty array');
            if (head$407.hasPrototype(TermTree$226)) {
                // function call
                var emp$412 = head$407.emp;
                var emp$412 = head$407.emp;
                var keyword$415 = head$407.keyword;
                var delim$417 = head$407.delim;
                var emp$412 = head$407.emp;
                var punc$420 = head$407.punc;
                var keyword$415 = head$407.keyword;
                var emp$412 = head$407.emp;
                var emp$412 = head$407.emp;
                var emp$412 = head$407.emp;
                var delim$417 = head$407.delim;
                var delim$417 = head$407.delim;
                var keyword$415 = head$407.keyword;
                var keyword$415 = head$407.keyword;
                if (head$407.hasPrototype(Expr$229) && (rest$408[0] && rest$408[0].token.type === parser$114.Token.Delimiter && rest$408[0].token.value === '()')) {
                    var argRes$445, enforestedArgs$446 = [], commas$447 = [];
                    rest$408[0].expose();
                    innerTokens$409 = rest$408[0].token.inner;
                    while (innerTokens$409.length > 0) {
                        argRes$445 = enforest$264(innerTokens$409, context$405);
                        enforestedArgs$446.push(argRes$445.result);
                        innerTokens$409 = argRes$445.rest;
                        if (innerTokens$409[0] && innerTokens$409[0].token.value === ',') {
                            // record the comma for later
                            commas$447.push(innerTokens$409[0]);
                            // but dump it for the next loop turn
                            innerTokens$409 = innerTokens$409.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$448 = _$113.all(enforestedArgs$446, function (argTerm$449) {
                            return argTerm$449.hasPrototype(Expr$229);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$409.length === 0 && argsAreExprs$448) {
                        return step$406(Call$251.create(head$407, enforestedArgs$446, rest$408[0], commas$447), rest$408.slice(1));
                    }
                } else if (head$407.hasPrototype(Expr$229) && (rest$408[0] && rest$408[0].token.value === '?')) {
                    var question$450 = rest$408[0];
                    var condRes$451 = enforest$264(rest$408.slice(1), context$405);
                    var truExpr$452 = condRes$451.result;
                    var right$453 = condRes$451.rest;
                    if (truExpr$452.hasPrototype(Expr$229) && right$453[0] && right$453[0].token.value === ':') {
                        var colon$454 = right$453[0];
                        var flsRes$455 = enforest$264(right$453.slice(1), context$405);
                        var flsExpr$456 = flsRes$455.result;
                        if (flsExpr$456.hasPrototype(Expr$229)) {
                            return step$406(ConditionalExpression$240.create(head$407, question$450, truExpr$452, colon$454, flsExpr$456), flsRes$455.rest);
                        }
                    }
                } else if (head$407.hasPrototype(Keyword$241) && (keyword$415.token.value === 'new' && rest$408[0])) {
                    var newCallRes$457 = enforest$264(rest$408, context$405);
                    if (newCallRes$457.result.hasPrototype(Call$251)) {
                        return step$406(Const$250.create(head$407, newCallRes$457.result), newCallRes$457.rest);
                    }
                } else if (head$407.hasPrototype(Delimiter$243) && delim$417.token.value === '()') {
                    innerTokens$409 = delim$417.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$409.length === 0) {
                        return step$406(ParenExpression$236.create(head$407), rest$408);
                    } else {
                        var innerTerm$458 = get_expression$265(innerTokens$409, context$405);
                        if (innerTerm$458.result && innerTerm$458.result.hasPrototype(Expr$229)) {
                            return step$406(ParenExpression$236.create(head$407), rest$408);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$407.hasPrototype(Expr$229) && (rest$408[0] && rest$408[1] && stxIsBinOp$261(rest$408[0]))) {
                    var op$459 = rest$408[0];
                    var left$460 = head$407;
                    var bopRes$461 = enforest$264(rest$408.slice(1), context$405);
                    var right$453 = bopRes$461.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$453.hasPrototype(Expr$229)) {
                        return step$406(BinOp$239.create(op$459, left$460, right$453), bopRes$461.rest);
                    }
                } else if (head$407.hasPrototype(Punc$242) && stxIsUnaryOp$260(punc$420)) {
                    var unopRes$462 = enforest$264(rest$408, context$405);
                    if (unopRes$462.result.hasPrototype(Expr$229)) {
                        return step$406(UnaryOp$237.create(punc$420, unopRes$462.result), unopRes$462.rest);
                    }
                } else if (head$407.hasPrototype(Keyword$241) && stxIsUnaryOp$260(keyword$415)) {
                    var unopRes$462 = enforest$264(rest$408, context$405);
                    if (unopRes$462.result.hasPrototype(Expr$229)) {
                        return step$406(UnaryOp$237.create(keyword$415, unopRes$462.result), unopRes$462.rest);
                    }
                } else if (head$407.hasPrototype(Expr$229) && (rest$408[0] && (rest$408[0].token.value === '++' || rest$408[0].token.value === '--'))) {
                    return step$406(PostfixOp$238.create(head$407, rest$408[0]), rest$408.slice(1));
                } else if (head$407.hasPrototype(Expr$229) && (rest$408[0] && rest$408[0].token.value === '[]')) {
                    return step$406(ObjGet$253.create(head$407, Delimiter$243.create(rest$408[0].expose())), rest$408.slice(1));
                } else if (head$407.hasPrototype(Expr$229) && (rest$408[0] && rest$408[0].token.value === '.' && rest$408[1] && rest$408[1].token.type === parser$114.Token.Identifier)) {
                    return step$406(ObjDotGet$252.create(head$407, rest$408[0], rest$408[1]), rest$408.slice(2));
                } else if (head$407.hasPrototype(Delimiter$243) && delim$417.token.value === '[]') {
                    return step$406(ArrayLiteral$235.create(head$407), rest$408);
                } else if (head$407.hasPrototype(Delimiter$243) && head$407.delim.token.value === '{}') {
                    return step$406(Block$234.create(head$407), rest$408);
                } else if (head$407.hasPrototype(Keyword$241) && (keyword$415.token.value === 'let' && (rest$408[0] && rest$408[0].token.type === parser$114.Token.Identifier || rest$408[0] && rest$408[0].token.type === parser$114.Token.Keyword || rest$408[0] && rest$408[0].token.type === parser$114.Token.Punctuator) && rest$408[1] && rest$408[1].token.value === '=' && rest$408[2] && rest$408[2].token.value === 'macro')) {
                    var mac$463 = enforest$264(rest$408.slice(2), context$405);
                    if (!mac$463.result.hasPrototype(AnonMacro$249)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$463.result);
                    }
                    return step$406(LetMacro$247.create(rest$408[0], mac$463.result.body), mac$463.rest);
                } else if (head$407.hasPrototype(Keyword$241) && (keyword$415.token.value === 'var' && rest$408[0])) {
                    var vsRes$464 = enforestVarStatement$262(rest$408, context$405);
                    if (vsRes$464) {
                        return step$406(VariableStatement$255.create(head$407, vsRes$464.result), vsRes$464.rest);
                    }
                }
            } else {
                parser$114.assert(head$407 && head$407.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$407.token.type === parser$114.Token.Identifier || head$407.token.type === parser$114.Token.Keyword || head$407.token.type === parser$114.Token.Punctuator) && context$405.env.has(resolve$217(head$407))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$465 = fresh$223();
                    var transformerContext$466 = makeExpanderContext$273(_$113.defaults({ mark: newMark$465 }, context$405));
                    // pull the macro transformer out the environment
                    var transformer$467 = context$405.env.get(resolve$217(head$407)).fn;
                    // apply the transformer
                    var rt$468 = transformer$467([head$407].concat(rest$408), transformerContext$466);
                    if (!Array.isArray(rt$468.result)) {
                        throwError$204('Macro transformer must return a result array, not: ' + rt$468.result);
                    }
                    if (rt$468.result.length > 0) {
                        var adjustedResult$469 = adjustLineContext$263(rt$468.result, head$407);
                        adjustedResult$469[0].token.leadingComments = head$407.token.leadingComments;
                        return step$406(adjustedResult$469[0], adjustedResult$469.slice(1).concat(rt$468.rest));
                    } else {
                        return step$406(Empty$258.create(), rt$468.rest);
                    }
                }    // anon macro definition
                else if (head$407.token.type === parser$114.Token.Identifier && head$407.token.value === 'macro' && rest$408[0] && rest$408[0].token.value === '{}') {
                    return step$406(AnonMacro$249.create(rest$408[0].expose().token.inner), rest$408.slice(1));
                }    // macro definition
                else if (head$407.token.type === parser$114.Token.Identifier && head$407.token.value === 'macro' && rest$408[0] && (rest$408[0].token.type === parser$114.Token.Identifier || rest$408[0].token.type === parser$114.Token.Keyword || rest$408[0].token.type === parser$114.Token.Punctuator) && rest$408[1] && rest$408[1].token.type === parser$114.Token.Delimiter && rest$408[1].token.value === '{}') {
                    return step$406(Macro$248.create(rest$408[0], rest$408[1].expose().token.inner), rest$408.slice(2));
                }    // module definition
                else if (head$407.token.value === 'module' && rest$408[0] && rest$408[0].token.value === '{}') {
                    return step$406(Module$257.create(rest$408[0]), rest$408.slice(1));
                }    // function definition
                else if (head$407.token.type === parser$114.Token.Keyword && head$407.token.value === 'function' && rest$408[0] && rest$408[0].token.type === parser$114.Token.Identifier && rest$408[1] && rest$408[1].token.type === parser$114.Token.Delimiter && rest$408[1].token.value === '()' && rest$408[2] && rest$408[2].token.type === parser$114.Token.Delimiter && rest$408[2].token.value === '{}') {
                    rest$408[1].token.inner = rest$408[1].expose().token.inner;
                    rest$408[2].token.inner = rest$408[2].expose().token.inner;
                    return step$406(NamedFun$245.create(head$407, rest$408[0], rest$408[1], rest$408[2]), rest$408.slice(3));
                }    // anonymous function definition
                else if (head$407.token.type === parser$114.Token.Keyword && head$407.token.value === 'function' && rest$408[0] && rest$408[0].token.type === parser$114.Token.Delimiter && rest$408[0].token.value === '()' && rest$408[1] && rest$408[1].token.type === parser$114.Token.Delimiter && rest$408[1].token.value === '{}') {
                    rest$408[0].token.inner = rest$408[0].expose().token.inner;
                    rest$408[1].token.inner = rest$408[1].expose().token.inner;
                    return step$406(AnonFun$246.create(head$407, rest$408[0], rest$408[1]), rest$408.slice(2));
                }    // catch statement
                else if (head$407.token.type === parser$114.Token.Keyword && head$407.token.value === 'catch' && rest$408[0] && rest$408[0].token.type === parser$114.Token.Delimiter && rest$408[0].token.value === '()' && rest$408[1] && rest$408[1].token.type === parser$114.Token.Delimiter && rest$408[1].token.value === '{}') {
                    rest$408[0].token.inner = rest$408[0].expose().token.inner;
                    rest$408[1].token.inner = rest$408[1].expose().token.inner;
                    return step$406(CatchClause$256.create(head$407, rest$408[0], rest$408[1]), rest$408.slice(2));
                }    // this expression
                else if (head$407.token.type === parser$114.Token.Keyword && head$407.token.value === 'this') {
                    return step$406(ThisExpression$231.create(head$407), rest$408);
                }    // literal
                else if (head$407.token.type === parser$114.Token.NumericLiteral || head$407.token.type === parser$114.Token.StringLiteral || head$407.token.type === parser$114.Token.BooleanLiteral || head$407.token.type === parser$114.Token.RegexLiteral || head$407.token.type === parser$114.Token.NullLiteral) {
                    return step$406(Lit$232.create(head$407), rest$408);
                }    // export
                else if (head$407.token.type === parser$114.Token.Identifier && head$407.token.value === 'export' && rest$408[0] && (rest$408[0].token.type === parser$114.Token.Identifier || rest$408[0].token.type === parser$114.Token.Keyword || rest$408[0].token.type === parser$114.Token.Punctuator)) {
                    return step$406(Export$259.create(rest$408[0]), rest$408.slice(1));
                }    // identifier
                else if (head$407.token.type === parser$114.Token.Identifier) {
                    return step$406(Id$244.create(head$407), rest$408);
                }    // punctuator
                else if (head$407.token.type === parser$114.Token.Punctuator) {
                    return step$406(Punc$242.create(head$407), rest$408);
                } else if (head$407.token.type === parser$114.Token.Keyword && head$407.token.value === 'with') {
                    throwError$204('with is not supported in sweet.js');
                }    // keyword
                else if (head$407.token.type === parser$114.Token.Keyword) {
                    return step$406(Keyword$241.create(head$407), rest$408);
                }    // Delimiter
                else if (head$407.token.type === parser$114.Token.Delimiter) {
                    return step$406(Delimiter$243.create(head$407.expose()), rest$408);
                }    // end of file
                else if (head$407.token.type === parser$114.Token.EOF) {
                    parser$114.assert(rest$408.length === 0, 'nothing should be after an EOF');
                    return step$406(EOF$227.create(head$407), []);
                } else {
                    // todo: are we missing cases?
                    parser$114.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$407,
                rest: rest$408
            };
        }
        return step$406(toks$404[0], toks$404.slice(1));
    }
    function get_expression$265(stx$470, context$471) {
        var res$472 = enforest$264(stx$470, context$471);
        if (!res$472.result.hasPrototype(Expr$229)) {
            return {
                result: null,
                rest: stx$470
            };
        }
        return res$472;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$266(newMark$473, env$474) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$475(match$476) {
            if (match$476.level === 0) {
                // replace the match property with the marked syntax
                match$476.match = _$113.map(match$476.match, function (stx$477) {
                    return stx$477.mark(newMark$473);
                });
            } else {
                _$113.each(match$476.match, function (match$478) {
                    dfs$475(match$478);
                });
            }
        }
        _$113.keys(env$474).forEach(function (key$479) {
            dfs$475(env$474[key$479]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$267(mac$480, context$481) {
        var body$482 = mac$480.body;
        // raw function primitive form
        if (!(body$482[0] && body$482[0].token.type === parser$114.Token.Keyword && body$482[0].token.value === 'function')) {
            throwError$204('Primitive macro form must contain a function for the macro body');
        }
        var stub$483 = parser$114.read('()');
        stub$483[0].token.inner = body$482;
        var expanded$484 = expand$272(stub$483, context$481);
        expanded$484 = expanded$484[0].destruct().concat(expanded$484[1].eof);
        var flattend$485 = flatten$275(expanded$484);
        var bodyCode$486 = codegen$120.generate(parser$114.parse(flattend$485));
        var macroFn$487 = scopedEval$205(bodyCode$486, {
                makeValue: syn$115.makeValue,
                makeRegex: syn$115.makeRegex,
                makeIdent: syn$115.makeIdent,
                makeKeyword: syn$115.makeKeyword,
                makePunc: syn$115.makePunc,
                makeDelim: syn$115.makeDelim,
                unwrapSyntax: syn$115.unwrapSyntax,
                throwSyntaxError: syn$115.throwSyntaxError,
                parser: parser$114,
                _: _$113,
                patternModule: patternModule$118,
                getTemplate: function (id$488) {
                    return cloneSyntaxArray$268(context$481.templateMap.get(id$488));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$266,
                mergeMatches: function (newMatch$489, oldMatch$490) {
                    newMatch$489.patternEnv = _$113.extend({}, oldMatch$490.patternEnv, newMatch$489.patternEnv);
                    return newMatch$489;
                }
            });
        return macroFn$487;
    }
    function cloneSyntaxArray$268(arr$491) {
        return arr$491.map(function (stx$492) {
            var o$493 = syntaxFromToken$213(_$113.clone(stx$492.token), stx$492);
            if (o$493.token.type === parser$114.Token.Delimiter) {
                o$493.token.inner = cloneSyntaxArray$268(o$493.token.inner);
            }
            return o$493;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$269(stx$494, context$495) {
        parser$114.assert(context$495, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$494.length === 0) {
            return {
                terms: [],
                context: context$495
            };
        }
        parser$114.assert(stx$494[0].token, 'expecting a syntax object');
        var f$496 = enforest$264(stx$494, context$495);
        // head :: TermTree
        var head$497 = f$496.result;
        // rest :: [Syntax]
        var rest$498 = f$496.rest;
        if (head$497.hasPrototype(Macro$248)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$500 = loadMacroDef$267(head$497, context$495);
            addToDefinitionCtx$270([head$497.name], context$495.defscope, false);
            context$495.env.set(resolve$217(head$497.name), { fn: macroDefinition$500 });
            return expandToTermTree$269(rest$498, context$495);
        }
        if (head$497.hasPrototype(LetMacro$247)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$500 = loadMacroDef$267(head$497, context$495);
            var freshName$501 = fresh$223();
            var renamedName$502 = head$497.name.rename(head$497.name, freshName$501);
            rest$498 = _$113.map(rest$498, function (stx$503) {
                return stx$503.rename(head$497.name, freshName$501);
            });
            head$497.name = renamedName$502;
            context$495.env.set(resolve$217(head$497.name), { fn: macroDefinition$500 });
            return expandToTermTree$269(rest$498, context$495);
        }
        if (head$497.hasPrototype(NamedFun$245)) {
            addToDefinitionCtx$270([head$497.name], context$495.defscope, true);
        }
        if (head$497.hasPrototype(Id$244) && head$497.id.token.value === '#quoteSyntax' && rest$498[0] && rest$498[0].token.value === '{}') {
            var tempId$504 = fresh$223();
            context$495.templateMap.set(tempId$504, rest$498[0].token.inner);
            return expandToTermTree$269([
                syn$115.makeIdent('getTemplate', head$497.id),
                syn$115.makeDelim('()', [syn$115.makeValue(tempId$504, head$497.id)], head$497.id)
            ].concat(rest$498.slice(1)), context$495);
        }
        if (head$497.hasPrototype(VariableStatement$255)) {
            addToDefinitionCtx$270(_$113.map(head$497.decls, function (decl$505) {
                return decl$505.ident;
            }), context$495.defscope, true);
        }
        if (head$497.hasPrototype(Block$234) && head$497.body.hasPrototype(Delimiter$243)) {
            head$497.body.delim.token.inner.forEach(function (term$506) {
                if (term$506.hasPrototype(VariableStatement$255)) {
                    addToDefinitionCtx$270(_$113.map(term$506.decls, function (decl$507) {
                        return decl$507.ident;
                    }), context$495.defscope, true);
                }
            });
        }
        if (head$497.hasPrototype(Delimiter$243)) {
            head$497.delim.token.inner.forEach(function (term$508) {
                if (term$508.hasPrototype(VariableStatement$255)) {
                    addToDefinitionCtx$270(_$113.map(term$508.decls, function (decl$509) {
                        return decl$509.ident;
                    }), context$495.defscope, true);
                }
            });
        }
        var trees$499 = expandToTermTree$269(rest$498, context$495);
        return {
            terms: [head$497].concat(trees$499.terms),
            context: trees$499.context
        };
    }
    function addToDefinitionCtx$270(idents$510, defscope$511, skipRep$512) {
        parser$114.assert(idents$510 && idents$510.length > 0, 'expecting some variable identifiers');
        skipRep$512 = skipRep$512 || false;
        _$113.each(idents$510, function (id$513) {
            var skip$514 = false;
            if (skipRep$512) {
                var declRepeat$515 = _$113.find(defscope$511, function (def$516) {
                        return def$516.id.token.value === id$513.token.value && arraysEqual$218(marksof$216(def$516.id.context), marksof$216(id$513.context));
                    });
                skip$514 = typeof declRepeat$515 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$514) {
                var name$517 = fresh$223();
                defscope$511.push({
                    id: id$513,
                    name: name$517
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$271(term$518, context$519) {
        parser$114.assert(context$519 && context$519.env, 'environment map is required');
        if (term$518.hasPrototype(ArrayLiteral$235)) {
            term$518.array.delim.token.inner = expand$272(term$518.array.delim.expose().token.inner, context$519);
            return term$518;
        } else if (term$518.hasPrototype(Block$234)) {
            term$518.body.delim.token.inner = expand$272(term$518.body.delim.expose().token.inner, context$519);
            return term$518;
        } else if (term$518.hasPrototype(ParenExpression$236)) {
            term$518.expr.delim.token.inner = expand$272(term$518.expr.delim.expose().token.inner, context$519);
            return term$518;
        } else if (term$518.hasPrototype(Call$251)) {
            term$518.fun = expandTermTreeToFinal$271(term$518.fun, context$519);
            term$518.args = _$113.map(term$518.args, function (arg$520) {
                return expandTermTreeToFinal$271(arg$520, context$519);
            });
            return term$518;
        } else if (term$518.hasPrototype(UnaryOp$237)) {
            term$518.expr = expandTermTreeToFinal$271(term$518.expr, context$519);
            return term$518;
        } else if (term$518.hasPrototype(BinOp$239)) {
            term$518.left = expandTermTreeToFinal$271(term$518.left, context$519);
            term$518.right = expandTermTreeToFinal$271(term$518.right, context$519);
            return term$518;
        } else if (term$518.hasPrototype(ObjGet$253)) {
            term$518.right.delim.token.inner = expand$272(term$518.right.delim.expose().token.inner, context$519);
            return term$518;
        } else if (term$518.hasPrototype(ObjDotGet$252)) {
            term$518.left = expandTermTreeToFinal$271(term$518.left, context$519);
            term$518.right = expandTermTreeToFinal$271(term$518.right, context$519);
            return term$518;
        } else if (term$518.hasPrototype(VariableDeclaration$254)) {
            if (term$518.init) {
                term$518.init = expandTermTreeToFinal$271(term$518.init, context$519);
            }
            return term$518;
        } else if (term$518.hasPrototype(VariableStatement$255)) {
            term$518.decls = _$113.map(term$518.decls, function (decl$521) {
                return expandTermTreeToFinal$271(decl$521, context$519);
            });
            return term$518;
        } else if (term$518.hasPrototype(Delimiter$243)) {
            // expand inside the delimiter and then continue on
            term$518.delim.token.inner = expand$272(term$518.delim.expose().token.inner, context$519);
            return term$518;
        } else if (term$518.hasPrototype(NamedFun$245) || term$518.hasPrototype(AnonFun$246) || term$518.hasPrototype(CatchClause$256) || term$518.hasPrototype(Module$257)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$522 = [];
            var bodyContext$523 = makeExpanderContext$273(_$113.defaults({ defscope: newDef$522 }, context$519));
            if (term$518.params) {
                var params$532 = term$518.params.expose();
            } else {
                var params$532 = syn$115.makeDelim('()', [], null);
            }
            var bodies$524 = term$518.body.addDefCtx(newDef$522);
            var paramNames$525 = _$113.map(getParamIdentifiers$225(params$532), function (param$533) {
                    var freshName$534 = fresh$223();
                    return {
                        freshName: freshName$534,
                        originalParam: param$533,
                        renamedParam: param$533.rename(param$533, freshName$534)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$526 = _$113.reduce(paramNames$525, function (accBody$535, p$536) {
                    return accBody$535.rename(p$536.originalParam, p$536.freshName);
                }, bodies$524);
            renamedBody$526 = renamedBody$526.expose();
            var expandedResult$527 = expandToTermTree$269(renamedBody$526.token.inner, bodyContext$523);
            var bodyTerms$528 = expandedResult$527.terms;
            var renamedParams$529 = _$113.map(paramNames$525, function (p$537) {
                    return p$537.renamedParam;
                });
            var flatArgs$530 = syn$115.makeDelim('()', joinSyntax$214(renamedParams$529, ','), term$518.params);
            var expandedArgs$531 = expand$272([flatArgs$530], bodyContext$523);
            parser$114.assert(expandedArgs$531.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$518.params) {
                term$518.params = expandedArgs$531[0];
            }
            bodyTerms$528 = _$113.map(bodyTerms$528, function (bodyTerm$538) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$539 = bodyTerm$538.addDefCtx(newDef$522);
                // finish expansion
                return expandTermTreeToFinal$271(termWithCtx$539, expandedResult$527.context);
            });
            if (term$518.hasPrototype(Module$257)) {
                bodyTerms$528 = _$113.filter(bodyTerms$528, function (bodyTerm$540) {
                    if (bodyTerm$540.hasPrototype(Export$259)) {
                        term$518.exports.push(bodyTerm$540);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$526.token.inner = bodyTerms$528;
            term$518.body = renamedBody$526;
            // and continue expand the rest
            return term$518;
        }
        // the term is fine as is
        return term$518;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$272(stx$541, context$542) {
        parser$114.assert(context$542, 'must provide an expander context');
        var trees$543 = expandToTermTree$269(stx$541, context$542);
        return _$113.map(trees$543.terms, function (term$544) {
            return expandTermTreeToFinal$271(term$544, trees$543.context);
        });
    }
    function makeExpanderContext$273(o$545) {
        o$545 = o$545 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$545.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$545.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$545.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$545.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$274(stx$546, builtinSource$547) {
        var env$548 = new Map();
        var params$549 = [];
        var context$550, builtInContext$551 = makeExpanderContext$273({ env: env$548 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$547) {
            var builtinRead$554 = parser$114.read(builtinSource$547);
            builtinRead$554 = [
                syn$115.makeIdent('module', null),
                syn$115.makeDelim('{}', builtinRead$554, null)
            ];
            var builtinRes$555 = expand$272(builtinRead$554, builtInContext$551);
            params$549 = _$113.map(builtinRes$555[0].exports, function (term$556) {
                return {
                    oldExport: term$556.name,
                    newParam: syn$115.makeIdent(term$556.name.token.value, null)
                };
            });
        }
        var modBody$552 = syn$115.makeDelim('{}', stx$546, null);
        modBody$552 = _$113.reduce(params$549, function (acc$557, param$558) {
            var newName$559 = fresh$223();
            env$548.set(resolve$217(param$558.newParam.rename(param$558.newParam, newName$559)), env$548.get(resolve$217(param$558.oldExport)));
            return acc$557.rename(param$558.newParam, newName$559);
        }, modBody$552);
        context$550 = makeExpanderContext$273({ env: env$548 });
        var res$553 = expand$272([
                syn$115.makeIdent('module', null),
                modBody$552
            ], context$550);
        res$553 = res$553[0].destruct();
        return flatten$275(res$553[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$275(stx$560) {
        return _$113.reduce(stx$560, function (acc$561, stx$562) {
            if (stx$562.token.type === parser$114.Token.Delimiter) {
                var exposed$563 = stx$562.expose();
                var openParen$564 = syntaxFromToken$213({
                        type: parser$114.Token.Punctuator,
                        value: stx$562.token.value[0],
                        range: stx$562.token.startRange,
                        sm_range: typeof stx$562.token.sm_startRange == 'undefined' ? stx$562.token.startRange : stx$562.token.sm_startRange,
                        lineNumber: stx$562.token.startLineNumber,
                        sm_lineNumber: typeof stx$562.token.sm_startLineNumber == 'undefined' ? stx$562.token.startLineNumber : stx$562.token.sm_startLineNumber,
                        lineStart: stx$562.token.startLineStart,
                        sm_lineStart: typeof stx$562.token.sm_startLineStart == 'undefined' ? stx$562.token.startLineStart : stx$562.token.sm_startLineStart
                    }, exposed$563);
                var closeParen$565 = syntaxFromToken$213({
                        type: parser$114.Token.Punctuator,
                        value: stx$562.token.value[1],
                        range: stx$562.token.endRange,
                        sm_range: typeof stx$562.token.sm_endRange == 'undefined' ? stx$562.token.endRange : stx$562.token.sm_endRange,
                        lineNumber: stx$562.token.endLineNumber,
                        sm_lineNumber: typeof stx$562.token.sm_endLineNumber == 'undefined' ? stx$562.token.endLineNumber : stx$562.token.sm_endLineNumber,
                        lineStart: stx$562.token.endLineStart,
                        sm_lineStart: typeof stx$562.token.sm_endLineStart == 'undefined' ? stx$562.token.endLineStart : stx$562.token.sm_endLineStart
                    }, exposed$563);
                if (stx$562.token.leadingComments) {
                    openParen$564.token.leadingComments = stx$562.token.leadingComments;
                }
                if (stx$562.token.trailingComments) {
                    openParen$564.token.trailingComments = stx$562.token.trailingComments;
                }
                return acc$561.concat(openParen$564).concat(flatten$275(exposed$563.token.inner)).concat(closeParen$565);
            }
            stx$562.token.sm_lineNumber = stx$562.token.sm_lineNumber ? stx$562.token.sm_lineNumber : stx$562.token.lineNumber;
            stx$562.token.sm_lineStart = stx$562.token.sm_lineStart ? stx$562.token.sm_lineStart : stx$562.token.lineStart;
            stx$562.token.sm_range = stx$562.token.sm_range ? stx$562.token.sm_range : stx$562.token.range;
            return acc$561.concat(stx$562);
        }, []);
    }
    exports$112.enforest = enforest$264;
    exports$112.expand = expandTopLevel$274;
    exports$112.resolve = resolve$217;
    exports$112.get_expression = get_expression$265;
    exports$112.makeExpanderContext = makeExpanderContext$273;
    exports$112.Expr = Expr$229;
    exports$112.VariableStatement = VariableStatement$255;
    exports$112.tokensToSyntax = syn$115.tokensToSyntax;
    exports$112.syntaxToTokens = syn$115.syntaxToTokens;
}));