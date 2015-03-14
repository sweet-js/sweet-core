"use strict";

function StringMap2287(o2288) {
    this.__data = o2288 || {};
}
StringMap2287.prototype = {
    keys: function keys() {
        return Object.keys(this.__data);
    },
    has: function has(key2289) {
        return Object.prototype.hasOwnProperty.call(this.__data, key2289);
    },
    get: function get(key2290) {
        return this.has(key2290) ? this.__data[key2290] : void 0;
    },
    set: function set(key2291, value2292) {
        this.__data[key2291] = value2292;
    },
    extend: function extend() {
        var args2293 = _.map(_.toArray(arguments), function (x2294) {
            return x2294.__data;
        });
        _.extend.apply(_, [this.__data].concat(args2293));
        return this;
    }
};
module.exports = StringMap2287;
//# sourceMappingURL=stringMap.js.map