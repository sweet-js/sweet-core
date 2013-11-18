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
        return _$1201.filter(argSyntax$1474.token.inner, function (stx$1478) {
            return stx$1478.token.value !== ',';
        });
    }
    // A TermTree is the core data structure for the macro expansion process.
    // It acts as a semi-structured representation of the syntax.
    var TermTree$1370 = {
            destruct: function () {
                return _$1201.reduce(this.properties, _$1201.bind(function (acc$1482, prop$1483) {
                    if (this[prop$1483] && this[prop$1483].hasPrototype(TermTree$1370)) {
                        return acc$1482.concat(this[prop$1483].destruct());
                    } else if (this[prop$1483] && this[prop$1483].token && this[prop$1483].token.inner) {
                        this[prop$1483].token.inner = _$1201.reduce(this[prop$1483].token.inner, function (acc$1485, t$1486) {
                            if (t$1486.hasPrototype(TermTree$1370)) {
                                return acc$1485.concat(t$1486.destruct());
                            }
                            return acc$1485.concat(t$1486);
                        }, []);
                        return acc$1482.concat(this[prop$1483]);
                    } else if (this[prop$1483]) {
                        return acc$1482.concat(this[prop$1483]);
                    } else {
                        return acc$1482;
                    }
                }, this), []);
            },
            addDefCtx: function (def$1487) {
                for (var i$1488 = 0; i$1488 < this.properties.length; i$1488++) {
                    var prop$1489 = this.properties[i$1488];
                    if (Array.isArray(this[prop$1489])) {
                        this[prop$1489] = _$1201.map(this[prop$1489], function (item$1491) {
                            return item$1491.addDefCtx(def$1487);
                        });
                    } else if (this[prop$1489]) {
                        this[prop$1489] = this[prop$1489].addDefCtx(def$1487);
                    }
                }
                return this;
            }
        };
    var EOF$1371 = TermTree$1370.extend({
            properties: ['eof'],
            construct: function (e$1493) {
                this.eof = e$1493;
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
            construct: function (that$1498) {
                this.this = that$1498;
            }
        });
    var Lit$1376 = PrimaryExpression$1374.extend({
            properties: ['lit'],
            construct: function (l$1500) {
                this.lit = l$1500;
            }
        });
    exports$1200._test.PropertyAssignment = PropertyAssignment$1377;
    var PropertyAssignment$1377 = TermTree$1370.extend({
            properties: [
                'propName',
                'assignment'
            ],
            construct: function (propName$1502, assignment$1503) {
                this.propName = propName$1502;
                this.assignment = assignment$1503;
            }
        });
    var Block$1378 = PrimaryExpression$1374.extend({
            properties: ['body'],
            construct: function (body$1505) {
                this.body = body$1505;
            }
        });
    var ArrayLiteral$1379 = PrimaryExpression$1374.extend({
            properties: ['array'],
            construct: function (ar$1507) {
                this.array = ar$1507;
            }
        });
    var ParenExpression$1380 = PrimaryExpression$1374.extend({
            properties: ['expr'],
            construct: function (expr$1509) {
                this.expr = expr$1509;
            }
        });
    var UnaryOp$1381 = Expr$1373.extend({
            properties: [
                'op',
                'expr'
            ],
            construct: function (op$1511, expr$1512) {
                this.op = op$1511;
                this.expr = expr$1512;
            }
        });
    var PostfixOp$1382 = Expr$1373.extend({
            properties: [
                'expr',
                'op'
            ],
            construct: function (expr$1514, op$1515) {
                this.expr = expr$1514;
                this.op = op$1515;
            }
        });
    var BinOp$1383 = Expr$1373.extend({
            properties: [
                'left',
                'op',
                'right'
            ],
            construct: function (op$1517, left$1518, right$1519) {
                this.op = op$1517;
                this.left = left$1518;
                this.right = right$1519;
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
            construct: function (cond$1521, question$1522, tru$1523, colon$1524, fls$1525) {
                this.cond = cond$1521;
                this.question = question$1522;
                this.tru = tru$1523;
                this.colon = colon$1524;
                this.fls = fls$1525;
            }
        });
    var Keyword$1385 = TermTree$1370.extend({
            properties: ['keyword'],
            construct: function (k$1527) {
                this.keyword = k$1527;
            }
        });
    var Punc$1386 = TermTree$1370.extend({
            properties: ['punc'],
            construct: function (p$1529) {
                this.punc = p$1529;
            }
        });
    var Delimiter$1387 = TermTree$1370.extend({
            properties: ['delim'],
            construct: function (d$1531) {
                this.delim = d$1531;
            }
        });
    var Id$1388 = PrimaryExpression$1374.extend({
            properties: ['id'],
            construct: function (id$1533) {
                this.id = id$1533;
            }
        });
    var NamedFun$1389 = Expr$1373.extend({
            properties: [
                'keyword',
                'name',
                'params',
                'body'
            ],
            construct: function (keyword$1535, name$1536, params$1537, body$1538) {
                this.keyword = keyword$1535;
                this.name = name$1536;
                this.params = params$1537;
                this.body = body$1538;
            }
        });
    var AnonFun$1390 = Expr$1373.extend({
            properties: [
                'keyword',
                'params',
                'body'
            ],
            construct: function (keyword$1540, params$1541, body$1542) {
                this.keyword = keyword$1540;
                this.params = params$1541;
                this.body = body$1542;
            }
        });
    var LetMacro$1391 = TermTree$1370.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1544, body$1545) {
                this.name = name$1544;
                this.body = body$1545;
            }
        });
    var Macro$1392 = TermTree$1370.extend({
            properties: [
                'name',
                'body'
            ],
            construct: function (name$1547, body$1548) {
                this.name = name$1547;
                this.body = body$1548;
            }
        });
    var AnonMacro$1393 = TermTree$1370.extend({
            properties: ['body'],
            construct: function (body$1550) {
                this.body = body$1550;
            }
        });
    var Const$1394 = Expr$1373.extend({
            properties: [
                'newterm',
                'call'
            ],
            construct: function (newterm$1552, call$1553) {
                this.newterm = newterm$1552;
                this.call = call$1553;
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
                var that$1556 = this;
                this.delim = syntaxFromToken$1347(_$1201.clone(this.delim.token), this.delim);
                this.delim.token.inner = _$1201.reduce(this.args, function (acc$1558, term$1559) {
                    parser$1202.assert(term$1559 && term$1559.hasPrototype(TermTree$1370), 'expecting term trees in destruct of Call');
                    var dst$1560 = acc$1558.concat(term$1559.destruct());
                    // add all commas except for the last one
                    if (that$1556.commas.length > 0) {
                        dst$1560 = dst$1560.concat(that$1556.commas.shift());
                    }
                    return dst$1560;
                }, []);
                return this.fun.destruct().concat(Delimiter$1387.create(this.delim).destruct());
            },
            construct: function (funn$1561, args$1562, delim$1563, commas$1564) {
                parser$1202.assert(Array.isArray(args$1562), 'requires an array of arguments terms');
                this.fun = funn$1561;
                this.args = args$1562;
                this.delim = delim$1563;
                // an ugly little hack to keep the same syntax objects
                // (with associated line numbers etc.) for all the commas
                // separating the arguments
                this.commas = commas$1564;
            }
        });
    var ObjDotGet$1396 = Expr$1373.extend({
            properties: [
                'left',
                'dot',
                'right'
            ],
            construct: function (left$1566, dot$1567, right$1568) {
                this.left = left$1566;
                this.dot = dot$1567;
                this.right = right$1568;
            }
        });
    var ObjGet$1397 = Expr$1373.extend({
            properties: [
                'left',
                'right'
            ],
            construct: function (left$1570, right$1571) {
                this.left = left$1570;
                this.right = right$1571;
            }
        });
    var VariableDeclaration$1398 = TermTree$1370.extend({
            properties: [
                'ident',
                'eqstx',
                'init',
                'comma'
            ],
            construct: function (ident$1573, eqstx$1574, init$1575, comma$1576) {
                this.ident = ident$1573;
                this.eqstx = eqstx$1574;
                this.init = init$1575;
                this.comma = comma$1576;
            }
        });
    var VariableStatement$1399 = Statement$1372.extend({
            properties: [
                'varkw',
                'decls'
            ],
            destruct: function () {
                return this.varkw.destruct().concat(_$1201.reduce(this.decls, function (acc$1580, decl$1581) {
                    return acc$1580.concat(decl$1581.destruct());
                }, []));
            },
            construct: function (varkw$1582, decls$1583) {
                parser$1202.assert(Array.isArray(decls$1583), 'decls must be an array');
                this.varkw = varkw$1582;
                this.decls = decls$1583;
            }
        });
    var CatchClause$1400 = TermTree$1370.extend({
            properties: [
                'catchkw',
                'params',
                'body'
            ],
            construct: function (catchkw$1585, params$1586, body$1587) {
                this.catchkw = catchkw$1585;
                this.params = params$1586;
                this.body = body$1587;
            }
        });
    var Module$1401 = TermTree$1370.extend({
            properties: [
                'body',
                'exports'
            ],
            construct: function (body$1589) {
                this.body = body$1589;
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
            construct: function (name$1592) {
                this.name = name$1592;
            }
        });
    function stxIsUnaryOp$1405(stx$1593) {
        var staticOperators$1594 = [
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
        return _$1201.contains(staticOperators$1594, stx$1593.token.value);
    }
    function stxIsBinOp$1407(stx$1595) {
        var staticOperators$1596 = [
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
        return _$1201.contains(staticOperators$1596, stx$1595.token.value);
    }
    // ([Syntax], Map) -> {result: [VariableDeclaration], rest: [Syntax]}
    // assumes stx starts at the identifier. ie:
    // var x = ...
    //     ^
    function enforestVarStatement$1409(stx$1597, context$1598) {
        var decls$1599 = [];
        var res$1600 = enforest$1413(stx$1597, context$1598);
        var result$1601 = res$1600.result;
        var rest$1602 = res$1600.rest;
        if (rest$1602[0]) {
            var nextRes$1603 = enforest$1413(rest$1602, context$1598);
            // x = ...
            if (nextRes$1603.result.hasPrototype(Punc$1386) && nextRes$1603.result.punc.token.value === '=') {
                var initializerRes$1604 = enforest$1413(nextRes$1603.rest, context$1598);
                if (initializerRes$1604.rest[0]) {
                    var restRes$1605 = enforest$1413(initializerRes$1604.rest, context$1598);
                    // x = y + z, ...
                    if (restRes$1605.result.hasPrototype(Punc$1386) && restRes$1605.result.punc.token.value === ',') {
                        decls$1599.push(VariableDeclaration$1398.create(result$1601.id, nextRes$1603.result.punc, initializerRes$1604.result, restRes$1605.result.punc));
                        var subRes$1606 = enforestVarStatement$1409(restRes$1605.rest, context$1598);
                        decls$1599 = decls$1599.concat(subRes$1606.result);
                        rest$1602 = subRes$1606.rest;
                    }    // x = y ...
                    else {
                        decls$1599.push(VariableDeclaration$1398.create(result$1601.id, nextRes$1603.result.punc, initializerRes$1604.result));
                        rest$1602 = initializerRes$1604.rest;
                    }
                }    // x = y EOF
                else {
                    decls$1599.push(VariableDeclaration$1398.create(result$1601.id, nextRes$1603.result.punc, initializerRes$1604.result));
                }
            }    // x ,...;
            else if (nextRes$1603.result.hasPrototype(Punc$1386) && nextRes$1603.result.punc.token.value === ',') {
                decls$1599.push(VariableDeclaration$1398.create(result$1601.id, null, null, nextRes$1603.result.punc));
                var subRes$1606 = enforestVarStatement$1409(nextRes$1603.rest, context$1598);
                decls$1599 = decls$1599.concat(subRes$1606.result);
                rest$1602 = subRes$1606.rest;
            } else {
                if (result$1601.hasPrototype(Id$1388)) {
                    decls$1599.push(VariableDeclaration$1398.create(result$1601.id));
                } else {
                    throwError$1338('Expecting an identifier in variable declaration');
                }
            }
        }    // x EOF
        else {
            if (result$1601.hasPrototype(Id$1388)) {
                decls$1599.push(VariableDeclaration$1398.create(result$1601.id));
            } else if (result$1601.hasPrototype(BinOp$1383) && result$1601.op.token.value === 'in') {
                decls$1599.push(VariableDeclaration$1398.create(result$1601.left.id, result$1601.op, result$1601.right));
            } else {
                throwError$1338('Expecting an identifier in variable declaration');
            }
        }
        return {
            result: decls$1599,
            rest: rest$1602
        };
    }
    function adjustLineContext$1411(stx$1607, original$1608) {
        var last$1609 = stx$1607[0] && typeof stx$1607[0].token.range == 'undefined' ? original$1608 : stx$1607[0];
        return _$1201.map(stx$1607, function (stx$1611) {
            if (typeof stx$1611.token.range == 'undefined') {
                stx$1611.token.range = last$1609.token.range;
            }
            if (stx$1611.token.type === parser$1202.Token.Delimiter) {
                stx$1611.token.sm_startLineNumber = original$1608.token.lineNumber;
                stx$1611.token.sm_endLineNumber = original$1608.token.lineNumber;
                stx$1611.token.sm_startLineStart = original$1608.token.lineStart;
                stx$1611.token.sm_endLineStart = original$1608.token.lineStart;
                if (stx$1611.token.inner.length > 0) {
                    stx$1611.token.inner = adjustLineContext$1411(stx$1611.token.inner, original$1608);
                }
                last$1609 = stx$1611;
                return stx$1611;
            }
            stx$1611.token.sm_lineNumber = original$1608.token.lineNumber;
            stx$1611.token.sm_lineStart = original$1608.token.lineStart;
            last$1609 = stx$1611;
            return stx$1611;
        });
    }
    // enforest the tokens, returns an object with the `result` TermTree and
    // the uninterpreted `rest` of the syntax
    function enforest$1413(toks$1612, context$1613) {
        parser$1202.assert(toks$1612.length > 0, 'enforest assumes there are tokens to work with');
        function step$1615(head$1616, rest$1617) {
            var innerTokens$1618;
            parser$1202.assert(Array.isArray(rest$1617), 'result must at least be an empty array');
            if (head$1616.hasPrototype(TermTree$1370)) {
                // function call
                var emp$1621 = head$1616.emp;
                var emp$1621 = head$1616.emp;
                var keyword$1624 = head$1616.keyword;
                var delim$1626 = head$1616.delim;
                var emp$1621 = head$1616.emp;
                var punc$1629 = head$1616.punc;
                var keyword$1624 = head$1616.keyword;
                var emp$1621 = head$1616.emp;
                var emp$1621 = head$1616.emp;
                var emp$1621 = head$1616.emp;
                var delim$1626 = head$1616.delim;
                var delim$1626 = head$1616.delim;
                var keyword$1624 = head$1616.keyword;
                var keyword$1624 = head$1616.keyword;
                if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Delimiter && rest$1617[0].token.value === '()')) {
                    var argRes$1654, enforestedArgs$1655 = [], commas$1656 = [];
                    rest$1617[0].expose();
                    innerTokens$1618 = rest$1617[0].token.inner;
                    while (innerTokens$1618.length > 0) {
                        argRes$1654 = enforest$1413(innerTokens$1618, context$1613);
                        enforestedArgs$1655.push(argRes$1654.result);
                        innerTokens$1618 = argRes$1654.rest;
                        if (innerTokens$1618[0] && innerTokens$1618[0].token.value === ',') {
                            // record the comma for later
                            commas$1656.push(innerTokens$1618[0]);
                            // but dump it for the next loop turn
                            innerTokens$1618 = innerTokens$1618.slice(1);
                        } else {
                            // either there are no more tokens or
                            // they aren't a comma, either way we
                            // are done with the loop
                            break;
                        }
                    }
                    var argsAreExprs$1658 = _$1201.all(enforestedArgs$1655, function (argTerm$1659) {
                            return argTerm$1659.hasPrototype(Expr$1373);
                        });
                    // only a call if we can completely enforest each argument and
                    // each argument is an expression
                    if (innerTokens$1618.length === 0 && argsAreExprs$1658) {
                        return step$1615(Call$1395.create(head$1616, enforestedArgs$1655, rest$1617[0], commas$1656), rest$1617.slice(1));
                    }
                } else if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && rest$1617[0].token.value === '?')) {
                    var question$1660 = rest$1617[0];
                    var condRes$1661 = enforest$1413(rest$1617.slice(1), context$1613);
                    var truExpr$1662 = condRes$1661.result;
                    var right$1663 = condRes$1661.rest;
                    if (truExpr$1662.hasPrototype(Expr$1373) && right$1663[0] && right$1663[0].token.value === ':') {
                        var colon$1664 = right$1663[0];
                        var flsRes$1665 = enforest$1413(right$1663.slice(1), context$1613);
                        var flsExpr$1666 = flsRes$1665.result;
                        if (flsExpr$1666.hasPrototype(Expr$1373)) {
                            return step$1615(ConditionalExpression$1384.create(head$1616, question$1660, truExpr$1662, colon$1664, flsExpr$1666), flsRes$1665.rest);
                        }
                    }
                } else if (head$1616.hasPrototype(Keyword$1385) && (keyword$1624.token.value === 'new' && rest$1617[0])) {
                    var newCallRes$1667 = enforest$1413(rest$1617, context$1613);
                    if (newCallRes$1667.result.hasPrototype(Call$1395)) {
                        return step$1615(Const$1394.create(head$1616, newCallRes$1667.result), newCallRes$1667.rest);
                    }
                } else if (head$1616.hasPrototype(Delimiter$1387) && delim$1626.token.value === '()') {
                    innerTokens$1618 = delim$1626.token.inner;
                    // empty parens are acceptable but enforest
                    // doesn't accept empty arrays so short
                    // circuit here
                    if (innerTokens$1618.length === 0) {
                        return step$1615(ParenExpression$1380.create(head$1616), rest$1617);
                    } else {
                        var innerTerm$1668 = get_expression$1415(innerTokens$1618, context$1613);
                        if (innerTerm$1668.result && innerTerm$1668.result.hasPrototype(Expr$1373)) {
                            return step$1615(ParenExpression$1380.create(head$1616), rest$1617);
                        }
                    }    // if the tokens inside the paren aren't an expression
                         // we just leave it as a delimiter
                } else if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && rest$1617[1] && stxIsBinOp$1407(rest$1617[0]))) {
                    var op$1669 = rest$1617[0];
                    var left$1670 = head$1616;
                    var bopRes$1671 = enforest$1413(rest$1617.slice(1), context$1613);
                    var right$1663 = bopRes$1671.result;
                    // only a binop if the right is a real expression
                    // so 2+2++ will only match 2+2
                    if (right$1663.hasPrototype(Expr$1373)) {
                        return step$1615(BinOp$1383.create(op$1669, left$1670, right$1663), bopRes$1671.rest);
                    }
                } else if (head$1616.hasPrototype(Punc$1386) && stxIsUnaryOp$1405(punc$1629)) {
                    var unopRes$1672 = enforest$1413(rest$1617, context$1613);
                    if (unopRes$1672.result.hasPrototype(Expr$1373)) {
                        return step$1615(UnaryOp$1381.create(punc$1629, unopRes$1672.result), unopRes$1672.rest);
                    }
                } else if (head$1616.hasPrototype(Keyword$1385) && stxIsUnaryOp$1405(keyword$1624)) {
                    var unopRes$1672 = enforest$1413(rest$1617, context$1613);
                    if (unopRes$1672.result.hasPrototype(Expr$1373)) {
                        return step$1615(UnaryOp$1381.create(keyword$1624, unopRes$1672.result), unopRes$1672.rest);
                    }
                } else if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && (rest$1617[0].token.value === '++' || rest$1617[0].token.value === '--'))) {
                    return step$1615(PostfixOp$1382.create(head$1616, rest$1617[0]), rest$1617.slice(1));
                } else if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && rest$1617[0].token.value === '[]')) {
                    return step$1615(ObjGet$1397.create(head$1616, Delimiter$1387.create(rest$1617[0].expose())), rest$1617.slice(1));
                } else if (head$1616.hasPrototype(Expr$1373) && (rest$1617[0] && rest$1617[0].token.value === '.' && rest$1617[1] && rest$1617[1].token.type === parser$1202.Token.Identifier)) {
                    return step$1615(ObjDotGet$1396.create(head$1616, rest$1617[0], rest$1617[1]), rest$1617.slice(2));
                } else if (head$1616.hasPrototype(Delimiter$1387) && delim$1626.token.value === '[]') {
                    return step$1615(ArrayLiteral$1379.create(head$1616), rest$1617);
                } else if (head$1616.hasPrototype(Delimiter$1387) && head$1616.delim.token.value === '{}') {
                    return step$1615(Block$1378.create(head$1616), rest$1617);
                } else if (head$1616.hasPrototype(Keyword$1385) && (keyword$1624.token.value === 'let' && (rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Identifier || rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Keyword || rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Punctuator) && rest$1617[1] && rest$1617[1].token.value === '=' && rest$1617[2] && rest$1617[2].token.value === 'macro')) {
                    var mac$1673 = enforest$1413(rest$1617.slice(2), context$1613);
                    if (!mac$1673.result.hasPrototype(AnonMacro$1393)) {
                        throw new Error('expecting an anonymous macro definition in syntax let binding, not: ' + mac$1673.result);
                    }
                    return step$1615(LetMacro$1391.create(rest$1617[0], mac$1673.result.body), mac$1673.rest);
                } else if (head$1616.hasPrototype(Keyword$1385) && (keyword$1624.token.value === 'var' && rest$1617[0])) {
                    var vsRes$1674 = enforestVarStatement$1409(rest$1617, context$1613);
                    if (vsRes$1674) {
                        return step$1615(VariableStatement$1399.create(head$1616, vsRes$1674.result), vsRes$1674.rest);
                    }
                }
            } else {
                parser$1202.assert(head$1616 && head$1616.token, 'assuming head is a syntax object');
                // macro invocation
                if ((head$1616.token.type === parser$1202.Token.Identifier || head$1616.token.type === parser$1202.Token.Keyword || head$1616.token.type === parser$1202.Token.Punctuator) && context$1613.env.has(resolve$1354(head$1616))) {
                    // create a new mark to be used for the input to
                    // the macro
                    var newMark$1675 = fresh$1365();
                    var transformerContext$1676 = makeExpanderContext$1429(_$1201.defaults({ mark: newMark$1675 }, context$1613));
                    // pull the macro transformer out the environment
                    var transformer$1677 = context$1613.env.get(resolve$1354(head$1616)).fn;
                    // apply the transformer
                    var rt$1678 = transformer$1677([head$1616].concat(rest$1617), transformerContext$1676);
                    if (!Array.isArray(rt$1678.result)) {
                        throwError$1338('Macro transformer must return a result array, not: ' + rt$1678.result);
                    }
                    if (rt$1678.result.length > 0) {
                        var adjustedResult$1679 = adjustLineContext$1411(rt$1678.result, head$1616);
                        adjustedResult$1679[0].token.leadingComments = head$1616.token.leadingComments;
                        return step$1615(adjustedResult$1679[0], adjustedResult$1679.slice(1).concat(rt$1678.rest));
                    } else {
                        return step$1615(Empty$1402.create(), rt$1678.rest);
                    }
                }    // anon macro definition
                else if (head$1616.token.type === parser$1202.Token.Identifier && head$1616.token.value === 'macro' && rest$1617[0] && rest$1617[0].token.value === '{}') {
                    return step$1615(AnonMacro$1393.create(rest$1617[0].expose().token.inner), rest$1617.slice(1));
                }    // macro definition
                else if (head$1616.token.type === parser$1202.Token.Identifier && head$1616.token.value === 'macro' && rest$1617[0] && (rest$1617[0].token.type === parser$1202.Token.Identifier || rest$1617[0].token.type === parser$1202.Token.Keyword || rest$1617[0].token.type === parser$1202.Token.Punctuator) && rest$1617[1] && rest$1617[1].token.type === parser$1202.Token.Delimiter && rest$1617[1].token.value === '{}') {
                    return step$1615(Macro$1392.create(rest$1617[0], rest$1617[1].expose().token.inner), rest$1617.slice(2));
                }    // module definition
                else if (head$1616.token.value === 'module' && rest$1617[0] && rest$1617[0].token.value === '{}') {
                    return step$1615(Module$1401.create(rest$1617[0]), rest$1617.slice(1));
                }    // function definition
                else if (head$1616.token.type === parser$1202.Token.Keyword && head$1616.token.value === 'function' && rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Identifier && rest$1617[1] && rest$1617[1].token.type === parser$1202.Token.Delimiter && rest$1617[1].token.value === '()' && rest$1617[2] && rest$1617[2].token.type === parser$1202.Token.Delimiter && rest$1617[2].token.value === '{}') {
                    rest$1617[1].token.inner = rest$1617[1].expose().token.inner;
                    rest$1617[2].token.inner = rest$1617[2].expose().token.inner;
                    return step$1615(NamedFun$1389.create(head$1616, rest$1617[0], rest$1617[1], rest$1617[2]), rest$1617.slice(3));
                }    // anonymous function definition
                else if (head$1616.token.type === parser$1202.Token.Keyword && head$1616.token.value === 'function' && rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Delimiter && rest$1617[0].token.value === '()' && rest$1617[1] && rest$1617[1].token.type === parser$1202.Token.Delimiter && rest$1617[1].token.value === '{}') {
                    rest$1617[0].token.inner = rest$1617[0].expose().token.inner;
                    rest$1617[1].token.inner = rest$1617[1].expose().token.inner;
                    return step$1615(AnonFun$1390.create(head$1616, rest$1617[0], rest$1617[1]), rest$1617.slice(2));
                }    // catch statement
                else if (head$1616.token.type === parser$1202.Token.Keyword && head$1616.token.value === 'catch' && rest$1617[0] && rest$1617[0].token.type === parser$1202.Token.Delimiter && rest$1617[0].token.value === '()' && rest$1617[1] && rest$1617[1].token.type === parser$1202.Token.Delimiter && rest$1617[1].token.value === '{}') {
                    rest$1617[0].token.inner = rest$1617[0].expose().token.inner;
                    rest$1617[1].token.inner = rest$1617[1].expose().token.inner;
                    return step$1615(CatchClause$1400.create(head$1616, rest$1617[0], rest$1617[1]), rest$1617.slice(2));
                }    // this expression
                else if (head$1616.token.type === parser$1202.Token.Keyword && head$1616.token.value === 'this') {
                    return step$1615(ThisExpression$1375.create(head$1616), rest$1617);
                }    // literal
                else if (head$1616.token.type === parser$1202.Token.NumericLiteral || head$1616.token.type === parser$1202.Token.StringLiteral || head$1616.token.type === parser$1202.Token.BooleanLiteral || head$1616.token.type === parser$1202.Token.RegexLiteral || head$1616.token.type === parser$1202.Token.NullLiteral) {
                    return step$1615(Lit$1376.create(head$1616), rest$1617);
                }    // export
                else if (head$1616.token.type === parser$1202.Token.Identifier && head$1616.token.value === 'export' && rest$1617[0] && (rest$1617[0].token.type === parser$1202.Token.Identifier || rest$1617[0].token.type === parser$1202.Token.Keyword || rest$1617[0].token.type === parser$1202.Token.Punctuator)) {
                    return step$1615(Export$1403.create(rest$1617[0]), rest$1617.slice(1));
                }    // identifier
                else if (head$1616.token.type === parser$1202.Token.Identifier) {
                    return step$1615(Id$1388.create(head$1616), rest$1617);
                }    // punctuator
                else if (head$1616.token.type === parser$1202.Token.Punctuator) {
                    return step$1615(Punc$1386.create(head$1616), rest$1617);
                } else if (head$1616.token.type === parser$1202.Token.Keyword && head$1616.token.value === 'with') {
                    throwError$1338('with is not supported in sweet.js');
                }    // keyword
                else if (head$1616.token.type === parser$1202.Token.Keyword) {
                    return step$1615(Keyword$1385.create(head$1616), rest$1617);
                }    // Delimiter
                else if (head$1616.token.type === parser$1202.Token.Delimiter) {
                    return step$1615(Delimiter$1387.create(head$1616.expose()), rest$1617);
                }    // end of file
                else if (head$1616.token.type === parser$1202.Token.EOF) {
                    parser$1202.assert(rest$1617.length === 0, 'nothing should be after an EOF');
                    return step$1615(EOF$1371.create(head$1616), []);
                } else {
                    // todo: are we missing cases?
                    parser$1202.assert(false, 'not implemented');
                }
            }
            // we're done stepping
            return {
                result: head$1616,
                rest: rest$1617
            };
        }
        return step$1615(toks$1612[0], toks$1612.slice(1));
    }
    function get_expression$1415(stx$1680, context$1681) {
        var res$1682 = enforest$1413(stx$1680, context$1681);
        if (!res$1682.result.hasPrototype(Expr$1373)) {
            return {
                result: null,
                rest: stx$1680
            };
        }
        return res$1682;
    }
    // mark each syntax object in the pattern environment,
    // mutating the environment
    function applyMarkToPatternEnv$1417(newMark$1683, env$1684) {
        /*
        Takes a `match` object:

            {
                level: <num>,
                match: [<match> or <syntax>]
            }

        where the match property is an array of syntax objects at the bottom (0) level.
        Does a depth-first search and applys the mark to each syntax object.
        */
        function dfs$1686(match$1688) {
            if (match$1688.level === 0) {
                // replace the match property with the marked syntax
                match$1688.match = _$1201.map(match$1688.match, function (stx$1690) {
                    return stx$1690.mark(newMark$1683);
                });
            } else {
                _$1201.each(match$1688.match, function (match$1692) {
                    dfs$1686(match$1692);
                });
            }
        }
        _$1201.keys(env$1684).forEach(function (key$1693) {
            dfs$1686(env$1684[key$1693]);
        });
    }
    // given the syntax for a macro, produce a macro transformer
    // (Macro) -> (([...CSyntax]) -> ReadTree)
    function loadMacroDef$1419(mac$1694, context$1695) {
        var body$1696 = mac$1694.body;
        // raw function primitive form
        if (!(body$1696[0] && body$1696[0].token.type === parser$1202.Token.Keyword && body$1696[0].token.value === 'function')) {
            throwError$1338('Primitive macro form must contain a function for the macro body');
        }
        var stub$1697 = parser$1202.read('()');
        stub$1697[0].token.inner = body$1696;
        var expanded$1698 = expand$1427(stub$1697, context$1695);
        expanded$1698 = expanded$1698[0].destruct().concat(expanded$1698[1].eof);
        var flattend$1699 = flatten$1433(expanded$1698);
        var bodyCode$1700 = codegen$1208.generate(parser$1202.parse(flattend$1699));
        var macroFn$1701 = scopedEval$1339(bodyCode$1700, {
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
                getTemplate: function (id$1704) {
                    return context$1695.templateMap.get(id$1704);
                },
                applyMarkToPatternEnv: applyMarkToPatternEnv$1417,
                mergeMatches: function (newMatch$1705, oldMatch$1706) {
                    newMatch$1705.patternEnv = _$1201.extend({}, oldMatch$1706.patternEnv, newMatch$1705.patternEnv);
                    return newMatch$1705;
                }
            });
        return macroFn$1701;
    }
    // similar to `parse1` in the honu paper
    // ([Syntax], Map) -> {terms: [TermTree], env: Map}
    function expandToTermTree$1421(stx$1707, context$1708) {
        parser$1202.assert(context$1708, 'expander context is required');
        // short circuit when syntax array is empty
        if (stx$1707.length === 0) {
            return {
                terms: [],
                context: context$1708
            };
        }
        parser$1202.assert(stx$1707[0].token, 'expecting a syntax object');
        var f$1709 = enforest$1413(stx$1707, context$1708);
        // head :: TermTree
        var head$1710 = f$1709.result;
        // rest :: [Syntax]
        var rest$1711 = f$1709.rest;
        if (head$1710.hasPrototype(Macro$1392)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1713 = loadMacroDef$1419(head$1710, context$1708);
            addToDefinitionCtx$1423([head$1710.name], context$1708.defscope, false);
            context$1708.env.set(resolve$1354(head$1710.name), { fn: macroDefinition$1713 });
            return expandToTermTree$1421(rest$1711, context$1708);
        }
        if (head$1710.hasPrototype(LetMacro$1391)) {
            // load the macro definition into the environment and continue expanding
            var macroDefinition$1713 = loadMacroDef$1419(head$1710, context$1708);
            var freshName$1714 = fresh$1365();
            var renamedName$1715 = head$1710.name.rename(head$1710.name, freshName$1714);
            rest$1711 = _$1201.map(rest$1711, function (stx$1719) {
                return stx$1719.rename(head$1710.name, freshName$1714);
            });
            head$1710.name = renamedName$1715;
            context$1708.env.set(resolve$1354(head$1710.name), { fn: macroDefinition$1713 });
            return expandToTermTree$1421(rest$1711, context$1708);
        }
        if (head$1710.hasPrototype(NamedFun$1389)) {
            addToDefinitionCtx$1423([head$1710.name], context$1708.defscope, true);
        }
        if (head$1710.hasPrototype(Id$1388) && head$1710.id.token.value === '#quoteSyntax' && rest$1711[0] && rest$1711[0].token.value === '{}') {
            var tempId$1720 = fresh$1365();
            context$1708.templateMap.set(tempId$1720, rest$1711[0].token.inner);
            return expandToTermTree$1421([
                syn$1203.makeIdent('getTemplate', head$1710.id),
                syn$1203.makeDelim('()', [syn$1203.makeValue(tempId$1720, head$1710.id)], head$1710.id)
            ].concat(rest$1711.slice(1)), context$1708);
        }
        if (head$1710.hasPrototype(VariableStatement$1399)) {
            addToDefinitionCtx$1423(_$1201.map(head$1710.decls, function (decl$1724) {
                return decl$1724.ident;
            }), context$1708.defscope, true);
        }
        if (head$1710.hasPrototype(Block$1378) && head$1710.body.hasPrototype(Delimiter$1387)) {
            head$1710.body.delim.token.inner.forEach(function (term$1726) {
                if (term$1726.hasPrototype(VariableStatement$1399)) {
                    addToDefinitionCtx$1423(_$1201.map(term$1726.decls, function (decl$1730) {
                        return decl$1730.ident;
                    }), context$1708.defscope, true);
                }
            });
        }
        if (head$1710.hasPrototype(Delimiter$1387)) {
            head$1710.delim.token.inner.forEach(function (term$1734) {
                if (term$1734.hasPrototype(VariableStatement$1399)) {
                    addToDefinitionCtx$1423(_$1201.map(term$1734.decls, function (decl$1738) {
                        return decl$1738.ident;
                    }), context$1708.defscope, true);
                }
            });
        }
        var trees$1712 = expandToTermTree$1421(rest$1711, context$1708);
        return {
            terms: [head$1710].concat(trees$1712.terms),
            context: trees$1712.context
        };
    }
    function addToDefinitionCtx$1423(idents$1739, defscope$1740, skipRep$1741) {
        parser$1202.assert(idents$1739 && idents$1739.length > 0, 'expecting some variable identifiers');
        skipRep$1741 = skipRep$1741 || false;
        _$1201.each(idents$1739, function (id$1745) {
            var skip$1746 = false;
            if (skipRep$1741) {
                var declRepeat$1750 = _$1201.find(defscope$1740, function (def$1751) {
                        return def$1751.id.token.value === id$1745.token.value && arraysEqual$1356(marksof$1352(def$1751.id.context), marksof$1352(id$1745.context));
                    });
                skip$1746 = typeof declRepeat$1750 !== 'undefined';
            }
            /* 
               When var declarations repeat in the same function scope:
               
               var x = 24;
               ...
               var x = 42;

               we just need to use the first renaming and leave the
               definition context as is.
            */
            if (!skip$1746) {
                var name$1752 = fresh$1365();
                defscope$1740.push({
                    id: id$1745,
                    name: name$1752
                });
            }
        });
    }
    // similar to `parse2` in the honu paper except here we
    // don't generate an AST yet
    // (TermTree, Map, Map) -> TermTree
    function expandTermTreeToFinal$1425(term$1753, context$1754) {
        parser$1202.assert(context$1754 && context$1754.env, 'environment map is required');
        if (term$1753.hasPrototype(ArrayLiteral$1379)) {
            term$1753.array.delim.token.inner = expand$1427(term$1753.array.delim.expose().token.inner, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(Block$1378)) {
            term$1753.body.delim.token.inner = expand$1427(term$1753.body.delim.expose().token.inner, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(ParenExpression$1380)) {
            term$1753.expr.delim.token.inner = expand$1427(term$1753.expr.delim.expose().token.inner, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(Call$1395)) {
            term$1753.fun = expandTermTreeToFinal$1425(term$1753.fun, context$1754);
            term$1753.args = _$1201.map(term$1753.args, function (arg$1758) {
                return expandTermTreeToFinal$1425(arg$1758, context$1754);
            });
            return term$1753;
        } else if (term$1753.hasPrototype(UnaryOp$1381)) {
            term$1753.expr = expandTermTreeToFinal$1425(term$1753.expr, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(BinOp$1383)) {
            term$1753.left = expandTermTreeToFinal$1425(term$1753.left, context$1754);
            term$1753.right = expandTermTreeToFinal$1425(term$1753.right, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(ObjGet$1397)) {
            term$1753.right.delim.token.inner = expand$1427(term$1753.right.delim.expose().token.inner, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(ObjDotGet$1396)) {
            term$1753.left = expandTermTreeToFinal$1425(term$1753.left, context$1754);
            term$1753.right = expandTermTreeToFinal$1425(term$1753.right, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(VariableDeclaration$1398)) {
            if (term$1753.init) {
                term$1753.init = expandTermTreeToFinal$1425(term$1753.init, context$1754);
            }
            return term$1753;
        } else if (term$1753.hasPrototype(VariableStatement$1399)) {
            term$1753.decls = _$1201.map(term$1753.decls, function (decl$1762) {
                return expandTermTreeToFinal$1425(decl$1762, context$1754);
            });
            return term$1753;
        } else if (term$1753.hasPrototype(Delimiter$1387)) {
            // expand inside the delimiter and then continue on
            term$1753.delim.token.inner = expand$1427(term$1753.delim.expose().token.inner, context$1754);
            return term$1753;
        } else if (term$1753.hasPrototype(NamedFun$1389) || term$1753.hasPrototype(AnonFun$1390) || term$1753.hasPrototype(CatchClause$1400) || term$1753.hasPrototype(Module$1401)) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef$1763 = [];
            var bodyContext$1764 = makeExpanderContext$1429(_$1201.defaults({ defscope: newDef$1763 }, context$1754));
            if (term$1753.params) {
                var params$1785 = term$1753.params.expose();
            } else {
                var params$1785 = syn$1203.makeDelim('()', [], null);
            }
            var bodies$1765 = term$1753.body.addDefCtx(newDef$1763);
            var paramNames$1769 = _$1201.map(getParamIdentifiers$1369(params$1785), function (param$1786) {
                    var freshName$1787 = fresh$1365();
                    return {
                        freshName: freshName$1787,
                        originalParam: param$1786,
                        renamedParam: param$1786.rename(param$1786, freshName$1787)
                    };
                });
            // rename the function body for each of the parameters
            var renamedBody$1773 = _$1201.reduce(paramNames$1769, function (accBody$1788, p$1789) {
                    return accBody$1788.rename(p$1789.originalParam, p$1789.freshName);
                }, bodies$1765);
            renamedBody$1773 = renamedBody$1773.expose();
            var expandedResult$1774 = expandToTermTree$1421(renamedBody$1773.token.inner, bodyContext$1764);
            var bodyTerms$1775 = expandedResult$1774.terms;
            var renamedParams$1779 = _$1201.map(paramNames$1769, function (p$1790) {
                    return p$1790.renamedParam;
                });
            var flatArgs$1780 = syn$1203.makeDelim('()', joinSyntax$1348(renamedParams$1779, ','), term$1753.params);
            var expandedArgs$1781 = expand$1427([flatArgs$1780], bodyContext$1764);
            parser$1202.assert(expandedArgs$1781.length === 1, 'should only get back one result');
            // stitch up the function with all the renamings
            if (term$1753.params) {
                term$1753.params = expandedArgs$1781[0];
            }
            bodyTerms$1775 = _$1201.map(bodyTerms$1775, function (bodyTerm$1791) {
                // add the definition context to the result of
                // expansion (this makes sure that syntax objects
                // introduced by expansion have the def context)
                var termWithCtx$1792 = bodyTerm$1791.addDefCtx(newDef$1763);
                // finish expansion
                return expandTermTreeToFinal$1425(termWithCtx$1792, expandedResult$1774.context);
            });
            if (term$1753.hasPrototype(Module$1401)) {
                bodyTerms$1775 = _$1201.filter(bodyTerms$1775, function (bodyTerm$1796) {
                    if (bodyTerm$1796.hasPrototype(Export$1403)) {
                        term$1753.exports.push(bodyTerm$1796);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody$1773.token.inner = bodyTerms$1775;
            term$1753.body = renamedBody$1773;
            // and continue expand the rest
            return term$1753;
        }
        // the term is fine as is
        return term$1753;
    }
    // similar to `parse` in the honu paper
    // ([Syntax], Map, Map) -> [TermTree]
    function expand$1427(stx$1797, context$1798) {
        parser$1202.assert(context$1798, 'must provide an expander context');
        var trees$1799 = expandToTermTree$1421(stx$1797, context$1798);
        return _$1201.map(trees$1799.terms, function (term$1803) {
            return expandTermTreeToFinal$1425(term$1803, trees$1799.context);
        });
    }
    function makeExpanderContext$1429(o$1804) {
        o$1804 = o$1804 || {};
        // read-only but can enumerate
        return Object.create(Object.prototype, {
            env: {
                value: o$1804.env || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o$1804.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o$1804.templateMap || new Map(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o$1804.mark,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    // a hack to make the top level hygiene work out
    function expandTopLevel$1431(stx$1805, builtinSource$1806) {
        var builtInEnv$1807 = new Map();
        var env$1808 = new Map();
        var params$1809 = [];
        var context$1810, builtInContext$1811 = makeExpanderContext$1429({ env: builtInEnv$1807 });
        /*
        var testing = expand(parser.read("(function () {var foo; function bar(foo) { foo; }})"), makeExpanderContext());
        testing = flatten(testing[0].destruct()).concat(testing[1].eof);
        testing = parser.parse(testing);
        testing = codegen.generate(testing);
        */
        if (builtinSource$1806) {
            var builtinRead$1815 = parser$1202.read(builtinSource$1806);
            builtinRead$1815 = [
                syn$1203.makeIdent('module', null),
                syn$1203.makeDelim('{}', builtinRead$1815, null)
            ];
            var builtinRes$1816 = expand$1427(builtinRead$1815, builtInContext$1811);
            params$1809 = _$1201.map(builtinRes$1816[0].exports, function (term$1818) {
                return {
                    oldExport: term$1818.name,
                    newParam: syn$1203.makeIdent(term$1818.name.token.value, null)
                };
            });
        }
        var modBody$1812 = syn$1203.makeDelim('{}', stx$1805, null);
        modBody$1812 = _$1201.reduce(params$1809, function (acc$1819, param$1820) {
            var newName$1821 = fresh$1365();
            env$1808.set(resolve$1354(param$1820.newParam.rename(param$1820.newParam, newName$1821)), builtInEnv$1807.get(resolve$1354(param$1820.oldExport)));
            return acc$1819.rename(param$1820.newParam, newName$1821);
        }, modBody$1812);
        context$1810 = makeExpanderContext$1429({ env: env$1808 });
        var res$1814 = expand$1427([
                syn$1203.makeIdent('module', null),
                modBody$1812
            ], context$1810);
        res$1814 = res$1814[0].destruct();
        return flatten$1433(res$1814[0].token.inner);
    }
    // break delimiter tree structure down to flat array of syntax objects
    function flatten$1433(stx$1822) {
        return _$1201.reduce(stx$1822, function (acc$1824, stx$1825) {
            if (stx$1825.token.type === parser$1202.Token.Delimiter) {
                var exposed$1826 = stx$1825.expose();
                var openParen$1827 = syntaxFromToken$1347({
                        type: parser$1202.Token.Punctuator,
                        value: stx$1825.token.value[0],
                        range: stx$1825.token.startRange,
                        lineNumber: stx$1825.token.startLineNumber,
                        sm_lineNumber: stx$1825.token.sm_startLineNumber ? stx$1825.token.sm_startLineNumber : stx$1825.token.startLineNumber,
                        lineStart: stx$1825.token.startLineStart,
                        sm_lineStart: stx$1825.token.sm_startLineStart ? stx$1825.token.sm_startLineStart : stx$1825.token.startLineStart
                    }, exposed$1826);
                var closeParen$1828 = syntaxFromToken$1347({
                        type: parser$1202.Token.Punctuator,
                        value: stx$1825.token.value[1],
                        range: stx$1825.token.endRange,
                        lineNumber: stx$1825.token.endLineNumber,
                        sm_lineNumber: stx$1825.token.sm_endLineNumber ? stx$1825.token.sm_endLineNumber : stx$1825.token.endLineNumber,
                        lineStart: stx$1825.token.endLineStart,
                        sm_lineStart: stx$1825.token.sm_endLineStart ? stx$1825.token.sm_endLineStart : stx$1825.token.endLineStart
                    }, exposed$1826);
                if (stx$1825.token.leadingComments) {
                    openParen$1827.token.leadingComments = stx$1825.token.leadingComments;
                }
                if (stx$1825.token.trailingComments) {
                    openParen$1827.token.trailingComments = stx$1825.token.trailingComments;
                }
                return acc$1824.concat(openParen$1827).concat(flatten$1433(exposed$1826.token.inner)).concat(closeParen$1828);
            }
            stx$1825.token.sm_lineNumber = stx$1825.token.sm_lineNumber ? stx$1825.token.sm_lineNumber : stx$1825.token.lineNumber;
            stx$1825.token.sm_lineStart = stx$1825.token.sm_lineStart ? stx$1825.token.sm_lineStart : stx$1825.token.lineStart;
            return acc$1824.concat(stx$1825);
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