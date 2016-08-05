import { List, Map } from "immutable";
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
  null: {
    match: token => !Types.delimiter.match(token) && token.type === TokenType.NULL,
    create: (value, stx) => new Syntax({
      type: TokenType.NULL,
      value: null
    }, stx)
  },
  number: {
    match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.NumericLiteral,
    create: (value, stx) => new Syntax({
      type: TokenType.NUMBER,
      value
    }, stx)
  },
  string: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.StringLiteral,
    create: (value, stx) => new Syntax({
      type: TokenType.STRING,
      str: value
    }, stx)
  },
  punctuator: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Punctuator,
    create: (value, stx) => new Syntax({
      type: {
        klass: TokenClass.Punctuator,
        name: value
      },
      value
    }, stx)
  },
  keyword: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Keyword,
    create: (value, stx) => new Syntax({
      type: {
        klass: TokenClass.Keyword,
        name: value
      },
      value
    }, stx)
  },
  identifier: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.Ident,
    create: (value, stx) => new Syntax({
      type: TokenType.IDENTIFIER,
      value
    }, stx)
  },
  regularExpression: {
		match: token => !Types.delimiter.match(token) && token.type.klass === TokenClass.RegularExpression,
    create: (value, stx) => new Syntax({
      type: TokenType.REGEXP,
      value
    }, stx)
  },
  braces: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LBRACE,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LBRACE,
        value: "{"
      });
      let right = new Syntax({
        type: TokenType.RBRACE,
        value: "}"
      });
      return new Syntax(List.of(left).concat(inner).push(right), stx);
    }
  },
  brackets: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LBRACK,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LBRACK,
        value: "["
      });
      let right = new Syntax({
        type: TokenType.RBRACK,
        value: "]"
      });
      return new Syntax(List.of(left).concat(inner).push(right), stx);
    }
  },
  parens: {
		match: token => Types.delimiter.match(token) &&
           token.get(0).token.type === TokenType.LPAREN,
    create: (inner, stx) => {
      let left = new Syntax({
        type: TokenType.LPAREN,
        value: "("
      });
      let right = new Syntax({
        type: TokenType.RPAREN,
        value: ")"
      });
      return new Syntax(List.of(left).concat(inner).push(right), stx);
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
};
export const ALL_PHASES = {};

export default class Syntax {
  constructor(token, oldstx = {}) {
    this.token = token;
    this.bindings = oldstx.bindings != null ? oldstx.bindings : new BindingMap();
    this.scopesets = oldstx.scopesets != null ? oldstx.scopesets : {
      all: List(),
      phase: Map()
    };
    Object.freeze(this);
  }

  static of(token, stx = {}) {
    return new Syntax(token, stx);
  }

  static from(type, value, stx = {}) {
    if (!Types[type]) {
      throw new Error(type + " is not a valid type");
    }
    else if (!Types[type].create) {
      throw new Error("Cannot create a syntax from type " + type);
    }
    return Types[type].create(value, stx);
  }

  from(type, value) {
    return Syntax.from(type, value, this);
  }

  fromNull() {
    return this.from("null", null);
  }

  fromNumber(value) {
    return this.from('number', value);
  }

  fromString(value) {
    return this.from("string", value);
  }

  fromPunctuator(value) {
    return this.from("punctuator", value);
  }

  fromKeyword(value) {
    return this.from("keyword");
  }

  fromIdentifier(value) {
    return this.from("identifier", value);
  }

  fromRegularExpression(value) {
    return this.from("regularExpression", value);
  }

  fromBraces(inner) {
    return this.from("braces", inner);
  }

  fromBrackets(inner) {
    return this.from("brackets", inner);
  }

  fromParens(inner) {
    return this.from("parens", inner);
  }

  static fromNull(stx = {}) {
    return Syntax.from("null", null, stx);
  }

  static fromNumber(value, stx = {}) {
    return Syntax.from("number", value, stx);
  }

  static fromString(value, stx = {}) {
    return Syntax.from("string", value, stx);
  }

  static fromPunctuator(value, stx = {}) {
    return Syntax.from("punctuator", value, stx);
  }

  static fromKeyword(value, stx = {}) {
    return Syntax.from("keyword", value, stx);
  }

  static fromIdentifier(value, stx = {}) {
    return Syntax.from("identifier", value, stx);
  }

  static fromRegularExpression(value, stx = {}) {
    return Syntax.from("regularExpression", value, stx);
  }

  static fromBraces(inner, stx = {}) {
    return Syntax.from("braces", inner, stx);
  }

  static fromBrackets(inner, stx = {}) {
    return Syntax.from("brackets", inner, stx);
  }

  static fromParens(inner, stx = {}) {
    return Syntax.from("parens", inner, stx);
  }

  // () -> string
  resolve(phase) {
    assert(phase != null, "must provide a phase to resolve");
    let allScopes = this.scopesets.all;
    let stxScopes = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : List();
    stxScopes = allScopes.concat(stxScopes);
    if (stxScopes.size === 0 || !(this.match('identifier') || this.match('keyword'))) {
      return this.token.value;
    }
    let scope = stxScopes.last();
    let bindings = this.bindings;
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
            return biggestBindingPair.get(0).alias.getOrElse(null).resolve(phase);
          }
          return bindingStr;
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
        if (typeof el.match === 'function' && el.match("delimiter")) {
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
    return new Syntax(newTok, this);
  }

  // () -> List<Syntax>
  inner() {
    assert(this.match("delimiter"), "can only get the inner of a delimiter");
    return this.token.slice(1, this.token.size - 1);
  }

  addScope(scope, bindings, phase, options = { flip: false }) {
    let token = this.match('delimiter') ? this.token.map(s => s.addScope(scope, bindings, phase, options)) : this.token;
    if (this.match('template')) {
      token = {
        type: this.token.type,
        items: token.items.map(it => {
          if (it instanceof Syntax && it.match('delimiter')) {
            return it.addScope(scope, bindings, phase, options);
          }
          return it;
        })
      };
    }
    let oldScopeset;
    if (phase === ALL_PHASES) {
      oldScopeset = this.scopesets.all;
    } else {
      oldScopeset = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : List();
    }
    let newScopeset;
    if (options.flip) {
      let index = oldScopeset.indexOf(scope);
      if (index !== -1) {
        newScopeset = oldScopeset.remove(index);
      } else {
        newScopeset = oldScopeset.push(scope);
      }
    } else {
      newScopeset = oldScopeset.push(scope);
    }
    let newstx = {
      bindings,
      scopesets: {
        all: this.scopesets.all,
        phase: this.scopesets.phase
      }
    };

    if (phase === ALL_PHASES) {
      newstx.scopesets.all = newScopeset;
    } else {
      newstx.scopesets.phase = newstx.scopesets.phase.set(phase, newScopeset);
    }
    return new Syntax(token, newstx);
  }

  removeScope(scope, phase) {
    let token = this.match('delimiter') ? this.token.map(s => s.removeScope(scope, phase)) : this.token;
    let phaseScopeset = this.scopesets.phase.has(phase) ? this.scopesets.phase.get(phase) : List();
    let allScopeset = this.scopesets.all;
    let newstx = {
      bindings: this.bindings,
      scopesets: {
        all: this.scopesets.all,
        phase: this.scopesets.phase
      }
    };

    let phaseIndex = phaseScopeset.indexOf(scope);
    let allIndex = allScopeset.indexOf(scope);
    if (phaseIndex !== -1) {
      newstx.scopesets.phase = this.scopesets.phase.set(phase, phaseScopeset.remove(phaseIndex));
    } else if (allIndex !== -1) {
      newstx.scopesets.all = allScopeset.remove(allIndex);
    }
    return new Syntax(token, newstx);
  }

  match(type, value) {
    if (!Types[type]) {
      throw new Error(type + " is an invalid type");
    }
    return Types[type].match(this.token) && (value == null ||
      value instanceof RegExp ? value.test(this.val()) : this.val() == value);
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
