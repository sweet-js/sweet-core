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
      var kind_124 = undefined;
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
      var init_130 = undefined,
          rest_131 = undefined;
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
        result_138.push(arg);
      }
      return (0, _immutable.List)(result_138);
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword("new");
      var callee_139 = undefined;
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
      var args_140 = undefined;
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
      var enf_148 = undefined;
      if (this.isIdentifier(this.peek())) {
        enf_148 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();
        enf_148 = new Enforester(p, (0, _immutable.List)(), this.context);
      }
      var params_149 = enf_148.enforestFormalParameters();
      this.matchPunctuator("=>");
      var body_150 = undefined;
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
        return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_166, name: name, params: formalParams, body: body }), kind: "method" };
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
          params_170 = undefined,
          body_171 = undefined,
          rest_172 = undefined;
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
          params_180 = undefined,
          body_181 = undefined,
          rest_182 = undefined;
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
      var name_187 = undefined,
          params_188 = undefined,
          body_189 = undefined,
          rest_190 = undefined;
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
        var type_200 = undefined,
            term_201 = undefined,
            isPrefix_202 = undefined;
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
})();
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztLQUNqRTs7O2dDQUNXLE9BQU8sRUFBRSxXQUFXLEVBQUU7QUFDaEMsVUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFVBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQztBQUM1QixVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUN0QixlQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUMvQyxjQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUMxQixtQkFBTyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7V0FDekI7QUFDRCxpQkFBTyxnQkFBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDMUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN4QixjQUFJLEtBQUssS0FBSyxhQUFhLEVBQUU7QUFDM0IsbUJBQU8sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7V0FDbEM7QUFDRCxpQkFBTyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNkLE1BQU07QUFDTCxlQUFPLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ3BDO0FBQ0QsYUFBTyxJQUFJLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0tBQ2hEOzs7U0E5K0NVLFVBQVUiLCJmaWxlIjoiZW5mb3Jlc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Z1bmN0aW9uRGVjbFRyYW5zZm9ybSwgVmFyaWFibGVEZWNsVHJhbnNmb3JtLCBOZXdUcmFuc2Zvcm0sIExldERlY2xUcmFuc2Zvcm0sIENvbnN0RGVjbFRyYW5zZm9ybSwgU3ludGF4RGVjbFRyYW5zZm9ybSwgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSwgU3ludGF4UXVvdGVUcmFuc2Zvcm0sIFJldHVyblN0YXRlbWVudFRyYW5zZm9ybSwgV2hpbGVUcmFuc2Zvcm0sIElmVHJhbnNmb3JtLCBGb3JUcmFuc2Zvcm0sIFN3aXRjaFRyYW5zZm9ybSwgQnJlYWtUcmFuc2Zvcm0sIENvbnRpbnVlVHJhbnNmb3JtLCBEb1RyYW5zZm9ybSwgRGVidWdnZXJUcmFuc2Zvcm0sIFdpdGhUcmFuc2Zvcm0sIFRyeVRyYW5zZm9ybSwgVGhyb3dUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtpc09wZXJhdG9yLCBpc1VuYXJ5T3BlcmF0b3IsIGdldE9wZXJhdG9yQXNzb2MsIGdldE9wZXJhdG9yUHJlYywgb3BlcmF0b3JMdH0gZnJvbSBcIi4vb3BlcmF0b3JzXCI7XG5pbXBvcnQgU3ludGF4IGZyb20gXCIuL3N5bnRheFwiO1xuaW1wb3J0IHtmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuaW1wb3J0IHtzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzfSBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IE1hY3JvQ29udGV4dCBmcm9tIFwiLi9tYWNyby1jb250ZXh0XCI7XG5jb25zdCBFWFBSX0xPT1BfT1BFUkFUT1JfMjYgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9FWFBBTlNJT05fMjggPSB7fTtcbmV4cG9ydCBjbGFzcyBFbmZvcmVzdGVyIHtcbiAgY29uc3RydWN0b3Ioc3R4bF8yOSwgcHJldl8zMCwgY29udGV4dF8zMSkge1xuICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChzdHhsXzI5KSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChMaXN0LmlzTGlzdChwcmV2XzMwKSwgXCJleHBlY3RpbmcgYSBsaXN0IG9mIHRlcm1zIHRvIGVuZm9yZXN0XCIpO1xuICAgIGFzc2VydChjb250ZXh0XzMxLCBcImV4cGVjdGluZyBhIGNvbnRleHQgdG8gZW5mb3Jlc3RcIik7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICB0aGlzLnJlc3QgPSBzdHhsXzI5O1xuICAgIHRoaXMucHJldiA9IHByZXZfMzA7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF8zMTtcbiAgfVxuICBwZWVrKG5fMzIgPSAwKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzdC5nZXQobl8zMik7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBsZXQgcmV0XzMzID0gdGhpcy5yZXN0LmZpcnN0KCk7XG4gICAgdGhpcy5yZXN0ID0gdGhpcy5yZXN0LnJlc3QoKTtcbiAgICByZXR1cm4gcmV0XzMzO1xuICB9XG4gIGVuZm9yZXN0KHR5cGVfMzQgPSBcIk1vZHVsZVwiKSB7XG4gICAgdGhpcy50ZXJtID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0VPRih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiRU9GXCIsIHt9KTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudGVybTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdF8zNTtcbiAgICBpZiAodHlwZV8zNCA9PT0gXCJleHByZXNzaW9uXCIpIHtcbiAgICAgIHJlc3VsdF8zNSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRfMzUgPSB0aGlzLmVuZm9yZXN0TW9kdWxlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF8zNTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdEJvZHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RNb2R1bGVJdGVtKCk7XG4gIH1cbiAgZW5mb3Jlc3RNb2R1bGVJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzM2LCBcImltcG9ydFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzYsIFwiZXhwb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RXhwb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzM3LCBcIipcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRBbGxGcm9tXCIsIHttb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMzcpKSB7XG4gICAgICBsZXQgbmFtZWRFeHBvcnRzID0gdGhpcy5lbmZvcmVzdEV4cG9ydENsYXVzZSgpO1xuICAgICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IG51bGw7XG4gICAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiZnJvbVwiKSkge1xuICAgICAgICBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RnJvbVwiLCB7bmFtZWRFeHBvcnRzOiBuYW1lZEV4cG9ydHMsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzcsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiBmYWxzZX0pfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMzcsIFwiZGVmYXVsdFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybSh0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjbGFzc1wiKSkge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnREZWZhdWx0XCIsIHtib2R5OiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogdHJ1ZX0pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgYm9keSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogYm9keX0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5pc1ZhckRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpIHx8IHRoaXMuaXNDb25zdERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzM3KSB8fCB0aGlzLmlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMzcpIHx8IHRoaXMuaXNTeW50YXhEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8zNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHRoaXMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCl9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzcsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKSB7XG4gICAgbGV0IGVuZl8zOCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzM5ID0gW107XG4gICAgd2hpbGUgKGVuZl8zOC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF8zOS5wdXNoKGVuZl8zOC5lbmZvcmVzdEV4cG9ydFNwZWNpZmllcigpKTtcbiAgICAgIGVuZl8zOC5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzM5KTtcbiAgfVxuICBlbmZvcmVzdEV4cG9ydFNwZWNpZmllcigpIHtcbiAgICBsZXQgbmFtZV80MCA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBleHBvcnRlZE5hbWUgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQwLCBleHBvcnRlZE5hbWU6IGV4cG9ydGVkTmFtZX0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRTcGVjaWZpZXJcIiwge25hbWU6IG51bGwsIGV4cG9ydGVkTmFtZTogbmFtZV80MH0pO1xuICB9XG4gIGVuZm9yZXN0SW1wb3J0RGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF80MSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBkZWZhdWx0QmluZGluZ180MiA9IG51bGw7XG4gICAgbGV0IG5hbWVkSW1wb3J0c180MyA9IExpc3QoKTtcbiAgICBsZXQgZm9yU3ludGF4XzQ0ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF80MSkpIHtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNDIsIG5hbWVkSW1wb3J0czogbmFtZWRJbXBvcnRzXzQzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzQxKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNDEpKSB7XG4gICAgICBkZWZhdWx0QmluZGluZ180MiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIsXCIpKSB7XG4gICAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBmb3JTeW50YXhfNDQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllciwgbmFtZWRJbXBvcnRzOiBMaXN0KCksIGZvclN5bnRheDogZm9yU3ludGF4XzQ0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgbG9va2FoZWFkXzQxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzQxKSkge1xuICAgICAgbGV0IGltcG9ydHMgPSB0aGlzLmVuZm9yZXN0TmFtZWRJbXBvcnRzKCk7XG4gICAgICBsZXQgZnJvbUNsYXVzZSA9IHRoaXMuZW5mb3Jlc3RGcm9tQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZm9yXCIpICYmIHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygxKSwgXCJzeW50YXhcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBmb3JTeW50YXhfNDQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0XCIsIHtkZWZhdWx0QmluZGluZzogZGVmYXVsdEJpbmRpbmdfNDIsIGZvclN5bnRheDogZm9yU3ludGF4XzQ0LCBuYW1lZEltcG9ydHM6IGltcG9ydHMsIG1vZHVsZVNwZWNpZmllcjogZnJvbUNsYXVzZX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzQxLCBcIipcIikpIHtcbiAgICAgIGxldCBuYW1lc3BhY2VCaW5kaW5nID0gdGhpcy5lbmZvcmVzdE5hbWVzcGFjZUJpbmRpbmcoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzQ0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydE5hbWVzcGFjZVwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzQyLCBmb3JTeW50YXg6IGZvclN5bnRheF80NCwgbmFtZXNwYWNlQmluZGluZzogbmFtZXNwYWNlQmluZGluZywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfNDEsIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCkge1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiKlwiKTtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgfVxuICBlbmZvcmVzdE5hbWVkSW1wb3J0cygpIHtcbiAgICBsZXQgZW5mXzQ1ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCByZXN1bHRfNDYgPSBbXTtcbiAgICB3aGlsZSAoZW5mXzQ1LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcmVzdWx0XzQ2LnB1c2goZW5mXzQ1LmVuZm9yZXN0SW1wb3J0U3BlY2lmaWVycygpKTtcbiAgICAgIGVuZl80NS5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3QocmVzdWx0XzQ2KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF80NyA9IHRoaXMucGVlaygpO1xuICAgIGxldCBuYW1lXzQ4O1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNDcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF80NykpIHtcbiAgICAgIG5hbWVfNDggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCksIFwiYXNcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzQ4fSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiYXNcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzQ3LCBcInVuZXhwZWN0ZWQgdG9rZW4gaW4gaW1wb3J0IHNwZWNpZmllclwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQ4LCBiaW5kaW5nOiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKX0pO1xuICB9XG4gIGVuZm9yZXN0RnJvbUNsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImZyb21cIik7XG4gICAgbGV0IGxvb2thaGVhZF80OSA9IHRoaXMubWF0Y2hTdHJpbmdMaXRlcmFsKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIGxvb2thaGVhZF80OTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJdGVtKCkge1xuICAgIGxldCBsb29rYWhlYWRfNTAgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81MCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzUxID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgdGhpcy5yZXN0ID0gdGhpcy5leHBhbmRNYWNybygpLmNvbmNhdCh0aGlzLnJlc3QpO1xuICAgICAgbG9va2FoZWFkXzUxID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJsb2NrU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1doaWxlVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2hpbGVTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzSWZUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RJZlN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGb3JUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3dpdGNoVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3dpdGNoU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyZWFrVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QnJlYWtTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29udGludWVUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNEb1RyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdERvU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RlYnVnZ2VyVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2l0aFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVHJ5VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VHJ5U3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rocm93VHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTEsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25EZWNsYXJhdGlvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF81MSkgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKDEpLCBcIjpcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFiZWxlZFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNMZXREZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTEpIHx8IHRoaXMuaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81MSkgfHwgdGhpcy5pc1N5bnRheERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzUxKSkpIHtcbiAgICAgIGxldCBzdG10ID0gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50XCIsIHtkZWNsYXJhdGlvbjogdGhpcy5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKX0pO1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmV0dXJuU3RtdFRyYW5zZm9ybShsb29rYWhlYWRfNTEpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFJldHVyblN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81MSwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkVtcHR5U3RhdGVtZW50XCIsIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uU3RhdGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCkge1xuICAgIGxldCBsYWJlbF81MiA9IHRoaXMubWF0Y2hJZGVudGlmaWVyKCk7XG4gICAgbGV0IHB1bmNfNTMgPSB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IHN0bXRfNTQgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGFiZWxlZFN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzUyLCBib2R5OiBzdG10XzU0fSk7XG4gIH1cbiAgZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImJyZWFrXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNTUgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfNTYgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfNTUsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJCcmVha1N0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzU2fSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNTUpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NSwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTUsIFwibGV0XCIpKSB7XG4gICAgICBsYWJlbF81NiA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNTZ9KTtcbiAgfVxuICBlbmZvcmVzdFRyeVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRyeVwiKTtcbiAgICBsZXQgYm9keV81NyA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJjYXRjaFwiKSkge1xuICAgICAgbGV0IGNhdGNoQ2xhdXNlID0gdGhpcy5lbmZvcmVzdENhdGNoQ2xhdXNlKCk7XG4gICAgICBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZmluYWxseVwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlGaW5hbGx5U3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzU3LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2UsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUcnlDYXRjaFN0YXRlbWVudFwiLCB7Ym9keTogYm9keV81NywgY2F0Y2hDbGF1c2U6IGNhdGNoQ2xhdXNlfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBmaW5hbGl6ZXIgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNTcsIGNhdGNoQ2xhdXNlOiBudWxsLCBmaW5hbGl6ZXI6IGZpbmFsaXplcn0pO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKHRoaXMucGVlaygpLCBcInRyeSB3aXRoIG5vIGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gIH1cbiAgZW5mb3Jlc3RDYXRjaENsYXVzZSgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImNhdGNoXCIpO1xuICAgIGxldCBiaW5kaW5nUGFyZW5zXzU4ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfNTkgPSBuZXcgRW5mb3Jlc3RlcihiaW5kaW5nUGFyZW5zXzU4LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGJpbmRpbmdfNjAgPSBlbmZfNTkuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgbGV0IGJvZHlfNjEgPSB0aGlzLmVuZm9yZXN0QmxvY2soKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYXRjaENsYXVzZVwiLCB7YmluZGluZzogYmluZGluZ182MCwgYm9keTogYm9keV82MX0pO1xuICB9XG4gIGVuZm9yZXN0VGhyb3dTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ0aHJvd1wiKTtcbiAgICBsZXQgZXhwcmVzc2lvbl82MiA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVGhyb3dTdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb25fNjJ9KTtcbiAgfVxuICBlbmZvcmVzdFdpdGhTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJ3aXRoXCIpO1xuICAgIGxldCBvYmpQYXJlbnNfNjMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl82NCA9IG5ldyBFbmZvcmVzdGVyKG9ialBhcmVuc182MywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBvYmplY3RfNjUgPSBlbmZfNjQuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfNjYgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2l0aFN0YXRlbWVudFwiLCB7b2JqZWN0OiBvYmplY3RfNjUsIGJvZHk6IGJvZHlfNjZ9KTtcbiAgfVxuICBlbmZvcmVzdERlYnVnZ2VyU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVidWdnZXJcIik7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGVidWdnZXJTdGF0ZW1lbnRcIiwge30pO1xuICB9XG4gIGVuZm9yZXN0RG9TdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkb1wiKTtcbiAgICBsZXQgYm9keV82NyA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCB0ZXN0Qm9keV82OCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzY5ID0gbmV3IEVuZm9yZXN0ZXIodGVzdEJvZHlfNjgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgdGVzdF83MCA9IGVuZl82OS5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEb1doaWxlU3RhdGVtZW50XCIsIHtib2R5OiBib2R5XzY3LCB0ZXN0OiB0ZXN0XzcwfSk7XG4gIH1cbiAgZW5mb3Jlc3RDb250aW51ZVN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dkXzcxID0gdGhpcy5tYXRjaEtleXdvcmQoXCJjb250aW51ZVwiKTtcbiAgICBsZXQgbG9va2FoZWFkXzcyID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IGxhYmVsXzczID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzcyLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29udGludWVTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF83M30pO1xuICAgIH1cbiAgICBpZiAodGhpcy5saW5lTnVtYmVyRXEoa3dkXzcxLCBsb29rYWhlYWRfNzIpICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfNzIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MiwgXCJ5aWVsZFwiKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNzIsIFwibGV0XCIpKSkge1xuICAgICAgbGFiZWxfNzMgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzczfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJzd2l0Y2hcIik7XG4gICAgbGV0IGNvbmRfNzQgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl83NSA9IG5ldyBFbmZvcmVzdGVyKGNvbmRfNzQsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZGlzY3JpbWluYW50Xzc2ID0gZW5mXzc1LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGxldCBib2R5Xzc3ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBpZiAoYm9keV83Ny5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzc2LCBjYXNlczogTGlzdCgpfSk7XG4gICAgfVxuICAgIGVuZl83NSA9IG5ldyBFbmZvcmVzdGVyKGJvZHlfNzcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY2FzZXNfNzggPSBlbmZfNzUuZW5mb3Jlc3RTd2l0Y2hDYXNlcygpO1xuICAgIGxldCBsb29rYWhlYWRfNzkgPSBlbmZfNzUucGVlaygpO1xuICAgIGlmIChlbmZfNzUuaXNLZXl3b3JkKGxvb2thaGVhZF83OSwgXCJkZWZhdWx0XCIpKSB7XG4gICAgICBsZXQgZGVmYXVsdENhc2UgPSBlbmZfNzUuZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCk7XG4gICAgICBsZXQgcG9zdERlZmF1bHRDYXNlcyA9IGVuZl83NS5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRXaXRoRGVmYXVsdFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfNzYsIHByZURlZmF1bHRDYXNlczogY2FzZXNfNzgsIGRlZmF1bHRDYXNlOiBkZWZhdWx0Q2FzZSwgcG9zdERlZmF1bHRDYXNlczogcG9zdERlZmF1bHRDYXNlc30pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hTdGF0ZW1lbnRcIiwge2Rpc2NyaW1pbmFudDogZGlzY3JpbWluYW50Xzc2LCBjYXNlczogY2FzZXNfNzh9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2VzKCkge1xuICAgIGxldCBjYXNlc184MCA9IFtdO1xuICAgIHdoaWxlICghKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImRlZmF1bHRcIikpKSB7XG4gICAgICBjYXNlc184MC5wdXNoKHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChjYXNlc184MCk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2FzZVwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hDYXNlXCIsIHt0ZXN0OiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpLCBjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKTtcbiAgfVxuICBlbmZvcmVzdFN0YXRlbWVudExpc3RJblN3aXRjaENhc2VCb2R5KCkge1xuICAgIGxldCByZXN1bHRfODEgPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhc2VcIikpKSB7XG4gICAgICByZXN1bHRfODEucHVzaCh0aGlzLmVuZm9yZXN0U3RhdGVtZW50TGlzdEl0ZW0oKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF84MSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hEZWZhdWx0KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZGVmYXVsdFwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTd2l0Y2hEZWZhdWx0XCIsIHtjb25zZXF1ZW50OiB0aGlzLmVuZm9yZXN0U3dpdGNoQ2FzZUJvZHkoKX0pO1xuICB9XG4gIGVuZm9yZXN0Rm9yU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiZm9yXCIpO1xuICAgIGxldCBjb25kXzgyID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfODMgPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzgyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF84NCwgdGVzdF84NSwgaW5pdF84NiwgcmlnaHRfODcsIHR5cGVfODgsIGxlZnRfODksIHVwZGF0ZV85MDtcbiAgICBpZiAoZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICBpZiAoIWVuZl84My5pc1B1bmN0dWF0b3IoZW5mXzgzLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIHRlc3RfODUgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgIGlmIChlbmZfODMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9yU3RhdGVtZW50XCIsIHtpbml0OiBudWxsLCB0ZXN0OiB0ZXN0Xzg1LCB1cGRhdGU6IHJpZ2h0Xzg3LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9va2FoZWFkXzg0ID0gZW5mXzgzLnBlZWsoKTtcbiAgICAgIGlmIChlbmZfODMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF84NCkgfHwgZW5mXzgzLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfODQpIHx8IGVuZl84My5pc0NvbnN0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfODQpKSB7XG4gICAgICAgIGluaXRfODYgPSBlbmZfODMuZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCk7XG4gICAgICAgIGxvb2thaGVhZF84NCA9IGVuZl84My5wZWVrKCk7XG4gICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfODQsIFwiaW5cIikgfHwgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzg0LCBcIm9mXCIpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF84NCwgXCJpblwiKSkge1xuICAgICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9ySW5TdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF84NCwgXCJvZlwiKSkge1xuICAgICAgICAgICAgZW5mXzgzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJpZ2h0Xzg3ID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV84OCA9IFwiRm9yT2ZTdGF0ZW1lbnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfODgsIHtsZWZ0OiBpbml0Xzg2LCByaWdodDogcmlnaHRfODcsIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGVuZl84My5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgICBpZiAoZW5mXzgzLmlzUHVuY3R1YXRvcihlbmZfODMucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgIHRlc3RfODUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3RfODUgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlXzkwID0gZW5mXzgzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGVuZl84My5wZWVrKDEpLCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGVuZl84My5wZWVrKDEpLCBcIm9mXCIpKSB7XG4gICAgICAgICAgbGVmdF84OSA9IGVuZl84My5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgICAgbGV0IGtpbmQgPSBlbmZfODMuYWR2YW5jZSgpO1xuICAgICAgICAgIGlmICh0aGlzLmlzS2V5d29yZChraW5kLCBcImluXCIpKSB7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0eXBlXzg4ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByaWdodF84NyA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV84OCwge2xlZnQ6IGxlZnRfODksIHJpZ2h0OiByaWdodF84NywgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5pdF84NiA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgZW5mXzgzLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfODMuaXNQdW5jdHVhdG9yKGVuZl84My5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgICAgIGVuZl84My5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF84NSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF84NSA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfODMubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfOTAgPSBlbmZfODMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IGluaXRfODYsIHRlc3Q6IHRlc3RfODUsIHVwZGF0ZTogdXBkYXRlXzkwLCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RJZlN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImlmXCIpO1xuICAgIGxldCBjb25kXzkxID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfOTIgPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzkxLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF85MyA9IGVuZl85Mi5wZWVrKCk7XG4gICAgbGV0IHRlc3RfOTQgPSBlbmZfOTIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfOTQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IGVuZl85Mi5jcmVhdGVFcnJvcihsb29rYWhlYWRfOTMsIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBjb25zZXF1ZW50Xzk1ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIGxldCBhbHRlcm5hdGVfOTYgPSBudWxsO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJlbHNlXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGFsdGVybmF0ZV85NiA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWZTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfOTQsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfOTUsIGFsdGVybmF0ZTogYWx0ZXJuYXRlXzk2fSk7XG4gIH1cbiAgZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCBjb25kXzk3ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfOTggPSBuZXcgRW5mb3Jlc3Rlcihjb25kXzk3LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF85OSA9IGVuZl85OC5wZWVrKCk7XG4gICAgbGV0IHRlc3RfMTAwID0gZW5mXzk4LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ZXN0XzEwMCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzk4LmNyZWF0ZUVycm9yKGxvb2thaGVhZF85OSwgXCJleHBlY3RpbmcgYW4gZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgbGV0IGJvZHlfMTAxID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIldoaWxlU3RhdGVtZW50XCIsIHt0ZXN0OiB0ZXN0XzEwMCwgYm9keTogYm9keV8xMDF9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrU3RhdGVtZW50KCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrU3RhdGVtZW50XCIsIHtibG9jazogdGhpcy5lbmZvcmVzdEJsb2NrKCl9KTtcbiAgfVxuICBlbmZvcmVzdEJsb2NrKCkge1xuICAgIGxldCBiXzEwMiA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGJvZHlfMTAzID0gW107XG4gICAgbGV0IGVuZl8xMDQgPSBuZXcgRW5mb3Jlc3RlcihiXzEwMiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTA0LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xMDQucGVlaygpO1xuICAgICAgbGV0IHN0bXQgPSBlbmZfMTA0LmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgICBpZiAoc3RtdCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IGVuZl8xMDQuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcIm5vdCBhIHN0YXRlbWVudFwiKTtcbiAgICAgIH1cbiAgICAgIGJvZHlfMTAzLnB1c2goc3RtdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkJsb2NrXCIsIHtzdGF0ZW1lbnRzOiBMaXN0KGJvZHlfMTAzKX0pO1xuICB9XG4gIGVuZm9yZXN0Q2xhc3Moe2lzRXhwciwgaW5EZWZhdWx0fSkge1xuICAgIGxldCBrd18xMDUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbmFtZV8xMDYgPSBudWxsLCBzdXByXzEwNyA9IG51bGw7XG4gICAgbGV0IHR5cGVfMTA4ID0gaXNFeHByID8gXCJDbGFzc0V4cHJlc3Npb25cIiA6IFwiQ2xhc3NEZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIG5hbWVfMTA2ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmICghaXNFeHByKSB7XG4gICAgICBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICAgIG5hbWVfMTA2ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiX2RlZmF1bHRcIiwga3dfMTA1KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcih0aGlzLnBlZWsoKSwgXCJ1bmV4cGVjdGVkIHN5bnRheFwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImV4dGVuZHNcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgc3Vwcl8xMDcgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICB9XG4gICAgbGV0IGVsZW1lbnRzXzEwOSA9IFtdO1xuICAgIGxldCBlbmZfMTEwID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTEwLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgaWYgKGVuZl8xMTAuaXNQdW5jdHVhdG9yKGVuZl8xMTAucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgZW5mXzExMC5hZHZhbmNlKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IGlzU3RhdGljID0gZmFsc2U7XG4gICAgICBsZXQge21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMTAuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCk7XG4gICAgICBpZiAoa2luZCA9PT0gXCJpZGVudGlmaWVyXCIgJiYgbWV0aG9kT3JLZXkudmFsdWUudmFsKCkgPT09IFwic3RhdGljXCIpIHtcbiAgICAgICAgaXNTdGF0aWMgPSB0cnVlO1xuICAgICAgICAoe21ldGhvZE9yS2V5LCBraW5kfSA9IGVuZl8xMTAuZW5mb3Jlc3RNZXRob2REZWZpbml0aW9uKCkpO1xuICAgICAgfVxuICAgICAgaWYgKGtpbmQgPT09IFwibWV0aG9kXCIpIHtcbiAgICAgICAgZWxlbWVudHNfMTA5LnB1c2gobmV3IFRlcm0oXCJDbGFzc0VsZW1lbnRcIiwge2lzU3RhdGljOiBpc1N0YXRpYywgbWV0aG9kOiBtZXRob2RPcktleX0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IoZW5mXzExMC5wZWVrKCksIFwiT25seSBtZXRob2RzIGFyZSBhbGxvd2VkIGluIGNsYXNzZXNcIik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwOCwge25hbWU6IG5hbWVfMTA2LCBzdXBlcjogc3Vwcl8xMDcsIGVsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEwOSl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdUYXJnZXQoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xMTEgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzExMSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExMSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTExKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUJpbmRpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzExMSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0QmluZGluZygpO1xuICAgIH1cbiAgICBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldFwiKTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEJpbmRpbmcoKSB7XG4gICAgbGV0IGVuZl8xMTIgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTEzID0gW107XG4gICAgd2hpbGUgKGVuZl8xMTIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBwcm9wZXJ0aWVzXzExMy5wdXNoKGVuZl8xMTIuZW5mb3Jlc3RCaW5kaW5nUHJvcGVydHkoKSk7XG4gICAgICBlbmZfMTEyLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiBMaXN0KHByb3BlcnRpZXNfMTEzKX0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkge1xuICAgIGxldCBsb29rYWhlYWRfMTE0ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHtuYW1lLCBiaW5kaW5nfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzExNCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExNCwgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzExNCwgXCJ5aWVsZFwiKSkge1xuICAgICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCI6XCIpKSB7XG4gICAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IGV4cHI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogYmluZGluZywgaW5pdDogZGVmYXVsdFZhbHVlfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBiaW5kaW5nID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IG5hbWUsIGJpbmRpbmc6IGJpbmRpbmd9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5QmluZGluZygpIHtcbiAgICBsZXQgYnJhY2tldF8xMTUgPSB0aGlzLm1hdGNoU3F1YXJlcygpO1xuICAgIGxldCBlbmZfMTE2ID0gbmV3IEVuZm9yZXN0ZXIoYnJhY2tldF8xMTUsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZWxlbWVudHNfMTE3ID0gW10sIHJlc3RFbGVtZW50XzExOCA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xMTYucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgZWw7XG4gICAgICBpZiAoZW5mXzExNi5pc1B1bmN0dWF0b3IoZW5mXzExNi5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTE2LmNvbnN1bWVDb21tYSgpO1xuICAgICAgICBlbCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZW5mXzExNi5pc1B1bmN0dWF0b3IoZW5mXzExNi5wZWVrKCksIFwiLi4uXCIpKSB7XG4gICAgICAgICAgZW5mXzExNi5hZHZhbmNlKCk7XG4gICAgICAgICAgcmVzdEVsZW1lbnRfMTE4ID0gZW5mXzExNi5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbCA9IGVuZl8xMTYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGVuZl8xMTYuY29uc3VtZUNvbW1hKCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50c18xMTcucHVzaChlbCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IExpc3QoZWxlbWVudHNfMTE3KSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50XzExOH0pO1xuICB9XG4gIGVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKSB7XG4gICAgbGV0IGJpbmRpbmdfMTE5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIGJpbmRpbmdfMTE5ID0gbmV3IFRlcm0oXCJCaW5kaW5nV2l0aERlZmF1bHRcIiwge2JpbmRpbmc6IGJpbmRpbmdfMTE5LCBpbml0OiBpbml0fSk7XG4gICAgfVxuICAgIHJldHVybiBiaW5kaW5nXzExOTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RJZGVudGlmaWVyKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTIwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMjApIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMjApKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEyMCwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBlbmZvcmVzdFJldHVyblN0YXRlbWVudCgpIHtcbiAgICBsZXQga3dfMTIxID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMjIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzEyMiAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dfMTIxLCBsb29rYWhlYWRfMTIyKSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiBudWxsfSk7XG4gICAgfVxuICAgIGxldCB0ZXJtXzEyMyA9IG51bGw7XG4gICAgaWYgKCF0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTIyLCBcIjtcIikpIHtcbiAgICAgIHRlcm1fMTIzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIGV4cGVjdCh0ZXJtXzEyMyAhPSBudWxsLCBcIkV4cGVjdGluZyBhbiBleHByZXNzaW9uIHRvIGZvbGxvdyByZXR1cm4ga2V5d29yZFwiLCBsb29rYWhlYWRfMTIyLCB0aGlzLnJlc3QpO1xuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJSZXR1cm5TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IHRlcm1fMTIzfSk7XG4gIH1cbiAgZW5mb3Jlc3RWYXJpYWJsZURlY2xhcmF0aW9uKCkge1xuICAgIGxldCBraW5kXzEyNDtcbiAgICBsZXQgbG9va2FoZWFkXzEyNSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBraW5kU3luXzEyNiA9IGxvb2thaGVhZF8xMjU7XG4gICAgaWYgKGtpbmRTeW5fMTI2ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI2LnJlc29sdmUoKSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjQgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjYgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjYucmVzb2x2ZSgpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xMjQgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xMjYgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xMjYucmVzb2x2ZSgpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzEyNCA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI2ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI2LnJlc29sdmUoKSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI0ID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTI2ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTI2LnJlc29sdmUoKSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTI0ID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG4gICAgbGV0IGRlY2xzXzEyNyA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKCk7XG4gICAgICBsZXQgbG9va2FoZWFkXzEyNSA9IHRoaXMucGVlaygpO1xuICAgICAgZGVjbHNfMTI3ID0gZGVjbHNfMTI3LmNvbmNhdCh0ZXJtKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTI1LCBcIixcIikpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdGlvblwiLCB7a2luZDoga2luZF8xMjQsIGRlY2xhcmF0b3JzOiBkZWNsc18xMjd9KTtcbiAgfVxuICBlbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRvcigpIHtcbiAgICBsZXQgaWRfMTI4ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBsZXQgbG9va2FoZWFkXzEyOSA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpbml0XzEzMCwgcmVzdF8xMzE7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMjksIFwiPVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBpbml0XzEzMCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdF8xMzAgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IGlkXzEyOCwgaW5pdDogaW5pdF8xMzB9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0XzEzMiA9IHRoaXMucmVzdC5nZXQoMCk7XG4gICAgbGV0IGV4cHJfMTMzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwcl8xMzMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3Ioc3RhcnRfMTMyLCBcIm5vdCBhIHZhbGlkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMTMzfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0XzEzNCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGxldCBsb29rYWhlYWRfMTM1ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzUsIFwiLFwiKSkge1xuICAgICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgbGVmdF8xMzQgPSBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTM0LCBvcGVyYXRvcjogb3BlcmF0b3IsIHJpZ2h0OiByaWdodH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHJldHVybiBsZWZ0XzEzNDtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtwcmVjOiAwLCBjb21iaW5lOiB4XzEzNiA9PiB4XzEzNiwgc3RhY2s6IExpc3QoKX07XG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzI3ICYmIHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfMjcpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9PUEVSQVRPUl8yNiB8fCB0ZXJtID09PSBFWFBSX0xPT1BfRVhQQU5TSU9OXzI4KSB7XG4gICAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRlcm0gPSB0ZXJtO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzNyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzEzNykpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICB0aGlzLnJlc3QgPSByZXN1bHQuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICByZXR1cm4gRVhQUl9MT09QX0VYUEFOU0lPTl8yODtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcInlpZWxkXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzcsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzcsIFwic3VwZXJcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiU3VwZXJcIiwge30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM3KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xMzcpKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiPT5cIikgJiYgdGhpcy5saW5lTnVtYmVyRXEobG9va2FoZWFkXzEzNywgdGhpcy5wZWVrKDEpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4VGVtcGxhdGUobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4UXVvdGVUcmFuc2Zvcm0obG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM3LCBcInRoaXNcIikpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRoaXNFeHByZXNzaW9uXCIsIHtzdHg6IHRoaXMuYWR2YW5jZSgpfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzcpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzcsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzcsIFwieWllbGRcIikpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIGxldCBudW0gPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmIChudW0udmFsKCkgPT09IDEgLyAwKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxJbmZpbml0eUV4cHJlc3Npb25cIiwge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbnVtfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBudWxsLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVsbExpdGVyYWwobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUmVndWxhckV4cHJlc3Npb24obG9va2FoZWFkXzEzNykpIHtcbiAgICAgIGxldCByZVN0eCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGxhc3RTbGFzaCA9IHJlU3R4LnRva2VuLnZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgIGxldCBwYXR0ZXJuID0gcmVTdHgudG9rZW4udmFsdWUuc2xpY2UoMSwgbGFzdFNsYXNoKTtcbiAgICAgIGxldCBmbGFncyA9IHJlU3R4LnRva2VuLnZhbHVlLnNsaWNlKGxhc3RTbGFzaCArIDEpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbFJlZ0V4cEV4cHJlc3Npb25cIiwge3BhdHRlcm46IHBhdHRlcm4sIGZsYWdzOiBmbGFnc30pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIsIHtpbm5lcjogdGhpcy5hZHZhbmNlKCkuaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNlcyhsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVXBkYXRlT3BlcmF0b3IobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEzNywgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFN0YXRpY01lbWJlckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEzNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMTM3KSkge1xuICAgICAgbGV0IHBhcmVuID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiB0aGlzLnRlcm0sIGFyZ3VtZW50czogcGFyZW4uaW5uZXIoKX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTM3KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVGVtcGxhdGVFeHByZXNzaW9uXCIsIHt0YWc6IHRoaXMudGVybSwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzQXNzaWduKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICBsZXQgYmluZGluZyA9IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0aGlzLnRlcm0pO1xuICAgICAgbGV0IG9wID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgaW5pdCA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICAgIGlmIChvcC52YWwoKSA9PT0gXCI9XCIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IGJpbmRpbmcsIGV4cHJlc3Npb246IGluaXR9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkNvbXBvdW5kQXNzaWdubWVudEV4cHJlc3Npb25cIiwge2JpbmRpbmc6IGJpbmRpbmcsIG9wZXJhdG9yOiBvcC52YWwoKSwgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzcsIFwiP1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDb25kaXRpb25hbEV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9OT19DSEFOR0VfMjc7XG4gIH1cbiAgZW5mb3Jlc3RBcmd1bWVudExpc3QoKSB7XG4gICAgbGV0IHJlc3VsdF8xMzggPSBbXTtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgYXJnO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgYXJnID0gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJnID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLFwiKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdF8xMzgucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMTM4KTtcbiAgfVxuICBlbmZvcmVzdE5ld0V4cHJlc3Npb24oKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJuZXdcIik7XG4gICAgbGV0IGNhbGxlZV8xMzk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcIm5ld1wiKSkge1xuICAgICAgY2FsbGVlXzEzOSA9IHRoaXMuZW5mb3Jlc3ROZXdFeHByZXNzaW9uKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJzdXBlclwiKSkge1xuICAgICAgY2FsbGVlXzEzOSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLlwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwidGFyZ2V0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3VGFyZ2V0RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxlZV8xMzkgPSBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpfSk7XG4gICAgfVxuICAgIGxldCBhcmdzXzE0MDtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGFyZ3NfMTQwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzXzE0MCA9IExpc3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTmV3RXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBjYWxsZWVfMTM5LCBhcmd1bWVudHM6IGFyZ3NfMTQwfSk7XG4gIH1cbiAgZW5mb3Jlc3RDb21wdXRlZE1lbWJlckV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNDEgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHRoaXMudGVybSwgZXhwcmVzc2lvbjogZW5mXzE0MS5lbmZvcmVzdEV4cHJlc3Npb24oKX0pO1xuICB9XG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDIpIHtcbiAgICBzd2l0Y2ggKHRlcm1fMTQyLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDIubmFtZX0pO1xuICAgICAgY2FzZSBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCI6XG4gICAgICAgIGlmICh0ZXJtXzE0Mi5pbm5lci5zaXplID09PSAxICYmIHRoaXMuaXNJZGVudGlmaWVyKHRlcm1fMTQyLmlubmVyLmdldCgwKSkpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDIuaW5uZXIuZ2V0KDApfSk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgXCJEYXRhUHJvcGVydHlcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge25hbWU6IHRlcm1fMTQyLm5hbWUsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTQyLmV4cHJlc3Npb24pfSk7XG4gICAgICBjYXNlIFwiU2hvcnRoYW5kUHJvcGVydHlcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNDIubmFtZX0pLCBpbml0OiBudWxsfSk7XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiB0ZXJtXzE0Mi5wcm9wZXJ0aWVzLm1hcCh0XzE0MyA9PiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodF8xNDMpKX0pO1xuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICBsZXQgbGFzdCA9IHRlcm1fMTQyLmVsZW1lbnRzLmxhc3QoKTtcbiAgICAgICAgaWYgKGxhc3QgIT0gbnVsbCAmJiBsYXN0LnR5cGUgPT09IFwiU3ByZWFkRWxlbWVudFwiKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNDIuZWxlbWVudHMuc2xpY2UoMCwgLTEpLm1hcCh0XzE0NCA9PiB0XzE0NCAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0XzE0NCkpLCByZXN0RWxlbWVudDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQobGFzdC5leHByZXNzaW9uKX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTQyLmVsZW1lbnRzLm1hcCh0XzE0NSA9PiB0XzE0NSAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0XzE0NSkpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IHRlcm1fMTQyLmVsZW1lbnRzLm1hcCh0XzE0NiA9PiB0XzE0NiAmJiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodF8xNDYpKSwgcmVzdEVsZW1lbnQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IHRlcm1fMTQyLnZhbHVlfSk7XG4gICAgICBjYXNlIFwiQ29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgY2FzZSBcIkFycmF5QmluZGluZ1wiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiOlxuICAgICAgY2FzZSBcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1dpdGhEZWZhdWx0XCI6XG4gICAgICBjYXNlIFwiT2JqZWN0QmluZGluZ1wiOlxuICAgICAgICByZXR1cm4gdGVybV8xNDI7XG4gICAgfVxuICAgIGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvciBcIiArIHRlcm1fMTQyLnR5cGUpO1xuICB9XG4gIHRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdCh0ZXJtXzE0Nykge1xuICAgIHN3aXRjaCAodGVybV8xNDcudHlwZSkge1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdXaXRoRGVmYXVsdFwiLCB7YmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRlcm1fMTQ3LmJpbmRpbmcpLCBpbml0OiB0ZXJtXzE0Ny5leHByZXNzaW9ufSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNDcpO1xuICB9XG4gIGVuZm9yZXN0QXJyb3dFeHByZXNzaW9uKCkge1xuICAgIGxldCBlbmZfMTQ4O1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGVuZl8xNDggPSBuZXcgRW5mb3Jlc3RlcihMaXN0Lm9mKHRoaXMuYWR2YW5jZSgpKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcCA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGVuZl8xNDggPSBuZXcgRW5mb3Jlc3RlcihwLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfVxuICAgIGxldCBwYXJhbXNfMTQ5ID0gZW5mXzE0OC5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj0+XCIpO1xuICAgIGxldCBib2R5XzE1MDtcbiAgICBpZiAodGhpcy5pc0JyYWNlcyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGJvZHlfMTUwID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5mXzE0OCA9IG5ldyBFbmZvcmVzdGVyKHRoaXMucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgYm9keV8xNTAgPSBlbmZfMTQ4LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZl8xNDgucmVzdDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyb3dFeHByZXNzaW9uXCIsIHtwYXJhbXM6IHBhcmFtc18xNDksIGJvZHk6IGJvZHlfMTUwfSk7XG4gIH1cbiAgZW5mb3Jlc3RZaWVsZEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGt3ZF8xNTEgPSB0aGlzLm1hdGNoS2V5d29yZChcInlpZWxkXCIpO1xuICAgIGxldCBsb29rYWhlYWRfMTUyID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNTIgJiYgIXRoaXMubGluZU51bWJlckVxKGt3ZF8xNTEsIGxvb2thaGVhZF8xNTIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJZaWVsZEV4cHJlc3Npb25cIiwge2V4cHJlc3Npb246IG51bGx9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiKlwiKSkge1xuICAgICAgICBpc0dlbmVyYXRvciA9IHRydWU7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgfVxuICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgbGV0IHR5cGUgPSBpc0dlbmVyYXRvciA/IFwiWWllbGRHZW5lcmF0b3JFeHByZXNzaW9uXCIgOiBcIllpZWxkRXhwcmVzc2lvblwiO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKHR5cGUsIHtleHByZXNzaW9uOiBleHByfSk7XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4VGVtcGxhdGVcIiwge3RlbXBsYXRlOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3ludGF4UXVvdGUoKSB7XG4gICAgbGV0IG5hbWVfMTUzID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3ludGF4UXVvdGVcIiwge25hbWU6IG5hbWVfMTUzLCB0ZW1wbGF0ZTogbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8xNTN9KSwgZWxlbWVudHM6IHRoaXMuZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCl9KX0pO1xuICB9XG4gIGVuZm9yZXN0U3RhdGljTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb2JqZWN0XzE1NCA9IHRoaXMudGVybTtcbiAgICBsZXQgZG90XzE1NSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBwcm9wZXJ0eV8xNTYgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IG9iamVjdF8xNTQsIHByb3BlcnR5OiBwcm9wZXJ0eV8xNTZ9KTtcbiAgfVxuICBlbmZvcmVzdEFycmF5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgYXJyXzE1NyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBlbGVtZW50c18xNTggPSBbXTtcbiAgICBsZXQgZW5mXzE1OSA9IG5ldyBFbmZvcmVzdGVyKGFycl8xNTcuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIHdoaWxlIChlbmZfMTU5LnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSBlbmZfMTU5LnBlZWsoKTtcbiAgICAgIGlmIChlbmZfMTU5LmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLFwiKSkge1xuICAgICAgICBlbmZfMTU5LmFkdmFuY2UoKTtcbiAgICAgICAgZWxlbWVudHNfMTU4LnB1c2gobnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKGVuZl8xNTkuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIuLi5cIikpIHtcbiAgICAgICAgZW5mXzE1OS5hZHZhbmNlKCk7XG4gICAgICAgIGxldCBleHByZXNzaW9uID0gZW5mXzE1OS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmIChleHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTU5LmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RpbmcgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNTgucHVzaChuZXcgVGVybShcIlNwcmVhZEVsZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJlc3Npb259KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgdGVybSA9IGVuZl8xNTkuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICBpZiAodGVybSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgZW5mXzE1OS5jcmVhdGVFcnJvcihsb29rYWhlYWQsIFwiZXhwZWN0ZWQgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50c18xNTgucHVzaCh0ZXJtKTtcbiAgICAgICAgZW5mXzE1OS5jb25zdW1lQ29tbWEoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogTGlzdChlbGVtZW50c18xNTgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmpfMTYwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnRpZXNfMTYxID0gTGlzdCgpO1xuICAgIGxldCBlbmZfMTYyID0gbmV3IEVuZm9yZXN0ZXIob2JqXzE2MC5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxhc3RQcm9wXzE2MyA9IG51bGw7XG4gICAgd2hpbGUgKGVuZl8xNjIucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IHByb3AgPSBlbmZfMTYyLmVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCk7XG4gICAgICBlbmZfMTYyLmNvbnN1bWVDb21tYSgpO1xuICAgICAgcHJvcGVydGllc18xNjEgPSBwcm9wZXJ0aWVzXzE2MS5jb25jYXQocHJvcCk7XG4gICAgICBpZiAobGFzdFByb3BfMTYzID09PSBwcm9wKSB7XG4gICAgICAgIHRocm93IGVuZl8xNjIuY3JlYXRlRXJyb3IocHJvcCwgXCJpbnZhbGlkIHN5bnRheCBpbiBvYmplY3RcIik7XG4gICAgICB9XG4gICAgICBsYXN0UHJvcF8xNjMgPSBwcm9wO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzXzE2MX0pO1xuICB9XG4gIGVuZm9yZXN0UHJvcGVydHlEZWZpbml0aW9uKCkge1xuICAgIGxldCB7bWV0aG9kT3JLZXksIGtpbmR9ID0gdGhpcy5lbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKTtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgXCJtZXRob2RcIjpcbiAgICAgICAgcmV0dXJuIG1ldGhvZE9yS2V5O1xuICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGluaXQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtpbml0OiBpbml0LCBiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcobWV0aG9kT3JLZXkpfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIjpcIikpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJTaG9ydGhhbmRQcm9wZXJ0eVwiLCB7bmFtZTogbWV0aG9kT3JLZXkudmFsdWV9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgbGV0IGV4cHJfMTY0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRGF0YVByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleSwgZXhwcmVzc2lvbjogZXhwcl8xNjR9KTtcbiAgfVxuICBlbmZvcmVzdE1ldGhvZERlZmluaXRpb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNjUgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMTY2ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNjUsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTY2ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NSwgXCJnZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgYm9keSA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuZXcgVGVybShcIkdldHRlclwiLCB7bmFtZTogbmFtZSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNjUsIFwic2V0XCIpICYmIHRoaXMuaXNQcm9wZXJ0eU5hbWUodGhpcy5wZWVrKDEpKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQge25hbWV9ID0gdGhpcy5lbmZvcmVzdFByb3BlcnR5TmFtZSgpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHRoaXMubWF0Y2hQYXJlbnMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IHBhcmFtID0gZW5mLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiU2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBwYXJhbTogcGFyYW0sIGJvZHk6IGJvZHl9KSwga2luZDogXCJtZXRob2RcIn07XG4gICAgfVxuICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNQYXJlbnModGhpcy5wZWVrKCkpKSB7XG4gICAgICBsZXQgcGFyYW1zID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtcywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgbGV0IGZvcm1hbFBhcmFtcyA9IGVuZi5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiTWV0aG9kXCIsIHtpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTY2LCBuYW1lOiBuYW1lLCBwYXJhbXM6IGZvcm1hbFBhcmFtcywgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgcmV0dXJuIHttZXRob2RPcktleTogbmFtZSwga2luZDogdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE2NSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE2NSkgPyBcImlkZW50aWZpZXJcIiA6IFwicHJvcGVydHlcIn07XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8xNjcgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzE2NykgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xNjcpKSB7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KSwgYmluZGluZzogbnVsbH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzE2NykpIHtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcih0aGlzLm1hdGNoU3F1YXJlcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZXhwciA9IGVuZi5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICByZXR1cm4ge25hbWU6IG5ldyBUZXJtKFwiQ29tcHV0ZWRQcm9wZXJ0eU5hbWVcIiwge2V4cHJlc3Npb246IGV4cHJ9KSwgYmluZGluZzogbnVsbH07XG4gICAgfVxuICAgIGxldCBuYW1lXzE2OCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiBuYW1lXzE2OH0pLCBiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lXzE2OH0pfTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uKHtpc0V4cHIsIGluRGVmYXVsdCwgYWxsb3dHZW5lcmF0b3J9KSB7XG4gICAgbGV0IG5hbWVfMTY5ID0gbnVsbCwgcGFyYW1zXzE3MCwgYm9keV8xNzEsIHJlc3RfMTcyO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xNzMgPSBmYWxzZTtcbiAgICBsZXQgZm5LZXl3b3JkXzE3NCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTc1ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IHR5cGVfMTc2ID0gaXNFeHByID8gXCJGdW5jdGlvbkV4cHJlc3Npb25cIiA6IFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTc1LCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE3MyA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxvb2thaGVhZF8xNzUgPSB0aGlzLnBlZWsoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNzUpKSB7XG4gICAgICBuYW1lXzE2OSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoaW5EZWZhdWx0KSB7XG4gICAgICBuYW1lXzE2OSA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIipkZWZhdWx0KlwiLCBmbktleXdvcmRfMTc0KX0pO1xuICAgIH1cbiAgICBwYXJhbXNfMTcwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTcxID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE3NyA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xNzAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE3OCA9IGVuZl8xNzcuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKHR5cGVfMTc2LCB7bmFtZTogbmFtZV8xNjksIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xNzMsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE3OCwgYm9keTogYm9keV8xNzF9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbmFtZV8xNzkgPSBudWxsLCBwYXJhbXNfMTgwLCBib2R5XzE4MSwgcmVzdF8xODI7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzE4MyA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTg0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xODQsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMTgzID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzE4NCA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzE4NCkpIHtcbiAgICAgIG5hbWVfMTc5ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHBhcmFtc18xODAgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xODEgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMTg1ID0gbmV3IEVuZm9yZXN0ZXIocGFyYW1zXzE4MCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMTg2ID0gZW5mXzE4NS5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkV4cHJlc3Npb25cIiwge25hbWU6IG5hbWVfMTc5LCBpc0dlbmVyYXRvcjogaXNHZW5lcmF0b3JfMTgzLCBwYXJhbXM6IGZvcm1hbFBhcmFtc18xODYsIGJvZHk6IGJvZHlfMTgxfSk7XG4gIH1cbiAgZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCkge1xuICAgIGxldCBuYW1lXzE4NywgcGFyYW1zXzE4OCwgYm9keV8xODksIHJlc3RfMTkwO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xOTEgPSBmYWxzZTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbG9va2FoZWFkXzE5MiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMTkyLCBcIipcIikpIHtcbiAgICAgIGlzR2VuZXJhdG9yXzE5MSA9IHRydWU7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgbmFtZV8xODcgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICBwYXJhbXNfMTg4ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGJvZHlfMTg5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICBsZXQgZW5mXzE5MyA9IG5ldyBFbmZvcmVzdGVyKHBhcmFtc18xODgsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgZm9ybWFsUGFyYW1zXzE5NCA9IGVuZl8xOTMuZW5mb3Jlc3RGb3JtYWxQYXJhbWV0ZXJzKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25EZWNsYXJhdGlvblwiLCB7bmFtZTogbmFtZV8xODcsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xOTEsIHBhcmFtczogZm9ybWFsUGFyYW1zXzE5NCwgYm9keTogYm9keV8xODl9KTtcbiAgfVxuICBlbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKSB7XG4gICAgbGV0IGl0ZW1zXzE5NSA9IFtdO1xuICAgIGxldCByZXN0XzE5NiA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICBsZXQgbG9va2FoZWFkID0gdGhpcy5wZWVrKCk7XG4gICAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIi4uLlwiKTtcbiAgICAgICAgcmVzdF8xOTYgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpdGVtc18xOTUucHVzaCh0aGlzLmVuZm9yZXN0UGFyYW0oKSk7XG4gICAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogTGlzdChpdGVtc18xOTUpLCByZXN0OiByZXN0XzE5Nn0pO1xuICB9XG4gIGVuZm9yZXN0UGFyYW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICB9XG4gIGVuZm9yZXN0VXBkYXRlRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMTk3ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJVcGRhdGVFeHByZXNzaW9uXCIsIHtpc1ByZWZpeDogZmFsc2UsIG9wZXJhdG9yOiBvcGVyYXRvcl8xOTcudmFsKCksIG9wZXJhbmQ6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0aGlzLnRlcm0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9wZXJhdG9yXzE5OCA9IHRoaXMubWF0Y2hVbmFyeU9wZXJhdG9yKCk7XG4gICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICB0aGlzLm9wQ3R4LnByZWMgPSAxNDtcbiAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMTk5ID0+IHtcbiAgICAgIGxldCB0eXBlXzIwMCwgdGVybV8yMDEsIGlzUHJlZml4XzIwMjtcbiAgICAgIGlmIChvcGVyYXRvcl8xOTgudmFsKCkgPT09IFwiKytcIiB8fCBvcGVyYXRvcl8xOTgudmFsKCkgPT09IFwiLS1cIikge1xuICAgICAgICB0eXBlXzIwMCA9IFwiVXBkYXRlRXhwcmVzc2lvblwiO1xuICAgICAgICB0ZXJtXzIwMSA9IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhyaWdodFRlcm1fMTk5KTtcbiAgICAgICAgaXNQcmVmaXhfMjAyID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGVfMjAwID0gXCJVbmFyeUV4cHJlc3Npb25cIjtcbiAgICAgICAgaXNQcmVmaXhfMjAyID0gdW5kZWZpbmVkO1xuICAgICAgICB0ZXJtXzIwMSA9IHJpZ2h0VGVybV8xOTk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8yMDAsIHtvcGVyYXRvcjogb3BlcmF0b3JfMTk4LnZhbCgpLCBvcGVyYW5kOiB0ZXJtXzIwMSwgaXNQcmVmaXg6IGlzUHJlZml4XzIwMn0pO1xuICAgIH07XG4gICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl8yNjtcbiAgfVxuICBlbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgdGVzdF8yMDMgPSB0aGlzLm9wQ3R4LmNvbWJpbmUodGhpcy50ZXJtKTtcbiAgICBpZiAodGhpcy5vcEN0eC5zdGFjay5zaXplID4gMCkge1xuICAgICAgbGV0IHtwcmVjLCBjb21iaW5lfSA9IHRoaXMub3BDdHguc3RhY2subGFzdCgpO1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBwcmVjO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICB9XG4gICAgdGhpcy5tYXRjaFB1bmN0dWF0b3IoXCI/XCIpO1xuICAgIGxldCBlbmZfMjA0ID0gbmV3IEVuZm9yZXN0ZXIodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGNvbnNlcXVlbnRfMjA1ID0gZW5mXzIwNC5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgZW5mXzIwNC5tYXRjaFB1bmN0dWF0b3IoXCI6XCIpO1xuICAgIGVuZl8yMDQgPSBuZXcgRW5mb3Jlc3RlcihlbmZfMjA0LnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYWx0ZXJuYXRlXzIwNiA9IGVuZl8yMDQuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIHRoaXMucmVzdCA9IGVuZl8yMDQucmVzdDtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIiwge3Rlc3Q6IHRlc3RfMjAzLCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzIwNSwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfMjA2fSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0VGVybV8yMDcgPSB0aGlzLnRlcm07XG4gICAgbGV0IG9wU3R4XzIwOCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBvcF8yMDkgPSBvcFN0eF8yMDgudmFsKCk7XG4gICAgbGV0IG9wUHJlY18yMTAgPSBnZXRPcGVyYXRvclByZWMob3BfMjA5KTtcbiAgICBsZXQgb3BBc3NvY18yMTEgPSBnZXRPcGVyYXRvckFzc29jKG9wXzIwOSk7XG4gICAgaWYgKG9wZXJhdG9yTHQodGhpcy5vcEN0eC5wcmVjLCBvcFByZWNfMjEwLCBvcEFzc29jXzIxMSkpIHtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnB1c2goe3ByZWM6IHRoaXMub3BDdHgucHJlYywgY29tYmluZTogdGhpcy5vcEN0eC5jb21iaW5lfSk7XG4gICAgICB0aGlzLm9wQ3R4LnByZWMgPSBvcFByZWNfMjEwO1xuICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gcmlnaHRUZXJtXzIxMiA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRUZXJtXzIwNywgb3BlcmF0b3I6IG9wU3R4XzIwOCwgcmlnaHQ6IHJpZ2h0VGVybV8yMTJ9KTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBFWFBSX0xPT1BfT1BFUkFUT1JfMjY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB0ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKGxlZnRUZXJtXzIwNyk7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgICAgcmV0dXJuIHRlcm07XG4gICAgfVxuICB9XG4gIGVuZm9yZXN0VGVtcGxhdGVFbGVtZW50cygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzIxMyA9IHRoaXMubWF0Y2hUZW1wbGF0ZSgpO1xuICAgIGxldCBlbGVtZW50c18yMTQgPSBsb29rYWhlYWRfMjEzLnRva2VuLml0ZW1zLm1hcChpdF8yMTUgPT4ge1xuICAgICAgaWYgKGl0XzIxNSBpbnN0YW5jZW9mIFN5bnRheCAmJiBpdF8yMTUuaXNEZWxpbWl0ZXIoKSkge1xuICAgICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXIoaXRfMjE1LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUVsZW1lbnRcIiwge3Jhd1ZhbHVlOiBpdF8yMTUuc2xpY2UudGV4dH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBlbGVtZW50c18yMTQ7XG4gIH1cbiAgZXhwYW5kTWFjcm8oZW5mb3Jlc3RUeXBlXzIxNikge1xuICAgIGxldCBuYW1lXzIxNyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBzeW50YXhUcmFuc2Zvcm1fMjE4ID0gdGhpcy5nZXRDb21waWxldGltZVRyYW5zZm9ybShuYW1lXzIxNyk7XG4gICAgaWYgKHN5bnRheFRyYW5zZm9ybV8yMTggPT0gbnVsbCB8fCB0eXBlb2Ygc3ludGF4VHJhbnNmb3JtXzIxOC52YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWVfMjE3LCBcInRoZSBtYWNybyBuYW1lIHdhcyBub3QgYm91bmQgdG8gYSB2YWx1ZSB0aGF0IGNvdWxkIGJlIGludm9rZWRcIik7XG4gICAgfVxuICAgIGxldCB1c2VTaXRlU2NvcGVfMjE5ID0gZnJlc2hTY29wZShcInVcIik7XG4gICAgbGV0IGludHJvZHVjZWRTY29wZV8yMjAgPSBmcmVzaFNjb3BlKFwiaVwiKTtcbiAgICB0aGlzLmNvbnRleHQudXNlU2NvcGUgPSB1c2VTaXRlU2NvcGVfMjE5O1xuICAgIGxldCBjdHhfMjIxID0gbmV3IE1hY3JvQ29udGV4dCh0aGlzLCBuYW1lXzIxNywgdGhpcy5jb250ZXh0LCB1c2VTaXRlU2NvcGVfMjE5LCBpbnRyb2R1Y2VkU2NvcGVfMjIwKTtcbiAgICBsZXQgcmVzdWx0XzIyMiA9IHNhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXMoc3ludGF4VHJhbnNmb3JtXzIxOC52YWx1ZS5jYWxsKG51bGwsIGN0eF8yMjEpKTtcbiAgICBpZiAoIUxpc3QuaXNMaXN0KHJlc3VsdF8yMjIpKSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKG5hbWVfMjE3LCBcIm1hY3JvIG11c3QgcmV0dXJuIGEgbGlzdCBidXQgZ290OiBcIiArIHJlc3VsdF8yMjIpO1xuICAgIH1cbiAgICByZXN1bHRfMjIyID0gcmVzdWx0XzIyMi5tYXAoc3R4XzIyMyA9PiB7XG4gICAgICBpZiAoIShzdHhfMjIzICYmIHR5cGVvZiBzdHhfMjIzLmFkZFNjb3BlID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZV8yMTcsIFwibWFjcm8gbXVzdCByZXR1cm4gc3ludGF4IG9iamVjdHMgb3IgdGVybXMgYnV0IGdvdDogXCIgKyBzdHhfMjIzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHhfMjIzLmFkZFNjb3BlKGludHJvZHVjZWRTY29wZV8yMjAsIHRoaXMuY29udGV4dC5iaW5kaW5ncywge2ZsaXA6IHRydWV9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0XzIyMjtcbiAgfVxuICBjb25zdW1lU2VtaWNvbG9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjI0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMjQgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIyNCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgY29uc3VtZUNvbW1hKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjI1ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKGxvb2thaGVhZF8yMjUgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIyNSwgXCIsXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gIH1cbiAgaXNUZXJtKHRlcm1fMjI2KSB7XG4gICAgcmV0dXJuIHRlcm1fMjI2ICYmIHRlcm1fMjI2IGluc3RhbmNlb2YgVGVybTtcbiAgfVxuICBpc0VPRih0ZXJtXzIyNykge1xuICAgIHJldHVybiB0ZXJtXzIyNyAmJiB0ZXJtXzIyNyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIyNy5pc0VPRigpO1xuICB9XG4gIGlzSWRlbnRpZmllcih0ZXJtXzIyOCwgdmFsXzIyOSA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yMjggJiYgdGVybV8yMjggaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMjguaXNJZGVudGlmaWVyKCkgJiYgKHZhbF8yMjkgPT09IG51bGwgfHwgdGVybV8yMjgudmFsKCkgPT09IHZhbF8yMjkpO1xuICB9XG4gIGlzUHJvcGVydHlOYW1lKHRlcm1fMjMwKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGlmaWVyKHRlcm1fMjMwKSB8fCB0aGlzLmlzS2V5d29yZCh0ZXJtXzIzMCkgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKHRlcm1fMjMwKSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbCh0ZXJtXzIzMCkgfHwgdGhpcy5pc0JyYWNrZXRzKHRlcm1fMjMwKTtcbiAgfVxuICBpc051bWVyaWNMaXRlcmFsKHRlcm1fMjMxKSB7XG4gICAgcmV0dXJuIHRlcm1fMjMxICYmIHRlcm1fMjMxIGluc3RhbmNlb2YgU3ludGF4ICYmIHRlcm1fMjMxLmlzTnVtZXJpY0xpdGVyYWwoKTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwodGVybV8yMzIpIHtcbiAgICByZXR1cm4gdGVybV8yMzIgJiYgdGVybV8yMzIgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzIuaXNTdHJpbmdMaXRlcmFsKCk7XG4gIH1cbiAgaXNUZW1wbGF0ZSh0ZXJtXzIzMykge1xuICAgIHJldHVybiB0ZXJtXzIzMyAmJiB0ZXJtXzIzMyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzMy5pc1RlbXBsYXRlKCk7XG4gIH1cbiAgaXNCb29sZWFuTGl0ZXJhbCh0ZXJtXzIzNCkge1xuICAgIHJldHVybiB0ZXJtXzIzNCAmJiB0ZXJtXzIzNCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNC5pc0Jvb2xlYW5MaXRlcmFsKCk7XG4gIH1cbiAgaXNOdWxsTGl0ZXJhbCh0ZXJtXzIzNSkge1xuICAgIHJldHVybiB0ZXJtXzIzNSAmJiB0ZXJtXzIzNSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNS5pc051bGxMaXRlcmFsKCk7XG4gIH1cbiAgaXNSZWd1bGFyRXhwcmVzc2lvbih0ZXJtXzIzNikge1xuICAgIHJldHVybiB0ZXJtXzIzNiAmJiB0ZXJtXzIzNiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzNi5pc1JlZ3VsYXJFeHByZXNzaW9uKCk7XG4gIH1cbiAgaXNQYXJlbnModGVybV8yMzcpIHtcbiAgICByZXR1cm4gdGVybV8yMzcgJiYgdGVybV8yMzcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzcuaXNQYXJlbnMoKTtcbiAgfVxuICBpc0JyYWNlcyh0ZXJtXzIzOCkge1xuICAgIHJldHVybiB0ZXJtXzIzOCAmJiB0ZXJtXzIzOCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzIzOC5pc0JyYWNlcygpO1xuICB9XG4gIGlzQnJhY2tldHModGVybV8yMzkpIHtcbiAgICByZXR1cm4gdGVybV8yMzkgJiYgdGVybV8yMzkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yMzkuaXNCcmFja2V0cygpO1xuICB9XG4gIGlzQXNzaWduKHRlcm1fMjQwKSB7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRlcm1fMjQwKSkge1xuICAgICAgc3dpdGNoICh0ZXJtXzI0MC52YWwoKSkge1xuICAgICAgICBjYXNlIFwiPVwiOlxuICAgICAgICBjYXNlIFwifD1cIjpcbiAgICAgICAgY2FzZSBcIl49XCI6XG4gICAgICAgIGNhc2UgXCImPVwiOlxuICAgICAgICBjYXNlIFwiPDw9XCI6XG4gICAgICAgIGNhc2UgXCI+Pj1cIjpcbiAgICAgICAgY2FzZSBcIj4+Pj1cIjpcbiAgICAgICAgY2FzZSBcIis9XCI6XG4gICAgICAgIGNhc2UgXCItPVwiOlxuICAgICAgICBjYXNlIFwiKj1cIjpcbiAgICAgICAgY2FzZSBcIi89XCI6XG4gICAgICAgIGNhc2UgXCIlPVwiOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlzS2V5d29yZCh0ZXJtXzI0MSwgdmFsXzI0MiA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yNDEgJiYgdGVybV8yNDEgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDEuaXNLZXl3b3JkKCkgJiYgKHZhbF8yNDIgPT09IG51bGwgfHwgdGVybV8yNDEudmFsKCkgPT09IHZhbF8yNDIpO1xuICB9XG4gIGlzUHVuY3R1YXRvcih0ZXJtXzI0MywgdmFsXzI0NCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGVybV8yNDMgJiYgdGVybV8yNDMgaW5zdGFuY2VvZiBTeW50YXggJiYgdGVybV8yNDMuaXNQdW5jdHVhdG9yKCkgJiYgKHZhbF8yNDQgPT09IG51bGwgfHwgdGVybV8yNDMudmFsKCkgPT09IHZhbF8yNDQpO1xuICB9XG4gIGlzT3BlcmF0b3IodGVybV8yNDUpIHtcbiAgICByZXR1cm4gdGVybV8yNDUgJiYgdGVybV8yNDUgaW5zdGFuY2VvZiBTeW50YXggJiYgaXNPcGVyYXRvcih0ZXJtXzI0NSk7XG4gIH1cbiAgaXNVcGRhdGVPcGVyYXRvcih0ZXJtXzI0Nikge1xuICAgIHJldHVybiB0ZXJtXzI0NiAmJiB0ZXJtXzI0NiBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI0Ni5pc1B1bmN0dWF0b3IoKSAmJiAodGVybV8yNDYudmFsKCkgPT09IFwiKytcIiB8fCB0ZXJtXzI0Ni52YWwoKSA9PT0gXCItLVwiKTtcbiAgfVxuICBpc0ZuRGVjbFRyYW5zZm9ybSh0ZXJtXzI0Nykge1xuICAgIHJldHVybiB0ZXJtXzI0NyAmJiB0ZXJtXzI0NyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI0Ny5yZXNvbHZlKCkpID09PSBGdW5jdGlvbkRlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNWYXJEZWNsVHJhbnNmb3JtKHRlcm1fMjQ4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjQ4ICYmIHRlcm1fMjQ4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjQ4LnJlc29sdmUoKSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0xldERlY2xUcmFuc2Zvcm0odGVybV8yNDkpIHtcbiAgICByZXR1cm4gdGVybV8yNDkgJiYgdGVybV8yNDkgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNDkucmVzb2x2ZSgpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybTtcbiAgfVxuICBpc0NvbnN0RGVjbFRyYW5zZm9ybSh0ZXJtXzI1MCkge1xuICAgIHJldHVybiB0ZXJtXzI1MCAmJiB0ZXJtXzI1MCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1MC5yZXNvbHZlKCkpID09PSBDb25zdERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhEZWNsVHJhbnNmb3JtKHRlcm1fMjUxKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUxICYmIHRlcm1fMjUxIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUxLnJlc29sdmUoKSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhyZWNEZWNsVHJhbnNmb3JtKHRlcm1fMjUyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjUyICYmIHRlcm1fMjUyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjUyLnJlc29sdmUoKSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm07XG4gIH1cbiAgaXNTeW50YXhUZW1wbGF0ZSh0ZXJtXzI1Mykge1xuICAgIHJldHVybiB0ZXJtXzI1MyAmJiB0ZXJtXzI1MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0ZXJtXzI1My5pc1N5bnRheFRlbXBsYXRlKCk7XG4gIH1cbiAgaXNTeW50YXhRdW90ZVRyYW5zZm9ybSh0ZXJtXzI1NCkge1xuICAgIHJldHVybiB0ZXJtXzI1NCAmJiB0ZXJtXzI1NCBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI1NC5yZXNvbHZlKCkpID09PSBTeW50YXhRdW90ZVRyYW5zZm9ybTtcbiAgfVxuICBpc1JldHVyblN0bXRUcmFuc2Zvcm0odGVybV8yNTUpIHtcbiAgICByZXR1cm4gdGVybV8yNTUgJiYgdGVybV8yNTUgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTUucmVzb2x2ZSgpKSA9PT0gUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtO1xuICB9XG4gIGlzV2hpbGVUcmFuc2Zvcm0odGVybV8yNTYpIHtcbiAgICByZXR1cm4gdGVybV8yNTYgJiYgdGVybV8yNTYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTYucmVzb2x2ZSgpKSA9PT0gV2hpbGVUcmFuc2Zvcm07XG4gIH1cbiAgaXNGb3JUcmFuc2Zvcm0odGVybV8yNTcpIHtcbiAgICByZXR1cm4gdGVybV8yNTcgJiYgdGVybV8yNTcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNTcucmVzb2x2ZSgpKSA9PT0gRm9yVHJhbnNmb3JtO1xuICB9XG4gIGlzU3dpdGNoVHJhbnNmb3JtKHRlcm1fMjU4KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU4ICYmIHRlcm1fMjU4IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU4LnJlc29sdmUoKSkgPT09IFN3aXRjaFRyYW5zZm9ybTtcbiAgfVxuICBpc0JyZWFrVHJhbnNmb3JtKHRlcm1fMjU5KSB7XG4gICAgcmV0dXJuIHRlcm1fMjU5ICYmIHRlcm1fMjU5IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjU5LnJlc29sdmUoKSkgPT09IEJyZWFrVHJhbnNmb3JtO1xuICB9XG4gIGlzQ29udGludWVUcmFuc2Zvcm0odGVybV8yNjApIHtcbiAgICByZXR1cm4gdGVybV8yNjAgJiYgdGVybV8yNjAgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjAucmVzb2x2ZSgpKSA9PT0gQ29udGludWVUcmFuc2Zvcm07XG4gIH1cbiAgaXNEb1RyYW5zZm9ybSh0ZXJtXzI2MSkge1xuICAgIHJldHVybiB0ZXJtXzI2MSAmJiB0ZXJtXzI2MSBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2MS5yZXNvbHZlKCkpID09PSBEb1RyYW5zZm9ybTtcbiAgfVxuICBpc0RlYnVnZ2VyVHJhbnNmb3JtKHRlcm1fMjYyKSB7XG4gICAgcmV0dXJuIHRlcm1fMjYyICYmIHRlcm1fMjYyIGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjYyLnJlc29sdmUoKSkgPT09IERlYnVnZ2VyVHJhbnNmb3JtO1xuICB9XG4gIGlzV2l0aFRyYW5zZm9ybSh0ZXJtXzI2Mykge1xuICAgIHJldHVybiB0ZXJtXzI2MyAmJiB0ZXJtXzI2MyBpbnN0YW5jZW9mIFN5bnRheCAmJiB0aGlzLmNvbnRleHQuZW52LmdldCh0ZXJtXzI2My5yZXNvbHZlKCkpID09PSBXaXRoVHJhbnNmb3JtO1xuICB9XG4gIGlzVHJ5VHJhbnNmb3JtKHRlcm1fMjY0KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY0ICYmIHRlcm1fMjY0IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY0LnJlc29sdmUoKSkgPT09IFRyeVRyYW5zZm9ybTtcbiAgfVxuICBpc1Rocm93VHJhbnNmb3JtKHRlcm1fMjY1KSB7XG4gICAgcmV0dXJuIHRlcm1fMjY1ICYmIHRlcm1fMjY1IGluc3RhbmNlb2YgU3ludGF4ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY1LnJlc29sdmUoKSkgPT09IFRocm93VHJhbnNmb3JtO1xuICB9XG4gIGlzSWZUcmFuc2Zvcm0odGVybV8yNjYpIHtcbiAgICByZXR1cm4gdGVybV8yNjYgJiYgdGVybV8yNjYgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjYucmVzb2x2ZSgpKSA9PT0gSWZUcmFuc2Zvcm07XG4gIH1cbiAgaXNOZXdUcmFuc2Zvcm0odGVybV8yNjcpIHtcbiAgICByZXR1cm4gdGVybV8yNjcgJiYgdGVybV8yNjcgaW5zdGFuY2VvZiBTeW50YXggJiYgdGhpcy5jb250ZXh0LmVudi5nZXQodGVybV8yNjcucmVzb2x2ZSgpKSA9PT0gTmV3VHJhbnNmb3JtO1xuICB9XG4gIGlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNjgpIHtcbiAgICByZXR1cm4gdGVybV8yNjggJiYgdGVybV8yNjggaW5zdGFuY2VvZiBTeW50YXggJiYgKHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY4LnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSB8fCB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjY4LnJlc29sdmUoKSkgaW5zdGFuY2VvZiBDb21waWxldGltZVRyYW5zZm9ybSk7XG4gIH1cbiAgZ2V0Q29tcGlsZXRpbWVUcmFuc2Zvcm0odGVybV8yNjkpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LmVudi5oYXModGVybV8yNjkucmVzb2x2ZSgpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMjY5LnJlc29sdmUoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMjY5LnJlc29sdmUoKSk7XG4gIH1cbiAgbGluZU51bWJlckVxKGFfMjcwLCBiXzI3MSkge1xuICAgIGlmICghKGFfMjcwICYmIGJfMjcxKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhc3NlcnQoYV8yNzAgaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICBhc3NlcnQoYl8yNzEgaW5zdGFuY2VvZiBTeW50YXgsIFwiZXhwZWN0aW5nIGEgc3ludGF4IG9iamVjdFwiKTtcbiAgICByZXR1cm4gYV8yNzAubGluZU51bWJlcigpID09PSBiXzI3MS5saW5lTnVtYmVyKCk7XG4gIH1cbiAgbWF0Y2hJZGVudGlmaWVyKHZhbF8yNzIpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMjczKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzM7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI3MywgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBtYXRjaEtleXdvcmQodmFsXzI3NCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8yNzUsIHZhbF8yNzQpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc1LCBcImV4cGVjdGluZyBcIiArIHZhbF8yNzQpO1xuICB9XG4gIG1hdGNoTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI3NiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzI3NikgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzI3NikgfHwgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8yNzYpIHx8IHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMjc2KSB8fCB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzI3NikgfHwgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8yNzYpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc2LCBcImV4cGVjdGluZyBhIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hTdHJpbmdMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjc3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8yNzcpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3NztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc3LCBcImV4cGVjdGluZyBhIHN0cmluZyBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoVGVtcGxhdGUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzggPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8yNzgpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI3ODtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc4LCBcImV4cGVjdGluZyBhIHRlbXBsYXRlIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hQYXJlbnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNzkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjc5KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8yNzkuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjc5LCBcImV4cGVjdGluZyBwYXJlbnNcIik7XG4gIH1cbiAgbWF0Y2hDdXJsaWVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjgwID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzI4MCkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgwLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4MCwgXCJleHBlY3RpbmcgY3VybHkgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoU3F1YXJlcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI4MSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzI4MSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMjgxLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4MSwgXCJleHBlY3Rpbmcgc3FhdXJlIGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFVuYXJ5T3BlcmF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODIgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNVbmFyeU9wZXJhdG9yKGxvb2thaGVhZF8yODIpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4MjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjgyLCBcImV4cGVjdGluZyBhIHVuYXJ5IG9wZXJhdG9yXCIpO1xuICB9XG4gIG1hdGNoUHVuY3R1YXRvcih2YWxfMjgzKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yODQgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzI4NCkpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsXzI4MyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAobG9va2FoZWFkXzI4NC52YWwoKSA9PT0gdmFsXzI4Mykge1xuICAgICAgICAgIHJldHVybiBsb29rYWhlYWRfMjg0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzI4NCwgXCJleHBlY3RpbmcgYSBcIiArIHZhbF8yODMgKyBcIiBwdW5jdHVhdG9yXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzI4NDtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMjg0LCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgY3JlYXRlRXJyb3Ioc3R4XzI4NSwgbWVzc2FnZV8yODYpIHtcbiAgICBsZXQgY3R4XzI4NyA9IFwiXCI7XG4gICAgbGV0IG9mZmVuZGluZ18yODggPSBzdHhfMjg1O1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGN0eF8yODcgPSB0aGlzLnJlc3Quc2xpY2UoMCwgMjApLm1hcCh0ZXJtXzI4OSA9PiB7XG4gICAgICAgIGlmICh0ZXJtXzI4OS5pc0RlbGltaXRlcigpKSB7XG4gICAgICAgICAgcmV0dXJuIHRlcm1fMjg5LmlubmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIExpc3Qub2YodGVybV8yODkpO1xuICAgICAgfSkuZmxhdHRlbigpLm1hcChzXzI5MCA9PiB7XG4gICAgICAgIGlmIChzXzI5MCA9PT0gb2ZmZW5kaW5nXzI4OCkge1xuICAgICAgICAgIHJldHVybiBcIl9fXCIgKyBzXzI5MC52YWwoKSArIFwiX19cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc18yOTAudmFsKCk7XG4gICAgICB9KS5qb2luKFwiIFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4XzI4NyA9IG9mZmVuZGluZ18yODgudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlXzI4NiArIFwiXFxuXCIgKyBjdHhfMjg3KTtcbiAgfVxufVxuIl19