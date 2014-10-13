/*
This file makes debugging sweet.js easier. Uses the built version of sweet.js
to compile "test.js". You can use node-inspector to step through the expansion
process:

	npm install -g node-inspector
	node-debug debug.js
*/
var parser = require("./lib/parser");
var expander = require("./lib/expander");
var patterns = require("./lib/patterns");
var sweet = require("./lib/sweet");
var codegen = require("escodegen");
 var _ = require("underscore");

 var y=[1,2,3];
y.map(function(i,k){
     
        if(i==2)
            {return i+1;}
     })

var fs = require("fs");
 modules =  [];
 //var stxcaseModule = fs.readFileSync("./macros/stxcase.js", 'utf8');

//stxcaseCtx = parser.read(stxcaseModule);


 //console.log(stxcaseCtx);
 //var stxcaseCtx1 = expander.expandModule(stxcaseCtx);

 
// _.each(stxcaseCtx1.env.__data, function(s) {
  
//     console.log(s.fullName[0].token.value);
     
//     fs.appendFile('output.txt', s.fullName[0].token.value +"=" + s.fn.prototype.constructor.toString(), function (err) {
//          if (err) throw err;
//          console.log('The "data to append" was appended to file!');
//        });
//     console.log(s.fn.prototype.constructor.toString());

//})

var source = fs.readFileSync("./test1.js", "utf8");

var tokenTree = parser.read(source);
var i=parser.syntaxParameter
//console.log(tokenTree);
//var body=codegen.generate(parser.parse(result));

var result = sweet.compile(source, {filename: "./test1.js"});
console.log(result)




///////////////////////////////////////////
//expander.expand(readTree, [stxcaseCtx].concat(modules), options);

//var result = expander.expandModule(tokenTree);

//var result = sweet.compile(source, {filename: "./test.js"});
//console.log(codegen.generate(parser.parse(result)));

//var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../macros');


// console.log(result);
//console.log(codegen.generate(parser.parse(result)));

