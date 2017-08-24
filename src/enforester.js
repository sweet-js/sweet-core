// @flow
import {
  isIdentifierExpression,
  isStaticMemberExpression,
  isComputedMemberExpression,
} from './terms';
import Term, * as T from 'sweet-spec';
import { Maybe } from 'ramda-fantasy';
import ScopeReducer from './scope-reducer';
const Just = Maybe.Just;
const Nothing = Maybe.Nothing;

import {
  FunctionDeclTransform,
  VariableDeclTransform,
  NewTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
  SyntaxrecDeclTransform,
  OperatorDeclTransform,
  ReturnStatementTransform,
  WhileTransform,
  IfTransform,
  ForTransform,
  SwitchTransform,
  BreakTransform,
  ContinueTransform,
  DoTransform,
  DebuggerTransform,
  YieldTransform,
  WithTransform,
  ImportTransform,
  ExportTransform,
  SuperTransform,
  ThisTransform,
  ClassTransform,
  DefaultTransform,
  TryTransform,
  ThrowTransform,
  CompiletimeTransform,
  VarBindingTransform,
  ModuleNamespaceTransform,
  AsyncTransform,
  AwaitTransform,
} from './transforms';
import { List } from 'immutable';
import { expect, assert } from './errors';
import {
  isOperator,
  isUnaryOperator,
  getOperatorAssoc,
  getOperatorPrec,
  operatorLt,
} from './operators';
import Syntax, { ALL_PHASES } from './syntax';
import type { SymbolClass } from './symbol';

import { freshScope } from './scope';
import { sanitizeReplacementValues } from './load-syntax';

import MacroContext from './macro-context';

const EXPR_LOOP_OPERATOR = {};
const EXPR_LOOP_NO_CHANGE = {};
const EXPR_LOOP_EXPANSION = {};

function getLineNumber(x: any) {
  let stx;
  if (x instanceof Syntax) {
    stx = x;
  } else if (x instanceof T.RawSyntax) {
    stx = x.value;
  } else if (x instanceof T.RawDelimiter) {
    return getLineNumber(x.inner.first());
  } else {
    throw new Error(`Not implemented yet ${x}`);
  }
  return stx.lineNumber();
}

export class Enforester {
  done: boolean;
  term: ?Term;
  rest: List<Term>;
  prev: List<Term>;
  context: {
    env: Map<string, any>,
    store: Map<string, any>,
    phase: number | {},
    useScope: SymbolClass,
    bindings: any,
    allowAwait?: boolean,
  };
  opCtx: {
    prec: number,
    combine: (x: any) => any,
    stack: List<*>,
  };

  constructor(stxl: List<Term>, prev: List<Term>, context: any) {
    this.done = false;
    assert(List.isList(stxl), 'expecting a list of terms to enforest');
    assert(List.isList(prev), 'expecting a list of terms to enforest');
    assert(context, 'expecting a context to enforest');
    this.term = null;

    this.rest = stxl;
    this.prev = prev;

    this.context = context;
  }

  peek(n: number = 0): ?Term {
    return this.rest.get(n);
  }

  advance() {
    let ret: ?Term = this.rest.first();
    this.rest = this.rest.rest();
    return ret;
  }

  /*
   enforest works over:
   prev - a list of the previously enforest Terms
   term - the current term being enforested (initially null)
   rest - remaining Terms to enforest
   */
  enforest(type?: 'expression' | 'Module' = 'Module') {
    // initialize the term
    this.term = null;

    if (this.rest.size === 0) {
      this.done = true;
      return this.term;
    }

    let result;
    if (type === 'expression') {
      result = this.enforestExpressionLoop();
    } else {
      result = this.enforestModule();
    }

    if (this.rest.size === 0) {
      this.done = true;
    }
    return result;
  }

  enforestModule() {
    return this.enforestBody();
  }

  enforestBody() {
    return this.enforestModuleItem();
  }

