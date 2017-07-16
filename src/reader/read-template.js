// @flow
import { List } from 'immutable';

import type { CharStream } from 'readtable';
import { isEOS } from 'readtable';

import { readStringEscape } from './utils';
import { getSlice } from './token-reader';
import { TemplateToken, TemplateElementToken } from '../tokens';

export default function readTemplateLiteral(
  stream: CharStream,
  prefix: List<any>,
): TemplateToken {
  let element,
    items = [];
  stream.readString();

  do {
    element = readTemplateElement.call(this, stream);
    items.push(element);
    if (element.interp) {
      element = this.readToken(stream, List(), false);
      items.push(element);
    }
  } while (!element.tail);

  return new TemplateToken({
    items: List(items),
  });
}

function readTemplateElement(stream: CharStream): TemplateElementToken {
  let char = stream.peek(),
    idx = 0,
    value = '',
    octal = null;
  const startLocation = Object.assign({}, this.locationInfo, stream.sourceInfo);
  while (!isEOS(char)) {
    switch (char) {
      case '`': {
        stream.readString(idx);
        const slice = getSlice(stream, startLocation);
        stream.readString();
        return new TemplateElementToken({
          tail: true,
          interp: false,
          value,
          slice,
        });
      }
      case '$': {
        if (stream.peek(idx + 1) === '{') {
          stream.readString(idx);
          const slice = getSlice(stream, startLocation);
          stream.readString();

          return new TemplateElementToken({
            tail: false,
            interp: true,
            value,
            slice,
          });
        }
        break;
      }
      case '\\': {
        let newVal;
        [newVal, idx, octal] = readStringEscape.call(
          this,
          '',
          stream,
          idx,
          octal,
        );
        if (octal != null) throw this.createILLEGAL(octal);
        value += newVal;
        --idx;
        break;
      }
      default: {
        value += char;
      }
    }
    char = stream.peek(++idx);
  }
  throw this.createILLEGAL(char);
}
