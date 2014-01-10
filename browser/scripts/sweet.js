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
(function (root$1854, factory$1855) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1856 = require('./parser');
        var expander$1857 = require('./expander');
        var syn$1858 = require('./syntax');
        var codegen$1859 = require('escodegen');
        var path$1860 = require('path');
        var fs$1861 = require('fs');
        var lib$1862 = path$1860.join(path$1860.dirname(fs$1861.realpathSync(__filename)), '../macros');
        var stxcaseModule$1863 = fs$1861.readFileSync(lib$1862 + '/stxcase.js', 'utf8');
        factory$1855(exports, parser$1856, expander$1857, syn$1858, stxcaseModule$1863, codegen$1859, fs$1861);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1864, filename$1865) {
            var content$1866 = require('fs').readFileSync(filename$1865, 'utf8');
            module$1864._compile(codegen$1859.generate(exports.parse(content$1866)), filename$1865);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1855);
    }
}(this, function (exports$1867, parser$1868, expander$1869, syn$1870, stxcaseModule$1871, gen$1872, fs$1873) {
    var codegen$1874 = gen$1872 || escodegen;
    var expand$1875 = makeExpand$1878(expander$1869.expand);
    var expandModule$1876 = makeExpand$1878(expander$1869.expandModule);
    var stxcaseCtx$1877;
    function makeExpand$1878(expandFn$1882) {
        // fun (Str) -> [...CSyntax]
        return function expand$1883(code$1884, modules$1885, maxExpands$1886) {
            var program$1887, toString$1888;
            modules$1885 = modules$1885 || [];
            if (!stxcaseCtx$1877) {
                stxcaseCtx$1877 = expander$1869.expandModule(parser$1868.read(stxcaseModule$1871));
            }
            toString$1888 = String;
            if (typeof code$1884 !== 'string' && !(code$1884 instanceof String)) {
                code$1884 = toString$1888(code$1884);
            }
            var source$1889 = code$1884;
            if (source$1889.length > 0) {
                if (typeof source$1889[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1884 instanceof String) {
                        source$1889 = code$1884.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1889[0] === 'undefined') {
                        source$1889 = stringToArray(code$1884);
                    }
                }
            }
            var readTree$1890 = parser$1868.read(source$1889);
            try {
                return expandFn$1882(readTree$1890, [stxcaseCtx$1877].concat(modules$1885), maxExpands$1886);
            } catch (err$1891) {
                if (err$1891 instanceof syn$1870.MacroSyntaxError) {
                    throw new SyntaxError(syn$1870.printSyntaxError(source$1889, err$1891));
                } else {
                    throw err$1891;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1879(code$1892, modules$1893, maxExpands$1894) {
        if (code$1892 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1892 = ' ';
        }
        return parser$1868.parse(expand$1875(code$1892, modules$1893, maxExpands$1894));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1880(code$1895, options$1896) {
        var output$1897;
        options$1896 = options$1896 || {};
        var ast$1898 = parse$1879(code$1895, options$1896.modules || [], options$1896.maxExpands);
        if (options$1896.sourceMap) {
            output$1897 = codegen$1874.generate(ast$1898, {
                comment: true,
                sourceMap: options$1896.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1897.code,
                sourceMap: output$1897.map.toString()
            };
        }
        return { code: codegen$1874.generate(ast$1898, { comment: true }) };
    }
    function loadNodeModule$1881(root$1899, moduleName$1900) {
        var Module$1901 = module.constructor;
        var mock$1902 = {
                id: root$1899 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1899) ? [root$1899] : Module$1901._nodeModulePaths(root$1899)
            };
        var path$1903 = Module$1901._resolveFilename(moduleName$1900, mock$1902);
        return expandModule$1876(fs$1873.readFileSync(path$1903, 'utf8'));
    }
    exports$1867.expand = expand$1875;
    exports$1867.parse = parse$1879;
    exports$1867.compile = compile$1880;
    exports$1867.loadModule = expandModule$1876;
    exports$1867.loadNodeModule = loadNodeModule$1881;
}));
//# sourceMappingURL=sweet.js.map