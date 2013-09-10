var fs$91 = require('fs');
var sweet$92 = require('./sweet.js');
var argv$93 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').argv;
exports.run = function () {
    var infile$94 = argv$93._[0];
    var outfile$95 = argv$93.output;
    var watch$96 = argv$93.watch;
    var tokens$97 = argv$93.tokens;
    var file$98;
    if (infile$94) {
        file$98 = fs$91.readFileSync(infile$94, 'utf8');
    } else if (argv$93.stdin) {
        file$98 = fs$91.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$93._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$99 = argv$93.module;
    var imp$100 = argv$93.import;
    var modulefile$101;
    if (imp$100) {
        sweet$92.module(infile$94);
    }
    if (module$99) {
        modulefile$101 = fs$91.readFileSync(module$99, 'utf8');
        file$98 = modulefile$101 + '\n' + file$98;
    }
    if (watch$96 && outfile$95) {
        fs$91.watch(infile$94, function () {
            file$98 = fs$91.readFileSync(infile$94, 'utf8');
            try {
                fs$91.writeFileSync(outfile$95, sweet$92.compile(file$98), 'utf8');
            } catch (e$102) {
                console.log(e$102);
            }
        });
    } else if (outfile$95) {
        fs$91.writeFileSync(outfile$95, sweet$92.compile(file$98), 'utf8');
    } else if (tokens$97) {
        console.log(sweet$92.expand(file$98));
    } else {
        console.log(sweet$92.compile(file$98));
    }
};