(function (root$1985, factory$1986) {
    if (typeof exports === 'object') {
        var parser$1987 = require('./parser');
        var expander$1988 = require('./expander');
        var syn$1989 = require('./syntax');
        var codegen$1990 = require('escodegen');
        var path$1991 = require('path');
        var fs$1992 = require('fs');
        var lib$1993 = path$1991.join(path$1991.dirname(fs$1992.realpathSync(__filename)), '../macros');
        var stxcaseModule$1994 = fs$1992.readFileSync(lib$1993 + '/stxcase.js', 'utf8');
        factory$1986(exports, parser$1987, expander$1988, syn$1989, stxcaseModule$1994, codegen$1990);
        require.extensions['.sjs'] = function (module$1995, filename$1996) {
            var content$1997 = require('fs').readFileSync(filename$1996, 'utf8');
            module$1995._compile(codegen$1990.generate(exports.parse(content$1997)), filename$1996);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1986);
    }
}(this, function (exports$1998, parser$1999, expander$2000, syn$2001, stxcaseModule$2002, gen$2003) {
    var codegen$2004 = gen$2003 || escodegen;
    function expand$2005(code$2008, globalMacros$2009) {
        var program$2010, toString$2011;
        globalMacros$2009 = globalMacros$2009 || '';
        toString$2011 = String;
        if (typeof code$2008 !== 'string' && !(code$2008 instanceof String)) {
            code$2008 = toString$2011(code$2008);
        }
        var source$2012 = code$2008;
        if (source$2012.length > 0) {
            if (typeof source$2012[0] === 'undefined') {
                if (code$2008 instanceof String) {
                    source$2012 = code$2008.valueOf();
                }
                if (typeof source$2012[0] === 'undefined') {
                    source$2012 = stringToArray(code$2008);
                }
            }
        }
        var readTree$2013 = parser$1999.read(source$2012);
        try {
            return expander$2000.expand(readTree$2013, stxcaseModule$2002 + '\n' + globalMacros$2009);
        } catch (err$2014) {
            if (err$2014 instanceof syn$2001.MacroSyntaxError) {
                throw new SyntaxError(syn$2001.printSyntaxError(source$2012, err$2014));
            } else {
                throw err$2014;
            }
        }
    }
    function parse$2006(code$2015, globalMacros$2016) {
        if (code$2015 === '') {
            code$2015 = ' ';
        }
        return parser$1999.parse(expand$2005(code$2015, globalMacros$2016));
    }
    exports$1998.expand = expand$2005;
    exports$1998.parse = parse$2006;
    exports$1998.compile = function compile$2007(code$2017, options$2018) {
        var output$2019;
        options$2018 = options$2018 || {};
        var ast$2020 = parse$2006(code$2017, options$2018.macros);
        if (options$2018.sourceMap) {
            output$2019 = codegen$2004.generate(ast$2020, {
                comment: true,
                sourceMap: options$2018.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2019.code,
                sourceMap: output$2019.map.toString()
            };
        }
        return { code: codegen$2004.generate(ast$2020, { comment: true }) };
    };
}));