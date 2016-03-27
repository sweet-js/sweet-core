/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile "test.js". You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/

var compile = require("./build/src/sweet").compile;
var transform = require('babel-core').transform;
var moduleResolver = require('./build/src/node-module-resolver').default;
var moduleLoader = require('./build/src/node-module-loader').default;

var fs = require("fs");

var source = fs.readFileSync("./test.js", "utf8");

debugger;
var result = compile(source, {
	cwd: __dirname,
	transform: transform,
  moduleResolver: moduleResolver,
  moduleLoader: moduleLoader
});
console.log(result.code);
