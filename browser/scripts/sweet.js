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
(function (root$1859, factory$1860) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1861 = require('./parser');
        var expander$1862 = require('./expander');
        var syn$1863 = require('./syntax');
        var codegen$1864 = require('escodegen');
        var path$1865 = require('path');
        var fs$1866 = require('fs');
        var lib$1867 = path$1865.join(path$1865.dirname(fs$1866.realpathSync(__filename)), '../macros');
        var stxcaseModule$1868 = fs$1866.readFileSync(lib$1867 + '/stxcase.js', 'utf8');
        factory$1860(exports, parser$1861, expander$1862, syn$1863, stxcaseModule$1868, codegen$1864, fs$1866);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1869, filename$1870) {
            var content$1871 = require('fs').readFileSync(filename$1870, 'utf8');
            module$1869._compile(codegen$1864.generate(exports.parse(content$1871)), filename$1870);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1860);
    }
}(this, function (exports$1872, parser$1873, expander$1874, syn$1875, stxcaseModule$1876, gen$1877, fs$1878) {
    var codegen$1879 = gen$1877 || escodegen;
    var expand$1880 = makeExpand$1883(expander$1874.expand);
    var expandModule$1881 = makeExpand$1883(expander$1874.expandModule);
    var stxcaseCtx$1882;
    function makeExpand$1883(expandFn$1887) {
        // fun (Str) -> [...CSyntax]
        return function expand$1888(code$1889, modules$1890, maxExpands$1891) {
            var program$1892, toString$1893;
            modules$1890 = modules$1890 || [];
            if (!stxcaseCtx$1882) {
                stxcaseCtx$1882 = expander$1874.expandModule(parser$1873.read(stxcaseModule$1876));
            }
            toString$1893 = String;
            if (typeof code$1889 !== 'string' && !(code$1889 instanceof String)) {
                code$1889 = toString$1893(code$1889);
            }
            var source$1894 = code$1889;
            if (source$1894.length > 0) {
                if (typeof source$1894[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1889 instanceof String) {
                        source$1894 = code$1889.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1894[0] === 'undefined') {
                        source$1894 = stringToArray(code$1889);
                    }
                }
            }
            var readTree$1895 = parser$1873.read(source$1894);
            try {
                return expandFn$1887(readTree$1895, [stxcaseCtx$1882].concat(modules$1890), maxExpands$1891);
            } catch (err$1896) {
                if (err$1896 instanceof syn$1875.MacroSyntaxError) {
                    throw new SyntaxError(syn$1875.printSyntaxError(source$1894, err$1896));
                } else {
                    throw err$1896;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1884(code$1897, modules$1898, maxExpands$1899) {
        if (code$1897 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1897 = ' ';
        }
        return parser$1873.parse(expand$1880(code$1897, modules$1898, maxExpands$1899));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1885(code$1900, options$1901) {
        var output$1902;
        options$1901 = options$1901 || {};
        var ast$1903 = parse$1884(code$1900, options$1901.modules || [], options$1901.maxExpands);
        if (options$1901.sourceMap) {
            output$1902 = codegen$1879.generate(ast$1903, {
                comment: true,
                sourceMap: options$1901.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1902.code,
                sourceMap: output$1902.map.toString()
            };
        }
        return { code: codegen$1879.generate(ast$1903, { comment: true }) };
    }
    function loadNodeModule$1886(root$1904, moduleName$1905) {
        var Module$1906 = module.constructor;
        var mock$1907 = {
                id: root$1904 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1904) ? [root$1904] : Module$1906._nodeModulePaths(root$1904)
            };
        var path$1908 = Module$1906._resolveFilename(moduleName$1905, mock$1907);
        return expandModule$1881(fs$1878.readFileSync(path$1908, 'utf8'));
    }
    exports$1872.expand = expand$1880;
    exports$1872.parse = parse$1884;
    exports$1872.compile = compile$1885;
    exports$1872.loadModule = expandModule$1881;
    exports$1872.loadNodeModule = loadNodeModule$1886;
}));
//# sourceMappingURL=sweet.js.map