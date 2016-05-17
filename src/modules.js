import { List } from 'immutable';
import Env from "./env";
import Store from "./store";
import Reader from "./shift-reader";
import * as _ from "ramda";
import TokenExpander from './token-expander.js';
import TermExpander from "./term-expander.js";
import BindingMap from "./binding-map.js";
import { gensym } from './symbol';
import Term, {
  isEOF, isBindingIdentifier, isFunctionDeclaration, isFunctionExpression,
  isFunctionTerm, isFunctionWithName, isSyntaxDeclaration, isSyntaxrecDeclaration, isVariableDeclaration,
  isVariableDeclarationStatement, isImport, isExport, isExportFrom, isExportAllFrom, isExportDefault,
  isExportSyntax, isSyntaxDeclarationStatement, isPragma, isCompiletimeDeclaration, isCompiletimeStatement
} from "./terms";
import { evalCompiletimeValue, evalRuntimeValues } from './load-syntax';
import Compiler from "./compiler";
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { Scope, freshScope } from "./scope";
import { assert } from './errors';
import { collectBindings } from './hygiene-utils';

import { ALL_PHASES } from './syntax';

export class Module {
  constructor(moduleSpecifier, isNative, importEntries, exportEntries, pragmas, body) {
    this.moduleSpecifier = moduleSpecifier;
    this.isNative = isNative;
    this.importEntries = importEntries;
    this.exportEntries = exportEntries;
    this.pragmas = pragmas;
    this.body = body;
  }
}

const findBindingIdentifierName = term => {
  // TODO: handle destructuring
  assert(term.name, `not implemented yet for type ${term.type}`);
  return term.name;
};

const convertExport = term => {
  let declaration = term.declaration;
  let bindings = [];
  if (isVariableDeclaration(declaration)) {
    bindings = declaration.declarators.map(decl =>  findBindingIdentifierName(decl.binding));
  }

  let namedExports = bindings.map(binding => {
    return new Term('ExportSpecifier', {
      name: null,
      exportedName: binding
    });
  });
  return new Term('ExportFrom', {
    moduleSpecifier: null, namedExports
  });
};

const pragmaRegep = /^\s*#\w*/;

export class Modules {
  constructor(context) {
    this.compiledModules = new Map();
    this.context = context;
    this.context.modules = this;
  }

  loadString(str, checkPragma = true) {
    if (checkPragma && !pragmaRegep.test(str)) {
      return {
        isNative: true,
        body: List()
      };
    }
    return {
      isNative: false,
      body: new Reader(str).read()
    };
  }

  load(path) {
    // TODO resolve and we need to carry the cwd through correctly
    return this.loadString(this.context.moduleLoader(path));
  }

  compile(mod, path) {
    let stxl = mod.body;
    let outScope = freshScope('outsideEdge');
    let inScope = freshScope(`insideEdge0`);
    // the compiler starts at phase 0, with an empty environment and store
    let compiler = new Compiler(0, new Env(), new Store(), _.merge(this.context, {
      currentScope: [outScope, inScope]
    }));
    let terms = compiler.compile(stxl.map(s =>
      s.addScope(outScope, this.context.bindings, ALL_PHASES)
       .addScope(inScope, this.context.bindings, 0)
    ));

    let importEntries = [];
    let exportEntries = [];
    let pragmas = [];
    let filteredTerms = terms.reduce((acc, t) => {
      return _.cond([
        [isImport, t => {
          importEntries.push(t);
          return acc;
        }],
        [isExport, t => {
          // exportEntries.push(t);
          // return acc.concat(t);
          exportEntries.push(convertExport(t));
          if (isVariableDeclaration(t.declaration)) {
            return acc.concat(new Term('VariableDeclarationStatement', {
              declaration: t.declaration
            }));
          }
          return acc.concat(t.declaration);
        }],
        [isPragma, t => { pragmas.push(t); return acc; } ],
        [_.T, t => acc.concat(t) ]
      ])(t);
    }, List());
    return new Module(
      path,
      mod.isNative,
      List(importEntries),
      List(exportEntries),
      List(pragmas),
      filteredTerms
    );
  }

