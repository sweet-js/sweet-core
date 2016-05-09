import { List } from "immutable";
import { assert } from "./errors";
import BindingMap from "./binding-map";
import { Maybe } from "ramda-fantasy";
import * as _ from 'ramda';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

import { TokenType, TokenClass } from "shift-parser/dist/tokenizer";

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
  constructor(token, context = {bindings: new BindingMap(), scopeset: List()}) {
    this.token = token;
    this.context = {
      bindings: context.bindings,
      scopeset: context.scopeset
    };
    Object.freeze(this.context);
    Object.freeze(this);
  }

  static of(token, stx = {}) {
    return new Syntax(token, stx.context);
  }

  static fromNull(stx = {}) {
    return new Syntax({
      type: TokenType.NULL,
      value: null
    }, stx.context);
  }

  static fromNumber(value, stx = {}) {
    return new Syntax({
      type: TokenType.NUMBER,
      value: value
    }, stx.context);
  }

  static fromString(value, stx = {}) {
    return new Syntax({
      type: TokenType.STRING,
      str: value
    }, stx.context);
  }

  static fromPunctuator(value, stx = {}) {
    return new Syntax({
      type: {
        klass: TokenClass.Punctuator,
        name: value
      },
      value: value
    }, stx.context);
  }

  static fromKeyword(value, stx = {}) {
    return new Syntax({
      type: {
        klass: TokenClass.Keyword,
        name: value
      },
      value: value
    }, stx.context);
  }

  static fromIdentifier(value, stx = {}) {
    return new Syntax({
      type: TokenType.IDENTIFIER,
      value: value
    }, stx.context);
  }

  static fromRegularExpression(value, stx = {}) {
    return new Syntax({
      type: TokenType.REGEXP,
      value: value
    }, stx.context);
  }

  static fromBraces(inner, stx = {}) {
    let left = new Syntax({
      type: TokenType.LBRACE,
      value: "{"
    });
    let right = new Syntax({
      type: TokenType.RBRACE,
      value: "}"
    });
    return new Syntax(List.of(left).concat(inner).push(right), stx.context);
  }

  static fromBrackets(inner, stx = {}) {
    let left = new Syntax({
      type: TokenType.LBRACK,
      value: "["
    });
    let right = new Syntax({
      type: TokenType.RBRACK,
      value: "]"
    });
    return new Syntax(List.of(left).concat(inner).push(right), stx.context);
  }

  static fromParens(inner, stx = {}) {
    let left = new Syntax({
      type: TokenType.LPAREN,
      value: "("
    });
    let right = new Syntax({
      type: TokenType.RPAREN,
      value: ")"
    });
    return new Syntax(List.of(left).concat(inner).push(right), stx.context);
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
            // null never happens because we just checked if it is a Just
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
    if (this.isTemplate()) {
      return this.token.items.map(el => {
        if (el instanceof Syntax && el.isDelimiter()) {
          return '${...}';
        }
        return el.slice.text;
      }).join('');
    }
    return this.token.value;
  }

  lineNumber() {
    if (!this.isDelimiter()) {
      return this.token.slice.startLocation.line;
    } else {
      return this.token.get(0).lineNumber();
    }
  }

  setLineNumber(line) {
    let newTok = {};
    if (this.isDelimiter()) {
      newTok = this.token.map(s => s.setLineNumber(line));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok[key] = this.token[key];
      }
      assert(newTok.slice && newTok.slice.startLocation, 'all tokens must have line info');
      newTok.slice.startLocation.line = line;
    }
    return new Syntax(newTok, this.context);
  }

  // () -> List<Syntax>
  inner() {
    assert(this.isDelimiter(), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }

  addScope(scope, bindings, options = { flip: false }) {
    let token = this.isDelimiter() ? this.token.map(s => s.addScope(scope, bindings, options)) : this.token;
    if (this.isTemplate()) {
      token = {
        type: this.token.type,
        items: token.items.map(it => {
          if (it instanceof Syntax && it.isDelimiter()) {
            return it.addScope(scope, bindings, options);
          }
          return it;
        })
      };
    }
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
    return new Syntax(token, {bindings: bindings, scopeset: newScopeset});
  }
  removeScope(scope) {
    let token = this.isDelimiter() ? this.token.map(s => s.removeScope(scope)) : this.token;
    let newScopeset = this.context.scopeset;
    let index = this.context.scopeset.indexOf(scope);
    if (index !== -1) {
      newScopeset = this.context.scopeset.remove(index);
    }
    return new Syntax(token, { bindings: this.context.bindings, scopeset: newScopeset} );
  }

  isIdentifier() {
    return !this.isDelimiter() && this.token.type.klass === TokenClass.Ident;
  }

  isAssign() {
    return !this.isDelimiter() && this.token.type === TokenType.ASSIGN;
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

  isParens() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LPAREN;
  }

  isBraces() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LBRACE;
  }

  isBrackets() {
    return this.isDelimiter() &&
           this.token.get(0).token.type === TokenType.LBRACK;
  }

  isSyntaxTemplate() {
    return this.isDelimiter() && this.token.get(0).val() === '#`';
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
    if (this.isTemplate()) {
      return this.val();
    }
    return this.token.value;
  }
}
