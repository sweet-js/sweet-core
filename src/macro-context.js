import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";
import { List } from 'immutable';
import { Enforester } from './enforester';

const iterMap = new WeakMap();

/*
ctx :: {
  of: (Syntax) -> ctx
  syntax: () -> Iterator
  getTerm: (Iterator, String) -> Term
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
  }

  syntax() {
    let enf = this._enf;
    let noScopes = this.noScopes;
    let useScope = this.useScope;
    let introducedScope = this.introducedScope;
    let context = this.context;
    let iter = {
      next: function() {
        if (enf.rest.size === 0) {
          return {
            done: true,
            value: null,
          };
        }
        let stx = enf.advance();
        if (!noScopes) {
          stx = stx
            .addScope(useScope)
            .addScope(introducedScope, context.bindings, { flip: true });
        }
        return {
          done: false,
          value: stx,
        };
      }
    };
    iter[Symbol.iterator] = function() { return iter; };
    iterMap.set(iter, enf);
    return iter;
  }
  of(syn) {
    let enf;
    if (List.isList(syn)) {
      enf = new Enforester(syn, List(), this.context);
    } else if (syn && typeof syn.isDelimiter === 'function' && syn.isDelimiter()) {
      enf = new Enforester(syn.inner(), List(), this.context);
    } else {
      throw new Error('Cannot create a subcontext for unknown syntax type: ' + stxl);
    }
    return new MacroContext(enf, this.name, this.context);
  }
  getTerm(iter, type) {
    let term;
    if (!iterMap.has(iter)) {
      throw new Error('unknown iterator');
    }
    let enf = iterMap.get(iter);
    switch(type) {
      case 'AssignmentExpression':
      case 'expr':
        term = enf.enforestExpressionLoop();
        break;
      case 'Expression':
        term = enf.enforestExpression();
        break;
      default:
        throw new Error('Unknown term type: ' + type);
    }
    if (!this.noScopes) {
      term = term
        .addScope(this.useScope, this.context.bindings)
        .addScope(this.introducedScope, this.context.bindings, { flip: true });
    }
    return term;
  }
}
