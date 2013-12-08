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
(function (root$2244, factory$2245) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2246 = require('./parser');
        var expander$2247 = require('./expander');
        var syn$2248 = require('./syntax');
        var codegen$2249 = require('escodegen');
        var path$2250 = require('path');
        var fs$2251 = require('fs');
        var lib$2252 = path$2250.join(path$2250.dirname(fs$2251.realpathSync(__filename)), '../macros');
        var stxcaseModule$2253 = fs$2251.readFileSync(lib$2252 + '/stxcase.js', 'utf8');
        factory$2245(exports, parser$2246, expander$2247, syn$2248, stxcaseModule$2253, codegen$2249);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2254, filename$2255) {
            var content$2256 = require('fs').readFileSync(filename$2255, 'utf8');
            module$2254._compile(codegen$2249.generate(exports.parse(content$2256)), filename$2255);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2245);
    }
}(this, function (exports$2257, parser$2258, expander$2259, syn$2260, stxcaseModule$2261, gen$2262) {
    var codegen$2263 = gen$2262 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2264(code$2267, globalMacros$2268) {
        var program$2269, toString$2270;
        globalMacros$2268 = globalMacros$2268 || '';
        toString$2270 = String;
        if (typeof code$2267 !== 'string' && !(code$2267 instanceof String)) {
            code$2267 = toString$2270(code$2267);
        }
        var source$2271 = code$2267;
        if (source$2271.length > 0) {
            if (typeof source$2271[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2267 instanceof String) {
                    source$2271 = code$2267.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2271[0] === 'undefined') {
                    source$2271 = stringToArray(code$2267);
                }
            }
        }
        var readTree$2272 = parser$2258.read(source$2271);
        try {
            return expander$2259.expand(readTree$2272, stxcaseModule$2261 + '\n' + globalMacros$2268);
        } catch (err$2273) {
            if (err$2273 instanceof syn$2260.MacroSyntaxError) {
                throw new SyntaxError(syn$2260.printSyntaxError(source$2271, err$2273));
            } else {
                throw err$2273;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2265(code$2274, globalMacros$2275) {
        if (code$2274 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2274 = ' ';
        }
        return parser$2258.parse(expand$2264(code$2274, globalMacros$2275));
    }
    exports$2257.expand = expand$2264;
    exports$2257.parse = parse$2265;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2257.compile = function compile$2266(code$2276, options$2277) {
        var output$2278;
        options$2277 = options$2277 || {};
        var ast$2279 = parse$2265(code$2276, options$2277.macros);
        if (options$2277.sourceMap) {
            output$2278 = codegen$2263.generate(ast$2279, {
                comment: true,
                sourceMap: options$2277.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2278.code,
                sourceMap: output$2278.map.toString()
            };
        }
        return { code: codegen$2263.generate(ast$2279, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map