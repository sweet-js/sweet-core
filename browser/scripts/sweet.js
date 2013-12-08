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
(function (root$2247, factory$2248) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2249 = require('./parser');
        var expander$2250 = require('./expander');
        var syn$2251 = require('./syntax');
        var codegen$2252 = require('escodegen');
        var path$2253 = require('path');
        var fs$2254 = require('fs');
        var lib$2255 = path$2253.join(path$2253.dirname(fs$2254.realpathSync(__filename)), '../macros');
        var stxcaseModule$2256 = fs$2254.readFileSync(lib$2255 + '/stxcase.js', 'utf8');
        factory$2248(exports, parser$2249, expander$2250, syn$2251, stxcaseModule$2256, codegen$2252);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2257, filename$2258) {
            var content$2259 = require('fs').readFileSync(filename$2258, 'utf8');
            module$2257._compile(codegen$2252.generate(exports.parse(content$2259)), filename$2258);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2248);
    }
}(this, function (exports$2260, parser$2261, expander$2262, syn$2263, stxcaseModule$2264, gen$2265) {
    var codegen$2266 = gen$2265 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2267(code$2270, globalMacros$2271) {
        var program$2272, toString$2273;
        globalMacros$2271 = globalMacros$2271 || '';
        toString$2273 = String;
        if (typeof code$2270 !== 'string' && !(code$2270 instanceof String)) {
            code$2270 = toString$2273(code$2270);
        }
        var source$2274 = code$2270;
        if (source$2274.length > 0) {
            if (typeof source$2274[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2270 instanceof String) {
                    source$2274 = code$2270.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2274[0] === 'undefined') {
                    source$2274 = stringToArray(code$2270);
                }
            }
        }
        var readTree$2275 = parser$2261.read(source$2274);
        try {
            return expander$2262.expand(readTree$2275, stxcaseModule$2264 + '\n' + globalMacros$2271);
        } catch (err$2276) {
            if (err$2276 instanceof syn$2263.MacroSyntaxError) {
                throw new SyntaxError(syn$2263.printSyntaxError(source$2274, err$2276));
            } else {
                throw err$2276;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2268(code$2277, globalMacros$2278) {
        if (code$2277 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2277 = ' ';
        }
        return parser$2261.parse(expand$2267(code$2277, globalMacros$2278));
    }
    exports$2260.expand = expand$2267;
    exports$2260.parse = parse$2268;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2260.compile = function compile$2269(code$2279, options$2280) {
        var output$2281;
        options$2280 = options$2280 || {};
        var ast$2282 = parse$2268(code$2279, options$2280.macros);
        if (options$2280.sourceMap) {
            output$2281 = codegen$2266.generate(ast$2282, {
                comment: true,
                sourceMap: options$2280.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2281.code,
                sourceMap: output$2281.map.toString()
            };
        }
        return { code: codegen$2266.generate(ast$2282, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map