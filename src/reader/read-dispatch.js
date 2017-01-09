// @flow

import { getCurrentReadtable, setCurrentReadtable } from './reader';
import { LSYNTAX, RSYNTAX } from './utils';
import { List } from 'immutable';
import Syntax from '../syntax';
import { EmptyToken } from '../tokens';

import type CharStream from './char-stream';

const backtickEntry = {
  key: '`',
  mode: 'terminating',
  action: function readBacktick(stream: CharStream, prefix: List<Syntax>, e: boolean) {
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

const dispatchEntries = [{
  key: '`',
  mode: TerminatingMacro,
  action: function readSyntaxTemplate(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean): List<Syntax> | { type: typeof RSYNTAX, value: string } {
    // return read('syntaxTemplate').first().token;
    // TODO: Can we simply tack 'syntaxTemplate' on the front and process it as a
    //       syntax macro?
    const prevTable = getCurrentReadtable();
    const backtickReadtable = prevTable.extendReadtable(backtickEntry);
    setCurrentReadtable(backtickReadtable);

    const result = this.readUntil(
      '`',
      stream,
      List.of(this.readToken(stream, List(), exprAllowed)),
      exprAllowed);

    setCurrentReadtable(prevTable);
    return result;
  }
}];

const dispatchKeys = dispatchEntries.map(e => e.key);

export default function readDispatch(stream: CharStream, prefix: List<Syntax>, exprAllowed: boolean): List<Syntax> | typeof EmptyToken {
  const dispatchKey = stream.readString();

  if (!dispatchKeys.find(k => k === stream.peek())) {
    this.readToken(stream, prefix, exprAllowed);
    return EmptyToken;
  }

  const prevTable = getCurrentReadtable();
  const dispatchReadtable = prevTable.extendReadtable(...dispatchEntries);
  setCurrentReadtable(dispatchReadtable);

  const result = this.readToken(stream, prefix, exprAllowed);
  setCurrentReadtable(prevTable);

  updateSyntax(dispatchKey, List.isList(result.token) ? result.token.first() : result);
  return result.token;
}

function updateSyntax(prefix, syntax) {
  const token = syntax.token;
  if (token === EmptyToken) return syntax;

  token.value = prefix + token.value;
  token.slice.text = prefix + token.slice.text;
  --token.slice.start;
  --token.slice.startLocation.position;

  return syntax;
}
