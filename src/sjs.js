var fs = require("fs");

var sweet = require("./sweet.js");

var argv = require("optimist")
    .usage("Usage: sjs [options] path/to/file.js")
    .alias('o', 'output')
    .describe('o', 'Output file path')
    .alias('m', 'module')
    .describe('m', 'use a module file for loading macro definitions')
    .alias('w', 'watch')
    .describe('w', 'watch a file')
    .boolean('watch')
    .alias('t', 'tokens')
    .describe('t', 'just emit the expanded tokens without parsing an AST')
    .alias('i', 'import')
    .describe('i', 'uses the module loading path')
    .boolean('import')
    .alias('s', 'stdin')
    .describe('s', 'read from stdin')
    .boolean('stdin')
    .alias('c', 'sourcemap')
    .describe('c', 'generate a sourcemap')
    .boolean('sourcemap')
    .argv;

exports.run = function() {
    var infile = argv._[0];
    var outfile = argv.output;
    var watch = argv.watch;
    var tokens = argv.tokens;
    var sourcemap = argv.sourcemap;

    var file;
    if(infile) {
        file = fs.readFileSync(infile, "utf8");
    } else if (argv.stdin) {
        file = fs.readFileSync("/dev/stdin", "utf8");
    } else if (argv._.length === 0) {
        console.log(require("optimist").help());
        return;
    }


    var module = argv.module;
    var imp = argv.import;
    var modulefile;

    if(imp) {
        sweet.module(infile);
    }

    if(module) {
        modulefile = fs.readFileSync(module, "utf8");
        file = modulefile + "\n" + file;
    }
    
	if (watch && outfile){
		fs.watch(infile, function(){
			file = fs.readFileSync(infile, "utf8");
			try {
				fs.writeFileSync(outfile, sweet.compile(file), "utf8");
			} catch (e) {
				console.log(e);
			}
		});
	} else if(outfile) {
        var sm = {map: null}
        fs.writeFileSync(outfile, sweet.compile(file, sm), "utf8");
        if (sourcemap) {
            fs.writeFileSync("source_map.js", sm.map, "utf8");
        }
    } else if(tokens) {
        console.log(sweet.expand(file))
    } else {
        console.log(sweet.compile(file));
    }
};
