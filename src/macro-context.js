import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";
import { List } from 'immutable';
import { Enforester } from './enforester';

/*
ctx :: {
  of: (Syntax) -> ctx
  next: (String) -> Syntax or Term
}
*/
export default class MacroContext {
  constructor(enf, name, context, useScope, introducedScope) {
    // todo: perhaps replace with a symbol to keep mostly private?
    this._enf = enf;
    this.name = name;
    this.context = context;
    if (useScope && introducedScope) {
      this.noScopes = false;
      this.useScope = useScope;
      this.introducedScope = introducedScope;
    } else {
      this.noScopes = true;
    }
    this[Symbol.iterator] = () => this;
  }

  next(type = 'Syntax') {
    if (this._enf.rest.size === 0) {
      return {
        done: true,
        value: null,
      };
    }
    let value;
    switch(type) {
      case 'AssignmentExpression':
      case 'expr':
        value = this._enf.enforestExpressionLoop();
        break;
      case 'Expression':
        value = this._enf.enforestExpression();
        break;
      case 'Syntax':
        value = this._enf.advance();
        if (!this.noScopes) {
          value = value
            .addScope(this.useScope)
            .addScope(this.introducedScope, this.context.bindings, { flip: true });
        }
        break;
      default:
        throw new Error('Unknown term type: ' + type);
    }
    return {
      done: false,
      value: value,
    };
  }

  of(syn) {
    let enf;
    if (List.isList(syn)) {
      enf = new Enforester(syn, List(), this.context);
    } else if (syn && typeof syn.isDelimiter === 'function' && syn.isDelimiter()) {
      enf = new Enforester(syn.inner(), List(), this.context);
    } else {
      throw new Error('Cannot create a subcontext for unknown syntax type: ' + syn);
    }
    return new MacroContext(enf, this.name, this.context);
  }
}
