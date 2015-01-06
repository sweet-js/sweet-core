'use strict';
var syn = require('../syntax'), assert = require('assert'), _ = require('underscore');
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
function marksof(ctx, stopName) {
    while (ctx) {
        if (ctx.constructor === Mark) {
            return remdup(ctx.mark, marksof(ctx.context, stopName));
        }
        if (ctx.constructor === Def) {
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Rename) {
            if (stopName === ctx.name) {
                return [];
            }
            ctx = ctx.context;
            continue;
        }
        if (ctx.constructor === Imported) {
            ctx = ctx.context;
            continue;
        }
        assert(false, 'Unknown context type');
    }
    return [];
}
function resolve(stx, phase) {
    assert(phase !== undefined, 'must pass in phase');
    var nameInfo = {};
    var name = resolveCtx(stx.token.value, stx.context, [], [], {}, phase, nameInfo);
    name = typeof name === 'string' ? name : stx.token.value + '$' + name;
    if (nameInfo.type === 'free') {
        return name;
    } else if (nameInfo.type === 'lexical') {
        return name;
    } else if (nameInfo.type === 'module') {
        return name + '_p' + phase;
    } else {
        assert(false, 'unknown name type: ' + nameInfo.type);
    }
}
function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo) {
    if (!ctx) {
        nameInfo.type = 'free';
        return originalName;
    }
    var key = ctx.instNum;
    return cache[key] || (cache[key] = resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo));
}
function resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache, phase, nameInfo) {
    while (true) {
        if (!ctx) {
            nameInfo.type = 'free';
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
                        nameInfo.type = 'lexical';
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
                    nameInfo.type = 'module';
                    nameInfo.mod = ctx.mod;
                    nameInfo.phase = ctx.phase;
                    return originalName;
                }
            }
            ctx = ctx.context;
            continue;
        }
        assert(false, 'Unknown context type');
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
exports.marksof = marksof;
exports.arraysEqual = arraysEqual;
//# sourceMappingURL=resolve.js.map