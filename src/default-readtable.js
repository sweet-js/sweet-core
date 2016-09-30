import { EmptyReadtable, setCurrentReadtable } from './readtable';

import readIdentifier from './reader/read-identifier';
import readNumericLiteral from './reader/read-numeric';
import readStringLiteral from './reader/read-string';

// strategy: create a series of readtables
// 0. whitespace - check!
// 1. punctuators - check!
// 2. delimiters
// 3. numbers - check!
// 4. identifiers - check!
// 5. string- check!
// 6. regex
// 7. template elements?
// 8. keywords - check!
// 9. dispatch characters (e.g. #, @)
// 10. '`' dispatch macro (i.e. syntaxQuote/syntaxTemplate)

// use https://github.com/mathiasbynens/regenerate to generate the Unicode code points

function eatWhitespace(stream) {
  stream.readString();
}

function insertSequence(coll, seq) {
  const char = seq[0];
  if (!coll[char]) {
    coll[char] = {};
  }
  if (seq.length === 1) {
    coll[char].isValue = true;
    return coll;
  } else {
    coll[char] = insertSequence(coll[char], seq.slice(1));
    return coll;
  }
}

function retrieveSequenceLength(coll, stream, idx) {
  const char = stream.peek();
  if (!coll[char]) {
    if (coll.isValue) return idx;
    return -1;
  } else {
    return retrieveSequenceLength(coll[char], stream, ++idx);
  }
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
  action(stream) {
    const { filename, line, column, position } = stream.locationInfo;
    const len = retrieveSequenceLength(punctuatorTable[p], stream, 1);
    if (len >= 0) {
      return {
        type: 'Punctuator',
        value: stream.readString(len),
        locationInfo: { filename, line, column, position }
      };
    }
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
    const { filename, line, column, position } = stream.locationInfo;
    const len = retrieveSequenceLength(keywordTable[k], stream, 1);
    if (len >= 0) {
      return {
        type: 'Keyword',
        value: stream.readString(len),
        locationInfo: { filename, line, column, position }
      };
    }
    return defaultReadtable.getEntry().action(stream);
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
  action(stream) {
    stream.locationInfo = { line: stream.locationInfo.line + 1, column: 0 };
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
  action(stream) {
    const { filename, line, column, position } = stream.locationInfo;
    return {
      type: 'Identifier',
      value: readIdentifier(stream),
      locationInfo: { filename, line, column, position }
    };
  }
};

// console.log('punctuators:', punctuatorEntries);
// console.log('keywords:', keywordEntries);
// console.log('white space:', whiteSpaceEntries);
// console.log('line terminators:', lineTerminatorEntries)

const defaultReadtable = EmptyReadtable.extendReadtable(
  identifierEntry,
  ...punctuatorEntries,
  ...keywordEntries,
  ...whiteSpaceEntries,
  ...lineTerminatorEntries,
  ...numericEntries,
  ...stringEntries);

export default defaultReadtable;

setCurrentReadtable(defaultReadtable);

