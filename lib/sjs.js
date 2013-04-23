var fs = require("fs");

var sweet = require("./sweet.js");

var argv = require("optimist")
            .usage("Usage: sjs [options] path/to/file.js")
            .demand(1)
            .alias('o', 'output')
            .describe('o', 'Output file path')
            .alias('w', 'watch')
            .describe('w', 'watch a file')
            .boolean('watch')
            .alias('t', 'tokens')
            .describe('t', 'just emit the expanded tokens without parsing an AST')
            .argv;

exports.run = function() {
    var infile = argv._[0];
    var outfile = argv.output;
    var watch = argv.watch;
    var tokens = argv.tokens;
    var file = fs.readFileSync(infile, "utf8");

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
       fs.writeFileSync(outfile, sweet.compile(file), "utf8");
    } else if(tokens) {
        console.log(sweet.expand(file))
    } else {
        console.log(sweet.compile(file));
    }
};
