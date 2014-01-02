var fs$2526 = require('fs');
var path$2527 = require('path');
var sweet$2528 = require('./sweet.js');
var syn$2529 = require('./syntax.js');
var argv$2530 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2531 = argv$2530._[0];
    var outfile$2532 = argv$2530.output;
    var watch$2533 = argv$2530.watch;
    var tokens$2534 = argv$2530.tokens;
    var sourcemap$2535 = argv$2530.sourcemap;
    var noparse$2536 = argv$2530['no-parse'];
    var numexpands$2537 = argv$2530['num-expands'];
    var displayHygiene$2538 = argv$2530['step-hygiene'];
    var file$2539;
    var globalMacros$2540;
    if (infile$2531) {
        file$2539 = fs$2526.readFileSync(infile$2531, 'utf8');
    } else if (argv$2530.stdin) {
        file$2539 = fs$2526.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2530._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2541 = argv$2530.module;
    var cwd$2542 = process.cwd();
    var Module$2543 = module.constructor;
    var modulemock$2544;
    if (mod$2541) {
        modulemock$2544 = {
            id: cwd$2542 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2542) ? [cwd$2542] : Module$2543._nodeModulePaths(cwd$2542)
        };
        if (typeof mod$2541 === 'string') {
            mod$2541 = [mod$2541];
        }
        globalMacros$2540 = mod$2541.reduceRight(function (f$2545, m$2546) {
            var modulepath$2547 = Module$2543._resolveFilename(m$2546, modulemock$2544);
            var modulefile$2548 = fs$2526.readFileSync(modulepath$2547, 'utf8');
            return modulefile$2548 + '\n' + f$2545;
        }, '');
    }
    if (watch$2533 && outfile$2532) {
        fs$2526.watch(infile$2531, function () {
            file$2539 = fs$2526.readFileSync(infile$2531, 'utf8');
            try {
                fs$2526.writeFileSync(outfile$2532, sweet$2528.compile(file$2539, { macros: globalMacros$2540 }).code, 'utf8');
            } catch (e$2549) {
                console.log(e$2549);
            }
        });
    } else if (outfile$2532) {
        if (sourcemap$2535) {
            var result$2550 = sweet$2528.compile(file$2539, {
                    sourceMap: true,
                    filename: infile$2531,
                    macros: globalMacros$2540
                });
            var mapfile$2551 = path$2527.basename(outfile$2532) + '.map';
            fs$2526.writeFileSync(outfile$2532, result$2550.code + '\n//# sourceMappingURL=' + mapfile$2551, 'utf8');
            fs$2526.writeFileSync(outfile$2532 + '.map', result$2550.sourceMap, 'utf8');
        } else {
            fs$2526.writeFileSync(outfile$2532, sweet$2528.compile(file$2539).code, 'utf8');
        }
    } else if (tokens$2534) {
        console.log(sweet$2528.expand(file$2539, globalMacros$2540, numexpands$2537));
    } else if (noparse$2536) {
        var unparsedString$2552 = syn$2529.prettyPrint(sweet$2528.expand(file$2539, globalMacros$2540, numexpands$2537), displayHygiene$2538);
        console.log(unparsedString$2552);
    } else {
        console.log(sweet$2528.compile(file$2539, {
            macros: globalMacros$2540,
            numExpands: numexpands$2537
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map