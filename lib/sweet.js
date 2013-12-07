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
(function (root$1993, factory$1994) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1995 = require('./parser');
        var expander$1996 = require('./expander');
        var syn$1997 = require('./syntax');
        var codegen$1998 = require('escodegen');
        var path$1999 = require('path');
        var fs$2000 = require('fs');
        var lib$2001 = path$1999.join(path$1999.dirname(fs$2000.realpathSync(__filename)), '../macros');
        var stxcaseModule$2002 = fs$2000.readFileSync(lib$2001 + '/stxcase.js', 'utf8');
        factory$1994(exports, parser$1995, expander$1996, syn$1997, stxcaseModule$2002, codegen$1998);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2003, filename$2004) {
            var content$2005 = require('fs').readFileSync(filename$2004, 'utf8');
            module$2003._compile(codegen$1998.generate(exports.parse(content$2005)), filename$2004);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1994);
    }
}(this, function (exports$2006, parser$2007, expander$2008, syn$2009, stxcaseModule$2010, gen$2011) {
    var codegen$2012 = gen$2011 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2013(code$2016, globalMacros$2017) {
        var program$2018, toString$2019;
        globalMacros$2017 = globalMacros$2017 || '';
        toString$2019 = String;
        if (typeof code$2016 !== 'string' && !(code$2016 instanceof String)) {
            code$2016 = toString$2019(code$2016);
        }
        var source$2020 = code$2016;
        if (source$2020.length > 0) {
            if (typeof source$2020[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2016 instanceof String) {
                    source$2020 = code$2016.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2020[0] === 'undefined') {
                    source$2020 = stringToArray(code$2016);
                }
            }
        }
        var readTree$2021 = parser$2007.read(source$2020);
        try {
            return expander$2008.expand(readTree$2021, stxcaseModule$2010 + '\n' + globalMacros$2017);
        } catch (err$2022) {
            if (err$2022 instanceof syn$2009.MacroSyntaxError) {
                throw new SyntaxError(syn$2009.printSyntaxError(source$2020, err$2022));
            } else {
                throw err$2022;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2014(code$2023, globalMacros$2024) {
        if (code$2023 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2023 = ' ';
        }
        return parser$2007.parse(expand$2013(code$2023, globalMacros$2024));
    }
    exports$2006.expand = expand$2013;
    exports$2006.parse = parse$2014;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2006.compile = function compile$2015(code$2025, options$2026) {
        var output$2027;
        options$2026 = options$2026 || {};
        var ast$2028 = parse$2014(code$2025, options$2026.macros);
        if (options$2026.sourceMap) {
            output$2027 = codegen$2012.generate(ast$2028, {
                comment: true,
                sourceMap: options$2026.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2027.code,
                sourceMap: output$2027.map.toString()
            };
        }
        return { code: codegen$2012.generate(ast$2028, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map