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
(function (root$166, factory$167) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$167(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$167);
    }
}(this, function (exports$168, _$169, parser$170, syn$171, es6$172, se$173, patternModule$174, gen$175) {
    'use strict';
    var codegen$176 = gen$175 || escodegen;
    // used to export "private" methods for unit testing
    exports$168._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$335 = Object.create(this);
                if (typeof o$335.construct === 'function') {
                    o$335.construct.apply(o$335, arguments);
                }
                return o$335;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$336) {
                var result$337 = Object.create(this);
                for (var prop$338 in properties$336) {
                    if (properties$336.hasOwnProperty(prop$338)) {
                        result$337[prop$338] = properties$336[prop$338];
                    }
                }
                return result$337;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$339) {
                function F$340() {
                }
                F$340.prototype = proto$339;
                return this instanceof F$340;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$260(msg$341) {
        throw new Error(msg$341);
    }
    var scopedEval$261 = se$173.scopedEval;
    var Rename$262 = syn$171.Rename;
    var Mark$263 = syn$171.Mark;
    var Var$264 = syn$171.Var;
    var Def$265 = syn$171.Def;
    var isDef$266 = syn$171.isDef;
    var isMark$267 = syn$171.isMark;
    var isRename$268 = syn$171.isRename;
    var syntaxFromToken$269 = syn$171.syntaxFromToken;
    var joinSyntax$270 = syn$171.joinSyntax;
    function remdup$271(mark$342, mlist$343) {
        if (mark$342 === _$169.first(mlist$343)) {
            return _$169.rest(mlist$343, 1);
        }
        return [mark$342].concat(mlist$343);
    }
    // (CSyntax) -> [...Num]
    function marksof$272(ctx$344, stopName$345, originalName$346) {
        var mark$347, submarks$348;
        if (isMark$267(ctx$344)) {
            mark$347 = ctx$344.mark;
            submarks$348 = marksof$272(ctx$344.context, stopName$345, originalName$346);
            return remdup$271(mark$347, submarks$348);
        }
        if (isDef$266(ctx$344)) {
            return marksof$272(ctx$344.context, stopName$345, originalName$346);
        }
        if (isRename$268(ctx$344)) {
            if (stopName$345 === originalName$346 + '$' + ctx$344.name) {
                return [];
            }
            return marksof$272(ctx$344.context, stopName$345, originalName$346);
        }
        return [];
    }
    function resolve$273(stx$349) {
        return resolveCtx$277(stx$349.token.value, stx$349.context, [], []);
    }
    function arraysEqual$274(a$350, b$351) {
        if (a$350.length !== b$351.length) {
            return false;
        }
        for (var i$352 = 0; i$352 < a$350.length; i$352++) {
            if (a$350[i$352] !== b$351[i$352]) {
                return false;
            }
        }
        return true;
    }
    function renames$275(defctx$353, oldctx$354, originalName$355) {
        var acc$356 = oldctx$354;
        for (var i$357 = 0; i$357 < defctx$353.length; i$357++) {
            if (defctx$353[i$357].id.token.value === originalName$355) {
                acc$356 = Rename$262(defctx$353[i$357].id, defctx$353[i$357].name, acc$356, defctx$353);
            }
        }
        return acc$356;
    }
    function unionEl$276(arr$358, el$359) {
        if (arr$358.indexOf(el$359) === -1) {
            var res$360 = arr$358.slice(0);
            res$360.push(el$359);
            return res$360;
        }
        return arr$358;
    }
    // (Syntax) -> String
    function resolveCtx$277(originalName$361, ctx$362, stop_spine$363, stop_branch$364) {
        if (isMark$267(ctx$362)) {
            return resolveCtx$277(originalName$361, ctx$362.context, stop_spine$363, stop_branch$364);
        }
        if (isDef$266(ctx$362)) {
            if (stop_spine$363.indexOf(ctx$362.defctx) !== -1) {
                return resolveCtx$277(originalName$361, ctx$362.context, stop_spine$363, stop_branch$364);
            } else {
                return resolveCtx$277(originalName$361, renames$275(ctx$362.defctx, ctx$362.context, originalName$361), stop_spine$363, unionEl$276(stop_branch$364, ctx$362.defctx));
            }
        }
        if (isRename$268(ctx$362)) {
            if (originalName$361 === ctx$362.id.token.value) {
                var idName$365 = resolveCtx$277(ctx$362.id.token.value, ctx$362.id.context, stop_branch$364, stop_branch$364);
                var subName$366 = resolveCtx$277(originalName$361, ctx$362.context, unionEl$276(stop_spine$363, ctx$362.def), stop_branch$364);
                if (idName$365 === subName$366) {
                    var idMarks$367 = marksof$272(ctx$362.id.context, originalName$361 + '$' + ctx$362.name, originalName$361);
                    var subMarks$368 = marksof$272(ctx$362.context, originalName$361 + '$' + ctx$362.name, originalName$361);
                    if (arraysEqual$274(idMarks$367, subMarks$368)) {
                        return originalName$361 + '$' + ctx$362.name;
                    }
                }
            }
            return resolveCtx$277(originalName$361, ctx$362.context, stop_spine$363, stop_branch$364);
        }
        return originalName$361;
    }
    var nextFresh$278 = 0;
    // fun () -> Num
    function fresh$279() {
        return nextFresh$278++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$280(towrap$369, delimSyntax$370) {
        parser$170.assert(delimSyntax$370.token.type === parser$170.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$269({
            type: parser$170.Token.Delimiter,
            value: delimSyntax$370.token.value,
            inner: towrap$369,
            range: delimSyntax$370.token.range,
            startLineNumber: delimSyntax$370.token.startLineNumber,
            lineStart: delimSyntax$370.token.lineStart
        }, delimSyntax$370);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$281(argSyntax$371) {
        if (argSyntax$371.token.type === parser$170.Token.Delimiter) {
            return _$169.filter(argSyntax$371.token.inner, function (stx$372) {
                return stx$372.token.value !== ',';
            });
        } else if (argSyntax$371.token.type === parser$170.Token.Identifier) {
            return [argSyntax$371];
        } else {
            parser$170.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$282 = {
            destruct: function () {
                return _$169.reduce(this.properties, _$169.bind(function (acc$373, prop$374) {
                    if (this[prop$374] && this[prop$374].hasPrototype(TermTree$282)) {
                        return acc$373.concat(this[prop$374].destruct());
                    } else if (this[prop$374] && this[prop$374].token && this[prop$374].token.inner) {
                        this[prop$374].token.inner = _$169.reduce(this[prop$374].token.inner, function (acc$375, t$376) {
                            if (t$376.hasPrototype(TermTree$282)) {
                                return acc$375.concat(t$376.destruct());
                            }
                            return acc$375.concat(t$376);
                        }, []);
                        return acc$373.concat(this[prop$374]);
                    } else if (Array.isArray(this[prop$374])) {
                        return acc$373.concat(_$169.reduce(this[prop$374], function (acc$377, t$378) {
                            if (t$378.hasPrototype(TermTree$282)) {
                                return acc$377.concat(t$378.destruct());
                            }
                            return acc$377.concat(t$378);
                        }, []));
                    } else if (this[prop$374]) {
                        return acc$373.concat(this[prop$374]);
                    } else {
                        return acc$373;
                    }
                }, this), []);
            },
            addDefCtx: function (def$379) {
                for (var i$380 = 0; i$380 < this.properties.length; i$380++) {
                    var prop$381 = this.properties[i$380];
                    if (Array.isArray(this[prop$381])) {
                        this[prop$381] = _$169.map(this[prop$381], function (item$382) {
                            return item$382.addDefCtx(def$379);
                        });
                    } else if (this[prop$381]) {
                        this[prop$381] = this[prop$381].addDefCtx(def$379);
                    }
                }
                return this;
            }
        };
    var EOF$283 = TermTree$282.extend({
            properties: ['eof'],
            construct: function (e$383) {
                this.eof = e$383;
            }
        });
    var Statement$284 = TermTree$282.extend({
            construct: function () {
            }
        });
    var Expr$285 = TermTree$282.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$286 = Expr$285.extend({
            construct: function () {
            }
        });
    var ThisExpression$287 = PrimaryExpression$286.extend({
            properties: ['this'],
            construct: function (that$384) {
                this.this = that$384;
            }
        });
    var Lit$288 = PrimaryExpression$286.extend({
            properties: ['lit'],
            construct: function (l$385) {
                this.lit = l$385;
            }
        });
    exports$168._test.PropertyAssignment = PropertyAssignment$289;
    var PropertyAssignment$289 = TermTree$282.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$386, assignment$387) {
                this.propName = propName$386;
                this.assignment = assignment$387;
            }
        });
    var Block$290 = PrimaryExpression$286.extend({
            properties: ['body'],
            construct: function (body$388) {
                this.body = body$388;
            }
        });
    var ArrayLiteral$291 = PrimaryExpression$286.extend({
            properties: ['array'],
            construct: function (ar$389) {
                this.array = ar$389;
            }
        });
    var ParenExpression$292 = PrimaryExpression$286.extend({
            properties: ['expr'],
            construct: function (expr$390) {
                this.expr = expr$390;
            }
        });
    var UnaryOp$293 = Expr$285.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$391, expr$392) {
                this.op = op$391;
                this.expr = expr$392;
            }
        });
    var PostfixOp$294 = Expr$285.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$393, op$394) {
                this.expr = expr$393;
                this.op = op$394;
            }
        });
    var BinOp$295 = Expr$285.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$395, left$396, right$397) {
                this.op = op$395;
                this.left = left$396;
                this.right = right$397;
            }
        });
    var ConditionalExpression$296 = Expr$285.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$398, question$399, tru$400, colon$401, fls$402) {
                this.cond = cond$398;
                this.question = question$399;
                this.tru = tru$400;
                this.colon = colon$401;
                this.fls = fls$402;
            }
        });
    var Keyword$297 = TermTree$282.extend({
            properties: ['keyword'],
            construct: function (k$403) {
                this.keyword = k$403;
            }
        });
    var Punc$298 = TermTree$282.extend({
            properties: ['punc'],
            construct: function (p$404) {
                this.punc = p$404;
            }
        });
    var Delimiter$299 = TermTree$282.extend({
            properties: ['delim'],
            construct: function (d$405) {
                this.delim = d$405;
            }
        });
    var Id$300 = PrimaryExpression$286.extend({
            properties: ['id'],
            construct: function (id$406) {
                this.id = id$406;
            }
        });
    var NamedFun$301 = Expr$285.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$407, star$408, name$409, params$410, body$411) {
                this.keyword = keyword$407;
                this.star = star$408;
                this.name = name$409;
                this.params = params$410;
                this.body = body$411;
            }
        });
    var AnonFun$302 = Expr$285.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$412, star$413, params$414, body$415) {
                this.keyword = keyword$412;
                this.star = star$413;
                this.params = params$414;
                this.body = body$415;
            }
        });
    var ArrowFun$303 = Expr$285.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$416, arrow$417, body$418) {
                this.params = params$416;
                this.arrow = arrow$417;
                this.body = body$418;
            }
        });
    var LetMacro$304 = TermTree$282.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$419, body$420) {
                this.name = name$419;
                this.body = body$420;
            }
        });
    var Macro$305 = TermTree$282.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$421, body$422) {
                this.name = name$421;
                this.body = body$422;
            }
        });
    var AnonMacro$306 = TermTree$282.extend({
            properties: ['body'],
            construct: function (body$423) {
                this.body = body$423;
            }
        });
    var Const$307 = Expr$285.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$424, call$425) {
                this.newterm = newterm$424;
                this.call = call$425;
            }
        });
    var Call$308 = Expr$285.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$170.assert(this.fun.hasPrototype(TermTree$282), 'expecting a term tree in destruct of call');
                var that$426 = this;
                this.delim = syntaxFromToken$269(_$169.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$169.reduce(this.args, function (acc$427, term$428) {
                    parser$170.assert(term$428 && term$428.hasPrototype(TermTree$282), 'expecting term trees in destruct of Call');
                    var dst$429 = acc$427.concat(term$428.destruct());
                    // add all commas except for the last one
                    if (that$426.commas.length > 0) {
                        dst$429 = dst$429.concat(that$426.commas.shift());
                    }
                    return dst$429;
                }, []);
                return this.fun.destruct().concat(Delimiter$299.create(this.delim).destruct());
            },
            construct: function (funn$430, args$431, delim$432, commas$433) {
                parser$170.assert(Array.isArray(args$431), 'requires an array of arguments terms');
                this.fun = funn$430;
                this.args = args$431;
                this.delim = delim$432;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$433;
            }
        });
    var ObjDotGet$309 = Expr$285.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$434, dot$435, right$436) {
                this.left = left$434;
                this.dot = dot$435;
                this.right = right$436;
            }
        });
    var ObjGet$310 = Expr$285.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$437, right$438) {
                this.left = left$437;
                this.right = right$438;
            }
        });
    var VariableDeclaration$311 = TermTree$282.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$439, eqstx$440, init$441, comma$442) {
                this.ident = ident$439;
                this.eqstx = eqstx$440;
                this.init = init$441;
                this.comma = comma$442;
            }
        });
    var VariableStatement$312 = Statement$284.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$169.reduce(this.decls, function (acc$443, decl$444) {
                    return acc$443.concat(decl$444.destruct());
                }, []));
            },
            construct: function (varkw$445, decls$446) {
                parser$170.assert(Array.isArray(decls$446), 'decls must be an array');
                this.varkw = varkw$445;
                this.decls = decls$446;
            }
        });
    var LetStatement$313 = Statement$284.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$169.reduce(this.decls, function (acc$447, decl$448) {
                    return acc$447.concat(decl$448.destruct());
                }, []));
            },
            construct: function (letkw$449, decls$450) {
                parser$170.assert(Array.isArray(decls$450), 'decls must be an array');
                this.letkw = letkw$449;
                this.decls = decls$450;
            }
        });
    var ConstStatement$314 = Statement$284.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$169.reduce(this.decls, function (acc$451, decl$452) {
                    return acc$451.concat(decl$452.destruct());
                }, []));
            },
            construct: function (constkw$453, decls$454) {
                parser$170.assert(Array.isArray(decls$454), 'decls must be an array');
                this.constkw = constkw$453;
                this.decls = decls$454;
            }
        });
    var CatchClause$315 = TermTree$282.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$455, params$456, body$457) {
                this.catchkw = catchkw$455;
                this.params = params$456;
                this.body = body$457;
            }
        });
    var Module$316 = TermTree$282.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$458) {
                this.body = body$458;
                this.exports = [];
            }
        });
    var Empty$317 = TermTree$282.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$318 = TermTree$282.extend({
            properties: ['name'],
            construct: function (name$459) {
                this.name = name$459;
            }
        });
    function stxIsUnaryOp$319(stx$460) {
        var staticOperators$461 = [
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
        return _$169.contains(staticOperators$461, stx$460.token.value);
    }
    function stxIsBinOp$320(stx$462) {
        var staticOperators$463 = [
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
        return _$169.contains(staticOperators$463, stx$462.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$321(stx$464, context$465) {
        var decls$466 = [];
        var res$467 = enforest$323(stx$464, context$465);
        var result$468 = res$467.result;
        var rest$469 = res$467.rest;
        if (rest$469[0]) {
            var nextRes$470 = enforest$323(rest$469, context$465);
            // x = ...
            if (nextRes$470.result.hasPrototype(Punc$298) && nextRes$470.result.punc.token.value === '=') {
                var initializerRes$471 = enforest$323(nextRes$470.rest, context$465);
                if (initializerRes$471.rest[0]) {
                    var restRes$472 = enforest$323(initializerRes$471.rest, context$465);
                    // x = y + z, ...
                    if (restRes$472.result.hasPrototype(Punc$298) && restRes$472.result.punc.token.value === ',') {
                        decls$466.push(VariableDeclaration$311.create(result$468.id, nextRes$470.result.punc, initializerRes$471.result, restRes$472.result.punc));
                        var subRes$473 = enforestVarStatement$321(restRes$472.rest, context$465);
                        decls$466 = decls$466.concat(subRes$473.result);
                        rest$469 = subRes$473.rest;
                    }    // x = y ...
                    else {
                        decls$466.push(VariableDeclaration$311.create(result$468.id, nextRes$470.result.punc, initializerRes$471.result));
                        rest$469 = initializerRes$471.rest;
                    }
                }    // x = y EOF
                else {
                    decls$466.push(VariableDeclaration$311.create(result$468.id, nextRes$470.result.punc, initializerRes$471.result));
                }
            }    // x ,...;
            else if (nextRes$470.result.hasPrototype(Punc$298) && nextRes$470.result.punc.token.value === ',') {
                decls$466.push(VariableDeclaration$311.create(result$468.id, null, null, nextRes$470.result.punc));
                var subRes$473 = enforestVarStatement$321(nextRes$470.rest, context$465);
                decls$466 = decls$466.concat(subRes$473.result);
                rest$469 = subRes$473.rest;
            } else {
                if (result$468.hasPrototype(Id$300)) {
                    decls$466.push(VariableDeclaration$311.create(result$468.id));
                } else {
                    throwError$260('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$468.hasPrototype(Id$300)) {
                decls$466.push(VariableDeclaration$311.create(result$468.id));
            } else if (result$468.hasPrototype(BinOp$295) && result$468.op.token.value === 'in') {
                decls$466.push(VariableDeclaration$311.create(result$468.left.id, result$468.op, result$468.right));
            } else {
                throwError$260('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$466,
            rest: rest$469
        };
    }
    function adjustLineContext$322(stx$474, original$475, current$476) {
        current$476 = current$476 || {
            lastLineNumber: original$475.token.lineNumber,
            lineNumber: original$475.token.lineNumber - 1
        };
        return _$169.map(stx$474, function (stx$477) {
            if (stx$477.token.type === parser$170.Token.Delimiter) {
                // handle tokens with missing line info
                stx$477.token.startLineNumber = typeof stx$477.token.startLineNumber == 'undefined' ? original$475.token.lineNumber : stx$477.token.startLineNumber;
                stx$477.token.endLineNumber = typeof stx$477.token.endLineNumber == 'undefined' ? original$475.token.lineNumber : stx$477.token.endLineNumber;
                stx$477.token.startLineStart = typeof stx$477.token.startLineStart == 'undefined' ? original$475.token.lineStart : stx$477.token.startLineStart;
                stx$477.token.endLineStart = typeof stx$477.token.endLineStart == 'undefined' ? original$475.token.lineStart : stx$477.token.endLineStart;
                stx$477.token.startRange = typeof stx$477.token.startRange == 'undefined' ? original$475.token.range : stx$477.token.startRange;
                stx$477.token.endRange = typeof stx$477.token.endRange == 'undefined' ? original$475.token.range : stx$477.token.endRange;
                stx$477.token.sm_startLineNumber = typeof stx$477.token.sm_startLineNumber == 'undefined' ? stx$477.token.startLineNumber : stx$477.token.sm_startLineNumber;
                stx$477.token.sm_endLineNumber = typeof stx$477.token.sm_endLineNumber == 'undefined' ? stx$477.token.endLineNumber : stx$477.token.sm_endLineNumber;
                stx$477.token.sm_startLineStart = typeof stx$477.token.sm_startLineStart == 'undefined' ? stx$477.token.startLineStart : stx$477.token.sm_startLineStart;
                stx$477.token.sm_endLineStart = typeof stx$477.token.sm_endLineStart == 'undefined' ? stx$477.token.endLineStart : stx$477.token.sm_endLineStart;
                stx$477.token.sm_startRange = typeof stx$477.token.sm_startRange == 'undefined' ? stx$477.token.startRange : stx$477.token.sm_startRange;
                stx$477.token.sm_endRange = typeof stx$477.token.sm_endRange == 'undefined' ? stx$477.token.endRange : stx$477.token.sm_endRange;
                stx$477.token.startLineNumber = original$475.token.lineNumber;
                if (stx$477.token.inner.length > 0) {
                    stx$477.token.inner = adjustLineContext$322(stx$477.token.inner, original$475, current$476);
                }
                return stx$477;
            }
            // handle tokens with missing line info
            stx$477.token.lineNumber = typeof stx$477.token.lineNumber == 'undefined' ? original$475.token.lineNumber : stx$477.token.lineNumber;
            stx$477.token.lineStart = typeof stx$477.token.lineStart == 'undefined' ? original$475.token.lineStart : stx$477.token.lineStart;
            stx$477.token.range = typeof stx$477.token.range == 'undefined' ? original$475.token.range : stx$477.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$477.token.sm_lineNumber = typeof stx$477.token.sm_lineNumber == 'undefined' ? stx$477.token.lineNumber : stx$477.token.sm_lineNumber;
            stx$477.token.sm_lineStart = typeof stx$477.token.sm_lineStart == 'undefined' ? stx$477.token.lineStart : stx$477.token.sm_lineStart;
            stx$477.token.sm_range = typeof stx$477.token.sm_range == 'undefined' ? _$169.clone(stx$477.token.range) : stx$477.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$477.token.lineNumber = original$475.token.lineNumber;
            return stx$477;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$323(toks$478, context$479) {
        parser$170.assert(toks$478.length > 0, 'enforest assumes there are tokens to work with');
        function step$480(head$481, rest$482) {
            var innerTokens$483;
            parser$170.assert(Array.isArray(rest$482), 'result must at least be an empty array');
            if (head$481.hasPrototype(TermTree$282)) {
                // function call
                var emp$486 = head$481.emp;
                var emp$486 = head$481.emp;
                var keyword$489 = head$481.keyword;
                var delim$491 = head$481.delim;
                var id$493 = head$481.id;
                var delim$491 = head$481.delim;
                var emp$486 = head$481.emp;
                var punc$497 = head$481.punc;
                var keyword$489 = head$481.keyword;
                var emp$486 = head$481.emp;
                var emp$486 = head$481.emp;
                var emp$486 = head$481.emp;
                var delim$491 = head$481.delim;
                var delim$491 = head$481.delim;
                var keyword$489 = head$481.keyword;
                var keyword$489 = head$481.keyword;
                var keyword$489 = head$481.keyword;
                var keyword$489 = head$481.keyword;
                if (head$481.hasPrototype(Expr$285) && rest$482[0] && rest$482[0].token.type === parser$170.Token.Delimiter && rest$482[0].token.value === '()') {
                    var argRes$528, enforestedArgs$529 = [], commas$530 = [];
                    rest$482[0].expose();
                    innerTokens$483 = rest$482[0].token.inner;
                    while (innerTokens$483.length > 0) {
                        argRes$528 = enforest$323(innerTokens$483, context$479);
                        enforestedArgs$529.push(argRes$528.result);
                        innerTokens$483 = argRes$528.rest;
                        if (innerTokens$483[0] && innerTokens$483[0].token.value === ',') {
                            // record the comma for later
                            commas$530.push(innerTokens$483[0]);
                            // but dump it for the next loop turn
                            innerTokens$483 = innerTokens$483.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$531 = _$169.all(enforestedArgs$529, function (argTerm$532) {
                            return argTerm$532.hasPrototype(Expr$285);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$483.length === 0 && argsAreExprs$531) {
                        return step$480(Call$308.create(head$481, enforestedArgs$529, rest$482[0], commas$530), rest$482.slice(1));
                    }
                } else if (head$481.hasPrototype(Expr$285) && rest$482[0] && rest$482[0].token.value === '?') {
                    var question$533 = rest$482[0];
                    var condRes$534 = enforest$323(rest$482.slice(1), context$479);
                    var truExpr$535 = condRes$534.result;
                    var right$536 = condRes$534.rest;
                    if (truExpr$535.hasPrototype(Expr$285) && right$536[0] && right$536[0].token.value === ':') {
                        var colon$537 = right$536[0];
                        var flsRes$538 = enforest$323(right$536.slice(1), context$479);
                        var flsExpr$539 = flsRes$538.result;
                        if (flsExpr$539.hasPrototype(Expr$285)) {
                            return step$480(ConditionalExpression$296.create(head$481, question$533, truExpr$535, colon$537, flsExpr$539), flsRes$538.rest);
                        }
                    }
                } else if (head$481.hasPrototype(Keyword$297) && keyword$489.token.value === 'new' && rest$482[0]) {
                    var newCallRes$540 = enforest$323(rest$482, context$479);
                    if (newCallRes$540.result.hasPrototype(Call$308)) {
                        return step$480(Const$307.create(head$481, newCallRes$540.result), newCallRes$540.rest);
                    }
                } else if (head$481.hasPrototype(Delimiter$299) && delim$491.token.value === '()' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator && rest$482[0].token.value === '=>') {
                    var res$541 = enforest$323(rest$482.slice(1), context$479);
                    if (res$541.result.hasPrototype(Expr$285)) {
                        return step$480(ArrowFun$303.create(delim$491, rest$482[0], res$541.result.destruct()), res$541.rest);
                    } else {
                        throwError$260('Body of arrow function must be an expression');
                    }
                } else if (head$481.hasPrototype(Id$300) && rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator && rest$482[0].token.value === '=>') {
                    var res$541 = enforest$323(rest$482.slice(1), context$479);
                    if (res$541.result.hasPrototype(Expr$285)) {
                        return step$480(ArrowFun$303.create(id$493, rest$482[0], res$541.result.destruct()), res$541.rest);
                    } else {
                        throwError$260('Body of arrow function must be an expression');
                    }
                } else if (head$481.hasPrototype(Delimiter$299) && delim$491.token.value === '()') {
                    innerTokens$483 = delim$491.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$483.length === 0) {
                        return step$480(ParenExpression$292.create(head$481), rest$482);
                    } else {
                        var innerTerm$542 = get_expression$324(innerTokens$483, context$479);
                        if (innerTerm$542.result && innerTerm$542.result.hasPrototype(Expr$285)) {
                            return step$480(ParenExpression$292.create(head$481), rest$482);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$481.hasPrototype(Expr$285) && rest$482[0] && rest$482[1] && stxIsBinOp$320(rest$482[0])) {
                    var op$543 = rest$482[0];
                    var left$544 = head$481;
                    var bopRes$545 = enforest$323(rest$482.slice(1), context$479);
                    var right$536 = bopRes$545.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$536.hasPrototype(Expr$285)) {
                        return step$480(BinOp$295.create(op$543, left$544, right$536), bopRes$545.rest);
                    }
                } else if (head$481.hasPrototype(Punc$298) && stxIsUnaryOp$319(punc$497)) {
                    var unopRes$546 = enforest$323(rest$482, context$479);
                    if (unopRes$546.result.hasPrototype(Expr$285)) {
                        return step$480(UnaryOp$293.create(punc$497, unopRes$546.result), unopRes$546.rest);
                    }
                } else if (head$481.hasPrototype(Keyword$297) && stxIsUnaryOp$319(keyword$489)) {
                    var unopRes$546 = enforest$323(rest$482, context$479);
                    if (unopRes$546.result.hasPrototype(Expr$285)) {
                        return step$480(UnaryOp$293.create(keyword$489, unopRes$546.result), unopRes$546.rest);
                    }
                } else if (head$481.hasPrototype(Expr$285) && rest$482[0] && (rest$482[0].token.value === '++' || rest$482[0].token.value === '--')) {
                    return step$480(PostfixOp$294.create(head$481, rest$482[0]), rest$482.slice(1));
                } else if (head$481.hasPrototype(Expr$285) && rest$482[0] && rest$482[0].token.value === '[]') {
                    return step$480(ObjGet$310.create(head$481, Delimiter$299.create(rest$482[0].expose())), rest$482.slice(1));
                } else if (head$481.hasPrototype(Expr$285) && rest$482[0] && rest$482[0].token.value === '.' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Identifier) {
                    return step$480(ObjDotGet$309.create(head$481, rest$482[0], rest$482[1]), rest$482.slice(2));
                } else if (head$481.hasPrototype(Delimiter$299) && delim$491.token.value === '[]') {
                    return step$480(ArrayLiteral$291.create(head$481), rest$482);
                } else if (head$481.hasPrototype(Delimiter$299) && head$481.delim.token.value === '{}') {
                    return step$480(Block$290.create(head$481), rest$482);
                } else if (head$481.hasPrototype(Keyword$297) && keyword$489.token.value === 'let' && (rest$482[0] && rest$482[0].token.type === parser$170.Token.Identifier || rest$482[0] && rest$482[0].token.type === parser$170.Token.Keyword || rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator) && rest$482[1] && rest$482[1].token.value === '=' && rest$482[2] && rest$482[2].token.value === 'macro') {
                    var mac$547 = enforest$323(rest$482.slice(2), context$479);
                    if (!mac$547.result.hasPrototype(AnonMacro$306)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$547.result);
                    }
                    return step$480(LetMacro$304.create(rest$482[0], mac$547.result.body), mac$547.rest);
                } else if (head$481.hasPrototype(Keyword$297) && keyword$489.token.value === 'var' && rest$482[0]) {
                    var vsRes$548 = enforestVarStatement$321(rest$482, context$479);
                    if (vsRes$548) {
                        return step$480(VariableStatement$312.create(head$481, vsRes$548.result), vsRes$548.rest);
                    }
                } else if (head$481.hasPrototype(Keyword$297) && keyword$489.token.value === 'let' && rest$482[0]) {
                    var vsRes$548 = enforestVarStatement$321(rest$482, context$479);
                    if (vsRes$548) {
                        return step$480(LetStatement$313.create(head$481, vsRes$548.result), vsRes$548.rest);
                    }
                } else if (head$481.hasPrototype(Keyword$297) && keyword$489.token.value === 'const' && rest$482[0]) {
                    var vsRes$548 = enforestVarStatement$321(rest$482, context$479);
                    if (vsRes$548) {
                        return step$480(ConstStatement$314.create(head$481, vsRes$548.result), vsRes$548.rest);
                    }
                }
            } else {
                parser$170.assert(head$481 && head$481.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$481.token.type === parser$170.Token.Identifier || head$481.token.type === parser$170.Token.Keyword || head$481.token.type === parser$170.Token.Punctuator) && context$479.env.has(resolve$273(head$481))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$549 = fresh$279();
                    var transformerContext$550 = makeExpanderContext$332(_$169.defaults({ mark: newMark$549 }, context$479));
                    // pull the macro transformer out the environment
                    var transformer$551 = context$479.env.get(resolve$273(head$481)).fn;
                    // apply the transformer
                    var rt$552 = transformer$551([head$481].concat(rest$482), transformerContext$550);
                    if (!Array.isArray(rt$552.result)) {
                        throwError$260('Macro transformer must return a result array, not: ' + rt$552.result);
                    }
                    if (rt$552.result.length > 0) {
                        var adjustedResult$553 = adjustLineContext$322(rt$552.result, head$481);
                        adjustedResult$553[0].token.leadingComments = head$481.token.leadingComments;
                        return step$480(adjustedResult$553[0], adjustedResult$553.slice(1).concat(rt$552.rest));
                    } else {
                        return step$480(Empty$317.create(), rt$552.rest);
                    }
                }    // anon macro definition
                else if (head$481.token.type === parser$170.Token.Identifier && head$481.token.value === 'macro' && rest$482[0] && rest$482[0].token.value === '{}') {
                    return step$480(AnonMacro$306.create(rest$482[0].expose().token.inner), rest$482.slice(1));
                }    // macro definition
                else if (head$481.token.type === parser$170.Token.Identifier && head$481.token.value === 'macro' && rest$482[0] && (rest$482[0].token.type === parser$170.Token.Identifier || rest$482[0].token.type === parser$170.Token.Keyword || rest$482[0].token.type === parser$170.Token.Punctuator) && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '{}') {
                    return step$480(Macro$305.create(rest$482[0], rest$482[1].expose().token.inner), rest$482.slice(2));
                }    // module definition
                else if (head$481.token.value === 'module' && rest$482[0] && rest$482[0].token.value === '{}') {
                    return step$480(Module$316.create(rest$482[0]), rest$482.slice(1));
                }    // function definition
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'function' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Identifier && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '()' && rest$482[2] && rest$482[2].token.type === parser$170.Token.Delimiter && rest$482[2].token.value === '{}') {
                    rest$482[1].token.inner = rest$482[1].expose().token.inner;
                    rest$482[2].token.inner = rest$482[2].expose().token.inner;
                    return step$480(NamedFun$301.create(head$481, null, rest$482[0], rest$482[1], rest$482[2]), rest$482.slice(3));
                }    // generator function definition
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'function' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator && rest$482[0].token.value === '*' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Identifier && rest$482[2] && rest$482[2].token.type === parser$170.Token.Delimiter && rest$482[2].token.value === '()' && rest$482[3] && rest$482[3].token.type === parser$170.Token.Delimiter && rest$482[3].token.value === '{}') {
                    rest$482[2].token.inner = rest$482[2].expose().token.inner;
                    rest$482[3].token.inner = rest$482[3].expose().token.inner;
                    return step$480(NamedFun$301.create(head$481, rest$482[0], rest$482[1], rest$482[2], rest$482[3]), rest$482.slice(4));
                }    // anonymous function definition
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'function' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Delimiter && rest$482[0].token.value === '()' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '{}') {
                    rest$482[0].token.inner = rest$482[0].expose().token.inner;
                    rest$482[1].token.inner = rest$482[1].expose().token.inner;
                    return step$480(AnonFun$302.create(head$481, null, rest$482[0], rest$482[1]), rest$482.slice(2));
                }    // anonymous generator function definition
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'function' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator && rest$482[0].token.value === '*' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '()' && rest$482[2] && rest$482[2].token.type === parser$170.Token.Delimiter && rest$482[2].token.value === '{}') {
                    rest$482[1].token.inner = rest$482[1].expose().token.inner;
                    rest$482[2].token.inner = rest$482[2].expose().token.inner;
                    return step$480(AnonFun$302.create(head$481, rest$482[0], rest$482[1], rest$482[2]), rest$482.slice(3));
                }    // arrow function
                else if ((head$481.token.type === parser$170.Token.Delimiter && head$481.token.value === '()' || head$481.token.type === parser$170.Token.Identifier) && rest$482[0] && rest$482[0].token.type === parser$170.Token.Punctuator && rest$482[0].token.value === '=>' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '{}') {
                    return step$480(ArrowFun$303.create(head$481, rest$482[0], rest$482[1]), rest$482.slice(2));
                }    // catch statement
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'catch' && rest$482[0] && rest$482[0].token.type === parser$170.Token.Delimiter && rest$482[0].token.value === '()' && rest$482[1] && rest$482[1].token.type === parser$170.Token.Delimiter && rest$482[1].token.value === '{}') {
                    rest$482[0].token.inner = rest$482[0].expose().token.inner;
                    rest$482[1].token.inner = rest$482[1].expose().token.inner;
                    return step$480(CatchClause$315.create(head$481, rest$482[0], rest$482[1]), rest$482.slice(2));
                }    // this expression
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'this') {
                    return step$480(ThisExpression$287.create(head$481), rest$482);
                }    // literal
                else if (head$481.token.type === parser$170.Token.NumericLiteral || head$481.token.type === parser$170.Token.StringLiteral || head$481.token.type === parser$170.Token.BooleanLiteral || head$481.token.type === parser$170.Token.RegularExpression || head$481.token.type === parser$170.Token.NullLiteral) {
                    return step$480(Lit$288.create(head$481), rest$482);
                }    // export
                else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'export' && rest$482[0] && (rest$482[0].token.type === parser$170.Token.Identifier || rest$482[0].token.type === parser$170.Token.Keyword || rest$482[0].token.type === parser$170.Token.Punctuator)) {
                    return step$480(Export$318.create(rest$482[0]), rest$482.slice(1));
                }    // identifier
                else if (head$481.token.type === parser$170.Token.Identifier) {
                    return step$480(Id$300.create(head$481), rest$482);
                }    // punctuator
                else if (head$481.token.type === parser$170.Token.Punctuator) {
                    return step$480(Punc$298.create(head$481), rest$482);
                } else if (head$481.token.type === parser$170.Token.Keyword && head$481.token.value === 'with') {
                    throwError$260('with is not supported in sweet.js');
                }    // keyword
                else if (head$481.token.type === parser$170.Token.Keyword) {
                    return step$480(Keyword$297.create(head$481), rest$482);
                }    // Delimiter
                else if (head$481.token.type === parser$170.Token.Delimiter) {
                    return step$480(Delimiter$299.create(head$481.expose()), rest$482);
                }    // end of file
                else if (head$481.token.type === parser$170.Token.EOF) {
                    parser$170.assert(rest$482.length === 0, 'nothing should be after an EOF');
                    return step$480(EOF$283.create(head$481), []);
                } else {
                    // todo: are we missing cases?
                    parser$170.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$481,
                rest: rest$482
            };
        }
        return step$480(toks$478[0], toks$478.slice(1));
    }
    function get_expression$324(stx$554, context$555) {
        var res$556 = enforest$323(stx$554, context$555);
        if (!res$556.result.hasPrototype(Expr$285)) {
            return {
                result: null,
                rest: stx$554
            };
        }
        return res$556;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$325(newMark$557, env$558) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$559(match$560) {
            if (match$560.level === 0) {
                // replace the match property with the marked syntax
                match$560.match = _$169.map(match$560.match, function (stx$561) {
                    return stx$561.mark(newMark$557);
                });
            } else {
                _$169.each(match$560.match, function (match$562) {
                    dfs$559(match$562);
                });
            }
        }
        _$169.keys(env$558).forEach(function (key$563) {
            dfs$559(env$558[key$563]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$326(mac$564, context$565) {
        var body$566 = mac$564.body;
        // raw function primitive form
        if (!(body$566[0] && body$566[0].token.type === parser$170.Token.Keyword && body$566[0].token.value === 'function')) {
            throwError$260('Primitive macro form must contain a function for the macro body');
        }
        var stub$567 = parser$170.read('()');
        stub$567[0].token.inner = body$566;
        var expanded$568 = expand$331(stub$567, context$565);
        expanded$568 = expanded$568[0].destruct().concat(expanded$568[1].eof);
        var flattend$569 = flatten$334(expanded$568);
        var bodyCode$570 = codegen$176.generate(parser$170.parse(flattend$569));
        var macroFn$571 = scopedEval$261(bodyCode$570, {
                makeValue: syn$171.makeValue,
                makeRegex: syn$171.makeRegex,
                makeIdent: syn$171.makeIdent,
                makeKeyword: syn$171.makeKeyword,
                makePunc: syn$171.makePunc,
                makeDelim: syn$171.makeDelim,
                unwrapSyntax: syn$171.unwrapSyntax,
                throwSyntaxError: syn$171.throwSyntaxError,
                parser: parser$170,
                _: _$169,
                patternModule: patternModule$174,
                getTemplate: function (id$572) {
                    return cloneSyntaxArray$327(context$565.templateMap.get(id$572));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$325,
                mergeMatches: function (newMatch$573, oldMatch$574) {
                    newMatch$573.patternEnv = _$169.extend({}, oldMatch$574.patternEnv, newMatch$573.patternEnv);
                    return newMatch$573;
                }
            });
        return macroFn$571;
    }
    function cloneSyntaxArray$327(arr$575) {
        return arr$575.map(function (stx$576) {
            var o$577 = syntaxFromToken$269(_$169.clone(stx$576.token), stx$576);
            if (o$577.token.type === parser$170.Token.Delimiter) {
                o$577.token.inner = cloneSyntaxArray$327(o$577.token.inner);
            }
            return o$577;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$328(stx$578, context$579) {
        parser$170.assert(context$579, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$578.length === 0) {
            return {
                terms: [],
                context: context$579
            };
        }
        parser$170.assert(stx$578[0].token, 'expecting a syntax object');
        var f$580 = enforest$323(stx$578, context$579);
        // head :: TermTree
        var head$581 = f$580.result;
        // rest :: [Syntax]
        var rest$582 = f$580.rest;
        if (head$581.hasPrototype(Macro$305)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$584 = loadMacroDef$326(head$581, context$579);
            addToDefinitionCtx$329([head$581.name], context$579.defscope, false);
            context$579.env.set(resolve$273(head$581.name), { fn: macroDefinition$584 });
            return expandToTermTree$328(rest$582, context$579);
        }
        if (head$581.hasPrototype(LetMacro$304)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$584 = loadMacroDef$326(head$581, context$579);
            var freshName$585 = fresh$279();
            var renamedName$586 = head$581.name.rename(head$581.name, freshName$585);
            rest$582 = _$169.map(rest$582, function (stx$587) {
                return stx$587.rename(head$581.name, freshName$585);
            });
            head$581.name = renamedName$586;
            context$579.env.set(resolve$273(head$581.name), { fn: macroDefinition$584 });
            return expandToTermTree$328(rest$582, context$579);
        }
        if (head$581.hasPrototype(LetStatement$313) || head$581.hasPrototype(ConstStatement$314)) {
            head$581.decls.forEach(function (decl$588) {
                var freshName$589 = fresh$279();
                var renamedDecl$590 = decl$588.ident.rename(decl$588.ident, freshName$589);
                rest$582 = rest$582.map(function (stx$591) {
                    return stx$591.rename(decl$588.ident, freshName$589);
                });
                decl$588.ident = renamedDecl$590;
            });
        }
        if (head$581.hasPrototype(NamedFun$301)) {
            addToDefinitionCtx$329([head$581.name], context$579.defscope, true);
        }
        if (head$581.hasPrototype(Id$300) && head$581.id.token.value === '#quoteSyntax' && rest$582[0] && rest$582[0].token.value === '{}') {
            var tempId$592 = fresh$279();
            context$579.templateMap.set(tempId$592, rest$582[0].token.inner);
            return expandToTermTree$328([
                syn$171.makeIdent('getTemplate', head$581.id),
                syn$171.makeDelim('()', [syn$171.makeValue(tempId$592, head$581.id)], head$581.id)
            ].concat(rest$582.slice(1)), context$579);
        }
        if (head$581.hasPrototype(VariableStatement$312)) {
            addToDefinitionCtx$329(_$169.map(head$581.decls, function (decl$593) {
                return decl$593.ident;
            }), context$579.defscope, true);
        }
        if (head$581.hasPrototype(Block$290) && head$581.body.hasPrototype(Delimiter$299)) {
            head$581.body.delim.token.inner.forEach(function (term$594) {
                if (term$594.hasPrototype(VariableStatement$312)) {
                    addToDefinitionCtx$329(_$169.map(term$594.decls, function (decl$595) {
                        return decl$595.ident;
                    }), context$579.defscope, true);
                }
            });
        }
        if (head$581.hasPrototype(Delimiter$299)) {
            head$581.delim.token.inner.forEach(function (term$596) {
                if (term$596.hasPrototype(VariableStatement$312)) {
                    addToDefinitionCtx$329(_$169.map(term$596.decls, function (decl$597) {
                        return decl$597.ident;
                    }), context$579.defscope, true);
                }
            });
        }
        var trees$583 = expandToTermTree$328(rest$582, context$579);
        return {
            terms: [head$581].concat(trees$583.terms),
            context: trees$583.context
        };
    }
    function addToDefinitionCtx$329(idents$598, defscope$599, skipRep$600) {
        parser$170.assert(idents$598 && idents$598.length > 0, 'expecting some variable identifiers');
        skipRep$600 = skipRep$600 || false;
        _$169.each(idents$598, function (id$601) {
            var skip$602 = false;
            if (skipRep$600) {
                var declRepeat$603 = _$169.find(defscope$599, function (def$604) {
                        return def$604.id.token.value === id$601.token.value && arraysEqual$274(marksof$272(def$604.id.context), marksof$272(id$601.context));
                    });
                skip$602 = typeof declRepeat$603 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$602) {
                var name$605 = fresh$279();
                defscope$599.push({
                    id: id$601,
                    name: name$605
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$330(term$606, context$607) {
        parser$170.assert(context$607 && context$607.env, 'environment map is required');
        if (term$606.hasPrototype(ArrayLiteral$291)) {
            term$606.array.delim.token.inner = expand$331(term$606.array.delim.expose().token.inner, context$607);
            return term$606;
        } else if (term$606.hasPrototype(Block$290)) {
            term$606.body.delim.token.inner = expand$331(term$606.body.delim.expose().token.inner, context$607);
            return term$606;
        } else if (term$606.hasPrototype(ParenExpression$292)) {
            term$606.expr.delim.token.inner = expand$331(term$606.expr.delim.expose().token.inner, context$607);
            return term$606;
        } else if (term$606.hasPrototype(Call$308)) {
            term$606.fun = expandTermTreeToFinal$330(term$606.fun, context$607);
            term$606.args = _$169.map(term$606.args, function (arg$608) {
                return expandTermTreeToFinal$330(arg$608, context$607);
            });
            return term$606;
        } else if (term$606.hasPrototype(UnaryOp$293)) {
            term$606.expr = expandTermTreeToFinal$330(term$606.expr, context$607);
            return term$606;
        } else if (term$606.hasPrototype(BinOp$295)) {
            term$606.left = expandTermTreeToFinal$330(term$606.left, context$607);
            term$606.right = expandTermTreeToFinal$330(term$606.right, context$607);
            return term$606;
        } else if (term$606.hasPrototype(ObjGet$310)) {
            term$606.right.delim.token.inner = expand$331(term$606.right.delim.expose().token.inner, context$607);
            return term$606;
        } else if (term$606.hasPrototype(ObjDotGet$309)) {
            term$606.left = expandTermTreeToFinal$330(term$606.left, context$607);
            term$606.right = expandTermTreeToFinal$330(term$606.right, context$607);
            return term$606;
        } else if (term$606.hasPrototype(VariableDeclaration$311)) {
            if (term$606.init) {
                term$606.init = expandTermTreeToFinal$330(term$606.init, context$607);
            }
            return term$606;
        } else if (term$606.hasPrototype(VariableStatement$312)) {
            term$606.decls = _$169.map(term$606.decls, function (decl$609) {
                return expandTermTreeToFinal$330(decl$609, context$607);
            });
            return term$606;
        } else if (term$606.hasPrototype(Delimiter$299)) {
            // expand inside the delimiter and then continue on
            term$606.delim.token.inner = expand$331(term$606.delim.expose().token.inner, context$607);
            return term$606;
        } else if (term$606.hasPrototype(NamedFun$301) || term$606.hasPrototype(AnonFun$302) || term$606.hasPrototype(CatchClause$315) || term$606.hasPrototype(ArrowFun$303) || term$606.hasPrototype(Module$316)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$610 = [];
            var bodyContext$611 = makeExpanderContext$332(_$169.defaults({ defscope: newDef$610 }, context$607));
            var paramSingleIdent$612 = term$606.params && term$606.params.token.type === parser$170.Token.Identifier;
            if (term$606.params && term$606.params.token.type === parser$170.Token.Delimiter) {
                var params$619 = term$606.params.expose();
            } else if (paramSingleIdent$612) {
                var params$619 = term$606.params;
            } else {
                var params$619 = syn$171.makeDelim('()', [], null);
            }
            if (Array.isArray(term$606.body)) {
                var bodies$620 = syn$171.makeDelim('{}', term$606.body, null);
            } else {
                var bodies$620 = term$606.body;
            }
            bodies$620 = bodies$620.addDefCtx(newDef$610);
            var paramNames$613 = _$169.map(getParamIdentifiers$281(params$619), function (param$621) {
                    var freshName$622 = fresh$279();
                    return {
                        freshName: freshName$622,
                        originalParam: param$621,
                        renamedParam: param$621.rename(param$621, freshName$622)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$614 = _$169.reduce(paramNames$613, function (accBody$623, p$624) {
                    return accBody$623.rename(p$624.originalParam, p$624.freshName);
                }, bodies$620);
            renamedBody$614 = renamedBody$614.expose();
            var expandedResult$615 = expandToTermTree$328(renamedBody$614.token.inner, bodyContext$611);
            var bodyTerms$616 = expandedResult$615.terms;
            var renamedParams$617 = _$169.map(paramNames$613, function (p$625) {
                    return p$625.renamedParam;
                });
            if (paramSingleIdent$612) {
                var flatArgs$626 = renamedParams$617[0];
            } else {
                var flatArgs$626 = syn$171.makeDelim('()', joinSyntax$270(renamedParams$617, ','), term$606.params);
            }
            var expandedArgs$618 = expand$331([flatArgs$626], bodyContext$611);
            parser$170.assert(expandedArgs$618.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$606.params) {
                term$606.params = expandedArgs$618[0];
            }
            bodyTerms$616 = _$169.map(bodyTerms$616, function (bodyTerm$627) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$628 = bodyTerm$627.addDefCtx(newDef$610);
                // finish expansion
                return expandTermTreeToFinal$330(termWithCtx$628, expandedResult$615.context);
            });
            if (term$606.hasPrototype(Module$316)) {
                bodyTerms$616 = _$169.filter(bodyTerms$616, function (bodyTerm$629) {
                    if (bodyTerm$629.hasPrototype(Export$318)) {
                        term$606.exports.push(bodyTerm$629);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$614.token.inner = bodyTerms$616;
            if (Array.isArray(term$606.body)) {
                term$606.body = renamedBody$614.token.inner;
            } else {
                term$606.body = renamedBody$614;
            }
            // and continue expand the rest
            return term$606;
        }
        // the term is fine as is
        return term$606;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$331(stx$630, context$631) {
        parser$170.assert(context$631, 'must provide an expander context');
        var trees$632 = expandToTermTree$328(stx$630, context$631);
        return _$169.map(trees$632.terms, function (term$633) {
            return expandTermTreeToFinal$330(term$633, trees$632.context);
        });
    }
    function makeExpanderContext$332(o$634) {
        o$634 = o$634 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$634.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$634.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$634.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$634.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$333(stx$635, builtinSource$636) {
        var env$637 = new Map();
        var params$638 = [];
        var context$639, builtInContext$640 = makeExpanderContext$332({ env: env$637 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$636) {
            var builtinRead$643 = parser$170.read(builtinSource$636);
            builtinRead$643 = [
                syn$171.makeIdent('module', null),
                syn$171.makeDelim('{}', builtinRead$643, null)
            ];
            var builtinRes$644 = expand$331(builtinRead$643, builtInContext$640);
            params$638 = _$169.map(builtinRes$644[0].exports, function (term$645) {
                return {
                    oldExport: term$645.name,
                    newParam: syn$171.makeIdent(term$645.name.token.value, null)
                };
            });
        }
        var modBody$641 = syn$171.makeDelim('{}', stx$635, null);
        modBody$641 = _$169.reduce(params$638, function (acc$646, param$647) {
            var newName$648 = fresh$279();
            env$637.set(resolve$273(param$647.newParam.rename(param$647.newParam, newName$648)), env$637.get(resolve$273(param$647.oldExport)));
            return acc$646.rename(param$647.newParam, newName$648);
        }, modBody$641);
        context$639 = makeExpanderContext$332({ env: env$637 });
        var res$642 = expand$331([
                syn$171.makeIdent('module', null),
                modBody$641
            ], context$639);
        res$642 = res$642[0].destruct();
        return flatten$334(res$642[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$334(stx$649) {
        return _$169.reduce(stx$649, function (acc$650, stx$651) {
            if (stx$651.token.type === parser$170.Token.Delimiter) {
                var exposed$652 = stx$651.expose();
                var openParen$653 = syntaxFromToken$269({
                        type: parser$170.Token.Punctuator,
                        value: stx$651.token.value[0],
                        range: stx$651.token.startRange,
                        sm_range: typeof stx$651.token.sm_startRange == 'undefined' ? stx$651.token.startRange : stx$651.token.sm_startRange,
                        lineNumber: stx$651.token.startLineNumber,
                        sm_lineNumber: typeof stx$651.token.sm_startLineNumber == 'undefined' ? stx$651.token.startLineNumber : stx$651.token.sm_startLineNumber,
                        lineStart: stx$651.token.startLineStart,
                        sm_lineStart: typeof stx$651.token.sm_startLineStart == 'undefined' ? stx$651.token.startLineStart : stx$651.token.sm_startLineStart
                    }, exposed$652);
                var closeParen$654 = syntaxFromToken$269({
                        type: parser$170.Token.Punctuator,
                        value: stx$651.token.value[1],
                        range: stx$651.token.endRange,
                        sm_range: typeof stx$651.token.sm_endRange == 'undefined' ? stx$651.token.endRange : stx$651.token.sm_endRange,
                        lineNumber: stx$651.token.endLineNumber,
                        sm_lineNumber: typeof stx$651.token.sm_endLineNumber == 'undefined' ? stx$651.token.endLineNumber : stx$651.token.sm_endLineNumber,
                        lineStart: stx$651.token.endLineStart,
                        sm_lineStart: typeof stx$651.token.sm_endLineStart == 'undefined' ? stx$651.token.endLineStart : stx$651.token.sm_endLineStart
                    }, exposed$652);
                if (stx$651.token.leadingComments) {
                    openParen$653.token.leadingComments = stx$651.token.leadingComments;
                }
                if (stx$651.token.trailingComments) {
                    openParen$653.token.trailingComments = stx$651.token.trailingComments;
                }
                return acc$650.concat(openParen$653).concat(flatten$334(exposed$652.token.inner)).concat(closeParen$654);
            }
            stx$651.token.sm_lineNumber = stx$651.token.sm_lineNumber ? stx$651.token.sm_lineNumber : stx$651.token.lineNumber;
            stx$651.token.sm_lineStart = stx$651.token.sm_lineStart ? stx$651.token.sm_lineStart : stx$651.token.lineStart;
            stx$651.token.sm_range = stx$651.token.sm_range ? stx$651.token.sm_range : stx$651.token.range;
            return acc$650.concat(stx$651);
        }, []);
    }
    exports$168.enforest = enforest$323;
    exports$168.expand = expandTopLevel$333;
    exports$168.resolve = resolve$273;
    exports$168.get_expression = get_expression$324;
    exports$168.makeExpanderContext = makeExpanderContext$332;
    exports$168.Expr = Expr$285;
    exports$168.VariableStatement = VariableStatement$312;
    exports$168.tokensToSyntax = syn$171.tokensToSyntax;
    exports$168.syntaxToTokens = syn$171.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map