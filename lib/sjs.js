var fs$2542 = require('fs');
var path$2543 = require('path');
var sweet$2544 = require('./sweet.js');
var syn$2545 = require('./syntax.js');
var argv$2546 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2547 = argv$2546._[0];
    var outfile$2548 = argv$2546.output;
    var watch$2549 = argv$2546.watch;
    var tokens$2550 = argv$2546.tokens;
    var sourcemap$2551 = argv$2546.sourcemap;
    var noparse$2552 = argv$2546['no-parse'];
    var numexpands$2553 = argv$2546['num-expands'];
    var displayHygiene$2554 = argv$2546['step-hygiene'];
    var file$2555;
    var globalMacros$2556;
    if (infile$2547) {
        file$2555 = fs$2542.readFileSync(infile$2547, 'utf8');
    } else if (argv$2546.stdin) {
        file$2555 = fs$2542.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2546._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2557 = argv$2546.module;
    var cwd$2558 = process.cwd();
    var Module$2559 = module.constructor;
    var modulemock$2560;
    if (mod$2557) {
        modulemock$2560 = {
            id: cwd$2558 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2558) ? [cwd$2558] : Module$2559._nodeModulePaths(cwd$2558)
        };
        if (typeof mod$2557 === 'string') {
            mod$2557 = [mod$2557];
        }
        globalMacros$2556 = mod$2557.reduceRight(function (f$2561, m$2562) {
            var modulepath$2563 = Module$2559._resolveFilename(m$2562, modulemock$2560);
            var modulefile$2564 = fs$2542.readFileSync(modulepath$2563, 'utf8');
            return modulefile$2564 + '\n' + f$2561;
        }, '');
    }
    if (watch$2549 && outfile$2548) {
        fs$2542.watch(infile$2547, function () {
            file$2555 = fs$2542.readFileSync(infile$2547, 'utf8');
            try {
                fs$2542.writeFileSync(outfile$2548, sweet$2544.compile(file$2555, { macros: globalMacros$2556 }).code, 'utf8');
            } catch (e$2565) {
                console.log(e$2565);
            }
        });
    } else if (outfile$2548) {
        if (sourcemap$2551) {
            var result$2566 = sweet$2544.compile(file$2555, {
                    sourceMap: true,
                    filename: infile$2547,
                    macros: globalMacros$2556
                });
            var mapfile$2567 = path$2543.basename(outfile$2548) + '.map';
            fs$2542.writeFileSync(outfile$2548, result$2566.code + '\n//# sourceMappingURL=' + mapfile$2567, 'utf8');
            fs$2542.writeFileSync(outfile$2548 + '.map', result$2566.sourceMap, 'utf8');
        } else {
            fs$2542.writeFileSync(outfile$2548, sweet$2544.compile(file$2555).code, 'utf8');
        }
    } else if (tokens$2550) {
        console.log(sweet$2544.expand(file$2555, globalMacros$2556, numexpands$2553));
    } else if (noparse$2552) {
        var unparsedString$2568 = syn$2545.prettyPrint(sweet$2544.expand(file$2555, globalMacros$2556, numexpands$2553), displayHygiene$2554);
        console.log(unparsedString$2568);
    } else {
        console.log(sweet$2544.compile(file$2555, {
            macros: globalMacros$2556,
            numExpands: numexpands$2553
        }).code);
    }
};
//# sourceMappingURL=sjs.js.map