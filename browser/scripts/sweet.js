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
(function (root$1284, factory$1285) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1286 = require('./parser');
        var expander$1287 = require('./expander');
        var syn$1288 = require('./syntax');
        var codegen$1289 = require('escodegen');
        var path$1290 = require('path');
        var fs$1291 = require('fs');
        var lib$1292 = path$1290.join(path$1290.dirname(fs$1291.realpathSync(__filename)), '../macros');
        var stxcaseModule$1293 = fs$1291.readFileSync(lib$1292 + '/stxcase.js', 'utf8');
        factory$1285(exports, parser$1286, expander$1287, syn$1288, stxcaseModule$1293, codegen$1289);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1296, filename$1297) {
            var content$1298 = require('fs').readFileSync(filename$1297, 'utf8');
            module$1296._compile(codegen$1289.generate(exports.parse(content$1298)), filename$1297);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1285);
    }
}(this, function (exports$1299, parser$1300, expander$1301, syn$1302, stxcaseModule$1303, gen$1304) {
    var codegen$1305 = gen$1304 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1308(code$1317) {
        var program$1318, toString$1319;
        toString$1319 = String;
        if (typeof code$1317 !== 'string' && !(code$1317 instanceof String)) {
            code$1317 = toString$1319(code$1317);
        }
        var source$1320 = code$1317;
        if (source$1320.length > 0) {
            if (typeof source$1320[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1317 instanceof String) {
                    source$1320 = code$1317.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1320[0] === 'undefined') {
                    source$1320 = stringToArray(code$1317);
                }
            }
        }
        var readTree$1321 = parser$1300.read(source$1320);
        try {
            return expander$1301.expand(readTree$1321, stxcaseModule$1303);
        } catch (err$1322) {
            if (err$1322 instanceof syn$1302.MacroSyntaxError) {
                throw new SyntaxError(syn$1302.printSyntaxError(source$1320, err$1322));
            } else {
                throw err$1322;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1311(code$1323) {
        if (code$1323 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1323 = ' ';
        }
        return parser$1300.parse(expand$1308(code$1323));
    }
    exports$1299.expand = expand$1308;
    exports$1299.parse = parse$1311;
    exports$1299.compileWithSourcemap = function (code$1324, filename$1325) {
        var ast$1326 = parse$1311(code$1324);
        var code_output$1327 = codegen$1305.generate(ast$1326, { comment: true });
        var sourcemap$1328 = codegen$1305.generate(ast$1326, { sourceMap: filename$1325 });
        return {
            code: code_output$1327,
            sourceMap: sourcemap$1328
        };
    };
    exports$1299.compile = function compile$1316(code$1329) {
        var ast$1330 = parse$1311(code$1329);
        return codegen$1305.generate(ast$1330, { comment: true });
    };
}));