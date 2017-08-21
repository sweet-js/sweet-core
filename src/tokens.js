// @flow

import type { List } from 'immutable';

export type LocationInfo = {
  filename: string,
  position: number,
  line: number,
  column: number,
};

export const TokenClass = {
  Eof: { name: '<End>' },
  Ident: { name: 'Identifier', isIdentifierName: true },
  Keyword: { name: 'Keyword', isIdentifierName: true },
  NumericLiteral: { name: 'Numeric' },
  TemplateElement: { name: 'Template' },
  Punctuator: { name: 'Punctuator' },
  StringLiteral: { name: 'String' },
  RegularExpression: { name: 'RegularExpression' },
  Illegal: { name: 'Illegal' },
};

const TC = TokenClass;

export const TokenType = {
  EOS: { klass: TC.Eof, name: 'EOS' },
  LPAREN: { klass: TC.Punctuator, name: '(' },
  RPAREN: { klass: TC.Punctuator, name: ')' },
  LBRACK: { klass: TC.Punctuator, name: '[' },
  RBRACK: { klass: TC.Punctuator, name: ']' },
  LBRACE: { klass: TC.Punctuator, name: '{' },
  RBRACE: { klass: TC.Punctuator, name: '}' },
  LSYNTAX: { klass: TC.Punctuator, name: 'left-syntax' },
  RSYNTAX: { klass: TC.Punctuator, name: 'right-syntax' },
  COLON: { klass: TC.Punctuator, name: ':' },
  SEMICOLON: { klass: TC.Punctuator, name: ';' },
  PERIOD: { klass: TC.Punctuator, name: '.' },
  ELLIPSIS: { klass: TC.Punctuator, name: '...' },
  ARROW: { klass: TC.Punctuator, name: '=>' },
  CONDITIONAL: { klass: TC.Punctuator, name: '?' },
  INC: { klass: TC.Punctuator, name: '++' },
  DEC: { klass: TC.Punctuator, name: '--' },
  ASSIGN: { klass: TC.Punctuator, name: '=' },
  ASSIGN_BIT_OR: { klass: TC.Punctuator, name: '|=' },
  ASSIGN_BIT_XOR: { klass: TC.Punctuator, name: '^=' },
  ASSIGN_BIT_AND: { klass: TC.Punctuator, name: '&=' },
  ASSIGN_SHL: { klass: TC.Punctuator, name: '<<=' },
  ASSIGN_SHR: { klass: TC.Punctuator, name: '>>=' },
  ASSIGN_SHR_UNSIGNED: { klass: TC.Punctuator, name: '>>>=' },
  ASSIGN_ADD: { klass: TC.Punctuator, name: '+=' },
  ASSIGN_SUB: { klass: TC.Punctuator, name: '-=' },
  ASSIGN_MUL: { klass: TC.Punctuator, name: '*=' },
  ASSIGN_DIV: { klass: TC.Punctuator, name: '/=' },
  ASSIGN_MOD: { klass: TC.Punctuator, name: '%=' },
  ASSIGN_EXP: { klass: TC.Punctuator, name: '**=' },
  COMMA: { klass: TC.Punctuator, name: ',' },
  OR: { klass: TC.Punctuator, name: '||' },
  AND: { klass: TC.Punctuator, name: '&&' },
  BIT_OR: { klass: TC.Punctuator, name: '|' },
  BIT_XOR: { klass: TC.Punctuator, name: '^' },
  BIT_AND: { klass: TC.Punctuator, name: '&' },
  SHL: { klass: TC.Punctuator, name: '<<' },
  SHR: { klass: TC.Punctuator, name: '>>' },
  SHR_UNSIGNED: { klass: TC.Punctuator, name: '>>>' },
  ADD: { klass: TC.Punctuator, name: '+' },
  SUB: { klass: TC.Punctuator, name: '-' },
  MUL: { klass: TC.Punctuator, name: '*' },
  DIV: { klass: TC.Punctuator, name: '/' },
  MOD: { klass: TC.Punctuator, name: '%' },
  EXP: { klass: TC.Punctuator, name: '**' },
  EQ: { klass: TC.Punctuator, name: '==' },
  NE: { klass: TC.Punctuator, name: '!=' },
  EQ_STRICT: { klass: TC.Punctuator, name: '===' },
  NE_STRICT: { klass: TC.Punctuator, name: '!==' },
  LT: { klass: TC.Punctuator, name: '<' },
  GT: { klass: TC.Punctuator, name: '>' },
  LTE: { klass: TC.Punctuator, name: '<=' },
  GTE: { klass: TC.Punctuator, name: '>=' },
  INSTANCEOF: { klass: TC.Keyword, name: 'instanceof' },
  IN: { klass: TC.Keyword, name: 'in' },
  NOT: { klass: TC.Punctuator, name: '!' },
  BIT_NOT: { klass: TC.Punctuator, name: '~' },
  DELETE: { klass: TC.Keyword, name: 'delete' },
  TYPEOF: { klass: TC.Keyword, name: 'typeof' },
  VOID: { klass: TC.Keyword, name: 'void' },
  BREAK: { klass: TC.Keyword, name: 'break' },
  CASE: { klass: TC.Keyword, name: 'case' },
  CATCH: { klass: TC.Keyword, name: 'catch' },
  CLASS: { klass: TC.Keyword, name: 'class' },
  CONTINUE: { klass: TC.Keyword, name: 'continue' },
  DEBUGGER: { klass: TC.Keyword, name: 'debugger' },
  DEFAULT: { klass: TC.Keyword, name: 'default' },
  DO: { klass: TC.Keyword, name: 'do' },
  ELSE: { klass: TC.Keyword, name: 'else' },
  EXPORT: { klass: TC.Keyword, name: 'export' },
  EXTENDS: { klass: TC.Keyword, name: 'extends' },
  FINALLY: { klass: TC.Keyword, name: 'finally' },
  FOR: { klass: TC.Keyword, name: 'for' },
  FUNCTION: { klass: TC.Keyword, name: 'function' },
  IF: { klass: TC.Keyword, name: 'if' },
  IMPORT: { klass: TC.Keyword, name: 'import' },
  LET: { klass: TC.Keyword, name: 'let' },
  NEW: { klass: TC.Keyword, name: 'new' },
  RETURN: { klass: TC.Keyword, name: 'return' },
  SUPER: { klass: TC.Keyword, name: 'super' },
  SWITCH: { klass: TC.Keyword, name: 'switch' },
  THIS: { klass: TC.Keyword, name: 'this' },
  THROW: { klass: TC.Keyword, name: 'throw' },
  TRY: { klass: TC.Keyword, name: 'try' },
  VAR: { klass: TC.Keyword, name: 'var' },
  WHILE: { klass: TC.Keyword, name: 'while' },
  WITH: { klass: TC.Keyword, name: 'with' },
  NULL: { klass: TC.Keyword, name: 'null' },
  TRUE: { klass: TC.Keyword, name: 'true' },
  FALSE: { klass: TC.Keyword, name: 'false' },
  YIELD: { klass: TC.Keyword, name: 'yield' },
  NUMBER: { klass: TC.NumericLiteral, name: '' },
  STRING: { klass: TC.StringLiteral, name: '' },
  REGEXP: { klass: TC.RegularExpression, name: '' },
  IDENTIFIER: { klass: TC.Ident, name: '' },
  CONST: { klass: TC.Keyword, name: 'const' },
  TEMPLATE: { klass: TC.TemplateElement, name: '' },
  ILLEGAL: { klass: TC.Illegal, name: '' },
};

