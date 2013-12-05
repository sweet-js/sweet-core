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
(function (root$1674, factory$1675) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1676 = require('./parser');
        var expander$1677 = require('./expander');
        var syn$1678 = require('./syntax');
        var codegen$1679 = require('escodegen');
        var path$1680 = require('path');
        var fs$1681 = require('fs');
        var lib$1682 = path$1680.join(path$1680.dirname(fs$1681.realpathSync(__filename)), '../macros');
        var stxcaseModule$1683 = fs$1681.readFileSync(lib$1682 + '/stxcase.js', 'utf8');
        factory$1675(exports, parser$1676, expander$1677, syn$1678, stxcaseModule$1683, codegen$1679);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1684, filename$1685) {
            var content$1686 = require('fs').readFileSync(filename$1685, 'utf8');
            module$1684._compile(codegen$1679.generate(exports.parse(content$1686)), filename$1685);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1675);
    }
}(this, function (exports$1687, parser$1688, expander$1689, syn$1690, stxcaseModule$1691, gen$1692) {
    var codegen$1693 = gen$1692 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1694(code$1697, globalMacros$1698) {
        var program$1699, toString$1700;
        globalMacros$1698 = globalMacros$1698 || '';
        toString$1700 = String;
        if (typeof code$1697 !== 'string' && !(code$1697 instanceof String)) {
            code$1697 = toString$1700(code$1697);
        }
        var source$1701 = code$1697;
        if (source$1701.length > 0) {
            if (typeof source$1701[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1697 instanceof String) {
                    source$1701 = code$1697.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1701[0] === 'undefined') {
                    source$1701 = stringToArray(code$1697);
                }
            }
        }
        var readTree$1702 = parser$1688.read(source$1701);
        try {
            return expander$1689.expand(readTree$1702, stxcaseModule$1691 + '\n' + globalMacros$1698);
        } catch (err$1703) {
            if (err$1703 instanceof syn$1690.MacroSyntaxError) {
                throw new SyntaxError(syn$1690.printSyntaxError(source$1701, err$1703));
            } else {
                throw err$1703;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1695(code$1704, globalMacros$1705) {
        if (code$1704 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1704 = ' ';
        }
        return parser$1688.parse(expand$1694(code$1704, globalMacros$1705));
    }
    exports$1687.expand = expand$1694;
    exports$1687.parse = parse$1695;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1687.compile = function compile$1696(code$1706, options$1707) {
        var output$1708;
        options$1707 = options$1707 || {};
        var ast$1709 = parse$1695(code$1706, options$1707.macros);
        if (options$1707.sourceMap) {
            output$1708 = codegen$1693.generate(ast$1709, {
                comment: true,
                sourceMap: options$1707.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1708.code,
                sourceMap: output$1708.map.toString()
            };
        }
        return { code: codegen$1693.generate(ast$1709, { comment: true }) };
    };
}));