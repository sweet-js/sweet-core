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
path = require("path"),
    fs = require("fs"),
    resolveSync = require("resolve/lib/sync"),
    gen = require("escodegen"),
    _ = require("underscore"),
    parser = require("./parser"),
    expander = require("./expander"),
    syn = require("./syntax"),
    babel = require("babel"),
    escope = require("escope");
var lib = path.join(path.dirname(fs.realpathSync(__filename)), "../macros");
var stxcaseModule = fs.readFileSync(lib + "/stxcase.js", "utf8");
var moduleCache = {};
var cwd = process.cwd();
var requireModule = function requireModule(id, filename) {
    var basedir = filename ? path.dirname(filename) : cwd;
    var key = basedir + id;
    if (!moduleCache[key]) {
        moduleCache[key] = require(resolveSync(id, { basedir: basedir }));
    }
    return moduleCache[key];
};
// Alow require('./example') for an example.sjs file.
require.extensions[".sjs"] = function (module, filename) {
    var content = require("fs").readFileSync(filename, "utf8");
    module._compile(gen.generate(exports.parse(content, exports.loadedMacros)), filename);
};
function expandSyntax(stx, modules, options) {
    if (!stxcaseCtx) {
        stxcaseCtx = expander.expandModule(parser.read(stxcaseModule));
    }
    var isSyntax = syn.isSyntax(stx);
    options = options || {};
    options.flatten = false;
    if (!isSyntax) {
        stx = syn.tokensToSyntax(stx);
    }
    try {
        var result = expander.expand(stx, [stxcaseCtx].concat(modules), options);
        return isSyntax ? result : syn.syntaxToTokens(result);
    } catch (err) {
        if (err instanceof syn.MacroSyntaxError) {
            throw new SyntaxError(syn.printSyntaxError(source, err));
        } else {
            throw err;
        }
    }
}
function expand(code, options) {
    var toString = String;
    if (typeof code !== "string" && !(code instanceof String)) {
        code = toString(code);
    }
    var source$2 = code;
    if (source$2.length > 0) {
        if (typeof source$2[0] === "undefined") {
            if ( // Try first to convert to a string. This is good as fast path
            // for old IE which understands string indexing for string
            // literals only and not for string object.
            code instanceof String) {
                source$2 = code.valueOf();
            }
            if ( // Force accessing the characters via an array.
            typeof source$2[0] === "undefined") {
                source$2 = stringToArray(code);
            }
        }
    }
    if (source$2 === "") {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source$2 = " ";
    }
    var tokenTree = parser.read(source$2);
    try {
        return expander.compileModule(tokenTree, options);
    } catch (err) {
        if (err instanceof syn.MacroSyntaxError) {
            throw new SyntaxError(syn.printSyntaxError(source$2, err));
        } else {
            throw err;
        }
    }
}
function parseExpanded(expanded, options) {
    return expanded.map(function (c) {
        var ast = parser.parse(c.code);
        if (options.readableNames) {
            ast = optimizeHygiene(ast);
        }
        return {
            path: c.path,
            code: ast
        };
    });
}
function parse(code, options) {
    options = options || {};
    var expanded = expand(code, options);
    return parseExpanded(expanded, options);
}
function compile(code, options) {
    options = options || { compileSuffix: ".jsc" };
    var expanded = expand(code, options);
    return parseExpanded(expanded, options).map(function (c) {
        var expandedOutput;
        return (function (c$2) {
            var output = c$2;
            if (options.to5) {
                output = babel.transform(c$2.code, { blacklist: ["es6.tailCall"] });
                return {
                    code: output.code,
                    sourceMap: output.map
                };
            }
            return output;
        })((function (c$2) {
            if (options.sourceMap) {
                var output = gen.generate(c$2.code, _.extend({
                    comment: true,
                    sourceMap: options.filename,
                    sourceMapWithCode: true
                }, options.escodegen));
                return {
                    path: c$2.path,
                    code: output.code,
                    sourceMap: output.map.toString()
                };
            }
            return {
                path: c$2.path,
                code: gen.generate(c$2.code, _.extend({ comment: true }, options.escodegen))
            };
        })(c));
    });
}
var baseReadtable = Object.create({
    extend: function extend(obj) {
        var extended = Object.create(this);
        Object.keys(obj).forEach(function (ch) {
            extended[ch] = obj[ch];
        });
        return extended;
    }
});
parser.setReadtable(baseReadtable, syn);
function setReadtable(readtableModule) {
    var filename = resolveSync(readtableModule, { basedir: process.cwd() });
    var readtable = require(filename);
    parser.setReadtable(require(filename));
}
function currentReadtable() {
    return parser.currentReadtable();
}
function loadNodeModule(root, moduleName, options) {
    options = options || {};
    if (moduleName[0] === ".") {
        moduleName = path.resolve(root, moduleName);
    }
    var filename = resolveSync(moduleName, {
        basedir: root,
        extensions: [".js", ".sjs"]
    });
    return expandModule(fs.readFileSync(filename, "utf8"), undefined, {
        filename: moduleName,
        requireModule: options.requireModule || requireModule
    });
}
function optimizeHygiene(ast) {
    var // escope hack: sweet doesn't rename global vars. We wrap in a closure
    // to create a 'static` scope for all of the vars sweet renamed.
    wrapper = parse("(function(){})()")[0].code;
    wrapper.body[0].expression.callee.body.body = ast.body;
    function sansUnique(name) {
        var match = name.match(/^(.+)\$[\d]+$/);
        return match ? match[1] : null;
    }
    function wouldShadow(name, scope) {
        while (scope) {
            if (scope.scrubbed && scope.scrubbed.has(name)) {
                return scope.scrubbed.get(name);
            }
            scope = scope.upper;
        }
        return 0;
    }
    var scopes = escope.analyze(wrapper).scopes;
    var globalScope;
    // The first pass over the scope collects any non-static references,
    // which means references from the global scope. We need to make these
    // verboten so we don't accidently mangle a name to match. This could
    // cause seriously hard to find bugs if you were just testing with
    // --readable-names on.
    scopes.forEach(function (scope) {
        scope.scrubbed = new expander.StringMap();
        if ( // There aren't any references declared in the global scope since
        // we wrapped our input in a static closure.
        !scope.isStatic()) {
            globalScope = scope;
            return;
        }
        scope.references.forEach(function (ref) {
            if (!ref.isStatic()) {
                globalScope.scrubbed.set(ref.identifier.name, 1);
            }
        });
    });
    // The second pass mangles the names to get rid of the hygiene tag
    // wherever possible.
    scopes.forEach(function (scope) {
        if ( // No need to rename things in the global scope.
        !scope.isStatic()) {
            return;
        }
        scope.variables.forEach(function (variable) {
            var name = sansUnique(variable.name);
            if (!name) {
                return;
            }
            var level = wouldShadow(name, scope);
            if (level) {
                scope.scrubbed.set(name, level + 1);
                name = name + "$" + (level + 1);
            } else {
                scope.scrubbed.set(name, 1);
            }
            variable.identifiers.forEach(function (i) {
                i.name = name;
            });
            variable.references.forEach(function (r) {
                r.identifier.name = name;
            });
        });
    });
    return ast;
}
var loadedMacros = [];
function loadMacro(relative_file) {
    loadedMacros.push(loadNodeModule(process.cwd(), relative_file));
}
exports.expand = expand;
exports.expandSyntax = expandSyntax;
exports.parse = parse;
exports.compile = compile;
exports.setReadtable = setReadtable;
exports.currentReadtable = currentReadtable;
// exports.loadModule = expandModule;
exports.loadNodeModule = loadNodeModule;
exports.loadedMacros = loadedMacros;
exports.loadMacro = loadMacro;
//# sourceMappingURL=sweet.js.map