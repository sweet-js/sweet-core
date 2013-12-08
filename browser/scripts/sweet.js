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
(function (root$2231, factory$2232) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2233 = require('./parser');
        var expander$2234 = require('./expander');
        var syn$2235 = require('./syntax');
        var codegen$2236 = require('escodegen');
        var path$2237 = require('path');
        var fs$2238 = require('fs');
        var lib$2239 = path$2237.join(path$2237.dirname(fs$2238.realpathSync(__filename)), '../macros');
        var stxcaseModule$2240 = fs$2238.readFileSync(lib$2239 + '/stxcase.js', 'utf8');
        factory$2232(exports, parser$2233, expander$2234, syn$2235, stxcaseModule$2240, codegen$2236);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2241, filename$2242) {
            var content$2243 = require('fs').readFileSync(filename$2242, 'utf8');
            module$2241._compile(codegen$2236.generate(exports.parse(content$2243)), filename$2242);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2232);
    }
}(this, function (exports$2244, parser$2245, expander$2246, syn$2247, stxcaseModule$2248, gen$2249) {
    var codegen$2250 = gen$2249 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2251(code$2254, globalMacros$2255) {
        var program$2256, toString$2257;
        globalMacros$2255 = globalMacros$2255 || '';
        toString$2257 = String;
        if (typeof code$2254 !== 'string' && !(code$2254 instanceof String)) {
            code$2254 = toString$2257(code$2254);
        }
        var source$2258 = code$2254;
        if (source$2258.length > 0) {
            if (typeof source$2258[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2254 instanceof String) {
                    source$2258 = code$2254.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2258[0] === 'undefined') {
                    source$2258 = stringToArray(code$2254);
                }
            }
        }
        var readTree$2259 = parser$2245.read(source$2258);
        try {
            return expander$2246.expand(readTree$2259, stxcaseModule$2248 + '\n' + globalMacros$2255);
        } catch (err$2260) {
            if (err$2260 instanceof syn$2247.MacroSyntaxError) {
                throw new SyntaxError(syn$2247.printSyntaxError(source$2258, err$2260));
            } else {
                throw err$2260;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2252(code$2261, globalMacros$2262) {
        if (code$2261 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2261 = ' ';
        }
        return parser$2245.parse(expand$2251(code$2261, globalMacros$2262));
    }
    exports$2244.expand = expand$2251;
    exports$2244.parse = parse$2252;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2244.compile = function compile$2253(code$2263, options$2264) {
        var output$2265;
        options$2264 = options$2264 || {};
        var ast$2266 = parse$2252(code$2263, options$2264.macros);
        if (options$2264.sourceMap) {
            output$2265 = codegen$2250.generate(ast$2266, {
                comment: true,
                sourceMap: options$2264.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2265.code,
                sourceMap: output$2265.map.toString()
            };
        }
        return { code: codegen$2250.generate(ast$2266, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map