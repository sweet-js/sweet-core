/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>

  
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function (root$1284, factory$1285) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1285(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'es6-collections',
            'scopedEval',
            'patterns'
        ], factory$1285);
    }
}(this, function (exports$1286, _$1287, parser$1288, syn$1289, es6$1290, se$1291, patternModule$1292, gen$1293) {
    'use strict';
    var codegen$1294 = gen$1293 || escodegen;
    // used to export "private" methods for unit testing
    exports$1286._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$1596 = Object.create(this);
                if (typeof o$1596.construct === 'function') {
                    o$1596.construct.apply(o$1596, arguments);
                }
                return o$1596;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$1599) {
                var result$1600 = Object.create(this);
                for (var prop$1601 in properties$1599) {
                    if (properties$1599.hasOwnProperty(prop$1601)) {
                        result$1600[prop$1601] = properties$1599[prop$1601];
                    }
                }
                return result$1600;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$1604) {
                function F$1607() {
                }
                F$1607.prototype = proto$1604;
                return this instanceof F$1607;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$1473(msg$1608) {
        throw new Error(msg$1608);
    }
    var scopedEval$1474 = se$1291.scopedEval;
    var Rename$1475 = syn$1289.Rename;
    var Mark$1476 = syn$1289.Mark;
    var Var$1477 = syn$1289.Var;
    var Def$1478 = syn$1289.Def;
    var isDef$1479 = syn$1289.isDef;
    var isMark$1480 = syn$1289.isMark;
    var isRename$1481 = syn$1289.isRename;
    var syntaxFromToken$1482 = syn$1289.syntaxFromToken;
    var joinSyntax$1483 = syn$1289.joinSyntax;
    function remdup$1486(mark$1609, mlist$1610) {
        if (mark$1609 === _$1287.first(mlist$1610)) {
            return _$1287.rest(mlist$1610, 1);
        }
        return [mark$1609].concat(mlist$1610);
    }
    // (CSyntax) -> [...Num]
    function marksof$1489(ctx$1611, stopName$1612, originalName$1613) {
        var mark$1614, submarks$1615;
        if (isMark$1480(ctx$1611)) {
            mark$1614 = ctx$1611.mark;
            submarks$1615 = marksof$1489(ctx$1611.context, stopName$1612, originalName$1613);
            return remdup$1486(mark$1614, submarks$1615);
        }
        if (isDef$1479(ctx$1611)) {
            return marksof$1489(ctx$1611.context, stopName$1612, originalName$1613);
        }
        if (isRename$1481(ctx$1611)) {
            if (stopName$1612 === originalName$1613 + '$' + ctx$1611.name) {
                return [];
            }
            return marksof$1489(ctx$1611.context, stopName$1612, originalName$1613);
        }
        return [];
    }
    function resolve$1492(stx$1616) {
        return resolveCtx$1504(stx$1616.token.value, stx$1616.context, [], []);
    }
    function arraysEqual$1495(a$1617, b$1618) {
        if (a$1617.length !== b$1618.length) {
            return false;
        }
        for (var i$1619 = 0; i$1619 < a$1617.length; i$1619++) {
            if (a$1617[i$1619] !== b$1618[i$1619]) {
                return false;
            }
        }
        return true;
    }
    function renames$1498(defctx$1620, oldctx$1621, originalName$1622) {
        var acc$1623 = oldctx$1621;
        for (var i$1624 = 0; i$1624 < defctx$1620.length; i$1624++) {
            if (defctx$1620[i$1624].id.token.value === originalName$1622) {
                acc$1623 = Rename$1475(defctx$1620[i$1624].id, defctx$1620[i$1624].name, acc$1623, defctx$1620);
            }
        }
        return acc$1623;
    }
    function unionEl$1501(arr$1625, el$1626) {
        if (arr$1625.indexOf(el$1626) === -1) {
            var res$1627 = arr$1625.slice(0);
            res$1627.push(el$1626);
            return res$1627;
        }
        return arr$1625;
    }
    // (Syntax) -> String
    function resolveCtx$1504(originalName$1628, ctx$1629, stop_spine$1630, stop_branch$1631) {
        if (isMark$1480(ctx$1629)) {
            return resolveCtx$1504(originalName$1628, ctx$1629.context, stop_spine$1630, stop_branch$1631);
        }
        if (isDef$1479(ctx$1629)) {
            if (stop_spine$1630.indexOf(ctx$1629.defctx) !== -1) {
                return resolveCtx$1504(originalName$1628, ctx$1629.context, stop_spine$1630, stop_branch$1631);
            } else {
                return resolveCtx$1504(originalName$1628, renames$1498(ctx$1629.defctx, ctx$1629.context, originalName$1628), stop_spine$1630, unionEl$1501(stop_branch$1631, ctx$1629.defctx));
            }
        }
        if (isRename$1481(ctx$1629)) {
            if (originalName$1628 === ctx$1629.id.token.value) {
                var idName$1632 = resolveCtx$1504(ctx$1629.id.token.value, ctx$1629.id.context, stop_branch$1631, stop_branch$1631);
                var subName$1633 = resolveCtx$1504(originalName$1628, ctx$1629.context, unionEl$1501(stop_spine$1630, ctx$1629.def), stop_branch$1631);
                if (idName$1632 === subName$1633) {
                    var idMarks$1634 = marksof$1489(ctx$1629.id.context, originalName$1628 + '$' + ctx$1629.name, originalName$1628);
                    var subMarks$1635 = marksof$1489(ctx$1629.context, originalName$1628 + '$' + ctx$1629.name, originalName$1628);
                    if (arraysEqual$1495(idMarks$1634, subMarks$1635)) {
                        return originalName$1628 + '$' + ctx$1629.name;
                    }
                }
            }
            return resolveCtx$1504(originalName$1628, ctx$1629.context, stop_spine$1630, stop_branch$1631);
        }
        return originalName$1628;
    }
    var nextFresh$1505 = 0;
    // fun () -> Num
    function fresh$1508() {
        return nextFresh$1505++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$1511(towrap$1636, delimSyntax$1637) {
        parser$1288.assert(delimSyntax$1637.token.type === parser$1288.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$1482({
            type: parser$1288.Token.Delimiter,
            value: delimSyntax$1637.token.value,
            inner: towrap$1636,
            range: delimSyntax$1637.token.range,
            startLineNumber: delimSyntax$1637.token.startLineNumber,
            lineStart: delimSyntax$1637.token.lineStart
        }, delimSyntax$1637);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$1514(argSyntax$1638) {
        parser$1288.assert(argSyntax$1638.token.type === parser$1288.Token.Delimiter, 'expecting delimiter for function params');
        return _$1287.filter(argSyntax$1638.token.inner, function (stx$1645) {
            return stx$1645.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$1515 = {
            destruct: function () {
                return _$1287.reduce(this.properties, _$1287.bind(function (acc$1652, prop$1653) {
                    if (this[prop$1653] && this[prop$1653].hasPrototype(TermTree$1515)) {
                        return acc$1652.concat(this[prop$1653].destruct());
                    } else if (this[prop$1653] && this[prop$1653].token && this[prop$1653].token.inner) {
                        this[prop$1653].token.inner = _$1287.reduce(this[prop$1653].token.inner, function (acc$1656, t$1657) {
                            if (t$1657.hasPrototype(TermTree$1515)) {
                                return acc$1656.concat(t$1657.destruct());
                            }
                            return acc$1656.concat(t$1657);
                        }, []);
                        return acc$1652.concat(this[prop$1653]);
                    } else if (this[prop$1653]) {
                        return acc$1652.concat(this[prop$1653]);
                    } else {
                        return acc$1652;
                    }
                }, this), []);
            },
            addDefCtx: function (def$1658) {
                for (var i$1659 = 0; i$1659 < this.properties.length; i$1659++) {
                    var prop$1660 = this.properties[i$1659];
                    if (Array.isArray(this[prop$1660])) {
                        this[prop$1660] = _$1287.map(this[prop$1660], function (item$1663) {
                            return item$1663.addDefCtx(def$1658);
                        });
                    } else if (this[prop$1660]) {
                        this[prop$1660] = this[prop$1660].addDefCtx(def$1658);
                    }
                }
                return this;
            }
        };
    var EOF$1516 = TermTree$1515.extend({
            properties: ['eof'],
            construct: function (e$1666) {
                this.eof = e$1666;
            }
        });
    var Statement$1517 = TermTree$1515.extend({
            construct: function () {
            }
        });
    var Expr$1518 = TermTree$1515.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$1519 = Expr$1518.extend({
            construct: function () {
            }
        });
    var ThisExpression$1520 = PrimaryExpression$1519.extend({
            properties: ['this'],
            construct: function (that$1675) {
                this.this = that$1675;
            }
        });
    var Lit$1521 = PrimaryExpression$1519.extend({
            properties: ['lit'],
            construct: function (l$1678) {
                this.lit = l$1678;
            }
        });
    exports$1286._test.PropertyAssignment = PropertyAssignment$1522;
    var PropertyAssignment$1522 = TermTree$1515.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$1681, assignment$1682) {
                this.propName = propName$1681;
                this.assignment = assignment$1682;
            }
        });
    var Block$1523 = PrimaryExpression$1519.extend({
            properties: ['body'],
            construct: function (body$1685) {
                this.body = body$1685;
            }
        });
    var ArrayLiteral$1524 = PrimaryExpression$1519.extend({
            properties: ['array'],
            construct: function (ar$1688) {
                this.array = ar$1688;
            }
        });
    var ParenExpression$1525 = PrimaryExpression$1519.extend({
            properties: ['expr'],
            construct: function (expr$1691) {
                this.expr = expr$1691;
            }
        });
    var UnaryOp$1526 = Expr$1518.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$1694, expr$1695) {
                this.op = op$1694;
                this.expr = expr$1695;
            }
        });
    var PostfixOp$1527 = Expr$1518.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$1698, op$1699) {
                this.expr = expr$1698;
                this.op = op$1699;
            }
        });
    var BinOp$1528 = Expr$1518.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$1702, left$1703, right$1704) {
                this.op = op$1702;
                this.left = left$1703;
                this.right = right$1704;
            }
        });
    var ConditionalExpression$1529 = Expr$1518.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$1707, question$1708, tru$1709, colon$1710, fls$1711) {
                this.cond = cond$1707;
                this.question = question$1708;
                this.tru = tru$1709;
                this.colon = colon$1710;
                this.fls = fls$1711;
            }
        });
    var Keyword$1530 = TermTree$1515.extend({
            properties: ['keyword'],
            construct: function (k$1714) {
                this.keyword = k$1714;
            }
        });
    var Punc$1531 = TermTree$1515.extend({
            properties: ['punc'],
            construct: function (p$1717) {
                this.punc = p$1717;
            }
        });
    var Delimiter$1532 = TermTree$1515.extend({
            properties: ['delim'],
            construct: function (d$1720) {
                this.delim = d$1720;
            }
        });
    var Id$1533 = PrimaryExpression$1519.extend({
            properties: ['id'],
            construct: function (id$1723) {
                this.id = id$1723;
            }
        });
    var NamedFun$1534 = Expr$1518.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$1726, name$1727, params$1728, body$1729) {
                this.keyword = keyword$1726;
                this.name = name$1727;
                this.params = params$1728;
                this.body = body$1729;
            }
        });
    var AnonFun$1535 = Expr$1518.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$1732, params$1733, body$1734) {
                this.keyword = keyword$1732;
                this.params = params$1733;
                this.body = body$1734;
            }
        });
    var LetMacro$1536 = TermTree$1515.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1737, body$1738) {
                this.name = name$1737;
                this.body = body$1738;
            }
        });
    var Macro$1537 = TermTree$1515.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1741, body$1742) {
                this.name = name$1741;
                this.body = body$1742;
            }
        });
    var AnonMacro$1538 = TermTree$1515.extend({
            properties: ['body'],
            construct: function (body$1745) {
                this.body = body$1745;
            }
        });
    var Const$1539 = Expr$1518.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$1748, call$1749) {
                this.newterm = newterm$1748;
                this.call = call$1749;
            }
        });
    var Call$1540 = Expr$1518.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$1288.assert(this.fun.hasPrototype(TermTree$1515), 'expecting a term tree in destruct of call');
                var that$1754 = this;
                this.delim = syntaxFromToken$1482(_$1287.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$1287.reduce(this.args, function (acc$1757, term$1758) {
                    parser$1288.assert(term$1758 && term$1758.hasPrototype(TermTree$1515), 'expecting term trees in destruct of Call');
                    var dst$1759 = acc$1757.concat(term$1758.destruct());
                    // add all commas except for the last one
                    if (that$1754.commas.length > 0) {
                        dst$1759 = dst$1759.concat(that$1754.commas.shift());
                    }
                    return dst$1759;
                }, []);
                return this.fun.destruct().concat(Delimiter$1532.create(this.delim).destruct());
            },
            construct: function (funn$1760, args$1761, delim$1762, commas$1763) {
                parser$1288.assert(Array.isArray(args$1761), 'requires an array of arguments terms');
                this.fun = funn$1760;
                this.args = args$1761;
                this.delim = delim$1762;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$1763;
            }
        });
    var ObjDotGet$1541 = Expr$1518.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$1766, dot$1767, right$1768) {
                this.left = left$1766;
                this.dot = dot$1767;
                this.right = right$1768;
            }
        });
    var ObjGet$1542 = Expr$1518.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$1771, right$1772) {
                this.left = left$1771;
                this.right = right$1772;
            }
        });
    var VariableDeclaration$1543 = TermTree$1515.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$1775, eqstx$1776, init$1777, comma$1778) {
                this.ident = ident$1775;
                this.eqstx = eqstx$1776;
                this.init = init$1777;
                this.comma = comma$1778;
            }
        });
    var VariableStatement$1544 = Statement$1517.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$1287.reduce(this.decls, function (acc$1785, decl$1786) {
                    return acc$1785.concat(decl$1786.destruct());
                }, []));
            },
            construct: function (varkw$1787, decls$1788) {
                parser$1288.assert(Array.isArray(decls$1788), 'decls must be an array');
                this.varkw = varkw$1787;
                this.decls = decls$1788;
            }
        });
    var CatchClause$1545 = TermTree$1515.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$1791, params$1792, body$1793) {
                this.catchkw = catchkw$1791;
                this.params = params$1792;
                this.body = body$1793;
            }
        });
    var Module$1546 = TermTree$1515.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$1796) {
                this.body = body$1796;
                this.exports = [];
            }
        });
    var Empty$1547 = TermTree$1515.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$1548 = TermTree$1515.extend({
            properties: ['name'],
            construct: function (name$1801) {
                this.name = name$1801;
            }
        });
    function stxIsUnaryOp$1551(stx$1802) {
        var staticOperators$1803 = [
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
        return _$1287.contains(staticOperators$1803, stx$1802.token.value);
    }
    function stxIsBinOp$1554(stx$1804) {
        var staticOperators$1805 = [
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
        return _$1287.contains(staticOperators$1805, stx$1804.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$1557(stx$1806, context$1807) {
        var decls$1808 = [];
        var res$1809 = enforest$1563(stx$1806, context$1807);
        var result$1810 = res$1809.result;
        var rest$1811 = res$1809.rest;
        if (rest$1811[0]) {
            var nextRes$1812 = enforest$1563(rest$1811, context$1807);
            // x = ...
            if (nextRes$1812.result.hasPrototype(Punc$1531) && nextRes$1812.result.punc.token.value === '=') {
                var initializerRes$1813 = enforest$1563(nextRes$1812.rest, context$1807);
                if (initializerRes$1813.rest[0]) {
                    var restRes$1814 = enforest$1563(initializerRes$1813.rest, context$1807);
                    // x = y + z, ...
                    if (restRes$1814.result.hasPrototype(Punc$1531) && restRes$1814.result.punc.token.value === ',') {
                        decls$1808.push(VariableDeclaration$1543.create(result$1810.id, nextRes$1812.result.punc, initializerRes$1813.result, restRes$1814.result.punc));
                        var subRes$1815 = enforestVarStatement$1557(restRes$1814.rest, context$1807);
                        decls$1808 = decls$1808.concat(subRes$1815.result);
                        rest$1811 = subRes$1815.rest;
                    }    // x = y ...
                    else {
                        decls$1808.push(VariableDeclaration$1543.create(result$1810.id, nextRes$1812.result.punc, initializerRes$1813.result));
                        rest$1811 = initializerRes$1813.rest;
                    }
                }    // x = y EOF
                else {
                    decls$1808.push(VariableDeclaration$1543.create(result$1810.id, nextRes$1812.result.punc, initializerRes$1813.result));
                }
            }    // x ,...;
            else if (nextRes$1812.result.hasPrototype(Punc$1531) && nextRes$1812.result.punc.token.value === ',') {
                decls$1808.push(VariableDeclaration$1543.create(result$1810.id, null, null, nextRes$1812.result.punc));
                var subRes$1815 = enforestVarStatement$1557(nextRes$1812.rest, context$1807);
                decls$1808 = decls$1808.concat(subRes$1815.result);
                rest$1811 = subRes$1815.rest;
            } else {
                if (result$1810.hasPrototype(Id$1533)) {
                    decls$1808.push(VariableDeclaration$1543.create(result$1810.id));
                } else {
                    throwError$1473('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$1810.hasPrototype(Id$1533)) {
                decls$1808.push(VariableDeclaration$1543.create(result$1810.id));
            } else if (result$1810.hasPrototype(BinOp$1528) && result$1810.op.token.value === 'in') {
                decls$1808.push(VariableDeclaration$1543.create(result$1810.left.id, result$1810.op, result$1810.right));
            } else {
                throwError$1473('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$1808,
            rest: rest$1811
        };
    }
    function adjustLineContext$1560(stx$1816, original$1817) {
        var last$1818 = stx$1816[0] && typeof stx$1816[0].token.range == 'undefined' ? original$1817 : stx$1816[0];
        return _$1287.map(stx$1816, function (stx$1821) {
            if (typeof stx$1821.token.range == 'undefined') {
                stx$1821.token.range = last$1818.token.range;
            }
            if (stx$1821.token.type === parser$1288.Token.Delimiter) {
                stx$1821.token.sm_startLineNumber = original$1817.token.lineNumber;
                stx$1821.token.sm_endLineNumber = original$1817.token.lineNumber;
                stx$1821.token.sm_startLineStart = original$1817.token.lineStart;
                stx$1821.token.sm_endLineStart = original$1817.token.lineStart;
                if (stx$1821.token.inner.length > 0) {
                    stx$1821.token.inner = adjustLineContext$1560(stx$1821.token.inner, original$1817);
                }
                last$1818 = stx$1821;
                return stx$1821;
            }
            stx$1821.token.sm_lineNumber = original$1817.token.lineNumber;
            stx$1821.token.sm_lineStart = original$1817.token.lineStart;
            last$1818 = stx$1821;
            return stx$1821;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$1563(toks$1822, context$1823) {
        parser$1288.assert(toks$1822.length > 0, 'enforest assumes there are tokens to work with');
        function step$1826(head$1827, rest$1828) {
            var innerTokens$1829;
            parser$1288.assert(Array.isArray(rest$1828), 'result must at least be an empty array');
            if (head$1827.hasPrototype(TermTree$1515)) {
                // function call
                var emp$1834 = head$1827.emp;
                var emp$1834 = head$1827.emp;
                var keyword$1839 = head$1827.keyword;
                var delim$1842 = head$1827.delim;
                var emp$1834 = head$1827.emp;
                var punc$1847 = head$1827.punc;
                var keyword$1839 = head$1827.keyword;
                var emp$1834 = head$1827.emp;
                var emp$1834 = head$1827.emp;
                var emp$1834 = head$1827.emp;
                var delim$1842 = head$1827.delim;
                var delim$1842 = head$1827.delim;
                var keyword$1839 = head$1827.keyword;
                var keyword$1839 = head$1827.keyword;
                if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Delimiter && rest$1828[0].token.value === '()')) {
                    var argRes$1896, enforestedArgs$1897 = [], commas$1898 = [];
                    rest$1828[0].expose();
                    innerTokens$1829 = rest$1828[0].token.inner;
                    while (innerTokens$1829.length > 0) {
                        argRes$1896 = enforest$1563(innerTokens$1829, context$1823);
                        enforestedArgs$1897.push(argRes$1896.result);
                        innerTokens$1829 = argRes$1896.rest;
                        if (innerTokens$1829[0] && innerTokens$1829[0].token.value === ',') {
                            // record the comma for later
                            commas$1898.push(innerTokens$1829[0]);
                            // but dump it for the next loop turn
                            innerTokens$1829 = innerTokens$1829.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$1901 = _$1287.all(enforestedArgs$1897, function (argTerm$1902) {
                            return argTerm$1902.hasPrototype(Expr$1518);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$1829.length === 0 && argsAreExprs$1901) {
                        return step$1826(Call$1540.create(head$1827, enforestedArgs$1897, rest$1828[0], commas$1898), rest$1828.slice(1));
                    }
                } else if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && rest$1828[0].token.value === '?')) {
                    var question$1903 = rest$1828[0];
                    var condRes$1904 = enforest$1563(rest$1828.slice(1), context$1823);
                    var truExpr$1905 = condRes$1904.result;
                    var right$1906 = condRes$1904.rest;
                    if (truExpr$1905.hasPrototype(Expr$1518) && right$1906[0] && right$1906[0].token.value === ':') {
                        var colon$1907 = right$1906[0];
                        var flsRes$1908 = enforest$1563(right$1906.slice(1), context$1823);
                        var flsExpr$1909 = flsRes$1908.result;
                        if (flsExpr$1909.hasPrototype(Expr$1518)) {
                            return step$1826(ConditionalExpression$1529.create(head$1827, question$1903, truExpr$1905, colon$1907, flsExpr$1909), flsRes$1908.rest);
                        }
                    }
                } else if (head$1827.hasPrototype(Keyword$1530) && (keyword$1839.token.value === 'new' && rest$1828[0])) {
                    var newCallRes$1910 = enforest$1563(rest$1828, context$1823);
                    if (newCallRes$1910.result.hasPrototype(Call$1540)) {
                        return step$1826(Const$1539.create(head$1827, newCallRes$1910.result), newCallRes$1910.rest);
                    }
                } else if (head$1827.hasPrototype(Delimiter$1532) && delim$1842.token.value === '()') {
                    innerTokens$1829 = delim$1842.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$1829.length === 0) {
                        return step$1826(ParenExpression$1525.create(head$1827), rest$1828);
                    } else {
                        var innerTerm$1911 = get_expression$1566(innerTokens$1829, context$1823);
                        if (innerTerm$1911.result && innerTerm$1911.result.hasPrototype(Expr$1518)) {
                            return step$1826(ParenExpression$1525.create(head$1827), rest$1828);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && rest$1828[1] && stxIsBinOp$1554(rest$1828[0]))) {
                    var op$1912 = rest$1828[0];
                    var left$1913 = head$1827;
                    var bopRes$1914 = enforest$1563(rest$1828.slice(1), context$1823);
                    var right$1906 = bopRes$1914.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$1906.hasPrototype(Expr$1518)) {
                        return step$1826(BinOp$1528.create(op$1912, left$1913, right$1906), bopRes$1914.rest);
                    }
                } else if (head$1827.hasPrototype(Punc$1531) && stxIsUnaryOp$1551(punc$1847)) {
                    var unopRes$1915 = enforest$1563(rest$1828, context$1823);
                    if (unopRes$1915.result.hasPrototype(Expr$1518)) {
                        return step$1826(UnaryOp$1526.create(punc$1847, unopRes$1915.result), unopRes$1915.rest);
                    }
                } else if (head$1827.hasPrototype(Keyword$1530) && stxIsUnaryOp$1551(keyword$1839)) {
                    var unopRes$1915 = enforest$1563(rest$1828, context$1823);
                    if (unopRes$1915.result.hasPrototype(Expr$1518)) {
                        return step$1826(UnaryOp$1526.create(keyword$1839, unopRes$1915.result), unopRes$1915.rest);
                    }
                } else if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && (rest$1828[0].token.value === '++' || rest$1828[0].token.value === '--'))) {
                    return step$1826(PostfixOp$1527.create(head$1827, rest$1828[0]), rest$1828.slice(1));
                } else if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && rest$1828[0].token.value === '[]')) {
                    return step$1826(ObjGet$1542.create(head$1827, Delimiter$1532.create(rest$1828[0].expose())), rest$1828.slice(1));
                } else if (head$1827.hasPrototype(Expr$1518) && (rest$1828[0] && rest$1828[0].token.value === '.' && rest$1828[1] && rest$1828[1].token.type === parser$1288.Token.Identifier)) {
                    return step$1826(ObjDotGet$1541.create(head$1827, rest$1828[0], rest$1828[1]), rest$1828.slice(2));
                } else if (head$1827.hasPrototype(Delimiter$1532) && delim$1842.token.value === '[]') {
                    return step$1826(ArrayLiteral$1524.create(head$1827), rest$1828);
                } else if (head$1827.hasPrototype(Delimiter$1532) && head$1827.delim.token.value === '{}') {
                    return step$1826(Block$1523.create(head$1827), rest$1828);
                } else if (head$1827.hasPrototype(Keyword$1530) && (keyword$1839.token.value === 'let' && (rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Identifier || rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Keyword || rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Punctuator) && rest$1828[1] && rest$1828[1].token.value === '=' && rest$1828[2] && rest$1828[2].token.value === 'macro')) {
                    var mac$1916 = enforest$1563(rest$1828.slice(2), context$1823);
                    if (!mac$1916.result.hasPrototype(AnonMacro$1538)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$1916.result);
                    }
                    return step$1826(LetMacro$1536.create(rest$1828[0], mac$1916.result.body), mac$1916.rest);
                } else if (head$1827.hasPrototype(Keyword$1530) && (keyword$1839.token.value === 'var' && rest$1828[0])) {
                    var vsRes$1917 = enforestVarStatement$1557(rest$1828, context$1823);
                    if (vsRes$1917) {
                        return step$1826(VariableStatement$1544.create(head$1827, vsRes$1917.result), vsRes$1917.rest);
                    }
                }
            } else {
                parser$1288.assert(head$1827 && head$1827.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$1827.token.type === parser$1288.Token.Identifier || head$1827.token.type === parser$1288.Token.Keyword || head$1827.token.type === parser$1288.Token.Punctuator) && context$1823.env.has(resolve$1492(head$1827))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$1918 = fresh$1508();
                    var transformerContext$1919 = makeExpanderContext$1587(_$1287.defaults({ mark: newMark$1918 }, context$1823));
                    // pull the macro transformer out the environment
                    var transformer$1920 = context$1823.env.get(resolve$1492(head$1827)).fn;
                    // apply the transformer
                    var rt$1921 = transformer$1920([head$1827].concat(rest$1828), transformerContext$1919);
                    if (!Array.isArray(rt$1921.result)) {
                        throwError$1473('Macro transformer must return a result array, not: ' + rt$1921.result);
                    }
                    if (rt$1921.result.length > 0) {
                        var adjustedResult$1922 = adjustLineContext$1560(rt$1921.result, head$1827);
                        adjustedResult$1922[0].token.leadingComments = head$1827.token.leadingComments;
                        return step$1826(adjustedResult$1922[0], adjustedResult$1922.slice(1).concat(rt$1921.rest));
                    } else {
                        return step$1826(Empty$1547.create(), rt$1921.rest);
                    }
                }    // anon macro definition
                else if (head$1827.token.type === parser$1288.Token.Identifier && head$1827.token.value === 'macro' && rest$1828[0] && rest$1828[0].token.value === '{}') {
                    return step$1826(AnonMacro$1538.create(rest$1828[0].expose().token.inner), rest$1828.slice(1));
                }    // macro definition
                else if (head$1827.token.type === parser$1288.Token.Identifier && head$1827.token.value === 'macro' && rest$1828[0] && (rest$1828[0].token.type === parser$1288.Token.Identifier || rest$1828[0].token.type === parser$1288.Token.Keyword || rest$1828[0].token.type === parser$1288.Token.Punctuator) && rest$1828[1] && rest$1828[1].token.type === parser$1288.Token.Delimiter && rest$1828[1].token.value === '{}') {
                    return step$1826(Macro$1537.create(rest$1828[0], rest$1828[1].expose().token.inner), rest$1828.slice(2));
                }    // module definition
                else if (head$1827.token.value === 'module' && rest$1828[0] && rest$1828[0].token.value === '{}') {
                    return step$1826(Module$1546.create(rest$1828[0]), rest$1828.slice(1));
                }    // function definition
                else if (head$1827.token.type === parser$1288.Token.Keyword && head$1827.token.value === 'function' && rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Identifier && rest$1828[1] && rest$1828[1].token.type === parser$1288.Token.Delimiter && rest$1828[1].token.value === '()' && rest$1828[2] && rest$1828[2].token.type === parser$1288.Token.Delimiter && rest$1828[2].token.value === '{}') {
                    rest$1828[1].token.inner = rest$1828[1].expose().token.inner;
                    rest$1828[2].token.inner = rest$1828[2].expose().token.inner;
                    return step$1826(NamedFun$1534.create(head$1827, rest$1828[0], rest$1828[1], rest$1828[2]), rest$1828.slice(3));
                }    // anonymous function definition
                else if (head$1827.token.type === parser$1288.Token.Keyword && head$1827.token.value === 'function' && rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Delimiter && rest$1828[0].token.value === '()' && rest$1828[1] && rest$1828[1].token.type === parser$1288.Token.Delimiter && rest$1828[1].token.value === '{}') {
                    rest$1828[0].token.inner = rest$1828[0].expose().token.inner;
                    rest$1828[1].token.inner = rest$1828[1].expose().token.inner;
                    return step$1826(AnonFun$1535.create(head$1827, rest$1828[0], rest$1828[1]), rest$1828.slice(2));
                }    // catch statement
                else if (head$1827.token.type === parser$1288.Token.Keyword && head$1827.token.value === 'catch' && rest$1828[0] && rest$1828[0].token.type === parser$1288.Token.Delimiter && rest$1828[0].token.value === '()' && rest$1828[1] && rest$1828[1].token.type === parser$1288.Token.Delimiter && rest$1828[1].token.value === '{}') {
                    rest$1828[0].token.inner = rest$1828[0].expose().token.inner;
                    rest$1828[1].token.inner = rest$1828[1].expose().token.inner;
                    return step$1826(CatchClause$1545.create(head$1827, rest$1828[0], rest$1828[1]), rest$1828.slice(2));
                }    // this expression
                else if (head$1827.token.type === parser$1288.Token.Keyword && head$1827.token.value === 'this') {
                    return step$1826(ThisExpression$1520.create(head$1827), rest$1828);
                }    // literal
                else if (head$1827.token.type === parser$1288.Token.NumericLiteral || head$1827.token.type === parser$1288.Token.StringLiteral || head$1827.token.type === parser$1288.Token.BooleanLiteral || head$1827.token.type === parser$1288.Token.RegexLiteral || head$1827.token.type === parser$1288.Token.NullLiteral) {
                    return step$1826(Lit$1521.create(head$1827), rest$1828);
                }    // export
                else if (head$1827.token.type === parser$1288.Token.Identifier && head$1827.token.value === 'export' && rest$1828[0] && (rest$1828[0].token.type === parser$1288.Token.Identifier || rest$1828[0].token.type === parser$1288.Token.Keyword || rest$1828[0].token.type === parser$1288.Token.Punctuator)) {
                    return step$1826(Export$1548.create(rest$1828[0]), rest$1828.slice(1));
                }    // identifier
                else if (head$1827.token.type === parser$1288.Token.Identifier) {
                    return step$1826(Id$1533.create(head$1827), rest$1828);
                }    // punctuator
                else if (head$1827.token.type === parser$1288.Token.Punctuator) {
                    return step$1826(Punc$1531.create(head$1827), rest$1828);
                } else if (head$1827.token.type === parser$1288.Token.Keyword && head$1827.token.value === 'with') {
                    throwError$1473('with is not supported in sweet.js');
                }    // keyword
                else if (head$1827.token.type === parser$1288.Token.Keyword) {
                    return step$1826(Keyword$1530.create(head$1827), rest$1828);
                }    // Delimiter
                else if (head$1827.token.type === parser$1288.Token.Delimiter) {
                    return step$1826(Delimiter$1532.create(head$1827.expose()), rest$1828);
                }    // end of file
                else if (head$1827.token.type === parser$1288.Token.EOF) {
                    parser$1288.assert(rest$1828.length === 0, 'nothing should be after an EOF');
                    return step$1826(EOF$1516.create(head$1827), []);
                } else {
                    // todo: are we missing cases?
                    parser$1288.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$1827,
                rest: rest$1828
            };
        }
        return step$1826(toks$1822[0], toks$1822.slice(1));
    }
    function get_expression$1566(stx$1923, context$1924) {
        var res$1925 = enforest$1563(stx$1923, context$1924);
        if (!res$1925.result.hasPrototype(Expr$1518)) {
            return {
                result: null,
                rest: stx$1923
            };
        }
        return res$1925;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$1569(newMark$1926, env$1927) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$1930(match$1933) {
            if (match$1933.level === 0) {
                // replace the match property with the marked syntax
                match$1933.match = _$1287.map(match$1933.match, function (stx$1936) {
                    return stx$1936.mark(newMark$1926);
                });
            } else {
                _$1287.each(match$1933.match, function (match$1939) {
                    dfs$1930(match$1939);
                });
            }
        }
        _$1287.keys(env$1927).forEach(function (key$1940) {
            dfs$1930(env$1927[key$1940]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$1572(mac$1941, context$1942) {
        var body$1943 = mac$1941.body;
        // raw function primitive form
        if (!(body$1943[0] && body$1943[0].token.type === parser$1288.Token.Keyword && body$1943[0].token.value === 'function')) {
            throwError$1473('Primitive macro form must contain a function for the macro body');
        }
        var stub$1944 = parser$1288.read('()');
        stub$1944[0].token.inner = body$1943;
        var expanded$1945 = expand$1584(stub$1944, context$1942);
        expanded$1945 = expanded$1945[0].destruct().concat(expanded$1945[1].eof);
        var flattend$1946 = flatten$1593(expanded$1945);
        var bodyCode$1947 = codegen$1294.generate(parser$1288.parse(flattend$1946));
        var macroFn$1948 = scopedEval$1474(bodyCode$1947, {
                makeValue: syn$1289.makeValue,
                makeRegex: syn$1289.makeRegex,
                makeIdent: syn$1289.makeIdent,
                makeKeyword: syn$1289.makeKeyword,
                makePunc: syn$1289.makePunc,
                makeDelim: syn$1289.makeDelim,
                unwrapSyntax: syn$1289.unwrapSyntax,
                throwSyntaxError: syn$1289.throwSyntaxError,
                fresh: fresh$1508,
                _: _$1287,
                parser: parser$1288,
                patternModule: patternModule$1292,
                getTemplate: function (id$1953) {
                    return context$1942.templateMap.get(id$1953);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$1569,
                mergeMatches: function (newMatch$1954, oldMatch$1955) {
                    newMatch$1954.patternEnv = _$1287.extend({}, oldMatch$1955.patternEnv, newMatch$1954.patternEnv);
                    return newMatch$1954;
                }
            });
        return macroFn$1948;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$1575(stx$1956, context$1957) {
        parser$1288.assert(context$1957, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$1956.length === 0) {
            return {
                terms: [],
                context: context$1957
            };
        }
        parser$1288.assert(stx$1956[0].token, 'expecting a syntax object');
        var f$1958 = enforest$1563(stx$1956, context$1957);
        // head :: TermTree
        var head$1959 = f$1958.result;
        // rest :: [Syntax]
        var rest$1960 = f$1958.rest;
        if (head$1959.hasPrototype(Macro$1537)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1962 = loadMacroDef$1572(head$1959, context$1957);
            addToDefinitionCtx$1578([head$1959.name], context$1957.defscope, false);
            context$1957.env.set(resolve$1492(head$1959.name), { fn: macroDefinition$1962 });
            return expandToTermTree$1575(rest$1960, context$1957);
        }
        if (head$1959.hasPrototype(LetMacro$1536)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1962 = loadMacroDef$1572(head$1959, context$1957);
            var freshName$1963 = fresh$1508();
            var renamedName$1964 = head$1959.name.rename(head$1959.name, freshName$1963);
            rest$1960 = _$1287.map(rest$1960, function (stx$1971) {
                return stx$1971.rename(head$1959.name, freshName$1963);
            });
            head$1959.name = renamedName$1964;
            context$1957.env.set(resolve$1492(head$1959.name), { fn: macroDefinition$1962 });
            return expandToTermTree$1575(rest$1960, context$1957);
        }
        if (head$1959.hasPrototype(NamedFun$1534)) {
            addToDefinitionCtx$1578([head$1959.name], context$1957.defscope, true);
        }
        if (head$1959.hasPrototype(Id$1533) && head$1959.id.token.value === '#quoteSyntax' && rest$1960[0] && rest$1960[0].token.value === '{}') {
            var tempId$1972 = fresh$1508();
            context$1957.templateMap.set(tempId$1972, rest$1960[0].token.inner);
            return expandToTermTree$1575([
                syn$1289.makeIdent('getTemplate', head$1959.id),
                syn$1289.makeDelim('()', [syn$1289.makeValue(tempId$1972, head$1959.id)], head$1959.id)
            ].concat(rest$1960.slice(1)), context$1957);
        }
        if (head$1959.hasPrototype(VariableStatement$1544)) {
            addToDefinitionCtx$1578(_$1287.map(head$1959.decls, function (decl$1979) {
                return decl$1979.ident;
            }), context$1957.defscope, true);
        }
        if (head$1959.hasPrototype(Block$1523) && head$1959.body.hasPrototype(Delimiter$1532)) {
            head$1959.body.delim.token.inner.forEach(function (term$1982) {
                if (term$1982.hasPrototype(VariableStatement$1544)) {
                    addToDefinitionCtx$1578(_$1287.map(term$1982.decls, function (decl$1989) {
                        return decl$1989.ident;
                    }), context$1957.defscope, true);
                }
            });
        }
        if (head$1959.hasPrototype(Delimiter$1532)) {
            head$1959.delim.token.inner.forEach(function (term$1996) {
                if (term$1996.hasPrototype(VariableStatement$1544)) {
                    addToDefinitionCtx$1578(_$1287.map(term$1996.decls, function (decl$2003) {
                        return decl$2003.ident;
                    }), context$1957.defscope, true);
                }
            });
        }
        var trees$1961 = expandToTermTree$1575(rest$1960, context$1957);
        return {
            terms: [head$1959].concat(trees$1961.terms),
            context: trees$1961.context
        };
    }
    function addToDefinitionCtx$1578(idents$2004, defscope$2005, skipRep$2006) {
        parser$1288.assert(idents$2004 && idents$2004.length > 0, 'expecting some variable identifiers');
        skipRep$2006 = skipRep$2006 || false;
        _$1287.each(idents$2004, function (id$2013) {
            var skip$2014 = false;
            if (skipRep$2006) {
                var declRepeat$2021 = _$1287.find(defscope$2005, function (def$2022) {
                        return def$2022.id.token.value === id$2013.token.value && arraysEqual$1495(marksof$1489(def$2022.id.context), marksof$1489(id$2013.context));
                    });
                skip$2014 = typeof declRepeat$2021 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$2014) {
                var name$2023 = fresh$1508();
                defscope$2005.push({
                    id: id$2013,
                    name: name$2023
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$1581(term$2024, context$2025) {
        parser$1288.assert(context$2025 && context$2025.env, 'environment map is required');
        if (term$2024.hasPrototype(ArrayLiteral$1524)) {
            term$2024.array.delim.token.inner = expand$1584(term$2024.array.delim.expose().token.inner, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(Block$1523)) {
            term$2024.body.delim.token.inner = expand$1584(term$2024.body.delim.expose().token.inner, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(ParenExpression$1525)) {
            term$2024.expr.delim.token.inner = expand$1584(term$2024.expr.delim.expose().token.inner, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(Call$1540)) {
            term$2024.fun = expandTermTreeToFinal$1581(term$2024.fun, context$2025);
            term$2024.args = _$1287.map(term$2024.args, function (arg$2032) {
                return expandTermTreeToFinal$1581(arg$2032, context$2025);
            });
            return term$2024;
        } else if (term$2024.hasPrototype(UnaryOp$1526)) {
            term$2024.expr = expandTermTreeToFinal$1581(term$2024.expr, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(BinOp$1528)) {
            term$2024.left = expandTermTreeToFinal$1581(term$2024.left, context$2025);
            term$2024.right = expandTermTreeToFinal$1581(term$2024.right, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(ObjGet$1542)) {
            term$2024.right.delim.token.inner = expand$1584(term$2024.right.delim.expose().token.inner, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(ObjDotGet$1541)) {
            term$2024.left = expandTermTreeToFinal$1581(term$2024.left, context$2025);
            term$2024.right = expandTermTreeToFinal$1581(term$2024.right, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(VariableDeclaration$1543)) {
            if (term$2024.init) {
                term$2024.init = expandTermTreeToFinal$1581(term$2024.init, context$2025);
            }
            return term$2024;
        } else if (term$2024.hasPrototype(VariableStatement$1544)) {
            term$2024.decls = _$1287.map(term$2024.decls, function (decl$2039) {
                return expandTermTreeToFinal$1581(decl$2039, context$2025);
            });
            return term$2024;
        } else if (term$2024.hasPrototype(Delimiter$1532)) {
            // expand inside the delimiter and then continue on
            term$2024.delim.token.inner = expand$1584(term$2024.delim.expose().token.inner, context$2025);
            return term$2024;
        } else if (term$2024.hasPrototype(NamedFun$1534) || term$2024.hasPrototype(AnonFun$1535) || term$2024.hasPrototype(CatchClause$1545) || term$2024.hasPrototype(Module$1546)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$2040 = [];
            var bodyContext$2041 = makeExpanderContext$1587(_$1287.defaults({ defscope: newDef$2040 }, context$2025));
            if (term$2024.params) {
                var params$2074 = term$2024.params.expose();
            } else {
                var params$2074 = syn$1289.makeDelim('()', [], null);
            }
            var bodies$2042 = term$2024.body.addDefCtx(newDef$2040);
            var paramNames$2049 = _$1287.map(getParamIdentifiers$1514(params$2074), function (param$2075) {
                    var freshName$2076 = fresh$1508();
                    return {
                        freshName: freshName$2076,
                        originalParam: param$2075,
                        renamedParam: param$2075.rename(param$2075, freshName$2076)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$2056 = _$1287.reduce(paramNames$2049, function (accBody$2077, p$2078) {
                    return accBody$2077.rename(p$2078.originalParam, p$2078.freshName);
                }, bodies$2042);
            renamedBody$2056 = renamedBody$2056.expose();
            var expandedResult$2057 = expandToTermTree$1575(renamedBody$2056.token.inner, bodyContext$2041);
            var bodyTerms$2058 = expandedResult$2057.terms;
            var renamedParams$2065 = _$1287.map(paramNames$2049, function (p$2079) {
                    return p$2079.renamedParam;
                });
            var flatArgs$2066 = syn$1289.makeDelim('()', joinSyntax$1483(renamedParams$2065, ','), term$2024.params);
            var expandedArgs$2067 = expand$1584([flatArgs$2066], bodyContext$2041);
            parser$1288.assert(expandedArgs$2067.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$2024.params) {
                term$2024.params = expandedArgs$2067[0];
            }
            bodyTerms$2058 = _$1287.map(bodyTerms$2058, function (bodyTerm$2080) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$2081 = bodyTerm$2080.addDefCtx(newDef$2040);
                // finish expansion
                return expandTermTreeToFinal$1581(termWithCtx$2081, expandedResult$2057.context);
            });
            if (term$2024.hasPrototype(Module$1546)) {
                bodyTerms$2058 = _$1287.filter(bodyTerms$2058, function (bodyTerm$2088) {
                    if (bodyTerm$2088.hasPrototype(Export$1548)) {
                        term$2024.exports.push(bodyTerm$2088);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$2056.token.inner = bodyTerms$2058;
            term$2024.body = renamedBody$2056;
            // and continue expand the rest
            return term$2024;
        }
        // the term is fine as is
        return term$2024;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$1584(stx$2089, context$2090) {
        parser$1288.assert(context$2090, 'must provide an expander context');
        var trees$2091 = expandToTermTree$1575(stx$2089, context$2090);
        return _$1287.map(trees$2091.terms, function (term$2098) {
            return expandTermTreeToFinal$1581(term$2098, trees$2091.context);
        });
    }
    function makeExpanderContext$1587(o$2099) {
        o$2099 = o$2099 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$2099.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$2099.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$2099.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$2099.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$1590(stx$2100, builtinSource$2101) {
        var builtInEnv$2102 = new Map();
        var env$2103 = new Map();
        var params$2104 = [];
        var context$2105, builtInContext$2106 = makeExpanderContext$1587({ env: builtInEnv$2102 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$2101) {
            var builtinRead$2111 = parser$1288.read(builtinSource$2101);
            builtinRead$2111 = [
                syn$1289.makeIdent('module', null),
                syn$1289.makeDelim('{}', builtinRead$2111, null)
            ];
            var builtinRes$2112 = expand$1584(builtinRead$2111, builtInContext$2106);
            params$2104 = _$1287.map(builtinRes$2112[0].exports, function (term$2115) {
                return {
                    oldExport: term$2115.name,
                    newParam: syn$1289.makeIdent(term$2115.name.token.value, null)
                };
            });
        }
        var modBody$2107 = syn$1289.makeDelim('{}', stx$2100, null);
        modBody$2107 = _$1287.reduce(params$2104, function (acc$2116, param$2117) {
            var newName$2118 = fresh$1508();
            env$2103.set(resolve$1492(param$2117.newParam.rename(param$2117.newParam, newName$2118)), builtInEnv$2102.get(resolve$1492(param$2117.oldExport)));
            return acc$2116.rename(param$2117.newParam, newName$2118);
        }, modBody$2107);
        context$2105 = makeExpanderContext$1587({ env: env$2103 });
        var res$2110 = expand$1584([
                syn$1289.makeIdent('module', null),
                modBody$2107
            ], context$2105);
        res$2110 = res$2110[0].destruct();
        return flatten$1593(res$2110[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$1593(stx$2119) {
        return _$1287.reduce(stx$2119, function (acc$2122, stx$2123) {
            if (stx$2123.token.type === parser$1288.Token.Delimiter) {
                var exposed$2124 = stx$2123.expose();
                var openParen$2125 = syntaxFromToken$1482({
                        type: parser$1288.Token.Punctuator,
                        value: stx$2123.token.value[0],
                        range: stx$2123.token.startRange,
                        lineNumber: stx$2123.token.startLineNumber,
                        sm_lineNumber: stx$2123.token.sm_startLineNumber ? stx$2123.token.sm_startLineNumber : stx$2123.token.startLineNumber,
                        lineStart: stx$2123.token.startLineStart,
                        sm_lineStart: stx$2123.token.sm_startLineStart ? stx$2123.token.sm_startLineStart : stx$2123.token.startLineStart
                    }, exposed$2124);
                var closeParen$2126 = syntaxFromToken$1482({
                        type: parser$1288.Token.Punctuator,
                        value: stx$2123.token.value[1],
                        range: stx$2123.token.endRange,
                        lineNumber: stx$2123.token.endLineNumber,
                        sm_lineNumber: stx$2123.token.sm_endLineNumber ? stx$2123.token.sm_endLineNumber : stx$2123.token.endLineNumber,
                        lineStart: stx$2123.token.endLineStart,
                        sm_lineStart: stx$2123.token.sm_endLineStart ? stx$2123.token.sm_endLineStart : stx$2123.token.endLineStart
                    }, exposed$2124);
                if (stx$2123.token.leadingComments) {
                    openParen$2125.token.leadingComments = stx$2123.token.leadingComments;
                }
                if (stx$2123.token.trailingComments) {
                    openParen$2125.token.trailingComments = stx$2123.token.trailingComments;
                }
                return acc$2122.concat(openParen$2125).concat(flatten$1593(exposed$2124.token.inner)).concat(closeParen$2126);
            }
            stx$2123.token.sm_lineNumber = stx$2123.token.sm_lineNumber ? stx$2123.token.sm_lineNumber : stx$2123.token.lineNumber;
            stx$2123.token.sm_lineStart = stx$2123.token.sm_lineStart ? stx$2123.token.sm_lineStart : stx$2123.token.lineStart;
            return acc$2122.concat(stx$2123);
        }, []);
    }
    exports$1286.enforest = enforest$1563;
    exports$1286.expand = expandTopLevel$1590;
    exports$1286.resolve = resolve$1492;
    exports$1286.get_expression = get_expression$1566;
    exports$1286.makeExpanderContext = makeExpanderContext$1587;
    exports$1286.Expr = Expr$1518;
    exports$1286.VariableStatement = VariableStatement$1544;
    exports$1286.tokensToSyntax = syn$1289.tokensToSyntax;
    exports$1286.syntaxToTokens = syn$1289.syntaxToTokens;
}));