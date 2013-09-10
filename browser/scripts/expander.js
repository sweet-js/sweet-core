(function (root$92, factory$93) {
    if (typeof exports === 'object') {
        factory$93(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'scopedEval',
            'patterns'
        ], factory$93);
    }
}(this, function (exports$94, _$95, parser$96, syn$97, es6$98, se$99, patternModule$100, gen$101) {
    'use strict';
    var codegen$102 = gen$101 || escodegen;
    exports$94._test = {};
    Object.prototype.create = function () {
        var o$229 = Object.create(this);
        if (typeof o$229.construct === 'function') {
            o$229.construct.apply(o$229, arguments);
        }
        return o$229;
    };
    Object.prototype.extend = function (properties$230) {
        var result$231 = Object.create(this);
        for (var prop$232 in properties$230) {
            if (properties$230.hasOwnProperty(prop$232)) {
                result$231[prop$232] = properties$230[prop$232];
            }
        }
        return result$231;
    };
    Object.prototype.hasPrototype = function (proto$233) {
        function F$234() {
        }
        F$234.prototype = proto$233;
        return this instanceof F$234;
    };
    function throwError$161(msg$235) {
        throw new Error(msg$235);
    }
    var scopedEval$162 = se$99.scopedEval;
    var Rename$163 = syn$97.Rename;
    var Mark$164 = syn$97.Mark;
    var Var$165 = syn$97.Var;
    var Def$166 = syn$97.Def;
    var isDef$167 = syn$97.isDef;
    var isMark$168 = syn$97.isMark;
    var isRename$169 = syn$97.isRename;
    var syntaxFromToken$170 = syn$97.syntaxFromToken;
    var mkSyntax$171 = syn$97.mkSyntax;
    function remdup$172(mark$236, mlist$237) {
        if (mark$236 === _$95.first(mlist$237)) {
            return _$95.rest(mlist$237, 1);
        }
        return [mark$236].concat(mlist$237);
    }
    function marksof$173(ctx$238, stopName$239, originalName$240) {
        var mark$241, submarks$242;
        if (isMark$168(ctx$238)) {
            mark$241 = ctx$238.mark;
            submarks$242 = marksof$173(ctx$238.context, stopName$239, originalName$240);
            return remdup$172(mark$241, submarks$242);
        }
        if (isDef$167(ctx$238)) {
            return marksof$173(ctx$238.context, stopName$239, originalName$240);
        }
        if (isRename$169(ctx$238)) {
            if (stopName$239 === originalName$240 + '$' + ctx$238.name) {
                return [];
            }
            return marksof$173(ctx$238.context, stopName$239, originalName$240);
        }
        return [];
    }
    function resolve$174(stx$243) {
        return resolveCtx$178(stx$243.token.value, stx$243.context, [], []);
    }
    function arraysEqual$175(a$244, b$245) {
        if (a$244.length !== b$245.length) {
            return false;
        }
        for (var i$246 = 0; i$246 < a$244.length; i$246++) {
            if (a$244[i$246] !== b$245[i$246]) {
                return false;
            }
        }
        return true;
    }
    function renames$176(defctx$247, oldctx$248, originalName$249) {
        var acc$250 = oldctx$248;
        for (var i$251 = 0; i$251 < defctx$247.length; i$251++) {
            if (defctx$247[i$251].id.token.value === originalName$249) {
                acc$250 = Rename$163(defctx$247[i$251].id, defctx$247[i$251].name, acc$250, defctx$247);
            }
        }
        return acc$250;
    }
    function unionEl$177(arr$252, el$253) {
        if (arr$252.indexOf(el$253) === -1) {
            var res$254 = arr$252.slice(0);
            res$254.push(el$253);
            return res$254;
        }
        return arr$252;
    }
    function resolveCtx$178(originalName$255, ctx$256, stop_spine$257, stop_branch$258) {
        if (isMark$168(ctx$256)) {
            return resolveCtx$178(originalName$255, ctx$256.context, stop_spine$257, stop_branch$258);
        }
        if (isDef$167(ctx$256)) {
            if (stop_spine$257.indexOf(ctx$256.defctx) !== -1) {
                return resolveCtx$178(originalName$255, ctx$256.context, stop_spine$257, stop_branch$258);
            } else {
                return resolveCtx$178(originalName$255, renames$176(ctx$256.defctx, ctx$256.context, originalName$255), stop_spine$257, unionEl$177(stop_branch$258, ctx$256.defctx));
            }
        }
        if (isRename$169(ctx$256)) {
            if (originalName$255 === ctx$256.id.token.value) {
                var idName$259 = resolveCtx$178(ctx$256.id.token.value, ctx$256.id.context, stop_branch$258, stop_branch$258);
                var subName$260 = resolveCtx$178(originalName$255, ctx$256.context, unionEl$177(stop_spine$257, ctx$256.def), stop_branch$258);
                if (idName$259 === subName$260) {
                    var idMarks$261 = marksof$173(ctx$256.id.context, originalName$255 + '$' + ctx$256.name, originalName$255);
                    var subMarks$262 = marksof$173(ctx$256.context, originalName$255 + '$' + ctx$256.name, originalName$255);
                    if (arraysEqual$175(idMarks$261, subMarks$262)) {
                        return originalName$255 + '$' + ctx$256.name;
                    }
                }
            }
            return resolveCtx$178(originalName$255, ctx$256.context, unionEl$177(stop_spine$257, ctx$256.def), stop_branch$258);
        }
        return originalName$255;
    }
    var nextFresh$179 = 0;
    function fresh$180() {
        return nextFresh$179++;
    }
    ;
    function joinSyntax$181(tojoin$263, punc$264) {
        if (tojoin$263.length === 0) {
            return [];
        }
        if (punc$264 === ' ') {
            return tojoin$263;
        }
        return _$95.reduce(_$95.rest(tojoin$263, 1), function (acc$265, join$266) {
            return acc$265.concat(mkSyntax$171(punc$264, parser$96.Token.Punctuator, join$266), join$266);
        }, [_$95.first(tojoin$263)]);
    }
    function wrapDelim$182(towrap$267, delimSyntax$268) {
        parser$96.assert(delimSyntax$268.token.type === parser$96.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$170({
            type: parser$96.Token.Delimiter,
            value: delimSyntax$268.token.value,
            inner: towrap$267,
            range: delimSyntax$268.token.range,
            startLineNumber: delimSyntax$268.token.startLineNumber,
            lineStart: delimSyntax$268.token.lineStart
        }, delimSyntax$268.context);
    }
    function getParamIdentifiers$183(argSyntax$269) {
        parser$96.assert(argSyntax$269.token.type === parser$96.Token.Delimiter, 'expecting delimiter for function params');
        return _$95.filter(argSyntax$269.token.inner, function (stx$270) {
            return stx$270.token.value !== ',';
        });
    }
    var TermTree$184 = {
            destruct: function () {
                return _$95.reduce(this.properties, _$95.bind(function (acc$271, prop$272) {
                    if (this[prop$272] && this[prop$272].hasPrototype(TermTree$184)) {
                        return acc$271.concat(this[prop$272].destruct());
                    } else if (this[prop$272] && this[prop$272].token && this[prop$272].token.inner) {
                        this[prop$272].token.inner = _$95.reduce(this[prop$272].token.inner, function (acc$273, t$274) {
                            if (t$274.hasPrototype(TermTree$184)) {
                                return acc$273.concat(t$274.destruct());
                            }
                            return acc$273.concat(t$274);
                        }, []);
                        return acc$271.concat(this[prop$272]);
                    } else if (this[prop$272]) {
                        return acc$271.concat(this[prop$272]);
                    } else {
                        return acc$271;
                    }
                }, this), []);
            }
        };
    var EOF$185 = TermTree$184.extend({
            properties: ['eof'],
            construct: function (e$275) {
                this.eof = e$275;
            }
        });
    var Statement$186 = TermTree$184.extend({
            construct: function () {
            }
        });
    var Expr$187 = TermTree$184.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$188 = Expr$187.extend({
            construct: function () {
            }
        });
    var ThisExpression$189 = PrimaryExpression$188.extend({
            properties: ['this'],
            construct: function (that$276) {
                this.this = that$276;
            }
        });
    var Lit$190 = PrimaryExpression$188.extend({
            properties: ['lit'],
            construct: function (l$277) {
                this.lit = l$277;
            }
        });
    exports$94._test.PropertyAssignment = PropertyAssignment$191;
    var PropertyAssignment$191 = TermTree$184.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$278, assignment$279) {
                this.propName = propName$278;
                this.assignment = assignment$279;
            }
        });
    var Block$192 = PrimaryExpression$188.extend({
            properties: ['body'],
            construct: function (body$280) {
                this.body = body$280;
            }
        });
    var ArrayLiteral$193 = PrimaryExpression$188.extend({
            properties: ['array'],
            construct: function (ar$281) {
                this.array = ar$281;
            }
        });
    var ParenExpression$194 = PrimaryExpression$188.extend({
            properties: ['expr'],
            construct: function (expr$282) {
                this.expr = expr$282;
            }
        });
    var UnaryOp$195 = Expr$187.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$283, expr$284) {
                this.op = op$283;
                this.expr = expr$284;
            }
        });
    var PostfixOp$196 = Expr$187.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$285, op$286) {
                this.expr = expr$285;
                this.op = op$286;
            }
        });
    var BinOp$197 = Expr$187.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$287, left$288, right$289) {
                this.op = op$287;
                this.left = left$288;
                this.right = right$289;
            }
        });
    var ConditionalExpression$198 = Expr$187.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$290, question$291, tru$292, colon$293, fls$294) {
                this.cond = cond$290;
                this.question = question$291;
                this.tru = tru$292;
                this.colon = colon$293;
                this.fls = fls$294;
            }
        });
    var Keyword$199 = TermTree$184.extend({
            properties: ['keyword'],
            construct: function (k$295) {
                this.keyword = k$295;
            }
        });
    var Punc$200 = TermTree$184.extend({
            properties: ['punc'],
            construct: function (p$296) {
                this.punc = p$296;
            }
        });
    var Delimiter$201 = TermTree$184.extend({
            properties: ['delim'],
            construct: function (d$297) {
                this.delim = d$297;
            }
        });
    var Id$202 = PrimaryExpression$188.extend({
            properties: ['id'],
            construct: function (id$298) {
                this.id = id$298;
            }
        });
    var NamedFun$203 = Expr$187.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$299, name$300, params$301, body$302) {
                this.keyword = keyword$299;
                this.name = name$300;
                this.params = params$301;
                this.body = body$302;
            }
        });
    var AnonFun$204 = Expr$187.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$303, params$304, body$305) {
                this.keyword = keyword$303;
                this.params = params$304;
                this.body = body$305;
            }
        });
    var LetMacro$205 = TermTree$184.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$306, body$307) {
                this.name = name$306;
                this.body = body$307;
            }
        });
    var Macro$206 = TermTree$184.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$308, body$309) {
                this.name = name$308;
                this.body = body$309;
            }
        });
    var AnonMacro$207 = TermTree$184.extend({
            properties: ['body'],
            construct: function (body$310) {
                this.body = body$310;
            }
        });
    var Const$208 = Expr$187.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$311, call$312) {
                this.newterm = newterm$311;
                this.call = call$312;
            }
        });
    var Call$209 = Expr$187.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$96.assert(this.fun.hasPrototype(TermTree$184), 'expecting a term tree in destruct of call');
                var that$313 = this;
                this.delim = syntaxFromToken$170(_$95.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$95.reduce(this.args, function (acc$314, term$315) {
                    parser$96.assert(term$315 && term$315.hasPrototype(TermTree$184), 'expecting term trees in destruct of Call');
                    var dst$316 = acc$314.concat(term$315.destruct());
                    if (that$313.commas.length > 0) {
                        dst$316 = dst$316.concat(that$313.commas.shift());
                    }
                    return dst$316;
                }, []);
                return this.fun.destruct().concat(Delimiter$201.create(this.delim).destruct());
            },
            construct: function (funn$317, args$318, delim$319, commas$320) {
                parser$96.assert(Array.isArray(args$318), 'requires an array of arguments terms');
                this.fun = funn$317;
                this.args = args$318;
                this.delim = delim$319;
                this.commas = commas$320;
            }
        });
    var ObjDotGet$210 = Expr$187.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$321, dot$322, right$323) {
                this.left = left$321;
                this.dot = dot$322;
                this.right = right$323;
            }
        });
    var ObjGet$211 = Expr$187.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$324, right$325) {
                this.left = left$324;
                this.right = right$325;
            }
        });
    var VariableDeclaration$212 = TermTree$184.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$326, eqstx$327, init$328, comma$329) {
                this.ident = ident$326;
                this.eqstx = eqstx$327;
                this.init = init$328;
                this.comma = comma$329;
            }
        });
    var VariableStatement$213 = Statement$186.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$95.reduce(this.decls, function (acc$330, decl$331) {
                    return acc$330.concat(decl$331.destruct());
                }, []));
            },
            construct: function (varkw$332, decls$333) {
                parser$96.assert(Array.isArray(decls$333), 'decls must be an array');
                this.varkw = varkw$332;
                this.decls = decls$333;
            }
        });
    var CatchClause$214 = TermTree$184.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$334, params$335, body$336) {
                this.catchkw = catchkw$334;
                this.params = params$335;
                this.body = body$336;
            }
        });
    var Empty$215 = TermTree$184.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$216(stx$337) {
        var staticOperators$338 = [
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
        return _$95.contains(staticOperators$338, stx$337.token.value);
    }
    function stxIsBinOp$217(stx$339) {
        var staticOperators$340 = [
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
        return _$95.contains(staticOperators$340, stx$339.token.value);
    }
    function enforestVarStatement$218(stx$341, env$342) {
        var decls$343 = [];
        var res$344 = enforest$219(stx$341, env$342);
        var result$345 = res$344.result;
        var rest$346 = res$344.rest;
        if (rest$346[0]) {
            var nextRes$347 = enforest$219(rest$346, env$342);
            if (nextRes$347.result.hasPrototype(Punc$200) && nextRes$347.result.punc.token.value === '=') {
                var initializerRes$348 = enforest$219(nextRes$347.rest, env$342);
                if (initializerRes$348.rest[0]) {
                    var restRes$349 = enforest$219(initializerRes$348.rest, env$342);
                    if (restRes$349.result.hasPrototype(Punc$200) && restRes$349.result.punc.token.value === ',') {
                        decls$343.push(VariableDeclaration$212.create(result$345.id, nextRes$347.result.punc, initializerRes$348.result, restRes$349.result.punc));
                        var subRes$350 = enforestVarStatement$218(restRes$349.rest, env$342);
                        decls$343 = decls$343.concat(subRes$350.result);
                        rest$346 = subRes$350.rest;
                    } else {
                        decls$343.push(VariableDeclaration$212.create(result$345.id, nextRes$347.result.punc, initializerRes$348.result));
                        rest$346 = initializerRes$348.rest;
                    }
                } else {
                    decls$343.push(VariableDeclaration$212.create(result$345.id, nextRes$347.result.punc, initializerRes$348.result));
                }
            } else if (nextRes$347.result.hasPrototype(Punc$200) && nextRes$347.result.punc.token.value === ',') {
                decls$343.push(VariableDeclaration$212.create(result$345.id, null, null, nextRes$347.result.punc));
                var subRes$350 = enforestVarStatement$218(nextRes$347.rest, env$342);
                decls$343 = decls$343.concat(subRes$350.result);
                rest$346 = subRes$350.rest;
            } else {
                if (result$345.hasPrototype(Id$202)) {
                    decls$343.push(VariableDeclaration$212.create(result$345.id));
                } else {
                    throwError$161('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$345.hasPrototype(Id$202)) {
                decls$343.push(VariableDeclaration$212.create(result$345.id));
            } else if (result$345.hasPrototype(BinOp$197) && result$345.op.token.value === 'in') {
                decls$343.push(VariableDeclaration$212.create(result$345.left.id, result$345.op, result$345.right));
            } else {
                throwError$161('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$343,
            rest: rest$346
        };
    }
    function enforest$219(toks$351, env$352) {
        env$352 = env$352 || new Map();
        parser$96.assert(toks$351.length > 0, 'enforest assumes there are tokens to work with');
        function step$353(head$354, rest$355) {
            var innerTokens$356;
            parser$96.assert(Array.isArray(rest$355), 'result must at least be an empty array');
            if (head$354.hasPrototype(TermTree$184)) {
                var emp$359 = head$354.emp;
                var emp$359 = head$354.emp;
                var keyword$362 = head$354.keyword;
                var delim$364 = head$354.delim;
                var emp$359 = head$354.emp;
                var punc$367 = head$354.punc;
                var keyword$362 = head$354.keyword;
                var emp$359 = head$354.emp;
                var emp$359 = head$354.emp;
                var emp$359 = head$354.emp;
                var delim$364 = head$354.delim;
                var delim$364 = head$354.delim;
                var keyword$362 = head$354.keyword;
                var keyword$362 = head$354.keyword;
                if (head$354.hasPrototype(Expr$187) && (rest$355[0] && rest$355[0].token.type === parser$96.Token.Delimiter && rest$355[0].token.value === '()')) {
                    var argRes$392, enforestedArgs$393 = [], commas$394 = [];
                    rest$355[0].expose();
                    innerTokens$356 = rest$355[0].token.inner;
                    while (innerTokens$356.length > 0) {
                        argRes$392 = enforest$219(innerTokens$356, env$352);
                        enforestedArgs$393.push(argRes$392.result);
                        innerTokens$356 = argRes$392.rest;
                        if (innerTokens$356[0] && innerTokens$356[0].token.value === ',') {
                            commas$394.push(innerTokens$356[0]);
                            innerTokens$356 = innerTokens$356.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$395 = _$95.all(enforestedArgs$393, function (argTerm$396) {
                            return argTerm$396.hasPrototype(Expr$187);
                        });
                    if (innerTokens$356.length === 0 && argsAreExprs$395) {
                        return step$353(Call$209.create(head$354, enforestedArgs$393, rest$355[0], commas$394), rest$355.slice(1));
                    }
                } else if (head$354.hasPrototype(Expr$187) && (rest$355[0] && rest$355[0].token.value === '?')) {
                    var question$397 = rest$355[0];
                    var condRes$398 = enforest$219(rest$355.slice(1), env$352);
                    var truExpr$399 = condRes$398.result;
                    var right$400 = condRes$398.rest;
                    if (truExpr$399.hasPrototype(Expr$187) && right$400[0] && right$400[0].token.value === ':') {
                        var colon$401 = right$400[0];
                        var flsRes$402 = enforest$219(right$400.slice(1), env$352);
                        var flsExpr$403 = flsRes$402.result;
                        if (flsExpr$403.hasPrototype(Expr$187)) {
                            return step$353(ConditionalExpression$198.create(head$354, question$397, truExpr$399, colon$401, flsExpr$403), flsRes$402.rest);
                        }
                    }
                } else if (head$354.hasPrototype(Keyword$199) && (keyword$362.token.value === 'new' && rest$355[0])) {
                    var newCallRes$404 = enforest$219(rest$355, env$352);
                    if (newCallRes$404.result.hasPrototype(Call$209)) {
                        return step$353(Const$208.create(head$354, newCallRes$404.result), newCallRes$404.rest);
                    }
                } else if (head$354.hasPrototype(Delimiter$201) && delim$364.token.value === '()') {
                    innerTokens$356 = delim$364.token.inner;
                    if (innerTokens$356.length === 0) {
                        return step$353(ParenExpression$194.create(head$354), rest$355);
                    } else {
                        var innerTerm$405 = get_expression$220(innerTokens$356, env$352);
                        if (innerTerm$405.result && innerTerm$405.result.hasPrototype(Expr$187)) {
                            return step$353(ParenExpression$194.create(head$354), rest$355);
                        }
                    }
                } else if (head$354.hasPrototype(TermTree$184) && (rest$355[0] && rest$355[1] && stxIsBinOp$217(rest$355[0]))) {
                    var op$406 = rest$355[0];
                    var left$407 = head$354;
                    var bopRes$408 = enforest$219(rest$355.slice(1), env$352);
                    var right$400 = bopRes$408.result;
                    if (right$400.hasPrototype(Expr$187)) {
                        return step$353(BinOp$197.create(op$406, left$407, right$400), bopRes$408.rest);
                    }
                } else if (head$354.hasPrototype(Punc$200) && stxIsUnaryOp$216(punc$367)) {
                    var unopRes$409 = enforest$219(rest$355, env$352);
                    if (unopRes$409.result.hasPrototype(Expr$187)) {
                        return step$353(UnaryOp$195.create(punc$367, unopRes$409.result), unopRes$409.rest);
                    }
                } else if (head$354.hasPrototype(Keyword$199) && stxIsUnaryOp$216(keyword$362)) {
                    var unopRes$409 = enforest$219(rest$355, env$352);
                    if (unopRes$409.result.hasPrototype(Expr$187)) {
                        return step$353(UnaryOp$195.create(keyword$362, unopRes$409.result), unopRes$409.rest);
                    }
                } else if (head$354.hasPrototype(Expr$187) && (rest$355[0] && (rest$355[0].token.value === '++' || rest$355[0].token.value === '--'))) {
                    return step$353(PostfixOp$196.create(head$354, rest$355[0]), rest$355.slice(1));
                } else if (head$354.hasPrototype(Expr$187) && (rest$355[0] && rest$355[0].token.value === '[]')) {
                    return step$353(ObjGet$211.create(head$354, Delimiter$201.create(rest$355[0].expose())), rest$355.slice(1));
                } else if (head$354.hasPrototype(Expr$187) && (rest$355[0] && rest$355[0].token.value === '.' && rest$355[1] && rest$355[1].token.type === parser$96.Token.Identifier)) {
                    return step$353(ObjDotGet$210.create(head$354, rest$355[0], rest$355[1]), rest$355.slice(2));
                } else if (head$354.hasPrototype(Delimiter$201) && delim$364.token.value === '[]') {
                    return step$353(ArrayLiteral$193.create(head$354), rest$355);
                } else if (head$354.hasPrototype(Delimiter$201) && head$354.delim.token.value === '{}') {
                    return step$353(Block$192.create(head$354), rest$355);
                } else if (head$354.hasPrototype(Keyword$199) && (keyword$362.token.value === 'let' && (rest$355[0] && rest$355[0].token.type === parser$96.Token.Identifier || rest$355[0] && rest$355[0].token.type === parser$96.Token.Keyword) && rest$355[1] && rest$355[1].token.value === '=' && rest$355[2] && rest$355[2].token.value === 'macro')) {
                    var mac$410 = enforest$219(rest$355.slice(2), env$352);
                    if (!mac$410.result.hasPrototype(AnonMacro$207)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$353(LetMacro$205.create(rest$355[0], mac$410.result.body), mac$410.rest);
                } else if (head$354.hasPrototype(Keyword$199) && (keyword$362.token.value === 'var' && rest$355[0])) {
                    var vsRes$411 = enforestVarStatement$218(rest$355, env$352);
                    if (vsRes$411) {
                        return step$353(VariableStatement$213.create(head$354, vsRes$411.result), vsRes$411.rest);
                    }
                }
            } else {
                parser$96.assert(head$354 && head$354.token, 'assuming head is a syntax object');
                if ((head$354.token.type === parser$96.Token.Identifier || head$354.token.type === parser$96.Token.Keyword) && env$352.has(resolve$174(head$354))) {
                    var transformer$412 = env$352.get(resolve$174(head$354)).fn;
                    var rt$413 = transformer$412([head$354].concat(rest$355), env$352);
                    if (!Array.isArray(rt$413.result)) {
                        throwError$161('Macro transformer must return a result array, not: ' + rt$413.result);
                    }
                    if (rt$413.result.length > 0) {
                        return step$353(rt$413.result[0], rt$413.result.slice(1).concat(rt$413.rest));
                    } else {
                        return step$353(Empty$215.create(), rt$413.rest);
                    }
                } else if (head$354.token.type === parser$96.Token.Identifier && head$354.token.value === 'macro' && rest$355[0] && rest$355[0].token.value === '{}') {
                    return step$353(AnonMacro$207.create(rest$355[0].expose().token.inner), rest$355.slice(1));
                } else if (head$354.token.type === parser$96.Token.Identifier && head$354.token.value === 'macro' && rest$355[0] && (rest$355[0].token.type === parser$96.Token.Identifier || rest$355[0].token.type === parser$96.Token.Keyword) && rest$355[1] && rest$355[1].token.type === parser$96.Token.Delimiter && rest$355[1].token.value === '{}') {
                    return step$353(Macro$206.create(rest$355[0], rest$355[1].expose().token.inner), rest$355.slice(2));
                } else if (head$354.token.type === parser$96.Token.Keyword && head$354.token.value === 'function' && rest$355[0] && rest$355[0].token.type === parser$96.Token.Identifier && rest$355[1] && rest$355[1].token.type === parser$96.Token.Delimiter && rest$355[1].token.value === '()' && rest$355[2] && rest$355[2].token.type === parser$96.Token.Delimiter && rest$355[2].token.value === '{}') {
                    rest$355[1].token.inner = rest$355[1].expose().token.inner;
                    rest$355[2].token.inner = rest$355[2].expose().token.inner;
                    return step$353(NamedFun$203.create(head$354, rest$355[0], rest$355[1], rest$355[2]), rest$355.slice(3));
                } else if (head$354.token.type === parser$96.Token.Keyword && head$354.token.value === 'function' && rest$355[0] && rest$355[0].token.type === parser$96.Token.Delimiter && rest$355[0].token.value === '()' && rest$355[1] && rest$355[1].token.type === parser$96.Token.Delimiter && rest$355[1].token.value === '{}') {
                    rest$355[0].token.inner = rest$355[0].expose().token.inner;
                    rest$355[1].token.inner = rest$355[1].expose().token.inner;
                    return step$353(AnonFun$204.create(head$354, rest$355[0], rest$355[1]), rest$355.slice(2));
                } else if (head$354.token.type === parser$96.Token.Keyword && head$354.token.value === 'catch' && rest$355[0] && rest$355[0].token.type === parser$96.Token.Delimiter && rest$355[0].token.value === '()' && rest$355[1] && rest$355[1].token.type === parser$96.Token.Delimiter && rest$355[1].token.value === '{}') {
                    rest$355[0].token.inner = rest$355[0].expose().token.inner;
                    rest$355[1].token.inner = rest$355[1].expose().token.inner;
                    return step$353(CatchClause$214.create(head$354, rest$355[0], rest$355[1]), rest$355.slice(2));
                } else if (head$354.token.type === parser$96.Token.Keyword && head$354.token.value === 'this') {
                    return step$353(ThisExpression$189.create(head$354), rest$355);
                } else if (head$354.token.type === parser$96.Token.NumericLiteral || head$354.token.type === parser$96.Token.StringLiteral || head$354.token.type === parser$96.Token.BooleanLiteral || head$354.token.type === parser$96.Token.RegexLiteral || head$354.token.type === parser$96.Token.NullLiteral) {
                    return step$353(Lit$190.create(head$354), rest$355);
                } else if (head$354.token.type === parser$96.Token.Identifier) {
                    return step$353(Id$202.create(head$354), rest$355);
                } else if (head$354.token.type === parser$96.Token.Punctuator) {
                    return step$353(Punc$200.create(head$354), rest$355);
                } else if (head$354.token.type === parser$96.Token.Keyword && head$354.token.value === 'with') {
                    throwError$161('with is not supported in sweet.js');
                } else if (head$354.token.type === parser$96.Token.Keyword) {
                    return step$353(Keyword$199.create(head$354), rest$355);
                } else if (head$354.token.type === parser$96.Token.Delimiter) {
                    return step$353(Delimiter$201.create(head$354.expose()), rest$355);
                } else if (head$354.token.type === parser$96.Token.EOF) {
                    parser$96.assert(rest$355.length === 0, 'nothing should be after an EOF');
                    return step$353(EOF$185.create(head$354), []);
                } else {
                    parser$96.assert(false, 'not implemented');
                }
            }
            return {
                result: head$354,
                rest: rest$355
            };
        }
        return step$353(toks$351[0], toks$351.slice(1));
    }
    function get_expression$220(stx$414, env$415) {
        var res$416 = enforest$219(stx$414, env$415);
        if (!res$416.result.hasPrototype(Expr$187)) {
            return {
                result: null,
                rest: stx$414
            };
        }
        return res$416;
    }
    function applyMarkToPatternEnv$221(newMark$417, env$418) {
        function dfs$419(match$420) {
            if (match$420.level === 0) {
                match$420.match = _$95.map(match$420.match, function (stx$421) {
                    return stx$421.mark(newMark$417);
                });
            } else {
                _$95.each(match$420.match, function (match$422) {
                    dfs$419(match$422);
                });
            }
        }
        _$95.keys(env$418).forEach(function (key$423) {
            dfs$419(env$418[key$423]);
        });
    }
    function loadMacroDef$222(mac$424, env$425, defscope$426, templateMap$427) {
        var body$428 = mac$424.body;
        if (!(body$428[0] && body$428[0].token.type === parser$96.Token.Keyword && body$428[0].token.value === 'function')) {
            throwError$161('Primitive macro form must contain a function for the macro body');
        }
        var stub$429 = parser$96.read('()')[0];
        stub$429[0].token.inner = body$428;
        var expanded$430 = expand$226(stub$429, env$425, defscope$426, templateMap$427);
        expanded$430 = expanded$430[0].destruct().concat(expanded$430[1].eof);
        var flattend$431 = flatten$228(expanded$430);
        var bodyCode$432 = codegen$102.generate(parser$96.parse(flattend$431));
        var macroFn$433 = scopedEval$162(bodyCode$432, {
                makeValue: syn$97.makeValue,
                makeRegex: syn$97.makeRegex,
                makeIdent: syn$97.makeIdent,
                makeKeyword: syn$97.makeKeyword,
                makePunc: syn$97.makePunc,
                makeDelim: syn$97.makeDelim,
                unwrapSyntax: syn$97.unwrapSyntax,
                fresh: fresh$180,
                _: _$95,
                parser: parser$96,
                patternModule: patternModule$100,
                getTemplate: function (id$434) {
                    return templateMap$427.get(id$434);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$221,
                mergeMatches: function (newMatch$435, oldMatch$436) {
                    newMatch$435.patternEnv = _$95.extend({}, oldMatch$436.patternEnv, newMatch$435.patternEnv);
                    return newMatch$435;
                }
            });
        return macroFn$433;
    }
    function expandToTermTree$223(stx$437, env$438, defscope$439, templateMap$440) {
        parser$96.assert(env$438, 'environment map is required');
        if (stx$437.length === 0) {
            return {
                terms: [],
                env: env$438
            };
        }
        parser$96.assert(stx$437[0].token, 'expecting a syntax object');
        var f$441 = enforest$219(stx$437, env$438);
        var head$442 = f$441.result;
        var rest$443 = f$441.rest;
        if (head$442.hasPrototype(Macro$206)) {
            var macroDefinition$445 = loadMacroDef$222(head$442, env$438, defscope$439, templateMap$440);
            addToDefinitionCtx$224([head$442.name], defscope$439, false);
            env$438.set(resolve$174(head$442.name), { fn: macroDefinition$445 });
            return expandToTermTree$223(rest$443, env$438, defscope$439, templateMap$440);
        }
        if (head$442.hasPrototype(LetMacro$205)) {
            var macroDefinition$445 = loadMacroDef$222(head$442, env$438, defscope$439, templateMap$440);
            var freshName$446 = fresh$180();
            var renamedName$447 = head$442.name.rename(head$442.name, freshName$446);
            rest$443 = _$95.map(rest$443, function (stx$448) {
                return stx$448.rename(head$442.name, freshName$446);
            });
            head$442.name = renamedName$447;
            env$438.set(resolve$174(head$442.name), { fn: macroDefinition$445 });
            return expandToTermTree$223(rest$443, env$438, defscope$439, templateMap$440);
        }
        if (head$442.hasPrototype(NamedFun$203)) {
            addToDefinitionCtx$224([head$442.name], defscope$439, true);
        }
        if (head$442.hasPrototype(Id$202) && head$442.id.token.value === '#quoteSyntax' && rest$443[0] && rest$443[0].token.value === '{}') {
            var tempId$449 = fresh$180();
            templateMap$440.set(tempId$449, rest$443[0].token.inner);
            return expandToTermTree$223([
                syn$97.makeIdent('getTemplate', head$442.id),
                syn$97.makeDelim('()', [syn$97.makeValue(tempId$449, head$442.id)], head$442.id)
            ].concat(rest$443.slice(1)), env$438, defscope$439, templateMap$440);
        }
        if (head$442.hasPrototype(VariableStatement$213)) {
            addToDefinitionCtx$224(_$95.map(head$442.decls, function (decl$450) {
                return decl$450.ident;
            }), defscope$439, true);
        }
        if (head$442.hasPrototype(Block$192) && head$442.body.hasPrototype(Delimiter$201)) {
            head$442.body.delim.token.inner.forEach(function (term$451) {
                if (term$451.hasPrototype(VariableStatement$213)) {
                    addToDefinitionCtx$224(_$95.map(term$451.decls, function (decl$452) {
                        return decl$452.ident;
                    }), defscope$439, true);
                }
            });
        }
        if (head$442.hasPrototype(Delimiter$201)) {
            head$442.delim.token.inner.forEach(function (term$453) {
                if (term$453.hasPrototype(VariableStatement$213)) {
                    addToDefinitionCtx$224(_$95.map(term$453.decls, function (decl$454) {
                        return decl$454.ident;
                    }), defscope$439, true);
                }
            });
        }
        var trees$444 = expandToTermTree$223(rest$443, env$438, defscope$439, templateMap$440);
        return {
            terms: [head$442].concat(trees$444.terms),
            env: trees$444.env
        };
    }
    function addToDefinitionCtx$224(idents$455, defscope$456, skipRep$457) {
        parser$96.assert(idents$455 && idents$455.length > 0, 'expecting some variable identifiers');
        skipRep$457 = skipRep$457 || false;
        _$95.each(idents$455, function (id$458) {
            var skip$459 = false;
            if (skipRep$457) {
                var declRepeat$460 = _$95.find(defscope$456, function (def$461) {
                        return def$461.id.token.value === id$458.token.value && arraysEqual$175(marksof$173(def$461.id.context), marksof$173(id$458.context));
                    });
                skip$459 = typeof declRepeat$460 !== 'undefined';
            }
            if (!skip$459) {
                var name$462 = fresh$180();
                defscope$456.push({
                    id: id$458,
                    name: name$462
                });
            }
        });
    }
    function expandTermTreeToFinal$225(term$463, env$464, defscope$465, templateMap$466) {
        parser$96.assert(env$464, 'environment map is required');
        if (term$463.hasPrototype(ArrayLiteral$193)) {
            term$463.array.delim.token.inner = expand$226(term$463.array.delim.token.inner, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(Block$192)) {
            term$463.body.delim.token.inner = expand$226(term$463.body.delim.token.inner, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(ParenExpression$194)) {
            term$463.expr.delim.token.inner = expand$226(term$463.expr.delim.token.inner, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(Call$209)) {
            term$463.fun = expandTermTreeToFinal$225(term$463.fun, env$464, defscope$465, templateMap$466);
            term$463.args = _$95.map(term$463.args, function (arg$467) {
                return expandTermTreeToFinal$225(arg$467, env$464, defscope$465, templateMap$466);
            });
            return term$463;
        } else if (term$463.hasPrototype(UnaryOp$195)) {
            term$463.expr = expandTermTreeToFinal$225(term$463.expr, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(BinOp$197)) {
            term$463.left = expandTermTreeToFinal$225(term$463.left, env$464, defscope$465, templateMap$466);
            term$463.right = expandTermTreeToFinal$225(term$463.right, env$464, defscope$465);
            return term$463;
        } else if (term$463.hasPrototype(ObjGet$211)) {
            term$463.right.delim.token.inner = expand$226(term$463.right.delim.token.inner, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(ObjDotGet$210)) {
            term$463.left = expandTermTreeToFinal$225(term$463.left, env$464, defscope$465, templateMap$466);
            term$463.right = expandTermTreeToFinal$225(term$463.right, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(VariableDeclaration$212)) {
            if (term$463.init) {
                term$463.init = expandTermTreeToFinal$225(term$463.init, env$464, defscope$465, templateMap$466);
            }
            return term$463;
        } else if (term$463.hasPrototype(VariableStatement$213)) {
            term$463.decls = _$95.map(term$463.decls, function (decl$468) {
                return expandTermTreeToFinal$225(decl$468, env$464, defscope$465, templateMap$466);
            });
            return term$463;
        } else if (term$463.hasPrototype(Delimiter$201)) {
            term$463.delim.token.inner = expand$226(term$463.delim.token.inner, env$464, defscope$465, templateMap$466);
            return term$463;
        } else if (term$463.hasPrototype(NamedFun$203) || term$463.hasPrototype(AnonFun$204) || term$463.hasPrototype(CatchClause$214)) {
            var newDef$469 = [];
            var params$470 = term$463.params.addDefCtx(newDef$469);
            var bodies$471 = term$463.body.addDefCtx(newDef$469);
            var paramNames$472 = _$95.map(getParamIdentifiers$183(params$470), function (param$479) {
                    var freshName$480 = fresh$180();
                    return {
                        freshName: freshName$480,
                        originalParam: param$479,
                        renamedParam: param$479.rename(param$479, freshName$480)
                    };
                });
            var renamedBody$473 = _$95.reduce(paramNames$472, function (accBody$481, p$482) {
                    return accBody$481.rename(p$482.originalParam, p$482.freshName);
                }, bodies$471);
            renamedBody$473 = renamedBody$473.expose();
            var bodyTerms$474 = expand$226([renamedBody$473], env$464, newDef$469, templateMap$466);
            parser$96.assert(bodyTerms$474.length === 1 && bodyTerms$474[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$475 = _$95.map(paramNames$472, function (p$483) {
                    return p$483.renamedParam;
                });
            var flatArgs$476 = syn$97.makeDelim('()', joinSyntax$181(renamedParams$475, ','), term$463.params);
            var expandedArgs$477 = expand$226([flatArgs$476], env$464, newDef$469, templateMap$466);
            parser$96.assert(expandedArgs$477.length === 1, 'should only get back one result');
            term$463.params = expandedArgs$477[0];
            var flattenedBody$478 = bodyTerms$474[0].destruct();
            flattenedBody$478 = _$95.reduce(newDef$469, function (acc$484, def$485) {
                return acc$484.rename(def$485.id, def$485.name);
            }, flattenedBody$478[0]);
            term$463.body = flattenedBody$478;
            return term$463;
        }
        return term$463;
    }
    function expand$226(stx$486, env$487, defscope$488, templateMap$489) {
        env$487 = env$487 || new Map();
        templateMap$489 = templateMap$489 || new Map();
        var trees$490 = expandToTermTree$223(stx$486, env$487, defscope$488, templateMap$489);
        return _$95.map(trees$490.terms, function (term$491) {
            return expandTermTreeToFinal$225(term$491, trees$490.env, defscope$488, templateMap$489);
        });
    }
    function expandTopLevel$227(stx$492) {
        var funn$493 = syntaxFromToken$170({
                value: 'function',
                type: parser$96.Token.Keyword
            });
        var params$494 = syntaxFromToken$170({
                value: '()',
                type: parser$96.Token.Delimiter,
                inner: []
            });
        var body$495 = syntaxFromToken$170({
                value: '{}',
                type: parser$96.Token.Delimiter,
                inner: stx$492
            });
        var res$496 = expand$226([
                funn$493,
                params$494,
                body$495
            ]);
        res$496 = flatten$228([res$496[0].body]);
        return _$95.map(res$496.slice(1, res$496.length - 1), function (stx$497) {
            return stx$497;
        });
    }
    function flatten$228(stx$498) {
        return _$95.reduce(stx$498, function (acc$499, stx$500) {
            if (stx$500.token.type === parser$96.Token.Delimiter) {
                var exposed$501 = stx$500.expose();
                var openParen$502 = syntaxFromToken$170({
                        type: parser$96.Token.Punctuator,
                        value: stx$500.token.value[0],
                        range: stx$500.token.startRange,
                        lineNumber: stx$500.token.startLineNumber,
                        lineStart: stx$500.token.startLineStart
                    }, exposed$501.context);
                var closeParen$503 = syntaxFromToken$170({
                        type: parser$96.Token.Punctuator,
                        value: stx$500.token.value[1],
                        range: stx$500.token.endRange,
                        lineNumber: stx$500.token.endLineNumber,
                        lineStart: stx$500.token.endLineStart
                    }, exposed$501.context);
                return acc$499.concat(openParen$502).concat(flatten$228(exposed$501.token.inner)).concat(closeParen$503);
            }
            return acc$499.concat(stx$500);
        }, []);
    }
    exports$94.enforest = enforest$219;
    exports$94.expand = expandTopLevel$227;
    exports$94.resolve = resolve$174;
    exports$94.get_expression = get_expression$220;
    exports$94.Expr = Expr$187;
    exports$94.VariableStatement = VariableStatement$213;
    exports$94.tokensToSyntax = syn$97.tokensToSyntax;
    exports$94.syntaxToTokens = syn$97.syntaxToTokens;
}));