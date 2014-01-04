var fs$2532 = require('fs');
var path$2533 = require('path');
var sweet$2534 = require('./sweet.js');
var syn$2535 = require('./syntax.js');
var argv$2536 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2537 = argv$2536._[0];
    var outfile$2538 = argv$2536.output;
    var watch$2539 = argv$2536.watch;
    var tokens$2540 = argv$2536.tokens;
    var sourcemap$2541 = argv$2536.sourcemap;
    var noparse$2542 = argv$2536['no-parse'];
    var numexpands$2543 = argv$2536['num-expands'];
    var displayHygiene$2544 = argv$2536['step-hygiene'];
    var file$2545;
    var globalMacros$2546;
    if (infile$2537) {
        file$2545 = fs$2532.readFileSync(infile$2537, 'utf8');
    } else if (argv$2536.stdin) {
        file$2545 = fs$2532.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2536._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2547 = argv$2536.module;
    var cwd$2548 = process.cwd();
    var Module$2549 = module.constructor;
    var modulemock$2550;
    if (mod$2547) {
        modulemock$2550 = {
            id: cwd$2548 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2548) ? [cwd$2548] : Module$2549._nodeModulePaths(cwd$2548)
        };
        if (typeof mod$2547 === 'string') {
            mod$2547 = [mod$2547];
        }
        globalMacros$2546 = mod$2547.reduceRight(function (f$2551, m$2552) {
            var modulepath$2553 = Module$2549._resolveFilename(m$2552, modulemock$2550);
            var modulefile$2554 = fs$2532.readFileSync(modulepath$2553, 'utf8');
            return modulefile$2554 + '\n' + f$2551;
        }, '');
    }
    if (watch$2539 && outfile$2538) {
        fs$2532.watch(infile$2537, function () {
            file$2545 = fs$2532.readFileSync(infile$2537, 'utf8');
            try {
                fs$2532.writeFileSync(outfile$2538, sweet$2534.compile(file$2545, { macros: globalMacros$2546 }).code, 'utf8');
            } catch (e$2555) {
                console.log(e$2555);
            }
        });
    } else if (outfile$2538) {
        if (sourcemap$2541) {
            var result$2556 = sweet$2534.compile(file$2545, {
                    sourceMap: true,
                    filename: infile$2537,
                    macros: globalMacros$2546
                });
            var mapfile$2557 = path$2533.basename(outfile$2538) + '.map';
            fs$2532.writeFileSync(outfile$2538, result$2556.code + '\n//# sourceMappingURL=' + mapfile$2557, 'utf8');
            fs$2532.writeFileSync(outfile$2538 + '.map', result$2556.sourceMap, 'utf8');
        } else {
            fs$2532.writeFileSync(outfile$2538, sweet$2534.compile(file$2545).code, 'utf8');
        }
    } else if (tokens$2540) {
        console.log(sweet$2534.expand(file$2545, globalMacros$2546, numexpands$2543));
    } else if (noparse$2542) {
        var unparsedString$2558 = syn$2535.prettyPrint(sweet$2534.expand(file$2545, globalMacros$2546, numexpands$2543), displayHygiene$2544);
        console.log(unparsedString$2558);
    } else {
        console.log(sweet$2534.compile(file$2545, {
            macros: globalMacros$2546,
            numExpands: numexpands$2543
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map