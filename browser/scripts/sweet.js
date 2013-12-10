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
(function (root$2295, factory$2296) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2297 = require('./parser');
        var expander$2298 = require('./expander');
        var syn$2299 = require('./syntax');
        var codegen$2300 = require('escodegen');
        var path$2301 = require('path');
        var fs$2302 = require('fs');
        var lib$2303 = path$2301.join(path$2301.dirname(fs$2302.realpathSync(__filename)), '../macros');
        var stxcaseModule$2304 = fs$2302.readFileSync(lib$2303 + '/stxcase.js', 'utf8');
        factory$2296(exports, parser$2297, expander$2298, syn$2299, stxcaseModule$2304, codegen$2300);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2305, filename$2306) {
            var content$2307 = require('fs').readFileSync(filename$2306, 'utf8');
            module$2305._compile(codegen$2300.generate(exports.parse(content$2307)), filename$2306);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2296);
    }
}(this, function (exports$2308, parser$2309, expander$2310, syn$2311, stxcaseModule$2312, gen$2313) {
    var codegen$2314 = gen$2313 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2315(code$2318, globalMacros$2319) {
        var program$2320, toString$2321;
        globalMacros$2319 = globalMacros$2319 || '';
        toString$2321 = String;
        if (typeof code$2318 !== 'string' && !(code$2318 instanceof String)) {
            code$2318 = toString$2321(code$2318);
        }
        var source$2322 = code$2318;
        if (source$2322.length > 0) {
            if (typeof source$2322[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2318 instanceof String) {
                    source$2322 = code$2318.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2322[0] === 'undefined') {
                    source$2322 = stringToArray(code$2318);
                }
            }
        }
        var readTree$2323 = parser$2309.read(source$2322);
        try {
            return expander$2310.expand(readTree$2323, stxcaseModule$2312 + '\n' + globalMacros$2319);
        } catch (err$2324) {
            if (err$2324 instanceof syn$2311.MacroSyntaxError) {
                throw new SyntaxError(syn$2311.printSyntaxError(source$2322, err$2324));
            } else {
                throw err$2324;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2316(code$2325, globalMacros$2326) {
        if (code$2325 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2325 = ' ';
        }
        return parser$2309.parse(expand$2315(code$2325, globalMacros$2326));
    }
    exports$2308.expand = expand$2315;
    exports$2308.parse = parse$2316;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2308.compile = function compile$2317(code$2327, options$2328) {
        var output$2329;
        options$2328 = options$2328 || {};
        var ast$2330 = parse$2316(code$2327, options$2328.macros);
        if (options$2328.sourceMap) {
            output$2329 = codegen$2314.generate(ast$2330, {
                comment: true,
                sourceMap: options$2328.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2329.code,
                sourceMap: output$2329.map.toString()
            };
        }
        return { code: codegen$2314.generate(ast$2330, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map