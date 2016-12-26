// @flow
import { Symbol } from './symbol';

let scopeIndex = 0;

export function freshScope(name: string = 'scope') {
  scopeIndex++;
  return Symbol(name + '_' + scopeIndex);
}

export function Scope(name: string) {
  return Symbol(name);
}
