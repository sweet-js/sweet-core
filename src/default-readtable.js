import { EmptyReadtable, setCurrentReadtable } from './readtable';
import { isEOS } from './char-stream';
import { code } from 'esutils';

const { isIdentifierPartES6: isIdentifierPart,
         isIdentifierStartES6: isIdentifierStart } = code;

// strategy: create a series of readtables
// 0. whitespace
// 1. punctuators
// 2. delimiters
// 3. numbers
// 4. identifiers
// 5. string
// 6. regex
// 7. template elements?
// 8. keywords
// 9. dispatch characters (e.g. #, @)
// 10. '`' dispatch macro (i.e. syntaxQuote/syntaxTemplate)

// use https://github.com/mathiasbynens/regenerate to generate the Unicode code points

function eatWhitespace(stream) {
  stream.readString();
}

function getIdentifier(stream) {
  let char = stream.peek();
  let code = char.charCodeAt(0);
  let check = isIdentifierStart;
  let idx = 1;
  while(!isEOS(char)) {
    if (char === '\\' || 0xD800 <= code && code <= 0xDBFF) {
      return getEscapedIdentifier(stream);
    }
    if (!check(code)) {
      return stream.readString(idx);
    }
    char = stream.peek(++idx);
    code = char.charCodeAt(0);
    check = isIdentifierPart;
  }
  return stream.readString(idx);
}

function getEscapedIdentifier(stream) {
  const sPeek = stream.peek.bind(stream);
  let id = '';
  let check = isIdentifierStart;
  let char = sPeek();
  let code = char.charCodeAt(0);
  while (!isEOS(char)) {
    if (char === '\\') {
      let nxt = sPeek(1);
      if (isEOS(nxt)) {
        throw Error('Unexpected end of input');
      }
      if (nxt !== 'u') {
        throw Error('Unexpected token:', char);
      }
      code = scanUnicode(stream);
      if (code < 0) {
        throw Error('Illegal Unicode value');
      }
    } else if (0xD800 <= code && code <= 0xDBFF) {
      if (isEOS(char)) {
        throw Error('Unexpected end of input');
      }
      let lowSurrogateCode = sPeek(1).charCodeAt(0);
      if (0xDC00 > lowSurrogateCode || lowSurrogateCode > 0xDFFF) {
        throw Error('Invalid UTF-16');
      }
      stream.readString(2)
      code = decodeUtf16(code, lowSurrogateCode);
    }
    if (!check(code)) {
      if (id.length < 1) {
        throw Error('Invalid identifier');
      }
      return id;
    }
    id += String.fromCodePoint(code);
    char = sPeek();
    code = char.charCodeAt(0);
    check = isIdentifierPart;
  }
  return id;
}

function decodeUtf16(lead, trail) {
  return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
}

function scanUnicode(stream) {
  const sPeek = stream.peek.bind(stream);
  const start = 2;
  let idx = start;
  let hexDigits = 0;
  if (sPeek(idx) === '{') {
    //\u{HexDigits}
    ++idx;
    let char = sPeek(idx);
    while (!isEOS(char)) {
      let hex = getHexValue(char);
      if (hex === -1) break;
      hexDigits = (hexDigits << 4) | hex;
      if (hexDigits > 0x10FFFF) {
        throw Error('Value outside of Unicode range:', hexDigits.toString(16));
      }
      char = sPeek(++idx);
    }
    if (char !== '}') {
      throw Error('Expected "}", found', char);
    }
    if (idx === start + 1) {
      throw Error('Unexpected "}"');
    }
    ++idx;
  } else {
    //\uHex4Digits
    if (isEOS(sPeek(idx + 3))) return -1;
    let r;
    for (; idx < start + 4; ++idx) {
      r = getHexValue(sPeek(idx));
      if (r === -1) return -1;
      hexDigits = (hexDigits << 4) | r;
    }
  }
  stream.readString(idx);

  return hexDigits;
}

function getHexValue(rune) {
  if ("0" <= rune && rune <= "9") {
    return rune.charCodeAt(0) - 48;
  }
  if ("a" <= rune && rune <= "f") {
    return rune.charCodeAt(0) - 87;
  }
  if ("A" <= rune && rune <= "F") {
    return rune.charCodeAt(0) - 55;
  }
  return -1;
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

// console.log('punctuators:', punctuatorEntries);
// console.log('keywords:', keywordEntries);
// console.log('white space:', whiteSpaceEntries);
// console.log('line terminators:', lineTerminatorEntries)

const defaultReadtable = EmptyReadtable.extendReadtable({
  action(stream) {
    const { filename, line, column, position } = stream.locationInfo;
    return {
      type: 'Identifier',
      value: getIdentifier(stream),
      locationInfo: { filename, line, column, position }
    };
  }
},
...punctuatorEntries,
...keywordEntries,
...whiteSpaceEntries,
...lineTerminatorEntries);

export default defaultReadtable;

setCurrentReadtable(defaultReadtable);

