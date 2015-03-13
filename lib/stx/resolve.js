"use strict";

var syn = require("../syntax"),
    assert = require("assert"),
    Immutable = require("immutable"),
    _ = require("underscore");
var Rename = syn.Rename;
var Mark = syn.Mark;
var Def = syn.Def;
var Imported = syn.Imported;
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
    var // the first scope is the most recently allocated and contains all of
    // the bindings
    topScope = stx.context.first();
    if (topScope) {
        var // get the bindings
        tokenBindings = topScope.bindings.get(stx.token.value);
        if (tokenBindings) {
            var // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            biggestScopeSet = tokenBindings.filter(function (binding) {
                var bindingScopes = binding.scopeSet;
                var stxScopes = stx.context;
                return bindingScopes.isSubset(stxScopes);
            }).sort(sizeDecending)[0];
            if (biggestScopeSet) {
                return stx.token.value + biggestScopeSet.binding;
            }
        }
    }
    return stx.token.value;
}
function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo) {
    if (!ctx) {
        nameInfo.type = "free";
        return originalName;
    }
    var key = ctx.instNum;
    return cache[key] || (cache[key] = resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo));
}
function resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo) {
    while (true) {
        if (!ctx) {
            nameInfo.type = "free";
            return originalName;
        }
        if (ctx.constructor === Mark) {
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Def) {
            if (stop_spine.indexOf(ctx.defctx) !== -1) {
                ctx = ctx.context;
                continue;
            } else {
                stop_branch = unionEl(stop_branch, ctx.defctx);
                ctx = renames(ctx.defctx, ctx.context, originalName);
                continue;
            }
        }
        if (ctx.constructor === Rename) {
            if (originalName === ctx.id.token.value) {
                var idName = resolveCtx(originalName, ctx.id.context, stop_branch, stop_branch, cache, 0, nameInfo);
                var subName = resolveCtx(originalName, ctx.context, unionEl(stop_spine, ctx.def), stop_branch, cache, 0, nameInfo);
                if (idName === subName) {
                    var idMarks = marksof(ctx.id.context, ctx.name);
                    var subMarks = marksof(ctx.context, ctx.name);
                    if (arraysEqual(idMarks, subMarks)) {
                        nameInfo.type = "lexical";
                        nameInfo.phase = ctx.phase;
                        return ctx.name;
                    }
                }
            }
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Imported) {
            if (phase === ctx.phase) {
                if (originalName === ctx.localName.token.value) {
                    nameInfo.type = "module";
                    nameInfo.mod = ctx.mod;
                    nameInfo.phase = ctx.phase;
                    return originalName;
                }
            }
            ctx = ctx.context;
            continue;
        }
        assert(false, "Unknown context type");
    }
}
function arraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function renames(defctx, oldctx, originalName) {
    var acc = oldctx;
    for (var i = 0; i < defctx.length; i++) {
        if (defctx[i].id.token.value === originalName) {
            acc = new Rename(defctx[i].id, defctx[i].name, acc, defctx);
        }
    }
    return acc;
}
function unionEl(arr, el) {
    if (arr.indexOf(el) === -1) {
        var res = arr.slice(0);
        res.push(el);
        return res;
    }
    return arr;
}
exports.resolve = resolve;
// exports.marksof = marksof;
exports.arraysEqual = arraysEqual;
//# sourceMappingURL=resolve.js.map