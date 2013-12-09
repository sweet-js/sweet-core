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
    function enforestVarStatement$324(stx$467, context$468, isLet$469) {
        var decls$470 = [];
        var res$471 = enforest$326(stx$467, context$468);
        var result$472 = res$471.result;
        var rest$473 = res$471.rest;
        if (rest$473[0]) {
            if (isLet$469 && result$472.hasPrototype(Id$303)) {
                var freshName$475 = fresh$282();
                var renamedId$476 = result$472.id.rename(result$472.id, freshName$475);
                rest$473 = rest$473.map(function (stx$477) {
                    return stx$477.rename(result$472.id, freshName$475);
                });
                result$472.id = renamedId$476;
            }
            var nextRes$474 = enforest$326(rest$473, context$468);
            // x = ...
            if (nextRes$474.result.hasPrototype(Punc$301) && nextRes$474.result.punc.token.value === '=') {
                var initializerRes$478 = enforest$326(nextRes$474.rest, context$468);
                // x = y + z, ...
                if (initializerRes$478.rest[0] && initializerRes$478.rest[0].token.value === ',') {
                    decls$470.push(VariableDeclaration$314.create(result$472.id, nextRes$474.result.punc, initializerRes$478.result, initializerRes$478.rest[0]));
                    var subRes$479 = enforestVarStatement$324(initializerRes$478.rest.slice(1), context$468, isLet$469);
                    decls$470 = decls$470.concat(subRes$479.result);
                    rest$473 = subRes$479.rest;
                }    // x = y ...
                else {
                    decls$470.push(VariableDeclaration$314.create(result$472.id, nextRes$474.result.punc, initializerRes$478.result));
                    rest$473 = initializerRes$478.rest;
                }
            }    // x ,...;
            else if (nextRes$474.result.hasPrototype(Punc$301) && nextRes$474.result.punc.token.value === ',') {
                decls$470.push(VariableDeclaration$314.create(result$472.id, null, null, nextRes$474.result.punc));
                var subRes$479 = enforestVarStatement$324(nextRes$474.rest, context$468, isLet$469);
                decls$470 = decls$470.concat(subRes$479.result);
                rest$473 = subRes$479.rest;
            } else {
                if (result$472.hasPrototype(Id$303)) {
                    decls$470.push(VariableDeclaration$314.create(result$472.id));
                } else {
                    throwError$263('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$472.hasPrototype(Id$303)) {
                decls$470.push(VariableDeclaration$314.create(result$472.id));
            } else if (result$472.hasPrototype(BinOp$298) && result$472.op.token.value === 'in') {
                decls$470.push(VariableDeclaration$314.create(result$472.left.id, result$472.op, result$472.right));
            } else {
                throwError$263('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$470,
            rest: rest$473
        };
    }
    function adjustLineContext$325(stx$480, original$481, current$482) {
        current$482 = current$482 || {
            lastLineNumber: original$481.token.lineNumber,
            lineNumber: original$481.token.lineNumber - 1
        };
        return _$166.map(stx$480, function (stx$483) {
            if (stx$483.token.type === parser$167.Token.Delimiter) {
                // handle tokens with missing line info
                stx$483.token.startLineNumber = typeof stx$483.token.startLineNumber == 'undefined' ? original$481.token.lineNumber : stx$483.token.startLineNumber;
                stx$483.token.endLineNumber = typeof stx$483.token.endLineNumber == 'undefined' ? original$481.token.lineNumber : stx$483.token.endLineNumber;
                stx$483.token.startLineStart = typeof stx$483.token.startLineStart == 'undefined' ? original$481.token.lineStart : stx$483.token.startLineStart;
                stx$483.token.endLineStart = typeof stx$483.token.endLineStart == 'undefined' ? original$481.token.lineStart : stx$483.token.endLineStart;
                stx$483.token.startRange = typeof stx$483.token.startRange == 'undefined' ? original$481.token.range : stx$483.token.startRange;
                stx$483.token.endRange = typeof stx$483.token.endRange == 'undefined' ? original$481.token.range : stx$483.token.endRange;
                stx$483.token.sm_startLineNumber = typeof stx$483.token.sm_startLineNumber == 'undefined' ? stx$483.token.startLineNumber : stx$483.token.sm_startLineNumber;
                stx$483.token.sm_endLineNumber = typeof stx$483.token.sm_endLineNumber == 'undefined' ? stx$483.token.endLineNumber : stx$483.token.sm_endLineNumber;
                stx$483.token.sm_startLineStart = typeof stx$483.token.sm_startLineStart == 'undefined' ? stx$483.token.startLineStart : stx$483.token.sm_startLineStart;
                stx$483.token.sm_endLineStart = typeof stx$483.token.sm_endLineStart == 'undefined' ? stx$483.token.endLineStart : stx$483.token.sm_endLineStart;
                stx$483.token.sm_startRange = typeof stx$483.token.sm_startRange == 'undefined' ? stx$483.token.startRange : stx$483.token.sm_startRange;
                stx$483.token.sm_endRange = typeof stx$483.token.sm_endRange == 'undefined' ? stx$483.token.endRange : stx$483.token.sm_endRange;
                if (stx$483.token.startLineNumber === current$482.lastLineNumber && current$482.lastLineNumber !== current$482.lineNumber) {
                    stx$483.token.startLineNumber = current$482.lineNumber;
                } else if (stx$483.token.startLineNumber !== current$482.lastLineNumber) {
                    current$482.lineNumber++;
                    current$482.lastLineNumber = stx$483.token.startLineNumber;
                    stx$483.token.startLineNumber = current$482.lineNumber;
                }
                if (stx$483.token.inner.length > 0) {
                    stx$483.token.inner = adjustLineContext$325(stx$483.token.inner, original$481, current$482);
                }
                return stx$483;
            }
            // handle tokens with missing line info
            stx$483.token.lineNumber = typeof stx$483.token.lineNumber == 'undefined' ? original$481.token.lineNumber : stx$483.token.lineNumber;
            stx$483.token.lineStart = typeof stx$483.token.lineStart == 'undefined' ? original$481.token.lineStart : stx$483.token.lineStart;
            stx$483.token.range = typeof stx$483.token.range == 'undefined' ? original$481.token.range : stx$483.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$483.token.sm_lineNumber = typeof stx$483.token.sm_lineNumber == 'undefined' ? stx$483.token.lineNumber : stx$483.token.sm_lineNumber;
            stx$483.token.sm_lineStart = typeof stx$483.token.sm_lineStart == 'undefined' ? stx$483.token.lineStart : stx$483.token.sm_lineStart;
            stx$483.token.sm_range = typeof stx$483.token.sm_range == 'undefined' ? _$166.clone(stx$483.token.range) : stx$483.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$483.token.lineNumber === current$482.lastLineNumber && current$482.lastLineNumber !== current$482.lineNumber) {
                stx$483.token.lineNumber = current$482.lineNumber;
            } else if (stx$483.token.lineNumber !== current$482.lastLineNumber) {
                current$482.lineNumber++;
                current$482.lastLineNumber = stx$483.token.lineNumber;
                stx$483.token.lineNumber = current$482.lineNumber;
            }
            return stx$483;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$326(toks$484, context$485) {
        parser$167.assert(toks$484.length > 0, 'enforest assumes there are tokens to work with');
        function step$486(head$487, rest$488) {
            var innerTokens$489;
            parser$167.assert(Array.isArray(rest$488), 'result must at least be an empty array');
            if (head$487.hasPrototype(TermTree$285)) {
                // function call
                var emp$492 = head$487.emp;
                var emp$492 = head$487.emp;
                var keyword$495 = head$487.keyword;
                var delim$497 = head$487.delim;
                var id$499 = head$487.id;
                var delim$497 = head$487.delim;
                var emp$492 = head$487.emp;
                var punc$503 = head$487.punc;
                var keyword$495 = head$487.keyword;
                var emp$492 = head$487.emp;
                var emp$492 = head$487.emp;
                var emp$492 = head$487.emp;
                var delim$497 = head$487.delim;
                var delim$497 = head$487.delim;
                var id$499 = head$487.id;
                var keyword$495 = head$487.keyword;
                var keyword$495 = head$487.keyword;
                var keyword$495 = head$487.keyword;
                var keyword$495 = head$487.keyword;
                if (head$487.hasPrototype(Expr$288) && rest$488[0] && rest$488[0].token.type === parser$167.Token.Delimiter && rest$488[0].token.value === '()') {
                    var argRes$536, enforestedArgs$537 = [], commas$538 = [];
                    rest$488[0].expose();
                    innerTokens$489 = rest$488[0].token.inner;
                    while (innerTokens$489.length > 0) {
                        argRes$536 = enforest$326(innerTokens$489, context$485);
                        enforestedArgs$537.push(argRes$536.result);
                        innerTokens$489 = argRes$536.rest;
                        if (innerTokens$489[0] && innerTokens$489[0].token.value === ',') {
                            // record the comma for later
                            commas$538.push(innerTokens$489[0]);
                            // but dump it for the next loop turn
                            innerTokens$489 = innerTokens$489.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$539 = _$166.all(enforestedArgs$537, function (argTerm$540) {
                            return argTerm$540.hasPrototype(Expr$288);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$489.length === 0 && argsAreExprs$539) {
                        return step$486(Call$311.create(head$487, enforestedArgs$537, rest$488[0], commas$538), rest$488.slice(1));
                    }
                } else if (head$487.hasPrototype(Expr$288) && rest$488[0] && rest$488[0].token.value === '?') {
                    var question$541 = rest$488[0];
                    var condRes$542 = enforest$326(rest$488.slice(1), context$485);
                    var truExpr$543 = condRes$542.result;
                    var right$544 = condRes$542.rest;
                    if (truExpr$543.hasPrototype(Expr$288) && right$544[0] && right$544[0].token.value === ':') {
                        var colon$545 = right$544[0];
                        var flsRes$546 = enforest$326(right$544.slice(1), context$485);
                        var flsExpr$547 = flsRes$546.result;
                        if (flsExpr$547.hasPrototype(Expr$288)) {
                            return step$486(ConditionalExpression$299.create(head$487, question$541, truExpr$543, colon$545, flsExpr$547), flsRes$546.rest);
                        }
                    }
                } else if (head$487.hasPrototype(Keyword$300) && keyword$495.token.value === 'new' && rest$488[0]) {
                    var newCallRes$548 = enforest$326(rest$488, context$485);
                    if (newCallRes$548.result.hasPrototype(Call$311)) {
                        return step$486(Const$310.create(head$487, newCallRes$548.result), newCallRes$548.rest);
                    }
                } else if (head$487.hasPrototype(Delimiter$302) && delim$497.token.value === '()' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator && rest$488[0].token.value === '=>') {
                    var res$549 = enforest$326(rest$488.slice(1), context$485);
                    if (res$549.result.hasPrototype(Expr$288)) {
                        return step$486(ArrowFun$306.create(delim$497, rest$488[0], res$549.result.destruct()), res$549.rest);
                    } else {
                        throwError$263('Body of arrow function must be an expression');
                    }
                } else if (head$487.hasPrototype(Id$303) && rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator && rest$488[0].token.value === '=>') {
                    var res$549 = enforest$326(rest$488.slice(1), context$485);
                    if (res$549.result.hasPrototype(Expr$288)) {
                        return step$486(ArrowFun$306.create(id$499, rest$488[0], res$549.result.destruct()), res$549.rest);
                    } else {
                        throwError$263('Body of arrow function must be an expression');
                    }
                } else if (head$487.hasPrototype(Delimiter$302) && delim$497.token.value === '()') {
                    innerTokens$489 = delim$497.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$489.length === 0) {
                        return step$486(ParenExpression$295.create(head$487), rest$488);
                    } else {
                        var innerTerm$550 = get_expression$327(innerTokens$489, context$485);
                        if (innerTerm$550.result && innerTerm$550.result.hasPrototype(Expr$288)) {
                            return step$486(ParenExpression$295.create(head$487), rest$488);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$487.hasPrototype(Expr$288) && rest$488[0] && rest$488[1] && stxIsBinOp$323(rest$488[0])) {
                    var op$551 = rest$488[0];
                    var left$552 = head$487;
                    var bopRes$553 = enforest$326(rest$488.slice(1), context$485);
                    var right$544 = bopRes$553.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$544.hasPrototype(Expr$288)) {
                        return step$486(BinOp$298.create(op$551, left$552, right$544), bopRes$553.rest);
                    }
                } else if (head$487.hasPrototype(Punc$301) && stxIsUnaryOp$322(punc$503)) {
                    var unopRes$554 = enforest$326(rest$488, context$485);
                    if (unopRes$554.result.hasPrototype(Expr$288)) {
                        return step$486(UnaryOp$296.create(punc$503, unopRes$554.result), unopRes$554.rest);
                    }
                } else if (head$487.hasPrototype(Keyword$300) && stxIsUnaryOp$322(keyword$495)) {
                    var unopRes$554 = enforest$326(rest$488, context$485);
                    if (unopRes$554.result.hasPrototype(Expr$288)) {
                        return step$486(UnaryOp$296.create(keyword$495, unopRes$554.result), unopRes$554.rest);
                    }
                } else if (head$487.hasPrototype(Expr$288) && rest$488[0] && (rest$488[0].token.value === '++' || rest$488[0].token.value === '--')) {
                    return step$486(PostfixOp$297.create(head$487, rest$488[0]), rest$488.slice(1));
                } else if (head$487.hasPrototype(Expr$288) && rest$488[0] && rest$488[0].token.value === '[]') {
                    return step$486(ObjGet$313.create(head$487, Delimiter$302.create(rest$488[0].expose())), rest$488.slice(1));
                } else if (head$487.hasPrototype(Expr$288) && rest$488[0] && rest$488[0].token.value === '.' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Identifier) {
                    return step$486(ObjDotGet$312.create(head$487, rest$488[0], rest$488[1]), rest$488.slice(2));
                } else if (head$487.hasPrototype(Delimiter$302) && delim$497.token.value === '[]') {
                    return step$486(ArrayLiteral$294.create(head$487), rest$488);
                } else if (head$487.hasPrototype(Delimiter$302) && head$487.delim.token.value === '{}') {
                    return step$486(Block$293.create(head$487), rest$488);
                } else if (head$487.hasPrototype(Id$303) && id$499.token.value === '#quoteSyntax' && rest$488[0] && rest$488[0].token.value === '{}') {
                    var tempId$555 = fresh$282();
                    context$485.templateMap.set(tempId$555, rest$488[0].token.inner);
                    return step$486(syn$168.makeIdent('getTemplate', id$499), [syn$168.makeDelim('()', [syn$168.makeValue(tempId$555, id$499)], id$499)].concat(rest$488.slice(1)));
                } else if (head$487.hasPrototype(Keyword$300) && keyword$495.token.value === 'let' && (rest$488[0] && rest$488[0].token.type === parser$167.Token.Identifier || rest$488[0] && rest$488[0].token.type === parser$167.Token.Keyword || rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator) && rest$488[1] && rest$488[1].token.value === '=' && rest$488[2] && rest$488[2].token.value === 'macro') {
                    var mac$556 = enforest$326(rest$488.slice(2), context$485);
                    if (!mac$556.result.hasPrototype(AnonMacro$309)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$556.result);
                    }
                    return step$486(LetMacro$307.create(rest$488[0], mac$556.result.body), mac$556.rest);
                } else if (head$487.hasPrototype(Keyword$300) && keyword$495.token.value === 'var' && rest$488[0]) {
                    var vsRes$557 = enforestVarStatement$324(rest$488, context$485, false);
                    if (vsRes$557) {
                        return step$486(VariableStatement$315.create(head$487, vsRes$557.result), vsRes$557.rest);
                    }
                } else if (head$487.hasPrototype(Keyword$300) && keyword$495.token.value === 'let' && rest$488[0]) {
                    var vsRes$557 = enforestVarStatement$324(rest$488, context$485, true);
                    if (vsRes$557) {
                        return step$486(LetStatement$316.create(head$487, vsRes$557.result), vsRes$557.rest);
                    }
                } else if (head$487.hasPrototype(Keyword$300) && keyword$495.token.value === 'const' && rest$488[0]) {
                    var vsRes$557 = enforestVarStatement$324(rest$488, context$485, true);
                    if (vsRes$557) {
                        return step$486(ConstStatement$317.create(head$487, vsRes$557.result), vsRes$557.rest);
                    }
                }
            } else {
                parser$167.assert(head$487 && head$487.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$487.token.type === parser$167.Token.Identifier || head$487.token.type === parser$167.Token.Keyword || head$487.token.type === parser$167.Token.Punctuator) && context$485.env.has(resolve$276(head$487))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$558 = fresh$282();
                    var transformerContext$559 = makeExpanderContext$335(_$166.defaults({ mark: newMark$558 }, context$485));
                    // pull the macro transformer out the environment
                    var transformer$560 = context$485.env.get(resolve$276(head$487)).fn;
                    // apply the transformer
                    try {
                        var rt$561 = transformer$560([head$487].concat(rest$488), transformerContext$559);
                    } catch (e$562) {
                        if (e$562.type && e$562.type === 'SyntaxCaseError') {
                            // add a nicer error for syntax case
                            var argumentString$563 = '`' + rest$488.slice(0, 5).map(function (stx$564) {
                                    return stx$564.token.value;
                                }).join(' ') + '...`';
                            syn$168.throwSyntaxError('macro', 'Macro `' + head$487.token.value + '` could not be matched with ' + argumentString$563, head$487);
                        } else {
                            // just rethrow it
                            throw e$562;
                        }
                    }
                    if (!Array.isArray(rt$561.result)) {
                        throwError$263('Macro transformer must return a result array, not: ' + rt$561.result);
                    }
                    if (rt$561.result.length > 0) {
                        var adjustedResult$565 = adjustLineContext$325(rt$561.result, head$487);
                        adjustedResult$565[0].token.leadingComments = head$487.token.leadingComments;
                        return step$486(adjustedResult$565[0], adjustedResult$565.slice(1).concat(rt$561.rest));
                    } else {
                        return step$486(Empty$320.create(), rt$561.rest);
                    }
                }    // anon macro definition
                else if (head$487.token.type === parser$167.Token.Identifier && head$487.token.value === 'macro' && rest$488[0] && rest$488[0].token.value === '{}') {
                    return step$486(AnonMacro$309.create(rest$488[0].expose().token.inner), rest$488.slice(1));
                }    // macro definition
                else if (head$487.token.type === parser$167.Token.Identifier && head$487.token.value === 'macro' && rest$488[0] && (rest$488[0].token.type === parser$167.Token.Identifier || rest$488[0].token.type === parser$167.Token.Keyword || rest$488[0].token.type === parser$167.Token.Punctuator) && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '{}') {
                    return step$486(Macro$308.create(rest$488[0], rest$488[1].expose().token.inner), rest$488.slice(2));
                }    // module definition
                else if (head$487.token.value === 'module' && rest$488[0] && rest$488[0].token.value === '{}') {
                    return step$486(Module$319.create(rest$488[0]), rest$488.slice(1));
                }    // function definition
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'function' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Identifier && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '()' && rest$488[2] && rest$488[2].token.type === parser$167.Token.Delimiter && rest$488[2].token.value === '{}') {
                    rest$488[1].token.inner = rest$488[1].expose().token.inner;
                    rest$488[2].token.inner = rest$488[2].expose().token.inner;
                    return step$486(NamedFun$304.create(head$487, null, rest$488[0], rest$488[1], rest$488[2]), rest$488.slice(3));
                }    // generator function definition
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'function' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator && rest$488[0].token.value === '*' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Identifier && rest$488[2] && rest$488[2].token.type === parser$167.Token.Delimiter && rest$488[2].token.value === '()' && rest$488[3] && rest$488[3].token.type === parser$167.Token.Delimiter && rest$488[3].token.value === '{}') {
                    rest$488[2].token.inner = rest$488[2].expose().token.inner;
                    rest$488[3].token.inner = rest$488[3].expose().token.inner;
                    return step$486(NamedFun$304.create(head$487, rest$488[0], rest$488[1], rest$488[2], rest$488[3]), rest$488.slice(4));
                }    // anonymous function definition
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'function' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Delimiter && rest$488[0].token.value === '()' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '{}') {
                    rest$488[0].token.inner = rest$488[0].expose().token.inner;
                    rest$488[1].token.inner = rest$488[1].expose().token.inner;
                    return step$486(AnonFun$305.create(head$487, null, rest$488[0], rest$488[1]), rest$488.slice(2));
                }    // anonymous generator function definition
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'function' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator && rest$488[0].token.value === '*' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '()' && rest$488[2] && rest$488[2].token.type === parser$167.Token.Delimiter && rest$488[2].token.value === '{}') {
                    rest$488[1].token.inner = rest$488[1].expose().token.inner;
                    rest$488[2].token.inner = rest$488[2].expose().token.inner;
                    return step$486(AnonFun$305.create(head$487, rest$488[0], rest$488[1], rest$488[2]), rest$488.slice(3));
                }    // arrow function
                else if ((head$487.token.type === parser$167.Token.Delimiter && head$487.token.value === '()' || head$487.token.type === parser$167.Token.Identifier) && rest$488[0] && rest$488[0].token.type === parser$167.Token.Punctuator && rest$488[0].token.value === '=>' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '{}') {
                    return step$486(ArrowFun$306.create(head$487, rest$488[0], rest$488[1]), rest$488.slice(2));
                }    // catch statement
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'catch' && rest$488[0] && rest$488[0].token.type === parser$167.Token.Delimiter && rest$488[0].token.value === '()' && rest$488[1] && rest$488[1].token.type === parser$167.Token.Delimiter && rest$488[1].token.value === '{}') {
                    rest$488[0].token.inner = rest$488[0].expose().token.inner;
                    rest$488[1].token.inner = rest$488[1].expose().token.inner;
                    return step$486(CatchClause$318.create(head$487, rest$488[0], rest$488[1]), rest$488.slice(2));
                }    // this expression
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'this') {
                    return step$486(ThisExpression$290.create(head$487), rest$488);
                }    // literal
                else if (head$487.token.type === parser$167.Token.NumericLiteral || head$487.token.type === parser$167.Token.StringLiteral || head$487.token.type === parser$167.Token.BooleanLiteral || head$487.token.type === parser$167.Token.RegularExpression || head$487.token.type === parser$167.Token.NullLiteral) {
                    return step$486(Lit$291.create(head$487), rest$488);
                }    // export
                else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'export' && rest$488[0] && (rest$488[0].token.type === parser$167.Token.Identifier || rest$488[0].token.type === parser$167.Token.Keyword || rest$488[0].token.type === parser$167.Token.Punctuator)) {
                    return step$486(Export$321.create(rest$488[0]), rest$488.slice(1));
                }    // identifier
                else if (head$487.token.type === parser$167.Token.Identifier) {
                    return step$486(Id$303.create(head$487), rest$488);
                }    // punctuator
                else if (head$487.token.type === parser$167.Token.Punctuator) {
                    return step$486(Punc$301.create(head$487), rest$488);
                } else if (head$487.token.type === parser$167.Token.Keyword && head$487.token.value === 'with') {
                    throwError$263('with is not supported in sweet.js');
                }    // keyword
                else if (head$487.token.type === parser$167.Token.Keyword) {
                    return step$486(Keyword$300.create(head$487), rest$488);
                }    // Delimiter
                else if (head$487.token.type === parser$167.Token.Delimiter) {
                    return step$486(Delimiter$302.create(head$487.expose()), rest$488);
                }    // end of file
                else if (head$487.token.type === parser$167.Token.EOF) {
                    parser$167.assert(rest$488.length === 0, 'nothing should be after an EOF');
                    return step$486(EOF$286.create(head$487), []);
                } else {
                    // todo: are we missing cases?
                    parser$167.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$487,
                rest: rest$488
            };
        }
        return step$486(toks$484[0], toks$484.slice(1));
    }
    function get_expression$327(stx$566, context$567) {
        var res$568 = enforest$326(stx$566, context$567);
        if (!res$568.result.hasPrototype(Expr$288)) {
            return {
                result: null,
                rest: stx$566
            };
        }
        return res$568;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$328(newMark$569, env$570) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$571(match$572) {
            if (match$572.level === 0) {
                // replace the match property with the marked syntax
                match$572.match = _$166.map(match$572.match, function (stx$573) {
                    return stx$573.mark(newMark$569);
                });
            } else {
                _$166.each(match$572.match, function (match$574) {
                    dfs$571(match$574);
                });
            }
        }
        _$166.keys(env$570).forEach(function (key$575) {
            dfs$571(env$570[key$575]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$329(mac$576, context$577) {
        var body$578 = mac$576.body;
        // raw function primitive form
        if (!(body$578[0] && body$578[0].token.type === parser$167.Token.Keyword && body$578[0].token.value === 'function')) {
            throwError$263('Primitive macro form must contain a function for the macro body');
        }
        var stub$579 = parser$167.read('()');
        stub$579[0].token.inner = body$578;
        var expanded$580 = expand$334(stub$579, context$577);
        expanded$580 = expanded$580[0].destruct().concat(expanded$580[1].eof);
        var flattend$581 = flatten$337(expanded$580);
        var bodyCode$582 = codegen$173.generate(parser$167.parse(flattend$581));
        var macroFn$583 = scopedEval$264(bodyCode$582, {
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
                getTemplate: function (id$584) {
                    return cloneSyntaxArray$330(context$577.templateMap.get(id$584));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$328,
                mergeMatches: function (newMatch$585, oldMatch$586) {
                    newMatch$585.patternEnv = _$166.extend({}, oldMatch$586.patternEnv, newMatch$585.patternEnv);
                    return newMatch$585;
                }
            });
        return macroFn$583;
    }
    function cloneSyntaxArray$330(arr$587) {
        return arr$587.map(function (stx$588) {
            var o$589 = syntaxFromToken$272(_$166.clone(stx$588.token), stx$588);
            if (o$589.token.type === parser$167.Token.Delimiter) {
                o$589.token.inner = cloneSyntaxArray$330(o$589.token.inner);
            }
            return o$589;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$331(stx$590, context$591) {
        parser$167.assert(context$591, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$590.length === 0) {
            return {
                terms: [],
                context: context$591
            };
        }
        parser$167.assert(stx$590[0].token, 'expecting a syntax object');
        var f$592 = enforest$326(stx$590, context$591);
        // head :: TermTree
        var head$593 = f$592.result;
        // rest :: [Syntax]
        var rest$594 = f$592.rest;
        if (head$593.hasPrototype(Macro$308)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$596 = loadMacroDef$329(head$593, context$591);
            addToDefinitionCtx$332([head$593.name], context$591.defscope, false);
            context$591.env.set(resolve$276(head$593.name), { fn: macroDefinition$596 });
            return expandToTermTree$331(rest$594, context$591);
        }
        if (head$593.hasPrototype(LetMacro$307)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$596 = loadMacroDef$329(head$593, context$591);
            var freshName$597 = fresh$282();
            var renamedName$598 = head$593.name.rename(head$593.name, freshName$597);
            rest$594 = _$166.map(rest$594, function (stx$599) {
                return stx$599.rename(head$593.name, freshName$597);
            });
            head$593.name = renamedName$598;
            context$591.env.set(resolve$276(head$593.name), { fn: macroDefinition$596 });
            return expandToTermTree$331(rest$594, context$591);
        }
        if (head$593.hasPrototype(NamedFun$304)) {
            addToDefinitionCtx$332([head$593.name], context$591.defscope, true);
        }
        if (head$593.hasPrototype(VariableStatement$315)) {
            addToDefinitionCtx$332(_$166.map(head$593.decls, function (decl$600) {
                return decl$600.ident;
            }), context$591.defscope, true);
        }
        if (head$593.hasPrototype(Block$293) && head$593.body.hasPrototype(Delimiter$302)) {
            head$593.body.delim.token.inner.forEach(function (term$601) {
                if (term$601.hasPrototype(VariableStatement$315)) {
                    addToDefinitionCtx$332(_$166.map(term$601.decls, function (decl$602) {
                        return decl$602.ident;
                    }), context$591.defscope, true);
                }
            });
        }
        if (head$593.hasPrototype(Delimiter$302)) {
            head$593.delim.token.inner.forEach(function (term$603) {
                if (term$603.hasPrototype(VariableStatement$315)) {
                    addToDefinitionCtx$332(_$166.map(term$603.decls, function (decl$604) {
                        return decl$604.ident;
                    }), context$591.defscope, true);
                }
            });
        }
        var trees$595 = expandToTermTree$331(rest$594, context$591);
        return {
            terms: [head$593].concat(trees$595.terms),
            context: trees$595.context
        };
    }
    function addToDefinitionCtx$332(idents$605, defscope$606, skipRep$607) {
        parser$167.assert(idents$605 && idents$605.length > 0, 'expecting some variable identifiers');
        skipRep$607 = skipRep$607 || false;
        _$166.each(idents$605, function (id$608) {
            var skip$609 = false;
            if (skipRep$607) {
                var declRepeat$610 = _$166.find(defscope$606, function (def$611) {
                        return def$611.id.token.value === id$608.token.value && arraysEqual$277(marksof$275(def$611.id.context), marksof$275(id$608.context));
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
                var name$612 = fresh$282();
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
    function expandTermTreeToFinal$333(term$613, context$614) {
        parser$167.assert(context$614 && context$614.env, 'environment map is required');
        if (term$613.hasPrototype(ArrayLiteral$294)) {
            term$613.array.delim.token.inner = expand$334(term$613.array.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(Block$293)) {
            term$613.body.delim.token.inner = expand$334(term$613.body.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ParenExpression$295)) {
            term$613.expr.delim.token.inner = expand$334(term$613.expr.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(Call$311)) {
            term$613.fun = expandTermTreeToFinal$333(term$613.fun, context$614);
            term$613.args = _$166.map(term$613.args, function (arg$615) {
                return expandTermTreeToFinal$333(arg$615, context$614);
            });
            return term$613;
        } else if (term$613.hasPrototype(UnaryOp$296)) {
            term$613.expr = expandTermTreeToFinal$333(term$613.expr, context$614);
            return term$613;
        } else if (term$613.hasPrototype(BinOp$298)) {
            term$613.left = expandTermTreeToFinal$333(term$613.left, context$614);
            term$613.right = expandTermTreeToFinal$333(term$613.right, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ObjGet$313)) {
            term$613.right.delim.token.inner = expand$334(term$613.right.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(ObjDotGet$312)) {
            term$613.left = expandTermTreeToFinal$333(term$613.left, context$614);
            term$613.right = expandTermTreeToFinal$333(term$613.right, context$614);
            return term$613;
        } else if (term$613.hasPrototype(VariableDeclaration$314)) {
            if (term$613.init) {
                term$613.init = expandTermTreeToFinal$333(term$613.init, context$614);
            }
            return term$613;
        } else if (term$613.hasPrototype(VariableStatement$315)) {
            term$613.decls = _$166.map(term$613.decls, function (decl$616) {
                return expandTermTreeToFinal$333(decl$616, context$614);
            });
            return term$613;
        } else if (term$613.hasPrototype(Delimiter$302)) {
            // expand inside the delimiter and then continue on
            term$613.delim.token.inner = expand$334(term$613.delim.expose().token.inner, context$614);
            return term$613;
        } else if (term$613.hasPrototype(NamedFun$304) || term$613.hasPrototype(AnonFun$305) || term$613.hasPrototype(CatchClause$318) || term$613.hasPrototype(ArrowFun$306) || term$613.hasPrototype(Module$319)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$617 = [];
            var bodyContext$618 = makeExpanderContext$335(_$166.defaults({ defscope: newDef$617 }, context$614));
            var paramSingleIdent$619 = term$613.params && term$613.params.token.type === parser$167.Token.Identifier;
            if (term$613.params && term$613.params.token.type === parser$167.Token.Delimiter) {
                var params$626 = term$613.params.expose();
            } else if (paramSingleIdent$619) {
                var params$626 = term$613.params;
            } else {
                var params$626 = syn$168.makeDelim('()', [], null);
            }
            if (Array.isArray(term$613.body)) {
                var bodies$627 = syn$168.makeDelim('{}', term$613.body, null);
            } else {
                var bodies$627 = term$613.body;
            }
            bodies$627 = bodies$627.addDefCtx(newDef$617);
            var paramNames$620 = _$166.map(getParamIdentifiers$284(params$626), function (param$628) {
                    var freshName$629 = fresh$282();
                    return {
                        freshName: freshName$629,
                        originalParam: param$628,
                        renamedParam: param$628.rename(param$628, freshName$629)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$621 = _$166.reduce(paramNames$620, function (accBody$630, p$631) {
                    return accBody$630.rename(p$631.originalParam, p$631.freshName);
                }, bodies$627);
            renamedBody$621 = renamedBody$621.expose();
            var expandedResult$622 = expandToTermTree$331(renamedBody$621.token.inner, bodyContext$618);
            var bodyTerms$623 = expandedResult$622.terms;
            var renamedParams$624 = _$166.map(paramNames$620, function (p$632) {
                    return p$632.renamedParam;
                });
            if (paramSingleIdent$619) {
                var flatArgs$633 = renamedParams$624[0];
            } else {
                var flatArgs$633 = syn$168.makeDelim('()', joinSyntax$273(renamedParams$624, ','), term$613.params);
            }
            var expandedArgs$625 = expand$334([flatArgs$633], bodyContext$618);
            parser$167.assert(expandedArgs$625.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$613.params) {
                term$613.params = expandedArgs$625[0];
            }
            bodyTerms$623 = _$166.map(bodyTerms$623, function (bodyTerm$634) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$635 = bodyTerm$634.addDefCtx(newDef$617);
                // finish expansion
                return expandTermTreeToFinal$333(termWithCtx$635, expandedResult$622.context);
            });
            if (term$613.hasPrototype(Module$319)) {
                bodyTerms$623 = _$166.filter(bodyTerms$623, function (bodyTerm$636) {
                    if (bodyTerm$636.hasPrototype(Export$321)) {
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
    function expand$334(stx$637, context$638) {
        parser$167.assert(context$638, 'must provide an expander context');
        var trees$639 = expandToTermTree$331(stx$637, context$638);
        return _$166.map(trees$639.terms, function (term$640) {
            return expandTermTreeToFinal$333(term$640, trees$639.context);
        });
    }
    function makeExpanderContext$335(o$641) {
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
    function expandTopLevel$336(stx$642, builtinSource$643) {
        var env$644 = new Map();
        var params$645 = [];
        var context$646, builtInContext$647 = makeExpanderContext$335({ env: env$644 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$643) {
            var builtinRead$650 = parser$167.read(builtinSource$643);
            builtinRead$650 = [
                syn$168.makeIdent('module', null),
                syn$168.makeDelim('{}', builtinRead$650, null)
            ];
            var builtinRes$651 = expand$334(builtinRead$650, builtInContext$647);
            params$645 = _$166.map(builtinRes$651[0].exports, function (term$652) {
                return {
                    oldExport: term$652.name,
                    newParam: syn$168.makeIdent(term$652.name.token.value, null)
                };
            });
        }
        var modBody$648 = syn$168.makeDelim('{}', stx$642, null);
        modBody$648 = _$166.reduce(params$645, function (acc$653, param$654) {
            var newName$655 = fresh$282();
            env$644.set(resolve$276(param$654.newParam.rename(param$654.newParam, newName$655)), env$644.get(resolve$276(param$654.oldExport)));
            return acc$653.rename(param$654.newParam, newName$655);
        }, modBody$648);
        context$646 = makeExpanderContext$335({ env: env$644 });
        var res$649 = expand$334([
                syn$168.makeIdent('module', null),
                modBody$648
            ], context$646);
        res$649 = res$649[0].destruct();
        return flatten$337(res$649[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$337(stx$656) {
        return _$166.reduce(stx$656, function (acc$657, stx$658) {
            if (stx$658.token.type === parser$167.Token.Delimiter) {
                var exposed$659 = stx$658.expose();
                var openParen$660 = syntaxFromToken$272({
                        type: parser$167.Token.Punctuator,
                        value: stx$658.token.value[0],
                        range: stx$658.token.startRange,
                        sm_range: typeof stx$658.token.sm_startRange == 'undefined' ? stx$658.token.startRange : stx$658.token.sm_startRange,
                        lineNumber: stx$658.token.startLineNumber,
                        sm_lineNumber: typeof stx$658.token.sm_startLineNumber == 'undefined' ? stx$658.token.startLineNumber : stx$658.token.sm_startLineNumber,
                        lineStart: stx$658.token.startLineStart,
                        sm_lineStart: typeof stx$658.token.sm_startLineStart == 'undefined' ? stx$658.token.startLineStart : stx$658.token.sm_startLineStart
                    }, exposed$659);
                var closeParen$661 = syntaxFromToken$272({
                        type: parser$167.Token.Punctuator,
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
                return acc$657.concat(openParen$660).concat(flatten$337(exposed$659.token.inner)).concat(closeParen$661);
            }
            stx$658.token.sm_lineNumber = stx$658.token.sm_lineNumber ? stx$658.token.sm_lineNumber : stx$658.token.lineNumber;
            stx$658.token.sm_lineStart = stx$658.token.sm_lineStart ? stx$658.token.sm_lineStart : stx$658.token.lineStart;
            stx$658.token.sm_range = stx$658.token.sm_range ? stx$658.token.sm_range : stx$658.token.range;
            return acc$657.concat(stx$658);
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