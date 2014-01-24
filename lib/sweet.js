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
(function (root$1874, factory$1875) {
    if (typeof exports === 'object') {
        var path$1876 = require('path');
        var fs$1877 = require('fs');
        var lib$1878 = path$1876.join(path$1876.dirname(fs$1877.realpathSync(__filename)), '../macros');
        var stxcaseModule$1879 = fs$1877.readFileSync(lib$1878 + '/stxcase.js', 'utf8');
        factory$1875(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'), stxcaseModule$1879, require('escodegen'), require('escope'), fs$1877);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1880, filename$1881) {
            var content$1882 = require('fs').readFileSync(filename$1881, 'utf8');
            module$1880._compile(codegen.generate(exports.parse(content$1882)), filename$1881);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1875);
    }
}(this, function (exports$1883, _$1884, parser$1885, expander$1886, syn$1887, stxcaseModule$1888, gen$1889, scope$1890, fs$1891) {
    var codegen$1892 = gen$1889 || escodegen;
    var escope$1893 = scope$1890 || escope$1893;
    var expand$1894 = makeExpand$1897(expander$1886.expand);
    var expandModule$1895 = makeExpand$1897(expander$1886.expandModule);
    var stxcaseCtx$1896;
    function makeExpand$1897(expandFn$1902) {
        // fun (Str) -> [...CSyntax]
        return function expand$1903(code$1904, modules$1905, maxExpands$1906) {
            var program$1907, toString$1908;
            modules$1905 = modules$1905 || [];
            if (!stxcaseCtx$1896) {
                stxcaseCtx$1896 = expander$1886.expandModule(parser$1885.read(stxcaseModule$1888));
            }
            toString$1908 = String;
            if (typeof code$1904 !== 'string' && !(code$1904 instanceof String)) {
                code$1904 = toString$1908(code$1904);
            }
            var source$1909 = code$1904;
            if (source$1909.length > 0) {
                if (typeof source$1909[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1904 instanceof String) {
                        source$1909 = code$1904.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1909[0] === 'undefined') {
                        source$1909 = stringToArray(code$1904);
                    }
                }
            }
            var readTree$1910 = parser$1885.read(source$1909);
            try {
                return expandFn$1902(readTree$1910, [stxcaseCtx$1896].concat(modules$1905), maxExpands$1906);
            } catch (err$1911) {
                if (err$1911 instanceof syn$1887.MacroSyntaxError) {
                    throw new SyntaxError(syn$1887.printSyntaxError(source$1909, err$1911));
                } else {
                    throw err$1911;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1898(code$1912, modules$1913, maxExpands$1914) {
        if (code$1912 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1912 = ' ';
        }
        return parser$1885.parse(expand$1894(code$1912, modules$1913, maxExpands$1914));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1899(code$1915, options$1916) {
        var output$1917;
        options$1916 = options$1916 || {};
        var ast$1918 = parse$1898(code$1915, options$1916.modules || [], options$1916.maxExpands);
        if (options$1916.readableNames) {
            ast$1918 = optimizeHygiene$1901(ast$1918);
        }
        if (options$1916.ast) {
            return ast$1918;
        }
        if (options$1916.sourceMap) {
            output$1917 = codegen$1892.generate(ast$1918, _$1884.extend({
                comment: true,
                sourceMap: options$1916.filename,
                sourceMapWithCode: true
            }, options$1916.escodegen));
            return {
                code: output$1917.code,
                sourceMap: output$1917.map.toString()
            };
        }
        return { code: codegen$1892.generate(ast$1918, _$1884.extend({ comment: true }, options$1916.escodegen)) };
    }
    function loadNodeModule$1900(root$1919, moduleName$1920) {
        var Module$1921 = module.constructor;
        var mock$1922 = {
                id: root$1919 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1919) ? [root$1919] : Module$1921._nodeModulePaths(root$1919)
            };
        var path$1923 = Module$1921._resolveFilename(moduleName$1920, mock$1922);
        return expandModule$1895(fs$1891.readFileSync(path$1923, 'utf8'));
    }
    function optimizeHygiene$1901(ast$1924) {
        // escope hack: sweet doesn't rename global vars. We wrap in a closure
        // to create a 'static` scope for all of the vars sweet renamed.
        var wrapper$1925 = parse$1898('(function(){})()');
        wrapper$1925.body[0].expression.callee.body.body = ast$1924.body;
        function sansUnique$1926(name$1930) {
            var match$1931 = name$1930.match(/^(.+)\$[\d]+$/);
            return match$1931 ? match$1931[1] : null;
        }
        function wouldShadow$1927(name$1932, scope$1933) {
            while (scope$1933) {
                if (scope$1933.scrubbed && scope$1933.scrubbed.has(name$1932)) {
                    return scope$1933.scrubbed.get(name$1932);
                }
                scope$1933 = scope$1933.upper;
            }
            return 0;
        }
        var scopes$1928 = escope$1893.analyze(wrapper$1925).scopes;
        var globalScope$1929;
        // The first pass over the scope collects any non-static references,
        // which means references from the global scope. We need to make these
        // verboten so we don't accidently mangle a name to match. This could
        // cause seriously hard to find bugs if you were just testing with
        // --readable-names on.
        scopes$1928.forEach(function (scope$1934) {
            scope$1934.scrubbed = new expander$1886.StringMap();
            // There aren't any references declared in the global scope since
            // we wrapped our input in a static closure.
            if (!scope$1934.isStatic()) {
                globalScope$1929 = scope$1934;
                return;
            }
            scope$1934.references.forEach(function (ref$1935) {
                if (!ref$1935.isStatic()) {
                    globalScope$1929.scrubbed.set(ref$1935.identifier.name, 1);
                }
            });
        });
        // The second pass mangles the names to get rid of the hygiene tag
        // wherever possible.
        scopes$1928.forEach(function (scope$1936) {
            // No need to rename things in the global scope.
            if (!scope$1936.isStatic()) {
                return;
            }
            scope$1936.variables.forEach(function (variable$1937) {
                var name$1938 = sansUnique$1926(variable$1937.name);
                if (!name$1938) {
                    return;
                }
                var level$1939 = wouldShadow$1927(name$1938, scope$1936);
                if (level$1939) {
                    scope$1936.scrubbed.set(name$1938, level$1939 + 1);
                    name$1938 = name$1938 + '$' + (level$1939 + 1);
                } else {
                    scope$1936.scrubbed.set(name$1938, 1);
                }
                variable$1937.identifiers.forEach(function (i$1940) {
                    i$1940.name = name$1938;
                });
                variable$1937.references.forEach(function (r$1941) {
                    r$1941.identifier.name = name$1938;
                });
            });
        });
        return ast$1924;
    }
    exports$1883.expand = expand$1894;
    exports$1883.parse = parse$1898;
    exports$1883.compile = compile$1899;
    exports$1883.loadModule = expandModule$1895;
    exports$1883.loadNodeModule = loadNodeModule$1900;
}));
//# sourceMappingURL=sweet.js.map