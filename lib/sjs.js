var fs = require("fs")

var parser = require("./sweet.js");
var gen = require("escodegen");

exports.run = function(fname) {
    var file = fs.readFileSync("src/sweet.js", "utf8");
    console.log(gen.generate(parser.parse(file)));
};
