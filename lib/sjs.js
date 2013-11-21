var fs$1494 = require('fs');
var path$1495 = require('path');
var sweet$1496 = require('./sweet.js');
var argv$1497 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1498 = argv$1497._[0];
    var outfile$1499 = argv$1497.output;
    var watch$1500 = argv$1497.watch;
    var tokens$1501 = argv$1497.tokens;
    var sourcemap$1502 = argv$1497.sourcemap;
    var file$1503;
    if (infile$1498) {
        file$1503 = fs$1494.readFileSync(infile$1498, 'utf8');
    } else if (argv$1497.stdin) {
        file$1503 = fs$1494.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1497._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1504 = argv$1497.module;
    var cwd$1505 = process.cwd();
    var Module$1506 = module.constructor;
    var modulemock$1507;
    if (mod$1504) {
        modulemock$1507 = {
            id: cwd$1505 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1505) ? [cwd$1505] : Module$1506._nodeModulePaths(cwd$1505)
        };
        if (typeof mod$1504 === 'string') {
            mod$1504 = [mod$1504];
        }
        file$1503 = mod$1504.reduceRight(function (f$1508, m$1509) {
            var modulepath$1510 = Module$1506._resolveFilename(m$1509, modulemock$1507);
            var modulefile$1511 = fs$1494.readFileSync(modulepath$1510, 'utf8');
            return modulefile$1511 + '\n' + f$1508;
        }, file$1503);
    }
    if (watch$1500 && outfile$1499) {
        fs$1494.watch(infile$1498, function () {
            file$1503 = fs$1494.readFileSync(infile$1498, 'utf8');
            try {
                fs$1494.writeFileSync(outfile$1499, sweet$1496.compile(file$1503).code, 'utf8');
            } catch (e$1512) {
                console.log(e$1512);
            }
        });
    } else if (outfile$1499) {
        if (sourcemap$1502) {
            var result$1513 = sweet$1496.compile(file$1503, {
                    sourceMap: true,
                    filename: infile$1498
                });
            var mapfile$1514 = path$1495.basename(outfile$1499) + '.map';
            fs$1494.writeFileSync(outfile$1499, result$1513.code + '\n//# sourceMappingURL=' + mapfile$1514, 'utf8');
            fs$1494.writeFileSync(outfile$1499 + '.map', result$1513.sourceMap, 'utf8');
        } else {
            fs$1494.writeFileSync(outfile$1499, sweet$1496.compile(file$1503).code, 'utf8');
        }
    } else if (tokens$1501) {
        console.log(sweet$1496.expand(file$1503));
    } else {
        console.log(sweet$1496.compile(file$1503).code);
    }
};