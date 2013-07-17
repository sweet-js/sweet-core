(function (root$0, factory$1) {
    if (typeof exports === 'object') {
        factory$1(exports, require('underscore'), require('./parser'), require('es6-collections'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections'
        ], factory$1);
    } else {
        factory$1(root$0.expander = {}, root$0._, root$0.parser, root$0.es6);
    }
}(this, function (exports$2, _$3, parser$4, es6$5) {
    'use strict';
    exports$2._test = {};
    Object.prototype.create = function () {
        var o$41 = Object.create(this);
        if (typeof o$41.construct === 'function') {
            o$41.construct.apply(o$41, arguments);
        }
        return o$41;
    };
    Object.prototype.extend = function (properties$42) {
        var result$43 = Object.create(this);
        for (var prop in properties$42) {
            if (properties$42.hasOwnProperty(prop)) {
                result$43[prop] = properties$42[prop];
            }
        }
        return result$43;
    };
    Object.prototype.hasPrototype = function (proto$44) {
        function F() {
        }
        F.prototype = proto$44;
        return this instanceof F;
    };
    function throwError(msg$45) {
        throw new Error(msg$45);
    }
    function mkSyntax(value$46, type$47, stx$48) {
        return syntaxFromToken({
            type: type$47,
            value: value$46,
            lineStart: stx$48.token.lineStart,
            lineNumber: stx$48.token.lineNumber
        }, stx$48.context);
    }
    function Mark(mark$49, ctx$50) {
        return {
            mark: mark$49,
            context: ctx$50
        };
    }
    function Var(id$51) {
        return {id: id$51};
    }
    function isDef(ctx$52) {
        return ctx$52 && typeof ctx$52.defctx !== 'undefined';
    }
    var isMark$6 = function isMark$6(m$53) {
        return m$53 && typeof m$53.mark !== 'undefined';
    };
    function Rename(id$54, name$55, ctx$56, defctx$57) {
        defctx$57 = defctx$57 || null;
        return {
            id: id$54,
            name: name$55,
            context: ctx$56,
            def: defctx$57
        };
    }
    function Def(defctx$58, ctx$59) {
        return {
            defctx: defctx$58,
            context: ctx$59
        };
    }
    var isRename$7 = function (r$60) {
        return r$60 && typeof r$60.id !== 'undefined' && typeof r$60.name !== 'undefined';
    };
    var syntaxProto$8 = {
            mark: function mark(newMark$61) {
                var markedToken$62 = _$3.clone(this.token);
                if (this.token.inner) {
                    var markedInner$65 = _$3.map(this.token.inner, function (stx$66) {
                            return stx$66.mark(newMark$61);
                        });
                    markedToken$62.inner = markedInner$65;
                }
                var newMarkObj$63 = Mark(newMark$61, this.context);
                var stmp$64 = syntaxFromToken(markedToken$62, newMarkObj$63);
                return stmp$64;
            },
            rename: function (id$67, name$68) {
                if (this.token.inner) {
                    var renamedInner$69 = _$3.map(this.token.inner, function (stx$70) {
                            return stx$70.rename(id$67, name$68);
                        });
                    this.token.inner = renamedInner$69;
                }
                if (this.token.value === id$67.token.value) {
                    return syntaxFromToken(this.token, Rename(id$67, name$68, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$71) {
                if (this.token.inner) {
                    var renamedInner$72 = _$3.map(this.token.inner, function (stx$73) {
                            return stx$73.addDefCtx(defctx$71);
                        });
                    this.token.inner = renamedInner$72;
                }
                return syntaxFromToken(this.token, Def(defctx$71, this.context));
            },
            getDefCtx: function () {
                var ctx$74 = this.context;
                while (ctx$74 !== null) {
                    if (isDef(ctx$74)) {
                        return ctx$74.defctx;
                    }
                    ctx$74 = ctx$74.context;
                }
                return null;
            },
            toString: function () {
                var val$75 = this.token.type === parser$4.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$75 + ']';
            }
        };
    function syntaxFromToken(token$76, oldctx$77) {
        var ctx$78 = typeof oldctx$77 !== 'undefined' ? oldctx$77 : null;
        return Object.create(syntaxProto$8, {
            token: {
                value: token$76,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$78,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$79, mlist$80) {
        if (mark$79 === _$3.first(mlist$80)) {
            return _$3.rest(mlist$80, 1);
        }
        return [mark$79].concat(mlist$80);
    }
    function marksof(ctx$81, stopName$82, originalName$83) {
        var mark$84, submarks$85;
        if (isMark$6(ctx$81)) {
            mark$84 = ctx$81.mark;
            submarks$85 = marksof(ctx$81.context, stopName$82, originalName$83);
            return remdup(mark$84, submarks$85);
        }
        if (isDef(ctx$81)) {
            return marksof(ctx$81.context, stopName$82, originalName$83);
        }
        if (isRename$7(ctx$81)) {
            if (stopName$82 === originalName$83 + '$' + ctx$81.name) {
                return [];
            }
            return marksof(ctx$81.context, stopName$82, originalName$83);
        }
        return [];
    }
    function resolve(stx$86) {
        return resolveCtx(stx$86.token.value, stx$86.context, [], []);
    }
    function arraysEqual(a$87, b$88) {
        if (a$87.length !== b$88.length) {
            return false;
        }
        for (var i$89 = 0; i$89 < a$87.length; i$89++) {
            if (a$87[i$89] !== b$88[i$89]) {
                return false;
            }
        }
        return true;
    }
    function renames(defctx$90, oldctx$91, originalName$92) {
        var acc$93 = oldctx$91;
        defctx$90.forEach(function (def$94) {
            if (def$94.id.token.value === originalName$92) {
                acc$93 = Rename(def$94.id, def$94.name, acc$93, defctx$90);
            }
        });
        return acc$93;
    }
    function resolveCtx(originalName$95, ctx$96, stop_spine$97, stop_branch$98) {
        if (isMark$6(ctx$96)) {
            return resolveCtx(originalName$95, ctx$96.context, stop_spine$97, stop_branch$98);
        }
        if (isDef(ctx$96)) {
            if (_$3.contains(stop_spine$97, ctx$96.defctx)) {
                return resolveCtx(originalName$95, ctx$96.context, stop_spine$97, stop_branch$98);
            } else {
                return resolveCtx(originalName$95, renames(ctx$96.defctx, ctx$96.context, originalName$95), stop_spine$97, _$3.union(stop_branch$98, [ctx$96.defctx]));
            }
        }
        if (isRename$7(ctx$96)) {
            var idName$99 = resolveCtx(ctx$96.id.token.value, ctx$96.id.context, stop_branch$98, stop_branch$98);
            var subName$100 = resolveCtx(originalName$95, ctx$96.context, _$3.union(stop_spine$97, [ctx$96.def]), stop_branch$98);
            if (idName$99 === subName$100) {
                var idMarks$101 = marksof(ctx$96.id.context, originalName$95 + '$' + ctx$96.name, originalName$95);
                var subMarks$102 = marksof(ctx$96.context, originalName$95 + '$' + ctx$96.name, originalName$95);
                if (arraysEqual(idMarks$101, subMarks$102)) {
                    return originalName$95 + '$' + ctx$96.name;
                }
            }
            return resolveCtx(originalName$95, ctx$96.context, _$3.union(stop_spine$97, [ctx$96.def]), stop_branch$98);
        }
        return originalName$95;
    }
    var nextFresh$9 = 0;
    function fresh() {
        return nextFresh$9++;
    }
    ;
    function tokensToSyntax(tokens$103) {
        if (!_$3.isArray(tokens$103)) {
            tokens$103 = [tokens$103];
        }
        return _$3.map(tokens$103, function (token$104) {
            if (token$104.inner) {
                token$104.inner = tokensToSyntax(token$104.inner);
            }
            return syntaxFromToken(token$104);
        });
    }
    function syntaxToTokens(syntax$105) {
        return _$3.map(syntax$105, function (stx$106) {
            if (stx$106.token.inner) {
                stx$106.token.inner = syntaxToTokens(stx$106.token.inner);
            }
            return stx$106.token;
        });
    }
    function isPatternVar(token$107) {
        return token$107.type === parser$4.Token.Identifier && token$107.value[0] === '$' && token$107.value !== '$';
    }
    var containsPatternVar$10 = function (patterns$108) {
        return _$3.any(patterns$108, function (pat$109) {
            if (pat$109.token.type === parser$4.Token.Delimiter) {
                return containsPatternVar$10(pat$109.token.inner);
            }
            return isPatternVar(pat$109);
        });
    };
    function loadPattern(patterns$110) {
        return _$3.chain(patterns$110).reduce(function (acc$111, patStx$112, idx$113) {
            var last$114 = patterns$110[idx$113 - 1];
            var lastLast$115 = patterns$110[idx$113 - 2];
            var next$116 = patterns$110[idx$113 + 1];
            var nextNext$117 = patterns$110[idx$113 + 2];
            if (patStx$112.token.value === ':') {
                if (last$114 && isPatternVar(last$114.token)) {
                    return acc$111;
                }
            }
            if (last$114 && last$114.token.value === ':') {
                if (lastLast$115 && isPatternVar(lastLast$115.token)) {
                    return acc$111;
                }
            }
            if (patStx$112.token.value === '$' && next$116 && next$116.token.type === parser$4.Token.Delimiter) {
                return acc$111;
            }
            if (isPatternVar(patStx$112.token)) {
                if (next$116 && next$116.token.value === ':') {
                    parser$4.assert(typeof nextNext$117 !== 'undefined', 'expecting a pattern class');
                    patStx$112.class = nextNext$117.token.value;
                } else {
                    patStx$112.class = 'token';
                }
            } else if (patStx$112.token.type === parser$4.Token.Delimiter) {
                if (last$114 && last$114.token.value === '$') {
                    patStx$112.class = 'pattern_group';
                }
                patStx$112.token.inner = loadPattern(patStx$112.token.inner);
            } else {
                patStx$112.class = 'pattern_literal';
            }
            return acc$111.concat(patStx$112);
        }, []).reduce(function (acc$118, patStx$119, idx$120, patterns$121) {
            var separator$122 = ' ';
            var repeat$123 = false;
            var next$124 = patterns$121[idx$120 + 1];
            var nextNext$125 = patterns$121[idx$120 + 2];
            if (next$124 && next$124.token.value === '...') {
                repeat$123 = true;
                separator$122 = ' ';
            } else if (delimIsSeparator(next$124) && nextNext$125 && nextNext$125.token.value === '...') {
                repeat$123 = true;
                parser$4.assert(next$124.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$122 = next$124.token.inner[0].token.value;
            }
            if (patStx$119.token.value === '...' || delimIsSeparator(patStx$119) && next$124 && next$124.token.value === '...') {
                return acc$118;
            }
            patStx$119.repeat = repeat$123;
            patStx$119.separator = separator$122;
            return acc$118.concat(patStx$119);
        }, []).value();
    }
    function takeLineContext(from$126, to$127) {
        return _$3.map(to$127, function (stx$128) {
            if (stx$128.token.type === parser$4.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$4.Token.Delimiter,
                    value: stx$128.token.value,
                    inner: stx$128.token.inner,
                    startRange: from$126.range,
                    endRange: from$126.range,
                    startLineNumber: from$126.token.lineNumber,
                    startLineStart: from$126.token.lineStart,
                    endLineNumber: from$126.token.lineNumber,
                    endLineStart: from$126.token.lineStart
                }, stx$128.context);
            }
            return syntaxFromToken({
                value: stx$128.token.value,
                type: stx$128.token.type,
                lineNumber: from$126.token.lineNumber,
                lineStart: from$126.token.lineStart,
                range: from$126.token.range
            }, stx$128.context);
        });
    }
    function joinRepeatedMatch(tojoin$129, punc$130) {
        return _$3.reduce(_$3.rest(tojoin$129, 1), function (acc$131, join$132) {
            if (punc$130 === ' ') {
                return acc$131.concat(join$132.match);
            }
            return acc$131.concat(mkSyntax(punc$130, parser$4.Token.Punctuator, _$3.first(join$132.match)), join$132.match);
        }, _$3.first(tojoin$129).match);
    }
    function joinSyntax(tojoin$133, punc$134) {
        if (tojoin$133.length === 0) {
            return [];
        }
        if (punc$134 === ' ') {
            return tojoin$133;
        }
        return _$3.reduce(_$3.rest(tojoin$133, 1), function (acc$135, join$136) {
            return acc$135.concat(mkSyntax(punc$134, parser$4.Token.Punctuator, join$136), join$136);
        }, [_$3.first(tojoin$133)]);
    }
    function joinSyntaxArr(tojoin$137, punc$138) {
        if (tojoin$137.length === 0) {
            return [];
        }
        if (punc$138 === ' ') {
            return _$3.flatten(tojoin$137, true);
        }
        return _$3.reduce(_$3.rest(tojoin$137, 1), function (acc$139, join$140) {
            return acc$139.concat(mkSyntax(punc$138, parser$4.Token.Punctuator, _$3.first(join$140)), join$140);
        }, _$3.first(tojoin$137));
    }
    function delimIsSeparator(delim$141) {
        return delim$141 && delim$141.token.type === parser$4.Token.Delimiter && delim$141.token.value === '()' && delim$141.token.inner.length === 1 && delim$141.token.inner[0].token.type !== parser$4.Token.Delimiter && !containsPatternVar$10(delim$141.token.inner);
    }
    function freeVarsInPattern(pattern$142) {
        var fv$143 = [];
        _$3.each(pattern$142, function (pat$144) {
            if (isPatternVar(pat$144.token)) {
                fv$143.push(pat$144.token.value);
            } else if (pat$144.token.type === parser$4.Token.Delimiter) {
                fv$143 = fv$143.concat(freeVarsInPattern(pat$144.token.inner));
            }
        });
        return fv$143;
    }
    function patternLength(patterns$145) {
        return _$3.reduce(patterns$145, function (acc$146, pat$147) {
            if (pat$147.token.type === parser$4.Token.Delimiter) {
                return acc$146 + 1 + patternLength(pat$147.token.inner);
            }
            return acc$146 + 1;
        }, 0);
    }
    function matchStx(value$148, stx$149) {
        return stx$149 && stx$149.token && stx$149.token.value === value$148;
    }
    function wrapDelim(towrap$150, delimSyntax$151) {
        parser$4.assert(delimSyntax$151.token.type === parser$4.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$4.Token.Delimiter,
            value: delimSyntax$151.token.value,
            inner: towrap$150,
            range: delimSyntax$151.token.range,
            startLineNumber: delimSyntax$151.token.startLineNumber,
            lineStart: delimSyntax$151.token.lineStart
        }, delimSyntax$151.context);
    }
    function getParamIdentifiers(argSyntax$152) {
        parser$4.assert(argSyntax$152.token.type === parser$4.Token.Delimiter, 'expecting delimiter for function params');
        return _$3.filter(argSyntax$152.token.inner, function (stx$153) {
            return stx$153.token.value !== ',';
        });
    }
    function isFunctionStx(stx$154) {
        return stx$154 && stx$154.token.type === parser$4.Token.Keyword && stx$154.token.value === 'function';
    }
    function isVarStx(stx$155) {
        return stx$155 && stx$155.token.type === parser$4.Token.Keyword && stx$155.token.value === 'var';
    }
    function varNamesInAST(ast$156) {
        return _$3.map(ast$156, function (item$157) {
            return item$157.id.name;
        });
    }
    var TermTree$11 = {destruct: function (breakDelim$158) {
                return _$3.reduce(this.properties, _$3.bind(function (acc$159, prop$160) {
                    if (this[prop$160] && this[prop$160].hasPrototype(TermTree$11)) {
                        return acc$159.concat(this[prop$160].destruct(breakDelim$158));
                    } else if (this[prop$160]) {
                        return acc$159.concat(this[prop$160]);
                    } else {
                        return acc$159;
                    }
                }, this), []);
            }};
    var EOF$12 = TermTree$11.extend({
            properties: ['eof'],
            construct: function (e$161) {
                this.eof = e$161;
            }
        });
    var Statement$13 = TermTree$11.extend({construct: function () {
            }});
    var Expr$14 = TermTree$11.extend({construct: function () {
            }});
    var PrimaryExpression$15 = Expr$14.extend({construct: function () {
            }});
    var ThisExpression$16 = PrimaryExpression$15.extend({
            properties: ['this'],
            construct: function (that$162) {
                this.this = that$162;
            }
        });
    var Lit$17 = PrimaryExpression$15.extend({
            properties: ['lit'],
            construct: function (l$163) {
                this.lit = l$163;
            }
        });
    exports$2._test.PropertyAssignment = PropertyAssignment$18;
    var PropertyAssignment$18 = TermTree$11.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$164, assignment$165) {
                this.propName = propName$164;
                this.assignment = assignment$165;
            }
        });
    var Block$19 = PrimaryExpression$15.extend({
            properties: ['body'],
            construct: function (body$166) {
                this.body = body$166;
            }
        });
    var ArrayLiteral$20 = PrimaryExpression$15.extend({
            properties: ['array'],
            construct: function (ar$167) {
                this.array = ar$167;
            }
        });
    var ParenExpression$21 = PrimaryExpression$15.extend({
            properties: ['expr'],
            construct: function (expr$168) {
                this.expr = expr$168;
            }
        });
    var UnaryOp$22 = Expr$14.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$169, expr$170) {
                this.op = op$169;
                this.expr = expr$170;
            }
        });
    var PostfixOp$23 = Expr$14.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$171, op$172) {
                this.expr = expr$171;
                this.op = op$172;
            }
        });
    var BinOp$24 = Expr$14.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$173, left$174, right$175) {
                this.op = op$173;
                this.left = left$174;
                this.right = right$175;
            }
        });
    var ConditionalExpression$25 = Expr$14.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$176, question$177, tru$178, colon$179, fls$180) {
                this.cond = cond$176;
                this.question = question$177;
                this.tru = tru$178;
                this.colon = colon$179;
                this.fls = fls$180;
            }
        });
    var Keyword$26 = TermTree$11.extend({
            properties: ['keyword'],
            construct: function (k$181) {
                this.keyword = k$181;
            }
        });
    var Punc$27 = TermTree$11.extend({
            properties: ['punc'],
            construct: function (p$182) {
                this.punc = p$182;
            }
        });
    var Delimiter$28 = TermTree$11.extend({
            properties: ['delim'],
            destruct: function (breakDelim$183) {
                parser$4.assert(this.delim, 'expecting delim to be defined');
                var innerStx$184 = _$3.reduce(this.delim.token.inner, function (acc$185, term$186) {
                        if (term$186.hasPrototype(TermTree$11)) {
                            return acc$185.concat(term$186.destruct(breakDelim$183));
                        } else {
                            return acc$185.concat(term$186);
                        }
                    }, []);
                if (breakDelim$183) {
                    var openParen$187 = syntaxFromToken({
                            type: parser$4.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$188 = syntaxFromToken({
                            type: parser$4.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$187].concat(innerStx$184).concat(closeParen$188);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$189) {
                this.delim = d$189;
            }
        });
    var Id$29 = PrimaryExpression$15.extend({
            properties: ['id'],
            construct: function (id$190) {
                this.id = id$190;
            }
        });
    var NamedFun$30 = Expr$14.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$191, name$192, params$193, body$194) {
                this.keyword = keyword$191;
                this.name = name$192;
                this.params = params$193;
                this.body = body$194;
            }
        });
    var AnonFun$31 = Expr$14.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$195, params$196, body$197) {
                this.keyword = keyword$195;
                this.params = params$196;
                this.body = body$197;
            }
        });
    var Macro$32 = TermTree$11.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$198, body$199) {
                this.name = name$198;
                this.body = body$199;
            }
        });
    var Const$33 = Expr$14.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$200, call$201) {
                this.newterm = newterm$200;
                this.call = call$201;
            }
        });
    var Call$34 = Expr$14.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$202) {
                parser$4.assert(this.fun.hasPrototype(TermTree$11), 'expecting a term tree in destruct of call');
                var that$203 = this;
                this.delim = syntaxFromToken(_$3.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$3.reduce(this.args, function (acc$204, term$205) {
                    parser$4.assert(term$205 && term$205.hasPrototype(TermTree$11), 'expecting term trees in destruct of Call');
                    var dst$206 = acc$204.concat(term$205.destruct(breakDelim$202));
                    if (that$203.commas.length > 0) {
                        dst$206 = dst$206.concat(that$203.commas.shift());
                    }
                    return dst$206;
                }, []);
                return this.fun.destruct(breakDelim$202).concat(Delimiter$28.create(this.delim).destruct(breakDelim$202));
            },
            construct: function (funn$207, args$208, delim$209, commas$210) {
                parser$4.assert(Array.isArray(args$208), 'requires an array of arguments terms');
                this.fun = funn$207;
                this.args = args$208;
                this.delim = delim$209;
                this.commas = commas$210;
            }
        });
    var ObjDotGet$35 = Expr$14.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$211, dot$212, right$213) {
                this.left = left$211;
                this.dot = dot$212;
                this.right = right$213;
            }
        });
    var ObjGet$36 = Expr$14.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$214, right$215) {
                this.left = left$214;
                this.right = right$215;
            }
        });
    var VariableDeclaration$37 = TermTree$11.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$216, eqstx$217, init$218, comma$219) {
                this.ident = ident$216;
                this.eqstx = eqstx$217;
                this.init = init$218;
                this.comma = comma$219;
            }
        });
    var VariableStatement$38 = Statement$13.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$220) {
                return this.varkw.destruct(breakDelim$220).concat(_$3.reduce(this.decls, function (acc$221, decl$222) {
                    return acc$221.concat(decl$222.destruct(breakDelim$220));
                }, []));
            },
            construct: function (varkw$223, decls$224) {
                parser$4.assert(Array.isArray(decls$224), 'decls must be an array');
                this.varkw = varkw$223;
                this.decls = decls$224;
            }
        });
    var CatchClause$39 = TermTree$11.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$225, params$226, body$227) {
                this.catchkw = catchkw$225;
                this.params = params$226;
                this.body = body$227;
            }
        });
    var Empty$40 = TermTree$11.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$228) {
        var staticOperators$229 = [
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
        return _$3.contains(staticOperators$229, stx$228.token.value);
    }
    function stxIsBinOp(stx$230) {
        var staticOperators$231 = [
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
        return _$3.contains(staticOperators$231, stx$230.token.value);
    }
    function enforestVarStatement(stx$232, env$233) {
        parser$4.assert(stx$232[0] && stx$232[0].token.type === parser$4.Token.Identifier, 'must start at the identifier');
        var decls$234 = [], rest$235 = stx$232, initRes$236, subRes$237;
        if (stx$232[1] && stx$232[1].token.type === parser$4.Token.Punctuator && stx$232[1].token.value === '=') {
            initRes$236 = enforest(stx$232.slice(2), env$233);
            if (initRes$236.result.hasPrototype(Expr$14)) {
                rest$235 = initRes$236.rest;
                if (initRes$236.rest[0].token.type === parser$4.Token.Punctuator && initRes$236.rest[0].token.value === ',' && initRes$236.rest[1] && initRes$236.rest[1].token.type === parser$4.Token.Identifier) {
                    decls$234.push(VariableDeclaration$37.create(stx$232[0], stx$232[1], initRes$236.result, initRes$236.rest[0]));
                    subRes$237 = enforestVarStatement(initRes$236.rest.slice(1), env$233);
                    decls$234 = decls$234.concat(subRes$237.result);
                    rest$235 = subRes$237.rest;
                } else {
                    decls$234.push(VariableDeclaration$37.create(stx$232[0], stx$232[1], initRes$236.result));
                }
            } else {
                parser$4.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$232[1] && stx$232[1].token.type === parser$4.Token.Punctuator && stx$232[1].token.value === ',') {
            decls$234.push(VariableDeclaration$37.create(stx$232[0], null, null, stx$232[1]));
            subRes$237 = enforestVarStatement(stx$232.slice(2), env$233);
            decls$234 = decls$234.concat(subRes$237.result);
            rest$235 = subRes$237.rest;
        } else {
            decls$234.push(VariableDeclaration$37.create(stx$232[0]));
            rest$235 = stx$232.slice(1);
        }
        return {
            result: decls$234,
            rest: rest$235
        };
    }
    function enforest(toks$238, env$239) {
        env$239 = env$239 || new Map();
        parser$4.assert(toks$238.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$240, rest$241) {
            var innerTokens$242;
            parser$4.assert(Array.isArray(rest$241), 'result must at least be an empty array');
            if (head$240.hasPrototype(TermTree$11)) {
                if (head$240.hasPrototype(Expr$14) && rest$241[0] && rest$241[0].token.type === parser$4.Token.Delimiter && rest$241[0].token.value === '()') {
                    var argRes$243, enforestedArgs$244 = [], commas$245 = [];
                    innerTokens$242 = rest$241[0].token.inner;
                    while (innerTokens$242.length > 0) {
                        argRes$243 = enforest(innerTokens$242, env$239);
                        enforestedArgs$244.push(argRes$243.result);
                        innerTokens$242 = argRes$243.rest;
                        if (innerTokens$242[0] && innerTokens$242[0].token.value === ',') {
                            commas$245.push(innerTokens$242[0]);
                            innerTokens$242 = innerTokens$242.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$246 = _$3.all(enforestedArgs$244, function (argTerm$247) {
                            return argTerm$247.hasPrototype(Expr$14);
                        });
                    if (innerTokens$242.length === 0 && argsAreExprs$246) {
                        return step(Call$34.create(head$240, enforestedArgs$244, rest$241[0], commas$245), rest$241.slice(1));
                    }
                } else if (head$240.hasPrototype(Keyword$26) && head$240.keyword.token.value === 'new' && rest$241[0]) {
                    var newCallRes$248 = enforest(rest$241, env$239);
                    if (newCallRes$248.result.hasPrototype(Call$34)) {
                        return step(Const$33.create(head$240, newCallRes$248.result), newCallRes$248.rest);
                    }
                } else if (head$240.hasPrototype(Expr$14) && rest$241[0] && rest$241[0].token.value === '?') {
                    var question$249 = rest$241[0];
                    var condRes$250 = enforest(rest$241.slice(1), env$239);
                    var truExpr$251 = condRes$250.result;
                    var right$260 = condRes$250.rest;
                    if (truExpr$251.hasPrototype(Expr$14) && right$260[0] && right$260[0].token.value === ':') {
                        var colon$253 = right$260[0];
                        var flsRes$254 = enforest(right$260.slice(1), env$239);
                        var flsExpr$255 = flsRes$254.result;
                        if (flsExpr$255.hasPrototype(Expr$14)) {
                            return step(ConditionalExpression$25.create(head$240, question$249, truExpr$251, colon$253, flsExpr$255), flsRes$254.rest);
                        }
                    }
                } else if (head$240.hasPrototype(Delimiter$28) && head$240.delim.token.value === '()') {
                    innerTokens$242 = head$240.delim.token.inner;
                    if (innerTokens$242.length === 0) {
                        return step(ParenExpression$21.create(head$240), rest$241);
                    } else {
                        var innerTerm$256 = get_expression(innerTokens$242, env$239);
                        if (innerTerm$256.result && innerTerm$256.result.hasPrototype(Expr$14)) {
                            return step(ParenExpression$21.create(head$240), rest$241);
                        }
                    }
                } else if (rest$241[0] && rest$241[1] && stxIsBinOp(rest$241[0])) {
                    var op$262 = rest$241[0];
                    var left$258 = head$240;
                    var bopRes$259 = enforest(rest$241.slice(1), env$239);
                    var right$260 = bopRes$259.result;
                    if (right$260.hasPrototype(Expr$14)) {
                        return step(BinOp$24.create(op$262, left$258, right$260), bopRes$259.rest);
                    }
                } else if (head$240.hasPrototype(Punc$27) && stxIsUnaryOp(head$240.punc) || head$240.hasPrototype(Keyword$26) && stxIsUnaryOp(head$240.keyword)) {
                    var unopRes$261 = enforest(rest$241);
                    var op$262 = head$240.hasPrototype(Punc$27) ? head$240.punc : head$240.keyword;
                    if (unopRes$261.result.hasPrototype(Expr$14)) {
                        return step(UnaryOp$22.create(op$262, unopRes$261.result), unopRes$261.rest);
                    }
                } else if (head$240.hasPrototype(Expr$14) && rest$241[0] && (rest$241[0].token.value === '++' || rest$241[0].token.value === '--')) {
                    return step(PostfixOp$23.create(head$240, rest$241[0]), rest$241.slice(1));
                } else if (head$240.hasPrototype(Expr$14) && rest$241[0] && rest$241[0].token.value === '[]') {
                    var getRes$263 = enforest(rest$241[0].token.inner, env$239);
                    var resStx$264 = mkSyntax('[]', parser$4.Token.Delimiter, rest$241[0]);
                    resStx$264.token.inner = [getRes$263.result];
                    if (getRes$263.rest.length > 0) {
                        return step(ObjGet$36.create(head$240, Delimiter$28.create(resStx$264)), rest$241.slice(1));
                    }
                } else if (head$240.hasPrototype(Expr$14) && rest$241[0] && rest$241[0].token.value === '.' && rest$241[1] && rest$241[1].token.type === parser$4.Token.Identifier) {
                    return step(ObjDotGet$35.create(head$240, rest$241[0], rest$241[1]), rest$241.slice(2));
                } else if (head$240.hasPrototype(Delimiter$28) && head$240.delim.token.value === '[]') {
                    return step(ArrayLiteral$20.create(head$240), rest$241);
                } else if (head$240.hasPrototype(Delimiter$28) && head$240.delim.token.value === '{}') {
                    innerTokens$242 = head$240.delim.token.inner;
                    return step(Block$19.create(head$240), rest$241);
                } else if (head$240.hasPrototype(Keyword$26) && head$240.keyword.token.value === 'var' && rest$241[0] && rest$241[0].token.type === parser$4.Token.Identifier) {
                    var vsRes$265 = enforestVarStatement(rest$241, env$239);
                    if (vsRes$265) {
                        return step(VariableStatement$38.create(head$240, vsRes$265.result), vsRes$265.rest);
                    }
                }
            } else {
                parser$4.assert(head$240 && head$240.token, 'assuming head is a syntax object');
                if ((head$240.token.type === parser$4.Token.Identifier || head$240.token.type === parser$4.Token.Keyword) && env$239.has(head$240.token.value)) {
                    var transformer$266 = env$239.get(head$240.token.value);
                    var rt$267 = transformer$266(rest$241, head$240, env$239);
                    if (rt$267.result.length > 0) {
                        return step(rt$267.result[0], rt$267.result.slice(1).concat(rt$267.rest));
                    } else {
                        return step(Empty$40.create(), rt$267.rest);
                    }
                } else if (head$240.token.type === parser$4.Token.Identifier && head$240.token.value === 'macro' && rest$241[0] && (rest$241[0].token.type === parser$4.Token.Identifier || rest$241[0].token.type === parser$4.Token.Keyword) && rest$241[1] && rest$241[1].token.type === parser$4.Token.Delimiter && rest$241[1].token.value === '{}') {
                    return step(Macro$32.create(rest$241[0], rest$241[1].token.inner), rest$241.slice(2));
                } else if (head$240.token.type === parser$4.Token.Keyword && head$240.token.value === 'function' && rest$241[0] && rest$241[0].token.type === parser$4.Token.Identifier && rest$241[1] && rest$241[1].token.type === parser$4.Token.Delimiter && rest$241[1].token.value === '()' && rest$241[2] && rest$241[2].token.type === parser$4.Token.Delimiter && rest$241[2].token.value === '{}') {
                    return step(NamedFun$30.create(head$240, rest$241[0], rest$241[1], rest$241[2]), rest$241.slice(3));
                } else if (head$240.token.type === parser$4.Token.Keyword && head$240.token.value === 'function' && rest$241[0] && rest$241[0].token.type === parser$4.Token.Delimiter && rest$241[0].token.value === '()' && rest$241[1] && rest$241[1].token.type === parser$4.Token.Delimiter && rest$241[1].token.value === '{}') {
                    return step(AnonFun$31.create(head$240, rest$241[0], rest$241[1]), rest$241.slice(2));
                } else if (head$240.token.type === parser$4.Token.Keyword && head$240.token.value === 'catch' && rest$241[0] && rest$241[0].token.type === parser$4.Token.Delimiter && rest$241[0].token.value === '()' && rest$241[1] && rest$241[1].token.type === parser$4.Token.Delimiter && rest$241[1].token.value === '{}') {
                    return step(CatchClause$39.create(head$240, rest$241[0], rest$241[1]), rest$241.slice(2));
                } else if (head$240.token.type === parser$4.Token.Keyword && head$240.token.value === 'this') {
                    return step(ThisExpression$16.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.NumericLiteral || head$240.token.type === parser$4.Token.StringLiteral || head$240.token.type === parser$4.Token.BooleanLiteral || head$240.token.type === parser$4.Token.RegexLiteral || head$240.token.type === parser$4.Token.NullLiteral) {
                    return step(Lit$17.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.Identifier) {
                    return step(Id$29.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.Punctuator) {
                    return step(Punc$27.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.Keyword && head$240.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$240.token.type === parser$4.Token.Keyword) {
                    return step(Keyword$26.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.Delimiter) {
                    return step(Delimiter$28.create(head$240), rest$241);
                } else if (head$240.token.type === parser$4.Token.EOF) {
                    parser$4.assert(rest$241.length === 0, 'nothing should be after an EOF');
                    return step(EOF$12.create(head$240), []);
                } else {
                    parser$4.assert(false, 'not implemented');
                }
            }
            return {
                result: head$240,
                rest: rest$241
            };
        }
        return step(toks$238[0], toks$238.slice(1));
    }
    function get_expression(stx$268, env$269) {
        var res$270 = enforest(stx$268, env$269);
        if (!res$270.result.hasPrototype(Expr$14)) {
            return {
                result: null,
                rest: stx$268
            };
        }
        return res$270;
    }
    function typeIsLiteral(type$271) {
        return type$271 === parser$4.Token.NullLiteral || type$271 === parser$4.Token.NumericLiteral || type$271 === parser$4.Token.StringLiteral || type$271 === parser$4.Token.RegexLiteral || type$271 === parser$4.Token.BooleanLiteral;
    }
    exports$2._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$272, stx$273, env$274) {
        var result$275, rest$276;
        if (patternClass$272 === 'token' && stx$273[0] && stx$273[0].token.type !== parser$4.Token.EOF) {
            result$275 = [stx$273[0]];
            rest$276 = stx$273.slice(1);
        } else if (patternClass$272 === 'lit' && stx$273[0] && typeIsLiteral(stx$273[0].token.type)) {
            result$275 = [stx$273[0]];
            rest$276 = stx$273.slice(1);
        } else if (patternClass$272 === 'ident' && stx$273[0] && stx$273[0].token.type === parser$4.Token.Identifier) {
            result$275 = [stx$273[0]];
            rest$276 = stx$273.slice(1);
        } else if (patternClass$272 === 'VariableStatement') {
            var match$278 = enforest(stx$273, env$274);
            if (match$278.result && match$278.result.hasPrototype(VariableStatement$38)) {
                result$275 = match$278.result.destruct(false);
                rest$276 = match$278.rest;
            } else {
                result$275 = null;
                rest$276 = stx$273;
            }
        } else if (patternClass$272 === 'expr') {
            var match$278 = get_expression(stx$273, env$274);
            if (match$278.result === null || !match$278.result.hasPrototype(Expr$14)) {
                result$275 = null;
                rest$276 = stx$273;
            } else {
                result$275 = match$278.result.destruct(false);
                rest$276 = match$278.rest;
            }
        } else {
            result$275 = null;
            rest$276 = stx$273;
        }
        return {
            result: result$275,
            rest: rest$276
        };
    }
    function matchPattern(pattern$279, stx$280, env$281, patternEnv$282) {
        var subMatch$283;
        var match$284, matchEnv$285;
        var rest$286;
        var success$287;
        if (stx$280.length === 0) {
            return {
                success: false,
                rest: stx$280,
                patternEnv: patternEnv$282
            };
        }
        parser$4.assert(stx$280.length > 0, 'should have had something to match here');
        if (pattern$279.token.type === parser$4.Token.Delimiter) {
            if (pattern$279.class === 'pattern_group') {
                subMatch$283 = matchPatterns(pattern$279.token.inner, stx$280, env$281, false);
                rest$286 = subMatch$283.rest;
            } else if (stx$280[0].token.type === parser$4.Token.Delimiter && stx$280[0].token.value === pattern$279.token.value) {
                subMatch$283 = matchPatterns(pattern$279.token.inner, stx$280[0].token.inner, env$281, false);
                rest$286 = stx$280.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$280,
                    patternEnv: patternEnv$282
                };
            }
            success$287 = subMatch$283.success;
            _$3.keys(subMatch$283.patternEnv).forEach(function (patternKey$288) {
                if (pattern$279.repeat) {
                    var nextLevel$289 = subMatch$283.patternEnv[patternKey$288].level + 1;
                    if (patternEnv$282[patternKey$288]) {
                        patternEnv$282[patternKey$288].level = nextLevel$289;
                        patternEnv$282[patternKey$288].match.push(subMatch$283.patternEnv[patternKey$288]);
                    } else {
                        patternEnv$282[patternKey$288] = {
                            level: nextLevel$289,
                            match: [subMatch$283.patternEnv[patternKey$288]]
                        };
                    }
                } else {
                    patternEnv$282[patternKey$288] = subMatch$283.patternEnv[patternKey$288];
                }
            });
        } else {
            if (pattern$279.class === 'pattern_literal') {
                if (pattern$279.token.value === stx$280[0].token.value) {
                    success$287 = true;
                    rest$286 = stx$280.slice(1);
                } else {
                    success$287 = false;
                    rest$286 = stx$280;
                }
            } else {
                match$284 = matchPatternClass(pattern$279.class, stx$280, env$281);
                success$287 = match$284.result !== null;
                rest$286 = match$284.rest;
                matchEnv$285 = {
                    level: 0,
                    match: match$284.result
                };
                if (match$284.result !== null) {
                    if (pattern$279.repeat) {
                        if (patternEnv$282[pattern$279.token.value]) {
                            patternEnv$282[pattern$279.token.value].match.push(matchEnv$285);
                        } else {
                            patternEnv$282[pattern$279.token.value] = {
                                level: 1,
                                match: [matchEnv$285]
                            };
                        }
                    } else {
                        patternEnv$282[pattern$279.token.value] = matchEnv$285;
                    }
                }
            }
        }
        return {
            success: success$287,
            rest: rest$286,
            patternEnv: patternEnv$282
        };
    }
    function matchPatterns(patterns$290, stx$291, env$292, topLevel$293) {
        topLevel$293 = topLevel$293 || false;
        var result$294 = [];
        var patternEnv$295 = {};
        var match$296;
        var pattern$297;
        var rest$298 = stx$291;
        var success$299 = true;
        for (var i$300 = 0; i$300 < patterns$290.length; i$300++) {
            pattern$297 = patterns$290[i$300];
            do {
                match$296 = matchPattern(pattern$297, rest$298, env$292, patternEnv$295);
                if (!match$296.success) {
                    success$299 = false;
                }
                rest$298 = match$296.rest;
                patternEnv$295 = match$296.patternEnv;
                if (pattern$297.repeat && success$299) {
                    if (rest$298[0] && rest$298[0].token.value === pattern$297.separator) {
                        rest$298 = rest$298.slice(1);
                    } else if (pattern$297.separator === ' ') {
                        continue;
                    } else if (pattern$297.separator !== ' ' && rest$298.length > 0 && i$300 === patterns$290.length - 1 && topLevel$293 === false) {
                        success$299 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$297.repeat && match$296.success && rest$298.length > 0);
        }
        return {
            success: success$299,
            rest: rest$298,
            patternEnv: patternEnv$295
        };
    }
    function transcribe(macroBody$301, macroNameStx$302, env$303) {
        return _$3.chain(macroBody$301).reduce(function (acc$304, bodyStx$305, idx$306, original$307) {
            var last$308 = original$307[idx$306 - 1];
            var next$309 = original$307[idx$306 + 1];
            var nextNext$310 = original$307[idx$306 + 2];
            if (bodyStx$305.token.value === '...') {
                return acc$304;
            }
            if (delimIsSeparator(bodyStx$305) && next$309 && next$309.token.value === '...') {
                return acc$304;
            }
            if (bodyStx$305.token.value === '$' && next$309 && next$309.token.type === parser$4.Token.Delimiter && next$309.token.value === '()') {
                return acc$304;
            }
            if (bodyStx$305.token.value === '$' && next$309 && next$309.token.type === parser$4.Token.Delimiter && next$309.token.value === '[]') {
                next$309.literal = true;
                return acc$304;
            }
            if (bodyStx$305.token.type === parser$4.Token.Delimiter && bodyStx$305.token.value === '()' && last$308 && last$308.token.value === '$') {
                bodyStx$305.group = true;
            }
            if (bodyStx$305.literal === true) {
                parser$4.assert(bodyStx$305.token.type === parser$4.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$304.concat(bodyStx$305.token.inner);
            }
            if (next$309 && next$309.token.value === '...') {
                bodyStx$305.repeat = true;
                bodyStx$305.separator = ' ';
            } else if (delimIsSeparator(next$309) && nextNext$310 && nextNext$310.token.value === '...') {
                bodyStx$305.repeat = true;
                bodyStx$305.separator = next$309.token.inner[0].token.value;
            }
            return acc$304.concat(bodyStx$305);
        }, []).reduce(function (acc$311, bodyStx$312, idx$313) {
            if (bodyStx$312.repeat) {
                if (bodyStx$312.token.type === parser$4.Token.Delimiter) {
                    var fv$314 = _$3.filter(freeVarsInPattern(bodyStx$312.token.inner), function (pat$321) {
                            return env$303.hasOwnProperty(pat$321);
                        });
                    var restrictedEnv$315 = [];
                    var nonScalar$316 = _$3.find(fv$314, function (pat$322) {
                            return env$303[pat$322].level > 0;
                        });
                    parser$4.assert(typeof nonScalar$316 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$317 = env$303[nonScalar$316].match.length;
                    var sameLength$318 = _$3.all(fv$314, function (pat$323) {
                            return env$303[pat$323].level === 0 || env$303[pat$323].match.length === repeatLength$317;
                        });
                    parser$4.assert(sameLength$318, 'all non-scalars must have the same length');
                    restrictedEnv$315 = _$3.map(_$3.range(repeatLength$317), function (idx$324) {
                        var renv$325 = {};
                        _$3.each(fv$314, function (pat$326) {
                            if (env$303[pat$326].level === 0) {
                                renv$325[pat$326] = env$303[pat$326];
                            } else {
                                renv$325[pat$326] = env$303[pat$326].match[idx$324];
                            }
                        });
                        return renv$325;
                    });
                    var transcribed$319 = _$3.map(restrictedEnv$315, function (renv$327) {
                            if (bodyStx$312.group) {
                                return transcribe(bodyStx$312.token.inner, macroNameStx$302, renv$327);
                            } else {
                                var newBody$328 = syntaxFromToken(_$3.clone(bodyStx$312.token), bodyStx$312.context);
                                newBody$328.token.inner = transcribe(bodyStx$312.token.inner, macroNameStx$302, renv$327);
                                return newBody$328;
                            }
                        });
                    var joined$320;
                    if (bodyStx$312.group) {
                        joined$320 = joinSyntaxArr(transcribed$319, bodyStx$312.separator);
                    } else {
                        joined$320 = joinSyntax(transcribed$319, bodyStx$312.separator);
                    }
                    return acc$311.concat(joined$320);
                }
                parser$4.assert(env$303[bodyStx$312.token.value].level === 1, 'ellipses level does not match');
                return acc$311.concat(joinRepeatedMatch(env$303[bodyStx$312.token.value].match, bodyStx$312.separator));
            } else {
                if (bodyStx$312.token.type === parser$4.Token.Delimiter) {
                    var newBody$329 = syntaxFromToken(_$3.clone(bodyStx$312.token), macroBody$301.context);
                    newBody$329.token.inner = transcribe(bodyStx$312.token.inner, macroNameStx$302, env$303);
                    return acc$311.concat(newBody$329);
                }
                if (Object.prototype.hasOwnProperty.bind(env$303)(bodyStx$312.token.value)) {
                    parser$4.assert(env$303[bodyStx$312.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$312.token.value);
                    return acc$311.concat(takeLineContext(macroNameStx$302, env$303[bodyStx$312.token.value].match));
                }
                return acc$311.concat(takeLineContext(macroNameStx$302, [bodyStx$312]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$330, env$331) {
        function dfs(match$332) {
            if (match$332.level === 0) {
                match$332.match = _$3.map(match$332.match, function (stx$333) {
                    return stx$333.mark(newMark$330);
                });
            } else {
                _$3.each(match$332.match, function (match$334) {
                    dfs(match$334);
                });
            }
        }
        _$3.keys(env$331).forEach(function (key$335) {
            dfs(env$331[key$335]);
        });
    }
    function makeTransformer(cases$336, macroName$337) {
        var sortedCases$338 = _$3.sortBy(cases$336, function (mcase$339) {
                return patternLength(mcase$339.pattern);
            }).reverse();
        return function transformer(stx$340, macroNameStx$341, env$342) {
            var match$343;
            var casePattern$344, caseBody$345;
            var newMark$346;
            var macroResult$347;
            for (var i$348 = 0; i$348 < sortedCases$338.length; i$348++) {
                casePattern$344 = sortedCases$338[i$348].pattern;
                caseBody$345 = sortedCases$338[i$348].body;
                match$343 = matchPatterns(casePattern$344, stx$340, env$342, true);
                if (match$343.success) {
                    newMark$346 = fresh();
                    applyMarkToPatternEnv(newMark$346, match$343.patternEnv);
                    macroResult$347 = transcribe(caseBody$345, macroNameStx$341, match$343.patternEnv);
                    macroResult$347 = _$3.map(macroResult$347, function (stx$349) {
                        return stx$349.mark(newMark$346);
                    });
                    return {
                        result: macroResult$347,
                        rest: match$343.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$341.token.value);
        };
    }
    function findCase(start$350, stx$351) {
        parser$4.assert(start$350 >= 0 && start$350 < stx$351.length, 'start out of bounds');
        var idx$352 = start$350;
        while (idx$352 < stx$351.length) {
            if (stx$351[idx$352].token.value === 'case') {
                return idx$352;
            }
            idx$352++;
        }
        return -1;
    }
    function findCaseArrow(start$353, stx$354) {
        parser$4.assert(start$353 >= 0 && start$353 < stx$354.length, 'start out of bounds');
        var idx$355 = start$353;
        while (idx$355 < stx$354.length) {
            if (stx$354[idx$355].token.value === '=' && stx$354[idx$355 + 1] && stx$354[idx$355 + 1].token.value === '>') {
                return idx$355;
            }
            idx$355++;
        }
        return -1;
    }
    function loadMacroDef(mac$356) {
        var body$357 = mac$356.body;
        var caseOffset$358 = 0;
        var arrowOffset$359 = 0;
        var casePattern$360;
        var caseBody$361;
        var caseBodyIdx$362;
        var cases$363 = [];
        while (caseOffset$358 < body$357.length && body$357[caseOffset$358].token.value === 'case') {
            arrowOffset$359 = findCaseArrow(caseOffset$358, body$357);
            if (arrowOffset$359 > 0 && arrowOffset$359 < body$357.length) {
                caseBodyIdx$362 = arrowOffset$359 + 2;
                if (caseBodyIdx$362 >= body$357.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$360 = body$357.slice(caseOffset$358 + 1, arrowOffset$359);
                caseBody$361 = body$357[caseBodyIdx$362].token.inner;
                cases$363.push({
                    pattern: loadPattern(casePattern$360, mac$356.name),
                    body: caseBody$361
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$358 = findCase(arrowOffset$359, body$357);
            if (caseOffset$358 < 0) {
                break;
            }
        }
        return makeTransformer(cases$363);
    }
    function expandToTermTree(stx$364, env$365, defscope$366) {
        parser$4.assert(env$365, 'environment map is required');
        if (stx$364.length === 0) {
            return {
                terms: [],
                env: env$365
            };
        }
        parser$4.assert(stx$364[0].token, 'expecting a syntax object');
        var f$367 = enforest(stx$364, env$365);
        var head$368 = f$367.result;
        var rest$369 = f$367.rest;
        if (head$368.hasPrototype(Macro$32)) {
            var macroDefinition$371 = loadMacroDef(head$368);
            env$365.set(head$368.name.token.value, macroDefinition$371);
            return expandToTermTree(rest$369, env$365, defscope$366);
        }
        if (head$368.hasPrototype(VariableStatement$38)) {
            addVarsToDefinitionCtx(head$368, defscope$366);
        }
        if (head$368.hasPrototype(Block$19) && head$368.body.hasPrototype(Delimiter$28)) {
            head$368.body.delim.token.inner.forEach(function (term$372) {
                addVarsToDefinitionCtx(term$372, defscope$366);
            });
        }
        if (head$368.hasPrototype(Delimiter$28)) {
            head$368.delim.token.inner.forEach(function (term$373) {
                addVarsToDefinitionCtx(term$373, defscope$366);
            });
        }
        var trees$370 = expandToTermTree(rest$369, env$365, defscope$366);
        return {
            terms: [head$368].concat(trees$370.terms),
            env: trees$370.env
        };
    }
    function addVarsToDefinitionCtx(term$374, defscope$375) {
        if (term$374.hasPrototype(VariableStatement$38)) {
            term$374.decls.forEach(function (decl$376) {
                var defctx$377 = defscope$375;
                parser$4.assert(defctx$377, 'no definition context found but there should always be one');
                var declRepeat$378 = _$3.find(defctx$377, function (def$379) {
                        return def$379.id.token.value === decl$376.ident.token.value && arraysEqual(marksof(def$379.id.context), marksof(decl$376.ident.context));
                    });
                if (declRepeat$378 !== null) {
                    var name$380 = fresh();
                    defctx$377.push({
                        id: decl$376.ident,
                        name: name$380
                    });
                }
            });
        }
    }
    function getVarDeclIdentifiers(term$381) {
        var toCheck$382;
        if (term$381.hasPrototype(Block$19) && term$381.body.hasPrototype(Delimiter$28)) {
            toCheck$382 = term$381.body.delim.token.inner;
        } else if (term$381.hasPrototype(Delimiter$28)) {
            toCheck$382 = term$381.delim.token.inner;
        } else {
            parser$4.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$3.reduce(toCheck$382, function (acc$383, curr$384, idx$385, list$386) {
            var prev$387 = list$386[idx$385 - 1];
            if (curr$384.hasPrototype(VariableStatement$38)) {
                return _$3.reduce(curr$384.decls, function (acc$388, decl$389) {
                    return acc$388.concat(decl$389.ident);
                }, acc$383);
            } else if (prev$387 && prev$387.hasPrototype(Keyword$26) && prev$387.keyword.token.value === 'for' && curr$384.hasPrototype(Delimiter$28)) {
                return acc$383.concat(getVarDeclIdentifiers(curr$384));
            } else if (curr$384.hasPrototype(Block$19)) {
                return acc$383.concat(getVarDeclIdentifiers(curr$384));
            }
            return acc$383;
        }, []);
    }
    function replaceVarIdent(stx$390, orig$391, renamed$392) {
        if (stx$390 === orig$391) {
            return renamed$392;
        }
        return stx$390;
    }
    function expandTermTreeToFinal(term$393, env$394, ctx$395, defscope$396) {
        parser$4.assert(env$394, 'environment map is required');
        parser$4.assert(ctx$395, 'context map is required');
        if (term$393.hasPrototype(ArrayLiteral$20)) {
            term$393.array.delim.token.inner = expand(term$393.array.delim.token.inner, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(Block$19)) {
            term$393.body.delim.token.inner = expand(term$393.body.delim.token.inner, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(ParenExpression$21)) {
            term$393.expr.delim.token.inner = expand(term$393.expr.delim.token.inner, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(Call$34)) {
            term$393.fun = expandTermTreeToFinal(term$393.fun, env$394, ctx$395, defscope$396);
            term$393.args = _$3.map(term$393.args, function (arg$397) {
                return expandTermTreeToFinal(arg$397, env$394, ctx$395, defscope$396);
            });
            return term$393;
        } else if (term$393.hasPrototype(UnaryOp$22)) {
            term$393.expr = expandTermTreeToFinal(term$393.expr, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(BinOp$24)) {
            term$393.left = expandTermTreeToFinal(term$393.left, env$394, ctx$395, defscope$396);
            term$393.right = expandTermTreeToFinal(term$393.right, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(ObjDotGet$35)) {
            term$393.left = expandTermTreeToFinal(term$393.left, env$394, ctx$395, defscope$396);
            term$393.right = expandTermTreeToFinal(term$393.right, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(VariableDeclaration$37)) {
            if (term$393.init) {
                term$393.init = expandTermTreeToFinal(term$393.init, env$394, ctx$395, defscope$396);
            }
            return term$393;
        } else if (term$393.hasPrototype(VariableStatement$38)) {
            term$393.decls = _$3.map(term$393.decls, function (decl$398) {
                return expandTermTreeToFinal(decl$398, env$394, ctx$395, defscope$396);
            });
            return term$393;
        } else if (term$393.hasPrototype(Delimiter$28)) {
            term$393.delim.token.inner = expand(term$393.delim.token.inner, env$394, ctx$395, defscope$396);
            return term$393;
        } else if (term$393.hasPrototype(NamedFun$30) || term$393.hasPrototype(AnonFun$31) || term$393.hasPrototype(CatchClause$39)) {
            var newDef$399 = [];
            var params$400 = term$393.params.addDefCtx(newDef$399);
            var bodies$401 = term$393.body.addDefCtx(newDef$399);
            var paramNames$402 = _$3.map(getParamIdentifiers(params$400), function (param$411) {
                    var freshName$412 = fresh();
                    return {
                        freshName: freshName$412,
                        originalParam: param$411,
                        renamedParam: param$411.rename(param$411, freshName$412)
                    };
                });
            var newCtx$403 = ctx$395;
            var stxBody$404 = bodies$401;
            var renamedBody$405 = _$3.reduce(paramNames$402, function (accBody$413, p$414) {
                    return accBody$413.rename(p$414.originalParam, p$414.freshName);
                }, stxBody$404);
            var bodyTerms$406 = expand([renamedBody$405], env$394, newCtx$403, newDef$399);
            parser$4.assert(bodyTerms$406.length === 1 && bodyTerms$406[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$407 = flatten(bodyTerms$406);
            var renamedParams$408 = _$3.map(paramNames$402, function (p$415) {
                    return p$415.renamedParam;
                });
            var flatArgs$409 = wrapDelim(joinSyntax(renamedParams$408, ','), term$393.params);
            var expandedArgs$410 = expand([flatArgs$409.addDefCtx(newDef$399)], env$394, ctx$395, newDef$399);
            parser$4.assert(expandedArgs$410.length === 1, 'should only get back one result');
            term$393.params = expandedArgs$410[0];
            term$393.body = _$3.map(flattenedBody$407, function (stx$416) {
                return _$3.reduce(newDef$399, function (acc$417, def$418) {
                    return acc$417.rename(def$418.id, def$418.name);
                }, stx$416);
            });
            return term$393;
        }
        return term$393;
    }
    function expand(stx$419, env$420, ctx$421, defscope$422) {
        env$420 = env$420 || new Map();
        ctx$421 = ctx$421 || new Map();
        var trees$423 = expandToTermTree(stx$419, env$420, defscope$422);
        return _$3.map(trees$423.terms, function (term$424) {
            return expandTermTreeToFinal(term$424, trees$423.env, ctx$421, defscope$422);
        });
    }
    function expandTopLevel(stx$425) {
        var funn$426 = syntaxFromToken({
                value: 'function',
                type: parser$4.Token.Keyword
            });
        var name$427 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$4.Token.Identifier
            });
        var params$428 = syntaxFromToken({
                value: '()',
                type: parser$4.Token.Delimiter,
                inner: []
            });
        var body$429 = syntaxFromToken({
                value: '{}',
                type: parser$4.Token.Delimiter,
                inner: stx$425
            });
        var res$430 = expand([
                funn$426,
                name$427,
                params$428,
                body$429
            ]);
        return _$3.map(res$430[0].body.slice(1, res$430[0].body.length - 1), function (stx$431) {
            return stx$431;
        });
    }
    function flatten(terms$432) {
        return _$3.reduce(terms$432, function (acc$433, term$434) {
            return acc$433.concat(term$434.destruct(true));
        }, []);
    }
    exports$2.enforest = enforest;
    exports$2.expand = expandTopLevel;
    exports$2.resolve = resolve;
    exports$2.flatten = flatten;
    exports$2.tokensToSyntax = tokensToSyntax;
    exports$2.syntaxToTokens = syntaxToTokens;
}));