const TT = TokenType;

export const punctuatorTable = {
  '(': TT.LPAREN,
  ')': TT.RPAREN,
  '[': TT.LBRACK,
  ']': TT.RBRACK,
  '{': TT.LBRACE,
  '}': TT.RBRACE,
  ':': TT.COLON,
  ';': TT.SEMICOLON,
  '.': TT.PERIOD,
  '...': TT.ELLIPSIS,
  '=>': TT.ARROW,
  '?': TT.CONDITIONAL,
  '++': TT.INC,
  '--': TT.DEC,
  '=': TT.ASSIGN,
  '|=': TT.ASSIGN_BIT_OR,
  '^=': TT.ASSIGN_BIT_XOR,
  '&=': TT.ASSIGN_BIT_AND,
  '<<=': TT.ASSIGN_SHL,
  '>>=': TT.ASSIGN_SHR,
  '>>>=': TT.ASSIGN_SHR_UNSIGNED,
  '+=': TT.ASSIGN_ADD,
  '-=': TT.ASSIGN_SUB,
  '*=': TT.ASSIGN_MUL,
  '/=': TT.ASSIGN_DIV,
  '%=': TT.ASSIGN_MOD,
  '**=': TT.ASSIGN_EXP,
  ',': TT.COMMA,
  '||': TT.OR,
  '&&': TT.AND,
  '|': TT.BIT_OR,
  '&': TT.BIT_AND,
  '^': TT.BIT_XOR,
  '<<': TT.SHL,
  '>>': TT.SHR,
  '>>>': TT.SHR_UNSIGNED,
  '+': TT.ADD,
  '-': TT.SUB,
  '*': TT.MUL,
  '/': TT.DIV,
  '%': TT.MOD,
  '**': TT.EXP,
  '==': TT.EQ,
  '!=': TT.NE,
  '===': TT.EQ_STRICT,
  '!==': TT.NE_STRICT,
  '<': TT.LT,
  '>': TT.GT,
  '<=': TT.LTE,
  '>=': TT.GTE,
  '!': TT.NOT,
  '~': TT.BIT_NOT,
};

