"use strict";

function StringMap2368(o2369) {
    this.__data = o2369 || {};
}
StringMap2368.prototype = {
    keys: function keys() {
        return Object.keys(this.__data);
    },
    has: function has(key2370) {
        return Object.prototype.hasOwnProperty.call(this.__data, key2370);
    },
    get: function get(key2371) {
        return this.has(key2371) ? this.__data[key2371] : void 0;
    },
    set: function set(key2372, value2373) {
        this.__data[key2372] = value2373;
    },
    extend: function extend() {
        var args2374 = _.map(_.toArray(arguments), function (x2375) {
            return x2375.__data;
        });
        _.extend.apply(_, [this.__data].concat(args2374));
        return this;
    }
};
module.exports = StringMap2368;
//# sourceMappingURL=stringMap.js.map