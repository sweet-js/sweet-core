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
(function (root, factory) {
    if (typeof exports === 'object') {
        var path = require('path');
        var fs = require('fs');
        var resolveSync = require('resolve/lib/sync');
        var codegen = require('escodegen');
        var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../macros');
        var stxcaseModule = fs.readFileSync(lib + '/stxcase.js', 'utf8');
        var moduleCache = {};
        var cwd = process.cwd();
        var requireModule = function (id, filename) {
            var basedir = filename ? path.dirname(filename) : cwd;
            var key = basedir + id;
            if (!moduleCache[key]) {
                moduleCache[key] = require(resolveSync(id, { basedir: basedir }));
            }
            return moduleCache[key];
        };
        factory(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'), stxcaseModule, require('escodegen'), require('escope'), fs, path, resolveSync, requireModule);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module, filename) {
            var content = require('fs').readFileSync(filename, 'utf8');
            module._compile(codegen.generate(exports.parse(content)), filename);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js',
            'escodegen',
            'escope'
        ], factory);
    }
}(this, function (exports$2, _, parser, expander, syn, stxcaseModule, gen, escope, fs, path, resolveSync, requireModule) {
    // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    var codegen = typeof escodegen !== 'undefined' ? escodegen : gen;
    var expand = makeExpand(expander.expand);
    var expandModule = makeExpand(expander.expandModule);
    var stxcaseCtx;
    function makeExpand(expandFn) {
        // fun (Str) -> [...CSyntax]
        return function expand$2(code, modules, options) {
            var program, toString;
            modules = modules || [];
            if (!stxcaseCtx) {
                stxcaseCtx = expander.expandModule(parser.read(stxcaseModule));
            }
            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }
            var source = code;
            if (source.length > 0) {
                if (typeof source[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code instanceof String) {
                        source = code.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source[0] === 'undefined') {
                        source = stringToArray(code);
                    }
                }
            }
            var readTree = parser.read(source);
            try {
                return expandFn(readTree, [stxcaseCtx].concat(modules), options);
            } catch (err) {
                if (err instanceof syn.MacroSyntaxError) {
                    throw new SyntaxError(syn.printSyntaxError(source, err));
                } else {
                    throw err;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse(code, modules, options) {
        if (code === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code = ' ';
        }
        return parser.parse(expand(code, modules, options));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile(code, options) {
        var output;
        options = options || {};
        options.requireModule = options.requireModule || requireModule;
        var ast = parse(code, options.modules || [], options);
        if (options.readableNames) {
            ast = optimizeHygiene(ast);
        }
        if (options.ast) {
            return ast;
        }
        if (options.sourceMap) {
            output = codegen.generate(ast, _.extend({
                comment: true,
                sourceMap: options.filename,
                sourceMapWithCode: true
            }, options.escodegen));
            return {
                code: output.code,
                sourceMap: output.map.toString()
            };
        }
        return { code: codegen.generate(ast, _.extend({ comment: true }, options.escodegen)) };
    }
    function loadNodeModule(root, moduleName, options) {
        options = options || {};
        if (moduleName[0] === '.') {
            moduleName = path.resolve(root, moduleName);
        }
        var filename = resolveSync(moduleName, {
                basedir: root,
                extensions: [
                    '.js',
                    '.sjs'
                ]
            });
        return expandModule(fs.readFileSync(filename, 'utf8'), undefined, {
            filename: moduleName,
            requireModule: options.requireModule || requireModule
        });
    }
    function optimizeHygiene(ast) {
        // escope hack: sweet doesn't rename global vars. We wrap in a closure
        // to create a 'static` scope for all of the vars sweet renamed.
        var wrapper = parse('(function(){})()');
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
            // There aren't any references declared in the global scope since
            // we wrapped our input in a static closure.
            if (!scope.isStatic()) {
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
            // No need to rename things in the global scope.
            if (!scope.isStatic()) {
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
                    name = name + '$' + (level + 1);
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
    exports$2.expand = expand;
    exports$2.parse = parse;
    exports$2.compile = compile;
    exports$2.loadModule = expandModule;
    exports$2.loadNodeModule = loadNodeModule;
}));
//# sourceMappingURL=sweet.js.map