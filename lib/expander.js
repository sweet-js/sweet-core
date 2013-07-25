var C$0;
(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('underscore'), require('./parser'), require('es6-collections'), require('escodegen'), require('contracts-js'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections',
            'escodegen',
            'contracts-js'
        ], factory$2);
    } else {
        factory$2(root$1.expander = {}, root$1._, root$1.parser, root$1.es6, root$1.escodegen, root$1.contracts);
    }
}(this, function (exports$3, _$4, parser$5, es6$6, codegen$7, contracts$8) {
    'use strict';
    C$0 = contracts$8;
    exports$3._test = {};
    Object.prototype.create = function () {
        var o$46 = Object.create(this);
        if (typeof o$46.construct === 'function') {
            o$46.construct.apply(o$46, arguments);
        }
        return o$46;
    };
    Object.prototype.extend = function (properties$47) {
        var result$48 = Object.create(this);
        for (var prop in properties$47) {
            if (properties$47.hasOwnProperty(prop)) {
                result$48[prop] = properties$47[prop];
            }
        }
        return result$48;
    };
    Object.prototype.hasPrototype = function (proto$49) {
        function F() {
        }
        F.prototype = proto$49;
        return this instanceof F;
    };
    function throwError(msg$50) {
        throw new Error(msg$50);
    }
    function mkSyntax(value$51, type$52, stx$53) {
        return syntaxFromToken({
            type: type$52,
            value: value$51,
            lineStart: stx$53.token.lineStart,
            lineNumber: stx$53.token.lineNumber
        }, stx$53.context);
    }
    function Mark(mark$54, ctx$55) {
        return {
            mark: mark$54,
            context: ctx$55
        };
    }
    function Var(id$56) {
        return {id: id$56};
    }
    function isDef(ctx$57) {
        return ctx$57 && typeof ctx$57.defctx !== 'undefined';
    }
    var isMark$10 = function isMark$10(m$58) {
        return m$58 && typeof m$58.mark !== 'undefined';
    };
    function Rename(id$59, name$60, ctx$61, defctx$62) {
        defctx$62 = defctx$62 || null;
        return {
            id: id$59,
            name: name$60,
            context: ctx$61,
            def: defctx$62
        };
    }
    function Def(defctx$63, ctx$64) {
        return {
            defctx: defctx$63,
            context: ctx$64
        };
    }
    var isRename$11 = function (r$65) {
        return r$65 && typeof r$65.id !== 'undefined' && typeof r$65.name !== 'undefined';
    };
    var syntaxProto$12 = {
            mark: function mark(newMark$66) {
                var markedToken$67 = _$4.clone(this.token);
                if (this.token.inner) {
                    var markedInner$70 = _$4.map(this.token.inner, function (stx$71) {
                            return stx$71.mark(newMark$66);
                        });
                    markedToken$67.inner = markedInner$70;
                }
                var newMarkObj$68 = Mark(newMark$66, this.context);
                var stmp$69 = syntaxFromToken(markedToken$67, newMarkObj$68);
                return stmp$69;
            },
            rename: function (id$72, name$73) {
                if (this.token.inner) {
                    var renamedInner$74 = _$4.map(this.token.inner, function (stx$75) {
                            return stx$75.rename(id$72, name$73);
                        });
                    this.token.inner = renamedInner$74;
                }
                if (this.token.value === id$72.token.value) {
                    return syntaxFromToken(this.token, Rename(id$72, name$73, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$76) {
                if (this.token.inner) {
                    var renamedInner$77 = _$4.map(this.token.inner, function (stx$78) {
                            return stx$78.addDefCtx(defctx$76);
                        });
                    this.token.inner = renamedInner$77;
                }
                return syntaxFromToken(this.token, Def(defctx$76, this.context));
            },
            getDefCtx: function () {
                var ctx$79 = this.context;
                while (ctx$79 !== null) {
                    if (isDef(ctx$79)) {
                        return ctx$79.defctx;
                    }
                    ctx$79 = ctx$79.context;
                }
                return null;
            },
            toString: function () {
                var val$80 = this.token.type === parser$5.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$80 + ']';
            }
        };
    function syntaxFromToken(token$81, oldctx$82) {
        var ctx$83 = typeof oldctx$82 !== 'undefined' ? oldctx$82 : null;
        return Object.create(syntaxProto$12, {
            token: {
                value: token$81,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$83,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$84, mlist$85) {
        if (mark$84 === _$4.first(mlist$85)) {
            return _$4.rest(mlist$85, 1);
        }
        return [mark$84].concat(mlist$85);
    }
    function marksof(ctx$86, stopName$87, originalName$88) {
        var mark$89, submarks$90;
        if (isMark$10(ctx$86)) {
            mark$89 = ctx$86.mark;
            submarks$90 = marksof(ctx$86.context, stopName$87, originalName$88);
            return remdup(mark$89, submarks$90);
        }
        if (isDef(ctx$86)) {
            return marksof(ctx$86.context, stopName$87, originalName$88);
        }
        if (isRename$11(ctx$86)) {
            if (stopName$87 === originalName$88 + '$' + ctx$86.name) {
                return [];
            }
            return marksof(ctx$86.context, stopName$87, originalName$88);
        }
        return [];
    }
    function resolve(stx$91) {
        return resolveCtx(stx$91.token.value, stx$91.context, [], []);
    }
    function arraysEqual(a$92, b$93) {
        if (a$92.length !== b$93.length) {
            return false;
        }
        for (var i$94 = 0; i$94 < a$92.length; i$94++) {
            if (a$92[i$94] !== b$93[i$94]) {
                return false;
            }
        }
        return true;
    }
    function renames(defctx$95, oldctx$96, originalName$97) {
        var acc$98 = oldctx$96;
        defctx$95.forEach(function (def$99) {
            if (def$99.id.token.value === originalName$97) {
                acc$98 = Rename(def$99.id, def$99.name, acc$98, defctx$95);
            }
        });
        return acc$98;
    }
    function resolveCtx(originalName$100, ctx$101, stop_spine$102, stop_branch$103) {
        if (isMark$10(ctx$101)) {
            return resolveCtx(originalName$100, ctx$101.context, stop_spine$102, stop_branch$103);
        }
        if (isDef(ctx$101)) {
            if (_$4.contains(stop_spine$102, ctx$101.defctx)) {
                return resolveCtx(originalName$100, ctx$101.context, stop_spine$102, stop_branch$103);
            } else {
                return resolveCtx(originalName$100, renames(ctx$101.defctx, ctx$101.context, originalName$100), stop_spine$102, _$4.union(stop_branch$103, [ctx$101.defctx]));
            }
        }
        if (isRename$11(ctx$101)) {
            var idName$104 = resolveCtx(ctx$101.id.token.value, ctx$101.id.context, stop_branch$103, stop_branch$103);
            var subName$105 = resolveCtx(originalName$100, ctx$101.context, _$4.union(stop_spine$102, [ctx$101.def]), stop_branch$103);
            if (idName$104 === subName$105) {
                var idMarks$106 = marksof(ctx$101.id.context, originalName$100 + '$' + ctx$101.name, originalName$100);
                var subMarks$107 = marksof(ctx$101.context, originalName$100 + '$' + ctx$101.name, originalName$100);
                if (arraysEqual(idMarks$106, subMarks$107)) {
                    return originalName$100 + '$' + ctx$101.name;
                }
            }
            return resolveCtx(originalName$100, ctx$101.context, _$4.union(stop_spine$102, [ctx$101.def]), stop_branch$103);
        }
        return originalName$100;
    }
    var nextFresh$13 = 0;
    function fresh() {
        return nextFresh$13++;
    }
    ;
    function tokensToSyntax(tokens$108) {
        if (!_$4.isArray(tokens$108)) {
            tokens$108 = [tokens$108];
        }
        return _$4.map(tokens$108, function (token$109) {
            if (token$109.inner) {
                token$109.inner = tokensToSyntax(token$109.inner);
            }
            return syntaxFromToken(token$109);
        });
    }
    function syntaxToTokens(syntax$110) {
        return _$4.map(syntax$110, function (stx$111) {
            if (stx$111.token.inner) {
                stx$111.token.inner = syntaxToTokens(stx$111.token.inner);
            }
            return stx$111.token;
        });
    }
    function isPatternVar(token$112) {
        return token$112.type === parser$5.Token.Identifier && token$112.value[0] === '$' && token$112.value !== '$';
    }
    var containsPatternVar$14 = function (patterns$113) {
        return _$4.any(patterns$113, function (pat$114) {
            if (pat$114.token.type === parser$5.Token.Delimiter) {
                return containsPatternVar$14(pat$114.token.inner);
            }
            return isPatternVar(pat$114);
        });
    };
    function loadPattern(patterns$115) {
        return _$4.chain(patterns$115).reduce(function (acc$116, patStx$117, idx$118) {
            var last$119 = patterns$115[idx$118 - 1];
            var lastLast$120 = patterns$115[idx$118 - 2];
            var next$121 = patterns$115[idx$118 + 1];
            var nextNext$122 = patterns$115[idx$118 + 2];
            if (patStx$117.token.value === ':') {
                if (last$119 && isPatternVar(last$119.token)) {
                    return acc$116;
                }
            }
            if (last$119 && last$119.token.value === ':') {
                if (lastLast$120 && isPatternVar(lastLast$120.token)) {
                    return acc$116;
                }
            }
            if (patStx$117.token.value === '$' && next$121 && next$121.token.type === parser$5.Token.Delimiter) {
                return acc$116;
            }
            if (isPatternVar(patStx$117.token)) {
                if (next$121 && next$121.token.value === ':') {
                    parser$5.assert(typeof nextNext$122 !== 'undefined', 'expecting a pattern class');
                    patStx$117.class = nextNext$122.token.value;
                } else {
                    patStx$117.class = 'token';
                }
            } else if (patStx$117.token.type === parser$5.Token.Delimiter) {
                if (last$119 && last$119.token.value === '$') {
                    patStx$117.class = 'pattern_group';
                }
                patStx$117.token.inner = loadPattern(patStx$117.token.inner);
            } else {
                patStx$117.class = 'pattern_literal';
            }
            return acc$116.concat(patStx$117);
        }, []).reduce(function (acc$123, patStx$124, idx$125, patterns$126) {
            var separator$127 = ' ';
            var repeat$128 = false;
            var next$129 = patterns$126[idx$125 + 1];
            var nextNext$130 = patterns$126[idx$125 + 2];
            if (next$129 && next$129.token.value === '...') {
                repeat$128 = true;
                separator$127 = ' ';
            } else if (delimIsSeparator(next$129) && nextNext$130 && nextNext$130.token.value === '...') {
                repeat$128 = true;
                parser$5.assert(next$129.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$127 = next$129.token.inner[0].token.value;
            }
            if (patStx$124.token.value === '...' || delimIsSeparator(patStx$124) && next$129 && next$129.token.value === '...') {
                return acc$123;
            }
            patStx$124.repeat = repeat$128;
            patStx$124.separator = separator$127;
            return acc$123.concat(patStx$124);
        }, []).value();
    }
    function takeLineContext(from$131, to$132) {
        return _$4.map(to$132, function (stx$133) {
            if (stx$133.token.type === parser$5.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$5.Token.Delimiter,
                    value: stx$133.token.value,
                    inner: stx$133.token.inner,
                    startRange: from$131.range,
                    endRange: from$131.range,
                    startLineNumber: from$131.token.lineNumber,
                    startLineStart: from$131.token.lineStart,
                    endLineNumber: from$131.token.lineNumber,
                    endLineStart: from$131.token.lineStart
                }, stx$133.context);
            }
            return syntaxFromToken({
                value: stx$133.token.value,
                type: stx$133.token.type,
                lineNumber: from$131.token.lineNumber,
                lineStart: from$131.token.lineStart,
                range: from$131.token.range
            }, stx$133.context);
        });
    }
    function joinRepeatedMatch(tojoin$134, punc$135) {
        return _$4.reduce(_$4.rest(tojoin$134, 1), function (acc$136, join$137) {
            if (punc$135 === ' ') {
                return acc$136.concat(join$137.match);
            }
            return acc$136.concat(mkSyntax(punc$135, parser$5.Token.Punctuator, _$4.first(join$137.match)), join$137.match);
        }, _$4.first(tojoin$134).match);
    }
    function joinSyntax(tojoin$138, punc$139) {
        if (tojoin$138.length === 0) {
            return [];
        }
        if (punc$139 === ' ') {
            return tojoin$138;
        }
        return _$4.reduce(_$4.rest(tojoin$138, 1), function (acc$140, join$141) {
            return acc$140.concat(mkSyntax(punc$139, parser$5.Token.Punctuator, join$141), join$141);
        }, [_$4.first(tojoin$138)]);
    }
    function joinSyntaxArr(tojoin$142, punc$143) {
        if (tojoin$142.length === 0) {
            return [];
        }
        if (punc$143 === ' ') {
            return _$4.flatten(tojoin$142, true);
        }
        return _$4.reduce(_$4.rest(tojoin$142, 1), function (acc$144, join$145) {
            return acc$144.concat(mkSyntax(punc$143, parser$5.Token.Punctuator, _$4.first(join$145)), join$145);
        }, _$4.first(tojoin$142));
    }
    function delimIsSeparator(delim$146) {
        return delim$146 && delim$146.token.type === parser$5.Token.Delimiter && delim$146.token.value === '()' && delim$146.token.inner.length === 1 && delim$146.token.inner[0].token.type !== parser$5.Token.Delimiter && !containsPatternVar$14(delim$146.token.inner);
    }
    function freeVarsInPattern(pattern$147) {
        var fv$148 = [];
        _$4.each(pattern$147, function (pat$149) {
            if (isPatternVar(pat$149.token)) {
                fv$148.push(pat$149.token.value);
            } else if (pat$149.token.type === parser$5.Token.Delimiter) {
                fv$148 = fv$148.concat(freeVarsInPattern(pat$149.token.inner));
            }
        });
        return fv$148;
    }
    function patternLength(patterns$150) {
        return _$4.reduce(patterns$150, function (acc$151, pat$152) {
            if (pat$152.token.type === parser$5.Token.Delimiter) {
                return acc$151 + 1 + patternLength(pat$152.token.inner);
            }
            return acc$151 + 1;
        }, 0);
    }
    function matchStx(value$153, stx$154) {
        return stx$154 && stx$154.token && stx$154.token.value === value$153;
    }
    function wrapDelim(towrap$155, delimSyntax$156) {
        parser$5.assert(delimSyntax$156.token.type === parser$5.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$5.Token.Delimiter,
            value: delimSyntax$156.token.value,
            inner: towrap$155,
            range: delimSyntax$156.token.range,
            startLineNumber: delimSyntax$156.token.startLineNumber,
            lineStart: delimSyntax$156.token.lineStart
        }, delimSyntax$156.context);
    }
    function getParamIdentifiers(argSyntax$157) {
        parser$5.assert(argSyntax$157.token.type === parser$5.Token.Delimiter, 'expecting delimiter for function params');
        return _$4.filter(argSyntax$157.token.inner, function (stx$158) {
            return stx$158.token.value !== ',';
        });
    }
    function isFunctionStx(stx$159) {
        return stx$159 && stx$159.token.type === parser$5.Token.Keyword && stx$159.token.value === 'function';
    }
    function isVarStx(stx$160) {
        return stx$160 && stx$160.token.type === parser$5.Token.Keyword && stx$160.token.value === 'var';
    }
    function varNamesInAST(ast$161) {
        return _$4.map(ast$161, function (item$162) {
            return item$162.id.name;
        });
    }
    var TermTree$15 = {destruct: function (breakDelim$163) {
                return _$4.reduce(this.properties, _$4.bind(function (acc$164, prop$165) {
                    if (this[prop$165] && this[prop$165].hasPrototype(TermTree$15)) {
                        return acc$164.concat(this[prop$165].destruct(breakDelim$163));
                    } else if (this[prop$165]) {
                        return acc$164.concat(this[prop$165]);
                    } else {
                        return acc$164;
                    }
                }, this), []);
            }};
    var EOF$16 = TermTree$15.extend({
            properties: ['eof'],
            construct: function (e$166) {
                this.eof = e$166;
            }
        });
    var MakeSyntax$17 = TermTree$15.extend({
            properties: [
                'kw',
                'arg'
            ],
            construct: function (kw$167, arg$168) {
                this.kw = kw$167;
                this.arg = arg$168;
            }
        });
    var Statement$18 = TermTree$15.extend({construct: function () {
            }});
    var Expr$19 = TermTree$15.extend({construct: function () {
            }});
    var PrimaryExpression$20 = Expr$19.extend({construct: function () {
            }});
    var ThisExpression$21 = PrimaryExpression$20.extend({
            properties: ['this'],
            construct: function (that$169) {
                this.this = that$169;
            }
        });
    var Lit$22 = PrimaryExpression$20.extend({
            properties: ['lit'],
            construct: function (l$170) {
                this.lit = l$170;
            }
        });
    exports$3._test.PropertyAssignment = PropertyAssignment$23;
    var PropertyAssignment$23 = TermTree$15.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$171, assignment$172) {
                this.propName = propName$171;
                this.assignment = assignment$172;
            }
        });
    var Block$24 = PrimaryExpression$20.extend({
            properties: ['body'],
            construct: function (body$173) {
                this.body = body$173;
            }
        });
    var ArrayLiteral$25 = PrimaryExpression$20.extend({
            properties: ['array'],
            construct: function (ar$174) {
                this.array = ar$174;
            }
        });
    var ParenExpression$26 = PrimaryExpression$20.extend({
            properties: ['expr'],
            construct: function (expr$175) {
                this.expr = expr$175;
            }
        });
    var UnaryOp$27 = Expr$19.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$176, expr$177) {
                this.op = op$176;
                this.expr = expr$177;
            }
        });
    var PostfixOp$28 = Expr$19.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$178, op$179) {
                this.expr = expr$178;
                this.op = op$179;
            }
        });
    var BinOp$29 = Expr$19.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$180, left$181, right$182) {
                this.op = op$180;
                this.left = left$181;
                this.right = right$182;
            }
        });
    var ConditionalExpression$30 = Expr$19.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$183, question$184, tru$185, colon$186, fls$187) {
                this.cond = cond$183;
                this.question = question$184;
                this.tru = tru$185;
                this.colon = colon$186;
                this.fls = fls$187;
            }
        });
    var Keyword$31 = TermTree$15.extend({
            properties: ['keyword'],
            construct: function (k$188) {
                this.keyword = k$188;
            }
        });
    var Punc$32 = TermTree$15.extend({
            properties: ['punc'],
            construct: function (p$189) {
                this.punc = p$189;
            }
        });
    var Delimiter$33 = TermTree$15.extend({
            properties: ['delim'],
            destruct: function (breakDelim$190) {
                parser$5.assert(this.delim, 'expecting delim to be defined');
                var innerStx$191 = _$4.reduce(this.delim.token.inner, function (acc$192, term$193) {
                        if (term$193.hasPrototype(TermTree$15)) {
                            return acc$192.concat(term$193.destruct(breakDelim$190));
                        } else {
                            return acc$192.concat(term$193);
                        }
                    }, []);
                if (breakDelim$190) {
                    var openParen$194 = syntaxFromToken({
                            type: parser$5.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$195 = syntaxFromToken({
                            type: parser$5.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$194].concat(innerStx$191).concat(closeParen$195);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$196) {
                this.delim = d$196;
            }
        });
    var Id$34 = PrimaryExpression$20.extend({
            properties: ['id'],
            construct: function (id$197) {
                this.id = id$197;
            }
        });
    var NamedFun$35 = Expr$19.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$198, name$199, params$200, body$201) {
                this.keyword = keyword$198;
                this.name = name$199;
                this.params = params$200;
                this.body = body$201;
            }
        });
    var AnonFun$36 = Expr$19.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$202, params$203, body$204) {
                this.keyword = keyword$202;
                this.params = params$203;
                this.body = body$204;
            }
        });
    var Macro$37 = TermTree$15.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$205, body$206) {
                this.name = name$205;
                this.body = body$206;
            }
        });
    var Const$38 = Expr$19.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$207, call$208) {
                this.newterm = newterm$207;
                this.call = call$208;
            }
        });
    var Call$39 = Expr$19.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$209) {
                parser$5.assert(this.fun.hasPrototype(TermTree$15), 'expecting a term tree in destruct of call');
                var that$210 = this;
                this.delim = syntaxFromToken(_$4.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$4.reduce(this.args, function (acc$211, term$212) {
                    parser$5.assert(term$212 && term$212.hasPrototype(TermTree$15), 'expecting term trees in destruct of Call');
                    var dst$213 = acc$211.concat(term$212.destruct(breakDelim$209));
                    if (that$210.commas.length > 0) {
                        dst$213 = dst$213.concat(that$210.commas.shift());
                    }
                    return dst$213;
                }, []);
                return this.fun.destruct(breakDelim$209).concat(Delimiter$33.create(this.delim).destruct(breakDelim$209));
            },
            construct: function (funn$214, args$215, delim$216, commas$217) {
                parser$5.assert(Array.isArray(args$215), 'requires an array of arguments terms');
                this.fun = funn$214;
                this.args = args$215;
                this.delim = delim$216;
                this.commas = commas$217;
            }
        });
    var ObjDotGet$40 = Expr$19.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$218, dot$219, right$220) {
                this.left = left$218;
                this.dot = dot$219;
                this.right = right$220;
            }
        });
    var ObjGet$41 = Expr$19.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$221, right$222) {
                this.left = left$221;
                this.right = right$222;
            }
        });
    var VariableDeclaration$42 = TermTree$15.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$223, eqstx$224, init$225, comma$226) {
                this.ident = ident$223;
                this.eqstx = eqstx$224;
                this.init = init$225;
                this.comma = comma$226;
            }
        });
    var VariableStatement$43 = Statement$18.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$227) {
                return this.varkw.destruct(breakDelim$227).concat(_$4.reduce(this.decls, function (acc$228, decl$229) {
                    return acc$228.concat(decl$229.destruct(breakDelim$227));
                }, []));
            },
            construct: function (varkw$230, decls$231) {
                parser$5.assert(Array.isArray(decls$231), 'decls must be an array');
                this.varkw = varkw$230;
                this.decls = decls$231;
            }
        });
    var CatchClause$44 = TermTree$15.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$232, params$233, body$234) {
                this.catchkw = catchkw$232;
                this.params = params$233;
                this.body = body$234;
            }
        });
    var Empty$45 = TermTree$15.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$235) {
        var staticOperators$236 = [
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
        return _$4.contains(staticOperators$236, stx$235.token.value);
    }
    function stxIsBinOp(stx$237) {
        var staticOperators$238 = [
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
        return _$4.contains(staticOperators$238, stx$237.token.value);
    }
    function enforestVarStatement(stx$239, env$240) {
        parser$5.assert(stx$239[0] && stx$239[0].token.type === parser$5.Token.Identifier, 'must start at the identifier');
        var decls$241 = [], rest$242 = stx$239, initRes$243, subRes$244;
        if (stx$239[1] && stx$239[1].token.type === parser$5.Token.Punctuator && stx$239[1].token.value === '=') {
            initRes$243 = enforest(stx$239.slice(2), env$240);
            if (initRes$243.result.hasPrototype(Expr$19)) {
                rest$242 = initRes$243.rest;
                if (initRes$243.rest[0].token.type === parser$5.Token.Punctuator && initRes$243.rest[0].token.value === ',' && initRes$243.rest[1] && initRes$243.rest[1].token.type === parser$5.Token.Identifier) {
                    decls$241.push(VariableDeclaration$42.create(stx$239[0], stx$239[1], initRes$243.result, initRes$243.rest[0]));
                    subRes$244 = enforestVarStatement(initRes$243.rest.slice(1), env$240);
                    decls$241 = decls$241.concat(subRes$244.result);
                    rest$242 = subRes$244.rest;
                } else {
                    decls$241.push(VariableDeclaration$42.create(stx$239[0], stx$239[1], initRes$243.result));
                }
            } else {
                parser$5.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$239[1] && stx$239[1].token.type === parser$5.Token.Punctuator && stx$239[1].token.value === ',') {
            decls$241.push(VariableDeclaration$42.create(stx$239[0], null, null, stx$239[1]));
            subRes$244 = enforestVarStatement(stx$239.slice(2), env$240);
            decls$241 = decls$241.concat(subRes$244.result);
            rest$242 = subRes$244.rest;
        } else {
            decls$241.push(VariableDeclaration$42.create(stx$239[0]));
            rest$242 = stx$239.slice(1);
        }
        return {
            result: decls$241,
            rest: rest$242
        };
    }
    function getStxForMakeSyntax(term$245) {
        var lit$248 = term$245.lit;
        var delim$250 = term$245.delim;
        if (term$245.hasPrototype(Lit$22)) {
            return lit$248;
        } else if (term$245.hasPrototype(Delimiter$33)) {
            return delim$250;
        } else {
            throwError('not implemented yet: ');
        }
    }
    function setStxForMakeSyntax(stx$255, term$256) {
        var lit$259 = term$256.lit;
        var delim$261 = term$256.delim;
        if (term$256.hasPrototype(Lit$22)) {
            term$256.lit = stx$255;
        } else if (term$256.hasPrototype(Delimiter$33)) {
            term$256.delim = stx$255;
        } else {
            throwError('not implemented yet: ' + term$256);
        }
    }
    function enforest(toks$266, env$267, stxStore$268) {
        env$267 = env$267 || new Map();
        parser$5.assert(toks$266.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$269, rest$270) {
            var innerTokens$271;
            parser$5.assert(Array.isArray(rest$270), 'result must at least be an empty array');
            if (head$269.hasPrototype(TermTree$15)) {
                var emp$276 = head$269.emp;
                var emp$276 = head$269.emp;
                var keyword$286 = head$269.keyword;
                var delim$294 = head$269.delim;
                var emp$276 = head$269.emp;
                var punc$284 = head$269.punc;
                var keyword$286 = head$269.keyword;
                var emp$276 = head$269.emp;
                var emp$276 = head$269.emp;
                var emp$276 = head$269.emp;
                var delim$294 = head$269.delim;
                var delim$294 = head$269.delim;
                var keyword$286 = head$269.keyword;
                if (head$269.hasPrototype(Expr$19) && (rest$270[0] && rest$270[0].token.type === parser$5.Token.Delimiter && rest$270[0].token.value === '()')) {
                    var argRes$314, enforestedArgs$315 = [], commas$316 = [];
                    innerTokens$271 = rest$270[0].token.inner;
                    while (innerTokens$271.length > 0) {
                        argRes$314 = enforest(innerTokens$271, env$267, stxStore$268);
                        enforestedArgs$315.push(argRes$314.result);
                        innerTokens$271 = argRes$314.rest;
                        if (innerTokens$271[0] && innerTokens$271[0].token.value === ',') {
                            commas$316.push(innerTokens$271[0]);
                            innerTokens$271 = innerTokens$271.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$317 = _$4.all(enforestedArgs$315, function (argTerm$318) {
                            return argTerm$318.hasPrototype(Expr$19);
                        });
                    if (innerTokens$271.length === 0 && argsAreExprs$317) {
                        if (head$269.hasPrototype(Id$34) && head$269.id.token.value === 'makeSyntax') {
                            var stxId$319 = fresh();
                            var stxForStore$320 = getStxForMakeSyntax(enforestedArgs$315[1]);
                            stxStore$268.set(stxId$319, stxForStore$320);
                            setStxForMakeSyntax(mkSyntax(stxId$319, parser$5.Token.NumericLiteral, stxForStore$320), enforestedArgs$315[1]);
                        }
                        return step(Call$39.create(head$269, enforestedArgs$315, rest$270[0], commas$316), rest$270.slice(1));
                    }
                } else if (head$269.hasPrototype(Expr$19) && (rest$270[0] && rest$270[0].token.value === '?')) {
                    var question$321 = rest$270[0];
                    var condRes$322 = enforest(rest$270.slice(1), env$267, stxStore$268);
                    var truExpr$323 = condRes$322.result;
                    var right$333 = condRes$322.rest;
                    if (truExpr$323.hasPrototype(Expr$19) && right$333[0] && right$333[0].token.value === ':') {
                        var colon$325 = right$333[0];
                        var flsRes$326 = enforest(right$333.slice(1), env$267, stxStore$268);
                        var flsExpr$327 = flsRes$326.result;
                        if (flsExpr$327.hasPrototype(Expr$19)) {
                            return step(ConditionalExpression$30.create(head$269, question$321, truExpr$323, colon$325, flsExpr$327), flsRes$326.rest);
                        }
                    }
                } else if (head$269.hasPrototype(Keyword$31) && (keyword$286.token.value === 'new' && rest$270[0])) {
                    var newCallRes$328 = enforest(rest$270, env$267, stxStore$268);
                    if (newCallRes$328.result.hasPrototype(Call$39)) {
                        return step(Const$38.create(head$269, newCallRes$328.result), newCallRes$328.rest);
                    }
                } else if (head$269.hasPrototype(Delimiter$33) && delim$294.token.value === '()') {
                    innerTokens$271 = delim$294.token.inner;
                    if (innerTokens$271.length === 0) {
                        return step(ParenExpression$26.create(head$269), rest$270);
                    } else {
                        var innerTerm$329 = get_expression(innerTokens$271, env$267, stxStore$268);
                        if (innerTerm$329.result && innerTerm$329.result.hasPrototype(Expr$19)) {
                            return step(ParenExpression$26.create(head$269), rest$270);
                        }
                    }
                } else if (head$269.hasPrototype(TermTree$15) && (rest$270[0] && rest$270[1] && stxIsBinOp(rest$270[0]))) {
                    var op$330 = rest$270[0];
                    var left$331 = head$269;
                    var bopRes$332 = enforest(rest$270.slice(1), env$267, stxStore$268);
                    var right$333 = bopRes$332.result;
                    if (right$333.hasPrototype(Expr$19)) {
                        return step(BinOp$29.create(op$330, left$331, right$333), bopRes$332.rest);
                    }
                } else if (head$269.hasPrototype(Punc$32) && stxIsUnaryOp(punc$284)) {
                    var unopRes$335 = enforest(rest$270, env$267, stxStore$268);
                    if (unopRes$335.result.hasPrototype(Expr$19)) {
                        return step(UnaryOp$27.create(punc$284, unopRes$335.result), unopRes$335.rest);
                    }
                } else if (head$269.hasPrototype(Keyword$31) && stxIsUnaryOp(keyword$286)) {
                    var unopRes$335 = enforest(rest$270, env$267, stxStore$268);
                    if (unopRes$335.result.hasPrototype(Expr$19)) {
                        return step(UnaryOp$27.create(keyword$286, unopRes$335.result), unopRes$335.rest);
                    }
                } else if (head$269.hasPrototype(Expr$19) && (rest$270[0] && (rest$270[0].token.value === '++' || rest$270[0].token.value === '--'))) {
                    return step(PostfixOp$28.create(head$269, rest$270[0]), rest$270.slice(1));
                } else if (head$269.hasPrototype(Expr$19) && (rest$270[0] && rest$270[0].token.value === '[]')) {
                    var getRes$336 = enforest(rest$270[0].token.inner, env$267, stxStore$268);
                    var resStx$337 = mkSyntax('[]', parser$5.Token.Delimiter, rest$270[0]);
                    resStx$337.token.inner = [getRes$336.result];
                    if (getRes$336.rest.length > 0) {
                        return step(ObjGet$41.create(head$269, Delimiter$33.create(resStx$337)), rest$270.slice(1));
                    }
                } else if (head$269.hasPrototype(Expr$19) && (rest$270[0] && rest$270[0].token.value === '.' && rest$270[1] && rest$270[1].token.type === parser$5.Token.Identifier)) {
                    return step(ObjDotGet$40.create(head$269, rest$270[0], rest$270[1]), rest$270.slice(2));
                } else if (head$269.hasPrototype(Delimiter$33) && delim$294.token.value === '[]') {
                    return step(ArrayLiteral$25.create(head$269), rest$270);
                } else if (head$269.hasPrototype(Delimiter$33) && head$269.delim.token.value === '{}') {
                    return step(Block$24.create(head$269), rest$270);
                } else if (head$269.hasPrototype(Keyword$31) && (keyword$286.token.value === 'var' && rest$270[0] && rest$270[0].token.type === parser$5.Token.Identifier)) {
                    var vsRes$338 = enforestVarStatement(rest$270, env$267);
                    if (vsRes$338) {
                        return step(VariableStatement$43.create(head$269, vsRes$338.result), vsRes$338.rest);
                    }
                }
            } else {
                parser$5.assert(head$269 && head$269.token, 'assuming head is a syntax object');
                if ((head$269.token.type === parser$5.Token.Identifier || head$269.token.type === parser$5.Token.Keyword) && env$267.has(head$269.token.value)) {
                    var transformer$339 = env$267.get(head$269.token.value);
                    var rt$340 = transformer$339(rest$270, head$269, env$267, stxStore$268);
                    if (rt$340.result.length > 0) {
                        return step(rt$340.result[0], rt$340.result.slice(1).concat(rt$340.rest));
                    } else {
                        return step(Empty$45.create(), rt$340.rest);
                    }
                } else if (head$269.token.type === parser$5.Token.Identifier && head$269.token.value === 'macro' && rest$270[0] && (rest$270[0].token.type === parser$5.Token.Identifier || rest$270[0].token.type === parser$5.Token.Keyword) && rest$270[1] && rest$270[1].token.type === parser$5.Token.Delimiter && rest$270[1].token.value === '{}') {
                    return step(Macro$37.create(rest$270[0], rest$270[1].token.inner), rest$270.slice(2));
                } else if (head$269.token.type === parser$5.Token.Keyword && head$269.token.value === 'function' && rest$270[0] && rest$270[0].token.type === parser$5.Token.Identifier && rest$270[1] && rest$270[1].token.type === parser$5.Token.Delimiter && rest$270[1].token.value === '()' && rest$270[2] && rest$270[2].token.type === parser$5.Token.Delimiter && rest$270[2].token.value === '{}') {
                    return step(NamedFun$35.create(head$269, rest$270[0], rest$270[1], rest$270[2]), rest$270.slice(3));
                } else if (head$269.token.type === parser$5.Token.Keyword && head$269.token.value === 'function' && rest$270[0] && rest$270[0].token.type === parser$5.Token.Delimiter && rest$270[0].token.value === '()' && rest$270[1] && rest$270[1].token.type === parser$5.Token.Delimiter && rest$270[1].token.value === '{}') {
                    return step(AnonFun$36.create(head$269, rest$270[0], rest$270[1]), rest$270.slice(2));
                } else if (head$269.token.type === parser$5.Token.Keyword && head$269.token.value === 'catch' && rest$270[0] && rest$270[0].token.type === parser$5.Token.Delimiter && rest$270[0].token.value === '()' && rest$270[1] && rest$270[1].token.type === parser$5.Token.Delimiter && rest$270[1].token.value === '{}') {
                    return step(CatchClause$44.create(head$269, rest$270[0], rest$270[1]), rest$270.slice(2));
                } else if (head$269.token.type === parser$5.Token.Keyword && head$269.token.value === 'this') {
                    return step(ThisExpression$21.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.NumericLiteral || head$269.token.type === parser$5.Token.StringLiteral || head$269.token.type === parser$5.Token.BooleanLiteral || head$269.token.type === parser$5.Token.RegexLiteral || head$269.token.type === parser$5.Token.NullLiteral) {
                    return step(Lit$22.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.Identifier) {
                    return step(Id$34.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.Punctuator) {
                    return step(Punc$32.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.Keyword && head$269.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$269.token.type === parser$5.Token.Keyword) {
                    return step(Keyword$31.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.Delimiter) {
                    return step(Delimiter$33.create(head$269), rest$270);
                } else if (head$269.token.type === parser$5.Token.EOF) {
                    parser$5.assert(rest$270.length === 0, 'nothing should be after an EOF');
                    return step(EOF$16.create(head$269), []);
                } else {
                    parser$5.assert(false, 'not implemented');
                }
            }
            return {
                result: head$269,
                rest: rest$270
            };
        }
        return step(toks$266[0], toks$266.slice(1));
    }
    function get_expression(stx$341, env$342, stxStore$343) {
        var res$344 = enforest(stx$341, env$342, stxStore$343);
        if (!res$344.result.hasPrototype(Expr$19)) {
            return {
                result: null,
                rest: stx$341
            };
        }
        return res$344;
    }
    function typeIsLiteral(type$345) {
        return type$345 === parser$5.Token.NullLiteral || type$345 === parser$5.Token.NumericLiteral || type$345 === parser$5.Token.StringLiteral || type$345 === parser$5.Token.RegexLiteral || type$345 === parser$5.Token.BooleanLiteral;
    }
    exports$3._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$346, stx$347, env$348, stxStore$349) {
        var result$350, rest$351;
        if (patternClass$346 === 'token' && stx$347[0] && stx$347[0].token.type !== parser$5.Token.EOF) {
            result$350 = [stx$347[0]];
            rest$351 = stx$347.slice(1);
        } else if (patternClass$346 === 'lit' && stx$347[0] && typeIsLiteral(stx$347[0].token.type)) {
            result$350 = [stx$347[0]];
            rest$351 = stx$347.slice(1);
        } else if (patternClass$346 === 'ident' && stx$347[0] && stx$347[0].token.type === parser$5.Token.Identifier) {
            result$350 = [stx$347[0]];
            rest$351 = stx$347.slice(1);
        } else if (stx$347.length > 0 && patternClass$346 === 'VariableStatement') {
            var match$353 = enforest(stx$347, env$348, stxStore$349);
            if (match$353.result && match$353.result.hasPrototype(VariableStatement$43)) {
                result$350 = match$353.result.destruct(false);
                rest$351 = match$353.rest;
            } else {
                result$350 = null;
                rest$351 = stx$347;
            }
        } else if (stx$347.length > 0 && patternClass$346 === 'expr') {
            var match$353 = get_expression(stx$347, env$348, stxStore$349);
            if (match$353.result === null || !match$353.result.hasPrototype(Expr$19)) {
                result$350 = null;
                rest$351 = stx$347;
            } else {
                result$350 = match$353.result.destruct(false);
                rest$351 = match$353.rest;
            }
        } else {
            result$350 = null;
            rest$351 = stx$347;
        }
        return {
            result: result$350,
            rest: rest$351
        };
    }
    function matchPattern(pattern$354, stx$355, env$356, patternEnv$357, stxStore$358) {
        var subMatch$359;
        var match$360, matchEnv$361;
        var rest$362;
        var success$363;
        if (pattern$354.token.type === parser$5.Token.Delimiter) {
            if (pattern$354.class === 'pattern_group') {
                subMatch$359 = matchPatterns(pattern$354.token.inner, stx$355, env$356, false, stxStore$358);
                rest$362 = subMatch$359.rest;
            } else if (stx$355[0] && stx$355[0].token.type === parser$5.Token.Delimiter && stx$355[0].token.value === pattern$354.token.value) {
                subMatch$359 = matchPatterns(pattern$354.token.inner, stx$355[0].token.inner, env$356, false, stxStore$358);
                rest$362 = stx$355.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$355,
                    patternEnv: patternEnv$357
                };
            }
            success$363 = subMatch$359.success;
            _$4.keys(subMatch$359.patternEnv).forEach(function (patternKey$364) {
                if (pattern$354.repeat) {
                    var nextLevel$365 = subMatch$359.patternEnv[patternKey$364].level + 1;
                    if (patternEnv$357[patternKey$364]) {
                        patternEnv$357[patternKey$364].level = nextLevel$365;
                        patternEnv$357[patternKey$364].match.push(subMatch$359.patternEnv[patternKey$364]);
                    } else {
                        patternEnv$357[patternKey$364] = {
                            level: nextLevel$365,
                            match: [subMatch$359.patternEnv[patternKey$364]]
                        };
                    }
                } else {
                    patternEnv$357[patternKey$364] = subMatch$359.patternEnv[patternKey$364];
                }
            });
        } else {
            if (pattern$354.class === 'pattern_literal') {
                if (stx$355[0] && pattern$354.token.value === stx$355[0].token.value) {
                    success$363 = true;
                    rest$362 = stx$355.slice(1);
                } else {
                    success$363 = false;
                    rest$362 = stx$355;
                }
            } else {
                match$360 = matchPatternClass(pattern$354.class, stx$355, env$356, stxStore$358);
                success$363 = match$360.result !== null;
                rest$362 = match$360.rest;
                matchEnv$361 = {
                    level: 0,
                    match: match$360.result
                };
                if (pattern$354.repeat) {
                    if (patternEnv$357[pattern$354.token.value]) {
                        patternEnv$357[pattern$354.token.value].match.push(matchEnv$361);
                    } else {
                        patternEnv$357[pattern$354.token.value] = {
                            level: 1,
                            match: [matchEnv$361]
                        };
                    }
                } else {
                    patternEnv$357[pattern$354.token.value] = matchEnv$361;
                }
            }
        }
        return {
            success: success$363,
            rest: rest$362,
            patternEnv: patternEnv$357
        };
    }
    function matchPatterns(patterns$366, stx$367, env$368, topLevel$369, stxStore$370) {
        topLevel$369 = topLevel$369 || false;
        var result$371 = [];
        var patternEnv$372 = {};
        var match$373;
        var pattern$374;
        var rest$375 = stx$367;
        var success$376 = true;
        for (var i$377 = 0; i$377 < patterns$366.length; i$377++) {
            pattern$374 = patterns$366[i$377];
            do {
                match$373 = matchPattern(pattern$374, rest$375, env$368, patternEnv$372, stxStore$370);
                if (!match$373.success && pattern$374.repeat) {
                    rest$375 = match$373.rest;
                    patternEnv$372 = match$373.patternEnv;
                    break;
                }
                if (!match$373.success) {
                    success$376 = false;
                    break;
                }
                rest$375 = match$373.rest;
                patternEnv$372 = match$373.patternEnv;
                if (pattern$374.repeat && success$376) {
                    if (rest$375[0] && rest$375[0].token.value === pattern$374.separator) {
                        rest$375 = rest$375.slice(1);
                    } else if (pattern$374.separator === ' ') {
                        continue;
                    } else if (pattern$374.separator !== ' ' && rest$375.length > 0 && i$377 === patterns$366.length - 1 && topLevel$369 === false) {
                        success$376 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$374.repeat && match$373.success && rest$375.length > 0);
        }
        return {
            success: success$376,
            rest: rest$375,
            patternEnv: patternEnv$372
        };
    }
    function transcribe(macroBody$378, macroNameStx$379, env$380) {
        return _$4.chain(macroBody$378).reduce(function (acc$381, bodyStx$382, idx$383, original$384) {
            var last$385 = original$384[idx$383 - 1];
            var next$386 = original$384[idx$383 + 1];
            var nextNext$387 = original$384[idx$383 + 2];
            if (bodyStx$382.token.value === '...') {
                return acc$381;
            }
            if (delimIsSeparator(bodyStx$382) && next$386 && next$386.token.value === '...') {
                return acc$381;
            }
            if (bodyStx$382.token.value === '$' && next$386 && next$386.token.type === parser$5.Token.Delimiter && next$386.token.value === '()') {
                return acc$381;
            }
            if (bodyStx$382.token.value === '$' && next$386 && next$386.token.type === parser$5.Token.Delimiter && next$386.token.value === '[]') {
                next$386.literal = true;
                return acc$381;
            }
            if (bodyStx$382.token.type === parser$5.Token.Delimiter && bodyStx$382.token.value === '()' && last$385 && last$385.token.value === '$') {
                bodyStx$382.group = true;
            }
            if (bodyStx$382.literal === true) {
                parser$5.assert(bodyStx$382.token.type === parser$5.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$381.concat(bodyStx$382.token.inner);
            }
            if (next$386 && next$386.token.value === '...') {
                bodyStx$382.repeat = true;
                bodyStx$382.separator = ' ';
            } else if (delimIsSeparator(next$386) && nextNext$387 && nextNext$387.token.value === '...') {
                bodyStx$382.repeat = true;
                bodyStx$382.separator = next$386.token.inner[0].token.value;
            }
            return acc$381.concat(bodyStx$382);
        }, []).reduce(function (acc$388, bodyStx$389, idx$390) {
            if (bodyStx$389.repeat) {
                if (bodyStx$389.token.type === parser$5.Token.Delimiter) {
                    var fv$391 = _$4.filter(freeVarsInPattern(bodyStx$389.token.inner), function (pat$398) {
                            return env$380.hasOwnProperty(pat$398);
                        });
                    var restrictedEnv$392 = [];
                    var nonScalar$393 = _$4.find(fv$391, function (pat$399) {
                            return env$380[pat$399].level > 0;
                        });
                    parser$5.assert(typeof nonScalar$393 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$394 = env$380[nonScalar$393].match.length;
                    var sameLength$395 = _$4.all(fv$391, function (pat$400) {
                            return env$380[pat$400].level === 0 || env$380[pat$400].match.length === repeatLength$394;
                        });
                    parser$5.assert(sameLength$395, 'all non-scalars must have the same length');
                    restrictedEnv$392 = _$4.map(_$4.range(repeatLength$394), function (idx$401) {
                        var renv$402 = {};
                        _$4.each(fv$391, function (pat$403) {
                            if (env$380[pat$403].level === 0) {
                                renv$402[pat$403] = env$380[pat$403];
                            } else {
                                renv$402[pat$403] = env$380[pat$403].match[idx$401];
                            }
                        });
                        return renv$402;
                    });
                    var transcribed$396 = _$4.map(restrictedEnv$392, function (renv$404) {
                            if (bodyStx$389.group) {
                                return transcribe(bodyStx$389.token.inner, macroNameStx$379, renv$404);
                            } else {
                                var newBody$405 = syntaxFromToken(_$4.clone(bodyStx$389.token), bodyStx$389.context);
                                newBody$405.token.inner = transcribe(bodyStx$389.token.inner, macroNameStx$379, renv$404);
                                return newBody$405;
                            }
                        });
                    var joined$397;
                    if (bodyStx$389.group) {
                        joined$397 = joinSyntaxArr(transcribed$396, bodyStx$389.separator);
                    } else {
                        joined$397 = joinSyntax(transcribed$396, bodyStx$389.separator);
                    }
                    return acc$388.concat(joined$397);
                }
                parser$5.assert(env$380[bodyStx$389.token.value].level === 1, 'ellipses level does not match');
                return acc$388.concat(joinRepeatedMatch(env$380[bodyStx$389.token.value].match, bodyStx$389.separator));
            } else {
                if (bodyStx$389.token.type === parser$5.Token.Delimiter) {
                    var newBody$406 = syntaxFromToken(_$4.clone(bodyStx$389.token), macroBody$378.context);
                    newBody$406.token.inner = transcribe(bodyStx$389.token.inner, macroNameStx$379, env$380);
                    return acc$388.concat(newBody$406);
                }
                if (Object.prototype.hasOwnProperty.bind(env$380)(bodyStx$389.token.value)) {
                    parser$5.assert(env$380[bodyStx$389.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$389.token.value);
                    return acc$388.concat(takeLineContext(macroNameStx$379, env$380[bodyStx$389.token.value].match));
                }
                return acc$388.concat(takeLineContext(macroNameStx$379, [bodyStx$389]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$407, env$408) {
        function dfs(match$409) {
            if (match$409.level === 0) {
                match$409.match = _$4.map(match$409.match, function (stx$410) {
                    return stx$410.mark(newMark$407);
                });
            } else {
                _$4.each(match$409.match, function (match$411) {
                    dfs(match$411);
                });
            }
        }
        _$4.keys(env$408).forEach(function (key$412) {
            dfs(env$408[key$412]);
        });
    }
    function evalMacroBody(body$413, stxStore$414) {
        var functionStub$415 = parser$5.read('(function(makeSyntax) { })');
        functionStub$415[0].token.inner[2].token.inner = body$413;
        var expanded$416 = expandTopLevel(functionStub$415, stxStore$414);
        var bodyCode$417 = codegen$7.generate(parser$5.parse(expanded$416));
        var macroFn$418 = eval(bodyCode$417);
        return macroFn$418(function (val$419, ctx$420) {
            return mkSyntax(val$419, parser$5.Token.NumericLiteral, stxStore$414.get(ctx$420));
        });
    }
    function makeTransformer(cases$421, macroType$422) {
        var sortedCases$423 = _$4.sortBy(cases$421, function (mcase$424) {
                return patternLength(mcase$424.pattern);
            }).reverse();
        return function transformer(stx$425, macroNameStx$426, env$427, stxStore$428) {
            var match$429;
            var casePattern$430, caseBody$431;
            var newMark$432;
            var macroResult$433;
            for (var i$434 = 0; i$434 < sortedCases$423.length; i$434++) {
                casePattern$430 = sortedCases$423[i$434].pattern;
                caseBody$431 = sortedCases$423[i$434].body;
                match$429 = matchPatterns(casePattern$430, stx$425, env$427, true, stxStore$428);
                if (match$429.success) {
                    newMark$432 = fresh();
                    applyMarkToPatternEnv(newMark$432, match$429.patternEnv);
                    macroResult$433 = transcribe(caseBody$431, macroNameStx$426, match$429.patternEnv);
                    if (macroType$422 === 'case') {
                        macroResult$433 = evalMacroBody(macroResult$433, stxStore$428);
                    }
                    macroResult$433 = _$4.map(macroResult$433, function (stx$435) {
                        return stx$435.mark(newMark$432);
                    });
                    return {
                        result: macroResult$433,
                        rest: match$429.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$426.token.value);
        };
    }
    function loadMacroDef(mac$436) {
        var body$437 = mac$436.body;
        var caseOffset$438 = 0;
        var arrowOffset$439 = 0;
        var casePattern$440;
        var caseBody$441;
        var caseBodyIdx$442;
        var cases$443 = [];
        var i$444 = 0;
        var patOffset$445 = 1;
        var bodyOffset$446 = 4;
        var macroType$447;
        if (body$437[0] && body$437[0].token.value === 'rule' || body$437[0].token.value === 'case') {
            macroType$447 = body$437[0].token.value;
        } else {
            throwError('Macro definition must start with either \'rule\' or \'case\'');
        }
        while (i$444 < body$437.length && body$437[i$444].token.value === macroType$447) {
            if (!body$437[i$444 + patOffset$445] || body$437[i$444 + patOffset$445].token.type !== parser$5.Token.Delimiter || body$437[i$444 + patOffset$445].token.value !== '{}') {
                throwError('Expecting a {} to surround the pattern in a macro definition');
            }
            if (!body$437[i$444 + 2] || body$437[i$444 + 2].token.value !== '=' || !body$437[i$444 + 3] || body$437[i$444 + 3].token.value !== '>') {
                throwError('expecting a => following the pattern in a macro definition');
            }
            if (!body$437[i$444 + bodyOffset$446] || body$437[i$444 + bodyOffset$446].token.type !== parser$5.Token.Delimiter || body$437[i$444 + bodyOffset$446].token.value !== '{}') {
                throwError('Expecting a {} to surround the body in a macro definition');
            }
            casePattern$440 = body$437[i$444 + patOffset$445].token.inner;
            caseBody$441 = body$437[i$444 + bodyOffset$446].token.inner;
            cases$443.push({
                pattern: loadPattern(casePattern$440, mac$436.name),
                body: caseBody$441
            });
            i$444 += bodyOffset$446 + 1;
        }
        return makeTransformer(cases$443, macroType$447);
    }
    function expandToTermTree(stx$448, env$449, defscope$450, stxStore$451) {
        parser$5.assert(env$449, 'environment map is required');
        if (stx$448.length === 0) {
            return {
                terms: [],
                env: env$449
            };
        }
        parser$5.assert(stx$448[0].token, 'expecting a syntax object');
        var f$452 = enforest(stx$448, env$449, stxStore$451);
        var head$453 = f$452.result;
        var rest$454 = f$452.rest;
        if (head$453.hasPrototype(Macro$37)) {
            var macroDefinition$456 = loadMacroDef(head$453);
            env$449.set(head$453.name.token.value, macroDefinition$456);
            return expandToTermTree(rest$454, env$449, defscope$450, stxStore$451);
        }
        if (head$453.hasPrototype(VariableStatement$43)) {
            addVarsToDefinitionCtx(head$453, defscope$450);
        }
        if (head$453.hasPrototype(Block$24) && head$453.body.hasPrototype(Delimiter$33)) {
            head$453.body.delim.token.inner.forEach(function (term$457) {
                addVarsToDefinitionCtx(term$457, defscope$450);
            });
        }
        if (head$453.hasPrototype(Delimiter$33)) {
            head$453.delim.token.inner.forEach(function (term$458) {
                addVarsToDefinitionCtx(term$458, defscope$450);
            });
        }
        var trees$455 = expandToTermTree(rest$454, env$449, defscope$450, stxStore$451);
        return {
            terms: [head$453].concat(trees$455.terms),
            env: trees$455.env
        };
    }
    function addVarsToDefinitionCtx(term$459, defscope$460) {
        if (term$459.hasPrototype(VariableStatement$43)) {
            term$459.decls.forEach(function (decl$461) {
                var defctx$462 = defscope$460;
                parser$5.assert(defctx$462, 'no definition context found but there should always be one');
                var declRepeat$463 = _$4.find(defctx$462, function (def$464) {
                        return def$464.id.token.value === decl$461.ident.token.value && arraysEqual(marksof(def$464.id.context), marksof(decl$461.ident.context));
                    });
                if (declRepeat$463 !== null) {
                    var name$465 = fresh();
                    defctx$462.push({
                        id: decl$461.ident,
                        name: name$465
                    });
                }
            });
        }
    }
    function getVarDeclIdentifiers(term$466) {
        var toCheck$467;
        var body$470 = term$466.body;
        var delim$479 = term$466.delim;
        if (term$466.hasPrototype(Block$24)) {
            var delim$479 = body$470.delim;
            if (body$470.hasPrototype(Delimiter$33)) {
                toCheck$467 = body$470.delim.token.inner;
            }
        } else if (term$466.hasPrototype(Delimiter$33)) {
            toCheck$467 = delim$479.token.inner;
        } else {
            parser$5.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$4.reduce(toCheck$467, function (acc$483, curr$484, idx$485, list$486) {
            var prev$487 = list$486[idx$485 - 1];
            if (curr$484.hasPrototype(VariableStatement$43)) {
                return _$4.reduce(curr$484.decls, function (acc$488, decl$489) {
                    return acc$488.concat(decl$489.ident);
                }, acc$483);
            } else if (prev$487 && prev$487.hasPrototype(Keyword$31) && prev$487.keyword.token.value === 'for' && curr$484.hasPrototype(Delimiter$33)) {
                return acc$483.concat(getVarDeclIdentifiers(curr$484));
            } else if (curr$484.hasPrototype(Block$24)) {
                return acc$483.concat(getVarDeclIdentifiers(curr$484));
            }
            return acc$483;
        }, []);
    }
    function replaceVarIdent(stx$490, orig$491, renamed$492) {
        if (stx$490 === orig$491) {
            return renamed$492;
        }
        return stx$490;
    }
    function expandTermTreeToFinal(term$493, env$494, ctx$495, defscope$496, stxStore$497) {
        parser$5.assert(env$494, 'environment map is required');
        parser$5.assert(ctx$495, 'context map is required');
        if (term$493.hasPrototype(ArrayLiteral$25)) {
            term$493.array.delim.token.inner = expand(term$493.array.delim.token.inner, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(Block$24)) {
            term$493.body.delim.token.inner = expand(term$493.body.delim.token.inner, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(ParenExpression$26)) {
            term$493.expr.delim.token.inner = expand(term$493.expr.delim.token.inner, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(Call$39)) {
            term$493.fun = expandTermTreeToFinal(term$493.fun, env$494, ctx$495, defscope$496, stxStore$497);
            term$493.args = _$4.map(term$493.args, function (arg$498) {
                return expandTermTreeToFinal(arg$498, env$494, ctx$495, defscope$496, stxStore$497);
            });
            return term$493;
        } else if (term$493.hasPrototype(UnaryOp$27)) {
            term$493.expr = expandTermTreeToFinal(term$493.expr, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(BinOp$29)) {
            term$493.left = expandTermTreeToFinal(term$493.left, env$494, ctx$495, defscope$496, stxStore$497);
            term$493.right = expandTermTreeToFinal(term$493.right, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(ObjDotGet$40)) {
            term$493.left = expandTermTreeToFinal(term$493.left, env$494, ctx$495, defscope$496, stxStore$497);
            term$493.right = expandTermTreeToFinal(term$493.right, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(VariableDeclaration$42)) {
            if (term$493.init) {
                term$493.init = expandTermTreeToFinal(term$493.init, env$494, ctx$495, defscope$496, stxStore$497);
            }
            return term$493;
        } else if (term$493.hasPrototype(VariableStatement$43)) {
            term$493.decls = _$4.map(term$493.decls, function (decl$499) {
                return expandTermTreeToFinal(decl$499, env$494, ctx$495, defscope$496, stxStore$497);
            });
            return term$493;
        } else if (term$493.hasPrototype(Delimiter$33)) {
            term$493.delim.token.inner = expand(term$493.delim.token.inner, env$494, ctx$495, defscope$496, stxStore$497);
            return term$493;
        } else if (term$493.hasPrototype(NamedFun$35) || term$493.hasPrototype(AnonFun$36) || term$493.hasPrototype(CatchClause$44)) {
            var newDef$500 = [];
            var params$501 = term$493.params.addDefCtx(newDef$500);
            var bodies$502 = term$493.body.addDefCtx(newDef$500);
            var paramNames$503 = _$4.map(getParamIdentifiers(params$501), function (param$512) {
                    var freshName$513 = fresh();
                    return {
                        freshName: freshName$513,
                        originalParam: param$512,
                        renamedParam: param$512.rename(param$512, freshName$513)
                    };
                });
            var newCtx$504 = ctx$495;
            var stxBody$505 = bodies$502;
            var renamedBody$506 = _$4.reduce(paramNames$503, function (accBody$514, p$515) {
                    return accBody$514.rename(p$515.originalParam, p$515.freshName);
                }, stxBody$505);
            var bodyTerms$507 = expand([renamedBody$506], env$494, newCtx$504, newDef$500, stxStore$497);
            parser$5.assert(bodyTerms$507.length === 1 && bodyTerms$507[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$508 = flatten(bodyTerms$507);
            var renamedParams$509 = _$4.map(paramNames$503, function (p$516) {
                    return p$516.renamedParam;
                });
            var flatArgs$510 = wrapDelim(joinSyntax(renamedParams$509, ','), term$493.params);
            var expandedArgs$511 = expand([flatArgs$510], env$494, ctx$495, newDef$500, stxStore$497);
            parser$5.assert(expandedArgs$511.length === 1, 'should only get back one result');
            term$493.params = expandedArgs$511[0];
            term$493.body = _$4.map(flattenedBody$508, function (stx$517) {
                return _$4.reduce(newDef$500, function (acc$518, def$519) {
                    return acc$518.rename(def$519.id, def$519.name);
                }, stx$517);
            });
            return term$493;
        }
        return term$493;
    }
    function expand(stx$520, env$521, ctx$522, defscope$523, stxStore$524) {
        env$521 = env$521 || new Map();
        ctx$522 = ctx$522 || new Map();
        stxStore$524 = stxStore$524 || new Map();
        var trees$525 = expandToTermTree(stx$520, env$521, defscope$523, stxStore$524);
        return _$4.map(trees$525.terms, function (term$526) {
            return expandTermTreeToFinal(term$526, trees$525.env, ctx$522, defscope$523, stxStore$524);
        });
    }
    function expandTopLevel(stx$527, stxStore$528) {
        var funn$529 = syntaxFromToken({
                value: 'function',
                type: parser$5.Token.Keyword
            });
        var name$530 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$5.Token.Identifier
            });
        var params$531 = syntaxFromToken({
                value: '()',
                type: parser$5.Token.Delimiter,
                inner: []
            });
        var body$532 = syntaxFromToken({
                value: '{}',
                type: parser$5.Token.Delimiter,
                inner: stx$527
            });
        var res$533 = expand([
                funn$529,
                name$530,
                params$531,
                body$532
            ], undefined, undefined, undefined, stxStore$528);
        return _$4.map(res$533[0].body.slice(1, res$533[0].body.length - 1), function (stx$534) {
            return stx$534;
        });
    }
    function flatten(terms$535) {
        return _$4.reduce(terms$535, function (acc$536, term$537) {
            return acc$536.concat(term$537.destruct(true));
        }, []);
    }
    exports$3.enforest = enforest;
    exports$3.expand = expandTopLevel;
    exports$3.resolve = resolve;
    exports$3.flatten = flatten;
    exports$3.tokensToSyntax = tokensToSyntax;
    exports$3.syntaxToTokens = syntaxToTokens;
}));