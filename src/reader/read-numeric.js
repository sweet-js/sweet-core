// @flow

import { isEOS } from '../char-stream';
import { code } from 'esutils';
import { getHexValue } from './utils';
import { NumericToken } from '../tokens';

import type CharStream from '../char-stream';

const { isIdentifierPartES6: isIdentifierPart,
        isIdentifierStartES6: isIdentifierStart,
        } = code;

export default function readNumericLiteral(stream: CharStream) {
  let idx = 0, char = stream.peek();

  if (char === '0') {
    char = stream.peek(1);
    if (!isEOS(char)) {
      char = char.toLowerCase();
      switch (char) {
        case 'x': return readHexLiteral(stream);
        case 'b': return readBinaryLiteral(stream);
        case 'o': return readOctalLiteral(stream);
        default: if ('0' <= char && char <= '9') {
          return readLegacyOctalLiteral(stream); // reads legacy octal and decimal
        }
      }
    } else {
      return new NumericToken({
        value: stream.readString(),
        octal: false,
        noctal: false
      });
    }
  } else if (char !== '.') {
    while (isDecimalChar(char)) {
      ++idx;
      char = stream.peek(idx);
      if (isEOS(char)) {
        return new NumericToken({
          value: stream.readString(idx),
          octal: false,
          noctal: false
        });
      }
    }
  }

  idx = addDecimalLiteralSuffixLength(stream, idx);

  char = stream.peek(++idx);
  if (!isEOS(char) && isIdentifierStart(char)) {
    throw Error('Illegal numeric literal');
  }

  return new NumericToken({
    value: stream.readString(idx),
    octal: false,
    noctal: false
  });
}

function addDecimalLiteralSuffixLength(stream, idx) {
  let char = stream.peek(idx);
  if (char === '.') {
    char = stream.peek(++idx);
    if (isEOS(char)) return idx - 1;

    while (isDecimalChar(char)) {
      char = stream.peek(++idx);
      if (isEOS(char)) return idx - 1;
    }
  }

  if (char.toLowerCase() === 'e') {
    char = stream.peek(++idx);
    if (isEOS(char)) throw Error('Illegal decimal literal suffix');

    if (char === '+' || char === '-') {
      char = stream.peek(++idx);
      if (isEOS(char)) throw Error('Illegal decimal literal suffix');
    }

    if (isDecimalChar(char)) {
      while (isDecimalChar(char)) {
        char = stream.peek(++idx);
        if (isEOS(char)) {
          char = stream.peek(++idx);
          if (isEOS(char)) break;
        }
      }
    }
  }
  return idx;
}

function readLegacyOctalLiteral(stream) {
  let idx = 0, isOctal = true, char = stream.peek();


  while (!isEOS(char)) {
    if ("0" <= char && char <= "7") {
      idx++;
    } else if (char === "8" || char === "9") {
      isOctal = false;
      idx++;
    } else if (isIdentifierPart(char.charCodeAt(0))) {
      throw Error("Illegal numeric literal");
    } else {
      break;
    }

    char = stream.peek(idx);
  }

  if (!isOctal) return {
    type: 'NumericLiteral',
    value: parseNumeric(stream, idx, 10),
    octal: true,
    noctal: !isOctal
  };

  return {
    type: 'NumericLiteral',
    value: parseNumeric(stream, idx, 8),
    octal: true,
    noctal: !isOctal
  }
}

function readOctalLiteral(stream) {
  let start, idx = start = 2, char = stream.peek(idx);
  while (!isEOS(char)) {
    if ("0" <= char && char <= "7") {
      ++idx;
      char = stream.peek(idx);
    } else if (isIdentifierPart(char.charCodeAt(0))) {
      throw Error("Illegal octal literal");
    } else {
      break;
    }
  }

  if (idx === start) {
    throw Error("Illegal octal literal");
  }

  return {
    type: 'NumericLiteral',
    value: parseNumeric(stream, idx, 8, start),
    octal: false,
    noctal: false
  };
}

function readBinaryLiteral(stream) {
  let start, idx = start = 2;
  let char = stream.peek(idx);

  while(!isEOS(char)) {
    if (char !== "0" && char !== "1") {
      break;
    }
    char = stream.peek(idx);
    idx++;
  }

  if (idx === start) {
    throw Error("Illegal binary literal");
  }

  if (!isEOS(char) && (isIdentifierStart(char) || isDecimalChar(char))) {
    throw Error("Illegal binary literal");
  }

  return {
    type: 'NumericLiteral',
    value: parseNumeric(stream, idx, 2, start),
    octal: false,
    noctal: false
  }
}

function readHexLiteral(stream) {
  let start, idx = start = 2, char = stream.peek(idx);
  while(true) {
    let hex = getHexValue(char);
    if (hex === -1) {
      break;
    }
    char = stream.peek(++idx);
  }

  if (idx === start) {
    throw Error("Illegal hex literal");
  }

  if (!isEOS(char) && isIdentifierStart(char)) {
    throw Error("Illegal hex literal");
  }

  return {
    type: "NumericLiteral",
    value: parseNumeric(stream, idx, 16, start)
  }
}

function parseNumeric(stream, len, radix, start) {
  if (start) stream.readString(start);
  return parseInt(stream.readString(len), radix);
}

function isDecimalChar(char) {
  return '0' <= char && char <= '9';
}
