"use strict";

var assert10391 = require("assert"),
    Immutable10392 = require("immutable");
function sizeDecending10393(a10395, b10396) {
    if (a10395.scopeSet.size > b10396.scopeSet.size) {
        return -1;
    } else if (b10396.scopeSet.size > a10395.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10394(stx10397, phase10398) {
    assert10391(phase10398 !== undefined, "must pass in phase");
    var // the first scope is the most recently allocated and contains all of
    // the bindings
    topScope10399 = stx10397.context.first();
    if (topScope10399) {
        var // get the bindings
        tokenBindings10400 = topScope10399.bindings.get(stx10397.token.value);
        if (tokenBindings10400) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10401 = tokenBindings10400.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10397.context;
                if (binding.phase !== phase10398) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10393)[0];
            if (biggestScopeSet10401) {
                if (typeof biggestScopeSet10401.binding === "number") {
                    return stx10397.token.value + biggestScopeSet10401.binding;
                }
                return resolve10394(biggestScopeSet10401.binding, phase10398);
            }
        }
    }
    return stx10397.token.value;
}
exports.resolve = resolve10394;
//# sourceMappingURL=resolve.js.map