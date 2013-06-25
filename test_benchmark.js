var parser = require("../lib/parser");
var expander = require("../lib/expander");
var Benchmark = require("benchmark");

var suite = new Benchmark.Suite;



function dup(code, n) {
	var tmp = "";
	for(var i = 0; i < n; i++) {
		tmp += code;	
	}
	return tmp;
}

var identCode = {};

function stepBy(start, by, max, f) {
	for(var i = start; i <= max; i += by) {
		f(i);
	}
}

suite.add("(expand) empty string", function() {
    var stx = parser.read("");
    var res = expander.expand(stx);
})

stepBy(0, 5, 20, function(i) {
	identCode[i] = dup("var x;", i);
	suite.add("(expand) var idents - " + i, function() {
	    var stx = parser.read(identCode[i]);
	    var res = expander.expand(stx);
	});
})

suite.on('cycle', function(event) {
    console.log(String(event.target));
}).run({'async': true});
