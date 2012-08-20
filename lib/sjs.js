var fs = require("fs")

var parser = require("./sweet.js");
var gen = require("escodegen");

var argv = require("optimist")
            .usage("Usage: sjs [options] path/to/file.js")
            .demand(1)
            .alias('o', 'output')
            .describe('o', 'Output file path')
            .argv;

exports.run = function() {
    var infile = argv._[0];
    var outfile = argv.output;
    var file = fs.readFileSync(infile, "utf8");

    if(outfile) {
        fs.writeFileSync(outfile, gen.generate(parser.parse(file)), "utf8");
    } else {
        console.log(gen.generate(parser.parse(file)));
    }
};
