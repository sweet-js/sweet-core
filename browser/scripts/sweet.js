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
(function (root$2253, factory$2254) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2255 = require('./parser');
        var expander$2256 = require('./expander');
        var syn$2257 = require('./syntax');
        var codegen$2258 = require('escodegen');
        var path$2259 = require('path');
        var fs$2260 = require('fs');
        var lib$2261 = path$2259.join(path$2259.dirname(fs$2260.realpathSync(__filename)), '../macros');
        var stxcaseModule$2262 = fs$2260.readFileSync(lib$2261 + '/stxcase.js', 'utf8');
        factory$2254(exports, parser$2255, expander$2256, syn$2257, stxcaseModule$2262, codegen$2258);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2263, filename$2264) {
            var content$2265 = require('fs').readFileSync(filename$2264, 'utf8');
            module$2263._compile(codegen$2258.generate(exports.parse(content$2265)), filename$2264);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2254);
    }
}(this, function (exports$2266, parser$2267, expander$2268, syn$2269, stxcaseModule$2270, gen$2271) {
    var codegen$2272 = gen$2271 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2273(code$2276, globalMacros$2277) {
        var program$2278, toString$2279;
        globalMacros$2277 = globalMacros$2277 || '';
        toString$2279 = String;
        if (typeof code$2276 !== 'string' && !(code$2276 instanceof String)) {
            code$2276 = toString$2279(code$2276);
        }
        var source$2280 = code$2276;
        if (source$2280.length > 0) {
            if (typeof source$2280[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2276 instanceof String) {
                    source$2280 = code$2276.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2280[0] === 'undefined') {
                    source$2280 = stringToArray(code$2276);
                }
            }
        }
        var readTree$2281 = parser$2267.read(source$2280);
        try {
            return expander$2268.expand(readTree$2281, stxcaseModule$2270 + '\n' + globalMacros$2277);
        } catch (err$2282) {
            if (err$2282 instanceof syn$2269.MacroSyntaxError) {
                throw new SyntaxError(syn$2269.printSyntaxError(source$2280, err$2282));
            } else {
                throw err$2282;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2274(code$2283, globalMacros$2284) {
        if (code$2283 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2283 = ' ';
        }
        return parser$2267.parse(expand$2273(code$2283, globalMacros$2284));
    }
    exports$2266.expand = expand$2273;
    exports$2266.parse = parse$2274;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2266.compile = function compile$2275(code$2285, options$2286) {
        var output$2287;
        options$2286 = options$2286 || {};
        var ast$2288 = parse$2274(code$2285, options$2286.macros);
        if (options$2286.sourceMap) {
            output$2287 = codegen$2272.generate(ast$2288, {
                comment: true,
                sourceMap: options$2286.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2287.code,
                sourceMap: output$2287.map.toString()
            };
        }
        return { code: codegen$2272.generate(ast$2288, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map