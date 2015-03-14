"use strict";

var syn9902 = require("../syntax"),
    assert9903 = require("assert"),
    Immutable9904 = require("immutable"),
    _9905 = require("underscore");
var Rename9906 = syn9902.Rename;
var Mark9907 = syn9902.Mark;
var Def9908 = syn9902.Def;
var Imported9909 = syn9902.Imported;
function sizeDecending9910(a9917, b9918) {
    if (a9917.scopeSet.size > b9918.scopeSet.size) {
        return -1;
    } else if (b9918.scopeSet.size > a9917.scopeSet.size) {
        return 1;
    } else {
        return 0;
    }
}
function resolve9911(stx9919, phase9920) {
    assert9903(phase9920 !== undefined, "must pass in phase");
    var // the first scope is the most recently allocated and contains all of
    // the bindings
    topScope9921 = stx9919.context.first();
    if (topScope9921) {
        var // get the bindings
        tokenBindings9922 = topScope9921.bindings.get(stx9919.token.value);
        if (tokenBindings9922) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet9923 = tokenBindings9922.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx9919.context;
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending9910)[0];
            if (biggestScopeSet9923) {
                return stx9919.token.value + biggestScopeSet9923.binding;
            }
        }
    }
    return stx9919.token.value;
}
function resolveCtx9912(originalName9924, ctx9925, stop_spine9926, stop_branch9927, cache9928, phase9929, nameInfo9930) {
    if (!ctx9925) {
        nameInfo9930.type = "free";
        return originalName9924;
    }
    var key9931 = ctx9925.instNum;
    return cache9928[key9931] || (cache9928[key9931] = resolveCtxFull9913(originalName9924, ctx9925, stop_spine9926, stop_branch9927, cache9928, phase9929, nameInfo9930));
}
function resolveCtxFull9913(originalName9932, ctx9933, stop_spine9934, stop_branch9935, cache9936, phase9937, nameInfo9938) {
    while (true) {
        if (!ctx9933) {
            nameInfo9938.type = "free";
            return originalName9932;
        }
        if (ctx9933.constructor === Mark9907) {
            ctx9933 = ctx9933.context;
            continue;
        }
        if (ctx9933.constructor === Def9908) {
            if (stop_spine9934.indexOf(ctx9933.defctx) !== -1) {
                ctx9933 = ctx9933.context;
                continue;
            } else {
                stop_branch9935 = unionEl9916(stop_branch9935, ctx9933.defctx);
                ctx9933 = renames9915(ctx9933.defctx, ctx9933.context, originalName9932);
                continue;
            }
        }
        if (ctx9933.constructor === Rename9906) {
            if (originalName9932 === ctx9933.id.token.value) {
                var idName9939 = resolveCtx9912(originalName9932, ctx9933.id.context, stop_branch9935, stop_branch9935, cache9936, 0, nameInfo9938);
                var subName9940 = resolveCtx9912(originalName9932, ctx9933.context, unionEl9916(stop_spine9934, ctx9933.def), stop_branch9935, cache9936, 0, nameInfo9938);
                if (idName9939 === subName9940) {
                    var idMarks9941 = marksof(ctx9933.id.context, ctx9933.name);
                    var subMarks9942 = marksof(ctx9933.context, ctx9933.name);
                    if (arraysEqual9914(idMarks9941, subMarks9942)) {
                        nameInfo9938.type = "lexical";
                        nameInfo9938.phase = ctx9933.phase;
                        return ctx9933.name;
                    }
                }
            }
            ctx9933 = ctx9933.context;
            continue;
        }
        if (ctx9933.constructor === Imported9909) {
            if (phase9937 === ctx9933.phase) {
                if (originalName9932 === ctx9933.localName.token.value) {
                    nameInfo9938.type = "module";
                    nameInfo9938.mod = ctx9933.mod;
                    nameInfo9938.phase = ctx9933.phase;
                    return originalName9932;
                }
            }
            ctx9933 = ctx9933.context;
            continue;
        }
        assert9903(false, "Unknown context type");
    }
}
function arraysEqual9914(a9943, b9944) {
    if (a9943.length !== b9944.length) {
        return false;
    }
    for (var i9945 = 0; i9945 < a9943.length; i9945++) {
        if (a9943[i9945] !== b9944[i9945]) {
            return false;
        }
    }
    return true;
}
function renames9915(defctx9946, oldctx9947, originalName9948) {
    var acc9949 = oldctx9947;
    for (var i9950 = 0; i9950 < defctx9946.length; i9950++) {
        if (defctx9946[i9950].id.token.value === originalName9948) {
            acc9949 = new Rename9906(defctx9946[i9950].id, defctx9946[i9950].name, acc9949, defctx9946);
        }
    }
    return acc9949;
}
function unionEl9916(arr9951, el9952) {
    if (arr9951.indexOf(el9952) === -1) {
        var res9953 = arr9951.slice(0);
        res9953.push(el9952);
        return res9953;
    }
    return arr9951;
}
exports.resolve = resolve9911;
// exports.marksof = marksof;
exports.arraysEqual = arraysEqual9914;
//# sourceMappingURL=resolve.js.map