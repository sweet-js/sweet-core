(function (root$1986, factory$1987) {
    if (typeof exports === 'object') {
        var parser$1988 = require('./parser');
        var expander$1989 = require('./expander');
        var syn$1990 = require('./syntax');
        var codegen$1991 = require('escodegen');
        var path$1992 = require('path');
        var fs$1993 = require('fs');
        var lib$1994 = path$1992.join(path$1992.dirname(fs$1993.realpathSync(__filename)), '../macros');
        var stxcaseModule$1995 = fs$1993.readFileSync(lib$1994 + '/stxcase.js', 'utf8');
        factory$1987(exports, parser$1988, expander$1989, syn$1990, stxcaseModule$1995, codegen$1991);
        require.extensions['.sjs'] = function (module$1996, filename$1997) {
            var content$1998 = require('fs').readFileSync(filename$1997, 'utf8');
            module$1996._compile(codegen$1991.generate(exports.parse(content$1998)), filename$1997);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './syntax',
            'text!./stxcase.js'
        ], factory$1987);
    }
}(this, function (exports$1999, parser$2000, expander$2001, syn$2002, stxcaseModule$2003, gen$2004) {
    var codegen$2005 = gen$2004 || escodegen;
    function expand$2006(code$2009, globalMacros$2010) {
        var program$2011, toString$2012;
        globalMacros$2010 = globalMacros$2010 || '';
        toString$2012 = String;
        if (typeof code$2009 !== 'string' && !(code$2009 instanceof String)) {
            code$2009 = toString$2012(code$2009);
        }
        var source$2013 = code$2009;
        if (source$2013.length > 0) {
            if (typeof source$2013[0] === 'undefined') {
                if (code$2009 instanceof String) {
                    source$2013 = code$2009.valueOf();
                }
                if (typeof source$2013[0] === 'undefined') {
                    source$2013 = stringToArray(code$2009);
                }
            }
        }
        var readTree$2014 = parser$2000.read(source$2013);
        try {
            return expander$2001.expand(readTree$2014, stxcaseModule$2003 + '\n' + globalMacros$2010);
        } catch (err$2015) {
            if (err$2015 instanceof syn$2002.MacroSyntaxError) {
                throw new SyntaxError(syn$2002.printSyntaxError(source$2013, err$2015));
            } else {
                throw err$2015;
            }
        }
    }
    function parse$2007(code$2016, globalMacros$2017) {
        if (code$2016 === '') {
            code$2016 = ' ';
        }
        return parser$2000.parse(expand$2006(code$2016, globalMacros$2017));
    }
    exports$1999.expand = expand$2006;
    exports$1999.parse = parse$2007;
    exports$1999.compile = function compile$2008(code$2018, options$2019) {
        var output$2020;
        options$2019 = options$2019 || {};
        var ast$2021 = parse$2007(code$2018, options$2019.macros);
        if (options$2019.sourceMap) {
            output$2020 = codegen$2005.generate(ast$2021, {
                comment: true,
                sourceMap: options$2019.filename,
                sourceMapWithCode: true
            });
            return {
                code: output$2020.code,
                sourceMap: output$2020.map.toString()
            };
        }
        return { code: codegen$2005.generate(ast$2021, { comment: true }) };
    };
}));