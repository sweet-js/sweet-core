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
        this.term = null;
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
//# sourceMappingURL=data:application/json;base64,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IFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtGdW5jdGlvbkRlY2xUcmFuc2Zvcm0sIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSwgTmV3VHJhbnNmb3JtLCBMZXREZWNsVHJhbnNmb3JtLCBDb25zdERlY2xUcmFuc2Zvcm0sIFN5bnRheERlY2xUcmFuc2Zvcm0sIFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0sIFN5bnRheFF1b3RlVHJhbnNmb3JtLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0sIFdoaWxlVHJhbnNmb3JtLCBJZlRyYW5zZm9ybSwgRm9yVHJhbnNmb3JtLCBTd2l0Y2hUcmFuc2Zvcm0sIEJyZWFrVHJhbnNmb3JtLCBDb250aW51ZVRyYW5zZm9ybSwgRG9UcmFuc2Zvcm0sIERlYnVnZ2VyVHJhbnNmb3JtLCBXaXRoVHJhbnNmb3JtLCBUcnlUcmFuc2Zvcm0sIFRocm93VHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7aXNPcGVyYXRvciwgaXNVbmFyeU9wZXJhdG9yLCBnZXRPcGVyYXRvckFzc29jLCBnZXRPcGVyYXRvclByZWMsIG9wZXJhdG9yTHR9IGZyb20gXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7ZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCB7c2FuaXRpemVSZXBsYWNlbWVudFZhbHVlc30gZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzI2ID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3ID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4ID0ge307XG5leHBvcnQgY2xhc3MgRW5mb3Jlc3RlciB7XG4gIGNvbnN0cnVjdG9yKHN0eGxfMjksIHByZXZfMzAsIGNvbnRleHRfMzEpIHtcbiAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3Qoc3R4bF8yOSksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3QocHJldl8zMCksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoY29udGV4dF8zMSwgXCJleHBlY3RpbmcgYSBjb250ZXh0IHRvIGVuZm9yZXN0XCIpO1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5yZXN0ID0gc3R4bF8yOTtcbiAgICB0aGlzLnByZXYgPSBwcmV2XzMwO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzE7XG4gIH1cbiAgcGVlayhuXzMyID0gMCkge1xuICAgIHJldHVybiB0aGlzLnJlc3QuZ2V0KG5fMzIpO1xuICB9XG4gIGFkdmFuY2UoKSB7XG4gICAgbGV0IHJldF8zMyA9IHRoaXMucmVzdC5maXJzdCgpO1xuICAgIHRoaXMucmVzdCA9IHRoaXMucmVzdC5yZXN0KCk7XG4gICAgcmV0dXJuIHJldF8zMztcbiAgfVxuICBlbmZvcmVzdCh0eXBlXzM0ID0gXCJNb2R1bGVcIikge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNFT0YodGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLnRlcm0gPSBuZXcgVGVybShcIkVPRlwiLCB7fSk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgfVxuICAgIGxldCByZXN1bHRfMzU7XG4gICAgaWYgKHR5cGVfMzQgPT09IFwiZXhwcmVzc2lvblwiKSB7XG4gICAgICByZXN1bHRfMzUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0XzM1ID0gdGhpcy5lbmZvcmVzdE1vZHVsZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfMzU7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCb2R5KCk7XG4gIH1cbiAgZW5mb3Jlc3RCb2R5KCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TW9kdWxlSXRlbSgpO1xuICB9XG4gIGVuZm9yZXN0TW9kdWxlSXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zNiwgXCJpbXBvcnRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM2LCBcImV4cG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8zNywgXCIqXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzM3KSkge1xuICAgICAgbGV0IG5hbWVkRXhwb3J0cyA9IHRoaXMuZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImZyb21cIikpIHtcbiAgICAgICAgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge25hbWVkRXhwb3J0czogbmFtZWRFeHBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2xhc3NcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IGJvZHl9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzM3LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0Q2xhdXNlKCkge1xuICAgIGxldCBlbmZfMzggPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF8zOSA9IFtdO1xuICAgIHdoaWxlIChlbmZfMzgucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfMzkucHVzaChlbmZfMzguZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSk7XG4gICAgICBlbmZfMzguY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8zOSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSB7XG4gICAgbGV0IG5hbWVfNDAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZXhwb3J0ZWROYW1lID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MCwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBleHBvcnRlZE5hbWU6IG5hbWVfNDB9KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDEgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgZGVmYXVsdEJpbmRpbmdfNDIgPSBudWxsO1xuICAgIGxldCBuYW1lZEltcG9ydHNfNDMgPSBMaXN0KCk7XG4gICAgbGV0IGZvclN5bnRheF80NCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfNDEpKSB7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBuYW1lZEltcG9ydHM6IG5hbWVkSW1wb3J0c180MywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF80MSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzQxKSkge1xuICAgICAgZGVmYXVsdEJpbmRpbmdfNDIgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXIsIG5hbWVkSW1wb3J0czogTGlzdCgpLCBmb3JTeW50YXg6IGZvclN5bnRheF80NH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIGxvb2thaGVhZF80MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF80MSkpIHtcbiAgICAgIGxldCBpbXBvcnRzID0gdGhpcy5lbmZvcmVzdE5hbWVkSW1wb3J0cygpO1xuICAgICAgbGV0IGZyb21DbGF1c2UgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBmb3JTeW50YXg6IGZvclN5bnRheF80NCwgbmFtZWRJbXBvcnRzOiBpbXBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IGZyb21DbGF1c2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF80MSwgXCIqXCIpKSB7XG4gICAgICBsZXQgbmFtZXNwYWNlQmluZGluZyA9IHRoaXMuZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF80NCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnROYW1lc3BhY2VcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgZm9yU3ludGF4OiBmb3JTeW50YXhfNDQsIG5hbWVzcGFjZUJpbmRpbmc6IG5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzQxLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIipcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lZEltcG9ydHMoKSB7XG4gICAgbGV0IGVuZl80NSA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzQ2ID0gW107XG4gICAgd2hpbGUgKGVuZl80NS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF80Ni5wdXNoKGVuZl80NS5lbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSk7XG4gICAgICBlbmZfNDUuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF80Nik7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbmFtZV80ODtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQ3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNDcpKSB7XG4gICAgICBuYW1lXzQ4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV80OH0pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF80NywgXCJ1bmV4cGVjdGVkIHRva2VuIGluIGltcG9ydCBzcGVjaWZpZXJcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80OCwgYmluZGluZzogdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCl9KTtcbiAgfVxuICBlbmZvcmVzdEZyb21DbGF1c2UoKSB7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJmcm9tXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNDkgPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBsb29rYWhlYWRfNDk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzUwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTAsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHRoaXMucmVzdCA9IHRoaXMuZXhwYW5kTWFjcm8oKS5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2hpbGVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZlRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdElmU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZvclRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZvclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTd2l0Y2hUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJlYWtUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb250aW51ZVRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RvVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RG9TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRGVidWdnZXJUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaXRoVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2l0aFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUcnlUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGhyb3dUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81MSwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzUxKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiOlwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSkge1xuICAgICAgbGV0IHN0bXQgPSBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBzdG10O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZXR1cm5TdG10VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzUxLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRW1wdHlTdGF0ZW1lbnRcIiwge30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxhYmVsXzUyID0gdGhpcy5tYXRjaElkZW50aWZpZXIoKTtcbiAgICBsZXQgcHVuY181MyA9IHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgc3RtdF81NCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTIsIGJvZHk6IHN0bXRfNTR9KTtcbiAgfVxuICBlbmZvcmVzdEJyZWFrU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiYnJlYWtcIik7XG4gICAgbGV0IGxvb2thaGVhZF81NSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBsYWJlbF81NiA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81NSwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTZ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81NSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU1LCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NSwgXCJsZXRcIikpIHtcbiAgICAgIGxhYmVsXzU2ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF81Nn0pO1xuICB9XG4gIGVuZm9yZXN0VHJ5U3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwidHJ5XCIpO1xuICAgIGxldCBib2R5XzU3ID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhdGNoXCIpKSB7XG4gICAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0aGlzLmVuZm9yZXN0Q2F0Y2hDbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZmluYWxpemVyID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTcsIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZSwgZmluYWxpemVyOiBmaW5hbGl6ZXJ9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUNhdGNoU3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU3LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZpbmFsbHlcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NywgY2F0Y2hDbGF1c2U6IG51bGwsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidHJ5IHdpdGggbm8gY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgfVxuICBlbmZvcmVzdENhdGNoQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2F0Y2hcIik7XG4gICAgbGV0IGJpbmRpbmdQYXJlbnNfNTggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl81OSA9IG5ldyBFbmZvcmVzdGVyKGJpbmRpbmdQYXJlbnNfNTgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYmluZGluZ182MCA9IGVuZl81OS5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBsZXQgYm9keV82MSA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiBiaW5kaW5nXzYwLCBib2R5OiBib2R5XzYxfSk7XG4gIH1cbiAgZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRocm93XCIpO1xuICAgIGxldCBleHByZXNzaW9uXzYyID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbl82Mn0pO1xuICB9XG4gIGVuZm9yZXN0V2l0aFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndpdGhcIik7XG4gICAgbGV0IG9ialBhcmVuc182MyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzY0ID0gbmV3IEVuZm9yZXN0ZXIob2JqUGFyZW5zXzYzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG9iamVjdF82NSA9IGVuZl82NC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBsZXQgYm9keV82NiA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtvYmplY3Q6IG9iamVjdF82NSwgYm9keTogYm9keV82Nn0pO1xuICB9XG4gIGVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWJ1Z2dlclwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEZWJ1Z2dlclN0YXRlbWVudFwiLCB7fSk7XG4gIH1cbiAgZW5mb3Jlc3REb1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRvXCIpO1xuICAgIGxldCBib2R5XzY3ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IHRlc3RCb2R5XzY4ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNjkgPSBuZXcgRW5mb3Jlc3Rlcih0ZXN0Qm9keV82OCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCB0ZXN0XzcwID0gZW5mXzY5LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNjcsIHRlc3Q6IHRlc3RfNzB9KTtcbiAgfVxuICBlbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCkge1xuICAgIGxldCBrd2RfNzEgPSB0aGlzLm1hdGNoS2V5d29yZChcImNvbnRpbnVlXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNzIgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzMgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNzIsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxpbmVOdW1iZXJFcShrd2RfNzEsIGxvb2thaGVhZF83MikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF83MikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzcyLCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJsZXRcIikpKSB7XG4gICAgICBsYWJlbF83MyA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzN9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInN3aXRjaFwiKTtcbiAgICBsZXQgY29uZF83NCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzc1ID0gbmV3IEVuZm9yZXN0ZXIoY29uZF83NCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBkaXNjcmltaW5hbnRfNzYgPSBlbmZfNzUuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfNzcgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGlmIChib2R5Xzc3LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIGNhc2VzOiBMaXN0KCl9KTtcbiAgICB9XG4gICAgZW5mXzc1ID0gbmV3IEVuZm9yZXN0ZXIoYm9keV83NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjYXNlc183OCA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgbGV0IGxvb2thaGVhZF83OSA9IGVuZl83NS5wZWVrKCk7XG4gICAgaWYgKGVuZl83NS5pc0tleXdvcmQobG9va2FoZWFkXzc5LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIGxldCBkZWZhdWx0Q2FzZSA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaERlZmF1bHQoKTtcbiAgICAgIGxldCBwb3N0RGVmYXVsdENhc2VzID0gZW5mXzc1LmVuZm9yZXN0U3dpdGNoQ2FzZXMoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF83NiwgcHJlRGVmYXVsdENhc2VzOiBjYXNlc183OCwgZGVmYXVsdENhc2U6IGRlZmF1bHRDYXNlLCBwb3N0RGVmYXVsdENhc2VzOiBwb3N0RGVmYXVsdENhc2VzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIGNhc2VzOiBjYXNlc183OH0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZXMoKSB7XG4gICAgbGV0IGNhc2VzXzgwID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSkpIHtcbiAgICAgIGNhc2VzXzgwLnB1c2godGhpcy5lbmZvcmVzdFN3aXRjaENhc2UoKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KGNhc2VzXzgwKTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2UoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJjYXNlXCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCksIGNvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SW5Td2l0Y2hDYXNlQm9keSgpO1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgbGV0IHJlc3VsdF84MSA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2FzZVwiKSkpIHtcbiAgICAgIHJlc3VsdF84MS5wdXNoKHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzgxKTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaERlZmF1bHQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWZhdWx0XCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJmb3JcIik7XG4gICAgbGV0IGNvbmRfODIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MyA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfODIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzg0LCB0ZXN0Xzg1LCBpbml0Xzg2LCByaWdodF84NywgdHlwZV84OCwgbGVmdF84OSwgdXBkYXRlXzkwO1xuICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgaWYgKGVuZl84My5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IG51bGwsIHRlc3Q6IHRlc3RfODUsIHVwZGF0ZTogcmlnaHRfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb29rYWhlYWRfODQgPSBlbmZfODMucGVlaygpO1xuICAgICAgaWYgKGVuZl84My5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzg0KSB8fCBlbmZfODMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkgfHwgZW5mXzgzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkpIHtcbiAgICAgICAgaW5pdF84NiA9IGVuZl84My5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgbG9va2FoZWFkXzg0ID0gZW5mXzgzLnBlZWsoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84NCwgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODQsIFwib2ZcIikpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzg0LCBcImluXCIpKSB7XG4gICAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzg0LCBcIm9mXCIpKSB7XG4gICAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84OCwge2xlZnQ6IGluaXRfODYsIHJpZ2h0OiByaWdodF84NywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF84NSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfOTAgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoZW5mXzgzLnBlZWsoMSksIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mXzgzLnBlZWsoMSksIFwib2ZcIikpIHtcbiAgICAgICAgICBsZWZ0Xzg5ID0gZW5mXzgzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgICBsZXQga2luZCA9IGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGtpbmQsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg4LCB7bGVmdDogbGVmdF84OSwgcmlnaHQ6IHJpZ2h0Xzg3LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBpbml0Xzg2ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0Xzg1ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0Xzg1ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV85MCA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF84NiwgdGVzdDogdGVzdF84NSwgdXBkYXRlOiB1cGRhdGVfOTAsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdElmU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiaWZcIik7XG4gICAgbGV0IGNvbmRfOTEgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfOTEsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzkzID0gZW5mXzkyLnBlZWsoKTtcbiAgICBsZXQgdGVzdF85NCA9IGVuZl85Mi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF85NCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzkyLmNyZWF0ZUVycm9yKGxvb2thaGVhZF85MywgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGNvbnNlcXVlbnRfOTUgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgbGV0IGFsdGVybmF0ZV85NiA9IG51bGw7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImVsc2VcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgYWx0ZXJuYXRlXzk2ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF85NCwgY29uc2VxdWVudDogY29uc2VxdWVudF85NSwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfOTZ9KTtcbiAgfVxuICBlbmZvcmVzdFdoaWxlU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IGNvbmRfOTcgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85OCA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfOTcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzk5ID0gZW5mXzk4LnBlZWsoKTtcbiAgICBsZXQgdGVzdF8xMDAgPSBlbmZfOTguZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfMTAwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfOTguY3JlYXRlRXJyb3IobG9va2FoZWFkXzk5LCBcImV4cGVjdGluZyBhbiBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBsZXQgYm9keV8xMDEgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfMTAwLCBib2R5OiBib2R5XzEwMX0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmVuZm9yZXN0QmxvY2soKX0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2soKSB7XG4gICAgbGV0IGJfMTAyID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgYm9keV8xMDMgPSBbXTtcbiAgICBsZXQgZW5mXzEwNCA9IG5ldyBFbmZvcmVzdGVyKGJfMTAyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xMDQucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gZW5mXzEwNC5wZWVrKCk7XG4gICAgICBsZXQgc3RtdCA9IGVuZl8xMDQuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICAgIGlmIChzdG10ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgZW5mXzEwNC5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwibm90IGEgc3RhdGVtZW50XCIpO1xuICAgICAgfVxuICAgICAgYm9keV8xMDMucHVzaChzdG10KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tcIiwge3N0YXRlbWVudHM6IExpc3QoYm9keV8xMDMpfSk7XG4gIH1cbiAgZW5mb3Jlc3RDbGFzcyh7aXNFeHByLCBpbkRlZmF1bHR9KSB7XG4gICAgbGV0IGt3XzEwNSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBuYW1lXzEwNiA9IG51bGwsIHN1cHJfMTA3ID0gbnVsbDtcbiAgICBsZXQgdHlwZV8xMDggPSBpc0V4cHIgPyBcIkNsYXNzRXhwcmVzc2lvblwiIDogXCJDbGFzc0RlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgbmFtZV8xMDYgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9IGVsc2UgaWYgKCFpc0V4cHIpIHtcbiAgICAgIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgICAgbmFtZV8xMDYgPSBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoXCJfZGVmYXVsdFwiLCBrd18xMDUpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZXh0ZW5kc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBzdXByXzEwNyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH1cbiAgICBsZXQgZWxlbWVudHNfMTA5ID0gW107XG4gICAgbGV0IGVuZl8xMTAgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xMTAucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBpZiAoZW5mXzExMC5pc1B1bmN0dWF0b3IoZW5mXzExMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICBlbmZfMTEwLmFkdmFuY2UoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgaXNTdGF0aWMgPSBmYWxzZTtcbiAgICAgIGxldCB7bWV0aG9kT3JLZXksIGtpbmR9ID0gZW5mXzExMC5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICAgIGlmIChraW5kID09PSBcImlkZW50aWZpZXJcIiAmJiBtZXRob2RPcktleS52YWx1ZS52YWwoKSA9PT0gXCJzdGF0aWNcIikge1xuICAgICAgICBpc1N0YXRpYyA9IHRydWU7XG4gICAgICAgICh7bWV0aG9kT3JLZXksIGtpbmR9ID0gZW5mXzExMC5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKSk7XG4gICAgICB9XG4gICAgICBpZiAoa2luZCA9PT0gXCJtZXRob2RcIikge1xuICAgICAgICBlbGVtZW50c18xMDkucHVzaChuZXcgVGVybShcIkNsYXNzRWxlbWVudFwiLCB7aXNTdGF0aWM6IGlzU3RhdGljLCBtZXRob2Q6IG1ldGhvZE9yS2V5fSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihlbmZfMTEwLnBlZWsoKSwgXCJPbmx5IG1ldGhvZHMgYXJlIGFsbG93ZWQgaW4gY2xhc3Nlc1wiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA4LCB7bmFtZTogbmFtZV8xMDYsIHN1cGVyOiBzdXByXzEwNywgZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTA5KX0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ1RhcmdldCh7YWxsb3dQdW5jdHVhdG9yfSA9IHt9KSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMTEgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzExMSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExMSkgfHwgYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKHthbGxvd1B1bmN0dWF0b3I6IGFsbG93UHVuY3R1YXRvcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5QmluZGluZygpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTExKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCk7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xuICB9XG4gIGVuZm9yZXN0T2JqZWN0QmluZGluZygpIHtcbiAgICBsZXQgZW5mXzExMiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcHJvcGVydGllc18xMTMgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzExMi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHByb3BlcnRpZXNfMTEzLnB1c2goZW5mXzExMi5lbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpKTtcbiAgICAgIGVuZl8xMTIuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IExpc3QocHJvcGVydGllc18xMTMpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nUHJvcGVydHkoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMTQgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQge25hbWUsIGJpbmRpbmd9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTE0KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTE0LCBcImxldFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTE0LCBcInlpZWxkXCIpKSB7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIjpcIikpIHtcbiAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgICAgZGVmYXVsdFZhbHVlID0gZXhwcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBpbml0OiBkZWZhdWx0VmFsdWV9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogbmFtZSwgYmluZGluZzogYmluZGluZ30pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlCaW5kaW5nKCkge1xuICAgIGxldCBicmFja2V0XzExNSA9IHRoaXMubWF0Y2hTcXVhcmVzKCk7XG4gICAgbGV0IGVuZl8xMTYgPSBuZXcgRW5mb3Jlc3RlcihicmFja2V0XzExNSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBlbGVtZW50c18xMTcgPSBbXSwgcmVzdEVsZW1lbnRfMTE4ID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzExNi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBlbDtcbiAgICAgIGlmIChlbmZfMTE2LmlzUHVuY3R1YXRvcihlbmZfMTE2LnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xMTYuY29uc3VtZUNvbW1hKCk7XG4gICAgICAgIGVsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChlbmZfMTE2LmlzUHVuY3R1YXRvcihlbmZfMTE2LnBlZWsoKSwgXCIuLi5cIikpIHtcbiAgICAgICAgICBlbmZfMTE2LmFkdmFuY2UoKTtcbiAgICAgICAgICByZXN0RWxlbWVudF8xMTggPSBlbmZfMTE2LmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsID0gZW5mXzExNi5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzExNi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRzXzExNy5wdXNoKGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogTGlzdChlbGVtZW50c18xMTcpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfMTE4fSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpIHtcbiAgICBsZXQgYmluZGluZ18xMTkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgYmluZGluZ18xMTkgPSBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogYmluZGluZ18xMTksIGluaXQ6IGluaXR9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmdfMTE5O1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoe2FsbG93UHVuY3R1YXRvcn0gPSB7fSkge1xuICAgIGxldCBuYW1lXzEyMDtcbiAgICBpZiAoYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpKSkge1xuICAgICAgbmFtZV8xMjAgPSB0aGlzLmVuZm9yZXN0UHVuY3R1YXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lXzEyMCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzEyMH0pO1xuICB9XG4gIGVuZm9yZXN0UHVuY3R1YXRvcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyMSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTIxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMjEsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuICBlbmZvcmVzdElkZW50aWZpZXIoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMjIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEyMikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEyMikpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTIyLCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG4gIGVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCkge1xuICAgIGxldCBrd18xMjMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzEyNCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCBsb29rYWhlYWRfMTI0ICYmICF0aGlzLmxpbmVOdW1iZXJFcShrd18xMjMsIGxvb2thaGVhZF8xMjQpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IG51bGx9KTtcbiAgICB9XG4gICAgbGV0IHRlcm1fMTI1ID0gbnVsbDtcbiAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMjQsIFwiO1wiKSkge1xuICAgICAgdGVybV8xMjUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgZXhwZWN0KHRlcm1fMTI1ICE9IG51bGwsIFwiRXhwZWN0aW5nIGFuIGV4cHJlc3Npb24gdG8gZm9sbG93IHJldHVybiBrZXl3b3JkXCIsIGxvb2thaGVhZF8xMjQsIHRoaXMucmVzdCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGVybV8xMjV9KTtcbiAgfVxuICBlbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGtpbmRfMTI2O1xuICAgIGxldCBsb29rYWhlYWRfMTI3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGtpbmRTeW5fMTI4ID0gbG9va2FoZWFkXzEyNztcbiAgICBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNiA9IFwidmFyXCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyOCAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyOC5yZXNvbHZlKCkpID09PSBMZXREZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNiA9IFwibGV0XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyOCAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyOC5yZXNvbHZlKCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI2ID0gXCJjb25zdFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcInN5bnRheFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcInN5bnRheHJlY1wiO1xuICAgIH1cbiAgICBsZXQgZGVjbHNfMTI5ID0gTGlzdCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4OiBraW5kXzEyNiA9PT0gXCJzeW50YXhcIiB8fCBraW5kXzEyNiA9PT0gXCJzeW50YXhyZWNcIn0pO1xuICAgICAgbGV0IGxvb2thaGVhZF8xMjcgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGRlY2xzXzEyOSA9IGRlY2xzXzEyOS5jb25jYXQodGVybSk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyNywgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IGtpbmRfMTI2LCBkZWNsYXJhdG9yczogZGVjbHNfMTI5fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4fSkge1xuICAgIGxldCBpZF8xMzAgPSB0aGlzLmVuZm9yZXN0QmluZGluZ1RhcmdldCh7YWxsb3dQdW5jdHVhdG9yOiBpc1N5bnRheH0pO1xuICAgIGxldCBsb29rYWhlYWRfMTMxID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGluaXRfMTMyLCByZXN0XzEzMztcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzMSwgXCI9XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGluaXRfMTMyID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbml0XzEzMiA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogaWRfMTMwLCBpbml0OiBpbml0XzEzMn0pO1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvblN0YXRlbWVudCgpIHtcbiAgICBsZXQgc3RhcnRfMTM0ID0gdGhpcy5yZXN0LmdldCgwKTtcbiAgICBsZXQgZXhwcl8xMzUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmIChleHByXzEzNSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihzdGFydF8xMzQsIFwibm90IGEgdmFsaWQgZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xMzV9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRfMTM2ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMzcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzNywgXCIsXCIpKSB7XG4gICAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wZXJhdG9yID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGxldCByaWdodCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBsZWZ0XzEzNiA9IG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xMzYsIG9wZXJhdG9yOiBvcGVyYXRvciwgcmlnaHQ6IHJpZ2h0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgcmV0dXJuIGxlZnRfMTM2O1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLm9wQ3R4ID0ge3ByZWM6IDAsIGNvbWJpbmU6IHhfMTM4ID0+IHhfMTM4LCBzdGFjazogTGlzdCgpfTtcbiAgICBkbyB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpO1xuICAgICAgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcgJiYgdGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRV8yNykge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX09QRVJBVE9SXzI2IHx8IHRlcm0gPT09IEVYUFJfTE9PUF9FWFBBTlNJT05fMjgpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRlcm07XG4gICAgICB9XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXMudGVybTtcbiAgfVxuICBlbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTM5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIHRoaXMucmVzdCA9IHJlc3VsdC5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwieWllbGRcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiB0cnVlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJzdXBlclwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTdXBlclwiLCB7fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzkpIHx8IHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzOSkpICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgXCI9PlwiKSAmJiB0aGlzLmxpbmVOdW1iZXJFcShsb29rYWhlYWRfMTM5LCB0aGlzLnBlZWsoMSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhUZW1wbGF0ZShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhRdW90ZVRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhRdW90ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TmV3RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwidGhpc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhpc0V4cHJlc3Npb25cIiwge3N0eDogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEzOSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJ5aWVsZFwiKSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IG51bSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKG51bS52YWwoKSA9PT0gMSAvIDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb25cIiwge3ZhbHVlOiBudW19KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IG51bGwsIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVsbEV4cHJlc3Npb25cIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IHJlU3R4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbGFzdFNsYXNoID0gcmVTdHgudG9rZW4udmFsdWUubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgbGV0IHBhdHRlcm4gPSByZVN0eC50b2tlbi52YWx1ZS5zbGljZSgxLCBsYXN0U2xhc2gpO1xuICAgICAgbGV0IGZsYWdzID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoICsgMSk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsUmVnRXhwRXhwcmVzc2lvblwiLCB7cGF0dGVybjogcGF0dGVybiwgZmxhZ3M6IGZsYWdzfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIiwge2lubmVyOiB0aGlzLmFkdmFuY2UoKS5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNVcGRhdGVPcGVyYXRvcihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTM5LCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICBsZXQgcGFyZW4gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHRoaXMudGVybSwgYXJndW1lbnRzOiBwYXJlbi5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzOSwgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV8yNztcbiAgfVxuICBlbmZvcmVzdEFyZ3VtZW50TGlzdCgpIHtcbiAgICBsZXQgcmVzdWx0XzE0MCA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBhcmcgPSBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIsXCIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0XzE0MC5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xNDApO1xuICB9XG4gIGVuZm9yZXN0TmV3RXhwcmVzc2lvbigpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIm5ld1wiKTtcbiAgICBsZXQgY2FsbGVlXzE0MTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwibmV3XCIpKSB7XG4gICAgICBjYWxsZWVfMTQxID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcInN1cGVyXCIpKSB7XG4gICAgICBjYWxsZWVfMTQxID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIuXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJ0YXJnZXRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdUYXJnZXRFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGVlXzE0MSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICB9XG4gICAgbGV0IGFyZ3NfMTQyO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xNDIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTQyID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xNDEsIGFyZ3VtZW50czogYXJnc18xNDJ9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE0MyA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTQzLmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE0NCkge1xuICAgIHN3aXRjaCAodGVybV8xNDQudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTQ0LmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xNDQuaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xNDQubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNDQuZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTQ0LnByb3BlcnRpZXMubWFwKHRfMTQ1ID0+IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE0NSkpfSk7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIGxldCBsYXN0ID0gdGVybV8xNDQuZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gXCJTcHJlYWRFbGVtZW50XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE0NC5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHRfMTQ2ID0+IHRfMTQ2ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTQ2KSksIHJlc3RFbGVtZW50OiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdChsYXN0LmV4cHJlc3Npb24pfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDQuZWxlbWVudHMubWFwKHRfMTQ3ID0+IHRfMTQ3ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTQ3KSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDQuZWxlbWVudHMubWFwKHRfMTQ4ID0+IHRfMTQ4ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE0OCkpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgY2FzZSBcIlN0YXRpY1Byb3BlcnR5TmFtZVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDQudmFsdWV9KTtcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQXJyYXlCaW5kaW5nXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ0lkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nV2l0aERlZmF1bHRcIjpcbiAgICAgIGNhc2UgXCJPYmplY3RCaW5kaW5nXCI6XG4gICAgICAgIHJldHVybiB0ZXJtXzE0NDtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yIFwiICsgdGVybV8xNDQudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTQ5KSB7XG4gICAgc3dpdGNoICh0ZXJtXzE0OS50eXBlKSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDkuYmluZGluZyksIGluaXQ6IHRlcm1fMTQ5LmV4cHJlc3Npb259KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE0OSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNTA7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgZW5mXzE1MCA9IG5ldyBFbmZvcmVzdGVyKExpc3Qub2YodGhpcy5hZHZhbmNlKCkpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgZW5mXzE1MCA9IG5ldyBFbmZvcmVzdGVyKHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtc18xNTEgPSBlbmZfMTUwLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiPT5cIik7XG4gICAgbGV0IGJvZHlfMTUyO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keV8xNTIgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmZfMTUwID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBib2R5XzE1MiA9IGVuZl8xNTAuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mXzE1MC5yZXN0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJvd0V4cHJlc3Npb25cIiwge3BhcmFtczogcGFyYW1zXzE1MSwgYm9keTogYm9keV8xNTJ9KTtcbiAgfVxuICBlbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpIHtcbiAgICBsZXQga3dkXzE1MyA9IHRoaXMubWF0Y2hLZXl3b3JkKFwieWllbGRcIik7XG4gICAgbGV0IGxvb2thaGVhZF8xNTQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE1NCAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dkXzE1MywgbG9va2FoZWFkXzE1NCkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaXNHZW5lcmF0b3IgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIqXCIpKSB7XG4gICAgICAgIGlzR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBsZXQgdHlwZSA9IGlzR2VuZXJhdG9yID8gXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiA6IFwiWWllbGRFeHByZXNzaW9uXCI7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge2V4cHJlc3Npb246IGV4cHJ9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhUZW1wbGF0ZVwiLCB7dGVtcGxhdGU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhRdW90ZSgpIHtcbiAgICBsZXQgbmFtZV8xNTUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhRdW90ZVwiLCB7bmFtZTogbmFtZV8xNTUsIHRlbXBsYXRlOiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE1NX0pLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmplY3RfMTU2ID0gdGhpcy50ZXJtO1xuICAgIGxldCBkb3RfMTU3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnR5XzE1OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogb2JqZWN0XzE1NiwgcHJvcGVydHk6IHByb3BlcnR5XzE1OH0pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCkge1xuICAgIGxldCBhcnJfMTU5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzE2MCA9IFtdO1xuICAgIGxldCBlbmZfMTYxID0gbmV3IEVuZm9yZXN0ZXIoYXJyXzE1OS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xNjEucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xNjEucGVlaygpO1xuICAgICAgaWYgKGVuZl8xNjEuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xNjEuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50c18xNjAucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5mXzE2MS5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICBlbmZfMTYxLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBlbmZfMTYxLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xNjEuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE2MC5wdXNoKG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0ZXJtID0gZW5mXzE2MS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmICh0ZXJtID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTYxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE2MC5wdXNoKHRlcm0pO1xuICAgICAgICBlbmZfMTYxLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzE2MCl9KTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9ial8xNjIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydGllc18xNjMgPSBMaXN0KCk7XG4gICAgbGV0IGVuZl8xNjQgPSBuZXcgRW5mb3Jlc3RlcihvYmpfMTYyLmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbGFzdFByb3BfMTY1ID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzE2NC5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZl8xNjQuZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKTtcbiAgICAgIGVuZl8xNjQuY29uc3VtZUNvbW1hKCk7XG4gICAgICBwcm9wZXJ0aWVzXzE2MyA9IHByb3BlcnRpZXNfMTYzLmNvbmNhdChwcm9wKTtcbiAgICAgIGlmIChsYXN0UHJvcF8xNjUgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mXzE2NC5jcmVhdGVFcnJvcihwcm9wLCBcImludmFsaWQgc3ludGF4IGluIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICAgIGxhc3RQcm9wXzE2NSA9IHByb3A7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXNfMTYzfSk7XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG4gICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSB0aGlzLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBcIm1ldGhvZFwiOlxuICAgICAgICByZXR1cm4gbWV0aG9kT3JLZXk7XG4gICAgICBjYXNlIFwiaWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2luaXQ6IGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSl9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlNob3J0aGFuZFByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleS52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgZXhwcl8xNjYgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LCBleHByZXNzaW9uOiBleHByXzE2Nn0pO1xuICB9XG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE2NyA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xNjggPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE2NywgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xNjggPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTY3LCBcImdldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiR2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NywgXCJzZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJTZXR0ZXJcIiwge25hbWU6IG5hbWUsIHBhcmFtOiBwYXJhbSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJNZXRob2RcIiwge2lzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xNjgsIG5hbWU6IG5hbWUsIHBhcmFtczogZm9ybWFsUGFyYW1zLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuYW1lLCBraW5kOiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTY3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTY3KSA/IFwiaWRlbnRpZmllclwiIDogXCJwcm9wZXJ0eVwifTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5TmFtZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE2OSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTY5KSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE2OSkpIHtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTY5KSkge1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBleHByID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogZXhwcn0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IG5hbWVfMTcwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5hbWVfMTcwfSksIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTcwfSl9O1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwciwgaW5EZWZhdWx0LCBhbGxvd0dlbmVyYXRvcn0pIHtcbiAgICBsZXQgbmFtZV8xNzEgPSBudWxsLCBwYXJhbXNfMTcyLCBib2R5XzE3MywgcmVzdF8xNzQ7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE3NSA9IGZhbHNlO1xuICAgIGxldCBmbktleXdvcmRfMTc2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xNzcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZV8xNzggPSBpc0V4cHIgPyBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIDogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNzcsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTc1ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE3NyA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE3NykpIHtcbiAgICAgIG5hbWVfMTcxID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWVfMTcxID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiKmRlZmF1bHQqXCIsIGZuS2V5d29yZF8xNzYpfSk7XG4gICAgfVxuICAgIHBhcmFtc18xNzIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xNzMgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTc5ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE3MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTgwID0gZW5mXzE3OS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xNzgsIHtuYW1lOiBuYW1lXzE3MSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE3NSwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTgwLCBib2R5OiBib2R5XzE3M30pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCkge1xuICAgIGxldCBuYW1lXzE4MSA9IG51bGwsIHBhcmFtc18xODIsIGJvZHlfMTgzLCByZXN0XzE4NDtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTg1ID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xODYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE4NiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xODUgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMTg2ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTg2KSkge1xuICAgICAgbmFtZV8xODEgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcGFyYW1zXzE4MiA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzE4MyA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8xODcgPSBuZXcgRW5mb3Jlc3RlcihwYXJhbXNfMTgyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18xODggPSBlbmZfMTg3LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xODEsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xODUsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE4OCwgYm9keTogYm9keV8xODN9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IG5hbWVfMTg5LCBwYXJhbXNfMTkwLCBib2R5XzE5MSwgcmVzdF8xOTI7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE5MyA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTk0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xOTQsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTkzID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBuYW1lXzE4OSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIHBhcmFtc18xOTAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xOTEgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTk1ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE5MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTk2ID0gZW5mXzE5NS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsIHtuYW1lOiBuYW1lXzE4OSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE5MywgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTk2LCBib2R5OiBib2R5XzE5MX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpIHtcbiAgICBsZXQgaXRlbXNfMTk3ID0gW107XG4gICAgbGV0IHJlc3RfMTk4ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLi4uXCIpO1xuICAgICAgICByZXN0XzE5OCA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGl0ZW1zXzE5Ny5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBMaXN0KGl0ZW1zXzE5NyksIHJlc3Q6IHJlc3RfMTk4fSk7XG4gIH1cbiAgZW5mb3Jlc3RQYXJhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8xOTkgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiBmYWxzZSwgb3BlcmF0b3I6IG9wZXJhdG9yXzE5OS52YWwoKSwgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSl9KTtcbiAgfVxuICBlbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMjAwID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgIHRoaXMub3BDdHgucHJlYyA9IDE0O1xuICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMDEgPT4ge1xuICAgICAgbGV0IHR5cGVfMjAyLCB0ZXJtXzIwMywgaXNQcmVmaXhfMjA0O1xuICAgICAgaWYgKG9wZXJhdG9yXzIwMC52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzIwMC52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMjAyID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMjAzID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybV8yMDEpO1xuICAgICAgICBpc1ByZWZpeF8yMDQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZV8yMDIgPSBcIlVuYXJ5RXhwcmVzc2lvblwiO1xuICAgICAgICBpc1ByZWZpeF8yMDQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRlcm1fMjAzID0gcmlnaHRUZXJtXzIwMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIwMiwge29wZXJhdG9yOiBvcGVyYXRvcl8yMDAudmFsKCksIG9wZXJhbmQ6IHRlcm1fMjAzLCBpc1ByZWZpeDogaXNQcmVmaXhfMjA0fSk7XG4gICAgfTtcbiAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzI2O1xuICB9XG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIGxldCB0ZXN0XzIwNSA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgIGlmICh0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj9cIik7XG4gICAgbGV0IGVuZl8yMDYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY29uc2VxdWVudF8yMDcgPSBlbmZfMjA2LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmZfMjA2Lm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgZW5mXzIwNiA9IG5ldyBFbmZvcmVzdGVyKGVuZl8yMDYucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhbHRlcm5hdGVfMjA4ID0gZW5mXzIwNi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgdGhpcy5yZXN0ID0gZW5mXzIwNi5yZXN0O1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGVzdF8yMDUsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMjA3LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8yMDh9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRUZXJtXzIwOSA9IHRoaXMudGVybTtcbiAgICBsZXQgb3BTdHhfMjEwID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG9wXzIxMSA9IG9wU3R4XzIxMC52YWwoKTtcbiAgICBsZXQgb3BQcmVjXzIxMiA9IGdldE9wZXJhdG9yUHJlYyhvcF8yMTEpO1xuICAgIGxldCBvcEFzc29jXzIxMyA9IGdldE9wZXJhdG9yQXNzb2Mob3BfMjExKTtcbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlY18yMTIsIG9wQXNzb2NfMjEzKSkge1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IG9wUHJlY18yMTI7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjE0ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMjA5LCBvcGVyYXRvcjogb3BTdHhfMjEwLCByaWdodDogcmlnaHRUZXJtXzIxNH0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl8yNjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm1fMjA5KTtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjE1ID0gdGhpcy5tYXRjaFRlbXBsYXRlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzIxNiA9IGxvb2thaGVhZF8yMTUudG9rZW4uaXRlbXMubWFwKGl0XzIxNyA9PiB7XG4gICAgICBpZiAoaXRfMjE3IGluc3RhbmNlb2YgU3ludGF4ICYmIGl0XzIxNy5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihpdF8yMTcuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IGl0XzIxNy5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzIxNjtcbiAgfVxuICBleHBhbmRNYWNybyhlbmZvcmVzdFR5cGVfMjE4KSB7XG4gICAgbGV0IG5hbWVfMjE5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHN5bnRheFRyYW5zZm9ybV8yMjAgPSB0aGlzLmdldENvbXBpbGV0aW1lVHJhbnNmb3JtKG5hbWVfMjE5KTtcbiAgICBpZiAoc3ludGF4VHJhbnNmb3JtXzIyMCA9PSBudWxsIHx8IHR5cGVvZiBzeW50YXhUcmFuc2Zvcm1fMjIwLnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTksIFwidGhlIG1hY3JvIG5hbWUgd2FzIG5vdCBib3VuZCB0byBhIHZhbHVlIHRoYXQgY291bGQgYmUgaW52b2tlZFwiKTtcbiAgICB9XG4gICAgbGV0IHVzZVNpdGVTY29wZV8yMjEgPSBmcmVzaFNjb3BlKFwidVwiKTtcbiAgICBsZXQgaW50cm9kdWNlZFNjb3BlXzIyMiA9IGZyZXNoU2NvcGUoXCJpXCIpO1xuICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZV8yMjE7XG4gICAgbGV0IGN0eF8yMjMgPSBuZXcgTWFjcm9Db250ZXh0KHRoaXMsIG5hbWVfMjE5LCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZV8yMjEsIGludHJvZHVjZWRTY29wZV8yMjIpO1xuICAgIGxldCByZXN1bHRfMjI0ID0gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhzeW50YXhUcmFuc2Zvcm1fMjIwLnZhbHVlLmNhbGwobnVsbCwgY3R4XzIyMykpO1xuICAgIGlmICghTGlzdC5pc0xpc3QocmVzdWx0XzIyNCkpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTksIFwibWFjcm8gbXVzdCByZXR1cm4gYSBsaXN0IGJ1dCBnb3Q6IFwiICsgcmVzdWx0XzIyNCk7XG4gICAgfVxuICAgIHJlc3VsdF8yMjQgPSByZXN1bHRfMjI0Lm1hcChzdHhfMjI1ID0+IHtcbiAgICAgIGlmICghKHN0eF8yMjUgJiYgdHlwZW9mIHN0eF8yMjUuYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIxOSwgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eF8yMjUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eF8yMjUuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlXzIyMiwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRfMjI0O1xuICB9XG4gIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMjYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzIyNiAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjI2LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMjcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzIyNyAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjI3LCBcIixcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBpc1Rlcm0odGVybV8yMjgpIHtcbiAgICByZXR1cm4gdGVybV8yMjggJiYgdGVybV8yMjggaW5zdGFuY2VvZiBUZXJtO1xuICB9XG4gIGlzRU9GKHRlcm1fMjI5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjI5ICYmIHRlcm1fMjI5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjI5LmlzRU9GKCk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHRlcm1fMjMwLCB2YWxfMjMxID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzIzMCAmJiB0ZXJtXzIzMCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzMC5pc0lkZW50aWZpZXIoKSAmJiAodmFsXzIzMSA9PT0gbnVsbCB8fCB0ZXJtXzIzMC52YWwoKSA9PT0gdmFsXzIzMSk7XG4gIH1cbiAgaXNQcm9wZXJ0eU5hbWUodGVybV8yMzIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWZpZXIodGVybV8yMzIpIHx8IHRoaXMuaXNLZXl3b3JkKHRlcm1fMjMyKSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwodGVybV8yMzIpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKHRlcm1fMjMyKSB8fCB0aGlzLmlzQnJhY2tldHModGVybV8yMzIpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodGVybV8yMzMpIHtcbiAgICByZXR1cm4gdGVybV8yMzMgJiYgdGVybV8yMzMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzMuaXNOdW1lcmljTGl0ZXJhbCgpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzIzNCkge1xuICAgIHJldHVybiB0ZXJtXzIzNCAmJiB0ZXJtXzIzNCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNC5pc1N0cmluZ0xpdGVyYWwoKTtcbiAgfVxuICBpc1RlbXBsYXRlKHRlcm1fMjM1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM1ICYmIHRlcm1fMjM1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM1LmlzVGVtcGxhdGUoKTtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKHRlcm1fMjM2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM2ICYmIHRlcm1fMjM2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM2LmlzQm9vbGVhbkxpdGVyYWwoKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHRlcm1fMjM3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM3ICYmIHRlcm1fMjM3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM3LmlzTnVsbExpdGVyYWwoKTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHRlcm1fMjM4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM4ICYmIHRlcm1fMjM4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM4LmlzUmVndWxhckV4cHJlc3Npb24oKTtcbiAgfVxuICBpc1BhcmVucyh0ZXJtXzIzOSkge1xuICAgIHJldHVybiB0ZXJtXzIzOSAmJiB0ZXJtXzIzOSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzOS5pc1BhcmVucygpO1xuICB9XG4gIGlzQnJhY2VzKHRlcm1fMjQwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjQwICYmIHRlcm1fMjQwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQwLmlzQnJhY2VzKCk7XG4gIH1cbiAgaXNCcmFja2V0cyh0ZXJtXzI0MSkge1xuICAgIHJldHVybiB0ZXJtXzI0MSAmJiB0ZXJtXzI0MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0MS5pc0JyYWNrZXRzKCk7XG4gIH1cbiAgaXNBc3NpZ24odGVybV8yNDIpIHtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGVybV8yNDIpKSB7XG4gICAgICBzd2l0Y2ggKHRlcm1fMjQyLnZhbCgpKSB7XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgICBjYXNlIFwiXj1cIjpcbiAgICAgICAgY2FzZSBcIiY9XCI6XG4gICAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgICBjYXNlIFwiPj4+PVwiOlxuICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgY2FzZSBcIi09XCI6XG4gICAgICAgIGNhc2UgXCIqPVwiOlxuICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaXNLZXl3b3JkKHRlcm1fMjQzLCB2YWxfMjQ0ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI0MyAmJiB0ZXJtXzI0MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0My5pc0tleXdvcmQoKSAmJiAodmFsXzI0NCA9PT0gbnVsbCB8fCB0ZXJtXzI0My52YWwoKSA9PT0gdmFsXzI0NCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHRlcm1fMjQ1LCB2YWxfMjQ2ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI0NSAmJiB0ZXJtXzI0NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0NS5pc1B1bmN0dWF0b3IoKSAmJiAodmFsXzI0NiA9PT0gbnVsbCB8fCB0ZXJtXzI0NS52YWwoKSA9PT0gdmFsXzI0Nik7XG4gIH1cbiAgaXNPcGVyYXRvcih0ZXJtXzI0Nykge1xuICAgIHJldHVybiB0ZXJtXzI0NyAmJiB0ZXJtXzI0NyBpbnN0YW5jZW9mIFN5bnRheCAmJiBpc09wZXJhdG9yKHRlcm1fMjQ3KTtcbiAgfVxuICBpc1VwZGF0ZU9wZXJhdG9yKHRlcm1fMjQ4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ4ICYmIHRlcm1fMjQ4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQ4LmlzUHVuY3R1YXRvcigpICYmICh0ZXJtXzI0OC52YWwoKSA9PT0gXCIrK1wiIHx8IHRlcm1fMjQ4LnZhbCgpID09PSBcIi0tXCIpO1xuICB9XG4gIGlzRm5EZWNsVHJhbnNmb3JtKHRlcm1fMjQ5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ5ICYmIHRlcm1fMjQ5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ5LnJlc29sdmUoKSkgPT09IEZ1bmN0aW9uRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1ZhckRlY2xUcmFuc2Zvcm0odGVybV8yNTApIHtcbiAgICByZXR1cm4gdGVybV8yNTAgJiYgdGVybV8yNTAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTAucmVzb2x2ZSgpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzTGV0RGVjbFRyYW5zZm9ybSh0ZXJtXzI1MSkge1xuICAgIHJldHVybiB0ZXJtXzI1MSAmJiB0ZXJtXzI1MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1MS5yZXNvbHZlKCkpID09PSBMZXREZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKHRlcm1fMjUyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUyICYmIHRlcm1fMjUyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUyLnJlc29sdmUoKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheERlY2xUcmFuc2Zvcm0odGVybV8yNTMpIHtcbiAgICByZXR1cm4gdGVybV8yNTMgJiYgdGVybV8yNTMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTMucmVzb2x2ZSgpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0odGVybV8yNTQpIHtcbiAgICByZXR1cm4gdGVybV8yNTQgJiYgdGVybV8yNTQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTQucmVzb2x2ZSgpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHRlcm1fMjU1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU1ICYmIHRlcm1fMjU1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU1LmlzU3ludGF4VGVtcGxhdGUoKTtcbiAgfVxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKHRlcm1fMjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU2ICYmIHRlcm1fMjU2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU2LnJlc29sdmUoKSkgPT09IFN5bnRheFF1b3RlVHJhbnNmb3JtO1xuICB9XG4gIGlzUmV0dXJuU3RtdFRyYW5zZm9ybSh0ZXJtXzI1Nykge1xuICAgIHJldHVybiB0ZXJtXzI1NyAmJiB0ZXJtXzI1NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1Ny5yZXNvbHZlKCkpID09PSBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaGlsZVRyYW5zZm9ybSh0ZXJtXzI1OCkge1xuICAgIHJldHVybiB0ZXJtXzI1OCAmJiB0ZXJtXzI1OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OC5yZXNvbHZlKCkpID09PSBXaGlsZVRyYW5zZm9ybTtcbiAgfVxuICBpc0ZvclRyYW5zZm9ybSh0ZXJtXzI1OSkge1xuICAgIHJldHVybiB0ZXJtXzI1OSAmJiB0ZXJtXzI1OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OS5yZXNvbHZlKCkpID09PSBGb3JUcmFuc2Zvcm07XG4gIH1cbiAgaXNTd2l0Y2hUcmFuc2Zvcm0odGVybV8yNjApIHtcbiAgICByZXR1cm4gdGVybV8yNjAgJiYgdGVybV8yNjAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjAucmVzb2x2ZSgpKSA9PT0gU3dpdGNoVHJhbnNmb3JtO1xuICB9XG4gIGlzQnJlYWtUcmFuc2Zvcm0odGVybV8yNjEpIHtcbiAgICByZXR1cm4gdGVybV8yNjEgJiYgdGVybV8yNjEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjEucmVzb2x2ZSgpKSA9PT0gQnJlYWtUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb250aW51ZVRyYW5zZm9ybSh0ZXJtXzI2Mikge1xuICAgIHJldHVybiB0ZXJtXzI2MiAmJiB0ZXJtXzI2MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2Mi5yZXNvbHZlKCkpID09PSBDb250aW51ZVRyYW5zZm9ybTtcbiAgfVxuICBpc0RvVHJhbnNmb3JtKHRlcm1fMjYzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYzICYmIHRlcm1fMjYzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYzLnJlc29sdmUoKSkgPT09IERvVHJhbnNmb3JtO1xuICB9XG4gIGlzRGVidWdnZXJUcmFuc2Zvcm0odGVybV8yNjQpIHtcbiAgICByZXR1cm4gdGVybV8yNjQgJiYgdGVybV8yNjQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjQucmVzb2x2ZSgpKSA9PT0gRGVidWdnZXJUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaXRoVHJhbnNmb3JtKHRlcm1fMjY1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY1ICYmIHRlcm1fMjY1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY1LnJlc29sdmUoKSkgPT09IFdpdGhUcmFuc2Zvcm07XG4gIH1cbiAgaXNUcnlUcmFuc2Zvcm0odGVybV8yNjYpIHtcbiAgICByZXR1cm4gdGVybV8yNjYgJiYgdGVybV8yNjYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjYucmVzb2x2ZSgpKSA9PT0gVHJ5VHJhbnNmb3JtO1xuICB9XG4gIGlzVGhyb3dUcmFuc2Zvcm0odGVybV8yNjcpIHtcbiAgICByZXR1cm4gdGVybV8yNjcgJiYgdGVybV8yNjcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjcucmVzb2x2ZSgpKSA9PT0gVGhyb3dUcmFuc2Zvcm07XG4gIH1cbiAgaXNJZlRyYW5zZm9ybSh0ZXJtXzI2OCkge1xuICAgIHJldHVybiB0ZXJtXzI2OCAmJiB0ZXJtXzI2OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OC5yZXNvbHZlKCkpID09PSBJZlRyYW5zZm9ybTtcbiAgfVxuICBpc05ld1RyYW5zZm9ybSh0ZXJtXzI2OSkge1xuICAgIHJldHVybiB0ZXJtXzI2OSAmJiB0ZXJtXzI2OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OS5yZXNvbHZlKCkpID09PSBOZXdUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI3MCkge1xuICAgIHJldHVybiB0ZXJtXzI3MCAmJiB0ZXJtXzI3MCBpbnN0YW5jZW9mIFN5bnRheCAmJiAodGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzAucmVzb2x2ZSgpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yNzAucmVzb2x2ZSgpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuICBnZXRDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI3MSkge1xuICAgIGlmICh0aGlzLmNvbnRleHQuZW52Lmhhcyh0ZXJtXzI3MS5yZXNvbHZlKCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzEucmVzb2x2ZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yNzEucmVzb2x2ZSgpKTtcbiAgfVxuICBsaW5lTnVtYmVyRXEoYV8yNzIsIGJfMjczKSB7XG4gICAgaWYgKCEoYV8yNzIgJiYgYl8yNzMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBhXzI3Mi5saW5lTnVtYmVyKCkgPT09IGJfMjczLmxpbmVOdW1iZXIoKTtcbiAgfVxuICBtYXRjaElkZW50aWZpZXIodmFsXzI3NCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8yNzUpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc1LCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG4gIG1hdGNoS2V5d29yZCh2YWxfMjc2KSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzI3NywgdmFsXzI3NikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc3O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzcsIFwiZXhwZWN0aW5nIFwiICsgdmFsXzI3Nik7XG4gIH1cbiAgbWF0Y2hMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzI3OCkgfHwgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8yNzgpIHx8IHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzI3OCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc4O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzgsIFwiZXhwZWN0aW5nIGEgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFN0cmluZ0xpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzI3OSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc5O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzksIFwiZXhwZWN0aW5nIGEgc3RyaW5nIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hUZW1wbGF0ZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzI4MCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgwO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODAsIFwiZXhwZWN0aW5nIGEgdGVtcGxhdGUgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFBhcmVucygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8yODEpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MS5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODEsIFwiZXhwZWN0aW5nIHBhcmVuc1wiKTtcbiAgfVxuICBtYXRjaEN1cmxpZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMjgyKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODIuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgyLCBcImV4cGVjdGluZyBjdXJseSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hTcXVhcmVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjgzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMjgzKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODMuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgzLCBcImV4cGVjdGluZyBzcWF1cmUgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoVW5hcnlPcGVyYXRvcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4NCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChpc1VuYXJ5T3BlcmF0b3IobG9va2FoZWFkXzI4NCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjg0O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODQsIFwiZXhwZWN0aW5nIGEgdW5hcnkgb3BlcmF0b3JcIik7XG4gIH1cbiAgbWF0Y2hQdW5jdHVhdG9yKHZhbF8yODUpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjg2KSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWxfMjg1ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmIChsb29rYWhlYWRfMjg2LnZhbCgpID09PSB2YWxfMjg1KSB7XG4gICAgICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjg2LCBcImV4cGVjdGluZyBhIFwiICsgdmFsXzI4NSArIFwiIHB1bmN0dWF0b3JcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjg2O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODYsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuICBjcmVhdGVFcnJvcihzdHhfMjg3LCBtZXNzYWdlXzI4OCkge1xuICAgIGxldCBjdHhfMjg5ID0gXCJcIjtcbiAgICBsZXQgb2ZmZW5kaW5nXzI5MCA9IHN0eF8yODc7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgY3R4XzI4OSA9IHRoaXMucmVzdC5zbGljZSgwLCAyMCkubWFwKHRlcm1fMjkxID0+IHtcbiAgICAgICAgaWYgKHRlcm1fMjkxLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGVybV8yOTEuaW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGlzdC5vZih0ZXJtXzI5MSk7XG4gICAgICB9KS5mbGF0dGVuKCkubWFwKHNfMjkyID0+IHtcbiAgICAgICAgaWYgKHNfMjkyID09PSBvZmZlbmRpbmdfMjkwKSB7XG4gICAgICAgICAgcmV0dXJuIFwiX19cIiArIHNfMjkyLnZhbCgpICsgXCJfX1wiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzXzI5Mi52YWwoKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHhfMjg5ID0gb2ZmZW5kaW5nXzI5MC50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEVycm9yKG1lc3NhZ2VfMjg4ICsgXCJcXG5cIiArIGN0eF8yODkpO1xuICB9XG59XG4iXX0=