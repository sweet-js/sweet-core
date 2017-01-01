// @flow
import * as T from 'sweet-spec';
import * as _ from 'ramda';
import * as S from './sweet-spec-utils';
import codegen from './codegen';
import { List } from 'immutable';
import SweetToShiftReducer from './sweet-to-shift-reducer.js';
import Syntax from './syntax';

const extractDeclaration = _.cond([
  [S.isExport,        _.prop('declaration')],
  [S.isExportDefault, _.prop('body')],
  [_.T,               term => { throw new Error(`Expecting an Export or ExportDefault but got ${term}`) }]
]);

const extractDeclarationNames = _.cond([
  [S.isVariableDeclarator, decl => List.of(decl.binding.name)],
  [S.isVariableDeclaration, decl => decl.declarators.flatMap(extractDeclarationNames)],
  [S.isFunctionDeclaration, decl => List.of(decl.name.name)],
  [S.isClassDeclaration, decl => List.of(decl.name.name)]
]);

function extractNames(term: T.ExportDeclaration): List<Syntax> {
  if (S.isExport(term)) {
    return extractDeclarationNames(term.declaration);  
  } else if (S.isExportDefault(term)) {
    return List(); 
  } else if (S.isExportFrom(term)) {
    return List();    
  }
  throw new Error(`Unknown export type`);
}

function wrapStatement(declaration: T.Term) {
  if (S.isVariableDeclaration(declaration)) {
    return new T.VariableDeclarationStatement({ declaration });
  }
  return declaration;
}

const memoSym = Symbol('memo');

export default class SweetModule {
  items: List<T.Term>;
  imports: List<T.ImportDeclaration>;
  exports: List<T.ExportDeclaration>;
  exportedNames: List<Syntax>;

  runtime: List<T.Term>;
  compiletime: List<T.Term>;

  constructor(items: List<T.Term>) {
    let body = [];
    let imports = [];
    let exports = [];
    this.exportedNames = List();
    for (let item of items) {
      if (S.isImportDeclaration(item)) {
        imports.push(item);
      } else if (S.isExportDeclaration(item)) {
        exports.push(item);
        this.exportedNames = this.exportedNames.concat(extractNames(item));
        if (S.isExport(item) || S.isExportDefault(item)) {
          body.push(wrapStatement(extractDeclaration(item))); 
        }
      } else {
        body.push(item);
      }
    }
    this.items = List(body);
    this.imports = List(imports);
    this.exports = List(exports);
  }

  // $FlowFixMe: flow doesn't support computed property keys yet
  [memoSym]() {
    let runtime = [], compiletime = [];
    for (let item of this.items) {
      if (S.isCompiletimeStatement(item)) {
        compiletime.push(item);
      } else {
        runtime.push(item);
      }
    }
    this.runtime = List(runtime);
    this.compiletime = List(compiletime);
  }

  runtimeItems() {
    if (this.runtime == null) {
      // $FlowFixMe: flow doesn't support computed property keys yet
      this[memoSym]();
    }
    return this.runtime;
  }

  compiletimeItems() {
    if (this.compiletime == null) {
      // $FlowFixMe: flow doesn't support computed property keys yet
      this[memoSym]();
    }
    return this.compiletime;
  }

  parse() {
    return new T.Module({
      items: this.items,
      directives: List()
    }).reduce(new SweetToShiftReducer(0));
  }

  codegen() {
    return codegen(this.parse()).code;
  }
}
