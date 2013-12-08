var fs$2059 = require('fs');
var path$2060 = require('path');
var sweet$2061 = require('./sweet.js');
var argv$2062 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2063 = argv$2062._[0];
    var outfile$2064 = argv$2062.output;
    var watch$2065 = argv$2062.watch;
    var tokens$2066 = argv$2062.tokens;
    var sourcemap$2067 = argv$2062.sourcemap;
    var noparse$2068 = argv$2062['no-parse'];
    var file$2069;
    var globalMacros$2070;
    if (infile$2063) {
        file$2069 = fs$2059.readFileSync(infile$2063, 'utf8');
    } else if (argv$2062.stdin) {
        file$2069 = fs$2059.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2062._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2071 = argv$2062.module;
    var cwd$2072 = process.cwd();
    var Module$2073 = module.constructor;
    var modulemock$2074;
    if (mod$2071) {
        modulemock$2074 = {
            id: cwd$2072 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2072) ? [cwd$2072] : Module$2073._nodeModulePaths(cwd$2072)
        };
        if (typeof mod$2071 === 'string') {
            mod$2071 = [mod$2071];
        }
        globalMacros$2070 = mod$2071.reduceRight(function (f$2075, m$2076) {
            var modulepath$2077 = Module$2073._resolveFilename(m$2076, modulemock$2074);
            var modulefile$2078 = fs$2059.readFileSync(modulepath$2077, 'utf8');
            return modulefile$2078 + '\n' + f$2075;
        }, '');
    }
    if (watch$2065 && outfile$2064) {
        fs$2059.watch(infile$2063, function () {
            file$2069 = fs$2059.readFileSync(infile$2063, 'utf8');
            try {
                fs$2059.writeFileSync(outfile$2064, sweet$2061.compile(file$2069, { macros: globalMacros$2070 }).code, 'utf8');
            } catch (e$2079) {
                console.log(e$2079);
            }
        });
    } else if (outfile$2064) {
        if (sourcemap$2067) {
            var result$2080 = sweet$2061.compile(file$2069, {
                    sourceMap: true,
                    filename: infile$2063,
                    macros: globalMacros$2070
                });
            var mapfile$2081 = path$2060.basename(outfile$2064) + '.map';
            fs$2059.writeFileSync(outfile$2064, result$2080.code + '\n//# sourceMappingURL=' + mapfile$2081, 'utf8');
            fs$2059.writeFileSync(outfile$2064 + '.map', result$2080.sourceMap, 'utf8');
        } else {
            fs$2059.writeFileSync(outfile$2064, sweet$2061.compile(file$2069).code, 'utf8');
        }
    } else if (tokens$2066) {
        console.log(sweet$2061.expand(file$2069, globalMacros$2070));
    } else if (noparse$2068) {
        var unparsedString$2082 = sweet$2061.expand(file$2069, globalMacros$2070).reduce(function (acc$2083, stx$2084) {
                return acc$2083 + ' ' + stx$2084.token.value;
            }, '');
        console.log(unparsedString$2082);
    } else {
        console.log(sweet$2061.compile(file$2069, { macros: globalMacros$2070 }).code);
    }
};
//# sourceMappingURL=sjs.js.map