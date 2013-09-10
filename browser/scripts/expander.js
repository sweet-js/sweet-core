(function (root$91, factory$92) {
    if (typeof exports === 'object') {
        factory$92(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'scopedEval',
            'patterns'
        ], factory$92);
    }
}(this, function (exports$93, _$94, parser$95, syn$96, es6$97, se$98, patternModule$99, gen$100) {
    'use strict';
    var codegen$101 = gen$100 || escodegen;
    exports$93._test = {};
    Object.prototype.create = function () {
        var o$228 = Object.create(this);
        if (typeof o$228.construct === 'function') {
            o$228.construct.apply(o$228, arguments);
        }
        return o$228;
    };
    Object.prototype.extend = function (properties$229) {
        var result$230 = Object.create(this);
        for (var prop$231 in properties$229) {
            if (properties$229.hasOwnProperty(prop$231)) {
                result$230[prop$231] = properties$229[prop$231];
            }
        }
        return result$230;
    };
    Object.prototype.hasPrototype = function (proto$232) {
        function F$233() {
        }
        F$233.prototype = proto$232;
        return this instanceof F$233;
    };
    function throwError$160(msg$234) {
        throw new Error(msg$234);
    }
    var scopedEval$161 = se$98.scopedEval;
    var Rename$162 = syn$96.Rename;
    var Mark$163 = syn$96.Mark;
    var Var$164 = syn$96.Var;
    var Def$165 = syn$96.Def;
    var isDef$166 = syn$96.isDef;
    var isMark$167 = syn$96.isMark;
    var isRename$168 = syn$96.isRename;
    var syntaxFromToken$169 = syn$96.syntaxFromToken;
    var mkSyntax$170 = syn$96.mkSyntax;
    function remdup$171(mark$235, mlist$236) {
        if (mark$235 === _$94.first(mlist$236)) {
            return _$94.rest(mlist$236, 1);
        }
        return [mark$235].concat(mlist$236);
    }
    function marksof$172(ctx$237, stopName$238, originalName$239) {
        var mark$240, submarks$241;
        if (isMark$167(ctx$237)) {
            mark$240 = ctx$237.mark;
            submarks$241 = marksof$172(ctx$237.context, stopName$238, originalName$239);
            return remdup$171(mark$240, submarks$241);
        }
        if (isDef$166(ctx$237)) {
            return marksof$172(ctx$237.context, stopName$238, originalName$239);
        }
        if (isRename$168(ctx$237)) {
            if (stopName$238 === originalName$239 + '$' + ctx$237.name) {
                return [];
            }
            return marksof$172(ctx$237.context, stopName$238, originalName$239);
        }
        return [];
    }
    function resolve$173(stx$242) {
        return resolveCtx$177(stx$242.token.value, stx$242.context, [], []);
    }
    function arraysEqual$174(a$243, b$244) {
        if (a$243.length !== b$244.length) {
            return false;
        }
        for (var i$245 = 0; i$245 < a$243.length; i$245++) {
            if (a$243[i$245] !== b$244[i$245]) {
                return false;
            }
        }
        return true;
    }
    function renames$175(defctx$246, oldctx$247, originalName$248) {
        var acc$249 = oldctx$247;
        for (var i$250 = 0; i$250 < defctx$246.length; i$250++) {
            if (defctx$246[i$250].id.token.value === originalName$248) {
                acc$249 = Rename$162(defctx$246[i$250].id, defctx$246[i$250].name, acc$249, defctx$246);
            }
        }
        return acc$249;
    }
    function unionEl$176(arr$251, el$252) {
        if (arr$251.indexOf(el$252) === -1) {
            var res$253 = arr$251.slice(0);
            res$253.push(el$252);
            return res$253;
        }
        return arr$251;
    }
    function resolveCtx$177(originalName$254, ctx$255, stop_spine$256, stop_branch$257) {
        if (isMark$167(ctx$255)) {
            return resolveCtx$177(originalName$254, ctx$255.context, stop_spine$256, stop_branch$257);
        }
        if (isDef$166(ctx$255)) {
            if (stop_spine$256.indexOf(ctx$255.defctx) !== -1) {
                return resolveCtx$177(originalName$254, ctx$255.context, stop_spine$256, stop_branch$257);
            } else {
                return resolveCtx$177(originalName$254, renames$175(ctx$255.defctx, ctx$255.context, originalName$254), stop_spine$256, unionEl$176(stop_branch$257, ctx$255.defctx));
            }
        }
        if (isRename$168(ctx$255)) {
            if (originalName$254 === ctx$255.id.token.value) {
                var idName$258 = resolveCtx$177(ctx$255.id.token.value, ctx$255.id.context, stop_branch$257, stop_branch$257);
                var subName$259 = resolveCtx$177(originalName$254, ctx$255.context, unionEl$176(stop_spine$256, ctx$255.def), stop_branch$257);
                if (idName$258 === subName$259) {
                    var idMarks$260 = marksof$172(ctx$255.id.context, originalName$254 + '$' + ctx$255.name, originalName$254);
                    var subMarks$261 = marksof$172(ctx$255.context, originalName$254 + '$' + ctx$255.name, originalName$254);
                    if (arraysEqual$174(idMarks$260, subMarks$261)) {
                        return originalName$254 + '$' + ctx$255.name;
                    }
                }
            }
            return resolveCtx$177(originalName$254, ctx$255.context, unionEl$176(stop_spine$256, ctx$255.def), stop_branch$257);
        }
        return originalName$254;
    }
    var nextFresh$178 = 0;
    function fresh$179() {
        return nextFresh$178++;
    }
    ;
    function joinSyntax$180(tojoin$262, punc$263) {
        if (tojoin$262.length === 0) {
            return [];
        }
        if (punc$263 === ' ') {
            return tojoin$262;
        }
        return _$94.reduce(_$94.rest(tojoin$262, 1), function (acc$264, join$265) {
            return acc$264.concat(mkSyntax$170(punc$263, parser$95.Token.Punctuator, join$265), join$265);
        }, [_$94.first(tojoin$262)]);
    }
    function wrapDelim$181(towrap$266, delimSyntax$267) {
        parser$95.assert(delimSyntax$267.token.type === parser$95.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$169({
            type: parser$95.Token.Delimiter,
            value: delimSyntax$267.token.value,
            inner: towrap$266,
            range: delimSyntax$267.token.range,
            startLineNumber: delimSyntax$267.token.startLineNumber,
            lineStart: delimSyntax$267.token.lineStart
        }, delimSyntax$267.context);
    }
    function getParamIdentifiers$182(argSyntax$268) {
        parser$95.assert(argSyntax$268.token.type === parser$95.Token.Delimiter, 'expecting delimiter for function params');
        return _$94.filter(argSyntax$268.token.inner, function (stx$269) {
            return stx$269.token.value !== ',';
        });
    }
    var TermTree$183 = {
            destruct: function () {
                return _$94.reduce(this.properties, _$94.bind(function (acc$270, prop$271) {
                    if (this[prop$271] && this[prop$271].hasPrototype(TermTree$183)) {
                        return acc$270.concat(this[prop$271].destruct());
                    } else if (this[prop$271] && this[prop$271].token && this[prop$271].token.inner) {
                        this[prop$271].token.inner = _$94.reduce(this[prop$271].token.inner, function (acc$272, t$273) {
                            if (t$273.hasPrototype(TermTree$183)) {
                                return acc$272.concat(t$273.destruct());
                            }
                            return acc$272.concat(t$273);
                        }, []);
                        return acc$270.concat(this[prop$271]);
                    } else if (this[prop$271]) {
                        return acc$270.concat(this[prop$271]);
                    } else {
                        return acc$270;
                    }
                }, this), []);
            }
        };
    var EOF$184 = TermTree$183.extend({
            properties: ['eof'],
            construct: function (e$274) {
                this.eof = e$274;
            }
        });
    var Statement$185 = TermTree$183.extend({
            construct: function () {
            }
        });
    var Expr$186 = TermTree$183.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$187 = Expr$186.extend({
            construct: function () {
            }
        });
    var ThisExpression$188 = PrimaryExpression$187.extend({
            properties: ['this'],
            construct: function (that$275) {
                this.this = that$275;
            }
        });
    var Lit$189 = PrimaryExpression$187.extend({
            properties: ['lit'],
            construct: function (l$276) {
                this.lit = l$276;
            }
        });
    exports$93._test.PropertyAssignment = PropertyAssignment$190;
    var PropertyAssignment$190 = TermTree$183.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$277, assignment$278) {
                this.propName = propName$277;
                this.assignment = assignment$278;
            }
        });
    var Block$191 = PrimaryExpression$187.extend({
            properties: ['body'],
            construct: function (body$279) {
                this.body = body$279;
            }
        });
    var ArrayLiteral$192 = PrimaryExpression$187.extend({
            properties: ['array'],
            construct: function (ar$280) {
                this.array = ar$280;
            }
        });
    var ParenExpression$193 = PrimaryExpression$187.extend({
            properties: ['expr'],
            construct: function (expr$281) {
                this.expr = expr$281;
            }
        });
    var UnaryOp$194 = Expr$186.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$282, expr$283) {
                this.op = op$282;
                this.expr = expr$283;
            }
        });
    var PostfixOp$195 = Expr$186.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$284, op$285) {
                this.expr = expr$284;
                this.op = op$285;
            }
        });
    var BinOp$196 = Expr$186.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$286, left$287, right$288) {
                this.op = op$286;
                this.left = left$287;
                this.right = right$288;
            }
        });
    var ConditionalExpression$197 = Expr$186.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$289, question$290, tru$291, colon$292, fls$293) {
                this.cond = cond$289;
                this.question = question$290;
                this.tru = tru$291;
                this.colon = colon$292;
                this.fls = fls$293;
            }
        });
    var Keyword$198 = TermTree$183.extend({
            properties: ['keyword'],
            construct: function (k$294) {
                this.keyword = k$294;
            }
        });
    var Punc$199 = TermTree$183.extend({
            properties: ['punc'],
            construct: function (p$295) {
                this.punc = p$295;
            }
        });
    var Delimiter$200 = TermTree$183.extend({
            properties: ['delim'],
            construct: function (d$296) {
                this.delim = d$296;
            }
        });
    var Id$201 = PrimaryExpression$187.extend({
            properties: ['id'],
            construct: function (id$297) {
                this.id = id$297;
            }
        });
    var NamedFun$202 = Expr$186.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$298, name$299, params$300, body$301) {
                this.keyword = keyword$298;
                this.name = name$299;
                this.params = params$300;
                this.body = body$301;
            }
        });
    var AnonFun$203 = Expr$186.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$302, params$303, body$304) {
                this.keyword = keyword$302;
                this.params = params$303;
                this.body = body$304;
            }
        });
    var LetMacro$204 = TermTree$183.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$305, body$306) {
                this.name = name$305;
                this.body = body$306;
            }
        });
    var Macro$205 = TermTree$183.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$307, body$308) {
                this.name = name$307;
                this.body = body$308;
            }
        });
    var AnonMacro$206 = TermTree$183.extend({
            properties: ['body'],
            construct: function (body$309) {
                this.body = body$309;
            }
        });
    var Const$207 = Expr$186.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$310, call$311) {
                this.newterm = newterm$310;
                this.call = call$311;
            }
        });
    var Call$208 = Expr$186.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$95.assert(this.fun.hasPrototype(TermTree$183), 'expecting a term tree in destruct of call');
                var that$312 = this;
                this.delim = syntaxFromToken$169(_$94.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$94.reduce(this.args, function (acc$313, term$314) {
                    parser$95.assert(term$314 && term$314.hasPrototype(TermTree$183), 'expecting term trees in destruct of Call');
                    var dst$315 = acc$313.concat(term$314.destruct());
                    if (that$312.commas.length > 0) {
                        dst$315 = dst$315.concat(that$312.commas.shift());
                    }
                    return dst$315;
                }, []);
                return this.fun.destruct().concat(Delimiter$200.create(this.delim).destruct());
            },
            construct: function (funn$316, args$317, delim$318, commas$319) {
                parser$95.assert(Array.isArray(args$317), 'requires an array of arguments terms');
                this.fun = funn$316;
                this.args = args$317;
                this.delim = delim$318;
                this.commas = commas$319;
            }
        });
    var ObjDotGet$209 = Expr$186.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$320, dot$321, right$322) {
                this.left = left$320;
                this.dot = dot$321;
                this.right = right$322;
            }
        });
    var ObjGet$210 = Expr$186.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$323, right$324) {
                this.left = left$323;
                this.right = right$324;
            }
        });
    var VariableDeclaration$211 = TermTree$183.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$325, eqstx$326, init$327, comma$328) {
                this.ident = ident$325;
                this.eqstx = eqstx$326;
                this.init = init$327;
                this.comma = comma$328;
            }
        });
    var VariableStatement$212 = Statement$185.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$94.reduce(this.decls, function (acc$329, decl$330) {
                    return acc$329.concat(decl$330.destruct());
                }, []));
            },
            construct: function (varkw$331, decls$332) {
                parser$95.assert(Array.isArray(decls$332), 'decls must be an array');
                this.varkw = varkw$331;
                this.decls = decls$332;
            }
        });
    var CatchClause$213 = TermTree$183.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$333, params$334, body$335) {
                this.catchkw = catchkw$333;
                this.params = params$334;
                this.body = body$335;
            }
        });
    var Empty$214 = TermTree$183.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$215(stx$336) {
        var staticOperators$337 = [
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
        return _$94.contains(staticOperators$337, stx$336.token.value);
    }
    function stxIsBinOp$216(stx$338) {
        var staticOperators$339 = [
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
        return _$94.contains(staticOperators$339, stx$338.token.value);
    }
    function enforestVarStatement$217(stx$340, env$341) {
        var decls$342 = [];
        var res$343 = enforest$218(stx$340, env$341);
        var result$344 = res$343.result;
        var rest$345 = res$343.rest;
        if (rest$345[0]) {
            var nextRes$346 = enforest$218(rest$345, env$341);
            if (nextRes$346.result.hasPrototype(Punc$199) && nextRes$346.result.punc.token.value === '=') {
                var initializerRes$347 = enforest$218(nextRes$346.rest, env$341);
                if (initializerRes$347.rest[0]) {
                    var restRes$348 = enforest$218(initializerRes$347.rest, env$341);
                    if (restRes$348.result.hasPrototype(Punc$199) && restRes$348.result.punc.token.value === ',') {
                        decls$342.push(VariableDeclaration$211.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result, restRes$348.result.punc));
                        var subRes$349 = enforestVarStatement$217(restRes$348.rest, env$341);
                        decls$342 = decls$342.concat(subRes$349.result);
                        rest$345 = subRes$349.rest;
                    } else {
                        decls$342.push(VariableDeclaration$211.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result));
                        rest$345 = initializerRes$347.rest;
                    }
                } else {
                    decls$342.push(VariableDeclaration$211.create(result$344.id, nextRes$346.result.punc, initializerRes$347.result));
                }
            } else if (nextRes$346.result.hasPrototype(Punc$199) && nextRes$346.result.punc.token.value === ',') {
                decls$342.push(VariableDeclaration$211.create(result$344.id, null, null, nextRes$346.result.punc));
                var subRes$349 = enforestVarStatement$217(nextRes$346.rest, env$341);
                decls$342 = decls$342.concat(subRes$349.result);
                rest$345 = subRes$349.rest;
            } else {
                if (result$344.hasPrototype(Id$201)) {
                    decls$342.push(VariableDeclaration$211.create(result$344.id));
                } else {
                    throwError$160('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$344.hasPrototype(Id$201)) {
                decls$342.push(VariableDeclaration$211.create(result$344.id));
            } else if (result$344.hasPrototype(BinOp$196) && result$344.op.token.value === 'in') {
                decls$342.push(VariableDeclaration$211.create(result$344.left.id, result$344.op, result$344.right));
            } else {
                throwError$160('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$342,
            rest: rest$345
        };
    }
    function enforest$218(toks$350, env$351) {
        env$351 = env$351 || new Map();
        parser$95.assert(toks$350.length > 0, 'enforest assumes there are tokens to work with');
        function step$352(head$353, rest$354) {
            var innerTokens$355;
            parser$95.assert(Array.isArray(rest$354), 'result must at least be an empty array');
            if (head$353.hasPrototype(TermTree$183)) {
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var keyword$361 = head$353.keyword;
                var delim$363 = head$353.delim;
                var emp$358 = head$353.emp;
                var punc$366 = head$353.punc;
                var keyword$361 = head$353.keyword;
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var emp$358 = head$353.emp;
                var delim$363 = head$353.delim;
                var delim$363 = head$353.delim;
                var keyword$361 = head$353.keyword;
                var keyword$361 = head$353.keyword;
                if (head$353.hasPrototype(Expr$186) && (rest$354[0] && rest$354[0].token.type === parser$95.Token.Delimiter && rest$354[0].token.value === '()')) {
                    var argRes$391, enforestedArgs$392 = [], commas$393 = [];
                    rest$354[0].expose();
                    innerTokens$355 = rest$354[0].token.inner;
                    while (innerTokens$355.length > 0) {
                        argRes$391 = enforest$218(innerTokens$355, env$351);
                        enforestedArgs$392.push(argRes$391.result);
                        innerTokens$355 = argRes$391.rest;
                        if (innerTokens$355[0] && innerTokens$355[0].token.value === ',') {
                            commas$393.push(innerTokens$355[0]);
                            innerTokens$355 = innerTokens$355.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$394 = _$94.all(enforestedArgs$392, function (argTerm$395) {
                            return argTerm$395.hasPrototype(Expr$186);
                        });
                    if (innerTokens$355.length === 0 && argsAreExprs$394) {
                        return step$352(Call$208.create(head$353, enforestedArgs$392, rest$354[0], commas$393), rest$354.slice(1));
                    }
                } else if (head$353.hasPrototype(Expr$186) && (rest$354[0] && rest$354[0].token.value === '?')) {
                    var question$396 = rest$354[0];
                    var condRes$397 = enforest$218(rest$354.slice(1), env$351);
                    var truExpr$398 = condRes$397.result;
                    var right$399 = condRes$397.rest;
                    if (truExpr$398.hasPrototype(Expr$186) && right$399[0] && right$399[0].token.value === ':') {
                        var colon$400 = right$399[0];
                        var flsRes$401 = enforest$218(right$399.slice(1), env$351);
                        var flsExpr$402 = flsRes$401.result;
                        if (flsExpr$402.hasPrototype(Expr$186)) {
                            return step$352(ConditionalExpression$197.create(head$353, question$396, truExpr$398, colon$400, flsExpr$402), flsRes$401.rest);
                        }
                    }
                } else if (head$353.hasPrototype(Keyword$198) && (keyword$361.token.value === 'new' && rest$354[0])) {
                    var newCallRes$403 = enforest$218(rest$354, env$351);
                    if (newCallRes$403.result.hasPrototype(Call$208)) {
                        return step$352(Const$207.create(head$353, newCallRes$403.result), newCallRes$403.rest);
                    }
                } else if (head$353.hasPrototype(Delimiter$200) && delim$363.token.value === '()') {
                    innerTokens$355 = delim$363.token.inner;
                    if (innerTokens$355.length === 0) {
                        return step$352(ParenExpression$193.create(head$353), rest$354);
                    } else {
                        var innerTerm$404 = get_expression$219(innerTokens$355, env$351);
                        if (innerTerm$404.result && innerTerm$404.result.hasPrototype(Expr$186)) {
                            return step$352(ParenExpression$193.create(head$353), rest$354);
                        }
                    }
                } else if (head$353.hasPrototype(TermTree$183) && (rest$354[0] && rest$354[1] && stxIsBinOp$216(rest$354[0]))) {
                    var op$405 = rest$354[0];
                    var left$406 = head$353;
                    var bopRes$407 = enforest$218(rest$354.slice(1), env$351);
                    var right$399 = bopRes$407.result;
                    if (right$399.hasPrototype(Expr$186)) {
                        return step$352(BinOp$196.create(op$405, left$406, right$399), bopRes$407.rest);
                    }
                } else if (head$353.hasPrototype(Punc$199) && stxIsUnaryOp$215(punc$366)) {
                    var unopRes$408 = enforest$218(rest$354, env$351);
                    if (unopRes$408.result.hasPrototype(Expr$186)) {
                        return step$352(UnaryOp$194.create(punc$366, unopRes$408.result), unopRes$408.rest);
                    }
                } else if (head$353.hasPrototype(Keyword$198) && stxIsUnaryOp$215(keyword$361)) {
                    var unopRes$408 = enforest$218(rest$354, env$351);
                    if (unopRes$408.result.hasPrototype(Expr$186)) {
                        return step$352(UnaryOp$194.create(keyword$361, unopRes$408.result), unopRes$408.rest);
                    }
                } else if (head$353.hasPrototype(Expr$186) && (rest$354[0] && (rest$354[0].token.value === '++' || rest$354[0].token.value === '--'))) {
                    return step$352(PostfixOp$195.create(head$353, rest$354[0]), rest$354.slice(1));
                } else if (head$353.hasPrototype(Expr$186) && (rest$354[0] && rest$354[0].token.value === '[]')) {
                    return step$352(ObjGet$210.create(head$353, Delimiter$200.create(rest$354[0].expose())), rest$354.slice(1));
                } else if (head$353.hasPrototype(Expr$186) && (rest$354[0] && rest$354[0].token.value === '.' && rest$354[1] && rest$354[1].token.type === parser$95.Token.Identifier)) {
                    return step$352(ObjDotGet$209.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.hasPrototype(Delimiter$200) && delim$363.token.value === '[]') {
                    return step$352(ArrayLiteral$192.create(head$353), rest$354);
                } else if (head$353.hasPrototype(Delimiter$200) && head$353.delim.token.value === '{}') {
                    return step$352(Block$191.create(head$353), rest$354);
                } else if (head$353.hasPrototype(Keyword$198) && (keyword$361.token.value === 'let' && (rest$354[0] && rest$354[0].token.type === parser$95.Token.Identifier || rest$354[0] && rest$354[0].token.type === parser$95.Token.Keyword) && rest$354[1] && rest$354[1].token.value === '=' && rest$354[2] && rest$354[2].token.value === 'macro')) {
                    var mac$409 = enforest$218(rest$354.slice(2), env$351);
                    if (!mac$409.result.hasPrototype(AnonMacro$206)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$352(LetMacro$204.create(rest$354[0], mac$409.result.body), mac$409.rest);
                } else if (head$353.hasPrototype(Keyword$198) && (keyword$361.token.value === 'var' && rest$354[0])) {
                    var vsRes$410 = enforestVarStatement$217(rest$354, env$351);
                    if (vsRes$410) {
                        return step$352(VariableStatement$212.create(head$353, vsRes$410.result), vsRes$410.rest);
                    }
                }
            } else {
                parser$95.assert(head$353 && head$353.token, 'assuming head is a syntax object');
                if ((head$353.token.type === parser$95.Token.Identifier || head$353.token.type === parser$95.Token.Keyword) && env$351.has(resolve$173(head$353))) {
                    var transformer$411 = env$351.get(resolve$173(head$353)).fn;
                    var rt$412 = transformer$411([head$353].concat(rest$354), env$351);
                    if (!Array.isArray(rt$412.result)) {
                        throwError$160('Macro transformer must return a result array, not: ' + rt$412.result);
                    }
                    if (rt$412.result.length > 0) {
                        return step$352(rt$412.result[0], rt$412.result.slice(1).concat(rt$412.rest));
                    } else {
                        return step$352(Empty$214.create(), rt$412.rest);
                    }
                } else if (head$353.token.type === parser$95.Token.Identifier && head$353.token.value === 'macro' && rest$354[0] && rest$354[0].token.value === '{}') {
                    return step$352(AnonMacro$206.create(rest$354[0].expose().token.inner), rest$354.slice(1));
                } else if (head$353.token.type === parser$95.Token.Identifier && head$353.token.value === 'macro' && rest$354[0] && (rest$354[0].token.type === parser$95.Token.Identifier || rest$354[0].token.type === parser$95.Token.Keyword) && rest$354[1] && rest$354[1].token.type === parser$95.Token.Delimiter && rest$354[1].token.value === '{}') {
                    return step$352(Macro$205.create(rest$354[0], rest$354[1].expose().token.inner), rest$354.slice(2));
                } else if (head$353.token.type === parser$95.Token.Keyword && head$353.token.value === 'function' && rest$354[0] && rest$354[0].token.type === parser$95.Token.Identifier && rest$354[1] && rest$354[1].token.type === parser$95.Token.Delimiter && rest$354[1].token.value === '()' && rest$354[2] && rest$354[2].token.type === parser$95.Token.Delimiter && rest$354[2].token.value === '{}') {
                    rest$354[1].token.inner = rest$354[1].expose().token.inner;
                    rest$354[2].token.inner = rest$354[2].expose().token.inner;
                    return step$352(NamedFun$202.create(head$353, rest$354[0], rest$354[1], rest$354[2]), rest$354.slice(3));
                } else if (head$353.token.type === parser$95.Token.Keyword && head$353.token.value === 'function' && rest$354[0] && rest$354[0].token.type === parser$95.Token.Delimiter && rest$354[0].token.value === '()' && rest$354[1] && rest$354[1].token.type === parser$95.Token.Delimiter && rest$354[1].token.value === '{}') {
                    rest$354[0].token.inner = rest$354[0].expose().token.inner;
                    rest$354[1].token.inner = rest$354[1].expose().token.inner;
                    return step$352(AnonFun$203.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.token.type === parser$95.Token.Keyword && head$353.token.value === 'catch' && rest$354[0] && rest$354[0].token.type === parser$95.Token.Delimiter && rest$354[0].token.value === '()' && rest$354[1] && rest$354[1].token.type === parser$95.Token.Delimiter && rest$354[1].token.value === '{}') {
                    rest$354[0].token.inner = rest$354[0].expose().token.inner;
                    rest$354[1].token.inner = rest$354[1].expose().token.inner;
                    return step$352(CatchClause$213.create(head$353, rest$354[0], rest$354[1]), rest$354.slice(2));
                } else if (head$353.token.type === parser$95.Token.Keyword && head$353.token.value === 'this') {
                    return step$352(ThisExpression$188.create(head$353), rest$354);
                } else if (head$353.token.type === parser$95.Token.NumericLiteral || head$353.token.type === parser$95.Token.StringLiteral || head$353.token.type === parser$95.Token.BooleanLiteral || head$353.token.type === parser$95.Token.RegexLiteral || head$353.token.type === parser$95.Token.NullLiteral) {
                    return step$352(Lit$189.create(head$353), rest$354);
                } else if (head$353.token.type === parser$95.Token.Identifier) {
                    return step$352(Id$201.create(head$353), rest$354);
                } else if (head$353.token.type === parser$95.Token.Punctuator) {
                    return step$352(Punc$199.create(head$353), rest$354);
                } else if (head$353.token.type === parser$95.Token.Keyword && head$353.token.value === 'with') {
                    throwError$160('with is not supported in sweet.js');
                } else if (head$353.token.type === parser$95.Token.Keyword) {
                    return step$352(Keyword$198.create(head$353), rest$354);
                } else if (head$353.token.type === parser$95.Token.Delimiter) {
                    return step$352(Delimiter$200.create(head$353.expose()), rest$354);
                } else if (head$353.token.type === parser$95.Token.EOF) {
                    parser$95.assert(rest$354.length === 0, 'nothing should be after an EOF');
                    return step$352(EOF$184.create(head$353), []);
                } else {
                    parser$95.assert(false, 'not implemented');
                }
            }
            return {
                result: head$353,
                rest: rest$354
            };
        }
        return step$352(toks$350[0], toks$350.slice(1));
    }
    function get_expression$219(stx$413, env$414) {
        var res$415 = enforest$218(stx$413, env$414);
        if (!res$415.result.hasPrototype(Expr$186)) {
            return {
                result: null,
                rest: stx$413
            };
        }
        return res$415;
    }
    function applyMarkToPatternEnv$220(newMark$416, env$417) {
        function dfs$418(match$419) {
            if (match$419.level === 0) {
                match$419.match = _$94.map(match$419.match, function (stx$420) {
                    return stx$420.mark(newMark$416);
                });
            } else {
                _$94.each(match$419.match, function (match$421) {
                    dfs$418(match$421);
                });
            }
        }
        _$94.keys(env$417).forEach(function (key$422) {
            dfs$418(env$417[key$422]);
        });
    }
    function loadMacroDef$221(mac$423, env$424, defscope$425, templateMap$426) {
        var body$427 = mac$423.body;
        if (!(body$427[0] && body$427[0].token.type === parser$95.Token.Keyword && body$427[0].token.value === 'function')) {
            throwError$160('Primitive macro form must contain a function for the macro body');
        }
        var stub$428 = parser$95.read('()')[0];
        stub$428[0].token.inner = body$427;
        var expanded$429 = expand$225(stub$428, env$424, defscope$425, templateMap$426);
        expanded$429 = expanded$429[0].destruct().concat(expanded$429[1].eof);
        var flattend$430 = flatten$227(expanded$429);
        var bodyCode$431 = codegen$101.generate(parser$95.parse(flattend$430));
        var macroFn$432 = scopedEval$161(bodyCode$431, {
                makeValue: syn$96.makeValue,
                makeRegex: syn$96.makeRegex,
                makeIdent: syn$96.makeIdent,
                makeKeyword: syn$96.makeKeyword,
                makePunc: syn$96.makePunc,
                makeDelim: syn$96.makeDelim,
                unwrapSyntax: syn$96.unwrapSyntax,
                fresh: fresh$179,
                _: _$94,
                parser: parser$95,
                patternModule: patternModule$99,
                getTemplate: function (id$433) {
                    return templateMap$426.get(id$433);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$220,
                mergeMatches: function (newMatch$434, oldMatch$435) {
                    newMatch$434.patternEnv = _$94.extend({}, oldMatch$435.patternEnv, newMatch$434.patternEnv);
                    return newMatch$434;
                }
            });
        return macroFn$432;
    }
    function expandToTermTree$222(stx$436, env$437, defscope$438, templateMap$439) {
        parser$95.assert(env$437, 'environment map is required');
        if (stx$436.length === 0) {
            return {
                terms: [],
                env: env$437
            };
        }
        parser$95.assert(stx$436[0].token, 'expecting a syntax object');
        var f$440 = enforest$218(stx$436, env$437);
        var head$441 = f$440.result;
        var rest$442 = f$440.rest;
        if (head$441.hasPrototype(Macro$205)) {
            var macroDefinition$444 = loadMacroDef$221(head$441, env$437, defscope$438, templateMap$439);
            addToDefinitionCtx$223([head$441.name], defscope$438, false);
            env$437.set(resolve$173(head$441.name), { fn: macroDefinition$444 });
            return expandToTermTree$222(rest$442, env$437, defscope$438, templateMap$439);
        }
        if (head$441.hasPrototype(LetMacro$204)) {
            var macroDefinition$444 = loadMacroDef$221(head$441, env$437, defscope$438, templateMap$439);
            var freshName$445 = fresh$179();
            var renamedName$446 = head$441.name.rename(head$441.name, freshName$445);
            rest$442 = _$94.map(rest$442, function (stx$447) {
                return stx$447.rename(head$441.name, freshName$445);
            });
            head$441.name = renamedName$446;
            env$437.set(resolve$173(head$441.name), { fn: macroDefinition$444 });
            return expandToTermTree$222(rest$442, env$437, defscope$438, templateMap$439);
        }
        if (head$441.hasPrototype(NamedFun$202)) {
            addToDefinitionCtx$223([head$441.name], defscope$438, true);
        }
        if (head$441.hasPrototype(Id$201) && head$441.id.token.value === '#quoteSyntax' && rest$442[0] && rest$442[0].token.value === '{}') {
            var tempId$448 = fresh$179();
            templateMap$439.set(tempId$448, rest$442[0].token.inner);
            return expandToTermTree$222([
                syn$96.makeIdent('getTemplate', head$441.id),
                syn$96.makeDelim('()', [syn$96.makeValue(tempId$448, head$441.id)], head$441.id)
            ].concat(rest$442.slice(1)), env$437, defscope$438, templateMap$439);
        }
        if (head$441.hasPrototype(VariableStatement$212)) {
            addToDefinitionCtx$223(_$94.map(head$441.decls, function (decl$449) {
                return decl$449.ident;
            }), defscope$438, true);
        }
        if (head$441.hasPrototype(Block$191) && head$441.body.hasPrototype(Delimiter$200)) {
            head$441.body.delim.token.inner.forEach(function (term$450) {
                if (term$450.hasPrototype(VariableStatement$212)) {
                    addToDefinitionCtx$223(_$94.map(term$450.decls, function (decl$451) {
                        return decl$451.ident;
                    }), defscope$438, true);
                }
            });
        }
        if (head$441.hasPrototype(Delimiter$200)) {
            head$441.delim.token.inner.forEach(function (term$452) {
                if (term$452.hasPrototype(VariableStatement$212)) {
                    addToDefinitionCtx$223(_$94.map(term$452.decls, function (decl$453) {
                        return decl$453.ident;
                    }), defscope$438, true);
                }
            });
        }
        var trees$443 = expandToTermTree$222(rest$442, env$437, defscope$438, templateMap$439);
        return {
            terms: [head$441].concat(trees$443.terms),
            env: trees$443.env
        };
    }
    function addToDefinitionCtx$223(idents$454, defscope$455, skipRep$456) {
        parser$95.assert(idents$454 && idents$454.length > 0, 'expecting some variable identifiers');
        skipRep$456 = skipRep$456 || false;
        _$94.each(idents$454, function (id$457) {
            var skip$458 = false;
            if (skipRep$456) {
                var declRepeat$459 = _$94.find(defscope$455, function (def$460) {
                        return def$460.id.token.value === id$457.token.value && arraysEqual$174(marksof$172(def$460.id.context), marksof$172(id$457.context));
                    });
                skip$458 = typeof declRepeat$459 !== 'undefined';
            }
            if (!skip$458) {
                var name$461 = fresh$179();
                defscope$455.push({
                    id: id$457,
                    name: name$461
                });
            }
        });
    }
    function expandTermTreeToFinal$224(term$462, env$463, defscope$464, templateMap$465) {
        parser$95.assert(env$463, 'environment map is required');
        if (term$462.hasPrototype(ArrayLiteral$192)) {
            term$462.array.delim.token.inner = expand$225(term$462.array.delim.token.inner, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(Block$191)) {
            term$462.body.delim.token.inner = expand$225(term$462.body.delim.token.inner, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(ParenExpression$193)) {
            term$462.expr.delim.token.inner = expand$225(term$462.expr.delim.token.inner, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(Call$208)) {
            term$462.fun = expandTermTreeToFinal$224(term$462.fun, env$463, defscope$464, templateMap$465);
            term$462.args = _$94.map(term$462.args, function (arg$466) {
                return expandTermTreeToFinal$224(arg$466, env$463, defscope$464, templateMap$465);
            });
            return term$462;
        } else if (term$462.hasPrototype(UnaryOp$194)) {
            term$462.expr = expandTermTreeToFinal$224(term$462.expr, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(BinOp$196)) {
            term$462.left = expandTermTreeToFinal$224(term$462.left, env$463, defscope$464, templateMap$465);
            term$462.right = expandTermTreeToFinal$224(term$462.right, env$463, defscope$464);
            return term$462;
        } else if (term$462.hasPrototype(ObjGet$210)) {
            term$462.right.delim.token.inner = expand$225(term$462.right.delim.token.inner, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(ObjDotGet$209)) {
            term$462.left = expandTermTreeToFinal$224(term$462.left, env$463, defscope$464, templateMap$465);
            term$462.right = expandTermTreeToFinal$224(term$462.right, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(VariableDeclaration$211)) {
            if (term$462.init) {
                term$462.init = expandTermTreeToFinal$224(term$462.init, env$463, defscope$464, templateMap$465);
            }
            return term$462;
        } else if (term$462.hasPrototype(VariableStatement$212)) {
            term$462.decls = _$94.map(term$462.decls, function (decl$467) {
                return expandTermTreeToFinal$224(decl$467, env$463, defscope$464, templateMap$465);
            });
            return term$462;
        } else if (term$462.hasPrototype(Delimiter$200)) {
            term$462.delim.token.inner = expand$225(term$462.delim.token.inner, env$463, defscope$464, templateMap$465);
            return term$462;
        } else if (term$462.hasPrototype(NamedFun$202) || term$462.hasPrototype(AnonFun$203) || term$462.hasPrototype(CatchClause$213)) {
            var newDef$468 = [];
            var params$469 = term$462.params.addDefCtx(newDef$468);
            var bodies$470 = term$462.body.addDefCtx(newDef$468);
            var paramNames$471 = _$94.map(getParamIdentifiers$182(params$469), function (param$478) {
                    var freshName$479 = fresh$179();
                    return {
                        freshName: freshName$479,
                        originalParam: param$478,
                        renamedParam: param$478.rename(param$478, freshName$479)
                    };
                });
            var renamedBody$472 = _$94.reduce(paramNames$471, function (accBody$480, p$481) {
                    return accBody$480.rename(p$481.originalParam, p$481.freshName);
                }, bodies$470);
            renamedBody$472 = renamedBody$472.expose();
            var bodyTerms$473 = expand$225([renamedBody$472], env$463, newDef$468, templateMap$465);
            parser$95.assert(bodyTerms$473.length === 1 && bodyTerms$473[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$474 = _$94.map(paramNames$471, function (p$482) {
                    return p$482.renamedParam;
                });
            var flatArgs$475 = syn$96.makeDelim('()', joinSyntax$180(renamedParams$474, ','), term$462.params);
            var expandedArgs$476 = expand$225([flatArgs$475], env$463, newDef$468, templateMap$465);
            parser$95.assert(expandedArgs$476.length === 1, 'should only get back one result');
            term$462.params = expandedArgs$476[0];
            var flattenedBody$477 = bodyTerms$473[0].destruct();
            flattenedBody$477 = _$94.reduce(newDef$468, function (acc$483, def$484) {
                return acc$483.rename(def$484.id, def$484.name);
            }, flattenedBody$477[0]);
            term$462.body = flattenedBody$477;
            return term$462;
        }
        return term$462;
    }
    function expand$225(stx$485, env$486, defscope$487, templateMap$488) {
        env$486 = env$486 || new Map();
        templateMap$488 = templateMap$488 || new Map();
        var trees$489 = expandToTermTree$222(stx$485, env$486, defscope$487, templateMap$488);
        return _$94.map(trees$489.terms, function (term$490) {
            return expandTermTreeToFinal$224(term$490, trees$489.env, defscope$487, templateMap$488);
        });
    }
    function expandTopLevel$226(stx$491) {
        var funn$492 = syntaxFromToken$169({
                value: 'function',
                type: parser$95.Token.Keyword
            });
        var params$493 = syntaxFromToken$169({
                value: '()',
                type: parser$95.Token.Delimiter,
                inner: []
            });
        var body$494 = syntaxFromToken$169({
                value: '{}',
                type: parser$95.Token.Delimiter,
                inner: stx$491
            });
        var res$495 = expand$225([
                funn$492,
                params$493,
                body$494
            ]);
        res$495 = flatten$227([res$495[0].body]);
        return _$94.map(res$495.slice(1, res$495.length - 1), function (stx$496) {
            return stx$496;
        });
    }
    function flatten$227(stx$497) {
        return _$94.reduce(stx$497, function (acc$498, stx$499) {
            if (stx$499.token.type === parser$95.Token.Delimiter) {
                var exposed$500 = stx$499.expose();
                var openParen$501 = syntaxFromToken$169({
                        type: parser$95.Token.Punctuator,
                        value: stx$499.token.value[0],
                        range: stx$499.token.startRange,
                        lineNumber: stx$499.token.startLineNumber,
                        lineStart: stx$499.token.startLineStart
                    }, exposed$500.context);
                var closeParen$502 = syntaxFromToken$169({
                        type: parser$95.Token.Punctuator,
                        value: stx$499.token.value[1],
                        range: stx$499.token.endRange,
                        lineNumber: stx$499.token.endLineNumber,
                        lineStart: stx$499.token.endLineStart
                    }, exposed$500.context);
                return acc$498.concat(openParen$501).concat(flatten$227(exposed$500.token.inner)).concat(closeParen$502);
            }
            return acc$498.concat(stx$499);
        }, []);
    }
    exports$93.enforest = enforest$218;
    exports$93.expand = expandTopLevel$226;
    exports$93.resolve = resolve$173;
    exports$93.get_expression = get_expression$219;
    exports$93.Expr = Expr$186;
    exports$93.VariableStatement = VariableStatement$212;
    exports$93.tokensToSyntax = syn$96.tokensToSyntax;
    exports$93.syntaxToTokens = syn$96.syntaxToTokens;
}));