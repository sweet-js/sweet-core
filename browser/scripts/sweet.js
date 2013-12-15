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
(function (root$2518, factory$2519) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2520 = require('./parser');
        var expander$2521 = require('./expander');
        var syn$2522 = require('./syntax');
        var codegen$2523 = require('escodegen');
        var path$2524 = require('path');
        var fs$2525 = require('fs');
        var lib$2526 = path$2524.join(path$2524.dirname(fs$2525.realpathSync(__filename)), '../macros');
        var stxcaseModule$2527 = fs$2525.readFileSync(lib$2526 + '/stxcase.js', 'utf8');
        factory$2519(exports, parser$2520, expander$2521, syn$2522, stxcaseModule$2527, codegen$2523);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2528, filename$2529) {
            var content$2530 = require('fs').readFileSync(filename$2529, 'utf8');
            module$2528._compile(codegen$2523.generate(exports.parse(content$2530)), filename$2529);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2519);
    }
}(this, function (exports$2531, parser$2532, expander$2533, syn$2534, stxcaseModule$2535, gen$2536) {
    var codegen$2537 = gen$2536 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2538(code$2541, globalMacros$2542, maxExpands$2543) {
        var program$2544, toString$2545;
        globalMacros$2542 = globalMacros$2542 || '';
        toString$2545 = String;
        if (typeof code$2541 !== 'string' && !(code$2541 instanceof String)) {
            code$2541 = toString$2545(code$2541);
        }
        var source$2546 = code$2541;
        if (source$2546.length > 0) {
            if (typeof source$2546[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2541 instanceof String) {
                    source$2546 = code$2541.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2546[0] === 'undefined') {
                    source$2546 = stringToArray(code$2541);
                }
            }
        }
        var readTree$2547 = parser$2532.read(source$2546);
        try {
            return expander$2533.expand(readTree$2547, stxcaseModule$2535 + '\n' + globalMacros$2542, maxExpands$2543);
        } catch (err$2548) {
            if (err$2548 instanceof syn$2534.MacroSyntaxError) {
                throw new SyntaxError(syn$2534.printSyntaxError(source$2546, err$2548));
            } else {
                throw err$2548;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2539(code$2549, globalMacros$2550, maxExpands$2551) {
        if (code$2549 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2549 = ' ';
        }
        return parser$2532.parse(expand$2538(code$2549, globalMacros$2550, maxExpands$2551));
    }
    exports$2531.expand = expand$2538;
    exports$2531.parse = parse$2539;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2531.compile = function compile$2540(code$2552, options$2553) {
        var output$2554;
        options$2553 = options$2553 || {};
        var ast$2555 = parse$2539(code$2552, options$2553.macros);
        if (options$2553.sourceMap) {
            output$2554 = codegen$2537.generate(ast$2555, {
                comment: true,
                sourceMap: options$2553.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2554.code,
                sourceMap: output$2554.map.toString()
            };
        }
        return { code: codegen$2537.generate(ast$2555, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map