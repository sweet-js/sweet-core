"use strict";

var /*
    Copyright (C) 2012 Tim Disney <tim@disnet.me>
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
     * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
path11195 = require("path"),
    fs11196 = require("fs"),
    resolveSync11197 = require("resolve/lib/sync"),
    gen11198 = require("escodegen"),
    _11199 = require("underscore"),
    parser11200 = require("./parser"),
    expander11201 = require("./expander"),
    syn11202 = require("./syntax"),
    babel11203 = require("babel"),
    escope11204 = require("escope");
var lib11270 = path11195.join(path11195.dirname(fs11196.realpathSync(__filename)), "../macros");
var stxcaseModule11271 = fs11196.readFileSync(lib11270 + "/stxcase.js", "utf8");
var moduleCache11272 = {};
var cwd11273 = process.cwd();
var requireModule11274 = function requireModule11274(id11287, filename11288) {
    var basedir11289 = filename11288 ? path11195.dirname(filename11288) : cwd11273;
    var key11290 = basedir11289 + id11287;
    if (!moduleCache11272[key11290]) {
        moduleCache11272[key11290] = require(resolveSync11197(id11287, { basedir: basedir11289 }));
    }
    return moduleCache11272[key11290];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11291, filename11292) {
    var content11293 = require("fs").readFileSync(filename11292, "utf8");
    module11291._compile(gen11198.generate(exports.parse(content11293, exports.loadedMacros)), filename11292);
};
function expandSyntax11275(stx11294, modules11295, options11296) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11201.expandModule(parser11200.read(stxcaseModule11271));
    }
    var isSyntax11297 = syn11202.isSyntax(stx11294);
    options11296 = options11296 || {};
    options11296.flatten = false;
    if (!isSyntax11297) {
        stx11294 = syn11202.tokensToSyntax(stx11294);
    }
    try {
        var result11298 = expander11201.expand(stx11294, [stxcaseCtx].concat(modules11295), options11296);
        return isSyntax11297 ? result11298 : syn11202.syntaxToTokens(result11298);
    } catch (err11299) {
        if (err11299 instanceof syn11202.MacroSyntaxError) {
            throw new SyntaxError(syn11202.printSyntaxError(source, err11299));
        } else {
            throw err11299;
        }
    }
}
function expand11276(code11300, options11301) {
    var toString11302 = String;
    if (typeof code11300 !== "string" && !(code11300 instanceof String)) {
        code11300 = toString11302(code11300);
    }
    var source11303 = code11300;
    if (source11303.length > 0) {
        if (typeof source11303[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11300 instanceof String) {
                source11303 = code11300.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11303[0] === "undefined") {
                source11303 = stringToArray(code11300);
            }
        }
    }
    if (source11303 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11303 = " ";
    }
    var tokenTree11304 = parser11200.read(source11303);
    try {
        return expander11201.compileModule(tokenTree11304, options11301);
    } catch (err11305) {
        if (err11305 instanceof syn11202.MacroSyntaxError) {
            throw new SyntaxError(syn11202.printSyntaxError(source11303, err11305));
        } else {
            throw err11305;
        }
    }
}
function parseExpanded11277(expanded11306, options11307) {
    return expanded11306.map(function (c11308) {
        var ast11309 = parser11200.parse(c11308.code);
        if (options11307.readableNames) {
            ast11309 = optimizeHygiene11284(ast11309);
        }
        return {
            path: c11308.path,
            code: ast11309
        };
    });
}
function parse11278(code11310, options11311) {
    options11311 = options11311 || {};
    var expanded11312 = expand11276(code11310, options11311);
    return parseExpanded11277(expanded11312, options11311);
}
function compile11279(code11313, options11314) {
    options11314 = options11314 || { compileSuffix: ".jsc" };
    var expanded11315 = expand11276(code11313, options11314);
    return parseExpanded11277(expanded11315, options11314).map(function (c11316) {
        var expandedOutput11317;
        return (function (c11318) {
            var output11319 = c11318;
            if (options11314.to5) {
                output11319 = babel11203.transform(c11318.code, {
                    blacklist: ["es6.tailCall"],
                    compact: false
                });
                return {
                    code: output11319.code,
                    sourceMap: output11319.map
                };
            }
            return output11319;
        })((function (c11320) {
            if (options11314.sourceMap) {
                var output11321 = gen11198.generate(c11320.code, _11199.extend({
                    comment: true,
                    sourceMap: options11314.filename,
                    sourceMapWithCode: true
                }, options11314.escodegen));
                return {
                    path: c11320.path,
                    code: output11321.code,
                    sourceMap: output11321.map.toString()
                };
            }
            return {
                path: c11320.path,
                code: gen11198.generate(c11320.code, _11199.extend({ comment: true }, options11314.escodegen))
            };
        })(c11316));
    });
}
var baseReadtable11280 = Object.create({
    extend: function extend(obj11322) {
        var extended11323 = Object.create(this);
        Object.keys(obj11322).forEach(function (ch11324) {
            extended11323[ch11324] = obj11322[ch11324];
        });
        return extended11323;
    }
});
parser11200.setReadtable(baseReadtable11280, syn11202);
function setReadtable11281(readtableModule11325) {
    var filename11326 = resolveSync11197(readtableModule11325, { basedir: process.cwd() });
    var readtable11327 = require(filename11326);
    parser11200.setReadtable(require(filename11326));
}
function currentReadtable11282() {
    return parser11200.currentReadtable();
}
function loadNodeModule11283(root11328, moduleName11329, options11330) {
    options11330 = options11330 || {};
    if (moduleName11329[0] === ".") {
        moduleName11329 = path11195.resolve(root11328, moduleName11329);
    }
    var filename11331 = resolveSync11197(moduleName11329, {
        basedir: root11328,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11196.readFileSync(filename11331, "utf8"), undefined, {
        filename: moduleName11329,
        requireModule: options11330.requireModule || requireModule11274
    });
}
function optimizeHygiene11284(ast11332) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11333 = parse11278("(function(){})()")[0].code;
    wrapper11333.body[0].expression.callee.body.body = ast11332.body;
    function sansUnique11334(name11338) {
        var match11339 = name11338.match(/^(.+)\$[\d]+$/);
        return match11339 ? match11339[1] : null;
    }
    function wouldShadow11335(name11340, scope11341) {
        while (scope11341) {
            if (scope11341.scrubbed && scope11341.scrubbed.has(name11340)) {
                return scope11341.scrubbed.get(name11340);
            }
            scope11341 = scope11341.upper;
        }
        return 0;
    }
    var scopes11336 = escope11204.analyze(wrapper11333).scopes;
    var globalScope11337;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11336.forEach(function (scope11342) {
        scope11342.scrubbed = new expander11201.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11342.isStatic()) {
            globalScope11337 = scope11342;
            return;
        }
        scope11342.references.forEach(function (ref11343) {
            if (!ref11343.isStatic()) {
                globalScope11337.scrubbed.set(ref11343.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11336.forEach(function (scope11344) {
        if ( // No need to rename things in the global scope.
        !scope11344.isStatic()) {
            return;
        }
        scope11344.variables.forEach(function (variable11345) {
            var name11346 = sansUnique11334(variable11345.name);
            if (!name11346) {
                return;
            }
            var level11347 = wouldShadow11335(name11346, scope11344);
            if (level11347) {
                scope11344.scrubbed.set(name11346, level11347 + 1);
                name11346 = name11346 + "$" + (level11347 + 1);
            } else {
                scope11344.scrubbed.set(name11346, 1);
            }
            variable11345.identifiers.forEach(function (i11348) {
                i11348.name = name11346;
            });
            variable11345.references.forEach(function (r11349) {
                r11349.identifier.name = name11346;
            });
        });
    });
    return ast11332;
}
var loadedMacros11285 = [];
function loadMacro11286(relative_file11350) {
    loadedMacros11285.push(loadNodeModule11283(process.cwd(), relative_file11350));
}
exports.expand = expand11276;
exports.expandSyntax = expandSyntax11275;
exports.parse = parse11278;
exports.compile = compile11279;
exports.setReadtable = setReadtable11281;
exports.currentReadtable = currentReadtable11282;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11283;
exports.loadedMacros = loadedMacros11285;
exports.loadMacro = loadMacro11286;
//# sourceMappingURL=sweet.js.map