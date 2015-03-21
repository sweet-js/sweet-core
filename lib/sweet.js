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
path11158 = require("path"),
    fs11159 = require("fs"),
    resolveSync11160 = require("resolve/lib/sync"),
    gen11161 = require("escodegen"),
    _11162 = require("underscore"),
    parser11163 = require("./parser"),
    expander11164 = require("./expander"),
    syn11165 = require("./syntax"),
    babel11166 = require("babel"),
    escope11167 = require("escope");
var lib11233 = path11158.join(path11158.dirname(fs11159.realpathSync(__filename)), "../macros");
var stxcaseModule11234 = fs11159.readFileSync(lib11233 + "/stxcase.js", "utf8");
var moduleCache11235 = {};
var cwd11236 = process.cwd();
var requireModule11237 = function requireModule11237(id11250, filename11251) {
    var basedir11252 = filename11251 ? path11158.dirname(filename11251) : cwd11236;
    var key11253 = basedir11252 + id11250;
    if (!moduleCache11235[key11253]) {
        moduleCache11235[key11253] = require(resolveSync11160(id11250, { basedir: basedir11252 }));
    }
    return moduleCache11235[key11253];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11254, filename11255) {
    var content11256 = require("fs").readFileSync(filename11255, "utf8");
    module11254._compile(gen11161.generate(exports.parse(content11256, exports.loadedMacros)), filename11255);
};
function expandSyntax11238(stx11257, modules11258, options11259) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11164.expandModule(parser11163.read(stxcaseModule11234));
    }
    var isSyntax11260 = syn11165.isSyntax(stx11257);
    options11259 = options11259 || {};
    options11259.flatten = false;
    if (!isSyntax11260) {
        stx11257 = syn11165.tokensToSyntax(stx11257);
    }
    try {
        var result11261 = expander11164.expand(stx11257, [stxcaseCtx].concat(modules11258), options11259);
        return isSyntax11260 ? result11261 : syn11165.syntaxToTokens(result11261);
    } catch (err11262) {
        if (err11262 instanceof syn11165.MacroSyntaxError) {
            throw new SyntaxError(syn11165.printSyntaxError(source, err11262));
        } else {
            throw err11262;
        }
    }
}
function expand11239(code11263, options11264) {
    var toString11265 = String;
    if (typeof code11263 !== "string" && !(code11263 instanceof String)) {
        code11263 = toString11265(code11263);
    }
    var source11266 = code11263;
    if (source11266.length > 0) {
        if (typeof source11266[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11263 instanceof String) {
                source11266 = code11263.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11266[0] === "undefined") {
                source11266 = stringToArray(code11263);
            }
        }
    }
    if (source11266 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11266 = " ";
    }
    var tokenTree11267 = parser11163.read(source11266);
    try {
        return expander11164.compileModule(tokenTree11267, options11264);
    } catch (err11268) {
        if (err11268 instanceof syn11165.MacroSyntaxError) {
            throw new SyntaxError(syn11165.printSyntaxError(source11266, err11268));
        } else {
            throw err11268;
        }
    }
}
function parseExpanded11240(expanded11269, options11270) {
    return expanded11269.map(function (c11271) {
        var ast11272 = parser11163.parse(c11271.code);
        if (options11270.readableNames) {
            ast11272 = optimizeHygiene11247(ast11272);
        }
        return {
            path: c11271.path,
            code: ast11272
        };
    });
}
function parse11241(code11273, options11274) {
    options11274 = options11274 || {};
    var expanded11275 = expand11239(code11273, options11274);
    return parseExpanded11240(expanded11275, options11274);
}
function compile11242(code11276, options11277) {
    options11277 = options11277 || { compileSuffix: ".jsc" };
    var expanded11278 = expand11239(code11276, options11277);
    return parseExpanded11240(expanded11278, options11277).map(function (c11279) {
        var expandedOutput11280;
        return (function (c11281) {
            var output11282 = c11281;
            if (options11277.to5) {
                var babelOptions11283 = {
                    blacklist: ["es6.tailCall"],
                    // causing problems with enforest
                    compact: false
                };
                if (options11277.babelModules) {
                    babelOptions11283.modules = options11277.babelModules;
                }
                output11282 = babel11166.transform(c11281.code, babelOptions11283);
                return {
                    path: c11281.path,
                    code: output11282.code,
                    sourceMap: output11282.map
                };
            }
            return output11282;
        })((function (c11284) {
            if (options11277.sourceMap) {
                var output11285 = gen11161.generate(c11284.code, _11162.extend({
                    comment: true,
                    sourceMap: options11277.filename,
                    sourceMapWithCode: true
                }, options11277.escodegen));
                return {
                    path: c11284.path,
                    code: output11285.code,
                    sourceMap: output11285.map.toString()
                };
            }
            return {
                path: c11284.path,
                code: gen11161.generate(c11284.code, _11162.extend({ comment: true }, options11277.escodegen))
            };
        })(c11279));
    });
}
var baseReadtable11243 = Object.create({
    extend: function extend(obj11286) {
        var extended11287 = Object.create(this);
        Object.keys(obj11286).forEach(function (ch11288) {
            extended11287[ch11288] = obj11286[ch11288];
        });
        return extended11287;
    }
});
parser11163.setReadtable(baseReadtable11243, syn11165);
function setReadtable11244(readtableModule11289) {
    var filename11290 = resolveSync11160(readtableModule11289, { basedir: process.cwd() });
    var readtable11291 = require(filename11290);
    parser11163.setReadtable(require(filename11290));
}
function currentReadtable11245() {
    return parser11163.currentReadtable();
}
function loadNodeModule11246(root11292, moduleName11293, options11294) {
    options11294 = options11294 || {};
    if (moduleName11293[0] === ".") {
        moduleName11293 = path11158.resolve(root11292, moduleName11293);
    }
    var filename11295 = resolveSync11160(moduleName11293, {
        basedir: root11292,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11159.readFileSync(filename11295, "utf8"), undefined, {
        filename: moduleName11293,
        requireModule: options11294.requireModule || requireModule11237
    });
}
function optimizeHygiene11247(ast11296) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11297 = parse11241("(function(){})()")[0].code;
    wrapper11297.body[0].expression.callee.body.body = ast11296.body;
    function sansUnique11298(name11302) {
        var match11303 = name11302.match(/^(.+)\$[\d]+$/);
        return match11303 ? match11303[1] : null;
    }
    function wouldShadow11299(name11304, scope11305) {
        while (scope11305) {
            if (scope11305.scrubbed && scope11305.scrubbed.has(name11304)) {
                return scope11305.scrubbed.get(name11304);
            }
            scope11305 = scope11305.upper;
        }
        return 0;
    }
    var scopes11300 = escope11167.analyze(wrapper11297).scopes;
    var globalScope11301;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11300.forEach(function (scope11306) {
        scope11306.scrubbed = new expander11164.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11306.isStatic()) {
            globalScope11301 = scope11306;
            return;
        }
        scope11306.references.forEach(function (ref11307) {
            if (!ref11307.isStatic()) {
                globalScope11301.scrubbed.set(ref11307.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11300.forEach(function (scope11308) {
        if ( // No need to rename things in the global scope.
        !scope11308.isStatic()) {
            return;
        }
        scope11308.variables.forEach(function (variable11309) {
            var name11310 = sansUnique11298(variable11309.name);
            if (!name11310) {
                return;
            }
            var level11311 = wouldShadow11299(name11310, scope11308);
            if (level11311) {
                scope11308.scrubbed.set(name11310, level11311 + 1);
                name11310 = name11310 + "$" + (level11311 + 1);
            } else {
                scope11308.scrubbed.set(name11310, 1);
            }
            variable11309.identifiers.forEach(function (i11312) {
                i11312.name = name11310;
            });
            variable11309.references.forEach(function (r11313) {
                r11313.identifier.name = name11310;
            });
        });
    });
    return ast11296;
}
var loadedMacros11248 = [];
function loadMacro11249(relative_file11314) {
    loadedMacros11248.push(loadNodeModule11246(process.cwd(), relative_file11314));
}
exports.expand = expand11239;
exports.expandSyntax = expandSyntax11238;
exports.parse = parse11241;
exports.compile = compile11242;
exports.setReadtable = setReadtable11244;
exports.currentReadtable = currentReadtable11245;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11246;
exports.loadedMacros = loadedMacros11248;
exports.loadMacro = loadMacro11249;
//# sourceMappingURL=sweet.js.map