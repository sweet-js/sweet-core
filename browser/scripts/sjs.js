var fs$2854 = require('fs');
var path$2855 = require('path');
var sweet$2856 = require('./sweet.js');
var argv$2857 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2858 = argv$2857._[0];
    var outfile$2859 = argv$2857.output;
    var watch$2860 = argv$2857.watch;
    var tokens$2861 = argv$2857.tokens;
    var sourcemap$2862 = argv$2857.sourcemap;
    var noparse$2863 = argv$2857['no-parse'];
    var file$2864;
    var globalMacros$2865;
    if (infile$2858) {
        file$2864 = fs$2854.readFileSync(infile$2858, 'utf8');
    } else if (argv$2857.stdin) {
        file$2864 = fs$2854.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2857._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2866 = argv$2857.module;
    var cwd$2867 = process.cwd();
    var Module$2868 = module.constructor;
    var modulemock$2869;
    if (mod$2866) {
        modulemock$2869 = {
            id: cwd$2867 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2867) ? [cwd$2867] : Module$2868._nodeModulePaths(cwd$2867)
        };
        if (typeof mod$2866 === 'string') {
            mod$2866 = [mod$2866];
        }
        globalMacros$2865 = mod$2866.reduceRight(function (f$2870, m$2871) {
            var modulepath$2872 = Module$2868._resolveFilename(m$2871, modulemock$2869);
            var modulefile$2873 = fs$2854.readFileSync(modulepath$2872, 'utf8');
            return modulefile$2873 + '\n' + f$2870;
        }, '');
    }
    if (watch$2860 && outfile$2859) {
        fs$2854.watch(infile$2858, function () {
            file$2864 = fs$2854.readFileSync(infile$2858, 'utf8');
            try {
                fs$2854.writeFileSync(outfile$2859, sweet$2856.compile(file$2864, { macros: globalMacros$2865 }).code, 'utf8');
            } catch (e$2874) {
                console.log(e$2874);
            }
        });
    } else if (outfile$2859) {
        if (sourcemap$2862) {
            var result$2875 = sweet$2856.compile(file$2864, {
                    sourceMap: true,
                    filename: infile$2858,
                    macros: globalMacros$2865
                });
            var mapfile$2876 = path$2855.basename(outfile$2859) + '.map';
            fs$2854.writeFileSync(outfile$2859, result$2875.code + '\n//# sourceMappingURL=' + mapfile$2876, 'utf8');
            fs$2854.writeFileSync(outfile$2859 + '.map', result$2875.sourceMap, 'utf8');
        } else {
            fs$2854.writeFileSync(outfile$2859, sweet$2856.compile(file$2864).code, 'utf8');
        }
    } else if (tokens$2861) {
        console.log(sweet$2856.expand(file$2864, globalMacros$2865));
    } else if (noparse$2863) {
        var unparsedString$2877 = sweet$2856.expand(file$2864, globalMacros$2865).reduce(function (acc$2878, stx$2879) {
                return acc$2878 + ' ' + stx$2879.token.value;
            }, '');
        console.log(unparsedString$2877);
    } else {
        console.log(sweet$2856.compile(file$2864, { macros: globalMacros$2865 }).code);
    }
};