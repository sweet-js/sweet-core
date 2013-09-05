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
                    var getRes$400 = enforest$212(rest$347[0].expose().token.inner, env$344);
                    var resStx$401 = mkSyntax$165('[]', parser$88.Token.Delimiter, rest$347[0]);
                    resStx$401.token.inner = [getRes$400.result];
                    return step$345(ObjGet$204.create(head$346, Delimiter$195.create(resStx$401)), rest$347.slice(1));
                } else if (head$346.hasPrototype(Expr$181) && (rest$347[0] && rest$347[0].token.value === '.' && rest$347[1] && rest$347[1].token.type === parser$88.Token.Identifier)) {
                    return step$345(ObjDotGet$203.create(head$346, rest$347[0], rest$347[1]), rest$347.slice(2));
                } else if (head$346.hasPrototype(Delimiter$195) && delim$356.token.value === '[]') {
                    return step$345(ArrayLiteral$187.create(head$346), rest$347);
                } else if (head$346.hasPrototype(Delimiter$195) && head$346.delim.token.value === '{}') {
                    return step$345(Block$186.create(head$346), rest$347);
                } else if (head$346.hasPrototype(Keyword$193) && (keyword$354.token.value === 'var' && rest$347[0])) {
                    var vsRes$402 = enforestVarStatement$211(rest$347, env$344);
                    if (vsRes$402) {
                        return step$345(VariableStatement$206.create(head$346, vsRes$402.result), vsRes$402.rest);
                    }
                }
            } else {
                parser$88.assert(head$346 && head$346.token, 'assuming head is a syntax object');
                if ((head$346.token.type === parser$88.Token.Identifier || head$346.token.type === parser$88.Token.Keyword) && env$344.has(head$346.token.value) && env$344.get(head$346.token.value).name === resolve$168(head$346)) {
                    var transformer$403 = env$344.get(head$346.token.value).fn;
                    var rt$404 = transformer$403([head$346].concat(rest$347), env$344);
                    if (!Array.isArray(rt$404.result)) {
                        throwError$153('Macro transformer must return a result array, not: ' + rt$404.result);
                    }
                    if (rt$404.result.length > 0) {
                        return step$345(rt$404.result[0], rt$404.result.slice(1).concat(rt$404.rest));
                    } else {
                        return step$345(Empty$208.create(), rt$404.rest);
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
    function get_expression$213(stx$405, env$406) {
        var res$407 = enforest$212(stx$405, env$406);
        if (!res$407.result.hasPrototype(Expr$181)) {
            return {
                result: null,
                rest: stx$405
            };
        }
        return res$407;
    }
    function applyMarkToPatternEnv$214(newMark$408, env$409) {
        function dfs$410(match$411) {
            if (match$411.level === 0) {
                match$411.match = _$87.map(match$411.match, function (stx$412) {
                    return stx$412.mark(newMark$408);
                });
            } else {
                _$87.each(match$411.match, function (match$413) {
                    dfs$410(match$413);
                });
            }
        }
        _$87.keys(env$409).forEach(function (key$414) {
            dfs$410(env$409[key$414]);
        });
    }
    function loadMacroDef$215(mac$415, env$416, defscope$417, templateMap$418) {
        var body$419 = mac$415.body;
        if (!(body$419[0] && body$419[0].token.type === parser$88.Token.Keyword && body$419[0].token.value === 'function')) {
            throwError$153('Primitive macro form must contain a function for the macro body');
        }
        var stub$420 = parser$88.read('()');
        stub$420[0].token.inner = body$419;
        var expanded$421 = expand$219(stub$420, env$416, defscope$417, templateMap$418);
        expanded$421 = expanded$421[0].destruct().concat(expanded$421[1].eof);
        var flattend$422 = flatten$221(expanded$421);
        var bodyCode$423 = codegen$91.generate(parser$88.parse(flattend$422));
        var macroFn$424 = scopedEval$156(bodyCode$423, {
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
                getTemplate: function (id$425) {
                    return templateMap$418.get(id$425);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$214,
                mergeMatches: function (newMatch$426, oldMatch$427) {
                    newMatch$426.patternEnv = _$87.extend({}, oldMatch$427.patternEnv, newMatch$426.patternEnv);
                    return newMatch$426;
                }
            });
        return macroFn$424;
    }
    function expandToTermTree$216(stx$428, env$429, defscope$430, templateMap$431) {
        parser$88.assert(env$429, 'environment map is required');
        if (stx$428.length === 0) {
            return {
                terms: [],
                env: env$429
            };
        }
        parser$88.assert(stx$428[0].token, 'expecting a syntax object');
        var f$432 = enforest$212(stx$428, env$429);
        var head$433 = f$432.result;
        var rest$434 = f$432.rest;
        if (head$433.hasPrototype(Macro$200)) {
            var macroDefinition$436 = loadMacroDef$215(head$433, env$429, defscope$430, templateMap$431);
            addToDefinitionCtx$217([head$433.name], defscope$430, false);
            env$429.set(head$433.name.token.value, {
                name: resolve$168(head$433.name),
                fn: macroDefinition$436
            });
            return expandToTermTree$216(rest$434, env$429, defscope$430, templateMap$431);
        }
        if (head$433.hasPrototype(LetMacro$199)) {
            var macroDefinition$436 = loadMacroDef$215(head$433, env$429, defscope$430, templateMap$431);
            addToDefinitionCtx$217([head$433.name], defscope$430, false);
            env$429.set(resolve$168(head$433.name), macroDefinition$436);
            return expandToTermTree$216(rest$434, env$429, defscope$430, templateMap$431);
        }
        if (head$433.hasPrototype(NamedFun$197)) {
            addToDefinitionCtx$217([head$433.name], defscope$430, true);
        }
        if (head$433.hasPrototype(Id$196) && head$433.id.token.value === '#quoteSyntax' && rest$434[0] && rest$434[0].token.value === '{}') {
            var tempId$437 = fresh$174();
            templateMap$431.set(tempId$437, rest$434[0].token.inner);
            return expandToTermTree$216([
                syn$89.makeIdent('getTemplate', head$433.id),
                syn$89.makeDelim('()', [syn$89.makeValue(tempId$437, head$433.id)])
            ].concat(rest$434.slice(1)), env$429, defscope$430, templateMap$431);
        }
        if (head$433.hasPrototype(VariableStatement$206)) {
            addToDefinitionCtx$217(_$87.map(head$433.decls, function (decl$438) {
                return decl$438.ident;
            }), defscope$430, true);
        }
        if (head$433.hasPrototype(Block$186) && head$433.body.hasPrototype(Delimiter$195)) {
            head$433.body.delim.token.inner.forEach(function (term$439) {
                if (term$439.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$439.decls, function (decl$440) {
                        return decl$440.ident;
                    }), defscope$430, true);
                }
            });
        }
        if (head$433.hasPrototype(Delimiter$195)) {
            head$433.delim.token.inner.forEach(function (term$441) {
                if (term$441.hasPrototype(VariableStatement$206)) {
                    addToDefinitionCtx$217(_$87.map(term$441.decls, function (decl$442) {
                        return decl$442.ident;
                    }), defscope$430, true);
                }
            });
        }
        var trees$435 = expandToTermTree$216(rest$434, env$429, defscope$430, templateMap$431);
        return {
            terms: [head$433].concat(trees$435.terms),
            env: trees$435.env
        };
    }
    function addToDefinitionCtx$217(idents$443, defscope$444, skipRep$445) {
        parser$88.assert(idents$443 && idents$443.length > 0, 'expecting some variable identifiers');
        skipRep$445 = skipRep$445 || false;
        _$87.each(idents$443, function (id$446) {
            var skip$447 = false;
            if (skipRep$445) {
                var declRepeat$448 = _$87.find(defscope$444, function (def$449) {
                        return def$449.id.token.value === id$446.token.value && arraysEqual$169(marksof$167(def$449.id.context), marksof$167(id$446.context));
                    });
                skip$447 = typeof declRepeat$448 !== 'undefined';
            }
            if (!skip$447) {
                var name$450 = fresh$174();
                defscope$444.push({
                    id: id$446,
                    name: name$450
                });
            }
        });
    }
    function expandTermTreeToFinal$218(term$451, env$452, defscope$453, templateMap$454) {
        parser$88.assert(env$452, 'environment map is required');
        if (term$451.hasPrototype(ArrayLiteral$187)) {
            term$451.array.delim.token.inner = expand$219(term$451.array.delim.token.inner, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(Block$186)) {
            term$451.body.delim.token.inner = expand$219(term$451.body.delim.token.inner, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(ParenExpression$188)) {
            term$451.expr.delim.token.inner = expand$219(term$451.expr.delim.token.inner, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(Call$202)) {
            term$451.fun = expandTermTreeToFinal$218(term$451.fun, env$452, defscope$453, templateMap$454);
            term$451.args = _$87.map(term$451.args, function (arg$455) {
                return expandTermTreeToFinal$218(arg$455, env$452, defscope$453, templateMap$454);
            });
            return term$451;
        } else if (term$451.hasPrototype(UnaryOp$189)) {
            term$451.expr = expandTermTreeToFinal$218(term$451.expr, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(BinOp$191)) {
            term$451.left = expandTermTreeToFinal$218(term$451.left, env$452, defscope$453, templateMap$454);
            term$451.right = expandTermTreeToFinal$218(term$451.right, env$452, defscope$453);
            return term$451;
        } else if (term$451.hasPrototype(ObjDotGet$203)) {
            term$451.left = expandTermTreeToFinal$218(term$451.left, env$452, defscope$453, templateMap$454);
            term$451.right = expandTermTreeToFinal$218(term$451.right, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(VariableDeclaration$205)) {
            if (term$451.init) {
                term$451.init = expandTermTreeToFinal$218(term$451.init, env$452, defscope$453, templateMap$454);
            }
            return term$451;
        } else if (term$451.hasPrototype(VariableStatement$206)) {
            term$451.decls = _$87.map(term$451.decls, function (decl$456) {
                return expandTermTreeToFinal$218(decl$456, env$452, defscope$453, templateMap$454);
            });
            return term$451;
        } else if (term$451.hasPrototype(Delimiter$195)) {
            term$451.delim.token.inner = expand$219(term$451.delim.token.inner, env$452, defscope$453, templateMap$454);
            return term$451;
        } else if (term$451.hasPrototype(NamedFun$197) || term$451.hasPrototype(AnonFun$198) || term$451.hasPrototype(CatchClause$207)) {
            var newDef$457 = [];
            var params$458 = term$451.params.addDefCtx(newDef$457);
            var bodies$459 = term$451.body.addDefCtx(newDef$457);
            var paramNames$460 = _$87.map(getParamIdentifiers$177(params$458), function (param$467) {
                    var freshName$468 = fresh$174();
                    return {
                        freshName: freshName$468,
                        originalParam: param$467,
                        renamedParam: param$467.rename(param$467, freshName$468)
                    };
                });
            var renamedBody$461 = _$87.reduce(paramNames$460, function (accBody$469, p$470) {
                    return accBody$469.rename(p$470.originalParam, p$470.freshName);
                }, bodies$459);
            renamedBody$461 = renamedBody$461.expose();
            var bodyTerms$462 = expand$219([renamedBody$461], env$452, newDef$457, templateMap$454);
            parser$88.assert(bodyTerms$462.length === 1 && bodyTerms$462[0].body, 'expecting a block in the bodyTerms');
            var renamedParams$463 = _$87.map(paramNames$460, function (p$471) {
                    return p$471.renamedParam;
                });
            var flatArgs$464 = wrapDelim$176(joinSyntax$175(renamedParams$463, ','), term$451.params);
            var expandedArgs$465 = expand$219([flatArgs$464], env$452, newDef$457, templateMap$454);
            parser$88.assert(expandedArgs$465.length === 1, 'should only get back one result');
            term$451.params = expandedArgs$465[0];
            var flattenedBody$466 = bodyTerms$462[0].destruct();
            flattenedBody$466 = _$87.reduce(newDef$457, function (acc$472, def$473) {
                return acc$472.rename(def$473.id, def$473.name);
            }, flattenedBody$466[0]);
            term$451.body = flattenedBody$466;
            return term$451;
        }
        return term$451;
    }
    function expand$219(stx$474, env$475, defscope$476, templateMap$477) {
        env$475 = env$475 || new Map();
        templateMap$477 = templateMap$477 || new Map();
        var trees$478 = expandToTermTree$216(stx$474, env$475, defscope$476, templateMap$477);
        return _$87.map(trees$478.terms, function (term$479) {
            return expandTermTreeToFinal$218(term$479, trees$478.env, defscope$476, templateMap$477);
        });
    }
    function expandTopLevel$220(stx$480) {
        var funn$481 = syntaxFromToken$164({
                value: 'function',
                type: parser$88.Token.Keyword
            });
        var params$482 = syntaxFromToken$164({
                value: '()',
                type: parser$88.Token.Delimiter,
                inner: []
            });
        var body$483 = syntaxFromToken$164({
                value: '{}',
                type: parser$88.Token.Delimiter,
                inner: stx$480
            });
        var res$484 = expand$219([
                funn$481,
                params$482,
                body$483
            ]);
        res$484 = flatten$221([res$484[0].body]);
        return _$87.map(res$484.slice(1, res$484.length - 1), function (stx$485) {
            return stx$485;
        });
    }
    function flatten$221(stx$486) {
        return _$87.reduce(stx$486, function (acc$487, stx$488) {
            if (stx$488.token.type === parser$88.Token.Delimiter) {
                var exposed$489 = stx$488.expose();
                var openParen$490 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$488.token.value[0],
                        range: stx$488.token.startRange,
                        lineNumber: stx$488.token.startLineNumber,
                        lineStart: stx$488.token.startLineStart
                    }, exposed$489.context);
                var closeParen$491 = syntaxFromToken$164({
                        type: parser$88.Token.Punctuator,
                        value: stx$488.token.value[1],
                        range: stx$488.token.endRange,
                        lineNumber: stx$488.token.endLineNumber,
                        lineStart: stx$488.token.endLineStart
                    }, exposed$489.context);
                return acc$487.concat(openParen$490).concat(flatten$221(exposed$489.token.inner)).concat(closeParen$491);
            }
            return acc$487.concat(stx$488);
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