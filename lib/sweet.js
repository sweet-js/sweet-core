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
(function (root$2511, factory$2512) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2513 = require('./parser');
        var expander$2514 = require('./expander');
        var syn$2515 = require('./syntax');
        var codegen$2516 = require('escodegen');
        var path$2517 = require('path');
        var fs$2518 = require('fs');
        var lib$2519 = path$2517.join(path$2517.dirname(fs$2518.realpathSync(__filename)), '../macros');
        var stxcaseModule$2520 = fs$2518.readFileSync(lib$2519 + '/stxcase.js', 'utf8');
        factory$2512(exports, parser$2513, expander$2514, syn$2515, stxcaseModule$2520, codegen$2516);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2521, filename$2522) {
            var content$2523 = require('fs').readFileSync(filename$2522, 'utf8');
            module$2521._compile(codegen$2516.generate(exports.parse(content$2523)), filename$2522);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2512);
    }
}(this, function (exports$2524, parser$2525, expander$2526, syn$2527, stxcaseModule$2528, gen$2529) {
    var codegen$2530 = gen$2529 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2531(code$2535, globalMacros$2536, maxExpands$2537) {
        var program$2538, toString$2539;
        globalMacros$2536 = globalMacros$2536 || '';
        toString$2539 = String;
        if (typeof code$2535 !== 'string' && !(code$2535 instanceof String)) {
            code$2535 = toString$2539(code$2535);
        }
        var source$2540 = code$2535;
        if (source$2540.length > 0) {
            if (typeof source$2540[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2535 instanceof String) {
                    source$2540 = code$2535.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2540[0] === 'undefined') {
                    source$2540 = stringToArray(code$2535);
                }
            }
        }
        var readTree$2541 = parser$2525.read(source$2540);
        try {
            return expander$2526.expand(readTree$2541, stxcaseModule$2528 + '\n' + globalMacros$2536, maxExpands$2537);
        } catch (err$2542) {
            if (err$2542 instanceof syn$2527.MacroSyntaxError) {
                throw new SyntaxError(syn$2527.printSyntaxError(source$2540, err$2542));
            } else {
                throw err$2542;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2532(code$2543, globalMacros$2544, maxExpands$2545) {
        if (code$2543 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2543 = ' ';
        }
        return parser$2525.parse(expand$2531(code$2543, globalMacros$2544, maxExpands$2545));
    }
    // fun ([...CSyntax]) -> String
    function prettyPrint$2533(stxarr$2546, shouldResolve$2547) {
        var indent$2548 = 0;
        var unparsedLines$2549 = stxarr$2546.reduce(function (acc$2550, stx$2551) {
                var s$2552 = shouldResolve$2547 ? expander$2526.resolve(stx$2551) : stx$2551.token.value;
                // skip the end of file token
                if (stx$2551.token.type === parser$2525.Token.EOF) {
                    return acc$2550;
                }
                if (stx$2551.token.type === parser$2525.Token.StringLiteral) {
                    s$2552 = '"' + s$2552 + '"';
                }
                if (s$2552 == '{') {
                    acc$2550[0].str += ' ' + s$2552;
                    indent$2548++;
                    acc$2550.unshift({
                        indent: indent$2548,
                        str: ''
                    });
                } else if (s$2552 == '}') {
                    indent$2548--;
                    acc$2550.unshift({
                        indent: indent$2548,
                        str: s$2552
                    });
                    acc$2550.unshift({
                        indent: indent$2548,
                        str: ''
                    });
                } else if (s$2552 == ';') {
                    acc$2550[0].str += s$2552;
                    acc$2550.unshift({
                        indent: indent$2548,
                        str: ''
                    });
                } else {
                    acc$2550[0].str += (acc$2550[0].str ? ' ' : '') + s$2552;
                }
                return acc$2550;
            }, [{
                    indent: 0,
                    str: ''
                }]);
        return unparsedLines$2549.reduce(function (acc$2553, line$2554) {
            var ind$2555 = '';
            while (ind$2555.length < line$2554.indent * 2) {
                ind$2555 += ' ';
            }
            return ind$2555 + line$2554.str + '\n' + acc$2553;
        }, '');
    }
    exports$2524.expand = expand$2531;
    exports$2524.parse = parse$2532;
    exports$2524.prettyPrint = prettyPrint$2533;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2524.compile = function compile$2534(code$2556, options$2557) {
        var output$2558;
        options$2557 = options$2557 || {};
        var ast$2559 = parse$2532(code$2556, options$2557.macros);
        if (options$2557.sourceMap) {
            output$2558 = codegen$2530.generate(ast$2559, {
                comment: true,
                sourceMap: options$2557.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2558.code,
                sourceMap: output$2558.map.toString()
            };
        }
        return { code: codegen$2530.generate(ast$2559, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map