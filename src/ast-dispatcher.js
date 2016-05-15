export default class ASTDispatcher {
  constructor(prefix, errorIfMissing) {
    this.errorIfMissing = errorIfMissing;
    this.prefix = prefix;
  }

  dispatch(term) {
    let field = this.prefix + term.type;
    if (typeof this[field] === 'function') {
      return this[field](term);
    } else if (!this.errorIfMissing) {
      return term;
    }
    throw new Error(`Missing implementation for: ${field}`);
  }
}
