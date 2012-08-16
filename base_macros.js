macro syntax_macro "(){}" {
  function syn(stx) {
    var s = syntax { syntax };
    var b = syntax { {} }
    b.inner = stx[0];

    return [s, b]
  }
}