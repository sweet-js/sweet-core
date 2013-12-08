var fs$2075 = require('fs');
var path$2076 = require('path');
var sweet$2077 = require('./sweet.js');
var argv$2078 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2079 = argv$2078._[0];
    var outfile$2080 = argv$2078.output;
    var watch$2081 = argv$2078.watch;
    var tokens$2082 = argv$2078.tokens;
    var sourcemap$2083 = argv$2078.sourcemap;
    var noparse$2084 = argv$2078['no-parse'];
    var file$2085;
    var globalMacros$2086;
    if (infile$2079) {
        file$2085 = fs$2075.readFileSync(infile$2079, 'utf8');
    } else if (argv$2078.stdin) {
        file$2085 = fs$2075.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2078._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2087 = argv$2078.module;
    var cwd$2088 = process.cwd();
    var Module$2089 = module.constructor;
    var modulemock$2090;
    if (mod$2087) {
        modulemock$2090 = {
            id: cwd$2088 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2088) ? [cwd$2088] : Module$2089._nodeModulePaths(cwd$2088)
        };
        if (typeof mod$2087 === 'string') {
            mod$2087 = [mod$2087];
        }
        globalMacros$2086 = mod$2087.reduceRight(function (f$2091, m$2092) {
            var modulepath$2093 = Module$2089._resolveFilename(m$2092, modulemock$2090);
            var modulefile$2094 = fs$2075.readFileSync(modulepath$2093, 'utf8');
            return modulefile$2094 + '\n' + f$2091;
        }, '');
    }
    if (watch$2081 && outfile$2080) {
        fs$2075.watch(infile$2079, function () {
            file$2085 = fs$2075.readFileSync(infile$2079, 'utf8');
            try {
                fs$2075.writeFileSync(outfile$2080, sweet$2077.compile(file$2085, { macros: globalMacros$2086 }).code, 'utf8');
            } catch (e$2095) {
                console.log(e$2095);
            }
        });
    } else if (outfile$2080) {
        if (sourcemap$2083) {
            var result$2096 = sweet$2077.compile(file$2085, {
                    sourceMap: true,
                    filename: infile$2079,
                    macros: globalMacros$2086
                });
            var mapfile$2097 = path$2076.basename(outfile$2080) + '.map';
            fs$2075.writeFileSync(outfile$2080, result$2096.code + '\n//# sourceMappingURL=' + mapfile$2097, 'utf8');
            fs$2075.writeFileSync(outfile$2080 + '.map', result$2096.sourceMap, 'utf8');
        } else {
            fs$2075.writeFileSync(outfile$2080, sweet$2077.compile(file$2085).code, 'utf8');
        }
    } else if (tokens$2082) {
        console.log(sweet$2077.expand(file$2085, globalMacros$2086));
    } else if (noparse$2084) {
        var unparsedString$2098 = sweet$2077.expand(file$2085, globalMacros$2086).reduce(function (acc$2099, stx$2100) {
                return acc$2099 + ' ' + stx$2100.token.value;
            }, '');
        console.log(unparsedString$2098);
    } else {
        console.log(sweet$2077.compile(file$2085, { macros: globalMacros$2086 }).code);
    }
};
//# sourceMappingURL=sjs.js.map