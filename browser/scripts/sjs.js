var fs$1474 = require('fs');
var path$1475 = require('path');
var sweet$1476 = require('./sweet.js');
var argv$1477 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1478 = argv$1477._[0];
    var outfile$1479 = argv$1477.output;
    var watch$1480 = argv$1477.watch;
    var tokens$1481 = argv$1477.tokens;
    var sourcemap$1482 = argv$1477.sourcemap;
    var file$1483;
    var globalMacros$1484;
    if (infile$1478) {
        file$1483 = fs$1474.readFileSync(infile$1478, 'utf8');
    } else if (argv$1477.stdin) {
        file$1483 = fs$1474.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1477._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1485 = argv$1477.module;
    var cwd$1486 = process.cwd();
    var Module$1487 = module.constructor;
    var modulemock$1488;
    if (mod$1485) {
        modulemock$1488 = {
            id: cwd$1486 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1486) ? [cwd$1486] : Module$1487._nodeModulePaths(cwd$1486)
        };
        if (typeof mod$1485 === 'string') {
            mod$1485 = [mod$1485];
        }
        globalMacros$1484 = mod$1485.reduceRight(function (f$1489, m$1490) {
            var modulepath$1491 = Module$1487._resolveFilename(m$1490, modulemock$1488);
            var modulefile$1492 = fs$1474.readFileSync(modulepath$1491, 'utf8');
            return modulefile$1492 + '\n' + f$1489;
        }, '');
    }
    if (watch$1480 && outfile$1479) {
        fs$1474.watch(infile$1478, function () {
            file$1483 = fs$1474.readFileSync(infile$1478, 'utf8');
            try {
                fs$1474.writeFileSync(outfile$1479, sweet$1476.compile(file$1483, { macros: globalMacros$1484 }).code, 'utf8');
            } catch (e$1493) {
                console.log(e$1493);
            }
        });
    } else if (outfile$1479) {
        if (sourcemap$1482) {
            var result$1494 = sweet$1476.compile(file$1483, {
                    sourceMap: true,
                    filename: infile$1478,
                    macros: globalMacros$1484
                });
            var mapfile$1495 = path$1475.basename(outfile$1479) + '.map';
            fs$1474.writeFileSync(outfile$1479, result$1494.code + '\n//# sourceMappingURL=' + mapfile$1495, 'utf8');
            fs$1474.writeFileSync(outfile$1479 + '.map', result$1494.sourceMap, 'utf8');
        } else {
            fs$1474.writeFileSync(outfile$1479, sweet$1476.compile(file$1483).code, 'utf8');
        }
    } else if (tokens$1481) {
        console.log(sweet$1476.expand(file$1483, globalMacros$1484));
    } else {
        console.log(sweet$1476.compile(file$1483, { macros: globalMacros$1484 }).code);
    }
};