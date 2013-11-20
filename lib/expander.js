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
(function (root$110, factory$111) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$111(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$111);
    }
}(this, function (exports$112, _$113, parser$114, syn$115, es6$116, se$117, patternModule$118, gen$119) {
    'use strict';
    var codegen$120 = gen$119 || escodegen;
    // used to export "private" methods for unit testing
    exports$112._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$275 = Object.create(this);
                if (typeof o$275.construct === 'function') {
                    o$275.construct.apply(o$275, arguments);
                }
                return o$275;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$276) {
                var result$277 = Object.create(this);
                for (var prop$278 in properties$276) {
                    if (properties$276.hasOwnProperty(prop$278)) {
                        result$277[prop$278] = properties$276[prop$278];
                    }
                }
                return result$277;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$279) {
                function F$280() {
                }
                F$280.prototype = proto$279;
                return this instanceof F$280;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$204(msg$281) {
        throw new Error(msg$281);
    }
    var scopedEval$205 = se$117.scopedEval;
    var Rename$206 = syn$115.Rename;
    var Mark$207 = syn$115.Mark;
    var Var$208 = syn$115.Var;
    var Def$209 = syn$115.Def;
    var isDef$210 = syn$115.isDef;
    var isMark$211 = syn$115.isMark;
    var isRename$212 = syn$115.isRename;
    var syntaxFromToken$213 = syn$115.syntaxFromToken;
    var joinSyntax$214 = syn$115.joinSyntax;
    function remdup$215(mark$282, mlist$283) {
        if (mark$282 === _$113.first(mlist$283)) {
            return _$113.rest(mlist$283, 1);
        }
        return [mark$282].concat(mlist$283);
    }
    // (CSyntax) -> [...Num]
    function marksof$216(ctx$284, stopName$285, originalName$286) {
        var mark$287, submarks$288;
        if (isMark$211(ctx$284)) {
            mark$287 = ctx$284.mark;
            submarks$288 = marksof$216(ctx$284.context, stopName$285, originalName$286);
            return remdup$215(mark$287, submarks$288);
        }
        if (isDef$210(ctx$284)) {
            return marksof$216(ctx$284.context, stopName$285, originalName$286);
        }
        if (isRename$212(ctx$284)) {
            if (stopName$285 === originalName$286 + '$' + ctx$284.name) {
                return [];
            }
            return marksof$216(ctx$284.context, stopName$285, originalName$286);
        }
        return [];
    }
    function resolve$217(stx$289) {
        return resolveCtx$221(stx$289.token.value, stx$289.context, [], []);
    }
    function arraysEqual$218(a$290, b$291) {
        if (a$290.length !== b$291.length) {
            return false;
        }
        for (var i$292 = 0; i$292 < a$290.length; i$292++) {
            if (a$290[i$292] !== b$291[i$292]) {
                return false;
            }
        }
        return true;
    }
    function renames$219(defctx$293, oldctx$294, originalName$295) {
        var acc$296 = oldctx$294;
        for (var i$297 = 0; i$297 < defctx$293.length; i$297++) {
            if (defctx$293[i$297].id.token.value === originalName$295) {
                acc$296 = Rename$206(defctx$293[i$297].id, defctx$293[i$297].name, acc$296, defctx$293);
            }
        }
        return acc$296;
    }
    function unionEl$220(arr$298, el$299) {
        if (arr$298.indexOf(el$299) === -1) {
            var res$300 = arr$298.slice(0);
            res$300.push(el$299);
            return res$300;
        }
        return arr$298;
    }
    // (Syntax) -> String
    function resolveCtx$221(originalName$301, ctx$302, stop_spine$303, stop_branch$304) {
        if (isMark$211(ctx$302)) {
            return resolveCtx$221(originalName$301, ctx$302.context, stop_spine$303, stop_branch$304);
        }
        if (isDef$210(ctx$302)) {
            if (stop_spine$303.indexOf(ctx$302.defctx) !== -1) {
                return resolveCtx$221(originalName$301, ctx$302.context, stop_spine$303, stop_branch$304);
            } else {
                return resolveCtx$221(originalName$301, renames$219(ctx$302.defctx, ctx$302.context, originalName$301), stop_spine$303, unionEl$220(stop_branch$304, ctx$302.defctx));
            }
        }
        if (isRename$212(ctx$302)) {
            if (originalName$301 === ctx$302.id.token.value) {
                var idName$305 = resolveCtx$221(ctx$302.id.token.value, ctx$302.id.context, stop_branch$304, stop_branch$304);
                var subName$306 = resolveCtx$221(originalName$301, ctx$302.context, unionEl$220(stop_spine$303, ctx$302.def), stop_branch$304);
                if (idName$305 === subName$306) {
                    var idMarks$307 = marksof$216(ctx$302.id.context, originalName$301 + '$' + ctx$302.name, originalName$301);
                    var subMarks$308 = marksof$216(ctx$302.context, originalName$301 + '$' + ctx$302.name, originalName$301);
                    if (arraysEqual$218(idMarks$307, subMarks$308)) {
                        return originalName$301 + '$' + ctx$302.name;
                    }
                }
            }
            return resolveCtx$221(originalName$301, ctx$302.context, stop_spine$303, stop_branch$304);
        }
        return originalName$301;
    }
    var nextFresh$222 = 0;
    // fun () -> Num
    function fresh$223() {
        return nextFresh$222++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$224(towrap$309, delimSyntax$310) {
        parser$114.assert(delimSyntax$310.token.type === parser$114.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$213({
            type: parser$114.Token.Delimiter,
            value: delimSyntax$310.token.value,
            inner: towrap$309,
            range: delimSyntax$310.token.range,
            startLineNumber: delimSyntax$310.token.startLineNumber,
            lineStart: delimSyntax$310.token.lineStart
        }, delimSyntax$310);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$225(argSyntax$311) {
        parser$114.assert(argSyntax$311.token.type === parser$114.Token.Delimiter, 'expecting delimiter for function params');
        return _$113.filter(argSyntax$311.token.inner, function (stx$312) {
            return stx$312.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$226 = {
            destruct: function () {
                return _$113.reduce(this.properties, _$113.bind(function (acc$313, prop$314) {
                    if (this[prop$314] && this[prop$314].hasPrototype(TermTree$226)) {
                        return acc$313.concat(this[prop$314].destruct());
                    } else if (this[prop$314] && this[prop$314].token && this[prop$314].token.inner) {
                        this[prop$314].token.inner = _$113.reduce(this[prop$314].token.inner, function (acc$315, t$316) {
                            if (t$316.hasPrototype(TermTree$226)) {
                                return acc$315.concat(t$316.destruct());
                            }
                            return acc$315.concat(t$316);
                        }, []);
                        return acc$313.concat(this[prop$314]);
                    } else if (this[prop$314]) {
                        return acc$313.concat(this[prop$314]);
                    } else {
                        return acc$313;
                    }
                }, this), []);
            },
            addDefCtx: function (def$317) {
                for (var i$318 = 0; i$318 < this.properties.length; i$318++) {
                    var prop$319 = this.properties[i$318];
                    if (Array.isArray(this[prop$319])) {
                        this[prop$319] = _$113.map(this[prop$319], function (item$320) {
                            return item$320.addDefCtx(def$317);
                        });
                    } else if (this[prop$319]) {
                        this[prop$319] = this[prop$319].addDefCtx(def$317);
                    }
                }
                return this;
            }
        };
    var EOF$227 = TermTree$226.extend({
            properties: ['eof'],
            construct: function (e$321) {
                this.eof = e$321;
            }
        });
    var Statement$228 = TermTree$226.extend({
            construct: function () {
            }
        });
    var Expr$229 = TermTree$226.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$230 = Expr$229.extend({
            construct: function () {
            }
        });
    var ThisExpression$231 = PrimaryExpression$230.extend({
            properties: ['this'],
            construct: function (that$322) {
                this.this = that$322;
            }
        });
    var Lit$232 = PrimaryExpression$230.extend({
            properties: ['lit'],
            construct: function (l$323) {
                this.lit = l$323;
            }
        });
    exports$112._test.PropertyAssignment = PropertyAssignment$233;
    var PropertyAssignment$233 = TermTree$226.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$324, assignment$325) {
                this.propName = propName$324;
                this.assignment = assignment$325;
            }
        });
    var Block$234 = PrimaryExpression$230.extend({
            properties: ['body'],
            construct: function (body$326) {
                this.body = body$326;
            }
        });
    var ArrayLiteral$235 = PrimaryExpression$230.extend({
            properties: ['array'],
            construct: function (ar$327) {
                this.array = ar$327;
            }
        });
    var ParenExpression$236 = PrimaryExpression$230.extend({
            properties: ['expr'],
            construct: function (expr$328) {
                this.expr = expr$328;
            }
        });
    var UnaryOp$237 = Expr$229.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$329, expr$330) {
                this.op = op$329;
                this.expr = expr$330;
            }
        });
    var PostfixOp$238 = Expr$229.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$331, op$332) {
                this.expr = expr$331;
                this.op = op$332;
            }
        });
    var BinOp$239 = Expr$229.extend({
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
    var ConditionalExpression$240 = Expr$229.extend({
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
    var Keyword$241 = TermTree$226.extend({
            properties: ['keyword'],
            construct: function (k$341) {
                this.keyword = k$341;
            }
        });
    var Punc$242 = TermTree$226.extend({
            properties: ['punc'],
            construct: function (p$342) {
                this.punc = p$342;
            }
        });
    var Delimiter$243 = TermTree$226.extend({
            properties: ['delim'],
            construct: function (d$343) {
                this.delim = d$343;
            }
        });
    var Id$244 = PrimaryExpression$230.extend({
            properties: ['id'],
            construct: function (id$344) {
                this.id = id$344;
            }
        });
    var NamedFun$245 = Expr$229.extend({
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
    var AnonFun$246 = Expr$229.extend({
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
    var LetMacro$247 = TermTree$226.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$352, body$353) {
                this.name = name$352;
                this.body = body$353;
            }
        });
    var Macro$248 = TermTree$226.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$354, body$355) {
                this.name = name$354;
                this.body = body$355;
            }
        });
    var AnonMacro$249 = TermTree$226.extend({
            properties: ['body'],
            construct: function (body$356) {
                this.body = body$356;
            }
        });
    var Const$250 = Expr$229.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$357, call$358) {
                this.newterm = newterm$357;
                this.call = call$358;
            }
        });
    var Call$251 = Expr$229.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$114.assert(this.fun.hasPrototype(TermTree$226), 'expecting a term tree in destruct of call');
                var that$359 = this;
                this.delim = syntaxFromToken$213(_$113.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$113.reduce(this.args, function (acc$360, term$361) {
                    parser$114.assert(term$361 && term$361.hasPrototype(TermTree$226), 'expecting term trees in destruct of Call');
                    var dst$362 = acc$360.concat(term$361.destruct());
                    // add all commas except for the last one
                    if (that$359.commas.length > 0) {
                        dst$362 = dst$362.concat(that$359.commas.shift());
                    }
                    return dst$362;
                }, []);
                return this.fun.destruct().concat(Delimiter$243.create(this.delim).destruct());
            },
            construct: function (funn$363, args$364, delim$365, commas$366) {
                parser$114.assert(Array.isArray(args$364), 'requires an array of arguments terms');
                this.fun = funn$363;
                this.args = args$364;
                this.delim = delim$365;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$366;
            }
        });
    var ObjDotGet$252 = Expr$229.extend({
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
    var ObjGet$253 = Expr$229.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$370, right$371) {
                this.left = left$370;
                this.right = right$371;
            }
        });
    var VariableDeclaration$254 = TermTree$226.extend({
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
    var VariableStatement$255 = Statement$228.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$113.reduce(this.decls, function (acc$376, decl$377) {
                    return acc$376.concat(decl$377.destruct());
                }, []));
            },
            construct: function (varkw$378, decls$379) {
                parser$114.assert(Array.isArray(decls$379), 'decls must be an array');
                this.varkw = varkw$378;
                this.decls = decls$379;
            }
        });
    var CatchClause$256 = TermTree$226.extend({
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
    var Module$257 = TermTree$226.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$383) {
                this.body = body$383;
                this.exports = [];
            }
        });
    var Empty$258 = TermTree$226.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$259 = TermTree$226.extend({
            properties: ['name'],
            construct: function (name$384) {
                this.name = name$384;
            }
        });
    function stxIsUnaryOp$260(stx$385) {
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
        return _$113.contains(staticOperators$386, stx$385.token.value);
    }
    function stxIsBinOp$261(stx$387) {
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
        return _$113.contains(staticOperators$388, stx$387.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$262(stx$389, context$390) {
        var decls$391 = [];
        var res$392 = enforest$264(stx$389, context$390);
        var result$393 = res$392.result;
        var rest$394 = res$392.rest;
        if (rest$394[0]) {
            var nextRes$395 = enforest$264(rest$394, context$390);
            // x = ...
            if (nextRes$395.result.hasPrototype(Punc$242) && nextRes$395.result.punc.token.value === '=') {
                var initializerRes$396 = enforest$264(nextRes$395.rest, context$390);
                if (initializerRes$396.rest[0]) {
                    var restRes$397 = enforest$264(initializerRes$396.rest, context$390);
                    // x = y + z, ...
                    if (restRes$397.result.hasPrototype(Punc$242) && restRes$397.result.punc.token.value === ',') {
                        decls$391.push(VariableDeclaration$254.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result, restRes$397.result.punc));
                        var subRes$398 = enforestVarStatement$262(restRes$397.rest, context$390);
                        decls$391 = decls$391.concat(subRes$398.result);
                        rest$394 = subRes$398.rest;
                    }    // x = y ...
                    else {
                        decls$391.push(VariableDeclaration$254.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result));
                        rest$394 = initializerRes$396.rest;
                    }
                }    // x = y EOF
                else {
                    decls$391.push(VariableDeclaration$254.create(result$393.id, nextRes$395.result.punc, initializerRes$396.result));
                }
            }    // x ,...;
            else if (nextRes$395.result.hasPrototype(Punc$242) && nextRes$395.result.punc.token.value === ',') {
                decls$391.push(VariableDeclaration$254.create(result$393.id, null, null, nextRes$395.result.punc));
                var subRes$398 = enforestVarStatement$262(nextRes$395.rest, context$390);
                decls$391 = decls$391.concat(subRes$398.result);
                rest$394 = subRes$398.rest;
            } else {
                if (result$393.hasPrototype(Id$244)) {
                    decls$391.push(VariableDeclaration$254.create(result$393.id));
                } else {
                    throwError$204('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$393.hasPrototype(Id$244)) {
                decls$391.push(VariableDeclaration$254.create(result$393.id));
            } else if (result$393.hasPrototype(BinOp$239) && result$393.op.token.value === 'in') {
                decls$391.push(VariableDeclaration$254.create(result$393.left.id, result$393.op, result$393.right));
            } else {
                throwError$204('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$391,
            rest: rest$394
        };
    }
    function adjustLineContext$263(stx$399, original$400) {
        var last$401 = stx$399[0] && typeof stx$399[0].token.range == 'undefined' ? original$400 : stx$399[0];
        return _$113.map(stx$399, function (stx$402) {
            if (typeof stx$402.token.range == 'undefined') {
                stx$402.token.range = last$401.token.range;
            }
            if (stx$402.token.type === parser$114.Token.Delimiter) {
                stx$402.token.sm_startLineNumber = original$400.token.lineNumber;
                stx$402.token.sm_endLineNumber = original$400.token.lineNumber;
                stx$402.token.sm_startLineStart = original$400.token.lineStart;
                stx$402.token.sm_endLineStart = original$400.token.lineStart;
                if (stx$402.token.inner.length > 0) {
                    stx$402.token.inner = adjustLineContext$263(stx$402.token.inner, original$400);
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
    function enforest$264(toks$403, context$404) {
        parser$114.assert(toks$403.length > 0, 'enforest assumes there are tokens to work with');
        function step$405(head$406, rest$407) {
            var innerTokens$408;
            parser$114.assert(Array.isArray(rest$407), 'result must at least be an empty array');
            if (head$406.hasPrototype(TermTree$226)) {
                // function call
                var emp$411 = head$406.emp;
                var emp$411 = head$406.emp;
                var keyword$414 = head$406.keyword;
                var delim$416 = head$406.delim;
                var emp$411 = head$406.emp;
                var punc$419 = head$406.punc;
                var keyword$414 = head$406.keyword;
                var emp$411 = head$406.emp;
                var emp$411 = head$406.emp;
                var emp$411 = head$406.emp;
                var delim$416 = head$406.delim;
                var delim$416 = head$406.delim;
                var keyword$414 = head$406.keyword;
                var keyword$414 = head$406.keyword;
                if (head$406.hasPrototype(Expr$229) && (rest$407[0] && rest$407[0].token.type === parser$114.Token.Delimiter && rest$407[0].token.value === '()')) {
                    var argRes$444, enforestedArgs$445 = [], commas$446 = [];
                    rest$407[0].expose();
                    innerTokens$408 = rest$407[0].token.inner;
                    while (innerTokens$408.length > 0) {
                        argRes$444 = enforest$264(innerTokens$408, context$404);
                        enforestedArgs$445.push(argRes$444.result);
                        innerTokens$408 = argRes$444.rest;
                        if (innerTokens$408[0] && innerTokens$408[0].token.value === ',') {
                            // record the comma for later
                            commas$446.push(innerTokens$408[0]);
                            // but dump it for the next loop turn
                            innerTokens$408 = innerTokens$408.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$447 = _$113.all(enforestedArgs$445, function (argTerm$448) {
                            return argTerm$448.hasPrototype(Expr$229);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$408.length === 0 && argsAreExprs$447) {
                        return step$405(Call$251.create(head$406, enforestedArgs$445, rest$407[0], commas$446), rest$407.slice(1));
                    }
                } else if (head$406.hasPrototype(Expr$229) && (rest$407[0] && rest$407[0].token.value === '?')) {
                    var question$449 = rest$407[0];
                    var condRes$450 = enforest$264(rest$407.slice(1), context$404);
                    var truExpr$451 = condRes$450.result;
                    var right$452 = condRes$450.rest;
                    if (truExpr$451.hasPrototype(Expr$229) && right$452[0] && right$452[0].token.value === ':') {
                        var colon$453 = right$452[0];
                        var flsRes$454 = enforest$264(right$452.slice(1), context$404);
                        var flsExpr$455 = flsRes$454.result;
                        if (flsExpr$455.hasPrototype(Expr$229)) {
                            return step$405(ConditionalExpression$240.create(head$406, question$449, truExpr$451, colon$453, flsExpr$455), flsRes$454.rest);
                        }
                    }
                } else if (head$406.hasPrototype(Keyword$241) && (keyword$414.token.value === 'new' && rest$407[0])) {
                    var newCallRes$456 = enforest$264(rest$407, context$404);
                    if (newCallRes$456.result.hasPrototype(Call$251)) {
                        return step$405(Const$250.create(head$406, newCallRes$456.result), newCallRes$456.rest);
                    }
                } else if (head$406.hasPrototype(Delimiter$243) && delim$416.token.value === '()') {
                    innerTokens$408 = delim$416.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$408.length === 0) {
                        return step$405(ParenExpression$236.create(head$406), rest$407);
                    } else {
                        var innerTerm$457 = get_expression$265(innerTokens$408, context$404);
                        if (innerTerm$457.result && innerTerm$457.result.hasPrototype(Expr$229)) {
                            return step$405(ParenExpression$236.create(head$406), rest$407);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$406.hasPrototype(Expr$229) && (rest$407[0] && rest$407[1] && stxIsBinOp$261(rest$407[0]))) {
                    var op$458 = rest$407[0];
                    var left$459 = head$406;
                    var bopRes$460 = enforest$264(rest$407.slice(1), context$404);
                    var right$452 = bopRes$460.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$452.hasPrototype(Expr$229)) {
                        return step$405(BinOp$239.create(op$458, left$459, right$452), bopRes$460.rest);
                    }
                } else if (head$406.hasPrototype(Punc$242) && stxIsUnaryOp$260(punc$419)) {
                    var unopRes$461 = enforest$264(rest$407, context$404);
                    if (unopRes$461.result.hasPrototype(Expr$229)) {
                        return step$405(UnaryOp$237.create(punc$419, unopRes$461.result), unopRes$461.rest);
                    }
                } else if (head$406.hasPrototype(Keyword$241) && stxIsUnaryOp$260(keyword$414)) {
                    var unopRes$461 = enforest$264(rest$407, context$404);
                    if (unopRes$461.result.hasPrototype(Expr$229)) {
                        return step$405(UnaryOp$237.create(keyword$414, unopRes$461.result), unopRes$461.rest);
                    }
                } else if (head$406.hasPrototype(Expr$229) && (rest$407[0] && (rest$407[0].token.value === '++' || rest$407[0].token.value === '--'))) {
                    return step$405(PostfixOp$238.create(head$406, rest$407[0]), rest$407.slice(1));
                } else if (head$406.hasPrototype(Expr$229) && (rest$407[0] && rest$407[0].token.value === '[]')) {
                    return step$405(ObjGet$253.create(head$406, Delimiter$243.create(rest$407[0].expose())), rest$407.slice(1));
                } else if (head$406.hasPrototype(Expr$229) && (rest$407[0] && rest$407[0].token.value === '.' && rest$407[1] && rest$407[1].token.type === parser$114.Token.Identifier)) {
                    return step$405(ObjDotGet$252.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                } else if (head$406.hasPrototype(Delimiter$243) && delim$416.token.value === '[]') {
                    return step$405(ArrayLiteral$235.create(head$406), rest$407);
                } else if (head$406.hasPrototype(Delimiter$243) && head$406.delim.token.value === '{}') {
                    return step$405(Block$234.create(head$406), rest$407);
                } else if (head$406.hasPrototype(Keyword$241) && (keyword$414.token.value === 'let' && (rest$407[0] && rest$407[0].token.type === parser$114.Token.Identifier || rest$407[0] && rest$407[0].token.type === parser$114.Token.Keyword || rest$407[0] && rest$407[0].token.type === parser$114.Token.Punctuator) && rest$407[1] && rest$407[1].token.value === '=' && rest$407[2] && rest$407[2].token.value === 'macro')) {
                    var mac$462 = enforest$264(rest$407.slice(2), context$404);
                    if (!mac$462.result.hasPrototype(AnonMacro$249)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$462.result);
                    }
                    return step$405(LetMacro$247.create(rest$407[0], mac$462.result.body), mac$462.rest);
                } else if (head$406.hasPrototype(Keyword$241) && (keyword$414.token.value === 'var' && rest$407[0])) {
                    var vsRes$463 = enforestVarStatement$262(rest$407, context$404);
                    if (vsRes$463) {
                        return step$405(VariableStatement$255.create(head$406, vsRes$463.result), vsRes$463.rest);
                    }
                }
            } else {
                parser$114.assert(head$406 && head$406.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$406.token.type === parser$114.Token.Identifier || head$406.token.type === parser$114.Token.Keyword || head$406.token.type === parser$114.Token.Punctuator) && context$404.env.has(resolve$217(head$406))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$464 = fresh$223();
                    var transformerContext$465 = makeExpanderContext$272(_$113.defaults({ mark: newMark$464 }, context$404));
                    // pull the macro transformer out the environment
                    var transformer$466 = context$404.env.get(resolve$217(head$406)).fn;
                    // apply the transformer
                    var rt$467 = transformer$466([head$406].concat(rest$407), transformerContext$465);
                    if (!Array.isArray(rt$467.result)) {
                        throwError$204('Macro transformer must return a result array, not: ' + rt$467.result);
                    }
                    if (rt$467.result.length > 0) {
                        var adjustedResult$468 = adjustLineContext$263(rt$467.result, head$406);
                        adjustedResult$468[0].token.leadingComments = head$406.token.leadingComments;
                        return step$405(adjustedResult$468[0], adjustedResult$468.slice(1).concat(rt$467.rest));
                    } else {
                        return step$405(Empty$258.create(), rt$467.rest);
                    }
                }    // anon macro definition
                else if (head$406.token.type === parser$114.Token.Identifier && head$406.token.value === 'macro' && rest$407[0] && rest$407[0].token.value === '{}') {
                    return step$405(AnonMacro$249.create(rest$407[0].expose().token.inner), rest$407.slice(1));
                }    // macro definition
                else if (head$406.token.type === parser$114.Token.Identifier && head$406.token.value === 'macro' && rest$407[0] && (rest$407[0].token.type === parser$114.Token.Identifier || rest$407[0].token.type === parser$114.Token.Keyword || rest$407[0].token.type === parser$114.Token.Punctuator) && rest$407[1] && rest$407[1].token.type === parser$114.Token.Delimiter && rest$407[1].token.value === '{}') {
                    return step$405(Macro$248.create(rest$407[0], rest$407[1].expose().token.inner), rest$407.slice(2));
                }    // module definition
                else if (head$406.token.value === 'module' && rest$407[0] && rest$407[0].token.value === '{}') {
                    return step$405(Module$257.create(rest$407[0]), rest$407.slice(1));
                }    // function definition
                else if (head$406.token.type === parser$114.Token.Keyword && head$406.token.value === 'function' && rest$407[0] && rest$407[0].token.type === parser$114.Token.Identifier && rest$407[1] && rest$407[1].token.type === parser$114.Token.Delimiter && rest$407[1].token.value === '()' && rest$407[2] && rest$407[2].token.type === parser$114.Token.Delimiter && rest$407[2].token.value === '{}') {
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    rest$407[2].token.inner = rest$407[2].expose().token.inner;
                    return step$405(NamedFun$245.create(head$406, rest$407[0], rest$407[1], rest$407[2]), rest$407.slice(3));
                }    // anonymous function definition
                else if (head$406.token.type === parser$114.Token.Keyword && head$406.token.value === 'function' && rest$407[0] && rest$407[0].token.type === parser$114.Token.Delimiter && rest$407[0].token.value === '()' && rest$407[1] && rest$407[1].token.type === parser$114.Token.Delimiter && rest$407[1].token.value === '{}') {
                    rest$407[0].token.inner = rest$407[0].expose().token.inner;
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    return step$405(AnonFun$246.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                }    // catch statement
                else if (head$406.token.type === parser$114.Token.Keyword && head$406.token.value === 'catch' && rest$407[0] && rest$407[0].token.type === parser$114.Token.Delimiter && rest$407[0].token.value === '()' && rest$407[1] && rest$407[1].token.type === parser$114.Token.Delimiter && rest$407[1].token.value === '{}') {
                    rest$407[0].token.inner = rest$407[0].expose().token.inner;
                    rest$407[1].token.inner = rest$407[1].expose().token.inner;
                    return step$405(CatchClause$256.create(head$406, rest$407[0], rest$407[1]), rest$407.slice(2));
                }    // this expression
                else if (head$406.token.type === parser$114.Token.Keyword && head$406.token.value === 'this') {
                    return step$405(ThisExpression$231.create(head$406), rest$407);
                }    // literal
                else if (head$406.token.type === parser$114.Token.NumericLiteral || head$406.token.type === parser$114.Token.StringLiteral || head$406.token.type === parser$114.Token.BooleanLiteral || head$406.token.type === parser$114.Token.RegexLiteral || head$406.token.type === parser$114.Token.NullLiteral) {
                    return step$405(Lit$232.create(head$406), rest$407);
                }    // export
                else if (head$406.token.type === parser$114.Token.Identifier && head$406.token.value === 'export' && rest$407[0] && (rest$407[0].token.type === parser$114.Token.Identifier || rest$407[0].token.type === parser$114.Token.Keyword || rest$407[0].token.type === parser$114.Token.Punctuator)) {
                    return step$405(Export$259.create(rest$407[0]), rest$407.slice(1));
                }    // identifier
                else if (head$406.token.type === parser$114.Token.Identifier) {
                    return step$405(Id$244.create(head$406), rest$407);
                }    // punctuator
                else if (head$406.token.type === parser$114.Token.Punctuator) {
                    return step$405(Punc$242.create(head$406), rest$407);
                } else if (head$406.token.type === parser$114.Token.Keyword && head$406.token.value === 'with') {
                    throwError$204('with is not supported in sweet.js');
                }    // keyword
                else if (head$406.token.type === parser$114.Token.Keyword) {
                    return step$405(Keyword$241.create(head$406), rest$407);
                }    // Delimiter
                else if (head$406.token.type === parser$114.Token.Delimiter) {
                    return step$405(Delimiter$243.create(head$406.expose()), rest$407);
                }    // end of file
                else if (head$406.token.type === parser$114.Token.EOF) {
                    parser$114.assert(rest$407.length === 0, 'nothing should be after an EOF');
                    return step$405(EOF$227.create(head$406), []);
                } else {
                    // todo: are we missing cases?
                    parser$114.assert(false, 'not implemented');
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
    function get_expression$265(stx$469, context$470) {
        var res$471 = enforest$264(stx$469, context$470);
        if (!res$471.result.hasPrototype(Expr$229)) {
            return {
                result: null,
                rest: stx$469
            };
        }
        return res$471;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$266(newMark$472, env$473) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$474(match$475) {
            if (match$475.level === 0) {
                // replace the match property with the marked syntax
                match$475.match = _$113.map(match$475.match, function (stx$476) {
                    return stx$476.mark(newMark$472);
                });
            } else {
                _$113.each(match$475.match, function (match$477) {
                    dfs$474(match$477);
                });
            }
        }
        _$113.keys(env$473).forEach(function (key$478) {
            dfs$474(env$473[key$478]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$267(mac$479, context$480) {
        var body$481 = mac$479.body;
        // raw function primitive form
        if (!(body$481[0] && body$481[0].token.type === parser$114.Token.Keyword && body$481[0].token.value === 'function')) {
            throwError$204('Primitive macro form must contain a function for the macro body');
        }
        var stub$482 = parser$114.read('()');
        stub$482[0].token.inner = body$481;
        var expanded$483 = expand$271(stub$482, context$480);
        expanded$483 = expanded$483[0].destruct().concat(expanded$483[1].eof);
        var flattend$484 = flatten$274(expanded$483);
        var bodyCode$485 = codegen$120.generate(parser$114.parse(flattend$484));
        var macroFn$486 = scopedEval$205(bodyCode$485, {
                makeValue: syn$115.makeValue,
                makeRegex: syn$115.makeRegex,
                makeIdent: syn$115.makeIdent,
                makeKeyword: syn$115.makeKeyword,
                makePunc: syn$115.makePunc,
                makeDelim: syn$115.makeDelim,
                unwrapSyntax: syn$115.unwrapSyntax,
                throwSyntaxError: syn$115.throwSyntaxError,
                parser: parser$114,
                _: _$113,
                patternModule: patternModule$118,
                getTemplate: function (id$487) {
                    return context$480.templateMap.get(id$487);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$266,
                mergeMatches: function (newMatch$488, oldMatch$489) {
                    newMatch$488.patternEnv = _$113.extend({}, oldMatch$489.patternEnv, newMatch$488.patternEnv);
                    return newMatch$488;
                }
            });
        return macroFn$486;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$268(stx$490, context$491) {
        parser$114.assert(context$491, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$490.length === 0) {
            return {
                terms: [],
                context: context$491
            };
        }
        parser$114.assert(stx$490[0].token, 'expecting a syntax object');
        var f$492 = enforest$264(stx$490, context$491);
        // head :: TermTree
        var head$493 = f$492.result;
        // rest :: [Syntax]
        var rest$494 = f$492.rest;
        if (head$493.hasPrototype(Macro$248)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$496 = loadMacroDef$267(head$493, context$491);
            addToDefinitionCtx$269([head$493.name], context$491.defscope, false);
            context$491.env.set(resolve$217(head$493.name), { fn: macroDefinition$496 });
            return expandToTermTree$268(rest$494, context$491);
        }
        if (head$493.hasPrototype(LetMacro$247)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$496 = loadMacroDef$267(head$493, context$491);
            var freshName$497 = fresh$223();
            var renamedName$498 = head$493.name.rename(head$493.name, freshName$497);
            rest$494 = _$113.map(rest$494, function (stx$499) {
                return stx$499.rename(head$493.name, freshName$497);
            });
            head$493.name = renamedName$498;
            context$491.env.set(resolve$217(head$493.name), { fn: macroDefinition$496 });
            return expandToTermTree$268(rest$494, context$491);
        }
        if (head$493.hasPrototype(NamedFun$245)) {
            addToDefinitionCtx$269([head$493.name], context$491.defscope, true);
        }
        if (head$493.hasPrototype(Id$244) && head$493.id.token.value === '#quoteSyntax' && rest$494[0] && rest$494[0].token.value === '{}') {
            var tempId$500 = fresh$223();
            context$491.templateMap.set(tempId$500, rest$494[0].token.inner);
            return expandToTermTree$268([
                syn$115.makeIdent('getTemplate', head$493.id),
                syn$115.makeDelim('()', [syn$115.makeValue(tempId$500, head$493.id)], head$493.id)
            ].concat(rest$494.slice(1)), context$491);
        }
        if (head$493.hasPrototype(VariableStatement$255)) {
            addToDefinitionCtx$269(_$113.map(head$493.decls, function (decl$501) {
                return decl$501.ident;
            }), context$491.defscope, true);
        }
        if (head$493.hasPrototype(Block$234) && head$493.body.hasPrototype(Delimiter$243)) {
            head$493.body.delim.token.inner.forEach(function (term$502) {
                if (term$502.hasPrototype(VariableStatement$255)) {
                    addToDefinitionCtx$269(_$113.map(term$502.decls, function (decl$503) {
                        return decl$503.ident;
                    }), context$491.defscope, true);
                }
            });
        }
        if (head$493.hasPrototype(Delimiter$243)) {
            head$493.delim.token.inner.forEach(function (term$504) {
                if (term$504.hasPrototype(VariableStatement$255)) {
                    addToDefinitionCtx$269(_$113.map(term$504.decls, function (decl$505) {
                        return decl$505.ident;
                    }), context$491.defscope, true);
                }
            });
        }
        var trees$495 = expandToTermTree$268(rest$494, context$491);
        return {
            terms: [head$493].concat(trees$495.terms),
            context: trees$495.context
        };
    }
    function addToDefinitionCtx$269(idents$506, defscope$507, skipRep$508) {
        parser$114.assert(idents$506 && idents$506.length > 0, 'expecting some variable identifiers');
        skipRep$508 = skipRep$508 || false;
        _$113.each(idents$506, function (id$509) {
            var skip$510 = false;
            if (skipRep$508) {
                var declRepeat$511 = _$113.find(defscope$507, function (def$512) {
                        return def$512.id.token.value === id$509.token.value && arraysEqual$218(marksof$216(def$512.id.context), marksof$216(id$509.context));
                    });
                skip$510 = typeof declRepeat$511 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$510) {
                var name$513 = fresh$223();
                defscope$507.push({
                    id: id$509,
                    name: name$513
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$270(term$514, context$515) {
        parser$114.assert(context$515 && context$515.env, 'environment map is required');
        if (term$514.hasPrototype(ArrayLiteral$235)) {
            term$514.array.delim.token.inner = expand$271(term$514.array.delim.expose().token.inner, context$515);
            return term$514;
        } else if (term$514.hasPrototype(Block$234)) {
            term$514.body.delim.token.inner = expand$271(term$514.body.delim.expose().token.inner, context$515);
            return term$514;
        } else if (term$514.hasPrototype(ParenExpression$236)) {
            term$514.expr.delim.token.inner = expand$271(term$514.expr.delim.expose().token.inner, context$515);
            return term$514;
        } else if (term$514.hasPrototype(Call$251)) {
            term$514.fun = expandTermTreeToFinal$270(term$514.fun, context$515);
            term$514.args = _$113.map(term$514.args, function (arg$516) {
                return expandTermTreeToFinal$270(arg$516, context$515);
            });
            return term$514;
        } else if (term$514.hasPrototype(UnaryOp$237)) {
            term$514.expr = expandTermTreeToFinal$270(term$514.expr, context$515);
            return term$514;
        } else if (term$514.hasPrototype(BinOp$239)) {
            term$514.left = expandTermTreeToFinal$270(term$514.left, context$515);
            term$514.right = expandTermTreeToFinal$270(term$514.right, context$515);
            return term$514;
        } else if (term$514.hasPrototype(ObjGet$253)) {
            term$514.right.delim.token.inner = expand$271(term$514.right.delim.expose().token.inner, context$515);
            return term$514;
        } else if (term$514.hasPrototype(ObjDotGet$252)) {
            term$514.left = expandTermTreeToFinal$270(term$514.left, context$515);
            term$514.right = expandTermTreeToFinal$270(term$514.right, context$515);
            return term$514;
        } else if (term$514.hasPrototype(VariableDeclaration$254)) {
            if (term$514.init) {
                term$514.init = expandTermTreeToFinal$270(term$514.init, context$515);
            }
            return term$514;
        } else if (term$514.hasPrototype(VariableStatement$255)) {
            term$514.decls = _$113.map(term$514.decls, function (decl$517) {
                return expandTermTreeToFinal$270(decl$517, context$515);
            });
            return term$514;
        } else if (term$514.hasPrototype(Delimiter$243)) {
            // expand inside the delimiter and then continue on
            term$514.delim.token.inner = expand$271(term$514.delim.expose().token.inner, context$515);
            return term$514;
        } else if (term$514.hasPrototype(NamedFun$245) || term$514.hasPrototype(AnonFun$246) || term$514.hasPrototype(CatchClause$256) || term$514.hasPrototype(Module$257)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$518 = [];
            var bodyContext$519 = makeExpanderContext$272(_$113.defaults({ defscope: newDef$518 }, context$515));
            if (term$514.params) {
                var params$528 = term$514.params.expose();
            } else {
                var params$528 = syn$115.makeDelim('()', [], null);
            }
            var bodies$520 = term$514.body.addDefCtx(newDef$518);
            var paramNames$521 = _$113.map(getParamIdentifiers$225(params$528), function (param$529) {
                    var freshName$530 = fresh$223();
                    return {
                        freshName: freshName$530,
                        originalParam: param$529,
                        renamedParam: param$529.rename(param$529, freshName$530)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$522 = _$113.reduce(paramNames$521, function (accBody$531, p$532) {
                    return accBody$531.rename(p$532.originalParam, p$532.freshName);
                }, bodies$520);
            renamedBody$522 = renamedBody$522.expose();
            var expandedResult$523 = expandToTermTree$268(renamedBody$522.token.inner, bodyContext$519);
            var bodyTerms$524 = expandedResult$523.terms;
            var renamedParams$525 = _$113.map(paramNames$521, function (p$533) {
                    return p$533.renamedParam;
                });
            var flatArgs$526 = syn$115.makeDelim('()', joinSyntax$214(renamedParams$525, ','), term$514.params);
            var expandedArgs$527 = expand$271([flatArgs$526], bodyContext$519);
            parser$114.assert(expandedArgs$527.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$514.params) {
                term$514.params = expandedArgs$527[0];
            }
            bodyTerms$524 = _$113.map(bodyTerms$524, function (bodyTerm$534) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$535 = bodyTerm$534.addDefCtx(newDef$518);
                // finish expansion
                return expandTermTreeToFinal$270(termWithCtx$535, expandedResult$523.context);
            });
            if (term$514.hasPrototype(Module$257)) {
                bodyTerms$524 = _$113.filter(bodyTerms$524, function (bodyTerm$536) {
                    if (bodyTerm$536.hasPrototype(Export$259)) {
                        term$514.exports.push(bodyTerm$536);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$522.token.inner = bodyTerms$524;
            term$514.body = renamedBody$522;
            // and continue expand the rest
            return term$514;
        }
        // the term is fine as is
        return term$514;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$271(stx$537, context$538) {
        parser$114.assert(context$538, 'must provide an expander context');
        var trees$539 = expandToTermTree$268(stx$537, context$538);
        return _$113.map(trees$539.terms, function (term$540) {
            return expandTermTreeToFinal$270(term$540, trees$539.context);
        });
    }
    function makeExpanderContext$272(o$541) {
        o$541 = o$541 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$541.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$541.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$541.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$541.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$273(stx$542, builtinSource$543) {
        var builtInEnv$544 = new Map();
        var env$545 = new Map();
        var params$546 = [];
        var context$547, builtInContext$548 = makeExpanderContext$272({ env: builtInEnv$544 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$543) {
            var builtinRead$551 = parser$114.read(builtinSource$543);
            builtinRead$551 = [
                syn$115.makeIdent('module', null),
                syn$115.makeDelim('{}', builtinRead$551, null)
            ];
            var builtinRes$552 = expand$271(builtinRead$551, builtInContext$548);
            params$546 = _$113.map(builtinRes$552[0].exports, function (term$553) {
                return {
                    oldExport: term$553.name,
                    newParam: syn$115.makeIdent(term$553.name.token.value, null)
                };
            });
        }
        var modBody$549 = syn$115.makeDelim('{}', stx$542, null);
        modBody$549 = _$113.reduce(params$546, function (acc$554, param$555) {
            var newName$556 = fresh$223();
            env$545.set(resolve$217(param$555.newParam.rename(param$555.newParam, newName$556)), builtInEnv$544.get(resolve$217(param$555.oldExport)));
            return acc$554.rename(param$555.newParam, newName$556);
        }, modBody$549);
        context$547 = makeExpanderContext$272({ env: env$545 });
        var res$550 = expand$271([
                syn$115.makeIdent('module', null),
                modBody$549
            ], context$547);
        res$550 = res$550[0].destruct();
        return flatten$274(res$550[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$274(stx$557) {
        return _$113.reduce(stx$557, function (acc$558, stx$559) {
            if (stx$559.token.type === parser$114.Token.Delimiter) {
                var exposed$560 = stx$559.expose();
                var openParen$561 = syntaxFromToken$213({
                        type: parser$114.Token.Punctuator,
                        value: stx$559.token.value[0],
                        range: stx$559.token.startRange,
                        lineNumber: stx$559.token.startLineNumber,
                        sm_lineNumber: stx$559.token.sm_startLineNumber ? stx$559.token.sm_startLineNumber : stx$559.token.startLineNumber,
                        lineStart: stx$559.token.startLineStart,
                        sm_lineStart: stx$559.token.sm_startLineStart ? stx$559.token.sm_startLineStart : stx$559.token.startLineStart
                    }, exposed$560);
                var closeParen$562 = syntaxFromToken$213({
                        type: parser$114.Token.Punctuator,
                        value: stx$559.token.value[1],
                        range: stx$559.token.endRange,
                        lineNumber: stx$559.token.endLineNumber,
                        sm_lineNumber: stx$559.token.sm_endLineNumber ? stx$559.token.sm_endLineNumber : stx$559.token.endLineNumber,
                        lineStart: stx$559.token.endLineStart,
                        sm_lineStart: stx$559.token.sm_endLineStart ? stx$559.token.sm_endLineStart : stx$559.token.endLineStart
                    }, exposed$560);
                if (stx$559.token.leadingComments) {
                    openParen$561.token.leadingComments = stx$559.token.leadingComments;
                }
                if (stx$559.token.trailingComments) {
                    openParen$561.token.trailingComments = stx$559.token.trailingComments;
                }
                return acc$558.concat(openParen$561).concat(flatten$274(exposed$560.token.inner)).concat(closeParen$562);
            }
            stx$559.token.sm_lineNumber = stx$559.token.sm_lineNumber ? stx$559.token.sm_lineNumber : stx$559.token.lineNumber;
            stx$559.token.sm_lineStart = stx$559.token.sm_lineStart ? stx$559.token.sm_lineStart : stx$559.token.lineStart;
            return acc$558.concat(stx$559);
        }, []);
    }
    exports$112.enforest = enforest$264;
    exports$112.expand = expandTopLevel$273;
    exports$112.resolve = resolve$217;
    exports$112.get_expression = get_expression$265;
    exports$112.makeExpanderContext = makeExpanderContext$272;
    exports$112.Expr = Expr$229;
    exports$112.VariableStatement = VariableStatement$255;
    exports$112.tokensToSyntax = syn$115.tokensToSyntax;
    exports$112.syntaxToTokens = syn$115.syntaxToTokens;
}));