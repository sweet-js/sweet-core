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
(function (root$97, factory$98) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$99 = require('./parser');
        var expander$100 = require('./expander');
        var codegen$101 = require('escodegen');
        var path$102 = require('path');
        var fs$103 = require('fs');
        var lib$104 = path$102.join(path$102.dirname(fs$103.realpathSync(__filename)), '../macros');
        var stxcaseModule$105 = fs$103.readFileSync(lib$104 + '/stxcase.js', 'utf8');
        factory$98(exports, parser$99, expander$100, stxcaseModule$105, codegen$101);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$106, filename$107) {
            var content$108 = require('fs').readFileSync(filename$107, 'utf8');
            module$106._compile(codegen$101.generate(exports.parse(content$108)), filename$107);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$98);
    }
}(this, function (exports$109, parser$110, expander$111, stxcaseModule$112, gen$113) {
    var codegen$114 = gen$113 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$115(code$118) {
        var program$119, toString$120;
        toString$120 = String;
        if (typeof code$118 !== 'string' && !(code$118 instanceof String)) {
            code$118 = toString$120(code$118);
        }
        var source$121 = code$118;
        if (source$121.length > 0) {
            if (typeof source$121[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$118 instanceof String) {
                    source$121 = code$118.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$121[0] === 'undefined') {
                    source$121 = stringToArray(code$118);
                }
            }
        }
        var readTree$122 = parser$110.read(source$121);
        return [
            expander$111.expand(readTree$122[0], stxcaseModule$112),
            readTree$122[1]
        ];
    }
    // fun (Str, {}) -> AST
    function parse$116(code$123) {
        if (code$123 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$123 = ' ';
        }
        var exp$124 = expand$115(code$123);
        return parser$110.parse(exp$124[0], exp$124[1]);
    }
    exports$109.expand = expand$115;
    exports$109.parse = parse$116;
    exports$109.compileWithSourcemap = function (code$125, filename$126) {
        var ast$127 = parse$116(code$125);
        codegen$114.attachComments(ast$127, ast$127.comments, ast$127.tokens);
        var code_output$128 = codegen$114.generate(ast$127, { comment: true });
        var sourcemap$129 = codegen$114.generate(ast$127, { sourceMap: filename$126 });
        return [
            code_output$128,
            sourcemap$129
        ];
    };
    exports$109.compile = function compile$117(code$130) {
        var ast$131 = parse$116(code$130);
        codegen$114.attachComments(ast$131, ast$131.comments, ast$131.tokens);
        return codegen$114.generate(ast$131, { comment: true });
    };
}));