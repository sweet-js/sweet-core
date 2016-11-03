// @flow

import { EmptyReadtable, setCurrentReadtable } from './readtable';

import readIdentifier from './reader/read-identifier';
import readNumericLiteral from './reader/read-numeric';
import readStringLiteral from './reader/read-string';
import readTemplateLiteral from './reader/read-template';
import readDelimiter from './reader/read-delimiter';

import type CharStream from './char-stream';
import type { LocationInfo } from './reader/token-reader';
import { KeywordToken, PunctuatorToken, EmptyToken } from './tokens';
import { insertSequence, retrieveSequenceLength } from './reader/utils';

// import type { ActionResult } from './readtable';

// import type { ReadtableEntry } from './readtable';

// strategy: create a series of readtables
// 0. whitespace - check!
// 1. punctuators - check!
// 2. delimiters - check!
// 3. numbers - check!
// 4. identifiers - check!
// 5. string - check!
// 6. regex
// 7. templates - check!
// 8. keywords - check!
// 9. dispatch characters (e.g. #, @)
// 10. '`' dispatch macro (i.e. syntaxQuote/syntaxTemplate)

// use https://github.com/mathiasbynens/regenerate to generate the Unicode code points

function eatWhitespace(stream: CharStream) {
  stream.readString();
  return EmptyToken;
}

const punctuators = [':', ';', '.', '=', '?', '+', '-', ',', '|',
                     '^', '&', '*', '/', '%', '!', '<', '>', '~',
                     '...', '=>', '++', '--', '|=', '^=', '&=',
                     '<<=', '>>=', '>>>=', '+=', '-=', '*=', '/=',
                     '%=', '**=', '&&', '<<', '>>', '>>>', '**',
                     '==', '!=', '===', '!==', '<=', '>='];

const punctuatorTable = punctuators.reduce(insertSequence, {});
                            
const punctuatorEntries = Object.keys(punctuatorTable).map(p => ({
  key: p,
  action: function readPunctuator(stream) {
    const len = retrieveSequenceLength(punctuatorTable, stream, 0);
    if (len >= 0) {
      return new PunctuatorToken({
        value: stream.readString(len),
      });
    }
    throw Error('Unknown punctuator');
  }
}));

const keywords = ['await', 'break', 'case', 'catch', 'class', 'continue', 'debugger',
                  'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
                  'finally', 'for', 'function', 'if', 'import', 'instanceof', 'in',
                  'let', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw',
                  'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'];

const keywordTable = keywords.reduce(insertSequence, {});

const keywordEntries = Object.keys(keywordTable).map(k => ({
  key: k,
  action(stream) {
    const len = retrieveSequenceLength(keywordTable[k], stream, 0);
    if (len >= 0) {
      return new KeywordToken({
        value: stream.readString(len),
      });
    }
    return defaultReadtable.getEntry().action.call(this, stream);
  }
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
    this.locationInfo = { line: this.locationInfo.line + 1, column: 1 };
    return eatWhitespace(stream);
  }
}));

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

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
}

const delimiterPairs = [['{','}'], ['[',']'], ['(',')']];

const delimiterEntries = delimiterPairs.map(p => ({
  key: p[0],
  action: function readDelimiters(stream, ...rest) {
    return readDelimiter.call(this, p[1], stream, ...rest);
  }
}));

// console.log('punctuators:', punctuatorEntries);
// console.log('keywords:', keywordEntries);
// console.log('white space:', whiteSpaceEntries);
// console.log('line terminators:', lineTerminatorEntries)

const defaultReadtable = EmptyReadtable.extendReadtable(
  ...[identifierEntry,
  ...whiteSpaceEntries,
  templateEntry,
  ...delimiterEntries,
  ...punctuatorEntries,
  ...keywordEntries,
  ...lineTerminatorEntries,
  ...numericEntries,
  ...stringEntries]);

export default defaultReadtable;

setCurrentReadtable(defaultReadtable);

