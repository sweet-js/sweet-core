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
(function (root$2513, factory$2514) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2515 = require('./parser');
        var expander$2516 = require('./expander');
        var syn$2517 = require('./syntax');
        var codegen$2518 = require('escodegen');
        var path$2519 = require('path');
        var fs$2520 = require('fs');
        var lib$2521 = path$2519.join(path$2519.dirname(fs$2520.realpathSync(__filename)), '../macros');
        var stxcaseModule$2522 = fs$2520.readFileSync(lib$2521 + '/stxcase.js', 'utf8');
        factory$2514(exports, parser$2515, expander$2516, syn$2517, stxcaseModule$2522, codegen$2518);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2523, filename$2524) {
            var content$2525 = require('fs').readFileSync(filename$2524, 'utf8');
            module$2523._compile(codegen$2518.generate(exports.parse(content$2525)), filename$2524);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2514);
    }
}(this, function (exports$2526, parser$2527, expander$2528, syn$2529, stxcaseModule$2530, gen$2531) {
    var codegen$2532 = gen$2531 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2533(code$2536, globalMacros$2537, maxExpands$2538) {
        var program$2539, toString$2540;
        globalMacros$2537 = globalMacros$2537 || '';
        toString$2540 = String;
        if (typeof code$2536 !== 'string' && !(code$2536 instanceof String)) {
            code$2536 = toString$2540(code$2536);
        }
        var source$2541 = code$2536;
        if (source$2541.length > 0) {
            if (typeof source$2541[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2536 instanceof String) {
                    source$2541 = code$2536.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2541[0] === 'undefined') {
                    source$2541 = stringToArray(code$2536);
                }
            }
        }
        var readTree$2542 = parser$2527.read(source$2541);
        try {
            return expander$2528.expand(readTree$2542, stxcaseModule$2530 + '\n' + globalMacros$2537, maxExpands$2538);
        } catch (err$2543) {
            if (err$2543 instanceof syn$2529.MacroSyntaxError) {
                throw new SyntaxError(syn$2529.printSyntaxError(source$2541, err$2543));
            } else {
                throw err$2543;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2534(code$2544, globalMacros$2545, maxExpands$2546) {
        if (code$2544 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2544 = ' ';
        }
        return parser$2527.parse(expand$2533(code$2544, globalMacros$2545, maxExpands$2546));
    }
    exports$2526.expand = expand$2533;
    exports$2526.parse = parse$2534;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2526.compile = function compile$2535(code$2547, options$2548) {
        var output$2549;
        options$2548 = options$2548 || {};
        var ast$2550 = parse$2534(code$2547, options$2548.macros);
        if (options$2548.sourceMap) {
            output$2549 = codegen$2532.generate(ast$2550, {
                comment: true,
                sourceMap: options$2548.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2549.code,
                sourceMap: output$2549.map.toString()
            };
        }
        return { code: codegen$2532.generate(ast$2550, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map