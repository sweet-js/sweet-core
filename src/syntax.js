// @flow
import { List, Map } from 'immutable';
import { assert } from './errors';
import BindingMap from './binding-map';
import { Maybe } from 'ramda-fantasy';
import * as _ from 'ramda';
import * as T from 'sweet-spec';

import { TokenType, TokenClass, TypeCodes } from './tokens';

type Token = {
  type: any,
  value: any,
  slice: any,
};

type TokenTag =
  | 'null'
  | 'number'
  | 'string'
  | 'punctuator'
  | 'keyword'
  | 'identifier'
  | 'regularExpression'
  | 'boolean'
  | 'braces'
  | 'parens'
  | 'delimiter'
  | 'eof'
  | 'template'
  | 'assign'
  | 'syntaxTemplate'
  | 'brackets';

function getFirstSlice(stx: ?Syntax) {
  if (!stx || typeof stx.isDelimiter !== 'function') return null; // TODO: should not have to do this
  if (!stx.isDelimiter()) {
    return stx.token.slice;
  }
  return stx.token.get(0).token.slice;
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

type TypesHelper = {
  [key: TokenTag]: {
    match(token: any): boolean,
    create?: (value: any, stx: ?Syntax) => Syntax,
  },
};

export let Types: TypesHelper = {
  null: {
    match: token =>
      !Types.delimiter.match(token) && token.type === TokenType.NULL,
    create: (value, stx) =>
      new Syntax(
        {
          type: TokenType.NULL,
          value: null,
          typeCode: TypeCodes.Keyword,
        },
        stx,
      ),
  },
  number: {
    match: token =>
      !Types.delimiter.match(token) &&
      token.type.klass === TokenClass.NumericLiteral,
    create: (value, stx) =>
      new Syntax(
        {
          type: TokenType.NUMBER,
          value,
          typeCode: TypeCodes.NumericLiteral,
        },
        stx,
      ),
  },
  string: {
    match: token =>
      !Types.delimiter.match(token) &&
      token.type.klass === TokenClass.StringLiteral,
    create: (value, stx) =>
      new Syntax(
        {
          type: TokenType.STRING,
          str: value,
          typeCode: TypeCodes.StringLiteral,
        },
        stx,
      ),
  },
  punctuator: {
    match: token =>
      !Types.delimiter.match(token) &&
      token.type.klass === TokenClass.Punctuator,
    create: (value, stx) =>
      new Syntax(
        {
          type: {
            klass: TokenClass.Punctuator,
            name: value,
          },
          typeCode: TypeCodes.Punctuator,
          value,
        },
        stx,
      ),
  },
  keyword: {
    match: token =>
      !Types.delimiter.match(token) && token.type.klass === TokenClass.Keyword,
    create: (value, stx) =>
      new Syntax(
        {
          type: {
            klass: TokenClass.Keyword,
            name: value,
          },
          typeCode: TypeCodes.Keyword,
          value,
        },
        stx,
      ),
  },
  identifier: {
    match: token =>
      !Types.delimiter.match(token) && token.type.klass === TokenClass.Ident,
    create: (value, stx) =>
      new Syntax(
        {
          type: TokenType.IDENTIFIER,
          value,
          typeCode: TypeCodes.Identifier,
        },
        stx,
      ),
  },
  regularExpression: {
    match: token =>
      !Types.delimiter.match(token) &&
      token.type.klass === TokenClass.RegularExpression,
    create: (value, stx) =>
      new Syntax(
        {
          type: TokenType.REGEXP,
          value,
          typeCode: TypeCodes.RegExp,
        },
        stx,
      ),
  },
  // $FlowFixMe: cleanup all this
  braces: {
    match: token =>
      Types.delimiter.match(token) &&
      token.get(0).token.type === TokenType.LBRACE,
    create: (inner, stx) => {
      let left = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.LBRACE,
          typeCode: TypeCodes.Punctuator,
          value: '{',
          slice: getFirstSlice(stx),
        }),
      });
      let right = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.RBRACE,
          typeCode: TypeCodes.Punctuator,
          value: '}',
          slice: getFirstSlice(stx),
        }),
      });
      return new T.RawDelimiter({
        kind: 'braces',
        inner: List.of(left).concat(inner).push(right),
      });
    },
  },
  // $FlowFixMe: cleanup all this
  brackets: {
    match: token =>
      Types.delimiter.match(token) &&
      token.get(0).token.type === TokenType.LBRACK,
    create: (inner, stx) => {
      let left = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.LBRACK,
          typeCode: TypeCodes.Punctuator,
          value: '[',
          slice: getFirstSlice(stx),
        }),
      });
      let right = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.RBRACK,
          typeCode: TypeCodes.Punctuator,
          value: ']',
          slice: getFirstSlice(stx),
        }),
      });
      return new T.RawDelimiter({
        kind: 'brackets',
        inner: List.of(left).concat(inner).push(right),
      });
    },
  },
  // $FlowFixMe: cleanup all this
  parens: {
    match: token =>
      Types.delimiter.match(token) &&
      token.get(0).token.type === TokenType.LPAREN,
    create: (inner, stx) => {
      let left = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.LPAREN,
          typeCode: TypeCodes.Punctuator,
          value: '(',
          slice: getFirstSlice(stx),
        }),
      });
      let right = new T.RawSyntax({
        value: new Syntax({
          type: TokenType.RPAREN,
          typeCode: TypeCodes.Punctuator,
          value: ')',
          slice: getFirstSlice(stx),
        }),
      });
      return new T.RawDelimiter({
        kind: 'parens',
        inner: List.of(left).concat(inner).push(right),
      });
    },
  },

  assign: {
    match: token => {
      if (Types.punctuator.match(token)) {
        switch (token.value) {
          case '=':
          case '|=':
          case '^=':
          case '&=':
          case '<<=':
          case '>>=':
          case '>>>=':
          case '+=':
          case '-=':
          case '*=':
          case '/=':
          case '%=':
            return true;
          default:
            return false;
        }
      }
      return false;
    },
  },

  boolean: {
    match: token =>
      (!Types.delimiter.match(token) && token.type === TokenType.TRUE) ||
      token.type === TokenType.FALSE,
  },

  template: {
    match: token =>
      !Types.delimiter.match(token) && token.type === TokenType.TEMPLATE,
  },

  delimiter: {
    match: token => List.isList(token),
  },

  syntaxTemplate: {
    match: token => Types.delimiter.match(token) && token.get(0).val() === '#`',
  },

  eof: {
    match: token =>
      !Types.delimiter.match(token) && token.type === TokenType.EOS,
  },
};
export const ALL_PHASES = {};

