'lang sweet.js';

var TypeCodes = {
  Identifier: 0,
  Keyword: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  TemplateElement: 5,
  Template: 6,
  RegExp: 7,
};

function check(obj, type) {
  return obj && obj.type === 'RawSyntax' && obj.value.token.typeCode === type;
}

export function unwrap(obj) {
  var hasTok = obj && obj.value && obj.value.token;
  if (hasTok && obj.value.token.typeCode === TypeCodes.StringLiteral) {
    return {
      value: obj.value.token.str,
    };
  } else if (hasTok && obj.value.token.typeCode !== TypeCodes.Template) {
    return {
      value: obj.value.token.value,
    };
  } else if (hasTok && obj.value.token.typeCode === TypeCodes.Template) {
    return {
      value: obj.value.token.items,
    };
  } else if (obj && obj.type === 'RawDelimiter') {
    return {
      value: obj.inner,
    };
  }
  return {};
}

export function isIdentifier(obj) {
  return check(obj, TypeCodes.Identifier);
}

export function fromIdentifier(obj, x) {
  return obj.value.fromIdentifier(x);
}

export function isKeyword(obj) {
  return check(obj, TypeCodes.Keyword);
}

export function fromKeyword(obj, x) {
  return obj.value.fromKeyword(x);
}

export function isPunctuator(obj) {
  return check(obj, TypeCodes.Punctuator);
}

export function fromPunctuator(obj, x) {
  return obj.value.fromPunctuator(x);
}

export function isNumericLiteral(obj) {
  return check(obj, TypeCodes.NumericLiteral);
}

export function fromNumericLiteral(obj, x) {
  return obj.value.fromNumber(x);
}

export function isStringLiteral(obj) {
  return check(obj, TypeCodes.StringLiteral);
}

export function fromStringLiteral(obj, x) {
  return obj.value.fromString(x);
}

export function isTemplateElement(obj) {
  return check(obj, TypeCodes.TemplateElement);
}

export function isTemplate(obj) {
  return check(obj, TypeCodes.Template);
}

export function isRegExp(obj) {
  return check(obj, TypeCodes.RegExp);
}

export function isParens(obj) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'parens';
}

export function fromParens(obj, x) {
  return obj.value.from('parens', x);
}

export function isBrackets(obj) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'brackets';
}

export function fromBrackets(obj, x) {
  return obj.value.from('brackets', x);
}

export function isBraces(obj) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'braces';
}

export function fromBraces(obj, x) {
  return obj.value.from('braces', x);
}

export function isSyntaxTemplate(obj) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'syntaxTemplate';
}
