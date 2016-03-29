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
      var lookahead_111 = this.peek();
      if (this.isIdentifier(lookahead_111) || this.isKeyword(lookahead_111)) {
        return this.enforestBindingIdentifier();
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
      return new _terms2.default("BindingIdentifier", { name: this.enforestIdentifier() });
    }
  }, {
    key: "enforestIdentifier",
    value: function enforestIdentifier() {
      var lookahead_120 = this.peek();
      if (this.isIdentifier(lookahead_120) || this.isKeyword(lookahead_120)) {
        return this.advance();
      }
      throw this.createError(lookahead_120, "expecting an identifier");
    }
  }, {
    key: "enforestReturnStatement",
    value: function enforestReturnStatement() {
      var kw_121 = this.advance();
      var lookahead_122 = this.peek();
      if (this.rest.size === 0 || lookahead_122 && !this.lineNumberEq(kw_121, lookahead_122)) {
        return new _terms2.default("ReturnStatement", { expression: null });
      }
      var term_123 = null;
      if (!this.isPunctuator(lookahead_122, ";")) {
        term_123 = this.enforestExpression();
        (0, _errors.expect)(term_123 != null, "Expecting an expression to follow return keyword", lookahead_122, this.rest);
      }
      this.consumeSemicolon();
      return new _terms2.default("ReturnStatement", { expression: term_123 });
    }
  }, {
    key: "enforestVariableDeclaration",
    value: function enforestVariableDeclaration() {
      var kind_124 = void 0;
      var lookahead_125 = this.advance();
      var kindSyn_126 = lookahead_125;
      if (kindSyn_126 && this.context.env.get(kindSyn_126.resolve()) === _transforms.VariableDeclTransform) {
        kind_124 = "var";
      } else if (kindSyn_126 && this.context.env.get(kindSyn_126.resolve()) === _transforms.LetDeclTransform) {
        kind_124 = "let";
      } else if (kindSyn_126 && this.context.env.get(kindSyn_126.resolve()) === _transforms.ConstDeclTransform) {
        kind_124 = "const";
      } else if (kindSyn_126 && this.context.env.get(kindSyn_126.resolve()) === _transforms.SyntaxDeclTransform) {
        kind_124 = "syntax";
      } else if (kindSyn_126 && this.context.env.get(kindSyn_126.resolve()) === _transforms.SyntaxrecDeclTransform) {
        kind_124 = "syntaxrec";
      }
      var decls_127 = (0, _immutable.List)();
      while (true) {
        var term = this.enforestVariableDeclarator();
        var _lookahead_ = this.peek();
        decls_127 = decls_127.concat(term);
        if (this.isPunctuator(_lookahead_, ",")) {
          this.advance();
        } else {
          break;
        }
      }
      return new _terms2.default("VariableDeclaration", { kind: kind_124, declarators: decls_127 });
    }
  }, {
    key: "enforestVariableDeclarator",
    value: function enforestVariableDeclarator() {
      var id_128 = this.enforestBindingTarget();
      var lookahead_129 = this.peek();
      var init_130 = void 0,
          rest_131 = void 0;
      if (this.isPunctuator(lookahead_129, "=")) {
        this.advance();
        var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        init_130 = enf.enforest("expression");
        this.rest = enf.rest;
      } else {
        init_130 = null;
      }
      return new _terms2.default("VariableDeclarator", { binding: id_128, init: init_130 });
    }
  }, {
    key: "enforestExpressionStatement",
    value: function enforestExpressionStatement() {
      var start_132 = this.rest.get(0);
      var expr_133 = this.enforestExpression();
      if (expr_133 === null) {
        throw this.createError(start_132, "not a valid expression");
      }
      this.consumeSemicolon();
      return new _terms2.default("ExpressionStatement", { expression: expr_133 });
    }
  }, {
    key: "enforestExpression",
    value: function enforestExpression() {
      var left_134 = this.enforestExpressionLoop();
      var lookahead_135 = this.peek();
      if (this.isPunctuator(lookahead_135, ",")) {
        while (this.rest.size !== 0) {
          if (!this.isPunctuator(this.peek(), ",")) {
            break;
          }
          var operator = this.advance();
          var right = this.enforestExpressionLoop();
          left_134 = new _terms2.default("BinaryExpression", { left: left_134, operator: operator, right: right });
        }
      }
      this.term = null;
      return left_134;
    }
  }, {
    key: "enforestExpressionLoop",
    value: function enforestExpressionLoop() {
      this.term = null;
      this.opCtx = { prec: 0, combine: function combine(x_136) {
          return x_136;
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
      var lookahead_137 = this.peek();
      if (this.term === null && this.isTerm(lookahead_137)) {
        return this.advance();
      }
      if (this.term === null && this.isCompiletimeTransform(lookahead_137)) {
        var result = this.expandMacro();
        this.rest = result.concat(this.rest);
        return EXPR_LOOP_EXPANSION_28;
      }
      if (this.term === null && this.isKeyword(lookahead_137, "yield")) {
        return this.enforestYieldExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_137, "class")) {
        return this.enforestClass({ isExpr: true });
      }
      if (this.term === null && this.isKeyword(lookahead_137, "super")) {
        this.advance();
        return new _terms2.default("Super", {});
      }
      if (this.term === null && (this.isIdentifier(lookahead_137) || this.isParens(lookahead_137)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_137, this.peek(1))) {
        return this.enforestArrowExpression();
      }
      if (this.term === null && this.isSyntaxTemplate(lookahead_137)) {
        return this.enforestSyntaxTemplate();
      }
      if (this.term === null && this.isSyntaxQuoteTransform(lookahead_137)) {
        return this.enforestSyntaxQuote();
      }
      if (this.term === null && this.isNewTransform(lookahead_137)) {
        return this.enforestNewExpression();
      }
      if (this.term === null && this.isKeyword(lookahead_137, "this")) {
        return new _terms2.default("ThisExpression", { stx: this.advance() });
      }
      if (this.term === null && (this.isIdentifier(lookahead_137) || this.isKeyword(lookahead_137, "let") || this.isKeyword(lookahead_137, "yield"))) {
        return new _terms2.default("IdentifierExpression", { name: this.advance() });
      }
      if (this.term === null && this.isNumericLiteral(lookahead_137)) {
        var num = this.advance();
        if (num.val() === 1 / 0) {
          return new _terms2.default("LiteralInfinityExpression", {});
        }
        return new _terms2.default("LiteralNumericExpression", { value: num });
      }
      if (this.term === null && this.isStringLiteral(lookahead_137)) {
        return new _terms2.default("LiteralStringExpression", { value: this.advance() });
      }
      if (this.term === null && this.isTemplate(lookahead_137)) {
        return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
      }
      if (this.term === null && this.isBooleanLiteral(lookahead_137)) {
        return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
      }
      if (this.term === null && this.isNullLiteral(lookahead_137)) {
        this.advance();
        return new _terms2.default("LiteralNullExpression", {});
      }
      if (this.term === null && this.isRegularExpression(lookahead_137)) {
        var reStx = this.advance();
        var lastSlash = reStx.token.value.lastIndexOf("/");
        var pattern = reStx.token.value.slice(1, lastSlash);
        var flags = reStx.token.value.slice(lastSlash + 1);
        return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
      }
      if (this.term === null && this.isParens(lookahead_137)) {
        return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
      }
      if (this.term === null && this.isFnDeclTransform(lookahead_137)) {
        return this.enforestFunctionExpression();
      }
      if (this.term === null && this.isBraces(lookahead_137)) {
        return this.enforestObjectExpression();
      }
      if (this.term === null && this.isBrackets(lookahead_137)) {
        return this.enforestArrayExpression();
      }
      if (this.term === null && this.isOperator(lookahead_137)) {
        return this.enforestUnaryExpression();
      }
      if (this.term && this.isUpdateOperator(lookahead_137)) {
        return this.enforestUpdateExpression();
      }
      if (this.term && this.isOperator(lookahead_137)) {
        return this.enforestBinaryExpression();
      }
      if (this.term && this.isPunctuator(lookahead_137, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        return this.enforestStaticMemberExpression();
      }
      if (this.term && this.isBrackets(lookahead_137)) {
        return this.enforestComputedMemberExpression();
      }
      if (this.term && this.isParens(lookahead_137)) {
        var paren = this.advance();
        return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
      }
      if (this.term && this.isTemplate(lookahead_137)) {
        return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
      }
      if (this.term && this.isAssign(lookahead_137)) {
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
      if (this.term && this.isPunctuator(lookahead_137, "?")) {
        return this.enforestConditionalExpression();
      }
      return EXPR_LOOP_NO_CHANGE_27;
    }
  }, {
    key: "enforestArgumentList",
    value: function enforestArgumentList() {
      var result_138 = [];
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
        result_138.push(arg);
      }
      return (0, _immutable.List)(result_138);
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword("new");
      var callee_139 = void 0;
      if (this.isKeyword(this.peek(), "new")) {
        callee_139 = this.enforestNewExpression();
      } else if (this.isKeyword(this.peek(), "super")) {
        callee_139 = this.enforestExpressionLoop();
      } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
        this.advance();
        this.advance();
        return new _terms2.default("NewTargetExpression", {});
      } else {
        callee_139 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
      }
      var args_140 = void 0;
      if (this.isParens(this.peek())) {
        args_140 = this.matchParens();
      } else {
        args_140 = (0, _immutable.List)();
      }
      return new _terms2.default("NewExpression", { callee: callee_139, arguments: args_140 });
    }
  }, {
    key: "enforestComputedMemberExpression",
    value: function enforestComputedMemberExpression() {
      var enf_141 = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
      return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_141.enforestExpression() });
    }
  }, {
    key: "transformDestructuring",
    value: function transformDestructuring(term_142) {
      var _this = this;

      switch (term_142.type) {
        case "IdentifierExpression":
          return new _terms2.default("BindingIdentifier", { name: term_142.name });
        case "ParenthesizedExpression":
          if (term_142.inner.size === 1 && this.isIdentifier(term_142.inner.get(0))) {
            return new _terms2.default("BindingIdentifier", { name: term_142.inner.get(0) });
          }
        case "DataProperty":
          return new _terms2.default("BindingPropertyProperty", { name: term_142.name, binding: this.transformDestructuringWithDefault(term_142.expression) });
        case "ShorthandProperty":
          return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_142.name }), init: null });
        case "ObjectExpression":
          return new _terms2.default("ObjectBinding", { properties: term_142.properties.map(function (t_143) {
              return _this.transformDestructuring(t_143);
            }) });
        case "ArrayExpression":
          var last = term_142.elements.last();
          if (last != null && last.type === "SpreadElement") {
            return new _terms2.default("ArrayBinding", { elements: term_142.elements.slice(0, -1).map(function (t_144) {
                return t_144 && _this.transformDestructuringWithDefault(t_144);
              }), restElement: this.transformDestructuringWithDefault(last.expression) });
          } else {
            return new _terms2.default("ArrayBinding", { elements: term_142.elements.map(function (t_145) {
                return t_145 && _this.transformDestructuringWithDefault(t_145);
              }), restElement: null });
          }
          return new _terms2.default("ArrayBinding", { elements: term_142.elements.map(function (t_146) {
              return t_146 && _this.transformDestructuring(t_146);
            }), restElement: null });
        case "StaticPropertyName":
          return new _terms2.default("BindingIdentifier", { name: term_142.value });
        case "ComputedMemberExpression":
        case "StaticMemberExpression":
        case "ArrayBinding":
        case "BindingIdentifier":
        case "BindingPropertyIdentifier":
        case "BindingPropertyProperty":
        case "BindingWithDefault":
        case "ObjectBinding":
          return term_142;
      }
      (0, _errors.assert)(false, "not implemented yet for " + term_142.type);
    }
  }, {
    key: "transformDestructuringWithDefault",
    value: function transformDestructuringWithDefault(term_147) {
      switch (term_147.type) {
        case "AssignmentExpression":
          return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_147.binding), init: term_147.expression });
      }
      return this.transformDestructuring(term_147);
    }
  }, {
    key: "enforestArrowExpression",
    value: function enforestArrowExpression() {
      var enf_148 = void 0;
      if (this.isIdentifier(this.peek())) {
        enf_148 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf_148 = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params_149 = enf_148.enforestFormalParameters();
      this.matchPunctuator("=>");
      var body_150 = void 0;
      if (this.isBraces(this.peek())) {
        body_150 = this.matchCurlies();
      } else {
        enf_148 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
        body_150 = enf_148.enforestExpressionLoop();
        this.rest = enf_148.rest;
      }
      return new _terms2.default("ArrowExpression", { params: params_149, body: body_150 });
    }
  }, {
    key: "enforestYieldExpression",
    value: function enforestYieldExpression() {
      var kwd_151 = this.matchKeyword("yield");
      var lookahead_152 = this.peek();
      if (this.rest.size === 0 || lookahead_152 && !this.lineNumberEq(kwd_151, lookahead_152)) {
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
      var name_153 = this.advance();
      return new _terms2.default("SyntaxQuote", { name: name_153, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_153 }), elements: this.enforestTemplateElements() }) });
    }
  }, {
    key: "enforestStaticMemberExpression",
    value: function enforestStaticMemberExpression() {
      var object_154 = this.term;
      var dot_155 = this.advance();
      var property_156 = this.advance();
      return new _terms2.default("StaticMemberExpression", { object: object_154, property: property_156 });
    }
  }, {
    key: "enforestArrayExpression",
    value: function enforestArrayExpression() {
      var arr_157 = this.advance();
      var elements_158 = [];
      var enf_159 = new Enforester(arr_157.inner(), (0, _immutable.List)(), this.context);
      while (enf_159.rest.size > 0) {
        var lookahead = enf_159.peek();
        if (enf_159.isPunctuator(lookahead, ",")) {
          enf_159.advance();
          elements_158.push(null);
        } else if (enf_159.isPunctuator(lookahead, "...")) {
          enf_159.advance();
          var expression = enf_159.enforestExpressionLoop();
          if (expression == null) {
            throw enf_159.createError(lookahead, "expecting expression");
          }
          elements_158.push(new _terms2.default("SpreadElement", { expression: expression }));
        } else {
          var term = enf_159.enforestExpressionLoop();
          if (term == null) {
            throw enf_159.createError(lookahead, "expected expression");
          }
          elements_158.push(term);
          enf_159.consumeComma();
        }
      }
      return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_158) });
    }
  }, {
    key: "enforestObjectExpression",
    value: function enforestObjectExpression() {
      var obj_160 = this.advance();
      var properties_161 = (0, _immutable.List)();
      var enf_162 = new Enforester(obj_160.inner(), (0, _immutable.List)(), this.context);
      var lastProp_163 = null;
      while (enf_162.rest.size > 0) {
        var prop = enf_162.enforestPropertyDefinition();
        enf_162.consumeComma();
        properties_161 = properties_161.concat(prop);
        if (lastProp_163 === prop) {
          throw enf_162.createError(prop, "invalid syntax in object");
        }
        lastProp_163 = prop;
      }
      return new _terms2.default("ObjectExpression", { properties: properties_161 });
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
      var expr_164 = this.enforestExpressionLoop();
      return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_164 });
    }
  }, {
    key: "enforestMethodDefinition",
    value: function enforestMethodDefinition() {
      var lookahead_165 = this.peek();
      var isGenerator_166 = false;
      if (this.isPunctuator(lookahead_165, "*")) {
        isGenerator_166 = true;
        this.advance();
      }
      if (this.isIdentifier(lookahead_165, "get") && this.isPropertyName(this.peek(1))) {
        this.advance();

        var _enforestPropertyName2 = this.enforestPropertyName();

        var _name = _enforestPropertyName2.name;

        this.matchParens();
        var body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Getter", { name: _name, body: body }), kind: "method" };
      } else if (this.isIdentifier(lookahead_165, "set") && this.isPropertyName(this.peek(1))) {
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
        return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_166, name: name, params: formalParams, body: _body2 }), kind: "method" };
      }
      return { methodOrKey: name, kind: this.isIdentifier(lookahead_165) || this.isKeyword(lookahead_165) ? "identifier" : "property" };
    }
  }, {
    key: "enforestPropertyName",
    value: function enforestPropertyName() {
      var lookahead_167 = this.peek();
      if (this.isStringLiteral(lookahead_167) || this.isNumericLiteral(lookahead_167)) {
        return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
      } else if (this.isBrackets(lookahead_167)) {
        var enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);
        var expr = enf.enforestExpressionLoop();
        return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
      }
      var name_168 = this.advance();
      return { name: new _terms2.default("StaticPropertyName", { value: name_168 }), binding: new _terms2.default("BindingIdentifier", { name: name_168 }) };
    }
  }, {
    key: "enforestFunction",
    value: function enforestFunction(_ref2) {
      var isExpr = _ref2.isExpr;
      var inDefault = _ref2.inDefault;
      var allowGenerator = _ref2.allowGenerator;

      var name_169 = null,
          params_170 = void 0,
          body_171 = void 0,
          rest_172 = void 0;
      var isGenerator_173 = false;
      var fnKeyword_174 = this.advance();
      var lookahead_175 = this.peek();
      var type_176 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
      if (this.isPunctuator(lookahead_175, "*")) {
        isGenerator_173 = true;
        this.advance();
        lookahead_175 = this.peek();
      }
      if (!this.isParens(lookahead_175)) {
        name_169 = this.enforestBindingIdentifier();
      } else if (inDefault) {
        name_169 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_174) });
      }
      params_170 = this.matchParens();
      body_171 = this.matchCurlies();
      var enf_177 = new Enforester(params_170, (0, _immutable.List)(), this.context);
      var formalParams_178 = enf_177.enforestFormalParameters();
      return new _terms2.default(type_176, { name: name_169, isGenerator: isGenerator_173, params: formalParams_178, body: body_171 });
    }
  }, {
    key: "enforestFunctionExpression",
    value: function enforestFunctionExpression() {
      var name_179 = null,
          params_180 = void 0,
          body_181 = void 0,
          rest_182 = void 0;
      var isGenerator_183 = false;
      this.advance();
      var lookahead_184 = this.peek();
      if (this.isPunctuator(lookahead_184, "*")) {
        isGenerator_183 = true;
        this.advance();
        lookahead_184 = this.peek();
      }
      if (!this.isParens(lookahead_184)) {
        name_179 = this.enforestBindingIdentifier();
      }
      params_180 = this.matchParens();
      body_181 = this.matchCurlies();
      var enf_185 = new Enforester(params_180, (0, _immutable.List)(), this.context);
      var formalParams_186 = enf_185.enforestFormalParameters();
      return new _terms2.default("FunctionExpression", { name: name_179, isGenerator: isGenerator_183, params: formalParams_186, body: body_181 });
    }
  }, {
    key: "enforestFunctionDeclaration",
    value: function enforestFunctionDeclaration() {
      var name_187 = void 0,
          params_188 = void 0,
          body_189 = void 0,
          rest_190 = void 0;
      var isGenerator_191 = false;
      this.advance();
      var lookahead_192 = this.peek();
      if (this.isPunctuator(lookahead_192, "*")) {
        isGenerator_191 = true;
        this.advance();
      }
      name_187 = this.enforestBindingIdentifier();
      params_188 = this.matchParens();
      body_189 = this.matchCurlies();
      var enf_193 = new Enforester(params_188, (0, _immutable.List)(), this.context);
      var formalParams_194 = enf_193.enforestFormalParameters();
      return new _terms2.default("FunctionDeclaration", { name: name_187, isGenerator: isGenerator_191, params: formalParams_194, body: body_189 });
    }
  }, {
    key: "enforestFormalParameters",
    value: function enforestFormalParameters() {
      var items_195 = [];
      var rest_196 = null;
      while (this.rest.size !== 0) {
        var lookahead = this.peek();
        if (this.isPunctuator(lookahead, "...")) {
          this.matchPunctuator("...");
          rest_196 = this.enforestBindingIdentifier();
          break;
        }
        items_195.push(this.enforestParam());
        this.consumeComma();
      }
      return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_195), rest: rest_196 });
    }
  }, {
    key: "enforestParam",
    value: function enforestParam() {
      return this.enforestBindingElement();
    }
  }, {
    key: "enforestUpdateExpression",
    value: function enforestUpdateExpression() {
      var operator_197 = this.matchUnaryOperator();
      return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_197.val(), operand: this.transformDestructuring(this.term) });
    }
  }, {
    key: "enforestUnaryExpression",
    value: function enforestUnaryExpression() {
      var _this2 = this;

      var operator_198 = this.matchUnaryOperator();
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = 14;
      this.opCtx.combine = function (rightTerm_199) {
        var type_200 = void 0,
            term_201 = void 0,
            isPrefix_202 = void 0;
        if (operator_198.val() === "++" || operator_198.val() === "--") {
          type_200 = "UpdateExpression";
          term_201 = _this2.transformDestructuring(rightTerm_199);
          isPrefix_202 = true;
        } else {
          type_200 = "UnaryExpression";
          isPrefix_202 = undefined;
          term_201 = rightTerm_199;
        }
        return new _terms2.default(type_200, { operator: operator_198.val(), operand: term_201, isPrefix: isPrefix_202 });
      };
      return EXPR_LOOP_OPERATOR_26;
    }
  }, {
    key: "enforestConditionalExpression",
    value: function enforestConditionalExpression() {
      var test_203 = this.opCtx.combine(this.term);
      if (this.opCtx.stack.size > 0) {
        var _opCtx$stack$last2 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last2.prec;
        var combine = _opCtx$stack$last2.combine;

        this.opCtx.stack = this.opCtx.stack.pop();
        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
      }
      this.matchPunctuator("?");
      var enf_204 = new Enforester(this.rest, (0, _immutable.List)(), this.context);
      var consequent_205 = enf_204.enforestExpressionLoop();
      enf_204.matchPunctuator(":");
      enf_204 = new Enforester(enf_204.rest, (0, _immutable.List)(), this.context);
      var alternate_206 = enf_204.enforestExpressionLoop();
      this.rest = enf_204.rest;
      return new _terms2.default("ConditionalExpression", { test: test_203, consequent: consequent_205, alternate: alternate_206 });
    }
  }, {
    key: "enforestBinaryExpression",
    value: function enforestBinaryExpression() {
      var leftTerm_207 = this.term;
      var opStx_208 = this.peek();
      var op_209 = opStx_208.val();
      var opPrec_210 = (0, _operators.getOperatorPrec)(op_209);
      var opAssoc_211 = (0, _operators.getOperatorAssoc)(op_209);
      if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_210, opAssoc_211)) {
        this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
        this.opCtx.prec = opPrec_210;
        this.opCtx.combine = function (rightTerm_212) {
          return new _terms2.default("BinaryExpression", { left: leftTerm_207, operator: opStx_208, right: rightTerm_212 });
        };
        this.advance();
        return EXPR_LOOP_OPERATOR_26;
      } else {
        var term = this.opCtx.combine(leftTerm_207);

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

      var lookahead_213 = this.matchTemplate();
      var elements_214 = lookahead_213.token.items.map(function (it_215) {
        if (it_215 instanceof _syntax2.default && it_215.isDelimiter()) {
          var enf = new Enforester(it_215.inner(), (0, _immutable.List)(), _this3.context);
          return enf.enforest("expression");
        }
        return new _terms2.default("TemplateElement", { rawValue: it_215.slice.text });
      });
      return elements_214;
    }
  }, {
    key: "expandMacro",
    value: function expandMacro(enforestType_216) {
      var _this4 = this;

      var name_217 = this.advance();
      var syntaxTransform_218 = this.getCompiletimeTransform(name_217);
      if (syntaxTransform_218 == null || typeof syntaxTransform_218.value !== "function") {
        throw this.createError(name_217, "the macro name was not bound to a value that could be invoked");
      }
      var useSiteScope_219 = (0, _scope.freshScope)("u");
      var introducedScope_220 = (0, _scope.freshScope)("i");
      this.context.useScope = useSiteScope_219;
      var ctx_221 = new _macroContext2.default(this, name_217, this.context, useSiteScope_219, introducedScope_220);
      var result_222 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_218.value.call(null, ctx_221));
      if (!_immutable.List.isList(result_222)) {
        throw this.createError(name_217, "macro must return a list but got: " + result_222);
      }
      result_222 = result_222.map(function (stx_223) {
        if (!(stx_223 && typeof stx_223.addScope === "function")) {
          throw _this4.createError(name_217, "macro must return syntax objects or terms but got: " + stx_223);
        }
        return stx_223.addScope(introducedScope_220, _this4.context.bindings, { flip: true });
      });
      return result_222;
    }
  }, {
    key: "consumeSemicolon",
    value: function consumeSemicolon() {
      var lookahead_224 = this.peek();
      if (lookahead_224 && this.isPunctuator(lookahead_224, ";")) {
        this.advance();
      }
    }
  }, {
    key: "consumeComma",
    value: function consumeComma() {
      var lookahead_225 = this.peek();
      if (lookahead_225 && this.isPunctuator(lookahead_225, ",")) {
        this.advance();
      }
    }
  }, {
    key: "isTerm",
    value: function isTerm(term_226) {
      return term_226 && term_226 instanceof _terms2.default;
    }
  }, {
    key: "isEOF",
    value: function isEOF(term_227) {
      return term_227 && term_227 instanceof _syntax2.default && term_227.isEOF();
    }
  }, {
    key: "isIdentifier",
    value: function isIdentifier(term_228) {
      var val_229 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_228 && term_228 instanceof _syntax2.default && term_228.isIdentifier() && (val_229 === null || term_228.val() === val_229);
    }
  }, {
    key: "isPropertyName",
    value: function isPropertyName(term_230) {
      return this.isIdentifier(term_230) || this.isKeyword(term_230) || this.isNumericLiteral(term_230) || this.isStringLiteral(term_230) || this.isBrackets(term_230);
    }
  }, {
    key: "isNumericLiteral",
    value: function isNumericLiteral(term_231) {
      return term_231 && term_231 instanceof _syntax2.default && term_231.isNumericLiteral();
    }
  }, {
    key: "isStringLiteral",
    value: function isStringLiteral(term_232) {
      return term_232 && term_232 instanceof _syntax2.default && term_232.isStringLiteral();
    }
  }, {
    key: "isTemplate",
    value: function isTemplate(term_233) {
      return term_233 && term_233 instanceof _syntax2.default && term_233.isTemplate();
    }
  }, {
    key: "isBooleanLiteral",
    value: function isBooleanLiteral(term_234) {
      return term_234 && term_234 instanceof _syntax2.default && term_234.isBooleanLiteral();
    }
  }, {
    key: "isNullLiteral",
    value: function isNullLiteral(term_235) {
      return term_235 && term_235 instanceof _syntax2.default && term_235.isNullLiteral();
    }
  }, {
    key: "isRegularExpression",
    value: function isRegularExpression(term_236) {
      return term_236 && term_236 instanceof _syntax2.default && term_236.isRegularExpression();
    }
  }, {
    key: "isParens",
    value: function isParens(term_237) {
      return term_237 && term_237 instanceof _syntax2.default && term_237.isParens();
    }
  }, {
    key: "isBraces",
    value: function isBraces(term_238) {
      return term_238 && term_238 instanceof _syntax2.default && term_238.isBraces();
    }
  }, {
    key: "isBrackets",
    value: function isBrackets(term_239) {
      return term_239 && term_239 instanceof _syntax2.default && term_239.isBrackets();
    }
  }, {
    key: "isAssign",
    value: function isAssign(term_240) {
      if (this.isPunctuator(term_240)) {
        switch (term_240.val()) {
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
    value: function isKeyword(term_241) {
      var val_242 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_241 && term_241 instanceof _syntax2.default && term_241.isKeyword() && (val_242 === null || term_241.val() === val_242);
    }
  }, {
    key: "isPunctuator",
    value: function isPunctuator(term_243) {
      var val_244 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return term_243 && term_243 instanceof _syntax2.default && term_243.isPunctuator() && (val_244 === null || term_243.val() === val_244);
    }
  }, {
    key: "isOperator",
    value: function isOperator(term_245) {
      return term_245 && term_245 instanceof _syntax2.default && (0, _operators.isOperator)(term_245);
    }
  }, {
    key: "isUpdateOperator",
    value: function isUpdateOperator(term_246) {
      return term_246 && term_246 instanceof _syntax2.default && term_246.isPunctuator() && (term_246.val() === "++" || term_246.val() === "--");
    }
  }, {
    key: "isFnDeclTransform",
    value: function isFnDeclTransform(term_247) {
      return term_247 && term_247 instanceof _syntax2.default && this.context.env.get(term_247.resolve()) === _transforms.FunctionDeclTransform;
    }
  }, {
    key: "isVarDeclTransform",
    value: function isVarDeclTransform(term_248) {
      return term_248 && term_248 instanceof _syntax2.default && this.context.env.get(term_248.resolve()) === _transforms.VariableDeclTransform;
    }
  }, {
    key: "isLetDeclTransform",
    value: function isLetDeclTransform(term_249) {
      return term_249 && term_249 instanceof _syntax2.default && this.context.env.get(term_249.resolve()) === _transforms.LetDeclTransform;
    }
  }, {
    key: "isConstDeclTransform",
    value: function isConstDeclTransform(term_250) {
      return term_250 && term_250 instanceof _syntax2.default && this.context.env.get(term_250.resolve()) === _transforms.ConstDeclTransform;
    }
  }, {
    key: "isSyntaxDeclTransform",
    value: function isSyntaxDeclTransform(term_251) {
      return term_251 && term_251 instanceof _syntax2.default && this.context.env.get(term_251.resolve()) === _transforms.SyntaxDeclTransform;
    }
  }, {
    key: "isSyntaxrecDeclTransform",
    value: function isSyntaxrecDeclTransform(term_252) {
      return term_252 && term_252 instanceof _syntax2.default && this.context.env.get(term_252.resolve()) === _transforms.SyntaxrecDeclTransform;
    }
  }, {
    key: "isSyntaxTemplate",
    value: function isSyntaxTemplate(term_253) {
      return term_253 && term_253 instanceof _syntax2.default && term_253.isSyntaxTemplate();
    }
  }, {
    key: "isSyntaxQuoteTransform",
    value: function isSyntaxQuoteTransform(term_254) {
      return term_254 && term_254 instanceof _syntax2.default && this.context.env.get(term_254.resolve()) === _transforms.SyntaxQuoteTransform;
    }
  }, {
    key: "isReturnStmtTransform",
    value: function isReturnStmtTransform(term_255) {
      return term_255 && term_255 instanceof _syntax2.default && this.context.env.get(term_255.resolve()) === _transforms.ReturnStatementTransform;
    }
  }, {
    key: "isWhileTransform",
    value: function isWhileTransform(term_256) {
      return term_256 && term_256 instanceof _syntax2.default && this.context.env.get(term_256.resolve()) === _transforms.WhileTransform;
    }
  }, {
    key: "isForTransform",
    value: function isForTransform(term_257) {
      return term_257 && term_257 instanceof _syntax2.default && this.context.env.get(term_257.resolve()) === _transforms.ForTransform;
    }
  }, {
    key: "isSwitchTransform",
    value: function isSwitchTransform(term_258) {
      return term_258 && term_258 instanceof _syntax2.default && this.context.env.get(term_258.resolve()) === _transforms.SwitchTransform;
    }
  }, {
    key: "isBreakTransform",
    value: function isBreakTransform(term_259) {
      return term_259 && term_259 instanceof _syntax2.default && this.context.env.get(term_259.resolve()) === _transforms.BreakTransform;
    }
  }, {
    key: "isContinueTransform",
    value: function isContinueTransform(term_260) {
      return term_260 && term_260 instanceof _syntax2.default && this.context.env.get(term_260.resolve()) === _transforms.ContinueTransform;
    }
  }, {
    key: "isDoTransform",
    value: function isDoTransform(term_261) {
      return term_261 && term_261 instanceof _syntax2.default && this.context.env.get(term_261.resolve()) === _transforms.DoTransform;
    }
  }, {
    key: "isDebuggerTransform",
    value: function isDebuggerTransform(term_262) {
      return term_262 && term_262 instanceof _syntax2.default && this.context.env.get(term_262.resolve()) === _transforms.DebuggerTransform;
    }
  }, {
    key: "isWithTransform",
    value: function isWithTransform(term_263) {
      return term_263 && term_263 instanceof _syntax2.default && this.context.env.get(term_263.resolve()) === _transforms.WithTransform;
    }
  }, {
    key: "isTryTransform",
    value: function isTryTransform(term_264) {
      return term_264 && term_264 instanceof _syntax2.default && this.context.env.get(term_264.resolve()) === _transforms.TryTransform;
    }
  }, {
    key: "isThrowTransform",
    value: function isThrowTransform(term_265) {
      return term_265 && term_265 instanceof _syntax2.default && this.context.env.get(term_265.resolve()) === _transforms.ThrowTransform;
    }
  }, {
    key: "isIfTransform",
    value: function isIfTransform(term_266) {
      return term_266 && term_266 instanceof _syntax2.default && this.context.env.get(term_266.resolve()) === _transforms.IfTransform;
    }
  }, {
    key: "isNewTransform",
    value: function isNewTransform(term_267) {
      return term_267 && term_267 instanceof _syntax2.default && this.context.env.get(term_267.resolve()) === _transforms.NewTransform;
    }
  }, {
    key: "isCompiletimeTransform",
    value: function isCompiletimeTransform(term_268) {
      return term_268 && term_268 instanceof _syntax2.default && (this.context.env.get(term_268.resolve()) instanceof _transforms.CompiletimeTransform || this.context.store.get(term_268.resolve()) instanceof _transforms.CompiletimeTransform);
    }
  }, {
    key: "getCompiletimeTransform",
    value: function getCompiletimeTransform(term_269) {
      if (this.context.env.has(term_269.resolve())) {
        return this.context.env.get(term_269.resolve());
      }
      return this.context.store.get(term_269.resolve());
    }
  }, {
    key: "lineNumberEq",
    value: function lineNumberEq(a_270, b_271) {
      if (!(a_270 && b_271)) {
        return false;
      }
      (0, _errors.assert)(a_270 instanceof _syntax2.default, "expecting a syntax object");
      (0, _errors.assert)(b_271 instanceof _syntax2.default, "expecting a syntax object");
      return a_270.lineNumber() === b_271.lineNumber();
    }
  }, {
    key: "matchIdentifier",
    value: function matchIdentifier(val_272) {
      var lookahead_273 = this.advance();
      if (this.isIdentifier(lookahead_273)) {
        return lookahead_273;
      }
      throw this.createError(lookahead_273, "expecting an identifier");
    }
  }, {
    key: "matchKeyword",
    value: function matchKeyword(val_274) {
      var lookahead_275 = this.advance();
      if (this.isKeyword(lookahead_275, val_274)) {
        return lookahead_275;
      }
      throw this.createError(lookahead_275, "expecting " + val_274);
    }
  }, {
    key: "matchLiteral",
    value: function matchLiteral() {
      var lookahead_276 = this.advance();
      if (this.isNumericLiteral(lookahead_276) || this.isStringLiteral(lookahead_276) || this.isBooleanLiteral(lookahead_276) || this.isNullLiteral(lookahead_276) || this.isTemplate(lookahead_276) || this.isRegularExpression(lookahead_276)) {
        return lookahead_276;
      }
      throw this.createError(lookahead_276, "expecting a literal");
    }
  }, {
    key: "matchStringLiteral",
    value: function matchStringLiteral() {
      var lookahead_277 = this.advance();
      if (this.isStringLiteral(lookahead_277)) {
        return lookahead_277;
      }
      throw this.createError(lookahead_277, "expecting a string literal");
    }
  }, {
    key: "matchTemplate",
    value: function matchTemplate() {
      var lookahead_278 = this.advance();
      if (this.isTemplate(lookahead_278)) {
        return lookahead_278;
      }
      throw this.createError(lookahead_278, "expecting a template literal");
    }
  }, {
    key: "matchParens",
    value: function matchParens() {
      var lookahead_279 = this.advance();
      if (this.isParens(lookahead_279)) {
        return lookahead_279.inner();
      }
      throw this.createError(lookahead_279, "expecting parens");
    }
  }, {
    key: "matchCurlies",
    value: function matchCurlies() {
      var lookahead_280 = this.advance();
      if (this.isBraces(lookahead_280)) {
        return lookahead_280.inner();
      }
      throw this.createError(lookahead_280, "expecting curly braces");
    }
  }, {
    key: "matchSquares",
    value: function matchSquares() {
      var lookahead_281 = this.advance();
      if (this.isBrackets(lookahead_281)) {
        return lookahead_281.inner();
      }
      throw this.createError(lookahead_281, "expecting sqaure braces");
    }
  }, {
    key: "matchUnaryOperator",
    value: function matchUnaryOperator() {
      var lookahead_282 = this.advance();
      if ((0, _operators.isUnaryOperator)(lookahead_282)) {
        return lookahead_282;
      }
      throw this.createError(lookahead_282, "expecting a unary operator");
    }
  }, {
    key: "matchPunctuator",
    value: function matchPunctuator(val_283) {
      var lookahead_284 = this.advance();
      if (this.isPunctuator(lookahead_284)) {
        if (typeof val_283 !== "undefined") {
          if (lookahead_284.val() === val_283) {
            return lookahead_284;
          } else {
            throw this.createError(lookahead_284, "expecting a " + val_283 + " punctuator");
          }
        }
        return lookahead_284;
      }
      throw this.createError(lookahead_284, "expecting a punctuator");
    }
  }, {
    key: "createError",
    value: function createError(stx_285, message_286) {
      var ctx_287 = "";
      var offending_288 = stx_285;
      if (this.rest.size > 0) {
        ctx_287 = this.rest.slice(0, 20).map(function (term_289) {
          if (term_289.isDelimiter()) {
            return term_289.inner();
          }
          return _immutable.List.of(term_289);
        }).flatten().map(function (s_290) {
          if (s_290 === offending_288) {
            return "__" + s_290.val() + "__";
          }
          return s_290.val();
        }).join(" ");
      } else {
        ctx_287 = offending_288.toString();
      }
      return new Error(message_286 + "\n" + ctx_287);
    }
  }]);

  return Enforester;
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2VuZm9yZXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUNBLElBQU0sd0JBQXdCLEVBQXhCO0FBQ04sSUFBTSx5QkFBeUIsRUFBekI7QUFDTixJQUFNLHlCQUF5QixFQUF6Qjs7SUFDTztBQUNYLFdBRFcsVUFDWCxDQUFZLE9BQVosRUFBcUIsT0FBckIsRUFBOEIsVUFBOUIsRUFBMEM7MEJBRC9CLFlBQytCOztBQUN4QyxTQUFLLElBQUwsR0FBWSxLQUFaLENBRHdDO0FBRXhDLHdCQUFPLGdCQUFLLE1BQUwsQ0FBWSxPQUFaLENBQVAsRUFBNkIsdUNBQTdCLEVBRndDO0FBR3hDLHdCQUFPLGdCQUFLLE1BQUwsQ0FBWSxPQUFaLENBQVAsRUFBNkIsdUNBQTdCLEVBSHdDO0FBSXhDLHdCQUFPLFVBQVAsRUFBbUIsaUNBQW5CLEVBSndDO0FBS3hDLFNBQUssSUFBTCxHQUFZLElBQVosQ0FMd0M7QUFNeEMsU0FBSyxJQUFMLEdBQVksT0FBWixDQU53QztBQU94QyxTQUFLLElBQUwsR0FBWSxPQUFaLENBUHdDO0FBUXhDLFNBQUssT0FBTCxHQUFlLFVBQWYsQ0FSd0M7R0FBMUM7O2VBRFc7OzJCQVdJO1VBQVYsNkRBQU8saUJBQUc7O0FBQ2IsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsSUFBZCxDQUFQLENBRGE7Ozs7OEJBR0w7QUFDUixVQUFJLFNBQVMsS0FBSyxJQUFMLENBQVUsS0FBVixFQUFULENBREk7QUFFUixXQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQVosQ0FGUTtBQUdSLGFBQU8sTUFBUCxDQUhROzs7OytCQUttQjtVQUFwQixnRUFBVSx3QkFBVTs7QUFDM0IsV0FBSyxJQUFMLEdBQVksSUFBWixDQUQyQjtBQUUzQixVQUFJLEtBQUssSUFBTCxDQUFVLElB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TE8sR0FLRyxHQUxILENBS08saUJBQVM7QUFDeEIsY0FBSSxVQUFVLGFBQVYsRUFBeUI7QUFDM0IsbUJBQU8sT0FBTyxNQUFNLEdBQU4sRUFBUCxHQUFxQixJQUFyQixDQURvQjtXQUE3QjtBQUdBLGlCQUFPLE1BQU0sR0FBTixFQUFQLENBSndCO1NBQVQsQ0FMUCxDQVVQLElBVk8sQ0FVRixHQVZFLENBQVYsQ0FEc0I7T0FBeEIsTUFZTztBQUNMLGtCQUFVLGNBQWMsUUFBZCxFQUFWLENBREs7T0FaUDtBQWVBLGFBQU8sSUFBSSxLQUFKLENBQVUsY0FBYyxJQUFkLEdBQXFCLE9BQXJCLENBQWpCLENBbEJnQzs7OztTQTM5Q3ZCIiwiZmlsZSI6ImVuZm9yZXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtGdW5jdGlvbkRlY2xUcmFuc2Zvcm0sIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSwgTmV3VHJhbnNmb3JtLCBMZXREZWNsVHJhbnNmb3JtLCBDb25zdERlY2xUcmFuc2Zvcm0sIFN5bnRheERlY2xUcmFuc2Zvcm0sIFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0sIFN5bnRheFF1b3RlVHJhbnNmb3JtLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0sIFdoaWxlVHJhbnNmb3JtLCBJZlRyYW5zZm9ybSwgRm9yVHJhbnNmb3JtLCBTd2l0Y2hUcmFuc2Zvcm0sIEJyZWFrVHJhbnNmb3JtLCBDb250aW51ZVRyYW5zZm9ybSwgRG9UcmFuc2Zvcm0sIERlYnVnZ2VyVHJhbnNmb3JtLCBXaXRoVHJhbnNmb3JtLCBUcnlUcmFuc2Zvcm0sIFRocm93VHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7aXNPcGVyYXRvciwgaXNVbmFyeU9wZXJhdG9yLCBnZXRPcGVyYXRvckFzc29jLCBnZXRPcGVyYXRvclByZWMsIG9wZXJhdG9yTHR9IGZyb20gXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7ZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCB7c2FuaXRpemVSZXBsYWNlbWVudFZhbHVlc30gZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzI2ID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3ID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4ID0ge307XG5leHBvcnQgY2xhc3MgRW5mb3Jlc3RlciB7XG4gIGNvbnN0cnVjdG9yKHN0eGxfMjksIHByZXZfMzAsIGNvbnRleHRfMzEpIHtcbiAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3Qoc3R4bF8yOSksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3QocHJldl8zMCksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoY29udGV4dF8zMSwgXCJleHBlY3RpbmcgYSBjb250ZXh0IHRvIGVuZm9yZXN0XCIpO1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5yZXN0ID0gc3R4bF8yOTtcbiAgICB0aGlzLnByZXYgPSBwcmV2XzMwO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzE7XG4gIH1cbiAgcGVlayhuXzMyID0gMCkge1xuICAgIHJldHVybiB0aGlzLnJlc3QuZ2V0KG5fMzIpO1xuICB9XG4gIGFkdmFuY2UoKSB7XG4gICAgbGV0IHJldF8zMyA9IHRoaXMucmVzdC5maXJzdCgpO1xuICAgIHRoaXMucmVzdCA9IHRoaXMucmVzdC5yZXN0KCk7XG4gICAgcmV0dXJuIHJldF8zMztcbiAgfVxuICBlbmZvcmVzdCh0eXBlXzM0ID0gXCJNb2R1bGVcIikge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNFT0YodGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLnRlcm0gPSBuZXcgVGVybShcIkVPRlwiLCB7fSk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgfVxuICAgIGxldCByZXN1bHRfMzU7XG4gICAgaWYgKHR5cGVfMzQgPT09IFwiZXhwcmVzc2lvblwiKSB7XG4gICAgICByZXN1bHRfMzUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0XzM1ID0gdGhpcy5lbmZvcmVzdE1vZHVsZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfMzU7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCb2R5KCk7XG4gIH1cbiAgZW5mb3Jlc3RCb2R5KCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TW9kdWxlSXRlbSgpO1xuICB9XG4gIGVuZm9yZXN0TW9kdWxlSXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zNiwgXCJpbXBvcnRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM2LCBcImV4cG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8zNywgXCIqXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzM3KSkge1xuICAgICAgbGV0IG5hbWVkRXhwb3J0cyA9IHRoaXMuZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImZyb21cIikpIHtcbiAgICAgICAgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge25hbWVkRXhwb3J0czogbmFtZWRFeHBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2xhc3NcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IGJvZHl9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzM3LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0Q2xhdXNlKCkge1xuICAgIGxldCBlbmZfMzggPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF8zOSA9IFtdO1xuICAgIHdoaWxlIChlbmZfMzgucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfMzkucHVzaChlbmZfMzguZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSk7XG4gICAgICBlbmZfMzguY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8zOSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSB7XG4gICAgbGV0IG5hbWVfNDAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZXhwb3J0ZWROYW1lID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MCwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBleHBvcnRlZE5hbWU6IG5hbWVfNDB9KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDEgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgZGVmYXVsdEJpbmRpbmdfNDIgPSBudWxsO1xuICAgIGxldCBuYW1lZEltcG9ydHNfNDMgPSBMaXN0KCk7XG4gICAgbGV0IGZvclN5bnRheF80NCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfNDEpKSB7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBuYW1lZEltcG9ydHM6IG5hbWVkSW1wb3J0c180MywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF80MSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzQxKSkge1xuICAgICAgZGVmYXVsdEJpbmRpbmdfNDIgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXIsIG5hbWVkSW1wb3J0czogTGlzdCgpLCBmb3JTeW50YXg6IGZvclN5bnRheF80NH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIGxvb2thaGVhZF80MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF80MSkpIHtcbiAgICAgIGxldCBpbXBvcnRzID0gdGhpcy5lbmZvcmVzdE5hbWVkSW1wb3J0cygpO1xuICAgICAgbGV0IGZyb21DbGF1c2UgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBmb3JTeW50YXg6IGZvclN5bnRheF80NCwgbmFtZWRJbXBvcnRzOiBpbXBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IGZyb21DbGF1c2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF80MSwgXCIqXCIpKSB7XG4gICAgICBsZXQgbmFtZXNwYWNlQmluZGluZyA9IHRoaXMuZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF80NCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnROYW1lc3BhY2VcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgZm9yU3ludGF4OiBmb3JTeW50YXhfNDQsIG5hbWVzcGFjZUJpbmRpbmc6IG5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzQxLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIipcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lZEltcG9ydHMoKSB7XG4gICAgbGV0IGVuZl80NSA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzQ2ID0gW107XG4gICAgd2hpbGUgKGVuZl80NS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF80Ni5wdXNoKGVuZl80NS5lbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSk7XG4gICAgICBlbmZfNDUuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF80Nik7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbmFtZV80ODtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQ3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNDcpKSB7XG4gICAgICBuYW1lXzQ4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV80OH0pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF80NywgXCJ1bmV4cGVjdGVkIHRva2VuIGluIGltcG9ydCBzcGVjaWZpZXJcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80OCwgYmluZGluZzogdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCl9KTtcbiAgfVxuICBlbmZvcmVzdEZyb21DbGF1c2UoKSB7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJmcm9tXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNDkgPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBsb29rYWhlYWRfNDk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzUwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTAsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHRoaXMucmVzdCA9IHRoaXMuZXhwYW5kTWFjcm8oKS5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCbG9ja1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaGlsZVRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdoaWxlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lmVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SWZTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm9yVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Rm9yU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N3aXRjaFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN3aXRjaFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmVha1RyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJyZWFrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbnRpbnVlVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q29udGludWVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRG9UcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REb1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEZWJ1Z2dlclRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1dpdGhUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RXaXRoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1RyeVRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRyeVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUaHJvd1RyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRocm93U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzUxLCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNTEpICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgXCI6XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNTeW50YXhEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpKSB7XG4gICAgICBsZXQgc3RtdCA9IG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCl9KTtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIHN0bXQ7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1JldHVyblN0bXRUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTEsIFwiO1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFbXB0eVN0YXRlbWVudFwiLCB7fSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvblN0YXRlbWVudCgpO1xuICB9XG4gIGVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpIHtcbiAgICBsZXQgbGFiZWxfNTIgPSB0aGlzLm1hdGNoSWRlbnRpZmllcigpO1xuICAgIGxldCBwdW5jXzUzID0gdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGxldCBzdG10XzU0ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkxhYmVsZWRTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF81MiwgYm9keTogc3RtdF81NH0pO1xuICB9XG4gIGVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJicmVha1wiKTtcbiAgICBsZXQgbG9va2FoZWFkXzU1ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzU2ID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzU1LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF81Nn0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzU1KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTUsIFwieWllbGRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU1LCBcImxldFwiKSkge1xuICAgICAgbGFiZWxfNTYgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzU2fSk7XG4gIH1cbiAgZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0cnlcIik7XG4gICAgbGV0IGJvZHlfNTcgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2F0Y2hcIikpIHtcbiAgICAgIGxldCBjYXRjaENsYXVzZSA9IHRoaXMuZW5mb3Jlc3RDYXRjaENsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZpbmFsbHlcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NywgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5Q2F0Y2hTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTcsIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZmluYWxpemVyID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU3LCBjYXRjaENsYXVzZTogbnVsbCwgZmluYWxpemVyOiBmaW5hbGl6ZXJ9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcih0aGlzLnBlZWsoKSwgXCJ0cnkgd2l0aCBubyBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICB9XG4gIGVuZm9yZXN0Q2F0Y2hDbGF1c2UoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJjYXRjaFwiKTtcbiAgICBsZXQgYmluZGluZ1BhcmVuc181OCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzU5ID0gbmV3IEVuZm9yZXN0ZXIoYmluZGluZ1BhcmVuc181OCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBiaW5kaW5nXzYwID0gZW5mXzU5LmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgIGxldCBib2R5XzYxID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2F0Y2hDbGF1c2VcIiwge2JpbmRpbmc6IGJpbmRpbmdfNjAsIGJvZHk6IGJvZHlfNjF9KTtcbiAgfVxuICBlbmZvcmVzdFRocm93U3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwidGhyb3dcIik7XG4gICAgbGV0IGV4cHJlc3Npb25fNjIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlRocm93U3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByZXNzaW9uXzYyfSk7XG4gIH1cbiAgZW5mb3Jlc3RXaXRoU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2l0aFwiKTtcbiAgICBsZXQgb2JqUGFyZW5zXzYzID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNjQgPSBuZXcgRW5mb3Jlc3RlcihvYmpQYXJlbnNfNjMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgb2JqZWN0XzY1ID0gZW5mXzY0LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5XzY2ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIldpdGhTdGF0ZW1lbnRcIiwge29iamVjdDogb2JqZWN0XzY1LCBib2R5OiBib2R5XzY2fSk7XG4gIH1cbiAgZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRlYnVnZ2VyXCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRlYnVnZ2VyU3RhdGVtZW50XCIsIHt9KTtcbiAgfVxuICBlbmZvcmVzdERvU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZG9cIik7XG4gICAgbGV0IGJvZHlfNjcgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aGlsZVwiKTtcbiAgICBsZXQgdGVzdEJvZHlfNjggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl82OSA9IG5ldyBFbmZvcmVzdGVyKHRlc3RCb2R5XzY4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHRlc3RfNzAgPSBlbmZfNjkuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRG9XaGlsZVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV82NywgdGVzdDogdGVzdF83MH0pO1xuICB9XG4gIGVuZm9yZXN0Q29udGludWVTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3ZF83MSA9IHRoaXMubWF0Y2hLZXl3b3JkKFwiY29udGludWVcIik7XG4gICAgbGV0IGxvb2thaGVhZF83MiA9IHRoaXMucGVlaygpO1xuICAgIGxldCBsYWJlbF83MyA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF83MiwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzN9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMubGluZU51bWJlckVxKGt3ZF83MSwgbG9va2FoZWFkXzcyKSAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzcyKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzIsIFwieWllbGRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzcyLCBcImxldFwiKSkpIHtcbiAgICAgIGxhYmVsXzczID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF83M30pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwic3dpdGNoXCIpO1xuICAgIGxldCBjb25kXzc0ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNzUgPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzc0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGRpc2NyaW1pbmFudF83NiA9IGVuZl83NS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBsZXQgYm9keV83NyA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgaWYgKGJvZHlfNzcuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF83NiwgY2FzZXM6IExpc3QoKX0pO1xuICAgIH1cbiAgICBlbmZfNzUgPSBuZXcgRW5mb3Jlc3Rlcihib2R5Xzc3LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGNhc2VzXzc4ID0gZW5mXzc1LmVuZm9yZXN0U3dpdGNoQ2FzZXMoKTtcbiAgICBsZXQgbG9va2FoZWFkXzc5ID0gZW5mXzc1LnBlZWsoKTtcbiAgICBpZiAoZW5mXzc1LmlzS2V5d29yZChsb29rYWhlYWRfNzksIFwiZGVmYXVsdFwiKSkge1xuICAgICAgbGV0IGRlZmF1bHRDYXNlID0gZW5mXzc1LmVuZm9yZXN0U3dpdGNoRGVmYXVsdCgpO1xuICAgICAgbGV0IHBvc3REZWZhdWx0Q2FzZXMgPSBlbmZfNzUuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50V2l0aERlZmF1bHRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzc2LCBwcmVEZWZhdWx0Q2FzZXM6IGNhc2VzXzc4LCBkZWZhdWx0Q2FzZTogZGVmYXVsdENhc2UsIHBvc3REZWZhdWx0Q2FzZXM6IHBvc3REZWZhdWx0Q2FzZXN9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoU3RhdGVtZW50XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF83NiwgY2FzZXM6IGNhc2VzXzc4fSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlcygpIHtcbiAgICBsZXQgY2FzZXNfODAgPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpKSkge1xuICAgICAgY2FzZXNfODAucHVzaCh0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QoY2FzZXNfODApO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhc2VcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoQ2FzZVwiLCB7dGVzdDogdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKSwgY29uc2VxdWVudDogdGhpcy5lbmZvcmVzdFN3aXRjaENhc2VCb2R5KCl9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VCb2R5KCkge1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SW5Td2l0Y2hDYXNlQm9keSgpIHtcbiAgICBsZXQgcmVzdWx0XzgxID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXNlXCIpKSkge1xuICAgICAgcmVzdWx0XzgxLnB1c2godGhpcy5lbmZvcmVzdFN0YXRlbWVudExpc3RJdGVtKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfODEpO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoRGVmYXVsdCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRlZmF1bHRcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3dpdGNoRGVmYXVsdFwiLCB7Y29uc2VxdWVudDogdGhpcy5lbmZvcmVzdFN3aXRjaENhc2VCb2R5KCl9KTtcbiAgfVxuICBlbmZvcmVzdEZvclN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImZvclwiKTtcbiAgICBsZXQgY29uZF84MiA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzgzID0gbmV3IEVuZm9yZXN0ZXIoY29uZF84MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfODQsIHRlc3RfODUsIGluaXRfODYsIHJpZ2h0Xzg3LCB0eXBlXzg4LCBsZWZ0Xzg5LCB1cGRhdGVfOTA7XG4gICAgaWYgKGVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCFlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICB0ZXN0Xzg1ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICBpZiAoZW5mXzgzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICByaWdodF84NyA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogbnVsbCwgdGVzdDogdGVzdF84NSwgdXBkYXRlOiByaWdodF84NywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvb2thaGVhZF84NCA9IGVuZl84My5wZWVrKCk7XG4gICAgICBpZiAoZW5mXzgzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfODQpIHx8IGVuZl84My5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzg0KSB8fCBlbmZfODMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzg0KSkge1xuICAgICAgICBpbml0Xzg2ID0gZW5mXzgzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpO1xuICAgICAgICBsb29rYWhlYWRfODQgPSBlbmZfODMucGVlaygpO1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzg0LCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF84NCwgXCJvZlwiKSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfODQsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgICByaWdodF84NyA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODQsIFwib2ZcIikpIHtcbiAgICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgICByaWdodF84NyA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg4LCB7bGVmdDogaW5pdF84NiwgcmlnaHQ6IHJpZ2h0Xzg3LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0Xzg1ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0Xzg1ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV85MCA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChlbmZfODMucGVlaygxKSwgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihlbmZfODMucGVlaygxKSwgXCJvZlwiKSkge1xuICAgICAgICAgIGxlZnRfODkgPSBlbmZfODMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICAgIGxldCBraW5kID0gZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoa2luZCwgXCJpblwiKSkge1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODgsIHtsZWZ0OiBsZWZ0Xzg5LCByaWdodDogcmlnaHRfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGluaXRfODYgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfODUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3RfODUgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlXzkwID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBpbml0Xzg2LCB0ZXN0OiB0ZXN0Xzg1LCB1cGRhdGU6IHVwZGF0ZV85MCwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0SWZTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJpZlwiKTtcbiAgICBsZXQgY29uZF85MSA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzkyID0gbmV3IEVuZm9yZXN0ZXIoY29uZF85MSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfOTMgPSBlbmZfOTIucGVlaygpO1xuICAgIGxldCB0ZXN0Xzk0ID0gZW5mXzkyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ZXN0Xzk0ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfOTIuY3JlYXRlRXJyb3IobG9va2FoZWFkXzkzLCBcImV4cGVjdGluZyBhbiBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBsZXQgY29uc2VxdWVudF85NSA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICBsZXQgYWx0ZXJuYXRlXzk2ID0gbnVsbDtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZWxzZVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBhbHRlcm5hdGVfOTYgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIklmU3RhdGVtZW50XCIsIHt0ZXN0OiB0ZXN0Xzk0LCBjb25zZXF1ZW50OiBjb25zZXF1ZW50Xzk1LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV85Nn0pO1xuICB9XG4gIGVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aGlsZVwiKTtcbiAgICBsZXQgY29uZF85NyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzk4ID0gbmV3IEVuZm9yZXN0ZXIoY29uZF85NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsb29rYWhlYWRfOTkgPSBlbmZfOTgucGVlaygpO1xuICAgIGxldCB0ZXN0XzEwMCA9IGVuZl85OC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF8xMDAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl85OC5jcmVhdGVFcnJvcihsb29rYWhlYWRfOTksIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBib2R5XzEwMSA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaGlsZVN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF8xMDAsIGJvZHk6IGJvZHlfMTAxfSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9ja1N0YXRlbWVudCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1N0YXRlbWVudFwiLCB7YmxvY2s6IHRoaXMuZW5mb3Jlc3RCbG9jaygpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCbG9jaygpIHtcbiAgICBsZXQgYl8xMDIgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBib2R5XzEwMyA9IFtdO1xuICAgIGxldCBlbmZfMTA0ID0gbmV3IEVuZm9yZXN0ZXIoYl8xMDIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEwNC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTA0LnBlZWsoKTtcbiAgICAgIGxldCBzdG10ID0gZW5mXzEwNC5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgICAgaWYgKHN0bXQgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBlbmZfMTA0LmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJub3QgYSBzdGF0ZW1lbnRcIik7XG4gICAgICB9XG4gICAgICBib2R5XzEwMy5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCbG9ja1wiLCB7c3RhdGVtZW50czogTGlzdChib2R5XzEwMyl9KTtcbiAgfVxuICBlbmZvcmVzdENsYXNzKHtpc0V4cHIsIGluRGVmYXVsdH0pIHtcbiAgICBsZXQga3dfMTA1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IG5hbWVfMTA2ID0gbnVsbCwgc3Vwcl8xMDcgPSBudWxsO1xuICAgIGxldCB0eXBlXzEwOCA9IGlzRXhwciA/IFwiQ2xhc3NFeHByZXNzaW9uXCIgOiBcIkNsYXNzRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEwNiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoIWlzRXhwcikge1xuICAgICAgaWYgKGluRGVmYXVsdCkge1xuICAgICAgICBuYW1lXzEwNiA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIl9kZWZhdWx0XCIsIGt3XzEwNSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJleHRlbmRzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN1cHJfMTA3ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuICAgIGxldCBlbGVtZW50c18xMDkgPSBbXTtcbiAgICBsZXQgZW5mXzExMCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzExMC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGlmIChlbmZfMTEwLmlzUHVuY3R1YXRvcihlbmZfMTEwLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIGVuZl8xMTAuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTEwLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaWRlbnRpZmllclwiICYmIG1ldGhvZE9yS2V5LnZhbHVlLnZhbCgpID09PSBcInN0YXRpY1wiKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTEwLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIGlmIChraW5kID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICAgIGVsZW1lbnRzXzEwOS5wdXNoKG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogaXNTdGF0aWMsIG1ldGhvZDogbWV0aG9kT3JLZXl9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGVuZl8xMTAucGVlaygpLCBcIk9ubHkgbWV0aG9kcyBhcmUgYWxsb3dlZCBpbiBjbGFzc2VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMDgsIHtuYW1lOiBuYW1lXzEwNiwgc3VwZXI6IHN1cHJfMTA3LCBlbGVtZW50czogTGlzdChlbGVtZW50c18xMDkpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCkge1xuICAgIGxldCBsb29rYWhlYWRfMTExID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMTEpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzExMSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEJpbmRpbmcoKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCkge1xuICAgIGxldCBlbmZfMTEyID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzExMyA9IFtdO1xuICAgIHdoaWxlIChlbmZfMTEyLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcHJvcGVydGllc18xMTMucHVzaChlbmZfMTEyLmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mXzExMi5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogTGlzdChwcm9wZXJ0aWVzXzExMyl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzExNCA9IHRoaXMucGVlaygpO1xuICAgIGxldCB7bmFtZSwgYmluZGluZ30gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMTQpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTQsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMTQsIFwieWllbGRcIikpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBleHByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IGJpbmRpbmcsIGluaXQ6IGRlZmF1bHRWYWx1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgYmluZGluZyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiBuYW1lLCBiaW5kaW5nOiBiaW5kaW5nfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXRfMTE1ID0gdGhpcy5tYXRjaFNxdWFyZXMoKTtcbiAgICBsZXQgZW5mXzExNiA9IG5ldyBFbmZvcmVzdGVyKGJyYWNrZXRfMTE1LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzXzExNyA9IFtdLCByZXN0RWxlbWVudF8xMTggPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTE2LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZl8xMTYuaXNQdW5jdHVhdG9yKGVuZl8xMTYucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzExNi5jb25zdW1lQ29tbWEoKTtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVuZl8xMTYuaXNQdW5jdHVhdG9yKGVuZl8xMTYucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICAgIGVuZl8xMTYuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3RFbGVtZW50XzExOCA9IGVuZl8xMTYuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmZfMTE2LmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTE2LmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgICAgZWxlbWVudHNfMTE3LnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzExNyksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMTh9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nXzExOSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICBiaW5kaW5nXzExOSA9IG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiBiaW5kaW5nXzExOSwgaW5pdDogaW5pdH0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ18xMTk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKX0pO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyMCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTIwKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTIwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMjAsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3XzEyMSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTIyID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xMjIgJiYgIXRoaXMubGluZU51bWJlckVxKGt3XzEyMSwgbG9va2FoZWFkXzEyMikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH1cbiAgICBsZXQgdGVybV8xMjMgPSBudWxsO1xuICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyMiwgXCI7XCIpKSB7XG4gICAgICB0ZXJtXzEyMyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBleHBlY3QodGVybV8xMjMgIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkXzEyMiwgdGhpcy5yZXN0KTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0ZXJtXzEyM30pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpIHtcbiAgICBsZXQga2luZF8xMjQ7XG4gICAgbGV0IGxvb2thaGVhZF8xMjUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQga2luZFN5bl8xMjYgPSBsb29rYWhlYWRfMTI1O1xuICAgIGlmIChraW5kU3luXzEyNiAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyNi5yZXNvbHZlKCkpID09PSBWYXJpYWJsZURlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI0ID0gXCJ2YXJcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI2ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI2LnJlc29sdmUoKSkgPT09IExldERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI0ID0gXCJsZXRcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI2ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI2LnJlc29sdmUoKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjQgPSBcImNvbnN0XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyNiAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyNi5yZXNvbHZlKCkpID09PSBTeW50YXhEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNCA9IFwic3ludGF4XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyNiAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyNi5yZXNvbHZlKCkpID09PSBTeW50YXhyZWNEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNCA9IFwic3ludGF4cmVjXCI7XG4gICAgfVxuICAgIGxldCBkZWNsc18xMjcgPSBMaXN0KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCB0ZXJtID0gdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRvcigpO1xuICAgICAgbGV0IGxvb2thaGVhZF8xMjUgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGRlY2xzXzEyNyA9IGRlY2xzXzEyNy5jb25jYXQodGVybSk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyNSwgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IGtpbmRfMTI0LCBkZWNsYXJhdG9yczogZGVjbHNfMTI3fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3IoKSB7XG4gICAgbGV0IGlkXzEyOCA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMjkgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgaW5pdF8xMzAsIHJlc3RfMTMxO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTI5LCBcIj1cIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgaW5pdF8xMzAgPSBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mLnJlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXRfMTMwID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiBpZF8xMjgsIGluaXQ6IGluaXRfMTMwfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCkge1xuICAgIGxldCBzdGFydF8xMzIgPSB0aGlzLnJlc3QuZ2V0KDApO1xuICAgIGxldCBleHByXzEzMyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKGV4cHJfMTMzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHN0YXJ0XzEzMiwgXCJub3QgYSB2YWxpZCBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHByZXNzaW9uU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByXzEzM30pO1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbGVmdF8xMzQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBsZXQgbG9va2FoZWFkXzEzNSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTM1LCBcIixcIikpIHtcbiAgICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBsZXQgb3BlcmF0b3IgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IHJpZ2h0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGxlZnRfMTM0ID0gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0XzEzNCwgb3BlcmF0b3I6IG9wZXJhdG9yLCByaWdodDogcmlnaHR9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICByZXR1cm4gbGVmdF8xMzQ7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpIHtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHRoaXMub3BDdHggPSB7cHJlYzogMCwgY29tYmluZTogeF8xMzYgPT4geF8xMzYsIHN0YWNrOiBMaXN0KCl9O1xuICAgIGRvIHtcbiAgICAgIGxldCB0ZXJtID0gdGhpcy5lbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCk7XG4gICAgICBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRV8yNyAmJiB0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgfSBlbHNlIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfT1BFUkFUT1JfMjYgfHwgdGVybSA9PT0gRVhQUl9MT09QX0VYUEFOU0lPTl8yOCkge1xuICAgICAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGVybTtcbiAgICAgIH1cbiAgICB9IHdoaWxlICh0cnVlKTtcbiAgICByZXR1cm4gdGhpcy50ZXJtO1xuICB9XG4gIGVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMzcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZXJtKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5leHBhbmRNYWNybygpO1xuICAgICAgdGhpcy5yZXN0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLnJlc3QpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9FWFBBTlNJT05fMjg7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzNywgXCJ5aWVsZFwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IHRydWV9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcInN1cGVyXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN1cGVyXCIsIHt9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEzNykgfHwgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTM3KSkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIj0+XCIpICYmIHRoaXMubGluZU51bWJlckVxKGxvb2thaGVhZF8xMzcsIHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyb3dFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N5bnRheFRlbXBsYXRlKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN5bnRheFRlbXBsYXRlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N5bnRheFF1b3RlVHJhbnNmb3JtKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN5bnRheFF1b3RlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc05ld1RyYW5zZm9ybShsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3ROZXdFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzNywgXCJ0aGlzXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUaGlzRXhwcmVzc2lvblwiLCB7c3R4OiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcImxldFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcInlpZWxkXCIpKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICBsZXQgbnVtID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAobnVtLnZhbCgpID09PSAxIC8gMCkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsSW5maW5pdHlFeHByZXNzaW9uXCIsIHt9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiLCB7dmFsdWU6IG51bX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogbnVsbCwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxOdWxsRXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICBsZXQgcmVTdHggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBsYXN0U2xhc2ggPSByZVN0eC50b2tlbi52YWx1ZS5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgICBsZXQgcGF0dGVybiA9IHJlU3R4LnRva2VuLnZhbHVlLnNsaWNlKDEsIGxhc3RTbGFzaCk7XG4gICAgICBsZXQgZmxhZ3MgPSByZVN0eC50b2tlbi52YWx1ZS5zbGljZShsYXN0U2xhc2ggKyAxKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCIsIHtwYXR0ZXJuOiBwYXR0ZXJuLCBmbGFnczogZmxhZ3N9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiLCB7aW5uZXI6IHRoaXMuYWR2YW5jZSgpLmlubmVyKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzT3BlcmF0b3IobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1VwZGF0ZU9wZXJhdG9yKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzT3BlcmF0b3IobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzcsIFwiLlwiKSAmJiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpKSB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoMSkpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIGxldCBwYXJlbiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogdGhpcy50ZXJtLCBhcmd1bWVudHM6IHBhcmVuLmlubmVyKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiB0aGlzLnRlcm0sIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc0Fzc2lnbihsb29rYWhlYWRfMTM3KSkge1xuICAgICAgbGV0IGJpbmRpbmcgPSB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGhpcy50ZXJtKTtcbiAgICAgIGxldCBvcCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGluaXQgPSBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mLnJlc3Q7XG4gICAgICBpZiAob3AudmFsKCkgPT09IFwiPVwiKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wb3VuZEFzc2lnbm1lbnRFeHByZXNzaW9uXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBvcGVyYXRvcjogb3AudmFsKCksIGV4cHJlc3Npb246IGluaXR9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTM3LCBcIj9cIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3O1xuICB9XG4gIGVuZm9yZXN0QXJndW1lbnRMaXN0KCkge1xuICAgIGxldCByZXN1bHRfMTM4ID0gW107XG4gICAgd2hpbGUgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGFyZztcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIuLi5cIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGFyZyA9IG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFyZyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIixcIik7XG4gICAgICB9XG4gICAgICByZXN1bHRfMTM4LnB1c2goYXJnKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzEzOCk7XG4gIH1cbiAgZW5mb3Jlc3ROZXdFeHByZXNzaW9uKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwibmV3XCIpO1xuICAgIGxldCBjYWxsZWVfMTM5O1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJuZXdcIikpIHtcbiAgICAgIGNhbGxlZV8xMzkgPSB0aGlzLmVuZm9yZXN0TmV3RXhwcmVzc2lvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwic3VwZXJcIikpIHtcbiAgICAgIGNhbGxlZV8xMzkgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi5cIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInRhcmdldFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIk5ld1RhcmdldEV4cHJlc3Npb25cIiwge30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsZWVfMTM5ID0gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKX0pO1xuICAgIH1cbiAgICBsZXQgYXJnc18xNDA7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnModGhpcy5wZWVrKCkpKSB7XG4gICAgICBhcmdzXzE0MCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJnc18xNDAgPSBMaXN0KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk5ld0V4cHJlc3Npb25cIiwge2NhbGxlZTogY2FsbGVlXzEzOSwgYXJndW1lbnRzOiBhcmdzXzE0MH0pO1xuICB9XG4gIGVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBlbmZfMTQxID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFNxdWFyZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiB0aGlzLnRlcm0sIGV4cHJlc3Npb246IGVuZl8xNDEuZW5mb3Jlc3RFeHByZXNzaW9uKCl9KTtcbiAgfVxuICB0cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTQyKSB7XG4gICAgc3dpdGNoICh0ZXJtXzE0Mi50eXBlKSB7XG4gICAgICBjYXNlIFwiSWRlbnRpZmllckV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTQyLm5hbWV9KTtcbiAgICAgIGNhc2UgXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiOlxuICAgICAgICBpZiAodGVybV8xNDIuaW5uZXIuc2l6ZSA9PT0gMSAmJiB0aGlzLmlzSWRlbnRpZmllcih0ZXJtXzE0Mi5pbm5lci5nZXQoMCkpKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTQyLmlubmVyLmdldCgwKX0pO1xuICAgICAgICB9XG4gICAgICBjYXNlIFwiRGF0YVByb3BlcnR5XCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiB0ZXJtXzE0Mi5uYW1lLCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtXzE0Mi5leHByZXNzaW9uKX0pO1xuICAgICAgY2FzZSBcIlNob3J0aGFuZFByb3BlcnR5XCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTQyLm5hbWV9KSwgaW5pdDogbnVsbH0pO1xuICAgICAgY2FzZSBcIk9iamVjdEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogdGVybV8xNDIucHJvcGVydGllcy5tYXAodF8xNDMgPT4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRfMTQzKSl9KTtcbiAgICAgIGNhc2UgXCJBcnJheUV4cHJlc3Npb25cIjpcbiAgICAgICAgbGV0IGxhc3QgPSB0ZXJtXzE0Mi5lbGVtZW50cy5sYXN0KCk7XG4gICAgICAgIGlmIChsYXN0ICE9IG51bGwgJiYgbGFzdC50eXBlID09PSBcIlNwcmVhZEVsZW1lbnRcIikge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTQyLmVsZW1lbnRzLnNsaWNlKDAsIC0xKS5tYXAodF8xNDQgPT4gdF8xNDQgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodF8xNDQpKSwgcmVzdEVsZW1lbnQ6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KGxhc3QuZXhwcmVzc2lvbil9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE0Mi5lbGVtZW50cy5tYXAodF8xNDUgPT4gdF8xNDUgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodF8xNDUpKSwgcmVzdEVsZW1lbnQ6IG51bGx9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE0Mi5lbGVtZW50cy5tYXAodF8xNDYgPT4gdF8xNDYgJiYgdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRfMTQ2KSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICBjYXNlIFwiU3RhdGljUHJvcGVydHlOYW1lXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0Mi52YWx1ZX0pO1xuICAgICAgY2FzZSBcIkNvbXB1dGVkTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJBcnJheUJpbmRpbmdcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nSWRlbnRpZmllclwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdXaXRoRGVmYXVsdFwiOlxuICAgICAgY2FzZSBcIk9iamVjdEJpbmRpbmdcIjpcbiAgICAgICAgcmV0dXJuIHRlcm1fMTQyO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3IgXCIgKyB0ZXJtXzE0Mi50eXBlKTtcbiAgfVxuICB0cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNDcpIHtcbiAgICBzd2l0Y2ggKHRlcm1fMTQ3LnR5cGUpIHtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE0Ny5iaW5kaW5nKSwgaW5pdDogdGVybV8xNDcuZXhwcmVzc2lvbn0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTQ3KTtcbiAgfVxuICBlbmZvcmVzdEFycm93RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE0ODtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBlbmZfMTQ4ID0gbmV3IEVuZm9yZXN0ZXIoTGlzdC5vZih0aGlzLmFkdmFuY2UoKSksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBlbmZfMTQ4ID0gbmV3IEVuZm9yZXN0ZXIocCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH1cbiAgICBsZXQgcGFyYW1zXzE0OSA9IGVuZl8xNDguZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI9PlwiKTtcbiAgICBsZXQgYm9keV8xNTA7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXModGhpcy5wZWVrKCkpKSB7XG4gICAgICBib2R5XzE1MCA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZl8xNDggPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGJvZHlfMTUwID0gZW5mXzE0OC5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB0aGlzLnJlc3QgPSBlbmZfMTQ4LnJlc3Q7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycm93RXhwcmVzc2lvblwiLCB7cGFyYW1zOiBwYXJhbXNfMTQ5LCBib2R5OiBib2R5XzE1MH0pO1xuICB9XG4gIGVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCkge1xuICAgIGxldCBrd2RfMTUxID0gdGhpcy5tYXRjaEtleXdvcmQoXCJ5aWVsZFwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzE1MiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCBsb29rYWhlYWRfMTUyICYmICF0aGlzLmxpbmVOdW1iZXJFcShrd2RfMTUxLCBsb29rYWhlYWRfMTUyKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiWWllbGRFeHByZXNzaW9uXCIsIHtleHByZXNzaW9uOiBudWxsfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpc0dlbmVyYXRvciA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIipcIikpIHtcbiAgICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH1cbiAgICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIGxldCB0eXBlID0gaXNHZW5lcmF0b3IgPyBcIllpZWxkR2VuZXJhdG9yRXhwcmVzc2lvblwiIDogXCJZaWVsZEV4cHJlc3Npb25cIjtcbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlLCB7ZXhwcmVzc2lvbjogZXhwcn0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFN5bnRheFRlbXBsYXRlKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN5bnRheFRlbXBsYXRlXCIsIHt0ZW1wbGF0ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdFN5bnRheFF1b3RlKCkge1xuICAgIGxldCBuYW1lXzE1MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN5bnRheFF1b3RlXCIsIHtuYW1lOiBuYW1lXzE1MywgdGVtcGxhdGU6IG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMTUzfSksIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSl9KTtcbiAgfVxuICBlbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9iamVjdF8xNTQgPSB0aGlzLnRlcm07XG4gICAgbGV0IGRvdF8xNTUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydHlfMTU2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7b2JqZWN0OiBvYmplY3RfMTU0LCBwcm9wZXJ0eTogcHJvcGVydHlfMTU2fSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGFycl8xNTcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgZWxlbWVudHNfMTU4ID0gW107XG4gICAgbGV0IGVuZl8xNTkgPSBuZXcgRW5mb3Jlc3RlcihhcnJfMTU3LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzE1OS5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gZW5mXzE1OS5wZWVrKCk7XG4gICAgICBpZiAoZW5mXzE1OS5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzE1OS5hZHZhbmNlKCk7XG4gICAgICAgIGVsZW1lbnRzXzE1OC5wdXNoKG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChlbmZfMTU5LmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIGVuZl8xNTkuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZXhwcmVzc2lvbiA9IGVuZl8xNTkuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mXzE1OS5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0aW5nIGV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudHNfMTU4LnB1c2gobmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiBleHByZXNzaW9ufSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHRlcm0gPSBlbmZfMTU5LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKHRlcm0gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xNTkuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGVkIGV4cHJlc3Npb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudHNfMTU4LnB1c2godGVybSk7XG4gICAgICAgIGVuZl8xNTkuY29uc3VtZUNvbW1hKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTU4KX0pO1xuICB9XG4gIGVuZm9yZXN0T2JqZWN0RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqXzE2MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzE2MSA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzE2MiA9IG5ldyBFbmZvcmVzdGVyKG9ial8xNjAuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBsYXN0UHJvcF8xNjMgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTYyLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBwcm9wID0gZW5mXzE2Mi5lbmZvcmVzdFByb3BlcnR5RGVmaW5pdGlvbigpO1xuICAgICAgZW5mXzE2Mi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIHByb3BlcnRpZXNfMTYxID0gcHJvcGVydGllc18xNjEuY29uY2F0KHByb3ApO1xuICAgICAgaWYgKGxhc3RQcm9wXzE2MyA9PT0gcHJvcCkge1xuICAgICAgICB0aHJvdyBlbmZfMTYyLmNyZWF0ZUVycm9yKHByb3AsIFwiaW52YWxpZCBzeW50YXggaW4gb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgbGFzdFByb3BfMTYzID0gcHJvcDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7cHJvcGVydGllczogcHJvcGVydGllc18xNjF9KTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5RGVmaW5pdGlvbigpIHtcbiAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IHRoaXMuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIFwibWV0aG9kXCI6XG4gICAgICAgIHJldHVybiBtZXRob2RPcktleTtcbiAgICAgIGNhc2UgXCJpZGVudGlmaWVyXCI6XG4gICAgICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7aW5pdDogaW5pdCwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKG1ldGhvZE9yS2V5KX0pO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCI6XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU2hvcnRoYW5kUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LnZhbHVlfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGxldCBleHByXzE2NCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRhdGFQcm9wZXJ0eVwiLCB7bmFtZTogbWV0aG9kT3JLZXksIGV4cHJlc3Npb246IGV4cHJfMTY0fSk7XG4gIH1cbiAgZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTY1ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE2NiA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTY1LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE2NiA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNjUsIFwiZ2V0XCIpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJHZXR0ZXJcIiwge25hbWU6IG5hbWUsIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTY1LCBcInNldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoUGFyZW5zKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBwYXJhbSA9IGVuZi5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIlNldHRlclwiLCB7bmFtZTogbmFtZSwgcGFyYW06IHBhcmFtLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgbGV0IHBhcmFtcyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihwYXJhbXMsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBmb3JtYWxQYXJhbXMgPSBlbmYuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIk1ldGhvZFwiLCB7aXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE2NiwgbmFtZTogbmFtZSwgcGFyYW1zOiBmb3JtYWxQYXJhbXMsIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfVxuICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5hbWUsIGtpbmQ6IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNjUpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNjUpID8gXCJpZGVudGlmaWVyXCIgOiBcInByb3BlcnR5XCJ9O1xuICB9XG4gIGVuZm9yZXN0UHJvcGVydHlOYW1lKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTY3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xNjcpIHx8IHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTY3KSkge1xuICAgICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSksIGJpbmRpbmc6IG51bGx9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNjcpKSB7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFNxdWFyZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGV4cHIgPSBlbmYuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIkNvbXB1dGVkUHJvcGVydHlOYW1lXCIsIHtleHByZXNzaW9uOiBleHByfSksIGJpbmRpbmc6IG51bGx9O1xuICAgIH1cbiAgICBsZXQgbmFtZV8xNjggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogbmFtZV8xNjh9KSwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV8xNjh9KX07XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByLCBpbkRlZmF1bHQsIGFsbG93R2VuZXJhdG9yfSkge1xuICAgIGxldCBuYW1lXzE2OSA9IG51bGwsIHBhcmFtc18xNzAsIGJvZHlfMTcxLCByZXN0XzE3MjtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTczID0gZmFsc2U7XG4gICAgbGV0IGZuS2V5d29yZF8xNzQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzE3NSA9IHRoaXMucGVlaygpO1xuICAgIGxldCB0eXBlXzE3NiA9IGlzRXhwciA/IFwiRnVuY3Rpb25FeHByZXNzaW9uXCIgOiBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE3NSwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xNzMgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMTc1ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTc1KSkge1xuICAgICAgbmFtZV8xNjkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9IGVsc2UgaWYgKGluRGVmYXVsdCkge1xuICAgICAgbmFtZV8xNjkgPSBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoXCIqZGVmYXVsdCpcIiwgZm5LZXl3b3JkXzE3NCl9KTtcbiAgICB9XG4gICAgcGFyYW1zXzE3MCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzE3MSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8xNzcgPSBuZXcgRW5mb3Jlc3RlcihwYXJhbXNfMTcwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18xNzggPSBlbmZfMTc3LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzE3Niwge25hbWU6IG5hbWVfMTY5LCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTczLCBwYXJhbXM6IGZvcm1hbFBhcmFtc18xNzgsIGJvZHk6IGJvZHlfMTcxfSk7XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG5hbWVfMTc5ID0gbnVsbCwgcGFyYW1zXzE4MCwgYm9keV8xODEsIHJlc3RfMTgyO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xODMgPSBmYWxzZTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzE4NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTg0LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE4MyA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZF8xODQgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xODQpKSB7XG4gICAgICBuYW1lXzE3OSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH1cbiAgICBwYXJhbXNfMTgwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTgxID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE4NSA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xODAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE4NiA9IGVuZl8xODUuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25FeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE3OSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE4MywgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTg2LCBib2R5OiBib2R5XzE4MX0pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbmFtZV8xODcsIHBhcmFtc18xODgsIGJvZHlfMTg5LCByZXN0XzE5MDtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTkxID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xOTIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE5MiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xOTEgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIG5hbWVfMTg3ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgcGFyYW1zXzE4OCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzE4OSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8xOTMgPSBuZXcgRW5mb3Jlc3RlcihwYXJhbXNfMTg4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18xOTQgPSBlbmZfMTkzLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIiwge25hbWU6IG5hbWVfMTg3LCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTkxLCBwYXJhbXM6IGZvcm1hbFBhcmFtc18xOTQsIGJvZHk6IGJvZHlfMTg5fSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCkge1xuICAgIGxldCBpdGVtc18xOTUgPSBbXTtcbiAgICBsZXQgcmVzdF8xOTYgPSBudWxsO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IHRoaXMucGVlaygpO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIuLi5cIikpIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIuLi5cIik7XG4gICAgICAgIHJlc3RfMTk2ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaXRlbXNfMTk1LnB1c2godGhpcy5lbmZvcmVzdFBhcmFtKCkpO1xuICAgICAgdGhpcy5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IExpc3QoaXRlbXNfMTk1KSwgcmVzdDogcmVzdF8xOTZ9KTtcbiAgfVxuICBlbmZvcmVzdFBhcmFtKCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9wZXJhdG9yXzE5NyA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVXBkYXRlRXhwcmVzc2lvblwiLCB7aXNQcmVmaXg6IGZhbHNlLCBvcGVyYXRvcjogb3BlcmF0b3JfMTk3LnZhbCgpLCBvcGVyYW5kOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGhpcy50ZXJtKX0pO1xuICB9XG4gIGVuZm9yZXN0VW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8xOTggPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe3ByZWM6IHRoaXMub3BDdHgucHJlYywgY29tYmluZTogdGhpcy5vcEN0eC5jb21iaW5lfSk7XG4gICAgdGhpcy5vcEN0eC5wcmVjID0gMTQ7XG4gICAgdGhpcy5vcEN0eC5jb21iaW5lID0gcmlnaHRUZXJtXzE5OSA9PiB7XG4gICAgICBsZXQgdHlwZV8yMDAsIHRlcm1fMjAxLCBpc1ByZWZpeF8yMDI7XG4gICAgICBpZiAob3BlcmF0b3JfMTk4LnZhbCgpID09PSBcIisrXCIgfHwgb3BlcmF0b3JfMTk4LnZhbCgpID09PSBcIi0tXCIpIHtcbiAgICAgICAgdHlwZV8yMDAgPSBcIlVwZGF0ZUV4cHJlc3Npb25cIjtcbiAgICAgICAgdGVybV8yMDEgPSB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcocmlnaHRUZXJtXzE5OSk7XG4gICAgICAgIGlzUHJlZml4XzIwMiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlXzIwMCA9IFwiVW5hcnlFeHByZXNzaW9uXCI7XG4gICAgICAgIGlzUHJlZml4XzIwMiA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGVybV8yMDEgPSByaWdodFRlcm1fMTk5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMjAwLCB7b3BlcmF0b3I6IG9wZXJhdG9yXzE5OC52YWwoKSwgb3BlcmFuZDogdGVybV8yMDEsIGlzUHJlZml4OiBpc1ByZWZpeF8yMDJ9KTtcbiAgICB9O1xuICAgIHJldHVybiBFWFBSX0xPT1BfT1BFUkFUT1JfMjY7XG4gIH1cbiAgZW5mb3Jlc3RDb25kaXRpb25hbEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IHRlc3RfMjAzID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgaWYgKHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiP1wiKTtcbiAgICBsZXQgZW5mXzIwNCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjb25zZXF1ZW50XzIwNSA9IGVuZl8yMDQuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGVuZl8yMDQubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBlbmZfMjA0ID0gbmV3IEVuZm9yZXN0ZXIoZW5mXzIwNC5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGFsdGVybmF0ZV8yMDYgPSBlbmZfMjA0LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB0aGlzLnJlc3QgPSBlbmZfMjA0LnJlc3Q7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIsIHt0ZXN0OiB0ZXN0XzIwMywgY29uc2VxdWVudDogY29uc2VxdWVudF8yMDUsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzIwNn0pO1xuICB9XG4gIGVuZm9yZXN0QmluYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbGVmdFRlcm1fMjA3ID0gdGhpcy50ZXJtO1xuICAgIGxldCBvcFN0eF8yMDggPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgb3BfMjA5ID0gb3BTdHhfMjA4LnZhbCgpO1xuICAgIGxldCBvcFByZWNfMjEwID0gZ2V0T3BlcmF0b3JQcmVjKG9wXzIwOSk7XG4gICAgbGV0IG9wQXNzb2NfMjExID0gZ2V0T3BlcmF0b3JBc3NvYyhvcF8yMDkpO1xuICAgIGlmIChvcGVyYXRvckx0KHRoaXMub3BDdHgucHJlYywgb3BQcmVjXzIxMCwgb3BBc3NvY18yMTEpKSB7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gb3BQcmVjXzIxMDtcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMTIgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5hcnlFeHByZXNzaW9uXCIsIHtsZWZ0OiBsZWZ0VGVybV8yMDcsIG9wZXJhdG9yOiBvcFN0eF8yMDgsIHJpZ2h0OiByaWdodFRlcm1fMjEyfSk7XG4gICAgICB9O1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzI2O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMub3BDdHguY29tYmluZShsZWZ0VGVybV8yMDcpO1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgIHJldHVybiB0ZXJtO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMTMgPSB0aGlzLm1hdGNoVGVtcGxhdGUoKTtcbiAgICBsZXQgZWxlbWVudHNfMjE0ID0gbG9va2FoZWFkXzIxMy50b2tlbi5pdGVtcy5tYXAoaXRfMjE1ID0+IHtcbiAgICAgIGlmIChpdF8yMTUgaW5zdGFuY2VvZiBTeW50YXggJiYgaXRfMjE1LmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKGl0XzIxNS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICAgIHJldHVybiBlbmYuZW5mb3Jlc3QoXCJleHByZXNzaW9uXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFbGVtZW50XCIsIHtyYXdWYWx1ZTogaXRfMjE1LnNsaWNlLnRleHR9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZWxlbWVudHNfMjE0O1xuICB9XG4gIGV4cGFuZE1hY3JvKGVuZm9yZXN0VHlwZV8yMTYpIHtcbiAgICBsZXQgbmFtZV8yMTcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgc3ludGF4VHJhbnNmb3JtXzIxOCA9IHRoaXMuZ2V0Q29tcGlsZXRpbWVUcmFuc2Zvcm0obmFtZV8yMTcpO1xuICAgIGlmIChzeW50YXhUcmFuc2Zvcm1fMjE4ID09IG51bGwgfHwgdHlwZW9mIHN5bnRheFRyYW5zZm9ybV8yMTgudmFsdWUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIxNywgXCJ0aGUgbWFjcm8gbmFtZSB3YXMgbm90IGJvdW5kIHRvIGEgdmFsdWUgdGhhdCBjb3VsZCBiZSBpbnZva2VkXCIpO1xuICAgIH1cbiAgICBsZXQgdXNlU2l0ZVNjb3BlXzIxOSA9IGZyZXNoU2NvcGUoXCJ1XCIpO1xuICAgIGxldCBpbnRyb2R1Y2VkU2NvcGVfMjIwID0gZnJlc2hTY29wZShcImlcIik7XG4gICAgdGhpcy5jb250ZXh0LnVzZVNjb3BlID0gdXNlU2l0ZVNjb3BlXzIxOTtcbiAgICBsZXQgY3R4XzIyMSA9IG5ldyBNYWNyb0NvbnRleHQodGhpcywgbmFtZV8yMTcsIHRoaXMuY29udGV4dCwgdXNlU2l0ZVNjb3BlXzIxOSwgaW50cm9kdWNlZFNjb3BlXzIyMCk7XG4gICAgbGV0IHJlc3VsdF8yMjIgPSBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHN5bnRheFRyYW5zZm9ybV8yMTgudmFsdWUuY2FsbChudWxsLCBjdHhfMjIxKSk7XG4gICAgaWYgKCFMaXN0LmlzTGlzdChyZXN1bHRfMjIyKSkge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIxNywgXCJtYWNybyBtdXN0IHJldHVybiBhIGxpc3QgYnV0IGdvdDogXCIgKyByZXN1bHRfMjIyKTtcbiAgICB9XG4gICAgcmVzdWx0XzIyMiA9IHJlc3VsdF8yMjIubWFwKHN0eF8yMjMgPT4ge1xuICAgICAgaWYgKCEoc3R4XzIyMyAmJiB0eXBlb2Ygc3R4XzIyMy5hZGRTY29wZSA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWVfMjE3LCBcIm1hY3JvIG11c3QgcmV0dXJuIHN5bnRheCBvYmplY3RzIG9yIHRlcm1zIGJ1dCBnb3Q6IFwiICsgc3R4XzIyMyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3R4XzIyMy5hZGRTY29wZShpbnRyb2R1Y2VkU2NvcGVfMjIwLCB0aGlzLmNvbnRleHQuYmluZGluZ3MsIHtmbGlwOiB0cnVlfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdF8yMjI7XG4gIH1cbiAgY29uc3VtZVNlbWljb2xvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzIyNCA9IHRoaXMucGVlaygpO1xuICAgIGlmIChsb29rYWhlYWRfMjI0ICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMjQsIFwiO1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICB9XG4gIGNvbnN1bWVDb21tYSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzIyNSA9IHRoaXMucGVlaygpO1xuICAgIGlmIChsb29rYWhlYWRfMjI1ICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMjUsIFwiLFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICB9XG4gIGlzVGVybSh0ZXJtXzIyNikge1xuICAgIHJldHVybiB0ZXJtXzIyNiAmJiB0ZXJtXzIyNiBpbnN0YW5jZW9mIFRlcm07XG4gIH1cbiAgaXNFT0YodGVybV8yMjcpIHtcbiAgICByZXR1cm4gdGVybV8yMjcgJiYgdGVybV8yMjcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjcuaXNFT0YoKTtcbiAgfVxuICBpc0lkZW50aWZpZXIodGVybV8yMjgsIHZhbF8yMjkgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRlcm1fMjI4ICYmIHRlcm1fMjI4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjI4LmlzSWRlbnRpZmllcigpICYmICh2YWxfMjI5ID09PSBudWxsIHx8IHRlcm1fMjI4LnZhbCgpID09PSB2YWxfMjI5KTtcbiAgfVxuICBpc1Byb3BlcnR5TmFtZSh0ZXJtXzIzMCkge1xuICAgIHJldHVybiB0aGlzLmlzSWRlbnRpZmllcih0ZXJtXzIzMCkgfHwgdGhpcy5pc0tleXdvcmQodGVybV8yMzApIHx8IHRoaXMuaXNOdW1lcmljTGl0ZXJhbCh0ZXJtXzIzMCkgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwodGVybV8yMzApIHx8IHRoaXMuaXNCcmFja2V0cyh0ZXJtXzIzMCk7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbCh0ZXJtXzIzMSkge1xuICAgIHJldHVybiB0ZXJtXzIzMSAmJiB0ZXJtXzIzMSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzMS5pc051bWVyaWNMaXRlcmFsKCk7XG4gIH1cbiAgaXNTdHJpbmdMaXRlcmFsKHRlcm1fMjMyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjMyICYmIHRlcm1fMjMyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjMyLmlzU3RyaW5nTGl0ZXJhbCgpO1xuICB9XG4gIGlzVGVtcGxhdGUodGVybV8yMzMpIHtcbiAgICByZXR1cm4gdGVybV8yMzMgJiYgdGVybV8yMzMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzMuaXNUZW1wbGF0ZSgpO1xuICB9XG4gIGlzQm9vbGVhbkxpdGVyYWwodGVybV8yMzQpIHtcbiAgICByZXR1cm4gdGVybV8yMzQgJiYgdGVybV8yMzQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzQuaXNCb29sZWFuTGl0ZXJhbCgpO1xuICB9XG4gIGlzTnVsbExpdGVyYWwodGVybV8yMzUpIHtcbiAgICByZXR1cm4gdGVybV8yMzUgJiYgdGVybV8yMzUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzUuaXNOdWxsTGl0ZXJhbCgpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24odGVybV8yMzYpIHtcbiAgICByZXR1cm4gdGVybV8yMzYgJiYgdGVybV8yMzYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzYuaXNSZWd1bGFyRXhwcmVzc2lvbigpO1xuICB9XG4gIGlzUGFyZW5zKHRlcm1fMjM3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM3ICYmIHRlcm1fMjM3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM3LmlzUGFyZW5zKCk7XG4gIH1cbiAgaXNCcmFjZXModGVybV8yMzgpIHtcbiAgICByZXR1cm4gdGVybV8yMzggJiYgdGVybV8yMzggaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzguaXNCcmFjZXMoKTtcbiAgfVxuICBpc0JyYWNrZXRzKHRlcm1fMjM5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM5ICYmIHRlcm1fMjM5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM5LmlzQnJhY2tldHMoKTtcbiAgfVxuICBpc0Fzc2lnbih0ZXJtXzI0MCkge1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0ZXJtXzI0MCkpIHtcbiAgICAgIHN3aXRjaCAodGVybV8yNDAudmFsKCkpIHtcbiAgICAgICAgY2FzZSBcIj1cIjpcbiAgICAgICAgY2FzZSBcInw9XCI6XG4gICAgICAgIGNhc2UgXCJePVwiOlxuICAgICAgICBjYXNlIFwiJj1cIjpcbiAgICAgICAgY2FzZSBcIjw8PVwiOlxuICAgICAgICBjYXNlIFwiPj49XCI6XG4gICAgICAgIGNhc2UgXCI+Pj49XCI6XG4gICAgICAgIGNhc2UgXCIrPVwiOlxuICAgICAgICBjYXNlIFwiLT1cIjpcbiAgICAgICAgY2FzZSBcIio9XCI6XG4gICAgICAgIGNhc2UgXCIvPVwiOlxuICAgICAgICBjYXNlIFwiJT1cIjpcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpc0tleXdvcmQodGVybV8yNDEsIHZhbF8yNDIgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRlcm1fMjQxICYmIHRlcm1fMjQxIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQxLmlzS2V5d29yZCgpICYmICh2YWxfMjQyID09PSBudWxsIHx8IHRlcm1fMjQxLnZhbCgpID09PSB2YWxfMjQyKTtcbiAgfVxuICBpc1B1bmN0dWF0b3IodGVybV8yNDMsIHZhbF8yNDQgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRlcm1fMjQzICYmIHRlcm1fMjQzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQzLmlzUHVuY3R1YXRvcigpICYmICh2YWxfMjQ0ID09PSBudWxsIHx8IHRlcm1fMjQzLnZhbCgpID09PSB2YWxfMjQ0KTtcbiAgfVxuICBpc09wZXJhdG9yKHRlcm1fMjQ1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ1ICYmIHRlcm1fMjQ1IGluc3RhbmNlb2YgU3ludGF4ICYmIGlzT3BlcmF0b3IodGVybV8yNDUpO1xuICB9XG4gIGlzVXBkYXRlT3BlcmF0b3IodGVybV8yNDYpIHtcbiAgICByZXR1cm4gdGVybV8yNDYgJiYgdGVybV8yNDYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDYuaXNQdW5jdHVhdG9yKCkgJiYgKHRlcm1fMjQ2LnZhbCgpID09PSBcIisrXCIgfHwgdGVybV8yNDYudmFsKCkgPT09IFwiLS1cIik7XG4gIH1cbiAgaXNGbkRlY2xUcmFuc2Zvcm0odGVybV8yNDcpIHtcbiAgICByZXR1cm4gdGVybV8yNDcgJiYgdGVybV8yNDcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDcucmVzb2x2ZSgpKSA9PT0gRnVuY3Rpb25EZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzVmFyRGVjbFRyYW5zZm9ybSh0ZXJtXzI0OCkge1xuICAgIHJldHVybiB0ZXJtXzI0OCAmJiB0ZXJtXzI0OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI0OC5yZXNvbHZlKCkpID09PSBWYXJpYWJsZURlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNMZXREZWNsVHJhbnNmb3JtKHRlcm1fMjQ5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ5ICYmIHRlcm1fMjQ5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ5LnJlc29sdmUoKSkgPT09IExldERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb25zdERlY2xUcmFuc2Zvcm0odGVybV8yNTApIHtcbiAgICByZXR1cm4gdGVybV8yNTAgJiYgdGVybV8yNTAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTAucmVzb2x2ZSgpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzU3ludGF4RGVjbFRyYW5zZm9ybSh0ZXJtXzI1MSkge1xuICAgIHJldHVybiB0ZXJtXzI1MSAmJiB0ZXJtXzI1MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1MS5yZXNvbHZlKCkpID09PSBTeW50YXhEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybSh0ZXJtXzI1Mikge1xuICAgIHJldHVybiB0ZXJtXzI1MiAmJiB0ZXJtXzI1MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1Mi5yZXNvbHZlKCkpID09PSBTeW50YXhyZWNEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUodGVybV8yNTMpIHtcbiAgICByZXR1cm4gdGVybV8yNTMgJiYgdGVybV8yNTMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNTMuaXNTeW50YXhUZW1wbGF0ZSgpO1xuICB9XG4gIGlzU3ludGF4UXVvdGVUcmFuc2Zvcm0odGVybV8yNTQpIHtcbiAgICByZXR1cm4gdGVybV8yNTQgJiYgdGVybV8yNTQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTQucmVzb2x2ZSgpKSA9PT0gU3ludGF4UXVvdGVUcmFuc2Zvcm07XG4gIH1cbiAgaXNSZXR1cm5TdG10VHJhbnNmb3JtKHRlcm1fMjU1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU1ICYmIHRlcm1fMjU1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU1LnJlc29sdmUoKSkgPT09IFJldHVyblN0YXRlbWVudFRyYW5zZm9ybTtcbiAgfVxuICBpc1doaWxlVHJhbnNmb3JtKHRlcm1fMjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU2ICYmIHRlcm1fMjU2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU2LnJlc29sdmUoKSkgPT09IFdoaWxlVHJhbnNmb3JtO1xuICB9XG4gIGlzRm9yVHJhbnNmb3JtKHRlcm1fMjU3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU3ICYmIHRlcm1fMjU3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU3LnJlc29sdmUoKSkgPT09IEZvclRyYW5zZm9ybTtcbiAgfVxuICBpc1N3aXRjaFRyYW5zZm9ybSh0ZXJtXzI1OCkge1xuICAgIHJldHVybiB0ZXJtXzI1OCAmJiB0ZXJtXzI1OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OC5yZXNvbHZlKCkpID09PSBTd2l0Y2hUcmFuc2Zvcm07XG4gIH1cbiAgaXNCcmVha1RyYW5zZm9ybSh0ZXJtXzI1OSkge1xuICAgIHJldHVybiB0ZXJtXzI1OSAmJiB0ZXJtXzI1OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OS5yZXNvbHZlKCkpID09PSBCcmVha1RyYW5zZm9ybTtcbiAgfVxuICBpc0NvbnRpbnVlVHJhbnNmb3JtKHRlcm1fMjYwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYwICYmIHRlcm1fMjYwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYwLnJlc29sdmUoKSkgPT09IENvbnRpbnVlVHJhbnNmb3JtO1xuICB9XG4gIGlzRG9UcmFuc2Zvcm0odGVybV8yNjEpIHtcbiAgICByZXR1cm4gdGVybV8yNjEgJiYgdGVybV8yNjEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjEucmVzb2x2ZSgpKSA9PT0gRG9UcmFuc2Zvcm07XG4gIH1cbiAgaXNEZWJ1Z2dlclRyYW5zZm9ybSh0ZXJtXzI2Mikge1xuICAgIHJldHVybiB0ZXJtXzI2MiAmJiB0ZXJtXzI2MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2Mi5yZXNvbHZlKCkpID09PSBEZWJ1Z2dlclRyYW5zZm9ybTtcbiAgfVxuICBpc1dpdGhUcmFuc2Zvcm0odGVybV8yNjMpIHtcbiAgICByZXR1cm4gdGVybV8yNjMgJiYgdGVybV8yNjMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjMucmVzb2x2ZSgpKSA9PT0gV2l0aFRyYW5zZm9ybTtcbiAgfVxuICBpc1RyeVRyYW5zZm9ybSh0ZXJtXzI2NCkge1xuICAgIHJldHVybiB0ZXJtXzI2NCAmJiB0ZXJtXzI2NCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2NC5yZXNvbHZlKCkpID09PSBUcnlUcmFuc2Zvcm07XG4gIH1cbiAgaXNUaHJvd1RyYW5zZm9ybSh0ZXJtXzI2NSkge1xuICAgIHJldHVybiB0ZXJtXzI2NSAmJiB0ZXJtXzI2NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2NS5yZXNvbHZlKCkpID09PSBUaHJvd1RyYW5zZm9ybTtcbiAgfVxuICBpc0lmVHJhbnNmb3JtKHRlcm1fMjY2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY2ICYmIHRlcm1fMjY2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY2LnJlc29sdmUoKSkgPT09IElmVHJhbnNmb3JtO1xuICB9XG4gIGlzTmV3VHJhbnNmb3JtKHRlcm1fMjY3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY3ICYmIHRlcm1fMjY3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY3LnJlc29sdmUoKSkgPT09IE5ld1RyYW5zZm9ybTtcbiAgfVxuICBpc0NvbXBpbGV0aW1lVHJhbnNmb3JtKHRlcm1fMjY4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY4ICYmIHRlcm1fMjY4IGluc3RhbmNlb2YgU3ludGF4ICYmICh0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OC5yZXNvbHZlKCkpIGluc3RhbmNlb2YgQ29tcGlsZXRpbWVUcmFuc2Zvcm0gfHwgdGhpcy5jb250ZXh0LnN0b3JlLmdldCh0ZXJtXzI2OC5yZXNvbHZlKCkpIGluc3RhbmNlb2YgQ29tcGlsZXRpbWVUcmFuc2Zvcm0pO1xuICB9XG4gIGdldENvbXBpbGV0aW1lVHJhbnNmb3JtKHRlcm1fMjY5KSB7XG4gICAgaWYgKHRoaXMuY29udGV4dC5lbnYuaGFzKHRlcm1fMjY5LnJlc29sdmUoKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OS5yZXNvbHZlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LnN0b3JlLmdldCh0ZXJtXzI2OS5yZXNvbHZlKCkpO1xuICB9XG4gIGxpbmVOdW1iZXJFcShhXzI3MCwgYl8yNzEpIHtcbiAgICBpZiAoIShhXzI3MCAmJiBiXzI3MSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYXNzZXJ0KGFfMjcwIGluc3RhbmNlb2YgU3ludGF4LCBcImV4cGVjdGluZyBhIHN5bnRheCBvYmplY3RcIik7XG4gICAgYXNzZXJ0KGJfMjcxIGluc3RhbmNlb2YgU3ludGF4LCBcImV4cGVjdGluZyBhIHN5bnRheCBvYmplY3RcIik7XG4gICAgcmV0dXJuIGFfMjcwLmxpbmVOdW1iZXIoKSA9PT0gYl8yNzEubGluZU51bWJlcigpO1xuICB9XG4gIG1hdGNoSWRlbnRpZmllcih2YWxfMjcyKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzI3MykpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjczO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzMsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgbWF0Y2hLZXl3b3JkKHZhbF8yNzQpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMjc1LCB2YWxfMjc0KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzU7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3NSwgXCJleHBlY3RpbmcgXCIgKyB2YWxfMjc0KTtcbiAgfVxuICBtYXRjaExpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzYgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8yNzYpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yNzYpIHx8IHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMjc2KSB8fCB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzI3NikgfHwgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yNzYpIHx8IHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMjc2KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzY7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3NiwgXCJleHBlY3RpbmcgYSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoU3RyaW5nTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3NyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMjc3KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzc7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3NywgXCJleHBlY3RpbmcgYSBzdHJpbmcgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFRlbXBsYXRlKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMjc4KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzg7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3OCwgXCJleHBlY3RpbmcgYSB0ZW1wbGF0ZSBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoUGFyZW5zKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzI3OSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc5LmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3OSwgXCJleHBlY3RpbmcgcGFyZW5zXCIpO1xuICB9XG4gIG1hdGNoQ3VybGllcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8yODApKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MC5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODAsIFwiZXhwZWN0aW5nIGN1cmx5IGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFNxdWFyZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODEgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8yODEpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MS5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODEsIFwiZXhwZWN0aW5nIHNxYXVyZSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hVbmFyeU9wZXJhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjgyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKGlzVW5hcnlPcGVyYXRvcihsb29rYWhlYWRfMjgyKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODI7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4MiwgXCJleHBlY3RpbmcgYSB1bmFyeSBvcGVyYXRvclwiKTtcbiAgfVxuICBtYXRjaFB1bmN0dWF0b3IodmFsXzI4Mykge1xuICAgIGxldCBsb29rYWhlYWRfMjg0ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yODQpKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbF8yODMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKGxvb2thaGVhZF8yODQudmFsKCkgPT09IHZhbF8yODMpIHtcbiAgICAgICAgICByZXR1cm4gbG9va2FoZWFkXzI4NDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODQsIFwiZXhwZWN0aW5nIGEgXCIgKyB2YWxfMjgzICsgXCIgcHVuY3R1YXRvclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4NCwgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGNyZWF0ZUVycm9yKHN0eF8yODUsIG1lc3NhZ2VfMjg2KSB7XG4gICAgbGV0IGN0eF8yODcgPSBcIlwiO1xuICAgIGxldCBvZmZlbmRpbmdfMjg4ID0gc3R4XzI4NTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBjdHhfMjg3ID0gdGhpcy5yZXN0LnNsaWNlKDAsIDIwKS5tYXAodGVybV8yODkgPT4ge1xuICAgICAgICBpZiAodGVybV8yODkuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICAgIHJldHVybiB0ZXJtXzI4OS5pbm5lcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMaXN0Lm9mKHRlcm1fMjg5KTtcbiAgICAgIH0pLmZsYXR0ZW4oKS5tYXAoc18yOTAgPT4ge1xuICAgICAgICBpZiAoc18yOTAgPT09IG9mZmVuZGluZ18yODgpIHtcbiAgICAgICAgICByZXR1cm4gXCJfX1wiICsgc18yOTAudmFsKCkgKyBcIl9fXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNfMjkwLnZhbCgpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eF8yODcgPSBvZmZlbmRpbmdfMjg4LnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZV8yODYgKyBcIlxcblwiICsgY3R4XzI4Nyk7XG4gIH1cbn1cbiJdfQ==