import Term from "./terms";

import {
  FunctionDeclTransform,
  VariableDeclTransform,
  LetDeclTransform,
  ConstDeclTransform,
  SyntaxDeclTransform,
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
  CompiletimeTransform
} from "./transforms";
import { List } from "immutable";
import { expect, assert } from "./errors";
import {
  isOperator,
  getOperatorAssoc,
  getOperatorPrec,
  operatorLt
} from "./operators";
import Syntax from "./syntax";

import { freshScope } from "./scope";

import MacroContext from "./macro-context";

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

    if (this.isEOF(this.peek())) {
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
    if (this.isKeyword(lookahead, 'import')) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isKeyword(lookahead, 'export')) {
      this.advance();
      return this.enforestExportDeclaration();
    }
    return this.enforestStatement();
  }

  enforestExportDeclaration() {
    let lookahead = this.peek();
    if (this.isVarDeclTransform(lookahead) ||
        this.isLetDeclTransform(lookahead) ||
        this.isConstDeclTransform(lookahead) ||
        this.isSyntaxDeclTransform(lookahead)) {
      return new Term('Export', {
        declaration: new Term('VariableDeclarationStatement', {
          declaration: this.enforestVariableDeclaration()
        })
      });
    }
    throw "not implemented yet";
  }

  enforestImportDeclaration() {
    let lookahead = this.peek();

    if (this.isCurlyDelimiter(lookahead)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();

      return new Term("Import", {
        defaultBinding: null,
        // List(ImportSpecifier)
        namedImports: imports,
        // String
        moduleSpecifier: fromClause

      });
    }
    throw "not implemented yet";
  }

  enforestNamedImports() {
    let enf = new Enforester(this.matchCurlies(), List(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestImportSpecifiers());
    }
    return List(result);
  }

  enforestImportSpecifiers() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead)) {
      let name = this.advance();
      this.consumeComma();
      return new Term('ImportSpecifier', {
        name: null,
        binding: new Term('BindingIdentifier', {
          name: name
        })
      });
    }
    throw this.createError(lookahead, 'unexpected token in import specifier');
  }

  enforestFromClause() {
    this.matchIdentifier('from');
    let lookahead = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead.val();
  }

  enforestStatementListItem() {
    let lookahead = this.peek();

    if (this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionDeclaration({ isExpr: false });
    } else if (this.isKeyword(lookahead, 'class')) {
      return this.enforestClass({ isExpr: false });
    } else {
      return this.enforestStatement();
    }
  }

  enforestStatement() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      return this.expandMacro();
    }

    if (this.term === null && this.isCurlyDelimiter(lookahead)) {
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

    // TODO: put somewhere else
    if (this.term === null && this.isKeyword(lookahead, "class")) {
      return this.enforestClass({isExpr: false});
    }

    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionDeclaration();
    }

    if (this.term === null && this.isIdentifier(lookahead) &&
        this.isPunctuator(this.peek(1), ':')) {
      return this.enforestLabeledStatement();
    }

    if (this.term === null &&
        (this.isVarDeclTransform(lookahead) ||
         this.isLetDeclTransform(lookahead) ||
         this.isConstDeclTransform(lookahead) ||
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

    if (this.term === null && this.isPunctuator(lookahead, ";")) {
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
    if (this.rest.size === 0 || this.isPunctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new Term('BreakStatement', { label });
    }
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'yield') || this.isKeyword(lookahead, 'let')) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new Term('BreakStatement', { label });
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
    if (this.rest.size === 0 || this.isPunctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new Term('ContinueStatement', { label });
    }
    if (this.lineNumberEq(kwd, lookahead) &&
        (this.isIdentifier(lookahead) ||
         this.isKeyword(lookahead, 'yield') ||
         this.isKeyword(lookahead, 'let'))) {
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
    if (enf.isKeyword(lookahead, 'default')) {
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
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default'))) {
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
    while(!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default') || this.isKeyword(this.peek(), 'case'))) {
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
    if (enf.isPunctuator(enf.peek(), ';')) {
      enf.advance();
      if (!enf.isPunctuator(enf.peek(), ';')) {
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
        if (this.isKeyword(lookahead, 'in') || this.isIdentifier(lookahead, 'of')) {
          if (this.isKeyword(lookahead, 'in')) {
            enf.advance();
            right = enf.enforestExpression();
            type = 'ForInStatement';
          } else if (this.isIdentifier(lookahead, 'of')) {
            enf.advance();
            right = enf.enforestExpression();
            type = 'ForOfStatement';
          }
          return new Term(type, {
            left: init, right, body: this.enforestStatement()
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
        if (this.isKeyword(enf.peek(1), 'in') || this.isIdentifier(enf.peek(1), 'of')) {
          left = enf.enforestBindingIdentifier();
          let kind = enf.advance();
          if (this.isKeyword(kind, 'in')) {
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
        if (enf.isPunctuator(enf.peek(), ';')) {
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
    if (this.isKeyword(this.peek(), 'else')) {
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

  enforestClass({ isExpr }) {
    this.advance();
    let name = this.enforestBindingIdentifier();
    this.advance();
    return new Term("ClassDeclaration", {
      name: name,
      elements: List()
    });
  }

  enforestBindingTarget() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, "yield") ||
        this.isKeyword(lookahead, "let")) {
      return this.enforestBindingIdentifier();
    }
    throw "not implemented yet";
  }

  enforestBindingIdentifier() {
    return new Term("BindingIdentifier", {
      name: this.enforestIdentifier()
    });
  }

  enforestIdentifier() {
    let lookahead = this.peek();
    // TODO handle yields
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'yield') || this.isKeyword(lookahead, 'let')) {
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
    if (!this.isPunctuator(lookahead, ';')) {
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
    }

    let decls = List();

    while (true) {
      let term = this.enforestVariableDeclarator();
      let lookahead = this.peek();
      decls = decls.concat(term);

      if (this.isPunctuator(lookahead, ",")) {
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

  enforestVariableDeclarator() {
    let id = this.enforestBindingTarget();
    let lookahead = this.peek();

    let init, rest;
    if (this.isPunctuator(lookahead, '=')) {
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
    if (this.isPunctuator(lookahead, ',')) {
      while (this.rest.size !== 0) {
        if (!this.isPunctuator(this.peek(), ',')) {
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
    let lastTerm;
    let firstTime = true;

    this.term = null;
    this.opCtx = {
      prec: 0,
      combine: (x) => x,
      stack: List()
    };

    do {
      lastTerm = this.term;
      this.term = this.enforestAssignmentExpression();

      if (firstTime) {
        firstTime = false;
        if (this.term === null) {
          break;
        }
      }

      // if nothing changed, maybe we just need to pop the expr stack
      if (lastTerm === this.term && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);
        let {prec, combine} = this.opCtx.stack.last();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      }
      // if we had that chance to pop the operator stack and still the
      // current term and last term are null then we got into an infinite
      // loop
      assert(!(this.term === null && lastTerm === null),
        "enforesting an expression should never be null");

    } while (lastTerm !== this.term);  // get a fixpoint
    return this.term;
  }

  enforestAssignmentExpression() {
    let lookahead = this.peek();

    if (this.term === null && this.isTerm(lookahead)) {
      // TODO: check that this is actually an expression
      return this.advance();
    }

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      let term = this.expandMacro("expression");
      // TODO: need to figure out the right way of checking if terms are expressions
      // if (!(term instanceof T.ExpressionTerm)) {
      //     throw this.createError(term,
      //                            "expecting macro to return an expression");
      // }
      return term;
    }

    if (this.term === null && this.isKeyword(lookahead, 'yield')) {
      return this.enforestYieldExpression();
    }

    // $x:ident = $init:expr
    if (this.term === null && this.isIdentifier(lookahead) &&
        this.isPunctuator(this.peek(1), "=")) {
      let id = this.enforestBindingTarget();
      let op = this.advance();
      // todo: too restrictive right now
      assert(this.isPunctuator(op, "="), "expecting an assignment operator");

      let enf = new Enforester(this.rest, List(), this.context);
      let init = enf.enforest("expression");
      this.rest = enf.rest;

      return new Term("AssignmentExpression", {
        binding: id,
        expression: init
      });
    }

    // syntaxQuote ` ... `
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead)) {
      return this.enforestSyntaxQuote();
    }

    // $x:ThisExpression
    if (this.term === null && this.isKeyword(lookahead, "this")) {
      return new Term("ThisExpression", {
        stx: this.advance()
      });
    }
    // $x:ident
    if (this.term === null && this.isIdentifier(lookahead)) {
      return new Term("IdentifierExpression", {
        name: this.advance()
      });
    }
    if (this.term === null && this.isNumericLiteral(lookahead)) {
      let num = this.advance();
      if (num.val() === 1 / 0) {
        return new Term('LiteralInfinityExpression', {});
      }
      return new Term("LiteralNumericExpression", {
        value: num
      });
    }
    if (this.term === null && this.isStringLiteral(lookahead)) {
      return new Term("LiteralStringExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && this.isTemplate(lookahead)) {
      return new Term('TemplateExpression', {
        tag: null,
        elements: this.enforestTemplateElements()
      });
    }
    if (this.term === null && this.isBooleanLiteral(lookahead)) {
      return new Term("LiteralBooleanExpression", {
        value: this.advance()
      });
    }
    if (this.term === null && this.isNullLiteral(lookahead)) {
      this.advance();
      return new Term("LiteralNullExpression", {});
    }
    if (this.term === null && this.isRegularExpression(lookahead)) {
      let reStx = this.advance();
      return new Term("LiteralRegExpExpression", {
        pattern: reStx.token.regex.pattern,
        flags: reStx.token.regex.flags
      });
    }
    // ($x:expr)
    if (this.term === null && this.isParenDelimiter(lookahead)) {
      return new Term("ParenthesizedExpression", {
        inner: this.advance().inner()
      });
    }
    // $x:FunctionExpression
    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionExpression();
    }

    // { $p:prop (,) ... }
    if (this.term === null && this.isCurlyDelimiter(lookahead)) {
      return this.enforestObjectExpression();
    }

    // [$x:expr (,) ...]
    if (this.term === null && this.isSquareDelimiter(lookahead)) {
      return this.enforestArrayExpression();
    }

    // and then check the cases where the term part of p is something...

    // $x:expr . $prop:ident
    if (this.term && this.isPunctuator(lookahead, ".")) {
      return this.enforestStaticMemberExpression();
    }
    // $l:expr $op:binaryOperator $r:expr
    if (this.term && this.isOperator(lookahead)) {
      return this.enforestBinaryExpression();
    }
    // $x:expr (...)
    if (this.term && this.isParenDelimiter(lookahead)) {
      let paren = this.advance();
      return new Term("CallExpression", {
        callee: this.term,
        arguments: paren
      });
    }
    if (this.term && this.isTemplate(lookahead)) {
      return new Term('TemplateExpression', {
        tag: this.term,
        elements: this.enforestTemplateElements()
      });
    }

    return this.term;
  }

  enforestYieldExpression() {
    let kwd = this.matchKeyword('yield');
    let lookahead = this.peek();

    if (this.rest.size === 0 || (lookahead && !this.lineNumberEq(kwd, lookahead))) {
      return new Term('YieldExpression', {
        expression: null
      });
    } else {
      let expr = this.enforestExpression();
      return new Term('YieldExpression', {
        expression: expr
      });
    }
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
    let property = this.matchIdentifier();

    return new Term("StaticMemberExpression", {
      object: object,
      property: property
    });
  }

  enforestArrayExpression() {
    let arr = this.advance();

    let elements = List();

    let enf = new Enforester(arr.inner(), List(), this.context);

    while (enf.rest.size > 0) {
      let lookahead = enf.peek();
      if (enf.isPunctuator(lookahead, ",")) {
        enf.advance();
        elements = elements.concat(null);
      } else {
        let term = enf.enforestExpressionLoop();
        elements = elements.concat(term);
        enf.consumeComma();
      }
    }

    return new Term("ArrayExpression", {
      elements: elements
    });
  }

  enforestObjectExpression() {
    let obj = this.advance();

    let properties = List();

    let enf = new Enforester(obj.inner(), List(), this.context);

    let lastProp = null;
    while (enf.rest.size > 0) {
      let prop = enf.enforestProperty();
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

  enforestProperty() {
    let key = this.matchIdentifier();
    let colon = this.matchPunctuator(":");

    let value = this.enforestExpressionLoop();
    this.consumeComma();

    let name = new Term("StaticPropertyName", {
      value: key
    });

    return new Term("DataProperty", {
      name: name,
      expression: value
    });
  }

  enforestFunctionExpression() {
    let name = null, params, body, rest;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (this.isPunctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (this.isIdentifier(lookahead)) {
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

    if (this.isPunctuator(lookahead, "*")) {
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
    while (this.rest.size !== 0) {
      let lookahead = this.peek();

      if (this.isIdentifier(lookahead)) {
        items.push(this.enforestBindingIdentifier());
      } else if (this.isPunctuator(lookahead, ",")) {
        this.advance();
      } else {
        assert(false, "not implemented yet");
      }
    }
    return new Term("FormalParameters", {
      items: List(items),
      rest: null
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
      return null;
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
      if (it instanceof Syntax && it.isDelimiter()) {
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
    this.context.useScope = useSiteScope;
    this.context.introducedScope = introducedScope;

    let ctx = new MacroContext(this, name, this.context, useSiteScope, introducedScope);

    let result = syntaxTransform.value(ctx).map(stx => {
      return stx.addScope(introducedScope, this.context.bindings, { flip: true });
    });

    // enforesting result to handle precedence issues
    // (this surrounds macro results with implicit parens)
    let enf = new Enforester(result, List(), this.context);
    let term = enf.enforest(enforestType);

    this.rest = enf.rest.concat(this.rest);

    return term;

  }

  consumeSemicolon() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ";")) {
      this.advance();
    }
  }

  consumeComma() {
    let lookahead = this.peek();

    if (lookahead && this.isPunctuator(lookahead, ',')) {
      this.advance();
    }
  }

  isTerm(term) {
    return term && (term instanceof Term);
  }

  isEOF(term) {
    return term && (term instanceof Syntax) && term.isEOF();
  }

  isIdentifier(term, val = null) {
    return term && (term instanceof Syntax) && term.isIdentifier() &&
            ((val === null) || (term.val() === val));
  }

  isNumericLiteral(term) {
    return term && (term instanceof Syntax) && term.isNumericLiteral();
  }

  isStringLiteral(term) {
    return term && (term instanceof Syntax) && term.isStringLiteral();
  }

  isTemplate(term) {
    return term && (term instanceof Syntax) && term.isTemplate();
  }

  isBooleanLiteral(term) {
    return term && (term instanceof Syntax) && term.isBooleanLiteral();
  }

  isNullLiteral(term) {
    return term && (term instanceof Syntax) && term.isNullLiteral();
  }

  isRegularExpression(term) {
    return term && (term instanceof Syntax) && term.isRegularExpression();
  }

  isParenDelimiter(term) {
    return term && (term instanceof Syntax) && term.isParenDelimiter();
  }

  isCurlyDelimiter(term) {
    return term && (term instanceof Syntax) && term.isCurlyDelimiter();
  }

  isSquareDelimiter(term) {
    return term && (term instanceof Syntax) && term.isSquareDelimiter();
  }

  isKeyword(term, val = null) {
    return term && (term instanceof Syntax) &&
           term.isKeyword() && ((val === null) || (term.val() === val));
  }

  isPunctuator(term, val = null) {
    return term && (term instanceof Syntax) &&
           term.isPunctuator() && ((val === null) || (term.val() === val));
  }

  isOperator(term) {
    return term && (term instanceof Syntax) && isOperator(term);
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
  isIfTransform(term) {
    return term && (term instanceof Syntax) &&
           this.context.env.get(term.resolve()) === IfTransform;
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
    assert(a instanceof Syntax, "expecting a syntax object");
    assert(b instanceof Syntax, "expecting a syntax object");
    return a.lineNumber() === b.lineNumber();
  }

  matchIdentifier(val) {
    let lookahead = this.advance();
    if (this.isIdentifier(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting an identifier");
  }

  matchKeyword(val) {
    let lookahead = this.advance();
    if (this.isKeyword(lookahead, val)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting ' + val);
  }

  matchLiteral() {
    let lookahead = this.advance();
    if (this.isNumericLiteral(lookahead) ||
        this.isStringLiteral(lookahead) ||
        this.isBooleanLiteral(lookahead) ||
        this.isNullLiteral(lookahead) ||
        this.isTemplate(lookahead) ||
        this.isRegularExpression(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a literal");
  }

  matchStringLiteral() {
    let lookahead = this.advance();
    if (this.isStringLiteral(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a string literal');
  }

  matchTemplate() {
    let lookahead = this.advance();
    if (this.isTemplate(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, 'expecting a template literal');
  }

  matchParens() {
    let lookahead = this.advance();
    if (this.isParenDelimiter(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting parens");
  }

  matchCurlies() {
    let lookahead = this.advance();
    if (this.isCurlyDelimiter(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting curly braces");
  }

  matchPunctuator(val) {
    let lookahead = this.advance();
    if (this.isPunctuator(lookahead)) {
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
        if (term.isDelimiter()) {
          return term.inner();
        }
        return List.of(term);
      }).flatten().map(s => {
        if (s === offending) {
          return "__" + s.val() + "__";
        }
        return s.val();
      }).join(" ");
    }
    return new Error("[error]: " + message + "\n" + ctx);
  }
}
