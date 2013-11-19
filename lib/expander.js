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
(function (root$1198, factory$1199) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1199(exports, require('underscore'), require('./parser'), require('./syntax'), require('es6-collections'), require('./scopedEval'), require('./patterns'), require('escodegen'));
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
        ], factory$1199);
    }
}(this, function (exports$1200, _$1201, parser$1202, syn$1203, es6$1204, se$1205, patternModule$1206, gen$1207) {
    'use strict';
    var codegen$1208 = gen$1207 || escodegen;
    // used to export "private" methods for unit testing
    exports$1200._test = {};
    // some convenience monkey patching
    Object.defineProperties(Object.prototype, {
        'create': {
            value: function () {
                var o$1435 = Object.create(this);
                if (typeof o$1435.construct === 'function') {
                    o$1435.construct.apply(o$1435, arguments);
                }
                return o$1435;
            },
            enumerable: false,
            writable: true
        },
        'extend': {
            value: function (properties$1437) {
                var result$1438 = Object.create(this);
                for (var prop$1439 in properties$1437) {
                    if (properties$1437.hasOwnProperty(prop$1439)) {
                        result$1438[prop$1439] = properties$1437[prop$1439];
                    }
                }
                return result$1438;
            },
            enumerable: false,
            writable: true
        },
        'hasPrototype': {
            value: function (proto$1441) {
                function F$1443() {
                }
                F$1443.prototype = proto$1441;
                return this instanceof F$1443;
            },
            enumerable: false,
            writable: true
        }
    });
    // todo: add more message information
    function throwError$1338(msg$1444) {
        throw new Error(msg$1444);
    }
    var scopedEval$1339 = se$1205.scopedEval;
    var Rename$1340 = syn$1203.Rename;
    var Mark$1341 = syn$1203.Mark;
    var Var$1342 = syn$1203.Var;
    var Def$1343 = syn$1203.Def;
    var isDef$1344 = syn$1203.isDef;
    var isMark$1345 = syn$1203.isMark;
    var isRename$1346 = syn$1203.isRename;
    var syntaxFromToken$1347 = syn$1203.syntaxFromToken;
    var joinSyntax$1348 = syn$1203.joinSyntax;
    function remdup$1350(mark$1445, mlist$1446) {
        if (mark$1445 === _$1201.first(mlist$1446)) {
            return _$1201.rest(mlist$1446, 1);
        }
        return [mark$1445].concat(mlist$1446);
    }
    // (CSyntax) -> [...Num]
    function marksof$1352(ctx$1447, stopName$1448, originalName$1449) {
        var mark$1450, submarks$1451;
        if (isMark$1345(ctx$1447)) {
            mark$1450 = ctx$1447.mark;
            submarks$1451 = marksof$1352(ctx$1447.context, stopName$1448, originalName$1449);
            return remdup$1350(mark$1450, submarks$1451);
        }
        if (isDef$1344(ctx$1447)) {
            return marksof$1352(ctx$1447.context, stopName$1448, originalName$1449);
        }
        if (isRename$1346(ctx$1447)) {
            if (stopName$1448 === originalName$1449 + '$' + ctx$1447.name) {
                return [];
            }
            return marksof$1352(ctx$1447.context, stopName$1448, originalName$1449);
        }
        return [];
    }
    function resolve$1354(stx$1452) {
        return resolveCtx$1362(stx$1452.token.value, stx$1452.context, [], []);
    }
    function arraysEqual$1356(a$1453, b$1454) {
        if (a$1453.length !== b$1454.length) {
            return false;
        }
        for (var i$1455 = 0; i$1455 < a$1453.length; i$1455++) {
            if (a$1453[i$1455] !== b$1454[i$1455]) {
                return false;
            }
        }
        return true;
    }
    function renames$1358(defctx$1456, oldctx$1457, originalName$1458) {
        var acc$1459 = oldctx$1457;
        for (var i$1460 = 0; i$1460 < defctx$1456.length; i$1460++) {
            if (defctx$1456[i$1460].id.token.value === originalName$1458) {
                acc$1459 = Rename$1340(defctx$1456[i$1460].id, defctx$1456[i$1460].name, acc$1459, defctx$1456);
            }
        }
        return acc$1459;
    }
    function unionEl$1360(arr$1461, el$1462) {
        if (arr$1461.indexOf(el$1462) === -1) {
            var res$1463 = arr$1461.slice(0);
            res$1463.push(el$1462);
            return res$1463;
        }
        return arr$1461;
    }
    // (Syntax) -> String
    function resolveCtx$1362(originalName$1464, ctx$1465, stop_spine$1466, stop_branch$1467) {
        if (isMark$1345(ctx$1465)) {
            return resolveCtx$1362(originalName$1464, ctx$1465.context, stop_spine$1466, stop_branch$1467);
        }
        if (isDef$1344(ctx$1465)) {
            if (stop_spine$1466.indexOf(ctx$1465.defctx) !== -1) {
                return resolveCtx$1362(originalName$1464, ctx$1465.context, stop_spine$1466, stop_branch$1467);
            } else {
                return resolveCtx$1362(originalName$1464, renames$1358(ctx$1465.defctx, ctx$1465.context, originalName$1464), stop_spine$1466, unionEl$1360(stop_branch$1467, ctx$1465.defctx));
            }
        }
        if (isRename$1346(ctx$1465)) {
            if (originalName$1464 === ctx$1465.id.token.value) {
                var idName$1468 = resolveCtx$1362(ctx$1465.id.token.value, ctx$1465.id.context, stop_branch$1467, stop_branch$1467);
                var subName$1469 = resolveCtx$1362(originalName$1464, ctx$1465.context, unionEl$1360(stop_spine$1466, ctx$1465.def), stop_branch$1467);
                if (idName$1468 === subName$1469) {
                    var idMarks$1470 = marksof$1352(ctx$1465.id.context, originalName$1464 + '$' + ctx$1465.name, originalName$1464);
                    var subMarks$1471 = marksof$1352(ctx$1465.context, originalName$1464 + '$' + ctx$1465.name, originalName$1464);
                    if (arraysEqual$1356(idMarks$1470, subMarks$1471)) {
                        return originalName$1464 + '$' + ctx$1465.name;
                    }
                }
            }
            return resolveCtx$1362(originalName$1464, ctx$1465.context, stop_spine$1466, stop_branch$1467);
        }
        return originalName$1464;
    }
    var nextFresh$1363 = 0;
    // fun () -> Num
    function fresh$1365() {
        return nextFresh$1363++;
    }
    ;
    // wraps the array of syntax objects in the delimiters given by the second argument
    // ([...CSyntax], CSyntax) -> [...CSyntax]
    function wrapDelim$1367(towrap$1472, delimSyntax$1473) {
        parser$1202.assert(delimSyntax$1473.token.type === parser$1202.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken$1347({
            type: parser$1202.Token.Delimiter,
            value: delimSyntax$1473.token.value,
            inner: towrap$1472,
            range: delimSyntax$1473.token.range,
            startLineNumber: delimSyntax$1473.token.startLineNumber,
            lineStart: delimSyntax$1473.token.lineStart
        }, delimSyntax$1473);
    }
    // (CSyntax) -> [...CSyntax]
    function getParamIdentifiers$1369(argSyntax$1474) {
        parser$1202.assert(argSyntax$1474.token.type === parser$1202.Token.Delimiter, 'expecting delimiter for function params');
        return _$1201.filter(argSyntax$1474.token.inner, function (stx$1476) {
            return stx$1476.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$1370 = {
            destruct: function () {
                return _$1201.reduce(this.properties, _$1201.bind(function (acc$1480, prop$1481) {
                    if (this[prop$1481] && this[prop$1481].hasPrototype(TermTree$1370)) {
                        return acc$1480.concat(this[prop$1481].destruct());
                    } else if (this[prop$1481] && this[prop$1481].token && this[prop$1481].token.inner) {
                        this[prop$1481].token.inner = _$1201.reduce(this[prop$1481].token.inner, function (acc$1483, t$1484) {
                            if (t$1484.hasPrototype(TermTree$1370)) {
                                return acc$1483.concat(t$1484.destruct());
                            }
                            return acc$1483.concat(t$1484);
                        }, []);
                        return acc$1480.concat(this[prop$1481]);
                    } else if (this[prop$1481]) {
                        return acc$1480.concat(this[prop$1481]);
                    } else {
                        return acc$1480;
                    }
                }, this), []);
            },
            addDefCtx: function (def$1485) {
                for (var i$1486 = 0; i$1486 < this.properties.length; i$1486++) {
                    var prop$1487 = this.properties[i$1486];
                    if (Array.isArray(this[prop$1487])) {
                        this[prop$1487] = _$1201.map(this[prop$1487], function (item$1489) {
                            return item$1489.addDefCtx(def$1485);
                        });
                    } else if (this[prop$1487]) {
                        this[prop$1487] = this[prop$1487].addDefCtx(def$1485);
                    }
                }
                return this;
            }
        };
    var EOF$1371 = TermTree$1370.extend({
            properties: ['eof'],
            construct: function (e$1491) {
                this.eof = e$1491;
            }
        });
    var Statement$1372 = TermTree$1370.extend({
            construct: function () {
            }
        });
    var Expr$1373 = TermTree$1370.extend({
            construct: function () {
            }
        });
    var PrimaryExpression$1374 = Expr$1373.extend({
            construct: function () {
            }
        });
    var ThisExpression$1375 = PrimaryExpression$1374.extend({
            properties: ['this'],
            construct: function (that$1496) {
                this.this = that$1496;
            }
        });
    var Lit$1376 = PrimaryExpression$1374.extend({
            properties: ['lit'],
            construct: function (l$1498) {
                this.lit = l$1498;
            }
        });
    exports$1200._test.PropertyAssignment = PropertyAssignment$1377;
    var PropertyAssignment$1377 = TermTree$1370.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$1500, assignment$1501) {
                this.propName = propName$1500;
                this.assignment = assignment$1501;
            }
        });
    var Block$1378 = PrimaryExpression$1374.extend({
            properties: ['body'],
            construct: function (body$1503) {
                this.body = body$1503;
            }
        });
    var ArrayLiteral$1379 = PrimaryExpression$1374.extend({
            properties: ['array'],
            construct: function (ar$1505) {
                this.array = ar$1505;
            }
        });
    var ParenExpression$1380 = PrimaryExpression$1374.extend({
            properties: ['expr'],
            construct: function (expr$1507) {
                this.expr = expr$1507;
            }
        });
    var UnaryOp$1381 = Expr$1373.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$1509, expr$1510) {
                this.op = op$1509;
                this.expr = expr$1510;
            }
        });
    var PostfixOp$1382 = Expr$1373.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$1512, op$1513) {
                this.expr = expr$1512;
                this.op = op$1513;
            }
        });
    var BinOp$1383 = Expr$1373.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$1515, left$1516, right$1517) {
                this.op = op$1515;
                this.left = left$1516;
                this.right = right$1517;
            }
        });
    var ConditionalExpression$1384 = Expr$1373.extend({
            properties: [
                'cond',
                'question',
                'tru',
                'colon',
                'fls'
            ],
            construct: function (cond$1519, question$1520, tru$1521, colon$1522, fls$1523) {
                this.cond = cond$1519;
                this.question = question$1520;
                this.tru = tru$1521;
                this.colon = colon$1522;
                this.fls = fls$1523;
            }
        });
    var Keyword$1385 = TermTree$1370.extend({
            properties: ['keyword'],
            construct: function (k$1525) {
                this.keyword = k$1525;
            }
        });
    var Punc$1386 = TermTree$1370.extend({
            properties: ['punc'],
            construct: function (p$1527) {
                this.punc = p$1527;
            }
        });
    var Delimiter$1387 = TermTree$1370.extend({
            properties: ['delim'],
            construct: function (d$1529) {
                this.delim = d$1529;
            }
        });
    var Id$1388 = PrimaryExpression$1374.extend({
            properties: ['id'],
            construct: function (id$1531) {
                this.id = id$1531;
            }
        });
    var NamedFun$1389 = Expr$1373.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$1533, name$1534, params$1535, body$1536) {
                this.keyword = keyword$1533;
                this.name = name$1534;
                this.params = params$1535;
                this.body = body$1536;
            }
        });
    var AnonFun$1390 = Expr$1373.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$1538, params$1539, body$1540) {
                this.keyword = keyword$1538;
                this.params = params$1539;
                this.body = body$1540;
            }
        });
    var LetMacro$1391 = TermTree$1370.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1542, body$1543) {
                this.name = name$1542;
                this.body = body$1543;
            }
        });
    var Macro$1392 = TermTree$1370.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1545, body$1546) {
                this.name = name$1545;
                this.body = body$1546;
            }
        });
    var AnonMacro$1393 = TermTree$1370.extend({
            properties: ['body'],
            construct: function (body$1548) {
                this.body = body$1548;
            }
        });
    var Const$1394 = Expr$1373.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$1550, call$1551) {
                this.newterm = newterm$1550;
                this.call = call$1551;
            }
        });
    var Call$1395 = Expr$1373.extend({
            properties: [
                'fun',
                'args',
                'delim',
                'commas'
            ],
            destruct: function () {
                parser$1202.assert(this.fun.hasPrototype(TermTree$1370), 'expecting a term tree in destruct of call');
                var that$1554 = this;
                this.delim = syntaxFromToken$1347(_$1201.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$1201.reduce(this.args, function (acc$1556, term$1557) {
                    parser$1202.assert(term$1557 && term$1557.hasPrototype(TermTree$1370), 'expecting term trees in destruct of Call');
                    var dst$1558 = acc$1556.concat(term$1557.destruct());
                    // add all commas except for the last one
                    if (that$1554.commas.length > 0) {
                        dst$1558 = dst$1558.concat(that$1554.commas.shift());
                    }
                    return dst$1558;
                }, []);
                return this.fun.destruct().concat(Delimiter$1387.create(this.delim).destruct());
            },
            construct: function (funn$1559, args$1560, delim$1561, commas$1562) {
                parser$1202.assert(Array.isArray(args$1560), 'requires an array of arguments terms');
                this.fun = funn$1559;
                this.args = args$1560;
                this.delim = delim$1561;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$1562;
            }
        });
    var ObjDotGet$1396 = Expr$1373.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$1564, dot$1565, right$1566) {
                this.left = left$1564;
                this.dot = dot$1565;
                this.right = right$1566;
            }
        });
    var ObjGet$1397 = Expr$1373.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$1568, right$1569) {
                this.left = left$1568;
                this.right = right$1569;
            }
        });
    var VariableDeclaration$1398 = TermTree$1370.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$1571, eqstx$1572, init$1573, comma$1574) {
                this.ident = ident$1571;
                this.eqstx = eqstx$1572;
                this.init = init$1573;
                this.comma = comma$1574;
            }
        });
    var VariableStatement$1399 = Statement$1372.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$1201.reduce(this.decls, function (acc$1578, decl$1579) {
                    return acc$1578.concat(decl$1579.destruct());
                }, []));
            },
            construct: function (varkw$1580, decls$1581) {
                parser$1202.assert(Array.isArray(decls$1581), 'decls must be an array');
                this.varkw = varkw$1580;
                this.decls = decls$1581;
            }
        });
    var CatchClause$1400 = TermTree$1370.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$1583, params$1584, body$1585) {
                this.catchkw = catchkw$1583;
                this.params = params$1584;
                this.body = body$1585;
            }
        });
    var Module$1401 = TermTree$1370.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$1587) {
                this.body = body$1587;
                this.exports = [];
            }
        });
    var Empty$1402 = TermTree$1370.extend({
            properties: [],
            construct: function () {
            }
        });
    var Export$1403 = TermTree$1370.extend({
            properties: ['name'],
            construct: function (name$1590) {
                this.name = name$1590;
            }
        });
    function stxIsUnaryOp$1405(stx$1591) {
        var staticOperators$1592 = [
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
        return _$1201.contains(staticOperators$1592, stx$1591.token.value);
    }
    function stxIsBinOp$1407(stx$1593) {
        var staticOperators$1594 = [
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
        return _$1201.contains(staticOperators$1594, stx$1593.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$1409(stx$1595, context$1596) {
        var decls$1597 = [];
        var res$1598 = enforest$1413(stx$1595, context$1596);
        var result$1599 = res$1598.result;
        var rest$1600 = res$1598.rest;
        if (rest$1600[0]) {
            var nextRes$1601 = enforest$1413(rest$1600, context$1596);
            // x = ...
            if (nextRes$1601.result.hasPrototype(Punc$1386) && nextRes$1601.result.punc.token.value === '=') {
                var initializerRes$1602 = enforest$1413(nextRes$1601.rest, context$1596);
                if (initializerRes$1602.rest[0]) {
                    var restRes$1603 = enforest$1413(initializerRes$1602.rest, context$1596);
                    // x = y + z, ...
                    if (restRes$1603.result.hasPrototype(Punc$1386) && restRes$1603.result.punc.token.value === ',') {
                        decls$1597.push(VariableDeclaration$1398.create(result$1599.id, nextRes$1601.result.punc, initializerRes$1602.result, restRes$1603.result.punc));
                        var subRes$1604 = enforestVarStatement$1409(restRes$1603.rest, context$1596);
                        decls$1597 = decls$1597.concat(subRes$1604.result);
                        rest$1600 = subRes$1604.rest;
                    }    // x = y ...
                    else {
                        decls$1597.push(VariableDeclaration$1398.create(result$1599.id, nextRes$1601.result.punc, initializerRes$1602.result));
                        rest$1600 = initializerRes$1602.rest;
                    }
                }    // x = y EOF
                else {
                    decls$1597.push(VariableDeclaration$1398.create(result$1599.id, nextRes$1601.result.punc, initializerRes$1602.result));
                }
            }    // x ,...;
            else if (nextRes$1601.result.hasPrototype(Punc$1386) && nextRes$1601.result.punc.token.value === ',') {
                decls$1597.push(VariableDeclaration$1398.create(result$1599.id, null, null, nextRes$1601.result.punc));
                var subRes$1604 = enforestVarStatement$1409(nextRes$1601.rest, context$1596);
                decls$1597 = decls$1597.concat(subRes$1604.result);
                rest$1600 = subRes$1604.rest;
            } else {
                if (result$1599.hasPrototype(Id$1388)) {
                    decls$1597.push(VariableDeclaration$1398.create(result$1599.id));
                } else {
                    throwError$1338('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$1599.hasPrototype(Id$1388)) {
                decls$1597.push(VariableDeclaration$1398.create(result$1599.id));
            } else if (result$1599.hasPrototype(BinOp$1383) && result$1599.op.token.value === 'in') {
                decls$1597.push(VariableDeclaration$1398.create(result$1599.left.id, result$1599.op, result$1599.right));
            } else {
                throwError$1338('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$1597,
            rest: rest$1600
        };
    }
    function adjustLineContext$1411(stx$1605, original$1606) {
        var last$1607 = stx$1605[0] && typeof stx$1605[0].token.range == 'undefined' ? original$1606 : stx$1605[0];
        return _$1201.map(stx$1605, function (stx$1609) {
            if (typeof stx$1609.token.range == 'undefined') {
                stx$1609.token.range = last$1607.token.range;
            }
            if (stx$1609.token.type === parser$1202.Token.Delimiter) {
                stx$1609.token.sm_startLineNumber = original$1606.token.lineNumber;
                stx$1609.token.sm_endLineNumber = original$1606.token.lineNumber;
                stx$1609.token.sm_startLineStart = original$1606.token.lineStart;
                stx$1609.token.sm_endLineStart = original$1606.token.lineStart;
                if (stx$1609.token.inner.length > 0) {
                    stx$1609.token.inner = adjustLineContext$1411(stx$1609.token.inner, original$1606);
                }
                last$1607 = stx$1609;
                return stx$1609;
            }
            stx$1609.token.sm_lineNumber = original$1606.token.lineNumber;
            stx$1609.token.sm_lineStart = original$1606.token.lineStart;
            last$1607 = stx$1609;
            return stx$1609;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$1413(toks$1610, context$1611) {
        parser$1202.assert(toks$1610.length > 0, 'enforest assumes there are tokens to work with');
        function step$1613(head$1614, rest$1615) {
            var innerTokens$1616;
            parser$1202.assert(Array.isArray(rest$1615), 'result must at least be an empty array');
            if (head$1614.hasPrototype(TermTree$1370)) {
                // function call
                var emp$1619 = head$1614.emp;
                var emp$1619 = head$1614.emp;
                var keyword$1622 = head$1614.keyword;
                var delim$1624 = head$1614.delim;
                var emp$1619 = head$1614.emp;
                var punc$1627 = head$1614.punc;
                var keyword$1622 = head$1614.keyword;
                var emp$1619 = head$1614.emp;
                var emp$1619 = head$1614.emp;
                var emp$1619 = head$1614.emp;
                var delim$1624 = head$1614.delim;
                var delim$1624 = head$1614.delim;
                var keyword$1622 = head$1614.keyword;
                var keyword$1622 = head$1614.keyword;
                if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Delimiter && rest$1615[0].token.value === '()')) {
                    var argRes$1652, enforestedArgs$1653 = [], commas$1654 = [];
                    rest$1615[0].expose();
                    innerTokens$1616 = rest$1615[0].token.inner;
                    while (innerTokens$1616.length > 0) {
                        argRes$1652 = enforest$1413(innerTokens$1616, context$1611);
                        enforestedArgs$1653.push(argRes$1652.result);
                        innerTokens$1616 = argRes$1652.rest;
                        if (innerTokens$1616[0] && innerTokens$1616[0].token.value === ',') {
                            // record the comma for later
                            commas$1654.push(innerTokens$1616[0]);
                            // but dump it for the next loop turn
                            innerTokens$1616 = innerTokens$1616.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$1656 = _$1201.all(enforestedArgs$1653, function (argTerm$1657) {
                            return argTerm$1657.hasPrototype(Expr$1373);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$1616.length === 0 && argsAreExprs$1656) {
                        return step$1613(Call$1395.create(head$1614, enforestedArgs$1653, rest$1615[0], commas$1654), rest$1615.slice(1));
                    }
                } else if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && rest$1615[0].token.value === '?')) {
                    var question$1658 = rest$1615[0];
                    var condRes$1659 = enforest$1413(rest$1615.slice(1), context$1611);
                    var truExpr$1660 = condRes$1659.result;
                    var right$1661 = condRes$1659.rest;
                    if (truExpr$1660.hasPrototype(Expr$1373) && right$1661[0] && right$1661[0].token.value === ':') {
                        var colon$1662 = right$1661[0];
                        var flsRes$1663 = enforest$1413(right$1661.slice(1), context$1611);
                        var flsExpr$1664 = flsRes$1663.result;
                        if (flsExpr$1664.hasPrototype(Expr$1373)) {
                            return step$1613(ConditionalExpression$1384.create(head$1614, question$1658, truExpr$1660, colon$1662, flsExpr$1664), flsRes$1663.rest);
                        }
                    }
                } else if (head$1614.hasPrototype(Keyword$1385) && (keyword$1622.token.value === 'new' && rest$1615[0])) {
                    var newCallRes$1665 = enforest$1413(rest$1615, context$1611);
                    if (newCallRes$1665.result.hasPrototype(Call$1395)) {
                        return step$1613(Const$1394.create(head$1614, newCallRes$1665.result), newCallRes$1665.rest);
                    }
                } else if (head$1614.hasPrototype(Delimiter$1387) && delim$1624.token.value === '()') {
                    innerTokens$1616 = delim$1624.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$1616.length === 0) {
                        return step$1613(ParenExpression$1380.create(head$1614), rest$1615);
                    } else {
                        var innerTerm$1666 = get_expression$1415(innerTokens$1616, context$1611);
                        if (innerTerm$1666.result && innerTerm$1666.result.hasPrototype(Expr$1373)) {
                            return step$1613(ParenExpression$1380.create(head$1614), rest$1615);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && rest$1615[1] && stxIsBinOp$1407(rest$1615[0]))) {
                    var op$1667 = rest$1615[0];
                    var left$1668 = head$1614;
                    var bopRes$1669 = enforest$1413(rest$1615.slice(1), context$1611);
                    var right$1661 = bopRes$1669.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$1661.hasPrototype(Expr$1373)) {
                        return step$1613(BinOp$1383.create(op$1667, left$1668, right$1661), bopRes$1669.rest);
                    }
                } else if (head$1614.hasPrototype(Punc$1386) && stxIsUnaryOp$1405(punc$1627)) {
                    var unopRes$1670 = enforest$1413(rest$1615, context$1611);
                    if (unopRes$1670.result.hasPrototype(Expr$1373)) {
                        return step$1613(UnaryOp$1381.create(punc$1627, unopRes$1670.result), unopRes$1670.rest);
                    }
                } else if (head$1614.hasPrototype(Keyword$1385) && stxIsUnaryOp$1405(keyword$1622)) {
                    var unopRes$1670 = enforest$1413(rest$1615, context$1611);
                    if (unopRes$1670.result.hasPrototype(Expr$1373)) {
                        return step$1613(UnaryOp$1381.create(keyword$1622, unopRes$1670.result), unopRes$1670.rest);
                    }
                } else if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && (rest$1615[0].token.value === '++' || rest$1615[0].token.value === '--'))) {
                    return step$1613(PostfixOp$1382.create(head$1614, rest$1615[0]), rest$1615.slice(1));
                } else if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && rest$1615[0].token.value === '[]')) {
                    return step$1613(ObjGet$1397.create(head$1614, Delimiter$1387.create(rest$1615[0].expose())), rest$1615.slice(1));
                } else if (head$1614.hasPrototype(Expr$1373) && (rest$1615[0] && rest$1615[0].token.value === '.' && rest$1615[1] && rest$1615[1].token.type === parser$1202.Token.Identifier)) {
                    return step$1613(ObjDotGet$1396.create(head$1614, rest$1615[0], rest$1615[1]), rest$1615.slice(2));
                } else if (head$1614.hasPrototype(Delimiter$1387) && delim$1624.token.value === '[]') {
                    return step$1613(ArrayLiteral$1379.create(head$1614), rest$1615);
                } else if (head$1614.hasPrototype(Delimiter$1387) && head$1614.delim.token.value === '{}') {
                    return step$1613(Block$1378.create(head$1614), rest$1615);
                } else if (head$1614.hasPrototype(Keyword$1385) && (keyword$1622.token.value === 'let' && (rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Identifier || rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Keyword || rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Punctuator) && rest$1615[1] && rest$1615[1].token.value === '=' && rest$1615[2] && rest$1615[2].token.value === 'macro')) {
                    var mac$1671 = enforest$1413(rest$1615.slice(2), context$1611);
                    if (!mac$1671.result.hasPrototype(AnonMacro$1393)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$1671.result);
                    }
                    return step$1613(LetMacro$1391.create(rest$1615[0], mac$1671.result.body), mac$1671.rest);
                } else if (head$1614.hasPrototype(Keyword$1385) && (keyword$1622.token.value === 'var' && rest$1615[0])) {
                    var vsRes$1672 = enforestVarStatement$1409(rest$1615, context$1611);
                    if (vsRes$1672) {
                        return step$1613(VariableStatement$1399.create(head$1614, vsRes$1672.result), vsRes$1672.rest);
                    }
                }
            } else {
                parser$1202.assert(head$1614 && head$1614.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$1614.token.type === parser$1202.Token.Identifier || head$1614.token.type === parser$1202.Token.Keyword || head$1614.token.type === parser$1202.Token.Punctuator) && context$1611.env.has(resolve$1354(head$1614))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$1673 = fresh$1365();
                    var transformerContext$1674 = makeExpanderContext$1429(_$1201.defaults({ mark: newMark$1673 }, context$1611));
                    // pull the macro transformer out the environment
                    var transformer$1675 = context$1611.env.get(resolve$1354(head$1614)).fn;
                    // apply the transformer
                    var rt$1676 = transformer$1675([head$1614].concat(rest$1615), transformerContext$1674);
                    if (!Array.isArray(rt$1676.result)) {
                        throwError$1338('Macro transformer must return a result array, not: ' + rt$1676.result);
                    }
                    if (rt$1676.result.length > 0) {
                        var adjustedResult$1677 = adjustLineContext$1411(rt$1676.result, head$1614);
                        adjustedResult$1677[0].token.leadingComments = head$1614.token.leadingComments;
                        return step$1613(adjustedResult$1677[0], adjustedResult$1677.slice(1).concat(rt$1676.rest));
                    } else {
                        return step$1613(Empty$1402.create(), rt$1676.rest);
                    }
                }    // anon macro definition
                else if (head$1614.token.type === parser$1202.Token.Identifier && head$1614.token.value === 'macro' && rest$1615[0] && rest$1615[0].token.value === '{}') {
                    return step$1613(AnonMacro$1393.create(rest$1615[0].expose().token.inner), rest$1615.slice(1));
                }    // macro definition
                else if (head$1614.token.type === parser$1202.Token.Identifier && head$1614.token.value === 'macro' && rest$1615[0] && (rest$1615[0].token.type === parser$1202.Token.Identifier || rest$1615[0].token.type === parser$1202.Token.Keyword || rest$1615[0].token.type === parser$1202.Token.Punctuator) && rest$1615[1] && rest$1615[1].token.type === parser$1202.Token.Delimiter && rest$1615[1].token.value === '{}') {
                    return step$1613(Macro$1392.create(rest$1615[0], rest$1615[1].expose().token.inner), rest$1615.slice(2));
                }    // module definition
                else if (head$1614.token.value === 'module' && rest$1615[0] && rest$1615[0].token.value === '{}') {
                    return step$1613(Module$1401.create(rest$1615[0]), rest$1615.slice(1));
                }    // function definition
                else if (head$1614.token.type === parser$1202.Token.Keyword && head$1614.token.value === 'function' && rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Identifier && rest$1615[1] && rest$1615[1].token.type === parser$1202.Token.Delimiter && rest$1615[1].token.value === '()' && rest$1615[2] && rest$1615[2].token.type === parser$1202.Token.Delimiter && rest$1615[2].token.value === '{}') {
                    rest$1615[1].token.inner = rest$1615[1].expose().token.inner;
                    rest$1615[2].token.inner = rest$1615[2].expose().token.inner;
                    return step$1613(NamedFun$1389.create(head$1614, rest$1615[0], rest$1615[1], rest$1615[2]), rest$1615.slice(3));
                }    // anonymous function definition
                else if (head$1614.token.type === parser$1202.Token.Keyword && head$1614.token.value === 'function' && rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Delimiter && rest$1615[0].token.value === '()' && rest$1615[1] && rest$1615[1].token.type === parser$1202.Token.Delimiter && rest$1615[1].token.value === '{}') {
                    rest$1615[0].token.inner = rest$1615[0].expose().token.inner;
                    rest$1615[1].token.inner = rest$1615[1].expose().token.inner;
                    return step$1613(AnonFun$1390.create(head$1614, rest$1615[0], rest$1615[1]), rest$1615.slice(2));
                }    // catch statement
                else if (head$1614.token.type === parser$1202.Token.Keyword && head$1614.token.value === 'catch' && rest$1615[0] && rest$1615[0].token.type === parser$1202.Token.Delimiter && rest$1615[0].token.value === '()' && rest$1615[1] && rest$1615[1].token.type === parser$1202.Token.Delimiter && rest$1615[1].token.value === '{}') {
                    rest$1615[0].token.inner = rest$1615[0].expose().token.inner;
                    rest$1615[1].token.inner = rest$1615[1].expose().token.inner;
                    return step$1613(CatchClause$1400.create(head$1614, rest$1615[0], rest$1615[1]), rest$1615.slice(2));
                }    // this expression
                else if (head$1614.token.type === parser$1202.Token.Keyword && head$1614.token.value === 'this') {
                    return step$1613(ThisExpression$1375.create(head$1614), rest$1615);
                }    // literal
                else if (head$1614.token.type === parser$1202.Token.NumericLiteral || head$1614.token.type === parser$1202.Token.StringLiteral || head$1614.token.type === parser$1202.Token.BooleanLiteral || head$1614.token.type === parser$1202.Token.RegexLiteral || head$1614.token.type === parser$1202.Token.NullLiteral) {
                    return step$1613(Lit$1376.create(head$1614), rest$1615);
                }    // export
                else if (head$1614.token.type === parser$1202.Token.Identifier && head$1614.token.value === 'export' && rest$1615[0] && (rest$1615[0].token.type === parser$1202.Token.Identifier || rest$1615[0].token.type === parser$1202.Token.Keyword || rest$1615[0].token.type === parser$1202.Token.Punctuator)) {
                    return step$1613(Export$1403.create(rest$1615[0]), rest$1615.slice(1));
                }    // identifier
                else if (head$1614.token.type === parser$1202.Token.Identifier) {
                    return step$1613(Id$1388.create(head$1614), rest$1615);
                }    // punctuator
                else if (head$1614.token.type === parser$1202.Token.Punctuator) {
                    return step$1613(Punc$1386.create(head$1614), rest$1615);
                } else if (head$1614.token.type === parser$1202.Token.Keyword && head$1614.token.value === 'with') {
                    throwError$1338('with is not supported in sweet.js');
                }    // keyword
                else if (head$1614.token.type === parser$1202.Token.Keyword) {
                    return step$1613(Keyword$1385.create(head$1614), rest$1615);
                }    // Delimiter
                else if (head$1614.token.type === parser$1202.Token.Delimiter) {
                    return step$1613(Delimiter$1387.create(head$1614.expose()), rest$1615);
                }    // end of file
                else if (head$1614.token.type === parser$1202.Token.EOF) {
                    parser$1202.assert(rest$1615.length === 0, 'nothing should be after an EOF');
                    return step$1613(EOF$1371.create(head$1614), []);
                } else {
                    // todo: are we missing cases?
                    parser$1202.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$1614,
                rest: rest$1615
            };
        }
        return step$1613(toks$1610[0], toks$1610.slice(1));
    }
    function get_expression$1415(stx$1678, context$1679) {
        var res$1680 = enforest$1413(stx$1678, context$1679);
        if (!res$1680.result.hasPrototype(Expr$1373)) {
            return {
                result: null,
                rest: stx$1678
            };
        }
        return res$1680;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$1417(newMark$1681, env$1682) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$1684(match$1686) {
            if (match$1686.level === 0) {
                // replace the match property with the marked syntax
                match$1686.match = _$1201.map(match$1686.match, function (stx$1688) {
                    return stx$1688.mark(newMark$1681);
                });
            } else {
                _$1201.each(match$1686.match, function (match$1690) {
                    dfs$1684(match$1690);
                });
            }
        }
        _$1201.keys(env$1682).forEach(function (key$1691) {
            dfs$1684(env$1682[key$1691]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$1419(mac$1692, context$1693) {
        var body$1694 = mac$1692.body;
        // raw function primitive form
        if (!(body$1694[0] && body$1694[0].token.type === parser$1202.Token.Keyword && body$1694[0].token.value === 'function')) {
            throwError$1338('Primitive macro form must contain a function for the macro body');
        }
        var stub$1695 = parser$1202.read('()');
        stub$1695[0].token.inner = body$1694;
        var expanded$1696 = expand$1427(stub$1695, context$1693);
        expanded$1696 = expanded$1696[0].destruct().concat(expanded$1696[1].eof);
        var flattend$1697 = flatten$1433(expanded$1696);
        var bodyCode$1698 = codegen$1208.generate(parser$1202.parse(flattend$1697));
        var macroFn$1699 = scopedEval$1339(bodyCode$1698, {
                makeValue: syn$1203.makeValue,
                makeRegex: syn$1203.makeRegex,
                makeIdent: syn$1203.makeIdent,
                makeKeyword: syn$1203.makeKeyword,
                makePunc: syn$1203.makePunc,
                makeDelim: syn$1203.makeDelim,
                unwrapSyntax: syn$1203.unwrapSyntax,
                throwSyntaxError: syn$1203.throwSyntaxError,
                parser: parser$1202,
                patternModule: patternModule$1206,
                getTemplate: function (id$1702) {
                    return context$1693.templateMap.get(id$1702);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$1417,
                mergeMatches: function (newMatch$1703, oldMatch$1704) {
                    newMatch$1703.patternEnv = _$1201.extend({}, oldMatch$1704.patternEnv, newMatch$1703.patternEnv);
                    return newMatch$1703;
                }
            });
        return macroFn$1699;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$1421(stx$1705, context$1706) {
        parser$1202.assert(context$1706, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$1705.length === 0) {
            return {
                terms: [],
                context: context$1706
            };
        }
        parser$1202.assert(stx$1705[0].token, 'expecting a syntax object');
        var f$1707 = enforest$1413(stx$1705, context$1706);
        // head :: TermTree
        var head$1708 = f$1707.result;
        // rest :: [Syntax]
        var rest$1709 = f$1707.rest;
        if (head$1708.hasPrototype(Macro$1392)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1711 = loadMacroDef$1419(head$1708, context$1706);
            addToDefinitionCtx$1423([head$1708.name], context$1706.defscope, false);
            context$1706.env.set(resolve$1354(head$1708.name), { fn: macroDefinition$1711 });
            return expandToTermTree$1421(rest$1709, context$1706);
        }
        if (head$1708.hasPrototype(LetMacro$1391)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1711 = loadMacroDef$1419(head$1708, context$1706);
            var freshName$1712 = fresh$1365();
            var renamedName$1713 = head$1708.name.rename(head$1708.name, freshName$1712);
            rest$1709 = _$1201.map(rest$1709, function (stx$1715) {
                return stx$1715.rename(head$1708.name, freshName$1712);
            });
            head$1708.name = renamedName$1713;
            context$1706.env.set(resolve$1354(head$1708.name), { fn: macroDefinition$1711 });
            return expandToTermTree$1421(rest$1709, context$1706);
        }
        if (head$1708.hasPrototype(NamedFun$1389)) {
            addToDefinitionCtx$1423([head$1708.name], context$1706.defscope, true);
        }
        if (head$1708.hasPrototype(Id$1388) && head$1708.id.token.value === '#quoteSyntax' && rest$1709[0] && rest$1709[0].token.value === '{}') {
            var tempId$1716 = fresh$1365();
            context$1706.templateMap.set(tempId$1716, rest$1709[0].token.inner);
            return expandToTermTree$1421([
                syn$1203.makeIdent('getTemplate', head$1708.id),
                syn$1203.makeDelim('()', [syn$1203.makeValue(tempId$1716, head$1708.id)], head$1708.id)
            ].concat(rest$1709.slice(1)), context$1706);
        }
        if (head$1708.hasPrototype(VariableStatement$1399)) {
            addToDefinitionCtx$1423(_$1201.map(head$1708.decls, function (decl$1718) {
                return decl$1718.ident;
            }), context$1706.defscope, true);
        }
        if (head$1708.hasPrototype(Block$1378) && head$1708.body.hasPrototype(Delimiter$1387)) {
            head$1708.body.delim.token.inner.forEach(function (term$1720) {
                if (term$1720.hasPrototype(VariableStatement$1399)) {
                    addToDefinitionCtx$1423(_$1201.map(term$1720.decls, function (decl$1722) {
                        return decl$1722.ident;
                    }), context$1706.defscope, true);
                }
            });
        }
        if (head$1708.hasPrototype(Delimiter$1387)) {
            head$1708.delim.token.inner.forEach(function (term$1724) {
                if (term$1724.hasPrototype(VariableStatement$1399)) {
                    addToDefinitionCtx$1423(_$1201.map(term$1724.decls, function (decl$1726) {
                        return decl$1726.ident;
                    }), context$1706.defscope, true);
                }
            });
        }
        var trees$1710 = expandToTermTree$1421(rest$1709, context$1706);
        return {
            terms: [head$1708].concat(trees$1710.terms),
            context: trees$1710.context
        };
    }
    function addToDefinitionCtx$1423(idents$1727, defscope$1728, skipRep$1729) {
        parser$1202.assert(idents$1727 && idents$1727.length > 0, 'expecting some variable identifiers');
        skipRep$1729 = skipRep$1729 || false;
        _$1201.each(idents$1727, function (id$1731) {
            var skip$1732 = false;
            if (skipRep$1729) {
                var declRepeat$1734 = _$1201.find(defscope$1728, function (def$1735) {
                        return def$1735.id.token.value === id$1731.token.value && arraysEqual$1356(marksof$1352(def$1735.id.context), marksof$1352(id$1731.context));
                    });
                skip$1732 = typeof declRepeat$1734 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$1732) {
                var name$1736 = fresh$1365();
                defscope$1728.push({
                    id: id$1731,
                    name: name$1736
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$1425(term$1737, context$1738) {
        parser$1202.assert(context$1738 && context$1738.env, 'environment map is required');
        if (term$1737.hasPrototype(ArrayLiteral$1379)) {
            term$1737.array.delim.token.inner = expand$1427(term$1737.array.delim.expose().token.inner, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(Block$1378)) {
            term$1737.body.delim.token.inner = expand$1427(term$1737.body.delim.expose().token.inner, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(ParenExpression$1380)) {
            term$1737.expr.delim.token.inner = expand$1427(term$1737.expr.delim.expose().token.inner, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(Call$1395)) {
            term$1737.fun = expandTermTreeToFinal$1425(term$1737.fun, context$1738);
            term$1737.args = _$1201.map(term$1737.args, function (arg$1740) {
                return expandTermTreeToFinal$1425(arg$1740, context$1738);
            });
            return term$1737;
        } else if (term$1737.hasPrototype(UnaryOp$1381)) {
            term$1737.expr = expandTermTreeToFinal$1425(term$1737.expr, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(BinOp$1383)) {
            term$1737.left = expandTermTreeToFinal$1425(term$1737.left, context$1738);
            term$1737.right = expandTermTreeToFinal$1425(term$1737.right, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(ObjGet$1397)) {
            term$1737.right.delim.token.inner = expand$1427(term$1737.right.delim.expose().token.inner, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(ObjDotGet$1396)) {
            term$1737.left = expandTermTreeToFinal$1425(term$1737.left, context$1738);
            term$1737.right = expandTermTreeToFinal$1425(term$1737.right, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(VariableDeclaration$1398)) {
            if (term$1737.init) {
                term$1737.init = expandTermTreeToFinal$1425(term$1737.init, context$1738);
            }
            return term$1737;
        } else if (term$1737.hasPrototype(VariableStatement$1399)) {
            term$1737.decls = _$1201.map(term$1737.decls, function (decl$1742) {
                return expandTermTreeToFinal$1425(decl$1742, context$1738);
            });
            return term$1737;
        } else if (term$1737.hasPrototype(Delimiter$1387)) {
            // expand inside the delimiter and then continue on
            term$1737.delim.token.inner = expand$1427(term$1737.delim.expose().token.inner, context$1738);
            return term$1737;
        } else if (term$1737.hasPrototype(NamedFun$1389) || term$1737.hasPrototype(AnonFun$1390) || term$1737.hasPrototype(CatchClause$1400) || term$1737.hasPrototype(Module$1401)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$1743 = [];
            var bodyContext$1744 = makeExpanderContext$1429(_$1201.defaults({ defscope: newDef$1743 }, context$1738));
            if (term$1737.params) {
                var params$1757 = term$1737.params.expose();
            } else {
                var params$1757 = syn$1203.makeDelim('()', [], null);
            }
            var bodies$1745 = term$1737.body.addDefCtx(newDef$1743);
            var paramNames$1747 = _$1201.map(getParamIdentifiers$1369(params$1757), function (param$1758) {
                    var freshName$1759 = fresh$1365();
                    return {
                        freshName: freshName$1759,
                        originalParam: param$1758,
                        renamedParam: param$1758.rename(param$1758, freshName$1759)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$1749 = _$1201.reduce(paramNames$1747, function (accBody$1760, p$1761) {
                    return accBody$1760.rename(p$1761.originalParam, p$1761.freshName);
                }, bodies$1745);
            renamedBody$1749 = renamedBody$1749.expose();
            var expandedResult$1750 = expandToTermTree$1421(renamedBody$1749.token.inner, bodyContext$1744);
            var bodyTerms$1751 = expandedResult$1750.terms;
            var renamedParams$1753 = _$1201.map(paramNames$1747, function (p$1762) {
                    return p$1762.renamedParam;
                });
            var flatArgs$1754 = syn$1203.makeDelim('()', joinSyntax$1348(renamedParams$1753, ','), term$1737.params);
            var expandedArgs$1755 = expand$1427([flatArgs$1754], bodyContext$1744);
            parser$1202.assert(expandedArgs$1755.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$1737.params) {
                term$1737.params = expandedArgs$1755[0];
            }
            bodyTerms$1751 = _$1201.map(bodyTerms$1751, function (bodyTerm$1763) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$1764 = bodyTerm$1763.addDefCtx(newDef$1743);
                // finish expansion
                return expandTermTreeToFinal$1425(termWithCtx$1764, expandedResult$1750.context);
            });
            if (term$1737.hasPrototype(Module$1401)) {
                bodyTerms$1751 = _$1201.filter(bodyTerms$1751, function (bodyTerm$1766) {
                    if (bodyTerm$1766.hasPrototype(Export$1403)) {
                        term$1737.exports.push(bodyTerm$1766);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$1749.token.inner = bodyTerms$1751;
            term$1737.body = renamedBody$1749;
            // and continue expand the rest
            return term$1737;
        }
        // the term is fine as is
        return term$1737;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$1427(stx$1767, context$1768) {
        parser$1202.assert(context$1768, 'must provide an expander context');
        var trees$1769 = expandToTermTree$1421(stx$1767, context$1768);
        return _$1201.map(trees$1769.terms, function (term$1771) {
            return expandTermTreeToFinal$1425(term$1771, trees$1769.context);
        });
    }
    function makeExpanderContext$1429(o$1772) {
        o$1772 = o$1772 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$1772.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$1772.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$1772.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$1772.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$1431(stx$1773, builtinSource$1774) {
        var builtInEnv$1775 = new Map();
        var env$1776 = new Map();
        var params$1777 = [];
        var context$1778, builtInContext$1779 = makeExpanderContext$1429({ env: builtInEnv$1775 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$1774) {
            var builtinRead$1783 = parser$1202.read(builtinSource$1774);
            builtinRead$1783 = [
                syn$1203.makeIdent('module', null),
                syn$1203.makeDelim('{}', builtinRead$1783, null)
            ];
            var builtinRes$1784 = expand$1427(builtinRead$1783, builtInContext$1779);
            params$1777 = _$1201.map(builtinRes$1784[0].exports, function (term$1786) {
                return {
                    oldExport: term$1786.name,
                    newParam: syn$1203.makeIdent(term$1786.name.token.value, null)
                };
            });
        }
        var modBody$1780 = syn$1203.makeDelim('{}', stx$1773, null);
        modBody$1780 = _$1201.reduce(params$1777, function (acc$1787, param$1788) {
            var newName$1789 = fresh$1365();
            env$1776.set(resolve$1354(param$1788.newParam.rename(param$1788.newParam, newName$1789)), builtInEnv$1775.get(resolve$1354(param$1788.oldExport)));
            return acc$1787.rename(param$1788.newParam, newName$1789);
        }, modBody$1780);
        context$1778 = makeExpanderContext$1429({ env: env$1776 });
        var res$1782 = expand$1427([
                syn$1203.makeIdent('module', null),
                modBody$1780
            ], context$1778);
        res$1782 = res$1782[0].destruct();
        return flatten$1433(res$1782[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$1433(stx$1790) {
        return _$1201.reduce(stx$1790, function (acc$1792, stx$1793) {
            if (stx$1793.token.type === parser$1202.Token.Delimiter) {
                var exposed$1794 = stx$1793.expose();
                var openParen$1795 = syntaxFromToken$1347({
                        type: parser$1202.Token.Punctuator,
                        value: stx$1793.token.value[0],
                        range: stx$1793.token.startRange,
                        lineNumber: stx$1793.token.startLineNumber,
                        sm_lineNumber: stx$1793.token.sm_startLineNumber ? stx$1793.token.sm_startLineNumber : stx$1793.token.startLineNumber,
                        lineStart: stx$1793.token.startLineStart,
                        sm_lineStart: stx$1793.token.sm_startLineStart ? stx$1793.token.sm_startLineStart : stx$1793.token.startLineStart
                    }, exposed$1794);
                var closeParen$1796 = syntaxFromToken$1347({
                        type: parser$1202.Token.Punctuator,
                        value: stx$1793.token.value[1],
                        range: stx$1793.token.endRange,
                        lineNumber: stx$1793.token.endLineNumber,
                        sm_lineNumber: stx$1793.token.sm_endLineNumber ? stx$1793.token.sm_endLineNumber : stx$1793.token.endLineNumber,
                        lineStart: stx$1793.token.endLineStart,
                        sm_lineStart: stx$1793.token.sm_endLineStart ? stx$1793.token.sm_endLineStart : stx$1793.token.endLineStart
                    }, exposed$1794);
                if (stx$1793.token.leadingComments) {
                    openParen$1795.token.leadingComments = stx$1793.token.leadingComments;
                }
                if (stx$1793.token.trailingComments) {
                    openParen$1795.token.trailingComments = stx$1793.token.trailingComments;
                }
                return acc$1792.concat(openParen$1795).concat(flatten$1433(exposed$1794.token.inner)).concat(closeParen$1796);
            }
            stx$1793.token.sm_lineNumber = stx$1793.token.sm_lineNumber ? stx$1793.token.sm_lineNumber : stx$1793.token.lineNumber;
            stx$1793.token.sm_lineStart = stx$1793.token.sm_lineStart ? stx$1793.token.sm_lineStart : stx$1793.token.lineStart;
            return acc$1792.concat(stx$1793);
        }, []);
    }
    exports$1200.enforest = enforest$1413;
    exports$1200.expand = expandTopLevel$1431;
    exports$1200.resolve = resolve$1354;
    exports$1200.get_expression = get_expression$1415;
    exports$1200.makeExpanderContext = makeExpanderContext$1429;
    exports$1200.Expr = Expr$1373;
    exports$1200.VariableStatement = VariableStatement$1399;
    exports$1200.tokensToSyntax = syn$1203.tokensToSyntax;
    exports$1200.syntaxToTokens = syn$1203.syntaxToTokens;
}));