type Scopeset = {
  all: List<any>,
  phase: Map<number | {}, any>,
};

export default class Syntax {
  // token: Token | List<Token>;
  token: any;
  bindings: BindingMap;
  scopesets: Scopeset;

  constructor(token: any, oldstx: ?{ bindings: any, scopesets: any }) {
    this.token = token;
    this.bindings =
      oldstx && oldstx.bindings != null ? oldstx.bindings : new BindingMap();
    this.scopesets =
      oldstx && oldstx.scopesets != null
        ? oldstx.scopesets
        : {
            all: List(),
            phase: Map(),
          };
    Object.freeze(this);
  }

  static of(token: Token, stx: ?Syntax) {
    return new Syntax(token, stx);
  }

  static from(type, value, stx: ?Syntax) {
    if (!Types[type]) {
      throw new Error(type + ' is not a valid type');
    } else if (!Types[type].create) {
      throw new Error('Cannot create a syntax from type ' + type);
    }
    let newstx = Types[type].create(value, stx);
    let slice = getFirstSlice(stx);
    if (slice != null && newstx.token != null) {
      newstx.token.slice = slice;
    }
    return newstx;
  }

  from(type: TokenTag, value: any) {
    // TODO: this is gross, fix
    let s = Syntax.from(type, value, this);
    if (s instanceof Syntax) {
      return new T.RawSyntax({ value: s });
    }
    return s;
  }

  fromNull() {
    return this.from('null', null);
  }

  fromNumber(value: number) {
    return this.from('number', value);
  }

