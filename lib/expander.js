(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        factory$85(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('escodegen'), require('./es6-module-loader'), require('./scopedEval'), require('./patterns'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'escodegen',
            'es6-module-loader',
            'scopedEval',
            'patterns'
        ], factory$85);
    }
}(this, function (exports$86, _$87, parser$88, syn$89, es6$90, codegen$91, modules$92, se$93, patternModule$94) {
    'use strict';
    exports$86._test = {};
    Object.prototype.create = function () {
        var o$223 = Object.create(this);
        if (typeof o$223.construct === 'function') {
            o$223.construct.apply(o$223, arguments);
        }
        return o$223;
    };
    Object.prototype.extend = function (properties$224) {
        var result$225 = Object.create(this);
        for (var prop$226 in properties$224) {
            if (properties$224.hasOwnProperty(prop$226)) {
                result$225[prop$226] = properties$224[prop$226];
            }
        }
        return result$225;
    };
    Object.prototype.hasPrototype = function (proto$227) {
        function F$228() {
        }
        F$228.prototype = proto$227;
        return this instanceof F$228;
    };
    function throwError$153(msg$229) {
        throw new Error(msg$229);
    }
    var Loader$154 = modules$92.Loader;
    var Module$155 = modules$92.Module;
    var scopedEval$156 = se$93.scopedEval;
    var Rename$157 = syn$89.Rename;
    var Mark$158 = syn$89.Mark;
    var Var$159 = syn$89.Var;
    var Def$160 = syn$89.Def;
    var isDef$161 = syn$89.isDef;
    var isMark$162 = syn$89.isMark;
    var isRename$163 = syn$89.isRename;
    var syntaxFromToken$164 = syn$89.syntaxFromToken;
    var mkSyntax$165 = syn$89.mkSyntax;
    function remdup$166(mark$230, mlist$231) {
        if (mark$230 === _$87.first(mlist$231)) {
            return _$87.rest(mlist$231, 1);
        }
        return [mark$230].concat(mlist$231);
    }
    function marksof$167(ctx$232, stopName$233, originalName$234) {
        var mark$235, submarks$236;
        if (isMark$162(ctx$232)) {
            mark$235 = ctx$232.mark;
            submarks$236 = marksof$167(ctx$232.context, stopName$233, originalName$234);
            return remdup$166(mark$235, submarks$236);
        }
        if (isDef$161(ctx$232)) {
            return marksof$167(ctx$232.context, stopName$233, originalName$234);
        }
        if (isRename$163(ctx$232)) {
            if (stopName$233 === originalName$234 + '$' + ctx$232.name) {
                return [];
            }
            return marksof$167(ctx$232.context, stopName$233, originalName$234);
        }
        return [];
    }
    function resolve$168(stx$237) {
        return resolveCtx$172(stx$237.token.value, stx$237.context, [], []);
    }
    function arraysEqual$169(a$238, b$239) {
        if (a$238.length !== b$239.length) {
            return false;
        }
        for (var i$240 = 0; i$240 < a$238.length; i$240++) {
            if (a$238[i$240] !== b$239[i$240]) {
                return false;
            }
        }
        return true;
    }
    function renames$170(defctx$241, oldctx$242, originalName$243) {
        var acc$244 = oldctx$242;
        for (var i$245 = 0; i$245 < defctx$241.length; i$245++) {
            if (defctx$241[i$245].id.token.value === originalName$243) {
                acc$244 = Rename$157(defctx$241[i$245].id, defctx$241[i$245].name, acc$244, defctx$241);
            }
        }
        return acc$244;
    }
    function unionEl$171(arr$246, el$247) {
        if (arr$246.indexOf(el$247) === -1) {
            var res$248 = arr$246.slice(0);
            res$248.push(el$247);
            return res$248;
        }
        return arr$246;
    }
    function resolveCtx$172(originalName$249, ctx$250, stop_spine$251, stop_branch$252) {
        if (isMark$162(ctx$250)) {
            return resolveCtx$172(originalName$249, ctx$250.context, stop_spine$251, stop_branch$252);
        }
        if (isDef$161(ctx$250)) {
            if (stop_spine$251.indexOf(ctx$250.defctx) !== -1) {
                return resolveCtx$172(originalName$249, ctx$250.context, stop_spine$251, stop_branch$252);
            } else {
                return resolveCtx$172(originalName$249, renames$170(ctx$250.defctx, ctx$250.context, originalName$249), stop_spine$251, unionEl$171(stop_branch$252, ctx$250.defctx));
            }
        }
        if (isRename$163(ctx$250)) {
            if (originalName$249 === ctx$250.id.token.value) {
                var idName$253 = resolveCtx$172(ctx$250.id.token.value, ctx$250.id.context, stop_branch$252, stop_branch$252);
                var subName$254 = resolveCtx$172(originalName$249, ctx$250.context, unionEl$171(stop_spine$251, ctx$250.def), stop_branch$252);
                if (idName$253 === subName$254) {
                    var idMarks$255 = marksof$167(ctx$250.id.context, originalName$249 + '$' + ctx$250.name, originalName$249);
                    var subMarks$256 = marksof$167(ctx$250.context, originalName$249 + '$' + ctx$250.name, originalName$249);
                    if (arraysEqual$169(idMarks$255, subMarks$256)) {
                        return originalName$249 + '$' + ctx$250.name;
                    }
                }
            }
            return resolveCtx$172(originalName$249, ctx$250.context, unionEl$171(stop_spine$251, ctx$250.def), stop_branch$252);
        }
        return originalName$249;
    }
    var nextFresh$173 = 0;
    function fresh$174() {
        return nextFresh$173++;
    }
    ;
    function joinSyntax$175(tojoin$257, punc$258) {
        if (tojoin$257.length === 0) {
            return [];
        }
        if (punc$258 === ' ') {
            return tojoin$257;
        }
        return _$87.reduce(_$87.rest(tojoin$257, 1), function (acc$259, join$260) {
            return acc$259.concat(mkSyntax$165(punc$258, parser$88.Token.Punctuator, join$260), join$260);
        }, [_$87.first(tojoin$257)]);
    }
    function wrapDelim$176(towrap$261, delimSyntax$262) {
        parser$88.assert(delimSyntax$262.token.type === parser$88.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$164({
            type: parser$88.Token.Delimiter,
            value: delimSyntax$262.token.value,
            inner: towrap$261,
            range: delimSyntax$262.token.range,
            startLineNumber: delimSyntax$262.token.startLineNumber,
            lineStart: delimSyntax$262.token.lineStart
        }, delimSyntax$262.context);
    }
    function getParamIdentifiers$177(argSyntax$263) {
        parser$88.assert(argSyntax$263.token.type === parser$88.Token.Delimiter, 'expecting delimiter for function params');
        return _$87.filter(argSyntax$263.token.inner, function (stx$264) {
            return stx$264.token.value !== ',';
        });
    }
    var TermTree$178 = {destruct: function () {
                return _$87.reduce(this.properties, _$87.bind(function (acc$265, prop$266) {
                    if (this[prop$266] && this[prop$266].hasPrototype(TermTree$178)) {
                        return acc$265.concat(this[prop$266].destruct());
                    } else if (this[prop$266] && this[prop$266].token && this[prop$266].token.inner) {
                        this[prop$266].token.inner = _$87.reduce(this[prop$266].token.inner, function (acc$267, t$268) {
                            if (t$268.hasPrototype(TermTree$178)) {
                                return acc$267.concat(t$268.destruct());
                            }
                            return acc$267.concat(t$268);
                        }, []);
                        return acc$265.concat(this[prop$266]);
                    } else if (this[prop$266]) {
                        return acc$265.concat(this[prop$266]);
                    } else {
                        return acc$265;
                    }
                }, this), []);
            }};
    var EOF$179 = TermTree$178.extend({
            properties: ['eof'],
            construct: function (e$269) {
                this.eof = e$269;
            }
        });
    var Statement$180 = TermTree$178.extend({construct: function () {
            }});
    var Expr$181 = TermTree$178.extend({construct: function () {
            }});
    var PrimaryExpression$182 = Expr$181.extend({construct: function () {
            }});
    var ThisExpression$183 = PrimaryExpression$182.extend({
            properties: ['this'],
            construct: function (that$270) {
                this.this = that$270;
            }
        });
    var Lit$184 = PrimaryExpression$182.extend({
            properties: ['lit'],
            construct: function (l$271) {
                this.lit = l$271;
            }
        });
    exports$86._test.PropertyAssignment = PropertyAssignment$185;
    var PropertyAssignment$185 = TermTree$178.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$272, assignment$273) {
                this.propName = propName$272;
                this.assignment = assignment$273;
            }
        });
    var Block$186 = PrimaryExpression$182.extend({
            properties: ['body'],
            construct: function (body$274) {
                this.body = body$274;
            }
        });
    var ArrayLiteral$187 = PrimaryExpression$182.extend({
            properties: ['array'],
            construct: function (ar$275) {
                this.array = ar$275;
            }
        });
    var ParenExpression$188 = PrimaryExpression$182.extend({
            properties: ['expr'],
            construct: function (expr$276) {
                this.expr = expr$276;
            }
        });
    var UnaryOp$189 = Expr$181.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$277, expr$278) {
                this.op = op$277;
                this.expr = expr$278;
            }
        });
    var PostfixOp$190 = Expr$181.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$279, op$280) {
                this.expr = expr$279;
                this.op = op$280;
            }
        });
    var BinOp$191 = Expr$181.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$281, left$282, right$283) {
                this.op = op$281;
                this.left = left$282;
                this.right = right$283;
            }
        });
    var ConditionalExpression$192 = Expr$181.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$284, question$285, tru$286, colon$287, fls$288) {
                this.cond = cond$284;
                this.question = question$285;
                this.tru = tru$286;
                this.colon = colon$287;
                this.fls = fls$288;
            }
        });
    var Keyword$193 = TermTree$178.extend({
            properties: ['keyword'],
            construct: function (k$289) {
                this.keyword = k$289;
            }
        });
    var Punc$194 = TermTree$178.extend({
            properties: ['punc'],
            construct: function (p$290) {
                this.punc = p$290;
            }
        });
    var Delimiter$195 = TermTree$178.extend({
            properties: ['delim'],
            construct: function (d$291) {
                this.delim = d$291;
            }
        });
    var Id$196 = PrimaryExpression$182.extend({
            properties: ['id'],
            construct: function (id$292) {
                this.id = id$292;
            }
        });
    var NamedFun$197 = Expr$181.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$293, name$294, params$295, body$296) {
                this.keyword = keyword$293;
                this.name = name$294;
                this.params = params$295;
                this.body = body$296;
            }
        });
    var AnonFun$198 = Expr$181.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$297, params$298, body$299) {
                this.keyword = keyword$297;
                this.params = params$298;
                this.body = body$299;
            }
        });
    var LetMacro$199 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$300, body$301) {
                this.name = name$300;
                this.body = body$301;
            }
        });
    var Macro$200 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$302, body$303) {
                this.name = name$302;
                this.body = body$303;
            }
        });
    var AnonMacro$201 = TermTree$178.extend({
            properties: ['body'],
            construct: function (body$304) {
                this.body = body$304;
            }
        });
    var Const$202 = Expr$181.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$305, call$306) {
                this.newterm = newterm$305;
                this.call = call$306;
            }
        });
    var Call$203 = Expr$181.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$88.assert(this.fun.hasPrototype(TermTree$178), 'expecting a term tree in destruct of call');
                var that$307 = this;
                this.delim = syntaxFromToken$164(_$87.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$87.reduce(this.args, function (acc$308, term$309) {
                    parser$88.assert(term$309 && term$309.hasPrototype(TermTree$178), 'expecting term trees in destruct of Call');
                    var dst$310 = acc$308.concat(term$309.destruct());
                    if (that$307.commas.length > 0) {
                        dst$310 = dst$310.concat(that$307.commas.shift());
                    }
                    return dst$310;
                }, []);
                return this.fun.destruct().concat(Delimiter$195.create(this.delim).destruct());
            },
            construct: function (funn$311, args$312, delim$313, commas$314) {
                parser$88.assert(Array.isArray(args$312), 'requires an array of arguments terms');
                this.fun = funn$311;
                this.args = args$312;
                this.delim = delim$313;
                this.commas = commas$314;
            }
        });
    var ObjDotGet$204 = Expr$181.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$315, dot$316, right$317) {
                this.left = left$315;
                this.dot = dot$316;
                this.right = right$317;
            }
        });
    var ObjGet$205 = Expr$181.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$318, right$319) {
                this.left = left$318;
                this.right = right$319;
            }
        });
    var VariableDeclaration$206 = TermTree$178.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$320, eqstx$321, init$322, comma$323) {
                this.ident = ident$320;
                this.eqstx = eqstx$321;
                this.init = init$322;
                this.comma = comma$323;
            }
        });
    var VariableStatement$207 = Statement$180.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$87.reduce(this.decls, function (acc$324, decl$325) {
                    return acc$324.concat(decl$325.destruct());
                }, []));
            },
            construct: function (varkw$326, decls$327) {
                parser$88.assert(Array.isArray(decls$327), 'decls must be an array');
                this.varkw = varkw$326;
                this.decls = decls$327;
            }
        });
    var CatchClause$208 = TermTree$178.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$328, params$329, body$330) {
                this.catchkw = catchkw$328;
                this.params = params$329;
                this.body = body$330;
            }
        });
    var Empty$209 = TermTree$178.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$210(stx$331) {
        var staticOperators$332 = [
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
        return _$87.contains(staticOperators$332, stx$331.token.value);
    }
    function stxIsBinOp$211(stx$333) {
        var staticOperators$334 = [
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
        return _$87.contains(staticOperators$334, stx$333.token.value);
    }
    function enforestVarStatement$212(stx$335, env$336) {
        var decls$337 = [];
        var res$338 = enforest$213(stx$335, env$336);
        var result$339 = res$338.result;
        var rest$340 = res$338.rest;
        if (rest$340[0]) {
            var nextRes$341 = enforest$213(rest$340, env$336);
            if (nextRes$341.result.hasPrototype(Punc$194) && nextRes$341.result.punc.token.value === '=') {
                var initializerRes$342 = enforest$213(nextRes$341.rest, env$336);
                if (initializerRes$342.rest[0]) {
                    var restRes$343 = enforest$213(initializerRes$342.rest, env$336);
                    if (restRes$343.result.hasPrototype(Punc$194) && restRes$343.result.punc.token.value === ',') {
                        decls$337.push(VariableDeclaration$206.create(result$339.id, nextRes$341.result.punc, initializerRes$342.result, restRes$343.result.punc));
                        var subRes$344 = enforestVarStatement$212(restRes$343.rest, env$336);
                        decls$337 = decls$337.concat(subRes$344.result);
                        rest$340 = subRes$344.rest;
                    } else {
                        decls$337.push(VariableDeclaration$206.create(result$339.id, nextRes$341.result.punc, initializerRes$342.result));
                        rest$340 = initializerRes$342.rest;
                    }
                } else {
                    decls$337.push(VariableDeclaration$206.create(result$339.id, nextRes$341.result.punc, initializerRes$342.result));
                }
            } else if (nextRes$341.result.hasPrototype(Punc$194) && nextRes$341.result.punc.token.value === ',') {
                decls$337.push(VariableDeclaration$206.create(result$339.id, null, null, nextRes$341.result.punc));
                var subRes$344 = enforestVarStatement$212(nextRes$341.rest, env$336);
                decls$337 = decls$337.concat(subRes$344.result);
                rest$340 = subRes$344.rest;
            } else {
                if (result$339.hasPrototype(Id$196)) {
                    decls$337.push(VariableDeclaration$206.create(result$339.id));
                } else {
                    throwError$153('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$339.hasPrototype(Id$196)) {
                decls$337.push(VariableDeclaration$206.create(result$339.id));
            } else if (result$339.hasPrototype(BinOp$191) && result$339.op.token.value === 'in') {
                decls$337.push(VariableDeclaration$206.create(result$339.left.id, result$339.op, result$339.right));
            } else {
                throwError$153('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$337,
            rest: rest$340
        };
    }
    function enforest$213(toks$345, env$346) {
        env$346 = env$346 || new Map();
        parser$88.assert(toks$345.length > 0, 'enforest assumes there are tokens to work with');
        function step$347(head$348, rest$349) {
            var innerTokens$350;
            parser$88.assert(Array.isArray(rest$349), 'result must at least be an empty array');
            if (head$348.hasPrototype(TermTree$178)) {
                var emp$353 = head$348.emp;
                var emp$353 = head$348.emp;
                var keyword$356 = head$348.keyword;
                var delim$358 = head$348.delim;
                var emp$353 = head$348.emp;
                var punc$361 = head$348.punc;
                var keyword$356 = head$348.keyword;
                var emp$353 = head$348.emp;
                var emp$353 = head$348.emp;
                var emp$353 = head$348.emp;
                var delim$358 = head$348.delim;
                var delim$358 = head$348.delim;
                var keyword$356 = head$348.keyword;
                var keyword$356 = head$348.keyword;
                if (head$348.hasPrototype(Expr$181) && (rest$349[0] && rest$349[0].token.type === parser$88.Token.Delimiter && rest$349[0].token.value === '()')) {
                    var argRes$386, enforestedArgs$387 = [], commas$388 = [];
                    rest$349[0].expose();
                    innerTokens$350 = rest$349[0].token.inner;
                    while (innerTokens$350.length > 0) {
                        argRes$386 = enforest$213(innerTokens$350, env$346);
                        enforestedArgs$387.push(argRes$386.result);
                        innerTokens$350 = argRes$386.rest;
                        if (innerTokens$350[0] && innerTokens$350[0].token.value === ',') {
                            commas$388.push(innerTokens$350[0]);
                            innerTokens$350 = innerTokens$350.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$389 = _$87.all(enforestedArgs$387, function (argTerm$390) {
                            return argTerm$390.hasPrototype(Expr$181);
                        });
                    if (innerTokens$350.length === 0 && argsAreExprs$389) {
                        return step$347(Call$203.create(head$348, enforestedArgs$387, rest$349[0], commas$388), rest$349.slice(1));
                    }
                } else if (head$348.hasPrototype(Expr$181) && (rest$349[0] && rest$349[0].token.value === '?')) {
                    var question$391 = rest$349[0];
                    var condRes$392 = enforest$213(rest$349.slice(1), env$346);
                    var truExpr$393 = condRes$392.result;
                    var right$394 = condRes$392.rest;
                    if (truExpr$393.hasPrototype(Expr$181) && right$394[0] && right$394[0].token.value === ':') {
                        var colon$395 = right$394[0];
                        var flsRes$396 = enforest$213(right$394.slice(1), env$346);
                        var flsExpr$397 = flsRes$396.result;
                        if (flsExpr$397.hasPrototype(Expr$181)) {
                            return step$347(ConditionalExpression$192.create(head$348, question$391, truExpr$393, colon$395, flsExpr$397), flsRes$396.rest);
                        }
                    }
                } else if (head$348.hasPrototype(Keyword$193) && (keyword$356.token.value === 'new' && rest$349[0])) {
                    var newCallRes$398 = enforest$213(rest$349, env$346);
                    if (newCallRes$398.result.hasPrototype(Call$203)) {
                        return step$347(Const$202.create(head$348, newCallRes$398.result), newCallRes$398.rest);
                    }
                } else if (head$348.hasPrototype(Delimiter$195) && delim$358.token.value === '()') {
                    innerTokens$350 = delim$358.token.inner;
                    if (innerTokens$350.length === 0) {
                        return step$347(ParenExpression$188.create(head$348), rest$349);
                    } else {
                        var innerTerm$399 = get_expression$214(innerTokens$350, env$346);
                        if (innerTerm$399.result && innerTerm$399.result.hasPrototype(Expr$181)) {
                            return step$347(ParenExpression$188.create(head$348), rest$349);
                        }
                    }
                } else if (head$348.hasPrototype(TermTree$178) && (rest$349[0] && rest$349[1] && stxIsBinOp$211(rest$349[0]))) {
                    var op$400 = rest$349[0];
                    var left$401 = head$348;
                    var bopRes$402 = enforest$213(rest$349.slice(1), env$346);
                    var right$394 = bopRes$402.result;
                    if (right$394.hasPrototype(Expr$181)) {
                        return step$347(BinOp$191.create(op$400, left$401, right$394), bopRes$402.rest);
                    }
                } else if (head$348.hasPrototype(Punc$194) && stxIsUnaryOp$210(punc$361)) {
                    var unopRes$403 = enforest$213(rest$349, env$346);
                    if (unopRes$403.result.hasPrototype(Expr$181)) {
                        return step$347(UnaryOp$189.create(punc$361, unopRes$403.result), unopRes$403.rest);
                    }
                } else if (head$348.hasPrototype(Keyword$193) && stxIsUnaryOp$210(keyword$356)) {
                    var unopRes$403 = enforest$213(rest$349, env$346);
                    if (unopRes$403.result.hasPrototype(Expr$181)) {
                        return step$347(UnaryOp$189.create(keyword$356, unopRes$403.result), unopRes$403.rest);
                    }
                } else if (head$348.hasPrototype(Expr$181) && (rest$349[0] && (rest$349[0].token.value === '++' || rest$349[0].token.value === '--'))) {
                    return step$347(PostfixOp$190.create(head$348, rest$349[0]), rest$349.slice(1));
                } else if (head$348.hasPrototype(Expr$181) && (rest$349[0] && rest$349[0].token.value === '[]')) {
                    return step$347(ObjGet$205.create(head$348, Delimiter$195.create(rest$349[0].expose())), rest$349.slice(1));
                } else if (head$348.hasPrototype(Expr$181) && (rest$349[0] && rest$349[0].token.value === '.' && rest$349[1] && rest$349[1].token.type === parser$88.Token.Identifier)) {
                    return step$347(ObjDotGet$204.create(head$348, rest$349[0], rest$349[1]), rest$349.slice(2));
                } else if (head$348.hasPrototype(Delimiter$195) && delim$358.token.value === '[]') {
                    return step$347(ArrayLiteral$187.create(head$348), rest$349);
                } else if (head$348.hasPrototype(Delimiter$195) && head$348.delim.token.value === '{}') {
                    return step$347(Block$186.create(head$348), rest$349);
                } else if (head$348.hasPrototype(Keyword$193) && (keyword$356.token.value === 'let' && (rest$349[0] && rest$349[0].token.type === parser$88.Token.Identifier || rest$349[0] && rest$349[0].token.type === parser$88.Token.Keyword) && rest$349[1] && rest$349[1].token.value === '=' && rest$349[2] && rest$349[2].token.value === 'macro')) {
                    var mac$404 = enforest$213(rest$349.slice(2), env$346);
                    if (!mac$404.result.hasPrototype(AnonMacro$201)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding');
                    }
                    return step$347(LetMacro$199.create(rest$349[0], mac$404.result.body), mac$404.rest);
                } else if (head$348.hasPrototype(Keyword$193) && (keyword$356.token.value === 'var' && rest$349[0])) {
                    var vsRes$405 = enforestVarStatement$212(rest$349, env$346);
                    if (vsRes$405) {
                        return step$347(VariableStatement$207.create(head$348, vsRes$405.result), vsRes$405.rest);
                    }
                }
            } else {
                parser$88.assert(head$348 && head$348.token, 'assuming head is a syntax object');
                if ((head$348.token.type === parser$88.Token.Identifier || head$348.token.type === parser$88.Token.Keyword) && env$346.has(head$348.token.value) && env$346.get(head$348.token.value).name === resolve$168(head$348)) {
                    var transformer$406 = env$346.get(head$348.token.value).fn;
                    var rt$407 = transformer$406([head$348].concat(rest$349), env$346);
                    if (!Array.isArray(rt$407.result)) {
                        throwError$153('Macro transformer must return a result array, not: ' + rt$407.result);
                    }
                    if (rt$407.result.length > 0) {
                        return step$347(rt$407.result[0], rt$407.result.slice(1).concat(rt$407.rest));
                    } else {
                        return step$347(Empty$209.create(), rt$407.rest);
                    }
                } else if (head$348.token.type === parser$88.Token.Identifier && head$348.token.value === 'macro' && rest$349[0] && rest$349[0].token.value === '{}') {
                    return step$347(AnonMacro$201.create(rest$349[0].expose().token.inner), rest$349.slice(1));
                } else if (head$348.token.type === parser$88.Token.Identifier && head$348.token.value === 'macro' && rest$349[0] && (rest$349[0].token.type === parser$88.Token.Identifier || rest$349[0].token.type === parser$88.Token.Keyword) && rest$349[1] && rest$349[1].token.type === parser$88.Token.Delimiter && rest$349[1].token.value === '{}') {
                    return step$347(Macro$200.create(rest$349[0], rest$349[1].expose().token.inner), rest$349.slice(2));
                } else if (head$348.token.type === parser$88.Token.Keyword && head$348.token.value === 'function' && rest$349[0] && rest$349[0].token.type === parser$88.Token.Identifier && rest$349[1] && rest$349[1].token.type === parser$88.Token.Delimiter && rest$349[1].token.value === '()' && rest$349[2] && rest$349[2].token.type === parser$88.Token.Delimiter && rest$349[2].token.value === '{}') {
                    rest$349[1].token.inner = rest$349[1].expose().token.inner;
                    rest$349[2].token.inner = rest$349[2].expose().token.inner;
                    return step$347(NamedFun$197.create(head$348, rest$349[0], rest$349[1], rest$349[2]), rest$349.slice(3));
                } else if (head$348.token.type === parser$88.Token.Keyword && head$348.token.value === 'function' && rest$349[0] && rest$349[0].token.type === parser$88.Token.Delimiter && rest$349[0].token.value === '()' && rest$349[1] && rest$349[1].token.type === parser$88.Token.Delimiter && rest$349[1].token.value === '{}') {
                    rest$349[0].token.inner = rest$349[0].expose().token.inner;
                    rest$349[1].token.inner = rest$349[1].expose().token.inner;
                    return step$347(AnonFun$198.create(head$348, rest$349[0], rest$349[1]), rest$349.slice(2));
                } else if (head$348.token.type === parser$88.Token.Keyword && head$348.token.value === 'catch' && rest$349[0] && rest$349[0].token.type === parser$88.Token.Delimiter && rest$349[0].token.value === '()' && rest$349[1] && rest$349[1].token.type === parser$88.Token.Delimiter && rest$349[1].token.value === '{}') {
                    rest$349[0].token.inner = rest$349[0].expose().token.inner;
                    rest$349[1].token.inner = rest$349[1].expose().token.inner;
                    return step$347(CatchClause$208.create(head$348, rest$349[0], rest$349[1]), rest$349.slice(2));
                } else if (head$348.token.type === parser$88.Token.Keyword && head$348.token.value === 'this') {
                    return step$347(ThisExpression$183.create(head$348), rest$349);
                } else if (head$348.token.type === parser$88.Token.NumericLiteral || head$348.token.type === parser$88.Token.StringLiteral || head$348.token.type === parser$88.Token.BooleanLiteral || head$348.token.type === parser$88.Token.RegexLiteral || head$348.token.type === parser$88.Token.NullLiteral) {
                    return step$347(Lit$184.create(head$348), rest$349);
                } else if (head$348.token.type === parser$88.Token.Identifier) {
                    return step$347(Id$196.create(head$348), rest$349);
                } else if (head$348.token.type === parser$88.Token.Punctuator) {
                    return step$347(Punc$194.create(head$348), rest$349);
                } else if (head$348.token.type === parser$88.Token.Keyword && head$348.token.value === 'with') {
                    throwError$153('with is not supported in sweet.js');
                } else if (head$348.token.type === parser$88.Token.Keyword) {
                    return step$347(Keyword$193.create(head$348), rest$349);
                } else if (head$348.token.type === parser$88.Token.Delimiter) {
                    return step$347(Delimiter$195.create(head$348.expose()), rest$349);
                } else if (head$348.token.type === parser$88.Token.EOF) {
                    parser$88.assert(rest$349.length === 0, 'nothing should be after an EOF');
                    return step$347(EOF$179.create(head$348), []);
                } else {
                    parser$88.assert(false, 'not implemented');
                }
            }
            return {
                result: head$348,
                rest: rest$349
            };
        }
        return step$347(toks$345[0], toks$345.slice(1));
    }
    function get_expression$214(stx$408, env$409) {
        var res$410 = enforest$213(stx$408, env$409);
        if (!res$410.result.hasPrototype(Expr$181)) {
            return {
                result: null,
                rest: stx$408
            };
        }
        return res$410;
    }
    function applyMarkToPatternEnv$215(newMark$411, env$412) {
        function dfs$413(match$414) {
            if (match$414.level === 0) {
                match$414.match = _$87.map(match$414.match, function (stx$415) {
                    return stx$415.mark(newMark$411);
                });
            } else {
                _$87.each(match$414.match, function (match$416) {
                    dfs$413(match$416);
                });
            }
        }
        _$87.keys(env$412).forEach(function (key$417) {
            dfs$413(env$412[key$417]);
        });
    }
    function loadMacroDef$216(mac$418, env$419, defscope$420, templateMap$421) {
        var body$422 = mac$418.body;
        if (!(body$422[0] && body$422[0].token.type === parser$88.Token.Keyword && body$422[0].token.value === 'function')) {
            throwError$153('Primitive macro form must contain a function for the macro body');
        }
        var stub$423 = parser$88.read('()');
        stub$423[0].token.inner = body$422;
        var expanded$424 = expand$220(stub$423, env$419, defscope$420, templateMap$421);
        expanded$424 = expanded$424[0].destruct().concat(expanded$424[1].eof);
        var flattend$425 = flatten$222(expanded$424);
        var bodyCode$426 = codegen$91.generate(parser$88.parse(flattend$425));
        var macroFn$427 = scopedEval$156(bodyCode$426, {
                makeValue: syn$89.makeValue,
                makeRegex: syn$89.makeRegex,
                makeIdent: syn$89.makeIdent,
                makeKeyword: syn$89.makeKeyword,
                makePunc: syn$89.makePunc,
                makeDelim: syn$89.makeDelim,
                unwrapSyntax: syn$89.unwrapSyntax,
                fresh: fresh$174,
                _: _$87,
                parser: parser$88,
                patternModule: patternModule$94,
                getTemplate: function (id$428) {
                    return templateMap$421.get(id$428);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$215,
                mergeMatches: function (newMatch$429, oldMatch$430) {
                    newMatch$429.patternEnv = _$87.extend({}, oldMatch$430.patternEnv, newMatch$429.patternEnv);
                    return newMatch$429;
                }
            });
        return macroFn$427;
    }
    function expandToTermTree$217(stx$431, env$432, defscope$433, templateMap$434) {
        parser$88.assert(env$432, 'environment map is required');
        if (stx$431.length === 0) {
            return {
                terms: [],
                env: env$432
            };
        }
        parser$88.assert(stx$431[0].token, 'expecting a syntax object');
        var f$435 = enforest$213(stx$431, env$432);
        var head$436 = f$435.result;
        var rest$437 = f$435.rest;
        if (head$436.hasPrototype(Macro$200)) {
            var macroDefinition$439 = loadMacroDef$216(head$436, env$432, defscope$433, templateMap$434);
            addToDefinitionCtx$218([head$436.name], defscope$433, false);
            env$432.set(head$436.name.token.value, {
                name: resolve$168(head$436.name),
                fn: macroDefinition$439
            });
            return expandToTermTree$217(rest$437, env$432, defscope$433, templateMap$434);
        }
        if (head$436.hasPrototype(LetMacro$199)) {
            var macroDefinition$439 = loadMacroDef$216(head$436, env$432, defscope$433, templateMap$434);
            var freshName$440 = fresh$174();
            var renamedName$441 = head$436.name.rename(head$436.name, freshName$440);
            rest$437 = _$87.map(rest$437, function (stx$442) {
                return stx$442.rename(head$436.name, freshName$440);
            });
            head$436.name = renamedName$441;
            env$432.set(head$436.name.token.value, {
                name: resolve$168(head$436.name),
                fn: macroDefinition$439
            });
            return expandToTermTree$217(rest$437, env$432, defscope$433, templateMap$434);
        }
        if (head$436.hasPrototype(NamedFun$197)) {
            addToDefinitionCtx$218([head$436.name], defscope$433, true);
        }
        if (head$436.hasPrototype(Id$196) && head$436.id.token.value === '#quoteSyntax' && rest$437[0] && rest$437[0].token.value === '{}') {
            var tempId$443 = fresh$174();
            templateMap$434.set(tempId$443, rest$437[0].token.inner);
            return expandToTermTree$217([
                syn$89.makeIdent('getTemplate', head$436.id),
                syn$89.makeDelim('()', [syn$89.makeValue(tempId$443, head$436.id)])
            ].concat(rest$437.slice(1)), env$432, defscope$433, templateMap$434);
        }
        if (head$436.hasPrototype(VariableStatement$207)) {
            addToDefinitionCtx$218(_$87.map(head$436.decls, function (decl$444) {
                return decl$444.ident;
            }), defscope$433, true);
        }
        if (head$436.hasPrototype(Block$186) && head$436.body.hasPrototype(Delimiter$195)) {
            head$436.body.delim.token.inner.forEach(function (term$445) {
                if (term$445.hasPrototype(VariableStatement$207)) {
                    addToDefinitionCtx$218(_$87.map(term$445.decls, function (decl$446) {
                        return decl$446.ident;
                    }), defscope$433, true);
                }
            });
        }
        if (head$436.hasPrototype(Delimiter$195)) {
            head$436.delim.token.inner.forEach(function (term$447) {
                if (term$447.hasPrototype(VariableStatement$207)) {
                    addToDefinitionCtx$218(_$87.map(term$447.decls, function (decl$448) {
                        return decl$448.ident;
                    }), defscope$433, true);
                }
            });
        }
        var trees$438 = expandToTermTree$217(rest$437, env$432, defscope$433, templateMap$434);
        return {
            terms: [head$436].concat(trees$438.terms),
            env: trees$438.env
        };
    }
    function addToDefinitionCtx$218(idents$449, defscope$450, skipRep$451) {
        parser$88.assert(idents$449 && idents$449.length > 0, 'expecting some variable identifiers');
        skipRep$451 = skipRep$451 || false;
        _$87.each(idents$449, function (id$452) {
            var skip$453 = false;
            if (skipRep$451) {
                var declRepeat$454 = _$87.find(defscope$450, function (def$455) {
                        return def$455.id.token.value === id$452.token.value && arraysEqual$169(marksof$167(def$455.id.context), marksof$167(id$452.context));
                    });
                skip$453 = typeof declRepeat$454 !== 'undefined';
            }
            if (!skip$453) {
                var name$456 = fresh$174();
                defscope$450.push({
                    id: id$452,
                    name: name$456
                });
            }
        });
    }
    function expandTermTreeToFinal$219(term$457, env$458, defscope$459, templateMap$460) {
        parser$88.assert(env$458, 'environment map is required');
        if (term$457.hasPrototype(ArrayLiteral$187)) {
            term$457.array.delim.token.inner = expand$220(term$457.array.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(Block$186)) {
            term$457.body.delim.token.inner = expand$220(term$457.body.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(ParenExpression$188)) {
            term$457.expr.delim.token.inner = expand$220(term$457.expr.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(Call$203)) {
            term$457.fun = expandTermTreeToFinal$219(term$457.fun, env$458, defscope$459, templateMap$460);
            term$457.args = _$87.map(term$457.args, function (arg$461) {
                return expandTermTreeToFinal$219(arg$461, env$458, defscope$459, templateMap$460);
            });
            return term$457;
        } else if (term$457.hasPrototype(UnaryOp$189)) {
            term$457.expr = expandTermTreeToFinal$219(term$457.expr, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(BinOp$191)) {
            term$457.left = expandTermTreeToFinal$219(term$457.left, env$458, defscope$459, templateMap$460);
            term$457.right = expandTermTreeToFinal$219(term$457.right, env$458, defscope$459);
            return term$457;
        } else if (term$457.hasPrototype(ObjGet$205)) {
            term$457.right.delim.token.inner = expand$220(term$457.right.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(ObjDotGet$204)) {
            term$457.left = expandTermTreeToFinal$219(term$457.left, env$458, defscope$459, templateMap$460);
            term$457.right = expandTermTreeToFinal$219(term$457.right, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(VariableDeclaration$206)) {
            if (term$457.init) {
                term$457.init = expandTermTreeToFinal$219(term$457.init, env$458, defscope$459, templateMap$460);
            }
            return term$457;
        } else if (term$457.hasPrototype(VariableStatement$207)) {
            term$457.decls = _$87.map(term$457.decls, function (decl$462) {
                return expandTermTreeToFinal$219(decl$462, env$458, defscope$459, templateMap$460);
            });
            return term$457;
        } else if (term$457.hasPrototype(Delimiter$195)) {
            term$457.delim.token.inner = expand$220(term$457.delim.token.inner, env$458, defscope$459, templateMap$460);
            return term$457;
        } else if (term$457.hasPrototype(NamedFun$197) || term$457.hasPrototype(AnonFun$198) || term$457.hasPrototype(CatchClause$208)) {
            var newDef$463 = [];
            var params$464 = term$457.params.addDefCtx(newDef$463);
            var bodies$465 = term$457.body.addDefCtx(newDef$463);
            var paramNames$466 = _$87.map(getParamIdentifiers$177(params$464), function (param$473) {
                    var freshName$474 = fresh$174();
                    return {
                        freshName: freshName$474,
                        originalParam: param$473,
                        renamedParam: param$473.rename(param$473, freshName$474)
                    };
                });
            var renamedBody$467 = _$87.reduce(paramNames$466, function (accBody$475, p$476) {
                    return accBody$475.rename(p$476.originalParam, p$476.freshName);
                }, bodies$465);
            renamedBody$467 = renamedBody$467.expose();
            var bodyTerms$468 = expand$220([renamedBody$467], env$458, newDef$463, templateMap$460);
            parser$88.assert(bodyTerms$468.length === 1 && bodyTerms$468[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$469 = _$87.map(paramNames$466, function (p$477) {
                    return p$477.renamedParam;
                });
            var flatArgs$470 = wrapDelim$176(joinSyntax$175(renamedParams$469, ','), term$457.params);
            var expandedArgs$471 = expand$220([flatArgs$470], env$458, newDef$463, templateMap$460);
            parser$88.assert(expandedArgs$471.length === 1, 'should only get back one result');
            term$457.params = expandedArgs$471[0];
            var flattenedBody$472 = bodyTerms$468[0].destruct();
            flattenedBody$472 = _$87.reduce(newDef$463, function (acc$478, def$479) {
                return acc$478.rename(def$479.id, def$479.name);
            }, flattenedBody$472[0]);
            term$457.body = flattenedBody$472;
            return term$457;
        }
        return term$457;
    }
    function expand$220(stx$480, env$481, defscope$482, templateMap$483) {
        env$481 = env$481 || new Map();
        templateMap$483 = templateMap$483 || new Map();
        var trees$484 = expandToTermTree$217(stx$480, env$481, defscope$482, templateMap$483);
        return _$87.map(trees$484.terms, function (term$485) {
            return expandTermTreeToFinal$219(term$485, trees$484.env, defscope$482, templateMap$483);
        });
    }
    function expandTopLevel$221(stx$486) {
        var funn$487 = syntaxFromToken$164({
                value: 'function',
                type: parser$88.Token.Keyword
            });
        var params$488 = syntaxFromToken$164({
                value: '()',
                type: parser$88.Token.Delimiter,
                inner: []
            });
        var body$489 = syntaxFromToken$164({
                value: '{}',
                type: parser$88.Token.Delimiter,
                inner: stx$486
            });
        var res$490 = expand$220([
                funn$487,
                params$488,
                body$489
            ]);
        res$490 = flatten$222([res$490[0].body]);
        return _$87.map(res$490.slice(1, res$490.length - 1), function (stx$491) {
            return stx$491;
        });
    }
    function flatten$222(stx$492) {
        return _$87.reduce(stx$492, function (acc$493, stx$494) {
            if (stx$494.token.type === parser$88.Token.Delimiter) {
                var exposed$495 = stx$494.expose();
                var openParen$496 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$494.token.value[0],
                        range: stx$494.token.startRange,
                        lineNumber: stx$494.token.startLineNumber,
                        lineStart: stx$494.token.startLineStart
                    }, exposed$495.context);
                var closeParen$497 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$494.token.value[1],
                        range: stx$494.token.endRange,
                        lineNumber: stx$494.token.endLineNumber,
                        lineStart: stx$494.token.endLineStart
                    }, exposed$495.context);
                return acc$493.concat(openParen$496).concat(flatten$222(exposed$495.token.inner)).concat(closeParen$497);
            }
            return acc$493.concat(stx$494);
        }, []);
    }
    exports$86.enforest = enforest$213;
    exports$86.expand = expandTopLevel$221;
    exports$86.resolve = resolve$168;
    exports$86.get_expression = get_expression$214;
    exports$86.Expr = Expr$181;
    exports$86.VariableStatement = VariableStatement$207;
    exports$86.tokensToSyntax = syn$89.tokensToSyntax;
}));