"use strict";

var path11127 = require("path"),
    fs11128 = require("fs"),
    resolveSync11129 = require("resolve/lib/sync"),
    gen11130 = require("escodegen"),
    _11131 = require("underscore"),
    parser11132 = require("./parser"),
    expander11133 = require("./expander"),
    syn11134 = require("./syntax"),
    babel11135 = require("babel"),
    escope11136 = require("escope");
var lib11202 = path11127.join(path11127.dirname(fs11128.realpathSync(__filename)), "../macros");
var stxcaseModule11203 = fs11128.readFileSync(lib11202 + "/stxcase.js", "utf8");
var moduleCache11204 = {};
var cwd11205 = process.cwd();
var requireModule11206 = function requireModule11206(id11219, filename11220) {
    var basedir11221 = filename11220 ? path11127.dirname(filename11220) : cwd11205;
    var key11222 = basedir11221 + id11219;
    if (!moduleCache11204[key11222]) {
        moduleCache11204[key11222] = require(resolveSync11129(id11219, { basedir: basedir11221 }));
    }
    return moduleCache11204[key11222];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11223, filename11224) {
    var content11225 = require("fs").readFileSync(filename11224, "utf8");
    module11223._compile(gen11130.generate(exports.parse(content11225, exports.loadedMacros)), filename11224);
};
function expandSyntax11207(stx11226, modules11227, options11228) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11133.expandModule(parser11132.read(stxcaseModule11203));
    }
    var isSyntax11229 = syn11134.isSyntax(stx11226);
    options11228 = options11228 || {};
    options11228.flatten = false;
    if (!isSyntax11229) {
        stx11226 = syn11134.tokensToSyntax(stx11226);
    }
    try {
        var result11230 = expander11133.expand(stx11226, [stxcaseCtx].concat(modules11227), options11228);
        return isSyntax11229 ? result11230 : syn11134.syntaxToTokens(result11230);
    } catch (err11231) {
        if (err11231 instanceof syn11134.MacroSyntaxError) {
            throw new SyntaxError(syn11134.printSyntaxError(source, err11231));
        } else {
            throw err11231;
        }
    }
}
function expand11208(code11232, options11233) {
    var toString11234 = String;
    if (typeof code11232 !== "string" && !(code11232 instanceof String)) {
        code11232 = toString11234(code11232);
    }
    var source11235 = code11232;
    if (source11235.length > 0) {
        if (typeof source11235[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11232 instanceof String) {
                source11235 = code11232.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11235[0] === "undefined") {
                source11235 = stringToArray(code11232);
            }
        }
    }
    if (source11235 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11235 = " ";
    }
    var tokenTree11236 = parser11132.read(source11235);
    try {
        return expander11133.compileModule(tokenTree11236, options11233);
    } catch (err11237) {
        if (err11237 instanceof syn11134.MacroSyntaxError) {
            throw new SyntaxError(syn11134.printSyntaxError(source11235, err11237));
        } else {
            throw err11237;
        }
    }
}
function parseExpanded11209(expanded11238, options11239) {
    return expanded11238.map(function (c11240) {
        var ast11241 = parser11132.parse(c11240.code);
        if (options11239.readableNames) {
            ast11241 = optimizeHygiene11216(ast11241);
        }
        return {
            path: c11240.path,
            code: ast11241
        };
    });
}
function parse11210(code11242, options11243) {
    options11243 = options11243 || {};
    var expanded11244 = expand11208(code11242, options11243);
    return parseExpanded11209(expanded11244, options11243);
}
function compile11211(code11245, options11246) {
    options11246 = options11246 || { compileSuffix: ".jsc" };
    var expanded11247 = expand11208(code11245, options11246);
    return parseExpanded11209(expanded11247, options11246).map(function (c11248) {
        var expandedOutput11249;
        return (function (c11250) {
            var output11251 = c11250;
            if (options11246.babel) {
                var babelOptions11252 = {
                    blacklist: ["es6.tailCall"],
                    // causing problems with enforest
                    compact: false
                };
                if (options11246.babelModules) {
                    babelOptions11252.modules = options11246.babelModules;
                }
                output11251 = babel11135.transform(c11250.code, babelOptions11252);
                return {
                    path: c11250.path,
                    code: output11251.code,
                    sourceMap: output11251.map
                };
            }
            return output11251;
        })((function (c11253) {
            if (options11246.sourceMap) {
                var output11254 = gen11130.generate(c11253.code, _11131.extend({
                    comment: true,
                    sourceMap: options11246.filename,
                    sourceMapWithCode: true
                }, options11246.escodegen));
                return {
                    path: c11253.path,
                    code: output11254.code,
                    sourceMap: output11254.map.toString()
                };
            }
            return {
                path: c11253.path,
                code: gen11130.generate(c11253.code, _11131.extend({ comment: true }, options11246.escodegen))
            };
        })(c11248));
    });
}
var baseReadtable11212 = Object.create({
    extend: function extend(obj11255) {
        var extended11256 = Object.create(this);
        Object.keys(obj11255).forEach(function (ch11257) {
            extended11256[ch11257] = obj11255[ch11257];
        });
        return extended11256;
    }
});
parser11132.setReadtable(baseReadtable11212, syn11134);
function setReadtable11213(readtableModule11258) {
    var filename11259 = resolveSync11129(readtableModule11258, { basedir: process.cwd() });
    var readtable11260 = require(filename11259);
    parser11132.setReadtable(require(filename11259));
}
function currentReadtable11214() {
    return parser11132.currentReadtable();
}
function loadNodeModule11215(root11261, moduleName11262, options11263) {
    options11263 = options11263 || {};
    if (moduleName11262[0] === ".") {
        moduleName11262 = path11127.resolve(root11261, moduleName11262);
    }
    var filename11264 = resolveSync11129(moduleName11262, {
        basedir: root11261,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11128.readFileSync(filename11264, "utf8"), undefined, {
        filename: moduleName11262,
        requireModule: options11263.requireModule || requireModule11206
    });
}
function optimizeHygiene11216(ast11265) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11266 = parse11210("(function(){})()")[0].code;
    wrapper11266.body[0].expression.callee.body.body = ast11265.body;
    function sansUnique11267(name11271) {
        var match11272 = name11271.match(/^(.+)\$[\d]+$/);
        return match11272 ? match11272[1] : null;
    }
    function wouldShadow11268(name11273, scope11274) {
        while (scope11274) {
            if (scope11274.scrubbed && scope11274.scrubbed.has(name11273)) {
                return scope11274.scrubbed.get(name11273);
            }
            scope11274 = scope11274.upper;
        }
        return 0;
    }
    var scopes11269 = escope11136.analyze(wrapper11266).scopes;
    var globalScope11270;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11269.forEach(function (scope11275) {
        scope11275.scrubbed = new expander11133.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11275.isStatic()) {
            globalScope11270 = scope11275;
            return;
        }
        scope11275.references.forEach(function (ref11276) {
            if (!ref11276.isStatic()) {
                globalScope11270.scrubbed.set(ref11276.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11269.forEach(function (scope11277) {
        if ( // No need to rename things in the global scope.
        !scope11277.isStatic()) {
            return;
        }
        scope11277.variables.forEach(function (variable11278) {
            var name11279 = sansUnique11267(variable11278.name);
            if (!name11279) {
                return;
            }
            var level11280 = wouldShadow11268(name11279, scope11277);
            if (level11280) {
                scope11277.scrubbed.set(name11279, level11280 + 1);
                name11279 = name11279 + "$" + (level11280 + 1);
            } else {
                scope11277.scrubbed.set(name11279, 1);
            }
            variable11278.identifiers.forEach(function (i11281) {
                i11281.name = name11279;
            });
            variable11278.references.forEach(function (r11282) {
                r11282.identifier.name = name11279;
            });
        });
    });
    return ast11265;
}
var loadedMacros11217 = [];
function loadMacro11218(relative_file11283) {
    loadedMacros11217.push(loadNodeModule11215(process.cwd(), relative_file11283));
}
exports.expand = expand11208;
exports.expandSyntax = expandSyntax11207;
exports.parse = parse11210;
exports.compile = compile11211;
exports.setReadtable = setReadtable11213;
exports.currentReadtable = currentReadtable11214;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11215;
exports.loadedMacros = loadedMacros11217;
exports.loadMacro = loadMacro11218;
/*
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
//# sourceMappingURL=sweet.js.map