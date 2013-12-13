var fs$2273 = require('fs');
var path$2274 = require('path');
var sweet$2275 = require('./sweet.js');
var argv$2276 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2277 = argv$2276._[0];
    var outfile$2278 = argv$2276.output;
    var watch$2279 = argv$2276.watch;
    var tokens$2280 = argv$2276.tokens;
    var sourcemap$2281 = argv$2276.sourcemap;
    var noparse$2282 = argv$2276['no-parse'];
    var file$2283;
    var globalMacros$2284;
    if (infile$2277) {
        file$2283 = fs$2273.readFileSync(infile$2277, 'utf8');
    } else if (argv$2276.stdin) {
        file$2283 = fs$2273.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2276._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2285 = argv$2276.module;
    var cwd$2286 = process.cwd();
    var Module$2287 = module.constructor;
    var modulemock$2288;
    if (mod$2285) {
        modulemock$2288 = {
            id: cwd$2286 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2286) ? [cwd$2286] : Module$2287._nodeModulePaths(cwd$2286)
        };
        if (typeof mod$2285 === 'string') {
            mod$2285 = [mod$2285];
        }
        globalMacros$2284 = mod$2285.reduceRight(function (f$2289, m$2290) {
            var modulepath$2291 = Module$2287._resolveFilename(m$2290, modulemock$2288);
            var modulefile$2292 = fs$2273.readFileSync(modulepath$2291, 'utf8');
            return modulefile$2292 + '\n' + f$2289;
        }, '');
    }
    if (watch$2279 && outfile$2278) {
        fs$2273.watch(infile$2277, function () {
            file$2283 = fs$2273.readFileSync(infile$2277, 'utf8');
            try {
                fs$2273.writeFileSync(outfile$2278, sweet$2275.compile(file$2283, { macros: globalMacros$2284 }).code, 'utf8');
            } catch (e$2293) {
                console.log(e$2293);
            }
        });
    } else if (outfile$2278) {
        if (sourcemap$2281) {
            var result$2294 = sweet$2275.compile(file$2283, {
                    sourceMap: true,
                    filename: infile$2277,
                    macros: globalMacros$2284
                });
            var mapfile$2295 = path$2274.basename(outfile$2278) + '.map';
            fs$2273.writeFileSync(outfile$2278, result$2294.code + '\n//# sourceMappingURL=' + mapfile$2295, 'utf8');
            fs$2273.writeFileSync(outfile$2278 + '.map', result$2294.sourceMap, 'utf8');
        } else {
            fs$2273.writeFileSync(outfile$2278, sweet$2275.compile(file$2283).code, 'utf8');
        }
    } else if (tokens$2280) {
        console.log(sweet$2275.expand(file$2283, globalMacros$2284));
    } else if (noparse$2282) {
        var unparsedString$2296 = sweet$2275.expand(file$2283, globalMacros$2284).reduce(function (acc$2297, stx$2298) {
                return acc$2297 + ' ' + stx$2298.token.value;
            }, '');
        console.log(unparsedString$2296);
    } else {
        console.log(sweet$2275.compile(file$2283, { macros: globalMacros$2284 }).code);
    }
};
//# sourceMappingURL=sjs.js.map