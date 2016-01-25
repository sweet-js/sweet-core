import { List } from 'immutable';
import Env from "./env";
import Reader from "./shift-reader";
import * as _ from "ramda";
import TokenExpander from './token-expander.js';
import BindingMap from "./binding-map.js";
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isSyntaxrecDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport
} from "./terms";
import loadSyntax from './load-syntax';

class Module {
  constructor(moduleSpecifier, importEntries, exportEntries, body) {
    this.moduleSpecifier = moduleSpecifier;
    this.importEntries = importEntries;
    this.exportEntries = exportEntries;
    this.body = body;
  }

  // put all compiltime transforms in the returned store
  visit(context) {

    this.exportEntries.forEach(ex => {
      if (isSyntaxDeclaration(ex.declaration.declaration) || isSyntaxrecDeclaration(ex.declaration.declaration)) {
        ex.declaration.declaration.declarators.forEach(
          loadSyntax(_.__, context, context.store)
        );
      }
    });

    return context.store;
  }
}

export class Modules {
  constructor() {
    this.loadedModules = new Map();
  }

  // ... -> { body: [Term], importEntries: [Import], exportEntries: [Export] }
  load(modulePath, context) {
    let path = context.moduleResolver(modulePath, context.cwd);
    if (!this.loadedModules.has(path)) {
      let modStr = context.moduleLoader(path);
      let reader = new Reader(modStr);
      let stxl = reader.read();
      let tokenExpander = new TokenExpander(_.merge(context, {
        // expand with a fresh environment
        env: new Env(),
        store: new Env(),
        bindings: new BindingMap()
      }));
      let terms = tokenExpander.expand(stxl);
      let importEntries = [];
      let exportEntries = [];
      terms.forEach(t => {
        _.cond([
          [isImport, t => importEntries.push(t)],
          [isExport, t => exportEntries.push(t)]
        ])(t);
      });
      this.loadedModules.set(path, new Module(
        path,
        List(importEntries),
        List(exportEntries),
        terms
      ));
    }
    return this.loadedModules.get(path);
  }
}
