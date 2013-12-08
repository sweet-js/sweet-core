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
(function (root$164, factory$165) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$165(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$165);
    }
}(this, function (exports$166, _$167, parser$168, syn$169, es6$170, se$171, patternModule$172, gen$173) {
    'use strict';
    var codegen$174 = gen$173 || escodegen;
    // used to export "private" methods for unit testing
    exports$166._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$333 = Object.create(this);
                if (typeof o$333.construct === 'function') {
                    o$333.construct.apply(o$333, arguments);
                }
                return o$333;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$334) {
                var result$335 = Object.create(this);
                for (var prop$336 in properties$334) {
                    if (properties$334.hasOwnProperty(prop$336)) {
                        result$335[prop$336] = properties$334[prop$336];
                    }
                }
                return result$335;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$337) {
                function F$338() {
                }
                F$338.prototype = proto$337;
                return this instanceof F$338;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$258(msg$339) {
        throw new Error(msg$339);
    }
    var scopedEval$259 = se$171.scopedEval;
    var Rename$260 = syn$169.Rename;
    var Mark$261 = syn$169.Mark;
    var Var$262 = syn$169.Var;
    var Def$263 = syn$169.Def;
    var isDef$264 = syn$169.isDef;
    var isMark$265 = syn$169.isMark;
    var isRename$266 = syn$169.isRename;
    var syntaxFromToken$267 = syn$169.syntaxFromToken;
    var joinSyntax$268 = syn$169.joinSyntax;
    function remdup$269(mark$340, mlist$341) {
        if (mark$340 === _$167.first(mlist$341)) {
            return _$167.rest(mlist$341, 1);
        }
        return [mark$340].concat(mlist$341);
    }
    // (CSyntax) -> [...Num]
    function marksof$270(ctx$342, stopName$343, originalName$344) {
        var mark$345, submarks$346;
        if (isMark$265(ctx$342)) {
            mark$345 = ctx$342.mark;
            submarks$346 = marksof$270(ctx$342.context, stopName$343, originalName$344);
            return remdup$269(mark$345, submarks$346);
        }
        if (isDef$264(ctx$342)) {
            return marksof$270(ctx$342.context, stopName$343, originalName$344);
        }
        if (isRename$266(ctx$342)) {
            if (stopName$343 === originalName$344 + '$' + ctx$342.name) {
                return [];
            }
            return marksof$270(ctx$342.context, stopName$343, originalName$344);
        }
        return [];
    }
    function resolve$271(stx$347) {
        return resolveCtx$275(stx$347.token.value, stx$347.context, [], []);
    }
    function arraysEqual$272(a$348, b$349) {
        if (a$348.length !== b$349.length) {
            return false;
        }
        for (var i$350 = 0; i$350 < a$348.length; i$350++) {
            if (a$348[i$350] !== b$349[i$350]) {
                return false;
            }
        }
        return true;
    }
    function renames$273(defctx$351, oldctx$352, originalName$353) {
        var acc$354 = oldctx$352;
        for (var i$355 = 0; i$355 < defctx$351.length; i$355++) {
            if (defctx$351[i$355].id.token.value === originalName$353) {
                acc$354 = Rename$260(defctx$351[i$355].id, defctx$351[i$355].name, acc$354, defctx$351);
            }
        }
        return acc$354;
    }
    function unionEl$274(arr$356, el$357) {
        if (arr$356.indexOf(el$357) === -1) {
            var res$358 = arr$356.slice(0);
            res$358.push(el$357);
            return res$358;
        }
        return arr$356;
    }
    // (Syntax) -> String
    function resolveCtx$275(originalName$359, ctx$360, stop_spine$361, stop_branch$362) {
        if (isMark$265(ctx$360)) {
            return resolveCtx$275(originalName$359, ctx$360.context, stop_spine$361, stop_branch$362);
        }
        if (isDef$264(ctx$360)) {
            if (stop_spine$361.indexOf(ctx$360.defctx) !== -1) {
                return resolveCtx$275(originalName$359, ctx$360.context, stop_spine$361, stop_branch$362);
            } else {
                return resolveCtx$275(originalName$359, renames$273(ctx$360.defctx, ctx$360.context, originalName$359), stop_spine$361, unionEl$274(stop_branch$362, ctx$360.defctx));
            }
        }
        if (isRename$266(ctx$360)) {
            if (originalName$359 === ctx$360.id.token.value) {
                var idName$363 = resolveCtx$275(ctx$360.id.token.value, ctx$360.id.context, stop_branch$362, stop_branch$362);
                var subName$364 = resolveCtx$275(originalName$359, ctx$360.context, unionEl$274(stop_spine$361, ctx$360.def), stop_branch$362);
                if (idName$363 === subName$364) {
                    var idMarks$365 = marksof$270(ctx$360.id.context, originalName$359 + '$' + ctx$360.name, originalName$359);
                    var subMarks$366 = marksof$270(ctx$360.context, originalName$359 + '$' + ctx$360.name, originalName$359);
                    if (arraysEqual$272(idMarks$365, subMarks$366)) {
                        return originalName$359 + '$' + ctx$360.name;
                    }
                }
            }
            return resolveCtx$275(originalName$359, ctx$360.context, stop_spine$361, stop_branch$362);
        }
        return originalName$359;
    }
    var nextFresh$276 = 0;
    // fun () -> Num
    function fresh$277() {
        return nextFresh$276++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$278(towrap$367, delimSyntax$368) {
        parser$168.assert(delimSyntax$368.token.type === parser$168.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$267({
            type: parser$168.Token.Delimiter,
            value: delimSyntax$368.token.value,
            inner: towrap$367,
            range: delimSyntax$368.token.range,
            startLineNumber: delimSyntax$368.token.startLineNumber,
            lineStart: delimSyntax$368.token.lineStart
        }, delimSyntax$368);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$279(argSyntax$369) {
        if (argSyntax$369.token.type === parser$168.Token.Delimiter) {
            return _$167.filter(argSyntax$369.token.inner, function (stx$370) {
                return stx$370.token.value !== ',';
            });
        } else if (argSyntax$369.token.type === parser$168.Token.Identifier) {
            return [argSyntax$369];
        } else {
            parser$168.assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$280 = {
            destruct: function () {
                return _$167.reduce(this.properties, _$167.bind(function (acc$371, prop$372) {
                    if (this[prop$372] && this[prop$372].hasPrototype(TermTree$280)) {
                        return acc$371.concat(this[prop$372].destruct());
                    } else if (this[prop$372] && this[prop$372].token && this[prop$372].token.inner) {
                        this[prop$372].token.inner = _$167.reduce(this[prop$372].token.inner, function (acc$373, t$374) {
                            if (t$374.hasPrototype(TermTree$280)) {
                                return acc$373.concat(t$374.destruct());
                            }
                            return acc$373.concat(t$374);
                        }, []);
                        return acc$371.concat(this[prop$372]);
                    } else if (Array.isArray(this[prop$372])) {
                        return acc$371.concat(_$167.reduce(this[prop$372], function (acc$375, t$376) {
                            if (t$376.hasPrototype(TermTree$280)) {
                                return acc$375.concat(t$376.destruct());
                            }
                            return acc$375.concat(t$376);
                        }, []));
                    } else if (this[prop$372]) {
                        return acc$371.concat(this[prop$372]);
                    } else {
                        return acc$371;
                    }
                }, this), []);
            },
            addDefCtx: function (def$377) {
                for (var i$378 = 0; i$378 < this.properties.length; i$378++) {
                    var prop$379 = this.properties[i$378];
                    if (Array.isArray(this[prop$379])) {
                        this[prop$379] = _$167.map(this[prop$379], function (item$380) {
                            return item$380.addDefCtx(def$377);
                        });
                    } else if (this[prop$379]) {
                        this[prop$379] = this[prop$379].addDefCtx(def$377);
                    }
                }
                return this;
            }
        };
    var EOF$281 = TermTree$280.extend({
            properties: ['eof'],
            construct: function (e$381) {
                this.eof = e$381;
            }
        });
    var Statement$282 = TermTree$280.extend({
            construct: function () {
            }
        });
    var Expr$283 = TermTree$280.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$284 = Expr$283.extend({
            construct: function () {
            }
        });
    var ThisExpression$285 = PrimaryExpression$284.extend({
            properties: ['this'],
            construct: function (that$382) {
                this.this = that$382;
            }
        });
    var Lit$286 = PrimaryExpression$284.extend({
            properties: ['lit'],
            construct: function (l$383) {
                this.lit = l$383;
            }
        });
    exports$166._test.PropertyAssignment = PropertyAssignment$287;
    var PropertyAssignment$287 = TermTree$280.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$384, assignment$385) {
                this.propName = propName$384;
                this.assignment = assignment$385;
            }
        });
    var Block$288 = PrimaryExpression$284.extend({
            properties: ['body'],
            construct: function (body$386) {
                this.body = body$386;
            }
        });
    var ArrayLiteral$289 = PrimaryExpression$284.extend({
            properties: ['array'],
            construct: function (ar$387) {
                this.array = ar$387;
            }
        });
    var ParenExpression$290 = PrimaryExpression$284.extend({
            properties: ['expr'],
            construct: function (expr$388) {
                this.expr = expr$388;
            }
        });
    var UnaryOp$291 = Expr$283.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$389, expr$390) {
                this.op = op$389;
                this.expr = expr$390;
            }
        });
    var PostfixOp$292 = Expr$283.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$391, op$392) {
                this.expr = expr$391;
                this.op = op$392;
            }
        });
    var BinOp$293 = Expr$283.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$393, left$394, right$395) {
                this.op = op$393;
                this.left = left$394;
                this.right = right$395;
            }
        });
    var ConditionalExpression$294 = Expr$283.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$396, question$397, tru$398, colon$399, fls$400) {
                this.cond = cond$396;
                this.question = question$397;
                this.tru = tru$398;
                this.colon = colon$399;
                this.fls = fls$400;
            }
        });
    var Keyword$295 = TermTree$280.extend({
            properties: ['keyword'],
            construct: function (k$401) {
                this.keyword = k$401;
            }
        });
    var Punc$296 = TermTree$280.extend({
            properties: ['punc'],
            construct: function (p$402) {
                this.punc = p$402;
            }
        });
    var Delimiter$297 = TermTree$280.extend({
            properties: ['delim'],
            construct: function (d$403) {
                this.delim = d$403;
            }
        });
    var Id$298 = PrimaryExpression$284.extend({
            properties: ['id'],
            construct: function (id$404) {
                this.id = id$404;
            }
        });
    var NamedFun$299 = Expr$283.extend({
            properties: [
                'keyword',
                'star',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$405, star$406, name$407, params$408, body$409) {
                this.keyword = keyword$405;
                this.star = star$406;
                this.name = name$407;
                this.params = params$408;
                this.body = body$409;
            }
        });
    var AnonFun$300 = Expr$283.extend({
            properties: [
                'keyword',
                'star',
                'params',
                'body'
            ],
            construct: function (keyword$410, star$411, params$412, body$413) {
                this.keyword = keyword$410;
                this.star = star$411;
                this.params = params$412;
                this.body = body$413;
            }
        });
    var ArrowFun$301 = Expr$283.extend({
            properties: [
                'params',
                'arrow',
                'body'
            ],
            construct: function (params$414, arrow$415, body$416) {
                this.params = params$414;
                this.arrow = arrow$415;
                this.body = body$416;
            }
        });
    var LetMacro$302 = TermTree$280.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$417, body$418) {
                this.name = name$417;
                this.body = body$418;
            }
        });
    var Macro$303 = TermTree$280.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$419, body$420) {
                this.name = name$419;
                this.body = body$420;
            }
        });
    var AnonMacro$304 = TermTree$280.extend({
            properties: ['body'],
            construct: function (body$421) {
                this.body = body$421;
            }
        });
    var Const$305 = Expr$283.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$422, call$423) {
                this.newterm = newterm$422;
                this.call = call$423;
            }
        });
    var Call$306 = Expr$283.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$168.assert(this.fun.hasPrototype(TermTree$280), 'expecting a term tree in destruct of call');
                var that$424 = this;
                this.delim = syntaxFromToken$267(_$167.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$167.reduce(this.args, function (acc$425, term$426) {
                    parser$168.assert(term$426 && term$426.hasPrototype(TermTree$280), 'expecting term trees in destruct of Call');
                    var dst$427 = acc$425.concat(term$426.destruct());
                    // add all commas except for the last one
                    if (that$424.commas.length > 0) {
                        dst$427 = dst$427.concat(that$424.commas.shift());
                    }
                    return dst$427;
                }, []);
                return this.fun.destruct().concat(Delimiter$297.create(this.delim).destruct());
            },
            construct: function (funn$428, args$429, delim$430, commas$431) {
                parser$168.assert(Array.isArray(args$429), 'requires an array of arguments terms');
                this.fun = funn$428;
                this.args = args$429;
                this.delim = delim$430;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$431;
            }
        });
    var ObjDotGet$307 = Expr$283.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$432, dot$433, right$434) {
                this.left = left$432;
                this.dot = dot$433;
                this.right = right$434;
            }
        });
    var ObjGet$308 = Expr$283.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$435, right$436) {
                this.left = left$435;
                this.right = right$436;
            }
        });
    var VariableDeclaration$309 = TermTree$280.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$437, eqstx$438, init$439, comma$440) {
                this.ident = ident$437;
                this.eqstx = eqstx$438;
                this.init = init$439;
                this.comma = comma$440;
            }
        });
    var VariableStatement$310 = Statement$282.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$167.reduce(this.decls, function (acc$441, decl$442) {
                    return acc$441.concat(decl$442.destruct());
                }, []));
            },
            construct: function (varkw$443, decls$444) {
                parser$168.assert(Array.isArray(decls$444), 'decls must be an array');
                this.varkw = varkw$443;
                this.decls = decls$444;
            }
        });
    var LetStatement$311 = Statement$282.extend({
            properties: [
                'letkw',
                'decls'
            ],
            destruct: function () {
                return this.letkw.destruct().concat(_$167.reduce(this.decls, function (acc$445, decl$446) {
                    return acc$445.concat(decl$446.destruct());
                }, []));
            },
            construct: function (letkw$447, decls$448) {
                parser$168.assert(Array.isArray(decls$448), 'decls must be an array');
                this.letkw = letkw$447;
                this.decls = decls$448;
            }
        });
    var ConstStatement$312 = Statement$282.extend({
            properties: [
                'constkw',
                'decls'
            ],
            destruct: function () {
                return this.constkw.destruct().concat(_$167.reduce(this.decls, function (acc$449, decl$450) {
                    return acc$449.concat(decl$450.destruct());
                }, []));
            },
            construct: function (constkw$451, decls$452) {
                parser$168.assert(Array.isArray(decls$452), 'decls must be an array');
                this.constkw = constkw$451;
                this.decls = decls$452;
            }
        });
    var CatchClause$313 = TermTree$280.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$453, params$454, body$455) {
                this.catchkw = catchkw$453;
                this.params = params$454;
                this.body = body$455;
            }
        });
    var Module$314 = TermTree$280.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$456) {
                this.body = body$456;
                this.exports = [];
            }
        });
    var Empty$315 = TermTree$280.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$316 = TermTree$280.extend({
            properties: ['name'],
            construct: function (name$457) {
                this.name = name$457;
            }
        });
    function stxIsUnaryOp$317(stx$458) {
        var staticOperators$459 = [
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
        return _$167.contains(staticOperators$459, stx$458.token.value);
    }
    function stxIsBinOp$318(stx$460) {
        var staticOperators$461 = [
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
        return _$167.contains(staticOperators$461, stx$460.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$319(stx$462, context$463) {
        var decls$464 = [];
        var res$465 = enforest$321(stx$462, context$463);
        var result$466 = res$465.result;
        var rest$467 = res$465.rest;
        if (rest$467[0]) {
            var nextRes$468 = enforest$321(rest$467, context$463);
            // x = ...
            if (nextRes$468.result.hasPrototype(Punc$296) && nextRes$468.result.punc.token.value === '=') {
                var initializerRes$469 = enforest$321(nextRes$468.rest, context$463);
                if (initializerRes$469.rest[0]) {
                    var restRes$470 = enforest$321(initializerRes$469.rest, context$463);
                    // x = y + z, ...
                    if (restRes$470.result.hasPrototype(Punc$296) && restRes$470.result.punc.token.value === ',') {
                        decls$464.push(VariableDeclaration$309.create(result$466.id, nextRes$468.result.punc, initializerRes$469.result, restRes$470.result.punc));
                        var subRes$471 = enforestVarStatement$319(restRes$470.rest, context$463);
                        decls$464 = decls$464.concat(subRes$471.result);
                        rest$467 = subRes$471.rest;
                    }    // x = y ...
                    else {
                        decls$464.push(VariableDeclaration$309.create(result$466.id, nextRes$468.result.punc, initializerRes$469.result));
                        rest$467 = initializerRes$469.rest;
                    }
                }    // x = y EOF
                else {
                    decls$464.push(VariableDeclaration$309.create(result$466.id, nextRes$468.result.punc, initializerRes$469.result));
                }
            }    // x ,...;
            else if (nextRes$468.result.hasPrototype(Punc$296) && nextRes$468.result.punc.token.value === ',') {
                decls$464.push(VariableDeclaration$309.create(result$466.id, null, null, nextRes$468.result.punc));
                var subRes$471 = enforestVarStatement$319(nextRes$468.rest, context$463);
                decls$464 = decls$464.concat(subRes$471.result);
                rest$467 = subRes$471.rest;
            } else {
                if (result$466.hasPrototype(Id$298)) {
                    decls$464.push(VariableDeclaration$309.create(result$466.id));
                } else {
                    throwError$258('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$466.hasPrototype(Id$298)) {
                decls$464.push(VariableDeclaration$309.create(result$466.id));
            } else if (result$466.hasPrototype(BinOp$293) && result$466.op.token.value === 'in') {
                decls$464.push(VariableDeclaration$309.create(result$466.left.id, result$466.op, result$466.right));
            } else {
                throwError$258('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$464,
            rest: rest$467
        };
    }
    function adjustLineContext$320(stx$472, original$473, current$474) {
        current$474 = current$474 || {
            lastLineNumber: original$473.token.lineNumber,
            lineNumber: original$473.token.lineNumber - 1
        };
        return _$167.map(stx$472, function (stx$475) {
            if (stx$475.token.type === parser$168.Token.Delimiter) {
                // handle tokens with missing line info
                stx$475.token.startLineNumber = typeof stx$475.token.startLineNumber == 'undefined' ? original$473.token.lineNumber : stx$475.token.startLineNumber;
                stx$475.token.endLineNumber = typeof stx$475.token.endLineNumber == 'undefined' ? original$473.token.lineNumber : stx$475.token.endLineNumber;
                stx$475.token.startLineStart = typeof stx$475.token.startLineStart == 'undefined' ? original$473.token.lineStart : stx$475.token.startLineStart;
                stx$475.token.endLineStart = typeof stx$475.token.endLineStart == 'undefined' ? original$473.token.lineStart : stx$475.token.endLineStart;
                stx$475.token.startRange = typeof stx$475.token.startRange == 'undefined' ? original$473.token.range : stx$475.token.startRange;
                stx$475.token.endRange = typeof stx$475.token.endRange == 'undefined' ? original$473.token.range : stx$475.token.endRange;
                stx$475.token.sm_startLineNumber = typeof stx$475.token.sm_startLineNumber == 'undefined' ? stx$475.token.startLineNumber : stx$475.token.sm_startLineNumber;
                stx$475.token.sm_endLineNumber = typeof stx$475.token.sm_endLineNumber == 'undefined' ? stx$475.token.endLineNumber : stx$475.token.sm_endLineNumber;
                stx$475.token.sm_startLineStart = typeof stx$475.token.sm_startLineStart == 'undefined' ? stx$475.token.startLineStart : stx$475.token.sm_startLineStart;
                stx$475.token.sm_endLineStart = typeof stx$475.token.sm_endLineStart == 'undefined' ? stx$475.token.endLineStart : stx$475.token.sm_endLineStart;
                stx$475.token.sm_startRange = typeof stx$475.token.sm_startRange == 'undefined' ? stx$475.token.startRange : stx$475.token.sm_startRange;
                stx$475.token.sm_endRange = typeof stx$475.token.sm_endRange == 'undefined' ? stx$475.token.endRange : stx$475.token.sm_endRange;
                if (stx$475.token.startLineNumber === current$474.lastLineNumber && current$474.lastLineNumber !== current$474.lineNumber) {
                    stx$475.token.startLineNumber = current$474.lineNumber;
                } else if (stx$475.token.startLineNumber !== current$474.lastLineNumber) {
                    current$474.lineNumber++;
                    current$474.lastLineNumber = stx$475.token.startLineNumber;
                    stx$475.token.startLineNumber = current$474.lineNumber;
                }
                if (stx$475.token.inner.length > 0) {
                    stx$475.token.inner = adjustLineContext$320(stx$475.token.inner, original$473, current$474);
                }
                return stx$475;
            }
            // handle tokens with missing line info
            stx$475.token.lineNumber = typeof stx$475.token.lineNumber == 'undefined' ? original$473.token.lineNumber : stx$475.token.lineNumber;
            stx$475.token.lineStart = typeof stx$475.token.lineStart == 'undefined' ? original$473.token.lineStart : stx$475.token.lineStart;
            stx$475.token.range = typeof stx$475.token.range == 'undefined' ? original$473.token.range : stx$475.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$475.token.sm_lineNumber = typeof stx$475.token.sm_lineNumber == 'undefined' ? stx$475.token.lineNumber : stx$475.token.sm_lineNumber;
            stx$475.token.sm_lineStart = typeof stx$475.token.sm_lineStart == 'undefined' ? stx$475.token.lineStart : stx$475.token.sm_lineStart;
            stx$475.token.sm_range = typeof stx$475.token.sm_range == 'undefined' ? _$167.clone(stx$475.token.range) : stx$475.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            if (stx$475.token.lineNumber === current$474.lastLineNumber && current$474.lastLineNumber !== current$474.lineNumber) {
                stx$475.token.lineNumber = current$474.lineNumber;
            } else if (stx$475.token.lineNumber !== current$474.lastLineNumber) {
                current$474.lineNumber++;
                current$474.lastLineNumber = stx$475.token.lineNumber;
                stx$475.token.lineNumber = current$474.lineNumber;
            }
            return stx$475;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$321(toks$476, context$477) {
        parser$168.assert(toks$476.length > 0, 'enforest assumes there are tokens to work with');
        function step$478(head$479, rest$480) {
            var innerTokens$481;
            parser$168.assert(Array.isArray(rest$480), 'result must at least be an empty array');
            if (head$479.hasPrototype(TermTree$280)) {
                // function call
                var emp$484 = head$479.emp;
                var emp$484 = head$479.emp;
                var keyword$487 = head$479.keyword;
                var delim$489 = head$479.delim;
                var id$491 = head$479.id;
                var delim$489 = head$479.delim;
                var emp$484 = head$479.emp;
                var punc$495 = head$479.punc;
                var keyword$487 = head$479.keyword;
                var emp$484 = head$479.emp;
                var emp$484 = head$479.emp;
                var emp$484 = head$479.emp;
                var delim$489 = head$479.delim;
                var delim$489 = head$479.delim;
                var id$491 = head$479.id;
                var keyword$487 = head$479.keyword;
                var keyword$487 = head$479.keyword;
                var keyword$487 = head$479.keyword;
                var keyword$487 = head$479.keyword;
                if (head$479.hasPrototype(Expr$283) && rest$480[0] && rest$480[0].token.type === parser$168.Token.Delimiter && rest$480[0].token.value === '()') {
                    var argRes$528, enforestedArgs$529 = [], commas$530 = [];
                    rest$480[0].expose();
                    innerTokens$481 = rest$480[0].token.inner;
                    while (innerTokens$481.length > 0) {
                        argRes$528 = enforest$321(innerTokens$481, context$477);
                        enforestedArgs$529.push(argRes$528.result);
                        innerTokens$481 = argRes$528.rest;
                        if (innerTokens$481[0] && innerTokens$481[0].token.value === ',') {
                            // record the comma for later
                            commas$530.push(innerTokens$481[0]);
                            // but dump it for the next loop turn
                            innerTokens$481 = innerTokens$481.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$531 = _$167.all(enforestedArgs$529, function (argTerm$532) {
                            return argTerm$532.hasPrototype(Expr$283);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$481.length === 0 && argsAreExprs$531) {
                        return step$478(Call$306.create(head$479, enforestedArgs$529, rest$480[0], commas$530), rest$480.slice(1));
                    }
                } else if (head$479.hasPrototype(Expr$283) && rest$480[0] && rest$480[0].token.value === '?') {
                    var question$533 = rest$480[0];
                    var condRes$534 = enforest$321(rest$480.slice(1), context$477);
                    var truExpr$535 = condRes$534.result;
                    var right$536 = condRes$534.rest;
                    if (truExpr$535.hasPrototype(Expr$283) && right$536[0] && right$536[0].token.value === ':') {
                        var colon$537 = right$536[0];
                        var flsRes$538 = enforest$321(right$536.slice(1), context$477);
                        var flsExpr$539 = flsRes$538.result;
                        if (flsExpr$539.hasPrototype(Expr$283)) {
                            return step$478(ConditionalExpression$294.create(head$479, question$533, truExpr$535, colon$537, flsExpr$539), flsRes$538.rest);
                        }
                    }
                } else if (head$479.hasPrototype(Keyword$295) && keyword$487.token.value === 'new' && rest$480[0]) {
                    var newCallRes$540 = enforest$321(rest$480, context$477);
                    if (newCallRes$540.result.hasPrototype(Call$306)) {
                        return step$478(Const$305.create(head$479, newCallRes$540.result), newCallRes$540.rest);
                    }
                } else if (head$479.hasPrototype(Delimiter$297) && delim$489.token.value === '()' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator && rest$480[0].token.value === '=>') {
                    var res$541 = enforest$321(rest$480.slice(1), context$477);
                    if (res$541.result.hasPrototype(Expr$283)) {
                        return step$478(ArrowFun$301.create(delim$489, rest$480[0], res$541.result.destruct()), res$541.rest);
                    } else {
                        throwError$258('Body of arrow function must be an expression');
                    }
                } else if (head$479.hasPrototype(Id$298) && rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator && rest$480[0].token.value === '=>') {
                    var res$541 = enforest$321(rest$480.slice(1), context$477);
                    if (res$541.result.hasPrototype(Expr$283)) {
                        return step$478(ArrowFun$301.create(id$491, rest$480[0], res$541.result.destruct()), res$541.rest);
                    } else {
                        throwError$258('Body of arrow function must be an expression');
                    }
                } else if (head$479.hasPrototype(Delimiter$297) && delim$489.token.value === '()') {
                    innerTokens$481 = delim$489.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$481.length === 0) {
                        return step$478(ParenExpression$290.create(head$479), rest$480);
                    } else {
                        var innerTerm$542 = get_expression$322(innerTokens$481, context$477);
                        if (innerTerm$542.result && innerTerm$542.result.hasPrototype(Expr$283)) {
                            return step$478(ParenExpression$290.create(head$479), rest$480);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$479.hasPrototype(Expr$283) && rest$480[0] && rest$480[1] && stxIsBinOp$318(rest$480[0])) {
                    var op$543 = rest$480[0];
                    var left$544 = head$479;
                    var bopRes$545 = enforest$321(rest$480.slice(1), context$477);
                    var right$536 = bopRes$545.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$536.hasPrototype(Expr$283)) {
                        return step$478(BinOp$293.create(op$543, left$544, right$536), bopRes$545.rest);
                    }
                } else if (head$479.hasPrototype(Punc$296) && stxIsUnaryOp$317(punc$495)) {
                    var unopRes$546 = enforest$321(rest$480, context$477);
                    if (unopRes$546.result.hasPrototype(Expr$283)) {
                        return step$478(UnaryOp$291.create(punc$495, unopRes$546.result), unopRes$546.rest);
                    }
                } else if (head$479.hasPrototype(Keyword$295) && stxIsUnaryOp$317(keyword$487)) {
                    var unopRes$546 = enforest$321(rest$480, context$477);
                    if (unopRes$546.result.hasPrototype(Expr$283)) {
                        return step$478(UnaryOp$291.create(keyword$487, unopRes$546.result), unopRes$546.rest);
                    }
                } else if (head$479.hasPrototype(Expr$283) && rest$480[0] && (rest$480[0].token.value === '++' || rest$480[0].token.value === '--')) {
                    return step$478(PostfixOp$292.create(head$479, rest$480[0]), rest$480.slice(1));
                } else if (head$479.hasPrototype(Expr$283) && rest$480[0] && rest$480[0].token.value === '[]') {
                    return step$478(ObjGet$308.create(head$479, Delimiter$297.create(rest$480[0].expose())), rest$480.slice(1));
                } else if (head$479.hasPrototype(Expr$283) && rest$480[0] && rest$480[0].token.value === '.' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Identifier) {
                    return step$478(ObjDotGet$307.create(head$479, rest$480[0], rest$480[1]), rest$480.slice(2));
                } else if (head$479.hasPrototype(Delimiter$297) && delim$489.token.value === '[]') {
                    return step$478(ArrayLiteral$289.create(head$479), rest$480);
                } else if (head$479.hasPrototype(Delimiter$297) && head$479.delim.token.value === '{}') {
                    return step$478(Block$288.create(head$479), rest$480);
                } else if (head$479.hasPrototype(Id$298) && id$491.token.value === '#quoteSyntax' && rest$480[0] && rest$480[0].token.value === '{}') {
                    var tempId$547 = fresh$277();
                    context$477.templateMap.set(tempId$547, rest$480[0].token.inner);
                    return step$478(syn$169.makeIdent('getTemplate', id$491), [syn$169.makeDelim('()', [syn$169.makeValue(tempId$547, id$491)], id$491)].concat(rest$480.slice(1)));
                } else if (head$479.hasPrototype(Keyword$295) && keyword$487.token.value === 'let' && (rest$480[0] && rest$480[0].token.type === parser$168.Token.Identifier || rest$480[0] && rest$480[0].token.type === parser$168.Token.Keyword || rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator) && rest$480[1] && rest$480[1].token.value === '=' && rest$480[2] && rest$480[2].token.value === 'macro') {
                    var mac$548 = enforest$321(rest$480.slice(2), context$477);
                    if (!mac$548.result.hasPrototype(AnonMacro$304)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$548.result);
                    }
                    return step$478(LetMacro$302.create(rest$480[0], mac$548.result.body), mac$548.rest);
                } else if (head$479.hasPrototype(Keyword$295) && keyword$487.token.value === 'var' && rest$480[0]) {
                    var vsRes$549 = enforestVarStatement$319(rest$480, context$477);
                    if (vsRes$549) {
                        return step$478(VariableStatement$310.create(head$479, vsRes$549.result), vsRes$549.rest);
                    }
                } else if (head$479.hasPrototype(Keyword$295) && keyword$487.token.value === 'let' && rest$480[0]) {
                    var vsRes$549 = enforestVarStatement$319(rest$480, context$477);
                    if (vsRes$549) {
                        return step$478(LetStatement$311.create(head$479, vsRes$549.result), vsRes$549.rest);
                    }
                } else if (head$479.hasPrototype(Keyword$295) && keyword$487.token.value === 'const' && rest$480[0]) {
                    var vsRes$549 = enforestVarStatement$319(rest$480, context$477);
                    if (vsRes$549) {
                        return step$478(ConstStatement$312.create(head$479, vsRes$549.result), vsRes$549.rest);
                    }
                }
            } else {
                parser$168.assert(head$479 && head$479.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$479.token.type === parser$168.Token.Identifier || head$479.token.type === parser$168.Token.Keyword || head$479.token.type === parser$168.Token.Punctuator) && context$477.env.has(resolve$271(head$479))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$550 = fresh$277();
                    var transformerContext$551 = makeExpanderContext$330(_$167.defaults({ mark: newMark$550 }, context$477));
                    // pull the macro transformer out the environment
                    var transformer$552 = context$477.env.get(resolve$271(head$479)).fn;
                    // apply the transformer
                    try {
                        var rt$553 = transformer$552([head$479].concat(rest$480), transformerContext$551);
                    } catch (e$554) {
                        var argumentString$555 = '`' + rest$480.slice(0, 5).map(function (stx$556) {
                                return stx$556.token.value;
                            }).join(' ') + '...`';
                        throwError$258('Macro `' + head$479.token.value + '` could not be matched with ' + argumentString$555);
                    }
                    if (!Array.isArray(rt$553.result)) {
                        throwError$258('Macro transformer must return a result array, not: ' + rt$553.result);
                    }
                    if (rt$553.result.length > 0) {
                        var adjustedResult$557 = adjustLineContext$320(rt$553.result, head$479);
                        adjustedResult$557[0].token.leadingComments = head$479.token.leadingComments;
                        return step$478(adjustedResult$557[0], adjustedResult$557.slice(1).concat(rt$553.rest));
                    } else {
                        return step$478(Empty$315.create(), rt$553.rest);
                    }
                }    // anon macro definition
                else if (head$479.token.type === parser$168.Token.Identifier && head$479.token.value === 'macro' && rest$480[0] && rest$480[0].token.value === '{}') {
                    return step$478(AnonMacro$304.create(rest$480[0].expose().token.inner), rest$480.slice(1));
                }    // macro definition
                else if (head$479.token.type === parser$168.Token.Identifier && head$479.token.value === 'macro' && rest$480[0] && (rest$480[0].token.type === parser$168.Token.Identifier || rest$480[0].token.type === parser$168.Token.Keyword || rest$480[0].token.type === parser$168.Token.Punctuator) && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '{}') {
                    return step$478(Macro$303.create(rest$480[0], rest$480[1].expose().token.inner), rest$480.slice(2));
                }    // module definition
                else if (head$479.token.value === 'module' && rest$480[0] && rest$480[0].token.value === '{}') {
                    return step$478(Module$314.create(rest$480[0]), rest$480.slice(1));
                }    // function definition
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'function' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Identifier && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '()' && rest$480[2] && rest$480[2].token.type === parser$168.Token.Delimiter && rest$480[2].token.value === '{}') {
                    rest$480[1].token.inner = rest$480[1].expose().token.inner;
                    rest$480[2].token.inner = rest$480[2].expose().token.inner;
                    return step$478(NamedFun$299.create(head$479, null, rest$480[0], rest$480[1], rest$480[2]), rest$480.slice(3));
                }    // generator function definition
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'function' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator && rest$480[0].token.value === '*' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Identifier && rest$480[2] && rest$480[2].token.type === parser$168.Token.Delimiter && rest$480[2].token.value === '()' && rest$480[3] && rest$480[3].token.type === parser$168.Token.Delimiter && rest$480[3].token.value === '{}') {
                    rest$480[2].token.inner = rest$480[2].expose().token.inner;
                    rest$480[3].token.inner = rest$480[3].expose().token.inner;
                    return step$478(NamedFun$299.create(head$479, rest$480[0], rest$480[1], rest$480[2], rest$480[3]), rest$480.slice(4));
                }    // anonymous function definition
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'function' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Delimiter && rest$480[0].token.value === '()' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '{}') {
                    rest$480[0].token.inner = rest$480[0].expose().token.inner;
                    rest$480[1].token.inner = rest$480[1].expose().token.inner;
                    return step$478(AnonFun$300.create(head$479, null, rest$480[0], rest$480[1]), rest$480.slice(2));
                }    // anonymous generator function definition
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'function' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator && rest$480[0].token.value === '*' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '()' && rest$480[2] && rest$480[2].token.type === parser$168.Token.Delimiter && rest$480[2].token.value === '{}') {
                    rest$480[1].token.inner = rest$480[1].expose().token.inner;
                    rest$480[2].token.inner = rest$480[2].expose().token.inner;
                    return step$478(AnonFun$300.create(head$479, rest$480[0], rest$480[1], rest$480[2]), rest$480.slice(3));
                }    // arrow function
                else if ((head$479.token.type === parser$168.Token.Delimiter && head$479.token.value === '()' || head$479.token.type === parser$168.Token.Identifier) && rest$480[0] && rest$480[0].token.type === parser$168.Token.Punctuator && rest$480[0].token.value === '=>' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '{}') {
                    return step$478(ArrowFun$301.create(head$479, rest$480[0], rest$480[1]), rest$480.slice(2));
                }    // catch statement
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'catch' && rest$480[0] && rest$480[0].token.type === parser$168.Token.Delimiter && rest$480[0].token.value === '()' && rest$480[1] && rest$480[1].token.type === parser$168.Token.Delimiter && rest$480[1].token.value === '{}') {
                    rest$480[0].token.inner = rest$480[0].expose().token.inner;
                    rest$480[1].token.inner = rest$480[1].expose().token.inner;
                    return step$478(CatchClause$313.create(head$479, rest$480[0], rest$480[1]), rest$480.slice(2));
                }    // this expression
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'this') {
                    return step$478(ThisExpression$285.create(head$479), rest$480);
                }    // literal
                else if (head$479.token.type === parser$168.Token.NumericLiteral || head$479.token.type === parser$168.Token.StringLiteral || head$479.token.type === parser$168.Token.BooleanLiteral || head$479.token.type === parser$168.Token.RegularExpression || head$479.token.type === parser$168.Token.NullLiteral) {
                    return step$478(Lit$286.create(head$479), rest$480);
                }    // export
                else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'export' && rest$480[0] && (rest$480[0].token.type === parser$168.Token.Identifier || rest$480[0].token.type === parser$168.Token.Keyword || rest$480[0].token.type === parser$168.Token.Punctuator)) {
                    return step$478(Export$316.create(rest$480[0]), rest$480.slice(1));
                }    // identifier
                else if (head$479.token.type === parser$168.Token.Identifier) {
                    return step$478(Id$298.create(head$479), rest$480);
                }    // punctuator
                else if (head$479.token.type === parser$168.Token.Punctuator) {
                    return step$478(Punc$296.create(head$479), rest$480);
                } else if (head$479.token.type === parser$168.Token.Keyword && head$479.token.value === 'with') {
                    throwError$258('with is not supported in sweet.js');
                }    // keyword
                else if (head$479.token.type === parser$168.Token.Keyword) {
                    return step$478(Keyword$295.create(head$479), rest$480);
                }    // Delimiter
                else if (head$479.token.type === parser$168.Token.Delimiter) {
                    return step$478(Delimiter$297.create(head$479.expose()), rest$480);
                }    // end of file
                else if (head$479.token.type === parser$168.Token.EOF) {
                    parser$168.assert(rest$480.length === 0, 'nothing should be after an EOF');
                    return step$478(EOF$281.create(head$479), []);
                } else {
                    // todo: are we missing cases?
                    parser$168.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$479,
                rest: rest$480
            };
        }
        return step$478(toks$476[0], toks$476.slice(1));
    }
    function get_expression$322(stx$558, context$559) {
        var res$560 = enforest$321(stx$558, context$559);
        if (!res$560.result.hasPrototype(Expr$283)) {
            return {
                result: null,
                rest: stx$558
            };
        }
        return res$560;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$323(newMark$561, env$562) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$563(match$564) {
            if (match$564.level === 0) {
                // replace the match property with the marked syntax
                match$564.match = _$167.map(match$564.match, function (stx$565) {
                    return stx$565.mark(newMark$561);
                });
            } else {
                _$167.each(match$564.match, function (match$566) {
                    dfs$563(match$566);
                });
            }
        }
        _$167.keys(env$562).forEach(function (key$567) {
            dfs$563(env$562[key$567]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$324(mac$568, context$569) {
        var body$570 = mac$568.body;
        // raw function primitive form
        if (!(body$570[0] && body$570[0].token.type === parser$168.Token.Keyword && body$570[0].token.value === 'function')) {
            throwError$258('Primitive macro form must contain a function for the macro body');
        }
        var stub$571 = parser$168.read('()');
        stub$571[0].token.inner = body$570;
        var expanded$572 = expand$329(stub$571, context$569);
        expanded$572 = expanded$572[0].destruct().concat(expanded$572[1].eof);
        var flattend$573 = flatten$332(expanded$572);
        var bodyCode$574 = codegen$174.generate(parser$168.parse(flattend$573));
        var macroFn$575 = scopedEval$259(bodyCode$574, {
                makeValue: syn$169.makeValue,
                makeRegex: syn$169.makeRegex,
                makeIdent: syn$169.makeIdent,
                makeKeyword: syn$169.makeKeyword,
                makePunc: syn$169.makePunc,
                makeDelim: syn$169.makeDelim,
                unwrapSyntax: syn$169.unwrapSyntax,
                throwSyntaxError: syn$169.throwSyntaxError,
                parser: parser$168,
                _: _$167,
                patternModule: patternModule$172,
                getTemplate: function (id$576) {
                    return cloneSyntaxArray$325(context$569.templateMap.get(id$576));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$323,
                mergeMatches: function (newMatch$577, oldMatch$578) {
                    newMatch$577.patternEnv = _$167.extend({}, oldMatch$578.patternEnv, newMatch$577.patternEnv);
                    return newMatch$577;
                }
            });
        return macroFn$575;
    }
    function cloneSyntaxArray$325(arr$579) {
        return arr$579.map(function (stx$580) {
            var o$581 = syntaxFromToken$267(_$167.clone(stx$580.token), stx$580);
            if (o$581.token.type === parser$168.Token.Delimiter) {
                o$581.token.inner = cloneSyntaxArray$325(o$581.token.inner);
            }
            return o$581;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$326(stx$582, context$583) {
        parser$168.assert(context$583, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$582.length === 0) {
            return {
                terms: [],
                context: context$583
            };
        }
        parser$168.assert(stx$582[0].token, 'expecting a syntax object');
        var f$584 = enforest$321(stx$582, context$583);
        // head :: TermTree
        var head$585 = f$584.result;
        // rest :: [Syntax]
        var rest$586 = f$584.rest;
        if (head$585.hasPrototype(Macro$303)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$588 = loadMacroDef$324(head$585, context$583);
            addToDefinitionCtx$327([head$585.name], context$583.defscope, false);
            context$583.env.set(resolve$271(head$585.name), { fn: macroDefinition$588 });
            return expandToTermTree$326(rest$586, context$583);
        }
        if (head$585.hasPrototype(LetMacro$302)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$588 = loadMacroDef$324(head$585, context$583);
            var freshName$589 = fresh$277();
            var renamedName$590 = head$585.name.rename(head$585.name, freshName$589);
            rest$586 = _$167.map(rest$586, function (stx$591) {
                return stx$591.rename(head$585.name, freshName$589);
            });
            head$585.name = renamedName$590;
            context$583.env.set(resolve$271(head$585.name), { fn: macroDefinition$588 });
            return expandToTermTree$326(rest$586, context$583);
        }
        if (head$585.hasPrototype(LetStatement$311) || head$585.hasPrototype(ConstStatement$312)) {
            head$585.decls.forEach(function (decl$592) {
                var freshName$593 = fresh$277();
                var renamedDecl$594 = decl$592.ident.rename(decl$592.ident, freshName$593);
                rest$586 = rest$586.map(function (stx$595) {
                    return stx$595.rename(decl$592.ident, freshName$593);
                });
                decl$592.ident = renamedDecl$594;
            });
        }
        if (head$585.hasPrototype(NamedFun$299)) {
            addToDefinitionCtx$327([head$585.name], context$583.defscope, true);
        }
        if (head$585.hasPrototype(VariableStatement$310)) {
            addToDefinitionCtx$327(_$167.map(head$585.decls, function (decl$596) {
                return decl$596.ident;
            }), context$583.defscope, true);
        }
        if (head$585.hasPrototype(Block$288) && head$585.body.hasPrototype(Delimiter$297)) {
            head$585.body.delim.token.inner.forEach(function (term$597) {
                if (term$597.hasPrototype(VariableStatement$310)) {
                    addToDefinitionCtx$327(_$167.map(term$597.decls, function (decl$598) {
                        return decl$598.ident;
                    }), context$583.defscope, true);
                }
            });
        }
        if (head$585.hasPrototype(Delimiter$297)) {
            head$585.delim.token.inner.forEach(function (term$599) {
                if (term$599.hasPrototype(VariableStatement$310)) {
                    addToDefinitionCtx$327(_$167.map(term$599.decls, function (decl$600) {
                        return decl$600.ident;
                    }), context$583.defscope, true);
                }
            });
        }
        var trees$587 = expandToTermTree$326(rest$586, context$583);
        return {
            terms: [head$585].concat(trees$587.terms),
            context: trees$587.context
        };
    }
    function addToDefinitionCtx$327(idents$601, defscope$602, skipRep$603) {
        parser$168.assert(idents$601 && idents$601.length > 0, 'expecting some variable identifiers');
        skipRep$603 = skipRep$603 || false;
        _$167.each(idents$601, function (id$604) {
            var skip$605 = false;
            if (skipRep$603) {
                var declRepeat$606 = _$167.find(defscope$602, function (def$607) {
                        return def$607.id.token.value === id$604.token.value && arraysEqual$272(marksof$270(def$607.id.context), marksof$270(id$604.context));
                    });
                skip$605 = typeof declRepeat$606 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$605) {
                var name$608 = fresh$277();
                defscope$602.push({
                    id: id$604,
                    name: name$608
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$328(term$609, context$610) {
        parser$168.assert(context$610 && context$610.env, 'environment map is required');
        if (term$609.hasPrototype(ArrayLiteral$289)) {
            term$609.array.delim.token.inner = expand$329(term$609.array.delim.expose().token.inner, context$610);
            return term$609;
        } else if (term$609.hasPrototype(Block$288)) {
            term$609.body.delim.token.inner = expand$329(term$609.body.delim.expose().token.inner, context$610);
            return term$609;
        } else if (term$609.hasPrototype(ParenExpression$290)) {
            term$609.expr.delim.token.inner = expand$329(term$609.expr.delim.expose().token.inner, context$610);
            return term$609;
        } else if (term$609.hasPrototype(Call$306)) {
            term$609.fun = expandTermTreeToFinal$328(term$609.fun, context$610);
            term$609.args = _$167.map(term$609.args, function (arg$611) {
                return expandTermTreeToFinal$328(arg$611, context$610);
            });
            return term$609;
        } else if (term$609.hasPrototype(UnaryOp$291)) {
            term$609.expr = expandTermTreeToFinal$328(term$609.expr, context$610);
            return term$609;
        } else if (term$609.hasPrototype(BinOp$293)) {
            term$609.left = expandTermTreeToFinal$328(term$609.left, context$610);
            term$609.right = expandTermTreeToFinal$328(term$609.right, context$610);
            return term$609;
        } else if (term$609.hasPrototype(ObjGet$308)) {
            term$609.right.delim.token.inner = expand$329(term$609.right.delim.expose().token.inner, context$610);
            return term$609;
        } else if (term$609.hasPrototype(ObjDotGet$307)) {
            term$609.left = expandTermTreeToFinal$328(term$609.left, context$610);
            term$609.right = expandTermTreeToFinal$328(term$609.right, context$610);
            return term$609;
        } else if (term$609.hasPrototype(VariableDeclaration$309)) {
            if (term$609.init) {
                term$609.init = expandTermTreeToFinal$328(term$609.init, context$610);
            }
            return term$609;
        } else if (term$609.hasPrototype(VariableStatement$310)) {
            term$609.decls = _$167.map(term$609.decls, function (decl$612) {
                return expandTermTreeToFinal$328(decl$612, context$610);
            });
            return term$609;
        } else if (term$609.hasPrototype(Delimiter$297)) {
            // expand inside the delimiter and then continue on
            term$609.delim.token.inner = expand$329(term$609.delim.expose().token.inner, context$610);
            return term$609;
        } else if (term$609.hasPrototype(NamedFun$299) || term$609.hasPrototype(AnonFun$300) || term$609.hasPrototype(CatchClause$313) || term$609.hasPrototype(ArrowFun$301) || term$609.hasPrototype(Module$314)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$613 = [];
            var bodyContext$614 = makeExpanderContext$330(_$167.defaults({ defscope: newDef$613 }, context$610));
            var paramSingleIdent$615 = term$609.params && term$609.params.token.type === parser$168.Token.Identifier;
            if (term$609.params && term$609.params.token.type === parser$168.Token.Delimiter) {
                var params$622 = term$609.params.expose();
            } else if (paramSingleIdent$615) {
                var params$622 = term$609.params;
            } else {
                var params$622 = syn$169.makeDelim('()', [], null);
            }
            if (Array.isArray(term$609.body)) {
                var bodies$623 = syn$169.makeDelim('{}', term$609.body, null);
            } else {
                var bodies$623 = term$609.body;
            }
            bodies$623 = bodies$623.addDefCtx(newDef$613);
            var paramNames$616 = _$167.map(getParamIdentifiers$279(params$622), function (param$624) {
                    var freshName$625 = fresh$277();
                    return {
                        freshName: freshName$625,
                        originalParam: param$624,
                        renamedParam: param$624.rename(param$624, freshName$625)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$617 = _$167.reduce(paramNames$616, function (accBody$626, p$627) {
                    return accBody$626.rename(p$627.originalParam, p$627.freshName);
                }, bodies$623);
            renamedBody$617 = renamedBody$617.expose();
            var expandedResult$618 = expandToTermTree$326(renamedBody$617.token.inner, bodyContext$614);
            var bodyTerms$619 = expandedResult$618.terms;
            var renamedParams$620 = _$167.map(paramNames$616, function (p$628) {
                    return p$628.renamedParam;
                });
            if (paramSingleIdent$615) {
                var flatArgs$629 = renamedParams$620[0];
            } else {
                var flatArgs$629 = syn$169.makeDelim('()', joinSyntax$268(renamedParams$620, ','), term$609.params);
            }
            var expandedArgs$621 = expand$329([flatArgs$629], bodyContext$614);
            parser$168.assert(expandedArgs$621.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$609.params) {
                term$609.params = expandedArgs$621[0];
            }
            bodyTerms$619 = _$167.map(bodyTerms$619, function (bodyTerm$630) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$631 = bodyTerm$630.addDefCtx(newDef$613);
                // finish expansion
                return expandTermTreeToFinal$328(termWithCtx$631, expandedResult$618.context);
            });
            if (term$609.hasPrototype(Module$314)) {
                bodyTerms$619 = _$167.filter(bodyTerms$619, function (bodyTerm$632) {
                    if (bodyTerm$632.hasPrototype(Export$316)) {
                        term$609.exports.push(bodyTerm$632);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$617.token.inner = bodyTerms$619;
            if (Array.isArray(term$609.body)) {
                term$609.body = renamedBody$617.token.inner;
            } else {
                term$609.body = renamedBody$617;
            }
            // and continue expand the rest
            return term$609;
        }
        // the term is fine as is
        return term$609;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$329(stx$633, context$634) {
        parser$168.assert(context$634, 'must provide an expander context');
        var trees$635 = expandToTermTree$326(stx$633, context$634);
        return _$167.map(trees$635.terms, function (term$636) {
            return expandTermTreeToFinal$328(term$636, trees$635.context);
        });
    }
    function makeExpanderContext$330(o$637) {
        o$637 = o$637 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$637.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$637.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$637.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$637.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$331(stx$638, builtinSource$639) {
        var env$640 = new Map();
        var params$641 = [];
        var context$642, builtInContext$643 = makeExpanderContext$330({ env: env$640 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$639) {
            var builtinRead$646 = parser$168.read(builtinSource$639);
            builtinRead$646 = [
                syn$169.makeIdent('module', null),
                syn$169.makeDelim('{}', builtinRead$646, null)
            ];
            var builtinRes$647 = expand$329(builtinRead$646, builtInContext$643);
            params$641 = _$167.map(builtinRes$647[0].exports, function (term$648) {
                return {
                    oldExport: term$648.name,
                    newParam: syn$169.makeIdent(term$648.name.token.value, null)
                };
            });
        }
        var modBody$644 = syn$169.makeDelim('{}', stx$638, null);
        modBody$644 = _$167.reduce(params$641, function (acc$649, param$650) {
            var newName$651 = fresh$277();
            env$640.set(resolve$271(param$650.newParam.rename(param$650.newParam, newName$651)), env$640.get(resolve$271(param$650.oldExport)));
            return acc$649.rename(param$650.newParam, newName$651);
        }, modBody$644);
        context$642 = makeExpanderContext$330({ env: env$640 });
        var res$645 = expand$329([
                syn$169.makeIdent('module', null),
                modBody$644
            ], context$642);
        res$645 = res$645[0].destruct();
        return flatten$332(res$645[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$332(stx$652) {
        return _$167.reduce(stx$652, function (acc$653, stx$654) {
            if (stx$654.token.type === parser$168.Token.Delimiter) {
                var exposed$655 = stx$654.expose();
                var openParen$656 = syntaxFromToken$267({
                        type: parser$168.Token.Punctuator,
                        value: stx$654.token.value[0],
                        range: stx$654.token.startRange,
                        sm_range: typeof stx$654.token.sm_startRange == 'undefined' ? stx$654.token.startRange : stx$654.token.sm_startRange,
                        lineNumber: stx$654.token.startLineNumber,
                        sm_lineNumber: typeof stx$654.token.sm_startLineNumber == 'undefined' ? stx$654.token.startLineNumber : stx$654.token.sm_startLineNumber,
                        lineStart: stx$654.token.startLineStart,
                        sm_lineStart: typeof stx$654.token.sm_startLineStart == 'undefined' ? stx$654.token.startLineStart : stx$654.token.sm_startLineStart
                    }, exposed$655);
                var closeParen$657 = syntaxFromToken$267({
                        type: parser$168.Token.Punctuator,
                        value: stx$654.token.value[1],
                        range: stx$654.token.endRange,
                        sm_range: typeof stx$654.token.sm_endRange == 'undefined' ? stx$654.token.endRange : stx$654.token.sm_endRange,
                        lineNumber: stx$654.token.endLineNumber,
                        sm_lineNumber: typeof stx$654.token.sm_endLineNumber == 'undefined' ? stx$654.token.endLineNumber : stx$654.token.sm_endLineNumber,
                        lineStart: stx$654.token.endLineStart,
                        sm_lineStart: typeof stx$654.token.sm_endLineStart == 'undefined' ? stx$654.token.endLineStart : stx$654.token.sm_endLineStart
                    }, exposed$655);
                if (stx$654.token.leadingComments) {
                    openParen$656.token.leadingComments = stx$654.token.leadingComments;
                }
                if (stx$654.token.trailingComments) {
                    openParen$656.token.trailingComments = stx$654.token.trailingComments;
                }
                return acc$653.concat(openParen$656).concat(flatten$332(exposed$655.token.inner)).concat(closeParen$657);
            }
            stx$654.token.sm_lineNumber = stx$654.token.sm_lineNumber ? stx$654.token.sm_lineNumber : stx$654.token.lineNumber;
            stx$654.token.sm_lineStart = stx$654.token.sm_lineStart ? stx$654.token.sm_lineStart : stx$654.token.lineStart;
            stx$654.token.sm_range = stx$654.token.sm_range ? stx$654.token.sm_range : stx$654.token.range;
            return acc$653.concat(stx$654);
        }, []);
    }
    exports$166.enforest = enforest$321;
    exports$166.expand = expandTopLevel$331;
    exports$166.resolve = resolve$271;
    exports$166.get_expression = get_expression$322;
    exports$166.makeExpanderContext = makeExpanderContext$330;
    exports$166.Expr = Expr$283;
    exports$166.VariableStatement = VariableStatement$310;
    exports$166.tokensToSyntax = syn$169.tokensToSyntax;
    exports$166.syntaxToTokens = syn$169.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map