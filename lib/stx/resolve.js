"use strict";

var assert10321 = require("assert"),
    Immutable10322 = require("immutable");
function sizeDecending10323(a10325, b10326) {
    if (a10325.scopeSet.size > b10326.scopeSet.size) {
        return -1;
    } else if (b10326.scopeSet.size > a10325.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10324(stx10327, phase10328) {
    assert10321(phase10328 !== undefined, "must pass in phase");
    var topScope10329 = stx10327.context.first();
    if (topScope10329) {
        var // get the bindings
        tokenBindings10330 = topScope10329.bindings.get(stx10327.token.value);
        if (tokenBindings10330) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10331 = tokenBindings10330.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10327.context;
                if (binding.phase !== phase10328) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10323)[0];
            if (biggestScopeSet10331) {
                if ( // simple case where the binding is a number we can
                // just append, otherwise it is actually a rename
                // transformer so we have to do another resolve
                typeof biggestScopeSet10331.binding === "number") {
                    return stx10327.token.value + biggestScopeSet10331.binding;
                }
                return resolve10324(biggestScopeSet10331.binding, phase10328);
            }
        }
    }
    return stx10327.token.value;
}
exports.resolve = resolve10324;
//# sourceMappingURL=resolve.js.map