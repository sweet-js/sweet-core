import Term from "./terms";

import {
  FunctionDeclTransform,
  VariableDeclTransform,
  NewTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
  SyntaxrecDeclTransform,
  SyntaxQuoteTransform,
  ReturnStatementTransform,
  WhileTransform,
  IfTransform,
  ForTransform,
  SwitchTransform,
  BreakTransform,
  ContinueTransform,
  DoTransform,
  DebuggerTransform,
  WithTransform,
  TryTransform,
  ThrowTransform,
  CompiletimeTransform
} from "./transforms";
import { mapObjIndexed } from "ramda";
import { List } from "immutable";
import { expect, assert } from "./errors";
import {
  isOperator,
  isUnaryOperator,
  getOperatorAssoc,
  getOperatorPrec,
  operatorLt
} from "./operators";
import Syntax, {Types} from "./syntax";

import { freshScope } from "./scope";
import { sanitizeReplacementValues } from './load-syntax';

import MacroContext from "./macro-context";

const EXPR_LOOP_OPERATOR = {};
const EXPR_LOOP_NO_CHANGE = {};
const EXPR_LOOP_EXPANSION = {};

let is = mapObjIndexed((_, type) => (stx, value) => stx instanceof Syntax && stx.match(type, value), Types)

export class Enforester {
  constructor(stxl, prev, context) {
    this.done = false;
    assert(List.isList(stxl), "expecting a list of terms to enforest");
    assert(List.isList(prev), "expecting a list of terms to enforest");
    assert(context, "expecting a context to enforest");
    this.term = null;

    this.rest = stxl;
    this.prev = prev;

    this.context = context;
  }

  peek(n = 0) {
    return this.rest.get(n);
  }

  advance() {
    let ret = this.rest.first();
    this.rest = this.rest.rest();
    return ret;
  }

