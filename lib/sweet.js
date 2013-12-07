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
(function (root$2000, factory$2001) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$2002 = require('./parser');
        var expander$2003 = require('./expander');
        var syn$2004 = require('./syntax');
        var codegen$2005 = require('escodegen');
        var path$2006 = require('path');
        var fs$2007 = require('fs');
        var lib$2008 = path$2006.join(path$2006.dirname(fs$2007.realpathSync(__filename)), '../macros');
        var stxcaseModule$2009 = fs$2007.readFileSync(lib$2008 + '/stxcase.js', 'utf8');
        factory$2001(exports, parser$2002, expander$2003, syn$2004, stxcaseModule$2009, codegen$2005);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$2010, filename$2011) {
            var content$2012 = require('fs').readFileSync(filename$2011, 'utf8');
            module$2010._compile(codegen$2005.generate(exports.parse(content$2012)), filename$2011);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$2001);
    }
}(this, function (exports$2013, parser$2014, expander$2015, syn$2016, stxcaseModule$2017, gen$2018) {
    var codegen$2019 = gen$2018 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2020(code$2023, globalMacros$2024) {
        var program$2025, toString$2026;
        globalMacros$2024 = globalMacros$2024 || '';
        toString$2026 = String;
        if (typeof code$2023 !== 'string' && !(code$2023 instanceof String)) {
            code$2023 = toString$2026(code$2023);
        }
        var source$2027 = code$2023;
        if (source$2027.length > 0) {
            if (typeof source$2027[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2023 instanceof String) {
                    source$2027 = code$2023.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2027[0] === 'undefined') {
                    source$2027 = stringToArray(code$2023);
                }
            }
        }
        var readTree$2028 = parser$2014.read(source$2027);
        try {
            return expander$2015.expand(readTree$2028, stxcaseModule$2017 + '\n' + globalMacros$2024);
        } catch (err$2029) {
            if (err$2029 instanceof syn$2016.MacroSyntaxError) {
                throw new SyntaxError(syn$2016.printSyntaxError(source$2027, err$2029));
            } else {
                throw err$2029;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2021(code$2030, globalMacros$2031) {
        if (code$2030 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2030 = ' ';
        }
        return parser$2014.parse(expand$2020(code$2030, globalMacros$2031));
    }
    exports$2013.expand = expand$2020;
    exports$2013.parse = parse$2021;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$2013.compile = function compile$2022(code$2032, options$2033) {
        var output$2034;
        options$2033 = options$2033 || {};
        var ast$2035 = parse$2021(code$2032, options$2033.macros);
        if (options$2033.sourceMap) {
            output$2034 = codegen$2019.generate(ast$2035, {
                comment: true,
                sourceMap: options$2033.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2034.code,
                sourceMap: output$2034.map.toString()
            };
        }
        return { code: codegen$2019.generate(ast$2035, { comment: true }) };
    };
}));