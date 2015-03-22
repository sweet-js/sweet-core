"use strict";

var assert10325 = require("assert"),
    Immutable10326 = require("immutable");
function sizeDecending10327(a10329, b10330) {
    if (a10329.scopeSet.size > b10330.scopeSet.size) {
        return -1;
    } else if (b10330.scopeSet.size > a10329.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10328(stx10331, phase10332) {
    assert10325(phase10332 !== undefined, "must pass in phase");
    var topScope10333 = stx10331.context.first();
    if (topScope10333) {
        var // get the bindings
        tokenBindings10334 = topScope10333.bindings.get(stx10331.token.value);
        if (tokenBindings10334) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10335 = tokenBindings10334.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10331.context;
                if (binding.phase !== phase10332) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10327)[0];
            if (biggestScopeSet10335) {
                if ( // simple case where the binding is a number we can
                // just append, otherwise it is actually a rename
                // transformer so we have to do another resolve
                typeof biggestScopeSet10335.binding === "number") {
                    return stx10331.token.value + biggestScopeSet10335.binding;
                }
                return resolve10328(biggestScopeSet10335.binding, phase10332);
            }
        }
    }
    return stx10331.token.value;
}
exports.resolve = resolve10328;
//# sourceMappingURL=resolve.js.map