"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ASTDispatcher {
  constructor(prefix_16, errorIfMissing_17) {
    this.errorIfMissing = errorIfMissing_17;
    this.prefix = prefix_16;
  }
  dispatch(term_18) {
    let field_19 = this.prefix + term_18.type;
    if (typeof this[field_19] === "function") {
      return this[field_19](term_18);
    } else if (!this.errorIfMissing) {
      return term_18;
    }
    throw new Error(`Missing implementation for: ${ field_19 }`);
  }
}
exports.default = ASTDispatcher;