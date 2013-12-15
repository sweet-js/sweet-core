var fs$2281 = require('fs');
var path$2282 = require('path');
var sweet$2283 = require('./sweet.js');
var syn$2284 = require('./syntax.js');
var argv$2285 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2286 = argv$2285._[0];
    var outfile$2287 = argv$2285.output;
    var watch$2288 = argv$2285.watch;
    var tokens$2289 = argv$2285.tokens;
    var sourcemap$2290 = argv$2285.sourcemap;
    var noparse$2291 = argv$2285['no-parse'];
    var numexpands$2292 = argv$2285['num-expands'];
    var displayHygiene$2293 = argv$2285['step-hygiene'];
    var file$2294;
    var globalMacros$2295;
    if (infile$2286) {
        file$2294 = fs$2281.readFileSync(infile$2286, 'utf8');
    } else if (argv$2285.stdin) {
        file$2294 = fs$2281.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2285._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2296 = argv$2285.module;
    var cwd$2297 = process.cwd();
    var Module$2298 = module.constructor;
    var modulemock$2299;
    if (mod$2296) {
        modulemock$2299 = {
            id: cwd$2297 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2297) ? [cwd$2297] : Module$2298._nodeModulePaths(cwd$2297)
        };
        if (typeof mod$2296 === 'string') {
            mod$2296 = [mod$2296];
        }
        globalMacros$2295 = mod$2296.reduceRight(function (f$2300, m$2301) {
            var modulepath$2302 = Module$2298._resolveFilename(m$2301, modulemock$2299);
            var modulefile$2303 = fs$2281.readFileSync(modulepath$2302, 'utf8');
            return modulefile$2303 + '\n' + f$2300;
        }, '');
    }
    if (watch$2288 && outfile$2287) {
        fs$2281.watch(infile$2286, function () {
            file$2294 = fs$2281.readFileSync(infile$2286, 'utf8');
            try {
                fs$2281.writeFileSync(outfile$2287, sweet$2283.compile(file$2294, { macros: globalMacros$2295 }).code, 'utf8');
            } catch (e$2304) {
                console.log(e$2304);
            }
        });
    } else if (outfile$2287) {
        if (sourcemap$2290) {
            var result$2305 = sweet$2283.compile(file$2294, {
                    sourceMap: true,
                    filename: infile$2286,
                    macros: globalMacros$2295
                });
            var mapfile$2306 = path$2282.basename(outfile$2287) + '.map';
            fs$2281.writeFileSync(outfile$2287, result$2305.code + '\n//# sourceMappingURL=' + mapfile$2306, 'utf8');
            fs$2281.writeFileSync(outfile$2287 + '.map', result$2305.sourceMap, 'utf8');
        } else {
            fs$2281.writeFileSync(outfile$2287, sweet$2283.compile(file$2294).code, 'utf8');
        }
    } else if (tokens$2289) {
        console.log(sweet$2283.expand(file$2294, globalMacros$2295, numexpands$2292));
    } else if (noparse$2291) {
        var unparsedString$2307 = syn$2284.prettyPrint(sweet$2283.expand(file$2294, globalMacros$2295, numexpands$2292), displayHygiene$2293);
        console.log(unparsedString$2307);
    } else {
        console.log(sweet$2283.compile(file$2294, {
            macros: globalMacros$2295,
            numExpands: numexpands$2292
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map