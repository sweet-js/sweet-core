require(["scripts/sweet.js"], function(sweet) {
  var code = document.getElementById("sweetjs").text;
  var result = sweet.parse(code);
  console.log(result);
});