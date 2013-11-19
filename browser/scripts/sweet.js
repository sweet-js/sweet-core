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
(function (root$1198, factory$1199) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1200 = require('./parser');
        var expander$1201 = require('./expander');
        var syn$1202 = require('./syntax');
        var codegen$1203 = require('escodegen');
        var path$1204 = require('path');
        var fs$1205 = require('fs');
        var lib$1206 = path$1204.join(path$1204.dirname(fs$1205.realpathSync(__filename)), '../macros');
        var stxcaseModule$1207 = fs$1205.readFileSync(lib$1206 + '/stxcase.js', 'utf8');
        factory$1199(exports, parser$1200, expander$1201, syn$1202, stxcaseModule$1207, codegen$1203);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1209, filename$1210) {
            var content$1211 = require('fs').readFileSync(filename$1210, 'utf8');
            module$1209._compile(codegen$1203.generate(exports.parse(content$1211)), filename$1210);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1199);
    }
}(this, function (exports$1212, parser$1213, expander$1214, syn$1215, stxcaseModule$1216, gen$1217) {
    var codegen$1218 = gen$1217 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1220(code$1225) {
        var program$1226, toString$1227;
        toString$1227 = String;
        if (typeof code$1225 !== 'string' && !(code$1225 instanceof String)) {
            code$1225 = toString$1227(code$1225);
        }
        var source$1228 = code$1225;
        if (source$1228.length > 0) {
            if (typeof source$1228[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1225 instanceof String) {
                    source$1228 = code$1225.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1228[0] === 'undefined') {
                    source$1228 = stringToArray(code$1225);
                }
            }
        }
        var readTree$1229 = parser$1213.read(source$1228);
        try {
            return expander$1214.expand(readTree$1229, stxcaseModule$1216);
        } catch (err$1230) {
            if (err$1230 instanceof syn$1215.MacroSyntaxError) {
                throw new SyntaxError(syn$1215.printSyntaxError(source$1228, err$1230));
            } else {
                throw err$1230;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1222(code$1231) {
        if (code$1231 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1231 = ' ';
        }
        return parser$1213.parse(expand$1220(code$1231));
    }
    exports$1212.expand = expand$1220;
    exports$1212.parse = parse$1222;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1212.compile = function compile$1224(code$1232, options$1233) {
        var code_output$1234, sourcemap$1235;
        options$1233 = options$1233 || {};
        var ast$1236 = parse$1222(code$1232);
        if (options$1233.sourceMap) {
            code_output$1234 = codegen$1218.generate(ast$1236, { comment: true });
            sourcemap$1235 = codegen$1218.generate(ast$1236, { sourceMap: options$1233.filename });
            return {
                code: code_output$1234,
                sourceMap: sourcemap$1235
            };
        }
        return { code: codegen$1218.generate(ast$1236, { comment: true }) };
    };
}));