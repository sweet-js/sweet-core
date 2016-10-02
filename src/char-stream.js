// @flow

type SourceInfo = {
  filename?: string,
  position?: number
};

export default class CharStream {
  _src: string;
  _info: SourceInfo;
  constructor(source: string, filename: string = '') {
    this._src = source;
    this._info = {
      filename,
      position: 0
    };
  }

  get sourceInfo(): SourceInfo {
    const { filename, position } = this._info;
    return { filename, position };
  }

  // returns the Unicode character charsToSkip ahead.
  peek(charsToSkip: number = 0): string {
    const { position } = this._info;
    if (position + charsToSkip >= this._src.length) return '';
    return this._src[position + charsToSkip];
  }

  // returns a string containing the next numChars characters.
  readString(numChars: number = 1): string {
    const position = this._info.position;
    const str = this._src.slice(position, position + numChars);
    this._info.position += str.length;
    return str;
  }
}

export function isEOS(char: any) {
  return char === '';
}
