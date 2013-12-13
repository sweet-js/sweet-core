var fs$2277 = require('fs');
var path$2278 = require('path');
var sweet$2279 = require('./sweet.js');
var argv$2280 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').argv;
exports.run = function () {
    var infile$2281 = argv$2280._[0];
    var outfile$2282 = argv$2280.output;
    var watch$2283 = argv$2280.watch;
    var tokens$2284 = argv$2280.tokens;
    var sourcemap$2285 = argv$2280.sourcemap;
    var noparse$2286 = argv$2280['no-parse'];
    var numexpands$2287 = argv$2280['num-expands'];
    var file$2288;
    var globalMacros$2289;
    if (infile$2281) {
        file$2288 = fs$2277.readFileSync(infile$2281, 'utf8');
    } else if (argv$2280.stdin) {
        file$2288 = fs$2277.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2280._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2290 = argv$2280.module;
    var cwd$2291 = process.cwd();
    var Module$2292 = module.constructor;
    var modulemock$2293;
    if (mod$2290) {
        modulemock$2293 = {
            id: cwd$2291 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2291) ? [cwd$2291] : Module$2292._nodeModulePaths(cwd$2291)
        };
        if (typeof mod$2290 === 'string') {
            mod$2290 = [mod$2290];
        }
        globalMacros$2289 = mod$2290.reduceRight(function (f$2294, m$2295) {
            var modulepath$2296 = Module$2292._resolveFilename(m$2295, modulemock$2293);
            var modulefile$2297 = fs$2277.readFileSync(modulepath$2296, 'utf8');
            return modulefile$2297 + '\n' + f$2294;
        }, '');
    }
    if (watch$2283 && outfile$2282) {
        fs$2277.watch(infile$2281, function () {
            file$2288 = fs$2277.readFileSync(infile$2281, 'utf8');
            try {
                fs$2277.writeFileSync(outfile$2282, sweet$2279.compile(file$2288, { macros: globalMacros$2289 }).code, 'utf8');
            } catch (e$2298) {
                console.log(e$2298);
            }
        });
    } else if (outfile$2282) {
        if (sourcemap$2285) {
            var result$2299 = sweet$2279.compile(file$2288, {
                    sourceMap: true,
                    filename: infile$2281,
                    macros: globalMacros$2289
                });
            var mapfile$2300 = path$2278.basename(outfile$2282) + '.map';
            fs$2277.writeFileSync(outfile$2282, result$2299.code + '\n//# sourceMappingURL=' + mapfile$2300, 'utf8');
            fs$2277.writeFileSync(outfile$2282 + '.map', result$2299.sourceMap, 'utf8');
        } else {
            fs$2277.writeFileSync(outfile$2282, sweet$2279.compile(file$2288).code, 'utf8');
        }
    } else if (tokens$2284) {
        console.log(sweet$2279.expand(file$2288, globalMacros$2289, numexpands$2287));
    } else if (noparse$2286) {
        var unparsedString$2301 = sweet$2279.prettyPrint(sweet$2279.expand(file$2288, globalMacros$2289, numexpands$2287));
        console.log(unparsedString$2301);
    } else {
        console.log(sweet$2279.compile(file$2288, {
            macros: globalMacros$2289,
            numExpands: numexpands$2287
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map