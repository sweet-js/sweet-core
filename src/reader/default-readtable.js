// @flow

import { List } from 'immutable';
import { EmptyReadtable } from './readtable';
import { getCurrentReadtable, setCurrentReadtable } from './reader';
import readIdentifier from './read-identifier';
import readNumericLiteral from './read-numeric';
import readStringLiteral from './read-string';
import readTemplateLiteral from './read-template';
import readDelimiter from './read-delimiter';
import readRegExp from './read-regexp.js';
import readComment from './read-comment';
import readDispatch from './read-dispatch';
import { punctuatorTable as punctuatorMapping, keywordTable as keywordMapping,
         KeywordToken, PunctuatorToken, EmptyToken, IdentifierToken } from '../tokens';
import { insertSequence, retrieveSequenceLength, isExprPrefix, isRegexPrefix, isIdentifierPart, isWhiteSpace, isLineTerminator, isDecimalDigit } from './utils';

import type CharStream from './char-stream';

// use https://github.com/mathiasbynens/regenerate to generate the Unicode code points when implementing modes

function eatWhitespace(stream: CharStream) {
  stream.readString();
  return EmptyToken;
}

const punctuatorTable = Object.keys(punctuatorMapping).reduce(insertSequence, {});

function readPunctuator(stream) {
  const len = retrieveSequenceLength(punctuatorTable, stream, 0);
  if (len > 0) {
    return new PunctuatorToken({
      value: stream.readString(len)
    });
  }
  throw Error('Unknown punctuator');
}

const punctuatorEntries = Object.keys(punctuatorTable).map(p => ({
  key: p,
  action: readPunctuator
}));

const whiteSpaceTable = [0x20, 0x09, 0x0B, 0x0C, 0xA0, 0x1680, 0x2000, 0x2001, 0x2002,
                         0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A,
                         0x202F, 0x205F, 0x3000, 0xFEFF];

const whiteSpaceEntries = whiteSpaceTable.map(w => ({
  key: w,
  action: eatWhitespace
}));

const lineTerminatorTable = [0x0A, 0x0D, 0x2028, 0x2029];

const lineTerminatorEntries = lineTerminatorTable.map(lt => ({
  key: lt,
  action: function readLineTerminator(stream) {
    this.incrementLine();
    return eatWhitespace(stream);
  }
}));

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const numericEntries = digits.map(d => ({
  key: d,
  action: readNumericLiteral
}));

const quotes = ["'", '"'];

const stringEntries = quotes.map(q => ({
  key: q,
  action: readStringLiteral
}));

const identifierEntry = {
  action: readIdentifier
};

const templateEntry = {
  key: '`',
  action: readTemplateLiteral
};

const primitiveReadtable = EmptyReadtable.extendReadtable(
    ...[identifierEntry,
        ...whiteSpaceEntries,
        templateEntry,
        ...punctuatorEntries,
        ...lineTerminatorEntries,
        ...numericEntries,
        ...stringEntries]);

function readFromReadtable(reader, readtable, stream) {
  const currentReadtable = getCurrentReadtable();
  setCurrentReadtable(readtable);
  const result = reader.readToken(stream);
  setCurrentReadtable(currentReadtable);
  return result;
}

const dotEntry = {
  key: '.',
  action: function readDot(stream, ...rest) {
    const nxt = stream.peek(1).charCodeAt(0);
    if (isDecimalDigit(nxt)) {
      return readNumericLiteral(stream, ...rest);
    }
    return readFromReadtable(this, primitiveReadtable, stream).token;
  }
}

const keywordTable = Object.keys(keywordMapping).reduce(insertSequence, {});

const keywordEntries = Object.keys(keywordTable).map(k => ({
  key: k,
  action: function readKeyword(stream) {
    const len = retrieveSequenceLength(keywordTable, stream, 0);
    if (len > 0 && !isIdentifierPart(stream.peek(len).charCodeAt(0))) {
      return new KeywordToken({
        value: stream.readString(len)
      });
    }
    return readFromReadtable(this, primitiveReadtable, stream).token;
  }
}));

const topLevelEntry = {
  key: '',
  action: function readTopLevel(stream) {
    return readDelimiter.call(this, '', stream, List(), false);
  }
};

const delimiterPairs = [['[',']'], ['(',')']];

function readDelimiters(opening, closing, stream, prefix, b) {
  const currentReadtable = getCurrentReadtable();
  setCurrentReadtable(primitiveReadtable);

  let results = List.of(this.readToken(stream, List(), b));

  setCurrentReadtable(currentReadtable);
  results = results.concat(readDelimiter.call(this, closing, stream, results, b));

  results = results.push(this.readToken(stream, results, b));
  return results;
}

const delimiterEntries = delimiterPairs.map(p => ({
  key: p[0],
  action: function readDefaultDelimiters(stream, prefix, b) {
    return readDelimiters.call(this, p[0], p[1], stream, prefix, true);
  }
}));

const bracesEntry = {
  key: '{',
  action: function readBraces(stream, prefix, b) {
    const line = this.locationInfo.line;
    const innerB = isExprPrefix(line, b)(prefix);
    return readDelimiters.call(this, '{', '}', stream, prefix, innerB);
  }
};

function readClosingDelimiter(opening, closing, stream, prefix, b) {
  if (prefix.first().token.value !== opening) {
    throw Error('Unmatched delimiter:', closing);
  }
  return readFromReadtable(this, primitiveReadtable, stream).token;
}

const unmatchedDelimiterEntries = [['{','}'], ['[',']'], ['(',')']].map(p => ({
  key: p[1],
  action: function readClosingDelimiters(stream, prefix, b) {
    return readClosingDelimiter.call(this, ...p, stream, prefix, b);
  }
}));

const divEntry = {
  key: '/',
  action: function readDiv(stream, prefix, b) {
    let nxt = stream.peek(1);
    if (nxt === '/' || nxt === '*') {
      const result = readComment.call(this, stream);
      return result;
    }
    if (isRegexPrefix(b)(prefix)) {
      return readRegExp.call(this, stream, prefix, b);
    }
    return readFromReadtable(this, primitiveReadtable, stream).token;
  }
};

const dispatchEntry = {
  key: '#',
  action: function readHash(stream, prefix, b) {
    const nxt = stream.peek(1).charCodeAt(0);
    if (isWhiteSpace(nxt) || isLineTerminator(nxt)) {
      return new IdentifierToken({ value: stream.readString() });
    }
    return readDispatch.call(this, stream, prefix, b);
  }
};

const atEntry = {
  key: '@',
  action: function readAt(stream, prefix, b) {
    const nxt = stream.peek(1).charCodeAt(0);
    if (isWhiteSpace(nxt) || isLineTerminator(nxt)) {
      return new IdentifierToken({ value: stream.readString() });
    }
    throw new SyntaxError('Invalid or unexpected token');
  }
};

const defaultReadtable = primitiveReadtable.extendReadtable(
  ...[topLevelEntry,
    dotEntry,
    ...delimiterEntries,
    ...unmatchedDelimiterEntries,
    bracesEntry,
    divEntry,
    ...keywordEntries,
    dispatchEntry,
    atEntry]);

export default defaultReadtable;
