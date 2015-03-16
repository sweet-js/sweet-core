"use strict";

function StringMap2430(o2431) {
    this.__data = o2431 || {};
}
StringMap2430.prototype = {
    keys: function keys() {
        return Object.keys(this.__data);
    },
    has: function has(key2432) {
        return Object.prototype.hasOwnProperty.call(this.__data, key2432);
    },
    get: function get(key2433) {
        return this.has(key2433) ? this.__data[key2433] : void 0;
    },
    set: function set(key2434, value2435) {
        this.__data[key2434] = value2435;
    },
    extend: function extend() {
        var args2436 = _.map(_.toArray(arguments), function (x2437) {
            return x2437.__data;
        });
        _.extend.apply(_, [this.__data].concat(args2436));
        return this;
    }
};
module.exports = StringMap2430;
//# sourceMappingURL=stringMap.js.map