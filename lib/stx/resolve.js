"use strict";

var assert10371 = require("assert"),
    Immutable10372 = require("immutable");
function sizeDecending10373(a10375, b10376) {
    if (a10375.scopeSet.size > b10376.scopeSet.size) {
        return -1;
    } else if (b10376.scopeSet.size > a10375.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10374(stx10377, phase10378) {
    assert10371(phase10378 !== undefined, "must pass in phase");
    var // the first scope is the most recently allocated and contains all of
    // the bindings
    topScope10379 = stx10377.context.first();
    if (topScope10379) {
        var // get the bindings
        tokenBindings10380 = topScope10379.bindings.get(stx10377.token.value);
        if (tokenBindings10380) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10381 = tokenBindings10380.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10377.context;
                if (binding.phase !== phase10378) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10373)[0];
            if (biggestScopeSet10381) {
                if (typeof biggestScopeSet10381.binding === "number") {
                    return stx10377.token.value + biggestScopeSet10381.binding;
                }
                return resolve10374(biggestScopeSet10381.binding, phase10378);
            }
        }
    }
    return stx10377.token.value;
}
exports.resolve = resolve10374;
//# sourceMappingURL=resolve.js.map