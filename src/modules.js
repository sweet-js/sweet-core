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
  isVariableDeclarationStatement, isImport, isExport, isExportSyntax, isSyntaxDeclarationStatement
} from "./terms";
import { evalCompiletimeValue } from './load-syntax';
import Compiler from "./compiler";
import { VarBindingTransform, CompiletimeTransform } from './transforms';
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

  loadAndCompile(rawPath) {
    let path = this.context.moduleResolver(rawPath, this.context.cwd);
    if (!this.compiledModules.has(path)) {
      this.compiledModules.set(path, this.compile(this.load(path), path));
    }
    return this.compiledModules.get(path);
  }

  visit(mod, phase, store) {
    mod.body.forEach(term => {
      if (isSyntaxDeclarationStatement(term) || isExportSyntax(term)) {
        term.declaration.declarators.forEach(({binding, init}) => {
          let val = evalCompiletimeValue(init.gen(), _.merge(this.context, {
            store, phase: phase + 1
          }));
          // binding for imports
          store.set(mod.moduleSpecifier + ":" + binding.name.val() + ":" + phase, new CompiletimeTransform(val));
          // module local binding
          store.set(binding.name.resolve(phase), new CompiletimeTransform(val));
        });
      }
    });
    return store;
  }

  invoke(mod, phase, store) {
    return store;
  }
}
