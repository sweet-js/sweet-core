import { isEOS } from '../char-stream';

export function getHexValue(rune) {
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

export function scanUnicode(stream, start) {
  const sPeek = stream.peek.bind(stream);
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
