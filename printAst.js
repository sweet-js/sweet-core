var parse = require("./build/src/sweet.js").parse;
var readFile = require("fs").readFileSync;

console.log(JSON.stringify(parse(readFile("test.js", "utf8"), { cwd: __dirname }), null, 2));
