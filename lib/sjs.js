var fs$2054 = require('fs');
var path$2055 = require('path');
var sweet$2056 = require('./sweet.js');
var argv$2057 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2058 = argv$2057._[0];
    var outfile$2059 = argv$2057.output;
    var watch$2060 = argv$2057.watch;
    var tokens$2061 = argv$2057.tokens;
    var sourcemap$2062 = argv$2057.sourcemap;
    var noparse$2063 = argv$2057['no-parse'];
    var file$2064;
    var globalMacros$2065;
    if (infile$2058) {
        file$2064 = fs$2054.readFileSync(infile$2058, 'utf8');
    } else if (argv$2057.stdin) {
        file$2064 = fs$2054.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2057._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2066 = argv$2057.module;
    var cwd$2067 = process.cwd();
    var Module$2068 = module.constructor;
    var modulemock$2069;
    if (mod$2066) {
        modulemock$2069 = {
            id: cwd$2067 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2067) ? [cwd$2067] : Module$2068._nodeModulePaths(cwd$2067)
        };
        if (typeof mod$2066 === 'string') {
            mod$2066 = [mod$2066];
        }
        globalMacros$2065 = mod$2066.reduceRight(function (f$2070, m$2071) {
            var modulepath$2072 = Module$2068._resolveFilename(m$2071, modulemock$2069);
            var modulefile$2073 = fs$2054.readFileSync(modulepath$2072, 'utf8');
            return modulefile$2073 + '\n' + f$2070;
        }, '');
    }
    if (watch$2060 && outfile$2059) {
        fs$2054.watch(infile$2058, function () {
            file$2064 = fs$2054.readFileSync(infile$2058, 'utf8');
            try {
                fs$2054.writeFileSync(outfile$2059, sweet$2056.compile(file$2064, { macros: globalMacros$2065 }).code, 'utf8');
            } catch (e$2074) {
                console.log(e$2074);
            }
        });
    } else if (outfile$2059) {
        if (sourcemap$2062) {
            var result$2075 = sweet$2056.compile(file$2064, {
                    sourceMap: true,
                    filename: infile$2058,
                    macros: globalMacros$2065
                });
            var mapfile$2076 = path$2055.basename(outfile$2059) + '.map';
            fs$2054.writeFileSync(outfile$2059, result$2075.code + '\n//# sourceMappingURL=' + mapfile$2076, 'utf8');
            fs$2054.writeFileSync(outfile$2059 + '.map', result$2075.sourceMap, 'utf8');
        } else {
            fs$2054.writeFileSync(outfile$2059, sweet$2056.compile(file$2064).code, 'utf8');
        }
    } else if (tokens$2061) {
        console.log(sweet$2056.expand(file$2064, globalMacros$2065));
    } else if (noparse$2063) {
        var unparsedString$2077 = sweet$2056.expand(file$2064, globalMacros$2065).reduce(function (acc$2078, stx$2079) {
                return acc$2078 + ' ' + stx$2079.token.value;
            }, '');
        console.log(unparsedString$2077);
    } else {
        console.log(sweet$2056.compile(file$2064, { macros: globalMacros$2065 }).code);
    }
};
//# sourceMappingURL=sjs.js.map