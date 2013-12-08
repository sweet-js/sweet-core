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
(function (root$2250, factory$2251) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2252 = require('./parser');
        var expander$2253 = require('./expander');
        var syn$2254 = require('./syntax');
        var codegen$2255 = require('escodegen');
        var path$2256 = require('path');
        var fs$2257 = require('fs');
        var lib$2258 = path$2256.join(path$2256.dirname(fs$2257.realpathSync(__filename)), '../macros');
        var stxcaseModule$2259 = fs$2257.readFileSync(lib$2258 + '/stxcase.js', 'utf8');
        factory$2251(exports, parser$2252, expander$2253, syn$2254, stxcaseModule$2259, codegen$2255);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2260, filename$2261) {
            var content$2262 = require('fs').readFileSync(filename$2261, 'utf8');
            module$2260._compile(codegen$2255.generate(exports.parse(content$2262)), filename$2261);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2251);
    }
}(this, function (exports$2263, parser$2264, expander$2265, syn$2266, stxcaseModule$2267, gen$2268) {
    var codegen$2269 = gen$2268 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2270(code$2273, globalMacros$2274) {
        var program$2275, toString$2276;
        globalMacros$2274 = globalMacros$2274 || '';
        toString$2276 = String;
        if (typeof code$2273 !== 'string' && !(code$2273 instanceof String)) {
            code$2273 = toString$2276(code$2273);
        }
        var source$2277 = code$2273;
        if (source$2277.length > 0) {
            if (typeof source$2277[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2273 instanceof String) {
                    source$2277 = code$2273.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2277[0] === 'undefined') {
                    source$2277 = stringToArray(code$2273);
                }
            }
        }
        var readTree$2278 = parser$2264.read(source$2277);
        try {
            return expander$2265.expand(readTree$2278, stxcaseModule$2267 + '\n' + globalMacros$2274);
        } catch (err$2279) {
            if (err$2279 instanceof syn$2266.MacroSyntaxError) {
                throw new SyntaxError(syn$2266.printSyntaxError(source$2277, err$2279));
            } else {
                throw err$2279;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2271(code$2280, globalMacros$2281) {
        if (code$2280 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2280 = ' ';
        }
        return parser$2264.parse(expand$2270(code$2280, globalMacros$2281));
    }
    exports$2263.expand = expand$2270;
    exports$2263.parse = parse$2271;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2263.compile = function compile$2272(code$2282, options$2283) {
        var output$2284;
        options$2283 = options$2283 || {};
        var ast$2285 = parse$2271(code$2282, options$2283.macros);
        if (options$2283.sourceMap) {
            output$2284 = codegen$2269.generate(ast$2285, {
                comment: true,
                sourceMap: options$2283.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2284.code,
                sourceMap: output$2284.map.toString()
            };
        }
        return { code: codegen$2269.generate(ast$2285, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map