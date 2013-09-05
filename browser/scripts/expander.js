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
        var o$222 = Object.create(this);
        if (typeof o$222.construct === 'function') {
            o$222.construct.apply(o$222, arguments);
        }
        return o$222;
    };
    Object.prototype.extend = function (properties$223) {
        var result$224 = Object.create(this);
        for (var prop$225 in properties$223) {
            if (properties$223.hasOwnProperty(prop$225)) {
                result$224[prop$225] = properties$223[prop$225];
            }
        }
        return result$224;
    };
    Object.prototype.hasPrototype = function (proto$226) {
        function F$227() {
        }
        F$227.prototype = proto$226;
        return this instanceof F$227;
    };
    function throwError$153(msg$228) {
        throw new Error(msg$228);
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
    function remdup$166(mark$229, mlist$230) {
        if (mark$229 === _$87.first(mlist$230)) {
            return _$87.rest(mlist$230, 1);
        }
        return [mark$229].concat(mlist$230);
    }
    function marksof$167(ctx$231, stopName$232, originalName$233) {
        var mark$234, submarks$235;
        if (isMark$162(ctx$231)) {
            mark$234 = ctx$231.mark;
            submarks$235 = marksof$167(ctx$231.context, stopName$232, originalName$233);
            return remdup$166(mark$234, submarks$235);
        }
        if (isDef$161(ctx$231)) {
            return marksof$167(ctx$231.context, stopName$232, originalName$233);
        }
        if (isRename$163(ctx$231)) {
            if (stopName$232 === originalName$233 + '$' + ctx$231.name) {
                return [];
            }
            return marksof$167(ctx$231.context, stopName$232, originalName$233);
        }
        return [];
    }
    function resolve$168(stx$236) {
        return resolveCtx$172(stx$236.token.value, stx$236.context, [], []);
    }
    function arraysEqual$169(a$237, b$238) {
        if (a$237.length !== b$238.length) {
            return false;
        }
        for (var i$239 = 0; i$239 < a$237.length; i$239++) {
            if (a$237[i$239] !== b$238[i$239]) {
                return false;
            }
        }
        return true;
    }
    function renames$170(defctx$240, oldctx$241, originalName$242) {
        var acc$243 = oldctx$241;
        for (var i$244 = 0; i$244 < defctx$240.length; i$244++) {
            if (defctx$240[i$244].id.token.value === originalName$242) {
                acc$243 = Rename$157(defctx$240[i$244].id, defctx$240[i$244].name, acc$243, defctx$240);
            }
        }
        return acc$243;
    }
    function unionEl$171(arr$245, el$246) {
        if (arr$245.indexOf(el$246) === -1) {
            var res$247 = arr$245.slice(0);
            res$247.push(el$246);
            return res$247;
        }
        return arr$245;
    }
    function resolveCtx$172(originalName$248, ctx$249, stop_spine$250, stop_branch$251) {
        if (isMark$162(ctx$249)) {
            return resolveCtx$172(originalName$248, ctx$249.context, stop_spine$250, stop_branch$251);
        }
        if (isDef$161(ctx$249)) {
            if (stop_spine$250.indexOf(ctx$249.defctx) !== -1) {
                return resolveCtx$172(originalName$248, ctx$249.context, stop_spine$250, stop_branch$251);
            } else {
                return resolveCtx$172(originalName$248, renames$170(ctx$249.defctx, ctx$249.context, originalName$248), stop_spine$250, unionEl$171(stop_branch$251, ctx$249.defctx));
            }
        }
        if (isRename$163(ctx$249)) {
            if (originalName$248 === ctx$249.id.token.value) {
                var idName$252 = resolveCtx$172(ctx$249.id.token.value, ctx$249.id.context, stop_branch$251, stop_branch$251);
                var subName$253 = resolveCtx$172(originalName$248, ctx$249.context, unionEl$171(stop_spine$250, ctx$249.def), stop_branch$251);
                if (idName$252 === subName$253) {
                    var idMarks$254 = marksof$167(ctx$249.id.context, originalName$248 + '$' + ctx$249.name, originalName$248);
                    var subMarks$255 = marksof$167(ctx$249.context, originalName$248 + '$' + ctx$249.name, originalName$248);
                    if (arraysEqual$169(idMarks$254, subMarks$255)) {
                        return originalName$248 + '$' + ctx$249.name;
                    }
                }
            }
            return resolveCtx$172(originalName$248, ctx$249.context, unionEl$171(stop_spine$250, ctx$249.def), stop_branch$251);
        }
        return originalName$248;
    }
    var nextFresh$173 = 0;
    function fresh$174() {
        return nextFresh$173++;
    }
    ;
    function joinSyntax$175(tojoin$256, punc$257) {
        if (tojoin$256.length === 0) {
            return [];
        }
        if (punc$257 === ' ') {
            return tojoin$256;
        }
        return _$87.reduce(_$87.rest(tojoin$256, 1), function (acc$258, join$259) {
            return acc$258.concat(mkSyntax$165(punc$257, parser$88.Token.Punctuator, join$259), join$259);
        }, [_$87.first(tojoin$256)]);
    }
    function wrapDelim$176(towrap$260, delimSyntax$261) {
        parser$88.assert(delimSyntax$261.token.type === parser$88.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$164({
            type: parser$88.Token.Delimiter,
            value: delimSyntax$261.token.value,
            inner: towrap$260,
            range: delimSyntax$261.token.range,
            startLineNumber: delimSyntax$261.token.startLineNumber,
            lineStart: delimSyntax$261.token.lineStart
        }, delimSyntax$261.context);
    }
    function getParamIdentifiers$177(argSyntax$262) {
        parser$88.assert(argSyntax$262.token.type === parser$88.Token.Delimiter, 'expecting delimiter for function params');
        return _$87.filter(argSyntax$262.token.inner, function (stx$263) {
            return stx$263.token.value !== ',';
        });
    }
    var TermTree$178 = {destruct: function () {
                return _$87.reduce(this.properties, _$87.bind(function (acc$264, prop$265) {
                    if (this[prop$265] && this[prop$265].hasPrototype(TermTree$178)) {
                        return acc$264.concat(this[prop$265].destruct());
                    } else if (this[prop$265] && this[prop$265].token && this[prop$265].token.inner) {
                        this[prop$265].token.inner = _$87.reduce(this[prop$265].token.inner, function (acc$266, t$267) {
                            if (t$267.hasPrototype(TermTree$178)) {
                                return acc$266.concat(t$267.destruct());
                            }
                            return acc$266.concat(t$267);
                        }, []);
                        return acc$264.concat(this[prop$265]);
                    } else if (this[prop$265]) {
                        return acc$264.concat(this[prop$265]);
                    } else {
                        return acc$264;
                    }
                }, this), []);
            }};
    var EOF$179 = TermTree$178.extend({
            properties: ['eof'],
            construct: function (e$268) {
                this.eof = e$268;
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
            construct: function (that$269) {
                this.this = that$269;
            }
        });
    var Lit$184 = PrimaryExpression$182.extend({
            properties: ['lit'],
            construct: function (l$270) {
                this.lit = l$270;
            }
        });
    exports$86._test.PropertyAssignment = PropertyAssignment$185;
    var PropertyAssignment$185 = TermTree$178.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$271, assignment$272) {
                this.propName = propName$271;
                this.assignment = assignment$272;
            }
        });
    var Block$186 = PrimaryExpression$182.extend({
            properties: ['body'],
            construct: function (body$273) {
                this.body = body$273;
            }
        });
    var ArrayLiteral$187 = PrimaryExpression$182.extend({
            properties: ['array'],
            construct: function (ar$274) {
                this.array = ar$274;
            }
        });
    var ParenExpression$188 = PrimaryExpression$182.extend({
            properties: ['expr'],
            construct: function (expr$275) {
                this.expr = expr$275;
            }
        });
    var UnaryOp$189 = Expr$181.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$276, expr$277) {
                this.op = op$276;
                this.expr = expr$277;
            }
        });
    var PostfixOp$190 = Expr$181.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$278, op$279) {
                this.expr = expr$278;
                this.op = op$279;
            }
        });
    var BinOp$191 = Expr$181.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$280, left$281, right$282) {
                this.op = op$280;
                this.left = left$281;
                this.right = right$282;
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
            construct: function (cond$283, question$284, tru$285, colon$286, fls$287) {
                this.cond = cond$283;
                this.question = question$284;
                this.tru = tru$285;
                this.colon = colon$286;
                this.fls = fls$287;
            }
        });
    var Keyword$193 = TermTree$178.extend({
            properties: ['keyword'],
            construct: function (k$288) {
                this.keyword = k$288;
            }
        });
    var Punc$194 = TermTree$178.extend({
            properties: ['punc'],
            construct: function (p$289) {
                this.punc = p$289;
            }
        });
    var Delimiter$195 = TermTree$178.extend({
            properties: ['delim'],
            construct: function (d$290) {
                this.delim = d$290;
            }
        });
    var Id$196 = PrimaryExpression$182.extend({
            properties: ['id'],
            construct: function (id$291) {
                this.id = id$291;
            }
        });
    var NamedFun$197 = Expr$181.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$292, name$293, params$294, body$295) {
                this.keyword = keyword$292;
                this.name = name$293;
                this.params = params$294;
                this.body = body$295;
            }
        });
    var AnonFun$198 = Expr$181.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$296, params$297, body$298) {
                this.keyword = keyword$296;
                this.params = params$297;
                this.body = body$298;
            }
        });
    var LetMacro$199 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$299, body$300) {
                this.name = name$299;
                this.body = body$300;
            }
        });
    var Macro$200 = TermTree$178.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$301, body$302) {
                this.name = name$301;
                this.body = body$302;
            }
        });
    var Const$201 = Expr$181.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$303, call$304) {
                this.newterm = newterm$303;
                this.call = call$304;
            }
        });
    var Call$202 = Expr$181.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$88.assert(this.fun.hasPrototype(TermTree$178), 'expecting a term tree in destruct of call');
                var that$305 = this;
                this.delim = syntaxFromToken$164(_$87.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$87.reduce(this.args, function (acc$306, term$307) {
                    parser$88.assert(term$307 && term$307.hasPrototype(TermTree$178), 'expecting term trees in destruct of Call');
                    var dst$308 = acc$306.concat(term$307.destruct());
                    if (that$305.commas.length > 0) {
                        dst$308 = dst$308.concat(that$305.commas.shift());
                    }
                    return dst$308;
                }, []);
                return this.fun.destruct().concat(Delimiter$195.create(this.delim).destruct());
            },
            construct: function (funn$309, args$310, delim$311, commas$312) {
                parser$88.assert(Array.isArray(args$310), 'requires an array of arguments terms');
                this.fun = funn$309;
                this.args = args$310;
                this.delim = delim$311;
                this.commas = commas$312;
            }
        });
    var ObjDotGet$203 = Expr$181.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$313, dot$314, right$315) {
                this.left = left$313;
                this.dot = dot$314;
                this.right = right$315;
            }
        });
    var ObjGet$204 = Expr$181.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$316, right$317) {
                this.left = left$316;
                this.right = right$317;
            }
        });
    var VariableDeclaration$205 = TermTree$178.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$318, eqstx$319, init$320, comma$321) {
                this.ident = ident$318;
                this.eqstx = eqstx$319;
                this.init = init$320;
                this.comma = comma$321;
            }
        });
    var VariableStatement$206 = Statement$180.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$87.reduce(this.decls, function (acc$322, decl$323) {
                    return acc$322.concat(decl$323.destruct());
                }, []));
            },
            construct: function (varkw$324, decls$325) {
                parser$88.assert(Array.isArray(decls$325), 'decls must be an array');
                this.varkw = varkw$324;
                this.decls = decls$325;
            }
        });
    var CatchClause$207 = TermTree$178.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$326, params$327, body$328) {
                this.catchkw = catchkw$326;
                this.params = params$327;
                this.body = body$328;
            }
        });
    var Empty$208 = TermTree$178.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$209(stx$329) {
        var staticOperators$330 = [
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
        return _$87.contains(staticOperators$330, stx$329.token.value);
    }
    function stxIsBinOp$210(stx$331) {
        var staticOperators$332 = [
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
        return _$87.contains(staticOperators$332, stx$331.token.value);
    }
    function enforestVarStatement$211(stx$333, env$334) {
        var decls$335 = [];
        var res$336 = enforest$212(stx$333, env$334);
        var result$337 = res$336.result;
        var rest$338 = res$336.rest;
        if (rest$338[0]) {
            var nextRes$339 = enforest$212(rest$338, env$334);
            if (nextRes$339.result.hasPrototype(Punc$194) && nextRes$339.result.punc.token.value === '=') {
                var initializerRes$340 = enforest$212(nextRes$339.rest, env$334);
                if (initializerRes$340.rest[0]) {
                    var restRes$341 = enforest$212(initializerRes$340.rest, env$334);
                    if (restRes$341.result.hasPrototype(Punc$194) && restRes$341.result.punc.token.value === ',') {
                        decls$335.push(VariableDeclaration$205.create(result$337.id, nextRes$339.result.punc, initializerRes$340.result, restRes$341.result.punc));
                        var subRes$342 = enforestVarStatement$211(restRes$341.rest, env$334);
                        decls$335 = decls$335.concat(subRes$342.result);
                        rest$338 = subRes$342.rest;
                    } else {
                        decls$335.push(VariableDeclaration$205.create(result$337.id, nextRes$339.result.punc, initializerRes$340.result));
                        rest$338 = initializerRes$340.rest;
                    }
                } else {
                    decls$335.push(VariableDeclaration$205.create(result$337.id, nextRes$339.result.punc, initializerRes$340.result));
                }
            } else if (nextRes$339.result.hasPrototype(Punc$194) && nextRes$339.result.punc.token.value === ',') {
                decls$335.push(VariableDeclaration$205.create(result$337.id, null, null, nextRes$339.result.punc));
                var subRes$342 = enforestVarStatement$211(nextRes$339.rest, env$334);
                decls$335 = decls$335.concat(subRes$342.result);
                rest$338 = subRes$342.rest;
            } else {
                if (result$337.hasPrototype(Id$196)) {
                    decls$335.push(VariableDeclaration$205.create(result$337.id));
                } else {
                    throwError$153('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$337.hasPrototype(Id$196)) {
                decls$335.push(VariableDeclaration$205.create(result$337.id));
            } else if (result$337.hasPrototype(BinOp$191) && result$337.op.token.value === 'in') {
                decls$335.push(VariableDeclaration$205.create(result$337.left.id, result$337.op, result$337.right));
            } else {
                throwError$153('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$335,
            rest: rest$338
        };
    }
    function enforest$212(toks$343, env$344) {
        env$344 = env$344 || new Map();
        parser$88.assert(toks$343.length > 0, 'enforest assumes there are tokens to work with');
        function step$345(head$346, rest$347) {
            var innerTokens$348;
            parser$88.assert(Array.isArray(rest$347), 'result must at least be an empty array');
            if (head$346.hasPrototype(TermTree$178)) {
                var emp$351 = head$346.emp;
                var emp$351 = head$346.emp;
                var keyword$354 = head$346.keyword;
                var delim$356 = head$346.delim;
                var emp$351 = head$346.emp;
                var punc$359 = head$346.punc;
                var keyword$354 = head$346.keyword;
                var emp$351 = head$346.emp;
                var emp$351 = head$346.emp;
                var emp$351 = head$346.emp;
                var delim$356 = head$346.delim;
                var delim$356 = head$346.delim;
                var keyword$354 = head$346.keyword;
                if (head$346.hasPrototype(Expr$181) && (rest$347[0] && rest$347[0].token.type === parser$88.Token.Delimiter && rest$347[0].token.value === '()')) {
                    var argRes$382, enforestedArgs$383 = [], commas$384 = [];
                    rest$347[0].expose();
                    innerTokens$348 = rest$347[0].token.inner;
                    while (innerTokens$348.length > 0) {
                        argRes$382 = enforest$212(innerTokens$348, env$344);
                        enforestedArgs$383.push(argRes$382.result);
                        innerTokens$348 = argRes$382.rest;
                        if (innerTokens$348[0] && innerTokens$348[0].token.value === ',') {
                            commas$384.push(innerTokens$348[0]);
                            innerTokens$348 = innerTokens$348.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$385 = _$87.all(enforestedArgs$383, function (argTerm$386) {
                            return argTerm$386.hasPrototype(Expr$181);
                        });
                    if (innerTokens$348.length === 0 && argsAreExprs$385) {
                        return step$345(Call$202.create(head$346, enforestedArgs$383, rest$347[0], commas$384), rest$347.slice(1));
                    }
                } else if (head$346.hasPrototype(Expr$181) && (rest$347[0] && rest$347[0].token.value === '?')) {
                    var question$387 = rest$347[0];
                    var condRes$388 = enforest$212(rest$347.slice(1), env$344);
                    var truExpr$389 = condRes$388.result;
                    var right$390 = condRes$388.rest;
                    if (truExpr$389.hasPrototype(Expr$181) && right$390[0] && right$390[0].token.value === ':') {
                        var colon$391 = right$390[0];
                        var flsRes$392 = enforest$212(right$390.slice(1), env$344);
                        var flsExpr$393 = flsRes$392.result;
                        if (flsExpr$393.hasPrototype(Expr$181)) {
                            return step$345(ConditionalExpression$192.create(head$346, question$387, truExpr$389, colon$391, flsExpr$393), flsRes$392.rest);
                        }
                    }
                } else if (head$346.hasPrototype(Keyword$193) && (keyword$354.token.value === 'new' && rest$347[0])) {
                    var newCallRes$394 = enforest$212(rest$347, env$344);
                    if (newCallRes$394.result.hasPrototype(Call$202)) {
                        return step$345(Const$201.create(head$346, newCallRes$394.result), newCallRes$394.rest);
                    }
                } else if (head$346.hasPrototype(Delimiter$195) && delim$356.token.value === '()') {
                    innerTokens$348 = delim$356.token.inner;
                    if (innerTokens$348.length === 0) {
                        return step$345(ParenExpression$188.create(head$346), rest$347);
                    } else {
                        var innerTerm$395 = get_expression$213(innerTokens$348, env$344);
                        if (innerTerm$395.result && innerTerm$395.result.hasPrototype(Expr$181)) {
                            return step$345(ParenExpression$188.create(head$346), rest$347);
                        }
                    }
                } else if (head$346.hasPrototype(TermTree$178) && (rest$347[0] && rest$347[1] && stxIsBinOp$210(rest$347[0]))) {
                    var op$396 = rest$347[0];
                    var left$397 = head$346;
                    var bopRes$398 = enforest$212(rest$347.slice(1), env$344);
                    var right$390 = bopRes$398.result;
                    if (right$390.hasPrototype(Expr$181)) {
                        return step$345(BinOp$191.create(op$396, left$397, right$390), bopRes$398.rest);
                    }
                } else if (head$346.hasPrototype(Punc$194) && stxIsUnaryOp$209(punc$359)) {
                    var unopRes$399 = enforest$212(rest$347, env$344);
                    if (unopRes$399.result.hasPrototype(Expr$181)) {
                        return step$345(UnaryOp$189.create(punc$359, unopRes$399.result), unopRes$399.rest);
                    }
                } else if (head$346.hasPrototype(Keyword$193) && stxIsUnaryOp$209(keyword$354)) {
                    var unopRes$399 = enforest$212(rest$347, env$344);
                    if (unopRes$399.result.hasPrototype(Expr$181)) {
                        return step$345(UnaryOp$189.create(keyword$354, unopRes$399.result), unopRes$399.rest);
                    }
                } else if (head$346.hasPrototype(Expr$181) && (rest$347[0] && (rest$347[0].token.value === '++' || rest$347[0].token.value === '--'))) {
                    return step$345(PostfixOp$190.create(head$346, rest$347[0]), rest$347.slice(1));
                } else if (head$346.hasPrototype(Expr$181) && (rest$347[0] && rest$347[0].token.value === '[]')) {
                    return step$345(ObjGet$204.create(head$346, Delimiter$195.create(rest$347[0].expose())), rest$347.slice(1));
                } else if (head$346.hasPrototype(Expr$181) && (rest$347[0] && rest$347[0].token.value === '.' && rest$347[1] && rest$347[1].token.type === parser$88.Token.Identifier)) {
                    return step$345(ObjDotGet$203.create(head$346, rest$347[0], rest$347[1]), rest$347.slice(2));
                } else if (head$346.hasPrototype(Delimiter$195) && delim$356.token.value === '[]') {
                    return step$345(ArrayLiteral$187.create(head$346), rest$347);
                } else if (head$346.hasPrototype(Delimiter$195) && head$346.delim.token.value === '{}') {
                    return step$345(Block$186.create(head$346), rest$347);
                } else if (head$346.hasPrototype(Keyword$193) && (keyword$354.token.value === 'var' && rest$347[0])) {
                    var vsRes$400 = enforestVarStatement$211(rest$347, env$344);
                    if (vsRes$400) {
                        return step$345(VariableStatement$206.create(head$346, vsRes$400.result), vsRes$400.rest);
                    }
                }
            } else {
                parser$88.assert(head$346 && head$346.token, 'assuming head is a syntax object');
                if ((head$346.token.type === parser$88.Token.Identifier || head$346.token.type === parser$88.Token.Keyword) && env$344.has(head$346.token.value) && env$344.get(head$346.token.value).name === resolve$168(head$346)) {
                    var transformer$401 = env$344.get(head$346.token.value).fn;
                    var rt$402 = transformer$401([head$346].concat(rest$347), env$344);
                    if (!Array.isArray(rt$402.result)) {
                        throwError$153('Macro transformer must return a result array, not: ' + rt$402.result);
                    }
                    if (rt$402.result.length > 0) {
                        return step$345(rt$402.result[0], rt$402.result.slice(1).concat(rt$402.rest));
                    } else {
                        return step$345(Empty$208.create(), rt$402.rest);
                    }
                } else if (head$346.token.value === 'let' && rest$347[0] && rest$347[0].token.type === parser$88.Token.Identifier && rest$347[1] && rest$347[1].token.value === '=' && rest$347[2] && rest$347[2].token.value === 'macro' && rest$347[3] && rest$347[3].token.value === '{}') {
                    return step$345(LetMacro$199.create(rest$347[0], rest$347[3].expose().token.inner), rest$347.slice(4));
                } else if (head$346.token.type === parser$88.Token.Identifier && head$346.token.value === 'macro' && rest$347[0] && (rest$347[0].token.type === parser$88.Token.Identifier || rest$347[0].token.type === parser$88.Token.Keyword || rest$347[0].token.type === parser$88.Token.Punctuator) && rest$347[1] && rest$347[1].token.type === parser$88.Token.Delimiter && rest$347[1].token.value === '{}') {
                    return step$345(Macro$200.create(rest$347[0], rest$347[1].expose().token.inner), rest$347.slice(2));
                } else if (head$346.token.type === parser$88.Token.Keyword && head$346.token.value === 'function' && rest$347[0] && rest$347[0].token.type === parser$88.Token.Identifier && rest$347[1] && rest$347[1].token.type === parser$88.Token.Delimiter && rest$347[1].token.value === '()' && rest$347[2] && rest$347[2].token.type === parser$88.Token.Delimiter && rest$347[2].token.value === '{}') {
                    rest$347[1].token.inner = rest$347[1].expose().token.inner;
                    rest$347[2].token.inner = rest$347[2].expose().token.inner;
                    return step$345(NamedFun$197.create(head$346, rest$347[0], rest$347[1], rest$347[2]), rest$347.slice(3));
                } else if (head$346.token.type === parser$88.Token.Keyword && head$346.token.value === 'function' && rest$347[0] && rest$347[0].token.type === parser$88.Token.Delimiter && rest$347[0].token.value === '()' && rest$347[1] && rest$347[1].token.type === parser$88.Token.Delimiter && rest$347[1].token.value === '{}') {
                    rest$347[0].token.inner = rest$347[0].expose().token.inner;
                    rest$347[1].token.inner = rest$347[1].expose().token.inner;
                    return step$345(AnonFun$198.create(head$346, rest$347[0], rest$347[1]), rest$347.slice(2));
                } else if (head$346.token.type === parser$88.Token.Keyword && head$346.token.value === 'catch' && rest$347[0] && rest$347[0].token.type === parser$88.Token.Delimiter && rest$347[0].token.value === '()' && rest$347[1] && rest$347[1].token.type === parser$88.Token.Delimiter && rest$347[1].token.value === '{}') {
                    rest$347[0].token.inner = rest$347[0].expose().token.inner;
                    rest$347[1].token.inner = rest$347[1].expose().token.inner;
                    return step$345(CatchClause$207.create(head$346, rest$347[0], rest$347[1]), rest$347.slice(2));
                } else if (head$346.token.type === parser$88.Token.Keyword && head$346.token.value === 'this') {
                    return step$345(ThisExpression$183.create(head$346), rest$347);
                } else if (head$346.token.type === parser$88.Token.NumericLiteral || head$346.token.type === parser$88.Token.StringLiteral || head$346.token.type === parser$88.Token.BooleanLiteral || head$346.token.type === parser$88.Token.RegexLiteral || head$346.token.type === parser$88.Token.NullLiteral) {
                    return step$345(Lit$184.create(head$346), rest$347);
                } else if (head$346.token.type === parser$88.Token.Identifier) {
                    return step$345(Id$196.create(head$346), rest$347);
                } else if (head$346.token.type === parser$88.Token.Punctuator) {
                    return step$345(Punc$194.create(head$346), rest$347);
                } else if (head$346.token.type === parser$88.Token.Keyword && head$346.token.value === 'with') {
                    throwError$153('with is not supported in sweet.js');
                } else if (head$346.token.type === parser$88.Token.Keyword) {
                    return step$345(Keyword$193.create(head$346), rest$347);
                } else if (head$346.token.type === parser$88.Token.Delimiter) {
                    return step$345(Delimiter$195.create(head$346.expose()), rest$347);
                } else if (head$346.token.type === parser$88.Token.EOF) {
                    parser$88.assert(rest$347.length === 0, 'nothing should be after an EOF');
                    return step$345(EOF$179.create(head$346), []);
                } else {
                    parser$88.assert(false, 'not implemented');
                }
            }
            return {
                result: head$346,
                rest: rest$347
            };
        }
        return step$345(toks$343[0], toks$343.slice(1));
    }
    function get_expression$213(stx$403, env$404) {
        var res$405 = enforest$212(stx$403, env$404);
        if (!res$405.result.hasPrototype(Expr$181)) {
            return {
                result: null,
                rest: stx$403
            };
        }
        return res$405;
    }
    function applyMarkToPatternEnv$214(newMark$406, env$407) {
        function dfs$408(match$409) {
            if (match$409.level === 0) {
                match$409.match = _$87.map(match$409.match, function (stx$410) {
                    return stx$410.mark(newMark$406);
                });
            } else {
                _$87.each(match$409.match, function (match$411) {
                    dfs$408(match$411);
                });
            }
        }
        _$87.keys(env$407).forEach(function (key$412) {
            dfs$408(env$407[key$412]);
        });
    }
    function loadMacroDef$215(mac$413, env$414, defscope$415, templateMap$416) {
        var body$417 = mac$413.body;
        if (!(body$417[0] && body$417[0].token.type === parser$88.Token.Keyword && body$417[0].token.value === 'function')) {
            throwError$153('Primitive macro form must contain a function for the macro body');
        }
        var stub$418 = parser$88.read('()');
        stub$418[0].token.inner = body$417;
        var expanded$419 = expand$219(stub$418, env$414, defscope$415, templateMap$416);
        expanded$419 = expanded$419[0].destruct().concat(expanded$419[1].eof);
        var flattend$420 = flatten$221(expanded$419);
        var bodyCode$421 = codegen$91.generate(parser$88.parse(flattend$420));
        var macroFn$422 = scopedEval$156(bodyCode$421, {
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
                getTemplate: function (id$423) {
                    return templateMap$416.get(id$423);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$214,
                mergeMatches: function (newMatch$424, oldMatch$425) {
                    newMatch$424.patternEnv = _$87.extend({}, oldMatch$425.patternEnv, newMatch$424.patternEnv);
                    return newMatch$424;
                }
            });
        return macroFn$422;
    }
    function expandToTermTree$216(stx$426, env$427, defscope$428, templateMap$429) {
        parser$88.assert(env$427, 'environment map is required');
        if (stx$426.length === 0) {
            return {
                terms: [],
                env: env$427
            };
        }
        parser$88.assert(stx$426[0].token, 'expecting a syntax object');
        var f$430 = enforest$212(stx$426, env$427);
        var head$431 = f$430.result;
        var rest$432 = f$430.rest;
        if (head$431.hasPrototype(Macro$200)) {
            var macroDefinition$434 = loadMacroDef$215(head$431, env$427, defscope$428, templateMap$429);
            addToDefinitionCtx$217([head$431.name], defscope$428, false);
            env$427.set(head$431.name.token.value, {
                name: resolve$168(head$431.name),
                fn: macroDefinition$434
            });
            return expandToTermTree$216(rest$432, env$427, defscope$428, templateMap$429);
        }
        if (head$431.hasPrototype(LetMacro$199)) {
            var macroDefinition$434 = loadMacroDef$215(head$431, env$427, defscope$428, templateMap$429);
            addToDefinitionCtx$217([head$431.name], defscope$428, false);
            env$427.set(resolve$168(head$431.name), macroDefinition$434);
            return expandToTermTree$216(rest$432, env$427, defscope$428, templateMap$429);
        }
        if (head$431.hasPrototype(NamedFun$197)) {
            addToDefinitionCtx$217([head$431.name], defscope$428, true);
        }
        if (head$431.hasPrototype(Id$196) && head$431.id.token.value === '#quoteSyntax' && rest$432[0] && rest$432[0].token.value === '{}') {
            var tempId$435 = fresh$174();
            templateMap$429.set(tempId$435, rest$432[0].token.inner);
            return expandToTermTree$216([
                syn$89.makeIdent('getTemplate', head$431.id),
                syn$89.makeDelim('()', [syn$89.makeValue(tempId$435, head$431.id)])
            ].concat(rest$432.slice(1)), env$427, defscope$428, templateMap$429);
        }
        if (head$431.hasPrototype(VariableStatement$206)) {
            addToDefinitionCtx$217(_$87.map(head$431.decls, function (decl$436) {
                return decl$436.ident;
            }), defscope$428, true);
        }
        if (head$431.hasPrototype(Block$186) && head$431.body.hasPrototype(Delimiter$195)) {
            head$431.body.delim.token.inner.forEach(function (term$437) {
                if (term$437.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$437.decls, function (decl$438) {
                        return decl$438.ident;
                    }), defscope$428, true);
                }
            });
        }
        if (head$431.hasPrototype(Delimiter$195)) {
            head$431.delim.token.inner.forEach(function (term$439) {
                if (term$439.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$439.decls, function (decl$440) {
                        return decl$440.ident;
                    }), defscope$428, true);
                }
            });
        }
        var trees$433 = expandToTermTree$216(rest$432, env$427, defscope$428, templateMap$429);
        return {
            terms: [head$431].concat(trees$433.terms),
            env: trees$433.env
        };
    }
    function addToDefinitionCtx$217(idents$441, defscope$442, skipRep$443) {
        parser$88.assert(idents$441 && idents$441.length > 0, 'expecting some variable identifiers');
        skipRep$443 = skipRep$443 || false;
        _$87.each(idents$441, function (id$444) {
            var skip$445 = false;
            if (skipRep$443) {
                var declRepeat$446 = _$87.find(defscope$442, function (def$447) {
                        return def$447.id.token.value === id$444.token.value && arraysEqual$169(marksof$167(def$447.id.context), marksof$167(id$444.context));
                    });
                skip$445 = typeof declRepeat$446 !== 'undefined';
            }
            if (!skip$445) {
                var name$448 = fresh$174();
                defscope$442.push({
                    id: id$444,
                    name: name$448
                });
            }
        });
    }
    function expandTermTreeToFinal$218(term$449, env$450, defscope$451, templateMap$452) {
        parser$88.assert(env$450, 'environment map is required');
        if (term$449.hasPrototype(ArrayLiteral$187)) {
            term$449.array.delim.token.inner = expand$219(term$449.array.delim.token.inner, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(Block$186)) {
            term$449.body.delim.token.inner = expand$219(term$449.body.delim.token.inner, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(ParenExpression$188)) {
            term$449.expr.delim.token.inner = expand$219(term$449.expr.delim.token.inner, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(Call$202)) {
            term$449.fun = expandTermTreeToFinal$218(term$449.fun, env$450, defscope$451, templateMap$452);
            term$449.args = _$87.map(term$449.args, function (arg$453) {
                return expandTermTreeToFinal$218(arg$453, env$450, defscope$451, templateMap$452);
            });
            return term$449;
        } else if (term$449.hasPrototype(UnaryOp$189)) {
            term$449.expr = expandTermTreeToFinal$218(term$449.expr, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(BinOp$191)) {
            term$449.left = expandTermTreeToFinal$218(term$449.left, env$450, defscope$451, templateMap$452);
            term$449.right = expandTermTreeToFinal$218(term$449.right, env$450, defscope$451);
            return term$449;
        } else if (term$449.hasPrototype(ObjGet$204)) {
            term$449.right.delim.token.inner = expand$219(term$449.right.delim.token.inner, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(ObjDotGet$203)) {
            term$449.left = expandTermTreeToFinal$218(term$449.left, env$450, defscope$451, templateMap$452);
            term$449.right = expandTermTreeToFinal$218(term$449.right, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(VariableDeclaration$205)) {
            if (term$449.init) {
                term$449.init = expandTermTreeToFinal$218(term$449.init, env$450, defscope$451, templateMap$452);
            }
            return term$449;
        } else if (term$449.hasPrototype(VariableStatement$206)) {
            term$449.decls = _$87.map(term$449.decls, function (decl$454) {
                return expandTermTreeToFinal$218(decl$454, env$450, defscope$451, templateMap$452);
            });
            return term$449;
        } else if (term$449.hasPrototype(Delimiter$195)) {
            term$449.delim.token.inner = expand$219(term$449.delim.token.inner, env$450, defscope$451, templateMap$452);
            return term$449;
        } else if (term$449.hasPrototype(NamedFun$197) || term$449.hasPrototype(AnonFun$198) || term$449.hasPrototype(CatchClause$207)) {
            var newDef$455 = [];
            var params$456 = term$449.params.addDefCtx(newDef$455);
            var bodies$457 = term$449.body.addDefCtx(newDef$455);
            var paramNames$458 = _$87.map(getParamIdentifiers$177(params$456), function (param$465) {
                    var freshName$466 = fresh$174();
                    return {
                        freshName: freshName$466,
                        originalParam: param$465,
                        renamedParam: param$465.rename(param$465, freshName$466)
                    };
                });
            var renamedBody$459 = _$87.reduce(paramNames$458, function (accBody$467, p$468) {
                    return accBody$467.rename(p$468.originalParam, p$468.freshName);
                }, bodies$457);
            renamedBody$459 = renamedBody$459.expose();
            var bodyTerms$460 = expand$219([renamedBody$459], env$450, newDef$455, templateMap$452);
            parser$88.assert(bodyTerms$460.length === 1 && bodyTerms$460[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$461 = _$87.map(paramNames$458, function (p$469) {
                    return p$469.renamedParam;
                });
            var flatArgs$462 = wrapDelim$176(joinSyntax$175(renamedParams$461, ','), term$449.params);
            var expandedArgs$463 = expand$219([flatArgs$462], env$450, newDef$455, templateMap$452);
            parser$88.assert(expandedArgs$463.length === 1, 'should only get back one result');
            term$449.params = expandedArgs$463[0];
            var flattenedBody$464 = bodyTerms$460[0].destruct();
            flattenedBody$464 = _$87.reduce(newDef$455, function (acc$470, def$471) {
                return acc$470.rename(def$471.id, def$471.name);
            }, flattenedBody$464[0]);
            term$449.body = flattenedBody$464;
            return term$449;
        }
        return term$449;
    }
    function expand$219(stx$472, env$473, defscope$474, templateMap$475) {
        env$473 = env$473 || new Map();
        templateMap$475 = templateMap$475 || new Map();
        var trees$476 = expandToTermTree$216(stx$472, env$473, defscope$474, templateMap$475);
        return _$87.map(trees$476.terms, function (term$477) {
            return expandTermTreeToFinal$218(term$477, trees$476.env, defscope$474, templateMap$475);
        });
    }
    function expandTopLevel$220(stx$478) {
        var funn$479 = syntaxFromToken$164({
                value: 'function',
                type: parser$88.Token.Keyword
            });
        var params$480 = syntaxFromToken$164({
                value: '()',
                type: parser$88.Token.Delimiter,
                inner: []
            });
        var body$481 = syntaxFromToken$164({
                value: '{}',
                type: parser$88.Token.Delimiter,
                inner: stx$478
            });
        var res$482 = expand$219([
                funn$479,
                params$480,
                body$481
            ]);
        res$482 = flatten$221([res$482[0].body]);
        return _$87.map(res$482.slice(1, res$482.length - 1), function (stx$483) {
            return stx$483;
        });
    }
    function flatten$221(stx$484) {
        return _$87.reduce(stx$484, function (acc$485, stx$486) {
            if (stx$486.token.type === parser$88.Token.Delimiter) {
                var exposed$487 = stx$486.expose();
                var openParen$488 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$486.token.value[0],
                        range: stx$486.token.startRange,
                        lineNumber: stx$486.token.startLineNumber,
                        lineStart: stx$486.token.startLineStart
                    }, exposed$487.context);
                var closeParen$489 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$486.token.value[1],
                        range: stx$486.token.endRange,
                        lineNumber: stx$486.token.endLineNumber,
                        lineStart: stx$486.token.endLineStart
                    }, exposed$487.context);
                return acc$485.concat(openParen$488).concat(flatten$221(exposed$487.token.inner)).concat(closeParen$489);
            }
            return acc$485.concat(stx$486);
        }, []);
    }
    exports$86.enforest = enforest$212;
    exports$86.expand = expandTopLevel$220;
    exports$86.resolve = resolve$168;
    exports$86.get_expression = get_expression$213;
    exports$86.Expr = Expr$181;
    exports$86.VariableStatement = VariableStatement$206;
    exports$86.tokensToSyntax = syn$89.tokensToSyntax;
}));