"use strict";

var _1494 = require("underscore"),
    assert1495 = require("assert"),
    unwrapSyntax1496 = require("../syntax").unwrapSyntax,
    makeIdent1497 = require("../syntax").makeIdent,
    resolve1498 = require("../stx/resolve").resolve,
    StringMap1499 = require("./stringMap");
function NameMap1500() {
    // stores compiletime values
    this._map = new StringMap1499();
    // for fast path checking
    this._names = new StringMap1499();
}
NameMap1500.prototype.set = function (stx1505, phase1506, value1507) {
    assert1495(phase1506 != null, "must provide a phase");
    assert1495(value1507 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1496(stx1505), true);
    this._map.set(resolve1498(stx1505, phase1506), value1507);
};
NameMap1500.prototype.setWithModule = function (stx1508, phase1509, module1510, value1511) {
    assert1495(phase1509 != null, "must provide a phase");
    assert1495(value1511 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1496(stx1508), true);
    // this._map.set(resolve(stx, phase), value);
    this._map.set(resolve1498(stx1508, phase1509), value1511);
};
function isToksAdjacent1501(a1512, b1513) {
    var arange1514 = a1512.token.sm_range || a1512.token.range || a1512.token.endRange;
    var brange1515 = b1513.token.sm_range || b1513.token.range || b1513.token.endRange;
    return arange1514 && brange1515 && arange1514[1] === brange1515[0];
}
function isValidName1502(stx1516) {
    return stx1516.isIdentifier() || stx1516.isKeyword() || stx1516.isPunctuator();
}
function getName1503(head1517, rest1518) {
    var idx1519 = 0;
    var curr1520 = head1517;
    var next1521 = rest1518[idx1519];
    var name1522 = [head1517];
    while (true) {
        if (next1521 && isValidName1502(next1521) && isToksAdjacent1501(curr1520, next1521)) {
            name1522.push(next1521);
            curr1520 = next1521;
            next1521 = rest1518[++idx1519];
        } else {
            return name1522;
        }
    }
}
function get1504(stxl1523, phase1524, module1525, withMod1526) {
    // normalize to an array
    stxl1523 = Array.isArray(stxl1523) ? stxl1523 : [stxl1523];
    var head1527 = stxl1523[0],
        rest1528 = stxl1523.slice(1),
        resolvedName1529;
    assert1495(phase1524 != null, "must provide phase");
    if (!isValidName1502(head1527)) {
        return null;
    }
    var name1530 = getName1503(head1527, rest1528);
    if ( // simple case, don't need to create a new syntax object
    name1530.length === 1) {
        if (this._names.get(unwrapSyntax1496(name1530[0]))) {
            resolvedName1529 = resolve1498(name1530[0], phase1524);
            if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
            this._map.has(resolvedName1529)) {
                return this._map.get(resolvedName1529);
            }
        }
        return null;
    } else {
        while (name1530.length > 0) {
            var nameStr1531 = name1530.map(unwrapSyntax1496).join("");
            if (this._names.get(nameStr1531)) {
                var nameStx1532 = makeIdent1497(nameStr1531, name1530[0]);
                resolvedName1529 = resolve1498(nameStx1532, phase1524);
                if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
                this._map.has(resolvedName1529)) {
                    return this._map.get(resolvedName1529);
                }
            }
            name1530.pop();
        }
        return null;
    }
}
NameMap1500.prototype.get = function (stxl1533, phase1534) {
    return get1504.call(this, stxl1533, phase1534, undefined, false);
};
NameMap1500.prototype.getWithModule = function (stxl1535, phase1536, module1537) {
    return get1504.call(this, stxl1535, phase1536, module1537, true);
};
NameMap1500.prototype.hasName = function (stx1538) {
    return this._names.has(unwrapSyntax1496(stx1538));
};
NameMap1500.prototype.has = function (stx1539, phase1540) {
    return this.get(stx1539, phase1540) !== null;
};
NameMap1500.prototype.keysStr = function () {
    return this._map.keys();
};
NameMap1500.prototype.getStr = function (key1541) {
    return this._map.get(key1541);
};
NameMap1500.prototype.hasName = function (name1542) {
    return this._names.has(name1542);
};
module.exports = NameMap1500;
//# sourceMappingURL=nameMap.js.map