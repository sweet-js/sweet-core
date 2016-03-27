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

var EXPR_LOOP_OPERATOR_23 = {};
var EXPR_LOOP_NO_CHANGE_24 = {};
var EXPR_LOOP_EXPANSION_25 = {};

var Enforester = exports.Enforester = function () {
  function Enforester(stxl_26, prev_27, context_28) {
    _classCallCheck(this, Enforester);

    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl_26), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev_27), "expecting a list of terms to enforest");
    (0, _errors.assert)(context_28, "expecting a context to enforest");
    this.term = null;
    this.rest = stxl_26;
    this.prev = prev_27;
    this.context = context_28;
  }

  _createClass(Enforester, [{
    key: "peek",
    value: function peek() {
      var n_29 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return this.rest.get(n_29);
    }
  }, {
    key: "advance",
    value: function advance() {
      var ret_30 = this.rest.first();
      this.rest = this.rest.rest();
      return ret_30;
    }
  }, {
    key: "enforest",
    value: function enforest() {
      var type_31 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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
      var result_32 = void 0;
      if (type_31 === "expression") {
        result_32 = this.enforestExpressionLoop();
      } else {
        result_32 = this.enforestModule();
      }
      if (this.rest.size === 0) {
        this.done = true;
      }
      return result_32;
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
      var lookahead_33 = this.peek();
      if (this.isKeyword(lookahead_33, "import")) {
        this.advance();
        return this.enforestImportDeclaration();
      } else if (this.isKeyword(lookahead_33, "export")) {
        this.advance();
        return this.enforestExportDeclaration();
      }
      return this.enforestStatement();
    }
  }, {
    key: "enforestExportDeclaration",
    value: function enforestExportDeclaration() {
      var lookahead_34 = this.peek();
      if (this.isPunctuator(lookahead_34, "*")) {
        this.advance();
        var moduleSpecifier = this.enforestFromClause();
        return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
      } else if (this.isBraces(lookahead_34)) {
        var namedExports = this.enforestExportClause();
        var _moduleSpecifier = null;
        if (this.isIdentifier(this.peek(), "from")) {
          _moduleSpecifier = this.enforestFromClause();
        }
        return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: _moduleSpecifier });
      } else if (this.isKeyword(lookahead_34, "class")) {
        return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
      } else if (this.isFnDeclTransform(lookahead_34)) {
        return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
      } else if (this.isKeyword(lookahead_34, "default")) {
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
      } else if (this.isVarDeclTransform(lookahead_34) || this.isLetDeclTransform(lookahead_34) || this.isConstDeclTransform(lookahead_34) || this.isSyntaxrecDeclTransform(lookahead_34) || this.isSyntaxDeclTransform(lookahead_34)) {
        return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
      }
      throw this.createError(lookahead_34, "unexpected syntax");
    }
  }, {
    key: "enforestExportClause",
    value: function enforestExportClause() {
      var enf_35 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var result_36 = [];
      while (enf_35.rest.size !== 0) {
        result_36.push(enf_35.enforestExportSpecifier());
        enf_35.consumeComma();
      }
      return (0, _immutable.List)(result_36);
    }
  }, {
    key: "enforestExportSpecifier",
    value: function enforestExportSpecifier() {
      var name_37 = this.enforestIdentifier();
      if (this.isIdentifier(this.peek(), "as")) {
        this.advance();
        var exportedName = this.enforestIdentifier();
        return new _terms2.default("ExportSpecifier", { name: name_37, exportedName: exportedName });
      }
      return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_37 });
    }
  }, {
    key: "enforestImportDeclaration",
    value: function enforestImportDeclaration() {
      var lookahead_38 = this.peek();
      var defaultBinding_39 = null;
      var namedImports_40 = (0, _immutable.List)();
      var forSyntax_41 = false;
      if (this.isStringLiteral(lookahead_38)) {
        var moduleSpecifier = this.advance();
        this.consumeSemicolon();
        return new _terms2.default("Import", { defaultBinding: defaultBinding_39, namedImports: namedImports_40, moduleSpecifier: moduleSpecifier });
      }
      if (this.isIdentifier(lookahead_38) || this.isKeyword(lookahead_38)) {
        defaultBinding_39 = this.enforestBindingIdentifier();
        if (!this.isPunctuator(this.peek(), ",")) {
          var _moduleSpecifier2 = this.enforestFromClause();
          if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
            this.advance();
            this.advance();
            forSyntax_41 = true;
          }
          return new _terms2.default("Import", { defaultBinding: defaultBinding_39, moduleSpecifier: _moduleSpecifier2, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_41 });
        }
      }
      this.consumeComma();
      lookahead_38 = this.peek();
      if (this.isBraces(lookahead_38)) {
        var imports = this.enforestNamedImports();
        var fromClause = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_41 = true;
        }
        return new _terms2.default("Import", { defaultBinding: defaultBinding_39, forSyntax: forSyntax_41, namedImports: imports, moduleSpecifier: fromClause });
      } else if (this.isPunctuator(lookahead_38, "*")) {
        var namespaceBinding = this.enforestNamespaceBinding();
        var _moduleSpecifier3 = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_41 = true;
        }
        return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_39, forSyntax: forSyntax_41, namespaceBinding: namespaceBinding, moduleSpecifier: _moduleSpecifier3 });
      }
      throw this.createError(lookahead_38, "unexpected syntax");
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
      var enf_42 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var result_43 = [];
      while (enf_42.rest.size !== 0) {
        result_43.push(enf_42.enforestImportSpecifiers());
        enf_42.consumeComma();
      }
      return (0, _immutable.List)(result_43);
    }
  }, {
    key: "enforestImportSpecifiers",
    value: function enforestImportSpecifiers() {
      var lookahead_44 = this.peek();
      var name_45 = void 0;
      if (this.isIdentifier(lookahead_44) || this.isKeyword(lookahead_44)) {
        name_45 = this.advance();
        if (!this.isIdentifier(this.peek(), "as")) {
          return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_45 }) });
        } else {
          this.matchIdentifier("as");
        }
      } else {
        throw this.createError(lookahead_44, "unexpected token in import specifier");
      }
      return new _terms2.default("ImportSpecifier", { name: name_45, binding: this.enforestBindingIdentifier() });
    }
  }, {
    key: "enforestFromClause",
    value: function enforestFromClause() {
      this.matchIdentifier("from");
      var lookahead_46 = this.matchStringLiteral();
      this.consumeSemicolon();
      return lookahead_46;
    }
  }, {
    key: "enforestStatementListItem",
    value: function enforestStatementListItem() {
      var lookahead_47 = this.peek();
      if (this.isFnDeclTransform(lookahead_47)) {
        return this.enforestFunctionDeclaration({ isExpr: false });
      } else if (this.isKeyword(lookahead_47, "class")) {
        return this.enforestClass({ isExpr: false });
      } else {
        return this.enforestStatement();
      }
    }
  }, {
    key: "enforestStatement",
    value: function enforestStatement() {
      var lookahead_48 = this.peek();
      if (this.term === null && this.isCompiletimeTransform(lookahead_48)) {
        this.rest = this.expandMacro().concat(this.rest);
        lookahead_48 = this.peek();
      }
      if (this.term === null && this.isBraces(lookahead_48)) {
        return this.enforestBlockStatement();
      }
      if (this.term === null && this.isWhileTransform(lookahead_48)) {
        return this.enforestWhileStatement();
      }
      if (this.term === null && this.isIfTransform(lookahead_48)) {
        return this.enforestIfStatement();
      }
      if (this.term === null && this.isForTransform(lookahead_48)) {
        return this.enforestForStatement();
      }
      if (this.term === null && this.isSwitchTransform(lookahead_48)) {
        return this.enforestSwitchStatement();
      }
      if (this.term === null && this.isBreakTransform(lookahead_48)) {
        return this.enforestBreakStatement();
      }
      if (this.term === null && this.isContinueTransform(lookahead_48)) {
        return this.enforestContinueStatement();
      }
      if (this.term === null && this.isDoTransform(lookahead_48)) {
        return this.enforestDoStatement();
      }
      if (this.term === null && this.isDebuggerTransform(lookahead_48)) {
        return this.enforestDebuggerStatement();
      }
      if (this.term === null && this.isWithTransform(lookahead_48)) {
        return this.enforestWithStatement();
      }
      if (this.term === null && this.isTryTransform(lookahead_48)) {
        return this.enforestTryStatement();
      }
      if (this.term === null && this.isThrowTransform(lookahead_48)) {
        return this.enforestThrowStatement();
      }
      if (this.term === null && this.isKeyword(lookahead_48, "class")) {
        return this.enforestClass({ isExpr: false });
      }
      if (this.term === null && this.isFnDeclTransform(lookahead_48)) {
        return this.enforestFunctionDeclaration();
      }
      if (this.term === null && this.isIdentifier(lookahead_48) && this.isPunctuator(this.peek(1), ":")) {
        return this.enforestLabeledStatement();
      }
      if (this.term === null && (this.isVarDeclTransform(lookahead_48) || this.isLetDeclTransform(lookahead_48) || this.isConstDeclTransform(lookahead_48) || this.isSyntaxrecDeclTransform(lookahead_48) || this.isSyntaxDeclTransform(lookahead_48))) {
        var stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });
        this.consumeSemicolon();
        return stmt;
      }
      if (this.term === null && this.isReturnStmtTransform(lookahead_48)) {
        return this.enforestReturnStatement();
      }
      if (this.term === null && this.isPunctuator(lookahead_48, ";")) {
        this.advance();
        return new _terms2.default("EmptyStatement", {});
      }
      return this.enforestExpressionStatement();
    }
  }, {
    key: "enforestLabeledStatement",
    value: function enforestLabeledStatement() {
      var label_49 = this.matchIdentifier();
      var punc_50 = this.matchPunctuator(":");
      var stmt_51 = this.enforestStatement();
      return new _terms2.default("LabeledStatement", { label: label_49, body: stmt_51 });
    }
  }, {
    key: "enforestBreakStatement",
    value: function enforestBreakStatement() {
      this.matchKeyword("break");
      var lookahead_52 = this.peek();
      var label_53 = null;
      if (this.rest.size === 0 || this.isPunctuator(lookahead_52, ";")) {
        this.consumeSemicolon();
        return new _terms2.default("BreakStatement", { label: label_53 });
      }
      if (this.isIdentifier(lookahead_52) || this.isKeyword(lookahead_52, "yield") || this.isKeyword(lookahead_52, "let")) {
        label_53 = this.enforestIdentifier();
      }
      this.consumeSemicolon();
      return new _terms2.default("BreakStatement", { label: label_53 });
    }
  }, {
    key: "enforestTryStatement",
    value: function enforestTryStatement() {
      this.matchKeyword("try");
      var body_54 = this.enforestBlock();
      if (this.isKeyword(this.peek(), "catch")) {
        var catchClause = this.enforestCatchClause();
        if (this.isKeyword(this.peek(), "finally")) {
          this.advance();
          var finalizer = this.enforestBlock();
          return new _terms2.default("TryFinallyStatement", { body: body_54, catchClause: catchClause, finalizer: finalizer });
        }
        return new _terms2.default("TryCatchStatement", { body: body_54, catchClause: catchClause });
      }
      if (this.isKeyword(this.peek(), "finally")) {
        this.advance();
        var _finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_54, catchClause: null, finalizer: _finalizer });
      }
      throw this.createError(this.peek(), "try with no catch or finally");
    }
  }, {
    key: "enforestCatchClause",
    value: function enforestCatchClause() {
      this.matchKeyword("catch");
      var bindingParens_55 = this.matchParens();
      var enf_56 = new Enforester(bindingParens_55, (0, _immutable.List)(), this.context);
      var binding_57 = enf_56.enforestBindingTarget();
      var body_58 = this.enforestBlock();
      return new _terms2.default("CatchClause", { binding: binding_57, body: body_58 });
    }
  }, {
    key: "enforestThrowStatement",
    value: function enforestThrowStatement() {
      this.matchKeyword("throw");
      var expression_59 = this.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default("ThrowStatement", { expression: expression_59 });
    }
  }, {
    key: "enforestWithStatement",
    value: function enforestWithStatement() {
      this.matchKeyword("with");
      var objParens_60 = this.matchParens();
      var enf_61 = new Enforester(objParens_60, (0, _immutable.List)(), this.context);
      var object_62 = enf_61.enforestExpression();
      var body_63 = this.enforestStatement();
      return new _terms2.default("WithStatement", { object: object_62, body: body_63 });
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
      var body_64 = this.enforestStatement();
      this.matchKeyword("while");
      var testBody_65 = this.matchParens();
      var enf_66 = new Enforester(testBody_65, (0, _immutable.List)(), this.context);
      var test_67 = enf_66.enforestExpression();
      this.consumeSemicolon();
      return new _terms2.default("DoWhileStatement", { body: body_64, test: test_67 });
    }
  }, {
    key: "enforestContinueStatement",
    value: function enforestContinueStatement() {
      var kwd_68 = this.matchKeyword("continue");
      var lookahead_69 = this.peek();
      var label_70 = null;
      if (this.rest.size === 0 || this.isPunctuator(lookahead_69, ";")) {
        this.consumeSemicolon();
        return new _terms2.default("ContinueStatement", { label: label_70 });
      }
      if (this.lineNumberEq(kwd_68, lookahead_69) && (this.isIdentifier(lookahead_69) || this.isKeyword(lookahead_69, "yield") || this.isKeyword(lookahead_69, "let"))) {
        label_70 = this.enforestIdentifier();
      }
      this.consumeSemicolon();
      return new _terms2.default("ContinueStatement", { label: label_70 });
    }
  }, {
    key: "enforestSwitchStatement",
    value: function enforestSwitchStatement() {
      this.matchKeyword("switch");
      var cond_71 = this.matchParens();
      var enf_72 = new Enforester(cond_71, (0, _immutable.List)(), this.context);
      var discriminant_73 = enf_72.enforestExpression();
      var body_74 = this.matchCurlies();
      if (body_74.size === 0) {
        return new _terms2.default("SwitchStatement", { discriminant: discriminant_73, cases: (0, _immutable.List)() });
      }
      enf_72 = new Enforester(body_74, (0, _immutable.List)(), this.context);
      var cases_75 = enf_72.enforestSwitchCases();
      var lookahead_76 = enf_72.peek();
      if (enf_72.isKeyword(lookahead_76, "default")) {
        var defaultCase = enf_72.enforestSwitchDefault();
        var postDefaultCases = enf_72.enforestSwitchCases();
        return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_73, preDefaultCases: cases_75, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
      }
      return new _terms2.default("SwitchStatement", { discriminant: discriminant_73, cases: cases_75 });
    }
  }, {
    key: "enforestSwitchCases",
    value: function enforestSwitchCases() {
      var cases_77 = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
        cases_77.push(this.enforestSwitchCase());
      }
      return (0, _immutable.List)(cases_77);
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
      var result_78 = [];
      while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
        result_78.push(this.enforestStatementListItem());
      }
      return (0, _immutable.List)(result_78);
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
      var cond_79 = this.matchParens();
      var enf_80 = new Enforester(cond_79, (0, _immutable.List)(), this.context);
      var lookahead_81 = void 0,
          test_82 = void 0,
          init_83 = void 0,
          right_84 = void 0,
          type_85 = void 0,
          left_86 = void 0,
          update_87 = void 0;
      if (enf_80.isPunctuator(enf_80.peek(), ";")) {
        enf_80.advance();
        if (!enf_80.isPunctuator(enf_80.peek(), ";")) {
          test_82 = enf_80.enforestExpression();
        }
        enf_80.matchPunctuator(";");
        if (enf_80.rest.size !== 0) {
          right_84 = enf_80.enforestExpression();
        }
        return new _terms2.default("ForStatement", { init: null, test: test_82, update: right_84, body: this.enforestStatement() });
      } else {
        lookahead_81 = enf_80.peek();
        if (enf_80.isVarDeclTransform(lookahead_81) || enf_80.isLetDeclTransform(lookahead_81) || enf_80.isConstDeclTransform(lookahead_81)) {
          init_83 = enf_80.enforestVariableDeclaration();
          lookahead_81 = enf_80.peek();
          if (this.isKeyword(lookahead_81, "in") || this.isIdentifier(lookahead_81, "of")) {
            if (this.isKeyword(lookahead_81, "in")) {
              enf_80.advance();
              right_84 = enf_80.enforestExpression();
              type_85 = "ForInStatement";
            } else if (this.isIdentifier(lookahead_81, "of")) {
              enf_80.advance();
              right_84 = enf_80.enforestExpression();
              type_85 = "ForOfStatement";
            }
            return new _terms2.default(type_85, { left: init_83, right: right_84, body: this.enforestStatement() });
          }
          enf_80.matchPunctuator(";");
          if (enf_80.isPunctuator(enf_80.peek(), ";")) {
            enf_80.advance();
            test_82 = null;
          } else {
            test_82 = enf_80.enforestExpression();
            enf_80.matchPunctuator(";");
          }
          update_87 = enf_80.enforestExpression();
        } else {
          if (this.isKeyword(enf_80.peek(1), "in") || this.isIdentifier(enf_80.peek(1), "of")) {
            left_86 = enf_80.enforestBindingIdentifier();
            var kind = enf_80.advance();
            if (this.isKeyword(kind, "in")) {
              type_85 = "ForInStatement";
            } else {
              type_85 = "ForOfStatement";
            }
            right_84 = enf_80.enforestExpression();
            return new _terms2.default(type_85, { left: left_86, right: right_84, body: this.enforestStatement() });
          }
          init_83 = enf_80.enforestExpression();
          enf_80.matchPunctuator(";");
          if (enf_80.isPunctuator(enf_80.peek(), ";")) {
            enf_80.advance();
            test_82 = null;
          } else {
            test_82 = enf_80.enforestExpression();
            enf_80.matchPunctuator(";");
          }
          update_87 = enf_80.enforestExpression();
        }
        return new _terms2.default("ForStatement", { init: init_83, test: test_82, update: update_87, body: this.enforestStatement() });
      }
    }
  }, {
    key: "enforestIfStatement",
    value: function enforestIfStatement() {
      this.matchKeyword("if");
      var cond_88 = this.matchParens();
      var enf_89 = new Enforester(cond_88, (0, _immutable.List)(), this.context);
      var lookahead_90 = enf_89.peek();
      var test_91 = enf_89.enforestExpression();
      if (test_91 === null) {
        throw enf_89.createError(lookahead_90, "expecting an expression");
      }
      var consequent_92 = this.enforestStatement();
      var alternate_93 = null;
      if (this.isKeyword(this.peek(), "else")) {
        this.advance();
        alternate_93 = this.enforestStatement();
      }
      return new _terms2.default("IfStatement", { test: test_91, consequent: consequent_92, alternate: alternate_93 });
    }
  }, {
    key: "enforestWhileStatement",
    value: function enforestWhileStatement() {
      this.matchKeyword("while");
      var cond_94 = this.matchParens();
      var enf_95 = new Enforester(cond_94, (0, _immutable.List)(), this.context);
      var lookahead_96 = enf_95.peek();
      var test_97 = enf_95.enforestExpression();
      if (test_97 === null) {
        throw enf_95.createError(lookahead_96, "expecting an expression");
      }
      var body_98 = this.enforestStatement();
      return new _terms2.default("WhileStatement", { test: test_97, body: body_98 });
    }
  }, {
    key: "enforestBlockStatement",
    value: function enforestBlockStatement() {
      return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
    }
  }, {
    key: "enforestBlock",
    value: function enforestBlock() {
      var b_99 = this.matchCurlies();
      var body_100 = [];
      var enf_101 = new Enforester(b_99, (0, _immutable.List)(), this.context);
      while (enf_101.rest.size !== 0) {
        var lookahead = enf_101.peek();
        var stmt = enf_101.enforestStatement();
        if (stmt == null) {
          throw enf_101.createError(lookahead, "not a statement");
        }
        body_100.push(stmt);
      }
      return new _terms2.default("Block", { statements: (0, _immutable.List)(body_100) });
    }
  }, {
    key: "enforestClass",
    value: function enforestClass(_ref) {
      var isExpr = _ref.isExpr;
      var inDefault = _ref.inDefault;

      var kw_102 = this.advance();
      var name_103 = null,
          supr_104 = null;
      var type_105 = isExpr ? "ClassExpression" : "ClassDeclaration";
      if (this.isIdentifier(this.peek())) {
        name_103 = this.enforestBindingIdentifier();
      } else if (!isExpr) {
        if (inDefault) {
          name_103 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_102) });
        } else {
          throw this.createError(this.peek(), "unexpected syntax");
        }
      }
      if (this.isKeyword(this.peek(), "extends")) {
        this.advance();
        supr_104 = this.enforestExpressionLoop();
      }
      var elements_106 = [];
      var enf_107 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      while (enf_107.rest.size !== 0) {
        if (enf_107.isPunctuator(enf_107.peek(), ";")) {
          enf_107.advance();
          continue;
        }
        var isStatic = false;

        var _enf_107$enforestMeth = enf_107.enforestMethodDefinition();

        var methodOrKey = _enf_107$enforestMeth.methodOrKey;
        var kind = _enf_107$enforestMeth.kind;

        if (kind === "identifier" && methodOrKey.value.val() === "static") {
          isStatic = true;

          var _enf_107$enforestMeth2 = enf_107.enforestMethodDefinition();

          methodOrKey = _enf_107$enforestMeth2.methodOrKey;
          kind = _enf_107$enforestMeth2.kind;
        }
        if (kind === "method") {
          elements_106.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
        } else {
          throw this.createError(enf_107.peek(), "Only methods are allowed in classes");
        }
      }
      return new _terms2.default(type_105, { name: name_103, super: supr_104, elements: (0, _immutable.List)(elements_106) });
    }
  }, {
    key: "enforestBindingTarget",
    value: function enforestBindingTarget() {
      var lookahead_108 = this.peek();
      if (this.isIdentifier(lookahead_108) || this.isKeyword(lookahead_108)) {
        return this.enforestBindingIdentifier();
      } else if (this.isBrackets(lookahead_108)) {
        return this.enforestArrayBinding();
      } else if (this.isBraces(lookahead_108)) {
        return this.enforestObjectBinding();
      }
      (0, _errors.assert)(false, "not implemented yet");
    }
  }, {
    key: "enforestObjectBinding",
    value: function enforestObjectBinding() {
      var enf_109 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);
      var properties_110 = [];
      while (enf_109.rest.size !== 0) {
        properties_110.push(enf_109.enforestBindingProperty());
        enf_109.consumeComma();
      }
      return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_110) });
    }
  }, {
    key: "enforestBindingProperty",
    value: function enforestBindingProperty() {
      var lookahead_111 = this.peek();

      var _enforestPropertyName = this.enforestPropertyName();

      var name = _enforestPropertyName.name;
      var binding = _enforestPropertyName.binding;

      if (this.isIdentifier(lookahead_111) || this.isKeyword(lookahead_111, "let") || this.isKeyword(lookahead_111, "yield")) {
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
      var bracket_112 = this.matchSquares();
      var enf_113 = new Enforester(bracket_112, (0, _immutable.List)(), this.context);
      var elements_114 = [],
          restElement_115 = null;
      while (enf_113.rest.size !== 0) {
        var el = void 0;
        if (enf_113.isPunctuator(enf_113.peek(), ",")) {
          enf_113.consumeComma();
          el = null;
        } else {
          if (enf_113.isPunctuator(enf_113.peek(), "...")) {
            enf_113.advance();
            restElement_115 = enf_113.enforestBindingTarget();
            break;
          } else {
            el = enf_113.enforestBindingElement();
          }
          enf_113.consumeComma();
        }
        elements_114.push(el);
      }
      return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_114), restElement: restElement_115 });
    }
  }, {
    key: "enforestBindingElement",
    value: function enforestBindingElement() {
      var binding_116 = this.enforestBindingTarget();
      if (this.isAssign(this.peek())) {
        this.advance();
        var init = this.enforestExpressionLoop();
        binding_116 = new _terms2.default("BindingWithDefault", { binding: binding_116, init: init });
      }
      return binding_116;
    }
  }, {
    key: "enforestBindingIdentifier",
    value: function enforestBindingIdentifier() {
      return new _terms2.default("BindingIdentifier", { name: this.enforestIdentifier() });
    }
  }, {
    key: "enforestIdentifier",
    value: function enforestIdentifier() {
      var lookahead_117 = this.peek();
      if (this.isIdentifier(lookahead_117) || this.isKeyword(lookahead_117)) {
        return this.advance();
      }
      throw this.createError(lookahead_117, "expecting an identifier");
    }
  }, {
    key: "enforestReturnStatement",
    value: function enforestReturnStatement() {
      var kw_118 = this.advance();
      var lookahead_119 = this.peek();
      if (this.rest.size === 0 || lookahead_119 && !this.lineNumberEq(kw_118, lookahead_119)) {
        return new _terms2.default("ReturnStatement", { expression: null });
      }
      var term_120 = null;
      if (!this.isPunctuator(lookahead_119, ";")) {
        term_120 = this.enforestExpression();
        (0, _errors.expect)(term_120 != null, "Expecting an expression to follow return keyword", lookahead_119, this.rest);
      }
      this.consumeSemicolon();
      return new _terms2.default("ReturnStatement", { expression: term_120 });
    }
  }, {
    key: "enforestVariableDeclaration",
    value: function enforestVariableDeclaration() {
      var kind_121 = void 0;
      var lookahead_122 = this.advance();
      var kindSyn_123 = lookahead_122;
      if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.VariableDeclTransform) {
        kind_121 = "var";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.LetDeclTransform) {
        kind_121 = "let";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.ConstDeclTransform) {
        kind_121 = "const";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.SyntaxDeclTransform) {
        kind_121 = "syntax";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.SyntaxrecDeclTransform) {
        kind_121 = "syntaxrec";
      }
      var decls_124 = (0, _immutable.List)();
      while (true) {
        var term = this.enforestVariableDeclarator();
        var _lookahead_ = this.peek();
        decls_124 = decls_124.concat(term);
        if (this.isPunctuator(_lookahead_, ",")) {
          this.advance();
        } else {
          break;
        }
      }
      return new _terms2.default("VariableDeclaration", { kind: kind_121, declarators: decls_124 });
    }
  }, {
    key: "enforestVariableDeclarator",
    value: function enforestVariableDeclarator() {
      var id_125 = this.enforestBindingTarget();
      var lookahead_126 = this.peek();
      var init_127 = void 0,
          rest_128 = void 0;
      if (this.isPunctuator(lookahead_126, "=")) {
        this.advance();
        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        init_127 = enf.enforest("expression");
        this.rest = enf.rest;
      } else {
        init_127 = null;
      }
      return new _terms2.default("VariableDeclarator", { binding: id_125, init: init_127 });
    }
  }, {
    key: "enforestExpressionStatement",
    value: function enforestExpressionStatement() {
      var start_129 = this.rest.get(0);
      var expr_130 = this.enforestExpression();
      if (expr_130 === null) {
        throw this.createError(start_129, "not a valid expression");
      }
      this.consumeSemicolon();
      return new _terms2.default("ExpressionStatement", { expression: expr_130 });
    }
  }, {
    key: "enforestExpression",
    value: function enforestExpression() {
      var left_131 = this.enforestExpressionLoop();
      var lookahead_132 = this.peek();
      if (this.isPunctuator(lookahead_132, ",")) {
        while (this.rest.size !== 0) {
          if (!this.isPunctuator(this.peek(), ",")) {
            break;
          }
          var operator = this.advance();
          var right = this.enforestExpressionLoop();
          left_131 = new _terms2.default("BinaryExpression", { left: left_131, operator: operator, right: right });
        }
      }
      this.term = null;
      return left_131;
    }
  }, {
    key: "enforestExpressionLoop",
    value: function enforestExpressionLoop() {
      this.term = null;
      this.opCtx = { prec: 0, combine: function combine(x) {
          return x;
        }, stack: (0, _immutable.List)() };
      do {
        var term = this.enforestAssignmentExpression();
        if (term === EXPR_LOOP_NO_CHANGE_24 && this.opCtx.stack.size > 0) {
          this.term = this.opCtx.combine(this.term);

          var _opCtx$stack$last = this.opCtx.stack.last();

          var prec = _opCtx$stack$last.prec;
          var combine = _opCtx$stack$last.combine;

          this.opCtx.prec = prec;
          this.opCtx.combine = combine;
          this.opCtx.stack = this.opCtx.stack.pop();
        } else if (term === EXPR_LOOP_NO_CHANGE_24) {
          break;
        } else if (term === EXPR_LOOP_OPERATOR_23 || term === EXPR_LOOP_EXPANSION_25) {
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
      var lookahead_133 = this.peek();
      if (this.term === null && this.isTerm(lookahead_133)) {
        return this.advance();
      }
      if (this.term === null && this.isCompiletimeTransform(lookahead_133)) {
        var result = this.expandMacro();
        this.rest = result.concat(this.rest);
        return EXPR_LOOP_EXPANSION_25;
      }
      if (this.term === null && this.isKeyword(lookahead_133, "yield")) {
        return this.enforestYieldExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_133, "class")) {
        return this.enforestClass({ isExpr: true });
      }
      if (this.term === null && this.isKeyword(lookahead_133, "super")) {
        this.advance();
        return new _terms2.default("Super", {});
      }
      if (this.term === null && (this.isIdentifier(lookahead_133) || this.isParens(lookahead_133)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_133, this.peek(1))) {
        return this.enforestArrowExpression();
      }
      if (this.term === null && this.isSyntaxTemplate(lookahead_133)) {
        return this.enforestSyntaxTemplate();
      }
      if (this.term === null && this.isSyntaxQuoteTransform(lookahead_133)) {
        return this.enforestSyntaxQuote();
      }
      if (this.term === null && this.isNewTransform(lookahead_133)) {
        return this.enforestNewExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_133, "this")) {
        return new _terms2.default("ThisExpression", { stx: this.advance() });
      }
      if (this.term === null && (this.isIdentifier(lookahead_133) || this.isKeyword(lookahead_133, "let") || this.isKeyword(lookahead_133, "yield"))) {
        return new _terms2.default("IdentifierExpression", { name: this.advance() });
      }
      if (this.term === null && this.isNumericLiteral(lookahead_133)) {
        var num = this.advance();
        if (num.val() === 1 / 0) {
          return new _terms2.default("LiteralInfinityExpression", {});
        }
        return new _terms2.default("LiteralNumericExpression", { value: num });
      }
      if (this.term === null && this.isStringLiteral(lookahead_133)) {
        return new _terms2.default("LiteralStringExpression", { value: this.advance() });
      }
      if (this.term === null && this.isTemplate(lookahead_133)) {
        return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
      }
      if (this.term === null && this.isBooleanLiteral(lookahead_133)) {
        return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
      }
      if (this.term === null && this.isNullLiteral(lookahead_133)) {
        this.advance();
        return new _terms2.default("LiteralNullExpression", {});
      }
      if (this.term === null && this.isRegularExpression(lookahead_133)) {
        var reStx = this.advance();
        var lastSlash = reStx.token.value.lastIndexOf("/");
        var pattern = reStx.token.value.slice(1, lastSlash);
        var flags = reStx.token.value.slice(lastSlash + 1);
        return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
      }
      if (this.term === null && this.isParens(lookahead_133)) {
        return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
      }
      if (this.term === null && this.isFnDeclTransform(lookahead_133)) {
        return this.enforestFunctionExpression();
      }
      if (this.term === null && this.isBraces(lookahead_133)) {
        return this.enforestObjectExpression();
      }
      if (this.term === null && this.isBrackets(lookahead_133)) {
        return this.enforestArrayExpression();
      }
      if (this.term === null && this.isOperator(lookahead_133)) {
        return this.enforestUnaryExpression();
      }
      if (this.term && this.isUpdateOperator(lookahead_133)) {
        return this.enforestUpdateExpression();
      }
      if (this.term && this.isOperator(lookahead_133)) {
        return this.enforestBinaryExpression();
      }
      if (this.term && this.isPunctuator(lookahead_133, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        return this.enforestStaticMemberExpression();
      }
      if (this.term && this.isBrackets(lookahead_133)) {
        return this.enforestComputedMemberExpression();
      }
      if (this.term && this.isParens(lookahead_133)) {
        var paren = this.advance();
        return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
      }
      if (this.term && this.isTemplate(lookahead_133)) {
        return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
      }
      if (this.term && this.isAssign(lookahead_133)) {
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
      if (this.term && this.isPunctuator(lookahead_133, "?")) {
        return this.enforestConditionalExpression();
      }
      return EXPR_LOOP_NO_CHANGE_24;
    }
  }, {
    key: "enforestArgumentList",
    value: function enforestArgumentList() {
      var result_134 = [];
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
        result_134.push(arg);
      }
      return (0, _immutable.List)(result_134);
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword("new");
      var callee_135 = void 0;
      if (this.isKeyword(this.peek(), "new")) {
        callee_135 = this.enforestNewExpression();
      } else if (this.isKeyword(this.peek(), "super")) {
        callee_135 = this.enforestExpressionLoop();
      } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
        this.advance();
        this.advance();
        return new _terms2.default("NewTargetExpression", {});
      } else {
        callee_135 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
      }
      var args_136 = void 0;
      if (this.isParens(this.peek())) {
        args_136 = this.matchParens();
      } else {
        args_136 = (0, _immutable.List)();
      }
      return new _terms2.default("NewExpression", { callee: callee_135, arguments: args_136 });
    }
  }, {
    key: "enforestComputedMemberExpression",
    value: function enforestComputedMemberExpression() {
      var enf_137 = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_137.enforestExpression() });
    }
  }, {
    key: "transformDestructuring",
    value: function transformDestructuring(term_138) {
      var _this = this;

      switch (term_138.type) {
        case "IdentifierExpression":
          return new _terms2.default("BindingIdentifier", { name: term_138.name });
        case "ParenthesizedExpression":
          if (term_138.inner.size === 1 && this.isIdentifier(term_138.inner.get(0))) {
            return new _terms2.default("BindingIdentifier", { name: term_138.inner.get(0) });
          }
        case "DataProperty":
          return new _terms2.default("BindingPropertyProperty", { name: term_138.name, binding: this.transformDestructuringWithDefault(term_138.expression) });
        case "ShorthandProperty":
          return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_138.name }), init: null });
        case "ObjectExpression":
          return new _terms2.default("ObjectBinding", { properties: term_138.properties.map(function (t) {
              return _this.transformDestructuring(t);
            }) });
        case "ArrayExpression":
          var last = term_138.elements.last();
          if (last != null && last.type === "SpreadElement") {
            return new _terms2.default("ArrayBinding", { elements: term_138.elements.slice(0, -1).map(function (t) {
                return t && _this.transformDestructuringWithDefault(t);
              }), restElement: this.transformDestructuringWithDefault(last.expression) });
          } else {
            return new _terms2.default("ArrayBinding", { elements: term_138.elements.map(function (t) {
                return t && _this.transformDestructuringWithDefault(t);
              }), restElement: null });
          }
          return new _terms2.default("ArrayBinding", { elements: term_138.elements.map(function (t) {
              return t && _this.transformDestructuring(t);
            }), restElement: null });
        case "StaticPropertyName":
          return new _terms2.default("BindingIdentifier", { name: term_138.value });
        case "ComputedMemberExpression":
        case "StaticMemberExpression":
        case "ArrayBinding":
        case "BindingIdentifier":
        case "BindingPropertyIdentifier":
        case "BindingPropertyProperty":
        case "BindingWithDefault":
        case "ObjectBinding":
          return term_138;
      }
      (0, _errors.assert)(false, "not implemented yet for " + term_138.type);
    }
  }, {
    key: "transformDestructuringWithDefault",
    value: function transformDestructuringWithDefault(term_139) {
      switch (term_139.type) {
        case "AssignmentExpression":
          return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_139.binding), init: term_139.expression });
      }
      return this.transformDestructuring(term_139);
    }
  }, {
    key: "enforestArrowExpression",
    value: function enforestArrowExpression() {
      var enf_140 = void 0;
      if (this.isIdentifier(this.peek())) {
        enf_140 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf_140 = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params_141 = enf_140.enforestFormalParameters();
      this.matchPunctuator("=>");
      var body_142 = void 0;
      if (this.isBraces(this.peek())) {
        body_142 = this.matchCurlies();
      } else {
        enf_140 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        body_142 = enf_140.enforestExpressionLoop();
        this.rest = enf_140.rest;
      }
      return new _terms2.default("ArrowExpression", { params: params_141, body: body_142 });
    }
  }, {
    key: "enforestYieldExpression",
    value: function enforestYieldExpression() {
      var kwd_143 = this.matchKeyword("yield");
      var lookahead_144 = this.peek();
      if (this.rest.size === 0 || lookahead_144 && !this.lineNumberEq(kwd_143, lookahead_144)) {
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
      var name_145 = this.advance();
      return new _terms2.default("SyntaxQuote", { name: name_145, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_145 }), elements: this.enforestTemplateElements() }) });
    }
  }, {
    key: "enforestStaticMemberExpression",
    value: function enforestStaticMemberExpression() {
      var object_146 = this.term;
      var dot_147 = this.advance();
      var property_148 = this.advance();
      return new _terms2.default("StaticMemberExpression", { object: object_146, property: property_148 });
    }
  }, {
    key: "enforestArrayExpression",
    value: function enforestArrayExpression() {
      var arr_149 = this.advance();
      var elements_150 = [];
      var enf_151 = new Enforester(arr_149.inner(), (0, _immutable.List)(), this.context);
      while (enf_151.rest.size > 0) {
        var lookahead = enf_151.peek();
        if (enf_151.isPunctuator(lookahead, ",")) {
          enf_151.advance();
          elements_150.push(null);
        } else if (enf_151.isPunctuator(lookahead, "...")) {
          enf_151.advance();
          var expression = enf_151.enforestExpressionLoop();
          if (expression == null) {
            throw enf_151.createError(lookahead, "expecting expression");
          }
          elements_150.push(new _terms2.default("SpreadElement", { expression: expression }));
        } else {
          var term = enf_151.enforestExpressionLoop();
          if (term == null) {
            throw enf_151.createError(lookahead, "expected expression");
          }
          elements_150.push(term);
          enf_151.consumeComma();
        }
      }
      return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_150) });
    }
  }, {
    key: "enforestObjectExpression",
    value: function enforestObjectExpression() {
      var obj_152 = this.advance();
      var properties_153 = (0, _immutable.List)();
      var enf_154 = new Enforester(obj_152.inner(), (0, _immutable.List)(), this.context);
      var lastProp_155 = null;
      while (enf_154.rest.size > 0) {
        var prop = enf_154.enforestPropertyDefinition();
        enf_154.consumeComma();
        properties_153 = properties_153.concat(prop);
        if (lastProp_155 === prop) {
          throw enf_154.createError(prop, "invalid syntax in object");
        }
        lastProp_155 = prop;
      }
      return new _terms2.default("ObjectExpression", { properties: properties_153 });
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
      var expr_156 = this.enforestExpressionLoop();
      return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_156 });
    }
  }, {
    key: "enforestMethodDefinition",
    value: function enforestMethodDefinition() {
      var lookahead_157 = this.peek();
      var isGenerator_158 = false;
      if (this.isPunctuator(lookahead_157, "*")) {
        isGenerator_158 = true;
        this.advance();
      }
      if (this.isIdentifier(lookahead_157, "get") && this.isPropertyName(this.peek(1))) {
        this.advance();

        var _enforestPropertyName2 = this.enforestPropertyName();

        var _name = _enforestPropertyName2.name;

        this.matchParens();
        var body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Getter", { name: _name, body: body }), kind: "method" };
      } else if (this.isIdentifier(lookahead_157, "set") && this.isPropertyName(this.peek(1))) {
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
        return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_158, name: name, params: formalParams, body: _body2 }), kind: "method" };
      }
      return { methodOrKey: name, kind: this.isIdentifier(lookahead_157) || this.isKeyword(lookahead_157) ? "identifier" : "property" };
    }
  }, {
    key: "enforestPropertyName",
    value: function enforestPropertyName() {
      var lookahead_159 = this.peek();
      if (this.isStringLiteral(lookahead_159) || this.isNumericLiteral(lookahead_159)) {
        return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
      } else if (this.isBrackets(lookahead_159)) {
        var enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
        var expr = enf.enforestExpressionLoop();
        return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
      }
      var name_160 = this.advance();
      return { name: new _terms2.default("StaticPropertyName", { value: name_160 }), binding: new _terms2.default("BindingIdentifier", { name: name_160 }) };
    }
  }, {
    key: "enforestFunction",
    value: function enforestFunction(_ref2) {
      var isExpr = _ref2.isExpr;
      var inDefault = _ref2.inDefault;
      var allowGenerator = _ref2.allowGenerator;

      var name_161 = null,
          params_162 = void 0,
          body_163 = void 0,
          rest_164 = void 0;
      var isGenerator_165 = false;
      var fnKeyword_166 = this.advance();
      var lookahead_167 = this.peek();
      var type_168 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
      if (this.isPunctuator(lookahead_167, "*")) {
        isGenerator_165 = true;
        this.advance();
        lookahead_167 = this.peek();
      }
      if (!this.isParens(lookahead_167)) {
        name_161 = this.enforestBindingIdentifier();
      } else if (inDefault) {
        name_161 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_166) });
      }
      params_162 = this.matchParens();
      body_163 = this.matchCurlies();
      var enf_169 = new Enforester(params_162, (0, _immutable.List)(), this.context);
      var formalParams_170 = enf_169.enforestFormalParameters();
      return new _terms2.default(type_168, { name: name_161, isGenerator: isGenerator_165, params: formalParams_170, body: body_163 });
    }
  }, {
    key: "enforestFunctionExpression",
    value: function enforestFunctionExpression() {
      var name_171 = null,
          params_172 = void 0,
          body_173 = void 0,
          rest_174 = void 0;
      var isGenerator_175 = false;
      this.advance();
      var lookahead_176 = this.peek();
      if (this.isPunctuator(lookahead_176, "*")) {
        isGenerator_175 = true;
        this.advance();
        lookahead_176 = this.peek();
      }
      if (!this.isParens(lookahead_176)) {
        name_171 = this.enforestBindingIdentifier();
      }
      params_172 = this.matchParens();
      body_173 = this.matchCurlies();
      var enf_177 = new Enforester(params_172, (0, _immutable.List)(), this.context);
      var formalParams_178 = enf_177.enforestFormalParameters();
      return new _terms2.default("FunctionExpression", { name: name_171, isGenerator: isGenerator_175, params: formalParams_178, body: body_173 });
    }
  }, {
    key: "enforestFunctionDeclaration",
    value: function enforestFunctionDeclaration() {
      var name_179 = void 0,
          params_180 = void 0,
          body_181 = void 0,
          rest_182 = void 0;
      var isGenerator_183 = false;
      this.advance();
      var lookahead_184 = this.peek();
      if (this.isPunctuator(lookahead_184, "*")) {
        isGenerator_183 = true;
        this.advance();
      }
      name_179 = this.enforestBindingIdentifier();
      params_180 = this.matchParens();
      body_181 = this.matchCurlies();
      var enf_185 = new Enforester(params_180, (0, _immutable.List)(), this.context);
      var formalParams_186 = enf_185.enforestFormalParameters();
      return new _terms2.default("FunctionDeclaration", { name: name_179, isGenerator: isGenerator_183, params: formalParams_186, body: body_181 });
    }
  }, {
    key: "enforestFormalParameters",
    value: function enforestFormalParameters() {
      var items_187 = [];
      var rest_188 = null;
      while (this.rest.size !== 0) {
        var lookahead = this.peek();
        if (this.isPunctuator(lookahead, "...")) {
          this.matchPunctuator("...");
          rest_188 = this.enforestBindingIdentifier();
          break;
        }
        items_187.push(this.enforestParam());
        this.consumeComma();
      }
      return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_187), rest: rest_188 });
    }
  }, {
    key: "enforestParam",
    value: function enforestParam() {
      return this.enforestBindingElement();
    }
  }, {
    key: "enforestUpdateExpression",
    value: function enforestUpdateExpression() {
      var operator_189 = this.matchUnaryOperator();
      return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_189.val(), operand: this.transformDestructuring(this.term) });
    }
  }, {
    key: "enforestUnaryExpression",
    value: function enforestUnaryExpression() {
      var _this2 = this;

      var operator_190 = this.matchUnaryOperator();
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = 14;
      this.opCtx.combine = function (rightTerm) {
        var type_191 = void 0,
            term_192 = void 0,
            isPrefix_193 = void 0;
        if (operator_190.val() === "++" || operator_190.val() === "--") {
          type_191 = "UpdateExpression";
          term_192 = _this2.transformDestructuring(rightTerm);
          isPrefix_193 = true;
        } else {
          type_191 = "UnaryExpression";
          isPrefix_193 = undefined;
          term_192 = rightTerm;
        }
        return new _terms2.default(type_191, { operator: operator_190.val(), operand: term_192, isPrefix: isPrefix_193 });
      };
      return EXPR_LOOP_OPERATOR_23;
    }
  }, {
    key: "enforestConditionalExpression",
    value: function enforestConditionalExpression() {
      var test_194 = this.opCtx.combine(this.term);
      if (this.opCtx.stack.size > 0) {
        var _opCtx$stack$last2 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last2.prec;
        var combine = _opCtx$stack$last2.combine;

        this.opCtx.stack = this.opCtx.stack.pop();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
      }
      this.matchPunctuator("?");
      var enf_195 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      var consequent_196 = enf_195.enforestExpressionLoop();
      enf_195.matchPunctuator(":");
      enf_195 = new Enforester(enf_195.rest, (0, _immutable.List)(), this.context);
      var alternate_197 = enf_195.enforestExpressionLoop();
      this.rest = enf_195.rest;
      return new _terms2.default("ConditionalExpression", { test: test_194, consequent: consequent_196, alternate: alternate_197 });
    }
  }, {
    key: "enforestBinaryExpression",
    value: function enforestBinaryExpression() {
      var leftTerm_198 = this.term;
      var opStx_199 = this.peek();
      var op_200 = opStx_199.val();
      var opPrec_201 = (0, _operators.getOperatorPrec)(op_200);
      var opAssoc_202 = (0, _operators.getOperatorAssoc)(op_200);
      if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_201, opAssoc_202)) {
        this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
        this.opCtx.prec = opPrec_201;
        this.opCtx.combine = function (rightTerm) {
          return new _terms2.default("BinaryExpression", { left: leftTerm_198, operator: opStx_199, right: rightTerm });
        };
        this.advance();
        return EXPR_LOOP_OPERATOR_23;
      } else {
        var term = this.opCtx.combine(leftTerm_198);

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

      var lookahead_203 = this.matchTemplate();
      var elements_204 = lookahead_203.token.items.map(function (it) {
        if (it instanceof _syntax2.default && it.isDelimiter()) {
          var enf = new Enforester(it.inner(), (0, _immutable.List)(), _this3.context);
          return enf.enforest("expression");
        }
        return new _terms2.default("TemplateElement", { rawValue: it.slice.text });
      });
      return elements_204;
    }
  }, {
    key: "expandMacro",
    value: function expandMacro(enforestType_205) {
      var _this4 = this;

      var name_206 = this.advance();
      var syntaxTransform_207 = this.getCompiletimeTransform(name_206);
      if (syntaxTransform_207 == null || typeof syntaxTransform_207.value !== "function") {
        throw this.createError(name_206, "the macro name was not bound to a value that could be invoked");
      }
      var useSiteScope_208 = (0, _scope.freshScope)("u");
      var introducedScope_209 = (0, _scope.freshScope)("i");
      this.context.useScope = useSiteScope_208;
      var ctx_210 = new _macroContext2.default(this, name_206, this.context, useSiteScope_208, introducedScope_209);
      var result_211 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_207.value.call(null, ctx_210));
      if (!_immutable.List.isList(result_211)) {
        throw this.createError(name_206, "macro must return a list but got: " + result_211);
      }
      result_211 = result_211.map(function (stx) {
        if (!(stx && typeof stx.addScope === "function")) {
          throw _this4.createError(name_206, "macro must return syntax objects or terms but got: " + stx);
        }
        return stx.addScope(introducedScope_209, _this4.context.bindings, { flip: true });
      });
      return result_211;
    }
  }, {
    key: "consumeSemicolon",
    value: function consumeSemicolon() {
      var lookahead_212 = this.peek();
      if (lookahead_212 && this.isPunctuator(lookahead_212, ";")) {
        this.advance();
      }
    }
  }, {
    key: "consumeComma",
    value: function consumeComma() {
      var lookahead_213 = this.peek();
      if (lookahead_213 && this.isPunctuator(lookahead_213, ",")) {
        this.advance();
      }
    }
  }, {
    key: "isTerm",
    value: function isTerm(term_214) {
      return term_214 && term_214 instanceof _terms2.default;
    }
  }, {
    key: "isEOF",
    value: function isEOF(term_215) {
      return term_215 && term_215 instanceof _syntax2.default && term_215.isEOF();
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(term_216) {
      var val_217 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_216 && term_216 instanceof _syntax2.default && term_216.isIdentifier() && (val_217 === null || term_216.val() === val_217);
    }
  }, {
    key: "isPropertyName",
    value: function isPropertyName(term_218) {
      return this.isIdentifier(term_218) || this.isKeyword(term_218) || this.isNumericLiteral(term_218) || this.isStringLiteral(term_218) || this.isBrackets(term_218);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(term_219) {
      return term_219 && term_219 instanceof _syntax2.default && term_219.isNumericLiteral();
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(term_220) {
      return term_220 && term_220 instanceof _syntax2.default && term_220.isStringLiteral();
    }
  }, {
    key: "isTemplate",
    value: function isTemplate(term_221) {
      return term_221 && term_221 instanceof _syntax2.default && term_221.isTemplate();
    }
  }, {
    key: "isBooleanLiteral",
    value: function isBooleanLiteral(term_222) {
      return term_222 && term_222 instanceof _syntax2.default && term_222.isBooleanLiteral();
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(term_223) {
      return term_223 && term_223 instanceof _syntax2.default && term_223.isNullLiteral();
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(term_224) {
      return term_224 && term_224 instanceof _syntax2.default && term_224.isRegularExpression();
    }
  }, {
    key: "isParens",
    value: function isParens(term_225) {
      return term_225 && term_225 instanceof _syntax2.default && term_225.isParens();
    }
  }, {
    key: "isBraces",
    value: function isBraces(term_226) {
      return term_226 && term_226 instanceof _syntax2.default && term_226.isBraces();
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(term_227) {
      return term_227 && term_227 instanceof _syntax2.default && term_227.isBrackets();
    }
  }, {
    key: "isAssign",
    value: function isAssign(term_228) {
      if (this.isPunctuator(term_228)) {
        switch (term_228.val()) {
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
    value: function isKeyword(term_229) {
      var val_230 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_229 && term_229 instanceof _syntax2.default && term_229.isKeyword() && (val_230 === null || term_229.val() === val_230);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(term_231) {
      var val_232 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_231 && term_231 instanceof _syntax2.default && term_231.isPunctuator() && (val_232 === null || term_231.val() === val_232);
    }
  }, {
    key: "isOperator",
    value: function isOperator(term_233) {
      return term_233 && term_233 instanceof _syntax2.default && (0, _operators.isOperator)(term_233);
    }
  }, {
    key: "isUpdateOperator",
    value: function isUpdateOperator(term_234) {
      return term_234 && term_234 instanceof _syntax2.default && term_234.isPunctuator() && (term_234.val() === "++" || term_234.val() === "--");
    }
  }, {
    key: "isFnDeclTransform",
    value: function isFnDeclTransform(term_235) {
      return term_235 && term_235 instanceof _syntax2.default && this.context.env.get(term_235.resolve()) === _transforms.FunctionDeclTransform;
    }
  }, {
    key: "isVarDeclTransform",
    value: function isVarDeclTransform(term_236) {
      return term_236 && term_236 instanceof _syntax2.default && this.context.env.get(term_236.resolve()) === _transforms.VariableDeclTransform;
    }
  }, {
    key: "isLetDeclTransform",
    value: function isLetDeclTransform(term_237) {
      return term_237 && term_237 instanceof _syntax2.default && this.context.env.get(term_237.resolve()) === _transforms.LetDeclTransform;
    }
  }, {
    key: "isConstDeclTransform",
    value: function isConstDeclTransform(term_238) {
      return term_238 && term_238 instanceof _syntax2.default && this.context.env.get(term_238.resolve()) === _transforms.ConstDeclTransform;
    }
  }, {
    key: "isSyntaxDeclTransform",
    value: function isSyntaxDeclTransform(term_239) {
      return term_239 && term_239 instanceof _syntax2.default && this.context.env.get(term_239.resolve()) === _transforms.SyntaxDeclTransform;
    }
  }, {
    key: "isSyntaxrecDeclTransform",
    value: function isSyntaxrecDeclTransform(term_240) {
      return term_240 && term_240 instanceof _syntax2.default && this.context.env.get(term_240.resolve()) === _transforms.SyntaxrecDeclTransform;
    }
  }, {
    key: "isSyntaxTemplate",
    value: function isSyntaxTemplate(term_241) {
      return term_241 && term_241 instanceof _syntax2.default && term_241.isSyntaxTemplate();
    }
  }, {
    key: "isSyntaxQuoteTransform",
    value: function isSyntaxQuoteTransform(term_242) {
      return term_242 && term_242 instanceof _syntax2.default && this.context.env.get(term_242.resolve()) === _transforms.SyntaxQuoteTransform;
    }
  }, {
    key: "isReturnStmtTransform",
    value: function isReturnStmtTransform(term_243) {
      return term_243 && term_243 instanceof _syntax2.default && this.context.env.get(term_243.resolve()) === _transforms.ReturnStatementTransform;
    }
  }, {
    key: "isWhileTransform",
    value: function isWhileTransform(term_244) {
      return term_244 && term_244 instanceof _syntax2.default && this.context.env.get(term_244.resolve()) === _transforms.WhileTransform;
    }
  }, {
    key: "isForTransform",
    value: function isForTransform(term_245) {
      return term_245 && term_245 instanceof _syntax2.default && this.context.env.get(term_245.resolve()) === _transforms.ForTransform;
    }
  }, {
    key: "isSwitchTransform",
    value: function isSwitchTransform(term_246) {
      return term_246 && term_246 instanceof _syntax2.default && this.context.env.get(term_246.resolve()) === _transforms.SwitchTransform;
    }
  }, {
    key: "isBreakTransform",
    value: function isBreakTransform(term_247) {
      return term_247 && term_247 instanceof _syntax2.default && this.context.env.get(term_247.resolve()) === _transforms.BreakTransform;
    }
  }, {
    key: "isContinueTransform",
    value: function isContinueTransform(term_248) {
      return term_248 && term_248 instanceof _syntax2.default && this.context.env.get(term_248.resolve()) === _transforms.ContinueTransform;
    }
  }, {
    key: "isDoTransform",
    value: function isDoTransform(term_249) {
      return term_249 && term_249 instanceof _syntax2.default && this.context.env.get(term_249.resolve()) === _transforms.DoTransform;
    }
  }, {
    key: "isDebuggerTransform",
    value: function isDebuggerTransform(term_250) {
      return term_250 && term_250 instanceof _syntax2.default && this.context.env.get(term_250.resolve()) === _transforms.DebuggerTransform;
    }
  }, {
    key: "isWithTransform",
    value: function isWithTransform(term_251) {
      return term_251 && term_251 instanceof _syntax2.default && this.context.env.get(term_251.resolve()) === _transforms.WithTransform;
    }
  }, {
    key: "isTryTransform",
    value: function isTryTransform(term_252) {
      return term_252 && term_252 instanceof _syntax2.default && this.context.env.get(term_252.resolve()) === _transforms.TryTransform;
    }
  }, {
    key: "isThrowTransform",
    value: function isThrowTransform(term_253) {
      return term_253 && term_253 instanceof _syntax2.default && this.context.env.get(term_253.resolve()) === _transforms.ThrowTransform;
    }
  }, {
    key: "isIfTransform",
    value: function isIfTransform(term_254) {
      return term_254 && term_254 instanceof _syntax2.default && this.context.env.get(term_254.resolve()) === _transforms.IfTransform;
    }
  }, {
    key: "isNewTransform",
    value: function isNewTransform(term_255) {
      return term_255 && term_255 instanceof _syntax2.default && this.context.env.get(term_255.resolve()) === _transforms.NewTransform;
    }
  }, {
    key: "isCompiletimeTransform",
    value: function isCompiletimeTransform(term_256) {
      return term_256 && term_256 instanceof _syntax2.default && (this.context.env.get(term_256.resolve()) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_256.resolve()) instanceof _transforms.CompiletimeTransform);
    }
  }, {
    key: "getCompiletimeTransform",
    value: function getCompiletimeTransform(term_257) {
      if (this.context.env.has(term_257.resolve())) {
        return this.context.env.get(term_257.resolve());
      }
      return this.context.store.get(term_257.resolve());
    }
  }, {
    key: "lineNumberEq",
    value: function lineNumberEq(a_258, b_259) {
      if (!(a_258 && b_259)) {
        return false;
      }
      (0, _errors.assert)(a_258 instanceof _syntax2.default, "expecting a syntax object");
      (0, _errors.assert)(b_259 instanceof _syntax2.default, "expecting a syntax object");
      return a_258.lineNumber() === b_259.lineNumber();
    }
  }, {
    key: "matchIdentifier",
    value: function matchIdentifier(val_260) {
      var lookahead_261 = this.advance();
      if (this.isIdentifier(lookahead_261)) {
        return lookahead_261;
      }
      throw this.createError(lookahead_261, "expecting an identifier");
    }
  }, {
    key: "matchKeyword",
    value: function matchKeyword(val_262) {
      var lookahead_263 = this.advance();
      if (this.isKeyword(lookahead_263, val_262)) {
        return lookahead_263;
      }
      throw this.createError(lookahead_263, "expecting " + val_262);
    }
  }, {
    key: "matchLiteral",
    value: function matchLiteral() {
      var lookahead_264 = this.advance();
      if (this.isNumericLiteral(lookahead_264) || this.isStringLiteral(lookahead_264) || this.isBooleanLiteral(lookahead_264) || this.isNullLiteral(lookahead_264) || this.isTemplate(lookahead_264) || this.isRegularExpression(lookahead_264)) {
        return lookahead_264;
      }
      throw this.createError(lookahead_264, "expecting a literal");
    }
  }, {
    key: "matchStringLiteral",
    value: function matchStringLiteral() {
      var lookahead_265 = this.advance();
      if (this.isStringLiteral(lookahead_265)) {
        return lookahead_265;
      }
      throw this.createError(lookahead_265, "expecting a string literal");
    }
  }, {
    key: "matchTemplate",
    value: function matchTemplate() {
      var lookahead_266 = this.advance();
      if (this.isTemplate(lookahead_266)) {
        return lookahead_266;
      }
      throw this.createError(lookahead_266, "expecting a template literal");
    }
  }, {
    key: "matchParens",
    value: function matchParens() {
      var lookahead_267 = this.advance();
      if (this.isParens(lookahead_267)) {
        return lookahead_267.inner();
      }
      throw this.createError(lookahead_267, "expecting parens");
    }
  }, {
    key: "matchCurlies",
    value: function matchCurlies() {
      var lookahead_268 = this.advance();
      if (this.isBraces(lookahead_268)) {
        return lookahead_268.inner();
      }
      throw this.createError(lookahead_268, "expecting curly braces");
    }
  }, {
    key: "matchSquares",
    value: function matchSquares() {
      var lookahead_269 = this.advance();
      if (this.isBrackets(lookahead_269)) {
        return lookahead_269.inner();
      }
      throw this.createError(lookahead_269, "expecting sqaure braces");
    }
  }, {
    key: "matchUnaryOperator",
    value: function matchUnaryOperator() {
      var lookahead_270 = this.advance();
      if ((0, _operators.isUnaryOperator)(lookahead_270)) {
        return lookahead_270;
      }
      throw this.createError(lookahead_270, "expecting a unary operator");
    }
  }, {
    key: "matchPunctuator",
    value: function matchPunctuator(val_271) {
      var lookahead_272 = this.advance();
      if (this.isPunctuator(lookahead_272)) {
        if (typeof val_271 !== "undefined") {
          if (lookahead_272.val() === val_271) {
            return lookahead_272;
          } else {
            throw this.createError(lookahead_272, "expecting a " + val_271 + " punctuator");
          }
        }
        return lookahead_272;
      }
      throw this.createError(lookahead_272, "expecting a punctuator");
    }
  }, {
    key: "createError",
    value: function createError(stx_273, message_274) {
      var ctx_275 = "";
      var offending_276 = stx_273;
      if (this.rest.size > 0) {
        ctx_275 = this.rest.slice(0, 20).map(function (term) {
          if (term.isDelimiter()) {
            return term.inner();
          }
          return _immutable.List.of(term);
        }).flatten().map(function (s) {
          if (s === offending_276) {
            return "__" + s.val() + "__";
          }
          return s.val();
        }).join(" ");
      } else {
        ctx_275 = offending_276.toString();
      }
      return new Error(message_274 + "\n" + ctx_275);
    }
  }]);

  return Enforester;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2VuZm9yZXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUNBLElBQU0sd0JBQXdCLEVBQXhCO0FBQ04sSUFBTSx5QkFBeUIsRUFBekI7QUFDTixJQUFNLHlCQUF5QixFQUF6Qjs7SUFDTztBQUNYLFdBRFcsVUFDWCxDQUFZLE9BQVosRUFBcUIsT0FBckIsRUFBOEIsVUFBOUIsRUFBMEM7MEJBRC9CLFlBQytCOztBQUN4QyxTQUFLLElBQUwsR0FBWSxLQUFaLENBRHdDO0FBRXhDLHdCQUFPLGdCQUFLLE1BQUwsQ0FBWSxPQUFaLENBQVAsRUFBNkIsdUNBQTdCLEVBRndDO0FBR3hDLHdCQUFPLGdCQUFLLE1BQUwsQ0FBWSxPQUFaLENBQVAsRUFBNkIsdUNBQTdCLEVBSHdDO0FBSXhDLHdCQUFPLFVBQVAsRUFBbUIsaUNBQW5CLEVBSndDO0FBS3hDLFNBQUssSUFBTCxHQUFZLElBQVosQ0FMd0M7QUFNeEMsU0FBSyxJQUFMLEdBQVksT0FBWixDQU53QztBQU94QyxTQUFLLElBQUwsR0FBWSxPQUFaLENBUHdDO0FBUXhDLFNBQUssT0FBTCxHQUFlLFVBQWYsQ0FSd0M7R0FBMUM7O2VBRFc7OzJCQVdJO1VBQVYsNkRBQU8saUJBQUc7O0FBQ2IsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsSUFBZCxDQUFQLENBRGE7Ozs7OEJBR0w7QUFDUixVQUFJLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFULENBREk7QUFFUixXQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQVosQ0FGUTtBQUdSLGFBQU8sTUFBUCxDQUhROzs7OytCQUttQjtVQUFwQixnRUFBVSx3QkFBVTs7QUFDM0IsV0FBSyxJQUFMLEdBQVksSUFBWixDQUQyQjtBQUUzQixVQUFJLEtBQUssSUFBTCxDQUFVLElB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TEgsQ0FLTyxhQUFLO0FBQ3BCLGNBQUksTUFBTSxhQUFOLEVBQXFCO0FBQ3ZCLG1CQUFPLE9BQU8sRUFBRSxHQUFGLEVBQVAsR0FBaUIsSUFBakIsQ0FEZ0I7V0FBekI7QUFHQSxpQkFBTyxFQUFFLEdBQUYsRUFBUCxDQUpvQjtTQUFMLENBTFAsQ0FVUCxJQVZPLENBVUYsR0FWRSxDQUFWLENBRHNCO09BQXhCLE1BWU87QUFDTCxrQkFBVSxjQUFjLFFBQWQsRUFBVixDQURLO09BWlA7QUFlQSxhQUFPLElBQUksS0FBSixDQUFVLGNBQWMsSUFBZCxHQUFxQixPQUFyQixDQUFqQixDQWxCZ0M7Ozs7U0EzOUN2QiIsImZpbGUiOiJlbmZvcmVzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7RnVuY3Rpb25EZWNsVHJhbnNmb3JtLCBWYXJpYWJsZURlY2xUcmFuc2Zvcm0sIE5ld1RyYW5zZm9ybSwgTGV0RGVjbFRyYW5zZm9ybSwgQ29uc3REZWNsVHJhbnNmb3JtLCBTeW50YXhEZWNsVHJhbnNmb3JtLCBTeW50YXhyZWNEZWNsVHJhbnNmb3JtLCBTeW50YXhRdW90ZVRyYW5zZm9ybSwgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtLCBXaGlsZVRyYW5zZm9ybSwgSWZUcmFuc2Zvcm0sIEZvclRyYW5zZm9ybSwgU3dpdGNoVHJhbnNmb3JtLCBCcmVha1RyYW5zZm9ybSwgQ29udGludWVUcmFuc2Zvcm0sIERvVHJhbnNmb3JtLCBEZWJ1Z2dlclRyYW5zZm9ybSwgV2l0aFRyYW5zZm9ybSwgVHJ5VHJhbnNmb3JtLCBUaHJvd1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQge2lzT3BlcmF0b3IsIGlzVW5hcnlPcGVyYXRvciwgZ2V0T3BlcmF0b3JBc3NvYywgZ2V0T3BlcmF0b3JQcmVjLCBvcGVyYXRvckx0fSBmcm9tIFwiLi9vcGVyYXRvcnNcIjtcbmltcG9ydCBTeW50YXggZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQge2ZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQge3Nhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXN9IGZyb20gXCIuL2xvYWQtc3ludGF4XCI7XG5pbXBvcnQgTWFjcm9Db250ZXh0IGZyb20gXCIuL21hY3JvLWNvbnRleHRcIjtcbmNvbnN0IEVYUFJfTE9PUF9PUEVSQVRPUl8yMyA9IHt9O1xuY29uc3QgRVhQUl9MT09QX05PX0NIQU5HRV8yNCA9IHt9O1xuY29uc3QgRVhQUl9MT09QX0VYUEFOU0lPTl8yNSA9IHt9O1xuZXhwb3J0IGNsYXNzIEVuZm9yZXN0ZXIge1xuICBjb25zdHJ1Y3RvcihzdHhsXzI2LCBwcmV2XzI3LCBjb250ZXh0XzI4KSB7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHN0eGxfMjYpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHByZXZfMjcpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KGNvbnRleHRfMjgsIFwiZXhwZWN0aW5nIGEgY29udGV4dCB0byBlbmZvcmVzdFwiKTtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHRoaXMucmVzdCA9IHN0eGxfMjY7XG4gICAgdGhpcy5wcmV2ID0gcHJldl8yNztcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzI4O1xuICB9XG4gIHBlZWsobl8yOSA9IDApIHtcbiAgICByZXR1cm4gdGhpcy5yZXN0LmdldChuXzI5KTtcbiAgfVxuICBhZHZhbmNlKCkge1xuICAgIGxldCByZXRfMzAgPSB0aGlzLnJlc3QuZmlyc3QoKTtcbiAgICB0aGlzLnJlc3QgPSB0aGlzLnJlc3QucmVzdCgpO1xuICAgIHJldHVybiByZXRfMzA7XG4gIH1cbiAgZW5mb3Jlc3QodHlwZV8zMSA9IFwiTW9kdWxlXCIpIHtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRU9GKHRoaXMucGVlaygpKSkge1xuICAgICAgdGhpcy50ZXJtID0gbmV3IFRlcm0oXCJFT0ZcIiwge30pO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0XzMyO1xuICAgIGlmICh0eXBlXzMxID09PSBcImV4cHJlc3Npb25cIikge1xuICAgICAgcmVzdWx0XzMyID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdF8zMiA9IHRoaXMuZW5mb3Jlc3RNb2R1bGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzMyO1xuICB9XG4gIGVuZm9yZXN0TW9kdWxlKCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Qm9keSgpO1xuICB9XG4gIGVuZm9yZXN0Qm9keSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE1vZHVsZUl0ZW0oKTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZUl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzMsIFwiaW1wb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SW1wb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zMywgXCJleHBvcnRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zNCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMzQsIFwiKlwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8zNCkpIHtcbiAgICAgIGxldCBuYW1lZEV4cG9ydHMgPSB0aGlzLmVuZm9yZXN0RXhwb3J0Q2xhdXNlKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gbnVsbDtcbiAgICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJmcm9tXCIpKSB7XG4gICAgICAgIG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRGcm9tXCIsIHtuYW1lZEV4cG9ydHM6IG5hbWVkRXhwb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zNCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IGZhbHNlfSl9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zNCwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKHRoaXMucGVlaygpKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNsYXNzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBib2R5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiBib2R5fSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzQpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNCkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzQpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNCkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM0KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zNCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydENsYXVzZSgpIHtcbiAgICBsZXQgZW5mXzM1ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfMzYgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzM1LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzM2LnB1c2goZW5mXzM1LmVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkpO1xuICAgICAgZW5mXzM1LmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMzYpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0U3BlY2lmaWVyKCkge1xuICAgIGxldCBuYW1lXzM3ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGV4cG9ydGVkTmFtZSA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfMzcsIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgZXhwb3J0ZWROYW1lOiBuYW1lXzM3fSk7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM4ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGRlZmF1bHRCaW5kaW5nXzM5ID0gbnVsbDtcbiAgICBsZXQgbmFtZWRJbXBvcnRzXzQwID0gTGlzdCgpO1xuICAgIGxldCBmb3JTeW50YXhfNDEgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzM4KSkge1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ18zOSwgbmFtZWRJbXBvcnRzOiBuYW1lZEltcG9ydHNfNDAsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMzgpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zOCkpIHtcbiAgICAgIGRlZmF1bHRCaW5kaW5nXzM5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGZvclN5bnRheF80MSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfMzksIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyLCBuYW1lZEltcG9ydHM6IExpc3QoKSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNDF9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICBsb29rYWhlYWRfMzggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMzgpKSB7XG4gICAgICBsZXQgaW1wb3J0cyA9IHRoaXMuZW5mb3Jlc3ROYW1lZEltcG9ydHMoKTtcbiAgICAgIGxldCBmcm9tQ2xhdXNlID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF80MSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ18zOSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNDEsIG5hbWVkSW1wb3J0czogaW1wb3J0cywgbW9kdWxlU3BlY2lmaWVyOiBmcm9tQ2xhdXNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMzgsIFwiKlwiKSkge1xuICAgICAgbGV0IG5hbWVzcGFjZUJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNDEgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfMzksIGZvclN5bnRheDogZm9yU3ludGF4XzQxLCBuYW1lc3BhY2VCaW5kaW5nOiBuYW1lc3BhY2VCaW5kaW5nLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8zOCwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIqXCIpO1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICB9XG4gIGVuZm9yZXN0TmFtZWRJbXBvcnRzKCkge1xuICAgIGxldCBlbmZfNDIgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF80MyA9IFtdO1xuICAgIHdoaWxlIChlbmZfNDIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfNDMucHVzaChlbmZfNDIuZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkpO1xuICAgICAgZW5mXzQyLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfNDMpO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzQ0ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG5hbWVfNDU7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF80NCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzQ0KSkge1xuICAgICAgbmFtZV80NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfNDV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNDQsIFwidW5leHBlY3RlZCB0b2tlbiBpbiBpbXBvcnQgc3BlY2lmaWVyXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG5hbWVfNDUsIGJpbmRpbmc6IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGcm9tQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiZnJvbVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzQ2ID0gdGhpcy5tYXRjaFN0cmluZ0xpdGVyYWwoKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbG9va2FoZWFkXzQ2O1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF80NyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF80NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbih7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzQ3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50KCkge1xuICAgIGxldCBsb29rYWhlYWRfNDggPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfNDgpKSB7XG4gICAgICB0aGlzLnJlc3QgPSB0aGlzLmV4cGFuZE1hY3JvKCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICBsb29rYWhlYWRfNDggPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF80OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2hpbGVUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZlRyYW5zZm9ybShsb29rYWhlYWRfNDgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdElmU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZvclRyYW5zZm9ybShsb29rYWhlYWRfNDgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZvclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTd2l0Y2hUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJlYWtUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb250aW51ZVRyYW5zZm9ybShsb29rYWhlYWRfNDgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RvVHJhbnNmb3JtKGxvb2thaGVhZF80OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RG9TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRGVidWdnZXJUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaXRoVHJhbnNmb3JtKGxvb2thaGVhZF80OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2l0aFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUcnlUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGhyb3dUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF80OCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQ4KSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiOlwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF80OCkgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF80OCkgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzQ4KSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNDgpKSkge1xuICAgICAgbGV0IHN0bXQgPSBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBzdG10O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZXR1cm5TdG10VHJhbnNmb3JtKGxvb2thaGVhZF80OCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzQ4LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRW1wdHlTdGF0ZW1lbnRcIiwge30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxhYmVsXzQ5ID0gdGhpcy5tYXRjaElkZW50aWZpZXIoKTtcbiAgICBsZXQgcHVuY181MCA9IHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgc3RtdF81MSA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNDksIGJvZHk6IHN0bXRfNTF9KTtcbiAgfVxuICBlbmZvcmVzdEJyZWFrU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiYnJlYWtcIik7XG4gICAgbGV0IGxvb2thaGVhZF81MiA9IHRoaXMucGVlaygpO1xuICAgIGxldCBsYWJlbF81MyA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81MiwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTN9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81MikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzUyLCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81MiwgXCJsZXRcIikpIHtcbiAgICAgIGxhYmVsXzUzID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF81M30pO1xuICB9XG4gIGVuZm9yZXN0VHJ5U3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwidHJ5XCIpO1xuICAgIGxldCBib2R5XzU0ID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhdGNoXCIpKSB7XG4gICAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0aGlzLmVuZm9yZXN0Q2F0Y2hDbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZmluYWxpemVyID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTQsIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZSwgZmluYWxpemVyOiBmaW5hbGl6ZXJ9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUNhdGNoU3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU0LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZpbmFsbHlcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NCwgY2F0Y2hDbGF1c2U6IG51bGwsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidHJ5IHdpdGggbm8gY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgfVxuICBlbmZvcmVzdENhdGNoQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2F0Y2hcIik7XG4gICAgbGV0IGJpbmRpbmdQYXJlbnNfNTUgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl81NiA9IG5ldyBFbmZvcmVzdGVyKGJpbmRpbmdQYXJlbnNfNTUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYmluZGluZ181NyA9IGVuZl81Ni5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBsZXQgYm9keV81OCA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiBiaW5kaW5nXzU3LCBib2R5OiBib2R5XzU4fSk7XG4gIH1cbiAgZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRocm93XCIpO1xuICAgIGxldCBleHByZXNzaW9uXzU5ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbl81OX0pO1xuICB9XG4gIGVuZm9yZXN0V2l0aFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndpdGhcIik7XG4gICAgbGV0IG9ialBhcmVuc182MCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzYxID0gbmV3IEVuZm9yZXN0ZXIob2JqUGFyZW5zXzYwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG9iamVjdF82MiA9IGVuZl82MS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBsZXQgYm9keV82MyA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtvYmplY3Q6IG9iamVjdF82MiwgYm9keTogYm9keV82M30pO1xuICB9XG4gIGVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWJ1Z2dlclwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEZWJ1Z2dlclN0YXRlbWVudFwiLCB7fSk7XG4gIH1cbiAgZW5mb3Jlc3REb1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRvXCIpO1xuICAgIGxldCBib2R5XzY0ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IHRlc3RCb2R5XzY1ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNjYgPSBuZXcgRW5mb3Jlc3Rlcih0ZXN0Qm9keV82NSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCB0ZXN0XzY3ID0gZW5mXzY2LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNjQsIHRlc3Q6IHRlc3RfNjd9KTtcbiAgfVxuICBlbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCkge1xuICAgIGxldCBrd2RfNjggPSB0aGlzLm1hdGNoS2V5d29yZChcImNvbnRpbnVlXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNjkgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzAgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNjksIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzcwfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxpbmVOdW1iZXJFcShrd2RfNjgsIGxvb2thaGVhZF82OSkgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82OSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzY5LCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF82OSwgXCJsZXRcIikpKSB7XG4gICAgICBsYWJlbF83MCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzB9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInN3aXRjaFwiKTtcbiAgICBsZXQgY29uZF83MSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzcyID0gbmV3IEVuZm9yZXN0ZXIoY29uZF83MSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBkaXNjcmltaW5hbnRfNzMgPSBlbmZfNzIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfNzQgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGlmIChib2R5Xzc0LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzMsIGNhc2VzOiBMaXN0KCl9KTtcbiAgICB9XG4gICAgZW5mXzcyID0gbmV3IEVuZm9yZXN0ZXIoYm9keV83NCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjYXNlc183NSA9IGVuZl83Mi5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgbGV0IGxvb2thaGVhZF83NiA9IGVuZl83Mi5wZWVrKCk7XG4gICAgaWYgKGVuZl83Mi5pc0tleXdvcmQobG9va2FoZWFkXzc2LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIGxldCBkZWZhdWx0Q2FzZSA9IGVuZl83Mi5lbmZvcmVzdFN3aXRjaERlZmF1bHQoKTtcbiAgICAgIGxldCBwb3N0RGVmYXVsdENhc2VzID0gZW5mXzcyLmVuZm9yZXN0U3dpdGNoQ2FzZXMoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF83MywgcHJlRGVmYXVsdENhc2VzOiBjYXNlc183NSwgZGVmYXVsdENhc2U6IGRlZmF1bHRDYXNlLCBwb3N0RGVmYXVsdENhc2VzOiBwb3N0RGVmYXVsdENhc2VzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzMsIGNhc2VzOiBjYXNlc183NX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZXMoKSB7XG4gICAgbGV0IGNhc2VzXzc3ID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSkpIHtcbiAgICAgIGNhc2VzXzc3LnB1c2godGhpcy5lbmZvcmVzdFN3aXRjaENhc2UoKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KGNhc2VzXzc3KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2UoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJjYXNlXCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCksIGNvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SW5Td2l0Y2hDYXNlQm9keSgpO1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgbGV0IHJlc3VsdF83OCA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2FzZVwiKSkpIHtcbiAgICAgIHJlc3VsdF83OC5wdXNoKHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0Xzc4KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaERlZmF1bHQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWZhdWx0XCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJmb3JcIik7XG4gICAgbGV0IGNvbmRfNzkgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MCA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfNzksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzgxLCB0ZXN0XzgyLCBpbml0XzgzLCByaWdodF84NCwgdHlwZV84NSwgbGVmdF84NiwgdXBkYXRlXzg3O1xuICAgIGlmIChlbmZfODAuaXNQdW5jdHVhdG9yKGVuZl84MC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgZW5mXzgwLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mXzgwLmlzUHVuY3R1YXRvcihlbmZfODAucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgdGVzdF84MiA9IGVuZl84MC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIGVuZl84MC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgaWYgKGVuZl84MC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgcmlnaHRfODQgPSBlbmZfODAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IG51bGwsIHRlc3Q6IHRlc3RfODIsIHVwZGF0ZTogcmlnaHRfODQsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb29rYWhlYWRfODEgPSBlbmZfODAucGVlaygpO1xuICAgICAgaWYgKGVuZl84MC5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzgxKSB8fCBlbmZfODAuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84MSkgfHwgZW5mXzgwLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84MSkpIHtcbiAgICAgICAgaW5pdF84MyA9IGVuZl84MC5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgbG9va2FoZWFkXzgxID0gZW5mXzgwLnBlZWsoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84MSwgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODEsIFwib2ZcIikpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzgxLCBcImluXCIpKSB7XG4gICAgICAgICAgICBlbmZfODAuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODQgPSBlbmZfODAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg1ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzgxLCBcIm9mXCIpKSB7XG4gICAgICAgICAgICBlbmZfODAuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODQgPSBlbmZfODAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg1ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84NSwge2xlZnQ6IGluaXRfODMsIHJpZ2h0OiByaWdodF84NCwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzgwLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfODAuaXNQdW5jdHVhdG9yKGVuZl84MC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl84MC5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF84MiA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF84MiA9IGVuZl84MC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfODAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfODcgPSBlbmZfODAuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoZW5mXzgwLnBlZWsoMSksIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mXzgwLnBlZWsoMSksIFwib2ZcIikpIHtcbiAgICAgICAgICBsZWZ0Xzg2ID0gZW5mXzgwLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgICBsZXQga2luZCA9IGVuZl84MC5hZHZhbmNlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGtpbmQsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIHR5cGVfODUgPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR5cGVfODUgPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJpZ2h0Xzg0ID0gZW5mXzgwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg1LCB7bGVmdDogbGVmdF84NiwgcmlnaHQ6IHJpZ2h0Xzg0LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBpbml0XzgzID0gZW5mXzgwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICBlbmZfODAubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl84MC5pc1B1bmN0dWF0b3IoZW5mXzgwLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzgwLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0XzgyID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0XzgyID0gZW5mXzgwLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl84MC5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV84NyA9IGVuZl84MC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF84MywgdGVzdDogdGVzdF84MiwgdXBkYXRlOiB1cGRhdGVfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdElmU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiaWZcIik7XG4gICAgbGV0IGNvbmRfODggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84OSA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfODgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzkwID0gZW5mXzg5LnBlZWsoKTtcbiAgICBsZXQgdGVzdF85MSA9IGVuZl84OS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF85MSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzg5LmNyZWF0ZUVycm9yKGxvb2thaGVhZF85MCwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGNvbnNlcXVlbnRfOTIgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgbGV0IGFsdGVybmF0ZV85MyA9IG51bGw7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImVsc2VcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgYWx0ZXJuYXRlXzkzID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF85MSwgY29uc2VxdWVudDogY29uc2VxdWVudF85MiwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfOTN9KTtcbiAgfVxuICBlbmZvcmVzdFdoaWxlU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IGNvbmRfOTQgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85NSA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfOTQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzk2ID0gZW5mXzk1LnBlZWsoKTtcbiAgICBsZXQgdGVzdF85NyA9IGVuZl85NS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF85NyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzk1LmNyZWF0ZUVycm9yKGxvb2thaGVhZF85NiwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGJvZHlfOTggPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfOTcsIGJvZHk6IGJvZHlfOTh9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrU3RhdGVtZW50KCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5lbmZvcmVzdEJsb2NrKCl9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrKCkge1xuICAgIGxldCBiXzk5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgYm9keV8xMDAgPSBbXTtcbiAgICBsZXQgZW5mXzEwMSA9IG5ldyBFbmZvcmVzdGVyKGJfOTksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEwMS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTAxLnBlZWsoKTtcbiAgICAgIGxldCBzdG10ID0gZW5mXzEwMS5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgaWYgKHN0bXQgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBlbmZfMTAxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJub3QgYSBzdGF0ZW1lbnRcIik7XG4gICAgICB9XG4gICAgICBib2R5XzEwMC5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogTGlzdChib2R5XzEwMCl9KTtcbiAgfVxuICBlbmZvcmVzdENsYXNzKHtpc0V4cHIsIGluRGVmYXVsdH0pIHtcbiAgICBsZXQga3dfMTAyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IG5hbWVfMTAzID0gbnVsbCwgc3Vwcl8xMDQgPSBudWxsO1xuICAgIGxldCB0eXBlXzEwNSA9IGlzRXhwciA/IFwiQ2xhc3NFeHByZXNzaW9uXCIgOiBcIkNsYXNzRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEwMyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoIWlzRXhwcikge1xuICAgICAgaWYgKGluRGVmYXVsdCkge1xuICAgICAgICBuYW1lXzEwMyA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIl9kZWZhdWx0XCIsIGt3XzEwMil9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJleHRlbmRzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN1cHJfMTA0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuICAgIGxldCBlbGVtZW50c18xMDYgPSBbXTtcbiAgICBsZXQgZW5mXzEwNyA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEwNy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGlmIChlbmZfMTA3LmlzUHVuY3R1YXRvcihlbmZfMTA3LnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIGVuZl8xMDcuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTA3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaWRlbnRpZmllclwiICYmIG1ldGhvZE9yS2V5LnZhbHVlLnZhbCgpID09PSBcInN0YXRpY1wiKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTA3LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIGlmIChraW5kID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICAgIGVsZW1lbnRzXzEwNi5wdXNoKG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogaXNTdGF0aWMsIG1ldGhvZDogbWV0aG9kT3JLZXl9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGVuZl8xMDcucGVlaygpLCBcIk9ubHkgbWV0aG9kcyBhcmUgYWxsb3dlZCBpbiBjbGFzc2VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDUsIHtuYW1lOiBuYW1lXzEwMywgc3VwZXI6IHN1cHJfMTA0LCBlbGVtZW50czogTGlzdChlbGVtZW50c18xMDYpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCkge1xuICAgIGxldCBsb29rYWhlYWRfMTA4ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMDgpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMDgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEwOCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMDgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEJpbmRpbmcoKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCkge1xuICAgIGxldCBlbmZfMTA5ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzExMCA9IFtdO1xuICAgIHdoaWxlIChlbmZfMTA5LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcHJvcGVydGllc18xMTAucHVzaChlbmZfMTA5LmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mXzEwOS5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogTGlzdChwcm9wZXJ0aWVzXzExMCl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzExMSA9IHRoaXMucGVlaygpO1xuICAgIGxldCB7bmFtZSwgYmluZGluZ30gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMTEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTEsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTEsIFwieWllbGRcIikpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBleHByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IGJpbmRpbmcsIGluaXQ6IGRlZmF1bHRWYWx1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgYmluZGluZyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiBuYW1lLCBiaW5kaW5nOiBiaW5kaW5nfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXRfMTEyID0gdGhpcy5tYXRjaFNxdWFyZXMoKTtcbiAgICBsZXQgZW5mXzExMyA9IG5ldyBFbmZvcmVzdGVyKGJyYWNrZXRfMTEyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzXzExNCA9IFtdLCByZXN0RWxlbWVudF8xMTUgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTEzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZl8xMTMuaXNQdW5jdHVhdG9yKGVuZl8xMTMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzExMy5jb25zdW1lQ29tbWEoKTtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVuZl8xMTMuaXNQdW5jdHVhdG9yKGVuZl8xMTMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICAgIGVuZl8xMTMuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3RFbGVtZW50XzExNSA9IGVuZl8xMTMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmZfMTEzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTEzLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgICAgZWxlbWVudHNfMTE0LnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzExNCksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMTV9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nXzExNiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICBiaW5kaW5nXzExNiA9IG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiBiaW5kaW5nXzExNiwgaW5pdDogaW5pdH0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ18xMTY7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKX0pO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzExNyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTE3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTE3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMTcsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3XzExOCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTE5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xMTkgJiYgIXRoaXMubGluZU51bWJlckVxKGt3XzExOCwgbG9va2FoZWFkXzExOSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH1cbiAgICBsZXQgdGVybV8xMjAgPSBudWxsO1xuICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzExOSwgXCI7XCIpKSB7XG4gICAgICB0ZXJtXzEyMCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBleHBlY3QodGVybV8xMjAgIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkXzExOSwgdGhpcy5yZXN0KTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0ZXJtXzEyMH0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpIHtcbiAgICBsZXQga2luZF8xMjE7XG4gICAgbGV0IGxvb2thaGVhZF8xMjIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQga2luZFN5bl8xMjMgPSBsb29rYWhlYWRfMTIyO1xuICAgIGlmIChraW5kU3luXzEyMyAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyMy5yZXNvbHZlKCkpID09PSBWYXJpYWJsZURlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTIxID0gXCJ2YXJcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTIzICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTIzLnJlc29sdmUoKSkgPT09IExldERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTIxID0gXCJsZXRcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTIzICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTIzLnJlc29sdmUoKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjEgPSBcImNvbnN0XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyMyAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyMy5yZXNvbHZlKCkpID09PSBTeW50YXhEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyMSA9IFwic3ludGF4XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyMyAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyMy5yZXNvbHZlKCkpID09PSBTeW50YXhyZWNEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyMSA9IFwic3ludGF4cmVjXCI7XG4gICAgfVxuICAgIGxldCBkZWNsc18xMjQgPSBMaXN0KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCB0ZXJtID0gdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRvcigpO1xuICAgICAgbGV0IGxvb2thaGVhZF8xMjIgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGRlY2xzXzEyNCA9IGRlY2xzXzEyNC5jb25jYXQodGVybSk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyMiwgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IGtpbmRfMTIxLCBkZWNsYXJhdG9yczogZGVjbHNfMTI0fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3IoKSB7XG4gICAgbGV0IGlkXzEyNSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMjYgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgaW5pdF8xMjcsIHJlc3RfMTI4O1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTI2LCBcIj1cIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgaW5pdF8xMjcgPSBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mLnJlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRfMTI3ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiBpZF8xMjUsIGluaXQ6IGluaXRfMTI3fSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCkge1xuICAgIGxldCBzdGFydF8xMjkgPSB0aGlzLnJlc3QuZ2V0KDApO1xuICAgIGxldCBleHByXzEzMCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKGV4cHJfMTMwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHN0YXJ0XzEyOSwgXCJub3QgYSB2YWxpZCBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByXzEzMH0pO1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbGVmdF8xMzEgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBsZXQgbG9va2FoZWFkXzEzMiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTMyLCBcIixcIikpIHtcbiAgICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBsZXQgb3BlcmF0b3IgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IHJpZ2h0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGxlZnRfMTMxID0gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzEzMSwgb3BlcmF0b3I6IG9wZXJhdG9yLCByaWdodDogcmlnaHR9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICByZXR1cm4gbGVmdF8xMzE7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpIHtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHRoaXMub3BDdHggPSB7cHJlYzogMCwgY29tYmluZTogeCA9PiB4LCBzdGFjazogTGlzdCgpfTtcbiAgICBkbyB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpO1xuICAgICAgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfMjQgJiYgdGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRV8yNCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX09QRVJBVE9SXzIzIHx8IHRlcm0gPT09IEVYUFJfTE9PUF9FWFBBTlNJT05fMjUpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRlcm07XG4gICAgICB9XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXMudGVybTtcbiAgfVxuICBlbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTMzID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIHRoaXMucmVzdCA9IHJlc3VsdC5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzI1O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzMsIFwieWllbGRcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiB0cnVlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJzdXBlclwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTdXBlclwiLCB7fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzMpIHx8IHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzMykpICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgXCI9PlwiKSAmJiB0aGlzLmxpbmVOdW1iZXJFcShsb29rYWhlYWRfMTMzLCB0aGlzLnBlZWsoMSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhUZW1wbGF0ZShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhRdW90ZVRyYW5zZm9ybShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhRdW90ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkXzEzMykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TmV3RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzMsIFwidGhpc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhpc0V4cHJlc3Npb25cIiwge3N0eDogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEzMykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzMywgXCJ5aWVsZFwiKSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTMzKSkge1xuICAgICAgbGV0IG51bSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKG51bS52YWwoKSA9PT0gMSAvIDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb25cIiwge3ZhbHVlOiBudW19KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IG51bGwsIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMTMzKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVsbEV4cHJlc3Npb25cIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTMzKSkge1xuICAgICAgbGV0IHJlU3R4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbGFzdFNsYXNoID0gcmVTdHgudG9rZW4udmFsdWUubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgbGV0IHBhdHRlcm4gPSByZVN0eC50b2tlbi52YWx1ZS5zbGljZSgxLCBsYXN0U2xhc2gpO1xuICAgICAgbGV0IGZsYWdzID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoICsgMSk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsUmVnRXhwRXhwcmVzc2lvblwiLCB7cGF0dGVybjogcGF0dGVybiwgZmxhZ3M6IGZsYWdzfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIiwge2lubmVyOiB0aGlzLmFkdmFuY2UoKS5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEzMykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNVcGRhdGVPcGVyYXRvcihsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTMzLCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTMzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICBsZXQgcGFyZW4gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHRoaXMudGVybSwgYXJndW1lbnRzOiBwYXJlbi5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xMzMpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzEzMykpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzMywgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV8yNDtcbiAgfVxuICBlbmZvcmVzdEFyZ3VtZW50TGlzdCgpIHtcbiAgICBsZXQgcmVzdWx0XzEzNCA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBhcmcgPSBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIsXCIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0XzEzNC5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xMzQpO1xuICB9XG4gIGVuZm9yZXN0TmV3RXhwcmVzc2lvbigpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIm5ld1wiKTtcbiAgICBsZXQgY2FsbGVlXzEzNTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwibmV3XCIpKSB7XG4gICAgICBjYWxsZWVfMTM1ID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcInN1cGVyXCIpKSB7XG4gICAgICBjYWxsZWVfMTM1ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIuXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJ0YXJnZXRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdUYXJnZXRFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGVlXzEzNSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICB9XG4gICAgbGV0IGFyZ3NfMTM2O1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xMzYgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTM2ID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xMzUsIGFyZ3VtZW50czogYXJnc18xMzZ9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzEzNyA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTM3LmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzEzOCkge1xuICAgIHN3aXRjaCAodGVybV8xMzgudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzEzOC5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTM4LmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xMzguaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzEzOC5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xMzgubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xMzguZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzEzOC5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTM4LnByb3BlcnRpZXMubWFwKHQgPT4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHQpKX0pO1xuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICBsZXQgbGFzdCA9IHRlcm1fMTM4LmVsZW1lbnRzLmxhc3QoKTtcbiAgICAgICAgaWYgKGxhc3QgIT0gbnVsbCAmJiBsYXN0LnR5cGUgPT09IFwiU3ByZWFkRWxlbWVudFwiKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xMzguZWxlbWVudHMuc2xpY2UoMCwgLTEpLm1hcCh0ID0+IHQgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodCkpLCByZXN0RWxlbWVudDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQobGFzdC5leHByZXNzaW9uKX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTM4LmVsZW1lbnRzLm1hcCh0ID0+IHQgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodCkpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTM4LmVsZW1lbnRzLm1hcCh0ID0+IHQgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHQpKSwgcmVzdEVsZW1lbnQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTM4LnZhbHVlfSk7XG4gICAgICBjYXNlIFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5QmluZGluZ1wiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1dpdGhEZWZhdWx0XCI6XG4gICAgICBjYXNlIFwiT2JqZWN0QmluZGluZ1wiOlxuICAgICAgICByZXR1cm4gdGVybV8xMzg7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvciBcIiArIHRlcm1fMTM4LnR5cGUpO1xuICB9XG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtXzEzOSkge1xuICAgIHN3aXRjaCAodGVybV8xMzkudHlwZSkge1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTM5LmJpbmRpbmcpLCBpbml0OiB0ZXJtXzEzOS5leHByZXNzaW9ufSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xMzkpO1xuICB9XG4gIGVuZm9yZXN0QXJyb3dFeHByZXNzaW9uKCkge1xuICAgIGxldCBlbmZfMTQwO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGVuZl8xNDAgPSBuZXcgRW5mb3Jlc3RlcihMaXN0Lm9mKHRoaXMuYWR2YW5jZSgpKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGVuZl8xNDAgPSBuZXcgRW5mb3Jlc3RlcihwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfVxuICAgIGxldCBwYXJhbXNfMTQxID0gZW5mXzE0MC5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj0+XCIpO1xuICAgIGxldCBib2R5XzE0MjtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGJvZHlfMTQyID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5mXzE0MCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgYm9keV8xNDIgPSBlbmZfMTQwLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZl8xNDAucmVzdDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyb3dFeHByZXNzaW9uXCIsIHtwYXJhbXM6IHBhcmFtc18xNDEsIGJvZHk6IGJvZHlfMTQyfSk7XG4gIH1cbiAgZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGt3ZF8xNDMgPSB0aGlzLm1hdGNoS2V5d29yZChcInlpZWxkXCIpO1xuICAgIGxldCBsb29rYWhlYWRfMTQ0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNDQgJiYgIXRoaXMubGluZU51bWJlckVxKGt3ZF8xNDMsIGxvb2thaGVhZF8xNDQpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IG51bGx9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiKlwiKSkge1xuICAgICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfVxuICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgbGV0IHR5cGUgPSBpc0dlbmVyYXRvciA/IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIgOiBcIllpZWxkRXhwcmVzc2lvblwiO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGUsIHtleHByZXNzaW9uOiBleHByfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4VGVtcGxhdGVcIiwge3RlbXBsYXRlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3ludGF4UXVvdGUoKSB7XG4gICAgbGV0IG5hbWVfMTQ1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4UXVvdGVcIiwge25hbWU6IG5hbWVfMTQ1LCB0ZW1wbGF0ZTogbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xNDV9KSwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KX0pO1xuICB9XG4gIGVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqZWN0XzE0NiA9IHRoaXMudGVybTtcbiAgICBsZXQgZG90XzE0NyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0eV8xNDggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IG9iamVjdF8xNDYsIHByb3BlcnR5OiBwcm9wZXJ0eV8xNDh9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgYXJyXzE0OSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBlbGVtZW50c18xNTAgPSBbXTtcbiAgICBsZXQgZW5mXzE1MSA9IG5ldyBFbmZvcmVzdGVyKGFycl8xNDkuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTUxLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTUxLnBlZWsoKTtcbiAgICAgIGlmIChlbmZfMTUxLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTUxLmFkdmFuY2UoKTtcbiAgICAgICAgZWxlbWVudHNfMTUwLnB1c2gobnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKGVuZl8xNTEuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIuLi5cIikpIHtcbiAgICAgICAgZW5mXzE1MS5hZHZhbmNlKCk7XG4gICAgICAgIGxldCBleHByZXNzaW9uID0gZW5mXzE1MS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmIChleHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTUxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RpbmcgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNTAucHVzaChuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb259KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgdGVybSA9IGVuZl8xNTEuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAodGVybSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mXzE1MS5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0ZWQgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNTAucHVzaCh0ZXJtKTtcbiAgICAgICAgZW5mXzE1MS5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogTGlzdChlbGVtZW50c18xNTApfSk7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmpfMTUyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTUzID0gTGlzdCgpO1xuICAgIGxldCBlbmZfMTU0ID0gbmV3IEVuZm9yZXN0ZXIob2JqXzE1Mi5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxhc3RQcm9wXzE1NSA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xNTQucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IHByb3AgPSBlbmZfMTU0LmVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCk7XG4gICAgICBlbmZfMTU0LmNvbnN1bWVDb21tYSgpO1xuICAgICAgcHJvcGVydGllc18xNTMgPSBwcm9wZXJ0aWVzXzE1My5jb25jYXQocHJvcCk7XG4gICAgICBpZiAobGFzdFByb3BfMTU1ID09PSBwcm9wKSB7XG4gICAgICAgIHRocm93IGVuZl8xNTQuY3JlYXRlRXJyb3IocHJvcCwgXCJpbnZhbGlkIHN5bnRheCBpbiBvYmplY3RcIik7XG4gICAgICB9XG4gICAgICBsYXN0UHJvcF8xNTUgPSBwcm9wO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXzE1M30pO1xuICB9XG4gIGVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCkge1xuICAgIGxldCB7bWV0aG9kT3JLZXksIGtpbmR9ID0gdGhpcy5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgXCJtZXRob2RcIjpcbiAgICAgICAgcmV0dXJuIG1ldGhvZE9yS2V5O1xuICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtpbml0OiBpbml0LCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcobWV0aG9kT3JLZXkpfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIjpcIikpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJTaG9ydGhhbmRQcm9wZXJ0eVwiLCB7bmFtZTogbWV0aG9kT3JLZXkudmFsdWV9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IGV4cHJfMTU2ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleSwgZXhwcmVzc2lvbjogZXhwcl8xNTZ9KTtcbiAgfVxuICBlbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNTcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTU4ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNTcsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTU4ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE1NywgXCJnZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIkdldHRlclwiLCB7bmFtZTogbmFtZSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTcsIFwic2V0XCIpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hQYXJlbnMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IHBhcmFtID0gZW5mLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiU2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBwYXJhbTogcGFyYW0sIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfVxuICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnModGhpcy5wZWVrKCkpKSB7XG4gICAgICBsZXQgcGFyYW1zID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtcywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGZvcm1hbFBhcmFtcyA9IGVuZi5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiTWV0aG9kXCIsIHtpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTU4LCBuYW1lOiBuYW1lLCBwYXJhbXM6IGZvcm1hbFBhcmFtcywgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgcmV0dXJuIHttZXRob2RPcktleTogbmFtZSwga2luZDogdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE1NykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1NykgPyBcImlkZW50aWZpZXJcIiA6IFwicHJvcGVydHlcIn07XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNTkgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzE1OSkgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xNTkpKSB7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KSwgYmluZGluZzogbnVsbH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzE1OSkpIHtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZXhwciA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiwge2V4cHJlc3Npb246IGV4cHJ9KSwgYmluZGluZzogbnVsbH07XG4gICAgfVxuICAgIGxldCBuYW1lXzE2MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiBuYW1lXzE2MH0pLCBiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzE2MH0pfTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHIsIGluRGVmYXVsdCwgYWxsb3dHZW5lcmF0b3J9KSB7XG4gICAgbGV0IG5hbWVfMTYxID0gbnVsbCwgcGFyYW1zXzE2MiwgYm9keV8xNjMsIHJlc3RfMTY0O1xuICAgIGxldCBpc0dlbmVyYXRvcl8xNjUgPSBmYWxzZTtcbiAgICBsZXQgZm5LZXl3b3JkXzE2NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTY3ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHR5cGVfMTY4ID0gaXNFeHByID8gXCJGdW5jdGlvbkV4cHJlc3Npb25cIiA6IFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTY3LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE2NSA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZF8xNjcgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNjcpKSB7XG4gICAgICBuYW1lXzE2MSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICBuYW1lXzE2MSA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIipkZWZhdWx0KlwiLCBmbktleXdvcmRfMTY2KX0pO1xuICAgIH1cbiAgICBwYXJhbXNfMTYyID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTYzID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE2OSA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xNjIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE3MCA9IGVuZl8xNjkuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTY4LCB7bmFtZTogbmFtZV8xNjEsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xNjUsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE3MCwgYm9keTogYm9keV8xNjN9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbmFtZV8xNzEgPSBudWxsLCBwYXJhbXNfMTcyLCBib2R5XzE3MywgcmVzdF8xNzQ7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE3NSA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTc2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNzYsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTc1ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE3NiA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE3NikpIHtcbiAgICAgIG5hbWVfMTcxID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHBhcmFtc18xNzIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xNzMgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTc3ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE3MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTc4ID0gZW5mXzE3Ny5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMTcxLCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTc1LCBwYXJhbXM6IGZvcm1hbFBhcmFtc18xNzgsIGJvZHk6IGJvZHlfMTczfSk7XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCkge1xuICAgIGxldCBuYW1lXzE3OSwgcGFyYW1zXzE4MCwgYm9keV8xODEsIHJlc3RfMTgyO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xODMgPSBmYWxzZTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzE4NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTg0LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE4MyA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgbmFtZV8xNzkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICBwYXJhbXNfMTgwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTgxID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE4NSA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xODAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE4NiA9IGVuZl8xODUuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiLCB7bmFtZTogbmFtZV8xNzksIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xODMsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE4NiwgYm9keTogYm9keV8xODF9KTtcbiAgfVxuICBlbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKSB7XG4gICAgbGV0IGl0ZW1zXzE4NyA9IFtdO1xuICAgIGxldCByZXN0XzE4OCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIi4uLlwiKTtcbiAgICAgICAgcmVzdF8xODggPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpdGVtc18xODcucHVzaCh0aGlzLmVuZm9yZXN0UGFyYW0oKSk7XG4gICAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogTGlzdChpdGVtc18xODcpLCByZXN0OiByZXN0XzE4OH0pO1xuICB9XG4gIGVuZm9yZXN0UGFyYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICB9XG4gIGVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMTg5ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogZmFsc2UsIG9wZXJhdG9yOiBvcGVyYXRvcl8xODkudmFsKCksIG9wZXJhbmQ6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0aGlzLnRlcm0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9wZXJhdG9yXzE5MCA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICB0aGlzLm9wQ3R4LnByZWMgPSAxNDtcbiAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm0gPT4ge1xuICAgICAgbGV0IHR5cGVfMTkxLCB0ZXJtXzE5MiwgaXNQcmVmaXhfMTkzO1xuICAgICAgaWYgKG9wZXJhdG9yXzE5MC52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzE5MC52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMTkxID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMTkyID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybSk7XG4gICAgICAgIGlzUHJlZml4XzE5MyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlXzE5MSA9IFwiVW5hcnlFeHByZXNzaW9uXCI7XG4gICAgICAgIGlzUHJlZml4XzE5MyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGVybV8xOTIgPSByaWdodFRlcm07XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xOTEsIHtvcGVyYXRvcjogb3BlcmF0b3JfMTkwLnZhbCgpLCBvcGVyYW5kOiB0ZXJtXzE5MiwgaXNQcmVmaXg6IGlzUHJlZml4XzE5M30pO1xuICAgIH07XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl8yMztcbiAgfVxuICBlbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgdGVzdF8xOTQgPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICBpZiAodGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI/XCIpO1xuICAgIGxldCBlbmZfMTk1ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGNvbnNlcXVlbnRfMTk2ID0gZW5mXzE5NS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgZW5mXzE5NS5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGVuZl8xOTUgPSBuZXcgRW5mb3Jlc3RlcihlbmZfMTk1LnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYWx0ZXJuYXRlXzE5NyA9IGVuZl8xOTUuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIHRoaXMucmVzdCA9IGVuZl8xOTUucmVzdDtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRlc3RfMTk0LCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzE5NiwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfMTk3fSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0VGVybV8xOTggPSB0aGlzLnRlcm07XG4gICAgbGV0IG9wU3R4XzE5OSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBvcF8yMDAgPSBvcFN0eF8xOTkudmFsKCk7XG4gICAgbGV0IG9wUHJlY18yMDEgPSBnZXRPcGVyYXRvclByZWMob3BfMjAwKTtcbiAgICBsZXQgb3BBc3NvY18yMDIgPSBnZXRPcGVyYXRvckFzc29jKG9wXzIwMCk7XG4gICAgaWYgKG9wZXJhdG9yTHQodGhpcy5vcEN0eC5wcmVjLCBvcFByZWNfMjAxLCBvcEFzc29jXzIwMikpIHtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe3ByZWM6IHRoaXMub3BDdHgucHJlYywgY29tYmluZTogdGhpcy5vcEN0eC5jb21iaW5lfSk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBvcFByZWNfMjAxO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gcmlnaHRUZXJtID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMTk4LCBvcGVyYXRvcjogb3BTdHhfMTk5LCByaWdodDogcmlnaHRUZXJtfSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzIzO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMub3BDdHguY29tYmluZShsZWZ0VGVybV8xOTgpO1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgIHJldHVybiB0ZXJtO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMDMgPSB0aGlzLm1hdGNoVGVtcGxhdGUoKTtcbiAgICBsZXQgZWxlbWVudHNfMjA0ID0gbG9va2FoZWFkXzIwMy50b2tlbi5pdGVtcy5tYXAoaXQgPT4ge1xuICAgICAgaWYgKGl0IGluc3RhbmNlb2YgU3ludGF4ICYmIGl0LmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKGl0LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBpdC5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzIwNDtcbiAgfVxuICBleHBhbmRNYWNybyhlbmZvcmVzdFR5cGVfMjA1KSB7XG4gICAgbGV0IG5hbWVfMjA2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHN5bnRheFRyYW5zZm9ybV8yMDcgPSB0aGlzLmdldENvbXBpbGV0aW1lVHJhbnNmb3JtKG5hbWVfMjA2KTtcbiAgICBpZiAoc3ludGF4VHJhbnNmb3JtXzIwNyA9PSBudWxsIHx8IHR5cGVvZiBzeW50YXhUcmFuc2Zvcm1fMjA3LnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMDYsIFwidGhlIG1hY3JvIG5hbWUgd2FzIG5vdCBib3VuZCB0byBhIHZhbHVlIHRoYXQgY291bGQgYmUgaW52b2tlZFwiKTtcbiAgICB9XG4gICAgbGV0IHVzZVNpdGVTY29wZV8yMDggPSBmcmVzaFNjb3BlKFwidVwiKTtcbiAgICBsZXQgaW50cm9kdWNlZFNjb3BlXzIwOSA9IGZyZXNoU2NvcGUoXCJpXCIpO1xuICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZV8yMDg7XG4gICAgbGV0IGN0eF8yMTAgPSBuZXcgTWFjcm9Db250ZXh0KHRoaXMsIG5hbWVfMjA2LCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZV8yMDgsIGludHJvZHVjZWRTY29wZV8yMDkpO1xuICAgIGxldCByZXN1bHRfMjExID0gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhzeW50YXhUcmFuc2Zvcm1fMjA3LnZhbHVlLmNhbGwobnVsbCwgY3R4XzIxMCkpO1xuICAgIGlmICghTGlzdC5pc0xpc3QocmVzdWx0XzIxMSkpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMDYsIFwibWFjcm8gbXVzdCByZXR1cm4gYSBsaXN0IGJ1dCBnb3Q6IFwiICsgcmVzdWx0XzIxMSk7XG4gICAgfVxuICAgIHJlc3VsdF8yMTEgPSByZXN1bHRfMjExLm1hcChzdHggPT4ge1xuICAgICAgaWYgKCEoc3R4ICYmIHR5cGVvZiBzdHguYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIwNiwgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R4LmFkZFNjb3BlKGludHJvZHVjZWRTY29wZV8yMDksIHRoaXMuY29udGV4dC5iaW5kaW5ncywge2ZsaXA6IHRydWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0XzIxMTtcbiAgfVxuICBjb25zdW1lU2VtaWNvbG9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjEyID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMTIgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIxMiwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgY29uc3VtZUNvbW1hKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjEzID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMTMgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIxMywgXCIsXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgaXNUZXJtKHRlcm1fMjE0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjE0ICYmIHRlcm1fMjE0IGluc3RhbmNlb2YgVGVybTtcbiAgfVxuICBpc0VPRih0ZXJtXzIxNSkge1xuICAgIHJldHVybiB0ZXJtXzIxNSAmJiB0ZXJtXzIxNSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIxNS5pc0VPRigpO1xuICB9XG4gIGlzSWRlbnRpZmllcih0ZXJtXzIxNiwgdmFsXzIxNyA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yMTYgJiYgdGVybV8yMTYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMTYuaXNJZGVudGlmaWVyKCkgJiYgKHZhbF8yMTcgPT09IG51bGwgfHwgdGVybV8yMTYudmFsKCkgPT09IHZhbF8yMTcpO1xuICB9XG4gIGlzUHJvcGVydHlOYW1lKHRlcm1fMjE4KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGlmaWVyKHRlcm1fMjE4KSB8fCB0aGlzLmlzS2V5d29yZCh0ZXJtXzIxOCkgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKHRlcm1fMjE4KSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzIxOCkgfHwgdGhpcy5pc0JyYWNrZXRzKHRlcm1fMjE4KTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHRlcm1fMjE5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjE5ICYmIHRlcm1fMjE5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjE5LmlzTnVtZXJpY0xpdGVyYWwoKTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodGVybV8yMjApIHtcbiAgICByZXR1cm4gdGVybV8yMjAgJiYgdGVybV8yMjAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjAuaXNTdHJpbmdMaXRlcmFsKCk7XG4gIH1cbiAgaXNUZW1wbGF0ZSh0ZXJtXzIyMSkge1xuICAgIHJldHVybiB0ZXJtXzIyMSAmJiB0ZXJtXzIyMSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyMS5pc1RlbXBsYXRlKCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh0ZXJtXzIyMikge1xuICAgIHJldHVybiB0ZXJtXzIyMiAmJiB0ZXJtXzIyMiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyMi5pc0Jvb2xlYW5MaXRlcmFsKCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh0ZXJtXzIyMykge1xuICAgIHJldHVybiB0ZXJtXzIyMyAmJiB0ZXJtXzIyMyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyMy5pc051bGxMaXRlcmFsKCk7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih0ZXJtXzIyNCkge1xuICAgIHJldHVybiB0ZXJtXzIyNCAmJiB0ZXJtXzIyNCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyNC5pc1JlZ3VsYXJFeHByZXNzaW9uKCk7XG4gIH1cbiAgaXNQYXJlbnModGVybV8yMjUpIHtcbiAgICByZXR1cm4gdGVybV8yMjUgJiYgdGVybV8yMjUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjUuaXNQYXJlbnMoKTtcbiAgfVxuICBpc0JyYWNlcyh0ZXJtXzIyNikge1xuICAgIHJldHVybiB0ZXJtXzIyNiAmJiB0ZXJtXzIyNiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyNi5pc0JyYWNlcygpO1xuICB9XG4gIGlzQnJhY2tldHModGVybV8yMjcpIHtcbiAgICByZXR1cm4gdGVybV8yMjcgJiYgdGVybV8yMjcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjcuaXNCcmFja2V0cygpO1xuICB9XG4gIGlzQXNzaWduKHRlcm1fMjI4KSB7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRlcm1fMjI4KSkge1xuICAgICAgc3dpdGNoICh0ZXJtXzIyOC52YWwoKSkge1xuICAgICAgICBjYXNlIFwiPVwiOlxuICAgICAgICBjYXNlIFwifD1cIjpcbiAgICAgICAgY2FzZSBcIl49XCI6XG4gICAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgICBjYXNlIFwiPDw9XCI6XG4gICAgICAgIGNhc2UgXCI+Pj1cIjpcbiAgICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgICAgY2FzZSBcIis9XCI6XG4gICAgICAgIGNhc2UgXCItPVwiOlxuICAgICAgICBjYXNlIFwiKj1cIjpcbiAgICAgICAgY2FzZSBcIi89XCI6XG4gICAgICAgIGNhc2UgXCIlPVwiOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlzS2V5d29yZCh0ZXJtXzIyOSwgdmFsXzIzMCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yMjkgJiYgdGVybV8yMjkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjkuaXNLZXl3b3JkKCkgJiYgKHZhbF8yMzAgPT09IG51bGwgfHwgdGVybV8yMjkudmFsKCkgPT09IHZhbF8yMzApO1xuICB9XG4gIGlzUHVuY3R1YXRvcih0ZXJtXzIzMSwgdmFsXzIzMiA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yMzEgJiYgdGVybV8yMzEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzEuaXNQdW5jdHVhdG9yKCkgJiYgKHZhbF8yMzIgPT09IG51bGwgfHwgdGVybV8yMzEudmFsKCkgPT09IHZhbF8yMzIpO1xuICB9XG4gIGlzT3BlcmF0b3IodGVybV8yMzMpIHtcbiAgICByZXR1cm4gdGVybV8yMzMgJiYgdGVybV8yMzMgaW5zdGFuY2VvZiBTeW50YXggJiYgaXNPcGVyYXRvcih0ZXJtXzIzMyk7XG4gIH1cbiAgaXNVcGRhdGVPcGVyYXRvcih0ZXJtXzIzNCkge1xuICAgIHJldHVybiB0ZXJtXzIzNCAmJiB0ZXJtXzIzNCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNC5pc1B1bmN0dWF0b3IoKSAmJiAodGVybV8yMzQudmFsKCkgPT09IFwiKytcIiB8fCB0ZXJtXzIzNC52YWwoKSA9PT0gXCItLVwiKTtcbiAgfVxuICBpc0ZuRGVjbFRyYW5zZm9ybSh0ZXJtXzIzNSkge1xuICAgIHJldHVybiB0ZXJtXzIzNSAmJiB0ZXJtXzIzNSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzIzNS5yZXNvbHZlKCkpID09PSBGdW5jdGlvbkRlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNWYXJEZWNsVHJhbnNmb3JtKHRlcm1fMjM2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM2ICYmIHRlcm1fMjM2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjM2LnJlc29sdmUoKSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0xldERlY2xUcmFuc2Zvcm0odGVybV8yMzcpIHtcbiAgICByZXR1cm4gdGVybV8yMzcgJiYgdGVybV8yMzcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yMzcucmVzb2x2ZSgpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0NvbnN0RGVjbFRyYW5zZm9ybSh0ZXJtXzIzOCkge1xuICAgIHJldHVybiB0ZXJtXzIzOCAmJiB0ZXJtXzIzOCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzIzOC5yZXNvbHZlKCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhEZWNsVHJhbnNmb3JtKHRlcm1fMjM5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM5ICYmIHRlcm1fMjM5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjM5LnJlc29sdmUoKSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKHRlcm1fMjQwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjQwICYmIHRlcm1fMjQwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQwLnJlc29sdmUoKSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSh0ZXJtXzI0MSkge1xuICAgIHJldHVybiB0ZXJtXzI0MSAmJiB0ZXJtXzI0MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0MS5pc1N5bnRheFRlbXBsYXRlKCk7XG4gIH1cbiAgaXNTeW50YXhRdW90ZVRyYW5zZm9ybSh0ZXJtXzI0Mikge1xuICAgIHJldHVybiB0ZXJtXzI0MiAmJiB0ZXJtXzI0MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI0Mi5yZXNvbHZlKCkpID09PSBTeW50YXhRdW90ZVRyYW5zZm9ybTtcbiAgfVxuICBpc1JldHVyblN0bXRUcmFuc2Zvcm0odGVybV8yNDMpIHtcbiAgICByZXR1cm4gdGVybV8yNDMgJiYgdGVybV8yNDMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDMucmVzb2x2ZSgpKSA9PT0gUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtO1xuICB9XG4gIGlzV2hpbGVUcmFuc2Zvcm0odGVybV8yNDQpIHtcbiAgICByZXR1cm4gdGVybV8yNDQgJiYgdGVybV8yNDQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDQucmVzb2x2ZSgpKSA9PT0gV2hpbGVUcmFuc2Zvcm07XG4gIH1cbiAgaXNGb3JUcmFuc2Zvcm0odGVybV8yNDUpIHtcbiAgICByZXR1cm4gdGVybV8yNDUgJiYgdGVybV8yNDUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDUucmVzb2x2ZSgpKSA9PT0gRm9yVHJhbnNmb3JtO1xuICB9XG4gIGlzU3dpdGNoVHJhbnNmb3JtKHRlcm1fMjQ2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ2ICYmIHRlcm1fMjQ2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ2LnJlc29sdmUoKSkgPT09IFN3aXRjaFRyYW5zZm9ybTtcbiAgfVxuICBpc0JyZWFrVHJhbnNmb3JtKHRlcm1fMjQ3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ3ICYmIHRlcm1fMjQ3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ3LnJlc29sdmUoKSkgPT09IEJyZWFrVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29udGludWVUcmFuc2Zvcm0odGVybV8yNDgpIHtcbiAgICByZXR1cm4gdGVybV8yNDggJiYgdGVybV8yNDggaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDgucmVzb2x2ZSgpKSA9PT0gQ29udGludWVUcmFuc2Zvcm07XG4gIH1cbiAgaXNEb1RyYW5zZm9ybSh0ZXJtXzI0OSkge1xuICAgIHJldHVybiB0ZXJtXzI0OSAmJiB0ZXJtXzI0OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI0OS5yZXNvbHZlKCkpID09PSBEb1RyYW5zZm9ybTtcbiAgfVxuICBpc0RlYnVnZ2VyVHJhbnNmb3JtKHRlcm1fMjUwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUwICYmIHRlcm1fMjUwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUwLnJlc29sdmUoKSkgPT09IERlYnVnZ2VyVHJhbnNmb3JtO1xuICB9XG4gIGlzV2l0aFRyYW5zZm9ybSh0ZXJtXzI1MSkge1xuICAgIHJldHVybiB0ZXJtXzI1MSAmJiB0ZXJtXzI1MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1MS5yZXNvbHZlKCkpID09PSBXaXRoVHJhbnNmb3JtO1xuICB9XG4gIGlzVHJ5VHJhbnNmb3JtKHRlcm1fMjUyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUyICYmIHRlcm1fMjUyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUyLnJlc29sdmUoKSkgPT09IFRyeVRyYW5zZm9ybTtcbiAgfVxuICBpc1Rocm93VHJhbnNmb3JtKHRlcm1fMjUzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUzICYmIHRlcm1fMjUzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUzLnJlc29sdmUoKSkgPT09IFRocm93VHJhbnNmb3JtO1xuICB9XG4gIGlzSWZUcmFuc2Zvcm0odGVybV8yNTQpIHtcbiAgICByZXR1cm4gdGVybV8yNTQgJiYgdGVybV8yNTQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTQucmVzb2x2ZSgpKSA9PT0gSWZUcmFuc2Zvcm07XG4gIH1cbiAgaXNOZXdUcmFuc2Zvcm0odGVybV8yNTUpIHtcbiAgICByZXR1cm4gdGVybV8yNTUgJiYgdGVybV8yNTUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTUucmVzb2x2ZSgpKSA9PT0gTmV3VHJhbnNmb3JtO1xuICB9XG4gIGlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNTYpIHtcbiAgICByZXR1cm4gdGVybV8yNTYgJiYgdGVybV8yNTYgaW5zdGFuY2VvZiBTeW50YXggJiYgKHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU2LnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSB8fCB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjU2LnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSk7XG4gIH1cbiAgZ2V0Q29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNTcpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LmVudi5oYXModGVybV8yNTcucmVzb2x2ZSgpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU3LnJlc29sdmUoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjU3LnJlc29sdmUoKSk7XG4gIH1cbiAgbGluZU51bWJlckVxKGFfMjU4LCBiXzI1OSkge1xuICAgIGlmICghKGFfMjU4ICYmIGJfMjU5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhc3NlcnQoYV8yNTggaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICBhc3NlcnQoYl8yNTkgaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICByZXR1cm4gYV8yNTgubGluZU51bWJlcigpID09PSBiXzI1OS5saW5lTnVtYmVyKCk7XG4gIH1cbiAgbWF0Y2hJZGVudGlmaWVyKHZhbF8yNjApIHtcbiAgICBsZXQgbG9va2FoZWFkXzI2MSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMjYxKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNjE7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI2MSwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBtYXRjaEtleXdvcmQodmFsXzI2Mikge1xuICAgIGxldCBsb29rYWhlYWRfMjYzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8yNjMsIHZhbF8yNjIpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI2MztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjYzLCBcImV4cGVjdGluZyBcIiArIHZhbF8yNjIpO1xuICB9XG4gIG1hdGNoTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI2NCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzI2NCkgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzI2NCkgfHwgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8yNjQpIHx8IHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMjY0KSB8fCB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzI2NCkgfHwgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8yNjQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI2NDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjY0LCBcImV4cGVjdGluZyBhIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hTdHJpbmdMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjY1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yNjUpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI2NTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjY1LCBcImV4cGVjdGluZyBhIHN0cmluZyBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoVGVtcGxhdGUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNjYgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yNjYpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI2NjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjY2LCBcImV4cGVjdGluZyBhIHRlbXBsYXRlIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hQYXJlbnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNjcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjY3KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNjcuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjY3LCBcImV4cGVjdGluZyBwYXJlbnNcIik7XG4gIH1cbiAgbWF0Y2hDdXJsaWVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjY4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzI2OCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjY4LmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI2OCwgXCJleHBlY3RpbmcgY3VybHkgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoU3F1YXJlcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI2OSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzI2OSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjY5LmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI2OSwgXCJleHBlY3Rpbmcgc3FhdXJlIGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFVuYXJ5T3BlcmF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNVbmFyeU9wZXJhdG9yKGxvb2thaGVhZF8yNzApKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3MDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjcwLCBcImV4cGVjdGluZyBhIHVuYXJ5IG9wZXJhdG9yXCIpO1xuICB9XG4gIG1hdGNoUHVuY3R1YXRvcih2YWxfMjcxKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzI3MikpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsXzI3MSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAobG9va2FoZWFkXzI3Mi52YWwoKSA9PT0gdmFsXzI3MSkge1xuICAgICAgICAgIHJldHVybiBsb29rYWhlYWRfMjcyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3MiwgXCJleHBlY3RpbmcgYSBcIiArIHZhbF8yNzEgKyBcIiBwdW5jdHVhdG9yXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3MjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjcyLCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgY3JlYXRlRXJyb3Ioc3R4XzI3MywgbWVzc2FnZV8yNzQpIHtcbiAgICBsZXQgY3R4XzI3NSA9IFwiXCI7XG4gICAgbGV0IG9mZmVuZGluZ18yNzYgPSBzdHhfMjczO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGN0eF8yNzUgPSB0aGlzLnJlc3Quc2xpY2UoMCwgMjApLm1hcCh0ZXJtID0+IHtcbiAgICAgICAgaWYgKHRlcm0uaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiB0ZXJtLmlubmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExpc3Qub2YodGVybSk7XG4gICAgICB9KS5mbGF0dGVuKCkubWFwKHMgPT4ge1xuICAgICAgICBpZiAocyA9PT0gb2ZmZW5kaW5nXzI3Nikge1xuICAgICAgICAgIHJldHVybiBcIl9fXCIgKyBzLnZhbCgpICsgXCJfX1wiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzLnZhbCgpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eF8yNzUgPSBvZmZlbmRpbmdfMjc2LnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZV8yNzQgKyBcIlxcblwiICsgY3R4XzI3NSk7XG4gIH1cbn1cbiJdfQ==