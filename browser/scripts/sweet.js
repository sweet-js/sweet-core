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
(function (root$1990, factory$1991) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1992 = require('./parser');
        var expander$1993 = require('./expander');
        var syn$1994 = require('./syntax');
        var codegen$1995 = require('escodegen');
        var path$1996 = require('path');
        var fs$1997 = require('fs');
        var lib$1998 = path$1996.join(path$1996.dirname(fs$1997.realpathSync(__filename)), '../macros');
        var stxcaseModule$1999 = fs$1997.readFileSync(lib$1998 + '/stxcase.js', 'utf8');
        factory$1991(exports, parser$1992, expander$1993, syn$1994, stxcaseModule$1999, codegen$1995);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2000, filename$2001) {
            var content$2002 = require('fs').readFileSync(filename$2001, 'utf8');
            module$2000._compile(codegen$1995.generate(exports.parse(content$2002)), filename$2001);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1991);
    }
}(this, function (exports$2003, parser$2004, expander$2005, syn$2006, stxcaseModule$2007, gen$2008) {
    var codegen$2009 = gen$2008 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2010(code$2013, globalMacros$2014) {
        var program$2015, toString$2016;
        globalMacros$2014 = globalMacros$2014 || '';
        toString$2016 = String;
        if (typeof code$2013 !== 'string' && !(code$2013 instanceof String)) {
            code$2013 = toString$2016(code$2013);
        }
        var source$2017 = code$2013;
        if (source$2017.length > 0) {
            if (typeof source$2017[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2013 instanceof String) {
                    source$2017 = code$2013.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2017[0] === 'undefined') {
                    source$2017 = stringToArray(code$2013);
                }
            }
        }
        var readTree$2018 = parser$2004.read(source$2017);
        try {
            return expander$2005.expand(readTree$2018, stxcaseModule$2007 + '\n' + globalMacros$2014);
        } catch (err$2019) {
            if (err$2019 instanceof syn$2006.MacroSyntaxError) {
                throw new SyntaxError(syn$2006.printSyntaxError(source$2017, err$2019));
            } else {
                throw err$2019;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2011(code$2020, globalMacros$2021) {
        if (code$2020 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2020 = ' ';
        }
        return parser$2004.parse(expand$2010(code$2020, globalMacros$2021));
    }
    exports$2003.expand = expand$2010;
    exports$2003.parse = parse$2011;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2003.compile = function compile$2012(code$2022, options$2023) {
        var output$2024;
        options$2023 = options$2023 || {};
        var ast$2025 = parse$2011(code$2022, options$2023.macros);
        if (options$2023.sourceMap) {
            output$2024 = codegen$2009.generate(ast$2025, {
                comment: true,
                sourceMap: options$2023.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2024.code,
                sourceMap: output$2024.map.toString()
            };
        }
        return { code: codegen$2009.generate(ast$2025, { comment: true }) };
    };
}));