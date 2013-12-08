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
(function (root$162, factory$163) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$163(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$163);
    }
}(this, function (exports$164, _$165, parser$166, syn$167, es6$168, se$169, patternModule$170, gen$171) {
    'use strict';
    var codegen$172 = gen$171 || escodegen;
    // used to export "private" methods for unit testing
    exports$164._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$331 = Object.create(this);
                if (typeof o$331.construct === 'function') {
                    o$331.construct.apply(o$331, arguments);
                }
                return o$331;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$332) {
                var result$333 = Object.create(this);
                for (var prop$334 in properties$332) {
                    if (properties$332.hasOwnProperty(prop$334)) {
                        result$333[prop$334] = properties$332[prop$334];
                    }
                }
                return result$333;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$335) {
                function F$336() {
                }
                F$336.prototype = proto$335;
                return this instanceof F$336;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$256(msg$337) {
        throw new Error(msg$337);
    }
    var scopedEval$257 = se$169.scopedEval;
    var Rename$258 = syn$167.Rename;
    var Mark$259 = syn$167.Mark;
    var Var$260 = syn$167.Var;
    var Def$261 = syn$167.Def;
    var isDef$262 = syn$167.isDef;
    var isMark$263 = syn$167.isMark;
    var isRename$264 = syn$167.isRename;
    var syntaxFromToken$265 = syn$167.syntaxFromToken;
    var joinSyntax$266 = syn$167.joinSyntax;
    function remdup$267(mark$338, mlist$339) {
        if (mark$338 === _$165.first(mlist$339)) {
            return _$165.rest(mlist$339, 1);
        }
        return [mark$338].concat(mlist$339);
    }
    // (CSyntax) -> [...Num]
    function marksof$268(ctx$340, stopName$341, originalName$342) {
        var mark$343, submarks$344;
        if (isMark$263(ctx$340)) {
            mark$343 = ctx$340.mark;
            submarks$344 = marksof$268(ctx$340.context, stopName$341, originalName$342);
            return remdup$267(mark$343, submarks$344);
        }
        if (isDef$262(ctx$340)) {
            return marksof$268(ctx$340.context, stopName$341, originalName$342);
        }
        if (isRename$264(ctx$340)) {
            if (stopName$341 === originalName$342 + '$' + ctx$340.name) {
                return [];
            }
            return marksof$268(ctx$340.context, stopName$341, originalName$342);
        }
        return [];
    }
    function resolve$269(stx$345) {
        return resolveCtx$273(stx$345.token.value, stx$345.context, [], []);
    }
    function arraysEqual$270(a$346, b$347) {
        if (a$346.length !== b$347.length) {
            return false;
        }
        for (var i$348 = 0; i$348 < a$346.length; i$348++) {
            if (a$346[i$348] !== b$347[i$348]) {
                return false;
            }
        }
        return true;
    }
    function renames$271(defctx$349, oldctx$350, originalName$351) {
        var acc$352 = oldctx$350;
        for (var i$353 = 0; i$353 < defctx$349.length; i$353++) {
            if (defctx$349[i$353].id.token.value === originalName$351) {
                acc$352 = Rename$258(defctx$349[i$353].id, defctx$349[i$353].name, acc$352, defctx$349);
            }
        }
        return acc$352;
    }
    function unionEl$272(arr$354, el$355) {
        if (arr$354.indexOf(el$355) === -1) {
            var res$356 = arr$354.slice(0);
            res$356.push(el$355);
            return res$356;
        }
        return arr$354;
    }
    // (Syntax) -> String
    function resolveCtx$273(originalName$357, ctx$358, stop_spine$359, stop_branch$360) {
        if (isMark$263(ctx$358)) {
            return resolveCtx$273(originalName$357, ctx$358.context, stop_spine$359, stop_branch$360);
        }
        if (isDef$262(ctx$358)) {
            if (stop_spine$359.indexOf(ctx$358.defctx) !== -1) {
                return resolveCtx$273(originalName$357, ctx$358.context, stop_spine$359, stop_branch$360);
            } else {
                return resolveCtx$273(originalName$357, renames$271(ctx$358.defctx, ctx$358.context, originalName$357), stop_spine$359, unionEl$272(stop_branch$360, ctx$358.defctx));
            }
        }
        if (isRename$264(ctx$358)) {
            if (originalName$357 === ctx$358.id.token.value) {
                var idName$361 = resolveCtx$273(ctx$358.id.token.value, ctx$358.id.context, stop_branch$360, stop_branch$360);
                var subName$362 = resolveCtx$273(originalName$357, ctx$358.context, unionEl$272(stop_spine$359, ctx$358.def), stop_branch$360);
                if (idName$361 === subName$362) {
                    var idMarks$363 = marksof$268(ctx$358.id.context, originalName$357 + '$' + ctx$358.name, originalName$357);
                    var subMarks$364 = marksof$268(ctx$358.context, originalName$357 + '$' + ctx$358.name, originalName$357);
                    if (arraysEqual$270(idMarks$363, subMarks$364)) {
                        return originalName$357 + '$' + ctx$358.name;
                    }
                }
            }
            return resolveCtx$273(originalName$357, ctx$358.context, stop_spine$359, stop_branch$360);
        }
        return originalName$357;
    }
    var nextFresh$274 = 0;
    // fun () -> Num
    function fresh$275() {
        return nextFresh$274++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$276(towrap$365, delimSyntax$366) {
        parser$166.assert(delimSyntax$366.token.type === parser$166.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$265({
            type: parser$166.Token.Delimiter,
            value: delimSyntax$366.token.value,
            inner: towrap$365,
            range: delimSyntax$366.token.range,
            startLineNumber: delimSyntax$366.token.startLineNumber,
            lineStart: delimSyntax$366.token.lineStart
        }, delimSyntax$366);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$277(argSyntax$367) {
        if (argSyntax$367.token.type === parser$166.Token.Delimiter) {
            return _$165.filter(argSyntax$367.token.inner, function (stx$368) {
                return stx$368.token.value !== ',';
            });
        } else if (argSyntax$367.token.type === parser$166.Token.Identifier) {
            return [argSyntax$367];
        } else {
            parser$166.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$278 = {
            destruct: function () {
                return _$165.reduce(this.properties, _$165.bind(function (acc$369, prop$370) {
                    if (this[prop$370] && this[prop$370].hasPrototype(TermTree$278)) {
                        return acc$369.concat(this[prop$370].destruct());
                    } else if (this[prop$370] && this[prop$370].token && this[prop$370].token.inner) {
                        this[prop$370].token.inner = _$165.reduce(this[prop$370].token.inner, function (acc$371, t$372) {
                            if (t$372.hasPrototype(TermTree$278)) {
                                return acc$371.concat(t$372.destruct());
                            }
                            return acc$371.concat(t$372);
                        }, []);
                        return acc$369.concat(this[prop$370]);
                    } else if (Array.isArray(this[prop$370])) {
                        return acc$369.concat(_$165.reduce(this[prop$370], function (acc$373, t$374) {
                            if (t$374.hasPrototype(TermTree$278)) {
                                return acc$373.concat(t$374.destruct());
                            }
                            return acc$373.concat(t$374);
                        }, []));
                    } else if (this[prop$370]) {
                        return acc$369.concat(this[prop$370]);
                    } else {
                        return acc$369;
                    }
                }, this), []);
            },
            addDefCtx: function (def$375) {
                for (var i$376 = 0; i$376 < this.properties.length; i$376++) {
                    var prop$377 = this.properties[i$376];
                    if (Array.isArray(this[prop$377])) {
                        this[prop$377] = _$165.map(this[prop$377], function (item$378) {
                            return item$378.addDefCtx(def$375);
                        });
                    } else if (this[prop$377]) {
                        this[prop$377] = this[prop$377].addDefCtx(def$375);
                    }
                }
                return this;
            }
        };
    var EOF$279 = TermTree$278.extend({
            properties: ['eof'],
            construct: function (e$379) {
                this.eof = e$379;
            }
        });
    var Statement$280 = TermTree$278.extend({
            construct: function () {
            }
        });
    var Expr$281 = TermTree$278.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$282 = Expr$281.extend({
            construct: function () {
            }
        });
    var ThisExpression$283 = PrimaryExpression$282.extend({
            properties: ['this'],
            construct: function (that$380) {
                this.this = that$380;
            }
        });
    var Lit$284 = PrimaryExpression$282.extend({
            properties: ['lit'],
            construct: function (l$381) {
                this.lit = l$381;
            }
        });
    exports$164._test.PropertyAssignment = PropertyAssignment$285;
    var PropertyAssignment$285 = TermTree$278.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$382, assignment$383) {
                this.propName = propName$382;
                this.assignment = assignment$383;
            }
        });
    var Block$286 = PrimaryExpression$282.extend({
            properties: ['body'],
            construct: function (body$384) {
                this.body = body$384;
            }
        });
    var ArrayLiteral$287 = PrimaryExpression$282.extend({
            properties: ['array'],
            construct: function (ar$385) {
                this.array = ar$385;
            }
        });
    var ParenExpression$288 = PrimaryExpression$282.extend({
            properties: ['expr'],
            construct: function (expr$386) {
                this.expr = expr$386;
            }
        });
    var UnaryOp$289 = Expr$281.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$387, expr$388) {
                this.op = op$387;
                this.expr = expr$388;
            }
        });
    var PostfixOp$290 = Expr$281.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$389, op$390) {
                this.expr = expr$389;
                this.op = op$390;
            }
        });
    var BinOp$291 = Expr$281.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$391, left$392, right$393) {
                this.op = op$391;
                this.left = left$392;
                this.right = right$393;
            }
        });
    var ConditionalExpression$292 = Expr$281.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$394, question$395, tru$396, colon$397, fls$398) {
                this.cond = cond$394;
                this.question = question$395;
                this.tru = tru$396;
                this.colon = colon$397;
                this.fls = fls$398;
            }
        });
    var Keyword$293 = TermTree$278.extend({
            properties: ['keyword'],
            construct: function (k$399) {
                this.keyword = k$399;
            }
        });
    var Punc$294 = TermTree$278.extend({
            properties: ['punc'],
            construct: function (p$400) {
                this.punc = p$400;
            }
        });
    var Delimiter$295 = TermTree$278.extend({
            properties: ['delim'],
            construct: function (d$401) {
                this.delim = d$401;
            }
        });
    var Id$296 = PrimaryExpression$282.extend({
            properties: ['id'],
            construct: function (id$402) {
                this.id = id$402;
            }
        });
    var NamedFun$297 = Expr$281.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$403, star$404, name$405, params$406, body$407) {
                this.keyword = keyword$403;
                this.star = star$404;
                this.name = name$405;
                this.params = params$406;
                this.body = body$407;
            }
        });
    var AnonFun$298 = Expr$281.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$408, star$409, params$410, body$411) {
                this.keyword = keyword$408;
                this.star = star$409;
                this.params = params$410;
                this.body = body$411;
            }
        });
    var ArrowFun$299 = Expr$281.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$412, arrow$413, body$414) {
                this.params = params$412;
                this.arrow = arrow$413;
                this.body = body$414;
            }
        });
    var LetMacro$300 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$415, body$416) {
                this.name = name$415;
                this.body = body$416;
            }
        });
    var Macro$301 = TermTree$278.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$417, body$418) {
                this.name = name$417;
                this.body = body$418;
            }
        });
    var AnonMacro$302 = TermTree$278.extend({
            properties: ['body'],
            construct: function (body$419) {
                this.body = body$419;
            }
        });
    var Const$303 = Expr$281.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$420, call$421) {
                this.newterm = newterm$420;
                this.call = call$421;
            }
        });
    var Call$304 = Expr$281.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$166.assert(this.fun.hasPrototype(TermTree$278), 'expecting a term tree in destruct of call');
                var that$422 = this;
                this.delim = syntaxFromToken$265(_$165.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$165.reduce(this.args, function (acc$423, term$424) {
                    parser$166.assert(term$424 && term$424.hasPrototype(TermTree$278), 'expecting term trees in destruct of Call');
                    var dst$425 = acc$423.concat(term$424.destruct());
                    // add all commas except for the last one
                    if (that$422.commas.length > 0) {
                        dst$425 = dst$425.concat(that$422.commas.shift());
                    }
                    return dst$425;
                }, []);
                return this.fun.destruct().concat(Delimiter$295.create(this.delim).destruct());
            },
            construct: function (funn$426, args$427, delim$428, commas$429) {
                parser$166.assert(Array.isArray(args$427), 'requires an array of arguments terms');
                this.fun = funn$426;
                this.args = args$427;
                this.delim = delim$428;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$429;
            }
        });
    var ObjDotGet$305 = Expr$281.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$430, dot$431, right$432) {
                this.left = left$430;
                this.dot = dot$431;
                this.right = right$432;
            }
        });
    var ObjGet$306 = Expr$281.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$433, right$434) {
                this.left = left$433;
                this.right = right$434;
            }
        });
    var VariableDeclaration$307 = TermTree$278.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$435, eqstx$436, init$437, comma$438) {
                this.ident = ident$435;
                this.eqstx = eqstx$436;
                this.init = init$437;
                this.comma = comma$438;
            }
        });
    var VariableStatement$308 = Statement$280.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$165.reduce(this.decls, function (acc$439, decl$440) {
                    return acc$439.concat(decl$440.destruct());
                }, []));
            },
            construct: function (varkw$441, decls$442) {
                parser$166.assert(Array.isArray(decls$442), 'decls must be an array');
                this.varkw = varkw$441;
                this.decls = decls$442;
            }
        });
    var LetStatement$309 = Statement$280.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$165.reduce(this.decls, function (acc$443, decl$444) {
                    return acc$443.concat(decl$444.destruct());
                }, []));
            },
            construct: function (letkw$445, decls$446) {
                parser$166.assert(Array.isArray(decls$446), 'decls must be an array');
                this.letkw = letkw$445;
                this.decls = decls$446;
            }
        });
    var ConstStatement$310 = Statement$280.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$165.reduce(this.decls, function (acc$447, decl$448) {
                    return acc$447.concat(decl$448.destruct());
                }, []));
            },
            construct: function (constkw$449, decls$450) {
                parser$166.assert(Array.isArray(decls$450), 'decls must be an array');
                this.constkw = constkw$449;
                this.decls = decls$450;
            }
        });
    var CatchClause$311 = TermTree$278.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$451, params$452, body$453) {
                this.catchkw = catchkw$451;
                this.params = params$452;
                this.body = body$453;
            }
        });
    var Module$312 = TermTree$278.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$454) {
                this.body = body$454;
                this.exports = [];
            }
        });
    var Empty$313 = TermTree$278.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$314 = TermTree$278.extend({
            properties: ['name'],
            construct: function (name$455) {
                this.name = name$455;
            }
        });
    function stxIsUnaryOp$315(stx$456) {
        var staticOperators$457 = [
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
        return _$165.contains(staticOperators$457, stx$456.token.value);
    }
    function stxIsBinOp$316(stx$458) {
        var staticOperators$459 = [
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
        return _$165.contains(staticOperators$459, stx$458.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$317(stx$460, context$461) {
        var decls$462 = [];
        var res$463 = enforest$319(stx$460, context$461);
        var result$464 = res$463.result;
        var rest$465 = res$463.rest;
        if (rest$465[0]) {
            var nextRes$466 = enforest$319(rest$465, context$461);
            // x = ...
            if (nextRes$466.result.hasPrototype(Punc$294) && nextRes$466.result.punc.token.value === '=') {
                var initializerRes$467 = enforest$319(nextRes$466.rest, context$461);
                if (initializerRes$467.rest[0]) {
                    var restRes$468 = enforest$319(initializerRes$467.rest, context$461);
                    // x = y + z, ...
                    if (restRes$468.result.hasPrototype(Punc$294) && restRes$468.result.punc.token.value === ',') {
                        decls$462.push(VariableDeclaration$307.create(result$464.id, nextRes$466.result.punc, initializerRes$467.result, restRes$468.result.punc));
                        var subRes$469 = enforestVarStatement$317(restRes$468.rest, context$461);
                        decls$462 = decls$462.concat(subRes$469.result);
                        rest$465 = subRes$469.rest;
                    }    // x = y ...
                    else {
                        decls$462.push(VariableDeclaration$307.create(result$464.id, nextRes$466.result.punc, initializerRes$467.result));
                        rest$465 = initializerRes$467.rest;
                    }
                }    // x = y EOF
                else {
                    decls$462.push(VariableDeclaration$307.create(result$464.id, nextRes$466.result.punc, initializerRes$467.result));
                }
            }    // x ,...;
            else if (nextRes$466.result.hasPrototype(Punc$294) && nextRes$466.result.punc.token.value === ',') {
                decls$462.push(VariableDeclaration$307.create(result$464.id, null, null, nextRes$466.result.punc));
                var subRes$469 = enforestVarStatement$317(nextRes$466.rest, context$461);
                decls$462 = decls$462.concat(subRes$469.result);
                rest$465 = subRes$469.rest;
            } else {
                if (result$464.hasPrototype(Id$296)) {
                    decls$462.push(VariableDeclaration$307.create(result$464.id));
                } else {
                    throwError$256('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$464.hasPrototype(Id$296)) {
                decls$462.push(VariableDeclaration$307.create(result$464.id));
            } else if (result$464.hasPrototype(BinOp$291) && result$464.op.token.value === 'in') {
                decls$462.push(VariableDeclaration$307.create(result$464.left.id, result$464.op, result$464.right));
            } else {
                throwError$256('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$462,
            rest: rest$465
        };
    }
    function adjustLineContext$318(stx$470, original$471, current$472) {
        current$472 = current$472 || {
            lastLineNumber: original$471.token.lineNumber,
            lineNumber: original$471.token.lineNumber - 1
        };
        return _$165.map(stx$470, function (stx$473) {
            if (stx$473.token.type === parser$166.Token.Delimiter) {
                // handle tokens with missing line info
                stx$473.token.startLineNumber = typeof stx$473.token.startLineNumber == 'undefined' ? original$471.token.lineNumber : stx$473.token.startLineNumber;
                stx$473.token.endLineNumber = typeof stx$473.token.endLineNumber == 'undefined' ? original$471.token.lineNumber : stx$473.token.endLineNumber;
                stx$473.token.startLineStart = typeof stx$473.token.startLineStart == 'undefined' ? original$471.token.lineStart : stx$473.token.startLineStart;
                stx$473.token.endLineStart = typeof stx$473.token.endLineStart == 'undefined' ? original$471.token.lineStart : stx$473.token.endLineStart;
                stx$473.token.startRange = typeof stx$473.token.startRange == 'undefined' ? original$471.token.range : stx$473.token.startRange;
                stx$473.token.endRange = typeof stx$473.token.endRange == 'undefined' ? original$471.token.range : stx$473.token.endRange;
                stx$473.token.sm_startLineNumber = typeof stx$473.token.sm_startLineNumber == 'undefined' ? stx$473.token.startLineNumber : stx$473.token.sm_startLineNumber;
                stx$473.token.sm_endLineNumber = typeof stx$473.token.sm_endLineNumber == 'undefined' ? stx$473.token.endLineNumber : stx$473.token.sm_endLineNumber;
                stx$473.token.sm_startLineStart = typeof stx$473.token.sm_startLineStart == 'undefined' ? stx$473.token.startLineStart : stx$473.token.sm_startLineStart;
                stx$473.token.sm_endLineStart = typeof stx$473.token.sm_endLineStart == 'undefined' ? stx$473.token.endLineStart : stx$473.token.sm_endLineStart;
                stx$473.token.sm_startRange = typeof stx$473.token.sm_startRange == 'undefined' ? stx$473.token.startRange : stx$473.token.sm_startRange;
                stx$473.token.sm_endRange = typeof stx$473.token.sm_endRange == 'undefined' ? stx$473.token.endRange : stx$473.token.sm_endRange;
                stx$473.token.startLineNumber = original$471.token.lineNumber;
                if (stx$473.token.inner.length > 0) {
                    stx$473.token.inner = adjustLineContext$318(stx$473.token.inner, original$471, current$472);
                }
                return stx$473;
            }
            // handle tokens with missing line info
            stx$473.token.lineNumber = typeof stx$473.token.lineNumber == 'undefined' ? original$471.token.lineNumber : stx$473.token.lineNumber;
            stx$473.token.lineStart = typeof stx$473.token.lineStart == 'undefined' ? original$471.token.lineStart : stx$473.token.lineStart;
            stx$473.token.range = typeof stx$473.token.range == 'undefined' ? original$471.token.range : stx$473.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$473.token.sm_lineNumber = typeof stx$473.token.sm_lineNumber == 'undefined' ? stx$473.token.lineNumber : stx$473.token.sm_lineNumber;
            stx$473.token.sm_lineStart = typeof stx$473.token.sm_lineStart == 'undefined' ? stx$473.token.lineStart : stx$473.token.sm_lineStart;
            stx$473.token.sm_range = typeof stx$473.token.sm_range == 'undefined' ? _$165.clone(stx$473.token.range) : stx$473.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$473.token.lineNumber = original$471.token.lineNumber;
            return stx$473;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$319(toks$474, context$475) {
        parser$166.assert(toks$474.length > 0, 'enforest assumes there are tokens to work with');
        function step$476(head$477, rest$478) {
            var innerTokens$479;
            parser$166.assert(Array.isArray(rest$478), 'result must at least be an empty array');
            if (head$477.hasPrototype(TermTree$278)) {
                // function call
                var emp$482 = head$477.emp;
                var emp$482 = head$477.emp;
                var keyword$485 = head$477.keyword;
                var delim$487 = head$477.delim;
                var id$489 = head$477.id;
                var delim$487 = head$477.delim;
                var emp$482 = head$477.emp;
                var punc$493 = head$477.punc;
                var keyword$485 = head$477.keyword;
                var emp$482 = head$477.emp;
                var emp$482 = head$477.emp;
                var emp$482 = head$477.emp;
                var delim$487 = head$477.delim;
                var delim$487 = head$477.delim;
                var keyword$485 = head$477.keyword;
                var keyword$485 = head$477.keyword;
                var keyword$485 = head$477.keyword;
                var keyword$485 = head$477.keyword;
                if (head$477.hasPrototype(Expr$281) && rest$478[0] && rest$478[0].token.type === parser$166.Token.Delimiter && rest$478[0].token.value === '()') {
                    var argRes$524, enforestedArgs$525 = [], commas$526 = [];
                    rest$478[0].expose();
                    innerTokens$479 = rest$478[0].token.inner;
                    while (innerTokens$479.length > 0) {
                        argRes$524 = enforest$319(innerTokens$479, context$475);
                        enforestedArgs$525.push(argRes$524.result);
                        innerTokens$479 = argRes$524.rest;
                        if (innerTokens$479[0] && innerTokens$479[0].token.value === ',') {
                            // record the comma for later
                            commas$526.push(innerTokens$479[0]);
                            // but dump it for the next loop turn
                            innerTokens$479 = innerTokens$479.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$527 = _$165.all(enforestedArgs$525, function (argTerm$528) {
                            return argTerm$528.hasPrototype(Expr$281);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$479.length === 0 && argsAreExprs$527) {
                        return step$476(Call$304.create(head$477, enforestedArgs$525, rest$478[0], commas$526), rest$478.slice(1));
                    }
                } else if (head$477.hasPrototype(Expr$281) && rest$478[0] && rest$478[0].token.value === '?') {
                    var question$529 = rest$478[0];
                    var condRes$530 = enforest$319(rest$478.slice(1), context$475);
                    var truExpr$531 = condRes$530.result;
                    var right$532 = condRes$530.rest;
                    if (truExpr$531.hasPrototype(Expr$281) && right$532[0] && right$532[0].token.value === ':') {
                        var colon$533 = right$532[0];
                        var flsRes$534 = enforest$319(right$532.slice(1), context$475);
                        var flsExpr$535 = flsRes$534.result;
                        if (flsExpr$535.hasPrototype(Expr$281)) {
                            return step$476(ConditionalExpression$292.create(head$477, question$529, truExpr$531, colon$533, flsExpr$535), flsRes$534.rest);
                        }
                    }
                } else if (head$477.hasPrototype(Keyword$293) && keyword$485.token.value === 'new' && rest$478[0]) {
                    var newCallRes$536 = enforest$319(rest$478, context$475);
                    if (newCallRes$536.result.hasPrototype(Call$304)) {
                        return step$476(Const$303.create(head$477, newCallRes$536.result), newCallRes$536.rest);
                    }
                } else if (head$477.hasPrototype(Delimiter$295) && delim$487.token.value === '()' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator && rest$478[0].token.value === '=>') {
                    var res$537 = enforest$319(rest$478.slice(1), context$475);
                    if (res$537.result.hasPrototype(Expr$281)) {
                        return step$476(ArrowFun$299.create(delim$487, rest$478[0], res$537.result.destruct()), res$537.rest);
                    } else {
                        throwError$256('Body of arrow function must be an expression');
                    }
                } else if (head$477.hasPrototype(Id$296) && rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator && rest$478[0].token.value === '=>') {
                    var res$537 = enforest$319(rest$478.slice(1), context$475);
                    if (res$537.result.hasPrototype(Expr$281)) {
                        return step$476(ArrowFun$299.create(id$489, rest$478[0], res$537.result.destruct()), res$537.rest);
                    } else {
                        throwError$256('Body of arrow function must be an expression');
                    }
                } else if (head$477.hasPrototype(Delimiter$295) && delim$487.token.value === '()') {
                    innerTokens$479 = delim$487.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$479.length === 0) {
                        return step$476(ParenExpression$288.create(head$477), rest$478);
                    } else {
                        var innerTerm$538 = get_expression$320(innerTokens$479, context$475);
                        if (innerTerm$538.result && innerTerm$538.result.hasPrototype(Expr$281)) {
                            return step$476(ParenExpression$288.create(head$477), rest$478);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$477.hasPrototype(Expr$281) && rest$478[0] && rest$478[1] && stxIsBinOp$316(rest$478[0])) {
                    var op$539 = rest$478[0];
                    var left$540 = head$477;
                    var bopRes$541 = enforest$319(rest$478.slice(1), context$475);
                    var right$532 = bopRes$541.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$532.hasPrototype(Expr$281)) {
                        return step$476(BinOp$291.create(op$539, left$540, right$532), bopRes$541.rest);
                    }
                } else if (head$477.hasPrototype(Punc$294) && stxIsUnaryOp$315(punc$493)) {
                    var unopRes$542 = enforest$319(rest$478, context$475);
                    if (unopRes$542.result.hasPrototype(Expr$281)) {
                        return step$476(UnaryOp$289.create(punc$493, unopRes$542.result), unopRes$542.rest);
                    }
                } else if (head$477.hasPrototype(Keyword$293) && stxIsUnaryOp$315(keyword$485)) {
                    var unopRes$542 = enforest$319(rest$478, context$475);
                    if (unopRes$542.result.hasPrototype(Expr$281)) {
                        return step$476(UnaryOp$289.create(keyword$485, unopRes$542.result), unopRes$542.rest);
                    }
                } else if (head$477.hasPrototype(Expr$281) && rest$478[0] && (rest$478[0].token.value === '++' || rest$478[0].token.value === '--')) {
                    return step$476(PostfixOp$290.create(head$477, rest$478[0]), rest$478.slice(1));
                } else if (head$477.hasPrototype(Expr$281) && rest$478[0] && rest$478[0].token.value === '[]') {
                    return step$476(ObjGet$306.create(head$477, Delimiter$295.create(rest$478[0].expose())), rest$478.slice(1));
                } else if (head$477.hasPrototype(Expr$281) && rest$478[0] && rest$478[0].token.value === '.' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Identifier) {
                    return step$476(ObjDotGet$305.create(head$477, rest$478[0], rest$478[1]), rest$478.slice(2));
                } else if (head$477.hasPrototype(Delimiter$295) && delim$487.token.value === '[]') {
                    return step$476(ArrayLiteral$287.create(head$477), rest$478);
                } else if (head$477.hasPrototype(Delimiter$295) && head$477.delim.token.value === '{}') {
                    return step$476(Block$286.create(head$477), rest$478);
                } else if (head$477.hasPrototype(Keyword$293) && keyword$485.token.value === 'let' && (rest$478[0] && rest$478[0].token.type === parser$166.Token.Identifier || rest$478[0] && rest$478[0].token.type === parser$166.Token.Keyword || rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator) && rest$478[1] && rest$478[1].token.value === '=' && rest$478[2] && rest$478[2].token.value === 'macro') {
                    var mac$543 = enforest$319(rest$478.slice(2), context$475);
                    if (!mac$543.result.hasPrototype(AnonMacro$302)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$543.result);
                    }
                    return step$476(LetMacro$300.create(rest$478[0], mac$543.result.body), mac$543.rest);
                } else if (head$477.hasPrototype(Keyword$293) && keyword$485.token.value === 'var' && rest$478[0]) {
                    var vsRes$544 = enforestVarStatement$317(rest$478, context$475);
                    if (vsRes$544) {
                        return step$476(VariableStatement$308.create(head$477, vsRes$544.result), vsRes$544.rest);
                    }
                } else if (head$477.hasPrototype(Keyword$293) && keyword$485.token.value === 'let' && rest$478[0]) {
                    var vsRes$544 = enforestVarStatement$317(rest$478, context$475);
                    if (vsRes$544) {
                        return step$476(LetStatement$309.create(head$477, vsRes$544.result), vsRes$544.rest);
                    }
                } else if (head$477.hasPrototype(Keyword$293) && keyword$485.token.value === 'const' && rest$478[0]) {
                    var vsRes$544 = enforestVarStatement$317(rest$478, context$475);
                    if (vsRes$544) {
                        return step$476(ConstStatement$310.create(head$477, vsRes$544.result), vsRes$544.rest);
                    }
                }
            } else {
                parser$166.assert(head$477 && head$477.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$477.token.type === parser$166.Token.Identifier || head$477.token.type === parser$166.Token.Keyword || head$477.token.type === parser$166.Token.Punctuator) && context$475.env.has(resolve$269(head$477))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$545 = fresh$275();
                    var transformerContext$546 = makeExpanderContext$328(_$165.defaults({ mark: newMark$545 }, context$475));
                    // pull the macro transformer out the environment
                    var transformer$547 = context$475.env.get(resolve$269(head$477)).fn;
                    // apply the transformer
                    var rt$548 = transformer$547([head$477].concat(rest$478), transformerContext$546);
                    if (!Array.isArray(rt$548.result)) {
                        throwError$256('Macro transformer must return a result array, not: ' + rt$548.result);
                    }
                    if (rt$548.result.length > 0) {
                        var adjustedResult$549 = adjustLineContext$318(rt$548.result, head$477);
                        adjustedResult$549[0].token.leadingComments = head$477.token.leadingComments;
                        return step$476(adjustedResult$549[0], adjustedResult$549.slice(1).concat(rt$548.rest));
                    } else {
                        return step$476(Empty$313.create(), rt$548.rest);
                    }
                }    // anon macro definition
                else if (head$477.token.type === parser$166.Token.Identifier && head$477.token.value === 'macro' && rest$478[0] && rest$478[0].token.value === '{}') {
                    return step$476(AnonMacro$302.create(rest$478[0].expose().token.inner), rest$478.slice(1));
                }    // macro definition
                else if (head$477.token.type === parser$166.Token.Identifier && head$477.token.value === 'macro' && rest$478[0] && (rest$478[0].token.type === parser$166.Token.Identifier || rest$478[0].token.type === parser$166.Token.Keyword || rest$478[0].token.type === parser$166.Token.Punctuator) && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '{}') {
                    return step$476(Macro$301.create(rest$478[0], rest$478[1].expose().token.inner), rest$478.slice(2));
                }    // module definition
                else if (head$477.token.value === 'module' && rest$478[0] && rest$478[0].token.value === '{}') {
                    return step$476(Module$312.create(rest$478[0]), rest$478.slice(1));
                }    // function definition
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'function' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Identifier && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '()' && rest$478[2] && rest$478[2].token.type === parser$166.Token.Delimiter && rest$478[2].token.value === '{}') {
                    rest$478[1].token.inner = rest$478[1].expose().token.inner;
                    rest$478[2].token.inner = rest$478[2].expose().token.inner;
                    return step$476(NamedFun$297.create(head$477, null, rest$478[0], rest$478[1], rest$478[2]), rest$478.slice(3));
                }    // generator function definition
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'function' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator && rest$478[0].token.value === '*' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Identifier && rest$478[2] && rest$478[2].token.type === parser$166.Token.Delimiter && rest$478[2].token.value === '()' && rest$478[3] && rest$478[3].token.type === parser$166.Token.Delimiter && rest$478[3].token.value === '{}') {
                    rest$478[2].token.inner = rest$478[2].expose().token.inner;
                    rest$478[3].token.inner = rest$478[3].expose().token.inner;
                    return step$476(NamedFun$297.create(head$477, rest$478[0], rest$478[1], rest$478[2], rest$478[3]), rest$478.slice(4));
                }    // anonymous function definition
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'function' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Delimiter && rest$478[0].token.value === '()' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '{}') {
                    rest$478[0].token.inner = rest$478[0].expose().token.inner;
                    rest$478[1].token.inner = rest$478[1].expose().token.inner;
                    return step$476(AnonFun$298.create(head$477, null, rest$478[0], rest$478[1]), rest$478.slice(2));
                }    // anonymous generator function definition
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'function' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator && rest$478[0].token.value === '*' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '()' && rest$478[2] && rest$478[2].token.type === parser$166.Token.Delimiter && rest$478[2].token.value === '{}') {
                    rest$478[1].token.inner = rest$478[1].expose().token.inner;
                    rest$478[2].token.inner = rest$478[2].expose().token.inner;
                    return step$476(AnonFun$298.create(head$477, rest$478[0], rest$478[1], rest$478[2]), rest$478.slice(3));
                }    // arrow function
                else if ((head$477.token.type === parser$166.Token.Delimiter && head$477.token.value === '()' || head$477.token.type === parser$166.Token.Identifier) && rest$478[0] && rest$478[0].token.type === parser$166.Token.Punctuator && rest$478[0].token.value === '=>' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '{}') {
                    return step$476(ArrowFun$299.create(head$477, rest$478[0], rest$478[1]), rest$478.slice(2));
                }    // catch statement
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'catch' && rest$478[0] && rest$478[0].token.type === parser$166.Token.Delimiter && rest$478[0].token.value === '()' && rest$478[1] && rest$478[1].token.type === parser$166.Token.Delimiter && rest$478[1].token.value === '{}') {
                    rest$478[0].token.inner = rest$478[0].expose().token.inner;
                    rest$478[1].token.inner = rest$478[1].expose().token.inner;
                    return step$476(CatchClause$311.create(head$477, rest$478[0], rest$478[1]), rest$478.slice(2));
                }    // this expression
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'this') {
                    return step$476(ThisExpression$283.create(head$477), rest$478);
                }    // literal
                else if (head$477.token.type === parser$166.Token.NumericLiteral || head$477.token.type === parser$166.Token.StringLiteral || head$477.token.type === parser$166.Token.BooleanLiteral || head$477.token.type === parser$166.Token.RegularExpression || head$477.token.type === parser$166.Token.NullLiteral) {
                    return step$476(Lit$284.create(head$477), rest$478);
                }    // export
                else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'export' && rest$478[0] && (rest$478[0].token.type === parser$166.Token.Identifier || rest$478[0].token.type === parser$166.Token.Keyword || rest$478[0].token.type === parser$166.Token.Punctuator)) {
                    return step$476(Export$314.create(rest$478[0]), rest$478.slice(1));
                }    // identifier
                else if (head$477.token.type === parser$166.Token.Identifier) {
                    return step$476(Id$296.create(head$477), rest$478);
                }    // punctuator
                else if (head$477.token.type === parser$166.Token.Punctuator) {
                    return step$476(Punc$294.create(head$477), rest$478);
                } else if (head$477.token.type === parser$166.Token.Keyword && head$477.token.value === 'with') {
                    throwError$256('with is not supported in sweet.js');
                }    // keyword
                else if (head$477.token.type === parser$166.Token.Keyword) {
                    return step$476(Keyword$293.create(head$477), rest$478);
                }    // Delimiter
                else if (head$477.token.type === parser$166.Token.Delimiter) {
                    return step$476(Delimiter$295.create(head$477.expose()), rest$478);
                }    // end of file
                else if (head$477.token.type === parser$166.Token.EOF) {
                    parser$166.assert(rest$478.length === 0, 'nothing should be after an EOF');
                    return step$476(EOF$279.create(head$477), []);
                } else {
                    // todo: are we missing cases?
                    parser$166.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$477,
                rest: rest$478
            };
        }
        return step$476(toks$474[0], toks$474.slice(1));
    }
    function get_expression$320(stx$550, context$551) {
        var res$552 = enforest$319(stx$550, context$551);
        if (!res$552.result.hasPrototype(Expr$281)) {
            return {
                result: null,
                rest: stx$550
            };
        }
        return res$552;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$321(newMark$553, env$554) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$555(match$556) {
            if (match$556.level === 0) {
                // replace the match property with the marked syntax
                match$556.match = _$165.map(match$556.match, function (stx$557) {
                    return stx$557.mark(newMark$553);
                });
            } else {
                _$165.each(match$556.match, function (match$558) {
                    dfs$555(match$558);
                });
            }
        }
        _$165.keys(env$554).forEach(function (key$559) {
            dfs$555(env$554[key$559]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$322(mac$560, context$561) {
        var body$562 = mac$560.body;
        // raw function primitive form
        if (!(body$562[0] && body$562[0].token.type === parser$166.Token.Keyword && body$562[0].token.value === 'function')) {
            throwError$256('Primitive macro form must contain a function for the macro body');
        }
        var stub$563 = parser$166.read('()');
        stub$563[0].token.inner = body$562;
        var expanded$564 = expand$327(stub$563, context$561);
        expanded$564 = expanded$564[0].destruct().concat(expanded$564[1].eof);
        var flattend$565 = flatten$330(expanded$564);
        var bodyCode$566 = codegen$172.generate(parser$166.parse(flattend$565));
        var macroFn$567 = scopedEval$257(bodyCode$566, {
                makeValue: syn$167.makeValue,
                makeRegex: syn$167.makeRegex,
                makeIdent: syn$167.makeIdent,
                makeKeyword: syn$167.makeKeyword,
                makePunc: syn$167.makePunc,
                makeDelim: syn$167.makeDelim,
                unwrapSyntax: syn$167.unwrapSyntax,
                throwSyntaxError: syn$167.throwSyntaxError,
                parser: parser$166,
                _: _$165,
                patternModule: patternModule$170,
                getTemplate: function (id$568) {
                    return cloneSyntaxArray$323(context$561.templateMap.get(id$568));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$321,
                mergeMatches: function (newMatch$569, oldMatch$570) {
                    newMatch$569.patternEnv = _$165.extend({}, oldMatch$570.patternEnv, newMatch$569.patternEnv);
                    return newMatch$569;
                }
            });
        return macroFn$567;
    }
    function cloneSyntaxArray$323(arr$571) {
        return arr$571.map(function (stx$572) {
            var o$573 = syntaxFromToken$265(_$165.clone(stx$572.token), stx$572);
            if (o$573.token.type === parser$166.Token.Delimiter) {
                o$573.token.inner = cloneSyntaxArray$323(o$573.token.inner);
            }
            return o$573;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$324(stx$574, context$575) {
        parser$166.assert(context$575, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$574.length === 0) {
            return {
                terms: [],
                context: context$575
            };
        }
        parser$166.assert(stx$574[0].token, 'expecting a syntax object');
        var f$576 = enforest$319(stx$574, context$575);
        // head :: TermTree
        var head$577 = f$576.result;
        // rest :: [Syntax]
        var rest$578 = f$576.rest;
        if (head$577.hasPrototype(Macro$301)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$580 = loadMacroDef$322(head$577, context$575);
            addToDefinitionCtx$325([head$577.name], context$575.defscope, false);
            context$575.env.set(resolve$269(head$577.name), { fn: macroDefinition$580 });
            return expandToTermTree$324(rest$578, context$575);
        }
        if (head$577.hasPrototype(LetMacro$300)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$580 = loadMacroDef$322(head$577, context$575);
            var freshName$581 = fresh$275();
            var renamedName$582 = head$577.name.rename(head$577.name, freshName$581);
            rest$578 = _$165.map(rest$578, function (stx$583) {
                return stx$583.rename(head$577.name, freshName$581);
            });
            head$577.name = renamedName$582;
            context$575.env.set(resolve$269(head$577.name), { fn: macroDefinition$580 });
            return expandToTermTree$324(rest$578, context$575);
        }
        if (head$577.hasPrototype(LetStatement$309) || head$577.hasPrototype(ConstStatement$310)) {
            head$577.decls.forEach(function (decl$584) {
                var freshName$585 = fresh$275();
                var renamedDecl$586 = decl$584.ident.rename(decl$584.ident, freshName$585);
                rest$578 = rest$578.map(function (stx$587) {
                    return stx$587.rename(decl$584.ident, freshName$585);
                });
                decl$584.ident = renamedDecl$586;
            });
        }
        if (head$577.hasPrototype(NamedFun$297)) {
            addToDefinitionCtx$325([head$577.name], context$575.defscope, true);
        }
        if (head$577.hasPrototype(Id$296) && head$577.id.token.value === '#quoteSyntax' && rest$578[0] && rest$578[0].token.value === '{}') {
            var tempId$588 = fresh$275();
            context$575.templateMap.set(tempId$588, rest$578[0].token.inner);
            return expandToTermTree$324([
                syn$167.makeIdent('getTemplate', head$577.id),
                syn$167.makeDelim('()', [syn$167.makeValue(tempId$588, head$577.id)], head$577.id)
            ].concat(rest$578.slice(1)), context$575);
        }
        if (head$577.hasPrototype(VariableStatement$308)) {
            addToDefinitionCtx$325(_$165.map(head$577.decls, function (decl$589) {
                return decl$589.ident;
            }), context$575.defscope, true);
        }
        if (head$577.hasPrototype(Block$286) && head$577.body.hasPrototype(Delimiter$295)) {
            head$577.body.delim.token.inner.forEach(function (term$590) {
                if (term$590.hasPrototype(VariableStatement$308)) {
                    addToDefinitionCtx$325(_$165.map(term$590.decls, function (decl$591) {
                        return decl$591.ident;
                    }), context$575.defscope, true);
                }
            });
        }
        if (head$577.hasPrototype(Delimiter$295)) {
            head$577.delim.token.inner.forEach(function (term$592) {
                if (term$592.hasPrototype(VariableStatement$308)) {
                    addToDefinitionCtx$325(_$165.map(term$592.decls, function (decl$593) {
                        return decl$593.ident;
                    }), context$575.defscope, true);
                }
            });
        }
        var trees$579 = expandToTermTree$324(rest$578, context$575);
        return {
            terms: [head$577].concat(trees$579.terms),
            context: trees$579.context
        };
    }
    function addToDefinitionCtx$325(idents$594, defscope$595, skipRep$596) {
        parser$166.assert(idents$594 && idents$594.length > 0, 'expecting some variable identifiers');
        skipRep$596 = skipRep$596 || false;
        _$165.each(idents$594, function (id$597) {
            var skip$598 = false;
            if (skipRep$596) {
                var declRepeat$599 = _$165.find(defscope$595, function (def$600) {
                        return def$600.id.token.value === id$597.token.value && arraysEqual$270(marksof$268(def$600.id.context), marksof$268(id$597.context));
                    });
                skip$598 = typeof declRepeat$599 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$598) {
                var name$601 = fresh$275();
                defscope$595.push({
                    id: id$597,
                    name: name$601
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$326(term$602, context$603) {
        parser$166.assert(context$603 && context$603.env, 'environment map is required');
        if (term$602.hasPrototype(ArrayLiteral$287)) {
            term$602.array.delim.token.inner = expand$327(term$602.array.delim.expose().token.inner, context$603);
            return term$602;
        } else if (term$602.hasPrototype(Block$286)) {
            term$602.body.delim.token.inner = expand$327(term$602.body.delim.expose().token.inner, context$603);
            return term$602;
        } else if (term$602.hasPrototype(ParenExpression$288)) {
            term$602.expr.delim.token.inner = expand$327(term$602.expr.delim.expose().token.inner, context$603);
            return term$602;
        } else if (term$602.hasPrototype(Call$304)) {
            term$602.fun = expandTermTreeToFinal$326(term$602.fun, context$603);
            term$602.args = _$165.map(term$602.args, function (arg$604) {
                return expandTermTreeToFinal$326(arg$604, context$603);
            });
            return term$602;
        } else if (term$602.hasPrototype(UnaryOp$289)) {
            term$602.expr = expandTermTreeToFinal$326(term$602.expr, context$603);
            return term$602;
        } else if (term$602.hasPrototype(BinOp$291)) {
            term$602.left = expandTermTreeToFinal$326(term$602.left, context$603);
            term$602.right = expandTermTreeToFinal$326(term$602.right, context$603);
            return term$602;
        } else if (term$602.hasPrototype(ObjGet$306)) {
            term$602.right.delim.token.inner = expand$327(term$602.right.delim.expose().token.inner, context$603);
            return term$602;
        } else if (term$602.hasPrototype(ObjDotGet$305)) {
            term$602.left = expandTermTreeToFinal$326(term$602.left, context$603);
            term$602.right = expandTermTreeToFinal$326(term$602.right, context$603);
            return term$602;
        } else if (term$602.hasPrototype(VariableDeclaration$307)) {
            if (term$602.init) {
                term$602.init = expandTermTreeToFinal$326(term$602.init, context$603);
            }
            return term$602;
        } else if (term$602.hasPrototype(VariableStatement$308)) {
            term$602.decls = _$165.map(term$602.decls, function (decl$605) {
                return expandTermTreeToFinal$326(decl$605, context$603);
            });
            return term$602;
        } else if (term$602.hasPrototype(Delimiter$295)) {
            // expand inside the delimiter and then continue on
            term$602.delim.token.inner = expand$327(term$602.delim.expose().token.inner, context$603);
            return term$602;
        } else if (term$602.hasPrototype(NamedFun$297) || term$602.hasPrototype(AnonFun$298) || term$602.hasPrototype(CatchClause$311) || term$602.hasPrototype(ArrowFun$299) || term$602.hasPrototype(Module$312)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$606 = [];
            var bodyContext$607 = makeExpanderContext$328(_$165.defaults({ defscope: newDef$606 }, context$603));
            var paramSingleIdent$608 = term$602.params && term$602.params.token.type === parser$166.Token.Identifier;
            if (term$602.params && term$602.params.token.type === parser$166.Token.Delimiter) {
                var params$615 = term$602.params.expose();
            } else if (paramSingleIdent$608) {
                var params$615 = term$602.params;
            } else {
                var params$615 = syn$167.makeDelim('()', [], null);
            }
            if (Array.isArray(term$602.body)) {
                var bodies$616 = syn$167.makeDelim('{}', term$602.body, null);
            } else {
                var bodies$616 = term$602.body;
            }
            bodies$616 = bodies$616.addDefCtx(newDef$606);
            var paramNames$609 = _$165.map(getParamIdentifiers$277(params$615), function (param$617) {
                    var freshName$618 = fresh$275();
                    return {
                        freshName: freshName$618,
                        originalParam: param$617,
                        renamedParam: param$617.rename(param$617, freshName$618)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$610 = _$165.reduce(paramNames$609, function (accBody$619, p$620) {
                    return accBody$619.rename(p$620.originalParam, p$620.freshName);
                }, bodies$616);
            renamedBody$610 = renamedBody$610.expose();
            var expandedResult$611 = expandToTermTree$324(renamedBody$610.token.inner, bodyContext$607);
            var bodyTerms$612 = expandedResult$611.terms;
            var renamedParams$613 = _$165.map(paramNames$609, function (p$621) {
                    return p$621.renamedParam;
                });
            if (paramSingleIdent$608) {
                var flatArgs$622 = renamedParams$613[0];
            } else {
                var flatArgs$622 = syn$167.makeDelim('()', joinSyntax$266(renamedParams$613, ','), term$602.params);
            }
            var expandedArgs$614 = expand$327([flatArgs$622], bodyContext$607);
            parser$166.assert(expandedArgs$614.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$602.params) {
                term$602.params = expandedArgs$614[0];
            }
            bodyTerms$612 = _$165.map(bodyTerms$612, function (bodyTerm$623) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$624 = bodyTerm$623.addDefCtx(newDef$606);
                // finish expansion
                return expandTermTreeToFinal$326(termWithCtx$624, expandedResult$611.context);
            });
            if (term$602.hasPrototype(Module$312)) {
                bodyTerms$612 = _$165.filter(bodyTerms$612, function (bodyTerm$625) {
                    if (bodyTerm$625.hasPrototype(Export$314)) {
                        term$602.exports.push(bodyTerm$625);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$610.token.inner = bodyTerms$612;
            if (Array.isArray(term$602.body)) {
                term$602.body = renamedBody$610.token.inner;
            } else {
                term$602.body = renamedBody$610;
            }
            // and continue expand the rest
            return term$602;
        }
        // the term is fine as is
        return term$602;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$327(stx$626, context$627) {
        parser$166.assert(context$627, 'must provide an expander context');
        var trees$628 = expandToTermTree$324(stx$626, context$627);
        return _$165.map(trees$628.terms, function (term$629) {
            return expandTermTreeToFinal$326(term$629, trees$628.context);
        });
    }
    function makeExpanderContext$328(o$630) {
        o$630 = o$630 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$630.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$630.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$630.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$630.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$329(stx$631, builtinSource$632) {
        var env$633 = new Map();
        var params$634 = [];
        var context$635, builtInContext$636 = makeExpanderContext$328({ env: env$633 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$632) {
            var builtinRead$639 = parser$166.read(builtinSource$632);
            builtinRead$639 = [
                syn$167.makeIdent('module', null),
                syn$167.makeDelim('{}', builtinRead$639, null)
            ];
            var builtinRes$640 = expand$327(builtinRead$639, builtInContext$636);
            params$634 = _$165.map(builtinRes$640[0].exports, function (term$641) {
                return {
                    oldExport: term$641.name,
                    newParam: syn$167.makeIdent(term$641.name.token.value, null)
                };
            });
        }
        var modBody$637 = syn$167.makeDelim('{}', stx$631, null);
        modBody$637 = _$165.reduce(params$634, function (acc$642, param$643) {
            var newName$644 = fresh$275();
            env$633.set(resolve$269(param$643.newParam.rename(param$643.newParam, newName$644)), env$633.get(resolve$269(param$643.oldExport)));
            return acc$642.rename(param$643.newParam, newName$644);
        }, modBody$637);
        context$635 = makeExpanderContext$328({ env: env$633 });
        var res$638 = expand$327([
                syn$167.makeIdent('module', null),
                modBody$637
            ], context$635);
        res$638 = res$638[0].destruct();
        return flatten$330(res$638[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$330(stx$645) {
        return _$165.reduce(stx$645, function (acc$646, stx$647) {
            if (stx$647.token.type === parser$166.Token.Delimiter) {
                var exposed$648 = stx$647.expose();
                var openParen$649 = syntaxFromToken$265({
                        type: parser$166.Token.Punctuator,
                        value: stx$647.token.value[0],
                        range: stx$647.token.startRange,
                        sm_range: typeof stx$647.token.sm_startRange == 'undefined' ? stx$647.token.startRange : stx$647.token.sm_startRange,
                        lineNumber: stx$647.token.startLineNumber,
                        sm_lineNumber: typeof stx$647.token.sm_startLineNumber == 'undefined' ? stx$647.token.startLineNumber : stx$647.token.sm_startLineNumber,
                        lineStart: stx$647.token.startLineStart,
                        sm_lineStart: typeof stx$647.token.sm_startLineStart == 'undefined' ? stx$647.token.startLineStart : stx$647.token.sm_startLineStart
                    }, exposed$648);
                var closeParen$650 = syntaxFromToken$265({
                        type: parser$166.Token.Punctuator,
                        value: stx$647.token.value[1],
                        range: stx$647.token.endRange,
                        sm_range: typeof stx$647.token.sm_endRange == 'undefined' ? stx$647.token.endRange : stx$647.token.sm_endRange,
                        lineNumber: stx$647.token.endLineNumber,
                        sm_lineNumber: typeof stx$647.token.sm_endLineNumber == 'undefined' ? stx$647.token.endLineNumber : stx$647.token.sm_endLineNumber,
                        lineStart: stx$647.token.endLineStart,
                        sm_lineStart: typeof stx$647.token.sm_endLineStart == 'undefined' ? stx$647.token.endLineStart : stx$647.token.sm_endLineStart
                    }, exposed$648);
                if (stx$647.token.leadingComments) {
                    openParen$649.token.leadingComments = stx$647.token.leadingComments;
                }
                if (stx$647.token.trailingComments) {
                    openParen$649.token.trailingComments = stx$647.token.trailingComments;
                }
                return acc$646.concat(openParen$649).concat(flatten$330(exposed$648.token.inner)).concat(closeParen$650);
            }
            stx$647.token.sm_lineNumber = stx$647.token.sm_lineNumber ? stx$647.token.sm_lineNumber : stx$647.token.lineNumber;
            stx$647.token.sm_lineStart = stx$647.token.sm_lineStart ? stx$647.token.sm_lineStart : stx$647.token.lineStart;
            stx$647.token.sm_range = stx$647.token.sm_range ? stx$647.token.sm_range : stx$647.token.range;
            return acc$646.concat(stx$647);
        }, []);
    }
    exports$164.enforest = enforest$319;
    exports$164.expand = expandTopLevel$329;
    exports$164.resolve = resolve$269;
    exports$164.get_expression = get_expression$320;
    exports$164.makeExpanderContext = makeExpanderContext$328;
    exports$164.Expr = Expr$281;
    exports$164.VariableStatement = VariableStatement$308;
    exports$164.tokensToSyntax = syn$167.tokensToSyntax;
    exports$164.syntaxToTokens = syn$167.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map