require(["sweet"], function(sweet) {
  var code = document.getElementById("sweetjs").text;
  var result = sweet.compile(code);
  console.log(result);
});