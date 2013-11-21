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
(function (root$1630, factory$1631) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1632 = require('./parser');
        var expander$1633 = require('./expander');
        var syn$1634 = require('./syntax');
        var codegen$1635 = require('escodegen');
        var path$1636 = require('path');
        var fs$1637 = require('fs');
        var lib$1638 = path$1636.join(path$1636.dirname(fs$1637.realpathSync(__filename)), '../macros');
        var stxcaseModule$1639 = fs$1637.readFileSync(lib$1638 + '/stxcase.js', 'utf8');
        factory$1631(exports, parser$1632, expander$1633, syn$1634, stxcaseModule$1639, codegen$1635);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1640, filename$1641) {
            var content$1642 = require('fs').readFileSync(filename$1641, 'utf8');
            module$1640._compile(codegen$1635.generate(exports.parse(content$1642)), filename$1641);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1631);
    }
}(this, function (exports$1643, parser$1644, expander$1645, syn$1646, stxcaseModule$1647, gen$1648) {
    var codegen$1649 = gen$1648 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1650(code$1653) {
        var program$1654, toString$1655;
        toString$1655 = String;
        if (typeof code$1653 !== 'string' && !(code$1653 instanceof String)) {
            code$1653 = toString$1655(code$1653);
        }
        var source$1656 = code$1653;
        if (source$1656.length > 0) {
            if (typeof source$1656[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1653 instanceof String) {
                    source$1656 = code$1653.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1656[0] === 'undefined') {
                    source$1656 = stringToArray(code$1653);
                }
            }
        }
        var readTree$1657 = parser$1644.read(source$1656);
        try {
            return expander$1645.expand(readTree$1657, stxcaseModule$1647);
        } catch (err$1658) {
            if (err$1658 instanceof syn$1646.MacroSyntaxError) {
                throw new SyntaxError(syn$1646.printSyntaxError(source$1656, err$1658));
            } else {
                throw err$1658;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1651(code$1659) {
        if (code$1659 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1659 = ' ';
        }
        return parser$1644.parse(expand$1650(code$1659));
    }
    exports$1643.expand = expand$1650;
    exports$1643.parse = parse$1651;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1643.compile = function compile$1652(code$1660, options$1661) {
        var code_output$1662, sourcemap$1663;
        options$1661 = options$1661 || {};
        var ast$1664 = parse$1651(code$1660);
        if (options$1661.sourceMap) {
            code_output$1662 = codegen$1649.generate(ast$1664, { comment: true });
            sourcemap$1663 = codegen$1649.generate(ast$1664, { sourceMap: options$1661.filename });
            return {
                code: code_output$1662,
                sourceMap: sourcemap$1663
            };
        }
        return { code: codegen$1649.generate(ast$1664, { comment: true }) };
    };
}));