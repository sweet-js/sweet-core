"use strict";

var assert10121 = require("assert"),
    Immutable10122 = require("immutable");
function sizeDecending10123(a10125, b10126) {
    if (a10125.scopeSet.size > b10126.scopeSet.size) {
        return -1;
    } else if (b10126.scopeSet.size > a10125.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve10124(stx10127, phase10128) {
    assert10121(phase10128 !== undefined, "must pass in phase");
    var topScope10129 = stx10127.context.first();
    if (topScope10129) {
        var // get the bindings
        tokenBindings10130 = topScope10129.bindings.get(stx10127.token.value);
        if (tokenBindings10130) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet10131 = tokenBindings10130.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx10127.context;
                if (binding.phase !== phase10128) {
                    return false;
                }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending10123)[0];
            if (biggestScopeSet10131) {
                if ( // simple case where the binding is a number we can
                // just append, otherwise it is actually a rename
                // transformer so we have to do another resolve
                typeof biggestScopeSet10131.binding === "number") {
                    return stx10127.token.value + biggestScopeSet10131.binding;
                }
                return resolve10124(biggestScopeSet10131.binding, phase10128);
            }
        }
    }
    return stx10127.token.value;
}
exports.resolve = resolve10124;
//# sourceMappingURL=resolve.js.map