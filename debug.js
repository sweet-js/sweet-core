/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile "test.js". You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/

var parser = require("./build/lib/parser");
var expander = require("./build/lib/expander");
var patterns = require("./build/lib/patterns");
var sweet = require("./build/lib/sweet");
var codegen = require("escodegen");

var fs = require("fs");

var source = fs.readFileSync("./test.js", "utf8");

var tokenTree = parser.read(source);
var result = expander.expand(tokenTree);

// console.log(result);
console.log(codegen.generate(parser.parse(result)));