  compileEntrypoint(source, filename) {
    let stxl = this.loadString(source, false);
    return this.getAtPhase('<<entrypoint>>', 0, stxl);
  }

  // Modules have a unique scope per-phase. We compile each module once at
  // phase 0 and store the compiled module in a map. Then, as we ask for
  // the module in a particular phase, we add that new phase-specific scope
  // to the compiled module and update the map with the module at that specific
  // phase.
  getAtPhase(rawPath, phase, rawStxl = null) {
    let path = rawPath === '<<entrypoint>>' ? rawPath : this.context.moduleResolver(rawPath, this.context.cwd);
    let mapKey = `${path}:${phase}`;
    if (!this.compiledModules.has(mapKey)) {
      if (phase === 0) {
        let stxl = rawStxl != null ? rawStxl : this.load(path);
        this.compiledModules.set(mapKey, this.compile(stxl, path));
      } else {
        let rawMod = this.getAtPhase(rawPath, 0, rawStxl);
        let scope = freshScope(`insideEdge${phase}`);
        this.compiledModules.set(mapKey, new Module(
          rawMod.moduleSpecifier,
          false,
          rawMod.importEntries.map(term => term.addScope(scope, this.context.bindings, phase)),
          rawMod.exportEntries.map(term => term.addScope(scope, this.context.bindings, phase)),
          rawMod.pragmas,
          rawMod.body.map(term => term.addScope(scope, this.context.bindings, phase))
        ));
      }
    }
    return this.compiledModules.get(mapKey);
  }

  has(rawPath, phase = 0) {
    let path = rawPath === '<<entrypoint>>' ? rawPath : this.context.moduleResolver(rawPath, this.context.cwd);
    let key = `${path}:${phase}`;
    return this.compiledModules.has(key) && !this.compiledModules.get(key).isNative;
  }

  registerSyntaxDeclaration(term, phase, store) {
    term.declarators.forEach(decl => {
      let val = evalCompiletimeValue(decl.init.gen(), _.merge(this.context, {
        phase: phase + 1, store
      }));
      collectBindings(decl.binding).forEach(stx => {
        if (phase !== 0) { // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: false
          });
        }
        let resolvedName = stx.resolve(phase);
        store.set(resolvedName, new CompiletimeTransform(val));
      });
    });
  }

  registerVariableDeclaration(term, phase, store) {
    term.declarators.forEach(decl => {
      collectBindings(decl.binding).forEach(stx => {
        if (phase !== 0) { // phase 0 bindings extend the binding map during compilation
          let newBinding = gensym(stx.val());
          this.context.bindings.add(stx, {
            binding: newBinding,
            phase: phase,
            skipDup: term.kind === 'var'
          });
        }
        let resolvedName = stx.resolve(phase);
        store.set(resolvedName, new VarBindingTransform(stx));
      });
    });
  }

  registerFunctionOrClass(term, phase, store) {
    collectBindings(term.name).forEach(stx => {
      if (phase !== 0) {
        let newBinding = gensym(stx.val());
        this.context.bindings.add(stx, {
          binding: newBinding,
          phase: phase,
          skipDup: false
        });
      }
      let resolvedName = stx.resolve(phase);
      store.set(resolvedName, new VarBindingTransform(stx));
    });
  }

  visit(mod, phase, store) {
    // TODO: recursively visit imports
    mod.body.forEach(term => {
      if (isSyntaxDeclarationStatement(term)) {
        this.registerSyntaxDeclaration(term.declaration, phase, store);
      }
    });
    return store;
  }

  invoke(mod, phase, store) {
    // TODO: recursively visit imports
    let body = mod.body.filter(_.complement(isCompiletimeStatement)).map(term => {
      term = term.gen(); // TODO: can we remove the need for gen? have to deeply remove compiletime code
      if (isVariableDeclarationStatement(term)) {
        this.registerVariableDeclaration(term.declaration, phase, store);
      } else if (isFunctionDeclaration(term)) {
        this.registerFunctionOrClass(term, phase, store);
      }
      return term;
    });
    let exportsObj = evalRuntimeValues(body, _.merge(this.context, {
      store, phase
    }));
    return store;
  }
}
