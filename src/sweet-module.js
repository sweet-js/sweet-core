// @flow
import * as _ from 'ramda';
import Term, * as S from 'sweet-spec';
import codegen from './codegen';
import { List } from 'immutable';
import SweetToShiftReducer from './sweet-to-shift-reducer.js';
import * as T from './terms';


export default class SweetModule {
  items: List<Term>;

  constructor(items: List<Term>) {
    this.items = items;
  }

  runtimeItems() {
    return this.items.filter(_.complement(T.isCompiletimeStatement));
  }

  compiletimeItems() {
    return this.items.filter(T.isCompiletimeStatement);
  }

  importEntries() {
    return this.items.filter(T.isImportDeclaration);
  }

  exportEntries() {
    return this.items.filter(T.isExportDeclaration);
  }

  parse() {
    return new S.Module({
      items: this.items,
      directives: List()
    }).reduce(new SweetToShiftReducer(0));
  }

  codegen() {
    return codegen(this.parse()).code;
  }
}
