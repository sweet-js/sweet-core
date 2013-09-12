var fs$93 = require('fs');
var sweet$94 = require('./sweet.js');
var argv$95 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$96 = argv$95._[0];
    var outfile$97 = argv$95.output;
    var watch$98 = argv$95.watch;
    var tokens$99 = argv$95.tokens;
    var sourcemap$100 = argv$95.sourcemap;
    var file$101;
    if (infile$96) {
        file$101 = fs$93.readFileSync(infile$96, 'utf8');
    } else if (argv$95.stdin) {
        file$101 = fs$93.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$95._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$102 = argv$95.module;
    var modulefile$103;
    if (module$102) {
        modulefile$103 = fs$93.readFileSync(module$102, 'utf8');
        file$101 = modulefile$103 + '\n' + file$101;
    }
    if (watch$98 && outfile$97) {
        fs$93.watch(infile$96, function () {
            file$101 = fs$93.readFileSync(infile$96, 'utf8');
            try {
                fs$93.writeFileSync(outfile$97, sweet$94.compile(file$101), 'utf8');
            } catch (e$104) {
                console.log(e$104);
            }
        });
    } else if (outfile$97) {
        if (sourcemap$100) {
            var result$105 = sweet$94.compileWithSourcemap(file$101, infile$96);
            var mapfile$106 = outfile$97 + '.map';
            fs$93.writeFileSync(outfile$97, result$105[0] + '\n//# sourceMappingURL=' + mapfile$106, 'utf8');
            fs$93.writeFileSync(mapfile$106, result$105[1], 'utf8');
        } else {
            fs$93.writeFileSync(outfile$97, sweet$94.compile(file$101), 'utf8');
        }
    } else if (tokens$99) {
        console.log(sweet$94.expand(file$101));
    } else {
        console.log(sweet$94.compile(file$101));
    }
};