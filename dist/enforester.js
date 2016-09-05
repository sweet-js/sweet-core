"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enforester = undefined;

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _ramdaFantasy = require("ramda-fantasy");

var _transforms = require("./transforms");

var _immutable = require("immutable");

var _errors = require("./errors");

var _operators = require("./operators");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _scope = require("./scope");

var _loadSyntax = require("./load-syntax");

var _macroContext = require("./macro-context");

var _macroContext2 = _interopRequireDefault(_macroContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Just = _ramdaFantasy.Maybe.Just;
const Nothing = _ramdaFantasy.Maybe.Nothing;

const EXPR_LOOP_OPERATOR = {};
const EXPR_LOOP_NO_CHANGE = {};
const EXPR_LOOP_EXPANSION = {};

class Enforester {
  constructor(stxl, prev, context) {
    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev), "expecting a list of terms to enforest");
    (0, _errors.assert)(context, "expecting a context to enforest");
    this.term = null;

    this.rest = stxl;
    this.prev = prev;

    this.context = context;
  }

  peek() {
    let n = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

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
  enforest() {
    let type = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

    // initialize the term
    this.term = null;

    if (this.rest.size === 0) {
      this.done = true;
      return this.term;
    }

    if (this.isEOF(this.peek())) {
      this.term = new _terms2.default("EOF", {});
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
    } else if (this.isIdentifier(lookahead, '#')) {
      return this.enforestLanguagePragma();
    }
    return this.enforestStatement();
  }

  enforestLanguagePragma() {
    this.matchIdentifier('#');
    this.matchIdentifier('lang');
    let path = this.matchStringLiteral();
    this.consumeSemicolon();
    return new _terms2.default('Pragma', {
      kind: 'lang',
      items: _immutable.List.of(path)
    });
  }

  enforestExportDeclaration() {
    let lookahead = this.peek();
    if (this.isPunctuator(lookahead, '*')) {
      this.advance();
      let moduleSpecifier = this.enforestFromClause();
      return new _terms2.default('ExportAllFrom', { moduleSpecifier: moduleSpecifier });
    } else if (this.isBraces(lookahead)) {
      let namedExports = this.enforestExportClause();
      let moduleSpecifier = null;
      if (this.isIdentifier(this.peek(), 'from')) {
        moduleSpecifier = this.enforestFromClause();
      }
      return new _terms2.default('ExportFrom', { namedExports: namedExports, moduleSpecifier: moduleSpecifier });
    } else if (this.isKeyword(lookahead, 'class')) {
      return new _terms2.default('Export', {
        declaration: this.enforestClass({ isExpr: false })
      });
    } else if (this.isFnDeclTransform(lookahead)) {
      return new _terms2.default('Export', {
        declaration: this.enforestFunction({ isExpr: false, inDefault: false })
      });
    } else if (this.isKeyword(lookahead, 'default')) {
      this.advance();
      if (this.isFnDeclTransform(this.peek())) {
        return new _terms2.default('ExportDefault', {
          body: this.enforestFunction({ isExpr: false, inDefault: true })
        });
      } else if (this.isKeyword(this.peek(), 'class')) {
        return new _terms2.default('ExportDefault', {
          body: this.enforestClass({ isExpr: false, inDefault: true })
        });
      } else {
        let body = this.enforestExpressionLoop();
        this.consumeSemicolon();
        return new _terms2.default('ExportDefault', { body: body });
      }
    } else if (this.isVarDeclTransform(lookahead) || this.isLetDeclTransform(lookahead) || this.isConstDeclTransform(lookahead) || this.isSyntaxrecDeclTransform(lookahead) || this.isSyntaxDeclTransform(lookahead)) {
      return new _terms2.default('Export', {
        declaration: this.enforestVariableDeclaration()
      });
    }
    throw this.createError(lookahead, 'unexpected syntax');
  }

  enforestExportClause() {
    let enf = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestExportSpecifier());
      enf.consumeComma();
    }
    return (0, _immutable.List)(result);
  }

  enforestExportSpecifier() {
    let name = this.enforestIdentifier();
    if (this.isIdentifier(this.peek(), 'as')) {
      this.advance();
      let exportedName = this.enforestIdentifier();
      return new _terms2.default('ExportSpecifier', { name: name, exportedName: exportedName });
    }
    return new _terms2.default('ExportSpecifier', {
      name: null,
      exportedName: name
    });
  }

  enforestImportDeclaration() {
    let lookahead = this.peek();
    let defaultBinding = null;
    let namedImports = (0, _immutable.List)();
    let forSyntax = false;

    if (this.isStringLiteral(lookahead)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new _terms2.default('Import', {
        defaultBinding: defaultBinding,
        namedImports: namedImports,
        moduleSpecifier: moduleSpecifier,
        forSyntax: forSyntax
      });
    }

    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
      defaultBinding = this.enforestBindingIdentifier();
      if (!this.isPunctuator(this.peek(), ',')) {
        let moduleSpecifier = this.enforestFromClause();
        if (this.isKeyword(this.peek(), 'for') && this.isIdentifier(this.peek(1), 'syntax')) {
          this.advance();
          this.advance();
          forSyntax = true;
        }

        return new _terms2.default('Import', {
          defaultBinding: defaultBinding, moduleSpecifier: moduleSpecifier,
          namedImports: (0, _immutable.List)(),
          forSyntax: forSyntax
        });
      }
    }
    this.consumeComma();
    lookahead = this.peek();
    if (this.isBraces(lookahead)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (this.isKeyword(this.peek(), 'for') && this.isIdentifier(this.peek(1), 'syntax')) {
        this.advance();
        this.advance();
        forSyntax = true;
      }

      return new _terms2.default("Import", {
        defaultBinding: defaultBinding,
        forSyntax: forSyntax,
        namedImports: imports,
        moduleSpecifier: fromClause

      });
    } else if (this.isPunctuator(lookahead, '*')) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (this.isKeyword(this.peek(), 'for') && this.isIdentifier(this.peek(1), 'syntax')) {
        this.advance();
        this.advance();
        forSyntax = true;
      }
      return new _terms2.default('ImportNamespace', {
        defaultBinding: defaultBinding, forSyntax: forSyntax, namespaceBinding: namespaceBinding, moduleSpecifier: moduleSpecifier
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
    let enf = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result = [];
    while (enf.rest.size !== 0) {
      result.push(enf.enforestImportSpecifiers());
      enf.consumeComma();
    }
    return (0, _immutable.List)(result);
  }

  enforestImportSpecifiers() {
    let lookahead = this.peek();
    let name;
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
      name = this.advance();
      if (!this.isIdentifier(this.peek(), 'as')) {
        return new _terms2.default('ImportSpecifier', {
          name: null,
          binding: new _terms2.default('BindingIdentifier', {
            name: name
          })
        });
      } else {
        this.matchIdentifier('as');
      }
    } else {
      throw this.createError(lookahead, 'unexpected token in import specifier');
    }
    return new _terms2.default('ImportSpecifier', {
      name: name, binding: this.enforestBindingIdentifier()
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
    } else if (this.isKeyword(lookahead, 'class')) {
      return this.enforestClass({ isExpr: false });
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

    if (this.term === null && this.isTerm(lookahead)) {
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
    if (this.term === null && this.isKeyword(lookahead, "class")) {
      return this.enforestClass({ isExpr: false });
    }

    if (this.term === null && this.isFnDeclTransform(lookahead)) {
      return this.enforestFunctionDeclaration();
    }

    if (this.term === null && this.isIdentifier(lookahead) && this.isPunctuator(this.peek(1), ':')) {
      return this.enforestLabeledStatement();
    }

    if (this.term === null && (this.isVarDeclTransform(lookahead) || this.isLetDeclTransform(lookahead) || this.isConstDeclTransform(lookahead) || this.isSyntaxrecDeclTransform(lookahead) || this.isSyntaxDeclTransform(lookahead))) {
      let stmt = new _terms2.default('VariableDeclarationStatement', {
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
      return new _terms2.default("EmptyStatement", {});
    }

    return this.enforestExpressionStatement();
  }

  enforestLabeledStatement() {
    let label = this.matchIdentifier();
    this.matchPunctuator(':');
    let stmt = this.enforestStatement();

    return new _terms2.default('LabeledStatement', {
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
      return new _terms2.default('BreakStatement', { label: label });
    }
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'yield') || this.isKeyword(lookahead, 'let')) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new _terms2.default('BreakStatement', { label: label });
  }

  enforestTryStatement() {
    this.matchKeyword('try');
    let body = this.enforestBlock();
    if (this.isKeyword(this.peek(), 'catch')) {
      let catchClause = this.enforestCatchClause();
      if (this.isKeyword(this.peek(), 'finally')) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new _terms2.default('TryFinallyStatement', {
          body: body, catchClause: catchClause, finalizer: finalizer
        });
      }
      return new _terms2.default('TryCatchStatement', { body: body, catchClause: catchClause });
    }
    if (this.isKeyword(this.peek(), 'finally')) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new _terms2.default('TryFinallyStatement', { body: body, catchClause: null, finalizer: finalizer });
    }
    throw this.createError(this.peek(), 'try with no catch or finally');
  }

  enforestCatchClause() {
    this.matchKeyword('catch');
    let bindingParens = this.matchParens();
    let enf = new Enforester(bindingParens, (0, _immutable.List)(), this.context);
    let binding = enf.enforestBindingTarget();
    let body = this.enforestBlock();
    return new _terms2.default('CatchClause', { binding: binding, body: body });
  }

  enforestThrowStatement() {
    this.matchKeyword('throw');
    let expression = this.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default('ThrowStatement', { expression: expression });
  }

  enforestWithStatement() {
    this.matchKeyword('with');
    let objParens = this.matchParens();
    let enf = new Enforester(objParens, (0, _immutable.List)(), this.context);
    let object = enf.enforestExpression();
    let body = this.enforestStatement();
    return new _terms2.default('WithStatement', { object: object, body: body });
  }

  enforestDebuggerStatement() {
    this.matchKeyword('debugger');

    return new _terms2.default('DebuggerStatement', {});
  }

  enforestDoStatement() {
    this.matchKeyword('do');
    let body = this.enforestStatement();
    this.matchKeyword('while');
    let testBody = this.matchParens();
    let enf = new Enforester(testBody, (0, _immutable.List)(), this.context);
    let test = enf.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default('DoWhileStatement', { body: body, test: test });
  }

  enforestContinueStatement() {
    let kwd = this.matchKeyword('continue');
    let lookahead = this.peek();
    let label = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead, ';')) {
      this.consumeSemicolon();
      return new _terms2.default('ContinueStatement', { label: label });
    }
    if (this.lineNumberEq(kwd, lookahead) && (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'yield') || this.isKeyword(lookahead, 'let'))) {
      label = this.enforestIdentifier();
    }
    this.consumeSemicolon();

    return new _terms2.default('ContinueStatement', { label: label });
  }

  enforestSwitchStatement() {
    this.matchKeyword('switch');
    let cond = this.matchParens();
    let enf = new Enforester(cond, (0, _immutable.List)(), this.context);
    let discriminant = enf.enforestExpression();
    let body = this.matchCurlies();

    if (body.size === 0) {
      return new _terms2.default('SwitchStatement', {
        discriminant: discriminant,
        cases: (0, _immutable.List)()
      });
    }
    enf = new Enforester(body, (0, _immutable.List)(), this.context);
    let cases = enf.enforestSwitchCases();
    let lookahead = enf.peek();
    if (enf.isKeyword(lookahead, 'default')) {
      let defaultCase = enf.enforestSwitchDefault();
      let postDefaultCases = enf.enforestSwitchCases();
      return new _terms2.default('SwitchStatementWithDefault', {
        discriminant: discriminant,
        preDefaultCases: cases,
        defaultCase: defaultCase,
        postDefaultCases: postDefaultCases
      });
    }
    return new _terms2.default('SwitchStatement', { discriminant: discriminant, cases: cases });
  }

  enforestSwitchCases() {
    let cases = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default'))) {
      cases.push(this.enforestSwitchCase());
    }
    return (0, _immutable.List)(cases);
  }

  enforestSwitchCase() {
    this.matchKeyword('case');
    return new _terms2.default('SwitchCase', {
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
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default') || this.isKeyword(this.peek(), 'case'))) {
      result.push(this.enforestStatementListItem());
    }
    return (0, _immutable.List)(result);
  }

  enforestSwitchDefault() {
    this.matchKeyword('default');
    return new _terms2.default('SwitchDefault', {
      consequent: this.enforestSwitchCaseBody()
    });
  }

  enforestForStatement() {
    this.matchKeyword('for');
    let cond = this.matchParens();
    let enf = new Enforester(cond, (0, _immutable.List)(), this.context);
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
      return new _terms2.default('ForStatement', {
        init: null,
        test: test,
        update: right,
        body: this.enforestStatement()
      });
      // case where init is not null
    } else {
      // testing
      lookahead = enf.peek();
      if (enf.isVarDeclTransform(lookahead) || enf.isLetDeclTransform(lookahead) || enf.isConstDeclTransform(lookahead)) {
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
          return new _terms2.default(type, {
            left: init, right: right, body: this.enforestStatement()
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
          return new _terms2.default(type, {
            left: left, right: right, body: this.enforestStatement()
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
      return new _terms2.default('ForStatement', { init: init, test: test, update: update, body: this.enforestStatement() });
    }
  }

  enforestIfStatement() {
    this.matchKeyword('if');
    let cond = this.matchParens();
    let enf = new Enforester(cond, (0, _immutable.List)(), this.context);
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
    return new _terms2.default('IfStatement', { test: test, consequent: consequent, alternate: alternate });
  }

  enforestWhileStatement() {
    this.matchKeyword('while');
    let cond = this.matchParens();
    let enf = new Enforester(cond, (0, _immutable.List)(), this.context);
    let lookahead = enf.peek();
    let test = enf.enforestExpression();
    if (test === null) {
      throw enf.createError(lookahead, 'expecting an expression');
    }
    let body = this.enforestStatement();

    return new _terms2.default('WhileStatement', { test: test, body: body });
  }

  enforestBlockStatement() {
    return new _terms2.default('BlockStatement', {
      block: this.enforestBlock()
    });
  }

  enforestBlock() {
    return new _terms2.default('Block', {
      statements: this.matchCurlies()
    });
  }

  enforestClass(_ref) {
    let isExpr = _ref.isExpr;
    let inDefault = _ref.inDefault;

    let kw = this.advance();
    let name = null,
        supr = null;
    let type = isExpr ? 'ClassExpression' : 'ClassDeclaration';

    if (this.isIdentifier(this.peek())) {
      name = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name = new _terms2.default('BindingIdentifier', {
          name: _syntax2.default.fromIdentifier('_default', kw)
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
    let enf = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    while (enf.rest.size !== 0) {
      if (enf.isPunctuator(enf.peek(), ';')) {
        enf.advance();
        continue;
      }

      let isStatic = false;

      var _enf$enforestMethodDe = enf.enforestMethodDefinition();

      let methodOrKey = _enf$enforestMethodDe.methodOrKey;
      let kind = _enf$enforestMethodDe.kind;

      if (kind === 'identifier' && methodOrKey.value.val() === 'static') {
        isStatic = true;

        var _enf$enforestMethodDe2 = enf.enforestMethodDefinition();

        methodOrKey = _enf$enforestMethodDe2.methodOrKey;
        kind = _enf$enforestMethodDe2.kind;
      }
      if (kind === 'method') {
        elements.push(new _terms2.default('ClassElement', { isStatic: isStatic, method: methodOrKey }));
      } else {
        throw this.createError(enf.peek(), "Only methods are allowed in classes");
      }
    }

    return new _terms2.default(type, {
      name: name, super: supr,
      elements: (0, _immutable.List)(elements)
    });
  }

  enforestBindingTarget() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref2.allowPunctuator;

    let lookahead = this.peek();
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead) || allowPunctuator && this.isPunctuator(lookahead)) {
      return this.enforestBindingIdentifier({ allowPunctuator: allowPunctuator });
    } else if (this.isBrackets(lookahead)) {
      return this.enforestArrayBinding();
    } else if (this.isBraces(lookahead)) {
      return this.enforestObjectBinding();
    }
    (0, _errors.assert)(false, 'not implemented yet');
  }

  enforestObjectBinding() {
    let enf = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let properties = [];
    while (enf.rest.size !== 0) {
      properties.push(enf.enforestBindingProperty());
      enf.consumeComma();
    }

    return new _terms2.default('ObjectBinding', {
      properties: (0, _immutable.List)(properties)
    });
  }

  enforestBindingProperty() {
    let lookahead = this.peek();

    var _enforestPropertyName = this.enforestPropertyName();

    let name = _enforestPropertyName.name;
    let binding = _enforestPropertyName.binding;

    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'let') || this.isKeyword(lookahead, 'yield')) {
      if (!this.isPunctuator(this.peek(), ':')) {
        let defaultValue = null;
        if (this.isAssign(this.peek())) {
          this.advance();
          let expr = this.enforestExpressionLoop();
          defaultValue = expr;
        }
        return new _terms2.default('BindingPropertyIdentifier', {
          binding: binding, init: defaultValue
        });
      }
    }
    this.matchPunctuator(':');
    binding = this.enforestBindingElement();
    return new _terms2.default('BindingPropertyProperty', {
      name: name, binding: binding
    });
  }

  enforestArrayBinding() {
    let bracket = this.matchSquares();
    let enf = new Enforester(bracket, (0, _immutable.List)(), this.context);
    let elements = [],
        restElement = null;
    while (enf.rest.size !== 0) {
      let el;
      if (enf.isPunctuator(enf.peek(), ',')) {
        enf.consumeComma();
        el = null;
      } else {
        if (enf.isPunctuator(enf.peek(), '...')) {
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
    return new _terms2.default('ArrayBinding', {
      elements: (0, _immutable.List)(elements),
      restElement: restElement
    });
  }

  enforestBindingElement() {
    let binding = this.enforestBindingTarget();

    if (this.isAssign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding = new _terms2.default('BindingWithDefault', { binding: binding, init: init });
    }
    return binding;
  }

  enforestBindingIdentifier() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref3.allowPunctuator;

    let name;
    if (allowPunctuator && this.isPunctuator(this.peek())) {
      name = this.enforestPunctuator();
    } else {
      name = this.enforestIdentifier();
    }
    return new _terms2.default("BindingIdentifier", { name: name });
  }

  enforestPunctuator() {
    let lookahead = this.peek();
    if (this.isPunctuator(lookahead)) {
      return this.advance();
    }
    throw this.createError(lookahead, "expecting a punctuator");
  }

  enforestIdentifier() {
    let lookahead = this.peek();
    if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
      return this.advance();
    }
    throw this.createError(lookahead, "expecting an identifier");
  }

  enforestReturnStatement() {
    let kw = this.advance();
    let lookahead = this.peek();

    // short circuit for the empty expression case
    if (this.rest.size === 0 || lookahead && !this.lineNumberEq(kw, lookahead)) {
      return new _terms2.default("ReturnStatement", {
        expression: null
      });
    }

    let term = null;
    if (!this.isPunctuator(lookahead, ';')) {
      term = this.enforestExpression();
      (0, _errors.expect)(term != null, "Expecting an expression to follow return keyword", lookahead, this.rest);
    }

    this.consumeSemicolon();
    return new _terms2.default("ReturnStatement", {
      expression: term
    });
  }

  enforestVariableDeclaration() {
    let kind;
    let lookahead = this.advance();
    let kindSyn = lookahead;
    let phase = this.context.phase;

    if (kindSyn && this.context.env.get(kindSyn.resolve(phase)) === _transforms.VariableDeclTransform) {
      kind = "var";
    } else if (kindSyn && this.context.env.get(kindSyn.resolve(phase)) === _transforms.LetDeclTransform) {
      kind = "let";
    } else if (kindSyn && this.context.env.get(kindSyn.resolve(phase)) === _transforms.ConstDeclTransform) {
      kind = "const";
    } else if (kindSyn && this.context.env.get(kindSyn.resolve(phase)) === _transforms.SyntaxDeclTransform) {
      kind = "syntax";
    } else if (kindSyn && this.context.env.get(kindSyn.resolve(phase)) === _transforms.SyntaxrecDeclTransform) {
      kind = "syntaxrec";
    }

    let decls = (0, _immutable.List)();

    while (true) {
      let term = this.enforestVariableDeclarator({ isSyntax: kind === "syntax" || kind === 'syntaxrec' });
      let lookahead = this.peek();
      decls = decls.concat(term);

      if (this.isPunctuator(lookahead, ",")) {
        this.advance();
      } else {
        break;
      }
    }

    return new _terms2.default('VariableDeclaration', {
      kind: kind,
      declarators: decls
    });
  }

  enforestVariableDeclarator(_ref4) {
    let isSyntax = _ref4.isSyntax;

    let id = this.enforestBindingTarget({ allowPunctuator: isSyntax });
    let lookahead = this.peek();

    let init;
    if (this.isPunctuator(lookahead, '=')) {
      this.advance();
      let enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      init = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init = null;
    }
    return new _terms2.default("VariableDeclarator", {
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

    return new _terms2.default("ExpressionStatement", {
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
        left = new _terms2.default('BinaryExpression', { left: left, operator: operator, right: right });
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
      stack: (0, _immutable.List)()
    };

    do {
      let term = this.enforestAssignmentExpression();
      // no change means we've done as much enforesting as possible
      // if nothing changed, maybe we just need to pop the expr stack
      if (term === EXPR_LOOP_NO_CHANGE && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);

        var _opCtx$stack$last = this.opCtx.stack.last();

        let prec = _opCtx$stack$last.prec;
        let combine = _opCtx$stack$last.combine;

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
    } while (true); // get a fixpoint
    return this.term;
  }

  enforestAssignmentExpression() {
    let lookahead = this.peek();

    if (this.term === null && this.isCompiletimeTransform(lookahead)) {
      this.expandMacro();
      lookahead = this.peek();
    }

    if (this.term === null && this.isTerm(lookahead)) {
      // TODO: check that this is actually an expression
      return this.advance();
    }

    if (this.term === null && this.isKeyword(lookahead, 'yield')) {
      return this.enforestYieldExpression();
    }

    if (this.term === null && this.isKeyword(lookahead, 'class')) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && (this.isIdentifier(lookahead) || this.isParens(lookahead)) && this.isPunctuator(this.peek(1), '=>') && this.lineNumberEq(lookahead, this.peek(1))) {
      return this.enforestArrowExpression();
    }

    if (this.term === null && this.isSyntaxTemplate(lookahead)) {
      return this.enforestSyntaxTemplate();
    }
    // syntaxQuote ` ... `
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead)) {
      return this.enforestSyntaxQuote();
    }

    // ($x:expr)
    if (this.term === null && this.isParens(lookahead)) {
      return new _terms2.default("ParenthesizedExpression", {
        inner: this.advance().inner()
      });
    }

    if (this.term === null && (this.isKeyword(lookahead, "this") || this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'let') || this.isKeyword(lookahead, 'yield') || this.isNumericLiteral(lookahead) || this.isStringLiteral(lookahead) || this.isTemplate(lookahead) || this.isBooleanLiteral(lookahead) || this.isNullLiteral(lookahead) || this.isRegularExpression(lookahead) || this.isFnDeclTransform(lookahead) || this.isBraces(lookahead) || this.isBrackets(lookahead))) {
      return this.enforestPrimaryExpression();
    }

    // prefix unary
    if (this.term === null && this.isOperator(lookahead)) {
      return this.enforestUnaryExpression();
    }

    if (this.term === null && this.isVarBindingTransform(lookahead)) {
      let id = this.getFromCompiletimeEnvironment(lookahead).id;
      if (id !== lookahead) {
        this.advance();
        this.rest = _immutable.List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION;
      }
    }

    if (this.term === null && (this.isNewTransform(lookahead) || this.isKeyword(lookahead, 'super')) ||
    // and then check the cases where the term part of p is something...
    this.term && (
    // $x:expr . $prop:ident
    this.isPunctuator(lookahead, '.') && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1))) ||
    // $x:expr [ $b:expr ]
    this.isBrackets(lookahead) ||
    // $x:expr (...)
    this.isParens(lookahead))) {
      return this.enforestLeftHandSideExpression({ allowCall: true });
    }

    // $x:id `...`
    if (this.term && this.isTemplate(lookahead)) {
      return this.enforestTemplateLiteral();
    }

    // postfix unary
    if (this.term && this.isUpdateOperator(lookahead)) {
      return this.enforestUpdateExpression();
    }

    // $l:expr $op:binaryOperator $r:expr
    if (this.term && this.isOperator(lookahead)) {
      return this.enforestBinaryExpression();
    }

    // $x:expr = $init:expr
    if (this.term && this.isAssign(lookahead)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.advance();

      let enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      let init = enf.enforest("expression");
      this.rest = enf.rest;

      if (op.val() === '=') {
        return new _terms2.default('AssignmentExpression', {
          binding: binding,
          expression: init
        });
      } else {
        return new _terms2.default('CompoundAssignmentExpression', {
          binding: binding,
          operator: op.val(),
          expression: init
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
    if (this.term === null && this.isKeyword(lookahead, "this")) {
      return this.enforestThisExpression();
    }
    // $x:ident
    if (this.term === null && (this.isIdentifier(lookahead) || this.isKeyword(lookahead, 'let') || this.isKeyword(lookahead, 'yield'))) {
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
      return this.enforestFunctionExpression();
    }
    // { $p:prop (,) ... }
    if (this.term === null && this.isBraces(lookahead)) {
      return this.enforestObjectExpression();
    }
    // [$x:expr (,) ...]
    if (this.term === null && this.isBrackets(lookahead)) {
      return this.enforestArrayExpression();
    }
    (0, _errors.assert)(false, 'Not a primary expression');
  }

  enforestLeftHandSideExpression(_ref5) {
    let allowCall = _ref5.allowCall;

    let lookahead = this.peek();

    if (this.isKeyword(lookahead, 'super')) {
      this.advance();
      this.term = new _terms2.default('Super', {});
    } else if (this.isNewTransform(lookahead)) {
      this.term = this.enforestNewExpression();
    }

    while (true) {
      lookahead = this.peek();
      if (this.isParens(lookahead)) {
        if (!allowCall) {
          // we're dealing with a new expression
          if (this.term && ((0, _terms.isIdentifierExpression)(this.term) || (0, _terms.isStaticMemberExpression)(this.term) || (0, _terms.isComputedMemberExpression)(this.term))) {
            return this.term;
          }
          this.term = this.enforestExpressionLoop();
        } else {
          this.term = this.enforestCallExpression();
        }
      } else if (this.isBrackets(lookahead)) {
        this.term = this.term ? this.enforestComputedMemberExpression() : this.enforestPrimaryExpression();
      } else if (this.isPunctuator(lookahead, '.') && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        this.term = this.enforestStaticMemberExpression();
      } else if (this.isTemplate(lookahead)) {
        this.term = this.enforestTemplateLiteral();
      } else if (this.isBraces(lookahead)) {
        this.term = this.enforestPrimaryExpression();
      } else if (this.isIdentifier(lookahead)) {
        this.term = new _terms2.default('IdentifierExpression', { name: this.enforestIdentifier() });
      } else {
        break;
      }
    }
    return this.term;
  }

  enforestBooleanLiteral() {
    return new _terms2.default("LiteralBooleanExpression", {
      value: this.advance()
    });
  }

  enforestTemplateLiteral() {
    return new _terms2.default('TemplateExpression', {
      tag: this.term,
      elements: this.enforestTemplateElements()
    });
  }

  enforestStringLiteral() {
    return new _terms2.default("LiteralStringExpression", {
      value: this.advance()
    });
  }

  enforestNumericLiteral() {
    let num = this.advance();
    if (num.val() === 1 / 0) {
      return new _terms2.default('LiteralInfinityExpression', {});
    }
    return new _terms2.default("LiteralNumericExpression", {
      value: num
    });
  }

  enforestIdentifierExpression() {
    return new _terms2.default("IdentifierExpression", {
      name: this.advance()
    });
  }

  enforestRegularExpressionLiteral() {
    let reStx = this.advance();

    let lastSlash = reStx.token.value.lastIndexOf("/");
    let pattern = reStx.token.value.slice(1, lastSlash);
    let flags = reStx.token.value.slice(lastSlash + 1);
    return new _terms2.default("LiteralRegExpExpression", {
      pattern: pattern, flags: flags
    });
  }

  enforestNullLiteral() {
    this.advance();
    return new _terms2.default("LiteralNullExpression", {});
  }

  enforestThisExpression() {
    return new _terms2.default("ThisExpression", {
      stx: this.advance()
    });
  }

  enforestArgumentList() {
    let result = [];
    while (this.rest.size > 0) {
      let arg;
      if (this.isPunctuator(this.peek(), '...')) {
        this.advance();
        arg = new _terms2.default('SpreadElement', {
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
    return (0, _immutable.List)(result);
  }

  enforestNewExpression() {
    this.matchKeyword('new');
    if (this.isPunctuator(this.peek(), '.') && this.isIdentifier(this.peek(1), 'target')) {
      this.advance();
      this.advance();
      return new _terms2.default('NewTargetExpression', {});
    }

    let callee = this.enforestLeftHandSideExpression({ allowCall: false });
    let args;
    if (this.isParens(this.peek())) {
      args = this.matchParens();
    } else {
      args = (0, _immutable.List)();
    }
    return new _terms2.default('NewExpression', {
      callee: callee,
      arguments: args
    });
  }

  enforestComputedMemberExpression() {
    let enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default('ComputedMemberExpression', {
      object: this.term,
      expression: enf.enforestExpression()
    });
  }

  transformDestructuring(term) {
    switch (term.type) {
      case 'IdentifierExpression':
        return new _terms2.default('BindingIdentifier', { name: term.name });

      case 'ParenthesizedExpression':
        if (term.inner.size === 1 && this.isIdentifier(term.inner.get(0))) {
          return new _terms2.default('BindingIdentifier', { name: term.inner.get(0) });
        }
        return term;
      case 'DataProperty':
        return new _terms2.default('BindingPropertyProperty', {
          name: term.name,
          binding: this.transformDestructuringWithDefault(term.expression)
        });
      case 'ShorthandProperty':
        return new _terms2.default('BindingPropertyIdentifier', {
          binding: new _terms2.default('BindingIdentifier', { name: term.name }),
          init: null
        });
      case 'ObjectExpression':
        return new _terms2.default('ObjectBinding', {
          properties: term.properties.map(t => this.transformDestructuring(t))
        });
      case 'ArrayExpression':
        {
          let last = term.elements.last();
          if (last != null && last.type === 'SpreadElement') {
            return new _terms2.default('ArrayBinding', {
              elements: term.elements.slice(0, -1).map(t => t && this.transformDestructuringWithDefault(t)),
              restElement: this.transformDestructuringWithDefault(last.expression)
            });
          } else {
            return new _terms2.default('ArrayBinding', {
              elements: term.elements.map(t => t && this.transformDestructuringWithDefault(t)),
              restElement: null
            });
          }
        }
      case 'StaticPropertyName':
        return new _terms2.default('BindingIdentifier', {
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
    (0, _errors.assert)(false, 'not implemented yet for ' + term.type);
  }

  transformDestructuringWithDefault(term) {
    switch (term.type) {
      case "AssignmentExpression":
        return new _terms2.default('BindingWithDefault', {
          binding: this.transformDestructuring(term.binding),
          init: term.expression
        });
    }
    return this.transformDestructuring(term);
  }

  enforestCallExpression() {
    let paren = this.advance();
    return new _terms2.default("CallExpression", {
      callee: this.term,
      arguments: paren.inner()
    });
  }

  enforestArrowExpression() {
    let enf;
    if (this.isIdentifier(this.peek())) {
      enf = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf = new Enforester(p, (0, _immutable.List)(), this.context);
    }
    let params = enf.enforestFormalParameters();
    this.matchPunctuator('=>');

    let body;
    if (this.isBraces(this.peek())) {
      body = this.matchCurlies();
    } else {
      enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      body = enf.enforestExpressionLoop();
      this.rest = enf.rest;
    }
    return new _terms2.default('ArrowExpression', { params: params, body: body });
  }

  enforestYieldExpression() {
    let kwd = this.matchKeyword('yield');
    let lookahead = this.peek();

    if (this.rest.size === 0 || lookahead && !this.lineNumberEq(kwd, lookahead)) {
      return new _terms2.default('YieldExpression', {
        expression: null
      });
    } else {
      let isGenerator = false;
      if (this.isPunctuator(this.peek(), '*')) {
        isGenerator = true;
        this.advance();
      }
      let expr = this.enforestExpression();
      let type = isGenerator ? 'YieldGeneratorExpression' : 'YieldExpression';
      return new _terms2.default(type, {
        expression: expr
      });
    }
  }

  enforestSyntaxTemplate() {
    return new _terms2.default('SyntaxTemplate', {
      template: this.advance()
    });
  }

  enforestSyntaxQuote() {
    let name = this.advance();
    return new _terms2.default('SyntaxQuote', {
      name: name,
      template: new _terms2.default('TemplateExpression', {
        tag: new _terms2.default('IdentifierExpression', {
          name: name
        }),
        elements: this.enforestTemplateElements()
      })
    });
  }

  enforestStaticMemberExpression() {
    let object = this.term;
    this.advance();
    let property = this.advance();

    return new _terms2.default("StaticMemberExpression", {
      object: object,
      property: property
    });
  }

  enforestArrayExpression() {
    let arr = this.advance();

    let elements = [];

    let enf = new Enforester(arr.inner(), (0, _immutable.List)(), this.context);

    while (enf.rest.size > 0) {
      let lookahead = enf.peek();
      if (enf.isPunctuator(lookahead, ",")) {
        enf.advance();
        elements.push(null);
      } else if (enf.isPunctuator(lookahead, '...')) {
        enf.advance();
        let expression = enf.enforestExpressionLoop();
        if (expression == null) {
          throw enf.createError(lookahead, 'expecting expression');
        }
        elements.push(new _terms2.default('SpreadElement', { expression: expression }));
      } else {
        let term = enf.enforestExpressionLoop();
        if (term == null) {
          throw enf.createError(lookahead, "expected expression");
        }
        elements.push(term);
        enf.consumeComma();
      }
    }

    return new _terms2.default("ArrayExpression", {
      elements: (0, _immutable.List)(elements)
    });
  }

  enforestObjectExpression() {
    let obj = this.advance();

    let properties = (0, _immutable.List)();

    let enf = new Enforester(obj.inner(), (0, _immutable.List)(), this.context);

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

    return new _terms2.default("ObjectExpression", {
      properties: properties
    });
  }

  enforestPropertyDefinition() {
    var _enforestMethodDefini = this.enforestMethodDefinition();

    let methodOrKey = _enforestMethodDefini.methodOrKey;
    let kind = _enforestMethodDefini.kind;


    switch (kind) {
      case 'method':
        return methodOrKey;
      case 'identifier':
        if (this.isAssign(this.peek())) {
          this.advance();
          let init = this.enforestExpressionLoop();
          return new _terms2.default('BindingPropertyIdentifier', {
            init: init, binding: this.transformDestructuring(methodOrKey)
          });
        } else if (!this.isPunctuator(this.peek(), ':')) {
          return new _terms2.default('ShorthandProperty', {
            name: methodOrKey.value
          });
        }
    }

    this.matchPunctuator(':');
    let expr = this.enforestExpressionLoop();

    return new _terms2.default("DataProperty", {
      name: methodOrKey,
      expression: expr
    });
  }

  enforestMethodDefinition() {
    let lookahead = this.peek();
    let isGenerator = false;
    if (this.isPunctuator(lookahead, '*')) {
      isGenerator = true;
      this.advance();
    }

    if (this.isIdentifier(lookahead, 'get') && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return {
        methodOrKey: new _terms2.default('Getter', { name: name, body: body }),
        kind: 'method'
      };
    } else if (this.isIdentifier(lookahead, 'set') && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName3 = this.enforestPropertyName();

      let name = _enforestPropertyName3.name;

      let enf = new Enforester(this.matchParens(), (0, _immutable.List)(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return {
        methodOrKey: new _terms2.default('Setter', { name: name, param: param, body: body }),
        kind: 'method'
      };
    }

    var _enforestPropertyName4 = this.enforestPropertyName();

    let name = _enforestPropertyName4.name;

    if (this.isParens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester(params, (0, _immutable.List)(), this.context);
      let formalParams = enf.enforestFormalParameters();

      let body = this.matchCurlies();
      return {
        methodOrKey: new _terms2.default('Method', {
          isGenerator: isGenerator,
          name: name, params: formalParams, body: body
        }),
        kind: 'method'
      };
    }
    return {
      methodOrKey: name,
      kind: this.isIdentifier(lookahead) || this.isKeyword(lookahead) ? 'identifier' : 'property'
    };
  }

  enforestPropertyName() {
    let lookahead = this.peek();

    if (this.isStringLiteral(lookahead) || this.isNumericLiteral(lookahead)) {
      return {
        name: new _terms2.default('StaticPropertyName', {
          value: this.advance()
        }),
        binding: null
      };
    } else if (this.isBrackets(lookahead)) {
      let enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return {
        name: new _terms2.default('ComputedPropertyName', {
          expression: expr
        }),
        binding: null
      };
    }
    let name = this.advance();
    return {
      name: new _terms2.default('StaticPropertyName', { value: name }),
      binding: new _terms2.default('BindingIdentifier', { name: name })
    };
  }

  enforestFunction(_ref6) {
    let isExpr = _ref6.isExpr;
    let inDefault = _ref6.inDefault;

    let name = null,
        params,
        body;
    let isGenerator = false;
    // eat the function keyword
    let fnKeyword = this.advance();
    let lookahead = this.peek();
    let type = isExpr ? 'FunctionExpression' : 'FunctionDeclaration';

    if (this.isPunctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (!this.isParens(lookahead)) {
      name = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name = new _terms2.default('BindingIdentifier', {
        name: _syntax2.default.fromIdentifier('*default*', fnKeyword)
      });
    }

    params = this.matchParens();

    body = this.matchCurlies();

    let enf = new Enforester(params, (0, _immutable.List)(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new _terms2.default(type, {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFunctionExpression() {
    let name = null,
        params,
        body;
    let isGenerator = false;
    // eat the function keyword
    this.advance();
    let lookahead = this.peek();

    if (this.isPunctuator(lookahead, "*")) {
      isGenerator = true;
      this.advance();
      lookahead = this.peek();
    }

    if (!this.isParens(lookahead)) {
      name = this.enforestBindingIdentifier();
    }

    params = this.matchParens();
    body = this.matchCurlies();

    let enf = new Enforester(params, (0, _immutable.List)(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new _terms2.default("FunctionExpression", {
      name: name,
      isGenerator: isGenerator,
      params: formalParams,
      body: body
    });
  }

  enforestFunctionDeclaration() {
    let name, params, body;
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

    let enf = new Enforester(params, (0, _immutable.List)(), this.context);
    let formalParams = enf.enforestFormalParameters();

    return new _terms2.default("FunctionDeclaration", {
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
      if (this.isPunctuator(lookahead, '...')) {
        this.matchPunctuator('...');
        rest = this.enforestBindingIdentifier();
        break;
      }
      items.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", {
      items: (0, _immutable.List)(items), rest: rest
    });
  }

  enforestParam() {
    return this.enforestBindingElement();
  }

  enforestUpdateExpression() {
    let operator = this.matchUnaryOperator();

    return new _terms2.default('UpdateExpression', {
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
      if (operator.val() === '++' || operator.val() === '--') {
        return new _terms2.default('UpdateExpression', {
          operator: operator.val(),
          operand: this.transformDestructuring(rightTerm),
          isPrefix: true
        });
      } else {
        return new _terms2.default('UnaryExpression', {
          operator: operator.val(),
          operand: rightTerm
        });
      }
    };
    return EXPR_LOOP_OPERATOR;
  }

  enforestConditionalExpression() {
    // first, pop the operator stack
    let test = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }

    this.matchPunctuator('?');
    let enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
    let consequent = enf.enforestExpressionLoop();
    enf.matchPunctuator(':');
    enf = new Enforester(enf.rest, (0, _immutable.List)(), this.context);
    let alternate = enf.enforestExpressionLoop();
    this.rest = enf.rest;
    return new _terms2.default('ConditionalExpression', {
      test: test, consequent: consequent, alternate: alternate
    });
  }

  enforestBinaryExpression() {

    let leftTerm = this.term;
    let opStx = this.peek();
    let op = opStx.val();
    let opPrec = (0, _operators.getOperatorPrec)(op);
    let opAssoc = (0, _operators.getOperatorAssoc)(op);

    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec, opAssoc)) {
      this.opCtx.stack = this.opCtx.stack.push({
        prec: this.opCtx.prec,
        combine: this.opCtx.combine
      });
      this.opCtx.prec = opPrec;
      this.opCtx.combine = rightTerm => {
        return new _terms2.default("BinaryExpression", {
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

      var _opCtx$stack$last3 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last3.prec;
      let combine = _opCtx$stack$last3.combine;

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
        let enf = new Enforester(it.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default('TemplateElement', {
        rawValue: it.slice.text
      });
    });
    return elements;
  }

  expandMacro() {
    let lookahead = this.peek();
    while (this.isCompiletimeTransform(lookahead)) {
      let name = this.advance();

      let syntaxTransform = this.getFromCompiletimeEnvironment(name);
      if (syntaxTransform == null || typeof syntaxTransform.value !== "function") {
        throw this.createError(name, "the macro name was not bound to a value that could be invoked");
      }
      let useSiteScope = (0, _scope.freshScope)("u");
      let introducedScope = (0, _scope.freshScope)("i");
      // TODO: needs to be a list of scopes I think
      this.context.useScope = useSiteScope;

      let ctx = new _macroContext2.default(this, name, this.context, useSiteScope, introducedScope);

      let result = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform.value.call(null, ctx));
      if (!_immutable.List.isList(result)) {
        throw this.createError(name, "macro must return a list but got: " + result);
      }
      result = result.map(stx => {
        if (!(stx && typeof stx.addScope === 'function')) {
          throw this.createError(name, 'macro must return syntax objects or terms but got: ' + stx);
        }
        return stx.addScope(introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
      });

      this.rest = result.concat(ctx._rest(this));
      lookahead = this.peek();
    }
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

  safeCheck(obj, type) {
    let val = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return obj && (typeof obj.match === 'function' ? obj.match(type, val) : false);
  }

  isTerm(term) {
    return term && term instanceof _terms2.default;
  }

  isEOF(obj) {
    return this.safeCheck(obj, 'eof');
  }

  isIdentifier(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'identifier', val);
  }

  isPropertyName(obj) {
    return this.isIdentifier(obj) || this.isKeyword(obj) || this.isNumericLiteral(obj) || this.isStringLiteral(obj) || this.isBrackets(obj);
  }

  isNumericLiteral(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'number', val);
  }

  isStringLiteral(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'string', val);
  }

  isTemplate(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'template', val);
  }

  isSyntaxTemplate(obj) {
    return this.safeCheck(obj, 'syntaxTemplate');
  }

  isBooleanLiteral(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'boolean', val);
  }

  isNullLiteral(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'null', val);
  }

  isRegularExpression(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'regularExpression', val);
  }

  isDelimiter(obj) {
    return this.safeCheck(obj, 'delimiter');
  }

  isParens(obj) {
    return this.safeCheck(obj, 'parens');
  }

  isBraces(obj) {
    return this.safeCheck(obj, 'braces');
  }

  isBrackets(obj) {
    return this.safeCheck(obj, 'brackets');
  }

  isAssign(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'assign', val);
  }

  isKeyword(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'keyword', val);
  }

  isPunctuator(obj) {
    let val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj, 'punctuator', val);
  }

  isOperator(obj) {
    return (this.safeCheck(obj, 'punctuator') || this.safeCheck(obj, 'identifier') || this.safeCheck(obj, 'keyword')) && (0, _operators.isOperator)(obj);
  }

  isUpdateOperator(obj) {
    return this.safeCheck(obj, 'punctuator', '++') || this.safeCheck(obj, 'punctuator', '--');
  }

  safeResolve(obj, phase) {
    return obj && typeof obj.resolve === 'function' ? Just(obj.resolve(phase)) : Nothing();
  }

  isTransform(obj, trans) {
    return this.safeResolve(obj, this.context.phase).map(name => this.context.env.get(name) === trans || this.context.store.get(name) === trans).getOrElse(false);
  }

  isTransformInstance(obj, trans) {
    return this.safeResolve(obj, this.context.phase).map(name => this.context.env.get(name) instanceof trans || this.context.store.get(name) instanceof trans).getOrElse(false);
  }

  isFnDeclTransform(obj) {
    return this.isTransform(obj, _transforms.FunctionDeclTransform);
  }

  isVarDeclTransform(obj) {
    return this.isTransform(obj, _transforms.VariableDeclTransform);
  }

  isLetDeclTransform(obj) {
    return this.isTransform(obj, _transforms.LetDeclTransform);
  }

  isConstDeclTransform(obj) {
    return this.isTransform(obj, _transforms.ConstDeclTransform);
  }

  isSyntaxDeclTransform(obj) {
    return this.isTransform(obj, _transforms.SyntaxDeclTransform);
  }

  isSyntaxrecDeclTransform(obj) {
    return this.isTransform(obj, _transforms.SyntaxrecDeclTransform);
  }

  isSyntaxQuoteTransform(obj) {
    return this.isTransform(obj, _transforms.SyntaxQuoteTransform);
  }

  isReturnStmtTransform(obj) {
    return this.isTransform(obj, _transforms.ReturnStatementTransform);
  }

  isWhileTransform(obj) {
    return this.isTransform(obj, _transforms.WhileTransform);
  }

  isForTransform(obj) {
    return this.isTransform(obj, _transforms.ForTransform);
  }

  isSwitchTransform(obj) {
    return this.isTransform(obj, _transforms.SwitchTransform);
  }

  isBreakTransform(obj) {
    return this.isTransform(obj, _transforms.BreakTransform);
  }

  isContinueTransform(obj) {
    return this.isTransform(obj, _transforms.ContinueTransform);
  }

  isDoTransform(obj) {
    return this.isTransform(obj, _transforms.DoTransform);
  }

  isDebuggerTransform(obj) {
    return this.isTransform(obj, _transforms.DebuggerTransform);
  }

  isWithTransform(obj) {
    return this.isTransform(obj, _transforms.WithTransform);
  }

  isTryTransform(obj) {
    return this.isTransform(obj, _transforms.TryTransform);
  }

  isThrowTransform(obj) {
    return this.isTransform(obj, _transforms.ThrowTransform);
  }

  isIfTransform(obj) {
    return this.isTransform(obj, _transforms.IfTransform);
  }

  isNewTransform(obj) {
    return this.isTransform(obj, _transforms.NewTransform);
  }

  isCompiletimeTransform(obj) {
    return this.isTransformInstance(obj, _transforms.CompiletimeTransform);
  }

  isVarBindingTransform(obj) {
    return this.isTransformInstance(obj, _transforms.VarBindingTransform);
  }

  getFromCompiletimeEnvironment(term) {
    if (this.context.env.has(term.resolve(this.context.phase))) {
      return this.context.env.get(term.resolve(this.context.phase));
    }
    return this.context.store.get(term.resolve(this.context.phase));
  }

  lineNumberEq(a, b) {
    if (!(a && b)) {
      return false;
    }
    return a.lineNumber() === b.lineNumber();
  }

  matchIdentifier(val) {
    let lookahead = this.advance();
    if (this.isIdentifier(lookahead, val)) {
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
    if (this.isNumericLiteral(lookahead) || this.isStringLiteral(lookahead) || this.isBooleanLiteral(lookahead) || this.isNullLiteral(lookahead) || this.isTemplate(lookahead) || this.isRegularExpression(lookahead)) {
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
    if (this.isParens(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting parens");
  }

  matchCurlies() {
    let lookahead = this.advance();
    if (this.isBraces(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting curly braces");
  }
  matchSquares() {
    let lookahead = this.advance();
    if (this.isBrackets(lookahead)) {
      return lookahead.inner();
    }
    throw this.createError(lookahead, "expecting sqaure braces");
  }

  matchUnaryOperator() {
    let lookahead = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead)) {
      return lookahead;
    }
    throw this.createError(lookahead, "expecting a unary operator");
  }

  matchPunctuator(val) {
    let lookahead = this.advance();
    if (this.isPunctuator(lookahead)) {
      if (typeof val !== 'undefined') {
        if (lookahead.val() === val) {
          return lookahead;
        } else {
          throw this.createError(lookahead, "expecting a " + val + " punctuator");
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
        if (this.isDelimiter(term)) {
          return term.inner();
        }
        return _immutable.List.of(term);
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
exports.Enforester = Enforester;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lbmZvcmVzdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUlBOztBQXdCQTs7QUFDQTs7QUFDQTs7QUFPQTs7OztBQUVBOztBQUNBOztBQUVBOzs7Ozs7QUF6Q0EsTUFBTSxPQUFPLG9CQUFNLElBQW5CO0FBQ0EsTUFBTSxVQUFVLG9CQUFNLE9BQXRCOztBQTBDQSxNQUFNLHFCQUFxQixFQUEzQjtBQUNBLE1BQU0sc0JBQXNCLEVBQTVCO0FBQ0EsTUFBTSxzQkFBc0IsRUFBNUI7O0FBRU8sTUFBTSxVQUFOLENBQWlCO0FBQ3RCLGNBQVksSUFBWixFQUFrQixJQUFsQixFQUF3QixPQUF4QixFQUFpQztBQUMvQixTQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0Esd0JBQU8sZ0JBQUssTUFBTCxDQUFZLElBQVosQ0FBUCxFQUEwQix1Q0FBMUI7QUFDQSx3QkFBTyxnQkFBSyxNQUFMLENBQVksSUFBWixDQUFQLEVBQTBCLHVDQUExQjtBQUNBLHdCQUFPLE9BQVAsRUFBZ0IsaUNBQWhCO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjs7QUFFQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjs7QUFFQSxTQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0Q7O0FBRUQsU0FBWTtBQUFBLFFBQVAsQ0FBTyx5REFBSCxDQUFHOztBQUNWLFdBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLENBQWQsQ0FBUDtBQUNEOztBQUVELFlBQVU7QUFDUixRQUFJLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBVixFQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLENBQVUsSUFBVixFQUFaO0FBQ0EsV0FBTyxHQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztBQU1BLGFBQTBCO0FBQUEsUUFBakIsSUFBaUIseURBQVYsUUFBVTs7QUFDeEI7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaOztBQUVBLFFB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SUFBTCxDQUFVLElBQVYsR0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsWUFBTSxLQUFLLElBQUwsQ0FBVSxLQUFWLENBQWdCLENBQWhCLEVBQW1CLEVBQW5CLEVBQXVCLEdBQXZCLENBQTJCLFFBQVE7QUFDdkMsWUFBSSxLQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBSixFQUE0QjtBQUMxQixpQkFBTyxLQUFLLEtBQUwsRUFBUDtBQUNEO0FBQ0QsZUFBTyxnQkFBSyxFQUFMLENBQVEsSUFBUixDQUFQO0FBQ0QsT0FMSyxFQUtILE9BTEcsR0FLTyxHQUxQLENBS1csS0FBSztBQUNwQixZQUFJLE1BQU0sU0FBVixFQUFxQjtBQUNuQixpQkFBTyxPQUFPLEVBQUUsR0FBRixFQUFQLEdBQWlCLElBQXhCO0FBQ0Q7QUFDRCxlQUFPLEVBQUUsR0FBRixFQUFQO0FBQ0QsT0FWSyxFQVVILElBVkcsQ0FVRSxHQVZGLENBQU47QUFXRCxLQVpELE1BWU87QUFDTCxZQUFNLFVBQVUsUUFBVixFQUFOO0FBQ0Q7QUFDRCxXQUFPLElBQUksS0FBSixDQUFVLFVBQVUsSUFBVixHQUFpQixHQUEzQixDQUFQO0FBRUQ7QUFqckVxQjtRQUFYLFUsR0FBQSxVIiwiZmlsZSI6ImVuZm9yZXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSwgeyBpc0lkZW50aWZpZXJFeHByZXNzaW9uLCBpc1N0YXRpY01lbWJlckV4cHJlc3Npb24sIGlzQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uIH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7IE1heWJlIH0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmNvbnN0IEp1c3QgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZyA9IE1heWJlLk5vdGhpbmc7XG5cbmltcG9ydCB7XG4gIEZ1bmN0aW9uRGVjbFRyYW5zZm9ybSxcbiAgVmFyaWFibGVEZWNsVHJhbnNmb3JtLFxuICBOZXdUcmFuc2Zvcm0sXG4gIExldERlY2xUcmFuc2Zvcm0sXG4gIENvbnN0RGVjbFRyYW5zZm9ybSxcbiAgU3ludGF4RGVjbFRyYW5zZm9ybSxcbiAgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSxcbiAgU3ludGF4UXVvdGVUcmFuc2Zvcm0sXG4gIFJldHVyblN0YXRlbWVudFRyYW5zZm9ybSxcbiAgV2hpbGVUcmFuc2Zvcm0sXG4gIElmVHJhbnNmb3JtLFxuICBGb3JUcmFuc2Zvcm0sXG4gIFN3aXRjaFRyYW5zZm9ybSxcbiAgQnJlYWtUcmFuc2Zvcm0sXG4gIENvbnRpbnVlVHJhbnNmb3JtLFxuICBEb1RyYW5zZm9ybSxcbiAgRGVidWdnZXJUcmFuc2Zvcm0sXG4gIFdpdGhUcmFuc2Zvcm0sXG4gIFRyeVRyYW5zZm9ybSxcbiAgVGhyb3dUcmFuc2Zvcm0sXG4gIENvbXBpbGV0aW1lVHJhbnNmb3JtLFxuICBWYXJCaW5kaW5nVHJhbnNmb3JtXG59IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7IExpc3QgfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQgeyBleHBlY3QsIGFzc2VydCB9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtcbiAgaXNPcGVyYXRvcixcbiAgaXNVbmFyeU9wZXJhdG9yLFxuICBnZXRPcGVyYXRvckFzc29jLFxuICBnZXRPcGVyYXRvclByZWMsXG4gIG9wZXJhdG9yTHRcbn0gZnJvbSBcIi4vb3BlcmF0b3JzXCI7XG5pbXBvcnQgU3ludGF4LCB7IEFMTF9QSEFTRVMgfSBmcm9tIFwiLi9zeW50YXhcIjtcblxuaW1wb3J0IHsgZnJlc2hTY29wZSB9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQgeyBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzIH0gZnJvbSAnLi9sb2FkLXN5bnRheCc7XG5cbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuXG5jb25zdCBFWFBSX0xPT1BfT1BFUkFUT1IgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9OT19DSEFOR0UgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9FWFBBTlNJT04gPSB7fTtcblxuZXhwb3J0IGNsYXNzIEVuZm9yZXN0ZXIge1xuICBjb25zdHJ1Y3RvcihzdHhsLCBwcmV2LCBjb250ZXh0KSB7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHN0eGwpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHByZXYpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KGNvbnRleHQsIFwiZXhwZWN0aW5nIGEgY29udGV4dCB0byBlbmZvcmVzdFwiKTtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuXG4gICAgdGhpcy5yZXN0ID0gc3R4bDtcbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuXG4gIHBlZWsobiA9IDApIHtcbiAgICByZXR1cm4gdGhpcy5yZXN0LmdldChuKTtcbiAgfVxuXG4gIGFkdmFuY2UoKSB7XG4gICAgbGV0IHJldCA9IHRoaXMucmVzdC5maXJzdCgpO1xuICAgIHRoaXMucmVzdCA9IHRoaXMucmVzdC5yZXN0KCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qXG4gICBlbmZvcmVzdCB3b3JrcyBvdmVyOlxuICAgcHJldiAtIGEgbGlzdCBvZiB0aGUgcHJldmlvdXNseSBlbmZvcmVzdCBUZXJtc1xuICAgdGVybSAtIHRoZSBjdXJyZW50IHRlcm0gYmVpbmcgZW5mb3Jlc3RlZCAoaW5pdGlhbGx5IG51bGwpXG4gICByZXN0IC0gcmVtYWluaW5nIFRlcm1zIHRvIGVuZm9yZXN0XG4gICAqL1xuICBlbmZvcmVzdCh0eXBlID0gXCJNb2R1bGVcIikge1xuICAgIC8vIGluaXRpYWxpemUgdGhlIHRlcm1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuXG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmICh0eXBlID09PSBcImV4cHJlc3Npb25cIikge1xuICAgICAgcmVzdWx0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZW5mb3Jlc3RNb2R1bGUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuXG4gIGVuZm9yZXN0Qm9keSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE1vZHVsZUl0ZW0oKTtcbiAgfVxuXG4gIGVuZm9yZXN0TW9kdWxlSXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ2ltcG9ydCcpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SW1wb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ2V4cG9ydCcpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCwgJyMnKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMYW5ndWFnZVByYWdtYSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICB9XG5cbiAgZW5mb3Jlc3RMYW5ndWFnZVByYWdtYSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcignIycpO1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKCdsYW5nJyk7XG4gICAgbGV0IHBhdGggPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybSgnUHJhZ21hJywge1xuICAgICAga2luZDogJ2xhbmcnLFxuICAgICAgaXRlbXM6IExpc3Qub2YocGF0aClcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICcqJykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oJ0V4cG9ydEFsbEZyb20nLCB7IG1vZHVsZVNwZWNpZmllciB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkKSkge1xuICAgICAgbGV0IG5hbWVkRXhwb3J0cyA9IHRoaXMuZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCAnZnJvbScpKSB7XG4gICAgICAgIG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oJ0V4cG9ydEZyb20nLCB7IG5hbWVkRXhwb3J0cywgbW9kdWxlU3BlY2lmaWVyIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCAnY2xhc3MnKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnQnLCB7XG4gICAgICAgIGRlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0Q2xhc3MoeyBpc0V4cHI6IGZhbHNlIH0pXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnQnLCB7XG4gICAgICAgIGRlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogZmFsc2V9KVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdkZWZhdWx0JykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0RGVmYXVsdCcsIHtcbiAgICAgICAgICBib2R5OiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2NsYXNzJykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnREZWZhdWx0Jywge1xuICAgICAgICAgIGJvZHk6IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgYm9keSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnREZWZhdWx0JywgeyBib2R5IH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICB0aGlzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWQpIHx8XG4gICAgICAgIHRoaXMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICB0aGlzLmlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybShsb29rYWhlYWQpIHx8XG4gICAgICAgIHRoaXMuaXNTeW50YXhEZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0Jywge1xuICAgICAgICBkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCAndW5leHBlY3RlZCBzeW50YXgnKTtcbiAgfVxuXG4gIGVuZm9yZXN0RXhwb3J0Q2xhdXNlKCkge1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIHdoaWxlIChlbmYucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHQucHVzaChlbmYuZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSk7XG4gICAgICBlbmYuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdCk7XG4gIH1cblxuICBlbmZvcmVzdEV4cG9ydFNwZWNpZmllcigpIHtcbiAgICBsZXQgbmFtZSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCAnYXMnKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZXhwb3J0ZWROYW1lID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0U3BlY2lmaWVyJywgeyBuYW1lLCBleHBvcnRlZE5hbWUgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0U3BlY2lmaWVyJywge1xuICAgICAgbmFtZTogbnVsbCxcbiAgICAgIGV4cG9ydGVkTmFtZTogbmFtZVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGRlZmF1bHRCaW5kaW5nID0gbnVsbDtcbiAgICBsZXQgbmFtZWRJbXBvcnRzID0gTGlzdCgpO1xuICAgIGxldCBmb3JTeW50YXggPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWQpKSB7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0Jywge1xuICAgICAgICBkZWZhdWx0QmluZGluZyxcbiAgICAgICAgbmFtZWRJbXBvcnRzLFxuICAgICAgICBtb2R1bGVTcGVjaWZpZXIsXG4gICAgICAgIGZvclN5bnRheFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkKSkge1xuICAgICAgZGVmYXVsdEJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksICcsJykpIHtcbiAgICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2ZvcicpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgJ3N5bnRheCcpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgZm9yU3ludGF4ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0Jywge1xuICAgICAgICAgIGRlZmF1bHRCaW5kaW5nLCBtb2R1bGVTcGVjaWZpZXIsXG4gICAgICAgICAgbmFtZWRJbXBvcnRzOiBMaXN0KCksXG4gICAgICAgICAgZm9yU3ludGF4XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZCkpIHtcbiAgICAgIGxldCBpbXBvcnRzID0gdGhpcy5lbmZvcmVzdE5hbWVkSW1wb3J0cygpO1xuICAgICAgbGV0IGZyb21DbGF1c2UgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCAnZm9yJykgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCAnc3ludGF4JykpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXggPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge1xuICAgICAgICBkZWZhdWx0QmluZGluZyxcbiAgICAgICAgZm9yU3ludGF4LFxuICAgICAgICBuYW1lZEltcG9ydHM6IGltcG9ydHMsXG4gICAgICAgIG1vZHVsZVNwZWNpZmllcjogZnJvbUNsYXVzZVxuXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJyonKSkge1xuICAgICAgbGV0IG5hbWVzcGFjZUJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksICdmb3InKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksICdzeW50YXgnKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oJ0ltcG9ydE5hbWVzcGFjZScsIHtcbiAgICAgICAgZGVmYXVsdEJpbmRpbmcsIGZvclN5bnRheCwgbmFtZXNwYWNlQmluZGluZywgbW9kdWxlU3BlY2lmaWVyXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWQsICd1bmV4cGVjdGVkIHN5bnRheCcpO1xuICB9XG5cbiAgZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCkge1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKCcqJyk7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoJ2FzJyk7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICB9XG5cbiAgZW5mb3Jlc3ROYW1lZEltcG9ydHMoKSB7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgd2hpbGUgKGVuZi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdC5wdXNoKGVuZi5lbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSk7XG4gICAgICBlbmYuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdCk7XG4gIH1cblxuICBlbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBuYW1lO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCkpIHtcbiAgICAgIG5hbWUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksICdhcycpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0U3BlY2lmaWVyJywge1xuICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgYmluZGluZzogbmV3IFRlcm0oJ0JpbmRpbmdJZGVudGlmaWVyJywge1xuICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaElkZW50aWZpZXIoJ2FzJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCAndW5leHBlY3RlZCB0b2tlbiBpbiBpbXBvcnQgc3BlY2lmaWVyJyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0U3BlY2lmaWVyJywge1xuICAgICAgbmFtZSwgYmluZGluZzogdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKClcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0RnJvbUNsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcignZnJvbScpO1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBsb29rYWhlYWQ7XG4gIH1cblxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbih7IGlzRXhwcjogZmFsc2UgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdjbGFzcycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHsgaXNFeHByOiBmYWxzZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBlbmZvcmVzdFN0YXRlbWVudCgpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZXJtKGxvb2thaGVhZCkpIHtcbiAgICAgIC8vIFRPRE86IGNoZWNrIHRoYXQgdGhpcyBpcyBhY3R1YWxseSBhbiBzdGF0ZW1lbnRcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCbG9ja1N0YXRlbWVudCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZlRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdElmU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZvclRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZvclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTd2l0Y2hUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJlYWtUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb250aW51ZVRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RvVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RG9TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRGVidWdnZXJUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaXRoVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2l0aFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUcnlUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGhyb3dUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHB1dCBzb21ld2hlcmUgZWxzZVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkKSAmJlxuICAgICAgICB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksICc6JykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiZcbiAgICAgICAgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkgfHxcbiAgICAgICAgIHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkgfHxcbiAgICAgICAgIHRoaXMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICAgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICAgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oJ1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQnLCB7XG4gICAgICAgIGRlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpXG4gICAgICB9KTtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIHN0bXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRW1wdHlTdGF0ZW1lbnRcIiwge30pO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cblxuICBlbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxhYmVsID0gdGhpcy5tYXRjaElkZW50aWZpZXIoKTtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcignOicpO1xuICAgIGxldCBzdG10ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdMYWJlbGVkU3RhdGVtZW50Jywge1xuICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgYm9keTogc3RtdFxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZCgnYnJlYWsnKTtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCAnOycpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnQnJlYWtTdGF0ZW1lbnQnLCB7IGxhYmVsIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICd5aWVsZCcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ2xldCcpKSB7XG4gICAgICBsYWJlbCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdCcmVha1N0YXRlbWVudCcsIHsgbGFiZWwgfSk7XG4gIH1cblxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZCgndHJ5Jyk7XG4gICAgbGV0IGJvZHkgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksICdjYXRjaCcpKSB7XG4gICAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0aGlzLmVuZm9yZXN0Q2F0Y2hDbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2ZpbmFsbHknKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ1RyeUZpbmFsbHlTdGF0ZW1lbnQnLCB7XG4gICAgICAgICAgYm9keSwgY2F0Y2hDbGF1c2UsIGZpbmFsaXplclxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSgnVHJ5Q2F0Y2hTdGF0ZW1lbnQnLCB7IGJvZHksIGNhdGNoQ2xhdXNlIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksICdmaW5hbGx5JykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKCdUcnlGaW5hbGx5U3RhdGVtZW50JywgeyBib2R5LCBjYXRjaENsYXVzZTogbnVsbCwgZmluYWxpemVyIH0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCAndHJ5IHdpdGggbm8gY2F0Y2ggb3IgZmluYWxseScpO1xuICB9XG5cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZCgnY2F0Y2gnKTtcbiAgICBsZXQgYmluZGluZ1BhcmVucyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoYmluZGluZ1BhcmVucywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBiaW5kaW5nID0gZW5mLmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdDYXRjaENsYXVzZScsIHsgYmluZGluZywgYm9keSB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ3Rocm93Jyk7XG4gICAgbGV0IGV4cHJlc3Npb24gPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybSgnVGhyb3dTdGF0ZW1lbnQnLCB7IGV4cHJlc3Npb24gfSk7XG4gIH1cblxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ3dpdGgnKTtcbiAgICBsZXQgb2JqUGFyZW5zID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihvYmpQYXJlbnMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgb2JqZWN0ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybSgnV2l0aFN0YXRlbWVudCcsIHsgb2JqZWN0LCBib2R5IH0pO1xuICB9XG5cbiAgZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZCgnZGVidWdnZXInKTtcblxuICAgIHJldHVybiBuZXcgVGVybSgnRGVidWdnZXJTdGF0ZW1lbnQnLCB7fSk7XG4gIH1cblxuICBlbmZvcmVzdERvU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKCdkbycpO1xuICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKCd3aGlsZScpO1xuICAgIGxldCB0ZXN0Qm9keSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGVzdEJvZHksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0RvV2hpbGVTdGF0ZW1lbnQnLCB7IGJvZHksIHRlc3QgfSk7XG4gIH1cblxuICBlbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCkge1xuICAgIGxldCBrd2QgPSB0aGlzLm1hdGNoS2V5d29yZCgnY29udGludWUnKTtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCAnOycpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnQ29udGludWVTdGF0ZW1lbnQnLCB7IGxhYmVsIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkLCBsb29rYWhlYWQpICYmXG4gICAgICAgICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQpIHx8XG4gICAgICAgICB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICd5aWVsZCcpIHx8XG4gICAgICAgICB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdsZXQnKSkpIHtcbiAgICAgIGxhYmVsID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oJ0NvbnRpbnVlU3RhdGVtZW50JywgeyBsYWJlbCB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKCdzd2l0Y2gnKTtcbiAgICBsZXQgY29uZCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoY29uZCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBkaXNjcmltaW5hbnQgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuXG4gICAgaWYgKGJvZHkuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKCdTd2l0Y2hTdGF0ZW1lbnQnLCB7XG4gICAgICAgIGRpc2NyaW1pbmFudDogZGlzY3JpbWluYW50LFxuICAgICAgICBjYXNlczogTGlzdCgpXG4gICAgICB9KTtcbiAgICB9XG4gICAgZW5mID0gbmV3IEVuZm9yZXN0ZXIoYm9keSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjYXNlcyA9IGVuZi5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgbGV0IGxvb2thaGVhZCA9IGVuZi5wZWVrKCk7XG4gICAgaWYgKGVuZi5pc0tleXdvcmQobG9va2FoZWFkLCAnZGVmYXVsdCcpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmYuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZi5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oJ1N3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0Jywge1xuICAgICAgICBkaXNjcmltaW5hbnQsXG4gICAgICAgIHByZURlZmF1bHRDYXNlczogY2FzZXMsXG4gICAgICAgIGRlZmF1bHRDYXNlLFxuICAgICAgICBwb3N0RGVmYXVsdENhc2VzXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdTd2l0Y2hTdGF0ZW1lbnQnLCB7ICBkaXNjcmltaW5hbnQsIGNhc2VzIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlcygpIHtcbiAgICBsZXQgY2FzZXMgPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2RlZmF1bHQnKSkpIHtcbiAgICAgIGNhc2VzLnB1c2godGhpcy5lbmZvcmVzdFN3aXRjaENhc2UoKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KGNhc2VzKTtcbiAgfVxuXG4gIGVuZm9yZXN0U3dpdGNoQ2FzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZCgnY2FzZScpO1xuICAgIHJldHVybiBuZXcgVGVybSgnU3dpdGNoQ2FzZScsIHtcbiAgICAgIHRlc3Q6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCksXG4gICAgICBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcignOicpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuXG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIHdoaWxlKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksICdkZWZhdWx0JykgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksICdjYXNlJykpKSB7XG4gICAgICByZXN1bHQucHVzaCh0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdCk7XG4gIH1cblxuICBlbmZvcmVzdFN3aXRjaERlZmF1bHQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ2RlZmF1bHQnKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1N3aXRjaERlZmF1bHQnLCB7XG4gICAgICBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ2ZvcicpO1xuICAgIGxldCBjb25kID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcihjb25kLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZCwgdGVzdCwgaW5pdCwgcmlnaHQsIHR5cGUsIGxlZnQsIHVwZGF0ZTtcblxuICAgIC8vIGNhc2Ugd2hlcmUgaW5pdCBpcyBudWxsXG4gICAgaWYgKGVuZi5pc1B1bmN0dWF0b3IoZW5mLnBlZWsoKSwgJzsnKSkge1xuICAgICAgZW5mLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mLmlzUHVuY3R1YXRvcihlbmYucGVlaygpLCAnOycpKSB7XG4gICAgICAgIHRlc3QgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICBlbmYubWF0Y2hQdW5jdHVhdG9yKCc7Jyk7XG4gICAgICBpZiAoZW5mLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICByaWdodCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSgnRm9yU3RhdGVtZW50Jywge1xuICAgICAgICBpbml0OiBudWxsLFxuICAgICAgICB0ZXN0OiB0ZXN0LFxuICAgICAgICB1cGRhdGU6IHJpZ2h0LFxuICAgICAgICBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KClcbiAgICAgIH0pO1xuICAgIC8vIGNhc2Ugd2hlcmUgaW5pdCBpcyBub3QgbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0ZXN0aW5nXG4gICAgICBsb29rYWhlYWQgPSBlbmYucGVlaygpO1xuICAgICAgaWYgKGVuZi5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICAgIGVuZi5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICAgIGVuZi5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICAgIGluaXQgPSBlbmYuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgIGxvb2thaGVhZCA9IGVuZi5wZWVrKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdpbicpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCwgJ29mJykpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCAnaW4nKSkge1xuICAgICAgICAgICAgZW5mLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZSA9ICdGb3JJblN0YXRlbWVudCc7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQsICdvZicpKSB7XG4gICAgICAgICAgICBlbmYuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHQgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlID0gJ0Zvck9mU3RhdGVtZW50JztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGUsIHtcbiAgICAgICAgICAgIGxlZnQ6IGluaXQsIHJpZ2h0LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbmYubWF0Y2hQdW5jdHVhdG9yKCc7Jyk7XG4gICAgICAgIGlmIChlbmYuaXNQdW5jdHVhdG9yKGVuZi5wZWVrKCksICc7JykpIHtcbiAgICAgICAgICBlbmYuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3QgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3QgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mLm1hdGNoUHVuY3R1YXRvcignOycpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZSA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChlbmYucGVlaygxKSwgJ2luJykgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mLnBlZWsoMSksICdvZicpKSB7XG4gICAgICAgICAgbGVmdCA9IGVuZi5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgICAgbGV0IGtpbmQgPSBlbmYuYWR2YW5jZSgpO1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChraW5kLCAnaW4nKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdGb3JJblN0YXRlbWVudCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR5cGUgPSAnRm9yT2ZTdGF0ZW1lbnQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByaWdodCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge1xuICAgICAgICAgICAgbGVmdDogbGVmdCwgcmlnaHQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGluaXQgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGVuZi5tYXRjaFB1bmN0dWF0b3IoJzsnKTtcbiAgICAgICAgaWYgKGVuZi5pc1B1bmN0dWF0b3IoZW5mLnBlZWsoKSwgJzsnKSkge1xuICAgICAgICAgIGVuZi5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmYubWF0Y2hQdW5jdHVhdG9yKCc7Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKCdGb3JTdGF0ZW1lbnQnLCB7IGluaXQsIHRlc3QsIHVwZGF0ZSwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpIH0pO1xuICAgIH1cbiAgfVxuXG4gIGVuZm9yZXN0SWZTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ2lmJyk7XG4gICAgbGV0IGNvbmQgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKGNvbmQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkID0gZW5mLnBlZWsoKTtcbiAgICBsZXQgdGVzdCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgJ2V4cGVjdGluZyBhbiBleHByZXNzaW9uJyk7XG4gICAgfVxuICAgIGxldCBjb25zZXF1ZW50ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIGxldCBhbHRlcm5hdGUgPSBudWxsO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2Vsc2UnKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBhbHRlcm5hdGUgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSgnSWZTdGF0ZW1lbnQnLCB7IHRlc3QsIGNvbnNlcXVlbnQsIGFsdGVybmF0ZSB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ3doaWxlJyk7XG4gICAgbGV0IGNvbmQgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKGNvbmQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkID0gZW5mLnBlZWsoKTtcbiAgICBsZXQgdGVzdCA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgJ2V4cGVjdGluZyBhbiBleHByZXNzaW9uJyk7XG4gICAgfVxuICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdXaGlsZVN0YXRlbWVudCcsIHsgdGVzdCwgYm9keSB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdCbG9ja1N0YXRlbWVudCcsIHtcbiAgICAgIGJsb2NrOiB0aGlzLmVuZm9yZXN0QmxvY2soKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RCbG9jaygpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0Jsb2NrJywge1xuICAgICAgc3RhdGVtZW50czogdGhpcy5tYXRjaEN1cmxpZXMoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RDbGFzcyh7IGlzRXhwciwgaW5EZWZhdWx0IH0pIHtcbiAgICBsZXQga3cgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbmFtZSA9IG51bGwsIHN1cHIgPSBudWxsO1xuICAgIGxldCB0eXBlID0gaXNFeHByID8gJ0NsYXNzRXhwcmVzc2lvbicgOiAnQ2xhc3NEZWNsYXJhdGlvbic7XG5cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICghaXNFeHByKSB7XG4gICAgICBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICAgIG5hbWUgPSBuZXcgVGVybSgnQmluZGluZ0lkZW50aWZpZXInLCB7XG4gICAgICAgICAgbmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKCdfZGVmYXVsdCcsIGt3KVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksICd1bmV4cGVjdGVkIHN5bnRheCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgJ2V4dGVuZHMnKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBzdXByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuXG4gICAgbGV0IGVsZW1lbnRzID0gW107XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgaWYgKGVuZi5pc1B1bmN0dWF0b3IoZW5mLnBlZWsoKSwgJzsnKSkge1xuICAgICAgICBlbmYuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGlzU3RhdGljID0gZmFsc2U7XG4gICAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZi5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICAgIGlmIChraW5kID09PSAnaWRlbnRpZmllcicgJiYgbWV0aG9kT3JLZXkudmFsdWUudmFsKCkgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmYuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkpO1xuICAgICAgfVxuICAgICAgaWYgKGtpbmQgPT09ICdtZXRob2QnKSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2gobmV3IFRlcm0oJ0NsYXNzRWxlbWVudCcsIHtpc1N0YXRpYywgbWV0aG9kOiBtZXRob2RPcktleX0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IoZW5mLnBlZWsoKSwgXCJPbmx5IG1ldGhvZHMgYXJlIGFsbG93ZWQgaW4gY2xhc3Nlc1wiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge1xuICAgICAgbmFtZSwgc3VwZXI6IHN1cHIsXG4gICAgICBlbGVtZW50czogTGlzdChlbGVtZW50cylcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0QmluZGluZ1RhcmdldCh7IGFsbG93UHVuY3R1YXRvciB9ID0ge30pIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkKSB8fCAoYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKHsgYWxsb3dQdW5jdHVhdG9yIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0QmluZGluZygpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsICdub3QgaW1wbGVtZW50ZWQgeWV0Jyk7XG4gIH1cblxuICBlbmZvcmVzdE9iamVjdEJpbmRpbmcoKSB7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcHJvcGVydGllcyA9IFtdO1xuICAgIHdoaWxlIChlbmYucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goZW5mLmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVGVybSgnT2JqZWN0QmluZGluZycsIHtcbiAgICAgIHByb3BlcnRpZXM6IExpc3QocHJvcGVydGllcylcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQge25hbWUsIGJpbmRpbmd9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ2xldCcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ3lpZWxkJykpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksICc6JykpIHtcbiAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgICAgZGVmYXVsdFZhbHVlID0gZXhwcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXInLCB7XG4gICAgICAgICAgYmluZGluZywgaW5pdDogZGVmYXVsdFZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcignOicpO1xuICAgIGJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5Jywge1xuICAgICAgbmFtZSwgYmluZGluZ1xuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXQgPSB0aGlzLm1hdGNoU3F1YXJlcygpO1xuICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihicmFja2V0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzID0gW10sIHJlc3RFbGVtZW50ID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZi5pc1B1bmN0dWF0b3IoZW5mLnBlZWsoKSwgJywnKSkge1xuICAgICAgICBlbmYuY29uc3VtZUNvbW1hKCk7XG4gICAgICAgIGVsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChlbmYuaXNQdW5jdHVhdG9yKGVuZi5wZWVrKCksICcuLi4nKSkge1xuICAgICAgICAgIGVuZi5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdEVsZW1lbnQgPSBlbmYuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGVuZi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRzLnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oJ0FycmF5QmluZGluZycsIHtcbiAgICAgIGVsZW1lbnRzOiBMaXN0KGVsZW1lbnRzKSxcbiAgICAgIHJlc3RFbGVtZW50XG4gICAgfSk7XG4gIH1cblxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcblxuICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgYmluZGluZyA9IG5ldyBUZXJtKCdCaW5kaW5nV2l0aERlZmF1bHQnLCB7IGJpbmRpbmcsIGluaXQgfSk7XG4gICAgfVxuICAgIHJldHVybiBiaW5kaW5nO1xuICB9XG5cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7IGFsbG93UHVuY3R1YXRvciB9ID0ge30pIHtcbiAgICBsZXQgbmFtZTtcbiAgICBpZiAoYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpKSkge1xuICAgICAgbmFtZSA9IHRoaXMuZW5mb3Jlc3RQdW5jdHVhdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7IG5hbWUgfSk7XG4gIH1cblxuICBlbmZvcmVzdFB1bmN0dWF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cblxuICBlbmZvcmVzdElkZW50aWZpZXIoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cblxuXG4gIGVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCkge1xuICAgIGxldCBrdyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIC8vIHNob3J0IGNpcmN1aXQgZm9yIHRoZSBlbXB0eSBleHByZXNzaW9uIGNhc2VcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHxcbiAgICAgICAgKGxvb2thaGVhZCAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3csIGxvb2thaGVhZCkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge1xuICAgICAgICBleHByZXNzaW9uOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgdGVybSA9IG51bGw7XG4gICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICc7JykpIHtcbiAgICAgIHRlcm0gPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgZXhwZWN0KHRlcm0gIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkLCB0aGlzLnJlc3QpO1xuICAgIH1cblxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7XG4gICAgICBleHByZXNzaW9uOiB0ZXJtXG4gICAgfSk7XG4gIH1cblxuICBlbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGtpbmQ7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBraW5kU3luID0gbG9va2FoZWFkO1xuICAgIGxldCBwaGFzZSA9IHRoaXMuY29udGV4dC5waGFzZTtcblxuICAgIGlmIChraW5kU3luICYmXG4gICAgICAgIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW4ucmVzb2x2ZShwaGFzZSkpID09PSBWYXJpYWJsZURlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmQgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5biAmJlxuICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bi5yZXNvbHZlKHBoYXNlKSkgPT09IExldERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmQgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5biAmJlxuICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bi5yZXNvbHZlKHBoYXNlKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZCA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW4gJiZcbiAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW4ucmVzb2x2ZShwaGFzZSkpID09PSBTeW50YXhEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW4gJiZcbiAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW4ucmVzb2x2ZShwaGFzZSkpID09PSBTeW50YXhyZWNEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG5cbiAgICBsZXQgZGVjbHMgPSBMaXN0KCk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHsgaXNTeW50YXg6IGtpbmQgPT09IFwic3ludGF4XCIgfHwga2luZCA9PT0gJ3N5bnRheHJlYycgfSk7XG4gICAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgICBkZWNscyA9IGRlY2xzLmNvbmNhdCh0ZXJtKTtcblxuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdWYXJpYWJsZURlY2xhcmF0aW9uJywge1xuICAgICAga2luZDoga2luZCxcbiAgICAgIGRlY2xhcmF0b3JzOiBkZWNsc1xuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3IoeyBpc1N5bnRheCB9KSB7XG4gICAgbGV0IGlkID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoeyBhbGxvd1B1bmN0dWF0b3I6IGlzU3ludGF4IH0pO1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGxldCBpbml0O1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICc9JykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgaW5pdCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdCA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7XG4gICAgICBiaW5kaW5nOiBpZCxcbiAgICAgIGluaXQ6IGluaXRcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0RXhwcmVzc2lvblN0YXRlbWVudCgpIHtcbiAgICBsZXQgc3RhcnQgPSB0aGlzLnJlc3QuZ2V0KDApO1xuICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwciA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihzdGFydCwgXCJub3QgYSB2YWxpZCBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcblxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge1xuICAgICAgZXhwcmVzc2lvbjogZXhwclxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICcsJykpIHtcbiAgICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCAnLCcpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wZXJhdG9yID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGxldCByaWdodCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBsZWZ0ID0gbmV3IFRlcm0oJ0JpbmFyeUV4cHJlc3Npb24nLCB7bGVmdCwgb3BlcmF0b3IsIHJpZ2h0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgcmV0dXJuIGxlZnQ7XG4gIH1cblxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtcbiAgICAgIHByZWM6IDAsXG4gICAgICBjb21iaW5lOiAoeCkgPT4geCxcbiAgICAgIHN0YWNrOiBMaXN0KClcbiAgICB9O1xuXG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIC8vIG5vIGNoYW5nZSBtZWFucyB3ZSd2ZSBkb25lIGFzIG11Y2ggZW5mb3Jlc3RpbmcgYXMgcG9zc2libGVcbiAgICAgIC8vIGlmIG5vdGhpbmcgY2hhbmdlZCwgbWF5YmUgd2UganVzdCBuZWVkIHRvIHBvcCB0aGUgZXhwciBzdGFja1xuICAgICAgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0UgJiYgdGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX09QRVJBVE9SIHx8IHRlcm0gPT09IEVYUFJfTE9PUF9FWFBBTlNJT04pIHtcbiAgICAgICAgLy8gb3BlcmF0b3IgbWVhbnMgYW4gb3BDdHggd2FzIHB1c2hlZCBvbiB0aGUgc3RhY2tcbiAgICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRlcm07XG4gICAgICB9XG4gICAgfSB3aGlsZSAodHJ1ZSk7ICAvLyBnZXQgYSBmaXhwb2ludFxuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cblxuICBlbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkKSkge1xuICAgICAgLy8gVE9ETzogY2hlY2sgdGhhdCB0aGlzIGlzIGFjdHVhbGx5IGFuIGV4cHJlc3Npb25cbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ3lpZWxkJykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdjbGFzcycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJlxuICAgICAgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkgfHwgdGhpcy5pc1BhcmVucyhsb29rYWhlYWQpKSAmJlxuICAgICAgIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgJz0+JykgJiZcbiAgICAgICB0aGlzLmxpbmVOdW1iZXJFcShsb29rYWhlYWQsIHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyb3dFeHByZXNzaW9uKCk7XG4gICAgfVxuXG5cblxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N5bnRheFRlbXBsYXRlKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgLy8gc3ludGF4UXVvdGUgYCAuLi4gYFxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N5bnRheFF1b3RlVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG5cbiAgICAvLyAoJHg6ZXhwcilcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIiwge1xuICAgICAgICBpbm5lcjogdGhpcy5hZHZhbmNlKCkuaW5uZXIoKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAoXG4gICAgICB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsIFwidGhpc1wiKSB8fFxuICAgICAgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkKSB8fFxuICAgICAgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCAnbGV0JykgfHxcbiAgICAgIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZCwgJ3lpZWxkJykgfHxcbiAgICAgIHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWQpIHx8XG4gICAgICB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWQpIHx8XG4gICAgICB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkKSB8fFxuICAgICAgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZCkgfHxcbiAgICAgIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWQpIHx8XG4gICAgICB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkKSB8fFxuICAgICAgdGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWQpIHx8XG4gICAgICB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZCkgfHxcbiAgICAgIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWQpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cblxuICAgIC8vIHByZWZpeCB1bmFyeVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVmFyQmluZGluZ1RyYW5zZm9ybShsb29rYWhlYWQpKSB7XG4gICAgICBsZXQgaWQgPSB0aGlzLmdldEZyb21Db21waWxldGltZUVudmlyb25tZW50KGxvb2thaGVhZCkuaWQ7XG4gICAgICBpZiAoaWQgIT09IGxvb2thaGVhZCkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5yZXN0ID0gTGlzdC5vZihpZCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgodGhpcy50ZXJtID09PSBudWxsICYmIChcbiAgICAgIHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkKSB8fFxuICAgICAgICB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdzdXBlcicpKSkgfHxcbiAgICAgICAgLy8gYW5kIHRoZW4gY2hlY2sgdGhlIGNhc2VzIHdoZXJlIHRoZSB0ZXJtIHBhcnQgb2YgcCBpcyBzb21ldGhpbmcuLi5cbiAgICAgICAgKHRoaXMudGVybSAmJiAoXG4gICAgICAgICAgLy8gJHg6ZXhwciAuICRwcm9wOmlkZW50XG4gICAgICAgICAgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJy4nKSAmJiAoXG4gICAgICAgICAgICB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpKSB8fFxuICAgICAgICAgICAgLy8gJHg6ZXhwciBbICRiOmV4cHIgXVxuICAgICAgICAgICAgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZCkgfHxcbiAgICAgICAgICAgIC8vICR4OmV4cHIgKC4uLilcbiAgICAgICAgICAgIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkKVxuICAgICAgICApKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMZWZ0SGFuZFNpZGVFeHByZXNzaW9uKHsgYWxsb3dDYWxsOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIC8vICR4OmlkIGAuLi5gXG4gICAgaWYodGhpcy50ZXJtICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpO1xuICAgIH1cblxuICAgIC8vIHBvc3RmaXggdW5hcnlcbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNVcGRhdGVPcGVyYXRvcihsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKTtcbiAgICB9XG5cbiAgICAvLyAkbDpleHByICRvcDpiaW5hcnlPcGVyYXRvciAkcjpleHByXG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzT3BlcmF0b3IobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgLy8gJHg6ZXhwciA9ICRpbml0OmV4cHJcbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkKSkge1xuICAgICAgbGV0IGJpbmRpbmcgPSB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGhpcy50ZXJtKTtcbiAgICAgIGxldCBvcCA9IHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgaW5pdCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcblxuICAgICAgaWYgKG9wLnZhbCgpID09PSAnPScpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdBc3NpZ25tZW50RXhwcmVzc2lvbicsIHtcbiAgICAgICAgICBiaW5kaW5nLFxuICAgICAgICAgIGV4cHJlc3Npb246IGluaXRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ0NvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb24nLCB7XG4gICAgICAgICAgYmluZGluZyxcbiAgICAgICAgICBvcGVyYXRvcjogb3AudmFsKCksXG4gICAgICAgICAgZXhwcmVzc2lvbjogaW5pdFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJz8nKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb25kaXRpb25hbEV4cHJlc3Npb24oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRTtcbiAgfVxuXG4gIGVuZm9yZXN0UHJpbWFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIC8vICR4OlRoaXNFeHByZXNzaW9uXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsIFwidGhpc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaGlzRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICAvLyAkeDppZGVudFxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCAnbGV0JykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCAneWllbGQnKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3ROdW1lcmljTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RyaW5nTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvb2xlYW5MaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TnVsbExpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RSZWd1bGFyRXhwcmVzc2lvbkxpdGVyYWwoKTtcbiAgICB9XG4gICAgLy8gJHg6RnVuY3Rpb25FeHByZXNzaW9uXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIC8vIHsgJHA6cHJvcCAoLCkgLi4uIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIC8vIFskeDpleHByICgsKSAuLi5dXG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCAnTm90IGEgcHJpbWFyeSBleHByZXNzaW9uJyk7XG4gIH1cblxuICBlbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oeyBhbGxvd0NhbGwgfSkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWQsICdzdXBlcicpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKCdTdXBlcicsIHt9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgICBpZiAodGhpcy5pc1BhcmVucyhsb29rYWhlYWQpKSB7XG4gICAgICAgIGlmICghYWxsb3dDYWxsKSB7XG4gICAgICAgICAgLy8gd2UncmUgZGVhbGluZyB3aXRoIGEgbmV3IGV4cHJlc3Npb25cbiAgICAgICAgICBpZiAodGhpcy50ZXJtICYmXG4gICAgICAgICAgICAgIChpc0lkZW50aWZpZXJFeHByZXNzaW9uKHRoaXMudGVybSkgfHxcbiAgICAgICAgICAgICAgIGlzU3RhdGljTWVtYmVyRXhwcmVzc2lvbih0aGlzLnRlcm0pIHx8XG4gICAgICAgICAgICAgICBpc0NvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbih0aGlzLnRlcm0pKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdENhbGxFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZCkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy50ZXJtID8gdGhpcy5lbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIDogdGhpcy5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJy4nKSAmJiAoXG4gICAgICAgIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZCkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZCkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbmV3IFRlcm0oJ0lkZW50aWZpZXJFeHByZXNzaW9uJywgeyBuYW1lOiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cblxuICBlbmZvcmVzdEJvb2xlYW5MaXRlcmFsKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hZHZhbmNlKClcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCkge1xuICAgIHJldHVybiBuZXcgVGVybSgnVGVtcGxhdGVFeHByZXNzaW9uJywge1xuICAgICAgdGFnOiB0aGlzLnRlcm0sXG4gICAgICBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RTdHJpbmdMaXRlcmFsKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFkdmFuY2UoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3ROdW1lcmljTGl0ZXJhbCgpIHtcbiAgICBsZXQgbnVtID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKG51bS52YWwoKSA9PT0gMSAvIDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvbicsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHtcbiAgICAgIHZhbHVlOiBudW1cbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0SWRlbnRpZmllckV4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge1xuICAgICAgbmFtZTogdGhpcy5hZHZhbmNlKClcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0UmVndWxhckV4cHJlc3Npb25MaXRlcmFsKCkge1xuICAgIGxldCByZVN0eCA9IHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgbGV0IGxhc3RTbGFzaCA9IHJlU3R4LnRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICBsZXQgcGF0dGVybiA9IHJlU3R4LnRva2VuLnZhbHVlLnNsaWNlKDEsIGxhc3RTbGFzaCk7XG4gICAgbGV0IGZsYWdzID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoICsgMSk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiwge1xuICAgICAgcGF0dGVybiwgZmxhZ3NcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0TnVsbExpdGVyYWwoKSB7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgfVxuXG4gIGVuZm9yZXN0VGhpc0V4cHJlc3Npb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhpc0V4cHJlc3Npb25cIiwge1xuICAgICAgc3R4OiB0aGlzLmFkdmFuY2UoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RBcmd1bWVudExpc3QoKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksICcuLi4nKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgYXJnID0gbmV3IFRlcm0oJ1NwcmVhZEVsZW1lbnQnLCB7XG4gICAgICAgICAgZXhwcmVzc2lvbjogdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKClcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoJywnKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdCk7XG4gIH1cblxuICBlbmZvcmVzdE5ld0V4cHJlc3Npb24oKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoJ25ldycpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgJy4nKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksICd0YXJnZXQnKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybSgnTmV3VGFyZ2V0RXhwcmVzc2lvbicsIHt9KTtcbiAgICB9XG5cbiAgICBsZXQgY2FsbGVlID0gdGhpcy5lbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oeyBhbGxvd0NhbGw6IGZhbHNlIH0pO1xuICAgIGxldCBhcmdzO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJncyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncyA9IExpc3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdOZXdFeHByZXNzaW9uJywge1xuICAgICAgY2FsbGVlLFxuICAgICAgYXJndW1lbnRzOiBhcmdzXG4gICAgfSk7XG4gIH1cblxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFNxdWFyZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiBuZXcgVGVybSgnQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uJywge1xuICAgICAgb2JqZWN0OiB0aGlzLnRlcm0sXG4gICAgICBleHByZXNzaW9uOiBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uKClcbiAgICB9KTtcbiAgfVxuXG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybSkge1xuICAgIHN3aXRjaCAodGVybS50eXBlKSB7XG4gICAgICBjYXNlICdJZGVudGlmaWVyRXhwcmVzc2lvbic6XG4gICAgICAgIHJldHVybiBuZXcgVGVybSgnQmluZGluZ0lkZW50aWZpZXInLCB7bmFtZTogdGVybS5uYW1lfSk7XG5cbiAgICAgIGNhc2UgJ1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uJzpcbiAgICAgICAgaWYgKHRlcm0uaW5uZXIuc2l6ZSA9PT0gMSAmJiB0aGlzLmlzSWRlbnRpZmllcih0ZXJtLmlubmVyLmdldCgwKSkpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdJZGVudGlmaWVyJywgeyBuYW1lOiB0ZXJtLmlubmVyLmdldCgwKX0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXJtO1xuICAgICAgY2FzZSAnRGF0YVByb3BlcnR5JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eScsIHtcbiAgICAgICAgICBuYW1lOiB0ZXJtLm5hbWUsXG4gICAgICAgICAgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybS5leHByZXNzaW9uKVxuICAgICAgICB9KTtcbiAgICAgIGNhc2UgJ1Nob3J0aGFuZFByb3BlcnR5JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyJywge1xuICAgICAgICAgIGJpbmRpbmc6IG5ldyBUZXJtKCdCaW5kaW5nSWRlbnRpZmllcicsIHsgbmFtZTogdGVybS5uYW1lIH0pLFxuICAgICAgICAgIGluaXQ6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICBjYXNlICdPYmplY3RFeHByZXNzaW9uJzpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdPYmplY3RCaW5kaW5nJywge1xuICAgICAgICAgIHByb3BlcnRpZXM6IHRlcm0ucHJvcGVydGllcy5tYXAodCA9PiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodCkpXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSAnQXJyYXlFeHByZXNzaW9uJzoge1xuICAgICAgICBsZXQgbGFzdCA9IHRlcm0uZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gJ1NwcmVhZEVsZW1lbnQnKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKCdBcnJheUJpbmRpbmcnLCB7XG4gICAgICAgICAgICBlbGVtZW50czogdGVybS5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHQgPT4gdCAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0KSksXG4gICAgICAgICAgICByZXN0RWxlbWVudDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQobGFzdC5leHByZXNzaW9uKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSgnQXJyYXlCaW5kaW5nJywge1xuICAgICAgICAgICAgZWxlbWVudHM6IHRlcm0uZWxlbWVudHMubWFwKHQgPT4gdCAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0KSksXG4gICAgICAgICAgICByZXN0RWxlbWVudDogbnVsbFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYXNlICdTdGF0aWNQcm9wZXJ0eU5hbWUnOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdJZGVudGlmaWVyJywge1xuICAgICAgICAgIG5hbWU6IHRlcm0udmFsdWVcbiAgICAgICAgfSk7XG4gICAgICBjYXNlICdDb21wdXRlZE1lbWJlckV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnU3RhdGljTWVtYmVyRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdBcnJheUJpbmRpbmcnOlxuICAgICAgY2FzZSAnQmluZGluZ0lkZW50aWZpZXInOlxuICAgICAgY2FzZSAnQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcic6XG4gICAgICBjYXNlICdCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSc6XG4gICAgICBjYXNlICdCaW5kaW5nV2l0aERlZmF1bHQnOlxuICAgICAgY2FzZSAnT2JqZWN0QmluZGluZyc6XG4gICAgICAgIHJldHVybiB0ZXJtO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsICdub3QgaW1wbGVtZW50ZWQgeWV0IGZvciAnICsgdGVybS50eXBlKTtcbiAgfVxuXG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtKSB7XG4gICAgc3dpdGNoICh0ZXJtLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ0JpbmRpbmdXaXRoRGVmYXVsdCcsIHtcbiAgICAgICAgICBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybS5iaW5kaW5nKSxcbiAgICAgICAgICBpbml0OiB0ZXJtLmV4cHJlc3Npb24sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm0pO1xuICB9XG5cbiAgZW5mb3Jlc3RDYWxsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgcGFyZW4gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7XG4gICAgICBjYWxsZWU6IHRoaXMudGVybSxcbiAgICAgIGFyZ3VtZW50czogcGFyZW4uaW5uZXIoKVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBlbmYgPSBuZXcgRW5mb3Jlc3RlcihMaXN0Lm9mKHRoaXMuYWR2YW5jZSgpKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGVuZiA9IG5ldyBFbmZvcmVzdGVyKHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtcyA9IGVuZi5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcignPT4nKTtcblxuICAgIGxldCBib2R5O1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgYm9keSA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdBcnJvd0V4cHJlc3Npb24nLCB7IHBhcmFtcywgYm9keSB9KTtcbiAgfVxuXG5cbiAgZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGt3ZCA9IHRoaXMubWF0Y2hLZXl3b3JkKCd5aWVsZCcpO1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcblxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCAobG9va2FoZWFkICYmICF0aGlzLmxpbmVOdW1iZXJFcShrd2QsIGxvb2thaGVhZCkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oJ1lpZWxkRXhwcmVzc2lvbicsIHtcbiAgICAgICAgZXhwcmVzc2lvbjogbnVsbFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpc0dlbmVyYXRvciA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCAnKicpKSB7XG4gICAgICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfVxuICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgbGV0IHR5cGUgPSBpc0dlbmVyYXRvciA/ICdZaWVsZEdlbmVyYXRvckV4cHJlc3Npb24nIDogJ1lpZWxkRXhwcmVzc2lvbic7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge1xuICAgICAgICBleHByZXNzaW9uOiBleHByXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBlbmZvcmVzdFN5bnRheFRlbXBsYXRlKCkge1xuICAgIHJldHVybiBuZXcgVGVybSgnU3ludGF4VGVtcGxhdGUnLCB7XG4gICAgICB0ZW1wbGF0ZTogdGhpcy5hZHZhbmNlKClcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0U3ludGF4UXVvdGUoKSB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ1N5bnRheFF1b3RlJywge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHRlbXBsYXRlOiBuZXcgVGVybSgnVGVtcGxhdGVFeHByZXNzaW9uJywge1xuICAgICAgICB0YWc6IG5ldyBUZXJtKCdJZGVudGlmaWVyRXhwcmVzc2lvbicsIHtcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0pLFxuICAgICAgICBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKVxuICAgICAgfSlcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqZWN0ID0gdGhpcy50ZXJtO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0eSA9IHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7XG4gICAgICBvYmplY3Q6IG9iamVjdCxcbiAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGFyciA9IHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgbGV0IGVsZW1lbnRzID0gW107XG5cbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoYXJyLmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcblxuICAgIHdoaWxlIChlbmYucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZi5wZWVrKCk7XG4gICAgICBpZiAoZW5mLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLFwiKSkge1xuICAgICAgICBlbmYuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50cy5wdXNoKG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChlbmYuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJy4uLicpKSB7XG4gICAgICAgIGVuZi5hZHZhbmNlKCk7XG4gICAgICAgIGxldCBleHByZXNzaW9uID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZi5jcmVhdGVFcnJvcihsb29rYWhlYWQsICdleHBlY3RpbmcgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzLnB1c2gobmV3IFRlcm0oJ1NwcmVhZEVsZW1lbnQnLCB7IGV4cHJlc3Npb24gfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHRlcm0gPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAodGVybSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzLnB1c2godGVybSk7XG4gICAgICAgIGVuZi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge1xuICAgICAgZWxlbWVudHM6IExpc3QoZWxlbWVudHMpXG4gICAgfSk7XG4gIH1cblxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9iaiA9IHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgbGV0IHByb3BlcnRpZXMgPSBMaXN0KCk7XG5cbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIob2JqLmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcblxuICAgIGxldCBsYXN0UHJvcCA9IG51bGw7XG4gICAgd2hpbGUgKGVuZi5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZi5lbmZvcmVzdFByb3BlcnR5RGVmaW5pdGlvbigpO1xuICAgICAgZW5mLmNvbnN1bWVDb21tYSgpO1xuICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMuY29uY2F0KHByb3ApO1xuXG4gICAgICBpZiAobGFzdFByb3AgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mLmNyZWF0ZUVycm9yKHByb3AsIFwiaW52YWxpZCBzeW50YXggaW4gb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgbGFzdFByb3AgPSBwcm9wO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge1xuICAgICAgcHJvcGVydGllczogcHJvcGVydGllc1xuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG5cbiAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IHRoaXMuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG5cbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgJ21ldGhvZCc6XG4gICAgICAgIHJldHVybiBtZXRob2RPcktleTtcbiAgICAgIGNhc2UgJ2lkZW50aWZpZXInOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSgnQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllcicsIHtcbiAgICAgICAgICAgIGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksICc6JykpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ1Nob3J0aGFuZFByb3BlcnR5Jywge1xuICAgICAgICAgICAgbmFtZTogbWV0aG9kT3JLZXkudmFsdWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKCc6Jyk7XG4gICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcblxuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7XG4gICAgICBuYW1lOiBtZXRob2RPcktleSxcbiAgICAgIGV4cHJlc3Npb246IGV4cHJcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgJyonKSkge1xuICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCwgJ2dldCcpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWV0aG9kT3JLZXk6IG5ldyBUZXJtKCdHZXR0ZXInLCB7IG5hbWUsIGJvZHkgfSksXG4gICAgICAgIGtpbmQ6ICdtZXRob2QnXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkLCAnc2V0JykgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWV0aG9kT3JLZXk6IG5ldyBUZXJtKCdTZXR0ZXInLCB7IG5hbWUsIHBhcmFtLCBib2R5IH0pLFxuICAgICAgICBraW5kOiAnbWV0aG9kJ1xuICAgICAgfTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuXG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXRob2RPcktleTogbmV3IFRlcm0oJ01ldGhvZCcsIHtcbiAgICAgICAgICBpc0dlbmVyYXRvcixcbiAgICAgICAgICBuYW1lLCBwYXJhbXM6IGZvcm1hbFBhcmFtcywgYm9keVxuICAgICAgICB9KSxcbiAgICAgICAga2luZDogJ21ldGhvZCdcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBtZXRob2RPcktleTogbmFtZSxcbiAgICAgIGtpbmQ6IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkKSA/ICdpZGVudGlmaWVyJyA6ICdwcm9wZXJ0eSdcbiAgICB9O1xuICB9XG5cbiAgZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZCkgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IG5ldyBUZXJtKCdTdGF0aWNQcm9wZXJ0eU5hbWUnLCB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMuYWR2YW5jZSgpXG4gICAgICAgIH0pLFxuICAgICAgICBiaW5kaW5nOiBudWxsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZCkpIHtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZXhwciA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBuZXcgVGVybSgnQ29tcHV0ZWRQcm9wZXJ0eU5hbWUnLCB7XG4gICAgICAgICAgZXhwcmVzc2lvbjogZXhwclxuICAgICAgICB9KSxcbiAgICAgICAgYmluZGluZzogbnVsbFxuICAgICAgfTtcbiAgICB9XG4gICAgbGV0IG5hbWUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmV3IFRlcm0oJ1N0YXRpY1Byb3BlcnR5TmFtZScsIHsgdmFsdWU6IG5hbWUgfSksXG4gICAgICBiaW5kaW5nOiBuZXcgVGVybSgnQmluZGluZ0lkZW50aWZpZXInLCB7IG5hbWUgfSlcbiAgICB9O1xuICB9XG5cbiAgZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByLCBpbkRlZmF1bHR9KSB7XG4gICAgbGV0IG5hbWUgPSBudWxsLCBwYXJhbXMsIGJvZHk7XG4gICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgLy8gZWF0IHRoZSBmdW5jdGlvbiBrZXl3b3JkXG4gICAgbGV0IGZuS2V5d29yZCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZSA9IGlzRXhwciA/ICdGdW5jdGlvbkV4cHJlc3Npb24nIDogJ0Z1bmN0aW9uRGVjbGFyYXRpb24nO1xuXG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWQpKSB7XG4gICAgICBuYW1lID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWUgPSBuZXcgVGVybSgnQmluZGluZ0lkZW50aWZpZXInLCB7XG4gICAgICAgIG5hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcignKmRlZmF1bHQqJywgZm5LZXl3b3JkKVxuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG5cblxuICAgIGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuXG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtcywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXMgPSBlbmYuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcixcbiAgICAgIHBhcmFtczogZm9ybWFsUGFyYW1zLFxuICAgICAgYm9keTogYm9keVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG5hbWUgPSBudWxsLCBwYXJhbXMsIGJvZHk7XG4gICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgLy8gZWF0IHRoZSBmdW5jdGlvbiBrZXl3b3JkXG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWQpKSB7XG4gICAgICBuYW1lID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfVxuXG4gICAgcGFyYW1zID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuXG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtcywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXMgPSBlbmYuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG5cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkV4cHJlc3Npb25cIiwge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcixcbiAgICAgIHBhcmFtczogZm9ybWFsUGFyYW1zLFxuICAgICAgYm9keTogYm9keVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCkge1xuICAgIGxldCBuYW1lLCBwYXJhbXMsIGJvZHk7XG4gICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgLy8gZWF0IHRoZSBmdW5jdGlvbiBrZXl3b3JkXG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBuYW1lID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG5cbiAgICBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG5cbiAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtcyA9IGVuZi5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcblxuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIiwge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcixcbiAgICAgIHBhcmFtczogZm9ybWFsUGFyYW1zLFxuICAgICAgYm9keTogYm9keVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCkge1xuICAgIGxldCBpdGVtcyA9IFtdO1xuICAgIGxldCByZXN0ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICcuLi4nKSkge1xuICAgICAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcignLi4uJyk7XG4gICAgICAgIHJlc3QgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpdGVtcy5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge1xuICAgICAgaXRlbXM6IExpc3QoaXRlbXMpLCByZXN0XG4gICAgfSk7XG4gIH1cblxuICBlbmZvcmVzdFBhcmFtKCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgfVxuXG4gIGVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3IgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXJtKCdVcGRhdGVFeHByZXNzaW9uJywge1xuICAgICAgaXNQcmVmaXg6IGZhbHNlLFxuICAgICAgb3BlcmF0b3I6IG9wZXJhdG9yLnZhbCgpLFxuICAgICAgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSlcbiAgICB9KTtcbiAgfVxuXG4gIGVuZm9yZXN0VW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvciA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7XG4gICAgICBwcmVjOiB0aGlzLm9wQ3R4LnByZWMsXG4gICAgICBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmVcbiAgICB9KTtcbiAgICAvLyBUT0RPOiBhbGwgYnVpbHRpbnMgYXJlIDE0LCBjdXN0b20gb3BlcmF0b3JzIHdpbGwgY2hhbmdlIHRoaXNcbiAgICB0aGlzLm9wQ3R4LnByZWMgPSAxNDtcbiAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm0gPT4ge1xuICAgICAgaWYgKG9wZXJhdG9yLnZhbCgpID09PSAnKysnIHx8IG9wZXJhdG9yLnZhbCgpID09PSAnLS0nKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybSgnVXBkYXRlRXhwcmVzc2lvbicsIHtcbiAgICAgICAgICBvcGVyYXRvcjogb3BlcmF0b3IudmFsKCksXG4gICAgICAgICAgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybSksXG4gICAgICAgICAgaXNQcmVmaXg6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oJ1VuYXJ5RXhwcmVzc2lvbicsIHtcbiAgICAgICAgICBvcGVyYXRvcjogb3BlcmF0b3IudmFsKCksXG4gICAgICAgICAgb3BlcmFuZDogcmlnaHRUZXJtXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUjtcbiAgfVxuXG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIC8vIGZpcnN0LCBwb3AgdGhlIG9wZXJhdG9yIHN0YWNrXG4gICAgbGV0IHRlc3QgPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICBpZiAodGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgbGV0IHsgcHJlYywgY29tYmluZSB9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cblxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKCc/Jyk7XG4gICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjb25zZXF1ZW50ID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmYubWF0Y2hQdW5jdHVhdG9yKCc6Jyk7XG4gICAgZW5mID0gbmV3IEVuZm9yZXN0ZXIoZW5mLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYWx0ZXJuYXRlID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0NvbmRpdGlvbmFsRXhwcmVzc2lvbicsIHtcbiAgICAgIHRlc3QsIGNvbnNlcXVlbnQsIGFsdGVybmF0ZVxuICAgIH0pO1xuICB9XG5cbiAgZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCkge1xuXG4gICAgbGV0IGxlZnRUZXJtID0gdGhpcy50ZXJtO1xuICAgIGxldCBvcFN0eCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBvcCA9IG9wU3R4LnZhbCgpO1xuICAgIGxldCBvcFByZWMgPSBnZXRPcGVyYXRvclByZWMob3ApO1xuICAgIGxldCBvcEFzc29jID0gZ2V0T3BlcmF0b3JBc3NvYyhvcCk7XG5cbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlYywgb3BBc3NvYykpIHtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe1xuICAgICAgICBwcmVjOiB0aGlzLm9wQ3R4LnByZWMsXG4gICAgICAgIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZVxuICAgICAgfSk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBvcFByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSAocmlnaHRUZXJtKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge1xuICAgICAgICAgIGxlZnQ6IGxlZnRUZXJtLFxuICAgICAgICAgIG9wZXJhdG9yOiBvcFN0eCxcbiAgICAgICAgICByaWdodDogcmlnaHRUZXJtXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm0pO1xuICAgICAgLy8gdGhpcy5yZXN0IGRvZXMgbm90IGNoYW5nZVxuICAgICAgbGV0IHsgcHJlYywgY29tYmluZSB9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgcmV0dXJuIHRlcm07XG4gICAgfVxuICB9XG5cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLm1hdGNoVGVtcGxhdGUoKTtcbiAgICBsZXQgZWxlbWVudHMgPSBsb29rYWhlYWQudG9rZW4uaXRlbXMubWFwKGl0ID0+IHtcbiAgICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKGl0KSkge1xuICAgICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoaXQuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSgnVGVtcGxhdGVFbGVtZW50Jywge1xuICAgICAgICByYXdWYWx1ZTogaXQuc2xpY2UudGV4dFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuICB9XG5cbiAgZXhwYW5kTWFjcm8oKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgIHdoaWxlICh0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkKSkge1xuICAgICAgbGV0IG5hbWUgPSB0aGlzLmFkdmFuY2UoKTtcblxuICAgICAgbGV0IHN5bnRheFRyYW5zZm9ybSA9IHRoaXMuZ2V0RnJvbUNvbXBpbGV0aW1lRW52aXJvbm1lbnQobmFtZSk7XG4gICAgICBpZiAoc3ludGF4VHJhbnNmb3JtID09IG51bGwgfHwgdHlwZW9mIHN5bnRheFRyYW5zZm9ybS52YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSxcbiAgICAgICAgICBcInRoZSBtYWNybyBuYW1lIHdhcyBub3QgYm91bmQgdG8gYSB2YWx1ZSB0aGF0IGNvdWxkIGJlIGludm9rZWRcIik7XG4gICAgICB9XG4gICAgICBsZXQgdXNlU2l0ZVNjb3BlID0gZnJlc2hTY29wZShcInVcIik7XG4gICAgICBsZXQgaW50cm9kdWNlZFNjb3BlID0gZnJlc2hTY29wZShcImlcIik7XG4gICAgICAvLyBUT0RPOiBuZWVkcyB0byBiZSBhIGxpc3Qgb2Ygc2NvcGVzIEkgdGhpbmtcbiAgICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZTtcblxuICAgICAgbGV0IGN0eCA9IG5ldyBNYWNyb0NvbnRleHQodGhpcywgbmFtZSwgdGhpcy5jb250ZXh0LCB1c2VTaXRlU2NvcGUsIGludHJvZHVjZWRTY29wZSk7XG5cbiAgICAgIGxldCByZXN1bHQgPSBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHN5bnRheFRyYW5zZm9ybS52YWx1ZS5jYWxsKG51bGwsIGN0eCkpO1xuICAgICAgaWYgKCFMaXN0LmlzTGlzdChyZXN1bHQpKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSwgXCJtYWNybyBtdXN0IHJldHVybiBhIGxpc3QgYnV0IGdvdDogXCIgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChzdHggPT4ge1xuICAgICAgICBpZiAoIShzdHggJiYgdHlwZW9mIHN0eC5hZGRTY29wZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWUsICdtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiAnICsgc3R4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R4LmFkZFNjb3BlKGludHJvZHVjZWRTY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7IGZsaXA6IHRydWUgfSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5yZXN0ID0gcmVzdWx0LmNvbmNhdChjdHguX3Jlc3QodGhpcykpO1xuICAgICAgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZVNlbWljb2xvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG5cbiAgICBpZiAobG9va2FoZWFkICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuXG4gICAgaWYgKGxvb2thaGVhZCAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsICcsJykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuXG4gIHNhZmVDaGVjayhvYmosIHR5cGUsIHZhbCA9IG51bGwpIHtcbiAgICByZXR1cm4gb2JqICYmICh0eXBlb2Ygb2JqLm1hdGNoID09PSAnZnVuY3Rpb24nID8gb2JqLm1hdGNoKHR5cGUsIHZhbCkgOiBmYWxzZSk7XG4gIH1cblxuICBpc1Rlcm0odGVybSkge1xuICAgIHJldHVybiB0ZXJtICYmICh0ZXJtIGluc3RhbmNlb2YgVGVybSk7XG4gIH1cblxuICBpc0VPRihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqLCAnZW9mJyk7XG4gIH1cblxuICBpc0lkZW50aWZpZXIob2JqLCB2YWwgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ2lkZW50aWZpZXInLCB2YWwpO1xuICB9XG5cbiAgaXNQcm9wZXJ0eU5hbWUob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGlmaWVyKG9iaikgfHwgdGhpcy5pc0tleXdvcmQob2JqKSB8fFxuICAgICAgICAgICB0aGlzLmlzTnVtZXJpY0xpdGVyYWwob2JqKSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbChvYmopIHx8IHRoaXMuaXNCcmFja2V0cyhvYmopO1xuICB9XG5cbiAgaXNOdW1lcmljTGl0ZXJhbChvYmosIHZhbCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqLCAnbnVtYmVyJywgdmFsKTtcbiAgfVxuXG4gIGlzU3RyaW5nTGl0ZXJhbChvYmosIHZhbCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqLCAnc3RyaW5nJywgdmFsKTtcbiAgfVxuXG4gIGlzVGVtcGxhdGUob2JqLCB2YWwgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ3RlbXBsYXRlJywgdmFsKTtcbiAgfVxuXG4gIGlzU3ludGF4VGVtcGxhdGUob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ3N5bnRheFRlbXBsYXRlJyk7XG4gIH1cblxuICBpc0Jvb2xlYW5MaXRlcmFsKG9iaiwgdmFsID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmosICdib29sZWFuJywgdmFsKTtcbiAgfVxuXG4gIGlzTnVsbExpdGVyYWwob2JqLCB2YWwgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ251bGwnLCB2YWwpO1xuICB9XG5cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbihvYmosIHZhbCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqLCAncmVndWxhckV4cHJlc3Npb24nLCB2YWwpO1xuICB9XG5cbiAgaXNEZWxpbWl0ZXIob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ2RlbGltaXRlcicpO1xuICB9XG5cbiAgaXNQYXJlbnMob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ3BhcmVucycpO1xuICB9XG5cbiAgaXNCcmFjZXMob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ2JyYWNlcycpO1xuICB9XG5cbiAgaXNCcmFja2V0cyhvYmopIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqLCAnYnJhY2tldHMnKTtcbiAgfVxuXG4gIGlzQXNzaWduKG9iaiwgdmFsID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmosICdhc3NpZ24nLCB2YWwpO1xuICB9XG5cblxuICBpc0tleXdvcmQob2JqLCB2YWwgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ2tleXdvcmQnLCB2YWwpO1xuICB9XG5cbiAgaXNQdW5jdHVhdG9yKG9iaiwgdmFsID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmosICdwdW5jdHVhdG9yJywgdmFsKTtcbiAgfVxuXG4gIGlzT3BlcmF0b3Iob2JqKSB7XG4gICAgcmV0dXJuICh0aGlzLnNhZmVDaGVjayhvYmosICdwdW5jdHVhdG9yJykgfHxcbiAgICAgICAgICAgIHRoaXMuc2FmZUNoZWNrKG9iaiwgJ2lkZW50aWZpZXInKSB8fFxuICAgICAgICAgICAgdGhpcy5zYWZlQ2hlY2sob2JqLCAna2V5d29yZCcpKSAmJiBpc09wZXJhdG9yKG9iaik7XG4gIH1cblxuICBpc1VwZGF0ZU9wZXJhdG9yKG9iaikge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmosICdwdW5jdHVhdG9yJywgJysrJykgfHxcbiAgICAgICAgICAgdGhpcy5zYWZlQ2hlY2sob2JqLCAncHVuY3R1YXRvcicsICctLScpO1xuICB9XG5cbiAgc2FmZVJlc29sdmUob2JqLCBwaGFzZSkge1xuICAgIHJldHVybiAob2JqICYmIHR5cGVvZiBvYmoucmVzb2x2ZSA9PT0gJ2Z1bmN0aW9uJykgPyBKdXN0KG9iai5yZXNvbHZlKHBoYXNlKSkgOiBOb3RoaW5nKCk7XG4gIH1cblxuICBpc1RyYW5zZm9ybShvYmosIHRyYW5zKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZVJlc29sdmUob2JqLCB0aGlzLmNvbnRleHQucGhhc2UpXG4gICAgICAgICAgICAgICAubWFwKG5hbWUgPT4gdGhpcy5jb250ZXh0LmVudi5nZXQobmFtZSkgPT09IHRyYW5zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3JlLmdldChuYW1lKSA9PT0gdHJhbnMpXG4gICAgICAgICAgICAgICAuZ2V0T3JFbHNlKGZhbHNlKTtcbiAgfVxuXG4gIGlzVHJhbnNmb3JtSW5zdGFuY2Uob2JqLCB0cmFucykge1xuICAgIHJldHVybiB0aGlzLnNhZmVSZXNvbHZlKG9iaiwgdGhpcy5jb250ZXh0LnBoYXNlKVxuICAgICAgICAgICAgICAgLm1hcChuYW1lID0+IHRoaXMuY29udGV4dC5lbnYuZ2V0KG5hbWUpIGluc3RhbmNlb2YgdHJhbnMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KG5hbWUpIGluc3RhbmNlb2YgdHJhbnMpXG4gICAgICAgICAgICAgICAuZ2V0T3JFbHNlKGZhbHNlKTtcbiAgfVxuXG4gIGlzRm5EZWNsVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgRnVuY3Rpb25EZWNsVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzVmFyRGVjbFRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSk7XG4gIH1cblxuICBpc0xldERlY2xUcmFuc2Zvcm0ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqLCBMZXREZWNsVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgQ29uc3REZWNsVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzU3ludGF4RGVjbFRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIFN5bnRheERlY2xUcmFuc2Zvcm0pO1xuICB9XG5cbiAgaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSk7XG4gIH1cblxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgU3ludGF4UXVvdGVUcmFuc2Zvcm0pO1xuICB9XG5cbiAgaXNSZXR1cm5TdG10VHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzV2hpbGVUcmFuc2Zvcm0ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqLCBXaGlsZVRyYW5zZm9ybSk7XG4gIH1cblxuICBpc0ZvclRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIEZvclRyYW5zZm9ybSk7XG4gIH1cblxuICBpc1N3aXRjaFRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIFN3aXRjaFRyYW5zZm9ybSk7XG4gIH1cblxuICBpc0JyZWFrVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgQnJlYWtUcmFuc2Zvcm0pO1xuICB9XG5cbiAgaXNDb250aW51ZVRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIENvbnRpbnVlVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzRG9UcmFuc2Zvcm0ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqLCBEb1RyYW5zZm9ybSk7XG4gIH1cblxuICBpc0RlYnVnZ2VyVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgRGVidWdnZXJUcmFuc2Zvcm0pO1xuICB9XG5cbiAgaXNXaXRoVHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgV2l0aFRyYW5zZm9ybSk7XG4gIH1cblxuICBpc1RyeVRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIFRyeVRyYW5zZm9ybSk7XG4gIH1cblxuICBpc1Rocm93VHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgVGhyb3dUcmFuc2Zvcm0pO1xuICB9XG5cbiAgaXNJZlRyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmosIElmVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzTmV3VHJhbnNmb3JtKG9iaikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9iaiwgTmV3VHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm1JbnN0YW5jZShvYmosIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuXG4gIGlzVmFyQmluZGluZ1RyYW5zZm9ybShvYmopIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybUluc3RhbmNlKG9iaiwgVmFyQmluZGluZ1RyYW5zZm9ybSk7XG4gIH1cblxuICBnZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudCh0ZXJtKSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5lbnYuaGFzKHRlcm0ucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm0ucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkpO1xuICB9XG5cbiAgbGluZU51bWJlckVxKGEsIGIpIHtcbiAgICBpZiAoIShhICYmIGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBhLmxpbmVOdW1iZXIoKSA9PT0gYi5saW5lTnVtYmVyKCk7XG4gIH1cblxuICBtYXRjaElkZW50aWZpZXIodmFsKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWQsIHZhbCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG5cbiAgbWF0Y2hLZXl3b3JkKHZhbCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkLCB2YWwpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgJ2V4cGVjdGluZyAnICsgdmFsKTtcbiAgfVxuXG4gIG1hdGNoTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWQpIHx8XG4gICAgICAgIHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZCkgfHxcbiAgICAgICAgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZCkgfHxcbiAgICAgICAgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZCkgfHxcbiAgICAgICAgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZCkgfHxcbiAgICAgICAgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBhIGxpdGVyYWxcIik7XG4gIH1cblxuICBtYXRjaFN0cmluZ0xpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgJ2V4cGVjdGluZyBhIHN0cmluZyBsaXRlcmFsJyk7XG4gIH1cblxuICBtYXRjaFRlbXBsYXRlKCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCAnZXhwZWN0aW5nIGEgdGVtcGxhdGUgbGl0ZXJhbCcpO1xuICB9XG5cbiAgbWF0Y2hQYXJlbnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWQuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0aW5nIHBhcmVuc1wiKTtcbiAgfVxuXG4gIG1hdGNoQ3VybGllcygpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZC5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RpbmcgY3VybHkgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoU3F1YXJlcygpIHtcbiAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBzcWF1cmUgYnJhY2VzXCIpO1xuICB9XG5cbiAgbWF0Y2hVbmFyeU9wZXJhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNVbmFyeU9wZXJhdG9yKGxvb2thaGVhZCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBhIHVuYXJ5IG9wZXJhdG9yXCIpO1xuICB9XG5cbiAgbWF0Y2hQdW5jdHVhdG9yKHZhbCkge1xuICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkKSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChsb29rYWhlYWQudmFsKCkgPT09IHZhbCkge1xuICAgICAgICAgIHJldHVybiBsb29rYWhlYWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWQsXG4gICAgICAgICAgICBcImV4cGVjdGluZyBhIFwiICsgdmFsICsgXCIgcHVuY3R1YXRvclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxvb2thaGVhZDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuXG4gIGNyZWF0ZUVycm9yKHN0eCwgbWVzc2FnZSkge1xuICAgIGxldCBjdHggPSBcIlwiO1xuICAgIGxldCBvZmZlbmRpbmcgPSBzdHg7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgY3R4ID0gdGhpcy5yZXN0LnNsaWNlKDAsIDIwKS5tYXAodGVybSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKHRlcm0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRlcm0uaW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGlzdC5vZih0ZXJtKTtcbiAgICAgIH0pLmZsYXR0ZW4oKS5tYXAocyA9PiB7XG4gICAgICAgIGlmIChzID09PSBvZmZlbmRpbmcpIHtcbiAgICAgICAgICByZXR1cm4gXCJfX1wiICsgcy52YWwoKSArIFwiX19cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcy52YWwoKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHggPSBvZmZlbmRpbmcudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlICsgXCJcXG5cIiArIGN0eCk7XG5cbiAgfVxufVxuIl19