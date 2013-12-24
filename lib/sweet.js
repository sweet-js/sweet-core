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
(function (root$2520, factory$2521) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2522 = require('./parser');
        var expander$2523 = require('./expander');
        var syn$2524 = require('./syntax');
        var codegen$2525 = require('escodegen');
        var path$2526 = require('path');
        var fs$2527 = require('fs');
        var lib$2528 = path$2526.join(path$2526.dirname(fs$2527.realpathSync(__filename)), '../macros');
        var stxcaseModule$2529 = fs$2527.readFileSync(lib$2528 + '/stxcase.js', 'utf8');
        factory$2521(exports, parser$2522, expander$2523, syn$2524, stxcaseModule$2529, codegen$2525);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2530, filename$2531) {
            var content$2532 = require('fs').readFileSync(filename$2531, 'utf8');
            module$2530._compile(codegen$2525.generate(exports.parse(content$2532)), filename$2531);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2521);
    }
}(this, function (exports$2533, parser$2534, expander$2535, syn$2536, stxcaseModule$2537, gen$2538) {
    var codegen$2539 = gen$2538 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2540(code$2543, globalMacros$2544, maxExpands$2545) {
        var program$2546, toString$2547;
        globalMacros$2544 = globalMacros$2544 || '';
        toString$2547 = String;
        if (typeof code$2543 !== 'string' && !(code$2543 instanceof String)) {
            code$2543 = toString$2547(code$2543);
        }
        var source$2548 = code$2543;
        if (source$2548.length > 0) {
            if (typeof source$2548[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2543 instanceof String) {
                    source$2548 = code$2543.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2548[0] === 'undefined') {
                    source$2548 = stringToArray(code$2543);
                }
            }
        }
        var readTree$2549 = parser$2534.read(source$2548);
        try {
            return expander$2535.expand(readTree$2549, stxcaseModule$2537 + '\n' + globalMacros$2544, maxExpands$2545);
        } catch (err$2550) {
            if (err$2550 instanceof syn$2536.MacroSyntaxError) {
                throw new SyntaxError(syn$2536.printSyntaxError(source$2548, err$2550));
            } else {
                throw err$2550;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2541(code$2551, globalMacros$2552, maxExpands$2553) {
        if (code$2551 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2551 = ' ';
        }
        return parser$2534.parse(expand$2540(code$2551, globalMacros$2552, maxExpands$2553));
    }
    exports$2533.expand = expand$2540;
    exports$2533.parse = parse$2541;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2533.compile = function compile$2542(code$2554, options$2555) {
        var output$2556;
        options$2555 = options$2555 || {};
        var ast$2557 = parse$2541(code$2554, options$2555.macros);
        if (options$2555.sourceMap) {
            output$2556 = codegen$2539.generate(ast$2557, {
                comment: true,
                sourceMap: options$2555.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2556.code,
                sourceMap: output$2556.map.toString()
            };
        }
        return { code: codegen$2539.generate(ast$2557, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map