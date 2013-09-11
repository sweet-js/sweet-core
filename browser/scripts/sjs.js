var fs$93 = require('fs');
var sweet$94 = require('./sweet.js');
var argv$95 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').argv;
exports.run = function () {
    var infile$96 = argv$95._[0];
    var outfile$97 = argv$95.output;
    var watch$98 = argv$95.watch;
    var tokens$99 = argv$95.tokens;
    var file$100;
    if (infile$96) {
        file$100 = fs$93.readFileSync(infile$96, 'utf8');
    } else if (argv$95.stdin) {
        file$100 = fs$93.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$95._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$101 = argv$95.module;
    var imp$102 = argv$95.import;
    var modulefile$103;
    if (imp$102) {
        sweet$94.module(infile$96);
    }
    if (module$101) {
        modulefile$103 = fs$93.readFileSync(module$101, 'utf8');
        file$100 = modulefile$103 + '\n' + file$100;
    }
    if (watch$98 && outfile$97) {
        fs$93.watch(infile$96, function () {
            file$100 = fs$93.readFileSync(infile$96, 'utf8');
            try {
                fs$93.writeFileSync(outfile$97, sweet$94.compile(file$100), 'utf8');
            } catch (e$104) {
                console.log(e$104);
            }
        });
    } else if (outfile$97) {
        fs$93.writeFileSync(outfile$97, sweet$94.compile(file$100), 'utf8');
    } else if (tokens$99) {
        console.log(sweet$94.expand(file$100));
    } else {
        console.log(sweet$94.compile(file$100));
    }
};