export const keywordTable = {
  break: TT.BREAK,
  case: TT.CASE,
  catch: TT.CATCH,
  class: TT.CLASS,
  const: TT.CONST,
  continue: TT.CONTINUE,
  delete: TT.DELETE,
  debugger: TT.DEBUGGER,
  default: TT.DEFAULT,
  do: TT.DO,
  else: TT.ELSE,
  export: TT.EXPORT,
  extends: TT.EXTENDS,
  false: TT.FALSE,
  finally: TT.FINALLY,
  for: TT.FOR,
  function: TT.FUNCTION,
  if: TT.IF,
  import: TT.IMPORT,
  in: TT.IN,
  instanceof: TT.INSTANCEOF,
  let: TT.LET,
  new: TT.NEW,
  null: TT.NULL,
  return: TT.RETURN,
  super: TT.SUPER,
  switch: TT.SWITCH,
  this: TT.THIS,
  throw: TT.THROW,
  true: TT.TRUE,
  try: TT.TRY,
  typeof: TT.TYPEOF,
  var: TT.VAR,
  void: TT.VOID,
  while: TT.WHILE,
  with: TT.WITH,
  yield: TT.YIELD,
};

export const EmptyToken = {};

export type StartLocation = {
  line: number,
  column: number,
  filename: string,
  position: number,
};

export type Slice = {
  text: string,
  start: number,
  startLocation: StartLocation,
  end: number,
};

type TokenTypeType = {
  klass: { name: string, isIdentifierName?: boolean },
  name: string,
};

function hasType(x: any, type?: {}) {
  if (type) {
    return x && typeof x.type === 'object' && x.type === type;
  }
  return x && typeof x.type === 'object';
}

function hasKlass(x: any, klass?: {}) {
  if (klass) {
    return hasType(x) && x.type.klass === klass;
  }
  return hasType(x) && typeof x.type.klass === 'object';
}

class BaseToken {
  typeCode: number;
  type: TokenTypeType;
  value: ?string | ?number;
  slice: ?Slice;

  constructor({
    typeCode,
    type,
    value,
    slice,
  }: {
    typeCode: number,
    type: TokenTypeType,
    value?: string | number,
    slice?: Slice,
  }) {
    this.typeCode = typeCode;
    this.type = type;
    this.value = value;
    this.slice = slice;
  }
}

export function isString(x: any, value?: string) {
  let r = hasType(x, TT.STRING);
  if (value != null) {
    return r && x.str === value;
  }
  return r;
}

export class StringToken {
  type: TokenTypeType;
  str: string;
  octal: ?string;
  slice: ?Slice;
  typeCode: number;
  constructor({
    str,
    octal,
    slice,
  }: {
    str: string,
    octal: ?string,
    slice?: Slice,
  }) {
    this.type = TT.STRING;
    this.typeCode = TypeCodes.StringLiteral;
    this.str = str;
    this.octal = octal;
    this.slice = slice;
  }
}

export const TypeCodes = {
  Identifier: 0,
  Keyword: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  TemplateElement: 5,
  Template: 6,
  RegExp: 7,
};

export function isIdentifier(x: any, value?: string) {
  let r = hasType(x, TT.IDENTIFIER);
  if (value != null) {
    return r && x.value === value;
  }
  return r;
}

export class IdentifierToken extends BaseToken {
  constructor({ value, slice }: { value: string, slice?: Slice }) {
    super({
      typeCode: TypeCodes.Identifier,
      type: TT.IDENTIFIER,
      value,
      slice,
    });
  }
}

