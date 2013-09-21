var fs$93 = require('fs');
var path$94 = require('path');
var sweet$95 = require('./sweet.js');
var argv$96 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$97 = argv$96._[0];
    var outfile$98 = argv$96.output;
    var watch$99 = argv$96.watch;
    var tokens$100 = argv$96.tokens;
    var sourcemap$101 = argv$96.sourcemap;
    var file$102;
    if (infile$97) {
        file$102 = fs$93.readFileSync(infile$97, 'utf8');
    } else if (argv$96.stdin) {
        file$102 = fs$93.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$96._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$103 = argv$96.module;
    var modulefile$104;
    if (module$103) {
        modulefile$104 = fs$93.readFileSync(module$103, 'utf8');
        file$102 = modulefile$104 + '\n' + file$102;
    }
    if (watch$99 && outfile$98) {
        fs$93.watch(infile$97, function () {
            file$102 = fs$93.readFileSync(infile$97, 'utf8');
            try {
                fs$93.writeFileSync(outfile$98, sweet$95.compile(file$102), 'utf8');
            } catch (e$105) {
                console.log(e$105);
            }
        });
    } else if (outfile$98) {
        if (sourcemap$101) {
            var result$106 = sweet$95.compileWithSourcemap(file$102, infile$97);
            var mapfile$107 = path$94.basename(outfile$98) + '.map';
            fs$93.writeFileSync(outfile$98, result$106[0] + '\n//# sourceMappingURL=' + mapfile$107, 'utf8');
            fs$93.writeFileSync(outfile$98 + '.map', result$106[1], 'utf8');
        } else {
            fs$93.writeFileSync(outfile$98, sweet$95.compile(file$102), 'utf8');
        }
    } else if (tokens$100) {
        console.log(sweet$95.expand(file$102));
    } else {
        console.log(sweet$95.compile(file$102));
    }
};