var fs$2287 = require('fs');
var path$2288 = require('path');
var sweet$2289 = require('./sweet.js');
var syn$2290 = require('./syntax.js');
var argv$2291 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2292 = argv$2291._[0];
    var outfile$2293 = argv$2291.output;
    var watch$2294 = argv$2291.watch;
    var tokens$2295 = argv$2291.tokens;
    var sourcemap$2296 = argv$2291.sourcemap;
    var noparse$2297 = argv$2291['no-parse'];
    var numexpands$2298 = argv$2291['num-expands'];
    var displayHygiene$2299 = argv$2291['step-hygiene'];
    var file$2300;
    var globalMacros$2301;
    if (infile$2292) {
        file$2300 = fs$2287.readFileSync(infile$2292, 'utf8');
    } else if (argv$2291.stdin) {
        file$2300 = fs$2287.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2291._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2302 = argv$2291.module;
    var cwd$2303 = process.cwd();
    var Module$2304 = module.constructor;
    var modulemock$2305;
    if (mod$2302) {
        modulemock$2305 = {
            id: cwd$2303 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2303) ? [cwd$2303] : Module$2304._nodeModulePaths(cwd$2303)
        };
        if (typeof mod$2302 === 'string') {
            mod$2302 = [mod$2302];
        }
        globalMacros$2301 = mod$2302.reduceRight(function (f$2306, m$2307) {
            var modulepath$2308 = Module$2304._resolveFilename(m$2307, modulemock$2305);
            var modulefile$2309 = fs$2287.readFileSync(modulepath$2308, 'utf8');
            return modulefile$2309 + '\n' + f$2306;
        }, '');
    }
    if (watch$2294 && outfile$2293) {
        fs$2287.watch(infile$2292, function () {
            file$2300 = fs$2287.readFileSync(infile$2292, 'utf8');
            try {
                fs$2287.writeFileSync(outfile$2293, sweet$2289.compile(file$2300, { macros: globalMacros$2301 }).code, 'utf8');
            } catch (e$2310) {
                console.log(e$2310);
            }
        });
    } else if (outfile$2293) {
        if (sourcemap$2296) {
            var result$2311 = sweet$2289.compile(file$2300, {
                    sourceMap: true,
                    filename: infile$2292,
                    macros: globalMacros$2301
                });
            var mapfile$2312 = path$2288.basename(outfile$2293) + '.map';
            fs$2287.writeFileSync(outfile$2293, result$2311.code + '\n//# sourceMappingURL=' + mapfile$2312, 'utf8');
            fs$2287.writeFileSync(outfile$2293 + '.map', result$2311.sourceMap, 'utf8');
        } else {
            fs$2287.writeFileSync(outfile$2293, sweet$2289.compile(file$2300).code, 'utf8');
        }
    } else if (tokens$2295) {
        console.log(sweet$2289.expand(file$2300, globalMacros$2301, numexpands$2298));
    } else if (noparse$2297) {
        var unparsedString$2313 = syn$2290.prettyPrint(sweet$2289.expand(file$2300, globalMacros$2301, numexpands$2298), displayHygiene$2299);
        console.log(unparsedString$2313);
    } else {
        console.log(sweet$2289.compile(file$2300, {
            macros: globalMacros$2301,
            numExpands: numexpands$2298
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map