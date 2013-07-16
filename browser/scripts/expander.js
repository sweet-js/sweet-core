(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('underscore'), require('./parser'), require('es6-collections'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections'
        ], factory$2);
    } else {
        factory$2(root$1.expander = {}, root$1._, root$1.parser, root$1.es6);
    }
}(this, function (exports$4, _$5, parser$6, es6$7) {
    'use strict';
    exports$4._test = {};
    Object.prototype.create = function () {
        var o$10 = Object.create(this);
        if (typeof o$10.construct === 'function') {
            o$10.construct.apply(o$10, arguments);
        }
        return o$10;
    };
    Object.prototype.extend = function (properties$11) {
        var result$13 = Object.create(this);
        for (var prop in properties$11) {
            if (properties$11.hasOwnProperty(prop)) {
                result$13[prop] = properties$11[prop];
            }
        }
        return result$13;
    };
    Object.prototype.hasPrototype = function (proto$14) {
        function F() {
        }
        F.prototype = proto$14;
        return this instanceof F;
    };
    function throwError(msg$17) {
        throw new Error(msg$17);
    }
    function mkSyntax(value$19, type$20, stx$21) {
        return syntaxFromToken({
            type: type$20,
            value: value$19,
            lineStart: stx$21.token.lineStart,
            lineNumber: stx$21.token.lineNumber
        }, stx$21.context);
    }
    function Mark(mark$23, ctx$24) {
        return {
            mark: mark$23,
            context: ctx$24
        };
    }
    function Var(id$26) {
        return {id: id$26};
    }
    function isDef(ctx$28) {
        return ctx$28 && typeof ctx$28.defctx !== 'undefined';
    }
    var isMark$554 = function isMark$554(m$30) {
        return m$30 && typeof m$30.mark !== 'undefined';
    };
    function Rename(id$32, name$33, ctx$34, defctx$35) {
        defctx$35 = defctx$35 || null;
        return {
            id: id$32,
            name: name$33,
            context: ctx$34,
            def: defctx$35
        };
    }
    function Def(defctx$37, ctx$38) {
        return {
            defctx: defctx$37,
            context: ctx$38
        };
    }
    var isRename$555 = function (r$40) {
        return r$40 && typeof r$40.id !== 'undefined' && typeof r$40.name !== 'undefined';
    };
    var syntaxProto$556 = {
            mark: function mark(newMark$42) {
                var markedToken$46 = _$5.clone(this.token);
                if (this.token.inner) {
                    var markedInner$47 = _$5.map(this.token.inner, function (stx$44) {
                            return stx$44.mark(newMark$42);
                        });
                    markedToken$46.inner = markedInner$47;
                }
                var newMarkObj$48 = Mark(newMark$42, this.context);
                var stmp$49 = syntaxFromToken(markedToken$46, newMarkObj$48);
                return stmp$49;
            },
            rename: function (id$50, name$51) {
                if (this.token.inner) {
                    var renamedInner$55 = _$5.map(this.token.inner, function (stx$53) {
                            return stx$53.rename(id$50, name$51);
                        });
                    this.token.inner = renamedInner$55;
                }
                if (this.token.value === id$50.token.value) {
                    return syntaxFromToken(this.token, Rename(id$50, name$51, this.context));
                } else {
                    return this;
                }
            },
            addDefCtx: function (defctx$56) {
                if (this.token.inner) {
                    var renamedInner$60 = _$5.map(this.token.inner, function (stx$58) {
                            return stx$58.addDefCtx(defctx$56);
                        });
                    this.token.inner = renamedInner$60;
                }
                return syntaxFromToken(this.token, Def(defctx$56, this.context));
            },
            getDefCtx: function () {
                var ctx$62 = this.context;
                while (ctx$62 !== null) {
                    if (isDef(ctx$62)) {
                        return ctx$62.defctx;
                    }
                    ctx$62 = ctx$62.context;
                }
                return null;
            },
            toString: function () {
                var val$64 = this.token.type === parser$6.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$64 + ']';
            }
        };
    function syntaxFromToken(token$65, oldctx$66) {
        var ctx$68 = typeof oldctx$66 !== 'undefined' ? oldctx$66 : null;
        return Object.create(syntaxProto$556, {
            token: {
                value: token$65,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$68,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$69, mlist$70) {
        if (mark$69 === _$5.first(mlist$70)) {
            return _$5.rest(mlist$70, 1);
        }
        return [mark$69].concat(mlist$70);
    }
    function marksof(ctx$72, stopName$73, originalName$74) {
        var mark$76, submarks$77;
        if (isMark$554(ctx$72)) {
            mark$76 = ctx$72.mark;
            submarks$77 = marksof(ctx$72.context, stopName$73, originalName$74);
            return remdup(mark$76, submarks$77);
        }
        if (isDef(ctx$72)) {
            return marksof(ctx$72.context, stopName$73, originalName$74);
        }
        if (isRename$555(ctx$72)) {
            if (stopName$73 === originalName$74 + '$' + ctx$72.name) {
                return [];
            }
            return marksof(ctx$72.context, stopName$73, originalName$74);
        }
        return [];
    }
    function resolve(stx$78) {
        return resolveCtx(stx$78.token.value, stx$78.context, [], []);
    }
    function arraysEqual(a$80, b$81) {
        if (a$80.length !== b$81.length) {
            return false;
        }
        for (var i$83 = 0; i$83 < a$80.length; i$83++) {
            if (a$80[i$83] !== b$81[i$83]) {
                return false;
            }
        }
        return true;
    }
    function renames(defctx$84, oldctx$85) {
        var acc$89 = oldctx$85;
        defctx$84.forEach(function (def$87) {
            acc$89 = Rename(def$87.id, def$87.name, acc$89, defctx$84);
        });
        return acc$89;
    }
    function resolveCtx(originalName$90, ctx$91, stop_spine$92, stop_branch$93) {
        if (isMark$554(ctx$91)) {
            return resolveCtx(originalName$90, ctx$91.context, stop_spine$92, stop_branch$93);
        }
        if (isDef(ctx$91)) {
            if (_$5.contains(stop_spine$92, ctx$91.defctx)) {
                return resolveCtx(originalName$90, ctx$91.context, stop_spine$92, stop_branch$93);
            } else {
                return resolveCtx(originalName$90, renames(ctx$91.defctx, ctx$91.context), stop_spine$92, _$5.union(stop_branch$93, [ctx$91.defctx]));
            }
        }
        if (isRename$555(ctx$91)) {
            var idName$95 = resolveCtx(ctx$91.id.token.value, ctx$91.id.context, stop_branch$93, stop_branch$93);
            var subName$96 = resolveCtx(originalName$90, ctx$91.context, _$5.union(stop_spine$92, [ctx$91.def]), stop_branch$93);
            if (idName$95 === subName$96) {
                var idMarks$97 = marksof(ctx$91.id.context, originalName$90 + '$' + ctx$91.name, originalName$90);
                var subMarks$98 = marksof(ctx$91.context, originalName$90 + '$' + ctx$91.name, originalName$90);
                if (arraysEqual(idMarks$97, subMarks$98)) {
                    return originalName$90 + '$' + ctx$91.name;
                }
            }
            return resolveCtx(originalName$90, ctx$91.context, _$5.union(stop_spine$92, [ctx$91.def]), stop_branch$93);
        }
        return originalName$90;
    }
    var nextFresh$557 = 0;
    function fresh() {
        return nextFresh$557++;
    }
    ;
    function tokensToSyntax(tokens$100) {
        if (!_$5.isArray(tokens$100)) {
            tokens$100 = [tokens$100];
        }
        return _$5.map(tokens$100, function (token$102) {
            if (token$102.inner) {
                token$102.inner = tokensToSyntax(token$102.inner);
            }
            return syntaxFromToken(token$102);
        });
    }
    function syntaxToTokens(syntax$104) {
        return _$5.map(syntax$104, function (stx$106) {
            if (stx$106.token.inner) {
                stx$106.token.inner = syntaxToTokens(stx$106.token.inner);
            }
            return stx$106.token;
        });
    }
    function isPatternVar(token$108) {
        return token$108.type === parser$6.Token.Identifier && token$108.value[0] === '$' && token$108.value !== '$';
    }
    var containsPatternVar$558 = function (patterns$110) {
        return _$5.any(patterns$110, function (pat$112) {
            if (pat$112.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$558(pat$112.token.inner);
            }
            return isPatternVar(pat$112);
        });
    };
    function loadPattern(patterns$114) {
        return _$5.chain(patterns$114).reduce(function (acc$116, patStx$117, idx$118) {
            var last$120 = patterns$114[idx$118 - 1];
            var lastLast$121 = patterns$114[idx$118 - 2];
            var next$122 = patterns$114[idx$118 + 1];
            var nextNext$123 = patterns$114[idx$118 + 2];
            if (patStx$117.token.value === ':') {
                if (last$120 && isPatternVar(last$120.token)) {
                    return acc$116;
                }
            }
            if (last$120 && last$120.token.value === ':') {
                if (lastLast$121 && isPatternVar(lastLast$121.token)) {
                    return acc$116;
                }
            }
            if (patStx$117.token.value === '$' && next$122 && next$122.token.type === parser$6.Token.Delimiter) {
                return acc$116;
            }
            if (isPatternVar(patStx$117.token)) {
                if (next$122 && next$122.token.value === ':') {
                    parser$6.assert(typeof nextNext$123 !== 'undefined', 'expecting a pattern class');
                    patStx$117.class = nextNext$123.token.value;
                } else {
                    patStx$117.class = 'token';
                }
            } else if (patStx$117.token.type === parser$6.Token.Delimiter) {
                if (last$120 && last$120.token.value === '$') {
                    patStx$117.class = 'pattern_group';
                }
                patStx$117.token.inner = loadPattern(patStx$117.token.inner);
            } else {
                patStx$117.class = 'pattern_literal';
            }
            return acc$116.concat(patStx$117);
        }, []).reduce(function (acc$124, patStx$125, idx$126, patterns$127) {
            var separator$129 = ' ';
            var repeat$130 = false;
            var next$131 = patterns$127[idx$126 + 1];
            var nextNext$132 = patterns$127[idx$126 + 2];
            if (next$131 && next$131.token.value === '...') {
                repeat$130 = true;
                separator$129 = ' ';
            } else if (delimIsSeparator(next$131) && nextNext$132 && nextNext$132.token.value === '...') {
                repeat$130 = true;
                parser$6.assert(next$131.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$129 = next$131.token.inner[0].token.value;
            }
            if (patStx$125.token.value === '...' || delimIsSeparator(patStx$125) && next$131 && next$131.token.value === '...') {
                return acc$124;
            }
            patStx$125.repeat = repeat$130;
            patStx$125.separator = separator$129;
            return acc$124.concat(patStx$125);
        }, []).value();
    }
    function takeLineContext(from$133, to$134) {
        return _$5.map(to$134, function (stx$136) {
            if (stx$136.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$136.token.value,
                    inner: stx$136.token.inner,
                    startRange: from$133.range,
                    endRange: from$133.range,
                    startLineNumber: from$133.token.lineNumber,
                    startLineStart: from$133.token.lineStart,
                    endLineNumber: from$133.token.lineNumber,
                    endLineStart: from$133.token.lineStart
                }, stx$136.context);
            }
            return syntaxFromToken({
                value: stx$136.token.value,
                type: stx$136.token.type,
                lineNumber: from$133.token.lineNumber,
                lineStart: from$133.token.lineStart,
                range: from$133.token.range
            }, stx$136.context);
        });
    }
    function joinRepeatedMatch(tojoin$138, punc$139) {
        return _$5.reduce(_$5.rest(tojoin$138, 1), function (acc$141, join$142) {
            if (punc$139 === ' ') {
                return acc$141.concat(join$142.match);
            }
            return acc$141.concat(mkSyntax(punc$139, parser$6.Token.Punctuator, _$5.first(join$142.match)), join$142.match);
        }, _$5.first(tojoin$138).match);
    }
    function joinSyntax(tojoin$144, punc$145) {
        if (tojoin$144.length === 0) {
            return [];
        }
        if (punc$145 === ' ') {
            return tojoin$144;
        }
        return _$5.reduce(_$5.rest(tojoin$144, 1), function (acc$147, join$148) {
            return acc$147.concat(mkSyntax(punc$145, parser$6.Token.Punctuator, join$148), join$148);
        }, [_$5.first(tojoin$144)]);
    }
    function joinSyntaxArr(tojoin$150, punc$151) {
        if (tojoin$150.length === 0) {
            return [];
        }
        if (punc$151 === ' ') {
            return _$5.flatten(tojoin$150, true);
        }
        return _$5.reduce(_$5.rest(tojoin$150, 1), function (acc$153, join$154) {
            return acc$153.concat(mkSyntax(punc$151, parser$6.Token.Punctuator, _$5.first(join$154)), join$154);
        }, _$5.first(tojoin$150));
    }
    function delimIsSeparator(delim$156) {
        return delim$156 && delim$156.token.type === parser$6.Token.Delimiter && delim$156.token.value === '()' && delim$156.token.inner.length === 1 && delim$156.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$558(delim$156.token.inner);
    }
    function freeVarsInPattern(pattern$158) {
        var fv$162 = [];
        _$5.each(pattern$158, function (pat$160) {
            if (isPatternVar(pat$160.token)) {
                fv$162.push(pat$160.token.value);
            } else if (pat$160.token.type === parser$6.Token.Delimiter) {
                fv$162 = fv$162.concat(freeVarsInPattern(pat$160.token.inner));
            }
        });
        return fv$162;
    }
    function patternLength(patterns$163) {
        return _$5.reduce(patterns$163, function (acc$165, pat$166) {
            if (pat$166.token.type === parser$6.Token.Delimiter) {
                return acc$165 + 1 + patternLength(pat$166.token.inner);
            }
            return acc$165 + 1;
        }, 0);
    }
    function matchStx(value$168, stx$169) {
        return stx$169 && stx$169.token && stx$169.token.value === value$168;
    }
    function wrapDelim(towrap$171, delimSyntax$172) {
        parser$6.assert(delimSyntax$172.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$172.token.value,
            inner: towrap$171,
            range: delimSyntax$172.token.range,
            startLineNumber: delimSyntax$172.token.startLineNumber,
            lineStart: delimSyntax$172.token.lineStart
        }, delimSyntax$172.context);
    }
    function getParamIdentifiers(argSyntax$174) {
        parser$6.assert(argSyntax$174.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$174.token.inner, function (stx$176) {
            return stx$176.token.value !== ',';
        });
    }
    function isFunctionStx(stx$178) {
        return stx$178 && stx$178.token.type === parser$6.Token.Keyword && stx$178.token.value === 'function';
    }
    function isVarStx(stx$180) {
        return stx$180 && stx$180.token.type === parser$6.Token.Keyword && stx$180.token.value === 'var';
    }
    function varNamesInAST(ast$182) {
        return _$5.map(ast$182, function (item$184) {
            return item$184.id.name;
        });
    }
    var TermTree$559 = {destruct: function (breakDelim$186) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$188, prop$189) {
                    if (this[prop$189] && this[prop$189].hasPrototype(TermTree$559)) {
                        return acc$188.concat(this[prop$189].destruct(breakDelim$186));
                    } else if (this[prop$189]) {
                        return acc$188.concat(this[prop$189]);
                    } else {
                        return acc$188;
                    }
                }, this), []);
            }};
    var EOF$560 = TermTree$559.extend({
            properties: ['eof'],
            construct: function (e$191) {
                this.eof = e$191;
            }
        });
    var Statement$561 = TermTree$559.extend({construct: function () {
            }});
    var Expr$562 = TermTree$559.extend({construct: function () {
            }});
    var PrimaryExpression$563 = Expr$562.extend({construct: function () {
            }});
    var ThisExpression$564 = PrimaryExpression$563.extend({
            properties: ['this'],
            construct: function (that$196) {
                this.this = that$196;
            }
        });
    var Lit$565 = PrimaryExpression$563.extend({
            properties: ['lit'],
            construct: function (l$198) {
                this.lit = l$198;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$566;
    var PropertyAssignment$566 = TermTree$559.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$200, assignment$201) {
                this.propName = propName$200;
                this.assignment = assignment$201;
            }
        });
    var Block$567 = PrimaryExpression$563.extend({
            properties: ['body'],
            construct: function (body$203) {
                this.body = body$203;
            }
        });
    var ArrayLiteral$568 = PrimaryExpression$563.extend({
            properties: ['array'],
            construct: function (ar$205) {
                this.array = ar$205;
            }
        });
    var ParenExpression$569 = PrimaryExpression$563.extend({
            properties: ['expr'],
            construct: function (expr$207) {
                this.expr = expr$207;
            }
        });
    var UnaryOp$570 = Expr$562.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$209, expr$210) {
                this.op = op$209;
                this.expr = expr$210;
            }
        });
    var PostfixOp$571 = Expr$562.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$212, op$213) {
                this.expr = expr$212;
                this.op = op$213;
            }
        });
    var BinOp$572 = Expr$562.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$215, left$216, right$217) {
                this.op = op$215;
                this.left = left$216;
                this.right = right$217;
            }
        });
    var ConditionalExpression$573 = Expr$562.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$219, question$220, tru$221, colon$222, fls$223) {
                this.cond = cond$219;
                this.question = question$220;
                this.tru = tru$221;
                this.colon = colon$222;
                this.fls = fls$223;
            }
        });
    var Keyword$574 = TermTree$559.extend({
            properties: ['keyword'],
            construct: function (k$225) {
                this.keyword = k$225;
            }
        });
    var Punc$575 = TermTree$559.extend({
            properties: ['punc'],
            construct: function (p$227) {
                this.punc = p$227;
            }
        });
    var Delimiter$576 = TermTree$559.extend({
            properties: ['delim'],
            destruct: function (breakDelim$229) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$234 = _$5.reduce(this.delim.token.inner, function (acc$231, term$232) {
                        if (term$232.hasPrototype(TermTree$559)) {
                            return acc$231.concat(term$232.destruct(breakDelim$229));
                        } else {
                            return acc$231.concat(term$232);
                        }
                    }, []);
                if (breakDelim$229) {
                    var openParen$235 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$236 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$235].concat(innerStx$234).concat(closeParen$236);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$237) {
                this.delim = d$237;
            }
        });
    var Id$577 = PrimaryExpression$563.extend({
            properties: ['id'],
            construct: function (id$239) {
                this.id = id$239;
            }
        });
    var NamedFun$578 = Expr$562.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$241, name$242, params$243, body$244) {
                this.keyword = keyword$241;
                this.name = name$242;
                this.params = params$243;
                this.body = body$244;
            }
        });
    var AnonFun$579 = Expr$562.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$246, params$247, body$248) {
                this.keyword = keyword$246;
                this.params = params$247;
                this.body = body$248;
            }
        });
    var Macro$580 = TermTree$559.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$250, body$251) {
                this.name = name$250;
                this.body = body$251;
            }
        });
    var Const$581 = Expr$562.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$253, call$254) {
                this.newterm = newterm$253;
                this.call = call$254;
            }
        });
    var Call$582 = Expr$562.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$256) {
                parser$6.assert(this.fun.hasPrototype(TermTree$559), 'expecting a term tree in destruct of call');
                var that$262 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$258, term$259) {
                    parser$6.assert(term$259 && term$259.hasPrototype(TermTree$559), 'expecting term trees in destruct of Call');
                    var dst$261 = acc$258.concat(term$259.destruct(breakDelim$256));
                    if (that$262.commas.length > 0) {
                        dst$261 = dst$261.concat(that$262.commas.shift());
                    }
                    return dst$261;
                }, []);
                return this.fun.destruct(breakDelim$256).concat(Delimiter$576.create(this.delim).destruct(breakDelim$256));
            },
            construct: function (funn$263, args$264, delim$265, commas$266) {
                parser$6.assert(Array.isArray(args$264), 'requires an array of arguments terms');
                this.fun = funn$263;
                this.args = args$264;
                this.delim = delim$265;
                this.commas = commas$266;
            }
        });
    var ObjDotGet$583 = Expr$562.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$268, dot$269, right$270) {
                this.left = left$268;
                this.dot = dot$269;
                this.right = right$270;
            }
        });
    var ObjGet$584 = Expr$562.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$272, right$273) {
                this.left = left$272;
                this.right = right$273;
            }
        });
    var VariableDeclaration$585 = TermTree$559.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$275, eqstx$276, init$277, comma$278) {
                this.ident = ident$275;
                this.eqstx = eqstx$276;
                this.init = init$277;
                this.comma = comma$278;
            }
        });
    var VariableStatement$586 = Statement$561.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$280) {
                return this.varkw.destruct(breakDelim$280).concat(_$5.reduce(this.decls, function (acc$282, decl$283) {
                    return acc$282.concat(decl$283.destruct(breakDelim$280));
                }, []));
            },
            construct: function (varkw$285, decls$286) {
                parser$6.assert(Array.isArray(decls$286), 'decls must be an array');
                this.varkw = varkw$285;
                this.decls = decls$286;
            }
        });
    var CatchClause$587 = TermTree$559.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$288, params$289, body$290) {
                this.catchkw = catchkw$288;
                this.params = params$289;
                this.body = body$290;
            }
        });
    var Empty$588 = TermTree$559.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$293) {
        var staticOperators$295 = [
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
        return _$5.contains(staticOperators$295, stx$293.token.value);
    }
    function stxIsBinOp(stx$296) {
        var staticOperators$298 = [
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
        return _$5.contains(staticOperators$298, stx$296.token.value);
    }
    function enforestVarStatement(stx$299, env$300) {
        parser$6.assert(stx$299[0] && stx$299[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$302 = [], rest$303 = stx$299, initRes$304, subRes$305;
        if (stx$299[1] && stx$299[1].token.type === parser$6.Token.Punctuator && stx$299[1].token.value === '=') {
            initRes$304 = enforest(stx$299.slice(2), env$300);
            if (initRes$304.result.hasPrototype(Expr$562)) {
                rest$303 = initRes$304.rest;
                if (initRes$304.rest[0].token.type === parser$6.Token.Punctuator && initRes$304.rest[0].token.value === ',' && initRes$304.rest[1] && initRes$304.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$302.push(VariableDeclaration$585.create(stx$299[0], stx$299[1], initRes$304.result, initRes$304.rest[0]));
                    subRes$305 = enforestVarStatement(initRes$304.rest.slice(1), env$300);
                    decls$302 = decls$302.concat(subRes$305.result);
                    rest$303 = subRes$305.rest;
                } else {
                    decls$302.push(VariableDeclaration$585.create(stx$299[0], stx$299[1], initRes$304.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$299[1] && stx$299[1].token.type === parser$6.Token.Punctuator && stx$299[1].token.value === ',') {
            decls$302.push(VariableDeclaration$585.create(stx$299[0], null, null, stx$299[1]));
            subRes$305 = enforestVarStatement(stx$299.slice(2), env$300);
            decls$302 = decls$302.concat(subRes$305.result);
            rest$303 = subRes$305.rest;
        } else {
            decls$302.push(VariableDeclaration$585.create(stx$299[0]));
            rest$303 = stx$299.slice(1);
        }
        return {
            result: decls$302,
            rest: rest$303
        };
    }
    function enforest(toks$306, env$307) {
        env$307 = env$307 || new Map();
        parser$6.assert(toks$306.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$309, rest$310) {
            var innerTokens$314;
            parser$6.assert(Array.isArray(rest$310), 'result must at least be an empty array');
            if (head$309.hasPrototype(TermTree$559)) {
                if (head$309.hasPrototype(Expr$562) && rest$310[0] && rest$310[0].token.type === parser$6.Token.Delimiter && rest$310[0].token.value === '()') {
                    var argRes$315, enforestedArgs$316 = [], commas$317 = [];
                    innerTokens$314 = rest$310[0].token.inner;
                    while (innerTokens$314.length > 0) {
                        argRes$315 = enforest(innerTokens$314, env$307);
                        enforestedArgs$316.push(argRes$315.result);
                        innerTokens$314 = argRes$315.rest;
                        if (innerTokens$314[0] && innerTokens$314[0].token.value === ',') {
                            commas$317.push(innerTokens$314[0]);
                            innerTokens$314 = innerTokens$314.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$318 = _$5.all(enforestedArgs$316, function (argTerm$312) {
                            return argTerm$312.hasPrototype(Expr$562);
                        });
                    if (innerTokens$314.length === 0 && argsAreExprs$318) {
                        return step(Call$582.create(head$309, enforestedArgs$316, rest$310[0], commas$317), rest$310.slice(1));
                    }
                } else if (head$309.hasPrototype(Keyword$574) && head$309.keyword.token.value === 'new' && rest$310[0]) {
                    var newCallRes$319 = enforest(rest$310, env$307);
                    if (newCallRes$319.result.hasPrototype(Call$582)) {
                        return step(Const$581.create(head$309, newCallRes$319.result), newCallRes$319.rest);
                    }
                } else if (head$309.hasPrototype(Expr$562) && rest$310[0] && rest$310[0].token.value === '?') {
                    var question$320 = rest$310[0];
                    var condRes$321 = enforest(rest$310.slice(1), env$307);
                    var truExpr$322 = condRes$321.result;
                    var right$329 = condRes$321.rest;
                    if (truExpr$322.hasPrototype(Expr$562) && right$329[0] && right$329[0].token.value === ':') {
                        var colon$323 = right$329[0];
                        var flsRes$324 = enforest(right$329.slice(1), env$307);
                        var flsExpr$325 = flsRes$324.result;
                        if (flsExpr$325.hasPrototype(Expr$562)) {
                            return step(ConditionalExpression$573.create(head$309, question$320, truExpr$322, colon$323, flsExpr$325), flsRes$324.rest);
                        }
                    }
                } else if (head$309.hasPrototype(Delimiter$576) && head$309.delim.token.value === '()') {
                    innerTokens$314 = head$309.delim.token.inner;
                    if (innerTokens$314.length === 0) {
                        return step(ParenExpression$569.create(head$309), rest$310);
                    } else {
                        var innerTerm$326 = get_expression(innerTokens$314, env$307);
                        if (innerTerm$326.result && innerTerm$326.result.hasPrototype(Expr$562)) {
                            return step(ParenExpression$569.create(head$309), rest$310);
                        }
                    }
                } else if (rest$310[0] && rest$310[1] && stxIsBinOp(rest$310[0])) {
                    var op$331 = rest$310[0];
                    var left$327 = head$309;
                    var bopRes$328 = enforest(rest$310.slice(1), env$307);
                    var right$329 = bopRes$328.result;
                    if (right$329.hasPrototype(Expr$562)) {
                        return step(BinOp$572.create(op$331, left$327, right$329), bopRes$328.rest);
                    }
                } else if (head$309.hasPrototype(Punc$575) && stxIsUnaryOp(head$309.punc) || head$309.hasPrototype(Keyword$574) && stxIsUnaryOp(head$309.keyword)) {
                    var unopRes$330 = enforest(rest$310);
                    var op$331 = head$309.hasPrototype(Punc$575) ? head$309.punc : head$309.keyword;
                    if (unopRes$330.result.hasPrototype(Expr$562)) {
                        return step(UnaryOp$570.create(op$331, unopRes$330.result), unopRes$330.rest);
                    }
                } else if (head$309.hasPrototype(Expr$562) && rest$310[0] && (rest$310[0].token.value === '++' || rest$310[0].token.value === '--')) {
                    return step(PostfixOp$571.create(head$309, rest$310[0]), rest$310.slice(1));
                } else if (head$309.hasPrototype(Expr$562) && rest$310[0] && rest$310[0].token.value === '[]') {
                    var getRes$332 = enforest(rest$310[0].token.inner, env$307);
                    var resStx$333 = mkSyntax('[]', parser$6.Token.Delimiter, rest$310[0]);
                    resStx$333.token.inner = [getRes$332.result];
                    if (getRes$332.rest.length > 0) {
                        return step(ObjGet$584.create(head$309, Delimiter$576.create(resStx$333)), rest$310.slice(1));
                    }
                } else if (head$309.hasPrototype(Expr$562) && rest$310[0] && rest$310[0].token.value === '.' && rest$310[1] && rest$310[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$583.create(head$309, rest$310[0], rest$310[1]), rest$310.slice(2));
                } else if (head$309.hasPrototype(Delimiter$576) && head$309.delim.token.value === '[]') {
                    return step(ArrayLiteral$568.create(head$309), rest$310);
                } else if (head$309.hasPrototype(Delimiter$576) && head$309.delim.token.value === '{}') {
                    innerTokens$314 = head$309.delim.token.inner;
                    return step(Block$567.create(head$309), rest$310);
                } else if (head$309.hasPrototype(Keyword$574) && head$309.keyword.token.value === 'var' && rest$310[0] && rest$310[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$334 = enforestVarStatement(rest$310, env$307);
                    if (vsRes$334) {
                        return step(VariableStatement$586.create(head$309, vsRes$334.result), vsRes$334.rest);
                    }
                }
            } else {
                parser$6.assert(head$309 && head$309.token, 'assuming head is a syntax object');
                if ((head$309.token.type === parser$6.Token.Identifier || head$309.token.type === parser$6.Token.Keyword) && env$307.has(head$309.token.value)) {
                    var transformer$335 = env$307.get(head$309.token.value);
                    var rt$336 = transformer$335(rest$310, head$309, env$307);
                    if (rt$336.result.length > 0) {
                        return step(rt$336.result[0], rt$336.result.slice(1).concat(rt$336.rest));
                    } else {
                        return step(Empty$588.create(), rt$336.rest);
                    }
                } else if (head$309.token.type === parser$6.Token.Identifier && head$309.token.value === 'macro' && rest$310[0] && (rest$310[0].token.type === parser$6.Token.Identifier || rest$310[0].token.type === parser$6.Token.Keyword) && rest$310[1] && rest$310[1].token.type === parser$6.Token.Delimiter && rest$310[1].token.value === '{}') {
                    return step(Macro$580.create(rest$310[0], rest$310[1].token.inner), rest$310.slice(2));
                } else if (head$309.token.type === parser$6.Token.Keyword && head$309.token.value === 'function' && rest$310[0] && rest$310[0].token.type === parser$6.Token.Identifier && rest$310[1] && rest$310[1].token.type === parser$6.Token.Delimiter && rest$310[1].token.value === '()' && rest$310[2] && rest$310[2].token.type === parser$6.Token.Delimiter && rest$310[2].token.value === '{}') {
                    return step(NamedFun$578.create(head$309, rest$310[0], rest$310[1], rest$310[2]), rest$310.slice(3));
                } else if (head$309.token.type === parser$6.Token.Keyword && head$309.token.value === 'function' && rest$310[0] && rest$310[0].token.type === parser$6.Token.Delimiter && rest$310[0].token.value === '()' && rest$310[1] && rest$310[1].token.type === parser$6.Token.Delimiter && rest$310[1].token.value === '{}') {
                    return step(AnonFun$579.create(head$309, rest$310[0], rest$310[1]), rest$310.slice(2));
                } else if (head$309.token.type === parser$6.Token.Keyword && head$309.token.value === 'catch' && rest$310[0] && rest$310[0].token.type === parser$6.Token.Delimiter && rest$310[0].token.value === '()' && rest$310[1] && rest$310[1].token.type === parser$6.Token.Delimiter && rest$310[1].token.value === '{}') {
                    return step(CatchClause$587.create(head$309, rest$310[0], rest$310[1]), rest$310.slice(2));
                } else if (head$309.token.type === parser$6.Token.Keyword && head$309.token.value === 'this') {
                    return step(ThisExpression$564.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.NumericLiteral || head$309.token.type === parser$6.Token.StringLiteral || head$309.token.type === parser$6.Token.BooleanLiteral || head$309.token.type === parser$6.Token.RegexLiteral || head$309.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$565.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.Identifier) {
                    return step(Id$577.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$575.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.Keyword && head$309.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$309.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$574.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$576.create(head$309), rest$310);
                } else if (head$309.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$310.length === 0, 'nothing should be after an EOF');
                    return step(EOF$560.create(head$309), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$309,
                rest: rest$310
            };
        }
        return step(toks$306[0], toks$306.slice(1));
    }
    function get_expression(stx$337, env$338) {
        var res$340 = enforest(stx$337, env$338);
        if (!res$340.result.hasPrototype(Expr$562)) {
            return {
                result: null,
                rest: stx$337
            };
        }
        return res$340;
    }
    function typeIsLiteral(type$341) {
        return type$341 === parser$6.Token.NullLiteral || type$341 === parser$6.Token.NumericLiteral || type$341 === parser$6.Token.StringLiteral || type$341 === parser$6.Token.RegexLiteral || type$341 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$343, stx$344, env$345) {
        var result$347, rest$348;
        if (patternClass$343 === 'token' && stx$344[0] && stx$344[0].token.type !== parser$6.Token.EOF) {
            result$347 = [stx$344[0]];
            rest$348 = stx$344.slice(1);
        } else if (patternClass$343 === 'lit' && stx$344[0] && typeIsLiteral(stx$344[0].token.type)) {
            result$347 = [stx$344[0]];
            rest$348 = stx$344.slice(1);
        } else if (patternClass$343 === 'ident' && stx$344[0] && stx$344[0].token.type === parser$6.Token.Identifier) {
            result$347 = [stx$344[0]];
            rest$348 = stx$344.slice(1);
        } else if (patternClass$343 === 'VariableStatement') {
            var match$349 = enforest(stx$344, env$345);
            if (match$349.result && match$349.result.hasPrototype(VariableStatement$586)) {
                result$347 = match$349.result.destruct(false);
                rest$348 = match$349.rest;
            } else {
                result$347 = null;
                rest$348 = stx$344;
            }
        } else if (patternClass$343 === 'expr') {
            var match$349 = get_expression(stx$344, env$345);
            if (match$349.result === null || !match$349.result.hasPrototype(Expr$562)) {
                result$347 = null;
                rest$348 = stx$344;
            } else {
                result$347 = match$349.result.destruct(false);
                rest$348 = match$349.rest;
            }
        } else {
            result$347 = null;
            rest$348 = stx$344;
        }
        return {
            result: result$347,
            rest: rest$348
        };
    }
    function matchPattern(pattern$350, stx$351, env$352, patternEnv$353) {
        var subMatch$358;
        var match$359, matchEnv$360;
        var rest$361;
        var success$362;
        if (stx$351.length === 0) {
            return {
                success: false,
                rest: stx$351,
                patternEnv: patternEnv$353
            };
        }
        parser$6.assert(stx$351.length > 0, 'should have had something to match here');
        if (pattern$350.token.type === parser$6.Token.Delimiter) {
            if (pattern$350.class === 'pattern_group') {
                subMatch$358 = matchPatterns(pattern$350.token.inner, stx$351, env$352, false);
                rest$361 = subMatch$358.rest;
            } else if (stx$351[0].token.type === parser$6.Token.Delimiter && stx$351[0].token.value === pattern$350.token.value) {
                subMatch$358 = matchPatterns(pattern$350.token.inner, stx$351[0].token.inner, env$352, false);
                rest$361 = stx$351.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$351,
                    patternEnv: patternEnv$353
                };
            }
            success$362 = subMatch$358.success;
            _$5.keys(subMatch$358.patternEnv).forEach(function (patternKey$355) {
                if (pattern$350.repeat) {
                    var nextLevel$357 = subMatch$358.patternEnv[patternKey$355].level + 1;
                    if (patternEnv$353[patternKey$355]) {
                        patternEnv$353[patternKey$355].level = nextLevel$357;
                        patternEnv$353[patternKey$355].match.push(subMatch$358.patternEnv[patternKey$355]);
                    } else {
                        patternEnv$353[patternKey$355] = {
                            level: nextLevel$357,
                            match: [subMatch$358.patternEnv[patternKey$355]]
                        };
                    }
                } else {
                    patternEnv$353[patternKey$355] = subMatch$358.patternEnv[patternKey$355];
                }
            });
        } else {
            if (pattern$350.class === 'pattern_literal') {
                if (pattern$350.token.value === stx$351[0].token.value) {
                    success$362 = true;
                    rest$361 = stx$351.slice(1);
                } else {
                    success$362 = false;
                    rest$361 = stx$351;
                }
            } else {
                match$359 = matchPatternClass(pattern$350.class, stx$351, env$352);
                success$362 = match$359.result !== null;
                rest$361 = match$359.rest;
                matchEnv$360 = {
                    level: 0,
                    match: match$359.result
                };
                if (match$359.result !== null) {
                    if (pattern$350.repeat) {
                        if (patternEnv$353[pattern$350.token.value]) {
                            patternEnv$353[pattern$350.token.value].match.push(matchEnv$360);
                        } else {
                            patternEnv$353[pattern$350.token.value] = {
                                level: 1,
                                match: [matchEnv$360]
                            };
                        }
                    } else {
                        patternEnv$353[pattern$350.token.value] = matchEnv$360;
                    }
                }
            }
        }
        return {
            success: success$362,
            rest: rest$361,
            patternEnv: patternEnv$353
        };
    }
    function matchPatterns(patterns$363, stx$364, env$365, topLevel$366) {
        topLevel$366 = topLevel$366 || false;
        var result$368 = [];
        var patternEnv$369 = {};
        var match$370;
        var pattern$371;
        var rest$372 = stx$364;
        var success$373 = true;
        for (var i$374 = 0; i$374 < patterns$363.length; i$374++) {
            pattern$371 = patterns$363[i$374];
            do {
                match$370 = matchPattern(pattern$371, rest$372, env$365, patternEnv$369);
                if (!match$370.success) {
                    success$373 = false;
                }
                rest$372 = match$370.rest;
                patternEnv$369 = match$370.patternEnv;
                if (pattern$371.repeat && success$373) {
                    if (rest$372[0] && rest$372[0].token.value === pattern$371.separator) {
                        rest$372 = rest$372.slice(1);
                    } else if (pattern$371.separator === ' ') {
                        continue;
                    } else if (pattern$371.separator !== ' ' && rest$372.length > 0 && i$374 === patterns$363.length - 1 && topLevel$366 === false) {
                        success$373 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$371.repeat && match$370.success && rest$372.length > 0);
        }
        return {
            success: success$373,
            rest: rest$372,
            patternEnv: patternEnv$369
        };
    }
    function transcribe(macroBody$375, macroNameStx$376, env$377) {
        return _$5.chain(macroBody$375).reduce(function (acc$379, bodyStx$380, idx$381, original$382) {
            var last$384 = original$382[idx$381 - 1];
            var next$385 = original$382[idx$381 + 1];
            var nextNext$386 = original$382[idx$381 + 2];
            if (bodyStx$380.token.value === '...') {
                return acc$379;
            }
            if (delimIsSeparator(bodyStx$380) && next$385 && next$385.token.value === '...') {
                return acc$379;
            }
            if (bodyStx$380.token.value === '$' && next$385 && next$385.token.type === parser$6.Token.Delimiter && next$385.token.value === '()') {
                return acc$379;
            }
            if (bodyStx$380.token.value === '$' && next$385 && next$385.token.type === parser$6.Token.Delimiter && next$385.token.value === '[]') {
                next$385.literal = true;
                return acc$379;
            }
            if (bodyStx$380.token.type === parser$6.Token.Delimiter && bodyStx$380.token.value === '()' && last$384 && last$384.token.value === '$') {
                bodyStx$380.group = true;
            }
            if (bodyStx$380.literal === true) {
                parser$6.assert(bodyStx$380.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$379.concat(bodyStx$380.token.inner);
            }
            if (next$385 && next$385.token.value === '...') {
                bodyStx$380.repeat = true;
                bodyStx$380.separator = ' ';
            } else if (delimIsSeparator(next$385) && nextNext$386 && nextNext$386.token.value === '...') {
                bodyStx$380.repeat = true;
                bodyStx$380.separator = next$385.token.inner[0].token.value;
            }
            return acc$379.concat(bodyStx$380);
        }, []).reduce(function (acc$387, bodyStx$388, idx$389) {
            if (bodyStx$388.repeat) {
                if (bodyStx$388.token.type === parser$6.Token.Delimiter) {
                    var fv$405 = _$5.filter(freeVarsInPattern(bodyStx$388.token.inner), function (pat$391) {
                            return env$377.hasOwnProperty(pat$391);
                        });
                    var restrictedEnv$406 = [];
                    var nonScalar$407 = _$5.find(fv$405, function (pat$393) {
                            return env$377[pat$393].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$407 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$408 = env$377[nonScalar$407].match.length;
                    var sameLength$409 = _$5.all(fv$405, function (pat$395) {
                            return env$377[pat$395].level === 0 || env$377[pat$395].match.length === repeatLength$408;
                        });
                    parser$6.assert(sameLength$409, 'all non-scalars must have the same length');
                    restrictedEnv$406 = _$5.map(_$5.range(repeatLength$408), function (idx$397) {
                        var renv$401 = {};
                        _$5.each(fv$405, function (pat$399) {
                            if (env$377[pat$399].level === 0) {
                                renv$401[pat$399] = env$377[pat$399];
                            } else {
                                renv$401[pat$399] = env$377[pat$399].match[idx$397];
                            }
                        });
                        return renv$401;
                    });
                    var transcribed$410 = _$5.map(restrictedEnv$406, function (renv$402) {
                            if (bodyStx$388.group) {
                                return transcribe(bodyStx$388.token.inner, macroNameStx$376, renv$402);
                            } else {
                                var newBody$404 = syntaxFromToken(_$5.clone(bodyStx$388.token), bodyStx$388.context);
                                newBody$404.token.inner = transcribe(bodyStx$388.token.inner, macroNameStx$376, renv$402);
                                return newBody$404;
                            }
                        });
                    var joined$411;
                    if (bodyStx$388.group) {
                        joined$411 = joinSyntaxArr(transcribed$410, bodyStx$388.separator);
                    } else {
                        joined$411 = joinSyntax(transcribed$410, bodyStx$388.separator);
                    }
                    return acc$387.concat(joined$411);
                }
                parser$6.assert(env$377[bodyStx$388.token.value].level === 1, 'ellipses level does not match');
                return acc$387.concat(joinRepeatedMatch(env$377[bodyStx$388.token.value].match, bodyStx$388.separator));
            } else {
                if (bodyStx$388.token.type === parser$6.Token.Delimiter) {
                    var newBody$412 = syntaxFromToken(_$5.clone(bodyStx$388.token), macroBody$375.context);
                    newBody$412.token.inner = transcribe(bodyStx$388.token.inner, macroNameStx$376, env$377);
                    return acc$387.concat(newBody$412);
                }
                if (Object.prototype.hasOwnProperty.bind(env$377)(bodyStx$388.token.value)) {
                    parser$6.assert(env$377[bodyStx$388.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$388.token.value);
                    return acc$387.concat(takeLineContext(macroNameStx$376, env$377[bodyStx$388.token.value].match));
                }
                return acc$387.concat(takeLineContext(macroNameStx$376, [bodyStx$388]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$413, env$414) {
        function dfs(match$416) {
            if (match$416.level === 0) {
                match$416.match = _$5.map(match$416.match, function (stx$418) {
                    return stx$418.mark(newMark$413);
                });
            } else {
                _$5.each(match$416.match, function (match$420) {
                    dfs(match$420);
                });
            }
        }
        _$5.keys(env$414).forEach(function (key$422) {
            dfs(env$414[key$422]);
        });
    }
    function makeTransformer(cases$424, macroName$425) {
        var sortedCases$441 = _$5.sortBy(cases$424, function (mcase$427) {
                return patternLength(mcase$427.pattern);
            }).reverse();
        return function transformer(stx$429, macroNameStx$430, env$431) {
            var match$435;
            var casePattern$436, caseBody$437;
            var newMark$438;
            var macroResult$439;
            for (var i$440 = 0; i$440 < sortedCases$441.length; i$440++) {
                casePattern$436 = sortedCases$441[i$440].pattern;
                caseBody$437 = sortedCases$441[i$440].body;
                match$435 = matchPatterns(casePattern$436, stx$429, env$431, true);
                if (match$435.success) {
                    newMark$438 = fresh();
                    applyMarkToPatternEnv(newMark$438, match$435.patternEnv);
                    macroResult$439 = transcribe(caseBody$437, macroNameStx$430, match$435.patternEnv);
                    macroResult$439 = _$5.map(macroResult$439, function (stx$433) {
                        return stx$433.mark(newMark$438);
                    });
                    return {
                        result: macroResult$439,
                        rest: match$435.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$430.token.value);
        };
    }
    function findCase(start$442, stx$443) {
        parser$6.assert(start$442 >= 0 && start$442 < stx$443.length, 'start out of bounds');
        var idx$445 = start$442;
        while (idx$445 < stx$443.length) {
            if (stx$443[idx$445].token.value === 'case') {
                return idx$445;
            }
            idx$445++;
        }
        return -1;
    }
    function findCaseArrow(start$446, stx$447) {
        parser$6.assert(start$446 >= 0 && start$446 < stx$447.length, 'start out of bounds');
        var idx$449 = start$446;
        while (idx$449 < stx$447.length) {
            if (stx$447[idx$449].token.value === '=' && stx$447[idx$449 + 1] && stx$447[idx$449 + 1].token.value === '>') {
                return idx$449;
            }
            idx$449++;
        }
        return -1;
    }
    function loadMacroDef(mac$450) {
        var body$452 = mac$450.body;
        var caseOffset$453 = 0;
        var arrowOffset$454 = 0;
        var casePattern$455;
        var caseBody$456;
        var caseBodyIdx$457;
        var cases$458 = [];
        while (caseOffset$453 < body$452.length && body$452[caseOffset$453].token.value === 'case') {
            arrowOffset$454 = findCaseArrow(caseOffset$453, body$452);
            if (arrowOffset$454 > 0 && arrowOffset$454 < body$452.length) {
                caseBodyIdx$457 = arrowOffset$454 + 2;
                if (caseBodyIdx$457 >= body$452.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$455 = body$452.slice(caseOffset$453 + 1, arrowOffset$454);
                caseBody$456 = body$452[caseBodyIdx$457].token.inner;
                cases$458.push({
                    pattern: loadPattern(casePattern$455, mac$450.name),
                    body: caseBody$456
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$453 = findCase(arrowOffset$454, body$452);
            if (caseOffset$453 < 0) {
                break;
            }
        }
        return makeTransformer(cases$458);
    }
    function expandToTermTree(stx$459, env$460, defscope$461) {
        parser$6.assert(env$460, 'environment map is required');
        if (stx$459.length === 0) {
            return {
                terms: [],
                env: env$460
            };
        }
        parser$6.assert(stx$459[0].token, 'expecting a syntax object');
        var f$467 = enforest(stx$459, env$460);
        var head$468 = f$467.result;
        var rest$469 = f$467.rest;
        if (head$468.hasPrototype(Macro$580)) {
            var macroDefinition$470 = loadMacroDef(head$468);
            env$460.set(head$468.name.token.value, macroDefinition$470);
            return expandToTermTree(rest$469, env$460, defscope$461);
        }
        if (head$468.hasPrototype(VariableStatement$586)) {
            addVarsToDefinitionCtx(head$468, defscope$461);
        }
        if (head$468.hasPrototype(Block$567) && head$468.body.hasPrototype(Delimiter$576)) {
            head$468.body.delim.token.inner.forEach(function (term$463) {
                addVarsToDefinitionCtx(term$463, defscope$461);
            });
        }
        if (head$468.hasPrototype(Delimiter$576)) {
            head$468.delim.token.inner.forEach(function (term$465) {
                addVarsToDefinitionCtx(term$465, defscope$461);
            });
        }
        var trees$471 = expandToTermTree(rest$469, env$460, defscope$461);
        return {
            terms: [head$468].concat(trees$471.terms),
            env: trees$471.env
        };
    }
    function addVarsToDefinitionCtx(term$472, defscope$473) {
        if (term$472.hasPrototype(VariableStatement$586)) {
            term$472.decls.forEach(function (decl$475) {
                var defctx$479 = defscope$473;
                parser$6.assert(defctx$479, 'no definition context found but there should always be one');
                var declRepeat$480 = _$5.find(defctx$479, function (def$477) {
                        return def$477.id.token.value === decl$475.ident.token.value && arraysEqual(marksof(def$477.id.context), marksof(decl$475.ident.context));
                    });
                if (declRepeat$480 !== null) {
                    var name$481 = fresh();
                    defctx$479.push({
                        id: decl$475.ident,
                        name: name$481
                    });
                }
            });
        }
    }
    function getVarDeclIdentifiers(term$482) {
        var toCheck$493;
        if (term$482.hasPrototype(Block$567) && term$482.body.hasPrototype(Delimiter$576)) {
            toCheck$493 = term$482.body.delim.token.inner;
        } else if (term$482.hasPrototype(Delimiter$576)) {
            toCheck$493 = term$482.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$493, function (acc$484, curr$485, idx$486, list$487) {
            var prev$492 = list$487[idx$486 - 1];
            if (curr$485.hasPrototype(VariableStatement$586)) {
                return _$5.reduce(curr$485.decls, function (acc$489, decl$490) {
                    return acc$489.concat(decl$490.ident);
                }, acc$484);
            } else if (prev$492 && prev$492.hasPrototype(Keyword$574) && prev$492.keyword.token.value === 'for' && curr$485.hasPrototype(Delimiter$576)) {
                return acc$484.concat(getVarDeclIdentifiers(curr$485));
            } else if (curr$485.hasPrototype(Block$567)) {
                return acc$484.concat(getVarDeclIdentifiers(curr$485));
            }
            return acc$484;
        }, []);
    }
    function replaceVarIdent(stx$494, orig$495, renamed$496) {
        if (stx$494 === orig$495) {
            return renamed$496;
        }
        return stx$494;
    }
    function expandTermTreeToFinal(term$498, env$499, ctx$500, defscope$501) {
        parser$6.assert(env$499, 'environment map is required');
        parser$6.assert(ctx$500, 'context map is required');
        if (term$498.hasPrototype(ArrayLiteral$568)) {
            term$498.array.delim.token.inner = expand(term$498.array.delim.token.inner, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(Block$567)) {
            term$498.body.delim.token.inner = expand(term$498.body.delim.token.inner, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(ParenExpression$569)) {
            term$498.expr.delim.token.inner = expand(term$498.expr.delim.token.inner, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(Call$582)) {
            term$498.fun = expandTermTreeToFinal(term$498.fun, env$499, ctx$500, defscope$501);
            term$498.args = _$5.map(term$498.args, function (arg$503) {
                return expandTermTreeToFinal(arg$503, env$499, ctx$500, defscope$501);
            });
            return term$498;
        } else if (term$498.hasPrototype(UnaryOp$570)) {
            term$498.expr = expandTermTreeToFinal(term$498.expr, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(BinOp$572)) {
            term$498.left = expandTermTreeToFinal(term$498.left, env$499, ctx$500, defscope$501);
            term$498.right = expandTermTreeToFinal(term$498.right, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(ObjDotGet$583)) {
            term$498.left = expandTermTreeToFinal(term$498.left, env$499, ctx$500, defscope$501);
            term$498.right = expandTermTreeToFinal(term$498.right, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(VariableDeclaration$585)) {
            if (term$498.init) {
                term$498.init = expandTermTreeToFinal(term$498.init, env$499, ctx$500, defscope$501);
            }
            return term$498;
        } else if (term$498.hasPrototype(VariableStatement$586)) {
            term$498.decls = _$5.map(term$498.decls, function (decl$505) {
                return expandTermTreeToFinal(decl$505, env$499, ctx$500, defscope$501);
            });
            return term$498;
        } else if (term$498.hasPrototype(Delimiter$576)) {
            term$498.delim.token.inner = expand(term$498.delim.token.inner, env$499, ctx$500, defscope$501);
            return term$498;
        } else if (term$498.hasPrototype(NamedFun$578) || term$498.hasPrototype(AnonFun$579) || term$498.hasPrototype(CatchClause$587)) {
            var newDef$520 = [];
            var params$521 = term$498.params.addDefCtx(newDef$520);
            var bodies$522 = term$498.body.addDefCtx(newDef$520);
            var paramNames$523 = _$5.map(getParamIdentifiers(params$521), function (param$507) {
                    var freshName$509 = fresh();
                    return {
                        freshName: freshName$509,
                        originalParam: param$507,
                        renamedParam: param$507.rename(param$507, freshName$509)
                    };
                });
            var newCtx$524 = ctx$500;
            var stxBody$525 = bodies$522;
            var renamedBody$526 = _$5.reduce(paramNames$523, function (accBody$510, p$511) {
                    return accBody$510.rename(p$511.originalParam, p$511.freshName);
                }, stxBody$525);
            var bodyTerms$527 = expand([renamedBody$526], env$499, newCtx$524, newDef$520);
            parser$6.assert(bodyTerms$527.length === 1 && bodyTerms$527[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$528 = flatten(bodyTerms$527);
            var renamedParams$529 = _$5.map(paramNames$523, function (p$513) {
                    return p$513.renamedParam;
                });
            var flatArgs$530 = wrapDelim(joinSyntax(renamedParams$529, ','), term$498.params);
            var expandedArgs$531 = expand([flatArgs$530.addDefCtx(newDef$520)], env$499, ctx$500, newDef$520);
            parser$6.assert(expandedArgs$531.length === 1, 'should only get back one result');
            term$498.params = expandedArgs$531[0];
            term$498.body = _$5.map(flattenedBody$528, function (stx$515) {
                return _$5.reduce(newDef$520, function (acc$517, def$518) {
                    return acc$517.rename(def$518.id, def$518.name);
                }, stx$515);
            });
            return term$498;
        }
        return term$498;
    }
    function expand(stx$532, env$533, ctx$534, defscope$535) {
        env$533 = env$533 || new Map();
        ctx$534 = ctx$534 || new Map();
        var trees$539 = expandToTermTree(stx$532, env$533, defscope$535);
        return _$5.map(trees$539.terms, function (term$537) {
            return expandTermTreeToFinal(term$537, trees$539.env, ctx$534, defscope$535);
        });
    }
    function expandTopLevel(stx$540) {
        var funn$544 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$545 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$546 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$547 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$540
            });
        var res$548 = expand([
                funn$544,
                name$545,
                params$546,
                body$547
            ]);
        return _$5.map(res$548[0].body.slice(1, res$548[0].body.length - 1), function (stx$542) {
            return stx$542;
        });
    }
    function flatten(terms$549) {
        return _$5.reduce(terms$549, function (acc$551, term$552) {
            return acc$551.concat(term$552.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));