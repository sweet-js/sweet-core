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
        for (var prop$156 in properties$154) {
            if (properties$154.hasOwnProperty(prop$156)) {
                result$155[prop$156] = properties$154[prop$156];
            }
        }
        return result$155;
    };
    Object.prototype.hasPrototype = function (proto$157) {
        function F$158() {
        }
        F$158.prototype = proto$157;
        return this instanceof F$158;
    };
    function throwError$159(msg$160) {
        throw new Error(msg$160);
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
    function remdup$161(mark$162, mlist$163) {
        if (mark$162 === _$52.first(mlist$163)) {
            return _$52.rest(mlist$163, 1);
        }
        return [mark$162].concat(mlist$163);
    }
    function marksof$164(ctx$165, stopName$166, originalName$167) {
        var mark$168, submarks$169;
        if (isMark$117(ctx$165)) {
            mark$168 = ctx$165.mark;
            submarks$169 = marksof$164(ctx$165.context, stopName$166, originalName$167);
            return remdup$161(mark$168, submarks$169);
        }
        if (isDef$116(ctx$165)) {
            return marksof$164(ctx$165.context, stopName$166, originalName$167);
        }
        if (isRename$118(ctx$165)) {
            if (stopName$166 === originalName$167 + '$' + ctx$165.name) {
                return [];
            }
            return marksof$164(ctx$165.context, stopName$166, originalName$167);
        }
        return [];
    }
    function resolve$170(stx$171) {
        return resolveCtx$182(stx$171.token.value, stx$171.context, [], []);
    }
    function arraysEqual$172(a$173, b$174) {
        if (a$173.length !== b$174.length) {
            return false;
        }
        for (var i$175 = 0; i$175 < a$173.length; i$175++) {
            if (a$173[i$175] !== b$174[i$175]) {
                return false;
            }
        }
        return true;
    }
    function renames$176(defctx$177, oldctx$178, originalName$179) {
        var acc$180 = oldctx$178;
        defctx$177.forEach(function (def$181) {
            if (def$181.id.token.value === originalName$179) {
                acc$180 = Rename$112(def$181.id, def$181.name, acc$180, defctx$177);
            }
        });
        return acc$180;
    }
    function resolveCtx$182(originalName$183, ctx$184, stop_spine$185, stop_branch$186) {
        if (isMark$117(ctx$184)) {
            return resolveCtx$182(originalName$183, ctx$184.context, stop_spine$185, stop_branch$186);
        }
        if (isDef$116(ctx$184)) {
            if (_$52.contains(stop_spine$185, ctx$184.defctx)) {
                return resolveCtx$182(originalName$183, ctx$184.context, stop_spine$185, stop_branch$186);
            } else {
                return resolveCtx$182(originalName$183, renames$176(ctx$184.defctx, ctx$184.context, originalName$183), stop_spine$185, _$52.union(stop_branch$186, [ctx$184.defctx]));
            }
        }
        if (isRename$118(ctx$184)) {
            var idName$187 = resolveCtx$182(ctx$184.id.token.value, ctx$184.id.context, stop_branch$186, stop_branch$186);
            var subName$188 = resolveCtx$182(originalName$183, ctx$184.context, _$52.union(stop_spine$185, [ctx$184.def]), stop_branch$186);
            if (idName$187 === subName$188) {
                var idMarks$189 = marksof$164(ctx$184.id.context, originalName$183 + '$' + ctx$184.name, originalName$183);
                var subMarks$190 = marksof$164(ctx$184.context, originalName$183 + '$' + ctx$184.name, originalName$183);
                if (arraysEqual$172(idMarks$189, subMarks$190)) {
                    return originalName$183 + '$' + ctx$184.name;
                }
            }
            return resolveCtx$182(originalName$183, ctx$184.context, _$52.union(stop_spine$185, [ctx$184.def]), stop_branch$186);
        }
        return originalName$183;
    }
    var nextFresh$121 = 0;
    function fresh$191() {
        return nextFresh$121++;
    }
    ;
    function joinSyntax$192(tojoin$193, punc$194) {
        if (tojoin$193.length === 0) {
            return [];
        }
        if (punc$194 === ' ') {
            return tojoin$193;
        }
        return _$52.reduce(_$52.rest(tojoin$193, 1), function (acc$195, join$196) {
            return acc$195.concat(mkSyntax$120(punc$194, parser$53.Token.Punctuator, join$196), join$196);
        }, [_$52.first(tojoin$193)]);
    }
    function wrapDelim$197(towrap$198, delimSyntax$199) {
        parser$53.assert(delimSyntax$199.token.type === parser$53.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$119({
            type: parser$53.Token.Delimiter,
            value: delimSyntax$199.token.value,
            inner: towrap$198,
            range: delimSyntax$199.token.range,
            startLineNumber: delimSyntax$199.token.startLineNumber,
            lineStart: delimSyntax$199.token.lineStart
        }, delimSyntax$199.context);
    }
    function getParamIdentifiers$200(argSyntax$201) {
        parser$53.assert(argSyntax$201.token.type === parser$53.Token.Delimiter, 'expecting delimiter for function params');
        return _$52.filter(argSyntax$201.token.inner, function (stx$202) {
            return stx$202.token.value !== ',';
        });
    }
    var TermTree$122 = {destruct: function (breakDelim$203) {
                return _$52.reduce(this.properties, _$52.bind(function (acc$204, prop$205) {
                    if (this[prop$205] && this[prop$205].hasPrototype(TermTree$122)) {
                        return acc$204.concat(this[prop$205].destruct(breakDelim$203));
                    } else if (this[prop$205]) {
                        return acc$204.concat(this[prop$205]);
                    } else {
                        return acc$204;
                    }
                }, this), []);
            }};
    var EOF$123 = TermTree$122.extend({
            properties: ['eof'],
            construct: function (e$206) {
                this.eof = e$206;
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
            construct: function (that$207) {
                this.this = that$207;
            }
        });
    var Lit$128 = PrimaryExpression$126.extend({
            properties: ['lit'],
            construct: function (l$208) {
                this.lit = l$208;
            }
        });
    exports$51._test.PropertyAssignment = PropertyAssignment$129;
    var PropertyAssignment$129 = TermTree$122.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$209, assignment$210) {
                this.propName = propName$209;
                this.assignment = assignment$210;
            }
        });
    var Block$130 = PrimaryExpression$126.extend({
            properties: ['body'],
            construct: function (body$211) {
                this.body = body$211;
            }
        });
    var ArrayLiteral$131 = PrimaryExpression$126.extend({
            properties: ['array'],
            construct: function (ar$212) {
                this.array = ar$212;
            }
        });
    var ParenExpression$132 = PrimaryExpression$126.extend({
            properties: ['expr'],
            construct: function (expr$213) {
                this.expr = expr$213;
            }
        });
    var UnaryOp$133 = Expr$125.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$214, expr$215) {
                this.op = op$214;
                this.expr = expr$215;
            }
        });
    var PostfixOp$134 = Expr$125.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$216, op$217) {
                this.expr = expr$216;
                this.op = op$217;
            }
        });
    var BinOp$135 = Expr$125.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$218, left$219, right$220) {
                this.op = op$218;
                this.left = left$219;
                this.right = right$220;
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
            construct: function (cond$221, question$222, tru$223, colon$224, fls$225) {
                this.cond = cond$221;
                this.question = question$222;
                this.tru = tru$223;
                this.colon = colon$224;
                this.fls = fls$225;
            }
        });
    var Keyword$137 = TermTree$122.extend({
            properties: ['keyword'],
            construct: function (k$226) {
                this.keyword = k$226;
            }
        });
    var Punc$138 = TermTree$122.extend({
            properties: ['punc'],
            construct: function (p$227) {
                this.punc = p$227;
            }
        });
    var Delimiter$139 = TermTree$122.extend({
            properties: ['delim'],
            destruct: function (breakDelim$228) {
                parser$53.assert(this.delim, 'expecting delim to be defined');
                var innerStx$229 = _$52.reduce(this.delim.token.inner, function (acc$230, term$231) {
                        if (term$231.hasPrototype(TermTree$122)) {
                            return acc$230.concat(term$231.destruct(breakDelim$228));
                        } else {
                            return acc$230.concat(term$231);
                        }
                    }, []);
                if (breakDelim$228) {
                    var openParen$232 = syntaxFromToken$119({
                            type: parser$53.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$233 = syntaxFromToken$119({
                            type: parser$53.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$232].concat(innerStx$229).concat(closeParen$233);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$234) {
                this.delim = d$234;
            }
        });
    var Id$140 = PrimaryExpression$126.extend({
            properties: ['id'],
            construct: function (id$235) {
                this.id = id$235;
            }
        });
    var NamedFun$141 = Expr$125.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$236, name$237, params$238, body$239) {
                this.keyword = keyword$236;
                this.name = name$237;
                this.params = params$238;
                this.body = body$239;
            }
        });
    var AnonFun$142 = Expr$125.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$240, params$241, body$242) {
                this.keyword = keyword$240;
                this.params = params$241;
                this.body = body$242;
            }
        });
    var LetMacro$143 = TermTree$122.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$243, body$244) {
                this.name = name$243;
                this.body = body$244;
            }
        });
    var Macro$144 = TermTree$122.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$245, body$246) {
                this.name = name$245;
                this.body = body$246;
            }
        });
    var Const$145 = Expr$125.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$247, call$248) {
                this.newterm = newterm$247;
                this.call = call$248;
            }
        });
    var Call$146 = Expr$125.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$249) {
                parser$53.assert(this.fun.hasPrototype(TermTree$122), 'expecting a term tree in destruct of call');
                var that$250 = this;
                this.delim = syntaxFromToken$119(_$52.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$52.reduce(this.args, function (acc$251, term$252) {
                    parser$53.assert(term$252 && term$252.hasPrototype(TermTree$122), 'expecting term trees in destruct of Call');
                    var dst$253 = acc$251.concat(term$252.destruct(breakDelim$249));
                    if (that$250.commas.length > 0) {
                        dst$253 = dst$253.concat(that$250.commas.shift());
                    }
                    return dst$253;
                }, []);
                return this.fun.destruct(breakDelim$249).concat(Delimiter$139.create(this.delim).destruct(breakDelim$249));
            },
            construct: function (funn$254, args$255, delim$256, commas$257) {
                parser$53.assert(Array.isArray(args$255), 'requires an array of arguments terms');
                this.fun = funn$254;
                this.args = args$255;
                this.delim = delim$256;
                this.commas = commas$257;
            }
        });
    var ObjDotGet$147 = Expr$125.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$258, dot$259, right$260) {
                this.left = left$258;
                this.dot = dot$259;
                this.right = right$260;
            }
        });
    var ObjGet$148 = Expr$125.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$261, right$262) {
                this.left = left$261;
                this.right = right$262;
            }
        });
    var VariableDeclaration$149 = TermTree$122.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$263, eqstx$264, init$265, comma$266) {
                this.ident = ident$263;
                this.eqstx = eqstx$264;
                this.init = init$265;
                this.comma = comma$266;
            }
        });
    var VariableStatement$150 = Statement$124.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$267) {
                return this.varkw.destruct(breakDelim$267).concat(_$52.reduce(this.decls, function (acc$268, decl$269) {
                    return acc$268.concat(decl$269.destruct(breakDelim$267));
                }, []));
            },
            construct: function (varkw$270, decls$271) {
                parser$53.assert(Array.isArray(decls$271), 'decls must be an array');
                this.varkw = varkw$270;
                this.decls = decls$271;
            }
        });
    var CatchClause$151 = TermTree$122.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$272, params$273, body$274) {
                this.catchkw = catchkw$272;
                this.params = params$273;
                this.body = body$274;
            }
        });
    var Empty$152 = TermTree$122.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp$275(stx$276) {
        var staticOperators$277 = [
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
        return _$52.contains(staticOperators$277, stx$276.token.value);
    }
    function stxIsBinOp$278(stx$279) {
        var staticOperators$280 = [
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
        return _$52.contains(staticOperators$280, stx$279.token.value);
    }
    function enforestVarStatement$281(stx$282, env$283) {
        var decls$284 = [];
        var res$285 = enforest$292(stx$282, env$283);
        var result$286 = res$285.result;
        var rest$287 = res$285.rest;
        if (rest$287[0]) {
            var nextRes$288 = enforest$292(rest$287, env$283);
            if (nextRes$288.result.hasPrototype(Punc$138) && nextRes$288.result.punc.token.value === '=') {
                var initializerRes$289 = enforest$292(nextRes$288.rest, env$283);
                if (initializerRes$289.rest[0]) {
                    var restRes$290 = enforest$292(initializerRes$289.rest, env$283);
                    if (restRes$290.result.hasPrototype(Punc$138) && restRes$290.result.punc.token.value === ',') {
                        decls$284.push(VariableDeclaration$149.create(result$286.id, nextRes$288.result.punc, initializerRes$289.result, restRes$290.result.punc));
                        var subRes$291 = enforestVarStatement$281(restRes$290.rest, env$283);
                        decls$284 = decls$284.concat(subRes$291.result);
                        rest$287 = subRes$291.rest;
                    } else {
                        decls$284.push(VariableDeclaration$149.create(result$286.id, nextRes$288.result.punc, initializerRes$289.result));
                        rest$287 = initializerRes$289.rest;
                    }
                } else {
                    decls$284.push(VariableDeclaration$149.create(result$286.id, nextRes$288.result.punc, initializerRes$289.result));
                }
            } else if (nextRes$288.result.hasPrototype(Punc$138) && nextRes$288.result.punc.token.value === ',') {
                decls$284.push(VariableDeclaration$149.create(result$286.id, null, null, nextRes$288.result.punc));
                var subRes$291 = enforestVarStatement$281(nextRes$288.rest, env$283);
                decls$284 = decls$284.concat(subRes$291.result);
                rest$287 = subRes$291.rest;
            } else {
                if (result$286.hasPrototype(Id$140)) {
                    decls$284.push(VariableDeclaration$149.create(result$286.id));
                } else {
                    throwError$159('Expecting an identifier in variable declaration');
                }
            }
        } else {
            if (result$286.hasPrototype(Id$140)) {
                decls$284.push(VariableDeclaration$149.create(result$286.id));
            } else if (result$286.hasPrototype(BinOp$135) && result$286.op.token.value === 'in') {
                decls$284.push(VariableDeclaration$149.create(result$286.left.id, result$286.op, result$286.right));
            } else {
                throwError$159('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$284,
            rest: rest$287
        };
    }
    function enforest$292(toks$293, env$294) {
        env$294 = env$294 || new Map();
        parser$53.assert(toks$293.length > 0, 'enforest assumes there are tokens to work with');
        function step$295(head$296, rest$297) {
            var innerTokens$298;
            parser$53.assert(Array.isArray(rest$297), 'result must at least be an empty array');
            if (head$296.hasPrototype(TermTree$122)) {
                var emp$301 = head$296.emp;
                var emp$301 = head$296.emp;
                var keyword$304 = head$296.keyword;
                var delim$306 = head$296.delim;
                var emp$301 = head$296.emp;
                var punc$309 = head$296.punc;
                var keyword$304 = head$296.keyword;
                var emp$301 = head$296.emp;
                var emp$301 = head$296.emp;
                var emp$301 = head$296.emp;
                var delim$306 = head$296.delim;
                var delim$306 = head$296.delim;
                var keyword$304 = head$296.keyword;
                if (head$296.hasPrototype(Expr$125) && (rest$297[0] && rest$297[0].token.type === parser$53.Token.Delimiter && rest$297[0].token.value === '()')) {
                    var argRes$332, enforestedArgs$333 = [], commas$334 = [];
                    innerTokens$298 = rest$297[0].token.inner;
                    while (innerTokens$298.length > 0) {
                        argRes$332 = enforest$292(innerTokens$298, env$294);
                        enforestedArgs$333.push(argRes$332.result);
                        innerTokens$298 = argRes$332.rest;
                        if (innerTokens$298[0] && innerTokens$298[0].token.value === ',') {
                            commas$334.push(innerTokens$298[0]);
                            innerTokens$298 = innerTokens$298.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$335 = _$52.all(enforestedArgs$333, function (argTerm$336) {
                            return argTerm$336.hasPrototype(Expr$125);
                        });
                    if (innerTokens$298.length === 0 && argsAreExprs$335) {
                        return step$295(Call$146.create(head$296, enforestedArgs$333, rest$297[0], commas$334), rest$297.slice(1));
                    }
                } else if (head$296.hasPrototype(Expr$125) && (rest$297[0] && rest$297[0].token.value === '?')) {
                    var question$337 = rest$297[0];
                    var condRes$338 = enforest$292(rest$297.slice(1), env$294);
                    var truExpr$339 = condRes$338.result;
                    var right$340 = condRes$338.rest;
                    if (truExpr$339.hasPrototype(Expr$125) && right$340[0] && right$340[0].token.value === ':') {
                        var colon$341 = right$340[0];
                        var flsRes$342 = enforest$292(right$340.slice(1), env$294);
                        var flsExpr$343 = flsRes$342.result;
                        if (flsExpr$343.hasPrototype(Expr$125)) {
                            return step$295(ConditionalExpression$136.create(head$296, question$337, truExpr$339, colon$341, flsExpr$343), flsRes$342.rest);
                        }
                    }
                } else if (head$296.hasPrototype(Keyword$137) && (keyword$304.token.value === 'new' && rest$297[0])) {
                    var newCallRes$344 = enforest$292(rest$297, env$294);
                    if (newCallRes$344.result.hasPrototype(Call$146)) {
                        return step$295(Const$145.create(head$296, newCallRes$344.result), newCallRes$344.rest);
                    }
                } else if (head$296.hasPrototype(Delimiter$139) && delim$306.token.value === '()') {
                    innerTokens$298 = delim$306.token.inner;
                    if (innerTokens$298.length === 0) {
                        return step$295(ParenExpression$132.create(head$296), rest$297);
                    } else {
                        var innerTerm$345 = get_expression$355(innerTokens$298, env$294);
                        if (innerTerm$345.result && innerTerm$345.result.hasPrototype(Expr$125)) {
                            return step$295(ParenExpression$132.create(head$296), rest$297);
                        }
                    }
                } else if (head$296.hasPrototype(TermTree$122) && (rest$297[0] && rest$297[1] && stxIsBinOp$278(rest$297[0]))) {
                    var op$346 = rest$297[0];
                    var left$347 = head$296;
                    var bopRes$348 = enforest$292(rest$297.slice(1), env$294);
                    var right$340 = bopRes$348.result;
                    if (right$340.hasPrototype(Expr$125)) {
                        return step$295(BinOp$135.create(op$346, left$347, right$340), bopRes$348.rest);
                    }
                } else if (head$296.hasPrototype(Punc$138) && stxIsUnaryOp$275(punc$309)) {
                    var unopRes$349 = enforest$292(rest$297, env$294);
                    if (unopRes$349.result.hasPrototype(Expr$125)) {
                        return step$295(UnaryOp$133.create(punc$309, unopRes$349.result), unopRes$349.rest);
                    }
                } else if (head$296.hasPrototype(Keyword$137) && stxIsUnaryOp$275(keyword$304)) {
                    var unopRes$349 = enforest$292(rest$297, env$294);
                    if (unopRes$349.result.hasPrototype(Expr$125)) {
                        return step$295(UnaryOp$133.create(keyword$304, unopRes$349.result), unopRes$349.rest);
                    }
                } else if (head$296.hasPrototype(Expr$125) && (rest$297[0] && (rest$297[0].token.value === '++' || rest$297[0].token.value === '--'))) {
                    return step$295(PostfixOp$134.create(head$296, rest$297[0]), rest$297.slice(1));
                } else if (head$296.hasPrototype(Expr$125) && (rest$297[0] && rest$297[0].token.value === '[]')) {
                    var getRes$350 = enforest$292(rest$297[0].token.inner, env$294);
                    var resStx$351 = mkSyntax$120('[]', parser$53.Token.Delimiter, rest$297[0]);
                    resStx$351.token.inner = [getRes$350.result];
                    return step$295(ObjGet$148.create(head$296, Delimiter$139.create(resStx$351)), rest$297.slice(1));
                } else if (head$296.hasPrototype(Expr$125) && (rest$297[0] && rest$297[0].token.value === '.' && rest$297[1] && rest$297[1].token.type === parser$53.Token.Identifier)) {
                    return step$295(ObjDotGet$147.create(head$296, rest$297[0], rest$297[1]), rest$297.slice(2));
                } else if (head$296.hasPrototype(Delimiter$139) && delim$306.token.value === '[]') {
                    return step$295(ArrayLiteral$131.create(head$296), rest$297);
                } else if (head$296.hasPrototype(Delimiter$139) && head$296.delim.token.value === '{}') {
                    return step$295(Block$130.create(head$296), rest$297);
                } else if (head$296.hasPrototype(Keyword$137) && (keyword$304.token.value === 'var' && rest$297[0])) {
                    var vsRes$352 = enforestVarStatement$281(rest$297, env$294);
                    if (vsRes$352) {
                        return step$295(VariableStatement$150.create(head$296, vsRes$352.result), vsRes$352.rest);
                    }
                }
            } else {
                parser$53.assert(head$296 && head$296.token, 'assuming head is a syntax object');
                if ((head$296.token.type === parser$53.Token.Identifier || head$296.token.type === parser$53.Token.Keyword || head$296.token.type === parser$53.Token.Punctuator) && env$294.has(resolve$170(head$296))) {
                    var transformer$353 = env$294.get(resolve$170(head$296));
                    var rt$354 = transformer$353([head$296].concat(rest$297), env$294);
                    if (!Array.isArray(rt$354.result)) {
                        throwError$159('Macro transformer must return a result array, not: ' + rt$354.result);
                    }
                    if (rt$354.result.length > 0) {
                        return step$295(rt$354.result[0], rt$354.result.slice(1).concat(rt$354.rest));
                    } else {
                        return step$295(Empty$152.create(), rt$354.rest);
                    }
                } else if (head$296.token.value === 'let' && rest$297[0] && rest$297[0].token.type === parser$53.Token.Identifier && rest$297[1] && rest$297[1].token.value === '=' && rest$297[2] && rest$297[2].token.value === 'macro' && rest$297[3] && rest$297[3].token.value === '{}') {
                    return step$295(LetMacro$143.create(rest$297[0], rest$297[3].token.inner), rest$297.slice(4));
                } else if (head$296.token.type === parser$53.Token.Identifier && head$296.token.value === 'macro' && rest$297[0] && (rest$297[0].token.type === parser$53.Token.Identifier || rest$297[0].token.type === parser$53.Token.Keyword || rest$297[0].token.type === parser$53.Token.Punctuator) && rest$297[1] && rest$297[1].token.type === parser$53.Token.Delimiter && rest$297[1].token.value === '{}') {
                    return step$295(Macro$144.create(rest$297[0], rest$297[1].token.inner), rest$297.slice(2));
                } else if (head$296.token.type === parser$53.Token.Keyword && head$296.token.value === 'function' && rest$297[0] && rest$297[0].token.type === parser$53.Token.Identifier && rest$297[1] && rest$297[1].token.type === parser$53.Token.Delimiter && rest$297[1].token.value === '()' && rest$297[2] && rest$297[2].token.type === parser$53.Token.Delimiter && rest$297[2].token.value === '{}') {
                    return step$295(NamedFun$141.create(head$296, rest$297[0], rest$297[1], rest$297[2]), rest$297.slice(3));
                } else if (head$296.token.type === parser$53.Token.Keyword && head$296.token.value === 'function' && rest$297[0] && rest$297[0].token.type === parser$53.Token.Delimiter && rest$297[0].token.value === '()' && rest$297[1] && rest$297[1].token.type === parser$53.Token.Delimiter && rest$297[1].token.value === '{}') {
                    return step$295(AnonFun$142.create(head$296, rest$297[0], rest$297[1]), rest$297.slice(2));
                } else if (head$296.token.type === parser$53.Token.Keyword && head$296.token.value === 'catch' && rest$297[0] && rest$297[0].token.type === parser$53.Token.Delimiter && rest$297[0].token.value === '()' && rest$297[1] && rest$297[1].token.type === parser$53.Token.Delimiter && rest$297[1].token.value === '{}') {
                    return step$295(CatchClause$151.create(head$296, rest$297[0], rest$297[1]), rest$297.slice(2));
                } else if (head$296.token.type === parser$53.Token.Keyword && head$296.token.value === 'this') {
                    return step$295(ThisExpression$127.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.NumericLiteral || head$296.token.type === parser$53.Token.StringLiteral || head$296.token.type === parser$53.Token.BooleanLiteral || head$296.token.type === parser$53.Token.RegexLiteral || head$296.token.type === parser$53.Token.NullLiteral) {
                    return step$295(Lit$128.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.Identifier) {
                    return step$295(Id$140.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.Punctuator) {
                    return step$295(Punc$138.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.Keyword && head$296.token.value === 'with') {
                    throwError$159('with is not supported in sweet.js');
                } else if (head$296.token.type === parser$53.Token.Keyword) {
                    return step$295(Keyword$137.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.Delimiter) {
                    return step$295(Delimiter$139.create(head$296), rest$297);
                } else if (head$296.token.type === parser$53.Token.EOF) {
                    parser$53.assert(rest$297.length === 0, 'nothing should be after an EOF');
                    return step$295(EOF$123.create(head$296), []);
                } else {
                    parser$53.assert(false, 'not implemented');
                }
            }
            return {
                result: head$296,
                rest: rest$297
            };
        }
        return step$295(toks$293[0], toks$293.slice(1));
    }
    function get_expression$355(stx$356, env$357) {
        var res$358 = enforest$292(stx$356, env$357);
        if (!res$358.result.hasPrototype(Expr$125)) {
            return {
                result: null,
                rest: stx$356
            };
        }
        return res$358;
    }
    function applyMarkToPatternEnv$359(newMark$360, env$361) {
        function dfs$362(match$363) {
            if (match$363.level === 0) {
                match$363.match = _$52.map(match$363.match, function (stx$364) {
                    return stx$364.mark(newMark$360);
                });
            } else {
                _$52.each(match$363.match, function (match$365) {
                    dfs$362(match$365);
                });
            }
        }
        _$52.keys(env$361).forEach(function (key$366) {
            dfs$362(env$361[key$366]);
        });
    }
    function loadMacroDef$367(mac$368, env$369, defscope$370, templateMap$371) {
        var body$372 = mac$368.body;
        if (!(body$372[0] && body$372[0].token.type === parser$53.Token.Keyword && body$372[0].token.value === 'function')) {
            throwError$159('Primitive macro form must contain a function for the macro body');
        }
        var stub$373 = parser$53.read('()');
        stub$373[0].token.inner = body$372;
        var expanded$374 = flatten$443(expand$429(stub$373, env$369, defscope$370, templateMap$371));
        var bodyCode$375 = codegen$56.generate(parser$53.parse(expanded$374));
        var macroFn$376 = scopedEval$111(bodyCode$375, {
                makeValue: syn$54.makeValue,
                makeRegex: syn$54.makeRegex,
                makeIdent: syn$54.makeIdent,
                makeKeyword: syn$54.makeKeyword,
                makePunc: syn$54.makePunc,
                makeDelim: syn$54.makeDelim,
                unwrapSyntax: syn$54.unwrapSyntax,
                fresh: fresh$191,
                _: _$52,
                parser: parser$53,
                patternModule: patternModule$59,
                getTemplate: function (id$377) {
                    return templateMap$371.get(id$377);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$359
            });
        return macroFn$376;
    }
    function expandToTermTree$378(stx$379, env$380, defscope$381, templateMap$382) {
        parser$53.assert(env$380, 'environment map is required');
        if (stx$379.length === 0) {
            return {
                terms: [],
                env: env$380
            };
        }
        parser$53.assert(stx$379[0].token, 'expecting a syntax object');
        var f$383 = enforest$292(stx$379, env$380);
        var head$384 = f$383.result;
        var rest$385 = f$383.rest;
        if (head$384.hasPrototype(Macro$144)) {
            var macroDefinition$387 = loadMacroDef$367(head$384, env$380, defscope$381, templateMap$382);
            addToDefinitionCtx$394([head$384.name], defscope$381, false);
            env$380.set(resolve$170(head$384.name), macroDefinition$387);
            return expandToTermTree$378(rest$385, env$380, defscope$381, templateMap$382);
        }
        if (head$384.hasPrototype(LetMacro$143)) {
            var macroDefinition$387 = loadMacroDef$367(head$384, env$380, defscope$381, templateMap$382);
            addToDefinitionCtx$394([head$384.name], defscope$381, false);
            env$380.set(resolve$170(head$384.name), macroDefinition$387);
            return expandToTermTree$378(rest$385, env$380, defscope$381, templateMap$382);
        }
        if (head$384.hasPrototype(Id$140) && head$384.id.token.value === '#quoteSyntax' && rest$385[0] && rest$385[0].token.value === '{}') {
            var tempId$388 = fresh$191();
            templateMap$382.set(tempId$388, rest$385[0].token.inner);
            return expandToTermTree$378([
                syn$54.makeIdent('getTemplate', head$384.id),
                syn$54.makeDelim('()', [syn$54.makeValue(tempId$388, head$384.id)])
            ].concat(rest$385.slice(1)), env$380, defscope$381, templateMap$382);
        }
        if (head$384.hasPrototype(VariableStatement$150)) {
            addToDefinitionCtx$394(_$52.map(head$384.decls, function (decl$389) {
                return decl$389.ident;
            }), defscope$381, true);
        }
        if (head$384.hasPrototype(Block$130) && head$384.body.hasPrototype(Delimiter$139)) {
            head$384.body.delim.token.inner.forEach(function (term$390) {
                if (term$390.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$394(_$52.map(term$390.decls, function (decl$391) {
                        return decl$391.ident;
                    }), defscope$381, true);
                }
            });
        }
        if (head$384.hasPrototype(Delimiter$139)) {
            head$384.delim.token.inner.forEach(function (term$392) {
                if (term$392.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$394(_$52.map(term$392.decls, function (decl$393) {
                        return decl$393.ident;
                    }), defscope$381, true);
                }
            });
        }
        var trees$386 = expandToTermTree$378(rest$385, env$380, defscope$381, templateMap$382);
        return {
            terms: [head$384].concat(trees$386.terms),
            env: trees$386.env
        };
    }
    function addToDefinitionCtx$394(idents$395, defscope$396, skipRep$397) {
        parser$53.assert(idents$395 && idents$395.length > 0, 'expecting some variable identifiers');
        skipRep$397 = skipRep$397 || false;
        _$52.each(idents$395, function (id$398) {
            var skip$399 = false;
            if (skipRep$397) {
                var declRepeat$400 = _$52.find(defscope$396, function (def$401) {
                        return def$401.id.token.value === id$398.token.value && arraysEqual$172(marksof$164(def$401.id.context), marksof$164(id$398.context));
                    });
                skip$399 = typeof declRepeat$400 !== 'undefined';
            }
            if (!skip$399) {
                var name$402 = fresh$191();
                defscope$396.push({
                    id: id$398,
                    name: name$402
                });
            }
        });
    }
    function expandTermTreeToFinal$403(term$404, env$405, defscope$406, templateMap$407) {
        parser$53.assert(env$405, 'environment map is required');
        if (term$404.hasPrototype(ArrayLiteral$131)) {
            term$404.array.delim.token.inner = expand$429(term$404.array.delim.token.inner, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(Block$130)) {
            term$404.body.delim.token.inner = expand$429(term$404.body.delim.token.inner, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(ParenExpression$132)) {
            term$404.expr.delim.token.inner = expand$429(term$404.expr.delim.token.inner, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(Call$146)) {
            term$404.fun = expandTermTreeToFinal$403(term$404.fun, env$405, defscope$406, templateMap$407);
            term$404.args = _$52.map(term$404.args, function (arg$408) {
                return expandTermTreeToFinal$403(arg$408, env$405, defscope$406, templateMap$407);
            });
            return term$404;
        } else if (term$404.hasPrototype(UnaryOp$133)) {
            term$404.expr = expandTermTreeToFinal$403(term$404.expr, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(BinOp$135)) {
            term$404.left = expandTermTreeToFinal$403(term$404.left, env$405, defscope$406, templateMap$407);
            term$404.right = expandTermTreeToFinal$403(term$404.right, env$405, defscope$406);
            return term$404;
        } else if (term$404.hasPrototype(ObjDotGet$147)) {
            term$404.left = expandTermTreeToFinal$403(term$404.left, env$405, defscope$406, templateMap$407);
            term$404.right = expandTermTreeToFinal$403(term$404.right, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(VariableDeclaration$149)) {
            if (term$404.init) {
                term$404.init = expandTermTreeToFinal$403(term$404.init, env$405, defscope$406, templateMap$407);
            }
            return term$404;
        } else if (term$404.hasPrototype(VariableStatement$150)) {
            term$404.decls = _$52.map(term$404.decls, function (decl$409) {
                return expandTermTreeToFinal$403(decl$409, env$405, defscope$406, templateMap$407);
            });
            return term$404;
        } else if (term$404.hasPrototype(Delimiter$139)) {
            term$404.delim.token.inner = expand$429(term$404.delim.token.inner, env$405, defscope$406, templateMap$407);
            return term$404;
        } else if (term$404.hasPrototype(NamedFun$141) || term$404.hasPrototype(AnonFun$142) || term$404.hasPrototype(CatchClause$151)) {
            if (term$404.hasPrototype(NamedFun$141)) {
                addToDefinitionCtx$394([term$404.name], defscope$406, false);
            }
            var newDef$410 = [];
            var params$411 = term$404.params.addDefCtx(newDef$410);
            var bodies$412 = term$404.body.addDefCtx(newDef$410);
            var paramNames$413 = _$52.map(getParamIdentifiers$200(params$411), function (param$421) {
                    var freshName$422 = fresh$191();
                    return {
                        freshName: freshName$422,
                        originalParam: param$421,
                        renamedParam: param$421.rename(param$421, freshName$422)
                    };
                });
            var stxBody$414 = bodies$412;
            var renamedBody$415 = _$52.reduce(paramNames$413, function (accBody$423, p$424) {
                    return accBody$423.rename(p$424.originalParam, p$424.freshName);
                }, stxBody$414);
            var bodyTerms$416 = expand$429([renamedBody$415], env$405, newDef$410, templateMap$407);
            parser$53.assert(bodyTerms$416.length === 1 && bodyTerms$416[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$417 = flatten$443(bodyTerms$416);
            var renamedParams$418 = _$52.map(paramNames$413, function (p$425) {
                    return p$425.renamedParam;
                });
            var flatArgs$419 = wrapDelim$197(joinSyntax$192(renamedParams$418, ','), term$404.params);
            var expandedArgs$420 = expand$429([flatArgs$419], env$405, newDef$410, templateMap$407);
            parser$53.assert(expandedArgs$420.length === 1, 'should only get back one result');
            term$404.params = expandedArgs$420[0];
            term$404.body = _$52.map(flattenedBody$417, function (stx$426) {
                return _$52.reduce(newDef$410, function (acc$427, def$428) {
                    return acc$427.rename(def$428.id, def$428.name);
                }, stx$426);
            });
            return term$404;
        }
        return term$404;
    }
    function expand$429(stx$430, env$431, defscope$432, templateMap$433) {
        env$431 = env$431 || new Map();
        templateMap$433 = templateMap$433 || new Map();
        var trees$434 = expandToTermTree$378(stx$430, env$431, defscope$432, templateMap$433);
        return _$52.map(trees$434.terms, function (term$435) {
            return expandTermTreeToFinal$403(term$435, trees$434.env, defscope$432, templateMap$433);
        });
    }
    function expandTopLevel$436(stx$437) {
        var funn$438 = syntaxFromToken$119({
                value: 'function',
                type: parser$53.Token.Keyword
            });
        var params$439 = syntaxFromToken$119({
                value: '()',
                type: parser$53.Token.Delimiter,
                inner: []
            });
        var body$440 = syntaxFromToken$119({
                value: '{}',
                type: parser$53.Token.Delimiter,
                inner: stx$437
            });
        var res$441 = expand$429([
                funn$438,
                params$439,
                body$440
            ]);
        return _$52.map(res$441[0].body.slice(1, res$441[0].body.length - 1), function (stx$442) {
            return stx$442;
        });
    }
    function flatten$443(terms$444) {
        return _$52.reduce(terms$444, function (acc$445, term$446) {
            return acc$445.concat(term$446.destruct(true));
        }, []);
    }
    exports$51.enforest = enforest$292;
    exports$51.expand = expandTopLevel$436;
    exports$51.resolve = resolve$170;
    exports$51.flatten = flatten$443;
    exports$51.get_expression = get_expression$355;
    exports$51.Expr = Expr$125;
    exports$51.VariableStatement = VariableStatement$150;
    exports$51.tokensToSyntax = syn$54.tokensToSyntax;
}));