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
const symName = Symbol('name');

const getLineNumber = t => {
  if (t instanceof Syntax) {
    return t.lineNumber();
  }
  throw new Error('Line numbers on terms not implemented yet');
};

const getVal = t => {
  if (t.match("delimiter")) {
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

  match(type, value) {
    let stx = this[symWrap];
    if (stx instanceof Syntax) {
      return stx.match(type, value);
    }
  }
  
  isIdentifier(value) {
    return this.match("identifier", value);
  }

  isAssign(value) {
    return this.match("assign", value);
  }

  isBooleanLiteral(value) {
    return this.match("boolean", value);
  }

  isKeyword(value) {
    return this.match("keyword", value);
  }

  isNullLiteral(value) {
    return this.match("null", value);
  }

  isNumericLiteral(value) {
    return this.match("number", value);
  }

  isPunctuator(value) {
    return this.match("punctuator", value);
  }

  isStringLiteral(value) {
    return this.match("string", value);
  }

  isRegularExpression(value) {
    return this.match("regularExpression", value);
  }

  isTemplate(value) {
    return this.match("template", value);
  }

  isDelimiter(value) {
    return this.match("delimiter", value);
  }

  isParens(value) {
    return this.match("parens", value);
  }

  isBraces(value) {
    return this.match("braces", value);
  }

  isBrackets(value) {
    return this.match("brackets", value);
  }

  isSyntaxTemplate(value) {
    return this.match("syntaxTemplate", value);
  }

  isEOF(value) {
    return this.match("eof", value);
  }

  lineNumber() {
    return getLineNumber(this[symWrap]);
  }

  val() {
    return getVal(this[symWrap]);
  }

  inner() {
    let stx = this[symWrap];
    if (!stx.match("delimiter")) {
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
    this[symName] = name;
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

  name() {
    return new SyntaxOrTermWrapper(this[symName], this.context);
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
            .addScope(this.useScope, this.context.bindings, this.context.phase)
            .addScope(this.introducedScope, this.context.bindings, this.context.phase, { flip: true });
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
