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
                var o$288 = Object.create(this);
                if (typeof o$288.construct === 'function') {
                    o$288.construct.apply(o$288, arguments);
                }
                return o$288;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$289) {
                var result$290 = Object.create(this);
                for (var prop$291 in properties$289) {
                    if (properties$289.hasOwnProperty(prop$291)) {
                        result$290[prop$291] = properties$289[prop$291];
                    }
                }
                return result$290;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$292) {
                function F$293() {
                }
                F$293.prototype = proto$292;
                return this instanceof F$293;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$215(msg$294) {
        throw new Error(msg$294);
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
    function remdup$226(mark$295, mlist$296) {
        if (mark$295 === _$124.first(mlist$296)) {
            return _$124.rest(mlist$296, 1);
        }
        return [mark$295].concat(mlist$296);
    }
    // (CSyntax) -> [...Num]
    function marksof$227(ctx$297, stopName$298, originalName$299) {
        var mark$300, submarks$301;
        if (isMark$222(ctx$297)) {
            mark$300 = ctx$297.mark;
            submarks$301 = marksof$227(ctx$297.context, stopName$298, originalName$299);
            return remdup$226(mark$300, submarks$301);
        }
        if (isDef$221(ctx$297)) {
            return marksof$227(ctx$297.context, stopName$298, originalName$299);
        }
        if (isRename$223(ctx$297)) {
            if (stopName$298 === originalName$299 + '$' + ctx$297.name) {
                return [];
            }
            return marksof$227(ctx$297.context, stopName$298, originalName$299);
        }
        return [];
    }
    function resolve$228(stx$302) {
        return resolveCtx$232(stx$302.token.value, stx$302.context, [], []);
    }
    function arraysEqual$229(a$303, b$304) {
        if (a$303.length !== b$304.length) {
            return false;
        }
        for (var i$305 = 0; i$305 < a$303.length; i$305++) {
            if (a$303[i$305] !== b$304[i$305]) {
                return false;
            }
        }
        return true;
    }
    function renames$230(defctx$306, oldctx$307, originalName$308) {
        var acc$309 = oldctx$307;
        for (var i$310 = 0; i$310 < defctx$306.length; i$310++) {
            if (defctx$306[i$310].id.token.value === originalName$308) {
                acc$309 = Rename$217(defctx$306[i$310].id, defctx$306[i$310].name, acc$309, defctx$306);
            }
        }
        return acc$309;
    }
    function unionEl$231(arr$311, el$312) {
        if (arr$311.indexOf(el$312) === -1) {
            var res$313 = arr$311.slice(0);
            res$313.push(el$312);
            return res$313;
        }
        return arr$311;
    }
    // (Syntax) -> String
    function resolveCtx$232(originalName$314, ctx$315, stop_spine$316, stop_branch$317) {
        if (isMark$222(ctx$315)) {
            return resolveCtx$232(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
        }
        if (isDef$221(ctx$315)) {
            if (stop_spine$316.indexOf(ctx$315.defctx) !== -1) {
                return resolveCtx$232(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
            } else {
                return resolveCtx$232(originalName$314, renames$230(ctx$315.defctx, ctx$315.context, originalName$314), stop_spine$316, unionEl$231(stop_branch$317, ctx$315.defctx));
            }
        }
        if (isRename$223(ctx$315)) {
            if (originalName$314 === ctx$315.id.token.value) {
                var idName$318 = resolveCtx$232(ctx$315.id.token.value, ctx$315.id.context, stop_branch$317, stop_branch$317);
                var subName$319 = resolveCtx$232(originalName$314, ctx$315.context, unionEl$231(stop_spine$316, ctx$315.def), stop_branch$317);
                if (idName$318 === subName$319) {
                    var idMarks$320 = marksof$227(ctx$315.id.context, originalName$314 + '$' + ctx$315.name, originalName$314);
                    var subMarks$321 = marksof$227(ctx$315.context, originalName$314 + '$' + ctx$315.name, originalName$314);
                    if (arraysEqual$229(idMarks$320, subMarks$321)) {
                        return originalName$314 + '$' + ctx$315.name;
                    }
                }
            }
            return resolveCtx$232(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
        }
        return originalName$314;
    }
    var nextFresh$233 = 0;
    // fun () -> Num
    function fresh$234() {
        return nextFresh$233++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$235(towrap$322, delimSyntax$323) {
        parser$125.assert(delimSyntax$323.token.type === parser$125.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$224({
            type: parser$125.Token.Delimiter,
            value: delimSyntax$323.token.value,
            inner: towrap$322,
            range: delimSyntax$323.token.range,
            startLineNumber: delimSyntax$323.token.startLineNumber,
            lineStart: delimSyntax$323.token.lineStart
        }, delimSyntax$323);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$236(argSyntax$324) {
        if (argSyntax$324.token.type === parser$125.Token.Delimiter) {
            return _$124.filter(argSyntax$324.token.inner, function (stx$325) {
                return stx$325.token.value !== ',';
            });
        } else if (argSyntax$324.token.type === parser$125.Token.Identifier) {
            return [argSyntax$324];
        } else {
            parser$125.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$237 = {
            destruct: function () {
                return _$124.reduce(this.properties, _$124.bind(function (acc$326, prop$327) {
                    if (this[prop$327] && this[prop$327].hasPrototype(TermTree$237)) {
                        return acc$326.concat(this[prop$327].destruct());
                    } else if (this[prop$327] && this[prop$327].token && this[prop$327].token.inner) {
                        this[prop$327].token.inner = _$124.reduce(this[prop$327].token.inner, function (acc$328, t$329) {
                            if (t$329.hasPrototype(TermTree$237)) {
                                return acc$328.concat(t$329.destruct());
                            }
                            return acc$328.concat(t$329);
                        }, []);
                        return acc$326.concat(this[prop$327]);
                    } else if (Array.isArray(this[prop$327])) {
                        return acc$326.concat(_$124.reduce(this[prop$327], function (acc$330, t$331) {
                            if (t$331.hasPrototype(TermTree$237)) {
                                return acc$330.concat(t$331.destruct());
                            }
                            return acc$330.concat(t$331);
                        }, []));
                    } else if (this[prop$327]) {
                        return acc$326.concat(this[prop$327]);
                    } else {
                        return acc$326;
                    }
                }, this), []);
            },
            addDefCtx: function (def$332) {
                for (var i$333 = 0; i$333 < this.properties.length; i$333++) {
                    var prop$334 = this.properties[i$333];
                    if (Array.isArray(this[prop$334])) {
                        this[prop$334] = _$124.map(this[prop$334], function (item$335) {
                            return item$335.addDefCtx(def$332);
                        });
                    } else if (this[prop$334]) {
                        this[prop$334] = this[prop$334].addDefCtx(def$332);
                    }
                }
                return this;
            }
        };
    var EOF$238 = TermTree$237.extend({
            properties: ['eof'],
            construct: function (e$336) {
                this.eof = e$336;
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
            construct: function (that$337) {
                this.this = that$337;
            }
        });
    var Lit$243 = PrimaryExpression$241.extend({
            properties: ['lit'],
            construct: function (l$338) {
                this.lit = l$338;
            }
        });
    exports$123._test.PropertyAssignment = PropertyAssignment$244;
    var PropertyAssignment$244 = TermTree$237.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$339, assignment$340) {
                this.propName = propName$339;
                this.assignment = assignment$340;
            }
        });
    var Block$245 = PrimaryExpression$241.extend({
            properties: ['body'],
            construct: function (body$341) {
                this.body = body$341;
            }
        });
    var ArrayLiteral$246 = PrimaryExpression$241.extend({
            properties: ['array'],
            construct: function (ar$342) {
                this.array = ar$342;
            }
        });
    var ParenExpression$247 = PrimaryExpression$241.extend({
            properties: ['expr'],
            construct: function (expr$343) {
                this.expr = expr$343;
            }
        });
    var UnaryOp$248 = Expr$240.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$344, expr$345) {
                this.op = op$344;
                this.expr = expr$345;
            }
        });
    var PostfixOp$249 = Expr$240.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$346, op$347) {
                this.expr = expr$346;
                this.op = op$347;
            }
        });
    var BinOp$250 = Expr$240.extend({
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
    var ConditionalExpression$251 = Expr$240.extend({
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
    var Keyword$252 = TermTree$237.extend({
            properties: ['keyword'],
            construct: function (k$356) {
                this.keyword = k$356;
            }
        });
    var Punc$253 = TermTree$237.extend({
            properties: ['punc'],
            construct: function (p$357) {
                this.punc = p$357;
            }
        });
    var Delimiter$254 = TermTree$237.extend({
            properties: ['delim'],
            construct: function (d$358) {
                this.delim = d$358;
            }
        });
    var Id$255 = PrimaryExpression$241.extend({
            properties: ['id'],
            construct: function (id$359) {
                this.id = id$359;
            }
        });
    var NamedFun$256 = Expr$240.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$360, star$361, name$362, params$363, body$364) {
                this.keyword = keyword$360;
                this.star = star$361;
                this.name = name$362;
                this.params = params$363;
                this.body = body$364;
            }
        });
    var AnonFun$257 = Expr$240.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$365, star$366, params$367, body$368) {
                this.keyword = keyword$365;
                this.star = star$366;
                this.params = params$367;
                this.body = body$368;
            }
        });
    var ArrowFun$258 = Expr$240.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$369, arrow$370, body$371) {
                this.params = params$369;
                this.arrow = arrow$370;
                this.body = body$371;
            }
        });
    var LetMacro$259 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$372, body$373) {
                this.name = name$372;
                this.body = body$373;
            }
        });
    var Macro$260 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$374, body$375) {
                this.name = name$374;
                this.body = body$375;
            }
        });
    var AnonMacro$261 = TermTree$237.extend({
            properties: ['body'],
            construct: function (body$376) {
                this.body = body$376;
            }
        });
    var Const$262 = Expr$240.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$377, call$378) {
                this.newterm = newterm$377;
                this.call = call$378;
            }
        });
    var Call$263 = Expr$240.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$125.assert(this.fun.hasPrototype(TermTree$237), 'expecting a term tree in destruct of call');
                var that$379 = this;
                this.delim = syntaxFromToken$224(_$124.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$124.reduce(this.args, function (acc$380, term$381) {
                    parser$125.assert(term$381 && term$381.hasPrototype(TermTree$237), 'expecting term trees in destruct of Call');
                    var dst$382 = acc$380.concat(term$381.destruct());
                    // add all commas except for the last one
                    if (that$379.commas.length > 0) {
                        dst$382 = dst$382.concat(that$379.commas.shift());
                    }
                    return dst$382;
                }, []);
                return this.fun.destruct().concat(Delimiter$254.create(this.delim).destruct());
            },
            construct: function (funn$383, args$384, delim$385, commas$386) {
                parser$125.assert(Array.isArray(args$384), 'requires an array of arguments terms');
                this.fun = funn$383;
                this.args = args$384;
                this.delim = delim$385;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$386;
            }
        });
    var ObjDotGet$264 = Expr$240.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$387, dot$388, right$389) {
                this.left = left$387;
                this.dot = dot$388;
                this.right = right$389;
            }
        });
    var ObjGet$265 = Expr$240.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$390, right$391) {
                this.left = left$390;
                this.right = right$391;
            }
        });
    var VariableDeclaration$266 = TermTree$237.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$392, eqstx$393, init$394, comma$395) {
                this.ident = ident$392;
                this.eqstx = eqstx$393;
                this.init = init$394;
                this.comma = comma$395;
            }
        });
    var VariableStatement$267 = Statement$239.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$124.reduce(this.decls, function (acc$396, decl$397) {
                    return acc$396.concat(decl$397.destruct());
                }, []));
            },
            construct: function (varkw$398, decls$399) {
                parser$125.assert(Array.isArray(decls$399), 'decls must be an array');
                this.varkw = varkw$398;
                this.decls = decls$399;
            }
        });
    var CatchClause$268 = TermTree$237.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$400, params$401, body$402) {
                this.catchkw = catchkw$400;
                this.params = params$401;
                this.body = body$402;
            }
        });
    var Module$269 = TermTree$237.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$403) {
                this.body = body$403;
                this.exports = [];
            }
        });
    var Empty$270 = TermTree$237.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$271 = TermTree$237.extend({
            properties: ['name'],
            construct: function (name$404) {
                this.name = name$404;
            }
        });
    function stxIsUnaryOp$272(stx$405) {
        var staticOperators$406 = [
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
        return _$124.contains(staticOperators$406, stx$405.token.value);
    }
    function stxIsBinOp$273(stx$407) {
        var staticOperators$408 = [
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
        return _$124.contains(staticOperators$408, stx$407.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$274(stx$409, context$410) {
        var decls$411 = [];
        var res$412 = enforest$276(stx$409, context$410);
        var result$413 = res$412.result;
        var rest$414 = res$412.rest;
        if (rest$414[0]) {
            var nextRes$415 = enforest$276(rest$414, context$410);
            // x = ...
            if (nextRes$415.result.hasPrototype(Punc$253) && nextRes$415.result.punc.token.value === '=') {
                var initializerRes$416 = enforest$276(nextRes$415.rest, context$410);
                if (initializerRes$416.rest[0]) {
                    var restRes$417 = enforest$276(initializerRes$416.rest, context$410);
                    // x = y + z, ...
                    if (restRes$417.result.hasPrototype(Punc$253) && restRes$417.result.punc.token.value === ',') {
                        decls$411.push(VariableDeclaration$266.create(result$413.id, nextRes$415.result.punc, initializerRes$416.result, restRes$417.result.punc));
                        var subRes$418 = enforestVarStatement$274(restRes$417.rest, context$410);
                        decls$411 = decls$411.concat(subRes$418.result);
                        rest$414 = subRes$418.rest;
                    }    // x = y ...
                    else {
                        decls$411.push(VariableDeclaration$266.create(result$413.id, nextRes$415.result.punc, initializerRes$416.result));
                        rest$414 = initializerRes$416.rest;
                    }
                }    // x = y EOF
                else {
                    decls$411.push(VariableDeclaration$266.create(result$413.id, nextRes$415.result.punc, initializerRes$416.result));
                }
            }    // x ,...;
            else if (nextRes$415.result.hasPrototype(Punc$253) && nextRes$415.result.punc.token.value === ',') {
                decls$411.push(VariableDeclaration$266.create(result$413.id, null, null, nextRes$415.result.punc));
                var subRes$418 = enforestVarStatement$274(nextRes$415.rest, context$410);
                decls$411 = decls$411.concat(subRes$418.result);
                rest$414 = subRes$418.rest;
            } else {
                if (result$413.hasPrototype(Id$255)) {
                    decls$411.push(VariableDeclaration$266.create(result$413.id));
                } else {
                    throwError$215('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$413.hasPrototype(Id$255)) {
                decls$411.push(VariableDeclaration$266.create(result$413.id));
            } else if (result$413.hasPrototype(BinOp$250) && result$413.op.token.value === 'in') {
                decls$411.push(VariableDeclaration$266.create(result$413.left.id, result$413.op, result$413.right));
            } else {
                throwError$215('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$411,
            rest: rest$414
        };
    }
    function adjustLineContext$275(stx$419, original$420, current$421) {
        current$421 = current$421 || {
            lastLineNumber: original$420.token.lineNumber,
            lineNumber: original$420.token.lineNumber - 1
        };
        return _$124.map(stx$419, function (stx$422) {
            if (stx$422.token.type === parser$125.Token.Delimiter) {
                // handle tokens with missing line info
                stx$422.token.startLineNumber = typeof stx$422.token.startLineNumber == 'undefined' ? original$420.token.lineNumber : stx$422.token.startLineNumber;
                stx$422.token.endLineNumber = typeof stx$422.token.endLineNumber == 'undefined' ? original$420.token.lineNumber : stx$422.token.endLineNumber;
                stx$422.token.startLineStart = typeof stx$422.token.startLineStart == 'undefined' ? original$420.token.lineStart : stx$422.token.startLineStart;
                stx$422.token.endLineStart = typeof stx$422.token.endLineStart == 'undefined' ? original$420.token.lineStart : stx$422.token.endLineStart;
                stx$422.token.startRange = typeof stx$422.token.startRange == 'undefined' ? original$420.token.range : stx$422.token.startRange;
                stx$422.token.endRange = typeof stx$422.token.endRange == 'undefined' ? original$420.token.range : stx$422.token.endRange;
                stx$422.token.sm_startLineNumber = typeof stx$422.token.sm_startLineNumber == 'undefined' ? stx$422.token.startLineNumber : stx$422.token.sm_startLineNumber;
                stx$422.token.sm_endLineNumber = typeof stx$422.token.sm_endLineNumber == 'undefined' ? stx$422.token.endLineNumber : stx$422.token.sm_endLineNumber;
                stx$422.token.sm_startLineStart = typeof stx$422.token.sm_startLineStart == 'undefined' ? stx$422.token.startLineStart : stx$422.token.sm_startLineStart;
                stx$422.token.sm_endLineStart = typeof stx$422.token.sm_endLineStart == 'undefined' ? stx$422.token.endLineStart : stx$422.token.sm_endLineStart;
                stx$422.token.sm_startRange = typeof stx$422.token.sm_startRange == 'undefined' ? stx$422.token.startRange : stx$422.token.sm_startRange;
                stx$422.token.sm_endRange = typeof stx$422.token.sm_endRange == 'undefined' ? stx$422.token.endRange : stx$422.token.sm_endRange;
                stx$422.token.startLineNumber = original$420.token.lineNumber;
                if (stx$422.token.inner.length > 0) {
                    stx$422.token.inner = adjustLineContext$275(stx$422.token.inner, original$420, current$421);
                }
                return stx$422;
            }
            // handle tokens with missing line info
            stx$422.token.lineNumber = typeof stx$422.token.lineNumber == 'undefined' ? original$420.token.lineNumber : stx$422.token.lineNumber;
            stx$422.token.lineStart = typeof stx$422.token.lineStart == 'undefined' ? original$420.token.lineStart : stx$422.token.lineStart;
            stx$422.token.range = typeof stx$422.token.range == 'undefined' ? original$420.token.range : stx$422.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$422.token.sm_lineNumber = typeof stx$422.token.sm_lineNumber == 'undefined' ? stx$422.token.lineNumber : stx$422.token.sm_lineNumber;
            stx$422.token.sm_lineStart = typeof stx$422.token.sm_lineStart == 'undefined' ? stx$422.token.lineStart : stx$422.token.sm_lineStart;
            stx$422.token.sm_range = typeof stx$422.token.sm_range == 'undefined' ? _$124.clone(stx$422.token.range) : stx$422.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$422.token.lineNumber = original$420.token.lineNumber;
            return stx$422;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$276(toks$423, context$424) {
        parser$125.assert(toks$423.length > 0, 'enforest assumes there are tokens to work with');
        function step$425(head$426, rest$427) {
            var innerTokens$428;
            parser$125.assert(Array.isArray(rest$427), 'result must at least be an empty array');
            if (head$426.hasPrototype(TermTree$237)) {
                // function call
                var emp$431 = head$426.emp;
                var emp$431 = head$426.emp;
                var keyword$434 = head$426.keyword;
                var delim$436 = head$426.delim;
                var id$438 = head$426.id;
                var delim$436 = head$426.delim;
                var emp$431 = head$426.emp;
                var punc$442 = head$426.punc;
                var keyword$434 = head$426.keyword;
                var emp$431 = head$426.emp;
                var emp$431 = head$426.emp;
                var emp$431 = head$426.emp;
                var delim$436 = head$426.delim;
                var delim$436 = head$426.delim;
                var keyword$434 = head$426.keyword;
                var keyword$434 = head$426.keyword;
                if (head$426.hasPrototype(Expr$240) && rest$427[0] && rest$427[0].token.type === parser$125.Token.Delimiter && rest$427[0].token.value === '()') {
                    var argRes$469, enforestedArgs$470 = [], commas$471 = [];
                    rest$427[0].expose();
                    innerTokens$428 = rest$427[0].token.inner;
                    while (innerTokens$428.length > 0) {
                        argRes$469 = enforest$276(innerTokens$428, context$424);
                        enforestedArgs$470.push(argRes$469.result);
                        innerTokens$428 = argRes$469.rest;
                        if (innerTokens$428[0] && innerTokens$428[0].token.value === ',') {
                            // record the comma for later
                            commas$471.push(innerTokens$428[0]);
                            // but dump it for the next loop turn
                            innerTokens$428 = innerTokens$428.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$472 = _$124.all(enforestedArgs$470, function (argTerm$473) {
                            return argTerm$473.hasPrototype(Expr$240);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$428.length === 0 && argsAreExprs$472) {
                        return step$425(Call$263.create(head$426, enforestedArgs$470, rest$427[0], commas$471), rest$427.slice(1));
                    }
                } else if (head$426.hasPrototype(Expr$240) && rest$427[0] && rest$427[0].token.value === '?') {
                    var question$474 = rest$427[0];
                    var condRes$475 = enforest$276(rest$427.slice(1), context$424);
                    var truExpr$476 = condRes$475.result;
                    var right$477 = condRes$475.rest;
                    if (truExpr$476.hasPrototype(Expr$240) && right$477[0] && right$477[0].token.value === ':') {
                        var colon$478 = right$477[0];
                        var flsRes$479 = enforest$276(right$477.slice(1), context$424);
                        var flsExpr$480 = flsRes$479.result;
                        if (flsExpr$480.hasPrototype(Expr$240)) {
                            return step$425(ConditionalExpression$251.create(head$426, question$474, truExpr$476, colon$478, flsExpr$480), flsRes$479.rest);
                        }
                    }
                } else if (head$426.hasPrototype(Keyword$252) && keyword$434.token.value === 'new' && rest$427[0]) {
                    var newCallRes$481 = enforest$276(rest$427, context$424);
                    if (newCallRes$481.result.hasPrototype(Call$263)) {
                        return step$425(Const$262.create(head$426, newCallRes$481.result), newCallRes$481.rest);
                    }
                } else if (head$426.hasPrototype(Delimiter$254) && delim$436.token.value === '()' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator && rest$427[0].token.value === '=>') {
                    var res$482 = enforest$276(rest$427.slice(1), context$424);
                    if (res$482.result.hasPrototype(Expr$240)) {
                        return step$425(ArrowFun$258.create(delim$436, rest$427[0], res$482.result.destruct()), res$482.rest);
                    } else {
                        throwError$215('Body of arrow function must be an expression');
                    }
                } else if (head$426.hasPrototype(Id$255) && rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator && rest$427[0].token.value === '=>') {
                    var res$482 = enforest$276(rest$427.slice(1), context$424);
                    if (res$482.result.hasPrototype(Expr$240)) {
                        return step$425(ArrowFun$258.create(id$438, rest$427[0], res$482.result.destruct()), res$482.rest);
                    } else {
                        throwError$215('Body of arrow function must be an expression');
                    }
                } else if (head$426.hasPrototype(Delimiter$254) && delim$436.token.value === '()') {
                    innerTokens$428 = delim$436.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$428.length === 0) {
                        return step$425(ParenExpression$247.create(head$426), rest$427);
                    } else {
                        var innerTerm$483 = get_expression$277(innerTokens$428, context$424);
                        if (innerTerm$483.result && innerTerm$483.result.hasPrototype(Expr$240)) {
                            return step$425(ParenExpression$247.create(head$426), rest$427);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$426.hasPrototype(Expr$240) && rest$427[0] && rest$427[1] && stxIsBinOp$273(rest$427[0])) {
                    var op$484 = rest$427[0];
                    var left$485 = head$426;
                    var bopRes$486 = enforest$276(rest$427.slice(1), context$424);
                    var right$477 = bopRes$486.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$477.hasPrototype(Expr$240)) {
                        return step$425(BinOp$250.create(op$484, left$485, right$477), bopRes$486.rest);
                    }
                } else if (head$426.hasPrototype(Punc$253) && stxIsUnaryOp$272(punc$442)) {
                    var unopRes$487 = enforest$276(rest$427, context$424);
                    if (unopRes$487.result.hasPrototype(Expr$240)) {
                        return step$425(UnaryOp$248.create(punc$442, unopRes$487.result), unopRes$487.rest);
                    }
                } else if (head$426.hasPrototype(Keyword$252) && stxIsUnaryOp$272(keyword$434)) {
                    var unopRes$487 = enforest$276(rest$427, context$424);
                    if (unopRes$487.result.hasPrototype(Expr$240)) {
                        return step$425(UnaryOp$248.create(keyword$434, unopRes$487.result), unopRes$487.rest);
                    }
                } else if (head$426.hasPrototype(Expr$240) && rest$427[0] && (rest$427[0].token.value === '++' || rest$427[0].token.value === '--')) {
                    return step$425(PostfixOp$249.create(head$426, rest$427[0]), rest$427.slice(1));
                } else if (head$426.hasPrototype(Expr$240) && rest$427[0] && rest$427[0].token.value === '[]') {
                    return step$425(ObjGet$265.create(head$426, Delimiter$254.create(rest$427[0].expose())), rest$427.slice(1));
                } else if (head$426.hasPrototype(Expr$240) && rest$427[0] && rest$427[0].token.value === '.' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Identifier) {
                    return step$425(ObjDotGet$264.create(head$426, rest$427[0], rest$427[1]), rest$427.slice(2));
                } else if (head$426.hasPrototype(Delimiter$254) && delim$436.token.value === '[]') {
                    return step$425(ArrayLiteral$246.create(head$426), rest$427);
                } else if (head$426.hasPrototype(Delimiter$254) && head$426.delim.token.value === '{}') {
                    return step$425(Block$245.create(head$426), rest$427);
                } else if (head$426.hasPrototype(Keyword$252) && keyword$434.token.value === 'let' && (rest$427[0] && rest$427[0].token.type === parser$125.Token.Identifier || rest$427[0] && rest$427[0].token.type === parser$125.Token.Keyword || rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator) && rest$427[1] && rest$427[1].token.value === '=' && rest$427[2] && rest$427[2].token.value === 'macro') {
                    var mac$488 = enforest$276(rest$427.slice(2), context$424);
                    if (!mac$488.result.hasPrototype(AnonMacro$261)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$488.result);
                    }
                    return step$425(LetMacro$259.create(rest$427[0], mac$488.result.body), mac$488.rest);
                } else if (head$426.hasPrototype(Keyword$252) && keyword$434.token.value === 'var' && rest$427[0]) {
                    var vsRes$489 = enforestVarStatement$274(rest$427, context$424);
                    if (vsRes$489) {
                        return step$425(VariableStatement$267.create(head$426, vsRes$489.result), vsRes$489.rest);
                    }
                }
            } else {
                parser$125.assert(head$426 && head$426.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$426.token.type === parser$125.Token.Identifier || head$426.token.type === parser$125.Token.Keyword || head$426.token.type === parser$125.Token.Punctuator) && context$424.env.has(resolve$228(head$426))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$490 = fresh$234();
                    var transformerContext$491 = makeExpanderContext$285(_$124.defaults({ mark: newMark$490 }, context$424));
                    // pull the macro transformer out the environment
                    var transformer$492 = context$424.env.get(resolve$228(head$426)).fn;
                    // apply the transformer
                    var rt$493 = transformer$492([head$426].concat(rest$427), transformerContext$491);
                    if (!Array.isArray(rt$493.result)) {
                        throwError$215('Macro transformer must return a result array, not: ' + rt$493.result);
                    }
                    if (rt$493.result.length > 0) {
                        var adjustedResult$494 = adjustLineContext$275(rt$493.result, head$426);
                        adjustedResult$494[0].token.leadingComments = head$426.token.leadingComments;
                        return step$425(adjustedResult$494[0], adjustedResult$494.slice(1).concat(rt$493.rest));
                    } else {
                        return step$425(Empty$270.create(), rt$493.rest);
                    }
                }    // anon macro definition
                else if (head$426.token.type === parser$125.Token.Identifier && head$426.token.value === 'macro' && rest$427[0] && rest$427[0].token.value === '{}') {
                    return step$425(AnonMacro$261.create(rest$427[0].expose().token.inner), rest$427.slice(1));
                }    // macro definition
                else if (head$426.token.type === parser$125.Token.Identifier && head$426.token.value === 'macro' && rest$427[0] && (rest$427[0].token.type === parser$125.Token.Identifier || rest$427[0].token.type === parser$125.Token.Keyword || rest$427[0].token.type === parser$125.Token.Punctuator) && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '{}') {
                    return step$425(Macro$260.create(rest$427[0], rest$427[1].expose().token.inner), rest$427.slice(2));
                }    // module definition
                else if (head$426.token.value === 'module' && rest$427[0] && rest$427[0].token.value === '{}') {
                    return step$425(Module$269.create(rest$427[0]), rest$427.slice(1));
                }    // function definition
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'function' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Identifier && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '()' && rest$427[2] && rest$427[2].token.type === parser$125.Token.Delimiter && rest$427[2].token.value === '{}') {
                    rest$427[1].token.inner = rest$427[1].expose().token.inner;
                    rest$427[2].token.inner = rest$427[2].expose().token.inner;
                    return step$425(NamedFun$256.create(head$426, null, rest$427[0], rest$427[1], rest$427[2]), rest$427.slice(3));
                }    // generator function definition
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'function' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator && rest$427[0].token.value === '*' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Identifier && rest$427[2] && rest$427[2].token.type === parser$125.Token.Delimiter && rest$427[2].token.value === '()' && rest$427[3] && rest$427[3].token.type === parser$125.Token.Delimiter && rest$427[3].token.value === '{}') {
                    rest$427[2].token.inner = rest$427[2].expose().token.inner;
                    rest$427[3].token.inner = rest$427[3].expose().token.inner;
                    return step$425(NamedFun$256.create(head$426, rest$427[0], rest$427[1], rest$427[2], rest$427[3]), rest$427.slice(4));
                }    // anonymous function definition
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'function' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Delimiter && rest$427[0].token.value === '()' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '{}') {
                    rest$427[0].token.inner = rest$427[0].expose().token.inner;
                    rest$427[1].token.inner = rest$427[1].expose().token.inner;
                    return step$425(AnonFun$257.create(head$426, null, rest$427[0], rest$427[1]), rest$427.slice(2));
                }    // anonymous generator function definition
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'function' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator && rest$427[0].token.value === '*' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '()' && rest$427[2] && rest$427[2].token.type === parser$125.Token.Delimiter && rest$427[2].token.value === '{}') {
                    rest$427[1].token.inner = rest$427[1].expose().token.inner;
                    rest$427[2].token.inner = rest$427[2].expose().token.inner;
                    return step$425(AnonFun$257.create(head$426, rest$427[0], rest$427[1], rest$427[2]), rest$427.slice(3));
                }    // arrow function
                else if ((head$426.token.type === parser$125.Token.Delimiter && head$426.token.value === '()' || head$426.token.type === parser$125.Token.Identifier) && rest$427[0] && rest$427[0].token.type === parser$125.Token.Punctuator && rest$427[0].token.value === '=>' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '{}') {
                    return step$425(ArrowFun$258.create(head$426, rest$427[0], rest$427[1]), rest$427.slice(2));
                }    // catch statement
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'catch' && rest$427[0] && rest$427[0].token.type === parser$125.Token.Delimiter && rest$427[0].token.value === '()' && rest$427[1] && rest$427[1].token.type === parser$125.Token.Delimiter && rest$427[1].token.value === '{}') {
                    rest$427[0].token.inner = rest$427[0].expose().token.inner;
                    rest$427[1].token.inner = rest$427[1].expose().token.inner;
                    return step$425(CatchClause$268.create(head$426, rest$427[0], rest$427[1]), rest$427.slice(2));
                }    // this expression
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'this') {
                    return step$425(ThisExpression$242.create(head$426), rest$427);
                }    // literal
                else if (head$426.token.type === parser$125.Token.NumericLiteral || head$426.token.type === parser$125.Token.StringLiteral || head$426.token.type === parser$125.Token.BooleanLiteral || head$426.token.type === parser$125.Token.RegularExpression || head$426.token.type === parser$125.Token.NullLiteral) {
                    return step$425(Lit$243.create(head$426), rest$427);
                }    // export
                else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'export' && rest$427[0] && (rest$427[0].token.type === parser$125.Token.Identifier || rest$427[0].token.type === parser$125.Token.Keyword || rest$427[0].token.type === parser$125.Token.Punctuator)) {
                    return step$425(Export$271.create(rest$427[0]), rest$427.slice(1));
                }    // identifier
                else if (head$426.token.type === parser$125.Token.Identifier) {
                    return step$425(Id$255.create(head$426), rest$427);
                }    // punctuator
                else if (head$426.token.type === parser$125.Token.Punctuator) {
                    return step$425(Punc$253.create(head$426), rest$427);
                } else if (head$426.token.type === parser$125.Token.Keyword && head$426.token.value === 'with') {
                    throwError$215('with is not supported in sweet.js');
                }    // keyword
                else if (head$426.token.type === parser$125.Token.Keyword) {
                    return step$425(Keyword$252.create(head$426), rest$427);
                }    // Delimiter
                else if (head$426.token.type === parser$125.Token.Delimiter) {
                    return step$425(Delimiter$254.create(head$426.expose()), rest$427);
                }    // end of file
                else if (head$426.token.type === parser$125.Token.EOF) {
                    parser$125.assert(rest$427.length === 0, 'nothing should be after an EOF');
                    return step$425(EOF$238.create(head$426), []);
                } else {
                    // todo: are we missing cases?
                    parser$125.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$426,
                rest: rest$427
            };
        }
        return step$425(toks$423[0], toks$423.slice(1));
    }
    function get_expression$277(stx$495, context$496) {
        var res$497 = enforest$276(stx$495, context$496);
        if (!res$497.result.hasPrototype(Expr$240)) {
            return {
                result: null,
                rest: stx$495
            };
        }
        return res$497;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$278(newMark$498, env$499) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$500(match$501) {
            if (match$501.level === 0) {
                // replace the match property with the marked syntax
                match$501.match = _$124.map(match$501.match, function (stx$502) {
                    return stx$502.mark(newMark$498);
                });
            } else {
                _$124.each(match$501.match, function (match$503) {
                    dfs$500(match$503);
                });
            }
        }
        _$124.keys(env$499).forEach(function (key$504) {
            dfs$500(env$499[key$504]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$279(mac$505, context$506) {
        var body$507 = mac$505.body;
        // raw function primitive form
        if (!(body$507[0] && body$507[0].token.type === parser$125.Token.Keyword && body$507[0].token.value === 'function')) {
            throwError$215('Primitive macro form must contain a function for the macro body');
        }
        var stub$508 = parser$125.read('()');
        stub$508[0].token.inner = body$507;
        var expanded$509 = expand$284(stub$508, context$506);
        expanded$509 = expanded$509[0].destruct().concat(expanded$509[1].eof);
        var flattend$510 = flatten$287(expanded$509);
        var bodyCode$511 = codegen$131.generate(parser$125.parse(flattend$510));
        var macroFn$512 = scopedEval$216(bodyCode$511, {
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
                getTemplate: function (id$513) {
                    return cloneSyntaxArray$280(context$506.templateMap.get(id$513));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$278,
                mergeMatches: function (newMatch$514, oldMatch$515) {
                    newMatch$514.patternEnv = _$124.extend({}, oldMatch$515.patternEnv, newMatch$514.patternEnv);
                    return newMatch$514;
                }
            });
        return macroFn$512;
    }
    function cloneSyntaxArray$280(arr$516) {
        return arr$516.map(function (stx$517) {
            var o$518 = syntaxFromToken$224(_$124.clone(stx$517.token), stx$517);
            if (o$518.token.type === parser$125.Token.Delimiter) {
                o$518.token.inner = cloneSyntaxArray$280(o$518.token.inner);
            }
            return o$518;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$281(stx$519, context$520) {
        parser$125.assert(context$520, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$519.length === 0) {
            return {
                terms: [],
                context: context$520
            };
        }
        parser$125.assert(stx$519[0].token, 'expecting a syntax object');
        var f$521 = enforest$276(stx$519, context$520);
        // head :: TermTree
        var head$522 = f$521.result;
        // rest :: [Syntax]
        var rest$523 = f$521.rest;
        if (head$522.hasPrototype(Macro$260)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$525 = loadMacroDef$279(head$522, context$520);
            addToDefinitionCtx$282([head$522.name], context$520.defscope, false);
            context$520.env.set(resolve$228(head$522.name), { fn: macroDefinition$525 });
            return expandToTermTree$281(rest$523, context$520);
        }
        if (head$522.hasPrototype(LetMacro$259)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$525 = loadMacroDef$279(head$522, context$520);
            var freshName$526 = fresh$234();
            var renamedName$527 = head$522.name.rename(head$522.name, freshName$526);
            rest$523 = _$124.map(rest$523, function (stx$528) {
                return stx$528.rename(head$522.name, freshName$526);
            });
            head$522.name = renamedName$527;
            context$520.env.set(resolve$228(head$522.name), { fn: macroDefinition$525 });
            return expandToTermTree$281(rest$523, context$520);
        }
        if (head$522.hasPrototype(NamedFun$256)) {
            addToDefinitionCtx$282([head$522.name], context$520.defscope, true);
        }
        if (head$522.hasPrototype(Id$255) && head$522.id.token.value === '#quoteSyntax' && rest$523[0] && rest$523[0].token.value === '{}') {
            var tempId$529 = fresh$234();
            context$520.templateMap.set(tempId$529, rest$523[0].token.inner);
            return expandToTermTree$281([
                syn$126.makeIdent('getTemplate', head$522.id),
                syn$126.makeDelim('()', [syn$126.makeValue(tempId$529, head$522.id)], head$522.id)
            ].concat(rest$523.slice(1)), context$520);
        }
        if (head$522.hasPrototype(VariableStatement$267)) {
            addToDefinitionCtx$282(_$124.map(head$522.decls, function (decl$530) {
                return decl$530.ident;
            }), context$520.defscope, true);
        }
        if (head$522.hasPrototype(Block$245) && head$522.body.hasPrototype(Delimiter$254)) {
            head$522.body.delim.token.inner.forEach(function (term$531) {
                if (term$531.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$282(_$124.map(term$531.decls, function (decl$532) {
                        return decl$532.ident;
                    }), context$520.defscope, true);
                }
            });
        }
        if (head$522.hasPrototype(Delimiter$254)) {
            head$522.delim.token.inner.forEach(function (term$533) {
                if (term$533.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$282(_$124.map(term$533.decls, function (decl$534) {
                        return decl$534.ident;
                    }), context$520.defscope, true);
                }
            });
        }
        var trees$524 = expandToTermTree$281(rest$523, context$520);
        return {
            terms: [head$522].concat(trees$524.terms),
            context: trees$524.context
        };
    }
    function addToDefinitionCtx$282(idents$535, defscope$536, skipRep$537) {
        parser$125.assert(idents$535 && idents$535.length > 0, 'expecting some variable identifiers');
        skipRep$537 = skipRep$537 || false;
        _$124.each(idents$535, function (id$538) {
            var skip$539 = false;
            if (skipRep$537) {
                var declRepeat$540 = _$124.find(defscope$536, function (def$541) {
                        return def$541.id.token.value === id$538.token.value && arraysEqual$229(marksof$227(def$541.id.context), marksof$227(id$538.context));
                    });
                skip$539 = typeof declRepeat$540 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$539) {
                var name$542 = fresh$234();
                defscope$536.push({
                    id: id$538,
                    name: name$542
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$283(term$543, context$544) {
        parser$125.assert(context$544 && context$544.env, 'environment map is required');
        if (term$543.hasPrototype(ArrayLiteral$246)) {
            term$543.array.delim.token.inner = expand$284(term$543.array.delim.expose().token.inner, context$544);
            return term$543;
        } else if (term$543.hasPrototype(Block$245)) {
            term$543.body.delim.token.inner = expand$284(term$543.body.delim.expose().token.inner, context$544);
            return term$543;
        } else if (term$543.hasPrototype(ParenExpression$247)) {
            term$543.expr.delim.token.inner = expand$284(term$543.expr.delim.expose().token.inner, context$544);
            return term$543;
        } else if (term$543.hasPrototype(Call$263)) {
            term$543.fun = expandTermTreeToFinal$283(term$543.fun, context$544);
            term$543.args = _$124.map(term$543.args, function (arg$545) {
                return expandTermTreeToFinal$283(arg$545, context$544);
            });
            return term$543;
        } else if (term$543.hasPrototype(UnaryOp$248)) {
            term$543.expr = expandTermTreeToFinal$283(term$543.expr, context$544);
            return term$543;
        } else if (term$543.hasPrototype(BinOp$250)) {
            term$543.left = expandTermTreeToFinal$283(term$543.left, context$544);
            term$543.right = expandTermTreeToFinal$283(term$543.right, context$544);
            return term$543;
        } else if (term$543.hasPrototype(ObjGet$265)) {
            term$543.right.delim.token.inner = expand$284(term$543.right.delim.expose().token.inner, context$544);
            return term$543;
        } else if (term$543.hasPrototype(ObjDotGet$264)) {
            term$543.left = expandTermTreeToFinal$283(term$543.left, context$544);
            term$543.right = expandTermTreeToFinal$283(term$543.right, context$544);
            return term$543;
        } else if (term$543.hasPrototype(VariableDeclaration$266)) {
            if (term$543.init) {
                term$543.init = expandTermTreeToFinal$283(term$543.init, context$544);
            }
            return term$543;
        } else if (term$543.hasPrototype(VariableStatement$267)) {
            term$543.decls = _$124.map(term$543.decls, function (decl$546) {
                return expandTermTreeToFinal$283(decl$546, context$544);
            });
            return term$543;
        } else if (term$543.hasPrototype(Delimiter$254)) {
            // expand inside the delimiter and then continue on
            term$543.delim.token.inner = expand$284(term$543.delim.expose().token.inner, context$544);
            return term$543;
        } else if (term$543.hasPrototype(NamedFun$256) || term$543.hasPrototype(AnonFun$257) || term$543.hasPrototype(CatchClause$268) || term$543.hasPrototype(ArrowFun$258) || term$543.hasPrototype(Module$269)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$547 = [];
            var bodyContext$548 = makeExpanderContext$285(_$124.defaults({ defscope: newDef$547 }, context$544));
            var paramSingleIdent$549 = term$543.params && term$543.params.token.type === parser$125.Token.Identifier;
            if (term$543.params && term$543.params.token.type === parser$125.Token.Delimiter) {
                var params$556 = term$543.params.expose();
            } else if (paramSingleIdent$549) {
                var params$556 = term$543.params;
            } else {
                var params$556 = syn$126.makeDelim('()', [], null);
            }
            if (Array.isArray(term$543.body)) {
                var bodies$557 = syn$126.makeDelim('{}', term$543.body, null);
            } else {
                var bodies$557 = term$543.body;
            }
            bodies$557 = bodies$557.addDefCtx(newDef$547);
            var paramNames$550 = _$124.map(getParamIdentifiers$236(params$556), function (param$558) {
                    var freshName$559 = fresh$234();
                    return {
                        freshName: freshName$559,
                        originalParam: param$558,
                        renamedParam: param$558.rename(param$558, freshName$559)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$551 = _$124.reduce(paramNames$550, function (accBody$560, p$561) {
                    return accBody$560.rename(p$561.originalParam, p$561.freshName);
                }, bodies$557);
            renamedBody$551 = renamedBody$551.expose();
            var expandedResult$552 = expandToTermTree$281(renamedBody$551.token.inner, bodyContext$548);
            var bodyTerms$553 = expandedResult$552.terms;
            var renamedParams$554 = _$124.map(paramNames$550, function (p$562) {
                    return p$562.renamedParam;
                });
            if (paramSingleIdent$549) {
                var flatArgs$563 = renamedParams$554[0];
            } else {
                var flatArgs$563 = syn$126.makeDelim('()', joinSyntax$225(renamedParams$554, ','), term$543.params);
            }
            var expandedArgs$555 = expand$284([flatArgs$563], bodyContext$548);
            parser$125.assert(expandedArgs$555.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$543.params) {
                term$543.params = expandedArgs$555[0];
            }
            bodyTerms$553 = _$124.map(bodyTerms$553, function (bodyTerm$564) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$565 = bodyTerm$564.addDefCtx(newDef$547);
                // finish expansion
                return expandTermTreeToFinal$283(termWithCtx$565, expandedResult$552.context);
            });
            if (term$543.hasPrototype(Module$269)) {
                bodyTerms$553 = _$124.filter(bodyTerms$553, function (bodyTerm$566) {
                    if (bodyTerm$566.hasPrototype(Export$271)) {
                        term$543.exports.push(bodyTerm$566);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$551.token.inner = bodyTerms$553;
            if (Array.isArray(term$543.body)) {
                term$543.body = renamedBody$551.token.inner;
            } else {
                term$543.body = renamedBody$551;
            }
            // and continue expand the rest
            return term$543;
        }
        // the term is fine as is
        return term$543;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$284(stx$567, context$568) {
        parser$125.assert(context$568, 'must provide an expander context');
        var trees$569 = expandToTermTree$281(stx$567, context$568);
        return _$124.map(trees$569.terms, function (term$570) {
            return expandTermTreeToFinal$283(term$570, trees$569.context);
        });
    }
    function makeExpanderContext$285(o$571) {
        o$571 = o$571 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$571.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$571.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$571.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$571.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$286(stx$572, builtinSource$573) {
        var env$574 = new Map();
        var params$575 = [];
        var context$576, builtInContext$577 = makeExpanderContext$285({ env: env$574 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$573) {
            var builtinRead$580 = parser$125.read(builtinSource$573);
            builtinRead$580 = [
                syn$126.makeIdent('module', null),
                syn$126.makeDelim('{}', builtinRead$580, null)
            ];
            var builtinRes$581 = expand$284(builtinRead$580, builtInContext$577);
            params$575 = _$124.map(builtinRes$581[0].exports, function (term$582) {
                return {
                    oldExport: term$582.name,
                    newParam: syn$126.makeIdent(term$582.name.token.value, null)
                };
            });
        }
        var modBody$578 = syn$126.makeDelim('{}', stx$572, null);
        modBody$578 = _$124.reduce(params$575, function (acc$583, param$584) {
            var newName$585 = fresh$234();
            env$574.set(resolve$228(param$584.newParam.rename(param$584.newParam, newName$585)), env$574.get(resolve$228(param$584.oldExport)));
            return acc$583.rename(param$584.newParam, newName$585);
        }, modBody$578);
        context$576 = makeExpanderContext$285({ env: env$574 });
        var res$579 = expand$284([
                syn$126.makeIdent('module', null),
                modBody$578
            ], context$576);
        res$579 = res$579[0].destruct();
        return flatten$287(res$579[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$287(stx$586) {
        return _$124.reduce(stx$586, function (acc$587, stx$588) {
            if (stx$588.token.type === parser$125.Token.Delimiter) {
                var exposed$589 = stx$588.expose();
                var openParen$590 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$588.token.value[0],
                        range: stx$588.token.startRange,
                        sm_range: typeof stx$588.token.sm_startRange == 'undefined' ? stx$588.token.startRange : stx$588.token.sm_startRange,
                        lineNumber: stx$588.token.startLineNumber,
                        sm_lineNumber: typeof stx$588.token.sm_startLineNumber == 'undefined' ? stx$588.token.startLineNumber : stx$588.token.sm_startLineNumber,
                        lineStart: stx$588.token.startLineStart,
                        sm_lineStart: typeof stx$588.token.sm_startLineStart == 'undefined' ? stx$588.token.startLineStart : stx$588.token.sm_startLineStart
                    }, exposed$589);
                var closeParen$591 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$588.token.value[1],
                        range: stx$588.token.endRange,
                        sm_range: typeof stx$588.token.sm_endRange == 'undefined' ? stx$588.token.endRange : stx$588.token.sm_endRange,
                        lineNumber: stx$588.token.endLineNumber,
                        sm_lineNumber: typeof stx$588.token.sm_endLineNumber == 'undefined' ? stx$588.token.endLineNumber : stx$588.token.sm_endLineNumber,
                        lineStart: stx$588.token.endLineStart,
                        sm_lineStart: typeof stx$588.token.sm_endLineStart == 'undefined' ? stx$588.token.endLineStart : stx$588.token.sm_endLineStart
                    }, exposed$589);
                if (stx$588.token.leadingComments) {
                    openParen$590.token.leadingComments = stx$588.token.leadingComments;
                }
                if (stx$588.token.trailingComments) {
                    openParen$590.token.trailingComments = stx$588.token.trailingComments;
                }
                return acc$587.concat(openParen$590).concat(flatten$287(exposed$589.token.inner)).concat(closeParen$591);
            }
            stx$588.token.sm_lineNumber = stx$588.token.sm_lineNumber ? stx$588.token.sm_lineNumber : stx$588.token.lineNumber;
            stx$588.token.sm_lineStart = stx$588.token.sm_lineStart ? stx$588.token.sm_lineStart : stx$588.token.lineStart;
            stx$588.token.sm_range = stx$588.token.sm_range ? stx$588.token.sm_range : stx$588.token.range;
            return acc$587.concat(stx$588);
        }, []);
    }
    exports$123.enforest = enforest$276;
    exports$123.expand = expandTopLevel$286;
    exports$123.resolve = resolve$228;
    exports$123.get_expression = get_expression$277;
    exports$123.makeExpanderContext = makeExpanderContext$285;
    exports$123.Expr = Expr$240;
    exports$123.VariableStatement = VariableStatement$267;
    exports$123.tokensToSyntax = syn$126.tokensToSyntax;
    exports$123.syntaxToTokens = syn$126.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map