  fromString(value: string) {
    return this.from('string', value);
  }

  fromPunctuator(value: string) {
    return this.from('punctuator', value);
  }

  fromKeyword(value: string) {
    return this.from('keyword', value);
  }

  fromIdentifier(value: string) {
    return this.from('identifier', value);
  }

  fromRegularExpression(value: any) {
    return this.from('regularExpression', value);
  }

  static fromNull(stx: Syntax) {
    return Syntax.from('null', null, stx);
  }

  static fromNumber(value, stx) {
    return Syntax.from('number', value, stx);
  }

  static fromString(value, stx) {
    return Syntax.from('string', value, stx);
  }

  static fromPunctuator(value, stx) {
    return Syntax.from('punctuator', value, stx);
  }

  static fromKeyword(value, stx) {
    return Syntax.from('keyword', value, stx);
  }

  static fromIdentifier(value, stx) {
    return Syntax.from('identifier', value, stx);
  }

  static fromRegularExpression(value, stx) {
    return Syntax.from('regularExpression', value, stx);
  }

  // () -> string
  resolve(phase: any) {
    assert(phase != null, 'must provide a phase to resolve');
    let allScopes = this.scopesets.all;
    let stxScopes = this.scopesets.phase.has(phase)
      ? this.scopesets.phase.get(phase)
      : List();
    stxScopes = allScopes.concat(stxScopes);
    if (
      stxScopes.size === 0 ||
      !(
        this.match('identifier') ||
        this.match('keyword') ||
        this.match('punctuator')
      )
    ) {
      return this.token.value;
    }
    let scope = stxScopes.last();
    let bindings = this.bindings;
    if (scope) {
      // List<{ scopes: List<Scope>, binding: Symbol }>
      let scopesetBindingList = bindings.get(this);

      if (scopesetBindingList) {
        // { scopes: List<Scope>, binding: Symbol }
        let biggestBindingPair = scopesetBindingList
          .filter(({ scopes }) => {
            return scopes.isSubset(stxScopes);
          })
          .sort(sizeDecending);

        // if (
        //   biggestBindingPair.size >= 2 &&
        //   biggestBindingPair.get(0).scopes.size ===
        //     biggestBindingPair.get(1).scopes.size
        // ) {
        //   let debugBase =
        //     '{' + stxScopes.map(s => s.toString()).join(', ') + '}';
        //   let debugAmbigousScopesets = biggestBindingPair
        //     .map(({ scopes }) => {
        //       return '{' + scopes.map(s => s.toString()).join(', ') + '}';
        //     })
        //     .join(', ');
        //   throw new Error(
        //     'Scopeset ' +
        //       debugBase +
        //       ' has ambiguous subsets ' +
        //       debugAmbigousScopesets,
        //   );
        // } else
        if (biggestBindingPair.size !== 0) {
          let bindingStr = biggestBindingPair.get(0).binding.toString();
          if (Maybe.isJust(biggestBindingPair.get(0).alias)) {
            // null never happens because we just checked if it is a Just
            return biggestBindingPair
              .get(0)
              .alias.getOrElse(null)
              .resolve(phase);
          }
          return bindingStr;
        }
      }
    }
    return this.token.value;
  }

  val(): any {
    assert(!this.match('delimiter'), 'cannot get the val of a delimiter');
    if (this.match('string')) {
      return this.token.str;
    }
    if (this.match('template')) {
      if (!this.token.items) return this.token.value;
      return this.token.items
        .map(el => {
          if (typeof el.match === 'function' && el.match('delimiter')) {
            return '${...}';
          }
          return el.slice.text;
        })
        .join('');
    }
    return this.token.value;
  }

  lineNumber() {
    if (!this.match('delimiter')) {
      return this.token.slice.startLocation.line;
    } else {
      return this.token.get(0).lineNumber();
    }
  }

  setLineNumber(line: number) {
    let newTok = {};
    if (this.isDelimiter()) {
      newTok = this.token.map(s => s.setLineNumber(line));
    } else {
      for (let key of Object.keys(this.token)) {
        newTok[key] = this.token[key];
      }
      assert(
        newTok.slice && newTok.slice.startLocation,
        'all tokens must have line info',
      );
      newTok.slice.startLocation.line = line;
    }
    return new Syntax(newTok, this);
  }

