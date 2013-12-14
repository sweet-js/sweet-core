var fs$2277 = require('fs');
var path$2278 = require('path');
var sweet$2279 = require('./sweet.js');
var syn$2280 = require('./syntax.js');
var argv$2281 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2282 = argv$2281._[0];
    var outfile$2283 = argv$2281.output;
    var watch$2284 = argv$2281.watch;
    var tokens$2285 = argv$2281.tokens;
    var sourcemap$2286 = argv$2281.sourcemap;
    var noparse$2287 = argv$2281['no-parse'];
    var numexpands$2288 = argv$2281['num-expands'];
    var displayHygiene$2289 = argv$2281['step-hygiene'];
    var file$2290;
    var globalMacros$2291;
    if (infile$2282) {
        file$2290 = fs$2277.readFileSync(infile$2282, 'utf8');
    } else if (argv$2281.stdin) {
        file$2290 = fs$2277.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2281._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2292 = argv$2281.module;
    var cwd$2293 = process.cwd();
    var Module$2294 = module.constructor;
    var modulemock$2295;
    if (mod$2292) {
        modulemock$2295 = {
            id: cwd$2293 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2293) ? [cwd$2293] : Module$2294._nodeModulePaths(cwd$2293)
        };
        if (typeof mod$2292 === 'string') {
            mod$2292 = [mod$2292];
        }
        globalMacros$2291 = mod$2292.reduceRight(function (f$2296, m$2297) {
            var modulepath$2298 = Module$2294._resolveFilename(m$2297, modulemock$2295);
            var modulefile$2299 = fs$2277.readFileSync(modulepath$2298, 'utf8');
            return modulefile$2299 + '\n' + f$2296;
        }, '');
    }
    if (watch$2284 && outfile$2283) {
        fs$2277.watch(infile$2282, function () {
            file$2290 = fs$2277.readFileSync(infile$2282, 'utf8');
            try {
                fs$2277.writeFileSync(outfile$2283, sweet$2279.compile(file$2290, { macros: globalMacros$2291 }).code, 'utf8');
            } catch (e$2300) {
                console.log(e$2300);
            }
        });
    } else if (outfile$2283) {
        if (sourcemap$2286) {
            var result$2301 = sweet$2279.compile(file$2290, {
                    sourceMap: true,
                    filename: infile$2282,
                    macros: globalMacros$2291
                });
            var mapfile$2302 = path$2278.basename(outfile$2283) + '.map';
            fs$2277.writeFileSync(outfile$2283, result$2301.code + '\n//# sourceMappingURL=' + mapfile$2302, 'utf8');
            fs$2277.writeFileSync(outfile$2283 + '.map', result$2301.sourceMap, 'utf8');
        } else {
            fs$2277.writeFileSync(outfile$2283, sweet$2279.compile(file$2290).code, 'utf8');
        }
    } else if (tokens$2285) {
        console.log(sweet$2279.expand(file$2290, globalMacros$2291, numexpands$2288));
    } else if (noparse$2287) {
        var unparsedString$2303 = syn$2280.prettyPrint(sweet$2279.expand(file$2290, globalMacros$2291, numexpands$2288), displayHygiene$2289);
        console.log(unparsedString$2303);
    } else {
        console.log(sweet$2279.compile(file$2290, {
            macros: globalMacros$2291,
            numExpands: numexpands$2288
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map