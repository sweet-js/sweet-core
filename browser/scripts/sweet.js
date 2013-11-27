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
(function (root$1614, factory$1615) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$1616 = require('./parser');
        var expander$1617 = require('./expander');
        var syn$1618 = require('./syntax');
        var codegen$1619 = require('escodegen');
        var path$1620 = require('path');
        var fs$1621 = require('fs');
        var lib$1622 = path$1620.join(path$1620.dirname(fs$1621.realpathSync(__filename)), '../macros');
        var stxcaseModule$1623 = fs$1621.readFileSync(lib$1622 + '/stxcase.js', 'utf8');
        factory$1615(exports, parser$1616, expander$1617, syn$1618, stxcaseModule$1623, codegen$1619);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$1624, filename$1625) {
            var content$1626 = require('fs').readFileSync(filename$1625, 'utf8');
            module$1624._compile(codegen$1619.generate(exports.parse(content$1626)), filename$1625);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1615);
    }
}(this, function (exports$1627, parser$1628, expander$1629, syn$1630, stxcaseModule$1631, gen$1632) {
    var codegen$1633 = gen$1632 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$1634(code$1637, globalMacros$1638) {
        var program$1639, toString$1640;
        globalMacros$1638 = globalMacros$1638 || '';
        toString$1640 = String;
        if (typeof code$1637 !== 'string' && !(code$1637 instanceof String)) {
            code$1637 = toString$1640(code$1637);
        }
        var source$1641 = code$1637;
        if (source$1641.length > 0) {
            if (typeof source$1641[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1637 instanceof String) {
                    source$1641 = code$1637.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$1641[0] === 'undefined') {
                    source$1641 = stringToArray(code$1637);
                }
            }
        }
        var readTree$1642 = parser$1628.read(source$1641);
        try {
            return expander$1629.expand(readTree$1642, stxcaseModule$1631 + '\n' + globalMacros$1638);
        } catch (err$1643) {
            if (err$1643 instanceof syn$1630.MacroSyntaxError) {
                throw new SyntaxError(syn$1630.printSyntaxError(source$1641, err$1643));
            } else {
                throw err$1643;
            }
        }
    }
    // fun (Str, {}) -> AST
    function parse$1635(code$1644, globalMacros$1645) {
        if (code$1644 === '') {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code$1644 = ' ';
        }
        return parser$1628.parse(expand$1634(code$1644, globalMacros$1645));
    }
    exports$1627.expand = expand$1634;
    exports$1627.parse = parse$1635;
    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports$1627.compile = function compile$1636(code$1646, options$1647) {
        var output$1648;
        options$1647 = options$1647 || {};
        var ast$1649 = parse$1635(code$1646, options$1647.macros);
        if (options$1647.sourceMap) {
            output$1648 = codegen$1633.generate(ast$1649, {
                comment: true,
                sourceMap: options$1647.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$1648.code,
                sourceMap: output$1648.map.toString()
            };
        }
        return { code: codegen$1633.generate(ast$1649, { comment: true }) };
    };
}));