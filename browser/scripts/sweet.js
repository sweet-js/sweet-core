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
(function (root$1995, factory$1996) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1997 = require('./parser');
        var expander$1998 = require('./expander');
        var syn$1999 = require('./syntax');
        var codegen$2000 = require('escodegen');
        var path$2001 = require('path');
        var fs$2002 = require('fs');
        var lib$2003 = path$2001.join(path$2001.dirname(fs$2002.realpathSync(__filename)), '../macros');
        var stxcaseModule$2004 = fs$2002.readFileSync(lib$2003 + '/stxcase.js', 'utf8');
        factory$1996(exports, parser$1997, expander$1998, syn$1999, stxcaseModule$2004, codegen$2000);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2005, filename$2006) {
            var content$2007 = require('fs').readFileSync(filename$2006, 'utf8');
            module$2005._compile(codegen$2000.generate(exports.parse(content$2007)), filename$2006);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1996);
    }
}(this, function (exports$2008, parser$2009, expander$2010, syn$2011, stxcaseModule$2012, gen$2013) {
    var codegen$2014 = gen$2013 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2015(code$2018, globalMacros$2019) {
        var program$2020, toString$2021;
        globalMacros$2019 = globalMacros$2019 || '';
        toString$2021 = String;
        if (typeof code$2018 !== 'string' && !(code$2018 instanceof String)) {
            code$2018 = toString$2021(code$2018);
        }
        var source$2022 = code$2018;
        if (source$2022.length > 0) {
            if (typeof source$2022[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2018 instanceof String) {
                    source$2022 = code$2018.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2022[0] === 'undefined') {
                    source$2022 = stringToArray(code$2018);
                }
            }
        }
        var readTree$2023 = parser$2009.read(source$2022);
        try {
            return expander$2010.expand(readTree$2023, stxcaseModule$2012 + '\n' + globalMacros$2019);
        } catch (err$2024) {
            if (err$2024 instanceof syn$2011.MacroSyntaxError) {
                throw new SyntaxError(syn$2011.printSyntaxError(source$2022, err$2024));
            } else {
                throw err$2024;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2016(code$2025, globalMacros$2026) {
        if (code$2025 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2025 = ' ';
        }
        return parser$2009.parse(expand$2015(code$2025, globalMacros$2026));
    }
    exports$2008.expand = expand$2015;
    exports$2008.parse = parse$2016;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2008.compile = function compile$2017(code$2027, options$2028) {
        var output$2029;
        options$2028 = options$2028 || {};
        var ast$2030 = parse$2016(code$2027, options$2028.macros);
        if (options$2028.sourceMap) {
            output$2029 = codegen$2014.generate(ast$2030, {
                comment: true,
                sourceMap: options$2028.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2029.code,
                sourceMap: output$2029.map.toString()
            };
        }
        return { code: codegen$2014.generate(ast$2030, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map