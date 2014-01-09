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
(function (root$2823, factory$2824) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2825 = require('./parser');
        var expander$2826 = require('./expander');
        var syn$2827 = require('./syntax');
        var codegen$2828 = require('escodegen');
        var path$2829 = require('path');
        var fs$2830 = require('fs');
        var lib$2831 = path$2829.join(path$2829.dirname(fs$2830.realpathSync(__filename)), '../macros');
        var stxcaseModule$2832 = fs$2830.readFileSync(lib$2831 + '/stxcase.js', 'utf8');
        factory$2824(exports, parser$2825, expander$2826, syn$2827, stxcaseModule$2832, codegen$2828);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2833, filename$2834) {
            var content$2835 = require('fs').readFileSync(filename$2834, 'utf8');
            module$2833._compile(codegen$2828.generate(exports.parse(content$2835)), filename$2834);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2824);
    }
}(this, function (exports$2836, parser$2837, expander$2838, syn$2839, stxcaseModule$2840, gen$2841) {
    var codegen$2842 = gen$2841 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2843(code$2846, globalMacros$2847, maxExpands$2848) {
        var program$2849, toString$2850;
        globalMacros$2847 = globalMacros$2847 || '';
        toString$2850 = String;
        if (typeof code$2846 !== 'string' && !(code$2846 instanceof String)) {
            code$2846 = toString$2850(code$2846);
        }
        var source$2851 = code$2846;
        if (source$2851.length > 0) {
            if (typeof source$2851[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2846 instanceof String) {
                    source$2851 = code$2846.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2851[0] === 'undefined') {
                    source$2851 = stringToArray(code$2846);
                }
            }
        }
        var readTree$2852 = parser$2837.read(source$2851);
        try {
            return expander$2838.expand(readTree$2852, stxcaseModule$2840 + '\n' + globalMacros$2847, maxExpands$2848);
        } catch (err$2853) {
            if (err$2853 instanceof syn$2839.MacroSyntaxError) {
                throw new SyntaxError(syn$2839.printSyntaxError(source$2851, err$2853));
            } else {
                throw err$2853;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2844(code$2854, globalMacros$2855, maxExpands$2856) {
        if (code$2854 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2854 = ' ';
        }
        return parser$2837.parse(expand$2843(code$2854, globalMacros$2855, maxExpands$2856));
    }
    exports$2836.expand = expand$2843;
    exports$2836.parse = parse$2844;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2836.compile = function compile$2845(code$2857, options$2858) {
        var output$2859;
        options$2858 = options$2858 || {};
        var ast$2860 = parse$2844(code$2857, options$2858.macros);
        if (options$2858.sourceMap) {
            output$2859 = codegen$2842.generate(ast$2860, {
                comment: true,
                sourceMap: options$2858.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2859.code,
                sourceMap: output$2859.map.toString()
            };
        }
        return { code: codegen$2842.generate(ast$2860, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map