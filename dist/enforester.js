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

var EXPR_LOOP_OPERATOR_23 = {};var EXPR_LOOP_NO_CHANGE_24 = {};var EXPR_LOOP_EXPANSION_25 = {};
var Enforester = exports.Enforester = function () {
  function Enforester(stxl_26, prev_27, context_28) {
    _classCallCheck(this, Enforester);

    this.done = false;(0, _errors.assert)(_immutable.List.isList(stxl_26), "expecting a list of terms to enforest");(0, _errors.assert)(_immutable.List.isList(prev_27), "expecting a list of terms to enforest");(0, _errors.assert)(context_28, "expecting a context to enforest");this.term = null;this.rest = stxl_26;this.prev = prev_27;this.context = context_28;
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
      var ret_30 = this.rest.first();this.rest = this.rest.rest();return ret_30;
    }
  }, {
    key: "enforest",
    value: function enforest() {
      var type_31 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];
      this.term = null;if (this.rest.size === 0) {
        this.done = true;return this.term;
      }if (this.isEOF(this.peek())) {
        this.term = new _terms2.default("EOF", {});this.advance();return this.term;
      }var result_32 = void 0;if (type_31 === "expression") {
        result_32 = this.enforestExpressionLoop();
      } else {
        result_32 = this.enforestModule();
      }if (this.rest.size === 0) {
        this.done = true;
      }return result_32;
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
      var lookahead_33 = this.peek();if (this.isKeyword(lookahead_33, "import")) {
        this.advance();return this.enforestImportDeclaration();
      } else if (this.isKeyword(lookahead_33, "export")) {
        this.advance();return this.enforestExportDeclaration();
      }return this.enforestStatement();
    }
  }, {
    key: "enforestExportDeclaration",
    value: function enforestExportDeclaration() {
      var lookahead_34 = this.peek();if (this.isPunctuator(lookahead_34, "*")) {
        this.advance();var moduleSpecifier = this.enforestFromClause();return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
      } else if (this.isBraces(lookahead_34)) {
        var namedExports = this.enforestExportClause();var _moduleSpecifier = null;if (this.isIdentifier(this.peek(), "from")) {
          _moduleSpecifier = this.enforestFromClause();
        }return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: _moduleSpecifier });
      } else if (this.isKeyword(lookahead_34, "class")) {
        return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
      } else if (this.isFnDeclTransform(lookahead_34)) {
        return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
      } else if (this.isKeyword(lookahead_34, "default")) {
        this.advance();if (this.isFnDeclTransform(this.peek())) {
          return new _terms2.default("ExportDefault", { body: this.enforestFunction({ isExpr: false, inDefault: true }) });
        } else if (this.isKeyword(this.peek(), "class")) {
          return new _terms2.default("ExportDefault", { body: this.enforestClass({ isExpr: false, inDefault: true }) });
        } else {
          var body = this.enforestExpressionLoop();this.consumeSemicolon();return new _terms2.default("ExportDefault", { body: body });
        }
      } else if (this.isVarDeclTransform(lookahead_34) || this.isLetDeclTransform(lookahead_34) || this.isConstDeclTransform(lookahead_34) || this.isSyntaxrecDeclTransform(lookahead_34) || this.isSyntaxDeclTransform(lookahead_34)) {
        return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
      }throw this.createError(lookahead_34, "unexpected syntax");
    }
  }, {
    key: "enforestExportClause",
    value: function enforestExportClause() {
      var enf_35 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);var result_36 = [];while (enf_35.rest.size !== 0) {
        result_36.push(enf_35.enforestExportSpecifier());enf_35.consumeComma();
      }return (0, _immutable.List)(result_36);
    }
  }, {
    key: "enforestExportSpecifier",
    value: function enforestExportSpecifier() {
      var name_37 = this.enforestIdentifier();if (this.isIdentifier(this.peek(), "as")) {
        this.advance();var exportedName = this.enforestIdentifier();return new _terms2.default("ExportSpecifier", { name: name_37, exportedName: exportedName });
      }return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_37 });
    }
  }, {
    key: "enforestImportDeclaration",
    value: function enforestImportDeclaration() {
      var lookahead_38 = this.peek();var defaultBinding_39 = null;var namedImports_40 = (0, _immutable.List)();var forSyntax_41 = false;if (this.isStringLiteral(lookahead_38)) {
        var moduleSpecifier = this.advance();this.consumeSemicolon();return new _terms2.default("Import", { defaultBinding: defaultBinding_39, namedImports: namedImports_40, moduleSpecifier: moduleSpecifier });
      }if (this.isIdentifier(lookahead_38) || this.isKeyword(lookahead_38)) {
        defaultBinding_39 = this.enforestBindingIdentifier();if (!this.isPunctuator(this.peek(), ",")) {
          var _moduleSpecifier2 = this.enforestFromClause();if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
            this.advance();this.advance();forSyntax_41 = true;
          }return new _terms2.default("Import", { defaultBinding: defaultBinding_39, moduleSpecifier: _moduleSpecifier2, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_41 });
        }
      }this.consumeComma();lookahead_38 = this.peek();if (this.isBraces(lookahead_38)) {
        var imports = this.enforestNamedImports();var fromClause = this.enforestFromClause();if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();this.advance();forSyntax_41 = true;
        }return new _terms2.default("Import", { defaultBinding: defaultBinding_39, forSyntax: forSyntax_41, namedImports: imports, moduleSpecifier: fromClause });
      } else if (this.isPunctuator(lookahead_38, "*")) {
        var namespaceBinding = this.enforestNamespaceBinding();var _moduleSpecifier3 = this.enforestFromClause();if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();this.advance();forSyntax_41 = true;
        }return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_39, forSyntax: forSyntax_41, namespaceBinding: namespaceBinding, moduleSpecifier: _moduleSpecifier3 });
      }throw this.createError(lookahead_38, "unexpected syntax");
    }
  }, {
    key: "enforestNamespaceBinding",
    value: function enforestNamespaceBinding() {
      this.matchPunctuator("*");this.matchIdentifier("as");return this.enforestBindingIdentifier();
    }
  }, {
    key: "enforestNamedImports",
    value: function enforestNamedImports() {
      var enf_42 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);var result_43 = [];while (enf_42.rest.size !== 0) {
        result_43.push(enf_42.enforestImportSpecifiers());enf_42.consumeComma();
      }return (0, _immutable.List)(result_43);
    }
  }, {
    key: "enforestImportSpecifiers",
    value: function enforestImportSpecifiers() {
      var lookahead_44 = this.peek();var name_45 = void 0;if (this.isIdentifier(lookahead_44) || this.isKeyword(lookahead_44)) {
        name_45 = this.advance();if (!this.isIdentifier(this.peek(), "as")) {
          return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_45 }) });
        } else {
          this.matchIdentifier("as");
        }
      } else {
        throw this.createError(lookahead_44, "unexpected token in import specifier");
      }return new _terms2.default("ImportSpecifier", { name: name_45, binding: this.enforestBindingIdentifier() });
    }
  }, {
    key: "enforestFromClause",
    value: function enforestFromClause() {
      this.matchIdentifier("from");var lookahead_46 = this.matchStringLiteral();this.consumeSemicolon();return lookahead_46;
    }
  }, {
    key: "enforestStatementListItem",
    value: function enforestStatementListItem() {
      var lookahead_47 = this.peek();if (this.isFnDeclTransform(lookahead_47)) {
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
      var lookahead_48 = this.peek();if (this.term === null && this.isCompiletimeTransform(lookahead_48)) {
        this.rest = this.expandMacro().concat(this.rest);lookahead_48 = this.peek();
      }if (this.term === null && this.isBraces(lookahead_48)) {
        return this.enforestBlockStatement();
      }if (this.term === null && this.isWhileTransform(lookahead_48)) {
        return this.enforestWhileStatement();
      }if (this.term === null && this.isIfTransform(lookahead_48)) {
        return this.enforestIfStatement();
      }if (this.term === null && this.isForTransform(lookahead_48)) {
        return this.enforestForStatement();
      }if (this.term === null && this.isSwitchTransform(lookahead_48)) {
        return this.enforestSwitchStatement();
      }if (this.term === null && this.isBreakTransform(lookahead_48)) {
        return this.enforestBreakStatement();
      }if (this.term === null && this.isContinueTransform(lookahead_48)) {
        return this.enforestContinueStatement();
      }if (this.term === null && this.isDoTransform(lookahead_48)) {
        return this.enforestDoStatement();
      }if (this.term === null && this.isDebuggerTransform(lookahead_48)) {
        return this.enforestDebuggerStatement();
      }if (this.term === null && this.isWithTransform(lookahead_48)) {
        return this.enforestWithStatement();
      }if (this.term === null && this.isTryTransform(lookahead_48)) {
        return this.enforestTryStatement();
      }if (this.term === null && this.isThrowTransform(lookahead_48)) {
        return this.enforestThrowStatement();
      }if (this.term === null && this.isKeyword(lookahead_48, "class")) {
        return this.enforestClass({ isExpr: false });
      }if (this.term === null && this.isFnDeclTransform(lookahead_48)) {
        return this.enforestFunctionDeclaration();
      }if (this.term === null && this.isIdentifier(lookahead_48) && this.isPunctuator(this.peek(1), ":")) {
        return this.enforestLabeledStatement();
      }if (this.term === null && (this.isVarDeclTransform(lookahead_48) || this.isLetDeclTransform(lookahead_48) || this.isConstDeclTransform(lookahead_48) || this.isSyntaxrecDeclTransform(lookahead_48) || this.isSyntaxDeclTransform(lookahead_48))) {
        var stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });this.consumeSemicolon();return stmt;
      }if (this.term === null && this.isReturnStmtTransform(lookahead_48)) {
        return this.enforestReturnStatement();
      }if (this.term === null && this.isPunctuator(lookahead_48, ";")) {
        this.advance();return new _terms2.default("EmptyStatement", {});
      }return this.enforestExpressionStatement();
    }
  }, {
    key: "enforestLabeledStatement",
    value: function enforestLabeledStatement() {
      var label_49 = this.matchIdentifier();var punc_50 = this.matchPunctuator(":");var stmt_51 = this.enforestStatement();return new _terms2.default("LabeledStatement", { label: label_49, body: stmt_51 });
    }
  }, {
    key: "enforestBreakStatement",
    value: function enforestBreakStatement() {
      this.matchKeyword("break");var lookahead_52 = this.peek();var label_53 = null;if (this.rest.size === 0 || this.isPunctuator(lookahead_52, ";")) {
        this.consumeSemicolon();return new _terms2.default("BreakStatement", { label: label_53 });
      }if (this.isIdentifier(lookahead_52) || this.isKeyword(lookahead_52, "yield") || this.isKeyword(lookahead_52, "let")) {
        label_53 = this.enforestIdentifier();
      }this.consumeSemicolon();return new _terms2.default("BreakStatement", { label: label_53 });
    }
  }, {
    key: "enforestTryStatement",
    value: function enforestTryStatement() {
      this.matchKeyword("try");var body_54 = this.enforestBlock();if (this.isKeyword(this.peek(), "catch")) {
        var catchClause = this.enforestCatchClause();if (this.isKeyword(this.peek(), "finally")) {
          this.advance();var finalizer = this.enforestBlock();return new _terms2.default("TryFinallyStatement", { body: body_54, catchClause: catchClause, finalizer: finalizer });
        }return new _terms2.default("TryCatchStatement", { body: body_54, catchClause: catchClause });
      }if (this.isKeyword(this.peek(), "finally")) {
        this.advance();var _finalizer = this.enforestBlock();return new _terms2.default("TryFinallyStatement", { body: body_54, catchClause: null, finalizer: _finalizer });
      }throw this.createError(this.peek(), "try with no catch or finally");
    }
  }, {
    key: "enforestCatchClause",
    value: function enforestCatchClause() {
      this.matchKeyword("catch");var bindingParens_55 = this.matchParens();var enf_56 = new Enforester(bindingParens_55, (0, _immutable.List)(), this.context);var binding_57 = enf_56.enforestBindingTarget();var body_58 = this.enforestBlock();return new _terms2.default("CatchClause", { binding: binding_57, body: body_58 });
    }
  }, {
    key: "enforestThrowStatement",
    value: function enforestThrowStatement() {
      this.matchKeyword("throw");var expression_59 = this.enforestExpression();this.consumeSemicolon();return new _terms2.default("ThrowStatement", { expression: expression_59 });
    }
  }, {
    key: "enforestWithStatement",
    value: function enforestWithStatement() {
      this.matchKeyword("with");var objParens_60 = this.matchParens();var enf_61 = new Enforester(objParens_60, (0, _immutable.List)(), this.context);var object_62 = enf_61.enforestExpression();var body_63 = this.enforestStatement();return new _terms2.default("WithStatement", { object: object_62, body: body_63 });
    }
  }, {
    key: "enforestDebuggerStatement",
    value: function enforestDebuggerStatement() {
      this.matchKeyword("debugger");return new _terms2.default("DebuggerStatement", {});
    }
  }, {
    key: "enforestDoStatement",
    value: function enforestDoStatement() {
      this.matchKeyword("do");var body_64 = this.enforestStatement();this.matchKeyword("while");var testBody_65 = this.matchParens();var enf_66 = new Enforester(testBody_65, (0, _immutable.List)(), this.context);var test_67 = enf_66.enforestExpression();this.consumeSemicolon();return new _terms2.default("DoWhileStatement", { body: body_64, test: test_67 });
    }
  }, {
    key: "enforestContinueStatement",
    value: function enforestContinueStatement() {
      var kwd_68 = this.matchKeyword("continue");var lookahead_69 = this.peek();var label_70 = null;if (this.rest.size === 0 || this.isPunctuator(lookahead_69, ";")) {
        this.consumeSemicolon();return new _terms2.default("ContinueStatement", { label: label_70 });
      }if (this.lineNumberEq(kwd_68, lookahead_69) && (this.isIdentifier(lookahead_69) || this.isKeyword(lookahead_69, "yield") || this.isKeyword(lookahead_69, "let"))) {
        label_70 = this.enforestIdentifier();
      }this.consumeSemicolon();return new _terms2.default("ContinueStatement", { label: label_70 });
    }
  }, {
    key: "enforestSwitchStatement",
    value: function enforestSwitchStatement() {
      this.matchKeyword("switch");var cond_71 = this.matchParens();var enf_72 = new Enforester(cond_71, (0, _immutable.List)(), this.context);var discriminant_73 = enf_72.enforestExpression();var body_74 = this.matchCurlies();if (body_74.size === 0) {
        return new _terms2.default("SwitchStatement", { discriminant: discriminant_73, cases: (0, _immutable.List)() });
      }enf_72 = new Enforester(body_74, (0, _immutable.List)(), this.context);var cases_75 = enf_72.enforestSwitchCases();var lookahead_76 = enf_72.peek();if (enf_72.isKeyword(lookahead_76, "default")) {
        var defaultCase = enf_72.enforestSwitchDefault();var postDefaultCases = enf_72.enforestSwitchCases();return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_73, preDefaultCases: cases_75, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
      }return new _terms2.default("SwitchStatement", { discriminant: discriminant_73, cases: cases_75 });
    }
  }, {
    key: "enforestSwitchCases",
    value: function enforestSwitchCases() {
      var cases_77 = [];while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
        cases_77.push(this.enforestSwitchCase());
      }return (0, _immutable.List)(cases_77);
    }
  }, {
    key: "enforestSwitchCase",
    value: function enforestSwitchCase() {
      this.matchKeyword("case");return new _terms2.default("SwitchCase", { test: this.enforestExpression(), consequent: this.enforestSwitchCaseBody() });
    }
  }, {
    key: "enforestSwitchCaseBody",
    value: function enforestSwitchCaseBody() {
      this.matchPunctuator(":");return this.enforestStatementListInSwitchCaseBody();
    }
  }, {
    key: "enforestStatementListInSwitchCaseBody",
    value: function enforestStatementListInSwitchCaseBody() {
      var result_78 = [];while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
        result_78.push(this.enforestStatementListItem());
      }return (0, _immutable.List)(result_78);
    }
  }, {
    key: "enforestSwitchDefault",
    value: function enforestSwitchDefault() {
      this.matchKeyword("default");return new _terms2.default("SwitchDefault", { consequent: this.enforestSwitchCaseBody() });
    }
  }, {
    key: "enforestForStatement",
    value: function enforestForStatement() {
      this.matchKeyword("for");var cond_79 = this.matchParens();var enf_80 = new Enforester(cond_79, (0, _immutable.List)(), this.context);var lookahead_81 = void 0,
          test_82 = void 0,
          init_83 = void 0,
          right_84 = void 0,
          type_85 = void 0,
          left_86 = void 0,
          update_87 = void 0;if (enf_80.isPunctuator(enf_80.peek(), ";")) {
        enf_80.advance();if (!enf_80.isPunctuator(enf_80.peek(), ";")) {
          test_82 = enf_80.enforestExpression();
        }enf_80.matchPunctuator(";");if (enf_80.rest.size !== 0) {
          right_84 = enf_80.enforestExpression();
        }return new _terms2.default("ForStatement", { init: null, test: test_82, update: right_84, body: this.enforestStatement() });
      } else {
        lookahead_81 = enf_80.peek();if (enf_80.isVarDeclTransform(lookahead_81) || enf_80.isLetDeclTransform(lookahead_81) || enf_80.isConstDeclTransform(lookahead_81)) {
          init_83 = enf_80.enforestVariableDeclaration();lookahead_81 = enf_80.peek();if (this.isKeyword(lookahead_81, "in") || this.isIdentifier(lookahead_81, "of")) {
            if (this.isKeyword(lookahead_81, "in")) {
              enf_80.advance();right_84 = enf_80.enforestExpression();type_85 = "ForInStatement";
            } else if (this.isIdentifier(lookahead_81, "of")) {
              enf_80.advance();right_84 = enf_80.enforestExpression();type_85 = "ForOfStatement";
            }return new _terms2.default(type_85, { left: init_83, right: right_84, body: this.enforestStatement() });
          }enf_80.matchPunctuator(";");if (enf_80.isPunctuator(enf_80.peek(), ";")) {
            enf_80.advance();test_82 = null;
          } else {
            test_82 = enf_80.enforestExpression();enf_80.matchPunctuator(";");
          }update_87 = enf_80.enforestExpression();
        } else {
          if (this.isKeyword(enf_80.peek(1), "in") || this.isIdentifier(enf_80.peek(1), "of")) {
            left_86 = enf_80.enforestBindingIdentifier();var kind = enf_80.advance();if (this.isKeyword(kind, "in")) {
              type_85 = "ForInStatement";
            } else {
              type_85 = "ForOfStatement";
            }right_84 = enf_80.enforestExpression();return new _terms2.default(type_85, { left: left_86, right: right_84, body: this.enforestStatement() });
          }init_83 = enf_80.enforestExpression();enf_80.matchPunctuator(";");if (enf_80.isPunctuator(enf_80.peek(), ";")) {
            enf_80.advance();test_82 = null;
          } else {
            test_82 = enf_80.enforestExpression();enf_80.matchPunctuator(";");
          }update_87 = enf_80.enforestExpression();
        }return new _terms2.default("ForStatement", { init: init_83, test: test_82, update: update_87, body: this.enforestStatement() });
      }
    }
  }, {
    key: "enforestIfStatement",
    value: function enforestIfStatement() {
      this.matchKeyword("if");var cond_88 = this.matchParens();var enf_89 = new Enforester(cond_88, (0, _immutable.List)(), this.context);var lookahead_90 = enf_89.peek();var test_91 = enf_89.enforestExpression();if (test_91 === null) {
        throw enf_89.createError(lookahead_90, "expecting an expression");
      }var consequent_92 = this.enforestStatement();var alternate_93 = null;if (this.isKeyword(this.peek(), "else")) {
        this.advance();alternate_93 = this.enforestStatement();
      }return new _terms2.default("IfStatement", { test: test_91, consequent: consequent_92, alternate: alternate_93 });
    }
  }, {
    key: "enforestWhileStatement",
    value: function enforestWhileStatement() {
      this.matchKeyword("while");var cond_94 = this.matchParens();var enf_95 = new Enforester(cond_94, (0, _immutable.List)(), this.context);var lookahead_96 = enf_95.peek();var test_97 = enf_95.enforestExpression();if (test_97 === null) {
        throw enf_95.createError(lookahead_96, "expecting an expression");
      }var body_98 = this.enforestStatement();return new _terms2.default("WhileStatement", { test: test_97, body: body_98 });
    }
  }, {
    key: "enforestBlockStatement",
    value: function enforestBlockStatement() {
      return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
    }
  }, {
    key: "enforestBlock",
    value: function enforestBlock() {
      var b_99 = this.matchCurlies();var body_100 = [];var enf_101 = new Enforester(b_99, (0, _immutable.List)(), this.context);while (enf_101.rest.size !== 0) {
        var lookahead = enf_101.peek();var stmt = enf_101.enforestStatement();if (stmt == null) {
          throw enf_101.createError(lookahead, "not a statement");
        }body_100.push(stmt);
      }return new _terms2.default("Block", { statements: (0, _immutable.List)(body_100) });
    }
  }, {
    key: "enforestClass",
    value: function enforestClass(_ref) {
      var isExpr = _ref.isExpr;
      var inDefault = _ref.inDefault;
      var kw_102 = this.advance();var name_103 = null,
          supr_104 = null;var type_105 = isExpr ? "ClassExpression" : "ClassDeclaration";if (this.isIdentifier(this.peek())) {
        name_103 = this.enforestBindingIdentifier();
      } else if (!isExpr) {
        if (inDefault) {
          name_103 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_102) });
        } else {
          throw this.createError(this.peek(), "unexpected syntax");
        }
      }if (this.isKeyword(this.peek(), "extends")) {
        this.advance();supr_104 = this.enforestExpressionLoop();
      }var elements_106 = [];var enf_107 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);while (enf_107.rest.size !== 0) {
        if (enf_107.isPunctuator(enf_107.peek(), ";")) {
          enf_107.advance();continue;
        }var isStatic = false;
        var _enf_107$enforestMeth = enf_107.enforestMethodDefinition();

        var methodOrKey = _enf_107$enforestMeth.methodOrKey;
        var kind = _enf_107$enforestMeth.kind;
        if (kind === "identifier" && methodOrKey.value.val() === "static") {
          isStatic = true;
          var _enf_107$enforestMeth2 = enf_107.enforestMethodDefinition();

          methodOrKey = _enf_107$enforestMeth2.methodOrKey;
          kind = _enf_107$enforestMeth2.kind;
        }if (kind === "method") {
          elements_106.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
        } else {
          throw this.createError(enf_107.peek(), "Only methods are allowed in classes");
        }
      }return new _terms2.default(type_105, { name: name_103, super: supr_104, elements: (0, _immutable.List)(elements_106) });
    }
  }, {
    key: "enforestBindingTarget",
    value: function enforestBindingTarget() {
      var lookahead_108 = this.peek();if (this.isIdentifier(lookahead_108) || this.isKeyword(lookahead_108)) {
        return this.enforestBindingIdentifier();
      } else if (this.isBrackets(lookahead_108)) {
        return this.enforestArrayBinding();
      } else if (this.isBraces(lookahead_108)) {
        return this.enforestObjectBinding();
      }(0, _errors.assert)(false, "not implemented yet");
    }
  }, {
    key: "enforestObjectBinding",
    value: function enforestObjectBinding() {
      var enf_109 = new Enforester(this.matchCurlies(), (0, _immutable.List)(), this.context);var properties_110 = [];while (enf_109.rest.size !== 0) {
        properties_110.push(enf_109.enforestBindingProperty());enf_109.consumeComma();
      }return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_110) });
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
          var defaultValue = null;if (this.isAssign(this.peek())) {
            this.advance();var expr = this.enforestExpressionLoop();defaultValue = expr;
          }return new _terms2.default("BindingPropertyIdentifier", { binding: binding, init: defaultValue });
        }
      }this.matchPunctuator(":");binding = this.enforestBindingElement();return new _terms2.default("BindingPropertyProperty", { name: name, binding: binding });
    }
  }, {
    key: "enforestArrayBinding",
    value: function enforestArrayBinding() {
      var bracket_112 = this.matchSquares();var enf_113 = new Enforester(bracket_112, (0, _immutable.List)(), this.context);var elements_114 = [],
          restElement_115 = null;while (enf_113.rest.size !== 0) {
        var el = void 0;if (enf_113.isPunctuator(enf_113.peek(), ",")) {
          enf_113.consumeComma();el = null;
        } else {
          if (enf_113.isPunctuator(enf_113.peek(), "...")) {
            enf_113.advance();restElement_115 = enf_113.enforestBindingTarget();break;
          } else {
            el = enf_113.enforestBindingElement();
          }enf_113.consumeComma();
        }elements_114.push(el);
      }return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_114), restElement: restElement_115 });
    }
  }, {
    key: "enforestBindingElement",
    value: function enforestBindingElement() {
      var binding_116 = this.enforestBindingTarget();if (this.isAssign(this.peek())) {
        this.advance();var init = this.enforestExpressionLoop();binding_116 = new _terms2.default("BindingWithDefault", { binding: binding_116, init: init });
      }return binding_116;
    }
  }, {
    key: "enforestBindingIdentifier",
    value: function enforestBindingIdentifier() {
      return new _terms2.default("BindingIdentifier", { name: this.enforestIdentifier() });
    }
  }, {
    key: "enforestIdentifier",
    value: function enforestIdentifier() {
      var lookahead_117 = this.peek();if (this.isIdentifier(lookahead_117) || this.isKeyword(lookahead_117)) {
        return this.advance();
      }throw this.createError(lookahead_117, "expecting an identifier");
    }
  }, {
    key: "enforestReturnStatement",
    value: function enforestReturnStatement() {
      var kw_118 = this.advance();var lookahead_119 = this.peek();if (this.rest.size === 0 || lookahead_119 && !this.lineNumberEq(kw_118, lookahead_119)) {
        return new _terms2.default("ReturnStatement", { expression: null });
      }var term_120 = null;if (!this.isPunctuator(lookahead_119, ";")) {
        term_120 = this.enforestExpression();(0, _errors.expect)(term_120 != null, "Expecting an expression to follow return keyword", lookahead_119, this.rest);
      }this.consumeSemicolon();return new _terms2.default("ReturnStatement", { expression: term_120 });
    }
  }, {
    key: "enforestVariableDeclaration",
    value: function enforestVariableDeclaration() {
      var kind_121 = void 0;var lookahead_122 = this.advance();var kindSyn_123 = lookahead_122;if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.VariableDeclTransform) {
        kind_121 = "var";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.LetDeclTransform) {
        kind_121 = "let";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.ConstDeclTransform) {
        kind_121 = "const";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.SyntaxDeclTransform) {
        kind_121 = "syntax";
      } else if (kindSyn_123 && this.context.env.get(kindSyn_123.resolve()) === _transforms.SyntaxrecDeclTransform) {
        kind_121 = "syntaxrec";
      }var decls_124 = (0, _immutable.List)();while (true) {
        var term = this.enforestVariableDeclarator();var _lookahead_ = this.peek();decls_124 = decls_124.concat(term);if (this.isPunctuator(_lookahead_, ",")) {
          this.advance();
        } else {
          break;
        }
      }return new _terms2.default("VariableDeclaration", { kind: kind_121, declarators: decls_124 });
    }
  }, {
    key: "enforestVariableDeclarator",
    value: function enforestVariableDeclarator() {
      var id_125 = this.enforestBindingTarget();var lookahead_126 = this.peek();var init_127 = void 0,
          rest_128 = void 0;if (this.isPunctuator(lookahead_126, "=")) {
        this.advance();var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);init_127 = enf.enforest("expression");this.rest = enf.rest;
      } else {
        init_127 = null;
      }return new _terms2.default("VariableDeclarator", { binding: id_125, init: init_127 });
    }
  }, {
    key: "enforestExpressionStatement",
    value: function enforestExpressionStatement() {
      var start_129 = this.rest.get(0);var expr_130 = this.enforestExpression();if (expr_130 === null) {
        throw this.createError(start_129, "not a valid expression");
      }this.consumeSemicolon();return new _terms2.default("ExpressionStatement", { expression: expr_130 });
    }
  }, {
    key: "enforestExpression",
    value: function enforestExpression() {
      var left_131 = this.enforestExpressionLoop();var lookahead_132 = this.peek();if (this.isPunctuator(lookahead_132, ",")) {
        while (this.rest.size !== 0) {
          if (!this.isPunctuator(this.peek(), ",")) {
            break;
          }var operator = this.advance();var right = this.enforestExpressionLoop();left_131 = new _terms2.default("BinaryExpression", { left: left_131, operator: operator, right: right });
        }
      }this.term = null;return left_131;
    }
  }, {
    key: "enforestExpressionLoop",
    value: function enforestExpressionLoop() {
      this.term = null;this.opCtx = { prec: 0, combine: function combine(x) {
          return x;
        }, stack: (0, _immutable.List)() };do {
        var term = this.enforestAssignmentExpression();if (term === EXPR_LOOP_NO_CHANGE_24 && this.opCtx.stack.size > 0) {
          this.term = this.opCtx.combine(this.term);
          var _opCtx$stack$last = this.opCtx.stack.last();

          var prec = _opCtx$stack$last.prec;
          var combine = _opCtx$stack$last.combine;
          this.opCtx.prec = prec;this.opCtx.combine = combine;this.opCtx.stack = this.opCtx.stack.pop();
        } else if (term === EXPR_LOOP_NO_CHANGE_24) {
          break;
        } else if (term === EXPR_LOOP_OPERATOR_23 || term === EXPR_LOOP_EXPANSION_25) {
          this.term = null;
        } else {
          this.term = term;
        }
      } while (true);return this.term;
    }
  }, {
    key: "enforestAssignmentExpression",
    value: function enforestAssignmentExpression() {
      var lookahead_133 = this.peek();if (this.term === null && this.isTerm(lookahead_133)) {
        return this.advance();
      }if (this.term === null && this.isCompiletimeTransform(lookahead_133)) {
        var result = this.expandMacro();this.rest = result.concat(this.rest);return EXPR_LOOP_EXPANSION_25;
      }if (this.term === null && this.isKeyword(lookahead_133, "yield")) {
        return this.enforestYieldExpression();
      }if (this.term === null && this.isKeyword(lookahead_133, "class")) {
        return this.enforestClass({ isExpr: true });
      }if (this.term === null && this.isKeyword(lookahead_133, "super")) {
        this.advance();return new _terms2.default("Super", {});
      }if (this.term === null && (this.isIdentifier(lookahead_133) || this.isParens(lookahead_133)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_133, this.peek(1))) {
        return this.enforestArrowExpression();
      }if (this.term === null && this.isSyntaxTemplate(lookahead_133)) {
        return this.enforestSyntaxTemplate();
      }if (this.term === null && this.isSyntaxQuoteTransform(lookahead_133)) {
        return this.enforestSyntaxQuote();
      }if (this.term === null && this.isNewTransform(lookahead_133)) {
        return this.enforestNewExpression();
      }if (this.term === null && this.isKeyword(lookahead_133, "this")) {
        return new _terms2.default("ThisExpression", { stx: this.advance() });
      }if (this.term === null && (this.isIdentifier(lookahead_133) || this.isKeyword(lookahead_133, "let") || this.isKeyword(lookahead_133, "yield"))) {
        return new _terms2.default("IdentifierExpression", { name: this.advance() });
      }if (this.term === null && this.isNumericLiteral(lookahead_133)) {
        var num = this.advance();if (num.val() === 1 / 0) {
          return new _terms2.default("LiteralInfinityExpression", {});
        }return new _terms2.default("LiteralNumericExpression", { value: num });
      }if (this.term === null && this.isStringLiteral(lookahead_133)) {
        return new _terms2.default("LiteralStringExpression", { value: this.advance() });
      }if (this.term === null && this.isTemplate(lookahead_133)) {
        return new _terms2.default("TemplateExpression", { tag: null, elements: this.enforestTemplateElements() });
      }if (this.term === null && this.isBooleanLiteral(lookahead_133)) {
        return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
      }if (this.term === null && this.isNullLiteral(lookahead_133)) {
        this.advance();return new _terms2.default("LiteralNullExpression", {});
      }if (this.term === null && this.isRegularExpression(lookahead_133)) {
        var reStx = this.advance();var lastSlash = reStx.token.value.lastIndexOf("/");var pattern = reStx.token.value.slice(1, lastSlash);var flags = reStx.token.value.slice(lastSlash + 1);return new _terms2.default("LiteralRegExpExpression", { pattern: pattern, flags: flags });
      }if (this.term === null && this.isParens(lookahead_133)) {
        return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
      }if (this.term === null && this.isFnDeclTransform(lookahead_133)) {
        return this.enforestFunctionExpression();
      }if (this.term === null && this.isBraces(lookahead_133)) {
        return this.enforestObjectExpression();
      }if (this.term === null && this.isBrackets(lookahead_133)) {
        return this.enforestArrayExpression();
      }if (this.term === null && this.isOperator(lookahead_133)) {
        return this.enforestUnaryExpression();
      }if (this.term && this.isUpdateOperator(lookahead_133)) {
        return this.enforestUpdateExpression();
      }if (this.term && this.isOperator(lookahead_133)) {
        return this.enforestBinaryExpression();
      }if (this.term && this.isPunctuator(lookahead_133, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        return this.enforestStaticMemberExpression();
      }if (this.term && this.isBrackets(lookahead_133)) {
        return this.enforestComputedMemberExpression();
      }if (this.term && this.isParens(lookahead_133)) {
        var paren = this.advance();return new _terms2.default("CallExpression", { callee: this.term, arguments: paren.inner() });
      }if (this.term && this.isTemplate(lookahead_133)) {
        return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
      }if (this.term && this.isAssign(lookahead_133)) {
        var binding = this.transformDestructuring(this.term);var op = this.advance();var enf = new Enforester(this.rest, (0, _immutable.List)(), this.context);var init = enf.enforest("expression");this.rest = enf.rest;if (op.val() === "=") {
          return new _terms2.default("AssignmentExpression", { binding: binding, expression: init });
        } else {
          return new _terms2.default("CompoundAssignmentExpression", { binding: binding, operator: op.val(), expression: init });
        }
      }if (this.term && this.isPunctuator(lookahead_133, "?")) {
        return this.enforestConditionalExpression();
      }return EXPR_LOOP_NO_CHANGE_24;
    }
  }, {
    key: "enforestArgumentList",
    value: function enforestArgumentList() {
      var result_134 = [];while (this.rest.size > 0) {
        var arg = void 0;if (this.isPunctuator(this.peek(), "...")) {
          this.advance();arg = new _terms2.default("SpreadElement", { expression: this.enforestExpressionLoop() });
        } else {
          arg = this.enforestExpressionLoop();
        }if (this.rest.size > 0) {
          this.matchPunctuator(",");
        }result_134.push(arg);
      }return (0, _immutable.List)(result_134);
    }
  }, {
    key: "enforestNewExpression",
    value: function enforestNewExpression() {
      this.matchKeyword("new");var callee_135 = void 0;if (this.isKeyword(this.peek(), "new")) {
        callee_135 = this.enforestNewExpression();
      } else if (this.isKeyword(this.peek(), "super")) {
        callee_135 = this.enforestExpressionLoop();
      } else if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
        this.advance();this.advance();return new _terms2.default("NewTargetExpression", {});
      } else {
        callee_135 = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
      }var args_136 = void 0;if (this.isParens(this.peek())) {
        args_136 = this.matchParens();
      } else {
        args_136 = (0, _immutable.List)();
      }return new _terms2.default("NewExpression", { callee: callee_135, arguments: args_136 });
    }
  }, {
    key: "enforestComputedMemberExpression",
    value: function enforestComputedMemberExpression() {
      var enf_137 = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_137.enforestExpression() });
    }
  }, {
    key: "transformDestructuring",
    value: function transformDestructuring(term_138) {
      var _this = this;

      switch (term_138.type) {case "IdentifierExpression":
          return new _terms2.default("BindingIdentifier", { name: term_138.name });case "ParenthesizedExpression":
          if (term_138.inner.size === 1 && this.isIdentifier(term_138.inner.get(0))) {
            return new _terms2.default("BindingIdentifier", { name: term_138.inner.get(0) });
          }case "DataProperty":
          return new _terms2.default("BindingPropertyProperty", { name: term_138.name, binding: this.transformDestructuringWithDefault(term_138.expression) });case "ShorthandProperty":
          return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_138.name }), init: null });case "ObjectExpression":
          return new _terms2.default("ObjectBinding", { properties: term_138.properties.map(function (t) {
              return _this.transformDestructuring(t);
            }) });case "ArrayExpression":
          var last = term_138.elements.last();if (last != null && last.type === "SpreadElement") {
            return new _terms2.default("ArrayBinding", { elements: term_138.elements.slice(0, -1).map(function (t) {
                return t && _this.transformDestructuringWithDefault(t);
              }), restElement: this.transformDestructuringWithDefault(last.expression) });
          } else {
            return new _terms2.default("ArrayBinding", { elements: term_138.elements.map(function (t) {
                return t && _this.transformDestructuringWithDefault(t);
              }), restElement: null });
          }return new _terms2.default("ArrayBinding", { elements: term_138.elements.map(function (t) {
              return t && _this.transformDestructuring(t);
            }), restElement: null });case "StaticPropertyName":
          return new _terms2.default("BindingIdentifier", { name: term_138.value });case "ComputedMemberExpression":case "StaticMemberExpression":case "ArrayBinding":case "BindingIdentifier":case "BindingPropertyIdentifier":case "BindingPropertyProperty":case "BindingWithDefault":case "ObjectBinding":
          return term_138;}(0, _errors.assert)(false, "not implemented yet for " + term_138.type);
    }
  }, {
    key: "transformDestructuringWithDefault",
    value: function transformDestructuringWithDefault(term_139) {
      switch (term_139.type) {case "AssignmentExpression":
          return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_139.binding), init: term_139.expression });}return this.transformDestructuring(term_139);
    }
  }, {
    key: "enforestArrowExpression",
    value: function enforestArrowExpression() {
      var enf_140 = void 0;if (this.isIdentifier(this.peek())) {
        enf_140 = new Enforester(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
      } else {
        var p = this.matchParens();enf_140 = new Enforester(p, (0, _immutable.List)(), this.context);
      }var params_141 = enf_140.enforestFormalParameters();this.matchPunctuator("=>");var body_142 = void 0;if (this.isBraces(this.peek())) {
        body_142 = this.matchCurlies();
      } else {
        enf_140 = new Enforester(this.rest, (0, _immutable.List)(), this.context);body_142 = enf_140.enforestExpressionLoop();this.rest = enf_140.rest;
      }return new _terms2.default("ArrowExpression", { params: params_141, body: body_142 });
    }
  }, {
    key: "enforestYieldExpression",
    value: function enforestYieldExpression() {
      var kwd_143 = this.matchKeyword("yield");var lookahead_144 = this.peek();if (this.rest.size === 0 || lookahead_144 && !this.lineNumberEq(kwd_143, lookahead_144)) {
        return new _terms2.default("YieldExpression", { expression: null });
      } else {
        var isGenerator = false;if (this.isPunctuator(this.peek(), "*")) {
          isGenerator = true;this.advance();
        }var expr = this.enforestExpression();var type = isGenerator ? "YieldGeneratorExpression" : "YieldExpression";return new _terms2.default(type, { expression: expr });
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
      var name_145 = this.advance();return new _terms2.default("SyntaxQuote", { name: name_145, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_145 }), elements: this.enforestTemplateElements() }) });
    }
  }, {
    key: "enforestStaticMemberExpression",
    value: function enforestStaticMemberExpression() {
      var object_146 = this.term;var dot_147 = this.advance();var property_148 = this.advance();return new _terms2.default("StaticMemberExpression", { object: object_146, property: property_148 });
    }
  }, {
    key: "enforestArrayExpression",
    value: function enforestArrayExpression() {
      var arr_149 = this.advance();var elements_150 = [];var enf_151 = new Enforester(arr_149.inner(), (0, _immutable.List)(), this.context);while (enf_151.rest.size > 0) {
        var lookahead = enf_151.peek();if (enf_151.isPunctuator(lookahead, ",")) {
          enf_151.advance();elements_150.push(null);
        } else if (enf_151.isPunctuator(lookahead, "...")) {
          enf_151.advance();var expression = enf_151.enforestExpressionLoop();if (expression == null) {
            throw enf_151.createError(lookahead, "expecting expression");
          }elements_150.push(new _terms2.default("SpreadElement", { expression: expression }));
        } else {
          var term = enf_151.enforestExpressionLoop();if (term == null) {
            throw enf_151.createError(lookahead, "expected expression");
          }elements_150.push(term);enf_151.consumeComma();
        }
      }return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_150) });
    }
  }, {
    key: "enforestObjectExpression",
    value: function enforestObjectExpression() {
      var obj_152 = this.advance();var properties_153 = (0, _immutable.List)();var enf_154 = new Enforester(obj_152.inner(), (0, _immutable.List)(), this.context);var lastProp_155 = null;while (enf_154.rest.size > 0) {
        var prop = enf_154.enforestPropertyDefinition();enf_154.consumeComma();properties_153 = properties_153.concat(prop);if (lastProp_155 === prop) {
          throw enf_154.createError(prop, "invalid syntax in object");
        }lastProp_155 = prop;
      }return new _terms2.default("ObjectExpression", { properties: properties_153 });
    }
  }, {
    key: "enforestPropertyDefinition",
    value: function enforestPropertyDefinition() {
      var _enforestMethodDefini = this.enforestMethodDefinition();

      var methodOrKey = _enforestMethodDefini.methodOrKey;
      var kind = _enforestMethodDefini.kind;
      switch (kind) {case "method":
          return methodOrKey;case "identifier":
          if (this.isAssign(this.peek())) {
            this.advance();var init = this.enforestExpressionLoop();return new _terms2.default("BindingPropertyIdentifier", { init: init, binding: this.transformDestructuring(methodOrKey) });
          } else if (!this.isPunctuator(this.peek(), ":")) {
            return new _terms2.default("ShorthandProperty", { name: methodOrKey.value });
          }}this.matchPunctuator(":");var expr_156 = this.enforestExpressionLoop();return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_156 });
    }
  }, {
    key: "enforestMethodDefinition",
    value: function enforestMethodDefinition() {
      var lookahead_157 = this.peek();var isGenerator_158 = false;if (this.isPunctuator(lookahead_157, "*")) {
        isGenerator_158 = true;this.advance();
      }if (this.isIdentifier(lookahead_157, "get") && this.isPropertyName(this.peek(1))) {
        this.advance();
        var _enforestPropertyName2 = this.enforestPropertyName();

        var _name = _enforestPropertyName2.name;
        this.matchParens();var body = this.matchCurlies();return { methodOrKey: new _terms2.default("Getter", { name: _name, body: body }), kind: "method" };
      } else if (this.isIdentifier(lookahead_157, "set") && this.isPropertyName(this.peek(1))) {
        this.advance();
        var _enforestPropertyName3 = this.enforestPropertyName();

        var _name2 = _enforestPropertyName3.name;
        var enf = new Enforester(this.matchParens(), (0, _immutable.List)(), this.context);var param = enf.enforestBindingElement();var _body = this.matchCurlies();return { methodOrKey: new _terms2.default("Setter", { name: _name2, param: param, body: _body }), kind: "method" };
      }
      var _enforestPropertyName4 = this.enforestPropertyName();

      var name = _enforestPropertyName4.name;
      if (this.isParens(this.peek())) {
        var params = this.matchParens();var _enf = new Enforester(params, (0, _immutable.List)(), this.context);var formalParams = _enf.enforestFormalParameters();var _body2 = this.matchCurlies();return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_158, name: name, params: formalParams, body: _body2 }), kind: "method" };
      }return { methodOrKey: name, kind: this.isIdentifier(lookahead_157) || this.isKeyword(lookahead_157) ? "identifier" : "property" };
    }
  }, {
    key: "enforestPropertyName",
    value: function enforestPropertyName() {
      var lookahead_159 = this.peek();if (this.isStringLiteral(lookahead_159) || this.isNumericLiteral(lookahead_159)) {
        return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
      } else if (this.isBrackets(lookahead_159)) {
        var enf = new Enforester(this.matchSquares(), (0, _immutable.List)(), this.context);var expr = enf.enforestExpressionLoop();return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
      }var name_160 = this.advance();return { name: new _terms2.default("StaticPropertyName", { value: name_160 }), binding: new _terms2.default("BindingIdentifier", { name: name_160 }) };
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
          rest_164 = void 0;var isGenerator_165 = false;var fnKeyword_166 = this.advance();var lookahead_167 = this.peek();var type_168 = isExpr ? "FunctionExpression" : "FunctionDeclaration";if (this.isPunctuator(lookahead_167, "*")) {
        isGenerator_165 = true;this.advance();lookahead_167 = this.peek();
      }if (!this.isParens(lookahead_167)) {
        name_161 = this.enforestBindingIdentifier();
      } else if (inDefault) {
        name_161 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_166) });
      }params_162 = this.matchParens();body_163 = this.matchCurlies();var enf_169 = new Enforester(params_162, (0, _immutable.List)(), this.context);var formalParams_170 = enf_169.enforestFormalParameters();return new _terms2.default(type_168, { name: name_161, isGenerator: isGenerator_165, params: formalParams_170, body: body_163 });
    }
  }, {
    key: "enforestFunctionExpression",
    value: function enforestFunctionExpression() {
      var name_171 = null,
          params_172 = void 0,
          body_173 = void 0,
          rest_174 = void 0;var isGenerator_175 = false;this.advance();var lookahead_176 = this.peek();if (this.isPunctuator(lookahead_176, "*")) {
        isGenerator_175 = true;this.advance();lookahead_176 = this.peek();
      }if (!this.isParens(lookahead_176)) {
        name_171 = this.enforestBindingIdentifier();
      }params_172 = this.matchParens();body_173 = this.matchCurlies();var enf_177 = new Enforester(params_172, (0, _immutable.List)(), this.context);var formalParams_178 = enf_177.enforestFormalParameters();return new _terms2.default("FunctionExpression", { name: name_171, isGenerator: isGenerator_175, params: formalParams_178, body: body_173 });
    }
  }, {
    key: "enforestFunctionDeclaration",
    value: function enforestFunctionDeclaration() {
      var name_179 = void 0,
          params_180 = void 0,
          body_181 = void 0,
          rest_182 = void 0;var isGenerator_183 = false;this.advance();var lookahead_184 = this.peek();if (this.isPunctuator(lookahead_184, "*")) {
        isGenerator_183 = true;this.advance();
      }name_179 = this.enforestBindingIdentifier();params_180 = this.matchParens();body_181 = this.matchCurlies();var enf_185 = new Enforester(params_180, (0, _immutable.List)(), this.context);var formalParams_186 = enf_185.enforestFormalParameters();return new _terms2.default("FunctionDeclaration", { name: name_179, isGenerator: isGenerator_183, params: formalParams_186, body: body_181 });
    }
  }, {
    key: "enforestFormalParameters",
    value: function enforestFormalParameters() {
      var items_187 = [];var rest_188 = null;while (this.rest.size !== 0) {
        var lookahead = this.peek();if (this.isPunctuator(lookahead, "...")) {
          this.matchPunctuator("...");rest_188 = this.enforestBindingIdentifier();break;
        }items_187.push(this.enforestParam());this.consumeComma();
      }return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_187), rest: rest_188 });
    }
  }, {
    key: "enforestParam",
    value: function enforestParam() {
      return this.enforestBindingElement();
    }
  }, {
    key: "enforestUpdateExpression",
    value: function enforestUpdateExpression() {
      var operator_189 = this.matchUnaryOperator();return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_189.val(), operand: this.transformDestructuring(this.term) });
    }
  }, {
    key: "enforestUnaryExpression",
    value: function enforestUnaryExpression() {
      var _this2 = this;

      var operator_190 = this.matchUnaryOperator();this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });this.opCtx.prec = 14;this.opCtx.combine = function (rightTerm) {
        var type_191 = void 0,
            term_192 = void 0,
            isPrefix_193 = void 0;if (operator_190.val() === "++" || operator_190.val() === "--") {
          type_191 = "UpdateExpression";term_192 = _this2.transformDestructuring(rightTerm);isPrefix_193 = true;
        } else {
          type_191 = "UnaryExpression";isPrefix_193 = undefined;term_192 = rightTerm;
        }return new _terms2.default(type_191, { operator: operator_190.val(), operand: term_192, isPrefix: isPrefix_193 });
      };return EXPR_LOOP_OPERATOR_23;
    }
  }, {
    key: "enforestConditionalExpression",
    value: function enforestConditionalExpression() {
      var test_194 = this.opCtx.combine(this.term);if (this.opCtx.stack.size > 0) {
        var _opCtx$stack$last2 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last2.prec;
        var combine = _opCtx$stack$last2.combine;
        this.opCtx.stack = this.opCtx.stack.pop();this.opCtx.prec = prec;this.opCtx.combine = combine;
      }this.matchPunctuator("?");var enf_195 = new Enforester(this.rest, (0, _immutable.List)(), this.context);var consequent_196 = enf_195.enforestExpressionLoop();enf_195.matchPunctuator(":");enf_195 = new Enforester(enf_195.rest, (0, _immutable.List)(), this.context);var alternate_197 = enf_195.enforestExpressionLoop();this.rest = enf_195.rest;return new _terms2.default("ConditionalExpression", { test: test_194, consequent: consequent_196, alternate: alternate_197 });
    }
  }, {
    key: "enforestBinaryExpression",
    value: function enforestBinaryExpression() {
      var leftTerm_198 = this.term;var opStx_199 = this.peek();var op_200 = opStx_199.val();var opPrec_201 = (0, _operators.getOperatorPrec)(op_200);var opAssoc_202 = (0, _operators.getOperatorAssoc)(op_200);if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_201, opAssoc_202)) {
        this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });this.opCtx.prec = opPrec_201;this.opCtx.combine = function (rightTerm) {
          return new _terms2.default("BinaryExpression", { left: leftTerm_198, operator: opStx_199, right: rightTerm });
        };this.advance();return EXPR_LOOP_OPERATOR_23;
      } else {
        var term = this.opCtx.combine(leftTerm_198);
        var _opCtx$stack$last3 = this.opCtx.stack.last();

        var prec = _opCtx$stack$last3.prec;
        var combine = _opCtx$stack$last3.combine;
        this.opCtx.stack = this.opCtx.stack.pop();this.opCtx.prec = prec;this.opCtx.combine = combine;return term;
      }
    }
  }, {
    key: "enforestTemplateElements",
    value: function enforestTemplateElements() {
      var _this3 = this;

      var lookahead_203 = this.matchTemplate();var elements_204 = lookahead_203.token.items.map(function (it) {
        if (it instanceof _syntax2.default && it.isDelimiter()) {
          var enf = new Enforester(it.inner(), (0, _immutable.List)(), _this3.context);return enf.enforest("expression");
        }return new _terms2.default("TemplateElement", { rawValue: it.slice.text });
      });return elements_204;
    }
  }, {
    key: "expandMacro",
    value: function expandMacro(enforestType_205) {
      var _this4 = this;

      var name_206 = this.advance();var syntaxTransform_207 = this.getCompiletimeTransform(name_206);if (syntaxTransform_207 == null || typeof syntaxTransform_207.value !== "function") {
        throw this.createError(name_206, "the macro name was not bound to a value that could be invoked");
      }var useSiteScope_208 = (0, _scope.freshScope)("u");var introducedScope_209 = (0, _scope.freshScope)("i");this.context.useScope = useSiteScope_208;var ctx_210 = new _macroContext2.default(this, name_206, this.context, useSiteScope_208, introducedScope_209);var result_211 = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform_207.value.call(null, ctx_210));if (!_immutable.List.isList(result_211)) {
        throw this.createError(name_206, "macro must return a list but got: " + result_211);
      }result_211 = result_211.map(function (stx) {
        if (!(stx && typeof stx.addScope === "function")) {
          throw _this4.createError(name_206, "macro must return syntax objects or terms but got: " + stx);
        }return stx.addScope(introducedScope_209, _this4.context.bindings, { flip: true });
      });return result_211;
    }
  }, {
    key: "consumeSemicolon",
    value: function consumeSemicolon() {
      var lookahead_212 = this.peek();if (lookahead_212 && this.isPunctuator(lookahead_212, ";")) {
        this.advance();
      }
    }
  }, {
    key: "consumeComma",
    value: function consumeComma() {
      var lookahead_213 = this.peek();if (lookahead_213 && this.isPunctuator(lookahead_213, ",")) {
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
        switch (term_228.val()) {case "=":case "|=":case "^=":case "&=":case "<<=":case ">>=":case ">>>=":case "+=":case "-=":case "*=":case "/=":case "%=":
            return true;default:
            return false;}
      }return false;
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
      }return this.context.store.get(term_257.resolve());
    }
  }, {
    key: "lineNumberEq",
    value: function lineNumberEq(a_258, b_259) {
      if (!(a_258 && b_259)) {
        return false;
      }(0, _errors.assert)(a_258 instanceof _syntax2.default, "expecting a syntax object");(0, _errors.assert)(b_259 instanceof _syntax2.default, "expecting a syntax object");return a_258.lineNumber() === b_259.lineNumber();
    }
  }, {
    key: "matchIdentifier",
    value: function matchIdentifier(val_260) {
      var lookahead_261 = this.advance();if (this.isIdentifier(lookahead_261)) {
        return lookahead_261;
      }throw this.createError(lookahead_261, "expecting an identifier");
    }
  }, {
    key: "matchKeyword",
    value: function matchKeyword(val_262) {
      var lookahead_263 = this.advance();if (this.isKeyword(lookahead_263, val_262)) {
        return lookahead_263;
      }throw this.createError(lookahead_263, "expecting " + val_262);
    }
  }, {
    key: "matchLiteral",
    value: function matchLiteral() {
      var lookahead_264 = this.advance();if (this.isNumericLiteral(lookahead_264) || this.isStringLiteral(lookahead_264) || this.isBooleanLiteral(lookahead_264) || this.isNullLiteral(lookahead_264) || this.isTemplate(lookahead_264) || this.isRegularExpression(lookahead_264)) {
        return lookahead_264;
      }throw this.createError(lookahead_264, "expecting a literal");
    }
  }, {
    key: "matchStringLiteral",
    value: function matchStringLiteral() {
      var lookahead_265 = this.advance();if (this.isStringLiteral(lookahead_265)) {
        return lookahead_265;
      }throw this.createError(lookahead_265, "expecting a string literal");
    }
  }, {
    key: "matchTemplate",
    value: function matchTemplate() {
      var lookahead_266 = this.advance();if (this.isTemplate(lookahead_266)) {
        return lookahead_266;
      }throw this.createError(lookahead_266, "expecting a template literal");
    }
  }, {
    key: "matchParens",
    value: function matchParens() {
      var lookahead_267 = this.advance();if (this.isParens(lookahead_267)) {
        return lookahead_267.inner();
      }throw this.createError(lookahead_267, "expecting parens");
    }
  }, {
    key: "matchCurlies",
    value: function matchCurlies() {
      var lookahead_268 = this.advance();if (this.isBraces(lookahead_268)) {
        return lookahead_268.inner();
      }throw this.createError(lookahead_268, "expecting curly braces");
    }
  }, {
    key: "matchSquares",
    value: function matchSquares() {
      var lookahead_269 = this.advance();if (this.isBrackets(lookahead_269)) {
        return lookahead_269.inner();
      }throw this.createError(lookahead_269, "expecting sqaure braces");
    }
  }, {
    key: "matchUnaryOperator",
    value: function matchUnaryOperator() {
      var lookahead_270 = this.advance();if ((0, _operators.isUnaryOperator)(lookahead_270)) {
        return lookahead_270;
      }throw this.createError(lookahead_270, "expecting a unary operator");
    }
  }, {
    key: "matchPunctuator",
    value: function matchPunctuator(val_271) {
      var lookahead_272 = this.advance();if (this.isPunctuator(lookahead_272)) {
        if (typeof val_271 !== "undefined") {
          if (lookahead_272.val() === val_271) {
            return lookahead_272;
          } else {
            throw this.createError(lookahead_272, "expecting a " + val_271 + " punctuator");
          }
        }return lookahead_272;
      }throw this.createError(lookahead_272, "expecting a punctuator");
    }
  }, {
    key: "createError",
    value: function createError(stx_273, message_274) {
      var ctx_275 = "";var offending_276 = stx_273;if (this.rest.size > 0) {
        ctx_275 = this.rest.slice(0, 20).map(function (term) {
          if (term.isDelimiter()) {
            return term.inner();
          }return _immutable.List.of(term);
        }).flatten().map(function (s) {
          if (s === offending_276) {
            return "__" + s.val() + "__";
          }return s.val();
        }).join(" ");
      } else {
        ctx_275 = offending_276.toString();
      }return new Error(message_274 + "\n" + ctx_275);
    }
  }]);

  return Enforester;
}();
//# sourceMappingURL=enforester.js.map
