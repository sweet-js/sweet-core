export default class ASTDispatcher {
  constructor(errorIfMissing) {
    this.errorIfMissing = errorIfMissing;
  }

  dispatch(term) {
    let field = `expand${term.type}`;
    if (typeof this[field] === 'function') {
      return this[field](term);
    } else if (!this.errorIfMissing) {
      return term;
    }
    throw new Error(`Missing implementation for: ${field}`);
  }
}
