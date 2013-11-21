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
(function (root$1610, factory$1611) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1612 = require('./parser');
        var expander$1613 = require('./expander');
        var syn$1614 = require('./syntax');
        var codegen$1615 = require('escodegen');
        var path$1616 = require('path');
        var fs$1617 = require('fs');
        var lib$1618 = path$1616.join(path$1616.dirname(fs$1617.realpathSync(__filename)), '../macros');
        var stxcaseModule$1619 = fs$1617.readFileSync(lib$1618 + '/stxcase.js', 'utf8');
        factory$1611(exports, parser$1612, expander$1613, syn$1614, stxcaseModule$1619, codegen$1615);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1620, filename$1621) {
            var content$1622 = require('fs').readFileSync(filename$1621, 'utf8');
            module$1620._compile(codegen$1615.generate(exports.parse(content$1622)), filename$1621);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1611);
    }
}(this, function (exports$1623, parser$1624, expander$1625, syn$1626, stxcaseModule$1627, gen$1628) {
    var codegen$1629 = gen$1628 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1630(code$1633, globalMacros$1634) {
        var program$1635, toString$1636;
        globalMacros$1634 = globalMacros$1634 || '';
        toString$1636 = String;
        if (typeof code$1633 !== 'string' && !(code$1633 instanceof String)) {
            code$1633 = toString$1636(code$1633);
        }
        var source$1637 = code$1633;
        if (source$1637.length > 0) {
            if (typeof source$1637[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1633 instanceof String) {
                    source$1637 = code$1633.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1637[0] === 'undefined') {
                    source$1637 = stringToArray(code$1633);
                }
            }
        }
        var readTree$1638 = parser$1624.read(source$1637);
        try {
            return expander$1625.expand(readTree$1638, stxcaseModule$1627 + '\n' + globalMacros$1634);
        } catch (err$1639) {
            if (err$1639 instanceof syn$1626.MacroSyntaxError) {
                throw new SyntaxError(syn$1626.printSyntaxError(source$1637, err$1639));
            } else {
                throw err$1639;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1631(code$1640, globalMacros$1641) {
        if (code$1640 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1640 = ' ';
        }
        return parser$1624.parse(expand$1630(code$1640, globalMacros$1641));
    }
    exports$1623.expand = expand$1630;
    exports$1623.parse = parse$1631;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1623.compile = function compile$1632(code$1642, options$1643) {
        var code_output$1644, sourcemap$1645;
        options$1643 = options$1643 || {};
        var ast$1646 = parse$1631(code$1642, options$1643.macros);
        if (options$1643.sourceMap) {
            code_output$1644 = codegen$1629.generate(ast$1646, { comment: true });
            sourcemap$1645 = codegen$1629.generate(ast$1646, { sourceMap: options$1643.filename });
            return {
                code: code_output$1644,
                sourceMap: sourcemap$1645
            };
        }
        return { code: codegen$1629.generate(ast$1646, { comment: true }) };
    };
}));