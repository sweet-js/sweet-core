(function (root$3441, factory$3442) {
    if (typeof exports === 'object') {
        var path$3443 = require('path');
        var fs$3444 = require('fs');
        var resolveSync$3445 = require('resolve/lib/sync');
        var codegen$3446 = require('escodegen');
        var lib$3447 = path$3443.join(path$3443.dirname(fs$3444.realpathSync(__filename)), '../macros');
        var stxcaseModule$3448 = fs$3444.readFileSync(lib$3447 + '/stxcase.js', 'utf8');
        var moduleCache$3449 = {};
        var cwd$3450 = process.cwd();
        var requireModule$3451 = function (id$3452, filename$3453) {
            var basedir$3454 = filename$3453 ? path$3443.dirname(filename$3453) : cwd$3450;
            var key$3455 = basedir$3454 + id$3452;
            if (!moduleCache$3449[key$3455]) {
                moduleCache$3449[key$3455] = require(resolveSync$3445(id$3452, { basedir: basedir$3454 }));
            }
            return moduleCache$3449[key$3455];
        };
        factory$3442(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'), stxcaseModule$3448, require('escodegen'), require('escope'), fs$3444, path$3443, resolveSync$3445, requireModule$3451);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$3456, filename$3457) {
            var content$3458 = require('fs').readFileSync(filename$3457, 'utf8');
            module$3456._compile(codegen$3446.generate(exports.parse(content$3458, exports.loadedMacros)), filename$3457);
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
        ], factory$3442);
    }
}(this, function (exports$3459, _$3460, parser$3461, expander$3462, syn$3463, stxcaseModule$3464, gen$3465, escope$3466, fs$3467, path$3468, resolveSync$3469, requireModule$3470) {
    var // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    codegen$3471 = typeof escodegen !== 'undefined' ? escodegen : gen$3465;
    function expandSyntax$3472(stx$3484, modules$3485, options$3486) {
        if (!stxcaseCtx) {
            stxcaseCtx = expander$3462.expandModule(parser$3461.read(stxcaseModule$3464));
        }
        var isSyntax$3487 = syn$3463.isSyntax(stx$3484);
        options$3486 = options$3486 || {};
        options$3486.flatten = false;
        if (!isSyntax$3487) {
            stx$3484 = syn$3463.tokensToSyntax(stx$3484);
        }
        try {
            var result$3488 = expander$3462.expand(stx$3484, [stxcaseCtx].concat(modules$3485), options$3486);
            return isSyntax$3487 ? result$3488 : syn$3463.syntaxToTokens(result$3488);
        } catch (err$3489) {
            if (err$3489 instanceof syn$3463.MacroSyntaxError) {
                throw new SyntaxError(syn$3463.printSyntaxError(source, err$3489));
            } else {
                throw err$3489;
            }
        }
    }
    function expand$3473(code$3490, options$3491) {
        var toString$3492 = String;
        if (typeof code$3490 !== 'string' && !(code$3490 instanceof String)) {
            code$3490 = toString$3492(code$3490);
        }
        var source$3493 = code$3490;
        if (source$3493.length > 0) {
            if (typeof source$3493[0] === 'undefined') {
                if (// Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    code$3490 instanceof String) {
                    source$3493 = code$3490.valueOf();
                }
                if (// Force accessing the characters via an array.
                    typeof source$3493[0] === 'undefined') {
                    source$3493 = stringToArray(code$3490);
                }
            }
        }
        if (source$3493 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            source$3493 = ' ';
        }
        var tokenTree$3494 = parser$3461.read(source$3493);
        try {
            return expander$3462.compileModule(tokenTree$3494, options$3491);
        } catch (err$3495) {
            if (err$3495 instanceof syn$3463.MacroSyntaxError) {
                throw new SyntaxError(syn$3463.printSyntaxError(source$3493, err$3495));
            } else {
                throw err$3495;
            }
        }
    }
    function parseExpanded$3474(expanded$3496, options$3497) {
        return expanded$3496.map(function (c$3498) {
            var ast$3499 = parser$3461.parse(c$3498.code);
            if (options$3497.readableNames) {
                ast$3499 = optimizeHygiene$3481(ast$3499);
            }
            return {
                path: c$3498.path,
                code: ast$3499
            };
        });
    }
    function parse$3475(code$3500, options$3501) {
        options$3501 = options$3501 || {};
        var expanded$3502 = expand$3473(code$3500, options$3501);
        return parseExpanded$3474(expanded$3502, options$3501);
    }
    function compile$3476(code$3503, options$3504) {
        options$3504 = options$3504 || {};
        var expanded$3505 = expand$3473(code$3503, options$3504);
        return parseExpanded$3474(expanded$3505, options$3504).map(function (c$3506) {
            var output$3507;
            if (options$3504.sourceMap) {
                output$3507 = codegen$3471.generate(c$3506.code, _$3460.extend({
                    comment: true,
                    sourceMap: options$3504.filename,
                    sourceMapWithCode: true
                }, options$3504.escodegen));
                return {
                    path: c$3506.path,
                    code: output$3507.code,
                    sourceMap: output$3507.map.toString()
                };
            }
            return {
                path: c$3506.path,
                code: codegen$3471.generate(c$3506.code, _$3460.extend({ comment: true }, options$3504.escodegen))
            };
        });
    }
    var baseReadtable$3477 = Object.create({
        extend: function (obj$3508) {
            var extended$3509 = Object.create(this);
            Object.keys(obj$3508).forEach(function (ch$3510) {
                extended$3509[ch$3510] = obj$3508[ch$3510];
            });
            return extended$3509;
        }
    });
    parser$3461.setReadtable(baseReadtable$3477, syn$3463);
    function setReadtable$3478(readtableModule$3511) {
        var filename$3512 = resolveSync$3469(readtableModule$3511, { basedir: process.cwd() });
        var readtable$3513 = require(filename$3512);
        parser$3461.setReadtable(require(filename$3512));
    }
    function currentReadtable$3479() {
        return parser$3461.currentReadtable();
    }
    function loadNodeModule$3480(root$3514, moduleName$3515, options$3516) {
        options$3516 = options$3516 || {};
        if (moduleName$3515[0] === '.') {
            moduleName$3515 = path$3468.resolve(root$3514, moduleName$3515);
        }
        var filename$3517 = resolveSync$3469(moduleName$3515, {
            basedir: root$3514,
            extensions: [
                '.js',
                '.sjs'
            ]
        });
        return expandModule(fs$3467.readFileSync(filename$3517, 'utf8'), undefined, {
            filename: moduleName$3515,
            requireModule: options$3516.requireModule || requireModule$3470
        });
    }
    function optimizeHygiene$3481(ast$3518) {
        var // escope hack: sweet doesn't rename global vars. We wrap in a closure
        // to create a 'static` scope for all of the vars sweet renamed.
        wrapper$3519 = parse$3475('(function(){})()')[0].code;
        wrapper$3519.body[0].expression.callee.body.body = ast$3518.body;
        function sansUnique$3520(name$3524) {
            var match$3525 = name$3524.match(/^(.+)\$[\d]+$/);
            return match$3525 ? match$3525[1] : null;
        }
        function wouldShadow$3521(name$3526, scope$3527) {
            while (scope$3527) {
                if (scope$3527.scrubbed && scope$3527.scrubbed.has(name$3526)) {
                    return scope$3527.scrubbed.get(name$3526);
                }
                scope$3527 = scope$3527.upper;
            }
            return 0;
        }
        var scopes$3522 = escope$3466.analyze(wrapper$3519).scopes;
        var globalScope$3523;
        // The first pass over the scope collects any non-static references,
        // which means references from the global scope. We need to make these
        // verboten so we don't accidently mangle a name to match. This could
        // cause seriously hard to find bugs if you were just testing with
        // --readable-names on.
        scopes$3522.forEach(function (scope$3528) {
            scope$3528.scrubbed = new expander$3462.StringMap();
            if (// There aren't any references declared in the global scope since
                // we wrapped our input in a static closure.
                !scope$3528.isStatic()) {
                globalScope$3523 = scope$3528;
                return;
            }
            scope$3528.references.forEach(function (ref$3529) {
                if (!ref$3529.isStatic()) {
                    globalScope$3523.scrubbed.set(ref$3529.identifier.name, 1);
                }
            });
        });
        // The second pass mangles the names to get rid of the hygiene tag
        // wherever possible.
        scopes$3522.forEach(function (scope$3530) {
            if (// No need to rename things in the global scope.
                !scope$3530.isStatic()) {
                return;
            }
            scope$3530.variables.forEach(function (variable$3531) {
                var name$3532 = sansUnique$3520(variable$3531.name);
                if (!name$3532) {
                    return;
                }
                var level$3533 = wouldShadow$3521(name$3532, scope$3530);
                if (level$3533) {
                    scope$3530.scrubbed.set(name$3532, level$3533 + 1);
                    name$3532 = name$3532 + '$' + (level$3533 + 1);
                } else {
                    scope$3530.scrubbed.set(name$3532, 1);
                }
                variable$3531.identifiers.forEach(function (i$3534) {
                    i$3534.name = name$3532;
                });
                variable$3531.references.forEach(function (r$3535) {
                    r$3535.identifier.name = name$3532;
                });
            });
        });
        return ast$3518;
    }
    var loadedMacros$3482 = [];
    function loadMacro$3483(relative_file$3536) {
        loadedMacros$3482.push(loadNodeModule$3480(process.cwd(), relative_file$3536));
    }
    exports$3459.expand = expand$3473;
    exports$3459.expandSyntax = expandSyntax$3472;
    exports$3459.parse = parse$3475;
    exports$3459.compile = compile$3476;
    exports$3459.setReadtable = setReadtable$3478;
    exports$3459.currentReadtable = currentReadtable$3479;
    // exports.loadModule = expandModule;
    exports$3459.loadNodeModule = loadNodeModule$3480;
    exports$3459.loadedMacros = loadedMacros$3482;
    exports$3459.loadMacro = loadMacro$3483;
}));