  /*
   enforest works over:
   prev - a list of the previously enforest Terms
   term - the current term being enforested (initially null)
   rest - remaining Terms to enforest
   */
  enforest(type = "Module") {
    // initialize the term
    this.term = null;

    if (this.rest.size === 0) {
      this.done = true;
      return this.term;
    }

    if (is.eof(this.peek())) {
      this.term = new Term("EOF", {});
      this.advance();
      return this.term;
    }

    let result;
    if (type === "expression") {
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
    if (is.keyword(lookahead, 'import')) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (is.keyword(lookahead, 'export')) {
      this.advance();
      return this.enforestExportDeclaration();
    }
    return this.enforestStatement();
  }

  enforestExportDeclaration() {
    let lookahead = this.peek();
    if (is.punctuator(lookahead, '*')) {
      this.advance();
      let moduleSpecifier = this.enforestFromClause();
      return new Term('ExportAllFrom', { moduleSpecifier });
    } else if (is.braces(lookahead)) {
      let namedExports = this.enforestExportClause();
      let moduleSpecifier = null;
      if (is.identifier(this.peek(), 'from')) {
        moduleSpecifier = this.enforestFromClause();
      }
      return new Term('ExportFrom', { namedExports, moduleSpecifier });
    } else if (is.keyword(lookahead, 'class')) {
      return new Term('Export', {
        declaration: this.enforestClass({ isExpr: false })
      });
    } else if (this.isFnDeclTransform(lookahead)) {
      return new Term('Export', {
        declaration: this.enforestFunction({isExpr: false, inDefault: false})
      });
    } else if (is.keyword(lookahead, 'default')) {
      this.advance();
      if (this.isFnDeclTransform(this.peek())) {
        return new Term('ExportDefault', {
          body: this.enforestFunction({isExpr: false, inDefault: true})
        });
      } else if (is.keyword(this.peek(), 'class')) {
        return new Term('ExportDefault', {
          body: this.enforestClass({isExpr: false, inDefault: true})
        });
      } else {
        let body = this.enforestExpressionLoop();
        this.consumeSemicolon();
        return new Term('ExportDefault', { body });
      }
    } else if (this.isVarDeclTransform(lookahead) ||
        this.isLetDeclTransform(lookahead) ||
        this.isConstDeclTransform(lookahead) ||
        this.isSyntaxrecDeclTransform(lookahead) ||
        this.isSyntaxDeclTransform(lookahead)) {
      return new Term('Export', {
        declaration: this.enforestVariableDeclaration()
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
    let name = this.enforestIdentifier();
    if (is.identifier(this.peek(), 'as')) {
      this.advance();
      let exportedName = this.enforestIdentifier();
      return new Term('ExportSpecifier', { name, exportedName });
    }
    return new Term('ExportSpecifier', {
      name: null,
      exportedName: name
    });
  }

  enforestImportDeclaration() {
    let lookahead = this.peek();
    let defaultBinding = null;
    let namedImports = List();
    let forSyntax = false;

    if (is.string(lookahead)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new Term('Import', {
        defaultBinding, namedImports, moduleSpecifier
      });
    }

    if (is.identifier(lookahead) || is.keyword(lookahead)) {
      defaultBinding = this.enforestBindingIdentifier();
      if (!is.punctuator(this.peek(), ',')) {
        let moduleSpecifier = this.enforestFromClause();
        if (is.keyword(this.peek(), 'for') && is.identifier(this.peek(1), 'syntax')) {
          this.advance();
          this.advance();
          forSyntax = true;
        }

        return new Term('Import', {
          defaultBinding, moduleSpecifier,
          namedImports: List(),
          forSyntax
        });
      }
    }
    this.consumeComma();
    lookahead = this.peek();
    if (is.braces(lookahead)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (is.keyword(this.peek(), 'for') && is.identifier(this.peek(1), 'syntax')) {
        this.advance();
        this.advance();
        forSyntax = true;
      }

      return new Term("Import", {
        defaultBinding,
        forSyntax,
        namedImports: imports,
        moduleSpecifier: fromClause

      });
    } else if (is.punctuator(lookahead, '*')) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (is.keyword(this.peek(), 'for') && is.identifier(this.peek(1), 'syntax')) {
        this.advance();
        this.advance();
        forSyntax = true;
      }
      return new Term('ImportNamespace', {
        defaultBinding, forSyntax, namespaceBinding, moduleSpecifier
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
    if (is.identifier(lookahead) || is.keyword(lookahead)) {
      name = this.advance();
      if (!is.identifier(this.peek(), 'as')) {
        return new Term('ImportSpecifier', {
          name: null,
          binding: new Term('BindingIdentifier', {
            name: name
          })
        });
      } else {
        this.matchIdentifier('as');
      }
    } else {
      throw this.createError(lookahead, 'unexpected token in import specifier');
    }
    return new Term('ImportSpecifier', {
      name, binding: this.enforestBindingIdentifier()
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
      return this.enforestFunctionDeclaration({ isExpr: false });
    } else if (is.keyword(lookahead, 'class')) {
      return this.enforestClass({ isExpr: false });
    } else {
      return this.enforestStatement();
    }
  }

  enforestStatement() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      this.rest = this.expandMacro().concat(this.rest);
      lookahead = this.peek();
      this.term = null;
    }

    if (this.term === null && is.braces(lookahead)) {
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
    if (this.term === null && is.keyword(lookahead, "class")) {
      return this.enforestClass({isExpr: false});
    }

    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionDeclaration();
    }

    if (this.term === null && is.identifier(lookahead) &&
        is.punctuator(this.peek(1), ':')) {
      return this.enforestLabeledStatement();
    }

    if (this.term === null &&
        (this.isVarDeclTransform(lookahead) ||
         this.isLetDeclTransform(lookahead) ||
         this.isConstDeclTransform(lookahead) ||
         this.isSyntaxrecDeclTransform(lookahead) ||
         this.isSyntaxDeclTransform(lookahead))) {
      let stmt = new Term('VariableDeclarationStatement', {
        declaration: this.enforestVariableDeclaration()
      });
      this.consumeSemicolon();
      return stmt;
    }

    if (this.term === null && this.isReturnStmtTransform(lookahead)) {
      return this.enforestReturnStatement();
    }

    if (this.term === null && is.punctuator(lookahead, ";")) {
      this.advance();
      return new Term("EmptyStatement", {});
    }


    return this.enforestExpressionStatement();
  }

  enforestLabeledStatement() {
    let label = this.matchIdentifier();
    let punc = this.matchPunctuator(':');
    let stmt = this.enforestStatement();

    return new Term('LabeledStatement', {
      label: label,
      body: stmt
    });
  }

  enforestBreakStatement() {
    this.matchKeyword('break');
    let lookahead = this.peek();
    let label = null;
    if (this.rest.size === 0 || is.punctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new Term('BreakStatement', { label });
    }
    if (is.identifier(lookahead) || is.keyword(lookahead, 'yield') || is.keyword(lookahead, 'let')) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new Term('BreakStatement', { label });
  }

  enforestTryStatement() {
    this.matchKeyword('try');
    let body = this.enforestBlock();
    if (is.keyword(this.peek(), 'catch')) {
      let catchClause = this.enforestCatchClause();
      if (is.keyword(this.peek(), 'finally')) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new Term('TryFinallyStatement', {
          body, catchClause, finalizer
        });
      }
      return new Term('TryCatchStatement', { body, catchClause });
    }
    if (is.keyword(this.peek(), 'finally')) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new Term('TryFinallyStatement', { body, catchClause: null, finalizer });
    }
    throw this.createError(this.peek(), 'try with no catch or finally');
  }

  enforestCatchClause() {
    this.matchKeyword('catch');
    let bindingParens = this.matchParens();
    let enf = new Enforester(bindingParens, List(), this.context);
    let binding = enf.enforestBindingTarget();
    let body = this.enforestBlock();
    return new Term('CatchClause', { binding, body });
  }

  enforestThrowStatement() {
    this.matchKeyword('throw');
    let expression = this.enforestExpression();
    this.consumeSemicolon();
    return new Term('ThrowStatement', { expression });
  }

  enforestWithStatement() {
    this.matchKeyword('with');
    let objParens = this.matchParens();
    let enf = new Enforester(objParens, List(), this.context);
    let object = enf.enforestExpression();
    let body = this.enforestStatement();
    return new Term('WithStatement', { object, body });
  }

  enforestDebuggerStatement() {
    this.matchKeyword('debugger');

    return new Term('DebuggerStatement', {});
  }

  enforestDoStatement() {
    this.matchKeyword('do');
    let body = this.enforestStatement();
    this.matchKeyword('while');
    let testBody = this.matchParens();
    let enf = new Enforester(testBody, List(), this.context);
    let test = enf.enforestExpression();
    this.consumeSemicolon();
    return new Term('DoWhileStatement', { body, test });
  }

  enforestContinueStatement() {
    let kwd = this.matchKeyword('continue');
    let lookahead = this.peek();
    let label = null;
    if (this.rest.size === 0 || is.punctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new Term('ContinueStatement', { label });
    }
    if (this.lineNumberEq(kwd, lookahead) &&
        (is.identifier(lookahead) ||
         is.keyword(lookahead, 'yield') ||
         is.keyword(lookahead, 'let'))) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new Term('ContinueStatement', { label });
  }

  enforestSwitchStatement() {
    this.matchKeyword('switch');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let discriminant = enf.enforestExpression();
    let body = this.matchCurlies();

    if (body.size === 0) {
      return new Term('SwitchStatement', {
        discriminant: discriminant,
        cases: List()
      });
    }
    enf = new Enforester(body, List(), this.context);
    let cases = enf.enforestSwitchCases();
    let lookahead = enf.peek();
    if (is.keyword(lookahead, 'default')) {
      let defaultCase = enf.enforestSwitchDefault();
      let postDefaultCases = enf.enforestSwitchCases();
      return new Term('SwitchStatementWithDefault', {
        discriminant,
        preDefaultCases: cases,
        defaultCase,
        postDefaultCases
      });
    }
    return new Term('SwitchStatement', {  discriminant, cases });
  }

  enforestSwitchCases() {
    let cases = [];
    while (!(this.rest.size === 0 || is.keyword(this.peek(), 'default'))) {
      cases.push(this.enforestSwitchCase());
    }
    return List(cases);
  }

  enforestSwitchCase() {
    this.matchKeyword('case');
    return new Term('SwitchCase', {
      test: this.enforestExpression(),
      consequent: this.enforestSwitchCaseBody()
    });
  }

  enforestSwitchCaseBody() {
    this.matchPunctuator(':');
    return this.enforestStatementListInSwitchCaseBody();
  }

  enforestStatementListInSwitchCaseBody() {
    let result = [];
    while(!(this.rest.size === 0 || is.keyword(this.peek(), 'default') || is.keyword(this.peek(), 'case'))) {
      result.push(this.enforestStatementListItem());
    }
    return List(result);
  }

  enforestSwitchDefault() {
    this.matchKeyword('default');
    return new Term('SwitchDefault', {
      consequent: this.enforestSwitchCaseBody()
    });
  }

  enforestForStatement() {
    this.matchKeyword('for');
    let cond = this.matchParens();
    let enf = new Enforester(cond, List(), this.context);
    let lookahead, test, init, right, type, left, update;

    // case where init is null
    if (is.punctuator(enf.peek(), ';')) {
      enf.advance();
      if (!is.punctuator(enf.peek(), ';')) {
        test = enf.enforestExpression();
      }
      enf.matchPunctuator(';');
      if (enf.rest.size !== 0) {
        right = enf.enforestExpression();
      }
      return new Term('ForStatement', {
        init: null,
        test: test,
        update: right,
        body: this.enforestStatement()
      });
    // case where init is not null
    } else {
      // testing
      lookahead = enf.peek();
      if (enf.isVarDeclTransform(lookahead) ||
          enf.isLetDeclTransform(lookahead) ||
          enf.isConstDeclTransform(lookahead)) {
        init = enf.enforestVariableDeclaration();
        lookahead = enf.peek();
        if (is.keyword(lookahead, 'in') || is.identifier(lookahead, 'of')) {
          if (is.keyword(lookahead, 'in')) {
            enf.advance();
            right = enf.enforestExpression();
            type = 'ForInStatement';
          } else if (is.identifier(lookahead, 'of')) {
            enf.advance();
            right = enf.enforestExpression();
            type = 'ForOfStatement';
          }
          return new Term(type, {
            left: init, right, body: this.enforestStatement()
          });
        }
        enf.matchPunctuator(';');
        if (is.punctuator(enf.peek(), ';')) {
          enf.advance();
          test = null;
        } else {
          test = enf.enforestExpression();
          enf.matchPunctuator(';');
        }
        update = enf.enforestExpression();
      } else {
        if (is.keyword(enf.peek(1), 'in') || is.identifier(enf.peek(1), 'of')) {
          left = enf.enforestBindingIdentifier();
          let kind = enf.advance();
          if (is.keyword(kind, 'in')) {
            type = 'ForInStatement';
          } else {
            type = 'ForOfStatement';
          }
          right = enf.enforestExpression();
          return new Term(type, {
            left: left, right, body: this.enforestStatement()
          });
        }
        init = enf.enforestExpression();
        enf.matchPunctuator(';');
        if (is.punctuator(enf.peek(), ';')) {
          enf.advance();
          test = null;
        } else {
          test = enf.enforestExpression();
          enf.matchPunctuator(';');
        }
        update = enf.enforestExpression();
      }
      return new Term('ForStatement', { init, test, update, body: this.enforestStatement() });
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
    if (is.keyword(this.peek(), 'else')) {
      this.advance();
      alternate = this.enforestStatement();
    }
    return new Term('IfStatement', { test, consequent, alternate });
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

    return new Term('WhileStatement', { test, body });
  }

  enforestBlockStatement() {
    return new Term('BlockStatement', {
      block: this.enforestBlock()
    });
  }

  enforestBlock() {
    let b = this.matchCurlies();
    let body = [];
    let enf = new Enforester(b, List(), this.context);

    while (enf.rest.size !== 0) {
      let lookahead = enf.peek();
      let stmt = enf.enforestStatement();
      if (stmt == null) {
        throw enf.createError(lookahead, 'not a statement');
      }
      body.push(stmt);
    }

    return new Term('Block', {
      statements: List(body)
    });
  }

  enforestClass({ isExpr, inDefault }) {
    let kw = this.advance();
    let name = null, supr = null;
    let type = isExpr ? 'ClassExpression' : 'ClassDeclaration';

    if (is.identifier(this.peek())) {
      name = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name = new Term('BindingIdentifier', {
          name: Syntax.from("identifier", '_default', kw)
        });
      } else {
        throw this.createError(this.peek(), 'unexpected syntax');
      }
    }

    if (is.keyword(this.peek(), 'extends')) {
      this.advance();
      supr = this.enforestExpressionLoop();
    }

    let elements = [];
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    while (enf.rest.size !== 0) {
      if (is.punctuator(enf.peek(), ';')) {
        enf.advance();
        continue;
      }

      let isStatic = false;
      let {methodOrKey, kind} = enf.enforestMethodDefinition();
      if (kind === 'identifier' && methodOrKey.value.val() === 'static') {
        isStatic = true;
        ({methodOrKey, kind} = enf.enforestMethodDefinition());
      }
      if (kind === 'method') {
        elements.push(new Term('ClassElement', {isStatic, method: methodOrKey}));
      } else {
        throw this.createError(enf.peek(), "Only methods are allowed in classes");
      }
    }

    return new Term(type, {
      name, super: supr,
      elements: List(elements)
    });
  }

  enforestBindingTarget({ allowPunctuator } = {}) {
    let lookahead = this.peek();
    if (is.identifier(lookahead) || is.keyword(lookahead) || (allowPunctuator && is.punctuator(lookahead))) {
      return this.enforestBindingIdentifier({ allowPunctuator });
    } else if (is.brackets(lookahead)) {
      return this.enforestArrayBinding();
    } else if (is.braces(lookahead)) {
      return this.enforestObjectBinding();
    }
    assert(false, 'not implemented yet');
  }

  enforestObjectBinding() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let properties = [];
    while (enf.rest.size !== 0) {
      properties.push(enf.enforestBindingProperty());
      enf.consumeComma();
    }

    return new Term('ObjectBinding', {
      properties: List(properties)
    });
  }

  enforestBindingProperty() {
    let lookahead = this.peek();
    let {name, binding} = this.enforestPropertyName();
    if (is.identifier(lookahead) || is.keyword(lookahead, 'let') || is.keyword(lookahead, 'yield')) {
      if (!is.punctuator(this.peek(), ':')) {
        let defaultValue = null;
        if (is.assign(this.peek())) {
          this.advance();
          let expr = this.enforestExpressionLoop();
          defaultValue = expr;
        }
        return new Term('BindingPropertyIdentifier', {
          binding, init: defaultValue
        });
      }
    }
    this.matchPunctuator(':');
    binding = this.enforestBindingElement();
    return new Term('BindingPropertyProperty', {
      name, binding
    });
  }

  enforestArrayBinding() {
    let bracket = this.matchSquares();
    let enf = new Enforester(bracket, List(), this.context);
    let elements = [], restElement = null;
    while (enf.rest.size !== 0) {
      let el;
      if (is.punctuator(enf.peek(), ',')) {
        enf.consumeComma();
        el = null;
      } else {
        if (is.punctuator(enf.peek(), '...')) {
          enf.advance();
          restElement = enf.enforestBindingTarget();
          break;
        } else {
          el = enf.enforestBindingElement();
        }
        enf.consumeComma();
      }
      elements.push(el);
    }
    return new Term('ArrayBinding', {
      elements: List(elements),
      restElement
    });
  }

  enforestBindingElement() {
    let binding = this.enforestBindingTarget();

    if (is.assign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding = new Term('BindingWithDefault', { binding, init });
    }
    return binding;
  }

  enforestBindingIdentifier({ allowPunctuator } = {}) {
    let name;
    if (allowPunctuator && is.punctuator(this.peek())) {
      name = this.enforestPunctuator();
    } else {
      name = this.enforestIdentifier();
    }
    return new Term("BindingIdentifier", { name });
  }

  enforestPunctuator() {
    let lookahead = this.peek();
    if (is.punctuator(lookahead)) {
      return this.advance();
    }
    throw this.createError(lookahead, "expecting a punctuator");
  }

  enforestIdentifier() {
    let lookahead = this.peek();
    if (is.identifier(lookahead) || is.keyword(lookahead)) {
      return this.advance();
    }
    throw this.createError(lookahead, "expecting an identifier");
  }


  enforestReturnStatement() {
    let kw = this.advance();
    let lookahead = this.peek();

    // short circuit for the empty expression case
    if (this.rest.size === 0 ||
        (lookahead && !this.lineNumberEq(kw, lookahead))) {
      return new Term("ReturnStatement", {
        expression: null
      });
    }

    let term = null;
    if (!is.punctuator(lookahead, ';')) {
      term = this.enforestExpression();
      expect(term != null, "Expecting an expression to follow return keyword", lookahead, this.rest);
    }

    this.consumeSemicolon();
    return new Term("ReturnStatement", {
      expression: term
    });
  }

  enforestVariableDeclaration() {
    let kind;
    let lookahead = this.advance();
    let kindSyn = lookahead;

    if (kindSyn &&
        this.context.env.get(kindSyn.resolve()) === VariableDeclTransform) {
      kind = "var";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === LetDeclTransform) {
      kind = "let";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === ConstDeclTransform) {
      kind = "const";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === SyntaxDeclTransform) {
      kind = "syntax";
    } else if (kindSyn &&
               this.context.env.get(kindSyn.resolve()) === SyntaxrecDeclTransform) {
      kind = "syntaxrec";
    }

    let decls = List();

    while (true) {
      let term = this.enforestVariableDeclarator({ isSyntax: kind === "syntax" || kind === 'syntaxrec' });
      let lookahead = this.peek();
      decls = decls.concat(term);

      if (is.punctuator(lookahead, ",")) {
        this.advance();
      } else {
        break;
      }
    }

    return new Term('VariableDeclaration', {
      kind: kind,
      declarators: decls
    });
  }

  enforestVariableDeclarator({ isSyntax }) {
    let id = this.enforestBindingTarget({ allowPunctuator: isSyntax });
    let lookahead = this.peek();

    let init, rest;
    if (is.punctuator(lookahead, '=')) {
      this.advance();
      let enf = new Enforester(this.rest, List(), this.context);
      init = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init = null;
    }
    return new Term("VariableDeclarator", {
      binding: id,
      init: init
    });
  }

  enforestExpressionStatement() {
    let start = this.rest.get(0);
    let expr = this.enforestExpression();
    if (expr === null) {
      throw this.createError(start, "not a valid expression");
    }
    this.consumeSemicolon();

    return new Term("ExpressionStatement", {
      expression: expr
    });
  }

  enforestExpression() {
    let left = this.enforestExpressionLoop();
    let lookahead = this.peek();
    if (is.punctuator(lookahead, ',')) {
      while (this.rest.size !== 0) {
        if (!is.punctuator(this.peek(), ',')) {
          break;
        }
        let operator = this.advance();
        let right = this.enforestExpressionLoop();
        left = new Term('BinaryExpression', {left, operator, right});
      }
    }
    this.term = null;
    return left;
  }

  enforestExpressionLoop() {
    this.term = null;
    this.opCtx = {
      prec: 0,
      combine: (x) => x,
      stack: List()
    };

    do {
      let term = this.enforestAssignmentExpression();
      // no change means we've done as much enforesting as possible
      // if nothing changed, maybe we just need to pop the expr stack
      if (term === EXPR_LOOP_NO_CHANGE && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);
        let {prec, combine} = this.opCtx.stack.last();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      } else if (term === EXPR_LOOP_NO_CHANGE) {
        break;
      } else if (term === EXPR_LOOP_OPERATOR || term === EXPR_LOOP_EXPANSION) {
        // operator means an opCtx was pushed on the stack
        this.term = null;
      } else {
        this.term = term;
      }
    } while (true);  // get a fixpoint
    return this.term;
  }

  enforestAssignmentExpression() {
    let lookahead = this.peek();

    if (this.term === null && this.isTerm(lookahead)) {
      // TODO: check that this is actually an expression
      return this.advance();
    }

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      let result = this.expandMacro();
      this.rest = result.concat(this.rest);
      return EXPR_LOOP_EXPANSION;
    }

    if (this.term === null && is.keyword(lookahead, 'yield')) {
      return this.enforestYieldExpression();
    }

    if (this.term === null && is.keyword(lookahead, 'class')) {
      return this.enforestClass({isExpr: true});
    }
    if (this.term === null && is.keyword(lookahead, 'super')) {
      this.advance();
      return new Term('Super', {});
    }
    if (this.term === null &&
      (is.identifier(lookahead) || is.parens(lookahead)) &&
       is.punctuator(this.peek(1), '=>') &&
       this.lineNumberEq(lookahead, this.peek(1))) {
      return this.enforestArrowExpression();
    }



    if (this.term === null && is.syntaxTemplate(lookahead)) {
      return this.enforestSyntaxTemplate();
    }
    // syntaxQuote ` ... `
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead)) {
      return this.enforestSyntaxQuote();
    }

    if (this.term === null && this.isNewTransform(lookahead)) {
      return this.enforestNewExpression();
    }

    // $x:ThisExpression
    if (this.term === null && is.keyword(lookahead, "this")) {
      return new Term("ThisExpression", {
        stx: this.advance()
      });
    }
    // $x:ident
    if (this.term === null && (is.identifier(lookahead) || is.keyword(lookahead, 'let') || is.keyword(lookahead, 'yield'))) {
      return new Term("IdentifierExpression", {
        name: this.advance()
      });
    }
    if (this.term === null && is.number(lookahead)) {
      let num = this.advance();
      if (num.val() === 1 / 0) {
        return new Term('LiteralInfinityExpression', {});
      }
      return new Term("LiteralNumericExpression", {
        value: num
      });
    }
    if (this.term === null && is.string(lookahead)) {
      return new Term("LiteralStringExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && is.template(lookahead)) {
      return new Term('TemplateExpression', {
        tag: null,
        elements: this.enforestTemplateElements()
      });
    }
    if (this.term === null && is.boolean(lookahead)) {
      return new Term("LiteralBooleanExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && is.null(lookahead)) {
      this.advance();
      return new Term("LiteralNullExpression", {});
    }
    if (this.term === null && is.regularExpression(lookahead)) {
      let reStx = this.advance();

      let lastSlash = reStx.token.value.lastIndexOf("/");
      let pattern = reStx.token.value.slice(1, lastSlash);
      let flags = reStx.token.value.slice(lastSlash + 1);
      return new Term("LiteralRegExpExpression", {
        pattern, flags
      });
    }
    // ($x:expr)
    if (this.term === null && is.parens(lookahead)) {
      return new Term("ParenthesizedExpression", {
        inner: this.advance().inner()
      });
    }
    // $x:FunctionExpression
    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionExpression();
    }

    // { $p:prop (,) ... }
    if (this.term === null && is.braces(lookahead)) {
      return this.enforestObjectExpression();
    }

    // [$x:expr (,) ...]
    if (this.term === null && is.brackets(lookahead)) {
      return this.enforestArrayExpression();
    }

    // prefix unary
    if (this.term === null && this.isOperator(lookahead)) {
      return this.enforestUnaryExpression();
    }

    // and then check the cases where the term part of p is something...

    // postfix unary
    if (this.term && this.isUpdateOperator(lookahead)) {
      return this.enforestUpdateExpression();
    }

    // $l:expr $op:binaryOperator $r:expr
    if (this.term && this.isOperator(lookahead)) {
      return this.enforestBinaryExpression();
    }
    // $x:expr . $prop:ident
    if (this.term && is.punctuator(lookahead, ".") &&
        (is.identifier(this.peek(1)) || is.keyword(this.peek(1)))) {
      return this.enforestStaticMemberExpression();
    }
    // $x:expr [ $b:expr ]
    if (this.term && is.brackets(lookahead)) {
      return this.enforestComputedMemberExpression();
    }
    // $x:expr (...)
    if (this.term && is.parens(lookahead)) {
      let paren = this.advance();
      return new Term("CallExpression", {
        callee: this.term,
        arguments: paren.inner()
      });
    }
    // $x:id `...`
    if (this.term && is.template(lookahead)) {
      return new Term('TemplateExpression', {
        tag: this.term,
        elements: this.enforestTemplateElements()
      });
    }
    // $x:expr = $init:expr
    if (this.term && is.assign(lookahead)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.advance();

      let enf = new Enforester(this.rest, List(), this.context);
      let init = enf.enforest("expression");
      this.rest = enf.rest;

      if (op.val() === '=') {
        return new Term('AssignmentExpression', {
          binding,
          expression: init
        });
      } else {
        return new Term('CompoundAssignmentExpression', {
          binding,
          operator: op.val(),
          expression: init
        });
      }
    }

    if (this.term && is.punctuator(lookahead, '?')) {
      return this.enforestConditionalExpression();
    }

    return EXPR_LOOP_NO_CHANGE;
  }

  enforestArgumentList() {
    let result = [];
    while (this.rest.size > 0) {
      let arg;
      if (is.punctuator(this.peek(), '...')) {
        this.advance();
        arg = new Term('SpreadElement', {
          expression: this.enforestExpressionLoop()
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
    let callee;
    if (is.keyword(this.peek(), 'new')) {
      callee = this.enforestNewExpression();
    } else if (is.keyword(this.peek(), 'super')) {
      callee = this.enforestExpressionLoop();
    } else if (is.punctuator(this.peek(), '.') && is.identifier(this.peek(1), 'target')) {
      this.advance();
      this.advance();
      return new Term('NewTargetExpression', {});
    } else {
      callee = new Term('IdentifierExpression', { name : this.enforestIdentifier() });
    }
    let args;
    if (is.parens(this.peek())) {
      args = this.matchParens();
    } else {
      args = List();
    }
    return new Term('NewExpression', {
      callee,
      arguments: args
    });
  }

  enforestComputedMemberExpression() {
    let enf = new Enforester(this.matchSquares(), List(), this.context);
    return new Term('ComputedMemberExpression', {
      object: this.term,
      expression: enf.enforestExpression()
    });
  }

  transformDestructuring(term) {
    switch (term.type) {
      case 'IdentifierExpression':
        return new Term('BindingIdentifier', {name: term.name});

      case 'ParenthesizedExpression':
        if (term.inner.size === 1 && is.identifier(term.inner.get(0))) {
          return new Term('BindingIdentifier', { name: term.inner.get(0)});
        }
      case 'DataProperty':
        return new Term('BindingPropertyProperty', {
          name: term.name,
          binding: this.transformDestructuringWithDefault(term.expression)
        });
      case 'ShorthandProperty':
        return new Term('BindingPropertyIdentifier', {
          binding: new Term('BindingIdentifier', { name: term.name }),
          init: null
        });
      case 'ObjectExpression':
        return new Term('ObjectBinding', {
          properties: term.properties.map(t => this.transformDestructuring(t))
        });
      case 'ArrayExpression':
        let last = term.elements.last();
        if (last != null && last.type === 'SpreadElement') {
          return new Term('ArrayBinding', {
            elements: term.elements.slice(0, -1).map(t => t && this.transformDestructuringWithDefault(t)),
            restElement: this.transformDestructuringWithDefault(last.expression)
          });
        } else {
          return new Term('ArrayBinding', {
            elements: term.elements.map(t => t && this.transformDestructuringWithDefault(t)),
            restElement: null
          });
        }
        return new Term('ArrayBinding', {
          elements: term.elements.map(t => t && this.transformDestructuring(t)),
          restElement: null
        });
      case 'StaticPropertyName':
        return new Term('BindingIdentifier', {
          name: term.value
        });
      case 'ComputedMemberExpression':
      case 'StaticMemberExpression':
      case 'ArrayBinding':
      case 'BindingIdentifier':
      case 'BindingPropertyIdentifier':
      case 'BindingPropertyProperty':
      case 'BindingWithDefault':
      case 'ObjectBinding':
        return term;
    }
    assert(false, 'not implemented yet for ' + term.type);
  }

  transformDestructuringWithDefault(term) {
    switch (term.type) {
      case "AssignmentExpression":
        return new Term('BindingWithDefault', {
          binding: this.transformDestructuring(term.binding),
          init: term.expression,
        });
    }
    return this.transformDestructuring(term);
  }

  enforestArrowExpression() {
    let enf;
    if (is.identifier(this.peek())) {
      enf = new Enforester(List.of(this.advance()), List(), this.context);
    } else {
      let p = this.matchParens();
      enf = new Enforester(p, List(), this.context);
    }
    let params = enf.enforestFormalParameters();
    this.matchPunctuator('=>');

    let body;
    if (is.braces(this.peek())) {
      body = this.matchCurlies();
    } else {
      enf = new Enforester(this.rest, List(), this.context);
      body = enf.enforestExpressionLoop();
      this.rest = enf.rest;
    }
    return new Term('ArrowExpression', { params, body });
  }


  enforestYieldExpression() {
    let kwd = this.matchKeyword('yield');
    let lookahead = this.peek();

    if (this.rest.size === 0 || (lookahead && !this.lineNumberEq(kwd, lookahead))) {
      return new Term('YieldExpression', {
        expression: null
      });
    } else {
      let isGenerator = false;
      if (is.punctuator(this.peek(), '*')) {
          isGenerator = true;
          this.advance();
      }
      let expr = this.enforestExpression();
      let type = isGenerator ? 'YieldGeneratorExpression' : 'YieldExpression';
      return new Term(type, {
        expression: expr
      });
    }
  }

  enforestSyntaxTemplate() {
    return new Term('SyntaxTemplate', {
      template: this.advance()
    });
  }

  enforestSyntaxQuote() {
    let name = this.advance();
    return new Term('SyntaxQuote', {
      name: name,
      template: new Term('TemplateExpression', {
        tag: new Term('IdentifierExpression', {
          name: name
        }),
        elements: this.enforestTemplateElements()
      })
    });
  }

  enforestStaticMemberExpression() {
    let object = this.term;
    let dot = this.advance();
    let property = this.advance();

    return new Term("StaticMemberExpression", {
      object: object,
      property: property
    });
  }

  enforestArrayExpression() {
    let arr = this.advance();

    let elements = [];

    let enf = new Enforester(arr.inner(), List(), this.context);

    while (enf.rest.size > 0) {
      let lookahead = enf.peek();
      if (is.punctuator(lookahead, ",")) {
        enf.advance();
        elements.push(null);
      } else if (is.punctuator(lookahead, '...')) {
        enf.advance();
        let expression = enf.enforestExpressionLoop();
        if (expression == null) {
          throw enf.createError(lookahead, 'expecting expression');
        }
        elements.push(new Term('SpreadElement', { expression }));
      } else {
        let term = enf.enforestExpressionLoop();
        if (term == null) {
          throw enf.createError(lookahead, "expected expression");
        }
        elements.push(term);
        enf.consumeComma();
      }
    }

    return new Term("ArrayExpression", {
      elements: List(elements)
    });
  }

  enforestObjectExpression() {
    let obj = this.advance();

    let properties = List();

    let enf = new Enforester(obj.inner(), List(), this.context);

    let lastProp = null;
    while (enf.rest.size > 0) {
      let prop = enf.enforestPropertyDefinition();
      enf.consumeComma();
      properties = properties.concat(prop);

      if (lastProp === prop) {
        throw enf.createError(prop, "invalid syntax in object");
      }
      lastProp = prop;
    }

    return new Term("ObjectExpression", {
      properties: properties
    });
  }

  enforestPropertyDefinition() {

    let {methodOrKey, kind} = this.enforestMethodDefinition();

    switch (kind) {
      case 'method':
        return methodOrKey;
      case 'identifier':
        if (is.assign(this.peek())) {
          this.advance();
          let init = this.enforestExpressionLoop();
          return new Term('BindingPropertyIdentifier', {
            init, binding: this.transformDestructuring(methodOrKey)
          });
        } else if (!is.punctuator(this.peek(), ':')) {
          return new Term('ShorthandProperty', {
            name: methodOrKey.value
          });
        }
    }

    this.matchPunctuator(':');
    let expr = this.enforestExpressionLoop();

    return new Term("DataProperty", {
      name: methodOrKey,
      expression: expr
    });
  }

  enforestMethodDefinition() {
    let lookahead = this.peek();
    let isGenerator = false;
    if (is.punctuator(lookahead, '*')) {
      isGenerator = true;
      this.advance();
    }

    if (is.identifier(lookahead, 'get') && this.isPropertyName(this.peek(1))) {
      this.advance();
      let {name} = this.enforestPropertyName();
      this.matchParens();
      let body = this.matchCurlies();
      return {
        methodOrKey: new Term('Getter', { name, body }),
        kind: 'method'
      };
    } else if (is.identifier(lookahead, 'set') && this.isPropertyName(this.peek(1))) {
      this.advance();
      let {name} = this.enforestPropertyName();
      let enf = new Enforester(this.matchParens(), List(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return {
        methodOrKey: new Term('Setter', { name, param, body }),
        kind: 'method'
      };
    }
    let {name} = this.enforestPropertyName();
    if (is.parens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester(params, List(), this.context);
      let formalParams = enf.enforestFormalParameters();

      let body = this.matchCurlies();
      return {
        methodOrKey: new Term('Method', {
          isGenerator,
          name, params: formalParams, body
        }),
        kind: 'method'
      };
    }
    return {
      methodOrKey: name,
      kind: is.identifier(lookahead) || is.keyword(lookahead) ? 'identifier' : 'property'
    };
  }

  enforestPropertyName() {
    let lookahead = this.peek();

    if (is.string(lookahead) || is.number(lookahead)) {
      return {
        name: new Term('StaticPropertyName', {
          value: this.advance()
        }),
        binding: null
      };
    } else if (is.brackets(lookahead)) {
      let enf = new Enforester(this.matchSquares(), List(), this.context);
      let expr = enf.enforestExpressionLoop();
      return {
        name: new Term('ComputedPropertyName', {
          expression: expr
        }),
        binding: null
      };
    }
    let name = this.advance();
    return {
      name: new Term('StaticPropertyName', { value: name }),
      binding: new Term('BindingIdentifier', { name })
    };
  }

  enforestFunction({isExpr, inDefault, allowGenerator}) {
    let name = null, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    let fnKeyword = this.advance();
    let lookahead = this.peek();
    let type = isExpr ? 'FunctionExpression' : 'FunctionDeclaration';

    if (is.punctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (!is.parens(lookahead)) {
      name = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name = new Term('BindingIdentifier', {
        name: Syntax.from("identifier", '*default*', fnKeyword)
      });
    }


    params = this.matchParens();


    body = this.matchCurlies();

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new Term(type, {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFunctionExpression() {
    let name = null, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (is.punctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (!is.parens(lookahead)) {
      name = this.enforestBindingIdentifier();
    }

    params = this.matchParens();
    body = this.matchCurlies();

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new Term("FunctionExpression", {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFunctionDeclaration() {
    let name, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (is.punctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
    }

    name = this.enforestBindingIdentifier();

    params = this.matchParens();
    body = this.matchCurlies();

    let enf = new Enforester(params, List(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new Term("FunctionDeclaration", {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFormalParameters() {
    let items = [];
    let rest = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (is.punctuator(lookahead, '...')) {
        this.matchPunctuator('...');
        rest = this.enforestBindingIdentifier();
        break;
      }
      items.push(this.enforestParam());
      this.consumeComma();
    }
    return new Term("FormalParameters", {
      items: List(items), rest
    });
  }

  enforestParam() {
    return this.enforestBindingElement();
  }

  enforestUpdateExpression() {
    let operator = this.matchUnaryOperator();

    return new Term('UpdateExpression', {
      isPrefix: false,
      operator: operator.val(),
      operand: this.transformDestructuring(this.term)
    });
  }

  enforestUnaryExpression() {
    let operator = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({
      prec: this.opCtx.prec,
      combine: this.opCtx.combine
    });
    // TODO: all builtins are 14, custom operators will change this
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm => {
      let type, term, isPrefix;
      if (operator.val() === '++' || operator.val() === '--') {
        type = 'UpdateExpression';
        term = this.transformDestructuring(rightTerm);
        isPrefix = true;
      } else {
        type = 'UnaryExpression';
        isPrefix = undefined;
        term = rightTerm;
      }
      return new Term(type, {
        operator: operator.val(),
        operand: term,
        isPrefix
      });
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
    return new Term('ConditionalExpression', {
      test, consequent, alternate
    });
  }

  enforestBinaryExpression() {

    let leftTerm = this.term;
    let opStx = this.peek();
    let op = opStx.val();
    let opPrec = getOperatorPrec(op);
    let opAssoc = getOperatorAssoc(op);

    if (operatorLt(this.opCtx.prec, opPrec, opAssoc)) {
      this.opCtx.stack = this.opCtx.stack.push({
        prec: this.opCtx.prec,
        combine: this.opCtx.combine
      });
      this.opCtx.prec = opPrec;
      this.opCtx.combine = (rightTerm) => {
        return new Term("BinaryExpression", {
          left: leftTerm,
          operator: opStx,
          right: rightTerm
        });
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
      if (it instanceof Syntax && it.match("delimiter")) {
        let enf = new Enforester(it.inner(), List(), this.context);
        return enf.enforest("expression");
      }
      return new Term('TemplateElement', {
        rawValue: it.slice.text
      });
    });
    return elements;
  }

  expandMacro(enforestType) {
    let name = this.advance();

    let syntaxTransform = this.getCompiletimeTransform(name);
    if (syntaxTransform == null || typeof syntaxTransform.value !== "function") {
      throw this.createError(name,
        "the macro name was not bound to a value that could be invoked");
    }
    let useSiteScope = freshScope("u");
    let introducedScope = freshScope("i");
    // TODO: needs to be a list of scopes I think
    this.context.useScope = useSiteScope;

    let ctx = new MacroContext(this, name, this.context, useSiteScope, introducedScope);

    let result = sanitizeReplacementValues(syntaxTransform.value.call(null, ctx));
    if (!List.isList(result)) {
      throw this.createError(name, "macro must return a list but got: " + result);
    }
    result = result.map(stx => {
      if (!(stx && typeof stx.addScope === 'function')) {
        throw this.createError(name, 'macro must return syntax objects or terms but got: ' + stx);
      }
      return stx.addScope(introducedScope, this.context.bindings, { flip: true });
    });

    return result;

  }

  consumeSemicolon() {
    let lookahead = this.peek();

    if (lookahead && is.punctuator(lookahead, ";")) {
      this.advance();
    }
  }

  consumeComma() {
    let lookahead = this.peek();

    if (lookahead && is.punctuator(lookahead, ',')) {
      this.advance();
    }
  }

  isTerm(term) {
    return term && (term instanceof Term);
  }

  isPropertyName(term) {
    return is.identifier(term) || is.keyword(term) ||
           is.number(term) || is.string(term) || is.brackets(term);
  }
  isOperator(term) {
    return term && (term instanceof Syntax) && isOperator(term);
  }
  isUpdateOperator(term) {
    return term && (term instanceof Syntax) && term.match("punctuator") &&
      (term.val() === '++' || term.val() === '--');
  }

  isFnDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === FunctionDeclTransform;
  }

  isVarDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === VariableDeclTransform;
  }

  isLetDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === LetDeclTransform;
  }

  isConstDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ConstDeclTransform;
  }

  isSyntaxDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SyntaxDeclTransform;
  }

  isSyntaxrecDeclTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SyntaxrecDeclTransform;
  }
  isSyntaxQuoteTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SyntaxQuoteTransform;
  }

  isReturnStmtTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ReturnStatementTransform;
  }

  isWhileTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === WhileTransform;
  }

  isForTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ForTransform;
  }
  isSwitchTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === SwitchTransform;
  }
  isBreakTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === BreakTransform;
  }
  isContinueTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ContinueTransform;
  }
  isDoTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === DoTransform;
  }
  isDebuggerTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === DebuggerTransform;
  }
  isWithTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === WithTransform;
  }
  isTryTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === TryTransform;
  }
  isThrowTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === ThrowTransform;
  }
  isIfTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === IfTransform;
  }
  isNewTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === NewTransform;
  }

  isCompiletimeTransform(term) {
    return term && (term instanceof Syntax) &&
           (this.context.env.get(term.resolve()) instanceof CompiletimeTransform ||
            this.context.store.get(term.resolve()) instanceof CompiletimeTransform);
  }

  getCompiletimeTransform(term) {
    if (this.context.env.has(term.resolve())) {
      return this.context.env.get(term.resolve());
    }
    return this.context.store.get(term.resolve());
  }

  lineNumberEq(a, b) {
    if (!(a && b)) {
      return false;
    }
    return a.lineNumber() === b.lineNumber();
  }

  matchIdentifier(val) {
    let lookahead = this.advance();
    if (is.identifier(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting an identifier");
  }

  matchKeyword(val) {
    let lookahead = this.advance();
    if (is.keyword(lookahead, val)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting ' + val);
  }

  matchLiteral() {
    let lookahead = this.advance();
    if (is.number(lookahead) ||
        is.string(lookahead) ||
        is.boolean(lookahead) ||
        is.null(lookahead) ||
        is.template(lookahead) ||
        is.regularExpression(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a literal");
  }

  matchStringLiteral() {
    let lookahead = this.advance();
    if (is.string(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a string literal');
  }

  matchTemplate() {
    let lookahead = this.advance();
    if (is.template(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a template literal');
  }

  matchParens() {
    let lookahead = this.advance();
    if (is.parens(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting parens");
  }

  matchCurlies() {
    let lookahead = this.advance();
    if (is.braces(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting curly braces");
  }
  matchSquares() {
    let lookahead = this.advance();
    if (is.brackets(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting sqaure braces");
  }

  matchUnaryOperator() {
    let lookahead = this.advance();
    if (isUnaryOperator(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a unary operator");
  }

  matchPunctuator(val) {
    let lookahead = this.advance();
    if (is.punctuator(lookahead)) {
      if (typeof val !== 'undefined') {
        if (lookahead.val() === val) {
          return lookahead;
        } else {
          throw this.createError(lookahead,
            "expecting a " + val + " punctuator");
        }
      }
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a punctuator");
  }

  createError(stx, message) {
    let ctx = "";
    let offending = stx;
    if (this.rest.size > 0) {
      ctx = this.rest.slice(0, 20).map(term => {
        if (term.match("delimiter")) {
          return term.inner();
        }
        return List.of(term);
      }).flatten().map(s => {
        if (s === offending) {
          return "__" + s.val() + "__";
        }
        return s.val();
      }).join(" ");
    } else {
      ctx = offending.toString();
    }
    return new Error(message + "\n" + ctx);

  }
}
