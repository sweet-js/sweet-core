// @flow

import { isEOS } from './char-stream';
import { code } from 'esutils';
import { getHexValue } from './utils';
import { NumericToken } from '../tokens';

import type CharStream from './char-stream';

const { isIdentifierPartES6: isIdentifierPart,
        isIdentifierStartES6: isIdentifierStart,
        } = code;

export default function readNumericLiteral(stream: CharStream) {
  let idx = 0, char = stream.peek();

  if (char === '0') {
    char = stream.peek(++idx);
    if (!isEOS(char)) {
      char = char.toLowerCase();
      switch (char) {
        case 'x': return readHexLiteral.call(this, stream);
        case 'b': return readBinaryLiteral.call(this, stream);
        case 'o': return readOctalLiteral.call(this, stream);
        default: if (isDecimalChar(char)) {
          return readLegacyOctalLiteral.call(this, stream); // reads legacy octal and decimal
        }
      }
    } else {
      return new NumericToken({
        value: +stream.readString()
      });
    }
  } else if (char !== '.') {
    while (isDecimalChar(char)) {
      char = stream.peek(++idx);
    }
    if (isEOS(char)) {
      return new NumericToken({
        value: +stream.readString(idx)
      });
    }
  }

  idx = addDecimalLiteralSuffixLength.call(this, stream, idx);

  char = stream.peek(idx);
  if (!isEOS(char) && isIdentifierStart(char)) {
    throw this.createILLEGAL(char);
  }

  return new NumericToken({
    value: +stream.readString(idx)
  });
}

function addDecimalLiteralSuffixLength(stream, idx) {
  let char = stream.peek(idx);
  if (char === '.') {
    char = stream.peek(++idx);
    if (isEOS(char)) return idx;

    while (isDecimalChar(char)) {
      char = stream.peek(++idx);
      if (isEOS(char)) return idx;
    }
  }

  if (char.toLowerCase() === 'e') {
    char = stream.peek(++idx);
    if (isEOS(char)) throw this.createILLEGAL(char);

    if (char === '+' || char === '-') {
      char = stream.peek(++idx);
      if (isEOS(char)) throw this.createILLEGAL(char);
    }

    while (isDecimalChar(char)) {
      char = stream.peek(++idx);
      if (isEOS(char)) break;
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
      throw this.createILLEGAL(char);
    } else {
      break;
    }

    char = stream.peek(idx);
  }

  if (!isOctal) return new NumericToken({
    value: parseNumeric(stream, idx, 10),
    octal: true,
    noctal: !isOctal
  });

  return new NumericToken({
    value: parseNumeric(stream, idx, 8),
    octal: true,
    noctal: !isOctal
  });
}

function readOctalLiteral(stream) {
  let start, idx = start = 2, char = stream.peek(idx);
  while (!isEOS(char)) {
    if ("0" <= char && char <= "7") {
      char = stream.peek(++idx);
    } else if (isIdentifierPart(char.charCodeAt(0))) {
      throw this.createILLEGAL(char);
    } else {
      break;
    }
  }

  if (idx === start) {
    throw this.createILLEGAL(char);
  }

  return new NumericToken({
    value: parseNumeric(stream, idx, 8, start)
  });
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
    throw this.createILLEGAL(char);
  }

  if (!isEOS(char) && (isIdentifierStart(char) || isDecimalChar(char))) {
    throw this.createILLEGAL(char);
  }

  return new NumericToken({
    value: parseNumeric(stream, idx, 2, start)
  });
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
    throw this.createILLEGAL(char);
  }

  if (!isEOS(char) && isIdentifierStart(char)) {
    throw this.createILLEGAL(char);
  }

  return new NumericToken({
    value: parseNumeric(stream, idx, 16, start)
  });
}

function parseNumeric(stream, len, radix, start=0) {
  stream.readString(start);
  return parseInt(stream.readString(len - start), radix);
}

function isDecimalChar(char) {
  return '0' <= char && char <= '9';
}
