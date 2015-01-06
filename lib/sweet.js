var path = require('path'), fs = require('fs'), resolveSync = require('resolve/lib/sync'), gen = require('escodegen'), _ = require('underscore'), parser = require('./parser'), expander = require('./expander'), syn = require('./syntax'), escope = require('escope');
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
require.extensions['.sjs'] = function (module, filename) {
    var content = require('fs').readFileSync(filename, 'utf8');
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
    if (typeof code !== 'string' && !(code instanceof String)) {
        code = toString(code);
    }
    var source$2 = code;
    if (source$2.length > 0) {
        if (typeof source$2[0] === 'undefined') {
            if (code instanceof String) {
                source$2 = code.valueOf();
            }
            if (typeof source$2[0] === 'undefined') {
                source$2 = stringToArray(code);
            }
        }
    }
    if (source$2 === '') {
        // old version of esprima doesn't play nice with the empty string
        // and loc/range info so until we can upgrade hack in a single space
        source$2 = ' ';
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
    options = options || { compileSuffix: '.jsc' };
    var expanded = expand(code, options);
    return parseExpanded(expanded, options).map(function (c) {
        var output;
        if (options.sourceMap) {
            output = gen.generate(c.code, _.extend({
                comment: true,
                sourceMap: options.filename,
                sourceMapWithCode: true
            }, options.escodegen));
            return {
                path: c.path,
                code: output.code,
                sourceMap: output.map.toString()
            };
        }
        return {
            path: c.path,
            code: gen.generate(c.code, _.extend({ comment: true }, options.escodegen))
        };
    });
}
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
    var wrapper = parse('(function(){})()')[0].code;
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
    scopes.forEach(function (scope) {
        scope.scrubbed = new expander.StringMap();
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
    scopes.forEach(function (scope) {
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