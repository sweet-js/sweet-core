"use strict";

function StringMap2436(o2437) {
    this.__data = o2437 || {};
}
StringMap2436.prototype = {
    keys: function keys() {
        return Object.keys(this.__data);
    },
    has: function has(key2438) {
        return Object.prototype.hasOwnProperty.call(this.__data, key2438);
    },
    get: function get(key2439) {
        return this.has(key2439) ? this.__data[key2439] : void 0;
    },
    set: function set(key2440, value2441) {
        this.__data[key2440] = value2441;
    },
    extend: function extend() {
        var args2442 = _.map(_.toArray(arguments), function (x2443) {
            return x2443.__data;
        });
        _.extend.apply(_, [this.__data].concat(args2442));
        return this;
    }
};
module.exports = StringMap2436;
//# sourceMappingURL=stringMap.js.map