export function isKeyword(x: any, value?: string | string[]) {
  let r = hasKlass(x, TC.Keyword);
  if (value != null) {
    if (typeof value === 'string') {
      return r && x.value === value;
    } else if (typeof value.some === 'function') {
      return value.some(v => v === x.value);
    }
  }
  return r;
}

export class KeywordToken extends BaseToken {
  constructor({ value, slice }: { value: string, slice?: Slice }) {
    super({
      typeCode: TypeCodes.Keyword,
      type: keywordTable[value],
      value,
      slice,
    });
  }
}

export function isPunctuator(x: any, value?: string) {
  let r = hasKlass(x, TC.Punctuator);
  if (value != null) {
    return r && x.value === value;
  }
  return r;
}
export class PunctuatorToken extends BaseToken {
  constructor({ value, slice }: { value: string, slice?: Slice }) {
    super({
      typeCode: TypeCodes.Punctuator,
      type: punctuatorTable[value],
      value,
      slice,
    });
  }
}

export function isNumeric(x: any, value?: number) {
  let r = hasType(x, TT.NUMBER);
  if (value != null) {
    return r && x.value === value;
  }
  return r;
}
export class NumericToken extends BaseToken {
  octal: boolean;
  noctal: boolean;

  constructor({
    value,
    octal = false,
    noctal = false,
    slice,
  }: {
    value: number,
    octal?: boolean,
    noctal?: boolean,
    slice?: Slice,
  }) {
    super({
      typeCode: TypeCodes.NumericLiteral,
      type: TT.NUMBER,
      value,
      slice,
    });
    this.octal = octal;
    this.noctal = noctal;
  }
}

export function isTemplateElement(x: any, value?: string) {
  let r = hasType(x, TT.TEMPLATE) && x.items == null;
  if (value != null) {
    return r && x.value === value;
  }
  return r;
}

export class TemplateElementToken extends BaseToken {
  tail: boolean;
  interp: boolean;

  constructor({
    value,
    tail,
    interp,
    slice,
  }: {
    value: string,
    tail: boolean,
    interp: boolean,
    slice?: Slice,
  }) {
    super({
      type: TT.TEMPLATE,
      typeCode: TypeCodes.TemplateElement,
      value,
      slice,
    });
    this.tail = tail;
    this.interp = interp;
  }
}

export function isTemplate(x: any) {
  return hasType(x, TT.TEMPLATE) && x.items != null;
}
export class TemplateToken extends BaseToken {
  items: List<Token>;

  constructor({ items, slice }: { items: List<Token>, slice?: Slice }) {
    super({ type: TT.TEMPLATE, typeCode: TypeCodes.Template, slice });
    this.items = items;
  }
}

export function isRegExp(x: any, value?: string) {
  let r = hasType(x, TT.REGEXP);
  if (value != null) {
    return r && x.value === value;
  }
  return r;
}
export class RegExpToken extends BaseToken {
  constructor({ value, slice }: { value: string, slice?: Slice }) {
    super({ type: TT.REGEXP, typeCode: TypeCodes.RegExp, value, slice });
  }
}

const isDelimiterType = (x, type) => {
  if (x && x[Symbol.iterator] && ([x] = x)) {
    return x && hasType(x, type);
  }
  return false;
};

export const isParens = (x: any) => isDelimiterType(x, TT.LPAREN);
export const isBraces = (x: any) => isDelimiterType(x, TT.LBRACE);
export const isBrackets = (x: any) => isDelimiterType(x, TT.LBRACK);
export const isSyntaxTemplate = (x: any) => isDelimiterType(x, TT.LSYNTAX);

export const isDelimiter = (x: any) =>
  isParens(x) || isBraces(x) || isBrackets(x) || isSyntaxTemplate(x);

export function getKind(x: List<TokenTree>) {
  return isParens(x)
    ? 'parens'
    : isBraces(x)
      ? 'braces'
      : isBrackets(x)
        ? 'brackets'
        : isSyntaxTemplate(x) ? 'syntaxTemplate' : '';
}

export function getLineNumber(t: any) {
  if (t.slice && t.slice.startLocation) {
    return t.slice.startLocation.line;
  } else if (t[Symbol.iterator] && ([t] = t)) {
    return getLineNumber(t);
  }
  return null;
}

export type Token =
  | StringToken
  | IdentifierToken
  | KeywordToken
  | PunctuatorToken
  | NumericToken
  | TemplateElementToken
  | TemplateToken
  | RegExpToken;
export type TokenTree = Token | List<TokenTree>;
