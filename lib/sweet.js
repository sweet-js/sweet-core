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
(function (root$2813, factory$2814) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2815 = require('./parser');
        var expander$2816 = require('./expander');
        var syn$2817 = require('./syntax');
        var codegen$2818 = require('escodegen');
        var path$2819 = require('path');
        var fs$2820 = require('fs');
        var lib$2821 = path$2819.join(path$2819.dirname(fs$2820.realpathSync(__filename)), '../macros');
        var stxcaseModule$2822 = fs$2820.readFileSync(lib$2821 + '/stxcase.js', 'utf8');
        factory$2814(exports, parser$2815, expander$2816, syn$2817, stxcaseModule$2822, codegen$2818);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2823, filename$2824) {
            var content$2825 = require('fs').readFileSync(filename$2824, 'utf8');
            module$2823._compile(codegen$2818.generate(exports.parse(content$2825)), filename$2824);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2814);
    }
}(this, function (exports$2826, parser$2827, expander$2828, syn$2829, stxcaseModule$2830, gen$2831) {
    var codegen$2832 = gen$2831 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2833(code$2836, globalMacros$2837, maxExpands$2838) {
        var program$2839, toString$2840;
        globalMacros$2837 = globalMacros$2837 || '';
        toString$2840 = String;
        if (typeof code$2836 !== 'string' && !(code$2836 instanceof String)) {
            code$2836 = toString$2840(code$2836);
        }
        var source$2841 = code$2836;
        if (source$2841.length > 0) {
            if (typeof source$2841[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2836 instanceof String) {
                    source$2841 = code$2836.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2841[0] === 'undefined') {
                    source$2841 = stringToArray(code$2836);
                }
            }
        }
        var readTree$2842 = parser$2827.read(source$2841);
        try {
            return expander$2828.expand(readTree$2842, stxcaseModule$2830 + '\n' + globalMacros$2837, maxExpands$2838);
        } catch (err$2843) {
            if (err$2843 instanceof syn$2829.MacroSyntaxError) {
                throw new SyntaxError(syn$2829.printSyntaxError(source$2841, err$2843));
            } else {
                throw err$2843;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2834(code$2844, globalMacros$2845, maxExpands$2846) {
        if (code$2844 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2844 = ' ';
        }
        return parser$2827.parse(expand$2833(code$2844, globalMacros$2845, maxExpands$2846));
    }
    exports$2826.expand = expand$2833;
    exports$2826.parse = parse$2834;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2826.compile = function compile$2835(code$2847, options$2848) {
        var output$2849;
        options$2848 = options$2848 || {};
        var ast$2850 = parse$2834(code$2847, options$2848.macros);
        if (options$2848.sourceMap) {
            output$2849 = codegen$2832.generate(ast$2850, {
                comment: true,
                sourceMap: options$2848.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2849.code,
                sourceMap: output$2849.map.toString()
            };
        }
        return { code: codegen$2832.generate(ast$2850, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map