"use strict";

var _1550 = require("underscore"),
    assert1551 = require("assert"),
    unwrapSyntax1552 = require("../syntax").unwrapSyntax,
    makeIdent1553 = require("../syntax").makeIdent,
    resolve1554 = require("../stx/resolve").resolve,
    StringMap1555 = require("./stringMap");
function NameMap1556() {
    // stores compiletime values
    this._map = new StringMap1555();
}
NameMap1556.prototype.set = function (stx1561, phase1562, value1563) {
    assert1551(phase1562 != null, "must provide a phase");
    assert1551(value1563 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._map.set(resolve1554(stx1561, phase1562), value1563);
};
NameMap1556.prototype.setWithModule = function (stx1564, phase1565, module1566, value1567) {
    assert1551(phase1565 != null, "must provide a phase");
    assert1551(value1567 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._map.set(resolve1554(stx1564, phase1565), value1567);
};
function isToksAdjacent1557(a1568, b1569) {
    var arange1570 = a1568.token.sm_range || a1568.token.range || a1568.token.endRange;
    var brange1571 = b1569.token.sm_range || b1569.token.range || b1569.token.endRange;
    return arange1570 && brange1571 && arange1570[1] === brange1571[0];
}
function isValidName1558(stx1572) {
    return stx1572.isIdentifier() || stx1572.isKeyword() || stx1572.isPunctuator();
}
function getName1559(head1573, rest1574) {
    var idx1575 = 0;
    var curr1576 = head1573;
    var next1577 = rest1574[idx1575];
    var name1578 = [head1573];
    while (true) {
        if (next1577 && isValidName1558(next1577) && isToksAdjacent1557(curr1576, next1577)) {
            name1578.push(next1577);
            curr1576 = next1577;
            next1577 = rest1574[++idx1575];
        } else {
            return name1578;
        }
    }
}
function get1560(stxl1579, phase1580, module1581, withMod1582) {
    // normalize to an array
    stxl1579 = Array.isArray(stxl1579) ? stxl1579 : [stxl1579];
    var head1583 = stxl1579[0],
        rest1584 = stxl1579.slice(1),
        resolvedName1585;
    assert1551(phase1580 != null, "must provide phase");
    if (!isValidName1558(head1583)) {
        return null;
    }
    var name1586 = getName1559(head1583, rest1584);
    if ( // simple case, don't need to create a new syntax object
    name1586.length === 1) {
        resolvedName1585 = resolve1554(name1586[0], phase1580);
        if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
        this._map.has(resolvedName1585)) {
            return this._map.get(resolvedName1585);
        }
        return null;
    } else {
        while (name1586.length > 0) {
            var nameStr1587 = name1586.map(unwrapSyntax1552).join("");
            var nameStx1588 = makeIdent1553(nameStr1587, name1586[0]);
            resolvedName1585 = resolve1554(nameStx1588, phase1580);
            if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
            this._map.has(resolvedName1585)) {
                return this._map.get(resolvedName1585);
            }
            name1586.pop();
        }
        return null;
    }
}
NameMap1556.prototype.get = function (stxl1589, phase1590) {
    return get1560.call(this, stxl1589, phase1590, undefined, false);
};
NameMap1556.prototype.getWithModule = function (stxl1591, phase1592, module1593) {
    return get1560.call(this, stxl1591, phase1592, module1593, true);
};
NameMap1556.prototype.has = function (stx1594, phase1595) {
    return this.get(stx1594, phase1595) !== null;
};
NameMap1556.prototype.keysStr = function () {
    return this._map.keys();
};
NameMap1556.prototype.getStr = function (key1596) {
    return this._map.get(key1596);
};
module.exports = NameMap1556;
//# sourceMappingURL=nameMap.js.map