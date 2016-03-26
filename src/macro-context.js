import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";
import { List } from 'immutable';
import { Enforester } from './enforester';
import Syntax from './syntax';
import * as _ from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

const symWrap = Symbol('wrapper');

const isKind = _.curry((kind, t, v) => {
  if (t instanceof Syntax) {
    return t[kind]() && (v == null || t.val() == v);
  }
});

const isKeyword = isKind('isKeyword');
const isIdentifier = isKind('isIdentifier');
const isNumericLiteral = isKind('isNumericLiteral');
const isStringLiteral = isKind('isStringLiteral');
const isNullLiteral = isKind('isNullLiteral');
const isPunctuator = isKind('isPunctuator');
const isRegularExpression = isKind('isRegularExpression');
const isBraces = isKind('isBraces');
const isBrackets = isKind('isBrackets');
const isParens = isKind('isParens');
const isDelimiter = isKind('isDelimiter');

const getLineNumber = t => {
  if (t instanceof Syntax) {
    return t.lineNumber();
  }
  throw new Error('Line numbers on terms not implemented yet');
};

const getVal = t => {
  if (isDelimiter(t, null)) {
    return null;
  }
  if (t instanceof Syntax) {
    return t.val();
  }
  return null;
};

export class SyntaxOrTermWrapper {
  constructor(s, context = {}) {
    this[symWrap] = s;
    this.context = context;
  }

  isKeyword(value) {
    return isKeyword(this[symWrap], value);
  }

  isIdentifier(value) {
    return isIdentifier(this[symWrap], value);
  }

  isNumericLiteral(value) {
    return isNumericLiteral(this[symWrap], value);
  }

  isStringLiteral(value) {
    return isStringLiteral(this[symWrap], value);
  }

  isNullLiteral(value) {
    return isNullLiteral(this[symWrap], value);
  }

  isPunctuator(value) {
    return isPunctuator(this[symWrap], value);
  }

  isRegularExpression(value) {
    return isRegularExpression(this[symWrap], value);
  }

  isBraces(value) {
    return isBraces(this[symWrap], value);
  }

  isBrackets(value) {
    return isBrackets(this[symWrap], value);
  }

  isParens(value) {
    return isParens(this[symWrap], value);
  }

  isDelimiter(value) {
    return isDelimiter(this[symWrap], value);
  }

  lineNumber() {
    return getLineNumber(this[symWrap]);
  }

  val() {
    return getVal(this[symWrap]);
  }

  inner() {
    let stx = this[symWrap];
    if (!isDelimiter(stx, null)) {
      throw new Error('Can only get inner syntax on a delimiter');
    }

    let enf = new Enforester(stx.inner(), List(), this.context);
    return new MacroContext(enf, 'inner', this.context);
  }
}

export function unwrap(x) {
  if (x instanceof SyntaxOrTermWrapper) {
    return x[symWrap];
  }
  return x;
}

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
      value: new SyntaxOrTermWrapper(value, this.context),
    };
  }
}
