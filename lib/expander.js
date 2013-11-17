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
(function (root$111, factory$112) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$112(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$112);
    }
}(this, function (exports$113, _$114, parser$115, syn$116, es6$117, se$118, patternModule$119, gen$120) {
    'use strict';
    var codegen$121 = gen$120 || escodegen;
    // used to export "private" methods for unit testing
    exports$113._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$279 = Object.create(this);
                if (typeof o$279.construct === 'function') {
                    o$279.construct.apply(o$279, arguments);
                }
                return o$279;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$280) {
                var result$281 = Object.create(this);
                for (var prop$282 in properties$280) {
                    if (properties$280.hasOwnProperty(prop$282)) {
                        result$281[prop$282] = properties$280[prop$282];
                    }
                }
                return result$281;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$283) {
                function F$284() {
                }
                F$284.prototype = proto$283;
                return this instanceof F$284;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$208(msg$285) {
        throw new Error(msg$285);
    }
    var scopedEval$209 = se$118.scopedEval;
    var Rename$210 = syn$116.Rename;
    var Mark$211 = syn$116.Mark;
    var Var$212 = syn$116.Var;
    var Def$213 = syn$116.Def;
    var isDef$214 = syn$116.isDef;
    var isMark$215 = syn$116.isMark;
    var isRename$216 = syn$116.isRename;
    var syntaxFromToken$217 = syn$116.syntaxFromToken;
    var joinSyntax$218 = syn$116.joinSyntax;
    function remdup$219(mark$286, mlist$287) {
        if (mark$286 === _$114.first(mlist$287)) {
            return _$114.rest(mlist$287, 1);
        }
        return [mark$286].concat(mlist$287);
    }
    // (CSyntax) -> [...Num]
    function marksof$220(ctx$288, stopName$289, originalName$290) {
        var mark$291, submarks$292;
        if (isMark$215(ctx$288)) {
            mark$291 = ctx$288.mark;
            submarks$292 = marksof$220(ctx$288.context, stopName$289, originalName$290);
            return remdup$219(mark$291, submarks$292);
        }
        if (isDef$214(ctx$288)) {
            return marksof$220(ctx$288.context, stopName$289, originalName$290);
        }
        if (isRename$216(ctx$288)) {
            if (stopName$289 === originalName$290 + '$' + ctx$288.name) {
                return [];
            }
            return marksof$220(ctx$288.context, stopName$289, originalName$290);
        }
        return [];
    }
    function resolve$221(stx$293) {
        return resolveCtx$225(stx$293.token.value, stx$293.context, [], []);
    }
    function arraysEqual$222(a$294, b$295) {
        if (a$294.length !== b$295.length) {
            return false;
        }
        for (var i$296 = 0; i$296 < a$294.length; i$296++) {
            if (a$294[i$296] !== b$295[i$296]) {
                return false;
            }
        }
        return true;
    }
    function renames$223(defctx$297, oldctx$298, originalName$299) {
        var acc$300 = oldctx$298;
        for (var i$301 = 0; i$301 < defctx$297.length; i$301++) {
            if (defctx$297[i$301].id.token.value === originalName$299) {
                acc$300 = Rename$210(defctx$297[i$301].id, defctx$297[i$301].name, acc$300, defctx$297);
            }
        }
        return acc$300;
    }
    function unionEl$224(arr$302, el$303) {
        if (arr$302.indexOf(el$303) === -1) {
            var res$304 = arr$302.slice(0);
            res$304.push(el$303);
            return res$304;
        }
        return arr$302;
    }
    // (Syntax) -> String
    function resolveCtx$225(originalName$305, ctx$306, stop_spine$307, stop_branch$308) {
        if (isMark$215(ctx$306)) {
            return resolveCtx$225(originalName$305, ctx$306.context, stop_spine$307, stop_branch$308);
        }
        if (isDef$214(ctx$306)) {
            if (stop_spine$307.indexOf(ctx$306.defctx) !== -1) {
                return resolveCtx$225(originalName$305, ctx$306.context, stop_spine$307, stop_branch$308);
            } else {
                return resolveCtx$225(originalName$305, renames$223(ctx$306.defctx, ctx$306.context, originalName$305), stop_spine$307, unionEl$224(stop_branch$308, ctx$306.defctx));
            }
        }
        if (isRename$216(ctx$306)) {
            if (originalName$305 === ctx$306.id.token.value) {
                var idName$309 = resolveCtx$225(ctx$306.id.token.value, ctx$306.id.context, stop_branch$308, stop_branch$308);
                var subName$310 = resolveCtx$225(originalName$305, ctx$306.context, unionEl$224(stop_spine$307, ctx$306.def), stop_branch$308);
                if (idName$309 === subName$310) {
                    var idMarks$311 = marksof$220(ctx$306.id.context, originalName$305 + '$' + ctx$306.name, originalName$305);
                    var subMarks$312 = marksof$220(ctx$306.context, originalName$305 + '$' + ctx$306.name, originalName$305);
                    if (arraysEqual$222(idMarks$311, subMarks$312)) {
                        return originalName$305 + '$' + ctx$306.name;
                    }
                }
            }
            return resolveCtx$225(originalName$305, ctx$306.context, stop_spine$307, stop_branch$308);
        }
        return originalName$305;
    }
    var nextFresh$226 = 0;
    // fun () -> Num
    function fresh$227() {
        return nextFresh$226++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$228(towrap$313, delimSyntax$314) {
        parser$115.assert(delimSyntax$314.token.type === parser$115.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$217({
            type: parser$115.Token.Delimiter,
            value: delimSyntax$314.token.value,
            inner: towrap$313,
            range: delimSyntax$314.token.range,
            startLineNumber: delimSyntax$314.token.startLineNumber,
            lineStart: delimSyntax$314.token.lineStart
        }, delimSyntax$314);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$229(argSyntax$315) {
        parser$115.assert(argSyntax$315.token.type === parser$115.Token.Delimiter, 'expecting delimiter for function params');
        return _$114.filter(argSyntax$315.token.inner, function (stx$316) {
            return stx$316.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$230 = {
            destruct: function () {
                return _$114.reduce(this.properties, _$114.bind(function (acc$317, prop$318) {
                    if (this[prop$318] && this[prop$318].hasPrototype(TermTree$230)) {
                        return acc$317.concat(this[prop$318].destruct());
                    } else if (this[prop$318] && this[prop$318].token && this[prop$318].token.inner) {
                        this[prop$318].token.inner = _$114.reduce(this[prop$318].token.inner, function (acc$319, t$320) {
                            if (t$320.hasPrototype(TermTree$230)) {
                                return acc$319.concat(t$320.destruct());
                            }
                            return acc$319.concat(t$320);
                        }, []);
                        return acc$317.concat(this[prop$318]);
                    } else if (this[prop$318]) {
                        return acc$317.concat(this[prop$318]);
                    } else {
                        return acc$317;
                    }
                }, this), []);
            },
            addDefCtx: function (def$321) {
                for (var i$322 = 0; i$322 < this.properties.length; i$322++) {
                    var prop$323 = this.properties[i$322];
                    if (Array.isArray(this[prop$323])) {
                        this[prop$323] = _$114.map(this[prop$323], function (item$324) {
                            return item$324.addDefCtx(def$321);
                        });
                    } else if (this[prop$323]) {
                        this[prop$323] = this[prop$323].addDefCtx(def$321);
                    }
                }
                return this;
            }
        };
    var EOF$231 = TermTree$230.extend({
            properties: ['eof'],
            construct: function (e$325) {
                this.eof = e$325;
            }
        });
    var Statement$232 = TermTree$230.extend({
            construct: function () {
            }
        });
    var Expr$233 = TermTree$230.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$234 = Expr$233.extend({
            construct: function () {
            }
        });
    var ThisExpression$235 = PrimaryExpression$234.extend({
            properties: ['this'],
            construct: function (that$326) {
                this.this = that$326;
            }
        });
    var Lit$236 = PrimaryExpression$234.extend({
            properties: ['lit'],
            construct: function (l$327) {
                this.lit = l$327;
            }
        });
    exports$113._test.PropertyAssignment = PropertyAssignment$237;
    var PropertyAssignment$237 = TermTree$230.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$328, assignment$329) {
                this.propName = propName$328;
                this.assignment = assignment$329;
            }
        });
    var Block$238 = PrimaryExpression$234.extend({
            properties: ['body'],
            construct: function (body$330) {
                this.body = body$330;
            }
        });
    var ArrayLiteral$239 = PrimaryExpression$234.extend({
            properties: ['array'],
            construct: function (ar$331) {
                this.array = ar$331;
            }
        });
    var ParenExpression$240 = PrimaryExpression$234.extend({
            properties: ['expr'],
            construct: function (expr$332) {
                this.expr = expr$332;
            }
        });
    var UnaryOp$241 = Expr$233.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$333, expr$334) {
                this.op = op$333;
                this.expr = expr$334;
            }
        });
    var PostfixOp$242 = Expr$233.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$335, op$336) {
                this.expr = expr$335;
                this.op = op$336;
            }
        });
    var BinOp$243 = Expr$233.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$337, left$338, right$339) {
                this.op = op$337;
                this.left = left$338;
                this.right = right$339;
            }
        });
    var ConditionalExpression$244 = Expr$233.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$340, question$341, tru$342, colon$343, fls$344) {
                this.cond = cond$340;
                this.question = question$341;
                this.tru = tru$342;
                this.colon = colon$343;
                this.fls = fls$344;
            }
        });
    var Keyword$245 = TermTree$230.extend({
            properties: ['keyword'],
            construct: function (k$345) {
                this.keyword = k$345;
            }
        });
    var Punc$246 = TermTree$230.extend({
            properties: ['punc'],
            construct: function (p$346) {
                this.punc = p$346;
            }
        });
    var Delimiter$247 = TermTree$230.extend({
            properties: ['delim'],
            construct: function (d$347) {
                this.delim = d$347;
            }
        });
    var Id$248 = PrimaryExpression$234.extend({
            properties: ['id'],
            construct: function (id$348) {
                this.id = id$348;
            }
        });
    var NamedFun$249 = Expr$233.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$349, name$350, params$351, body$352) {
                this.keyword = keyword$349;
                this.name = name$350;
                this.params = params$351;
                this.body = body$352;
            }
        });
    var AnonFun$250 = Expr$233.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$353, params$354, body$355) {
                this.keyword = keyword$353;
                this.params = params$354;
                this.body = body$355;
            }
        });
    var LetMacro$251 = TermTree$230.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$356, body$357) {
                this.name = name$356;
                this.body = body$357;
            }
        });
    var Macro$252 = TermTree$230.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$358, body$359) {
                this.name = name$358;
                this.body = body$359;
            }
        });
    var AnonMacro$253 = TermTree$230.extend({
            properties: ['body'],
            construct: function (body$360) {
                this.body = body$360;
            }
        });
    var Const$254 = Expr$233.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$361, call$362) {
                this.newterm = newterm$361;
                this.call = call$362;
            }
        });
    var Call$255 = Expr$233.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$115.assert(this.fun.hasPrototype(TermTree$230), 'expecting a term tree in destruct of call');
                var that$363 = this;
                this.delim = syntaxFromToken$217(_$114.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$114.reduce(this.args, function (acc$364, term$365) {
                    parser$115.assert(term$365 && term$365.hasPrototype(TermTree$230), 'expecting term trees in destruct of Call');
                    var dst$366 = acc$364.concat(term$365.destruct());
                    // add all commas except for the last one
                    if (that$363.commas.length > 0) {
                        dst$366 = dst$366.concat(that$363.commas.shift());
                    }
                    return dst$366;
                }, []);
                return this.fun.destruct().concat(Delimiter$247.create(this.delim).destruct());
            },
            construct: function (funn$367, args$368, delim$369, commas$370) {
                parser$115.assert(Array.isArray(args$368), 'requires an array of arguments terms');
                this.fun = funn$367;
                this.args = args$368;
                this.delim = delim$369;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$370;
            }
        });
    var ObjDotGet$256 = Expr$233.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$371, dot$372, right$373) {
                this.left = left$371;
                this.dot = dot$372;
                this.right = right$373;
            }
        });
    var ObjGet$257 = Expr$233.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$374, right$375) {
                this.left = left$374;
                this.right = right$375;
            }
        });
    var VariableDeclaration$258 = TermTree$230.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$376, eqstx$377, init$378, comma$379) {
                this.ident = ident$376;
                this.eqstx = eqstx$377;
                this.init = init$378;
                this.comma = comma$379;
            }
        });
    var VariableStatement$259 = Statement$232.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$114.reduce(this.decls, function (acc$380, decl$381) {
                    return acc$380.concat(decl$381.destruct());
                }, []));
            },
            construct: function (varkw$382, decls$383) {
                parser$115.assert(Array.isArray(decls$383), 'decls must be an array');
                this.varkw = varkw$382;
                this.decls = decls$383;
            }
        });
    var CatchClause$260 = TermTree$230.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$384, params$385, body$386) {
                this.catchkw = catchkw$384;
                this.params = params$385;
                this.body = body$386;
            }
        });
    var Module$261 = TermTree$230.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$387) {
                this.body = body$387;
                this.exports = [];
            }
        });
    var Empty$262 = TermTree$230.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$263 = TermTree$230.extend({
            properties: ['name'],
            construct: function (name$388) {
                this.name = name$388;
            }
        });
    function stxIsUnaryOp$264(stx$389) {
        var staticOperators$390 = [
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
        return _$114.contains(staticOperators$390, stx$389.token.value);
    }
    function stxIsBinOp$265(stx$391) {
        var staticOperators$392 = [
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
        return _$114.contains(staticOperators$392, stx$391.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$266(stx$393, context$394) {
        var decls$395 = [];
        var res$396 = enforest$268(stx$393, context$394);
        var result$397 = res$396.result;
        var rest$398 = res$396.rest;
        if (rest$398[0]) {
            var nextRes$399 = enforest$268(rest$398, context$394);
            // x = ...
            if (nextRes$399.result.hasPrototype(Punc$246) && nextRes$399.result.punc.token.value === '=') {
                var initializerRes$400 = enforest$268(nextRes$399.rest, context$394);
                if (initializerRes$400.rest[0]) {
                    var restRes$401 = enforest$268(initializerRes$400.rest, context$394);
                    // x = y + z, ...
                    if (restRes$401.result.hasPrototype(Punc$246) && restRes$401.result.punc.token.value === ',') {
                        decls$395.push(VariableDeclaration$258.create(result$397.id, nextRes$399.result.punc, initializerRes$400.result, restRes$401.result.punc));
                        var subRes$402 = enforestVarStatement$266(restRes$401.rest, context$394);
                        decls$395 = decls$395.concat(subRes$402.result);
                        rest$398 = subRes$402.rest;
                    }    // x = y ...
                    else {
                        decls$395.push(VariableDeclaration$258.create(result$397.id, nextRes$399.result.punc, initializerRes$400.result));
                        rest$398 = initializerRes$400.rest;
                    }
                }    // x = y EOF
                else {
                    decls$395.push(VariableDeclaration$258.create(result$397.id, nextRes$399.result.punc, initializerRes$400.result));
                }
            }    // x ,...;
            else if (nextRes$399.result.hasPrototype(Punc$246) && nextRes$399.result.punc.token.value === ',') {
                decls$395.push(VariableDeclaration$258.create(result$397.id, null, null, nextRes$399.result.punc));
                var subRes$402 = enforestVarStatement$266(nextRes$399.rest, context$394);
                decls$395 = decls$395.concat(subRes$402.result);
                rest$398 = subRes$402.rest;
            } else {
                if (result$397.hasPrototype(Id$248)) {
                    decls$395.push(VariableDeclaration$258.create(result$397.id));
                } else {
                    throwError$208('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$397.hasPrototype(Id$248)) {
                decls$395.push(VariableDeclaration$258.create(result$397.id));
            } else if (result$397.hasPrototype(BinOp$243) && result$397.op.token.value === 'in') {
                decls$395.push(VariableDeclaration$258.create(result$397.left.id, result$397.op, result$397.right));
            } else {
                throwError$208('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$395,
            rest: rest$398
        };
    }
    function adjustLineContext$267(stx$403, original$404) {
        var last$405 = stx$403[0] && typeof stx$403[0].token.range == 'undefined' ? original$404 : stx$403[0];
        return _$114.map(stx$403, function (stx$406) {
            if (typeof stx$406.token.range == 'undefined') {
                stx$406.token.range = last$405.token.range;
            }
            if (stx$406.token.type === parser$115.Token.Delimiter) {
                stx$406.token.sm_startLineNumber = original$404.token.lineNumber;
                stx$406.token.sm_endLineNumber = original$404.token.lineNumber;
                stx$406.token.sm_startLineStart = original$404.token.lineStart;
                stx$406.token.sm_endLineStart = original$404.token.lineStart;
                if (stx$406.token.inner.length > 0) {
                    stx$406.token.inner = adjustLineContext$267(stx$406.token.inner, original$404);
                }
                last$405 = stx$406;
                return stx$406;
            }
            stx$406.token.sm_lineNumber = original$404.token.lineNumber;
            stx$406.token.sm_lineStart = original$404.token.lineStart;
            last$405 = stx$406;
            return stx$406;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$268(toks$407, context$408) {
        parser$115.assert(toks$407.length > 0, 'enforest assumes there are tokens to work with');
        function step$409(head$410, rest$411) {
            var innerTokens$412;
            parser$115.assert(Array.isArray(rest$411), 'result must at least be an empty array');
            if (head$410.hasPrototype(TermTree$230)) {
                // function call
                var emp$417 = head$410.emp;
                var emp$417 = head$410.emp;
                var keyword$422 = head$410.keyword;
                var delim$425 = head$410.delim;
                var emp$417 = head$410.emp;
                var punc$430 = head$410.punc;
                var keyword$422 = head$410.keyword;
                var emp$417 = head$410.emp;
                var emp$417 = head$410.emp;
                var emp$417 = head$410.emp;
                var delim$425 = head$410.delim;
                var delim$425 = head$410.delim;
                var keyword$422 = head$410.keyword;
                var keyword$422 = head$410.keyword;
                if (head$410.hasPrototype(Expr$233) && (rest$411[0] && rest$411[0].token.type === parser$115.Token.Delimiter && rest$411[0].token.value === '()')) {
                    var argRes$479, enforestedArgs$480 = [], commas$481 = [];
                    rest$411[0].expose();
                    innerTokens$412 = rest$411[0].token.inner;
                    while (innerTokens$412.length > 0) {
                        argRes$479 = enforest$268(innerTokens$412, context$408);
                        enforestedArgs$480.push(argRes$479.result);
                        innerTokens$412 = argRes$479.rest;
                        if (innerTokens$412[0] && innerTokens$412[0].token.value === ',') {
                            // record the comma for later
                            commas$481.push(innerTokens$412[0]);
                            // but dump it for the next loop turn
                            innerTokens$412 = innerTokens$412.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$482 = _$114.all(enforestedArgs$480, function (argTerm$483) {
                            return argTerm$483.hasPrototype(Expr$233);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$412.length === 0 && argsAreExprs$482) {
                        return step$409(Call$255.create(head$410, enforestedArgs$480, rest$411[0], commas$481), rest$411.slice(1));
                    }
                } else if (head$410.hasPrototype(Expr$233) && (rest$411[0] && rest$411[0].token.value === '?')) {
                    var question$484 = rest$411[0];
                    var condRes$485 = enforest$268(rest$411.slice(1), context$408);
                    var truExpr$486 = condRes$485.result;
                    var right$487 = condRes$485.rest;
                    if (truExpr$486.hasPrototype(Expr$233) && right$487[0] && right$487[0].token.value === ':') {
                        var colon$488 = right$487[0];
                        var flsRes$489 = enforest$268(right$487.slice(1), context$408);
                        var flsExpr$490 = flsRes$489.result;
                        if (flsExpr$490.hasPrototype(Expr$233)) {
                            return step$409(ConditionalExpression$244.create(head$410, question$484, truExpr$486, colon$488, flsExpr$490), flsRes$489.rest);
                        }
                    }
                } else if (head$410.hasPrototype(Keyword$245) && (keyword$422.token.value === 'new' && rest$411[0])) {
                    var newCallRes$491 = enforest$268(rest$411, context$408);
                    if (newCallRes$491.result.hasPrototype(Call$255)) {
                        return step$409(Const$254.create(head$410, newCallRes$491.result), newCallRes$491.rest);
                    }
                } else if (head$410.hasPrototype(Delimiter$247) && delim$425.token.value === '()') {
                    innerTokens$412 = delim$425.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$412.length === 0) {
                        return step$409(ParenExpression$240.create(head$410), rest$411);
                    } else {
                        var innerTerm$492 = get_expression$269(innerTokens$412, context$408);
                        if (innerTerm$492.result && innerTerm$492.result.hasPrototype(Expr$233)) {
                            return step$409(ParenExpression$240.create(head$410), rest$411);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$410.hasPrototype(Expr$233) && (rest$411[0] && rest$411[1] && stxIsBinOp$265(rest$411[0]))) {
                    var op$493 = rest$411[0];
                    var left$494 = head$410;
                    var bopRes$495 = enforest$268(rest$411.slice(1), context$408);
                    var right$487 = bopRes$495.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$487.hasPrototype(Expr$233)) {
                        return step$409(BinOp$243.create(op$493, left$494, right$487), bopRes$495.rest);
                    }
                } else if (head$410.hasPrototype(Punc$246) && stxIsUnaryOp$264(punc$430)) {
                    var unopRes$496 = enforest$268(rest$411, context$408);
                    if (unopRes$496.result.hasPrototype(Expr$233)) {
                        return step$409(UnaryOp$241.create(punc$430, unopRes$496.result), unopRes$496.rest);
                    }
                } else if (head$410.hasPrototype(Keyword$245) && stxIsUnaryOp$264(keyword$422)) {
                    var unopRes$496 = enforest$268(rest$411, context$408);
                    if (unopRes$496.result.hasPrototype(Expr$233)) {
                        return step$409(UnaryOp$241.create(keyword$422, unopRes$496.result), unopRes$496.rest);
                    }
                } else if (head$410.hasPrototype(Expr$233) && (rest$411[0] && (rest$411[0].token.value === '++' || rest$411[0].token.value === '--'))) {
                    return step$409(PostfixOp$242.create(head$410, rest$411[0]), rest$411.slice(1));
                } else if (head$410.hasPrototype(Expr$233) && (rest$411[0] && rest$411[0].token.value === '[]')) {
                    return step$409(ObjGet$257.create(head$410, Delimiter$247.create(rest$411[0].expose())), rest$411.slice(1));
                } else if (head$410.hasPrototype(Expr$233) && (rest$411[0] && rest$411[0].token.value === '.' && rest$411[1] && rest$411[1].token.type === parser$115.Token.Identifier)) {
                    return step$409(ObjDotGet$256.create(head$410, rest$411[0], rest$411[1]), rest$411.slice(2));
                } else if (head$410.hasPrototype(Delimiter$247) && delim$425.token.value === '[]') {
                    return step$409(ArrayLiteral$239.create(head$410), rest$411);
                } else if (head$410.hasPrototype(Delimiter$247) && head$410.delim.token.value === '{}') {
                    return step$409(Block$238.create(head$410), rest$411);
                } else if (head$410.hasPrototype(Keyword$245) && (keyword$422.token.value === 'let' && (rest$411[0] && rest$411[0].token.type === parser$115.Token.Identifier || rest$411[0] && rest$411[0].token.type === parser$115.Token.Keyword || rest$411[0] && rest$411[0].token.type === parser$115.Token.Punctuator) && rest$411[1] && rest$411[1].token.value === '=' && rest$411[2] && rest$411[2].token.value === 'macro')) {
                    var mac$497 = enforest$268(rest$411.slice(2), context$408);
                    if (!mac$497.result.hasPrototype(AnonMacro$253)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$497.result);
                    }
                    return step$409(LetMacro$251.create(rest$411[0], mac$497.result.body), mac$497.rest);
                } else if (head$410.hasPrototype(Keyword$245) && (keyword$422.token.value === 'var' && rest$411[0])) {
                    var vsRes$498 = enforestVarStatement$266(rest$411, context$408);
                    if (vsRes$498) {
                        return step$409(VariableStatement$259.create(head$410, vsRes$498.result), vsRes$498.rest);
                    }
                }
            } else {
                parser$115.assert(head$410 && head$410.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$410.token.type === parser$115.Token.Identifier || head$410.token.type === parser$115.Token.Keyword || head$410.token.type === parser$115.Token.Punctuator) && context$408.env.has(resolve$221(head$410))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$499 = fresh$227();
                    var transformerContext$500 = makeExpanderContext$276(_$114.defaults({ mark: newMark$499 }, context$408));
                    // pull the macro transformer out the environment
                    var transformer$501 = context$408.env.get(resolve$221(head$410)).fn;
                    // apply the transformer
                    var rt$502 = transformer$501([head$410].concat(rest$411), transformerContext$500);
                    if (!Array.isArray(rt$502.result)) {
                        throwError$208('Macro transformer must return a result array, not: ' + rt$502.result);
                    }
                    if (rt$502.result.length > 0) {
                        var adjustedResult$503 = adjustLineContext$267(rt$502.result, head$410);
                        adjustedResult$503[0].token.leadingComments = head$410.token.leadingComments;
                        return step$409(adjustedResult$503[0], adjustedResult$503.slice(1).concat(rt$502.rest));
                    } else {
                        return step$409(Empty$262.create(), rt$502.rest);
                    }
                }    // anon macro definition
                else if (head$410.token.type === parser$115.Token.Identifier && head$410.token.value === 'macro' && rest$411[0] && rest$411[0].token.value === '{}') {
                    return step$409(AnonMacro$253.create(rest$411[0].expose().token.inner), rest$411.slice(1));
                }    // macro definition
                else if (head$410.token.type === parser$115.Token.Identifier && head$410.token.value === 'macro' && rest$411[0] && (rest$411[0].token.type === parser$115.Token.Identifier || rest$411[0].token.type === parser$115.Token.Keyword || rest$411[0].token.type === parser$115.Token.Punctuator) && rest$411[1] && rest$411[1].token.type === parser$115.Token.Delimiter && rest$411[1].token.value === '{}') {
                    return step$409(Macro$252.create(rest$411[0], rest$411[1].expose().token.inner), rest$411.slice(2));
                }    // module definition
                else if (head$410.token.value === 'module' && rest$411[0] && rest$411[0].token.value === '{}') {
                    return step$409(Module$261.create(rest$411[0]), rest$411.slice(1));
                }    // function definition
                else if (head$410.token.type === parser$115.Token.Keyword && head$410.token.value === 'function' && rest$411[0] && rest$411[0].token.type === parser$115.Token.Identifier && rest$411[1] && rest$411[1].token.type === parser$115.Token.Delimiter && rest$411[1].token.value === '()' && rest$411[2] && rest$411[2].token.type === parser$115.Token.Delimiter && rest$411[2].token.value === '{}') {
                    rest$411[1].token.inner = rest$411[1].expose().token.inner;
                    rest$411[2].token.inner = rest$411[2].expose().token.inner;
                    return step$409(NamedFun$249.create(head$410, rest$411[0], rest$411[1], rest$411[2]), rest$411.slice(3));
                }    // anonymous function definition
                else if (head$410.token.type === parser$115.Token.Keyword && head$410.token.value === 'function' && rest$411[0] && rest$411[0].token.type === parser$115.Token.Delimiter && rest$411[0].token.value === '()' && rest$411[1] && rest$411[1].token.type === parser$115.Token.Delimiter && rest$411[1].token.value === '{}') {
                    rest$411[0].token.inner = rest$411[0].expose().token.inner;
                    rest$411[1].token.inner = rest$411[1].expose().token.inner;
                    return step$409(AnonFun$250.create(head$410, rest$411[0], rest$411[1]), rest$411.slice(2));
                }    // catch statement
                else if (head$410.token.type === parser$115.Token.Keyword && head$410.token.value === 'catch' && rest$411[0] && rest$411[0].token.type === parser$115.Token.Delimiter && rest$411[0].token.value === '()' && rest$411[1] && rest$411[1].token.type === parser$115.Token.Delimiter && rest$411[1].token.value === '{}') {
                    rest$411[0].token.inner = rest$411[0].expose().token.inner;
                    rest$411[1].token.inner = rest$411[1].expose().token.inner;
                    return step$409(CatchClause$260.create(head$410, rest$411[0], rest$411[1]), rest$411.slice(2));
                }    // this expression
                else if (head$410.token.type === parser$115.Token.Keyword && head$410.token.value === 'this') {
                    return step$409(ThisExpression$235.create(head$410), rest$411);
                }    // literal
                else if (head$410.token.type === parser$115.Token.NumericLiteral || head$410.token.type === parser$115.Token.StringLiteral || head$410.token.type === parser$115.Token.BooleanLiteral || head$410.token.type === parser$115.Token.RegexLiteral || head$410.token.type === parser$115.Token.NullLiteral) {
                    return step$409(Lit$236.create(head$410), rest$411);
                }    // export
                else if (head$410.token.type === parser$115.Token.Identifier && head$410.token.value === 'export' && rest$411[0] && (rest$411[0].token.type === parser$115.Token.Identifier || rest$411[0].token.type === parser$115.Token.Keyword || rest$411[0].token.type === parser$115.Token.Punctuator)) {
                    return step$409(Export$263.create(rest$411[0]), rest$411.slice(1));
                }    // identifier
                else if (head$410.token.type === parser$115.Token.Identifier) {
                    return step$409(Id$248.create(head$410), rest$411);
                }    // punctuator
                else if (head$410.token.type === parser$115.Token.Punctuator) {
                    return step$409(Punc$246.create(head$410), rest$411);
                } else if (head$410.token.type === parser$115.Token.Keyword && head$410.token.value === 'with') {
                    throwError$208('with is not supported in sweet.js');
                }    // keyword
                else if (head$410.token.type === parser$115.Token.Keyword) {
                    return step$409(Keyword$245.create(head$410), rest$411);
                }    // Delimiter
                else if (head$410.token.type === parser$115.Token.Delimiter) {
                    return step$409(Delimiter$247.create(head$410.expose()), rest$411);
                }    // end of file
                else if (head$410.token.type === parser$115.Token.EOF) {
                    parser$115.assert(rest$411.length === 0, 'nothing should be after an EOF');
                    return step$409(EOF$231.create(head$410), []);
                } else {
                    // todo: are we missing cases?
                    parser$115.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$410,
                rest: rest$411
            };
        }
        return step$409(toks$407[0], toks$407.slice(1));
    }
    function get_expression$269(stx$504, context$505) {
        var res$506 = enforest$268(stx$504, context$505);
        if (!res$506.result.hasPrototype(Expr$233)) {
            return {
                result: null,
                rest: stx$504
            };
        }
        return res$506;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$270(newMark$507, env$508) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$509(match$510) {
            if (match$510.level === 0) {
                // replace the match property with the marked syntax
                match$510.match = _$114.map(match$510.match, function (stx$511) {
                    return stx$511.mark(newMark$507);
                });
            } else {
                _$114.each(match$510.match, function (match$512) {
                    dfs$509(match$512);
                });
            }
        }
        _$114.keys(env$508).forEach(function (key$513) {
            dfs$509(env$508[key$513]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$271(mac$514, context$515) {
        var body$516 = mac$514.body;
        // raw function primitive form
        if (!(body$516[0] && body$516[0].token.type === parser$115.Token.Keyword && body$516[0].token.value === 'function')) {
            throwError$208('Primitive macro form must contain a function for the macro body');
        }
        var stub$517 = parser$115.read('()');
        stub$517[0].token.inner = body$516;
        var expanded$518 = expand$275(stub$517, context$515);
        expanded$518 = expanded$518[0].destruct().concat(expanded$518[1].eof);
        var flattend$519 = flatten$278(expanded$518);
        var bodyCode$520 = codegen$121.generate(parser$115.parse(flattend$519));
        var macroFn$521 = scopedEval$209(bodyCode$520, {
                makeValue: syn$116.makeValue,
                makeRegex: syn$116.makeRegex,
                makeIdent: syn$116.makeIdent,
                makeKeyword: syn$116.makeKeyword,
                makePunc: syn$116.makePunc,
                makeDelim: syn$116.makeDelim,
                unwrapSyntax: syn$116.unwrapSyntax,
                throwSyntaxError: syn$116.throwSyntaxError,
                fresh: fresh$227,
                _: _$114,
                parser: parser$115,
                patternModule: patternModule$119,
                getTemplate: function (id$522) {
                    return context$515.templateMap.get(id$522);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$270,
                mergeMatches: function (newMatch$523, oldMatch$524) {
                    newMatch$523.patternEnv = _$114.extend({}, oldMatch$524.patternEnv, newMatch$523.patternEnv);
                    return newMatch$523;
                }
            });
        return macroFn$521;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$272(stx$525, context$526) {
        parser$115.assert(context$526, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$525.length === 0) {
            return {
                terms: [],
                context: context$526
            };
        }
        parser$115.assert(stx$525[0].token, 'expecting a syntax object');
        var f$527 = enforest$268(stx$525, context$526);
        // head :: TermTree
        var head$528 = f$527.result;
        // rest :: [Syntax]
        var rest$529 = f$527.rest;
        if (head$528.hasPrototype(Macro$252)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$531 = loadMacroDef$271(head$528, context$526);
            addToDefinitionCtx$273([head$528.name], context$526.defscope, false);
            context$526.env.set(resolve$221(head$528.name), { fn: macroDefinition$531 });
            return expandToTermTree$272(rest$529, context$526);
        }
        if (head$528.hasPrototype(LetMacro$251)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$531 = loadMacroDef$271(head$528, context$526);
            var freshName$532 = fresh$227();
            var renamedName$533 = head$528.name.rename(head$528.name, freshName$532);
            rest$529 = _$114.map(rest$529, function (stx$534) {
                return stx$534.rename(head$528.name, freshName$532);
            });
            head$528.name = renamedName$533;
            context$526.env.set(resolve$221(head$528.name), { fn: macroDefinition$531 });
            return expandToTermTree$272(rest$529, context$526);
        }
        if (head$528.hasPrototype(NamedFun$249)) {
            addToDefinitionCtx$273([head$528.name], context$526.defscope, true);
        }
        if (head$528.hasPrototype(Id$248) && head$528.id.token.value === '#quoteSyntax' && rest$529[0] && rest$529[0].token.value === '{}') {
            var tempId$535 = fresh$227();
            context$526.templateMap.set(tempId$535, rest$529[0].token.inner);
            return expandToTermTree$272([
                syn$116.makeIdent('getTemplate', head$528.id),
                syn$116.makeDelim('()', [syn$116.makeValue(tempId$535, head$528.id)], head$528.id)
            ].concat(rest$529.slice(1)), context$526);
        }
        if (head$528.hasPrototype(VariableStatement$259)) {
            addToDefinitionCtx$273(_$114.map(head$528.decls, function (decl$536) {
                return decl$536.ident;
            }), context$526.defscope, true);
        }
        if (head$528.hasPrototype(Block$238) && head$528.body.hasPrototype(Delimiter$247)) {
            head$528.body.delim.token.inner.forEach(function (term$537) {
                if (term$537.hasPrototype(VariableStatement$259)) {
                    addToDefinitionCtx$273(_$114.map(term$537.decls, function (decl$538) {
                        return decl$538.ident;
                    }), context$526.defscope, true);
                }
            });
        }
        if (head$528.hasPrototype(Delimiter$247)) {
            head$528.delim.token.inner.forEach(function (term$539) {
                if (term$539.hasPrototype(VariableStatement$259)) {
                    addToDefinitionCtx$273(_$114.map(term$539.decls, function (decl$540) {
                        return decl$540.ident;
                    }), context$526.defscope, true);
                }
            });
        }
        var trees$530 = expandToTermTree$272(rest$529, context$526);
        return {
            terms: [head$528].concat(trees$530.terms),
            context: trees$530.context
        };
    }
    function addToDefinitionCtx$273(idents$541, defscope$542, skipRep$543) {
        parser$115.assert(idents$541 && idents$541.length > 0, 'expecting some variable identifiers');
        skipRep$543 = skipRep$543 || false;
        _$114.each(idents$541, function (id$544) {
            var skip$545 = false;
            if (skipRep$543) {
                var declRepeat$546 = _$114.find(defscope$542, function (def$547) {
                        return def$547.id.token.value === id$544.token.value && arraysEqual$222(marksof$220(def$547.id.context), marksof$220(id$544.context));
                    });
                skip$545 = typeof declRepeat$546 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$545) {
                var name$548 = fresh$227();
                defscope$542.push({
                    id: id$544,
                    name: name$548
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$274(term$549, context$550) {
        parser$115.assert(context$550 && context$550.env, 'environment map is required');
        if (term$549.hasPrototype(ArrayLiteral$239)) {
            term$549.array.delim.token.inner = expand$275(term$549.array.delim.expose().token.inner, context$550);
            return term$549;
        } else if (term$549.hasPrototype(Block$238)) {
            term$549.body.delim.token.inner = expand$275(term$549.body.delim.expose().token.inner, context$550);
            return term$549;
        } else if (term$549.hasPrototype(ParenExpression$240)) {
            term$549.expr.delim.token.inner = expand$275(term$549.expr.delim.expose().token.inner, context$550);
            return term$549;
        } else if (term$549.hasPrototype(Call$255)) {
            term$549.fun = expandTermTreeToFinal$274(term$549.fun, context$550);
            term$549.args = _$114.map(term$549.args, function (arg$551) {
                return expandTermTreeToFinal$274(arg$551, context$550);
            });
            return term$549;
        } else if (term$549.hasPrototype(UnaryOp$241)) {
            term$549.expr = expandTermTreeToFinal$274(term$549.expr, context$550);
            return term$549;
        } else if (term$549.hasPrototype(BinOp$243)) {
            term$549.left = expandTermTreeToFinal$274(term$549.left, context$550);
            term$549.right = expandTermTreeToFinal$274(term$549.right, context$550);
            return term$549;
        } else if (term$549.hasPrototype(ObjGet$257)) {
            term$549.right.delim.token.inner = expand$275(term$549.right.delim.expose().token.inner, context$550);
            return term$549;
        } else if (term$549.hasPrototype(ObjDotGet$256)) {
            term$549.left = expandTermTreeToFinal$274(term$549.left, context$550);
            term$549.right = expandTermTreeToFinal$274(term$549.right, context$550);
            return term$549;
        } else if (term$549.hasPrototype(VariableDeclaration$258)) {
            if (term$549.init) {
                term$549.init = expandTermTreeToFinal$274(term$549.init, context$550);
            }
            return term$549;
        } else if (term$549.hasPrototype(VariableStatement$259)) {
            term$549.decls = _$114.map(term$549.decls, function (decl$552) {
                return expandTermTreeToFinal$274(decl$552, context$550);
            });
            return term$549;
        } else if (term$549.hasPrototype(Delimiter$247)) {
            // expand inside the delimiter and then continue on
            term$549.delim.token.inner = expand$275(term$549.delim.expose().token.inner, context$550);
            return term$549;
        } else if (term$549.hasPrototype(NamedFun$249) || term$549.hasPrototype(AnonFun$250) || term$549.hasPrototype(CatchClause$260) || term$549.hasPrototype(Module$261)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$553 = [];
            var bodyContext$554 = makeExpanderContext$276(_$114.defaults({ defscope: newDef$553 }, context$550));
            if (term$549.params) {
                var params$563 = term$549.params.expose();
            } else {
                var params$563 = syn$116.makeDelim('()', [], null);
            }
            var bodies$555 = term$549.body.addDefCtx(newDef$553);
            var paramNames$556 = _$114.map(getParamIdentifiers$229(params$563), function (param$564) {
                    var freshName$565 = fresh$227();
                    return {
                        freshName: freshName$565,
                        originalParam: param$564,
                        renamedParam: param$564.rename(param$564, freshName$565)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$557 = _$114.reduce(paramNames$556, function (accBody$566, p$567) {
                    return accBody$566.rename(p$567.originalParam, p$567.freshName);
                }, bodies$555);
            renamedBody$557 = renamedBody$557.expose();
            var expandedResult$558 = expandToTermTree$272(renamedBody$557.token.inner, bodyContext$554);
            var bodyTerms$559 = expandedResult$558.terms;
            var renamedParams$560 = _$114.map(paramNames$556, function (p$568) {
                    return p$568.renamedParam;
                });
            var flatArgs$561 = syn$116.makeDelim('()', joinSyntax$218(renamedParams$560, ','), term$549.params);
            var expandedArgs$562 = expand$275([flatArgs$561], bodyContext$554);
            parser$115.assert(expandedArgs$562.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$549.params) {
                term$549.params = expandedArgs$562[0];
            }
            bodyTerms$559 = _$114.map(bodyTerms$559, function (bodyTerm$569) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$570 = bodyTerm$569.addDefCtx(newDef$553);
                // finish expansion
                return expandTermTreeToFinal$274(termWithCtx$570, expandedResult$558.context);
            });
            if (term$549.hasPrototype(Module$261)) {
                bodyTerms$559 = _$114.filter(bodyTerms$559, function (bodyTerm$571) {
                    if (bodyTerm$571.hasPrototype(Export$263)) {
                        term$549.exports.push(bodyTerm$571);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$557.token.inner = bodyTerms$559;
            term$549.body = renamedBody$557;
            // and continue expand the rest
            return term$549;
        }
        // the term is fine as is
        return term$549;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$275(stx$572, context$573) {
        parser$115.assert(context$573, 'must provide an expander context');
        var trees$574 = expandToTermTree$272(stx$572, context$573);
        return _$114.map(trees$574.terms, function (term$575) {
            return expandTermTreeToFinal$274(term$575, trees$574.context);
        });
    }
    function makeExpanderContext$276(o$576) {
        o$576 = o$576 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$576.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$576.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$576.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$576.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$277(stx$577, builtinSource$578) {
        var builtInEnv$579 = new Map();
        var env$580 = new Map();
        var params$581 = [];
        var context$582, builtInContext$583 = makeExpanderContext$276({ env: builtInEnv$579 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$578) {
            var builtinRead$586 = parser$115.read(builtinSource$578);
            builtinRead$586 = [
                syn$116.makeIdent('module', null),
                syn$116.makeDelim('{}', builtinRead$586, null)
            ];
            var builtinRes$587 = expand$275(builtinRead$586, builtInContext$583);
            params$581 = _$114.map(builtinRes$587[0].exports, function (term$588) {
                return {
                    oldExport: term$588.name,
                    newParam: syn$116.makeIdent(term$588.name.token.value, null)
                };
            });
        }
        var modBody$584 = syn$116.makeDelim('{}', stx$577, null);
        modBody$584 = _$114.reduce(params$581, function (acc$589, param$590) {
            var newName$591 = fresh$227();
            env$580.set(resolve$221(param$590.newParam.rename(param$590.newParam, newName$591)), builtInEnv$579.get(resolve$221(param$590.oldExport)));
            return acc$589.rename(param$590.newParam, newName$591);
        }, modBody$584);
        context$582 = makeExpanderContext$276({ env: env$580 });
        var res$585 = expand$275([
                syn$116.makeIdent('module', null),
                modBody$584
            ], context$582);
        res$585 = res$585[0].destruct();
        return flatten$278(res$585[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$278(stx$592) {
        return _$114.reduce(stx$592, function (acc$593, stx$594) {
            if (stx$594.token.type === parser$115.Token.Delimiter) {
                var exposed$595 = stx$594.expose();
                var openParen$596 = syntaxFromToken$217({
                        type: parser$115.Token.Punctuator,
                        value: stx$594.token.value[0],
                        range: stx$594.token.startRange,
                        lineNumber: stx$594.token.startLineNumber,
                        sm_lineNumber: stx$594.token.sm_startLineNumber ? stx$594.token.sm_startLineNumber : stx$594.token.startLineNumber,
                        lineStart: stx$594.token.startLineStart,
                        sm_lineStart: stx$594.token.sm_startLineStart ? stx$594.token.sm_startLineStart : stx$594.token.startLineStart
                    }, exposed$595);
                var closeParen$597 = syntaxFromToken$217({
                        type: parser$115.Token.Punctuator,
                        value: stx$594.token.value[1],
                        range: stx$594.token.endRange,
                        lineNumber: stx$594.token.endLineNumber,
                        sm_lineNumber: stx$594.token.sm_endLineNumber ? stx$594.token.sm_endLineNumber : stx$594.token.endLineNumber,
                        lineStart: stx$594.token.endLineStart,
                        sm_lineStart: stx$594.token.sm_endLineStart ? stx$594.token.sm_endLineStart : stx$594.token.endLineStart
                    }, exposed$595);
                if (stx$594.token.leadingComments) {
                    openParen$596.token.leadingComments = stx$594.token.leadingComments;
                }
                if (stx$594.token.trailingComments) {
                    openParen$596.token.trailingComments = stx$594.token.trailingComments;
                }
                return acc$593.concat(openParen$596).concat(flatten$278(exposed$595.token.inner)).concat(closeParen$597);
            }
            stx$594.token.sm_lineNumber = stx$594.token.sm_lineNumber ? stx$594.token.sm_lineNumber : stx$594.token.lineNumber;
            stx$594.token.sm_lineStart = stx$594.token.sm_lineStart ? stx$594.token.sm_lineStart : stx$594.token.lineStart;
            return acc$593.concat(stx$594);
        }, []);
    }
    exports$113.enforest = enforest$268;
    exports$113.expand = expandTopLevel$277;
    exports$113.resolve = resolve$221;
    exports$113.get_expression = get_expression$269;
    exports$113.makeExpanderContext = makeExpanderContext$276;
    exports$113.Expr = Expr$233;
    exports$113.VariableStatement = VariableStatement$259;
    exports$113.tokensToSyntax = syn$116.tokensToSyntax;
    exports$113.syntaxToTokens = syn$116.syntaxToTokens;
}));