// @flow

import Reader from './reader';

import type Readtable from '../readtable';
import type CharStream from '../char-stream';

export type LocationInfo = {
  line: number,
  column: number
};

export default class TokenReader extends Reader {
  locationInfo: LocationInfo;
  insideBlock: boolean;
  constructor(readtable?: Readtable) {
    super(readtable);
    this.locationInfo = {
      line: 1,
      column: 1
    };
    this.insideBlock = false;
  }
  
  read(stream: CharStream) {
    const startLocation: any = Object.assign({}, this.locationInfo, stream.sourceInfo);
    
    const result = super.read(stream);
    if (result != null) {
      result.locationInfo = startLocation;
    }
    const currentLocation = this.locationInfo;
    if (startLocation.line === this.locationInfo.line) {
      this.locationInfo.column += stream.sourceInfo.position - startLocation.position;
    }
    return result;
  }
}
