import { List } from 'immutable';
import Env from "./env";
import Store from "./store";
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
import Compiler from "./compiler";
import { Scope, freshScope } from "./scope";

export class Module {
  constructor(moduleSpecifier, importEntries, exportEntries, body) {
    this.moduleSpecifier = moduleSpecifier;
    this.importEntries = importEntries;
    this.exportEntries = exportEntries;
    this.body = body;
  }
}

const pragmaRegep = /^\s*#\w*/;

export class Modules {
  constructor(context) {
    this.compiledModules = new Map();
    this.context = context;
    this.context.modules = this;
  }

  load(path) {
    // TODO resolve and we need to carry the cwd through correctly
    let mod = this.context.moduleLoader(path);
    if (!pragmaRegep.test(mod)) {
      return List();
    }
    let reader = new Reader(mod);
    return reader.read().slice(3); // slice out the #lang pragma
  }

  compile(stxl, path) {
    // TODO: recognize language pragmas in the enforester
    if (stxl.get(0) && stxl.get(0).isIdentifier() && stxl.get(0).val() === '#') {
      stxl = stxl.slice(3);
    }

    // the expander starts at phase 0, with an empty environment and store
    let scope = freshScope('top');
    let compiler = new Compiler(0, new Env(), new Store(), _.merge(this.context, {
      currentScope: [scope]
    }));
    // TODO: toplevel scope at all phases?
    let terms = compiler.compile(stxl.map(s => s.addScope(scope, this.context.bindings, 0)));

    let importEntries = [];
    let exportEntries = [];
    terms.forEach(t => {
      _.cond([
        [isImport, t => importEntries.push(t)],
        [isExport, t => exportEntries.push(t)]
      ])(t);
    });
    return new Module(
      path,
      List(importEntries),
      List(exportEntries),
      terms
    );
  }

  visit(path, phase, store) {
    return store;
  }

  invoke(path, phase, store) {
    return store;
  }
}
