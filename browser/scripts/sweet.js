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
(function (root$2508, factory$2509) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2510 = require('./parser');
        var expander$2511 = require('./expander');
        var syn$2512 = require('./syntax');
        var codegen$2513 = require('escodegen');
        var path$2514 = require('path');
        var fs$2515 = require('fs');
        var lib$2516 = path$2514.join(path$2514.dirname(fs$2515.realpathSync(__filename)), '../macros');
        var stxcaseModule$2517 = fs$2515.readFileSync(lib$2516 + '/stxcase.js', 'utf8');
        factory$2509(exports, parser$2510, expander$2511, syn$2512, stxcaseModule$2517, codegen$2513);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2518, filename$2519) {
            var content$2520 = require('fs').readFileSync(filename$2519, 'utf8');
            module$2518._compile(codegen$2513.generate(exports.parse(content$2520)), filename$2519);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2509);
    }
}(this, function (exports$2521, parser$2522, expander$2523, syn$2524, stxcaseModule$2525, gen$2526) {
    var codegen$2527 = gen$2526 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2528(code$2531, globalMacros$2532) {
        var program$2533, toString$2534;
        globalMacros$2532 = globalMacros$2532 || '';
        toString$2534 = String;
        if (typeof code$2531 !== 'string' && !(code$2531 instanceof String)) {
            code$2531 = toString$2534(code$2531);
        }
        var source$2535 = code$2531;
        if (source$2535.length > 0) {
            if (typeof source$2535[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2531 instanceof String) {
                    source$2535 = code$2531.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2535[0] === 'undefined') {
                    source$2535 = stringToArray(code$2531);
                }
            }
        }
        var readTree$2536 = parser$2522.read(source$2535);
        try {
            return expander$2523.expand(readTree$2536, stxcaseModule$2525 + '\n' + globalMacros$2532);
        } catch (err$2537) {
            if (err$2537 instanceof syn$2524.MacroSyntaxError) {
                throw new SyntaxError(syn$2524.printSyntaxError(source$2535, err$2537));
            } else {
                throw err$2537;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2529(code$2538, globalMacros$2539) {
        if (code$2538 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2538 = ' ';
        }
        return parser$2522.parse(expand$2528(code$2538, globalMacros$2539));
    }
    exports$2521.expand = expand$2528;
    exports$2521.parse = parse$2529;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2521.compile = function compile$2530(code$2540, options$2541) {
        var output$2542;
        options$2541 = options$2541 || {};
        var ast$2543 = parse$2529(code$2540, options$2541.macros);
        if (options$2541.sourceMap) {
            output$2542 = codegen$2527.generate(ast$2543, {
                comment: true,
                sourceMap: options$2541.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2542.code,
                sourceMap: output$2542.map.toString()
            };
        }
        return { code: codegen$2527.generate(ast$2543, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map