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

const Just_41 = _ramdaFantasy.Maybe.Just;
const Nothing_42 = _ramdaFantasy.Maybe.Nothing;
const EXPR_LOOP_OPERATOR_43 = {};
const EXPR_LOOP_NO_CHANGE_44 = {};
const EXPR_LOOP_EXPANSION_45 = {};
class Enforester_46 {
  constructor(stxl_47, prev_48, context_49) {
    this.done = false;
    (0, _errors.assert)(_immutable.List.isList(stxl_47), "expecting a list of terms to enforest");
    (0, _errors.assert)(_immutable.List.isList(prev_48), "expecting a list of terms to enforest");
    (0, _errors.assert)(context_49, "expecting a context to enforest");
    this.term = null;
    this.rest = stxl_47;
    this.prev = prev_48;
    this.context = context_49;
  }
  peek() {
    let n_50 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    return this.rest.get(n_50);
  }
  advance() {
    let ret_51 = this.rest.first();
    this.rest = this.rest.rest();
    return ret_51;
  }
  enforest() {
    let type_52 = arguments.length <= 0 || arguments[0] === undefined ? "Module" : arguments[0];

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
    let result_53;
    if (type_52 === "expression") {
      result_53 = this.enforestExpressionLoop();
    } else {
      result_53 = this.enforestModule();
    }
    if (this.rest.size === 0) {
      this.done = true;
    }
    return result_53;
  }
  enforestModule() {
    return this.enforestBody();
  }
  enforestBody() {
    return this.enforestModuleItem();
  }
  enforestModuleItem() {
    let lookahead_54 = this.peek();
    if (this.isKeyword(lookahead_54, "import")) {
      this.advance();
      return this.enforestImportDeclaration();
    } else if (this.isKeyword(lookahead_54, "export")) {
      this.advance();
      return this.enforestExportDeclaration();
    } else if (this.isIdentifier(lookahead_54, "#")) {
      return this.enforestLanguagePragma();
    }
    return this.enforestStatement();
  }
  enforestLanguagePragma() {
    this.matchIdentifier("#");
    this.matchIdentifier("lang");
    let path_55 = this.matchStringLiteral();
    this.consumeSemicolon();
    return new _terms2.default("Pragma", { kind: "lang", items: _immutable.List.of(path_55) });
  }
  enforestExportDeclaration() {
    let lookahead_56 = this.peek();
    if (this.isPunctuator(lookahead_56, "*")) {
      this.advance();
      let moduleSpecifier = this.enforestFromClause();
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier });
    } else if (this.isBraces(lookahead_56)) {
      let namedExports = this.enforestExportClause();
      let moduleSpecifier = null;
      if (this.isIdentifier(this.peek(), "from")) {
        moduleSpecifier = this.enforestFromClause();
      }
      return new _terms2.default("ExportFrom", { namedExports: namedExports, moduleSpecifier: moduleSpecifier });
    } else if (this.isKeyword(lookahead_56, "class")) {
      return new _terms2.default("Export", { declaration: this.enforestClass({ isExpr: false }) });
    } else if (this.isFnDeclTransform(lookahead_56)) {
      return new _terms2.default("Export", { declaration: this.enforestFunction({ isExpr: false, inDefault: false }) });
    } else if (this.isKeyword(lookahead_56, "default")) {
      this.advance();
      if (this.isFnDeclTransform(this.peek())) {
        return new _terms2.default("ExportDefault", { body: this.enforestFunction({ isExpr: false, inDefault: true }) });
      } else if (this.isKeyword(this.peek(), "class")) {
        return new _terms2.default("ExportDefault", { body: this.enforestClass({ isExpr: false, inDefault: true }) });
      } else {
        let body = this.enforestExpressionLoop();
        this.consumeSemicolon();
        return new _terms2.default("ExportDefault", { body: body });
      }
    } else if (this.isVarDeclTransform(lookahead_56) || this.isLetDeclTransform(lookahead_56) || this.isConstDeclTransform(lookahead_56) || this.isSyntaxrecDeclTransform(lookahead_56) || this.isSyntaxDeclTransform(lookahead_56)) {
      return new _terms2.default("Export", { declaration: this.enforestVariableDeclaration() });
    }
    throw this.createError(lookahead_56, "unexpected syntax");
  }
  enforestExportClause() {
    let enf_57 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_58 = [];
    while (enf_57.rest.size !== 0) {
      result_58.push(enf_57.enforestExportSpecifier());
      enf_57.consumeComma();
    }
    return (0, _immutable.List)(result_58);
  }
  enforestExportSpecifier() {
    let name_59 = this.enforestIdentifier();
    if (this.isIdentifier(this.peek(), "as")) {
      this.advance();
      let exportedName = this.enforestIdentifier();
      return new _terms2.default("ExportSpecifier", { name: name_59, exportedName: exportedName });
    }
    return new _terms2.default("ExportSpecifier", { name: null, exportedName: name_59 });
  }
  enforestImportDeclaration() {
    let lookahead_60 = this.peek();
    let defaultBinding_61 = null;
    let namedImports_62 = (0, _immutable.List)();
    let forSyntax_63 = false;
    if (this.isStringLiteral(lookahead_60)) {
      let moduleSpecifier = this.advance();
      this.consumeSemicolon();
      return new _terms2.default("Import", { defaultBinding: defaultBinding_61, namedImports: namedImports_62, moduleSpecifier: moduleSpecifier });
    }
    if (this.isIdentifier(lookahead_60) || this.isKeyword(lookahead_60)) {
      defaultBinding_61 = this.enforestBindingIdentifier();
      if (!this.isPunctuator(this.peek(), ",")) {
        let moduleSpecifier = this.enforestFromClause();
        if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
          this.advance();
          this.advance();
          forSyntax_63 = true;
        }
        return new _terms2.default("Import", { defaultBinding: defaultBinding_61, moduleSpecifier: moduleSpecifier, namedImports: (0, _immutable.List)(), forSyntax: forSyntax_63 });
      }
    }
    this.consumeComma();
    lookahead_60 = this.peek();
    if (this.isBraces(lookahead_60)) {
      let imports = this.enforestNamedImports();
      let fromClause = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_63 = true;
      }
      return new _terms2.default("Import", { defaultBinding: defaultBinding_61, forSyntax: forSyntax_63, namedImports: imports, moduleSpecifier: fromClause });
    } else if (this.isPunctuator(lookahead_60, "*")) {
      let namespaceBinding = this.enforestNamespaceBinding();
      let moduleSpecifier = this.enforestFromClause();
      if (this.isKeyword(this.peek(), "for") && this.isIdentifier(this.peek(1), "syntax")) {
        this.advance();
        this.advance();
        forSyntax_63 = true;
      }
      return new _terms2.default("ImportNamespace", { defaultBinding: defaultBinding_61, forSyntax: forSyntax_63, namespaceBinding: namespaceBinding, moduleSpecifier: moduleSpecifier });
    }
    throw this.createError(lookahead_60, "unexpected syntax");
  }
  enforestNamespaceBinding() {
    this.matchPunctuator("*");
    this.matchIdentifier("as");
    return this.enforestBindingIdentifier();
  }
  enforestNamedImports() {
    let enf_64 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let result_65 = [];
    while (enf_64.rest.size !== 0) {
      result_65.push(enf_64.enforestImportSpecifiers());
      enf_64.consumeComma();
    }
    return (0, _immutable.List)(result_65);
  }
  enforestImportSpecifiers() {
    let lookahead_66 = this.peek();
    let name_67;
    if (this.isIdentifier(lookahead_66) || this.isKeyword(lookahead_66)) {
      name_67 = this.advance();
      if (!this.isIdentifier(this.peek(), "as")) {
        return new _terms2.default("ImportSpecifier", { name: null, binding: new _terms2.default("BindingIdentifier", { name: name_67 }) });
      } else {
        this.matchIdentifier("as");
      }
    } else {
      throw this.createError(lookahead_66, "unexpected token in import specifier");
    }
    return new _terms2.default("ImportSpecifier", { name: name_67, binding: this.enforestBindingIdentifier() });
  }
  enforestFromClause() {
    this.matchIdentifier("from");
    let lookahead_68 = this.matchStringLiteral();
    this.consumeSemicolon();
    return lookahead_68;
  }
  enforestStatementListItem() {
    let lookahead_69 = this.peek();
    if (this.isFnDeclTransform(lookahead_69)) {
      return this.enforestFunctionDeclaration({ isExpr: false });
    } else if (this.isKeyword(lookahead_69, "class")) {
      return this.enforestClass({ isExpr: false });
    } else {
      return this.enforestStatement();
    }
  }
  enforestStatement() {
    let lookahead_70 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_70)) {
      this.expandMacro();
      lookahead_70 = this.peek();
    }
    if (this.term === null && this.isTerm(lookahead_70)) {
      return this.advance();
    }
    if (this.term === null && this.isBraces(lookahead_70)) {
      return this.enforestBlockStatement();
    }
    if (this.term === null && this.isWhileTransform(lookahead_70)) {
      return this.enforestWhileStatement();
    }
    if (this.term === null && this.isIfTransform(lookahead_70)) {
      return this.enforestIfStatement();
    }
    if (this.term === null && this.isForTransform(lookahead_70)) {
      return this.enforestForStatement();
    }
    if (this.term === null && this.isSwitchTransform(lookahead_70)) {
      return this.enforestSwitchStatement();
    }
    if (this.term === null && this.isBreakTransform(lookahead_70)) {
      return this.enforestBreakStatement();
    }
    if (this.term === null && this.isContinueTransform(lookahead_70)) {
      return this.enforestContinueStatement();
    }
    if (this.term === null && this.isDoTransform(lookahead_70)) {
      return this.enforestDoStatement();
    }
    if (this.term === null && this.isDebuggerTransform(lookahead_70)) {
      return this.enforestDebuggerStatement();
    }
    if (this.term === null && this.isWithTransform(lookahead_70)) {
      return this.enforestWithStatement();
    }
    if (this.term === null && this.isTryTransform(lookahead_70)) {
      return this.enforestTryStatement();
    }
    if (this.term === null && this.isThrowTransform(lookahead_70)) {
      return this.enforestThrowStatement();
    }
    if (this.term === null && this.isKeyword(lookahead_70, "class")) {
      return this.enforestClass({ isExpr: false });
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_70)) {
      return this.enforestFunctionDeclaration();
    }
    if (this.term === null && this.isIdentifier(lookahead_70) && this.isPunctuator(this.peek(1), ":")) {
      return this.enforestLabeledStatement();
    }
    if (this.term === null && (this.isVarDeclTransform(lookahead_70) || this.isLetDeclTransform(lookahead_70) || this.isConstDeclTransform(lookahead_70) || this.isSyntaxrecDeclTransform(lookahead_70) || this.isSyntaxDeclTransform(lookahead_70))) {
      let stmt = new _terms2.default("VariableDeclarationStatement", { declaration: this.enforestVariableDeclaration() });
      this.consumeSemicolon();
      return stmt;
    }
    if (this.term === null && this.isReturnStmtTransform(lookahead_70)) {
      return this.enforestReturnStatement();
    }
    if (this.term === null && this.isPunctuator(lookahead_70, ";")) {
      this.advance();
      return new _terms2.default("EmptyStatement", {});
    }
    return this.enforestExpressionStatement();
  }
  enforestLabeledStatement() {
    let label_71 = this.matchIdentifier();
    let punc_72 = this.matchPunctuator(":");
    let stmt_73 = this.enforestStatement();
    return new _terms2.default("LabeledStatement", { label: label_71, body: stmt_73 });
  }
  enforestBreakStatement() {
    this.matchKeyword("break");
    let lookahead_74 = this.peek();
    let label_75 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_74, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("BreakStatement", { label: label_75 });
    }
    if (this.isIdentifier(lookahead_74) || this.isKeyword(lookahead_74, "yield") || this.isKeyword(lookahead_74, "let")) {
      label_75 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("BreakStatement", { label: label_75 });
  }
  enforestTryStatement() {
    this.matchKeyword("try");
    let body_76 = this.enforestBlock();
    if (this.isKeyword(this.peek(), "catch")) {
      let catchClause = this.enforestCatchClause();
      if (this.isKeyword(this.peek(), "finally")) {
        this.advance();
        let finalizer = this.enforestBlock();
        return new _terms2.default("TryFinallyStatement", { body: body_76, catchClause: catchClause, finalizer: finalizer });
      }
      return new _terms2.default("TryCatchStatement", { body: body_76, catchClause: catchClause });
    }
    if (this.isKeyword(this.peek(), "finally")) {
      this.advance();
      let finalizer = this.enforestBlock();
      return new _terms2.default("TryFinallyStatement", { body: body_76, catchClause: null, finalizer: finalizer });
    }
    throw this.createError(this.peek(), "try with no catch or finally");
  }
  enforestCatchClause() {
    this.matchKeyword("catch");
    let bindingParens_77 = this.matchParens();
    let enf_78 = new Enforester_46(bindingParens_77, (0, _immutable.List)(), this.context);
    let binding_79 = enf_78.enforestBindingTarget();
    let body_80 = this.enforestBlock();
    return new _terms2.default("CatchClause", { binding: binding_79, body: body_80 });
  }
  enforestThrowStatement() {
    this.matchKeyword("throw");
    let expression_81 = this.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("ThrowStatement", { expression: expression_81 });
  }
  enforestWithStatement() {
    this.matchKeyword("with");
    let objParens_82 = this.matchParens();
    let enf_83 = new Enforester_46(objParens_82, (0, _immutable.List)(), this.context);
    let object_84 = enf_83.enforestExpression();
    let body_85 = this.enforestStatement();
    return new _terms2.default("WithStatement", { object: object_84, body: body_85 });
  }
  enforestDebuggerStatement() {
    this.matchKeyword("debugger");
    return new _terms2.default("DebuggerStatement", {});
  }
  enforestDoStatement() {
    this.matchKeyword("do");
    let body_86 = this.enforestStatement();
    this.matchKeyword("while");
    let testBody_87 = this.matchParens();
    let enf_88 = new Enforester_46(testBody_87, (0, _immutable.List)(), this.context);
    let test_89 = enf_88.enforestExpression();
    this.consumeSemicolon();
    return new _terms2.default("DoWhileStatement", { body: body_86, test: test_89 });
  }
  enforestContinueStatement() {
    let kwd_90 = this.matchKeyword("continue");
    let lookahead_91 = this.peek();
    let label_92 = null;
    if (this.rest.size === 0 || this.isPunctuator(lookahead_91, ";")) {
      this.consumeSemicolon();
      return new _terms2.default("ContinueStatement", { label: label_92 });
    }
    if (this.lineNumberEq(kwd_90, lookahead_91) && (this.isIdentifier(lookahead_91) || this.isKeyword(lookahead_91, "yield") || this.isKeyword(lookahead_91, "let"))) {
      label_92 = this.enforestIdentifier();
    }
    this.consumeSemicolon();
    return new _terms2.default("ContinueStatement", { label: label_92 });
  }
  enforestSwitchStatement() {
    this.matchKeyword("switch");
    let cond_93 = this.matchParens();
    let enf_94 = new Enforester_46(cond_93, (0, _immutable.List)(), this.context);
    let discriminant_95 = enf_94.enforestExpression();
    let body_96 = this.matchCurlies();
    if (body_96.size === 0) {
      return new _terms2.default("SwitchStatement", { discriminant: discriminant_95, cases: (0, _immutable.List)() });
    }
    enf_94 = new Enforester_46(body_96, (0, _immutable.List)(), this.context);
    let cases_97 = enf_94.enforestSwitchCases();
    let lookahead_98 = enf_94.peek();
    if (enf_94.isKeyword(lookahead_98, "default")) {
      let defaultCase = enf_94.enforestSwitchDefault();
      let postDefaultCases = enf_94.enforestSwitchCases();
      return new _terms2.default("SwitchStatementWithDefault", { discriminant: discriminant_95, preDefaultCases: cases_97, defaultCase: defaultCase, postDefaultCases: postDefaultCases });
    }
    return new _terms2.default("SwitchStatement", { discriminant: discriminant_95, cases: cases_97 });
  }
  enforestSwitchCases() {
    let cases_99 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default"))) {
      cases_99.push(this.enforestSwitchCase());
    }
    return (0, _immutable.List)(cases_99);
  }
  enforestSwitchCase() {
    this.matchKeyword("case");
    return new _terms2.default("SwitchCase", { test: this.enforestExpression(), consequent: this.enforestSwitchCaseBody() });
  }
  enforestSwitchCaseBody() {
    this.matchPunctuator(":");
    return this.enforestStatementListInSwitchCaseBody();
  }
  enforestStatementListInSwitchCaseBody() {
    let result_100 = [];
    while (!(this.rest.size === 0 || this.isKeyword(this.peek(), "default") || this.isKeyword(this.peek(), "case"))) {
      result_100.push(this.enforestStatementListItem());
    }
    return (0, _immutable.List)(result_100);
  }
  enforestSwitchDefault() {
    this.matchKeyword("default");
    return new _terms2.default("SwitchDefault", { consequent: this.enforestSwitchCaseBody() });
  }
  enforestForStatement() {
    this.matchKeyword("for");
    let cond_101 = this.matchParens();
    let enf_102 = new Enforester_46(cond_101, (0, _immutable.List)(), this.context);
    let lookahead_103, test_104, init_105, right_106, type_107, left_108, update_109;
    if (enf_102.isPunctuator(enf_102.peek(), ";")) {
      enf_102.advance();
      if (!enf_102.isPunctuator(enf_102.peek(), ";")) {
        test_104 = enf_102.enforestExpression();
      }
      enf_102.matchPunctuator(";");
      if (enf_102.rest.size !== 0) {
        right_106 = enf_102.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: null, test: test_104, update: right_106, body: this.enforestStatement() });
    } else {
      lookahead_103 = enf_102.peek();
      if (enf_102.isVarDeclTransform(lookahead_103) || enf_102.isLetDeclTransform(lookahead_103) || enf_102.isConstDeclTransform(lookahead_103)) {
        init_105 = enf_102.enforestVariableDeclaration();
        lookahead_103 = enf_102.peek();
        if (this.isKeyword(lookahead_103, "in") || this.isIdentifier(lookahead_103, "of")) {
          if (this.isKeyword(lookahead_103, "in")) {
            enf_102.advance();
            right_106 = enf_102.enforestExpression();
            type_107 = "ForInStatement";
          } else if (this.isIdentifier(lookahead_103, "of")) {
            enf_102.advance();
            right_106 = enf_102.enforestExpression();
            type_107 = "ForOfStatement";
          }
          return new _terms2.default(type_107, { left: init_105, right: right_106, body: this.enforestStatement() });
        }
        enf_102.matchPunctuator(";");
        if (enf_102.isPunctuator(enf_102.peek(), ";")) {
          enf_102.advance();
          test_104 = null;
        } else {
          test_104 = enf_102.enforestExpression();
          enf_102.matchPunctuator(";");
        }
        update_109 = enf_102.enforestExpression();
      } else {
        if (this.isKeyword(enf_102.peek(1), "in") || this.isIdentifier(enf_102.peek(1), "of")) {
          left_108 = enf_102.enforestBindingIdentifier();
          let kind = enf_102.advance();
          if (this.isKeyword(kind, "in")) {
            type_107 = "ForInStatement";
          } else {
            type_107 = "ForOfStatement";
          }
          right_106 = enf_102.enforestExpression();
          return new _terms2.default(type_107, { left: left_108, right: right_106, body: this.enforestStatement() });
        }
        init_105 = enf_102.enforestExpression();
        enf_102.matchPunctuator(";");
        if (enf_102.isPunctuator(enf_102.peek(), ";")) {
          enf_102.advance();
          test_104 = null;
        } else {
          test_104 = enf_102.enforestExpression();
          enf_102.matchPunctuator(";");
        }
        update_109 = enf_102.enforestExpression();
      }
      return new _terms2.default("ForStatement", { init: init_105, test: test_104, update: update_109, body: this.enforestStatement() });
    }
  }
  enforestIfStatement() {
    this.matchKeyword("if");
    let cond_110 = this.matchParens();
    let enf_111 = new Enforester_46(cond_110, (0, _immutable.List)(), this.context);
    let lookahead_112 = enf_111.peek();
    let test_113 = enf_111.enforestExpression();
    if (test_113 === null) {
      throw enf_111.createError(lookahead_112, "expecting an expression");
    }
    let consequent_114 = this.enforestStatement();
    let alternate_115 = null;
    if (this.isKeyword(this.peek(), "else")) {
      this.advance();
      alternate_115 = this.enforestStatement();
    }
    return new _terms2.default("IfStatement", { test: test_113, consequent: consequent_114, alternate: alternate_115 });
  }
  enforestWhileStatement() {
    this.matchKeyword("while");
    let cond_116 = this.matchParens();
    let enf_117 = new Enforester_46(cond_116, (0, _immutable.List)(), this.context);
    let lookahead_118 = enf_117.peek();
    let test_119 = enf_117.enforestExpression();
    if (test_119 === null) {
      throw enf_117.createError(lookahead_118, "expecting an expression");
    }
    let body_120 = this.enforestStatement();
    return new _terms2.default("WhileStatement", { test: test_119, body: body_120 });
  }
  enforestBlockStatement() {
    return new _terms2.default("BlockStatement", { block: this.enforestBlock() });
  }
  enforestBlock() {
    return new _terms2.default("Block", { statements: this.matchCurlies() });
  }
  enforestClass(_ref) {
    let isExpr = _ref.isExpr;
    let inDefault = _ref.inDefault;

    let kw_121 = this.advance();
    let name_122 = null,
        supr_123 = null;
    let type_124 = isExpr ? "ClassExpression" : "ClassDeclaration";
    if (this.isIdentifier(this.peek())) {
      name_122 = this.enforestBindingIdentifier();
    } else if (!isExpr) {
      if (inDefault) {
        name_122 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("_default", kw_121) });
      } else {
        throw this.createError(this.peek(), "unexpected syntax");
      }
    }
    if (this.isKeyword(this.peek(), "extends")) {
      this.advance();
      supr_123 = this.enforestExpressionLoop();
    }
    let elements_125 = [];
    let enf_126 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    while (enf_126.rest.size !== 0) {
      if (enf_126.isPunctuator(enf_126.peek(), ";")) {
        enf_126.advance();
        continue;
      }
      let isStatic = false;

      var _enf_126$enforestMeth = enf_126.enforestMethodDefinition();

      let methodOrKey = _enf_126$enforestMeth.methodOrKey;
      let kind = _enf_126$enforestMeth.kind;

      if (kind === "identifier" && methodOrKey.value.val() === "static") {
        isStatic = true;

        var _enf_126$enforestMeth2 = enf_126.enforestMethodDefinition();

        methodOrKey = _enf_126$enforestMeth2.methodOrKey;
        kind = _enf_126$enforestMeth2.kind;
      }
      if (kind === "method") {
        elements_125.push(new _terms2.default("ClassElement", { isStatic: isStatic, method: methodOrKey }));
      } else {
        throw this.createError(enf_126.peek(), "Only methods are allowed in classes");
      }
    }
    return new _terms2.default(type_124, { name: name_122, super: supr_123, elements: (0, _immutable.List)(elements_125) });
  }
  enforestBindingTarget() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref2.allowPunctuator;

    let lookahead_127 = this.peek();
    if (this.isIdentifier(lookahead_127) || this.isKeyword(lookahead_127) || allowPunctuator && this.isPunctuator(lookahead_127)) {
      return this.enforestBindingIdentifier({ allowPunctuator: allowPunctuator });
    } else if (this.isBrackets(lookahead_127)) {
      return this.enforestArrayBinding();
    } else if (this.isBraces(lookahead_127)) {
      return this.enforestObjectBinding();
    }
    (0, _errors.assert)(false, "not implemented yet");
  }
  enforestObjectBinding() {
    let enf_128 = new Enforester_46(this.matchCurlies(), (0, _immutable.List)(), this.context);
    let properties_129 = [];
    while (enf_128.rest.size !== 0) {
      properties_129.push(enf_128.enforestBindingProperty());
      enf_128.consumeComma();
    }
    return new _terms2.default("ObjectBinding", { properties: (0, _immutable.List)(properties_129) });
  }
  enforestBindingProperty() {
    let lookahead_130 = this.peek();

    var _enforestPropertyName = this.enforestPropertyName();

    let name = _enforestPropertyName.name;
    let binding = _enforestPropertyName.binding;

    if (this.isIdentifier(lookahead_130) || this.isKeyword(lookahead_130, "let") || this.isKeyword(lookahead_130, "yield")) {
      if (!this.isPunctuator(this.peek(), ":")) {
        let defaultValue = null;
        if (this.isAssign(this.peek())) {
          this.advance();
          let expr = this.enforestExpressionLoop();
          defaultValue = expr;
        }
        return new _terms2.default("BindingPropertyIdentifier", { binding: binding, init: defaultValue });
      }
    }
    this.matchPunctuator(":");
    binding = this.enforestBindingElement();
    return new _terms2.default("BindingPropertyProperty", { name: name, binding: binding });
  }
  enforestArrayBinding() {
    let bracket_131 = this.matchSquares();
    let enf_132 = new Enforester_46(bracket_131, (0, _immutable.List)(), this.context);
    let elements_133 = [],
        restElement_134 = null;
    while (enf_132.rest.size !== 0) {
      let el;
      if (enf_132.isPunctuator(enf_132.peek(), ",")) {
        enf_132.consumeComma();
        el = null;
      } else {
        if (enf_132.isPunctuator(enf_132.peek(), "...")) {
          enf_132.advance();
          restElement_134 = enf_132.enforestBindingTarget();
          break;
        } else {
          el = enf_132.enforestBindingElement();
        }
        enf_132.consumeComma();
      }
      elements_133.push(el);
    }
    return new _terms2.default("ArrayBinding", { elements: (0, _immutable.List)(elements_133), restElement: restElement_134 });
  }
  enforestBindingElement() {
    let binding_135 = this.enforestBindingTarget();
    if (this.isAssign(this.peek())) {
      this.advance();
      let init = this.enforestExpressionLoop();
      binding_135 = new _terms2.default("BindingWithDefault", { binding: binding_135, init: init });
    }
    return binding_135;
  }
  enforestBindingIdentifier() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    let allowPunctuator = _ref3.allowPunctuator;

    let name_136;
    if (allowPunctuator && this.isPunctuator(this.peek())) {
      name_136 = this.enforestPunctuator();
    } else {
      name_136 = this.enforestIdentifier();
    }
    return new _terms2.default("BindingIdentifier", { name: name_136 });
  }
  enforestPunctuator() {
    let lookahead_137 = this.peek();
    if (this.isPunctuator(lookahead_137)) {
      return this.advance();
    }
    throw this.createError(lookahead_137, "expecting a punctuator");
  }
  enforestIdentifier() {
    let lookahead_138 = this.peek();
    if (this.isIdentifier(lookahead_138) || this.isKeyword(lookahead_138)) {
      return this.advance();
    }
    throw this.createError(lookahead_138, "expecting an identifier");
  }
  enforestReturnStatement() {
    let kw_139 = this.advance();
    let lookahead_140 = this.peek();
    if (this.rest.size === 0 || lookahead_140 && !this.lineNumberEq(kw_139, lookahead_140)) {
      return new _terms2.default("ReturnStatement", { expression: null });
    }
    let term_141 = null;
    if (!this.isPunctuator(lookahead_140, ";")) {
      term_141 = this.enforestExpression();
      (0, _errors.expect)(term_141 != null, "Expecting an expression to follow return keyword", lookahead_140, this.rest);
    }
    this.consumeSemicolon();
    return new _terms2.default("ReturnStatement", { expression: term_141 });
  }
  enforestVariableDeclaration() {
    let kind_142;
    let lookahead_143 = this.advance();
    let kindSyn_144 = lookahead_143;
    let phase_145 = this.context.phase;
    if (kindSyn_144 && this.context.env.get(kindSyn_144.resolve(phase_145)) === _transforms.VariableDeclTransform) {
      kind_142 = "var";
    } else if (kindSyn_144 && this.context.env.get(kindSyn_144.resolve(phase_145)) === _transforms.LetDeclTransform) {
      kind_142 = "let";
    } else if (kindSyn_144 && this.context.env.get(kindSyn_144.resolve(phase_145)) === _transforms.ConstDeclTransform) {
      kind_142 = "const";
    } else if (kindSyn_144 && this.context.env.get(kindSyn_144.resolve(phase_145)) === _transforms.SyntaxDeclTransform) {
      kind_142 = "syntax";
    } else if (kindSyn_144 && this.context.env.get(kindSyn_144.resolve(phase_145)) === _transforms.SyntaxrecDeclTransform) {
      kind_142 = "syntaxrec";
    }
    let decls_146 = (0, _immutable.List)();
    while (true) {
      let term = this.enforestVariableDeclarator({ isSyntax: kind_142 === "syntax" || kind_142 === "syntaxrec" });
      let lookahead_143 = this.peek();
      decls_146 = decls_146.concat(term);
      if (this.isPunctuator(lookahead_143, ",")) {
        this.advance();
      } else {
        break;
      }
    }
    return new _terms2.default("VariableDeclaration", { kind: kind_142, declarators: decls_146 });
  }
  enforestVariableDeclarator(_ref4) {
    let isSyntax = _ref4.isSyntax;

    let id_147 = this.enforestBindingTarget({ allowPunctuator: isSyntax });
    let lookahead_148 = this.peek();
    let init_149, rest_150;
    if (this.isPunctuator(lookahead_148, "=")) {
      this.advance();
      let enf = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
      init_149 = enf.enforest("expression");
      this.rest = enf.rest;
    } else {
      init_149 = null;
    }
    return new _terms2.default("VariableDeclarator", { binding: id_147, init: init_149 });
  }
  enforestExpressionStatement() {
    let start_151 = this.rest.get(0);
    let expr_152 = this.enforestExpression();
    if (expr_152 === null) {
      throw this.createError(start_151, "not a valid expression");
    }
    this.consumeSemicolon();
    return new _terms2.default("ExpressionStatement", { expression: expr_152 });
  }
  enforestExpression() {
    let left_153 = this.enforestExpressionLoop();
    let lookahead_154 = this.peek();
    if (this.isPunctuator(lookahead_154, ",")) {
      while (this.rest.size !== 0) {
        if (!this.isPunctuator(this.peek(), ",")) {
          break;
        }
        let operator = this.advance();
        let right = this.enforestExpressionLoop();
        left_153 = new _terms2.default("BinaryExpression", { left: left_153, operator: operator, right: right });
      }
    }
    this.term = null;
    return left_153;
  }
  enforestExpressionLoop() {
    this.term = null;
    this.opCtx = { prec: 0, combine: x_155 => x_155, stack: (0, _immutable.List)() };
    do {
      let term = this.enforestAssignmentExpression();
      if (term === EXPR_LOOP_NO_CHANGE_44 && this.opCtx.stack.size > 0) {
        this.term = this.opCtx.combine(this.term);

        var _opCtx$stack$last = this.opCtx.stack.last();

        let prec = _opCtx$stack$last.prec;
        let combine = _opCtx$stack$last.combine;

        this.opCtx.prec = prec;
        this.opCtx.combine = combine;
        this.opCtx.stack = this.opCtx.stack.pop();
      } else if (term === EXPR_LOOP_NO_CHANGE_44) {
        break;
      } else if (term === EXPR_LOOP_OPERATOR_43 || term === EXPR_LOOP_EXPANSION_45) {
        this.term = null;
      } else {
        this.term = term;
      }
    } while (true);
    return this.term;
  }
  enforestAssignmentExpression() {
    let lookahead_156 = this.peek();
    if (this.term === null && this.isCompiletimeTransform(lookahead_156)) {
      this.expandMacro();
      lookahead_156 = this.peek();
    }
    if (this.term === null && this.isTerm(lookahead_156)) {
      return this.advance();
    }
    if (this.term === null && this.isKeyword(lookahead_156, "yield")) {
      return this.enforestYieldExpression();
    }
    if (this.term === null && this.isKeyword(lookahead_156, "class")) {
      return this.enforestClass({ isExpr: true });
    }
    if (this.term === null && (this.isIdentifier(lookahead_156) || this.isParens(lookahead_156)) && this.isPunctuator(this.peek(1), "=>") && this.lineNumberEq(lookahead_156, this.peek(1))) {
      return this.enforestArrowExpression();
    }
    if (this.term === null && this.isSyntaxTemplate(lookahead_156)) {
      return this.enforestSyntaxTemplate();
    }
    if (this.term === null && this.isSyntaxQuoteTransform(lookahead_156)) {
      return this.enforestSyntaxQuote();
    }
    if (this.term === null && this.isParens(lookahead_156)) {
      return new _terms2.default("ParenthesizedExpression", { inner: this.advance().inner() });
    }
    if (this.term === null && (this.isKeyword(lookahead_156, "this") || this.isIdentifier(lookahead_156) || this.isKeyword(lookahead_156, "let") || this.isKeyword(lookahead_156, "yield") || this.isNumericLiteral(lookahead_156) || this.isStringLiteral(lookahead_156) || this.isTemplate(lookahead_156) || this.isBooleanLiteral(lookahead_156) || this.isNullLiteral(lookahead_156) || this.isRegularExpression(lookahead_156) || this.isFnDeclTransform(lookahead_156) || this.isBraces(lookahead_156) || this.isBrackets(lookahead_156))) {
      return this.enforestPrimaryExpression();
    }
    if (this.term === null && this.isOperator(lookahead_156)) {
      return this.enforestUnaryExpression();
    }
    if (this.term === null && this.isVarBindingTransform(lookahead_156)) {
      let id = this.getFromCompiletimeEnvironment(lookahead_156).id;
      if (id !== lookahead_156) {
        this.advance();
        this.rest = _immutable.List.of(id).concat(this.rest);
        return EXPR_LOOP_EXPANSION_45;
      }
    }
    if (this.term === null && (this.isNewTransform(lookahead_156) || this.isKeyword(lookahead_156, "super")) || this.term && (this.isPunctuator(lookahead_156, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1))) || this.isBrackets(lookahead_156) || this.isParens(lookahead_156))) {
      return this.enforestLeftHandSideExpression({ allowCall: true });
    }
    if (this.term && this.isTemplate(lookahead_156)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term && this.isUpdateOperator(lookahead_156)) {
      return this.enforestUpdateExpression();
    }
    if (this.term && this.isOperator(lookahead_156)) {
      return this.enforestBinaryExpression();
    }
    if (this.term && this.isAssign(lookahead_156)) {
      let binding = this.transformDestructuring(this.term);
      let op = this.advance();
      let enf = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
      let init = enf.enforest("expression");
      this.rest = enf.rest;
      if (op.val() === "=") {
        return new _terms2.default("AssignmentExpression", { binding: binding, expression: init });
      } else {
        return new _terms2.default("CompoundAssignmentExpression", { binding: binding, operator: op.val(), expression: init });
      }
    }
    if (this.term && this.isPunctuator(lookahead_156, "?")) {
      return this.enforestConditionalExpression();
    }
    return EXPR_LOOP_NO_CHANGE_44;
  }
  enforestPrimaryExpression() {
    let lookahead_157 = this.peek();
    if (this.term === null && this.isKeyword(lookahead_157, "this")) {
      return this.enforestThisExpression();
    }
    if (this.term === null && (this.isIdentifier(lookahead_157) || this.isKeyword(lookahead_157, "let") || this.isKeyword(lookahead_157, "yield"))) {
      return this.enforestIdentifierExpression();
    }
    if (this.term === null && this.isNumericLiteral(lookahead_157)) {
      return this.enforestNumericLiteral();
    }
    if (this.term === null && this.isStringLiteral(lookahead_157)) {
      return this.enforestStringLiteral();
    }
    if (this.term === null && this.isTemplate(lookahead_157)) {
      return this.enforestTemplateLiteral();
    }
    if (this.term === null && this.isBooleanLiteral(lookahead_157)) {
      return this.enforestBooleanLiteral();
    }
    if (this.term === null && this.isNullLiteral(lookahead_157)) {
      return this.enforestNullLiteral();
    }
    if (this.term === null && this.isRegularExpression(lookahead_157)) {
      return this.enforestRegularExpressionLiteral();
    }
    if (this.term === null && this.isFnDeclTransform(lookahead_157)) {
      return this.enforestFunctionExpression();
    }
    if (this.term === null && this.isBraces(lookahead_157)) {
      return this.enforestObjectExpression();
    }
    if (this.term === null && this.isBrackets(lookahead_157)) {
      return this.enforestArrayExpression();
    }
    (0, _errors.assert)(false, "Not a primary expression");
  }
  enforestLeftHandSideExpression(_ref5) {
    let allowCall = _ref5.allowCall;

    let lookahead_158 = this.peek();
    if (this.isKeyword(lookahead_158, "super")) {
      this.advance();
      this.term = new _terms2.default("Super", {});
    } else if (this.isNewTransform(lookahead_158)) {
      this.term = this.enforestNewExpression();
    }
    while (true) {
      lookahead_158 = this.peek();
      if (this.isParens(lookahead_158)) {
        if (!allowCall) {
          if (this.term && (0, _terms.isIdentifierExpression)(this.term)) {
            return this.term;
          }
          this.term = this.enforestExpressionLoop();
        } else {
          this.term = this.enforestCallExpression();
        }
      } else if (this.isBrackets(lookahead_158)) {
        this.term = allowCall ? this.enforestComputedMemberExpression() : this.enforestExpressionLoop();
      } else if (this.isPunctuator(lookahead_158, ".") && (this.isIdentifier(this.peek(1)) || this.isKeyword(this.peek(1)))) {
        this.term = this.enforestStaticMemberExpression();
      } else if (this.isTemplate(lookahead_158)) {
        this.term = this.enforestTemplateLiteral();
      } else if (this.isBraces(lookahead_158)) {
        this.term = this.enforestPrimaryExpression();
      } else if (this.isIdentifier(lookahead_158)) {
        this.term = new _terms2.default("IdentifierExpression", { name: this.enforestIdentifier() });
      } else {
        break;
      }
    }
    return this.term;
  }
  enforestBooleanLiteral() {
    return new _terms2.default("LiteralBooleanExpression", { value: this.advance() });
  }
  enforestTemplateLiteral() {
    return new _terms2.default("TemplateExpression", { tag: this.term, elements: this.enforestTemplateElements() });
  }
  enforestStringLiteral() {
    return new _terms2.default("LiteralStringExpression", { value: this.advance() });
  }
  enforestNumericLiteral() {
    let num_159 = this.advance();
    if (num_159.val() === 1 / 0) {
      return new _terms2.default("LiteralInfinityExpression", {});
    }
    return new _terms2.default("LiteralNumericExpression", { value: num_159 });
  }
  enforestIdentifierExpression() {
    return new _terms2.default("IdentifierExpression", { name: this.advance() });
  }
  enforestRegularExpressionLiteral() {
    let reStx_160 = this.advance();
    let lastSlash_161 = reStx_160.token.value.lastIndexOf("/");
    let pattern_162 = reStx_160.token.value.slice(1, lastSlash_161);
    let flags_163 = reStx_160.token.value.slice(lastSlash_161 + 1);
    return new _terms2.default("LiteralRegExpExpression", { pattern: pattern_162, flags: flags_163 });
  }
  enforestNullLiteral() {
    this.advance();
    return new _terms2.default("LiteralNullExpression", {});
  }
  enforestThisExpression() {
    return new _terms2.default("ThisExpression", { stx: this.advance() });
  }
  enforestArgumentList() {
    let result_164 = [];
    while (this.rest.size > 0) {
      let arg;
      if (this.isPunctuator(this.peek(), "...")) {
        this.advance();
        arg = new _terms2.default("SpreadElement", { expression: this.enforestExpressionLoop() });
      } else {
        arg = this.enforestExpressionLoop();
      }
      if (this.rest.size > 0) {
        this.matchPunctuator(",");
      }
      result_164.push(arg);
    }
    return (0, _immutable.List)(result_164);
  }
  enforestNewExpression() {
    this.matchKeyword("new");
    if (this.isPunctuator(this.peek(), ".") && this.isIdentifier(this.peek(1), "target")) {
      this.advance();
      this.advance();
      return new _terms2.default("NewTargetExpression", {});
    }
    let callee_165 = this.enforestLeftHandSideExpression({ allowCall: false });
    let args_166;
    if (this.isParens(this.peek())) {
      args_166 = this.matchParens();
    } else {
      args_166 = (0, _immutable.List)();
    }
    return new _terms2.default("NewExpression", { callee: callee_165, arguments: args_166 });
  }
  enforestComputedMemberExpression() {
    let enf_167 = new Enforester_46(this.matchSquares(), (0, _immutable.List)(), this.context);
    return new _terms2.default("ComputedMemberExpression", { object: this.term, expression: enf_167.enforestExpression() });
  }
  transformDestructuring(term_168) {
    switch (term_168.type) {
      case "IdentifierExpression":
        return new _terms2.default("BindingIdentifier", { name: term_168.name });
      case "ParenthesizedExpression":
        if (term_168.inner.size === 1 && this.isIdentifier(term_168.inner.get(0))) {
          return new _terms2.default("BindingIdentifier", { name: term_168.inner.get(0) });
        }
      case "DataProperty":
        return new _terms2.default("BindingPropertyProperty", { name: term_168.name, binding: this.transformDestructuringWithDefault(term_168.expression) });
      case "ShorthandProperty":
        return new _terms2.default("BindingPropertyIdentifier", { binding: new _terms2.default("BindingIdentifier", { name: term_168.name }), init: null });
      case "ObjectExpression":
        return new _terms2.default("ObjectBinding", { properties: term_168.properties.map(t_169 => this.transformDestructuring(t_169)) });
      case "ArrayExpression":
        let last = term_168.elements.last();
        if (last != null && last.type === "SpreadElement") {
          return new _terms2.default("ArrayBinding", { elements: term_168.elements.slice(0, -1).map(t_170 => t_170 && this.transformDestructuringWithDefault(t_170)), restElement: this.transformDestructuringWithDefault(last.expression) });
        } else {
          return new _terms2.default("ArrayBinding", { elements: term_168.elements.map(t_171 => t_171 && this.transformDestructuringWithDefault(t_171)), restElement: null });
        }
        return new _terms2.default("ArrayBinding", { elements: term_168.elements.map(t_172 => t_172 && this.transformDestructuring(t_172)), restElement: null });
      case "StaticPropertyName":
        return new _terms2.default("BindingIdentifier", { name: term_168.value });
      case "ComputedMemberExpression":
      case "StaticMemberExpression":
      case "ArrayBinding":
      case "BindingIdentifier":
      case "BindingPropertyIdentifier":
      case "BindingPropertyProperty":
      case "BindingWithDefault":
      case "ObjectBinding":
        return term_168;
    }
    (0, _errors.assert)(false, "not implemented yet for " + term_168.type);
  }
  transformDestructuringWithDefault(term_173) {
    switch (term_173.type) {
      case "AssignmentExpression":
        return new _terms2.default("BindingWithDefault", { binding: this.transformDestructuring(term_173.binding), init: term_173.expression });
    }
    return this.transformDestructuring(term_173);
  }
  enforestCallExpression() {
    let paren_174 = this.advance();
    return new _terms2.default("CallExpression", { callee: this.term, arguments: paren_174.inner() });
  }
  enforestArrowExpression() {
    let enf_175;
    if (this.isIdentifier(this.peek())) {
      enf_175 = new Enforester_46(_immutable.List.of(this.advance()), (0, _immutable.List)(), this.context);
    } else {
      let p = this.matchParens();
      enf_175 = new Enforester_46(p, (0, _immutable.List)(), this.context);
    }
    let params_176 = enf_175.enforestFormalParameters();
    this.matchPunctuator("=>");
    let body_177;
    if (this.isBraces(this.peek())) {
      body_177 = this.matchCurlies();
    } else {
      enf_175 = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
      body_177 = enf_175.enforestExpressionLoop();
      this.rest = enf_175.rest;
    }
    return new _terms2.default("ArrowExpression", { params: params_176, body: body_177 });
  }
  enforestYieldExpression() {
    let kwd_178 = this.matchKeyword("yield");
    let lookahead_179 = this.peek();
    if (this.rest.size === 0 || lookahead_179 && !this.lineNumberEq(kwd_178, lookahead_179)) {
      return new _terms2.default("YieldExpression", { expression: null });
    } else {
      let isGenerator = false;
      if (this.isPunctuator(this.peek(), "*")) {
        isGenerator = true;
        this.advance();
      }
      let expr = this.enforestExpression();
      let type = isGenerator ? "YieldGeneratorExpression" : "YieldExpression";
      return new _terms2.default(type, { expression: expr });
    }
  }
  enforestSyntaxTemplate() {
    return new _terms2.default("SyntaxTemplate", { template: this.advance() });
  }
  enforestSyntaxQuote() {
    let name_180 = this.advance();
    return new _terms2.default("SyntaxQuote", { name: name_180, template: new _terms2.default("TemplateExpression", { tag: new _terms2.default("IdentifierExpression", { name: name_180 }), elements: this.enforestTemplateElements() }) });
  }
  enforestStaticMemberExpression() {
    let object_181 = this.term;
    let dot_182 = this.advance();
    let property_183 = this.advance();
    return new _terms2.default("StaticMemberExpression", { object: object_181, property: property_183 });
  }
  enforestArrayExpression() {
    let arr_184 = this.advance();
    let elements_185 = [];
    let enf_186 = new Enforester_46(arr_184.inner(), (0, _immutable.List)(), this.context);
    while (enf_186.rest.size > 0) {
      let lookahead = enf_186.peek();
      if (enf_186.isPunctuator(lookahead, ",")) {
        enf_186.advance();
        elements_185.push(null);
      } else if (enf_186.isPunctuator(lookahead, "...")) {
        enf_186.advance();
        let expression = enf_186.enforestExpressionLoop();
        if (expression == null) {
          throw enf_186.createError(lookahead, "expecting expression");
        }
        elements_185.push(new _terms2.default("SpreadElement", { expression: expression }));
      } else {
        let term = enf_186.enforestExpressionLoop();
        if (term == null) {
          throw enf_186.createError(lookahead, "expected expression");
        }
        elements_185.push(term);
        enf_186.consumeComma();
      }
    }
    return new _terms2.default("ArrayExpression", { elements: (0, _immutable.List)(elements_185) });
  }
  enforestObjectExpression() {
    let obj_187 = this.advance();
    let properties_188 = (0, _immutable.List)();
    let enf_189 = new Enforester_46(obj_187.inner(), (0, _immutable.List)(), this.context);
    let lastProp_190 = null;
    while (enf_189.rest.size > 0) {
      let prop = enf_189.enforestPropertyDefinition();
      enf_189.consumeComma();
      properties_188 = properties_188.concat(prop);
      if (lastProp_190 === prop) {
        throw enf_189.createError(prop, "invalid syntax in object");
      }
      lastProp_190 = prop;
    }
    return new _terms2.default("ObjectExpression", { properties: properties_188 });
  }
  enforestPropertyDefinition() {
    var _enforestMethodDefini = this.enforestMethodDefinition();

    let methodOrKey = _enforestMethodDefini.methodOrKey;
    let kind = _enforestMethodDefini.kind;

    switch (kind) {
      case "method":
        return methodOrKey;
      case "identifier":
        if (this.isAssign(this.peek())) {
          this.advance();
          let init = this.enforestExpressionLoop();
          return new _terms2.default("BindingPropertyIdentifier", { init: init, binding: this.transformDestructuring(methodOrKey) });
        } else if (!this.isPunctuator(this.peek(), ":")) {
          return new _terms2.default("ShorthandProperty", { name: methodOrKey.value });
        }
    }
    this.matchPunctuator(":");
    let expr_191 = this.enforestExpressionLoop();
    return new _terms2.default("DataProperty", { name: methodOrKey, expression: expr_191 });
  }
  enforestMethodDefinition() {
    let lookahead_192 = this.peek();
    let isGenerator_193 = false;
    if (this.isPunctuator(lookahead_192, "*")) {
      isGenerator_193 = true;
      this.advance();
    }
    if (this.isIdentifier(lookahead_192, "get") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName2 = this.enforestPropertyName();

      let name = _enforestPropertyName2.name;

      this.matchParens();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Getter", { name: name, body: body }), kind: "method" };
    } else if (this.isIdentifier(lookahead_192, "set") && this.isPropertyName(this.peek(1))) {
      this.advance();

      var _enforestPropertyName3 = this.enforestPropertyName();

      let name = _enforestPropertyName3.name;

      let enf = new Enforester_46(this.matchParens(), (0, _immutable.List)(), this.context);
      let param = enf.enforestBindingElement();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Setter", { name: name, param: param, body: body }), kind: "method" };
    }

    var _enforestPropertyName4 = this.enforestPropertyName();

    let name = _enforestPropertyName4.name;

    if (this.isParens(this.peek())) {
      let params = this.matchParens();
      let enf = new Enforester_46(params, (0, _immutable.List)(), this.context);
      let formalParams = enf.enforestFormalParameters();
      let body = this.matchCurlies();
      return { methodOrKey: new _terms2.default("Method", { isGenerator: isGenerator_193, name: name, params: formalParams, body: body }), kind: "method" };
    }
    return { methodOrKey: name, kind: this.isIdentifier(lookahead_192) || this.isKeyword(lookahead_192) ? "identifier" : "property" };
  }
  enforestPropertyName() {
    let lookahead_194 = this.peek();
    if (this.isStringLiteral(lookahead_194) || this.isNumericLiteral(lookahead_194)) {
      return { name: new _terms2.default("StaticPropertyName", { value: this.advance() }), binding: null };
    } else if (this.isBrackets(lookahead_194)) {
      let enf = new Enforester_46(this.matchSquares(), (0, _immutable.List)(), this.context);
      let expr = enf.enforestExpressionLoop();
      return { name: new _terms2.default("ComputedPropertyName", { expression: expr }), binding: null };
    }
    let name_195 = this.advance();
    return { name: new _terms2.default("StaticPropertyName", { value: name_195 }), binding: new _terms2.default("BindingIdentifier", { name: name_195 }) };
  }
  enforestFunction(_ref6) {
    let isExpr = _ref6.isExpr;
    let inDefault = _ref6.inDefault;
    let allowGenerator = _ref6.allowGenerator;

    let name_196 = null,
        params_197,
        body_198,
        rest_199;
    let isGenerator_200 = false;
    let fnKeyword_201 = this.advance();
    let lookahead_202 = this.peek();
    let type_203 = isExpr ? "FunctionExpression" : "FunctionDeclaration";
    if (this.isPunctuator(lookahead_202, "*")) {
      isGenerator_200 = true;
      this.advance();
      lookahead_202 = this.peek();
    }
    if (!this.isParens(lookahead_202)) {
      name_196 = this.enforestBindingIdentifier();
    } else if (inDefault) {
      name_196 = new _terms2.default("BindingIdentifier", { name: _syntax2.default.fromIdentifier("*default*", fnKeyword_201) });
    }
    params_197 = this.matchParens();
    body_198 = this.matchCurlies();
    let enf_204 = new Enforester_46(params_197, (0, _immutable.List)(), this.context);
    let formalParams_205 = enf_204.enforestFormalParameters();
    return new _terms2.default(type_203, { name: name_196, isGenerator: isGenerator_200, params: formalParams_205, body: body_198 });
  }
  enforestFunctionExpression() {
    let name_206 = null,
        params_207,
        body_208,
        rest_209;
    let isGenerator_210 = false;
    this.advance();
    let lookahead_211 = this.peek();
    if (this.isPunctuator(lookahead_211, "*")) {
      isGenerator_210 = true;
      this.advance();
      lookahead_211 = this.peek();
    }
    if (!this.isParens(lookahead_211)) {
      name_206 = this.enforestBindingIdentifier();
    }
    params_207 = this.matchParens();
    body_208 = this.matchCurlies();
    let enf_212 = new Enforester_46(params_207, (0, _immutable.List)(), this.context);
    let formalParams_213 = enf_212.enforestFormalParameters();
    return new _terms2.default("FunctionExpression", { name: name_206, isGenerator: isGenerator_210, params: formalParams_213, body: body_208 });
  }
  enforestFunctionDeclaration() {
    let name_214, params_215, body_216, rest_217;
    let isGenerator_218 = false;
    this.advance();
    let lookahead_219 = this.peek();
    if (this.isPunctuator(lookahead_219, "*")) {
      isGenerator_218 = true;
      this.advance();
    }
    name_214 = this.enforestBindingIdentifier();
    params_215 = this.matchParens();
    body_216 = this.matchCurlies();
    let enf_220 = new Enforester_46(params_215, (0, _immutable.List)(), this.context);
    let formalParams_221 = enf_220.enforestFormalParameters();
    return new _terms2.default("FunctionDeclaration", { name: name_214, isGenerator: isGenerator_218, params: formalParams_221, body: body_216 });
  }
  enforestFormalParameters() {
    let items_222 = [];
    let rest_223 = null;
    while (this.rest.size !== 0) {
      let lookahead = this.peek();
      if (this.isPunctuator(lookahead, "...")) {
        this.matchPunctuator("...");
        rest_223 = this.enforestBindingIdentifier();
        break;
      }
      items_222.push(this.enforestParam());
      this.consumeComma();
    }
    return new _terms2.default("FormalParameters", { items: (0, _immutable.List)(items_222), rest: rest_223 });
  }
  enforestParam() {
    return this.enforestBindingElement();
  }
  enforestUpdateExpression() {
    let operator_224 = this.matchUnaryOperator();
    return new _terms2.default("UpdateExpression", { isPrefix: false, operator: operator_224.val(), operand: this.transformDestructuring(this.term) });
  }
  enforestUnaryExpression() {
    let operator_225 = this.matchUnaryOperator();
    this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
    this.opCtx.prec = 14;
    this.opCtx.combine = rightTerm_226 => {
      let type_227, term_228, isPrefix_229;
      if (operator_225.val() === "++" || operator_225.val() === "--") {
        type_227 = "UpdateExpression";
        term_228 = this.transformDestructuring(rightTerm_226);
        isPrefix_229 = true;
      } else {
        type_227 = "UnaryExpression";
        isPrefix_229 = undefined;
        term_228 = rightTerm_226;
      }
      return new _terms2.default(type_227, { operator: operator_225.val(), operand: term_228, isPrefix: isPrefix_229 });
    };
    return EXPR_LOOP_OPERATOR_43;
  }
  enforestConditionalExpression() {
    let test_230 = this.opCtx.combine(this.term);
    if (this.opCtx.stack.size > 0) {
      var _opCtx$stack$last2 = this.opCtx.stack.last();

      let prec = _opCtx$stack$last2.prec;
      let combine = _opCtx$stack$last2.combine;

      this.opCtx.stack = this.opCtx.stack.pop();
      this.opCtx.prec = prec;
      this.opCtx.combine = combine;
    }
    this.matchPunctuator("?");
    let enf_231 = new Enforester_46(this.rest, (0, _immutable.List)(), this.context);
    let consequent_232 = enf_231.enforestExpressionLoop();
    enf_231.matchPunctuator(":");
    enf_231 = new Enforester_46(enf_231.rest, (0, _immutable.List)(), this.context);
    let alternate_233 = enf_231.enforestExpressionLoop();
    this.rest = enf_231.rest;
    return new _terms2.default("ConditionalExpression", { test: test_230, consequent: consequent_232, alternate: alternate_233 });
  }
  enforestBinaryExpression() {
    let leftTerm_234 = this.term;
    let opStx_235 = this.peek();
    let op_236 = opStx_235.val();
    let opPrec_237 = (0, _operators.getOperatorPrec)(op_236);
    let opAssoc_238 = (0, _operators.getOperatorAssoc)(op_236);
    if ((0, _operators.operatorLt)(this.opCtx.prec, opPrec_237, opAssoc_238)) {
      this.opCtx.stack = this.opCtx.stack.push({ prec: this.opCtx.prec, combine: this.opCtx.combine });
      this.opCtx.prec = opPrec_237;
      this.opCtx.combine = rightTerm_239 => {
        return new _terms2.default("BinaryExpression", { left: leftTerm_234, operator: opStx_235, right: rightTerm_239 });
      };
      this.advance();
      return EXPR_LOOP_OPERATOR_43;
    } else {
      let term = this.opCtx.combine(leftTerm_234);

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
    let lookahead_240 = this.matchTemplate();
    let elements_241 = lookahead_240.token.items.map(it_242 => {
      if (this.isDelimiter(it_242)) {
        let enf = new Enforester_46(it_242.inner(), (0, _immutable.List)(), this.context);
        return enf.enforest("expression");
      }
      return new _terms2.default("TemplateElement", { rawValue: it_242.slice.text });
    });
    return elements_241;
  }
  expandMacro() {
    let lookahead_243 = this.peek();
    while (this.isCompiletimeTransform(lookahead_243)) {
      let name = this.advance();
      let syntaxTransform = this.getFromCompiletimeEnvironment(name);
      if (syntaxTransform == null || typeof syntaxTransform.value !== "function") {
        throw this.createError(name, "the macro name was not bound to a value that could be invoked");
      }
      let useSiteScope = (0, _scope.freshScope)("u");
      let introducedScope = (0, _scope.freshScope)("i");
      this.context.useScope = useSiteScope;
      let ctx = new _macroContext2.default(this, name, this.context, useSiteScope, introducedScope);
      let result = (0, _loadSyntax.sanitizeReplacementValues)(syntaxTransform.value.call(null, ctx));
      if (!_immutable.List.isList(result)) {
        throw this.createError(name, "macro must return a list but got: " + result);
      }
      result = result.map(stx_244 => {
        if (!(stx_244 && typeof stx_244.addScope === "function")) {
          throw this.createError(name, "macro must return syntax objects or terms but got: " + stx_244);
        }
        return stx_244.addScope(introducedScope, this.context.bindings, _syntax.ALL_PHASES, { flip: true });
      });
      this.rest = result.concat(ctx._rest(this));
      lookahead_243 = this.peek();
    }
  }
  consumeSemicolon() {
    let lookahead_245 = this.peek();
    if (lookahead_245 && this.isPunctuator(lookahead_245, ";")) {
      this.advance();
    }
  }
  consumeComma() {
    let lookahead_246 = this.peek();
    if (lookahead_246 && this.isPunctuator(lookahead_246, ",")) {
      this.advance();
    }
  }
  safeCheck(obj_247, type_248) {
    let val_249 = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return obj_247 && (typeof obj_247.match === "function" ? obj_247.match(type_248, val_249) : false);
  }
  isTerm(term_250) {
    return term_250 && term_250 instanceof _terms2.default;
  }
  isEOF(obj_251) {
    return this.safeCheck(obj_251, "eof");
  }
  isIdentifier(obj_252) {
    let val_253 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_252, "identifier", val_253);
  }
  isPropertyName(obj_254) {
    return this.isIdentifier(obj_254) || this.isKeyword(obj_254) || this.isNumericLiteral(obj_254) || this.isStringLiteral(obj_254) || this.isBrackets(obj_254);
  }
  isNumericLiteral(obj_255) {
    let val_256 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_255, "number", val_256);
  }
  isStringLiteral(obj_257) {
    let val_258 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_257, "string", val_258);
  }
  isTemplate(obj_259) {
    let val_260 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_259, "template", val_260);
  }
  isSyntaxTemplate(obj_261) {
    return this.safeCheck(obj_261, "syntaxTemplate");
  }
  isBooleanLiteral(obj_262) {
    let val_263 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_262, "boolean", val_263);
  }
  isNullLiteral(obj_264) {
    let val_265 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_264, "null", val_265);
  }
  isRegularExpression(obj_266) {
    let val_267 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_266, "regularExpression", val_267);
  }
  isDelimiter(obj_268) {
    return this.safeCheck(obj_268, "delimiter");
  }
  isParens(obj_269) {
    return this.safeCheck(obj_269, "parens");
  }
  isBraces(obj_270) {
    return this.safeCheck(obj_270, "braces");
  }
  isBrackets(obj_271) {
    return this.safeCheck(obj_271, "brackets");
  }
  isAssign(obj_272) {
    let val_273 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_272, "assign", val_273);
  }
  isKeyword(obj_274) {
    let val_275 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_274, "keyword", val_275);
  }
  isPunctuator(obj_276) {
    let val_277 = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return this.safeCheck(obj_276, "punctuator", val_277);
  }
  isOperator(obj_278) {
    return (this.safeCheck(obj_278, "punctuator") || this.safeCheck(obj_278, "identifier") || this.safeCheck(obj_278, "keyword")) && (0, _operators.isOperator)(obj_278);
  }
  isUpdateOperator(obj_279) {
    return this.safeCheck(obj_279, "punctuator", "++") || this.safeCheck(obj_279, "punctuator", "--");
  }
  safeResolve(obj_280, phase_281) {
    return obj_280 && typeof obj_280.resolve === "function" ? Just_41(obj_280.resolve(phase_281)) : Nothing_42();
  }
  isTransform(obj_282, trans_283) {
    return this.safeResolve(obj_282, this.context.phase).map(name_284 => this.context.env.get(name_284) === trans_283 || this.context.store.get(name_284) === trans_283).getOrElse(false);
  }
  isTransformInstance(obj_285, trans_286) {
    return this.safeResolve(obj_285, this.context.phase).map(name_287 => this.context.env.get(name_287) instanceof trans_286 || this.context.store.get(name_287) instanceof trans_286).getOrElse(false);
  }
  isFnDeclTransform(obj_288) {
    return this.isTransform(obj_288, _transforms.FunctionDeclTransform);
  }
  isVarDeclTransform(obj_289) {
    return this.isTransform(obj_289, _transforms.VariableDeclTransform);
  }
  isLetDeclTransform(obj_290) {
    return this.isTransform(obj_290, _transforms.LetDeclTransform);
  }
  isConstDeclTransform(obj_291) {
    return this.isTransform(obj_291, _transforms.ConstDeclTransform);
  }
  isSyntaxDeclTransform(obj_292) {
    return this.isTransform(obj_292, _transforms.SyntaxDeclTransform);
  }
  isSyntaxrecDeclTransform(obj_293) {
    return this.isTransform(obj_293, _transforms.SyntaxrecDeclTransform);
  }
  isSyntaxQuoteTransform(obj_294) {
    return this.isTransform(obj_294, _transforms.SyntaxQuoteTransform);
  }
  isReturnStmtTransform(obj_295) {
    return this.isTransform(obj_295, _transforms.ReturnStatementTransform);
  }
  isWhileTransform(obj_296) {
    return this.isTransform(obj_296, _transforms.WhileTransform);
  }
  isForTransform(obj_297) {
    return this.isTransform(obj_297, _transforms.ForTransform);
  }
  isSwitchTransform(obj_298) {
    return this.isTransform(obj_298, _transforms.SwitchTransform);
  }
  isBreakTransform(obj_299) {
    return this.isTransform(obj_299, _transforms.BreakTransform);
  }
  isContinueTransform(obj_300) {
    return this.isTransform(obj_300, _transforms.ContinueTransform);
  }
  isDoTransform(obj_301) {
    return this.isTransform(obj_301, _transforms.DoTransform);
  }
  isDebuggerTransform(obj_302) {
    return this.isTransform(obj_302, _transforms.DebuggerTransform);
  }
  isWithTransform(obj_303) {
    return this.isTransform(obj_303, _transforms.WithTransform);
  }
  isTryTransform(obj_304) {
    return this.isTransform(obj_304, _transforms.TryTransform);
  }
  isThrowTransform(obj_305) {
    return this.isTransform(obj_305, _transforms.ThrowTransform);
  }
  isIfTransform(obj_306) {
    return this.isTransform(obj_306, _transforms.IfTransform);
  }
  isNewTransform(obj_307) {
    return this.isTransform(obj_307, _transforms.NewTransform);
  }
  isCompiletimeTransform(obj_308) {
    return this.isTransformInstance(obj_308, _transforms.CompiletimeTransform);
  }
  isVarBindingTransform(obj_309) {
    return this.isTransformInstance(obj_309, _transforms.VarBindingTransform);
  }
  getFromCompiletimeEnvironment(term_310) {
    if (this.context.env.has(term_310.resolve(this.context.phase))) {
      return this.context.env.get(term_310.resolve(this.context.phase));
    }
    return this.context.store.get(term_310.resolve(this.context.phase));
  }
  lineNumberEq(a_311, b_312) {
    if (!(a_311 && b_312)) {
      return false;
    }
    return a_311.lineNumber() === b_312.lineNumber();
  }
  matchIdentifier(val_313) {
    let lookahead_314 = this.advance();
    if (this.isIdentifier(lookahead_314)) {
      return lookahead_314;
    }
    throw this.createError(lookahead_314, "expecting an identifier");
  }
  matchKeyword(val_315) {
    let lookahead_316 = this.advance();
    if (this.isKeyword(lookahead_316, val_315)) {
      return lookahead_316;
    }
    throw this.createError(lookahead_316, "expecting " + val_315);
  }
  matchLiteral() {
    let lookahead_317 = this.advance();
    if (this.isNumericLiteral(lookahead_317) || this.isStringLiteral(lookahead_317) || this.isBooleanLiteral(lookahead_317) || this.isNullLiteral(lookahead_317) || this.isTemplate(lookahead_317) || this.isRegularExpression(lookahead_317)) {
      return lookahead_317;
    }
    throw this.createError(lookahead_317, "expecting a literal");
  }
  matchStringLiteral() {
    let lookahead_318 = this.advance();
    if (this.isStringLiteral(lookahead_318)) {
      return lookahead_318;
    }
    throw this.createError(lookahead_318, "expecting a string literal");
  }
  matchTemplate() {
    let lookahead_319 = this.advance();
    if (this.isTemplate(lookahead_319)) {
      return lookahead_319;
    }
    throw this.createError(lookahead_319, "expecting a template literal");
  }
  matchParens() {
    let lookahead_320 = this.advance();
    if (this.isParens(lookahead_320)) {
      return lookahead_320.inner();
    }
    throw this.createError(lookahead_320, "expecting parens");
  }
  matchCurlies() {
    let lookahead_321 = this.advance();
    if (this.isBraces(lookahead_321)) {
      return lookahead_321.inner();
    }
    throw this.createError(lookahead_321, "expecting curly braces");
  }
  matchSquares() {
    let lookahead_322 = this.advance();
    if (this.isBrackets(lookahead_322)) {
      return lookahead_322.inner();
    }
    throw this.createError(lookahead_322, "expecting sqaure braces");
  }
  matchUnaryOperator() {
    let lookahead_323 = this.advance();
    if ((0, _operators.isUnaryOperator)(lookahead_323)) {
      return lookahead_323;
    }
    throw this.createError(lookahead_323, "expecting a unary operator");
  }
  matchPunctuator(val_324) {
    let lookahead_325 = this.advance();
    if (this.isPunctuator(lookahead_325)) {
      if (typeof val_324 !== "undefined") {
        if (lookahead_325.val() === val_324) {
          return lookahead_325;
        } else {
          throw this.createError(lookahead_325, "expecting a " + val_324 + " punctuator");
        }
      }
      return lookahead_325;
    }
    throw this.createError(lookahead_325, "expecting a punctuator");
  }
  createError(stx_326, message_327) {
    let ctx_328 = "";
    let offending_329 = stx_326;
    if (this.rest.size > 0) {
      ctx_328 = this.rest.slice(0, 20).map(term_330 => {
        if (this.isDelimiter(term_330)) {
          return term_330.inner();
        }
        return _immutable.List.of(term_330);
      }).flatten().map(s_331 => {
        if (s_331 === offending_329) {
          return "__" + s_331.val() + "__";
        }
        return s_331.val();
      }).join(" ");
    } else {
      ctx_328 = offending_329.toString();
    }
    return new Error(message_327 + "\n" + ctx_328);
  }
}
exports.Enforester = Enforester_46;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L2VuZm9yZXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBQ0EsTUFBTSxVQUFVLG9CQUFNLElBQXRCO0FBQ0EsTUFBTSxhQUFhLG9CQUFNLE9BQXpCO0FBQ0EsTUFBTSx3QkFBd0IsRUFBOUI7QUFDQSxNQUFNLHlCQUF5QixFQUEvQjtBQUNBLE1BQU0seUJBQXlCLEVBQS9CO0FBQ0EsTUFBTSxhQUFOLENBQW9CO0FBQ2xCLGNBQVksT0FBWixFQUFxQixPQUFyQixFQUE4QixVQUE5QixFQUEwQztBQUN4QyxTQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0Esd0JBQU8sZ0JBQUssTUFBTCxDQUFZLE9BQVosQ0FBUCxFQUE2Qix1Q0FBN0I7QUFDQSx3QkFBTyxnQkFBSyxNQUFMLENBQVksT0FBWixDQUFQLEVBQTZCLHVDQUE3QjtBQUNBLHdCQUFPLFVBQVAsRUFBbUIsaUNBQW5CO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLE9BQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxPQUFaO0FBQ0EsU0FBSyxPQUFMLEdBQWUsVUFBZjtBQUNEO0FBQ0QsU0FBZTtBQUFBLFFBQVYsSUFBVSx5REFBSCxDQUFHOztBQUNiLFdBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFjLElBQWQsQ0FBUDtBQUNEO0FBQ0QsWUFBVTtBQUNSLFFBQUksU0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWI7QUFDQSxTQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQVo7QUFDQSxXQUFPLE1BQVA7QUFDRDtBQUNELGFBQTZCO0FBQUEsUUFBcEIsT0FBb0IseURBQVYsUUFBVTs7QUFDM0IsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFFBQUksS0FBSyxJQUFMLENBQVUsSUFBVixLQUFt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YyxRQUFkLEVBQVY7QUFDRDtBQUNELFdBQU8sSUFBSSxLQUFKLENBQVUsY0FBYyxJQUFkLEdBQXFCLE9BQS9CLENBQVA7QUFDRDtBQXZqRGlCO1FBeWpESyxVLEdBQWpCLGEiLCJmaWxlIjoiZW5mb3Jlc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtLCB7aXNJZGVudGlmaWVyRXhwcmVzc2lvbn0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge0Z1bmN0aW9uRGVjbFRyYW5zZm9ybSwgVmFyaWFibGVEZWNsVHJhbnNmb3JtLCBOZXdUcmFuc2Zvcm0sIExldERlY2xUcmFuc2Zvcm0sIENvbnN0RGVjbFRyYW5zZm9ybSwgU3ludGF4RGVjbFRyYW5zZm9ybSwgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSwgU3ludGF4UXVvdGVUcmFuc2Zvcm0sIFJldHVyblN0YXRlbWVudFRyYW5zZm9ybSwgV2hpbGVUcmFuc2Zvcm0sIElmVHJhbnNmb3JtLCBGb3JUcmFuc2Zvcm0sIFN3aXRjaFRyYW5zZm9ybSwgQnJlYWtUcmFuc2Zvcm0sIENvbnRpbnVlVHJhbnNmb3JtLCBEb1RyYW5zZm9ybSwgRGVidWdnZXJUcmFuc2Zvcm0sIFdpdGhUcmFuc2Zvcm0sIFRyeVRyYW5zZm9ybSwgVGhyb3dUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtLCBWYXJCaW5kaW5nVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IHtpc09wZXJhdG9yLCBpc1VuYXJ5T3BlcmF0b3IsIGdldE9wZXJhdG9yQXNzb2MsIGdldE9wZXJhdG9yUHJlYywgb3BlcmF0b3JMdH0gZnJvbSBcIi4vb3BlcmF0b3JzXCI7XG5pbXBvcnQgU3ludGF4LCB7QUxMX1BIQVNFU30gZnJvbSBcIi4vc3ludGF4XCI7XG5pbXBvcnQge2ZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5pbXBvcnQge3Nhbml0aXplUmVwbGFjZW1lbnRWYWx1ZXN9IGZyb20gXCIuL2xvYWQtc3ludGF4XCI7XG5pbXBvcnQgTWFjcm9Db250ZXh0IGZyb20gXCIuL21hY3JvLWNvbnRleHRcIjtcbmNvbnN0IEp1c3RfNDEgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ180MiA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCBFWFBSX0xPT1BfT1BFUkFUT1JfNDMgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9OT19DSEFOR0VfNDQgPSB7fTtcbmNvbnN0IEVYUFJfTE9PUF9FWFBBTlNJT05fNDUgPSB7fTtcbmNsYXNzIEVuZm9yZXN0ZXJfNDYge1xuICBjb25zdHJ1Y3RvcihzdHhsXzQ3LCBwcmV2XzQ4LCBjb250ZXh0XzQ5KSB7XG4gICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHN0eGxfNDcpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KExpc3QuaXNMaXN0KHByZXZfNDgpLCBcImV4cGVjdGluZyBhIGxpc3Qgb2YgdGVybXMgdG8gZW5mb3Jlc3RcIik7XG4gICAgYXNzZXJ0KGNvbnRleHRfNDksIFwiZXhwZWN0aW5nIGEgY29udGV4dCB0byBlbmZvcmVzdFwiKTtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHRoaXMucmVzdCA9IHN0eGxfNDc7XG4gICAgdGhpcy5wcmV2ID0gcHJldl80ODtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzQ5O1xuICB9XG4gIHBlZWsobl81MCA9IDApIHtcbiAgICByZXR1cm4gdGhpcy5yZXN0LmdldChuXzUwKTtcbiAgfVxuICBhZHZhbmNlKCkge1xuICAgIGxldCByZXRfNTEgPSB0aGlzLnJlc3QuZmlyc3QoKTtcbiAgICB0aGlzLnJlc3QgPSB0aGlzLnJlc3QucmVzdCgpO1xuICAgIHJldHVybiByZXRfNTE7XG4gIH1cbiAgZW5mb3Jlc3QodHlwZV81MiA9IFwiTW9kdWxlXCIpIHtcbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRU9GKHRoaXMucGVlaygpKSkge1xuICAgICAgdGhpcy50ZXJtID0gbmV3IFRlcm0oXCJFT0ZcIiwge30pO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy50ZXJtO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0XzUzO1xuICAgIGlmICh0eXBlXzUyID09PSBcImV4cHJlc3Npb25cIikge1xuICAgICAgcmVzdWx0XzUzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdF81MyA9IHRoaXMuZW5mb3Jlc3RNb2R1bGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzUzO1xuICB9XG4gIGVuZm9yZXN0TW9kdWxlKCkge1xuICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Qm9keSgpO1xuICB9XG4gIGVuZm9yZXN0Qm9keSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE1vZHVsZUl0ZW0oKTtcbiAgfVxuICBlbmZvcmVzdE1vZHVsZUl0ZW0oKSB7XG4gICAgbGV0IGxvb2thaGVhZF81NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNTQsIFwiaW1wb3J0XCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SW1wb3J0RGVjbGFyYXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF81NCwgXCJleHBvcnRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzU0LCBcIiNcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TGFuZ3VhZ2VQcmFnbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdExhbmd1YWdlUHJhZ21hKCkge1xuICAgIHRoaXMubWF0Y2hJZGVudGlmaWVyKFwiI1wiKTtcbiAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImxhbmdcIik7XG4gICAgbGV0IHBhdGhfNTUgPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlByYWdtYVwiLCB7a2luZDogXCJsYW5nXCIsIGl0ZW1zOiBMaXN0Lm9mKHBhdGhfNTUpfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnREZWNsYXJhdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzU2ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF81NiwgXCIqXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzU2KSkge1xuICAgICAgbGV0IG5hbWVkRXhwb3J0cyA9IHRoaXMuZW5mb3Jlc3RFeHBvcnRDbGF1c2UoKTtcbiAgICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImZyb21cIikpIHtcbiAgICAgICAgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge25hbWVkRXhwb3J0czogbmFtZWRFeHBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IG1vZHVsZVNwZWNpZmllcn0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU2LCBcImNsYXNzXCIpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0ZuRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTYpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwcjogZmFsc2UsIGluRGVmYXVsdDogZmFsc2V9KX0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzU2LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IHRoaXMuZW5mb3Jlc3RGdW5jdGlvbih7aXNFeHByOiBmYWxzZSwgaW5EZWZhdWx0OiB0cnVlfSl9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiY2xhc3NcIikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RGVmYXVsdFwiLCB7Ym9keTogdGhpcy5lbmZvcmVzdENsYXNzKHtpc0V4cHI6IGZhbHNlLCBpbkRlZmF1bHQ6IHRydWV9KX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydERlZmF1bHRcIiwge2JvZHk6IGJvZHl9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NikgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU2KSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF81NikgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzU2KSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNTYpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJFeHBvcnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzU2LCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0RXhwb3J0Q2xhdXNlKCkge1xuICAgIGxldCBlbmZfNTcgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLm1hdGNoQ3VybGllcygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHJlc3VsdF81OCA9IFtdO1xuICAgIHdoaWxlIChlbmZfNTcucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICByZXN1bHRfNTgucHVzaChlbmZfNTcuZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSk7XG4gICAgICBlbmZfNTcuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF81OCk7XG4gIH1cbiAgZW5mb3Jlc3RFeHBvcnRTcGVjaWZpZXIoKSB7XG4gICAgbGV0IG5hbWVfNTkgPSB0aGlzLmVuZm9yZXN0SWRlbnRpZmllcigpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoKSwgXCJhc1wiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZXhwb3J0ZWROYW1lID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV81OSwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBudWxsLCBleHBvcnRlZE5hbWU6IG5hbWVfNTl9KTtcbiAgfVxuICBlbmZvcmVzdEltcG9ydERlY2xhcmF0aW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfNjAgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgZGVmYXVsdEJpbmRpbmdfNjEgPSBudWxsO1xuICAgIGxldCBuYW1lZEltcG9ydHNfNjIgPSBMaXN0KCk7XG4gICAgbGV0IGZvclN5bnRheF82MyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfNjApKSB7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzYxLCBuYW1lZEltcG9ydHM6IG5hbWVkSW1wb3J0c182MiwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF82MCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzYwKSkge1xuICAgICAgZGVmYXVsdEJpbmRpbmdfNjEgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgZm9yU3ludGF4XzYzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ182MSwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXIsIG5hbWVkSW1wb3J0czogTGlzdCgpLCBmb3JTeW50YXg6IGZvclN5bnRheF82M30pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWVDb21tYSgpO1xuICAgIGxvb2thaGVhZF82MCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF82MCkpIHtcbiAgICAgIGxldCBpbXBvcnRzID0gdGhpcy5lbmZvcmVzdE5hbWVkSW1wb3J0cygpO1xuICAgICAgbGV0IGZyb21DbGF1c2UgPSB0aGlzLmVuZm9yZXN0RnJvbUNsYXVzZSgpO1xuICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZvclwiKSAmJiB0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSksIFwic3ludGF4XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgZm9yU3ludGF4XzYzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IGRlZmF1bHRCaW5kaW5nXzYxLCBmb3JTeW50YXg6IGZvclN5bnRheF82MywgbmFtZWRJbXBvcnRzOiBpbXBvcnRzLCBtb2R1bGVTcGVjaWZpZXI6IGZyb21DbGF1c2V9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF82MCwgXCIqXCIpKSB7XG4gICAgICBsZXQgbmFtZXNwYWNlQmluZGluZyA9IHRoaXMuZW5mb3Jlc3ROYW1lc3BhY2VCaW5kaW5nKCk7XG4gICAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gdGhpcy5lbmZvcmVzdEZyb21DbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmb3JcIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInN5bnRheFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIGZvclN5bnRheF82MyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnROYW1lc3BhY2VcIiwge2RlZmF1bHRCaW5kaW5nOiBkZWZhdWx0QmluZGluZ182MSwgZm9yU3ludGF4OiBmb3JTeW50YXhfNjMsIG5hbWVzcGFjZUJpbmRpbmc6IG5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzYwLCBcInVuZXhwZWN0ZWQgc3ludGF4XCIpO1xuICB9XG4gIGVuZm9yZXN0TmFtZXNwYWNlQmluZGluZygpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIipcIik7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJhc1wiKTtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gIH1cbiAgZW5mb3Jlc3ROYW1lZEltcG9ydHMoKSB7XG4gICAgbGV0IGVuZl82NCA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0XzY1ID0gW107XG4gICAgd2hpbGUgKGVuZl82NC5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIHJlc3VsdF82NS5wdXNoKGVuZl82NC5lbmZvcmVzdEltcG9ydFNwZWNpZmllcnMoKSk7XG4gICAgICBlbmZfNjQuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KHJlc3VsdF82NSk7XG4gIH1cbiAgZW5mb3Jlc3RJbXBvcnRTcGVjaWZpZXJzKCkge1xuICAgIGxldCBsb29rYWhlYWRfNjYgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbmFtZV82NztcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzY2KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNjYpKSB7XG4gICAgICBuYW1lXzY3ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpLCBcImFzXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbnVsbCwgYmluZGluZzogbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZV82N30pfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1hdGNoSWRlbnRpZmllcihcImFzXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF82NiwgXCJ1bmV4cGVjdGVkIHRva2VuIGluIGltcG9ydCBzcGVjaWZpZXJcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV82NywgYmluZGluZzogdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCl9KTtcbiAgfVxuICBlbmZvcmVzdEZyb21DbGF1c2UoKSB7XG4gICAgdGhpcy5tYXRjaElkZW50aWZpZXIoXCJmcm9tXCIpO1xuICAgIGxldCBsb29rYWhlYWRfNjggPSB0aGlzLm1hdGNoU3RyaW5nTGl0ZXJhbCgpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBsb29rYWhlYWRfNjg7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SXRlbSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzY5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzY5KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKHtpc0V4cHI6IGZhbHNlfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfNjksIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxvb2thaGVhZF83MCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHRoaXMuZXhwYW5kTWFjcm8oKTtcbiAgICAgIGxvb2thaGVhZF83MCA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUZXJtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzV2hpbGVUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNJZlRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdElmU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0ZvclRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZvclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNTd2l0Y2hUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTd2l0Y2hTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzQnJlYWtUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCcmVha1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNDb250aW51ZVRyYW5zZm9ybShsb29rYWhlYWRfNzApKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0RvVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0RG9TdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRGVidWdnZXJUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3REZWJ1Z2dlclN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNXaXRoVHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0V2l0aFN0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNUcnlUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUcnlTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVGhyb3dUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83MCwgXCJjbGFzc1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RDbGFzcyh7aXNFeHByOiBmYWxzZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNGbkRlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RGdW5jdGlvbkRlY2xhcmF0aW9uKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzcwKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiOlwiKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMYWJlbGVkU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgKHRoaXMuaXNWYXJEZWNsVHJhbnNmb3JtKGxvb2thaGVhZF83MCkgfHwgdGhpcy5pc0xldERlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSB8fCB0aGlzLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF83MCkgfHwgdGhpcy5pc1N5bnRheHJlY0RlY2xUcmFuc2Zvcm0obG9va2FoZWFkXzcwKSB8fCB0aGlzLmlzU3ludGF4RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfNzApKSkge1xuICAgICAgbGV0IHN0bXQgPSBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnRcIiwge2RlY2xhcmF0aW9uOiB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpfSk7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBzdG10O1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZXR1cm5TdG10VHJhbnNmb3JtKGxvb2thaGVhZF83MCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0UmV0dXJuU3RhdGVtZW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzcwLCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiRW1wdHlTdGF0ZW1lbnRcIiwge30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKTtcbiAgfVxuICBlbmZvcmVzdExhYmVsZWRTdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGxhYmVsXzcxID0gdGhpcy5tYXRjaElkZW50aWZpZXIoKTtcbiAgICBsZXQgcHVuY183MiA9IHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgc3RtdF83MyA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMYWJlbGVkU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzEsIGJvZHk6IHN0bXRfNzN9KTtcbiAgfVxuICBlbmZvcmVzdEJyZWFrU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiYnJlYWtcIik7XG4gICAgbGV0IGxvb2thaGVhZF83NCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBsYWJlbF83NSA9IG51bGw7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF83NCwgXCI7XCIpKSB7XG4gICAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIkJyZWFrU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfNzV9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF83NCkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzc0LCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF83NCwgXCJsZXRcIikpIHtcbiAgICAgIGxhYmVsXzc1ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQnJlYWtTdGF0ZW1lbnRcIiwge2xhYmVsOiBsYWJlbF83NX0pO1xuICB9XG4gIGVuZm9yZXN0VHJ5U3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwidHJ5XCIpO1xuICAgIGxldCBib2R5Xzc2ID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhdGNoXCIpKSB7XG4gICAgICBsZXQgY2F0Y2hDbGF1c2UgPSB0aGlzLmVuZm9yZXN0Q2F0Y2hDbGF1c2UoKTtcbiAgICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJmaW5hbGx5XCIpKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgZmluYWxpemVyID0gdGhpcy5lbmZvcmVzdEJsb2NrKCk7XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUZpbmFsbHlTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfNzYsIGNhdGNoQ2xhdXNlOiBjYXRjaENsYXVzZSwgZmluYWxpemVyOiBmaW5hbGl6ZXJ9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRyeUNhdGNoU3RhdGVtZW50XCIsIHtib2R5OiBib2R5Xzc2LCBjYXRjaENsYXVzZTogY2F0Y2hDbGF1c2V9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImZpbmFsbHlcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IGZpbmFsaXplciA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVHJ5RmluYWxseVN0YXRlbWVudFwiLCB7Ym9keTogYm9keV83NiwgY2F0Y2hDbGF1c2U6IG51bGwsIGZpbmFsaXplcjogZmluYWxpemVyfSk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidHJ5IHdpdGggbm8gY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgfVxuICBlbmZvcmVzdENhdGNoQ2xhdXNlKCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiY2F0Y2hcIik7XG4gICAgbGV0IGJpbmRpbmdQYXJlbnNfNzcgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgbGV0IGVuZl83OCA9IG5ldyBFbmZvcmVzdGVyXzQ2KGJpbmRpbmdQYXJlbnNfNzcsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgYmluZGluZ183OSA9IGVuZl83OC5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoKTtcbiAgICBsZXQgYm9keV84MCA9IHRoaXMuZW5mb3Jlc3RCbG9jaygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhdGNoQ2xhdXNlXCIsIHtiaW5kaW5nOiBiaW5kaW5nXzc5LCBib2R5OiBib2R5XzgwfSk7XG4gIH1cbiAgZW5mb3Jlc3RUaHJvd1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInRocm93XCIpO1xuICAgIGxldCBleHByZXNzaW9uXzgxID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmNvbnN1bWVTZW1pY29sb24oKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUaHJvd1N0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbl84MX0pO1xuICB9XG4gIGVuZm9yZXN0V2l0aFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndpdGhcIik7XG4gICAgbGV0IG9ialBhcmVuc184MiA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzgzID0gbmV3IEVuZm9yZXN0ZXJfNDYob2JqUGFyZW5zXzgyLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IG9iamVjdF84NCA9IGVuZl84My5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBsZXQgYm9keV84NSA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJXaXRoU3RhdGVtZW50XCIsIHtvYmplY3Q6IG9iamVjdF84NCwgYm9keTogYm9keV84NX0pO1xuICB9XG4gIGVuZm9yZXN0RGVidWdnZXJTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWJ1Z2dlclwiKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEZWJ1Z2dlclN0YXRlbWVudFwiLCB7fSk7XG4gIH1cbiAgZW5mb3Jlc3REb1N0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcImRvXCIpO1xuICAgIGxldCBib2R5Xzg2ID0gdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpO1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwid2hpbGVcIik7XG4gICAgbGV0IHRlc3RCb2R5Xzg3ID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfODggPSBuZXcgRW5mb3Jlc3Rlcl80Nih0ZXN0Qm9keV84NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCB0ZXN0Xzg5ID0gZW5mXzg4LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkRvV2hpbGVTdGF0ZW1lbnRcIiwge2JvZHk6IGJvZHlfODYsIHRlc3Q6IHRlc3RfODl9KTtcbiAgfVxuICBlbmZvcmVzdENvbnRpbnVlU3RhdGVtZW50KCkge1xuICAgIGxldCBrd2RfOTAgPSB0aGlzLm1hdGNoS2V5d29yZChcImNvbnRpbnVlXCIpO1xuICAgIGxldCBsb29rYWhlYWRfOTEgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgbGFiZWxfOTIgPSBudWxsO1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfOTEsIFwiO1wiKSkge1xuICAgICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJDb250aW51ZVN0YXRlbWVudFwiLCB7bGFiZWw6IGxhYmVsXzkyfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxpbmVOdW1iZXJFcShrd2RfOTAsIGxvb2thaGVhZF85MSkgJiYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF85MSkgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzkxLCBcInlpZWxkXCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF85MSwgXCJsZXRcIikpKSB7XG4gICAgICBsYWJlbF85MiA9IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbnRpbnVlU3RhdGVtZW50XCIsIHtsYWJlbDogbGFiZWxfOTJ9KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaFN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcInN3aXRjaFwiKTtcbiAgICBsZXQgY29uZF85MyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzk0ID0gbmV3IEVuZm9yZXN0ZXJfNDYoY29uZF85MywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBkaXNjcmltaW5hbnRfOTUgPSBlbmZfOTQuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgbGV0IGJvZHlfOTYgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGlmIChib2R5Xzk2LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfOTUsIGNhc2VzOiBMaXN0KCl9KTtcbiAgICB9XG4gICAgZW5mXzk0ID0gbmV3IEVuZm9yZXN0ZXJfNDYoYm9keV85NiwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBjYXNlc185NyA9IGVuZl85NC5lbmZvcmVzdFN3aXRjaENhc2VzKCk7XG4gICAgbGV0IGxvb2thaGVhZF85OCA9IGVuZl85NC5wZWVrKCk7XG4gICAgaWYgKGVuZl85NC5pc0tleXdvcmQobG9va2FoZWFkXzk4LCBcImRlZmF1bHRcIikpIHtcbiAgICAgIGxldCBkZWZhdWx0Q2FzZSA9IGVuZl85NC5lbmZvcmVzdFN3aXRjaERlZmF1bHQoKTtcbiAgICAgIGxldCBwb3N0RGVmYXVsdENhc2VzID0gZW5mXzk0LmVuZm9yZXN0U3dpdGNoQ2FzZXMoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFdpdGhEZWZhdWx0XCIsIHtkaXNjcmltaW5hbnQ6IGRpc2NyaW1pbmFudF85NSwgcHJlRGVmYXVsdENhc2VzOiBjYXNlc185NywgZGVmYXVsdENhc2U6IGRlZmF1bHRDYXNlLCBwb3N0RGVmYXVsdENhc2VzOiBwb3N0RGVmYXVsdENhc2VzfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaFN0YXRlbWVudFwiLCB7ZGlzY3JpbWluYW50OiBkaXNjcmltaW5hbnRfOTUsIGNhc2VzOiBjYXNlc185N30pO1xuICB9XG4gIGVuZm9yZXN0U3dpdGNoQ2FzZXMoKSB7XG4gICAgbGV0IGNhc2VzXzk5ID0gW107XG4gICAgd2hpbGUgKCEodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgdGhpcy5pc0tleXdvcmQodGhpcy5wZWVrKCksIFwiZGVmYXVsdFwiKSkpIHtcbiAgICAgIGNhc2VzXzk5LnB1c2godGhpcy5lbmZvcmVzdFN3aXRjaENhc2UoKSk7XG4gICAgfVxuICAgIHJldHVybiBMaXN0KGNhc2VzXzk5KTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaENhc2UoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJjYXNlXCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaENhc2VcIiwge3Rlc3Q6IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCksIGNvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpIHtcbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnRMaXN0SW5Td2l0Y2hDYXNlQm9keSgpO1xuICB9XG4gIGVuZm9yZXN0U3RhdGVtZW50TGlzdEluU3dpdGNoQ2FzZUJvZHkoKSB7XG4gICAgbGV0IHJlc3VsdF8xMDAgPSBbXTtcbiAgICB3aGlsZSAoISh0aGlzLnJlc3Quc2l6ZSA9PT0gMCB8fCB0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJkZWZhdWx0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImNhc2VcIikpKSB7XG4gICAgICByZXN1bHRfMTAwLnB1c2godGhpcy5lbmZvcmVzdFN0YXRlbWVudExpc3RJdGVtKCkpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMTAwKTtcbiAgfVxuICBlbmZvcmVzdFN3aXRjaERlZmF1bHQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJkZWZhdWx0XCIpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN3aXRjaERlZmF1bHRcIiwge2NvbnNlcXVlbnQ6IHRoaXMuZW5mb3Jlc3RTd2l0Y2hDYXNlQm9keSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RGb3JTdGF0ZW1lbnQoKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJmb3JcIik7XG4gICAgbGV0IGNvbmRfMTAxID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTAyID0gbmV3IEVuZm9yZXN0ZXJfNDYoY29uZF8xMDEsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzEwMywgdGVzdF8xMDQsIGluaXRfMTA1LCByaWdodF8xMDYsIHR5cGVfMTA3LCBsZWZ0XzEwOCwgdXBkYXRlXzEwOTtcbiAgICBpZiAoZW5mXzEwMi5pc1B1bmN0dWF0b3IoZW5mXzEwMi5wZWVrKCksIFwiO1wiKSkge1xuICAgICAgZW5mXzEwMi5hZHZhbmNlKCk7XG4gICAgICBpZiAoIWVuZl8xMDIuaXNQdW5jdHVhdG9yKGVuZl8xMDIucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgdGVzdF8xMDQgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgICAgZW5mXzEwMi5tYXRjaFB1bmN0dWF0b3IoXCI7XCIpO1xuICAgICAgaWYgKGVuZl8xMDIucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIHJpZ2h0XzEwNiA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JTdGF0ZW1lbnRcIiwge2luaXQ6IG51bGwsIHRlc3Q6IHRlc3RfMTA0LCB1cGRhdGU6IHJpZ2h0XzEwNiwgYm9keTogdGhpcy5lbmZvcmVzdFN0YXRlbWVudCgpfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvb2thaGVhZF8xMDMgPSBlbmZfMTAyLnBlZWsoKTtcbiAgICAgIGlmIChlbmZfMTAyLmlzVmFyRGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTAzKSB8fCBlbmZfMTAyLmlzTGV0RGVjbFRyYW5zZm9ybShsb29rYWhlYWRfMTAzKSB8fCBlbmZfMTAyLmlzQ29uc3REZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xMDMpKSB7XG4gICAgICAgIGluaXRfMTA1ID0gZW5mXzEwMi5lbmZvcmVzdFZhcmlhYmxlRGVjbGFyYXRpb24oKTtcbiAgICAgICAgbG9va2FoZWFkXzEwMyA9IGVuZl8xMDIucGVlaygpO1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzEwMywgXCJpblwiKSB8fCB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTAzLCBcIm9mXCIpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMDMsIFwiaW5cIikpIHtcbiAgICAgICAgICAgIGVuZl8xMDIuYWR2YW5jZSgpO1xuICAgICAgICAgICAgcmlnaHRfMTA2ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICAgIHR5cGVfMTA3ID0gXCJGb3JJblN0YXRlbWVudFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzEwMywgXCJvZlwiKSkge1xuICAgICAgICAgICAgZW5mXzEwMi5hZHZhbmNlKCk7XG4gICAgICAgICAgICByaWdodF8xMDYgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgICAgdHlwZV8xMDcgPSBcIkZvck9mU3RhdGVtZW50XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNywge2xlZnQ6IGluaXRfMTA1LCByaWdodDogcmlnaHRfMTA2LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTAyLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIGlmIChlbmZfMTAyLmlzUHVuY3R1YXRvcihlbmZfMTAyLnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgICAgZW5mXzEwMi5hZHZhbmNlKCk7XG4gICAgICAgICAgdGVzdF8xMDQgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlc3RfMTA0ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgICAgICBlbmZfMTAyLm1hdGNoUHVuY3R1YXRvcihcIjtcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlXzEwOSA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoZW5mXzEwMi5wZWVrKDEpLCBcImluXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGVuZl8xMDIucGVlaygxKSwgXCJvZlwiKSkge1xuICAgICAgICAgIGxlZnRfMTA4ID0gZW5mXzEwMi5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgICAgICAgbGV0IGtpbmQgPSBlbmZfMTAyLmFkdmFuY2UoKTtcbiAgICAgICAgICBpZiAodGhpcy5pc0tleXdvcmQoa2luZCwgXCJpblwiKSkge1xuICAgICAgICAgICAgdHlwZV8xMDcgPSBcIkZvckluU3RhdGVtZW50XCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHR5cGVfMTA3ID0gXCJGb3JPZlN0YXRlbWVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByaWdodF8xMDYgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzEwNywge2xlZnQ6IGxlZnRfMTA4LCByaWdodDogcmlnaHRfMTA2LCBib2R5OiB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCl9KTtcbiAgICAgICAgfVxuICAgICAgICBpbml0XzEwNSA9IGVuZl8xMDIuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICAgIGVuZl8xMDIubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgaWYgKGVuZl8xMDIuaXNQdW5jdHVhdG9yKGVuZl8xMDIucGVlaygpLCBcIjtcIikpIHtcbiAgICAgICAgICBlbmZfMTAyLmFkdmFuY2UoKTtcbiAgICAgICAgICB0ZXN0XzEwNCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVzdF8xMDQgPSBlbmZfMTAyLmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgICAgICAgIGVuZl8xMDIubWF0Y2hQdW5jdHVhdG9yKFwiO1wiKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGVfMTA5ID0gZW5mXzEwMi5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIkZvclN0YXRlbWVudFwiLCB7aW5pdDogaW5pdF8xMDUsIHRlc3Q6IHRlc3RfMTA0LCB1cGRhdGU6IHVwZGF0ZV8xMDksIGJvZHk6IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKX0pO1xuICAgIH1cbiAgfVxuICBlbmZvcmVzdElmU3RhdGVtZW50KCkge1xuICAgIHRoaXMubWF0Y2hLZXl3b3JkKFwiaWZcIik7XG4gICAgbGV0IGNvbmRfMTEwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgIGxldCBlbmZfMTExID0gbmV3IEVuZm9yZXN0ZXJfNDYoY29uZF8xMTAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbG9va2FoZWFkXzExMiA9IGVuZl8xMTEucGVlaygpO1xuICAgIGxldCB0ZXN0XzExMyA9IGVuZl8xMTEuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgaWYgKHRlc3RfMTEzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBlbmZfMTExLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMTIsIFwiZXhwZWN0aW5nIGFuIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIGxldCBjb25zZXF1ZW50XzExNCA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICBsZXQgYWx0ZXJuYXRlXzExNSA9IG51bGw7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygpLCBcImVsc2VcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgYWx0ZXJuYXRlXzExNSA9IHRoaXMuZW5mb3Jlc3RTdGF0ZW1lbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWZTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfMTEzLCBjb25zZXF1ZW50OiBjb25zZXF1ZW50XzExNCwgYWx0ZXJuYXRlOiBhbHRlcm5hdGVfMTE1fSk7XG4gIH1cbiAgZW5mb3Jlc3RXaGlsZVN0YXRlbWVudCgpIHtcbiAgICB0aGlzLm1hdGNoS2V5d29yZChcIndoaWxlXCIpO1xuICAgIGxldCBjb25kXzExNiA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBsZXQgZW5mXzExNyA9IG5ldyBFbmZvcmVzdGVyXzQ2KGNvbmRfMTE2LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGxvb2thaGVhZF8xMTggPSBlbmZfMTE3LnBlZWsoKTtcbiAgICBsZXQgdGVzdF8xMTkgPSBlbmZfMTE3LmVuZm9yZXN0RXhwcmVzc2lvbigpO1xuICAgIGlmICh0ZXN0XzExOSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgZW5mXzExNy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMTE4LCBcImV4cGVjdGluZyBhbiBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBsZXQgYm9keV8xMjAgPSB0aGlzLmVuZm9yZXN0U3RhdGVtZW50KCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiV2hpbGVTdGF0ZW1lbnRcIiwge3Rlc3Q6IHRlc3RfMTE5LCBib2R5OiBib2R5XzEyMH0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2tTdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tTdGF0ZW1lbnRcIiwge2Jsb2NrOiB0aGlzLmVuZm9yZXN0QmxvY2soKX0pO1xuICB9XG4gIGVuZm9yZXN0QmxvY2soKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmxvY2tcIiwge3N0YXRlbWVudHM6IHRoaXMubWF0Y2hDdXJsaWVzKCl9KTtcbiAgfVxuICBlbmZvcmVzdENsYXNzKHtpc0V4cHIsIGluRGVmYXVsdH0pIHtcbiAgICBsZXQga3dfMTIxID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IG5hbWVfMTIyID0gbnVsbCwgc3Vwcl8xMjMgPSBudWxsO1xuICAgIGxldCB0eXBlXzEyNCA9IGlzRXhwciA/IFwiQ2xhc3NFeHByZXNzaW9uXCIgOiBcIkNsYXNzRGVjbGFyYXRpb25cIjtcbiAgICBpZiAodGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEyMiA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIH0gZWxzZSBpZiAoIWlzRXhwcikge1xuICAgICAgaWYgKGluRGVmYXVsdCkge1xuICAgICAgICBuYW1lXzEyMiA9IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IFN5bnRheC5mcm9tSWRlbnRpZmllcihcIl9kZWZhdWx0XCIsIGt3XzEyMSl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IodGhpcy5wZWVrKCksIFwidW5leHBlY3RlZCBzeW50YXhcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmlzS2V5d29yZCh0aGlzLnBlZWsoKSwgXCJleHRlbmRzXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN1cHJfMTIzID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgfVxuICAgIGxldCBlbGVtZW50c18xMjUgPSBbXTtcbiAgICBsZXQgZW5mXzEyNiA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMubWF0Y2hDdXJsaWVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB3aGlsZSAoZW5mXzEyNi5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGlmIChlbmZfMTI2LmlzUHVuY3R1YXRvcihlbmZfMTI2LnBlZWsoKSwgXCI7XCIpKSB7XG4gICAgICAgIGVuZl8xMjYuYWR2YW5jZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI2LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiaWRlbnRpZmllclwiICYmIG1ldGhvZE9yS2V5LnZhbHVlLnZhbCgpID09PSBcInN0YXRpY1wiKSB7XG4gICAgICAgIGlzU3RhdGljID0gdHJ1ZTtcbiAgICAgICAgKHttZXRob2RPcktleSwga2luZH0gPSBlbmZfMTI2LmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIGlmIChraW5kID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICAgIGVsZW1lbnRzXzEyNS5wdXNoKG5ldyBUZXJtKFwiQ2xhc3NFbGVtZW50XCIsIHtpc1N0YXRpYzogaXNTdGF0aWMsIG1ldGhvZDogbWV0aG9kT3JLZXl9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGVuZl8xMjYucGVlaygpLCBcIk9ubHkgbWV0aG9kcyBhcmUgYWxsb3dlZCBpbiBjbGFzc2VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8xMjQsIHtuYW1lOiBuYW1lXzEyMiwgc3VwZXI6IHN1cHJfMTIzLCBlbGVtZW50czogTGlzdChlbGVtZW50c18xMjUpfSk7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KHthbGxvd1B1bmN0dWF0b3J9ID0ge30pIHtcbiAgICBsZXQgbG9va2FoZWFkXzEyNyA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTI3KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTI3KSB8fCBhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzEyNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoe2FsbG93UHVuY3R1YXRvcjogYWxsb3dQdW5jdHVhdG9yfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzEyNykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QXJyYXlCaW5kaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzQnJhY2VzKGxvb2thaGVhZF8xMjcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdE9iamVjdEJpbmRpbmcoKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gIH1cbiAgZW5mb3Jlc3RPYmplY3RCaW5kaW5nKCkge1xuICAgIGxldCBlbmZfMTI4ID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaEN1cmxpZXMoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBwcm9wZXJ0aWVzXzEyOSA9IFtdO1xuICAgIHdoaWxlIChlbmZfMTI4LnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgcHJvcGVydGllc18xMjkucHVzaChlbmZfMTI4LmVuZm9yZXN0QmluZGluZ1Byb3BlcnR5KCkpO1xuICAgICAgZW5mXzEyOC5jb25zdW1lQ29tbWEoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogTGlzdChwcm9wZXJ0aWVzXzEyOSl9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdQcm9wZXJ0eSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzMCA9IHRoaXMucGVlaygpO1xuICAgIGxldCB7bmFtZSwgYmluZGluZ30gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xMzApIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzAsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xMzAsIFwieWllbGRcIikpIHtcbiAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgbGV0IGV4cHIgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBleHByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IGJpbmRpbmcsIGluaXQ6IGRlZmF1bHRWYWx1ZX0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgYmluZGluZyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtuYW1lOiBuYW1lLCBiaW5kaW5nOiBiaW5kaW5nfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJheUJpbmRpbmcoKSB7XG4gICAgbGV0IGJyYWNrZXRfMTMxID0gdGhpcy5tYXRjaFNxdWFyZXMoKTtcbiAgICBsZXQgZW5mXzEzMiA9IG5ldyBFbmZvcmVzdGVyXzQ2KGJyYWNrZXRfMTMxLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGVsZW1lbnRzXzEzMyA9IFtdLCByZXN0RWxlbWVudF8xMzQgPSBudWxsO1xuICAgIHdoaWxlIChlbmZfMTMyLnJlc3Quc2l6ZSAhPT0gMCkge1xuICAgICAgbGV0IGVsO1xuICAgICAgaWYgKGVuZl8xMzIuaXNQdW5jdHVhdG9yKGVuZl8xMzIucGVlaygpLCBcIixcIikpIHtcbiAgICAgICAgZW5mXzEzMi5jb25zdW1lQ29tbWEoKTtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVuZl8xMzIuaXNQdW5jdHVhdG9yKGVuZl8xMzIucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICAgIGVuZl8xMzIuYWR2YW5jZSgpO1xuICAgICAgICAgIHJlc3RFbGVtZW50XzEzNCA9IGVuZl8xMzIuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBlbmZfMTMyLmVuZm9yZXN0QmluZGluZ0VsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbmZfMTMyLmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgICAgZWxlbWVudHNfMTMzLnB1c2goZWwpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzEzMyksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudF8xMzR9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmRpbmdFbGVtZW50KCkge1xuICAgIGxldCBiaW5kaW5nXzEzNSA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nVGFyZ2V0KCk7XG4gICAgaWYgKHRoaXMuaXNBc3NpZ24odGhpcy5wZWVrKCkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBpbml0ID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICBiaW5kaW5nXzEzNSA9IG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiBiaW5kaW5nXzEzNSwgaW5pdDogaW5pdH0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZ18xMzU7XG4gIH1cbiAgZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcih7YWxsb3dQdW5jdHVhdG9yfSA9IHt9KSB7XG4gICAgbGV0IG5hbWVfMTM2O1xuICAgIGlmIChhbGxvd1B1bmN0dWF0b3IgJiYgdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCkpKSB7XG4gICAgICBuYW1lXzEzNiA9IHRoaXMuZW5mb3Jlc3RQdW5jdHVhdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVfMTM2ID0gdGhpcy5lbmZvcmVzdElkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTM2fSk7XG4gIH1cbiAgZW5mb3Jlc3RQdW5jdHVhdG9yKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTM3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xMzcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzEzNywgXCJleHBlY3RpbmcgYSBwdW5jdHVhdG9yXCIpO1xuICB9XG4gIGVuZm9yZXN0SWRlbnRpZmllcigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzEzOCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTM4KSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTM4KSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aHJvdyB0aGlzLmNyZWF0ZUVycm9yKGxvb2thaGVhZF8xMzgsIFwiZXhwZWN0aW5nIGFuIGlkZW50aWZpZXJcIik7XG4gIH1cbiAgZW5mb3Jlc3RSZXR1cm5TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IGt3XzEzOSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMTQwID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMucmVzdC5zaXplID09PSAwIHx8IGxvb2thaGVhZF8xNDAgJiYgIXRoaXMubGluZU51bWJlckVxKGt3XzEzOSwgbG9va2FoZWFkXzE0MCkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIlJldHVyblN0YXRlbWVudFwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH1cbiAgICBsZXQgdGVybV8xNDEgPSBudWxsO1xuICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE0MCwgXCI7XCIpKSB7XG4gICAgICB0ZXJtXzE0MSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBleHBlY3QodGVybV8xNDEgIT0gbnVsbCwgXCJFeHBlY3RpbmcgYW4gZXhwcmVzc2lvbiB0byBmb2xsb3cgcmV0dXJuIGtleXdvcmRcIiwgbG9va2FoZWFkXzE0MCwgdGhpcy5yZXN0KTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lU2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiUmV0dXJuU3RhdGVtZW50XCIsIHtleHByZXNzaW9uOiB0ZXJtXzE0MX0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdGlvbigpIHtcbiAgICBsZXQga2luZF8xNDI7XG4gICAgbGV0IGxvb2thaGVhZF8xNDMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQga2luZFN5bl8xNDQgPSBsb29rYWhlYWRfMTQzO1xuICAgIGxldCBwaGFzZV8xNDUgPSB0aGlzLmNvbnRleHQucGhhc2U7XG4gICAgaWYgKGtpbmRTeW5fMTQ0ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ0LnJlc29sdmUocGhhc2VfMTQ1KSkgPT09IFZhcmlhYmxlRGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDIgPSBcInZhclwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDQgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDQucmVzb2x2ZShwaGFzZV8xNDUpKSA9PT0gTGV0RGVjbFRyYW5zZm9ybSkge1xuICAgICAga2luZF8xNDIgPSBcImxldFwiO1xuICAgIH0gZWxzZSBpZiAoa2luZFN5bl8xNDQgJiYgdGhpcy5jb250ZXh0LmVudi5nZXQoa2luZFN5bl8xNDQucmVzb2x2ZShwaGFzZV8xNDUpKSA9PT0gQ29uc3REZWNsVHJhbnNmb3JtKSB7XG4gICAgICBraW5kXzE0MiA9IFwiY29uc3RcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ0ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ0LnJlc29sdmUocGhhc2VfMTQ1KSkgPT09IFN5bnRheERlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQyID0gXCJzeW50YXhcIjtcbiAgICB9IGVsc2UgaWYgKGtpbmRTeW5fMTQ0ICYmIHRoaXMuY29udGV4dC5lbnYuZ2V0KGtpbmRTeW5fMTQ0LnJlc29sdmUocGhhc2VfMTQ1KSkgPT09IFN5bnRheHJlY0RlY2xUcmFuc2Zvcm0pIHtcbiAgICAgIGtpbmRfMTQyID0gXCJzeW50YXhyZWNcIjtcbiAgICB9XG4gICAgbGV0IGRlY2xzXzE0NiA9IExpc3QoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheDoga2luZF8xNDIgPT09IFwic3ludGF4XCIgfHwga2luZF8xNDIgPT09IFwic3ludGF4cmVjXCJ9KTtcbiAgICAgIGxldCBsb29rYWhlYWRfMTQzID0gdGhpcy5wZWVrKCk7XG4gICAgICBkZWNsc18xNDYgPSBkZWNsc18xNDYuY29uY2F0KHRlcm0pO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDMsIFwiLFwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBraW5kXzE0MiwgZGVjbGFyYXRvcnM6IGRlY2xzXzE0Nn0pO1xuICB9XG4gIGVuZm9yZXN0VmFyaWFibGVEZWNsYXJhdG9yKHtpc1N5bnRheH0pIHtcbiAgICBsZXQgaWRfMTQ3ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdUYXJnZXQoe2FsbG93UHVuY3R1YXRvcjogaXNTeW50YXh9KTtcbiAgICBsZXQgbG9va2FoZWFkXzE0OCA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpbml0XzE0OSwgcmVzdF8xNTA7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNDgsIFwiPVwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBpbml0XzE0OSA9IGVuZi5lbmZvcmVzdChcImV4cHJlc3Npb25cIik7XG4gICAgICB0aGlzLnJlc3QgPSBlbmYucmVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdF8xNDkgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IGlkXzE0NywgaW5pdDogaW5pdF8xNDl9KTtcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25TdGF0ZW1lbnQoKSB7XG4gICAgbGV0IHN0YXJ0XzE1MSA9IHRoaXMucmVzdC5nZXQoMCk7XG4gICAgbGV0IGV4cHJfMTUyID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb24oKTtcbiAgICBpZiAoZXhwcl8xNTIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3Ioc3RhcnRfMTUxLCBcIm5vdCBhIHZhbGlkIGV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZVNlbWljb2xvbigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiwge2V4cHJlc3Npb246IGV4cHJfMTUyfSk7XG4gIH1cbiAgZW5mb3Jlc3RFeHByZXNzaW9uKCkge1xuICAgIGxldCBsZWZ0XzE1MyA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgIGxldCBsb29rYWhlYWRfMTU0ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8xNTQsIFwiLFwiKSkge1xuICAgICAgd2hpbGUgKHRoaXMucmVzdC5zaXplICE9PSAwKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiLFwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvciA9IHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgbGVmdF8xNTMgPSBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IGxlZnRfMTUzLCBvcGVyYXRvcjogb3BlcmF0b3IsIHJpZ2h0OiByaWdodH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRlcm0gPSBudWxsO1xuICAgIHJldHVybiBsZWZ0XzE1MztcbiAgfVxuICBlbmZvcmVzdEV4cHJlc3Npb25Mb29wKCkge1xuICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgdGhpcy5vcEN0eCA9IHtwcmVjOiAwLCBjb21iaW5lOiB4XzE1NSA9PiB4XzE1NSwgc3RhY2s6IExpc3QoKX07XG4gICAgZG8ge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLmVuZm9yZXN0QXNzaWdubWVudEV4cHJlc3Npb24oKTtcbiAgICAgIGlmICh0ZXJtID09PSBFWFBSX0xPT1BfTk9fQ0hBTkdFXzQ0ICYmIHRoaXMub3BDdHguc3RhY2suc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5vcEN0eC5jb21iaW5lKHRoaXMudGVybSk7XG4gICAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgICAgdGhpcy5vcEN0eC5jb21iaW5lID0gY29tYmluZTtcbiAgICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9OT19DSEFOR0VfNDQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKHRlcm0gPT09IEVYUFJfTE9PUF9PUEVSQVRPUl80MyB8fCB0ZXJtID09PSBFWFBSX0xPT1BfRVhQQU5TSU9OXzQ1KSB7XG4gICAgICAgIHRoaXMudGVybSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRlcm0gPSB0ZXJtO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKHRydWUpO1xuICAgIHJldHVybiB0aGlzLnRlcm07XG4gIH1cbiAgZW5mb3Jlc3RBc3NpZ25tZW50RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE1NiA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc0NvbXBpbGV0aW1lVHJhbnNmb3JtKGxvb2thaGVhZF8xNTYpKSB7XG4gICAgICB0aGlzLmV4cGFuZE1hY3JvKCk7XG4gICAgICBsb29rYWhlYWRfMTU2ID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1Rlcm0obG9va2FoZWFkXzE1NikpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU2LCBcInlpZWxkXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTYsIFwiY2xhc3NcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0Q2xhc3Moe2lzRXhwcjogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTU2KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTYpKSAmJiB0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoMSksIFwiPT5cIikgJiYgdGhpcy5saW5lTnVtYmVyRXEobG9va2FoZWFkXzE1NiwgdGhpcy5wZWVrKDEpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4VGVtcGxhdGUobG9va2FoZWFkXzE1NikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4VGVtcGxhdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3ludGF4UXVvdGVUcmFuc2Zvcm0obG9va2FoZWFkXzE1NikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0U3ludGF4UXVvdGUoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTYpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm0oXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiLCB7aW5uZXI6IHRoaXMuYWR2YW5jZSgpLmlubmVyKCl9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1NiwgXCJ0aGlzXCIpIHx8IHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTYsIFwibGV0XCIpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTYsIFwieWllbGRcIikgfHwgdGhpcy5pc051bWVyaWNMaXRlcmFsKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTU2KSB8fCB0aGlzLmlzQm9vbGVhbkxpdGVyYWwobG9va2FoZWFkXzE1NikgfHwgdGhpcy5pc051bGxMaXRlcmFsKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTU2KSB8fCB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1NikgfHwgdGhpcy5pc0JyYWNrZXRzKGxvb2thaGVhZF8xNTYpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RQcmltYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNPcGVyYXRvcihsb29rYWhlYWRfMTU2KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RVbmFyeUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzVmFyQmluZGluZ1RyYW5zZm9ybShsb29rYWhlYWRfMTU2KSkge1xuICAgICAgbGV0IGlkID0gdGhpcy5nZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudChsb29rYWhlYWRfMTU2KS5pZDtcbiAgICAgIGlmIChpZCAhPT0gbG9va2FoZWFkXzE1Nikge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdGhpcy5yZXN0ID0gTGlzdC5vZihpZCkuY29uY2F0KHRoaXMucmVzdCk7XG4gICAgICAgIHJldHVybiBFWFBSX0xPT1BfRVhQQU5TSU9OXzQ1O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmICh0aGlzLmlzTmV3VHJhbnNmb3JtKGxvb2thaGVhZF8xNTYpIHx8IHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8xNTYsIFwic3VwZXJcIikpIHx8IHRoaXMudGVybSAmJiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NiwgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpIHx8IHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU2KSB8fCB0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTYpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RMZWZ0SGFuZFNpZGVFeHByZXNzaW9uKHthbGxvd0NhbGw6IHRydWV9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzE1NikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1VwZGF0ZU9wZXJhdG9yKGxvb2thaGVhZF8xNTYpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFVwZGF0ZUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSAmJiB0aGlzLmlzT3BlcmF0b3IobG9va2FoZWFkXzE1NikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0QmluYXJ5RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtICYmIHRoaXMuaXNBc3NpZ24obG9va2FoZWFkXzE1NikpIHtcbiAgICAgIGxldCBiaW5kaW5nID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSk7XG4gICAgICBsZXQgb3AgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBpbml0ID0gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIHRoaXMucmVzdCA9IGVuZi5yZXN0O1xuICAgICAgaWYgKG9wLnZhbCgpID09PSBcIj1cIikge1xuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgZXhwcmVzc2lvbjogaW5pdH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQ29tcG91bmRBc3NpZ25tZW50RXhwcmVzc2lvblwiLCB7YmluZGluZzogYmluZGluZywgb3BlcmF0b3I6IG9wLnZhbCgpLCBleHByZXNzaW9uOiBpbml0fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gJiYgdGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1NiwgXCI/XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdENvbmRpdGlvbmFsRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gRVhQUl9MT09QX05PX0NIQU5HRV80NDtcbiAgfVxuICBlbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCkge1xuICAgIGxldCBsb29rYWhlYWRfMTU3ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU3LCBcInRoaXNcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0VGhpc0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE1NykgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1NywgXCJsZXRcIikgfHwgdGhpcy5pc0tleXdvcmQobG9va2FoZWFkXzE1NywgXCJ5aWVsZFwiKSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0SWRlbnRpZmllckV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0TnVtZXJpY0xpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RTdHJpbmdMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRlcm0gPT09IG51bGwgJiYgdGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCb29sZWFuTGl0ZXJhbChsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RCb29sZWFuTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3ROdWxsTGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNSZWd1bGFyRXhwcmVzc2lvbihsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RSZWd1bGFyRXhwcmVzc2lvbkxpdGVyYWwoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGVybSA9PT0gbnVsbCAmJiB0aGlzLmlzRm5EZWNsVHJhbnNmb3JtKGxvb2thaGVhZF8xNTcpKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEZ1bmN0aW9uRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1NykpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZm9yZXN0T2JqZWN0RXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICBpZiAodGhpcy50ZXJtID09PSBudWxsICYmIHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU3KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5mb3Jlc3RBcnJheUV4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIk5vdCBhIHByaW1hcnkgZXhwcmVzc2lvblwiKTtcbiAgfVxuICBlbmZvcmVzdExlZnRIYW5kU2lkZUV4cHJlc3Npb24oe2FsbG93Q2FsbH0pIHtcbiAgICBsZXQgbG9va2FoZWFkXzE1OCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTU4LCBcInN1cGVyXCIpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiU3VwZXJcIiwge30pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc05ld1RyYW5zZm9ybShsb29rYWhlYWRfMTU4KSkge1xuICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdE5ld0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxvb2thaGVhZF8xNTggPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUGFyZW5zKGxvb2thaGVhZF8xNTgpKSB7XG4gICAgICAgIGlmICghYWxsb3dDYWxsKSB7XG4gICAgICAgICAgaWYgKHRoaXMudGVybSAmJiBpc0lkZW50aWZpZXJFeHByZXNzaW9uKHRoaXMudGVybSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRlcm07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RDYWxsRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTU4KSkge1xuICAgICAgICB0aGlzLnRlcm0gPSBhbGxvd0NhbGwgPyB0aGlzLmVuZm9yZXN0Q29tcHV0ZWRNZW1iZXJFeHByZXNzaW9uKCkgOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE1OCwgXCIuXCIpICYmICh0aGlzLmlzSWRlbnRpZmllcih0aGlzLnBlZWsoMSkpIHx8IHRoaXMuaXNLZXl3b3JkKHRoaXMucGVlaygxKSkpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IHRoaXMuZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNUZW1wbGF0ZShsb29rYWhlYWRfMTU4KSkge1xuICAgICAgICB0aGlzLnRlcm0gPSB0aGlzLmVuZm9yZXN0VGVtcGxhdGVMaXRlcmFsKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzE1OCkpIHtcbiAgICAgICAgdGhpcy50ZXJtID0gdGhpcy5lbmZvcmVzdFByaW1hcnlFeHByZXNzaW9uKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNJZGVudGlmaWVyKGxvb2thaGVhZF8xNTgpKSB7XG4gICAgICAgIHRoaXMudGVybSA9IG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IHRoaXMuZW5mb3Jlc3RJZGVudGlmaWVyKCl9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXJtO1xuICB9XG4gIGVuZm9yZXN0Qm9vbGVhbkxpdGVyYWwoKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogdGhpcy5hZHZhbmNlKCl9KTtcbiAgfVxuICBlbmZvcmVzdFRlbXBsYXRlTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJUZW1wbGF0ZUV4cHJlc3Npb25cIiwge3RhZzogdGhpcy50ZXJtLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pO1xuICB9XG4gIGVuZm9yZXN0U3RyaW5nTGl0ZXJhbCgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3ROdW1lcmljTGl0ZXJhbCgpIHtcbiAgICBsZXQgbnVtXzE1OSA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChudW1fMTU5LnZhbCgpID09PSAxIC8gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEluZmluaXR5RXhwcmVzc2lvblwiLCB7fSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiLCB7dmFsdWU6IG51bV8xNTl9KTtcbiAgfVxuICBlbmZvcmVzdElkZW50aWZpZXJFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiB0aGlzLmFkdmFuY2UoKX0pO1xuICB9XG4gIGVuZm9yZXN0UmVndWxhckV4cHJlc3Npb25MaXRlcmFsKCkge1xuICAgIGxldCByZVN0eF8xNjAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgbGFzdFNsYXNoXzE2MSA9IHJlU3R4XzE2MC50b2tlbi52YWx1ZS5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgbGV0IHBhdHRlcm5fMTYyID0gcmVTdHhfMTYwLnRva2VuLnZhbHVlLnNsaWNlKDEsIGxhc3RTbGFzaF8xNjEpO1xuICAgIGxldCBmbGFnc18xNjMgPSByZVN0eF8xNjAudG9rZW4udmFsdWUuc2xpY2UobGFzdFNsYXNoXzE2MSArIDEpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxSZWdFeHBFeHByZXNzaW9uXCIsIHtwYXR0ZXJuOiBwYXR0ZXJuXzE2MiwgZmxhZ3M6IGZsYWdzXzE2M30pO1xuICB9XG4gIGVuZm9yZXN0TnVsbExpdGVyYWwoKSB7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bGxFeHByZXNzaW9uXCIsIHt9KTtcbiAgfVxuICBlbmZvcmVzdFRoaXNFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlRoaXNFeHByZXNzaW9uXCIsIHtzdHg6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcmd1bWVudExpc3QoKSB7XG4gICAgbGV0IHJlc3VsdF8xNjQgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgYXJnO1xuICAgICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi4uLlwiKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgYXJnID0gbmV3IFRlcm0oXCJTcHJlYWRFbGVtZW50XCIsIHtleHByZXNzaW9uOiB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJnID0gdGhpcy5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yZXN0LnNpemUgPiAwKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLFwiKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdF8xNjQucHVzaChhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdChyZXN1bHRfMTY0KTtcbiAgfVxuICBlbmZvcmVzdE5ld0V4cHJlc3Npb24oKSB7XG4gICAgdGhpcy5tYXRjaEtleXdvcmQoXCJuZXdcIik7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKHRoaXMucGVlaygpLCBcIi5cIikgJiYgdGhpcy5pc0lkZW50aWZpZXIodGhpcy5wZWVrKDEpLCBcInRhcmdldFwiKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIk5ld1RhcmdldEV4cHJlc3Npb25cIiwge30pO1xuICAgIH1cbiAgICBsZXQgY2FsbGVlXzE2NSA9IHRoaXMuZW5mb3Jlc3RMZWZ0SGFuZFNpZGVFeHByZXNzaW9uKHthbGxvd0NhbGw6IGZhbHNlfSk7XG4gICAgbGV0IGFyZ3NfMTY2O1xuICAgIGlmICh0aGlzLmlzUGFyZW5zKHRoaXMucGVlaygpKSkge1xuICAgICAgYXJnc18xNjYgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3NfMTY2ID0gTGlzdCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJOZXdFeHByZXNzaW9uXCIsIHtjYWxsZWU6IGNhbGxlZV8xNjUsIGFyZ3VtZW50czogYXJnc18xNjZ9KTtcbiAgfVxuICBlbmZvcmVzdENvbXB1dGVkTWVtYmVyRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgZW5mXzE2NyA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogdGhpcy50ZXJtLCBleHByZXNzaW9uOiBlbmZfMTY3LmVuZm9yZXN0RXhwcmVzc2lvbigpfSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE2OCkge1xuICAgIHN3aXRjaCAodGVybV8xNjgudHlwZSkge1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OC5uYW1lfSk7XG4gICAgICBjYXNlIFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKHRlcm1fMTY4LmlubmVyLnNpemUgPT09IDEgJiYgdGhpcy5pc0lkZW50aWZpZXIodGVybV8xNjguaW5uZXIuZ2V0KDApKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OC5pbm5lci5nZXQoMCl9KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkRhdGFQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7bmFtZTogdGVybV8xNjgubmFtZSwgYmluZGluZzogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nV2l0aERlZmF1bHQodGVybV8xNjguZXhwcmVzc2lvbil9KTtcbiAgICAgIGNhc2UgXCJTaG9ydGhhbmRQcm9wZXJ0eVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiB0ZXJtXzE2OC5uYW1lfSksIGluaXQ6IG51bGx9KTtcbiAgICAgIGNhc2UgXCJPYmplY3RFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHRlcm1fMTY4LnByb3BlcnRpZXMubWFwKHRfMTY5ID0+IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE2OSkpfSk7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIGxldCBsYXN0ID0gdGVybV8xNjguZWxlbWVudHMubGFzdCgpO1xuICAgICAgICBpZiAobGFzdCAhPSBudWxsICYmIGxhc3QudHlwZSA9PT0gXCJTcHJlYWRFbGVtZW50XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiB0ZXJtXzE2OC5lbGVtZW50cy5zbGljZSgwLCAtMSkubWFwKHRfMTcwID0+IHRfMTcwICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTcwKSksIHJlc3RFbGVtZW50OiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmdXaXRoRGVmYXVsdChsYXN0LmV4cHJlc3Npb24pfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjguZWxlbWVudHMubWFwKHRfMTcxID0+IHRfMTcxICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRfMTcxKSksIHJlc3RFbGVtZW50OiBudWxsfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogdGVybV8xNjguZWxlbWVudHMubWFwKHRfMTcyID0+IHRfMTcyICYmIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0XzE3MikpLCByZXN0RWxlbWVudDogbnVsbH0pO1xuICAgICAgY2FzZSBcIlN0YXRpY1Byb3BlcnR5TmFtZVwiOlxuICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogdGVybV8xNjgudmFsdWV9KTtcbiAgICAgIGNhc2UgXCJDb21wdXRlZE1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgIGNhc2UgXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCI6XG4gICAgICBjYXNlIFwiQXJyYXlCaW5kaW5nXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ0lkZW50aWZpZXJcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCI6XG4gICAgICBjYXNlIFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIjpcbiAgICAgIGNhc2UgXCJCaW5kaW5nV2l0aERlZmF1bHRcIjpcbiAgICAgIGNhc2UgXCJPYmplY3RCaW5kaW5nXCI6XG4gICAgICAgIHJldHVybiB0ZXJtXzE2ODtcbiAgICB9XG4gICAgYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yIFwiICsgdGVybV8xNjgudHlwZSk7XG4gIH1cbiAgdHJhbnNmb3JtRGVzdHJ1Y3R1cmluZ1dpdGhEZWZhdWx0KHRlcm1fMTczKSB7XG4gICAgc3dpdGNoICh0ZXJtXzE3My50eXBlKSB7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ1dpdGhEZWZhdWx0XCIsIHtiaW5kaW5nOiB0aGlzLnRyYW5zZm9ybURlc3RydWN0dXJpbmcodGVybV8xNzMuYmluZGluZyksIGluaXQ6IHRlcm1fMTczLmV4cHJlc3Npb259KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyh0ZXJtXzE3Myk7XG4gIH1cbiAgZW5mb3Jlc3RDYWxsRXhwcmVzc2lvbigpIHtcbiAgICBsZXQgcGFyZW5fMTc0ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQ2FsbEV4cHJlc3Npb25cIiwge2NhbGxlZTogdGhpcy50ZXJtLCBhcmd1bWVudHM6IHBhcmVuXzE3NC5pbm5lcigpfSk7XG4gIH1cbiAgZW5mb3Jlc3RBcnJvd0V4cHJlc3Npb24oKSB7XG4gICAgbGV0IGVuZl8xNzU7XG4gICAgaWYgKHRoaXMuaXNJZGVudGlmaWVyKHRoaXMucGVlaygpKSkge1xuICAgICAgZW5mXzE3NSA9IG5ldyBFbmZvcmVzdGVyXzQ2KExpc3Qub2YodGhpcy5hZHZhbmNlKCkpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwID0gdGhpcy5tYXRjaFBhcmVucygpO1xuICAgICAgZW5mXzE3NSA9IG5ldyBFbmZvcmVzdGVyXzQ2KHAsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICB9XG4gICAgbGV0IHBhcmFtc18xNzYgPSBlbmZfMTc1LmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiPT5cIik7XG4gICAgbGV0IGJvZHlfMTc3O1xuICAgIGlmICh0aGlzLmlzQnJhY2VzKHRoaXMucGVlaygpKSkge1xuICAgICAgYm9keV8xNzcgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmZfMTc1ID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5yZXN0LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBib2R5XzE3NyA9IGVuZl8xNzUuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgdGhpcy5yZXN0ID0gZW5mXzE3NS5yZXN0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJvd0V4cHJlc3Npb25cIiwge3BhcmFtczogcGFyYW1zXzE3NiwgYm9keTogYm9keV8xNzd9KTtcbiAgfVxuICBlbmZvcmVzdFlpZWxkRXhwcmVzc2lvbigpIHtcbiAgICBsZXQga3dkXzE3OCA9IHRoaXMubWF0Y2hLZXl3b3JkKFwieWllbGRcIik7XG4gICAgbGV0IGxvb2thaGVhZF8xNzkgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5yZXN0LnNpemUgPT09IDAgfHwgbG9va2FoZWFkXzE3OSAmJiAhdGhpcy5saW5lTnVtYmVyRXEoa3dkXzE3OCwgbG9va2FoZWFkXzE3OSkpIHtcbiAgICAgIHJldHVybiBuZXcgVGVybShcIllpZWxkRXhwcmVzc2lvblwiLCB7ZXhwcmVzc2lvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaXNHZW5lcmF0b3IgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcih0aGlzLnBlZWsoKSwgXCIqXCIpKSB7XG4gICAgICAgIGlzR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgICBsZXQgZXhwciA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uKCk7XG4gICAgICBsZXQgdHlwZSA9IGlzR2VuZXJhdG9yID8gXCJZaWVsZEdlbmVyYXRvckV4cHJlc3Npb25cIiA6IFwiWWllbGRFeHByZXNzaW9uXCI7XG4gICAgICByZXR1cm4gbmV3IFRlcm0odHlwZSwge2V4cHJlc3Npb246IGV4cHJ9KTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhUZW1wbGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhUZW1wbGF0ZVwiLCB7dGVtcGxhdGU6IHRoaXMuYWR2YW5jZSgpfSk7XG4gIH1cbiAgZW5mb3Jlc3RTeW50YXhRdW90ZSgpIHtcbiAgICBsZXQgbmFtZV8xODAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTeW50YXhRdW90ZVwiLCB7bmFtZTogbmFtZV8xODAsIHRlbXBsYXRlOiBuZXcgVGVybShcIlRlbXBsYXRlRXhwcmVzc2lvblwiLCB7dGFnOiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBuYW1lXzE4MH0pLCBlbGVtZW50czogdGhpcy5lbmZvcmVzdFRlbXBsYXRlRWxlbWVudHMoKX0pfSk7XG4gIH1cbiAgZW5mb3Jlc3RTdGF0aWNNZW1iZXJFeHByZXNzaW9uKCkge1xuICAgIGxldCBvYmplY3RfMTgxID0gdGhpcy50ZXJtO1xuICAgIGxldCBkb3RfMTgyID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IHByb3BlcnR5XzE4MyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogb2JqZWN0XzE4MSwgcHJvcGVydHk6IHByb3BlcnR5XzE4M30pO1xuICB9XG4gIGVuZm9yZXN0QXJyYXlFeHByZXNzaW9uKCkge1xuICAgIGxldCBhcnJfMTg0ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzE4NSA9IFtdO1xuICAgIGxldCBlbmZfMTg2ID0gbmV3IEVuZm9yZXN0ZXJfNDYoYXJyXzE4NC5pbm5lcigpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgd2hpbGUgKGVuZl8xODYucmVzdC5zaXplID4gMCkge1xuICAgICAgbGV0IGxvb2thaGVhZCA9IGVuZl8xODYucGVlaygpO1xuICAgICAgaWYgKGVuZl8xODYuaXNQdW5jdHVhdG9yKGxvb2thaGVhZCwgXCIsXCIpKSB7XG4gICAgICAgIGVuZl8xODYuYWR2YW5jZSgpO1xuICAgICAgICBlbGVtZW50c18xODUucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5mXzE4Ni5pc1B1bmN0dWF0b3IobG9va2FoZWFkLCBcIi4uLlwiKSkge1xuICAgICAgICBlbmZfMTg2LmFkdmFuY2UoKTtcbiAgICAgICAgbGV0IGV4cHJlc3Npb24gPSBlbmZfMTg2LmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVuZl8xODYuY3JlYXRlRXJyb3IobG9va2FoZWFkLCBcImV4cGVjdGluZyBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE4NS5wdXNoKG5ldyBUZXJtKFwiU3ByZWFkRWxlbWVudFwiLCB7ZXhwcmVzc2lvbjogZXhwcmVzc2lvbn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0ZXJtID0gZW5mXzE4Ni5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgICAgIGlmICh0ZXJtID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlbmZfMTg2LmNyZWF0ZUVycm9yKGxvb2thaGVhZCwgXCJleHBlY3RlZCBleHByZXNzaW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRzXzE4NS5wdXNoKHRlcm0pO1xuICAgICAgICBlbmZfMTg2LmNvbnN1bWVDb21tYSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUV4cHJlc3Npb25cIiwge2VsZW1lbnRzOiBMaXN0KGVsZW1lbnRzXzE4NSl9KTtcbiAgfVxuICBlbmZvcmVzdE9iamVjdEV4cHJlc3Npb24oKSB7XG4gICAgbGV0IG9ial8xODcgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBsZXQgcHJvcGVydGllc18xODggPSBMaXN0KCk7XG4gICAgbGV0IGVuZl8xODkgPSBuZXcgRW5mb3Jlc3Rlcl80NihvYmpfMTg3LmlubmVyKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgbGFzdFByb3BfMTkwID0gbnVsbDtcbiAgICB3aGlsZSAoZW5mXzE4OS5yZXN0LnNpemUgPiAwKSB7XG4gICAgICBsZXQgcHJvcCA9IGVuZl8xODkuZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKTtcbiAgICAgIGVuZl8xODkuY29uc3VtZUNvbW1hKCk7XG4gICAgICBwcm9wZXJ0aWVzXzE4OCA9IHByb3BlcnRpZXNfMTg4LmNvbmNhdChwcm9wKTtcbiAgICAgIGlmIChsYXN0UHJvcF8xOTAgPT09IHByb3ApIHtcbiAgICAgICAgdGhyb3cgZW5mXzE4OS5jcmVhdGVFcnJvcihwcm9wLCBcImludmFsaWQgc3ludGF4IGluIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICAgIGxhc3RQcm9wXzE5MCA9IHByb3A7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXNfMTg4fSk7XG4gIH1cbiAgZW5mb3Jlc3RQcm9wZXJ0eURlZmluaXRpb24oKSB7XG4gICAgbGV0IHttZXRob2RPcktleSwga2luZH0gPSB0aGlzLmVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBcIm1ldGhvZFwiOlxuICAgICAgICByZXR1cm4gbWV0aG9kT3JLZXk7XG4gICAgICBjYXNlIFwiaWRlbnRpZmllclwiOlxuICAgICAgICBpZiAodGhpcy5pc0Fzc2lnbih0aGlzLnBlZWsoKSkpIHtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICBsZXQgaW5pdCA9IHRoaXMuZW5mb3Jlc3RFeHByZXNzaW9uTG9vcCgpO1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2luaXQ6IGluaXQsIGJpbmRpbmc6IHRoaXMudHJhbnNmb3JtRGVzdHJ1Y3R1cmluZyhtZXRob2RPcktleSl9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1B1bmN0dWF0b3IodGhpcy5wZWVrKCksIFwiOlwiKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlNob3J0aGFuZFByb3BlcnR5XCIsIHtuYW1lOiBtZXRob2RPcktleS52YWx1ZX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiOlwiKTtcbiAgICBsZXQgZXhwcl8xOTEgPSB0aGlzLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJEYXRhUHJvcGVydHlcIiwge25hbWU6IG1ldGhvZE9yS2V5LCBleHByZXNzaW9uOiBleHByXzE5MX0pO1xuICB9XG4gIGVuZm9yZXN0TWV0aG9kRGVmaW5pdGlvbigpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE5MiA9IHRoaXMucGVlaygpO1xuICAgIGxldCBpc0dlbmVyYXRvcl8xOTMgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzE5MiwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8xOTMgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTkyLCBcImdldFwiKSAmJiB0aGlzLmlzUHJvcGVydHlOYW1lKHRoaXMucGVlaygxKSkpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICAgIGxldCBib2R5ID0gdGhpcy5tYXRjaEN1cmxpZXMoKTtcbiAgICAgIHJldHVybiB7bWV0aG9kT3JLZXk6IG5ldyBUZXJtKFwiR2V0dGVyXCIsIHtuYW1lOiBuYW1lLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5pc0lkZW50aWZpZXIobG9va2FoZWFkXzE5MiwgXCJzZXRcIikgJiYgdGhpcy5pc1Byb3BlcnR5TmFtZSh0aGlzLnBlZWsoMSkpKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGxldCB7bmFtZX0gPSB0aGlzLmVuZm9yZXN0UHJvcGVydHlOYW1lKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDYodGhpcy5tYXRjaFBhcmVucygpLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgcGFyYW0gPSBlbmYuZW5mb3Jlc3RCaW5kaW5nRWxlbWVudCgpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJTZXR0ZXJcIiwge25hbWU6IG5hbWUsIHBhcmFtOiBwYXJhbSwgYm9keTogYm9keX0pLCBraW5kOiBcIm1ldGhvZFwifTtcbiAgICB9XG4gICAgbGV0IHtuYW1lfSA9IHRoaXMuZW5mb3Jlc3RQcm9wZXJ0eU5hbWUoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyh0aGlzLnBlZWsoKSkpIHtcbiAgICAgIGxldCBwYXJhbXMgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgICBsZXQgZW5mID0gbmV3IEVuZm9yZXN0ZXJfNDYocGFyYW1zLCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgICBsZXQgZm9ybWFsUGFyYW1zID0gZW5mLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgICAgbGV0IGJvZHkgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgICAgcmV0dXJuIHttZXRob2RPcktleTogbmV3IFRlcm0oXCJNZXRob2RcIiwge2lzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8xOTMsIG5hbWU6IG5hbWUsIHBhcmFtczogZm9ybWFsUGFyYW1zLCBib2R5OiBib2R5fSksIGtpbmQ6IFwibWV0aG9kXCJ9O1xuICAgIH1cbiAgICByZXR1cm4ge21ldGhvZE9yS2V5OiBuYW1lLCBraW5kOiB0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMTkyKSB8fCB0aGlzLmlzS2V5d29yZChsb29rYWhlYWRfMTkyKSA/IFwiaWRlbnRpZmllclwiIDogXCJwcm9wZXJ0eVwifTtcbiAgfVxuICBlbmZvcmVzdFByb3BlcnR5TmFtZSgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzE5NCA9IHRoaXMucGVlaygpO1xuICAgIGlmICh0aGlzLmlzU3RyaW5nTGl0ZXJhbChsb29rYWhlYWRfMTk0KSB8fCB0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzE5NCkpIHtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJTdGF0aWNQcm9wZXJ0eU5hbWVcIiwge3ZhbHVlOiB0aGlzLmFkdmFuY2UoKX0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNCcmFja2V0cyhsb29rYWhlYWRfMTk0KSkge1xuICAgICAgbGV0IGVuZiA9IG5ldyBFbmZvcmVzdGVyXzQ2KHRoaXMubWF0Y2hTcXVhcmVzKCksIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIGxldCBleHByID0gZW5mLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICAgIHJldHVybiB7bmFtZTogbmV3IFRlcm0oXCJDb21wdXRlZFByb3BlcnR5TmFtZVwiLCB7ZXhwcmVzc2lvbjogZXhwcn0pLCBiaW5kaW5nOiBudWxsfTtcbiAgICB9XG4gICAgbGV0IG5hbWVfMTk1ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgcmV0dXJuIHtuYW1lOiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5hbWVfMTk1fSksIGJpbmRpbmc6IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWVfMTk1fSl9O1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb24oe2lzRXhwciwgaW5EZWZhdWx0LCBhbGxvd0dlbmVyYXRvcn0pIHtcbiAgICBsZXQgbmFtZV8xOTYgPSBudWxsLCBwYXJhbXNfMTk3LCBib2R5XzE5OCwgcmVzdF8xOTk7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzIwMCA9IGZhbHNlO1xuICAgIGxldCBmbktleXdvcmRfMjAxID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMDIgPSB0aGlzLnBlZWsoKTtcbiAgICBsZXQgdHlwZV8yMDMgPSBpc0V4cHIgPyBcIkZ1bmN0aW9uRXhwcmVzc2lvblwiIDogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCI7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMDIsIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMjAwID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgbG9va2FoZWFkXzIwMiA9IHRoaXMucGVlaygpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNQYXJlbnMobG9va2FoZWFkXzIwMikpIHtcbiAgICAgIG5hbWVfMTk2ID0gdGhpcy5lbmZvcmVzdEJpbmRpbmdJZGVudGlmaWVyKCk7XG4gICAgfSBlbHNlIGlmIChpbkRlZmF1bHQpIHtcbiAgICAgIG5hbWVfMTk2ID0gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogU3ludGF4LmZyb21JZGVudGlmaWVyKFwiKmRlZmF1bHQqXCIsIGZuS2V5d29yZF8yMDEpfSk7XG4gICAgfVxuICAgIHBhcmFtc18xOTcgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8xOTggPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMjA0ID0gbmV3IEVuZm9yZXN0ZXJfNDYocGFyYW1zXzE5NywgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMjA1ID0gZW5mXzIwNC5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0odHlwZV8yMDMsIHtuYW1lOiBuYW1lXzE5NiwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIwMCwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjA1LCBib2R5OiBib2R5XzE5OH0pO1xuICB9XG4gIGVuZm9yZXN0RnVuY3Rpb25FeHByZXNzaW9uKCkge1xuICAgIGxldCBuYW1lXzIwNiA9IG51bGwsIHBhcmFtc18yMDcsIGJvZHlfMjA4LCByZXN0XzIwOTtcbiAgICBsZXQgaXNHZW5lcmF0b3JfMjEwID0gZmFsc2U7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgbGV0IGxvb2thaGVhZF8yMTEgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzIxMSwgXCIqXCIpKSB7XG4gICAgICBpc0dlbmVyYXRvcl8yMTAgPSB0cnVlO1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsb29rYWhlYWRfMjExID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMjExKSkge1xuICAgICAgbmFtZV8yMDYgPSB0aGlzLmVuZm9yZXN0QmluZGluZ0lkZW50aWZpZXIoKTtcbiAgICB9XG4gICAgcGFyYW1zXzIwNyA9IHRoaXMubWF0Y2hQYXJlbnMoKTtcbiAgICBib2R5XzIwOCA9IHRoaXMubWF0Y2hDdXJsaWVzKCk7XG4gICAgbGV0IGVuZl8yMTIgPSBuZXcgRW5mb3Jlc3Rlcl80NihwYXJhbXNfMjA3LCBMaXN0KCksIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IGZvcm1hbFBhcmFtc18yMTMgPSBlbmZfMjEyLmVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpO1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uRXhwcmVzc2lvblwiLCB7bmFtZTogbmFtZV8yMDYsIGlzR2VuZXJhdG9yOiBpc0dlbmVyYXRvcl8yMTAsIHBhcmFtczogZm9ybWFsUGFyYW1zXzIxMywgYm9keTogYm9keV8yMDh9KTtcbiAgfVxuICBlbmZvcmVzdEZ1bmN0aW9uRGVjbGFyYXRpb24oKSB7XG4gICAgbGV0IG5hbWVfMjE0LCBwYXJhbXNfMjE1LCBib2R5XzIxNiwgcmVzdF8yMTc7XG4gICAgbGV0IGlzR2VuZXJhdG9yXzIxOCA9IGZhbHNlO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGxldCBsb29rYWhlYWRfMjE5ID0gdGhpcy5wZWVrKCk7XG4gICAgaWYgKHRoaXMuaXNQdW5jdHVhdG9yKGxvb2thaGVhZF8yMTksIFwiKlwiKSkge1xuICAgICAgaXNHZW5lcmF0b3JfMjE4ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICBuYW1lXzIxNCA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgIHBhcmFtc18yMTUgPSB0aGlzLm1hdGNoUGFyZW5zKCk7XG4gICAgYm9keV8yMTYgPSB0aGlzLm1hdGNoQ3VybGllcygpO1xuICAgIGxldCBlbmZfMjIwID0gbmV3IEVuZm9yZXN0ZXJfNDYocGFyYW1zXzIxNSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBmb3JtYWxQYXJhbXNfMjIxID0gZW5mXzIyMC5lbmZvcmVzdEZvcm1hbFBhcmFtZXRlcnMoKTtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsIHtuYW1lOiBuYW1lXzIxNCwgaXNHZW5lcmF0b3I6IGlzR2VuZXJhdG9yXzIxOCwgcGFyYW1zOiBmb3JtYWxQYXJhbXNfMjIxLCBib2R5OiBib2R5XzIxNn0pO1xuICB9XG4gIGVuZm9yZXN0Rm9ybWFsUGFyYW1ldGVycygpIHtcbiAgICBsZXQgaXRlbXNfMjIyID0gW107XG4gICAgbGV0IHJlc3RfMjIzID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5yZXN0LnNpemUgIT09IDApIHtcbiAgICAgIGxldCBsb29rYWhlYWQgPSB0aGlzLnBlZWsoKTtcbiAgICAgIGlmICh0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWQsIFwiLi4uXCIpKSB7XG4gICAgICAgIHRoaXMubWF0Y2hQdW5jdHVhdG9yKFwiLi4uXCIpO1xuICAgICAgICByZXN0XzIyMyA9IHRoaXMuZW5mb3Jlc3RCaW5kaW5nSWRlbnRpZmllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGl0ZW1zXzIyMi5wdXNoKHRoaXMuZW5mb3Jlc3RQYXJhbSgpKTtcbiAgICAgIHRoaXMuY29uc3VtZUNvbW1hKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkZvcm1hbFBhcmFtZXRlcnNcIiwge2l0ZW1zOiBMaXN0KGl0ZW1zXzIyMiksIHJlc3Q6IHJlc3RfMjIzfSk7XG4gIH1cbiAgZW5mb3Jlc3RQYXJhbSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmZvcmVzdEJpbmRpbmdFbGVtZW50KCk7XG4gIH1cbiAgZW5mb3Jlc3RVcGRhdGVFeHByZXNzaW9uKCkge1xuICAgIGxldCBvcGVyYXRvcl8yMjQgPSB0aGlzLm1hdGNoVW5hcnlPcGVyYXRvcigpO1xuICAgIHJldHVybiBuZXcgVGVybShcIlVwZGF0ZUV4cHJlc3Npb25cIiwge2lzUHJlZml4OiBmYWxzZSwgb3BlcmF0b3I6IG9wZXJhdG9yXzIyNC52YWwoKSwgb3BlcmFuZDogdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHRoaXMudGVybSl9KTtcbiAgfVxuICBlbmZvcmVzdFVuYXJ5RXhwcmVzc2lvbigpIHtcbiAgICBsZXQgb3BlcmF0b3JfMjI1ID0gdGhpcy5tYXRjaFVuYXJ5T3BlcmF0b3IoKTtcbiAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wdXNoKHtwcmVjOiB0aGlzLm9wQ3R4LnByZWMsIGNvbWJpbmU6IHRoaXMub3BDdHguY29tYmluZX0pO1xuICAgIHRoaXMub3BDdHgucHJlYyA9IDE0O1xuICAgIHRoaXMub3BDdHguY29tYmluZSA9IHJpZ2h0VGVybV8yMjYgPT4ge1xuICAgICAgbGV0IHR5cGVfMjI3LCB0ZXJtXzIyOCwgaXNQcmVmaXhfMjI5O1xuICAgICAgaWYgKG9wZXJhdG9yXzIyNS52YWwoKSA9PT0gXCIrK1wiIHx8IG9wZXJhdG9yXzIyNS52YWwoKSA9PT0gXCItLVwiKSB7XG4gICAgICAgIHR5cGVfMjI3ID0gXCJVcGRhdGVFeHByZXNzaW9uXCI7XG4gICAgICAgIHRlcm1fMjI4ID0gdGhpcy50cmFuc2Zvcm1EZXN0cnVjdHVyaW5nKHJpZ2h0VGVybV8yMjYpO1xuICAgICAgICBpc1ByZWZpeF8yMjkgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZV8yMjcgPSBcIlVuYXJ5RXhwcmVzc2lvblwiO1xuICAgICAgICBpc1ByZWZpeF8yMjkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRlcm1fMjI4ID0gcmlnaHRUZXJtXzIyNjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybSh0eXBlXzIyNywge29wZXJhdG9yOiBvcGVyYXRvcl8yMjUudmFsKCksIG9wZXJhbmQ6IHRlcm1fMjI4LCBpc1ByZWZpeDogaXNQcmVmaXhfMjI5fSk7XG4gICAgfTtcbiAgICByZXR1cm4gRVhQUl9MT09QX09QRVJBVE9SXzQzO1xuICB9XG4gIGVuZm9yZXN0Q29uZGl0aW9uYWxFeHByZXNzaW9uKCkge1xuICAgIGxldCB0ZXN0XzIzMCA9IHRoaXMub3BDdHguY29tYmluZSh0aGlzLnRlcm0pO1xuICAgIGlmICh0aGlzLm9wQ3R4LnN0YWNrLnNpemUgPiAwKSB7XG4gICAgICBsZXQge3ByZWMsIGNvbWJpbmV9ID0gdGhpcy5vcEN0eC5zdGFjay5sYXN0KCk7XG4gICAgICB0aGlzLm9wQ3R4LnN0YWNrID0gdGhpcy5vcEN0eC5zdGFjay5wb3AoKTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IHByZWM7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSBjb21iaW5lO1xuICAgIH1cbiAgICB0aGlzLm1hdGNoUHVuY3R1YXRvcihcIj9cIik7XG4gICAgbGV0IGVuZl8yMzEgPSBuZXcgRW5mb3Jlc3Rlcl80Nih0aGlzLnJlc3QsIExpc3QoKSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgY29uc2VxdWVudF8yMzIgPSBlbmZfMjMxLmVuZm9yZXN0RXhwcmVzc2lvbkxvb3AoKTtcbiAgICBlbmZfMjMxLm1hdGNoUHVuY3R1YXRvcihcIjpcIik7XG4gICAgZW5mXzIzMSA9IG5ldyBFbmZvcmVzdGVyXzQ2KGVuZl8yMzEucmVzdCwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBhbHRlcm5hdGVfMjMzID0gZW5mXzIzMS5lbmZvcmVzdEV4cHJlc3Npb25Mb29wKCk7XG4gICAgdGhpcy5yZXN0ID0gZW5mXzIzMS5yZXN0O1xuICAgIHJldHVybiBuZXcgVGVybShcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLCB7dGVzdDogdGVzdF8yMzAsIGNvbnNlcXVlbnQ6IGNvbnNlcXVlbnRfMjMyLCBhbHRlcm5hdGU6IGFsdGVybmF0ZV8yMzN9KTtcbiAgfVxuICBlbmZvcmVzdEJpbmFyeUV4cHJlc3Npb24oKSB7XG4gICAgbGV0IGxlZnRUZXJtXzIzNCA9IHRoaXMudGVybTtcbiAgICBsZXQgb3BTdHhfMjM1ID0gdGhpcy5wZWVrKCk7XG4gICAgbGV0IG9wXzIzNiA9IG9wU3R4XzIzNS52YWwoKTtcbiAgICBsZXQgb3BQcmVjXzIzNyA9IGdldE9wZXJhdG9yUHJlYyhvcF8yMzYpO1xuICAgIGxldCBvcEFzc29jXzIzOCA9IGdldE9wZXJhdG9yQXNzb2Mob3BfMjM2KTtcbiAgICBpZiAob3BlcmF0b3JMdCh0aGlzLm9wQ3R4LnByZWMsIG9wUHJlY18yMzcsIG9wQXNzb2NfMjM4KSkge1xuICAgICAgdGhpcy5vcEN0eC5zdGFjayA9IHRoaXMub3BDdHguc3RhY2sucHVzaCh7cHJlYzogdGhpcy5vcEN0eC5wcmVjLCBjb21iaW5lOiB0aGlzLm9wQ3R4LmNvbWJpbmV9KTtcbiAgICAgIHRoaXMub3BDdHgucHJlYyA9IG9wUHJlY18yMzc7XG4gICAgICB0aGlzLm9wQ3R4LmNvbWJpbmUgPSByaWdodFRlcm1fMjM5ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogbGVmdFRlcm1fMjM0LCBvcGVyYXRvcjogb3BTdHhfMjM1LCByaWdodDogcmlnaHRUZXJtXzIzOX0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIEVYUFJfTE9PUF9PUEVSQVRPUl80MztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHRlcm0gPSB0aGlzLm9wQ3R4LmNvbWJpbmUobGVmdFRlcm1fMjM0KTtcbiAgICAgIGxldCB7cHJlYywgY29tYmluZX0gPSB0aGlzLm9wQ3R4LnN0YWNrLmxhc3QoKTtcbiAgICAgIHRoaXMub3BDdHguc3RhY2sgPSB0aGlzLm9wQ3R4LnN0YWNrLnBvcCgpO1xuICAgICAgdGhpcy5vcEN0eC5wcmVjID0gcHJlYztcbiAgICAgIHRoaXMub3BDdHguY29tYmluZSA9IGNvbWJpbmU7XG4gICAgICByZXR1cm4gdGVybTtcbiAgICB9XG4gIH1cbiAgZW5mb3Jlc3RUZW1wbGF0ZUVsZW1lbnRzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMjQwID0gdGhpcy5tYXRjaFRlbXBsYXRlKCk7XG4gICAgbGV0IGVsZW1lbnRzXzI0MSA9IGxvb2thaGVhZF8yNDAudG9rZW4uaXRlbXMubWFwKGl0XzI0MiA9PiB7XG4gICAgICBpZiAodGhpcy5pc0RlbGltaXRlcihpdF8yNDIpKSB7XG4gICAgICAgIGxldCBlbmYgPSBuZXcgRW5mb3Jlc3Rlcl80NihpdF8yNDIuaW5uZXIoKSwgTGlzdCgpLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gZW5mLmVuZm9yZXN0KFwiZXhwcmVzc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVGVybShcIlRlbXBsYXRlRWxlbWVudFwiLCB7cmF3VmFsdWU6IGl0XzI0Mi5zbGljZS50ZXh0fSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGVsZW1lbnRzXzI0MTtcbiAgfVxuICBleHBhbmRNYWNybygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzI0MyA9IHRoaXMucGVlaygpO1xuICAgIHdoaWxlICh0aGlzLmlzQ29tcGlsZXRpbWVUcmFuc2Zvcm0obG9va2FoZWFkXzI0MykpIHtcbiAgICAgIGxldCBuYW1lID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgICBsZXQgc3ludGF4VHJhbnNmb3JtID0gdGhpcy5nZXRGcm9tQ29tcGlsZXRpbWVFbnZpcm9ubWVudChuYW1lKTtcbiAgICAgIGlmIChzeW50YXhUcmFuc2Zvcm0gPT0gbnVsbCB8fCB0eXBlb2Ygc3ludGF4VHJhbnNmb3JtLnZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihuYW1lLCBcInRoZSBtYWNybyBuYW1lIHdhcyBub3QgYm91bmQgdG8gYSB2YWx1ZSB0aGF0IGNvdWxkIGJlIGludm9rZWRcIik7XG4gICAgICB9XG4gICAgICBsZXQgdXNlU2l0ZVNjb3BlID0gZnJlc2hTY29wZShcInVcIik7XG4gICAgICBsZXQgaW50cm9kdWNlZFNjb3BlID0gZnJlc2hTY29wZShcImlcIik7XG4gICAgICB0aGlzLmNvbnRleHQudXNlU2NvcGUgPSB1c2VTaXRlU2NvcGU7XG4gICAgICBsZXQgY3R4ID0gbmV3IE1hY3JvQ29udGV4dCh0aGlzLCBuYW1lLCB0aGlzLmNvbnRleHQsIHVzZVNpdGVTY29wZSwgaW50cm9kdWNlZFNjb3BlKTtcbiAgICAgIGxldCByZXN1bHQgPSBzYW5pdGl6ZVJlcGxhY2VtZW50VmFsdWVzKHN5bnRheFRyYW5zZm9ybS52YWx1ZS5jYWxsKG51bGwsIGN0eCkpO1xuICAgICAgaWYgKCFMaXN0LmlzTGlzdChyZXN1bHQpKSB7XG4gICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSwgXCJtYWNybyBtdXN0IHJldHVybiBhIGxpc3QgYnV0IGdvdDogXCIgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChzdHhfMjQ0ID0+IHtcbiAgICAgICAgaWYgKCEoc3R4XzI0NCAmJiB0eXBlb2Ygc3R4XzI0NC5hZGRTY29wZSA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobmFtZSwgXCJtYWNybyBtdXN0IHJldHVybiBzeW50YXggb2JqZWN0cyBvciB0ZXJtcyBidXQgZ290OiBcIiArIHN0eF8yNDQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHhfMjQ0LmFkZFNjb3BlKGludHJvZHVjZWRTY29wZSwgdGhpcy5jb250ZXh0LmJpbmRpbmdzLCBBTExfUEhBU0VTLCB7ZmxpcDogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlc3QgPSByZXN1bHQuY29uY2F0KGN0eC5fcmVzdCh0aGlzKSk7XG4gICAgICBsb29rYWhlYWRfMjQzID0gdGhpcy5wZWVrKCk7XG4gICAgfVxuICB9XG4gIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDUgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NSAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ1LCBcIjtcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBjb25zdW1lQ29tbWEoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8yNDYgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAobG9va2FoZWFkXzI0NiAmJiB0aGlzLmlzUHVuY3R1YXRvcihsb29rYWhlYWRfMjQ2LCBcIixcIikpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuICBzYWZlQ2hlY2sob2JqXzI0NywgdHlwZV8yNDgsIHZhbF8yNDkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG9ial8yNDcgJiYgKHR5cGVvZiBvYmpfMjQ3Lm1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBvYmpfMjQ3Lm1hdGNoKHR5cGVfMjQ4LCB2YWxfMjQ5KSA6IGZhbHNlKTtcbiAgfVxuICBpc1Rlcm0odGVybV8yNTApIHtcbiAgICByZXR1cm4gdGVybV8yNTAgJiYgdGVybV8yNTAgaW5zdGFuY2VvZiBUZXJtO1xuICB9XG4gIGlzRU9GKG9ial8yNTEpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI1MSwgXCJlb2ZcIik7XG4gIH1cbiAgaXNJZGVudGlmaWVyKG9ial8yNTIsIHZhbF8yNTMgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNTIsIFwiaWRlbnRpZmllclwiLCB2YWxfMjUzKTtcbiAgfVxuICBpc1Byb3BlcnR5TmFtZShvYmpfMjU0KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGlmaWVyKG9ial8yNTQpIHx8IHRoaXMuaXNLZXl3b3JkKG9ial8yNTQpIHx8IHRoaXMuaXNOdW1lcmljTGl0ZXJhbChvYmpfMjU0KSB8fCB0aGlzLmlzU3RyaW5nTGl0ZXJhbChvYmpfMjU0KSB8fCB0aGlzLmlzQnJhY2tldHMob2JqXzI1NCk7XG4gIH1cbiAgaXNOdW1lcmljTGl0ZXJhbChvYmpfMjU1LCB2YWxfMjU2ID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjU1LCBcIm51bWJlclwiLCB2YWxfMjU2KTtcbiAgfVxuICBpc1N0cmluZ0xpdGVyYWwob2JqXzI1NywgdmFsXzI1OCA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI1NywgXCJzdHJpbmdcIiwgdmFsXzI1OCk7XG4gIH1cbiAgaXNUZW1wbGF0ZShvYmpfMjU5LCB2YWxfMjYwID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjU5LCBcInRlbXBsYXRlXCIsIHZhbF8yNjApO1xuICB9XG4gIGlzU3ludGF4VGVtcGxhdGUob2JqXzI2MSkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjYxLCBcInN5bnRheFRlbXBsYXRlXCIpO1xuICB9XG4gIGlzQm9vbGVhbkxpdGVyYWwob2JqXzI2MiwgdmFsXzI2MyA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI2MiwgXCJib29sZWFuXCIsIHZhbF8yNjMpO1xuICB9XG4gIGlzTnVsbExpdGVyYWwob2JqXzI2NCwgdmFsXzI2NSA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI2NCwgXCJudWxsXCIsIHZhbF8yNjUpO1xuICB9XG4gIGlzUmVndWxhckV4cHJlc3Npb24ob2JqXzI2NiwgdmFsXzI2NyA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI2NiwgXCJyZWd1bGFyRXhwcmVzc2lvblwiLCB2YWxfMjY3KTtcbiAgfVxuICBpc0RlbGltaXRlcihvYmpfMjY4KSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZUNoZWNrKG9ial8yNjgsIFwiZGVsaW1pdGVyXCIpO1xuICB9XG4gIGlzUGFyZW5zKG9ial8yNjkpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI2OSwgXCJwYXJlbnNcIik7XG4gIH1cbiAgaXNCcmFjZXMob2JqXzI3MCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjcwLCBcImJyYWNlc1wiKTtcbiAgfVxuICBpc0JyYWNrZXRzKG9ial8yNzEpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI3MSwgXCJicmFja2V0c1wiKTtcbiAgfVxuICBpc0Fzc2lnbihvYmpfMjcyLCB2YWxfMjczID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjcyLCBcImFzc2lnblwiLCB2YWxfMjczKTtcbiAgfVxuICBpc0tleXdvcmQob2JqXzI3NCwgdmFsXzI3NSA9IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI3NCwgXCJrZXl3b3JkXCIsIHZhbF8yNzUpO1xuICB9XG4gIGlzUHVuY3R1YXRvcihvYmpfMjc2LCB2YWxfMjc3ID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLnNhZmVDaGVjayhvYmpfMjc2LCBcInB1bmN0dWF0b3JcIiwgdmFsXzI3Nyk7XG4gIH1cbiAgaXNPcGVyYXRvcihvYmpfMjc4KSB7XG4gICAgcmV0dXJuICh0aGlzLnNhZmVDaGVjayhvYmpfMjc4LCBcInB1bmN0dWF0b3JcIikgfHwgdGhpcy5zYWZlQ2hlY2sob2JqXzI3OCwgXCJpZGVudGlmaWVyXCIpIHx8IHRoaXMuc2FmZUNoZWNrKG9ial8yNzgsIFwia2V5d29yZFwiKSkgJiYgaXNPcGVyYXRvcihvYmpfMjc4KTtcbiAgfVxuICBpc1VwZGF0ZU9wZXJhdG9yKG9ial8yNzkpIHtcbiAgICByZXR1cm4gdGhpcy5zYWZlQ2hlY2sob2JqXzI3OSwgXCJwdW5jdHVhdG9yXCIsIFwiKytcIikgfHwgdGhpcy5zYWZlQ2hlY2sob2JqXzI3OSwgXCJwdW5jdHVhdG9yXCIsIFwiLS1cIik7XG4gIH1cbiAgc2FmZVJlc29sdmUob2JqXzI4MCwgcGhhc2VfMjgxKSB7XG4gICAgcmV0dXJuIG9ial8yODAgJiYgdHlwZW9mIG9ial8yODAucmVzb2x2ZSA9PT0gXCJmdW5jdGlvblwiID8gSnVzdF80MShvYmpfMjgwLnJlc29sdmUocGhhc2VfMjgxKSkgOiBOb3RoaW5nXzQyKCk7XG4gIH1cbiAgaXNUcmFuc2Zvcm0ob2JqXzI4MiwgdHJhbnNfMjgzKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FmZVJlc29sdmUob2JqXzI4MiwgdGhpcy5jb250ZXh0LnBoYXNlKS5tYXAobmFtZV8yODQgPT4gdGhpcy5jb250ZXh0LmVudi5nZXQobmFtZV8yODQpID09PSB0cmFuc18yODMgfHwgdGhpcy5jb250ZXh0LnN0b3JlLmdldChuYW1lXzI4NCkgPT09IHRyYW5zXzI4MykuZ2V0T3JFbHNlKGZhbHNlKTtcbiAgfVxuICBpc1RyYW5zZm9ybUluc3RhbmNlKG9ial8yODUsIHRyYW5zXzI4Nikge1xuICAgIHJldHVybiB0aGlzLnNhZmVSZXNvbHZlKG9ial8yODUsIHRoaXMuY29udGV4dC5waGFzZSkubWFwKG5hbWVfMjg3ID0+IHRoaXMuY29udGV4dC5lbnYuZ2V0KG5hbWVfMjg3KSBpbnN0YW5jZW9mIHRyYW5zXzI4NiB8fCB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KG5hbWVfMjg3KSBpbnN0YW5jZW9mIHRyYW5zXzI4NikuZ2V0T3JFbHNlKGZhbHNlKTtcbiAgfVxuICBpc0ZuRGVjbFRyYW5zZm9ybShvYmpfMjg4KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI4OCwgRnVuY3Rpb25EZWNsVHJhbnNmb3JtKTtcbiAgfVxuICBpc1ZhckRlY2xUcmFuc2Zvcm0ob2JqXzI4OSkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yODksIFZhcmlhYmxlRGVjbFRyYW5zZm9ybSk7XG4gIH1cbiAgaXNMZXREZWNsVHJhbnNmb3JtKG9ial8yOTApIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjkwLCBMZXREZWNsVHJhbnNmb3JtKTtcbiAgfVxuICBpc0NvbnN0RGVjbFRyYW5zZm9ybShvYmpfMjkxKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5MSwgQ29uc3REZWNsVHJhbnNmb3JtKTtcbiAgfVxuICBpc1N5bnRheERlY2xUcmFuc2Zvcm0ob2JqXzI5Mikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yOTIsIFN5bnRheERlY2xUcmFuc2Zvcm0pO1xuICB9XG4gIGlzU3ludGF4cmVjRGVjbFRyYW5zZm9ybShvYmpfMjkzKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5MywgU3ludGF4cmVjRGVjbFRyYW5zZm9ybSk7XG4gIH1cbiAgaXNTeW50YXhRdW90ZVRyYW5zZm9ybShvYmpfMjk0KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5NCwgU3ludGF4UXVvdGVUcmFuc2Zvcm0pO1xuICB9XG4gIGlzUmV0dXJuU3RtdFRyYW5zZm9ybShvYmpfMjk1KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5NSwgUmV0dXJuU3RhdGVtZW50VHJhbnNmb3JtKTtcbiAgfVxuICBpc1doaWxlVHJhbnNmb3JtKG9ial8yOTYpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMjk2LCBXaGlsZVRyYW5zZm9ybSk7XG4gIH1cbiAgaXNGb3JUcmFuc2Zvcm0ob2JqXzI5Nykge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yOTcsIEZvclRyYW5zZm9ybSk7XG4gIH1cbiAgaXNTd2l0Y2hUcmFuc2Zvcm0ob2JqXzI5OCkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8yOTgsIFN3aXRjaFRyYW5zZm9ybSk7XG4gIH1cbiAgaXNCcmVha1RyYW5zZm9ybShvYmpfMjk5KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzI5OSwgQnJlYWtUcmFuc2Zvcm0pO1xuICB9XG4gIGlzQ29udGludWVUcmFuc2Zvcm0ob2JqXzMwMCkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8zMDAsIENvbnRpbnVlVHJhbnNmb3JtKTtcbiAgfVxuICBpc0RvVHJhbnNmb3JtKG9ial8zMDEpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybShvYmpfMzAxLCBEb1RyYW5zZm9ybSk7XG4gIH1cbiAgaXNEZWJ1Z2dlclRyYW5zZm9ybShvYmpfMzAyKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwMiwgRGVidWdnZXJUcmFuc2Zvcm0pO1xuICB9XG4gIGlzV2l0aFRyYW5zZm9ybShvYmpfMzAzKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwMywgV2l0aFRyYW5zZm9ybSk7XG4gIH1cbiAgaXNUcnlUcmFuc2Zvcm0ob2JqXzMwNCkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8zMDQsIFRyeVRyYW5zZm9ybSk7XG4gIH1cbiAgaXNUaHJvd1RyYW5zZm9ybShvYmpfMzA1KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwNSwgVGhyb3dUcmFuc2Zvcm0pO1xuICB9XG4gIGlzSWZUcmFuc2Zvcm0ob2JqXzMwNikge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtKG9ial8zMDYsIElmVHJhbnNmb3JtKTtcbiAgfVxuICBpc05ld1RyYW5zZm9ybShvYmpfMzA3KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNUcmFuc2Zvcm0ob2JqXzMwNywgTmV3VHJhbnNmb3JtKTtcbiAgfVxuICBpc0NvbXBpbGV0aW1lVHJhbnNmb3JtKG9ial8zMDgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RyYW5zZm9ybUluc3RhbmNlKG9ial8zMDgsIENvbXBpbGV0aW1lVHJhbnNmb3JtKTtcbiAgfVxuICBpc1ZhckJpbmRpbmdUcmFuc2Zvcm0ob2JqXzMwOSkge1xuICAgIHJldHVybiB0aGlzLmlzVHJhbnNmb3JtSW5zdGFuY2Uob2JqXzMwOSwgVmFyQmluZGluZ1RyYW5zZm9ybSk7XG4gIH1cbiAgZ2V0RnJvbUNvbXBpbGV0aW1lRW52aXJvbm1lbnQodGVybV8zMTApIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LmVudi5oYXModGVybV8zMTAucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5lbnYuZ2V0KHRlcm1fMzEwLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuZ2V0KHRlcm1fMzEwLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKSk7XG4gIH1cbiAgbGluZU51bWJlckVxKGFfMzExLCBiXzMxMikge1xuICAgIGlmICghKGFfMzExICYmIGJfMzEyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gYV8zMTEubGluZU51bWJlcigpID09PSBiXzMxMi5saW5lTnVtYmVyKCk7XG4gIH1cbiAgbWF0Y2hJZGVudGlmaWVyKHZhbF8zMTMpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMxNCA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzSWRlbnRpZmllcihsb29rYWhlYWRfMzE0KSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMTQ7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMxNCwgXCJleHBlY3RpbmcgYW4gaWRlbnRpZmllclwiKTtcbiAgfVxuICBtYXRjaEtleXdvcmQodmFsXzMxNSkge1xuICAgIGxldCBsb29rYWhlYWRfMzE2ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNLZXl3b3JkKGxvb2thaGVhZF8zMTYsIHZhbF8zMTUpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMxNjtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzE2LCBcImV4cGVjdGluZyBcIiArIHZhbF8zMTUpO1xuICB9XG4gIG1hdGNoTGl0ZXJhbCgpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMxNyA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzTnVtZXJpY0xpdGVyYWwobG9va2FoZWFkXzMxNykgfHwgdGhpcy5pc1N0cmluZ0xpdGVyYWwobG9va2FoZWFkXzMxNykgfHwgdGhpcy5pc0Jvb2xlYW5MaXRlcmFsKGxvb2thaGVhZF8zMTcpIHx8IHRoaXMuaXNOdWxsTGl0ZXJhbChsb29rYWhlYWRfMzE3KSB8fCB0aGlzLmlzVGVtcGxhdGUobG9va2FoZWFkXzMxNykgfHwgdGhpcy5pc1JlZ3VsYXJFeHByZXNzaW9uKGxvb2thaGVhZF8zMTcpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMxNztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzE3LCBcImV4cGVjdGluZyBhIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hTdHJpbmdMaXRlcmFsKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzE4ID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNTdHJpbmdMaXRlcmFsKGxvb2thaGVhZF8zMTgpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMxODtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzE4LCBcImV4cGVjdGluZyBhIHN0cmluZyBsaXRlcmFsXCIpO1xuICB9XG4gIG1hdGNoVGVtcGxhdGUoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMTkgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1RlbXBsYXRlKGxvb2thaGVhZF8zMTkpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMxOTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzE5LCBcImV4cGVjdGluZyBhIHRlbXBsYXRlIGxpdGVyYWxcIik7XG4gIH1cbiAgbWF0Y2hQYXJlbnMoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMjAgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1BhcmVucyhsb29rYWhlYWRfMzIwKSkge1xuICAgICAgcmV0dXJuIGxvb2thaGVhZF8zMjAuaW5uZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzIwLCBcImV4cGVjdGluZyBwYXJlbnNcIik7XG4gIH1cbiAgbWF0Y2hDdXJsaWVzKCkge1xuICAgIGxldCBsb29rYWhlYWRfMzIxID0gdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuaXNCcmFjZXMobG9va2FoZWFkXzMyMSkpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzIxLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMyMSwgXCJleHBlY3RpbmcgY3VybHkgYnJhY2VzXCIpO1xuICB9XG4gIG1hdGNoU3F1YXJlcygpIHtcbiAgICBsZXQgbG9va2FoZWFkXzMyMiA9IHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLmlzQnJhY2tldHMobG9va2FoZWFkXzMyMikpIHtcbiAgICAgIHJldHVybiBsb29rYWhlYWRfMzIyLmlubmVyKCk7XG4gICAgfVxuICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMyMiwgXCJleHBlY3Rpbmcgc3FhdXJlIGJyYWNlc1wiKTtcbiAgfVxuICBtYXRjaFVuYXJ5T3BlcmF0b3IoKSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMjMgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNVbmFyeU9wZXJhdG9yKGxvb2thaGVhZF8zMjMpKSB7XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMyMztcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzIzLCBcImV4cGVjdGluZyBhIHVuYXJ5IG9wZXJhdG9yXCIpO1xuICB9XG4gIG1hdGNoUHVuY3R1YXRvcih2YWxfMzI0KSB7XG4gICAgbGV0IGxvb2thaGVhZF8zMjUgPSB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAodGhpcy5pc1B1bmN0dWF0b3IobG9va2FoZWFkXzMyNSkpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsXzMyNCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAobG9va2FoZWFkXzMyNS52YWwoKSA9PT0gdmFsXzMyNCkge1xuICAgICAgICAgIHJldHVybiBsb29rYWhlYWRfMzI1O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IHRoaXMuY3JlYXRlRXJyb3IobG9va2FoZWFkXzMyNSwgXCJleHBlY3RpbmcgYSBcIiArIHZhbF8zMjQgKyBcIiBwdW5jdHVhdG9yXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9va2FoZWFkXzMyNTtcbiAgICB9XG4gICAgdGhyb3cgdGhpcy5jcmVhdGVFcnJvcihsb29rYWhlYWRfMzI1LCBcImV4cGVjdGluZyBhIHB1bmN0dWF0b3JcIik7XG4gIH1cbiAgY3JlYXRlRXJyb3Ioc3R4XzMyNiwgbWVzc2FnZV8zMjcpIHtcbiAgICBsZXQgY3R4XzMyOCA9IFwiXCI7XG4gICAgbGV0IG9mZmVuZGluZ18zMjkgPSBzdHhfMzI2O1xuICAgIGlmICh0aGlzLnJlc3Quc2l6ZSA+IDApIHtcbiAgICAgIGN0eF8zMjggPSB0aGlzLnJlc3Quc2xpY2UoMCwgMjApLm1hcCh0ZXJtXzMzMCA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzRGVsaW1pdGVyKHRlcm1fMzMwKSkge1xuICAgICAgICAgIHJldHVybiB0ZXJtXzMzMC5pbm5lcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBMaXN0Lm9mKHRlcm1fMzMwKTtcbiAgICAgIH0pLmZsYXR0ZW4oKS5tYXAoc18zMzEgPT4ge1xuICAgICAgICBpZiAoc18zMzEgPT09IG9mZmVuZGluZ18zMjkpIHtcbiAgICAgICAgICByZXR1cm4gXCJfX1wiICsgc18zMzEudmFsKCkgKyBcIl9fXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNfMzMxLnZhbCgpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eF8zMjggPSBvZmZlbmRpbmdfMzI5LnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXJyb3IobWVzc2FnZV8zMjcgKyBcIlxcblwiICsgY3R4XzMyOCk7XG4gIH1cbn1cbmV4cG9ydCB7RW5mb3Jlc3Rlcl80NiBhcyBFbmZvcmVzdGVyfSJdfQ==