var parse = require("./build/src/sweet.js").parse;
var readFile = require("fs").readFileSync;
var moduleResolver = require('./build/src/node-module-resolver').default;
var moduleLoader = require('./build/src/node-module-loader').default;
var transform = require('babel-core').transform;

console.log(JSON.stringify(parse(readFile("test.js", "utf8"), {
  cwd: __dirname,
	transform: transform,
	filename: './test.js',
  moduleResolver: moduleResolver,
  moduleLoader: moduleLoader
}), null, 2));
