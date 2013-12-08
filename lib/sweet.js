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
(function (root$2269, factory$2270) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2271 = require('./parser');
        var expander$2272 = require('./expander');
        var syn$2273 = require('./syntax');
        var codegen$2274 = require('escodegen');
        var path$2275 = require('path');
        var fs$2276 = require('fs');
        var lib$2277 = path$2275.join(path$2275.dirname(fs$2276.realpathSync(__filename)), '../macros');
        var stxcaseModule$2278 = fs$2276.readFileSync(lib$2277 + '/stxcase.js', 'utf8');
        factory$2270(exports, parser$2271, expander$2272, syn$2273, stxcaseModule$2278, codegen$2274);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2279, filename$2280) {
            var content$2281 = require('fs').readFileSync(filename$2280, 'utf8');
            module$2279._compile(codegen$2274.generate(exports.parse(content$2281)), filename$2280);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2270);
    }
}(this, function (exports$2282, parser$2283, expander$2284, syn$2285, stxcaseModule$2286, gen$2287) {
    var codegen$2288 = gen$2287 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2289(code$2292, globalMacros$2293) {
        var program$2294, toString$2295;
        globalMacros$2293 = globalMacros$2293 || '';
        toString$2295 = String;
        if (typeof code$2292 !== 'string' && !(code$2292 instanceof String)) {
            code$2292 = toString$2295(code$2292);
        }
        var source$2296 = code$2292;
        if (source$2296.length > 0) {
            if (typeof source$2296[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2292 instanceof String) {
                    source$2296 = code$2292.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2296[0] === 'undefined') {
                    source$2296 = stringToArray(code$2292);
                }
            }
        }
        var readTree$2297 = parser$2283.read(source$2296);
        try {
            return expander$2284.expand(readTree$2297, stxcaseModule$2286 + '\n' + globalMacros$2293);
        } catch (err$2298) {
            if (err$2298 instanceof syn$2285.MacroSyntaxError) {
                throw new SyntaxError(syn$2285.printSyntaxError(source$2296, err$2298));
            } else {
                throw err$2298;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2290(code$2299, globalMacros$2300) {
        if (code$2299 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2299 = ' ';
        }
        return parser$2283.parse(expand$2289(code$2299, globalMacros$2300));
    }
    exports$2282.expand = expand$2289;
    exports$2282.parse = parse$2290;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2282.compile = function compile$2291(code$2301, options$2302) {
        var output$2303;
        options$2302 = options$2302 || {};
        var ast$2304 = parse$2290(code$2301, options$2302.macros);
        if (options$2302.sourceMap) {
            output$2303 = codegen$2288.generate(ast$2304, {
                comment: true,
                sourceMap: options$2302.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2303.code,
                sourceMap: output$2303.map.toString()
            };
        }
        return { code: codegen$2288.generate(ast$2304, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map