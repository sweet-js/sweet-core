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
path11161 = require("path"),
    fs11162 = require("fs"),
    resolveSync11163 = require("resolve/lib/sync"),
    gen11164 = require("escodegen"),
    _11165 = require("underscore"),
    parser11166 = require("./parser"),
    expander11167 = require("./expander"),
    syn11168 = require("./syntax"),
    babel11169 = require("babel"),
    escope11170 = require("escope");
var lib11236 = path11161.join(path11161.dirname(fs11162.realpathSync(__filename)), "../macros");
var stxcaseModule11237 = fs11162.readFileSync(lib11236 + "/stxcase.js", "utf8");
var moduleCache11238 = {};
var cwd11239 = process.cwd();
var requireModule11240 = function requireModule11240(id11253, filename11254) {
    var basedir11255 = filename11254 ? path11161.dirname(filename11254) : cwd11239;
    var key11256 = basedir11255 + id11253;
    if (!moduleCache11238[key11256]) {
        moduleCache11238[key11256] = require(resolveSync11163(id11253, { basedir: basedir11255 }));
    }
    return moduleCache11238[key11256];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11257, filename11258) {
    var content11259 = require("fs").readFileSync(filename11258, "utf8");
    module11257._compile(gen11164.generate(exports.parse(content11259, exports.loadedMacros)), filename11258);
};
function expandSyntax11241(stx11260, modules11261, options11262) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11167.expandModule(parser11166.read(stxcaseModule11237));
    }
    var isSyntax11263 = syn11168.isSyntax(stx11260);
    options11262 = options11262 || {};
    options11262.flatten = false;
    if (!isSyntax11263) {
        stx11260 = syn11168.tokensToSyntax(stx11260);
    }
    try {
        var result11264 = expander11167.expand(stx11260, [stxcaseCtx].concat(modules11261), options11262);
        return isSyntax11263 ? result11264 : syn11168.syntaxToTokens(result11264);
    } catch (err11265) {
        if (err11265 instanceof syn11168.MacroSyntaxError) {
            throw new SyntaxError(syn11168.printSyntaxError(source, err11265));
        } else {
            throw err11265;
        }
    }
}
function expand11242(code11266, options11267) {
    var toString11268 = String;
    if (typeof code11266 !== "string" && !(code11266 instanceof String)) {
        code11266 = toString11268(code11266);
    }
    var source11269 = code11266;
    if (source11269.length > 0) {
        if (typeof source11269[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11266 instanceof String) {
                source11269 = code11266.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11269[0] === "undefined") {
                source11269 = stringToArray(code11266);
            }
        }
    }
    if (source11269 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11269 = " ";
    }
    var tokenTree11270 = parser11166.read(source11269);
    try {
        return expander11167.compileModule(tokenTree11270, options11267);
    } catch (err11271) {
        if (err11271 instanceof syn11168.MacroSyntaxError) {
            throw new SyntaxError(syn11168.printSyntaxError(source11269, err11271));
        } else {
            throw err11271;
        }
    }
}
function parseExpanded11243(expanded11272, options11273) {
    return expanded11272.map(function (c11274) {
        var ast11275 = parser11166.parse(c11274.code);
        if (options11273.readableNames) {
            ast11275 = optimizeHygiene11250(ast11275);
        }
        return {
            path: c11274.path,
            code: ast11275
        };
    });
}
function parse11244(code11276, options11277) {
    options11277 = options11277 || {};
    var expanded11278 = expand11242(code11276, options11277);
    return parseExpanded11243(expanded11278, options11277);
}
function compile11245(code11279, options11280) {
    options11280 = options11280 || { compileSuffix: ".jsc" };
    var expanded11281 = expand11242(code11279, options11280);
    return parseExpanded11243(expanded11281, options11280).map(function (c11282) {
        var expandedOutput11283;
        return (function (c11284) {
            var output11285 = c11284;
            if (options11280.to5) {
                output11285 = babel11169.transform(c11284.code, {
                    blacklist: ["es6.tailCall"],
                    compact: false
                });
                return {
                    code: output11285.code,
                    sourceMap: output11285.map
                };
            }
            return output11285;
        })((function (c11286) {
            if (options11280.sourceMap) {
                var output11287 = gen11164.generate(c11286.code, _11165.extend({
                    comment: true,
                    sourceMap: options11280.filename,
                    sourceMapWithCode: true
                }, options11280.escodegen));
                return {
                    path: c11286.path,
                    code: output11287.code,
                    sourceMap: output11287.map.toString()
                };
            }
            return {
                path: c11286.path,
                code: gen11164.generate(c11286.code, _11165.extend({ comment: true }, options11280.escodegen))
            };
        })(c11282));
    });
}
var baseReadtable11246 = Object.create({
    extend: function extend(obj11288) {
        var extended11289 = Object.create(this);
        Object.keys(obj11288).forEach(function (ch11290) {
            extended11289[ch11290] = obj11288[ch11290];
        });
        return extended11289;
    }
});
parser11166.setReadtable(baseReadtable11246, syn11168);
function setReadtable11247(readtableModule11291) {
    var filename11292 = resolveSync11163(readtableModule11291, { basedir: process.cwd() });
    var readtable11293 = require(filename11292);
    parser11166.setReadtable(require(filename11292));
}
function currentReadtable11248() {
    return parser11166.currentReadtable();
}
function loadNodeModule11249(root11294, moduleName11295, options11296) {
    options11296 = options11296 || {};
    if (moduleName11295[0] === ".") {
        moduleName11295 = path11161.resolve(root11294, moduleName11295);
    }
    var filename11297 = resolveSync11163(moduleName11295, {
        basedir: root11294,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11162.readFileSync(filename11297, "utf8"), undefined, {
        filename: moduleName11295,
        requireModule: options11296.requireModule || requireModule11240
    });
}
function optimizeHygiene11250(ast11298) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11299 = parse11244("(function(){})()")[0].code;
    wrapper11299.body[0].expression.callee.body.body = ast11298.body;
    function sansUnique11300(name11304) {
        var match11305 = name11304.match(/^(.+)\$[\d]+$/);
        return match11305 ? match11305[1] : null;
    }
    function wouldShadow11301(name11306, scope11307) {
        while (scope11307) {
            if (scope11307.scrubbed && scope11307.scrubbed.has(name11306)) {
                return scope11307.scrubbed.get(name11306);
            }
            scope11307 = scope11307.upper;
        }
        return 0;
    }
    var scopes11302 = escope11170.analyze(wrapper11299).scopes;
    var globalScope11303;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11302.forEach(function (scope11308) {
        scope11308.scrubbed = new expander11167.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11308.isStatic()) {
            globalScope11303 = scope11308;
            return;
        }
        scope11308.references.forEach(function (ref11309) {
            if (!ref11309.isStatic()) {
                globalScope11303.scrubbed.set(ref11309.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11302.forEach(function (scope11310) {
        if ( // No need to rename things in the global scope.
        !scope11310.isStatic()) {
            return;
        }
        scope11310.variables.forEach(function (variable11311) {
            var name11312 = sansUnique11300(variable11311.name);
            if (!name11312) {
                return;
            }
            var level11313 = wouldShadow11301(name11312, scope11310);
            if (level11313) {
                scope11310.scrubbed.set(name11312, level11313 + 1);
                name11312 = name11312 + "$" + (level11313 + 1);
            } else {
                scope11310.scrubbed.set(name11312, 1);
            }
            variable11311.identifiers.forEach(function (i11314) {
                i11314.name = name11312;
            });
            variable11311.references.forEach(function (r11315) {
                r11315.identifier.name = name11312;
            });
        });
    });
    return ast11298;
}
var loadedMacros11251 = [];
function loadMacro11252(relative_file11316) {
    loadedMacros11251.push(loadNodeModule11249(process.cwd(), relative_file11316));
}
exports.expand = expand11242;
exports.expandSyntax = expandSyntax11241;
exports.parse = parse11244;
exports.compile = compile11245;
exports.setReadtable = setReadtable11247;
exports.currentReadtable = currentReadtable11248;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11249;
exports.loadedMacros = loadedMacros11251;
exports.loadMacro = loadMacro11252;
//# sourceMappingURL=sweet.js.map