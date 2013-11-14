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
(function (root$111, factory$112) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$113 = require('./parser');
        var expander$114 = require('./expander');
        var syn$115 = require('./syntax');
        var codegen$116 = require('escodegen');
        var path$117 = require('path');
        var fs$118 = require('fs');
        var lib$119 = path$117.join(path$117.dirname(fs$118.realpathSync(__filename)), '../macros');
        var stxcaseModule$120 = fs$118.readFileSync(lib$119 + '/stxcase.js', 'utf8');
        factory$112(exports, parser$113, expander$114, syn$115, stxcaseModule$120, codegen$116);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$121, filename$122) {
            var content$123 = require('fs').readFileSync(filename$122, 'utf8');
            module$121._compile(codegen$116.generate(exports.parse(content$123)), filename$122);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$112);
    }
}(this, function (exports$124, parser$125, expander$126, syn$127, stxcaseModule$128, gen$129) {
    var codegen$130 = gen$129 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$131(code$134) {
        var program$135, toString$136;
        toString$136 = String;
        if (typeof code$134 !== 'string' && !(code$134 instanceof String)) {
            code$134 = toString$136(code$134);
        }
        var source$137 = code$134;
        if (source$137.length > 0) {
            if (typeof source$137[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$134 instanceof String) {
                    source$137 = code$134.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$137[0] === 'undefined') {
                    source$137 = stringToArray(code$134);
                }
            }
        }
        var readTree$138 = parser$125.read(source$137);
        try {
            return expander$126.expand(readTree$138, stxcaseModule$128);
        } catch (err$139) {
            if (err$139 instanceof syn$127.MacroSyntaxError) {
                throw new SyntaxError(syn$127.printSyntaxError(source$137, err$139));
            } else {
                throw err$139;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$132(code$140) {
        if (code$140 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$140 = ' ';
        }
        return parser$125.parse(expand$131(code$140));
    }
    exports$124.expand = expand$131;
    exports$124.parse = parse$132;
    exports$124.compileWithSourcemap = function (code$141, filename$142) {
        var ast$143 = parse$132(code$141);
        var code_output$144 = codegen$130.generate(ast$143, { comment: true });
        var sourcemap$145 = codegen$130.generate(ast$143, { sourceMap: filename$142 });
        return [
            code_output$144,
            sourcemap$145
        ];
    };
    exports$124.compile = function compile$133(code$146) {
        var ast$147 = parse$132(code$146);
        return codegen$130.generate(ast$147, { comment: true });
    };
}));