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
(function (root$2809, factory$2810) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2811 = require('./parser');
        var expander$2812 = require('./expander');
        var syn$2813 = require('./syntax');
        var codegen$2814 = require('escodegen');
        var path$2815 = require('path');
        var fs$2816 = require('fs');
        var lib$2817 = path$2815.join(path$2815.dirname(fs$2816.realpathSync(__filename)), '../macros');
        var stxcaseModule$2818 = fs$2816.readFileSync(lib$2817 + '/stxcase.js', 'utf8');
        factory$2810(exports, parser$2811, expander$2812, syn$2813, stxcaseModule$2818, codegen$2814);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2819, filename$2820) {
            var content$2821 = require('fs').readFileSync(filename$2820, 'utf8');
            module$2819._compile(codegen$2814.generate(exports.parse(content$2821)), filename$2820);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2810);
    }
}(this, function (exports$2822, parser$2823, expander$2824, syn$2825, stxcaseModule$2826, gen$2827) {
    var codegen$2828 = gen$2827 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2829(code$2832, globalMacros$2833, maxExpands$2834) {
        var program$2835, toString$2836;
        globalMacros$2833 = globalMacros$2833 || '';
        toString$2836 = String;
        if (typeof code$2832 !== 'string' && !(code$2832 instanceof String)) {
            code$2832 = toString$2836(code$2832);
        }
        var source$2837 = code$2832;
        if (source$2837.length > 0) {
            if (typeof source$2837[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2832 instanceof String) {
                    source$2837 = code$2832.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2837[0] === 'undefined') {
                    source$2837 = stringToArray(code$2832);
                }
            }
        }
        var readTree$2838 = parser$2823.read(source$2837);
        try {
            return expander$2824.expand(readTree$2838, stxcaseModule$2826 + '\n' + globalMacros$2833, maxExpands$2834);
        } catch (err$2839) {
            if (err$2839 instanceof syn$2825.MacroSyntaxError) {
                throw new SyntaxError(syn$2825.printSyntaxError(source$2837, err$2839));
            } else {
                throw err$2839;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2830(code$2840, globalMacros$2841, maxExpands$2842) {
        if (code$2840 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2840 = ' ';
        }
        return parser$2823.parse(expand$2829(code$2840, globalMacros$2841, maxExpands$2842));
    }
    exports$2822.expand = expand$2829;
    exports$2822.parse = parse$2830;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2822.compile = function compile$2831(code$2843, options$2844) {
        var output$2845;
        options$2844 = options$2844 || {};
        var ast$2846 = parse$2830(code$2843, options$2844.macros);
        if (options$2844.sourceMap) {
            output$2845 = codegen$2828.generate(ast$2846, {
                comment: true,
                sourceMap: options$2844.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2845.code,
                sourceMap: output$2845.map.toString()
            };
        }
        return { code: codegen$2828.generate(ast$2846, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map