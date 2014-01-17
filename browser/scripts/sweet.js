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
(function (root$1870, factory$1871) {
    if (typeof exports === 'object') {
        var path$1872 = require('path');
        var fs$1873 = require('fs');
        var lib$1874 = path$1872.join(path$1872.dirname(fs$1873.realpathSync(__filename)), '../macros');
        var stxcaseModule$1875 = fs$1873.readFileSync(lib$1874 + '/stxcase.js', 'utf8');
        factory$1871(exports, require('underscore'), require('./parser'), require('./expander'), require('./syntax'), stxcaseModule$1875, require('escodegen'), require('escope'), fs$1873);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1876, filename$1877) {
            var content$1878 = require('fs').readFileSync(filename$1877, 'utf8');
            module$1876._compile(codegen.generate(exports.parse(content$1878)), filename$1877);
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
        ], factory$1871);
    }
}(this, function (exports$1879, _$1880, parser$1881, expander$1882, syn$1883, stxcaseModule$1884, gen$1885, scope$1886, fs$1887) {
    var codegen$1888 = gen$1885 || escodegen;
    var escope$1889 = scope$1886 || escope$1889;
    var expand$1890 = makeExpand$1893(expander$1882.expand);
    var expandModule$1891 = makeExpand$1893(expander$1882.expandModule);
    var stxcaseCtx$1892;
    function makeExpand$1893(expandFn$1898) {
        // fun (Str) -> [...CSyntax]
        return function expand$1899(code$1900, modules$1901, maxExpands$1902) {
            var program$1903, toString$1904;
            modules$1901 = modules$1901 || [];
            if (!stxcaseCtx$1892) {
                stxcaseCtx$1892 = expander$1882.expandModule(parser$1881.read(stxcaseModule$1884));
            }
            toString$1904 = String;
            if (typeof code$1900 !== 'string' && !(code$1900 instanceof String)) {
                code$1900 = toString$1904(code$1900);
            }
            var source$1905 = code$1900;
            if (source$1905.length > 0) {
                if (typeof source$1905[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1900 instanceof String) {
                        source$1905 = code$1900.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1905[0] === 'undefined') {
                        source$1905 = stringToArray(code$1900);
                    }
                }
            }
            var readTree$1906 = parser$1881.read(source$1905);
            try {
                return expandFn$1898(readTree$1906, [stxcaseCtx$1892].concat(modules$1901), maxExpands$1902);
            } catch (err$1907) {
                if (err$1907 instanceof syn$1883.MacroSyntaxError) {
                    throw new SyntaxError(syn$1883.printSyntaxError(source$1905, err$1907));
                } else {
                    throw err$1907;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1894(code$1908, modules$1909, maxExpands$1910) {
        if (code$1908 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1908 = ' ';
        }
        return parser$1881.parse(expand$1890(code$1908, modules$1909, maxExpands$1910));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1895(code$1911, options$1912) {
        var output$1913;
        options$1912 = options$1912 || {};
        var ast$1914 = parse$1894(code$1911, options$1912.modules || [], options$1912.maxExpands);
        if (options$1912.readableNames) {
            ast$1914 = optimizeHygiene$1897(ast$1914);
        }
        if (options$1912.ast) {
            return ast$1914;
        }
        if (options$1912.sourceMap) {
            output$1913 = codegen$1888.generate(ast$1914, _$1880.extend({
                comment: true,
                sourceMap: options$1912.filename,
                sourceMapWithCode: true
            }, options$1912.escodegen));
            return {
                code: output$1913.code,
                sourceMap: output$1913.map.toString()
            };
        }
        return { code: codegen$1888.generate(ast$1914, _$1880.extend({ comment: true }, options$1912.escodegen)) };
    }
    function loadNodeModule$1896(root$1915, moduleName$1916) {
        var Module$1917 = module.constructor;
        var mock$1918 = {
                id: root$1915 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1915) ? [root$1915] : Module$1917._nodeModulePaths(root$1915)
            };
        var path$1919 = Module$1917._resolveFilename(moduleName$1916, mock$1918);
        return expandModule$1891(fs$1887.readFileSync(path$1919, 'utf8'));
    }
    function optimizeHygiene$1897(ast$1920) {
        // escope hack: sweet doesn't rename global vars. We wrap in a closure
        // to create a 'static` scope for all of the vars sweet renamed.
        var wrapper$1921 = parse$1894('(function(){})()');
        wrapper$1921.body[0].expression.callee.body.body = ast$1920.body;
        function sansUnique$1922(name$1926) {
            var match$1927 = name$1926.match(/^(.+)\$[\d]+$/);
            return match$1927 ? match$1927[1] : null;
        }
        function wouldShadow$1923(name$1928, scope$1929) {
            while (scope$1929) {
                if (scope$1929.scrubbed && scope$1929.scrubbed.has(name$1928)) {
                    return scope$1929.scrubbed.get(name$1928);
                }
                scope$1929 = scope$1929.upper;
            }
            return 0;
        }
        var scopes$1924 = escope$1889.analyze(wrapper$1921).scopes;
        var globalScope$1925;
        // The first pass over the scope collects any non-static references,
        // which means references from the global scope. We need to make these
        // verboten so we don't accidently mangle a name to match. This could
        // cause seriously hard to find bugs if you were just testing with
        // --readable-names on.
        scopes$1924.forEach(function (scope$1930) {
            scope$1930.scrubbed = new expander$1882.StringMap();
            // There aren't any references declared in the global scope since
            // we wrapped our input in a static closure.
            if (!scope$1930.isStatic()) {
                globalScope$1925 = scope$1930;
                return;
            }
            scope$1930.references.forEach(function (ref$1931) {
                if (!ref$1931.isStatic()) {
                    globalScope$1925.scrubbed.set(ref$1931.identifier.name, 1);
                }
            });
        });
        // The second pass mangles the names to get rid of the hygiene tag
        // wherever possible.
        scopes$1924.forEach(function (scope$1932) {
            // No need to rename things in the global scope.
            if (!scope$1932.isStatic()) {
                return;
            }
            scope$1932.variables.forEach(function (variable$1933) {
                var name$1934 = sansUnique$1922(variable$1933.name);
                if (!name$1934) {
                    return;
                }
                var level$1935 = wouldShadow$1923(name$1934, scope$1932);
                if (level$1935) {
                    scope$1932.scrubbed.set(name$1934, level$1935 + 1);
                    name$1934 = name$1934 + '$' + (level$1935 + 1);
                } else {
                    scope$1932.scrubbed.set(name$1934, 1);
                }
                variable$1933.identifiers.forEach(function (i$1936) {
                    i$1936.name = name$1934;
                });
                variable$1933.references.forEach(function (r$1937) {
                    r$1937.identifier.name = name$1934;
                });
            });
        });
        return ast$1920;
    }
    exports$1879.expand = expand$1890;
    exports$1879.parse = parse$1894;
    exports$1879.compile = compile$1895;
    exports$1879.loadModule = expandModule$1891;
    exports$1879.loadNodeModule = loadNodeModule$1896;
}));
//# sourceMappingURL=sweet.js.map