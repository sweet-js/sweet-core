require(["sweet"], function(sweet) {
  window.sweeten = (function(){
    var textAreas = document.getElementsByClassName("editor");
    var editors = []
    for(var i=0; i < textAreas.length; i++){
      var editor = CodeMirror.fromTextArea(textAreas[i], {
        lineNumbers:true,
        // matchBrackets: true,
        mode: "javascript"
      });
      editor.setOption("theme", "sweetprism");
      editors[i+1] = editor;
    }


    return function (nb) {
        var console = document.getElementById("output-" + nb);
        console.style.display = "block";
        try {
          var editor = editors[nb];
          
          var result = sweet.compile(editor.getValue());
          //console.log(editor.value);
          //console.log(result);
          CodeMirror.runMode(result, "javascript", console);
        } catch(e) {
          console.innerHTML = e;
        }
      }
  })();
});