  // () -> List<Syntax>
  // inner() {
  //   assert(this.match("delimiter"), "can only get the inner of a delimiter");
  //   return this.token.slice(1, this.token.size - 1);
  // }

  addScope(
    scope: any,
    bindings: any,
    phase: number | {},
    options: any = { flip: false },
  ) {
    let token = this.match('delimiter')
      ? this.token.map(s => s.addScope(scope, bindings, phase, options))
      : this.token;
    if (this.match('template')) {
      token = _.merge(token, {
        items: token.items.map(it => {
          if (it instanceof Syntax && it.match('delimiter')) {
            return it.addScope(scope, bindings, phase, options);
          }
          return it;
        }),
      });
    }
    let oldScopeset;
    if (phase === ALL_PHASES) {
      oldScopeset = this.scopesets.all;
    } else {
      oldScopeset = this.scopesets.phase.has(phase)
        ? this.scopesets.phase.get(phase)
        : List();
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
        phase: this.scopesets.phase,
      },
    };

    if (phase === ALL_PHASES) {
      newstx.scopesets.all = newScopeset;
    } else {
      newstx.scopesets.phase = newstx.scopesets.phase.set(phase, newScopeset);
    }
    return new Syntax(token, newstx);
  }

  removeScope(scope: any, phase: number) {
    let token = this.match('delimiter')
      ? this.token.map(s => s.removeScope(scope, phase))
      : this.token;
    let phaseScopeset = this.scopesets.phase.has(phase)
      ? this.scopesets.phase.get(phase)
      : List();
    let allScopeset = this.scopesets.all;
    let newstx = {
      bindings: this.bindings,
      scopesets: {
        all: this.scopesets.all,
        phase: this.scopesets.phase,
      },
    };

    let phaseIndex = phaseScopeset.indexOf(scope);
    let allIndex = allScopeset.indexOf(scope);
    if (phaseIndex !== -1) {
      newstx.scopesets.phase = this.scopesets.phase.set(
        phase,
        phaseScopeset.remove(phaseIndex),
      );
    } else if (allIndex !== -1) {
      newstx.scopesets.all = allScopeset.remove(allIndex);
    }
    return new Syntax(token, newstx);
  }

  match(type: TokenTag, value: any) {
    if (!Types[type]) {
      throw new Error(type + ' is an invalid type');
    }
    return (
      Types[type].match(this.token) &&
      (value == null ||
        (value instanceof RegExp
          ? value.test(this.val())
          : this.val() == value))
    );
  }

  isIdentifier(value: string) {
    return this.match('identifier', value);
  }

  isAssign(value: string) {
    return this.match('assign', value);
  }

  isBooleanLiteral(value: boolean) {
    return this.match('boolean', value);
  }

  isKeyword(value: string) {
    return this.match('keyword', value);
  }

  isNullLiteral(value: any) {
    return this.match('null', value);
  }

  isNumericLiteral(value: number) {
    return this.match('number', value);
  }

  isPunctuator(value: string) {
    return this.match('punctuator', value);
  }

  isStringLiteral(value: string) {
    return this.match('string', value);
  }

  isRegularExpression(value: any) {
    return this.match('regularExpression', value);
  }

  isTemplate(value: any) {
    return this.match('template', value);
  }

  isDelimiter(value: any) {
    return this.match('delimiter', value);
  }

  isParens(value: any) {
    return this.match('parens', value);
  }

  isBraces(value: any) {
    return this.match('braces', value);
  }

  isBrackets(value: any) {
    return this.match('brackets', value);
  }

  isSyntaxTemplate(value: any) {
    return this.match('syntaxTemplate', value);
  }

  isEOF(value: any) {
    return this.match('eof', value);
  }

  toString() {
    if (this.match('delimiter')) {
      return this.token.map(s => s.toString()).join(' ');
    }
    if (this.match('string')) {
      return `'${this.token.str}'`;
    }
    if (this.match('template')) {
      return this.val();
    }
    return this.token.value;
  }
}