  enforestModuleItem() {
    let lookahead = this.peek();

    if (this.isImportTransform(lookahead)) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isExportTransform(lookahead)) {
      this.advance();
      return this.enforestExportDeclaration();
    }
    return this.enforestStatement();
  }

  enforestExportDeclaration() {
    let lookahead = this.peek();
    if (this.isCompiletimeTransform(lookahead)) {
      this.expandMacro();
      lookahead = this.peek();
    }

    if (this.isPunctuator(lookahead, '*')) {
      this.advance();
      return new T.ExportAllFrom({
        moduleSpecifier: this.enforestFromClause(),
      });
    } else if (this.isBraces(lookahead)) {
      let namedExports = this.enforestExportClause();
      if (this.isIdentifier(this.peek(), 'from')) {
        return new T.ExportFrom({
          namedExports: namedExports.map(s => new T.ExportFromSpecifier(s)),
          moduleSpecifier: this.enforestFromClause(),
        });
      }
      return new T.ExportLocals({
        namedExports: namedExports.map(
          s =>
            new T.ExportLocalSpecifier({
              name: new T.IdentifierExpression({
                name: s.name,
              }),
              exportedName: s.exportedName,
            }),
        ),
      });
    } else if (this.isClassTransform(lookahead)) {
      return new T.Export({
        declaration: this.enforestClass({
          isExpr: false,
        }),
      });
    } else if (this.isFnDeclTransform(lookahead)) {
      return new T.Export({
        declaration: this.enforestFunction({
          isExpr: false,
        }),
      });
    } else if (
      this.isAsyncTransform(lookahead) &&
      this.isFnDeclTransform(this.peek(1)) &&
      this.lineNumberEq(lookahead, this.peek(1))
    ) {
      this.advance();
      return new T.Export({
        declaration: this.enforestFunction({
          isExpr: false,
          isAsync: true,
        }),
      });
    } else if (this.isDefaultTransform(lookahead)) {
      this.advance();
      if (this.isCompiletimeTransform(lookahead)) {
        this.expandMacro();
        lookahead = this.peek();
      }

      if (this.isFnDeclTransform(this.peek())) {
        return new T.ExportDefault({
          body: this.enforestFunction({
            isExpr: false,
            inDefault: true,
          }),
        });
      } else if (
        this.isAsyncTransform(lookahead) &&
        this.isFnDeclTransform(this.peek(1)) &&
        this.lineNumberEq(lookahead, this.peek(1))
      ) {
        this.advance();
        return new T.ExportDefault({
          body: this.enforestFunction({
            isExpr: false,
            inDefault: true,
            isAsync: true,
          }),
        });
      } else if (this.isClassTransform(this.peek())) {
        return new T.ExportDefault({
          body: this.enforestClass({
            isExpr: false,
            inDefault: true,
          }),
        });
      } else {
        let body = this.enforestExpressionLoop();
        this.consumeSemicolon();
        return new T.ExportDefault({
          body,
        });
      }
    } else if (
      this.isVarDeclTransform(lookahead) ||
      this.isLetDeclTransform(lookahead) ||
      this.isConstDeclTransform(lookahead) ||
      this.isSyntaxrecDeclTransform(lookahead) ||
      this.isSyntaxDeclTransform(lookahead) ||
      this.isOperatorDeclTransform(lookahead)
    ) {
      return new T.Export({
        declaration: this.enforestVariableDeclaration(),
      });
    }
    throw this.createError(lookahead, 'unexpected syntax');
  }

  enforestExportClause() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestExportSpecifier());
      enf.consumeComma();
    }
    return List(result);
  }

  enforestExportSpecifier() {
    const name = this.enforestIdentifier();
    let exportedName = null;
    if (this.isIdentifier(this.peek(), 'as')) {
      this.advance();
      exportedName = this.enforestIdentifier();
    }
    return {
      name,
      exportedName,
    };
  }

  enforestImportDeclaration() {
    let lookahead = this.peek();
    let defaultBinding = null;
    let namedImports = List();
    let forSyntax = false;

    if (this.isStringLiteral(lookahead)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new T.Import({
        defaultBinding,
        namedImports,
        moduleSpecifier,
        forSyntax,
      });
    }

    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
      defaultBinding = this.enforestBindingIdentifier();
      if (!this.isPunctuator(this.peek(), ',')) {
        let moduleSpecifier = this.enforestFromClause();
        if (
          this.isKeyword(this.peek(), 'for') &&
          this.isIdentifier(this.peek(1), 'syntax')
        ) {
          this.advance();
          this.advance();
          forSyntax = true;
        }

        return new T.Import({
          defaultBinding,
          moduleSpecifier,
          namedImports: List(),
          forSyntax,
        });
      }
    }
    this.consumeComma();
    lookahead = this.peek();
    if (this.isBraces(lookahead)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (
        this.isKeyword(this.peek(), 'for') &&
        this.isIdentifier(this.peek(1), 'syntax')
      ) {
        this.advance();
        this.advance();
        forSyntax = true;
      }

      return new T.Import({
        defaultBinding,
        forSyntax,
        namedImports: imports,
        moduleSpecifier: fromClause,
      });
    } else if (this.isPunctuator(lookahead, '*')) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (
        this.isKeyword(this.peek(), 'for') &&
        this.isIdentifier(this.peek(1), 'syntax')
      ) {
        this.advance();
        this.advance();
        forSyntax = true;
      }
      return new T.ImportNamespace({
        defaultBinding,
        forSyntax,
        namespaceBinding,
        moduleSpecifier,
      });
    }
    throw this.createError(lookahead, 'unexpected syntax');
  }

  enforestNamespaceBinding() {
    this.matchPunctuator('*');
    this.matchIdentifier('as');
    return this.enforestBindingIdentifier();
  }

  enforestNamedImports() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestImportSpecifiers());
      enf.consumeComma();
    }
    return List(result);
  }

  enforestImportSpecifiers() {
    let lookahead = this.peek();
    let name;
    if (
      this.isIdentifier(lookahead) ||
      this.isKeyword(lookahead) ||
      this.isPunctuator(lookahead)
    ) {
      name = this.matchRawSyntax();
      if (!this.isIdentifier(this.peek(), 'as')) {
        return new T.ImportSpecifier({
          name: null,
          binding: new T.BindingIdentifier({
            name: name,
          }),
        });
      } else {
        this.matchIdentifier('as');
      }
    } else {
      throw this.createError(lookahead, 'unexpected token in import specifier');
    }
    return new T.ImportSpecifier({
      name,
      binding: this.enforestBindingIdentifier(),
    });
  }

  enforestFromClause() {
    this.matchIdentifier('from');
    let lookahead = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead;
  }

  enforestStatementListItem() {
    let lookahead = this.peek();

    if (this.isFnDeclTransform(lookahead)) {
      return this.enforestFunction({
        isExpr: false,
      });
    } else if (
      this.isAsyncTransform(lookahead) &&
      this.isFnDeclTransform(this.peek(1)) &&
      this.lineNumberEq(lookahead, this.peek(1))
    ) {
      this.advance();
      return this.enforestFunction({
        isExpr: false,
        isAsync: true,
      });
    } else if (this.isClassTransform(lookahead)) {
      return this.enforestClass({
        isExpr: false,
      });
    } else {
      return this.enforestStatement();
    }
  }

  enforestStatement() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      this.expandMacro();
      lookahead = this.peek();
    }

    if (
      this.term === null &&
      this.isTerm(lookahead) &&
      lookahead instanceof T.Statement
    ) {
      // TODO: check that this is actually an statement
      return this.advance();
    }

    if (this.term === null && this.isBraces(lookahead)) {
      return this.enforestBlockStatement();
    }

    if (this.term === null && this.isWhileTransform(lookahead)) {
      return this.enforestWhileStatement();
    }

    if (this.term === null && this.isIfTransform(lookahead)) {
      return this.enforestIfStatement();
    }
    if (this.term === null && this.isForTransform(lookahead)) {
      return this.enforestForStatement();
    }
    if (this.term === null && this.isSwitchTransform(lookahead)) {
      return this.enforestSwitchStatement();
    }
    if (this.term === null && this.isBreakTransform(lookahead)) {
      return this.enforestBreakStatement();
    }
    if (this.term === null && this.isContinueTransform(lookahead)) {
      return this.enforestContinueStatement();
    }
    if (this.term === null && this.isDoTransform(lookahead)) {
      return this.enforestDoStatement();
    }
    if (this.term === null && this.isDebuggerTransform(lookahead)) {
      return this.enforestDebuggerStatement();
    }
    if (this.term === null && this.isWithTransform(lookahead)) {
      return this.enforestWithStatement();
    }
    if (this.term === null && this.isTryTransform(lookahead)) {
      return this.enforestTryStatement();
    }
    if (this.term === null && this.isThrowTransform(lookahead)) {
      return this.enforestThrowStatement();
    }

    // TODO: put somewhere else
    if (this.term === null && this.isKeyword(lookahead, 'class')) {
      return this.enforestClass({
        isExpr: false,
      });
    }

    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunction({
        isExpr: false,
      });
    }

    if (
      this.term === null &&
      this.isAsyncTransform(lookahead) &&
      this.isFnDeclTransform(this.peek(1)) &&
      this.lineNumberEq(lookahead, this.peek(1))
    ) {
      this.advance();
      return this.enforestFunction({
        isExpr: false,
        isAsync: true,
      });
    }

    if (
      this.term === null &&
      this.isIdentifier(lookahead) &&
      this.isPunctuator(this.peek(1), ':')
    ) {
      return this.enforestLabeledStatement();
    }

    if (
      this.term === null &&
      (this.isVarDeclTransform(lookahead) ||
        this.isLetDeclTransform(lookahead) ||
        this.isConstDeclTransform(lookahead) ||
        this.isSyntaxrecDeclTransform(lookahead) ||
        this.isSyntaxDeclTransform(lookahead) ||
        this.isOperatorDeclTransform(lookahead))
    ) {
      let stmt = new T.VariableDeclarationStatement({
        declaration: this.enforestVariableDeclaration(),
      });
      this.consumeSemicolon();
      return stmt;
    }

    if (this.term === null && this.isReturnStmtTransform(lookahead)) {
      return this.enforestReturnStatement();
    }

    if (this.term === null && this.isPunctuator(lookahead, ';')) {
      this.advance();
      return new T.EmptyStatement({});
    }

    return this.enforestExpressionStatement();
  }

  enforestLabeledStatement() {
    let label = this.matchIdentifier();
    this.matchPunctuator(':');
    let stmt = this.enforestStatement();

    return new T.LabeledStatement({
      label: label,
      body: stmt,
    });
  }

  enforestBreakStatement() {
    this.matchKeyword('break');
    let lookahead = this.peek();
    let label = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new T.BreakStatement({
        label,
      });
    }
    if (
      this.isIdentifier(lookahead) ||
      this.isKeyword(lookahead, 'yield') ||
      this.isKeyword(lookahead, 'let')
    ) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new T.BreakStatement({
      label,
    });
  }

  enforestTryStatement() {
    this.matchKeyword('try');
    let body = this.enforestBlock();
    if (this.isKeyword(this.peek(), 'catch')) {
      let catchClause = this.enforestCatchClause();
      if (this.isKeyword(this.peek(), 'finally')) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new T.TryFinallyStatement({
          body,
          catchClause,
          finalizer,
        });
      }
      return new T.TryCatchStatement({
        body,
        catchClause,
      });
    }
    if (this.isKeyword(this.peek(), 'finally')) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new T.TryFinallyStatement({
        body,
        catchClause: null,
        finalizer,
      });
    }
    throw this.createError(this.peek(), 'try with no catch or finally');
  }

  enforestCatchClause() {
    this.matchKeyword('catch');
    let bindingParens = this.matchParens();
    let enf = new Enforester(bindingParens, List(), this.context);
    let binding = enf.enforestBindingTarget();
    let body = this.enforestBlock();
    return new T.CatchClause({
      binding,
      body,
    });
  }

  enforestThrowStatement() {
    this.matchKeyword('throw');
    let expression = this.enforestExpression();
    this.consumeSemicolon();
    return new T.ThrowStatement({
      expression,
    });
  }

  enforestWithStatement() {
    this.matchKeyword('with');
    let objParens = this.matchParens();
    let enf = new Enforester(objParens, List(), this.context);
    let object = enf.enforestExpression();
    let body = this.enforestStatement();
    return new T.WithStatement({
      object,
      body,
    });
  }

  enforestDebuggerStatement() {
    this.matchKeyword('debugger');

    return new T.DebuggerStatement({});
  }

  enforestDoStatement() {
    this.matchKeyword('do');
    let body = this.enforestStatement();
    this.matchKeyword('while');
    let testBody = this.matchParens();
    let enf = new Enforester(testBody, List(), this.context);
    let test = enf.enforestExpression();
    this.consumeSemicolon();
    return new T.DoWhileStatement({
      body,
      test,
    });
  }

  enforestContinueStatement() {
    let kwd = this.matchKeyword('continue');
    let lookahead = this.peek();
    let label = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new T.ContinueStatement({
        label,
      });
    }
    if (
      lookahead instanceof T.RawSyntax &&
      this.lineNumberEq(kwd, lookahead) &&
      (this.isIdentifier(lookahead) ||
        this.isKeyword(lookahead, 'yield') ||
        this.isKeyword(lookahead, 'let'))
    ) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new T.ContinueStatement({
      label,
    });
  }

  enforestSwitchStatement() {
    this.matchKeyword('switch');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let discriminant = enf.enforestExpression();
    let body = this.matchCurlies();

    if (body.size === 0) {
      return new T.SwitchStatement({
        discriminant: discriminant,
        cases: List(),
      });
    }
    enf = new Enforester(body, List(), this.context);
    let cases = enf.enforestSwitchCases();
    let lookahead = enf.peek();
    if (enf.isKeyword(lookahead, 'default')) {
      let defaultCase = enf.enforestSwitchDefault();
      let postDefaultCases = enf.enforestSwitchCases();
      return new T.SwitchStatementWithDefault({
        discriminant,
        preDefaultCases: cases,
        defaultCase,
        postDefaultCases,
      });
    }
    return new T.SwitchStatement({
      discriminant,
      cases,
    });
  }

  enforestSwitchCases() {
    let cases = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default'))) {
      cases.push(this.enforestSwitchCase());
    }
    return List(cases);
  }

  enforestSwitchCase() {
    this.matchKeyword('case');
    return new T.SwitchCase({
      test: this.enforestExpression(),
      consequent: this.enforestSwitchCaseBody(),
    });
  }

  enforestSwitchCaseBody() {
    this.matchPunctuator(':');
    return this.enforestStatementListInSwitchCaseBody();
  }

  enforestStatementListInSwitchCaseBody() {
    let result = [];
    while (
      !(
        this.rest.size === 0 ||
        this.isKeyword(this.peek(), 'default') ||
        this.isKeyword(this.peek(), 'case')
      )
    ) {
      result.push(this.enforestStatementListItem());
    }
    return List(result);
  }

  enforestSwitchDefault() {
    this.matchKeyword('default');
    return new T.SwitchDefault({
      consequent: this.enforestSwitchCaseBody(),
    });
  }

  enforestForStatement() {
    this.matchKeyword('for');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let lookahead, test, init, right, left, update, cnst;

    // case where init is null
    if (enf.isPunctuator(enf.peek(), ';')) {
      enf.advance();
      if (!enf.isPunctuator(enf.peek(), ';')) {
        test = enf.enforestExpression();
      }
      enf.matchPunctuator(';');
      if (enf.rest.size !== 0) {
        right = enf.enforestExpression();
      }
      return new T.ForStatement({
        init: null,
        test: test,
        update: right,
        body: this.enforestStatement(),
      });
      // case where init is not null
    } else {
      // testing
      lookahead = enf.peek();
      if (
        enf.isVarDeclTransform(lookahead) ||
        enf.isLetDeclTransform(lookahead) ||
        enf.isConstDeclTransform(lookahead)
      ) {
        init = enf.enforestVariableDeclaration();
        lookahead = enf.peek();
        if (
          this.isKeyword(lookahead, 'in') ||
          this.isIdentifier(lookahead, 'of')
        ) {
          if (this.isKeyword(lookahead, 'in')) {
            enf.advance();
            right = enf.enforestExpression();
            cnst = T.ForInStatement;
          } else {
            assert(
              this.isIdentifier(lookahead, 'of'),
              'expecting `of` keyword',
            );
            enf.advance();
            right = enf.enforestExpression();
            cnst = T.ForOfStatement;
          }
          return new cnst({
            left: init,
            right,
            body: this.enforestStatement(),
          });
        }
        enf.matchPunctuator(';');
        if (enf.isPunctuator(enf.peek(), ';')) {
          enf.advance();
          test = null;
        } else {
          test = enf.enforestExpression();
          enf.matchPunctuator(';');
        }
        update = enf.enforestExpression();
      } else {
        if (
          this.isKeyword(enf.peek(1), 'in') ||
          this.isIdentifier(enf.peek(1), 'of')
        ) {
          left = enf.enforestBindingIdentifier();
          let kind = enf.advance();
          if (this.isKeyword(kind, 'in')) {
            cnst = T.ForInStatement;
          } else {
            left = this.transformDestructuring(left);
            cnst = T.ForOfStatement;
          }
          right = enf.enforestExpression();
          return new cnst({
            left: left,
            right,
            body: this.enforestStatement(),
          });
        }
        init = enf.enforestExpression();
        enf.matchPunctuator(';');
        if (enf.isPunctuator(enf.peek(), ';')) {
          enf.advance();
          test = null;
        } else {
          test = enf.enforestExpression();
          enf.matchPunctuator(';');
        }
        update = enf.enforestExpression();
      }
      return new T.ForStatement({
        init,
        test,
        update,
        body: this.enforestStatement(),
      });
    }
  }

  enforestIfStatement() {
    this.matchKeyword('if');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let lookahead = enf.peek();
    let test = enf.enforestExpression();
    if (test === null) {
      throw enf.createError(lookahead, 'expecting an expression');
    }
    let consequent = this.enforestStatement();
    let alternate = null;
    if (this.isKeyword(this.peek(), 'else')) {
      this.advance();
      alternate = this.enforestStatement();
    }
    return new T.IfStatement({
      test,
      consequent,
      alternate,
    });
  }

  enforestWhileStatement() {
    this.matchKeyword('while');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let lookahead = enf.peek();
    let test = enf.enforestExpression();
    if (test === null) {
      throw enf.createError(lookahead, 'expecting an expression');
    }
    let body = this.enforestStatement();

    return new T.WhileStatement({
      test,
      body,
    });
  }

  enforestBlockStatement() {
    return new T.BlockStatement({
      block: this.enforestBlock(),
    });
  }

  enforestBlock() {
    return new T.Block({
      statements: this.matchCurlies(),
    });
  }

  enforestClass({
    isExpr = false,
    inDefault = false,
  }: {
    isExpr?: boolean,
    inDefault?: boolean,
  }) {
    let kw = this.matchRawSyntax();
    let name = null,
      supr = null;

    if (this.isIdentifier(this.peek())) {
      name = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name = new T.BindingIdentifier({
          name: Syntax.fromIdentifier('_default', kw),
        });
      } else {
        throw this.createError(this.peek(), 'unexpected syntax');
      }
    }

    if (this.isKeyword(this.peek(), 'extends')) {
      this.advance();
      supr = this.enforestExpressionLoop();
    }

    let elements = [];
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    while (enf.rest.size !== 0) {
      if (enf.isPunctuator(enf.peek(), ';')) {
        enf.advance();
        continue;
      }

      let isStatic = false;
      let { methodOrKey, kind } = enf.enforestMethodDefinition();
      if (
        kind === 'identifier' &&
        methodOrKey instanceof T.StaticPropertyName &&
        methodOrKey.value.val() === 'static'
      ) {
        isStatic = true;
        ({ methodOrKey, kind } = enf.enforestMethodDefinition());
      }
      if (kind === 'method') {
        elements.push(
          new T.ClassElement({
            isStatic,
            method: methodOrKey,
          }),
        );
      } else {
        throw this.createError(
          enf.peek(),
          'Only methods are allowed in classes',
        );
      }
    }
    return new (isExpr ? T.ClassExpression : T.ClassDeclaration)({
      name,
      super: supr,
      elements: List(elements),
    });
  }

  enforestBindingTarget(
    {
      allowPunctuator = false,
    }: {
      allowPunctuator?: boolean,
    } = {},
  ) {
    let lookahead = this.peek();
    if (
      this.isIdentifier(lookahead) ||
      this.isKeyword(lookahead) ||
      (allowPunctuator && this.isPunctuator(lookahead))
    ) {
      return this.enforestBindingIdentifier({
        allowPunctuator,
      });
    } else if (this.isBrackets(lookahead)) {
      return this.enforestArrayBinding();
    } else if (this.isBraces(lookahead)) {
      return this.enforestObjectBinding();
    }
    assert(false, 'not implemented yet');
  }

  enforestObjectBinding() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let properties = [];

    //TODO: implement object rest operator when it lands
    while (enf.rest.size !== 0) {
      properties.push(enf.enforestBindingProperty());

      if (enf.rest.size > 0 && !enf.isPunctuator(enf.peek(), ',')) {
        throw enf.createError(enf.peek(), 'unexpected token');
      }

      enf.consumeComma();
    }

    return new T.ObjectBinding({
      properties: List(properties),
    });
  }

  enforestBindingProperty() {
    let lookahead = this.peek();
    let { name, binding } = this.enforestPropertyName();
    if (
      this.isIdentifier(lookahead) ||
      this.isKeyword(lookahead, 'let') ||
      this.isKeyword(lookahead, 'yield')
    ) {
      if (!this.isPunctuator(this.peek(), ':')) {
        if (this.isAssign(this.peek())) {
          this.advance();
          let expr = this.enforestExpressionLoop();
          return new T.BindingPropertyProperty({
            name,
            binding: new T.BindingWithDefault({
              binding,
              init: expr,
            }),
          });
        }
        return new T.BindingPropertyProperty({
          name,
          binding,
        });
      }
    }
    this.matchPunctuator(':');
    binding = this.enforestBindingElement();
    return new T.BindingPropertyProperty({
      name,
      binding,
    });
  }

  enforestArrayBinding() {
    let bracket = this.matchSquares();
    let enf = new Enforester(bracket, List(), this.context);
    let elements = [],
      rest = null;
    while (enf.rest.size !== 0) {
      let el = null;
      if (!enf.isPunctuator(enf.peek(), ',')) {
        if (enf.isPunctuator(enf.peek(), '...')) {
          enf.advance();
          rest = enf.enforestBindingTarget();
          if (enf.rest.size > 0) {
            throw enf.createError(
              enf.rest.first(),
              'Rest element must be last element in array',
            );
          }
        } else {
          el = enf.enforestBindingElement();

          if (el == null) {
            throw enf.createError(enf.peek(), 'expected expression');
          }
          if (enf.rest.size > 0 && !enf.isPunctuator(enf.peek(), ',')) {
            throw enf.createError(enf.peek(), 'unexpected token');
          }
        }
      }
      if (rest == null) {
        elements.push(el);
        enf.consumeComma();
      }
    }
    return new T.ArrayBinding({
      elements: List(elements),
      rest,
    });
  }

  enforestBindingElement() {
    let binding = this.enforestBindingTarget();

    if (this.isAssign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding = new T.BindingWithDefault({
        binding,
        init,
      });
    }
    return binding;
  }

  enforestBindingIdentifier(
    {
      allowPunctuator,
    }: {
      allowPunctuator?: boolean,
    } = {},
  ) {
    let name;
    if (allowPunctuator && this.isPunctuator(this.peek())) {
      name = this.enforestPunctuator();
    } else {
      name = this.enforestIdentifier();
    }
    return new T.BindingIdentifier({
      name,
    });
  }

  enforestPunctuator() {
    let lookahead = this.peek();
    if (this.isPunctuator(lookahead)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting a punctuator');
  }

  enforestIdentifier() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting an identifier');
  }

  enforestReturnStatement() {
    let kw = this.matchRawSyntax();
    let lookahead = this.peek();

    // short circuit for the empty expression case
    if (
      this.rest.size === 0 ||
      (lookahead && !this.lineNumberEq(kw, lookahead))
    ) {
      return new T.ReturnStatement({
        expression: null,
      });
    }

    let term = null;
    if (!this.isPunctuator(lookahead, ';')) {
      term = this.enforestExpression();
      expect(
        term != null,
        'Expecting an expression to follow return keyword',
        lookahead,
        this.rest,
      );
    }

    this.consumeSemicolon();
    return new T.ReturnStatement({
      expression: term,
    });
  }

  enforestVariableDeclaration() {
    let kind;
    let lookahead = this.advance();

    if (this.isVarDeclTransform(lookahead)) {
      kind = 'var';
    } else if (this.isLetDeclTransform(lookahead)) {
      kind = 'let';
    } else if (this.isConstDeclTransform(lookahead)) {
      kind = 'const';
    } else if (this.isSyntaxDeclTransform(lookahead)) {
      kind = 'syntax';
    } else if (this.isSyntaxrecDeclTransform(lookahead)) {
      kind = 'syntaxrec';
    } else if (this.isOperatorDeclTransform(lookahead)) {
      kind = 'operator';
    }

    let decls = List();

    while (true) {
      let term = this.enforestVariableDeclarator({
        isSyntax:
          kind === 'syntax' || kind === 'syntaxrec' || kind === 'operator',
        isOperator: kind === 'operator',
      });
      let lookahead = this.peek();
      // TODO: bug in immutable type definitions for concat,
      // upgrade to v4 when it is released
      // https://github.com/facebook/immutable-js/pull/1153
      decls = decls.concat((term: any));

      if (this.isPunctuator(lookahead, ',')) {
        this.advance();
      } else {
        break;
      }
    }

    return new T.VariableDeclaration({
      kind: kind,
      declarators: decls,
    });
  }

  enforestVariableDeclarator({
    isSyntax,
    isOperator,
  }: {
    isSyntax: boolean,
    isOperator: boolean,
  }) {
    let id = this.enforestBindingTarget({
      allowPunctuator: isSyntax,
    });
    const AssocValues = ['left', 'right', 'prefix', 'postfix'];

    let assoc, prec;
    if (isOperator) {
      assoc = this.matchIdentifier();
      if (AssocValues.indexOf(assoc.val()) === -1) {
        throw this.createError(
          this.peek(),
          `Associativity must be one of ${AssocValues.join(',')}`,
        );
      }
      prec = this.matchLiteral();
    }

    let init;
    if (this.isPunctuator(this.peek(), '=')) {
      this.advance();
      let enf = new Enforester(this.rest, List(), this.context);
      init = enf.enforest('expression');
      this.rest = enf.rest;
    } else {
      init = null;
    }

    if (isOperator) {
      return new T.OperatorDeclarator({
        binding: id,
        init,
        prec,
        assoc,
      });
    }
    return new T.VariableDeclarator({
      binding: id,
      init: init,
    });
  }

  enforestExpressionStatement() {
    let start = this.rest.get(0);
    let expr = this.enforestExpression();
    if (expr === null) {
      throw this.createError(start, 'not a valid expression');
    }
    this.consumeSemicolon();

    return new T.ExpressionStatement({
      expression: expr,
    });
  }

  enforestExpression() {
    let left = this.enforestExpressionLoop();
    let lookahead = this.peek();
    if (this.isPunctuator(lookahead, ',')) {
      while (this.rest.size !== 0) {
        if (!this.isPunctuator(this.peek(), ',')) {
          break;
        }
        let operator = this.matchRawSyntax();
        let right = this.enforestExpressionLoop();
        left = new T.BinaryExpression({
          left,
          operator: operator.val(),
          right,
        });
      }
    }
    this.term = null;
    return left;
  }

  enforestExpressionLoop() {
    this.term = null;
    this.opCtx = {
      prec: 0,
      combine: x => x,
      stack: List(),
    };

    do {
      let term = this.enforestAssignmentExpression();
      // no change means we've done as much enforesting as possible
      // if nothing changed, maybe we just need to pop the expr stack
      if (term === EXPR_LOOP_NO_CHANGE && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);
        let { prec, combine } = this.opCtx.stack.last();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      } else if (term === EXPR_LOOP_NO_CHANGE) {
        break;
      } else if (term === EXPR_LOOP_OPERATOR || term === EXPR_LOOP_EXPANSION) {
        // operator means an opCtx was pushed on the stack
        this.term = null;
      } else {
        this.term = (term: any); // TODO: don't overload the term's type with EXPR_LOOP_OPERATOR etc.
      }
    } while (true); // get a fixpoint
    return this.term;
  }

  enforestAssignmentExpression() {
    let lookahead = this.peek();

    if (this.term === null && this.isModuleNamespaceTransform(lookahead)) {
      // $FlowFixMe: we need to refactor the enforester to make flow work better
      let namespace = this.getFromCompiletimeEnvironment(this.advance().value);
      this.matchPunctuator('.');
      let name = this.matchIdentifier();
      // $FlowFixMe: we need to refactor the enforester to make flow work better
      let exportedName = namespace.mod.exportedNames.find(
        exName => exName.exportedName.val() === name.val(),
      );
      this.rest = this.rest.unshift(
        new T.RawSyntax({
          value: Syntax.fromIdentifier(name.val(), exportedName.exportedName),
        }),
      );
      lookahead = this.peek();
    }

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      this.expandMacro();
      lookahead = this.peek();
    }

    if (
      this.term === null &&
      this.isTerm(lookahead) &&
      lookahead instanceof T.Expression
    ) {
      // TODO: check that this is actually an expression
      return this.advance();
    }

    if (this.term === null && this.isYieldTransform(lookahead)) {
      return this.enforestYieldExpression();
    }

    if (this.term === null && this.isClassTransform(lookahead)) {
      return this.enforestClass({
        isExpr: true,
      });
    }

    if (
      this.term === null &&
      this.isAsyncTransform(this.peek()) &&
      (this.isIdentifier(this.peek(1)) || this.isParens(this.peek(1))) &&
      this.isPunctuator(this.peek(2), '=>') &&
      this.lineNumberEq(this.peek(0), this.peek(1)) &&
      this.lineNumberEq(this.peek(1), this.peek(2))
    ) {
      this.advance();
      return this.enforestArrowExpression({
        isAsync: true,
      });
    }

    if (
      this.term === null &&
      lookahead &&
      (this.isIdentifier(lookahead) || this.isParens(lookahead)) &&
      this.isPunctuator(this.peek(1), '=>') &&
      this.lineNumberEq(lookahead, this.peek(1))
    ) {
      return this.enforestArrowExpression({ isAsync: false });
    }

    if (this.term === null && this.isSyntaxTemplate(lookahead)) {
      return this.enforestSyntaxTemplate();
    }

    // ($x:expr)
    if (this.term === null && this.isParens(lookahead)) {
      return new T.ParenthesizedExpression({
        inner: this.matchParens(),
      });
    }

    if (
      this.term === null &&
      (this.isKeyword(lookahead, 'this') ||
        (this.isIdentifier(lookahead) &&
          !this.isIdentifier(lookahead, 'await')) ||
        this.isKeyword(lookahead, 'let') ||
        this.isKeyword(lookahead, 'yield') ||
        this.isNumericLiteral(lookahead) ||
        this.isStringLiteral(lookahead) ||
        this.isTemplate(lookahead) ||
        this.isBooleanLiteral(lookahead) ||
        this.isNullLiteral(lookahead) ||
        this.isRegularExpression(lookahead) ||
        this.isFnDeclTransform(lookahead) ||
        this.isAsyncTransform(lookahead) ||
        this.isBraces(lookahead) ||
        this.isBrackets(lookahead))
    ) {
      return this.enforestPrimaryExpression();
    }

    // prefix unary
    if (
      this.term === null &&
      (this.isOperator(lookahead) || this.isCustomPrefixOperator(lookahead))
    ) {
      return this.enforestUnaryExpression();
    }

    if (
      this.term === null &&
      this.isVarBindingTransform(lookahead) &&
      lookahead instanceof T.RawSyntax
    ) {
      let lookstx = lookahead.value;
      // $FlowFixMe
      let id = this.getFromCompiletimeEnvironment(lookstx).id;
      if (id !== lookstx) {
        this.advance();
        this.rest = List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION;
      }
    }

    if (
      (this.term === null &&
        (this.isNewTransform(lookahead) || this.isSuperTransform(lookahead))) ||
      // and then check the cases where the term part of p is something...
      (this.term &&
        // $x:expr . $prop:ident
        ((this.isPunctuator(lookahead, '.') &&
          (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) ||
          // $x:expr [ $b:expr ]
          this.isBrackets(lookahead) ||
          // $x:expr (...)
          this.isParens(lookahead)))
    ) {
      return this.enforestLeftHandSideExpression({
        allowCall: true,
      });
    }

    // $l:expr $op:binaryOperator $r:expr
    if (this.term && this.isCustomBinaryOperator(lookahead)) {
      return this.enforestBinaryExpression();
    }

    // postfix unary
    if (
      this.term &&
      (this.isUpdateOperator(lookahead) ||
        this.isCustomPostfixOperator(lookahead))
    ) {
      return this.enforestUpdateExpression();
    }

    // $l:expr $op:binaryOperator $r:expr
    if (
      this.term &&
      (this.isOperator(lookahead) || this.isCustomBinaryOperator(lookahead))
    ) {
      return this.enforestBinaryExpression();
    }

    // $x:id `...`
    if (this.term && this.isTemplate(lookahead)) {
      return this.enforestTemplateLiteral();
    }

    // $x:expr = $init:expr
    if (this.term && this.isAssign(lookahead)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.matchRawSyntax();

      let enf = new Enforester(this.rest, List(), this.context);
      let init = enf.enforest('expression');
      this.rest = enf.rest;

      if (op.val() === '=') {
        return new T.AssignmentExpression({
          binding,
          expression: init,
        });
      } else {
        return new T.CompoundAssignmentExpression({
          binding,
          operator: op.val(),
          expression: init,
        });
      }
    }

    if (this.term && this.isPunctuator(lookahead, '?')) {
      return this.enforestConditionalExpression();
    }

    return EXPR_LOOP_NO_CHANGE;
  }

  enforestPrimaryExpression() {
    let lookahead = this.peek();
    // $x:ThisExpression
    if (this.term === null && this.isKeyword(lookahead, 'this')) {
      return this.enforestThisExpression();
    }
    if (
      this.term === null &&
      this.isAsyncTransform(lookahead) &&
      this.isFnDeclTransform(this.peek(1)) &&
      this.lineNumberEq(lookahead, this.peek(1))
    ) {
      this.advance();
      return this.enforestFunction({
        isExpr: true,
        isAsync: true,
      });
    }
    // $x:ident
    if (
      this.term === null &&
      (this.isIdentifier(lookahead) ||
        this.isKeyword(lookahead, 'let') ||
        this.isKeyword(lookahead, 'yield'))
    ) {
      return this.enforestIdentifierExpression();
    }
    if (this.term === null && this.isNumericLiteral(lookahead)) {
      return this.enforestNumericLiteral();
    }
    if (this.term === null && this.isStringLiteral(lookahead)) {
      return this.enforestStringLiteral();
    }
    if (this.term === null && this.isTemplate(lookahead)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term === null && this.isBooleanLiteral(lookahead)) {
      return this.enforestBooleanLiteral();
    }
    if (this.term === null && this.isNullLiteral(lookahead)) {
      return this.enforestNullLiteral();
    }
    if (this.term === null && this.isRegularExpression(lookahead)) {
      return this.enforestRegularExpressionLiteral();
    }
    // $x:FunctionExpression
    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunction({
        isExpr: true,
      });
    }
    // { $p:prop (,) ... }
    if (this.term === null && this.isBraces(lookahead)) {
      return this.enforestObjectExpression();
    }
    // [$x:expr (,) ...]
    if (this.term === null && this.isBrackets(lookahead)) {
      return this.enforestArrayExpression();
    }
    assert(false, 'Not a primary expression');
  }

  enforestLeftHandSideExpression({ allowCall }: { allowCall: boolean }) {
    let lookahead = this.peek();

    if (this.isCompiletimeTransform(lookahead)) {
      this.expandMacro();
      lookahead = this.peek();
    }

    if (this.isSuperTransform(lookahead)) {
      this.advance();
      this.term = new T.Super({});
    } else if (this.isNewTransform(lookahead)) {
      this.term = this.enforestNewExpression();
    } else if (this.isThisTransform(lookahead)) {
      this.term = this.enforestThisExpression();
    } else if (this.isBraces(lookahead)) {
      this.term = this.enforestPrimaryExpression();
      return this.term;
    }

    while (true) {
      lookahead = this.peek();
      if (this.isParens(lookahead)) {
        if (!allowCall) {
          // we're dealing with a new expression
          if (
            this.term &&
            (isIdentifierExpression(this.term) ||
              isStaticMemberExpression(this.term) ||
              isComputedMemberExpression(this.term))
          ) {
            return this.term;
          }
          this.term = this.enforestExpressionLoop();
        } else {
          this.term = this.enforestCallExpression();
        }
      } else if (this.isBrackets(lookahead)) {
        this.term = this.term
          ? this.enforestComputedMemberExpression()
          : this.enforestPrimaryExpression();
      } else if (
        this.isPunctuator(lookahead, '.') &&
        (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))
      ) {
        this.term = this.enforestStaticMemberExpression();
      } else if (this.isTemplate(lookahead)) {
        this.term = this.enforestTemplateLiteral();
      } else if (this.isIdentifier(lookahead)) {
        if (this.term) break;
        this.term = new T.IdentifierExpression({
          name: this.enforestIdentifier(),
        });
      } else {
        break;
      }
    }
    return this.term;
  }

  enforestBooleanLiteral() {
    return new T.LiteralBooleanExpression({
      value: this.matchRawSyntax().val() === 'true',
    });
  }

  enforestTemplateLiteral() {
    return new T.TemplateExpression({
      tag: this.term,
      elements: this.enforestTemplateElements(),
    });
  }

  enforestStringLiteral() {
    return new T.LiteralStringExpression({
      value: this.matchRawSyntax().val(),
    });
  }

  enforestNumericLiteral() {
    let num = this.matchRawSyntax();
    if (num.val() === 1 / 0) {
      return new T.LiteralInfinityExpression({});
    }
    return new T.LiteralNumericExpression({
      value: num.val(),
    });
  }

  enforestIdentifierExpression() {
    return new T.IdentifierExpression({
      name: this.matchRawSyntax(),
    });
  }

  enforestRegularExpressionLiteral() {
    let reStx = this.matchRawSyntax();

    let lastSlash = reStx.token.value.lastIndexOf('/');
    let pattern = reStx.token.value.slice(1, lastSlash);
    let flags = reStx.token.value.slice(lastSlash + 1);
    return new T.LiteralRegExpExpression({
      pattern,
      global: flags.includes('g'),
      ignoreCase: flags.includes('i'),
      multiline: flags.includes('m'),
      sticky: flags.includes('y'),
      unicode: flags.includes('u'),
    });
  }

  enforestNullLiteral() {
    this.advance();
    return new T.LiteralNullExpression({});
  }

  enforestThisExpression() {
    return new T.ThisExpression({
      stx: this.matchRawSyntax(),
    });
  }

  enforestArgumentList() {
    let result = [];
    while (this.rest.size > 0) {
      let arg;
      if (this.isPunctuator(this.peek(), '...')) {
        this.advance();
        arg = new T.SpreadElement({
          expression: this.enforestExpressionLoop(),
        });
      } else {
        arg = this.enforestExpressionLoop();
      }
      if (this.rest.size > 0) {
        this.matchPunctuator(',');
      }
      result.push(arg);
    }
    return List(result);
  }

  enforestNewExpression() {
    this.matchKeyword('new');
    if (
      this.isPunctuator(this.peek(), '.') &&
      this.isIdentifier(this.peek(1), 'target')
    ) {
      this.advance();
      this.advance();
      return new T.NewTargetExpression({});
    }

    let callee = this.enforestLeftHandSideExpression({
      allowCall: false,
    });
    let args;
    if (this.isParens(this.peek())) {
      args = this.matchParens();
    } else {
      args = List();
    }
    return new T.NewExpression({
      callee,
      arguments: args,
    });
  }

  enforestComputedMemberExpression() {
    let enf = new Enforester(this.matchSquares(), List(), this.context);
    return new T.ComputedMemberExpression({
      object: this.term,
      expression: enf.enforestExpression(),
    });
  }

  transformDestructuring(term: any) {
    switch (term.type) {
      case 'IdentifierExpression':
        return new T.AssignmentTargetIdentifier({
          name: term.name,
        });

      case 'ParenthesizedExpression': {
        let enf = new Enforester(term.inner, List(), this.context);
        let expr = enf.enforestExpression();
        return this.transformDestructuring(expr);
      }
      case 'DataProperty':
        return new T.AssignmentTargetPropertyProperty({
          name: term.name,
          binding: this.transformDestructuringWithDefault(term.expression),
        });
      case 'ShorthandProperty':
        return new T.AssignmentTargetPropertyIdentifier({
          binding: new T.AssignmentTargetIdentifier({
            name: term.name,
          }),
          init: null,
        });
      case 'ObjectExpression':
        return new T.ObjectAssignmentTarget({
          properties: term.properties.map(t => this.transformDestructuring(t)),
        });
      case 'ArrayExpression': {
        let last = term.elements.last();
        if (last != null && last.type === 'SpreadElement') {
          return new T.ArrayAssignmentTarget({
            elements: term.elements
              .slice(0, -1)
              .map(t => t && this.transformDestructuringWithDefault(t)),
            rest: this.transformDestructuringWithDefault(last.expression),
          });
        } else {
          return new T.ArrayAssignmentTarget({
            elements: term.elements.map(
              t => t && this.transformDestructuringWithDefault(t),
            ),
            rest: null,
          });
        }
      }
      case 'StaticPropertyName':
        return new T.AssignmentTargetIdentifier({
          name: term.value,
        });
      case 'ComputedMemberExpression':
        return new T.ComputedMemberAssignmentTarget({
          object: term.object,
          expression: term.expression,
        });
      case 'StaticMemberExpression':
        return new T.StaticMemberAssignmentTarget({
          object: term.object,
          property: term.property,
        });
      case 'BindingPropertyIdentifier':
        return new T.AssignmentTargetPropertyIdentifier({
          binding: this.transformDestructuring(term.binding),
          init: term.init,
        });
      case 'BindingIdentifier':
        return new T.AssignmentTargetIdentifier({
          name: term.name,
        });
      // case 'ArrayBinding':
      // case 'BindingPropertyProperty':
      // case 'BindingWithDefault':
      // case 'ObjectBinding':
      case 'ObjectAssignmentTarget':
      case 'ArrayAssignmentTarget':
      case 'AssignmentTargetWithDefault':
      case 'AssignmentTargetIdentifier':
      case 'AssignmentTargetPropertyIdentifier':
      case 'AssignmentTargetPropertyProperty':
      case 'StaticMemberAssignmentTarget':
      case 'ComputedMemberAssignmentTarget':
        return term;
    }
    assert(false, 'not implemented yet for ' + term.type);
  }

  transformDestructuringWithDefault(term: any) {
    switch (term.type) {
      case 'AssignmentExpression':
        return new T.AssignmentTargetWithDefault({
          binding: this.transformDestructuring(term.binding),
          init: term.expression,
        });
    }
    return this.transformDestructuring(term);
  }

  enforestCallExpression() {
    let paren = this.matchParens();
    return new T.CallExpressionE({
      callee: this.term,
      arguments: paren,
    });
  }

  enforestArrowExpression({ isAsync }: { isAsync?: boolean }) {
    let enf;
    if (this.isIdentifier(this.peek())) {
      enf = new Enforester(
        List.of((this.advance(): any)),
        List(),
        this.context,
      );
    } else {
      let p = this.matchParens();
      enf = new Enforester(p, List(), this.context);
    }
    let params = enf.enforestFormalParameters();
    this.matchPunctuator('=>');

    let body;
    if (this.isBraces(this.peek())) {
      body = this.matchCurlies();
      return new T.ArrowExpressionE({
        isAsync,
        params,
        body,
      });
    } else {
      enf = new Enforester(this.rest, List(), this.context);
      let originalAwait = this.context.allowAwait;
      this.context.allowAwait = isAsync;
      body = enf.enforestExpressionLoop();
      this.context.allowAwait = originalAwait;
      this.rest = enf.rest;
      return new T.ArrowExpression({
        isAsync,
        params,
        body,
      });
    }
  }

  enforestYieldExpression() {
    let kwd = this.matchKeyword('yield');
    let lookahead = this.peek();

    if (
      this.rest.size === 0 ||
      (lookahead && !this.lineNumberEq(kwd, lookahead))
    ) {
      return new T.YieldExpression({
        expression: null,
      });
    } else {
      let isGenerator = false;
      if (this.isPunctuator(this.peek(), '*')) {
        isGenerator = true;
        this.advance();
      }
      let expr = this.enforestExpression();
      return new (isGenerator
        ? T.YieldGeneratorExpression
        : T.YieldExpression)({
        expression: expr,
      });
    }
  }

  enforestSyntaxTemplate() {
    return new T.SyntaxTemplate({
      template: this.matchRawDelimiter(),
    });
  }

  enforestStaticMemberExpression() {
    let object = this.term;
    this.advance();
    let property = this.matchRawSyntax();

    return new T.StaticMemberExpression({
      object: object,
      property: property,
    });
  }

  enforestArrayExpression() {
    let arr = this.matchSquares();

    let elements = [];

    let enf = new Enforester(arr, List(), this.context);

    while (enf.rest.size > 0) {
      let lookahead = enf.peek();
      let expression = null;
      if (!enf.isPunctuator(lookahead, ',')) {
        let isSpread = false;
        if (enf.isPunctuator(lookahead, '...')) {
          enf.advance();
          isSpread = true;
        }
        expression = enf.enforestExpressionLoop();
        if (expression == null) {
          // this was a macro that expanded to nothing
          continue;
        }
        if (enf.rest.size > 0 && !enf.isPunctuator(enf.peek(), ',')) {
          throw enf.createError(enf.peek(), 'unexpected token');
        }
        if (isSpread) {
          expression = new T.SpreadElement({
            expression,
          });
        }
      }
      enf.consumeComma();
      elements.push(expression);
    }

    return new T.ArrayExpression({
      elements: List(elements),
    });
  }

  enforestObjectExpression() {
    let obj = this.matchCurlies();

    let properties = List();

    let enf = new Enforester(obj, List(), this.context);

    let lastProp = null;
    //TODO: implement object spread operator when it lands
    while (enf.rest.size > 0) {
      let prop = enf.enforestPropertyDefinition();

      if (enf.rest.size > 0 && !enf.isPunctuator(enf.peek(), ',')) {
        throw enf.createError(enf.peek(), 'unexpected token');
      }

      enf.consumeComma();
      // TODO: bug in immutable type definitions for concat,
      // upgrade to v4 when it is released
      // https://github.com/facebook/immutable-js/pull/1153
      properties = properties.concat((prop: any));

      if (lastProp === prop) {
        throw enf.createError(prop, 'invalid syntax in object');
      }
      lastProp = prop;
    }

    return new T.ObjectExpression({
      properties: properties,
    });
  }

  enforestPropertyDefinition() {
    let { methodOrKey, kind } = this.enforestMethodDefinition();

    switch (kind) {
      case 'method':
        return methodOrKey;
      case 'identifier':
        if (this.isAssign(this.peek())) {
          this.advance();
          let init = this.enforestExpressionLoop();
          return new T.BindingPropertyIdentifier({
            init,
            binding: this.transformDestructuring(methodOrKey),
          });
        } else if (!this.isPunctuator(this.peek(), ':')) {
          return new T.ShorthandProperty({
            name: (methodOrKey: any).value,
          });
        }
    }

    this.matchPunctuator(':');
    let expr = this.enforestExpressionLoop();

    return new T.DataProperty({
      name: methodOrKey,
      expression: expr,
    });
  }

  enforestMethodDefinition() {
    let lookahead = this.peek();
    let isGenerator = false;
    let isAsync = false;
    if (this.isPunctuator(lookahead, '*')) {
      isGenerator = true;
      this.advance();
    }

    if (
      this.isIdentifier(lookahead, 'async') &&
      !this.isPunctuator(this.peek(1), ':')
    ) {
      isAsync = true;
      this.advance();
    }

    if (
      this.isIdentifier(lookahead, 'get') &&
      this.isPropertyName(this.peek(1))
    ) {
      this.advance();
      let { name } = this.enforestPropertyName();
      this.matchParens();
      let body = this.matchCurlies();
      return {
        methodOrKey: new T.Getter({
          name,
          body,
        }),
        kind: 'method',
      };
    } else if (
      this.isIdentifier(lookahead, 'set') &&
      this.isPropertyName(this.peek(1))
    ) {
      this.advance();
      let { name } = this.enforestPropertyName();
      let enf = new Enforester(this.matchParens(), List(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return {
        methodOrKey: new T.Setter({
          name,
          param,
          body,
        }),
        kind: 'method',
      };
    }
    let { name } = this.enforestPropertyName();
    if (this.isParens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester(params, List(), this.context);
      let formalParams = enf.enforestFormalParameters();

      let body = this.matchCurlies();
      return {
        methodOrKey: new T.Method({
          isAsync,
          isGenerator,
          name,
          params: formalParams,
          body,
        }),
        kind: 'method',
      };
    }
    return {
      methodOrKey: name,
      kind:
        this.isIdentifier(lookahead) || this.isKeyword(lookahead)
          ? 'identifier'
          : 'property',
    };
  }

  enforestPropertyName() {
    let lookahead = this.peek();

    if (this.isStringLiteral(lookahead) || this.isNumericLiteral(lookahead)) {
      return {
        name: new T.StaticPropertyName({
          value: this.matchRawSyntax(),
        }),
        binding: null,
      };
    } else if (this.isBrackets(lookahead)) {
      let enf = new Enforester(this.matchSquares(), List(), this.context);
      let expr = enf.enforestExpressionLoop();
      return {
        name: new T.ComputedPropertyName({
          expression: expr,
        }),
        binding: null,
      };
    }
    let name = this.matchRawSyntax();
    return {
      name: new T.StaticPropertyName({
        value: name,
      }),
      binding: new T.BindingIdentifier({
        name,
      }),
    };
  }

  enforestFunction({
    isExpr,
    inDefault,
    isAsync,
  }: {
    isExpr?: boolean,
    inDefault?: boolean,
    isAsync?: boolean,
  }) {
    let name = null,
      params,
      body;
    let isGenerator = false;
    // eat the function keyword
    let fnKeyword = this.matchRawSyntax();
    let lookahead = this.peek();

    if (this.isPunctuator(lookahead, '*')) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (!this.isParens(lookahead)) {
      name = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name = new T.BindingIdentifier({
        name: Syntax.fromIdentifier('*default*', fnKeyword),
      });
    }

    params = this.matchParens();

    body = this.matchCurlies();

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new (isExpr ? T.FunctionExpressionE : T.FunctionDeclarationE)({
      name,
      isAsync,
      isGenerator,
      params: formalParams,
      body,
    });
  }

  enforestFormalParameters() {
    let items = [];
    let rest = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, '...')) {
        this.matchPunctuator('...');
        rest = this.enforestBindingIdentifier();
        break;
      }
      items.push(this.enforestParam());
      this.consumeComma();
    }
    return new T.FormalParameters({
      items: List(items),
      rest,
    });
  }

  enforestParam() {
    return this.enforestBindingElement();
  }

  enforestUpdateExpression() {
    const lookahead = this.peek();
    const leftTerm = this.term;
    if (!lookahead) {
      throw this.createError(lookahead, 'assertion failure: operator is null');
    }
    let operator = this.matchRawSyntax();
    if (this.isCompiletimeTransform(lookahead)) {
      const operatorTransform = this.getFromCompiletimeEnvironment(operator);
      if (!operatorTransform || operatorTransform.value.type !== 'operator') {
        throw this.createError(lookahead, 'unexpected transform');
      }
      let result = operatorTransform.value.f.call(null, leftTerm);
      let enf = new Enforester(result, List(), this.context);
      return enf.enforestExpressionLoop();
    }
    return new T.UpdateExpression({
      isPrefix: false,
      operator: operator.val(),
      operand: this.transformDestructuring(leftTerm),
    });
  }

  enforestUnaryExpression() {
    const lookahead = this.peek();
    if (!lookahead) {
      throw this.createError(lookahead, 'assertion failure: operator is null');
    }
    if (this.isAwaitTransform(lookahead) && !this.context.allowAwait) {
      throw this.createError(
        lookahead,
        'await is only allowed in async functions',
      );
    }
    let operator = this.matchRawSyntax();
    let prec, combine;
    if (this.isCompiletimeTransform(lookahead)) {
      const operatorTransform = this.getFromCompiletimeEnvironment(lookahead);
      if (!operatorTransform || operatorTransform.value.type !== 'operator') {
        throw this.createError(lookahead, 'unexpected transform');
      }
      prec = operatorTransform.value.prec;
      combine = rightTerm => {
        return this.expandOperator(lookahead, operatorTransform, [rightTerm]);
      };
    } else {
      // all builtins are 16
      prec = 16;
      combine = rightTerm => {
        if (operator.val() === '++' || operator.val() === '--') {
          return new T.UpdateExpression({
            operator: operator.val(),
            operand: this.transformDestructuring(rightTerm),
            isPrefix: true,
          });
        } else {
          return new T.UnaryExpression({
            operator: operator.val(),
            operand: rightTerm,
          });
        }
      };
    }

    this.opCtx.stack = this.opCtx.stack.push({
      prec: this.opCtx.prec,
      combine: this.opCtx.combine,
    });
    this.opCtx.prec = prec;
    this.opCtx.combine = rightTerm => {
      return combine(rightTerm);
    };
    return EXPR_LOOP_OPERATOR;
  }

  enforestConditionalExpression() {
    // first, pop the operator stack
    let test = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      let { prec, combine } = this.opCtx.stack.last();
      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }

    this.matchPunctuator('?');
    let enf = new Enforester(this.rest, List(), this.context);
    let consequent = enf.enforestExpressionLoop();
    enf.matchPunctuator(':');
    enf = new Enforester(enf.rest, List(), this.context);
    let alternate = enf.enforestExpressionLoop();
    this.rest = enf.rest;
    return new T.ConditionalExpression({
      test,
      consequent,
      alternate,
    });
  }

  enforestBinaryExpression() {
    let leftTerm = this.term;
    const opStx: any = this.peek();
    if (!opStx) {
      throw this.createError(opStx, 'assertion failure: opStx is null');
    }

    let prec, assoc, combine;
    if (this.isCompiletimeTransform(this.peek())) {
      const operatorTransform = this.getFromCompiletimeEnvironment(opStx.value);
      if (!operatorTransform || operatorTransform.value.type !== 'operator') {
        throw this.createError(opStx.value, 'unexpected transform');
      }
      prec = operatorTransform.value.prec;
      assoc = operatorTransform.value.assoc;
      combine = (left: any, right) => {
        return this.expandOperator(opStx, operatorTransform, [left, right]);
      };
    } else {
      prec = getOperatorPrec(opStx.value.val());
      assoc = getOperatorAssoc(opStx.value.val());
      combine = (left, right) =>
        new T.BinaryExpression({
          left,
          right,
          operator: opStx.value.val(),
        });
    }

    if (operatorLt(this.opCtx.prec, prec, assoc)) {
      this.opCtx.stack = this.opCtx.stack.push({
        prec: this.opCtx.prec,
        combine: this.opCtx.combine,
      });
      this.opCtx.prec = prec;
      this.opCtx.combine = rightTerm => {
        return combine(leftTerm, rightTerm);
      };
      this.advance();
      return EXPR_LOOP_OPERATOR;
    } else {
      let term = this.opCtx.combine(leftTerm);
      // this.rest does not change
      let { prec, combine } = this.opCtx.stack.last();
      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
      return term;
    }
  }

  enforestTemplateElements() {
    let lookahead = this.matchTemplate();
    let elements = lookahead.token.items.map(it => {
      if (this.isDelimiter(it)) {
        let enf = new Enforester(
          it.inner.slice(1, it.inner.size - 1),
          List(),
          this.context,
        );
        return enf.enforest('expression');
      }
      return new T.TemplateElement({
        rawValue: it.value.token.slice.text,
      });
    });
    return elements;
  }

  expandMacro() {
    let lookahead = this.peek();
    while (this.isCompiletimeTransform(lookahead)) {
      let name = this.matchRawSyntax();

      let syntaxTransform = this.getFromCompiletimeEnvironment(name);
      if (syntaxTransform == null) {
        throw this.createError(
          name,
          `The macro ${name.resolve(
            this.context.phase,
          )} does not have a bound value`,
        );
      } else if (typeof syntaxTransform.value.f !== 'function') {
        throw this.createError(
          name,
          `The macro ${name.resolve(
            this.context.phase,
          )} was not bound to a callable value: ${syntaxTransform.value.f}`,
        );
      }
      let useSiteScope = freshScope('u');
      let introducedScope = freshScope('i');
      // TODO: needs to be a list of scopes I think
      this.context.useScope = useSiteScope;

      let ctx = new MacroContext(
        this,
        name,
        this.context,
        useSiteScope,
        introducedScope,
      );

      let result = sanitizeReplacementValues(
        syntaxTransform.value.f.call(null, ctx),
      );
      if (!List.isList(result)) {
        throw this.createError(
          name,
          'macro must return a list but got: ' + result,
        );
      }
      let scopeReducer = new ScopeReducer(
        [
          {
            scope: introducedScope,
            phase: ALL_PHASES,
            flip: true,
          },
        ],
        this.context.bindings,
        true,
      );
      result = result.map(terms => {
        if (terms instanceof Syntax) {
          return new T.RawSyntax({
            value: terms,
            // $FlowFixMe: flow doesn't know about reduce on terms yet
          }).reduce(scopeReducer);
        } else if (!(terms instanceof Term)) {
          throw this.createError(
            name,
            'macro must return syntax objects or terms but got: ' + terms,
          );
        }
        return terms.reduce(scopeReducer);
      });

      this.rest = result.concat(ctx._rest(this));
      lookahead = this.peek();
    }
  }

  expandOperator(name: Term, operatorTransform: any, args: Array<Term>) {
    let useSiteScope = freshScope('u');
    let introducedScope = freshScope('i');
    // TODO: needs to be a list of scopes I think
    this.context.useScope = useSiteScope;
    args = args.map(arg => {
      // $FlowFixMe: flow doesn't know about reduce on terms yet
      return arg.reduce(
        new ScopeReducer(
          [
            {
              scope: useSiteScope,
              phase: ALL_PHASES,
              flip: false,
            },
            {
              scope: introducedScope,
              phase: ALL_PHASES,
              flip: true,
            },
          ],
          this.context.bindings,
        ),
      );
    });
    let result = sanitizeReplacementValues(
      operatorTransform.value.f.apply(null, args),
    );
    let scopeReducer = new ScopeReducer(
      [
        {
          scope: introducedScope,
          phase: ALL_PHASES,
          flip: true,
        },
      ],
      this.context.bindings,
      true,
    );
    result = result.map(terms => {
      if (terms instanceof Syntax) {
        return new T.RawSyntax({
          value: terms,
          // $FlowFixMe: flow doesn't know about reduce on terms yet
        }).reduce(scopeReducer);
      } else if (!(terms instanceof Term)) {
        throw this.createError(
          name,
          'macro must return syntax objects or terms but got: ' + terms,
        );
      }
      return terms.reduce(scopeReducer);
    });
    let enf = new Enforester(result, List(), this.context);
    return enf.enforestExpressionLoop();
  }

  consumeSemicolon() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ';')) {
      this.advance();
    }
  }

  consumeComma() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ',')) {
      this.advance();
    }
  }

  safeCheck(obj: ?(Syntax | Term), type: any, val: ?string = null) {
    if (obj instanceof Term) {
      if (obj instanceof T.RawSyntax) {
        return (
          obj.value &&
          (typeof obj.value.match === 'function'
            ? obj.value.match(type, val)
            : false)
        );
      } else if (obj instanceof T.RawDelimiter) {
        return type === 'delimiter' || obj.kind === type;
      }
    }
    return (
      obj && (typeof obj.match === 'function' ? obj.match(type, val) : false)
    );
  }

  isTerm(term: any) {
    return term && term instanceof Term;
  }

  isEOF(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'eof');
  }

  isIdentifier(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'identifier', val);
  }

  isPropertyName(obj: ?(Syntax | Term)) {
    return (
      this.isIdentifier(obj) ||
      this.isKeyword(obj) ||
      this.isNumericLiteral(obj) ||
      this.isStringLiteral(obj) ||
      this.isBrackets(obj)
    );
  }

  isNumericLiteral(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'number', val);
  }

  isStringLiteral(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'string', val);
  }

  isTemplate(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'template', val);
  }

  isSyntaxTemplate(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'syntaxTemplate');
  }

  isBooleanLiteral(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'boolean', val);
  }

  isNullLiteral(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'null', val);
  }

  isRegularExpression(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'regularExpression', val);
  }

  isDelimiter(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'delimiter');
  }

  isParens(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'parens');
  }

  isBraces(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'braces');
  }

  isBrackets(obj: ?(Syntax | Term)) {
    return this.safeCheck(obj, 'brackets');
  }

  isAssign(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'assign', val);
  }

  isKeyword(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'keyword', val);
  }

  isPunctuator(obj: ?(Syntax | Term), val: ?string = null) {
    return this.safeCheck(obj, 'punctuator', val);
  }

  isOperator(obj: ?(Syntax | Term)) {
    return (
      (this.safeCheck(obj, 'punctuator') ||
        this.safeCheck(obj, 'identifier') ||
        this.safeCheck(obj, 'keyword')) &&
      ((obj instanceof T.RawSyntax && isOperator(obj.value)) ||
        (obj instanceof Syntax && isOperator(obj)))
    );
  }

  isCustomPrefixOperator(obj: any) {
    if (this.isCompiletimeTransform(obj)) {
      let t = this.getFromCompiletimeEnvironment(obj.value);
      return t && t.value.assoc === 'prefix';
    }
    return false;
  }

  isCustomPostfixOperator(obj: any) {
    if (this.isCompiletimeTransform(obj)) {
      let t = this.getFromCompiletimeEnvironment(obj.value);
      return t && t.value.assoc === 'postfix';
    }
    return false;
  }

  isCustomBinaryOperator(obj: any) {
    if (this.isCompiletimeTransform(obj)) {
      let t = this.getFromCompiletimeEnvironment(obj.value);
      return t && (t.value.assoc === 'left' || t.value.assoc === 'right');
    }
    return false;
  }

  isUpdateOperator(obj: ?(Syntax | Term)) {
    return (
      this.safeCheck(obj, 'punctuator', '++') ||
      this.safeCheck(obj, 'punctuator', '--')
    );
  }

  safeResolve(obj: ?(Syntax | Term), phase: number | {}) {
    if (obj instanceof T.RawSyntax) {
      return typeof obj.value.resolve === 'function'
        ? Just(obj.value.resolve(phase))
        : Nothing();
    } else if (obj instanceof Syntax) {
      return typeof obj.resolve === 'function'
        ? Just(obj.resolve(phase))
        : Nothing();
    }
    return Nothing();
  }

  isTransform(obj: ?(Syntax | Term), trans: any) {
    return this.safeResolve(obj, this.context.phase)
      .map(
        name =>
          this.context.env.get(name) === trans ||
          this.context.store.get(name) === trans,
      )
      .getOrElse(false);
  }

  isTransformInstance(obj: ?(Syntax | Term), trans: any) {
    return this.safeResolve(obj, this.context.phase)
      .map(
        name =>
          this.context.env.get(name) instanceof trans ||
          this.context.store.get(name) instanceof trans,
      )
      .getOrElse(false);
  }

  isFnDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, FunctionDeclTransform);
  }

  isVarDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, VariableDeclTransform);
  }

  isLetDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, LetDeclTransform);
  }

  isConstDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ConstDeclTransform);
  }

  isSyntaxDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, SyntaxDeclTransform);
  }

  isSyntaxrecDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, SyntaxrecDeclTransform);
  }

  isReturnStmtTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ReturnStatementTransform);
  }

  isWhileTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, WhileTransform);
  }

  isForTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ForTransform);
  }

  isSwitchTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, SwitchTransform);
  }

  isBreakTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, BreakTransform);
  }

  isContinueTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ContinueTransform);
  }

  isDoTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, DoTransform);
  }

  isDebuggerTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, DebuggerTransform);
  }

  isWithTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, WithTransform);
  }

  isImportTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ImportTransform);
  }

  isExportTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ExportTransform);
  }

  isTryTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, TryTransform);
  }

  isThrowTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ThrowTransform);
  }

  isOperatorDeclTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, OperatorDeclTransform);
  }

  isIfTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, IfTransform);
  }

  isNewTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, NewTransform);
  }

  isSuperTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, SuperTransform);
  }

  isThisTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ThisTransform);
  }

  isClassTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, ClassTransform);
  }

  isYieldTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, YieldTransform);
  }

  isAsyncTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, AsyncTransform);
  }

  isAwaitTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, AwaitTransform);
  }

  isDefaultTransform(obj: ?(Syntax | Term)) {
    return this.isTransform(obj, DefaultTransform);
  }

  isCompiletimeTransform(obj: ?(Syntax | Term)) {
    return this.isTransformInstance(obj, CompiletimeTransform);
  }

  isModuleNamespaceTransform(obj: ?Term) {
    return this.isTransformInstance(obj, ModuleNamespaceTransform);
  }

  isVarBindingTransform(obj: ?(Syntax | Term)) {
    return this.isTransformInstance(obj, VarBindingTransform);
  }

  getFromCompiletimeEnvironment(term: any) {
    if (this.context.env.has(term.resolve(this.context.phase))) {
      return this.context.env.get(term.resolve(this.context.phase));
    }
    return this.context.store.get(term.resolve(this.context.phase));
  }

  lineNumberEq(a: ?(Term | Syntax), b: ?(Syntax | Term)) {
    if (!(a && b)) {
      return false;
    }
    return getLineNumber(a) === getLineNumber(b);
  }

  matchRawDelimiter(): List<Term> {
    let lookahead = this.advance();
    if (lookahead instanceof T.RawDelimiter) {
      // $FlowFixMe: terms are currently typed with arrays not lists
      return lookahead.inner;
    }
    throw this.createError(lookahead, 'expecting a RawDelimiter');
  }

  matchRawSyntax(): Syntax {
    let lookahead = this.advance();
    if (lookahead instanceof T.RawSyntax) {
      return lookahead.value;
    }
    throw this.createError(lookahead, 'expecting a RawSyntax');
  }

  matchIdentifier(val?: string) {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead, val)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting an identifier');
  }

  matchKeyword(val: string) {
    let lookahead = this.peek();
    if (this.isKeyword(lookahead, val)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting ' + val);
  }

  matchLiteral() {
    let lookahead = this.peek();
    if (
      this.isNumericLiteral(lookahead) ||
      this.isStringLiteral(lookahead) ||
      this.isBooleanLiteral(lookahead) ||
      this.isNullLiteral(lookahead) ||
      this.isTemplate(lookahead) ||
      this.isRegularExpression(lookahead)
    ) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting a literal');
  }

  matchStringLiteral() {
    let lookahead = this.peek();
    if (this.isStringLiteral(lookahead)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting a string literal');
  }

  matchTemplate() {
    let lookahead = this.peek();
    if (this.isTemplate(lookahead)) {
      return this.matchRawSyntax();
    }
    throw this.createError(lookahead, 'expecting a template literal');
  }

  matchParens(): List<Term> {
    let lookahead = this.peek();
    if (this.isParens(lookahead)) {
      let inner = this.matchRawDelimiter();
      return inner.slice(1, inner.size - 1);
    }
    throw this.createError(lookahead, 'expecting parens');
  }

  matchCurlies() {
    let lookahead = this.peek();
    if (this.isBraces(lookahead)) {
      let inner = this.matchRawDelimiter();
      return inner.slice(1, inner.size - 1);
    }
    throw this.createError(lookahead, 'expecting curly braces');
  }

  matchSquares(): List<Term> {
    let lookahead = this.peek();
    if (this.isBrackets(lookahead)) {
      let inner = this.matchRawDelimiter();
      return inner.slice(1, inner.size - 1);
    }
    throw this.createError(lookahead, 'expecting square braces');
  }

  matchUnaryOperator() {
    let lookahead = this.matchRawSyntax();
    if (isUnaryOperator(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a unary operator');
  }

  matchPunctuator(val: string) {
    let lookahead = this.matchRawSyntax();
    if (this.isPunctuator(lookahead)) {
      if (typeof val !== 'undefined') {
        if (lookahead.val() === val) {
          return lookahead;
        } else {
          throw this.createError(
            lookahead,
            'expecting a ' + val + ' punctuator',
          );
        }
      }
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a punctuator');
  }

  createError(stx: ?(Syntax | Term), message: string) {
    let ctx = '';
    let offending = stx;
    if (this.rest.size > 0) {
      ctx = this.rest
        .slice(0, 20)
        .map(term => {
          if (term instanceof T.RawDelimiter) {
            return term.inner;
          }
          return List.of(term);
        })
        .flatten()
        .map(s => {
          let sval = s instanceof T.RawSyntax ? s.value.val() : s.toString();
          if (s === offending) {
            return '__' + sval + '__';
          }
          return sval;
        })
        .join(' ');
    } else {
      ctx = offending == null ? '' : offending.toString();
    }
    return new Error(message + '\n' + ctx);
  }
}
