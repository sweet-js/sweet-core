import MapSyntaxReducer from "./map-syntax-reducer";
import reducer from "shift-reducer";
import { List } from 'immutable';
import { Enforester } from './enforester';
import Syntax, { ALL_PHASES } from './syntax';
import * as _ from 'ramda';
import { Maybe } from 'ramda-fantasy';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

const symWrap = Symbol('wrapper');
const symName = Symbol('name');
const symEnf = Symbol('enforester');
const symResetVals = Symbol('resetVals');
const symShadow = Symbol('shadow');

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
    const { term, rest, prev, done} = this[symEnf] = enf;
    this[symResetVals] = { term, rest, prev, done };
    this[symShadow] = { term, rest, prev };
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

  reset() {
    let reset = this[symResetVals],
        { term, prev, rest } = reset;
    Object.assign(this[symShadow], { term, prev, rest });
    Object.assign(this[symEnf], reset);
  }

  next(type = 'Syntax') {
    let enf = this[symEnf];
    if (enf.rest.size === 0) {
      return {
        done: true,
        value: null,
      };
    }
    let value;
    switch(type) {
      case 'AssignmentExpression':
      case 'expr':
        value = enf.enforestExpressionLoop();
        break;
      case 'Expression':
        value = enf.enforestExpression();
        break;
      case 'Syntax':
        value = enf.advance();
        if (!this.noScopes) {
          value = value
            .addScope(this.useScope, this.context.bindings, ALL_PHASES)
            .addScope(this.introducedScope, this.context.bindings, ALL_PHASES, { flip: true });
        }
        break;
      default:
        throw new Error('Unknown term type: ' + type);
    }

    Object.assign(this[symShadow], advance(enf, this[symShadow]));
    return {
      done: false,
      value: new SyntaxOrTermWrapper(value, this.context),
    };
  }

  prev() {
    let shadow = this[symShadow];
    let resetRestCount = this[symResetVals].rest.size;
    if(resetRestCount > shadow.rest.size) {
      let enf = this[symEnf];
      Object.assign(shadow, recede(shadow));
      Object.assign(this[symEnf], { term: null, rest: shadow.rest });
      if(resetRestCount > shadow.rest.size) {
        return {
          done: false,
          value: new SyntaxOrTermWrapper(shadow.term, this.context)
        };
      }
    }
    return {
      done: true,
      value: null
    };
  }
}

const advance = (enf, { term, prev, rest }) => {
  //TODO: optimize for type === 'Syntax'?
  let numConsumed = rest.size - enf.rest.size;
  return {
    term: rest.get(numConsumed-1),
    prev: prev.push(term).concat(rest.slice(0, numConsumed-1)),
    rest: enf.rest
  };
};

const recede = ({ term, prev, rest }) => {
  return {
    term: prev.last(),
    prev: prev.butLast(),
    rest: rest.unshift(term)
  };
};
