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
        parser$53.assert(stx$281[0] && stx$281[0].token.type === parser$53.Token.Identifier, 'must start at the identifier');
        var decls$283 = [], rest$284 = stx$281, initRes$285, subRes$286;
        if (stx$281[1] && stx$281[1].token.type === parser$53.Token.Punctuator && stx$281[1].token.value === '=') {
            initRes$285 = enforest$287(stx$281.slice(2), env$282);
            if (initRes$285.result.hasPrototype(Expr$125)) {
                rest$284 = initRes$285.rest;
                if (initRes$285.rest[0].token.type === parser$53.Token.Punctuator && initRes$285.rest[0].token.value === ',' && initRes$285.rest[1] && initRes$285.rest[1].token.type === parser$53.Token.Identifier) {
                    decls$283.push(VariableDeclaration$149.create(stx$281[0], stx$281[1], initRes$285.result, initRes$285.rest[0]));
                    subRes$286 = enforestVarStatement$280(initRes$285.rest.slice(1), env$282);
                    decls$283 = decls$283.concat(subRes$286.result);
                    rest$284 = subRes$286.rest;
                } else {
                    decls$283.push(VariableDeclaration$149.create(stx$281[0], stx$281[1], initRes$285.result));
                }
            } else {
                parser$53.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$281[1] && stx$281[1].token.type === parser$53.Token.Punctuator && stx$281[1].token.value === ',') {
            decls$283.push(VariableDeclaration$149.create(stx$281[0], null, null, stx$281[1]));
            subRes$286 = enforestVarStatement$280(stx$281.slice(2), env$282);
            decls$283 = decls$283.concat(subRes$286.result);
            rest$284 = subRes$286.rest;
        } else {
            decls$283.push(VariableDeclaration$149.create(stx$281[0]));
            rest$284 = stx$281.slice(1);
        }
        return {
            result: decls$283,
            rest: rest$284
        };
    }
    function enforest$287(toks$288, env$289) {
        env$289 = env$289 || new Map();
        parser$53.assert(toks$288.length > 0, 'enforest assumes there are tokens to work with');
        function step$290(head$291, rest$292) {
            var innerTokens$293;
            parser$53.assert(Array.isArray(rest$292), 'result must at least be an empty array');
            if (head$291.hasPrototype(TermTree$122)) {
                var emp$296 = head$291.emp;
                var emp$296 = head$291.emp;
                var keyword$299 = head$291.keyword;
                var delim$301 = head$291.delim;
                var emp$296 = head$291.emp;
                var punc$304 = head$291.punc;
                var keyword$299 = head$291.keyword;
                var emp$296 = head$291.emp;
                var emp$296 = head$291.emp;
                var emp$296 = head$291.emp;
                var delim$301 = head$291.delim;
                var delim$301 = head$291.delim;
                var keyword$299 = head$291.keyword;
                if (head$291.hasPrototype(Expr$125) && (rest$292[0] && rest$292[0].token.type === parser$53.Token.Delimiter && rest$292[0].token.value === '()')) {
                    var argRes$327, enforestedArgs$328 = [], commas$329 = [];
                    innerTokens$293 = rest$292[0].token.inner;
                    while (innerTokens$293.length > 0) {
                        argRes$327 = enforest$287(innerTokens$293, env$289);
                        enforestedArgs$328.push(argRes$327.result);
                        innerTokens$293 = argRes$327.rest;
                        if (innerTokens$293[0] && innerTokens$293[0].token.value === ',') {
                            commas$329.push(innerTokens$293[0]);
                            innerTokens$293 = innerTokens$293.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$330 = _$52.all(enforestedArgs$328, function (argTerm$331) {
                            return argTerm$331.hasPrototype(Expr$125);
                        });
                    if (innerTokens$293.length === 0 && argsAreExprs$330) {
                        return step$290(Call$146.create(head$291, enforestedArgs$328, rest$292[0], commas$329), rest$292.slice(1));
                    }
                } else if (head$291.hasPrototype(Expr$125) && (rest$292[0] && rest$292[0].token.value === '?')) {
                    var question$332 = rest$292[0];
                    var condRes$333 = enforest$287(rest$292.slice(1), env$289);
                    var truExpr$334 = condRes$333.result;
                    var right$335 = condRes$333.rest;
                    if (truExpr$334.hasPrototype(Expr$125) && right$335[0] && right$335[0].token.value === ':') {
                        var colon$336 = right$335[0];
                        var flsRes$337 = enforest$287(right$335.slice(1), env$289);
                        var flsExpr$338 = flsRes$337.result;
                        if (flsExpr$338.hasPrototype(Expr$125)) {
                            return step$290(ConditionalExpression$136.create(head$291, question$332, truExpr$334, colon$336, flsExpr$338), flsRes$337.rest);
                        }
                    }
                } else if (head$291.hasPrototype(Keyword$137) && (keyword$299.token.value === 'new' && rest$292[0])) {
                    var newCallRes$339 = enforest$287(rest$292, env$289);
                    if (newCallRes$339.result.hasPrototype(Call$146)) {
                        return step$290(Const$145.create(head$291, newCallRes$339.result), newCallRes$339.rest);
                    }
                } else if (head$291.hasPrototype(Delimiter$139) && delim$301.token.value === '()') {
                    innerTokens$293 = delim$301.token.inner;
                    if (innerTokens$293.length === 0) {
                        return step$290(ParenExpression$132.create(head$291), rest$292);
                    } else {
                        var innerTerm$340 = get_expression$350(innerTokens$293, env$289);
                        if (innerTerm$340.result && innerTerm$340.result.hasPrototype(Expr$125)) {
                            return step$290(ParenExpression$132.create(head$291), rest$292);
                        }
                    }
                } else if (head$291.hasPrototype(TermTree$122) && (rest$292[0] && rest$292[1] && stxIsBinOp$277(rest$292[0]))) {
                    var op$341 = rest$292[0];
                    var left$342 = head$291;
                    var bopRes$343 = enforest$287(rest$292.slice(1), env$289);
                    var right$335 = bopRes$343.result;
                    if (right$335.hasPrototype(Expr$125)) {
                        return step$290(BinOp$135.create(op$341, left$342, right$335), bopRes$343.rest);
                    }
                } else if (head$291.hasPrototype(Punc$138) && stxIsUnaryOp$274(punc$304)) {
                    var unopRes$344 = enforest$287(rest$292, env$289);
                    if (unopRes$344.result.hasPrototype(Expr$125)) {
                        return step$290(UnaryOp$133.create(punc$304, unopRes$344.result), unopRes$344.rest);
                    }
                } else if (head$291.hasPrototype(Keyword$137) && stxIsUnaryOp$274(keyword$299)) {
                    var unopRes$344 = enforest$287(rest$292, env$289);
                    if (unopRes$344.result.hasPrototype(Expr$125)) {
                        return step$290(UnaryOp$133.create(keyword$299, unopRes$344.result), unopRes$344.rest);
                    }
                } else if (head$291.hasPrototype(Expr$125) && (rest$292[0] && (rest$292[0].token.value === '++' || rest$292[0].token.value === '--'))) {
                    return step$290(PostfixOp$134.create(head$291, rest$292[0]), rest$292.slice(1));
                } else if (head$291.hasPrototype(Expr$125) && (rest$292[0] && rest$292[0].token.value === '[]')) {
                    var getRes$345 = enforest$287(rest$292[0].token.inner, env$289);
                    var resStx$346 = mkSyntax$120('[]', parser$53.Token.Delimiter, rest$292[0]);
                    resStx$346.token.inner = [getRes$345.result];
                    if (getRes$345.rest.length > 0) {
                        return step$290(ObjGet$148.create(head$291, Delimiter$139.create(resStx$346)), rest$292.slice(1));
                    }
                } else if (head$291.hasPrototype(Expr$125) && (rest$292[0] && rest$292[0].token.value === '.' && rest$292[1] && rest$292[1].token.type === parser$53.Token.Identifier)) {
                    return step$290(ObjDotGet$147.create(head$291, rest$292[0], rest$292[1]), rest$292.slice(2));
                } else if (head$291.hasPrototype(Delimiter$139) && delim$301.token.value === '[]') {
                    return step$290(ArrayLiteral$131.create(head$291), rest$292);
                } else if (head$291.hasPrototype(Delimiter$139) && head$291.delim.token.value === '{}') {
                    return step$290(Block$130.create(head$291), rest$292);
                } else if (head$291.hasPrototype(Keyword$137) && (keyword$299.token.value === 'var' && rest$292[0] && rest$292[0].token.type === parser$53.Token.Identifier)) {
                    var vsRes$347 = enforestVarStatement$280(rest$292, env$289);
                    if (vsRes$347) {
                        return step$290(VariableStatement$150.create(head$291, vsRes$347.result), vsRes$347.rest);
                    }
                }
            } else {
                parser$53.assert(head$291 && head$291.token, 'assuming head is a syntax object');
                if ((head$291.token.type === parser$53.Token.Identifier || head$291.token.type === parser$53.Token.Keyword || head$291.token.type === parser$53.Token.Punctuator) && env$289.has(resolve$169(head$291))) {
                    var transformer$348 = env$289.get(resolve$169(head$291));
                    var rt$349 = transformer$348([head$291].concat(rest$292), env$289);
                    if (!Array.isArray(rt$349.result)) {
                        throwError$158('Macro transformer must return a result array, not: ' + rt$349.result);
                    }
                    if (rt$349.result.length > 0) {
                        return step$290(rt$349.result[0], rt$349.result.slice(1).concat(rt$349.rest));
                    } else {
                        return step$290(Empty$152.create(), rt$349.rest);
                    }
                } else if (head$291.token.value === 'let' && rest$292[0] && rest$292[0].token.type === parser$53.Token.Identifier && rest$292[1] && rest$292[1].token.value === '=' && rest$292[2] && rest$292[2].token.value === 'macro' && rest$292[3] && rest$292[3].token.value === '{}') {
                    return step$290(LetMacro$143.create(rest$292[0], rest$292[3].token.inner), rest$292.slice(4));
                } else if (head$291.token.type === parser$53.Token.Identifier && head$291.token.value === 'macro' && rest$292[0] && (rest$292[0].token.type === parser$53.Token.Identifier || rest$292[0].token.type === parser$53.Token.Keyword || rest$292[0].token.type === parser$53.Token.Punctuator) && rest$292[1] && rest$292[1].token.type === parser$53.Token.Delimiter && rest$292[1].token.value === '{}') {
                    return step$290(Macro$144.create(rest$292[0], rest$292[1].token.inner), rest$292.slice(2));
                } else if (head$291.token.type === parser$53.Token.Keyword && head$291.token.value === 'function' && rest$292[0] && rest$292[0].token.type === parser$53.Token.Identifier && rest$292[1] && rest$292[1].token.type === parser$53.Token.Delimiter && rest$292[1].token.value === '()' && rest$292[2] && rest$292[2].token.type === parser$53.Token.Delimiter && rest$292[2].token.value === '{}') {
                    return step$290(NamedFun$141.create(head$291, rest$292[0], rest$292[1], rest$292[2]), rest$292.slice(3));
                } else if (head$291.token.type === parser$53.Token.Keyword && head$291.token.value === 'function' && rest$292[0] && rest$292[0].token.type === parser$53.Token.Delimiter && rest$292[0].token.value === '()' && rest$292[1] && rest$292[1].token.type === parser$53.Token.Delimiter && rest$292[1].token.value === '{}') {
                    return step$290(AnonFun$142.create(head$291, rest$292[0], rest$292[1]), rest$292.slice(2));
                } else if (head$291.token.type === parser$53.Token.Keyword && head$291.token.value === 'catch' && rest$292[0] && rest$292[0].token.type === parser$53.Token.Delimiter && rest$292[0].token.value === '()' && rest$292[1] && rest$292[1].token.type === parser$53.Token.Delimiter && rest$292[1].token.value === '{}') {
                    return step$290(CatchClause$151.create(head$291, rest$292[0], rest$292[1]), rest$292.slice(2));
                } else if (head$291.token.type === parser$53.Token.Keyword && head$291.token.value === 'this') {
                    return step$290(ThisExpression$127.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.NumericLiteral || head$291.token.type === parser$53.Token.StringLiteral || head$291.token.type === parser$53.Token.BooleanLiteral || head$291.token.type === parser$53.Token.RegexLiteral || head$291.token.type === parser$53.Token.NullLiteral) {
                    return step$290(Lit$128.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.Identifier) {
                    return step$290(Id$140.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.Punctuator) {
                    return step$290(Punc$138.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.Keyword && head$291.token.value === 'with') {
                    throwError$158('with is not supported in sweet.js');
                } else if (head$291.token.type === parser$53.Token.Keyword) {
                    return step$290(Keyword$137.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.Delimiter) {
                    return step$290(Delimiter$139.create(head$291), rest$292);
                } else if (head$291.token.type === parser$53.Token.EOF) {
                    parser$53.assert(rest$292.length === 0, 'nothing should be after an EOF');
                    return step$290(EOF$123.create(head$291), []);
                } else {
                    parser$53.assert(false, 'not implemented');
                }
            }
            return {
                result: head$291,
                rest: rest$292
            };
        }
        return step$290(toks$288[0], toks$288.slice(1));
    }
    function get_expression$350(stx$351, env$352) {
        var res$353 = enforest$287(stx$351, env$352);
        if (!res$353.result.hasPrototype(Expr$125)) {
            return {
                result: null,
                rest: stx$351
            };
        }
        return res$353;
    }
    function applyMarkToPatternEnv$354(newMark$355, env$356) {
        function dfs$357(match$358) {
            if (match$358.level === 0) {
                match$358.match = _$52.map(match$358.match, function (stx$359) {
                    return stx$359.mark(newMark$355);
                });
            } else {
                _$52.each(match$358.match, function (match$360) {
                    dfs$357(match$360);
                });
            }
        }
        _$52.keys(env$356).forEach(function (key$361) {
            dfs$357(env$356[key$361]);
        });
    }
    function loadMacroDef$362(mac$363, env$364, defscope$365, templateMap$366) {
        var body$367 = mac$363.body;
        if (!(body$367[0] && body$367[0].token.type === parser$53.Token.Keyword && body$367[0].token.value === 'function')) {
            throwError$158('Primitive macro form must contain a function for the macro body');
        }
        var stub$368 = parser$53.read('()');
        stub$368[0].token.inner = body$367;
        var expanded$369 = flatten$438(expand$424(stub$368, env$364, defscope$365, templateMap$366));
        var bodyCode$370 = codegen$56.generate(parser$53.parse(expanded$369));
        var macroFn$371 = scopedEval$111(bodyCode$370, {
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
                getTemplate: function (id$372) {
                    return templateMap$366.get(id$372);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$354
            });
        return macroFn$371;
    }
    function expandToTermTree$373(stx$374, env$375, defscope$376, templateMap$377) {
        parser$53.assert(env$375, 'environment map is required');
        if (stx$374.length === 0) {
            return {
                terms: [],
                env: env$375
            };
        }
        parser$53.assert(stx$374[0].token, 'expecting a syntax object');
        var f$378 = enforest$287(stx$374, env$375);
        var head$379 = f$378.result;
        var rest$380 = f$378.rest;
        if (head$379.hasPrototype(Macro$144)) {
            var macroDefinition$382 = loadMacroDef$362(head$379, env$375, defscope$376, templateMap$377);
            addToDefinitionCtx$389([head$379.name], defscope$376, false);
            env$375.set(resolve$169(head$379.name), macroDefinition$382);
            return expandToTermTree$373(rest$380, env$375, defscope$376, templateMap$377);
        }
        if (head$379.hasPrototype(LetMacro$143)) {
            var macroDefinition$382 = loadMacroDef$362(head$379, env$375, defscope$376, templateMap$377);
            addToDefinitionCtx$389([head$379.name], defscope$376, false);
            env$375.set(resolve$169(head$379.name), macroDefinition$382);
            return expandToTermTree$373(rest$380, env$375, defscope$376, templateMap$377);
        }
        if (head$379.hasPrototype(Id$140) && head$379.id.token.value === '#quoteSyntax' && rest$380[0] && rest$380[0].token.value === '{}') {
            var tempId$383 = fresh$190();
            templateMap$377.set(tempId$383, rest$380[0].token.inner);
            return expandToTermTree$373([
                syn$54.makeIdent('getTemplate', head$379.id),
                syn$54.makeDelim('()', [syn$54.makeValue(tempId$383, head$379.id)])
            ].concat(rest$380.slice(1)), env$375, defscope$376, templateMap$377);
        }
        if (head$379.hasPrototype(VariableStatement$150)) {
            addToDefinitionCtx$389(_$52.map(head$379.decls, function (decl$384) {
                return decl$384.ident;
            }), defscope$376, true);
        }
        if (head$379.hasPrototype(Block$130) && head$379.body.hasPrototype(Delimiter$139)) {
            head$379.body.delim.token.inner.forEach(function (term$385) {
                if (term$385.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$389(_$52.map(term$385.decls, function (decl$386) {
                        return decl$386.ident;
                    }), defscope$376, true);
                }
            });
        }
        if (head$379.hasPrototype(Delimiter$139)) {
            head$379.delim.token.inner.forEach(function (term$387) {
                if (term$387.hasPrototype(VariableStatement$150)) {
                    addToDefinitionCtx$389(_$52.map(term$387.decls, function (decl$388) {
                        return decl$388.ident;
                    }), defscope$376, true);
                }
            });
        }
        var trees$381 = expandToTermTree$373(rest$380, env$375, defscope$376, templateMap$377);
        return {
            terms: [head$379].concat(trees$381.terms),
            env: trees$381.env
        };
    }
    function addToDefinitionCtx$389(idents$390, defscope$391, skipRep$392) {
        skipRep$392 = skipRep$392 || false;
        _$52.each(idents$390, function (id$393) {
            var skip$394 = false;
            if (skipRep$392) {
                var declRepeat$395 = _$52.find(defscope$391, function (def$396) {
                        return def$396.id.token.value === id$393.token.value && arraysEqual$171(marksof$163(def$396.id.context), marksof$163(id$393.context));
                    });
                skip$394 = typeof declRepeat$395 !== 'undefined';
            }
            if (!skip$394) {
                var name$397 = fresh$190();
                defscope$391.push({
                    id: id$393,
                    name: name$397
                });
            }
        });
    }
    function expandTermTreeToFinal$398(term$399, env$400, defscope$401, templateMap$402) {
        parser$53.assert(env$400, 'environment map is required');
        if (term$399.hasPrototype(ArrayLiteral$131)) {
            term$399.array.delim.token.inner = expand$424(term$399.array.delim.token.inner, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(Block$130)) {
            term$399.body.delim.token.inner = expand$424(term$399.body.delim.token.inner, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(ParenExpression$132)) {
            term$399.expr.delim.token.inner = expand$424(term$399.expr.delim.token.inner, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(Call$146)) {
            term$399.fun = expandTermTreeToFinal$398(term$399.fun, env$400, defscope$401, templateMap$402);
            term$399.args = _$52.map(term$399.args, function (arg$403) {
                return expandTermTreeToFinal$398(arg$403, env$400, defscope$401, templateMap$402);
            });
            return term$399;
        } else if (term$399.hasPrototype(UnaryOp$133)) {
            term$399.expr = expandTermTreeToFinal$398(term$399.expr, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(BinOp$135)) {
            term$399.left = expandTermTreeToFinal$398(term$399.left, env$400, defscope$401, templateMap$402);
            term$399.right = expandTermTreeToFinal$398(term$399.right, env$400, defscope$401);
            return term$399;
        } else if (term$399.hasPrototype(ObjDotGet$147)) {
            term$399.left = expandTermTreeToFinal$398(term$399.left, env$400, defscope$401, templateMap$402);
            term$399.right = expandTermTreeToFinal$398(term$399.right, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(VariableDeclaration$149)) {
            if (term$399.init) {
                term$399.init = expandTermTreeToFinal$398(term$399.init, env$400, defscope$401, templateMap$402);
            }
            return term$399;
        } else if (term$399.hasPrototype(VariableStatement$150)) {
            term$399.decls = _$52.map(term$399.decls, function (decl$404) {
                return expandTermTreeToFinal$398(decl$404, env$400, defscope$401, templateMap$402);
            });
            return term$399;
        } else if (term$399.hasPrototype(Delimiter$139)) {
            term$399.delim.token.inner = expand$424(term$399.delim.token.inner, env$400, defscope$401, templateMap$402);
            return term$399;
        } else if (term$399.hasPrototype(NamedFun$141) || term$399.hasPrototype(AnonFun$142) || term$399.hasPrototype(CatchClause$151)) {
            if (term$399.hasPrototype(NamedFun$141)) {
                addToDefinitionCtx$389([term$399.name], defscope$401, false);
            }
            var newDef$405 = [];
            var params$406 = term$399.params.addDefCtx(newDef$405);
            var bodies$407 = term$399.body.addDefCtx(newDef$405);
            var paramNames$408 = _$52.map(getParamIdentifiers$199(params$406), function (param$416) {
                    var freshName$417 = fresh$190();
                    return {
                        freshName: freshName$417,
                        originalParam: param$416,
                        renamedParam: param$416.rename(param$416, freshName$417)
                    };
                });
            var stxBody$409 = bodies$407;
            var renamedBody$410 = _$52.reduce(paramNames$408, function (accBody$418, p$419) {
                    return accBody$418.rename(p$419.originalParam, p$419.freshName);
                }, stxBody$409);
            var bodyTerms$411 = expand$424([renamedBody$410], env$400, newDef$405, templateMap$402);
            parser$53.assert(bodyTerms$411.length === 1 && bodyTerms$411[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$412 = flatten$438(bodyTerms$411);
            var renamedParams$413 = _$52.map(paramNames$408, function (p$420) {
                    return p$420.renamedParam;
                });
            var flatArgs$414 = wrapDelim$196(joinSyntax$191(renamedParams$413, ','), term$399.params);
            var expandedArgs$415 = expand$424([flatArgs$414], env$400, newDef$405, templateMap$402);
            parser$53.assert(expandedArgs$415.length === 1, 'should only get back one result');
            term$399.params = expandedArgs$415[0];
            term$399.body = _$52.map(flattenedBody$412, function (stx$421) {
                return _$52.reduce(newDef$405, function (acc$422, def$423) {
                    return acc$422.rename(def$423.id, def$423.name);
                }, stx$421);
            });
            return term$399;
        }
        return term$399;
    }
    function expand$424(stx$425, env$426, defscope$427, templateMap$428) {
        env$426 = env$426 || new Map();
        templateMap$428 = templateMap$428 || new Map();
        var trees$429 = expandToTermTree$373(stx$425, env$426, defscope$427, templateMap$428);
        return _$52.map(trees$429.terms, function (term$430) {
            return expandTermTreeToFinal$398(term$430, trees$429.env, defscope$427, templateMap$428);
        });
    }
    function expandTopLevel$431(stx$432) {
        var funn$433 = syntaxFromToken$119({
                value: 'function',
                type: parser$53.Token.Keyword
            });
        var params$434 = syntaxFromToken$119({
                value: '()',
                type: parser$53.Token.Delimiter,
                inner: []
            });
        var body$435 = syntaxFromToken$119({
                value: '{}',
                type: parser$53.Token.Delimiter,
                inner: stx$432
            });
        var res$436 = expand$424([
                funn$433,
                params$434,
                body$435
            ]);
        return _$52.map(res$436[0].body.slice(1, res$436[0].body.length - 1), function (stx$437) {
            return stx$437;
        });
    }
    function flatten$438(terms$439) {
        return _$52.reduce(terms$439, function (acc$440, term$441) {
            return acc$440.concat(term$441.destruct(true));
        }, []);
    }
    exports$51.enforest = enforest$287;
    exports$51.expand = expandTopLevel$431;
    exports$51.resolve = resolve$169;
    exports$51.flatten = flatten$438;
    exports$51.get_expression = get_expression$350;
    exports$51.Expr = Expr$125;
    exports$51.VariableStatement = VariableStatement$150;
    exports$51.tokensToSyntax = syn$54.tokensToSyntax;
}));