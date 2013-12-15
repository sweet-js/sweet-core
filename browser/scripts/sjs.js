var fs$2415 = require('fs');
var path$2416 = require('path');
var sweet$2417 = require('./sweet.js');
var syn$2418 = require('./syntax.js');
var argv$2419 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2420 = argv$2419._[0];
    var outfile$2421 = argv$2419.output;
    var watch$2422 = argv$2419.watch;
    var tokens$2423 = argv$2419.tokens;
    var sourcemap$2424 = argv$2419.sourcemap;
    var noparse$2425 = argv$2419['no-parse'];
    var numexpands$2426 = argv$2419['num-expands'];
    var displayHygiene$2427 = argv$2419['step-hygiene'];
    var file$2428;
    var globalMacros$2429;
    if (infile$2420) {
        file$2428 = fs$2415.readFileSync(infile$2420, 'utf8');
    } else if (argv$2419.stdin) {
        file$2428 = fs$2415.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2419._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2430 = argv$2419.module;
    var cwd$2431 = process.cwd();
    var Module$2432 = module.constructor;
    var modulemock$2433;
    if (mod$2430) {
        modulemock$2433 = {
            id: cwd$2431 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2431) ? [cwd$2431] : Module$2432._nodeModulePaths(cwd$2431)
        };
        if (typeof mod$2430 === 'string') {
            mod$2430 = [mod$2430];
        }
        globalMacros$2429 = mod$2430.reduceRight(function (f$2434, m$2435) {
            var modulepath$2436 = Module$2432._resolveFilename(m$2435, modulemock$2433);
            var modulefile$2437 = fs$2415.readFileSync(modulepath$2436, 'utf8');
            return modulefile$2437 + '\n' + f$2434;
        }, '');
    }
    if (watch$2422 && outfile$2421) {
        fs$2415.watch(infile$2420, function () {
            file$2428 = fs$2415.readFileSync(infile$2420, 'utf8');
            try {
                fs$2415.writeFileSync(outfile$2421, sweet$2417.compile(file$2428, { macros: globalMacros$2429 }).code, 'utf8');
            } catch (e$2438) {
                console.log(e$2438);
            }
        });
    } else if (outfile$2421) {
        if (sourcemap$2424) {
            var result$2439 = sweet$2417.compile(file$2428, {
                    sourceMap: true,
                    filename: infile$2420,
                    macros: globalMacros$2429
                });
            var mapfile$2440 = path$2416.basename(outfile$2421) + '.map';
            fs$2415.writeFileSync(outfile$2421, result$2439.code + '\n//# sourceMappingURL=' + mapfile$2440, 'utf8');
            fs$2415.writeFileSync(outfile$2421 + '.map', result$2439.sourceMap, 'utf8');
        } else {
            fs$2415.writeFileSync(outfile$2421, sweet$2417.compile(file$2428).code, 'utf8');
        }
    } else if (tokens$2423) {
        console.log(sweet$2417.expand(file$2428, globalMacros$2429, numexpands$2426));
    } else if (noparse$2425) {
        var unparsedString$2441 = syn$2418.prettyPrint(sweet$2417.expand(file$2428, globalMacros$2429, numexpands$2426), displayHygiene$2427);
        console.log(unparsedString$2441);
    } else {
        console.log(sweet$2417.compile(file$2428, {
            macros: globalMacros$2429,
            numExpands: numexpands$2426
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map