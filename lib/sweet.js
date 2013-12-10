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
(function (root$2258, factory$2259) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2260 = require('./parser');
        var expander$2261 = require('./expander');
        var syn$2262 = require('./syntax');
        var codegen$2263 = require('escodegen');
        var path$2264 = require('path');
        var fs$2265 = require('fs');
        var lib$2266 = path$2264.join(path$2264.dirname(fs$2265.realpathSync(__filename)), '../macros');
        var stxcaseModule$2267 = fs$2265.readFileSync(lib$2266 + '/stxcase.js', 'utf8');
        factory$2259(exports, parser$2260, expander$2261, syn$2262, stxcaseModule$2267, codegen$2263);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2268, filename$2269) {
            var content$2270 = require('fs').readFileSync(filename$2269, 'utf8');
            module$2268._compile(codegen$2263.generate(exports.parse(content$2270)), filename$2269);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2259);
    }
}(this, function (exports$2271, parser$2272, expander$2273, syn$2274, stxcaseModule$2275, gen$2276) {
    var codegen$2277 = gen$2276 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2278(code$2281, globalMacros$2282) {
        var program$2283, toString$2284;
        globalMacros$2282 = globalMacros$2282 || '';
        toString$2284 = String;
        if (typeof code$2281 !== 'string' && !(code$2281 instanceof String)) {
            code$2281 = toString$2284(code$2281);
        }
        var source$2285 = code$2281;
        if (source$2285.length > 0) {
            if (typeof source$2285[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2281 instanceof String) {
                    source$2285 = code$2281.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2285[0] === 'undefined') {
                    source$2285 = stringToArray(code$2281);
                }
            }
        }
        var readTree$2286 = parser$2272.read(source$2285);
        try {
            return expander$2273.expand(readTree$2286, stxcaseModule$2275 + '\n' + globalMacros$2282);
        } catch (err$2287) {
            if (err$2287 instanceof syn$2274.MacroSyntaxError) {
                throw new SyntaxError(syn$2274.printSyntaxError(source$2285, err$2287));
            } else {
                throw err$2287;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2279(code$2288, globalMacros$2289) {
        if (code$2288 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2288 = ' ';
        }
        return parser$2272.parse(expand$2278(code$2288, globalMacros$2289));
    }
    exports$2271.expand = expand$2278;
    exports$2271.parse = parse$2279;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2271.compile = function compile$2280(code$2290, options$2291) {
        var output$2292;
        options$2291 = options$2291 || {};
        var ast$2293 = parse$2279(code$2290, options$2291.macros);
        if (options$2291.sourceMap) {
            output$2292 = codegen$2277.generate(ast$2293, {
                comment: true,
                sourceMap: options$2291.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2292.code,
                sourceMap: output$2292.map.toString()
            };
        }
        return { code: codegen$2277.generate(ast$2293, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map