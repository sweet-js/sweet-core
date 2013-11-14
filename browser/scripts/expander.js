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
            return resolveCtx$225(originalName$305, ctx$306.context, unionEl$224(stop_spine$307, ctx$306.def), stop_branch$308);
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
            }
        };
    var EOF$231 = TermTree$230.extend({
            properties: ['eof'],
            construct: function (e$321) {
                this.eof = e$321;
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
            construct: function (that$322) {
                this.this = that$322;
            }
        });
    var Lit$236 = PrimaryExpression$234.extend({
            properties: ['lit'],
            construct: function (l$323) {
                this.lit = l$323;
            }
        });
    exports$113._test.PropertyAssignment = PropertyAssignment$237;
    var PropertyAssignment$237 = TermTree$230.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$324, assignment$325) {
                this.propName = propName$324;
                this.assignment = assignment$325;
            }
        });
    var Block$238 = PrimaryExpression$234.extend({
            properties: ['body'],
            construct: function (body$326) {
                this.body = body$326;
            }
        });
    var ArrayLiteral$239 = PrimaryExpression$234.extend({
            properties: ['array'],
            construct: function (ar$327) {
                this.array = ar$327;
            }
        });
    var ParenExpression$240 = PrimaryExpression$234.extend({
            properties: ['expr'],
            construct: function (expr$328) {
                this.expr = expr$328;
            }
        });
    var UnaryOp$241 = Expr$233.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$329, expr$330) {
                this.op = op$329;
                this.expr = expr$330;
            }
        });
    var PostfixOp$242 = Expr$233.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$331, op$332) {
                this.expr = expr$331;
                this.op = op$332;
            }
        });
    var BinOp$243 = Expr$233.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$333, left$334, right$335) {
                this.op = op$333;
                this.left = left$334;
                this.right = right$335;
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
            construct: function (cond$336, question$337, tru$338, colon$339, fls$340) {
                this.cond = cond$336;
                this.question = question$337;
                this.tru = tru$338;
                this.colon = colon$339;
                this.fls = fls$340;
            }
        });
    var Keyword$245 = TermTree$230.extend({
            properties: ['keyword'],
            construct: function (k$341) {
                this.keyword = k$341;
            }
        });
    var Punc$246 = TermTree$230.extend({
            properties: ['punc'],
            construct: function (p$342) {
                this.punc = p$342;
            }
        });
    var Delimiter$247 = TermTree$230.extend({
            properties: ['delim'],
            construct: function (d$343) {
                this.delim = d$343;
            }
        });
    var Id$248 = PrimaryExpression$234.extend({
            properties: ['id'],
            construct: function (id$344) {
                this.id = id$344;
            }
        });
    var NamedFun$249 = Expr$233.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$345, name$346, params$347, body$348) {
                this.keyword = keyword$345;
                this.name = name$346;
                this.params = params$347;
                this.body = body$348;
            }
        });
    var AnonFun$250 = Expr$233.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$349, params$350, body$351) {
                this.keyword = keyword$349;
                this.params = params$350;
                this.body = body$351;
            }
        });
    var LetMacro$251 = TermTree$230.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$352, body$353) {
                this.name = name$352;
                this.body = body$353;
            }
        });
    var Macro$252 = TermTree$230.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$354, body$355) {
                this.name = name$354;
                this.body = body$355;
            }
        });
    var AnonMacro$253 = TermTree$230.extend({
            properties: ['body'],
            construct: function (body$356) {
                this.body = body$356;
            }
        });
    var Const$254 = Expr$233.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$357, call$358) {
                this.newterm = newterm$357;
                this.call = call$358;
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
                var that$359 = this;
                this.delim = syntaxFromToken$217(_$114.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$114.reduce(this.args, function (acc$360, term$361) {
                    parser$115.assert(term$361 && term$361.hasPrototype(TermTree$230), 'expecting term trees in destruct of Call');
                    var dst$362 = acc$360.concat(term$361.destruct());
                    // add all commas except for the last one
                    if (that$359.commas.length > 0) {
                        dst$362 = dst$362.concat(that$359.commas.shift());
                    }
                    return dst$362;
                }, []);
                return this.fun.destruct().concat(Delimiter$247.create(this.delim).destruct());
            },
            construct: function (funn$363, args$364, delim$365, commas$366) {
                parser$115.assert(Array.isArray(args$364), 'requires an array of arguments terms');
                this.fun = funn$363;
                this.args = args$364;
                this.delim = delim$365;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$366;
            }
        });
    var ObjDotGet$256 = Expr$233.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$367, dot$368, right$369) {
                this.left = left$367;
                this.dot = dot$368;
                this.right = right$369;
            }
        });
    var ObjGet$257 = Expr$233.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$370, right$371) {
                this.left = left$370;
                this.right = right$371;
            }
        });
    var VariableDeclaration$258 = TermTree$230.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$372, eqstx$373, init$374, comma$375) {
                this.ident = ident$372;
                this.eqstx = eqstx$373;
                this.init = init$374;
                this.comma = comma$375;
            }
        });
    var VariableStatement$259 = Statement$232.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$114.reduce(this.decls, function (acc$376, decl$377) {
                    return acc$376.concat(decl$377.destruct());
                }, []));
            },
            construct: function (varkw$378, decls$379) {
                parser$115.assert(Array.isArray(decls$379), 'decls must be an array');
                this.varkw = varkw$378;
                this.decls = decls$379;
            }
        });
    var CatchClause$260 = TermTree$230.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$380, params$381, body$382) {
                this.catchkw = catchkw$380;
                this.params = params$381;
                this.body = body$382;
            }
        });
    var Module$261 = TermTree$230.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$383) {
                this.body = body$383;
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
            construct: function (name$384) {
                this.name = name$384;
            }
        });
    function stxIsUnaryOp$264(stx$385) {
        var staticOperators$386 = [
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
        return _$114.contains(staticOperators$386, stx$385.token.value);
    }
    function stxIsBinOp$265(stx$387) {
        var staticOperators$388 = [
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
        return _$114.contains(staticOperators$388, stx$387.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$266(stx$389, context$390) {
        var decls$391 = [];
        var res$392 = enforest$268(stx$389, context$390);
        var result$393 = res$392.result;
        var rest$394 = res$392.rest;
        if (rest$394[0]) {
            var nextRes$395 = enforest$268(rest$394, context$390);
            // x = ...
            if (nextRes$395.result.hasPrototype(Punc$246) && nextRes$395.result.punc.token.value === '=') {
                var initializerRes$396 = enforest$268(nextRes$395.rest, context$390);
                if (initializerRes$396.rest[0]) {
                    var restRes$397 = enforest$268(initializerRes$396.rest, context$390);
                    // x = y + z, ...
                    if (restRes$397.result.hasPrototype(Punc$246) && restRes$397.result.punc.token.value === ',') {
                        decls$391.push(VariableDeclaration$258.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result, restRes$397.result.punc));
                        var subRes$398 = enforestVarStatement$266(restRes$397.rest, context$390);
                        decls$391 = decls$391.concat(subRes$398.result);
                        rest$394 = subRes$398.rest;
                    }    // x = y ...
                    else {
                        decls$391.push(VariableDeclaration$258.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result));
                        rest$394 = initializerRes$396.rest;
                    }
                }    // x = y EOF
                else {
                    decls$391.push(VariableDeclaration$258.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result));
                }
            }    // x ,...;
            else if (nextRes$395.result.hasPrototype(Punc$246) && nextRes$395.result.punc.token.value === ',') {
                decls$391.push(VariableDeclaration$258.create(result$393.id, null, null, nextRes$395.result.punc));
                var subRes$398 = enforestVarStatement$266(nextRes$395.rest, context$390);
                decls$391 = decls$391.concat(subRes$398.result);
                rest$394 = subRes$398.rest;
            } else {
                if (result$393.hasPrototype(Id$248)) {
                    decls$391.push(VariableDeclaration$258.create(result$393.id));
                } else {
                    throwError$208('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$393.hasPrototype(Id$248)) {
                decls$391.push(VariableDeclaration$258.create(result$393.id));
            } else if (result$393.hasPrototype(BinOp$243) && result$393.op.token.value === 'in') {
                decls$391.push(VariableDeclaration$258.create(result$393.left.id, result$393.op, result$393.right));
            } else {
                throwError$208('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$391,
            rest: rest$394
        };
    }
    function adjustLineContext$267(stx$399, original$400) {
        var last$401 = stx$399[0] && typeof stx$399[0].token.range == 'undefined' ? original$400 : stx$399[0];
        return _$114.map(stx$399, function (stx$402) {
            if (typeof stx$402.token.range == 'undefined') {
                stx$402.token.range = last$401.token.range;
            }
            if (stx$402.token.type === parser$115.Token.Delimiter) {
                stx$402.token.sm_startLineNumber = original$400.token.lineNumber;
                stx$402.token.sm_endLineNumber = original$400.token.lineNumber;
                stx$402.token.sm_startLineStart = original$400.token.lineStart;
                stx$402.token.sm_endLineStart = original$400.token.lineStart;
                if (stx$402.token.inner.length > 0) {
                    stx$402.token.inner = adjustLineContext$267(stx$402.token.inner, original$400);
                }
                last$401 = stx$402;
                return stx$402;
            }
            stx$402.token.sm_lineNumber = original$400.token.lineNumber;
            stx$402.token.sm_lineStart = original$400.token.lineStart;
            last$401 = stx$402;
            return stx$402;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$268(toks$403, context$404) {
        parser$115.assert(toks$403.length > 0, 'enforest assumes there are tokens to work with');
        function step$405(head$406, rest$407) {
            var innerTokens$408;
            parser$115.assert(Array.isArray(rest$407), 'result must at least be an empty array');
            if (head$406.hasPrototype(TermTree$230)) {
                // function call
                var emp$413 = head$406.emp;
                var emp$413 = head$406.emp;
                var keyword$418 = head$406.keyword;
                var delim$421 = head$406.delim;
                var emp$413 = head$406.emp;
                var punc$426 = head$406.punc;
                var keyword$418 = head$406.keyword;
                var emp$413 = head$406.emp;
                var emp$413 = head$406.emp;
                var emp$413 = head$406.emp;
                var delim$421 = head$406.delim;
                var delim$421 = head$406.delim;
                var keyword$418 = head$406.keyword;
                var keyword$418 = head$406.keyword;
                if (head$406.hasPrototype(Expr$233) && (rest$407[0] && rest$407[0].token.type === parser$115.Token.Delimiter && rest$407[0].token.value === '()')) {
                    var argRes$475, enforestedArgs$476 = [], commas$477 = [];
                    rest$407[0].expose();
                    innerTokens$408 = rest$407[0].token.inner;
                    while (innerTokens$408.length > 0) {
                        argRes$475 = enforest$268(innerTokens$408, context$404);
                        enforestedArgs$476.push(argRes$475.result);
                        innerTokens$408 = argRes$475.rest;
                        if (innerTokens$408[0] && innerTokens$408[0].token.value === ',') {
                            // record the comma for later
                            commas$477.push(innerTokens$408[0]);
                            // but dump it for the next loop turn
                            innerTokens$408 = innerTokens$408.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$478 = _$114.all(enforestedArgs$476, function (argTerm$479) {
                            return argTerm$479.hasPrototype(Expr$233);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$408.length === 0 && argsAreExprs$478) {
                        return step$405(Call$255.create(head$406, enforestedArgs$476, rest$407[0], commas$477), rest$407.slice(1));
                    }
                } else if (head$406.hasPrototype(Expr$233) && (rest$407[0] && rest$407[0].token.value === '?')) {
                    var question$480 = rest$407[0];
                    var condRes$481 = enforest$268(rest$407.slice(1), context$404);
                    var truExpr$482 = condRes$481.result;
                    var right$483 = condRes$481.rest;
                    if (truExpr$482.hasPrototype(Expr$233) && right$483[0] && right$483[0].token.value === ':') {
                        var colon$484 = right$483[0];
                        var flsRes$485 = enforest$268(right$483.slice(1), context$404);
                        var flsExpr$486 = flsRes$485.result;
                        if (flsExpr$486.hasPrototype(Expr$233)) {
                            return step$405(ConditionalExpression$244.create(head$406, question$480, truExpr$482, colon$484, flsExpr$486), flsRes$485.rest);
                        }
                    }
                } else if (head$406.hasPrototype(Keyword$245) && (keyword$418.token.value === 'new' && rest$407[0])) {
                    var newCallRes$487 = enforest$268(rest$407, context$404);
                    if (newCallRes$487.result.hasPrototype(Call$255)) {
                        return step$405(Const$254.create(head$406, newCallRes$487.result), newCallRes$487.rest);
                    }
                } else if (head$406.hasPrototype(Delimiter$247) && delim$421.token.value === '()') {
                    innerTokens$408 = delim$421.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$408.length === 0) {
                        return step$405(ParenExpression$240.create(head$406), rest$407);
                    } else {
                        var innerTerm$488 = get_expression$269(innerTokens$408, context$404);
                        if (innerTerm$488.result && innerTerm$488.result.hasPrototype(Expr$233)) {
                            return step$405(ParenExpression$240.create(head$406), rest$407);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$406.hasPrototype(TermTree$230) && (rest$407[0] && rest$407[1] && stxIsBinOp$265(rest$407[0]))) {
                    var op$489 = rest$407[0];
                    var left$490 = head$406;
                    var bopRes$491 = enforest$268(rest$407.slice(1), context$404);
                    var right$483 = bopRes$491.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$483.hasPrototype(Expr$233)) {
                        return step$405(BinOp$243.create(op$489, left$490, right$483), bopRes$491.rest);
                    }
                } else if (head$406.hasPrototype(Punc$246) && stxIsUnaryOp$264(punc$426)) {
                    var unopRes$492 = enforest$268(rest$407, context$404);
                    if (unopRes$492.result.hasPrototype(Expr$233)) {
                        return step$405(UnaryOp$241.create(punc$426, unopRes$492.result), unopRes$492.rest);
                    }
                } else if (head$406.hasPrototype(Keyword$245) && stxIsUnaryOp$264(keyword$418)) {
                    var unopRes$492 = enforest$268(rest$407, context$404);
                    if (unopRes$492.result.hasPrototype(Expr$233)) {
                        return step$405(UnaryOp$241.create(keyword$418, unopRes$492.result), unopRes$492.rest);
                    }
                } else if (head$406.hasPrototype(Expr$233) && (rest$407[0] && (rest$407[0].token.value === '++' || rest$407[0].token.value === '--'))) {
                    return step$405(PostfixOp$242.create(head$406, rest$407[0]), rest$407.slice(1));
                } else if (head$406.hasPrototype(Expr$233) && (rest$407[0] && rest$407[0].token.value === '[]')) {
                    return step$405(ObjGet$257.create(head$406, Delimiter$247.create(rest$407[0].expose())), rest$407.slice(1));
                } else if (head$406.hasPrototype(Expr$233) && (rest$407[0] && rest$407[0].token.value === '.' && rest$407[1] && rest$407[1].token.type === parser$115.Token.Identifier)) {
                    return step$405(ObjDotGet$256.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                } else if (head$406.hasPrototype(Delimiter$247) && delim$421.token.value === '[]') {
                    return step$405(ArrayLiteral$239.create(head$406), rest$407);
                } else if (head$406.hasPrototype(Delimiter$247) && head$406.delim.token.value === '{}') {
                    return step$405(Block$238.create(head$406), rest$407);
                } else if (head$406.hasPrototype(Keyword$245) && (keyword$418.token.value === 'let' && (rest$407[0] && rest$407[0].token.type === parser$115.Token.Identifier || rest$407[0] && rest$407[0].token.type === parser$115.Token.Keyword) && rest$407[1] && rest$407[1].token.value === '=' && rest$407[2] && rest$407[2].token.value === 'macro')) {
                    var mac$493 = enforest$268(rest$407.slice(2), context$404);
                    if (!mac$493.result.hasPrototype(AnonMacro$253)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$493.result);
                    }
                    return step$405(LetMacro$251.create(rest$407[0], mac$493.result.body), mac$493.rest);
                } else if (head$406.hasPrototype(Keyword$245) && (keyword$418.token.value === 'var' && rest$407[0])) {
                    var vsRes$494 = enforestVarStatement$266(rest$407, context$404);
                    if (vsRes$494) {
                        return step$405(VariableStatement$259.create(head$406, vsRes$494.result), vsRes$494.rest);
                    }
                }
            } else {
                parser$115.assert(head$406 && head$406.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$406.token.type === parser$115.Token.Identifier || head$406.token.type === parser$115.Token.Keyword || head$406.token.type === parser$115.Token.Punctuator) && context$404.env.has(resolve$221(head$406))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$495 = fresh$227();
                    var transformerContext$496 = makeExpanderContext$276(_$114.defaults({ mark: newMark$495 }, context$404));
                    // pull the macro transformer out the environment
                    var transformer$497 = context$404.env.get(resolve$221(head$406)).fn;
                    // apply the transformer
                    var rt$498 = transformer$497([head$406].concat(rest$407), transformerContext$496);
                    if (!Array.isArray(rt$498.result)) {
                        throwError$208('Macro transformer must return a result array, not: ' + rt$498.result);
                    }
                    if (rt$498.result.length > 0) {
                        var adjustedResult$499 = adjustLineContext$267(rt$498.result, head$406);
                        adjustedResult$499[0].token.leadingComments = head$406.token.leadingComments;
                        return step$405(adjustedResult$499[0], adjustedResult$499.slice(1).concat(rt$498.rest));
                    } else {
                        return step$405(Empty$262.create(), rt$498.rest);
                    }
                }    // anon macro definition
                else if (head$406.token.type === parser$115.Token.Identifier && head$406.token.value === 'macro' && rest$407[0] && rest$407[0].token.value === '{}') {
                    return step$405(AnonMacro$253.create(rest$407[0].expose().token.inner), rest$407.slice(1));
                }    // macro definition
                else if (head$406.token.type === parser$115.Token.Identifier && head$406.token.value === 'macro' && rest$407[0] && (rest$407[0].token.type === parser$115.Token.Identifier || rest$407[0].token.type === parser$115.Token.Keyword || rest$407[0].token.type === parser$115.Token.Punctuator) && rest$407[1] && rest$407[1].token.type === parser$115.Token.Delimiter && rest$407[1].token.value === '{}') {
                    return step$405(Macro$252.create(rest$407[0], rest$407[1].expose().token.inner), rest$407.slice(2));
                }    // module definition
                else if (head$406.token.value === 'module' && rest$407[0] && rest$407[0].token.value === '{}') {
                    return step$405(Module$261.create(rest$407[0]), rest$407.slice(1));
                }    // function definition
                else if (head$406.token.type === parser$115.Token.Keyword && head$406.token.value === 'function' && rest$407[0] && rest$407[0].token.type === parser$115.Token.Identifier && rest$407[1] && rest$407[1].token.type === parser$115.Token.Delimiter && rest$407[1].token.value === '()' && rest$407[2] && rest$407[2].token.type === parser$115.Token.Delimiter && rest$407[2].token.value === '{}') {
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    rest$407[2].token.inner = rest$407[2].expose().token.inner;
                    return step$405(NamedFun$249.create(head$406, rest$407[0], rest$407[1], rest$407[2]), rest$407.slice(3));
                }    // anonymous function definition
                else if (head$406.token.type === parser$115.Token.Keyword && head$406.token.value === 'function' && rest$407[0] && rest$407[0].token.type === parser$115.Token.Delimiter && rest$407[0].token.value === '()' && rest$407[1] && rest$407[1].token.type === parser$115.Token.Delimiter && rest$407[1].token.value === '{}') {
                    rest$407[0].token.inner = rest$407[0].expose().token.inner;
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    return step$405(AnonFun$250.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                }    // catch statement
                else if (head$406.token.type === parser$115.Token.Keyword && head$406.token.value === 'catch' && rest$407[0] && rest$407[0].token.type === parser$115.Token.Delimiter && rest$407[0].token.value === '()' && rest$407[1] && rest$407[1].token.type === parser$115.Token.Delimiter && rest$407[1].token.value === '{}') {
                    rest$407[0].token.inner = rest$407[0].expose().token.inner;
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    return step$405(CatchClause$260.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                }    // this expression
                else if (head$406.token.type === parser$115.Token.Keyword && head$406.token.value === 'this') {
                    return step$405(ThisExpression$235.create(head$406), rest$407);
                }    // literal
                else if (head$406.token.type === parser$115.Token.NumericLiteral || head$406.token.type === parser$115.Token.StringLiteral || head$406.token.type === parser$115.Token.BooleanLiteral || head$406.token.type === parser$115.Token.RegexLiteral || head$406.token.type === parser$115.Token.NullLiteral) {
                    return step$405(Lit$236.create(head$406), rest$407);
                }    // export
                else if (head$406.token.type === parser$115.Token.Identifier && head$406.token.value === 'export' && rest$407[0] && (rest$407[0].token.type === parser$115.Token.Identifier || rest$407[0].token.type === parser$115.Token.Keyword || rest$407[0].token.type === parser$115.Token.Punctuator)) {
                    return step$405(Export$263.create(rest$407[0]), rest$407.slice(1));
                }    // identifier
                else if (head$406.token.type === parser$115.Token.Identifier) {
                    return step$405(Id$248.create(head$406), rest$407);
                }    // punctuator
                else if (head$406.token.type === parser$115.Token.Punctuator) {
                    return step$405(Punc$246.create(head$406), rest$407);
                } else if (head$406.token.type === parser$115.Token.Keyword && head$406.token.value === 'with') {
                    throwError$208('with is not supported in sweet.js');
                }    // keyword
                else if (head$406.token.type === parser$115.Token.Keyword) {
                    return step$405(Keyword$245.create(head$406), rest$407);
                }    // Delimiter
                else if (head$406.token.type === parser$115.Token.Delimiter) {
                    return step$405(Delimiter$247.create(head$406.expose()), rest$407);
                }    // end of file
                else if (head$406.token.type === parser$115.Token.EOF) {
                    parser$115.assert(rest$407.length === 0, 'nothing should be after an EOF');
                    return step$405(EOF$231.create(head$406), []);
                } else {
                    // todo: are we missing cases?
                    parser$115.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$406,
                rest: rest$407
            };
        }
        return step$405(toks$403[0], toks$403.slice(1));
    }
    function get_expression$269(stx$500, context$501) {
        var res$502 = enforest$268(stx$500, context$501);
        if (!res$502.result.hasPrototype(Expr$233)) {
            return {
                result: null,
                rest: stx$500
            };
        }
        return res$502;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$270(newMark$503, env$504) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$505(match$506) {
            if (match$506.level === 0) {
                // replace the match property with the marked syntax
                match$506.match = _$114.map(match$506.match, function (stx$507) {
                    return stx$507.mark(newMark$503);
                });
            } else {
                _$114.each(match$506.match, function (match$508) {
                    dfs$505(match$508);
                });
            }
        }
        _$114.keys(env$504).forEach(function (key$509) {
            dfs$505(env$504[key$509]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$271(mac$510, context$511) {
        var body$512 = mac$510.body;
        // raw function primitive form
        if (!(body$512[0] && body$512[0].token.type === parser$115.Token.Keyword && body$512[0].token.value === 'function')) {
            throwError$208('Primitive macro form must contain a function for the macro body');
        }
        var stub$513 = parser$115.read('()');
        stub$513[0].token.inner = body$512;
        var expanded$514 = expand$275(stub$513, context$511);
        expanded$514 = expanded$514[0].destruct().concat(expanded$514[1].eof);
        var flattend$515 = flatten$278(expanded$514);
        var bodyCode$516 = codegen$121.generate(parser$115.parse(flattend$515));
        var macroFn$517 = scopedEval$209(bodyCode$516, {
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
                getTemplate: function (id$518) {
                    return context$511.templateMap.get(id$518);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$270,
                mergeMatches: function (newMatch$519, oldMatch$520) {
                    newMatch$519.patternEnv = _$114.extend({}, oldMatch$520.patternEnv, newMatch$519.patternEnv);
                    return newMatch$519;
                }
            });
        return macroFn$517;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$272(stx$521, context$522) {
        parser$115.assert(context$522, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$521.length === 0) {
            return {
                terms: [],
                context: context$522
            };
        }
        parser$115.assert(stx$521[0].token, 'expecting a syntax object');
        var f$523 = enforest$268(stx$521, context$522);
        // head :: TermTree
        var head$524 = f$523.result;
        // rest :: [Syntax]
        var rest$525 = f$523.rest;
        if (head$524.hasPrototype(Macro$252)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$527 = loadMacroDef$271(head$524, context$522);
            addToDefinitionCtx$273([head$524.name], context$522.defscope, false);
            context$522.env.set(resolve$221(head$524.name), { fn: macroDefinition$527 });
            return expandToTermTree$272(rest$525, context$522);
        }
        if (head$524.hasPrototype(LetMacro$251)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$527 = loadMacroDef$271(head$524, context$522);
            var freshName$528 = fresh$227();
            var renamedName$529 = head$524.name.rename(head$524.name, freshName$528);
            rest$525 = _$114.map(rest$525, function (stx$530) {
                return stx$530.rename(head$524.name, freshName$528);
            });
            head$524.name = renamedName$529;
            context$522.env.set(resolve$221(head$524.name), { fn: macroDefinition$527 });
            return expandToTermTree$272(rest$525, context$522);
        }
        if (head$524.hasPrototype(NamedFun$249)) {
            addToDefinitionCtx$273([head$524.name], context$522.defscope, true);
        }
        if (head$524.hasPrototype(Id$248) && head$524.id.token.value === '#quoteSyntax' && rest$525[0] && rest$525[0].token.value === '{}') {
            var tempId$531 = fresh$227();
            context$522.templateMap.set(tempId$531, rest$525[0].token.inner);
            return expandToTermTree$272([
                syn$116.makeIdent('getTemplate', head$524.id),
                syn$116.makeDelim('()', [syn$116.makeValue(tempId$531, head$524.id)], head$524.id)
            ].concat(rest$525.slice(1)), context$522);
        }
        if (head$524.hasPrototype(VariableStatement$259)) {
            addToDefinitionCtx$273(_$114.map(head$524.decls, function (decl$532) {
                return decl$532.ident;
            }), context$522.defscope, true);
        }
        if (head$524.hasPrototype(Block$238) && head$524.body.hasPrototype(Delimiter$247)) {
            head$524.body.delim.token.inner.forEach(function (term$533) {
                if (term$533.hasPrototype(VariableStatement$259)) {
                    addToDefinitionCtx$273(_$114.map(term$533.decls, function (decl$534) {
                        return decl$534.ident;
                    }), context$522.defscope, true);
                }
            });
        }
        if (head$524.hasPrototype(Delimiter$247)) {
            head$524.delim.token.inner.forEach(function (term$535) {
                if (term$535.hasPrototype(VariableStatement$259)) {
                    addToDefinitionCtx$273(_$114.map(term$535.decls, function (decl$536) {
                        return decl$536.ident;
                    }), context$522.defscope, true);
                }
            });
        }
        var trees$526 = expandToTermTree$272(rest$525, context$522);
        return {
            terms: [head$524].concat(trees$526.terms),
            context: trees$526.context
        };
    }
    function addToDefinitionCtx$273(idents$537, defscope$538, skipRep$539) {
        parser$115.assert(idents$537 && idents$537.length > 0, 'expecting some variable identifiers');
        skipRep$539 = skipRep$539 || false;
        _$114.each(idents$537, function (id$540) {
            var skip$541 = false;
            if (skipRep$539) {
                var declRepeat$542 = _$114.find(defscope$538, function (def$543) {
                        return def$543.id.token.value === id$540.token.value && arraysEqual$222(marksof$220(def$543.id.context), marksof$220(id$540.context));
                    });
                skip$541 = typeof declRepeat$542 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$541) {
                var name$544 = fresh$227();
                defscope$538.push({
                    id: id$540,
                    name: name$544
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$274(term$545, context$546) {
        parser$115.assert(context$546 && context$546.env, 'environment map is required');
        if (term$545.hasPrototype(ArrayLiteral$239)) {
            term$545.array.delim.token.inner = expand$275(term$545.array.delim.token.inner, context$546);
            return term$545;
        } else if (term$545.hasPrototype(Block$238)) {
            term$545.body.delim.token.inner = expand$275(term$545.body.delim.token.inner, context$546);
            return term$545;
        } else if (term$545.hasPrototype(ParenExpression$240)) {
            term$545.expr.delim.token.inner = expand$275(term$545.expr.delim.token.inner, context$546);
            return term$545;
        } else if (term$545.hasPrototype(Call$255)) {
            term$545.fun = expandTermTreeToFinal$274(term$545.fun, context$546);
            term$545.args = _$114.map(term$545.args, function (arg$547) {
                return expandTermTreeToFinal$274(arg$547, context$546);
            });
            return term$545;
        } else if (term$545.hasPrototype(UnaryOp$241)) {
            term$545.expr = expandTermTreeToFinal$274(term$545.expr, context$546);
            return term$545;
        } else if (term$545.hasPrototype(BinOp$243)) {
            term$545.left = expandTermTreeToFinal$274(term$545.left, context$546);
            term$545.right = expandTermTreeToFinal$274(term$545.right, context$546);
            return term$545;
        } else if (term$545.hasPrototype(ObjGet$257)) {
            term$545.right.delim.token.inner = expand$275(term$545.right.delim.token.inner, context$546);
            return term$545;
        } else if (term$545.hasPrototype(ObjDotGet$256)) {
            term$545.left = expandTermTreeToFinal$274(term$545.left, context$546);
            term$545.right = expandTermTreeToFinal$274(term$545.right, context$546);
            return term$545;
        } else if (term$545.hasPrototype(VariableDeclaration$258)) {
            if (term$545.init) {
                term$545.init = expandTermTreeToFinal$274(term$545.init, context$546);
            }
            return term$545;
        } else if (term$545.hasPrototype(VariableStatement$259)) {
            term$545.decls = _$114.map(term$545.decls, function (decl$548) {
                return expandTermTreeToFinal$274(decl$548, context$546);
            });
            return term$545;
        } else if (term$545.hasPrototype(Delimiter$247)) {
            // expand inside the delimiter and then continue on
            term$545.delim.token.inner = expand$275(term$545.delim.token.inner, context$546);
            return term$545;
        } else if (term$545.hasPrototype(NamedFun$249) || term$545.hasPrototype(AnonFun$250) || term$545.hasPrototype(CatchClause$260) || term$545.hasPrototype(Module$261)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$549 = [];
            var bodyContext$550 = makeExpanderContext$276(_$114.defaults({ defscope: newDef$549 }, context$546));
            if (term$545.params) {
                var params$559 = term$545.params.addDefCtx(newDef$549);
            } else {
                var params$559 = syn$116.makeDelim('()', [], null);
            }
            var bodies$551 = term$545.body.addDefCtx(newDef$549);
            var paramNames$552 = _$114.map(getParamIdentifiers$229(params$559), function (param$560) {
                    var freshName$561 = fresh$227();
                    return {
                        freshName: freshName$561,
                        originalParam: param$560,
                        renamedParam: param$560.rename(param$560, freshName$561)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$553 = _$114.reduce(paramNames$552, function (accBody$562, p$563) {
                    return accBody$562.rename(p$563.originalParam, p$563.freshName);
                }, bodies$551);
            renamedBody$553 = renamedBody$553.expose();
            var bodyTerms$554 = expand$275([renamedBody$553], bodyContext$550);
            parser$115.assert(bodyTerms$554.length === 1 && bodyTerms$554[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$555 = _$114.map(paramNames$552, function (p$564) {
                    return p$564.renamedParam;
                });
            var flatArgs$556 = syn$116.makeDelim('()', joinSyntax$218(renamedParams$555, ','), term$545.params);
            var expandedArgs$557 = expand$275([flatArgs$556], bodyContext$550);
            parser$115.assert(expandedArgs$557.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$545.params) {
                term$545.params = expandedArgs$557[0];
            }
            if (term$545.hasPrototype(Module$261)) {
                bodyTerms$554[0].body.delim.token.inner = _$114.filter(bodyTerms$554[0].body.delim.token.inner, function (innerTerm$565) {
                    if (innerTerm$565.hasPrototype(Export$263)) {
                        term$545.exports.push(innerTerm$565);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            var flattenedBody$558 = bodyTerms$554[0].destruct();
            flattenedBody$558 = _$114.reduce(newDef$549, function (acc$566, def$567) {
                return acc$566.rename(def$567.id, def$567.name);
            }, flattenedBody$558[0]);
            term$545.body = flattenedBody$558;
            // and continue expand the rest
            return term$545;
        }
        // the term is fine as is
        return term$545;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$275(stx$568, context$569) {
        parser$115.assert(context$569, 'must provide an expander context');
        var trees$570 = expandToTermTree$272(stx$568, context$569);
        return _$114.map(trees$570.terms, function (term$571) {
            return expandTermTreeToFinal$274(term$571, trees$570.context);
        });
    }
    function makeExpanderContext$276(o$572) {
        o$572 = o$572 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$572.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$572.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$572.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$572.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$277(stx$573, builtinSource$574) {
        var builtInEnv$575 = new Map();
        var env$576 = new Map();
        var params$577 = [];
        var context$578, builtInContext$579 = makeExpanderContext$276({ env: builtInEnv$575 });
        if (builtinSource$574) {
            var builtinRead$582 = parser$115.read(builtinSource$574);
            builtinRead$582 = [
                syn$116.makeIdent('module', null),
                syn$116.makeDelim('{}', builtinRead$582, null)
            ];
            var builtinRes$583 = expand$275(builtinRead$582, builtInContext$579);
            params$577 = _$114.map(builtinRes$583[0].exports, function (term$584) {
                return {
                    oldExport: term$584.name,
                    newParam: syn$116.makeIdent(term$584.name.token.value, null)
                };
            });
        }
        var modBody$580 = syn$116.makeDelim('{}', stx$573, null);
        modBody$580 = _$114.reduce(params$577, function (acc$585, param$586) {
            var newName$587 = fresh$227();
            env$576.set(resolve$221(param$586.newParam.rename(param$586.newParam, newName$587)), builtInEnv$575.get(resolve$221(param$586.oldExport)));
            return acc$585.rename(param$586.newParam, newName$587);
        }, modBody$580);
        context$578 = makeExpanderContext$276({ env: env$576 });
        var res$581 = expand$275([
                syn$116.makeIdent('module', null),
                modBody$580
            ], context$578);
        return flatten$278(res$581[0].body.expose().token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$278(stx$588) {
        return _$114.reduce(stx$588, function (acc$589, stx$590) {
            if (stx$590.token.type === parser$115.Token.Delimiter) {
                var exposed$591 = stx$590.expose();
                var openParen$592 = syntaxFromToken$217({
                        type: parser$115.Token.Punctuator,
                        value: stx$590.token.value[0],
                        range: stx$590.token.startRange,
                        lineNumber: stx$590.token.startLineNumber,
                        sm_lineNumber: stx$590.token.sm_startLineNumber ? stx$590.token.sm_startLineNumber : stx$590.token.startLineNumber,
                        lineStart: stx$590.token.startLineStart,
                        sm_lineStart: stx$590.token.sm_startLineStart ? stx$590.token.sm_startLineStart : stx$590.token.startLineStart
                    }, exposed$591);
                var closeParen$593 = syntaxFromToken$217({
                        type: parser$115.Token.Punctuator,
                        value: stx$590.token.value[1],
                        range: stx$590.token.endRange,
                        lineNumber: stx$590.token.endLineNumber,
                        sm_lineNumber: stx$590.token.sm_endLineNumber ? stx$590.token.sm_endLineNumber : stx$590.token.endLineNumber,
                        lineStart: stx$590.token.endLineStart,
                        sm_lineStart: stx$590.token.sm_endLineStart ? stx$590.token.sm_endLineStart : stx$590.token.endLineStart
                    }, exposed$591);
                if (stx$590.token.leadingComments) {
                    openParen$592.token.leadingComments = stx$590.token.leadingComments;
                }
                if (stx$590.token.trailingComments) {
                    openParen$592.token.trailingComments = stx$590.token.trailingComments;
                }
                return acc$589.concat(openParen$592).concat(flatten$278(exposed$591.token.inner)).concat(closeParen$593);
            }
            stx$590.token.sm_lineNumber = stx$590.token.sm_lineNumber ? stx$590.token.sm_lineNumber : stx$590.token.lineNumber;
            stx$590.token.sm_lineStart = stx$590.token.sm_lineStart ? stx$590.token.sm_lineStart : stx$590.token.lineStart;
            return acc$589.concat(stx$590);
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