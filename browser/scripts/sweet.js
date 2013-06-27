(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        var parser$8 = require('./parser');
        var expander$9 = require('./expander');
        var codegen$10 = require('escodegen');
        factory$2(exports, parser$8, expander$9, codegen$10);
        require.extensions['.sjs'] = function (module$4, filename$5) {
            var content$7 = require('fs').readFileSync(filename$5, 'utf8');
            module$4._compile(codegen$10.generate(exports.parse(content$7)), filename$5);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen'
        ], factory$2);
    } else {
        factory$2(root$1.sweet = {}, root$1.parser, root$1.expander, root$1.codegen);
    }
}(this, function (exports$11, parser$12, expander$13, codegen$14) {
    exports$11.parse = function parse(code$16, options$17) {
        var program$19, toString$20;
        toString$20 = String;
        if (typeof code$16 !== 'string' && !(code$16 instanceof String)) {
            code$16 = toString$20(code$16);
        }
        var source$21 = code$16;
        if (source$21.length > 0) {
            if (typeof source$21[0] === 'undefined') {
                if (code$16 instanceof String) {
                    source$21 = code$16.valueOf();
                }
                if (typeof source$21[0] === 'undefined') {
                    source$21 = stringToArray(code$16);
                }
            }
        }
        var readTree$22 = parser$12.read(source$21);
        var expanded$23 = expander$13.expand(readTree$22);
        var ast$24 = parser$12.parse(expanded$23);
        return ast$24;
    };
    exports$11.expand = function expand(code$25, options$26) {
        var readTree$28 = parser$12.read(code$25);
        var expanded$29 = expander$13.expand(readTree$28);
        return expanded$29;
    };
    exports$11.compile = function compile(code$30, options$31) {
        return codegen$14.generate(exports$11.parse(code$30, options$31));
    };
}));