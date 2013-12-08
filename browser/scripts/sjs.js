var fs$2057 = require('fs');
var path$2058 = require('path');
var sweet$2059 = require('./sweet.js');
var argv$2060 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2061 = argv$2060._[0];
    var outfile$2062 = argv$2060.output;
    var watch$2063 = argv$2060.watch;
    var tokens$2064 = argv$2060.tokens;
    var sourcemap$2065 = argv$2060.sourcemap;
    var noparse$2066 = argv$2060['no-parse'];
    var file$2067;
    var globalMacros$2068;
    if (infile$2061) {
        file$2067 = fs$2057.readFileSync(infile$2061, 'utf8');
    } else if (argv$2060.stdin) {
        file$2067 = fs$2057.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2060._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2069 = argv$2060.module;
    var cwd$2070 = process.cwd();
    var Module$2071 = module.constructor;
    var modulemock$2072;
    if (mod$2069) {
        modulemock$2072 = {
            id: cwd$2070 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2070) ? [cwd$2070] : Module$2071._nodeModulePaths(cwd$2070)
        };
        if (typeof mod$2069 === 'string') {
            mod$2069 = [mod$2069];
        }
        globalMacros$2068 = mod$2069.reduceRight(function (f$2073, m$2074) {
            var modulepath$2075 = Module$2071._resolveFilename(m$2074, modulemock$2072);
            var modulefile$2076 = fs$2057.readFileSync(modulepath$2075, 'utf8');
            return modulefile$2076 + '\n' + f$2073;
        }, '');
    }
    if (watch$2063 && outfile$2062) {
        fs$2057.watch(infile$2061, function () {
            file$2067 = fs$2057.readFileSync(infile$2061, 'utf8');
            try {
                fs$2057.writeFileSync(outfile$2062, sweet$2059.compile(file$2067, { macros: globalMacros$2068 }).code, 'utf8');
            } catch (e$2077) {
                console.log(e$2077);
            }
        });
    } else if (outfile$2062) {
        if (sourcemap$2065) {
            var result$2078 = sweet$2059.compile(file$2067, {
                    sourceMap: true,
                    filename: infile$2061,
                    macros: globalMacros$2068
                });
            var mapfile$2079 = path$2058.basename(outfile$2062) + '.map';
            fs$2057.writeFileSync(outfile$2062, result$2078.code + '\n//# sourceMappingURL=' + mapfile$2079, 'utf8');
            fs$2057.writeFileSync(outfile$2062 + '.map', result$2078.sourceMap, 'utf8');
        } else {
            fs$2057.writeFileSync(outfile$2062, sweet$2059.compile(file$2067).code, 'utf8');
        }
    } else if (tokens$2064) {
        console.log(sweet$2059.expand(file$2067, globalMacros$2068));
    } else if (noparse$2066) {
        var unparsedString$2080 = sweet$2059.expand(file$2067, globalMacros$2068).reduce(function (acc$2081, stx$2082) {
                return acc$2081 + ' ' + stx$2082.token.value;
            }, '');
        console.log(unparsedString$2080);
    } else {
        console.log(sweet$2059.compile(file$2067, { macros: globalMacros$2068 }).code);
    }
};
//# sourceMappingURL=sjs.js.map