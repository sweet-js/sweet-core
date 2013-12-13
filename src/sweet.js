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


(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser = require("./parser");
        var expander = require("./expander");
        var syn = require("./syntax");
        var codegen = require("escodegen");

        var path = require('path');
        var fs   = require('fs');
        var lib  = path.join(path.dirname(fs.realpathSync(__filename)), "../macros");

        var stxcaseModule = fs.readFileSync(lib + "/stxcase.js", 'utf8');

        factory(exports, parser, expander, syn, stxcaseModule, codegen);

        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function(module, filename) {
            var content = require('fs').readFileSync(filename, 'utf8');
            module._compile(codegen.generate(exports.parse(content)), filename);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', './parser', './expander', './syntax', 'text!./stxcase.js'], factory);
    }
}(this, function (exports, parser, expander, syn, stxcaseModule, gen) {
    var codegen = gen || escodegen;

    // fun (Str) -> [...CSyntax]
    function expand(code, globalMacros, maxExpands) {
        var program, toString;
        globalMacros = globalMacros || '';

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }
        
        var source = code;

        if (source.length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }

                // Force accessing the characters via an array.
                if (typeof source[0] === 'undefined') {
                    source = stringToArray(code);
                }
            }
        }

        var readTree = parser.read(source);
        try {
            return expander.expand(readTree, stxcaseModule + '\n' + globalMacros, maxExpands);
        } catch(err) {
            if (err instanceof syn.MacroSyntaxError) {
                throw new SyntaxError(syn.printSyntaxError(source, err));
            } else {
                throw err;
            }
        }
    }

    // fun (Str, {}) -> AST
    function parse(code, globalMacros, maxExpands) {
        if (code === "") {
            // old version of esprima doesn't play nice with the empty string
            // and loc/range info so until we can upgrade hack in a single space
            code = " ";
        }

        return parser.parse(expand(code, globalMacros, maxExpands));
    }


    // fun ([...CSyntax]) -> String
    function prettyPrint(stxarr) {
        var indent = 0;
        var unparsedLines = stxarr.reduce(function(acc, stx) {
            var s = stx.token.value;

            if(s == '{') {
                acc[0].str += ' ' + s;
                indent++;
                acc.unshift({ indent: indent, str: '' });
            }
            else if(s == '}') {
                indent--;
                acc.unshift({ indent: indent, str: s });
                acc.unshift({ indent: indent, str: '' });
            }
            else if(s == ';') {
                acc[0].str += s;
                acc.unshift({ indent: indent, str: '' });
            }
            else {
                acc[0].str += (acc[0].str ? ' ' : '') + s;
            }

            return acc;
        }, [{ indent: 0, str: '' }]);

        return unparsedLines.reduce(function(acc, line) {
            var ind = '';
            while(ind.length < line.indent * 2) {
                ind += ' ';
            }
            return ind + line.str + '\n' + acc;
        }, '');
    }

    exports.expand = expand;
    exports.parse = parse;
    exports.prettyPrint = prettyPrint;

    // (Str, {sourceMap: ?Bool, filename: ?Str})
    //    -> { code: Str, sourceMap: ?Str }
    exports.compile = function compile(code, options) {
        var output;
        options = options || {};

        var ast = parse(code, options.macros);

        if (options.sourceMap) {
            output = codegen.generate(ast, {
                comment: true,
                sourceMap: options.filename,
                sourceMapWithCode: true
            });

            return {
                code: output.code,
                sourceMap: output.map.toString()
            };
        } 
        return {
            code: codegen.generate(ast, {
                comment: true
            })
        };
    }
}));
