(function (root$0, factory$1) {
    if (typeof exports === 'object') {
        var parser$2 = require('./parser');
        var expander$3 = require('./expander');
        var codegen$4 = require('escodegen');
        factory$1(exports, parser$2, expander$3, codegen$4);
        require.extensions['.sjs'] = function (module$5, filename$6) {
            var content$7 = require('fs').readFileSync(filename$6, 'utf8');
            module$5._compile(codegen$4.generate(exports.parse(content$7)), filename$6);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen'
        ], factory$1);
    } else {
        factory$1(root$0.sweet = {}, root$0.parser, root$0.expander, root$0.codegen);
    }
}(this, function (exports$8, parser$9, expander$10, codegen$11) {
    exports$8.parse = function parse(code$12, options$13) {
        var program$14, toString$15;
        toString$15 = String;
        if (typeof code$12 !== 'string' && !(code$12 instanceof String)) {
            code$12 = toString$15(code$12);
        }
        var source$16 = code$12;
        if (source$16.length > 0) {
            if (typeof source$16[0] === 'undefined') {
                if (code$12 instanceof String) {
                    source$16 = code$12.valueOf();
                }
                if (typeof source$16[0] === 'undefined') {
                    source$16 = stringToArray(code$12);
                }
            }
        }
        var readTree$17 = parser$9.read(source$16);
        var expanded$18 = expander$10.expand(readTree$17);
        var ast$19 = parser$9.parse(expanded$18);
        return ast$19;
    };
    exports$8.expand = function expand(code$20, options$21) {
        var readTree$22 = parser$9.read(code$20);
        var expanded$23 = expander$10.expand(readTree$22);
        return expanded$23;
    };
    exports$8.compile = function compile(code$24, options$25) {
        return codegen$11.generate(exports$8.parse(code$24, options$25));
    };
}));