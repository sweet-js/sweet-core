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
(function (root$1609, factory$1610) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1611 = require('./parser');
        var expander$1612 = require('./expander');
        var syn$1613 = require('./syntax');
        var codegen$1614 = require('escodegen');
        var path$1615 = require('path');
        var fs$1616 = require('fs');
        var lib$1617 = path$1615.join(path$1615.dirname(fs$1616.realpathSync(__filename)), '../macros');
        var stxcaseModule$1618 = fs$1616.readFileSync(lib$1617 + '/stxcase.js', 'utf8');
        factory$1610(exports, parser$1611, expander$1612, syn$1613, stxcaseModule$1618, codegen$1614);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1619, filename$1620) {
            var content$1621 = require('fs').readFileSync(filename$1620, 'utf8');
            module$1619._compile(codegen$1614.generate(exports.parse(content$1621)), filename$1620);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1610);
    }
}(this, function (exports$1622, parser$1623, expander$1624, syn$1625, stxcaseModule$1626, gen$1627) {
    var codegen$1628 = gen$1627 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1629(code$1632, globalMacros$1633) {
        var program$1634, toString$1635;
        globalMacros$1633 = globalMacros$1633 || '';
        toString$1635 = String;
        if (typeof code$1632 !== 'string' && !(code$1632 instanceof String)) {
            code$1632 = toString$1635(code$1632);
        }
        var source$1636 = code$1632;
        if (source$1636.length > 0) {
            if (typeof source$1636[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1632 instanceof String) {
                    source$1636 = code$1632.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1636[0] === 'undefined') {
                    source$1636 = stringToArray(code$1632);
                }
            }
        }
        var readTree$1637 = parser$1623.read(source$1636);
        try {
            return expander$1624.expand(readTree$1637, stxcaseModule$1626 + '\n' + globalMacros$1633);
        } catch (err$1638) {
            if (err$1638 instanceof syn$1625.MacroSyntaxError) {
                throw new SyntaxError(syn$1625.printSyntaxError(source$1636, err$1638));
            } else {
                throw err$1638;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1630(code$1639, globalMacros$1640) {
        if (code$1639 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1639 = ' ';
        }
        return parser$1623.parse(expand$1629(code$1639, globalMacros$1640));
    }
    exports$1622.expand = expand$1629;
    exports$1622.parse = parse$1630;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1622.compile = function compile$1631(code$1641, options$1642) {
        var output$1643;
        options$1642 = options$1642 || {};
        var ast$1644 = parse$1630(code$1641, options$1642.macros);
        if (options$1642.sourceMap) {
            output$1643 = codegen$1628.generate(ast$1644, {
                comment: true,
                sourceMap: options$1642.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1643.code,
                sourceMap: output$1643.map.toString()
            };
        }
        return { code: codegen$1628.generate(ast$1644, { comment: true }) };
    };
}));
//# sourceMappingURL=sweet.js.map