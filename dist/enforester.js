"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enforester = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EXPR_LOOP_OPERATOR_26 = {};
var EXPR_LOOP_NO_CHANGE_27 = {};
var EXPR_LOOP_EXPANSION_28 = {};

var Enforester = exports.Enforester = function () {
  function Enforester(stxl_29, prev_30, context_31) {
    _classCallCheck(this, Enforester);

    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl_29), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev_30), "expecting a list of terms to enforest");
    (0, _errors.assert)(context_31, "expecting a context to enforest");
    this.term = null;
    this.rest = stxl_29;
    this.prev = prev_30;
    this.context = context_31;
  }

  _createClass(Enforester, [{
    key: "peek",
    value: function peek() {
      var n_32 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this.rest.get(n_32);
    }
  }, {
    key: "advance",
    value: function advance() {
      var ret_33 = this.rest.first();
      this.rest = this.rest.rest();
      return ret_33;
    }
  }, {
    key: "enforest",
    value: function enforest() {
      var type_34 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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
      var result_35 = void 0;
      if (type_34 === "expression") {
        result_35 = this.enforestExpressionLoop();
      } else {
        result_35 = this.enforestModule();
      }
      if (this.rest.size === 0) {
        this.done = true;
      }
      return result_35;
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
      var lookahead_36 = this.peek();
      if (this.isKeyword(lookahead_36, "import")) {
        this.advance();
        return this.enforestImportDeclaration();
      } else if (this.isKeyword(lookahead_36, "export")) {
        this.advance();
        return this.enforestExportDeclaration();
      }
      return this.enforestStatement();
    }
  }, {
    key: "enforestExportDeclaration",
    value: function enforestExportDeclaration() {
      var lookahead_37 = this.peek();
      if (this.isPunctuator(lookahead_37, "*")) {
        this.advance();
        var moduleSpecifier = this.enforestFromClause();
        return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
      } else if (this.isBraces(lookahead_37)) {
        var namedExports = this.enforestExportClause();
        var _moduleSpecifier = null;
        if (this.isIdentifier(this.peek(), "from")) {
          _moduleSpecifier = this.enforestFromClause();
        }
        return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: _moduleSpecifier });
      } else if (this.isKeyword(lookahead_37, "class")) {
        return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
      } else if (this.isFnDeclTransform(lookahead_37)) {
        return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
      } else if (this.isKeyword(lookahead_37, "default")) {
        this.advance();
        if (this.isFnDeclTransform(this.peek())) {
          return new _terms2.default("ExportDefault", { body: this.enforestFunction({ isExpr: false, inDefault: true }) });
        } else if (this.isKeyword(this.peek(), "class")) {
          return new _terms2.default("ExportDefault", { body: this.enforestClass({ isExpr: false, inDefault: true }) });
        } else {
          var body = this.enforestExpressionLoop();
          this.consumeSemicolon();
          return new _terms2.default("ExportDefault", { body: body });
        }
      } else if (this.isVarDeclTransform(lookahead_37) || this.isLetDeclTransform(lookahead_37) || this.isConstDeclTransform(lookahead_37) || this.isSyntaxrecDeclTransform(lookahead_37) || this.isSyntaxDeclTransform(lookahead_37)) {
        return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
      }
      throw this.createError(lookahead_37, "unexpected syntax");
    }
  }, {
    key: "enforestExportClause",
    value: function enforestExportClause() {
      var enf_38 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var result_39 = [];
      while (enf_38.rest.size !== 0) {
        result_39.push(enf_38.enforestExportSpecifier());
        enf_38.consumeComma();
      }
      return (0, _immutable.List)(result_39);
    }
  }, {
    key: "enforestExportSpecifier",
    value: function enforestExportSpecifier() {
      var name_40 = this.enforestIdentifier();
      if (this.isIdentifier(this.peek(), "as")) {
        this.advance();
        var exportedName = this.enforestIdentifier();
        return new _terms2.default("ExportSpecifier", { name: name_40, exportedName: exportedName });
      }
      return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_40 });
    }
  }, {
    key: "enforestImportDeclaration",
    value: function enforestImportDeclaration() {
      var lookahead_41 = this.peek();
      var defaultBinding_42 = null;
      var namedImports_43 = (0, _immutable.List)();
      var forSyntax_44 = false;
      if (this.isStringLiteral(lookahead_41)) {
        var moduleSpecifier = this.advance();
        this.consumeSemicolon();
        return new _terms2.default("Import", { defaultBinding: defaultBinding_42, namedImports: namedImports_43, moduleSpecifier: moduleSpecifier });
      }
      if (this.isIdentifier(lookahead_41) || this.isKeyword(lookahead_41)) {
        defaultBinding_42 = this.enforestBindingIdentifier();
        if (!this.isPunctuator(this.peek(), ",")) {
          var _moduleSpecifier2 = this.enforestFromClause();
          if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
            this.advance();
            this.advance();
            forSyntax_44 = true;
          }
          return new _terms2.default("Import", { defaultBinding: defaultBinding_42, moduleSpecifier: _moduleSpecifier2, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_44 });
        }
      }
      this.consumeComma();
      lookahead_41 = this.peek();
      if (this.isBraces(lookahead_41)) {
        var imports = this.enforestNamedImports();
        var fromClause = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_44 = true;
        }
        return new _terms2.default("Import", { defaultBinding: defaultBinding_42, forSyntax: forSyntax_44, namedImports: imports, moduleSpecifier: fromClause });
      } else if (this.isPunctuator(lookahead_41, "*")) {
        var namespaceBinding = this.enforestNamespaceBinding();
        var _moduleSpecifier3 = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_44 = true;
        }
        return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_42, forSyntax: forSyntax_44, namespaceBinding: namespaceBinding, moduleSpecifier: _moduleSpecifier3 });
      }
      throw this.createError(lookahead_41, "unexpected syntax");
    }
  }, {
    key: "enforestNamespaceBinding",
    value: function enforestNamespaceBinding() {
      this.matchPunctuator("*");
      this.matchIdentifier("as");
      return this.enforestBindingIdentifier();
    }
  }, {
    key: "enforestNamedImports",
    value: function enforestNamedImports() {
      var enf_45 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var result_46 = [];
      while (enf_45.rest.size !== 0) {
        result_46.push(enf_45.enforestImportSpecifiers());
        enf_45.consumeComma();
      }
      return (0, _immutable.List)(result_46);
    }
  }, {
    key: "enforestImportSpecifiers",
    value: function enforestImportSpecifiers() {
      var lookahead_47 = this.peek();
      var name_48 = void 0;
      if (this.isIdentifier(lookahead_47) || this.isKeyword(lookahead_47)) {
        name_48 = this.advance();
        if (!this.isIdentifier(this.peek(), "as")) {
          return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_48 }) });
        } else {
          this.matchIdentifier("as");
        }
      } else {
        throw this.createError(lookahead_47, "unexpected token in import specifier");
      }
      return new _terms2.default("ImportSpecifier", { name: name_48, binding: this.enforestBindingIdentifier() });
    }
  }, {
    key: "enforestFromClause",
    value: function enforestFromClause() {
      this.matchIdentifier("from");
      var lookahead_49 = this.matchStringLiteral();
      this.consumeSemicolon();
      return lookahead_49;
    }
  }, {
    key: "enforestStatementListItem",
    value: function enforestStatementListItem() {
      var lookahead_50 = this.peek();
      if (this.isFnDeclTransform(lookahead_50)) {
        return this.enforestFunctionDeclaration({ isExpr: false });
      } else if (this.isKeyword(lookahead_50, "class")) {
        return this.enforestClass({ isExpr: false });
      } else {
        return this.enforestStatement();
      }
    }
  }, {
    key: "enforestStatement",
    value: function enforestStatement() {
      var lookahead_51 = this.peek();
      if (this.term === null && this.isCompiletimeTransform(lookahead_51)) {
        this.rest = this.expandMacro().concat(this.rest);
        lookahead_51 = this.peek();
      }
      if (this.term === null && this.isBraces(lookahead_51)) {
        return this.enforestBlockStatement();
      }
      if (this.term === null && this.isWhileTransform(lookahead_51)) {
        return this.enforestWhileStatement();
      }
      if (this.term === null && this.isIfTransform(lookahead_51)) {
        return this.enforestIfStatement();
      }
      if (this.term === null && this.isForTransform(lookahead_51)) {
        return this.enforestForStatement();
      }
      if (this.term === null && this.isSwitchTransform(lookahead_51)) {
        return this.enforestSwitchStatement();
      }
      if (this.term === null && this.isBreakTransform(lookahead_51)) {
        return this.enforestBreakStatement();
      }
      if (this.term === null && this.isContinueTransform(lookahead_51)) {
        return this.enforestContinueStatement();
      }
      if (this.term === null && this.isDoTransform(lookahead_51)) {
        return this.enforestDoStatement();
      }
      if (this.term === null && this.isDebuggerTransform(lookahead_51)) {
        return this.enforestDebuggerStatement();
      }
      if (this.term === null && this.isWithTransform(lookahead_51)) {
        return this.enforestWithStatement();
      }
      if (this.term === null && this.isTryTransform(lookahead_51)) {
        return this.enforestTryStatement();
      }
      if (this.term === null && this.isThrowTransform(lookahead_51)) {
        return this.enforestThrowStatement();
      }
      if (this.term === null && this.isKeyword(lookahead_51, "class")) {
        return this.enforestClass({ isExpr: false });
      }
      if (this.term === null && this.isFnDeclTransform(lookahead_51)) {
        return this.enforestFunctionDeclaration();
      }
      if (this.term === null && this.isIdentifier(lookahead_51) && this.isPunctuator(this.peek(1), ":")) {
        return this.enforestLabeledStatement();
      }
      if (this.term === null && (this.isVarDeclTransform(lookahead_51) || this.isLetDeclTransform(lookahead_51) || this.isConstDeclTransform(lookahead_51) || this.isSyntaxrecDeclTransform(lookahead_51) || this.isSyntaxDeclTransform(lookahead_51))) {
        var stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });
        this.consumeSemicolon();
        return stmt;
      }
      if (this.term === null && this.isReturnStmtTransform(lookahead_51)) {
        return this.enforestReturnStatement();
      }
      if (this.term === null && this.isPunctuator(lookahead_51, ";")) {
        this.advance();
        return new _terms2.default("EmptyStatement", {});
      }
      return this.enforestExpressionStatement();
    }
  }, {
    key: "enforestLabeledStatement",
    value: function enforestLabeledStatement() {
      var label_52 = this.matchIdentifier();
      var punc_53 = this.matchPunctuator(":");
      var stmt_54 = this.enforestStatement();
      return new _terms2.default("LabeledStatement", { label: label_52, body: stmt_54 });
    }
  }, {
    key: "enforestBreakStatement",
    value: function enforestBreakStatement() {
      this.matchKeyword("break");
      var lookahead_55 = this.peek();
      var label_56 = null;
      if (this.rest.size === 0 || this.isPunctuator(lookahead_55, ";")) {
        this.consumeSemicolon();
        return new _terms2.default("BreakStatement", { label: label_56 });
      }
      if (this.isIdentifier(lookahead_55) || this.isKeyword(lookahead_55, "yield") || this.isKeyword(lookahead_55, "let")) {
        label_56 = this.enforestIdentifier();
      }
      this.consumeSemicolon();
      return new _terms2.default("BreakStatement", { label: label_56 });
    }
  }, {
    key: "enforestTryStatement",
    value: function enforestTryStatement() {
      this.matchKeyword("try");
      var body_57 = this.enforestBlock();
      if (this.isKeyword(this.peek(), "catch")) {
        var catchClause = this.enforestCatchClause();
        if (this.isKeyword(this.peek(), "finally")) {
          this.advance();
          var finalizer = this.enforestBlock();
          return new _terms2.default("TryFinallyStatement", { body: body_57, catchClause: catchClause, finalizer: finalizer });
        }
        return new _terms2.default("TryCatchStatement", { body: body_57, catchClause: catchClause });
      }
      if (this.isKeyword(this.peek(), "finally")) {
        this.advance();
        var _finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_57, catchClause: null, finalizer: _finalizer });
      }
      throw this.createError(this.peek(), "try with no catch or finally");
    }
  }, {
    key: "enforestCatchClause",
    value: function enforestCatchClause() {
      this.matchKeyword("catch");
      var bindingParens_58 = this.matchParens();
      var enf_59 = new Enforester(bindingParens_58, (0, _immutable.List)(), this.context);
      var binding_60 = enf_59.enforestBindingTarget();
      var body_61 = this.enforestBlock();
      return new _terms2.default("CatchClause", { binding: binding_60, body: body_61 });
    }
  }, {
    key: "enforestThrowStatement",
    value: function enforestThrowStatement() {
      this.matchKeyword("throw");
      var expression_62 = this.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default("ThrowStatement", { expression: expression_62 });
    }
  }, {
    key: "enforestWithStatement",
    value: function enforestWithStatement() {
      this.matchKeyword("with");
      var objParens_63 = this.matchParens();
      var enf_64 = new Enforester(objParens_63, (0, _immutable.List)(), this.context);
      var object_65 = enf_64.enforestExpression();
      var body_66 = this.enforestStatement();
      return new _terms2.default("WithStatement", { object: object_65, body: body_66 });
    }
  }, {
    key: "enforestDebuggerStatement",
    value: function enforestDebuggerStatement() {
      this.matchKeyword("debugger");
      return new _terms2.default("DebuggerStatement", {});
    }
  }, {
    key: "enforestDoStatement",
    value: function enforestDoStatement() {
      this.matchKeyword("do");
      var body_67 = this.enforestStatement();
      this.matchKeyword("while");
      var testBody_68 = this.matchParens();
      var enf_69 = new Enforester(testBody_68, (0, _immutable.List)(), this.context);
      var test_70 = enf_69.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default("DoWhileStatement", { body: body_67, test: test_70 });
    }
  }, {
    key: "enforestContinueStatement",
    value: function enforestContinueStatement() {
      var kwd_71 = this.matchKeyword("continue");
      var lookahead_72 = this.peek();
      var label_73 = null;
      if (this.rest.size === 0 || this.isPunctuator(lookahead_72, ";")) {
        this.consumeSemicolon();
        return new _terms2.default("ContinueStatement", { label: label_73 });
      }
      if (this.lineNumberEq(kwd_71, lookahead_72) && (this.isIdentifier(lookahead_72) || this.isKeyword(lookahead_72, "yield") || this.isKeyword(lookahead_72, "let"))) {
        label_73 = this.enforestIdentifier();
      }
      this.consumeSemicolon();
      return new _terms2.default("ContinueStatement", { label: label_73 });
    }
  }, {
    key: "enforestSwitchStatement",
    value: function enforestSwitchStatement() {
      this.matchKeyword("switch");
      var cond_74 = this.matchParens();
      var enf_75 = new Enforester(cond_74, (0, _immutable.List)(), this.context);
      var discriminant_76 = enf_75.enforestExpression();
      var body_77 = this.matchCurlies();
      if (body_77.size === 0) {
        return new _terms2.default("SwitchStatement", { discriminant: discriminant_76, cases: (0, _immutable.List)() });
      }
      enf_75 = new Enforester(body_77, (0, _immutable.List)(), this.context);
      var cases_78 = enf_75.enforestSwitchCases();
      var lookahead_79 = enf_75.peek();
      if (enf_75.isKeyword(lookahead_79, "default")) {
        var defaultCase = enf_75.enforestSwitchDefault();
        var postDefaultCases = enf_75.enforestSwitchCases();
        return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_76, preDefaultCases: cases_78, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
      }
      return new _terms2.default("SwitchStatement", { discriminant: discriminant_76, cases: cases_78 });
    }
  }, {
    key: "enforestSwitchCases",
    value: function enforestSwitchCases() {
      var cases_80 = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
        cases_80.push(this.enforestSwitchCase());
      }
      return (0, _immutable.List)(cases_80);
    }
  }, {
    key: "enforestSwitchCase",
    value: function enforestSwitchCase() {
      this.matchKeyword("case");
      return new _terms2.default("SwitchCase", { test: this.enforestExpression(), consequent: this.enforestSwitchCaseBody() });
    }
  }, {
    key: "enforestSwitchCaseBody",
    value: function enforestSwitchCaseBody() {
      this.matchPunctuator(":");
      return this.enforestStatementListInSwitchCaseBody();
    }
  }, {
    key: "enforestStatementListInSwitchCaseBody",
    value: function enforestStatementListInSwitchCaseBody() {
      var result_81 = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
        result_81.push(this.enforestStatementListItem());
      }
      return (0, _immutable.List)(result_81);
    }
  }, {
    key: "enforestSwitchDefault",
    value: function enforestSwitchDefault() {
      this.matchKeyword("default");
      return new _terms2.default("SwitchDefault", { consequent: this.enforestSwitchCaseBody() });
    }
  }, {
    key: "enforestForStatement",
    value: function enforestForStatement() {
      this.matchKeyword("for");
      var cond_82 = this.matchParens();
      var enf_83 = new Enforester(cond_82, (0, _immutable.List)(), this.context);
      var lookahead_84 = void 0,
          test_85 = void 0,
          init_86 = void 0,
          right_87 = void 0,
          type_88 = void 0,
          left_89 = void 0,
          update_90 = void 0;
      if (enf_83.isPunctuator(enf_83.peek(), ";")) {
        enf_83.advance();
        if (!enf_83.isPunctuator(enf_83.peek(), ";")) {
          test_85 = enf_83.enforestExpression();
        }
        enf_83.matchPunctuator(";");
        if (enf_83.rest.size !== 0) {
          right_87 = enf_83.enforestExpression();
        }
        return new _terms2.default("ForStatement", { init: null, test: test_85, update: right_87, body: this.enforestStatement() });
      } else {
        lookahead_84 = enf_83.peek();
        if (enf_83.isVarDeclTransform(lookahead_84) || enf_83.isLetDeclTransform(lookahead_84) || enf_83.isConstDeclTransform(lookahead_84)) {
          init_86 = enf_83.enforestVariableDeclaration();
          lookahead_84 = enf_83.peek();
          if (this.isKeyword(lookahead_84, "in") || this.isIdentifier(lookahead_84, "of")) {
            if (this.isKeyword(lookahead_84, "in")) {
              enf_83.advance();
              right_87 = enf_83.enforestExpression();
              type_88 = "ForInStatement";
            } else if (this.isIdentifier(lookahead_84, "of")) {
              enf_83.advance();
              right_87 = enf_83.enforestExpression();
              type_88 = "ForOfStatement";
            }
            return new _terms2.default(type_88, { left: init_86, right: right_87, body: this.enforestStatement() });
          }
          enf_83.matchPunctuator(";");
          if (enf_83.isPunctuator(enf_83.peek(), ";")) {
            enf_83.advance();
            test_85 = null;
          } else {
            test_85 = enf_83.enforestExpression();
            enf_83.matchPunctuator(";");
          }
          update_90 = enf_83.enforestExpression();
        } else {
          if (this.isKeyword(enf_83.peek(1), "in") || this.isIdentifier(enf_83.peek(1), "of")) {
            left_89 = enf_83.enforestBindingIdentifier();
            var kind = enf_83.advance();
            if (this.isKeyword(kind, "in")) {
              type_88 = "ForInStatement";
            } else {
              type_88 = "ForOfStatement";
            }
            right_87 = enf_83.enforestExpression();
            return new _terms2.default(type_88, { left: left_89, right: right_87, body: this.enforestStatement() });
          }
          init_86 = enf_83.enforestExpression();
          enf_83.matchPunctuator(";");
          if (enf_83.isPunctuator(enf_83.peek(), ";")) {
            enf_83.advance();
            test_85 = null;
          } else {
            test_85 = enf_83.enforestExpression();
            enf_83.matchPunctuator(";");
          }
          update_90 = enf_83.enforestExpression();
        }
        return new _terms2.default("ForStatement", { init: init_86, test: test_85, update: update_90, body: this.enforestStatement() });
      }
    }
  }, {
    key: "enforestIfStatement",
    value: function enforestIfStatement() {
      this.matchKeyword("if");
      var cond_91 = this.matchParens();
      var enf_92 = new Enforester(cond_91, (0, _immutable.List)(), this.context);
      var lookahead_93 = enf_92.peek();
      var test_94 = enf_92.enforestExpression();
      if (test_94 === null) {
        throw enf_92.createError(lookahead_93, "expecting an expression");
      }
      var consequent_95 = this.enforestStatement();
      var alternate_96 = null;
      if (this.isKeyword(this.peek(), "else")) {
        this.advance();
        alternate_96 = this.enforestStatement();
      }
      return new _terms2.default("IfStatement", { test: test_94, consequent: consequent_95, alternate: alternate_96 });
    }
  }, {
    key: "enforestWhileStatement",
    value: function enforestWhileStatement() {
      this.matchKeyword("while");
      var cond_97 = this.matchParens();
      var enf_98 = new Enforester(cond_97, (0, _immutable.List)(), this.context);
      var lookahead_99 = enf_98.peek();
      var test_100 = enf_98.enforestExpression();
      if (test_100 === null) {
        throw enf_98.createError(lookahead_99, "expecting an expression");
      }
      var body_101 = this.enforestStatement();
      return new _terms2.default("WhileStatement", { test: test_100, body: body_101 });
    }
  }, {
    key: "enforestBlockStatement",
    value: function enforestBlockStatement() {
      return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
    }
  }, {
    key: "enforestBlock",
    value: function enforestBlock() {
      var b_102 = this.matchCurlies();
      var body_103 = [];
      var enf_104 = new Enforester(b_102, (0, _immutable.List)(), this.context);
      while (enf_104.rest.size !== 0) {
        var lookahead = enf_104.peek();
        var stmt = enf_104.enforestStatement();
        if (stmt == null) {
          throw enf_104.createError(lookahead, "not a statement");
        }
        body_103.push(stmt);
      }
      return new _terms2.default("Block", { statements: (0, _immutable.List)(body_103) });
    }
  }, {
    key: "enforestClass",
    value: function enforestClass(_ref) {
      var isExpr = _ref.isExpr;
      var inDefault = _ref.inDefault;

      var kw_105 = this.advance();
      var name_106 = null,
          supr_107 = null;
      var type_108 = isExpr ? "ClassExpression" : "ClassDeclaration";
      if (this.isIdentifier(this.peek())) {
        name_106 = this.enforestBindingIdentifier();
      } else if (!isExpr) {
        if (inDefault) {
          name_106 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_105) });
        } else {
          throw this.createError(this.peek(), "unexpected syntax");
        }
      }
      if (this.isKeyword(this.peek(), "extends")) {
        this.advance();
        supr_107 = this.enforestExpressionLoop();
      }
      var elements_109 = [];
      var enf_110 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      while (enf_110.rest.size !== 0) {
        if (enf_110.isPunctuator(enf_110.peek(), ";")) {
          enf_110.advance();
          continue;
        }
        var isStatic = false;

        var _enf_110$enforestMeth = enf_110.enforestMethodDefinition();

        var methodOrKey = _enf_110$enforestMeth.methodOrKey;
        var kind = _enf_110$enforestMeth.kind;

        if (kind === "identifier" && methodOrKey.value.val() === "static") {
          isStatic = true;

          var _enf_110$enforestMeth2 = enf_110.enforestMethodDefinition();

          methodOrKey = _enf_110$enforestMeth2.methodOrKey;
          kind = _enf_110$enforestMeth2.kind;
        }
        if (kind === "method") {
          elements_109.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
        } else {
          throw this.createError(enf_110.peek(), "Only methods are allowed in classes");
        }
      }
      return new _terms2.default(type_108, { name: name_106, super: supr_107, elements: (0, _immutable.List)(elements_109) });
    }
  }, {
    key: "enforestBindingTarget",
    value: function enforestBindingTarget() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var allowPunctuator = _ref2.allowPunctuator;

      var lookahead_111 = this.peek();
      if (this.isIdentifier(lookahead_111) || this.isKeyword(lookahead_111) || allowPunctuator && this.isPunctuator(lookahead_111)) {
        return this.enforestBindingIdentifier({ allowPunctuator: allowPunctuator });
      } else if (this.isBrackets(lookahead_111)) {
        return this.enforestArrayBinding();
      } else if (this.isBraces(lookahead_111)) {
        return this.enforestObjectBinding();
      }
      (0, _errors.assert)(false, "not implemented yet");
    }
  }, {
    key: "enforestObjectBinding",
    value: function enforestObjectBinding() {
      var enf_112 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var properties_113 = [];
      while (enf_112.rest.size !== 0) {
        properties_113.push(enf_112.enforestBindingProperty());
        enf_112.consumeComma();
      }
      return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_113) });
    }
  }, {
    key: "enforestBindingProperty",
    value: function enforestBindingProperty() {
      var lookahead_114 = this.peek();

      var _enforestPropertyName = this.enforestPropertyName();

      var name = _enforestPropertyName.name;
      var binding = _enforestPropertyName.binding;

      if (this.isIdentifier(lookahead_114) || this.isKeyword(lookahead_114, "let") || this.isKeyword(lookahead_114, "yield")) {
        if (!this.isPunctuator(this.peek(), ":")) {
          var defaultValue = null;
          if (this.isAssign(this.peek())) {
            this.advance();
            var expr = this.enforestExpressionLoop();
            defaultValue = expr;
          }
          return new _terms2.default("BindingPropertyIdentifier", { binding: binding, init: defaultValue });
        }
      }
      this.matchPunctuator(":");
      binding = this.enforestBindingElement();
      return new _terms2.default("BindingPropertyProperty", { name: name, binding: binding });
    }
  }, {
    key: "enforestArrayBinding",
    value: function enforestArrayBinding() {
      var bracket_115 = this.matchSquares();
      var enf_116 = new Enforester(bracket_115, (0, _immutable.List)(), this.context);
      var elements_117 = [],
          restElement_118 = null;
      while (enf_116.rest.size !== 0) {
        var el = void 0;
        if (enf_116.isPunctuator(enf_116.peek(), ",")) {
          enf_116.consumeComma();
          el = null;
        } else {
          if (enf_116.isPunctuator(enf_116.peek(), "...")) {
            enf_116.advance();
            restElement_118 = enf_116.enforestBindingTarget();
            break;
          } else {
            el = enf_116.enforestBindingElement();
          }
          enf_116.consumeComma();
        }
        elements_117.push(el);
      }
      return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_117), restElement: restElement_118 });
    }
  }, {
    key: "enforestBindingElement",
    value: function enforestBindingElement() {
      var binding_119 = this.enforestBindingTarget();
      if (this.isAssign(this.peek())) {
        this.advance();
        var init = this.enforestExpressionLoop();
        binding_119 = new _terms2.default("BindingWithDefault", { binding: binding_119, init: init });
      }
      return binding_119;
    }
  }, {
    key: "enforestBindingIdentifier",
    value: function enforestBindingIdentifier() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var allowPunctuator = _ref3.allowPunctuator;

      var name_120 = void 0;
      if (allowPunctuator && this.isPunctuator(this.peek())) {
        name_120 = this.enforestPunctuator();
      } else {
        name_120 = this.enforestIdentifier();
      }
      return new _terms2.default("BindingIdentifier", { name: name_120 });
    }
  }, {
    key: "enforestPunctuator",
    value: function enforestPunctuator() {
      var lookahead_121 = this.peek();
      if (this.isPunctuator(lookahead_121)) {
        return this.advance();
      }
      throw this.createError(lookahead_121, "expecting a punctuator");
    }
  }, {
    key: "enforestIdentifier",
    value: function enforestIdentifier() {
      var lookahead_122 = this.peek();
      if (this.isIdentifier(lookahead_122) || this.isKeyword(lookahead_122)) {
        return this.advance();
      }
      throw this.createError(lookahead_122, "expecting an identifier");
    }
  }, {
    key: "enforestReturnStatement",
    value: function enforestReturnStatement() {
      var kw_123 = this.advance();
      var lookahead_124 = this.peek();
      if (this.rest.size === 0 || lookahead_124 && !this.lineNumberEq(kw_123, lookahead_124)) {
        return new _terms2.default("ReturnStatement", { expression: null });
      }
      var term_125 = null;
      if (!this.isPunctuator(lookahead_124, ";")) {
        term_125 = this.enforestExpression();
        (0, _errors.expect)(term_125 != null, "Expecting an expression to follow return keyword", lookahead_124, this.rest);
      }
      this.consumeSemicolon();
      return new _terms2.default("ReturnStatement", { expression: term_125 });
    }
  }, {
    key: "enforestVariableDeclaration",
    value: function enforestVariableDeclaration() {
      var kind_126 = void 0;
      var lookahead_127 = this.advance();
      var kindSyn_128 = lookahead_127;
      if (kindSyn_128 && this.context.env.get(kindSyn_128.resolve()) === _transforms.VariableDeclTransform) {
        kind_126 = "var";
      } else if (kindSyn_128 && this.context.env.get(kindSyn_128.resolve()) === _transforms.LetDeclTransform) {
        kind_126 = "let";
      } else if (kindSyn_128 && this.context.env.get(kindSyn_128.resolve()) === _transforms.ConstDeclTransform) {
        kind_126 = "const";
      } else if (kindSyn_128 && this.context.env.get(kindSyn_128.resolve()) === _transforms.SyntaxDeclTransform) {
        kind_126 = "syntax";
      } else if (kindSyn_128 && this.context.env.get(kindSyn_128.resolve()) === _transforms.SyntaxrecDeclTransform) {
        kind_126 = "syntaxrec";
      }
      var decls_129 = (0, _immutable.List)();
      while (true) {
        var term = this.enforestVariableDeclarator({ isSyntax: kind_126 === "syntax" || kind_126 === "syntaxrec" });
        var _lookahead_ = this.peek();
        decls_129 = decls_129.concat(term);
        if (this.isPunctuator(_lookahead_, ",")) {
          this.advance();
        } else {
          break;
        }
      }
      return new _terms2.default("VariableDeclaration", { kind: kind_126, declarators: decls_129 });
    }
  }, {
    key: "enforestVariableDeclarator",
    value: function enforestVariableDeclarator(_ref4) {
      var isSyntax = _ref4.isSyntax;

      var id_130 = this.enforestBindingTarget({ allowPunctuator: isSyntax });
      var lookahead_131 = this.peek();
      var init_132 = void 0,
          rest_133 = void 0;
      if (this.isPunctuator(lookahead_131, "=")) {
        this.advance();
        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        init_132 = enf.enforest("expression");
        this.rest = enf.rest;
      } else {
        init_132 = null;
      }
      return new _terms2.default("VariableDeclarator", { binding: id_130, init: init_132 });
    }
  }, {
    key: "enforestExpressionStatement",
    value: function enforestExpressionStatement() {
      var start_134 = this.rest.get(0);
      var expr_135 = this.enforestExpression();
      if (expr_135 === null) {
        throw this.createError(start_134, "not a valid expression");
      }
      this.consumeSemicolon();
      return new _terms2.default("ExpressionStatement", { expression: expr_135 });
    }
  }, {
    key: "enforestExpression",
    value: function enforestExpression() {
      var left_136 = this.enforestExpressionLoop();
      var lookahead_137 = this.peek();
      if (this.isPunctuator(lookahead_137, ",")) {
        while (this.rest.size !== 0) {
          if (!this.isPunctuator(this.peek(), ",")) {
            break;
          }
          var operator = this.advance();
          var right = this.enforestExpressionLoop();
          left_136 = new _terms2.default("BinaryExpression", { left: left_136, operator: operator, right: right });
        }
      }
      this.term = null;
      return left_136;
    }
  }, {
    key: "enforestExpressionLoop",
    value: function enforestExpressionLoop() {
      this.term = null;
      this.opCtx = { prec: 0, combine: function combine(x_138) {
          return x_138;
        }, stack: (0, _immutable.List)() };
      do {
        var term = this.enforestAssignmentExpression();
        if (term === EXPR_LOOP_NO_CHANGE_27 && this.opCtx.stack.size > 0) {
          this.term = this.opCtx.combine(this.term);

          var _opCtx$stack$last = this.opCtx.stack.last();

          var prec = _opCtx$stack$last.prec;
          var combine = _opCtx$stack$last.combine;

          this.opCtx.prec = prec;
          this.opCtx.combine = combine;
          this.opCtx.stack = this.opCtx.stack.pop();
        } else if (term === EXPR_LOOP_NO_CHANGE_27) {
          break;
        } else if (term === EXPR_LOOP_OPERATOR_26 || term === EXPR_LOOP_EXPANSION_28) {
          this.term = null;
        } else {
          this.term = term;
        }
      } while (true);
      return this.term;
    }
  }, {
    key: "enforestAssignmentExpression",
    value: function enforestAssignmentExpression() {
      var lookahead_139 = this.peek();
      if (this.term === null && this.isTerm(lookahead_139)) {
        return this.advance();
      }
      if (this.term === null && this.isCompiletimeTransform(lookahead_139)) {
        var result = this.expandMacro();
        this.rest = result.concat(this.rest);
        return EXPR_LOOP_EXPANSION_28;
      }
      if (this.term === null && this.isKeyword(lookahead_139, "yield")) {
        return this.enforestYieldExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_139, "class")) {
        return this.enforestClass({ isExpr: true });
      }
      if (this.term === null && this.isKeyword(lookahead_139, "super")) {
        this.advance();
        return new _terms2.default("Super", {});
      }
      if (this.term === null && (this.isIdentifier(lookahead_139) || this.isParens(lookahead_139)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_139, this.peek(1))) {
        return this.enforestArrowExpression();
      }
      if (this.term === null && this.isSyntaxTemplate(lookahead_139)) {
        return this.enforestSyntaxTemplate();
      }
      if (this.term === null && this.isSyntaxQuoteTransform(lookahead_139)) {
        return this.enforestSyntaxQuote();
      }
      if (this.term === null && this.isNewTransform(lookahead_139)) {
        return this.enforestNewExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_139, "this")) {
        return new _terms2.default("ThisExpression", { stx: this.advance() });
      }
      if (this.term === null && (this.isIdentifier(lookahead_139) || this.isKeyword(lookahead_139, "let") || this.isKeyword(lookahead_139, "yield"))) {
        return new _terms2.default("IdentifierExpression", { name: this.advance() });
      }
      if (this.term === null && this.isNumericLiteral(lookahead_139)) {
        var num = this.advance();
        if (num.val() === 1 / 0) {
          return new _terms2.default("LiteralInfinityExpression", {});
        }
        return new _terms2.default("LiteralNumericExpression", { value: num });
      }
      if (this.term === null && this.isStringLiteral(lookahead_139)) {
        return new _terms2.default("LiteralStringExpression", { value: this.advance() });
      }
      if (this.term === null && this.isTemplate(lookahead_139)) {
        return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
      }
      if (this.term === null && this.isBooleanLiteral(lookahead_139)) {
        return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
      }
      if (this.term === null && this.isNullLiteral(lookahead_139)) {
        this.advance();
        return new _terms2.default("LiteralNullExpression", {});
      }
      if (this.term === null && this.isRegularExpression(lookahead_139)) {
        var reStx = this.advance();
        var lastSlash = reStx.token.value.lastIndexOf("/");
        var pattern = reStx.token.value.slice(1, lastSlash);
        var flags = reStx.token.value.slice(lastSlash + 1);
        return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
      }
      if (this.term === null && this.isParens(lookahead_139)) {
        return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
      }
      if (this.term === null && this.isFnDeclTransform(lookahead_139)) {
        return this.enforestFunctionExpression();
      }
      if (this.term === null && this.isBraces(lookahead_139)) {
        return this.enforestObjectExpression();
      }
      if (this.term === null && this.isBrackets(lookahead_139)) {
        return this.enforestArrayExpression();
      }
      if (this.term === null && this.isOperator(lookahead_139)) {
        return this.enforestUnaryExpression();
      }
      if (this.term && this.isUpdateOperator(lookahead_139)) {
        return this.enforestUpdateExpression();
      }
      if (this.term && this.isOperator(lookahead_139)) {
        return this.enforestBinaryExpression();
      }
      if (this.term && this.isPunctuator(lookahead_139, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        return this.enforestStaticMemberExpression();
      }
      if (this.term && this.isBrackets(lookahead_139)) {
        return this.enforestComputedMemberExpression();
      }
      if (this.term && this.isParens(lookahead_139)) {
        var paren = this.advance();
        return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
      }
      if (this.term && this.isTemplate(lookahead_139)) {
        return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
      }
      if (this.term && this.isAssign(lookahead_139)) {
        var binding = this.transformDestructuring(this.term);
        var op = this.advance();
        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        var init = enf.enforest("expression");
        this.rest = enf.rest;
        if (op.val() === "=") {
          return new _terms2.default("AssignmentExpression", { binding: binding, expression: init });
        } else {
          return new _terms2.default("CompoundAssignmentExpression", { binding: binding, operator: op.val(), expression: init });
        }
      }
      if (this.term && this.isPunctuator(lookahead_139, "?")) {
        return this.enforestConditionalExpression();
      }
      return EXPR_LOOP_NO_CHANGE_27;
    }
  }, {
    key: "enforestArgumentList",
    value: function enforestArgumentList() {
      var result_140 = [];
      while (this.rest.size > 0) {
        var arg = void 0;
        if (this.isPunctuator(this.peek(), "...")) {
          this.advance();
          arg = new _terms2.default("SpreadElement", { expression: this.enforestExpressionLoop() });
        } else {
          arg = this.enforestExpressionLoop();
        }
        if (this.rest.size > 0) {
          this.matchPunctuator(",");
        }
        result_140.push(arg);
      }
      return (0, _immutable.List)(result_140);
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword("new");
      var callee_141 = void 0;
      if (this.isKeyword(this.peek(), "new")) {
        callee_141 = this.enforestNewExpression();
      } else if (this.isKeyword(this.peek(), "super")) {
        callee_141 = this.enforestExpressionLoop();
      } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
        this.advance();
        this.advance();
        return new _terms2.default("NewTargetExpression", {});
      } else {
        callee_141 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
      }
      var args_142 = void 0;
      if (this.isParens(this.peek())) {
        args_142 = this.matchParens();
      } else {
        args_142 = (0, _immutable.List)();
      }
      return new _terms2.default("NewExpression", { callee: callee_141, arguments: args_142 });
    }
  }, {
    key: "enforestComputedMemberExpression",
    value: function enforestComputedMemberExpression() {
      var enf_143 = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_143.enforestExpression() });
    }
  }, {
    key: "transformDestructuring",
    value: function transformDestructuring(term_144) {
      var _this = this;

      switch (term_144.type) {
        case "IdentifierExpression":
          return new _terms2.default("BindingIdentifier", { name: term_144.name });
        case "ParenthesizedExpression":
          if (term_144.inner.size === 1 && this.isIdentifier(term_144.inner.get(0))) {
            return new _terms2.default("BindingIdentifier", { name: term_144.inner.get(0) });
          }
        case "DataProperty":
          return new _terms2.default("BindingPropertyProperty", { name: term_144.name, binding: this.transformDestructuringWithDefault(term_144.expression) });
        case "ShorthandProperty":
          return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_144.name }), init: null });
        case "ObjectExpression":
          return new _terms2.default("ObjectBinding", { properties: term_144.properties.map(function (t_145) {
              return _this.transformDestructuring(t_145);
            }) });
        case "ArrayExpression":
          var last = term_144.elements.last();
          if (last != null && last.type === "SpreadElement") {
            return new _terms2.default("ArrayBinding", { elements: term_144.elements.slice(0, -1).map(function (t_146) {
                return t_146 && _this.transformDestructuringWithDefault(t_146);
              }), restElement: this.transformDestructuringWithDefault(last.expression) });
          } else {
            return new _terms2.default("ArrayBinding", { elements: term_144.elements.map(function (t_147) {
                return t_147 && _this.transformDestructuringWithDefault(t_147);
              }), restElement: null });
          }
          return new _terms2.default("ArrayBinding", { elements: term_144.elements.map(function (t_148) {
              return t_148 && _this.transformDestructuring(t_148);
            }), restElement: null });
        case "StaticPropertyName":
          return new _terms2.default("BindingIdentifier", { name: term_144.value });
        case "ComputedMemberExpression":
        case "StaticMemberExpression":
        case "ArrayBinding":
        case "BindingIdentifier":
        case "BindingPropertyIdentifier":
        case "BindingPropertyProperty":
        case "BindingWithDefault":
        case "ObjectBinding":
          return term_144;
      }
      (0, _errors.assert)(false, "not implemented yet for " + term_144.type);
    }
  }, {
    key: "transformDestructuringWithDefault",
    value: function transformDestructuringWithDefault(term_149) {
      switch (term_149.type) {
        case "AssignmentExpression":
          return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_149.binding), init: term_149.expression });
      }
      return this.transformDestructuring(term_149);
    }
  }, {
    key: "enforestArrowExpression",
    value: function enforestArrowExpression() {
      var enf_150 = void 0;
      if (this.isIdentifier(this.peek())) {
        enf_150 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf_150 = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params_151 = enf_150.enforestFormalParameters();
      this.matchPunctuator("=>");
      var body_152 = void 0;
      if (this.isBraces(this.peek())) {
        body_152 = this.matchCurlies();
      } else {
        enf_150 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        body_152 = enf_150.enforestExpressionLoop();
        this.rest = enf_150.rest;
      }
      return new _terms2.default("ArrowExpression", { params: params_151, body: body_152 });
    }
  }, {
    key: "enforestYieldExpression",
    value: function enforestYieldExpression() {
      var kwd_153 = this.matchKeyword("yield");
      var lookahead_154 = this.peek();
      if (this.rest.size === 0 || lookahead_154 && !this.lineNumberEq(kwd_153, lookahead_154)) {
        return new _terms2.default("YieldExpression", { expression: null });
      } else {
        var isGenerator = false;
        if (this.isPunctuator(this.peek(), "*")) {
          isGenerator = true;
          this.advance();
        }
        var expr = this.enforestExpression();
        var type = isGenerator ? "YieldGeneratorExpression" : "YieldExpression";
        return new _terms2.default(type, { expression: expr });
      }
    }
  }, {
    key: "enforestSyntaxTemplate",
    value: function enforestSyntaxTemplate() {
      return new _terms2.default("SyntaxTemplate", { template: this.advance() });
    }
  }, {
    key: "enforestSyntaxQuote",
    value: function enforestSyntaxQuote() {
      var name_155 = this.advance();
      return new _terms2.default("SyntaxQuote", { name: name_155, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_155 }), elements: this.enforestTemplateElements() }) });
    }
  }, {
    key: "enforestStaticMemberExpression",
    value: function enforestStaticMemberExpression() {
      var object_156 = this.term;
      var dot_157 = this.advance();
      var property_158 = this.advance();
      return new _terms2.default("StaticMemberExpression", { object: object_156, property: property_158 });
    }
  }, {
    key: "enforestArrayExpression",
    value: function enforestArrayExpression() {
      var arr_159 = this.advance();
      var elements_160 = [];
      var enf_161 = new Enforester(arr_159.inner(), (0, _immutable.List)(), this.context);
      while (enf_161.rest.size > 0) {
        var lookahead = enf_161.peek();
        if (enf_161.isPunctuator(lookahead, ",")) {
          enf_161.advance();
          elements_160.push(null);
        } else if (enf_161.isPunctuator(lookahead, "...")) {
          enf_161.advance();
          var expression = enf_161.enforestExpressionLoop();
          if (expression == null) {
            throw enf_161.createError(lookahead, "expecting expression");
          }
          elements_160.push(new _terms2.default("SpreadElement", { expression: expression }));
        } else {
          var term = enf_161.enforestExpressionLoop();
          if (term == null) {
            throw enf_161.createError(lookahead, "expected expression");
          }
          elements_160.push(term);
          enf_161.consumeComma();
        }
      }
      return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_160) });
    }
  }, {
    key: "enforestObjectExpression",
    value: function enforestObjectExpression() {
      var obj_162 = this.advance();
      var properties_163 = (0, _immutable.List)();
      var enf_164 = new Enforester(obj_162.inner(), (0, _immutable.List)(), this.context);
      var lastProp_165 = null;
      while (enf_164.rest.size > 0) {
        var prop = enf_164.enforestPropertyDefinition();
        enf_164.consumeComma();
        properties_163 = properties_163.concat(prop);
        if (lastProp_165 === prop) {
          throw enf_164.createError(prop, "invalid syntax in object");
        }
        lastProp_165 = prop;
      }
      return new _terms2.default("ObjectExpression", { properties: properties_163 });
    }
  }, {
    key: "enforestPropertyDefinition",
    value: function enforestPropertyDefinition() {
      var _enforestMethodDefini = this.enforestMethodDefinition();

      var methodOrKey = _enforestMethodDefini.methodOrKey;
      var kind = _enforestMethodDefini.kind;

      switch (kind) {
        case "method":
          return methodOrKey;
        case "identifier":
          if (this.isAssign(this.peek())) {
            this.advance();
            var init = this.enforestExpressionLoop();
            return new _terms2.default("BindingPropertyIdentifier", { init: init, binding: this.transformDestructuring(methodOrKey) });
          } else if (!this.isPunctuator(this.peek(), ":")) {
            return new _terms2.default("ShorthandProperty", { name: methodOrKey.value });
          }
      }
      this.matchPunctuator(":");
      var expr_166 = this.enforestExpressionLoop();
      return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_166 });
    }
  }, {
    key: "enforestMethodDefinition",
    value: function enforestMethodDefinition() {
      var lookahead_167 = this.peek();
      var isGenerator_168 = false;
      if (this.isPunctuator(lookahead_167, "*")) {
        isGenerator_168 = true;
        this.advance();
      }
      if (this.isIdentifier(lookahead_167, "get") && this.isPropertyName(this.peek(1))) {
        this.advance();

        var _enforestPropertyName2 = this.enforestPropertyName();

        var _name = _enforestPropertyName2.name;

        this.matchParens();
        var body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Getter", { name: _name, body: body }), kind: "method" };
      } else if (this.isIdentifier(lookahead_167, "set") && this.isPropertyName(this.peek(1))) {
        this.advance();

        var _enforestPropertyName3 = this.enforestPropertyName();

        var _name2 = _enforestPropertyName3.name;

        var enf = new Enforester(this.matchParens(), (0, _immutable.List)(), this.context);
        var param = enf.enforestBindingElement();
        var _body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Setter", { name: _name2, param: param, body: _body }), kind: "method" };
      }

      var _enforestPropertyName4 = this.enforestPropertyName();

      var name = _enforestPropertyName4.name;

      if (this.isParens(this.peek())) {
        var params = this.matchParens();
        var _enf = new Enforester(params, (0, _immutable.List)(), this.context);
        var formalParams = _enf.enforestFormalParameters();
        var _body2 = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_168, name: name, params: formalParams, body: _body2 }), kind: "method" };
      }
      return { methodOrKey: name, kind: this.isIdentifier(lookahead_167) || this.isKeyword(lookahead_167) ? "identifier" : "property" };
    }
  }, {
    key: "enforestPropertyName",
    value: function enforestPropertyName() {
      var lookahead_169 = this.peek();
      if (this.isStringLiteral(lookahead_169) || this.isNumericLiteral(lookahead_169)) {
        return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
      } else if (this.isBrackets(lookahead_169)) {
        var enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
        var expr = enf.enforestExpressionLoop();
        return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
      }
      var name_170 = this.advance();
      return { name: new _terms2.default("StaticPropertyName", { value: name_170 }), binding: new _terms2.default("BindingIdentifier", { name: name_170 }) };
    }
  }, {
    key: "enforestFunction",
    value: function enforestFunction(_ref5) {
      var isExpr = _ref5.isExpr;
      var inDefault = _ref5.inDefault;
      var allowGenerator = _ref5.allowGenerator;

      var name_171 = null,
          params_172 = void 0,
          body_173 = void 0,
          rest_174 = void 0;
      var isGenerator_175 = false;
      var fnKeyword_176 = this.advance();
      var lookahead_177 = this.peek();
      var type_178 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
      if (this.isPunctuator(lookahead_177, "*")) {
        isGenerator_175 = true;
        this.advance();
        lookahead_177 = this.peek();
      }
      if (!this.isParens(lookahead_177)) {
        name_171 = this.enforestBindingIdentifier();
      } else if (inDefault) {
        name_171 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_176) });
      }
      params_172 = this.matchParens();
      body_173 = this.matchCurlies();
      var enf_179 = new Enforester(params_172, (0, _immutable.List)(), this.context);
      var formalParams_180 = enf_179.enforestFormalParameters();
      return new _terms2.default(type_178, { name: name_171, isGenerator: isGenerator_175, params: formalParams_180, body: body_173 });
    }
  }, {
    key: "enforestFunctionExpression",
    value: function enforestFunctionExpression() {
      var name_181 = null,
          params_182 = void 0,
          body_183 = void 0,
          rest_184 = void 0;
      var isGenerator_185 = false;
      this.advance();
      var lookahead_186 = this.peek();
      if (this.isPunctuator(lookahead_186, "*")) {
        isGenerator_185 = true;
        this.advance();
        lookahead_186 = this.peek();
      }
      if (!this.isParens(lookahead_186)) {
        name_181 = this.enforestBindingIdentifier();
      }
      params_182 = this.matchParens();
      body_183 = this.matchCurlies();
      var enf_187 = new Enforester(params_182, (0, _immutable.List)(), this.context);
      var formalParams_188 = enf_187.enforestFormalParameters();
      return new _terms2.default("FunctionExpression", { name: name_181, isGenerator: isGenerator_185, params: formalParams_188, body: body_183 });
    }
  }, {
    key: "enforestFunctionDeclaration",
    value: function enforestFunctionDeclaration() {
      var name_189 = void 0,
          params_190 = void 0,
          body_191 = void 0,
          rest_192 = void 0;
      var isGenerator_193 = false;
      this.advance();
      var lookahead_194 = this.peek();
      if (this.isPunctuator(lookahead_194, "*")) {
        isGenerator_193 = true;
        this.advance();
      }
      name_189 = this.enforestBindingIdentifier();
      params_190 = this.matchParens();
      body_191 = this.matchCurlies();
      var enf_195 = new Enforester(params_190, (0, _immutable.List)(), this.context);
      var formalParams_196 = enf_195.enforestFormalParameters();
      return new _terms2.default("FunctionDeclaration", { name: name_189, isGenerator: isGenerator_193, params: formalParams_196, body: body_191 });
    }
  }, {
    key: "enforestFormalParameters",
    value: function enforestFormalParameters() {
      var items_197 = [];
      var rest_198 = null;
      while (this.rest.size !== 0) {
        var lookahead = this.peek();
        if (this.isPunctuator(lookahead, "...")) {
          this.matchPunctuator("...");
          rest_198 = this.enforestBindingIdentifier();
          break;
        }
        items_197.push(this.enforestParam());
        this.consumeComma();
      }
      return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_197), rest: rest_198 });
    }
  }, {
    key: "enforestParam",
    value: function enforestParam() {
      return this.enforestBindingElement();
    }
  }, {
    key: "enforestUpdateExpression",
    value: function enforestUpdateExpression() {
      var operator_199 = this.matchUnaryOperator();
      return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_199.val(), operand: this.transformDestructuring(this.term) });
    }
  }, {
    key: "enforestUnaryExpression",
    value: function enforestUnaryExpression() {
      var _this2 = this;

      var operator_200 = this.matchUnaryOperator();
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = 14;
      this.opCtx.combine = function (rightTerm_201) {
        var type_202 = void 0,
            term_203 = void 0,
            isPrefix_204 = void 0;
        if (operator_200.val() === "++" || operator_200.val() === "--") {
          type_202 = "UpdateExpression";
          term_203 = _this2.transformDestructuring(rightTerm_201);
          isPrefix_204 = true;
        } else {
          type_202 = "UnaryExpression";
          isPrefix_204 = undefined;
          term_203 = rightTerm_201;
        }
        return new _terms2.default(type_202, { operator: operator_200.val(), operand: term_203, isPrefix: isPrefix_204 });
      };
      return EXPR_LOOP_OPERATOR_26;
    }
  }, {
    key: "enforestConditionalExpression",
    value: function enforestConditionalExpression() {
      var test_205 = this.opCtx.combine(this.term);
      if (this.opCtx.stack.size > 0) {
        var _opCtx$stack$last2 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last2.prec;
        var combine = _opCtx$stack$last2.combine;

        this.opCtx.stack = this.opCtx.stack.pop();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
      }
      this.matchPunctuator("?");
      var enf_206 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      var consequent_207 = enf_206.enforestExpressionLoop();
      enf_206.matchPunctuator(":");
      enf_206 = new Enforester(enf_206.rest, (0, _immutable.List)(), this.context);
      var alternate_208 = enf_206.enforestExpressionLoop();
      this.rest = enf_206.rest;
      return new _terms2.default("ConditionalExpression", { test: test_205, consequent: consequent_207, alternate: alternate_208 });
    }
  }, {
    key: "enforestBinaryExpression",
    value: function enforestBinaryExpression() {
      var leftTerm_209 = this.term;
      var opStx_210 = this.peek();
      var op_211 = opStx_210.val();
      var opPrec_212 = (0, _operators.getOperatorPrec)(op_211);
      var opAssoc_213 = (0, _operators.getOperatorAssoc)(op_211);
      if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_212, opAssoc_213)) {
        this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
        this.opCtx.prec = opPrec_212;
        this.opCtx.combine = function (rightTerm_214) {
          return new _terms2.default("BinaryExpression", { left: leftTerm_209, operator: opStx_210, right: rightTerm_214 });
        };
        this.advance();
        return EXPR_LOOP_OPERATOR_26;
      } else {
        var term = this.opCtx.combine(leftTerm_209);

        var _opCtx$stack$last3 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last3.prec;
        var combine = _opCtx$stack$last3.combine;

        this.opCtx.stack = this.opCtx.stack.pop();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        return term;
      }
    }
  }, {
    key: "enforestTemplateElements",
    value: function enforestTemplateElements() {
      var _this3 = this;

      var lookahead_215 = this.matchTemplate();
      var elements_216 = lookahead_215.token.items.map(function (it_217) {
        if (it_217 instanceof _syntax2.default && it_217.isDelimiter()) {
          var enf = new Enforester(it_217.inner(), (0, _immutable.List)(), _this3.context);
          return enf.enforest("expression");
        }
        return new _terms2.default("TemplateElement", { rawValue: it_217.slice.text });
      });
      return elements_216;
    }
  }, {
    key: "expandMacro",
    value: function expandMacro(enforestType_218) {
      var _this4 = this;

      var name_219 = this.advance();
      var syntaxTransform_220 = this.getCompiletimeTransform(name_219);
      if (syntaxTransform_220 == null || typeof syntaxTransform_220.value !== "function") {
        throw this.createError(name_219, "the macro name was not bound to a value that could be invoked");
      }
      var useSiteScope_221 = (0, _scope.freshScope)("u");
      var introducedScope_222 = (0, _scope.freshScope)("i");
      this.context.useScope = useSiteScope_221;
      var ctx_223 = new _macroContext2.default(this, name_219, this.context, useSiteScope_221, introducedScope_222);
      var result_224 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_220.value.call(null, ctx_223));
      if (!_immutable.List.isList(result_224)) {
        throw this.createError(name_219, "macro must return a list but got: " + result_224);
      }
      result_224 = result_224.map(function (stx_225) {
        if (!(stx_225 && typeof stx_225.addScope === "function")) {
          throw _this4.createError(name_219, "macro must return syntax objects or terms but got: " + stx_225);
        }
        return stx_225.addScope(introducedScope_222, _this4.context.bindings, { flip: true });
      });
      return result_224;
    }
  }, {
    key: "consumeSemicolon",
    value: function consumeSemicolon() {
      var lookahead_226 = this.peek();
      if (lookahead_226 && this.isPunctuator(lookahead_226, ";")) {
        this.advance();
      }
    }
  }, {
    key: "consumeComma",
    value: function consumeComma() {
      var lookahead_227 = this.peek();
      if (lookahead_227 && this.isPunctuator(lookahead_227, ",")) {
        this.advance();
      }
    }
  }, {
    key: "isTerm",
    value: function isTerm(term_228) {
      return term_228 && term_228 instanceof _terms2.default;
    }
  }, {
    key: "isEOF",
    value: function isEOF(term_229) {
      return term_229 && term_229 instanceof _syntax2.default && term_229.isEOF();
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(term_230) {
      var val_231 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_230 && term_230 instanceof _syntax2.default && term_230.isIdentifier() && (val_231 === null || term_230.val() === val_231);
    }
  }, {
    key: "isPropertyName",
    value: function isPropertyName(term_232) {
      return this.isIdentifier(term_232) || this.isKeyword(term_232) || this.isNumericLiteral(term_232) || this.isStringLiteral(term_232) || this.isBrackets(term_232);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(term_233) {
      return term_233 && term_233 instanceof _syntax2.default && term_233.isNumericLiteral();
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(term_234) {
      return term_234 && term_234 instanceof _syntax2.default && term_234.isStringLiteral();
    }
  }, {
    key: "isTemplate",
    value: function isTemplate(term_235) {
      return term_235 && term_235 instanceof _syntax2.default && term_235.isTemplate();
    }
  }, {
    key: "isBooleanLiteral",
    value: function isBooleanLiteral(term_236) {
      return term_236 && term_236 instanceof _syntax2.default && term_236.isBooleanLiteral();
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(term_237) {
      return term_237 && term_237 instanceof _syntax2.default && term_237.isNullLiteral();
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(term_238) {
      return term_238 && term_238 instanceof _syntax2.default && term_238.isRegularExpression();
    }
  }, {
    key: "isParens",
    value: function isParens(term_239) {
      return term_239 && term_239 instanceof _syntax2.default && term_239.isParens();
    }
  }, {
    key: "isBraces",
    value: function isBraces(term_240) {
      return term_240 && term_240 instanceof _syntax2.default && term_240.isBraces();
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(term_241) {
      return term_241 && term_241 instanceof _syntax2.default && term_241.isBrackets();
    }
  }, {
    key: "isAssign",
    value: function isAssign(term_242) {
      if (this.isPunctuator(term_242)) {
        switch (term_242.val()) {
          case "=":
          case "|=":
          case "^=":
          case "&=":
          case "<<=":
          case ">>=":
          case ">>>=":
          case "+=":
          case "-=":
          case "*=":
          case "/=":
          case "%=":
            return true;
          default:
            return false;
        }
      }
      return false;
    }
  }, {
    key: "isKeyword",
    value: function isKeyword(term_243) {
      var val_244 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_243 && term_243 instanceof _syntax2.default && term_243.isKeyword() && (val_244 === null || term_243.val() === val_244);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(term_245) {
      var val_246 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_245 && term_245 instanceof _syntax2.default && term_245.isPunctuator() && (val_246 === null || term_245.val() === val_246);
    }
  }, {
    key: "isOperator",
    value: function isOperator(term_247) {
      return term_247 && term_247 instanceof _syntax2.default && (0, _operators.isOperator)(term_247);
    }
  }, {
    key: "isUpdateOperator",
    value: function isUpdateOperator(term_248) {
      return term_248 && term_248 instanceof _syntax2.default && term_248.isPunctuator() && (term_248.val() === "++" || term_248.val() === "--");
    }
  }, {
    key: "isFnDeclTransform",
    value: function isFnDeclTransform(term_249) {
      return term_249 && term_249 instanceof _syntax2.default && this.context.env.get(term_249.resolve()) === _transforms.FunctionDeclTransform;
    }
  }, {
    key: "isVarDeclTransform",
    value: function isVarDeclTransform(term_250) {
      return term_250 && term_250 instanceof _syntax2.default && this.context.env.get(term_250.resolve()) === _transforms.VariableDeclTransform;
    }
  }, {
    key: "isLetDeclTransform",
    value: function isLetDeclTransform(term_251) {
      return term_251 && term_251 instanceof _syntax2.default && this.context.env.get(term_251.resolve()) === _transforms.LetDeclTransform;
    }
  }, {
    key: "isConstDeclTransform",
    value: function isConstDeclTransform(term_252) {
      return term_252 && term_252 instanceof _syntax2.default && this.context.env.get(term_252.resolve()) === _transforms.ConstDeclTransform;
    }
  }, {
    key: "isSyntaxDeclTransform",
    value: function isSyntaxDeclTransform(term_253) {
      return term_253 && term_253 instanceof _syntax2.default && this.context.env.get(term_253.resolve()) === _transforms.SyntaxDeclTransform;
    }
  }, {
    key: "isSyntaxrecDeclTransform",
    value: function isSyntaxrecDeclTransform(term_254) {
      return term_254 && term_254 instanceof _syntax2.default && this.context.env.get(term_254.resolve()) === _transforms.SyntaxrecDeclTransform;
    }
  }, {
    key: "isSyntaxTemplate",
    value: function isSyntaxTemplate(term_255) {
      return term_255 && term_255 instanceof _syntax2.default && term_255.isSyntaxTemplate();
    }
  }, {
    key: "isSyntaxQuoteTransform",
    value: function isSyntaxQuoteTransform(term_256) {
      return term_256 && term_256 instanceof _syntax2.default && this.context.env.get(term_256.resolve()) === _transforms.SyntaxQuoteTransform;
    }
  }, {
    key: "isReturnStmtTransform",
    value: function isReturnStmtTransform(term_257) {
      return term_257 && term_257 instanceof _syntax2.default && this.context.env.get(term_257.resolve()) === _transforms.ReturnStatementTransform;
    }
  }, {
    key: "isWhileTransform",
    value: function isWhileTransform(term_258) {
      return term_258 && term_258 instanceof _syntax2.default && this.context.env.get(term_258.resolve()) === _transforms.WhileTransform;
    }
  }, {
    key: "isForTransform",
    value: function isForTransform(term_259) {
      return term_259 && term_259 instanceof _syntax2.default && this.context.env.get(term_259.resolve()) === _transforms.ForTransform;
    }
  }, {
    key: "isSwitchTransform",
    value: function isSwitchTransform(term_260) {
      return term_260 && term_260 instanceof _syntax2.default && this.context.env.get(term_260.resolve()) === _transforms.SwitchTransform;
    }
  }, {
    key: "isBreakTransform",
    value: function isBreakTransform(term_261) {
      return term_261 && term_261 instanceof _syntax2.default && this.context.env.get(term_261.resolve()) === _transforms.BreakTransform;
    }
  }, {
    key: "isContinueTransform",
    value: function isContinueTransform(term_262) {
      return term_262 && term_262 instanceof _syntax2.default && this.context.env.get(term_262.resolve()) === _transforms.ContinueTransform;
    }
  }, {
    key: "isDoTransform",
    value: function isDoTransform(term_263) {
      return term_263 && term_263 instanceof _syntax2.default && this.context.env.get(term_263.resolve()) === _transforms.DoTransform;
    }
  }, {
    key: "isDebuggerTransform",
    value: function isDebuggerTransform(term_264) {
      return term_264 && term_264 instanceof _syntax2.default && this.context.env.get(term_264.resolve()) === _transforms.DebuggerTransform;
    }
  }, {
    key: "isWithTransform",
    value: function isWithTransform(term_265) {
      return term_265 && term_265 instanceof _syntax2.default && this.context.env.get(term_265.resolve()) === _transforms.WithTransform;
    }
  }, {
    key: "isTryTransform",
    value: function isTryTransform(term_266) {
      return term_266 && term_266 instanceof _syntax2.default && this.context.env.get(term_266.resolve()) === _transforms.TryTransform;
    }
  }, {
    key: "isThrowTransform",
    value: function isThrowTransform(term_267) {
      return term_267 && term_267 instanceof _syntax2.default && this.context.env.get(term_267.resolve()) === _transforms.ThrowTransform;
    }
  }, {
    key: "isIfTransform",
    value: function isIfTransform(term_268) {
      return term_268 && term_268 instanceof _syntax2.default && this.context.env.get(term_268.resolve()) === _transforms.IfTransform;
    }
  }, {
    key: "isNewTransform",
    value: function isNewTransform(term_269) {
      return term_269 && term_269 instanceof _syntax2.default && this.context.env.get(term_269.resolve()) === _transforms.NewTransform;
    }
  }, {
    key: "isCompiletimeTransform",
    value: function isCompiletimeTransform(term_270) {
      return term_270 && term_270 instanceof _syntax2.default && (this.context.env.get(term_270.resolve()) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_270.resolve()) instanceof _transforms.CompiletimeTransform);
    }
  }, {
    key: "getCompiletimeTransform",
    value: function getCompiletimeTransform(term_271) {
      if (this.context.env.has(term_271.resolve())) {
        return this.context.env.get(term_271.resolve());
      }
      return this.context.store.get(term_271.resolve());
    }
  }, {
    key: "lineNumberEq",
    value: function lineNumberEq(a_272, b_273) {
      if (!(a_272 && b_273)) {
        return false;
      }
      (0, _errors.assert)(a_272 instanceof _syntax2.default, "expecting a syntax object");
      (0, _errors.assert)(b_273 instanceof _syntax2.default, "expecting a syntax object");
      return a_272.lineNumber() === b_273.lineNumber();
    }
  }, {
    key: "matchIdentifier",
    value: function matchIdentifier(val_274) {
      var lookahead_275 = this.advance();
      if (this.isIdentifier(lookahead_275)) {
        return lookahead_275;
      }
      throw this.createError(lookahead_275, "expecting an identifier");
    }
  }, {
    key: "matchKeyword",
    value: function matchKeyword(val_276) {
      var lookahead_277 = this.advance();
      if (this.isKeyword(lookahead_277, val_276)) {
        return lookahead_277;
      }
      throw this.createError(lookahead_277, "expecting " + val_276);
    }
  }, {
    key: "matchLiteral",
    value: function matchLiteral() {
      var lookahead_278 = this.advance();
      if (this.isNumericLiteral(lookahead_278) || this.isStringLiteral(lookahead_278) || this.isBooleanLiteral(lookahead_278) || this.isNullLiteral(lookahead_278) || this.isTemplate(lookahead_278) || this.isRegularExpression(lookahead_278)) {
        return lookahead_278;
      }
      throw this.createError(lookahead_278, "expecting a literal");
    }
  }, {
    key: "matchStringLiteral",
    value: function matchStringLiteral() {
      var lookahead_279 = this.advance();
      if (this.isStringLiteral(lookahead_279)) {
        return lookahead_279;
      }
      throw this.createError(lookahead_279, "expecting a string literal");
    }
  }, {
    key: "matchTemplate",
    value: function matchTemplate() {
      var lookahead_280 = this.advance();
      if (this.isTemplate(lookahead_280)) {
        return lookahead_280;
      }
      throw this.createError(lookahead_280, "expecting a template literal");
    }
  }, {
    key: "matchParens",
    value: function matchParens() {
      var lookahead_281 = this.advance();
      if (this.isParens(lookahead_281)) {
        return lookahead_281.inner();
      }
      throw this.createError(lookahead_281, "expecting parens");
    }
  }, {
    key: "matchCurlies",
    value: function matchCurlies() {
      var lookahead_282 = this.advance();
      if (this.isBraces(lookahead_282)) {
        return lookahead_282.inner();
      }
      throw this.createError(lookahead_282, "expecting curly braces");
    }
  }, {
    key: "matchSquares",
    value: function matchSquares() {
      var lookahead_283 = this.advance();
      if (this.isBrackets(lookahead_283)) {
        return lookahead_283.inner();
      }
      throw this.createError(lookahead_283, "expecting sqaure braces");
    }
  }, {
    key: "matchUnaryOperator",
    value: function matchUnaryOperator() {
      var lookahead_284 = this.advance();
      if ((0, _operators.isUnaryOperator)(lookahead_284)) {
        return lookahead_284;
      }
      throw this.createError(lookahead_284, "expecting a unary operator");
    }
  }, {
    key: "matchPunctuator",
    value: function matchPunctuator(val_285) {
      var lookahead_286 = this.advance();
      if (this.isPunctuator(lookahead_286)) {
        if (typeof val_285 !== "undefined") {
          if (lookahead_286.val() === val_285) {
            return lookahead_286;
          } else {
            throw this.createError(lookahead_286, "expecting a " + val_285 + " punctuator");
          }
        }
        return lookahead_286;
      }
      throw this.createError(lookahead_286, "expecting a punctuator");
    }
  }, {
    key: "createError",
    value: function createError(stx_287, message_288) {
      var ctx_289 = "";
      var offending_290 = stx_287;
      if (this.rest.size > 0) {
        ctx_289 = this.rest.slice(0, 20).map(function (term_291) {
          if (term_291.isDelimiter()) {
            return term_291.inner();
          }
          return _immutable.List.of(term_291);
        }).flatten().map(function (s_292) {
          if (s_292 === offending_290) {
            return "__" + s_292.val() + "__";
          }
          return s_292.val();
        }).join(" ");
      } else {
        ctx_289 = offending_290.toString();
      }
      return new Error(message_288 + "\n" + ctx_289);
    }
  }]);

  return Enforester;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2VuZm9yZXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUNBLElBQU0sd0JBQXdCLEVBQTlCO0FBQ0EsSUFBTSx5QkFBeUIsRUFBL0I7QUFDQSxJQUFNLHlCQUF5QixFQUEvQjs7SUFDYSxVLFdBQUEsVTtBQUNYLHNCQUFZLE9BQVosRUFBcUIsT0FBckIsRUFBOEIsVUFBOUIsRUFBMEM7QUFBQTs7QUFDeEMsU0FBSyxJQUFMLEdBQVksS0FBWjtBQUNBLHdCQUFPLGdCQUFLLE1BQUwsQ0FBWSxPQUFaLENBQVAsRUFBNkIsdUNBQTdCO0FBQ0Esd0JBQU8sZ0JBQUssTUFBTCxDQUFZLE9BQVosQ0FBUCxFQUE2Qix1Q0FBN0I7QUFDQSx3QkFBTyxVQUFQLEVBQW1CLGlDQUFuQjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxPQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksT0FBWjtBQUNBLFNBQUssT0FBTCxHQUFlLFVBQWY7QUFDRDs7OzsyQkFDYztBQUFBLFVBQVYsSUFBVSx5REFBSCxDQUFHOztBQUNiLGFBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLElBQWQsQ0FBUDtBQUNEOzs7OEJBQ1M7QUFDUixVQUFJLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFiO0FBQ0EsV0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLENBQVUsSUFBVixFQUFaO0FBQ0EsYUFBTyxNQUFQO0FBQ0Q7OzsrQkFDNEI7QUFBQSxVQUFwQixPQUFvQix5REFBVixRQUFVOztBQUMzQixXQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsVUFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLEtBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLGFBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxlQUFPLEtBQUssSUFBWjtBQUNEO0FBQ0QsVUFBSSxLQUFLLEtBQUwsQ0FBVyxLQUFLLElBQUwsRUFBWCxDQUFKLEVBQTZCO0FBQzNCLGFBQUssSUFBTCxHQUFZLG9CQUFTLEtBQVQsRUFBZ0IsRUFBaEIsQ0FBWjtBQUNBLGFBQUssT0FBTDtBQUNBLGVBQU8sS0FBSyxJQUFaO0FBQ0Q7QUFDRCxVQUFJLGtCQUFKO0FBQ0EsVUFBSSxZQUFZLFlBQWhCLEVBQThCO0FBQzVCLG9CQUFZLEtBQUssc0JBQUwsRUFBWjtBQUNELE9BRkQsTUFFTztBQUNMLG9CQUFZLEtBQUssY0FBTCxFQUFaO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsS0FBbUIsQ0FBdkIsRUFBMEI7QUFDeEIsYUFBSyxJQUFMLEdBQVksSUFBWjtBQUNEO0FBQ0QsYUFBTyxTQUFQO0FBQ0Q7OztxQ0FDZ0I7QUFDZixhQUFPLEtBQUssWUFBTCxFQUFQO0FBQ0Q7OzttQ0FDYztBQUNiLGFBQU8sS0FBSyxrQkFBTCxFQUFQO0FBQ0Q7Ozt5Q0FDb0I7QUFDbkIsVUFBSSxlQUFlLEtBQUssSUFBTCxFQUFuQjtBQUNBLFVBQUksS0FBSyxTQUFMLENBQWUsWUFBZixFQUE2QixRQUE3QixDQUFKLEVBQTRDO0FBQzFDLGFBQUssT0FBTDtBQUNBLGVBQU8sS0FBSyx5QkFBTCxFQUFQO0FBQ0QsT0FIRCxNQUdPLElBQUksS0FBSyxTQUFMLENBQWUsWUFBZixFQUE2QixRQUE3QixDQUFKLEVBQTRDO0FBQ2pELGFBQUssT0FBTDtBQUNBLGVBQU8sS0FBSyx5QkFBTCxFQUFQO0FBQ0Q7QUFDRCxhQUFPLEtBQUssaUJBQUwsRUFBUDtBQUNEOzs7Z0RBQzJCO0FBQzFCLFVBQUksZUFBZSxLQUFLLElBQUwsRUFBbkI7QUFDQSxVQUFJLEtBQUssWUFBTCxDQUFrQixZQUFsQixFQUFnQyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDLGFBQUssT0FBTDtBQUNBLFlBQUksa0JBQWtCLEtBQUssa0JBQUwsRUFBdEI7QUFDQSxlQUFPLG9CQUFTLGVBQVQsRUFBMEIsRUFBQyxpQkFBaUIsZUFBbEIsRUFBMUIsQ0FBUDtBQUNELE9BSkQsTUFJTyxJQUFJLEtBQUssUUFBTCxDQUFjLFlBQWQsQ0FBSixFQUFpQztBQUN0QyxZQUFJLGVBQWUsS0FBSyxvQkFBTCxFQUFuQjtBQUNBLFlBQUksbUJBQWtCLElBQXRCO0FBQ0EsWUFBSSxLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLEVBQWxCLEVBQStCLE1BQS9CLENBQUosRUFBNEM7QUFDMUMsNkJBQWtCLEtBQUssa0JBQUwsRUFBbEI7QUFDRDtBQUNELGVBQU8sb0JBQVMsWUFBVCxFQUF1QixFQUFDLGNBQWMsWUFBZixFQUE2QixpQkFBaUIsZ0JBQTlDLEVBQXZCLENBQVA7QUFDRCxPQVBNLE1BT0EsSUFBSSxLQUFLLFNBQUwsQ0FBZSxZQUFmLEVBQTZCLE9BQTdCLENBQUosRUFBMkM7QUFDaEQsZUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsYUFBYSxLQUFLLGFBQUwsQ0FBbUIsRUFBQyxRQUFRLEtBQVQsRUFBbkIsQ0FBZCxFQUFuQixDQUFQO0FBQ0QsT0FGTSxNQUVBLElBQUksS0FBSyxpQkFBTCxDQUF1QixZQUF2QixDQUFKLEVBQTBDO0FBQy9DLGVBQU8sb0JBQVMsUUFBVCxFQUFtQixFQUFDLGFBQWEsS0FBSyxnQkFBTCxDQUFzQixFQUFDLFFBQVEsS0FBVCxFQUFnQixXQUFXLEtBQTNCLEVBQXRCLENBQWQsRUFBbkIsQ0FBUDtBQUNELE9BRk0sTUFFQSxJQUFJLEtBQUssU0FBTCxDQUFlLFlBQWYsRUFBNkIsU0FBN0IsQ0FBSixFQUE2QztBQUNsRCxhQUFLLE9BQUw7QUFDQSxZQUFJLEtBQUssaUJBQUwsQ0FBdUIsS0FBSyxJQUFMLEVBQXZCLENBQUosRUFBeUM7QUFDdkMsaUJBQU8sb0JBQVMsZUFBVCxFQUEwQixFQUFDLE1BQU0sS0FBSyxnQkFBTCxDQUFzQixFQUFDLFFBQVEsS0FBVCxFQUFnQixXQUFXLElBQTNCLEVBQXRCLENBQVAsRUFBMUIsQ0FBUDtBQUNELFNBRkQsTUFFTyxJQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLE9BQTVCLENBQUosRUFBMEM7QUFDL0MsaUJBQU8sb0JBQVMsZUFBVCxFQUEwQixFQUFDLE1BQU0sS0FBSyxhQUFMLENBQW1CLEVBQUMsUUFBUSxLQUFULEVBQWdCLFdBQVcsSUFBM0IsRUFBbkIsQ0FBUCxFQUExQixDQUFQO0FBQ0QsU0FGTSxNQUVBO0FBQ0wsY0FBSSxPQUFPLEtBQUssc0JBQUwsRUFBWDtBQUNBLGVBQUssZ0JBQUw7QUFDQSxpQkFBTyxvQkFBUyxlQUFULEVBQTBCLEVBQUMsTUFBTSxJQUFQLEVBQTFCLENBQVA7QUFDRDtBQUNGLE9BWE0sTUFXQSxJQUFJLEtBQUssa0JBQUwsQ0FBd0IsWUFBeEIsS0FBeUMsS0FBSyxrQkFBTCxDQUF3QixZQUF4QixDQUF6QyxJQUFrRixLQUFLLG9CQUFMLENBQTBCLFlBQTFCLENBQWxGLElBQTZILEtBQUssd0JBQUwsQ0FBOEIsWUFBOUIsQ0FBN0gsSUFBNEssS0FBSyxxQkFBTCxDQUEyQixZQUEzQixDQUFoTCxFQUEwTjtBQUMvTixlQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxhQUFhLEtBQUssMkJBQUwsRUFBZCxFQUFuQixDQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixZQUFqQixFQUErQixtQkFBL0IsQ0FBTjtBQUNEOzs7MkNBQ3NCO0FBQ3JCLFVBQUksU0FBUyxJQUFJLFVBQUosQ0FBZSxLQUFLLFlBQUwsRUFBZixFQUFvQyxzQkFBcEMsRUFBNEMsS0FBSyxPQUFqRCxDQUFiO0FBQ0EsVUFBSSxZQUFZLEVBQWhCO0FBQ0EsYUFBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEtBQXFCLENBQTVCLEVBQStCO0FBQzdCLGtCQUFVLElBQVYsQ0FBZSxPQUFPLHVCQUFQLEVBQWY7QUFDQSxlQUFPLFlBQVA7QUFDRDtBQUNELGFBQU8scUJBQUssU0FBTCxDQUFQO0FBQ0Q7Ozs4Q0FDeUI7QUFDeEIsVUFBSSxVQUFVLEtBQUssa0JBQUwsRUFBZDtBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLEtBQUssSUFBTCxFQUFsQixFQUErQixJQUEvQixDQUFKLEVBQTBDO0FBQ3hDLGFBQUssT0FBTDtBQUNBLFlBQUksZUFBZSxLQUFLLGtCQUFMLEVBQW5CO0FBQ0EsZUFBTyxvQkFBUyxpQkFBVCxFQUE0QixFQUFDLE1BQU0sT0FBUCxFQUFnQixjQUFjLFlBQTlCLEVBQTVCLENBQVA7QUFDRDtBQUNELGFBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxNQUFNLElBQVAsRUFBYSxjQUFjLE9BQTNCLEVBQTVCLENBQVA7QUFDRDs7O2dEQUMyQjtBQUMxQixVQUFJLGVBQWUsS0FBSyxJQUFMLEVBQW5CO0FBQ0EsVUFBSSxvQkFBb0IsSUFBeEI7QUFDQSxVQUFJLGtCQUFrQixzQkFBdEI7QUFDQSxVQUFJLGVBQWUsS0FBbkI7QUFDQSxVQUFJLEtBQUssZUFBTCxDQUFxQixZQUFyQixDQUFKLEVBQXdDO0FBQ3RDLFlBQUksa0JBQWtCLEtBQUssT0FBTCxFQUF0QjtBQUNBLGFBQUssZ0JBQUw7QUFDQSxlQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxnQkFBZ0IsaUJBQWpCLEVBQW9DLGNBQWMsZUFBbEQsRUFBbUUsaUJBQWlCLGVBQXBGLEVBQW5CLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxZQUFMLENBQWtCLFlBQWxCLEtBQW1DLEtBQUssU0FBTCxDQUFlLFlBQWYsQ0FBdkMsRUFBcUU7QUFDbkUsNEJBQW9CLEtBQUsseUJBQUwsRUFBcEI7QUFDQSxZQUFJLENBQUMsS0FBSyxZQUFMLENBQWtCLEtBQUssSUFBTCxFQUFsQixFQUErQixHQUEvQixDQUFMLEVBQTBDO0FBQ3hDLGNBQUksb0JBQWtCLEtBQUssa0JBQUwsRUFBdEI7QUFDQSxjQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLEtBQTVCLEtBQXNDLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsQ0FBVSxDQUFWLENBQWxCLEVBQWdDLFFBQWhDLENBQTFDLEVBQXFGO0FBQ25GLGlCQUFLLE9BQUw7QUFDQSxpQkFBSyxPQUFMO0FBQ0EsMkJBQWUsSUFBZjtBQUNEO0FBQ0QsaUJBQU8sb0JBQVMsUUFBVCxFQUFtQixFQUFDLGdCQUFnQixpQkFBakIsRUFBb0MsaUJBQWlCLGlCQUFyRCxFQUFzRSxjQUFjLHNCQUFwRixFQUE0RixXQUFXLFlBQXZHLEVBQW5CLENBQVA7QUFDRDtBQUNGO0FBQ0QsV0FBSyxZQUFMO0FBQ0EscUJBQWUsS0FBSyxJQUFMLEVBQWY7QUFDQSxVQUFJLEtBQUssUUFBTCxDQUFjLFlBQWQsQ0FBSixFQUFpQztBQUMvQixZQUFJLFVBQVUsS0FBSyxvQkFBTCxFQUFkO0FBQ0EsWUFBSSxhQUFhLEtBQUssa0JBQUwsRUFBakI7QUFDQSxZQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLEtBQTVCLEtBQXNDLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsQ0FBVSxDQUFWLENBQWxCLEVBQWdDLFFBQWhDLENBQTFDLEVBQXFGO0FBQ25GLGVBQUssT0FBTDtBQUNBLGVBQUssT0FBTDtBQUNBLHlCQUFlLElBQWY7QUFDRDtBQUNELGVBQU8sb0JBQVMsUUFBVCxFQUFtQixFQUFDLGdCQUFnQixpQkFBakIsRUFBb0MsV0FBVyxZQUEvQyxFQUE2RCxjQUFjLE9BQTNFLEVBQW9GLGlCQUFpQixVQUFyRyxFQUFuQixDQUFQO0FBQ0QsT0FURCxNQVNPLElBQUksS0FBSyxZQUFMLENBQWtCLFlBQWxCLEVBQWdDLEdBQWhDLENBQUosRUFBMEM7QUFDL0MsWUFBSSxtQkFBbUIsS0FBSyx3QkFBTCxFQUF2QjtBQUNBLFlBQUksb0JBQWtCLEtBQUssa0JBQUwsRUFBdEI7QUFDQSxZQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLEtBQTVCLEtBQXNDLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsQ0FBVSxDQUFWLENBQWxCLEVBQWdDLFFBQWhDLENBQTFDLEVBQXFGO0FBQ25GLGVBQUssT0FBTDtBQUNBLGVBQUssT0FBTDtBQUNBLHlCQUFlLElBQWY7QUFDRDtBQUNELGVBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxnQkFBZ0IsaUJBQWpCLEVBQW9DLFdBQVcsWUFBL0MsRUFBNkQsa0JBQWtCLGdCQUEvRSxFQUFpRyxpQkFBaUIsaUJBQWxILEVBQTVCLENBQVA7QUFDRDtBQUNELFlBQU0sS0FBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLG1CQUEvQixDQUFOO0FBQ0Q7OzsrQ0FDMEI7QUFDekIsV0FBSyxlQUFMLENBQXFCLEdBQXJCO0FBQ0EsV0FBSyxlQUFMLENBQXFCLElBQXJCO0FBQ0EsYUFBTyxLQUFLLHlCQUFMLEVBQVA7QUFDRDs7OzJDQUNzQjtBQUNyQixVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsS0FBSyxZQUFMLEVBQWYsRUFBb0Msc0JBQXBDLEVBQTRDLEtBQUssT0FBakQsQ0FBYjtBQUNBLFVBQUksWUFBWSxFQUFoQjtBQUNBLGFBQU8sT0FBTyxJQUFQLENBQVksSUFBWixLQUFxQixDQUE1QixFQUErQjtBQUM3QixrQkFBVSxJQUFWLENBQWUsT0FBTyx3QkFBUCxFQUFmO0FBQ0EsZUFBTyxZQUFQO0FBQ0Q7QUFDRCxhQUFPLHFCQUFLLFNBQUwsQ0FBUDtBQUNEOzs7K0NBQzBCO0FBQ3pCLFVBQUksZUFBZSxLQUFLLElBQUwsRUFBbkI7QUFDQSxVQUFJLGdCQUFKO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsWUFBbEIsS0FBbUMsS0FBSyxTQUFMLENBQWUsWUFBZixDQUF2QyxFQUFxRTtBQUNuRSxrQkFBVSxLQUFLLE9BQUwsRUFBVjtBQUNBLFlBQUksQ0FBQyxLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLEVBQWxCLEVBQStCLElBQS9CLENBQUwsRUFBMkM7QUFDekMsaUJBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxNQUFNLElBQVAsRUFBYSxTQUFTLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxPQUFQLEVBQTlCLENBQXRCLEVBQTVCLENBQVA7QUFDRCxTQUZELE1BRU87QUFDTCxlQUFLLGVBQUwsQ0FBcUIsSUFBckI7QUFDRDtBQUNGLE9BUEQsTUFPTztBQUNMLGNBQU0sS0FBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLHNDQUEvQixDQUFOO0FBQ0Q7QUFDRCxhQUFPLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsTUFBTSxPQUFQLEVBQWdCLFNBQVMsS0FBSyx5QkFBTCxFQUF6QixFQUE1QixDQUFQO0FBQ0Q7Ozt5Q0FDb0I7QUFDbkIsV0FBSyxlQUFMLENBQXFCLE1BQXJCO0FBQ0EsVUFBSSxlQUFlLEtBQUssa0JBQUwsRUFBbkI7QUFDQSxXQUFLLGdCQUFMO0FBQ0EsYUFBTyxZQUFQO0FBQ0Q7OztnREFDMkI7QUFDMUIsVUFBSSxlQUFlLEtBQUssSUFBTCxFQUFuQjtBQUNBLFVBQUksS0FBSyxpQkFBTCxDQUF1QixZQUF2QixDQUFKLEVBQTBDO0FBQ3hDLGVBQU8sS0FBSywyQkFBTCxDQUFpQyxFQUFDLFFBQVEsS0FBVCxFQUFqQyxDQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUksS0FBSyxTQUFMLENBQWUsWUFBZixFQUE2QixPQUE3QixDQUFKLEVBQTJDO0FBQ2hELGVBQU8sS0FBSyxhQUFMLENBQW1CLEVBQUMsUUFBUSxLQUFULEVBQW5CLENBQVA7QUFDRCxPQUZNLE1BRUE7QUFDTCxlQUFPLEtBQUssaUJBQUwsRUFBUDtBQUNEO0FBQ0Y7Ozt3Q0FDbUI7QUFDbEIsVUFBSSxlQUFlLEtBQUssSUFBTCxFQUFuQjtBQUNBLFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLHNCQUFMLENBQTRCLFlBQTVCLENBQTFCLEVBQXFFO0FBQ25FLGFBQUssSUFBTCxHQUFZLEtBQUssV0FBTCxHQUFtQixNQUFuQixDQUEwQixLQUFLLElBQS9CLENBQVo7QUFDQSx1QkFBZSxLQUFLLElBQUwsRUFBZjtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssUUFBTCxDQUFjLFlBQWQsQ0FBMUIsRUFBdUQ7QUFDckQsZUFBTyxLQUFLLHNCQUFMLEVBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGdCQUFMLENBQXNCLFlBQXRCLENBQTFCLEVBQStEO0FBQzdELGVBQU8sS0FBSyxzQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxhQUFMLENBQW1CLFlBQW5CLENBQTFCLEVBQTREO0FBQzFELGVBQU8sS0FBSyxtQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxjQUFMLENBQW9CLFlBQXBCLENBQTFCLEVBQTZEO0FBQzNELGVBQU8sS0FBSyxvQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxpQkFBTCxDQUF1QixZQUF2QixDQUExQixFQUFnRTtBQUM5RCxlQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssZ0JBQUwsQ0FBc0IsWUFBdEIsQ0FBMUIsRUFBK0Q7QUFDN0QsZUFBTyxLQUFLLHNCQUFMLEVBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLG1CQUFMLENBQXlCLFlBQXpCLENBQTFCLEVBQWtFO0FBQ2hFLGVBQU8sS0FBSyx5QkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxhQUFMLENBQW1CLFlBQW5CLENBQTFCLEVBQTREO0FBQzFELGVBQU8sS0FBSyxtQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxtQkFBTCxDQUF5QixZQUF6QixDQUExQixFQUFrRTtBQUNoRSxlQUFPLEtBQUsseUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssZUFBTCxDQUFxQixZQUFyQixDQUExQixFQUE4RDtBQUM1RCxlQUFPLEtBQUsscUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssY0FBTCxDQUFvQixZQUFwQixDQUExQixFQUE2RDtBQUMzRCxlQUFPLEtBQUssb0JBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssZ0JBQUwsQ0FBc0IsWUFBdEIsQ0FBMUIsRUFBK0Q7QUFDN0QsZUFBTyxLQUFLLHNCQUFMLEVBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLFNBQUwsQ0FBZSxZQUFmLEVBQTZCLE9BQTdCLENBQTFCLEVBQWlFO0FBQy9ELGVBQU8sS0FBSyxhQUFMLENBQW1CLEVBQUMsUUFBUSxLQUFULEVBQW5CLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGlCQUFMLENBQXVCLFlBQXZCLENBQTFCLEVBQWdFO0FBQzlELGVBQU8sS0FBSywyQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxZQUFMLENBQWtCLFlBQWxCLENBQXRCLElBQXlELEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsQ0FBVSxDQUFWLENBQWxCLEVBQWdDLEdBQWhDLENBQTdELEVBQW1HO0FBQ2pHLGVBQU8sS0FBSyx3QkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsS0FBdUIsS0FBSyxrQkFBTCxDQUF3QixZQUF4QixLQUF5QyxLQUFLLGtCQUFMLENBQXdCLFlBQXhCLENBQXpDLElBQWtGLEtBQUssb0JBQUwsQ0FBMEIsWUFBMUIsQ0FBbEYsSUFBNkgsS0FBSyx3QkFBTCxDQUE4QixZQUE5QixDQUE3SCxJQUE0SyxLQUFLLHFCQUFMLENBQTJCLFlBQTNCLENBQW5NLENBQUosRUFBa1A7QUFDaFAsWUFBSSxPQUFPLG9CQUFTLDhCQUFULEVBQXlDLEVBQUMsYUFBYSxLQUFLLDJCQUFMLEVBQWQsRUFBekMsQ0FBWDtBQUNBLGFBQUssZ0JBQUw7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLHFCQUFMLENBQTJCLFlBQTNCLENBQTFCLEVBQW9FO0FBQ2xFLGVBQU8sS0FBSyx1QkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxZQUFMLENBQWtCLFlBQWxCLEVBQWdDLEdBQWhDLENBQTFCLEVBQWdFO0FBQzlELGFBQUssT0FBTDtBQUNBLGVBQU8sb0JBQVMsZ0JBQVQsRUFBMkIsRUFBM0IsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxLQUFLLDJCQUFMLEVBQVA7QUFDRDs7OytDQUMwQjtBQUN6QixVQUFJLFdBQVcsS0FBSyxlQUFMLEVBQWY7QUFDQSxVQUFJLFVBQVUsS0FBSyxlQUFMLENBQXFCLEdBQXJCLENBQWQ7QUFDQSxVQUFJLFVBQVUsS0FBSyxpQkFBTCxFQUFkO0FBQ0EsYUFBTyxvQkFBUyxrQkFBVCxFQUE2QixFQUFDLE9BQU8sUUFBUixFQUFrQixNQUFNLE9BQXhCLEVBQTdCLENBQVA7QUFDRDs7OzZDQUN3QjtBQUN2QixXQUFLLFlBQUwsQ0FBa0IsT0FBbEI7QUFDQSxVQUFJLGVBQWUsS0FBSyxJQUFMLEVBQW5CO0FBQ0EsVUFBSSxXQUFXLElBQWY7QUFDQSxVQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsS0FBbUIsQ0FBbkIsSUFBd0IsS0FBSyxZQUFMLENBQWtCLFlBQWxCLEVBQWdDLEdBQWhDLENBQTVCLEVBQWtFO0FBQ2hFLGFBQUssZ0JBQUw7QUFDQSxlQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxRQUFSLEVBQTNCLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxZQUFMLENBQWtCLFlBQWxCLEtBQW1DLEtBQUssU0FBTCxDQUFlLFlBQWYsRUFBNkIsT0FBN0IsQ0FBbkMsSUFBNEUsS0FBSyxTQUFMLENBQWUsWUFBZixFQUE2QixLQUE3QixDQUFoRixFQUFxSDtBQUNuSCxtQkFBVyxLQUFLLGtCQUFMLEVBQVg7QUFDRDtBQUNELFdBQUssZ0JBQUw7QUFDQSxhQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsT0FBTyxRQUFSLEVBQTNCLENBQVA7QUFDRDs7OzJDQUNzQjtBQUNyQixXQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDQSxVQUFJLFVBQVUsS0FBSyxhQUFMLEVBQWQ7QUFDQSxVQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLE9BQTVCLENBQUosRUFBMEM7QUFDeEMsWUFBSSxjQUFjLEtBQUssbUJBQUwsRUFBbEI7QUFDQSxZQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLFNBQTVCLENBQUosRUFBNEM7QUFDMUMsZUFBSyxPQUFMO0FBQ0EsY0FBSSxZQUFZLEtBQUssYUFBTCxFQUFoQjtBQUNBLGlCQUFPLG9CQUFTLHFCQUFULEVBQWdDLEVBQUMsTUFBTSxPQUFQLEVBQWdCLGFBQWEsV0FBN0IsRUFBMEMsV0FBVyxTQUFyRCxFQUFoQyxDQUFQO0FBQ0Q7QUFDRCxlQUFPLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxPQUFQLEVBQWdCLGFBQWEsV0FBN0IsRUFBOUIsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLFNBQUwsQ0FBZSxLQUFLLElBQUwsRUFBZixFQUE0QixTQUE1QixDQUFKLEVBQTRDO0FBQzFDLGFBQUssT0FBTDtBQUNBLFlBQUksYUFBWSxLQUFLLGFBQUwsRUFBaEI7QUFDQSxlQUFPLG9CQUFTLHFCQUFULEVBQWdDLEVBQUMsTUFBTSxPQUFQLEVBQWdCLGFBQWEsSUFBN0IsRUFBbUMsV0FBVyxVQUE5QyxFQUFoQyxDQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixLQUFLLElBQUwsRUFBakIsRUFBOEIsOEJBQTlCLENBQU47QUFDRDs7OzBDQUNxQjtBQUNwQixXQUFLLFlBQUwsQ0FBa0IsT0FBbEI7QUFDQSxVQUFJLG1CQUFtQixLQUFLLFdBQUwsRUFBdkI7QUFDQSxVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsZ0JBQWYsRUFBaUMsc0JBQWpDLEVBQXlDLEtBQUssT0FBOUMsQ0FBYjtBQUNBLFVBQUksYUFBYSxPQUFPLHFCQUFQLEVBQWpCO0FBQ0EsVUFBSSxVQUFVLEtBQUssYUFBTCxFQUFkO0FBQ0EsYUFBTyxvQkFBUyxhQUFULEVBQXdCLEVBQUMsU0FBUyxVQUFWLEVBQXNCLE1BQU0sT0FBNUIsRUFBeEIsQ0FBUDtBQUNEOzs7NkNBQ3dCO0FBQ3ZCLFdBQUssWUFBTCxDQUFrQixPQUFsQjtBQUNBLFVBQUksZ0JBQWdCLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxXQUFLLGdCQUFMO0FBQ0EsYUFBTyxvQkFBUyxnQkFBVCxFQUEyQixFQUFDLFlBQVksYUFBYixFQUEzQixDQUFQO0FBQ0Q7Ozs0Q0FDdUI7QUFDdEIsV0FBSyxZQUFMLENBQWtCLE1BQWxCO0FBQ0EsVUFBSSxlQUFlLEtBQUssV0FBTCxFQUFuQjtBQUNBLFVBQUksU0FBUyxJQUFJLFVBQUosQ0FBZSxZQUFmLEVBQTZCLHNCQUE3QixFQUFxQyxLQUFLLE9BQTFDLENBQWI7QUFDQSxVQUFJLFlBQVksT0FBTyxrQkFBUCxFQUFoQjtBQUNBLFVBQUksVUFBVSxLQUFLLGlCQUFMLEVBQWQ7QUFDQSxhQUFPLG9CQUFTLGVBQVQsRUFBMEIsRUFBQyxRQUFRLFNBQVQsRUFBb0IsTUFBTSxPQUExQixFQUExQixDQUFQO0FBQ0Q7OztnREFDMkI7QUFDMUIsV0FBSyxZQUFMLENBQWtCLFVBQWxCO0FBQ0EsYUFBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUE5QixDQUFQO0FBQ0Q7OzswQ0FDcUI7QUFDcEIsV0FBSyxZQUFMLENBQWtCLElBQWxCO0FBQ0EsVUFBSSxVQUFVLEtBQUssaUJBQUwsRUFBZDtBQUNBLFdBQUssWUFBTCxDQUFrQixPQUFsQjtBQUNBLFVBQUksY0FBYyxLQUFLLFdBQUwsRUFBbEI7QUFDQSxVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsV0FBZixFQUE0QixzQkFBNUIsRUFBb0MsS0FBSyxPQUF6QyxDQUFiO0FBQ0EsVUFBSSxVQUFVLE9BQU8sa0JBQVAsRUFBZDtBQUNBLFdBQUssZ0JBQUw7QUFDQSxhQUFPLG9CQUFTLGtCQUFULEVBQTZCLEVBQUMsTUFBTSxPQUFQLEVBQWdCLE1BQU0sT0FBdEIsRUFBN0IsQ0FBUDtBQUNEOzs7Z0RBQzJCO0FBQzFCLFVBQUksU0FBUyxLQUFLLFlBQUwsQ0FBa0IsVUFBbEIsQ0FBYjtBQUNBLFVBQUksZUFBZSxLQUFLLElBQUwsRUFBbkI7QUFDQSxVQUFJLFdBQVcsSUFBZjtBQUNBLFVBQUksS0FBSyxJQUFMLENBQVUsSUFBVixLQUFtQixDQUFuQixJQUF3QixLQUFLLFlBQUwsQ0FBa0IsWUFBbEIsRUFBZ0MsR0FBaEMsQ0FBNUIsRUFBa0U7QUFDaEUsYUFBSyxnQkFBTDtBQUNBLGVBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxPQUFPLFFBQVIsRUFBOUIsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIsWUFBMUIsTUFBNEMsS0FBSyxZQUFMLENBQWtCLFlBQWxCLEtBQW1DLEtBQUssU0FBTCxDQUFlLFlBQWYsRUFBNkIsT0FBN0IsQ0FBbkMsSUFBNEUsS0FBSyxTQUFMLENBQWUsWUFBZixFQUE2QixLQUE3QixDQUF4SCxDQUFKLEVBQWtLO0FBQ2hLLG1CQUFXLEtBQUssa0JBQUwsRUFBWDtBQUNEO0FBQ0QsV0FBSyxnQkFBTDtBQUNBLGFBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxPQUFPLFFBQVIsRUFBOUIsQ0FBUDtBQUNEOzs7OENBQ3lCO0FBQ3hCLFdBQUssWUFBTCxDQUFrQixRQUFsQjtBQUNBLFVBQUksVUFBVSxLQUFLLFdBQUwsRUFBZDtBQUNBLFVBQUksU0FBUyxJQUFJLFVBQUosQ0FBZSxPQUFmLEVBQXdCLHNCQUF4QixFQUFnQyxLQUFLLE9BQXJDLENBQWI7QUFDQSxVQUFJLGtCQUFrQixPQUFPLGtCQUFQLEVBQXRCO0FBQ0EsVUFBSSxVQUFVLEtBQUssWUFBTCxFQUFkO0FBQ0EsVUFBSSxRQUFRLElBQVIsS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsZUFBTyxvQkFBUyxpQkFBVCxFQUE0QixFQUFDLGNBQWMsZUFBZixFQUFnQyxPQUFPLHNCQUF2QyxFQUE1QixDQUFQO0FBQ0Q7QUFDRCxlQUFTLElBQUksVUFBSixDQUFlLE9BQWYsRUFBd0Isc0JBQXhCLEVBQWdDLEtBQUssT0FBckMsQ0FBVDtBQUNBLFVBQUksV0FBVyxPQUFPLG1CQUFQLEVBQWY7QUFDQSxVQUFJLGVBQWUsT0FBTyxJQUFQLEVBQW5CO0FBQ0EsVUFBSSxPQUFPLFNBQVAsQ0FBaUIsWUFBakIsRUFBK0IsU0FBL0IsQ0FBSixFQUErQztBQUM3QyxZQUFJLGNBQWMsT0FBTyxxQkFBUCxFQUFsQjtBQUNBLFlBQUksbUJBQW1CLE9BQU8sbUJBQVAsRUFBdkI7QUFDQSxlQUFPLG9CQUFTLDRCQUFULEVBQXVDLEVBQUMsY0FBYyxlQUFmLEVBQWdDLGlCQUFpQixRQUFqRCxFQUEyRCxhQUFhLFdBQXhFLEVBQXFGLGtCQUFrQixnQkFBdkcsRUFBdkMsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxvQkFBUyxpQkFBVCxFQUE0QixFQUFDLGNBQWMsZUFBZixFQUFnQyxPQUFPLFFBQXZDLEVBQTVCLENBQVA7QUFDRDs7OzBDQUNxQjtBQUNwQixVQUFJLFdBQVcsRUFBZjtBQUNBLGFBQU8sRUFBRSxLQUFLLElBQUwsQ0FBVSxJQUFWLEtBQW1CLENBQW5CLElBQXdCLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLFNBQTVCLENBQTFCLENBQVAsRUFBMEU7QUFDeEUsaUJBQVMsSUFBVCxDQUFjLEtBQUssa0JBQUwsRUFBZDtBQUNEO0FBQ0QsYUFBTyxxQkFBSyxRQUFMLENBQVA7QUFDRDs7O3lDQUNvQjtBQUNuQixXQUFLLFlBQUwsQ0FBa0IsTUFBbEI7QUFDQSxhQUFPLG9CQUFTLFlBQVQsRUFBdUIsRUFBQyxNQUFNLEtBQUssa0JBQUwsRUFBUCxFQUFrQyxZQUFZLEtBQUssc0JBQUwsRUFBOUMsRUFBdkIsQ0FBUDtBQUNEOzs7NkNBQ3dCO0FBQ3ZCLFdBQUssZUFBTCxDQUFxQixHQUFyQjtBQUNBLGFBQU8sS0FBSyxxQ0FBTCxFQUFQO0FBQ0Q7Ozs0REFDdUM7QUFDdEMsVUFBSSxZQUFZLEVBQWhCO0FBQ0EsYUFBTyxFQUFFLEtBQUssSUFBTCxDQUFVLElBQVYsS0FBbUIsQ0FBbkIsSUFBd0IsS0FBSyxTQUFMLENBQWUsS0FBSyxJQUFMLEVBQWYsRUFBNEIsU0FBNUIsQ0FBeEIsSUFBa0UsS0FBSyxTQUFMLENBQWUsS0FBSyxJQUFMLEVBQWYsRUFBNEIsTUFBNUIsQ0FBcEUsQ0FBUCxFQUFpSDtBQUMvRyxrQkFBVSxJQUFWLENBQWUsS0FBSyx5QkFBTCxFQUFmO0FBQ0Q7QUFDRCxhQUFPLHFCQUFLLFNBQUwsQ0FBUDtBQUNEOzs7NENBQ3VCO0FBQ3RCLFdBQUssWUFBTCxDQUFrQixTQUFsQjtBQUNBLGFBQU8sb0JBQVMsZUFBVCxFQUEwQixFQUFDLFlBQVksS0FBSyxzQkFBTCxFQUFiLEVBQTFCLENBQVA7QUFDRDs7OzJDQUNzQjtBQUNyQixXQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDQSxVQUFJLFVBQVUsS0FBSyxXQUFMLEVBQWQ7QUFDQSxVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsT0FBZixFQUF3QixzQkFBeEIsRUFBZ0MsS0FBSyxPQUFyQyxDQUFiO0FBQ0EsVUFBSSxxQkFBSjtVQUFrQixnQkFBbEI7VUFBMkIsZ0JBQTNCO1VBQW9DLGlCQUFwQztVQUE4QyxnQkFBOUM7VUFBdUQsZ0JBQXZEO1VBQWdFLGtCQUFoRTtBQUNBLFVBQUksT0FBTyxZQUFQLENBQW9CLE9BQU8sSUFBUCxFQUFwQixFQUFtQyxHQUFuQyxDQUFKLEVBQTZDO0FBQzNDLGVBQU8sT0FBUDtBQUNBLFlBQUksQ0FBQyxPQUFPLFlBQVAsQ0FBb0IsT0FBTyxJQUFQLEVBQXBCLEVBQW1DLEdBQW5DLENBQUwsRUFBOEM7QUFDNUMsb0JBQVUsT0FBTyxrQkFBUCxFQUFWO0FBQ0Q7QUFDRCxlQUFPLGVBQVAsQ0FBdUIsR0FBdkI7QUFDQSxZQUFJLE9BQU8sSUFBUCxDQUFZLElBQVosS0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIscUJBQVcsT0FBTyxrQkFBUCxFQUFYO0FBQ0Q7QUFDRCxlQUFPLG9CQUFTLGNBQVQsRUFBeUIsRUFBQyxNQUFNLElBQVAsRUFBYSxNQUFNLE9BQW5CLEVBQTRCLFFBQVEsUUFBcEMsRUFBOEMsTUFBTSxLQUFLLGlCQUFMLEVBQXBELEVBQXpCLENBQVA7QUFDRCxPQVZELE1BVU87QUFDTCx1QkFBZSxPQUFPLElBQVAsRUFBZjtBQUNBLFlBQUksT0FBTyxrQkFBUCxDQUEwQixZQUExQixLQUEyQyxPQUFPLGtCQUFQLENBQTBCLFlBQTFCLENBQTNDLElBQXNGLE9BQU8sb0JBQVAsQ0FBNEIsWUFBNUIsQ0FBMUYsRUFBcUk7QUFDbkksb0JBQVUsT0FBTywyQkFBUCxFQUFWO0FBQ0EseUJBQWUsT0FBTyxJQUFQLEVBQWY7QUFDQSxjQUFJLEtBQUssU0FBTCxDQUFlLFlBQWYsRUFBNkIsSUFBN0IsS0FBc0MsS0FBSyxZQUFMLENBQWtCLFlBQWxCLEVBQWdDLElBQWhDLENBQTFDLEVBQWlGO0FBQy9FLGdCQUFJLEtBQUssU0FBTCxDQUFlLFlBQWYsRUFBNkIsSUFBN0IsQ0FBSixFQUF3QztBQUN0QyxxQkFBTyxPQUFQO0FBQ0EseUJBQVcsT0FBTyxrQkFBUCxFQUFYO0FBQ0Esd0JBQVUsZ0JBQVY7QUFDRCxhQUpELE1BSU8sSUFBSSxLQUFLLFlBQUwsQ0FBa0IsWUFBbEIsRUFBZ0MsSUFBaEMsQ0FBSixFQUEyQztBQUNoRCxxQkFBTyxPQUFQO0FBQ0EseUJBQVcsT0FBTyxrQkFBUCxFQUFYO0FBQ0Esd0JBQVUsZ0JBQVY7QUFDRDtBQUNELG1CQUFPLG9CQUFTLE9BQVQsRUFBa0IsRUFBQyxNQUFNLE9BQVAsRUFBZ0IsT0FBTyxRQUF2QixFQUFpQyxNQUFNLEtBQUssaUJBQUwsRUFBdkMsRUFBbEIsQ0FBUDtBQUNEO0FBQ0QsaUJBQU8sZUFBUCxDQUF1QixHQUF2QjtBQUNBLGNBQUksT0FBTyxZQUFQLENBQW9CLE9BQU8sSUFBUCxFQUFwQixFQUFtQyxHQUFuQyxDQUFKLEVBQTZDO0FBQzNDLG1CQUFPLE9BQVA7QUFDQSxzQkFBVSxJQUFWO0FBQ0QsV0FIRCxNQUdPO0FBQ0wsc0JBQVUsT0FBTyxrQkFBUCxFQUFWO0FBQ0EsbUJBQU8sZUFBUCxDQUF1QixHQUF2QjtBQUNEO0FBQ0Qsc0JBQVksT0FBTyxrQkFBUCxFQUFaO0FBQ0QsU0F4QkQsTUF3Qk87QUFDTCxjQUFJLEtBQUssU0FBTCxDQUFlLE9BQU8sSUFBUCxDQUFZLENBQVosQ0FBZixFQUErQixJQUEvQixLQUF3QyxLQUFLLFlBQUwsQ0FBa0IsT0FBTyxJQUFQLENBQVksQ0FBWixDQUFsQixFQUFrQyxJQUFsQyxDQUE1QyxFQUFxRjtBQUNuRixzQkFBVSxPQUFPLHlCQUFQLEVBQVY7QUFDQSxnQkFBSSxPQUFPLE9BQU8sT0FBUCxFQUFYO0FBQ0EsZ0JBQUksS0FBSyxTQUFMLENBQWUsSUFBZixFQUFxQixJQUFyQixDQUFKLEVBQWdDO0FBQzlCLHdCQUFVLGdCQUFWO0FBQ0QsYUFGRCxNQUVPO0FBQ0wsd0JBQVUsZ0JBQVY7QUFDRDtBQUNELHVCQUFXLE9BQU8sa0JBQVAsRUFBWDtBQUNBLG1CQUFPLG9CQUFTLE9BQVQsRUFBa0IsRUFBQyxNQUFNLE9BQVAsRUFBZ0IsT0FBTyxRQUF2QixFQUFpQyxNQUFNLEtBQUssaUJBQUwsRUFBdkMsRUFBbEIsQ0FBUDtBQUNEO0FBQ0Qsb0JBQVUsT0FBTyxrQkFBUCxFQUFWO0FBQ0EsaUJBQU8sZUFBUCxDQUF1QixHQUF2QjtBQUNBLGNBQUksT0FBTyxZQUFQLENBQW9CLE9BQU8sSUFBUCxFQUFwQixFQUFtQyxHQUFuQyxDQUFKLEVBQTZDO0FBQzNDLG1CQUFPLE9BQVA7QUFDQSxzQkFBVSxJQUFWO0FBQ0QsV0FIRCxNQUdPO0FBQ0wsc0JBQVUsT0FBTyxrQkFBUCxFQUFWO0FBQ0EsbUJBQU8sZUFBUCxDQUF1QixHQUF2QjtBQUNEO0FBQ0Qsc0JBQVksT0FBTyxrQkFBUCxFQUFaO0FBQ0Q7QUFDRCxlQUFPLG9CQUFTLGNBQVQsRUFBeUIsRUFBQyxNQUFNLE9BQVAsRUFBZ0IsTUFBTSxPQUF0QixFQUErQixRQUFRLFNBQXZDLEVBQWtELE1BQU0sS0FBSyxpQkFBTCxFQUF4RCxFQUF6QixDQUFQO0FBQ0Q7QUFDRjs7OzBDQUNxQjtBQUNwQixXQUFLLFlBQUwsQ0FBa0IsSUFBbEI7QUFDQSxVQUFJLFVBQVUsS0FBSyxXQUFMLEVBQWQ7QUFDQSxVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsT0FBZixFQUF3QixzQkFBeEIsRUFBZ0MsS0FBSyxPQUFyQyxDQUFiO0FBQ0EsVUFBSSxlQUFlLE9BQU8sSUFBUCxFQUFuQjtBQUNBLFVBQUksVUFBVSxPQUFPLGtCQUFQLEVBQWQ7QUFDQSxVQUFJLFlBQVksSUFBaEIsRUFBc0I7QUFDcEIsY0FBTSxPQUFPLFdBQVAsQ0FBbUIsWUFBbkIsRUFBaUMseUJBQWpDLENBQU47QUFDRDtBQUNELFVBQUksZ0JBQWdCLEtBQUssaUJBQUwsRUFBcEI7QUFDQSxVQUFJLGVBQWUsSUFBbkI7QUFDQSxVQUFJLEtBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFmLEVBQTRCLE1BQTVCLENBQUosRUFBeUM7QUFDdkMsYUFBSyxPQUFMO0FBQ0EsdUJBQWUsS0FBSyxpQkFBTCxFQUFmO0FBQ0Q7QUFDRCxhQUFPLG9CQUFTLGFBQVQsRUFBd0IsRUFBQyxNQUFNLE9BQVAsRUFBZ0IsWUFBWSxhQUE1QixFQUEyQyxXQUFXLFlBQXRELEVBQXhCLENBQVA7QUFDRDs7OzZDQUN3QjtBQUN2QixXQUFLLFlBQUwsQ0FBa0IsT0FBbEI7QUFDQSxVQUFJLFVBQVUsS0FBSyxXQUFMLEVBQWQ7QUFDQSxVQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsT0FBZixFQUF3QixzQkFBeEIsRUFBZ0MsS0FBSyxPQUFyQyxDQUFiO0FBQ0EsVUFBSSxlQUFlLE9BQU8sSUFBUCxFQUFuQjtBQUNBLFVBQUksV0FBVyxPQUFPLGtCQUFQLEVBQWY7QUFDQSxVQUFJLGFBQWEsSUFBakIsRUFBdUI7QUFDckIsY0FBTSxPQUFPLFdBQVAsQ0FBbUIsWUFBbkIsRUFBaUMseUJBQWpDLENBQU47QUFDRDtBQUNELFVBQUksV0FBVyxLQUFLLGlCQUFMLEVBQWY7QUFDQSxhQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsTUFBTSxRQUFQLEVBQWlCLE1BQU0sUUFBdkIsRUFBM0IsQ0FBUDtBQUNEOzs7NkNBQ3dCO0FBQ3ZCLGFBQU8sb0JBQVMsZ0JBQVQsRUFBMkIsRUFBQyxPQUFPLEtBQUssYUFBTCxFQUFSLEVBQTNCLENBQVA7QUFDRDs7O29DQUNlO0FBQ2QsVUFBSSxRQUFRLEtBQUssWUFBTCxFQUFaO0FBQ0EsVUFBSSxXQUFXLEVBQWY7QUFDQSxVQUFJLFVBQVUsSUFBSSxVQUFKLENBQWUsS0FBZixFQUFzQixzQkFBdEIsRUFBOEIsS0FBSyxPQUFuQyxDQUFkO0FBQ0EsYUFBTyxRQUFRLElBQVIsQ0FBYSxJQUFiLEtBQXNCLENBQTdCLEVBQWdDO0FBQzlCLFlBQUksWUFBWSxRQUFRLElBQVIsRUFBaEI7QUFDQSxZQUFJLE9BQU8sUUFBUSxpQkFBUixFQUFYO0FBQ0EsWUFBSSxRQUFRLElBQVosRUFBa0I7QUFDaEIsZ0JBQU0sUUFBUSxXQUFSLENBQW9CLFNBQXBCLEVBQStCLGlCQUEvQixDQUFOO0FBQ0Q7QUFDRCxpQkFBUyxJQUFULENBQWMsSUFBZDtBQUNEO0FBQ0QsYUFBTyxvQkFBUyxPQUFULEVBQWtCLEVBQUMsWUFBWSxxQkFBSyxRQUFMLENBQWIsRUFBbEIsQ0FBUDtBQUNEOzs7d0NBQ2tDO0FBQUEsVUFBcEIsTUFBb0IsUUFBcEIsTUFBb0I7QUFBQSxVQUFaLFNBQVksUUFBWixTQUFZOztBQUNqQyxVQUFJLFNBQVMsS0FBSyxPQUFMLEVBQWI7QUFDQSxVQUFJLFdBQVcsSUFBZjtVQUFxQixXQUFXLElBQWhDO0FBQ0EsVUFBSSxXQUFXLFNBQVMsaUJBQVQsR0FBNkIsa0JBQTVDO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLEVBQWxCLENBQUosRUFBb0M7QUFDbEMsbUJBQVcsS0FBSyx5QkFBTCxFQUFYO0FBQ0QsT0FGRCxNQUVPLElBQUksQ0FBQyxNQUFMLEVBQWE7QUFDbEIsWUFBSSxTQUFKLEVBQWU7QUFDYixxQkFBVyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0saUJBQU8sY0FBUCxDQUFzQixVQUF0QixFQUFrQyxNQUFsQyxDQUFQLEVBQTlCLENBQVg7QUFDRCxTQUZELE1BRU87QUFDTCxnQkFBTSxLQUFLLFdBQUwsQ0FBaUIsS0FBSyxJQUFMLEVBQWpCLEVBQThCLG1CQUE5QixDQUFOO0FBQ0Q7QUFDRjtBQUNELFVBQUksS0FBSyxTQUFMLENBQWUsS0FBSyxJQUFMLEVBQWYsRUFBNEIsU0FBNUIsQ0FBSixFQUE0QztBQUMxQyxhQUFLLE9BQUw7QUFDQSxtQkFBVyxLQUFLLHNCQUFMLEVBQVg7QUFDRDtBQUNELFVBQUksZUFBZSxFQUFuQjtBQUNBLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxLQUFLLFlBQUwsRUFBZixFQUFvQyxzQkFBcEMsRUFBNEMsS0FBSyxPQUFqRCxDQUFkO0FBQ0EsYUFBTyxRQUFRLElBQVIsQ0FBYSxJQUFiLEtBQXNCLENBQTdCLEVBQWdDO0FBQzlCLFlBQUksUUFBUSxZQUFSLENBQXFCLFFBQVEsSUFBUixFQUFyQixFQUFxQyxHQUFyQyxDQUFKLEVBQStDO0FBQzdDLGtCQUFRLE9BQVI7QUFDQTtBQUNEO0FBQ0QsWUFBSSxXQUFXLEtBQWY7O0FBTDhCLG9DQU1KLFFBQVEsd0JBQVIsRUFOSTs7QUFBQSxZQU16QixXQU55Qix5QkFNekIsV0FOeUI7QUFBQSxZQU1aLElBTlkseUJBTVosSUFOWTs7QUFPOUIsWUFBSSxTQUFTLFlBQVQsSUFBeUIsWUFBWSxLQUFaLENBQWtCLEdBQWxCLE9BQTRCLFFBQXpELEVBQW1FO0FBQ2pFLHFCQUFXLElBQVg7O0FBRGlFLHVDQUUxQyxRQUFRLHdCQUFSLEVBRjBDOztBQUUvRCxxQkFGK0QsMEJBRS9ELFdBRitEO0FBRWxELGNBRmtELDBCQUVsRCxJQUZrRDtBQUdsRTtBQUNELFlBQUksU0FBUyxRQUFiLEVBQXVCO0FBQ3JCLHVCQUFhLElBQWIsQ0FBa0Isb0JBQVMsY0FBVCxFQUF5QixFQUFDLFVBQVUsUUFBWCxFQUFxQixRQUFRLFdBQTdCLEVBQXpCLENBQWxCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsZ0JBQU0sS0FBSyxXQUFMLENBQWlCLFFBQVEsSUFBUixFQUFqQixFQUFpQyxxQ0FBakMsQ0FBTjtBQUNEO0FBQ0Y7QUFDRCxhQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxNQUFNLFFBQVAsRUFBaUIsT0FBTyxRQUF4QixFQUFrQyxVQUFVLHFCQUFLLFlBQUwsQ0FBNUMsRUFBbkIsQ0FBUDtBQUNEOzs7NENBQzZDO0FBQUEsd0VBQUosRUFBSTs7QUFBQSxVQUF2QixlQUF1QixTQUF2QixlQUF1Qjs7QUFDNUMsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsS0FBb0MsS0FBSyxTQUFMLENBQWUsYUFBZixDQUFwQyxJQUFxRSxtQkFBbUIsS0FBSyxZQUFMLENBQWtCLGFBQWxCLENBQTVGLEVBQThIO0FBQzVILGVBQU8sS0FBSyx5QkFBTCxDQUErQixFQUFDLGlCQUFpQixlQUFsQixFQUEvQixDQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUksS0FBSyxVQUFMLENBQWdCLGFBQWhCLENBQUosRUFBb0M7QUFDekMsZUFBTyxLQUFLLG9CQUFMLEVBQVA7QUFDRCxPQUZNLE1BRUEsSUFBSSxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQUosRUFBa0M7QUFDdkMsZUFBTyxLQUFLLHFCQUFMLEVBQVA7QUFDRDtBQUNELDBCQUFPLEtBQVAsRUFBYyxxQkFBZDtBQUNEOzs7NENBQ3VCO0FBQ3RCLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxLQUFLLFlBQUwsRUFBZixFQUFvQyxzQkFBcEMsRUFBNEMsS0FBSyxPQUFqRCxDQUFkO0FBQ0EsVUFBSSxpQkFBaUIsRUFBckI7QUFDQSxhQUFPLFFBQVEsSUFBUixDQUFhLElBQWIsS0FBc0IsQ0FBN0IsRUFBZ0M7QUFDOUIsdUJBQWUsSUFBZixDQUFvQixRQUFRLHVCQUFSLEVBQXBCO0FBQ0EsZ0JBQVEsWUFBUjtBQUNEO0FBQ0QsYUFBTyxvQkFBUyxlQUFULEVBQTBCLEVBQUMsWUFBWSxxQkFBSyxjQUFMLENBQWIsRUFBMUIsQ0FBUDtBQUNEOzs7OENBQ3lCO0FBQ3hCLFVBQUksZ0JBQWdCLEtBQUssSUFBTCxFQUFwQjs7QUFEd0Isa0NBRUYsS0FBSyxvQkFBTCxFQUZFOztBQUFBLFVBRW5CLElBRm1CLHlCQUVuQixJQUZtQjtBQUFBLFVBRWIsT0FGYSx5QkFFYixPQUZhOztBQUd4QixVQUFJLEtBQUssWUFBTCxDQUFrQixhQUFsQixLQUFvQyxLQUFLLFNBQUwsQ0FBZSxhQUFmLEVBQThCLEtBQTlCLENBQXBDLElBQTRFLEtBQUssU0FBTCxDQUFlLGFBQWYsRUFBOEIsT0FBOUIsQ0FBaEYsRUFBd0g7QUFDdEgsWUFBSSxDQUFDLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsRUFBbEIsRUFBK0IsR0FBL0IsQ0FBTCxFQUEwQztBQUN4QyxjQUFJLGVBQWUsSUFBbkI7QUFDQSxjQUFJLEtBQUssUUFBTCxDQUFjLEtBQUssSUFBTCxFQUFkLENBQUosRUFBZ0M7QUFDOUIsaUJBQUssT0FBTDtBQUNBLGdCQUFJLE9BQU8sS0FBSyxzQkFBTCxFQUFYO0FBQ0EsMkJBQWUsSUFBZjtBQUNEO0FBQ0QsaUJBQU8sb0JBQVMsMkJBQVQsRUFBc0MsRUFBQyxTQUFTLE9BQVYsRUFBbUIsTUFBTSxZQUF6QixFQUF0QyxDQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQUssZUFBTCxDQUFxQixHQUFyQjtBQUNBLGdCQUFVLEtBQUssc0JBQUwsRUFBVjtBQUNBLGFBQU8sb0JBQVMseUJBQVQsRUFBb0MsRUFBQyxNQUFNLElBQVAsRUFBYSxTQUFTLE9BQXRCLEVBQXBDLENBQVA7QUFDRDs7OzJDQUNzQjtBQUNyQixVQUFJLGNBQWMsS0FBSyxZQUFMLEVBQWxCO0FBQ0EsVUFBSSxVQUFVLElBQUksVUFBSixDQUFlLFdBQWYsRUFBNEIsc0JBQTVCLEVBQW9DLEtBQUssT0FBekMsQ0FBZDtBQUNBLFVBQUksZUFBZSxFQUFuQjtVQUF1QixrQkFBa0IsSUFBekM7QUFDQSxhQUFPLFFBQVEsSUFBUixDQUFhLElBQWIsS0FBc0IsQ0FBN0IsRUFBZ0M7QUFDOUIsWUFBSSxXQUFKO0FBQ0EsWUFBSSxRQUFRLFlBQVIsQ0FBcUIsUUFBUSxJQUFSLEVBQXJCLEVBQXFDLEdBQXJDLENBQUosRUFBK0M7QUFDN0Msa0JBQVEsWUFBUjtBQUNBLGVBQUssSUFBTDtBQUNELFNBSEQsTUFHTztBQUNMLGNBQUksUUFBUSxZQUFSLENBQXFCLFFBQVEsSUFBUixFQUFyQixFQUFxQyxLQUFyQyxDQUFKLEVBQWlEO0FBQy9DLG9CQUFRLE9BQVI7QUFDQSw4QkFBa0IsUUFBUSxxQkFBUixFQUFsQjtBQUNBO0FBQ0QsV0FKRCxNQUlPO0FBQ0wsaUJBQUssUUFBUSxzQkFBUixFQUFMO0FBQ0Q7QUFDRCxrQkFBUSxZQUFSO0FBQ0Q7QUFDRCxxQkFBYSxJQUFiLENBQWtCLEVBQWxCO0FBQ0Q7QUFDRCxhQUFPLG9CQUFTLGNBQVQsRUFBeUIsRUFBQyxVQUFVLHFCQUFLLFlBQUwsQ0FBWCxFQUErQixhQUFhLGVBQTVDLEVBQXpCLENBQVA7QUFDRDs7OzZDQUN3QjtBQUN2QixVQUFJLGNBQWMsS0FBSyxxQkFBTCxFQUFsQjtBQUNBLFVBQUksS0FBSyxRQUFMLENBQWMsS0FBSyxJQUFMLEVBQWQsQ0FBSixFQUFnQztBQUM5QixhQUFLLE9BQUw7QUFDQSxZQUFJLE9BQU8sS0FBSyxzQkFBTCxFQUFYO0FBQ0Esc0JBQWMsb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxTQUFTLFdBQVYsRUFBdUIsTUFBTSxJQUE3QixFQUEvQixDQUFkO0FBQ0Q7QUFDRCxhQUFPLFdBQVA7QUFDRDs7O2dEQUNpRDtBQUFBLHdFQUFKLEVBQUk7O0FBQUEsVUFBdkIsZUFBdUIsU0FBdkIsZUFBdUI7O0FBQ2hELFVBQUksaUJBQUo7QUFDQSxVQUFJLG1CQUFtQixLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLEVBQWxCLENBQXZCLEVBQXVEO0FBQ3JELG1CQUFXLEtBQUssa0JBQUwsRUFBWDtBQUNELE9BRkQsTUFFTztBQUNMLG1CQUFXLEtBQUssa0JBQUwsRUFBWDtBQUNEO0FBQ0QsYUFBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0sUUFBUCxFQUE5QixDQUFQO0FBQ0Q7Ozt5Q0FDb0I7QUFDbkIsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsQ0FBSixFQUFzQztBQUNwQyxlQUFPLEtBQUssT0FBTCxFQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyx3QkFBaEMsQ0FBTjtBQUNEOzs7eUNBQ29CO0FBQ25CLFVBQUksZ0JBQWdCLEtBQUssSUFBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLGFBQWxCLEtBQW9DLEtBQUssU0FBTCxDQUFlLGFBQWYsQ0FBeEMsRUFBdUU7QUFDckUsZUFBTyxLQUFLLE9BQUwsRUFBUDtBQUNEO0FBQ0QsWUFBTSxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsRUFBZ0MseUJBQWhDLENBQU47QUFDRDs7OzhDQUN5QjtBQUN4QixVQUFJLFNBQVMsS0FBSyxPQUFMLEVBQWI7QUFDQSxVQUFJLGdCQUFnQixLQUFLLElBQUwsRUFBcEI7QUFDQSxVQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsS0FBbUIsQ0FBbkIsSUFBd0IsaUJBQWlCLENBQUMsS0FBSyxZQUFMLENBQWtCLE1BQWxCLEVBQTBCLGFBQTFCLENBQTlDLEVBQXdGO0FBQ3RGLGVBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxZQUFZLElBQWIsRUFBNUIsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxXQUFXLElBQWY7QUFDQSxVQUFJLENBQUMsS0FBSyxZQUFMLENBQWtCLGFBQWxCLEVBQWlDLEdBQWpDLENBQUwsRUFBNEM7QUFDMUMsbUJBQVcsS0FBSyxrQkFBTCxFQUFYO0FBQ0EsNEJBQU8sWUFBWSxJQUFuQixFQUF5QixrREFBekIsRUFBNkUsYUFBN0UsRUFBNEYsS0FBSyxJQUFqRztBQUNEO0FBQ0QsV0FBSyxnQkFBTDtBQUNBLGFBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxZQUFZLFFBQWIsRUFBNUIsQ0FBUDtBQUNEOzs7a0RBQzZCO0FBQzVCLFVBQUksaUJBQUo7QUFDQSxVQUFJLGdCQUFnQixLQUFLLE9BQUwsRUFBcEI7QUFDQSxVQUFJLGNBQWMsYUFBbEI7QUFDQSxVQUFJLGVBQWUsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixZQUFZLE9BQVosRUFBckIsdUNBQW5CLEVBQTBGO0FBQ3hGLG1CQUFXLEtBQVg7QUFDRCxPQUZELE1BRU8sSUFBSSxlQUFlLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsWUFBWSxPQUFaLEVBQXJCLGtDQUFuQixFQUFxRjtBQUMxRixtQkFBVyxLQUFYO0FBQ0QsT0FGTSxNQUVBLElBQUksZUFBZSxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFlBQVksT0FBWixFQUFyQixvQ0FBbkIsRUFBdUY7QUFDNUYsbUJBQVcsT0FBWDtBQUNELE9BRk0sTUFFQSxJQUFJLGVBQWUsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixZQUFZLE9BQVosRUFBckIscUNBQW5CLEVBQXdGO0FBQzdGLG1CQUFXLFFBQVg7QUFDRCxPQUZNLE1BRUEsSUFBSSxlQUFlLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsWUFBWSxPQUFaLEVBQXJCLHdDQUFuQixFQUEyRjtBQUNoRyxtQkFBVyxXQUFYO0FBQ0Q7QUFDRCxVQUFJLFlBQVksc0JBQWhCO0FBQ0EsYUFBTyxJQUFQLEVBQWE7QUFDWCxZQUFJLE9BQU8sS0FBSywwQkFBTCxDQUFnQyxFQUFDLFVBQVUsYUFBYSxRQUFiLElBQXlCLGFBQWEsV0FBakQsRUFBaEMsQ0FBWDtBQUNBLFlBQUksY0FBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0Esb0JBQVksVUFBVSxNQUFWLENBQWlCLElBQWpCLENBQVo7QUFDQSxZQUFJLEtBQUssWUFBTCxDQUFrQixXQUFsQixFQUFpQyxHQUFqQyxDQUFKLEVBQTJDO0FBQ3pDLGVBQUssT0FBTDtBQUNELFNBRkQsTUFFTztBQUNMO0FBQ0Q7QUFDRjtBQUNELGFBQU8sb0JBQVMscUJBQVQsRUFBZ0MsRUFBQyxNQUFNLFFBQVAsRUFBaUIsYUFBYSxTQUE5QixFQUFoQyxDQUFQO0FBQ0Q7OztzREFDc0M7QUFBQSxVQUFYLFFBQVcsU0FBWCxRQUFXOztBQUNyQyxVQUFJLFNBQVMsS0FBSyxxQkFBTCxDQUEyQixFQUFDLGlCQUFpQixRQUFsQixFQUEzQixDQUFiO0FBQ0EsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxpQkFBSjtVQUFjLGlCQUFkO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsR0FBakMsQ0FBSixFQUEyQztBQUN6QyxhQUFLLE9BQUw7QUFDQSxZQUFJLE1BQU0sSUFBSSxVQUFKLENBQWUsS0FBSyxJQUFwQixFQUEwQixzQkFBMUIsRUFBa0MsS0FBSyxPQUF2QyxDQUFWO0FBQ0EsbUJBQVcsSUFBSSxRQUFKLENBQWEsWUFBYixDQUFYO0FBQ0EsYUFBSyxJQUFMLEdBQVksSUFBSSxJQUFoQjtBQUNELE9BTEQsTUFLTztBQUNMLG1CQUFXLElBQVg7QUFDRDtBQUNELGFBQU8sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxTQUFTLE1BQVYsRUFBa0IsTUFBTSxRQUF4QixFQUEvQixDQUFQO0FBQ0Q7OztrREFDNkI7QUFDNUIsVUFBSSxZQUFZLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxDQUFkLENBQWhCO0FBQ0EsVUFBSSxXQUFXLEtBQUssa0JBQUwsRUFBZjtBQUNBLFVBQUksYUFBYSxJQUFqQixFQUF1QjtBQUNyQixjQUFNLEtBQUssV0FBTCxDQUFpQixTQUFqQixFQUE0Qix3QkFBNUIsQ0FBTjtBQUNEO0FBQ0QsV0FBSyxnQkFBTDtBQUNBLGFBQU8sb0JBQVMscUJBQVQsRUFBZ0MsRUFBQyxZQUFZLFFBQWIsRUFBaEMsQ0FBUDtBQUNEOzs7eUNBQ29CO0FBQ25CLFVBQUksV0FBVyxLQUFLLHNCQUFMLEVBQWY7QUFDQSxVQUFJLGdCQUFnQixLQUFLLElBQUwsRUFBcEI7QUFDQSxVQUFJLEtBQUssWUFBTCxDQUFrQixhQUFsQixFQUFpQyxHQUFqQyxDQUFKLEVBQTJDO0FBQ3pDLGVBQU8sS0FBSyxJQUFMLENBQVUsSUFBVixLQUFtQixDQUExQixFQUE2QjtBQUMzQixjQUFJLENBQUMsS0FBSyxZQUFMLENBQWtCLEtBQUssSUFBTCxFQUFsQixFQUErQixHQUEvQixDQUFMLEVBQTBDO0FBQ3hDO0FBQ0Q7QUFDRCxjQUFJLFdBQVcsS0FBSyxPQUFMLEVBQWY7QUFDQSxjQUFJLFFBQVEsS0FBSyxzQkFBTCxFQUFaO0FBQ0EscUJBQVcsb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxNQUFNLFFBQVAsRUFBaUIsVUFBVSxRQUEzQixFQUFxQyxPQUFPLEtBQTVDLEVBQTdCLENBQVg7QUFDRDtBQUNGO0FBQ0QsV0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLGFBQU8sUUFBUDtBQUNEOzs7NkNBQ3dCO0FBQ3ZCLFdBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxXQUFLLEtBQUwsR0FBYSxFQUFDLE1BQU0sQ0FBUCxFQUFVLFNBQVM7QUFBQSxpQkFBUyxLQUFUO0FBQUEsU0FBbkIsRUFBbUMsT0FBTyxzQkFBMUMsRUFBYjtBQUNBLFNBQUc7QUFDRCxZQUFJLE9BQU8sS0FBSyw0QkFBTCxFQUFYO0FBQ0EsWUFBSSxTQUFTLHNCQUFULElBQW1DLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsSUFBakIsR0FBd0IsQ0FBL0QsRUFBa0U7QUFDaEUsZUFBSyxJQUFMLEdBQVksS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixLQUFLLElBQXhCLENBQVo7O0FBRGdFLGtDQUUxQyxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLEVBRjBDOztBQUFBLGNBRTNELElBRjJELHFCQUUzRCxJQUYyRDtBQUFBLGNBRXJELE9BRnFELHFCQUVyRCxPQUZxRDs7QUFHaEUsZUFBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixJQUFsQjtBQUNBLGVBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsT0FBckI7QUFDQSxlQUFLLEtBQUwsQ0FBVyxLQUFYLEdBQW1CLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsR0FBakIsRUFBbkI7QUFDRCxTQU5ELE1BTU8sSUFBSSxTQUFTLHNCQUFiLEVBQXFDO0FBQzFDO0FBQ0QsU0FGTSxNQUVBLElBQUksU0FBUyxxQkFBVCxJQUFrQyxTQUFTLHNCQUEvQyxFQUF1RTtBQUM1RSxlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0QsU0FGTSxNQUVBO0FBQ0wsZUFBSyxJQUFMLEdBQVksSUFBWjtBQUNEO0FBQ0YsT0FmRCxRQWVTLElBZlQ7QUFnQkEsYUFBTyxLQUFLLElBQVo7QUFDRDs7O21EQUM4QjtBQUM3QixVQUFJLGdCQUFnQixLQUFLLElBQUwsRUFBcEI7QUFDQSxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxNQUFMLENBQVksYUFBWixDQUExQixFQUFzRDtBQUNwRCxlQUFPLEtBQUssT0FBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxzQkFBTCxDQUE0QixhQUE1QixDQUExQixFQUFzRTtBQUNwRSxZQUFJLFNBQVMsS0FBSyxXQUFMLEVBQWI7QUFDQSxhQUFLLElBQUwsR0FBWSxPQUFPLE1BQVAsQ0FBYyxLQUFLLElBQW5CLENBQVo7QUFDQSxlQUFPLHNCQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxTQUFMLENBQWUsYUFBZixFQUE4QixPQUE5QixDQUExQixFQUFrRTtBQUNoRSxlQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssU0FBTCxDQUFlLGFBQWYsRUFBOEIsT0FBOUIsQ0FBMUIsRUFBa0U7QUFDaEUsZUFBTyxLQUFLLGFBQUwsQ0FBbUIsRUFBQyxRQUFRLElBQVQsRUFBbkIsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssU0FBTCxDQUFlLGFBQWYsRUFBOEIsT0FBOUIsQ0FBMUIsRUFBa0U7QUFDaEUsYUFBSyxPQUFMO0FBQ0EsZUFBTyxvQkFBUyxPQUFULEVBQWtCLEVBQWxCLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxLQUF1QixLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsS0FBb0MsS0FBSyxRQUFMLENBQWMsYUFBZCxDQUEzRCxLQUE0RixLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFsQixFQUFnQyxJQUFoQyxDQUE1RixJQUFxSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFqQyxDQUF6SSxFQUF5TDtBQUN2TCxlQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssZ0JBQUwsQ0FBc0IsYUFBdEIsQ0FBMUIsRUFBZ0U7QUFDOUQsZUFBTyxLQUFLLHNCQUFMLEVBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLHNCQUFMLENBQTRCLGFBQTVCLENBQTFCLEVBQXNFO0FBQ3BFLGVBQU8sS0FBSyxtQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxjQUFMLENBQW9CLGFBQXBCLENBQTFCLEVBQThEO0FBQzVELGVBQU8sS0FBSyxxQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxTQUFMLENBQWUsYUFBZixFQUE4QixNQUE5QixDQUExQixFQUFpRTtBQUMvRCxlQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsS0FBSyxLQUFLLE9BQUwsRUFBTixFQUEzQixDQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsS0FBdUIsS0FBSyxZQUFMLENBQWtCLGFBQWxCLEtBQW9DLEtBQUssU0FBTCxDQUFlLGFBQWYsRUFBOEIsS0FBOUIsQ0FBcEMsSUFBNEUsS0FBSyxTQUFMLENBQWUsYUFBZixFQUE4QixPQUE5QixDQUFuRyxDQUFKLEVBQWdKO0FBQzlJLGVBQU8sb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxNQUFNLEtBQUssT0FBTCxFQUFQLEVBQWpDLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGdCQUFMLENBQXNCLGFBQXRCLENBQTFCLEVBQWdFO0FBQzlELFlBQUksTUFBTSxLQUFLLE9BQUwsRUFBVjtBQUNBLFlBQUksSUFBSSxHQUFKLE9BQWMsSUFBSSxDQUF0QixFQUF5QjtBQUN2QixpQkFBTyxvQkFBUywyQkFBVCxFQUFzQyxFQUF0QyxDQUFQO0FBQ0Q7QUFDRCxlQUFPLG9CQUFTLDBCQUFULEVBQXFDLEVBQUMsT0FBTyxHQUFSLEVBQXJDLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGVBQUwsQ0FBcUIsYUFBckIsQ0FBMUIsRUFBK0Q7QUFDN0QsZUFBTyxvQkFBUyx5QkFBVCxFQUFvQyxFQUFDLE9BQU8sS0FBSyxPQUFMLEVBQVIsRUFBcEMsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssVUFBTCxDQUFnQixhQUFoQixDQUExQixFQUEwRDtBQUN4RCxlQUFPLG9CQUFTLG9CQUFULEVBQStCLEVBQUMsS0FBSyxJQUFOLEVBQVksVUFBVSxLQUFLLHdCQUFMLEVBQXRCLEVBQS9CLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGdCQUFMLENBQXNCLGFBQXRCLENBQTFCLEVBQWdFO0FBQzlELGVBQU8sb0JBQVMsMEJBQVQsRUFBcUMsRUFBQyxPQUFPLEtBQUssT0FBTCxFQUFSLEVBQXJDLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGFBQUwsQ0FBbUIsYUFBbkIsQ0FBMUIsRUFBNkQ7QUFDM0QsYUFBSyxPQUFMO0FBQ0EsZUFBTyxvQkFBUyx1QkFBVCxFQUFrQyxFQUFsQyxDQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxtQkFBTCxDQUF5QixhQUF6QixDQUExQixFQUFtRTtBQUNqRSxZQUFJLFFBQVEsS0FBSyxPQUFMLEVBQVo7QUFDQSxZQUFJLFlBQVksTUFBTSxLQUFOLENBQVksS0FBWixDQUFrQixXQUFsQixDQUE4QixHQUE5QixDQUFoQjtBQUNBLFlBQUksVUFBVSxNQUFNLEtBQU4sQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLENBQXhCLEVBQTJCLFNBQTNCLENBQWQ7QUFDQSxZQUFJLFFBQVEsTUFBTSxLQUFOLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixZQUFZLENBQXBDLENBQVo7QUFDQSxlQUFPLG9CQUFTLHlCQUFULEVBQW9DLEVBQUMsU0FBUyxPQUFWLEVBQW1CLE9BQU8sS0FBMUIsRUFBcEMsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssUUFBTCxDQUFjLGFBQWQsQ0FBMUIsRUFBd0Q7QUFDdEQsZUFBTyxvQkFBUyx5QkFBVCxFQUFvQyxFQUFDLE9BQU8sS0FBSyxPQUFMLEdBQWUsS0FBZixFQUFSLEVBQXBDLENBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLEtBQWMsSUFBZCxJQUFzQixLQUFLLGlCQUFMLENBQXVCLGFBQXZCLENBQTFCLEVBQWlFO0FBQy9ELGVBQU8sS0FBSywwQkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxLQUFjLElBQWQsSUFBc0IsS0FBSyxRQUFMLENBQWMsYUFBZCxDQUExQixFQUF3RDtBQUN0RCxlQUFPLEtBQUssd0JBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssVUFBTCxDQUFnQixhQUFoQixDQUExQixFQUEwRDtBQUN4RCxlQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsS0FBYyxJQUFkLElBQXNCLEtBQUssVUFBTCxDQUFnQixhQUFoQixDQUExQixFQUEwRDtBQUN4RCxlQUFPLEtBQUssdUJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsSUFBYSxLQUFLLGdCQUFMLENBQXNCLGFBQXRCLENBQWpCLEVBQXVEO0FBQ3JELGVBQU8sS0FBSyx3QkFBTCxFQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxJQUFhLEtBQUssVUFBTCxDQUFnQixhQUFoQixDQUFqQixFQUFpRDtBQUMvQyxlQUFPLEtBQUssd0JBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsSUFBYSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsR0FBakMsQ0FBYixLQUF1RCxLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLENBQVUsQ0FBVixDQUFsQixLQUFtQyxLQUFLLFNBQUwsQ0FBZSxLQUFLLElBQUwsQ0FBVSxDQUFWLENBQWYsQ0FBMUYsQ0FBSixFQUE2SDtBQUMzSCxlQUFPLEtBQUssOEJBQUwsRUFBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsSUFBYSxLQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBakIsRUFBaUQ7QUFDL0MsZUFBTyxLQUFLLGdDQUFMLEVBQVA7QUFDRDtBQUNELFVBQUksS0FBSyxJQUFMLElBQWEsS0FBSyxRQUFMLENBQWMsYUFBZCxDQUFqQixFQUErQztBQUM3QyxZQUFJLFFBQVEsS0FBSyxPQUFMLEVBQVo7QUFDQSxlQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsUUFBUSxLQUFLLElBQWQsRUFBb0IsV0FBVyxNQUFNLEtBQU4sRUFBL0IsRUFBM0IsQ0FBUDtBQUNEO0FBQ0QsVUFBSSxLQUFLLElBQUwsSUFBYSxLQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBakIsRUFBaUQ7QUFDL0MsZUFBTyxvQkFBUyxvQkFBVCxFQUErQixFQUFDLEtBQUssS0FBSyxJQUFYLEVBQWlCLFVBQVUsS0FBSyx3QkFBTCxFQUEzQixFQUEvQixDQUFQO0FBQ0Q7QUFDRCxVQUFJLEtBQUssSUFBTCxJQUFhLEtBQUssUUFBTCxDQUFjLGFBQWQsQ0FBakIsRUFBK0M7QUFDN0MsWUFBSSxVQUFVLEtBQUssc0JBQUwsQ0FBNEIsS0FBSyxJQUFqQyxDQUFkO0FBQ0EsWUFBSSxLQUFLLEtBQUssT0FBTCxFQUFUO0FBQ0EsWUFBSSxNQUFNLElBQUksVUFBSixDQUFlLEtBQUssSUFBcEIsRUFBMEIsc0JBQTFCLEVBQWtDLEtBQUssT0FBdkMsQ0FBVjtBQUNBLFlBQUksT0FBTyxJQUFJLFFBQUosQ0FBYSxZQUFiLENBQVg7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFJLElBQWhCO0FBQ0EsWUFBSSxHQUFHLEdBQUgsT0FBYSxHQUFqQixFQUFzQjtBQUNwQixpQkFBTyxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLFNBQVMsT0FBVixFQUFtQixZQUFZLElBQS9CLEVBQWpDLENBQVA7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBTyxvQkFBUyw4QkFBVCxFQUF5QyxFQUFDLFNBQVMsT0FBVixFQUFtQixVQUFVLEdBQUcsR0FBSCxFQUE3QixFQUF1QyxZQUFZLElBQW5ELEVBQXpDLENBQVA7QUFDRDtBQUNGO0FBQ0QsVUFBSSxLQUFLLElBQUwsSUFBYSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsR0FBakMsQ0FBakIsRUFBd0Q7QUFDdEQsZUFBTyxLQUFLLDZCQUFMLEVBQVA7QUFDRDtBQUNELGFBQU8sc0JBQVA7QUFDRDs7OzJDQUNzQjtBQUNyQixVQUFJLGFBQWEsRUFBakI7QUFDQSxhQUFPLEtBQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsQ0FBeEIsRUFBMkI7QUFDekIsWUFBSSxZQUFKO0FBQ0EsWUFBSSxLQUFLLFlBQUwsQ0FBa0IsS0FBSyxJQUFMLEVBQWxCLEVBQStCLEtBQS9CLENBQUosRUFBMkM7QUFDekMsZUFBSyxPQUFMO0FBQ0EsZ0JBQU0sb0JBQVMsZUFBVCxFQUEwQixFQUFDLFlBQVksS0FBSyxzQkFBTCxFQUFiLEVBQTFCLENBQU47QUFDRCxTQUhELE1BR087QUFDTCxnQkFBTSxLQUFLLHNCQUFMLEVBQU47QUFDRDtBQUNELFlBQUksS0FBSyxJQUFMLENBQVUsSUFBVixHQUFpQixDQUFyQixFQUF3QjtBQUN0QixlQUFLLGVBQUwsQ0FBcUIsR0FBckI7QUFDRDtBQUNELG1CQUFXLElBQVgsQ0FBZ0IsR0FBaEI7QUFDRDtBQUNELGFBQU8scUJBQUssVUFBTCxDQUFQO0FBQ0Q7Ozs0Q0FDdUI7QUFDdEIsV0FBSyxZQUFMLENBQWtCLEtBQWxCO0FBQ0EsVUFBSSxtQkFBSjtBQUNBLFVBQUksS0FBSyxTQUFMLENBQWUsS0FBSyxJQUFMLEVBQWYsRUFBNEIsS0FBNUIsQ0FBSixFQUF3QztBQUN0QyxxQkFBYSxLQUFLLHFCQUFMLEVBQWI7QUFDRCxPQUZELE1BRU8sSUFBSSxLQUFLLFNBQUwsQ0FBZSxLQUFLLElBQUwsRUFBZixFQUE0QixPQUE1QixDQUFKLEVBQTBDO0FBQy9DLHFCQUFhLEtBQUssc0JBQUwsRUFBYjtBQUNELE9BRk0sTUFFQSxJQUFJLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsRUFBbEIsRUFBK0IsR0FBL0IsS0FBdUMsS0FBSyxZQUFMLENBQWtCLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBbEIsRUFBZ0MsUUFBaEMsQ0FBM0MsRUFBc0Y7QUFDM0YsYUFBSyxPQUFMO0FBQ0EsYUFBSyxPQUFMO0FBQ0EsZUFBTyxvQkFBUyxxQkFBVCxFQUFnQyxFQUFoQyxDQUFQO0FBQ0QsT0FKTSxNQUlBO0FBQ0wscUJBQWEsb0JBQVMsc0JBQVQsRUFBaUMsRUFBQyxNQUFNLEtBQUssa0JBQUwsRUFBUCxFQUFqQyxDQUFiO0FBQ0Q7QUFDRCxVQUFJLGlCQUFKO0FBQ0EsVUFBSSxLQUFLLFFBQUwsQ0FBYyxLQUFLLElBQUwsRUFBZCxDQUFKLEVBQWdDO0FBQzlCLG1CQUFXLEtBQUssV0FBTCxFQUFYO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsbUJBQVcsc0JBQVg7QUFDRDtBQUNELGFBQU8sb0JBQVMsZUFBVCxFQUEwQixFQUFDLFFBQVEsVUFBVCxFQUFxQixXQUFXLFFBQWhDLEVBQTFCLENBQVA7QUFDRDs7O3VEQUNrQztBQUNqQyxVQUFJLFVBQVUsSUFBSSxVQUFKLENBQWUsS0FBSyxZQUFMLEVBQWYsRUFBb0Msc0JBQXBDLEVBQTRDLEtBQUssT0FBakQsQ0FBZDtBQUNBLGFBQU8sb0JBQVMsMEJBQVQsRUFBcUMsRUFBQyxRQUFRLEtBQUssSUFBZCxFQUFvQixZQUFZLFFBQVEsa0JBQVIsRUFBaEMsRUFBckMsQ0FBUDtBQUNEOzs7MkNBQ3NCLFEsRUFBVTtBQUFBOztBQUMvQixjQUFRLFNBQVMsSUFBakI7QUFDRSxhQUFLLHNCQUFMO0FBQ0UsaUJBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLFNBQVMsSUFBaEIsRUFBOUIsQ0FBUDtBQUNGLGFBQUsseUJBQUw7QUFDRSxjQUFJLFNBQVMsS0FBVCxDQUFlLElBQWYsS0FBd0IsQ0FBeEIsSUFBNkIsS0FBSyxZQUFMLENBQWtCLFNBQVMsS0FBVCxDQUFlLEdBQWYsQ0FBbUIsQ0FBbkIsQ0FBbEIsQ0FBakMsRUFBMkU7QUFDekUsbUJBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLFNBQVMsS0FBVCxDQUFlLEdBQWYsQ0FBbUIsQ0FBbkIsQ0FBUCxFQUE5QixDQUFQO0FBQ0Q7QUFDSCxhQUFLLGNBQUw7QUFDRSxpQkFBTyxvQkFBUyx5QkFBVCxFQUFvQyxFQUFDLE1BQU0sU0FBUyxJQUFoQixFQUFzQixTQUFTLEtBQUssaUNBQUwsQ0FBdUMsU0FBUyxVQUFoRCxDQUEvQixFQUFwQyxDQUFQO0FBQ0YsYUFBSyxtQkFBTDtBQUNFLGlCQUFPLG9CQUFTLDJCQUFULEVBQXNDLEVBQUMsU0FBUyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0sU0FBUyxJQUFoQixFQUE5QixDQUFWLEVBQWdFLE1BQU0sSUFBdEUsRUFBdEMsQ0FBUDtBQUNGLGFBQUssa0JBQUw7QUFDRSxpQkFBTyxvQkFBUyxlQUFULEVBQTBCLEVBQUMsWUFBWSxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsQ0FBd0I7QUFBQSxxQkFBUyxNQUFLLHNCQUFMLENBQTRCLEtBQTVCLENBQVQ7QUFBQSxhQUF4QixDQUFiLEVBQTFCLENBQVA7QUFDRixhQUFLLGlCQUFMO0FBQ0UsY0FBSSxPQUFPLFNBQVMsUUFBVCxDQUFrQixJQUFsQixFQUFYO0FBQ0EsY0FBSSxRQUFRLElBQVIsSUFBZ0IsS0FBSyxJQUFMLEtBQWMsZUFBbEMsRUFBbUQ7QUFDakQsbUJBQU8sb0JBQVMsY0FBVCxFQUF5QixFQUFDLFVBQVUsU0FBUyxRQUFULENBQWtCLEtBQWxCLENBQXdCLENBQXhCLEVBQTJCLENBQUMsQ0FBNUIsRUFBK0IsR0FBL0IsQ0FBbUM7QUFBQSx1QkFBUyxTQUFTLE1BQUssaUNBQUwsQ0FBdUMsS0FBdkMsQ0FBbEI7QUFBQSxlQUFuQyxDQUFYLEVBQWdILGFBQWEsS0FBSyxpQ0FBTCxDQUF1QyxLQUFLLFVBQTVDLENBQTdILEVBQXpCLENBQVA7QUFDRCxXQUZELE1BRU87QUFDTCxtQkFBTyxvQkFBUyxjQUFULEVBQXlCLEVBQUMsVUFBVSxTQUFTLFFBQVQsQ0FBa0IsR0FBbEIsQ0FBc0I7QUFBQSx1QkFBUyxTQUFTLE1BQUssaUNBQUwsQ0FBdUMsS0FBdkMsQ0FBbEI7QUFBQSxlQUF0QixDQUFYLEVBQW1HLGFBQWEsSUFBaEgsRUFBekIsQ0FBUDtBQUNEO0FBQ0QsaUJBQU8sb0JBQVMsY0FBVCxFQUF5QixFQUFDLFVBQVUsU0FBUyxRQUFULENBQWtCLEdBQWxCLENBQXNCO0FBQUEscUJBQVMsU0FBUyxNQUFLLHNCQUFMLENBQTRCLEtBQTVCLENBQWxCO0FBQUEsYUFBdEIsQ0FBWCxFQUF3RixhQUFhLElBQXJHLEVBQXpCLENBQVA7QUFDRixhQUFLLG9CQUFMO0FBQ0UsaUJBQU8sb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLFNBQVMsS0FBaEIsRUFBOUIsQ0FBUDtBQUNGLGFBQUssMEJBQUw7QUFDQSxhQUFLLHdCQUFMO0FBQ0EsYUFBSyxjQUFMO0FBQ0EsYUFBSyxtQkFBTDtBQUNBLGFBQUssMkJBQUw7QUFDQSxhQUFLLHlCQUFMO0FBQ0EsYUFBSyxvQkFBTDtBQUNBLGFBQUssZUFBTDtBQUNFLGlCQUFPLFFBQVA7QUEvQko7QUFpQ0EsMEJBQU8sS0FBUCxFQUFjLDZCQUE2QixTQUFTLElBQXBEO0FBQ0Q7OztzREFDaUMsUSxFQUFVO0FBQzFDLGNBQVEsU0FBUyxJQUFqQjtBQUNFLGFBQUssc0JBQUw7QUFDRSxpQkFBTyxvQkFBUyxvQkFBVCxFQUErQixFQUFDLFNBQVMsS0FBSyxzQkFBTCxDQUE0QixTQUFTLE9BQXJDLENBQVYsRUFBeUQsTUFBTSxTQUFTLFVBQXhFLEVBQS9CLENBQVA7QUFGSjtBQUlBLGFBQU8sS0FBSyxzQkFBTCxDQUE0QixRQUE1QixDQUFQO0FBQ0Q7Ozs4Q0FDeUI7QUFDeEIsVUFBSSxnQkFBSjtBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLEtBQUssSUFBTCxFQUFsQixDQUFKLEVBQW9DO0FBQ2xDLGtCQUFVLElBQUksVUFBSixDQUFlLGdCQUFLLEVBQUwsQ0FBUSxLQUFLLE9BQUwsRUFBUixDQUFmLEVBQXdDLHNCQUF4QyxFQUFnRCxLQUFLLE9BQXJELENBQVY7QUFDRCxPQUZELE1BRU87QUFDTCxZQUFJLElBQUksS0FBSyxXQUFMLEVBQVI7QUFDQSxrQkFBVSxJQUFJLFVBQUosQ0FBZSxDQUFmLEVBQWtCLHNCQUFsQixFQUEwQixLQUFLLE9BQS9CLENBQVY7QUFDRDtBQUNELFVBQUksYUFBYSxRQUFRLHdCQUFSLEVBQWpCO0FBQ0EsV0FBSyxlQUFMLENBQXFCLElBQXJCO0FBQ0EsVUFBSSxpQkFBSjtBQUNBLFVBQUksS0FBSyxRQUFMLENBQWMsS0FBSyxJQUFMLEVBQWQsQ0FBSixFQUFnQztBQUM5QixtQkFBVyxLQUFLLFlBQUwsRUFBWDtBQUNELE9BRkQsTUFFTztBQUNMLGtCQUFVLElBQUksVUFBSixDQUFlLEtBQUssSUFBcEIsRUFBMEIsc0JBQTFCLEVBQWtDLEtBQUssT0FBdkMsQ0FBVjtBQUNBLG1CQUFXLFFBQVEsc0JBQVIsRUFBWDtBQUNBLGFBQUssSUFBTCxHQUFZLFFBQVEsSUFBcEI7QUFDRDtBQUNELGFBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxRQUFRLFVBQVQsRUFBcUIsTUFBTSxRQUEzQixFQUE1QixDQUFQO0FBQ0Q7Ozs4Q0FDeUI7QUFDeEIsVUFBSSxVQUFVLEtBQUssWUFBTCxDQUFrQixPQUFsQixDQUFkO0FBQ0EsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLElBQUwsQ0FBVSxJQUFWLEtBQW1CLENBQW5CLElBQXdCLGlCQUFpQixDQUFDLEtBQUssWUFBTCxDQUFrQixPQUFsQixFQUEyQixhQUEzQixDQUE5QyxFQUF5RjtBQUN2RixlQUFPLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsWUFBWSxJQUFiLEVBQTVCLENBQVA7QUFDRCxPQUZELE1BRU87QUFDTCxZQUFJLGNBQWMsS0FBbEI7QUFDQSxZQUFJLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsRUFBbEIsRUFBK0IsR0FBL0IsQ0FBSixFQUF5QztBQUN2Qyx3QkFBYyxJQUFkO0FBQ0EsZUFBSyxPQUFMO0FBQ0Q7QUFDRCxZQUFJLE9BQU8sS0FBSyxrQkFBTCxFQUFYO0FBQ0EsWUFBSSxPQUFPLGNBQWMsMEJBQWQsR0FBMkMsaUJBQXREO0FBQ0EsZUFBTyxvQkFBUyxJQUFULEVBQWUsRUFBQyxZQUFZLElBQWIsRUFBZixDQUFQO0FBQ0Q7QUFDRjs7OzZDQUN3QjtBQUN2QixhQUFPLG9CQUFTLGdCQUFULEVBQTJCLEVBQUMsVUFBVSxLQUFLLE9BQUwsRUFBWCxFQUEzQixDQUFQO0FBQ0Q7OzswQ0FDcUI7QUFDcEIsVUFBSSxXQUFXLEtBQUssT0FBTCxFQUFmO0FBQ0EsYUFBTyxvQkFBUyxhQUFULEVBQXdCLEVBQUMsTUFBTSxRQUFQLEVBQWlCLFVBQVUsb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxLQUFLLG9CQUFTLHNCQUFULEVBQWlDLEVBQUMsTUFBTSxRQUFQLEVBQWpDLENBQU4sRUFBMEQsVUFBVSxLQUFLLHdCQUFMLEVBQXBFLEVBQS9CLENBQTNCLEVBQXhCLENBQVA7QUFDRDs7O3FEQUNnQztBQUMvQixVQUFJLGFBQWEsS0FBSyxJQUF0QjtBQUNBLFVBQUksVUFBVSxLQUFLLE9BQUwsRUFBZDtBQUNBLFVBQUksZUFBZSxLQUFLLE9BQUwsRUFBbkI7QUFDQSxhQUFPLG9CQUFTLHdCQUFULEVBQW1DLEVBQUMsUUFBUSxVQUFULEVBQXFCLFVBQVUsWUFBL0IsRUFBbkMsQ0FBUDtBQUNEOzs7OENBQ3lCO0FBQ3hCLFVBQUksVUFBVSxLQUFLLE9BQUwsRUFBZDtBQUNBLFVBQUksZUFBZSxFQUFuQjtBQUNBLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxRQUFRLEtBQVIsRUFBZixFQUFnQyxzQkFBaEMsRUFBd0MsS0FBSyxPQUE3QyxDQUFkO0FBQ0EsYUFBTyxRQUFRLElBQVIsQ0FBYSxJQUFiLEdBQW9CLENBQTNCLEVBQThCO0FBQzVCLFlBQUksWUFBWSxRQUFRLElBQVIsRUFBaEI7QUFDQSxZQUFJLFFBQVEsWUFBUixDQUFxQixTQUFyQixFQUFnQyxHQUFoQyxDQUFKLEVBQTBDO0FBQ3hDLGtCQUFRLE9BQVI7QUFDQSx1QkFBYSxJQUFiLENBQWtCLElBQWxCO0FBQ0QsU0FIRCxNQUdPLElBQUksUUFBUSxZQUFSLENBQXFCLFNBQXJCLEVBQWdDLEtBQWhDLENBQUosRUFBNEM7QUFDakQsa0JBQVEsT0FBUjtBQUNBLGNBQUksYUFBYSxRQUFRLHNCQUFSLEVBQWpCO0FBQ0EsY0FBSSxjQUFjLElBQWxCLEVBQXdCO0FBQ3RCLGtCQUFNLFFBQVEsV0FBUixDQUFvQixTQUFwQixFQUErQixzQkFBL0IsQ0FBTjtBQUNEO0FBQ0QsdUJBQWEsSUFBYixDQUFrQixvQkFBUyxlQUFULEVBQTBCLEVBQUMsWUFBWSxVQUFiLEVBQTFCLENBQWxCO0FBQ0QsU0FQTSxNQU9BO0FBQ0wsY0FBSSxPQUFPLFFBQVEsc0JBQVIsRUFBWDtBQUNBLGNBQUksUUFBUSxJQUFaLEVBQWtCO0FBQ2hCLGtCQUFNLFFBQVEsV0FBUixDQUFvQixTQUFwQixFQUErQixxQkFBL0IsQ0FBTjtBQUNEO0FBQ0QsdUJBQWEsSUFBYixDQUFrQixJQUFsQjtBQUNBLGtCQUFRLFlBQVI7QUFDRDtBQUNGO0FBQ0QsYUFBTyxvQkFBUyxpQkFBVCxFQUE0QixFQUFDLFVBQVUscUJBQUssWUFBTCxDQUFYLEVBQTVCLENBQVA7QUFDRDs7OytDQUMwQjtBQUN6QixVQUFJLFVBQVUsS0FBSyxPQUFMLEVBQWQ7QUFDQSxVQUFJLGlCQUFpQixzQkFBckI7QUFDQSxVQUFJLFVBQVUsSUFBSSxVQUFKLENBQWUsUUFBUSxLQUFSLEVBQWYsRUFBZ0Msc0JBQWhDLEVBQXdDLEtBQUssT0FBN0MsQ0FBZDtBQUNBLFVBQUksZUFBZSxJQUFuQjtBQUNBLGFBQU8sUUFBUSxJQUFSLENBQWEsSUFBYixHQUFvQixDQUEzQixFQUE4QjtBQUM1QixZQUFJLE9BQU8sUUFBUSwwQkFBUixFQUFYO0FBQ0EsZ0JBQVEsWUFBUjtBQUNBLHlCQUFpQixlQUFlLE1BQWYsQ0FBc0IsSUFBdEIsQ0FBakI7QUFDQSxZQUFJLGlCQUFpQixJQUFyQixFQUEyQjtBQUN6QixnQkFBTSxRQUFRLFdBQVIsQ0FBb0IsSUFBcEIsRUFBMEIsMEJBQTFCLENBQU47QUFDRDtBQUNELHVCQUFlLElBQWY7QUFDRDtBQUNELGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxZQUFZLGNBQWIsRUFBN0IsQ0FBUDtBQUNEOzs7aURBQzRCO0FBQUEsa0NBQ0QsS0FBSyx3QkFBTCxFQURDOztBQUFBLFVBQ3RCLFdBRHNCLHlCQUN0QixXQURzQjtBQUFBLFVBQ1QsSUFEUyx5QkFDVCxJQURTOztBQUUzQixjQUFRLElBQVI7QUFDRSxhQUFLLFFBQUw7QUFDRSxpQkFBTyxXQUFQO0FBQ0YsYUFBSyxZQUFMO0FBQ0UsY0FBSSxLQUFLLFFBQUwsQ0FBYyxLQUFLLElBQUwsRUFBZCxDQUFKLEVBQWdDO0FBQzlCLGlCQUFLLE9BQUw7QUFDQSxnQkFBSSxPQUFPLEtBQUssc0JBQUwsRUFBWDtBQUNBLG1CQUFPLG9CQUFTLDJCQUFULEVBQXNDLEVBQUMsTUFBTSxJQUFQLEVBQWEsU0FBUyxLQUFLLHNCQUFMLENBQTRCLFdBQTVCLENBQXRCLEVBQXRDLENBQVA7QUFDRCxXQUpELE1BSU8sSUFBSSxDQUFDLEtBQUssWUFBTCxDQUFrQixLQUFLLElBQUwsRUFBbEIsRUFBK0IsR0FBL0IsQ0FBTCxFQUEwQztBQUMvQyxtQkFBTyxvQkFBUyxtQkFBVCxFQUE4QixFQUFDLE1BQU0sWUFBWSxLQUFuQixFQUE5QixDQUFQO0FBQ0Q7QUFWTDtBQVlBLFdBQUssZUFBTCxDQUFxQixHQUFyQjtBQUNBLFVBQUksV0FBVyxLQUFLLHNCQUFMLEVBQWY7QUFDQSxhQUFPLG9CQUFTLGNBQVQsRUFBeUIsRUFBQyxNQUFNLFdBQVAsRUFBb0IsWUFBWSxRQUFoQyxFQUF6QixDQUFQO0FBQ0Q7OzsrQ0FDMEI7QUFDekIsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxrQkFBa0IsS0FBdEI7QUFDQSxVQUFJLEtBQUssWUFBTCxDQUFrQixhQUFsQixFQUFpQyxHQUFqQyxDQUFKLEVBQTJDO0FBQ3pDLDBCQUFrQixJQUFsQjtBQUNBLGFBQUssT0FBTDtBQUNEO0FBQ0QsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsS0FBakMsS0FBMkMsS0FBSyxjQUFMLENBQW9CLEtBQUssSUFBTCxDQUFVLENBQVYsQ0FBcEIsQ0FBL0MsRUFBa0Y7QUFDaEYsYUFBSyxPQUFMOztBQURnRixxQ0FFbkUsS0FBSyxvQkFBTCxFQUZtRTs7QUFBQSxZQUUzRSxLQUYyRSwwQkFFM0UsSUFGMkU7O0FBR2hGLGFBQUssV0FBTDtBQUNBLFlBQUksT0FBTyxLQUFLLFlBQUwsRUFBWDtBQUNBLGVBQU8sRUFBQyxhQUFhLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxNQUFNLEtBQVAsRUFBYSxNQUFNLElBQW5CLEVBQW5CLENBQWQsRUFBNEQsTUFBTSxRQUFsRSxFQUFQO0FBQ0QsT0FORCxNQU1PLElBQUksS0FBSyxZQUFMLENBQWtCLGFBQWxCLEVBQWlDLEtBQWpDLEtBQTJDLEtBQUssY0FBTCxDQUFvQixLQUFLLElBQUwsQ0FBVSxDQUFWLENBQXBCLENBQS9DLEVBQWtGO0FBQ3ZGLGFBQUssT0FBTDs7QUFEdUYscUNBRTFFLEtBQUssb0JBQUwsRUFGMEU7O0FBQUEsWUFFbEYsTUFGa0YsMEJBRWxGLElBRmtGOztBQUd2RixZQUFJLE1BQU0sSUFBSSxVQUFKLENBQWUsS0FBSyxXQUFMLEVBQWYsRUFBbUMsc0JBQW5DLEVBQTJDLEtBQUssT0FBaEQsQ0FBVjtBQUNBLFlBQUksUUFBUSxJQUFJLHNCQUFKLEVBQVo7QUFDQSxZQUFJLFFBQU8sS0FBSyxZQUFMLEVBQVg7QUFDQSxlQUFPLEVBQUMsYUFBYSxvQkFBUyxRQUFULEVBQW1CLEVBQUMsTUFBTSxNQUFQLEVBQWEsT0FBTyxLQUFwQixFQUEyQixNQUFNLEtBQWpDLEVBQW5CLENBQWQsRUFBMEUsTUFBTSxRQUFoRixFQUFQO0FBQ0Q7O0FBcEJ3QixtQ0FxQlosS0FBSyxvQkFBTCxFQXJCWTs7QUFBQSxVQXFCcEIsSUFyQm9CLDBCQXFCcEIsSUFyQm9COztBQXNCekIsVUFBSSxLQUFLLFFBQUwsQ0FBYyxLQUFLLElBQUwsRUFBZCxDQUFKLEVBQWdDO0FBQzlCLFlBQUksU0FBUyxLQUFLLFdBQUwsRUFBYjtBQUNBLFlBQUksT0FBTSxJQUFJLFVBQUosQ0FBZSxNQUFmLEVBQXVCLHNCQUF2QixFQUErQixLQUFLLE9BQXBDLENBQVY7QUFDQSxZQUFJLGVBQWUsS0FBSSx3QkFBSixFQUFuQjtBQUNBLFlBQUksU0FBTyxLQUFLLFlBQUwsRUFBWDtBQUNBLGVBQU8sRUFBQyxhQUFhLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxhQUFhLGVBQWQsRUFBK0IsTUFBTSxJQUFyQyxFQUEyQyxRQUFRLFlBQW5ELEVBQWlFLE1BQU0sTUFBdkUsRUFBbkIsQ0FBZCxFQUFnSCxNQUFNLFFBQXRILEVBQVA7QUFDRDtBQUNELGFBQU8sRUFBQyxhQUFhLElBQWQsRUFBb0IsTUFBTSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsS0FBb0MsS0FBSyxTQUFMLENBQWUsYUFBZixDQUFwQyxHQUFvRSxZQUFwRSxHQUFtRixVQUE3RyxFQUFQO0FBQ0Q7OzsyQ0FDc0I7QUFDckIsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLGVBQUwsQ0FBcUIsYUFBckIsS0FBdUMsS0FBSyxnQkFBTCxDQUFzQixhQUF0QixDQUEzQyxFQUFpRjtBQUMvRSxlQUFPLEVBQUMsTUFBTSxvQkFBUyxvQkFBVCxFQUErQixFQUFDLE9BQU8sS0FBSyxPQUFMLEVBQVIsRUFBL0IsQ0FBUCxFQUFnRSxTQUFTLElBQXpFLEVBQVA7QUFDRCxPQUZELE1BRU8sSUFBSSxLQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBSixFQUFvQztBQUN6QyxZQUFJLE1BQU0sSUFBSSxVQUFKLENBQWUsS0FBSyxZQUFMLEVBQWYsRUFBb0Msc0JBQXBDLEVBQTRDLEtBQUssT0FBakQsQ0FBVjtBQUNBLFlBQUksT0FBTyxJQUFJLHNCQUFKLEVBQVg7QUFDQSxlQUFPLEVBQUMsTUFBTSxvQkFBUyxzQkFBVCxFQUFpQyxFQUFDLFlBQVksSUFBYixFQUFqQyxDQUFQLEVBQTZELFNBQVMsSUFBdEUsRUFBUDtBQUNEO0FBQ0QsVUFBSSxXQUFXLEtBQUssT0FBTCxFQUFmO0FBQ0EsYUFBTyxFQUFDLE1BQU0sb0JBQVMsb0JBQVQsRUFBK0IsRUFBQyxPQUFPLFFBQVIsRUFBL0IsQ0FBUCxFQUEwRCxTQUFTLG9CQUFTLG1CQUFULEVBQThCLEVBQUMsTUFBTSxRQUFQLEVBQTlCLENBQW5FLEVBQVA7QUFDRDs7OzRDQUNxRDtBQUFBLFVBQXBDLE1BQW9DLFNBQXBDLE1BQW9DO0FBQUEsVUFBNUIsU0FBNEIsU0FBNUIsU0FBNEI7QUFBQSxVQUFqQixjQUFpQixTQUFqQixjQUFpQjs7QUFDcEQsVUFBSSxXQUFXLElBQWY7VUFBcUIsbUJBQXJCO1VBQWlDLGlCQUFqQztVQUEyQyxpQkFBM0M7QUFDQSxVQUFJLGtCQUFrQixLQUF0QjtBQUNBLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksZ0JBQWdCLEtBQUssSUFBTCxFQUFwQjtBQUNBLFVBQUksV0FBVyxTQUFTLG9CQUFULEdBQWdDLHFCQUEvQztBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLGFBQWxCLEVBQWlDLEdBQWpDLENBQUosRUFBMkM7QUFDekMsMEJBQWtCLElBQWxCO0FBQ0EsYUFBSyxPQUFMO0FBQ0Esd0JBQWdCLEtBQUssSUFBTCxFQUFoQjtBQUNEO0FBQ0QsVUFBSSxDQUFDLEtBQUssUUFBTCxDQUFjLGFBQWQsQ0FBTCxFQUFtQztBQUNqQyxtQkFBVyxLQUFLLHlCQUFMLEVBQVg7QUFDRCxPQUZELE1BRU8sSUFBSSxTQUFKLEVBQWU7QUFDcEIsbUJBQVcsb0JBQVMsbUJBQVQsRUFBOEIsRUFBQyxNQUFNLGlCQUFPLGNBQVAsQ0FBc0IsV0FBdEIsRUFBbUMsYUFBbkMsQ0FBUCxFQUE5QixDQUFYO0FBQ0Q7QUFDRCxtQkFBYSxLQUFLLFdBQUwsRUFBYjtBQUNBLGlCQUFXLEtBQUssWUFBTCxFQUFYO0FBQ0EsVUFBSSxVQUFVLElBQUksVUFBSixDQUFlLFVBQWYsRUFBMkIsc0JBQTNCLEVBQW1DLEtBQUssT0FBeEMsQ0FBZDtBQUNBLFVBQUksbUJBQW1CLFFBQVEsd0JBQVIsRUFBdkI7QUFDQSxhQUFPLG9CQUFTLFFBQVQsRUFBbUIsRUFBQyxNQUFNLFFBQVAsRUFBaUIsYUFBYSxlQUE5QixFQUErQyxRQUFRLGdCQUF2RCxFQUF5RSxNQUFNLFFBQS9FLEVBQW5CLENBQVA7QUFDRDs7O2lEQUM0QjtBQUMzQixVQUFJLFdBQVcsSUFBZjtVQUFxQixtQkFBckI7VUFBaUMsaUJBQWpDO1VBQTJDLGlCQUEzQztBQUNBLFVBQUksa0JBQWtCLEtBQXRCO0FBQ0EsV0FBSyxPQUFMO0FBQ0EsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsR0FBakMsQ0FBSixFQUEyQztBQUN6QywwQkFBa0IsSUFBbEI7QUFDQSxhQUFLLE9BQUw7QUFDQSx3QkFBZ0IsS0FBSyxJQUFMLEVBQWhCO0FBQ0Q7QUFDRCxVQUFJLENBQUMsS0FBSyxRQUFMLENBQWMsYUFBZCxDQUFMLEVBQW1DO0FBQ2pDLG1CQUFXLEtBQUsseUJBQUwsRUFBWDtBQUNEO0FBQ0QsbUJBQWEsS0FBSyxXQUFMLEVBQWI7QUFDQSxpQkFBVyxLQUFLLFlBQUwsRUFBWDtBQUNBLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxVQUFmLEVBQTJCLHNCQUEzQixFQUFtQyxLQUFLLE9BQXhDLENBQWQ7QUFDQSxVQUFJLG1CQUFtQixRQUFRLHdCQUFSLEVBQXZCO0FBQ0EsYUFBTyxvQkFBUyxvQkFBVCxFQUErQixFQUFDLE1BQU0sUUFBUCxFQUFpQixhQUFhLGVBQTlCLEVBQStDLFFBQVEsZ0JBQXZELEVBQXlFLE1BQU0sUUFBL0UsRUFBL0IsQ0FBUDtBQUNEOzs7a0RBQzZCO0FBQzVCLFVBQUksaUJBQUo7VUFBYyxtQkFBZDtVQUEwQixpQkFBMUI7VUFBb0MsaUJBQXBDO0FBQ0EsVUFBSSxrQkFBa0IsS0FBdEI7QUFDQSxXQUFLLE9BQUw7QUFDQSxVQUFJLGdCQUFnQixLQUFLLElBQUwsRUFBcEI7QUFDQSxVQUFJLEtBQUssWUFBTCxDQUFrQixhQUFsQixFQUFpQyxHQUFqQyxDQUFKLEVBQTJDO0FBQ3pDLDBCQUFrQixJQUFsQjtBQUNBLGFBQUssT0FBTDtBQUNEO0FBQ0QsaUJBQVcsS0FBSyx5QkFBTCxFQUFYO0FBQ0EsbUJBQWEsS0FBSyxXQUFMLEVBQWI7QUFDQSxpQkFBVyxLQUFLLFlBQUwsRUFBWDtBQUNBLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxVQUFmLEVBQTJCLHNCQUEzQixFQUFtQyxLQUFLLE9BQXhDLENBQWQ7QUFDQSxVQUFJLG1CQUFtQixRQUFRLHdCQUFSLEVBQXZCO0FBQ0EsYUFBTyxvQkFBUyxxQkFBVCxFQUFnQyxFQUFDLE1BQU0sUUFBUCxFQUFpQixhQUFhLGVBQTlCLEVBQStDLFFBQVEsZ0JBQXZELEVBQXlFLE1BQU0sUUFBL0UsRUFBaEMsQ0FBUDtBQUNEOzs7K0NBQzBCO0FBQ3pCLFVBQUksWUFBWSxFQUFoQjtBQUNBLFVBQUksV0FBVyxJQUFmO0FBQ0EsYUFBTyxLQUFLLElBQUwsQ0FBVSxJQUFWLEtBQW1CLENBQTFCLEVBQTZCO0FBQzNCLFlBQUksWUFBWSxLQUFLLElBQUwsRUFBaEI7QUFDQSxZQUFJLEtBQUssWUFBTCxDQUFrQixTQUFsQixFQUE2QixLQUE3QixDQUFKLEVBQXlDO0FBQ3ZDLGVBQUssZUFBTCxDQUFxQixLQUFyQjtBQUNBLHFCQUFXLEtBQUsseUJBQUwsRUFBWDtBQUNBO0FBQ0Q7QUFDRCxrQkFBVSxJQUFWLENBQWUsS0FBSyxhQUFMLEVBQWY7QUFDQSxhQUFLLFlBQUw7QUFDRDtBQUNELGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxPQUFPLHFCQUFLLFNBQUwsQ0FBUixFQUF5QixNQUFNLFFBQS9CLEVBQTdCLENBQVA7QUFDRDs7O29DQUNlO0FBQ2QsYUFBTyxLQUFLLHNCQUFMLEVBQVA7QUFDRDs7OytDQUMwQjtBQUN6QixVQUFJLGVBQWUsS0FBSyxrQkFBTCxFQUFuQjtBQUNBLGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxVQUFVLEtBQVgsRUFBa0IsVUFBVSxhQUFhLEdBQWIsRUFBNUIsRUFBZ0QsU0FBUyxLQUFLLHNCQUFMLENBQTRCLEtBQUssSUFBakMsQ0FBekQsRUFBN0IsQ0FBUDtBQUNEOzs7OENBQ3lCO0FBQUE7O0FBQ3hCLFVBQUksZUFBZSxLQUFLLGtCQUFMLEVBQW5CO0FBQ0EsV0FBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLENBQXNCLEVBQUMsTUFBTSxLQUFLLEtBQUwsQ0FBVyxJQUFsQixFQUF3QixTQUFTLEtBQUssS0FBTCxDQUFXLE9BQTVDLEVBQXRCLENBQW5CO0FBQ0EsV0FBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixFQUFsQjtBQUNBLFdBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIseUJBQWlCO0FBQ3BDLFlBQUksaUJBQUo7WUFBYyxpQkFBZDtZQUF3QixxQkFBeEI7QUFDQSxZQUFJLGFBQWEsR0FBYixPQUF1QixJQUF2QixJQUErQixhQUFhLEdBQWIsT0FBdUIsSUFBMUQsRUFBZ0U7QUFDOUQscUJBQVcsa0JBQVg7QUFDQSxxQkFBVyxPQUFLLHNCQUFMLENBQTRCLGFBQTVCLENBQVg7QUFDQSx5QkFBZSxJQUFmO0FBQ0QsU0FKRCxNQUlPO0FBQ0wscUJBQVcsaUJBQVg7QUFDQSx5QkFBZSxTQUFmO0FBQ0EscUJBQVcsYUFBWDtBQUNEO0FBQ0QsZUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsVUFBVSxhQUFhLEdBQWIsRUFBWCxFQUErQixTQUFTLFFBQXhDLEVBQWtELFVBQVUsWUFBNUQsRUFBbkIsQ0FBUDtBQUNELE9BWkQ7QUFhQSxhQUFPLHFCQUFQO0FBQ0Q7OztvREFDK0I7QUFDOUIsVUFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsS0FBSyxJQUF4QixDQUFmO0FBQ0EsVUFBSSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLEdBQXdCLENBQTVCLEVBQStCO0FBQUEsaUNBQ1AsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFpQixJQUFqQixFQURPOztBQUFBLFlBQ3hCLElBRHdCLHNCQUN4QixJQUR3QjtBQUFBLFlBQ2xCLE9BRGtCLHNCQUNsQixPQURrQjs7QUFFN0IsYUFBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLEdBQWpCLEVBQW5CO0FBQ0EsYUFBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixJQUFsQjtBQUNBLGFBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsT0FBckI7QUFDRDtBQUNELFdBQUssZUFBTCxDQUFxQixHQUFyQjtBQUNBLFVBQUksVUFBVSxJQUFJLFVBQUosQ0FBZSxLQUFLLElBQXBCLEVBQTBCLHNCQUExQixFQUFrQyxLQUFLLE9BQXZDLENBQWQ7QUFDQSxVQUFJLGlCQUFpQixRQUFRLHNCQUFSLEVBQXJCO0FBQ0EsY0FBUSxlQUFSLENBQXdCLEdBQXhCO0FBQ0EsZ0JBQVUsSUFBSSxVQUFKLENBQWUsUUFBUSxJQUF2QixFQUE2QixzQkFBN0IsRUFBcUMsS0FBSyxPQUExQyxDQUFWO0FBQ0EsVUFBSSxnQkFBZ0IsUUFBUSxzQkFBUixFQUFwQjtBQUNBLFdBQUssSUFBTCxHQUFZLFFBQVEsSUFBcEI7QUFDQSxhQUFPLG9CQUFTLHVCQUFULEVBQWtDLEVBQUMsTUFBTSxRQUFQLEVBQWlCLFlBQVksY0FBN0IsRUFBNkMsV0FBVyxhQUF4RCxFQUFsQyxDQUFQO0FBQ0Q7OzsrQ0FDMEI7QUFDekIsVUFBSSxlQUFlLEtBQUssSUFBeEI7QUFDQSxVQUFJLFlBQVksS0FBSyxJQUFMLEVBQWhCO0FBQ0EsVUFBSSxTQUFTLFVBQVUsR0FBVixFQUFiO0FBQ0EsVUFBSSxhQUFhLGdDQUFnQixNQUFoQixDQUFqQjtBQUNBLFVBQUksY0FBYyxpQ0FBaUIsTUFBakIsQ0FBbEI7QUFDQSxVQUFJLDJCQUFXLEtBQUssS0FBTCxDQUFXLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLFdBQXhDLENBQUosRUFBMEQ7QUFDeEQsYUFBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLENBQXNCLEVBQUMsTUFBTSxLQUFLLEtBQUwsQ0FBVyxJQUFsQixFQUF3QixTQUFTLEtBQUssS0FBTCxDQUFXLE9BQTVDLEVBQXRCLENBQW5CO0FBQ0EsYUFBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixVQUFsQjtBQUNBLGFBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIseUJBQWlCO0FBQ3BDLGlCQUFPLG9CQUFTLGtCQUFULEVBQTZCLEVBQUMsTUFBTSxZQUFQLEVBQXFCLFVBQVUsU0FBL0IsRUFBMEMsT0FBTyxhQUFqRCxFQUE3QixDQUFQO0FBQ0QsU0FGRDtBQUdBLGFBQUssT0FBTDtBQUNBLGVBQU8scUJBQVA7QUFDRCxPQVJELE1BUU87QUFDTCxZQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixZQUFuQixDQUFYOztBQURLLGlDQUVpQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLElBQWpCLEVBRmpCOztBQUFBLFlBRUEsSUFGQSxzQkFFQSxJQUZBO0FBQUEsWUFFTSxPQUZOLHNCQUVNLE9BRk47O0FBR0wsYUFBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLEdBQWpCLEVBQW5CO0FBQ0EsYUFBSyxLQUFMLENBQVcsSUFBWCxHQUFrQixJQUFsQjtBQUNBLGFBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsT0FBckI7QUFDQSxlQUFPLElBQVA7QUFDRDtBQUNGOzs7K0NBQzBCO0FBQUE7O0FBQ3pCLFVBQUksZ0JBQWdCLEtBQUssYUFBTCxFQUFwQjtBQUNBLFVBQUksZUFBZSxjQUFjLEtBQWQsQ0FBb0IsS0FBcEIsQ0FBMEIsR0FBMUIsQ0FBOEIsa0JBQVU7QUFDekQsWUFBSSxzQ0FBNEIsT0FBTyxXQUFQLEVBQWhDLEVBQXNEO0FBQ3BELGNBQUksTUFBTSxJQUFJLFVBQUosQ0FBZSxPQUFPLEtBQVAsRUFBZixFQUErQixzQkFBL0IsRUFBdUMsT0FBSyxPQUE1QyxDQUFWO0FBQ0EsaUJBQU8sSUFBSSxRQUFKLENBQWEsWUFBYixDQUFQO0FBQ0Q7QUFDRCxlQUFPLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsVUFBVSxPQUFPLEtBQVAsQ0FBYSxJQUF4QixFQUE1QixDQUFQO0FBQ0QsT0FOa0IsQ0FBbkI7QUFPQSxhQUFPLFlBQVA7QUFDRDs7O2dDQUNXLGdCLEVBQWtCO0FBQUE7O0FBQzVCLFVBQUksV0FBVyxLQUFLLE9BQUwsRUFBZjtBQUNBLFVBQUksc0JBQXNCLEtBQUssdUJBQUwsQ0FBNkIsUUFBN0IsQ0FBMUI7QUFDQSxVQUFJLHVCQUF1QixJQUF2QixJQUErQixPQUFPLG9CQUFvQixLQUEzQixLQUFxQyxVQUF4RSxFQUFvRjtBQUNsRixjQUFNLEtBQUssV0FBTCxDQUFpQixRQUFqQixFQUEyQiwrREFBM0IsQ0FBTjtBQUNEO0FBQ0QsVUFBSSxtQkFBbUIsdUJBQVcsR0FBWCxDQUF2QjtBQUNBLFVBQUksc0JBQXNCLHVCQUFXLEdBQVgsQ0FBMUI7QUFDQSxXQUFLLE9BQUwsQ0FBYSxRQUFiLEdBQXdCLGdCQUF4QjtBQUNBLFVBQUksVUFBVSwyQkFBaUIsSUFBakIsRUFBdUIsUUFBdkIsRUFBaUMsS0FBSyxPQUF0QyxFQUErQyxnQkFBL0MsRUFBaUUsbUJBQWpFLENBQWQ7QUFDQSxVQUFJLGFBQWEsMkNBQTBCLG9CQUFvQixLQUFwQixDQUEwQixJQUExQixDQUErQixJQUEvQixFQUFxQyxPQUFyQyxDQUExQixDQUFqQjtBQUNBLFVBQUksQ0FBQyxnQkFBSyxNQUFMLENBQVksVUFBWixDQUFMLEVBQThCO0FBQzVCLGNBQU0sS0FBSyxXQUFMLENBQWlCLFFBQWpCLEVBQTJCLHVDQUF1QyxVQUFsRSxDQUFOO0FBQ0Q7QUFDRCxtQkFBYSxXQUFXLEdBQVgsQ0FBZSxtQkFBVztBQUNyQyxZQUFJLEVBQUUsV0FBVyxPQUFPLFFBQVEsUUFBZixLQUE0QixVQUF6QyxDQUFKLEVBQTBEO0FBQ3hELGdCQUFNLE9BQUssV0FBTCxDQUFpQixRQUFqQixFQUEyQix3REFBd0QsT0FBbkYsQ0FBTjtBQUNEO0FBQ0QsZUFBTyxRQUFRLFFBQVIsQ0FBaUIsbUJBQWpCLEVBQXNDLE9BQUssT0FBTCxDQUFhLFFBQW5ELEVBQTZELEVBQUMsTUFBTSxJQUFQLEVBQTdELENBQVA7QUFDRCxPQUxZLENBQWI7QUFNQSxhQUFPLFVBQVA7QUFDRDs7O3VDQUNrQjtBQUNqQixVQUFJLGdCQUFnQixLQUFLLElBQUwsRUFBcEI7QUFDQSxVQUFJLGlCQUFpQixLQUFLLFlBQUwsQ0FBa0IsYUFBbEIsRUFBaUMsR0FBakMsQ0FBckIsRUFBNEQ7QUFDMUQsYUFBSyxPQUFMO0FBQ0Q7QUFDRjs7O21DQUNjO0FBQ2IsVUFBSSxnQkFBZ0IsS0FBSyxJQUFMLEVBQXBCO0FBQ0EsVUFBSSxpQkFBaUIsS0FBSyxZQUFMLENBQWtCLGFBQWxCLEVBQWlDLEdBQWpDLENBQXJCLEVBQTREO0FBQzFELGFBQUssT0FBTDtBQUNEO0FBQ0Y7OzsyQkFDTSxRLEVBQVU7QUFDZixhQUFPLFlBQVksbUNBQW5CO0FBQ0Q7OzswQkFDSyxRLEVBQVU7QUFDZCxhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxLQUFULEVBQWpEO0FBQ0Q7OztpQ0FDWSxRLEVBQTBCO0FBQUEsVUFBaEIsT0FBZ0IseURBQU4sSUFBTTs7QUFDckMsYUFBTyxZQUFZLG9DQUFaLElBQTBDLFNBQVMsWUFBVCxFQUExQyxLQUFzRSxZQUFZLElBQVosSUFBb0IsU0FBUyxHQUFULE9BQW1CLE9BQTdHLENBQVA7QUFDRDs7O21DQUNjLFEsRUFBVTtBQUN2QixhQUFPLEtBQUssWUFBTCxDQUFrQixRQUFsQixLQUErQixLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQS9CLElBQTJELEtBQUssZ0JBQUwsQ0FBc0IsUUFBdEIsQ0FBM0QsSUFBOEYsS0FBSyxlQUFMLENBQXFCLFFBQXJCLENBQTlGLElBQWdJLEtBQUssVUFBTCxDQUFnQixRQUFoQixDQUF2STtBQUNEOzs7cUNBQ2dCLFEsRUFBVTtBQUN6QixhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxnQkFBVCxFQUFqRDtBQUNEOzs7b0NBQ2UsUSxFQUFVO0FBQ3hCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxTQUFTLGVBQVQsRUFBakQ7QUFDRDs7OytCQUNVLFEsRUFBVTtBQUNuQixhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxVQUFULEVBQWpEO0FBQ0Q7OztxQ0FDZ0IsUSxFQUFVO0FBQ3pCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxTQUFTLGdCQUFULEVBQWpEO0FBQ0Q7OztrQ0FDYSxRLEVBQVU7QUFDdEIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLFNBQVMsYUFBVCxFQUFqRDtBQUNEOzs7d0NBQ21CLFEsRUFBVTtBQUM1QixhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxtQkFBVCxFQUFqRDtBQUNEOzs7NkJBQ1EsUSxFQUFVO0FBQ2pCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxTQUFTLFFBQVQsRUFBakQ7QUFDRDs7OzZCQUNRLFEsRUFBVTtBQUNqQixhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxRQUFULEVBQWpEO0FBQ0Q7OzsrQkFDVSxRLEVBQVU7QUFDbkIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLFNBQVMsVUFBVCxFQUFqRDtBQUNEOzs7NkJBQ1EsUSxFQUFVO0FBQ2pCLFVBQUksS0FBSyxZQUFMLENBQWtCLFFBQWxCLENBQUosRUFBaUM7QUFDL0IsZ0JBQVEsU0FBUyxHQUFULEVBQVI7QUFDRSxlQUFLLEdBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLEtBQUw7QUFDQSxlQUFLLEtBQUw7QUFDQSxlQUFLLE1BQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDQSxlQUFLLElBQUw7QUFDRSxtQkFBTyxJQUFQO0FBQ0Y7QUFDRSxtQkFBTyxLQUFQO0FBZko7QUFpQkQ7QUFDRCxhQUFPLEtBQVA7QUFDRDs7OzhCQUNTLFEsRUFBMEI7QUFBQSxVQUFoQixPQUFnQix5REFBTixJQUFNOztBQUNsQyxhQUFPLFlBQVksb0NBQVosSUFBMEMsU0FBUyxTQUFULEVBQTFDLEtBQW1FLFlBQVksSUFBWixJQUFvQixTQUFTLEdBQVQsT0FBbUIsT0FBMUcsQ0FBUDtBQUNEOzs7aUNBQ1ksUSxFQUEwQjtBQUFBLFVBQWhCLE9BQWdCLHlEQUFOLElBQU07O0FBQ3JDLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxTQUFTLFlBQVQsRUFBMUMsS0FBc0UsWUFBWSxJQUFaLElBQW9CLFNBQVMsR0FBVCxPQUFtQixPQUE3RyxDQUFQO0FBQ0Q7OzsrQkFDVSxRLEVBQVU7QUFDbkIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLDJCQUFXLFFBQVgsQ0FBakQ7QUFDRDs7O3FDQUNnQixRLEVBQVU7QUFDekIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLFNBQVMsWUFBVCxFQUExQyxLQUFzRSxTQUFTLEdBQVQsT0FBbUIsSUFBbkIsSUFBMkIsU0FBUyxHQUFULE9BQW1CLElBQXBILENBQVA7QUFDRDs7O3NDQUNpQixRLEVBQVU7QUFDMUIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLHVDQUFqRDtBQUNEOzs7dUNBQ2tCLFEsRUFBVTtBQUMzQixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsdUNBQWpEO0FBQ0Q7Ozt1Q0FDa0IsUSxFQUFVO0FBQzNCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQixrQ0FBakQ7QUFDRDs7O3lDQUNvQixRLEVBQVU7QUFDN0IsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLG9DQUFqRDtBQUNEOzs7MENBQ3FCLFEsRUFBVTtBQUM5QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIscUNBQWpEO0FBQ0Q7Ozs2Q0FDd0IsUSxFQUFVO0FBQ2pDLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQix3Q0FBakQ7QUFDRDs7O3FDQUNnQixRLEVBQVU7QUFDekIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLFNBQVMsZ0JBQVQsRUFBakQ7QUFDRDs7OzJDQUNzQixRLEVBQVU7QUFDL0IsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLHNDQUFqRDtBQUNEOzs7MENBQ3FCLFEsRUFBVTtBQUM5QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsMENBQWpEO0FBQ0Q7OztxQ0FDZ0IsUSxFQUFVO0FBQ3pCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQixnQ0FBakQ7QUFDRDs7O21DQUNjLFEsRUFBVTtBQUN2QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsOEJBQWpEO0FBQ0Q7OztzQ0FDaUIsUSxFQUFVO0FBQzFCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQixpQ0FBakQ7QUFDRDs7O3FDQUNnQixRLEVBQVU7QUFDekIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLGdDQUFqRDtBQUNEOzs7d0NBQ21CLFEsRUFBVTtBQUM1QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsbUNBQWpEO0FBQ0Q7OztrQ0FDYSxRLEVBQVU7QUFDdEIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLDZCQUFqRDtBQUNEOzs7d0NBQ21CLFEsRUFBVTtBQUM1QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsbUNBQWpEO0FBQ0Q7OztvQ0FDZSxRLEVBQVU7QUFDeEIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLCtCQUFqRDtBQUNEOzs7bUNBQ2MsUSxFQUFVO0FBQ3ZCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQiw4QkFBakQ7QUFDRDs7O3FDQUNnQixRLEVBQVU7QUFDekIsYUFBTyxZQUFZLG9DQUFaLElBQTBDLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxPQUFULEVBQXJCLGdDQUFqRDtBQUNEOzs7a0NBQ2EsUSxFQUFVO0FBQ3RCLGFBQU8sWUFBWSxvQ0FBWixJQUEwQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQiw2QkFBakQ7QUFDRDs7O21DQUNjLFEsRUFBVTtBQUN2QixhQUFPLFlBQVksb0NBQVosSUFBMEMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsOEJBQWpEO0FBQ0Q7OzsyQ0FDc0IsUSxFQUFVO0FBQy9CLGFBQU8sWUFBWSxvQ0FBWixLQUEyQyxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQixpREFBNEUsS0FBSyxPQUFMLENBQWEsS0FBYixDQUFtQixHQUFuQixDQUF1QixTQUFTLE9BQVQsRUFBdkIsNkNBQXZILENBQVA7QUFDRDs7OzRDQUN1QixRLEVBQVU7QUFDaEMsVUFBSSxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEdBQWpCLENBQXFCLFNBQVMsT0FBVCxFQUFyQixDQUFKLEVBQThDO0FBQzVDLGVBQU8sS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQixHQUFqQixDQUFxQixTQUFTLE9BQVQsRUFBckIsQ0FBUDtBQUNEO0FBQ0QsYUFBTyxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLEdBQW5CLENBQXVCLFNBQVMsT0FBVCxFQUF2QixDQUFQO0FBQ0Q7OztpQ0FDWSxLLEVBQU8sSyxFQUFPO0FBQ3pCLFVBQUksRUFBRSxTQUFTLEtBQVgsQ0FBSixFQUF1QjtBQUNyQixlQUFPLEtBQVA7QUFDRDtBQUNELDBCQUFPLGlDQUFQLEVBQWdDLDJCQUFoQztBQUNBLDBCQUFPLGlDQUFQLEVBQWdDLDJCQUFoQztBQUNBLGFBQU8sTUFBTSxVQUFOLE9BQXVCLE1BQU0sVUFBTixFQUE5QjtBQUNEOzs7b0NBQ2UsTyxFQUFTO0FBQ3ZCLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLGFBQWxCLENBQUosRUFBc0M7QUFDcEMsZUFBTyxhQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyx5QkFBaEMsQ0FBTjtBQUNEOzs7aUNBQ1ksTyxFQUFTO0FBQ3BCLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxTQUFMLENBQWUsYUFBZixFQUE4QixPQUE5QixDQUFKLEVBQTRDO0FBQzFDLGVBQU8sYUFBUDtBQUNEO0FBQ0QsWUFBTSxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsRUFBZ0MsZUFBZSxPQUEvQyxDQUFOO0FBQ0Q7OzttQ0FDYztBQUNiLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxnQkFBTCxDQUFzQixhQUF0QixLQUF3QyxLQUFLLGVBQUwsQ0FBcUIsYUFBckIsQ0FBeEMsSUFBK0UsS0FBSyxnQkFBTCxDQUFzQixhQUF0QixDQUEvRSxJQUF1SCxLQUFLLGFBQUwsQ0FBbUIsYUFBbkIsQ0FBdkgsSUFBNEosS0FBSyxVQUFMLENBQWdCLGFBQWhCLENBQTVKLElBQThMLEtBQUssbUJBQUwsQ0FBeUIsYUFBekIsQ0FBbE0sRUFBMk87QUFDek8sZUFBTyxhQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyxxQkFBaEMsQ0FBTjtBQUNEOzs7eUNBQ29CO0FBQ25CLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxlQUFMLENBQXFCLGFBQXJCLENBQUosRUFBeUM7QUFDdkMsZUFBTyxhQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyw0QkFBaEMsQ0FBTjtBQUNEOzs7b0NBQ2U7QUFDZCxVQUFJLGdCQUFnQixLQUFLLE9BQUwsRUFBcEI7QUFDQSxVQUFJLEtBQUssVUFBTCxDQUFnQixhQUFoQixDQUFKLEVBQW9DO0FBQ2xDLGVBQU8sYUFBUDtBQUNEO0FBQ0QsWUFBTSxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsRUFBZ0MsOEJBQWhDLENBQU47QUFDRDs7O2tDQUNhO0FBQ1osVUFBSSxnQkFBZ0IsS0FBSyxPQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQUosRUFBa0M7QUFDaEMsZUFBTyxjQUFjLEtBQWQsRUFBUDtBQUNEO0FBQ0QsWUFBTSxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsRUFBZ0Msa0JBQWhDLENBQU47QUFDRDs7O21DQUNjO0FBQ2IsVUFBSSxnQkFBZ0IsS0FBSyxPQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFFBQUwsQ0FBYyxhQUFkLENBQUosRUFBa0M7QUFDaEMsZUFBTyxjQUFjLEtBQWQsRUFBUDtBQUNEO0FBQ0QsWUFBTSxLQUFLLFdBQUwsQ0FBaUIsYUFBakIsRUFBZ0Msd0JBQWhDLENBQU47QUFDRDs7O21DQUNjO0FBQ2IsVUFBSSxnQkFBZ0IsS0FBSyxPQUFMLEVBQXBCO0FBQ0EsVUFBSSxLQUFLLFVBQUwsQ0FBZ0IsYUFBaEIsQ0FBSixFQUFvQztBQUNsQyxlQUFPLGNBQWMsS0FBZCxFQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyx5QkFBaEMsQ0FBTjtBQUNEOzs7eUNBQ29CO0FBQ25CLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksZ0NBQWdCLGFBQWhCLENBQUosRUFBb0M7QUFDbEMsZUFBTyxhQUFQO0FBQ0Q7QUFDRCxZQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyw0QkFBaEMsQ0FBTjtBQUNEOzs7b0NBQ2UsTyxFQUFTO0FBQ3ZCLFVBQUksZ0JBQWdCLEtBQUssT0FBTCxFQUFwQjtBQUNBLFVBQUksS0FBSyxZQUFMLENBQWtCLGFBQWxCLENBQUosRUFBc0M7QUFDcEMsWUFBSSxPQUFPLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDbEMsY0FBSSxjQUFjLEdBQWQsT0FBd0IsT0FBNUIsRUFBcUM7QUFDbkMsbUJBQU8sYUFBUDtBQUNELFdBRkQsTUFFTztBQUNMLGtCQUFNLEtBQUssV0FBTCxDQUFpQixhQUFqQixFQUFnQyxpQkFBaUIsT0FBakIsR0FBMkIsYUFBM0QsQ0FBTjtBQUNEO0FBQ0Y7QUFDRCxlQUFPLGFBQVA7QUFDRDtBQUNELFlBQU0sS0FBSyxXQUFMLENBQWlCLGFBQWpCLEVBQWdDLHdCQUFoQyxDQUFOO0FBQ0Q7OztnQ0FDVyxPLEVBQVMsVyxFQUFhO0FBQ2hDLFVBQUksVUFBVSxFQUFkO0FBQ0EsVUFBSSxnQkFBZ0IsT0FBcEI7QUFDQSxVQUFJLEtBQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsa0JBQVUsS0FBSyxJQUFMLENBQVUsS0FBVixDQUFnQixDQUFoQixFQUFtQixFQUFuQixFQUF1QixHQUF2QixDQUEyQixvQkFBWTtBQUMvQyxjQUFJLFNBQVMsV0FBVCxFQUFKLEVBQTRCO0FBQzFCLG1CQUFPLFNBQVMsS0FBVCxFQUFQO0FBQ0Q7QUFDRCxpQkFBTyxnQkFBSyxFQUFMLENBQVEsUUFBUixDQUFQO0FBQ0QsU0FMUyxFQUtQLE9BTE8sR0FLRyxHQUxILENBS08saUJBQVM7QUFDeEIsY0FBSSxVQUFVLGFBQWQsRUFBNkI7QUFDM0IsbUJBQU8sT0FBTyxNQUFNLEdBQU4sRUFBUCxHQUFxQixJQUE1QjtBQUNEO0FBQ0QsaUJBQU8sTUFBTSxHQUFOLEVBQVA7QUFDRCxTQVZTLEVBVVAsSUFWTyxDQVVGLEdBVkUsQ0FBVjtBQVdELE9BWkQsTUFZTztBQUNMLGtCQUFVLGNBQWMsUUFBZCxFQUFWO0FBQ0Q7QUFDRCxhQUFPLElBQUksS0FBSixDQUFVLGNBQWMsSUFBZCxHQUFxQixPQUEvQixDQUFQO0FBQ0QiLCJmaWxlIjoiZW5mb3Jlc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Z1bmN0aW9uRGVjbFRyYW5zZm9ybSwgVmFyaWFibGVEZWNsVHJhbnNmb3JtLCBOZXdUcmFuc2Zvcm0sIExldERlY2xUcmFuc2Zvcm0sIENvbnN0RGVjbFRyYW5zZm9ybSwgU3ludGF4RGVjbFRyYW5zZm9ybSwgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSwgU3ludGF4UXVvdGVUcmFuc2Zvcm0sIFJldHVyblN0YXRlbWVudFRyYW5zZm9ybSwgV2hpbGVUcmFuc2Zvcm0sIElmVHJhbnNmb3JtLCBGb3JUcmFuc2Zvcm0sIFN3aXRjaFRyYW5zZm9ybSwgQnJlYWtUcmFuc2Zvcm0sIENvbnRpbnVlVHJhbnNmb3JtLCBEb1RyYW5zZm9ybSwgRGVidWdnZXJUcmFuc2Zvcm0sIFdpdGhUcmFuc2Zvcm0sIFRyeVRyYW5zZm9ybSwgVGhyb3dUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtpc09wZXJhdG9yLCBpc1VuYXJ5T3BlcmF0b3IsIGdldE9wZXJhdG9yQXNzb2MsIGdldE9wZXJhdG9yUHJlYywgb3BlcmF0b3JMdH0gZnJvbSBcIi4vb3BlcmF0b3JzXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHtmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IHtzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzfSBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IE1hY3JvQ29udGV4dCBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5jb25zdCBFWFBSX0xPT1BfT1BFUkFUT1JfMjYgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9FWFBBTlNJT05fMjggPSB7fTtcbmV4cG9ydCBjbGFzcyBFbmZvcmVzdGVyIHtcbiAgY29uc3RydWN0b3Ioc3R4bF8yOSwgcHJldl8zMCwgY29udGV4dF8zMSkge1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChzdHhsXzI5KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChwcmV2XzMwKSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChjb250ZXh0XzMxLCBcImV4cGVjdGluZyBhIGNvbnRleHQgdG8gZW5mb3Jlc3RcIik7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLnJlc3QgPSBzdHhsXzI5O1xuICAgIHRoaXMucHJldiA9IHByZXZfMzA7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF8zMTtcbiAgfVxuICBwZWVrKG5fMzIgPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdC5nZXQobl8zMik7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBsZXQgcmV0XzMzID0gdGhpcy5yZXN0LmZpcnN0KCk7XG4gICAgdGhpcy5yZXN0ID0gdGhpcy5yZXN0LnJlc3QoKTtcbiAgICByZXR1cm4gcmV0XzMzO1xuICB9XG4gIGVuZm9yZXN0KHR5cGVfMzQgPSBcIk1vZHVsZVwiKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdF8zNTtcbiAgICBpZiAodHlwZV8zNCA9PT0gXCJleHByZXNzaW9uXCIpIHtcbiAgICAgIHJlc3VsdF8zNSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRfMzUgPSB0aGlzLmVuZm9yZXN0TW9kdWxlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF8zNTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdEJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RNb2R1bGVJdGVtKCk7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGVJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM2LCBcImltcG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzYsIFwiZXhwb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzM3LCBcIipcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRBbGxGcm9tXCIsIHttb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMzcpKSB7XG4gICAgICBsZXQgbmFtZWRFeHBvcnRzID0gdGhpcy5lbmZvcmVzdEV4cG9ydENsYXVzZSgpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IG51bGw7XG4gICAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiZnJvbVwiKSkge1xuICAgICAgICBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RnJvbVwiLCB7bmFtZWRFeHBvcnRzOiBuYW1lZEV4cG9ydHMsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzcsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiBmYWxzZX0pfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzcsIFwiZGVmYXVsdFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybSh0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjbGFzc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgYm9keSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogYm9keX0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpIHx8IHRoaXMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpIHx8IHRoaXMuaXNTeW50YXhEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCl9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzcsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKSB7XG4gICAgbGV0IGVuZl8zOCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzM5ID0gW107XG4gICAgd2hpbGUgKGVuZl8zOC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF8zOS5wdXNoKGVuZl8zOC5lbmZvcmVzdEV4cG9ydFNwZWNpZmllcigpKTtcbiAgICAgIGVuZl8zOC5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzM5KTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydFNwZWNpZmllcigpIHtcbiAgICBsZXQgbmFtZV80MCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBleHBvcnRlZE5hbWUgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQwLCBleHBvcnRlZE5hbWU6IGV4cG9ydGVkTmFtZX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGV4cG9ydGVkTmFtZTogbmFtZV80MH0pO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF80MSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBkZWZhdWx0QmluZGluZ180MiA9IG51bGw7XG4gICAgbGV0IG5hbWVkSW1wb3J0c180MyA9IExpc3QoKTtcbiAgICBsZXQgZm9yU3ludGF4XzQ0ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF80MSkpIHtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNDIsIG5hbWVkSW1wb3J0czogbmFtZWRJbXBvcnRzXzQzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQxKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNDEpKSB7XG4gICAgICBkZWZhdWx0QmluZGluZ180MiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBmb3JTeW50YXhfNDQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllciwgbmFtZWRJbXBvcnRzOiBMaXN0KCksIGZvclN5bnRheDogZm9yU3ludGF4XzQ0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgbG9va2FoZWFkXzQxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzQxKSkge1xuICAgICAgbGV0IGltcG9ydHMgPSB0aGlzLmVuZm9yZXN0TmFtZWRJbXBvcnRzKCk7XG4gICAgICBsZXQgZnJvbUNsYXVzZSA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNDQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNDIsIGZvclN5bnRheDogZm9yU3ludGF4XzQ0LCBuYW1lZEltcG9ydHM6IGltcG9ydHMsIG1vZHVsZVNwZWNpZmllcjogZnJvbUNsYXVzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzQxLCBcIipcIikpIHtcbiAgICAgIGxldCBuYW1lc3BhY2VCaW5kaW5nID0gdGhpcy5lbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydE5hbWVzcGFjZVwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBmb3JTeW50YXg6IGZvclN5bnRheF80NCwgbmFtZXNwYWNlQmluZGluZzogbmFtZXNwYWNlQmluZGluZywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNDEsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCkge1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiKlwiKTtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVkSW1wb3J0cygpIHtcbiAgICBsZXQgZW5mXzQ1ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfNDYgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzQ1LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzQ2LnB1c2goZW5mXzQ1LmVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpKTtcbiAgICAgIGVuZl80NS5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzQ2KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF80NyA9IHRoaXMucGVlaygpO1xuICAgIGxldCBuYW1lXzQ4O1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNDcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF80NykpIHtcbiAgICAgIG5hbWVfNDggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzQ4fSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzQ3LCBcInVuZXhwZWN0ZWQgdG9rZW4gaW4gaW1wb3J0IHNwZWNpZmllclwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQ4LCBiaW5kaW5nOiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKX0pO1xuICB9XG4gIGVuZm9yZXN0RnJvbUNsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImZyb21cIik7XG4gICAgbGV0IGxvb2thaGVhZF80OSA9IHRoaXMubWF0Y2hTdHJpbmdMaXRlcmFsKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIGxvb2thaGVhZF80OTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfNTAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81MCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzUxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgdGhpcy5yZXN0ID0gdGhpcy5leHBhbmRNYWNybygpLmNvbmNhdCh0aGlzLnJlc3QpO1xuICAgICAgbG9va2FoZWFkXzUxID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJsb2NrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWZUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZlN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGb3JUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3dpdGNoVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyZWFrVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29udGludWVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEb1RyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERvU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RlYnVnZ2VyVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2l0aFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVHJ5VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VHJ5U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rocm93VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTEsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81MSkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIjpcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81MSwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkVtcHR5U3RhdGVtZW50XCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCkge1xuICAgIGxldCBsYWJlbF81MiA9IHRoaXMubWF0Y2hJZGVudGlmaWVyKCk7XG4gICAgbGV0IHB1bmNfNTMgPSB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IHN0bXRfNTQgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzUyLCBib2R5OiBzdG10XzU0fSk7XG4gIH1cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImJyZWFrXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNTUgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNTYgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTUsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzU2fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNTUpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTUsIFwibGV0XCIpKSB7XG4gICAgICBsYWJlbF81NiA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTZ9KTtcbiAgfVxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRyeVwiKTtcbiAgICBsZXQgYm9keV81NyA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXRjaFwiKSkge1xuICAgICAgbGV0IGNhdGNoQ2xhdXNlID0gdGhpcy5lbmZvcmVzdENhdGNoQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU3LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2UsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NywgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTcsIGNhdGNoQ2xhdXNlOiBudWxsLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInRyeSB3aXRoIG5vIGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gIH1cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhdGNoXCIpO1xuICAgIGxldCBiaW5kaW5nUGFyZW5zXzU4ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNTkgPSBuZXcgRW5mb3Jlc3RlcihiaW5kaW5nUGFyZW5zXzU4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGJpbmRpbmdfNjAgPSBlbmZfNTkuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGJvZHlfNjEgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogYmluZGluZ182MCwgYm9keTogYm9keV82MX0pO1xuICB9XG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0aHJvd1wiKTtcbiAgICBsZXQgZXhwcmVzc2lvbl82MiA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb25fNjJ9KTtcbiAgfVxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aXRoXCIpO1xuICAgIGxldCBvYmpQYXJlbnNfNjMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl82NCA9IG5ldyBFbmZvcmVzdGVyKG9ialBhcmVuc182MywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBvYmplY3RfNjUgPSBlbmZfNjQuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfNjYgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7b2JqZWN0OiBvYmplY3RfNjUsIGJvZHk6IGJvZHlfNjZ9KTtcbiAgfVxuICBlbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVidWdnZXJcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGVidWdnZXJTdGF0ZW1lbnRcIiwge30pO1xuICB9XG4gIGVuZm9yZXN0RG9TdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkb1wiKTtcbiAgICBsZXQgYm9keV82NyA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCB0ZXN0Qm9keV82OCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzY5ID0gbmV3IEVuZm9yZXN0ZXIodGVzdEJvZHlfNjgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdF83MCA9IGVuZl82OS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzY3LCB0ZXN0OiB0ZXN0XzcwfSk7XG4gIH1cbiAgZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dkXzcxID0gdGhpcy5tYXRjaEtleXdvcmQoXCJjb250aW51ZVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzcyID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzczID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzcyLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF83M30pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkXzcxLCBsb29rYWhlYWRfNzIpICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNzIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzIsIFwibGV0XCIpKSkge1xuICAgICAgbGFiZWxfNzMgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJzd2l0Y2hcIik7XG4gICAgbGV0IGNvbmRfNzQgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl83NSA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfNzQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZGlzY3JpbWluYW50Xzc2ID0gZW5mXzc1LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5Xzc3ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBpZiAoYm9keV83Ny5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzc2LCBjYXNlczogTGlzdCgpfSk7XG4gICAgfVxuICAgIGVuZl83NSA9IG5ldyBFbmZvcmVzdGVyKGJvZHlfNzcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY2FzZXNfNzggPSBlbmZfNzUuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgIGxldCBsb29rYWhlYWRfNzkgPSBlbmZfNzUucGVlaygpO1xuICAgIGlmIChlbmZfNzUuaXNLZXl3b3JkKGxvb2thaGVhZF83OSwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmZfNzUuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIHByZURlZmF1bHRDYXNlczogY2FzZXNfNzgsIGRlZmF1bHRDYXNlOiBkZWZhdWx0Q2FzZSwgcG9zdERlZmF1bHRDYXNlczogcG9zdERlZmF1bHRDYXNlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzc2LCBjYXNlczogY2FzZXNfNzh9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VzKCkge1xuICAgIGxldCBjYXNlc184MCA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikpKSB7XG4gICAgICBjYXNlc184MC5wdXNoKHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChjYXNlc184MCk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2FzZVwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpLCBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCkge1xuICAgIGxldCByZXN1bHRfODEgPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhc2VcIikpKSB7XG4gICAgICByZXN1bHRfODEucHVzaCh0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF84MSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVmYXVsdFwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9yU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZm9yXCIpO1xuICAgIGxldCBjb25kXzgyID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfODMgPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzgyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF84NCwgdGVzdF84NSwgaW5pdF84NiwgcmlnaHRfODcsIHR5cGVfODgsIGxlZnRfODksIHVwZGF0ZV85MDtcbiAgICBpZiAoZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICBpZiAoIWVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIHRlc3RfODUgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgIGlmIChlbmZfODMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBudWxsLCB0ZXN0OiB0ZXN0Xzg1LCB1cGRhdGU6IHJpZ2h0Xzg3LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9va2FoZWFkXzg0ID0gZW5mXzgzLnBlZWsoKTtcbiAgICAgIGlmIChlbmZfODMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkgfHwgZW5mXzgzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfODQpIHx8IGVuZl84My5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfODQpKSB7XG4gICAgICAgIGluaXRfODYgPSBlbmZfODMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgIGxvb2thaGVhZF84NCA9IGVuZl84My5wZWVrKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfODQsIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzg0LCBcIm9mXCIpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84NCwgXCJpblwiKSkge1xuICAgICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF84NCwgXCJvZlwiKSkge1xuICAgICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODgsIHtsZWZ0OiBpbml0Xzg2LCByaWdodDogcmlnaHRfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfODUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3RfODUgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlXzkwID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGVuZl84My5wZWVrKDEpLCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGVuZl84My5wZWVrKDEpLCBcIm9mXCIpKSB7XG4gICAgICAgICAgbGVmdF84OSA9IGVuZl84My5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgICAgbGV0IGtpbmQgPSBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChraW5kLCBcImluXCIpKSB7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByaWdodF84NyA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84OCwge2xlZnQ6IGxlZnRfODksIHJpZ2h0OiByaWdodF84NywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5pdF84NiA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF84NSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfOTAgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IGluaXRfODYsIHRlc3Q6IHRlc3RfODUsIHVwZGF0ZTogdXBkYXRlXzkwLCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RJZlN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImlmXCIpO1xuICAgIGxldCBjb25kXzkxID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfOTIgPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzkxLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF85MyA9IGVuZl85Mi5wZWVrKCk7XG4gICAgbGV0IHRlc3RfOTQgPSBlbmZfOTIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfOTQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl85Mi5jcmVhdGVFcnJvcihsb29rYWhlYWRfOTMsIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBjb25zZXF1ZW50Xzk1ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIGxldCBhbHRlcm5hdGVfOTYgPSBudWxsO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJlbHNlXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGFsdGVybmF0ZV85NiA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWZTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfOTQsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfOTUsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk2fSk7XG4gIH1cbiAgZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCBjb25kXzk3ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfOTggPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzk3LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF85OSA9IGVuZl85OC5wZWVrKCk7XG4gICAgbGV0IHRlc3RfMTAwID0gZW5mXzk4LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ZXN0XzEwMCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzk4LmNyZWF0ZUVycm9yKGxvb2thaGVhZF85OSwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGJvZHlfMTAxID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIldoaWxlU3RhdGVtZW50XCIsIHt0ZXN0OiB0ZXN0XzEwMCwgYm9keTogYm9keV8xMDF9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrU3RhdGVtZW50KCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5lbmZvcmVzdEJsb2NrKCl9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrKCkge1xuICAgIGxldCBiXzEwMiA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGJvZHlfMTAzID0gW107XG4gICAgbGV0IGVuZl8xMDQgPSBuZXcgRW5mb3Jlc3RlcihiXzEwMiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTA0LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xMDQucGVlaygpO1xuICAgICAgbGV0IHN0bXQgPSBlbmZfMTA0LmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICBpZiAoc3RtdCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IGVuZl8xMDQuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcIm5vdCBhIHN0YXRlbWVudFwiKTtcbiAgICAgIH1cbiAgICAgIGJvZHlfMTAzLnB1c2goc3RtdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiBMaXN0KGJvZHlfMTAzKX0pO1xuICB9XG4gIGVuZm9yZXN0Q2xhc3Moe2lzRXhwciwgaW5EZWZhdWx0fSkge1xuICAgIGxldCBrd18xMDUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbmFtZV8xMDYgPSBudWxsLCBzdXByXzEwNyA9IG51bGw7XG4gICAgbGV0IHR5cGVfMTA4ID0gaXNFeHByID8gXCJDbGFzc0V4cHJlc3Npb25cIiA6IFwiQ2xhc3NEZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIG5hbWVfMTA2ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICghaXNFeHByKSB7XG4gICAgICBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICAgIG5hbWVfMTA2ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiX2RlZmF1bHRcIiwga3dfMTA1KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcih0aGlzLnBlZWsoKSwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImV4dGVuZHNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgc3Vwcl8xMDcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9XG4gICAgbGV0IGVsZW1lbnRzXzEwOSA9IFtdO1xuICAgIGxldCBlbmZfMTEwID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTEwLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgaWYgKGVuZl8xMTAuaXNQdW5jdHVhdG9yKGVuZl8xMTAucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgZW5mXzExMC5hZHZhbmNlKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IGlzU3RhdGljID0gZmFsc2U7XG4gICAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMTAuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG4gICAgICBpZiAoa2luZCA9PT0gXCJpZGVudGlmaWVyXCIgJiYgbWV0aG9kT3JLZXkudmFsdWUudmFsKCkgPT09IFwic3RhdGljXCIpIHtcbiAgICAgICAgaXNTdGF0aWMgPSB0cnVlO1xuICAgICAgICAoe21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMTAuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkpO1xuICAgICAgfVxuICAgICAgaWYgKGtpbmQgPT09IFwibWV0aG9kXCIpIHtcbiAgICAgICAgZWxlbWVudHNfMTA5LnB1c2gobmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiBpc1N0YXRpYywgbWV0aG9kOiBtZXRob2RPcktleX0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IoZW5mXzExMC5wZWVrKCksIFwiT25seSBtZXRob2RzIGFyZSBhbGxvd2VkIGluIGNsYXNzZXNcIik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwOCwge25hbWU6IG5hbWVfMTA2LCBzdXBlcjogc3Vwcl8xMDcsIGVsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEwOSl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcn0gPSB7fSkge1xuICAgIGxldCBsb29rYWhlYWRfMTExID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMTEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTEpIHx8IGFsbG93UHVuY3R1YXRvciAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTExKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7YWxsb3dQdW5jdHVhdG9yOiBhbGxvd1B1bmN0dWF0b3J9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTExKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUJpbmRpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzExMSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0QmluZGluZygpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldFwiKTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEJpbmRpbmcoKSB7XG4gICAgbGV0IGVuZl8xMTIgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTEzID0gW107XG4gICAgd2hpbGUgKGVuZl8xMTIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBwcm9wZXJ0aWVzXzExMy5wdXNoKGVuZl8xMTIuZW5mb3Jlc3RCaW5kaW5nUHJvcGVydHkoKSk7XG4gICAgICBlbmZfMTEyLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiBMaXN0KHByb3BlcnRpZXNfMTEzKX0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkge1xuICAgIGxldCBsb29rYWhlYWRfMTE0ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHtuYW1lLCBiaW5kaW5nfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzExNCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExNCwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExNCwgXCJ5aWVsZFwiKSkge1xuICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCI6XCIpKSB7XG4gICAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGV4cHI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogYmluZGluZywgaW5pdDogZGVmYXVsdFZhbHVlfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBiaW5kaW5nID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IG5hbWUsIGJpbmRpbmc6IGJpbmRpbmd9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5QmluZGluZygpIHtcbiAgICBsZXQgYnJhY2tldF8xMTUgPSB0aGlzLm1hdGNoU3F1YXJlcygpO1xuICAgIGxldCBlbmZfMTE2ID0gbmV3IEVuZm9yZXN0ZXIoYnJhY2tldF8xMTUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZWxlbWVudHNfMTE3ID0gW10sIHJlc3RFbGVtZW50XzExOCA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xMTYucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgZWw7XG4gICAgICBpZiAoZW5mXzExNi5pc1B1bmN0dWF0b3IoZW5mXzExNi5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTE2LmNvbnN1bWVDb21tYSgpO1xuICAgICAgICBlbCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZW5mXzExNi5pc1B1bmN0dWF0b3IoZW5mXzExNi5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgICAgZW5mXzExNi5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdEVsZW1lbnRfMTE4ID0gZW5mXzExNi5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbCA9IGVuZl8xMTYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGVuZl8xMTYuY29uc3VtZUNvbW1hKCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50c18xMTcucHVzaChlbCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTE3KSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50XzExOH0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKSB7XG4gICAgbGV0IGJpbmRpbmdfMTE5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIGJpbmRpbmdfMTE5ID0gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IGJpbmRpbmdfMTE5LCBpbml0OiBpbml0fSk7XG4gICAgfVxuICAgIHJldHVybiBiaW5kaW5nXzExOTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKHthbGxvd1B1bmN0dWF0b3J9ID0ge30pIHtcbiAgICBsZXQgbmFtZV8xMjA7XG4gICAgaWYgKGFsbG93UHVuY3R1YXRvciAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIG5hbWVfMTIwID0gdGhpcy5lbmZvcmVzdFB1bmN0dWF0b3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZV8xMjAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV8xMjB9KTtcbiAgfVxuICBlbmZvcmVzdFB1bmN0dWF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMjEgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyMSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTIxLCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgZW5mb3Jlc3RJZGVudGlmaWVyKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTIyID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMjIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMjIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEyMiwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBlbmZvcmVzdFJldHVyblN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dfMTIzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMjQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzEyNCAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dfMTIzLCBsb29rYWhlYWRfMTI0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBudWxsfSk7XG4gICAgfVxuICAgIGxldCB0ZXJtXzEyNSA9IG51bGw7XG4gICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTI0LCBcIjtcIikpIHtcbiAgICAgIHRlcm1fMTI1ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIGV4cGVjdCh0ZXJtXzEyNSAhPSBudWxsLCBcIkV4cGVjdGluZyBhbiBleHByZXNzaW9uIHRvIGZvbGxvdyByZXR1cm4ga2V5d29yZFwiLCBsb29rYWhlYWRfMTI0LCB0aGlzLnJlc3QpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRlcm1fMTI1fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCkge1xuICAgIGxldCBraW5kXzEyNjtcbiAgICBsZXQgbG9va2FoZWFkXzEyNyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBraW5kU3luXzEyOCA9IGxvb2thaGVhZF8xMjc7XG4gICAgaWYgKGtpbmRTeW5fMTI4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI4LnJlc29sdmUoKSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNiA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI4LnJlc29sdmUoKSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI2ID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI4LnJlc29sdmUoKSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI2ID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG4gICAgbGV0IGRlY2xzXzEyOSA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheDoga2luZF8xMjYgPT09IFwic3ludGF4XCIgfHwga2luZF8xMjYgPT09IFwic3ludGF4cmVjXCJ9KTtcbiAgICAgIGxldCBsb29rYWhlYWRfMTI3ID0gdGhpcy5wZWVrKCk7XG4gICAgICBkZWNsc18xMjkgPSBkZWNsc18xMjkuY29uY2F0KHRlcm0pO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMjcsIFwiLFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBraW5kXzEyNiwgZGVjbGFyYXRvcnM6IGRlY2xzXzEyOX0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheH0pIHtcbiAgICBsZXQgaWRfMTMwID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcjogaXNTeW50YXh9KTtcbiAgICBsZXQgbG9va2FoZWFkXzEzMSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpbml0XzEzMiwgcmVzdF8xMzM7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzEsIFwiPVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBpbml0XzEzMiA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdF8xMzIgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IGlkXzEzMCwgaW5pdDogaW5pdF8xMzJ9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0XzEzNCA9IHRoaXMucmVzdC5nZXQoMCk7XG4gICAgbGV0IGV4cHJfMTM1ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwcl8xMzUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3Ioc3RhcnRfMTM0LCBcIm5vdCBhIHZhbGlkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMTM1fSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0XzEzNiA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGxldCBsb29rYWhlYWRfMTM3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzcsIFwiLFwiKSkge1xuICAgICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgbGVmdF8xMzYgPSBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTM2LCBvcGVyYXRvcjogb3BlcmF0b3IsIHJpZ2h0OiByaWdodH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHJldHVybiBsZWZ0XzEzNjtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtwcmVjOiAwLCBjb21iaW5lOiB4XzEzOCA9PiB4XzEzOCwgc3RhY2s6IExpc3QoKX07XG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3ICYmIHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9PUEVSQVRPUl8yNiB8fCB0ZXJtID09PSBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4KSB7XG4gICAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRlcm0gPSB0ZXJtO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzOSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICB0aGlzLnJlc3QgPSByZXN1bHQuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX0VYUEFOU0lPTl8yODtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM5LCBcInlpZWxkXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwic3VwZXJcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU3VwZXJcIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM5KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzkpKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiPT5cIikgJiYgdGhpcy5saW5lTnVtYmVyRXEobG9va2FoZWFkXzEzOSwgdGhpcy5wZWVrKDEpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4VGVtcGxhdGUobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4UXVvdGVUcmFuc2Zvcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM5LCBcInRoaXNcIikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRoaXNFeHByZXNzaW9uXCIsIHtzdHg6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzkpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwieWllbGRcIikpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIGxldCBudW0gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmIChudW0udmFsKCkgPT09IDEgLyAwKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIiwge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbnVtfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBudWxsLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIGxldCByZVN0eCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGxhc3RTbGFzaCA9IHJlU3R4LnRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgIGxldCBwYXR0ZXJuID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UoMSwgbGFzdFNsYXNoKTtcbiAgICAgIGxldCBmbGFncyA9IHJlU3R4LnRva2VuLnZhbHVlLnNsaWNlKGxhc3RTbGFzaCArIDEpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiwge3BhdHRlcm46IHBhdHRlcm4sIGZsYWdzOiBmbGFnc30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIsIHtpbm5lcjogdGhpcy5hZHZhbmNlKCkuaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVXBkYXRlT3BlcmF0b3IobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzOSwgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IHBhcmVuID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiB0aGlzLnRlcm0sIGFyZ3VtZW50czogcGFyZW4uaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRoaXMudGVybSwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzQXNzaWduKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICBsZXQgYmluZGluZyA9IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0aGlzLnRlcm0pO1xuICAgICAgbGV0IG9wID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgaW5pdCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICAgIGlmIChvcC52YWwoKSA9PT0gXCI9XCIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IGJpbmRpbmcsIGV4cHJlc3Npb246IGluaXR9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IGJpbmRpbmcsIG9wZXJhdG9yOiBvcC52YWwoKSwgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzksIFwiP1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb25kaXRpb25hbEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9OT19DSEFOR0VfMjc7XG4gIH1cbiAgZW5mb3Jlc3RBcmd1bWVudExpc3QoKSB7XG4gICAgbGV0IHJlc3VsdF8xNDAgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgYXJnO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgYXJnID0gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJnID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLFwiKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdF8xNDAucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMTQwKTtcbiAgfVxuICBlbmZvcmVzdE5ld0V4cHJlc3Npb24oKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJuZXdcIik7XG4gICAgbGV0IGNhbGxlZV8xNDE7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcIm5ld1wiKSkge1xuICAgICAgY2FsbGVlXzE0MSA9IHRoaXMuZW5mb3Jlc3ROZXdFeHByZXNzaW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJzdXBlclwiKSkge1xuICAgICAgY2FsbGVlXzE0MSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLlwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwidGFyZ2V0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3VGFyZ2V0RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxlZV8xNDEgPSBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpfSk7XG4gICAgfVxuICAgIGxldCBhcmdzXzE0MjtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGFyZ3NfMTQyID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzXzE0MiA9IExpc3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTQxLCBhcmd1bWVudHM6IGFyZ3NfMTQyfSk7XG4gIH1cbiAgZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNDMgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMudGVybSwgZXhwcmVzc2lvbjogZW5mXzE0My5lbmZvcmVzdEV4cHJlc3Npb24oKX0pO1xuICB9XG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDQpIHtcbiAgICBzd2l0Y2ggKHRlcm1fMTQ0LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDQubmFtZX0pO1xuICAgICAgY2FzZSBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCI6XG4gICAgICAgIGlmICh0ZXJtXzE0NC5pbm5lci5zaXplID09PSAxICYmIHRoaXMuaXNJZGVudGlmaWVyKHRlcm1fMTQ0LmlubmVyLmdldCgwKSkpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDQuaW5uZXIuZ2V0KDApfSk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgXCJEYXRhUHJvcGVydHlcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IHRlcm1fMTQ0Lm5hbWUsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTQ0LmV4cHJlc3Npb24pfSk7XG4gICAgICBjYXNlIFwiU2hvcnRoYW5kUHJvcGVydHlcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDQubmFtZX0pLCBpbml0OiBudWxsfSk7XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzE0NC5wcm9wZXJ0aWVzLm1hcCh0XzE0NSA9PiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodF8xNDUpKX0pO1xuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICBsZXQgbGFzdCA9IHRlcm1fMTQ0LmVsZW1lbnRzLmxhc3QoKTtcbiAgICAgICAgaWYgKGxhc3QgIT0gbnVsbCAmJiBsYXN0LnR5cGUgPT09IFwiU3ByZWFkRWxlbWVudFwiKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDQuZWxlbWVudHMuc2xpY2UoMCwgLTEpLm1hcCh0XzE0NiA9PiB0XzE0NiAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0XzE0NikpLCByZXN0RWxlbWVudDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQobGFzdC5leHByZXNzaW9uKX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTQ0LmVsZW1lbnRzLm1hcCh0XzE0NyA9PiB0XzE0NyAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0XzE0NykpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTQ0LmVsZW1lbnRzLm1hcCh0XzE0OCA9PiB0XzE0OCAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodF8xNDgpKSwgcmVzdEVsZW1lbnQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTQ0LnZhbHVlfSk7XG4gICAgICBjYXNlIFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5QmluZGluZ1wiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1dpdGhEZWZhdWx0XCI6XG4gICAgICBjYXNlIFwiT2JqZWN0QmluZGluZ1wiOlxuICAgICAgICByZXR1cm4gdGVybV8xNDQ7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvciBcIiArIHRlcm1fMTQ0LnR5cGUpO1xuICB9XG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtXzE0OSkge1xuICAgIHN3aXRjaCAodGVybV8xNDkudHlwZSkge1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTQ5LmJpbmRpbmcpLCBpbml0OiB0ZXJtXzE0OS5leHByZXNzaW9ufSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDkpO1xuICB9XG4gIGVuZm9yZXN0QXJyb3dFeHByZXNzaW9uKCkge1xuICAgIGxldCBlbmZfMTUwO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGVuZl8xNTAgPSBuZXcgRW5mb3Jlc3RlcihMaXN0Lm9mKHRoaXMuYWR2YW5jZSgpKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGVuZl8xNTAgPSBuZXcgRW5mb3Jlc3RlcihwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfVxuICAgIGxldCBwYXJhbXNfMTUxID0gZW5mXzE1MC5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj0+XCIpO1xuICAgIGxldCBib2R5XzE1MjtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGJvZHlfMTUyID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5mXzE1MCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgYm9keV8xNTIgPSBlbmZfMTUwLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZl8xNTAucmVzdDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyb3dFeHByZXNzaW9uXCIsIHtwYXJhbXM6IHBhcmFtc18xNTEsIGJvZHk6IGJvZHlfMTUyfSk7XG4gIH1cbiAgZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGt3ZF8xNTMgPSB0aGlzLm1hdGNoS2V5d29yZChcInlpZWxkXCIpO1xuICAgIGxldCBsb29rYWhlYWRfMTU0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNTQgJiYgIXRoaXMubGluZU51bWJlckVxKGt3ZF8xNTMsIGxvb2thaGVhZF8xNTQpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IG51bGx9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiKlwiKSkge1xuICAgICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfVxuICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgbGV0IHR5cGUgPSBpc0dlbmVyYXRvciA/IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIgOiBcIllpZWxkRXhwcmVzc2lvblwiO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGUsIHtleHByZXNzaW9uOiBleHByfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4VGVtcGxhdGVcIiwge3RlbXBsYXRlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3ludGF4UXVvdGUoKSB7XG4gICAgbGV0IG5hbWVfMTU1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4UXVvdGVcIiwge25hbWU6IG5hbWVfMTU1LCB0ZW1wbGF0ZTogbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xNTV9KSwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KX0pO1xuICB9XG4gIGVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqZWN0XzE1NiA9IHRoaXMudGVybTtcbiAgICBsZXQgZG90XzE1NyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0eV8xNTggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IG9iamVjdF8xNTYsIHByb3BlcnR5OiBwcm9wZXJ0eV8xNTh9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgYXJyXzE1OSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBlbGVtZW50c18xNjAgPSBbXTtcbiAgICBsZXQgZW5mXzE2MSA9IG5ldyBFbmZvcmVzdGVyKGFycl8xNTkuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTYxLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTYxLnBlZWsoKTtcbiAgICAgIGlmIChlbmZfMTYxLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTYxLmFkdmFuY2UoKTtcbiAgICAgICAgZWxlbWVudHNfMTYwLnB1c2gobnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKGVuZl8xNjEuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIuLi5cIikpIHtcbiAgICAgICAgZW5mXzE2MS5hZHZhbmNlKCk7XG4gICAgICAgIGxldCBleHByZXNzaW9uID0gZW5mXzE2MS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmIChleHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTYxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RpbmcgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNjAucHVzaChuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb259KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgdGVybSA9IGVuZl8xNjEuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAodGVybSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mXzE2MS5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0ZWQgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNjAucHVzaCh0ZXJtKTtcbiAgICAgICAgZW5mXzE2MS5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogTGlzdChlbGVtZW50c18xNjApfSk7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmpfMTYyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTYzID0gTGlzdCgpO1xuICAgIGxldCBlbmZfMTY0ID0gbmV3IEVuZm9yZXN0ZXIob2JqXzE2Mi5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxhc3RQcm9wXzE2NSA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xNjQucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IHByb3AgPSBlbmZfMTY0LmVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCk7XG4gICAgICBlbmZfMTY0LmNvbnN1bWVDb21tYSgpO1xuICAgICAgcHJvcGVydGllc18xNjMgPSBwcm9wZXJ0aWVzXzE2My5jb25jYXQocHJvcCk7XG4gICAgICBpZiAobGFzdFByb3BfMTY1ID09PSBwcm9wKSB7XG4gICAgICAgIHRocm93IGVuZl8xNjQuY3JlYXRlRXJyb3IocHJvcCwgXCJpbnZhbGlkIHN5bnRheCBpbiBvYmplY3RcIik7XG4gICAgICB9XG4gICAgICBsYXN0UHJvcF8xNjUgPSBwcm9wO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXzE2M30pO1xuICB9XG4gIGVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCkge1xuICAgIGxldCB7bWV0aG9kT3JLZXksIGtpbmR9ID0gdGhpcy5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgXCJtZXRob2RcIjpcbiAgICAgICAgcmV0dXJuIG1ldGhvZE9yS2V5O1xuICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtpbml0OiBpbml0LCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcobWV0aG9kT3JLZXkpfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIjpcIikpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJTaG9ydGhhbmRQcm9wZXJ0eVwiLCB7bmFtZTogbWV0aG9kT3JLZXkudmFsdWV9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IGV4cHJfMTY2ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleSwgZXhwcmVzc2lvbjogZXhwcl8xNjZ9KTtcbiAgfVxuICBlbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNjcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTY4ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNjcsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTY4ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NywgXCJnZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIkdldHRlclwiLCB7bmFtZTogbmFtZSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNjcsIFwic2V0XCIpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hQYXJlbnMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IHBhcmFtID0gZW5mLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiU2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBwYXJhbTogcGFyYW0sIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfVxuICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnModGhpcy5wZWVrKCkpKSB7XG4gICAgICBsZXQgcGFyYW1zID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtcywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGZvcm1hbFBhcmFtcyA9IGVuZi5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiTWV0aG9kXCIsIHtpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTY4LCBuYW1lOiBuYW1lLCBwYXJhbXM6IGZvcm1hbFBhcmFtcywgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgcmV0dXJuIHttZXRob2RPcktleTogbmFtZSwga2luZDogdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE2NykgPyBcImlkZW50aWZpZXJcIiA6IFwicHJvcGVydHlcIn07XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNjkgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzE2OSkgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xNjkpKSB7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KSwgYmluZGluZzogbnVsbH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzE2OSkpIHtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZXhwciA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiwge2V4cHJlc3Npb246IGV4cHJ9KSwgYmluZGluZzogbnVsbH07XG4gICAgfVxuICAgIGxldCBuYW1lXzE3MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiBuYW1lXzE3MH0pLCBiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzE3MH0pfTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHIsIGluRGVmYXVsdCwgYWxsb3dHZW5lcmF0b3J9KSB7XG4gICAgbGV0IG5hbWVfMTcxID0gbnVsbCwgcGFyYW1zXzE3MiwgYm9keV8xNzMsIHJlc3RfMTc0O1xuICAgIGxldCBpc0dlbmVyYXRvcl8xNzUgPSBmYWxzZTtcbiAgICBsZXQgZm5LZXl3b3JkXzE3NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTc3ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHR5cGVfMTc4ID0gaXNFeHByID8gXCJGdW5jdGlvbkV4cHJlc3Npb25cIiA6IFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTc3LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE3NSA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZF8xNzcgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNzcpKSB7XG4gICAgICBuYW1lXzE3MSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICBuYW1lXzE3MSA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIipkZWZhdWx0KlwiLCBmbktleXdvcmRfMTc2KX0pO1xuICAgIH1cbiAgICBwYXJhbXNfMTcyID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTczID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE3OSA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xNzIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE4MCA9IGVuZl8xNzkuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTc4LCB7bmFtZTogbmFtZV8xNzEsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xNzUsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE4MCwgYm9keTogYm9keV8xNzN9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbmFtZV8xODEgPSBudWxsLCBwYXJhbXNfMTgyLCBib2R5XzE4MywgcmVzdF8xODQ7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE4NSA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTg2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xODYsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTg1ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE4NiA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE4NikpIHtcbiAgICAgIG5hbWVfMTgxID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHBhcmFtc18xODIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xODMgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTg3ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE4MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTg4ID0gZW5mXzE4Ny5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMTgxLCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTg1LCBwYXJhbXM6IGZvcm1hbFBhcmFtc18xODgsIGJvZHk6IGJvZHlfMTgzfSk7XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCkge1xuICAgIGxldCBuYW1lXzE4OSwgcGFyYW1zXzE5MCwgYm9keV8xOTEsIHJlc3RfMTkyO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xOTMgPSBmYWxzZTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzE5NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTk0LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE5MyA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgbmFtZV8xODkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICBwYXJhbXNfMTkwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTkxID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE5NSA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xOTAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE5NiA9IGVuZl8xOTUuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiLCB7bmFtZTogbmFtZV8xODksIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xOTMsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE5NiwgYm9keTogYm9keV8xOTF9KTtcbiAgfVxuICBlbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKSB7XG4gICAgbGV0IGl0ZW1zXzE5NyA9IFtdO1xuICAgIGxldCByZXN0XzE5OCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIi4uLlwiKTtcbiAgICAgICAgcmVzdF8xOTggPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpdGVtc18xOTcucHVzaCh0aGlzLmVuZm9yZXN0UGFyYW0oKSk7XG4gICAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogTGlzdChpdGVtc18xOTcpLCByZXN0OiByZXN0XzE5OH0pO1xuICB9XG4gIGVuZm9yZXN0UGFyYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICB9XG4gIGVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMTk5ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogZmFsc2UsIG9wZXJhdG9yOiBvcGVyYXRvcl8xOTkudmFsKCksIG9wZXJhbmQ6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0aGlzLnRlcm0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9wZXJhdG9yXzIwMCA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICB0aGlzLm9wQ3R4LnByZWMgPSAxNDtcbiAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjAxID0+IHtcbiAgICAgIGxldCB0eXBlXzIwMiwgdGVybV8yMDMsIGlzUHJlZml4XzIwNDtcbiAgICAgIGlmIChvcGVyYXRvcl8yMDAudmFsKCkgPT09IFwiKytcIiB8fCBvcGVyYXRvcl8yMDAudmFsKCkgPT09IFwiLS1cIikge1xuICAgICAgICB0eXBlXzIwMiA9IFwiVXBkYXRlRXhwcmVzc2lvblwiO1xuICAgICAgICB0ZXJtXzIwMyA9IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhyaWdodFRlcm1fMjAxKTtcbiAgICAgICAgaXNQcmVmaXhfMjA0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGVfMjAyID0gXCJVbmFyeUV4cHJlc3Npb25cIjtcbiAgICAgICAgaXNQcmVmaXhfMjA0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0ZXJtXzIwMyA9IHJpZ2h0VGVybV8yMDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8yMDIsIHtvcGVyYXRvcjogb3BlcmF0b3JfMjAwLnZhbCgpLCBvcGVyYW5kOiB0ZXJtXzIwMywgaXNQcmVmaXg6IGlzUHJlZml4XzIwNH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl8yNjtcbiAgfVxuICBlbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgdGVzdF8yMDUgPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICBpZiAodGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI/XCIpO1xuICAgIGxldCBlbmZfMjA2ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGNvbnNlcXVlbnRfMjA3ID0gZW5mXzIwNi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgZW5mXzIwNi5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGVuZl8yMDYgPSBuZXcgRW5mb3Jlc3RlcihlbmZfMjA2LnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYWx0ZXJuYXRlXzIwOCA9IGVuZl8yMDYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIHRoaXMucmVzdCA9IGVuZl8yMDYucmVzdDtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRlc3RfMjA1LCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzIwNywgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfMjA4fSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0VGVybV8yMDkgPSB0aGlzLnRlcm07XG4gICAgbGV0IG9wU3R4XzIxMCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBvcF8yMTEgPSBvcFN0eF8yMTAudmFsKCk7XG4gICAgbGV0IG9wUHJlY18yMTIgPSBnZXRPcGVyYXRvclByZWMob3BfMjExKTtcbiAgICBsZXQgb3BBc3NvY18yMTMgPSBnZXRPcGVyYXRvckFzc29jKG9wXzIxMSk7XG4gICAgaWYgKG9wZXJhdG9yTHQodGhpcy5vcEN0eC5wcmVjLCBvcFByZWNfMjEyLCBvcEFzc29jXzIxMykpIHtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe3ByZWM6IHRoaXMub3BDdHgucHJlYywgY29tYmluZTogdGhpcy5vcEN0eC5jb21iaW5lfSk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBvcFByZWNfMjEyO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gcmlnaHRUZXJtXzIxNCA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRUZXJtXzIwOSwgb3BlcmF0b3I6IG9wU3R4XzIxMCwgcmlnaHQ6IHJpZ2h0VGVybV8yMTR9KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBFWFBSX0xPT1BfT1BFUkFUT1JfMjY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB0ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKGxlZnRUZXJtXzIwOSk7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgcmV0dXJuIHRlcm07XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzIxNSA9IHRoaXMubWF0Y2hUZW1wbGF0ZSgpO1xuICAgIGxldCBlbGVtZW50c18yMTYgPSBsb29rYWhlYWRfMjE1LnRva2VuLml0ZW1zLm1hcChpdF8yMTcgPT4ge1xuICAgICAgaWYgKGl0XzIxNyBpbnN0YW5jZW9mIFN5bnRheCAmJiBpdF8yMTcuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoaXRfMjE3LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBpdF8yMTcuc2xpY2UudGV4dH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBlbGVtZW50c18yMTY7XG4gIH1cbiAgZXhwYW5kTWFjcm8oZW5mb3Jlc3RUeXBlXzIxOCkge1xuICAgIGxldCBuYW1lXzIxOSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBzeW50YXhUcmFuc2Zvcm1fMjIwID0gdGhpcy5nZXRDb21waWxldGltZVRyYW5zZm9ybShuYW1lXzIxOSk7XG4gICAgaWYgKHN5bnRheFRyYW5zZm9ybV8yMjAgPT0gbnVsbCB8fCB0eXBlb2Ygc3ludGF4VHJhbnNmb3JtXzIyMC52YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWVfMjE5LCBcInRoZSBtYWNybyBuYW1lIHdhcyBub3QgYm91bmQgdG8gYSB2YWx1ZSB0aGF0IGNvdWxkIGJlIGludm9rZWRcIik7XG4gICAgfVxuICAgIGxldCB1c2VTaXRlU2NvcGVfMjIxID0gZnJlc2hTY29wZShcInVcIik7XG4gICAgbGV0IGludHJvZHVjZWRTY29wZV8yMjIgPSBmcmVzaFNjb3BlKFwiaVwiKTtcbiAgICB0aGlzLmNvbnRleHQudXNlU2NvcGUgPSB1c2VTaXRlU2NvcGVfMjIxO1xuICAgIGxldCBjdHhfMjIzID0gbmV3IE1hY3JvQ29udGV4dCh0aGlzLCBuYW1lXzIxOSwgdGhpcy5jb250ZXh0LCB1c2VTaXRlU2NvcGVfMjIxLCBpbnRyb2R1Y2VkU2NvcGVfMjIyKTtcbiAgICBsZXQgcmVzdWx0XzIyNCA9IHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoc3ludGF4VHJhbnNmb3JtXzIyMC52YWx1ZS5jYWxsKG51bGwsIGN0eF8yMjMpKTtcbiAgICBpZiAoIUxpc3QuaXNMaXN0KHJlc3VsdF8yMjQpKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWVfMjE5LCBcIm1hY3JvIG11c3QgcmV0dXJuIGEgbGlzdCBidXQgZ290OiBcIiArIHJlc3VsdF8yMjQpO1xuICAgIH1cbiAgICByZXN1bHRfMjI0ID0gcmVzdWx0XzIyNC5tYXAoc3R4XzIyNSA9PiB7XG4gICAgICBpZiAoIShzdHhfMjI1ICYmIHR5cGVvZiBzdHhfMjI1LmFkZFNjb3BlID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTksIFwibWFjcm8gbXVzdCByZXR1cm4gc3ludGF4IG9iamVjdHMgb3IgdGVybXMgYnV0IGdvdDogXCIgKyBzdHhfMjI1KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHhfMjI1LmFkZFNjb3BlKGludHJvZHVjZWRTY29wZV8yMjIsIHRoaXMuY29udGV4dC5iaW5kaW5ncywge2ZsaXA6IHRydWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0XzIyNDtcbiAgfVxuICBjb25zdW1lU2VtaWNvbG9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjI2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMjYgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIyNiwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgY29uc3VtZUNvbW1hKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjI3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMjcgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIyNywgXCIsXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgaXNUZXJtKHRlcm1fMjI4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjI4ICYmIHRlcm1fMjI4IGluc3RhbmNlb2YgVGVybTtcbiAgfVxuICBpc0VPRih0ZXJtXzIyOSkge1xuICAgIHJldHVybiB0ZXJtXzIyOSAmJiB0ZXJtXzIyOSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyOS5pc0VPRigpO1xuICB9XG4gIGlzSWRlbnRpZmllcih0ZXJtXzIzMCwgdmFsXzIzMSA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yMzAgJiYgdGVybV8yMzAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzAuaXNJZGVudGlmaWVyKCkgJiYgKHZhbF8yMzEgPT09IG51bGwgfHwgdGVybV8yMzAudmFsKCkgPT09IHZhbF8yMzEpO1xuICB9XG4gIGlzUHJvcGVydHlOYW1lKHRlcm1fMjMyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGlmaWVyKHRlcm1fMjMyKSB8fCB0aGlzLmlzS2V5d29yZCh0ZXJtXzIzMikgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKHRlcm1fMjMyKSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzIzMikgfHwgdGhpcy5pc0JyYWNrZXRzKHRlcm1fMjMyKTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHRlcm1fMjMzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjMzICYmIHRlcm1fMjMzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjMzLmlzTnVtZXJpY0xpdGVyYWwoKTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodGVybV8yMzQpIHtcbiAgICByZXR1cm4gdGVybV8yMzQgJiYgdGVybV8yMzQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzQuaXNTdHJpbmdMaXRlcmFsKCk7XG4gIH1cbiAgaXNUZW1wbGF0ZSh0ZXJtXzIzNSkge1xuICAgIHJldHVybiB0ZXJtXzIzNSAmJiB0ZXJtXzIzNSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNS5pc1RlbXBsYXRlKCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh0ZXJtXzIzNikge1xuICAgIHJldHVybiB0ZXJtXzIzNiAmJiB0ZXJtXzIzNiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNi5pc0Jvb2xlYW5MaXRlcmFsKCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh0ZXJtXzIzNykge1xuICAgIHJldHVybiB0ZXJtXzIzNyAmJiB0ZXJtXzIzNyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNy5pc051bGxMaXRlcmFsKCk7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih0ZXJtXzIzOCkge1xuICAgIHJldHVybiB0ZXJtXzIzOCAmJiB0ZXJtXzIzOCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzOC5pc1JlZ3VsYXJFeHByZXNzaW9uKCk7XG4gIH1cbiAgaXNQYXJlbnModGVybV8yMzkpIHtcbiAgICByZXR1cm4gdGVybV8yMzkgJiYgdGVybV8yMzkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzkuaXNQYXJlbnMoKTtcbiAgfVxuICBpc0JyYWNlcyh0ZXJtXzI0MCkge1xuICAgIHJldHVybiB0ZXJtXzI0MCAmJiB0ZXJtXzI0MCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0MC5pc0JyYWNlcygpO1xuICB9XG4gIGlzQnJhY2tldHModGVybV8yNDEpIHtcbiAgICByZXR1cm4gdGVybV8yNDEgJiYgdGVybV8yNDEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDEuaXNCcmFja2V0cygpO1xuICB9XG4gIGlzQXNzaWduKHRlcm1fMjQyKSB7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRlcm1fMjQyKSkge1xuICAgICAgc3dpdGNoICh0ZXJtXzI0Mi52YWwoKSkge1xuICAgICAgICBjYXNlIFwiPVwiOlxuICAgICAgICBjYXNlIFwifD1cIjpcbiAgICAgICAgY2FzZSBcIl49XCI6XG4gICAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgICBjYXNlIFwiPDw9XCI6XG4gICAgICAgIGNhc2UgXCI+Pj1cIjpcbiAgICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgICAgY2FzZSBcIis9XCI6XG4gICAgICAgIGNhc2UgXCItPVwiOlxuICAgICAgICBjYXNlIFwiKj1cIjpcbiAgICAgICAgY2FzZSBcIi89XCI6XG4gICAgICAgIGNhc2UgXCIlPVwiOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlzS2V5d29yZCh0ZXJtXzI0MywgdmFsXzI0NCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yNDMgJiYgdGVybV8yNDMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDMuaXNLZXl3b3JkKCkgJiYgKHZhbF8yNDQgPT09IG51bGwgfHwgdGVybV8yNDMudmFsKCkgPT09IHZhbF8yNDQpO1xuICB9XG4gIGlzUHVuY3R1YXRvcih0ZXJtXzI0NSwgdmFsXzI0NiA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yNDUgJiYgdGVybV8yNDUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDUuaXNQdW5jdHVhdG9yKCkgJiYgKHZhbF8yNDYgPT09IG51bGwgfHwgdGVybV8yNDUudmFsKCkgPT09IHZhbF8yNDYpO1xuICB9XG4gIGlzT3BlcmF0b3IodGVybV8yNDcpIHtcbiAgICByZXR1cm4gdGVybV8yNDcgJiYgdGVybV8yNDcgaW5zdGFuY2VvZiBTeW50YXggJiYgaXNPcGVyYXRvcih0ZXJtXzI0Nyk7XG4gIH1cbiAgaXNVcGRhdGVPcGVyYXRvcih0ZXJtXzI0OCkge1xuICAgIHJldHVybiB0ZXJtXzI0OCAmJiB0ZXJtXzI0OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0OC5pc1B1bmN0dWF0b3IoKSAmJiAodGVybV8yNDgudmFsKCkgPT09IFwiKytcIiB8fCB0ZXJtXzI0OC52YWwoKSA9PT0gXCItLVwiKTtcbiAgfVxuICBpc0ZuRGVjbFRyYW5zZm9ybSh0ZXJtXzI0OSkge1xuICAgIHJldHVybiB0ZXJtXzI0OSAmJiB0ZXJtXzI0OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI0OS5yZXNvbHZlKCkpID09PSBGdW5jdGlvbkRlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNWYXJEZWNsVHJhbnNmb3JtKHRlcm1fMjUwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUwICYmIHRlcm1fMjUwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUwLnJlc29sdmUoKSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0xldERlY2xUcmFuc2Zvcm0odGVybV8yNTEpIHtcbiAgICByZXR1cm4gdGVybV8yNTEgJiYgdGVybV8yNTEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTEucmVzb2x2ZSgpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0NvbnN0RGVjbFRyYW5zZm9ybSh0ZXJtXzI1Mikge1xuICAgIHJldHVybiB0ZXJtXzI1MiAmJiB0ZXJtXzI1MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1Mi5yZXNvbHZlKCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhEZWNsVHJhbnNmb3JtKHRlcm1fMjUzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUzICYmIHRlcm1fMjUzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUzLnJlc29sdmUoKSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKHRlcm1fMjU0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU0ICYmIHRlcm1fMjU0IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU0LnJlc29sdmUoKSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSh0ZXJtXzI1NSkge1xuICAgIHJldHVybiB0ZXJtXzI1NSAmJiB0ZXJtXzI1NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1NS5pc1N5bnRheFRlbXBsYXRlKCk7XG4gIH1cbiAgaXNTeW50YXhRdW90ZVRyYW5zZm9ybSh0ZXJtXzI1Nikge1xuICAgIHJldHVybiB0ZXJtXzI1NiAmJiB0ZXJtXzI1NiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1Ni5yZXNvbHZlKCkpID09PSBTeW50YXhRdW90ZVRyYW5zZm9ybTtcbiAgfVxuICBpc1JldHVyblN0bXRUcmFuc2Zvcm0odGVybV8yNTcpIHtcbiAgICByZXR1cm4gdGVybV8yNTcgJiYgdGVybV8yNTcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTcucmVzb2x2ZSgpKSA9PT0gUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtO1xuICB9XG4gIGlzV2hpbGVUcmFuc2Zvcm0odGVybV8yNTgpIHtcbiAgICByZXR1cm4gdGVybV8yNTggJiYgdGVybV8yNTggaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTgucmVzb2x2ZSgpKSA9PT0gV2hpbGVUcmFuc2Zvcm07XG4gIH1cbiAgaXNGb3JUcmFuc2Zvcm0odGVybV8yNTkpIHtcbiAgICByZXR1cm4gdGVybV8yNTkgJiYgdGVybV8yNTkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTkucmVzb2x2ZSgpKSA9PT0gRm9yVHJhbnNmb3JtO1xuICB9XG4gIGlzU3dpdGNoVHJhbnNmb3JtKHRlcm1fMjYwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYwICYmIHRlcm1fMjYwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYwLnJlc29sdmUoKSkgPT09IFN3aXRjaFRyYW5zZm9ybTtcbiAgfVxuICBpc0JyZWFrVHJhbnNmb3JtKHRlcm1fMjYxKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYxICYmIHRlcm1fMjYxIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYxLnJlc29sdmUoKSkgPT09IEJyZWFrVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29udGludWVUcmFuc2Zvcm0odGVybV8yNjIpIHtcbiAgICByZXR1cm4gdGVybV8yNjIgJiYgdGVybV8yNjIgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjIucmVzb2x2ZSgpKSA9PT0gQ29udGludWVUcmFuc2Zvcm07XG4gIH1cbiAgaXNEb1RyYW5zZm9ybSh0ZXJtXzI2Mykge1xuICAgIHJldHVybiB0ZXJtXzI2MyAmJiB0ZXJtXzI2MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2My5yZXNvbHZlKCkpID09PSBEb1RyYW5zZm9ybTtcbiAgfVxuICBpc0RlYnVnZ2VyVHJhbnNmb3JtKHRlcm1fMjY0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY0ICYmIHRlcm1fMjY0IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY0LnJlc29sdmUoKSkgPT09IERlYnVnZ2VyVHJhbnNmb3JtO1xuICB9XG4gIGlzV2l0aFRyYW5zZm9ybSh0ZXJtXzI2NSkge1xuICAgIHJldHVybiB0ZXJtXzI2NSAmJiB0ZXJtXzI2NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2NS5yZXNvbHZlKCkpID09PSBXaXRoVHJhbnNmb3JtO1xuICB9XG4gIGlzVHJ5VHJhbnNmb3JtKHRlcm1fMjY2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY2ICYmIHRlcm1fMjY2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY2LnJlc29sdmUoKSkgPT09IFRyeVRyYW5zZm9ybTtcbiAgfVxuICBpc1Rocm93VHJhbnNmb3JtKHRlcm1fMjY3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY3ICYmIHRlcm1fMjY3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY3LnJlc29sdmUoKSkgPT09IFRocm93VHJhbnNmb3JtO1xuICB9XG4gIGlzSWZUcmFuc2Zvcm0odGVybV8yNjgpIHtcbiAgICByZXR1cm4gdGVybV8yNjggJiYgdGVybV8yNjggaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjgucmVzb2x2ZSgpKSA9PT0gSWZUcmFuc2Zvcm07XG4gIH1cbiAgaXNOZXdUcmFuc2Zvcm0odGVybV8yNjkpIHtcbiAgICByZXR1cm4gdGVybV8yNjkgJiYgdGVybV8yNjkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjkucmVzb2x2ZSgpKSA9PT0gTmV3VHJhbnNmb3JtO1xuICB9XG4gIGlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNzApIHtcbiAgICByZXR1cm4gdGVybV8yNzAgJiYgdGVybV8yNzAgaW5zdGFuY2VvZiBTeW50YXggJiYgKHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjcwLnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSB8fCB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjcwLnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSk7XG4gIH1cbiAgZ2V0Q29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNzEpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LmVudi5oYXModGVybV8yNzEucmVzb2x2ZSgpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjcxLnJlc29sdmUoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjcxLnJlc29sdmUoKSk7XG4gIH1cbiAgbGluZU51bWJlckVxKGFfMjcyLCBiXzI3Mykge1xuICAgIGlmICghKGFfMjcyICYmIGJfMjczKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhc3NlcnQoYV8yNzIgaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICBhc3NlcnQoYl8yNzMgaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICByZXR1cm4gYV8yNzIubGluZU51bWJlcigpID09PSBiXzI3My5saW5lTnVtYmVyKCk7XG4gIH1cbiAgbWF0Y2hJZGVudGlmaWVyKHZhbF8yNzQpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMjc1KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzU7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3NSwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBtYXRjaEtleXdvcmQodmFsXzI3Nikge1xuICAgIGxldCBsb29rYWhlYWRfMjc3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8yNzcsIHZhbF8yNzYpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc3LCBcImV4cGVjdGluZyBcIiArIHZhbF8yNzYpO1xuICB9XG4gIG1hdGNoTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzI3OCkgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzI3OCkgfHwgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8yNzgpIHx8IHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzI3OCkgfHwgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8yNzgpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3ODtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc4LCBcImV4cGVjdGluZyBhIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hTdHJpbmdMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yNzkpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3OTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc5LCBcImV4cGVjdGluZyBhIHN0cmluZyBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoVGVtcGxhdGUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yODApKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgwLCBcImV4cGVjdGluZyBhIHRlbXBsYXRlIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hQYXJlbnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODEgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjgxKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODEuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgxLCBcImV4cGVjdGluZyBwYXJlbnNcIik7XG4gIH1cbiAgbWF0Y2hDdXJsaWVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjgyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzI4MikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgyLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4MiwgXCJleHBlY3RpbmcgY3VybHkgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoU3F1YXJlcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzI4MykpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgzLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4MywgXCJleHBlY3Rpbmcgc3FhdXJlIGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFVuYXJ5T3BlcmF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNVbmFyeU9wZXJhdG9yKGxvb2thaGVhZF8yODQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4NDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjg0LCBcImV4cGVjdGluZyBhIHVuYXJ5IG9wZXJhdG9yXCIpO1xuICB9XG4gIG1hdGNoUHVuY3R1YXRvcih2YWxfMjg1KSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODYgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzI4NikpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsXzI4NSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAobG9va2FoZWFkXzI4Ni52YWwoKSA9PT0gdmFsXzI4NSkge1xuICAgICAgICAgIHJldHVybiBsb29rYWhlYWRfMjg2O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4NiwgXCJleHBlY3RpbmcgYSBcIiArIHZhbF8yODUgKyBcIiBwdW5jdHVhdG9yXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4NjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjg2LCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgY3JlYXRlRXJyb3Ioc3R4XzI4NywgbWVzc2FnZV8yODgpIHtcbiAgICBsZXQgY3R4XzI4OSA9IFwiXCI7XG4gICAgbGV0IG9mZmVuZGluZ18yOTAgPSBzdHhfMjg3O1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGN0eF8yODkgPSB0aGlzLnJlc3Quc2xpY2UoMCwgMjApLm1hcCh0ZXJtXzI5MSA9PiB7XG4gICAgICAgIGlmICh0ZXJtXzI5MS5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIHRlcm1fMjkxLmlubmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExpc3Qub2YodGVybV8yOTEpO1xuICAgICAgfSkuZmxhdHRlbigpLm1hcChzXzI5MiA9PiB7XG4gICAgICAgIGlmIChzXzI5MiA9PT0gb2ZmZW5kaW5nXzI5MCkge1xuICAgICAgICAgIHJldHVybiBcIl9fXCIgKyBzXzI5Mi52YWwoKSArIFwiX19cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc18yOTIudmFsKCk7XG4gICAgICB9KS5qb2luKFwiIFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4XzI4OSA9IG9mZmVuZGluZ18yOTAudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlXzI4OCArIFwiXFxuXCIgKyBjdHhfMjg5KTtcbiAgfVxufVxuIl19