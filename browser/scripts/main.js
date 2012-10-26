require(["sweet","./parser", "./expander"], function(sweet, parser, expander) {
  window.run = function() {
      var code = document.getElementById("sweetjs").text;
      // var result = expander.enforest(parser.read(code));
      // var result = expander.expandf(parser.read(code));
      var result = expander.expand(parser.read(code));
      console.log(result);
  }
});