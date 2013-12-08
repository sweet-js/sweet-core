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
(function (root$2251, factory$2252) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2253 = require('./parser');
        var expander$2254 = require('./expander');
        var syn$2255 = require('./syntax');
        var codegen$2256 = require('escodegen');
        var path$2257 = require('path');
        var fs$2258 = require('fs');
        var lib$2259 = path$2257.join(path$2257.dirname(fs$2258.realpathSync(__filename)), '../macros');
        var stxcaseModule$2260 = fs$2258.readFileSync(lib$2259 + '/stxcase.js', 'utf8');
        factory$2252(exports, parser$2253, expander$2254, syn$2255, stxcaseModule$2260, codegen$2256);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2261, filename$2262) {
            var content$2263 = require('fs').readFileSync(filename$2262, 'utf8');
            module$2261._compile(codegen$2256.generate(exports.parse(content$2263)), filename$2262);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2252);
    }
}(this, function (exports$2264, parser$2265, expander$2266, syn$2267, stxcaseModule$2268, gen$2269) {
    var codegen$2270 = gen$2269 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2271(code$2274, globalMacros$2275) {
        var program$2276, toString$2277;
        globalMacros$2275 = globalMacros$2275 || '';
        toString$2277 = String;
        if (typeof code$2274 !== 'string' && !(code$2274 instanceof String)) {
            code$2274 = toString$2277(code$2274);
        }
        var source$2278 = code$2274;
        if (source$2278.length > 0) {
            if (typeof source$2278[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2274 instanceof String) {
                    source$2278 = code$2274.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2278[0] === 'undefined') {
                    source$2278 = stringToArray(code$2274);
                }
            }
        }
        var readTree$2279 = parser$2265.read(source$2278);
        try {
            return expander$2266.expand(readTree$2279, stxcaseModule$2268 + '\n' + globalMacros$2275);
        } catch (err$2280) {
            if (err$2280 instanceof syn$2267.MacroSyntaxError) {
                throw new SyntaxError(syn$2267.printSyntaxError(source$2278, err$2280));
            } else {
                throw err$2280;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2272(code$2281, globalMacros$2282) {
        if (code$2281 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2281 = ' ';
        }
        return parser$2265.parse(expand$2271(code$2281, globalMacros$2282));
    }
    exports$2264.expand = expand$2271;
    exports$2264.parse = parse$2272;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2264.compile = function compile$2273(code$2283, options$2284) {
        var output$2285;
        options$2284 = options$2284 || {};
        var ast$2286 = parse$2272(code$2283, options$2284.macros);
        if (options$2284.sourceMap) {
            output$2285 = codegen$2270.generate(ast$2286, {
                comment: true,
                sourceMap: options$2284.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2285.code,
                sourceMap: output$2285.map.toString()
            };
        }
        return { code: codegen$2270.generate(ast$2286, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map