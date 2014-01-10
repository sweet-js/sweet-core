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
(function (root$1851, factory$1852) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1853 = require('./parser');
        var expander$1854 = require('./expander');
        var syn$1855 = require('./syntax');
        var codegen$1856 = require('escodegen');
        var path$1857 = require('path');
        var fs$1858 = require('fs');
        var lib$1859 = path$1857.join(path$1857.dirname(fs$1858.realpathSync(__filename)), '../macros');
        var stxcaseModule$1860 = fs$1858.readFileSync(lib$1859 + '/stxcase.js', 'utf8');
        factory$1852(exports, parser$1853, expander$1854, syn$1855, stxcaseModule$1860, codegen$1856, fs$1858);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1861, filename$1862) {
            var content$1863 = require('fs').readFileSync(filename$1862, 'utf8');
            module$1861._compile(codegen$1856.generate(exports.parse(content$1863)), filename$1862);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1852);
    }
}(this, function (exports$1864, parser$1865, expander$1866, syn$1867, stxcaseModule$1868, gen$1869, fs$1870) {
    var codegen$1871 = gen$1869 || escodegen;
    var expand$1872 = makeExpand$1875(expander$1866.expand);
    var expandModule$1873 = makeExpand$1875(expander$1866.expandModule);
    var stxcaseCtx$1874;
    function makeExpand$1875(expandFn$1879) {
        // fun (Str) -> [...CSyntax]
        return function expand$1880(code$1881, modules$1882, maxExpands$1883) {
            var program$1884, toString$1885;
            modules$1882 = modules$1882 || [];
            if (!stxcaseCtx$1874) {
                stxcaseCtx$1874 = expander$1866.expandModule(parser$1865.read(stxcaseModule$1868));
            }
            toString$1885 = String;
            if (typeof code$1881 !== 'string' && !(code$1881 instanceof String)) {
                code$1881 = toString$1885(code$1881);
            }
            var source$1886 = code$1881;
            if (source$1886.length > 0) {
                if (typeof source$1886[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1881 instanceof String) {
                        source$1886 = code$1881.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1886[0] === 'undefined') {
                        source$1886 = stringToArray(code$1881);
                    }
                }
            }
            var readTree$1887 = parser$1865.read(source$1886);
            try {
                return expandFn$1879(readTree$1887, [stxcaseCtx$1874].concat(modules$1882), maxExpands$1883);
            } catch (err$1888) {
                if (err$1888 instanceof syn$1867.MacroSyntaxError) {
                    throw new SyntaxError(syn$1867.printSyntaxError(source$1886, err$1888));
                } else {
                    throw err$1888;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1876(code$1889, modules$1890, maxExpands$1891) {
        if (code$1889 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1889 = ' ';
        }
        return parser$1865.parse(expand$1872(code$1889, modules$1890, maxExpands$1891));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1877(code$1892, options$1893) {
        var output$1894;
        options$1893 = options$1893 || {};
        var ast$1895 = parse$1876(code$1892, options$1893.modules || [], options$1893.maxExpands);
        if (options$1893.sourceMap) {
            output$1894 = codegen$1871.generate(ast$1895, {
                comment: true,
                sourceMap: options$1893.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1894.code,
                sourceMap: output$1894.map.toString()
            };
        }
        return { code: codegen$1871.generate(ast$1895, { comment: true }) };
    }
    function loadNodeModule$1878(root$1896, moduleName$1897) {
        var Module$1898 = module.constructor;
        var mock$1899 = {
                id: root$1896 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1896) ? [root$1896] : Module$1898._nodeModulePaths(root$1896)
            };
        var path$1900 = Module$1898._resolveFilename(moduleName$1897, mock$1899);
        return expandModule$1873(fs$1870.readFileSync(path$1900, 'utf8'));
    }
    exports$1864.expand = expand$1872;
    exports$1864.parse = parse$1876;
    exports$1864.compile = compile$1877;
    exports$1864.loadModule = expandModule$1873;
    exports$1864.loadNodeModule = loadNodeModule$1878;
}));
//# sourceMappingURL=sweet.js.map