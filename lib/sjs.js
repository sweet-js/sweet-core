var fs$2528 = require('fs');
var path$2529 = require('path');
var sweet$2530 = require('./sweet.js');
var syn$2531 = require('./syntax.js');
var argv$2532 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2533 = argv$2532._[0];
    var outfile$2534 = argv$2532.output;
    var watch$2535 = argv$2532.watch;
    var tokens$2536 = argv$2532.tokens;
    var sourcemap$2537 = argv$2532.sourcemap;
    var noparse$2538 = argv$2532['no-parse'];
    var numexpands$2539 = argv$2532['num-expands'];
    var displayHygiene$2540 = argv$2532['step-hygiene'];
    var file$2541;
    var globalMacros$2542;
    if (infile$2533) {
        file$2541 = fs$2528.readFileSync(infile$2533, 'utf8');
    } else if (argv$2532.stdin) {
        file$2541 = fs$2528.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2532._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2543 = argv$2532.module;
    var cwd$2544 = process.cwd();
    var Module$2545 = module.constructor;
    var modulemock$2546;
    if (mod$2543) {
        modulemock$2546 = {
            id: cwd$2544 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2544) ? [cwd$2544] : Module$2545._nodeModulePaths(cwd$2544)
        };
        if (typeof mod$2543 === 'string') {
            mod$2543 = [mod$2543];
        }
        globalMacros$2542 = mod$2543.reduceRight(function (f$2547, m$2548) {
            var modulepath$2549 = Module$2545._resolveFilename(m$2548, modulemock$2546);
            var modulefile$2550 = fs$2528.readFileSync(modulepath$2549, 'utf8');
            return modulefile$2550 + '\n' + f$2547;
        }, '');
    }
    if (watch$2535 && outfile$2534) {
        fs$2528.watch(infile$2533, function () {
            file$2541 = fs$2528.readFileSync(infile$2533, 'utf8');
            try {
                fs$2528.writeFileSync(outfile$2534, sweet$2530.compile(file$2541, { macros: globalMacros$2542 }).code, 'utf8');
            } catch (e$2551) {
                console.log(e$2551);
            }
        });
    } else if (outfile$2534) {
        if (sourcemap$2537) {
            var result$2552 = sweet$2530.compile(file$2541, {
                    sourceMap: true,
                    filename: infile$2533,
                    macros: globalMacros$2542
                });
            var mapfile$2553 = path$2529.basename(outfile$2534) + '.map';
            fs$2528.writeFileSync(outfile$2534, result$2552.code + '\n//# sourceMappingURL=' + mapfile$2553, 'utf8');
            fs$2528.writeFileSync(outfile$2534 + '.map', result$2552.sourceMap, 'utf8');
        } else {
            fs$2528.writeFileSync(outfile$2534, sweet$2530.compile(file$2541).code, 'utf8');
        }
    } else if (tokens$2536) {
        console.log(sweet$2530.expand(file$2541, globalMacros$2542, numexpands$2539));
    } else if (noparse$2538) {
        var unparsedString$2554 = syn$2531.prettyPrint(sweet$2530.expand(file$2541, globalMacros$2542, numexpands$2539), displayHygiene$2540);
        console.log(unparsedString$2554);
    } else {
        console.log(sweet$2530.compile(file$2541, {
            macros: globalMacros$2542,
            numExpands: numexpands$2539
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map