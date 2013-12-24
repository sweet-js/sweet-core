var fs$2283 = require('fs');
var path$2284 = require('path');
var sweet$2285 = require('./sweet.js');
var syn$2286 = require('./syntax.js');
var argv$2287 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2288 = argv$2287._[0];
    var outfile$2289 = argv$2287.output;
    var watch$2290 = argv$2287.watch;
    var tokens$2291 = argv$2287.tokens;
    var sourcemap$2292 = argv$2287.sourcemap;
    var noparse$2293 = argv$2287['no-parse'];
    var numexpands$2294 = argv$2287['num-expands'];
    var displayHygiene$2295 = argv$2287['step-hygiene'];
    var file$2296;
    var globalMacros$2297;
    if (infile$2288) {
        file$2296 = fs$2283.readFileSync(infile$2288, 'utf8');
    } else if (argv$2287.stdin) {
        file$2296 = fs$2283.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2287._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2298 = argv$2287.module;
    var cwd$2299 = process.cwd();
    var Module$2300 = module.constructor;
    var modulemock$2301;
    if (mod$2298) {
        modulemock$2301 = {
            id: cwd$2299 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2299) ? [cwd$2299] : Module$2300._nodeModulePaths(cwd$2299)
        };
        if (typeof mod$2298 === 'string') {
            mod$2298 = [mod$2298];
        }
        globalMacros$2297 = mod$2298.reduceRight(function (f$2302, m$2303) {
            var modulepath$2304 = Module$2300._resolveFilename(m$2303, modulemock$2301);
            var modulefile$2305 = fs$2283.readFileSync(modulepath$2304, 'utf8');
            return modulefile$2305 + '\n' + f$2302;
        }, '');
    }
    if (watch$2290 && outfile$2289) {
        fs$2283.watch(infile$2288, function () {
            file$2296 = fs$2283.readFileSync(infile$2288, 'utf8');
            try {
                fs$2283.writeFileSync(outfile$2289, sweet$2285.compile(file$2296, { macros: globalMacros$2297 }).code, 'utf8');
            } catch (e$2306) {
                console.log(e$2306);
            }
        });
    } else if (outfile$2289) {
        if (sourcemap$2292) {
            var result$2307 = sweet$2285.compile(file$2296, {
                    sourceMap: true,
                    filename: infile$2288,
                    macros: globalMacros$2297
                });
            var mapfile$2308 = path$2284.basename(outfile$2289) + '.map';
            fs$2283.writeFileSync(outfile$2289, result$2307.code + '\n//# sourceMappingURL=' + mapfile$2308, 'utf8');
            fs$2283.writeFileSync(outfile$2289 + '.map', result$2307.sourceMap, 'utf8');
        } else {
            fs$2283.writeFileSync(outfile$2289, sweet$2285.compile(file$2296).code, 'utf8');
        }
    } else if (tokens$2291) {
        console.log(sweet$2285.expand(file$2296, globalMacros$2297, numexpands$2294));
    } else if (noparse$2293) {
        var unparsedString$2309 = syn$2286.prettyPrint(sweet$2285.expand(file$2296, globalMacros$2297, numexpands$2294), displayHygiene$2295);
        console.log(unparsedString$2309);
    } else {
        console.log(sweet$2285.compile(file$2296, {
            macros: globalMacros$2297,
            numExpands: numexpands$2294
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map