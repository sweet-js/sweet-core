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
(function (root$2249, factory$2250) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2251 = require('./parser');
        var expander$2252 = require('./expander');
        var syn$2253 = require('./syntax');
        var codegen$2254 = require('escodegen');
        var path$2255 = require('path');
        var fs$2256 = require('fs');
        var lib$2257 = path$2255.join(path$2255.dirname(fs$2256.realpathSync(__filename)), '../macros');
        var stxcaseModule$2258 = fs$2256.readFileSync(lib$2257 + '/stxcase.js', 'utf8');
        factory$2250(exports, parser$2251, expander$2252, syn$2253, stxcaseModule$2258, codegen$2254);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2259, filename$2260) {
            var content$2261 = require('fs').readFileSync(filename$2260, 'utf8');
            module$2259._compile(codegen$2254.generate(exports.parse(content$2261)), filename$2260);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2250);
    }
}(this, function (exports$2262, parser$2263, expander$2264, syn$2265, stxcaseModule$2266, gen$2267) {
    var codegen$2268 = gen$2267 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2269(code$2272, globalMacros$2273) {
        var program$2274, toString$2275;
        globalMacros$2273 = globalMacros$2273 || '';
        toString$2275 = String;
        if (typeof code$2272 !== 'string' && !(code$2272 instanceof String)) {
            code$2272 = toString$2275(code$2272);
        }
        var source$2276 = code$2272;
        if (source$2276.length > 0) {
            if (typeof source$2276[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2272 instanceof String) {
                    source$2276 = code$2272.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2276[0] === 'undefined') {
                    source$2276 = stringToArray(code$2272);
                }
            }
        }
        var readTree$2277 = parser$2263.read(source$2276);
        try {
            return expander$2264.expand(readTree$2277, stxcaseModule$2266 + '\n' + globalMacros$2273);
        } catch (err$2278) {
            if (err$2278 instanceof syn$2265.MacroSyntaxError) {
                throw new SyntaxError(syn$2265.printSyntaxError(source$2276, err$2278));
            } else {
                throw err$2278;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2270(code$2279, globalMacros$2280) {
        if (code$2279 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2279 = ' ';
        }
        return parser$2263.parse(expand$2269(code$2279, globalMacros$2280));
    }
    exports$2262.expand = expand$2269;
    exports$2262.parse = parse$2270;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2262.compile = function compile$2271(code$2281, options$2282) {
        var output$2283;
        options$2282 = options$2282 || {};
        var ast$2284 = parse$2270(code$2281, options$2282.macros);
        if (options$2282.sourceMap) {
            output$2283 = codegen$2268.generate(ast$2284, {
                comment: true,
                sourceMap: options$2282.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2283.code,
                sourceMap: output$2283.map.toString()
            };
        }
        return { code: codegen$2268.generate(ast$2284, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map