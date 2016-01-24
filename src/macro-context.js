import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";
import { List } from 'immutable';
import { Enforester } from './enforester';

export default class MacroContext {
  constructor(enf, name, context, useScope, introducedScope) {
    // todo: perhaps replace with a symbol to keep mostly private?
    this._enf = enf;
    this.name = name;
    this.context = context;
    if (this.useScope && this.introducedScope) {
      this.useScope = useScope;
      this.introducedScope = introducedScope;
    } else {
      this.noScopes = true;
    }
  }

  makeSubContext(stxl) {
    let enf;
    if (List.isList(stxl)) {
      enf = new Enforester(stxl, List(), this.context);
    } else if (stxl && typeof stxl.isDelimiter === 'function' && stxl.isDelimiter()) {
      enf = new Enforester(stxl.inner(), List(), this.context);
    } else {
      throw new Error('Cannot create a subcontext for unknown syntax type: ' + stxl);
    }
    return new MacroContext(enf, this.name, this.context);
  }

  next() {
    let stx = this._enf.advance();
    if (this.noScopes) { return stx; }
    return stx
      .addScope(this.useScope)
      .addScope(this.introducedScope, this.context.bindings, { flip: true });
  }

  nextExpression() {
    let term = this._enf.enforest("expression");
    if (this.noScopes) { return term; }
    return term
      .addScope(this.useScope, this.context.bindings)
      .addScope(this.introducedScope, this.context.bindings, { flip: true });
  }
}
