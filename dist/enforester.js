"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Enforester = undefined;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var Enforester = exports.Enforester = (function () {
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
      var result_35 = undefined;
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
        var moduleSpecifier = null;
        if (this.isIdentifier(this.peek(), "from")) {
          moduleSpecifier = this.enforestFromClause();
        }
        return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: moduleSpecifier });
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
          var moduleSpecifier = this.enforestFromClause();
          if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
            this.advance();
            this.advance();
            forSyntax_44 = true;
          }
          return new _terms2.default("Import", { defaultBinding: defaultBinding_42, moduleSpecifier: moduleSpecifier, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_44 });
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
        var moduleSpecifier = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_44 = true;
        }
        return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_42, forSyntax: forSyntax_44, namespaceBinding: namespaceBinding, moduleSpecifier: moduleSpecifier });
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
      var name_48 = undefined;
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
        var finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_57, catchClause: null, finalizer: finalizer });
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
      var lookahead_84 = undefined,
          test_85 = undefined,
          init_86 = undefined,
          right_87 = undefined,
          type_88 = undefined,
          left_89 = undefined,
          update_90 = undefined;
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
        var el = undefined;
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

      var name_120 = undefined;
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
      var kind_126 = undefined;
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
      var init_132 = undefined,
          rest_133 = undefined;
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
        var arg = undefined;
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
      var callee_141 = undefined;
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
      var args_142 = undefined;
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
      var enf_150 = undefined;
      if (this.isIdentifier(this.peek())) {
        enf_150 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf_150 = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params_151 = enf_150.enforestFormalParameters();
      this.matchPunctuator("=>");
      var body_152 = undefined;
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
        var body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Setter", { name: _name2, param: param, body: body }), kind: "method" };
      }

      var _enforestPropertyName4 = this.enforestPropertyName();

      var name = _enforestPropertyName4.name;

      if (this.isParens(this.peek())) {
        var params = this.matchParens();
        var enf = new Enforester(params, (0, _immutable.List)(), this.context);
        var formalParams = enf.enforestFormalParameters();
        var body = this.matchCurlies();
        return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_168, name: name, params: formalParams, body: body }), kind: "method" };
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
          params_172 = undefined,
          body_173 = undefined,
          rest_174 = undefined;
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
          params_182 = undefined,
          body_183 = undefined,
          rest_184 = undefined;
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
      var name_189 = undefined,
          params_190 = undefined,
          body_191 = undefined,
          rest_192 = undefined;
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
        var type_202 = undefined,
            term_203 = undefined,
            isPrefix_204 = undefined;
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
})();
//# sourceMappingURL=data:application/json;base64,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QUssRUFBRSxDQUFDO1dBQ3pCO0FBQ0QsaUJBQU8sZ0JBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzFCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDeEIsY0FBSSxLQUFLLEtBQUssYUFBYSxFQUFFO0FBQzNCLG1CQUFPLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1dBQ2xDO0FBQ0QsaUJBQU8sS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDZCxNQUFNO0FBQ0wsZUFBTyxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztPQUNwQztBQUNELGFBQU8sSUFBSSxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQztLQUNoRDs7O1NBMS9DVSxVQUFVIiwiZmlsZSI6ImVuZm9yZXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtGdW5jdGlvbkRlY2xUcmFuc2Zvcm0sIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSwgTmV3VHJhbnNmb3JtLCBMZXREZWNsVHJhbnNmb3JtLCBDb25zdERlY2xUcmFuc2Zvcm0sIFN5bnRheERlY2xUcmFuc2Zvcm0sIFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0sIFN5bnRheFF1b3RlVHJhbnNmb3JtLCBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm0sIFdoaWxlVHJhbnNmb3JtLCBJZlRyYW5zZm9ybSwgRm9yVHJhbnNmb3JtLCBTd2l0Y2hUcmFuc2Zvcm0sIEJyZWFrVHJhbnNmb3JtLCBDb250aW51ZVRyYW5zZm9ybSwgRG9UcmFuc2Zvcm0sIERlYnVnZ2VyVHJhbnNmb3JtLCBXaXRoVHJhbnNmb3JtLCBUcnlUcmFuc2Zvcm0sIFRocm93VHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCB7aXNPcGVyYXRvciwgaXNVbmFyeU9wZXJhdG9yLCBnZXRPcGVyYXRvckFzc29jLCBnZXRPcGVyYXRvclByZWMsIG9wZXJhdG9yTHR9IGZyb20gXCIuL29wZXJhdG9yc1wiO1xuaW1wb3J0IFN5bnRheCBmcm9tIFwiLi9zeW50YXhcIjtcbmltcG9ydCB7ZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmltcG9ydCB7c2FuaXRpemVSZXBsYWNlbWVudFZhbHVlc30gZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCBNYWNyb0NvbnRleHQgZnJvbSBcIi4vbWFjcm8tY29udGV4dFwiO1xuY29uc3QgRVhQUl9MT09QX09QRVJBVE9SXzI2ID0ge307XG5jb25zdCBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3ID0ge307XG5jb25zdCBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4ID0ge307XG5leHBvcnQgY2xhc3MgRW5mb3Jlc3RlciB7XG4gIGNvbnN0cnVjdG9yKHN0eGxfMjksIHByZXZfMzAsIGNvbnRleHRfMzEpIHtcbiAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3Qoc3R4bF8yOSksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoTGlzdC5pc0xpc3QocHJldl8zMCksIFwiZXhwZWN0aW5nIGEgbGlzdCBvZiB0ZXJtcyB0byBlbmZvcmVzdFwiKTtcbiAgICBhc3NlcnQoY29udGV4dF8zMSwgXCJleHBlY3RpbmcgYSBjb250ZXh0IHRvIGVuZm9yZXN0XCIpO1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5yZXN0ID0gc3R4bF8yOTtcbiAgICB0aGlzLnByZXYgPSBwcmV2XzMwO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfMzE7XG4gIH1cbiAgcGVlayhuXzMyID0gMCkge1xuICAgIHJldHVybiB0aGlzLnJlc3QuZ2V0KG5fMzIpO1xuICB9XG4gIGFkdmFuY2UoKSB7XG4gICAgbGV0IHJldF8zMyA9IHRoaXMucmVzdC5maXJzdCgpO1xuICAgIHRoaXMucmVzdCA9IHRoaXMucmVzdC5yZXN0KCk7XG4gICAgcmV0dXJuIHJldF8zMztcbiAgfVxuICBlbmZvcmVzdCh0eXBlXzM0ID0gXCJNb2R1bGVcIikge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNFT0YodGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLnRlcm0gPSBuZXcgVGVybShcIkVPRlwiLCB7fSk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgfVxuICAgIGxldCByZXN1bHRfMzU7XG4gICAgaWYgKHR5cGVfMzQgPT09IFwiZXhwcmVzc2lvblwiKSB7XG4gICAgICByZXN1bHRfMzUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0XzM1ID0gdGhpcy5lbmZvcmVzdE1vZHVsZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfMzU7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCb2R5KCk7XG4gIH1cbiAgZW5mb3Jlc3RCb2R5KCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TW9kdWxlSXRlbSgpO1xuICB9XG4gIGVuZm9yZXN0TW9kdWxlSXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zNiwgXCJpbXBvcnRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJbXBvcnREZWNsYXJhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM2LCBcImV4cG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzM3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8zNywgXCIqXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzM3KSkge1xuICAgICAgbGV0IG5hbWVkRXhwb3J0cyA9IHRoaXMuZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImZyb21cIikpIHtcbiAgICAgICAgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge25hbWVkRXhwb3J0czogbmFtZWRFeHBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM3LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2xhc3NcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IGJvZHl9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzM3LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0Q2xhdXNlKCkge1xuICAgIGxldCBlbmZfMzggPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF8zOSA9IFtdO1xuICAgIHdoaWxlIChlbmZfMzgucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfMzkucHVzaChlbmZfMzguZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSk7XG4gICAgICBlbmZfMzguY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8zOSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSB7XG4gICAgbGV0IG5hbWVfNDAgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZXhwb3J0ZWROYW1lID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MCwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBleHBvcnRlZE5hbWU6IG5hbWVfNDB9KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDEgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgZGVmYXVsdEJpbmRpbmdfNDIgPSBudWxsO1xuICAgIGxldCBuYW1lZEltcG9ydHNfNDMgPSBMaXN0KCk7XG4gICAgbGV0IGZvclN5bnRheF80NCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfNDEpKSB7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBuYW1lZEltcG9ydHM6IG5hbWVkSW1wb3J0c180MywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF80MSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzQxKSkge1xuICAgICAgZGVmYXVsdEJpbmRpbmdfNDIgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXIsIG5hbWVkSW1wb3J0czogTGlzdCgpLCBmb3JTeW50YXg6IGZvclN5bnRheF80NH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIGxvb2thaGVhZF80MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF80MSkpIHtcbiAgICAgIGxldCBpbXBvcnRzID0gdGhpcy5lbmZvcmVzdE5hbWVkSW1wb3J0cygpO1xuICAgICAgbGV0IGZyb21DbGF1c2UgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBmb3JTeW50YXg6IGZvclN5bnRheF80NCwgbmFtZWRJbXBvcnRzOiBpbXBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IGZyb21DbGF1c2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF80MSwgXCIqXCIpKSB7XG4gICAgICBsZXQgbmFtZXNwYWNlQmluZGluZyA9IHRoaXMuZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF80NCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnROYW1lc3BhY2VcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ180MiwgZm9yU3ludGF4OiBmb3JTeW50YXhfNDQsIG5hbWVzcGFjZUJpbmRpbmc6IG5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzQxLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIipcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lZEltcG9ydHMoKSB7XG4gICAgbGV0IGVuZl80NSA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzQ2ID0gW107XG4gICAgd2hpbGUgKGVuZl80NS5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF80Ni5wdXNoKGVuZl80NS5lbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSk7XG4gICAgICBlbmZfNDUuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF80Nik7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkge1xuICAgIGxldCBsb29rYWhlYWRfNDcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbmFtZV80ODtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQ3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNDcpKSB7XG4gICAgICBuYW1lXzQ4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV80OH0pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF80NywgXCJ1bmV4cGVjdGVkIHRva2VuIGluIGltcG9ydCBzcGVjaWZpZXJcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80OCwgYmluZGluZzogdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCl9KTtcbiAgfVxuICBlbmZvcmVzdEZyb21DbGF1c2UoKSB7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJmcm9tXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNDkgPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBsb29rYWhlYWRfNDk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzUwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTAsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHRoaXMucmVzdCA9IHRoaXMuZXhwYW5kTWFjcm8oKS5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIGxvb2thaGVhZF81MSA9IHRoaXMucGVlaygpO1xuICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2hpbGVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZlRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdElmU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZvclRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZvclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTd2l0Y2hUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJlYWtUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb250aW51ZVRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RvVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RG9TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRGVidWdnZXJUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaXRoVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2l0aFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUcnlUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGhyb3dUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81MSwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzUxKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiOlwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSkge1xuICAgICAgbGV0IHN0bXQgPSBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBzdG10O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZXR1cm5TdG10VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzUxLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRW1wdHlTdGF0ZW1lbnRcIiwge30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxhYmVsXzUyID0gdGhpcy5tYXRjaElkZW50aWZpZXIoKTtcbiAgICBsZXQgcHVuY181MyA9IHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgc3RtdF81NCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTIsIGJvZHk6IHN0bXRfNTR9KTtcbiAgfVxuICBlbmZvcmVzdEJyZWFrU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiYnJlYWtcIik7XG4gICAgbGV0IGxvb2thaGVhZF81NSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBsYWJlbF81NiA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81NSwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTZ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81NSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU1LCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NSwgXCJsZXRcIikpIHtcbiAgICAgIGxhYmVsXzU2ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF81Nn0pO1xuICB9XG4gIGVuZm9yZXN0VHJ5U3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwidHJ5XCIpO1xuICAgIGxldCBib2R5XzU3ID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhdGNoXCIpKSB7XG4gICAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0aGlzLmVuZm9yZXN0Q2F0Y2hDbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZmluYWxpemVyID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTcsIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZSwgZmluYWxpemVyOiBmaW5hbGl6ZXJ9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUNhdGNoU3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU3LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZpbmFsbHlcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NywgY2F0Y2hDbGF1c2U6IG51bGwsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidHJ5IHdpdGggbm8gY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgfVxuICBlbmZvcmVzdENhdGNoQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2F0Y2hcIik7XG4gICAgbGV0IGJpbmRpbmdQYXJlbnNfNTggPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl81OSA9IG5ldyBFbmZvcmVzdGVyKGJpbmRpbmdQYXJlbnNfNTgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYmluZGluZ182MCA9IGVuZl81OS5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBsZXQgYm9keV82MSA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiBiaW5kaW5nXzYwLCBib2R5OiBib2R5XzYxfSk7XG4gIH1cbiAgZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRocm93XCIpO1xuICAgIGxldCBleHByZXNzaW9uXzYyID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbl82Mn0pO1xuICB9XG4gIGVuZm9yZXN0V2l0aFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndpdGhcIik7XG4gICAgbGV0IG9ialBhcmVuc182MyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzY0ID0gbmV3IEVuZm9yZXN0ZXIob2JqUGFyZW5zXzYzLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG9iamVjdF82NSA9IGVuZl82NC5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBsZXQgYm9keV82NiA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtvYmplY3Q6IG9iamVjdF82NSwgYm9keTogYm9keV82Nn0pO1xuICB9XG4gIGVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWJ1Z2dlclwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEZWJ1Z2dlclN0YXRlbWVudFwiLCB7fSk7XG4gIH1cbiAgZW5mb3Jlc3REb1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRvXCIpO1xuICAgIGxldCBib2R5XzY3ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IHRlc3RCb2R5XzY4ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNjkgPSBuZXcgRW5mb3Jlc3Rlcih0ZXN0Qm9keV82OCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCB0ZXN0XzcwID0gZW5mXzY5LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNjcsIHRlc3Q6IHRlc3RfNzB9KTtcbiAgfVxuICBlbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCkge1xuICAgIGxldCBrd2RfNzEgPSB0aGlzLm1hdGNoS2V5d29yZChcImNvbnRpbnVlXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNzIgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNzMgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNzIsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxpbmVOdW1iZXJFcShrd2RfNzEsIGxvb2thaGVhZF83MikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF83MikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzcyLCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJsZXRcIikpKSB7XG4gICAgICBsYWJlbF83MyA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzN9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInN3aXRjaFwiKTtcbiAgICBsZXQgY29uZF83NCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzc1ID0gbmV3IEVuZm9yZXN0ZXIoY29uZF83NCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBkaXNjcmltaW5hbnRfNzYgPSBlbmZfNzUuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfNzcgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGlmIChib2R5Xzc3LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIGNhc2VzOiBMaXN0KCl9KTtcbiAgICB9XG4gICAgZW5mXzc1ID0gbmV3IEVuZm9yZXN0ZXIoYm9keV83NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjYXNlc183OCA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgbGV0IGxvb2thaGVhZF83OSA9IGVuZl83NS5wZWVrKCk7XG4gICAgaWYgKGVuZl83NS5pc0tleXdvcmQobG9va2FoZWFkXzc5LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIGxldCBkZWZhdWx0Q2FzZSA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaERlZmF1bHQoKTtcbiAgICAgIGxldCBwb3N0RGVmYXVsdENhc2VzID0gZW5mXzc1LmVuZm9yZXN0U3dpdGNoQ2FzZXMoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF83NiwgcHJlRGVmYXVsdENhc2VzOiBjYXNlc183OCwgZGVmYXVsdENhc2U6IGRlZmF1bHRDYXNlLCBwb3N0RGVmYXVsdENhc2VzOiBwb3N0RGVmYXVsdENhc2VzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIGNhc2VzOiBjYXNlc183OH0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZXMoKSB7XG4gICAgbGV0IGNhc2VzXzgwID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSkpIHtcbiAgICAgIGNhc2VzXzgwLnB1c2godGhpcy5lbmZvcmVzdFN3aXRjaENhc2UoKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KGNhc2VzXzgwKTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2UoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJjYXNlXCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCksIGNvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SW5Td2l0Y2hDYXNlQm9keSgpO1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgbGV0IHJlc3VsdF84MSA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2FzZVwiKSkpIHtcbiAgICAgIHJlc3VsdF84MS5wdXNoKHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzgxKTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaERlZmF1bHQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWZhdWx0XCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJmb3JcIik7XG4gICAgbGV0IGNvbmRfODIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl84MyA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfODIsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzg0LCB0ZXN0Xzg1LCBpbml0Xzg2LCByaWdodF84NywgdHlwZV84OCwgbGVmdF84OSwgdXBkYXRlXzkwO1xuICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgaWYgKGVuZl84My5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IG51bGwsIHRlc3Q6IHRlc3RfODUsIHVwZGF0ZTogcmlnaHRfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb29rYWhlYWRfODQgPSBlbmZfODMucGVlaygpO1xuICAgICAgaWYgKGVuZl84My5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzg0KSB8fCBlbmZfODMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkgfHwgZW5mXzgzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkpIHtcbiAgICAgICAgaW5pdF84NiA9IGVuZl84My5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgbG9va2FoZWFkXzg0ID0gZW5mXzgzLnBlZWsoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84NCwgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfODQsIFwib2ZcIikpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzg0LCBcImluXCIpKSB7XG4gICAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzg0LCBcIm9mXCIpKSB7XG4gICAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfODcgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84OCwge2xlZnQ6IGluaXRfODYsIHJpZ2h0OiByaWdodF84NywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF84NSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfOTAgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoZW5mXzgzLnBlZWsoMSksIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIoZW5mXzgzLnBlZWsoMSksIFwib2ZcIikpIHtcbiAgICAgICAgICBsZWZ0Xzg5ID0gZW5mXzgzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgICBsZXQga2luZCA9IGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGtpbmQsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR5cGVfODggPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzg4LCB7bGVmdDogbGVmdF84OSwgcmlnaHQ6IHJpZ2h0Xzg3LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBpbml0Xzg2ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0Xzg1ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXN0Xzg1ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZV85MCA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF84NiwgdGVzdDogdGVzdF84NSwgdXBkYXRlOiB1cGRhdGVfOTAsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdElmU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiaWZcIik7XG4gICAgbGV0IGNvbmRfOTEgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85MiA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfOTEsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzkzID0gZW5mXzkyLnBlZWsoKTtcbiAgICBsZXQgdGVzdF85NCA9IGVuZl85Mi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAodGVzdF85NCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzkyLmNyZWF0ZUVycm9yKGxvb2thaGVhZF85MywgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGNvbnNlcXVlbnRfOTUgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgbGV0IGFsdGVybmF0ZV85NiA9IG51bGw7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImVsc2VcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgYWx0ZXJuYXRlXzk2ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZlN0YXRlbWVudFwiLCB7dGVzdDogdGVzdF85NCwgY29uc2VxdWVudDogY29uc2VxdWVudF85NSwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfOTZ9KTtcbiAgfVxuICBlbmZvcmVzdFdoaWxlU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IGNvbmRfOTcgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl85OCA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfOTcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzk5ID0gZW5mXzk4LnBlZWsoKTtcbiAgICBsZXQgdGVzdF8xMDAgPSBlbmZfOTguZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfMTAwID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfOTguY3JlYXRlRXJyb3IobG9va2FoZWFkXzk5LCBcImV4cGVjdGluZyBhbiBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBsZXQgYm9keV8xMDEgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfMTAwLCBib2R5OiBib2R5XzEwMX0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmVuZm9yZXN0QmxvY2soKX0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2soKSB7XG4gICAgbGV0IGJfMTAyID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgYm9keV8xMDMgPSBbXTtcbiAgICBsZXQgZW5mXzEwNCA9IG5ldyBFbmZvcmVzdGVyKGJfMTAyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xMDQucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gZW5mXzEwNC5wZWVrKCk7XG4gICAgICBsZXQgc3RtdCA9IGVuZl8xMDQuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICAgIGlmIChzdG10ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgZW5mXzEwNC5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwibm90IGEgc3RhdGVtZW50XCIpO1xuICAgICAgfVxuICAgICAgYm9keV8xMDMucHVzaChzdG10KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tcIiwge3N0YXRlbWVudHM6IExpc3QoYm9keV8xMDMpfSk7XG4gIH1cbiAgZW5mb3Jlc3RDbGFzcyh7aXNFeHByLCBpbkRlZmF1bHR9KSB7XG4gICAgbGV0IGt3XzEwNSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBuYW1lXzEwNiA9IG51bGwsIHN1cHJfMTA3ID0gbnVsbDtcbiAgICBsZXQgdHlwZV8xMDggPSBpc0V4cHIgPyBcIkNsYXNzRXhwcmVzc2lvblwiIDogXCJDbGFzc0RlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgbmFtZV8xMDYgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9IGVsc2UgaWYgKCFpc0V4cHIpIHtcbiAgICAgIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgICAgbmFtZV8xMDYgPSBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBTeW50YXguZnJvbUlkZW50aWZpZXIoXCJfZGVmYXVsdFwiLCBrd18xMDUpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZXh0ZW5kc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBzdXByXzEwNyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH1cbiAgICBsZXQgZWxlbWVudHNfMTA5ID0gW107XG4gICAgbGV0IGVuZl8xMTAgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xMTAucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBpZiAoZW5mXzExMC5pc1B1bmN0dWF0b3IoZW5mXzExMC5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICBlbmZfMTEwLmFkdmFuY2UoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgaXNTdGF0aWMgPSBmYWxzZTtcbiAgICAgIGxldCB7bWV0aG9kT3JLZXksIGtpbmR9ID0gZW5mXzExMC5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICAgIGlmIChraW5kID09PSBcImlkZW50aWZpZXJcIiAmJiBtZXRob2RPcktleS52YWx1ZS52YWwoKSA9PT0gXCJzdGF0aWNcIikge1xuICAgICAgICBpc1N0YXRpYyA9IHRydWU7XG4gICAgICAgICh7bWV0aG9kT3JLZXksIGtpbmR9ID0gZW5mXzExMC5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKSk7XG4gICAgICB9XG4gICAgICBpZiAoa2luZCA9PT0gXCJtZXRob2RcIikge1xuICAgICAgICBlbGVtZW50c18xMDkucHVzaChuZXcgVGVybShcIkNsYXNzRWxlbWVudFwiLCB7aXNTdGF0aWM6IGlzU3RhdGljLCBtZXRob2Q6IG1ldGhvZE9yS2V5fSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihlbmZfMTEwLnBlZWsoKSwgXCJPbmx5IG1ldGhvZHMgYXJlIGFsbG93ZWQgaW4gY2xhc3Nlc1wiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTA4LCB7bmFtZTogbmFtZV8xMDYsIHN1cGVyOiBzdXByXzEwNywgZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTA5KX0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ1RhcmdldCh7YWxsb3dQdW5jdHVhdG9yfSA9IHt9KSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMTEgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzExMSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExMSkgfHwgYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKHthbGxvd1B1bmN0dWF0b3I6IGFsbG93UHVuY3R1YXRvcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xMTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5QmluZGluZygpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTExKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCk7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xuICB9XG4gIGVuZm9yZXN0T2JqZWN0QmluZGluZygpIHtcbiAgICBsZXQgZW5mXzExMiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcHJvcGVydGllc18xMTMgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzExMi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHByb3BlcnRpZXNfMTEzLnB1c2goZW5mXzExMi5lbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpKTtcbiAgICAgIGVuZl8xMTIuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IExpc3QocHJvcGVydGllc18xMTMpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nUHJvcGVydHkoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMTQgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQge25hbWUsIGJpbmRpbmd9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTE0KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTE0LCBcImxldFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTE0LCBcInlpZWxkXCIpKSB7XG4gICAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIjpcIikpIHtcbiAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIGxldCBleHByID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgICAgZGVmYXVsdFZhbHVlID0gZXhwcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBiaW5kaW5nLCBpbml0OiBkZWZhdWx0VmFsdWV9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGJpbmRpbmcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogbmFtZSwgYmluZGluZzogYmluZGluZ30pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlCaW5kaW5nKCkge1xuICAgIGxldCBicmFja2V0XzExNSA9IHRoaXMubWF0Y2hTcXVhcmVzKCk7XG4gICAgbGV0IGVuZl8xMTYgPSBuZXcgRW5mb3Jlc3RlcihicmFja2V0XzExNSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBlbGVtZW50c18xMTcgPSBbXSwgcmVzdEVsZW1lbnRfMTE4ID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzExNi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBlbDtcbiAgICAgIGlmIChlbmZfMTE2LmlzUHVuY3R1YXRvcihlbmZfMTE2LnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xMTYuY29uc3VtZUNvbW1hKCk7XG4gICAgICAgIGVsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChlbmZfMTE2LmlzUHVuY3R1YXRvcihlbmZfMTE2LnBlZWsoKSwgXCIuLi5cIikpIHtcbiAgICAgICAgICBlbmZfMTE2LmFkdmFuY2UoKTtcbiAgICAgICAgICByZXN0RWxlbWVudF8xMTggPSBlbmZfMTE2LmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsID0gZW5mXzExNi5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgZW5mXzExNi5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRzXzExNy5wdXNoKGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogTGlzdChlbGVtZW50c18xMTcpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnRfMTE4fSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpIHtcbiAgICBsZXQgYmluZGluZ18xMTkgPSB0aGlzLmVuZm9yZXN0QmluZGluZ1RhcmdldCgpO1xuICAgIGlmICh0aGlzLmlzQXNzaWduKHRoaXMucGVlaygpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgYmluZGluZ18xMTkgPSBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogYmluZGluZ18xMTksIGluaXQ6IGluaXR9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmdfMTE5O1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoe2FsbG93UHVuY3R1YXRvcn0gPSB7fSkge1xuICAgIGxldCBuYW1lXzEyMDtcbiAgICBpZiAoYWxsb3dQdW5jdHVhdG9yICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpKSkge1xuICAgICAgbmFtZV8xMjAgPSB0aGlzLmVuZm9yZXN0UHVuY3R1YXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lXzEyMCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzEyMH0pO1xuICB9XG4gIGVuZm9yZXN0UHVuY3R1YXRvcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyMSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTIxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMjEsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuICBlbmZvcmVzdElkZW50aWZpZXIoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMjIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEyMikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEyMikpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTIyLCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG4gIGVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCkge1xuICAgIGxldCBrd18xMjMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzEyNCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCBsb29rYWhlYWRfMTI0ICYmICF0aGlzLmxpbmVOdW1iZXJFcShrd18xMjMsIGxvb2thaGVhZF8xMjQpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IG51bGx9KTtcbiAgICB9XG4gICAgbGV0IHRlcm1fMTI1ID0gbnVsbDtcbiAgICBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMjQsIFwiO1wiKSkge1xuICAgICAgdGVybV8xMjUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgZXhwZWN0KHRlcm1fMTI1ICE9IG51bGwsIFwiRXhwZWN0aW5nIGFuIGV4cHJlc3Npb24gdG8gZm9sbG93IHJldHVybiBrZXl3b3JkXCIsIGxvb2thaGVhZF8xMjQsIHRoaXMucmVzdCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogdGVybV8xMjV9KTtcbiAgfVxuICBlbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGtpbmRfMTI2O1xuICAgIGxldCBsb29rYWhlYWRfMTI3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGtpbmRTeW5fMTI4ID0gbG9va2FoZWFkXzEyNztcbiAgICBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNiA9IFwidmFyXCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyOCAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyOC5yZXNvbHZlKCkpID09PSBMZXREZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNiA9IFwibGV0XCI7XG4gICAgfSBlbHNlIGlmIChraW5kU3luXzEyOCAmJiB0aGlzLmNvbnRleHQuZW52LmdldChraW5kU3luXzEyOC5yZXNvbHZlKCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI2ID0gXCJjb25zdFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcInN5bnRheFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjgucmVzb2x2ZSgpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjYgPSBcInN5bnRheHJlY1wiO1xuICAgIH1cbiAgICBsZXQgZGVjbHNfMTI5ID0gTGlzdCgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4OiBraW5kXzEyNiA9PT0gXCJzeW50YXhcIiB8fCBraW5kXzEyNiA9PT0gXCJzeW50YXhyZWNcIn0pO1xuICAgICAgbGV0IGxvb2thaGVhZF8xMjcgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGRlY2xzXzEyOSA9IGRlY2xzXzEyOS5jb25jYXQodGVybSk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyNywgXCIsXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IGtpbmRfMTI2LCBkZWNsYXJhdG9yczogZGVjbHNfMTI5fSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0b3Ioe2lzU3ludGF4fSkge1xuICAgIGxldCBpZF8xMzAgPSB0aGlzLmVuZm9yZXN0QmluZGluZ1RhcmdldCh7YWxsb3dQdW5jdHVhdG9yOiBpc1N5bnRheH0pO1xuICAgIGxldCBsb29rYWhlYWRfMTMxID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGluaXRfMTMyLCByZXN0XzEzMztcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzMSwgXCI9XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGluaXRfMTMyID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbml0XzEzMiA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogaWRfMTMwLCBpbml0OiBpbml0XzEzMn0pO1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvblN0YXRlbWVudCgpIHtcbiAgICBsZXQgc3RhcnRfMTM0ID0gdGhpcy5yZXN0LmdldCgwKTtcbiAgICBsZXQgZXhwcl8xMzUgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmIChleHByXzEzNSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihzdGFydF8xMzQsIFwibm90IGEgdmFsaWQgZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwcmVzc2lvblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcl8xMzV9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRfMTM2ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMzcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzNywgXCIsXCIpKSB7XG4gICAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wZXJhdG9yID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGxldCByaWdodCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBsZWZ0XzEzNiA9IG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdF8xMzYsIG9wZXJhdG9yOiBvcGVyYXRvciwgcmlnaHQ6IHJpZ2h0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgcmV0dXJuIGxlZnRfMTM2O1xuICB9XG4gIGVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLm9wQ3R4ID0ge3ByZWM6IDAsIGNvbWJpbmU6IHhfMTM4ID0+IHhfMTM4LCBzdGFjazogTGlzdCgpfTtcbiAgICBkbyB7XG4gICAgICBsZXQgdGVybSA9IHRoaXMuZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpO1xuICAgICAgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcgJiYgdGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX05PX0NIQU5HRV8yNykge1xuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAodGVybSA9PT0gRVhQUl9MT09QX09QRVJBVE9SXzI2IHx8IHRlcm0gPT09IEVYUFJfTE9PUF9FWFBBTlNJT05fMjgpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRlcm07XG4gICAgICB9XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXMudGVybTtcbiAgfVxuICBlbmZvcmVzdEFzc2lnbm1lbnRFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTM5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb21waWxldGltZVRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIHRoaXMucmVzdCA9IHJlc3VsdC5jb25jYXQodGhpcy5yZXN0KTtcbiAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwieWllbGRcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0WWllbGRFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiB0cnVlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJzdXBlclwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTdXBlclwiLCB7fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzkpIHx8IHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzOSkpICYmIHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygxKSwgXCI9PlwiKSAmJiB0aGlzLmxpbmVOdW1iZXJFcShsb29rYWhlYWRfMTM5LCB0aGlzLnBlZWsoMSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycm93RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhUZW1wbGF0ZShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTeW50YXhRdW90ZVRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTeW50YXhRdW90ZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOZXdUcmFuc2Zvcm0obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TmV3RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzksIFwidGhpc1wiKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhpc0V4cHJlc3Npb25cIiwge3N0eDogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEzOSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEzOSwgXCJ5aWVsZFwiKSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IG51bSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKG51bS52YWwoKSA9PT0gMSAvIDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb25cIiwge3ZhbHVlOiBudW19KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IG51bGwsIGVsZW1lbnRzOiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMTM5KSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVsbEV4cHJlc3Npb25cIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgbGV0IHJlU3R4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgbGFzdFNsYXNoID0gcmVTdHgudG9rZW4udmFsdWUubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgbGV0IHBhdHRlcm4gPSByZVN0eC50b2tlbi52YWx1ZS5zbGljZSgxLCBsYXN0U2xhc2gpO1xuICAgICAgbGV0IGZsYWdzID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoICsgMSk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsUmVnRXhwRXhwcmVzc2lvblwiLCB7cGF0dGVybjogcGF0dGVybiwgZmxhZ3M6IGZsYWdzfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIiwge2lubmVyOiB0aGlzLmFkdmFuY2UoKS5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNVcGRhdGVPcGVyYXRvcihsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc09wZXJhdG9yKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTM5LCBcIi5cIikgJiYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSkgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKDEpKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTM5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICBsZXQgcGFyZW4gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHRoaXMudGVybSwgYXJndW1lbnRzOiBwYXJlbi5pbm5lcigpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xMzkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzEzOSkpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzOSwgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV8yNztcbiAgfVxuICBlbmZvcmVzdEFyZ3VtZW50TGlzdCgpIHtcbiAgICBsZXQgcmVzdWx0XzE0MCA9IFtdO1xuICAgIHdoaWxlICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBhcmc7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBhcmcgPSBuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCIsXCIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0XzE0MC5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF8xNDApO1xuICB9XG4gIGVuZm9yZXN0TmV3RXhwcmVzc2lvbigpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIm5ld1wiKTtcbiAgICBsZXQgY2FsbGVlXzE0MTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwibmV3XCIpKSB7XG4gICAgICBjYWxsZWVfMTQxID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcInN1cGVyXCIpKSB7XG4gICAgICBjYWxsZWVfMTQxID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIuXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJ0YXJnZXRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdUYXJnZXRFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGVlXzE0MSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICB9XG4gICAgbGV0IGFyZ3NfMTQyO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xNDIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTQyID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xNDEsIGFyZ3VtZW50czogYXJnc18xNDJ9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE0MyA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTQzLmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE0NCkge1xuICAgIHN3aXRjaCAodGVybV8xNDQudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTQ0LmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xNDQuaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xNDQubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNDQuZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE0NC5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTQ0LnByb3BlcnRpZXMubWFwKHRfMTQ1ID0+IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE0NSkpfSk7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIGxldCBsYXN0ID0gdGVybV8xNDQuZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gXCJTcHJlYWRFbGVtZW50XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE0NC5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHRfMTQ2ID0+IHRfMTQ2ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTQ2KSksIHJlc3RFbGVtZW50OiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdChsYXN0LmV4cHJlc3Npb24pfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDQuZWxlbWVudHMubWFwKHRfMTQ3ID0+IHRfMTQ3ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTQ3KSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDQuZWxlbWVudHMubWFwKHRfMTQ4ID0+IHRfMTQ4ICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE0OCkpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgY2FzZSBcIlN0YXRpY1Byb3BlcnR5TmFtZVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDQudmFsdWV9KTtcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQXJyYXlCaW5kaW5nXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ0lkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nV2l0aERlZmF1bHRcIjpcbiAgICAgIGNhc2UgXCJPYmplY3RCaW5kaW5nXCI6XG4gICAgICAgIHJldHVybiB0ZXJtXzE0NDtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yIFwiICsgdGVybV8xNDQudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTQ5KSB7XG4gICAgc3dpdGNoICh0ZXJtXzE0OS50eXBlKSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDkuYmluZGluZyksIGluaXQ6IHRlcm1fMTQ5LmV4cHJlc3Npb259KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE0OSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNTA7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgZW5mXzE1MCA9IG5ldyBFbmZvcmVzdGVyKExpc3Qub2YodGhpcy5hZHZhbmNlKCkpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgZW5mXzE1MCA9IG5ldyBFbmZvcmVzdGVyKHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtc18xNTEgPSBlbmZfMTUwLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiPT5cIik7XG4gICAgbGV0IGJvZHlfMTUyO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keV8xNTIgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmZfMTUwID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBib2R5XzE1MiA9IGVuZl8xNTAuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mXzE1MC5yZXN0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJvd0V4cHJlc3Npb25cIiwge3BhcmFtczogcGFyYW1zXzE1MSwgYm9keTogYm9keV8xNTJ9KTtcbiAgfVxuICBlbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpIHtcbiAgICBsZXQga3dkXzE1MyA9IHRoaXMubWF0Y2hLZXl3b3JkKFwieWllbGRcIik7XG4gICAgbGV0IGxvb2thaGVhZF8xNTQgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE1NCAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dkXzE1MywgbG9va2FoZWFkXzE1NCkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaXNHZW5lcmF0b3IgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIqXCIpKSB7XG4gICAgICAgIGlzR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBsZXQgdHlwZSA9IGlzR2VuZXJhdG9yID8gXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiA6IFwiWWllbGRFeHByZXNzaW9uXCI7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge2V4cHJlc3Npb246IGV4cHJ9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhUZW1wbGF0ZVwiLCB7dGVtcGxhdGU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhRdW90ZSgpIHtcbiAgICBsZXQgbmFtZV8xNTUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhRdW90ZVwiLCB7bmFtZTogbmFtZV8xNTUsIHRlbXBsYXRlOiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE1NX0pLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmplY3RfMTU2ID0gdGhpcy50ZXJtO1xuICAgIGxldCBkb3RfMTU3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnR5XzE1OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogb2JqZWN0XzE1NiwgcHJvcGVydHk6IHByb3BlcnR5XzE1OH0pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCkge1xuICAgIGxldCBhcnJfMTU5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzE2MCA9IFtdO1xuICAgIGxldCBlbmZfMTYxID0gbmV3IEVuZm9yZXN0ZXIoYXJyXzE1OS5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xNjEucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xNjEucGVlaygpO1xuICAgICAgaWYgKGVuZl8xNjEuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xNjEuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50c18xNjAucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5mXzE2MS5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICBlbmZfMTYxLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBlbmZfMTYxLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xNjEuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE2MC5wdXNoKG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0ZXJtID0gZW5mXzE2MS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmICh0ZXJtID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTYxLmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE2MC5wdXNoKHRlcm0pO1xuICAgICAgICBlbmZfMTYxLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzE2MCl9KTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9ial8xNjIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydGllc18xNjMgPSBMaXN0KCk7XG4gICAgbGV0IGVuZl8xNjQgPSBuZXcgRW5mb3Jlc3RlcihvYmpfMTYyLmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbGFzdFByb3BfMTY1ID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzE2NC5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZl8xNjQuZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKTtcbiAgICAgIGVuZl8xNjQuY29uc3VtZUNvbW1hKCk7XG4gICAgICBwcm9wZXJ0aWVzXzE2MyA9IHByb3BlcnRpZXNfMTYzLmNvbmNhdChwcm9wKTtcbiAgICAgIGlmIChsYXN0UHJvcF8xNjUgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mXzE2NC5jcmVhdGVFcnJvcihwcm9wLCBcImludmFsaWQgc3ludGF4IGluIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICAgIGxhc3RQcm9wXzE2NSA9IHByb3A7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXNfMTYzfSk7XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG4gICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSB0aGlzLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBcIm1ldGhvZFwiOlxuICAgICAgICByZXR1cm4gbWV0aG9kT3JLZXk7XG4gICAgICBjYXNlIFwiaWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2luaXQ6IGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSl9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlNob3J0aGFuZFByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleS52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgZXhwcl8xNjYgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LCBleHByZXNzaW9uOiBleHByXzE2Nn0pO1xuICB9XG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE2NyA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xNjggPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE2NywgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xNjggPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTY3LCBcImdldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiR2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NywgXCJzZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJTZXR0ZXJcIiwge25hbWU6IG5hbWUsIHBhcmFtOiBwYXJhbSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJNZXRob2RcIiwge2lzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xNjgsIG5hbWU6IG5hbWUsIHBhcmFtczogZm9ybWFsUGFyYW1zLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuYW1lLCBraW5kOiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTY3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTY3KSA/IFwiaWRlbnRpZmllclwiIDogXCJwcm9wZXJ0eVwifTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5TmFtZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE2OSA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTY5KSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE2OSkpIHtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTY5KSkge1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBleHByID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogZXhwcn0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IG5hbWVfMTcwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5hbWVfMTcwfSksIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTcwfSl9O1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwciwgaW5EZWZhdWx0LCBhbGxvd0dlbmVyYXRvcn0pIHtcbiAgICBsZXQgbmFtZV8xNzEgPSBudWxsLCBwYXJhbXNfMTcyLCBib2R5XzE3MywgcmVzdF8xNzQ7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE3NSA9IGZhbHNlO1xuICAgIGxldCBmbktleXdvcmRfMTc2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xNzcgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZV8xNzggPSBpc0V4cHIgPyBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIDogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNzcsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTc1ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE3NyA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE3NykpIHtcbiAgICAgIG5hbWVfMTcxID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWVfMTcxID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiKmRlZmF1bHQqXCIsIGZuS2V5d29yZF8xNzYpfSk7XG4gICAgfVxuICAgIHBhcmFtc18xNzIgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xNzMgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTc5ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE3MiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTgwID0gZW5mXzE3OS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xNzgsIHtuYW1lOiBuYW1lXzE3MSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE3NSwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTgwLCBib2R5OiBib2R5XzE3M30pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCkge1xuICAgIGxldCBuYW1lXzE4MSA9IG51bGwsIHBhcmFtc18xODIsIGJvZHlfMTgzLCByZXN0XzE4NDtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTg1ID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xODYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE4NiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xODUgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMTg2ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTg2KSkge1xuICAgICAgbmFtZV8xODEgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcGFyYW1zXzE4MiA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzE4MyA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8xODcgPSBuZXcgRW5mb3Jlc3RlcihwYXJhbXNfMTgyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18xODggPSBlbmZfMTg3LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xODEsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xODUsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE4OCwgYm9keTogYm9keV8xODN9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IG5hbWVfMTg5LCBwYXJhbXNfMTkwLCBib2R5XzE5MSwgcmVzdF8xOTI7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE5MyA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTk0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xOTQsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTkzID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBuYW1lXzE4OSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIHBhcmFtc18xOTAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xOTEgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTk1ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE5MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTk2ID0gZW5mXzE5NS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsIHtuYW1lOiBuYW1lXzE4OSwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzE5MywgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMTk2LCBib2R5OiBib2R5XzE5MX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpIHtcbiAgICBsZXQgaXRlbXNfMTk3ID0gW107XG4gICAgbGV0IHJlc3RfMTk4ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLi4uXCIpO1xuICAgICAgICByZXN0XzE5OCA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGl0ZW1zXzE5Ny5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBMaXN0KGl0ZW1zXzE5NyksIHJlc3Q6IHJlc3RfMTk4fSk7XG4gIH1cbiAgZW5mb3Jlc3RQYXJhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8xOTkgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiBmYWxzZSwgb3BlcmF0b3I6IG9wZXJhdG9yXzE5OS52YWwoKSwgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSl9KTtcbiAgfVxuICBlbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMjAwID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgIHRoaXMub3BDdHgucHJlYyA9IDE0O1xuICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMDEgPT4ge1xuICAgICAgbGV0IHR5cGVfMjAyLCB0ZXJtXzIwMywgaXNQcmVmaXhfMjA0O1xuICAgICAgaWYgKG9wZXJhdG9yXzIwMC52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzIwMC52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMjAyID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMjAzID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybV8yMDEpO1xuICAgICAgICBpc1ByZWZpeF8yMDQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZV8yMDIgPSBcIlVuYXJ5RXhwcmVzc2lvblwiO1xuICAgICAgICBpc1ByZWZpeF8yMDQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRlcm1fMjAzID0gcmlnaHRUZXJtXzIwMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIwMiwge29wZXJhdG9yOiBvcGVyYXRvcl8yMDAudmFsKCksIG9wZXJhbmQ6IHRlcm1fMjAzLCBpc1ByZWZpeDogaXNQcmVmaXhfMjA0fSk7XG4gICAgfTtcbiAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzI2O1xuICB9XG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIGxldCB0ZXN0XzIwNSA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgIGlmICh0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj9cIik7XG4gICAgbGV0IGVuZl8yMDYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY29uc2VxdWVudF8yMDcgPSBlbmZfMjA2LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmZfMjA2Lm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgZW5mXzIwNiA9IG5ldyBFbmZvcmVzdGVyKGVuZl8yMDYucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhbHRlcm5hdGVfMjA4ID0gZW5mXzIwNi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgdGhpcy5yZXN0ID0gZW5mXzIwNi5yZXN0O1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGVzdF8yMDUsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMjA3LCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8yMDh9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRUZXJtXzIwOSA9IHRoaXMudGVybTtcbiAgICBsZXQgb3BTdHhfMjEwID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG9wXzIxMSA9IG9wU3R4XzIxMC52YWwoKTtcbiAgICBsZXQgb3BQcmVjXzIxMiA9IGdldE9wZXJhdG9yUHJlYyhvcF8yMTEpO1xuICAgIGxldCBvcEFzc29jXzIxMyA9IGdldE9wZXJhdG9yQXNzb2Mob3BfMjExKTtcbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlY18yMTIsIG9wQXNzb2NfMjEzKSkge1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IG9wUHJlY18yMTI7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjE0ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMjA5LCBvcGVyYXRvcjogb3BTdHhfMjEwLCByaWdodDogcmlnaHRUZXJtXzIxNH0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl8yNjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm1fMjA5KTtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjE1ID0gdGhpcy5tYXRjaFRlbXBsYXRlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzIxNiA9IGxvb2thaGVhZF8yMTUudG9rZW4uaXRlbXMubWFwKGl0XzIxNyA9PiB7XG4gICAgICBpZiAoaXRfMjE3IGluc3RhbmNlb2YgU3ludGF4ICYmIGl0XzIxNy5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3RlcihpdF8yMTcuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IGl0XzIxNy5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzIxNjtcbiAgfVxuICBleHBhbmRNYWNybyhlbmZvcmVzdFR5cGVfMjE4KSB7XG4gICAgbGV0IG5hbWVfMjE5ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHN5bnRheFRyYW5zZm9ybV8yMjAgPSB0aGlzLmdldENvbXBpbGV0aW1lVHJhbnNmb3JtKG5hbWVfMjE5KTtcbiAgICBpZiAoc3ludGF4VHJhbnNmb3JtXzIyMCA9PSBudWxsIHx8IHR5cGVvZiBzeW50YXhUcmFuc2Zvcm1fMjIwLnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTksIFwidGhlIG1hY3JvIG5hbWUgd2FzIG5vdCBib3VuZCB0byBhIHZhbHVlIHRoYXQgY291bGQgYmUgaW52b2tlZFwiKTtcbiAgICB9XG4gICAgbGV0IHVzZVNpdGVTY29wZV8yMjEgPSBmcmVzaFNjb3BlKFwidVwiKTtcbiAgICBsZXQgaW50cm9kdWNlZFNjb3BlXzIyMiA9IGZyZXNoU2NvcGUoXCJpXCIpO1xuICAgIHRoaXMuY29udGV4dC51c2VTY29wZSA9IHVzZVNpdGVTY29wZV8yMjE7XG4gICAgbGV0IGN0eF8yMjMgPSBuZXcgTWFjcm9Db250ZXh0KHRoaXMsIG5hbWVfMjE5LCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZV8yMjEsIGludHJvZHVjZWRTY29wZV8yMjIpO1xuICAgIGxldCByZXN1bHRfMjI0ID0gc2FuaXRpemVSZXBsYWNlbWVudFZhbHVlcyhzeW50YXhUcmFuc2Zvcm1fMjIwLnZhbHVlLmNhbGwobnVsbCwgY3R4XzIyMykpO1xuICAgIGlmICghTGlzdC5pc0xpc3QocmVzdWx0XzIyNCkpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTksIFwibWFjcm8gbXVzdCByZXR1cm4gYSBsaXN0IGJ1dCBnb3Q6IFwiICsgcmVzdWx0XzIyNCk7XG4gICAgfVxuICAgIHJlc3VsdF8yMjQgPSByZXN1bHRfMjI0Lm1hcChzdHhfMjI1ID0+IHtcbiAgICAgIGlmICghKHN0eF8yMjUgJiYgdHlwZW9mIHN0eF8yMjUuYWRkU2NvcGUgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lXzIxOSwgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eF8yMjUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0eF8yMjUuYWRkU2NvcGUoaW50cm9kdWNlZFNjb3BlXzIyMiwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCB7ZmxpcDogdHJ1ZX0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRfMjI0O1xuICB9XG4gIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMjYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzIyNiAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjI2LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yMjcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzIyNyAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjI3LCBcIixcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBpc1Rlcm0odGVybV8yMjgpIHtcbiAgICByZXR1cm4gdGVybV8yMjggJiYgdGVybV8yMjggaW5zdGFuY2VvZiBUZXJtO1xuICB9XG4gIGlzRU9GKHRlcm1fMjI5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjI5ICYmIHRlcm1fMjI5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjI5LmlzRU9GKCk7XG4gIH1cbiAgaXNJZGVudGlmaWVyKHRlcm1fMjMwLCB2YWxfMjMxID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzIzMCAmJiB0ZXJtXzIzMCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzMC5pc0lkZW50aWZpZXIoKSAmJiAodmFsXzIzMSA9PT0gbnVsbCB8fCB0ZXJtXzIzMC52YWwoKSA9PT0gdmFsXzIzMSk7XG4gIH1cbiAgaXNQcm9wZXJ0eU5hbWUodGVybV8yMzIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWZpZXIodGVybV8yMzIpIHx8IHRoaXMuaXNLZXl3b3JkKHRlcm1fMjMyKSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwodGVybV8yMzIpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKHRlcm1fMjMyKSB8fCB0aGlzLmlzQnJhY2tldHModGVybV8yMzIpO1xuICB9XG4gIGlzTnVtZXJpY0xpdGVyYWwodGVybV8yMzMpIHtcbiAgICByZXR1cm4gdGVybV8yMzMgJiYgdGVybV8yMzMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzMuaXNOdW1lcmljTGl0ZXJhbCgpO1xuICB9XG4gIGlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzIzNCkge1xuICAgIHJldHVybiB0ZXJtXzIzNCAmJiB0ZXJtXzIzNCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNC5pc1N0cmluZ0xpdGVyYWwoKTtcbiAgfVxuICBpc1RlbXBsYXRlKHRlcm1fMjM1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM1ICYmIHRlcm1fMjM1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM1LmlzVGVtcGxhdGUoKTtcbiAgfVxuICBpc0Jvb2xlYW5MaXRlcmFsKHRlcm1fMjM2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM2ICYmIHRlcm1fMjM2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM2LmlzQm9vbGVhbkxpdGVyYWwoKTtcbiAgfVxuICBpc051bGxMaXRlcmFsKHRlcm1fMjM3KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM3ICYmIHRlcm1fMjM3IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM3LmlzTnVsbExpdGVyYWwoKTtcbiAgfVxuICBpc1JlZ3VsYXJFeHByZXNzaW9uKHRlcm1fMjM4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjM4ICYmIHRlcm1fMjM4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjM4LmlzUmVndWxhckV4cHJlc3Npb24oKTtcbiAgfVxuICBpc1BhcmVucyh0ZXJtXzIzOSkge1xuICAgIHJldHVybiB0ZXJtXzIzOSAmJiB0ZXJtXzIzOSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzOS5pc1BhcmVucygpO1xuICB9XG4gIGlzQnJhY2VzKHRlcm1fMjQwKSB7XG4gICAgcmV0dXJuIHRlcm1fMjQwICYmIHRlcm1fMjQwIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQwLmlzQnJhY2VzKCk7XG4gIH1cbiAgaXNCcmFja2V0cyh0ZXJtXzI0MSkge1xuICAgIHJldHVybiB0ZXJtXzI0MSAmJiB0ZXJtXzI0MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0MS5pc0JyYWNrZXRzKCk7XG4gIH1cbiAgaXNBc3NpZ24odGVybV8yNDIpIHtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGVybV8yNDIpKSB7XG4gICAgICBzd2l0Y2ggKHRlcm1fMjQyLnZhbCgpKSB7XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCJ8PVwiOlxuICAgICAgICBjYXNlIFwiXj1cIjpcbiAgICAgICAgY2FzZSBcIiY9XCI6XG4gICAgICAgIGNhc2UgXCI8PD1cIjpcbiAgICAgICAgY2FzZSBcIj4+PVwiOlxuICAgICAgICBjYXNlIFwiPj4+PVwiOlxuICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgY2FzZSBcIi09XCI6XG4gICAgICAgIGNhc2UgXCIqPVwiOlxuICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaXNLZXl3b3JkKHRlcm1fMjQzLCB2YWxfMjQ0ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI0MyAmJiB0ZXJtXzI0MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0My5pc0tleXdvcmQoKSAmJiAodmFsXzI0NCA9PT0gbnVsbCB8fCB0ZXJtXzI0My52YWwoKSA9PT0gdmFsXzI0NCk7XG4gIH1cbiAgaXNQdW5jdHVhdG9yKHRlcm1fMjQ1LCB2YWxfMjQ2ID0gbnVsbCkge1xuICAgIHJldHVybiB0ZXJtXzI0NSAmJiB0ZXJtXzI0NSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0NS5pc1B1bmN0dWF0b3IoKSAmJiAodmFsXzI0NiA9PT0gbnVsbCB8fCB0ZXJtXzI0NS52YWwoKSA9PT0gdmFsXzI0Nik7XG4gIH1cbiAgaXNPcGVyYXRvcih0ZXJtXzI0Nykge1xuICAgIHJldHVybiB0ZXJtXzI0NyAmJiB0ZXJtXzI0NyBpbnN0YW5jZW9mIFN5bnRheCAmJiBpc09wZXJhdG9yKHRlcm1fMjQ3KTtcbiAgfVxuICBpc1VwZGF0ZU9wZXJhdG9yKHRlcm1fMjQ4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ4ICYmIHRlcm1fMjQ4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjQ4LmlzUHVuY3R1YXRvcigpICYmICh0ZXJtXzI0OC52YWwoKSA9PT0gXCIrK1wiIHx8IHRlcm1fMjQ4LnZhbCgpID09PSBcIi0tXCIpO1xuICB9XG4gIGlzRm5EZWNsVHJhbnNmb3JtKHRlcm1fMjQ5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ5ICYmIHRlcm1fMjQ5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ5LnJlc29sdmUoKSkgPT09IEZ1bmN0aW9uRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1ZhckRlY2xUcmFuc2Zvcm0odGVybV8yNTApIHtcbiAgICByZXR1cm4gdGVybV8yNTAgJiYgdGVybV8yNTAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTAucmVzb2x2ZSgpKSA9PT0gVmFyaWFibGVEZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzTGV0RGVjbFRyYW5zZm9ybSh0ZXJtXzI1MSkge1xuICAgIHJldHVybiB0ZXJtXzI1MSAmJiB0ZXJtXzI1MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1MS5yZXNvbHZlKCkpID09PSBMZXREZWNsVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29uc3REZWNsVHJhbnNmb3JtKHRlcm1fMjUyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUyICYmIHRlcm1fMjUyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUyLnJlc29sdmUoKSkgPT09IENvbnN0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheERlY2xUcmFuc2Zvcm0odGVybV8yNTMpIHtcbiAgICByZXR1cm4gdGVybV8yNTMgJiYgdGVybV8yNTMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTMucmVzb2x2ZSgpKSA9PT0gU3ludGF4RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0odGVybV8yNTQpIHtcbiAgICByZXR1cm4gdGVybV8yNTQgJiYgdGVybV8yNTQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTQucmVzb2x2ZSgpKSA9PT0gU3ludGF4cmVjRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc1N5bnRheFRlbXBsYXRlKHRlcm1fMjU1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU1ICYmIHRlcm1fMjU1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjU1LmlzU3ludGF4VGVtcGxhdGUoKTtcbiAgfVxuICBpc1N5bnRheFF1b3RlVHJhbnNmb3JtKHRlcm1fMjU2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU2ICYmIHRlcm1fMjU2IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU2LnJlc29sdmUoKSkgPT09IFN5bnRheFF1b3RlVHJhbnNmb3JtO1xuICB9XG4gIGlzUmV0dXJuU3RtdFRyYW5zZm9ybSh0ZXJtXzI1Nykge1xuICAgIHJldHVybiB0ZXJtXzI1NyAmJiB0ZXJtXzI1NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1Ny5yZXNvbHZlKCkpID09PSBSZXR1cm5TdGF0ZW1lbnRUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaGlsZVRyYW5zZm9ybSh0ZXJtXzI1OCkge1xuICAgIHJldHVybiB0ZXJtXzI1OCAmJiB0ZXJtXzI1OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OC5yZXNvbHZlKCkpID09PSBXaGlsZVRyYW5zZm9ybTtcbiAgfVxuICBpc0ZvclRyYW5zZm9ybSh0ZXJtXzI1OSkge1xuICAgIHJldHVybiB0ZXJtXzI1OSAmJiB0ZXJtXzI1OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1OS5yZXNvbHZlKCkpID09PSBGb3JUcmFuc2Zvcm07XG4gIH1cbiAgaXNTd2l0Y2hUcmFuc2Zvcm0odGVybV8yNjApIHtcbiAgICByZXR1cm4gdGVybV8yNjAgJiYgdGVybV8yNjAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjAucmVzb2x2ZSgpKSA9PT0gU3dpdGNoVHJhbnNmb3JtO1xuICB9XG4gIGlzQnJlYWtUcmFuc2Zvcm0odGVybV8yNjEpIHtcbiAgICByZXR1cm4gdGVybV8yNjEgJiYgdGVybV8yNjEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjEucmVzb2x2ZSgpKSA9PT0gQnJlYWtUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb250aW51ZVRyYW5zZm9ybSh0ZXJtXzI2Mikge1xuICAgIHJldHVybiB0ZXJtXzI2MiAmJiB0ZXJtXzI2MiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2Mi5yZXNvbHZlKCkpID09PSBDb250aW51ZVRyYW5zZm9ybTtcbiAgfVxuICBpc0RvVHJhbnNmb3JtKHRlcm1fMjYzKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYzICYmIHRlcm1fMjYzIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYzLnJlc29sdmUoKSkgPT09IERvVHJhbnNmb3JtO1xuICB9XG4gIGlzRGVidWdnZXJUcmFuc2Zvcm0odGVybV8yNjQpIHtcbiAgICByZXR1cm4gdGVybV8yNjQgJiYgdGVybV8yNjQgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjQucmVzb2x2ZSgpKSA9PT0gRGVidWdnZXJUcmFuc2Zvcm07XG4gIH1cbiAgaXNXaXRoVHJhbnNmb3JtKHRlcm1fMjY1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY1ICYmIHRlcm1fMjY1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY1LnJlc29sdmUoKSkgPT09IFdpdGhUcmFuc2Zvcm07XG4gIH1cbiAgaXNUcnlUcmFuc2Zvcm0odGVybV8yNjYpIHtcbiAgICByZXR1cm4gdGVybV8yNjYgJiYgdGVybV8yNjYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjYucmVzb2x2ZSgpKSA9PT0gVHJ5VHJhbnNmb3JtO1xuICB9XG4gIGlzVGhyb3dUcmFuc2Zvcm0odGVybV8yNjcpIHtcbiAgICByZXR1cm4gdGVybV8yNjcgJiYgdGVybV8yNjcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjcucmVzb2x2ZSgpKSA9PT0gVGhyb3dUcmFuc2Zvcm07XG4gIH1cbiAgaXNJZlRyYW5zZm9ybSh0ZXJtXzI2OCkge1xuICAgIHJldHVybiB0ZXJtXzI2OCAmJiB0ZXJtXzI2OCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OC5yZXNvbHZlKCkpID09PSBJZlRyYW5zZm9ybTtcbiAgfVxuICBpc05ld1RyYW5zZm9ybSh0ZXJtXzI2OSkge1xuICAgIHJldHVybiB0ZXJtXzI2OSAmJiB0ZXJtXzI2OSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2OS5yZXNvbHZlKCkpID09PSBOZXdUcmFuc2Zvcm07XG4gIH1cbiAgaXNDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI3MCkge1xuICAgIHJldHVybiB0ZXJtXzI3MCAmJiB0ZXJtXzI3MCBpbnN0YW5jZW9mIFN5bnRheCAmJiAodGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzAucmVzb2x2ZSgpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtIHx8IHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yNzAucmVzb2x2ZSgpKSBpbnN0YW5jZW9mIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuICBnZXRDb21waWxldGltZVRyYW5zZm9ybSh0ZXJtXzI3MSkge1xuICAgIGlmICh0aGlzLmNvbnRleHQuZW52Lmhhcyh0ZXJtXzI3MS5yZXNvbHZlKCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNzEucmVzb2x2ZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5zdG9yZS5nZXQodGVybV8yNzEucmVzb2x2ZSgpKTtcbiAgfVxuICBsaW5lTnVtYmVyRXEoYV8yNzIsIGJfMjczKSB7XG4gICAgaWYgKCEoYV8yNzIgJiYgYl8yNzMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBhXzI3Mi5saW5lTnVtYmVyKCkgPT09IGJfMjczLmxpbmVOdW1iZXIoKTtcbiAgfVxuICBtYXRjaElkZW50aWZpZXIodmFsXzI3NCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8yNzUpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc1LCBcImV4cGVjdGluZyBhbiBpZGVudGlmaWVyXCIpO1xuICB9XG4gIG1hdGNoS2V5d29yZCh2YWxfMjc2KSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzI3NywgdmFsXzI3NikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc3O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzcsIFwiZXhwZWN0aW5nIFwiICsgdmFsXzI3Nik7XG4gIH1cbiAgbWF0Y2hMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNOdW1lcmljTGl0ZXJhbChsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzI3OCkgfHwgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8yNzgpIHx8IHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMjc4KSB8fCB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzI3OCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc4O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzgsIFwiZXhwZWN0aW5nIGEgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFN0cmluZ0xpdGVyYWwoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzI3OSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjc5O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yNzksIFwiZXhwZWN0aW5nIGEgc3RyaW5nIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hUZW1wbGF0ZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzI4MCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgwO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODAsIFwiZXhwZWN0aW5nIGEgdGVtcGxhdGUgbGl0ZXJhbFwiKTtcbiAgfVxuICBtYXRjaFBhcmVucygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8yODEpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MS5pbm5lcigpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODEsIFwiZXhwZWN0aW5nIHBhcmVuc1wiKTtcbiAgfVxuICBtYXRjaEN1cmxpZXMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMjgyKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODIuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgyLCBcImV4cGVjdGluZyBjdXJseSBicmFjZXNcIik7XG4gIH1cbiAgbWF0Y2hTcXVhcmVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjgzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMjgzKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODMuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgzLCBcImV4cGVjdGluZyBzcWF1cmUgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoVW5hcnlPcGVyYXRvcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4NCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChpc1VuYXJ5T3BlcmF0b3IobG9va2FoZWFkXzI4NCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjg0O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODQsIFwiZXhwZWN0aW5nIGEgdW5hcnkgb3BlcmF0b3JcIik7XG4gIH1cbiAgbWF0Y2hQdW5jdHVhdG9yKHZhbF8yODUpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjg2KSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWxfMjg1ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmIChsb29rYWhlYWRfMjg2LnZhbCgpID09PSB2YWxfMjg1KSB7XG4gICAgICAgICAgcmV0dXJuIGxvb2thaGVhZF8yODY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjg2LCBcImV4cGVjdGluZyBhIFwiICsgdmFsXzI4NSArIFwiIHB1bmN0dWF0b3JcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjg2O1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8yODYsIFwiZXhwZWN0aW5nIGEgcHVuY3R1YXRvclwiKTtcbiAgfVxuICBjcmVhdGVFcnJvcihzdHhfMjg3LCBtZXNzYWdlXzI4OCkge1xuICAgIGxldCBjdHhfMjg5ID0gXCJcIjtcbiAgICBsZXQgb2ZmZW5kaW5nXzI5MCA9IHN0eF8yODc7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID4gMCkge1xuICAgICAgY3R4XzI4OSA9IHRoaXMucmVzdC5zbGljZSgwLCAyMCkubWFwKHRlcm1fMjkxID0+IHtcbiAgICAgICAgaWYgKHRlcm1fMjkxLmlzRGVsaW1pdGVyKCkpIHtcbiAgICAgICAgICByZXR1cm4gdGVybV8yOTEuaW5uZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGlzdC5vZih0ZXJtXzI5MSk7XG4gICAgICB9KS5mbGF0dGVuKCkubWFwKHNfMjkyID0+IHtcbiAgICAgICAgaWYgKHNfMjkyID09PSBvZmZlbmRpbmdfMjkwKSB7XG4gICAgICAgICAgcmV0dXJuIFwiX19cIiArIHNfMjkyLnZhbCgpICsgXCJfX1wiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzXzI5Mi52YWwoKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHhfMjg5ID0gb2ZmZW5kaW5nXzI5MC50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEVycm9yKG1lc3NhZ2VfMjg4ICsgXCJcXG5cIiArIGN0eF8yODkpO1xuICB9XG59XG4iXX0=