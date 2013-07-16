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
    var isMark$555 = function isMark$555(m$30) {
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
    var isRename$556 = function (r$40) {
        return r$40 && typeof r$40.id !== 'undefined' && typeof r$40.name !== 'undefined';
    };
    var syntaxProto$557 = {
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
        return Object.create(syntaxProto$557, {
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
        if (isMark$555(ctx$72)) {
            mark$76 = ctx$72.mark;
            submarks$77 = marksof(ctx$72.context, stopName$73, originalName$74);
            return remdup(mark$76, submarks$77);
        }
        if (isDef(ctx$72)) {
            return marksof(ctx$72.context, stopName$73, originalName$74);
        }
        if (isRename$556(ctx$72)) {
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
    function renames(defctx$84, oldctx$85, originalName$86) {
        var acc$90 = oldctx$85;
        defctx$84.forEach(function (def$88) {
            if (def$88.id.token.value === originalName$86) {
                acc$90 = Rename(def$88.id, def$88.name, acc$90, defctx$84);
            }
        });
        return acc$90;
    }
    function resolveCtx(originalName$91, ctx$92, stop_spine$93, stop_branch$94) {
        if (isMark$555(ctx$92)) {
            return resolveCtx(originalName$91, ctx$92.context, stop_spine$93, stop_branch$94);
        }
        if (isDef(ctx$92)) {
            if (_$5.contains(stop_spine$93, ctx$92.defctx)) {
                return resolveCtx(originalName$91, ctx$92.context, stop_spine$93, stop_branch$94);
            } else {
                return resolveCtx(originalName$91, renames(ctx$92.defctx, ctx$92.context, originalName$91), stop_spine$93, _$5.union(stop_branch$94, [ctx$92.defctx]));
            }
        }
        if (isRename$556(ctx$92)) {
            var idName$96 = resolveCtx(ctx$92.id.token.value, ctx$92.id.context, stop_branch$94, stop_branch$94);
            var subName$97 = resolveCtx(originalName$91, ctx$92.context, _$5.union(stop_spine$93, [ctx$92.def]), stop_branch$94);
            if (idName$96 === subName$97) {
                var idMarks$98 = marksof(ctx$92.id.context, originalName$91 + '$' + ctx$92.name, originalName$91);
                var subMarks$99 = marksof(ctx$92.context, originalName$91 + '$' + ctx$92.name, originalName$91);
                if (arraysEqual(idMarks$98, subMarks$99)) {
                    return originalName$91 + '$' + ctx$92.name;
                }
            }
            return resolveCtx(originalName$91, ctx$92.context, _$5.union(stop_spine$93, [ctx$92.def]), stop_branch$94);
        }
        return originalName$91;
    }
    var nextFresh$558 = 0;
    function fresh() {
        return nextFresh$558++;
    }
    ;
    function tokensToSyntax(tokens$101) {
        if (!_$5.isArray(tokens$101)) {
            tokens$101 = [tokens$101];
        }
        return _$5.map(tokens$101, function (token$103) {
            if (token$103.inner) {
                token$103.inner = tokensToSyntax(token$103.inner);
            }
            return syntaxFromToken(token$103);
        });
    }
    function syntaxToTokens(syntax$105) {
        return _$5.map(syntax$105, function (stx$107) {
            if (stx$107.token.inner) {
                stx$107.token.inner = syntaxToTokens(stx$107.token.inner);
            }
            return stx$107.token;
        });
    }
    function isPatternVar(token$109) {
        return token$109.type === parser$6.Token.Identifier && token$109.value[0] === '$' && token$109.value !== '$';
    }
    var containsPatternVar$559 = function (patterns$111) {
        return _$5.any(patterns$111, function (pat$113) {
            if (pat$113.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$559(pat$113.token.inner);
            }
            return isPatternVar(pat$113);
        });
    };
    function loadPattern(patterns$115) {
        return _$5.chain(patterns$115).reduce(function (acc$117, patStx$118, idx$119) {
            var last$121 = patterns$115[idx$119 - 1];
            var lastLast$122 = patterns$115[idx$119 - 2];
            var next$123 = patterns$115[idx$119 + 1];
            var nextNext$124 = patterns$115[idx$119 + 2];
            if (patStx$118.token.value === ':') {
                if (last$121 && isPatternVar(last$121.token)) {
                    return acc$117;
                }
            }
            if (last$121 && last$121.token.value === ':') {
                if (lastLast$122 && isPatternVar(lastLast$122.token)) {
                    return acc$117;
                }
            }
            if (patStx$118.token.value === '$' && next$123 && next$123.token.type === parser$6.Token.Delimiter) {
                return acc$117;
            }
            if (isPatternVar(patStx$118.token)) {
                if (next$123 && next$123.token.value === ':') {
                    parser$6.assert(typeof nextNext$124 !== 'undefined', 'expecting a pattern class');
                    patStx$118.class = nextNext$124.token.value;
                } else {
                    patStx$118.class = 'token';
                }
            } else if (patStx$118.token.type === parser$6.Token.Delimiter) {
                if (last$121 && last$121.token.value === '$') {
                    patStx$118.class = 'pattern_group';
                }
                patStx$118.token.inner = loadPattern(patStx$118.token.inner);
            } else {
                patStx$118.class = 'pattern_literal';
            }
            return acc$117.concat(patStx$118);
        }, []).reduce(function (acc$125, patStx$126, idx$127, patterns$128) {
            var separator$130 = ' ';
            var repeat$131 = false;
            var next$132 = patterns$128[idx$127 + 1];
            var nextNext$133 = patterns$128[idx$127 + 2];
            if (next$132 && next$132.token.value === '...') {
                repeat$131 = true;
                separator$130 = ' ';
            } else if (delimIsSeparator(next$132) && nextNext$133 && nextNext$133.token.value === '...') {
                repeat$131 = true;
                parser$6.assert(next$132.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$130 = next$132.token.inner[0].token.value;
            }
            if (patStx$126.token.value === '...' || delimIsSeparator(patStx$126) && next$132 && next$132.token.value === '...') {
                return acc$125;
            }
            patStx$126.repeat = repeat$131;
            patStx$126.separator = separator$130;
            return acc$125.concat(patStx$126);
        }, []).value();
    }
    function takeLineContext(from$134, to$135) {
        return _$5.map(to$135, function (stx$137) {
            if (stx$137.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$137.token.value,
                    inner: stx$137.token.inner,
                    startRange: from$134.range,
                    endRange: from$134.range,
                    startLineNumber: from$134.token.lineNumber,
                    startLineStart: from$134.token.lineStart,
                    endLineNumber: from$134.token.lineNumber,
                    endLineStart: from$134.token.lineStart
                }, stx$137.context);
            }
            return syntaxFromToken({
                value: stx$137.token.value,
                type: stx$137.token.type,
                lineNumber: from$134.token.lineNumber,
                lineStart: from$134.token.lineStart,
                range: from$134.token.range
            }, stx$137.context);
        });
    }
    function joinRepeatedMatch(tojoin$139, punc$140) {
        return _$5.reduce(_$5.rest(tojoin$139, 1), function (acc$142, join$143) {
            if (punc$140 === ' ') {
                return acc$142.concat(join$143.match);
            }
            return acc$142.concat(mkSyntax(punc$140, parser$6.Token.Punctuator, _$5.first(join$143.match)), join$143.match);
        }, _$5.first(tojoin$139).match);
    }
    function joinSyntax(tojoin$145, punc$146) {
        if (tojoin$145.length === 0) {
            return [];
        }
        if (punc$146 === ' ') {
            return tojoin$145;
        }
        return _$5.reduce(_$5.rest(tojoin$145, 1), function (acc$148, join$149) {
            return acc$148.concat(mkSyntax(punc$146, parser$6.Token.Punctuator, join$149), join$149);
        }, [_$5.first(tojoin$145)]);
    }
    function joinSyntaxArr(tojoin$151, punc$152) {
        if (tojoin$151.length === 0) {
            return [];
        }
        if (punc$152 === ' ') {
            return _$5.flatten(tojoin$151, true);
        }
        return _$5.reduce(_$5.rest(tojoin$151, 1), function (acc$154, join$155) {
            return acc$154.concat(mkSyntax(punc$152, parser$6.Token.Punctuator, _$5.first(join$155)), join$155);
        }, _$5.first(tojoin$151));
    }
    function delimIsSeparator(delim$157) {
        return delim$157 && delim$157.token.type === parser$6.Token.Delimiter && delim$157.token.value === '()' && delim$157.token.inner.length === 1 && delim$157.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$559(delim$157.token.inner);
    }
    function freeVarsInPattern(pattern$159) {
        var fv$163 = [];
        _$5.each(pattern$159, function (pat$161) {
            if (isPatternVar(pat$161.token)) {
                fv$163.push(pat$161.token.value);
            } else if (pat$161.token.type === parser$6.Token.Delimiter) {
                fv$163 = fv$163.concat(freeVarsInPattern(pat$161.token.inner));
            }
        });
        return fv$163;
    }
    function patternLength(patterns$164) {
        return _$5.reduce(patterns$164, function (acc$166, pat$167) {
            if (pat$167.token.type === parser$6.Token.Delimiter) {
                return acc$166 + 1 + patternLength(pat$167.token.inner);
            }
            return acc$166 + 1;
        }, 0);
    }
    function matchStx(value$169, stx$170) {
        return stx$170 && stx$170.token && stx$170.token.value === value$169;
    }
    function wrapDelim(towrap$172, delimSyntax$173) {
        parser$6.assert(delimSyntax$173.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$173.token.value,
            inner: towrap$172,
            range: delimSyntax$173.token.range,
            startLineNumber: delimSyntax$173.token.startLineNumber,
            lineStart: delimSyntax$173.token.lineStart
        }, delimSyntax$173.context);
    }
    function getParamIdentifiers(argSyntax$175) {
        parser$6.assert(argSyntax$175.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$175.token.inner, function (stx$177) {
            return stx$177.token.value !== ',';
        });
    }
    function isFunctionStx(stx$179) {
        return stx$179 && stx$179.token.type === parser$6.Token.Keyword && stx$179.token.value === 'function';
    }
    function isVarStx(stx$181) {
        return stx$181 && stx$181.token.type === parser$6.Token.Keyword && stx$181.token.value === 'var';
    }
    function varNamesInAST(ast$183) {
        return _$5.map(ast$183, function (item$185) {
            return item$185.id.name;
        });
    }
    var TermTree$560 = {destruct: function (breakDelim$187) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$189, prop$190) {
                    if (this[prop$190] && this[prop$190].hasPrototype(TermTree$560)) {
                        return acc$189.concat(this[prop$190].destruct(breakDelim$187));
                    } else if (this[prop$190]) {
                        return acc$189.concat(this[prop$190]);
                    } else {
                        return acc$189;
                    }
                }, this), []);
            }};
    var EOF$561 = TermTree$560.extend({
            properties: ['eof'],
            construct: function (e$192) {
                this.eof = e$192;
            }
        });
    var Statement$562 = TermTree$560.extend({construct: function () {
            }});
    var Expr$563 = TermTree$560.extend({construct: function () {
            }});
    var PrimaryExpression$564 = Expr$563.extend({construct: function () {
            }});
    var ThisExpression$565 = PrimaryExpression$564.extend({
            properties: ['this'],
            construct: function (that$197) {
                this.this = that$197;
            }
        });
    var Lit$566 = PrimaryExpression$564.extend({
            properties: ['lit'],
            construct: function (l$199) {
                this.lit = l$199;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$567;
    var PropertyAssignment$567 = TermTree$560.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$201, assignment$202) {
                this.propName = propName$201;
                this.assignment = assignment$202;
            }
        });
    var Block$568 = PrimaryExpression$564.extend({
            properties: ['body'],
            construct: function (body$204) {
                this.body = body$204;
            }
        });
    var ArrayLiteral$569 = PrimaryExpression$564.extend({
            properties: ['array'],
            construct: function (ar$206) {
                this.array = ar$206;
            }
        });
    var ParenExpression$570 = PrimaryExpression$564.extend({
            properties: ['expr'],
            construct: function (expr$208) {
                this.expr = expr$208;
            }
        });
    var UnaryOp$571 = Expr$563.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$210, expr$211) {
                this.op = op$210;
                this.expr = expr$211;
            }
        });
    var PostfixOp$572 = Expr$563.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$213, op$214) {
                this.expr = expr$213;
                this.op = op$214;
            }
        });
    var BinOp$573 = Expr$563.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$216, left$217, right$218) {
                this.op = op$216;
                this.left = left$217;
                this.right = right$218;
            }
        });
    var ConditionalExpression$574 = Expr$563.extend({
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
    var Keyword$575 = TermTree$560.extend({
            properties: ['keyword'],
            construct: function (k$226) {
                this.keyword = k$226;
            }
        });
    var Punc$576 = TermTree$560.extend({
            properties: ['punc'],
            construct: function (p$228) {
                this.punc = p$228;
            }
        });
    var Delimiter$577 = TermTree$560.extend({
            properties: ['delim'],
            destruct: function (breakDelim$230) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$235 = _$5.reduce(this.delim.token.inner, function (acc$232, term$233) {
                        if (term$233.hasPrototype(TermTree$560)) {
                            return acc$232.concat(term$233.destruct(breakDelim$230));
                        } else {
                            return acc$232.concat(term$233);
                        }
                    }, []);
                if (breakDelim$230) {
                    var openParen$236 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$237 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$236].concat(innerStx$235).concat(closeParen$237);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$238) {
                this.delim = d$238;
            }
        });
    var Id$578 = PrimaryExpression$564.extend({
            properties: ['id'],
            construct: function (id$240) {
                this.id = id$240;
            }
        });
    var NamedFun$579 = Expr$563.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$242, name$243, params$244, body$245) {
                this.keyword = keyword$242;
                this.name = name$243;
                this.params = params$244;
                this.body = body$245;
            }
        });
    var AnonFun$580 = Expr$563.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$247, params$248, body$249) {
                this.keyword = keyword$247;
                this.params = params$248;
                this.body = body$249;
            }
        });
    var Macro$581 = TermTree$560.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$251, body$252) {
                this.name = name$251;
                this.body = body$252;
            }
        });
    var Const$582 = Expr$563.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$254, call$255) {
                this.newterm = newterm$254;
                this.call = call$255;
            }
        });
    var Call$583 = Expr$563.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$257) {
                parser$6.assert(this.fun.hasPrototype(TermTree$560), 'expecting a term tree in destruct of call');
                var that$263 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$259, term$260) {
                    parser$6.assert(term$260 && term$260.hasPrototype(TermTree$560), 'expecting term trees in destruct of Call');
                    var dst$262 = acc$259.concat(term$260.destruct(breakDelim$257));
                    if (that$263.commas.length > 0) {
                        dst$262 = dst$262.concat(that$263.commas.shift());
                    }
                    return dst$262;
                }, []);
                return this.fun.destruct(breakDelim$257).concat(Delimiter$577.create(this.delim).destruct(breakDelim$257));
            },
            construct: function (funn$264, args$265, delim$266, commas$267) {
                parser$6.assert(Array.isArray(args$265), 'requires an array of arguments terms');
                this.fun = funn$264;
                this.args = args$265;
                this.delim = delim$266;
                this.commas = commas$267;
            }
        });
    var ObjDotGet$584 = Expr$563.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$269, dot$270, right$271) {
                this.left = left$269;
                this.dot = dot$270;
                this.right = right$271;
            }
        });
    var ObjGet$585 = Expr$563.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$273, right$274) {
                this.left = left$273;
                this.right = right$274;
            }
        });
    var VariableDeclaration$586 = TermTree$560.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$276, eqstx$277, init$278, comma$279) {
                this.ident = ident$276;
                this.eqstx = eqstx$277;
                this.init = init$278;
                this.comma = comma$279;
            }
        });
    var VariableStatement$587 = Statement$562.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$281) {
                return this.varkw.destruct(breakDelim$281).concat(_$5.reduce(this.decls, function (acc$283, decl$284) {
                    return acc$283.concat(decl$284.destruct(breakDelim$281));
                }, []));
            },
            construct: function (varkw$286, decls$287) {
                parser$6.assert(Array.isArray(decls$287), 'decls must be an array');
                this.varkw = varkw$286;
                this.decls = decls$287;
            }
        });
    var CatchClause$588 = TermTree$560.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$289, params$290, body$291) {
                this.catchkw = catchkw$289;
                this.params = params$290;
                this.body = body$291;
            }
        });
    var Empty$589 = TermTree$560.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$294) {
        var staticOperators$296 = [
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
        return _$5.contains(staticOperators$296, stx$294.token.value);
    }
    function stxIsBinOp(stx$297) {
        var staticOperators$299 = [
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
        return _$5.contains(staticOperators$299, stx$297.token.value);
    }
    function enforestVarStatement(stx$300, env$301) {
        parser$6.assert(stx$300[0] && stx$300[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$303 = [], rest$304 = stx$300, initRes$305, subRes$306;
        if (stx$300[1] && stx$300[1].token.type === parser$6.Token.Punctuator && stx$300[1].token.value === '=') {
            initRes$305 = enforest(stx$300.slice(2), env$301);
            if (initRes$305.result.hasPrototype(Expr$563)) {
                rest$304 = initRes$305.rest;
                if (initRes$305.rest[0].token.type === parser$6.Token.Punctuator && initRes$305.rest[0].token.value === ',' && initRes$305.rest[1] && initRes$305.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$303.push(VariableDeclaration$586.create(stx$300[0], stx$300[1], initRes$305.result, initRes$305.rest[0]));
                    subRes$306 = enforestVarStatement(initRes$305.rest.slice(1), env$301);
                    decls$303 = decls$303.concat(subRes$306.result);
                    rest$304 = subRes$306.rest;
                } else {
                    decls$303.push(VariableDeclaration$586.create(stx$300[0], stx$300[1], initRes$305.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$300[1] && stx$300[1].token.type === parser$6.Token.Punctuator && stx$300[1].token.value === ',') {
            decls$303.push(VariableDeclaration$586.create(stx$300[0], null, null, stx$300[1]));
            subRes$306 = enforestVarStatement(stx$300.slice(2), env$301);
            decls$303 = decls$303.concat(subRes$306.result);
            rest$304 = subRes$306.rest;
        } else {
            decls$303.push(VariableDeclaration$586.create(stx$300[0]));
            rest$304 = stx$300.slice(1);
        }
        return {
            result: decls$303,
            rest: rest$304
        };
    }
    function enforest(toks$307, env$308) {
        env$308 = env$308 || new Map();
        parser$6.assert(toks$307.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$310, rest$311) {
            var innerTokens$315;
            parser$6.assert(Array.isArray(rest$311), 'result must at least be an empty array');
            if (head$310.hasPrototype(TermTree$560)) {
                if (head$310.hasPrototype(Expr$563) && rest$311[0] && rest$311[0].token.type === parser$6.Token.Delimiter && rest$311[0].token.value === '()') {
                    var argRes$316, enforestedArgs$317 = [], commas$318 = [];
                    innerTokens$315 = rest$311[0].token.inner;
                    while (innerTokens$315.length > 0) {
                        argRes$316 = enforest(innerTokens$315, env$308);
                        enforestedArgs$317.push(argRes$316.result);
                        innerTokens$315 = argRes$316.rest;
                        if (innerTokens$315[0] && innerTokens$315[0].token.value === ',') {
                            commas$318.push(innerTokens$315[0]);
                            innerTokens$315 = innerTokens$315.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$319 = _$5.all(enforestedArgs$317, function (argTerm$313) {
                            return argTerm$313.hasPrototype(Expr$563);
                        });
                    if (innerTokens$315.length === 0 && argsAreExprs$319) {
                        return step(Call$583.create(head$310, enforestedArgs$317, rest$311[0], commas$318), rest$311.slice(1));
                    }
                } else if (head$310.hasPrototype(Keyword$575) && head$310.keyword.token.value === 'new' && rest$311[0]) {
                    var newCallRes$320 = enforest(rest$311, env$308);
                    if (newCallRes$320.result.hasPrototype(Call$583)) {
                        return step(Const$582.create(head$310, newCallRes$320.result), newCallRes$320.rest);
                    }
                } else if (head$310.hasPrototype(Expr$563) && rest$311[0] && rest$311[0].token.value === '?') {
                    var question$321 = rest$311[0];
                    var condRes$322 = enforest(rest$311.slice(1), env$308);
                    var truExpr$323 = condRes$322.result;
                    var right$330 = condRes$322.rest;
                    if (truExpr$323.hasPrototype(Expr$563) && right$330[0] && right$330[0].token.value === ':') {
                        var colon$324 = right$330[0];
                        var flsRes$325 = enforest(right$330.slice(1), env$308);
                        var flsExpr$326 = flsRes$325.result;
                        if (flsExpr$326.hasPrototype(Expr$563)) {
                            return step(ConditionalExpression$574.create(head$310, question$321, truExpr$323, colon$324, flsExpr$326), flsRes$325.rest);
                        }
                    }
                } else if (head$310.hasPrototype(Delimiter$577) && head$310.delim.token.value === '()') {
                    innerTokens$315 = head$310.delim.token.inner;
                    if (innerTokens$315.length === 0) {
                        return step(ParenExpression$570.create(head$310), rest$311);
                    } else {
                        var innerTerm$327 = get_expression(innerTokens$315, env$308);
                        if (innerTerm$327.result && innerTerm$327.result.hasPrototype(Expr$563)) {
                            return step(ParenExpression$570.create(head$310), rest$311);
                        }
                    }
                } else if (rest$311[0] && rest$311[1] && stxIsBinOp(rest$311[0])) {
                    var op$332 = rest$311[0];
                    var left$328 = head$310;
                    var bopRes$329 = enforest(rest$311.slice(1), env$308);
                    var right$330 = bopRes$329.result;
                    if (right$330.hasPrototype(Expr$563)) {
                        return step(BinOp$573.create(op$332, left$328, right$330), bopRes$329.rest);
                    }
                } else if (head$310.hasPrototype(Punc$576) && stxIsUnaryOp(head$310.punc) || head$310.hasPrototype(Keyword$575) && stxIsUnaryOp(head$310.keyword)) {
                    var unopRes$331 = enforest(rest$311);
                    var op$332 = head$310.hasPrototype(Punc$576) ? head$310.punc : head$310.keyword;
                    if (unopRes$331.result.hasPrototype(Expr$563)) {
                        return step(UnaryOp$571.create(op$332, unopRes$331.result), unopRes$331.rest);
                    }
                } else if (head$310.hasPrototype(Expr$563) && rest$311[0] && (rest$311[0].token.value === '++' || rest$311[0].token.value === '--')) {
                    return step(PostfixOp$572.create(head$310, rest$311[0]), rest$311.slice(1));
                } else if (head$310.hasPrototype(Expr$563) && rest$311[0] && rest$311[0].token.value === '[]') {
                    var getRes$333 = enforest(rest$311[0].token.inner, env$308);
                    var resStx$334 = mkSyntax('[]', parser$6.Token.Delimiter, rest$311[0]);
                    resStx$334.token.inner = [getRes$333.result];
                    if (getRes$333.rest.length > 0) {
                        return step(ObjGet$585.create(head$310, Delimiter$577.create(resStx$334)), rest$311.slice(1));
                    }
                } else if (head$310.hasPrototype(Expr$563) && rest$311[0] && rest$311[0].token.value === '.' && rest$311[1] && rest$311[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$584.create(head$310, rest$311[0], rest$311[1]), rest$311.slice(2));
                } else if (head$310.hasPrototype(Delimiter$577) && head$310.delim.token.value === '[]') {
                    return step(ArrayLiteral$569.create(head$310), rest$311);
                } else if (head$310.hasPrototype(Delimiter$577) && head$310.delim.token.value === '{}') {
                    innerTokens$315 = head$310.delim.token.inner;
                    return step(Block$568.create(head$310), rest$311);
                } else if (head$310.hasPrototype(Keyword$575) && head$310.keyword.token.value === 'var' && rest$311[0] && rest$311[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$335 = enforestVarStatement(rest$311, env$308);
                    if (vsRes$335) {
                        return step(VariableStatement$587.create(head$310, vsRes$335.result), vsRes$335.rest);
                    }
                }
            } else {
                parser$6.assert(head$310 && head$310.token, 'assuming head is a syntax object');
                if ((head$310.token.type === parser$6.Token.Identifier || head$310.token.type === parser$6.Token.Keyword) && env$308.has(head$310.token.value)) {
                    var transformer$336 = env$308.get(head$310.token.value);
                    var rt$337 = transformer$336(rest$311, head$310, env$308);
                    if (rt$337.result.length > 0) {
                        return step(rt$337.result[0], rt$337.result.slice(1).concat(rt$337.rest));
                    } else {
                        return step(Empty$589.create(), rt$337.rest);
                    }
                } else if (head$310.token.type === parser$6.Token.Identifier && head$310.token.value === 'macro' && rest$311[0] && (rest$311[0].token.type === parser$6.Token.Identifier || rest$311[0].token.type === parser$6.Token.Keyword) && rest$311[1] && rest$311[1].token.type === parser$6.Token.Delimiter && rest$311[1].token.value === '{}') {
                    return step(Macro$581.create(rest$311[0], rest$311[1].token.inner), rest$311.slice(2));
                } else if (head$310.token.type === parser$6.Token.Keyword && head$310.token.value === 'function' && rest$311[0] && rest$311[0].token.type === parser$6.Token.Identifier && rest$311[1] && rest$311[1].token.type === parser$6.Token.Delimiter && rest$311[1].token.value === '()' && rest$311[2] && rest$311[2].token.type === parser$6.Token.Delimiter && rest$311[2].token.value === '{}') {
                    return step(NamedFun$579.create(head$310, rest$311[0], rest$311[1], rest$311[2]), rest$311.slice(3));
                } else if (head$310.token.type === parser$6.Token.Keyword && head$310.token.value === 'function' && rest$311[0] && rest$311[0].token.type === parser$6.Token.Delimiter && rest$311[0].token.value === '()' && rest$311[1] && rest$311[1].token.type === parser$6.Token.Delimiter && rest$311[1].token.value === '{}') {
                    return step(AnonFun$580.create(head$310, rest$311[0], rest$311[1]), rest$311.slice(2));
                } else if (head$310.token.type === parser$6.Token.Keyword && head$310.token.value === 'catch' && rest$311[0] && rest$311[0].token.type === parser$6.Token.Delimiter && rest$311[0].token.value === '()' && rest$311[1] && rest$311[1].token.type === parser$6.Token.Delimiter && rest$311[1].token.value === '{}') {
                    return step(CatchClause$588.create(head$310, rest$311[0], rest$311[1]), rest$311.slice(2));
                } else if (head$310.token.type === parser$6.Token.Keyword && head$310.token.value === 'this') {
                    return step(ThisExpression$565.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.NumericLiteral || head$310.token.type === parser$6.Token.StringLiteral || head$310.token.type === parser$6.Token.BooleanLiteral || head$310.token.type === parser$6.Token.RegexLiteral || head$310.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$566.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.Identifier) {
                    return step(Id$578.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$576.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.Keyword && head$310.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$310.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$575.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$577.create(head$310), rest$311);
                } else if (head$310.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$311.length === 0, 'nothing should be after an EOF');
                    return step(EOF$561.create(head$310), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$310,
                rest: rest$311
            };
        }
        return step(toks$307[0], toks$307.slice(1));
    }
    function get_expression(stx$338, env$339) {
        var res$341 = enforest(stx$338, env$339);
        if (!res$341.result.hasPrototype(Expr$563)) {
            return {
                result: null,
                rest: stx$338
            };
        }
        return res$341;
    }
    function typeIsLiteral(type$342) {
        return type$342 === parser$6.Token.NullLiteral || type$342 === parser$6.Token.NumericLiteral || type$342 === parser$6.Token.StringLiteral || type$342 === parser$6.Token.RegexLiteral || type$342 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$344, stx$345, env$346) {
        var result$348, rest$349;
        if (patternClass$344 === 'token' && stx$345[0] && stx$345[0].token.type !== parser$6.Token.EOF) {
            result$348 = [stx$345[0]];
            rest$349 = stx$345.slice(1);
        } else if (patternClass$344 === 'lit' && stx$345[0] && typeIsLiteral(stx$345[0].token.type)) {
            result$348 = [stx$345[0]];
            rest$349 = stx$345.slice(1);
        } else if (patternClass$344 === 'ident' && stx$345[0] && stx$345[0].token.type === parser$6.Token.Identifier) {
            result$348 = [stx$345[0]];
            rest$349 = stx$345.slice(1);
        } else if (patternClass$344 === 'VariableStatement') {
            var match$350 = enforest(stx$345, env$346);
            if (match$350.result && match$350.result.hasPrototype(VariableStatement$587)) {
                result$348 = match$350.result.destruct(false);
                rest$349 = match$350.rest;
            } else {
                result$348 = null;
                rest$349 = stx$345;
            }
        } else if (patternClass$344 === 'expr') {
            var match$350 = get_expression(stx$345, env$346);
            if (match$350.result === null || !match$350.result.hasPrototype(Expr$563)) {
                result$348 = null;
                rest$349 = stx$345;
            } else {
                result$348 = match$350.result.destruct(false);
                rest$349 = match$350.rest;
            }
        } else {
            result$348 = null;
            rest$349 = stx$345;
        }
        return {
            result: result$348,
            rest: rest$349
        };
    }
    function matchPattern(pattern$351, stx$352, env$353, patternEnv$354) {
        var subMatch$359;
        var match$360, matchEnv$361;
        var rest$362;
        var success$363;
        if (stx$352.length === 0) {
            return {
                success: false,
                rest: stx$352,
                patternEnv: patternEnv$354
            };
        }
        parser$6.assert(stx$352.length > 0, 'should have had something to match here');
        if (pattern$351.token.type === parser$6.Token.Delimiter) {
            if (pattern$351.class === 'pattern_group') {
                subMatch$359 = matchPatterns(pattern$351.token.inner, stx$352, env$353, false);
                rest$362 = subMatch$359.rest;
            } else if (stx$352[0].token.type === parser$6.Token.Delimiter && stx$352[0].token.value === pattern$351.token.value) {
                subMatch$359 = matchPatterns(pattern$351.token.inner, stx$352[0].token.inner, env$353, false);
                rest$362 = stx$352.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$352,
                    patternEnv: patternEnv$354
                };
            }
            success$363 = subMatch$359.success;
            _$5.keys(subMatch$359.patternEnv).forEach(function (patternKey$356) {
                if (pattern$351.repeat) {
                    var nextLevel$358 = subMatch$359.patternEnv[patternKey$356].level + 1;
                    if (patternEnv$354[patternKey$356]) {
                        patternEnv$354[patternKey$356].level = nextLevel$358;
                        patternEnv$354[patternKey$356].match.push(subMatch$359.patternEnv[patternKey$356]);
                    } else {
                        patternEnv$354[patternKey$356] = {
                            level: nextLevel$358,
                            match: [subMatch$359.patternEnv[patternKey$356]]
                        };
                    }
                } else {
                    patternEnv$354[patternKey$356] = subMatch$359.patternEnv[patternKey$356];
                }
            });
        } else {
            if (pattern$351.class === 'pattern_literal') {
                if (pattern$351.token.value === stx$352[0].token.value) {
                    success$363 = true;
                    rest$362 = stx$352.slice(1);
                } else {
                    success$363 = false;
                    rest$362 = stx$352;
                }
            } else {
                match$360 = matchPatternClass(pattern$351.class, stx$352, env$353);
                success$363 = match$360.result !== null;
                rest$362 = match$360.rest;
                matchEnv$361 = {
                    level: 0,
                    match: match$360.result
                };
                if (match$360.result !== null) {
                    if (pattern$351.repeat) {
                        if (patternEnv$354[pattern$351.token.value]) {
                            patternEnv$354[pattern$351.token.value].match.push(matchEnv$361);
                        } else {
                            patternEnv$354[pattern$351.token.value] = {
                                level: 1,
                                match: [matchEnv$361]
                            };
                        }
                    } else {
                        patternEnv$354[pattern$351.token.value] = matchEnv$361;
                    }
                }
            }
        }
        return {
            success: success$363,
            rest: rest$362,
            patternEnv: patternEnv$354
        };
    }
    function matchPatterns(patterns$364, stx$365, env$366, topLevel$367) {
        topLevel$367 = topLevel$367 || false;
        var result$369 = [];
        var patternEnv$370 = {};
        var match$371;
        var pattern$372;
        var rest$373 = stx$365;
        var success$374 = true;
        for (var i$375 = 0; i$375 < patterns$364.length; i$375++) {
            pattern$372 = patterns$364[i$375];
            do {
                match$371 = matchPattern(pattern$372, rest$373, env$366, patternEnv$370);
                if (!match$371.success) {
                    success$374 = false;
                }
                rest$373 = match$371.rest;
                patternEnv$370 = match$371.patternEnv;
                if (pattern$372.repeat && success$374) {
                    if (rest$373[0] && rest$373[0].token.value === pattern$372.separator) {
                        rest$373 = rest$373.slice(1);
                    } else if (pattern$372.separator === ' ') {
                        continue;
                    } else if (pattern$372.separator !== ' ' && rest$373.length > 0 && i$375 === patterns$364.length - 1 && topLevel$367 === false) {
                        success$374 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$372.repeat && match$371.success && rest$373.length > 0);
        }
        return {
            success: success$374,
            rest: rest$373,
            patternEnv: patternEnv$370
        };
    }
    function transcribe(macroBody$376, macroNameStx$377, env$378) {
        return _$5.chain(macroBody$376).reduce(function (acc$380, bodyStx$381, idx$382, original$383) {
            var last$385 = original$383[idx$382 - 1];
            var next$386 = original$383[idx$382 + 1];
            var nextNext$387 = original$383[idx$382 + 2];
            if (bodyStx$381.token.value === '...') {
                return acc$380;
            }
            if (delimIsSeparator(bodyStx$381) && next$386 && next$386.token.value === '...') {
                return acc$380;
            }
            if (bodyStx$381.token.value === '$' && next$386 && next$386.token.type === parser$6.Token.Delimiter && next$386.token.value === '()') {
                return acc$380;
            }
            if (bodyStx$381.token.value === '$' && next$386 && next$386.token.type === parser$6.Token.Delimiter && next$386.token.value === '[]') {
                next$386.literal = true;
                return acc$380;
            }
            if (bodyStx$381.token.type === parser$6.Token.Delimiter && bodyStx$381.token.value === '()' && last$385 && last$385.token.value === '$') {
                bodyStx$381.group = true;
            }
            if (bodyStx$381.literal === true) {
                parser$6.assert(bodyStx$381.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$380.concat(bodyStx$381.token.inner);
            }
            if (next$386 && next$386.token.value === '...') {
                bodyStx$381.repeat = true;
                bodyStx$381.separator = ' ';
            } else if (delimIsSeparator(next$386) && nextNext$387 && nextNext$387.token.value === '...') {
                bodyStx$381.repeat = true;
                bodyStx$381.separator = next$386.token.inner[0].token.value;
            }
            return acc$380.concat(bodyStx$381);
        }, []).reduce(function (acc$388, bodyStx$389, idx$390) {
            if (bodyStx$389.repeat) {
                if (bodyStx$389.token.type === parser$6.Token.Delimiter) {
                    var fv$406 = _$5.filter(freeVarsInPattern(bodyStx$389.token.inner), function (pat$392) {
                            return env$378.hasOwnProperty(pat$392);
                        });
                    var restrictedEnv$407 = [];
                    var nonScalar$408 = _$5.find(fv$406, function (pat$394) {
                            return env$378[pat$394].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$408 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$409 = env$378[nonScalar$408].match.length;
                    var sameLength$410 = _$5.all(fv$406, function (pat$396) {
                            return env$378[pat$396].level === 0 || env$378[pat$396].match.length === repeatLength$409;
                        });
                    parser$6.assert(sameLength$410, 'all non-scalars must have the same length');
                    restrictedEnv$407 = _$5.map(_$5.range(repeatLength$409), function (idx$398) {
                        var renv$402 = {};
                        _$5.each(fv$406, function (pat$400) {
                            if (env$378[pat$400].level === 0) {
                                renv$402[pat$400] = env$378[pat$400];
                            } else {
                                renv$402[pat$400] = env$378[pat$400].match[idx$398];
                            }
                        });
                        return renv$402;
                    });
                    var transcribed$411 = _$5.map(restrictedEnv$407, function (renv$403) {
                            if (bodyStx$389.group) {
                                return transcribe(bodyStx$389.token.inner, macroNameStx$377, renv$403);
                            } else {
                                var newBody$405 = syntaxFromToken(_$5.clone(bodyStx$389.token), bodyStx$389.context);
                                newBody$405.token.inner = transcribe(bodyStx$389.token.inner, macroNameStx$377, renv$403);
                                return newBody$405;
                            }
                        });
                    var joined$412;
                    if (bodyStx$389.group) {
                        joined$412 = joinSyntaxArr(transcribed$411, bodyStx$389.separator);
                    } else {
                        joined$412 = joinSyntax(transcribed$411, bodyStx$389.separator);
                    }
                    return acc$388.concat(joined$412);
                }
                parser$6.assert(env$378[bodyStx$389.token.value].level === 1, 'ellipses level does not match');
                return acc$388.concat(joinRepeatedMatch(env$378[bodyStx$389.token.value].match, bodyStx$389.separator));
            } else {
                if (bodyStx$389.token.type === parser$6.Token.Delimiter) {
                    var newBody$413 = syntaxFromToken(_$5.clone(bodyStx$389.token), macroBody$376.context);
                    newBody$413.token.inner = transcribe(bodyStx$389.token.inner, macroNameStx$377, env$378);
                    return acc$388.concat(newBody$413);
                }
                if (Object.prototype.hasOwnProperty.bind(env$378)(bodyStx$389.token.value)) {
                    parser$6.assert(env$378[bodyStx$389.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$389.token.value);
                    return acc$388.concat(takeLineContext(macroNameStx$377, env$378[bodyStx$389.token.value].match));
                }
                return acc$388.concat(takeLineContext(macroNameStx$377, [bodyStx$389]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$414, env$415) {
        function dfs(match$417) {
            if (match$417.level === 0) {
                match$417.match = _$5.map(match$417.match, function (stx$419) {
                    return stx$419.mark(newMark$414);
                });
            } else {
                _$5.each(match$417.match, function (match$421) {
                    dfs(match$421);
                });
            }
        }
        _$5.keys(env$415).forEach(function (key$423) {
            dfs(env$415[key$423]);
        });
    }
    function makeTransformer(cases$425, macroName$426) {
        var sortedCases$442 = _$5.sortBy(cases$425, function (mcase$428) {
                return patternLength(mcase$428.pattern);
            }).reverse();
        return function transformer(stx$430, macroNameStx$431, env$432) {
            var match$436;
            var casePattern$437, caseBody$438;
            var newMark$439;
            var macroResult$440;
            for (var i$441 = 0; i$441 < sortedCases$442.length; i$441++) {
                casePattern$437 = sortedCases$442[i$441].pattern;
                caseBody$438 = sortedCases$442[i$441].body;
                match$436 = matchPatterns(casePattern$437, stx$430, env$432, true);
                if (match$436.success) {
                    newMark$439 = fresh();
                    applyMarkToPatternEnv(newMark$439, match$436.patternEnv);
                    macroResult$440 = transcribe(caseBody$438, macroNameStx$431, match$436.patternEnv);
                    macroResult$440 = _$5.map(macroResult$440, function (stx$434) {
                        return stx$434.mark(newMark$439);
                    });
                    return {
                        result: macroResult$440,
                        rest: match$436.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$431.token.value);
        };
    }
    function findCase(start$443, stx$444) {
        parser$6.assert(start$443 >= 0 && start$443 < stx$444.length, 'start out of bounds');
        var idx$446 = start$443;
        while (idx$446 < stx$444.length) {
            if (stx$444[idx$446].token.value === 'case') {
                return idx$446;
            }
            idx$446++;
        }
        return -1;
    }
    function findCaseArrow(start$447, stx$448) {
        parser$6.assert(start$447 >= 0 && start$447 < stx$448.length, 'start out of bounds');
        var idx$450 = start$447;
        while (idx$450 < stx$448.length) {
            if (stx$448[idx$450].token.value === '=' && stx$448[idx$450 + 1] && stx$448[idx$450 + 1].token.value === '>') {
                return idx$450;
            }
            idx$450++;
        }
        return -1;
    }
    function loadMacroDef(mac$451) {
        var body$453 = mac$451.body;
        var caseOffset$454 = 0;
        var arrowOffset$455 = 0;
        var casePattern$456;
        var caseBody$457;
        var caseBodyIdx$458;
        var cases$459 = [];
        while (caseOffset$454 < body$453.length && body$453[caseOffset$454].token.value === 'case') {
            arrowOffset$455 = findCaseArrow(caseOffset$454, body$453);
            if (arrowOffset$455 > 0 && arrowOffset$455 < body$453.length) {
                caseBodyIdx$458 = arrowOffset$455 + 2;
                if (caseBodyIdx$458 >= body$453.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$456 = body$453.slice(caseOffset$454 + 1, arrowOffset$455);
                caseBody$457 = body$453[caseBodyIdx$458].token.inner;
                cases$459.push({
                    pattern: loadPattern(casePattern$456, mac$451.name),
                    body: caseBody$457
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$454 = findCase(arrowOffset$455, body$453);
            if (caseOffset$454 < 0) {
                break;
            }
        }
        return makeTransformer(cases$459);
    }
    function expandToTermTree(stx$460, env$461, defscope$462) {
        parser$6.assert(env$461, 'environment map is required');
        if (stx$460.length === 0) {
            return {
                terms: [],
                env: env$461
            };
        }
        parser$6.assert(stx$460[0].token, 'expecting a syntax object');
        var f$468 = enforest(stx$460, env$461);
        var head$469 = f$468.result;
        var rest$470 = f$468.rest;
        if (head$469.hasPrototype(Macro$581)) {
            var macroDefinition$471 = loadMacroDef(head$469);
            env$461.set(head$469.name.token.value, macroDefinition$471);
            return expandToTermTree(rest$470, env$461, defscope$462);
        }
        if (head$469.hasPrototype(VariableStatement$587)) {
            addVarsToDefinitionCtx(head$469, defscope$462);
        }
        if (head$469.hasPrototype(Block$568) && head$469.body.hasPrototype(Delimiter$577)) {
            head$469.body.delim.token.inner.forEach(function (term$464) {
                addVarsToDefinitionCtx(term$464, defscope$462);
            });
        }
        if (head$469.hasPrototype(Delimiter$577)) {
            head$469.delim.token.inner.forEach(function (term$466) {
                addVarsToDefinitionCtx(term$466, defscope$462);
            });
        }
        var trees$472 = expandToTermTree(rest$470, env$461, defscope$462);
        return {
            terms: [head$469].concat(trees$472.terms),
            env: trees$472.env
        };
    }
    function addVarsToDefinitionCtx(term$473, defscope$474) {
        if (term$473.hasPrototype(VariableStatement$587)) {
            term$473.decls.forEach(function (decl$476) {
                var defctx$480 = defscope$474;
                parser$6.assert(defctx$480, 'no definition context found but there should always be one');
                var declRepeat$481 = _$5.find(defctx$480, function (def$478) {
                        return def$478.id.token.value === decl$476.ident.token.value && arraysEqual(marksof(def$478.id.context), marksof(decl$476.ident.context));
                    });
                if (declRepeat$481 !== null) {
                    var name$482 = fresh();
                    defctx$480.push({
                        id: decl$476.ident,
                        name: name$482
                    });
                }
            });
        }
    }
    function getVarDeclIdentifiers(term$483) {
        var toCheck$494;
        if (term$483.hasPrototype(Block$568) && term$483.body.hasPrototype(Delimiter$577)) {
            toCheck$494 = term$483.body.delim.token.inner;
        } else if (term$483.hasPrototype(Delimiter$577)) {
            toCheck$494 = term$483.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$494, function (acc$485, curr$486, idx$487, list$488) {
            var prev$493 = list$488[idx$487 - 1];
            if (curr$486.hasPrototype(VariableStatement$587)) {
                return _$5.reduce(curr$486.decls, function (acc$490, decl$491) {
                    return acc$490.concat(decl$491.ident);
                }, acc$485);
            } else if (prev$493 && prev$493.hasPrototype(Keyword$575) && prev$493.keyword.token.value === 'for' && curr$486.hasPrototype(Delimiter$577)) {
                return acc$485.concat(getVarDeclIdentifiers(curr$486));
            } else if (curr$486.hasPrototype(Block$568)) {
                return acc$485.concat(getVarDeclIdentifiers(curr$486));
            }
            return acc$485;
        }, []);
    }
    function replaceVarIdent(stx$495, orig$496, renamed$497) {
        if (stx$495 === orig$496) {
            return renamed$497;
        }
        return stx$495;
    }
    function expandTermTreeToFinal(term$499, env$500, ctx$501, defscope$502) {
        parser$6.assert(env$500, 'environment map is required');
        parser$6.assert(ctx$501, 'context map is required');
        if (term$499.hasPrototype(ArrayLiteral$569)) {
            term$499.array.delim.token.inner = expand(term$499.array.delim.token.inner, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(Block$568)) {
            term$499.body.delim.token.inner = expand(term$499.body.delim.token.inner, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(ParenExpression$570)) {
            term$499.expr.delim.token.inner = expand(term$499.expr.delim.token.inner, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(Call$583)) {
            term$499.fun = expandTermTreeToFinal(term$499.fun, env$500, ctx$501, defscope$502);
            term$499.args = _$5.map(term$499.args, function (arg$504) {
                return expandTermTreeToFinal(arg$504, env$500, ctx$501, defscope$502);
            });
            return term$499;
        } else if (term$499.hasPrototype(UnaryOp$571)) {
            term$499.expr = expandTermTreeToFinal(term$499.expr, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(BinOp$573)) {
            term$499.left = expandTermTreeToFinal(term$499.left, env$500, ctx$501, defscope$502);
            term$499.right = expandTermTreeToFinal(term$499.right, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(ObjDotGet$584)) {
            term$499.left = expandTermTreeToFinal(term$499.left, env$500, ctx$501, defscope$502);
            term$499.right = expandTermTreeToFinal(term$499.right, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(VariableDeclaration$586)) {
            if (term$499.init) {
                term$499.init = expandTermTreeToFinal(term$499.init, env$500, ctx$501, defscope$502);
            }
            return term$499;
        } else if (term$499.hasPrototype(VariableStatement$587)) {
            term$499.decls = _$5.map(term$499.decls, function (decl$506) {
                return expandTermTreeToFinal(decl$506, env$500, ctx$501, defscope$502);
            });
            return term$499;
        } else if (term$499.hasPrototype(Delimiter$577)) {
            term$499.delim.token.inner = expand(term$499.delim.token.inner, env$500, ctx$501, defscope$502);
            return term$499;
        } else if (term$499.hasPrototype(NamedFun$579) || term$499.hasPrototype(AnonFun$580) || term$499.hasPrototype(CatchClause$588)) {
            var newDef$521 = [];
            var params$522 = term$499.params.addDefCtx(newDef$521);
            var bodies$523 = term$499.body.addDefCtx(newDef$521);
            var paramNames$524 = _$5.map(getParamIdentifiers(params$522), function (param$508) {
                    var freshName$510 = fresh();
                    return {
                        freshName: freshName$510,
                        originalParam: param$508,
                        renamedParam: param$508.rename(param$508, freshName$510)
                    };
                });
            var newCtx$525 = ctx$501;
            var stxBody$526 = bodies$523;
            var renamedBody$527 = _$5.reduce(paramNames$524, function (accBody$511, p$512) {
                    return accBody$511.rename(p$512.originalParam, p$512.freshName);
                }, stxBody$526);
            var bodyTerms$528 = expand([renamedBody$527], env$500, newCtx$525, newDef$521);
            parser$6.assert(bodyTerms$528.length === 1 && bodyTerms$528[0].body, 'expecting a block in the bodyTerms');
            var flattenedBody$529 = flatten(bodyTerms$528);
            var renamedParams$530 = _$5.map(paramNames$524, function (p$514) {
                    return p$514.renamedParam;
                });
            var flatArgs$531 = wrapDelim(joinSyntax(renamedParams$530, ','), term$499.params);
            var expandedArgs$532 = expand([flatArgs$531.addDefCtx(newDef$521)], env$500, ctx$501, newDef$521);
            parser$6.assert(expandedArgs$532.length === 1, 'should only get back one result');
            term$499.params = expandedArgs$532[0];
            term$499.body = _$5.map(flattenedBody$529, function (stx$516) {
                return _$5.reduce(newDef$521, function (acc$518, def$519) {
                    return acc$518.rename(def$519.id, def$519.name);
                }, stx$516);
            });
            return term$499;
        }
        return term$499;
    }
    function expand(stx$533, env$534, ctx$535, defscope$536) {
        env$534 = env$534 || new Map();
        ctx$535 = ctx$535 || new Map();
        var trees$540 = expandToTermTree(stx$533, env$534, defscope$536);
        return _$5.map(trees$540.terms, function (term$538) {
            return expandTermTreeToFinal(term$538, trees$540.env, ctx$535, defscope$536);
        });
    }
    function expandTopLevel(stx$541) {
        var funn$545 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$546 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$547 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$548 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$541
            });
        var res$549 = expand([
                funn$545,
                name$546,
                params$547,
                body$548
            ]);
        return _$5.map(res$549[0].body.slice(1, res$549[0].body.length - 1), function (stx$543) {
            return stx$543;
        });
    }
    function flatten(terms$550) {
        return _$5.reduce(terms$550, function (acc$552, term$553) {
            return acc$552.concat(term$553.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));