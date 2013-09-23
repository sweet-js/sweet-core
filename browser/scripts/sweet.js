(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        var parser$188 = require('./parser');
        var expander$189 = require('./expander');
        var codegen$190 = require('escodegen');
        var path$191 = require('path');
        var fs$192 = require('fs');
        var lib$193 = path$191.join(path$191.dirname(fs$192.realpathSync(__filename)), '../macros');
        var stxcaseModule$194 = fs$192.readFileSync(lib$193 + '/stxcase.js', 'utf8');
        factory$187(exports, parser$188, expander$189, stxcaseModule$194, codegen$190);
        require.extensions['.sjs'] = function (module$195, filename$196) {
            var content$197 = require('fs').readFileSync(filename$196, 'utf8');
            module$195._compile(codegen$190.generate(exports.parse(content$197)), filename$196);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$187);
    }
}(this, function (exports$198, parser$199, expander$200, stxcaseModule$201, gen$202) {
    var codegen$203 = gen$202 || escodegen;
    function expand$204(code$207) {
        var program$208, toString$209;
        toString$209 = String;
        if (typeof code$207 !== 'string' && !(code$207 instanceof String)) {
            code$207 = toString$209(code$207);
        }
        var source$210 = code$207;
        if (source$210.length > 0) {
            if (typeof source$210[0] === 'undefined') {
                if (code$207 instanceof String) {
                    source$210 = code$207.valueOf();
                }
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
    function parse$205(code$212) {
        var exp$213 = expand$204(code$212);
        return parser$199.parse(exp$213[0], exp$213[1]);
    }
    exports$198.expand = expand$204;
    exports$198.parse = parse$205;
    exports$198.compileWithSourcemap = function (code$214, filename$215) {
        var ast$216 = parse$205(code$214);
        var code_output$217 = codegen$203.generate(ast$216, { comment: false });
        var sourcemap$218 = codegen$203.generate(ast$216, { sourceMap: filename$215 });
        return [
            code_output$217,
            sourcemap$218
        ];
    };
    exports$198.compile = function compile$206(code$219) {
        var ast$220 = parse$205(code$219);
        return codegen$203.generate(ast$220, { comment: false });
    };
}));