var parser = require("./lib/parser");
var expander = require("./lib/expander");
var sweet = require("./lib/sweet");
var Benchmark = require("benchmark");

var suite = new Benchmark.Suite;



function dup(code, n) {
	var tmp = "";
	for(var i = 0; i < n; i++) {
		tmp += code;	
	}
	return tmp;
}

var MAX = 25;

var identDeclCode = {};
var identCode = {}

function stepBy(start, by, max, f) {
	for(var i = start; i <= max; i += by) {
		f(i);
	}
}

suite.add("(expand) empty string", function() {
    var stx = parser.read("");
    var res = expander.expand(stx);
})


stepBy(0, 5, MAX, function(i) {
	identDeclCode[i] = dup("var x;", i);
	identCode[i] = dup("x + 2;", i);

	suite.add("(expand) simple idents - " + i, function() {
	    var stx = parser.read(identCode[i]);
	    var res = expander.expand(stx);
	});
});

stepBy(0, 5, MAX, function(i) {
	suite.add("(expand+parse) simple idents - " + i, function() {
	    var res = sweet.parse(identCode[i]);
	});
});

stepBy(0, 5, MAX, function(i) {
	suite.add("(expand) var idents - " + i, function() {
	    var stx = parser.read(identDeclCode[i]);
	    var res = expander.expand(stx);
	});
});

stepBy(0, 5, MAX, function(i) {
	suite.add("(expand+parse) var idents - " + i, function() {
	    var res = sweet.parse(identDeclCode[i]);
	});
});


suite.on('cycle', function(event) {
    console.log(String(event.target));
}).run({'async': true});
