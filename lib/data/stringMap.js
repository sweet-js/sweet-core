"use strict";
function StringMap(o) {
    this.__data = o || {};
}
StringMap.prototype = {
    keys: function () {
        return Object.keys(this.__data);
    },
    has: function (key) {
        return Object.prototype.hasOwnProperty.call(this.__data, key);
    },
    get: function (key) {
        return this.has(key) ? this.__data[key] : void 0;
    },
    set: function (key, value) {
        this.__data[key] = value;
    },
    extend: function () {
        var args = _.map(_.toArray(arguments), function (x) {
            return x.__data;
        });
        _.extend.apply(_, [this.__data].concat(args));
        return this;
    }
};
module.exports = StringMap;
//# sourceMappingURL=stringMap.js.map