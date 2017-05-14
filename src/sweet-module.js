// @flow
import Term, * as T from 'sweet-spec';
import * as _ from 'ramda';
import * as S from './sweet-spec-utils';
import codegen from './codegen';
import { List } from 'immutable';
import SweetToShiftReducer from './sweet-to-shift-reducer.js';
import Syntax from './syntax';

const extractDeclaration = _.cond([
  [S.isExport, _.prop('declaration')],
  [S.isExportDefault, _.prop('body')],
  [
    _.T,
    term => {
      throw new Error(`Expecting an Export or ExportDefault but got ${term}`);
    },
  ],
]);

const ExpSpec = x => ({ exportedName: x });

const extractDeclarationNames = _.cond([
  [S.isVariableDeclarator, ({ binding }) => List.of(ExpSpec(binding.name))],
  [
    S.isVariableDeclaration,
    ({ declarators }) => declarators.flatMap(extractDeclarationNames),
  ],
  [S.isFunctionDeclaration, ({ name }) => List.of(ExpSpec(name.name))],
  [S.isClassDeclaration, ({ name }) => List.of(ExpSpec(name.name))],
]);

type ExportSpecifier = {
  name?: Syntax,
  exportedName: Syntax,
};

function extractNames(term: any): List<ExportSpecifier> {
  if (S.isExport(term)) {
    return extractDeclarationNames(term.declaration);
  } else if (S.isExportDefault(term)) {
    return List();
  } else if (S.isExportFrom(term)) {
    return term.namedExports;
  }
  throw new Error(`Unknown export type`);
}

function wrapStatement(declaration: Term) {
  if (S.isVariableDeclaration(declaration)) {
    return new T.VariableDeclarationStatement({ declaration });
  }
  return declaration;
}

const memoSym = Symbol('memo');

function makeVarDeclStmt(name: T.BindingIdentifier, expr: T.Expression) {
  return new T.VariableDeclarationStatement({
    declaration: new T.VariableDeclaration({
      kind: 'var',
      declarators: List.of(
        new T.VariableDeclarator({
          binding: name,
          init: expr,
        }),
      ),
    }),
  });
}

export default class SweetModule {
  path: string;
  items: List<Term>;
  imports: List<T.ImportDeclaration>;
  exports: List<T.ExportDeclaration>;
  exportedNames: List<ExportSpecifier>;

  runtime: List<Term>;
  compiletime: List<Term>;

  constructor(path: string, items: List<Term>) {
    let body = [];
    let imports = [];
    let exports = [];
    this.path = path;
    this.exportedNames = List();
    for (let item of items) {
      if (S.isImportDeclaration(item)) {
        imports.push((item: any));
      } else if (S.isExportDeclaration(item)) {
        exports.push((item: any));
        this.exportedNames = this.exportedNames.concat(extractNames(item));
        if (S.isExport(item)) {
          body.push(wrapStatement(extractDeclaration(item)));
        } else if (S.isExportDefault(item)) {
          let decl = extractDeclaration(item);
          let defStx = Syntax.fromIdentifier('_default');
          let def = new T.BindingIdentifier({
            name: defStx,
          });
          this.exportedNames = this.exportedNames.push(ExpSpec(defStx));
          if (S.isFunctionDeclaration(decl) || S.isClassDeclaration(decl)) {
            body.push(decl);
            // extract name and bind it to _default
            body.push(
              makeVarDeclStmt(
                def,
                new T.IdentifierExpression({ name: decl.name.name }),
              ),
            );
          } else {
            // expression so bind it to _default
            body.push(makeVarDeclStmt(def, decl));
          }
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
      directives: List(),
      // $FlowFixMe: flow doesn't know about reduce yet
    }).reduce(new SweetToShiftReducer(0));
  }

  codegen() {
    return codegen(this.parse()).code;
  }
}
