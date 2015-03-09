#lang "../../macros/stxcase.js";
"use strict";

var syn = require("../syntax"),
    assert = require("assert"),
    _ = require("underscore");

var Rename = syn.Rename;
var Mark = syn.Mark;
var Def = syn.Def;
var Imported = syn.Imported;


function remdup(mark, mlist) {
    if (mark === _.first(mlist)) {
        return _.rest(mlist, 1);
    }
    return [mark].concat(mlist);
}

// (CSyntax) -> [...Num]
function marksof(ctx, stopName) {
    while (ctx) {
        if (ctx.constructor === Mark) {
            return remdup(ctx.mark, marksof(ctx.context, stopName));
        }
        if(ctx.constructor === Def) {
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Rename) {
            if(stopName === ctx.name) {
                return [];
            }
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Imported) {
            ctx = ctx.context;
            continue;
        }
        assert(false, "Unknown context type");
    }
    return [];
}

function sizeDecending(a, b) {
    if (a.size > b.size) {
        return -1;
    } else if (b.size > a.size) {
        return 1;
    } else {
        return 0;
    }
}

function resolve(stx, phase) {
    assert(phase !== undefined, "must pass in phase");
    // the first scope is the most recently allocated and contains all of
    // the bindings
    let topScope = stx.context.first();
    if (topScope) {
        // get the bindings for this token value
        let tokenBindings = topScope.bindings.get(stx.token.value);
        if (tokenBindings) {
            // find all the bindings who's scope sets are a subset of the
            // scope set of the syntax being resolved and use the largest
            let biggestScopeSet = tokenBindings.filter(binding => {
                return binding.scopeSet.isSubset(stx.context);
            }).sort(sizeDecending).first();

            if (biggestScopeSet) {
                return stx.token.value + biggestScopeSet.binding;
            }
        }
    }
    return stx.token.value;
    // var nameInfo = {};
    // var name = resolveCtx(stx.token.value, stx.context, [], [], {}, phase, nameInfo);
    // name = typeof name === "string" ? name : stx.token.value + "$" + name;
    // if (nameInfo.type === "free") {
    //     return name;
    // } else if (nameInfo.type === "lexical") {
    //     return name;
    // } else if (nameInfo.type === "module") {
    //     return name + "_p" + phase;
    // } else {
    //     assert(false, "unknown name type: " + nameInfo.type);
    // }
}

// function resolve(stx, phase) {
//     assert(phase !== undefined, "must pass in phase");
//     var name = resolveCtx(stx.token.value, stx.context, [], [], {}, phase, {});
//     return typeof name === "string" ? name : stx.token.value + "$" + name;
// }

// This call memoizes intermediate results in the recursive invocation.
// The scope of the memo cache is the resolve() call, so that multiple
// resolve() calls don't walk all over each other, and memory used for
// the memoization can be garbage collected.
//
// The memoization addresses issue #232.
//
// It looks like the memoization uses only the context and doesn't look
// at originalName, stop_spine and stop_branch arguments. This is valid
// because whenever in every recursive call operates on a "deeper" or
// else a newly created context.  Therefore the collection of
// [originalName, stop_spine, stop_branch] can all be associated with a
// unique context. This argument is easier to see in a recursive
// rewrite of the resolveCtx function than with the while loop
// optimization - https://gist.github.com/srikumarks/9847260 - where the
// recursive steps always operate on a different context.
//
// This might make it seem that the resolution results can be stored on
// the context object itself, but that would not work in general
// because multiple resolve() calls will walk over each other's cache
// results, which fails tests. So the memoization uses only a context's
// unique instance numbers as the memoization key and is local to each
// resolve() call.
//
// With this memoization, the time complexity of the resolveCtx call is
// no longer exponential for the cases in issue #232.

function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo) {
    if (!ctx) {
        nameInfo.type = "free";
        return originalName;
    }
    var key = ctx.instNum;
    return cache[key] || (cache[key] = resolveCtxFull(originalName,
                                                      ctx,
                                                      stop_spine,
                                                      stop_branch,
                                                      cache,
                                                      phase,
                                                      nameInfo));
}

// (Syntax) -> String
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
                var idName  = resolveCtx(originalName,
                                         ctx.id.context,
                                         stop_branch,
                                         stop_branch,
                                         cache,
                                         0,
                                         nameInfo);
                var subName = resolveCtx(originalName,
                                         ctx.context,
                                         unionEl(stop_spine, ctx.def),
                                         stop_branch,
                                         cache,
                                         0,
                                         nameInfo);
                if (idName === subName) {
                    var idMarks  = marksof(ctx.id.context,
                                           ctx.name);
                    var subMarks = marksof(ctx.context,
                                           ctx.name);
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
    if(a.length !== b.length) {
        return false;
    }
    for(var i = 0; i < a.length; i++) {
        if(a[i] !== b[i]) {
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
exports.marksof = marksof;
exports.arraysEqual = arraysEqual;
