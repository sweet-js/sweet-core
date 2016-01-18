import { List } from "immutable";
import { assert, expect } from "./errors";
import { mixin } from "./utils";
import Syntax from "./syntax";
import * as R from "ramda";

export default class {
  constructor(type, props) {
    this.type = type;
    this.loc = null;
    this._fields = Object.keys(props);
    for (let prop of this._fields) {
      this[prop] = props[prop];
    }
  }
  addScope(scope, bindings, options) {
    // todo: deal with hygiene here
    return this;
  }
}


export const isEOF = R.whereEq({ type: 'EOF' });
export const isVariableDeclaration = R.whereEq({ type: 'VariableDeclaration' });
export const isVariableDeclarationStatement = R.whereEq({ type: 'VariableDeclarationStatement' });
export const isSyntaxDeclaration = R.both(isVariableDeclaration, R.whereEq({ kind: 'syntax' }));
export const isFunctionDeclaration = R.whereEq({ type: 'FunctionDeclaration' });
export const isFunctionExpression = R.whereEq({ type: 'FunctionExpression' });
export const isFunctionTerm = R.either(isFunctionDeclaration, isFunctionExpression);
export const isFunctionWithName = R.and(isFunctionTerm, R.complement(R.where({ name: R.isNil })));
export const isBindingIdentifier = R.where({ name: R.is(Syntax) });
export const isImport = R.whereEq({ type: 'Import' });
export const isExport = R.whereEq({ type: 'Export' });
