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
(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$95 = require('./parser');
        var expander$96 = require('./expander');
        var codegen$97 = require('escodegen');
        var path$98 = require('path');
        var fs$99 = require('fs');
        var lib$100 = path$98.join(path$98.dirname(fs$99.realpathSync(__filename)), '../macros');
        var stxcaseModule$101 = fs$99.readFileSync(lib$100 + '/stxcase.js', 'utf8');
        factory$94(exports, parser$95, expander$96, stxcaseModule$101, codegen$97);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$102, filename$103) {
            var content$104 = require('fs').readFileSync(filename$103, 'utf8');
            module$102._compile(codegen$97.generate(exports.parse(content$104)), filename$103);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$94);
    }
}(this, function (exports$105, parser$106, expander$107, stxcaseModule$108, gen$109) {
    var codegen$110 = gen$109 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$111(code$114) {
        var program$115, toString$116;
        toString$116 = String;
        if (typeof code$114 !== 'string' && !(code$114 instanceof String)) {
            code$114 = toString$116(code$114);
        }
        var source$117 = code$114;
        if (source$117.length > 0) {
            if (typeof source$117[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$114 instanceof String) {
                    source$117 = code$114.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$117[0] === 'undefined') {
                    source$117 = stringToArray(code$114);
                }
            }
        }
        source$117 = stxcaseModule$108 + '\n\n' + source$117;
        var readTree$118 = parser$106.read(source$117);
        return [
            expander$107.expand(readTree$118[0]),
            readTree$118[1]
        ];
    }
    // fun (Str, {}) -> AST
    function parse$112(code$119) {
        var exp$120 = expand$111(code$119);
        var lineoffset$121 = 2;
        for (var i$125 = 0; i$125 < stxcaseModule$108.length; i$125++) {
            if (stxcaseModule$108[i$125] === '\n') {
                lineoffset$121++;
            }
        }
        var linestartoffset$122 = stxcaseModule$108.length + 2;
        var adjustedStx$123 = exp$120[0];
        var adjustedComments$124 = exp$120[1];
        if (typeof lineoffset$121 !== 'undefined') {
            adjustedStx$123 = exp$120[0].map(function (stx$126) {
                stx$126.token.sm_lineNumber -= lineoffset$121;
                stx$126.token.sm_lineStart -= linestartoffset$122;
                stx$126.token.range[0] -= linestartoffset$122;
                stx$126.token.range[1] -= linestartoffset$122;
                return stx$126;
            });
            adjustedComments$124 = exp$120[1].map(function (tok$127) {
                tok$127.range[0] -= linestartoffset$122;
                tok$127.range[1] -= linestartoffset$122;
                return tok$127;
            });
        }
        return parser$106.parse(adjustedStx$123, adjustedComments$124);
    }
    exports$105.expand = expand$111;
    exports$105.parse = parse$112;
    exports$105.compileWithSourcemap = function (code$128, filename$129) {
        var ast$130 = parse$112(code$128);
        codegen$110.attachComments(ast$130, ast$130.comments, ast$130.tokens);
        var code_output$131 = codegen$110.generate(ast$130, { comment: true });
        var sourcemap$132 = codegen$110.generate(ast$130, { sourceMap: filename$129 });
        return [
            code_output$131,
            sourcemap$132
        ];
    };
    exports$105.compile = function compile$113(code$133) {
        var ast$134 = parse$112(code$133);
        codegen$110.attachComments(ast$134, ast$134.comments, ast$134.tokens);
        return codegen$110.generate(ast$134, { comment: true });
    };
}));