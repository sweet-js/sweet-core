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
(function (root$2008, factory$2009) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2010 = require('./parser');
        var expander$2011 = require('./expander');
        var syn$2012 = require('./syntax');
        var codegen$2013 = require('escodegen');
        var path$2014 = require('path');
        var fs$2015 = require('fs');
        var lib$2016 = path$2014.join(path$2014.dirname(fs$2015.realpathSync(__filename)), '../macros');
        var stxcaseModule$2017 = fs$2015.readFileSync(lib$2016 + '/stxcase.js', 'utf8');
        factory$2009(exports, parser$2010, expander$2011, syn$2012, stxcaseModule$2017, codegen$2013);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2018, filename$2019) {
            var content$2020 = require('fs').readFileSync(filename$2019, 'utf8');
            module$2018._compile(codegen$2013.generate(exports.parse(content$2020)), filename$2019);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2009);
    }
}(this, function (exports$2021, parser$2022, expander$2023, syn$2024, stxcaseModule$2025, gen$2026) {
    var codegen$2027 = gen$2026 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2028(code$2031, globalMacros$2032) {
        var program$2033, toString$2034;
        globalMacros$2032 = globalMacros$2032 || '';
        toString$2034 = String;
        if (typeof code$2031 !== 'string' && !(code$2031 instanceof String)) {
            code$2031 = toString$2034(code$2031);
        }
        var source$2035 = code$2031;
        if (source$2035.length > 0) {
            if (typeof source$2035[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2031 instanceof String) {
                    source$2035 = code$2031.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2035[0] === 'undefined') {
                    source$2035 = stringToArray(code$2031);
                }
            }
        }
        var readTree$2036 = parser$2022.read(source$2035);
        try {
            return expander$2023.expand(readTree$2036, stxcaseModule$2025 + '\n' + globalMacros$2032);
        } catch (err$2037) {
            if (err$2037 instanceof syn$2024.MacroSyntaxError) {
                throw new SyntaxError(syn$2024.printSyntaxError(source$2035, err$2037));
            } else {
                throw err$2037;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2029(code$2038, globalMacros$2039) {
        if (code$2038 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2038 = ' ';
        }
        return parser$2022.parse(expand$2028(code$2038, globalMacros$2039));
    }
    exports$2021.expand = expand$2028;
    exports$2021.parse = parse$2029;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2021.compile = function compile$2030(code$2040, options$2041) {
        var output$2042;
        options$2041 = options$2041 || {};
        var ast$2043 = parse$2029(code$2040, options$2041.macros);
        if (options$2041.sourceMap) {
            output$2042 = codegen$2027.generate(ast$2043, {
                comment: true,
                sourceMap: options$2041.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2042.code,
                sourceMap: output$2042.map.toString()
            };
        }
        return { code: codegen$2027.generate(ast$2043, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map