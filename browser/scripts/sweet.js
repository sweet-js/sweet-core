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
(function (root$2990, factory$2991) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2992 = require('./parser');
        var expander$2993 = require('./expander');
        var syn$2994 = require('./syntax');
        var codegen$2995 = require('escodegen');
        var path$2996 = require('path');
        var fs$2997 = require('fs');
        var lib$2998 = path$2996.join(path$2996.dirname(fs$2997.realpathSync(__filename)), '../macros');
        var stxcaseModule$2999 = fs$2997.readFileSync(lib$2998 + '/stxcase.js', 'utf8');
        factory$2991(exports, parser$2992, expander$2993, syn$2994, stxcaseModule$2999, codegen$2995);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$3000, filename$3001) {
            var content$3002 = require('fs').readFileSync(filename$3001, 'utf8');
            module$3000._compile(codegen$2995.generate(exports.parse(content$3002)), filename$3001);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2991);
    }
}(this, function (exports$3003, parser$3004, expander$3005, syn$3006, stxcaseModule$3007, gen$3008) {
    var codegen$3009 = gen$3008 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$3010(code$3013, globalMacros$3014) {
        var program$3015, toString$3016;
        globalMacros$3014 = globalMacros$3014 || '';
        toString$3016 = String;
        if (typeof code$3013 !== 'string' && !(code$3013 instanceof String)) {
            code$3013 = toString$3016(code$3013);
        }
        var source$3017 = code$3013;
        if (source$3017.length > 0) {
            if (typeof source$3017[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$3013 instanceof String) {
                    source$3017 = code$3013.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$3017[0] === 'undefined') {
                    source$3017 = stringToArray(code$3013);
                }
            }
        }
        var readTree$3018 = parser$3004.read(source$3017);
        try {
            return expander$3005.expand(readTree$3018, stxcaseModule$3007 + '\n' + globalMacros$3014);
        } catch (err$3019) {
            if (err$3019 instanceof syn$3006.MacroSyntaxError) {
                throw new SyntaxError(syn$3006.printSyntaxError(source$3017, err$3019));
            } else {
                throw err$3019;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$3011(code$3020, globalMacros$3021) {
        if (code$3020 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$3020 = ' ';
        }
        return parser$3004.parse(expand$3010(code$3020, globalMacros$3021));
    }
    exports$3003.expand = expand$3010;
    exports$3003.parse = parse$3011;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$3003.compile = function compile$3012(code$3022, options$3023) {
        var output$3024;
        options$3023 = options$3023 || {};
        var ast$3025 = parse$3011(code$3022, options$3023.macros);
        if (options$3023.sourceMap) {
            output$3024 = codegen$3009.generate(ast$3025, {
                comment: true,
                sourceMap: options$3023.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$3024.code,
                sourceMap: output$3024.map.toString()
            };
        }
        return { code: codegen$3009.generate(ast$3025, { comment: true }) };
    };
}));