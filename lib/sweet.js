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
(function (root$2313, factory$2314) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2315 = require('./parser');
        var expander$2316 = require('./expander');
        var syn$2317 = require('./syntax');
        var codegen$2318 = require('escodegen');
        var path$2319 = require('path');
        var fs$2320 = require('fs');
        var lib$2321 = path$2319.join(path$2319.dirname(fs$2320.realpathSync(__filename)), '../macros');
        var stxcaseModule$2322 = fs$2320.readFileSync(lib$2321 + '/stxcase.js', 'utf8');
        factory$2314(exports, parser$2315, expander$2316, syn$2317, stxcaseModule$2322, codegen$2318);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2323, filename$2324) {
            var content$2325 = require('fs').readFileSync(filename$2324, 'utf8');
            module$2323._compile(codegen$2318.generate(exports.parse(content$2325)), filename$2324);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2314);
    }
}(this, function (exports$2326, parser$2327, expander$2328, syn$2329, stxcaseModule$2330, gen$2331) {
    var codegen$2332 = gen$2331 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2333(code$2336, globalMacros$2337) {
        var program$2338, toString$2339;
        globalMacros$2337 = globalMacros$2337 || '';
        toString$2339 = String;
        if (typeof code$2336 !== 'string' && !(code$2336 instanceof String)) {
            code$2336 = toString$2339(code$2336);
        }
        var source$2340 = code$2336;
        if (source$2340.length > 0) {
            if (typeof source$2340[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2336 instanceof String) {
                    source$2340 = code$2336.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2340[0] === 'undefined') {
                    source$2340 = stringToArray(code$2336);
                }
            }
        }
        var readTree$2341 = parser$2327.read(source$2340);
        try {
            return expander$2328.expand(readTree$2341, stxcaseModule$2330 + '\n' + globalMacros$2337);
        } catch (err$2342) {
            if (err$2342 instanceof syn$2329.MacroSyntaxError) {
                throw new SyntaxError(syn$2329.printSyntaxError(source$2340, err$2342));
            } else {
                throw err$2342;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2334(code$2343, globalMacros$2344) {
        if (code$2343 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2343 = ' ';
        }
        return parser$2327.parse(expand$2333(code$2343, globalMacros$2344));
    }
    exports$2326.expand = expand$2333;
    exports$2326.parse = parse$2334;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2326.compile = function compile$2335(code$2345, options$2346) {
        var output$2347;
        options$2346 = options$2346 || {};
        var ast$2348 = parse$2334(code$2345, options$2346.macros);
        if (options$2346.sourceMap) {
            output$2347 = codegen$2332.generate(ast$2348, {
                comment: true,
                sourceMap: options$2346.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2347.code,
                sourceMap: output$2347.map.toString()
            };
        }
        return { code: codegen$2332.generate(ast$2348, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map