var fs = require("fs");

var sweet = require("./sweet.js");
var codegen = require("escodegen");

var argv = require("optimist")
            .usage("Usage: sjs [options] path/to/file.js")
            .demand(1)
            .alias('o', 'output')
            .describe('o', 'Output file path')
            .alias('watch', 'w')
            .describe('watch', 'watch a file')
            .boolean('watch')
            .argv;

exports.run = function() {
    var infile = argv._[0];
    var outfile = argv.output;
    var watch = argv.watch;
    var file = fs.readFileSync(infile, "utf8");

	if (watch && outfile){
		fs.watch(infile, function(){
			file = fs.readFileSync(infile, "utf8");
			fs.writeFileSync(outfile, codegen.generate(sweet.parse(file)), "utf8");
		});
	} else if(outfile) {
       fs.writeFileSync(outfile, codegen.generate(sweet.parse(file)), "utf8");
    } else {
        console.log(codegen.generate(sweet.parse(file)));
    }
};
