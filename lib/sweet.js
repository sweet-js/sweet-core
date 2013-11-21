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
(function (root$1606, factory$1607) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1608 = require('./parser');
        var expander$1609 = require('./expander');
        var syn$1610 = require('./syntax');
        var codegen$1611 = require('escodegen');
        var path$1612 = require('path');
        var fs$1613 = require('fs');
        var lib$1614 = path$1612.join(path$1612.dirname(fs$1613.realpathSync(__filename)), '../macros');
        var stxcaseModule$1615 = fs$1613.readFileSync(lib$1614 + '/stxcase.js', 'utf8');
        factory$1607(exports, parser$1608, expander$1609, syn$1610, stxcaseModule$1615, codegen$1611);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1616, filename$1617) {
            var content$1618 = require('fs').readFileSync(filename$1617, 'utf8');
            module$1616._compile(codegen$1611.generate(exports.parse(content$1618)), filename$1617);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1607);
    }
}(this, function (exports$1619, parser$1620, expander$1621, syn$1622, stxcaseModule$1623, gen$1624) {
    var codegen$1625 = gen$1624 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1626(code$1629, globalMacros$1630) {
        var program$1631, toString$1632;
        globalMacros$1630 = globalMacros$1630 || '';
        toString$1632 = String;
        if (typeof code$1629 !== 'string' && !(code$1629 instanceof String)) {
            code$1629 = toString$1632(code$1629);
        }
        var source$1633 = code$1629;
        if (source$1633.length > 0) {
            if (typeof source$1633[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1629 instanceof String) {
                    source$1633 = code$1629.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1633[0] === 'undefined') {
                    source$1633 = stringToArray(code$1629);
                }
            }
        }
        var readTree$1634 = parser$1620.read(source$1633);
        try {
            return expander$1621.expand(readTree$1634, stxcaseModule$1623 + '\n' + globalMacros$1630);
        } catch (err$1635) {
            if (err$1635 instanceof syn$1622.MacroSyntaxError) {
                throw new SyntaxError(syn$1622.printSyntaxError(source$1633, err$1635));
            } else {
                throw err$1635;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1627(code$1636, globalMacros$1637) {
        if (code$1636 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1636 = ' ';
        }
        return parser$1620.parse(expand$1626(code$1636, globalMacros$1637));
    }
    exports$1619.expand = expand$1626;
    exports$1619.parse = parse$1627;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1619.compile = function compile$1628(code$1638, options$1639) {
        var code_output$1640, sourcemap$1641;
        options$1639 = options$1639 || {};
        var ast$1642 = parse$1627(code$1638, options$1639.macros);
        if (options$1639.sourceMap) {
            code_output$1640 = codegen$1625.generate(ast$1642, { comment: true });
            sourcemap$1641 = codegen$1625.generate(ast$1642, { sourceMap: options$1639.filename });
            return {
                code: code_output$1640,
                sourceMap: sourcemap$1641
            };
        }
        return { code: codegen$1625.generate(ast$1642, { comment: true }) };
    };
}));