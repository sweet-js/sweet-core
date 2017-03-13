export function expect(cond, message, offendingSyntax, rest) {
  if (!cond) {
    let ctx = '';
    if (rest) {
      ctx = rest
        .slice(0, 20)
        .map(s => {
          let val = s.isDelimiter() ? '( ... )' : s.val();
          if (s === offendingSyntax) {
            return '__' + val + '__';
          }
          return val;
        })
        .join(' ');
    }
    throw new Error('[error]: ' + message + '\n' + ctx);
  }
}

export function assert(cond, message) {
  if (!cond) {
    throw new Error('[assertion error]: ' + message);
  }
}
