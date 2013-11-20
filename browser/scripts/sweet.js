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
(function (root$1605, factory$1606) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1607 = require('./parser');
        var expander$1608 = require('./expander');
        var syn$1609 = require('./syntax');
        var codegen$1610 = require('escodegen');
        var path$1611 = require('path');
        var fs$1612 = require('fs');
        var lib$1613 = path$1611.join(path$1611.dirname(fs$1612.realpathSync(__filename)), '../macros');
        var stxcaseModule$1614 = fs$1612.readFileSync(lib$1613 + '/stxcase.js', 'utf8');
        factory$1606(exports, parser$1607, expander$1608, syn$1609, stxcaseModule$1614, codegen$1610);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1615, filename$1616) {
            var content$1617 = require('fs').readFileSync(filename$1616, 'utf8');
            module$1615._compile(codegen$1610.generate(exports.parse(content$1617)), filename$1616);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1606);
    }
}(this, function (exports$1618, parser$1619, expander$1620, syn$1621, stxcaseModule$1622, gen$1623) {
    var codegen$1624 = gen$1623 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1625(code$1628) {
        var program$1629, toString$1630;
        toString$1630 = String;
        if (typeof code$1628 !== 'string' && !(code$1628 instanceof String)) {
            code$1628 = toString$1630(code$1628);
        }
        var source$1631 = code$1628;
        if (source$1631.length > 0) {
            if (typeof source$1631[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1628 instanceof String) {
                    source$1631 = code$1628.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1631[0] === 'undefined') {
                    source$1631 = stringToArray(code$1628);
                }
            }
        }
        var readTree$1632 = parser$1619.read(source$1631);
        try {
            return expander$1620.expand(readTree$1632, stxcaseModule$1622);
        } catch (err$1633) {
            if (err$1633 instanceof syn$1621.MacroSyntaxError) {
                throw new SyntaxError(syn$1621.printSyntaxError(source$1631, err$1633));
            } else {
                throw err$1633;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1626(code$1634) {
        if (code$1634 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1634 = ' ';
        }
        return parser$1619.parse(expand$1625(code$1634));
    }
    exports$1618.expand = expand$1625;
    exports$1618.parse = parse$1626;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1618.compile = function compile$1627(code$1635, options$1636) {
        var code_output$1637, sourcemap$1638;
        options$1636 = options$1636 || {};
        var ast$1639 = parse$1626(code$1635);
        if (options$1636.sourceMap) {
            code_output$1637 = codegen$1624.generate(ast$1639, { comment: true });
            sourcemap$1638 = codegen$1624.generate(ast$1639, { sourceMap: options$1636.filename });
            return {
                code: code_output$1637,
                sourceMap: sourcemap$1638
            };
        }
        return { code: codegen$1624.generate(ast$1639, { comment: true }) };
    };
}));