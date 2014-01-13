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
(function (root$1861, factory$1862) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1863 = require('./parser');
        var expander$1864 = require('./expander');
        var syn$1865 = require('./syntax');
        var codegen$1866 = require('escodegen');
        var path$1867 = require('path');
        var fs$1868 = require('fs');
        var lib$1869 = path$1867.join(path$1867.dirname(fs$1868.realpathSync(__filename)), '../macros');
        var stxcaseModule$1870 = fs$1868.readFileSync(lib$1869 + '/stxcase.js', 'utf8');
        factory$1862(exports, parser$1863, expander$1864, syn$1865, stxcaseModule$1870, codegen$1866, fs$1868);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1871, filename$1872) {
            var content$1873 = require('fs').readFileSync(filename$1872, 'utf8');
            module$1871._compile(codegen$1866.generate(exports.parse(content$1873)), filename$1872);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1862);
    }
}(this, function (exports$1874, parser$1875, expander$1876, syn$1877, stxcaseModule$1878, gen$1879, fs$1880) {
    var codegen$1881 = gen$1879 || escodegen;
    var expand$1882 = makeExpand$1885(expander$1876.expand);
    var expandModule$1883 = makeExpand$1885(expander$1876.expandModule);
    var stxcaseCtx$1884;
    function makeExpand$1885(expandFn$1889) {
        // fun (Str) -> [...CSyntax]
        return function expand$1890(code$1891, modules$1892, maxExpands$1893) {
            var program$1894, toString$1895;
            modules$1892 = modules$1892 || [];
            if (!stxcaseCtx$1884) {
                stxcaseCtx$1884 = expander$1876.expandModule(parser$1875.read(stxcaseModule$1878));
            }
            toString$1895 = String;
            if (typeof code$1891 !== 'string' && !(code$1891 instanceof String)) {
                code$1891 = toString$1895(code$1891);
            }
            var source$1896 = code$1891;
            if (source$1896.length > 0) {
                if (typeof source$1896[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1891 instanceof String) {
                        source$1896 = code$1891.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1896[0] === 'undefined') {
                        source$1896 = stringToArray(code$1891);
                    }
                }
            }
            var readTree$1897 = parser$1875.read(source$1896);
            try {
                return expandFn$1889(readTree$1897, [stxcaseCtx$1884].concat(modules$1892), maxExpands$1893);
            } catch (err$1898) {
                if (err$1898 instanceof syn$1877.MacroSyntaxError) {
                    throw new SyntaxError(syn$1877.printSyntaxError(source$1896, err$1898));
                } else {
                    throw err$1898;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1886(code$1899, modules$1900, maxExpands$1901) {
        if (code$1899 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1899 = ' ';
        }
        return parser$1875.parse(expand$1882(code$1899, modules$1900, maxExpands$1901));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1887(code$1902, options$1903) {
        var output$1904;
        options$1903 = options$1903 || {};
        var ast$1905 = parse$1886(code$1902, options$1903.modules || [], options$1903.maxExpands);
        if (options$1903.sourceMap) {
            output$1904 = codegen$1881.generate(ast$1905, {
                comment: true,
                sourceMap: options$1903.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1904.code,
                sourceMap: output$1904.map.toString()
            };
        }
        return { code: codegen$1881.generate(ast$1905, { comment: true }) };
    }
    function loadNodeModule$1888(root$1906, moduleName$1907) {
        var Module$1908 = module.constructor;
        var mock$1909 = {
                id: root$1906 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1906) ? [root$1906] : Module$1908._nodeModulePaths(root$1906)
            };
        var path$1910 = Module$1908._resolveFilename(moduleName$1907, mock$1909);
        return expandModule$1883(fs$1880.readFileSync(path$1910, 'utf8'));
    }
    exports$1874.expand = expand$1882;
    exports$1874.parse = parse$1886;
    exports$1874.compile = compile$1887;
    exports$1874.loadModule = expandModule$1883;
    exports$1874.loadNodeModule = loadNodeModule$1888;
}));
//# sourceMappingURL=sweet.js.map