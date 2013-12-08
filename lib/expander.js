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
(function (root$168, factory$169) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$169(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$169);
    }
}(this, function (exports$170, _$171, parser$172, syn$173, es6$174, se$175, patternModule$176, gen$177) {
    'use strict';
    var codegen$178 = gen$177 || escodegen;
    // used to export "private" methods for unit testing
    exports$170._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$337 = Object.create(this);
                if (typeof o$337.construct === 'function') {
                    o$337.construct.apply(o$337, arguments);
                }
                return o$337;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$338) {
                var result$339 = Object.create(this);
                for (var prop$340 in properties$338) {
                    if (properties$338.hasOwnProperty(prop$340)) {
                        result$339[prop$340] = properties$338[prop$340];
                    }
                }
                return result$339;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$341) {
                function F$342() {
                }
                F$342.prototype = proto$341;
                return this instanceof F$342;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$262(msg$343) {
        throw new Error(msg$343);
    }
    var scopedEval$263 = se$175.scopedEval;
    var Rename$264 = syn$173.Rename;
    var Mark$265 = syn$173.Mark;
    var Var$266 = syn$173.Var;
    var Def$267 = syn$173.Def;
    var isDef$268 = syn$173.isDef;
    var isMark$269 = syn$173.isMark;
    var isRename$270 = syn$173.isRename;
    var syntaxFromToken$271 = syn$173.syntaxFromToken;
    var joinSyntax$272 = syn$173.joinSyntax;
    function remdup$273(mark$344, mlist$345) {
        if (mark$344 === _$171.first(mlist$345)) {
            return _$171.rest(mlist$345, 1);
        }
        return [mark$344].concat(mlist$345);
    }
    // (CSyntax) -> [...Num]
    function marksof$274(ctx$346, stopName$347, originalName$348) {
        var mark$349, submarks$350;
        if (isMark$269(ctx$346)) {
            mark$349 = ctx$346.mark;
            submarks$350 = marksof$274(ctx$346.context, stopName$347, originalName$348);
            return remdup$273(mark$349, submarks$350);
        }
        if (isDef$268(ctx$346)) {
            return marksof$274(ctx$346.context, stopName$347, originalName$348);
        }
        if (isRename$270(ctx$346)) {
            if (stopName$347 === originalName$348 + '$' + ctx$346.name) {
                return [];
            }
            return marksof$274(ctx$346.context, stopName$347, originalName$348);
        }
        return [];
    }
    function resolve$275(stx$351) {
        return resolveCtx$279(stx$351.token.value, stx$351.context, [], []);
    }
    function arraysEqual$276(a$352, b$353) {
        if (a$352.length !== b$353.length) {
            return false;
        }
        for (var i$354 = 0; i$354 < a$352.length; i$354++) {
            if (a$352[i$354] !== b$353[i$354]) {
                return false;
            }
        }
        return true;
    }
    function renames$277(defctx$355, oldctx$356, originalName$357) {
        var acc$358 = oldctx$356;
        for (var i$359 = 0; i$359 < defctx$355.length; i$359++) {
            if (defctx$355[i$359].id.token.value === originalName$357) {
                acc$358 = Rename$264(defctx$355[i$359].id, defctx$355[i$359].name, acc$358, defctx$355);
            }
        }
        return acc$358;
    }
    function unionEl$278(arr$360, el$361) {
        if (arr$360.indexOf(el$361) === -1) {
            var res$362 = arr$360.slice(0);
            res$362.push(el$361);
            return res$362;
        }
        return arr$360;
    }
    // (Syntax) -> String
    function resolveCtx$279(originalName$363, ctx$364, stop_spine$365, stop_branch$366) {
        if (isMark$269(ctx$364)) {
            return resolveCtx$279(originalName$363, ctx$364.context, stop_spine$365, stop_branch$366);
        }
        if (isDef$268(ctx$364)) {
            if (stop_spine$365.indexOf(ctx$364.defctx) !== -1) {
                return resolveCtx$279(originalName$363, ctx$364.context, stop_spine$365, stop_branch$366);
            } else {
                return resolveCtx$279(originalName$363, renames$277(ctx$364.defctx, ctx$364.context, originalName$363), stop_spine$365, unionEl$278(stop_branch$366, ctx$364.defctx));
            }
        }
        if (isRename$270(ctx$364)) {
            if (originalName$363 === ctx$364.id.token.value) {
                var idName$367 = resolveCtx$279(ctx$364.id.token.value, ctx$364.id.context, stop_branch$366, stop_branch$366);
                var subName$368 = resolveCtx$279(originalName$363, ctx$364.context, unionEl$278(stop_spine$365, ctx$364.def), stop_branch$366);
                if (idName$367 === subName$368) {
                    var idMarks$369 = marksof$274(ctx$364.id.context, originalName$363 + '$' + ctx$364.name, originalName$363);
                    var subMarks$370 = marksof$274(ctx$364.context, originalName$363 + '$' + ctx$364.name, originalName$363);
                    if (arraysEqual$276(idMarks$369, subMarks$370)) {
                        return originalName$363 + '$' + ctx$364.name;
                    }
                }
            }
            return resolveCtx$279(originalName$363, ctx$364.context, stop_spine$365, stop_branch$366);
        }
        return originalName$363;
    }
    var nextFresh$280 = 0;
    // fun () -> Num
    function fresh$281() {
        return nextFresh$280++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$282(towrap$371, delimSyntax$372) {
        parser$172.assert(delimSyntax$372.token.type === parser$172.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$271({
            type: parser$172.Token.Delimiter,
            value: delimSyntax$372.token.value,
            inner: towrap$371,
            range: delimSyntax$372.token.range,
            startLineNumber: delimSyntax$372.token.startLineNumber,
            lineStart: delimSyntax$372.token.lineStart
        }, delimSyntax$372);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$283(argSyntax$373) {
        if (argSyntax$373.token.type === parser$172.Token.Delimiter) {
            return _$171.filter(argSyntax$373.token.inner, function (stx$374) {
                return stx$374.token.value !== ',';
            });
        } else if (argSyntax$373.token.type === parser$172.Token.Identifier) {
            return [argSyntax$373];
        } else {
            parser$172.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$284 = {
            destruct: function () {
                return _$171.reduce(this.properties, _$171.bind(function (acc$375, prop$376) {
                    if (this[prop$376] && this[prop$376].hasPrototype(TermTree$284)) {
                        return acc$375.concat(this[prop$376].destruct());
                    } else if (this[prop$376] && this[prop$376].token && this[prop$376].token.inner) {
                        this[prop$376].token.inner = _$171.reduce(this[prop$376].token.inner, function (acc$377, t$378) {
                            if (t$378.hasPrototype(TermTree$284)) {
                                return acc$377.concat(t$378.destruct());
                            }
                            return acc$377.concat(t$378);
                        }, []);
                        return acc$375.concat(this[prop$376]);
                    } else if (Array.isArray(this[prop$376])) {
                        return acc$375.concat(_$171.reduce(this[prop$376], function (acc$379, t$380) {
                            if (t$380.hasPrototype(TermTree$284)) {
                                return acc$379.concat(t$380.destruct());
                            }
                            return acc$379.concat(t$380);
                        }, []));
                    } else if (this[prop$376]) {
                        return acc$375.concat(this[prop$376]);
                    } else {
                        return acc$375;
                    }
                }, this), []);
            },
            addDefCtx: function (def$381) {
                for (var i$382 = 0; i$382 < this.properties.length; i$382++) {
                    var prop$383 = this.properties[i$382];
                    if (Array.isArray(this[prop$383])) {
                        this[prop$383] = _$171.map(this[prop$383], function (item$384) {
                            return item$384.addDefCtx(def$381);
                        });
                    } else if (this[prop$383]) {
                        this[prop$383] = this[prop$383].addDefCtx(def$381);
                    }
                }
                return this;
            }
        };
    var EOF$285 = TermTree$284.extend({
            properties: ['eof'],
            construct: function (e$385) {
                this.eof = e$385;
            }
        });
    var Statement$286 = TermTree$284.extend({
            construct: function () {
            }
        });
    var Expr$287 = TermTree$284.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$288 = Expr$287.extend({
            construct: function () {
            }
        });
    var ThisExpression$289 = PrimaryExpression$288.extend({
            properties: ['this'],
            construct: function (that$386) {
                this.this = that$386;
            }
        });
    var Lit$290 = PrimaryExpression$288.extend({
            properties: ['lit'],
            construct: function (l$387) {
                this.lit = l$387;
            }
        });
    exports$170._test.PropertyAssignment = PropertyAssignment$291;
    var PropertyAssignment$291 = TermTree$284.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$388, assignment$389) {
                this.propName = propName$388;
                this.assignment = assignment$389;
            }
        });
    var Block$292 = PrimaryExpression$288.extend({
            properties: ['body'],
            construct: function (body$390) {
                this.body = body$390;
            }
        });
    var ArrayLiteral$293 = PrimaryExpression$288.extend({
            properties: ['array'],
            construct: function (ar$391) {
                this.array = ar$391;
            }
        });
    var ParenExpression$294 = PrimaryExpression$288.extend({
            properties: ['expr'],
            construct: function (expr$392) {
                this.expr = expr$392;
            }
        });
    var UnaryOp$295 = Expr$287.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$393, expr$394) {
                this.op = op$393;
                this.expr = expr$394;
            }
        });
    var PostfixOp$296 = Expr$287.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$395, op$396) {
                this.expr = expr$395;
                this.op = op$396;
            }
        });
    var BinOp$297 = Expr$287.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$397, left$398, right$399) {
                this.op = op$397;
                this.left = left$398;
                this.right = right$399;
            }
        });
    var ConditionalExpression$298 = Expr$287.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$400, question$401, tru$402, colon$403, fls$404) {
                this.cond = cond$400;
                this.question = question$401;
                this.tru = tru$402;
                this.colon = colon$403;
                this.fls = fls$404;
            }
        });
    var Keyword$299 = TermTree$284.extend({
            properties: ['keyword'],
            construct: function (k$405) {
                this.keyword = k$405;
            }
        });
    var Punc$300 = TermTree$284.extend({
            properties: ['punc'],
            construct: function (p$406) {
                this.punc = p$406;
            }
        });
    var Delimiter$301 = TermTree$284.extend({
            properties: ['delim'],
            construct: function (d$407) {
                this.delim = d$407;
            }
        });
    var Id$302 = PrimaryExpression$288.extend({
            properties: ['id'],
            construct: function (id$408) {
                this.id = id$408;
            }
        });
    var NamedFun$303 = Expr$287.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$409, star$410, name$411, params$412, body$413) {
                this.keyword = keyword$409;
                this.star = star$410;
                this.name = name$411;
                this.params = params$412;
                this.body = body$413;
            }
        });
    var AnonFun$304 = Expr$287.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$414, star$415, params$416, body$417) {
                this.keyword = keyword$414;
                this.star = star$415;
                this.params = params$416;
                this.body = body$417;
            }
        });
    var ArrowFun$305 = Expr$287.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$418, arrow$419, body$420) {
                this.params = params$418;
                this.arrow = arrow$419;
                this.body = body$420;
            }
        });
    var LetMacro$306 = TermTree$284.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$421, body$422) {
                this.name = name$421;
                this.body = body$422;
            }
        });
    var Macro$307 = TermTree$284.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$423, body$424) {
                this.name = name$423;
                this.body = body$424;
            }
        });
    var AnonMacro$308 = TermTree$284.extend({
            properties: ['body'],
            construct: function (body$425) {
                this.body = body$425;
            }
        });
    var Const$309 = Expr$287.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$426, call$427) {
                this.newterm = newterm$426;
                this.call = call$427;
            }
        });
    var Call$310 = Expr$287.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$172.assert(this.fun.hasPrototype(TermTree$284), 'expecting a term tree in destruct of call');
                var that$428 = this;
                this.delim = syntaxFromToken$271(_$171.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$171.reduce(this.args, function (acc$429, term$430) {
                    parser$172.assert(term$430 && term$430.hasPrototype(TermTree$284), 'expecting term trees in destruct of Call');
                    var dst$431 = acc$429.concat(term$430.destruct());
                    // add all commas except for the last one
                    if (that$428.commas.length > 0) {
                        dst$431 = dst$431.concat(that$428.commas.shift());
                    }
                    return dst$431;
                }, []);
                return this.fun.destruct().concat(Delimiter$301.create(this.delim).destruct());
            },
            construct: function (funn$432, args$433, delim$434, commas$435) {
                parser$172.assert(Array.isArray(args$433), 'requires an array of arguments terms');
                this.fun = funn$432;
                this.args = args$433;
                this.delim = delim$434;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$435;
            }
        });
    var ObjDotGet$311 = Expr$287.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$436, dot$437, right$438) {
                this.left = left$436;
                this.dot = dot$437;
                this.right = right$438;
            }
        });
    var ObjGet$312 = Expr$287.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$439, right$440) {
                this.left = left$439;
                this.right = right$440;
            }
        });
    var VariableDeclaration$313 = TermTree$284.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$441, eqstx$442, init$443, comma$444) {
                this.ident = ident$441;
                this.eqstx = eqstx$442;
                this.init = init$443;
                this.comma = comma$444;
            }
        });
    var VariableStatement$314 = Statement$286.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$171.reduce(this.decls, function (acc$445, decl$446) {
                    return acc$445.concat(decl$446.destruct());
                }, []));
            },
            construct: function (varkw$447, decls$448) {
                parser$172.assert(Array.isArray(decls$448), 'decls must be an array');
                this.varkw = varkw$447;
                this.decls = decls$448;
            }
        });
    var LetStatement$315 = Statement$286.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$171.reduce(this.decls, function (acc$449, decl$450) {
                    return acc$449.concat(decl$450.destruct());
                }, []));
            },
            construct: function (letkw$451, decls$452) {
                parser$172.assert(Array.isArray(decls$452), 'decls must be an array');
                this.letkw = letkw$451;
                this.decls = decls$452;
            }
        });
    var ConstStatement$316 = Statement$286.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$171.reduce(this.decls, function (acc$453, decl$454) {
                    return acc$453.concat(decl$454.destruct());
                }, []));
            },
            construct: function (constkw$455, decls$456) {
                parser$172.assert(Array.isArray(decls$456), 'decls must be an array');
                this.constkw = constkw$455;
                this.decls = decls$456;
            }
        });
    var CatchClause$317 = TermTree$284.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$457, params$458, body$459) {
                this.catchkw = catchkw$457;
                this.params = params$458;
                this.body = body$459;
            }
        });
    var Module$318 = TermTree$284.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$460) {
                this.body = body$460;
                this.exports = [];
            }
        });
    var Empty$319 = TermTree$284.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$320 = TermTree$284.extend({
            properties: ['name'],
            construct: function (name$461) {
                this.name = name$461;
            }
        });
    function stxIsUnaryOp$321(stx$462) {
        var staticOperators$463 = [
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
        return _$171.contains(staticOperators$463, stx$462.token.value);
    }
    function stxIsBinOp$322(stx$464) {
        var staticOperators$465 = [
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
        return _$171.contains(staticOperators$465, stx$464.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$323(stx$466, context$467) {
        var decls$468 = [];
        var res$469 = enforest$325(stx$466, context$467);
        var result$470 = res$469.result;
        var rest$471 = res$469.rest;
        if (rest$471[0]) {
            var nextRes$472 = enforest$325(rest$471, context$467);
            // x = ...
            if (nextRes$472.result.hasPrototype(Punc$300) && nextRes$472.result.punc.token.value === '=') {
                var initializerRes$473 = enforest$325(nextRes$472.rest, context$467);
                if (initializerRes$473.rest[0]) {
                    var restRes$474 = enforest$325(initializerRes$473.rest, context$467);
                    // x = y + z, ...
                    if (restRes$474.result.hasPrototype(Punc$300) && restRes$474.result.punc.token.value === ',') {
                        decls$468.push(VariableDeclaration$313.create(result$470.id, nextRes$472.result.punc, initializerRes$473.result, restRes$474.result.punc));
                        var subRes$475 = enforestVarStatement$323(restRes$474.rest, context$467);
                        decls$468 = decls$468.concat(subRes$475.result);
                        rest$471 = subRes$475.rest;
                    }    // x = y ...
                    else {
                        decls$468.push(VariableDeclaration$313.create(result$470.id, nextRes$472.result.punc, initializerRes$473.result));
                        rest$471 = initializerRes$473.rest;
                    }
                }    // x = y EOF
                else {
                    decls$468.push(VariableDeclaration$313.create(result$470.id, nextRes$472.result.punc, initializerRes$473.result));
                }
            }    // x ,...;
            else if (nextRes$472.result.hasPrototype(Punc$300) && nextRes$472.result.punc.token.value === ',') {
                decls$468.push(VariableDeclaration$313.create(result$470.id, null, null, nextRes$472.result.punc));
                var subRes$475 = enforestVarStatement$323(nextRes$472.rest, context$467);
                decls$468 = decls$468.concat(subRes$475.result);
                rest$471 = subRes$475.rest;
            } else {
                if (result$470.hasPrototype(Id$302)) {
                    decls$468.push(VariableDeclaration$313.create(result$470.id));
                } else {
                    throwError$262('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$470.hasPrototype(Id$302)) {
                decls$468.push(VariableDeclaration$313.create(result$470.id));
            } else if (result$470.hasPrototype(BinOp$297) && result$470.op.token.value === 'in') {
                decls$468.push(VariableDeclaration$313.create(result$470.left.id, result$470.op, result$470.right));
            } else {
                throwError$262('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$468,
            rest: rest$471
        };
    }
    function adjustLineContext$324(stx$476, original$477, current$478) {
        current$478 = current$478 || {
            lastLineNumber: original$477.token.lineNumber,
            lineNumber: original$477.token.lineNumber - 1
        };
        return _$171.map(stx$476, function (stx$479) {
            if (stx$479.token.type === parser$172.Token.Delimiter) {
                // handle tokens with missing line info
                stx$479.token.startLineNumber = typeof stx$479.token.startLineNumber == 'undefined' ? original$477.token.lineNumber : stx$479.token.startLineNumber;
                stx$479.token.endLineNumber = typeof stx$479.token.endLineNumber == 'undefined' ? original$477.token.lineNumber : stx$479.token.endLineNumber;
                stx$479.token.startLineStart = typeof stx$479.token.startLineStart == 'undefined' ? original$477.token.lineStart : stx$479.token.startLineStart;
                stx$479.token.endLineStart = typeof stx$479.token.endLineStart == 'undefined' ? original$477.token.lineStart : stx$479.token.endLineStart;
                stx$479.token.startRange = typeof stx$479.token.startRange == 'undefined' ? original$477.token.range : stx$479.token.startRange;
                stx$479.token.endRange = typeof stx$479.token.endRange == 'undefined' ? original$477.token.range : stx$479.token.endRange;
                stx$479.token.sm_startLineNumber = typeof stx$479.token.sm_startLineNumber == 'undefined' ? stx$479.token.startLineNumber : stx$479.token.sm_startLineNumber;
                stx$479.token.sm_endLineNumber = typeof stx$479.token.sm_endLineNumber == 'undefined' ? stx$479.token.endLineNumber : stx$479.token.sm_endLineNumber;
                stx$479.token.sm_startLineStart = typeof stx$479.token.sm_startLineStart == 'undefined' ? stx$479.token.startLineStart : stx$479.token.sm_startLineStart;
                stx$479.token.sm_endLineStart = typeof stx$479.token.sm_endLineStart == 'undefined' ? stx$479.token.endLineStart : stx$479.token.sm_endLineStart;
                stx$479.token.sm_startRange = typeof stx$479.token.sm_startRange == 'undefined' ? stx$479.token.startRange : stx$479.token.sm_startRange;
                stx$479.token.sm_endRange = typeof stx$479.token.sm_endRange == 'undefined' ? stx$479.token.endRange : stx$479.token.sm_endRange;
                if (stx$479.token.startLineNumber === current$478.lastLineNumber && current$478.lastLineNumber !== current$478.lineNumber) {
                    stx$479.token.startLineNumber = current$478.lineNumber;
                } else if (stx$479.token.startLineNumber !== current$478.lastLineNumber) {
                    current$478.lineNumber++;
                    current$478.lastLineNumber = stx$479.token.startLineNumber;
                    stx$479.token.startLineNumber = current$478.lineNumber;
                }
                if (stx$479.token.inner.length > 0) {
                    stx$479.token.inner = adjustLineContext$324(stx$479.token.inner, original$477, current$478);
                }
                return stx$479;
            }
            // handle tokens with missing line info
            stx$479.token.lineNumber = typeof stx$479.token.lineNumber == 'undefined' ? original$477.token.lineNumber : stx$479.token.lineNumber;
            stx$479.token.lineStart = typeof stx$479.token.lineStart == 'undefined' ? original$477.token.lineStart : stx$479.token.lineStart;
            stx$479.token.range = typeof stx$479.token.range == 'undefined' ? original$477.token.range : stx$479.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$479.token.sm_lineNumber = typeof stx$479.token.sm_lineNumber == 'undefined' ? stx$479.token.lineNumber : stx$479.token.sm_lineNumber;
            stx$479.token.sm_lineStart = typeof stx$479.token.sm_lineStart == 'undefined' ? stx$479.token.lineStart : stx$479.token.sm_lineStart;
            stx$479.token.sm_range = typeof stx$479.token.sm_range == 'undefined' ? _$171.clone(stx$479.token.range) : stx$479.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$479.token.lineNumber === current$478.lastLineNumber && current$478.lastLineNumber !== current$478.lineNumber) {
                stx$479.token.lineNumber = current$478.lineNumber;
            } else if (stx$479.token.lineNumber !== current$478.lastLineNumber) {
                current$478.lineNumber++;
                current$478.lastLineNumber = stx$479.token.lineNumber;
                stx$479.token.lineNumber = current$478.lineNumber;
            }
            return stx$479;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$325(toks$480, context$481) {
        parser$172.assert(toks$480.length > 0, 'enforest assumes there are tokens to work with');
        function step$482(head$483, rest$484) {
            var innerTokens$485;
            parser$172.assert(Array.isArray(rest$484), 'result must at least be an empty array');
            if (head$483.hasPrototype(TermTree$284)) {
                // function call
                var emp$488 = head$483.emp;
                var emp$488 = head$483.emp;
                var keyword$491 = head$483.keyword;
                var delim$493 = head$483.delim;
                var id$495 = head$483.id;
                var delim$493 = head$483.delim;
                var emp$488 = head$483.emp;
                var punc$499 = head$483.punc;
                var keyword$491 = head$483.keyword;
                var emp$488 = head$483.emp;
                var emp$488 = head$483.emp;
                var emp$488 = head$483.emp;
                var delim$493 = head$483.delim;
                var delim$493 = head$483.delim;
                var id$495 = head$483.id;
                var keyword$491 = head$483.keyword;
                var keyword$491 = head$483.keyword;
                var keyword$491 = head$483.keyword;
                var keyword$491 = head$483.keyword;
                if (head$483.hasPrototype(Expr$287) && rest$484[0] && rest$484[0].token.type === parser$172.Token.Delimiter && rest$484[0].token.value === '()') {
                    var argRes$532, enforestedArgs$533 = [], commas$534 = [];
                    rest$484[0].expose();
                    innerTokens$485 = rest$484[0].token.inner;
                    while (innerTokens$485.length > 0) {
                        argRes$532 = enforest$325(innerTokens$485, context$481);
                        enforestedArgs$533.push(argRes$532.result);
                        innerTokens$485 = argRes$532.rest;
                        if (innerTokens$485[0] && innerTokens$485[0].token.value === ',') {
                            // record the comma for later
                            commas$534.push(innerTokens$485[0]);
                            // but dump it for the next loop turn
                            innerTokens$485 = innerTokens$485.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$535 = _$171.all(enforestedArgs$533, function (argTerm$536) {
                            return argTerm$536.hasPrototype(Expr$287);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$485.length === 0 && argsAreExprs$535) {
                        return step$482(Call$310.create(head$483, enforestedArgs$533, rest$484[0], commas$534), rest$484.slice(1));
                    }
                } else if (head$483.hasPrototype(Expr$287) && rest$484[0] && rest$484[0].token.value === '?') {
                    var question$537 = rest$484[0];
                    var condRes$538 = enforest$325(rest$484.slice(1), context$481);
                    var truExpr$539 = condRes$538.result;
                    var right$540 = condRes$538.rest;
                    if (truExpr$539.hasPrototype(Expr$287) && right$540[0] && right$540[0].token.value === ':') {
                        var colon$541 = right$540[0];
                        var flsRes$542 = enforest$325(right$540.slice(1), context$481);
                        var flsExpr$543 = flsRes$542.result;
                        if (flsExpr$543.hasPrototype(Expr$287)) {
                            return step$482(ConditionalExpression$298.create(head$483, question$537, truExpr$539, colon$541, flsExpr$543), flsRes$542.rest);
                        }
                    }
                } else if (head$483.hasPrototype(Keyword$299) && keyword$491.token.value === 'new' && rest$484[0]) {
                    var newCallRes$544 = enforest$325(rest$484, context$481);
                    if (newCallRes$544.result.hasPrototype(Call$310)) {
                        return step$482(Const$309.create(head$483, newCallRes$544.result), newCallRes$544.rest);
                    }
                } else if (head$483.hasPrototype(Delimiter$301) && delim$493.token.value === '()' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator && rest$484[0].token.value === '=>') {
                    var res$545 = enforest$325(rest$484.slice(1), context$481);
                    if (res$545.result.hasPrototype(Expr$287)) {
                        return step$482(ArrowFun$305.create(delim$493, rest$484[0], res$545.result.destruct()), res$545.rest);
                    } else {
                        throwError$262('Body of arrow function must be an expression');
                    }
                } else if (head$483.hasPrototype(Id$302) && rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator && rest$484[0].token.value === '=>') {
                    var res$545 = enforest$325(rest$484.slice(1), context$481);
                    if (res$545.result.hasPrototype(Expr$287)) {
                        return step$482(ArrowFun$305.create(id$495, rest$484[0], res$545.result.destruct()), res$545.rest);
                    } else {
                        throwError$262('Body of arrow function must be an expression');
                    }
                } else if (head$483.hasPrototype(Delimiter$301) && delim$493.token.value === '()') {
                    innerTokens$485 = delim$493.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$485.length === 0) {
                        return step$482(ParenExpression$294.create(head$483), rest$484);
                    } else {
                        var innerTerm$546 = get_expression$326(innerTokens$485, context$481);
                        if (innerTerm$546.result && innerTerm$546.result.hasPrototype(Expr$287)) {
                            return step$482(ParenExpression$294.create(head$483), rest$484);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$483.hasPrototype(Expr$287) && rest$484[0] && rest$484[1] && stxIsBinOp$322(rest$484[0])) {
                    var op$547 = rest$484[0];
                    var left$548 = head$483;
                    var bopRes$549 = enforest$325(rest$484.slice(1), context$481);
                    var right$540 = bopRes$549.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$540.hasPrototype(Expr$287)) {
                        return step$482(BinOp$297.create(op$547, left$548, right$540), bopRes$549.rest);
                    }
                } else if (head$483.hasPrototype(Punc$300) && stxIsUnaryOp$321(punc$499)) {
                    var unopRes$550 = enforest$325(rest$484, context$481);
                    if (unopRes$550.result.hasPrototype(Expr$287)) {
                        return step$482(UnaryOp$295.create(punc$499, unopRes$550.result), unopRes$550.rest);
                    }
                } else if (head$483.hasPrototype(Keyword$299) && stxIsUnaryOp$321(keyword$491)) {
                    var unopRes$550 = enforest$325(rest$484, context$481);
                    if (unopRes$550.result.hasPrototype(Expr$287)) {
                        return step$482(UnaryOp$295.create(keyword$491, unopRes$550.result), unopRes$550.rest);
                    }
                } else if (head$483.hasPrototype(Expr$287) && rest$484[0] && (rest$484[0].token.value === '++' || rest$484[0].token.value === '--')) {
                    return step$482(PostfixOp$296.create(head$483, rest$484[0]), rest$484.slice(1));
                } else if (head$483.hasPrototype(Expr$287) && rest$484[0] && rest$484[0].token.value === '[]') {
                    return step$482(ObjGet$312.create(head$483, Delimiter$301.create(rest$484[0].expose())), rest$484.slice(1));
                } else if (head$483.hasPrototype(Expr$287) && rest$484[0] && rest$484[0].token.value === '.' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Identifier) {
                    return step$482(ObjDotGet$311.create(head$483, rest$484[0], rest$484[1]), rest$484.slice(2));
                } else if (head$483.hasPrototype(Delimiter$301) && delim$493.token.value === '[]') {
                    return step$482(ArrayLiteral$293.create(head$483), rest$484);
                } else if (head$483.hasPrototype(Delimiter$301) && head$483.delim.token.value === '{}') {
                    return step$482(Block$292.create(head$483), rest$484);
                } else if (head$483.hasPrototype(Id$302) && id$495.token.value === '#quoteSyntax' && rest$484[0] && rest$484[0].token.value === '{}') {
                    var tempId$551 = fresh$281();
                    context$481.templateMap.set(tempId$551, rest$484[0].token.inner);
                    return step$482(syn$173.makeIdent('getTemplate', id$495), [syn$173.makeDelim('()', [syn$173.makeValue(tempId$551, id$495)], id$495)].concat(rest$484.slice(1)));
                } else if (head$483.hasPrototype(Keyword$299) && keyword$491.token.value === 'let' && (rest$484[0] && rest$484[0].token.type === parser$172.Token.Identifier || rest$484[0] && rest$484[0].token.type === parser$172.Token.Keyword || rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator) && rest$484[1] && rest$484[1].token.value === '=' && rest$484[2] && rest$484[2].token.value === 'macro') {
                    var mac$552 = enforest$325(rest$484.slice(2), context$481);
                    if (!mac$552.result.hasPrototype(AnonMacro$308)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$552.result);
                    }
                    return step$482(LetMacro$306.create(rest$484[0], mac$552.result.body), mac$552.rest);
                } else if (head$483.hasPrototype(Keyword$299) && keyword$491.token.value === 'var' && rest$484[0]) {
                    var vsRes$553 = enforestVarStatement$323(rest$484, context$481);
                    if (vsRes$553) {
                        return step$482(VariableStatement$314.create(head$483, vsRes$553.result), vsRes$553.rest);
                    }
                } else if (head$483.hasPrototype(Keyword$299) && keyword$491.token.value === 'let' && rest$484[0]) {
                    var vsRes$553 = enforestVarStatement$323(rest$484, context$481);
                    if (vsRes$553) {
                        return step$482(LetStatement$315.create(head$483, vsRes$553.result), vsRes$553.rest);
                    }
                } else if (head$483.hasPrototype(Keyword$299) && keyword$491.token.value === 'const' && rest$484[0]) {
                    var vsRes$553 = enforestVarStatement$323(rest$484, context$481);
                    if (vsRes$553) {
                        return step$482(ConstStatement$316.create(head$483, vsRes$553.result), vsRes$553.rest);
                    }
                }
            } else {
                parser$172.assert(head$483 && head$483.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$483.token.type === parser$172.Token.Identifier || head$483.token.type === parser$172.Token.Keyword || head$483.token.type === parser$172.Token.Punctuator) && context$481.env.has(resolve$275(head$483))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$554 = fresh$281();
                    var transformerContext$555 = makeExpanderContext$334(_$171.defaults({ mark: newMark$554 }, context$481));
                    // pull the macro transformer out the environment
                    var transformer$556 = context$481.env.get(resolve$275(head$483)).fn;
                    // apply the transformer
                    try {
                        var rt$557 = transformer$556([head$483].concat(rest$484), transformerContext$555);
                    } catch (e$558) {
                        var argumentString$559 = '`' + rest$484.slice(0, 5).map(function (stx$560) {
                                return stx$560.token.value;
                            }).join(' ') + '...`';
                        throwError$262('Macro `' + head$483.token.value + '` could not be matched with ' + argumentString$559);
                    }
                    if (!Array.isArray(rt$557.result)) {
                        throwError$262('Macro transformer must return a result array, not: ' + rt$557.result);
                    }
                    if (rt$557.result.length > 0) {
                        var adjustedResult$561 = adjustLineContext$324(rt$557.result, head$483);
                        adjustedResult$561[0].token.leadingComments = head$483.token.leadingComments;
                        return step$482(adjustedResult$561[0], adjustedResult$561.slice(1).concat(rt$557.rest));
                    } else {
                        return step$482(Empty$319.create(), rt$557.rest);
                    }
                }    // anon macro definition
                else if (head$483.token.type === parser$172.Token.Identifier && head$483.token.value === 'macro' && rest$484[0] && rest$484[0].token.value === '{}') {
                    return step$482(AnonMacro$308.create(rest$484[0].expose().token.inner), rest$484.slice(1));
                }    // macro definition
                else if (head$483.token.type === parser$172.Token.Identifier && head$483.token.value === 'macro' && rest$484[0] && (rest$484[0].token.type === parser$172.Token.Identifier || rest$484[0].token.type === parser$172.Token.Keyword || rest$484[0].token.type === parser$172.Token.Punctuator) && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '{}') {
                    return step$482(Macro$307.create(rest$484[0], rest$484[1].expose().token.inner), rest$484.slice(2));
                }    // module definition
                else if (head$483.token.value === 'module' && rest$484[0] && rest$484[0].token.value === '{}') {
                    return step$482(Module$318.create(rest$484[0]), rest$484.slice(1));
                }    // function definition
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'function' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Identifier && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '()' && rest$484[2] && rest$484[2].token.type === parser$172.Token.Delimiter && rest$484[2].token.value === '{}') {
                    rest$484[1].token.inner = rest$484[1].expose().token.inner;
                    rest$484[2].token.inner = rest$484[2].expose().token.inner;
                    return step$482(NamedFun$303.create(head$483, null, rest$484[0], rest$484[1], rest$484[2]), rest$484.slice(3));
                }    // generator function definition
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'function' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator && rest$484[0].token.value === '*' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Identifier && rest$484[2] && rest$484[2].token.type === parser$172.Token.Delimiter && rest$484[2].token.value === '()' && rest$484[3] && rest$484[3].token.type === parser$172.Token.Delimiter && rest$484[3].token.value === '{}') {
                    rest$484[2].token.inner = rest$484[2].expose().token.inner;
                    rest$484[3].token.inner = rest$484[3].expose().token.inner;
                    return step$482(NamedFun$303.create(head$483, rest$484[0], rest$484[1], rest$484[2], rest$484[3]), rest$484.slice(4));
                }    // anonymous function definition
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'function' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Delimiter && rest$484[0].token.value === '()' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '{}') {
                    rest$484[0].token.inner = rest$484[0].expose().token.inner;
                    rest$484[1].token.inner = rest$484[1].expose().token.inner;
                    return step$482(AnonFun$304.create(head$483, null, rest$484[0], rest$484[1]), rest$484.slice(2));
                }    // anonymous generator function definition
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'function' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator && rest$484[0].token.value === '*' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '()' && rest$484[2] && rest$484[2].token.type === parser$172.Token.Delimiter && rest$484[2].token.value === '{}') {
                    rest$484[1].token.inner = rest$484[1].expose().token.inner;
                    rest$484[2].token.inner = rest$484[2].expose().token.inner;
                    return step$482(AnonFun$304.create(head$483, rest$484[0], rest$484[1], rest$484[2]), rest$484.slice(3));
                }    // arrow function
                else if ((head$483.token.type === parser$172.Token.Delimiter && head$483.token.value === '()' || head$483.token.type === parser$172.Token.Identifier) && rest$484[0] && rest$484[0].token.type === parser$172.Token.Punctuator && rest$484[0].token.value === '=>' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '{}') {
                    return step$482(ArrowFun$305.create(head$483, rest$484[0], rest$484[1]), rest$484.slice(2));
                }    // catch statement
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'catch' && rest$484[0] && rest$484[0].token.type === parser$172.Token.Delimiter && rest$484[0].token.value === '()' && rest$484[1] && rest$484[1].token.type === parser$172.Token.Delimiter && rest$484[1].token.value === '{}') {
                    rest$484[0].token.inner = rest$484[0].expose().token.inner;
                    rest$484[1].token.inner = rest$484[1].expose().token.inner;
                    return step$482(CatchClause$317.create(head$483, rest$484[0], rest$484[1]), rest$484.slice(2));
                }    // this expression
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'this') {
                    return step$482(ThisExpression$289.create(head$483), rest$484);
                }    // literal
                else if (head$483.token.type === parser$172.Token.NumericLiteral || head$483.token.type === parser$172.Token.StringLiteral || head$483.token.type === parser$172.Token.BooleanLiteral || head$483.token.type === parser$172.Token.RegularExpression || head$483.token.type === parser$172.Token.NullLiteral) {
                    return step$482(Lit$290.create(head$483), rest$484);
                }    // export
                else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'export' && rest$484[0] && (rest$484[0].token.type === parser$172.Token.Identifier || rest$484[0].token.type === parser$172.Token.Keyword || rest$484[0].token.type === parser$172.Token.Punctuator)) {
                    return step$482(Export$320.create(rest$484[0]), rest$484.slice(1));
                }    // identifier
                else if (head$483.token.type === parser$172.Token.Identifier) {
                    return step$482(Id$302.create(head$483), rest$484);
                }    // punctuator
                else if (head$483.token.type === parser$172.Token.Punctuator) {
                    return step$482(Punc$300.create(head$483), rest$484);
                } else if (head$483.token.type === parser$172.Token.Keyword && head$483.token.value === 'with') {
                    throwError$262('with is not supported in sweet.js');
                }    // keyword
                else if (head$483.token.type === parser$172.Token.Keyword) {
                    return step$482(Keyword$299.create(head$483), rest$484);
                }    // Delimiter
                else if (head$483.token.type === parser$172.Token.Delimiter) {
                    return step$482(Delimiter$301.create(head$483.expose()), rest$484);
                }    // end of file
                else if (head$483.token.type === parser$172.Token.EOF) {
                    parser$172.assert(rest$484.length === 0, 'nothing should be after an EOF');
                    return step$482(EOF$285.create(head$483), []);
                } else {
                    // todo: are we missing cases?
                    parser$172.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$483,
                rest: rest$484
            };
        }
        return step$482(toks$480[0], toks$480.slice(1));
    }
    function get_expression$326(stx$562, context$563) {
        var res$564 = enforest$325(stx$562, context$563);
        if (!res$564.result.hasPrototype(Expr$287)) {
            return {
                result: null,
                rest: stx$562
            };
        }
        return res$564;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$327(newMark$565, env$566) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$567(match$568) {
            if (match$568.level === 0) {
                // replace the match property with the marked syntax
                match$568.match = _$171.map(match$568.match, function (stx$569) {
                    return stx$569.mark(newMark$565);
                });
            } else {
                _$171.each(match$568.match, function (match$570) {
                    dfs$567(match$570);
                });
            }
        }
        _$171.keys(env$566).forEach(function (key$571) {
            dfs$567(env$566[key$571]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$328(mac$572, context$573) {
        var body$574 = mac$572.body;
        // raw function primitive form
        if (!(body$574[0] && body$574[0].token.type === parser$172.Token.Keyword && body$574[0].token.value === 'function')) {
            throwError$262('Primitive macro form must contain a function for the macro body');
        }
        var stub$575 = parser$172.read('()');
        stub$575[0].token.inner = body$574;
        var expanded$576 = expand$333(stub$575, context$573);
        expanded$576 = expanded$576[0].destruct().concat(expanded$576[1].eof);
        var flattend$577 = flatten$336(expanded$576);
        var bodyCode$578 = codegen$178.generate(parser$172.parse(flattend$577));
        var macroFn$579 = scopedEval$263(bodyCode$578, {
                makeValue: syn$173.makeValue,
                makeRegex: syn$173.makeRegex,
                makeIdent: syn$173.makeIdent,
                makeKeyword: syn$173.makeKeyword,
                makePunc: syn$173.makePunc,
                makeDelim: syn$173.makeDelim,
                unwrapSyntax: syn$173.unwrapSyntax,
                throwSyntaxError: syn$173.throwSyntaxError,
                parser: parser$172,
                _: _$171,
                patternModule: patternModule$176,
                getTemplate: function (id$580) {
                    return cloneSyntaxArray$329(context$573.templateMap.get(id$580));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$327,
                mergeMatches: function (newMatch$581, oldMatch$582) {
                    newMatch$581.patternEnv = _$171.extend({}, oldMatch$582.patternEnv, newMatch$581.patternEnv);
                    return newMatch$581;
                }
            });
        return macroFn$579;
    }
    function cloneSyntaxArray$329(arr$583) {
        return arr$583.map(function (stx$584) {
            var o$585 = syntaxFromToken$271(_$171.clone(stx$584.token), stx$584);
            if (o$585.token.type === parser$172.Token.Delimiter) {
                o$585.token.inner = cloneSyntaxArray$329(o$585.token.inner);
            }
            return o$585;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$330(stx$586, context$587) {
        parser$172.assert(context$587, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$586.length === 0) {
            return {
                terms: [],
                context: context$587
            };
        }
        parser$172.assert(stx$586[0].token, 'expecting a syntax object');
        var f$588 = enforest$325(stx$586, context$587);
        // head :: TermTree
        var head$589 = f$588.result;
        // rest :: [Syntax]
        var rest$590 = f$588.rest;
        if (head$589.hasPrototype(Macro$307)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$592 = loadMacroDef$328(head$589, context$587);
            addToDefinitionCtx$331([head$589.name], context$587.defscope, false);
            context$587.env.set(resolve$275(head$589.name), { fn: macroDefinition$592 });
            return expandToTermTree$330(rest$590, context$587);
        }
        if (head$589.hasPrototype(LetMacro$306)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$592 = loadMacroDef$328(head$589, context$587);
            var freshName$593 = fresh$281();
            var renamedName$594 = head$589.name.rename(head$589.name, freshName$593);
            rest$590 = _$171.map(rest$590, function (stx$595) {
                return stx$595.rename(head$589.name, freshName$593);
            });
            head$589.name = renamedName$594;
            context$587.env.set(resolve$275(head$589.name), { fn: macroDefinition$592 });
            return expandToTermTree$330(rest$590, context$587);
        }
        if (head$589.hasPrototype(LetStatement$315) || head$589.hasPrototype(ConstStatement$316)) {
            head$589.decls.forEach(function (decl$596) {
                var freshName$597 = fresh$281();
                var renamedDecl$598 = decl$596.ident.rename(decl$596.ident, freshName$597);
                rest$590 = rest$590.map(function (stx$599) {
                    return stx$599.rename(decl$596.ident, freshName$597);
                });
                decl$596.ident = renamedDecl$598;
            });
        }
        if (head$589.hasPrototype(NamedFun$303)) {
            addToDefinitionCtx$331([head$589.name], context$587.defscope, true);
        }
        if (head$589.hasPrototype(VariableStatement$314)) {
            addToDefinitionCtx$331(_$171.map(head$589.decls, function (decl$600) {
                return decl$600.ident;
            }), context$587.defscope, true);
        }
        if (head$589.hasPrototype(Block$292) && head$589.body.hasPrototype(Delimiter$301)) {
            head$589.body.delim.token.inner.forEach(function (term$601) {
                if (term$601.hasPrototype(VariableStatement$314)) {
                    addToDefinitionCtx$331(_$171.map(term$601.decls, function (decl$602) {
                        return decl$602.ident;
                    }), context$587.defscope, true);
                }
            });
        }
        if (head$589.hasPrototype(Delimiter$301)) {
            head$589.delim.token.inner.forEach(function (term$603) {
                if (term$603.hasPrototype(VariableStatement$314)) {
                    addToDefinitionCtx$331(_$171.map(term$603.decls, function (decl$604) {
                        return decl$604.ident;
                    }), context$587.defscope, true);
                }
            });
        }
        var trees$591 = expandToTermTree$330(rest$590, context$587);
        return {
            terms: [head$589].concat(trees$591.terms),
            context: trees$591.context
        };
    }
    function addToDefinitionCtx$331(idents$605, defscope$606, skipRep$607) {
        parser$172.assert(idents$605 && idents$605.length > 0, 'expecting some variable identifiers');
        skipRep$607 = skipRep$607 || false;
        _$171.each(idents$605, function (id$608) {
            var skip$609 = false;
            if (skipRep$607) {
                var declRepeat$610 = _$171.find(defscope$606, function (def$611) {
                        return def$611.id.token.value === id$608.token.value && arraysEqual$276(marksof$274(def$611.id.context), marksof$274(id$608.context));
                    });
                skip$609 = typeof declRepeat$610 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$609) {
                var name$612 = fresh$281();
                defscope$606.push({
                    id: id$608,
                    name: name$612
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$332(term$613, context$614) {
        parser$172.assert(context$614 && context$614.env, 'environment map is required');
        if (term$613.hasPrototype(ArrayLiteral$293)) {
            term$613.array.delim.token.inner = expand$333(term$613.array.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(Block$292)) {
            term$613.body.delim.token.inner = expand$333(term$613.body.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ParenExpression$294)) {
            term$613.expr.delim.token.inner = expand$333(term$613.expr.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(Call$310)) {
            term$613.fun = expandTermTreeToFinal$332(term$613.fun, context$614);
            term$613.args = _$171.map(term$613.args, function (arg$615) {
                return expandTermTreeToFinal$332(arg$615, context$614);
            });
            return term$613;
        } else if (term$613.hasPrototype(UnaryOp$295)) {
            term$613.expr = expandTermTreeToFinal$332(term$613.expr, context$614);
            return term$613;
        } else if (term$613.hasPrototype(BinOp$297)) {
            term$613.left = expandTermTreeToFinal$332(term$613.left, context$614);
            term$613.right = expandTermTreeToFinal$332(term$613.right, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ObjGet$312)) {
            term$613.right.delim.token.inner = expand$333(term$613.right.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ObjDotGet$311)) {
            term$613.left = expandTermTreeToFinal$332(term$613.left, context$614);
            term$613.right = expandTermTreeToFinal$332(term$613.right, context$614);
            return term$613;
        } else if (term$613.hasPrototype(VariableDeclaration$313)) {
            if (term$613.init) {
                term$613.init = expandTermTreeToFinal$332(term$613.init, context$614);
            }
            return term$613;
        } else if (term$613.hasPrototype(VariableStatement$314)) {
            term$613.decls = _$171.map(term$613.decls, function (decl$616) {
                return expandTermTreeToFinal$332(decl$616, context$614);
            });
            return term$613;
        } else if (term$613.hasPrototype(Delimiter$301)) {
            // expand inside the delimiter and then continue on
            term$613.delim.token.inner = expand$333(term$613.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(NamedFun$303) || term$613.hasPrototype(AnonFun$304) || term$613.hasPrototype(CatchClause$317) || term$613.hasPrototype(ArrowFun$305) || term$613.hasPrototype(Module$318)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$617 = [];
            var bodyContext$618 = makeExpanderContext$334(_$171.defaults({ defscope: newDef$617 }, context$614));
            var paramSingleIdent$619 = term$613.params && term$613.params.token.type === parser$172.Token.Identifier;
            if (term$613.params && term$613.params.token.type === parser$172.Token.Delimiter) {
                var params$626 = term$613.params.expose();
            } else if (paramSingleIdent$619) {
                var params$626 = term$613.params;
            } else {
                var params$626 = syn$173.makeDelim('()', [], null);
            }
            if (Array.isArray(term$613.body)) {
                var bodies$627 = syn$173.makeDelim('{}', term$613.body, null);
            } else {
                var bodies$627 = term$613.body;
            }
            bodies$627 = bodies$627.addDefCtx(newDef$617);
            var paramNames$620 = _$171.map(getParamIdentifiers$283(params$626), function (param$628) {
                    var freshName$629 = fresh$281();
                    return {
                        freshName: freshName$629,
                        originalParam: param$628,
                        renamedParam: param$628.rename(param$628, freshName$629)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$621 = _$171.reduce(paramNames$620, function (accBody$630, p$631) {
                    return accBody$630.rename(p$631.originalParam, p$631.freshName);
                }, bodies$627);
            renamedBody$621 = renamedBody$621.expose();
            var expandedResult$622 = expandToTermTree$330(renamedBody$621.token.inner, bodyContext$618);
            var bodyTerms$623 = expandedResult$622.terms;
            var renamedParams$624 = _$171.map(paramNames$620, function (p$632) {
                    return p$632.renamedParam;
                });
            if (paramSingleIdent$619) {
                var flatArgs$633 = renamedParams$624[0];
            } else {
                var flatArgs$633 = syn$173.makeDelim('()', joinSyntax$272(renamedParams$624, ','), term$613.params);
            }
            var expandedArgs$625 = expand$333([flatArgs$633], bodyContext$618);
            parser$172.assert(expandedArgs$625.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$613.params) {
                term$613.params = expandedArgs$625[0];
            }
            bodyTerms$623 = _$171.map(bodyTerms$623, function (bodyTerm$634) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$635 = bodyTerm$634.addDefCtx(newDef$617);
                // finish expansion
                return expandTermTreeToFinal$332(termWithCtx$635, expandedResult$622.context);
            });
            if (term$613.hasPrototype(Module$318)) {
                bodyTerms$623 = _$171.filter(bodyTerms$623, function (bodyTerm$636) {
                    if (bodyTerm$636.hasPrototype(Export$320)) {
                        term$613.exports.push(bodyTerm$636);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$621.token.inner = bodyTerms$623;
            if (Array.isArray(term$613.body)) {
                term$613.body = renamedBody$621.token.inner;
            } else {
                term$613.body = renamedBody$621;
            }
            // and continue expand the rest
            return term$613;
        }
        // the term is fine as is
        return term$613;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$333(stx$637, context$638) {
        parser$172.assert(context$638, 'must provide an expander context');
        var trees$639 = expandToTermTree$330(stx$637, context$638);
        return _$171.map(trees$639.terms, function (term$640) {
            return expandTermTreeToFinal$332(term$640, trees$639.context);
        });
    }
    function makeExpanderContext$334(o$641) {
        o$641 = o$641 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$641.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$641.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$641.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$641.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$335(stx$642, builtinSource$643) {
        var env$644 = new Map();
        var params$645 = [];
        var context$646, builtInContext$647 = makeExpanderContext$334({ env: env$644 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$643) {
            var builtinRead$650 = parser$172.read(builtinSource$643);
            builtinRead$650 = [
                syn$173.makeIdent('module', null),
                syn$173.makeDelim('{}', builtinRead$650, null)
            ];
            var builtinRes$651 = expand$333(builtinRead$650, builtInContext$647);
            params$645 = _$171.map(builtinRes$651[0].exports, function (term$652) {
                return {
                    oldExport: term$652.name,
                    newParam: syn$173.makeIdent(term$652.name.token.value, null)
                };
            });
        }
        var modBody$648 = syn$173.makeDelim('{}', stx$642, null);
        modBody$648 = _$171.reduce(params$645, function (acc$653, param$654) {
            var newName$655 = fresh$281();
            env$644.set(resolve$275(param$654.newParam.rename(param$654.newParam, newName$655)), env$644.get(resolve$275(param$654.oldExport)));
            return acc$653.rename(param$654.newParam, newName$655);
        }, modBody$648);
        context$646 = makeExpanderContext$334({ env: env$644 });
        var res$649 = expand$333([
                syn$173.makeIdent('module', null),
                modBody$648
            ], context$646);
        res$649 = res$649[0].destruct();
        return flatten$336(res$649[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$336(stx$656) {
        return _$171.reduce(stx$656, function (acc$657, stx$658) {
            if (stx$658.token.type === parser$172.Token.Delimiter) {
                var exposed$659 = stx$658.expose();
                var openParen$660 = syntaxFromToken$271({
                        type: parser$172.Token.Punctuator,
                        value: stx$658.token.value[0],
                        range: stx$658.token.startRange,
                        sm_range: typeof stx$658.token.sm_startRange == 'undefined' ? stx$658.token.startRange : stx$658.token.sm_startRange,
                        lineNumber: stx$658.token.startLineNumber,
                        sm_lineNumber: typeof stx$658.token.sm_startLineNumber == 'undefined' ? stx$658.token.startLineNumber : stx$658.token.sm_startLineNumber,
                        lineStart: stx$658.token.startLineStart,
                        sm_lineStart: typeof stx$658.token.sm_startLineStart == 'undefined' ? stx$658.token.startLineStart : stx$658.token.sm_startLineStart
                    }, exposed$659);
                var closeParen$661 = syntaxFromToken$271({
                        type: parser$172.Token.Punctuator,
                        value: stx$658.token.value[1],
                        range: stx$658.token.endRange,
                        sm_range: typeof stx$658.token.sm_endRange == 'undefined' ? stx$658.token.endRange : stx$658.token.sm_endRange,
                        lineNumber: stx$658.token.endLineNumber,
                        sm_lineNumber: typeof stx$658.token.sm_endLineNumber == 'undefined' ? stx$658.token.endLineNumber : stx$658.token.sm_endLineNumber,
                        lineStart: stx$658.token.endLineStart,
                        sm_lineStart: typeof stx$658.token.sm_endLineStart == 'undefined' ? stx$658.token.endLineStart : stx$658.token.sm_endLineStart
                    }, exposed$659);
                if (stx$658.token.leadingComments) {
                    openParen$660.token.leadingComments = stx$658.token.leadingComments;
                }
                if (stx$658.token.trailingComments) {
                    openParen$660.token.trailingComments = stx$658.token.trailingComments;
                }
                return acc$657.concat(openParen$660).concat(flatten$336(exposed$659.token.inner)).concat(closeParen$661);
            }
            stx$658.token.sm_lineNumber = stx$658.token.sm_lineNumber ? stx$658.token.sm_lineNumber : stx$658.token.lineNumber;
            stx$658.token.sm_lineStart = stx$658.token.sm_lineStart ? stx$658.token.sm_lineStart : stx$658.token.lineStart;
            stx$658.token.sm_range = stx$658.token.sm_range ? stx$658.token.sm_range : stx$658.token.range;
            return acc$657.concat(stx$658);
        }, []);
    }
    exports$170.enforest = enforest$325;
    exports$170.expand = expandTopLevel$335;
    exports$170.resolve = resolve$275;
    exports$170.get_expression = get_expression$326;
    exports$170.makeExpanderContext = makeExpanderContext$334;
    exports$170.Expr = Expr$287;
    exports$170.VariableStatement = VariableStatement$314;
    exports$170.tokensToSyntax = syn$173.tokensToSyntax;
    exports$170.syntaxToTokens = syn$173.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map