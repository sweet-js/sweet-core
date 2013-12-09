var fs$2064 = require('fs');
var path$2065 = require('path');
var sweet$2066 = require('./sweet.js');
var argv$2067 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2068 = argv$2067._[0];
    var outfile$2069 = argv$2067.output;
    var watch$2070 = argv$2067.watch;
    var tokens$2071 = argv$2067.tokens;
    var sourcemap$2072 = argv$2067.sourcemap;
    var noparse$2073 = argv$2067['no-parse'];
    var file$2074;
    var globalMacros$2075;
    if (infile$2068) {
        file$2074 = fs$2064.readFileSync(infile$2068, 'utf8');
    } else if (argv$2067.stdin) {
        file$2074 = fs$2064.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2067._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2076 = argv$2067.module;
    var cwd$2077 = process.cwd();
    var Module$2078 = module.constructor;
    var modulemock$2079;
    if (mod$2076) {
        modulemock$2079 = {
            id: cwd$2077 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2077) ? [cwd$2077] : Module$2078._nodeModulePaths(cwd$2077)
        };
        if (typeof mod$2076 === 'string') {
            mod$2076 = [mod$2076];
        }
        globalMacros$2075 = mod$2076.reduceRight(function (f$2080, m$2081) {
            var modulepath$2082 = Module$2078._resolveFilename(m$2081, modulemock$2079);
            var modulefile$2083 = fs$2064.readFileSync(modulepath$2082, 'utf8');
            return modulefile$2083 + '\n' + f$2080;
        }, '');
    }
    if (watch$2070 && outfile$2069) {
        fs$2064.watch(infile$2068, function () {
            file$2074 = fs$2064.readFileSync(infile$2068, 'utf8');
            try {
                fs$2064.writeFileSync(outfile$2069, sweet$2066.compile(file$2074, { macros: globalMacros$2075 }).code, 'utf8');
            } catch (e$2084) {
                console.log(e$2084);
            }
        });
    } else if (outfile$2069) {
        if (sourcemap$2072) {
            var result$2085 = sweet$2066.compile(file$2074, {
                    sourceMap: true,
                    filename: infile$2068,
                    macros: globalMacros$2075
                });
            var mapfile$2086 = path$2065.basename(outfile$2069) + '.map';
            fs$2064.writeFileSync(outfile$2069, result$2085.code + '\n//# sourceMappingURL=' + mapfile$2086, 'utf8');
            fs$2064.writeFileSync(outfile$2069 + '.map', result$2085.sourceMap, 'utf8');
        } else {
            fs$2064.writeFileSync(outfile$2069, sweet$2066.compile(file$2074).code, 'utf8');
        }
    } else if (tokens$2071) {
        console.log(sweet$2066.expand(file$2074, globalMacros$2075));
    } else if (noparse$2073) {
        var unparsedString$2087 = sweet$2066.expand(file$2074, globalMacros$2075).reduce(function (acc$2088, stx$2089) {
                return acc$2088 + ' ' + stx$2089.token.value;
            }, '');
        console.log(unparsedString$2087);
    } else {
        console.log(sweet$2066.compile(file$2074, { macros: globalMacros$2075 }).code);
    }
};
//# sourceMappingURL=sjs.js.map