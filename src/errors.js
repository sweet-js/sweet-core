export function expect(cond, message, offendingSyntax, rest) {
  if (!cond) {
    let ctx = "";
    if (rest) {
      let ctx = rest.slice(0, 20).map(s => {
        if (s === offendingSyntax) {
          return "__" + s.val() + "__";
        }
        return s.val();
      }).join(" ");
    }
    throw new Error("[error]: " + message + "\n" + ctx);
  }
}

export function assert(cond, message) {
  if (!cond) {
    throw new Error("[assertion error]: " + message);
  }
}
