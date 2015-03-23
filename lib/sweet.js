"use strict";

var path10903 = require("path"),
    fs10904 = require("fs"),
    resolveSync10905 = require("resolve/lib/sync"),
    gen10906 = require("escodegen"),
    _10907 = require("underscore"),
    parser10908 = require("./parser"),
    expander10909 = require("./expander"),
    syn10910 = require("./syntax"),
    babel10911 = require("babel"),
    escope10912 = require("escope");
var lib10978 = path10903.join(path10903.dirname(fs10904.realpathSync(__filename)), "../macros");
var stxcaseModule10979 = fs10904.readFileSync(lib10978 + "/stxcase.js", "utf8");
var moduleCache10980 = {};
var cwd10981 = process.cwd();
var requireModule10982 = function requireModule10982(id10995, filename10996) {
    var basedir10997 = filename10996 ? path10903.dirname(filename10996) : cwd10981;
    var key10998 = basedir10997 + id10995;
    if (!moduleCache10980[key10998]) {
        moduleCache10980[key10998] = require(resolveSync10905(id10995, { basedir: basedir10997 }));
    }
    return moduleCache10980[key10998];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module10999, filename11000) {
    var content11001 = require("fs").readFileSync(filename11000, "utf8");
    module10999._compile(gen10906.generate(exports.parse(content11001, exports.loadedMacros)), filename11000);
};
function expandSyntax10983(stx11002, modules11003, options11004) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander10909.expandModule(parser10908.read(stxcaseModule10979));
    }
    var isSyntax11005 = syn10910.isSyntax(stx11002);
    options11004 = options11004 || {};
    options11004.flatten = false;
    if (!isSyntax11005) {
        stx11002 = syn10910.tokensToSyntax(stx11002);
    }
    try {
        var result11006 = expander10909.expand(stx11002, [stxcaseCtx].concat(modules11003), options11004);
        return isSyntax11005 ? result11006 : syn10910.syntaxToTokens(result11006);
    } catch (err11007) {
        if (err11007 instanceof syn10910.MacroSyntaxError) {
            throw new SyntaxError(syn10910.printSyntaxError(source, err11007));
        } else {
            throw err11007;
        }
    }
}
function expand10984(code11008, options11009) {
    var toString11010 = String;
    if (typeof code11008 !== "string" && !(code11008 instanceof String)) {
        code11008 = toString11010(code11008);
    }
    var source11011 = code11008;
    if (source11011.length > 0) {
        if (typeof source11011[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code11008 instanceof String) {
                source11011 = code11008.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source11011[0] === "undefined") {
                source11011 = stringToArray(code11008);
            }
        }
    }
    if (source11011 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source11011 = " ";
    }
    var tokenTree11012 = parser10908.read(source11011);
    try {
        return expander10909.compileModule(tokenTree11012, options11009);
    } catch (err11013) {
        if (err11013 instanceof syn10910.MacroSyntaxError) {
            throw new SyntaxError(syn10910.printSyntaxError(source11011, err11013));
        } else {
            throw err11013;
        }
    }
}
function parseExpanded10985(expanded11014, options11015) {
    return expanded11014.map(function (c11016) {
        var ast11017 = parser10908.parse(c11016.code);
        if (options11015.readableNames) {
            ast11017 = optimizeHygiene10992(ast11017);
        }
        return {
            path: c11016.path,
            code: ast11017
        };
    });
}
function parse10986(code11018, options11019) {
    options11019 = options11019 || {};
    var expanded11020 = expand10984(code11018, options11019);
    return parseExpanded10985(expanded11020, options11019);
}
function compile10987(code11021, options11022) {
    options11022 = options11022 || { compileSuffix: ".jsc" };
    var expanded11023 = expand10984(code11021, options11022);
    return parseExpanded10985(expanded11023, options11022).map(function (c11024) {
        var expandedOutput11025;
        return (function (c11026) {
            var output11027 = c11026;
            if (options11022.babel) {
                var babelOptions11028 = {
                    blacklist: ["es6.tailCall"],
                    // causing problems with enforest
                    compact: false
                };
                if (options11022.babelModules) {
                    babelOptions11028.modules = options11022.babelModules;
                }
                output11027 = babel10911.transform(c11026.code, babelOptions11028);
                return {
                    path: c11026.path,
                    code: output11027.code,
                    sourceMap: output11027.map
                };
            }
            return output11027;
        })((function (c11029) {
            if (options11022.sourceMap) {
                var output11030 = gen10906.generate(c11029.code, _10907.extend({
                    comment: true,
                    sourceMap: options11022.filename,
                    sourceMapWithCode: true
                }, options11022.escodegen));
                return {
                    path: c11029.path,
                    code: output11030.code,
                    sourceMap: output11030.map.toString()
                };
            }
            return {
                path: c11029.path,
                code: gen10906.generate(c11029.code, _10907.extend({ comment: true }, options11022.escodegen))
            };
        })(c11024));
    });
}
var baseReadtable10988 = Object.create({
    extend: function extend(obj11031) {
        var extended11032 = Object.create(this);
        Object.keys(obj11031).forEach(function (ch11033) {
            extended11032[ch11033] = obj11031[ch11033];
        });
        return extended11032;
    }
});
parser10908.setReadtable(baseReadtable10988, syn10910);
function setReadtable10989(readtableModule11034) {
    var filename11035 = resolveSync10905(readtableModule11034, { basedir: process.cwd() });
    var readtable11036 = require(filename11035);
    parser10908.setReadtable(require(filename11035));
}
function currentReadtable10990() {
    return parser10908.currentReadtable();
}
function loadNodeModule10991(root11037, moduleName11038, options11039) {
    options11039 = options11039 || {};
    if (moduleName11038[0] === ".") {
        moduleName11038 = path10903.resolve(root11037, moduleName11038);
    }
    var filename11040 = resolveSync10905(moduleName11038, {
        basedir: root11037,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs10904.readFileSync(filename11040, "utf8"), undefined, {
        filename: moduleName11038,
        requireModule: options11039.requireModule || requireModule10982
    });
}
function optimizeHygiene10992(ast11041) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper11042 = parse10986("(function(){})()")[0].code;
    wrapper11042.body[0].expression.callee.body.body = ast11041.body;
    function sansUnique11043(name11047) {
        var match11048 = name11047.match(/^(.+)\$[\d]+$/);
        return match11048 ? match11048[1] : null;
    }
    function wouldShadow11044(name11049, scope11050) {
        while (scope11050) {
            if (scope11050.scrubbed && scope11050.scrubbed.has(name11049)) {
                return scope11050.scrubbed.get(name11049);
            }
            scope11050 = scope11050.upper;
        }
        return 0;
    }
    var scopes11045 = escope10912.analyze(wrapper11042).scopes;
    var globalScope11046;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes11045.forEach(function (scope11051) {
        scope11051.scrubbed = new expander10909.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope11051.isStatic()) {
            globalScope11046 = scope11051;
            return;
        }
        scope11051.references.forEach(function (ref11052) {
            if (!ref11052.isStatic()) {
                globalScope11046.scrubbed.set(ref11052.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes11045.forEach(function (scope11053) {
        if ( // No need to rename things in the global scope.
        !scope11053.isStatic()) {
            return;
        }
        scope11053.variables.forEach(function (variable11054) {
            var name11055 = sansUnique11043(variable11054.name);
            if (!name11055) {
                return;
            }
            var level11056 = wouldShadow11044(name11055, scope11053);
            if (level11056) {
                scope11053.scrubbed.set(name11055, level11056 + 1);
                name11055 = name11055 + "$" + (level11056 + 1);
            } else {
                scope11053.scrubbed.set(name11055, 1);
            }
            variable11054.identifiers.forEach(function (i11057) {
                i11057.name = name11055;
            });
            variable11054.references.forEach(function (r11058) {
                r11058.identifier.name = name11055;
            });
        });
    });
    return ast11041;
}
var loadedMacros10993 = [];
function loadMacro10994(relative_file11059) {
    loadedMacros10993.push(loadNodeModule10991(process.cwd(), relative_file11059));
}
exports.expand = expand10984;
exports.expandSyntax = expandSyntax10983;
exports.parse = parse10986;
exports.compile = compile10987;
exports.setReadtable = setReadtable10989;
exports.currentReadtable = currentReadtable10990;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule10991;
exports.loadedMacros = loadedMacros10993;
exports.loadMacro = loadMacro10994;
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