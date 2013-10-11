var fs$97 = require('fs');
var path$98 = require('path');
var sweet$99 = require('./sweet.js');
var argv$100 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$101 = argv$100._[0];
    var outfile$102 = argv$100.output;
    var watch$103 = argv$100.watch;
    var tokens$104 = argv$100.tokens;
    var sourcemap$105 = argv$100.sourcemap;
    var file$106;
    if (infile$101) {
        file$106 = fs$97.readFileSync(infile$101, 'utf8');
    } else if (argv$100.stdin) {
        file$106 = fs$97.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$100._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$107 = argv$100.module;
    var cwd$108 = process.cwd();
    var Module$109 = module.constructor;
    var modulemock$110;
    if (mod$107) {
        modulemock$110 = {
            id: cwd$108 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$108) ? [cwd$108] : Module$109._nodeModulePaths(cwd$108)
        };
        if (typeof mod$107 === 'string') {
            mod$107 = [mod$107];
        }
        file$106 = mod$107.reduceRight(function (f$111, m$112) {
            var modulepath$113 = Module$109._resolveFilename(m$112, modulemock$110);
            var modulefile$114 = fs$97.readFileSync(modulepath$113, 'utf8');
            return modulefile$114 + '\n' + f$111;
        }, file$106);
    }
    if (watch$103 && outfile$102) {
        fs$97.watch(infile$101, function () {
            file$106 = fs$97.readFileSync(infile$101, 'utf8');
            try {
                fs$97.writeFileSync(outfile$102, sweet$99.compile(file$106), 'utf8');
            } catch (e$115) {
                console.log(e$115);
            }
        });
    } else if (outfile$102) {
        if (sourcemap$105) {
            var result$116 = sweet$99.compileWithSourcemap(file$106, infile$101);
            var mapfile$117 = path$98.basename(outfile$102) + '.map';
            fs$97.writeFileSync(outfile$102, result$116[0] + '\n//# sourceMappingURL=' + mapfile$117, 'utf8');
            fs$97.writeFileSync(outfile$102 + '.map', result$116[1], 'utf8');
        } else {
            fs$97.writeFileSync(outfile$102, sweet$99.compile(file$106), 'utf8');
        }
    } else if (tokens$104) {
        console.log(sweet$99.expand(file$106));
    } else {
        console.log(sweet$99.compile(file$106));
    }
};