"use strict";

var assert10359 = require("assert"),
    Immutable10360 = require("immutable");
function sizeDecending10361(a10363, b10364) {
    if (a10363.scopeSet.size > b10364.scopeSet.size) {
        return -1;
    } else if (b10364.scopeSet.size > a10363.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10362(stx10365, phase10366) {
    assert10359(phase10366 !== undefined, "must pass in phase");
    var topScope10367 = stx10365.context.first();
    if (topScope10367) {
        var // get the bindings
        tokenBindings10368 = topScope10367.bindings.get(stx10365.token.value);
        if (tokenBindings10368) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10369 = tokenBindings10368.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10365.context;
                if (binding.phase !== phase10366) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10361)[0];
            if (biggestScopeSet10369) {
                if (typeof biggestScopeSet10369.binding === "number") {
                    return stx10365.token.value + biggestScopeSet10369.binding;
                }
                return resolve10362(biggestScopeSet10369.binding, phase10366);
            }
        }
    }
    return stx10365.token.value;
}
exports.resolve = resolve10362;
//# sourceMappingURL=resolve.js.map