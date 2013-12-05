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
(function (root$122, factory$123) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$123(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$123);
    }
}(this, function (exports$124, _$125, parser$126, syn$127, es6$128, se$129, patternModule$130, gen$131) {
    'use strict';
    var codegen$132 = gen$131 || escodegen;
    // used to export "private" methods for unit testing
    exports$124._test = {};
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
    function throwError$216(msg$294) {
        throw new Error(msg$294);
    }
    var scopedEval$217 = se$129.scopedEval;
    var Rename$218 = syn$127.Rename;
    var Mark$219 = syn$127.Mark;
    var Var$220 = syn$127.Var;
    var Def$221 = syn$127.Def;
    var isDef$222 = syn$127.isDef;
    var isMark$223 = syn$127.isMark;
    var isRename$224 = syn$127.isRename;
    var syntaxFromToken$225 = syn$127.syntaxFromToken;
    var joinSyntax$226 = syn$127.joinSyntax;
    function remdup$227(mark$295, mlist$296) {
        if (mark$295 === _$125.first(mlist$296)) {
            return _$125.rest(mlist$296, 1);
        }
        return [mark$295].concat(mlist$296);
    }
    // (CSyntax) -> [...Num]
    function marksof$228(ctx$297, stopName$298, originalName$299) {
        var mark$300, submarks$301;
        if (isMark$223(ctx$297)) {
            mark$300 = ctx$297.mark;
            submarks$301 = marksof$228(ctx$297.context, stopName$298, originalName$299);
            return remdup$227(mark$300, submarks$301);
        }
        if (isDef$222(ctx$297)) {
            return marksof$228(ctx$297.context, stopName$298, originalName$299);
        }
        if (isRename$224(ctx$297)) {
            if (stopName$298 === originalName$299 + '$' + ctx$297.name) {
                return [];
            }
            return marksof$228(ctx$297.context, stopName$298, originalName$299);
        }
        return [];
    }
    function resolve$229(stx$302) {
        return resolveCtx$233(stx$302.token.value, stx$302.context, [], []);
    }
    function arraysEqual$230(a$303, b$304) {
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
    function renames$231(defctx$306, oldctx$307, originalName$308) {
        var acc$309 = oldctx$307;
        for (var i$310 = 0; i$310 < defctx$306.length; i$310++) {
            if (defctx$306[i$310].id.token.value === originalName$308) {
                acc$309 = Rename$218(defctx$306[i$310].id, defctx$306[i$310].name, acc$309, defctx$306);
            }
        }
        return acc$309;
    }
    function unionEl$232(arr$311, el$312) {
        if (arr$311.indexOf(el$312) === -1) {
            var res$313 = arr$311.slice(0);
            res$313.push(el$312);
            return res$313;
        }
        return arr$311;
    }
    // (Syntax) -> String
    function resolveCtx$233(originalName$314, ctx$315, stop_spine$316, stop_branch$317) {
        if (isMark$223(ctx$315)) {
            return resolveCtx$233(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
        }
        if (isDef$222(ctx$315)) {
            if (stop_spine$316.indexOf(ctx$315.defctx) !== -1) {
                return resolveCtx$233(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
            } else {
                return resolveCtx$233(originalName$314, renames$231(ctx$315.defctx, ctx$315.context, originalName$314), stop_spine$316, unionEl$232(stop_branch$317, ctx$315.defctx));
            }
        }
        if (isRename$224(ctx$315)) {
            if (originalName$314 === ctx$315.id.token.value) {
                var idName$318 = resolveCtx$233(ctx$315.id.token.value, ctx$315.id.context, stop_branch$317, stop_branch$317);
                var subName$319 = resolveCtx$233(originalName$314, ctx$315.context, unionEl$232(stop_spine$316, ctx$315.def), stop_branch$317);
                if (idName$318 === subName$319) {
                    var idMarks$320 = marksof$228(ctx$315.id.context, originalName$314 + '$' + ctx$315.name, originalName$314);
                    var subMarks$321 = marksof$228(ctx$315.context, originalName$314 + '$' + ctx$315.name, originalName$314);
                    if (arraysEqual$230(idMarks$320, subMarks$321)) {
                        return originalName$314 + '$' + ctx$315.name;
                    }
                }
            }
            return resolveCtx$233(originalName$314, ctx$315.context, stop_spine$316, stop_branch$317);
        }
        return originalName$314;
    }
    var nextFresh$234 = 0;
    // fun () -> Num
    function fresh$235() {
        return nextFresh$234++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$236(towrap$322, delimSyntax$323) {
        parser$126.assert(delimSyntax$323.token.type === parser$126.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$225({
            type: parser$126.Token.Delimiter,
            value: delimSyntax$323.token.value,
            inner: towrap$322,
            range: delimSyntax$323.token.range,
            startLineNumber: delimSyntax$323.token.startLineNumber,
            lineStart: delimSyntax$323.token.lineStart
        }, delimSyntax$323);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$237(argSyntax$324) {
        parser$126.assert(argSyntax$324.token.type === parser$126.Token.Delimiter, 'expecting delimiter for function params');
        return _$125.filter(argSyntax$324.token.inner, function (stx$325) {
            return stx$325.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$238 = {
            destruct: function () {
                return _$125.reduce(this.properties, _$125.bind(function (acc$326, prop$327) {
                    if (this[prop$327] && this[prop$327].hasPrototype(TermTree$238)) {
                        return acc$326.concat(this[prop$327].destruct());
                    } else if (this[prop$327] && this[prop$327].token && this[prop$327].token.inner) {
                        this[prop$327].token.inner = _$125.reduce(this[prop$327].token.inner, function (acc$328, t$329) {
                            if (t$329.hasPrototype(TermTree$238)) {
                                return acc$328.concat(t$329.destruct());
                            }
                            return acc$328.concat(t$329);
                        }, []);
                        return acc$326.concat(this[prop$327]);
                    } else if (this[prop$327]) {
                        return acc$326.concat(this[prop$327]);
                    } else {
                        return acc$326;
                    }
                }, this), []);
            },
            addDefCtx: function (def$330) {
                for (var i$331 = 0; i$331 < this.properties.length; i$331++) {
                    var prop$332 = this.properties[i$331];
                    if (Array.isArray(this[prop$332])) {
                        this[prop$332] = _$125.map(this[prop$332], function (item$333) {
                            return item$333.addDefCtx(def$330);
                        });
                    } else if (this[prop$332]) {
                        this[prop$332] = this[prop$332].addDefCtx(def$330);
                    }
                }
                return this;
            }
        };
    var EOF$239 = TermTree$238.extend({
            properties: ['eof'],
            construct: function (e$334) {
                this.eof = e$334;
            }
        });
    var Statement$240 = TermTree$238.extend({
            construct: function () {
            }
        });
    var Expr$241 = TermTree$238.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$242 = Expr$241.extend({
            construct: function () {
            }
        });
    var ThisExpression$243 = PrimaryExpression$242.extend({
            properties: ['this'],
            construct: function (that$335) {
                this.this = that$335;
            }
        });
    var Lit$244 = PrimaryExpression$242.extend({
            properties: ['lit'],
            construct: function (l$336) {
                this.lit = l$336;
            }
        });
    exports$124._test.PropertyAssignment = PropertyAssignment$245;
    var PropertyAssignment$245 = TermTree$238.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$337, assignment$338) {
                this.propName = propName$337;
                this.assignment = assignment$338;
            }
        });
    var Block$246 = PrimaryExpression$242.extend({
            properties: ['body'],
            construct: function (body$339) {
                this.body = body$339;
            }
        });
    var ArrayLiteral$247 = PrimaryExpression$242.extend({
            properties: ['array'],
            construct: function (ar$340) {
                this.array = ar$340;
            }
        });
    var ParenExpression$248 = PrimaryExpression$242.extend({
            properties: ['expr'],
            construct: function (expr$341) {
                this.expr = expr$341;
            }
        });
    var UnaryOp$249 = Expr$241.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$342, expr$343) {
                this.op = op$342;
                this.expr = expr$343;
            }
        });
    var PostfixOp$250 = Expr$241.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$344, op$345) {
                this.expr = expr$344;
                this.op = op$345;
            }
        });
    var BinOp$251 = Expr$241.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$346, left$347, right$348) {
                this.op = op$346;
                this.left = left$347;
                this.right = right$348;
            }
        });
    var ConditionalExpression$252 = Expr$241.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$349, question$350, tru$351, colon$352, fls$353) {
                this.cond = cond$349;
                this.question = question$350;
                this.tru = tru$351;
                this.colon = colon$352;
                this.fls = fls$353;
            }
        });
    var Keyword$253 = TermTree$238.extend({
            properties: ['keyword'],
            construct: function (k$354) {
                this.keyword = k$354;
            }
        });
    var Punc$254 = TermTree$238.extend({
            properties: ['punc'],
            construct: function (p$355) {
                this.punc = p$355;
            }
        });
    var Delimiter$255 = TermTree$238.extend({
            properties: ['delim'],
            construct: function (d$356) {
                this.delim = d$356;
            }
        });
    var Id$256 = PrimaryExpression$242.extend({
            properties: ['id'],
            construct: function (id$357) {
                this.id = id$357;
            }
        });
    var NamedFun$257 = Expr$241.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$358, name$359, params$360, body$361) {
                this.keyword = keyword$358;
                this.name = name$359;
                this.params = params$360;
                this.body = body$361;
            }
        });
    var AnonFun$258 = Expr$241.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$362, params$363, body$364) {
                this.keyword = keyword$362;
                this.params = params$363;
                this.body = body$364;
            }
        });
    var LetMacro$259 = TermTree$238.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$365, body$366) {
                this.name = name$365;
                this.body = body$366;
            }
        });
    var Macro$260 = TermTree$238.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$367, body$368) {
                this.name = name$367;
                this.body = body$368;
            }
        });
    var AnonMacro$261 = TermTree$238.extend({
            properties: ['body'],
            construct: function (body$369) {
                this.body = body$369;
            }
        });
    var Const$262 = Expr$241.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$370, call$371) {
                this.newterm = newterm$370;
                this.call = call$371;
            }
        });
    var Call$263 = Expr$241.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$126.assert(this.fun.hasPrototype(TermTree$238), 'expecting a term tree in destruct of call');
                var that$372 = this;
                this.delim = syntaxFromToken$225(_$125.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$125.reduce(this.args, function (acc$373, term$374) {
                    parser$126.assert(term$374 && term$374.hasPrototype(TermTree$238), 'expecting term trees in destruct of Call');
                    var dst$375 = acc$373.concat(term$374.destruct());
                    // add all commas except for the last one
                    if (that$372.commas.length > 0) {
                        dst$375 = dst$375.concat(that$372.commas.shift());
                    }
                    return dst$375;
                }, []);
                return this.fun.destruct().concat(Delimiter$255.create(this.delim).destruct());
            },
            construct: function (funn$376, args$377, delim$378, commas$379) {
                parser$126.assert(Array.isArray(args$377), 'requires an array of arguments terms');
                this.fun = funn$376;
                this.args = args$377;
                this.delim = delim$378;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$379;
            }
        });
    var ObjDotGet$264 = Expr$241.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$380, dot$381, right$382) {
                this.left = left$380;
                this.dot = dot$381;
                this.right = right$382;
            }
        });
    var ObjGet$265 = Expr$241.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$383, right$384) {
                this.left = left$383;
                this.right = right$384;
            }
        });
    var VariableDeclaration$266 = TermTree$238.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$385, eqstx$386, init$387, comma$388) {
                this.ident = ident$385;
                this.eqstx = eqstx$386;
                this.init = init$387;
                this.comma = comma$388;
            }
        });
    var VariableStatement$267 = Statement$240.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$125.reduce(this.decls, function (acc$389, decl$390) {
                    return acc$389.concat(decl$390.destruct());
                }, []));
            },
            construct: function (varkw$391, decls$392) {
                parser$126.assert(Array.isArray(decls$392), 'decls must be an array');
                this.varkw = varkw$391;
                this.decls = decls$392;
            }
        });
    var CatchClause$268 = TermTree$238.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$393, params$394, body$395) {
                this.catchkw = catchkw$393;
                this.params = params$394;
                this.body = body$395;
            }
        });
    var Module$269 = TermTree$238.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$396) {
                this.body = body$396;
                this.exports = [];
            }
        });
    var Empty$270 = TermTree$238.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$271 = TermTree$238.extend({
            properties: ['name'],
            construct: function (name$397) {
                this.name = name$397;
            }
        });
    function stxIsUnaryOp$272(stx$398) {
        var staticOperators$399 = [
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
        return _$125.contains(staticOperators$399, stx$398.token.value);
    }
    function stxIsBinOp$273(stx$400) {
        var staticOperators$401 = [
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
        return _$125.contains(staticOperators$401, stx$400.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$274(stx$402, context$403) {
        var decls$404 = [];
        var res$405 = enforest$276(stx$402, context$403);
        var result$406 = res$405.result;
        var rest$407 = res$405.rest;
        if (rest$407[0]) {
            var nextRes$408 = enforest$276(rest$407, context$403);
            // x = ...
            if (nextRes$408.result.hasPrototype(Punc$254) && nextRes$408.result.punc.token.value === '=') {
                var initializerRes$409 = enforest$276(nextRes$408.rest, context$403);
                if (initializerRes$409.rest[0]) {
                    var restRes$410 = enforest$276(initializerRes$409.rest, context$403);
                    // x = y + z, ...
                    if (restRes$410.result.hasPrototype(Punc$254) && restRes$410.result.punc.token.value === ',') {
                        decls$404.push(VariableDeclaration$266.create(result$406.id, nextRes$408.result.punc, initializerRes$409.result, restRes$410.result.punc));
                        var subRes$411 = enforestVarStatement$274(restRes$410.rest, context$403);
                        decls$404 = decls$404.concat(subRes$411.result);
                        rest$407 = subRes$411.rest;
                    }    // x = y ...
                    else {
                        decls$404.push(VariableDeclaration$266.create(result$406.id, nextRes$408.result.punc, initializerRes$409.result));
                        rest$407 = initializerRes$409.rest;
                    }
                }    // x = y EOF
                else {
                    decls$404.push(VariableDeclaration$266.create(result$406.id, nextRes$408.result.punc, initializerRes$409.result));
                }
            }    // x ,...;
            else if (nextRes$408.result.hasPrototype(Punc$254) && nextRes$408.result.punc.token.value === ',') {
                decls$404.push(VariableDeclaration$266.create(result$406.id, null, null, nextRes$408.result.punc));
                var subRes$411 = enforestVarStatement$274(nextRes$408.rest, context$403);
                decls$404 = decls$404.concat(subRes$411.result);
                rest$407 = subRes$411.rest;
            } else {
                if (result$406.hasPrototype(Id$256)) {
                    decls$404.push(VariableDeclaration$266.create(result$406.id));
                } else {
                    throwError$216('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$406.hasPrototype(Id$256)) {
                decls$404.push(VariableDeclaration$266.create(result$406.id));
            } else if (result$406.hasPrototype(BinOp$251) && result$406.op.token.value === 'in') {
                decls$404.push(VariableDeclaration$266.create(result$406.left.id, result$406.op, result$406.right));
            } else {
                throwError$216('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$404,
            rest: rest$407
        };
    }
    function adjustLineContext$275(stx$412, original$413, current$414) {
        current$414 = current$414 || {
            lastLineNumber: original$413.token.lineNumber,
            lineNumber: original$413.token.lineNumber - 1
        };
        return _$125.map(stx$412, function (stx$415) {
            if (stx$415.token.type === parser$126.Token.Delimiter) {
                // handle tokens with missing line info
                stx$415.token.startLineNumber = typeof stx$415.token.startLineNumber == 'undefined' ? original$413.token.lineNumber : stx$415.token.startLineNumber;
                stx$415.token.endLineNumber = typeof stx$415.token.endLineNumber == 'undefined' ? original$413.token.lineNumber : stx$415.token.endLineNumber;
                stx$415.token.startLineStart = typeof stx$415.token.startLineStart == 'undefined' ? original$413.token.lineStart : stx$415.token.startLineStart;
                stx$415.token.endLineStart = typeof stx$415.token.endLineStart == 'undefined' ? original$413.token.lineStart : stx$415.token.endLineStart;
                stx$415.token.startRange = typeof stx$415.token.startRange == 'undefined' ? original$413.token.range : stx$415.token.startRange;
                stx$415.token.endRange = typeof stx$415.token.endRange == 'undefined' ? original$413.token.range : stx$415.token.endRange;
                stx$415.token.sm_startLineNumber = typeof stx$415.token.sm_startLineNumber == 'undefined' ? stx$415.token.startLineNumber : stx$415.token.sm_startLineNumber;
                stx$415.token.sm_endLineNumber = typeof stx$415.token.sm_endLineNumber == 'undefined' ? stx$415.token.endLineNumber : stx$415.token.sm_endLineNumber;
                stx$415.token.sm_startLineStart = typeof stx$415.token.sm_startLineStart == 'undefined' ? stx$415.token.startLineStart : stx$415.token.sm_startLineStart;
                stx$415.token.sm_endLineStart = typeof stx$415.token.sm_endLineStart == 'undefined' ? stx$415.token.endLineStart : stx$415.token.sm_endLineStart;
                stx$415.token.sm_startRange = typeof stx$415.token.sm_startRange == 'undefined' ? stx$415.token.startRange : stx$415.token.sm_startRange;
                stx$415.token.sm_endRange = typeof stx$415.token.sm_endRange == 'undefined' ? stx$415.token.endRange : stx$415.token.sm_endRange;
                stx$415.token.startLineNumber = original$413.token.lineNumber;
                if (stx$415.token.inner.length > 0) {
                    stx$415.token.inner = adjustLineContext$275(stx$415.token.inner, original$413, current$414);
                }
                return stx$415;
            }
            // handle tokens with missing line info
            stx$415.token.lineNumber = typeof stx$415.token.lineNumber == 'undefined' ? original$413.token.lineNumber : stx$415.token.lineNumber;
            stx$415.token.lineStart = typeof stx$415.token.lineStart == 'undefined' ? original$413.token.lineStart : stx$415.token.lineStart;
            stx$415.token.range = typeof stx$415.token.range == 'undefined' ? original$413.token.range : stx$415.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of 
            // just write once).
            stx$415.token.sm_lineNumber = typeof stx$415.token.sm_lineNumber == 'undefined' ? stx$415.token.lineNumber : stx$415.token.sm_lineNumber;
            stx$415.token.sm_lineStart = typeof stx$415.token.sm_lineStart == 'undefined' ? stx$415.token.lineStart : stx$415.token.sm_lineStart;
            stx$415.token.sm_range = typeof stx$415.token.sm_range == 'undefined' ? _$125.clone(stx$415.token.range) : stx$415.token.sm_range;
            // move the line info to line up with the macro name
            // (line info starting from the macro name)
            stx$415.token.lineNumber = original$413.token.lineNumber;
            return stx$415;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$276(toks$416, context$417) {
        parser$126.assert(toks$416.length > 0, 'enforest assumes there are tokens to work with');
        function step$418(head$419, rest$420) {
            var innerTokens$421;
            parser$126.assert(Array.isArray(rest$420), 'result must at least be an empty array');
            if (head$419.hasPrototype(TermTree$238)) {
                // function call
                var emp$424 = head$419.emp;
                var emp$424 = head$419.emp;
                var keyword$427 = head$419.keyword;
                var delim$429 = head$419.delim;
                var emp$424 = head$419.emp;
                var punc$432 = head$419.punc;
                var keyword$427 = head$419.keyword;
                var emp$424 = head$419.emp;
                var emp$424 = head$419.emp;
                var emp$424 = head$419.emp;
                var delim$429 = head$419.delim;
                var delim$429 = head$419.delim;
                var keyword$427 = head$419.keyword;
                var keyword$427 = head$419.keyword;
                if (head$419.hasPrototype(Expr$241) && (rest$420[0] && rest$420[0].token.type === parser$126.Token.Delimiter && rest$420[0].token.value === '()')) {
                    var argRes$457, enforestedArgs$458 = [], commas$459 = [];
                    rest$420[0].expose();
                    innerTokens$421 = rest$420[0].token.inner;
                    while (innerTokens$421.length > 0) {
                        argRes$457 = enforest$276(innerTokens$421, context$417);
                        enforestedArgs$458.push(argRes$457.result);
                        innerTokens$421 = argRes$457.rest;
                        if (innerTokens$421[0] && innerTokens$421[0].token.value === ',') {
                            // record the comma for later
                            commas$459.push(innerTokens$421[0]);
                            // but dump it for the next loop turn
                            innerTokens$421 = innerTokens$421.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$460 = _$125.all(enforestedArgs$458, function (argTerm$461) {
                            return argTerm$461.hasPrototype(Expr$241);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$421.length === 0 && argsAreExprs$460) {
                        return step$418(Call$263.create(head$419, enforestedArgs$458, rest$420[0], commas$459), rest$420.slice(1));
                    }
                } else if (head$419.hasPrototype(Expr$241) && (rest$420[0] && rest$420[0].token.value === '?')) {
                    var question$462 = rest$420[0];
                    var condRes$463 = enforest$276(rest$420.slice(1), context$417);
                    var truExpr$464 = condRes$463.result;
                    var right$465 = condRes$463.rest;
                    if (truExpr$464.hasPrototype(Expr$241) && right$465[0] && right$465[0].token.value === ':') {
                        var colon$466 = right$465[0];
                        var flsRes$467 = enforest$276(right$465.slice(1), context$417);
                        var flsExpr$468 = flsRes$467.result;
                        if (flsExpr$468.hasPrototype(Expr$241)) {
                            return step$418(ConditionalExpression$252.create(head$419, question$462, truExpr$464, colon$466, flsExpr$468), flsRes$467.rest);
                        }
                    }
                } else if (head$419.hasPrototype(Keyword$253) && (keyword$427.token.value === 'new' && rest$420[0])) {
                    var newCallRes$469 = enforest$276(rest$420, context$417);
                    if (newCallRes$469.result.hasPrototype(Call$263)) {
                        return step$418(Const$262.create(head$419, newCallRes$469.result), newCallRes$469.rest);
                    }
                } else if (head$419.hasPrototype(Delimiter$255) && delim$429.token.value === '()') {
                    innerTokens$421 = delim$429.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$421.length === 0) {
                        return step$418(ParenExpression$248.create(head$419), rest$420);
                    } else {
                        var innerTerm$470 = get_expression$277(innerTokens$421, context$417);
                        if (innerTerm$470.result && innerTerm$470.result.hasPrototype(Expr$241)) {
                            return step$418(ParenExpression$248.create(head$419), rest$420);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$419.hasPrototype(Expr$241) && (rest$420[0] && rest$420[1] && stxIsBinOp$273(rest$420[0]))) {
                    var op$471 = rest$420[0];
                    var left$472 = head$419;
                    var bopRes$473 = enforest$276(rest$420.slice(1), context$417);
                    var right$465 = bopRes$473.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$465.hasPrototype(Expr$241)) {
                        return step$418(BinOp$251.create(op$471, left$472, right$465), bopRes$473.rest);
                    }
                } else if (head$419.hasPrototype(Punc$254) && stxIsUnaryOp$272(punc$432)) {
                    var unopRes$474 = enforest$276(rest$420, context$417);
                    if (unopRes$474.result.hasPrototype(Expr$241)) {
                        return step$418(UnaryOp$249.create(punc$432, unopRes$474.result), unopRes$474.rest);
                    }
                } else if (head$419.hasPrototype(Keyword$253) && stxIsUnaryOp$272(keyword$427)) {
                    var unopRes$474 = enforest$276(rest$420, context$417);
                    if (unopRes$474.result.hasPrototype(Expr$241)) {
                        return step$418(UnaryOp$249.create(keyword$427, unopRes$474.result), unopRes$474.rest);
                    }
                } else if (head$419.hasPrototype(Expr$241) && (rest$420[0] && (rest$420[0].token.value === '++' || rest$420[0].token.value === '--'))) {
                    return step$418(PostfixOp$250.create(head$419, rest$420[0]), rest$420.slice(1));
                } else if (head$419.hasPrototype(Expr$241) && (rest$420[0] && rest$420[0].token.value === '[]')) {
                    return step$418(ObjGet$265.create(head$419, Delimiter$255.create(rest$420[0].expose())), rest$420.slice(1));
                } else if (head$419.hasPrototype(Expr$241) && (rest$420[0] && rest$420[0].token.value === '.' && rest$420[1] && rest$420[1].token.type === parser$126.Token.Identifier)) {
                    return step$418(ObjDotGet$264.create(head$419, rest$420[0], rest$420[1]), rest$420.slice(2));
                } else if (head$419.hasPrototype(Delimiter$255) && delim$429.token.value === '[]') {
                    return step$418(ArrayLiteral$247.create(head$419), rest$420);
                } else if (head$419.hasPrototype(Delimiter$255) && head$419.delim.token.value === '{}') {
                    return step$418(Block$246.create(head$419), rest$420);
                } else if (head$419.hasPrototype(Keyword$253) && (keyword$427.token.value === 'let' && (rest$420[0] && rest$420[0].token.type === parser$126.Token.Identifier || rest$420[0] && rest$420[0].token.type === parser$126.Token.Keyword || rest$420[0] && rest$420[0].token.type === parser$126.Token.Punctuator) && rest$420[1] && rest$420[1].token.value === '=' && rest$420[2] && rest$420[2].token.value === 'macro')) {
                    var mac$475 = enforest$276(rest$420.slice(2), context$417);
                    if (!mac$475.result.hasPrototype(AnonMacro$261)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$475.result);
                    }
                    return step$418(LetMacro$259.create(rest$420[0], mac$475.result.body), mac$475.rest);
                } else if (head$419.hasPrototype(Keyword$253) && (keyword$427.token.value === 'var' && rest$420[0])) {
                    var vsRes$476 = enforestVarStatement$274(rest$420, context$417);
                    if (vsRes$476) {
                        return step$418(VariableStatement$267.create(head$419, vsRes$476.result), vsRes$476.rest);
                    }
                }
            } else {
                parser$126.assert(head$419 && head$419.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$419.token.type === parser$126.Token.Identifier || head$419.token.type === parser$126.Token.Keyword || head$419.token.type === parser$126.Token.Punctuator) && context$417.env.has(resolve$229(head$419))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$477 = fresh$235();
                    var transformerContext$478 = makeExpanderContext$285(_$125.defaults({ mark: newMark$477 }, context$417));
                    // pull the macro transformer out the environment
                    var transformer$479 = context$417.env.get(resolve$229(head$419)).fn;
                    // apply the transformer
                    var rt$480 = transformer$479([head$419].concat(rest$420), transformerContext$478);
                    if (!Array.isArray(rt$480.result)) {
                        throwError$216('Macro transformer must return a result array, not: ' + rt$480.result);
                    }
                    if (rt$480.result.length > 0) {
                        var adjustedResult$481 = adjustLineContext$275(rt$480.result, head$419);
                        adjustedResult$481[0].token.leadingComments = head$419.token.leadingComments;
                        return step$418(adjustedResult$481[0], adjustedResult$481.slice(1).concat(rt$480.rest));
                    } else {
                        return step$418(Empty$270.create(), rt$480.rest);
                    }
                }    // anon macro definition
                else if (head$419.token.type === parser$126.Token.Identifier && head$419.token.value === 'macro' && rest$420[0] && rest$420[0].token.value === '{}') {
                    return step$418(AnonMacro$261.create(rest$420[0].expose().token.inner), rest$420.slice(1));
                }    // macro definition
                else if (head$419.token.type === parser$126.Token.Identifier && head$419.token.value === 'macro' && rest$420[0] && (rest$420[0].token.type === parser$126.Token.Identifier || rest$420[0].token.type === parser$126.Token.Keyword || rest$420[0].token.type === parser$126.Token.Punctuator) && rest$420[1] && rest$420[1].token.type === parser$126.Token.Delimiter && rest$420[1].token.value === '{}') {
                    return step$418(Macro$260.create(rest$420[0], rest$420[1].expose().token.inner), rest$420.slice(2));
                }    // module definition
                else if (head$419.token.value === 'module' && rest$420[0] && rest$420[0].token.value === '{}') {
                    return step$418(Module$269.create(rest$420[0]), rest$420.slice(1));
                }    // function definition
                else if (head$419.token.type === parser$126.Token.Keyword && head$419.token.value === 'function' && rest$420[0] && rest$420[0].token.type === parser$126.Token.Identifier && rest$420[1] && rest$420[1].token.type === parser$126.Token.Delimiter && rest$420[1].token.value === '()' && rest$420[2] && rest$420[2].token.type === parser$126.Token.Delimiter && rest$420[2].token.value === '{}') {
                    rest$420[1].token.inner = rest$420[1].expose().token.inner;
                    rest$420[2].token.inner = rest$420[2].expose().token.inner;
                    return step$418(NamedFun$257.create(head$419, rest$420[0], rest$420[1], rest$420[2]), rest$420.slice(3));
                }    // anonymous function definition
                else if (head$419.token.type === parser$126.Token.Keyword && head$419.token.value === 'function' && rest$420[0] && rest$420[0].token.type === parser$126.Token.Delimiter && rest$420[0].token.value === '()' && rest$420[1] && rest$420[1].token.type === parser$126.Token.Delimiter && rest$420[1].token.value === '{}') {
                    rest$420[0].token.inner = rest$420[0].expose().token.inner;
                    rest$420[1].token.inner = rest$420[1].expose().token.inner;
                    return step$418(AnonFun$258.create(head$419, rest$420[0], rest$420[1]), rest$420.slice(2));
                }    // catch statement
                else if (head$419.token.type === parser$126.Token.Keyword && head$419.token.value === 'catch' && rest$420[0] && rest$420[0].token.type === parser$126.Token.Delimiter && rest$420[0].token.value === '()' && rest$420[1] && rest$420[1].token.type === parser$126.Token.Delimiter && rest$420[1].token.value === '{}') {
                    rest$420[0].token.inner = rest$420[0].expose().token.inner;
                    rest$420[1].token.inner = rest$420[1].expose().token.inner;
                    return step$418(CatchClause$268.create(head$419, rest$420[0], rest$420[1]), rest$420.slice(2));
                }    // this expression
                else if (head$419.token.type === parser$126.Token.Keyword && head$419.token.value === 'this') {
                    return step$418(ThisExpression$243.create(head$419), rest$420);
                }    // literal
                else if (head$419.token.type === parser$126.Token.NumericLiteral || head$419.token.type === parser$126.Token.StringLiteral || head$419.token.type === parser$126.Token.BooleanLiteral || head$419.token.type === parser$126.Token.RegexLiteral || head$419.token.type === parser$126.Token.NullLiteral) {
                    return step$418(Lit$244.create(head$419), rest$420);
                }    // export
                else if (head$419.token.type === parser$126.Token.Identifier && head$419.token.value === 'export' && rest$420[0] && (rest$420[0].token.type === parser$126.Token.Identifier || rest$420[0].token.type === parser$126.Token.Keyword || rest$420[0].token.type === parser$126.Token.Punctuator)) {
                    return step$418(Export$271.create(rest$420[0]), rest$420.slice(1));
                }    // identifier
                else if (head$419.token.type === parser$126.Token.Identifier) {
                    return step$418(Id$256.create(head$419), rest$420);
                }    // punctuator
                else if (head$419.token.type === parser$126.Token.Punctuator) {
                    return step$418(Punc$254.create(head$419), rest$420);
                } else if (head$419.token.type === parser$126.Token.Keyword && head$419.token.value === 'with') {
                    throwError$216('with is not supported in sweet.js');
                }    // keyword
                else if (head$419.token.type === parser$126.Token.Keyword) {
                    return step$418(Keyword$253.create(head$419), rest$420);
                }    // Delimiter
                else if (head$419.token.type === parser$126.Token.Delimiter) {
                    return step$418(Delimiter$255.create(head$419.expose()), rest$420);
                }    // end of file
                else if (head$419.token.type === parser$126.Token.EOF) {
                    parser$126.assert(rest$420.length === 0, 'nothing should be after an EOF');
                    return step$418(EOF$239.create(head$419), []);
                } else {
                    // todo: are we missing cases?
                    parser$126.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$419,
                rest: rest$420
            };
        }
        return step$418(toks$416[0], toks$416.slice(1));
    }
    function get_expression$277(stx$482, context$483) {
        var res$484 = enforest$276(stx$482, context$483);
        if (!res$484.result.hasPrototype(Expr$241)) {
            return {
                result: null,
                rest: stx$482
            };
        }
        return res$484;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$278(newMark$485, env$486) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$487(match$488) {
            if (match$488.level === 0) {
                // replace the match property with the marked syntax
                match$488.match = _$125.map(match$488.match, function (stx$489) {
                    return stx$489.mark(newMark$485);
                });
            } else {
                _$125.each(match$488.match, function (match$490) {
                    dfs$487(match$490);
                });
            }
        }
        _$125.keys(env$486).forEach(function (key$491) {
            dfs$487(env$486[key$491]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$279(mac$492, context$493) {
        var body$494 = mac$492.body;
        // raw function primitive form
        if (!(body$494[0] && body$494[0].token.type === parser$126.Token.Keyword && body$494[0].token.value === 'function')) {
            throwError$216('Primitive macro form must contain a function for the macro body');
        }
        var stub$495 = parser$126.read('()');
        stub$495[0].token.inner = body$494;
        var expanded$496 = expand$284(stub$495, context$493);
        expanded$496 = expanded$496[0].destruct().concat(expanded$496[1].eof);
        var flattend$497 = flatten$287(expanded$496);
        var bodyCode$498 = codegen$132.generate(parser$126.parse(flattend$497));
        var macroFn$499 = scopedEval$217(bodyCode$498, {
                makeValue: syn$127.makeValue,
                makeRegex: syn$127.makeRegex,
                makeIdent: syn$127.makeIdent,
                makeKeyword: syn$127.makeKeyword,
                makePunc: syn$127.makePunc,
                makeDelim: syn$127.makeDelim,
                unwrapSyntax: syn$127.unwrapSyntax,
                throwSyntaxError: syn$127.throwSyntaxError,
                parser: parser$126,
                _: _$125,
                patternModule: patternModule$130,
                getTemplate: function (id$500) {
                    return cloneSyntaxArray$280(context$493.templateMap.get(id$500));
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$278,
                mergeMatches: function (newMatch$501, oldMatch$502) {
                    newMatch$501.patternEnv = _$125.extend({}, oldMatch$502.patternEnv, newMatch$501.patternEnv);
                    return newMatch$501;
                }
            });
        return macroFn$499;
    }
    function cloneSyntaxArray$280(arr$503) {
        return arr$503.map(function (stx$504) {
            var o$505 = syntaxFromToken$225(_$125.clone(stx$504.token), stx$504);
            if (o$505.token.type === parser$126.Token.Delimiter) {
                o$505.token.inner = cloneSyntaxArray$280(o$505.token.inner);
            }
            return o$505;
        });
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$281(stx$506, context$507) {
        parser$126.assert(context$507, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$506.length === 0) {
            return {
                terms: [],
                context: context$507
            };
        }
        parser$126.assert(stx$506[0].token, 'expecting a syntax object');
        var f$508 = enforest$276(stx$506, context$507);
        // head :: TermTree
        var head$509 = f$508.result;
        // rest :: [Syntax]
        var rest$510 = f$508.rest;
        if (head$509.hasPrototype(Macro$260)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$512 = loadMacroDef$279(head$509, context$507);
            addToDefinitionCtx$282([head$509.name], context$507.defscope, false);
            context$507.env.set(resolve$229(head$509.name), { fn: macroDefinition$512 });
            return expandToTermTree$281(rest$510, context$507);
        }
        if (head$509.hasPrototype(LetMacro$259)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$512 = loadMacroDef$279(head$509, context$507);
            var freshName$513 = fresh$235();
            var renamedName$514 = head$509.name.rename(head$509.name, freshName$513);
            rest$510 = _$125.map(rest$510, function (stx$515) {
                return stx$515.rename(head$509.name, freshName$513);
            });
            head$509.name = renamedName$514;
            context$507.env.set(resolve$229(head$509.name), { fn: macroDefinition$512 });
            return expandToTermTree$281(rest$510, context$507);
        }
        if (head$509.hasPrototype(NamedFun$257)) {
            addToDefinitionCtx$282([head$509.name], context$507.defscope, true);
        }
        if (head$509.hasPrototype(Id$256) && head$509.id.token.value === '#quoteSyntax' && rest$510[0] && rest$510[0].token.value === '{}') {
            var tempId$516 = fresh$235();
            context$507.templateMap.set(tempId$516, rest$510[0].token.inner);
            return expandToTermTree$281([
                syn$127.makeIdent('getTemplate', head$509.id),
                syn$127.makeDelim('()', [syn$127.makeValue(tempId$516, head$509.id)], head$509.id)
            ].concat(rest$510.slice(1)), context$507);
        }
        if (head$509.hasPrototype(VariableStatement$267)) {
            addToDefinitionCtx$282(_$125.map(head$509.decls, function (decl$517) {
                return decl$517.ident;
            }), context$507.defscope, true);
        }
        if (head$509.hasPrototype(Block$246) && head$509.body.hasPrototype(Delimiter$255)) {
            head$509.body.delim.token.inner.forEach(function (term$518) {
                if (term$518.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$282(_$125.map(term$518.decls, function (decl$519) {
                        return decl$519.ident;
                    }), context$507.defscope, true);
                }
            });
        }
        if (head$509.hasPrototype(Delimiter$255)) {
            head$509.delim.token.inner.forEach(function (term$520) {
                if (term$520.hasPrototype(VariableStatement$267)) {
                    addToDefinitionCtx$282(_$125.map(term$520.decls, function (decl$521) {
                        return decl$521.ident;
                    }), context$507.defscope, true);
                }
            });
        }
        var trees$511 = expandToTermTree$281(rest$510, context$507);
        return {
            terms: [head$509].concat(trees$511.terms),
            context: trees$511.context
        };
    }
    function addToDefinitionCtx$282(idents$522, defscope$523, skipRep$524) {
        parser$126.assert(idents$522 && idents$522.length > 0, 'expecting some variable identifiers');
        skipRep$524 = skipRep$524 || false;
        _$125.each(idents$522, function (id$525) {
            var skip$526 = false;
            if (skipRep$524) {
                var declRepeat$527 = _$125.find(defscope$523, function (def$528) {
                        return def$528.id.token.value === id$525.token.value && arraysEqual$230(marksof$228(def$528.id.context), marksof$228(id$525.context));
                    });
                skip$526 = typeof declRepeat$527 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$526) {
                var name$529 = fresh$235();
                defscope$523.push({
                    id: id$525,
                    name: name$529
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$283(term$530, context$531) {
        parser$126.assert(context$531 && context$531.env, 'environment map is required');
        if (term$530.hasPrototype(ArrayLiteral$247)) {
            term$530.array.delim.token.inner = expand$284(term$530.array.delim.expose().token.inner, context$531);
            return term$530;
        } else if (term$530.hasPrototype(Block$246)) {
            term$530.body.delim.token.inner = expand$284(term$530.body.delim.expose().token.inner, context$531);
            return term$530;
        } else if (term$530.hasPrototype(ParenExpression$248)) {
            term$530.expr.delim.token.inner = expand$284(term$530.expr.delim.expose().token.inner, context$531);
            return term$530;
        } else if (term$530.hasPrototype(Call$263)) {
            term$530.fun = expandTermTreeToFinal$283(term$530.fun, context$531);
            term$530.args = _$125.map(term$530.args, function (arg$532) {
                return expandTermTreeToFinal$283(arg$532, context$531);
            });
            return term$530;
        } else if (term$530.hasPrototype(UnaryOp$249)) {
            term$530.expr = expandTermTreeToFinal$283(term$530.expr, context$531);
            return term$530;
        } else if (term$530.hasPrototype(BinOp$251)) {
            term$530.left = expandTermTreeToFinal$283(term$530.left, context$531);
            term$530.right = expandTermTreeToFinal$283(term$530.right, context$531);
            return term$530;
        } else if (term$530.hasPrototype(ObjGet$265)) {
            term$530.right.delim.token.inner = expand$284(term$530.right.delim.expose().token.inner, context$531);
            return term$530;
        } else if (term$530.hasPrototype(ObjDotGet$264)) {
            term$530.left = expandTermTreeToFinal$283(term$530.left, context$531);
            term$530.right = expandTermTreeToFinal$283(term$530.right, context$531);
            return term$530;
        } else if (term$530.hasPrototype(VariableDeclaration$266)) {
            if (term$530.init) {
                term$530.init = expandTermTreeToFinal$283(term$530.init, context$531);
            }
            return term$530;
        } else if (term$530.hasPrototype(VariableStatement$267)) {
            term$530.decls = _$125.map(term$530.decls, function (decl$533) {
                return expandTermTreeToFinal$283(decl$533, context$531);
            });
            return term$530;
        } else if (term$530.hasPrototype(Delimiter$255)) {
            // expand inside the delimiter and then continue on
            term$530.delim.token.inner = expand$284(term$530.delim.expose().token.inner, context$531);
            return term$530;
        } else if (term$530.hasPrototype(NamedFun$257) || term$530.hasPrototype(AnonFun$258) || term$530.hasPrototype(CatchClause$268) || term$530.hasPrototype(Module$269)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$534 = [];
            var bodyContext$535 = makeExpanderContext$285(_$125.defaults({ defscope: newDef$534 }, context$531));
            if (term$530.params) {
                var params$544 = term$530.params.expose();
            } else {
                var params$544 = syn$127.makeDelim('()', [], null);
            }
            var bodies$536 = term$530.body.addDefCtx(newDef$534);
            var paramNames$537 = _$125.map(getParamIdentifiers$237(params$544), function (param$545) {
                    var freshName$546 = fresh$235();
                    return {
                        freshName: freshName$546,
                        originalParam: param$545,
                        renamedParam: param$545.rename(param$545, freshName$546)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$538 = _$125.reduce(paramNames$537, function (accBody$547, p$548) {
                    return accBody$547.rename(p$548.originalParam, p$548.freshName);
                }, bodies$536);
            renamedBody$538 = renamedBody$538.expose();
            var expandedResult$539 = expandToTermTree$281(renamedBody$538.token.inner, bodyContext$535);
            var bodyTerms$540 = expandedResult$539.terms;
            var renamedParams$541 = _$125.map(paramNames$537, function (p$549) {
                    return p$549.renamedParam;
                });
            var flatArgs$542 = syn$127.makeDelim('()', joinSyntax$226(renamedParams$541, ','), term$530.params);
            var expandedArgs$543 = expand$284([flatArgs$542], bodyContext$535);
            parser$126.assert(expandedArgs$543.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$530.params) {
                term$530.params = expandedArgs$543[0];
            }
            bodyTerms$540 = _$125.map(bodyTerms$540, function (bodyTerm$550) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$551 = bodyTerm$550.addDefCtx(newDef$534);
                // finish expansion
                return expandTermTreeToFinal$283(termWithCtx$551, expandedResult$539.context);
            });
            if (term$530.hasPrototype(Module$269)) {
                bodyTerms$540 = _$125.filter(bodyTerms$540, function (bodyTerm$552) {
                    if (bodyTerm$552.hasPrototype(Export$271)) {
                        term$530.exports.push(bodyTerm$552);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$538.token.inner = bodyTerms$540;
            term$530.body = renamedBody$538;
            // and continue expand the rest
            return term$530;
        }
        // the term is fine as is
        return term$530;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$284(stx$553, context$554) {
        parser$126.assert(context$554, 'must provide an expander context');
        var trees$555 = expandToTermTree$281(stx$553, context$554);
        return _$125.map(trees$555.terms, function (term$556) {
            return expandTermTreeToFinal$283(term$556, trees$555.context);
        });
    }
    function makeExpanderContext$285(o$557) {
        o$557 = o$557 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$557.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$557.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$557.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$557.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$286(stx$558, builtinSource$559) {
        var env$560 = new Map();
        var params$561 = [];
        var context$562, builtInContext$563 = makeExpanderContext$285({ env: env$560 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$559) {
            var builtinRead$566 = parser$126.read(builtinSource$559);
            builtinRead$566 = [
                syn$127.makeIdent('module', null),
                syn$127.makeDelim('{}', builtinRead$566, null)
            ];
            var builtinRes$567 = expand$284(builtinRead$566, builtInContext$563);
            params$561 = _$125.map(builtinRes$567[0].exports, function (term$568) {
                return {
                    oldExport: term$568.name,
                    newParam: syn$127.makeIdent(term$568.name.token.value, null)
                };
            });
        }
        var modBody$564 = syn$127.makeDelim('{}', stx$558, null);
        modBody$564 = _$125.reduce(params$561, function (acc$569, param$570) {
            var newName$571 = fresh$235();
            env$560.set(resolve$229(param$570.newParam.rename(param$570.newParam, newName$571)), env$560.get(resolve$229(param$570.oldExport)));
            return acc$569.rename(param$570.newParam, newName$571);
        }, modBody$564);
        context$562 = makeExpanderContext$285({ env: env$560 });
        var res$565 = expand$284([
                syn$127.makeIdent('module', null),
                modBody$564
            ], context$562);
        res$565 = res$565[0].destruct();
        return flatten$287(res$565[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$287(stx$572) {
        return _$125.reduce(stx$572, function (acc$573, stx$574) {
            if (stx$574.token.type === parser$126.Token.Delimiter) {
                var exposed$575 = stx$574.expose();
                var openParen$576 = syntaxFromToken$225({
                        type: parser$126.Token.Punctuator,
                        value: stx$574.token.value[0],
                        range: stx$574.token.startRange,
                        sm_range: typeof stx$574.token.sm_startRange == 'undefined' ? stx$574.token.startRange : stx$574.token.sm_startRange,
                        lineNumber: stx$574.token.startLineNumber,
                        sm_lineNumber: typeof stx$574.token.sm_startLineNumber == 'undefined' ? stx$574.token.startLineNumber : stx$574.token.sm_startLineNumber,
                        lineStart: stx$574.token.startLineStart,
                        sm_lineStart: typeof stx$574.token.sm_startLineStart == 'undefined' ? stx$574.token.startLineStart : stx$574.token.sm_startLineStart
                    }, exposed$575);
                var closeParen$577 = syntaxFromToken$225({
                        type: parser$126.Token.Punctuator,
                        value: stx$574.token.value[1],
                        range: stx$574.token.endRange,
                        sm_range: typeof stx$574.token.sm_endRange == 'undefined' ? stx$574.token.endRange : stx$574.token.sm_endRange,
                        lineNumber: stx$574.token.endLineNumber,
                        sm_lineNumber: typeof stx$574.token.sm_endLineNumber == 'undefined' ? stx$574.token.endLineNumber : stx$574.token.sm_endLineNumber,
                        lineStart: stx$574.token.endLineStart,
                        sm_lineStart: typeof stx$574.token.sm_endLineStart == 'undefined' ? stx$574.token.endLineStart : stx$574.token.sm_endLineStart
                    }, exposed$575);
                if (stx$574.token.leadingComments) {
                    openParen$576.token.leadingComments = stx$574.token.leadingComments;
                }
                if (stx$574.token.trailingComments) {
                    openParen$576.token.trailingComments = stx$574.token.trailingComments;
                }
                return acc$573.concat(openParen$576).concat(flatten$287(exposed$575.token.inner)).concat(closeParen$577);
            }
            stx$574.token.sm_lineNumber = stx$574.token.sm_lineNumber ? stx$574.token.sm_lineNumber : stx$574.token.lineNumber;
            stx$574.token.sm_lineStart = stx$574.token.sm_lineStart ? stx$574.token.sm_lineStart : stx$574.token.lineStart;
            stx$574.token.sm_range = stx$574.token.sm_range ? stx$574.token.sm_range : stx$574.token.range;
            return acc$573.concat(stx$574);
        }, []);
    }
    exports$124.enforest = enforest$276;
    exports$124.expand = expandTopLevel$286;
    exports$124.resolve = resolve$229;
    exports$124.get_expression = get_expression$277;
    exports$124.makeExpanderContext = makeExpanderContext$285;
    exports$124.Expr = Expr$241;
    exports$124.VariableStatement = VariableStatement$267;
    exports$124.tokensToSyntax = syn$127.tokensToSyntax;
    exports$124.syntaxToTokens = syn$127.syntaxToTokens;
}));