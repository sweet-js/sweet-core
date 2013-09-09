var fs$90 = require('fs');
var sweet$91 = require('./sweet.js');
var argv$92 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').argv;
exports.run = function () {
    var infile$93 = argv$92._[0];
    var outfile$94 = argv$92.output;
    var watch$95 = argv$92.watch;
    var tokens$96 = argv$92.tokens;
    var file$97;
    if (infile$93) {
        file$97 = fs$90.readFileSync(infile$93, 'utf8');
    } else if (argv$92.stdin) {
        file$97 = fs$90.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$92._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$98 = argv$92.module;
    var imp$99 = argv$92.import;
    var modulefile$100;
    if (imp$99) {
        sweet$91.module(infile$93);
    }
    if (module$98) {
        modulefile$100 = fs$90.readFileSync(module$98, 'utf8');
        file$97 = modulefile$100 + '\n' + file$97;
    }
    if (watch$95 && outfile$94) {
        fs$90.watch(infile$93, function () {
            file$97 = fs$90.readFileSync(infile$93, 'utf8');
            try {
                fs$90.writeFileSync(outfile$94, sweet$91.compile(file$97), 'utf8');
            } catch (e$101) {
                console.log(e$101);
            }
        });
    } else if (outfile$94) {
        fs$90.writeFileSync(outfile$94, sweet$91.compile(file$97), 'utf8');
    } else if (tokens$96) {
        console.log(sweet$91.expand(file$97));
    } else {
        console.log(sweet$91.compile(file$97));
    }
};