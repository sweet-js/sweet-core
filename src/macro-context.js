import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";

export default class MacroContext {
  constructor(enf, name, context, useScope, introducedScope) {
    // todo: perhaps replace with a symbol to keep mostly private?
    this._enf = enf;
    this.name = name;
    this.context = context;
    this.useScope = useScope;
    this.introducedScope = introducedScope;
  }

  next() {
    let stx = this._enf.advance();
    return stx
      .addScope(this.useScope)
      .addScope(this.introducedScope, this.context.bindings, { flip: true });
  }

  nextExpression() {
    let term = this._enf.enforest("expression");
    return term
      .addScope(this.useScope, this.context.bindings)
      .addScope(this.introducedScope, this.context.bindings, { flip: true });
  }
}
