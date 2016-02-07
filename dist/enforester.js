"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enforester = undefined;

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _transforms = require("./transforms");

var _immutable = require("immutable");

var _errors = require("./errors");

var _operators = require("./operators");

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _scope = require("./scope");

var _macroContext = require("./macro-context");

var _macroContext2 = _interopRequireDefault(_macroContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EXPR_LOOP_OPERATOR = {};
var EXPR_LOOP_NO_CHANGE = {};

var Enforester = exports.Enforester = function () {
  function Enforester(stxl, prev, context) {
    _classCallCheck(this, Enforester);

    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev), "expecting a list of terms to enforest");
    (0, _errors.assert)(context, "expecting a context to enforest");
    this.term = null;

    this.rest = stxl;
    this.prev = prev;

    this.context = context;
  }

  _createClass(Enforester, [{
    key: "peek",
    value: function peek() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this.rest.get(n);
    }
  }, {
    key: "advance",
    value: function advance() {
      var ret = this.rest.first();
      this.rest = this.rest.rest();
      return ret;
    }

    /*
     enforest works over:
     prev - a list of the previously enforest Terms
     term - the current term being enforested (initially null)
     rest - remaining Terms to enforest
     */

  }, {
    key: "enforest",
    value: function enforest() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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

      var result = undefined;
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
  }, {
    key: "enforestModule",
    value: function enforestModule() {
      return this.enforestBody();
    }
  }, {
    key: "enforestBody",
    value: function enforestBody() {
      return this.enforestModuleItem();
    }
  }, {
    key: "enforestModuleItem",
    value: function enforestModuleItem() {
      var lookahead = this.peek();
      if (this.isKeyword(lookahead, 'import')) {
        this.advance();
        return this.enforestImportDeclaration();
      } else if (this.isKeyword(lookahead, 'export')) {
        this.advance();
        return this.enforestExportDeclaration();
      }
      return this.enforestStatement();
    }
  }, {
    key: "enforestExportDeclaration",
    value: function enforestExportDeclaration() {
      var lookahead = this.peek();
      if (this.isVarDeclTransform(lookahead) || this.isLetDeclTransform(lookahead) || this.isConstDeclTransform(lookahead) || this.isSyntaxrecDeclTransform(lookahead) || this.isSyntaxDeclTransform(lookahead)) {
        return new _terms2.default('Export', {
          declaration: new _terms2.default('VariableDeclarationStatement', {
            declaration: this.enforestVariableDeclaration()
          })
        });
      }
      throw "not implemented yet";
    }
  }, {
    key: "enforestImportDeclaration",
    value: function enforestImportDeclaration() {
      var lookahead = this.peek();

      if (this.isBraces(lookahead)) {
        var imports = this.enforestNamedImports();
        var fromClause = this.enforestFromClause();

        return new _terms2.default("Import", {
          defaultBinding: null,
          // List(ImportSpecifier)
          namedImports: imports,
          // String
          moduleSpecifier: fromClause

        });
      }
      throw "not implemented yet";
    }
  }, {
    key: "enforestNamedImports",
    value: function enforestNamedImports() {
      var enf = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var result = [];
      while (enf.rest.size !== 0) {
        result.push(enf.enforestImportSpecifiers());
      }
      return (0, _immutable.List)(result);
    }
  }, {
    key: "enforestImportSpecifiers",
    value: function enforestImportSpecifiers() {
      var lookahead = this.peek();
      if (this.isIdentifier(lookahead)) {
        var name = this.advance();
        this.consumeComma();
        return new _terms2.default('ImportSpecifier', {
          name: null,
          binding: new _terms2.default('BindingIdentifier', {
            name: name
          })
        });
      }
      throw this.createError(lookahead, 'unexpected token in import specifier');
    }
  }, {
    key: "enforestFromClause",
    value: function enforestFromClause() {
      this.matchIdentifier('from');
      var lookahead = this.matchStringLiteral();
      this.consumeSemicolon();
      return lookahead.val();
    }
  }, {
    key: "enforestStatementListItem",
    value: function enforestStatementListItem() {
      var lookahead = this.peek();

      if (this.isFnDeclTransform(lookahead)) {
        return this.enforestFunctionDeclaration({ isExpr: false });
      } else if (this.isKeyword(lookahead, 'class')) {
        return this.enforestClass({ isExpr: false });
      } else {
        return this.enforestStatement();
      }
    }
  }, {
    key: "enforestStatement",
    value: function enforestStatement() {
      var lookahead = this.peek();

      if (this.term === null && this.isCompiletimeTransform(lookahead)) {
        return this.expandMacro();
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
        var stmt = new _terms2.default('VariableDeclarationStatement', {
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
  }, {
    key: "enforestLabeledStatement",
    value: function enforestLabeledStatement() {
      var label = this.matchIdentifier();
      var punc = this.matchPunctuator(':');
      var stmt = this.enforestStatement();

      return new _terms2.default('LabeledStatement', {
        label: label,
        body: stmt
      });
    }
  }, {
    key: "enforestBreakStatement",
    value: function enforestBreakStatement() {
      this.matchKeyword('break');
      var lookahead = this.peek();
      var label = null;
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
  }, {
    key: "enforestTryStatement",
    value: function enforestTryStatement() {
      this.matchKeyword('try');
      var body = this.enforestBlock();
      if (this.isKeyword(this.peek(), 'catch')) {
        var catchClause = this.enforestCatchClause();
        if (this.isKeyword(this.peek(), 'finally')) {
          this.advance();
          var finalizer = this.enforestBlock();
          return new _terms2.default('TryFinallyStatement', {
            body: body, catchClause: catchClause, finalizer: finalizer
          });
        }
        return new _terms2.default('TryCatchStatement', { body: body, catchClause: catchClause });
      }
      if (this.isKeyword(this.peek(), 'finally')) {
        this.advance();
        var finalizer = this.enforestBlock();
        return new _terms2.default('TryFinallyStatement', { body: body, catchClause: null, finalizer: finalizer });
      }
      throw this.createError(this.peek(), 'try with no catch or finally');
    }
  }, {
    key: "enforestCatchClause",
    value: function enforestCatchClause() {
      this.matchKeyword('catch');
      var bindingParens = this.matchParens();
      var enf = new Enforester(bindingParens, (0, _immutable.List)(), this.context);
      var binding = enf.enforestBindingTarget();
      var body = this.enforestBlock();
      return new _terms2.default('CatchClause', { binding: binding, body: body });
    }
  }, {
    key: "enforestThrowStatement",
    value: function enforestThrowStatement() {
      this.matchKeyword('throw');
      var expression = this.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default('ThrowStatement', { expression: expression });
    }
  }, {
    key: "enforestWithStatement",
    value: function enforestWithStatement() {
      this.matchKeyword('with');
      var objParens = this.matchParens();
      var enf = new Enforester(objParens, (0, _immutable.List)(), this.context);
      var object = enf.enforestExpression();
      var body = this.enforestStatement();
      return new _terms2.default('WithStatement', { object: object, body: body });
    }
  }, {
    key: "enforestDebuggerStatement",
    value: function enforestDebuggerStatement() {
      this.matchKeyword('debugger');

      return new _terms2.default('DebuggerStatement', {});
    }
  }, {
    key: "enforestDoStatement",
    value: function enforestDoStatement() {
      this.matchKeyword('do');
      var body = this.enforestStatement();
      this.matchKeyword('while');
      var testBody = this.matchParens();
      var enf = new Enforester(testBody, (0, _immutable.List)(), this.context);
      var test = enf.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default('DoWhileStatement', { body: body, test: test });
    }
  }, {
    key: "enforestContinueStatement",
    value: function enforestContinueStatement() {
      var kwd = this.matchKeyword('continue');
      var lookahead = this.peek();
      var label = null;
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
  }, {
    key: "enforestSwitchStatement",
    value: function enforestSwitchStatement() {
      this.matchKeyword('switch');
      var cond = this.matchParens();
      var enf = new Enforester(cond, (0, _immutable.List)(), this.context);
      var discriminant = enf.enforestExpression();
      var body = this.matchCurlies();

      if (body.size === 0) {
        return new _terms2.default('SwitchStatement', {
          discriminant: discriminant,
          cases: (0, _immutable.List)()
        });
      }
      enf = new Enforester(body, (0, _immutable.List)(), this.context);
      var cases = enf.enforestSwitchCases();
      var lookahead = enf.peek();
      if (enf.isKeyword(lookahead, 'default')) {
        var defaultCase = enf.enforestSwitchDefault();
        var postDefaultCases = enf.enforestSwitchCases();
        return new _terms2.default('SwitchStatementWithDefault', {
          discriminant: discriminant,
          preDefaultCases: cases,
          defaultCase: defaultCase,
          postDefaultCases: postDefaultCases
        });
      }
      return new _terms2.default('SwitchStatement', { discriminant: discriminant, cases: cases });
    }
  }, {
    key: "enforestSwitchCases",
    value: function enforestSwitchCases() {
      var cases = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default'))) {
        cases.push(this.enforestSwitchCase());
      }
      return (0, _immutable.List)(cases);
    }
  }, {
    key: "enforestSwitchCase",
    value: function enforestSwitchCase() {
      this.matchKeyword('case');
      return new _terms2.default('SwitchCase', {
        test: this.enforestExpression(),
        consequent: this.enforestSwitchCaseBody()
      });
    }
  }, {
    key: "enforestSwitchCaseBody",
    value: function enforestSwitchCaseBody() {
      this.matchPunctuator(':');
      return this.enforestStatementListInSwitchCaseBody();
    }
  }, {
    key: "enforestStatementListInSwitchCaseBody",
    value: function enforestStatementListInSwitchCaseBody() {
      var result = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), 'default') || this.isKeyword(this.peek(), 'case'))) {
        result.push(this.enforestStatementListItem());
      }
      return (0, _immutable.List)(result);
    }
  }, {
    key: "enforestSwitchDefault",
    value: function enforestSwitchDefault() {
      this.matchKeyword('default');
      return new _terms2.default('SwitchDefault', {
        consequent: this.enforestSwitchCaseBody()
      });
    }
  }, {
    key: "enforestForStatement",
    value: function enforestForStatement() {
      this.matchKeyword('for');
      var cond = this.matchParens();
      var enf = new Enforester(cond, (0, _immutable.List)(), this.context);
      var lookahead = undefined,
          test = undefined,
          init = undefined,
          right = undefined,
          type = undefined,
          left = undefined,
          update = undefined;

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
              var kind = enf.advance();
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
  }, {
    key: "enforestIfStatement",
    value: function enforestIfStatement() {
      this.matchKeyword('if');
      var cond = this.matchParens();
      var enf = new Enforester(cond, (0, _immutable.List)(), this.context);
      var lookahead = enf.peek();
      var test = enf.enforestExpression();
      if (test === null) {
        throw enf.createError(lookahead, 'expecting an expression');
      }
      var consequent = this.enforestStatement();
      var alternate = null;
      if (this.isKeyword(this.peek(), 'else')) {
        this.advance();
        alternate = this.enforestStatement();
      }
      return new _terms2.default('IfStatement', { test: test, consequent: consequent, alternate: alternate });
    }
  }, {
    key: "enforestWhileStatement",
    value: function enforestWhileStatement() {
      this.matchKeyword('while');
      var cond = this.matchParens();
      var enf = new Enforester(cond, (0, _immutable.List)(), this.context);
      var lookahead = enf.peek();
      var test = enf.enforestExpression();
      if (test === null) {
        throw enf.createError(lookahead, 'expecting an expression');
      }
      var body = this.enforestStatement();

      return new _terms2.default('WhileStatement', { test: test, body: body });
    }
  }, {
    key: "enforestBlockStatement",
    value: function enforestBlockStatement() {
      return new _terms2.default('BlockStatement', {
        block: this.enforestBlock()
      });
    }
  }, {
    key: "enforestBlock",
    value: function enforestBlock() {
      var b = this.matchCurlies();
      var body = [];
      var enf = new Enforester(b, (0, _immutable.List)(), this.context);

      while (enf.rest.size !== 0) {
        var lookahead = enf.peek();
        var stmt = enf.enforestStatement();
        if (stmt == null) {
          throw enf.createError(lookahead, 'not a statement');
        }
        body.push(stmt);
      }

      return new _terms2.default('Block', {
        statements: (0, _immutable.List)(body)
      });
    }
  }, {
    key: "enforestClass",
    value: function enforestClass(_ref) {
      var isExpr = _ref.isExpr;

      this.advance();
      var name = this.enforestBindingIdentifier();
      this.advance();
      return new _terms2.default("ClassDeclaration", {
        name: name,
        elements: (0, _immutable.List)()
      });
    }
  }, {
    key: "enforestBindingTarget",
    value: function enforestBindingTarget() {
      var lookahead = this.peek();
      if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
        return this.enforestBindingIdentifier();
      }
      throw "not implemented yet";
    }
  }, {
    key: "enforestBindingIdentifier",
    value: function enforestBindingIdentifier() {
      return new _terms2.default("BindingIdentifier", {
        name: this.enforestIdentifier()
      });
    }
  }, {
    key: "enforestIdentifier",
    value: function enforestIdentifier() {
      var lookahead = this.peek();
      if (this.isIdentifier(lookahead) || this.isKeyword(lookahead)) {
        return this.advance();
      }
      throw this.createError(lookahead, "expecting an identifier");
    }
  }, {
    key: "enforestReturnStatement",
    value: function enforestReturnStatement() {
      var kw = this.advance();
      var lookahead = this.peek();

      // short circuit for the empty expression case
      if (this.rest.size === 0 || lookahead && !this.lineNumberEq(kw, lookahead)) {
        return new _terms2.default("ReturnStatement", {
          expression: null
        });
      }

      var term = null;
      if (!this.isPunctuator(lookahead, ';')) {
        term = this.enforestExpression();
        (0, _errors.expect)(term != null, "Expecting an expression to follow return keyword", lookahead, this.rest);
      }

      this.consumeSemicolon();
      return new _terms2.default("ReturnStatement", {
        expression: term
      });
    }
  }, {
    key: "enforestVariableDeclaration",
    value: function enforestVariableDeclaration() {
      var kind = undefined;
      var lookahead = this.advance();
      var kindSyn = lookahead;

      if (kindSyn && this.context.env.get(kindSyn.resolve()) === _transforms.VariableDeclTransform) {
        kind = "var";
      } else if (kindSyn && this.context.env.get(kindSyn.resolve()) === _transforms.LetDeclTransform) {
        kind = "let";
      } else if (kindSyn && this.context.env.get(kindSyn.resolve()) === _transforms.ConstDeclTransform) {
        kind = "const";
      } else if (kindSyn && this.context.env.get(kindSyn.resolve()) === _transforms.SyntaxDeclTransform) {
        kind = "syntax";
      } else if (kindSyn && this.context.env.get(kindSyn.resolve()) === _transforms.SyntaxrecDeclTransform) {
        kind = "syntaxrec";
      }

      var decls = (0, _immutable.List)();

      while (true) {
        var term = this.enforestVariableDeclarator();
        var _lookahead = this.peek();
        decls = decls.concat(term);

        if (this.isPunctuator(_lookahead, ",")) {
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
  }, {
    key: "enforestVariableDeclarator",
    value: function enforestVariableDeclarator() {
      var id = this.enforestBindingTarget();
      var lookahead = this.peek();

      var init = undefined,
          rest = undefined;
      if (this.isPunctuator(lookahead, '=')) {
        this.advance();
        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
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
  }, {
    key: "enforestExpressionStatement",
    value: function enforestExpressionStatement() {
      var start = this.rest.get(0);
      var expr = this.enforestExpression();
      if (expr === null) {
        throw this.createError(start, "not a valid expression");
      }
      this.consumeSemicolon();

      return new _terms2.default("ExpressionStatement", {
        expression: expr
      });
    }
  }, {
    key: "enforestExpression",
    value: function enforestExpression() {
      var left = this.enforestExpressionLoop();
      var lookahead = this.peek();
      if (this.isPunctuator(lookahead, ',')) {
        while (this.rest.size !== 0) {
          if (!this.isPunctuator(this.peek(), ',')) {
            break;
          }
          var operator = this.advance();
          var right = this.enforestExpressionLoop();
          left = new _terms2.default('BinaryExpression', { left: left, operator: operator, right: right });
        }
      }
      this.term = null;
      return left;
    }
  }, {
    key: "enforestExpressionLoop",
    value: function enforestExpressionLoop() {
      this.term = null;
      this.opCtx = {
        prec: 0,
        combine: function combine(x) {
          return x;
        },
        stack: (0, _immutable.List)()
      };

      do {
        var term = this.enforestAssignmentExpression();
        // no change means we've done as much enforesting as possible
        // if nothing changed, maybe we just need to pop the expr stack
        if (term === EXPR_LOOP_NO_CHANGE && this.opCtx.stack.size > 0) {
          this.term = this.opCtx.combine(this.term);

          var _opCtx$stack$last = this.opCtx.stack.last();

          var prec = _opCtx$stack$last.prec;
          var combine = _opCtx$stack$last.combine;

          this.opCtx.prec = prec;
          this.opCtx.combine = combine;
          this.opCtx.stack = this.opCtx.stack.pop();
        } else if (term === EXPR_LOOP_NO_CHANGE) {
          break;
          // operator means an opCtx was pushed on the stack
        } else if (term === EXPR_LOOP_OPERATOR) {
            this.term = null;
          } else {
            this.term = term;
          }
      } while (true); // get a fixpoint
      return this.term;
    }
  }, {
    key: "enforestAssignmentExpression",
    value: function enforestAssignmentExpression() {
      var lookahead = this.peek();

      if (this.term === null && this.isTerm(lookahead)) {
        // TODO: check that this is actually an expression
        return this.advance();
      }

      if (this.term === null && this.isCompiletimeTransform(lookahead)) {
        var term = this.expandMacro("expression");
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

      if (this.term === null && this.isNewTransform(lookahead)) {
        return this.enforestNewExpression();
      }

      // $x:ThisExpression
      if (this.term === null && this.isKeyword(lookahead, "this")) {
        return new _terms2.default("ThisExpression", {
          stx: this.advance()
        });
      }
      // $x:ident
      if (this.term === null && this.isIdentifier(lookahead)) {
        return new _terms2.default("IdentifierExpression", {
          name: this.advance()
        });
      }
      if (this.term === null && this.isNumericLiteral(lookahead)) {
        var num = this.advance();
        if (num.val() === 1 / 0) {
          return new _terms2.default('LiteralInfinityExpression', {});
        }
        return new _terms2.default("LiteralNumericExpression", {
          value: num
        });
      }
      if (this.term === null && this.isStringLiteral(lookahead)) {
        return new _terms2.default("LiteralStringExpression", {
          value: this.advance()
        });
      }
      if (this.term === null && this.isTemplate(lookahead)) {
        return new _terms2.default('TemplateExpression', {
          tag: null,
          elements: this.enforestTemplateElements()
        });
      }
      if (this.term === null && this.isBooleanLiteral(lookahead)) {
        return new _terms2.default("LiteralBooleanExpression", {
          value: this.advance()
        });
      }
      if (this.term === null && this.isNullLiteral(lookahead)) {
        this.advance();
        return new _terms2.default("LiteralNullExpression", {});
      }
      if (this.term === null && this.isRegularExpression(lookahead)) {
        var reStx = this.advance();
        return new _terms2.default("LiteralRegExpExpression", {
          pattern: reStx.token.regex.pattern,
          flags: reStx.token.regex.flags
        });
      }
      // ($x:expr)
      if (this.term === null && this.isParens(lookahead)) {
        return new _terms2.default("ParenthesizedExpression", {
          inner: this.advance().inner()
        });
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
      if (this.term && this.isPunctuator(lookahead, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        return this.enforestStaticMemberExpression();
      }
      // $x:expr [ $b:expr ]
      if (this.term && this.isBrackets(lookahead)) {
        return this.enforestComputedMemberExpression();
      }
      // $x:expr (...)
      if (this.term && this.isParens(lookahead)) {
        var paren = this.advance();
        return new _terms2.default("CallExpression", {
          callee: this.term,
          arguments: paren.inner()
        });
      }
      // $x:id `...`
      if (this.term && this.isTemplate(lookahead)) {
        return new _terms2.default('TemplateExpression', {
          tag: this.term,
          elements: this.enforestTemplateElements()
        });
      }
      // $x:expr = $init:expr
      if (this.term && this.isPunctuator(lookahead, "=")) {
        var binding = this.transformDestructuring(this.term);
        var op = this.advance();

        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        var init = enf.enforest("expression");
        this.rest = enf.rest;

        return new _terms2.default("AssignmentExpression", {
          binding: binding,
          expression: init
        });
      }

      return EXPR_LOOP_NO_CHANGE;
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword('new');
      var callee = undefined;
      if (this.isKeyword(this.peek(), 'new')) {
        callee = this.enforestNewExpression();
      } else {
        callee = new _terms2.default('IdentifierExpression', { name: this.enforestIdentifier() });
      }
      var args = undefined;
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
  }, {
    key: "enforestComputedMemberExpression",
    value: function enforestComputedMemberExpression() {
      var enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      return new _terms2.default('ComputedMemberExpression', {
        object: this.term,
        expression: enf.enforestExpression()
      });
    }
  }, {
    key: "transformDestructuring",
    value: function transformDestructuring(term) {
      switch (term.type) {
        case 'IdentifierExpression':
          return new _terms2.default('BindingIdentifier', { name: term.name });

        case 'ParenthesizedExpression':
          if (term.inner.size === 1 && this.isIdentifier(term.inner.get(0))) {
            return new _terms2.default('BindingIdentifier', { name: term.inner.get(0) });
          }
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
  }, {
    key: "enforestArrowExpression",
    value: function enforestArrowExpression() {
      var enf = undefined;
      if (this.isIdentifier(this.peek())) {
        enf = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params = enf.enforestFormalParameters();
      this.matchPunctuator('=>');

      var body = undefined;
      if (this.isBraces(this.peek())) {
        body = this.matchCurlies();
      } else {
        enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        body = enf.enforestExpressionLoop();
        this.rest = enf.rest;
      }
      return new _terms2.default('ArrowExpression', { params: params, body: body });
    }
  }, {
    key: "enforestYieldExpression",
    value: function enforestYieldExpression() {
      var kwd = this.matchKeyword('yield');
      var lookahead = this.peek();

      if (this.rest.size === 0 || lookahead && !this.lineNumberEq(kwd, lookahead)) {
        return new _terms2.default('YieldExpression', {
          expression: null
        });
      } else {
        var expr = this.enforestExpression();
        return new _terms2.default('YieldExpression', {
          expression: expr
        });
      }
    }
  }, {
    key: "enforestSyntaxTemplate",
    value: function enforestSyntaxTemplate() {
      return new _terms2.default('SyntaxTemplate', {
        template: this.advance()
      });
    }
  }, {
    key: "enforestSyntaxQuote",
    value: function enforestSyntaxQuote() {
      var name = this.advance();
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
  }, {
    key: "enforestStaticMemberExpression",
    value: function enforestStaticMemberExpression() {
      var object = this.term;
      var dot = this.advance();
      var property = this.advance();

      return new _terms2.default("StaticMemberExpression", {
        object: object,
        property: property
      });
    }
  }, {
    key: "enforestArrayExpression",
    value: function enforestArrayExpression() {
      var arr = this.advance();

      var elements = (0, _immutable.List)();

      var enf = new Enforester(arr.inner(), (0, _immutable.List)(), this.context);

      while (enf.rest.size > 0) {
        var lookahead = enf.peek();
        if (enf.isPunctuator(lookahead, ",")) {
          enf.advance();
          elements = elements.concat(null);
        } else {
          var term = enf.enforestExpressionLoop();
          elements = elements.concat(term);
          enf.consumeComma();
        }
      }

      return new _terms2.default("ArrayExpression", {
        elements: elements
      });
    }
  }, {
    key: "enforestObjectExpression",
    value: function enforestObjectExpression() {
      var obj = this.advance();

      var properties = (0, _immutable.List)();

      var enf = new Enforester(obj.inner(), (0, _immutable.List)(), this.context);

      var lastProp = null;
      while (enf.rest.size > 0) {
        var prop = enf.enforestProperty();
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
  }, {
    key: "enforestProperty",
    value: function enforestProperty() {
      var key = this.advance();
      var colon = this.matchPunctuator(":");

      var value = this.enforestExpressionLoop();
      this.consumeComma();

      var name = new _terms2.default("StaticPropertyName", {
        value: key
      });

      return new _terms2.default("DataProperty", {
        name: name,
        expression: value
      });
    }
  }, {
    key: "enforestFunctionExpression",
    value: function enforestFunctionExpression() {
      var name = null,
          params = undefined,
          body = undefined,
          rest = undefined;
      var isGenerator = false;
      // eat the function keyword
      this.advance();
      var lookahead = this.peek();

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

      var enf = new Enforester(params, (0, _immutable.List)(), this.context);
      var formalParams = enf.enforestFormalParameters();

      return new _terms2.default("FunctionExpression", {
        name: name,
        isGenerator: isGenerator,
        params: formalParams,
        body: body
      });
    }
  }, {
    key: "enforestFunctionDeclaration",
    value: function enforestFunctionDeclaration() {
      var name = undefined,
          params = undefined,
          body = undefined,
          rest = undefined;
      var isGenerator = false;
      // eat the function keyword
      this.advance();
      var lookahead = this.peek();

      if (this.isPunctuator(lookahead, "*")) {
        isGenerator = true;
        this.advance();
      }

      name = this.enforestBindingIdentifier();

      params = this.matchParens();
      body = this.matchCurlies();

      var enf = new Enforester(params, (0, _immutable.List)(), this.context);
      var formalParams = enf.enforestFormalParameters();

      return new _terms2.default("FunctionDeclaration", {
        name: name,
        isGenerator: isGenerator,
        params: formalParams,
        body: body
      });
    }
  }, {
    key: "enforestFormalParameters",
    value: function enforestFormalParameters() {
      var items = [];
      while (this.rest.size !== 0) {
        var lookahead = this.peek();

        if (this.isIdentifier(lookahead)) {
          items.push(this.enforestBindingIdentifier());
        } else if (this.isPunctuator(lookahead, ",")) {
          this.advance();
        } else {
          (0, _errors.assert)(false, "not implemented yet");
        }
      }
      return new _terms2.default("FormalParameters", {
        items: (0, _immutable.List)(items),
        rest: null
      });
    }
  }, {
    key: "enforestUpdateExpression",
    value: function enforestUpdateExpression() {
      var operator = this.matchUnaryOperator();

      return new _terms2.default('UpdateExpression', {
        isPrefix: false,
        operator: operator.val(),
        operand: this.transformDestructuring(this.term)
      });
    }
  }, {
    key: "enforestUnaryExpression",
    value: function enforestUnaryExpression() {
      var _this = this;

      var operator = this.matchUnaryOperator();
      this.opCtx.stack = this.opCtx.stack.push({
        prec: this.opCtx.prec,
        combind: this.opCtx.combine
      });
      // TODO: all builtins are 14, custom operators will change this
      this.opCtx.prec = 14;
      this.opCtx.combine = function (rightTerm) {
        var type = undefined,
            term = undefined,
            isPrefix = undefined;
        if (operator.val() === '++' || operator.val() === '--') {
          type = 'UpdateExpression';
          term = _this.transformDestructuring(rightTerm);
          isPrefix = true;
        } else {
          type = 'UnaryExpression';
          isPrefix = undefined;
          term = rightTerm;
        }
        return new _terms2.default(type, {
          operator: operator.val(),
          operand: term,
          isPrefix: isPrefix
        });
      };
      return EXPR_LOOP_OPERATOR;
    }
  }, {
    key: "enforestBinaryExpression",
    value: function enforestBinaryExpression() {

      var leftTerm = this.term;
      var opStx = this.peek();
      var op = opStx.val();
      var opPrec = (0, _operators.getOperatorPrec)(op);
      var opAssoc = (0, _operators.getOperatorAssoc)(op);

      if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec, opAssoc)) {
        this.opCtx.stack = this.opCtx.stack.push({
          prec: this.opCtx.prec,
          combine: this.opCtx.combine
        });
        this.opCtx.prec = opPrec;
        this.opCtx.combine = function (rightTerm) {
          return new _terms2.default("BinaryExpression", {
            left: leftTerm,
            operator: opStx,
            right: rightTerm
          });
        };
        this.advance();
        return EXPR_LOOP_OPERATOR;
      } else {
        var term = this.opCtx.combine(leftTerm);
        // this.rest does not change

        var _opCtx$stack$last2 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last2.prec;
        var combine = _opCtx$stack$last2.combine;

        this.opCtx.stack = this.opCtx.stack.pop();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        return term;
      }
    }
  }, {
    key: "enforestTemplateElements",
    value: function enforestTemplateElements() {
      var _this2 = this;

      var lookahead = this.matchTemplate();
      var elements = lookahead.token.items.map(function (it) {
        if (it instanceof _syntax2.default && it.isDelimiter()) {
          var enf = new Enforester(it.inner(), (0, _immutable.List)(), _this2.context);
          return enf.enforest("expression");
        }
        return new _terms2.default('TemplateElement', {
          rawValue: it.slice.text
        });
      });
      return elements;
    }
  }, {
    key: "expandMacro",
    value: function expandMacro(enforestType) {
      var _this3 = this;

      var name = this.advance();

      var syntaxTransform = this.getCompiletimeTransform(name);
      if (syntaxTransform == null || typeof syntaxTransform.value !== "function") {
        throw this.createError(name, "the macro name was not bound to a value that could be invoked");
      }
      var useSiteScope = (0, _scope.freshScope)("u");
      var introducedScope = (0, _scope.freshScope)("i");
      // TODO: needs to be a list of scopes I think
      this.context.useScope = useSiteScope;

      var ctx = new _macroContext2.default(this, name, this.context, useSiteScope, introducedScope);

      var result = syntaxTransform.value.call(null, ctx);
      if (Array.isArray(result)) {
        result = (0, _immutable.List)(result);
      }
      if (!_immutable.List.isList(result)) {
        throw this.createError(name, "macro must return a list but got: " + result);
      }
      result = result.map(function (stx) {
        if (!(stx && typeof stx.addScope === 'function')) {
          throw _this3.createError(name, 'macro must return syntax objects or terms but got: ' + stx);
        }
        return stx.addScope(introducedScope, _this3.context.bindings, { flip: true });
      });

      // enforesting result to handle precedence issues
      // (this surrounds macro results with implicit parens)
      var enf = new Enforester(result, (0, _immutable.List)(), this.context);
      var term = undefined;
      try {
        term = enf.enforest(enforestType);
      } catch (e) {
        // TODO: this might be a problem, can we really force this invariant on macro expansion?
        // but how would we enforce the parenthesization problem otherwise?
        throw this.createError(name, "macro must expand to valid syntax");
      }

      this.rest = enf.rest.concat(this.rest);

      return term;
    }
  }, {
    key: "consumeSemicolon",
    value: function consumeSemicolon() {
      var lookahead = this.peek();

      if (lookahead && this.isPunctuator(lookahead, ";")) {
        this.advance();
      }
    }
  }, {
    key: "consumeComma",
    value: function consumeComma() {
      var lookahead = this.peek();

      if (lookahead && this.isPunctuator(lookahead, ',')) {
        this.advance();
      }
    }
  }, {
    key: "isTerm",
    value: function isTerm(term) {
      return term && term instanceof _terms2.default;
    }
  }, {
    key: "isEOF",
    value: function isEOF(term) {
      return term && term instanceof _syntax2.default && term.isEOF();
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(term) {
      var val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term && term instanceof _syntax2.default && term.isIdentifier() && (val === null || term.val() === val);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(term) {
      return term && term instanceof _syntax2.default && term.isNumericLiteral();
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(term) {
      return term && term instanceof _syntax2.default && term.isStringLiteral();
    }
  }, {
    key: "isTemplate",
    value: function isTemplate(term) {
      return term && term instanceof _syntax2.default && term.isTemplate();
    }
  }, {
    key: "isBooleanLiteral",
    value: function isBooleanLiteral(term) {
      return term && term instanceof _syntax2.default && term.isBooleanLiteral();
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(term) {
      return term && term instanceof _syntax2.default && term.isNullLiteral();
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(term) {
      return term && term instanceof _syntax2.default && term.isRegularExpression();
    }
  }, {
    key: "isParens",
    value: function isParens(term) {
      return term && term instanceof _syntax2.default && term.isParens();
    }
  }, {
    key: "isBraces",
    value: function isBraces(term) {
      return term && term instanceof _syntax2.default && term.isBraces();
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(term) {
      return term && term instanceof _syntax2.default && term.isBrackets();
    }
  }, {
    key: "isKeyword",
    value: function isKeyword(term) {
      var val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term && term instanceof _syntax2.default && term.isKeyword() && (val === null || term.val() === val);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(term) {
      var val = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term && term instanceof _syntax2.default && term.isPunctuator() && (val === null || term.val() === val);
    }
  }, {
    key: "isOperator",
    value: function isOperator(term) {
      return term && term instanceof _syntax2.default && (0, _operators.isOperator)(term);
    }
  }, {
    key: "isUpdateOperator",
    value: function isUpdateOperator(term) {
      return term && term instanceof _syntax2.default && term.isPunctuator() && (term.val() === '++' || term.val() === '--');
    }
  }, {
    key: "isFnDeclTransform",
    value: function isFnDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.FunctionDeclTransform;
    }
  }, {
    key: "isVarDeclTransform",
    value: function isVarDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.VariableDeclTransform;
    }
  }, {
    key: "isLetDeclTransform",
    value: function isLetDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.LetDeclTransform;
    }
  }, {
    key: "isConstDeclTransform",
    value: function isConstDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.ConstDeclTransform;
    }
  }, {
    key: "isSyntaxDeclTransform",
    value: function isSyntaxDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.SyntaxDeclTransform;
    }
  }, {
    key: "isSyntaxrecDeclTransform",
    value: function isSyntaxrecDeclTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.SyntaxrecDeclTransform;
    }
  }, {
    key: "isSyntaxTemplate",
    value: function isSyntaxTemplate(term) {
      return term && term instanceof _syntax2.default && term.isSyntaxTemplate();
    }
  }, {
    key: "isSyntaxQuoteTransform",
    value: function isSyntaxQuoteTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.SyntaxQuoteTransform;
    }
  }, {
    key: "isReturnStmtTransform",
    value: function isReturnStmtTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.ReturnStatementTransform;
    }
  }, {
    key: "isWhileTransform",
    value: function isWhileTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.WhileTransform;
    }
  }, {
    key: "isForTransform",
    value: function isForTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.ForTransform;
    }
  }, {
    key: "isSwitchTransform",
    value: function isSwitchTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.SwitchTransform;
    }
  }, {
    key: "isBreakTransform",
    value: function isBreakTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.BreakTransform;
    }
  }, {
    key: "isContinueTransform",
    value: function isContinueTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.ContinueTransform;
    }
  }, {
    key: "isDoTransform",
    value: function isDoTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.DoTransform;
    }
  }, {
    key: "isDebuggerTransform",
    value: function isDebuggerTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.DebuggerTransform;
    }
  }, {
    key: "isWithTransform",
    value: function isWithTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.WithTransform;
    }
  }, {
    key: "isTryTransform",
    value: function isTryTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.TryTransform;
    }
  }, {
    key: "isThrowTransform",
    value: function isThrowTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.ThrowTransform;
    }
  }, {
    key: "isIfTransform",
    value: function isIfTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.IfTransform;
    }
  }, {
    key: "isNewTransform",
    value: function isNewTransform(term) {
      return term && term instanceof _syntax2.default && this.context.env.get(term.resolve()) === _transforms.NewTransform;
    }
  }, {
    key: "isCompiletimeTransform",
    value: function isCompiletimeTransform(term) {
      return term && term instanceof _syntax2.default && (this.context.env.get(term.resolve()) instanceof _transforms.CompiletimeTransform || this.context.store.get(term.resolve()) instanceof _transforms.CompiletimeTransform);
    }
  }, {
    key: "getCompiletimeTransform",
    value: function getCompiletimeTransform(term) {
      if (this.context.env.has(term.resolve())) {
        return this.context.env.get(term.resolve());
      }
      return this.context.store.get(term.resolve());
    }
  }, {
    key: "lineNumberEq",
    value: function lineNumberEq(a, b) {
      if (!(a && b)) {
        return false;
      }
      (0, _errors.assert)(a instanceof _syntax2.default, "expecting a syntax object");
      (0, _errors.assert)(b instanceof _syntax2.default, "expecting a syntax object");
      return a.lineNumber() === b.lineNumber();
    }
  }, {
    key: "matchIdentifier",
    value: function matchIdentifier(val) {
      var lookahead = this.advance();
      if (this.isIdentifier(lookahead)) {
        return lookahead;
      }
      throw this.createError(lookahead, "expecting an identifier");
    }
  }, {
    key: "matchKeyword",
    value: function matchKeyword(val) {
      var lookahead = this.advance();
      if (this.isKeyword(lookahead, val)) {
        return lookahead;
      }
      throw this.createError(lookahead, 'expecting ' + val);
    }
  }, {
    key: "matchLiteral",
    value: function matchLiteral() {
      var lookahead = this.advance();
      if (this.isNumericLiteral(lookahead) || this.isStringLiteral(lookahead) || this.isBooleanLiteral(lookahead) || this.isNullLiteral(lookahead) || this.isTemplate(lookahead) || this.isRegularExpression(lookahead)) {
        return lookahead;
      }
      throw this.createError(lookahead, "expecting a literal");
    }
  }, {
    key: "matchStringLiteral",
    value: function matchStringLiteral() {
      var lookahead = this.advance();
      if (this.isStringLiteral(lookahead)) {
        return lookahead;
      }
      throw this.createError(lookahead, 'expecting a string literal');
    }
  }, {
    key: "matchTemplate",
    value: function matchTemplate() {
      var lookahead = this.advance();
      if (this.isTemplate(lookahead)) {
        return lookahead;
      }
      throw this.createError(lookahead, 'expecting a template literal');
    }
  }, {
    key: "matchParens",
    value: function matchParens() {
      var lookahead = this.advance();
      if (this.isParens(lookahead)) {
        return lookahead.inner();
      }
      throw this.createError(lookahead, "expecting parens");
    }
  }, {
    key: "matchCurlies",
    value: function matchCurlies() {
      var lookahead = this.advance();
      if (this.isBraces(lookahead)) {
        return lookahead.inner();
      }
      throw this.createError(lookahead, "expecting curly braces");
    }
  }, {
    key: "matchSquares",
    value: function matchSquares() {
      var lookahead = this.advance();
      if (this.isBrackets(lookahead)) {
        return lookahead.inner();
      }
      throw this.createError(lookahead, "expecting sqaure braces");
    }
  }, {
    key: "matchUnaryOperator",
    value: function matchUnaryOperator() {
      var lookahead = this.advance();
      if ((0, _operators.isUnaryOperator)(lookahead)) {
        return lookahead;
      }
      throw this.createError(lookahead, "expecting a unary operator");
    }
  }, {
    key: "matchPunctuator",
    value: function matchPunctuator(val) {
      var lookahead = this.advance();
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
  }, {
    key: "createError",
    value: function createError(stx, message) {
      var ctx = "";
      var offending = stx;
      if (this.rest.size > 0) {
        ctx = this.rest.slice(0, 20).map(function (term) {
          if (term.isDelimiter()) {
            return term.inner();
          }
          return _immutable.List.of(term);
        }).flatten().map(function (s) {
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
  }]);

  return Enforester;
}();
//# sourceMappingURL=enforester.js.map
