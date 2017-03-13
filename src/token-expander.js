// @flow
import Term, * as S from 'sweet-spec';
import { List } from 'immutable';
import { Enforester } from './enforester';
import TermExpander from './term-expander.js';
import Env from './env';
import * as _ from 'ramda';
import * as T from './terms';
import { gensym } from './symbol';
import { VarBindingTransform, CompiletimeTransform } from './transforms';
import { evalCompiletimeValue } from './load-syntax';
import { freshScope } from './scope';
import { ALL_PHASES } from './syntax';
import ASTDispatcher from './ast-dispatcher';
import Syntax from './syntax.js';
import ScopeReducer from './scope-reducer';
import ModuleVisitor, { bindImports } from './module-visitor';

class RegisterBindingsReducer extends Term.CloneReducer {
  useScope: any;
  phase: number;
  bindings: any;
  skipDup: boolean;
  env: Env;

  constructor(
    useScope: any,
    phase: number,
    skipDup: boolean,
    bindings: any,
    env: Env,
  ) {
    super();
    this.useScope = useScope;
    this.phase = phase;
    this.bindings = bindings;
    this.skipDup = skipDup;
    this.env = env;
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    let newName = s.name.removeScope(this.useScope, this.phase);
    let newBinding = gensym(newName.val());
    this.bindings.add(newName, {
      binding: newBinding,
      phase: this.phase,
      skipDup: this.skipDup,
    });
    this.env.set(newBinding.toString(), new VarBindingTransform(newName));
    return t.extend({
      name: newName,
    });
  }
}

class RegisterSyntaxBindingsReducer extends Term.CloneReducer {
  useScope: any;
  phase: number;
  bindings: any;
  env: Env;
  val: any;

  constructor(useScope: any, phase: number, bindings: any, env: Env, val: any) {
    super();
    this.useScope = useScope;
    this.phase = phase;
    this.bindings = bindings;
    this.env = env;
    this.val = val;
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    let newName = s.name.removeScope(this.useScope, this.phase);
    let newBinding = gensym(newName.val());
    this.bindings.add(newName, {
      binding: newBinding,
      phase: this.phase,
      skipDup: false,
    });
    let resolvedName = newName.resolve(this.phase);
    this.env.set(resolvedName, new CompiletimeTransform(this.val));
    return t.extend({
      name: newName,
    });
  }
}

export default class TokenExpander extends ASTDispatcher {
  constructor(context: any) {
    super('expand', false);
    this.context = context;
  }

  expand(stxl: List<Syntax>) {
    let result = [];
    if (stxl.size === 0) {
      return List(result);
    }
    let prev = List();
    let enf = new Enforester(stxl, prev, this.context);

    while (!enf.done) {
      result.push(this.dispatch(enf.enforest()));
    }

    return List(result);
  }

  expandVariableDeclarationStatement(term: S.VariableDeclarationStatement) {
    return term.extend({
      declaration: this.registerVariableDeclaration(term.declaration),
    });
  }

  expandFunctionDeclaration(term: Term) {
    return this.registerFunctionOrClass(term);
  }

  // TODO: think about function expressions

  registerImport(term: S.Import | S.ImportNamespace) {
    let path = term.moduleSpecifier.val();
    let mod;
    let visitor = new ModuleVisitor(this.context);
    if (term.forSyntax) {
      mod = this.context.loader.get(
        path,
        this.context.phase + 1,
        this.context.cwd,
      );
      this.context.store = visitor.visit(
        mod,
        this.context.phase + 1,
        this.context.store,
      );
      this.context.store = visitor.invoke(
        mod,
        this.context.phase + 1,
        this.context.store,
      );
    } else {
      mod = this.context.loader.get(path, this.context.phase, this.context.cwd);
      this.context.store = visitor.visit(
        mod,
        this.context.phase,
        this.context.store,
      );
    }
    bindImports(term, mod, this.context.phase, this.context);
    return term;
  }

  expandImport(term: S.Import) {
    return this.registerImport(term);
  }

  expandImportNamespace(term: S.ImportNamespace) {
    return this.registerImport(term);
  }

  expandExport(term: Term) {
    if (
      T.isFunctionDeclaration(term.declaration) ||
      T.isClassDeclaration(term.declaration)
    ) {
      return term.extend({
        declaration: this.registerFunctionOrClass(term.declaration),
      });
    } else if (T.isVariableDeclaration(term.declaration)) {
      return term.extend({
        declaration: this.registerVariableDeclaration(term.declaration),
      });
    }
    return term;
  }

  registerFunctionOrClass(term: Term) {
    let red = new RegisterBindingsReducer(
      this.context.useScope,
      this.context.phase,
      false,
      this.context.bindings,
      this.context.env,
    );
    return term.extend({
      name: term.name.reduce(red),
    });
  }

  registerVariableDeclaration(term: Term) {
    if (term.kind === 'syntax' || term.kind === 'syntaxrec') {
      return this.registerSyntaxDeclaration(term);
    }
    let red = new RegisterBindingsReducer(
      this.context.useScope,
      this.context.phase,
      term.kind === 'var',
      this.context.bindings,
      this.context.env,
    );
    return term.extend({
      declarators: term.declarators.map(decl => {
        return decl.extend({
          binding: decl.binding.reduce(red),
        });
      }),
    });
  }

  registerSyntaxDeclaration(term: Term) {
    if (term.kind === 'syntax') {
      // syntax id^{a, b} = <init>^{a, b}
      // ->
      // syntaxrec id^{a,b,c} = function() { return <<id^{a}>> }
      // syntaxrec id^{a,b} = <init>^{a,b,c}
      let scope = freshScope('nonrec');
      let scopeReducer = new ScopeReducer(
        [{ scope: scope, phase: ALL_PHASES, flip: false }],
        this.context.bindings,
      );
      term = term.extend({
        declarators: term.declarators.map(decl => {
          let name = decl.binding.name;
          let nameAdded = name.addScope(
            scope,
            this.context.bindings,
            ALL_PHASES,
          );
          let nameRemoved = name.removeScope(
            this.context.currentScope[this.context.currentScope.length - 1],
            this.context.phase,
          );
          let newBinding = gensym(name.val());
          this.context.bindings.addForward(
            nameAdded,
            nameRemoved,
            newBinding,
            this.context.phase,
          );
          return decl.extend({
            init: decl.init.reduce(scopeReducer),
          });
        }),
      });
    }
    // for syntax declarations we need to load the compiletime value
    // into the environment
    return term.extend({
      declarators: term.declarators.map(decl => {
        // each compiletime value needs to be expanded with a fresh
        // environment and in the next higher phase
        let syntaxExpander = new TermExpander(
          _.merge(this.context, {
            phase: this.context.phase + 1,
            env: new Env(),
            store: this.context.store,
          }),
        );

        let init = syntaxExpander.expand(decl.init);
        let val = evalCompiletimeValue(
          init,
          _.merge(this.context, {
            phase: this.context.phase + 1,
          }),
        );
        let red = new RegisterSyntaxBindingsReducer(
          this.context.useScope,
          this.context.phase,
          this.context.bindings,
          this.context.env,
          val,
        );
        return decl.extend({ binding: decl.binding.reduce(red), init });
      }),
    });
  }

  // registerSyntaxDeclarator(term) {
  //
  // }
}
