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
path11173 = require("path"),
    fs11174 = require("fs"),
    resolveSync11175 = require("resolve/lib/sync"),
    gen11176 = require("escodegen"),
    _11177 = require("underscore"),
    parser11178 = require("./parser"),
    expander11179 = require("./expander"),
    syn11180 = require("./syntax"),
    babel11181 = require("babel"),
    escope11182 = require("escope");
var lib11248 = path11173.join(path11173.dirname(fs11174.realpathSync(__filename)), "../macros");
var stxcaseModule11249 = fs11174.readFileSync(lib11248 + "/stxcase.js", "utf8");
var moduleCache11250 = {};
var cwd11251 = process.cwd();
var requireModule11252 = function requireModule11252(id11265, filename11266) {
    var basedir11267 = filename11266 ? path11173.dirname(filename11266) : cwd11251;
    var key11268 = basedir11267 + id11265;
    if (!moduleCache11250[key11268]) {
        moduleCache11250[key11268] = require(resolveSync11175(id11265, { basedir: basedir11267 }));
    }
    return moduleCache11250[key11268];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module11269, filename11270) {
    var content11271 = require("fs").readFileSync(filename11270, "utf8");
    module11269._compile(gen11176.generate(exports.parse(content11271, exports.loadedMacros)), filename11270);
};
function expandSyntax11253(stx11272, modules11273, options11274) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander11179.expandModule(parser11178.read(stxcaseModule11249));
    }
    var isSyntax11275 = syn11180.isSyntax(stx11272);
    options11274 = options11274 || {};
    options11274.flatten = false;
    if (!isSyntax11275) {
        stx11272 = syn11180.tokensToSyntax(stx11272);
    }
    try {
        var result11276 = expander11179.expand(stx11272, [stxcaseCtx].concat(modules11273), options11274);
        return isSyntax11275 ? result11276 : syn11180.syntaxToTokens(result11276);
    } catch (err11277) {
        if (err11277 instanceof syn11180.MacroSyntaxError) {
            throw new SyntaxError(syn11180.printSyntaxError(source, err11277));
        } else {
            throw err11277;
        }
    }
}
function expand11254(code11278, options11279) {
    var toString11280 = String;
    if (typeof code11278 !== "string" && !(code11278 instanceof String)) {
        code11278 = toString11280(code11278);
    }
    var source11281 = code11278;
    if (source11281.length > 0) {
        if (typeof source11281[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11278 instanceof String) {
                source11281 = code11278.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11281[0] === "undefined") {
                source11281 = stringToArray(code11278);
            }
        }
    }
    if (source11281 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11281 = " ";
    }
    var tokenTree11282 = parser11178.read(source11281);
    try {
        return expander11179.compileModule(tokenTree11282, options11279);
    } catch (err11283) {
        if (err11283 instanceof syn11180.MacroSyntaxError) {
            throw new SyntaxError(syn11180.printSyntaxError(source11281, err11283));
        } else {
            throw err11283;
        }
    }
}
function parseExpanded11255(expanded11284, options11285) {
    return expanded11284.map(function (c11286) {
        var ast11287 = parser11178.parse(c11286.code);
        if (options11285.readableNames) {
            ast11287 = optimizeHygiene11262(ast11287);
        }
        return {
            path: c11286.path,
            code: ast11287
        };
    });
}
function parse11256(code11288, options11289) {
    options11289 = options11289 || {};
    var expanded11290 = expand11254(code11288, options11289);
    return parseExpanded11255(expanded11290, options11289);
}
function compile11257(code11291, options11292) {
    options11292 = options11292 || { compileSuffix: ".jsc" };
    var expanded11293 = expand11254(code11291, options11292);
    return parseExpanded11255(expanded11293, options11292).map(function (c11294) {
        var expandedOutput11295;
        return (function (c11296) {
            var output11297 = c11296;
            if (options11292.to5) {
                output11297 = babel11181.transform(c11296.code, {
                    blacklist: ["es6.tailCall"],
                    compact: false
                });
                return {
                    code: output11297.code,
                    sourceMap: output11297.map
                };
            }
            return output11297;
        })((function (c11298) {
            if (options11292.sourceMap) {
                var output11299 = gen11176.generate(c11298.code, _11177.extend({
                    comment: true,
                    sourceMap: options11292.filename,
                    sourceMapWithCode: true
                }, options11292.escodegen));
                return {
                    path: c11298.path,
                    code: output11299.code,
                    sourceMap: output11299.map.toString()
                };
            }
            return {
                path: c11298.path,
                code: gen11176.generate(c11298.code, _11177.extend({ comment: true }, options11292.escodegen))
            };
        })(c11294));
    });
}
var baseReadtable11258 = Object.create({
    extend: function extend(obj11300) {
        var extended11301 = Object.create(this);
        Object.keys(obj11300).forEach(function (ch11302) {
            extended11301[ch11302] = obj11300[ch11302];
        });
        return extended11301;
    }
});
parser11178.setReadtable(baseReadtable11258, syn11180);
function setReadtable11259(readtableModule11303) {
    var filename11304 = resolveSync11175(readtableModule11303, { basedir: process.cwd() });
    var readtable11305 = require(filename11304);
    parser11178.setReadtable(require(filename11304));
}
function currentReadtable11260() {
    return parser11178.currentReadtable();
}
function loadNodeModule11261(root11306, moduleName11307, options11308) {
    options11308 = options11308 || {};
    if (moduleName11307[0] === ".") {
        moduleName11307 = path11173.resolve(root11306, moduleName11307);
    }
    var filename11309 = resolveSync11175(moduleName11307, {
        basedir: root11306,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs11174.readFileSync(filename11309, "utf8"), undefined, {
        filename: moduleName11307,
        requireModule: options11308.requireModule || requireModule11252
    });
}
function optimizeHygiene11262(ast11310) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11311 = parse11256("(function(){})()")[0].code;
    wrapper11311.body[0].expression.callee.body.body = ast11310.body;
    function sansUnique11312(name11316) {
        var match11317 = name11316.match(/^(.+)\$[\d]+$/);
        return match11317 ? match11317[1] : null;
    }
    function wouldShadow11313(name11318, scope11319) {
        while (scope11319) {
            if (scope11319.scrubbed && scope11319.scrubbed.has(name11318)) {
                return scope11319.scrubbed.get(name11318);
            }
            scope11319 = scope11319.upper;
        }
        return 0;
    }
    var scopes11314 = escope11182.analyze(wrapper11311).scopes;
    var globalScope11315;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11314.forEach(function (scope11320) {
        scope11320.scrubbed = new expander11179.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11320.isStatic()) {
            globalScope11315 = scope11320;
            return;
        }
        scope11320.references.forEach(function (ref11321) {
            if (!ref11321.isStatic()) {
                globalScope11315.scrubbed.set(ref11321.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11314.forEach(function (scope11322) {
        if ( // No need to rename things in the global scope.
        !scope11322.isStatic()) {
            return;
        }
        scope11322.variables.forEach(function (variable11323) {
            var name11324 = sansUnique11312(variable11323.name);
            if (!name11324) {
                return;
            }
            var level11325 = wouldShadow11313(name11324, scope11322);
            if (level11325) {
                scope11322.scrubbed.set(name11324, level11325 + 1);
                name11324 = name11324 + "$" + (level11325 + 1);
            } else {
                scope11322.scrubbed.set(name11324, 1);
            }
            variable11323.identifiers.forEach(function (i11326) {
                i11326.name = name11324;
            });
            variable11323.references.forEach(function (r11327) {
                r11327.identifier.name = name11324;
            });
        });
    });
    return ast11310;
}
var loadedMacros11263 = [];
function loadMacro11264(relative_file11328) {
    loadedMacros11263.push(loadNodeModule11261(process.cwd(), relative_file11328));
}
exports.expand = expand11254;
exports.expandSyntax = expandSyntax11253;
exports.parse = parse11256;
exports.compile = compile11257;
exports.setReadtable = setReadtable11259;
exports.currentReadtable = currentReadtable11260;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule11261;
exports.loadedMacros = loadedMacros11263;
exports.loadMacro = loadMacro11264;
//# sourceMappingURL=sweet.js.map