var fs$92 = require('fs');
var sweet$93 = require('./sweet.js');
var argv$94 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').argv;
exports.run = function () {
    var infile$95 = argv$94._[0];
    var outfile$96 = argv$94.output;
    var watch$97 = argv$94.watch;
    var tokens$98 = argv$94.tokens;
    var file$99;
    if (infile$95) {
        file$99 = fs$92.readFileSync(infile$95, 'utf8');
    } else if (argv$94.stdin) {
        file$99 = fs$92.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$94._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$100 = argv$94.module;
    var imp$101 = argv$94.import;
    var modulefile$102;
    if (imp$101) {
        sweet$93.module(infile$95);
    }
    if (module$100) {
        modulefile$102 = fs$92.readFileSync(module$100, 'utf8');
        file$99 = modulefile$102 + '\n' + file$99;
    }
    if (watch$97 && outfile$96) {
        fs$92.watch(infile$95, function () {
            file$99 = fs$92.readFileSync(infile$95, 'utf8');
            try {
                fs$92.writeFileSync(outfile$96, sweet$93.compile(file$99), 'utf8');
            } catch (e$103) {
                console.log(e$103);
            }
        });
    } else if (outfile$96) {
        fs$92.writeFileSync(outfile$96, sweet$93.compile(file$99), 'utf8');
    } else if (tokens$98) {
        console.log(sweet$93.expand(file$99));
    } else {
        console.log(sweet$93.compile(file$99));
    }
};