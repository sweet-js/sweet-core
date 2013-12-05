var fs$1526 = require('fs');
var path$1527 = require('path');
var sweet$1528 = require('./sweet.js');
var argv$1529 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1530 = argv$1529._[0];
    var outfile$1531 = argv$1529.output;
    var watch$1532 = argv$1529.watch;
    var tokens$1533 = argv$1529.tokens;
    var sourcemap$1534 = argv$1529.sourcemap;
    var noparse$1535 = argv$1529['no-parse'];
    var file$1536;
    var globalMacros$1537;
    if (infile$1530) {
        file$1536 = fs$1526.readFileSync(infile$1530, 'utf8');
    } else if (argv$1529.stdin) {
        file$1536 = fs$1526.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1529._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1538 = argv$1529.module;
    var cwd$1539 = process.cwd();
    var Module$1540 = module.constructor;
    var modulemock$1541;
    if (mod$1538) {
        modulemock$1541 = {
            id: cwd$1539 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1539) ? [cwd$1539] : Module$1540._nodeModulePaths(cwd$1539)
        };
        if (typeof mod$1538 === 'string') {
            mod$1538 = [mod$1538];
        }
        globalMacros$1537 = mod$1538.reduceRight(function (f$1542, m$1543) {
            var modulepath$1544 = Module$1540._resolveFilename(m$1543, modulemock$1541);
            var modulefile$1545 = fs$1526.readFileSync(modulepath$1544, 'utf8');
            return modulefile$1545 + '\n' + f$1542;
        }, '');
    }
    if (watch$1532 && outfile$1531) {
        fs$1526.watch(infile$1530, function () {
            file$1536 = fs$1526.readFileSync(infile$1530, 'utf8');
            try {
                fs$1526.writeFileSync(outfile$1531, sweet$1528.compile(file$1536, { macros: globalMacros$1537 }).code, 'utf8');
            } catch (e$1546) {
                console.log(e$1546);
            }
        });
    } else if (outfile$1531) {
        if (sourcemap$1534) {
            var result$1547 = sweet$1528.compile(file$1536, {
                    sourceMap: true,
                    filename: infile$1530,
                    macros: globalMacros$1537
                });
            var mapfile$1548 = path$1527.basename(outfile$1531) + '.map';
            fs$1526.writeFileSync(outfile$1531, result$1547.code + '\n//# sourceMappingURL=' + mapfile$1548, 'utf8');
            fs$1526.writeFileSync(outfile$1531 + '.map', result$1547.sourceMap, 'utf8');
        } else {
            fs$1526.writeFileSync(outfile$1531, sweet$1528.compile(file$1536).code, 'utf8');
        }
    } else if (tokens$1533) {
        console.log(sweet$1528.expand(file$1536, globalMacros$1537));
    } else if (noparse$1535) {
        var unparsedString$1549 = sweet$1528.expand(file$1536, globalMacros$1537).reduce(function (acc$1550, stx$1551) {
                return acc$1550 + ' ' + stx$1551.token.value;
            }, '');
        console.log(unparsedString$1549);
    } else {
        console.log(sweet$1528.compile(file$1536, { macros: globalMacros$1537 }).code);
    }
};