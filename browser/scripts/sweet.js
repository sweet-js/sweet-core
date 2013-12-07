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
(function (root$1986, factory$1987) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1988 = require('./parser');
        var expander$1989 = require('./expander');
        var syn$1990 = require('./syntax');
        var codegen$1991 = require('escodegen');
        var path$1992 = require('path');
        var fs$1993 = require('fs');
        var lib$1994 = path$1992.join(path$1992.dirname(fs$1993.realpathSync(__filename)), '../macros');
        var stxcaseModule$1995 = fs$1993.readFileSync(lib$1994 + '/stxcase.js', 'utf8');
        factory$1987(exports, parser$1988, expander$1989, syn$1990, stxcaseModule$1995, codegen$1991);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1996, filename$1997) {
            var content$1998 = require('fs').readFileSync(filename$1997, 'utf8');
            module$1996._compile(codegen$1991.generate(exports.parse(content$1998)), filename$1997);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1987);
    }
}(this, function (exports$1999, parser$2000, expander$2001, syn$2002, stxcaseModule$2003, gen$2004) {
    var codegen$2005 = gen$2004 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$2006(code$2009, globalMacros$2010) {
        var program$2011, toString$2012;
        globalMacros$2010 = globalMacros$2010 || '';
        toString$2012 = String;
        if (typeof code$2009 !== 'string' && !(code$2009 instanceof String)) {
            code$2009 = toString$2012(code$2009);
        }
        var source$2013 = code$2009;
        if (source$2013.length > 0) {
            if (typeof source$2013[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$2009 instanceof String) {
                    source$2013 = code$2009.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$2013[0] === 'undefined') {
                    source$2013 = stringToArray(code$2009);
                }
            }
        }
        var readTree$2014 = parser$2000.read(source$2013);
        try {
            return expander$2001.expand(readTree$2014, stxcaseModule$2003 + '\n' + globalMacros$2010);
        } catch (err$2015) {
            if (err$2015 instanceof syn$2002.MacroSyntaxError) {
                throw new SyntaxError(syn$2002.printSyntaxError(source$2013, err$2015));
            } else {
                throw err$2015;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$2007(code$2016, globalMacros$2017) {
        if (code$2016 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$2016 = ' ';
        }
        return parser$2000.parse(expand$2006(code$2016, globalMacros$2017));
    }
    exports$1999.expand = expand$2006;
    exports$1999.parse = parse$2007;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1999.compile = function compile$2008(code$2018, options$2019) {
        var output$2020;
        options$2019 = options$2019 || {};
        var ast$2021 = parse$2007(code$2018, options$2019.macros);
        if (options$2019.sourceMap) {
            output$2020 = codegen$2005.generate(ast$2021, {
                comment: true,
                sourceMap: options$2019.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2020.code,
                sourceMap: output$2020.map.toString()
            };
        }
        return { code: codegen$2005.generate(ast$2021, { comment: true }) };
    };
}));