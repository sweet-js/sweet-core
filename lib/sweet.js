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
(function (root$1867, factory$1868) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1869 = require('./parser');
        var expander$1870 = require('./expander');
        var syn$1871 = require('./syntax');
        var codegen$1872 = require('escodegen');
        var path$1873 = require('path');
        var fs$1874 = require('fs');
        var lib$1875 = path$1873.join(path$1873.dirname(fs$1874.realpathSync(__filename)), '../macros');
        var stxcaseModule$1876 = fs$1874.readFileSync(lib$1875 + '/stxcase.js', 'utf8');
        factory$1868(exports, parser$1869, expander$1870, syn$1871, stxcaseModule$1876, codegen$1872, fs$1874);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1877, filename$1878) {
            var content$1879 = require('fs').readFileSync(filename$1878, 'utf8');
            module$1877._compile(codegen$1872.generate(exports.parse(content$1879)), filename$1878);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1868);
    }
}(this, function (exports$1880, parser$1881, expander$1882, syn$1883, stxcaseModule$1884, gen$1885, fs$1886) {
    var codegen$1887 = gen$1885 || escodegen;
    var expand$1888 = makeExpand$1891(expander$1882.expand);
    var expandModule$1889 = makeExpand$1891(expander$1882.expandModule);
    var stxcaseCtx$1890;
    function makeExpand$1891(expandFn$1895) {
        // fun (Str) -> [...CSyntax]
        return function expand$1896(code$1897, modules$1898, maxExpands$1899) {
            var program$1900, toString$1901;
            modules$1898 = modules$1898 || [];
            if (!stxcaseCtx$1890) {
                stxcaseCtx$1890 = expander$1882.expandModule(parser$1881.read(stxcaseModule$1884));
            }
            toString$1901 = String;
            if (typeof code$1897 !== 'string' && !(code$1897 instanceof String)) {
                code$1897 = toString$1901(code$1897);
            }
            var source$1902 = code$1897;
            if (source$1902.length > 0) {
                if (typeof source$1902[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1897 instanceof String) {
                        source$1902 = code$1897.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1902[0] === 'undefined') {
                        source$1902 = stringToArray(code$1897);
                    }
                }
            }
            var readTree$1903 = parser$1881.read(source$1902);
            try {
                return expandFn$1895(readTree$1903, [stxcaseCtx$1890].concat(modules$1898), maxExpands$1899);
            } catch (err$1904) {
                if (err$1904 instanceof syn$1883.MacroSyntaxError) {
                    throw new SyntaxError(syn$1883.printSyntaxError(source$1902, err$1904));
                } else {
                    throw err$1904;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1892(code$1905, modules$1906, maxExpands$1907) {
        if (code$1905 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1905 = ' ';
        }
        return parser$1881.parse(expand$1888(code$1905, modules$1906, maxExpands$1907));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1893(code$1908, options$1909) {
        var output$1910;
        options$1909 = options$1909 || {};
        var ast$1911 = parse$1892(code$1908, options$1909.modules || [], options$1909.maxExpands);
        if (options$1909.sourceMap) {
            output$1910 = codegen$1887.generate(ast$1911, {
                comment: true,
                sourceMap: options$1909.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1910.code,
                sourceMap: output$1910.map.toString()
            };
        }
        return { code: codegen$1887.generate(ast$1911, { comment: true }) };
    }
    function loadNodeModule$1894(root$1912, moduleName$1913) {
        var Module$1914 = module.constructor;
        var mock$1915 = {
                id: root$1912 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1912) ? [root$1912] : Module$1914._nodeModulePaths(root$1912)
            };
        var path$1916 = Module$1914._resolveFilename(moduleName$1913, mock$1915);
        return expandModule$1889(fs$1886.readFileSync(path$1916, 'utf8'));
    }
    exports$1880.expand = expand$1888;
    exports$1880.parse = parse$1892;
    exports$1880.compile = compile$1893;
    exports$1880.loadModule = expandModule$1889;
    exports$1880.loadNodeModule = loadNodeModule$1894;
}));
//# sourceMappingURL=sweet.js.map