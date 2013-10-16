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
        var syn$101 = require('./syntax');
        var codegen$102 = require('escodegen');
        var path$103 = require('path');
        var fs$104 = require('fs');
        var lib$105 = path$103.join(path$103.dirname(fs$104.realpathSync(__filename)), '../macros');
        var stxcaseModule$106 = fs$104.readFileSync(lib$105 + '/stxcase.js', 'utf8');
        factory$98(exports, parser$99, expander$100, syn$101, stxcaseModule$106, codegen$102);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$107, filename$108) {
            var content$109 = require('fs').readFileSync(filename$108, 'utf8');
            module$107._compile(codegen$102.generate(exports.parse(content$109)), filename$108);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$98);
    }
}(this, function (exports$110, parser$111, expander$112, syn$113, stxcaseModule$114, gen$115) {
    var codegen$116 = gen$115 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$117(code$120) {
        var program$121, toString$122;
        toString$122 = String;
        if (typeof code$120 !== 'string' && !(code$120 instanceof String)) {
            code$120 = toString$122(code$120);
        }
        var source$123 = code$120;
        if (source$123.length > 0) {
            if (typeof source$123[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$120 instanceof String) {
                    source$123 = code$120.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$123[0] === 'undefined') {
                    source$123 = stringToArray(code$120);
                }
            }
        }
        var readTree$124 = parser$111.read(source$123);
        try {
            return [
                expander$112.expand(readTree$124[0], stxcaseModule$114),
                readTree$124[1]
            ];
        } catch (err$125) {
            if (err$125 instanceof syn$113.MacroSyntaxError) {
                throw new SyntaxError(syn$113.printSyntaxError(source$123, err$125));
            } else {
                throw err$125;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$118(code$126) {
        if (code$126 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$126 = ' ';
        }
        var exp$127 = expand$117(code$126);
        return parser$111.parse(exp$127[0], exp$127[1]);
    }
    exports$110.expand = expand$117;
    exports$110.parse = parse$118;
    exports$110.compileWithSourcemap = function (code$128, filename$129) {
        var ast$130 = parse$118(code$128);
        codegen$116.attachComments(ast$130, ast$130.comments, ast$130.tokens);
        var code_output$131 = codegen$116.generate(ast$130, { comment: true });
        var sourcemap$132 = codegen$116.generate(ast$130, { sourceMap: filename$129 });
        return [
            code_output$131,
            sourcemap$132
        ];
    };
    exports$110.compile = function compile$119(code$133) {
        var ast$134 = parse$118(code$133);
        codegen$116.attachComments(ast$134, ast$134.comments, ast$134.tokens);
        return codegen$116.generate(ast$134, { comment: true });
    };
}));