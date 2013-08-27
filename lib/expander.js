(function (root$49, factory$50) {
    if (typeof exports === 'object') {
        factory$50(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('escodegen'), require('./es6-module-loader'), require('./scopedEval'), require('./patterns'));
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
        ], factory$50);
    }
}(this, function (exports$51, _$52, parser$53, syn$54, es6$55, codegen$56, modules$57, se$58, patternModule$59) {
    'use strict';
    exports$51._test = {};
    Object.prototype.create = function () {
        var o$153 = Object.create(this);
        if (typeof o$153.construct === 'function') {
            o$153.construct.apply(o$153, arguments);
        }
        return o$153;
    };
    Object.prototype.extend = function (properties$154) {
        var result$155 = Object.create(this);
        for (var prop in properties$154) {
            if (properties$154.hasOwnProperty(prop)) {
                result$155[prop] = properties$154[prop];
            }
        }
        return result$155;
    };
    Object.prototype.hasPrototype = function (proto$156) {
        function F$157() {
        }
        F$157.prototype = proto$156;
        return this instanceof F$157;
    };
    function throwError$158(msg$159) {
        throw new Error(msg$159);
    }
    var Loader$109 = modules$57.Loader;
    var Module$110 = modules$57.Module;
    var scopedEval$111 = se$58.scopedEval;
    var Rename$112 = syn$54.Rename;
    var Mark$113 = syn$54.Mark;
    var Var$114 = syn$54.Var;
    var Def$115 = syn$54.Def;
    var isDef$116 = syn$54.isDef;
    var isMark$117 = syn$54.isMark;
    var isRename$118 = syn$54.isRename;
    var syntaxFromToken$119 = syn$54.syntaxFromToken;
    var mkSyntax$120 = syn$54.mkSyntax;
    function remdup$160(mark$161, mlist$162) {
        if (mark$161 === _$52.first(mlist$162)) {
            return _$52.rest(mlist$162, 1);
        }
        return [mark$161].concat(mlist$162);
    }
    function marksof$163(ctx$164, stopName$165, originalName$166) {
        var mark$167, submarks$168;
        if (isMark$117(ctx$164)) {
            mark$167 = ctx$164.mark;
            submarks$168 = marksof$163(ctx$164.context, stopName$165, originalName$166);
            return remdup$160(mark$167, submarks$168);
        }
        if (isDef$116(ctx$164)) {
            return marksof$163(ctx$164.context, stopName$165, originalName$166);
        }
        if (isRename$118(ctx$164)) {
            if (stopName$165 === originalName$166 + '$' + ctx$164.name) {
                return [];
            }
            return marksof$163(ctx$164.context, stopName$165, originalName$166);
        }
        return [];
    }
    function resolve$169(stx$170) {
        return resolveCtx$181(stx$170.token.value, stx$170.context, [], []);
    }
    function arraysEqual$171(a$172, b$173) {
        if (a$172.length !== b$173.length) {
            return false;
        }
        for (var i$174 = 0; i$174 < a$172.length; i$174++) {
            if (a$172[i$174] !== b$173[i$174]) {
                return false;
            }
        }
        return true;
    }
    function renames$175(defctx$176, oldctx$177, originalName$178) {
        var acc$179 = oldctx$177;
        defctx$176.forEach(function (def$180) {
            if (def$180.id.token.value === originalName$178) {
                acc$179 = Rename$112(def$180.id, def$180.name, acc$179, defctx$176);
            }
        });
        return acc$179;
    }
    function resolveCtx$181(originalName$182, ctx$183, stop_spine$184, stop_branch$185) {
        if (isMark$117(ctx$183)) {
            return resolveCtx$181(originalName$182, ctx$183.context, stop_spine$184, stop_branch$185);
        }
        if (isDef$116(ctx$183)) {
            if (_$52.contains(stop_spine$184, ctx$183.defctx)) {
                return resolveCtx$181(originalName$182, ctx$183.context, stop_spine$184, stop_branch$185);
            } else {
                return resolveCtx$181(originalName$182, renames$175(ctx$183.defctx, ctx$183.context, originalName$182), stop_spine$184, _$52.union(stop_branch$185, [ctx$183.defctx]));
            }
        }
        if (isRename$118(ctx$183)) {
            var idName$186 = resolveCtx$181(ctx$183.id.token.value, ctx$183.id.context, stop_branch$185, stop_branch$185);
            var subName$187 = resolveCtx$181(originalName$182, ctx$183.context, _$52.union(stop_spine$184, [ctx$183.def]), stop_branch$185);
            if (idName$186 === subName$187) {
                var idMarks$188 = marksof$163(ctx$183.id.context, originalName$182 + '$' + ctx$183.name, originalName$182);
                var subMarks$189 = marksof$163(ctx$183.context, originalName$182 + '$' + ctx$183.name, originalName$182);
                if (arraysEqual$171(idMarks$188, subMarks$189)) {
                    return originalName$182 + '$' + ctx$183.name;
                }
            }
            return resolveCtx$181(originalName$182, ctx$183.context, _$52.union(stop_spine$184, [ctx$183.def]), stop_branch$185);
        }
        return originalName$182;
    }
    var nextFresh$121 = 0;
    function fresh$190() {
        return nextFresh$121++;
    }
    ;
    function joinSyntax$191(tojoin$192, punc$193) {
        if (tojoin$192.length === 0) {
            return [];
        }
        if (punc$193 === ' ') {
            return tojoin$192;
        }
        return _$52.reduce(_$52.rest(tojoin$192, 1), function (acc$194, join$195) {
            return acc$194.concat(mkSyntax$120(punc$193, parser$53.Token.Punctuator, join$195), join$195);
        }, [_$52.first(tojoin$192)]);
    }
    function wrapDelim$196(towrap$197, delimSyntax$198) {
        parser$53.assert(delimSyntax$198.token.type === parser$53.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$119({
            type: parser$53.Token.Delimiter,
            value: delimSyntax$198.token.value,
            inner: towrap$197,
            range: delimSyntax$198.token.range,
            startLineNumber: delimSyntax$198.token.startLineNumber,
            lineStart: delimSyntax$198.token.lineStart
        }, delimSyntax$198.context);
    }
    function getParamIdentifiers$199(argSyntax$200) {
        parser$53.assert(argSyntax$200.token.type === parser$53.Token.Delimiter, 'expecting delimiter for function params');
        return _$52.filter(argSyntax$200.token.inner, function (stx$201) {
            return stx$201.token.value !== ',';
        });
    }
    var TermTree$122 = {destruct: function (breakDelim$202) {
                return _$52.reduce(this.properties, _$52.bind(function (acc$203, prop$204) {
                    if (this[prop$204] && this[prop$204].hasPrototype(TermTree$122)) {
                        return acc$203.concat(this[prop$204].destruct(breakDelim$202));
                    } else if (this[prop$204]) {
                        return acc$203.concat(this[prop$204]);
                    } else {
                        return acc$203;
                    }
                }, this), []);
            }};
    var EOF$123 = TermTree$122.extend({
            properties: ['eof'],
            construct: function (e$205) {
                this.eof = e$205;
            }
        });
    var Statement$124 = TermTree$122.extend({construct: function () {
            }});
    var Expr$125 = TermTree$122.extend({construct: function () {
            }});
    var PrimaryExpression$126 = Expr$125.extend({construct: function () {
            }});
    var ThisExpression$127 = PrimaryExpression$126.extend({
            properties: ['this'],
            construct: function (that$206) {
                this.this = that$206;
            }
        });
    var Lit$128 = PrimaryExpression$126.extend({
            properties: ['lit'],
            construct: function (l$207) {
                this.lit = l$207;
            }
        });
    exports$51._test.PropertyAssignment = PropertyAssignment$129;
    var PropertyAssignment$129 = TermTree$122.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$208, assignment$209) {
                this.propName = propName$208;
                this.assignment = assignment$209;
            }
        });
    var Block$130 = PrimaryExpression$126.extend({
            properties: ['body'],
            construct: function (body$210) {
                this.body = body$210;
            }
        });
    var ArrayLiteral$131 = PrimaryExpression$126.extend({
            properties: ['array'],
            construct: function (ar$211) {
                this.array = ar$211;
            }
        });
    var ParenExpression$132 = PrimaryExpression$126.extend({
            properties: ['expr'],
            construct: function (expr$212) {
                this.expr = expr$212;
            }
        });
    var UnaryOp$133 = Expr$125.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$213, expr$214) {
                this.op = op$213;
                this.expr = expr$214;
            }
        });
    var PostfixOp$134 = Expr$125.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$215, op$216) {
                this.expr = expr$215;
                this.op = op$216;
            }
        });
    var BinOp$135 = Expr$125.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$217, left$218, right$219) {
                this.op = op$217;
                this.left = left$218;
                this.right = right$219;
            }
        });
    var ConditionalExpression$136 = Expr$125.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$220, question$221, tru$222, colon$223, fls$224) {
                this.cond = cond$220;
                this.question = question$221;
                this.tru = tru$222;
                this.colon = colon$223;
                this.fls = fls$224;
            }
        });
    var Keyword$137 = TermTree$122.extend({
            properties: ['keyword'],
            construct: function (k$225) {
                this.keyword = k$225;
            }
        });
    var Punc$138 = TermTree$122.extend({
            properties: ['punc'],
            construct: function (p$226) {
                this.punc = p$226;
            }
        });
    var Delimiter$139 = TermTree$122.extend({
            properties: ['delim'],
            destruct: function (breakDelim$227) {
                parser$53.assert(this.delim, 'expecting delim to be defined');
                var innerStx$228 = _$52.reduce(this.delim.token.inner, function (acc$229, term$230) {
                        if (term$230.hasPrototype(TermTree$122)) {
                            return acc$229.concat(term$230.destruct(breakDelim$227));
                        } else {
                            return acc$229.concat(term$230);
                        }
                    }, []);
                if (breakDelim$227) {
                    var openParen$231 = syntaxFromToken$119({
                            type: parser$53.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$232 = syntaxFromToken$119({
                            type: parser$53.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$231].concat(innerStx$228).concat(closeParen$232);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$233) {
                this.delim = d$233;
            }
        });
    var Id$140 = PrimaryExpression$126.extend({
            properties: ['id'],
            construct: function (id$234) {
                this.id = id$234;
            }
        });
    var NamedFun$141 = Expr$125.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$235, name$236, params$237, body$238) {
                this.keyword = keyword$235;
                this.name = name$236;
                this.params = params$237;
                this.body = body$238;
            }
        });
    var AnonFun$142 = Expr$125.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$239, params$240, body$241) {
                this.keyword = keyword$239;
                this.params = params$240;
                this.body = body$241;
            }
        });
    var LetMacro$143 = TermTree$122.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$242, body$243) {
                this.name = name$242;
                this.body = body$243;
            }
        });
    var Macro$144 = TermTree$122.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$244, body$245) {
                this.name = name$244;
                this.body = body$245;
            }
        });
    var Const$145 = Expr$125.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$246, call$247) {
                this.newterm = newterm$246;
                this.call = call$247;
            }
        });
    var Call$146 = Expr$125.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$248) {
                parser$53.assert(this.fun.hasPrototype(TermTree$122), 'expecting a term tree in destruct of call');
                var that$249 = this;
                this.delim = syntaxFromToken$119(_$52.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$52.reduce(this.args, function (acc$250, term$251) {
                    parser$53.assert(term$251 && term$251.hasPrototype(TermTree$122), 'expecting term trees in destruct of Call');
                    var dst$252 = acc$250.concat(term$251.destruct(breakDelim$248));
                    if (that$249.commas.length > 0) {
                        dst$252 = dst$252.concat(that$249.commas.shift());
                    }
                    return dst$252;
                }, []);
                return this.fun.destruct(breakDelim$248).concat(Delimiter$139.create(this.delim).destruct(breakDelim$248));
            },
            construct: function (funn$253, args$254, delim$255, commas$256) {
                parser$53.assert(Array.isArray(args$254), 'requires an array of arguments terms');
                this.fun = funn$253;
                this.args = args$254;
                this.delim = delim$255;
                this.commas = commas$256;
            }
        });
    var ObjDotGet$147 = Expr$125.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$257, dot$258, right$259) {
                this.left = left$257;
                this.dot = dot$258;
                this.right = right$259;
            }
        });
    var ObjGet$148 = Expr$125.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$260, right$261) {
                this.left = left$260;
                this.right = right$261;
            }
        });
    var VariableDeclaration$149 = TermTree$122.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$262, eqstx$263, init$264, comma$265) {
                this.ident = ident$262;
                this.eqstx = eqstx$263;
                this.init = init$264;
                this.comma = comma$265;
            }
        });
    var VariableStatement$150 = Statement$124.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$266) {
                return this.varkw.destruct(breakDelim$266).concat(_$52.reduce(this.decls, function (acc$267, decl$268) {
                    return acc$267.concat(decl$268.destruct(breakDelim$266));
                }, []));
            },
            construct: function (varkw$269, decls$270) {
                parser$53.assert(Array.isArray(decls$270), 'decls must be an array');
                this.varkw = varkw$269;
                this.decls = decls$270;
            }
        });
    var CatchClause$151 = TermTree$122.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$271, params$272, body$273) {
                this.catchkw = catchkw$271;
                this.params = params$272;
                this.body = body$273;
            }
        });
    var Empty$152 = TermTree$122.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$274(stx$275) {
        var staticOperators$276 = [
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
        return _$52.contains(staticOperators$276, stx$275.token.value);
    }
    function stxIsBinOp$277(stx$278) {
        var staticOperators$279 = [
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
        return _$52.contains(staticOperators$279, stx$278.token.value);
    }
    function enforestVarStatement$280(stx$281, env$282) {
        var decls$283 = [];
        var res$284 = enforest$291(stx$281, env$282);
        var result$285 = res$284.result;
        var rest$286 = res$284.rest;
        if (rest$286[0]) {
            var nextRes$287 = enforest$291(rest$286, env$282);
            if (nextRes$287.result.hasPrototype(Punc$138) && nextRes$287.result.punc.token.value === '=') {
                var initializerRes$288 = enforest$291(nextRes$287.rest, env$282);
                if (initializerRes$288.rest[0]) {
                    var restRes$289 = enforest$291(initializerRes$288.rest, env$282);
                    if (restRes$289.result.hasPrototype(Punc$138) && restRes$289.result.punc.token.value === ',') {
                        decls$283.push(VariableDeclaration$149.create(result$285.id, nextRes$287.result.punc, initializerRes$288.result, restRes$289.result.punc));
                        var subRes$290 = enforestVarStatement$280(restRes$289.rest, env$282);
                        decls$283 = decls$283.concat(subRes$290.result);
                        rest$286 = subRes$290.rest;
                    } else {
                        decls$283.push(VariableDeclaration$149.create(result$285.id, nextRes$287.result.punc, initializerRes$288.result));
                        rest$286 = initializerRes$288.rest;
                    }
                } else {
                    decls$283.push(VariableDeclaration$149.create(result$285.id, nextRes$287.result.punc, initializerRes$288.result));
                }
            } else if (nextRes$287.result.hasPrototype(Punc$138) && nextRes$287.result.punc.token.value === ',') {
                decls$283.push(VariableDeclaration$149.create(result$285.id, null, null, nextRes$287.result.punc));
                var subRes$290 = enforestVarStatement$280(nextRes$287.rest, env$282);
                decls$283 = decls$283.concat(subRes$290.result);
                rest$286 = subRes$290.rest;
            } else {
                if (result$285.hasPrototype(Id$140)) {
                    decls$283.push(VariableDeclaration$149.create(result$285.id));
                } else {
                    throwError$158('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$285.hasPrototype(Id$140)) {
                decls$283.push(VariableDeclaration$149.create(result$285.id));
            } else if (result$285.hasPrototype(BinOp$135) && result$285.op.token.value === 'in') {
                decls$283.push(VariableDeclaration$149.create(result$285.left.id, result$285.op, result$285.right));
            } else {
                throwError$158('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$283,
            rest: rest$286
        };
    }
    function enforest$291(toks$292, env$293) {
        env$293 = env$293 || new Map();
        parser$53.assert(toks$292.length > 0, 'enforest assumes there are tokens to work with');
        function step$294(head$295, rest$296) {
            var innerTokens$297;
            parser$53.assert(Array.isArray(rest$296), 'result must at least be an empty array');
            if (head$295.hasPrototype(TermTree$122)) {
                var emp$300 = head$295.emp;
                var emp$300 = head$295.emp;
                var keyword$303 = head$295.keyword;
                var delim$305 = head$295.delim;
                var emp$300 = head$295.emp;
                var punc$308 = head$295.punc;
                var keyword$303 = head$295.keyword;
                var emp$300 = head$295.emp;
                var emp$300 = head$295.emp;
                var emp$300 = head$295.emp;
                var delim$305 = head$295.delim;
                var delim$305 = head$295.delim;
                var keyword$303 = head$295.keyword;
                if (head$295.hasPrototype(Expr$125) && (rest$296[0] && rest$296[0].token.type === parser$53.Token.Delimiter && rest$296[0].token.value === '()')) {
                    var argRes$331, enforestedArgs$332 = [], commas$333 = [];
                    innerTokens$297 = rest$296[0].token.inner;
                    while (innerTokens$297.length > 0) {
                        argRes$331 = enforest$291(innerTokens$297, env$293);
                        enforestedArgs$332.push(argRes$331.result);
                        innerTokens$297 = argRes$331.rest;
                        if (innerTokens$297[0] && innerTokens$297[0].token.value === ',') {
                            commas$333.push(innerTokens$297[0]);
                            innerTokens$297 = innerTokens$297.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$334 = _$52.all(enforestedArgs$332, function (argTerm$335) {
                            return argTerm$335.hasPrototype(Expr$125);
                        });
                    if (innerTokens$297.length === 0 && argsAreExprs$334) {
                        return step$294(Call$146.create(head$295, enforestedArgs$332, rest$296[0], commas$333), rest$296.slice(1));
                    }
                } else if (head$295.hasPrototype(Expr$125) && (rest$296[0] && rest$296[0].token.value === '?')) {
                    var question$336 = rest$296[0];
                    var condRes$337 = enforest$291(rest$296.slice(1), env$293);
                    var truExpr$338 = condRes$337.result;
                    var right$339 = condRes$337.rest;
                    if (truExpr$338.hasPrototype(Expr$125) && right$339[0] && right$339[0].token.value === ':') {
                        var colon$340 = right$339[0];
                        var flsRes$341 = enforest$291(right$339.slice(1), env$293);
                        var flsExpr$342 = flsRes$341.result;
                        if (flsExpr$342.hasPrototype(Expr$125)) {
                            return step$294(ConditionalExpression$136.create(head$295, question$336, truExpr$338, colon$340, flsExpr$342), flsRes$341.rest);
                        }
                    }
                } else if (head$295.hasPrototype(Keyword$137) && (keyword$303.token.value === 'new' && rest$296[0])) {
                    var newCallRes$343 = enforest$291(rest$296, env$293);
                    if (newCallRes$343.result.hasPrototype(Call$146)) {
                        return step$294(Const$145.create(head$295, newCallRes$343.result), newCallRes$343.rest);
                    }
                } else if (head$295.hasPrototype(Delimiter$139) && delim$305.token.value === '()') {
                    innerTokens$297 = delim$305.token.inner;
                    if (innerTokens$297.length === 0) {
                        return step$294(ParenExpression$132.create(head$295), rest$296);
                    } else {
                        var innerTerm$344 = get_expression$354(innerTokens$297, env$293);
                        if (innerTerm$344.result && innerTerm$344.result.hasPrototype(Expr$125)) {
                            return step$294(ParenExpression$132.create(head$295), rest$296);
                        }
                    }
                } else if (head$295.hasPrototype(TermTree$122) && (rest$296[0] && rest$296[1] && stxIsBinOp$277(rest$296[0]))) {
                    var op$345 = rest$296[0];
                    var left$346 = head$295;
                    var bopRes$347 = enforest$291(rest$296.slice(1), env$293);
                    var right$339 = bopRes$347.result;
                    if (right$339.hasPrototype(Expr$125)) {
                        return step$294(BinOp$135.create(op$345, left$346, right$339), bopRes$347.rest);
                    }
                } else if (head$295.hasPrototype(Punc$138) && stxIsUnaryOp$274(punc$308)) {
                    var unopRes$348 = enforest$291(rest$296, env$293);
                    if (unopRes$348.result.hasPrototype(Expr$125)) {
                        return step$294(UnaryOp$133.create(punc$308, unopRes$348.result), unopRes$348.rest);
                    }
                } else if (head$295.hasPrototype(Keyword$137) && stxIsUnaryOp$274(keyword$303)) {
                    var unopRes$348 = enforest$291(rest$296, env$293);
                    if (unopRes$348.result.hasPrototype(Expr$125)) {
                        return step$294(UnaryOp$133.create(keyword$303, unopRes$348.result), unopRes$348.rest);
                    }
                } else if (head$295.hasPrototype(Expr$125) && (rest$296[0] && (rest$296[0].token.value === '++' || rest$296[0].token.value === '--'))) {
                    return step$294(PostfixOp$134.create(head$295, rest$296[0]), rest$296.slice(1));
                } else if (head$295.hasPrototype(Expr$125) && (rest$296[0] && rest$296[0].token.value === '[]')) {
                    var getRes$349 = enforest$291(rest$296[0].token.inner, env$293);
                    var resStx$350 = mkSyntax$120('[]', parser$53.Token.Delimiter, rest$296[0]);
                    resStx$350.token.inner = [getRes$349.result];
                    return step$294(ObjGet$148.create(head$295, Delimiter$139.create(resStx$350)), rest$296.slice(1));
                } else if (head$295.hasPrototype(Expr$125) && (rest$296[0] && rest$296[0].token.value === '.' && rest$296[1] && rest$296[1].token.type === parser$53.Token.Identifier)) {
                    return step$294(ObjDotGet$147.create(head$295, rest$296[0], rest$296[1]), rest$296.slice(2));
                } else if (head$295.hasPrototype(Delimiter$139) && delim$305.token.value === '[]') {
                    return step$294(ArrayLiteral$131.create(head$295), rest$296);
                } else if (head$295.hasPrototype(Delimiter$139) && head$295.delim.token.value === '{}') {
                    return step$294(Block$130.create(head$295), rest$296);
                } else if (head$295.hasPrototype(Keyword$137) && (keyword$303.token.value === 'var' && rest$296[0])) {
                    var vsRes$351 = enforestVarStatement$280(rest$296, env$293);
                    if (vsRes$351) {
                        return step$294(VariableStatement$150.create(head$295, vsRes$351.result), vsRes$351.rest);
                    }
                }
            } else {
                parser$53.assert(head$295 && head$295.token, 'assuming head is a syntax object');
                if ((head$295.token.type === parser$53.Token.Identifier || head$295.token.type === parser$53.Token.Keyword || head$295.token.type === parser$53.Token.Punctuator) && env$293.has(resolve$169(head$295))) {
                    var transformer$352 = env$293.get(resolve$169(head$295));
                    var rt$353 = transformer$352([head$295].concat(rest$296), env$293);
                    if (!Array.isArray(rt$353.result)) {
                        throwError$158('Macro transformer must return a result array, not: ' + rt$353.result);
                    }
                    if (rt$353.result.length > 0) {
                        return step$294(rt$353.result[0], rt$353.result.slice(1).concat(rt$353.rest));
                    } else {
                        return step$294(Empty$152.create(), rt$353.rest);
                    }
                } else if (head$295.token.value === 'let' && rest$296[0] && rest$296[0].token.type === parser$53.Token.Identifier && rest$296[1] && rest$296[1].token.value === '=' && rest$296[2] && rest$296[2].token.value === 'macro' && rest$296[3] && rest$296[3].token.value === '{}') {
                    return step$294(LetMacro$143.create(rest$296[0], rest$296[3].token.inner), rest$296.slice(4));
                } else if (head$295.token.type === parser$53.Token.Identifier && head$295.token.value === 'macro' && rest$296[0] && (rest$296[0].token.type === parser$53.Token.Identifier || rest$296[0].token.type === parser$53.Token.Keyword || rest$296[0].token.type === parser$53.Token.Punctuator) && rest$296[1] && rest$296[1].token.type === parser$53.Token.Delimiter && rest$296[1].token.value === '{}') {
                    return step$294(Macro$144.create(rest$296[0], rest$296[1].token.inner), rest$296.slice(2));
                } else if (head$295.token.type === parser$53.Token.Keyword && head$295.token.value === 'function' && rest$296[0] && rest$296[0].token.type === parser$53.Token.Identifier && rest$296[1] && rest$296[1].token.type === parser$53.Token.Delimiter && rest$296[1].token.value === '()' && rest$296[2] && rest$296[2].token.type === parser$53.Token.Delimiter && rest$296[2].token.value === '{}') {
                    return step$294(NamedFun$141.create(head$295, rest$296[0], rest$296[1], rest$296[2]), rest$296.slice(3));
                } else if (head$295.token.type === parser$53.Token.Keyword && head$295.token.value === 'function' && rest$296[0] && rest$296[0].token.type === parser$53.Token.Delimiter && rest$296[0].token.value === '()' && rest$296[1] && rest$296[1].token.type === parser$53.Token.Delimiter && rest$296[1].token.value === '{}') {
                    return step$294(AnonFun$142.create(head$295, rest$296[0], rest$296[1]), rest$296.slice(2));
                } else if (head$295.token.type === parser$53.Token.Keyword && head$295.token.value === 'catch' && rest$296[0] && rest$296[0].token.type === parser$53.Token.Delimiter && rest$296[0].token.value === '()' && rest$296[1] && rest$296[1].token.type === parser$53.Token.Delimiter && rest$296[1].token.value === '{}') {
                    return step$294(CatchClause$151.create(head$295, rest$296[0], rest$296[1]), rest$296.slice(2));
                } else if (head$295.token.type === parser$53.Token.Keyword && head$295.token.value === 'this') {
                    return step$294(ThisExpression$127.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.NumericLiteral || head$295.token.type === parser$53.Token.StringLiteral || head$295.token.type === parser$53.Token.BooleanLiteral || head$295.token.type === parser$53.Token.RegexLiteral || head$295.token.type === parser$53.Token.NullLiteral) {
                    return step$294(Lit$128.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.Identifier) {
                    return step$294(Id$140.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.Punctuator) {
                    return step$294(Punc$138.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.Keyword && head$295.token.value === 'with') {
                    throwError$158('with is not supported in sweet.js');
                } else if (head$295.token.type === parser$53.Token.Keyword) {
                    return step$294(Keyword$137.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.Delimiter) {
                    return step$294(Delimiter$139.create(head$295), rest$296);
                } else if (head$295.token.type === parser$53.Token.EOF) {
                    parser$53.assert(rest$296.length === 0, 'nothing should be after an EOF');
                    return step$294(EOF$123.create(head$295), []);
                } else {
                    parser$53.assert(false, 'not implemented');
                }
            }
            return {
                result: head$295,
                rest: rest$296
            };
        }
        return step$294(toks$292[0], toks$292.slice(1));
    }
    function get_expression$354(stx$355, env$356) {
        var res$357 = enforest$291(stx$355, env$356);
        if (!res$357.result.hasPrototype(Expr$125)) {
            return {
                result: null,
                rest: stx$355
            };
        }
        return res$357;
    }
    function applyMarkToPatternEnv$358(newMark$359, env$360) {
        function dfs$361(match$362) {
            if (match$362.level === 0) {
                match$362.match = _$52.map(match$362.match, function (stx$363) {
                    return stx$363.mark(newMark$359);
                });
            } else {
                _$52.each(match$362.match, function (match$364) {
                    dfs$361(match$364);
                });
            }
        }
        _$52.keys(env$360).forEach(function (key$365) {
            dfs$361(env$360[key$365]);
        });
    }
    function loadMacroDef$366(mac$367, env$368, defscope$369, templateMap$370) {
        var body$371 = mac$367.body;
        if (!(body$371[0] && body$371[0].token.type === parser$53.Token.Keyword && body$371[0].token.value === 'function')) {
            throwError$158('Primitive macro form must contain a function for the macro body');
        }
        var stub$372 = parser$53.read('()');
        stub$372[0].token.inner = body$371;
        var expanded$373 = flatten$442(expand$428(stub$372, env$368, defscope$369, templateMap$370));
        var bodyCode$374 = codegen$56.generate(parser$53.parse(expanded$373));
        var macroFn$375 = scopedEval$111(bodyCode$374, {
                makeValue: syn$54.makeValue,
                makeRegex: syn$54.makeRegex,
                makeIdent: syn$54.makeIdent,
                makeKeyword: syn$54.makeKeyword,
                makePunc: syn$54.makePunc,
                makeDelim: syn$54.makeDelim,
                unwrapSyntax: syn$54.unwrapSyntax,
                fresh: fresh$190,
                _: _$52,
                parser: parser$53,
                patternModule: patternModule$59,
                getTemplate: function (id$376) {
                    return templateMap$370.get(id$376);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$358
            });
        return macroFn$375;
    }
    function expandToTermTree$377(stx$378, env$379, defscope$380, templateMap$381) {
        parser$53.assert(env$379, 'environment map is required');
        if (stx$378.length === 0) {
            return {
                terms: [],
                env: env$379
            };
        }
        parser$53.assert(stx$378[0].token, 'expecting a syntax object');
        var f$382 = enforest$291(stx$378, env$379);
        var head$383 = f$382.result;
        var rest$384 = f$382.rest;
        if (head$383.hasPrototype(Macro$144)) {
            var macroDefinition$386 = loadMacroDef$366(head$383, env$379, defscope$380, templateMap$381);
            addToDefinitionCtx$393([head$383.name], defscope$380, false);
            env$379.set(resolve$169(head$383.name), macroDefinition$386);
            return expandToTermTree$377(rest$384, env$379, defscope$380, templateMap$381);
        }
        if (head$383.hasPrototype(LetMacro$143)) {
            var macroDefinition$386 = loadMacroDef$366(head$383, env$379, defscope$380, templateMap$381);
            addToDefinitionCtx$393([head$383.name], defscope$380, false);
            env$379.set(resolve$169(head$383.name), macroDefinition$386);
            return expandToTermTree$377(rest$384, env$379, defscope$380, templateMap$381);
        }
        if (head$383.hasPrototype(Id$140) && head$383.id.token.value === '#quoteSyntax' && rest$384[0] && rest$384[0].token.value === '{}') {
            var tempId$387 = fresh$190();
            templateMap$381.set(tempId$387, rest$384[0].token.inner);
            return expandToTermTree$377([
                syn$54.makeIdent('getTemplate', head$383.id),
                syn$54.makeDelim('()', [syn$54.makeValue(tempId$387, head$383.id)])
            ].concat(rest$384.slice(1)), env$379, defscope$380, templateMap$381);
        }
        if (head$383.hasPrototype(VariableStatement$150)) {
            addToDefinitionCtx$393(_$52.map(head$383.decls, function (decl$388) {
                return decl$388.ident;
            }), defscope$380, true);
        }
        if (head$383.hasPrototype(Block$130) && head$383.body.hasPrototype(Delimiter$139)) {
            head$383.body.delim.token.inner.forEach(function (term$389) {
                if (term$389.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$393(_$52.map(term$389.decls, function (decl$390) {
                        return decl$390.ident;
                    }), defscope$380, true);
                }
            });
        }
        if (head$383.hasPrototype(Delimiter$139)) {
            head$383.delim.token.inner.forEach(function (term$391) {
                if (term$391.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$393(_$52.map(term$391.decls, function (decl$392) {
                        return decl$392.ident;
                    }), defscope$380, true);
                }
            });
        }
        var trees$385 = expandToTermTree$377(rest$384, env$379, defscope$380, templateMap$381);
        return {
            terms: [head$383].concat(trees$385.terms),
            env: trees$385.env
        };
    }
    function addToDefinitionCtx$393(idents$394, defscope$395, skipRep$396) {
        parser$53.assert(idents$394 && idents$394.length > 0, 'expecting some variable identifiers');
        skipRep$396 = skipRep$396 || false;
        _$52.each(idents$394, function (id$397) {
            var skip$398 = false;
            if (skipRep$396) {
                var declRepeat$399 = _$52.find(defscope$395, function (def$400) {
                        return def$400.id.token.value === id$397.token.value && arraysEqual$171(marksof$163(def$400.id.context), marksof$163(id$397.context));
                    });
                skip$398 = typeof declRepeat$399 !== 'undefined';
            }
            if (!skip$398) {
                var name$401 = fresh$190();
                defscope$395.push({
                    id: id$397,
                    name: name$401
                });
            }
        });
    }
    function expandTermTreeToFinal$402(term$403, env$404, defscope$405, templateMap$406) {
        parser$53.assert(env$404, 'environment map is required');
        if (term$403.hasPrototype(ArrayLiteral$131)) {
            term$403.array.delim.token.inner = expand$428(term$403.array.delim.token.inner, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(Block$130)) {
            term$403.body.delim.token.inner = expand$428(term$403.body.delim.token.inner, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(ParenExpression$132)) {
            term$403.expr.delim.token.inner = expand$428(term$403.expr.delim.token.inner, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(Call$146)) {
            term$403.fun = expandTermTreeToFinal$402(term$403.fun, env$404, defscope$405, templateMap$406);
            term$403.args = _$52.map(term$403.args, function (arg$407) {
                return expandTermTreeToFinal$402(arg$407, env$404, defscope$405, templateMap$406);
            });
            return term$403;
        } else if (term$403.hasPrototype(UnaryOp$133)) {
            term$403.expr = expandTermTreeToFinal$402(term$403.expr, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(BinOp$135)) {
            term$403.left = expandTermTreeToFinal$402(term$403.left, env$404, defscope$405, templateMap$406);
            term$403.right = expandTermTreeToFinal$402(term$403.right, env$404, defscope$405);
            return term$403;
        } else if (term$403.hasPrototype(ObjDotGet$147)) {
            term$403.left = expandTermTreeToFinal$402(term$403.left, env$404, defscope$405, templateMap$406);
            term$403.right = expandTermTreeToFinal$402(term$403.right, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(VariableDeclaration$149)) {
            if (term$403.init) {
                term$403.init = expandTermTreeToFinal$402(term$403.init, env$404, defscope$405, templateMap$406);
            }
            return term$403;
        } else if (term$403.hasPrototype(VariableStatement$150)) {
            term$403.decls = _$52.map(term$403.decls, function (decl$408) {
                return expandTermTreeToFinal$402(decl$408, env$404, defscope$405, templateMap$406);
            });
            return term$403;
        } else if (term$403.hasPrototype(Delimiter$139)) {
            term$403.delim.token.inner = expand$428(term$403.delim.token.inner, env$404, defscope$405, templateMap$406);
            return term$403;
        } else if (term$403.hasPrototype(NamedFun$141) || term$403.hasPrototype(AnonFun$142) || term$403.hasPrototype(CatchClause$151)) {
            if (term$403.hasPrototype(NamedFun$141)) {
                addToDefinitionCtx$393([term$403.name], defscope$405, false);
            }
            var newDef$409 = [];
            var params$410 = term$403.params.addDefCtx(newDef$409);
            var bodies$411 = term$403.body.addDefCtx(newDef$409);
            var paramNames$412 = _$52.map(getParamIdentifiers$199(params$410), function (param$420) {
                    var freshName$421 = fresh$190();
                    return {
                        freshName: freshName$421,
                        originalParam: param$420,
                        renamedParam: param$420.rename(param$420, freshName$421)
                    };
                });
            var stxBody$413 = bodies$411;
            var renamedBody$414 = _$52.reduce(paramNames$412, function (accBody$422, p$423) {
                    return accBody$422.rename(p$423.originalParam, p$423.freshName);
                }, stxBody$413);
            var bodyTerms$415 = expand$428([renamedBody$414], env$404, newDef$409, templateMap$406);
            parser$53.assert(bodyTerms$415.length === 1 && bodyTerms$415[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$416 = flatten$442(bodyTerms$415);
            var renamedParams$417 = _$52.map(paramNames$412, function (p$424) {
                    return p$424.renamedParam;
                });
            var flatArgs$418 = wrapDelim$196(joinSyntax$191(renamedParams$417, ','), term$403.params);
            var expandedArgs$419 = expand$428([flatArgs$418], env$404, newDef$409, templateMap$406);
            parser$53.assert(expandedArgs$419.length === 1, 'should only get back one result');
            term$403.params = expandedArgs$419[0];
            term$403.body = _$52.map(flattenedBody$416, function (stx$425) {
                return _$52.reduce(newDef$409, function (acc$426, def$427) {
                    return acc$426.rename(def$427.id, def$427.name);
                }, stx$425);
            });
            return term$403;
        }
        return term$403;
    }
    function expand$428(stx$429, env$430, defscope$431, templateMap$432) {
        env$430 = env$430 || new Map();
        templateMap$432 = templateMap$432 || new Map();
        var trees$433 = expandToTermTree$377(stx$429, env$430, defscope$431, templateMap$432);
        return _$52.map(trees$433.terms, function (term$434) {
            return expandTermTreeToFinal$402(term$434, trees$433.env, defscope$431, templateMap$432);
        });
    }
    function expandTopLevel$435(stx$436) {
        var funn$437 = syntaxFromToken$119({
                value: 'function',
                type: parser$53.Token.Keyword
            });
        var params$438 = syntaxFromToken$119({
                value: '()',
                type: parser$53.Token.Delimiter,
                inner: []
            });
        var body$439 = syntaxFromToken$119({
                value: '{}',
                type: parser$53.Token.Delimiter,
                inner: stx$436
            });
        var res$440 = expand$428([
                funn$437,
                params$438,
                body$439
            ]);
        return _$52.map(res$440[0].body.slice(1, res$440[0].body.length - 1), function (stx$441) {
            return stx$441;
        });
    }
    function flatten$442(terms$443) {
        return _$52.reduce(terms$443, function (acc$444, term$445) {
            return acc$444.concat(term$445.destruct(true));
        }, []);
    }
    exports$51.enforest = enforest$291;
    exports$51.expand = expandTopLevel$435;
    exports$51.resolve = resolve$169;
    exports$51.flatten = flatten$442;
    exports$51.get_expression = get_expression$354;
    exports$51.Expr = Expr$125;
    exports$51.VariableStatement = VariableStatement$150;
    exports$51.tokensToSyntax = syn$54.tokensToSyntax;
}));