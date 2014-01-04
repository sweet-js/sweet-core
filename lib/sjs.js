var fs$2533 = require('fs');
var path$2534 = require('path');
var sweet$2535 = require('./sweet.js');
var syn$2536 = require('./syntax.js');
var argv$2537 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2538 = argv$2537._[0];
    var outfile$2539 = argv$2537.output;
    var watch$2540 = argv$2537.watch;
    var tokens$2541 = argv$2537.tokens;
    var sourcemap$2542 = argv$2537.sourcemap;
    var noparse$2543 = argv$2537['no-parse'];
    var numexpands$2544 = argv$2537['num-expands'];
    var displayHygiene$2545 = argv$2537['step-hygiene'];
    var file$2546;
    var globalMacros$2547;
    if (infile$2538) {
        file$2546 = fs$2533.readFileSync(infile$2538, 'utf8');
    } else if (argv$2537.stdin) {
        file$2546 = fs$2533.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2537._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2548 = argv$2537.module;
    var cwd$2549 = process.cwd();
    var Module$2550 = module.constructor;
    var modulemock$2551;
    if (mod$2548) {
        modulemock$2551 = {
            id: cwd$2549 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2549) ? [cwd$2549] : Module$2550._nodeModulePaths(cwd$2549)
        };
        if (typeof mod$2548 === 'string') {
            mod$2548 = [mod$2548];
        }
        globalMacros$2547 = mod$2548.reduceRight(function (f$2552, m$2553) {
            var modulepath$2554 = Module$2550._resolveFilename(m$2553, modulemock$2551);
            var modulefile$2555 = fs$2533.readFileSync(modulepath$2554, 'utf8');
            return modulefile$2555 + '\n' + f$2552;
        }, '');
    }
    if (watch$2540 && outfile$2539) {
        fs$2533.watch(infile$2538, function () {
            file$2546 = fs$2533.readFileSync(infile$2538, 'utf8');
            try {
                fs$2533.writeFileSync(outfile$2539, sweet$2535.compile(file$2546, { macros: globalMacros$2547 }).code, 'utf8');
            } catch (e$2556) {
                console.log(e$2556);
            }
        });
    } else if (outfile$2539) {
        if (sourcemap$2542) {
            var result$2557 = sweet$2535.compile(file$2546, {
                    sourceMap: true,
                    filename: infile$2538,
                    macros: globalMacros$2547
                });
            var mapfile$2558 = path$2534.basename(outfile$2539) + '.map';
            fs$2533.writeFileSync(outfile$2539, result$2557.code + '\n//# sourceMappingURL=' + mapfile$2558, 'utf8');
            fs$2533.writeFileSync(outfile$2539 + '.map', result$2557.sourceMap, 'utf8');
        } else {
            fs$2533.writeFileSync(outfile$2539, sweet$2535.compile(file$2546).code, 'utf8');
        }
    } else if (tokens$2541) {
        console.log(sweet$2535.expand(file$2546, globalMacros$2547, numexpands$2544));
    } else if (noparse$2543) {
        var unparsedString$2559 = syn$2536.prettyPrint(sweet$2535.expand(file$2546, globalMacros$2547, numexpands$2544), displayHygiene$2545);
        console.log(unparsedString$2559);
    } else {
        console.log(sweet$2535.compile(file$2546, {
            macros: globalMacros$2547,
            numExpands: numexpands$2544
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map