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
        factory(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'), stxcaseModule, require('escope'), require('escodegen'), fs, path, resolveSync, requireModule);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module, filename) {
            var content = require('fs').readFileSync(filename, 'utf8');
            module._compile(codegen.generate(exports.parse(content, exports.loadedMacros)), filename);
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
            'escope'
        ], factory);
    }
}(this, function (exports$2, _, parser, expander, syn, stxcaseModule, escope, gen, fs, path, resolveSync, requireModule) {
    var // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    codegen = typeof escodegen !== 'undefined' ? escodegen : gen;
    var expand = makeExpand(expander.expand);
    var expandModule = makeExpand(expander.expandModule);
    var stxcaseCtx;
    var baseReadtable = Object.create({
        extend: function (obj) {
            var extended = Object.create(this);
            Object.keys(obj).forEach(function (ch) {
                extended[ch] = obj[ch];
            });
            return extended;
        }
    });
    parser.setReadtable(baseReadtable, syn);
    function ensureStxcaseCtx() {
        if (!stxcaseCtx) {
            var oldReadtable = parser.currentReadtable();
            parser.setReadtable(baseReadtable, syn);
            stxcaseCtx = expander.expandModule(parser.read(stxcaseModule));
            parser.setReadtable(oldReadtable);
        }
    }
    function makeExpand(expandFn) {
        return function expand$2(code, modules, options) {
            var program, toString;
            modules = modules || [];
            ensureStxcaseCtx();
            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }
            var source$2 = code;
            if (source$2.length > 0) {
                if (typeof source$2[0] === 'undefined') {
                    if (// Try first to convert to a string. This is good as fast path
                        // for old IE which understands string indexing for string
                        // literals only and not for string object.
                        code instanceof String) {
                        source$2 = code.valueOf();
                    }
                    if (// Force accessing the characters via an array.
                        typeof source$2[0] === 'undefined') {
                        source$2 = stringToArray(code);
                    }
                }
            }
            var readTree = parser.read(source$2);
            try {
                return expandFn(readTree, [stxcaseCtx].concat(modules), options);
            } catch (err) {
                if (err instanceof syn.MacroSyntaxError) {
                    throw new SyntaxError(syn.printSyntaxError(source$2, err));
                } else {
                    throw err;
                }
            }
        };
    }
    function expandSyntax(stx, modules, options) {
        ensureStxcaseCtx();
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
    function parse(code, modules, options) {
        if (code === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code = ' ';
        }
        modules = modules ? loadedMacros.concat(modules) : modules;
        return parser.parse(expand(code, modules, options));
    }
    function compile(code, options) {
        var output, result = {};
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
            result.code = output.code;
            result.sourceMap = output.map.toString();
        } else {
            result.code = codegen.generate(ast, _.extend({ comment: true }, options.escodegen));
        }
        if (options.log)
            result.log = options.log;
        return result;
    }
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
        var // escope hack: sweet doesn't rename global vars. We wrap in a closure
        // to create a 'static` scope for all of the vars sweet renamed.
        wrapper = parse('(function(){})()');
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
            if (// There aren't any references declared in the global scope since
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
            if (// No need to rename things in the global scope.
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
    var loadedMacros = [];
    function loadMacro(relative_file) {
        loadedMacros.push(loadNodeModule(process.cwd(), relative_file));
    }
    exports$2.expand = expand;
    exports$2.expandSyntax = expandSyntax;
    exports$2.parse = parse;
    exports$2.compile = compile;
    exports$2.setReadtable = setReadtable;
    exports$2.currentReadtable = currentReadtable;
    exports$2.loadModule = expandModule;
    exports$2.loadNodeModule = loadNodeModule;
    exports$2.loadedMacros = loadedMacros;
    exports$2.loadMacro = loadMacro;
}));
//# sourceMappingURL=sweet.js.map