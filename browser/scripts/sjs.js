var fs$2043 = require('fs');
var path$2044 = require('path');
var sweet$2045 = require('./sweet.js');
var argv$2046 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2047 = argv$2046._[0];
    var outfile$2048 = argv$2046.output;
    var watch$2049 = argv$2046.watch;
    var tokens$2050 = argv$2046.tokens;
    var sourcemap$2051 = argv$2046.sourcemap;
    var noparse$2052 = argv$2046['no-parse'];
    var file$2053;
    var globalMacros$2054;
    if (infile$2047) {
        file$2053 = fs$2043.readFileSync(infile$2047, 'utf8');
    } else if (argv$2046.stdin) {
        file$2053 = fs$2043.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2046._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2055 = argv$2046.module;
    var cwd$2056 = process.cwd();
    var Module$2057 = module.constructor;
    var modulemock$2058;
    if (mod$2055) {
        modulemock$2058 = {
            id: cwd$2056 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2056) ? [cwd$2056] : Module$2057._nodeModulePaths(cwd$2056)
        };
        if (typeof mod$2055 === 'string') {
            mod$2055 = [mod$2055];
        }
        globalMacros$2054 = mod$2055.reduceRight(function (f$2059, m$2060) {
            var modulepath$2061 = Module$2057._resolveFilename(m$2060, modulemock$2058);
            var modulefile$2062 = fs$2043.readFileSync(modulepath$2061, 'utf8');
            return modulefile$2062 + '\n' + f$2059;
        }, '');
    }
    if (watch$2049 && outfile$2048) {
        fs$2043.watch(infile$2047, function () {
            file$2053 = fs$2043.readFileSync(infile$2047, 'utf8');
            try {
                fs$2043.writeFileSync(outfile$2048, sweet$2045.compile(file$2053, { macros: globalMacros$2054 }).code, 'utf8');
            } catch (e$2063) {
                console.log(e$2063);
            }
        });
    } else if (outfile$2048) {
        if (sourcemap$2051) {
            var result$2064 = sweet$2045.compile(file$2053, {
                    sourceMap: true,
                    filename: infile$2047,
                    macros: globalMacros$2054
                });
            var mapfile$2065 = path$2044.basename(outfile$2048) + '.map';
            fs$2043.writeFileSync(outfile$2048, result$2064.code + '\n//# sourceMappingURL=' + mapfile$2065, 'utf8');
            fs$2043.writeFileSync(outfile$2048 + '.map', result$2064.sourceMap, 'utf8');
        } else {
            fs$2043.writeFileSync(outfile$2048, sweet$2045.compile(file$2053).code, 'utf8');
        }
    } else if (tokens$2050) {
        console.log(sweet$2045.expand(file$2053, globalMacros$2054));
    } else if (noparse$2052) {
        var unparsedString$2066 = sweet$2045.expand(file$2053, globalMacros$2054).reduce(function (acc$2067, stx$2068) {
                return acc$2067 + ' ' + stx$2068.token.value;
            }, '');
        console.log(unparsedString$2066);
    } else {
        console.log(sweet$2045.compile(file$2053, { macros: globalMacros$2054 }).code);
    }
};
//# sourceMappingURL=sjs.js.map