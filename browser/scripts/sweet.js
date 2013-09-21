(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        // CommonJS
        var parser$188 = require('./parser');
        var expander$189 = require('./expander');
        var codegen$190 = require('escodegen');
        var path$191 = require('path');
        var fs$192 = require('fs');
        var lib$193 = path$191.join(path$191.dirname(fs$192.realpathSync(__filename)), '../macros');
        var stxcaseModule$194 = fs$192.readFileSync(lib$193 + '/stxcase.js', 'utf8');
        factory$187(exports, parser$188, expander$189, stxcaseModule$194, codegen$190);
        // Alow require('./example') for an example.sjs file.
        require.extensions['.sjs'] = function (module$195, filename$196) {
            var content$197 = require('fs').readFileSync(filename$196, 'utf8');
            module$195._compile(codegen$190.generate(exports.parse(content$197)), filename$196);
        };
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$187);
    }
}(this, function (exports$198, parser$199, expander$200, stxcaseModule$201, gen$202) {
    var codegen$203 = gen$202 || escodegen;
    // fun (Str) -> [...CSyntax]
    function expand$204(code$207) {
        var program$208, toString$209;
        toString$209 = String;
        if (typeof code$207 !== 'string' && !(code$207 instanceof String)) {
            code$207 = toString$209(code$207);
        }
        var source$210 = code$207;
        if (source$210.length > 0) {
            if (typeof source$210[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$207 instanceof String) {
                    source$210 = code$207.valueOf();
                }
                // Force accessing the characters via an array.
                if (typeof source$210[0] === 'undefined') {
                    source$210 = stringToArray(code$207);
                }
            }
        }
        source$210 = stxcaseModule$201 + '\n\n' + source$210;
        var readTree$211 = parser$199.read(source$210);
        return [
            expander$200.expand(readTree$211[0], stxcaseModule$201),
            readTree$211[1]
        ];
    }
    // fun (Str, {}) -> AST
    function parse$205(code$212) {
        var exp$213 = expand$204(code$212);
        var lineoffset$214 = 2;
        for (var i$218 = 0; i$218 < stxcaseModule$201.length; i$218++) {
            if (stxcaseModule$201[i$218] === '\n') {
                lineoffset$214++;
            }
        }
        var linestartoffset$215 = stxcaseModule$201.length + 2;
        var adjustedStx$216 = exp$213[0];
        var adjustedComments$217 = exp$213[1];
        if (typeof lineoffset$214 !== 'undefined') {
            adjustedStx$216 = exp$213[0].map(function (stx$219) {
                stx$219.token.sm_lineNumber -= lineoffset$214;
                stx$219.token.sm_lineStart -= linestartoffset$215;
                stx$219.token.range[0] -= linestartoffset$215;
                stx$219.token.range[1] -= linestartoffset$215;
                return stx$219;
            });
            adjustedComments$217 = exp$213[1].map(function (tok$220) {
                tok$220.range[0] -= linestartoffset$215;
                tok$220.range[1] -= linestartoffset$215;
                return tok$220;
            });
        }
        return parser$199.parse(adjustedStx$216, adjustedComments$217);
    }
    exports$198.expand = expand$204;
    exports$198.parse = parse$205;
    exports$198.compileWithSourcemap = function (code$221, filename$222) {
        var ast$223 = parse$205(code$221);
        codegen$203.attachComments(ast$223, ast$223.comments, ast$223.tokens);
        var code_output$224 = codegen$203.generate(ast$223, { comment: true });
        var sourcemap$225 = codegen$203.generate(ast$223, { sourceMap: filename$222 });
        return [
            code_output$224,
            sourcemap$225
        ];
    };
    exports$198.compile = function compile$206(code$226) {
        var ast$227 = parse$205(code$226);
        codegen$203.attachComments(ast$227, ast$227.comments, ast$227.tokens);
        return codegen$203.generate(ast$227, { comment: true });
    };
}));