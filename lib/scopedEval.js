// thou shalt not macro expand me...all kinds of hygiene hackary
// with strings and `with`.


(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    }
}(this, function(exports) {

    exports.scopedEval = function(source, global) {
        return eval('(function() { with(global) { return ' + source + ' } }).call(global, global);');
    };

}));

