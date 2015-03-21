"use strict";

function StringMap2428(o2429) {
    this.__data = o2429 || {};
}
StringMap2428.prototype = {
    keys: function keys() {
        return Object.keys(this.__data);
    },
    has: function has(key2430) {
        return Object.prototype.hasOwnProperty.call(this.__data, key2430);
    },
    get: function get(key2431) {
        return this.has(key2431) ? this.__data[key2431] : void 0;
    },
    set: function set(key2432, value2433) {
        this.__data[key2432] = value2433;
    },
    extend: function extend() {
        var args2434 = _.map(_.toArray(arguments), function (x2435) {
            return x2435.__data;
        });
        _.extend.apply(_, [this.__data].concat(args2434));
        return this;
    }
};
module.exports = StringMap2428;
//# sourceMappingURL=stringMap.js.map