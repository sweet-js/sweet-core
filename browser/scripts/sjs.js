var fs$2069 = require('fs');
var path$2070 = require('path');
var sweet$2071 = require('./sweet.js');
var argv$2072 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2073 = argv$2072._[0];
    var outfile$2074 = argv$2072.output;
    var watch$2075 = argv$2072.watch;
    var tokens$2076 = argv$2072.tokens;
    var sourcemap$2077 = argv$2072.sourcemap;
    var noparse$2078 = argv$2072['no-parse'];
    var file$2079;
    var globalMacros$2080;
    if (infile$2073) {
        file$2079 = fs$2069.readFileSync(infile$2073, 'utf8');
    } else if (argv$2072.stdin) {
        file$2079 = fs$2069.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2072._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2081 = argv$2072.module;
    var cwd$2082 = process.cwd();
    var Module$2083 = module.constructor;
    var modulemock$2084;
    if (mod$2081) {
        modulemock$2084 = {
            id: cwd$2082 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2082) ? [cwd$2082] : Module$2083._nodeModulePaths(cwd$2082)
        };
        if (typeof mod$2081 === 'string') {
            mod$2081 = [mod$2081];
        }
        globalMacros$2080 = mod$2081.reduceRight(function (f$2085, m$2086) {
            var modulepath$2087 = Module$2083._resolveFilename(m$2086, modulemock$2084);
            var modulefile$2088 = fs$2069.readFileSync(modulepath$2087, 'utf8');
            return modulefile$2088 + '\n' + f$2085;
        }, '');
    }
    if (watch$2075 && outfile$2074) {
        fs$2069.watch(infile$2073, function () {
            file$2079 = fs$2069.readFileSync(infile$2073, 'utf8');
            try {
                fs$2069.writeFileSync(outfile$2074, sweet$2071.compile(file$2079, { macros: globalMacros$2080 }).code, 'utf8');
            } catch (e$2089) {
                console.log(e$2089);
            }
        });
    } else if (outfile$2074) {
        if (sourcemap$2077) {
            var result$2090 = sweet$2071.compile(file$2079, {
                    sourceMap: true,
                    filename: infile$2073,
                    macros: globalMacros$2080
                });
            var mapfile$2091 = path$2070.basename(outfile$2074) + '.map';
            fs$2069.writeFileSync(outfile$2074, result$2090.code + '\n//# sourceMappingURL=' + mapfile$2091, 'utf8');
            fs$2069.writeFileSync(outfile$2074 + '.map', result$2090.sourceMap, 'utf8');
        } else {
            fs$2069.writeFileSync(outfile$2074, sweet$2071.compile(file$2079).code, 'utf8');
        }
    } else if (tokens$2076) {
        console.log(sweet$2071.expand(file$2079, globalMacros$2080));
    } else if (noparse$2078) {
        var unparsedString$2092 = sweet$2071.expand(file$2079, globalMacros$2080).reduce(function (acc$2093, stx$2094) {
                return acc$2093 + ' ' + stx$2094.token.value;
            }, '');
        console.log(unparsedString$2092);
    } else {
        console.log(sweet$2071.compile(file$2079, { macros: globalMacros$2080 }).code);
    }
};
//# sourceMappingURL=sjs.js.map