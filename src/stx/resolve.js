#lang "../../macros/stxcase.js";
"use strict";

var assert = require("assert"),
    Immutable = require("immutable");


function sizeDecending(a, b) {
    if (a.scopeSet.size > b.scopeSet.size) {
        return -1;
    } else if (b.scopeSet.size > a.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}

function resolve(stx, phase) {
    assert(phase !== undefined, "must pass in phase");

    let topScope = stx.context.first();
    if (topScope) {
        // get the bindings
        let tokenBindings = topScope.bindings.get(stx.token.value);
        if (tokenBindings) {
            // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            let biggestScopeSet = tokenBindings.filter(binding => {
                let bindingScopes = binding.scopeSet;
                let stxScopes = stx.context;
                if (binding.phase !== phase) { return false; }
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending)[0];

            if (biggestScopeSet) {
                // simple case where the binding is a number we can
                // just append, otherwise it is actually a rename
                // transformer so we have to do another resolve
                if (typeof biggestScopeSet.binding === 'number') {
                    return stx.token.value + biggestScopeSet.binding;
                }
                return resolve(biggestScopeSet.binding, phase);
            }
        }
    }
    return stx.token.value;
}


exports.resolve = resolve;
