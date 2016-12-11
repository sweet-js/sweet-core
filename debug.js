'use strict';
/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile 'test.js'. You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/

require('babel-register');
var compile = require('./src/sweet-loader.js').default;

debugger;

let mod = compile('./test.js');
console.log(mod.codegen());
