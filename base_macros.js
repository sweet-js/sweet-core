defmacro syntax_fmt "(){}" {
  function syn(stx) {
    // var syntaxKeyword = syntax { syntax };
    // var syntaxBody = syntax { {} }

    // var pattern = stx[0];
    // var replace = stx[1];
    // var idx = 0;

    // pattern.forEach(function(val) {
    //   if(val.value === "#") {
    //     return replace[idx++];
    //   } else {
    //     return val;
    //   }
    // })

    // syntaxBody.inner = formatted;

    return syntax { [] }; //[syntaxKeyword, syntaxBody]
  }
}