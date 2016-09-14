// @flow

type LocationInfo = {
  filename: string,
  line: number,
  column: number,
  position: number
};

export default class CharStream {
  _src: string;
  _loc: LocationInfo;
  constructor(source: string, filename: string = '') {
    this._src = source;
    this._loc = {
      filename,
      position: 0,
      line: 0,
      column: 0
    };
  }

  get locationInfo(): LocationInfo  {
    const { filename, line, column, position } = this._loc;
    return { filename, line, column, position };
  }

  set locationInfo(info) { // change to destructuring { line, column } once https://github.com/facebook/flow/tree/v0.33.0
    this._loc.line = info.line || this._loc.line;
    this._loc.column = info.column || this._loc.column;
  }

  // returns the Unicode character charsToSkip ahead.
  peek(charsToSkip: number = 0): string {
    const { position } = this.locationInfo;
    if (position + charsToSkip >= this._src.length) return '';
    return this._src[position + charsToSkip];
  }

  // returns a string containing the next numChars characters.
  readString(numChars: number = 1): string {
    const position = this._loc.position;
    const str = this._src.slice(position, position + numChars);
    this._loc.position += str.length;
    return str;
  }
}

export function isEOS(char: any) {
  return char === '';
}
