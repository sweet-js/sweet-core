/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile "test.js". You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/

var compile = require("./build/src/sweet").compile;

var fs = require("fs");

var source = fs.readFileSync("./test.js", "utf8");

var result = compile(source, __dirname);
console.log(result.code);
