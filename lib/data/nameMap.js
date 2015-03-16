"use strict";

var _1590 = require("underscore"),
    assert1591 = require("assert"),
    unwrapSyntax1592 = require("../syntax").unwrapSyntax,
    makeIdent1593 = require("../syntax").makeIdent,
    resolve1594 = require("../stx/resolve").resolve,
    StringMap1595 = require("./stringMap");
function NameMap1596() {
    // stores compiletime values
    this._map = new StringMap1595();
    // for fast path checking
    this._names = new StringMap1595();
}
NameMap1596.prototype.set = function (stx1601, phase1602, value1603) {
    assert1591(phase1602 != null, "must provide a phase");
    assert1591(value1603 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1592(stx1601), true);
    this._map.set(resolve1594(stx1601, phase1602), value1603);
};
NameMap1596.prototype.setWithModule = function (stx1604, phase1605, module1606, value1607) {
    assert1591(phase1605 != null, "must provide a phase");
    assert1591(value1607 != null, "must provide a value");
    // store the unresolved name string into the fast path lookup map
    this._names.set(unwrapSyntax1592(stx1604), true);
    // this._map.set(resolve(stx, phase), value);
    this._map.set(resolve1594(stx1604, phase1605), value1607);
};
function isToksAdjacent1597(a1608, b1609) {
    var arange1610 = a1608.token.sm_range || a1608.token.range || a1608.token.endRange;
    var brange1611 = b1609.token.sm_range || b1609.token.range || b1609.token.endRange;
    return arange1610 && brange1611 && arange1610[1] === brange1611[0];
}
function isValidName1598(stx1612) {
    return stx1612.isIdentifier() || stx1612.isKeyword() || stx1612.isPunctuator();
}
function getName1599(head1613, rest1614) {
    var idx1615 = 0;
    var curr1616 = head1613;
    var next1617 = rest1614[idx1615];
    var name1618 = [head1613];
    while (true) {
        if (next1617 && isValidName1598(next1617) && isToksAdjacent1597(curr1616, next1617)) {
            name1618.push(next1617);
            curr1616 = next1617;
            next1617 = rest1614[++idx1615];
        } else {
            return name1618;
        }
    }
}
function get1600(stxl1619, phase1620, module1621, withMod1622) {
    // normalize to an array
    stxl1619 = Array.isArray(stxl1619) ? stxl1619 : [stxl1619];
    var head1623 = stxl1619[0],
        rest1624 = stxl1619.slice(1),
        resolvedName1625;
    assert1591(phase1620 != null, "must provide phase");
    if (!isValidName1598(head1623)) {
        return null;
    }
    var name1626 = getName1599(head1623, rest1624);
    if ( // simple case, don't need to create a new syntax object
    name1626.length === 1) {
        if (this._names.get(unwrapSyntax1592(name1626[0]))) {
            resolvedName1625 = resolve1594(name1626[0], phase1620);
            if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
            this._map.has(resolvedName1625)) {
                return this._map.get(resolvedName1625);
            }
        }
        return null;
    } else {
        while (name1626.length > 0) {
            var nameStr1627 = name1626.map(unwrapSyntax1592).join("");
            if (this._names.get(nameStr1627)) {
                var nameStx1628 = makeIdent1593(nameStr1627, name1626[0]);
                resolvedName1625 = resolve1594(nameStx1628, phase1620);
                if ( // resolvedName = withMod ? resolvedName + "_p" + phase : resolvedName;
                this._map.has(resolvedName1625)) {
                    return this._map.get(resolvedName1625);
                }
            }
            name1626.pop();
        }
        return null;
    }
}
NameMap1596.prototype.get = function (stxl1629, phase1630) {
    return get1600.call(this, stxl1629, phase1630, undefined, false);
};
NameMap1596.prototype.getWithModule = function (stxl1631, phase1632, module1633) {
    return get1600.call(this, stxl1631, phase1632, module1633, true);
};
NameMap1596.prototype.hasName = function (stx1634) {
    return this._names.has(unwrapSyntax1592(stx1634));
};
NameMap1596.prototype.has = function (stx1635, phase1636) {
    return this.get(stx1635, phase1636) !== null;
};
NameMap1596.prototype.keysStr = function () {
    return this._map.keys();
};
NameMap1596.prototype.getStr = function (key1637) {
    return this._map.get(key1637);
};
NameMap1596.prototype.hasName = function (name1638) {
    return this._names.has(name1638);
};
module.exports = NameMap1596;
//# sourceMappingURL=nameMap.js.map