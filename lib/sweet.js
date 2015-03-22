"use strict";

var path11123 = require("path"),
    fs11124 = require("fs"),
    resolveSync11125 = require("resolve/lib/sync"),
    gen11126 = require("escodegen"),
    _11127 = require("underscore"),
    parser11128 = require("./parser"),
    expander11129 = require("./expander"),
    syn11130 = require("./syntax"),
    babel11131 = require("babel"),
    escope11132 = require("escope");
var lib11198 = path11123.join(path11123.dirname(fs11124.realpathSync(__filename)), "../macros");
var stxcaseModule11199 = fs11124.readFileSync(lib11198 + "/stxcase.js", "utf8");
var moduleCache11200 = {};
var cwd11201 = process.cwd();
var requireModule11202 = function requireModule11202(id11215, filename11216) {
    var basedir11217 = filename11216 ? path11123.dirname(filename11216) : cwd11201;
    var key11218 = basedir11217 + id11215;
    if (!moduleCache11200[key11218]) {
        moduleCache11200[key11218] = require(resolveSync11125(id11215, { basedir: basedir11217 }));
    }
    return moduleCache11200[key11218];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11219, filename11220) {
    var content11221 = require("fs").readFileSync(filename11220, "utf8");
    module11219._compile(gen11126.generate(exports.parse(content11221, exports.loadedMacros)), filename11220);
};
function expandSyntax11203(stx11222, modules11223, options11224) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11129.expandModule(parser11128.read(stxcaseModule11199));
    }
    var isSyntax11225 = syn11130.isSyntax(stx11222);
    options11224 = options11224 || {};
    options11224.flatten = false;
    if (!isSyntax11225) {
        stx11222 = syn11130.tokensToSyntax(stx11222);
    }
    try {
        var result11226 = expander11129.expand(stx11222, [stxcaseCtx].concat(modules11223), options11224);
        return isSyntax11225 ? result11226 : syn11130.syntaxToTokens(result11226);
    } catch (err11227) {
        if (err11227 instanceof syn11130.MacroSyntaxError) {
            throw new SyntaxError(syn11130.printSyntaxError(source, err11227));
        } else {
            throw err11227;
        }
    }
}
function expand11204(code11228, options11229) {
    var toString11230 = String;
    if (typeof code11228 !== "string" && !(code11228 instanceof String)) {
        code11228 = toString11230(code11228);
    }
    var source11231 = code11228;
    if (source11231.length > 0) {
        if (typeof source11231[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11228 instanceof String) {
                source11231 = code11228.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11231[0] === "undefined") {
                source11231 = stringToArray(code11228);
            }
        }
    }
    if (source11231 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11231 = " ";
    }
    var tokenTree11232 = parser11128.read(source11231);
    try {
        return expander11129.compileModule(tokenTree11232, options11229);
    } catch (err11233) {
        if (err11233 instanceof syn11130.MacroSyntaxError) {
            throw new SyntaxError(syn11130.printSyntaxError(source11231, err11233));
        } else {
            throw err11233;
        }
    }
}
function parseExpanded11205(expanded11234, options11235) {
    return expanded11234.map(function (c11236) {
        var ast11237 = parser11128.parse(c11236.code);
        if (options11235.readableNames) {
            ast11237 = optimizeHygiene11212(ast11237);
        }
        return {
            path: c11236.path,
            code: ast11237
        };
    });
}
function parse11206(code11238, options11239) {
    options11239 = options11239 || {};
    var expanded11240 = expand11204(code11238, options11239);
    return parseExpanded11205(expanded11240, options11239);
}
function compile11207(code11241, options11242) {
    options11242 = options11242 || { compileSuffix: ".jsc" };
    var expanded11243 = expand11204(code11241, options11242);
    return parseExpanded11205(expanded11243, options11242).map(function (c11244) {
        var expandedOutput11245;
        return (function (c11246) {
            var output11247 = c11246;
            if (options11242.babel) {
                var babelOptions11248 = {
                    blacklist: ["es6.tailCall"],
                    // causing problems with enforest
                    compact: false
                };
                if (options11242.babelModules) {
                    babelOptions11248.modules = options11242.babelModules;
                }
                output11247 = babel11131.transform(c11246.code, babelOptions11248);
                return {
                    path: c11246.path,
                    code: output11247.code,
                    sourceMap: output11247.map
                };
            }
            return output11247;
        })((function (c11249) {
            if (options11242.sourceMap) {
                var output11250 = gen11126.generate(c11249.code, _11127.extend({
                    comment: true,
                    sourceMap: options11242.filename,
                    sourceMapWithCode: true
                }, options11242.escodegen));
                return {
                    path: c11249.path,
                    code: output11250.code,
                    sourceMap: output11250.map.toString()
                };
            }
            return {
                path: c11249.path,
                code: gen11126.generate(c11249.code, _11127.extend({ comment: true }, options11242.escodegen))
            };
        })(c11244));
    });
}
var baseReadtable11208 = Object.create({
    extend: function extend(obj11251) {
        var extended11252 = Object.create(this);
        Object.keys(obj11251).forEach(function (ch11253) {
            extended11252[ch11253] = obj11251[ch11253];
        });
        return extended11252;
    }
});
parser11128.setReadtable(baseReadtable11208, syn11130);
function setReadtable11209(readtableModule11254) {
    var filename11255 = resolveSync11125(readtableModule11254, { basedir: process.cwd() });
    var readtable11256 = require(filename11255);
    parser11128.setReadtable(require(filename11255));
}
function currentReadtable11210() {
    return parser11128.currentReadtable();
}
function loadNodeModule11211(root11257, moduleName11258, options11259) {
    options11259 = options11259 || {};
    if (moduleName11258[0] === ".") {
        moduleName11258 = path11123.resolve(root11257, moduleName11258);
    }
    var filename11260 = resolveSync11125(moduleName11258, {
        basedir: root11257,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11124.readFileSync(filename11260, "utf8"), undefined, {
        filename: moduleName11258,
        requireModule: options11259.requireModule || requireModule11202
    });
}
function optimizeHygiene11212(ast11261) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11262 = parse11206("(function(){})()")[0].code;
    wrapper11262.body[0].expression.callee.body.body = ast11261.body;
    function sansUnique11263(name11267) {
        var match11268 = name11267.match(/^(.+)\$[\d]+$/);
        return match11268 ? match11268[1] : null;
    }
    function wouldShadow11264(name11269, scope11270) {
        while (scope11270) {
            if (scope11270.scrubbed && scope11270.scrubbed.has(name11269)) {
                return scope11270.scrubbed.get(name11269);
            }
            scope11270 = scope11270.upper;
        }
        return 0;
    }
    var scopes11265 = escope11132.analyze(wrapper11262).scopes;
    var globalScope11266;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11265.forEach(function (scope11271) {
        scope11271.scrubbed = new expander11129.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11271.isStatic()) {
            globalScope11266 = scope11271;
            return;
        }
        scope11271.references.forEach(function (ref11272) {
            if (!ref11272.isStatic()) {
                globalScope11266.scrubbed.set(ref11272.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11265.forEach(function (scope11273) {
        if ( // No need to rename things in the global scope.
        !scope11273.isStatic()) {
            return;
        }
        scope11273.variables.forEach(function (variable11274) {
            var name11275 = sansUnique11263(variable11274.name);
            if (!name11275) {
                return;
            }
            var level11276 = wouldShadow11264(name11275, scope11273);
            if (level11276) {
                scope11273.scrubbed.set(name11275, level11276 + 1);
                name11275 = name11275 + "$" + (level11276 + 1);
            } else {
                scope11273.scrubbed.set(name11275, 1);
            }
            variable11274.identifiers.forEach(function (i11277) {
                i11277.name = name11275;
            });
            variable11274.references.forEach(function (r11278) {
                r11278.identifier.name = name11275;
            });
        });
    });
    return ast11261;
}
var loadedMacros11213 = [];
function loadMacro11214(relative_file11279) {
    loadedMacros11213.push(loadNodeModule11211(process.cwd(), relative_file11279));
}
exports.expand = expand11204;
exports.expandSyntax = expandSyntax11203;
exports.parse = parse11206;
exports.compile = compile11207;
exports.setReadtable = setReadtable11209;
exports.currentReadtable = currentReadtable11210;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11211;
exports.loadedMacros = loadedMacros11213;
exports.loadMacro = loadMacro11214;
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