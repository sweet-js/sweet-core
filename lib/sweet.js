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
(function (root$2524, factory$2525) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2526 = require('./parser');
        var expander$2527 = require('./expander');
        var syn$2528 = require('./syntax');
        var codegen$2529 = require('escodegen');
        var path$2530 = require('path');
        var fs$2531 = require('fs');
        var lib$2532 = path$2530.join(path$2530.dirname(fs$2531.realpathSync(__filename)), '../macros');
        var stxcaseModule$2533 = fs$2531.readFileSync(lib$2532 + '/stxcase.js', 'utf8');
        factory$2525(exports, parser$2526, expander$2527, syn$2528, stxcaseModule$2533, codegen$2529);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2534, filename$2535) {
            var content$2536 = require('fs').readFileSync(filename$2535, 'utf8');
            module$2534._compile(codegen$2529.generate(exports.parse(content$2536)), filename$2535);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2525);
    }
}(this, function (exports$2537, parser$2538, expander$2539, syn$2540, stxcaseModule$2541, gen$2542) {
    var codegen$2543 = gen$2542 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2544(code$2547, globalMacros$2548, maxExpands$2549) {
        var program$2550, toString$2551;
        globalMacros$2548 = globalMacros$2548 || '';
        toString$2551 = String;
        if (typeof code$2547 !== 'string' && !(code$2547 instanceof String)) {
            code$2547 = toString$2551(code$2547);
        }
        var source$2552 = code$2547;
        if (source$2552.length > 0) {
            if (typeof source$2552[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2547 instanceof String) {
                    source$2552 = code$2547.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2552[0] === 'undefined') {
                    source$2552 = stringToArray(code$2547);
                }
            }
        }
        var readTree$2553 = parser$2538.read(source$2552);
        try {
            return expander$2539.expand(readTree$2553, stxcaseModule$2541 + '\n' + globalMacros$2548, maxExpands$2549);
        } catch (err$2554) {
            if (err$2554 instanceof syn$2540.MacroSyntaxError) {
                throw new SyntaxError(syn$2540.printSyntaxError(source$2552, err$2554));
            } else {
                throw err$2554;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2545(code$2555, globalMacros$2556, maxExpands$2557) {
        if (code$2555 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2555 = ' ';
        }
        return parser$2538.parse(expand$2544(code$2555, globalMacros$2556, maxExpands$2557));
    }
    exports$2537.expand = expand$2544;
    exports$2537.parse = parse$2545;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2537.compile = function compile$2546(code$2558, options$2559) {
        var output$2560;
        options$2559 = options$2559 || {};
        var ast$2561 = parse$2545(code$2558, options$2559.macros);
        if (options$2559.sourceMap) {
            output$2560 = codegen$2543.generate(ast$2561, {
                comment: true,
                sourceMap: options$2559.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2560.code,
                sourceMap: output$2560.map.toString()
            };
        }
        return { code: codegen$2543.generate(ast$2561, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map