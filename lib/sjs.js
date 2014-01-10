var fs$2558 = require('fs');
var path$2559 = require('path');
var sweet$2560 = require('./sweet.js');
var syn$2561 = require('./syntax.js');
var argv$2562 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$2563 = argv$2562._[0];
    var outfile$2564 = argv$2562.output;
    var watch$2565 = argv$2562.watch;
    var tokens$2566 = argv$2562.tokens;
    var sourcemap$2567 = argv$2562.sourcemap;
    var noparse$2568 = argv$2562['no-parse'];
    var numexpands$2569 = argv$2562['num-expands'];
    var displayHygiene$2570 = argv$2562['step-hygiene'];
    var file$2571;
    if (infile$2563) {
        file$2571 = fs$2558.readFileSync(infile$2563, 'utf8');
    } else if (argv$2562.stdin) {
        file$2571 = fs$2558.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2562._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$2572 = process.cwd();
    var modules$2573 = typeof argv$2562.module === 'string' ? [argv$2562.module] : argv$2562.module;
    modules$2573 = (modules$2573 || []).map(function (path$2575) {
        return sweet$2560.loadNodeModule(cwd$2572, path$2575);
    });
    var options$2574 = {
            filename: infile$2563,
            modules: modules$2573
        };
    if (watch$2565 && outfile$2564) {
        fs$2558.watch(infile$2563, function () {
            file$2571 = fs$2558.readFileSync(infile$2563, 'utf8');
            try {
                fs$2558.writeFileSync(outfile$2564, sweet$2560.compile(file$2571, options$2574).code, 'utf8');
            } catch (e$2576) {
                console.log(e$2576);
            }
        });
    } else if (outfile$2564) {
        if (sourcemap$2567) {
            options$2574.sourceMap = true;
            var result$2577 = sweet$2560.compile(file$2571, options$2574);
            var mapfile$2578 = path$2559.basename(outfile$2564) + '.map';
            fs$2558.writeFileSync(outfile$2564, result$2577.code + '\n//# sourceMappingURL=' + mapfile$2578, 'utf8');
            fs$2558.writeFileSync(outfile$2564 + '.map', result$2577.sourceMap, 'utf8');
        } else {
            fs$2558.writeFileSync(outfile$2564, sweet$2560.compile(file$2571, options$2574).code, 'utf8');
        }
    } else if (tokens$2566) {
        console.log(sweet$2560.expand(file$2571, modules$2573, numexpands$2569));
    } else if (noparse$2568) {
        var unparsedString$2579 = syn$2561.prettyPrint(sweet$2560.expand(file$2571, modules$2573, numexpands$2569), displayHygiene$2570);
        console.log(unparsedString$2579);
    } else {
        options$2574.numExpands = numexpands$2569;
        console.log(sweet$2560.compile(file$2571, options$2574).code);
    }
};
//# sourceMappingURL=sjs.js.map