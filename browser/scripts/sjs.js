var fs$111 = require('fs');
var path$112 = require('path');
var sweet$113 = require('./sweet.js');
var argv$114 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$115 = argv$114._[0];
    var outfile$116 = argv$114.output;
    var watch$117 = argv$114.watch;
    var tokens$118 = argv$114.tokens;
    var sourcemap$119 = argv$114.sourcemap;
    var file$120;
    if (infile$115) {
        file$120 = fs$111.readFileSync(infile$115, 'utf8');
    } else if (argv$114.stdin) {
        file$120 = fs$111.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$114._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$121 = argv$114.module;
    var cwd$122 = process.cwd();
    var Module$123 = module.constructor;
    var modulemock$124;
    if (mod$121) {
        modulemock$124 = {
            id: cwd$122 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$122) ? [cwd$122] : Module$123._nodeModulePaths(cwd$122)
        };
        if (typeof mod$121 === 'string') {
            mod$121 = [mod$121];
        }
        file$120 = mod$121.reduceRight(function (f$125, m$126) {
            var modulepath$127 = Module$123._resolveFilename(m$126, modulemock$124);
            var modulefile$128 = fs$111.readFileSync(modulepath$127, 'utf8');
            return modulefile$128 + '\n' + f$125;
        }, file$120);
    }
    if (watch$117 && outfile$116) {
        fs$111.watch(infile$115, function () {
            file$120 = fs$111.readFileSync(infile$115, 'utf8');
            try {
                fs$111.writeFileSync(outfile$116, sweet$113.compile(file$120), 'utf8');
            } catch (e$129) {
                console.log(e$129);
            }
        });
    } else if (outfile$116) {
        if (sourcemap$119) {
            var result$130 = sweet$113.compileWithSourcemap(file$120, infile$115);
            var mapfile$131 = path$112.basename(outfile$116) + '.map';
            fs$111.writeFileSync(outfile$116, result$130[0] + '\n//# sourceMappingURL=' + mapfile$131, 'utf8');
            fs$111.writeFileSync(outfile$116 + '.map', result$130[1], 'utf8');
        } else {
            fs$111.writeFileSync(outfile$116, sweet$113.compile(file$120), 'utf8');
        }
    } else if (tokens$118) {
        console.log(sweet$113.expand(file$120));
    } else {
        console.log(sweet$113.compile(file$120));
    }
};