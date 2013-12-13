var fs = require("fs");
var path = require("path");

var sweet = require("./sweet.js");

var argv = require("optimist")
    .usage("Usage: sjs [options] path/to/file.js")
    .alias('o', 'output')
    .describe('o', 'Output file path')
    .alias('m', 'module')
    .describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages')
    .alias('w', 'watch')
    .describe('w', 'watch a file')
    .boolean('watch')
    .alias('t', 'tokens')
    .describe('t', 'just emit the expanded tokens without parsing an AST')
    .alias('p', 'no-parse')
    .describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)')
    .boolean("no-parse")
    .alias('s', 'stdin')
    .describe('s', 'read from stdin')
    .boolean('stdin')
    .alias('c', 'sourcemap')
    .describe('c', 'generate a sourcemap')
    .boolean("sourcemap")
    .alias('n', 'num-expands')
    .describe('n', 'the maximum number of expands to perform')
    .argv;

exports.run = function() {
    var infile = argv._[0];
    var outfile = argv.output;
    var watch = argv.watch;
    var tokens = argv.tokens;
    var sourcemap = argv.sourcemap;
    var noparse = argv['no-parse'];
    var numexpands = argv['num-expands'];

    var file;
    var globalMacros;
    if(infile) {
        file = fs.readFileSync(infile, "utf8");
    } else if (argv.stdin) {
        file = fs.readFileSync("/dev/stdin", "utf8");
    } else if (argv._.length === 0) {
        console.log(require("optimist").help());
        return;
    }


    var mod = argv.module;
    var cwd = process.cwd();
    var Module = module.constructor;
    var modulemock;


    if (mod) {
        modulemock = {
          id: cwd + '/$sweet-loader.js',
          filename: '$sweet-loader.js',
          paths: /^\.\/|\.\./.test(cwd) ? [cwd] : Module._nodeModulePaths(cwd)
        };
        if (typeof mod === "string") {
            mod = [mod];
        }
        globalMacros = mod.reduceRight(function(f, m) {
            var modulepath = Module._resolveFilename(m, modulemock);
            var modulefile = fs.readFileSync(modulepath, "utf8");
            return modulefile + "\n" + f;
        }, '');
    }
    
	if (watch && outfile) {
		fs.watch(infile, function(){
			file = fs.readFileSync(infile, "utf8");
			try {
				fs.writeFileSync(outfile,
                                 sweet.compile(file, {
                                     macros: globalMacros
                                 }).code,
                                 "utf8");
			} catch (e) {
				console.log(e);
			}
		});
	} else if(outfile) {
        if (sourcemap) {
            var result = sweet.compile(file, {
                sourceMap: true,
                filename: infile,
                macros: globalMacros
            });
            var mapfile = path.basename(outfile) + ".map";
            fs.writeFileSync(outfile,
                             result.code + "\n//# sourceMappingURL=" + mapfile,
                             "utf8");
            fs.writeFileSync(outfile + ".map", result.sourceMap, "utf8");
        } else {
            fs.writeFileSync(outfile, sweet.compile(file).code, "utf8");
        }
    } else if (tokens) {
        console.log(sweet.expand(file, globalMacros, numexpands));
    } else if (noparse) {
        var unparsedString = sweet.prettyPrint(sweet.expand(file, globalMacros, numexpands));        
        console.log(unparsedString);
    } else {
        console.log(sweet.compile(file, {
            macros: globalMacros,
            numExpands: numexpands
        }).code);
    }
};
