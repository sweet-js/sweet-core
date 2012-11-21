require(["sweet","./parser", "./expander"], function(sweet, parser, expander) {
    var read = parser.read;
    var expand = expander.expandf;
    var flatten = expander.flattenf;

    window.run = function() {

        var code = document.getElementById("sweetjs").text;
        var res = flatten(expand(read(code)));
        // var result = expander.enforest(parser.read(code));
        // var result = expander.expandf(parser.read(code));
        // var result = expander.expandf(parser.read(code));
        console.log(res);
    }
});