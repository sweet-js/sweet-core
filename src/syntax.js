import { List } from "immutable";
import { Symbol } from "./symbol";
import { assert } from "./errors";
import BindingMap from "./binding-map";
import { Maybe } from "ramda-fantasy";
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

import { TokenType, TokenClass } from "shift-parser/dist/tokenizer";

export function makeString(value, ctx) {
  let bindings = ctx && ctx.context && ctx.context.bindings ? ctx.context.bindings : undefined;
  let scopeset = ctx && ctx.context && ctx.context.scopeset ? ctx.context.scopeset : undefined;
  return new Syntax({
    type: TokenType.STRING,
    str: value
  }, bindings, scopeset);
}

export function makeIdentifier(value, ctx) {
  let bindings = ctx && ctx.context && ctx.context.bindings ? ctx.context.bindings : undefined;
  let scopeset = ctx && ctx.context && ctx.context.scopeset ? ctx.context.scopeset : undefined;
  return new Syntax({
    type: TokenType.IDENTIFIER,
    value: value
  }, bindings, scopeset);
}

function sizeDecending(a, b) {
  if (a.scopes.size > b.scopes.size) {
    return -1;
  } else if (b.scopes.size > a.scopes.size) {
    return 1;
  } else {
    return 0;
  }
}

export default class Syntax {
  // (Token or List<Syntax>, List<Scope>) -> Syntax
  constructor(token, bindings = new BindingMap(), scopeset = List()) {
    this.token = token;
    this.context = {
      scopeset: scopeset,
      bindings: bindings
    };
  }

  // () -> string
  resolve() {
    if (this.context.scopeset.size === 0 || !(this.isIdentifier() || this.isKeyword())) {
      return this.token.value;
    }
    let scope = this.context.scopeset.last();
    let stxScopes = this.context.scopeset;
    let bindings = this.context.bindings;
    if (scope) {
      // List<{ scopes: List<Scope>, binding: Symbol }>
      let scopesetBindingList = bindings.get(this);

      if (scopesetBindingList) {
        // { scopes: List<Scope>, binding: Symbol }
        let biggestBindingPair = scopesetBindingList.filter(({scopes, binding}) => {
          return scopes.isSubset(stxScopes);
        }).sort(sizeDecending);

        if (biggestBindingPair.size >= 2 &&
            biggestBindingPair.get(0).scopes.size === biggestBindingPair.get(1).scopes.size) {
          let debugBase = '{' + stxScopes.map(s => s.toString()).join(', ') + '}';
          let debugAmbigousScopesets = biggestBindingPair.map(({scopes}) => {
            return '{' + scopes.map(s => s.toString()).join(', ') + '}';
          }).join(', ');
          throw new Error('Scopeset ' + debugBase + ' has ambiguous subsets ' + debugAmbigousScopesets);
        } else if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (Maybe.isJust(biggestBindingPair.get(0).alias)) {
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve();
          }
          return bindingStr;
          // if (Maybe.isJust(biggestBindingPair.get(0).alias)) {
          //   return biggestBindingPair.get(0).alias.just().resolve();
          // }
          // return ;
        }
      }
    }
    return this.token.value;
  }

  val() {
    assert(!this.isDelimiter(), "cannot get the val of a delimiter");
    if (this.isStringLiteral()) {
      return this.token.str;
    }
    return this.token.value;
  }

  lineNumber() {
    if (!this.isDelimiter()) {
      return this.token.slice.startLocation.line;
    } else {
      // TODO: this is the start of the delimiter...correct?
      return this.token.get(0).lineNumber();
    }
  }

  // () -> List<Syntax>
  inner() {
    assert(this.isDelimiter(), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }

  addScope(scope, bindings, options = { flip: false }) {
    let token = this.isDelimiter() ? this.token.map(s => s.addScope(scope, bindings, options)) : this.token;
    let newScopeset;
    // TODO: clean this logic up
    if (options.flip) {
      let index = this.context.scopeset.indexOf(scope);
      if (index !== -1) {
        newScopeset = this.context.scopeset.remove(index);
      } else {
        newScopeset = this.context.scopeset.push(scope);
      }
    } else {
      newScopeset = this.context.scopeset.push(scope);
    }
    return new Syntax(token, bindings, newScopeset);
  }
  removeScope(scope) {
    let token = this.isDelimiter() ? this.token.map(s => s.removeScope(scope)) : this.token;
    let newScopeset = this.context.scopeset;
    let index = this.context.scopeset.indexOf(scope);
    if (index !== -1) {
      newScopeset = this.context.scopeset.remove(index);
    }
    return new Syntax(token, this.context.bindings, newScopeset);
  }

  isIdentifier() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.Ident;
  }

  isBooleanLiteral() {
    return !this.isDelimiter() && this.token.type === TokenType.TRUE ||
           this.token.type === TokenType.FALSE;
  }

  isKeyword() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.Keyword;
  }

  isNullLiteral() {
    return !this.isDelimiter() && this.token.type === TokenType.NULL;
  }

  isNumericLiteral() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.NumericLiteral;
  }

  isPunctuator() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.Punctuator;
  }

  isStringLiteral() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.StringLiteral;
  }

  isRegularExpression() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.RegularExpression;
  }

  isTemplate() {
    return !this.isDelimiter() && this.token.type === TokenType.TEMPLATE;
  }

  isDelimiter() {
    return List.isList(this.token);
  }

  isParenDelimiter() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LPAREN;
  }

  isCurlyDelimiter() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LBRACE;
  }

  isSquareDelimiter() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LBRACK;
  }

  isEOF() {
    return !this.isDelimiter() && this.token.type === TokenType.EOS;
  }

  toString() {
    if (this.isDelimiter()) {
      return this.token.map(s => s.toString()).join(" ");
    }
    if (this.isStringLiteral()) {
      return "'" + this.token.str;
    }
    return this.token.value;
  }
}
