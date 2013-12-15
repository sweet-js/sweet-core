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
(function (root$2682, factory$2683) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2684 = require('./parser');
        var expander$2685 = require('./expander');
        var syn$2686 = require('./syntax');
        var codegen$2687 = require('escodegen');
        var path$2688 = require('path');
        var fs$2689 = require('fs');
        var lib$2690 = path$2688.join(path$2688.dirname(fs$2689.realpathSync(__filename)), '../macros');
        var stxcaseModule$2691 = fs$2689.readFileSync(lib$2690 + '/stxcase.js', 'utf8');
        factory$2683(exports, parser$2684, expander$2685, syn$2686, stxcaseModule$2691, codegen$2687);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2692, filename$2693) {
            var content$2694 = require('fs').readFileSync(filename$2693, 'utf8');
            module$2692._compile(codegen$2687.generate(exports.parse(content$2694)), filename$2693);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2683);
    }
}(this, function (exports$2695, parser$2696, expander$2697, syn$2698, stxcaseModule$2699, gen$2700) {
    var codegen$2701 = gen$2700 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2702(code$2705, globalMacros$2706, maxExpands$2707) {
        var program$2708, toString$2709;
        globalMacros$2706 = globalMacros$2706 || '';
        toString$2709 = String;
        if (typeof code$2705 !== 'string' && !(code$2705 instanceof String)) {
            code$2705 = toString$2709(code$2705);
        }
        var source$2710 = code$2705;
        if (source$2710.length > 0) {
            if (typeof source$2710[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2705 instanceof String) {
                    source$2710 = code$2705.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2710[0] === 'undefined') {
                    source$2710 = stringToArray(code$2705);
                }
            }
        }
        var readTree$2711 = parser$2696.read(source$2710);
        try {
            return expander$2697.expand(readTree$2711, stxcaseModule$2699 + '\n' + globalMacros$2706, maxExpands$2707);
        } catch (err$2712) {
            if (err$2712 instanceof syn$2698.MacroSyntaxError) {
                throw new SyntaxError(syn$2698.printSyntaxError(source$2710, err$2712));
            } else {
                throw err$2712;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2703(code$2713, globalMacros$2714, maxExpands$2715) {
        if (code$2713 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2713 = ' ';
        }
        return parser$2696.parse(expand$2702(code$2713, globalMacros$2714, maxExpands$2715));
    }
    exports$2695.expand = expand$2702;
    exports$2695.parse = parse$2703;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2695.compile = function compile$2704(code$2716, options$2717) {
        var output$2718;
        options$2717 = options$2717 || {};
        var ast$2719 = parse$2703(code$2716, options$2717.macros);
        if (options$2717.sourceMap) {
            output$2718 = codegen$2701.generate(ast$2719, {
                comment: true,
                sourceMap: options$2717.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2718.code,
                sourceMap: output$2718.map.toString()
            };
        }
        return { code: codegen$2701.generate(ast$2719, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map