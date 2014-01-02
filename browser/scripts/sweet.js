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
(function (root$2807, factory$2808) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2809 = require('./parser');
        var expander$2810 = require('./expander');
        var syn$2811 = require('./syntax');
        var codegen$2812 = require('escodegen');
        var path$2813 = require('path');
        var fs$2814 = require('fs');
        var lib$2815 = path$2813.join(path$2813.dirname(fs$2814.realpathSync(__filename)), '../macros');
        var stxcaseModule$2816 = fs$2814.readFileSync(lib$2815 + '/stxcase.js', 'utf8');
        factory$2808(exports, parser$2809, expander$2810, syn$2811, stxcaseModule$2816, codegen$2812);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2817, filename$2818) {
            var content$2819 = require('fs').readFileSync(filename$2818, 'utf8');
            module$2817._compile(codegen$2812.generate(exports.parse(content$2819)), filename$2818);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2808);
    }
}(this, function (exports$2820, parser$2821, expander$2822, syn$2823, stxcaseModule$2824, gen$2825) {
    var codegen$2826 = gen$2825 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2827(code$2830, globalMacros$2831, maxExpands$2832) {
        var program$2833, toString$2834;
        globalMacros$2831 = globalMacros$2831 || '';
        toString$2834 = String;
        if (typeof code$2830 !== 'string' && !(code$2830 instanceof String)) {
            code$2830 = toString$2834(code$2830);
        }
        var source$2835 = code$2830;
        if (source$2835.length > 0) {
            if (typeof source$2835[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2830 instanceof String) {
                    source$2835 = code$2830.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2835[0] === 'undefined') {
                    source$2835 = stringToArray(code$2830);
                }
            }
        }
        var readTree$2836 = parser$2821.read(source$2835);
        try {
            return expander$2822.expand(readTree$2836, stxcaseModule$2824 + '\n' + globalMacros$2831, maxExpands$2832);
        } catch (err$2837) {
            if (err$2837 instanceof syn$2823.MacroSyntaxError) {
                throw new SyntaxError(syn$2823.printSyntaxError(source$2835, err$2837));
            } else {
                throw err$2837;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2828(code$2838, globalMacros$2839, maxExpands$2840) {
        if (code$2838 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2838 = ' ';
        }
        return parser$2821.parse(expand$2827(code$2838, globalMacros$2839, maxExpands$2840));
    }
    exports$2820.expand = expand$2827;
    exports$2820.parse = parse$2828;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2820.compile = function compile$2829(code$2841, options$2842) {
        var output$2843;
        options$2842 = options$2842 || {};
        var ast$2844 = parse$2828(code$2841, options$2842.macros);
        if (options$2842.sourceMap) {
            output$2843 = codegen$2826.generate(ast$2844, {
                comment: true,
                sourceMap: options$2842.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2843.code,
                sourceMap: output$2843.map.toString()
            };
        }
        return { code: codegen$2826.generate(ast$2844, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map