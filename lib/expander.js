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
(function (root$163, factory$164) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$164(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$164);
    }
}(this, function (exports$165, _$166, parser$167, syn$168, es6$169, se$170, patternModule$171, gen$172) {
    'use strict';
    var codegen$173 = gen$172 || escodegen;
    // used to export "private" methods for unit testing
    exports$165._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$338 = Object.create(this);
                if (typeof o$338.construct === 'function') {
                    o$338.construct.apply(o$338, arguments);
                }
                return o$338;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$339) {
                var result$340 = Object.create(this);
                for (var prop$341 in properties$339) {
                    if (properties$339.hasOwnProperty(prop$341)) {
                        result$340[prop$341] = properties$339[prop$341];
                    }
                }
                return result$340;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$342) {
                function F$343() {
                }
                F$343.prototype = proto$342;
                return this instanceof F$343;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$263(msg$344) {
        throw new Error(msg$344);
    }
    var scopedEval$264 = se$170.scopedEval;
    var Rename$265 = syn$168.Rename;
    var Mark$266 = syn$168.Mark;
    var Var$267 = syn$168.Var;
    var Def$268 = syn$168.Def;
    var isDef$269 = syn$168.isDef;
    var isMark$270 = syn$168.isMark;
    var isRename$271 = syn$168.isRename;
    var syntaxFromToken$272 = syn$168.syntaxFromToken;
    var joinSyntax$273 = syn$168.joinSyntax;
    function remdup$274(mark$345, mlist$346) {
        if (mark$345 === _$166.first(mlist$346)) {
            return _$166.rest(mlist$346, 1);
        }
        return [mark$345].concat(mlist$346);
    }
    // (CSyntax) -> [...Num]
    function marksof$275(ctx$347, stopName$348, originalName$349) {
        var mark$350, submarks$351;
        if (isMark$270(ctx$347)) {
            mark$350 = ctx$347.mark;
            submarks$351 = marksof$275(ctx$347.context, stopName$348, originalName$349);
            return remdup$274(mark$350, submarks$351);
        }
        if (isDef$269(ctx$347)) {
            return marksof$275(ctx$347.context, stopName$348, originalName$349);
        }
        if (isRename$271(ctx$347)) {
            if (stopName$348 === originalName$349 + '$' + ctx$347.name) {
                return [];
            }
            return marksof$275(ctx$347.context, stopName$348, originalName$349);
        }
        return [];
    }
    function resolve$276(stx$352) {
        return resolveCtx$280(stx$352.token.value, stx$352.context, [], []);
    }
    function arraysEqual$277(a$353, b$354) {
        if (a$353.length !== b$354.length) {
            return false;
        }
        for (var i$355 = 0; i$355 < a$353.length; i$355++) {
            if (a$353[i$355] !== b$354[i$355]) {
                return false;
            }
        }
        return true;
    }
    function renames$278(defctx$356, oldctx$357, originalName$358) {
        var acc$359 = oldctx$357;
        for (var i$360 = 0; i$360 < defctx$356.length; i$360++) {
            if (defctx$356[i$360].id.token.value === originalName$358) {
                acc$359 = Rename$265(defctx$356[i$360].id, defctx$356[i$360].name, acc$359, defctx$356);
            }
        }
        return acc$359;
    }
    function unionEl$279(arr$361, el$362) {
        if (arr$361.indexOf(el$362) === -1) {
            var res$363 = arr$361.slice(0);
            res$363.push(el$362);
            return res$363;
        }
        return arr$361;
    }
    // (Syntax) -> String
    function resolveCtx$280(originalName$364, ctx$365, stop_spine$366, stop_branch$367) {
        if (isMark$270(ctx$365)) {
            return resolveCtx$280(originalName$364, ctx$365.context, stop_spine$366, stop_branch$367);
        }
        if (isDef$269(ctx$365)) {
            if (stop_spine$366.indexOf(ctx$365.defctx) !== -1) {
                return resolveCtx$280(originalName$364, ctx$365.context, stop_spine$366, stop_branch$367);
            } else {
                return resolveCtx$280(originalName$364, renames$278(ctx$365.defctx, ctx$365.context, originalName$364), stop_spine$366, unionEl$279(stop_branch$367, ctx$365.defctx));
            }
        }
        if (isRename$271(ctx$365)) {
            if (originalName$364 === ctx$365.id.token.value) {
                var idName$368 = resolveCtx$280(ctx$365.id.token.value, ctx$365.id.context, stop_branch$367, stop_branch$367);
                var subName$369 = resolveCtx$280(originalName$364, ctx$365.context, unionEl$279(stop_spine$366, ctx$365.def), stop_branch$367);
                if (idName$368 === subName$369) {
                    var idMarks$370 = marksof$275(ctx$365.id.context, originalName$364 + '$' + ctx$365.name, originalName$364);
                    var subMarks$371 = marksof$275(ctx$365.context, originalName$364 + '$' + ctx$365.name, originalName$364);
                    if (arraysEqual$277(idMarks$370, subMarks$371)) {
                        return originalName$364 + '$' + ctx$365.name;
                    }
                }
            }
            return resolveCtx$280(originalName$364, ctx$365.context, stop_spine$366, stop_branch$367);
        }
        return originalName$364;
    }
    var nextFresh$281 = 0;
    // fun () -> Num
    function fresh$282() {
        return nextFresh$281++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$283(towrap$372, delimSyntax$373) {
        parser$167.assert(delimSyntax$373.token.type === parser$167.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$272({
            type: parser$167.Token.Delimiter,
            value: delimSyntax$373.token.value,
            inner: towrap$372,
            range: delimSyntax$373.token.range,
            startLineNumber: delimSyntax$373.token.startLineNumber,
            lineStart: delimSyntax$373.token.lineStart
        }, delimSyntax$373);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$284(argSyntax$374) {
        if (argSyntax$374.token.type === parser$167.Token.Delimiter) {
            return _$166.filter(argSyntax$374.token.inner, function (stx$375) {
                return stx$375.token.value !== ',';
            });
        } else if (argSyntax$374.token.type === parser$167.Token.Identifier) {
            return [argSyntax$374];
        } else {
            parser$167.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$285 = {
            destruct: function () {
                return _$166.reduce(this.properties, _$166.bind(function (acc$376, prop$377) {
                    if (this[prop$377] && this[prop$377].hasPrototype(TermTree$285)) {
                        return acc$376.concat(this[prop$377].destruct());
                    } else if (this[prop$377] && this[prop$377].token && this[prop$377].token.inner) {
                        this[prop$377].token.inner = _$166.reduce(this[prop$377].token.inner, function (acc$378, t$379) {
                            if (t$379.hasPrototype(TermTree$285)) {
                                return acc$378.concat(t$379.destruct());
                            }
                            return acc$378.concat(t$379);
                        }, []);
                        return acc$376.concat(this[prop$377]);
                    } else if (Array.isArray(this[prop$377])) {
                        return acc$376.concat(_$166.reduce(this[prop$377], function (acc$380, t$381) {
                            if (t$381.hasPrototype(TermTree$285)) {
                                return acc$380.concat(t$381.destruct());
                            }
                            return acc$380.concat(t$381);
                        }, []));
                    } else if (this[prop$377]) {
                        return acc$376.concat(this[prop$377]);
                    } else {
                        return acc$376;
                    }
                }, this), []);
            },
            addDefCtx: function (def$382) {
                for (var i$383 = 0; i$383 < this.properties.length; i$383++) {
                    var prop$384 = this.properties[i$383];
                    if (Array.isArray(this[prop$384])) {
                        this[prop$384] = _$166.map(this[prop$384], function (item$385) {
                            return item$385.addDefCtx(def$382);
                        });
                    } else if (this[prop$384]) {
                        this[prop$384] = this[prop$384].addDefCtx(def$382);
                    }
                }
                return this;
            }
        };
    var EOF$286 = TermTree$285.extend({
            properties: ['eof'],
            construct: function (e$386) {
                this.eof = e$386;
            }
        });
    var Statement$287 = TermTree$285.extend({
            construct: function () {
            }
        });
    var Expr$288 = TermTree$285.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$289 = Expr$288.extend({
            construct: function () {
            }
        });
    var ThisExpression$290 = PrimaryExpression$289.extend({
            properties: ['this'],
            construct: function (that$387) {
                this.this = that$387;
            }
        });
    var Lit$291 = PrimaryExpression$289.extend({
            properties: ['lit'],
            construct: function (l$388) {
                this.lit = l$388;
            }
        });
    exports$165._test.PropertyAssignment = PropertyAssignment$292;
    var PropertyAssignment$292 = TermTree$285.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$389, assignment$390) {
                this.propName = propName$389;
                this.assignment = assignment$390;
            }
        });
    var Block$293 = PrimaryExpression$289.extend({
            properties: ['body'],
            construct: function (body$391) {
                this.body = body$391;
            }
        });
    var ArrayLiteral$294 = PrimaryExpression$289.extend({
            properties: ['array'],
            construct: function (ar$392) {
                this.array = ar$392;
            }
        });
    var ParenExpression$295 = PrimaryExpression$289.extend({
            properties: ['expr'],
            construct: function (expr$393) {
                this.expr = expr$393;
            }
        });
    var UnaryOp$296 = Expr$288.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$394, expr$395) {
                this.op = op$394;
                this.expr = expr$395;
            }
        });
    var PostfixOp$297 = Expr$288.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$396, op$397) {
                this.expr = expr$396;
                this.op = op$397;
            }
        });
    var BinOp$298 = Expr$288.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$398, left$399, right$400) {
                this.op = op$398;
                this.left = left$399;
                this.right = right$400;
            }
        });
    var ConditionalExpression$299 = Expr$288.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$401, question$402, tru$403, colon$404, fls$405) {
                this.cond = cond$401;
                this.question = question$402;
                this.tru = tru$403;
                this.colon = colon$404;
                this.fls = fls$405;
            }
        });
    var Keyword$300 = TermTree$285.extend({
            properties: ['keyword'],
            construct: function (k$406) {
                this.keyword = k$406;
            }
        });
    var Punc$301 = TermTree$285.extend({
            properties: ['punc'],
            construct: function (p$407) {
                this.punc = p$407;
            }
        });
    var Delimiter$302 = TermTree$285.extend({
            properties: ['delim'],
            construct: function (d$408) {
                this.delim = d$408;
            }
        });
    var Id$303 = PrimaryExpression$289.extend({
            properties: ['id'],
            construct: function (id$409) {
                this.id = id$409;
            }
        });
    var NamedFun$304 = Expr$288.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$410, star$411, name$412, params$413, body$414) {
                this.keyword = keyword$410;
                this.star = star$411;
                this.name = name$412;
                this.params = params$413;
                this.body = body$414;
            }
        });
    var AnonFun$305 = Expr$288.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$415, star$416, params$417, body$418) {
                this.keyword = keyword$415;
                this.star = star$416;
                this.params = params$417;
                this.body = body$418;
            }
        });
    var ArrowFun$306 = Expr$288.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$419, arrow$420, body$421) {
                this.params = params$419;
                this.arrow = arrow$420;
                this.body = body$421;
            }
        });
    var LetMacro$307 = TermTree$285.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$422, body$423) {
                this.name = name$422;
                this.body = body$423;
            }
        });
    var Macro$308 = TermTree$285.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$424, body$425) {
                this.name = name$424;
                this.body = body$425;
            }
        });
    var AnonMacro$309 = TermTree$285.extend({
            properties: ['body'],
            construct: function (body$426) {
                this.body = body$426;
            }
        });
    var Const$310 = Expr$288.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$427, call$428) {
                this.newterm = newterm$427;
                this.call = call$428;
            }
        });
    var Call$311 = Expr$288.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$167.assert(this.fun.hasPrototype(TermTree$285), 'expecting a term tree in destruct of call');
                var that$429 = this;
                this.delim = syntaxFromToken$272(_$166.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$166.reduce(this.args, function (acc$430, term$431) {
                    parser$167.assert(term$431 && term$431.hasPrototype(TermTree$285), 'expecting term trees in destruct of Call');
                    var dst$432 = acc$430.concat(term$431.destruct());
                    // add all commas except for the last one
                    if (that$429.commas.length > 0) {
                        dst$432 = dst$432.concat(that$429.commas.shift());
                    }
                    return dst$432;
                }, []);
                return this.fun.destruct().concat(Delimiter$302.create(this.delim).destruct());
            },
            construct: function (funn$433, args$434, delim$435, commas$436) {
                parser$167.assert(Array.isArray(args$434), 'requires an array of arguments terms');
                this.fun = funn$433;
                this.args = args$434;
                this.delim = delim$435;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$436;
            }
        });
    var ObjDotGet$312 = Expr$288.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$437, dot$438, right$439) {
                this.left = left$437;
                this.dot = dot$438;
                this.right = right$439;
            }
        });
    var ObjGet$313 = Expr$288.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$440, right$441) {
                this.left = left$440;
                this.right = right$441;
            }
        });
    var VariableDeclaration$314 = TermTree$285.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$442, eqstx$443, init$444, comma$445) {
                this.ident = ident$442;
                this.eqstx = eqstx$443;
                this.init = init$444;
                this.comma = comma$445;
            }
        });
    var VariableStatement$315 = Statement$287.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$166.reduce(this.decls, function (acc$446, decl$447) {
                    return acc$446.concat(decl$447.destruct());
                }, []));
            },
            construct: function (varkw$448, decls$449) {
                parser$167.assert(Array.isArray(decls$449), 'decls must be an array');
                this.varkw = varkw$448;
                this.decls = decls$449;
            }
        });
    var LetStatement$316 = Statement$287.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$166.reduce(this.decls, function (acc$450, decl$451) {
                    return acc$450.concat(decl$451.destruct());
                }, []));
            },
            construct: function (letkw$452, decls$453) {
                parser$167.assert(Array.isArray(decls$453), 'decls must be an array');
                this.letkw = letkw$452;
                this.decls = decls$453;
            }
        });
    var ConstStatement$317 = Statement$287.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$166.reduce(this.decls, function (acc$454, decl$455) {
                    return acc$454.concat(decl$455.destruct());
                }, []));
            },
            construct: function (constkw$456, decls$457) {
                parser$167.assert(Array.isArray(decls$457), 'decls must be an array');
                this.constkw = constkw$456;
                this.decls = decls$457;
            }
        });
    var CatchClause$318 = TermTree$285.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$458, params$459, body$460) {
                this.catchkw = catchkw$458;
                this.params = params$459;
                this.body = body$460;
            }
        });
    var Module$319 = TermTree$285.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$461) {
                this.body = body$461;
                this.exports = [];
            }
        });
    var Empty$320 = TermTree$285.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$321 = TermTree$285.extend({
            properties: ['name'],
            construct: function (name$462) {
                this.name = name$462;
            }
        });
    function stxIsUnaryOp$322(stx$463) {
        var staticOperators$464 = [
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
        return _$166.contains(staticOperators$464, stx$463.token.value);
    }
    function stxIsBinOp$323(stx$465) {
        var staticOperators$466 = [
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
        return _$166.contains(staticOperators$466, stx$465.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$324(stx$467, context$468) {
        var decls$469 = [];
        var res$470 = enforest$326(stx$467, context$468);
        var result$471 = res$470.result;
        var rest$472 = res$470.rest;
        if (rest$472[0]) {
            var nextRes$473 = enforest$326(rest$472, context$468);
            // x = ...
            if (nextRes$473.result.hasPrototype(Punc$301) && nextRes$473.result.punc.token.value === '=') {
                var initializerRes$474 = enforest$326(nextRes$473.rest, context$468);
                if (initializerRes$474.rest[0]) {
                    var restRes$475 = enforest$326(initializerRes$474.rest, context$468);
                    // x = y + z, ...
                    if (restRes$475.result.hasPrototype(Punc$301) && restRes$475.result.punc.token.value === ',') {
                        decls$469.push(VariableDeclaration$314.create(result$471.id, nextRes$473.result.punc, initializerRes$474.result, restRes$475.result.punc));
                        var subRes$476 = enforestVarStatement$324(restRes$475.rest, context$468);
                        decls$469 = decls$469.concat(subRes$476.result);
                        rest$472 = subRes$476.rest;
                    }    // x = y ...
                    else {
                        decls$469.push(VariableDeclaration$314.create(result$471.id, nextRes$473.result.punc, initializerRes$474.result));
                        rest$472 = initializerRes$474.rest;
                    }
                }    // x = y EOF
                else {
                    decls$469.push(VariableDeclaration$314.create(result$471.id, nextRes$473.result.punc, initializerRes$474.result));
                }
            }    // x ,...;
            else if (nextRes$473.result.hasPrototype(Punc$301) && nextRes$473.result.punc.token.value === ',') {
                decls$469.push(VariableDeclaration$314.create(result$471.id, null, null, nextRes$473.result.punc));
                var subRes$476 = enforestVarStatement$324(nextRes$473.rest, context$468);
                decls$469 = decls$469.concat(subRes$476.result);
                rest$472 = subRes$476.rest;
            } else {
                if (result$471.hasPrototype(Id$303)) {
                    decls$469.push(VariableDeclaration$314.create(result$471.id));
                } else {
                    throwError$263('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$471.hasPrototype(Id$303)) {
                decls$469.push(VariableDeclaration$314.create(result$471.id));
            } else if (result$471.hasPrototype(BinOp$298) && result$471.op.token.value === 'in') {
                decls$469.push(VariableDeclaration$314.create(result$471.left.id, result$471.op, result$471.right));
            } else {
                throwError$263('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$469,
            rest: rest$472
        };
    }
    function adjustLineContext$325(stx$477, original$478, current$479) {
        current$479 = current$479 || {
            lastLineNumber: original$478.token.lineNumber,
            lineNumber: original$478.token.lineNumber - 1
        };
        return _$166.map(stx$477, function (stx$480) {
            if (stx$480.token.type === parser$167.Token.Delimiter) {
                // handle tokens with missing line info
                stx$480.token.startLineNumber = typeof stx$480.token.startLineNumber == 'undefined' ? original$478.token.lineNumber : stx$480.token.startLineNumber;
                stx$480.token.endLineNumber = typeof stx$480.token.endLineNumber == 'undefined' ? original$478.token.lineNumber : stx$480.token.endLineNumber;
                stx$480.token.startLineStart = typeof stx$480.token.startLineStart == 'undefined' ? original$478.token.lineStart : stx$480.token.startLineStart;
                stx$480.token.endLineStart = typeof stx$480.token.endLineStart == 'undefined' ? original$478.token.lineStart : stx$480.token.endLineStart;
                stx$480.token.startRange = typeof stx$480.token.startRange == 'undefined' ? original$478.token.range : stx$480.token.startRange;
                stx$480.token.endRange = typeof stx$480.token.endRange == 'undefined' ? original$478.token.range : stx$480.token.endRange;
                stx$480.token.sm_startLineNumber = typeof stx$480.token.sm_startLineNumber == 'undefined' ? stx$480.token.startLineNumber : stx$480.token.sm_startLineNumber;
                stx$480.token.sm_endLineNumber = typeof stx$480.token.sm_endLineNumber == 'undefined' ? stx$480.token.endLineNumber : stx$480.token.sm_endLineNumber;
                stx$480.token.sm_startLineStart = typeof stx$480.token.sm_startLineStart == 'undefined' ? stx$480.token.startLineStart : stx$480.token.sm_startLineStart;
                stx$480.token.sm_endLineStart = typeof stx$480.token.sm_endLineStart == 'undefined' ? stx$480.token.endLineStart : stx$480.token.sm_endLineStart;
                stx$480.token.sm_startRange = typeof stx$480.token.sm_startRange == 'undefined' ? stx$480.token.startRange : stx$480.token.sm_startRange;
                stx$480.token.sm_endRange = typeof stx$480.token.sm_endRange == 'undefined' ? stx$480.token.endRange : stx$480.token.sm_endRange;
                if (stx$480.token.startLineNumber === current$479.lastLineNumber && current$479.lastLineNumber !== current$479.lineNumber) {
                    stx$480.token.startLineNumber = current$479.lineNumber;
                } else if (stx$480.token.startLineNumber !== current$479.lastLineNumber) {
                    current$479.lineNumber++;
                    current$479.lastLineNumber = stx$480.token.startLineNumber;
                    stx$480.token.startLineNumber = current$479.lineNumber;
                }
                if (stx$480.token.inner.length > 0) {
                    stx$480.token.inner = adjustLineContext$325(stx$480.token.inner, original$478, current$479);
                }
                return stx$480;
            }
            // handle tokens with missing line info
            stx$480.token.lineNumber = typeof stx$480.token.lineNumber == 'undefined' ? original$478.token.lineNumber : stx$480.token.lineNumber;
            stx$480.token.lineStart = typeof stx$480.token.lineStart == 'undefined' ? original$478.token.lineStart : stx$480.token.lineStart;
            stx$480.token.range = typeof stx$480.token.range == 'undefined' ? original$478.token.range : stx$480.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$480.token.sm_lineNumber = typeof stx$480.token.sm_lineNumber == 'undefined' ? stx$480.token.lineNumber : stx$480.token.sm_lineNumber;
            stx$480.token.sm_lineStart = typeof stx$480.token.sm_lineStart == 'undefined' ? stx$480.token.lineStart : stx$480.token.sm_lineStart;
            stx$480.token.sm_range = typeof stx$480.token.sm_range == 'undefined' ? _$166.clone(stx$480.token.range) : stx$480.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$480.token.lineNumber === current$479.lastLineNumber && current$479.lastLineNumber !== current$479.lineNumber) {
                stx$480.token.lineNumber = current$479.lineNumber;
            } else if (stx$480.token.lineNumber !== current$479.lastLineNumber) {
                current$479.lineNumber++;
                current$479.lastLineNumber = stx$480.token.lineNumber;
                stx$480.token.lineNumber = current$479.lineNumber;
            }
            return stx$480;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$326(toks$481, context$482) {
        parser$167.assert(toks$481.length > 0, 'enforest assumes there are tokens to work with');
        function step$483(head$484, rest$485) {
            var innerTokens$486;
            parser$167.assert(Array.isArray(rest$485), 'result must at least be an empty array');
            if (head$484.hasPrototype(TermTree$285)) {
                // function call
                var emp$489 = head$484.emp;
                var emp$489 = head$484.emp;
                var keyword$492 = head$484.keyword;
                var delim$494 = head$484.delim;
                var id$496 = head$484.id;
                var delim$494 = head$484.delim;
                var emp$489 = head$484.emp;
                var punc$500 = head$484.punc;
                var keyword$492 = head$484.keyword;
                var emp$489 = head$484.emp;
                var emp$489 = head$484.emp;
                var emp$489 = head$484.emp;
                var delim$494 = head$484.delim;
                var delim$494 = head$484.delim;
                var id$496 = head$484.id;
                var keyword$492 = head$484.keyword;
                var keyword$492 = head$484.keyword;
                var keyword$492 = head$484.keyword;
                var keyword$492 = head$484.keyword;
                if (head$484.hasPrototype(Expr$288) && rest$485[0] && rest$485[0].token.type === parser$167.Token.Delimiter && rest$485[0].token.value === '()') {
                    var argRes$533, enforestedArgs$534 = [], commas$535 = [];
                    rest$485[0].expose();
                    innerTokens$486 = rest$485[0].token.inner;
                    while (innerTokens$486.length > 0) {
                        argRes$533 = enforest$326(innerTokens$486, context$482);
                        enforestedArgs$534.push(argRes$533.result);
                        innerTokens$486 = argRes$533.rest;
                        if (innerTokens$486[0] && innerTokens$486[0].token.value === ',') {
                            // record the comma for later
                            commas$535.push(innerTokens$486[0]);
                            // but dump it for the next loop turn
                            innerTokens$486 = innerTokens$486.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$536 = _$166.all(enforestedArgs$534, function (argTerm$537) {
                            return argTerm$537.hasPrototype(Expr$288);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$486.length === 0 && argsAreExprs$536) {
                        return step$483(Call$311.create(head$484, enforestedArgs$534, rest$485[0], commas$535), rest$485.slice(1));
                    }
                } else if (head$484.hasPrototype(Expr$288) && rest$485[0] && rest$485[0].token.value === '?') {
                    var question$538 = rest$485[0];
                    var condRes$539 = enforest$326(rest$485.slice(1), context$482);
                    var truExpr$540 = condRes$539.result;
                    var right$541 = condRes$539.rest;
                    if (truExpr$540.hasPrototype(Expr$288) && right$541[0] && right$541[0].token.value === ':') {
                        var colon$542 = right$541[0];
                        var flsRes$543 = enforest$326(right$541.slice(1), context$482);
                        var flsExpr$544 = flsRes$543.result;
                        if (flsExpr$544.hasPrototype(Expr$288)) {
                            return step$483(ConditionalExpression$299.create(head$484, question$538, truExpr$540, colon$542, flsExpr$544), flsRes$543.rest);
                        }
                    }
                } else if (head$484.hasPrototype(Keyword$300) && keyword$492.token.value === 'new' && rest$485[0]) {
                    var newCallRes$545 = enforest$326(rest$485, context$482);
                    if (newCallRes$545.result.hasPrototype(Call$311)) {
                        return step$483(Const$310.create(head$484, newCallRes$545.result), newCallRes$545.rest);
                    }
                } else if (head$484.hasPrototype(Delimiter$302) && delim$494.token.value === '()' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator && rest$485[0].token.value === '=>') {
                    var res$546 = enforest$326(rest$485.slice(1), context$482);
                    if (res$546.result.hasPrototype(Expr$288)) {
                        return step$483(ArrowFun$306.create(delim$494, rest$485[0], res$546.result.destruct()), res$546.rest);
                    } else {
                        throwError$263('Body of arrow function must be an expression');
                    }
                } else if (head$484.hasPrototype(Id$303) && rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator && rest$485[0].token.value === '=>') {
                    var res$546 = enforest$326(rest$485.slice(1), context$482);
                    if (res$546.result.hasPrototype(Expr$288)) {
                        return step$483(ArrowFun$306.create(id$496, rest$485[0], res$546.result.destruct()), res$546.rest);
                    } else {
                        throwError$263('Body of arrow function must be an expression');
                    }
                } else if (head$484.hasPrototype(Delimiter$302) && delim$494.token.value === '()') {
                    innerTokens$486 = delim$494.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$486.length === 0) {
                        return step$483(ParenExpression$295.create(head$484), rest$485);
                    } else {
                        var innerTerm$547 = get_expression$327(innerTokens$486, context$482);
                        if (innerTerm$547.result && innerTerm$547.result.hasPrototype(Expr$288)) {
                            return step$483(ParenExpression$295.create(head$484), rest$485);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$484.hasPrototype(Expr$288) && rest$485[0] && rest$485[1] && stxIsBinOp$323(rest$485[0])) {
                    var op$548 = rest$485[0];
                    var left$549 = head$484;
                    var bopRes$550 = enforest$326(rest$485.slice(1), context$482);
                    var right$541 = bopRes$550.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$541.hasPrototype(Expr$288)) {
                        return step$483(BinOp$298.create(op$548, left$549, right$541), bopRes$550.rest);
                    }
                } else if (head$484.hasPrototype(Punc$301) && stxIsUnaryOp$322(punc$500)) {
                    var unopRes$551 = enforest$326(rest$485, context$482);
                    if (unopRes$551.result.hasPrototype(Expr$288)) {
                        return step$483(UnaryOp$296.create(punc$500, unopRes$551.result), unopRes$551.rest);
                    }
                } else if (head$484.hasPrototype(Keyword$300) && stxIsUnaryOp$322(keyword$492)) {
                    var unopRes$551 = enforest$326(rest$485, context$482);
                    if (unopRes$551.result.hasPrototype(Expr$288)) {
                        return step$483(UnaryOp$296.create(keyword$492, unopRes$551.result), unopRes$551.rest);
                    }
                } else if (head$484.hasPrototype(Expr$288) && rest$485[0] && (rest$485[0].token.value === '++' || rest$485[0].token.value === '--')) {
                    return step$483(PostfixOp$297.create(head$484, rest$485[0]), rest$485.slice(1));
                } else if (head$484.hasPrototype(Expr$288) && rest$485[0] && rest$485[0].token.value === '[]') {
                    return step$483(ObjGet$313.create(head$484, Delimiter$302.create(rest$485[0].expose())), rest$485.slice(1));
                } else if (head$484.hasPrototype(Expr$288) && rest$485[0] && rest$485[0].token.value === '.' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Identifier) {
                    return step$483(ObjDotGet$312.create(head$484, rest$485[0], rest$485[1]), rest$485.slice(2));
                } else if (head$484.hasPrototype(Delimiter$302) && delim$494.token.value === '[]') {
                    return step$483(ArrayLiteral$294.create(head$484), rest$485);
                } else if (head$484.hasPrototype(Delimiter$302) && head$484.delim.token.value === '{}') {
                    return step$483(Block$293.create(head$484), rest$485);
                } else if (head$484.hasPrototype(Id$303) && id$496.token.value === '#quoteSyntax' && rest$485[0] && rest$485[0].token.value === '{}') {
                    var tempId$552 = fresh$282();
                    context$482.templateMap.set(tempId$552, rest$485[0].token.inner);
                    return step$483(syn$168.makeIdent('getTemplate', id$496), [syn$168.makeDelim('()', [syn$168.makeValue(tempId$552, id$496)], id$496)].concat(rest$485.slice(1)));
                } else if (head$484.hasPrototype(Keyword$300) && keyword$492.token.value === 'let' && (rest$485[0] && rest$485[0].token.type === parser$167.Token.Identifier || rest$485[0] && rest$485[0].token.type === parser$167.Token.Keyword || rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator) && rest$485[1] && rest$485[1].token.value === '=' && rest$485[2] && rest$485[2].token.value === 'macro') {
                    var mac$553 = enforest$326(rest$485.slice(2), context$482);
                    if (!mac$553.result.hasPrototype(AnonMacro$309)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$553.result);
                    }
                    return step$483(LetMacro$307.create(rest$485[0], mac$553.result.body), mac$553.rest);
                } else if (head$484.hasPrototype(Keyword$300) && keyword$492.token.value === 'var' && rest$485[0]) {
                    var vsRes$554 = enforestVarStatement$324(rest$485, context$482);
                    if (vsRes$554) {
                        return step$483(VariableStatement$315.create(head$484, vsRes$554.result), vsRes$554.rest);
                    }
                } else if (head$484.hasPrototype(Keyword$300) && keyword$492.token.value === 'let' && rest$485[0]) {
                    var vsRes$554 = enforestVarStatement$324(rest$485, context$482);
                    if (vsRes$554) {
                        return step$483(LetStatement$316.create(head$484, vsRes$554.result), vsRes$554.rest);
                    }
                } else if (head$484.hasPrototype(Keyword$300) && keyword$492.token.value === 'const' && rest$485[0]) {
                    var vsRes$554 = enforestVarStatement$324(rest$485, context$482);
                    if (vsRes$554) {
                        return step$483(ConstStatement$317.create(head$484, vsRes$554.result), vsRes$554.rest);
                    }
                }
            } else {
                parser$167.assert(head$484 && head$484.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$484.token.type === parser$167.Token.Identifier || head$484.token.type === parser$167.Token.Keyword || head$484.token.type === parser$167.Token.Punctuator) && context$482.env.has(resolve$276(head$484))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$555 = fresh$282();
                    var transformerContext$556 = makeExpanderContext$335(_$166.defaults({ mark: newMark$555 }, context$482));
                    // pull the macro transformer out the environment
                    var transformer$557 = context$482.env.get(resolve$276(head$484)).fn;
                    // apply the transformer
                    try {
                        var rt$558 = transformer$557([head$484].concat(rest$485), transformerContext$556);
                    } catch (e$559) {
                        if (e$559.type && e$559.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$560 = '`' + rest$485.slice(0, 5).map(function (stx$561) {
                                    return stx$561.token.value;
                                }).join(' ') + '...`';
                            syn$168.throwSyntaxError('macro', 'Macro `' + head$484.token.value + '` could not be matched with ' + argumentString$560, head$484);
                        } else {
                            // just rethrow it
                            throw e$559;
                        }
                    }
                    if (!Array.isArray(rt$558.result)) {
                        throwError$263('Macro transformer must return a result array, not: ' + rt$558.result);
                    }
                    if (rt$558.result.length > 0) {
                        var adjustedResult$562 = adjustLineContext$325(rt$558.result, head$484);
                        adjustedResult$562[0].token.leadingComments = head$484.token.leadingComments;
                        return step$483(adjustedResult$562[0], adjustedResult$562.slice(1).concat(rt$558.rest));
                    } else {
                        return step$483(Empty$320.create(), rt$558.rest);
                    }
                }    // anon macro definition
                else if (head$484.token.type === parser$167.Token.Identifier && head$484.token.value === 'macro' && rest$485[0] && rest$485[0].token.value === '{}') {
                    return step$483(AnonMacro$309.create(rest$485[0].expose().token.inner), rest$485.slice(1));
                }    // macro definition
                else if (head$484.token.type === parser$167.Token.Identifier && head$484.token.value === 'macro' && rest$485[0] && (rest$485[0].token.type === parser$167.Token.Identifier || rest$485[0].token.type === parser$167.Token.Keyword || rest$485[0].token.type === parser$167.Token.Punctuator) && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '{}') {
                    return step$483(Macro$308.create(rest$485[0], rest$485[1].expose().token.inner), rest$485.slice(2));
                }    // module definition
                else if (head$484.token.value === 'module' && rest$485[0] && rest$485[0].token.value === '{}') {
                    return step$483(Module$319.create(rest$485[0]), rest$485.slice(1));
                }    // function definition
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'function' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Identifier && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '()' && rest$485[2] && rest$485[2].token.type === parser$167.Token.Delimiter && rest$485[2].token.value === '{}') {
                    rest$485[1].token.inner = rest$485[1].expose().token.inner;
                    rest$485[2].token.inner = rest$485[2].expose().token.inner;
                    return step$483(NamedFun$304.create(head$484, null, rest$485[0], rest$485[1], rest$485[2]), rest$485.slice(3));
                }    // generator function definition
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'function' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator && rest$485[0].token.value === '*' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Identifier && rest$485[2] && rest$485[2].token.type === parser$167.Token.Delimiter && rest$485[2].token.value === '()' && rest$485[3] && rest$485[3].token.type === parser$167.Token.Delimiter && rest$485[3].token.value === '{}') {
                    rest$485[2].token.inner = rest$485[2].expose().token.inner;
                    rest$485[3].token.inner = rest$485[3].expose().token.inner;
                    return step$483(NamedFun$304.create(head$484, rest$485[0], rest$485[1], rest$485[2], rest$485[3]), rest$485.slice(4));
                }    // anonymous function definition
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'function' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Delimiter && rest$485[0].token.value === '()' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '{}') {
                    rest$485[0].token.inner = rest$485[0].expose().token.inner;
                    rest$485[1].token.inner = rest$485[1].expose().token.inner;
                    return step$483(AnonFun$305.create(head$484, null, rest$485[0], rest$485[1]), rest$485.slice(2));
                }    // anonymous generator function definition
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'function' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator && rest$485[0].token.value === '*' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '()' && rest$485[2] && rest$485[2].token.type === parser$167.Token.Delimiter && rest$485[2].token.value === '{}') {
                    rest$485[1].token.inner = rest$485[1].expose().token.inner;
                    rest$485[2].token.inner = rest$485[2].expose().token.inner;
                    return step$483(AnonFun$305.create(head$484, rest$485[0], rest$485[1], rest$485[2]), rest$485.slice(3));
                }    // arrow function
                else if ((head$484.token.type === parser$167.Token.Delimiter && head$484.token.value === '()' || head$484.token.type === parser$167.Token.Identifier) && rest$485[0] && rest$485[0].token.type === parser$167.Token.Punctuator && rest$485[0].token.value === '=>' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '{}') {
                    return step$483(ArrowFun$306.create(head$484, rest$485[0], rest$485[1]), rest$485.slice(2));
                }    // catch statement
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'catch' && rest$485[0] && rest$485[0].token.type === parser$167.Token.Delimiter && rest$485[0].token.value === '()' && rest$485[1] && rest$485[1].token.type === parser$167.Token.Delimiter && rest$485[1].token.value === '{}') {
                    rest$485[0].token.inner = rest$485[0].expose().token.inner;
                    rest$485[1].token.inner = rest$485[1].expose().token.inner;
                    return step$483(CatchClause$318.create(head$484, rest$485[0], rest$485[1]), rest$485.slice(2));
                }    // this expression
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'this') {
                    return step$483(ThisExpression$290.create(head$484), rest$485);
                }    // literal
                else if (head$484.token.type === parser$167.Token.NumericLiteral || head$484.token.type === parser$167.Token.StringLiteral || head$484.token.type === parser$167.Token.BooleanLiteral || head$484.token.type === parser$167.Token.RegularExpression || head$484.token.type === parser$167.Token.NullLiteral) {
                    return step$483(Lit$291.create(head$484), rest$485);
                }    // export
                else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'export' && rest$485[0] && (rest$485[0].token.type === parser$167.Token.Identifier || rest$485[0].token.type === parser$167.Token.Keyword || rest$485[0].token.type === parser$167.Token.Punctuator)) {
                    return step$483(Export$321.create(rest$485[0]), rest$485.slice(1));
                }    // identifier
                else if (head$484.token.type === parser$167.Token.Identifier) {
                    return step$483(Id$303.create(head$484), rest$485);
                }    // punctuator
                else if (head$484.token.type === parser$167.Token.Punctuator) {
                    return step$483(Punc$301.create(head$484), rest$485);
                } else if (head$484.token.type === parser$167.Token.Keyword && head$484.token.value === 'with') {
                    throwError$263('with is not supported in sweet.js');
                }    // keyword
                else if (head$484.token.type === parser$167.Token.Keyword) {
                    return step$483(Keyword$300.create(head$484), rest$485);
                }    // Delimiter
                else if (head$484.token.type === parser$167.Token.Delimiter) {
                    return step$483(Delimiter$302.create(head$484.expose()), rest$485);
                }    // end of file
                else if (head$484.token.type === parser$167.Token.EOF) {
                    parser$167.assert(rest$485.length === 0, 'nothing should be after an EOF');
                    return step$483(EOF$286.create(head$484), []);
                } else {
                    // todo: are we missing cases?
                    parser$167.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$484,
                rest: rest$485
            };
        }
        return step$483(toks$481[0], toks$481.slice(1));
    }
    function get_expression$327(stx$563, context$564) {
        var res$565 = enforest$326(stx$563, context$564);
        if (!res$565.result.hasPrototype(Expr$288)) {
            return {
                result: null,
                rest: stx$563
            };
        }
        return res$565;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$328(newMark$566, env$567) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$568(match$569) {
            if (match$569.level === 0) {
                // replace the match property with the marked syntax
                match$569.match = _$166.map(match$569.match, function (stx$570) {
                    return stx$570.mark(newMark$566);
                });
            } else {
                _$166.each(match$569.match, function (match$571) {
                    dfs$568(match$571);
                });
            }
        }
        _$166.keys(env$567).forEach(function (key$572) {
            dfs$568(env$567[key$572]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$329(mac$573, context$574) {
        var body$575 = mac$573.body;
        // raw function primitive form
        if (!(body$575[0] && body$575[0].token.type === parser$167.Token.Keyword && body$575[0].token.value === 'function')) {
            throwError$263('Primitive macro form must contain a function for the macro body');
        }
        var stub$576 = parser$167.read('()');
        stub$576[0].token.inner = body$575;
        var expanded$577 = expand$334(stub$576, context$574);
        expanded$577 = expanded$577[0].destruct().concat(expanded$577[1].eof);
        var flattend$578 = flatten$337(expanded$577);
        var bodyCode$579 = codegen$173.generate(parser$167.parse(flattend$578));
        var macroFn$580 = scopedEval$264(bodyCode$579, {
                makeValue: syn$168.makeValue,
                makeRegex: syn$168.makeRegex,
                makeIdent: syn$168.makeIdent,
                makeKeyword: syn$168.makeKeyword,
                makePunc: syn$168.makePunc,
                makeDelim: syn$168.makeDelim,
                unwrapSyntax: syn$168.unwrapSyntax,
                throwSyntaxError: syn$168.throwSyntaxError,
                parser: parser$167,
                _: _$166,
                patternModule: patternModule$171,
                getTemplate: function (id$581) {
                    return cloneSyntaxArray$330(context$574.templateMap.get(id$581));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$328,
                mergeMatches: function (newMatch$582, oldMatch$583) {
                    newMatch$582.patternEnv = _$166.extend({}, oldMatch$583.patternEnv, newMatch$582.patternEnv);
                    return newMatch$582;
                }
            });
        return macroFn$580;
    }
    function cloneSyntaxArray$330(arr$584) {
        return arr$584.map(function (stx$585) {
            var o$586 = syntaxFromToken$272(_$166.clone(stx$585.token), stx$585);
            if (o$586.token.type === parser$167.Token.Delimiter) {
                o$586.token.inner = cloneSyntaxArray$330(o$586.token.inner);
            }
            return o$586;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$331(stx$587, context$588) {
        parser$167.assert(context$588, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$587.length === 0) {
            return {
                terms: [],
                context: context$588
            };
        }
        parser$167.assert(stx$587[0].token, 'expecting a syntax object');
        var f$589 = enforest$326(stx$587, context$588);
        // head :: TermTree
        var head$590 = f$589.result;
        // rest :: [Syntax]
        var rest$591 = f$589.rest;
        if (head$590.hasPrototype(Macro$308)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$593 = loadMacroDef$329(head$590, context$588);
            addToDefinitionCtx$332([head$590.name], context$588.defscope, false);
            context$588.env.set(resolve$276(head$590.name), { fn: macroDefinition$593 });
            return expandToTermTree$331(rest$591, context$588);
        }
        if (head$590.hasPrototype(LetMacro$307)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$593 = loadMacroDef$329(head$590, context$588);
            var freshName$594 = fresh$282();
            var renamedName$595 = head$590.name.rename(head$590.name, freshName$594);
            rest$591 = _$166.map(rest$591, function (stx$596) {
                return stx$596.rename(head$590.name, freshName$594);
            });
            head$590.name = renamedName$595;
            context$588.env.set(resolve$276(head$590.name), { fn: macroDefinition$593 });
            return expandToTermTree$331(rest$591, context$588);
        }
        if (head$590.hasPrototype(LetStatement$316) || head$590.hasPrototype(ConstStatement$317)) {
            head$590.decls.forEach(function (decl$597) {
                var freshName$598 = fresh$282();
                var renamedDecl$599 = decl$597.ident.rename(decl$597.ident, freshName$598);
                rest$591 = rest$591.map(function (stx$600) {
                    return stx$600.rename(decl$597.ident, freshName$598);
                });
                decl$597.ident = renamedDecl$599;
            });
        }
        if (head$590.hasPrototype(NamedFun$304)) {
            addToDefinitionCtx$332([head$590.name], context$588.defscope, true);
        }
        if (head$590.hasPrototype(VariableStatement$315)) {
            addToDefinitionCtx$332(_$166.map(head$590.decls, function (decl$601) {
                return decl$601.ident;
            }), context$588.defscope, true);
        }
        if (head$590.hasPrototype(Block$293) && head$590.body.hasPrototype(Delimiter$302)) {
            head$590.body.delim.token.inner.forEach(function (term$602) {
                if (term$602.hasPrototype(VariableStatement$315)) {
                    addToDefinitionCtx$332(_$166.map(term$602.decls, function (decl$603) {
                        return decl$603.ident;
                    }), context$588.defscope, true);
                }
            });
        }
        if (head$590.hasPrototype(Delimiter$302)) {
            head$590.delim.token.inner.forEach(function (term$604) {
                if (term$604.hasPrototype(VariableStatement$315)) {
                    addToDefinitionCtx$332(_$166.map(term$604.decls, function (decl$605) {
                        return decl$605.ident;
                    }), context$588.defscope, true);
                }
            });
        }
        var trees$592 = expandToTermTree$331(rest$591, context$588);
        return {
            terms: [head$590].concat(trees$592.terms),
            context: trees$592.context
        };
    }
    function addToDefinitionCtx$332(idents$606, defscope$607, skipRep$608) {
        parser$167.assert(idents$606 && idents$606.length > 0, 'expecting some variable identifiers');
        skipRep$608 = skipRep$608 || false;
        _$166.each(idents$606, function (id$609) {
            var skip$610 = false;
            if (skipRep$608) {
                var declRepeat$611 = _$166.find(defscope$607, function (def$612) {
                        return def$612.id.token.value === id$609.token.value && arraysEqual$277(marksof$275(def$612.id.context), marksof$275(id$609.context));
                    });
                skip$610 = typeof declRepeat$611 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$610) {
                var name$613 = fresh$282();
                defscope$607.push({
                    id: id$609,
                    name: name$613
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$333(term$614, context$615) {
        parser$167.assert(context$615 && context$615.env, 'environment map is required');
        if (term$614.hasPrototype(ArrayLiteral$294)) {
            term$614.array.delim.token.inner = expand$334(term$614.array.delim.expose().token.inner, context$615);
            return term$614;
        } else if (term$614.hasPrototype(Block$293)) {
            term$614.body.delim.token.inner = expand$334(term$614.body.delim.expose().token.inner, context$615);
            return term$614;
        } else if (term$614.hasPrototype(ParenExpression$295)) {
            term$614.expr.delim.token.inner = expand$334(term$614.expr.delim.expose().token.inner, context$615);
            return term$614;
        } else if (term$614.hasPrototype(Call$311)) {
            term$614.fun = expandTermTreeToFinal$333(term$614.fun, context$615);
            term$614.args = _$166.map(term$614.args, function (arg$616) {
                return expandTermTreeToFinal$333(arg$616, context$615);
            });
            return term$614;
        } else if (term$614.hasPrototype(UnaryOp$296)) {
            term$614.expr = expandTermTreeToFinal$333(term$614.expr, context$615);
            return term$614;
        } else if (term$614.hasPrototype(BinOp$298)) {
            term$614.left = expandTermTreeToFinal$333(term$614.left, context$615);
            term$614.right = expandTermTreeToFinal$333(term$614.right, context$615);
            return term$614;
        } else if (term$614.hasPrototype(ObjGet$313)) {
            term$614.right.delim.token.inner = expand$334(term$614.right.delim.expose().token.inner, context$615);
            return term$614;
        } else if (term$614.hasPrototype(ObjDotGet$312)) {
            term$614.left = expandTermTreeToFinal$333(term$614.left, context$615);
            term$614.right = expandTermTreeToFinal$333(term$614.right, context$615);
            return term$614;
        } else if (term$614.hasPrototype(VariableDeclaration$314)) {
            if (term$614.init) {
                term$614.init = expandTermTreeToFinal$333(term$614.init, context$615);
            }
            return term$614;
        } else if (term$614.hasPrototype(VariableStatement$315)) {
            term$614.decls = _$166.map(term$614.decls, function (decl$617) {
                return expandTermTreeToFinal$333(decl$617, context$615);
            });
            return term$614;
        } else if (term$614.hasPrototype(Delimiter$302)) {
            // expand inside the delimiter and then continue on
            term$614.delim.token.inner = expand$334(term$614.delim.expose().token.inner, context$615);
            return term$614;
        } else if (term$614.hasPrototype(NamedFun$304) || term$614.hasPrototype(AnonFun$305) || term$614.hasPrototype(CatchClause$318) || term$614.hasPrototype(ArrowFun$306) || term$614.hasPrototype(Module$319)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$618 = [];
            var bodyContext$619 = makeExpanderContext$335(_$166.defaults({ defscope: newDef$618 }, context$615));
            var paramSingleIdent$620 = term$614.params && term$614.params.token.type === parser$167.Token.Identifier;
            if (term$614.params && term$614.params.token.type === parser$167.Token.Delimiter) {
                var params$627 = term$614.params.expose();
            } else if (paramSingleIdent$620) {
                var params$627 = term$614.params;
            } else {
                var params$627 = syn$168.makeDelim('()', [], null);
            }
            if (Array.isArray(term$614.body)) {
                var bodies$628 = syn$168.makeDelim('{}', term$614.body, null);
            } else {
                var bodies$628 = term$614.body;
            }
            bodies$628 = bodies$628.addDefCtx(newDef$618);
            var paramNames$621 = _$166.map(getParamIdentifiers$284(params$627), function (param$629) {
                    var freshName$630 = fresh$282();
                    return {
                        freshName: freshName$630,
                        originalParam: param$629,
                        renamedParam: param$629.rename(param$629, freshName$630)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$622 = _$166.reduce(paramNames$621, function (accBody$631, p$632) {
                    return accBody$631.rename(p$632.originalParam, p$632.freshName);
                }, bodies$628);
            renamedBody$622 = renamedBody$622.expose();
            var expandedResult$623 = expandToTermTree$331(renamedBody$622.token.inner, bodyContext$619);
            var bodyTerms$624 = expandedResult$623.terms;
            var renamedParams$625 = _$166.map(paramNames$621, function (p$633) {
                    return p$633.renamedParam;
                });
            if (paramSingleIdent$620) {
                var flatArgs$634 = renamedParams$625[0];
            } else {
                var flatArgs$634 = syn$168.makeDelim('()', joinSyntax$273(renamedParams$625, ','), term$614.params);
            }
            var expandedArgs$626 = expand$334([flatArgs$634], bodyContext$619);
            parser$167.assert(expandedArgs$626.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$614.params) {
                term$614.params = expandedArgs$626[0];
            }
            bodyTerms$624 = _$166.map(bodyTerms$624, function (bodyTerm$635) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$636 = bodyTerm$635.addDefCtx(newDef$618);
                // finish expansion
                return expandTermTreeToFinal$333(termWithCtx$636, expandedResult$623.context);
            });
            if (term$614.hasPrototype(Module$319)) {
                bodyTerms$624 = _$166.filter(bodyTerms$624, function (bodyTerm$637) {
                    if (bodyTerm$637.hasPrototype(Export$321)) {
                        term$614.exports.push(bodyTerm$637);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$622.token.inner = bodyTerms$624;
            if (Array.isArray(term$614.body)) {
                term$614.body = renamedBody$622.token.inner;
            } else {
                term$614.body = renamedBody$622;
            }
            // and continue expand the rest
            return term$614;
        }
        // the term is fine as is
        return term$614;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$334(stx$638, context$639) {
        parser$167.assert(context$639, 'must provide an expander context');
        var trees$640 = expandToTermTree$331(stx$638, context$639);
        return _$166.map(trees$640.terms, function (term$641) {
            return expandTermTreeToFinal$333(term$641, trees$640.context);
        });
    }
    function makeExpanderContext$335(o$642) {
        o$642 = o$642 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$642.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$642.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$642.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$642.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$336(stx$643, builtinSource$644) {
        var env$645 = new Map();
        var params$646 = [];
        var context$647, builtInContext$648 = makeExpanderContext$335({ env: env$645 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$644) {
            var builtinRead$651 = parser$167.read(builtinSource$644);
            builtinRead$651 = [
                syn$168.makeIdent('module', null),
                syn$168.makeDelim('{}', builtinRead$651, null)
            ];
            var builtinRes$652 = expand$334(builtinRead$651, builtInContext$648);
            params$646 = _$166.map(builtinRes$652[0].exports, function (term$653) {
                return {
                    oldExport: term$653.name,
                    newParam: syn$168.makeIdent(term$653.name.token.value, null)
                };
            });
        }
        var modBody$649 = syn$168.makeDelim('{}', stx$643, null);
        modBody$649 = _$166.reduce(params$646, function (acc$654, param$655) {
            var newName$656 = fresh$282();
            env$645.set(resolve$276(param$655.newParam.rename(param$655.newParam, newName$656)), env$645.get(resolve$276(param$655.oldExport)));
            return acc$654.rename(param$655.newParam, newName$656);
        }, modBody$649);
        context$647 = makeExpanderContext$335({ env: env$645 });
        var res$650 = expand$334([
                syn$168.makeIdent('module', null),
                modBody$649
            ], context$647);
        res$650 = res$650[0].destruct();
        return flatten$337(res$650[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$337(stx$657) {
        return _$166.reduce(stx$657, function (acc$658, stx$659) {
            if (stx$659.token.type === parser$167.Token.Delimiter) {
                var exposed$660 = stx$659.expose();
                var openParen$661 = syntaxFromToken$272({
                        type: parser$167.Token.Punctuator,
                        value: stx$659.token.value[0],
                        range: stx$659.token.startRange,
                        sm_range: typeof stx$659.token.sm_startRange == 'undefined' ? stx$659.token.startRange : stx$659.token.sm_startRange,
                        lineNumber: stx$659.token.startLineNumber,
                        sm_lineNumber: typeof stx$659.token.sm_startLineNumber == 'undefined' ? stx$659.token.startLineNumber : stx$659.token.sm_startLineNumber,
                        lineStart: stx$659.token.startLineStart,
                        sm_lineStart: typeof stx$659.token.sm_startLineStart == 'undefined' ? stx$659.token.startLineStart : stx$659.token.sm_startLineStart
                    }, exposed$660);
                var closeParen$662 = syntaxFromToken$272({
                        type: parser$167.Token.Punctuator,
                        value: stx$659.token.value[1],
                        range: stx$659.token.endRange,
                        sm_range: typeof stx$659.token.sm_endRange == 'undefined' ? stx$659.token.endRange : stx$659.token.sm_endRange,
                        lineNumber: stx$659.token.endLineNumber,
                        sm_lineNumber: typeof stx$659.token.sm_endLineNumber == 'undefined' ? stx$659.token.endLineNumber : stx$659.token.sm_endLineNumber,
                        lineStart: stx$659.token.endLineStart,
                        sm_lineStart: typeof stx$659.token.sm_endLineStart == 'undefined' ? stx$659.token.endLineStart : stx$659.token.sm_endLineStart
                    }, exposed$660);
                if (stx$659.token.leadingComments) {
                    openParen$661.token.leadingComments = stx$659.token.leadingComments;
                }
                if (stx$659.token.trailingComments) {
                    openParen$661.token.trailingComments = stx$659.token.trailingComments;
                }
                return acc$658.concat(openParen$661).concat(flatten$337(exposed$660.token.inner)).concat(closeParen$662);
            }
            stx$659.token.sm_lineNumber = stx$659.token.sm_lineNumber ? stx$659.token.sm_lineNumber : stx$659.token.lineNumber;
            stx$659.token.sm_lineStart = stx$659.token.sm_lineStart ? stx$659.token.sm_lineStart : stx$659.token.lineStart;
            stx$659.token.sm_range = stx$659.token.sm_range ? stx$659.token.sm_range : stx$659.token.range;
            return acc$658.concat(stx$659);
        }, []);
    }
    exports$165.enforest = enforest$326;
    exports$165.expand = expandTopLevel$336;
    exports$165.resolve = resolve$276;
    exports$165.get_expression = get_expression$327;
    exports$165.makeExpanderContext = makeExpanderContext$335;
    exports$165.Expr = Expr$288;
    exports$165.VariableStatement = VariableStatement$315;
    exports$165.tokensToSyntax = syn$168.tokensToSyntax;
    exports$165.syntaxToTokens = syn$168.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map