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

export let Types = {
  // types
  null: {
		match: token => !Types.delimiter.match(token) && token.type === TokenType.NULL,
    create: (value, stx) => new Syntax({
      type: TokenType.NULL,
      value: null
    }, stx.context)
  },
  number: {
    match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.NumericLiteral,
    create: (value, stx) => new Syntax({
      type: TokenType.NUMBER,
      value
    }, stx.context)
  }
  string: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.StringLiteral,
    create: (value, stx) => new Syntax({
      type: TokenType.STRING,
      str: value
    }, stx.context)
  },
  punctuator: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Punctuator,
    create: (value, stx) => new Syntax({
      type: {
        klass: TokenClass.Punctuator,
        name: value
      },
      value
    }, stx.context)
  },
  keyword: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Keyword,
    create: (value, stx) => new Syntax({
      type: {
        klass: TokenClass.Keyword,
        name: value
      },
      value
    }, stx.context)
  },
  identifier: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Ident,
    create: (value, stx) => new Syntax({
      type: TokenType.IDENTIFIER,
      value
    }, stx.context)
  },
  regularExpression: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.RegularExpression,
    create: (value, stx) => new Syntax({
      type: TokenType.REGEXP,
      value
    }, stx.context)
  },
  braces: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LBRACE,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LBRACE,
        value: "{"
      })
      let right = new Syntax({
        type: TokenType.RBRACE,
        value: "}"
      })
      return new Syntax(List.of(left).concat(inner).push(right), stx.context)
    }
  },
  brackets: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LBRACK,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LBRACK,
        value: "["
      })
      let right = new Syntax({
        type: TokenType.RBRACK,
        value: "]"
      })
      return new Syntax(List.of(left).concat(inner).push(right), stx.context)
    }
  },
  parens: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LPAREN,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LPAREN,
        value: "("
      })
      let right = new Syntax({
        type: TokenType.RPAREN,
        value: ")"
      })
      return new Syntax(List.of(left).concat(inner).push(right), stx.context)
    }
  },
  
  assign: {
    match: token => {
      if (Types.punctuator.match(token)) {
        switch (token.value) {
          case "=":
          case "|=":
          case "^=":
          case "&=":
          case "<<=":
          case ">>=":
          case ">>>=":
          case "+=":
          case "-=":
          case "*=":
          case "/=":
          case "%=":
            return true;
          default:
            return false;
        }
      }
      return false;
    }
  },
  
  boolean: {
    match: token => !Types.delimiter.match(token) && token.type === TokenType.TRUE ||
           token.type === TokenType.FALSE
  },
  
  template: {
    match: token => !Types.delimiter.match(token) && token.type === TokenType.TEMPLATE
  },

  delimiter: {
    match: token => List.isList(token)
  },

  syntaxTemplate: {
    match: token => Types.delimiter.match(token) && token.get(0).val() === '#`'
  },

  eof: {
    match: token => !Types.delimiter.match(token) && token.type === TokenType.EOS
  },
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
  
  static from(type, value, stx = {}) {
    if (!Types[type]) {
      throw new Error(type + " is not a valid type")
    }
    else if (!Types[type].create) {
      throw new Error("Cannot create a syntax from type " + type)
    }
    return Types[type].create(value, stx)
  }

  // () -> string
  resolve() {
    if (this.context.scopeset.size === 0 || !(this.match("identifier") || this.match("keyword"))) {
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
    assert(!this.match("delimiter"), "cannot get the val of a delimiter");
    if (this.match("string")) {
      return this.token.str;
    }
    if (this.match("template")) {
      return this.token.items.map(el => {
        if (el instanceof Syntax && el.match("delimiter")) {
          return '${...}';
        }
        return el.slice.text;
      }).join('');
    }
    return this.token.value;
  }

  lineNumber() {
    if (!this.match("delimiter")) {
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
    assert(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }

  addScope(scope, bindings, options = { flip: false }) {
    let token = this.match("delimiter") ? this.token.map(s => s.addScope(scope, bindings, options)) : this.token;
    if (this.match("template")) {
      token = {
        type: this.token.type,
        items: token.items.map(it => {
          if (it instanceof Syntax && it.match("delimiter")) {
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
    let token = this.match("delimiter") ? this.token.map(s => s.removeScope(scope)) : this.token;
    let newScopeset = this.context.scopeset;
    let index = this.context.scopeset.indexOf(scope);
    if (index !== -1) {
      newScopeset = this.context.scopeset.remove(index);
    }
    return new Syntax(token, { bindings: this.context.bindings, scopeset: newScopeset} );
  }

  match(type, value) {
    if (!Types[type]) {
      throw new Error(type + " is an invalid type")
    }
    return Types[type].match(this.token) && (value == null ||
      value instanceof RegExp ? value.test(this.val()) : this.val() == value)
  }

  toString() {
    if (this.match("delimiter")) {
      return this.token.map(s => s.toString()).join(" ");
    }
    if (this.match("string")) {
      return "'" + this.token.str;
    }
    if (this.match("template")) {
      return this.val();
    }
    return this.token.value;
  }
}
