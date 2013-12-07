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
(function (root$2026, factory$2027) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2028 = require('./parser');
        var expander$2029 = require('./expander');
        var syn$2030 = require('./syntax');
        var codegen$2031 = require('escodegen');
        var path$2032 = require('path');
        var fs$2033 = require('fs');
        var lib$2034 = path$2032.join(path$2032.dirname(fs$2033.realpathSync(__filename)), '../macros');
        var stxcaseModule$2035 = fs$2033.readFileSync(lib$2034 + '/stxcase.js', 'utf8');
        factory$2027(exports, parser$2028, expander$2029, syn$2030, stxcaseModule$2035, codegen$2031);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2036, filename$2037) {
            var content$2038 = require('fs').readFileSync(filename$2037, 'utf8');
            module$2036._compile(codegen$2031.generate(exports.parse(content$2038)), filename$2037);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2027);
    }
}(this, function (exports$2039, parser$2040, expander$2041, syn$2042, stxcaseModule$2043, gen$2044) {
    var codegen$2045 = gen$2044 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2046(code$2049, globalMacros$2050) {
        var program$2051, toString$2052;
        globalMacros$2050 = globalMacros$2050 || '';
        toString$2052 = String;
        if (typeof code$2049 !== 'string' && !(code$2049 instanceof String)) {
            code$2049 = toString$2052(code$2049);
        }
        var source$2053 = code$2049;
        if (source$2053.length > 0) {
            if (typeof source$2053[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2049 instanceof String) {
                    source$2053 = code$2049.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2053[0] === 'undefined') {
                    source$2053 = stringToArray(code$2049);
                }
            }
        }
        var readTree$2054 = parser$2040.read(source$2053);
        try {
            return expander$2041.expand(readTree$2054, stxcaseModule$2043 + '\n' + globalMacros$2050);
        } catch (err$2055) {
            if (err$2055 instanceof syn$2042.MacroSyntaxError) {
                throw new SyntaxError(syn$2042.printSyntaxError(source$2053, err$2055));
            } else {
                throw err$2055;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2047(code$2056, globalMacros$2057) {
        if (code$2056 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2056 = ' ';
        }
        return parser$2040.parse(expand$2046(code$2056, globalMacros$2057));
    }
    exports$2039.expand = expand$2046;
    exports$2039.parse = parse$2047;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2039.compile = function compile$2048(code$2058, options$2059) {
        var output$2060;
        options$2059 = options$2059 || {};
        var ast$2061 = parse$2047(code$2058, options$2059.macros);
        if (options$2059.sourceMap) {
            output$2060 = codegen$2045.generate(ast$2061, {
                comment: true,
                sourceMap: options$2059.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2060.code,
                sourceMap: output$2060.map.toString()
            };
        }
        return { code: codegen$2045.generate(ast$2061, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map