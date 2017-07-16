// @flow

import { List } from 'immutable';
import { isEOS, getCurrentReadtable, setCurrentReadtable } from 'readtable';
import readIdentifier from './read-identifier';
import readNumericLiteral from './read-numeric';
import readStringLiteral from './read-string';
import readTemplateLiteral from './read-template';
import readRegExp from './read-regexp.js';
import readComment from './read-comment';
import { readSyntaxTemplate } from './read-dispatch';
import {
  punctuatorTable as punctuatorMapping,
  keywordTable as keywordMapping,
  KeywordToken,
  PunctuatorToken,
  EmptyToken,
  IdentifierToken,
} from '../tokens';
import {
  insertSequence,
  retrieveSequenceLength,
  isExprPrefix,
  isRegexPrefix,
  isIdentifierPart,
  isWhiteSpace,
  isLineTerminator,
  isDecimalDigit,
} from './utils';

import type { CharStream } from 'readtable';

// use https://github.com/mathiasbynens/regenerate to generate the Unicode code points when implementing modes

function eatWhitespace(stream: CharStream) {
  stream.readString();
  return EmptyToken;
}

const punctuatorTable = Object.keys(punctuatorMapping).reduce(
  insertSequence,
  {},
);

function readPunctuator(stream) {
  const len = retrieveSequenceLength(punctuatorTable, stream, 0);
  if (len > 0) {
    return new PunctuatorToken({
      value: stream.readString(len),
    });
  }
  throw Error('Unknown punctuator');
}

const punctuatorEntries = Object.keys(punctuatorTable).map(p => ({
  key: p,
  mode: 'terminating',
  action: readPunctuator,
}));

const whiteSpaceTable = [
  0x20,
  0x09,
  0x0b,
  0x0c,
  0xa0,
  0x1680,
  0x2000,
  0x2001,
  0x2002,
  0x2003,
  0x2004,
  0x2005,
  0x2006,
  0x2007,
  0x2008,
  0x2009,
  0x200a,
  0x202f,
  0x205f,
  0x3000,
  0xfeff,
];

const whiteSpaceEntries = whiteSpaceTable.map(w => ({
  key: w,
  mode: 'terminating',
  action: eatWhitespace,
}));

const lineTerminatorTable = [0x0a, 0x0d, 0x2028, 0x2029];

const lineTerminatorEntries = lineTerminatorTable.map(lt => ({
  key: lt,
  mode: 'terminating',
  action: function readLineTerminator(stream) {
    this.incrementLine();
    return eatWhitespace(stream);
  },
}));

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const numericEntries = digits.map(d => ({
  key: d,
  mode: 'non-terminating',
  action: readNumericLiteral,
}));

const quotes = ["'", '"'];

const stringEntries = quotes.map(q => ({
  key: q,
  mode: 'terminating',
  action: readStringLiteral,
}));

const identifierEntry = {
  mode: 'non-terminating',
  action: readIdentifier,
};

const templateEntry = {
  key: '`',
  mode: 'terminating',
  action: readTemplateLiteral,
};

const primitiveReadtable = getCurrentReadtable().extend(
  ...[
    identifierEntry,
    ...whiteSpaceEntries,
    templateEntry,
    ...punctuatorEntries,
    ...lineTerminatorEntries,
    ...numericEntries,
    ...stringEntries,
  ],
);

const dotEntry = {
  key: '.',
  mode: 'terminating',
  action: function readDot(stream, ...rest) {
    const nxt = stream.peek(1).charCodeAt(0);
    if (isDecimalDigit(nxt)) {
      return readNumericLiteral(stream, ...rest);
    }
    return readPunctuator.call(this, stream);
  },
};

const keywordTable = Object.keys(keywordMapping).reduce(insertSequence, {});

const keywordEntries = Object.keys(keywordTable).map(k => ({
  key: k,
  mode: 'non-terminating',
  action: function readKeyword(stream) {
    const len = retrieveSequenceLength(keywordTable, stream, 0);
    if (len > 0 && !isIdentifierPart(stream.peek(len).charCodeAt(0))) {
      return new KeywordToken({
        value: stream.readString(len),
      });
    }
    return readIdentifier.call(this, stream);
  },
}));

const delimiterPairs = [['[', ']'], ['(', ')']];

function readDelimiters(closing, stream, prefix, b) {
  const currentReadtable = getCurrentReadtable();
  setCurrentReadtable(primitiveReadtable);

  let results = List.of(this.readToken(stream, List(), b));

  setCurrentReadtable(currentReadtable);
  return this.readUntil(closing, stream, results, b);
}

const delimiterEntries = delimiterPairs.map(p => ({
  key: p[0],
  mode: 'terminating',
  action: function readDefaultDelimiters(stream, prefix, b) {
    return readDelimiters.call(this, p[1], stream, prefix, true);
  },
}));

const bracesEntry = {
  key: '{',
  mode: 'terminating',
  action: function readBraces(stream, prefix, b) {
    const line = this.locationInfo.line;
    const innerB = isExprPrefix(line, b, prefix);
    return readDelimiters.call(this, '}', stream, prefix, innerB);
  },
};

function readClosingDelimiter(opening, closing, stream, prefix, b) {
  if (prefix.first().value !== opening) {
    throw Error('Unmatched delimiter:', closing);
  }
  return readPunctuator.call(this, stream);
}

const unmatchedDelimiterEntries = [
  ['{', '}'],
  ['[', ']'],
  ['(', ')'],
].map(p => ({
  key: p[1],
  mode: 'terminating',
  action: function readClosingDelimiters(stream, prefix, b) {
    return readClosingDelimiter.call(this, ...p, stream, prefix, b);
  },
}));

const divEntry = {
  key: '/',
  mode: 'terminating',
  action: function readDiv(stream, prefix, b) {
    let nxt = stream.peek(1);
    if (nxt === '/' || nxt === '*') {
      const result = readComment.call(this, stream);
      return result;
    }
    if (isRegexPrefix(b, prefix)) {
      return readRegExp.call(this, stream, prefix, b);
    }
    return readPunctuator.call(this, stream);
  },
};

const dispatchBacktickEntry = {
  key: '`',
  mode: 'dispatch',
  action: readSyntaxTemplate,
};

const defaultDispatchEntry = {
  mode: 'dispatch',
  action: function readDefaultDispatch(...args) {
    this.readToken(...args);
    return EmptyToken;
  },
};

const dispatchWhiteSpaceEntries = whiteSpaceTable
  .concat(lineTerminatorTable)
  .map(w => ({
    key: w,
    mode: 'dispatch',
    action: function readDispatchWhitespace(
      stream,
      prefix,
      allowExprs,
      dispatchKey,
    ) {
      this.readToken(stream, prefix, allowExprs);
      return new IdentifierToken({ value: dispatchKey });
    },
  }));

const atEntry = {
  key: '@',
  mode: 'terminating',
  action: function readAt(stream, prefix) {
    const nxt = stream.peek(1),
      nxtCode = nxt.charCodeAt(0);
    if (isEOS(nxt) || isWhiteSpace(nxtCode) || isLineTerminator(nxtCode)) {
      return new IdentifierToken({ value: stream.readString() });
    }
    throw new SyntaxError('Invalid or unexpected token');
  },
};

const defaultReadtable = primitiveReadtable.extend(
  ...[
    dotEntry,
    ...delimiterEntries,
    ...unmatchedDelimiterEntries,
    bracesEntry,
    divEntry,
    ...keywordEntries,
    defaultDispatchEntry,
    dispatchBacktickEntry,
    ...dispatchWhiteSpaceEntries,
    atEntry,
  ],
);

export default defaultReadtable;
