requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["sweet","./parser", "./expander"], function(sweet, parser, expander) {
    var read = parser.read;
    var expand = expander.expand;
    var flatten = expander.flatten;

    window.run = function() {

        var code = document.getElementById("sweetjs").text;
        var res = sweet.compile(code);
        var res = flatten(expand(read(code)));
        // var result = expander.enforest(parser.read(code));
        // var result = expander.expandf(parser.read(code));
        console.log(res);
        document.getElementById("out").innerHTML = res.join("\n");
    };
});