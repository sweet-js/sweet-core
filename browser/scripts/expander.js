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
    function throwError$215(msg$296) {
        throw new Error(msg$296);
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
    function remdup$226(mark$297, mlist$298) {
        if (mark$297 === _$124.first(mlist$298)) {
            return _$124.rest(mlist$298, 1);
        }
        return [mark$297].concat(mlist$298);
    }
    // (CSyntax) -> [...Num]
    function marksof$227(ctx$299, stopName$300, originalName$301) {
        var mark$302, submarks$303;
        if (isMark$222(ctx$299)) {
            mark$302 = ctx$299.mark;
            submarks$303 = marksof$227(ctx$299.context, stopName$300, originalName$301);
            return remdup$226(mark$302, submarks$303);
        }
        if (isDef$221(ctx$299)) {
            return marksof$227(ctx$299.context, stopName$300, originalName$301);
        }
        if (isRename$223(ctx$299)) {
            if (stopName$300 === originalName$301 + '$' + ctx$299.name) {
                return [];
            }
            return marksof$227(ctx$299.context, stopName$300, originalName$301);
        }
        return [];
    }
    function resolve$228(stx$304) {
        return resolveCtx$232(stx$304.token.value, stx$304.context, [], []);
    }
    function arraysEqual$229(a$305, b$306) {
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
    function renames$230(defctx$308, oldctx$309, originalName$310) {
        var acc$311 = oldctx$309;
        for (var i$312 = 0; i$312 < defctx$308.length; i$312++) {
            if (defctx$308[i$312].id.token.value === originalName$310) {
                acc$311 = Rename$217(defctx$308[i$312].id, defctx$308[i$312].name, acc$311, defctx$308);
            }
        }
        return acc$311;
    }
    function unionEl$231(arr$313, el$314) {
        if (arr$313.indexOf(el$314) === -1) {
            var res$315 = arr$313.slice(0);
            res$315.push(el$314);
            return res$315;
        }
        return arr$313;
    }
    // (Syntax) -> String
    function resolveCtx$232(originalName$316, ctx$317, stop_spine$318, stop_branch$319) {
        if (isMark$222(ctx$317)) {
            return resolveCtx$232(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
        }
        if (isDef$221(ctx$317)) {
            if (stop_spine$318.indexOf(ctx$317.defctx) !== -1) {
                return resolveCtx$232(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
            } else {
                return resolveCtx$232(originalName$316, renames$230(ctx$317.defctx, ctx$317.context, originalName$316), stop_spine$318, unionEl$231(stop_branch$319, ctx$317.defctx));
            }
        }
        if (isRename$223(ctx$317)) {
            if (originalName$316 === ctx$317.id.token.value) {
                var idName$320 = resolveCtx$232(ctx$317.id.token.value, ctx$317.id.context, stop_branch$319, stop_branch$319);
                var subName$321 = resolveCtx$232(originalName$316, ctx$317.context, unionEl$231(stop_spine$318, ctx$317.def), stop_branch$319);
                if (idName$320 === subName$321) {
                    var idMarks$322 = marksof$227(ctx$317.id.context, originalName$316 + '$' + ctx$317.name, originalName$316);
                    var subMarks$323 = marksof$227(ctx$317.context, originalName$316 + '$' + ctx$317.name, originalName$316);
                    if (arraysEqual$229(idMarks$322, subMarks$323)) {
                        return originalName$316 + '$' + ctx$317.name;
                    }
                }
            }
            return resolveCtx$232(originalName$316, ctx$317.context, stop_spine$318, stop_branch$319);
        }
        return originalName$316;
    }
    var nextFresh$233 = 0;
    // fun () -> Num
    function fresh$234() {
        return nextFresh$233++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$235(towrap$324, delimSyntax$325) {
        parser$125.assert(delimSyntax$325.token.type === parser$125.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$224({
            type: parser$125.Token.Delimiter,
            value: delimSyntax$325.token.value,
            inner: towrap$324,
            range: delimSyntax$325.token.range,
            startLineNumber: delimSyntax$325.token.startLineNumber,
            lineStart: delimSyntax$325.token.lineStart
        }, delimSyntax$325);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$236(argSyntax$326) {
        if (argSyntax$326.token.type === parser$125.Token.Delimiter) {
            return _$124.filter(argSyntax$326.token.inner, function (stx$327) {
                return stx$327.token.value !== ',';
            });
        } else if (argSyntax$326.token.type === parser$125.Token.Identifier) {
            return [argSyntax$326];
        } else {
            parser$125.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$237 = {
            destruct: function () {
                return _$124.reduce(this.properties, _$124.bind(function (acc$328, prop$329) {
                    if (this[prop$329] && this[prop$329].hasPrototype(TermTree$237)) {
                        return acc$328.concat(this[prop$329].destruct());
                    } else if (this[prop$329] && this[prop$329].token && this[prop$329].token.inner) {
                        this[prop$329].token.inner = _$124.reduce(this[prop$329].token.inner, function (acc$330, t$331) {
                            if (t$331.hasPrototype(TermTree$237)) {
                                return acc$330.concat(t$331.destruct());
                            }
                            return acc$330.concat(t$331);
                        }, []);
                        return acc$328.concat(this[prop$329]);
                    } else if (Array.isArray(this[prop$329])) {
                        return acc$328.concat(_$124.reduce(this[prop$329], function (acc$332, t$333) {
                            if (t$333.hasPrototype(TermTree$237)) {
                                return acc$332.concat(t$333.destruct());
                            }
                            return acc$332.concat(t$333);
                        }, []));
                    } else if (this[prop$329]) {
                        return acc$328.concat(this[prop$329]);
                    } else {
                        return acc$328;
                    }
                }, this), []);
            },
            addDefCtx: function (def$334) {
                for (var i$335 = 0; i$335 < this.properties.length; i$335++) {
                    var prop$336 = this.properties[i$335];
                    if (Array.isArray(this[prop$336])) {
                        this[prop$336] = _$124.map(this[prop$336], function (item$337) {
                            return item$337.addDefCtx(def$334);
                        });
                    } else if (this[prop$336]) {
                        this[prop$336] = this[prop$336].addDefCtx(def$334);
                    }
                }
                return this;
            }
        };
    var EOF$238 = TermTree$237.extend({
            properties: ['eof'],
            construct: function (e$338) {
                this.eof = e$338;
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
            construct: function (that$339) {
                this.this = that$339;
            }
        });
    var Lit$243 = PrimaryExpression$241.extend({
            properties: ['lit'],
            construct: function (l$340) {
                this.lit = l$340;
            }
        });
    exports$123._test.PropertyAssignment = PropertyAssignment$244;
    var PropertyAssignment$244 = TermTree$237.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$341, assignment$342) {
                this.propName = propName$341;
                this.assignment = assignment$342;
            }
        });
    var Block$245 = PrimaryExpression$241.extend({
            properties: ['body'],
            construct: function (body$343) {
                this.body = body$343;
            }
        });
    var ArrayLiteral$246 = PrimaryExpression$241.extend({
            properties: ['array'],
            construct: function (ar$344) {
                this.array = ar$344;
            }
        });
    var ParenExpression$247 = PrimaryExpression$241.extend({
            properties: ['expr'],
            construct: function (expr$345) {
                this.expr = expr$345;
            }
        });
    var UnaryOp$248 = Expr$240.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$346, expr$347) {
                this.op = op$346;
                this.expr = expr$347;
            }
        });
    var PostfixOp$249 = Expr$240.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$348, op$349) {
                this.expr = expr$348;
                this.op = op$349;
            }
        });
    var BinOp$250 = Expr$240.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$350, left$351, right$352) {
                this.op = op$350;
                this.left = left$351;
                this.right = right$352;
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
            construct: function (cond$353, question$354, tru$355, colon$356, fls$357) {
                this.cond = cond$353;
                this.question = question$354;
                this.tru = tru$355;
                this.colon = colon$356;
                this.fls = fls$357;
            }
        });
    var Keyword$252 = TermTree$237.extend({
            properties: ['keyword'],
            construct: function (k$358) {
                this.keyword = k$358;
            }
        });
    var Punc$253 = TermTree$237.extend({
            properties: ['punc'],
            construct: function (p$359) {
                this.punc = p$359;
            }
        });
    var Delimiter$254 = TermTree$237.extend({
            properties: ['delim'],
            construct: function (d$360) {
                this.delim = d$360;
            }
        });
    var Id$255 = PrimaryExpression$241.extend({
            properties: ['id'],
            construct: function (id$361) {
                this.id = id$361;
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
            construct: function (keyword$362, star$363, name$364, params$365, body$366) {
                this.keyword = keyword$362;
                this.star = star$363;
                this.name = name$364;
                this.params = params$365;
                this.body = body$366;
            }
        });
    var AnonFun$257 = Expr$240.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$367, star$368, params$369, body$370) {
                this.keyword = keyword$367;
                this.star = star$368;
                this.params = params$369;
                this.body = body$370;
            }
        });
    var ArrowFun$258 = Expr$240.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$371, arrow$372, body$373) {
                this.params = params$371;
                this.arrow = arrow$372;
                this.body = body$373;
            }
        });
    var LetMacro$259 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$374, body$375) {
                this.name = name$374;
                this.body = body$375;
            }
        });
    var Macro$260 = TermTree$237.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$376, body$377) {
                this.name = name$376;
                this.body = body$377;
            }
        });
    var AnonMacro$261 = TermTree$237.extend({
            properties: ['body'],
            construct: function (body$378) {
                this.body = body$378;
            }
        });
    var Const$262 = Expr$240.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$379, call$380) {
                this.newterm = newterm$379;
                this.call = call$380;
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
                var that$381 = this;
                this.delim = syntaxFromToken$224(_$124.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$124.reduce(this.args, function (acc$382, term$383) {
                    parser$125.assert(term$383 && term$383.hasPrototype(TermTree$237), 'expecting term trees in destruct of Call');
                    var dst$384 = acc$382.concat(term$383.destruct());
                    // add all commas except for the last one
                    if (that$381.commas.length > 0) {
                        dst$384 = dst$384.concat(that$381.commas.shift());
                    }
                    return dst$384;
                }, []);
                return this.fun.destruct().concat(Delimiter$254.create(this.delim).destruct());
            },
            construct: function (funn$385, args$386, delim$387, commas$388) {
                parser$125.assert(Array.isArray(args$386), 'requires an array of arguments terms');
                this.fun = funn$385;
                this.args = args$386;
                this.delim = delim$387;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$388;
            }
        });
    var ObjDotGet$264 = Expr$240.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$389, dot$390, right$391) {
                this.left = left$389;
                this.dot = dot$390;
                this.right = right$391;
            }
        });
    var ObjGet$265 = Expr$240.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$392, right$393) {
                this.left = left$392;
                this.right = right$393;
            }
        });
    var VariableDeclaration$266 = TermTree$237.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$394, eqstx$395, init$396, comma$397) {
                this.ident = ident$394;
                this.eqstx = eqstx$395;
                this.init = init$396;
                this.comma = comma$397;
            }
        });
    var VariableStatement$267 = Statement$239.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$124.reduce(this.decls, function (acc$398, decl$399) {
                    return acc$398.concat(decl$399.destruct());
                }, []));
            },
            construct: function (varkw$400, decls$401) {
                parser$125.assert(Array.isArray(decls$401), 'decls must be an array');
                this.varkw = varkw$400;
                this.decls = decls$401;
            }
        });
    var LetStatement$268 = Statement$239.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$124.reduce(this.decls, function (acc$402, decl$403) {
                    return acc$402.concat(decl$403.destruct());
                }, []));
            },
            construct: function (letkw$404, decls$405) {
                parser$125.assert(Array.isArray(decls$405), 'decls must be an array');
                this.letkw = letkw$404;
                this.decls = decls$405;
            }
        });
    var ConstStatement$269 = Statement$239.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$124.reduce(this.decls, function (acc$406, decl$407) {
                    return acc$406.concat(decl$407.destruct());
                }, []));
            },
            construct: function (constkw$408, decls$409) {
                parser$125.assert(Array.isArray(decls$409), 'decls must be an array');
                this.constkw = constkw$408;
                this.decls = decls$409;
            }
        });
    var CatchClause$270 = TermTree$237.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$410, params$411, body$412) {
                this.catchkw = catchkw$410;
                this.params = params$411;
                this.body = body$412;
            }
        });
    var Module$271 = TermTree$237.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$413) {
                this.body = body$413;
                this.exports = [];
            }
        });
    var Empty$272 = TermTree$237.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$273 = TermTree$237.extend({
            properties: ['name'],
            construct: function (name$414) {
                this.name = name$414;
            }
        });
    function stxIsUnaryOp$274(stx$415) {
        var staticOperators$416 = [
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
        return _$124.contains(staticOperators$416, stx$415.token.value);
    }
    function stxIsBinOp$275(stx$417) {
        var staticOperators$418 = [
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
        return _$124.contains(staticOperators$418, stx$417.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$276(stx$419, context$420) {
        var decls$421 = [];
        var res$422 = enforest$278(stx$419, context$420);
        var result$423 = res$422.result;
        var rest$424 = res$422.rest;
        if (rest$424[0]) {
            var nextRes$425 = enforest$278(rest$424, context$420);
            // x = ...
            if (nextRes$425.result.hasPrototype(Punc$253) && nextRes$425.result.punc.token.value === '=') {
                var initializerRes$426 = enforest$278(nextRes$425.rest, context$420);
                if (initializerRes$426.rest[0]) {
                    var restRes$427 = enforest$278(initializerRes$426.rest, context$420);
                    // x = y + z, ...
                    if (restRes$427.result.hasPrototype(Punc$253) && restRes$427.result.punc.token.value === ',') {
                        decls$421.push(VariableDeclaration$266.create(result$423.id, nextRes$425.result.punc, initializerRes$426.result, restRes$427.result.punc));
                        var subRes$428 = enforestVarStatement$276(restRes$427.rest, context$420);
                        decls$421 = decls$421.concat(subRes$428.result);
                        rest$424 = subRes$428.rest;
                    }    // x = y ...
                    else {
                        decls$421.push(VariableDeclaration$266.create(result$423.id, nextRes$425.result.punc, initializerRes$426.result));
                        rest$424 = initializerRes$426.rest;
                    }
                }    // x = y EOF
                else {
                    decls$421.push(VariableDeclaration$266.create(result$423.id, nextRes$425.result.punc, initializerRes$426.result));
                }
            }    // x ,...;
            else if (nextRes$425.result.hasPrototype(Punc$253) && nextRes$425.result.punc.token.value === ',') {
                decls$421.push(VariableDeclaration$266.create(result$423.id, null, null, nextRes$425.result.punc));
                var subRes$428 = enforestVarStatement$276(nextRes$425.rest, context$420);
                decls$421 = decls$421.concat(subRes$428.result);
                rest$424 = subRes$428.rest;
            } else {
                if (result$423.hasPrototype(Id$255)) {
                    decls$421.push(VariableDeclaration$266.create(result$423.id));
                } else {
                    throwError$215('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$423.hasPrototype(Id$255)) {
                decls$421.push(VariableDeclaration$266.create(result$423.id));
            } else if (result$423.hasPrototype(BinOp$250) && result$423.op.token.value === 'in') {
                decls$421.push(VariableDeclaration$266.create(result$423.left.id, result$423.op, result$423.right));
            } else {
                throwError$215('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$421,
            rest: rest$424
        };
    }
    function adjustLineContext$277(stx$429, original$430, current$431) {
        current$431 = current$431 || {
            lastLineNumber: original$430.token.lineNumber,
            lineNumber: original$430.token.lineNumber - 1
        };
        return _$124.map(stx$429, function (stx$432) {
            if (stx$432.token.type === parser$125.Token.Delimiter) {
                // handle tokens with missing line info
                stx$432.token.startLineNumber = typeof stx$432.token.startLineNumber == 'undefined' ? original$430.token.lineNumber : stx$432.token.startLineNumber;
                stx$432.token.endLineNumber = typeof stx$432.token.endLineNumber == 'undefined' ? original$430.token.lineNumber : stx$432.token.endLineNumber;
                stx$432.token.startLineStart = typeof stx$432.token.startLineStart == 'undefined' ? original$430.token.lineStart : stx$432.token.startLineStart;
                stx$432.token.endLineStart = typeof stx$432.token.endLineStart == 'undefined' ? original$430.token.lineStart : stx$432.token.endLineStart;
                stx$432.token.startRange = typeof stx$432.token.startRange == 'undefined' ? original$430.token.range : stx$432.token.startRange;
                stx$432.token.endRange = typeof stx$432.token.endRange == 'undefined' ? original$430.token.range : stx$432.token.endRange;
                stx$432.token.sm_startLineNumber = typeof stx$432.token.sm_startLineNumber == 'undefined' ? stx$432.token.startLineNumber : stx$432.token.sm_startLineNumber;
                stx$432.token.sm_endLineNumber = typeof stx$432.token.sm_endLineNumber == 'undefined' ? stx$432.token.endLineNumber : stx$432.token.sm_endLineNumber;
                stx$432.token.sm_startLineStart = typeof stx$432.token.sm_startLineStart == 'undefined' ? stx$432.token.startLineStart : stx$432.token.sm_startLineStart;
                stx$432.token.sm_endLineStart = typeof stx$432.token.sm_endLineStart == 'undefined' ? stx$432.token.endLineStart : stx$432.token.sm_endLineStart;
                stx$432.token.sm_startRange = typeof stx$432.token.sm_startRange == 'undefined' ? stx$432.token.startRange : stx$432.token.sm_startRange;
                stx$432.token.sm_endRange = typeof stx$432.token.sm_endRange == 'undefined' ? stx$432.token.endRange : stx$432.token.sm_endRange;
                stx$432.token.startLineNumber = original$430.token.lineNumber;
                if (stx$432.token.inner.length > 0) {
                    stx$432.token.inner = adjustLineContext$277(stx$432.token.inner, original$430, current$431);
                }
                return stx$432;
            }
            // handle tokens with missing line info
            stx$432.token.lineNumber = typeof stx$432.token.lineNumber == 'undefined' ? original$430.token.lineNumber : stx$432.token.lineNumber;
            stx$432.token.lineStart = typeof stx$432.token.lineStart == 'undefined' ? original$430.token.lineStart : stx$432.token.lineStart;
            stx$432.token.range = typeof stx$432.token.range == 'undefined' ? original$430.token.range : stx$432.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$432.token.sm_lineNumber = typeof stx$432.token.sm_lineNumber == 'undefined' ? stx$432.token.lineNumber : stx$432.token.sm_lineNumber;
            stx$432.token.sm_lineStart = typeof stx$432.token.sm_lineStart == 'undefined' ? stx$432.token.lineStart : stx$432.token.sm_lineStart;
            stx$432.token.sm_range = typeof stx$432.token.sm_range == 'undefined' ? _$124.clone(stx$432.token.range) : stx$432.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$432.token.lineNumber = original$430.token.lineNumber;
            return stx$432;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$278(toks$433, context$434) {
        parser$125.assert(toks$433.length > 0, 'enforest assumes there are tokens to work with');
        function step$435(head$436, rest$437) {
            var innerTokens$438;
            parser$125.assert(Array.isArray(rest$437), 'result must at least be an empty array');
            if (head$436.hasPrototype(TermTree$237)) {
                // function call
                var emp$441 = head$436.emp;
                var emp$441 = head$436.emp;
                var keyword$444 = head$436.keyword;
                var delim$446 = head$436.delim;
                var id$448 = head$436.id;
                var delim$446 = head$436.delim;
                var emp$441 = head$436.emp;
                var punc$452 = head$436.punc;
                var keyword$444 = head$436.keyword;
                var emp$441 = head$436.emp;
                var emp$441 = head$436.emp;
                var emp$441 = head$436.emp;
                var delim$446 = head$436.delim;
                var delim$446 = head$436.delim;
                var keyword$444 = head$436.keyword;
                var keyword$444 = head$436.keyword;
                var keyword$444 = head$436.keyword;
                var keyword$444 = head$436.keyword;
                if (head$436.hasPrototype(Expr$240) && rest$437[0] && rest$437[0].token.type === parser$125.Token.Delimiter && rest$437[0].token.value === '()') {
                    var argRes$483, enforestedArgs$484 = [], commas$485 = [];
                    rest$437[0].expose();
                    innerTokens$438 = rest$437[0].token.inner;
                    while (innerTokens$438.length > 0) {
                        argRes$483 = enforest$278(innerTokens$438, context$434);
                        enforestedArgs$484.push(argRes$483.result);
                        innerTokens$438 = argRes$483.rest;
                        if (innerTokens$438[0] && innerTokens$438[0].token.value === ',') {
                            // record the comma for later
                            commas$485.push(innerTokens$438[0]);
                            // but dump it for the next loop turn
                            innerTokens$438 = innerTokens$438.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$486 = _$124.all(enforestedArgs$484, function (argTerm$487) {
                            return argTerm$487.hasPrototype(Expr$240);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$438.length === 0 && argsAreExprs$486) {
                        return step$435(Call$263.create(head$436, enforestedArgs$484, rest$437[0], commas$485), rest$437.slice(1));
                    }
                } else if (head$436.hasPrototype(Expr$240) && rest$437[0] && rest$437[0].token.value === '?') {
                    var question$488 = rest$437[0];
                    var condRes$489 = enforest$278(rest$437.slice(1), context$434);
                    var truExpr$490 = condRes$489.result;
                    var right$491 = condRes$489.rest;
                    if (truExpr$490.hasPrototype(Expr$240) && right$491[0] && right$491[0].token.value === ':') {
                        var colon$492 = right$491[0];
                        var flsRes$493 = enforest$278(right$491.slice(1), context$434);
                        var flsExpr$494 = flsRes$493.result;
                        if (flsExpr$494.hasPrototype(Expr$240)) {
                            return step$435(ConditionalExpression$251.create(head$436, question$488, truExpr$490, colon$492, flsExpr$494), flsRes$493.rest);
                        }
                    }
                } else if (head$436.hasPrototype(Keyword$252) && keyword$444.token.value === 'new' && rest$437[0]) {
                    var newCallRes$495 = enforest$278(rest$437, context$434);
                    if (newCallRes$495.result.hasPrototype(Call$263)) {
                        return step$435(Const$262.create(head$436, newCallRes$495.result), newCallRes$495.rest);
                    }
                } else if (head$436.hasPrototype(Delimiter$254) && delim$446.token.value === '()' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator && rest$437[0].token.value === '=>') {
                    var res$496 = enforest$278(rest$437.slice(1), context$434);
                    if (res$496.result.hasPrototype(Expr$240)) {
                        return step$435(ArrowFun$258.create(delim$446, rest$437[0], res$496.result.destruct()), res$496.rest);
                    } else {
                        throwError$215('Body of arrow function must be an expression');
                    }
                } else if (head$436.hasPrototype(Id$255) && rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator && rest$437[0].token.value === '=>') {
                    var res$496 = enforest$278(rest$437.slice(1), context$434);
                    if (res$496.result.hasPrototype(Expr$240)) {
                        return step$435(ArrowFun$258.create(id$448, rest$437[0], res$496.result.destruct()), res$496.rest);
                    } else {
                        throwError$215('Body of arrow function must be an expression');
                    }
                } else if (head$436.hasPrototype(Delimiter$254) && delim$446.token.value === '()') {
                    innerTokens$438 = delim$446.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$438.length === 0) {
                        return step$435(ParenExpression$247.create(head$436), rest$437);
                    } else {
                        var innerTerm$497 = get_expression$279(innerTokens$438, context$434);
                        if (innerTerm$497.result && innerTerm$497.result.hasPrototype(Expr$240)) {
                            return step$435(ParenExpression$247.create(head$436), rest$437);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$436.hasPrototype(Expr$240) && rest$437[0] && rest$437[1] && stxIsBinOp$275(rest$437[0])) {
                    var op$498 = rest$437[0];
                    var left$499 = head$436;
                    var bopRes$500 = enforest$278(rest$437.slice(1), context$434);
                    var right$491 = bopRes$500.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$491.hasPrototype(Expr$240)) {
                        return step$435(BinOp$250.create(op$498, left$499, right$491), bopRes$500.rest);
                    }
                } else if (head$436.hasPrototype(Punc$253) && stxIsUnaryOp$274(punc$452)) {
                    var unopRes$501 = enforest$278(rest$437, context$434);
                    if (unopRes$501.result.hasPrototype(Expr$240)) {
                        return step$435(UnaryOp$248.create(punc$452, unopRes$501.result), unopRes$501.rest);
                    }
                } else if (head$436.hasPrototype(Keyword$252) && stxIsUnaryOp$274(keyword$444)) {
                    var unopRes$501 = enforest$278(rest$437, context$434);
                    if (unopRes$501.result.hasPrototype(Expr$240)) {
                        return step$435(UnaryOp$248.create(keyword$444, unopRes$501.result), unopRes$501.rest);
                    }
                } else if (head$436.hasPrototype(Expr$240) && rest$437[0] && (rest$437[0].token.value === '++' || rest$437[0].token.value === '--')) {
                    return step$435(PostfixOp$249.create(head$436, rest$437[0]), rest$437.slice(1));
                } else if (head$436.hasPrototype(Expr$240) && rest$437[0] && rest$437[0].token.value === '[]') {
                    return step$435(ObjGet$265.create(head$436, Delimiter$254.create(rest$437[0].expose())), rest$437.slice(1));
                } else if (head$436.hasPrototype(Expr$240) && rest$437[0] && rest$437[0].token.value === '.' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Identifier) {
                    return step$435(ObjDotGet$264.create(head$436, rest$437[0], rest$437[1]), rest$437.slice(2));
                } else if (head$436.hasPrototype(Delimiter$254) && delim$446.token.value === '[]') {
                    return step$435(ArrayLiteral$246.create(head$436), rest$437);
                } else if (head$436.hasPrototype(Delimiter$254) && head$436.delim.token.value === '{}') {
                    return step$435(Block$245.create(head$436), rest$437);
                } else if (head$436.hasPrototype(Keyword$252) && keyword$444.token.value === 'let' && (rest$437[0] && rest$437[0].token.type === parser$125.Token.Identifier || rest$437[0] && rest$437[0].token.type === parser$125.Token.Keyword || rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator) && rest$437[1] && rest$437[1].token.value === '=' && rest$437[2] && rest$437[2].token.value === 'macro') {
                    var mac$502 = enforest$278(rest$437.slice(2), context$434);
                    if (!mac$502.result.hasPrototype(AnonMacro$261)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$502.result);
                    }
                    return step$435(LetMacro$259.create(rest$437[0], mac$502.result.body), mac$502.rest);
                } else if (head$436.hasPrototype(Keyword$252) && keyword$444.token.value === 'var' && rest$437[0]) {
                    var vsRes$503 = enforestVarStatement$276(rest$437, context$434);
                    if (vsRes$503) {
                        return step$435(VariableStatement$267.create(head$436, vsRes$503.result), vsRes$503.rest);
                    }
                } else if (head$436.hasPrototype(Keyword$252) && keyword$444.token.value === 'let' && rest$437[0]) {
                    var vsRes$503 = enforestVarStatement$276(rest$437, context$434);
                    if (vsRes$503) {
                        return step$435(LetStatement$268.create(head$436, vsRes$503.result), vsRes$503.rest);
                    }
                } else if (head$436.hasPrototype(Keyword$252) && keyword$444.token.value === 'const' && rest$437[0]) {
                    var vsRes$503 = enforestVarStatement$276(rest$437, context$434);
                    if (vsRes$503) {
                        return step$435(ConstStatement$269.create(head$436, vsRes$503.result), vsRes$503.rest);
                    }
                }
            } else {
                parser$125.assert(head$436 && head$436.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$436.token.type === parser$125.Token.Identifier || head$436.token.type === parser$125.Token.Keyword || head$436.token.type === parser$125.Token.Punctuator) && context$434.env.has(resolve$228(head$436))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$504 = fresh$234();
                    var transformerContext$505 = makeExpanderContext$287(_$124.defaults({ mark: newMark$504 }, context$434));
                    // pull the macro transformer out the environment
                    var transformer$506 = context$434.env.get(resolve$228(head$436)).fn;
                    // apply the transformer
                    var rt$507 = transformer$506([head$436].concat(rest$437), transformerContext$505);
                    if (!Array.isArray(rt$507.result)) {
                        throwError$215('Macro transformer must return a result array, not: ' + rt$507.result);
                    }
                    if (rt$507.result.length > 0) {
                        var adjustedResult$508 = adjustLineContext$277(rt$507.result, head$436);
                        adjustedResult$508[0].token.leadingComments = head$436.token.leadingComments;
                        return step$435(adjustedResult$508[0], adjustedResult$508.slice(1).concat(rt$507.rest));
                    } else {
                        return step$435(Empty$272.create(), rt$507.rest);
                    }
                }    // anon macro definition
                else if (head$436.token.type === parser$125.Token.Identifier && head$436.token.value === 'macro' && rest$437[0] && rest$437[0].token.value === '{}') {
                    return step$435(AnonMacro$261.create(rest$437[0].expose().token.inner), rest$437.slice(1));
                }    // macro definition
                else if (head$436.token.type === parser$125.Token.Identifier && head$436.token.value === 'macro' && rest$437[0] && (rest$437[0].token.type === parser$125.Token.Identifier || rest$437[0].token.type === parser$125.Token.Keyword || rest$437[0].token.type === parser$125.Token.Punctuator) && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '{}') {
                    return step$435(Macro$260.create(rest$437[0], rest$437[1].expose().token.inner), rest$437.slice(2));
                }    // module definition
                else if (head$436.token.value === 'module' && rest$437[0] && rest$437[0].token.value === '{}') {
                    return step$435(Module$271.create(rest$437[0]), rest$437.slice(1));
                }    // function definition
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'function' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Identifier && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '()' && rest$437[2] && rest$437[2].token.type === parser$125.Token.Delimiter && rest$437[2].token.value === '{}') {
                    rest$437[1].token.inner = rest$437[1].expose().token.inner;
                    rest$437[2].token.inner = rest$437[2].expose().token.inner;
                    return step$435(NamedFun$256.create(head$436, null, rest$437[0], rest$437[1], rest$437[2]), rest$437.slice(3));
                }    // generator function definition
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'function' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator && rest$437[0].token.value === '*' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Identifier && rest$437[2] && rest$437[2].token.type === parser$125.Token.Delimiter && rest$437[2].token.value === '()' && rest$437[3] && rest$437[3].token.type === parser$125.Token.Delimiter && rest$437[3].token.value === '{}') {
                    rest$437[2].token.inner = rest$437[2].expose().token.inner;
                    rest$437[3].token.inner = rest$437[3].expose().token.inner;
                    return step$435(NamedFun$256.create(head$436, rest$437[0], rest$437[1], rest$437[2], rest$437[3]), rest$437.slice(4));
                }    // anonymous function definition
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'function' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Delimiter && rest$437[0].token.value === '()' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '{}') {
                    rest$437[0].token.inner = rest$437[0].expose().token.inner;
                    rest$437[1].token.inner = rest$437[1].expose().token.inner;
                    return step$435(AnonFun$257.create(head$436, null, rest$437[0], rest$437[1]), rest$437.slice(2));
                }    // anonymous generator function definition
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'function' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator && rest$437[0].token.value === '*' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '()' && rest$437[2] && rest$437[2].token.type === parser$125.Token.Delimiter && rest$437[2].token.value === '{}') {
                    rest$437[1].token.inner = rest$437[1].expose().token.inner;
                    rest$437[2].token.inner = rest$437[2].expose().token.inner;
                    return step$435(AnonFun$257.create(head$436, rest$437[0], rest$437[1], rest$437[2]), rest$437.slice(3));
                }    // arrow function
                else if ((head$436.token.type === parser$125.Token.Delimiter && head$436.token.value === '()' || head$436.token.type === parser$125.Token.Identifier) && rest$437[0] && rest$437[0].token.type === parser$125.Token.Punctuator && rest$437[0].token.value === '=>' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '{}') {
                    return step$435(ArrowFun$258.create(head$436, rest$437[0], rest$437[1]), rest$437.slice(2));
                }    // catch statement
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'catch' && rest$437[0] && rest$437[0].token.type === parser$125.Token.Delimiter && rest$437[0].token.value === '()' && rest$437[1] && rest$437[1].token.type === parser$125.Token.Delimiter && rest$437[1].token.value === '{}') {
                    rest$437[0].token.inner = rest$437[0].expose().token.inner;
                    rest$437[1].token.inner = rest$437[1].expose().token.inner;
                    return step$435(CatchClause$270.create(head$436, rest$437[0], rest$437[1]), rest$437.slice(2));
                }    // this expression
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'this') {
                    return step$435(ThisExpression$242.create(head$436), rest$437);
                }    // literal
                else if (head$436.token.type === parser$125.Token.NumericLiteral || head$436.token.type === parser$125.Token.StringLiteral || head$436.token.type === parser$125.Token.BooleanLiteral || head$436.token.type === parser$125.Token.RegularExpression || head$436.token.type === parser$125.Token.NullLiteral) {
                    return step$435(Lit$243.create(head$436), rest$437);
                }    // export
                else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'export' && rest$437[0] && (rest$437[0].token.type === parser$125.Token.Identifier || rest$437[0].token.type === parser$125.Token.Keyword || rest$437[0].token.type === parser$125.Token.Punctuator)) {
                    return step$435(Export$273.create(rest$437[0]), rest$437.slice(1));
                }    // identifier
                else if (head$436.token.type === parser$125.Token.Identifier) {
                    return step$435(Id$255.create(head$436), rest$437);
                }    // punctuator
                else if (head$436.token.type === parser$125.Token.Punctuator) {
                    return step$435(Punc$253.create(head$436), rest$437);
                } else if (head$436.token.type === parser$125.Token.Keyword && head$436.token.value === 'with') {
                    throwError$215('with is not supported in sweet.js');
                }    // keyword
                else if (head$436.token.type === parser$125.Token.Keyword) {
                    return step$435(Keyword$252.create(head$436), rest$437);
                }    // Delimiter
                else if (head$436.token.type === parser$125.Token.Delimiter) {
                    return step$435(Delimiter$254.create(head$436.expose()), rest$437);
                }    // end of file
                else if (head$436.token.type === parser$125.Token.EOF) {
                    parser$125.assert(rest$437.length === 0, 'nothing should be after an EOF');
                    return step$435(EOF$238.create(head$436), []);
                } else {
                    // todo: are we missing cases?
                    parser$125.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$436,
                rest: rest$437
            };
        }
        return step$435(toks$433[0], toks$433.slice(1));
    }
    function get_expression$279(stx$509, context$510) {
        var res$511 = enforest$278(stx$509, context$510);
        if (!res$511.result.hasPrototype(Expr$240)) {
            return {
                result: null,
                rest: stx$509
            };
        }
        return res$511;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$280(newMark$512, env$513) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$514(match$515) {
            if (match$515.level === 0) {
                // replace the match property with the marked syntax
                match$515.match = _$124.map(match$515.match, function (stx$516) {
                    return stx$516.mark(newMark$512);
                });
            } else {
                _$124.each(match$515.match, function (match$517) {
                    dfs$514(match$517);
                });
            }
        }
        _$124.keys(env$513).forEach(function (key$518) {
            dfs$514(env$513[key$518]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$281(mac$519, context$520) {
        var body$521 = mac$519.body;
        // raw function primitive form
        if (!(body$521[0] && body$521[0].token.type === parser$125.Token.Keyword && body$521[0].token.value === 'function')) {
            throwError$215('Primitive macro form must contain a function for the macro body');
        }
        var stub$522 = parser$125.read('()');
        stub$522[0].token.inner = body$521;
        var expanded$523 = expand$286(stub$522, context$520);
        expanded$523 = expanded$523[0].destruct().concat(expanded$523[1].eof);
        var flattend$524 = flatten$289(expanded$523);
        var bodyCode$525 = codegen$131.generate(parser$125.parse(flattend$524));
        var macroFn$526 = scopedEval$216(bodyCode$525, {
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
                getTemplate: function (id$527) {
                    return cloneSyntaxArray$282(context$520.templateMap.get(id$527));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$280,
                mergeMatches: function (newMatch$528, oldMatch$529) {
                    newMatch$528.patternEnv = _$124.extend({}, oldMatch$529.patternEnv, newMatch$528.patternEnv);
                    return newMatch$528;
                }
            });
        return macroFn$526;
    }
    function cloneSyntaxArray$282(arr$530) {
        return arr$530.map(function (stx$531) {
            var o$532 = syntaxFromToken$224(_$124.clone(stx$531.token), stx$531);
            if (o$532.token.type === parser$125.Token.Delimiter) {
                o$532.token.inner = cloneSyntaxArray$282(o$532.token.inner);
            }
            return o$532;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$283(stx$533, context$534) {
        parser$125.assert(context$534, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$533.length === 0) {
            return {
                terms: [],
                context: context$534
            };
        }
        parser$125.assert(stx$533[0].token, 'expecting a syntax object');
        var f$535 = enforest$278(stx$533, context$534);
        // head :: TermTree
        var head$536 = f$535.result;
        // rest :: [Syntax]
        var rest$537 = f$535.rest;
        if (head$536.hasPrototype(Macro$260)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$539 = loadMacroDef$281(head$536, context$534);
            addToDefinitionCtx$284([head$536.name], context$534.defscope, false);
            context$534.env.set(resolve$228(head$536.name), { fn: macroDefinition$539 });
            return expandToTermTree$283(rest$537, context$534);
        }
        if (head$536.hasPrototype(LetMacro$259)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$539 = loadMacroDef$281(head$536, context$534);
            var freshName$540 = fresh$234();
            var renamedName$541 = head$536.name.rename(head$536.name, freshName$540);
            rest$537 = _$124.map(rest$537, function (stx$542) {
                return stx$542.rename(head$536.name, freshName$540);
            });
            head$536.name = renamedName$541;
            context$534.env.set(resolve$228(head$536.name), { fn: macroDefinition$539 });
            return expandToTermTree$283(rest$537, context$534);
        }
        if (head$536.hasPrototype(LetStatement$268) || head$536.hasPrototype(ConstStatement$269)) {
            head$536.decls.forEach(function (decl$543) {
                var freshName$544 = fresh$234();
                var renamedDecl$545 = decl$543.ident.rename(decl$543.ident, freshName$544);
                rest$537 = rest$537.map(function (stx$546) {
                    return stx$546.rename(decl$543.ident, freshName$544);
                });
                decl$543.ident = renamedDecl$545;
            });
        }
        if (head$536.hasPrototype(NamedFun$256)) {
            addToDefinitionCtx$284([head$536.name], context$534.defscope, true);
        }
        if (head$536.hasPrototype(Id$255) && head$536.id.token.value === '#quoteSyntax' && rest$537[0] && rest$537[0].token.value === '{}') {
            var tempId$547 = fresh$234();
            context$534.templateMap.set(tempId$547, rest$537[0].token.inner);
            return expandToTermTree$283([
                syn$126.makeIdent('getTemplate', head$536.id),
                syn$126.makeDelim('()', [syn$126.makeValue(tempId$547, head$536.id)], head$536.id)
            ].concat(rest$537.slice(1)), context$534);
        }
        if (head$536.hasPrototype(VariableStatement$267)) {
            addToDefinitionCtx$284(_$124.map(head$536.decls, function (decl$548) {
                return decl$548.ident;
            }), context$534.defscope, true);
        }
        if (head$536.hasPrototype(Block$245) && head$536.body.hasPrototype(Delimiter$254)) {
            head$536.body.delim.token.inner.forEach(function (term$549) {
                if (term$549.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$284(_$124.map(term$549.decls, function (decl$550) {
                        return decl$550.ident;
                    }), context$534.defscope, true);
                }
            });
        }
        if (head$536.hasPrototype(Delimiter$254)) {
            head$536.delim.token.inner.forEach(function (term$551) {
                if (term$551.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$284(_$124.map(term$551.decls, function (decl$552) {
                        return decl$552.ident;
                    }), context$534.defscope, true);
                }
            });
        }
        var trees$538 = expandToTermTree$283(rest$537, context$534);
        return {
            terms: [head$536].concat(trees$538.terms),
            context: trees$538.context
        };
    }
    function addToDefinitionCtx$284(idents$553, defscope$554, skipRep$555) {
        parser$125.assert(idents$553 && idents$553.length > 0, 'expecting some variable identifiers');
        skipRep$555 = skipRep$555 || false;
        _$124.each(idents$553, function (id$556) {
            var skip$557 = false;
            if (skipRep$555) {
                var declRepeat$558 = _$124.find(defscope$554, function (def$559) {
                        return def$559.id.token.value === id$556.token.value && arraysEqual$229(marksof$227(def$559.id.context), marksof$227(id$556.context));
                    });
                skip$557 = typeof declRepeat$558 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$557) {
                var name$560 = fresh$234();
                defscope$554.push({
                    id: id$556,
                    name: name$560
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$285(term$561, context$562) {
        parser$125.assert(context$562 && context$562.env, 'environment map is required');
        if (term$561.hasPrototype(ArrayLiteral$246)) {
            term$561.array.delim.token.inner = expand$286(term$561.array.delim.expose().token.inner, context$562);
            return term$561;
        } else if (term$561.hasPrototype(Block$245)) {
            term$561.body.delim.token.inner = expand$286(term$561.body.delim.expose().token.inner, context$562);
            return term$561;
        } else if (term$561.hasPrototype(ParenExpression$247)) {
            term$561.expr.delim.token.inner = expand$286(term$561.expr.delim.expose().token.inner, context$562);
            return term$561;
        } else if (term$561.hasPrototype(Call$263)) {
            term$561.fun = expandTermTreeToFinal$285(term$561.fun, context$562);
            term$561.args = _$124.map(term$561.args, function (arg$563) {
                return expandTermTreeToFinal$285(arg$563, context$562);
            });
            return term$561;
        } else if (term$561.hasPrototype(UnaryOp$248)) {
            term$561.expr = expandTermTreeToFinal$285(term$561.expr, context$562);
            return term$561;
        } else if (term$561.hasPrototype(BinOp$250)) {
            term$561.left = expandTermTreeToFinal$285(term$561.left, context$562);
            term$561.right = expandTermTreeToFinal$285(term$561.right, context$562);
            return term$561;
        } else if (term$561.hasPrototype(ObjGet$265)) {
            term$561.right.delim.token.inner = expand$286(term$561.right.delim.expose().token.inner, context$562);
            return term$561;
        } else if (term$561.hasPrototype(ObjDotGet$264)) {
            term$561.left = expandTermTreeToFinal$285(term$561.left, context$562);
            term$561.right = expandTermTreeToFinal$285(term$561.right, context$562);
            return term$561;
        } else if (term$561.hasPrototype(VariableDeclaration$266)) {
            if (term$561.init) {
                term$561.init = expandTermTreeToFinal$285(term$561.init, context$562);
            }
            return term$561;
        } else if (term$561.hasPrototype(VariableStatement$267)) {
            term$561.decls = _$124.map(term$561.decls, function (decl$564) {
                return expandTermTreeToFinal$285(decl$564, context$562);
            });
            return term$561;
        } else if (term$561.hasPrototype(Delimiter$254)) {
            // expand inside the delimiter and then continue on
            term$561.delim.token.inner = expand$286(term$561.delim.expose().token.inner, context$562);
            return term$561;
        } else if (term$561.hasPrototype(NamedFun$256) || term$561.hasPrototype(AnonFun$257) || term$561.hasPrototype(CatchClause$270) || term$561.hasPrototype(ArrowFun$258) || term$561.hasPrototype(Module$271)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$565 = [];
            var bodyContext$566 = makeExpanderContext$287(_$124.defaults({ defscope: newDef$565 }, context$562));
            var paramSingleIdent$567 = term$561.params && term$561.params.token.type === parser$125.Token.Identifier;
            if (term$561.params && term$561.params.token.type === parser$125.Token.Delimiter) {
                var params$574 = term$561.params.expose();
            } else if (paramSingleIdent$567) {
                var params$574 = term$561.params;
            } else {
                var params$574 = syn$126.makeDelim('()', [], null);
            }
            if (Array.isArray(term$561.body)) {
                var bodies$575 = syn$126.makeDelim('{}', term$561.body, null);
            } else {
                var bodies$575 = term$561.body;
            }
            bodies$575 = bodies$575.addDefCtx(newDef$565);
            var paramNames$568 = _$124.map(getParamIdentifiers$236(params$574), function (param$576) {
                    var freshName$577 = fresh$234();
                    return {
                        freshName: freshName$577,
                        originalParam: param$576,
                        renamedParam: param$576.rename(param$576, freshName$577)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$569 = _$124.reduce(paramNames$568, function (accBody$578, p$579) {
                    return accBody$578.rename(p$579.originalParam, p$579.freshName);
                }, bodies$575);
            renamedBody$569 = renamedBody$569.expose();
            var expandedResult$570 = expandToTermTree$283(renamedBody$569.token.inner, bodyContext$566);
            var bodyTerms$571 = expandedResult$570.terms;
            var renamedParams$572 = _$124.map(paramNames$568, function (p$580) {
                    return p$580.renamedParam;
                });
            if (paramSingleIdent$567) {
                var flatArgs$581 = renamedParams$572[0];
            } else {
                var flatArgs$581 = syn$126.makeDelim('()', joinSyntax$225(renamedParams$572, ','), term$561.params);
            }
            var expandedArgs$573 = expand$286([flatArgs$581], bodyContext$566);
            parser$125.assert(expandedArgs$573.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$561.params) {
                term$561.params = expandedArgs$573[0];
            }
            bodyTerms$571 = _$124.map(bodyTerms$571, function (bodyTerm$582) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$583 = bodyTerm$582.addDefCtx(newDef$565);
                // finish expansion
                return expandTermTreeToFinal$285(termWithCtx$583, expandedResult$570.context);
            });
            if (term$561.hasPrototype(Module$271)) {
                bodyTerms$571 = _$124.filter(bodyTerms$571, function (bodyTerm$584) {
                    if (bodyTerm$584.hasPrototype(Export$273)) {
                        term$561.exports.push(bodyTerm$584);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$569.token.inner = bodyTerms$571;
            if (Array.isArray(term$561.body)) {
                term$561.body = renamedBody$569.token.inner;
            } else {
                term$561.body = renamedBody$569;
            }
            // and continue expand the rest
            return term$561;
        }
        // the term is fine as is
        return term$561;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$286(stx$585, context$586) {
        parser$125.assert(context$586, 'must provide an expander context');
        var trees$587 = expandToTermTree$283(stx$585, context$586);
        return _$124.map(trees$587.terms, function (term$588) {
            return expandTermTreeToFinal$285(term$588, trees$587.context);
        });
    }
    function makeExpanderContext$287(o$589) {
        o$589 = o$589 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$589.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$589.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$589.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$589.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$288(stx$590, builtinSource$591) {
        var env$592 = new Map();
        var params$593 = [];
        var context$594, builtInContext$595 = makeExpanderContext$287({ env: env$592 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$591) {
            var builtinRead$598 = parser$125.read(builtinSource$591);
            builtinRead$598 = [
                syn$126.makeIdent('module', null),
                syn$126.makeDelim('{}', builtinRead$598, null)
            ];
            var builtinRes$599 = expand$286(builtinRead$598, builtInContext$595);
            params$593 = _$124.map(builtinRes$599[0].exports, function (term$600) {
                return {
                    oldExport: term$600.name,
                    newParam: syn$126.makeIdent(term$600.name.token.value, null)
                };
            });
        }
        var modBody$596 = syn$126.makeDelim('{}', stx$590, null);
        modBody$596 = _$124.reduce(params$593, function (acc$601, param$602) {
            var newName$603 = fresh$234();
            env$592.set(resolve$228(param$602.newParam.rename(param$602.newParam, newName$603)), env$592.get(resolve$228(param$602.oldExport)));
            return acc$601.rename(param$602.newParam, newName$603);
        }, modBody$596);
        context$594 = makeExpanderContext$287({ env: env$592 });
        var res$597 = expand$286([
                syn$126.makeIdent('module', null),
                modBody$596
            ], context$594);
        res$597 = res$597[0].destruct();
        return flatten$289(res$597[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$289(stx$604) {
        return _$124.reduce(stx$604, function (acc$605, stx$606) {
            if (stx$606.token.type === parser$125.Token.Delimiter) {
                var exposed$607 = stx$606.expose();
                var openParen$608 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$606.token.value[0],
                        range: stx$606.token.startRange,
                        sm_range: typeof stx$606.token.sm_startRange == 'undefined' ? stx$606.token.startRange : stx$606.token.sm_startRange,
                        lineNumber: stx$606.token.startLineNumber,
                        sm_lineNumber: typeof stx$606.token.sm_startLineNumber == 'undefined' ? stx$606.token.startLineNumber : stx$606.token.sm_startLineNumber,
                        lineStart: stx$606.token.startLineStart,
                        sm_lineStart: typeof stx$606.token.sm_startLineStart == 'undefined' ? stx$606.token.startLineStart : stx$606.token.sm_startLineStart
                    }, exposed$607);
                var closeParen$609 = syntaxFromToken$224({
                        type: parser$125.Token.Punctuator,
                        value: stx$606.token.value[1],
                        range: stx$606.token.endRange,
                        sm_range: typeof stx$606.token.sm_endRange == 'undefined' ? stx$606.token.endRange : stx$606.token.sm_endRange,
                        lineNumber: stx$606.token.endLineNumber,
                        sm_lineNumber: typeof stx$606.token.sm_endLineNumber == 'undefined' ? stx$606.token.endLineNumber : stx$606.token.sm_endLineNumber,
                        lineStart: stx$606.token.endLineStart,
                        sm_lineStart: typeof stx$606.token.sm_endLineStart == 'undefined' ? stx$606.token.endLineStart : stx$606.token.sm_endLineStart
                    }, exposed$607);
                if (stx$606.token.leadingComments) {
                    openParen$608.token.leadingComments = stx$606.token.leadingComments;
                }
                if (stx$606.token.trailingComments) {
                    openParen$608.token.trailingComments = stx$606.token.trailingComments;
                }
                return acc$605.concat(openParen$608).concat(flatten$289(exposed$607.token.inner)).concat(closeParen$609);
            }
            stx$606.token.sm_lineNumber = stx$606.token.sm_lineNumber ? stx$606.token.sm_lineNumber : stx$606.token.lineNumber;
            stx$606.token.sm_lineStart = stx$606.token.sm_lineStart ? stx$606.token.sm_lineStart : stx$606.token.lineStart;
            stx$606.token.sm_range = stx$606.token.sm_range ? stx$606.token.sm_range : stx$606.token.range;
            return acc$605.concat(stx$606);
        }, []);
    }
    exports$123.enforest = enforest$278;
    exports$123.expand = expandTopLevel$288;
    exports$123.resolve = resolve$228;
    exports$123.get_expression = get_expression$279;
    exports$123.makeExpanderContext = makeExpanderContext$287;
    exports$123.Expr = Expr$240;
    exports$123.VariableStatement = VariableStatement$267;
    exports$123.tokensToSyntax = syn$126.tokensToSyntax;
    exports$123.syntaxToTokens = syn$126.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map