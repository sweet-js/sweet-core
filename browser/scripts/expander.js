(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        factory$91(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('escodegen'), require('./scopedEval'), require('./patterns'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'escodegen',
            'scopedEval',
            'patterns'
        ], factory$91);
    }
}(this, function (exports$92, _$93, parser$94, syn$95, es6$96, codegen$97, se$98, patternModule$99) {
    'use strict';
    exports$92._test = {};
    Object.prototype.create = function () {
        var o$226 = Object.create(this);
        if (typeof o$226.construct === 'function') {
            o$226.construct.apply(o$226, arguments);
        }
        return o$226;
    };
    Object.prototype.extend = function (properties$227) {
        var result$228 = Object.create(this);
        for (var prop$229 in properties$227) {
            if (properties$227.hasOwnProperty(prop$229)) {
                result$228[prop$229] = properties$227[prop$229];
            }
        }
        return result$228;
    };
    Object.prototype.hasPrototype = function (proto$230) {
        function F$231() {
        }
        F$231.prototype = proto$230;
        return this instanceof F$231;
    };
    function throwError$158(msg$232) {
        throw new Error(msg$232);
    }
    var scopedEval$159 = se$98.scopedEval;
    var Rename$160 = syn$95.Rename;
    var Mark$161 = syn$95.Mark;
    var Var$162 = syn$95.Var;
    var Def$163 = syn$95.Def;
    var isDef$164 = syn$95.isDef;
    var isMark$165 = syn$95.isMark;
    var isRename$166 = syn$95.isRename;
    var syntaxFromToken$167 = syn$95.syntaxFromToken;
    var mkSyntax$168 = syn$95.mkSyntax;
    function remdup$169(mark$233, mlist$234) {
        if (mark$233 === _$93.first(mlist$234)) {
            return _$93.rest(mlist$234, 1);
        }
        return [mark$233].concat(mlist$234);
    }
    function marksof$170(ctx$235, stopName$236, originalName$237) {
        var mark$238, submarks$239;
        if (isMark$165(ctx$235)) {
            mark$238 = ctx$235.mark;
            submarks$239 = marksof$170(ctx$235.context, stopName$236, originalName$237);
            return remdup$169(mark$238, submarks$239);
        }
        if (isDef$164(ctx$235)) {
            return marksof$170(ctx$235.context, stopName$236, originalName$237);
        }
        if (isRename$166(ctx$235)) {
            if (stopName$236 === originalName$237 + '$' + ctx$235.name) {
                return [];
            }
            return marksof$170(ctx$235.context, stopName$236, originalName$237);
        }
        return [];
    }
    function resolve$171(stx$240) {
        return resolveCtx$175(stx$240.token.value, stx$240.context, [], []);
    }
    function arraysEqual$172(a$241, b$242) {
        if (a$241.length !== b$242.length) {
            return false;
        }
        for (var i$243 = 0; i$243 < a$241.length; i$243++) {
            if (a$241[i$243] !== b$242[i$243]) {
                return false;
            }
        }
        return true;
    }
    function renames$173(defctx$244, oldctx$245, originalName$246) {
        var acc$247 = oldctx$245;
        for (var i$248 = 0; i$248 < defctx$244.length; i$248++) {
            if (defctx$244[i$248].id.token.value === originalName$246) {
                acc$247 = Rename$160(defctx$244[i$248].id, defctx$244[i$248].name, acc$247, defctx$244);
            }
        }
        return acc$247;
    }
    function unionEl$174(arr$249, el$250) {
        if (arr$249.indexOf(el$250) === -1) {
            var res$251 = arr$249.slice(0);
            res$251.push(el$250);
            return res$251;
        }
        return arr$249;
    }
    function resolveCtx$175(originalName$252, ctx$253, stop_spine$254, stop_branch$255) {
        if (isMark$165(ctx$253)) {
            return resolveCtx$175(originalName$252, ctx$253.context, stop_spine$254, stop_branch$255);
        }
        if (isDef$164(ctx$253)) {
            if (stop_spine$254.indexOf(ctx$253.defctx) !== -1) {
                return resolveCtx$175(originalName$252, ctx$253.context, stop_spine$254, stop_branch$255);
            } else {
                return resolveCtx$175(originalName$252, renames$173(ctx$253.defctx, ctx$253.context, originalName$252), stop_spine$254, unionEl$174(stop_branch$255, ctx$253.defctx));
            }
        }
        if (isRename$166(ctx$253)) {
            if (originalName$252 === ctx$253.id.token.value) {
                var idName$256 = resolveCtx$175(ctx$253.id.token.value, ctx$253.id.context, stop_branch$255, stop_branch$255);
                var subName$257 = resolveCtx$175(originalName$252, ctx$253.context, unionEl$174(stop_spine$254, ctx$253.def), stop_branch$255);
                if (idName$256 === subName$257) {
                    var idMarks$258 = marksof$170(ctx$253.id.context, originalName$252 + '$' + ctx$253.name, originalName$252);
                    var subMarks$259 = marksof$170(ctx$253.context, originalName$252 + '$' + ctx$253.name, originalName$252);
                    if (arraysEqual$172(idMarks$258, subMarks$259)) {
                        return originalName$252 + '$' + ctx$253.name;
                    }
                }
            }
            return resolveCtx$175(originalName$252, ctx$253.context, unionEl$174(stop_spine$254, ctx$253.def), stop_branch$255);
        }
        return originalName$252;
    }
    var nextFresh$176 = 0;
    function fresh$177() {
        return nextFresh$176++;
    }
    ;
    function joinSyntax$178(tojoin$260, punc$261) {
        if (tojoin$260.length === 0) {
            return [];
        }
        if (punc$261 === ' ') {
            return tojoin$260;
        }
        return _$93.reduce(_$93.rest(tojoin$260, 1), function (acc$262, join$263) {
            return acc$262.concat(mkSyntax$168(punc$261, parser$94.Token.Punctuator, join$263), join$263);
        }, [_$93.first(tojoin$260)]);
    }
    function wrapDelim$179(towrap$264, delimSyntax$265) {
        parser$94.assert(delimSyntax$265.token.type === parser$94.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$167({
            type: parser$94.Token.Delimiter,
            value: delimSyntax$265.token.value,
            inner: towrap$264,
            range: delimSyntax$265.token.range,
            startLineNumber: delimSyntax$265.token.startLineNumber,
            lineStart: delimSyntax$265.token.lineStart
        }, delimSyntax$265.context);
    }
    function getParamIdentifiers$180(argSyntax$266) {
        parser$94.assert(argSyntax$266.token.type === parser$94.Token.Delimiter, 'expecting delimiter for function params');
        return _$93.filter(argSyntax$266.token.inner, function (stx$267) {
            return stx$267.token.value !== ',';
        });
    }
    var TermTree$181 = {destruct: function () {
                return _$93.reduce(this.properties, _$93.bind(function (acc$268, prop$269) {
                    if (this[prop$269] && this[prop$269].hasPrototype(TermTree$181)) {
                        return acc$268.concat(this[prop$269].destruct());
                    } else if (this[prop$269] && this[prop$269].token && this[prop$269].token.inner) {
                        this[prop$269].token.inner = _$93.reduce(this[prop$269].token.inner, function (acc$270, t$271) {
                            if (t$271.hasPrototype(TermTree$181)) {
                                return acc$270.concat(t$271.destruct());
                            }
                            return acc$270.concat(t$271);
                        }, []);
                        return acc$268.concat(this[prop$269]);
                    } else if (this[prop$269]) {
                        return acc$268.concat(this[prop$269]);
                    } else {
                        return acc$268;
                    }
                }, this), []);
            }};
    var EOF$182 = TermTree$181.extend({
            properties: ['eof'],
            construct: function (e$272) {
                this.eof = e$272;
            }
        });
    var Statement$183 = TermTree$181.extend({construct: function () {
            }});
    var Expr$184 = TermTree$181.extend({construct: function () {
            }});
    var PrimaryExpression$185 = Expr$184.extend({construct: function () {
            }});
    var ThisExpression$186 = PrimaryExpression$185.extend({
            properties: ['this'],
            construct: function (that$273) {
                this.this = that$273;
            }
        });
    var Lit$187 = PrimaryExpression$185.extend({
            properties: ['lit'],
            construct: function (l$274) {
                this.lit = l$274;
            }
        });
    exports$92._test.PropertyAssignment = PropertyAssignment$188;
    var PropertyAssignment$188 = TermTree$181.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$275, assignment$276) {
                this.propName = propName$275;
                this.assignment = assignment$276;
            }
        });
    var Block$189 = PrimaryExpression$185.extend({
            properties: ['body'],
            construct: function (body$277) {
                this.body = body$277;
            }
        });
    var ArrayLiteral$190 = PrimaryExpression$185.extend({
            properties: ['array'],
            construct: function (ar$278) {
                this.array = ar$278;
            }
        });
    var ParenExpression$191 = PrimaryExpression$185.extend({
            properties: ['expr'],
            construct: function (expr$279) {
                this.expr = expr$279;
            }
        });
    var UnaryOp$192 = Expr$184.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$280, expr$281) {
                this.op = op$280;
                this.expr = expr$281;
            }
        });
    var PostfixOp$193 = Expr$184.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$282, op$283) {
                this.expr = expr$282;
                this.op = op$283;
            }
        });
    var BinOp$194 = Expr$184.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$284, left$285, right$286) {
                this.op = op$284;
                this.left = left$285;
                this.right = right$286;
            }
        });
    var ConditionalExpression$195 = Expr$184.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$287, question$288, tru$289, colon$290, fls$291) {
                this.cond = cond$287;
                this.question = question$288;
                this.tru = tru$289;
                this.colon = colon$290;
                this.fls = fls$291;
            }
        });
    var Keyword$196 = TermTree$181.extend({
            properties: ['keyword'],
            construct: function (k$292) {
                this.keyword = k$292;
            }
        });
    var Punc$197 = TermTree$181.extend({
            properties: ['punc'],
            construct: function (p$293) {
                this.punc = p$293;
            }
        });
    var Delimiter$198 = TermTree$181.extend({
            properties: ['delim'],
            construct: function (d$294) {
                this.delim = d$294;
            }
        });
    var Id$199 = PrimaryExpression$185.extend({
            properties: ['id'],
            construct: function (id$295) {
                this.id = id$295;
            }
        });
    var NamedFun$200 = Expr$184.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$296, name$297, params$298, body$299) {
                this.keyword = keyword$296;
                this.name = name$297;
                this.params = params$298;
                this.body = body$299;
            }
        });
    var AnonFun$201 = Expr$184.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$300, params$301, body$302) {
                this.keyword = keyword$300;
                this.params = params$301;
                this.body = body$302;
            }
        });
    var LetMacro$202 = TermTree$181.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$303, body$304) {
                this.name = name$303;
                this.body = body$304;
            }
        });
    var Macro$203 = TermTree$181.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$305, body$306) {
                this.name = name$305;
                this.body = body$306;
            }
        });
    var AnonMacro$204 = TermTree$181.extend({
            properties: ['body'],
            construct: function (body$307) {
                this.body = body$307;
            }
        });
    var Const$205 = Expr$184.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$308, call$309) {
                this.newterm = newterm$308;
                this.call = call$309;
            }
        });
    var Call$206 = Expr$184.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$94.assert(this.fun.hasPrototype(TermTree$181), 'expecting a term tree in destruct of call');
                var that$310 = this;
                this.delim = syntaxFromToken$167(_$93.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$93.reduce(this.args, function (acc$311, term$312) {
                    parser$94.assert(term$312 && term$312.hasPrototype(TermTree$181), 'expecting term trees in destruct of Call');
                    var dst$313 = acc$311.concat(term$312.destruct());
                    if (that$310.commas.length > 0) {
                        dst$313 = dst$313.concat(that$310.commas.shift());
                    }
                    return dst$313;
                }, []);
                return this.fun.destruct().concat(Delimiter$198.create(this.delim).destruct());
            },
            construct: function (funn$314, args$315, delim$316, commas$317) {
                parser$94.assert(Array.isArray(args$315), 'requires an array of arguments terms');
                this.fun = funn$314;
                this.args = args$315;
                this.delim = delim$316;
                this.commas = commas$317;
            }
        });
    var ObjDotGet$207 = Expr$184.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$318, dot$319, right$320) {
                this.left = left$318;
                this.dot = dot$319;
                this.right = right$320;
            }
        });
    var ObjGet$208 = Expr$184.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$321, right$322) {
                this.left = left$321;
                this.right = right$322;
            }
        });
    var VariableDeclaration$209 = TermTree$181.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$323, eqstx$324, init$325, comma$326) {
                this.ident = ident$323;
                this.eqstx = eqstx$324;
                this.init = init$325;
                this.comma = comma$326;
            }
        });
    var VariableStatement$210 = Statement$183.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$93.reduce(this.decls, function (acc$327, decl$328) {
                    return acc$327.concat(decl$328.destruct());
                }, []));
            },
            construct: function (varkw$329, decls$330) {
                parser$94.assert(Array.isArray(decls$330), 'decls must be an array');
                this.varkw = varkw$329;
                this.decls = decls$330;
            }
        });
    var CatchClause$211 = TermTree$181.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$331, params$332, body$333) {
                this.catchkw = catchkw$331;
                this.params = params$332;
                this.body = body$333;
            }
        });
    var Empty$212 = TermTree$181.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$213(stx$334) {
        var staticOperators$335 = [
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
        return _$93.contains(staticOperators$335, stx$334.token.value);
    }
    function stxIsBinOp$214(stx$336) {
        var staticOperators$337 = [
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
        return _$93.contains(staticOperators$337, stx$336.token.value);
    }
    function enforestVarStatement$215(stx$338, env$339) {
        var decls$340 = [];
        var res$341 = enforest$216(stx$338, env$339);
        var result$342 = res$341.result;
        var rest$343 = res$341.rest;
        if (rest$343[0]) {
            var nextRes$344 = enforest$216(rest$343, env$339);
            if (nextRes$344.result.hasPrototype(Punc$197) && nextRes$344.result.punc.token.value === '=') {
                var initializerRes$345 = enforest$216(nextRes$344.rest, env$339);
                if (initializerRes$345.rest[0]) {
                    var restRes$346 = enforest$216(initializerRes$345.rest, env$339);
                    if (restRes$346.result.hasPrototype(Punc$197) && restRes$346.result.punc.token.value === ',') {
                        decls$340.push(VariableDeclaration$209.create(result$342.id, nextRes$344.result.punc, initializerRes$345.result, restRes$346.result.punc));
                        var subRes$347 = enforestVarStatement$215(restRes$346.rest, env$339);
                        decls$340 = decls$340.concat(subRes$347.result);
                        rest$343 = subRes$347.rest;
                    } else {
                        decls$340.push(VariableDeclaration$209.create(result$342.id, nextRes$344.result.punc, initializerRes$345.result));
                        rest$343 = initializerRes$345.rest;
                    }
                } else {
                    decls$340.push(VariableDeclaration$209.create(result$342.id, nextRes$344.result.punc, initializerRes$345.result));
                }
            } else if (nextRes$344.result.hasPrototype(Punc$197) && nextRes$344.result.punc.token.value === ',') {
                decls$340.push(VariableDeclaration$209.create(result$342.id, null, null, nextRes$344.result.punc));
                var subRes$347 = enforestVarStatement$215(nextRes$344.rest, env$339);
                decls$340 = decls$340.concat(subRes$347.result);
                rest$343 = subRes$347.rest;
            } else {
                if (result$342.hasPrototype(Id$199)) {
                    decls$340.push(VariableDeclaration$209.create(result$342.id));
                } else {
                    throwError$158('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$342.hasPrototype(Id$199)) {
                decls$340.push(VariableDeclaration$209.create(result$342.id));
            } else if (result$342.hasPrototype(BinOp$194) && result$342.op.token.value === 'in') {
                decls$340.push(VariableDeclaration$209.create(result$342.left.id, result$342.op, result$342.right));
            } else {
                throwError$158('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$340,
            rest: rest$343
        };
    }
    function enforest$216(toks$348, env$349) {
        env$349 = env$349 || new Map();
        parser$94.assert(toks$348.length > 0, 'enforest assumes there are tokens to work with');
        function step$350(head$351, rest$352) {
            var innerTokens$353;
            parser$94.assert(Array.isArray(rest$352), 'result must at least be an empty array');
            if (head$351.hasPrototype(TermTree$181)) {
                var emp$356 = head$351.emp;
                var emp$356 = head$351.emp;
                var keyword$359 = head$351.keyword;
                var delim$361 = head$351.delim;
                var emp$356 = head$351.emp;
                var punc$364 = head$351.punc;
                var keyword$359 = head$351.keyword;
                var emp$356 = head$351.emp;
                var emp$356 = head$351.emp;
                var emp$356 = head$351.emp;
                var delim$361 = head$351.delim;
                var delim$361 = head$351.delim;
                var keyword$359 = head$351.keyword;
                var keyword$359 = head$351.keyword;
                if (head$351.hasPrototype(Expr$184) && (rest$352[0] && rest$352[0].token.type === parser$94.Token.Delimiter && rest$352[0].token.value === '()')) {
                    var argRes$389, enforestedArgs$390 = [], commas$391 = [];
                    rest$352[0].expose();
                    innerTokens$353 = rest$352[0].token.inner;
                    while (innerTokens$353.length > 0) {
                        argRes$389 = enforest$216(innerTokens$353, env$349);
                        enforestedArgs$390.push(argRes$389.result);
                        innerTokens$353 = argRes$389.rest;
                        if (innerTokens$353[0] && innerTokens$353[0].token.value === ',') {
                            commas$391.push(innerTokens$353[0]);
                            innerTokens$353 = innerTokens$353.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$392 = _$93.all(enforestedArgs$390, function (argTerm$393) {
                            return argTerm$393.hasPrototype(Expr$184);
                        });
                    if (innerTokens$353.length === 0 && argsAreExprs$392) {
                        return step$350(Call$206.create(head$351, enforestedArgs$390, rest$352[0], commas$391), rest$352.slice(1));
                    }
                } else if (head$351.hasPrototype(Expr$184) && (rest$352[0] && rest$352[0].token.value === '?')) {
                    var question$394 = rest$352[0];
                    var condRes$395 = enforest$216(rest$352.slice(1), env$349);
                    var truExpr$396 = condRes$395.result;
                    var right$397 = condRes$395.rest;
                    if (truExpr$396.hasPrototype(Expr$184) && right$397[0] && right$397[0].token.value === ':') {
                        var colon$398 = right$397[0];
                        var flsRes$399 = enforest$216(right$397.slice(1), env$349);
                        var flsExpr$400 = flsRes$399.result;
                        if (flsExpr$400.hasPrototype(Expr$184)) {
                            return step$350(ConditionalExpression$195.create(head$351, question$394, truExpr$396, colon$398, flsExpr$400), flsRes$399.rest);
                        }
                    }
                } else if (head$351.hasPrototype(Keyword$196) && (keyword$359.token.value === 'new' && rest$352[0])) {
                    var newCallRes$401 = enforest$216(rest$352, env$349);
                    if (newCallRes$401.result.hasPrototype(Call$206)) {
                        return step$350(Const$205.create(head$351, newCallRes$401.result), newCallRes$401.rest);
                    }
                } else if (head$351.hasPrototype(Delimiter$198) && delim$361.token.value === '()') {
                    innerTokens$353 = delim$361.token.inner;
                    if (innerTokens$353.length === 0) {
                        return step$350(ParenExpression$191.create(head$351), rest$352);
                    } else {
                        var innerTerm$402 = get_expression$217(innerTokens$353, env$349);
                        if (innerTerm$402.result && innerTerm$402.result.hasPrototype(Expr$184)) {
                            return step$350(ParenExpression$191.create(head$351), rest$352);
                        }
                    }
                } else if (head$351.hasPrototype(TermTree$181) && (rest$352[0] && rest$352[1] && stxIsBinOp$214(rest$352[0]))) {
                    var op$403 = rest$352[0];
                    var left$404 = head$351;
                    var bopRes$405 = enforest$216(rest$352.slice(1), env$349);
                    var right$397 = bopRes$405.result;
                    if (right$397.hasPrototype(Expr$184)) {
                        return step$350(BinOp$194.create(op$403, left$404, right$397), bopRes$405.rest);
                    }
                } else if (head$351.hasPrototype(Punc$197) && stxIsUnaryOp$213(punc$364)) {
                    var unopRes$406 = enforest$216(rest$352, env$349);
                    if (unopRes$406.result.hasPrototype(Expr$184)) {
                        return step$350(UnaryOp$192.create(punc$364, unopRes$406.result), unopRes$406.rest);
                    }
                } else if (head$351.hasPrototype(Keyword$196) && stxIsUnaryOp$213(keyword$359)) {
                    var unopRes$406 = enforest$216(rest$352, env$349);
                    if (unopRes$406.result.hasPrototype(Expr$184)) {
                        return step$350(UnaryOp$192.create(keyword$359, unopRes$406.result), unopRes$406.rest);
                    }
                } else if (head$351.hasPrototype(Expr$184) && (rest$352[0] && (rest$352[0].token.value === '++' || rest$352[0].token.value === '--'))) {
                    return step$350(PostfixOp$193.create(head$351, rest$352[0]), rest$352.slice(1));
                } else if (head$351.hasPrototype(Expr$184) && (rest$352[0] && rest$352[0].token.value === '[]')) {
                    return step$350(ObjGet$208.create(head$351, Delimiter$198.create(rest$352[0].expose())), rest$352.slice(1));
                } else if (head$351.hasPrototype(Expr$184) && (rest$352[0] && rest$352[0].token.value === '.' && rest$352[1] && rest$352[1].token.type === parser$94.Token.Identifier)) {
                    return step$350(ObjDotGet$207.create(head$351, rest$352[0], rest$352[1]), rest$352.slice(2));
                } else if (head$351.hasPrototype(Delimiter$198) && delim$361.token.value === '[]') {
                    return step$350(ArrayLiteral$190.create(head$351), rest$352);
                } else if (head$351.hasPrototype(Delimiter$198) && head$351.delim.token.value === '{}') {
                    return step$350(Block$189.create(head$351), rest$352);
                } else if (head$351.hasPrototype(Keyword$196) && (keyword$359.token.value === 'let' && (rest$352[0] && rest$352[0].token.type === parser$94.Token.Identifier || rest$352[0] && rest$352[0].token.type === parser$94.Token.Keyword) && rest$352[1] && rest$352[1].token.value === '=' && rest$352[2] && rest$352[2].token.value === 'macro')) {
                    var mac$407 = enforest$216(rest$352.slice(2), env$349);
                    if (!mac$407.result.hasPrototype(AnonMacro$204)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$350(LetMacro$202.create(rest$352[0], mac$407.result.body), mac$407.rest);
                } else if (head$351.hasPrototype(Keyword$196) && (keyword$359.token.value === 'var' && rest$352[0])) {
                    var vsRes$408 = enforestVarStatement$215(rest$352, env$349);
                    if (vsRes$408) {
                        return step$350(VariableStatement$210.create(head$351, vsRes$408.result), vsRes$408.rest);
                    }
                }
            } else {
                parser$94.assert(head$351 && head$351.token, 'assuming head is a syntax object');
                if ((head$351.token.type === parser$94.Token.Identifier || head$351.token.type === parser$94.Token.Keyword) && env$349.has(resolve$171(head$351))) {
                    var transformer$409 = env$349.get(resolve$171(head$351)).fn;
                    var rt$410 = transformer$409([head$351].concat(rest$352), env$349);
                    if (!Array.isArray(rt$410.result)) {
                        throwError$158('Macro transformer must return a result array, not: ' + rt$410.result);
                    }
                    if (rt$410.result.length > 0) {
                        return step$350(rt$410.result[0], rt$410.result.slice(1).concat(rt$410.rest));
                    } else {
                        return step$350(Empty$212.create(), rt$410.rest);
                    }
                } else if (head$351.token.type === parser$94.Token.Identifier && head$351.token.value === 'macro' && rest$352[0] && rest$352[0].token.value === '{}') {
                    return step$350(AnonMacro$204.create(rest$352[0].expose().token.inner), rest$352.slice(1));
                } else if (head$351.token.type === parser$94.Token.Identifier && head$351.token.value === 'macro' && rest$352[0] && (rest$352[0].token.type === parser$94.Token.Identifier || rest$352[0].token.type === parser$94.Token.Keyword) && rest$352[1] && rest$352[1].token.type === parser$94.Token.Delimiter && rest$352[1].token.value === '{}') {
                    return step$350(Macro$203.create(rest$352[0], rest$352[1].expose().token.inner), rest$352.slice(2));
                } else if (head$351.token.type === parser$94.Token.Keyword && head$351.token.value === 'function' && rest$352[0] && rest$352[0].token.type === parser$94.Token.Identifier && rest$352[1] && rest$352[1].token.type === parser$94.Token.Delimiter && rest$352[1].token.value === '()' && rest$352[2] && rest$352[2].token.type === parser$94.Token.Delimiter && rest$352[2].token.value === '{}') {
                    rest$352[1].token.inner = rest$352[1].expose().token.inner;
                    rest$352[2].token.inner = rest$352[2].expose().token.inner;
                    return step$350(NamedFun$200.create(head$351, rest$352[0], rest$352[1], rest$352[2]), rest$352.slice(3));
                } else if (head$351.token.type === parser$94.Token.Keyword && head$351.token.value === 'function' && rest$352[0] && rest$352[0].token.type === parser$94.Token.Delimiter && rest$352[0].token.value === '()' && rest$352[1] && rest$352[1].token.type === parser$94.Token.Delimiter && rest$352[1].token.value === '{}') {
                    rest$352[0].token.inner = rest$352[0].expose().token.inner;
                    rest$352[1].token.inner = rest$352[1].expose().token.inner;
                    return step$350(AnonFun$201.create(head$351, rest$352[0], rest$352[1]), rest$352.slice(2));
                } else if (head$351.token.type === parser$94.Token.Keyword && head$351.token.value === 'catch' && rest$352[0] && rest$352[0].token.type === parser$94.Token.Delimiter && rest$352[0].token.value === '()' && rest$352[1] && rest$352[1].token.type === parser$94.Token.Delimiter && rest$352[1].token.value === '{}') {
                    rest$352[0].token.inner = rest$352[0].expose().token.inner;
                    rest$352[1].token.inner = rest$352[1].expose().token.inner;
                    return step$350(CatchClause$211.create(head$351, rest$352[0], rest$352[1]), rest$352.slice(2));
                } else if (head$351.token.type === parser$94.Token.Keyword && head$351.token.value === 'this') {
                    return step$350(ThisExpression$186.create(head$351), rest$352);
                } else if (head$351.token.type === parser$94.Token.NumericLiteral || head$351.token.type === parser$94.Token.StringLiteral || head$351.token.type === parser$94.Token.BooleanLiteral || head$351.token.type === parser$94.Token.RegexLiteral || head$351.token.type === parser$94.Token.NullLiteral) {
                    return step$350(Lit$187.create(head$351), rest$352);
                } else if (head$351.token.type === parser$94.Token.Identifier) {
                    return step$350(Id$199.create(head$351), rest$352);
                } else if (head$351.token.type === parser$94.Token.Punctuator) {
                    return step$350(Punc$197.create(head$351), rest$352);
                } else if (head$351.token.type === parser$94.Token.Keyword && head$351.token.value === 'with') {
                    throwError$158('with is not supported in sweet.js');
                } else if (head$351.token.type === parser$94.Token.Keyword) {
                    return step$350(Keyword$196.create(head$351), rest$352);
                } else if (head$351.token.type === parser$94.Token.Delimiter) {
                    return step$350(Delimiter$198.create(head$351.expose()), rest$352);
                } else if (head$351.token.type === parser$94.Token.EOF) {
                    parser$94.assert(rest$352.length === 0, 'nothing should be after an EOF');
                    return step$350(EOF$182.create(head$351), []);
                } else {
                    parser$94.assert(false, 'not implemented');
                }
            }
            return {
                result: head$351,
                rest: rest$352
            };
        }
        return step$350(toks$348[0], toks$348.slice(1));
    }
    function get_expression$217(stx$411, env$412) {
        var res$413 = enforest$216(stx$411, env$412);
        if (!res$413.result.hasPrototype(Expr$184)) {
            return {
                result: null,
                rest: stx$411
            };
        }
        return res$413;
    }
    function applyMarkToPatternEnv$218(newMark$414, env$415) {
        function dfs$416(match$417) {
            if (match$417.level === 0) {
                match$417.match = _$93.map(match$417.match, function (stx$418) {
                    return stx$418.mark(newMark$414);
                });
            } else {
                _$93.each(match$417.match, function (match$419) {
                    dfs$416(match$419);
                });
            }
        }
        _$93.keys(env$415).forEach(function (key$420) {
            dfs$416(env$415[key$420]);
        });
    }
    function loadMacroDef$219(mac$421, env$422, defscope$423, templateMap$424) {
        var body$425 = mac$421.body;
        if (!(body$425[0] && body$425[0].token.type === parser$94.Token.Keyword && body$425[0].token.value === 'function')) {
            throwError$158('Primitive macro form must contain a function for the macro body');
        }
        var stub$426 = parser$94.read('()');
        stub$426[0].token.inner = body$425;
        var expanded$427 = expand$223(stub$426, env$422, defscope$423, templateMap$424);
        expanded$427 = expanded$427[0].destruct().concat(expanded$427[1].eof);
        var flattend$428 = flatten$225(expanded$427);
        var bodyCode$429 = codegen$97.generate(parser$94.parse(flattend$428));
        var macroFn$430 = scopedEval$159(bodyCode$429, {
                makeValue: syn$95.makeValue,
                makeRegex: syn$95.makeRegex,
                makeIdent: syn$95.makeIdent,
                makeKeyword: syn$95.makeKeyword,
                makePunc: syn$95.makePunc,
                makeDelim: syn$95.makeDelim,
                unwrapSyntax: syn$95.unwrapSyntax,
                fresh: fresh$177,
                _: _$93,
                parser: parser$94,
                patternModule: patternModule$99,
                getTemplate: function (id$431) {
                    return templateMap$424.get(id$431);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$218,
                mergeMatches: function (newMatch$432, oldMatch$433) {
                    newMatch$432.patternEnv = _$93.extend({}, oldMatch$433.patternEnv, newMatch$432.patternEnv);
                    return newMatch$432;
                }
            });
        return macroFn$430;
    }
    function expandToTermTree$220(stx$434, env$435, defscope$436, templateMap$437) {
        parser$94.assert(env$435, 'environment map is required');
        if (stx$434.length === 0) {
            return {
                terms: [],
                env: env$435
            };
        }
        parser$94.assert(stx$434[0].token, 'expecting a syntax object');
        var f$438 = enforest$216(stx$434, env$435);
        var head$439 = f$438.result;
        var rest$440 = f$438.rest;
        if (head$439.hasPrototype(Macro$203)) {
            var macroDefinition$442 = loadMacroDef$219(head$439, env$435, defscope$436, templateMap$437);
            addToDefinitionCtx$221([head$439.name], defscope$436, false);
            env$435.set(resolve$171(head$439.name), {fn: macroDefinition$442});
            return expandToTermTree$220(rest$440, env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(LetMacro$202)) {
            var macroDefinition$442 = loadMacroDef$219(head$439, env$435, defscope$436, templateMap$437);
            var freshName$443 = fresh$177();
            var renamedName$444 = head$439.name.rename(head$439.name, freshName$443);
            rest$440 = _$93.map(rest$440, function (stx$445) {
                return stx$445.rename(head$439.name, freshName$443);
            });
            head$439.name = renamedName$444;
            env$435.set(resolve$171(head$439.name), {fn: macroDefinition$442});
            return expandToTermTree$220(rest$440, env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(NamedFun$200)) {
            addToDefinitionCtx$221([head$439.name], defscope$436, true);
        }
        if (head$439.hasPrototype(Id$199) && head$439.id.token.value === '#quoteSyntax' && rest$440[0] && rest$440[0].token.value === '{}') {
            var tempId$446 = fresh$177();
            templateMap$437.set(tempId$446, rest$440[0].token.inner);
            return expandToTermTree$220([
                syn$95.makeIdent('getTemplate', head$439.id),
                syn$95.makeDelim('()', [syn$95.makeValue(tempId$446, head$439.id)])
            ].concat(rest$440.slice(1)), env$435, defscope$436, templateMap$437);
        }
        if (head$439.hasPrototype(VariableStatement$210)) {
            addToDefinitionCtx$221(_$93.map(head$439.decls, function (decl$447) {
                return decl$447.ident;
            }), defscope$436, true);
        }
        if (head$439.hasPrototype(Block$189) && head$439.body.hasPrototype(Delimiter$198)) {
            head$439.body.delim.token.inner.forEach(function (term$448) {
                if (term$448.hasPrototype(VariableStatement$210)) {
                    addToDefinitionCtx$221(_$93.map(term$448.decls, function (decl$449) {
                        return decl$449.ident;
                    }), defscope$436, true);
                }
            });
        }
        if (head$439.hasPrototype(Delimiter$198)) {
            head$439.delim.token.inner.forEach(function (term$450) {
                if (term$450.hasPrototype(VariableStatement$210)) {
                    addToDefinitionCtx$221(_$93.map(term$450.decls, function (decl$451) {
                        return decl$451.ident;
                    }), defscope$436, true);
                }
            });
        }
        var trees$441 = expandToTermTree$220(rest$440, env$435, defscope$436, templateMap$437);
        return {
            terms: [head$439].concat(trees$441.terms),
            env: trees$441.env
        };
    }
    function addToDefinitionCtx$221(idents$452, defscope$453, skipRep$454) {
        parser$94.assert(idents$452 && idents$452.length > 0, 'expecting some variable identifiers');
        skipRep$454 = skipRep$454 || false;
        _$93.each(idents$452, function (id$455) {
            var skip$456 = false;
            if (skipRep$454) {
                var declRepeat$457 = _$93.find(defscope$453, function (def$458) {
                        return def$458.id.token.value === id$455.token.value && arraysEqual$172(marksof$170(def$458.id.context), marksof$170(id$455.context));
                    });
                skip$456 = typeof declRepeat$457 !== 'undefined';
            }
            if (!skip$456) {
                var name$459 = fresh$177();
                defscope$453.push({
                    id: id$455,
                    name: name$459
                });
            }
        });
    }
    function expandTermTreeToFinal$222(term$460, env$461, defscope$462, templateMap$463) {
        parser$94.assert(env$461, 'environment map is required');
        if (term$460.hasPrototype(ArrayLiteral$190)) {
            term$460.array.delim.token.inner = expand$223(term$460.array.delim.token.inner, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(Block$189)) {
            term$460.body.delim.token.inner = expand$223(term$460.body.delim.token.inner, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(ParenExpression$191)) {
            term$460.expr.delim.token.inner = expand$223(term$460.expr.delim.token.inner, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(Call$206)) {
            term$460.fun = expandTermTreeToFinal$222(term$460.fun, env$461, defscope$462, templateMap$463);
            term$460.args = _$93.map(term$460.args, function (arg$464) {
                return expandTermTreeToFinal$222(arg$464, env$461, defscope$462, templateMap$463);
            });
            return term$460;
        } else if (term$460.hasPrototype(UnaryOp$192)) {
            term$460.expr = expandTermTreeToFinal$222(term$460.expr, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(BinOp$194)) {
            term$460.left = expandTermTreeToFinal$222(term$460.left, env$461, defscope$462, templateMap$463);
            term$460.right = expandTermTreeToFinal$222(term$460.right, env$461, defscope$462);
            return term$460;
        } else if (term$460.hasPrototype(ObjGet$208)) {
            term$460.right.delim.token.inner = expand$223(term$460.right.delim.token.inner, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(ObjDotGet$207)) {
            term$460.left = expandTermTreeToFinal$222(term$460.left, env$461, defscope$462, templateMap$463);
            term$460.right = expandTermTreeToFinal$222(term$460.right, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(VariableDeclaration$209)) {
            if (term$460.init) {
                term$460.init = expandTermTreeToFinal$222(term$460.init, env$461, defscope$462, templateMap$463);
            }
            return term$460;
        } else if (term$460.hasPrototype(VariableStatement$210)) {
            term$460.decls = _$93.map(term$460.decls, function (decl$465) {
                return expandTermTreeToFinal$222(decl$465, env$461, defscope$462, templateMap$463);
            });
            return term$460;
        } else if (term$460.hasPrototype(Delimiter$198)) {
            term$460.delim.token.inner = expand$223(term$460.delim.token.inner, env$461, defscope$462, templateMap$463);
            return term$460;
        } else if (term$460.hasPrototype(NamedFun$200) || term$460.hasPrototype(AnonFun$201) || term$460.hasPrototype(CatchClause$211)) {
            var newDef$466 = [];
            var params$467 = term$460.params.addDefCtx(newDef$466);
            var bodies$468 = term$460.body.addDefCtx(newDef$466);
            var paramNames$469 = _$93.map(getParamIdentifiers$180(params$467), function (param$476) {
                    var freshName$477 = fresh$177();
                    return {
                        freshName: freshName$477,
                        originalParam: param$476,
                        renamedParam: param$476.rename(param$476, freshName$477)
                    };
                });
            var renamedBody$470 = _$93.reduce(paramNames$469, function (accBody$478, p$479) {
                    return accBody$478.rename(p$479.originalParam, p$479.freshName);
                }, bodies$468);
            renamedBody$470 = renamedBody$470.expose();
            var bodyTerms$471 = expand$223([renamedBody$470], env$461, newDef$466, templateMap$463);
            parser$94.assert(bodyTerms$471.length === 1 && bodyTerms$471[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$472 = _$93.map(paramNames$469, function (p$480) {
                    return p$480.renamedParam;
                });
            var flatArgs$473 = wrapDelim$179(joinSyntax$178(renamedParams$472, ','), term$460.params);
            var expandedArgs$474 = expand$223([flatArgs$473], env$461, newDef$466, templateMap$463);
            parser$94.assert(expandedArgs$474.length === 1, 'should only get back one result');
            term$460.params = expandedArgs$474[0];
            var flattenedBody$475 = bodyTerms$471[0].destruct();
            flattenedBody$475 = _$93.reduce(newDef$466, function (acc$481, def$482) {
                return acc$481.rename(def$482.id, def$482.name);
            }, flattenedBody$475[0]);
            term$460.body = flattenedBody$475;
            return term$460;
        }
        return term$460;
    }
    function expand$223(stx$483, env$484, defscope$485, templateMap$486) {
        env$484 = env$484 || new Map();
        templateMap$486 = templateMap$486 || new Map();
        var trees$487 = expandToTermTree$220(stx$483, env$484, defscope$485, templateMap$486);
        return _$93.map(trees$487.terms, function (term$488) {
            return expandTermTreeToFinal$222(term$488, trees$487.env, defscope$485, templateMap$486);
        });
    }
    function expandTopLevel$224(stx$489) {
        var funn$490 = syntaxFromToken$167({
                value: 'function',
                type: parser$94.Token.Keyword
            });
        var params$491 = syntaxFromToken$167({
                value: '()',
                type: parser$94.Token.Delimiter,
                inner: []
            });
        var body$492 = syntaxFromToken$167({
                value: '{}',
                type: parser$94.Token.Delimiter,
                inner: stx$489
            });
        var res$493 = expand$223([
                funn$490,
                params$491,
                body$492
            ]);
        res$493 = flatten$225([res$493[0].body]);
        return _$93.map(res$493.slice(1, res$493.length - 1), function (stx$494) {
            return stx$494;
        });
    }
    function flatten$225(stx$495) {
        return _$93.reduce(stx$495, function (acc$496, stx$497) {
            if (stx$497.token.type === parser$94.Token.Delimiter) {
                var exposed$498 = stx$497.expose();
                var openParen$499 = syntaxFromToken$167({
                        type: parser$94.Token.Punctuator,
                        value: stx$497.token.value[0],
                        range: stx$497.token.startRange,
                        lineNumber: stx$497.token.startLineNumber,
                        lineStart: stx$497.token.startLineStart
                    }, exposed$498.context);
                var closeParen$500 = syntaxFromToken$167({
                        type: parser$94.Token.Punctuator,
                        value: stx$497.token.value[1],
                        range: stx$497.token.endRange,
                        lineNumber: stx$497.token.endLineNumber,
                        lineStart: stx$497.token.endLineStart
                    }, exposed$498.context);
                return acc$496.concat(openParen$499).concat(flatten$225(exposed$498.token.inner)).concat(closeParen$500);
            }
            return acc$496.concat(stx$497);
        }, []);
    }
    exports$92.enforest = enforest$216;
    exports$92.expand = expandTopLevel$224;
    exports$92.resolve = resolve$171;
    exports$92.get_expression = get_expression$217;
    exports$92.Expr = Expr$184;
    exports$92.VariableStatement = VariableStatement$210;
    exports$92.tokensToSyntax = syn$95.tokensToSyntax;
}));