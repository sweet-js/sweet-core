(function (root$0, factory$1) {
    if (typeof exports === 'object') {
        factory$1(exports, require('underscore'), require('./parser'), require('es6-collections'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections',
            'escodegen'
        ], factory$1);
    } else {
        factory$1(root$0.expander = {}, root$0._, root$0.parser, root$0.es6, root$0.escodegen);
    }
}(this, function (exports$2, _$3, parser$4, es6$5, codegen$6) {
    'use strict';
    exports$2._test = {};
    Object.prototype.create = function () {
        var o$43 = Object.create(this);
        if (typeof o$43.construct === 'function') {
            o$43.construct.apply(o$43, arguments);
        }
        return o$43;
    };
    Object.prototype.extend = function (properties$44) {
        var result$45 = Object.create(this);
        for (var prop in properties$44) {
            if (properties$44.hasOwnProperty(prop)) {
                result$45[prop] = properties$44[prop];
            }
        }
        return result$45;
    };
    Object.prototype.hasPrototype = function (proto$46) {
        function F() {
        }
        F.prototype = proto$46;
        return this instanceof F;
    };
    function throwError(msg$47) {
        throw new Error(msg$47);
    }
    function mkSyntax(value$48, type$49, stx$50) {
        return syntaxFromToken({
            type: type$49,
            value: value$48,
            lineStart: stx$50.token.lineStart,
            lineNumber: stx$50.token.lineNumber
        }, stx$50.context);
    }
    function Mark(mark$51, ctx$52) {
        return {
            mark: mark$51,
            context: ctx$52
        };
    }
    function Var(id$53) {
        return {id: id$53};
    }
    function isDef(ctx$54) {
        return ctx$54 && typeof ctx$54.defctx !== 'undefined';
    }
    var isMark$7 = function isMark$7(m$55) {
        return m$55 && typeof m$55.mark !== 'undefined';
    };
    function Rename(id$56, name$57, ctx$58, defctx$59) {
        defctx$59 = defctx$59 || null;
        return {
            id: id$56,
            name: name$57,
            context: ctx$58,
            def: defctx$59
        };
    }
    function Def(defctx$60, ctx$61) {
        return {
            defctx: defctx$60,
            context: ctx$61
        };
    }
    var isRename$8 = function (r$62) {
        return r$62 && typeof r$62.id !== 'undefined' && typeof r$62.name !== 'undefined';
    };
    var syntaxProto$9 = {
            mark: function mark(newMark$63) {
                var markedToken$64 = _$3.clone(this.token);
                if (this.token.inner) {
                    var markedInner$67 = _$3.map(this.token.inner, function (stx$68) {
                            return stx$68.mark(newMark$63);
                        });
                    markedToken$64.inner = markedInner$67;
                }
                var newMarkObj$65 = Mark(newMark$63, this.context);
                var stmp$66 = syntaxFromToken(markedToken$64, newMarkObj$65);
                return stmp$66;
            },
            rename: function (id$69, name$70) {
                if (this.token.inner) {
                    var renamedInner$71 = _$3.map(this.token.inner, function (stx$72) {
                            return stx$72.rename(id$69, name$70);
                        });
                    this.token.inner = renamedInner$71;
                }
                if (this.token.value === id$69.token.value) {
                    return syntaxFromToken(this.token, Rename(id$69, name$70, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$73) {
                if (this.token.inner) {
                    var renamedInner$74 = _$3.map(this.token.inner, function (stx$75) {
                            return stx$75.addDefCtx(defctx$73);
                        });
                    this.token.inner = renamedInner$74;
                }
                return syntaxFromToken(this.token, Def(defctx$73, this.context));
            },
            getDefCtx: function () {
                var ctx$76 = this.context;
                while (ctx$76 !== null) {
                    if (isDef(ctx$76)) {
                        return ctx$76.defctx;
                    }
                    ctx$76 = ctx$76.context;
                }
                return null;
            },
            toString: function () {
                var val$77 = this.token.type === parser$4.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$77 + ']';
            }
        };
    function syntaxFromToken(token$78, oldctx$79) {
        var ctx$80 = typeof oldctx$79 !== 'undefined' ? oldctx$79 : null;
        return Object.create(syntaxProto$9, {
            token: {
                value: token$78,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$80,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$81, mlist$82) {
        if (mark$81 === _$3.first(mlist$82)) {
            return _$3.rest(mlist$82, 1);
        }
        return [mark$81].concat(mlist$82);
    }
    function marksof(ctx$83, stopName$84, originalName$85) {
        var mark$86, submarks$87;
        if (isMark$7(ctx$83)) {
            mark$86 = ctx$83.mark;
            submarks$87 = marksof(ctx$83.context, stopName$84, originalName$85);
            return remdup(mark$86, submarks$87);
        }
        if (isDef(ctx$83)) {
            return marksof(ctx$83.context, stopName$84, originalName$85);
        }
        if (isRename$8(ctx$83)) {
            if (stopName$84 === originalName$85 + '$' + ctx$83.name) {
                return [];
            }
            return marksof(ctx$83.context, stopName$84, originalName$85);
        }
        return [];
    }
    function resolve(stx$88) {
        return resolveCtx(stx$88.token.value, stx$88.context, [], []);
    }
    function arraysEqual(a$89, b$90) {
        if (a$89.length !== b$90.length) {
            return false;
        }
        for (var i$91 = 0; i$91 < a$89.length; i$91++) {
            if (a$89[i$91] !== b$90[i$91]) {
                return false;
            }
        }
        return true;
    }
    function renames(defctx$92, oldctx$93, originalName$94) {
        var acc$95 = oldctx$93;
        defctx$92.forEach(function (def$96) {
            if (def$96.id.token.value === originalName$94) {
                acc$95 = Rename(def$96.id, def$96.name, acc$95, defctx$92);
            }
        });
        return acc$95;
    }
    function resolveCtx(originalName$97, ctx$98, stop_spine$99, stop_branch$100) {
        if (isMark$7(ctx$98)) {
            return resolveCtx(originalName$97, ctx$98.context, stop_spine$99, stop_branch$100);
        }
        if (isDef(ctx$98)) {
            if (_$3.contains(stop_spine$99, ctx$98.defctx)) {
                return resolveCtx(originalName$97, ctx$98.context, stop_spine$99, stop_branch$100);
            } else {
                return resolveCtx(originalName$97, renames(ctx$98.defctx, ctx$98.context, originalName$97), stop_spine$99, _$3.union(stop_branch$100, [ctx$98.defctx]));
            }
        }
        if (isRename$8(ctx$98)) {
            var idName$101 = resolveCtx(ctx$98.id.token.value, ctx$98.id.context, stop_branch$100, stop_branch$100);
            var subName$102 = resolveCtx(originalName$97, ctx$98.context, _$3.union(stop_spine$99, [ctx$98.def]), stop_branch$100);
            if (idName$101 === subName$102) {
                var idMarks$103 = marksof(ctx$98.id.context, originalName$97 + '$' + ctx$98.name, originalName$97);
                var subMarks$104 = marksof(ctx$98.context, originalName$97 + '$' + ctx$98.name, originalName$97);
                if (arraysEqual(idMarks$103, subMarks$104)) {
                    return originalName$97 + '$' + ctx$98.name;
                }
            }
            return resolveCtx(originalName$97, ctx$98.context, _$3.union(stop_spine$99, [ctx$98.def]), stop_branch$100);
        }
        return originalName$97;
    }
    var nextFresh$10 = 0;
    function fresh() {
        return nextFresh$10++;
    }
    ;
    function tokensToSyntax(tokens$105) {
        if (!_$3.isArray(tokens$105)) {
            tokens$105 = [tokens$105];
        }
        return _$3.map(tokens$105, function (token$106) {
            if (token$106.inner) {
                token$106.inner = tokensToSyntax(token$106.inner);
            }
            return syntaxFromToken(token$106);
        });
    }
    function syntaxToTokens(syntax$107) {
        return _$3.map(syntax$107, function (stx$108) {
            if (stx$108.token.inner) {
                stx$108.token.inner = syntaxToTokens(stx$108.token.inner);
            }
            return stx$108.token;
        });
    }
    function isPatternVar(token$109) {
        return token$109.type === parser$4.Token.Identifier && token$109.value[0] === '$' && token$109.value !== '$';
    }
    var containsPatternVar$11 = function (patterns$110) {
        return _$3.any(patterns$110, function (pat$111) {
            if (pat$111.token.type === parser$4.Token.Delimiter) {
                return containsPatternVar$11(pat$111.token.inner);
            }
            return isPatternVar(pat$111);
        });
    };
    function loadPattern(patterns$112) {
        return _$3.chain(patterns$112).reduce(function (acc$113, patStx$114, idx$115) {
            var last$116 = patterns$112[idx$115 - 1];
            var lastLast$117 = patterns$112[idx$115 - 2];
            var next$118 = patterns$112[idx$115 + 1];
            var nextNext$119 = patterns$112[idx$115 + 2];
            if (patStx$114.token.value === ':') {
                if (last$116 && isPatternVar(last$116.token)) {
                    return acc$113;
                }
            }
            if (last$116 && last$116.token.value === ':') {
                if (lastLast$117 && isPatternVar(lastLast$117.token)) {
                    return acc$113;
                }
            }
            if (patStx$114.token.value === '$' && next$118 && next$118.token.type === parser$4.Token.Delimiter) {
                return acc$113;
            }
            if (isPatternVar(patStx$114.token)) {
                if (next$118 && next$118.token.value === ':') {
                    parser$4.assert(typeof nextNext$119 !== 'undefined', 'expecting a pattern class');
                    patStx$114.class = nextNext$119.token.value;
                } else {
                    patStx$114.class = 'token';
                }
            } else if (patStx$114.token.type === parser$4.Token.Delimiter) {
                if (last$116 && last$116.token.value === '$') {
                    patStx$114.class = 'pattern_group';
                }
                patStx$114.token.inner = loadPattern(patStx$114.token.inner);
            } else {
                patStx$114.class = 'pattern_literal';
            }
            return acc$113.concat(patStx$114);
        }, []).reduce(function (acc$120, patStx$121, idx$122, patterns$123) {
            var separator$124 = ' ';
            var repeat$125 = false;
            var next$126 = patterns$123[idx$122 + 1];
            var nextNext$127 = patterns$123[idx$122 + 2];
            if (next$126 && next$126.token.value === '...') {
                repeat$125 = true;
                separator$124 = ' ';
            } else if (delimIsSeparator(next$126) && nextNext$127 && nextNext$127.token.value === '...') {
                repeat$125 = true;
                parser$4.assert(next$126.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$124 = next$126.token.inner[0].token.value;
            }
            if (patStx$121.token.value === '...' || delimIsSeparator(patStx$121) && next$126 && next$126.token.value === '...') {
                return acc$120;
            }
            patStx$121.repeat = repeat$125;
            patStx$121.separator = separator$124;
            return acc$120.concat(patStx$121);
        }, []).value();
    }
    function takeLineContext(from$128, to$129) {
        return _$3.map(to$129, function (stx$130) {
            if (stx$130.token.type === parser$4.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$4.Token.Delimiter,
                    value: stx$130.token.value,
                    inner: stx$130.token.inner,
                    startRange: from$128.range,
                    endRange: from$128.range,
                    startLineNumber: from$128.token.lineNumber,
                    startLineStart: from$128.token.lineStart,
                    endLineNumber: from$128.token.lineNumber,
                    endLineStart: from$128.token.lineStart
                }, stx$130.context);
            }
            return syntaxFromToken({
                value: stx$130.token.value,
                type: stx$130.token.type,
                lineNumber: from$128.token.lineNumber,
                lineStart: from$128.token.lineStart,
                range: from$128.token.range
            }, stx$130.context);
        });
    }
    function joinRepeatedMatch(tojoin$131, punc$132) {
        return _$3.reduce(_$3.rest(tojoin$131, 1), function (acc$133, join$134) {
            if (punc$132 === ' ') {
                return acc$133.concat(join$134.match);
            }
            return acc$133.concat(mkSyntax(punc$132, parser$4.Token.Punctuator, _$3.first(join$134.match)), join$134.match);
        }, _$3.first(tojoin$131).match);
    }
    function joinSyntax(tojoin$135, punc$136) {
        if (tojoin$135.length === 0) {
            return [];
        }
        if (punc$136 === ' ') {
            return tojoin$135;
        }
        return _$3.reduce(_$3.rest(tojoin$135, 1), function (acc$137, join$138) {
            return acc$137.concat(mkSyntax(punc$136, parser$4.Token.Punctuator, join$138), join$138);
        }, [_$3.first(tojoin$135)]);
    }
    function joinSyntaxArr(tojoin$139, punc$140) {
        if (tojoin$139.length === 0) {
            return [];
        }
        if (punc$140 === ' ') {
            return _$3.flatten(tojoin$139, true);
        }
        return _$3.reduce(_$3.rest(tojoin$139, 1), function (acc$141, join$142) {
            return acc$141.concat(mkSyntax(punc$140, parser$4.Token.Punctuator, _$3.first(join$142)), join$142);
        }, _$3.first(tojoin$139));
    }
    function delimIsSeparator(delim$143) {
        return delim$143 && delim$143.token.type === parser$4.Token.Delimiter && delim$143.token.value === '()' && delim$143.token.inner.length === 1 && delim$143.token.inner[0].token.type !== parser$4.Token.Delimiter && !containsPatternVar$11(delim$143.token.inner);
    }
    function freeVarsInPattern(pattern$144) {
        var fv$145 = [];
        _$3.each(pattern$144, function (pat$146) {
            if (isPatternVar(pat$146.token)) {
                fv$145.push(pat$146.token.value);
            } else if (pat$146.token.type === parser$4.Token.Delimiter) {
                fv$145 = fv$145.concat(freeVarsInPattern(pat$146.token.inner));
            }
        });
        return fv$145;
    }
    function patternLength(patterns$147) {
        return _$3.reduce(patterns$147, function (acc$148, pat$149) {
            if (pat$149.token.type === parser$4.Token.Delimiter) {
                return acc$148 + 1 + patternLength(pat$149.token.inner);
            }
            return acc$148 + 1;
        }, 0);
    }
    function matchStx(value$150, stx$151) {
        return stx$151 && stx$151.token && stx$151.token.value === value$150;
    }
    function wrapDelim(towrap$152, delimSyntax$153) {
        parser$4.assert(delimSyntax$153.token.type === parser$4.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$4.Token.Delimiter,
            value: delimSyntax$153.token.value,
            inner: towrap$152,
            range: delimSyntax$153.token.range,
            startLineNumber: delimSyntax$153.token.startLineNumber,
            lineStart: delimSyntax$153.token.lineStart
        }, delimSyntax$153.context);
    }
    function getParamIdentifiers(argSyntax$154) {
        parser$4.assert(argSyntax$154.token.type === parser$4.Token.Delimiter, 'expecting delimiter for function params');
        return _$3.filter(argSyntax$154.token.inner, function (stx$155) {
            return stx$155.token.value !== ',';
        });
    }
    function isFunctionStx(stx$156) {
        return stx$156 && stx$156.token.type === parser$4.Token.Keyword && stx$156.token.value === 'function';
    }
    function isVarStx(stx$157) {
        return stx$157 && stx$157.token.type === parser$4.Token.Keyword && stx$157.token.value === 'var';
    }
    function varNamesInAST(ast$158) {
        return _$3.map(ast$158, function (item$159) {
            return item$159.id.name;
        });
    }
    var TermTree$12 = {destruct: function (breakDelim$160) {
                return _$3.reduce(this.properties, _$3.bind(function (acc$161, prop$162) {
                    if (this[prop$162] && this[prop$162].hasPrototype(TermTree$12)) {
                        return acc$161.concat(this[prop$162].destruct(breakDelim$160));
                    } else if (this[prop$162]) {
                        return acc$161.concat(this[prop$162]);
                    } else {
                        return acc$161;
                    }
                }, this), []);
            }};
    var EOF$13 = TermTree$12.extend({
            properties: ['eof'],
            construct: function (e$163) {
                this.eof = e$163;
            }
        });
    var MakeSyntax$14 = TermTree$12.extend({
            properties: [
                'kw',
                'arg'
            ],
            construct: function (kw$164, arg$165) {
                this.kw = kw$164;
                this.arg = arg$165;
            }
        });
    var Statement$15 = TermTree$12.extend({construct: function () {
            }});
    var Expr$16 = TermTree$12.extend({construct: function () {
            }});
    var PrimaryExpression$17 = Expr$16.extend({construct: function () {
            }});
    var ThisExpression$18 = PrimaryExpression$17.extend({
            properties: ['this'],
            construct: function (that$166) {
                this.this = that$166;
            }
        });
    var Lit$19 = PrimaryExpression$17.extend({
            properties: ['lit'],
            construct: function (l$167) {
                this.lit = l$167;
            }
        });
    exports$2._test.PropertyAssignment = PropertyAssignment$20;
    var PropertyAssignment$20 = TermTree$12.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$168, assignment$169) {
                this.propName = propName$168;
                this.assignment = assignment$169;
            }
        });
    var Block$21 = PrimaryExpression$17.extend({
            properties: ['body'],
            construct: function (body$170) {
                this.body = body$170;
            }
        });
    var ArrayLiteral$22 = PrimaryExpression$17.extend({
            properties: ['array'],
            construct: function (ar$171) {
                this.array = ar$171;
            }
        });
    var ParenExpression$23 = PrimaryExpression$17.extend({
            properties: ['expr'],
            construct: function (expr$172) {
                this.expr = expr$172;
            }
        });
    var UnaryOp$24 = Expr$16.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$173, expr$174) {
                this.op = op$173;
                this.expr = expr$174;
            }
        });
    var PostfixOp$25 = Expr$16.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$175, op$176) {
                this.expr = expr$175;
                this.op = op$176;
            }
        });
    var BinOp$26 = Expr$16.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$177, left$178, right$179) {
                this.op = op$177;
                this.left = left$178;
                this.right = right$179;
            }
        });
    var ConditionalExpression$27 = Expr$16.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$180, question$181, tru$182, colon$183, fls$184) {
                this.cond = cond$180;
                this.question = question$181;
                this.tru = tru$182;
                this.colon = colon$183;
                this.fls = fls$184;
            }
        });
    var Keyword$28 = TermTree$12.extend({
            properties: ['keyword'],
            construct: function (k$185) {
                this.keyword = k$185;
            }
        });
    var Punc$29 = TermTree$12.extend({
            properties: ['punc'],
            construct: function (p$186) {
                this.punc = p$186;
            }
        });
    var Delimiter$30 = TermTree$12.extend({
            properties: ['delim'],
            destruct: function (breakDelim$187) {
                parser$4.assert(this.delim, 'expecting delim to be defined');
                var innerStx$188 = _$3.reduce(this.delim.token.inner, function (acc$189, term$190) {
                        if (term$190.hasPrototype(TermTree$12)) {
                            return acc$189.concat(term$190.destruct(breakDelim$187));
                        } else {
                            return acc$189.concat(term$190);
                        }
                    }, []);
                if (breakDelim$187) {
                    var openParen$191 = syntaxFromToken({
                            type: parser$4.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$192 = syntaxFromToken({
                            type: parser$4.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$191].concat(innerStx$188).concat(closeParen$192);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$193) {
                this.delim = d$193;
            }
        });
    var Id$31 = PrimaryExpression$17.extend({
            properties: ['id'],
            construct: function (id$194) {
                this.id = id$194;
            }
        });
    var NamedFun$32 = Expr$16.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$195, name$196, params$197, body$198) {
                this.keyword = keyword$195;
                this.name = name$196;
                this.params = params$197;
                this.body = body$198;
            }
        });
    var AnonFun$33 = Expr$16.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$199, params$200, body$201) {
                this.keyword = keyword$199;
                this.params = params$200;
                this.body = body$201;
            }
        });
    var Macro$34 = TermTree$12.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$202, body$203) {
                this.name = name$202;
                this.body = body$203;
            }
        });
    var Const$35 = Expr$16.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$204, call$205) {
                this.newterm = newterm$204;
                this.call = call$205;
            }
        });
    var Call$36 = Expr$16.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$206) {
                parser$4.assert(this.fun.hasPrototype(TermTree$12), 'expecting a term tree in destruct of call');
                var that$207 = this;
                this.delim = syntaxFromToken(_$3.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$3.reduce(this.args, function (acc$208, term$209) {
                    parser$4.assert(term$209 && term$209.hasPrototype(TermTree$12), 'expecting term trees in destruct of Call');
                    var dst$210 = acc$208.concat(term$209.destruct(breakDelim$206));
                    if (that$207.commas.length > 0) {
                        dst$210 = dst$210.concat(that$207.commas.shift());
                    }
                    return dst$210;
                }, []);
                return this.fun.destruct(breakDelim$206).concat(Delimiter$30.create(this.delim).destruct(breakDelim$206));
            },
            construct: function (funn$211, args$212, delim$213, commas$214) {
                parser$4.assert(Array.isArray(args$212), 'requires an array of arguments terms');
                this.fun = funn$211;
                this.args = args$212;
                this.delim = delim$213;
                this.commas = commas$214;
            }
        });
    var ObjDotGet$37 = Expr$16.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$215, dot$216, right$217) {
                this.left = left$215;
                this.dot = dot$216;
                this.right = right$217;
            }
        });
    var ObjGet$38 = Expr$16.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$218, right$219) {
                this.left = left$218;
                this.right = right$219;
            }
        });
    var VariableDeclaration$39 = TermTree$12.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$220, eqstx$221, init$222, comma$223) {
                this.ident = ident$220;
                this.eqstx = eqstx$221;
                this.init = init$222;
                this.comma = comma$223;
            }
        });
    var VariableStatement$40 = Statement$15.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$224) {
                return this.varkw.destruct(breakDelim$224).concat(_$3.reduce(this.decls, function (acc$225, decl$226) {
                    return acc$225.concat(decl$226.destruct(breakDelim$224));
                }, []));
            },
            construct: function (varkw$227, decls$228) {
                parser$4.assert(Array.isArray(decls$228), 'decls must be an array');
                this.varkw = varkw$227;
                this.decls = decls$228;
            }
        });
    var CatchClause$41 = TermTree$12.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$229, params$230, body$231) {
                this.catchkw = catchkw$229;
                this.params = params$230;
                this.body = body$231;
            }
        });
    var Empty$42 = TermTree$12.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$232) {
        var staticOperators$233 = [
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
        return _$3.contains(staticOperators$233, stx$232.token.value);
    }
    function stxIsBinOp(stx$234) {
        var staticOperators$235 = [
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
        return _$3.contains(staticOperators$235, stx$234.token.value);
    }
    function enforestVarStatement(stx$236, env$237) {
        parser$4.assert(stx$236[0] && stx$236[0].token.type === parser$4.Token.Identifier, 'must start at the identifier');
        var decls$238 = [], rest$239 = stx$236, initRes$240, subRes$241;
        if (stx$236[1] && stx$236[1].token.type === parser$4.Token.Punctuator && stx$236[1].token.value === '=') {
            initRes$240 = enforest(stx$236.slice(2), env$237);
            if (initRes$240.result.hasPrototype(Expr$16)) {
                rest$239 = initRes$240.rest;
                if (initRes$240.rest[0].token.type === parser$4.Token.Punctuator && initRes$240.rest[0].token.value === ',' && initRes$240.rest[1] && initRes$240.rest[1].token.type === parser$4.Token.Identifier) {
                    decls$238.push(VariableDeclaration$39.create(stx$236[0], stx$236[1], initRes$240.result, initRes$240.rest[0]));
                    subRes$241 = enforestVarStatement(initRes$240.rest.slice(1), env$237);
                    decls$238 = decls$238.concat(subRes$241.result);
                    rest$239 = subRes$241.rest;
                } else {
                    decls$238.push(VariableDeclaration$39.create(stx$236[0], stx$236[1], initRes$240.result));
                }
            } else {
                parser$4.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$236[1] && stx$236[1].token.type === parser$4.Token.Punctuator && stx$236[1].token.value === ',') {
            decls$238.push(VariableDeclaration$39.create(stx$236[0], null, null, stx$236[1]));
            subRes$241 = enforestVarStatement(stx$236.slice(2), env$237);
            decls$238 = decls$238.concat(subRes$241.result);
            rest$239 = subRes$241.rest;
        } else {
            decls$238.push(VariableDeclaration$39.create(stx$236[0]));
            rest$239 = stx$236.slice(1);
        }
        return {
            result: decls$238,
            rest: rest$239
        };
    }
    function enforest(toks$242, env$243) {
        env$243 = env$243 || new Map();
        parser$4.assert(toks$242.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$244, rest$245) {
            var innerTokens$246;
            parser$4.assert(Array.isArray(rest$245), 'result must at least be an empty array');
            if (head$244.hasPrototype(TermTree$12)) {
                if (head$244.hasPrototype(Expr$16) && rest$245[0] && rest$245[0].token.type === parser$4.Token.Delimiter && rest$245[0].token.value === '()') {
                    var argRes$247, enforestedArgs$248 = [], commas$249 = [];
                    innerTokens$246 = rest$245[0].token.inner;
                    while (innerTokens$246.length > 0) {
                        argRes$247 = enforest(innerTokens$246, env$243);
                        enforestedArgs$248.push(argRes$247.result);
                        innerTokens$246 = argRes$247.rest;
                        if (innerTokens$246[0] && innerTokens$246[0].token.value === ',') {
                            commas$249.push(innerTokens$246[0]);
                            innerTokens$246 = innerTokens$246.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$250 = _$3.all(enforestedArgs$248, function (argTerm$251) {
                            return argTerm$251.hasPrototype(Expr$16);
                        });
                    if (innerTokens$246.length === 0 && argsAreExprs$250) {
                        return step(Call$36.create(head$244, enforestedArgs$248, rest$245[0], commas$249), rest$245.slice(1));
                    }
                } else if (head$244.hasPrototype(Keyword$28) && head$244.keyword.token.value === 'new' && rest$245[0]) {
                    var newCallRes$252 = enforest(rest$245, env$243);
                    if (newCallRes$252.result.hasPrototype(Call$36)) {
                        return step(Const$35.create(head$244, newCallRes$252.result), newCallRes$252.rest);
                    }
                } else if (head$244.hasPrototype(Expr$16) && rest$245[0] && rest$245[0].token.value === '?') {
                    var question$253 = rest$245[0];
                    var condRes$254 = enforest(rest$245.slice(1), env$243);
                    var truExpr$255 = condRes$254.result;
                    var right$264 = condRes$254.rest;
                    if (truExpr$255.hasPrototype(Expr$16) && right$264[0] && right$264[0].token.value === ':') {
                        var colon$257 = right$264[0];
                        var flsRes$258 = enforest(right$264.slice(1), env$243);
                        var flsExpr$259 = flsRes$258.result;
                        if (flsExpr$259.hasPrototype(Expr$16)) {
                            return step(ConditionalExpression$27.create(head$244, question$253, truExpr$255, colon$257, flsExpr$259), flsRes$258.rest);
                        }
                    }
                } else if (head$244.hasPrototype(Delimiter$30) && head$244.delim.token.value === '()') {
                    innerTokens$246 = head$244.delim.token.inner;
                    if (innerTokens$246.length === 0) {
                        return step(ParenExpression$23.create(head$244), rest$245);
                    } else {
                        var innerTerm$260 = get_expression(innerTokens$246, env$243);
                        if (innerTerm$260.result && innerTerm$260.result.hasPrototype(Expr$16)) {
                            return step(ParenExpression$23.create(head$244), rest$245);
                        }
                    }
                } else if (rest$245[0] && rest$245[1] && stxIsBinOp(rest$245[0])) {
                    var op$266 = rest$245[0];
                    var left$262 = head$244;
                    var bopRes$263 = enforest(rest$245.slice(1), env$243);
                    var right$264 = bopRes$263.result;
                    if (right$264.hasPrototype(Expr$16)) {
                        return step(BinOp$26.create(op$266, left$262, right$264), bopRes$263.rest);
                    }
                } else if (head$244.hasPrototype(Punc$29) && stxIsUnaryOp(head$244.punc) || head$244.hasPrototype(Keyword$28) && stxIsUnaryOp(head$244.keyword)) {
                    var unopRes$265 = enforest(rest$245);
                    var op$266 = head$244.hasPrototype(Punc$29) ? head$244.punc : head$244.keyword;
                    if (unopRes$265.result.hasPrototype(Expr$16)) {
                        return step(UnaryOp$24.create(op$266, unopRes$265.result), unopRes$265.rest);
                    }
                } else if (head$244.hasPrototype(Expr$16) && rest$245[0] && (rest$245[0].token.value === '++' || rest$245[0].token.value === '--')) {
                    return step(PostfixOp$25.create(head$244, rest$245[0]), rest$245.slice(1));
                } else if (head$244.hasPrototype(Expr$16) && rest$245[0] && rest$245[0].token.value === '[]') {
                    var getRes$267 = enforest(rest$245[0].token.inner, env$243);
                    var resStx$268 = mkSyntax('[]', parser$4.Token.Delimiter, rest$245[0]);
                    resStx$268.token.inner = [getRes$267.result];
                    if (getRes$267.rest.length > 0) {
                        return step(ObjGet$38.create(head$244, Delimiter$30.create(resStx$268)), rest$245.slice(1));
                    }
                } else if (head$244.hasPrototype(Expr$16) && rest$245[0] && rest$245[0].token.value === '.' && rest$245[1] && rest$245[1].token.type === parser$4.Token.Identifier) {
                    return step(ObjDotGet$37.create(head$244, rest$245[0], rest$245[1]), rest$245.slice(2));
                } else if (head$244.hasPrototype(Delimiter$30) && head$244.delim.token.value === '[]') {
                    return step(ArrayLiteral$22.create(head$244), rest$245);
                } else if (head$244.hasPrototype(Delimiter$30) && head$244.delim.token.value === '{}') {
                    innerTokens$246 = head$244.delim.token.inner;
                    return step(Block$21.create(head$244), rest$245);
                } else if (head$244.hasPrototype(Keyword$28) && head$244.keyword.token.value === 'var' && rest$245[0] && rest$245[0].token.type === parser$4.Token.Identifier) {
                    var vsRes$269 = enforestVarStatement(rest$245, env$243);
                    if (vsRes$269) {
                        return step(VariableStatement$40.create(head$244, vsRes$269.result), vsRes$269.rest);
                    }
                }
            } else {
                parser$4.assert(head$244 && head$244.token, 'assuming head is a syntax object');
                if ((head$244.token.type === parser$4.Token.Identifier || head$244.token.type === parser$4.Token.Keyword) && env$243.has(head$244.token.value)) {
                    var transformer$270 = env$243.get(head$244.token.value);
                    var rt$271 = transformer$270(rest$245, head$244, env$243);
                    if (rt$271.result.length > 0) {
                        return step(rt$271.result[0], rt$271.result.slice(1).concat(rt$271.rest));
                    } else {
                        return step(Empty$42.create(), rt$271.rest);
                    }
                } else if (head$244.token.type === parser$4.Token.Identifier && head$244.token.value === 'macro' && rest$245[0] && (rest$245[0].token.type === parser$4.Token.Identifier || rest$245[0].token.type === parser$4.Token.Keyword) && rest$245[1] && rest$245[1].token.type === parser$4.Token.Delimiter && rest$245[1].token.value === '{}') {
                    return step(Macro$34.create(rest$245[0], rest$245[1].token.inner), rest$245.slice(2));
                } else if (head$244.token.type === parser$4.Token.Keyword && head$244.token.value === 'function' && rest$245[0] && rest$245[0].token.type === parser$4.Token.Identifier && rest$245[1] && rest$245[1].token.type === parser$4.Token.Delimiter && rest$245[1].token.value === '()' && rest$245[2] && rest$245[2].token.type === parser$4.Token.Delimiter && rest$245[2].token.value === '{}') {
                    return step(NamedFun$32.create(head$244, rest$245[0], rest$245[1], rest$245[2]), rest$245.slice(3));
                } else if (head$244.token.type === parser$4.Token.Keyword && head$244.token.value === 'function' && rest$245[0] && rest$245[0].token.type === parser$4.Token.Delimiter && rest$245[0].token.value === '()' && rest$245[1] && rest$245[1].token.type === parser$4.Token.Delimiter && rest$245[1].token.value === '{}') {
                    return step(AnonFun$33.create(head$244, rest$245[0], rest$245[1]), rest$245.slice(2));
                } else if (head$244.token.type === parser$4.Token.Identifier && head$244.token.value === 'makeSyntax' && rest$245[0] && rest$245[0].token.value === '()') {
                    return step(MakeSyntax$14.create(head$244, rest$245[0]), rest$245.slice(1));
                } else if (head$244.token.type === parser$4.Token.Keyword && head$244.token.value === 'catch' && rest$245[0] && rest$245[0].token.type === parser$4.Token.Delimiter && rest$245[0].token.value === '()' && rest$245[1] && rest$245[1].token.type === parser$4.Token.Delimiter && rest$245[1].token.value === '{}') {
                    return step(CatchClause$41.create(head$244, rest$245[0], rest$245[1]), rest$245.slice(2));
                } else if (head$244.token.type === parser$4.Token.Keyword && head$244.token.value === 'this') {
                    return step(ThisExpression$18.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.NumericLiteral || head$244.token.type === parser$4.Token.StringLiteral || head$244.token.type === parser$4.Token.BooleanLiteral || head$244.token.type === parser$4.Token.RegexLiteral || head$244.token.type === parser$4.Token.NullLiteral) {
                    return step(Lit$19.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.Identifier) {
                    return step(Id$31.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.Punctuator) {
                    return step(Punc$29.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.Keyword && head$244.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$244.token.type === parser$4.Token.Keyword) {
                    return step(Keyword$28.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.Delimiter) {
                    return step(Delimiter$30.create(head$244), rest$245);
                } else if (head$244.token.type === parser$4.Token.EOF) {
                    parser$4.assert(rest$245.length === 0, 'nothing should be after an EOF');
                    return step(EOF$13.create(head$244), []);
                } else {
                    parser$4.assert(false, 'not implemented');
                }
            }
            return {
                result: head$244,
                rest: rest$245
            };
        }
        return step(toks$242[0], toks$242.slice(1));
    }
    function get_expression(stx$272, env$273) {
        var res$274 = enforest(stx$272, env$273);
        if (!res$274.result.hasPrototype(Expr$16)) {
            return {
                result: null,
                rest: stx$272
            };
        }
        return res$274;
    }
    function typeIsLiteral(type$275) {
        return type$275 === parser$4.Token.NullLiteral || type$275 === parser$4.Token.NumericLiteral || type$275 === parser$4.Token.StringLiteral || type$275 === parser$4.Token.RegexLiteral || type$275 === parser$4.Token.BooleanLiteral;
    }
    exports$2._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$276, stx$277, env$278) {
        var result$279, rest$280;
        if (patternClass$276 === 'token' && stx$277[0] && stx$277[0].token.type !== parser$4.Token.EOF) {
            result$279 = [stx$277[0]];
            rest$280 = stx$277.slice(1);
        } else if (patternClass$276 === 'lit' && stx$277[0] && typeIsLiteral(stx$277[0].token.type)) {
            result$279 = [stx$277[0]];
            rest$280 = stx$277.slice(1);
        } else if (patternClass$276 === 'ident' && stx$277[0] && stx$277[0].token.type === parser$4.Token.Identifier) {
            result$279 = [stx$277[0]];
            rest$280 = stx$277.slice(1);
        } else if (patternClass$276 === 'VariableStatement') {
            var match$282 = enforest(stx$277, env$278);
            if (match$282.result && match$282.result.hasPrototype(VariableStatement$40)) {
                result$279 = match$282.result.destruct(false);
                rest$280 = match$282.rest;
            } else {
                result$279 = null;
                rest$280 = stx$277;
            }
        } else if (patternClass$276 === 'expr') {
            var match$282 = get_expression(stx$277, env$278);
            if (match$282.result === null || !match$282.result.hasPrototype(Expr$16)) {
                result$279 = null;
                rest$280 = stx$277;
            } else {
                result$279 = match$282.result.destruct(false);
                rest$280 = match$282.rest;
            }
        } else {
            result$279 = null;
            rest$280 = stx$277;
        }
        return {
            result: result$279,
            rest: rest$280
        };
    }
    function matchPattern(pattern$283, stx$284, env$285, patternEnv$286) {
        var subMatch$287;
        var match$288, matchEnv$289;
        var rest$290;
        var success$291;
        if (stx$284.length === 0) {
            return {
                success: false,
                rest: stx$284,
                patternEnv: patternEnv$286
            };
        }
        parser$4.assert(stx$284.length > 0, 'should have had something to match here');
        if (pattern$283.token.type === parser$4.Token.Delimiter) {
            if (pattern$283.class === 'pattern_group') {
                subMatch$287 = matchPatterns(pattern$283.token.inner, stx$284, env$285, false);
                rest$290 = subMatch$287.rest;
            } else if (stx$284[0].token.type === parser$4.Token.Delimiter && stx$284[0].token.value === pattern$283.token.value) {
                subMatch$287 = matchPatterns(pattern$283.token.inner, stx$284[0].token.inner, env$285, false);
                rest$290 = stx$284.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$284,
                    patternEnv: patternEnv$286
                };
            }
            success$291 = subMatch$287.success;
            _$3.keys(subMatch$287.patternEnv).forEach(function (patternKey$292) {
                if (pattern$283.repeat) {
                    var nextLevel$293 = subMatch$287.patternEnv[patternKey$292].level + 1;
                    if (patternEnv$286[patternKey$292]) {
                        patternEnv$286[patternKey$292].level = nextLevel$293;
                        patternEnv$286[patternKey$292].match.push(subMatch$287.patternEnv[patternKey$292]);
                    } else {
                        patternEnv$286[patternKey$292] = {
                            level: nextLevel$293,
                            match: [subMatch$287.patternEnv[patternKey$292]]
                        };
                    }
                } else {
                    patternEnv$286[patternKey$292] = subMatch$287.patternEnv[patternKey$292];
                }
            });
        } else {
            if (pattern$283.class === 'pattern_literal') {
                if (pattern$283.token.value === stx$284[0].token.value) {
                    success$291 = true;
                    rest$290 = stx$284.slice(1);
                } else {
                    success$291 = false;
                    rest$290 = stx$284;
                }
            } else {
                match$288 = matchPatternClass(pattern$283.class, stx$284, env$285);
                success$291 = match$288.result !== null;
                rest$290 = match$288.rest;
                matchEnv$289 = {
                    level: 0,
                    match: match$288.result
                };
                if (match$288.result !== null) {
                    if (pattern$283.repeat) {
                        if (patternEnv$286[pattern$283.token.value]) {
                            patternEnv$286[pattern$283.token.value].match.push(matchEnv$289);
                        } else {
                            patternEnv$286[pattern$283.token.value] = {
                                level: 1,
                                match: [matchEnv$289]
                            };
                        }
                    } else {
                        patternEnv$286[pattern$283.token.value] = matchEnv$289;
                    }
                }
            }
        }
        return {
            success: success$291,
            rest: rest$290,
            patternEnv: patternEnv$286
        };
    }
    function matchPatterns(patterns$294, stx$295, env$296, topLevel$297) {
        topLevel$297 = topLevel$297 || false;
        var result$298 = [];
        var patternEnv$299 = {};
        var match$300;
        var pattern$301;
        var rest$302 = stx$295;
        var success$303 = true;
        for (var i$304 = 0; i$304 < patterns$294.length; i$304++) {
            pattern$301 = patterns$294[i$304];
            do {
                match$300 = matchPattern(pattern$301, rest$302, env$296, patternEnv$299);
                if (!match$300.success) {
                    success$303 = false;
                }
                rest$302 = match$300.rest;
                patternEnv$299 = match$300.patternEnv;
                if (pattern$301.repeat && success$303) {
                    if (rest$302[0] && rest$302[0].token.value === pattern$301.separator) {
                        rest$302 = rest$302.slice(1);
                    } else if (pattern$301.separator === ' ') {
                        continue;
                    } else if (pattern$301.separator !== ' ' && rest$302.length > 0 && i$304 === patterns$294.length - 1 && topLevel$297 === false) {
                        success$303 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$301.repeat && match$300.success && rest$302.length > 0);
        }
        return {
            success: success$303,
            rest: rest$302,
            patternEnv: patternEnv$299
        };
    }
    function transcribe(macroBody$305, macroNameStx$306, env$307) {
        return _$3.chain(macroBody$305).reduce(function (acc$308, bodyStx$309, idx$310, original$311) {
            var last$312 = original$311[idx$310 - 1];
            var next$313 = original$311[idx$310 + 1];
            var nextNext$314 = original$311[idx$310 + 2];
            if (bodyStx$309.token.value === '...') {
                return acc$308;
            }
            if (delimIsSeparator(bodyStx$309) && next$313 && next$313.token.value === '...') {
                return acc$308;
            }
            if (bodyStx$309.token.value === '$' && next$313 && next$313.token.type === parser$4.Token.Delimiter && next$313.token.value === '()') {
                return acc$308;
            }
            if (bodyStx$309.token.value === '$' && next$313 && next$313.token.type === parser$4.Token.Delimiter && next$313.token.value === '[]') {
                next$313.literal = true;
                return acc$308;
            }
            if (bodyStx$309.token.type === parser$4.Token.Delimiter && bodyStx$309.token.value === '()' && last$312 && last$312.token.value === '$') {
                bodyStx$309.group = true;
            }
            if (bodyStx$309.literal === true) {
                parser$4.assert(bodyStx$309.token.type === parser$4.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$308.concat(bodyStx$309.token.inner);
            }
            if (next$313 && next$313.token.value === '...') {
                bodyStx$309.repeat = true;
                bodyStx$309.separator = ' ';
            } else if (delimIsSeparator(next$313) && nextNext$314 && nextNext$314.token.value === '...') {
                bodyStx$309.repeat = true;
                bodyStx$309.separator = next$313.token.inner[0].token.value;
            }
            return acc$308.concat(bodyStx$309);
        }, []).reduce(function (acc$315, bodyStx$316, idx$317) {
            if (bodyStx$316.repeat) {
                if (bodyStx$316.token.type === parser$4.Token.Delimiter) {
                    var fv$318 = _$3.filter(freeVarsInPattern(bodyStx$316.token.inner), function (pat$325) {
                            return env$307.hasOwnProperty(pat$325);
                        });
                    var restrictedEnv$319 = [];
                    var nonScalar$320 = _$3.find(fv$318, function (pat$326) {
                            return env$307[pat$326].level > 0;
                        });
                    parser$4.assert(typeof nonScalar$320 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$321 = env$307[nonScalar$320].match.length;
                    var sameLength$322 = _$3.all(fv$318, function (pat$327) {
                            return env$307[pat$327].level === 0 || env$307[pat$327].match.length === repeatLength$321;
                        });
                    parser$4.assert(sameLength$322, 'all non-scalars must have the same length');
                    restrictedEnv$319 = _$3.map(_$3.range(repeatLength$321), function (idx$328) {
                        var renv$329 = {};
                        _$3.each(fv$318, function (pat$330) {
                            if (env$307[pat$330].level === 0) {
                                renv$329[pat$330] = env$307[pat$330];
                            } else {
                                renv$329[pat$330] = env$307[pat$330].match[idx$328];
                            }
                        });
                        return renv$329;
                    });
                    var transcribed$323 = _$3.map(restrictedEnv$319, function (renv$331) {
                            if (bodyStx$316.group) {
                                return transcribe(bodyStx$316.token.inner, macroNameStx$306, renv$331);
                            } else {
                                var newBody$332 = syntaxFromToken(_$3.clone(bodyStx$316.token), bodyStx$316.context);
                                newBody$332.token.inner = transcribe(bodyStx$316.token.inner, macroNameStx$306, renv$331);
                                return newBody$332;
                            }
                        });
                    var joined$324;
                    if (bodyStx$316.group) {
                        joined$324 = joinSyntaxArr(transcribed$323, bodyStx$316.separator);
                    } else {
                        joined$324 = joinSyntax(transcribed$323, bodyStx$316.separator);
                    }
                    return acc$315.concat(joined$324);
                }
                parser$4.assert(env$307[bodyStx$316.token.value].level === 1, 'ellipses level does not match');
                return acc$315.concat(joinRepeatedMatch(env$307[bodyStx$316.token.value].match, bodyStx$316.separator));
            } else {
                if (bodyStx$316.token.type === parser$4.Token.Delimiter) {
                    var newBody$333 = syntaxFromToken(_$3.clone(bodyStx$316.token), macroBody$305.context);
                    newBody$333.token.inner = transcribe(bodyStx$316.token.inner, macroNameStx$306, env$307);
                    return acc$315.concat(newBody$333);
                }
                if (Object.prototype.hasOwnProperty.bind(env$307)(bodyStx$316.token.value)) {
                    parser$4.assert(env$307[bodyStx$316.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$316.token.value);
                    return acc$315.concat(takeLineContext(macroNameStx$306, env$307[bodyStx$316.token.value].match));
                }
                return acc$315.concat(takeLineContext(macroNameStx$306, [bodyStx$316]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$334, env$335) {
        function dfs(match$336) {
            if (match$336.level === 0) {
                match$336.match = _$3.map(match$336.match, function (stx$337) {
                    return stx$337.mark(newMark$334);
                });
            } else {
                _$3.each(match$336.match, function (match$338) {
                    dfs(match$338);
                });
            }
        }
        _$3.keys(env$335).forEach(function (key$339) {
            dfs(env$335[key$339]);
        });
    }
    function evalMacroBody(body$340) {
        var functionStub$341 = parser$4.read('(function(makeSyntax) { })');
        functionStub$341[0].token.inner[2].token.inner = body$340;
        var bodyCode$342 = codegen$6.generate(parser$4.parse(expandTopLevel(functionStub$341)));
        var macroFn$343 = eval(bodyCode$342);
        return macroFn$343(function (val$344, ctx$345) {
            return mkSyntax(val$344, parser$4.Token.NumericLiteral, null);
        });
    }
    function makeTransformer(cases$346, macroType$347) {
        var sortedCases$348 = _$3.sortBy(cases$346, function (mcase$349) {
                return patternLength(mcase$349.pattern);
            }).reverse();
        return function transformer(stx$350, macroNameStx$351, env$352) {
            var match$353;
            var casePattern$354, caseBody$355;
            var newMark$356;
            var macroResult$357;
            for (var i$358 = 0; i$358 < sortedCases$348.length; i$358++) {
                casePattern$354 = sortedCases$348[i$358].pattern;
                caseBody$355 = sortedCases$348[i$358].body;
                match$353 = matchPatterns(casePattern$354, stx$350, env$352, true);
                if (match$353.success) {
                    newMark$356 = fresh();
                    applyMarkToPatternEnv(newMark$356, match$353.patternEnv);
                    macroResult$357 = transcribe(caseBody$355, macroNameStx$351, match$353.patternEnv);
                    if (macroType$347 === 'case') {
                        macroResult$357 = evalMacroBody(macroResult$357);
                    }
                    macroResult$357 = _$3.map(macroResult$357, function (stx$359) {
                        return stx$359.mark(newMark$356);
                    });
                    return {
                        result: macroResult$357,
                        rest: match$353.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$351.token.value);
        };
    }
    function loadMacroDef(mac$360) {
        var body$361 = mac$360.body;
        var caseOffset$362 = 0;
        var arrowOffset$363 = 0;
        var casePattern$364;
        var caseBody$365;
        var caseBodyIdx$366;
        var cases$367 = [];
        var i$368 = 0;
        var patOffset$369 = 1;
        var bodyOffset$370 = 4;
        var macroType$371;
        if (body$361[0] && body$361[0].token.value === 'rule' || body$361[0].token.value === 'case') {
            macroType$371 = body$361[0].token.value;
        } else {
            throwError('Macro definition must start with either \'rule\' or \'case\'');
        }
        while (i$368 < body$361.length && body$361[i$368].token.value === macroType$371) {
            if (!body$361[i$368 + patOffset$369] || body$361[i$368 + patOffset$369].token.type !== parser$4.Token.Delimiter || body$361[i$368 + patOffset$369].token.value !== '{}') {
                throwError('Expecting a {} to surround the pattern in a macro definition');
            }
            if (!body$361[i$368 + 2] || body$361[i$368 + 2].token.value !== '=' || !body$361[i$368 + 3] || body$361[i$368 + 3].token.value !== '>') {
                throwError('expecting a => following the pattern in a macro definition');
            }
            if (!body$361[i$368 + bodyOffset$370] || body$361[i$368 + bodyOffset$370].token.type !== parser$4.Token.Delimiter || body$361[i$368 + bodyOffset$370].token.value !== '{}') {
                throwError('Expecting a {} to surround the body in a macro definition');
            }
            casePattern$364 = body$361[i$368 + patOffset$369].token.inner;
            caseBody$365 = body$361[i$368 + bodyOffset$370].token.inner;
            cases$367.push({
                pattern: loadPattern(casePattern$364, mac$360.name),
                body: caseBody$365
            });
            i$368 += bodyOffset$370 + 1;
        }
        return makeTransformer(cases$367, macroType$371);
    }
    function expandToTermTree(stx$372, env$373, defscope$374) {
        parser$4.assert(env$373, 'environment map is required');
        if (stx$372.length === 0) {
            return {
                terms: [],
                env: env$373
            };
        }
        parser$4.assert(stx$372[0].token, 'expecting a syntax object');
        var f$375 = enforest(stx$372, env$373);
        var head$376 = f$375.result;
        var rest$377 = f$375.rest;
        if (head$376.hasPrototype(Macro$34)) {
            var macroDefinition$379 = loadMacroDef(head$376);
            env$373.set(head$376.name.token.value, macroDefinition$379);
            return expandToTermTree(rest$377, env$373, defscope$374);
        }
        if (head$376.hasPrototype(VariableStatement$40)) {
            addVarsToDefinitionCtx(head$376, defscope$374);
        }
        if (head$376.hasPrototype(Block$21) && head$376.body.hasPrototype(Delimiter$30)) {
            head$376.body.delim.token.inner.forEach(function (term$380) {
                addVarsToDefinitionCtx(term$380, defscope$374);
            });
        }
        if (head$376.hasPrototype(Delimiter$30)) {
            head$376.delim.token.inner.forEach(function (term$381) {
                addVarsToDefinitionCtx(term$381, defscope$374);
            });
        }
        var trees$378 = expandToTermTree(rest$377, env$373, defscope$374);
        return {
            terms: [head$376].concat(trees$378.terms),
            env: trees$378.env
        };
    }
    function addVarsToDefinitionCtx(term$382, defscope$383) {
        if (term$382.hasPrototype(VariableStatement$40)) {
            term$382.decls.forEach(function (decl$384) {
                var defctx$385 = defscope$383;
                parser$4.assert(defctx$385, 'no definition context found but there should always be one');
                var declRepeat$386 = _$3.find(defctx$385, function (def$387) {
                        return def$387.id.token.value === decl$384.ident.token.value && arraysEqual(marksof(def$387.id.context), marksof(decl$384.ident.context));
                    });
                if (declRepeat$386 !== null) {
                    var name$388 = fresh();
                    defctx$385.push({
                        id: decl$384.ident,
                        name: name$388
                    });
                }
            });
        }
    }
    function getVarDeclIdentifiers(term$389) {
        var toCheck$390;
        if (term$389.hasPrototype(Block$21) && term$389.body.hasPrototype(Delimiter$30)) {
            toCheck$390 = term$389.body.delim.token.inner;
        } else if (term$389.hasPrototype(Delimiter$30)) {
            toCheck$390 = term$389.delim.token.inner;
        } else {
            parser$4.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$3.reduce(toCheck$390, function (acc$391, curr$392, idx$393, list$394) {
            var prev$395 = list$394[idx$393 - 1];
            if (curr$392.hasPrototype(VariableStatement$40)) {
                return _$3.reduce(curr$392.decls, function (acc$396, decl$397) {
                    return acc$396.concat(decl$397.ident);
                }, acc$391);
            } else if (prev$395 && prev$395.hasPrototype(Keyword$28) && prev$395.keyword.token.value === 'for' && curr$392.hasPrototype(Delimiter$30)) {
                return acc$391.concat(getVarDeclIdentifiers(curr$392));
            } else if (curr$392.hasPrototype(Block$21)) {
                return acc$391.concat(getVarDeclIdentifiers(curr$392));
            }
            return acc$391;
        }, []);
    }
    function replaceVarIdent(stx$398, orig$399, renamed$400) {
        if (stx$398 === orig$399) {
            return renamed$400;
        }
        return stx$398;
    }
    function expandTermTreeToFinal(term$401, env$402, ctx$403, defscope$404) {
        parser$4.assert(env$402, 'environment map is required');
        parser$4.assert(ctx$403, 'context map is required');
        if (term$401.hasPrototype(ArrayLiteral$22)) {
            term$401.array.delim.token.inner = expand(term$401.array.delim.token.inner, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(Block$21)) {
            term$401.body.delim.token.inner = expand(term$401.body.delim.token.inner, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(ParenExpression$23)) {
            term$401.expr.delim.token.inner = expand(term$401.expr.delim.token.inner, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(Call$36)) {
            term$401.fun = expandTermTreeToFinal(term$401.fun, env$402, ctx$403, defscope$404);
            term$401.args = _$3.map(term$401.args, function (arg$405) {
                return expandTermTreeToFinal(arg$405, env$402, ctx$403, defscope$404);
            });
            return term$401;
        } else if (term$401.hasPrototype(UnaryOp$24)) {
            term$401.expr = expandTermTreeToFinal(term$401.expr, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(BinOp$26)) {
            term$401.left = expandTermTreeToFinal(term$401.left, env$402, ctx$403, defscope$404);
            term$401.right = expandTermTreeToFinal(term$401.right, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(ObjDotGet$37)) {
            term$401.left = expandTermTreeToFinal(term$401.left, env$402, ctx$403, defscope$404);
            term$401.right = expandTermTreeToFinal(term$401.right, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(VariableDeclaration$39)) {
            if (term$401.init) {
                term$401.init = expandTermTreeToFinal(term$401.init, env$402, ctx$403, defscope$404);
            }
            return term$401;
        } else if (term$401.hasPrototype(VariableStatement$40)) {
            term$401.decls = _$3.map(term$401.decls, function (decl$406) {
                return expandTermTreeToFinal(decl$406, env$402, ctx$403, defscope$404);
            });
            return term$401;
        } else if (term$401.hasPrototype(Delimiter$30)) {
            term$401.delim.token.inner = expand(term$401.delim.token.inner, env$402, ctx$403, defscope$404);
            return term$401;
        } else if (term$401.hasPrototype(NamedFun$32) || term$401.hasPrototype(AnonFun$33) || term$401.hasPrototype(CatchClause$41)) {
            var newDef$407 = [];
            var params$408 = term$401.params.addDefCtx(newDef$407);
            var bodies$409 = term$401.body.addDefCtx(newDef$407);
            var paramNames$410 = _$3.map(getParamIdentifiers(params$408), function (param$419) {
                    var freshName$420 = fresh();
                    return {
                        freshName: freshName$420,
                        originalParam: param$419,
                        renamedParam: param$419.rename(param$419, freshName$420)
                    };
                });
            var newCtx$411 = ctx$403;
            var stxBody$412 = bodies$409;
            var renamedBody$413 = _$3.reduce(paramNames$410, function (accBody$421, p$422) {
                    return accBody$421.rename(p$422.originalParam, p$422.freshName);
                }, stxBody$412);
            var bodyTerms$414 = expand([renamedBody$413], env$402, newCtx$411, newDef$407);
            parser$4.assert(bodyTerms$414.length === 1 && bodyTerms$414[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$415 = flatten(bodyTerms$414);
            var renamedParams$416 = _$3.map(paramNames$410, function (p$423) {
                    return p$423.renamedParam;
                });
            var flatArgs$417 = wrapDelim(joinSyntax(renamedParams$416, ','), term$401.params);
            var expandedArgs$418 = expand([flatArgs$417.addDefCtx(newDef$407)], env$402, ctx$403, newDef$407);
            parser$4.assert(expandedArgs$418.length === 1, 'should only get back one result');
            term$401.params = expandedArgs$418[0];
            term$401.body = _$3.map(flattenedBody$415, function (stx$424) {
                return _$3.reduce(newDef$407, function (acc$425, def$426) {
                    return acc$425.rename(def$426.id, def$426.name);
                }, stx$424);
            });
            return term$401;
        }
        return term$401;
    }
    function expand(stx$427, env$428, ctx$429, defscope$430) {
        env$428 = env$428 || new Map();
        ctx$429 = ctx$429 || new Map();
        var trees$431 = expandToTermTree(stx$427, env$428, defscope$430);
        return _$3.map(trees$431.terms, function (term$432) {
            return expandTermTreeToFinal(term$432, trees$431.env, ctx$429, defscope$430);
        });
    }
    function expandTopLevel(stx$433) {
        var funn$434 = syntaxFromToken({
                value: 'function',
                type: parser$4.Token.Keyword
            });
        var name$435 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$4.Token.Identifier
            });
        var params$436 = syntaxFromToken({
                value: '()',
                type: parser$4.Token.Delimiter,
                inner: []
            });
        var body$437 = syntaxFromToken({
                value: '{}',
                type: parser$4.Token.Delimiter,
                inner: stx$433
            });
        var res$438 = expand([
                funn$434,
                name$435,
                params$436,
                body$437
            ]);
        return _$3.map(res$438[0].body.slice(1, res$438[0].body.length - 1), function (stx$439) {
            return stx$439;
        });
    }
    function flatten(terms$440) {
        return _$3.reduce(terms$440, function (acc$441, term$442) {
            return acc$441.concat(term$442.destruct(true));
        }, []);
    }
    exports$2.enforest = enforest;
    exports$2.expand = expandTopLevel;
    exports$2.resolve = resolve;
    exports$2.flatten = flatten;
    exports$2.tokensToSyntax = tokensToSyntax;
    exports$2.syntaxToTokens = syntaxToTokens;
}));