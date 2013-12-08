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
(function (root$2241, factory$2242) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2243 = require('./parser');
        var expander$2244 = require('./expander');
        var syn$2245 = require('./syntax');
        var codegen$2246 = require('escodegen');
        var path$2247 = require('path');
        var fs$2248 = require('fs');
        var lib$2249 = path$2247.join(path$2247.dirname(fs$2248.realpathSync(__filename)), '../macros');
        var stxcaseModule$2250 = fs$2248.readFileSync(lib$2249 + '/stxcase.js', 'utf8');
        factory$2242(exports, parser$2243, expander$2244, syn$2245, stxcaseModule$2250, codegen$2246);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2251, filename$2252) {
            var content$2253 = require('fs').readFileSync(filename$2252, 'utf8');
            module$2251._compile(codegen$2246.generate(exports.parse(content$2253)), filename$2252);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2242);
    }
}(this, function (exports$2254, parser$2255, expander$2256, syn$2257, stxcaseModule$2258, gen$2259) {
    var codegen$2260 = gen$2259 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2261(code$2264, globalMacros$2265) {
        var program$2266, toString$2267;
        globalMacros$2265 = globalMacros$2265 || '';
        toString$2267 = String;
        if (typeof code$2264 !== 'string' && !(code$2264 instanceof String)) {
            code$2264 = toString$2267(code$2264);
        }
        var source$2268 = code$2264;
        if (source$2268.length > 0) {
            if (typeof source$2268[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2264 instanceof String) {
                    source$2268 = code$2264.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2268[0] === 'undefined') {
                    source$2268 = stringToArray(code$2264);
                }
            }
        }
        var readTree$2269 = parser$2255.read(source$2268);
        try {
            return expander$2256.expand(readTree$2269, stxcaseModule$2258 + '\n' + globalMacros$2265);
        } catch (err$2270) {
            if (err$2270 instanceof syn$2257.MacroSyntaxError) {
                throw new SyntaxError(syn$2257.printSyntaxError(source$2268, err$2270));
            } else {
                throw err$2270;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2262(code$2271, globalMacros$2272) {
        if (code$2271 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2271 = ' ';
        }
        return parser$2255.parse(expand$2261(code$2271, globalMacros$2272));
    }
    exports$2254.expand = expand$2261;
    exports$2254.parse = parse$2262;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2254.compile = function compile$2263(code$2273, options$2274) {
        var output$2275;
        options$2274 = options$2274 || {};
        var ast$2276 = parse$2262(code$2273, options$2274.macros);
        if (options$2274.sourceMap) {
            output$2275 = codegen$2260.generate(ast$2276, {
                comment: true,
                sourceMap: options$2274.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2275.code,
                sourceMap: output$2275.map.toString()
            };
        }
        return { code: codegen$2260.generate(ast$2276, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map