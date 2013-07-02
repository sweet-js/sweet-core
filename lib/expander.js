(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('underscore'), require('./parser'), require('es6-collections'), require('contracts-js'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'underscore',
            'parser',
            'es6-collections',
            'contracts-js'
        ], factory$2);
    } else {
        factory$2(root$1.expander = {}, root$1._, root$1.parser, root$1.es6, root$1.contracts);
    }
}(this, function (exports$4, _$5, parser$6, es6$7, contracts$8) {
    'use strict';
    var C = contracts$8;
    exports$4._test = {};
    Object.prototype.create = function () {
        var o$12 = Object.create(this);
        if (typeof o$12.construct === 'function') {
            o$12.construct.apply(o$12, arguments);
        }
        return o$12;
    };
    Object.prototype.extend = function (properties$13) {
        var result$15 = Object.create(this);
        for (var prop in properties$13) {
            if (properties$13.hasOwnProperty(prop)) {
                result$15[prop] = properties$13[prop];
            }
        }
        return result$15;
    };
    Object.prototype.hasPrototype = function (proto$16) {
        function F() {
        }
        F.prototype = proto$16;
        return this instanceof F;
    };
    function throwError(msg$19) {
        throw new Error(msg$19);
    }
    function mkSyntax(value$21, type$22, stx$23) {
        return syntaxFromToken({
            type: type$22,
            value: value$21,
            lineStart: stx$23.token.lineStart,
            lineNumber: stx$23.token.lineNumber
        }, stx$23.context);
    }
    function Mark(mark$25, ctx$26) {
        return {
            mark: mark$25,
            context: ctx$26
        };
    }
    function Var(id$28) {
        return {id: id$28};
    }
    var isMark$553 = function isMark$553(m$30) {
        return m$30 && typeof m$30.mark !== 'undefined';
    };
    function Rename(id$32, name$33, ctx$34) {
        return {
            id: id$32,
            name: name$33,
            context: ctx$34
        };
    }
    var isRename$554 = function (r$36) {
        return r$36 && typeof r$36.id !== 'undefined' && typeof r$36.name !== 'undefined';
    };
    function DummyRename(name$38, ctx$39) {
        return {
            dummy_name: name$38,
            context: ctx$39
        };
    }
    var isDummyRename$555 = function (r$41) {
        return r$41 && typeof r$41.dummy_name !== 'undefined';
    };
    var syntaxProto$556 = {
            mark: function mark(newMark$43) {
                var markedToken$47 = _$5.clone(this.token);
                if (this.token.inner) {
                    var markedInner$48 = _$5.map(this.token.inner, function (stx$45) {
                            return stx$45.mark(newMark$43);
                        });
                    markedToken$47.inner = markedInner$48;
                }
                var newMarkObj$49 = Mark(newMark$43, this.context);
                var stmp$50 = syntaxFromToken(markedToken$47, newMarkObj$49);
                return stmp$50;
            },
            rename: function (id$51, name$52) {
                if (this.token.inner) {
                    var renamedInner$56 = _$5.map(this.token.inner, function (stx$54) {
                            return stx$54.rename(id$51, name$52);
                        });
                    this.token.inner = renamedInner$56;
                }
                if (this.token.value === id$51.token.value) {
                    return syntaxFromToken(this.token, Rename(id$51, name$52, this.context));
                } else {
                    return this;
                }
            },
            push_dummy_rename: function (name$57) {
                if (this.token.inner) {
                    var renamedInner$61 = _$5.map(this.token.inner, function (stx$59) {
                            return stx$59.push_dummy_rename(name$57);
                        });
                    this.token.inner = renamedInner$61;
                }
                return syntaxFromToken(this.token, DummyRename(name$57, this.context));
            },
            swap_dummy_rename: function (varNames$62, dummyName$63) {
                parser$6.assert(this.token.type !== parser$6.Token.Delimiter, 'expecting everything to be flattened');
                var that$67 = this;
                var matchingVarNames$68 = _$5.filter(varNames$62, function (v$65) {
                        return v$65.originalVar.token.value === that$67.token.value;
                    });
                var newStx$69 = syntaxFromToken(this.token, renameDummyCtx(this.context, matchingVarNames$68, dummyName$63));
                return newStx$69;
            },
            toString: function () {
                var val$71 = this.token.type === parser$6.Token.EOF ? 'EOF' : this.token.value;
                return '[Syntax: ' + val$71 + ']';
            }
        };
    function renameDummyCtx(ctx$72, varNames$73, dummyName$74) {
        if (ctx$72 === null) {
            return null;
        }
        if (isDummyRename$555(ctx$72) && ctx$72.dummy_name === dummyName$74) {
            return _$5.reduce(varNames$73, function (accCtx$76, v$77) {
                return Rename(v$77.originalVar, v$77.freshName, accCtx$76);
            }, ctx$72.context);
        }
        if (isDummyRename$555(ctx$72) && ctx$72.dummy_name !== dummyName$74) {
            return DummyRename(ctx$72.dummy_name, renameDummyCtx(ctx$72.context, varNames$73, dummyName$74));
        }
        if (isMark$553(ctx$72)) {
            return Mark(ctx$72.mark, renameDummyCtx(ctx$72.context, varNames$73, dummyName$74));
        }
        if (isRename$554(ctx$72)) {
            return Rename(ctx$72.id.swap_dummy_rename(varNames$73, dummyName$74), ctx$72.name, renameDummyCtx(ctx$72.context, varNames$73, dummyName$74));
        }
        parser$6.assert(false, 'expecting a fixed set of context types');
    }
    function findDummyParent(ctx$79, dummyName$80) {
        if (ctx$79 === null || ctx$79.context === null) {
            return null;
        }
        if (isDummyRename$555(ctx$79.context) && ctx$79.context.dummy_name === dummyName$80) {
            return ctx$79;
        }
        return findDummyParent(ctx$79.context);
    }
    function syntaxFromToken(token$82, oldctx$83) {
        var ctx$85 = typeof oldctx$83 !== 'undefined' ? oldctx$83 : null;
        return Object.create(syntaxProto$556, {
            token: {
                value: token$82,
                enumerable: true,
                configurable: true
            },
            context: {
                value: ctx$85,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
    }
    function remdup(mark$86, mlist$87) {
        if (mark$86 === _$5.first(mlist$87)) {
            return _$5.rest(mlist$87, 1);
        }
        return [mark$86].concat(mlist$87);
    }
    function marksof(ctx$89, stopName$90) {
        var mark$92, submarks$93;
        if (isMark$553(ctx$89)) {
            mark$92 = ctx$89.mark;
            submarks$93 = marksof(ctx$89.context, stopName$90);
            return remdup(mark$92, submarks$93);
        }
        if (isDummyRename$555(ctx$89)) {
            return marksof(ctx$89.context);
        }
        if (isRename$554(ctx$89)) {
            if (stopName$90 === ctx$89.name) {
                return [];
            }
            return marksof(ctx$89.context, stopName$90);
        }
        return [];
    }
    function resolve(stx$94) {
        return resolveCtx(stx$94.token.value, stx$94.context);
    }
    function arraysEqual(a$96, b$97) {
        if (a$96.length !== b$97.length) {
            return false;
        }
        for (var i$99 = 0; i$99 < a$96.length; i$99++) {
            if (a$96[i$99] !== b$97[i$99]) {
                return false;
            }
        }
        return true;
    }
    function resolveCtx(originalName$100, ctx$101) {
        if (isMark$553(ctx$101) || isDummyRename$555(ctx$101)) {
            return resolveCtx(originalName$100, ctx$101.context);
        }
        if (isRename$554(ctx$101)) {
            var idName$103 = resolveCtx(ctx$101.id.token.value, ctx$101.id.context);
            var subName$104 = resolveCtx(originalName$100, ctx$101.context);
            if (idName$103 === subName$104) {
                var idMarks$105 = marksof(ctx$101.id.context, idName$103);
                var subMarks$106 = marksof(ctx$101.context, idName$103);
                if (arraysEqual(idMarks$105, subMarks$106)) {
                    return originalName$100 + '$' + ctx$101.name;
                }
            }
            return resolveCtx(originalName$100, ctx$101.context);
        }
        return originalName$100;
    }
    var nextFresh$557 = 0;
    function fresh() {
        return nextFresh$557++;
    }
    ;
    function tokensToSyntax(tokens$108) {
        if (!_$5.isArray(tokens$108)) {
            tokens$108 = [tokens$108];
        }
        return _$5.map(tokens$108, function (token$110) {
            if (token$110.inner) {
                token$110.inner = tokensToSyntax(token$110.inner);
            }
            return syntaxFromToken(token$110);
        });
    }
    function syntaxToTokens(syntax$112) {
        return _$5.map(syntax$112, function (stx$114) {
            if (stx$114.token.inner) {
                stx$114.token.inner = syntaxToTokens(stx$114.token.inner);
            }
            return stx$114.token;
        });
    }
    function isPatternVar(token$116) {
        return token$116.type === parser$6.Token.Identifier && token$116.value[0] === '$' && token$116.value !== '$';
    }
    var containsPatternVar$558 = function (patterns$118) {
        return _$5.any(patterns$118, function (pat$120) {
            if (pat$120.token.type === parser$6.Token.Delimiter) {
                return containsPatternVar$558(pat$120.token.inner);
            }
            return isPatternVar(pat$120);
        });
    };
    function loadPattern(patterns$122) {
        return _$5.chain(patterns$122).reduce(function (acc$124, patStx$125, idx$126) {
            var last$128 = patterns$122[idx$126 - 1];
            var lastLast$129 = patterns$122[idx$126 - 2];
            var next$130 = patterns$122[idx$126 + 1];
            var nextNext$131 = patterns$122[idx$126 + 2];
            if (patStx$125.token.value === ':') {
                if (last$128 && isPatternVar(last$128.token)) {
                    return acc$124;
                }
            }
            if (last$128 && last$128.token.value === ':') {
                if (lastLast$129 && isPatternVar(lastLast$129.token)) {
                    return acc$124;
                }
            }
            if (patStx$125.token.value === '$' && next$130 && next$130.token.type === parser$6.Token.Delimiter) {
                return acc$124;
            }
            if (isPatternVar(patStx$125.token)) {
                if (next$130 && next$130.token.value === ':') {
                    parser$6.assert(typeof nextNext$131 !== 'undefined', 'expecting a pattern class');
                    patStx$125.class = nextNext$131.token.value;
                } else {
                    patStx$125.class = 'token';
                }
            } else if (patStx$125.token.type === parser$6.Token.Delimiter) {
                if (last$128 && last$128.token.value === '$') {
                    patStx$125.class = 'pattern_group';
                }
                patStx$125.token.inner = loadPattern(patStx$125.token.inner);
            } else {
                patStx$125.class = 'pattern_literal';
            }
            return acc$124.concat(patStx$125);
        }, []).reduce(function (acc$132, patStx$133, idx$134, patterns$135) {
            var separator$137 = ' ';
            var repeat$138 = false;
            var next$139 = patterns$135[idx$134 + 1];
            var nextNext$140 = patterns$135[idx$134 + 2];
            if (next$139 && next$139.token.value === '...') {
                repeat$138 = true;
                separator$137 = ' ';
            } else if (delimIsSeparator(next$139) && nextNext$140 && nextNext$140.token.value === '...') {
                repeat$138 = true;
                parser$6.assert(next$139.token.inner.length === 1, 'currently assuming all separators are a single token');
                separator$137 = next$139.token.inner[0].token.value;
            }
            if (patStx$133.token.value === '...' || delimIsSeparator(patStx$133) && next$139 && next$139.token.value === '...') {
                return acc$132;
            }
            patStx$133.repeat = repeat$138;
            patStx$133.separator = separator$137;
            return acc$132.concat(patStx$133);
        }, []).value();
    }
    function takeLineContext(from$141, to$142) {
        return _$5.map(to$142, function (stx$144) {
            if (stx$144.token.type === parser$6.Token.Delimiter) {
                return syntaxFromToken({
                    type: parser$6.Token.Delimiter,
                    value: stx$144.token.value,
                    inner: stx$144.token.inner,
                    startRange: from$141.range,
                    endRange: from$141.range,
                    startLineNumber: from$141.token.lineNumber,
                    startLineStart: from$141.token.lineStart,
                    endLineNumber: from$141.token.lineNumber,
                    endLineStart: from$141.token.lineStart
                }, stx$144.context);
            }
            return syntaxFromToken({
                value: stx$144.token.value,
                type: stx$144.token.type,
                lineNumber: from$141.token.lineNumber,
                lineStart: from$141.token.lineStart,
                range: from$141.token.range
            }, stx$144.context);
        });
    }
    function joinRepeatedMatch(tojoin$146, punc$147) {
        return _$5.reduce(_$5.rest(tojoin$146, 1), function (acc$149, join$150) {
            if (punc$147 === ' ') {
                return acc$149.concat(join$150.match);
            }
            return acc$149.concat(mkSyntax(punc$147, parser$6.Token.Punctuator, _$5.first(join$150.match)), join$150.match);
        }, _$5.first(tojoin$146).match);
    }
    function joinSyntax(tojoin$152, punc$153) {
        if (tojoin$152.length === 0) {
            return [];
        }
        if (punc$153 === ' ') {
            return tojoin$152;
        }
        return _$5.reduce(_$5.rest(tojoin$152, 1), function (acc$155, join$156) {
            return acc$155.concat(mkSyntax(punc$153, parser$6.Token.Punctuator, join$156), join$156);
        }, [_$5.first(tojoin$152)]);
    }
    function joinSyntaxArr(tojoin$158, punc$159) {
        if (tojoin$158.length === 0) {
            return [];
        }
        if (punc$159 === ' ') {
            return _$5.flatten(tojoin$158, true);
        }
        return _$5.reduce(_$5.rest(tojoin$158, 1), function (acc$161, join$162) {
            return acc$161.concat(mkSyntax(punc$159, parser$6.Token.Punctuator, _$5.first(join$162)), join$162);
        }, _$5.first(tojoin$158));
    }
    function delimIsSeparator(delim$164) {
        return delim$164 && delim$164.token.type === parser$6.Token.Delimiter && delim$164.token.value === '()' && delim$164.token.inner.length === 1 && delim$164.token.inner[0].token.type !== parser$6.Token.Delimiter && !containsPatternVar$558(delim$164.token.inner);
    }
    function freeVarsInPattern(pattern$166) {
        var fv$170 = [];
        _$5.each(pattern$166, function (pat$168) {
            if (isPatternVar(pat$168.token)) {
                fv$170.push(pat$168.token.value);
            } else if (pat$168.token.type === parser$6.Token.Delimiter) {
                fv$170 = fv$170.concat(freeVarsInPattern(pat$168.token.inner));
            }
        });
        return fv$170;
    }
    function patternLength(patterns$171) {
        return _$5.reduce(patterns$171, function (acc$173, pat$174) {
            if (pat$174.token.type === parser$6.Token.Delimiter) {
                return acc$173 + 1 + patternLength(pat$174.token.inner);
            }
            return acc$173 + 1;
        }, 0);
    }
    function matchStx(value$176, stx$177) {
        return stx$177 && stx$177.token && stx$177.token.value === value$176;
    }
    function wrapDelim(towrap$179, delimSyntax$180) {
        parser$6.assert(delimSyntax$180.token.type === parser$6.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser$6.Token.Delimiter,
            value: delimSyntax$180.token.value,
            inner: towrap$179,
            range: delimSyntax$180.token.range,
            startLineNumber: delimSyntax$180.token.startLineNumber,
            lineStart: delimSyntax$180.token.lineStart
        }, delimSyntax$180.context);
    }
    function getParamIdentifiers(argSyntax$182) {
        parser$6.assert(argSyntax$182.token.type === parser$6.Token.Delimiter, 'expecting delimiter for function params');
        return _$5.filter(argSyntax$182.token.inner, function (stx$184) {
            return stx$184.token.value !== ',';
        });
    }
    function isFunctionStx(stx$186) {
        return stx$186 && stx$186.token.type === parser$6.Token.Keyword && stx$186.token.value === 'function';
    }
    function isVarStx(stx$188) {
        return stx$188 && stx$188.token.type === parser$6.Token.Keyword && stx$188.token.value === 'var';
    }
    function varNamesInAST(ast$190) {
        return _$5.map(ast$190, function (item$192) {
            return item$192.id.name;
        });
    }
    function getVarDeclIdentifiers(term$194) {
        var toCheck$205;
        if (term$194.hasPrototype(Block$567) && term$194.body.hasPrototype(Delimiter$576)) {
            toCheck$205 = term$194.body.delim.token.inner;
        } else if (term$194.hasPrototype(Delimiter$576)) {
            toCheck$205 = term$194.delim.token.inner;
        } else {
            parser$6.assert(false, 'expecting a Block or a Delimiter');
        }
        return _$5.reduce(toCheck$205, function (acc$196, curr$197, idx$198, list$199) {
            var prev$204 = list$199[idx$198 - 1];
            if (curr$197.hasPrototype(VariableStatement$586)) {
                return _$5.reduce(curr$197.decls, function (acc$201, decl$202) {
                    return acc$201.concat(decl$202.ident);
                }, acc$196);
            } else if (prev$204 && prev$204.hasPrototype(Keyword$574) && prev$204.keyword.token.value === 'for' && curr$197.hasPrototype(Delimiter$576)) {
                return acc$196.concat(getVarDeclIdentifiers(curr$197));
            } else if (curr$197.hasPrototype(Block$567)) {
                return acc$196.concat(getVarDeclIdentifiers(curr$197));
            }
            return acc$196;
        }, []);
    }
    function replaceVarIdent(stx$206, orig$207, renamed$208) {
        if (stx$206 === orig$207) {
            return renamed$208;
        }
        return stx$206;
    }
    var TermTree$559 = {destruct: function (breakDelim$210) {
                return _$5.reduce(this.properties, _$5.bind(function (acc$212, prop$213) {
                    if (this[prop$213] && this[prop$213].hasPrototype(TermTree$559)) {
                        return acc$212.concat(this[prop$213].destruct(breakDelim$210));
                    } else if (this[prop$213]) {
                        return acc$212.concat(this[prop$213]);
                    } else {
                        return acc$212;
                    }
                }, this), []);
            }};
    var EOF$560 = TermTree$559.extend({
            properties: ['eof'],
            construct: function (e$215) {
                this.eof = e$215;
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
            construct: function (that$220) {
                this.this = that$220;
            }
        });
    var Lit$565 = PrimaryExpression$563.extend({
            properties: ['lit'],
            construct: function (l$222) {
                this.lit = l$222;
            }
        });
    exports$4._test.PropertyAssignment = PropertyAssignment$566;
    var PropertyAssignment$566 = TermTree$559.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$224, assignment$225) {
                this.propName = propName$224;
                this.assignment = assignment$225;
            }
        });
    var Block$567 = PrimaryExpression$563.extend({
            properties: ['body'],
            construct: function (body$227) {
                this.body = body$227;
            }
        });
    var ArrayLiteral$568 = PrimaryExpression$563.extend({
            properties: ['array'],
            construct: function (ar$229) {
                this.array = ar$229;
            }
        });
    var ParenExpression$569 = PrimaryExpression$563.extend({
            properties: ['expr'],
            construct: function (expr$231) {
                this.expr = expr$231;
            }
        });
    var UnaryOp$570 = Expr$562.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$233, expr$234) {
                this.op = op$233;
                this.expr = expr$234;
            }
        });
    var PostfixOp$571 = Expr$562.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$236, op$237) {
                this.expr = expr$236;
                this.op = op$237;
            }
        });
    var BinOp$572 = Expr$562.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$239, left$240, right$241) {
                this.op = op$239;
                this.left = left$240;
                this.right = right$241;
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
            construct: function (cond$243, question$244, tru$245, colon$246, fls$247) {
                this.cond = cond$243;
                this.question = question$244;
                this.tru = tru$245;
                this.colon = colon$246;
                this.fls = fls$247;
            }
        });
    var Keyword$574 = TermTree$559.extend({
            properties: ['keyword'],
            construct: function (k$249) {
                this.keyword = k$249;
            }
        });
    var Punc$575 = TermTree$559.extend({
            properties: ['punc'],
            construct: function (p$251) {
                this.punc = p$251;
            }
        });
    var Delimiter$576 = TermTree$559.extend({
            properties: ['delim'],
            destruct: function (breakDelim$253) {
                parser$6.assert(this.delim, 'expecting delim to be defined');
                var innerStx$258 = _$5.reduce(this.delim.token.inner, function (acc$255, term$256) {
                        if (term$256.hasPrototype(TermTree$559)) {
                            return acc$255.concat(term$256.destruct(breakDelim$253));
                        } else {
                            return acc$255.concat(term$256);
                        }
                    }, []);
                if (breakDelim$253) {
                    var openParen$259 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[0],
                            range: this.delim.token.startRange,
                            lineNumber: this.delim.token.startLineNumber,
                            lineStart: this.delim.token.startLineStart
                        });
                    var closeParen$260 = syntaxFromToken({
                            type: parser$6.Token.Punctuator,
                            value: this.delim.token.value[1],
                            range: this.delim.token.endRange,
                            lineNumber: this.delim.token.endLineNumber,
                            lineStart: this.delim.token.endLineStart
                        });
                    return [openParen$259].concat(innerStx$258).concat(closeParen$260);
                } else {
                    return this.delim;
                }
            },
            construct: function (d$261) {
                this.delim = d$261;
            }
        });
    var Id$577 = PrimaryExpression$563.extend({
            properties: ['id'],
            construct: function (id$263) {
                this.id = id$263;
            }
        });
    var NamedFun$578 = Expr$562.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$265, name$266, params$267, body$268) {
                this.keyword = keyword$265;
                this.name = name$266;
                this.params = params$267;
                this.body = body$268;
            }
        });
    var AnonFun$579 = Expr$562.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$270, params$271, body$272) {
                this.keyword = keyword$270;
                this.params = params$271;
                this.body = body$272;
            }
        });
    var Macro$580 = TermTree$559.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$274, body$275) {
                this.name = name$274;
                this.body = body$275;
            }
        });
    var Const$581 = Expr$562.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$277, call$278) {
                this.newterm = newterm$277;
                this.call = call$278;
            }
        });
    var Call$582 = Expr$562.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function (breakDelim$280) {
                parser$6.assert(this.fun.hasPrototype(TermTree$559), 'expecting a term tree in destruct of call');
                var that$286 = this;
                this.delim = syntaxFromToken(_$5.clone(this.delim.token), this.delim.context);
                this.delim.token.inner = _$5.reduce(this.args, function (acc$282, term$283) {
                    parser$6.assert(term$283 && term$283.hasPrototype(TermTree$559), 'expecting term trees in destruct of Call');
                    var dst$285 = acc$282.concat(term$283.destruct(breakDelim$280));
                    if (that$286.commas.length > 0) {
                        dst$285 = dst$285.concat(that$286.commas.shift());
                    }
                    return dst$285;
                }, []);
                return this.fun.destruct(breakDelim$280).concat(Delimiter$576.create(this.delim).destruct(breakDelim$280));
            },
            construct: function (funn$287, args$288, delim$289, commas$290) {
                parser$6.assert(Array.isArray(args$288), 'requires an array of arguments terms');
                this.fun = funn$287;
                this.args = args$288;
                this.delim = delim$289;
                this.commas = commas$290;
            }
        });
    var ObjDotGet$583 = Expr$562.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$292, dot$293, right$294) {
                this.left = left$292;
                this.dot = dot$293;
                this.right = right$294;
            }
        });
    var ObjGet$584 = Expr$562.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$296, right$297) {
                this.left = left$296;
                this.right = right$297;
            }
        });
    var VariableDeclaration$585 = TermTree$559.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$299, eqstx$300, init$301, comma$302) {
                this.ident = ident$299;
                this.eqstx = eqstx$300;
                this.init = init$301;
                this.comma = comma$302;
            }
        });
    var VariableStatement$586 = Statement$561.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function (breakDelim$304) {
                return this.varkw.destruct(breakDelim$304).concat(_$5.reduce(this.decls, function (acc$306, decl$307) {
                    return acc$306.concat(decl$307.destruct(breakDelim$304));
                }, []));
            },
            construct: function (varkw$309, decls$310) {
                parser$6.assert(Array.isArray(decls$310), 'decls must be an array');
                this.varkw = varkw$309;
                this.decls = decls$310;
            }
        });
    var CatchClause$587 = TermTree$559.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$312, params$313, body$314) {
                this.catchkw = catchkw$312;
                this.params = params$313;
                this.body = body$314;
            }
        });
    var Empty$588 = TermTree$559.extend({
            properties: [],
            construct: function () {
            }
        });
    function stxIsUnaryOp(stx$317) {
        var staticOperators$319 = [
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
        return _$5.contains(staticOperators$319, stx$317.token.value);
    }
    function stxIsBinOp(stx$320) {
        var staticOperators$322 = [
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
        return _$5.contains(staticOperators$322, stx$320.token.value);
    }
    function enforestVarStatement(stx$323, env$324) {
        parser$6.assert(stx$323[0] && stx$323[0].token.type === parser$6.Token.Identifier, 'must start at the identifier');
        var decls$326 = [], rest$327 = stx$323, initRes$328, subRes$329;
        if (stx$323[1] && stx$323[1].token.type === parser$6.Token.Punctuator && stx$323[1].token.value === '=') {
            initRes$328 = enforest(stx$323.slice(2), env$324);
            if (initRes$328.result.hasPrototype(Expr$562)) {
                rest$327 = initRes$328.rest;
                if (initRes$328.rest[0].token.type === parser$6.Token.Punctuator && initRes$328.rest[0].token.value === ',' && initRes$328.rest[1] && initRes$328.rest[1].token.type === parser$6.Token.Identifier) {
                    decls$326.push(VariableDeclaration$585.create(stx$323[0], stx$323[1], initRes$328.result, initRes$328.rest[0]));
                    subRes$329 = enforestVarStatement(initRes$328.rest.slice(1), env$324);
                    decls$326 = decls$326.concat(subRes$329.result);
                    rest$327 = subRes$329.rest;
                } else {
                    decls$326.push(VariableDeclaration$585.create(stx$323[0], stx$323[1], initRes$328.result));
                }
            } else {
                parser$6.assert(false, 'parse error, expecting an expr in variable initialization');
            }
        } else if (stx$323[1] && stx$323[1].token.type === parser$6.Token.Punctuator && stx$323[1].token.value === ',') {
            decls$326.push(VariableDeclaration$585.create(stx$323[0], null, null, stx$323[1]));
            subRes$329 = enforestVarStatement(stx$323.slice(2), env$324);
            decls$326 = decls$326.concat(subRes$329.result);
            rest$327 = subRes$329.rest;
        } else {
            decls$326.push(VariableDeclaration$585.create(stx$323[0]));
            rest$327 = stx$323.slice(1);
        }
        return {
            result: decls$326,
            rest: rest$327
        };
    }
    function enforest(toks$330, env$331) {
        env$331 = env$331 || new Map();
        parser$6.assert(toks$330.length > 0, 'enforest assumes there are tokens to work with');
        function step(head$333, rest$334) {
            var innerTokens$338;
            parser$6.assert(Array.isArray(rest$334), 'result must at least be an empty array');
            if (head$333.hasPrototype(TermTree$559)) {
                if (head$333.hasPrototype(Expr$562) && rest$334[0] && rest$334[0].token.type === parser$6.Token.Delimiter && rest$334[0].token.value === '()') {
                    var argRes$339, enforestedArgs$340 = [], commas$341 = [];
                    innerTokens$338 = rest$334[0].token.inner;
                    while (innerTokens$338.length > 0) {
                        argRes$339 = enforest(innerTokens$338, env$331);
                        enforestedArgs$340.push(argRes$339.result);
                        innerTokens$338 = argRes$339.rest;
                        if (innerTokens$338[0] && innerTokens$338[0].token.value === ',') {
                            commas$341.push(innerTokens$338[0]);
                            innerTokens$338 = innerTokens$338.slice(1);
                        } else {
                            break;
                        }
                    }
                    var argsAreExprs$342 = _$5.all(enforestedArgs$340, function (argTerm$336) {
                            return argTerm$336.hasPrototype(Expr$562);
                        });
                    if (innerTokens$338.length === 0 && argsAreExprs$342) {
                        return step(Call$582.create(head$333, enforestedArgs$340, rest$334[0], commas$341), rest$334.slice(1));
                    }
                } else if (head$333.hasPrototype(Keyword$574) && head$333.keyword.token.value === 'new' && rest$334[0]) {
                    var newCallRes$343 = enforest(rest$334, env$331);
                    if (newCallRes$343.result.hasPrototype(Call$582)) {
                        return step(Const$581.create(head$333, newCallRes$343.result), newCallRes$343.rest);
                    }
                } else if (head$333.hasPrototype(Expr$562) && rest$334[0] && rest$334[0].token.value === '?') {
                    var question$344 = rest$334[0];
                    var condRes$345 = enforest(rest$334.slice(1), env$331);
                    var truExpr$346 = condRes$345.result;
                    var right$347 = condRes$345.rest;
                    if (truExpr$346.hasPrototype(Expr$562) && right$347[0] && right$347[0].token.value === ':') {
                        var colon$348 = right$347[0];
                        var flsRes$349 = enforest(right$347.slice(1), env$331);
                        var flsExpr$350 = flsRes$349.result;
                        if (flsExpr$350.hasPrototype(Expr$562)) {
                            return step(ConditionalExpression$573.create(head$333, question$344, truExpr$346, colon$348, flsExpr$350), flsRes$349.rest);
                        }
                    }
                } else if (head$333.hasPrototype(Delimiter$576) && head$333.delim.token.value === '()') {
                    innerTokens$338 = head$333.delim.token.inner;
                    if (innerTokens$338.length === 0) {
                        return step(ParenExpression$569.create(head$333), rest$334);
                    } else {
                        var innerTerm$351 = get_expression(innerTokens$338, env$331);
                        if (innerTerm$351.result && innerTerm$351.result.hasPrototype(Expr$562)) {
                            return step(ParenExpression$569.create(head$333), rest$334);
                        }
                    }
                } else if (rest$334[0] && rest$334[1] && stxIsBinOp(rest$334[0])) {
                    var op$352 = rest$334[0];
                    var left$353 = head$333;
                    var bopRes$354 = enforest(rest$334.slice(1), env$331);
                    var right$347 = bopRes$354.result;
                    if (right$347.hasPrototype(Expr$562)) {
                        return step(BinOp$572.create(op$352, left$353, right$347), bopRes$354.rest);
                    }
                } else if (head$333.hasPrototype(Punc$575) && stxIsUnaryOp(head$333.punc) || head$333.hasPrototype(Keyword$574) && stxIsUnaryOp(head$333.keyword)) {
                    var unopRes$355 = enforest(rest$334);
                    var op$352 = head$333.hasPrototype(Punc$575) ? head$333.punc : head$333.keyword;
                    if (unopRes$355.result.hasPrototype(Expr$562)) {
                        return step(UnaryOp$570.create(op$352, unopRes$355.result), unopRes$355.rest);
                    }
                } else if (head$333.hasPrototype(Expr$562) && rest$334[0] && (rest$334[0].token.value === '++' || rest$334[0].token.value === '--')) {
                    return step(PostfixOp$571.create(head$333, rest$334[0]), rest$334.slice(1));
                } else if (head$333.hasPrototype(Expr$562) && rest$334[0] && rest$334[0].token.value === '[]') {
                    var getRes$356 = enforest(rest$334[0].token.inner, env$331);
                    var resStx$357 = mkSyntax('[]', parser$6.Token.Delimiter, rest$334[0]);
                    resStx$357.token.inner = [getRes$356.result];
                    if (getRes$356.rest.length > 0) {
                        return step(ObjGet$584.create(head$333, Delimiter$576.create(resStx$357)), rest$334.slice(1));
                    }
                } else if (head$333.hasPrototype(Expr$562) && rest$334[0] && rest$334[0].token.value === '.' && rest$334[1] && rest$334[1].token.type === parser$6.Token.Identifier) {
                    return step(ObjDotGet$583.create(head$333, rest$334[0], rest$334[1]), rest$334.slice(2));
                } else if (head$333.hasPrototype(Delimiter$576) && head$333.delim.token.value === '[]') {
                    return step(ArrayLiteral$568.create(head$333), rest$334);
                } else if (head$333.hasPrototype(Delimiter$576) && head$333.delim.token.value === '{}') {
                    innerTokens$338 = head$333.delim.token.inner;
                    return step(Block$567.create(head$333), rest$334);
                } else if (head$333.hasPrototype(Keyword$574) && head$333.keyword.token.value === 'var' && rest$334[0] && rest$334[0].token.type === parser$6.Token.Identifier) {
                    var vsRes$358 = enforestVarStatement(rest$334, env$331);
                    if (vsRes$358) {
                        return step(VariableStatement$586.create(head$333, vsRes$358.result), vsRes$358.rest);
                    }
                }
            } else {
                parser$6.assert(head$333 && head$333.token, 'assuming head is a syntax object');
                if ((head$333.token.type === parser$6.Token.Identifier || head$333.token.type === parser$6.Token.Keyword) && env$331.has(head$333.token.value)) {
                    var transformer$359 = env$331.get(head$333.token.value);
                    var rt$360 = transformer$359(rest$334, head$333, env$331);
                    if (rt$360.result.length > 0) {
                        return step(rt$360.result[0], rt$360.result.slice(1).concat(rt$360.rest));
                    } else {
                        return step(Empty$588.create(), rt$360.rest);
                    }
                } else if (head$333.token.type === parser$6.Token.Identifier && head$333.token.value === 'macro' && rest$334[0] && (rest$334[0].token.type === parser$6.Token.Identifier || rest$334[0].token.type === parser$6.Token.Keyword) && rest$334[1] && rest$334[1].token.type === parser$6.Token.Delimiter && rest$334[1].token.value === '{}') {
                    return step(Macro$580.create(rest$334[0], rest$334[1].token.inner), rest$334.slice(2));
                } else if (head$333.token.type === parser$6.Token.Keyword && head$333.token.value === 'function' && rest$334[0] && rest$334[0].token.type === parser$6.Token.Identifier && rest$334[1] && rest$334[1].token.type === parser$6.Token.Delimiter && rest$334[1].token.value === '()' && rest$334[2] && rest$334[2].token.type === parser$6.Token.Delimiter && rest$334[2].token.value === '{}') {
                    return step(NamedFun$578.create(head$333, rest$334[0], rest$334[1], rest$334[2]), rest$334.slice(3));
                } else if (head$333.token.type === parser$6.Token.Keyword && head$333.token.value === 'function' && rest$334[0] && rest$334[0].token.type === parser$6.Token.Delimiter && rest$334[0].token.value === '()' && rest$334[1] && rest$334[1].token.type === parser$6.Token.Delimiter && rest$334[1].token.value === '{}') {
                    return step(AnonFun$579.create(head$333, rest$334[0], rest$334[1]), rest$334.slice(2));
                } else if (head$333.token.type === parser$6.Token.Keyword && head$333.token.value === 'catch' && rest$334[0] && rest$334[0].token.type === parser$6.Token.Delimiter && rest$334[0].token.value === '()' && rest$334[1] && rest$334[1].token.type === parser$6.Token.Delimiter && rest$334[1].token.value === '{}') {
                    return step(CatchClause$587.create(head$333, rest$334[0], rest$334[1]), rest$334.slice(2));
                } else if (head$333.token.type === parser$6.Token.Keyword && head$333.token.value === 'this') {
                    return step(ThisExpression$564.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.NumericLiteral || head$333.token.type === parser$6.Token.StringLiteral || head$333.token.type === parser$6.Token.BooleanLiteral || head$333.token.type === parser$6.Token.RegexLiteral || head$333.token.type === parser$6.Token.NullLiteral) {
                    return step(Lit$565.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.Identifier) {
                    return step(Id$577.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.Punctuator) {
                    return step(Punc$575.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.Keyword && head$333.token.value === 'with') {
                    throwError('with is not supported in sweet.js');
                } else if (head$333.token.type === parser$6.Token.Keyword) {
                    return step(Keyword$574.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.Delimiter) {
                    return step(Delimiter$576.create(head$333), rest$334);
                } else if (head$333.token.type === parser$6.Token.EOF) {
                    parser$6.assert(rest$334.length === 0, 'nothing should be after an EOF');
                    return step(EOF$560.create(head$333), []);
                } else {
                    parser$6.assert(false, 'not implemented');
                }
            }
            return {
                result: head$333,
                rest: rest$334
            };
        }
        return step(toks$330[0], toks$330.slice(1));
    }
    function get_expression(stx$361, env$362) {
        var res$364 = enforest(stx$361, env$362);
        if (!res$364.result.hasPrototype(Expr$562)) {
            return {
                result: null,
                rest: stx$361
            };
        }
        return res$364;
    }
    function typeIsLiteral(type$365) {
        return type$365 === parser$6.Token.NullLiteral || type$365 === parser$6.Token.NumericLiteral || type$365 === parser$6.Token.StringLiteral || type$365 === parser$6.Token.RegexLiteral || type$365 === parser$6.Token.BooleanLiteral;
    }
    exports$4._test.matchPatternClass = matchPatternClass;
    function matchPatternClass(patternClass$367, stx$368, env$369) {
        var result$371, rest$372;
        if (patternClass$367 === 'token' && stx$368[0] && stx$368[0].token.type !== parser$6.Token.EOF) {
            result$371 = [stx$368[0]];
            rest$372 = stx$368.slice(1);
        } else if (patternClass$367 === 'lit' && stx$368[0] && typeIsLiteral(stx$368[0].token.type)) {
            result$371 = [stx$368[0]];
            rest$372 = stx$368.slice(1);
        } else if (patternClass$367 === 'ident' && stx$368[0] && stx$368[0].token.type === parser$6.Token.Identifier) {
            result$371 = [stx$368[0]];
            rest$372 = stx$368.slice(1);
        } else if (patternClass$367 === 'VariableStatement') {
            var match$373 = enforest(stx$368, env$369);
            if (match$373.result && match$373.result.hasPrototype(VariableStatement$586)) {
                result$371 = match$373.result.destruct(false);
                rest$372 = match$373.rest;
            } else {
                result$371 = null;
                rest$372 = stx$368;
            }
        } else if (patternClass$367 === 'expr') {
            var match$373 = get_expression(stx$368, env$369);
            if (match$373.result === null || !match$373.result.hasPrototype(Expr$562)) {
                result$371 = null;
                rest$372 = stx$368;
            } else {
                result$371 = match$373.result.destruct(false);
                rest$372 = match$373.rest;
            }
        } else {
            result$371 = null;
            rest$372 = stx$368;
        }
        return {
            result: result$371,
            rest: rest$372
        };
    }
    function matchPattern(pattern$374, stx$375, env$376, patternEnv$377) {
        var subMatch$382;
        var match$383, matchEnv$384;
        var rest$385;
        var success$386;
        if (stx$375.length === 0) {
            return {
                success: false,
                rest: stx$375,
                patternEnv: patternEnv$377
            };
        }
        parser$6.assert(stx$375.length > 0, 'should have had something to match here');
        if (pattern$374.token.type === parser$6.Token.Delimiter) {
            if (pattern$374.class === 'pattern_group') {
                subMatch$382 = matchPatterns(pattern$374.token.inner, stx$375, env$376, false);
                rest$385 = subMatch$382.rest;
            } else if (stx$375[0].token.type === parser$6.Token.Delimiter && stx$375[0].token.value === pattern$374.token.value) {
                subMatch$382 = matchPatterns(pattern$374.token.inner, stx$375[0].token.inner, env$376, false);
                rest$385 = stx$375.slice(1);
            } else {
                return {
                    success: false,
                    rest: stx$375,
                    patternEnv: patternEnv$377
                };
            }
            success$386 = subMatch$382.success;
            _$5.keys(subMatch$382.patternEnv).forEach(function (patternKey$379) {
                if (pattern$374.repeat) {
                    var nextLevel$381 = subMatch$382.patternEnv[patternKey$379].level + 1;
                    if (patternEnv$377[patternKey$379]) {
                        patternEnv$377[patternKey$379].level = nextLevel$381;
                        patternEnv$377[patternKey$379].match.push(subMatch$382.patternEnv[patternKey$379]);
                    } else {
                        patternEnv$377[patternKey$379] = {
                            level: nextLevel$381,
                            match: [subMatch$382.patternEnv[patternKey$379]]
                        };
                    }
                } else {
                    patternEnv$377[patternKey$379] = subMatch$382.patternEnv[patternKey$379];
                }
            });
        } else {
            if (pattern$374.class === 'pattern_literal') {
                if (pattern$374.token.value === stx$375[0].token.value) {
                    success$386 = true;
                    rest$385 = stx$375.slice(1);
                } else {
                    success$386 = false;
                    rest$385 = stx$375;
                }
            } else {
                match$383 = matchPatternClass(pattern$374.class, stx$375, env$376);
                success$386 = match$383.result !== null;
                rest$385 = match$383.rest;
                matchEnv$384 = {
                    level: 0,
                    match: match$383.result
                };
                if (match$383.result !== null) {
                    if (pattern$374.repeat) {
                        if (patternEnv$377[pattern$374.token.value]) {
                            patternEnv$377[pattern$374.token.value].match.push(matchEnv$384);
                        } else {
                            patternEnv$377[pattern$374.token.value] = {
                                level: 1,
                                match: [matchEnv$384]
                            };
                        }
                    } else {
                        patternEnv$377[pattern$374.token.value] = matchEnv$384;
                    }
                }
            }
        }
        return {
            success: success$386,
            rest: rest$385,
            patternEnv: patternEnv$377
        };
    }
    function matchPatterns(patterns$387, stx$388, env$389, topLevel$390) {
        topLevel$390 = topLevel$390 || false;
        var result$392 = [];
        var patternEnv$393 = {};
        var match$394;
        var pattern$395;
        var rest$396 = stx$388;
        var success$397 = true;
        for (var i$398 = 0; i$398 < patterns$387.length; i$398++) {
            pattern$395 = patterns$387[i$398];
            do {
                match$394 = matchPattern(pattern$395, rest$396, env$389, patternEnv$393);
                if (!match$394.success) {
                    success$397 = false;
                }
                rest$396 = match$394.rest;
                patternEnv$393 = match$394.patternEnv;
                if (pattern$395.repeat && success$397) {
                    if (rest$396[0] && rest$396[0].token.value === pattern$395.separator) {
                        rest$396 = rest$396.slice(1);
                    } else if (pattern$395.separator === ' ') {
                        continue;
                    } else if (pattern$395.separator !== ' ' && rest$396.length > 0 && i$398 === patterns$387.length - 1 && topLevel$390 === false) {
                        success$397 = false;
                        break;
                    } else {
                        break;
                    }
                }
            } while (pattern$395.repeat && match$394.success && rest$396.length > 0);
        }
        return {
            success: success$397,
            rest: rest$396,
            patternEnv: patternEnv$393
        };
    }
    function transcribe(macroBody$399, macroNameStx$400, env$401) {
        return _$5.chain(macroBody$399).reduce(function (acc$403, bodyStx$404, idx$405, original$406) {
            var last$408 = original$406[idx$405 - 1];
            var next$409 = original$406[idx$405 + 1];
            var nextNext$410 = original$406[idx$405 + 2];
            if (bodyStx$404.token.value === '...') {
                return acc$403;
            }
            if (delimIsSeparator(bodyStx$404) && next$409 && next$409.token.value === '...') {
                return acc$403;
            }
            if (bodyStx$404.token.value === '$' && next$409 && next$409.token.type === parser$6.Token.Delimiter && next$409.token.value === '()') {
                return acc$403;
            }
            if (bodyStx$404.token.value === '$' && next$409 && next$409.token.type === parser$6.Token.Delimiter && next$409.token.value === '[]') {
                next$409.literal = true;
                return acc$403;
            }
            if (bodyStx$404.token.type === parser$6.Token.Delimiter && bodyStx$404.token.value === '()' && last$408 && last$408.token.value === '$') {
                bodyStx$404.group = true;
            }
            if (bodyStx$404.literal === true) {
                parser$6.assert(bodyStx$404.token.type === parser$6.Token.Delimiter, 'expecting a literal to be surrounded by []');
                return acc$403.concat(bodyStx$404.token.inner);
            }
            if (next$409 && next$409.token.value === '...') {
                bodyStx$404.repeat = true;
                bodyStx$404.separator = ' ';
            } else if (delimIsSeparator(next$409) && nextNext$410 && nextNext$410.token.value === '...') {
                bodyStx$404.repeat = true;
                bodyStx$404.separator = next$409.token.inner[0].token.value;
            }
            return acc$403.concat(bodyStx$404);
        }, []).reduce(function (acc$411, bodyStx$412, idx$413) {
            if (bodyStx$412.repeat) {
                if (bodyStx$412.token.type === parser$6.Token.Delimiter) {
                    var fv$429 = _$5.filter(freeVarsInPattern(bodyStx$412.token.inner), function (pat$415) {
                            return env$401.hasOwnProperty(pat$415);
                        });
                    var restrictedEnv$430 = [];
                    var nonScalar$431 = _$5.find(fv$429, function (pat$417) {
                            return env$401[pat$417].level > 0;
                        });
                    parser$6.assert(typeof nonScalar$431 !== 'undefined', 'must have a least one non-scalar in repeat');
                    var repeatLength$432 = env$401[nonScalar$431].match.length;
                    var sameLength$433 = _$5.all(fv$429, function (pat$419) {
                            return env$401[pat$419].level === 0 || env$401[pat$419].match.length === repeatLength$432;
                        });
                    parser$6.assert(sameLength$433, 'all non-scalars must have the same length');
                    restrictedEnv$430 = _$5.map(_$5.range(repeatLength$432), function (idx$421) {
                        var renv$425 = {};
                        _$5.each(fv$429, function (pat$423) {
                            if (env$401[pat$423].level === 0) {
                                renv$425[pat$423] = env$401[pat$423];
                            } else {
                                renv$425[pat$423] = env$401[pat$423].match[idx$421];
                            }
                        });
                        return renv$425;
                    });
                    var transcribed$434 = _$5.map(restrictedEnv$430, function (renv$426) {
                            if (bodyStx$412.group) {
                                return transcribe(bodyStx$412.token.inner, macroNameStx$400, renv$426);
                            } else {
                                var newBody$428 = syntaxFromToken(_$5.clone(bodyStx$412.token), bodyStx$412.context);
                                newBody$428.token.inner = transcribe(bodyStx$412.token.inner, macroNameStx$400, renv$426);
                                return newBody$428;
                            }
                        });
                    var joined$435;
                    if (bodyStx$412.group) {
                        joined$435 = joinSyntaxArr(transcribed$434, bodyStx$412.separator);
                    } else {
                        joined$435 = joinSyntax(transcribed$434, bodyStx$412.separator);
                    }
                    return acc$411.concat(joined$435);
                }
                parser$6.assert(env$401[bodyStx$412.token.value].level === 1, 'ellipses level does not match');
                return acc$411.concat(joinRepeatedMatch(env$401[bodyStx$412.token.value].match, bodyStx$412.separator));
            } else {
                if (bodyStx$412.token.type === parser$6.Token.Delimiter) {
                    var newBody$436 = syntaxFromToken(_$5.clone(bodyStx$412.token), macroBody$399.context);
                    newBody$436.token.inner = transcribe(bodyStx$412.token.inner, macroNameStx$400, env$401);
                    return acc$411.concat(newBody$436);
                }
                if (Object.prototype.hasOwnProperty.bind(env$401)(bodyStx$412.token.value)) {
                    parser$6.assert(env$401[bodyStx$412.token.value].level === 0, 'match ellipses level does not match: ' + bodyStx$412.token.value);
                    return acc$411.concat(takeLineContext(macroNameStx$400, env$401[bodyStx$412.token.value].match));
                }
                return acc$411.concat(takeLineContext(macroNameStx$400, [bodyStx$412]));
            }
        }, []).value();
    }
    function applyMarkToPatternEnv(newMark$437, env$438) {
        function dfs(match$440) {
            if (match$440.level === 0) {
                match$440.match = _$5.map(match$440.match, function (stx$442) {
                    return stx$442.mark(newMark$437);
                });
            } else {
                _$5.each(match$440.match, function (match$444) {
                    dfs(match$444);
                });
            }
        }
        _$5.keys(env$438).forEach(function (key$446) {
            dfs(env$438[key$446]);
        });
    }
    function makeTransformer(cases$448, macroName$449) {
        var sortedCases$465 = _$5.sortBy(cases$448, function (mcase$451) {
                return patternLength(mcase$451.pattern);
            }).reverse();
        return function transformer(stx$453, macroNameStx$454, env$455) {
            var match$459;
            var casePattern$460, caseBody$461;
            var newMark$462;
            var macroResult$463;
            for (var i$464 = 0; i$464 < sortedCases$465.length; i$464++) {
                casePattern$460 = sortedCases$465[i$464].pattern;
                caseBody$461 = sortedCases$465[i$464].body;
                match$459 = matchPatterns(casePattern$460, stx$453, env$455, true);
                if (match$459.success) {
                    newMark$462 = fresh();
                    applyMarkToPatternEnv(newMark$462, match$459.patternEnv);
                    macroResult$463 = transcribe(caseBody$461, macroNameStx$454, match$459.patternEnv);
                    macroResult$463 = _$5.map(macroResult$463, function (stx$457) {
                        return stx$457.mark(newMark$462);
                    });
                    return {
                        result: macroResult$463,
                        rest: match$459.rest
                    };
                }
            }
            throwError('Could not match any cases for macro: ' + macroNameStx$454.token.value);
        };
    }
    function findCase(start$466, stx$467) {
        parser$6.assert(start$466 >= 0 && start$466 < stx$467.length, 'start out of bounds');
        var idx$469 = start$466;
        while (idx$469 < stx$467.length) {
            if (stx$467[idx$469].token.value === 'case') {
                return idx$469;
            }
            idx$469++;
        }
        return -1;
    }
    function findCaseArrow(start$470, stx$471) {
        parser$6.assert(start$470 >= 0 && start$470 < stx$471.length, 'start out of bounds');
        var idx$473 = start$470;
        while (idx$473 < stx$471.length) {
            if (stx$471[idx$473].token.value === '=' && stx$471[idx$473 + 1] && stx$471[idx$473 + 1].token.value === '>') {
                return idx$473;
            }
            idx$473++;
        }
        return -1;
    }
    function loadMacroDef(mac$474) {
        var body$476 = mac$474.body;
        var caseOffset$477 = 0;
        var arrowOffset$478 = 0;
        var casePattern$479;
        var caseBody$480;
        var caseBodyIdx$481;
        var cases$482 = [];
        while (caseOffset$477 < body$476.length && body$476[caseOffset$477].token.value === 'case') {
            arrowOffset$478 = findCaseArrow(caseOffset$477, body$476);
            if (arrowOffset$478 > 0 && arrowOffset$478 < body$476.length) {
                caseBodyIdx$481 = arrowOffset$478 + 2;
                if (caseBodyIdx$481 >= body$476.length) {
                    throwError('case body missing in macro definition');
                }
                casePattern$479 = body$476.slice(caseOffset$477 + 1, arrowOffset$478);
                caseBody$480 = body$476[caseBodyIdx$481].token.inner;
                cases$482.push({
                    pattern: loadPattern(casePattern$479, mac$474.name),
                    body: caseBody$480
                });
            } else {
                throwError('case body missing in macro definition');
            }
            caseOffset$477 = findCase(arrowOffset$478, body$476);
            if (caseOffset$477 < 0) {
                break;
            }
        }
        return makeTransformer(cases$482);
    }
    function expandToTermTree(stx$483, env$484) {
        parser$6.assert(env$484, 'environment map is required');
        if (stx$483.length === 0) {
            return {
                terms: [],
                env: env$484
            };
        }
        parser$6.assert(stx$483[0].token, 'expecting a syntax object');
        var f$486 = enforest(stx$483, env$484);
        var head$487 = f$486.result;
        var rest$488 = f$486.rest;
        if (head$487.hasPrototype(Macro$580)) {
            var macroDefinition$489 = loadMacroDef(head$487);
            env$484.set(head$487.name.token.value, macroDefinition$489);
            return expandToTermTree(rest$488, env$484);
        }
        var trees$490 = expandToTermTree(rest$488, env$484);
        return {
            terms: [head$487].concat(trees$490.terms),
            env: trees$490.env
        };
    }
    function expandTermTreeToFinal(term$491, env$492, ctx$493) {
        parser$6.assert(env$492, 'environment map is required');
        parser$6.assert(ctx$493, 'context map is required');
        if (term$491.hasPrototype(ArrayLiteral$568)) {
            term$491.array.delim.token.inner = expand(term$491.array.delim.token.inner, env$492);
            return term$491;
        } else if (term$491.hasPrototype(Block$567)) {
            term$491.body.delim.token.inner = expand(term$491.body.delim.token.inner, env$492);
            return term$491;
        } else if (term$491.hasPrototype(ParenExpression$569)) {
            term$491.expr.delim.token.inner = expand(term$491.expr.delim.token.inner, env$492, ctx$493);
            return term$491;
        } else if (term$491.hasPrototype(Call$582)) {
            term$491.fun = expandTermTreeToFinal(term$491.fun, env$492, ctx$493);
            term$491.args = _$5.map(term$491.args, function (arg$495) {
                return expandTermTreeToFinal(arg$495, env$492, ctx$493);
            });
            return term$491;
        } else if (term$491.hasPrototype(UnaryOp$570)) {
            term$491.expr = expandTermTreeToFinal(term$491.expr, env$492, ctx$493);
            return term$491;
        } else if (term$491.hasPrototype(BinOp$572)) {
            term$491.left = expandTermTreeToFinal(term$491.left, env$492, ctx$493);
            term$491.right = expandTermTreeToFinal(term$491.right, env$492, ctx$493);
            return term$491;
        } else if (term$491.hasPrototype(ObjDotGet$583)) {
            term$491.left = expandTermTreeToFinal(term$491.left, env$492, ctx$493);
            term$491.right = expandTermTreeToFinal(term$491.right, env$492, ctx$493);
            return term$491;
        } else if (term$491.hasPrototype(VariableDeclaration$585)) {
            if (term$491.init) {
                term$491.init = expandTermTreeToFinal(term$491.init, env$492, ctx$493);
            }
            return term$491;
        } else if (term$491.hasPrototype(VariableStatement$586)) {
            term$491.decls = _$5.map(term$491.decls, function (decl$497) {
                return expandTermTreeToFinal(decl$497, env$492, ctx$493);
            });
            return term$491;
        } else if (term$491.hasPrototype(Delimiter$576)) {
            term$491.delim.token.inner = expand(term$491.delim.token.inner, env$492);
            return term$491;
        } else if (term$491.hasPrototype(NamedFun$578) || term$491.hasPrototype(AnonFun$579) || term$491.hasPrototype(CatchClause$587)) {
            var paramNames$521 = _$5.map(getParamIdentifiers(term$491.params), function (param$499) {
                    var freshName$501 = fresh();
                    return {
                        freshName: freshName$501,
                        originalParam: param$499,
                        renamedParam: param$499.rename(param$499, freshName$501)
                    };
                });
            var newCtx$522 = ctx$493;
            var stxBody$523 = term$491.body;
            var renamedBody$524 = _$5.reduce(paramNames$521, function (accBody$502, p$503) {
                    return accBody$502.rename(p$503.originalParam, p$503.freshName);
                }, stxBody$523);
            var dummyName$525 = fresh();
            renamedBody$524 = renamedBody$524.push_dummy_rename(dummyName$525);
            var bodyTerms$526 = expand([renamedBody$524], env$492, newCtx$522);
            parser$6.assert(bodyTerms$526.length === 1 && bodyTerms$526[0].body, 'expecting a block in the bodyTerms');
            var varIdents$527 = getVarDeclIdentifiers(bodyTerms$526[0]);
            varIdents$527 = _$5.filter(varIdents$527, function (varId$505) {
                return !_$5.any(paramNames$521, function (p$507) {
                    return resolve(varId$505) === resolve(p$507.renamedParam);
                });
            });
            varIdents$527 = _$5.uniq(varIdents$527, false, function (v$509) {
                return resolve(v$509);
            });
            var varNames$528 = _$5.map(varIdents$527, function (ident$511) {
                    var freshName$513 = fresh();
                    return {
                        freshName: freshName$513,
                        dummyName: dummyName$525,
                        originalVar: ident$511,
                        renamedVar: ident$511.swap_dummy_rename([{
                                freshName: freshName$513,
                                originalVar: ident$511
                            }], dummyName$525)
                    };
                });
            var flattenedBody$529 = _$5.map(flatten(bodyTerms$526), function (stx$514) {
                    var isDecl$518;
                    if (stx$514.token.type === parser$6.Token.Identifier) {
                        isDecl$518 = _$5.find(varNames$528, function (v$516) {
                            return v$516.originalVar === stx$514;
                        });
                        if (isDecl$518) {
                            return isDecl$518.renamedVar;
                        }
                        return stx$514.swap_dummy_rename(varNames$528, dummyName$525);
                    }
                    return stx$514;
                });
            var renamedParams$530 = _$5.map(paramNames$521, function (p$519) {
                    return p$519.renamedParam;
                });
            var flatArgs$531 = wrapDelim(joinSyntax(renamedParams$530, ','), term$491.params);
            var expandedArgs$532 = expand([flatArgs$531], env$492, ctx$493);
            parser$6.assert(expandedArgs$532.length === 1, 'should only get back one result');
            term$491.params = expandedArgs$532[0];
            term$491.body = flattenedBody$529;
            return term$491;
        }
        return term$491;
    }
    function expand(stx$533, env$534, ctx$535) {
        env$534 = env$534 || new Map();
        ctx$535 = ctx$535 || new Map();
        var trees$539 = expandToTermTree(stx$533, env$534, ctx$535);
        return _$5.map(trees$539.terms, function (term$537) {
            return expandTermTreeToFinal(term$537, trees$539.env, ctx$535);
        });
    }
    function expandTopLevel(stx$540) {
        var funn$542 = syntaxFromToken({
                value: 'function',
                type: parser$6.Token.Keyword
            });
        var name$543 = syntaxFromToken({
                value: '$topLevel$',
                type: parser$6.Token.Identifier
            });
        var params$544 = syntaxFromToken({
                value: '()',
                type: parser$6.Token.Delimiter,
                inner: []
            });
        var body$545 = syntaxFromToken({
                value: '{}',
                type: parser$6.Token.Delimiter,
                inner: stx$540
            });
        var res$546 = expand([
                funn$542,
                name$543,
                params$544,
                body$545
            ]);
        return res$546[0].body.slice(1, res$546[0].body.length - 1);
    }
    function flatten(terms$547) {
        return _$5.reduce(terms$547, function (acc$549, term$550) {
            return acc$549.concat(term$550.destruct(true));
        }, []);
    }
    exports$4.enforest = enforest;
    exports$4.expand = expandTopLevel;
    exports$4.resolve = resolve;
    exports$4.flatten = flatten;
    exports$4.tokensToSyntax = tokensToSyntax;
    exports$4.syntaxToTokens = syntaxToTokens;
}));