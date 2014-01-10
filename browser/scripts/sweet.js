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
(function (root$1846, factory$1847) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1848 = require('./parser');
        var expander$1849 = require('./expander');
        var syn$1850 = require('./syntax');
        var codegen$1851 = require('escodegen');
        var path$1852 = require('path');
        var fs$1853 = require('fs');
        var lib$1854 = path$1852.join(path$1852.dirname(fs$1853.realpathSync(__filename)), '../macros');
        var stxcaseModule$1855 = fs$1853.readFileSync(lib$1854 + '/stxcase.js', 'utf8');
        factory$1847(exports, parser$1848, expander$1849, syn$1850, stxcaseModule$1855, codegen$1851, fs$1853);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1856, filename$1857) {
            var content$1858 = require('fs').readFileSync(filename$1857, 'utf8');
            module$1856._compile(codegen$1851.generate(exports.parse(content$1858)), filename$1857);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1847);
    }
}(this, function (exports$1859, parser$1860, expander$1861, syn$1862, stxcaseModule$1863, gen$1864, fs$1865) {
    var codegen$1866 = gen$1864 || escodegen;
    var expand$1867 = makeExpand$1870(expander$1861.expand);
    var expandModule$1868 = makeExpand$1870(expander$1861.expandModule);
    var stxcaseCtx$1869;
    function makeExpand$1870(expandFn$1874) {
        // fun (Str) -> [...CSyntax]
        return function expand$1875(code$1876, modules$1877, maxExpands$1878) {
            var program$1879, toString$1880;
            modules$1877 = modules$1877 || [];
            if (!stxcaseCtx$1869) {
                stxcaseCtx$1869 = expander$1861.expandModule(parser$1860.read(stxcaseModule$1863));
            }
            toString$1880 = String;
            if (typeof code$1876 !== 'string' && !(code$1876 instanceof String)) {
                code$1876 = toString$1880(code$1876);
            }
            var source$1881 = code$1876;
            if (source$1881.length > 0) {
                if (typeof source$1881[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$1876 instanceof String) {
                        source$1881 = code$1876.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$1881[0] === 'undefined') {
                        source$1881 = stringToArray(code$1876);
                    }
                }
            }
            var readTree$1882 = parser$1860.read(source$1881);
            try {
                return expandFn$1874(readTree$1882, [stxcaseCtx$1869].concat(modules$1877), maxExpands$1878);
            } catch (err$1883) {
                if (err$1883 instanceof syn$1862.MacroSyntaxError) {
                    throw new SyntaxError(syn$1862.printSyntaxError(source$1881, err$1883));
                } else {
                    throw err$1883;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$1871(code$1884, modules$1885, maxExpands$1886) {
        if (code$1884 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1884 = ' ';
        }
        return parser$1860.parse(expand$1867(code$1884, modules$1885, maxExpands$1886));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$1872(code$1887, options$1888) {
        var output$1889;
        options$1888 = options$1888 || {};
        var ast$1890 = parse$1871(code$1887, options$1888.modules || [], options$1888.maxExpands);
        if (options$1888.sourceMap) {
            output$1889 = codegen$1866.generate(ast$1890, {
                comment: true,
                sourceMap: options$1888.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1889.code,
                sourceMap: output$1889.map.toString()
            };
        }
        return { code: codegen$1866.generate(ast$1890, { comment: true }) };
    }
    function loadNodeModule$1873(root$1891, moduleName$1892) {
        var Module$1893 = module.constructor;
        var mock$1894 = {
                id: root$1891 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$1891) ? [root$1891] : Module$1893._nodeModulePaths(root$1891)
            };
        var path$1895 = Module$1893._resolveFilename(moduleName$1892, mock$1894);
        return expandModule$1868(fs$1865.readFileSync(path$1895, 'utf8'));
    }
    exports$1859.expand = expand$1867;
    exports$1859.parse = parse$1871;
    exports$1859.compile = compile$1872;
    exports$1859.loadModule = expandModule$1868;
    exports$1859.loadNodeModule = loadNodeModule$1873;
}));
//# sourceMappingURL=sweet.js.map