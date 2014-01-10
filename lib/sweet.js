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
(function (root$2834, factory$2835) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2836 = require('./parser');
        var expander$2837 = require('./expander');
        var syn$2838 = require('./syntax');
        var codegen$2839 = require('escodegen');
        var path$2840 = require('path');
        var fs$2841 = require('fs');
        var lib$2842 = path$2840.join(path$2840.dirname(fs$2841.realpathSync(__filename)), '../macros');
        var stxcaseModule$2843 = fs$2841.readFileSync(lib$2842 + '/stxcase.js', 'utf8');
        factory$2835(exports, parser$2836, expander$2837, syn$2838, stxcaseModule$2843, codegen$2839, fs$2841);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2844, filename$2845) {
            var content$2846 = require('fs').readFileSync(filename$2845, 'utf8');
            module$2844._compile(codegen$2839.generate(exports.parse(content$2846)), filename$2845);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2835);
    }
}(this, function (exports$2847, parser$2848, expander$2849, syn$2850, stxcaseModule$2851, gen$2852, fs$2853) {
    var codegen$2854 = gen$2852 || escodegen;
    var expand$2855 = makeExpand$2858(expander$2849.expand);
    var expandModule$2856 = makeExpand$2858(expander$2849.expandModule);
    var stxcaseCtx$2857;
    function makeExpand$2858(expandFn$2862) {
        // fun (Str) -> [...CSyntax]
        return function expand$2863(code$2864, modules$2865, maxExpands$2866) {
            var program$2867, toString$2868;
            modules$2865 = modules$2865 || [];
            if (!stxcaseCtx$2857) {
                stxcaseCtx$2857 = expander$2849.expandModule(parser$2848.read(stxcaseModule$2851));
            }
            toString$2868 = String;
            if (typeof code$2864 !== 'string' && !(code$2864 instanceof String)) {
                code$2864 = toString$2868(code$2864);
            }
            var source$2869 = code$2864;
            if (source$2869.length > 0) {
                if (typeof source$2869[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code$2864 instanceof String) {
                        source$2869 = code$2864.valueOf();
                    }
                    // Force accessing the characters via an array.
                    if (typeof source$2869[0] === 'undefined') {
                        source$2869 = stringToArray(code$2864);
                    }
                }
            }
            var readTree$2870 = parser$2848.read(source$2869);
            try {
                return expandFn$2862(readTree$2870, [stxcaseCtx$2857].concat(modules$2865), maxExpands$2866);
            } catch (err$2871) {
                if (err$2871 instanceof syn$2850.MacroSyntaxError) {
                    throw new SyntaxError(syn$2850.printSyntaxError(source$2869, err$2871));
                } else {
                    throw err$2871;
                }
            }
        };
    }
    // fun (Str, {}) -> AST
    function parse$2859(code$2872, modules$2873, maxExpands$2874) {
        if (code$2872 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2872 = ' ';
        }
        return parser$2848.parse(expand$2855(code$2872, modules$2873, maxExpands$2874));
    }
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    function compile$2860(code$2875, options$2876) {
        var output$2877;
        options$2876 = options$2876 || {};
        var ast$2878 = parse$2859(code$2875, options$2876.modules || [], options$2876.maxExpands);
        if (options$2876.sourceMap) {
            output$2877 = codegen$2854.generate(ast$2878, {
                comment: true,
                sourceMap: options$2876.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2877.code,
                sourceMap: output$2877.map.toString()
            };
        }
        return { code: codegen$2854.generate(ast$2878, { comment: true }) };
    }
    function loadNodeModule$2861(root$2879, moduleName$2880) {
        var Module$2881 = module.constructor;
        var mock$2882 = {
                id: root$2879 + '/$sweet-loader.js',
                filename: '$sweet-loader.js',
                paths: /^\.\/|\.\./.test(root$2879) ? [root$2879] : Module$2881._nodeModulePaths(root$2879)
            };
        var path$2883 = Module$2881._resolveFilename(moduleName$2880, mock$2882);
        return expandModule$2856(fs$2853.readFileSync(path$2883, 'utf8'));
    }
    exports$2847.expand = expand$2855;
    exports$2847.parse = parse$2859;
    exports$2847.compile = compile$2860;
    exports$2847.loadModule = expandModule$2856;
    exports$2847.loadNodeModule = loadNodeModule$2861;
}));
//# sourceMappingURL=sweet.js.map