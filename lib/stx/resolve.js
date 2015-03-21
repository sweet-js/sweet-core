"use strict";

var assert10356 = require("assert"),
    Immutable10357 = require("immutable");
function sizeDecending10358(a10360, b10361) {
    if (a10360.scopeSet.size > b10361.scopeSet.size) {
        return -1;
    } else if (b10361.scopeSet.size > a10360.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10359(stx10362, phase10363) {
    assert10356(phase10363 !== undefined, "must pass in phase");
    var topScope10364 = stx10362.context.first();
    if (topScope10364) {
        var // get the bindings
        tokenBindings10365 = topScope10364.bindings.get(stx10362.token.value);
        if (tokenBindings10365) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10366 = tokenBindings10365.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10362.context;
                if (binding.phase !== phase10363) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10358)[0];
            if (biggestScopeSet10366) {
                if ( // simple case where the binding is a number we can
                // just append, otherwise it is actually a rename
                // transformer so we have to do another resolve
                typeof biggestScopeSet10366.binding === "number") {
                    return stx10362.token.value + biggestScopeSet10366.binding;
                }
                return resolve10359(biggestScopeSet10366.binding, phase10363);
            }
        }
    }
    return stx10362.token.value;
}
exports.resolve = resolve10359;
//# sourceMappingURL=resolve.js.map