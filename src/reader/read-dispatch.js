// @flow

import { getCurrentReadtable, setCurrentReadtable } from './reader';
import { LSYNTAX, RSYNTAX } from './utils';
import { List } from 'immutable';

import type CharStream from './char-stream';

const backtickEntry = {
  key: '`',
  mode: 'terminating',
  action: function readBacktick(stream: CharStream, prefix: List<any>, e: boolean) {
    if (prefix.isEmpty()) {
      return {
        type: LSYNTAX,
        value: stream.readString()
      };
    }

    return {
      type: RSYNTAX,
      value: stream.readString()
    };
  }
};

export function readSyntaxTemplate(stream: CharStream, prefix: List<any>, exprAllowed: boolean, dispatchChar: string): List<any> | { type: typeof RSYNTAX, value: string } {
  // return read('syntaxTemplate').first().token;
  // TODO: Can we simply tack 'syntaxTemplate' on the front and process it as a
  //       syntax macro?
  const prevTable = getCurrentReadtable();
  setCurrentReadtable(prevTable.extend(backtickEntry));

  const result = this.readUntil(
    '`',
    stream,
    List.of(updateSyntax(dispatchChar, this.readToken(stream, List(), exprAllowed))),
    exprAllowed);

  setCurrentReadtable(prevTable);
  return result;
}

function updateSyntax(prefix, token) {

  token.value = prefix + token.value;
  token.slice.text = prefix + token.slice.text;
  token.slice.start -= 1;
  token.slice.startLocation.position -= 1;

  return token;
}
