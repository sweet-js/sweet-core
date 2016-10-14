// @flow

import type { List } from 'immutable';
export type LocationInfo = { filename: string, position: number, line: number, column: number };

export const EmptyToken = {};

class BaseToken {
  type: string;
  value: ?string | ?number;
  
  constructor({ type, value }) {
    this.type = type;
    this.value = value;
  }
}

export class StringToken extends BaseToken {
  constructor({ value }: { value: string }) {
    super({ type: 'StringLiteral', value });
  }
}

export class IdentifierToken extends BaseToken {
  constructor({ value }: { value: string }) {
    super({ type: 'Identifier', value });
  }
}

export class KeywordToken extends BaseToken {
  constructor({ value }: { value: string }) {
    super({ type: 'Keyword', value });
  }
}

export class PunctuatorToken extends BaseToken {
  constructor({ value }: { value: string }) {
    super({ type: 'Punctuator', value });
  }
}

export class NumericToken extends BaseToken {
  octal: boolean;
  noctal: boolean;
  
  constructor({ value, octal, noctal }: { value: string, octal: boolean, noctal: boolean}) {
    super({type: 'NumericLiteral', value: +value });
    this.octal = octal;
    this.noctal = noctal;
  }
}

export class TemplateElementToken extends BaseToken {
  tail: boolean;
  interp: boolean;
  
  constructor({ value, tail, interp }: { value: string, tail: boolean, interp: boolean }) {
    super({ type: 'TemplateElement', value });
    this.tail = tail;
    this.interp = interp;
  }
}

export class TemplateToken extends BaseToken {
  items: List<TemplateElementToken>;
  
  constructor({ items }: { items: List<TemplateElementToken> }) {
    super({ type: 'TemplateLiteral', value: null });
    this.items = items;  
  }
}

export class DelimiterToken extends BaseToken {
  items: List<Token>;
 
  constructor({ value, items }: { value: string, items: List<Token> }) {
    super({ type: 'Delimiter', value });
    this.items = items;
  }
}

export type Token = StringToken | IdentifierToken | KeywordToken | PunctuatorToken | NumericToken | TemplateElementToken | TemplateToken | DelimiterToken;

export type TokenTree = Token | List<TokenTree>;
