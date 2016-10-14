// @flow
import { List } from 'immutable';

import type CharStream from '../char-stream';

import { isEOS } from '../char-stream';

import { readStringEscape } from './utils';

import { TemplateToken, TemplateElementToken } from '../tokens';

export default function readTemplateLiteral(stream: CharStream): TemplateToken {
  let element, items = [];
  stream.readString();

  do {
    // element = stream.peek() !== '{' ? readTemplateElement(stream) : this.read(stream);
    element = readTemplateElement(stream);
    items.push(element);
    if (element.interp) {
      element = this.read(stream);
      items.push(element.items.first())
    }
  } while(!element.tail);

  return new TemplateToken({
    items: List(items)
  });
}

function readTemplateElement(stream: CharStream): TemplateElementToken {
  let char = stream.peek(), idx = 0, value = '';
  while (!isEOS(char)) {
    switch (char) {
      case '`': {
        stream.readString(idx+1);
        return new TemplateElementToken({
          tail: true,
          interp: false,
          value
        });
      }
      case '$': {
        if (stream.peek(idx+1) === '{') {
          stream.readString(idx+1);
          return new TemplateElementToken({
            tail: false,
            interp: true,
            value
          });
        }
        break;
      }
      case '\\': {
        let newVal;
        [newVal, idx] = readStringEscape.call(this, '', stream, idx, null);
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
  throw Error('Illegal template literal');
}
