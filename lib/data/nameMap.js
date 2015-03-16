"use strict";

var _1594 = require("underscore"),
    assert1595 = require("assert"),
    unwrapSyntax1596 = require("../syntax").unwrapSyntax,
    makeIdent1597 = require("../syntax").makeIdent,
    resolve1598 = require("../stx/resolve").resolve,
    StringMap1599 = require("./stringMap");
function NameMap1600() {
    // stores compiletime values
    this._map = new StringMap1599();
    // for fast path checking
    this._names = new StringMap1599();
}
NameMap1600.prototype.set = function (stx1605, phase1606, value1607) {
    assert1595(phase1606 != null, "must provide a phase");
    assert1595(value1607 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1596(stx1605), true);
    this._map.set(resolve1598(stx1605, phase1606), value1607);
};
NameMap1600.prototype.setWithModule = function (stx1608, phase1609, module1610, value1611) {
    assert1595(phase1609 != null, "must provide a phase");
    assert1595(value1611 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1596(stx1608), true);
    // this._map.set(resolve(stx, phase), value);
    this._map.set(resolve1598(stx1608, phase1609), value1611);
};
function isToksAdjacent1601(a1612, b1613) {
    var arange1614 = a1612.token.sm_range || a1612.token.range || a1612.token.endRange;
    var brange1615 = b1613.token.sm_range || b1613.token.range || b1613.token.endRange;
    return arange1614 && brange1615 && arange1614[1] === brange1615[0];
}
function isValidName1602(stx1616) {
    return stx1616.isIdentifier() || stx1616.isKeyword() || stx1616.isPunctuator();
}
function getName1603(head1617, rest1618) {
    var idx1619 = 0;
    var curr1620 = head1617;
    var next1621 = rest1618[idx1619];
    var name1622 = [head1617];
    while (true) {
        if (next1621 && isValidName1602(next1621) && isToksAdjacent1601(curr1620, next1621)) {
            name1622.push(next1621);
            curr1620 = next1621;
            next1621 = rest1618[++idx1619];
        } else {
            return name1622;
        }
    }
}
function get1604(stxl1623, phase1624, module1625, withMod1626) {
    // normalize to an array
    stxl1623 = Array.isArray(stxl1623) ? stxl1623 : [stxl1623];
    var head1627 = stxl1623[0],
        rest1628 = stxl1623.slice(1),
        resolvedName1629;
    assert1595(phase1624 != null, "must provide phase");
    if (!isValidName1602(head1627)) {
        return null;
    }
    var name1630 = getName1603(head1627, rest1628);
    if ( // simple case, don't need to create a new syntax object
    name1630.length === 1) {
        if (this._names.get(unwrapSyntax1596(name1630[0]))) {
            resolvedName1629 = resolve1598(name1630[0], phase1624);
            if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
            this._map.has(resolvedName1629)) {
                return this._map.get(resolvedName1629);
            }
        }
        return null;
    } else {
        while (name1630.length > 0) {
            var nameStr1631 = name1630.map(unwrapSyntax1596).join("");
            if (this._names.get(nameStr1631)) {
                var nameStx1632 = makeIdent1597(nameStr1631, name1630[0]);
                resolvedName1629 = resolve1598(nameStx1632, phase1624);
                if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
                this._map.has(resolvedName1629)) {
                    return this._map.get(resolvedName1629);
                }
            }
            name1630.pop();
        }
        return null;
    }
}
NameMap1600.prototype.get = function (stxl1633, phase1634) {
    return get1604.call(this, stxl1633, phase1634, undefined, false);
};
NameMap1600.prototype.getWithModule = function (stxl1635, phase1636, module1637) {
    return get1604.call(this, stxl1635, phase1636, module1637, true);
};
NameMap1600.prototype.hasName = function (stx1638) {
    return this._names.has(unwrapSyntax1596(stx1638));
};
NameMap1600.prototype.has = function (stx1639, phase1640) {
    return this.get(stx1639, phase1640) !== null;
};
NameMap1600.prototype.keysStr = function () {
    return this._map.keys();
};
NameMap1600.prototype.getStr = function (key1641) {
    return this._map.get(key1641);
};
NameMap1600.prototype.hasName = function (name1642) {
    return this._names.has(name1642);
};
module.exports = NameMap1600;
//# sourceMappingURL=nameMap.js.map