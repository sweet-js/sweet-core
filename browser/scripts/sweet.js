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
(function (root$2814, factory$2815) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2816 = require('./parser');
        var expander$2817 = require('./expander');
        var syn$2818 = require('./syntax');
        var codegen$2819 = require('escodegen');
        var path$2820 = require('path');
        var fs$2821 = require('fs');
        var lib$2822 = path$2820.join(path$2820.dirname(fs$2821.realpathSync(__filename)), '../macros');
        var stxcaseModule$2823 = fs$2821.readFileSync(lib$2822 + '/stxcase.js', 'utf8');
        factory$2815(exports, parser$2816, expander$2817, syn$2818, stxcaseModule$2823, codegen$2819);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2824, filename$2825) {
            var content$2826 = require('fs').readFileSync(filename$2825, 'utf8');
            module$2824._compile(codegen$2819.generate(exports.parse(content$2826)), filename$2825);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2815);
    }
}(this, function (exports$2827, parser$2828, expander$2829, syn$2830, stxcaseModule$2831, gen$2832) {
    var codegen$2833 = gen$2832 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2834(code$2837, globalMacros$2838, maxExpands$2839) {
        var program$2840, toString$2841;
        globalMacros$2838 = globalMacros$2838 || '';
        toString$2841 = String;
        if (typeof code$2837 !== 'string' && !(code$2837 instanceof String)) {
            code$2837 = toString$2841(code$2837);
        }
        var source$2842 = code$2837;
        if (source$2842.length > 0) {
            if (typeof source$2842[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2837 instanceof String) {
                    source$2842 = code$2837.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2842[0] === 'undefined') {
                    source$2842 = stringToArray(code$2837);
                }
            }
        }
        var readTree$2843 = parser$2828.read(source$2842);
        try {
            return expander$2829.expand(readTree$2843, stxcaseModule$2831 + '\n' + globalMacros$2838, maxExpands$2839);
        } catch (err$2844) {
            if (err$2844 instanceof syn$2830.MacroSyntaxError) {
                throw new SyntaxError(syn$2830.printSyntaxError(source$2842, err$2844));
            } else {
                throw err$2844;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2835(code$2845, globalMacros$2846, maxExpands$2847) {
        if (code$2845 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2845 = ' ';
        }
        return parser$2828.parse(expand$2834(code$2845, globalMacros$2846, maxExpands$2847));
    }
    exports$2827.expand = expand$2834;
    exports$2827.parse = parse$2835;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2827.compile = function compile$2836(code$2848, options$2849) {
        var output$2850;
        options$2849 = options$2849 || {};
        var ast$2851 = parse$2835(code$2848, options$2849.macros);
        if (options$2849.sourceMap) {
            output$2850 = codegen$2833.generate(ast$2851, {
                comment: true,
                sourceMap: options$2849.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2850.code,
                sourceMap: output$2850.map.toString()
            };
        }
        return { code: codegen$2833.generate(ast$2851, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map