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
(function (root$1855, factory$1856) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1857 = require('./parser');
        var expander$1858 = require('./expander');
        var syn$1859 = require('./syntax');
        var codegen$1860 = require('escodegen');
        var path$1861 = require('path');
        var fs$1862 = require('fs');
        var lib$1863 = path$1861.join(path$1861.dirname(fs$1862.realpathSync(__filename)), '../macros');
        var stxcaseModule$1864 = fs$1862.readFileSync(lib$1863 + '/stxcase.js', 'utf8');
        factory$1856(exports, parser$1857, expander$1858, syn$1859, stxcaseModule$1864, codegen$1860, fs$1862);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1865, filename$1866) {
            var content$1867 = require('fs').readFileSync(filename$1866, 'utf8');
            module$1865._compile(codegen$1860.generate(exports.parse(content$1867)), filename$1866);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1856);
    }
}(this, function (exports$1868, parser$1869, expander$1870, syn$1871, stxcaseModule$1872, gen$1873, fs$1874) {
    var codegen$1875 = gen$1873 || escodegen;
    var expand$1876 = makeExpand$1879(expander$1870.expand);
    var expandModule$1877 = makeExpand$1879(expander$1870.expandModule);
    var stxcaseCtx$1878;
    function makeExpand$1879(expandFn$1883) {
        // fun (Str) -> [...CSyntax]
        return function expand$1884(code$1885, modules$1886, maxExpands$1887) {
            var program$1888, toString$1889;
            modules$1886 = modules$1886 || [];
            if (!stxcaseCtx$1878) {
                stxcaseCtx$1878 = expander$1870.expandModule(parser$1869.read(stxcaseModule$1872));
            }
            toString$1889 = String;
            if (typeof code$1885 !== 'string' && !(code$1885 instanceof String)) {
                code$1885 = toString$1889(code$1885);
            }
            var source$1890 = code$1885;
            if (source$1890.length > 0) {
                if (typeof source$1890[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1885 instanceof String) {
                        source$1890 = code$1885.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1890[0] === 'undefined') {
                        source$1890 = stringToArray(code$1885);
                    }
                }
            }
            var readTree$1891 = parser$1869.read(source$1890);
            try {
                return expandFn$1883(readTree$1891, [stxcaseCtx$1878].concat(modules$1886), maxExpands$1887);
            } catch (err$1892) {
                if (err$1892 instanceof syn$1871.MacroSyntaxError) {
                    throw new SyntaxError(syn$1871.printSyntaxError(source$1890, err$1892));
                } else {
                    throw err$1892;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1880(code$1893, modules$1894, maxExpands$1895) {
        if (code$1893 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1893 = ' ';
        }
        return parser$1869.parse(expand$1876(code$1893, modules$1894, maxExpands$1895));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1881(code$1896, options$1897) {
        var output$1898;
        options$1897 = options$1897 || {};
        var ast$1899 = parse$1880(code$1896, options$1897.modules || [], options$1897.maxExpands);
        if (options$1897.sourceMap) {
            output$1898 = codegen$1875.generate(ast$1899, {
                comment: true,
                sourceMap: options$1897.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1898.code,
                sourceMap: output$1898.map.toString()
            };
        }
        return { code: codegen$1875.generate(ast$1899, { comment: true }) };
    }
    function loadNodeModule$1882(root$1900, moduleName$1901) {
        var Module$1902 = module.constructor;
        var mock$1903 = {
                id: root$1900 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1900) ? [root$1900] : Module$1902._nodeModulePaths(root$1900)
            };
        var path$1904 = Module$1902._resolveFilename(moduleName$1901, mock$1903);
        return expandModule$1877(fs$1874.readFileSync(path$1904, 'utf8'));
    }
    exports$1868.expand = expand$1876;
    exports$1868.parse = parse$1880;
    exports$1868.compile = compile$1881;
    exports$1868.loadModule = expandModule$1877;
    exports$1868.loadNodeModule = loadNodeModule$1882;
}));
//# sourceMappingURL=sweet.js.map